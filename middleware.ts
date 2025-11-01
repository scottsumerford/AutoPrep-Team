import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle authentication and route protection
 * 
 * Public routes that don't require authentication:
 * - /api/lindy/* (webhook endpoints for Lindy agents)
 * - /api/health (health check)
 * - /api/auth/* (authentication endpoints)
 */

const publicRoutes = [
  '/api/lindy',
  '/api/health',
  '/api/auth',
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a public route, allow it through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, you can add additional authentication logic here
  // For now, we'll just allow all requests through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
