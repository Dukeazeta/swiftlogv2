import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname === "/login";
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnOnboarding = req.nextUrl.pathname === "/onboarding";
  const isOnApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isOnPublicPage = req.nextUrl.pathname === "/";

  // Allow API routes to pass through
  if (isOnApiRoute) {
    return NextResponse.next();
  }

  // Allow public landing page
  if (isOnPublicPage) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from login page
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect non-logged-in users to login
  if (!isLoggedIn && (isOnDashboard || isOnOnboarding)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
