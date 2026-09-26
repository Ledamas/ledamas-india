export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '981686768203314';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Fire PageView event on route changes
 */
export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Fire custom or standard Meta Pixel events
 * Example events: 'AddToCart', 'InitiateCheckout', 'Purchase', 'ViewContent', 'Search'
 */
export const event = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options);
  }
};

/**
 * Track AddToCart event
 */
export const trackAddToCart = (product: {
  id?: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}) => {
  event('AddToCart', {
    content_name: product.name,
    content_ids: product.id ? [product.id] : [],
    content_type: 'product',
    value: product.price * (product.quantity || 1),
    currency: 'INR',
  });
};

/**
 * Track InitiateCheckout event
 */
export const trackInitiateCheckout = (cartItems: any[], totalValue: number) => {
  event('InitiateCheckout', {
    content_type: 'product',
    content_ids: cartItems.map(item => item.id || item.slug || item.name),
    num_items: cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0),
    value: totalValue,
    currency: 'INR',
  });
};

/**
 * Track Purchase event
 */
export const trackPurchase = (orderData: {
  orderId?: string;
  paymentId?: string;
  value: number;
  items?: any[];
}) => {
  event('Purchase', {
    content_type: 'product',
    value: orderData.value,
    currency: 'INR',
    order_id: orderData.orderId || orderData.paymentId || '',
    num_items: orderData.items ? orderData.items.reduce((acc, item) => acc + (item.quantity || 1), 0) : 1,
  });
};
