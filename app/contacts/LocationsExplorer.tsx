"use client";
import { CloseIcon } from "../components/CloseIcon";
import { createPortal } from "react-dom";
import { useModalDialog } from "../components/useModalDialog";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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

function DirectionsIcon() {
  return <svg className="branch-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21 3-7 18-3-8-8-3 18-7Z" /></svg>;
}

function getLocationIconType(location: CenterLocation) {
  if (location.services.length === 1 && location.services[0] === "laboratory") return "laboratory";
  return location.services.length > 3 ? "center" : "clinic";
}

function LocationIcon({ location }: { location: CenterLocation }) {
  const type = getLocationIconType(location);
  return (
    <svg className="branch-location-symbol" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === "laboratory" ? (
        <>
          <rect x="7" y="2" width="10" height="5" rx="1.2" fill="currentColor" stroke="none" />
          <path d="M8 7v11a4 4 0 0 0 8 0V7" />
          <rect x="10" y="10" width="4" height="6" rx="0.7" fill="currentColor" fillOpacity="0.25" stroke="none" />
        </>
      ) : type === "center" ? (
        <>
          <path d="M7 21V3h10v18M7 9H2v12h20V9h-5M10 21v-5h4v5M12 6v6M9 9h6M4 13h1M4 17h1M19 13h1M19 17h1" />
        </>
      ) : (
        <>
          <rect x="5" y="7" width="14" height="14" rx="2" />
          <path d="M12 10v4M10 12h4M10 21v-4h4v4" />
        </>
      )}
    </svg>
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
  const cityNavRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLElement>(null);
  const mediaDialogRef = useRef<HTMLElement>(null);
  const mediaCloseRef = useRef<HTMLButtonElement>(null);
  useModalDialog({ open: openLocationId !== null, dialogRef: mediaDialogRef,
    initialFocusRef: mediaCloseRef, onClose: () => setOpenLocationId(null) });

  const cities = useMemo(
    () => Array.from(new Set(locations.map((location) => location.city))),
    [locations],
  );

  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) ??
    locations[0];

  const openLocation = useMemo(
    () =>
      locations.find((location) => location.id === openLocationId) ??
      null,
    [locations, openLocationId],
  );
  const visibleLocations = locations.filter(
    (location) => location.city === selectedLocation.city,
  );

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
  }, [selectedLocation.city]);

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
          setPhotoIndex((current) =>
            current === 0 ? openLocation.gallery.length - 1 : current - 1,
          );
        }
        if (event.key === "ArrowRight") {
          setPhotoIndex((current) =>
            current === openLocation.gallery.length - 1 ? 0 : current + 1,
          );
        }
      }
    };

    window.addEventListener("keydown", closeOnKeyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnKeyboard);
    };
  }, [mediaMode, openLocation]);

  const showLocation = (location: CenterLocation) => {
    onSelectLocation(location.id);
    setOpenLocationId(location.id);
    setMediaMode("photos");
    setPhotoIndex(0);
  };

  const selectLocation = (location: CenterLocation, showMapOnMobile = false) => {
    onSelectLocation(location.id);

    if (
      showMapOnMobile &&
      window.matchMedia("(max-width: 820px)").matches
    ) {
      window.requestAnimationFrame(() => {
        mapRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  };

  return (
    <>
      <section className="branch-directory" aria-label="Наші відділення">
        <div className="branch-directory-controls">
          <div className="branch-city-nav-shell">
            <div
              className="branch-city-nav"
              role="tablist"
              aria-label="Міста"
              ref={cityNavRef}
            >
              {cities.map((city) => {
                const cityLocations = locations.filter(
                  (location) => location.city === city,
                );
                const isActive = selectedLocation.city === city;

                return (
                  <button
                    className={isActive ? "is-active" : ""}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    key={city}
                    onClick={() => selectLocation(cityLocations[0])}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`branch-navigator${visibleLocations.length === 1 ? " branch-navigator--single" : ""}`}>
          <div className="branch-navigation-list">
            {visibleLocations.map((location) => {
              const isActive = location.id === selectedLocation.id;

              return (
                <button
                  className={`branch-navigation-item${isActive ? " is-active" : ""}`}
                  type="button"
                  aria-pressed={isActive}
                  key={location.id}
                  onClick={() => selectLocation(location, true)}
                >
                  <span className="branch-navigation-icon" aria-hidden="true">
                    <LocationIcon location={location} />
                  </span>
                  <span className="branch-navigation-copy">
                    <strong>{location.address}</strong>
                    <small>
                      {location.type} · {location.hours[0]}
                    </small>
                    <BranchServiceTags services={location.services} />
                  </span>
                  <span className="branch-navigation-arrow" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m9 5 7 7-7 7" /></svg>
                  </span>
                </button>
              );
            })}
          </div>

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
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="branch-navigator-map-card">
              <div className="branch-navigator-map-copy">
                <span>{selectedLocation.type}</span>
                <h3>{selectedLocation.address}</h3>
                <BranchServiceTags services={selectedLocation.services} />
                <div className="branch-desktop-hours">
                  <strong>Графік роботи</strong>
                  <div>
                    {selectedLocation.hours.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                </div>
                <div className="branch-today-hours">
                  <strong>Сьогодні</strong>
                  <span>{getHoursForDay(selectedLocation, currentDay)}</span>
                </div>
                {selectedLocation.hours.length > 1 ? (
                  <details className="branch-full-hours">
                    <summary>Увесь графік</summary>
                    <div>
                      {selectedLocation.hours.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>
              <div className="branch-navigator-actions">
                <a className="branch-direct-phone" href={`tel:${selectedLocation.phone}`}>{selectedLocation.phone}</a>
                <a className="book-button branch-direct-call" href={`tel:${selectedLocation.phone}`}>
                  Зателефонувати у відділення
                </a>
                <button type="button" onClick={() => showLocation(selectedLocation)}>
                  <svg className="branch-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h3l2-3h6l2 3h3a2 2 0 0 1 2 2v11H2V8a2 2 0 0 1 2-2Z"/><circle cx="12" cy="12" r="4"/></svg>
                  <span>Фото і відео</span>
                </button>
                <a
                  className="outline-button"
                  href={getDirectionsUrl(selectedLocation)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <DirectionsIcon />
                  <span>Прокласти маршрут</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {openLocation ? createPortal(
        <div
          className="branch-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setOpenLocationId(null);
            }
          }}
        >
          <section
            ref={mediaDialogRef}
            className="branch-modal"
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
                {mediaMode === "photos" ? (
                  <>
                    <div className="branch-main-photo">
                      <Image
                        src={openLocation.gallery[photoIndex].src}
                        alt={openLocation.gallery[photoIndex].alt}
                        fill
                        unoptimized
                        priority
                        sizes="(max-width: 850px) 100vw, 68vw"
                      />
                      {openLocation.gallery.length > 1 ? (
                        <div className="branch-photo-controls">
                          <button
                            type="button"
                            aria-label="Попереднє фото"
                            onClick={() =>
                              setPhotoIndex((current) =>
                                current === 0
                                  ? openLocation.gallery.length - 1
                                  : current - 1,
                              )
                            }
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            aria-label="Наступне фото"
                            onClick={() =>
                              setPhotoIndex((current) =>
                                current === openLocation.gallery.length - 1
                                  ? 0
                                  : current + 1,
                              )
                            }
                          >
                            →
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <p className="branch-photo-caption">
                      {openLocation.gallery[photoIndex].caption}
                    </p>
                    <div className="branch-thumbnail-list">
                      {openLocation.gallery.map((photo, index) => (
                        <button
                          className={index === photoIndex ? "is-active" : ""}
                          type="button"
                          key={photo.src}
                          onClick={() => setPhotoIndex(index)}
                          aria-label={`Відкрити фото ${index + 1}`}
                        >
                          <Image
                            src={photo.src}
                            alt=""
                            fill
                            unoptimized
                            sizes="84px"
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
