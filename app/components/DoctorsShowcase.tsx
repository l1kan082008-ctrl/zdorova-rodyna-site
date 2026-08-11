"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Doctor } from "../doctors/doctorData";
import { getDoctorInitials } from "../doctors/doctorData";

type DoctorsShowcaseProps = {
  doctors: Doctor[];
};

const formatSpecialty = (specialty: string) =>
  specialty
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" · ");

const getSurname = (name: string) => name.trim().split(/\s+/)[0] ?? name;

export function DoctorsShowcase({ doctors }: DoctorsShowcaseProps) {
  const [activeId, setActiveId] = useState(doctors[0]?.id ?? "");
  const viewportRef = useRef<HTMLDivElement>(null);
  const alignTimeoutRef = useRef<number | null>(null);
  const activeIndex = Math.max(
    0,
    doctors.findIndex((doctor) => doctor.id === activeId),
  );
  const activeDoctor = useMemo(
    () => doctors[activeIndex] ?? doctors[0],
    [activeIndex, doctors],
  );

  const alignDoctorInsideViewport = useCallback(
    (doctorId: string, behavior: ScrollBehavior = "smooth") => {
      const viewport = viewportRef.current;
      const panel = viewport?.querySelector<HTMLElement>(
        `[data-doctor-id="${doctorId}"]`,
      );

      if (!viewport || !panel) return;

      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const viewportRect = viewport.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const safeGutter = 6;
      let safeLeft = viewport.scrollLeft;

      if (panelRect.left < viewportRect.left + safeGutter) {
        safeLeft -= viewportRect.left + safeGutter - panelRect.left;
      } else if (panelRect.right > viewportRect.right - safeGutter) {
        safeLeft += panelRect.right - (viewportRect.right - safeGutter);
      }

      safeLeft = Math.min(maxScrollLeft, Math.max(0, safeLeft));

      viewport.scrollTo({ left: safeLeft, behavior });
    },
    [],
  );

  const selectDoctor = useCallback((doctorId: string) => {
    setActiveId(doctorId);

    if (alignTimeoutRef.current !== null) {
      window.clearTimeout(alignTimeoutRef.current);
    }

    requestAnimationFrame(() => {
      alignDoctorInsideViewport(doctorId);

      alignTimeoutRef.current = window.setTimeout(() => {
        alignDoctorInsideViewport(doctorId);
        alignTimeoutRef.current = null;
      }, 520);
    });
  }, [alignDoctorInsideViewport]);

  const selectAtIndex = useCallback(
    (nextIndex: number) => {
      const doctor = doctors[nextIndex];
      if (doctor) selectDoctor(doctor.id);
    },
    [doctors, selectDoctor],
  );

  if (!activeDoctor) return null;

  return (
    <div className="doctors-showcase">
      <div className="doctors-showcase-toolbar">
        <p aria-live="polite">
          <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
          <span>/</span>
          {String(doctors.length).padStart(2, "0")}
        </p>
        <div className="doctors-showcase-controls">
          <button
            type="button"
            onClick={() => selectAtIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Попередній лікар"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => selectAtIndex(activeIndex + 1)}
            disabled={activeIndex === doctors.length - 1}
            aria-label="Наступний лікар"
          >
            →
          </button>
        </div>
      </div>

      <div
        className="doctors-showcase-viewport"
        ref={viewportRef}
        aria-label="Лікарі медичного центру"
      >
        <div className="doctors-showcase-track" role="list">
          {doctors.map((doctor) => {
            const isActive = doctor.id === activeDoctor.id;
            const detailsId = `doctor-showcase-${doctor.id}`;

            return (
              <article
                className={`doctor-showcase-panel${isActive ? " is-active" : ""}${
                  doctor.photoUrl ? "" : " has-placeholder"
                }`}
                data-doctor-id={doctor.id}
                key={doctor.id}
                role="listitem"
              >
                <button
                  className="doctor-showcase-trigger"
                  type="button"
                  onClick={() => selectDoctor(doctor.id)}
                  aria-controls={detailsId}
                  aria-expanded={isActive}
                  aria-label={`Показати лікаря ${doctor.name}`}
                  style={
                    doctor.photoUrl
                      ? { backgroundImage: `url("${doctor.photoUrl}")` }
                      : undefined
                  }
                >
                  {!doctor.photoUrl ? (
                    <span className="doctor-showcase-initials" aria-hidden="true">
                      {getDoctorInitials(doctor.name)}
                    </span>
                  ) : null}
                  <span className="doctor-showcase-scrim" aria-hidden="true" />
                  <span className="doctor-showcase-collapsed-name" aria-hidden="true">
                    {getSurname(doctor.name)}
                  </span>
                  <span
                    className="doctor-showcase-copy"
                    id={detailsId}
                    aria-hidden={!isActive}
                  >
                    <strong>{doctor.name}</strong>
                    <span>{formatSpecialty(doctor.specialty)}</span>
                    <small>
                      {doctor.experienceYears
                        ? `Досвід ${doctor.experienceYears} років`
                        : "Детальніше про лікаря"}
                    </small>
                  </span>
                </button>

                {isActive ? (
                  <Link
                    className="doctor-showcase-profile-link"
                    href={`/doctors/${doctor.id}`}
                    aria-label={`Переглянути профіль лікаря ${doctor.name}`}
                  >
                    <span>Профіль</span>
                    <i aria-hidden="true">→</i>
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
