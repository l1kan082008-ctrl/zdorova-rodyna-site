import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./release-2026-09-04.css";
import "./booking.css";
import "./overlays.css";
import "./search-improvements.css";
import "./close-controls.css";
import "./service-banners.css";
import "./page-spacing.css";
import "./mobile-safe-area.css";
import { MobileOverlayChrome } from "./components/MobileOverlayChrome";
import { Suspense } from "react";
import { BookingLauncher } from "./components/BookingLauncher";
import { GlobalCalculator } from "./components/GlobalCalculator";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ||
    requestHeaders.get("host") ||
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Здорова Родина — медичний центр";
  const description =
    "Сучасна діагностика, власна лабораторія та досвідчені лікарі для всієї родини.";

  return {
    title,
    description,
    icons: {
      icon: [
        {
          url: "/favicon.svg?v=2",
          type: "image/svg+xml",
          sizes: "any",
        },
      ],
      shortcut: "/favicon.svg?v=2",
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1200,
          height: 630,
          alt: "Здорова Родина — здорове майбутнє",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body><MobileOverlayChrome />{children}<Suspense fallback={null}><BookingLauncher /><GlobalCalculator /></Suspense></body>
    </html>
  );
}
