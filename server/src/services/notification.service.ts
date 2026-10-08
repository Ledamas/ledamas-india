import { prisma, withDbRetry } from '../config/db.js';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import nodemailer from 'nodemailer';

// Nodemailer SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // e.g. info@ledamas.in
    pass: process.env.SMTP_PASS, // Your email password
  },
});

const emailFrom = process.env.EMAIL_FROM || '"Le Damas" <hr@ledamas.in>';

export class NotificationService {
  /**
   * Create and send SMS
   */
  static async sendSMS(
    recipient: string,
    message: string,
    userId?: string,
    orderId?: string,
    type: string = 'GENERAL'
  ) {
    try {
      const notification = await withDbRetry(() =>
        prisma.notification.create({
          data: {
            channel: NotificationChannel.SMS,
            status: NotificationStatus.PENDING,
            recipient,
            message,
            userId,
            orderId,
            type,
          },
        })
      );

      // Actually send SMS using Message Central
      const providerResponse = await this._sendViaMessageCentral(recipient, message);

      const success = providerResponse && (providerResponse.status === 'success' || providerResponse.messageId);

      // Update DB record
      await withDbRetry(() =>
        prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: success ? NotificationStatus.DELIVERED : NotificationStatus.FAILED,
            providerMessageId: providerResponse?.messageId || null,
            sentAt: success ? new Date() : null,
            deliveredAt: success ? new Date() : null,
          },
        })
      );

      return success;
    } catch (error) {
      console.error('[NotificationService] SMS sending failed:', error);
      return false;
    }
  }

  /**
   * Create and send Email
   */
  static async sendEmail(
    recipient: string,
    subject: string,
    message: string,
    userId?: string,
    orderId?: string,
    type: string = 'GENERAL'
  ) {
    try {
      const notification = await withDbRetry(() =>
        prisma.notification.create({
          data: {
            channel: NotificationChannel.EMAIL,
            status: NotificationStatus.PENDING,
            recipient,
            message,
            userId,
            orderId,
            type,
          },
        })
      );

      // Send email using Nodemailer
      const providerResponse = await transporter.sendMail({
        from: emailFrom,
        to: recipient,
        subject: subject,
        html: message,
      });

      const success = !!providerResponse.messageId;

      // Update DB record
      await withDbRetry(() =>
        prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: success ? NotificationStatus.DELIVERED : NotificationStatus.FAILED,
            providerMessageId: providerResponse.messageId || null,
            sentAt: success ? new Date() : null,
            deliveredAt: success ? new Date() : null,
          },
        })
      );

      return success;
    } catch (error) {
      console.error('[NotificationService] Email sending failed:', error);
      return false;
    }
  }

  /**
   * Message Central API Implementation
   */
  private static async _sendViaMessageCentral(phone: string, message: string) {
    const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;
    const authKey = process.env.MESSAGE_CENTRAL_AUTH_KEY;
    const senderId = process.env.SMS_SENDER_ID || 'LDAMAS';

    if (!customerId || !authKey) {
      console.warn('Message Central API keys missing. Skipping actual SMS sending.');
      return { status: 'success', messageId: 'mock-sms-' + Date.now() };
    }

    try {
      // Step 1: Get Auth Token (Assuming they use OAuth/Token flow, or similar)
      const tokenUrl = `https://cpaas.messagecentral.com/auth/v1/authentication/token?country=IN&customerId=${customerId}&key=${authKey}&scope=NEW`;

      const tokenRes = await fetch(tokenUrl, { method: 'GET' });
      const tokenData: any = await tokenRes.json();
      const token = tokenData?.token;

      if (!token) throw new Error('Failed to fetch SMS auth token');

      // Step 2: Send SMS
      // Formatting phone: remove +, keep digits
      const formattedPhone = phone.replace(/\\D/g, '');
      const sendUrl = `https://cpaas.messagecentral.com/smsgw/v1/sms/send`;

      const sendRes = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerId,
          message,
          mobileNumber: formattedPhone,
          senderId,
          // We can pass DLT Template ID here if needed later
        })
      });

      const result: any = await sendRes.json();
      return {
        status: result.status || (sendRes.ok ? 'success' : 'failed'),
        messageId: result.messageId || result.id || 'mc-' + Date.now()
      };
    } catch (error) {
      console.error('Error in Message Central integration:', error);
      return { status: 'failed' };
    }
  }
}
