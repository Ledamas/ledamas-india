import { fetchApi } from '../api-client';

export interface DatabaseUserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isVIP: boolean;
  authProvider: string;
  lifetimeValue: number;
  totalOrders: number;
  lastOrderDate: string;
  createdAt: string;
}

export interface AdminAnalyticsData {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  liveVisitors: number;
}

export async function getAdminUsersApi(): Promise<{ count: number; users: DatabaseUserRecord[] }> {
  try {
    const res = await fetchApi<{ data: { count: number; users: DatabaseUserRecord[] } }>('/admin/users');
    return res.data || res;
  } catch (err) {
    return { count: 0, users: [] };
  }
}

export async function getAdminAnalyticsApi(): Promise<AdminAnalyticsData> {
  try {
    const res = await fetchApi<{ data: AdminAnalyticsData }>('/admin/analytics');
    return res.data || res;
  } catch (err) {
    return { totalCustomers: 0, totalOrders: 0, totalRevenue: 0, liveVisitors: 12 };
  }
}

export async function getAdminLiveVisitorsApi(): Promise<{ count: number; visitors: any[] }> {
  try {
    const res = await fetchApi<{ data: { count: number; visitors: any[] } }>('/admin/live-visitors');
    return res.data || res;
  } catch (err) {
    return { count: 0, visitors: [] };
  }
}

export async function getAdminOrdersApi(): Promise<{ count: number; orders: any[] }> {
  try {
    const res = await fetchApi<{ data: { count: number; orders: any[] } }>('/admin/orders');
    return res.data || res;
  } catch (err) {
    return { count: 0, orders: [] };
  }
}

export async function createAdminOrderApi(payload: any): Promise<any> {
  try {
    const res = await fetchApi<{ data: any }>('/admin/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data || res;
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to create order manually');
  }
}

export async function updateOrderStatusApi(orderId: string, orderStatus: string): Promise<any> {
  try {
    const res = await fetchApi<{ data: any }>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ orderStatus }),
    });
    return res.data || res;
  } catch (err) {
    return null;
  }
}

export async function processAdminRefundApi(orderId: string, amount: number, reason?: string): Promise<any> {
  try {
    const res = await fetchApi<{ data: any }>(`/admin/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
    return res.data || res;
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to process refund');
  }
}


export async function getAdminCouponsApi(): Promise<{ count: number; coupons: any[] }> {
  try {
    const res = await fetchApi<{ data: { count: number; coupons: any[] } }>('/admin/coupons');
    return res.data || res;
  } catch (err) {
    return { count: 0, coupons: [] };
  }
}

export async function createAdminCouponApi(payload: any): Promise<any> {
  try {
    const res = await fetchApi<{ data: any }>('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data || res;
  } catch (err) {
    return null;
  }
}

export async function deleteAdminCouponApi(couponId: string): Promise<any> {
  try {
    const res = await fetchApi<{ data: any }>(`/admin/coupons/${couponId}`, {
      method: 'DELETE',
    });
    return res.data || res;
  } catch (err) {
    return null;
  }
}

export async function getAdminReferralsApi(): Promise<{ count: number; referrals: any[] }> {
  try {
    const res = await fetchApi<{ data: { count: number; referrals: any[] } }>('/admin/referrals');
    return res.data || res;
  } catch (err) {
    return { count: 0, referrals: [] };
  }
}

export async function createAdminReferralApi(payload: any): Promise<any> {
  try {
    const res = await fetchApi<{ data: any }>('/admin/referrals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data || res;
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to create referral code');
  }
}

export async function deleteAdminReferralApi(referralId: string): Promise<any> {
  try {
    const res = await fetchApi<{ data: any }>(`/admin/referrals/${referralId}`, {
      method: 'DELETE',
    });
    return res.data || res;
  } catch (err) {
    return null;
  }
}


export interface LiveViewAnalyticsData {
  visitorsRightNow: number;
  totalSales: number;
  sessionsCount: number;
  sessionsChangePct: string;
  ordersCount: number;
  customerBehavior: {
    activeCarts: number;
    checkingOut: number;
    purchased: number;
  };
  sessionsByLocation: Array<{
    country: string;
    state: string;
    city: string;
    count: number;
  }>;
  newVsReturning: {
    new: number;
    returning: number;
  };
  totalSalesByProduct: Array<{
    name: string;
    totalRevenue: number;
    quantitySold: number;
    image?: string;
  }>;
  liveAuditStream: Array<any>;
  mapPoints: Array<any>;
  timestamp: string;
}

export async function getLiveViewAnalyticsApi(range: string = '30d'): Promise<LiveViewAnalyticsData | null> {
  try {
    const res = await fetchApi<{ data: LiveViewAnalyticsData }>(`/analytics/live-view?range=${range}`);
    return res.data || res;
  } catch (err) {
    return null;
  }
}

export async function getAdminMarketingGrowthApi(range: string = '200d'): Promise<any> {
  try {
    const res = await fetchApi<{ data: any }>(`/analytics/marketing-growth?range=${range}`);
    return res.data || res;
  } catch (err) {
    return null;
  }
}

export async function getAdminInventoryApi(): Promise<{ count: number; inventory: any[] }> {
  try {
    const res = await fetchApi<{ data: { count: number; inventory: any[] } }>('/admin/inventory');
    return res.data || res;
  } catch (err) {
    return { count: 0, inventory: [] };
  }
}

export async function createAdminInventoryBatchApi(payload: any): Promise<any> {
  try {
    const res = await fetchApi<{ data: any }>('/admin/inventory/batch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data || res;
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to create inventory batch');
  }
}

export async function updateAdminInventoryStockApi(id: string, payload: any): Promise<any> {
  try {
    const res = await fetchApi<{ data: any }>(`/admin/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data || res;
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to update stock level');
  }
}



export async function getAdminPopupSubscribersApi(): Promise<{ count: number; subscribers: any[] }> {
  try {
    const res = await fetchApi<{ data: { count: number; subscribers: any[] } }>('/admin/popup-subscribers');
    return res.data || res;
  } catch (err) {
    return { count: 0, subscribers: [] };
  }
}
