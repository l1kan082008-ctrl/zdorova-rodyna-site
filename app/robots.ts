import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        // These public media redirects are used by visible photos and banners.
        "/api/doctors/photo",
        "/api/services/image",
        "/api/banners/image",
      ],
      disallow: ["/admin", "/api/"],
    },
    sitemap: "https://zdorovarodynaplus.com.ua/sitemap.xml",
  };
}
