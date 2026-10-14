import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { getRazorpayInstance, verifyRazorpaySignature } from '../utils/razorpay.js';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { addRealtimeClient, broadcastOrderEvent } from '../utils/realtime.js';
import { sendOrderStatusSms } from '../utils/message-central.js';
import { NotificationService } from '../services/notification.service.js';
import { verifyAndRotateSession } from '../utils/auth-security.js';
import { computeOrderPricing } from '../utils/pricing-validator.js';

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

// In-memory map of pending payment sessions: razorpayOrderId -> server-computed amount (in paise)
// This prevents the frontend from submitting a different amount than what was authorised.
const pendingPaymentSessions = new Map<string, { amountPaise: number; createdAt: number }>();

// Clean up sessions older than 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [key, val] of pendingPaymentSessions.entries()) {
    if (val.createdAt < cutoff) pendingPaymentSessions.delete(key);
  }
}, 5 * 60 * 1000);


// POST /api/v1/orders - Create & persist order in database (admin/legacy use)
// NOTE: For customer checkout, use /initiate-payment -> Razorpay -> /verify-and-create.
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

    // SERVER-SIDE PRICING: fetch real prices from DB, validate coupon/referral
    const pricingResult = await computeOrderPricing(
      items,
      couponCode,
      referralCode,
      paymentMethod,
      associatedUserId,
      email,
      phone
    );

    if ('error' in pricingResult) {
      return sendError(res, pricingResult.error, 400);
    }

    const {
      items: resolvedItems,
      subtotal: dbSubtotal,
      discountAmount,
      couponCode: validCoupon,
      referralCode: validReferral,
      codDetails,
    } = pricingResult;

    const totalOrdersCount = await prisma.order.count();
    const orderNumber = `LD-${1025 + totalOrdersCount}`;

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
        subtotal: dbSubtotal,
        shippingFee: 0,
        discount: discountAmount,
        total: codDetails.totalCustomerPays,
        couponCode: validCoupon,
        referralCode: validReferral,
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

    if (validCoupon) {
      await prisma.coupon.updateMany({
        where: { code: validCoupon },
        data: { timesUsed: { increment: 1 } },
      }).catch(() => { });
    }
    if (validReferral) {
      await prisma.referralCode.updateMany({
        where: { code: validReferral },
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

// POST /api/v1/orders/initiate-payment - Server-side pricing + Razorpay order creation
// SECURITY: Fetches real product prices from DB; never trusts frontend totals.
router.post('/initiate-payment', async (req: Request, res: Response) => {
  try {
    const {
      items,
      paymentMethod = 'UPI',
      couponCode = null,
      referralCode = null,
      userId = null,
      email = null,
      phone = null,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Order items are required to initiate payment.', 400);
    }

    // Compute pricing entirely server-side from DB
    const pricingResult = await computeOrderPricing(
      items,
      couponCode,
      referralCode,
      paymentMethod,
      userId,
      email,
      phone
    );

    if ('error' in pricingResult) {
      return sendError(res, pricingResult.error, 400);
    }

    const { codDetails } = pricingResult;
    const onlineAmount = codDetails.onlinePayableAmount;

    // Create real Razorpay order — never fall back to mock in production
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(onlineAmount * 100), // in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    // Store server-side amount so verify-and-create can cross-check
    pendingPaymentSessions.set(razorpayOrder.id, {
      amountPaise: Math.round(onlineAmount * 100),
      createdAt: Date.now(),
    });

    return sendSuccess(
      res,
      {
        razorpayOrderId: razorpayOrder.id,
        onlineAmount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        pricing: {
          subtotal: pricingResult.subtotal,
          discountAmount: pricingResult.discountAmount,
          baseOrderTotal: pricingResult.baseOrderTotal,
          isCod: codDetails.isCod,
          onlinePayableAmount: onlineAmount,
          codAmountToCollect: codDetails.codAmountToCollect,
          totalCustomerPays: codDetails.totalCustomerPays,
          codFeeType: codDetails.codFeeType,
        },
      },
      'Razorpay payment initiated with server-verified pricing.'
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Initiate payment failed';
    console.error('[INITIATE PAYMENT ERROR]', error);
    return sendError(res, message, 500);
  }
});

// POST /api/v1/orders/verify-and-create - HMAC verification + DB order creation
// SECURITY: Re-runs full server-side pricing; never trusts any frontend amounts.
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
      paymentMethod = 'UPI',
      userId,
      couponCode = null,
      referralCode = null,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return sendError(res, 'Missing required payment verification parameters', 400);
    }

    // Verify Razorpay HMAC signature
    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValidSignature) {
      return sendError(res, 'Payment signature verification failed. Untrusted payment payload.', 400);
    }

    // Validate items are provided
    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Order items are required.', 400);
    }

    // SERVER-SIDE PRICING: Re-compute everything from DB — never trust frontend amounts
    const pricingResult = await computeOrderPricing(
      items,
      couponCode,
      referralCode,
      paymentMethod,
      userId || null,
      email || null,
      phone || null
    );

    if ('error' in pricingResult) {
      return sendError(res, pricingResult.error, 400);
    }

    const {
      items: resolvedItems,
      subtotal: dbSubtotal,
      discountAmount,
      couponCode: validCoupon,
      referralCode: validReferral,
      baseOrderTotal,
      codDetails,
    } = pricingResult;

    // Cross-check: the Razorpay amount must match what we authorised in initiate-payment
    const session = pendingPaymentSessions.get(razorpayOrderId);
    const expectedPaise = Math.round(codDetails.onlinePayableAmount * 100);
    if (session && Math.abs(session.amountPaise - expectedPaise) > 1) {
      console.error(
        `[PAYMENT AMOUNT MISMATCH] razorpayOrderId=${razorpayOrderId} session=${session.amountPaise} computed=${expectedPaise}`
      );
      return sendError(res, 'Payment amount mismatch detected. Order rejected for security.', 400);
    }
    // Clean up session
    pendingPaymentSessions.delete(razorpayOrderId);

    // Auto-link user
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
      if (existingUser) finalUserId = existingUser.id;
    }

    const totalOrdersCount = await prisma.order.count();
    const orderNumber = `LD-${1025 + totalOrdersCount}`;
    const isCod = codDetails.isCod;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName || 'Valued Customer',
        email: (email || 'customer@ledamas.in').trim().toLowerCase(),
        phone: phone || '',
        street: street || '',
        apartment: apartment || '',
        city: city || '',
        state: state || 'Maharashtra',
        pincode: pincode || '',
        subtotal: dbSubtotal,
        shippingFee: 0,
        discount: discountAmount,
        total: codDetails.totalCustomerPays,
        orderTotal: baseOrderTotal,
        codAdvance: codDetails.codAdvance,
        codConfirmationCharge: codDetails.codConfirmationCharge,
        codAmount: codDetails.codAmountToCollect,
        couponCode: validCoupon,
        referralCode: validReferral,
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

    if (validCoupon) {
      await prisma.coupon.updateMany({
        where: { code: validCoupon },
        data: { timesUsed: { increment: 1 } },
      }).catch(() => { });
    }
    if (validReferral) {
      await prisma.referralCode.updateMany({
        where: { code: validReferral },
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

    // Update or create CustomerProfile
    if (finalUserId || email || phone) {
      try {
        const orderVal = codDetails.totalCustomerPays;
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

    // 1. Dispatch SMS Notification
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

    if (email) {
      NotificationService.sendEmail(
        email.trim(),
        `Your LE DAMAS Order Confirmation - #${orderNumber}`,
        orderEmailHtml,
        finalUserId || undefined,
        newOrder.id,
        'ORDER_CREATED'
      ).catch(err => console.error('[EMAIL NOTIFICATION ERROR]', err));
    }

    return sendSuccess(
      res,
      {
        order: newOrder,
        verified: true,
        pricing: {
          subtotal: dbSubtotal,
          discountAmount,
          baseOrderTotal,
          isCod,
          onlinePayableAmount: codDetails.onlinePayableAmount,
          codAmountToCollect: codDetails.codAmountToCollect,
          totalCustomerPays: codDetails.totalCustomerPays,
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
