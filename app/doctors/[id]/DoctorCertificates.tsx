"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, MouseEventHandler, PointerEvent, RefObject, TouchEvent } from "react";
import { CloseIcon } from "../../components/CloseIcon";
import { useModalDialog } from "../../components/useModalDialog";
import { useCertificateRail } from "./useCertificateRail";
import { useCertificateViewer } from "./useCertificateViewer";
import { useCertificateZoom } from "./useCertificateZoom";
import styles from "./DoctorCertificates.module.css";

export type DoctorCertificate = {
  id: string; title: string; src: string; thumbnailSrc: string;
  width: number; height: number; year?: string; issuer?: string; rotation?: 90 | 180 | 270;
};
type Props = { doctorName: string; certificates: DoctorCertificate[] };
type ViewerDrag = { pointerId: number; x: number; y: number; moved: boolean };

type PaperProps = {
  certificate: DoctorCertificate;
  alt: string;
  preview?: boolean;
  frameRef?: RefObject<HTMLSpanElement | null>;
  style?: CSSProperties;
  animateZoom?: boolean;
  onDoubleClick?: MouseEventHandler<HTMLSpanElement>;
  onLoad?: () => void;
  onError?: () => void;
};

function CertificatePaper({ certificate, alt, preview = false, frameRef, style, animateZoom, onDoubleClick, onLoad, onError }: PaperProps) {
  const rotation = certificate.rotation ?? 0;
  const sideways = rotation === 90 || rotation === 270;
  const width = sideways ? certificate.height : certificate.width;
  const height = sideways ? certificate.width : certificate.height;
  // Rotation belongs to the inner image; the fitted outer frame remains the zoom/pan surface.
  const paperStyle = {
    "--paper-aspect": width / height,
    "--paper-rotation": rotation + "deg",
    "--paper-image-width": certificate.width / width * 100 + "%",
    "--paper-image-height": certificate.height / height * 100 + "%",
    ...style,
  } as CSSProperties;

  return <span ref={frameRef} className={styles.paper + (preview ? "" : " " + styles.fullImage)} style={paperStyle} data-zoom-animated={animateZoom || undefined} onDoubleClick={onDoubleClick}>
    <Image className={styles.paperImage} src={certificate.src} alt={alt} width={certificate.width} height={certificate.height}
      sizes={preview ? "(max-width: 760px) 88vw, (max-width: 1080px) 48vw, 400px" : undefined}
      quality={preview ? 85 : undefined} unoptimized={!preview} loading={preview ? "lazy" : "eager"}
      draggable={false} onLoad={onLoad} onError={onError} />
  </span>;
}

function Arrow({ direction }: { direction: "previous" | "next" }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={direction === "previous" ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} /></svg>;
}
function ZoomIcon({ zoomed }: { zoomed: boolean }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5M7.5 10.5h6" />{!zoomed && <path d="M10.5 7.5v6" />}</svg>;
}
function PlaybackIcon({ paused }: { paused: boolean }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paused ? <path d="m9 5 10 7-10 7V5Z" /> : <path d="M9 5v14M15 5v14" />}</svg>;
}
function documentCount(count: number) {
  const last = count % 10, teens = count % 100;
  return count + " " + (teens >= 11 && teens <= 14 ? "документів" : last === 1 ? "документ" : last >= 2 && last <= 4 ? "документи" : "документів");
}

