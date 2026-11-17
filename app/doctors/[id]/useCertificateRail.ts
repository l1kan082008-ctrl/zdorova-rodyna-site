"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEvent, FocusEvent, MouseEvent, PointerEvent as ReactPointerEvent, TouchEvent } from "react";

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

const INTERVAL = 4000;
const EDGE_TOLERANCE = 2;

export function useCertificateRail({ open, count }: { open: boolean; count: number }) {
  const railRef = useRef<HTMLUListElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const suppressClickRef = useRef(false);
  const animationRef = useRef<{ frame: number; target: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [cycle, setCycle] = useState(0);
  const [bounds, setBounds] = useState({ canScroll: false, canPrevious: false, canNext: false });
  const restart = useCallback(() => setCycle((value) => value + 1), []);

  const updateBounds = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const maximum = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const canScroll = maximum > EDGE_TOLERANCE;
    const next = {
      canScroll,
      canPrevious: canScroll && rail.scrollLeft > EDGE_TOLERANCE,
      canNext: canScroll && rail.scrollLeft < maximum - EDGE_TOLERANCE,
    };
    setBounds((current) => current.canScroll === next.canScroll && current.canPrevious === next.canPrevious && current.canNext === next.canNext ? current : next);
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current.frame);
    animationRef.current = null;
  }, []);

  const animateTo = useCallback((target: number) => {
    stopAnimation();
    const rail = railRef.current;
    if (!rail) return;
    target = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, target));
    const from = rail.scrollLeft;
    const distance = target - from;
    if (Math.abs(distance) < 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rail.scrollTo({ left: target, behavior: "instant" });
      updateBounds();
      return;
    }
    const started = performance.now();
    const duration = Math.min(480, 300 + Math.abs(distance) * 0.25);
    const animation = { frame: 0, target };
    animationRef.current = animation;
    const tick = (now: number) => {
      if (animationRef.current !== animation) return;
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      rail.scrollTo({ left: from + distance * eased, behavior: "instant" });
      if (progress < 1) animation.frame = requestAnimationFrame(tick);
      else { animationRef.current = null; updateBounds(); }
    };
    animation.frame = requestAnimationFrame(tick);
  }, [stopAnimation, updateBounds]);

  const positions = useCallback(() => {
    const rail = railRef.current;
    const first = rail?.firstElementChild;
    if (!rail || !first) return [0];
    const maximum = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const firstLeft = first.getBoundingClientRect().left;
    return Array.from(new Set([0, ...Array.from(rail.children, (item) => Math.min(maximum, Math.max(0, item.getBoundingClientRect().left - firstLeft))), maximum]));
  }, []);

  const finishDrag = useCallback((settle = false) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    const rail = railRef.current;
    rail?.removeAttribute("data-dragging");
    if (rail?.hasPointerCapture(drag.pointerId)) rail.releasePointerCapture(drag.pointerId);
    if (drag.moved) suppressClickRef.current = true;
    if (settle && drag.moved && rail) {
      const velocity = performance.now() - drag.lastTime < 100 ? drag.velocity : 0;
      const projected = rail.scrollLeft + Math.max(-180, Math.min(180, velocity * 130));
      const target = positions().reduce((nearest, left) => Math.abs(left - projected) < Math.abs(nearest - projected) ? left : nearest);
      animateTo(target);
    }
    setIsDragging(false);
    setIsInteracting(false);
    restart();
    updateBounds();
  }, [animateTo, positions, restart, updateBounds]);

  useEffect(() => stopAnimation, [stopAnimation]);
  useEffect(() => {
    if (open) { finishDrag(); stopAnimation(); }
  }, [open, finishDrag, stopAnimation]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;
    const scheduleBounds = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateBounds);
    };
    const observer = new ResizeObserver(scheduleBounds);
    observer.observe(rail);
    for (const item of Array.from(rail.children)) observer.observe(item);
    const visibility = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting && entry.intersectionRatio > 0);
    }, { threshold: [0, 0.01] });
    visibility.observe(rail);
    rail.addEventListener("scroll", scheduleBounds, { passive: true });
    scheduleBounds();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      rail.removeEventListener("scroll", scheduleBounds);
    };
  }, [count, updateBounds]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChanged = () => { setReducedMotion(media.matches); if (media.matches) stopAnimation(); };
    const visibilityChanged = () => {
      setDocumentVisible(document.visibilityState === "visible");
      if (document.visibilityState !== "visible") { finishDrag(); stopAnimation(); }
    };
    motionChanged();
    visibilityChanged();
    media.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      media.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [finishDrag, stopAnimation]);

  useEffect(() => {
    const mountedRail = railRef.current;
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      const rail = railRef.current;
      if (!drag || !rail || event.pointerId !== drag.pointerId) return;
      if (!(event.buttons & 1)) { finishDrag(); return; }
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        if (Math.abs(dy) >= Math.abs(dx)) { finishDrag(); return; }
        drag.moved = true;
        suppressClickRef.current = true;
        rail.setAttribute("data-dragging", "true");
        rail.setPointerCapture(event.pointerId);
        setIsDragging(true);
      }
      event.preventDefault();
      const now = performance.now();
      const elapsed = now - drag.lastTime;
      if (elapsed > 0) drag.velocity = elapsed > 100 ? 0 : drag.velocity * 0.35 + ((drag.lastX - event.clientX) / Math.max(8, elapsed)) * 0.65;
      drag.lastX = event.clientX;
      drag.lastTime = now;
      rail.scrollTo({ left: drag.startScroll - dx, behavior: "instant" });
    };
    const release = (event: PointerEvent) => {
      if (event.pointerId === dragRef.current?.pointerId) finishDrag(event.type === "pointerup");
    };
    const blur = () => {
      finishDrag();
      stopAnimation();
      setIsInteracting(false);
      setHovered(false);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", blur);
    const resize = () => { finishDrag(); stopAnimation(); };
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", blur);
      window.removeEventListener("resize", resize);
      const drag = dragRef.current;
      dragRef.current = null;
      if (drag && mountedRail?.hasPointerCapture(drag.pointerId)) mountedRail.releasePointerCapture(drag.pointerId);
    };
  }, [finishDrag, stopAnimation]);

  const moveOne = useCallback((direction: -1 | 1, loop = false) => {
    const rail = railRef.current;
    if (!rail) return;
    const maximum = Math.max(0, rail.scrollWidth - rail.clientWidth);
    if (maximum <= EDGE_TOLERANCE) return;
    const current = Math.min(maximum, Math.max(0, animationRef.current?.target ?? rail.scrollLeft));
    const stops = positions();
    let target: number;
    if (direction === 1) {
      target = loop && current >= maximum - EDGE_TOLERANCE
        ? 0
        : stops.find((left) => left > current + EDGE_TOLERANCE) ?? maximum;
    } else {
      target = stops.findLast((left) => left < current - EDGE_TOLERANCE) ?? 0;
    }
    animateTo(target);
  }, [animateTo, positions]);

  const previous = useCallback(() => { finishDrag(); moveOne(-1); restart(); }, [finishDrag, moveOne, restart]);
  const next = useCallback(() => { finishDrag(); moveOne(1); restart(); }, [finishDrag, moveOne, restart]);
  const autoPlaying = count > 1 && bounds.canScroll && visible && documentVisible && !reducedMotion && !paused && !hovered && !focused && !isInteracting && !isDragging && !open;

  useEffect(() => {
    if (!autoPlaying) return;
    const timer = window.setTimeout(() => { moveOne(1, true); restart(); }, INTERVAL);
    return () => window.clearTimeout(timer);
  }, [autoPlaying, cycle, moveOne, restart]);

  const handlers = {
    onPointerDown: (event: ReactPointerEvent<HTMLUListElement>) => {
      suppressClickRef.current = false;
      stopAnimation();
      restart();
      if (event.pointerType !== "mouse" || !event.isPrimary || event.button !== 0 || !bounds.canScroll || dragRef.current
        || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const rail = event.currentTarget;
      rail.scrollTo({ left: rail.scrollLeft, behavior: "instant" });
      dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startScroll: rail.scrollLeft, lastX: event.clientX, lastTime: performance.now(), velocity: 0, moved: false };
      setIsInteracting(true);
    },
    onLostPointerCapture: (event: ReactPointerEvent<HTMLUListElement>) => {
      if (event.pointerId === dragRef.current?.pointerId) finishDrag();
    },
    onClickCapture: (event: MouseEvent<HTMLUListElement>) => {
      if (!suppressClickRef.current || event.detail === 0) return;
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
    onDragStart: (event: DragEvent<HTMLUListElement>) => {
      if (dragRef.current) event.preventDefault();
    },
    onWheel: () => { stopAnimation(); restart(); },
    onKeyDownCapture: () => { stopAnimation(); restart(); },
    onTouchStart: () => { stopAnimation(); setIsInteracting(true); restart(); },
    onTouchEnd: (event: TouchEvent<HTMLUListElement>) => {
      if (!event.touches.length) { setIsInteracting(false); restart(); }
    },
    onTouchCancel: () => { setIsInteracting(false); restart(); },
  };

  const interactionHandlers = {
    onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => { if (event.pointerType === "mouse") setHovered(true); },
    onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => { if (event.pointerType === "mouse") setHovered(false); },
    onFocusCapture: () => { stopAnimation(); setFocused(true); },
    onBlurCapture: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
    },
  };

  return { railRef, isDragging, paused, setPaused, reducedMotion, autoPlaying, ...bounds, previous, next, handlers, interactionHandlers };
}
