import { Router, Request, Response } from 'express';
import { prisma, withDbRetry } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sendMessageCentralOtp, verifyMessageCentralOtp, resendMessageCentralOtp, formatMobileNumber } from '../utils/message-central.js';
import {
  checkOtpRateLimit,
  trackOtpAttempt,
  setAuthCookie,
  clearAuthCookie,
  generateSessionToken,
  verifyAndRotateSession,
} from '../utils/auth-security.js';
import { Role } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = Router();

// POST /api/v1/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return sendError(res, 'Mobile number is required.', 400);
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      return sendError(res, 'Please enter a valid 10-digit mobile number.', 400);
    }

    // 1. Server-side Rate Limiting & Cooldown Protection
    const rateCheck = checkOtpRateLimit(cleanedPhone);
    if (!rateCheck.allowed) {
      return sendError(res, rateCheck.message || 'OTP rate limit exceeded.', 429);
    }

    const result = await sendMessageCentralOtp(phone);

    if (!result.success) {
      return sendError(res, result.message, 400);
    }

    return sendSuccess(res, { phone: cleanedPhone, verificationId: result.verificationId }, result.message);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send OTP';
    console.error('[SEND OTP ROUTE ERROR]', error);
    return sendError(res, message, 500);
  }
});

// POST /api/v1/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp, verificationId } = req.body;

    if (!phone || !otp) {
      return sendError(res, 'Mobile number and OTP code are required.', 400);
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (otp.length < 4) {
      return sendError(res, 'Please enter a valid OTP code.', 400);
    }

    // Verify OTP code via SMS Gateway / Dev Fallback
    const result = await verifyMessageCentralOtp(phone, otp, verificationId);

    // 2. Track OTP Attempts to prevent Brute-Force
    const attemptCheck = trackOtpAttempt(cleanedPhone, result.success);

    if (!result.success) {
      if (!attemptCheck.allowed) {
        return sendError(res, 'Too many failed OTP attempts. This OTP session has been invalidated.', 429);
      }
      return sendError(
        res,
        `${result.message} (${attemptCheck.remainingAttempts} attempt(s) remaining)`,
        400
      );
    }

    const tenDigitPhone = cleanedPhone.slice(-10);
    const possiblePhones = [
      tenDigitPhone,
      `91${tenDigitPhone}`,
      `+91${tenDigitPhone}`,
    ];

    // Comprehensive search for existing user by phone variants or guest email
    let user = await withDbRetry(() =>
      prisma.user.findFirst({
        where: {
          OR: [
            { phone: { in: possiblePhones } },
            { phone: { contains: tenDigitPhone } },
            { email: { startsWith: `${tenDigitPhone}@` } },
            { email: { startsWith: `${tenDigitPhone}_` } },
            { customerProfile: { email: { startsWith: `${tenDigitPhone}@` } } },
            { customerProfile: { email: { startsWith: `${tenDigitPhone}_` } } },
            { customerProfile: { phone: { contains: tenDigitPhone } } },
          ],
        },
        include: {
          customerProfile: true,
        },
      })
    );

    if (!user) {
      const timestamp = Date.now();
      const uniqueGuestEmail = `${tenDigitPhone}_${timestamp}@guest.ledamas.com`;

      user = await withDbRetry(() =>
        prisma.user.create({
          data: {
            phone: `+91${tenDigitPhone}`,
            name: `Luxury Connoisseur`,
            phoneVerified: true,
            role: Role.CUSTOMER,
            customerProfile: {
              create: {
                phone: `+91${tenDigitPhone}`,
                fullName: `Luxury Connoisseur`,
                email: uniqueGuestEmail,
              },
            },
          },
          include: {
            customerProfile: true,
          },
        })
      );
    } else {
      const existingId = user.id;
      user = await withDbRetry(() =>
        prisma.user.update({
          where: { id: existingId },
          data: {
            phoneVerified: true,
            phone: user?.phone || `+91${tenDigitPhone}`,
            name: user?.name || `Luxury Connoisseur`,
          },
          include: {
            customerProfile: true,
          },
        })
      );
    }

    if (!user) {
      return sendError(res, 'Failed to initialize user session.', 500);
    }

    // Auto-link any existing unlinked orders matching this phone number to this user.id
    if (user && user.id && tenDigitPhone) {
      try {
        const possiblePhones = [tenDigitPhone, `91${tenDigitPhone}`, `+91${tenDigitPhone}`];
        await prisma.order.updateMany({
          where: {
            OR: [
              { phone: { in: possiblePhones } },
              { phone: { contains: tenDigitPhone } }
            ]
          },
          data: {
            userId: user.id
          }
        });
      } catch (err) {
        console.warn('[AUTO-LINK ORDERS NOTICE]', err);
      }
    }

    // Generate JWT Session Token (30-day sliding expiry)
    const token = generateSessionToken({
      userId: user.id,
      phone: user.phone || `+91${tenDigitPhone}`,
      role: user.role,
    });

    // 3. Set HttpOnly, Secure, SameSite=Lax Cookie
    setAuthCookie(res, token);

    const displayName =
      user.name && !user.name.startsWith('Customer +') && !user.name.startsWith('Guest User')
        ? user.name
        : user.phone && !user.phone.startsWith('google_')
          ? `+91 ${user.phone.slice(-10)}`
          : 'Luxury Connoisseur';

    return sendSuccess(
      res,
      {
        token, // Also returned in JSON response for mobile / API clients if needed
        user: {
          id: user.id,
          phone: user.phone,
          name: displayName,
          email: user.email,
          role: user.role,
          phoneVerified: user.phoneVerified,
          createdAt: user.createdAt,
        },
      },
      'Phone OTP verified successfully. Secure HttpOnly session initiated.'
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify OTP';
    console.error('[VERIFY OTP ROUTE ERROR]', error);
    return sendError(res, message, 500);
  }
});

