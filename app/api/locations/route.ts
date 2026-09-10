import { listLocations } from "./locationStore";
import { centerLocations } from "../../contacts/locationData";
import { stelmakhaGallery } from "../../contacts/stelmakhaGallery";

export async function GET() {
  // Local previews can read the bundled catalogue without a database.
  // Configured databases and production must still surface real failures.
  if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL?.trim()) {
    return Response.json({ locations: centerLocations }, {
      headers: { "cache-control": "no-store" },
    });
  }
  try {
    const locations = (await listLocations()).map((location) => {
      // Upgrade the original seeded cover; keep galleries edited in admin intact.
      const legacyCover = location.gallery.length === 1 &&
        /^\/locations\/stelmakha-18m\.(png|webp)$/.test(location.gallery[0].src);
      return location.id === "stelmakha-18m" && legacyCover
        ? { ...location, gallery: stelmakhaGallery }
        : location;
    });
    return Response.json({ locations });
  } catch (error) {
    const incidentId = crypto.randomUUID();
    console.error(JSON.stringify({
      event: "public_locations_load_failed",
      incidentId,
      error: error instanceof Error ? error.message : "unknown",
    }));
    return Response.json(
      { error: "Не вдалося завантажити відділення.", incidentId },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
