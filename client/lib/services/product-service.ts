import { fetchApi } from '../api-client';
import { PRODUCTS, getProductBySlug } from '../products';
import { Product } from '../types';

export async function getProductsFromDb(params?: {
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.featured) query.append('featured', 'true');

    const queryString = query.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    const data = await fetchApi<Product[]>(endpoint);
    return data && data.length > 0 ? data : PRODUCTS;
  } catch (error) {
    console.warn('[DB FETCH FALLBACK] Failed to fetch products from backend API, using local catalogue fallback.', error);
    return PRODUCTS;
  }
}

export async function getProductBySlugFromDb(slug: string): Promise<Product | undefined> {
  try {
    const data = await fetchApi<Product>(`/products/${slug}`);
    return data;
  } catch (error) {
    console.warn(`[DB FETCH FALLBACK] Failed to fetch product ${slug} from backend API, using local catalogue fallback.`, error);
    return getProductBySlug(slug);
  }
}

export async function createOrderInDb(orderPayload: any) {
  try {
    return await fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
  } catch (error) {
    console.error('[DB ORDER ERROR] Failed to save order in backend database', error);
    throw error;
  }
}

/**
 * Initiate payment by sending cart items to the backend.
 * The backend fetches canonical prices from PostgreSQL and creates the Razorpay order.
 * Never sends frontend-computed prices or totals.
 */
export async function initiatePaymentApi(params: {
  items: Array<{ productId: string; variantId?: string | null; quantity: number; image?: string }>;
  paymentMethod: string;
  couponCode?: string | null;
  referralCode?: string | null;
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
}) {
  return await fetchApi('/orders/initiate-payment', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/**
 * Verify payment and create order.
 * Send cart items + payment IDs; never send frontend-computed prices.
 * The backend re-validates everything from the database.
 */
export async function verifyAndCreateOrderApi(verificationPayload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  customerName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<{ productId: string; variantId?: string | null; quantity: number; image?: string }>;
  paymentMethod: string;
  couponCode?: string | null;
  referralCode?: string | null;
  userId?: string;
}) {
  return await fetchApi('/orders/verify-and-create', {
    method: 'POST',
    body: JSON.stringify(verificationPayload),
  });
}

