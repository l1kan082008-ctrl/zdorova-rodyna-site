"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
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
};

function collectBackgroundSiblings(dialog: HTMLElement) {
  const snapshots: InertSnapshot[] = [];
  let activeBranch: HTMLElement | null = dialog;

  while (activeBranch?.parentElement && activeBranch.parentElement !== document.body) {
    const parent: HTMLElement = activeBranch.parentElement;

    Array.from(parent.children).forEach((child) => {
      if (!(child instanceof HTMLElement) || child === activeBranch) return;
      snapshots.push({
        element: child,
        inert: child.inert,
        ariaHidden: child.getAttribute("aria-hidden"),
      });
      child.inert = true;
      child.setAttribute("aria-hidden", "true");
    });

    activeBranch = parent;
  }

  if (activeBranch?.parentElement === document.body) {
    Array.from(document.body.children).forEach((child) => {
      if (!(child instanceof HTMLElement) || child === activeBranch) return;
      snapshots.push({
        element: child,
        inert: child.inert,
        ariaHidden: child.getAttribute("aria-hidden"),
      });
      child.inert = true;
      child.setAttribute("aria-hidden", "true");
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
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.getClientRects().length > 0,
      );

    const focusTarget = initialFocusRef?.current ?? getFocusableElements()[0] ?? dialog;
    const focusFrame = window.requestAnimationFrame(() => focusTarget.focus());

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
      backgroundSnapshots.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });

      const restoreTarget = explicitRestoreTarget ?? previouslyFocusedRef.current;
      window.requestAnimationFrame(() => restoreTarget?.focus());
    };
  }, [dialogRef, initialFocusRef, open, restoreFocusRef]);
}
