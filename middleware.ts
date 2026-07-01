import { NextResponse } from "next/server";

export default function middleware(req) {
  const { pathname } = req.nextUrl;
  const url = new URL(req.url);
  const errorCode = url.searchParams.get("error");

  const token = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");

  // Redirect logged-in users away from the login page
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url)); // Redirect to home page
  }
  if (errorCode && ["400", "401", "402", "410", "420", "500", "502"].includes(errorCode)) {
    return NextResponse.redirect(new URL(`/${errorCode}`, req.url));
  }
  return NextResponse.next();
}

// Protect these routes
export const config = {
  matcher: ["/login"], // Apply middleware here
};
