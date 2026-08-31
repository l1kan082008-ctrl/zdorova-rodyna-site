/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { verifyAdminRequest } from "../lib/adminSession";

type WorkerEnv = Cloudflare.Env & {
  ADMIN_SESSION_SECRET?: string;
  OPENAI_API_KEY?: string;
  PUBLIC_FORM_RATE_LIMIT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
};

function withSecurityHeaders(request: Request, response: Response) {
  const headers = new Headers(response.headers);
  const pathname = new URL(request.url).pathname;
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "DENY");
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https://api.openai.com https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com https://www.openstreetmap.org",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; "),
  );
  headers.set(
    "Permissions-Policy",
    pathname === "/admin/ai-operator"
      ? "camera=(), geolocation=(), microphone=(self), payment=(), usb=(), browsing-topics=()"
      : "camera=(), geolocation=(), microphone=(), payment=(), usb=(), browsing-topics=()",
  );
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    headers.set("Cache-Control", "no-store, max-age=0");
    headers.set("Pragma", "no-cache");
    headers.set("Cross-Origin-Opener-Policy", "same-origin");
    headers.set("Cross-Origin-Resource-Policy", "same-origin");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (
      url.pathname.startsWith("/admin") &&
      url.pathname !== "/admin/login" &&
      !(await verifyAdminRequest(request, env.ADMIN_SESSION_SECRET, env.DB))
    ) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", `${url.pathname}${url.search}`);
      return withSecurityHeaders(request, Response.redirect(loginUrl, 302));
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const response = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return withSecurityHeaders(request, response);
    }

    const response = await handler.fetch(request, env, ctx);
    return withSecurityHeaders(request, response);
  },
};

export default worker satisfies ExportedHandler<WorkerEnv>;
