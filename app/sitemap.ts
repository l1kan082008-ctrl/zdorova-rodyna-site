import type { MetadataRoute } from "next";
import { listPublicDoctors } from "./api/doctors/publicDoctors";
import { serviceDetails } from "./services/serviceData";

// Refresh doctor URLs when administrators add or hide public profiles.
export const dynamic = "force-dynamic";

const origin = "https://zdorovarodynaplus.com.ua";
const publicPaths = [
  "/",
  "/about",
  "/services",
  "/doctors",
  "/prices",
  "/contacts",
  "/patients",
  "/patients/preparation",
  "/patients/faq",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // This loader omits doctors on a production database outage instead of restoring
  // bundled profiles that may have been hidden by an administrator.
  const doctors = await listPublicDoctors();
  const paths = [
    ...publicPaths,
    ...serviceDetails.map((service) => `/services/${service.slug}`),
    ...doctors
      .filter((doctor) => doctor.isActive !== false)
      .map((doctor) => `/doctors/${encodeURIComponent(doctor.id)}`),
  ];

  return [...new Set(paths)].map((path) => ({ url: `${origin}${path}` }));
}
