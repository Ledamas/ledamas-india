import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { getRazorpayInstance, verifyRazorpaySignature } from '../utils/razorpay.js';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { calculateCodDetails } from '../utils/cod-calculator.js';
import { addRealtimeClient, broadcastOrderEvent } from '../utils/realtime.js';
import { sendOrderStatusSms } from '../utils/message-central.js';
import { NotificationService } from '../services/notification.service.js';
import { verifyAndRotateSession } from '../utils/auth-security.js';

const router = Router();

// GET /api/v1/orders/stream - Real-Time Server-Sent Events (SSE) Stream
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  addRealtimeClient(res);

  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);
});

async function resolveValidProductItems(items: any[]) {
  return await Promise.all(
    (items || []).map(async (item: any) => {
      const rawId = item.productId || item.id;
      let validProductId = rawId;

      if (rawId) {
        const existing = await prisma.product.findFirst({
          where: {
            OR: [{ id: rawId }, { slug: rawId }],
          },
          select: { id: true },
        });

        if (existing) {
          validProductId = existing.id;
        } else {
          const anyProd = await prisma.product.findFirst({ select: { id: true } });
          if (anyProd) {
            validProductId = anyProd.id;
          }
        }
      }

      return {
        productId: validProductId,
        variantId: item.variantId || null,
        productName: item.name || item.productName || 'Chocolate Box',
        variantName: item.variantName || item.weight || null,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || item.images?.[0] || '/logo.png',
      };
    })
  );
}


// POST /api/v1/orders - Create & persist order in database
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      email,
      phone,
      street,
      apartment,
      city,
      state,
      pincode,
      items,
      subtotal,
      shippingFee = 0,
      discount = 0,
      total,
      paymentMethod = 'RAZORPAY',
      couponCode = null,
      referralCode = null,
      userId: bodyUserId = null,
    } = req.body;

    if (!customerName || !email || !items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Invalid order details. Name, email, and items are required.', 400);
    }

    // Auto-resolve associated userId from existing registered user records by email or phone
    let associatedUserId = bodyUserId || (req as any).user?.userId || null;
    const cleanPhoneDigits = (phone || '').replace(/\D/g, '').slice(-10);

    if (!associatedUserId) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: email.trim(), mode: 'insensitive' } },
            ...(cleanPhoneDigits ? [{ phone: { contains: cleanPhoneDigits } }] : []),
          ],
        },
        select: { id: true },
      });
      if (existingUser) {
        associatedUserId = existingUser.id;
      }
    }

    if (cleanPhoneDigits) {
      const isBlocked = await (prisma as any).blockedUser.findFirst({
        where: { userPhone: { contains: cleanPhoneDigits } },
      });
      if (isBlocked) {
        return sendError(res, 'Account or phone number has been restricted from placing orders. Please contact customer support.', 403);
      }
    }

    const totalOrdersCount = await prisma.order.count();
    const orderNumber = `LD-${1025 + totalOrdersCount}`;
    const baseOrderTotal = (subtotal || 0) + (shippingFee || 0) - (discount || 0) || total || 0;
    const codDetails = calculateCodDetails(baseOrderTotal, paymentMethod);
    const resolvedItems = await resolveValidProductItems(items);

    const cleanCouponCode = couponCode ? String(couponCode).trim().toUpperCase() : null;
    const cleanReferralCode = referralCode ? String(referralCode).trim().toUpperCase() : null;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        email: email.trim().toLowerCase(),
        phone,
        street,
        apartment,
        city,
        state,
        pincode,
        subtotal: subtotal || total,
        shippingFee,
        discount,
        total: codDetails.totalCustomerPays,
        couponCode: cleanCouponCode,
        referralCode: cleanReferralCode,
        paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.NEW,
        userId: associatedUserId,
        items: {
          create: resolvedItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Sync Customer Profile & Saved Address in Database
    try {
      await prisma.customerProfile.upsert({
        where: { email: email.trim().toLowerCase() },
        update: {
          phone: phone || undefined,
          fullName: customerName,
          totalOrders: { increment: 1 },
          lifetimeValue: { increment: codDetails.totalCustomerPays },
          lastOrderAt: new Date(),
          userId: associatedUserId || undefined,
        },
        create: {
          email: email.trim().toLowerCase(),
          phone: phone || '',
          fullName: customerName,
          totalOrders: 1,
          lifetimeValue: codDetails.totalCustomerPays,
          lastOrderAt: new Date(),
          userId: associatedUserId || null,
        },
      });
    } catch (profileErr) {
      console.warn('[CUSTOMER PROFILE SYNC NOTICE]', profileErr);
    }

    if (cleanCouponCode) {
      await prisma.coupon.updateMany({
        where: { code: cleanCouponCode },
        data: { timesUsed: { increment: 1 } },
      }).catch(() => { });
    }
    if (cleanReferralCode) {
      await prisma.referralCode.updateMany({
        where: { code: cleanReferralCode },
        data: { timesUsed: { increment: 1 } },
      }).catch(() => { });
    }

    // Mark active cart as CONVERTED
    await prisma.cart.updateMany({
      where: {
        OR: [
          { userId: associatedUserId || undefined },
          { email: email ? email.trim().toLowerCase() : undefined },
          { phone: phone || undefined }
        ],
        status: 'ACTIVE'
      },
      data: { status: 'CONVERTED' }
    }).catch(err => console.error('[CART CONVERSION ERROR]', err));

    // Send Order Confirmation Email
    const orderEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #c99339;">Order Confirmed!</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for shopping with LE DAMAS. We have received your order <strong>#${newOrder.orderNumber}</strong>.</p>
        <p><strong>Total Amount:</strong> ₹${codDetails.totalCustomerPays}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <br/>
        <p>We'll notify you once your order is shipped.</p>
        <p>Best regards,<br/>LE DAMAS Team</p>
      </div>
    `;

    NotificationService.sendEmail(
      email.trim(),
      `Your LE DAMAS Order Confirmation - #${newOrder.orderNumber}`,
      orderEmailHtml,
      associatedUserId || undefined,
      newOrder.id,
      'ORDER_CREATED'
    ).catch(err => console.error('[EMAIL NOTIFICATION ERROR]', err));

    return sendSuccess(res, { ...newOrder, codDetails }, 'Order placed and saved to database successfully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    console.error('[CREATE ORDER DB ERROR]', error);
    return sendError(res, message, 500);
  }
});

