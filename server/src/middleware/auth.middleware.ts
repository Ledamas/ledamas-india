import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { verifyAndRotateSession } from '../utils/auth-security.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    phone: string;
    role: string;
  };
}

/**
 * Middleware to authenticate requests via HttpOnly cookie or Authorization Bearer header.
 */
export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.ledamas_session;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return sendError(res, 'Authentication required. Please log in.', 401);
  }

  const { valid, decoded } = verifyAndRotateSession(token, res);

  if (!valid || !decoded) {
    return sendError(res, 'Invalid or expired session. Please log in again.', 401);
  }

  req.user = decoded;
  next();
}

/**
 * Middleware to require specific roles (e.g., ADMIN, SUPER_ADMIN).
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Access denied. Unauthorized role privileges.', 403);
    }

    next();
  };
}