export function DoctorCertificates({ doctorName, certificates }: Props) {
  const labelId = useId(), viewerTitleId = useId();
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [viewerDragging, setViewerDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLButtonElement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLSpanElement>(null);
  const viewerDragRef = useRef<ViewerDrag | null>(null);
  const suppressBackdropClickUntil = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const { railRef, isDragging: railDragging, paused, setPaused, reducedMotion, canPrevious, canNext, canScroll, previous, next, handlers, interactionHandlers } = useCertificateRail({ open: viewerOpen, count: certificates.length });
  const { selectedIndex, transition, pending, loadError, openAt, navigate, goTo, close: closeViewer, finishTransition } = useCertificateViewer({ certificates, reducedMotion });
  const index = selectedIndex === null ? 0 : Math.min(selectedIndex, Math.max(0, certificates.length - 1));
  const active = selectedIndex === null ? undefined : certificates[index];
  const open = Boolean(active);
  const outgoing = transition ? certificates[transition.from] : undefined;
  const imageStatus = loadError || active?.src === failedSrc ? "error" : active?.src === loadedSrc ? "ready" : "loading";
  const { scale, x: zoomX, y: zoomY, zoomed, panning, animate: animateZoom, toggle: toggleZoom, reset: resetZoom, handleKeyDown: zoomKeyDown, pointerDown: zoomPointerDown, pointerMove: zoomPointerMove, pointerUp: zoomPointerUp, pointerCancel: zoomPointerCancel, doubleClick: zoomDoubleClick } = useCertificateZoom({ open, sourceKey: active?.src, enabled: imageStatus === "ready" && !pending && !transition, stageRef, imageRef });
  useEffect(() => {
    if (!transition && !pending && !viewerDragging) { setDragOffset(0); setDragIndex(null); }
  }, [transition, pending, viewerDragging]);
  const close = useCallback(() => {
    closeViewer(); setViewerOpen(false); resetZoom(); setDragOffset(0); setDragIndex(null); setViewerDragging(false);
    viewerDragRef.current = null; touchStartRef.current = null;
  }, [closeViewer, resetZoom]);

  useModalDialog({ open, dialogRef, initialFocusRef: closeRef, restoreFocusRef, onClose: close });
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  useEffect(() => {
    if (open) stageRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [index, open]);

  useEffect(() => {
    if (!open) return;
    const cancel = () => { viewerDragRef.current = null; touchStartRef.current = null; setViewerDragging(false); setDragOffset(0); };
    const release = (event: globalThis.PointerEvent) => {
      if (viewerDragRef.current?.pointerId === event.pointerId && !stageRef.current?.hasPointerCapture(event.pointerId)) cancel();
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", cancel);
    return () => { window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release); window.removeEventListener("blur", cancel); };
  }, [open]);

  const step = (direction: -1 | 1, offset = 0) => {
    resetZoom();
    if (!offset || reducedMotion || certificates.length < 2) { setDragOffset(0); setDragIndex(null); }
    navigate(direction, offset);
  };
  const jump = (nextIndex: number) => {
    resetZoom(); setDragOffset(0); setDragIndex(null); goTo(nextIndex);
  };
  const completeTransition = () => {
    setDragOffset(0); setDragIndex(null); finishTransition();
  };
  const startMouseDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (zoomPointerDown(event) || zoomed) return;
    if (transition || pending || event.pointerType !== "mouse" || !event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest("a, button")) return;
    setDragIndex(index);
    viewerDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  };
  const moveMouseDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (zoomPointerMove(event) || zoomed) return;
    const drag = viewerDragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!(event.buttons & 1)) {
      viewerDragRef.current = null; setViewerDragging(false); setDragOffset(0);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
    if (!drag.moved) event.currentTarget.setPointerCapture(event.pointerId);
    drag.moved = true; event.preventDefault(); setViewerDragging(true);
    setDragOffset(dx);
  };
  const finishMouseDrag = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    if ((cancelled ? zoomPointerCancel(event) : zoomPointerUp(event))) { suppressBackdropClickUntil.current = Date.now() + 500; return; }
    if (zoomed) return;
    const drag = viewerDragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    viewerDragRef.current = null; setViewerDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag.moved) suppressBackdropClickUntil.current = Date.now() + 500;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!cancelled && !zoomed && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1, dx);
    else setDragOffset(0);
  };
  const startSwipe = (event: TouchEvent<HTMLDivElement>) => {
    touchStartRef.current = !transition && !pending && !zoomed && event.touches.length === 1 && (window.visualViewport?.scale ?? 1) <= 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY, time: Date.now() } : null;
    if (touchStartRef.current) setDragIndex(index);
  };
  const moveSwipe = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    if (!start) return;
    if (event.touches.length !== 1 || (window.visualViewport?.scale ?? 1) > 1) { touchStartRef.current = null; setDragOffset(0); setViewerDragging(false); return; }
    const dx = event.touches[0].clientX - start.x, dy = event.touches[0].clientY - start.y;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { touchStartRef.current = null; setDragOffset(0); setViewerDragging(false); return; }
    if (Math.abs(dx) > 6) { setViewerDragging(true); setDragOffset(dx); }
  };
  const endSwipe = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null; setViewerDragging(false);
    if (!start || zoomed || event.touches.length || !event.changedTouches[0] || (window.visualViewport?.scale ?? 1) > 1) { setDragOffset(0); return; }
    const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 6) suppressBackdropClickUntil.current = Date.now() + 500;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - start.time < 1000) step(dx < 0 ? 1 : -1, dx);
    else setDragOffset(0);
  };
  const controlClass = "outline-button " + styles.control;
  if (!certificates.length) return null;

  return <>
    <section className={styles.section} aria-labelledby={labelId} {...interactionHandlers}>
      <header className={styles.heading}>
        <div><span className="section-kicker">Професійний розвиток</span><h2 id={labelId}>Сертифікати та навчання</h2></div>
        <div className={styles.headingActions}>
          <span className={styles.count}>{documentCount(certificates.length)}</span>
          {certificates.length > 1 && <div className={styles.railControls}>
          <button type="button" className={controlClass + " " + styles.keyboardPlayback} aria-label={paused || reducedMotion ? "Увімкнути автогортання" : "Призупинити автогортання"} aria-pressed={paused || reducedMotion} disabled={reducedMotion || !canScroll} onClick={() => setPaused(!paused)}><PlaybackIcon paused={paused || reducedMotion} /></button>
          <button type="button" className={controlClass} aria-label="Попередні сертифікати" onClick={previous} disabled={!canPrevious}><Arrow direction="previous" /></button>
          <button type="button" className={controlClass} aria-label="Наступні сертифікати" onClick={next} disabled={!canNext}><Arrow direction="next" /></button>
          </div>}
        </div>
      </header>
      <ul ref={railRef} className={styles.rail} aria-label={"Сертифікати: " + doctorName} data-dragging={railDragging || undefined} {...handlers}>
        {certificates.map((certificate, certificateIndex) => <li key={certificate.id}>
          <button className={styles.document} type="button" aria-haspopup="dialog" aria-label={"Відкрити: " + certificate.title} onClick={(event) => { restoreFocusRef.current = event.currentTarget; setViewerOpen(true); resetZoom(); setFailedSrc(null); setDragOffset(0); setDragIndex(null); openAt(certificateIndex); }}>
            <span className={styles.preview}><CertificatePaper certificate={certificate} alt="" preview /></span>
          </button>
        </li>)}
      </ul>
    </section>

    {active && createPortal(
      <div ref={dialogRef} className={"branch-modal-backdrop " + styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
        <section className={styles.viewer} role="dialog" aria-modal="true" aria-labelledby={viewerTitleId} onKeyDown={(event) => {
          if (zoomKeyDown(event)) return;
          if (zoomed || event.altKey || event.ctrlKey || event.metaKey) return;
          if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
          if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
          if (event.key === "Home") { event.preventDefault(); jump(0); }
          if (event.key === "End") { event.preventDefault(); jump(certificates.length - 1); }
        }}>
          <h2 id={viewerTitleId} className={styles.srOnly}>{active.title} — {doctorName}</h2>
          <div className={styles.viewerActions}>
            <button type="button" className={controlClass} aria-label={zoomed ? "Увесь документ" : "Збільшити сертифікат"} title={zoomed ? "Масштаб " + Math.round(scale * 100) + "% — повернути весь документ" : "Збільшити у 2,5 раза"} aria-pressed={zoomed} disabled={imageStatus !== "ready" || pending || Boolean(transition)} onClick={() => toggleZoom()}><ZoomIcon zoomed={zoomed} /></button>
            <button type="button" className={controlClass} ref={closeRef} aria-label="Закрити сертифікат" title="Закрити" onClick={close}><CloseIcon /></button>
          </div>
          <div ref={stageRef} className={styles.stage + (zoomed ? " " + styles.zoomed : "")} data-dragging={viewerDragging || panning || undefined} aria-busy={pending}
            onPointerDown={startMouseDrag} onPointerMove={moveMouseDrag} onPointerUp={(event) => finishMouseDrag(event)} onPointerCancel={(event) => finishMouseDrag(event, true)} onLostPointerCapture={(event) => finishMouseDrag(event, true)}
            onTouchStart={startSwipe} onTouchMove={moveSwipe} onTouchEnd={endSwipe} onTouchCancel={() => { touchStartRef.current = null; setDragOffset(0); setViewerDragging(false); }}
            onClick={(event) => { if (event.target === event.currentTarget && Date.now() > suppressBackdropClickUntil.current) close(); }}
            tabIndex={zoomed ? 0 : -1} role="region" aria-describedby={viewerTitleId + "-zoom-help"} aria-label={zoomed ? "Збільшений документ — перетягуйте для перегляду" : "Перегляд сертифіката"}>
            <span id={viewerTitleId + "-zoom-help"} className={styles.srOnly}>Подвійне клацання або коліщатко миші змінює масштаб. Клавіші + та − — масштаб, 0 — увесь документ. У збільшеному вигляді стрілки переміщують документ.</span>
            {(imageStatus === "loading" || pending) && <span className={styles.imageStatus} role="status">Завантажуємо…</span>}
            {outgoing && transition && <div key={"outgoing-" + transition.key} className={styles.slide + " " + styles.outgoing} aria-hidden="true" style={{ "--slide-direction": transition.direction, "--slide-offset": transition.offset + "px" } as CSSProperties}>
              <CertificatePaper certificate={outgoing} alt="" />
            </div>}
            <div key={active.id} className={styles.slide + (transition ? " " + styles.incoming : "")} style={transition ? { "--slide-direction": transition.direction, "--slide-offset": transition.offset + "px" } as CSSProperties : { transform: !zoomed ? "translateX(" + (dragIndex === index ? dragOffset : 0) + "px)" : undefined }} onAnimationEnd={(event) => { if (event.target === event.currentTarget) completeTransition(); }} onClick={(event) => { if (event.target === event.currentTarget && !transition && !pending && Date.now() > suppressBackdropClickUntil.current) close(); }}>
              {imageStatus === "error" ? <div className={styles.imageError} role="status"><p>Не вдалося завантажити документ.</p><a href={active.src} target="_blank" rel="noopener noreferrer">Відкрити файл</a></div> : <CertificatePaper frameRef={imageRef} certificate={active} alt={active.title + " — " + doctorName} animateZoom={animateZoom} style={{ transform: "translate3d(" + zoomX + "px," + zoomY + "px,0) scale(" + scale + ")" }} onDoubleClick={zoomDoubleClick} onLoad={() => setLoadedSrc(active.src)} onError={() => setFailedSrc(active.src)} />}
            </div>
          </div>
          <div className={styles.viewerNavigation}>
            <button type="button" className={controlClass} aria-label="Попередній сертифікат" onClick={() => step(-1)} disabled={certificates.length < 2}><Arrow direction="previous" /></button>
            <span className={styles.position} aria-live="polite" aria-atomic="true">{index + 1} <span>/ {certificates.length}</span></span>
            <button type="button" className={controlClass} aria-label="Наступний сертифікат" onClick={() => step(1)} disabled={certificates.length < 2}><Arrow direction="next" /></button>
          </div>
        </section>
      </div>, document.body,
    )}
  </>;
}
