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
import { Suspense } from "react";
import { BookingLauncher } from "./components/BookingLauncher";
import { GlobalCalculator } from "./components/GlobalCalculator";
import { SiteSettingsProvider } from "./components/SiteSettingsProvider";
import { getSiteSettings } from "./api/settings/settingsStore";

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
  const [settings, requestHeaders] = await Promise.all([getSiteSettings(), headers()]);
  const analyticsEnabled = requestHeaders.get("x-public-analytics") === "1";

  return (
    <html lang="uk">
      <head>
        {analyticsEnabled && (
          // Keep the supplied bootstrap in the initial head, before hydration.
          // eslint-disable-next-line @next/next/next-script-for-ga
          <script
            id="google-tag-manager"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KB6VQTKM');`,
            }}
          />
        )}
      </head>
      <body>
        {analyticsEnabled && (
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-KB6VQTKM"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        <SiteSettingsProvider settings={settings}>
          {children}
          <Suspense fallback={null}><BookingLauncher /><GlobalCalculator /></Suspense>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