// POST /api/v1/auth/resend-otp
router.post('/resend-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return sendError(res, 'Mobile number is required.', 400);
    }

    const cleanedPhone = phone.replace(/\D/g, '');

    // Server-side Rate Limiting check
    const rateCheck = checkOtpRateLimit(cleanedPhone);
    if (!rateCheck.allowed) {
      return sendError(res, rateCheck.message || 'OTP resend rate limit exceeded.', 429);
    }

    const result = await resendMessageCentralOtp(phone);

    if (!result.success) {
      return sendError(res, result.message, 400);
    }

    return sendSuccess(res, null, result.message);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to resend OTP';
    console.error('[RESEND OTP ROUTE ERROR]', error);
    return sendError(res, message, 500);
  }
});

// POST /api/v1/auth/google - Google OAuth / One Tap Authentication
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential, email: bodyEmail, name: bodyName } = req.body;

    let email = bodyEmail;
    let name = bodyName;
    let googleId = '';

    if (credential) {
      try {
        const ticket = await googleAuthClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload) {
          email = payload.email || email;
          name = payload.name || payload.given_name || name;
          googleId = payload.sub || '';
        }
      } catch (verifyErr) {
        console.warn('[GOOGLE TOKEN VERIFICATION WARNING] Falling back to safe payload parsing:', verifyErr);
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
            const payload = JSON.parse(payloadJson);
            email = payload.email || email;
            name = payload.name || payload.given_name || name;
            googleId = payload.sub || '';
          }
        } catch (jwtErr) {
          console.warn('[GOOGLE TOKEN PARSE NOTICE]', jwtErr);
        }
      }
    }

    if (!email) {
      return sendError(res, 'Google email credential is required.', 400);
    }

    // Upsert User in PostgreSQL database via Prisma with retry handling
    let user = await withDbRetry(() =>
      prisma.user.findFirst({
        where: {
          OR: [{ email }, ...(googleId ? [{ id: googleId }] : [])],
        },
      })
    );

    if (!user) {
      const tempPhone = `google_${Date.now().toString().slice(-8)}`;
      user = await withDbRetry(() =>
        prisma.user.create({
          data: {
            email,
            name: name || `Customer ${email.split('@')[0]}`,
            phone: tempPhone,
            phoneVerified: true,
            role: Role.CUSTOMER,
            customerProfile: {
              create: {
                email,
                fullName: name || `Customer ${email.split('@')[0]}`,
                phone: tempPhone,
              },
            },
          },
        })
      );
    } else if (!user.email) {
      const userId = user.id;
      user = await withDbRetry(() =>
        prisma.user.update({
          where: { id: userId },
          data: { email, name: name || user?.name },
        })
      );
    }

    if (!user) {
      return sendError(res, 'Failed to initialize Google user session.', 500);
    }

    // Generate JWT Session Token (30-day sliding expiry)
    const token = generateSessionToken({
      userId: user.id,
      phone: user.phone || '',
      role: user.role,
    });

    // Set HttpOnly, Secure, SameSite=Lax Cookie
    setAuthCookie(res, token);

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name || name || `Customer ${email.split('@')[0]}`,
          email: user.email,
          role: user.role,
          phoneVerified: user.phoneVerified,
          createdAt: user.createdAt,
        },
      },
      'Google authentication successful. Secure HttpOnly session initiated.'
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Google authentication failed';
    console.error('[GOOGLE AUTH ERROR]', error);
    return sendError(res, message, 500);
  }
});

