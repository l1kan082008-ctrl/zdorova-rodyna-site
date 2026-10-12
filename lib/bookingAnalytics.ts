export type BookingFormType = "appointment" | "callback" | "family_declaration";

type ConfirmedBookingSubmitEvent = {
  event: "form_submit";
  form_type: BookingFormType;
};

type BookingFormOpenEvent = {
  event: "booking_form_open";
  form_type: "appointment";
};

// The object identifies one visible dialog session only and is never transmitted.
const reportedOpenings = new WeakSet<object>();

/** Call only after the appointment dialog has committed to the page. */
export function trackBookingFormOpen(opening: object) {
  if (typeof window === "undefined" || reportedOpenings.has(opening)) return;

  try {
    const analyticsWindow = window as Window & { dataLayer?: { push: (event: BookingFormOpenEvent) => unknown } };
    const dataLayer = analyticsWindow.dataLayer ??= [] as BookingFormOpenEvent[];
    // Also protects against StrictMode effect replay and synchronous GTM re-entry.
    reportedOpenings.add(opening);
    dataLayer.push({ event: "booking_form_open", form_type: "appointment" });
  } catch {
    // Analytics must never prevent opening or using the booking form.
  }
}

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
