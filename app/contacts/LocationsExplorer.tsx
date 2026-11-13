"use client";
import { isInformationOnlyLocation } from "../../lib/locationPolicy";
import { CloseIcon } from "../components/CloseIcon";
import { createPortal } from "react-dom";
import { useModalDialog } from "../components/useModalDialog";

import Image from "next/image";
import { canOptimizeImage, resolveImageSource } from "@/lib/imageSource";
import { sitePhoneHref } from "@/lib/siteSettings";
import styles from "./LocationsExplorer.module.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  branchServiceCatalog,
  getDirectionsUrl,
  getMapEmbedUrl,
  type BranchServiceId,
  type CenterLocation,
} from "./locationData";

type LocationsExplorerProps = {
  locations: CenterLocation[];
  selectedLocationId: string;
  onSelectLocation: (locationId: string) => void;
};

type MediaMode = "photos" | "video";

// Verified exterior from the branch's published gallery; its legacy cover is the reception.
const kostopilFacade = {
  src: "https://xrvfqucbraqxhqhv.public.blob.vercel-storage.com/locations/ab74b0ee-05c3-4c19-912f-9d46e213764d.webp",
  alt: "Фасад і вхід — «Здорова Родина», Костопіль, Грушевського, 4",
};

function DirectionsIcon() {
  return <svg className="branch-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21 3-7 18-3-8-8-3 18-7Z" /></svg>;
}

function LocationPreview({ photo, single }: { photo?: CenterLocation["gallery"][number]; single: boolean }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!photo?.src || failedSource === photo.src) return null;

  return (
    <span className={styles.preview} aria-hidden="true">
      <Image
        src={resolveImageSource(photo.src)}
        alt=""
        fill
        sizes={single
          ? "(max-width: 760px) calc(100vw - 32px), (max-width: 1080px) calc(100vw - 48px), (max-width: 1288px) calc(40vw - 29px), 486px"
          : "(max-width: 760px) calc(100vw - 32px), (max-width: 1080px) calc(50vw - 32px), (max-width: 1288px) calc(30vw - 30px), 357px"}
        unoptimized={!canOptimizeImage(photo.src)}
        style={photo.src === kostopilFacade.src ? { objectPosition: "50% 0%" } : undefined}
        onError={() => setFailedSource(photo.src)}
      />
    </span>
  );
}

function BranchServiceTags({ services }: { services: BranchServiceId[] }) {
  return (
    <span className="branch-service-tags" aria-label="Доступні послуги">
      {services.map((serviceId) => {
        const service = branchServiceCatalog.find(({ id }) => id === serviceId);

        return service ? (
          <span className="branch-service-tag" key={service.id}>
            {service.label}
          </span>
        ) : null;
      })}
    </span>
  );
}

function getHoursForDay(location: CenterLocation, day: number | null) {
  if (location.hours.length === 0) return "Графік уточнюйте у відділенні";
  if (day === null || location.hours.length === 1) {
    return location.hours[0];
  }

  if (day === 0) {
    return (
      location.hours.find(
        (line) => line.startsWith("Нд") || line.startsWith("Сб–Нд"),
      ) ?? location.hours.at(-1)!
    );
  }

  if (day === 6) {
    return (
      location.hours.find(
        (line) => line.startsWith("Сб") || line.startsWith("Сб–Нд"),
      ) ?? location.hours.at(-1)!
    );
  }

  return location.hours[0];
}

