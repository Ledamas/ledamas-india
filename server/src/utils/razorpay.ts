import Razorpay from 'razorpay';
import crypto from 'crypto';

export const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay API keys are missing in environment variables.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export const verifyRazorpaySignature = ({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[RAZORPAY] RAZORPAY_KEY_SECRET is not set — cannot verify signature.');
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // crypto.timingSafeEqual prevents timing-based attacks
  try {
    const a = Buffer.from(generatedSignature, 'hex');
    const b = Buffer.from(signature, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};