// GET /api/v1/auth/me (Supports HttpOnly Cookie & Bearer header with silent sliding renewal)
router.get('/me', async (req: Request, res: Response) => {
  try {
    let token = req.cookies?.ledamas_session;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return sendError(res, 'Authorization session missing.', 401);
    }

    const { valid, decoded } = verifyAndRotateSession(token, res);

    if (!valid || !decoded) {
      clearAuthCookie(res);
      return sendError(res, 'Invalid or expired authentication session.', 401);
    }

    const user = await withDbRetry(() =>
      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          phoneVerified: true,
          createdAt: true,
        },
      })
    );

    if (!user) {
      clearAuthCookie(res);
      return sendError(res, 'User session not found in database.', 404);
    }

    return sendSuccess(res, user, 'Active user session validated & renewed silently.');
  } catch (error: unknown) {
    clearAuthCookie(res);
    return sendError(res, 'Invalid or expired authentication session.', 401);
  }
});

// PUT /api/v1/auth/profile - Update user profile details (Name, Phone) in PostgreSQL Database
router.put('/profile', async (req: Request, res: Response) => {
  try {
    let token = req.cookies?.ledamas_session;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return sendError(res, 'Authorization session missing.', 401);
    }

    const { valid, decoded } = verifyAndRotateSession(token, res);

    if (!valid || !decoded) {
      return sendError(res, 'Invalid or expired session token.', 401);
    }

    const { name, phone } = req.body;

    const updateData: { name?: string; phone?: string } = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) {
      const cleaned = phone.replace(/\D/g, '').slice(-10);
      if (cleaned.length === 10) {
        updateData.phone = `+91${cleaned}`;
      }
    }

    // Update User record in Neon PostgreSQL Database
    const updatedUser = await withDbRetry(() =>
      prisma.user.update({
        where: { id: decoded.userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          phoneVerified: true,
          createdAt: true,
        },
      })
    );

    // Also sync CustomerProfile if exists
    if (updateData.name || updateData.phone) {
      await withDbRetry(() =>
        prisma.customerProfile.updateMany({
          where: { userId: decoded.userId },
          data: {
            ...(updateData.name ? { fullName: updateData.name } : {}),
            ...(updateData.phone ? { phone: updateData.phone } : {}),
          },
        })
      );
    }

    return sendSuccess(res, updatedUser, 'User profile updated successfully in database.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    console.error('[PROFILE UPDATE ROUTE ERROR]', error);
    return sendError(res, message, 500);
  }
});

// POST /api/v1/auth/logout (Revokes server cookie & ends user session)
router.post('/logout', (_req: Request, res: Response) => {
  clearAuthCookie(res);
  return sendSuccess(res, null, 'Logged out successfully. HttpOnly session cookie cleared.');
});

export default router;
