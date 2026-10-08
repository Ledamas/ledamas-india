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

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Trust first proxy for accurate client IP rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Security & Middleware Stack
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:3000', 'https://ledamas-india.vercel.app', 'https://ledamas.in', 'https://www.ledamas.in'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Global Rate Limiter: Apply to all incoming routes to prevent server flooding
app.use(globalRateLimiter);

// API Routes Mounting with Targeted Security Rate Limiters
app.use('/api/v1/health', healthRoutes);
app.use('/health', healthRoutes);

// Auth & OTP Routes (Protected against OTP spam & brute force)
app.use('/api/v1/auth', authRateLimiter, authRoutes);
app.use('/auth', authRateLimiter, authRoutes);

app.use('/api/v1/products', productsRoutes);
app.use('/products', productsRoutes);

app.use('/api/v1/orders', ordersRoutes);
app.use('/orders', ordersRoutes);

app.use('/api/v1/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);

// Admin Routes (Contains rate-limited POST /login)
app.use('/api/v1/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Coupon & Referral Routes (Protected against coupon enumeration)
app.use('/api/v1/coupons', couponRateLimiter, couponsRoutes);
app.use('/coupons', couponRateLimiter, couponsRoutes);

// Cart Routes
app.use('/api/v1/cart', cartRoutes);
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
