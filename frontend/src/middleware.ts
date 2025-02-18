import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the path
  const path = request.nextUrl.pathname;

  // Define protected routes
  const protectedRoutes = [
    "/families",
    "/timeline",
    "/categories",
    "/profile",
    "/auth/sign-in",
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  // Get auth cookie
  const authCookie = request.cookies.get("sessionid");

  // If it's a protected route and there's no auth cookie
  if (isProtectedRoute && !authCookie) {
    // Redirect to sign in page
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/families/:path*",
    "/timeline/:path*",
    "/categories/:path*",
    "/profile/:path*",
  ],
};
