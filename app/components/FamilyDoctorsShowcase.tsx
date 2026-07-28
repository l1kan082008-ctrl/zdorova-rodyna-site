"use client";

import Link from "next/link";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Doctor } from "../doctors/doctorData";
import { getDoctorInitials } from "../doctors/doctorData";

type FamilyDoctorsShowcaseProps = {
  doctors: Doctor[];
};

const formatSpecialty = (specialty: string) =>
  specialty
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" · ");

function DoctorGlyph() {
  return (
    <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
      <circle cx="32" cy="15" r="8" />
      <path d="M13 57v-9c0-11 8-19 19-19s19 8 19 19v9M22 32v9a10 10 0 0 0 20 0v-9M19 57V45M45 57V45" />
      <circle cx="42" cy="43" r="3" />
    </svg>
  );
}

export function FamilyDoctorsShowcase({
  doctors,
}: FamilyDoctorsShowcaseProps) {
  const [activeId, setActiveId] = useState(doctors[0]?.id ?? "");
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingId = useRef<string | null>(null);
  const activeDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === activeId) ?? doctors[0],
    [activeId, doctors],
  );
  const clearHoverTimer = useCallback(() => {
    if (!hoverTimer.current) return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    pendingId.current = null;
  }, []);
  const previewDoctor = useCallback(
    (doctorId: string, immediate = false) => {
      clearHoverTimer();
      if (doctorId === activeId) return;

      if (immediate) {
        setActiveId(doctorId);
        return;
      }

      pendingId.current = doctorId;
      hoverTimer.current = setTimeout(() => {
        setActiveId(doctorId);
        hoverTimer.current = null;
        pendingId.current = null;
      }, 70);
    },
    [activeId, clearHoverTimer],
  );
  const previewDoctorFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse") return;

      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-doctor-id]",
      );
      const doctorId = target?.dataset.doctorId;

      if (
        !doctorId ||
        !event.currentTarget.contains(target) ||
        doctorId === activeId ||
        doctorId === pendingId.current
      ) {
        return;
      }

      previewDoctor(doctorId);
    },
    [activeId, previewDoctor],
  );

  useEffect(() => clearHoverTimer, [clearHoverTimer]);

  if (!activeDoctor) return null;

  return (
    <div className="family-doctors-showcase">
      <div
        className="family-doctors-gallery"
        aria-label="Сімейні лікарі медичного центру"
        onPointerLeave={clearHoverTimer}
        onPointerMove={previewDoctorFromPointer}
      >
        {doctors.map((doctor) => {
          const isActive = doctor.id === activeDoctor.id;

          return (
            <Link
              className={`family-doctor-panel${isActive ? " is-active" : ""}${
                doctor.photoUrl ? "" : " has-placeholder"
              }`}
              data-doctor-id={doctor.id}
              href={`/doctors/${doctor.id}`}
              key={doctor.id}
              onBlur={clearHoverTimer}
              onFocus={() => previewDoctor(doctor.id, true)}
              onPointerDown={() => previewDoctor(doctor.id, true)}
              aria-label={`Переглянути профіль лікаря ${doctor.name}`}
              aria-current={isActive ? "true" : undefined}
              style={
                doctor.photoUrl
                  ? { backgroundImage: `url("${doctor.photoUrl}")` }
                  : undefined
              }
            >
              {!doctor.photoUrl ? (
                <span className="family-doctor-initials" aria-hidden="true">
                  {getDoctorInitials(doctor.name)}
                </span>
              ) : null}
              <span className="family-doctor-panel-shade" aria-hidden="true" />
              <span className="family-doctor-panel-copy">
                <strong>{doctor.name}</strong>
                <span>{formatSpecialty(doctor.specialty)}</span>
                <i aria-hidden="true">→</i>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="family-doctors-summary" aria-live="polite">
        <div
          className="family-doctors-summary-content"
          key={activeDoctor.id}
        >
          <span className="family-doctors-icon">
            <DoctorGlyph />
          </span>
          <span className="family-doctors-label">Сімейний лікар</span>
          <h3>{activeDoctor.name}</h3>
          <p className="family-doctors-specialty">
            {formatSpecialty(activeDoctor.specialty)}
          </p>
          <p className="family-doctors-description">
            Первинні консультації, профілактика та супровід здоров’я всієї
            родини.
          </p>
          <div className="family-doctors-facts">
            {activeDoctor.experienceYears ? (
              <span>Досвід {activeDoctor.experienceYears} років</span>
            ) : null}
            {activeDoctor.patientGroups.includes("adults") ? (
              <span>Дорослі</span>
            ) : null}
            {activeDoctor.patientGroups.includes("children") ? (
              <span>Діти</span>
            ) : null}
          </div>
          <Link
            className="family-doctors-profile-link"
            href={`/doctors/${activeDoctor.id}`}
          >
            Переглянути профіль <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
