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

export async function initiatePaymentApi(orderTotal: number, paymentMethod: string) {
  return await fetchApi('/orders/initiate-payment', {
    method: 'POST',
    body: JSON.stringify({ orderTotal, paymentMethod }),
  });
}

export async function verifyAndCreateOrderApi(verificationPayload: any) {
  return await fetchApi('/orders/verify-and-create', {
    method: 'POST',
    body: JSON.stringify(verificationPayload),
  });
}
