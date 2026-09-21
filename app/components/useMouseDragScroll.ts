"use client";

import { useEffect, type RefObject } from "react";

type Drag = {
  pointerId: number;
  startX: number;
  startY: number;
  startScroll: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  moved: boolean;
};

export function useMouseDragScroll(
  viewportRef: RefObject<HTMLDivElement | null>,
  interruptAlignment: () => void,
) {
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let drag: Drag | null = null;
    let suppressClick = false;
    let isGliding = false;

    const stopScroll = () => {
      isGliding = false;
      viewport.scrollTo({ left: viewport.scrollLeft, behavior: "instant" });
    };
    const interruptGlide = () => { if (isGliding) stopScroll(); };
    const finish = (coast: boolean) => {
      const previous = drag;
      if (!previous) return;
      drag = null;
      viewport.removeAttribute("data-dragging");
      if (viewport.hasPointerCapture(previous.pointerId)) {
        viewport.releasePointerCapture(previous.pointerId);
      }
      if (!previous.moved) return;
      suppressClick = true;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!coast || reduceMotion || performance.now() - previous.lastTime > 100) return;
      // A short, bounded glide follows a flick; a slow drag stops under the pointer.
      const distance = Math.max(-220, Math.min(220, previous.velocity * 130));
      if (Math.abs(distance) < 18) return;
      isGliding = true;
      viewport.scrollTo({ left: viewport.scrollLeft + distance, behavior: "smooth" });
    };
    const pointerDown = (event: PointerEvent) => {
      suppressClick = false;
      if (event.pointerType !== "mouse" || !event.isPrimary || event.button !== 0
        || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      interruptAlignment();
      stopScroll();
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startScroll: viewport.scrollLeft,
        lastX: event.clientX,
        lastTime: performance.now(),
        velocity: 0,
        moved: false,
      };
    };
    const pointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (!(event.buttons & 1)) { finish(false); return; }
      const deltaX = event.clientX - drag.startX;
      if (!drag.moved) {
        if (Math.abs(deltaX) < 6) return;
        if (Math.abs(deltaX) < Math.abs(event.clientY - drag.startY)) { finish(false); return; }
        drag.moved = true;
        viewport.setAttribute("data-dragging", "true");
        viewport.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
      const now = performance.now();
      const elapsed = now - drag.lastTime;
      if (elapsed > 0) {
        const velocity = (drag.lastX - event.clientX) / Math.max(8, elapsed);
        drag.velocity = elapsed > 100 ? 0 : drag.velocity * 0.35 + velocity * 0.65;
      }
      drag.lastX = event.clientX;
      drag.lastTime = now;
      viewport.scrollTo({ left: drag.startScroll - deltaX, behavior: "instant" });
    };
    const pointerUp = (event: PointerEvent) => {
      if (event.pointerId === drag?.pointerId) finish(true);
    };
    const pointerCancel = (event: PointerEvent) => {
      if (event.pointerId === drag?.pointerId) finish(false);
    };
    const cancel = () => { finish(false); interruptGlide(); };
    const wheel = () => { interruptAlignment(); interruptGlide(); };
    const click = (event: MouseEvent) => {
      if (!suppressClick || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };
    const dragStart = (event: DragEvent) => {
      if (drag) event.preventDefault();
    };
    viewport.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointermove", pointerMove, { passive: false });
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerCancel);
    window.addEventListener("blur", cancel);
    viewport.addEventListener("lostpointercapture", pointerCancel);
    viewport.addEventListener("click", click, true);
    viewport.addEventListener("dragstart", dragStart);
    viewport.addEventListener("wheel", wheel, { passive: true });
    viewport.addEventListener("keydown", interruptGlide);
    return () => {
      finish(false);
      viewport.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerCancel);
      window.removeEventListener("blur", cancel);
      viewport.removeEventListener("lostpointercapture", pointerCancel);
      viewport.removeEventListener("click", click, true);
      viewport.removeEventListener("dragstart", dragStart);
      viewport.removeEventListener("wheel", stopScroll);
      viewport.removeEventListener("keydown", stopScroll);
    };
  }, [viewportRef, interruptAlignment]);
}
