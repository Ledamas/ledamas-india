import cron from 'node-cron';
import { prisma } from '../config/db.js';
import { NotificationService } from '../services/notification.service.js';

export const startAbandonedCartJob = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Running Abandoned Cart Check...');

    try {
      // Find carts that have been active, haven't been updated in the last 2 hours, and have an email
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const abandonedCarts = await prisma.cart.findMany({
        where: {
          status: 'ACTIVE',
          lastActiveAt: {
            lt: twoHoursAgo,
          },
          email: {
            not: null,
          },
        },
      });

      console.log(`[CRON] Found ${abandonedCarts.length} abandoned carts.`);

      for (const cart of abandonedCarts) {
        if (!cart.email) continue;

        const items = cart.items as Array<any>;
        if (!items || items.length === 0) continue;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #c99339;">Did you forget something?</h2>
            <p>Hi there,</p>
            <p>We noticed you left some delicious chocolates in your cart. They are waiting for you!</p>
            <p>Complete your purchase now before they sell out.</p>
            <br/>
            <a href="https://ledamas.in/checkout" style="background-color: #c99339; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Return to Checkout</a>
            <br/><br/>
            <p>Best regards,<br/>LE DAMAS Team</p>
          </div>
        `;

        // Send email
        const success = await NotificationService.sendEmail(
          cart.email,
          'Your LE DAMAS Cart is Waiting 🍫',
          emailHtml,
          cart.userId || undefined,
          undefined,
          'ABANDONED_CART'
        );

        if (success) {
          // Mark as abandoned so we don't email them again
          await prisma.cart.update({
            where: { id: cart.id },
            data: { status: 'ABANDONED' },
          });
        }
      }
    } catch (error) {
      console.error('[CRON ERROR] Failed to process abandoned carts:', error);
    }
  });

  console.log('[CRON] Abandoned Cart Job initialized.');
};
