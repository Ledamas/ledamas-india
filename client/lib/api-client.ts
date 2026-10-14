export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return window.location.origin;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }

  return 'https://www.ledamas.in';
}

const API_BASE_URL = getApiBaseUrl();

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/api/v1')
    ? endpoint
    : `/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const isAdminRoute = endpoint.startsWith('/admin') || endpoint.startsWith('admin');
  const tokenKey = isAdminRoute ? 'ledamas_admin_session' : 'ledamas_auth_token';
  const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `API Request failed with status ${response.status}`);
    }

    return data.data ?? data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to backend server. Check NEXT_PUBLIC_API_URL and backend availability.');
    }
    throw error;
  }
}

export { API_BASE_URL };
