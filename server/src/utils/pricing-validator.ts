import { prisma } from '../config/db.js';
import { calculateCodDetails } from './cod-calculator.js';

export interface ValidatedItem {
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  price: number;         // Canonical price from DB
  quantity: number;
  image: string;
}

export interface PricingResult {
  items: ValidatedItem[];
  subtotal: number;          // Sum of (DB price × quantity)
  discountAmount: number;    // Validated server-side discount
  couponCode: string | null;
  referralCode: string | null;
  baseOrderTotal: number;    // subtotal − discountAmount
  shippingFee: number;
}

/**
 * Fetch canonical prices from PostgreSQL for each order item.
 * Rejects items with unknown productId/variantId (returns error string).
 * Never trusts frontend-supplied prices.
 */
export async function resolveAndPriceItems(
  rawItems: any[]
): Promise<{ error: string } | { items: ValidatedItem[]; subtotal: number }> {
  if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    return { error: 'Order must contain at least one item.' };
  }

  const resolvedItems: ValidatedItem[] = [];

  for (const item of rawItems) {
    const rawProductId = item.productId || item.id;
    const rawVariantId = item.variantId || null;
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));

    if (!rawProductId) {
      return { error: 'Each order item must have a valid productId.' };
    }

    // Fetch product from DB (never trust frontend price)
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: rawProductId }, { slug: rawProductId }],
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        inStock: true,
        status: true,
        variants: {
          select: { id: true, name: true, weight: true, price: true, inStock: true },
        },
      },
    });

    if (!product) {
      return { error: `Product not found: ${rawProductId}. Cannot create order with invalid products.` };
    }

    if (!product.inStock || product.status !== 'Active') {
      return { error: `Product "${product.name}" is currently out of stock or inactive.` };
    }

    let canonicalPrice = product.price;
    let variantId: string | null = null;
    let variantName: string | null = null;

    if (rawVariantId) {
      const variant = product.variants.find((v) => v.id === rawVariantId);
      if (!variant) {
        return { error: `Variant ${rawVariantId} not found for product "${product.name}".` };
      }
      if (!variant.inStock) {
        return { error: `Variant "${variant.name || variant.weight}" of "${product.name}" is out of stock.` };
      }
      canonicalPrice = variant.price;
      variantId = variant.id;
      variantName = variant.name || variant.weight || null;
    }

    resolvedItems.push({
      productId: product.id,
      variantId,
      productName: product.name,
      variantName,
      price: canonicalPrice,
      quantity: qty,
      image: item.image || product.images?.[0] || '/logo.png',
    });
  }

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items: resolvedItems, subtotal };
}

/**
 * Validate coupon or referral code on the server and compute the discount amount
 * against the server-computed subtotal. Returns { discountAmount, couponCode, referralCode }
 * or { error }.
 */
export async function validateDiscountCode(
  couponCode: string | null,
  referralCode: string | null,
  subtotal: number,
  userId?: string | null,
  email?: string | null,
  phone?: string | null,
  cartQuantity?: number
): Promise<
  | { error: string }
  | { discountAmount: number; couponCode: string | null; referralCode: string | null }
