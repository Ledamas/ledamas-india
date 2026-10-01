import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// Helper to generate a clean referral code from name or phone
function generateReferralCodeString(name?: string | null, phone?: string | null): string {
  const cleanName = (name || '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 5);
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-4);
  const prefix = cleanName.length >= 3 ? cleanName : 'LEDAMAS';
  const suffix = cleanPhone || Math.floor(10 + Math.random() * 90).toString();
  return `${prefix}${suffix}`;
}

// POST /api/v1/coupons/validate - Validate coupon or referral code for checkout
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal = 0, userId, phone, email, cartQuantity = 0 } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return sendError(res, 'Please provide a valid coupon or referral code.', 400);
    }

    const cleanCode = code.trim().toUpperCase();
    const numericSubtotal = Number(subtotal) || 0;
    const numericQuantity = Number(cartQuantity) || 0;

    // 1. Check if matching Coupon in Database
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: { equals: cleanCode, mode: 'insensitive' },
      },
    });

    if (coupon) {
      if (!coupon.isActive) {
        return sendError(res, 'This coupon code is currently inactive.', 400);
      }

      const now = new Date();
      if (coupon.startDate && coupon.startDate > now) {
        return sendError(res, 'This coupon code is not active yet.', 400);
      }
      if (coupon.expiryDate && coupon.expiryDate < now) {
        return sendError(res, 'This coupon code has expired.', 400);
      }

      if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
        return sendError(res, 'This coupon code has reached its maximum usage limit.', 400);
      }

      if (coupon.minOrderValue && numericSubtotal < coupon.minOrderValue) {
        return sendError(
          res,
          `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} is required to use this coupon.`,
          400
        );
      }

      if (coupon.minQuantity && numericQuantity < coupon.minQuantity) {
        return sendError(
          res,
          `Minimum quantity of ${coupon.minQuantity} items is required to use this coupon.`,
          400
        );
      }

      if (coupon.onePerCustomer && (userId || phone || email)) {
        const previousOrder = await prisma.order.findFirst({
          where: {
            couponCode: { equals: cleanCode, mode: 'insensitive' },
            paymentStatus: { in: ['PAID', 'ADVANCE_PAID'] },
            OR: [
              ...(userId ? [{ userId }] : []),
              ...(phone ? [{ phone }] : []),
              ...(email ? [{ email }] : []),
            ]
          }
        });
        
        if (previousOrder) {
          return sendError(res, 'This coupon is limited to one use per customer, and you have already used it.', 400);
        }
      }

      let discountAmount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (numericSubtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon.discountType === 'FIXED_AMOUNT') {
        discountAmount = coupon.discountValue;
      } else if (coupon.discountType === 'FREE_SHIPPING') {
        discountAmount = 0; // Handled in shipping fee
      }

      discountAmount = Math.min(discountAmount, numericSubtotal);
      const finalTotal = Math.max(0, numericSubtotal - discountAmount);

      return sendSuccess(res, {
        valid: true,
        type: 'COUPON',
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount),
        finalTotal: Math.round(finalTotal),
        message: `Coupon '${coupon.code}' applied! You saved ₹${Math.round(discountAmount).toLocaleString('en-IN')}`,
      });
    }

    // 2. Check if matching Referral Code in Database or User table
    let referral = await prisma.referralCode.findFirst({
      where: {
        code: { equals: cleanCode, mode: 'insensitive' },
      },
      include: {
        ownerUser: true,
      },
    });

    // Fallback: Check User table if referralCode matches
    if (!referral) {
      const userRefOwner = await prisma.user.findFirst({
        where: {
          referralCode: { equals: cleanCode, mode: 'insensitive' },
        },
      });

      if (userRefOwner) {
        referral = await prisma.referralCode.create({
          data: {
            code: cleanCode,
            ownerUserId: userRefOwner.id,
            ownerName: userRefOwner.name || 'Referral Partner',
            ownerPhone: userRefOwner.phone || null,
            ownerEmail: userRefOwner.email || null,
            discountPercent: 20.0,
          },
          include: {
            ownerUser: true,
          },
        });
      }
    }

    if (referral) {
      // Rule: Referral should not apply to the same customer/account who owns the referral code
      const cleanPhone = (phone || '').replace(/\D/g, '');
      const cleanOwnerPhone = (referral.ownerPhone || '').replace(/\D/g, '');

      const isSelfUserId = userId && referral.ownerUserId === userId;
      const isSelfPhone = cleanPhone && cleanOwnerPhone && cleanPhone.slice(-10) === cleanOwnerPhone.slice(-10);
      const isSelfEmail = email && referral.ownerEmail && email.toLowerCase() === referral.ownerEmail.toLowerCase();

      if (isSelfUserId || isSelfPhone || isSelfEmail) {
        return sendError(res, 'You cannot use your own referral code for your own order.', 400);
      }

      const discountPercent = referral.discountPercent || 20.0;
      const discountAmount = Math.min(numericSubtotal, (numericSubtotal * discountPercent) / 100);
      const finalTotal = Math.max(0, numericSubtotal - discountAmount);

      return sendSuccess(res, {
        valid: true,
        type: 'REFERRAL',
        code: referral.code,
        ownerName: referral.ownerName,
        discountPercent,
        discountAmount: Math.round(discountAmount),
        finalTotal: Math.round(finalTotal),
        message: `Referral discount (${discountPercent}%) applied! Saved ₹${Math.round(discountAmount).toLocaleString('en-IN')}`,
      });
    }

    return sendError(res, 'Invalid coupon or referral code. Please check and try again.', 404);
  } catch (err: any) {
    console.error('[VALIDATE DISCOUNT ERROR]', err);
    return sendError(res, err.message || 'Failed to validate discount code.', 500);
  }
});

