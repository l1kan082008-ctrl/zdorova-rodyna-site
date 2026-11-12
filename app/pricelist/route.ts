import { NextResponse } from "next/server";

export function GET(request: Request) {
  // Legacy category IDs have no reliable mapping to the current price catalog.
  return NextResponse.redirect(new URL("/prices", request.url), 308);
}
