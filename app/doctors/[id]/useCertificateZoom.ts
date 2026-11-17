"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent, RefObject } from "react";

type View = { scale: number; x: number; y: number; animate: boolean; panning: boolean };
type Pan = { pointerId: number; x: number; y: number; originX: number; originY: number; moved: boolean };
type Options = {
  open: boolean;
  sourceKey: string | undefined;
  enabled: boolean;
  stageRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLElement | null>;
};
const FIT: View = { scale: 1, x: 0, y: 0, animate: false, panning: false };
const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
const browserZoomed = () => (window.visualViewport?.scale ?? 1) > 1.01;

export function useCertificateZoom({ open, sourceKey, enabled, stageRef, imageRef }: Options) {
  const [view, setView] = useState<View>(FIT);
  const viewRef = useRef<View>(FIT);
  const panRef = useRef<Pan | null>(null);

  const commit = useCallback((next: View) => {
    const stage = stageRef.current, image = imageRef.current;
    const scale = Math.max(1, Math.min(4, next.scale));
    const maxX = stage && image ? Math.max(0, (image.clientWidth * scale - stage.clientWidth) / 2) : 0;
    const maxY = stage && image ? Math.max(0, (image.clientHeight * scale - stage.clientHeight) / 2) : 0;
    const result = { ...next, scale, x: scale === 1 ? 0 : clamp(next.x, maxX), y: scale === 1 ? 0 : clamp(next.y, maxY) };
    viewRef.current = result;
    setView(result);
  }, [stageRef, imageRef]);

  const releasePan = useCallback(() => {
    const pan = panRef.current;
    panRef.current = null;
    const stage = stageRef.current;
    if (pan && stage?.hasPointerCapture(pan.pointerId)) stage.releasePointerCapture(pan.pointerId);
    return pan;
  }, [stageRef]);

  const cancelPan = useCallback(() => {
    const pan = releasePan();
    if (pan) commit({ ...viewRef.current, animate: false, panning: false });
    return Boolean(pan?.moved);
  }, [releasePan, commit]);

  const reset = useCallback(() => {
    releasePan();
    commit({ ...FIT, animate: true });
  }, [releasePan, commit]);

  // A new gesture interrupts the visual zoom at its current position, not its target.
  const renderedView = useCallback(() => {
    const image = imageRef.current;
    if (!image || !viewRef.current.animate) return viewRef.current;
    const transform = getComputedStyle(image).transform;
    if (!transform || transform === "none") return viewRef.current;
    const matrix = new DOMMatrixReadOnly(transform);
    return { ...viewRef.current, scale: matrix.a, x: matrix.e, y: matrix.f };
  }, [imageRef]);

  const changeScale = useCallback((nextScale: number, clientX?: number, clientY?: number, animate = true) => {
    const stage = stageRef.current;
    if (!open || !enabled || !stage || browserZoomed()) return;
    releasePan();
    const current = renderedView();
    const scale = Math.max(1, Math.min(4, nextScale));
    const rect = stage.getBoundingClientRect();
    const anchorX = clientX === undefined ? 0 : clientX - rect.left - stage.clientLeft - stage.clientWidth / 2;
    const anchorY = clientY === undefined ? 0 : clientY - rect.top - stage.clientTop - stage.clientHeight / 2;
    const ratio = scale / current.scale;
    commit({ scale, x: anchorX - (anchorX - current.x) * ratio, y: anchorY - (anchorY - current.y) * ratio, animate, panning: false });
  }, [open, enabled, stageRef, releasePan, renderedView, commit]);

  const zoomAt = useCallback((clientX?: number, clientY?: number, nextScale?: number) => {
    changeScale(nextScale ?? (viewRef.current.scale > 1.01 ? 1 : 2.5), clientX, clientY);
  }, [changeScale]);
  const toggle = useCallback(() => zoomAt(), [zoomAt]);

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!open || !enabled || viewRef.current.scale <= 1.01) return false;
    if (browserZoomed() || (event.pointerType === "touch" && !event.isPrimary)) { cancelPan(); return true; }
    if (!event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest("a, button")) return false;
    const current = renderedView();
    commit({ ...current, animate: false, panning: false });
    panRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: current.x, originY: current.y, moved: false };
    return true;
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    if (!pan || event.pointerId !== pan.pointerId) return false;
    if (browserZoomed() || (event.pointerType === "mouse" && !(event.buttons & 1))) { cancelPan(); return true; }
    const dx = event.clientX - pan.x, dy = event.clientY - pan.y;
    if (!pan.moved && Math.max(Math.abs(dx), Math.abs(dy)) < 6) return true;
    if (!pan.moved) {
      pan.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (event.pointerType === "mouse") event.preventDefault();
    commit({ ...viewRef.current, x: pan.originX + dx, y: pan.originY + dy, animate: false, panning: true });
    return true;
  };

  const pointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (panRef.current?.pointerId !== event.pointerId) return false;
    return cancelPan();
  };

  const doubleClick = (event: MouseEvent<HTMLElement>) => {
    if (!open || !enabled || browserZoomed()) return;
    event.preventDefault();
    event.stopPropagation();
    zoomAt(event.clientX, event.clientY);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!open || !enabled || event.ctrlKey || event.metaKey || event.altKey) return false;
    if (event.key === "+" || event.key === "=") {
      event.preventDefault(); changeScale(viewRef.current.scale * 1.25); return true;
    }
    if (event.key === "-") {
      event.preventDefault(); changeScale(viewRef.current.scale / 1.25); return true;
    }
    if (event.key === "0") { event.preventDefault(); reset(); return true; }
    if (viewRef.current.scale <= 1.01 || browserZoomed()) return false;
    const distance = event.shiftKey ? 160 : 80;
    const dx = event.key === "ArrowLeft" ? distance : event.key === "ArrowRight" ? -distance : 0;
    const dy = event.key === "ArrowUp" ? distance : event.key === "ArrowDown" ? -distance : 0;
    if (!dx && !dy) return false;
    event.preventDefault();
    releasePan();
    commit({ ...viewRef.current, x: viewRef.current.x + dx, y: viewRef.current.y + dy, animate: true, panning: false });
    return true;
  };

  useEffect(() => {
    releasePan();
    commit(FIT);
  }, [sourceKey, open, releasePan, commit]);

  useEffect(() => {
    if (!enabled) cancelPan();
  }, [enabled, cancelPan]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!open || !stage) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || browserZoomed()) return;
      event.preventDefault();
      if (!enabled || !event.deltaY) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
      const delta = Math.max(-180, Math.min(180, event.deltaY * unit));
      changeScale(renderedView().scale * Math.exp(-delta * 0.002), event.clientX, event.clientY, true);
    };
    const resize = () => { releasePan(); commit({ ...viewRef.current, animate: false, panning: false }); };
    const release = (event: globalThis.PointerEvent) => {
      if (panRef.current?.pointerId === event.pointerId) cancelPan();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    if (imageRef.current) observer.observe(imageRef.current);
    stage.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", cancelPan);
    return () => {
      observer.disconnect();
      stage.removeEventListener("wheel", wheel);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", cancelPan);
      releasePan();
    };
  }, [open, sourceKey, enabled, stageRef, imageRef, changeScale, releasePan, cancelPan, commit, renderedView]);

  return { ...view, zoomed: view.scale > 1.01, toggle, reset, zoomAt, handleKeyDown, pointerDown, pointerMove, pointerUp, pointerCancel: pointerUp, doubleClick };
}
