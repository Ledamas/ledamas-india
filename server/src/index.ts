import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes.js';
import productsRoutes from './routes/products.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import couponsRoutes from './routes/coupons.routes.js';
import cartRoutes from './routes/cart.routes.js';
import { startAbandonedCartJob } from './jobs/abandoned-cart.job.js';
import { sendError } from './utils/response.js';
import {
  globalRateLimiter,
  authRateLimiter,
  adminLoginRateLimiter,
  couponRateLimiter,
} from './middleware/rate-limit.middleware.js';

import path from 'path';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Trust first proxy for accurate client IP rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Security & Middleware Stack
app.use(helmet());

const rawCorsOrigin = process.env.CORS_ORIGIN?.trim() || '';
const configuredOrigins = rawCorsOrigin
  ? rawCorsOrigin.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://ledamas.in',
  'https://www.ledamas.in',
  'https://ledamas-india.vercel.app',
];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow server-to-server / same-origin requests (no Origin header)
      if (!origin) return callback(null, true);

      // 2. Allow wildcard if explicitly configured
      if (allowedOrigins.includes('*') || rawCorsOrigin === '*') {
        return callback(null, true);
      }

      // 3. Always allow explicitly listed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // 4. Allow any subdomains of ledamas.in
      if (/^https?:\/\/([a-zA-Z0-9-]+\.)*ledamas\.in(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // 5. Allow any Vercel preview deployments (for staging)
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);

      // 6. Allow localhost and 127.0.0.1
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      // 7. Allow AWS EC2 hostname / private network ranges
      if (
        /amazonaws\.com(:\d+)?$/.test(origin) ||
        /^https?:\/\/(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(origin)
      ) {
        return callback(null, true);
      }

      // 8. Reject origin cleanly without crashing the Express process
      console.warn(`[CORS] Blocked request from origin: ${origin}. Add to CORS_ORIGIN in server/.env if legitimate.`);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files (favicons, icons, public assets)
app.use(express.static(path.join(process.cwd(), 'public')));

// Global Rate Limiter: Apply to all incoming routes to prevent server flooding
app.use(globalRateLimiter);

// API Routes Mounting with Targeted Security Rate Limiters
// Handles both /api/v1/*, /v1/*, and root path aliases to prevent Nginx proxy stripping 404s
app.use('/api/v1/health', healthRoutes);
app.use('/v1/health', healthRoutes);
app.use('/health', healthRoutes);

// Auth & OTP Routes (Protected against OTP spam & brute force)
app.use('/api/v1/auth', authRateLimiter, authRoutes);
app.use('/v1/auth', authRateLimiter, authRoutes);
app.use('/auth', authRateLimiter, authRoutes);

app.use('/api/v1/products', productsRoutes);
app.use('/v1/products', productsRoutes);
app.use('/products', productsRoutes);

app.use('/api/v1/orders', ordersRoutes);
app.use('/v1/orders', ordersRoutes);
app.use('/orders', ordersRoutes);

app.use('/api/v1/analytics', analyticsRoutes);
app.use('/v1/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);

// Admin Routes (Contains rate-limited POST /login)
app.use('/api/v1/admin', adminRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Coupon & Referral Routes (Protected against coupon enumeration)
app.use('/api/v1/coupons', couponRateLimiter, couponsRoutes);
app.use('/v1/coupons', couponRateLimiter, couponsRoutes);
app.use('/coupons', couponRateLimiter, couponsRoutes);

// Cart Routes
app.use('/api/v1/cart', cartRoutes);
app.use('/v1/cart', cartRoutes);
app.use('/cart', cartRoutes);

// Root Route Welcome
app.get('/', (_req: Request, res: Response) => {
  res.json({
    brand: 'LE DAMAS',
    service: 'Luxury Chocolaterie API Gateway',
    version: '1.0.0',
    status: 'ACTIVE',
    documentation: '/api/v1/health'
  });
});

// 404 Not Found Handler
app.use((_req: Request, res: Response) => {
  sendError(res, 'Requested API endpoint does not exist.', 404);
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  sendError(res, err.message || 'Internal Server Error', 500);
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🍫 LE DAMAS Express API Backend Server is running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`==================================================\n`);

  // Start Background Jobs
  startAbandonedCartJob();
});

export default app;
