import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// POST /api/v1/cart/sync
// Called by the frontend whenever the cart is updated
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { cartId, userId, email, phone, items, subtotal } = req.body;

    if (!items || !Array.isArray(items)) {
      return sendError(res, 'Invalid cart items', 400);
    }

    let existingCart = null;

    // Try to find the existing cart by cartId (which is the DB id), userId, email, or phone
    if (cartId) {
      existingCart = await prisma.cart.findUnique({ where: { id: cartId } });
    } else if (userId) {
      existingCart = await prisma.cart.findFirst({ where: { userId, status: 'ACTIVE' } });
    } else if (email) {
      existingCart = await prisma.cart.findFirst({ where: { email, status: 'ACTIVE' } });
    } else if (phone) {
      existingCart = await prisma.cart.findFirst({ where: { phone, status: 'ACTIVE' } });
    }

    if (existingCart) {
      // Update existing active cart
      const updatedCart = await prisma.cart.update({
        where: { id: existingCart.id },
        data: {
          items,
          subtotal: subtotal || 0,
          userId: userId || existingCart.userId,
          email: email || existingCart.email,
          phone: phone || existingCart.phone,
          status: 'ACTIVE',
          lastActiveAt: new Date(),
        },
      });
      return sendSuccess(res, { cartId: updatedCart.id }, 'Cart updated');
    } else {
      // Create new active cart
      const newCart = await prisma.cart.create({
        data: {
          items,
          subtotal: subtotal || 0,
          userId,
          email,
          phone,
          status: 'ACTIVE',
        },
      });
      return sendSuccess(res, { cartId: newCart.id }, 'Cart created');
    }
  } catch (error) {
    console.error('[CART SYNC ERROR]', error);
    return sendError(res, 'Failed to sync cart', 500);
  }
});

export default router;
