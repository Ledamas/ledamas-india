import { prisma } from '../config/db';

/**
 * eKart / Shiprocket / Delhivery Shipping Integration Stub
 * 
 * Instructions:
 * When you receive your merchant API credentials from your logistics provider,
 * fill out this file to automate AWB generation.
 */

const SHIPPING_API_URL = process.env.SHIPPING_API_URL || 'https://api.shiprocket.in/v1/external';
const SHIPPING_API_KEY = process.env.SHIPPING_API_KEY || '';

export const createShippingOrder = async (orderId: string) => {
  if (!SHIPPING_API_KEY) {
    console.log(`[SHIPPING] Missing API Key. Skipping automated AWB generation for Order ${orderId}`);
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error('Order not found');

  try {
    // Example: Sending payload to aggregator
    /*
    const payload = {
      order_id: order.orderNumber,
      order_date: order.createdAt,
      billing_customer_name: order.customerName,
      billing_email: order.email,
      billing_phone: order.phone,
      billing_address: order.street,
      billing_city: order.city,
      billing_state: order.state,
      billing_pincode: order.pincode,
      shipping_is_billing: true,
      order_items: order.items.map(i => ({
        name: i.productName,
        sku: i.productId,
        units: i.quantity,
        selling_price: i.price,
      })),
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.baseOrderTotal,
      length: 10, breadth: 10, height: 10, weight: 1.5,
    };

    const response = await axios.post(`${SHIPPING_API_URL}/orders/create/adco`, payload, {
      headers: { Authorization: `Bearer ${SHIPPING_API_KEY}` }
    });

    const awbNumber = response.data.awb_code;
    const courierName = response.data.courier_name;
    const trackingUrl = `https://track.ledamas.in/${awbNumber}`;

    // Update DB with AWB
    await prisma.order.update({
      where: { id: orderId },
      data: {
        awbNumber,
        courierPartner: courierName,
        trackingUrl
      }
    });
    
    return { awbNumber, trackingUrl };
    */
    
    return null;
  } catch (error) {
    console.error('[SHIPPING] Error creating AWB:', error);
    throw error;
  }
};