// GET /api/v1/coupons/user-referral - Get or generate logged in user's referral code & link
router.get('/user-referral', async (req: Request, res: Response) => {
  try {
    const { userId, phone, email } = req.query;

    if (!userId && !phone && !email) {
      return sendError(res, 'User ID, phone, or email is required.', 400);
    }

    const whereOr: any[] = [];
    if (userId) whereOr.push({ id: String(userId) });
    if (phone) whereOr.push({ phone: String(phone) });
    if (email) whereOr.push({ email: String(email) });

    let user = await prisma.user.findFirst({
      where: { OR: whereOr },
    });

    if (!user) {
      return sendError(res, 'User not found.', 44);
    }

    let code = user.referralCode;

    if (!code) {
      code = generateReferralCodeString(user.name, user.phone);
      // Ensure unique code
      const existingCode = await prisma.user.findUnique({ where: { referralCode: code } });
      if (existingCode) {
        code = `${code}${Math.floor(10 + Math.random() * 90)}`;
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: code },
      });
    }

    // Ensure ReferralCode record exists
    let referralRecord = await prisma.referralCode.findUnique({
      where: { code },
    });

    if (!referralRecord) {
      referralRecord = await prisma.referralCode.create({
        data: {
          code,
          ownerUserId: user.id,
          ownerName: user.name || 'Le Damas Customer',
          ownerPhone: user.phone,
          ownerEmail: user.email,
          discountPercent: 20.0,
        },
      });
    }

    const baseUrl = process.env.CLIENT_URL || 'https://ledamas.in';
    const referralLink = `${baseUrl}/?ref=${code}`;

    return sendSuccess(res, {
      referralCode: code,
      referralLink,
      discountPercent: referralRecord.discountPercent || 20.0,
      timesUsed: referralRecord.timesUsed || 0,
      ownerName: user.name,
    });
  } catch (err: any) {
    console.error('[USER REFERRAL ERROR]', err);
    return sendError(res, err.message || 'Failed to fetch referral details.', 500);
  }
});

export default router;