> {
  const cleanCouponCode = couponCode ? String(couponCode).trim().toUpperCase() : null;
  const cleanReferralCode = referralCode ? String(referralCode).trim().toUpperCase() : null;

  // If neither code supplied, no discount
  if (!cleanCouponCode && !cleanReferralCode) {
    return { discountAmount: 0, couponCode: null, referralCode: null };
  }

  const codeToValidate = cleanCouponCode || cleanReferralCode!;

  // 1. Try coupon
  const coupon = await prisma.coupon.findFirst({
    where: { code: { equals: codeToValidate, mode: 'insensitive' } },
  });

  if (coupon) {
    if (!coupon.isActive) return { error: 'Coupon is currently inactive.' };

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) return { error: 'Coupon is not active yet.' };
    if (coupon.expiryDate && coupon.expiryDate < now) return { error: 'Coupon has expired.' };
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit)
      return { error: 'Coupon usage limit reached.' };
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue)
      return { error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.` };
    if (coupon.minQuantity && (cartQuantity || 0) < coupon.minQuantity)
      return { error: `Minimum quantity of ${coupon.minQuantity} items required.` };

    if (coupon.onePerCustomer && (userId || phone || email)) {
      const prev = await prisma.order.findFirst({
        where: {
          couponCode: { equals: codeToValidate, mode: 'insensitive' },
          paymentStatus: { in: ['PAID', 'ADVANCE_PAID'] },
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(phone ? [{ phone }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      });
      if (prev) return { error: 'You have already used this coupon.' };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(Math.round(discountAmount), subtotal);
    return { discountAmount, couponCode: coupon.code, referralCode: null };
  }

  // 2. Try referral code
  let referral = await prisma.referralCode.findFirst({
    where: { code: { equals: codeToValidate, mode: 'insensitive' } },
    include: { ownerUser: true },
  });

  if (!referral) {
    // Fallback: check User.referralCode field
    const userRefOwner = await prisma.user.findFirst({
      where: { referralCode: { equals: codeToValidate, mode: 'insensitive' } },
    });
    if (userRefOwner) {
      referral = await prisma.referralCode.create({
        data: {
          code: codeToValidate,
          ownerUserId: userRefOwner.id,
          ownerName: userRefOwner.name || 'Referral Partner',
          ownerPhone: userRefOwner.phone || null,
          ownerEmail: userRefOwner.email || null,
          discountPercent: 20.0,
        },
        include: { ownerUser: true },
      });
    }
  }

  if (referral) {
    // Prevent self-use
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanOwnerPhone = (referral.ownerPhone || '').replace(/\D/g, '');
    if (
      (userId && referral.ownerUserId === userId) ||
      (cleanPhone && cleanOwnerPhone && cleanPhone.slice(-10) === cleanOwnerPhone.slice(-10)) ||
      (email && referral.ownerEmail && email.toLowerCase() === referral.ownerEmail.toLowerCase())
    ) {
      return { error: 'You cannot use your own referral code.' };
    }

    const discountPercent = referral.discountPercent || 20.0;
    const discountAmount = Math.round(Math.min(subtotal, (subtotal * discountPercent) / 100));
    return { discountAmount, couponCode: null, referralCode: referral.code };
  }

  return { error: `Invalid coupon or referral code: ${codeToValidate}` };
}

/**
 * Full server-side pricing pipeline:
 *  1. Fetch canonical prices from DB
 *  2. Validate coupon/referral
 *  3. Compute baseOrderTotal and COD details
 */
export async function computeOrderPricing(
  rawItems: any[],
  couponCode: string | null,
  referralCode: string | null,
  paymentMethod: string,
  userId?: string | null,
  email?: string | null,
  phone?: string | null
): Promise<{ error: string } | (PricingResult & { codDetails: ReturnType<typeof calculateCodDetails> })> {
  const itemResult = await resolveAndPriceItems(rawItems);
  if ('error' in itemResult) return itemResult;

  const { items, subtotal } = itemResult;
  const cartQuantity = items.reduce((s, i) => s + i.quantity, 0);

  const discountResult = await validateDiscountCode(
    couponCode,
    referralCode,
    subtotal,
    userId,
    email,
    phone,
    cartQuantity
  );
  if ('error' in discountResult) return discountResult;

  const { discountAmount, couponCode: validCoupon, referralCode: validReferral } = discountResult;
  const baseOrderTotal = Math.max(0, subtotal - discountAmount);
  const codDetails = calculateCodDetails(baseOrderTotal, paymentMethod);

  return {
    items,
    subtotal,
    discountAmount,
    couponCode: validCoupon,
    referralCode: validReferral,
    baseOrderTotal,
    shippingFee: 0,
    codDetails,
  };
}
