import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get("laural_access_token")?.value;
  let role = "PUBLIC_USER";
  let isExpired = false;

  if (token) {
    const payload = decodeJwt(token);
    if (payload) {
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        isExpired = true;
      } else if (payload.roles && payload.roles.length > 0) {
        role = payload.roles[0];
      }
    }
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isBranchAdminRoute = pathname.startsWith("/branch-admin");
  const isPosRoute = pathname.startsWith("/pos");
  const isAccountRoute = pathname.startsWith("/account");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Feature Flag: POS feature disabled
  const isPosDisabled = process.env.NEXT_PUBLIC_ENABLE_POS !== "true";
  const isPosSpecificRoute =
    pathname.startsWith("/pos") ||
    pathname.startsWith("/admin/pos-sales") ||
    pathname.startsWith("/admin/reports/pos");

  if (isPosSpecificRoute && isPosDisabled) {
    const targetUrl = new URL("/admin", request.url);
    targetUrl.searchParams.set("notice", "pos_disabled");
    return NextResponse.redirect(targetUrl);
  }

  // Feature Flag: Multi-branch admin management disabled (only active for e-commerce website orders)
  const isMultiBranchDisabled = process.env.NEXT_PUBLIC_ENABLE_MULTI_BRANCH !== "true";
  const isBranchAdminSpecificRoute =
    pathname.startsWith("/admin/branches") ||
    pathname.startsWith("/admin/reports/branches") ||
    pathname.startsWith("/branch-admin");

  if (isBranchAdminSpecificRoute && isMultiBranchDisabled) {
    const targetUrl = new URL("/admin", request.url);
    targetUrl.searchParams.set("notice", "branches_disabled");
    return NextResponse.redirect(targetUrl);
  }

  const isStaffRoute = isAdminRoute || isBranchAdminRoute || isPosRoute;

  // 1. Unauthenticated or expired user trying to access protected routes
  if (isStaffRoute || isAccountRoute) {
    if (!token || isExpired) {
      // All users log in through the same /login page
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      // Clear invalid cookies if expired
      const response = NextResponse.redirect(loginUrl);
      if (isExpired) {
        response.cookies.delete("laural_access_token");
        response.cookies.delete("laural_refresh_token");
      }
      return response;
    }
  }

  // 2. Strict isolation: PUBLIC_USER attempting to access Admin, Branch Admin, or POS routes
  if (isStaffRoute && token && !isExpired) {
    const isPublicUser = role === "PUBLIC_USER" || role === "Public User" || role.toUpperCase() === "CUSTOMER";
    if (isPublicUser) {
      // Forbidden: redirect to customer account area
      const forbiddenUrl = new URL("/account", request.url);
      forbiddenUrl.searchParams.set("error", "unauthorized_area");
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // 3. Authenticated user visiting /login
  if (isAuthRoute && token && !isExpired) {
    const isPublicUser = role === "PUBLIC_USER" || role === "Public User";
    const redirectTarget = isPublicUser ? "/account" : "/admin";
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/branch-admin/:path*",
    "/pos/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
