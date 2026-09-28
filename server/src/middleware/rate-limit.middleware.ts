import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { sendError } from '../utils/response.js';

/**
 * Global Rate Limiter: Protects all API endpoints from traffic surges, DDOS, and web scrapers.
 * Limit: 200 requests per 15-minute window per IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Global rate limit exceeded. Please wait 15 minutes before making more requests.', 429);
  },
});

/**
 * Auth & OTP Rate Limiter: Strictly limits OTP generation, verification, and authentication requests.
 * Prevents SMS gateway abuse, OTP brute-forcing, and credential stuffing attacks.
 * Limit: 10 requests per 15-minute window per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Too many authentication attempts. Please try again after 15 minutes.', 429);
  },
});

/**
 * Admin Login Rate Limiter: Ultra-strict rate limit for admin dashboard authentication.
 * Prevents automated password cracking and admin account brute-force attacks.
 * Limit: 5 requests per 15-minute window per IP.
 */
export const adminLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Security Alert: Maximum admin login attempts exceeded. IP address blocked for 15 minutes.', 429);
  },
});

/**
 * Coupon Rate Limiter: Limits coupon & referral code validation attempts.
 * Prevents automated dictionary attacks for brute-forcing discount codes.
 * Limit: 15 requests per 15-minute window per IP.
 */
export const couponRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Too many discount code verification attempts. Please wait a few minutes.', 429);
  },
});

/**
 * Order Creation Rate Limiter: Protects order creation and checkout endpoints.
 * Prevents malicious bots from creating fake orders or exhausting inventory.
 * Limit: 10 requests per 15-minute window per IP.
 */
export const orderRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Too many order attempts in a short timeframe. Please wait a moment before trying again.', 429);
  },
});
