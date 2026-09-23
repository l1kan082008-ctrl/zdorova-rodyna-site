"use client";

import { useEffect } from "react";
import { type BookingFormType, trackConfirmedBookingSubmit } from "@/lib/bookingAnalytics";

/** The reference is available only while the saved request's confirmation is rendered. */
export function useBookingConfirmation(reference: string, formType: BookingFormType) {
  useEffect(() => {
    if (reference) trackConfirmedBookingSubmit(reference, formType);
  }, [reference, formType]);
}
