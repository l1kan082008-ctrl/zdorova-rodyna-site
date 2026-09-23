import type { FormEvent, MouseEvent } from "react";

/** Button activation includes the browser's implicit Enter-key activation. */
export function submitBookingFromClick(
  event: MouseEvent<HTMLButtonElement>,
  submit: (form: HTMLFormElement) => Promise<void>,
) {
  // Cancel the native submission before document-level analytics can observe it.
  event.preventDefault();
  const form = event.currentTarget.form;
  if (!form || !form.reportValidity()) return;
  return submit(form);
}

export function preventNativeBookingSubmit(event: FormEvent<HTMLFormElement>) {
  // The request runs only through validated button activation, never a submit listener.
  event.preventDefault();
}
