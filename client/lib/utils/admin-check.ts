/**
 * Utility to reliably detect if the current execution context is the Admin Panel.
 * Handles:
 * - Subdomain access (e.g., admin.ledamas.in, admin.localhost:3000)
 * - Path-based access (/admin, /admin/*)
 * - DOM inspection (admin-root element)
 */

export function isAdminRoute(pathname?: string | null): boolean {
  // 1. Check provided pathname
  if (pathname) {
    const p = pathname.toLowerCase();
    if (p === '/admin' || p.startsWith('/admin/') || p.startsWith('/admin')) {
      return true;
    }
  }

  // 2. Client-side browser checks
  if (typeof window !== 'undefined') {
    const currentPath = (window.location.pathname || '').toLowerCase();
    if (currentPath === '/admin' || currentPath.startsWith('/admin/') || currentPath.startsWith('/admin')) {
      return true;
    }

    const host = (window.location.hostname || window.location.host || '').toLowerCase();
    if (host.startsWith('admin.') || host.includes('admin.')) {
      return true;
    }

    // Check for admin marker in DOM
    if (document.getElementById('admin-root') || document.querySelector('[data-admin-panel="true"]')) {
      return true;
    }
  }

  return false;
}
