export function getMessageCentralCustomerId(): string {
  return process.env.MESSAGE_CENTRAL_CUSTOMER_ID || '';
}

export function getMessageCentralAuthToken(): string {
  return process.env.MESSAGE_CENTRAL_AUTH_TOKEN || '';
}

// Format mobile number to 10 digits for India
export function formatMobileNumber(mobile: string): string {
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.slice(2);
  }
  return cleaned;
}

// In-memory store for verification IDs mapping mobile -> verificationId
const verificationMap = new Map<string, { verificationId: string; expiresAt: number }>();

/**
 * Send OTP via Message Central Verification API (v3)
 */
export async function sendMessageCentralOtp(
  rawMobile: string
): Promise<{ success: boolean; message: string; verificationId?: string }> {
  const mobile = formatMobileNumber(rawMobile);
  const customerId = getMessageCentralCustomerId();
  const token = getMessageCentralAuthToken();

  if (!customerId || !token) {
    console.error('❌ [MESSAGE CENTRAL ERROR] Missing MESSAGE_CENTRAL_CUSTOMER_ID or MESSAGE_CENTRAL_AUTH_TOKEN.');
    return {
      success: false,
      message: 'OTP service is misconfigured. Missing Customer ID or Auth Token.',
    };
  }

  try {
    console.log(`📱 [MESSAGE CENTRAL SENDING OTP] Mobile: +91${mobile}, CustomerId: ${customerId}`);

    const response = await fetch(
      `https://cpaas.messagecentral.com/verification/v3/send?customerId=${encodeURIComponent(
        customerId
      )}&countryCode=91&mobileNumber=${encodeURIComponent(mobile)}&flowType=SMS&otpLength=4`,
      {
        method: 'POST',
        headers: {
          authToken: token,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = (await response.json().catch(() => ({}))) as any;
    console.log('[MESSAGE CENTRAL SEND OTP RESPONSE]', response.status, data);

    const verificationId = data?.data?.verificationId || data?.verificationId;

    if ((response.ok || data?.responseCode === 200 || data?.status === 'SUCCESS') && verificationId) {
      verificationMap.set(mobile, {
        verificationId,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      return {
        success: true,
        message: data?.message || 'OTP sent successfully via Message Central.',
        verificationId,
      };
    }

    return {
      success: false,
      message: data?.message || data?.errorMessage || 'Failed to send OTP via Message Central.',
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Network error sending OTP';
    console.error('[MESSAGE CENTRAL NETWORK ERROR]', error);
    return {
      success: false,
      message: errMessage,
    };
  }
}

/**
 * Verify OTP via Message Central Validate API (v3)
 */
export async function verifyMessageCentralOtp(
  rawMobile: string,
  otp: string,
  providedVerificationId?: string
): Promise<{ success: boolean; message: string }> {
  const mobile = formatMobileNumber(rawMobile);
  const customerId = getMessageCentralCustomerId();
  const token = getMessageCentralAuthToken();

  if (!customerId || !token) {
    return {
      success: false,
      message: 'OTP service is misconfigured.',
    };
  }

  try {
    const storedVerification = verificationMap.get(mobile);
    const verificationId = providedVerificationId || storedVerification?.verificationId;

    console.log(`📱 [MESSAGE CENTRAL VERIFYING OTP] Mobile: +91${mobile}, VerificationID: ${verificationId}, OTP: ${otp}`);

    const url = verificationId
      ? `https://cpaas.messagecentral.com/verification/v3/validateOtp?verificationId=${encodeURIComponent(
        verificationId
      )}&code=${encodeURIComponent(otp)}`
      : `https://cpaas.messagecentral.com/verification/v3/validateOtp?customerId=${encodeURIComponent(
        customerId
      )}&countryCode=91&mobileNumber=${encodeURIComponent(mobile)}&code=${encodeURIComponent(otp)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        authToken: token,
      },
    });

    const data = (await response.json().catch(() => ({}))) as any;
    console.log('[MESSAGE CENTRAL VERIFY RESPONSE]', response.status, data);

    if (
      response.ok &&
      (data?.responseCode === 200 ||
        data?.status === 'SUCCESS' ||
        data?.verificationStatus === 'VERIFIED' ||
        data?.message?.toLowerCase().includes('success') ||
        data?.message?.toLowerCase().includes('verified'))
    ) {
      verificationMap.delete(mobile);
      return {
        success: true,
        message: data?.message || 'OTP verified successfully.',
      };
    }

    return {
      success: false,
      message: data?.message || data?.errorMessage || 'Invalid verification code.',
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Network error verifying OTP';
    console.error('[MESSAGE CENTRAL VERIFY ERROR]', error);
    return {
      success: false,
      message: errMessage,
    };
  }
}

/**
 * Resend OTP via Message Central
 */
export async function resendMessageCentralOtp(rawMobile: string): Promise<{ success: boolean; message: string }> {
  return sendMessageCentralOtp(rawMobile);
}

/**
 * Send Order Status Event Notification SMS via Message Central Provider
 */
export async function sendOrderStatusSms({
  phone,
  orderNumber,
  status,
  amount,
  refundId,
}: {
  phone: string;
  orderNumber: string;
  status: string;
  amount?: number;
  refundId?: string;
}): Promise<{ success: boolean; message: string }> {
  const mobile = formatMobileNumber(phone);
  if (!mobile || mobile.length < 10) {
    return { success: false, message: 'Invalid mobile number for status SMS.' };
  }

  let textMsg = '';
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
    case 'NEW':
      textMsg = `Le Damas: Your Order #${orderNumber} is CONFIRMED! We are preparing your luxury confections for cold-chain dispatch.`;
      break;
    case 'PROCESSING':
    case 'PACKED':
      textMsg = `Le Damas: Your Order #${orderNumber} is now PROCESSING & PACKED in temperature-controlled insulated packaging.`;
      break;
    case 'SHIPPED':
      textMsg = `Le Damas: 🚚 Your Order #${orderNumber} has been SHIPPED! Check your profile live for delivery tracking updates.`;
      break;
    case 'DELIVERED':
      textMsg = `Le Damas: ✓ Your Order #${orderNumber} has been DELIVERED! Enjoy your artisanal luxury chocolates.`;
      break;
    case 'CANCELLED':
      textMsg = `Le Damas: Your Order #${orderNumber} has been CANCELLED.`;
      break;
    case 'REFUND_REQUESTED':
    case 'REFUND_INITIATED':
      textMsg = `Le Damas: 💰 Refund Initiated for Order #${orderNumber} of amount ₹${amount || 0}. Processing via Razorpay.`;
      break;
    case 'REFUNDED':
    case 'REFUND_COMPLETED':
      textMsg = `Le Damas: 💰 Refund Completed for Order #${orderNumber}! Amount ₹${amount || 0} returned to original payment source. Razorpay Refund ID: ${refundId || 'N/A'}.`;
      break;
    default:
      textMsg = `Le Damas: Order #${orderNumber} status updated to ${status}.`;
  }

  const customerId = getMessageCentralCustomerId();
  const token = getMessageCentralAuthToken();

  console.log(`💬 [STATUS SMS TRIGGERED] To: +91${mobile} | Status: ${status} | Message: "${textMsg}"`);

  if (!customerId || !token) {
    console.log(`ℹ️ [SMS LOG ONLY] Message Central credentials not fully present. Logged SMS: "${textMsg}"`);
    return { success: true, message: 'SMS logged (credentials pending).' };
  }

  try {
    const url = `https://cpaas.messagecentral.com/v1/sms/send?customerId=${encodeURIComponent(
      customerId
    )}&countryCode=91&mobileNumber=${encodeURIComponent(mobile)}&message=${encodeURIComponent(textMsg)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        authToken: token,
      },
    });

    const data = (await res.json().catch(() => ({}))) as any;
    console.log(`📱 [MESSAGE CENTRAL SMS RESPONSE]`, res.status, data);

    return {
      success: res.ok,
      message: data?.message || 'Status SMS dispatched successfully.',
    };
  } catch (err: any) {
    console.error('[SMS DISPATCH ERROR]', err);
    return { success: false, message: err?.message || 'Failed to dispatch status SMS.' };
  }
}

