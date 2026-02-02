import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight middleware that checks for session token cookie
// Heavy auth validation happens in API routes and server components
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define route types
  const isPublicRoute = pathname === "/" || pathname === "/login";
  const isApiRoute = pathname.startsWith("/api");
  const isStaticAsset = 
    pathname.startsWith("/_next") || 
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  // Allow static assets and API routes
  if (isStaticAsset || isApiRoute) {
    return NextResponse.next();
  }

  // Check for auth session cookie (NextAuth uses this naming convention)
  const sessionToken = 
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isAuthenticated = !!sessionToken;

  // Redirect authenticated users away from login
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
