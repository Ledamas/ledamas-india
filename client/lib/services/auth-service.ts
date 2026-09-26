import { fetchApi } from '../api-client';

export interface UserSession {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: string;
  phoneVerified: boolean;
  createdAt: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: UserSession;
}

const TOKEN_KEY = 'ledamas_auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function sendOtpApi(phone: string): Promise<{ success: boolean; message: string }> {
  return fetchApi<{ success: boolean; message: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtpApi(phone: string, otp: string): Promise<VerifyOtpResponse> {
  const data = await fetchApi<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });

  if (data?.token) {
    setAuthToken(data.token);
    if (data?.user && typeof window !== 'undefined') {
      localStorage.setItem('ledamas_user', JSON.stringify(data.user));
    }
  }

  return data;
}

export async function googleAuthApi(payload: { credential?: string; email?: string; name?: string }): Promise<VerifyOtpResponse> {
  const data = await fetchApi<VerifyOtpResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (data?.token) {
    setAuthToken(data.token);
    if (data?.user && typeof window !== 'undefined') {
      localStorage.setItem('ledamas_user', JSON.stringify(data.user));
    }
  }

  return data;
}

export async function resendOtpApi(phone: string): Promise<{ success: boolean; message: string }> {
  return fetchApi<{ success: boolean; message: string }>('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function getCurrentUserApi(): Promise<UserSession | null> {
  const token = getAuthToken();

  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const data = await fetchApi<UserSession>('/auth/me', { headers });
    return data;
  } catch (error) {
    removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ledamas_user');
    }
    return null;
  }
}

export async function updateUserProfileApi(payload: { name?: string; phone?: string }): Promise<UserSession> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const data = await fetchApi<UserSession>('/auth/profile', {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  if (data && typeof window !== 'undefined') {
    localStorage.setItem('ledamas_user', JSON.stringify(data));
  }

  return data;
}

export async function logoutApi(): Promise<void> {
  try {
    await fetchApi('/auth/logout', { method: 'POST' });
  } finally {
    removeAuthToken();
  }
}
