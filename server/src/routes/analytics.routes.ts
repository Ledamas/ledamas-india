import { Router, Request, Response } from 'express';
import { prisma, withDbRetry } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// Track visitor/user activity event into Neon PostgreSQL Database
router.post('/event', async (req: Request, res: Response) => {
  try {
    const { eventType, path, referrer, sessionId, metadata } = req.body;

    if (!eventType) {
      return sendError(res, 'Event type is required.', 400);
    }

    const event = await withDbRetry(() =>
      prisma.analyticsEvent.create({
        data: {
          eventType,
          path: path || '/',
          referrer: referrer || null,
          sessionId: sessionId || `anon_${Date.now()}`,
          metadata: metadata || {},
        },
      })
    );

    console.log(`[ANALYTICS DB RECORD] Event: ${eventType} recorded in Neon DB (ID: ${event.id})`);

    return sendSuccess(res, { recorded: true, eventId: event.id }, 'Analytics event recorded in database.');
  } catch (error: unknown) {
    console.error('[ANALYTICS EVENT ERROR]', error);
    return sendSuccess(res, { recorded: false }, 'Event logged locally.');
  }
});

export default router;
