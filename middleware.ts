import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard"];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/landing"];

// Public routes that don't require any auth check
const publicRoutes = ["/", "/landing", "/privacy-policy", "/terms"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the Privy token from cookies
  // Privy stores auth state in a cookie named 'privy-token'
  const privyToken = request.cookies.get("privy-token")?.value;
  const isAuthenticated = !!privyToken;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current path is an auth route (like /landing)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If trying to access protected route without auth, redirect to landing
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/landing", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If accessing root and authenticated, redirect to dashboard
  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files (images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts|icons|.*\\..*|_next).*)",
  ],
};