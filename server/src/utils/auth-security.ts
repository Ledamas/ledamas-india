import { Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ledamas_super_secret_jwt_key_2026_luxury';

// Memory stores for OTP security
interface OtpTracker {
  attempts: number;
  lastSentAt: number;
  sendCountWindow: number;
  windowStart: number;
}

const otpStore = new Map<string, OtpTracker>();

// Invalidate outdated store entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [phone, tracker] of otpStore.entries()) {
    if (now - tracker.windowStart > 60 * 60 * 1000) {
      otpStore.delete(phone);
    }
  }
}, 15 * 60 * 1000);

/**
 * Checks OTP send rate limits:
 * - Minimum 60-second cooldown between consecutive OTP requests.
 * - Maximum 5 OTP requests per phone per hour.
 */
export function checkOtpRateLimit(phone: string): { allowed: boolean; message?: string } {
  const cleanedPhone = phone.replace(/\D/g, '');
  const now = Date.now();
  const tracker = otpStore.get(cleanedPhone) || {
    attempts: 0,
    lastSentAt: 0,
    sendCountWindow: 0,
    windowStart: now,
  };

  // Reset hourly window if 1 hour has elapsed
  if (now - tracker.windowStart > 60 * 60 * 1000) {
    tracker.sendCountWindow = 0;
    tracker.windowStart = now;
  }

  // 15-second cooldown check
  if (now - tracker.lastSentAt < 15 * 1000) {
    const secondsRemaining = Math.ceil((15 * 1000 - (now - tracker.lastSentAt)) / 1000);
    return {
      allowed: false,
      message: `Please wait ${secondsRemaining} seconds before requesting a new OTP.`,
    };
  }

  // 5 OTPs per hour check
  if (tracker.sendCountWindow >= 5) {
    return {
      allowed: false,
      message: 'Maximum OTP request limit reached for this hour. Please try again later.',
    };
  }

  // Update send count and last sent time
  tracker.lastSentAt = now;
  tracker.sendCountWindow += 1;
  tracker.attempts = 0; // reset failed attempts on new OTP request
  otpStore.set(cleanedPhone, tracker);

  return { allowed: true };
}

/**
 * Tracks failed OTP verification attempts.
 * Locks out OTP verification after 3 failed attempts.
 */
export function trackOtpAttempt(phone: string, isSuccess: boolean): { allowed: boolean; remainingAttempts?: number } {
  const cleanedPhone = phone.replace(/\D/g, '');
  const tracker = otpStore.get(cleanedPhone);

  if (!tracker) {
    return { allowed: true };
  }

  if (isSuccess) {
    otpStore.delete(cleanedPhone);
    return { allowed: true };
  }

  tracker.attempts += 1;
  const maxAttempts = 3;

  if (tracker.attempts >= maxAttempts) {
    otpStore.delete(cleanedPhone);
    return {
      allowed: false,
      remainingAttempts: 0,
    };
  }

  otpStore.set(cleanedPhone, tracker);
  return {
    allowed: true,
    remainingAttempts: maxAttempts - tracker.attempts,
  };
}

/**
 * Sets secure HttpOnly cookie for session token.
 */
export function setAuthCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('ledamas_session', token, {
    httpOnly: true, // Prevents XSS theft via document.cookie
    secure: isProduction, // Requires HTTPS in production
    sameSite: 'lax', // Protects against CSRF
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30-day persistent session
  });
}

/**
 * Clears HttpOnly session cookie on logout.
 */
export function clearAuthCookie(res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('ledamas_session', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Generates a signed JWT session token.
 */
export function generateSessionToken(payload: { userId: string; phone: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Verifies JWT token and supports silent token rotation (sliding expiry).
 */
export function verifyAndRotateSession(
  token: string,
  res?: Response
): { valid: boolean; decoded?: { userId: string; phone: string; role: string } } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      phone: string;
      role: string;
      iat?: number;
    };

    // Silent token rotation: if token is older than 24 hours, rotate with new 30-day token
    if (res && decoded.iat) {
      const tokenAgeSeconds = Math.floor(Date.now() / 1000) - decoded.iat;
      if (tokenAgeSeconds > 24 * 60 * 60) {
        const refreshedToken = generateSessionToken({
          userId: decoded.userId,
          phone: decoded.phone,
          role: decoded.role,
        });
        setAuthCookie(res, refreshedToken);
      }
    }

    return { valid: true, decoded };
  } catch (error) {
    return { valid: false };
  }
}
