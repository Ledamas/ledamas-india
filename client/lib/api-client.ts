export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // If running in a real browser on a live domain or remote IP:
    // Ignore 'localhost' if it was accidentally baked in during build
    if (!isLocalhost) {
      if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
        return configured.replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
      }
      // On live production domains, use same-origin (handled by Nginx or Next.js rewrites)
      return window.location.origin;
    }

    // Localhost development browser
    if (configured) {
      return configured.replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
    }
    return 'http://localhost:5000';
  }

  // Server-Side Rendering (SSR) context on AWS / Docker
  const internal = process.env.INTERNAL_API_URL?.trim();
  if (internal) {
    return internal.replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
  }

  // If configured with an external production domain, SSR can use it
  if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
    return configured.replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
  }

  // Production SSR fallback to local Express server instance
  return 'http://127.0.0.1:5000';
}

export function getApiV1BaseUrl(): string {
  return `${getApiBaseUrl()}/api/v1`;
}

const API_BASE_URL = getApiBaseUrl();

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const normalizedEndpoint = endpoint.startsWith('/api/v1')
    ? endpoint
    : `/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const url = `${baseUrl}${normalizedEndpoint}`;

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
