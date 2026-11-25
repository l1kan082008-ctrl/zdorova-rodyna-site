import { randomInt } from "node:crypto";

export function generateBookingReference() {
  return `MC-${randomInt(10_000, 100_000)}`;
}