export function LocationsExplorer({
  locations,
  selectedLocationId,
  onSelectLocation,
}: LocationsExplorerProps) {
  const [openLocationId, setOpenLocationId] = useState<string | null>(null);
  const [mediaMode, setMediaMode] = useState<MediaMode>("photos");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const [desktopMapVisible, setDesktopMapVisible] = useState(false);
  const cityNavRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLElement>(null);
  const mediaDialogRef = useRef<HTMLDivElement>(null);
  const mediaCloseRef = useRef<HTMLButtonElement>(null);
  const thumbnailListRef = useRef<HTMLDivElement>(null);
  const photoTrackRef = useRef<HTMLDivElement>(null);
  const photoTrackWidthRef = useRef(0);
  const photoIndexRef = useRef(0);
  const photoTargetRef = useRef<number | null>(null);
  const selectableLocations = useMemo(() => locations.filter(location => !isInformationOnlyLocation(location)), [locations]);
  const cities = useMemo(
    () => Array.from(new Set(selectableLocations.map((location) => location.city))),
    [selectableLocations],
  );

  const selectedLocation =
    selectableLocations.find((location) => location.id === selectedLocationId) ??
    selectableLocations[0];

  const openLocation = useMemo(
    () =>
      selectableLocations.find((location) => location.id === openLocationId) ??
      null,
    [selectableLocations, openLocationId],
  );
  useModalDialog({ open: openLocation !== null, dialogRef: mediaDialogRef,
    initialFocusRef: mediaCloseRef, onClose: () => setOpenLocationId(null) });
  const visibleLocations = selectableLocations.filter(
    (location) => location.city === selectedLocation?.city,
  );
  const photoCount = openLocation?.gallery.length ?? 0;

  const selectPhoto = useCallback((index: number) => {
    const track = photoTrackRef.current;
    if (!track || !photoCount) return;
    const next = (index + photoCount) % photoCount;
    photoTargetRef.current = next;
    const slide = track.children[next] as HTMLElement;
    track.scrollTo({
      left: slide.offsetLeft,
      behavior: Math.abs(next - photoIndexRef.current) > 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [photoCount]);

  const movePhoto = useCallback((direction: -1 | 1) => {
    selectPhoto((photoTargetRef.current ?? photoIndexRef.current) + direction);
  }, [selectPhoto]);

  const updatePhotoPosition = () => {
    const track = photoTrackRef.current;
    if (!track?.clientWidth || !photoCount || track.clientWidth !== photoTrackWidthRef.current) return;
    const index = Math.max(0, Math.min(photoCount - 1, Math.round(track.scrollLeft / track.clientWidth)));
    photoIndexRef.current = index;
    setPhotoIndex(index);
    const target = photoTargetRef.current === null ? null : track.children[photoTargetRef.current] as HTMLElement;
    if (target && Math.abs(track.scrollLeft - target.offsetLeft) < 1) {
      photoTargetRef.current = null;
    }
  };

  useEffect(() => {
    const track = photoTrackRef.current;
    if (!track) return;
    // Re-align after a rotation or returning from video, never during a swipe.
    const resize = new ResizeObserver(() => {
      photoTrackWidthRef.current = track.clientWidth;
      photoTargetRef.current = null;
      const slide = track.children[photoIndexRef.current] as HTMLElement | undefined;
      track.scrollTo({ left: slide?.offsetLeft ?? 0, behavior: "auto" });
    });
    resize.observe(track);
    return () => {
      resize.disconnect();
      photoTrackWidthRef.current = 0;
    };
  }, [openLocationId, mediaMode]);

  useEffect(() => {
    const list = thumbnailListRef.current;
    const active = list?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!list || !active) return;
    const offset = active.getBoundingClientRect().left - list.getBoundingClientRect().left;
    list.scrollTo({ left: list.scrollLeft + offset - (list.clientWidth - active.clientWidth) / 2 });
  }, [openLocationId, photoIndex, mediaMode]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 821px)");
    const updateVisibility = () => setDesktopMapVisible(desktop.matches);
    updateVisibility();
    desktop.addEventListener("change", updateVisibility);
    return () => desktop.removeEventListener("change", updateVisibility);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentDay(new Date().getDay());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cityNavigation = cityNavRef.current;
    const activeCity =
      cityNavigation?.querySelector<HTMLButtonElement>(
        '[role="tab"][aria-selected="true"]',
      );

    if (!cityNavigation || !activeCity) {
      return;
    }

    cityNavigation.scrollTo({
      left: Math.max(0, activeCity.offsetLeft - 16),
      behavior: "smooth",
    });
  }, [selectedLocation?.city]);

  useEffect(() => {
    if (!openLocation) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenLocationId(null);
      }
      if (mediaMode === "photos" && openLocation.gallery.length > 1) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          movePhoto(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          movePhoto(1);
        }
      }
    };

    window.addEventListener("keydown", closeOnKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnKeyboard);
    };
  }, [mediaMode, openLocation, movePhoto]);

  const showLocation = (location: CenterLocation) => {
    onSelectLocation(location.id);
    setOpenLocationId(location.id);
    setMediaMode("photos");
    setPhotoIndex(0);
    photoIndexRef.current = 0;
    photoTargetRef.current = null;
  };

  const selectLocation = (location: CenterLocation, showMapWhenStacked = false) => {
    onSelectLocation(location.id);

    if (
      showMapWhenStacked &&
      window.matchMedia("(max-width: 1080px)").matches
    ) {
      window.requestAnimationFrame(() => {
        mapRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  };

  const handleCityKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % cities.length;
    else if (event.key === "ArrowLeft") nextIndex = (index + cities.length - 1) % cities.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = cities.length - 1;
    else return;
    event.preventDefault();
    const nextLocation = selectableLocations.find(location => location.city === cities[nextIndex]);
    if (!nextLocation) return;
    selectLocation(nextLocation);
    cityNavRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
  };

  if (!selectedLocation) {
    return <section id="locations" className="branch-directory" aria-label="Наші відділення"><p>Інформація про відділення уточнюється.</p></section>;
  }

  return (
    <>
      <section id="locations" style={{ scrollMarginTop: 100 }} className="branch-directory" aria-label="Наші відділення">
        <div className="branch-directory-controls">
          <div className="branch-city-nav-shell">
            <div
              className="branch-city-nav"
              style={{ gridTemplateColumns: `repeat(${Math.max(1, cities.length)}, minmax(0, 1fr))` }}
              role="tablist"
              aria-label="Міста"
              ref={cityNavRef}
            >
              {cities.map((city, index) => {
                const cityLocations = selectableLocations.filter(
                  (location) => location.city === city,
                );
                const isActive = selectedLocation.city === city;

                return (
                  <button
                    className={isActive ? "is-active" : ""}
                    type="button"
                    role="tab"
                    id={`branch-city-tab-${index}`}
                    aria-controls={`branch-city-panel-${index}`}
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    key={city}
                    onClick={() => selectLocation(cityLocations[0])}
                    onKeyDown={event => handleCityKeyDown(event, index)}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`branch-navigator ${styles.navigator}${visibleLocations.length === 1 ? " branch-navigator--single" : ""}`}>
          {cities.map((city, cityIndex) => {
            const cityLocations = selectableLocations.filter(location => location.city === city);
            return <div
              className={`branch-navigation-list ${styles.cityPanel}`}
              id={`branch-city-panel-${cityIndex}`}
              role="tabpanel"
              aria-labelledby={`branch-city-tab-${cityIndex}`}
              hidden={city !== selectedLocation.city}
              key={city}
            >
            {cityLocations.map((location) => {
              const isActive = location.id === selectedLocation.id;
              const galleryCover = location.gallery[0];
              const previewPhoto = location.id === "kostopil-hrushevskoho-4"
                && galleryCover?.src === "/locations/kostopil-hrushevskoho-4.jpg"
                ? kostopilFacade : galleryCover;

              return (
                <button
                  className={`branch-navigation-item ${styles.locationCard}${isActive ? " is-active" : ""}`}
                  type="button"
                  id={`branch-location-button-${location.id}`}
                  aria-controls={`branch-location-panel-${location.id}`}
                  aria-pressed={isActive}
                  key={location.id}
                  onClick={() => selectLocation(location, true)}
                >
                  <LocationPreview photo={previewPhoto} single={cityLocations.length === 1} />
                  <span className="branch-navigation-copy">
                    <strong>{location.address}</strong>
                    <small>
                      <span className={styles.locationType}>{location.type}</span>
                      <span className={styles.locationHours}>{location.hours[0]}</span>
                    </small>
                    <BranchServiceTags services={location.services} />
                    <span className={styles.cardArrow} aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m9 5 7 7-7 7" /></svg>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>;
          })}

          <aside
            className="branch-navigator-map"
            aria-live="polite"
            ref={mapRef}
          >
            <button className="branch-map-toggle outline-button" type="button" aria-expanded={mobileMapOpen} aria-controls="branch-map-frame" onClick={() => setMobileMapOpen((value) => !value)}>
              <svg className="branch-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{mobileMapOpen ? "Згорнути мапу" : "Показати на мапі"}</span>
              <svg className="branch-map-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div id="branch-map-frame" className={`branch-navigator-map-frame${mobileMapOpen ? " is-mobile-open" : ""}`}>
              <iframe
                key={selectedLocation.id}
                src={getMapEmbedUrl(selectedLocation)}
                title={`Карта: ${selectedLocation.fullAddress}`}
                loading={desktopMapVisible || mobileMapOpen ? "eager" : "lazy"}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {selectableLocations.map(location => (
            <div
              className={`branch-navigator-map-card ${styles.locationPanel}`}
              id={`branch-location-panel-${location.id}`}
              data-location-panel={location.id}
              role="region"
              aria-labelledby={`branch-location-title-${location.id}`}
              hidden={location.id !== selectedLocation.id}
              key={location.id}
            >
              <div className="branch-navigator-map-copy">
                <span>{location.type} · {location.city}</span>
                <h3 id={`branch-location-title-${location.id}`}>{location.fullAddress}</h3>
                <BranchServiceTags services={location.services} />
                <div className="branch-desktop-hours">
                  <strong>Графік роботи</strong>
                  <div>
                    {location.hours.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                </div>
                <div className="branch-today-hours">
                  <strong>{location.hours.length === 1 ? "Графік роботи" : "Сьогодні"}</strong>
                  <span>{getHoursForDay(location, currentDay)}</span>
                </div>
                {location.hours.length > 1 ? (
                  <details className="branch-full-hours">
                    <summary>Увесь графік</summary>
                    <div>
                      {location.hours.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>
              <div className="branch-navigator-actions">
                {location.phone && <><a className="branch-direct-phone" href={sitePhoneHref(location.phone)}>{location.phone}</a>
                <a className="book-button branch-direct-call" href={sitePhoneHref(location.phone)}>
                  Зателефонувати у відділення
                </a></>}
                <button type="button" onClick={() => showLocation(location)}>
                  <svg className="branch-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h3l2-3h6l2 3h3a2 2 0 0 1 2 2v11H2V8a2 2 0 0 1 2-2Z"/><circle cx="12" cy="12" r="4"/></svg>
                  <span>Фото і відео</span>
                </button>
                <a
                  className="outline-button"
                  href={getDirectionsUrl(location)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <DirectionsIcon />
                  <span>Прокласти маршрут</span>
                </a>
              </div>
            </div>
            ))}
          </aside>
        </div>
      </section>


      {openLocation ? createPortal(
        <div
          ref={mediaDialogRef}
          className="branch-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setOpenLocationId(null);
            }
          }}
        >
          <div className="mobile-overlay-dismiss" aria-hidden="true" onClick={() => setOpenLocationId(null)} />
          <section
            className="branch-modal branch-modal--gallery"
            role="dialog"
            aria-modal="true"
            aria-labelledby="branch-modal-title"
          >
            <div className="branch-modal-header">
              <div>
                <span>{openLocation.type}</span>
                <h2 id="branch-modal-title">{openLocation.fullAddress}</h2>
              </div>
              <button
                className="branch-modal-close"
                ref={mediaCloseRef}
                type="button"
                onClick={() => setOpenLocationId(null)}
                aria-label="Закрити перегляд відділення"
              >
                <CloseIcon />
              </button>
            </div>

            {openLocation.videoUrl ? (
            <div className="branch-modal-tabs" role="tablist" aria-label="Медіа відділення">
              <button
                className={mediaMode === "photos" ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={mediaMode === "photos"}
                onClick={() => setMediaMode("photos")}
              >
                Фото
              </button>
              {openLocation.videoUrl ? (
                <button
                  className={mediaMode === "video" ? "is-active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={mediaMode === "video"}
                  onClick={() => setMediaMode("video")}
                >
                  Відеоогляд
                </button>
              ) : null}
            </div>

            ) : null}

            <div className="branch-modal-body branch-modal-body--gallery">
              <div className="branch-media-viewer">
                {mediaMode === "photos" && openLocation.gallery[photoIndex] ? (
                  <>
                    <div className="branch-main-photo">
                      <div
                        className="branch-photo-image"
                        ref={photoTrackRef}
                        role="group"
                        aria-label="Фотографії відділення"
                        onScroll={updatePhotoPosition}
                        onPointerDown={() => { photoTargetRef.current = null; }}
                        onTouchStart={() => { photoTargetRef.current = null; }}
                        onWheel={() => { photoTargetRef.current = null; }}
                      >
                        {openLocation.gallery.map((photo, index) => (
                          <div className="branch-photo-slide" key={photo.src} aria-hidden={index !== photoIndex}>
                            <Image
                              src={resolveImageSource(photo.src)} unoptimized={!canOptimizeImage(photo.src)}
                              alt={photo.alt}
                              fill
                              quality={85}
                              loading={Math.abs(index - photoIndex) <= 1 ? "eager" : "lazy"}
                              draggable={false}
                              sizes="(max-width: 760px) 100vw, (max-width: 1080px) and (max-height: 500px) 100vw, (max-width: 1080px) calc(100vw - 66px), (max-width: 1228px) calc(100vw - 82px), 1146px"
                            />
                          </div>
                        ))}
                      </div>
                      {openLocation.gallery.length > 1 ? (
                        <div className="branch-photo-controls">
                          <button
                            type="button"
                            aria-label="Попереднє фото"
                            onClick={() => movePhoto(-1)}
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            aria-label="Наступне фото"
                            onClick={() => movePhoto(1)}
                          >
                            →
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div className="branch-thumbnail-list" ref={thumbnailListRef}>
                      {openLocation.gallery.map((photo, index) => (
                        <button
                          className={index === photoIndex ? "is-active" : ""}
                          type="button"
                          key={photo.src}
                          onClick={() => selectPhoto(index)}
                          aria-label={`Відкрити фото ${index + 1}`}
                          aria-pressed={index === photoIndex}
                        >
                          <Image
                            src={resolveImageSource(photo.src)} unoptimized={!canOptimizeImage(photo.src)}
                            alt=""
                            fill
                            quality={85}
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                ) : openLocation.videoUrl ? (
                  <video
                    className="branch-location-video"
                    src={openLocation.videoUrl}
                    controls
                    preload="metadata"
                  >
                    Ваш браузер не підтримує відтворення відео.
                  </video>
                ) : null}
              </div>


            </div>
          </section>
        </div>, document.body
      ) : null}
    </>
  );
}