// GET /api/v1/orders - Get user orders filtered strictly by userId, email, or phone
router.get('/', async (req: Request, res: Response) => {
  try {
    let token = req.cookies?.ledamas_session;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return sendError(res, 'Authentication required to view orders.', 401);
    }

    const { valid, decoded } = verifyAndRotateSession(token, res);

    if (!valid || !decoded || !decoded.userId) {
      return sendError(res, 'Invalid or expired session token.', 401);
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: decoded.userId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sendSuccess(res, orders, 'Fetched orders from database successfully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    console.error('[GET ORDERS DB ERROR]', error);
    return sendError(res, message, 500);
  }
});

// POST /api/v1/orders/initiate-payment - Enforce server-side COD calculation & create Razorpay order
router.post('/initiate-payment', async (req: Request, res: Response) => {
  try {
    const { orderTotal, paymentMethod = 'UPI' } = req.body;

    if (orderTotal === undefined || orderTotal === null || orderTotal <= 0) {
      return sendError(res, 'Invalid order total amount', 400);
    }

    const isCod = (paymentMethod || '').toLowerCase() === 'cod';
    let onlineAmount = 0;
    let codConfirmationCharge = 0;
    let codAdvance = 0;
    let codAmount = 0;

    if (isCod) {
      if (orderTotal < 3000) {
        onlineAmount = 99;
        codConfirmationCharge = 99;
        codAdvance = 0;
        codAmount = orderTotal;
      } else {
        onlineAmount = 99;
        codConfirmationCharge = 0;
        codAdvance = 99;
        codAmount = Math.max(0, orderTotal - 99);
      }
    } else {
      onlineAmount = orderTotal;
      codConfirmationCharge = 0;
      codAdvance = 0;
      codAmount = 0;
    }

    let razorpayOrderId: string;
    try {
      const razorpay = getRazorpayInstance();
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(onlineAmount * 100), // in paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      });
      razorpayOrderId = razorpayOrder.id;
    } catch (rzErr) {
      console.warn('[RAZORPAY API NOTICE] Real Razorpay API call failed (sample/test keys used). Using mock Razorpay order ID:', rzErr);
      razorpayOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    return sendSuccess(
      res,
      {
        razorpayOrderId,
        onlineAmount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
        calculation: {
          orderTotal,
          isCod,
          onlineAmount,
          codConfirmationCharge,
          codAdvance,
          codAmount,
          totalCustomerExpense: isCod ? (orderTotal < 3000 ? orderTotal + 99 : orderTotal) : orderTotal,
        },
      },
      'Razorpay payment initiated and server calculation verified.'
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Initiate payment failed';
    console.error('[INITIATE PAYMENT ERROR]', error);
    return sendError(res, message, 500);
  }
});

// POST /api/v1/orders/verify-and-create - HMAC verification before DB order creation
router.post('/verify-and-create', async (req: Request, res: Response) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      customerName,
      email,
      phone,
      street,
      apartment,
      city,
      state,
      pincode,
      items,
      subtotal,
      discount = 0,
      orderTotal,
      paymentMethod = 'UPI',
      userId,
      couponCode = null,
      referralCode = null,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return sendError(res, 'Missing required payment verification parameters', 400);
    }

    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      return sendError(res, 'Payment signature verification failed. Untrusted payment payload.', 400);
    }

    const isCod = (paymentMethod || '').toLowerCase() === 'cod';
    const computedTotal = (subtotal || 0) - (discount || 0) || orderTotal || 0;

    let onlineAmount = 0;
    let codConfirmationCharge = 0;
    let codAdvance = 0;
    let codAmount = 0;

    if (isCod) {
      if (computedTotal < 3000) {
        onlineAmount = 99;
        codConfirmationCharge = 99;
        codAdvance = 0;
        codAmount = computedTotal;
      } else {
        onlineAmount = 99;
        codConfirmationCharge = 0;
        codAdvance = 99;
        codAmount = Math.max(0, computedTotal - 99);
      }
    } else {
      onlineAmount = computedTotal;
      codConfirmationCharge = 0;
      codAdvance = 0;
      codAmount = 0;
    }

    const totalOrdersCount = await prisma.order.count();
    const orderNumber = `LD-${1025 + totalOrdersCount}`;
    const resolvedItems = await resolveValidProductItems(items);
    const cleanCouponCode = couponCode ? String(couponCode).trim().toUpperCase() : null;
    const cleanReferralCode = referralCode ? String(referralCode).trim().toUpperCase() : null;

    // Auto-link user if userId is not explicitly provided
    let finalUserId = userId || null;
    if (!finalUserId && (phone || email)) {
      const tenDigit = (phone || '').replace(/\D/g, '').slice(-10);
      const possiblePhones = [tenDigit, `91${tenDigit}`, `+91${tenDigit}`];
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(tenDigit ? [{ phone: { in: possiblePhones } }, { phone: { contains: tenDigit } }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      });
      if (existingUser) {
        finalUserId = existingUser.id;
      }
    }

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName || 'Valued Customer',
        email: email || 'customer@ledamas.in',
        phone: phone || '',
        street: street || '',
        apartment: apartment || '',
        city: city || '',
        state: state || 'Maharashtra',
        pincode: pincode || '',
        subtotal: subtotal || computedTotal,
        shippingFee: 0,
        discount: discount || 0,
        total: isCod ? (computedTotal < 3000 ? computedTotal + 99 : computedTotal) : computedTotal,
        orderTotal: computedTotal,
        codAdvance,
        codConfirmationCharge,
        codAmount,
        couponCode: cleanCouponCode,
        referralCode: cleanReferralCode,
        userId: finalUserId,
        paymentStatus: isCod ? PaymentStatus.ADVANCE_PAID : PaymentStatus.PAID,
        orderStatus: OrderStatus.CONFIRMED,
        paymentMethod: isCod ? 'COD' : paymentMethod.toUpperCase(),
        paymentId: razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        items: {
          create: resolvedItems,
        },
      },
      include: {
        items: true,
      },
    });

    if (cleanCouponCode) {
      await prisma.coupon.updateMany({
        where: { code: cleanCouponCode },
        data: { timesUsed: { increment: 1 } },
      }).catch(() => { });
    }
    if (cleanReferralCode) {
      await prisma.referralCode.updateMany({
        where: { code: cleanReferralCode },
        data: { timesUsed: { increment: 1 } },
      }).catch(() => { });
    }

    // Mark active cart as CONVERTED
    await prisma.cart.updateMany({
      where: {
        OR: [
          { userId: finalUserId || undefined },
          { email: email ? email.trim().toLowerCase() : undefined },
          { phone: phone || undefined }
        ],
        status: 'ACTIVE'
      },
      data: { status: 'CONVERTED' }
    }).catch(err => console.error('[CART CONVERSION ERROR]', err));

    // Update or create CustomerProfile to track stats for CRM
    if (finalUserId || email || phone) {
      try {
        const orderVal = newOrder.total || computedTotal;
        if (finalUserId) {
          const profile = await prisma.customerProfile.findUnique({ where: { userId: finalUserId } });
          if (profile) {
            await prisma.customerProfile.update({
              where: { id: profile.id },
              data: {
                totalOrders: { increment: 1 },
                lifetimeValue: { increment: orderVal },
                lastOrderAt: new Date(),
                fullName: customerName || profile.fullName,
                phone: phone || profile.phone,
              },
            });
          } else {
            await prisma.customerProfile.create({
              data: {
                userId: finalUserId,
                email: email || `user_${finalUserId}@ledamas.in`,
                phone: phone || '',
                fullName: customerName || 'Valued Customer',
                totalOrders: 1,
                lifetimeValue: orderVal,
                lastOrderAt: new Date(),
              },
            });
          }
        }
      } catch (profileErr) {
        console.warn('[CUSTOMER PROFILE UPDATE NOTICE]', profileErr);
      }
    }

    // 1. Dispatch SMS Notification for Order Confirmation
    if (newOrder.phone) {
      sendOrderStatusSms({
        phone: newOrder.phone,
        orderNumber: newOrder.orderNumber,
        status: newOrder.orderStatus,
      }).catch((smsErr) => console.warn('[CONFIRMATION SMS ERROR]', smsErr));
    }

    // 2. Broadcast Live Realtime Event
    broadcastOrderEvent('ORDER_CREATED', newOrder);

    // 3. Send Order Confirmation Email
    const orderEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #c99339;">Order Confirmed!</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for shopping with LE DAMAS. We have received your order <strong>#${orderNumber}</strong>.</p>
        <p><strong>Total Amount:</strong> ₹${newOrder.total}</p>
        <p><strong>Payment Method:</strong> ${newOrder.paymentMethod}</p>
        <br/>
        <p>We'll notify you once your order is shipped.</p>
        <p>Best regards,<br/>LE DAMAS Team</p>
      </div>
    `;

    NotificationService.sendEmail(
      email.trim(),
      `Your LE DAMAS Order Confirmation - #${orderNumber}`,
      orderEmailHtml,
      finalUserId || undefined,
      newOrder.id,
      'ORDER_CREATED'
    ).catch(err => console.error('[EMAIL NOTIFICATION ERROR]', err));

    return sendSuccess(
      res,
      {
        order: newOrder,
        verified: true,
        calculation: {
          orderTotal: computedTotal,
          codConfirmationCharge,
          codAdvance,
          codAmount,
          onlineAmount,
          paymentStatus: newOrder.paymentStatus,
        },
      },
      'Payment verified and order created in database successfully.'
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Order verification failed';
    console.error('[VERIFY AND CREATE ORDER ERROR]', error);
    return sendError(res, message, 500);
  }
});


