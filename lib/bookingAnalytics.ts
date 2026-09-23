type BookingFormType = "appointment" | "callback" | "family_declaration";

type BookingSuccessEvent = {
  event: "booking_success";
  form_type: BookingFormType;
};

// References are used only for in-memory deduplication, never sent to analytics.
const reportedReferences = new Set<string>();

/** Call only after the booking API confirms a saved request, never on submit/click. */
export function trackBookingSuccess(reference: string, formType: BookingFormType) {
  if (typeof window === "undefined" || !reference.trim() || reportedReferences.has(reference)) return;

  try {
    const analyticsWindow = window as Window & { dataLayer?: { push: (event: BookingSuccessEvent) => unknown } };
    const dataLayer = analyticsWindow.dataLayer ??= [] as BookingSuccessEvent[];
    // Mark before push: GTM processes the event synchronously and must not re-enter it.
    reportedReferences.add(reference);
    dataLayer.push({ event: "booking_success", form_type: formType });
  } catch {
    // Analytics must never turn a saved booking into a visible submission error.
  }
}
