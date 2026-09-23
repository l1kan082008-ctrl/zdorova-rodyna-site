import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminCookie";

const contentSecurityPolicy = (analyticsEnabled: boolean) => [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com" +
    (analyticsEnabled ? " https://www.googletagmanager.com https://*.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.google.com" : ""),
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'" +
    (analyticsEnabled ? " https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com" : ""),
  "connect-src 'self' https://api.openai.com https://challenges.cloudflare.com" +
    (analyticsEnabled ? " https://www.googletagmanager.com https://*.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.google.com https://ad.doubleclick.net" : ""),
  "frame-src https://challenges.cloudflare.com https://www.google.com" +
    (analyticsEnabled ? " https://www.googletagmanager.com" : ""),
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

function applySecurityHeaders(response: NextResponse, isAdmin: boolean, analyticsEnabled = false) {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy(analyticsEnabled));
  response.headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=(self)");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  if (isAdmin) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
  }
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogin = pathname === "/admin/login";
  const analyticsEnabled = !isAdmin && pathname !== "/api" && !pathname.startsWith("/api/") && !pathname.startsWith("/_next/");

  if (isAdmin && !isLogin && !request.cookies.has(ADMIN_SESSION_COOKIE)) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return applySecurityHeaders(NextResponse.redirect(login), true);
  }

  // Overwrite incoming values: only the server decides which pages load analytics.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-public-analytics", analyticsEnabled ? "1" : "0");

  return applySecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    isAdmin || pathname.startsWith("/api/admin/"),
    analyticsEnabled,
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
