import { Router, Request, Response, NextFunction } from 'express';
import { prisma, withDbRetry } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// HTTP Basic Authentication Middleware for Protected Health Endpoint
const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="LE DAMAS Protected Health Check"');
    return sendError(res, 'HTTP Basic Authentication required to view health status.', 401);
  }

  const credentialsBase64 = authHeader.split(' ')[1];
  const credentials = Buffer.from(credentialsBase64, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  const expectedUsername = process.env.HEALTH_USERNAME || 'admin';
  const expectedPassword = process.env.HEALTH_PASSWORD || 'ledamas_health_secret_2026';

  if (username === expectedUsername && password === expectedPassword) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="LE DAMAS Protected Health Check"');
  return sendError(res, 'Invalid HTTP Basic Auth credentials.', 401);
};

router.get('/', basicAuthMiddleware, async (_req: Request, res: Response) => {
  let dbStatus = 'DISCONNECTED';
  try {
    await withDbRetry(() => prisma.$queryRaw`SELECT 1`);
    dbStatus = 'CONNECTED';
  } catch (err) {
    dbStatus = 'CONNECTING_OR_PENDING';
  }

  sendSuccess(
    res,
    {
      service: 'LE DAMAS Luxury Chocolaterie Backend API',
      status: 'ONLINE',
      databaseStatus: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    'Maison Backend API is healthy.'
  );
});

export default router;
