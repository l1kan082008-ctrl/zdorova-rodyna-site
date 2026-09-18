"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type ModalDialogOptions = {
  open: boolean;
  dialogRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  restoreFocusRef?: RefObject<HTMLElement | null>;
};

type InertSnapshot = {
  element: HTMLElement;
  inert: boolean;
  ariaHidden: string | null;
  users: number;
};

// A closing overlay and its replacement can run effects in either order.
// Keep the background locked until the final owner releases it.
const backgroundLocks = new WeakMap<HTMLElement, InertSnapshot>();

function lockBackground(element: HTMLElement) {
  const existing = backgroundLocks.get(element);
  if (existing) {
    existing.users += 1;
    return existing;
  }
  const snapshot: InertSnapshot = {
    element,
    inert: element.inert,
    ariaHidden: element.getAttribute("aria-hidden"),
    users: 1,
  };
  backgroundLocks.set(element, snapshot);
  element.inert = true;
  element.setAttribute("aria-hidden", "true");
  return snapshot;
}

function releaseBackground(snapshot: InertSnapshot) {
  snapshot.users -= 1;
  if (snapshot.users > 0) return;
  const { element, inert, ariaHidden } = snapshot;
  element.inert = inert;
  if (ariaHidden === null) element.removeAttribute("aria-hidden");
  else element.setAttribute("aria-hidden", ariaHidden);
  backgroundLocks.delete(element);
}

function collectBackgroundSiblings(dialog: HTMLElement) {
  const snapshots: InertSnapshot[] = [];
  let activeBranch: HTMLElement | null = dialog;

  while (activeBranch?.parentElement && activeBranch.parentElement !== document.body) {
    const parent: HTMLElement = activeBranch.parentElement;

    Array.from(parent.children).forEach((child) => {
      if (!(child instanceof HTMLElement) || child === activeBranch) return;
      snapshots.push(lockBackground(child));
    });

    activeBranch = parent;
  }

  if (activeBranch?.parentElement === document.body) {
    Array.from(document.body.children).forEach((child) => {
      if (!(child instanceof HTMLElement) || child === activeBranch) return;
      snapshots.push(lockBackground(child));
    });
  }

  return snapshots;
}

export function useModalDialog({
  open,
  dialogRef,
  onClose,
  initialFocusRef,
  restoreFocusRef,
}: ModalDialogOptions) {
  const onCloseRef = useRef(onClose);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const explicitRestoreTarget = restoreFocusRef?.current ?? null;
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const backgroundSnapshots = collectBackgroundSiblings(dialog);

    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) =>
          element.tabIndex >= 0 &&
          !element.matches(":disabled") &&
          !element.closest('[inert], [aria-hidden="true"]') &&
          element.getClientRects().length > 0 &&
          window.getComputedStyle(element).visibility !== "hidden",
      );

    const focusTarget = initialFocusRef?.current ?? getFocusableElements()[0] ?? dialog;
    const focusFrame = window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusableElements = getFocusableElements();

      if (!focusableElements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      backgroundSnapshots.forEach(releaseBackground);

      window.requestAnimationFrame(() => {
        // Portalled navigation remounts its trigger when it closes.
        // Intentionally read the current node: the opening trigger was unmounted by the portal.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const restoreTarget = restoreFocusRef?.current ?? explicitRestoreTarget ?? previouslyFocusedRef.current;
        if (restoreTarget?.isConnected) restoreTarget.focus({ preventScroll: true });
      });
    };
  }, [dialogRef, initialFocusRef, open, restoreFocusRef]);
}
