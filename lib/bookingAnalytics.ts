export type BookingFormType = "appointment" | "callback" | "family_declaration";

type ConfirmedBookingSubmitEvent = {
  event: "form_submit";
  form_type: BookingFormType;
};

// References are used only for in-memory deduplication, never sent to analytics.
const reportedReferences = new Set<string>();

/** Call after the saved request's confirmation has committed, never on submit/click. */
export function trackConfirmedBookingSubmit(reference: string, formType: BookingFormType) {
  if (typeof window === "undefined" || !reference.trim() || reportedReferences.has(reference)) return;

  try {
    const analyticsWindow = window as Window & { dataLayer?: { push: (event: ConfirmedBookingSubmitEvent) => unknown } };
    const dataLayer = analyticsWindow.dataLayer ??= [] as ConfirmedBookingSubmitEvent[];
    // Mark before push: GTM processes the event synchronously and must not re-enter it.
    reportedReferences.add(reference);
    dataLayer.push({ event: "form_submit", form_type: formType });
  } catch {
    // Analytics must never turn a saved booking into a visible submission error.
  }
}
