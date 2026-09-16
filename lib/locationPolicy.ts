import type { CenterLocation } from "../app/contacts/locationData";

export function isInformationOnlyLocation(location: Pick<CenterLocation, "id" | "city">) {
  return location.id === "brody-zaliznychna-37b" || location.city.trim().toLocaleLowerCase("uk-UA") === "броди";
}
