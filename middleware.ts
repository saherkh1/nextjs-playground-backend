import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { JWTClaims, PlatformRole } from '@/lib/types';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/health',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
];

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/tenant',
  '/galleries',
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => 
    pathname.startsWith(route)
  );
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => 
    pathname.startsWith(route)
  ) || isAdminRoute(pathname);
}

function decodeToken(token: string): JWTClaims | null {
  try {
    const decoded = jwtDecode<JWTClaims>(token);
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

function hasRequiredRole(userRole: PlatformRole, requiredRole: PlatformRole): boolean {
  const roleHierarchy: Record<PlatformRole, number> = {
    USER: 1,
    TENANT_OWNER: 2,
    PLATFORM_ADMIN: 3,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get tokens from cookies or headers
  const accessToken = request.cookies.get('accessToken')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '');
  
  // If accessing public route
  if (isPublicRoute(pathname)) {
    // Redirect authenticated users away from auth pages
    if (accessToken && ['/login', '/register'].includes(pathname)) {
      const token = decodeToken(accessToken);
      if (token) {
        return NextResponse.redirect(new URL('/profile', request.url));
      }
    }
    
    return NextResponse.next();
  }
  
  // For protected routes, check authentication
  if (isProtectedRoute(pathname)) {
    if (!accessToken) {
      // No token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    const claims = decodeToken(accessToken);
    if (!claims) {
      // Invalid or expired token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check admin routes
    if (isAdminRoute(pathname)) {
      if (!hasRequiredRole(claims.platformRole, 'PLATFORM_ADMIN')) {
        // User doesn't have admin role, redirect to dashboard
        return NextResponse.redirect(new URL('/profile', request.url));
      }
    }
    
    // Add user context to headers for the request
    const response = NextResponse.next();
    response.headers.set('X-User-ID', claims.sub);
    response.headers.set('X-Tenant-ID', claims.tenantId);
    response.headers.set('X-User-Role', claims.platformRole);
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};