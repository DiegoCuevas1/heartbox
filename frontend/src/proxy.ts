import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pages that need a signed-in user. This is only a fast redirect for the UI;
// the API enforces access on every request.
export function proxy(request: NextRequest) {
  if (!request.cookies.get("sessionid")) {
    const signIn = new URL("/auth/sign-in", request.url);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/timeline/:path*",
    "/families/:path*",
    "/categories/:path*",
    "/profile/:path*",
    "/posts/:path*",
    "/create-post/:path*",
    "/notifications/:path*",
    "/search/:path*",
  ],
};
