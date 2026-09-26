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
import { sendError } from './utils/response.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

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

// API Routes Mounting
app.use('/api/v1/health', healthRoutes);
app.use('/health', healthRoutes);

app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/v1/products', productsRoutes);
app.use('/products', productsRoutes);

app.use('/api/v1/orders', ordersRoutes);
app.use('/orders', ordersRoutes);

app.use('/api/v1/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/api/v1/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/v1/coupons', couponsRoutes);
app.use('/coupons', couponsRoutes);

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
});

export default app;