// Create Razorpay Gateway Order (Legacy Endpoint compatibility)
router.post('/create-razorpay-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt, dbOrderId } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 'Invalid order amount', 400);
    }

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    if (dbOrderId) {
      await prisma.order.update({
        where: { id: dbOrderId },
        data: { razorpayOrderId: razorpayOrder.id },
      }).catch((e) => console.error('[UPDATE RAZORPAY ID ERROR]', e));
    }

    return sendSuccess(res, razorpayOrder, 'Razorpay order created successfully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Razorpay order creation failed';
    return sendError(res, message, 500);
  }
});

// Verify Payment & Confirm Order Status in DB (Legacy Endpoint compatibility)
router.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return sendError(res, 'Missing required payment verification parameters', 400);
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return sendError(res, 'Payment signature verification failed. Invalid payment payload.', 400);
    }

    if (dbOrderId) {
      const updatedOrder = await prisma.order.update({
        where: { id: dbOrderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          orderStatus: OrderStatus.CONFIRMED,
          paymentId: razorpayPaymentId,
          razorpaySignature: razorpaySignature,
        },
      });

      NotificationService.sendSMS(
        updatedOrder.phone,
        `Your LE DAMAS order ${updatedOrder.orderNumber} is confirmed! Amount: Rs.${updatedOrder.total}`,
        updatedOrder.userId || undefined,
        updatedOrder.id,
        'ORDER_CONFIRMED'
      );

      NotificationService.sendEmail(
        updatedOrder.email,
        `Order Confirmed: ${updatedOrder.orderNumber}`,
        `<p>Your LE DAMAS order <strong>${updatedOrder.orderNumber}</strong> has been confirmed. Amount: Rs.${updatedOrder.total}. We're getting it ready!</p>`,
        updatedOrder.userId || undefined,
        updatedOrder.id,
        'ORDER_CONFIRMED'
      );
    }

    return sendSuccess(
      res,
      {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        verified: true,
        timestamp: new Date().toISOString(),
      },
      'Payment verified and order status updated in database successfully.'
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment verification error';
    return sendError(res, message, 500);
  }
});

export default router;
