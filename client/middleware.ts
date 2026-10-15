import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Detect admin subdomain: e.g. admin.ledamas.in, admin.localhost:3000
  const isAdminSubdomain = host.startsWith('admin.');

  if (isAdminSubdomain) {
    // If accessing root of admin subdomain (e.g. https://admin.ledamas.in/),
    // internally rewrite to /admin without changing the browser URL
    if (url.pathname === '/') {
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }

    // If user accesses /admin on the admin subdomain (e.g. admin.ledamas.in/admin),
    // redirect to clean root (admin.ledamas.in/)
    if (url.pathname === '/admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals, static files)
     * 3. Static asset files (.ico, .png, .jpg, .svg, .css, .js, .txt, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)',
  ],
};
