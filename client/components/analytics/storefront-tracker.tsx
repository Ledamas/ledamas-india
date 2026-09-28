'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Cookie helper functions
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return matches ? decodeURIComponent(matches[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

// Generate or retrieve visitor_id (1 year expiry)
export function getOrCreateVisitorId(): string {
  let vid = getCookie('ld_vid');
  if (!vid && typeof window !== 'undefined') {
    vid = localStorage.getItem('ld_vid');
  }
  if (!vid) {
    vid = `v_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  }
  setCookie('ld_vid', vid, 365);
  if (typeof window !== 'undefined') {
    localStorage.setItem('ld_vid', vid);
  }
  return vid;
}

// Generate or retrieve session_id (30 min inactivity timeout)
export function getOrCreateSessionId(): string {
  let sid = getCookie('ld_sid');
  if (!sid && typeof window !== 'undefined') {
    sid = sessionStorage.getItem('ld_sid');
  }
  if (!sid) {
    sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  }
  // Reset 30 min expiration on activity
  setCookie('ld_sid', sid, 0.02083); // ~30 minutes
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('ld_sid', sid);
  }
  return sid;
}

// Send event to backend tracking API
export async function trackStorefrontEvent(eventType: string, extraData: Record<string, any> = {}) {
  try {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname;

    // Do NOT track admin pages or admin panel logins
    if (pathname.startsWith('/admin')) return;

    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();

    const payload = {
      visitorId,
      sessionId,
      eventType,
      page: pathname,
      referrer: document.referrer || '',
      utmSource: new URLSearchParams(window.location.search).get('utm_source') || '',
      ...extraData,
    };

    await fetch(`${API_BASE_URL}/api/v1/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Fail silently in background
  }
}

export function StorefrontTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Do not track admin users/pages
    if (!pathname || pathname.startsWith('/admin')) return;

    // 1. Send page_view on route load
    trackStorefrontEvent('page_view');

    // 2. Setup Heartbeat every 20 seconds while tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !window.location.pathname.startsWith('/admin')) {
        trackStorefrontEvent('heartbeat');
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
