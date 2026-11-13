import "server-only";

import { centerLocations } from "../../contacts/locationData";
import { isInformationOnlyLocation } from "../../../lib/locationPolicy";
import { listLocations } from "./locationStore";

export async function listPublicLocations() {
  // Keep the API's existing database-free development preview. Production
  // always reads the published catalogue; failures must not expose stale data.
  if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL?.trim()) {
    return centerLocations;
  }
  return (await listLocations()).filter(location => !isInformationOnlyLocation(location));
}
