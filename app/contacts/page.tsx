import { listPublicLocations } from "../api/locations/publicLocations";
import { ContactsClient } from "./ContactsClient";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const locations = await listPublicLocations();
  return <ContactsClient locations={locations} />;
}
