import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PATHS = [
  "/dashboard",
  "/products",
  "/categories",
  "/orders",
  "/customers",
  "/suppliers",
  "/reports",
  "/settings",
];
const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/verify-email"];
const CUSTOMER_PATHS = ["/profile", "/wishlist", "/addresses"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Firebase session cookie (set by Firebase Auth persistence)
  const token =
    request.cookies.get("__session")?.value ||
    request.cookies.get("auth_token")?.value;

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isCustomerPath = CUSTOMER_PATHS.some((p) => pathname.startsWith(p));

  // Redirect logged-in users away from auth pages
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect admin & customer paths — client AuthGuard handles role check
  if ((isAdminPath || isCustomerPath) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/categories/:path*",
    "/orders/:path*",
    "/customers/:path*",
    "/suppliers/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/wishlist/:path*",
    "/addresses/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
  ],
};
