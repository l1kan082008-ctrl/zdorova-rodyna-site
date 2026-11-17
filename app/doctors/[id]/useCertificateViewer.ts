"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CertificateSource = { src: string };
export type CertificateTransition = { from: number; direction: -1 | 1; offset: number; key: number };
type Request = { index: number; direction: -1 | 1; offset: number; key: number };
type Preload = { promise: Promise<boolean>; cancel: () => void };

const PRELOAD_TIMEOUT = 8000;
const TRANSITION_FALLBACK = 380;

const wrap = (index: number, count: number) => ((index % count) + count) % count;

/** Keeps the current document visible until the requested image has decoded. */
export function useCertificateViewer({ certificates, reducedMotion }: {
  certificates: readonly CertificateSource[];
  reducedMotion: boolean;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [transition, setTransition] = useState<CertificateTransition | null>(null);
  const [request, setRequest] = useState<Request | null>(null);
  const [pending, setPending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const selectedRef = useRef<number | null>(null);
  const requestedIndexRef = useRef<number | null>(null);
  const requestKeyRef = useRef(0);
  const sessionRef = useRef(0);
  const transitionKeyRef = useRef(0);
  const preloadsRef = useRef(new Map<string, Preload>());

  const cancelPreloads = useCallback(() => {
    for (const preload of preloadsRef.current.values()) preload.cancel();
    preloadsRef.current.clear();
  }, []);

  const preload = useCallback((src: string): Promise<boolean> => {
    const cached = preloadsRef.current.get(src);
    if (cached) return cached.promise;
    const image = new window.Image();
    let settle: (ready: boolean) => void = () => {};
    const record: Preload = {
      promise: new Promise<boolean>((resolve) => { settle = resolve; }),
      cancel: () => {},
    };
    let finished = false;
    const finish = (ready: boolean) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      record.cancel = () => {};
      settle(ready);
    };
    const timeout = window.setTimeout(() => finish(false), PRELOAD_TIMEOUT);
    record.cancel = () => { finish(false); image.removeAttribute("src"); };
    image.onload = () => {
      if (typeof image.decode === "function") {
        void image.decode().then(() => finish(true), () => finish(image.naturalWidth > 0));
      } else finish(image.naturalWidth > 0);
    };
    image.onerror = () => finish(false);
    preloadsRef.current.set(src, record);
    image.src = src;
    return record.promise;
  }, []);

  const close = useCallback(() => {
    sessionRef.current += 1;
    requestKeyRef.current += 1;
    selectedRef.current = null;
    requestedIndexRef.current = null;
    cancelPreloads();
    setRequest(null);
    setSelectedIndex(null);
    setTransition(null);
    setPending(false);
    setLoadError(false);
  }, [cancelPreloads]);

  const openAt = useCallback((index: number) => {
    if (!certificates.length) return;
    sessionRef.current += 1;
    requestKeyRef.current += 1;
    cancelPreloads();
    const target = wrap(index, certificates.length);
    selectedRef.current = target;
    requestedIndexRef.current = target;
    setRequest(null);
    setSelectedIndex(target);
    setTransition(null);
    setPending(false);
    setLoadError(false);
  }, [certificates.length, cancelPreloads]);

  const enqueue = useCallback((index: number, direction: -1 | 1, offset: number) => {
    if (selectedRef.current === null || !certificates.length) return;
    const target = wrap(index, certificates.length);
    requestedIndexRef.current = target;
    setPending(true);
    setRequest({ index: target, direction, offset, key: ++requestKeyRef.current });
  }, [certificates.length]);

  const navigate = useCallback((delta: number, offset = 0) => {
    const requested = requestedIndexRef.current;
    if (requested === null || !delta) return;
    enqueue(requested + delta, delta < 0 ? -1 : 1, offset);
  }, [enqueue]);

  const goTo = useCallback((index: number) => {
    const requested = requestedIndexRef.current;
    if (requested === null) return;
    enqueue(index, index < requested ? -1 : 1, 0);
  }, [enqueue]);

  const finishTransition = useCallback(() => {
    const key = transition?.key;
    setTransition((current) => current?.key === key ? null : current);
  }, [transition?.key]);

  useEffect(() => {
    if (!transition) return;
    if (reducedMotion) { finishTransition(); return; }
    const timer = window.setTimeout(finishTransition, TRANSITION_FALLBACK);
    return () => window.clearTimeout(timer);
  }, [transition, finishTransition, reducedMotion]);

  useEffect(() => {
    if (!request || selectedIndex === null || transition) return;
    if (request.index === selectedIndex) {
      setRequest(null);
      setPending(false);
      return;
    }
    const source = certificates[request.index]?.src;
    if (!source) { setRequest(null); setPending(false); return; }
    const session = sessionRef.current;
    let cancelled = false;
    void preload(source).then((ready) => {
      if (cancelled || session !== sessionRef.current || request.key !== requestKeyRef.current || selectedRef.current === null) return;
      const from = selectedRef.current;
      selectedRef.current = request.index;
      setSelectedIndex(request.index);
      setLoadError(!ready);
      setPending(false);
      setRequest(null);
      setTransition(ready && !reducedMotion
        ? { from, direction: request.direction, offset: request.offset, key: ++transitionKeyRef.current }
        : null);
    });
    return () => { cancelled = true; };
  }, [request, selectedIndex, transition, certificates, preload, reducedMotion]);

  useEffect(() => {
    if (selectedIndex === null || !certificates.length) return;
    const current = certificates[selectedIndex];
    if (!current) return;
    const session = sessionRef.current;
    let cancelled = false;
    void preload(current.src).then((ready) => {
      if (!cancelled && session === sessionRef.current && selectedRef.current === selectedIndex && !ready) setLoadError(true);
    });
    for (const neighbor of new Set([
      wrap(selectedIndex - 1, certificates.length),
      wrap(selectedIndex + 1, certificates.length),
    ])) {
      if (neighbor !== selectedIndex) void preload(certificates[neighbor].src);
    }
    return () => { cancelled = true; };
  }, [selectedIndex, certificates, preload]);

  useEffect(() => () => {
    sessionRef.current += 1;
    cancelPreloads();
  }, [cancelPreloads]);

  return { selectedIndex, transition, pending, loadError, openAt, navigate, goTo, close, finishTransition };
}
