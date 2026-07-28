"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  const activeDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === activeId) ?? doctors[0],
    [activeId, doctors],
  );

  if (!activeDoctor) return null;

  return (
    <div className="family-doctors-showcase">
      <div
        className="family-doctors-gallery"
        aria-label="Сімейні лікарі медичного центру"
      >
        {doctors.map((doctor) => {
          const isActive = doctor.id === activeDoctor.id;

          return (
            <button
              className={`family-doctor-panel${isActive ? " is-active" : ""}${
                doctor.photoUrl ? "" : " has-placeholder"
              }`}
              data-doctor-id={doctor.id}
              key={doctor.id}
              type="button"
              onClick={() => setActiveId(doctor.id)}
              aria-controls="family-doctors-summary"
              aria-expanded={isActive}
              aria-label={`Показати інформацію про лікаря ${doctor.name}`}
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
            </button>
          );
        })}
      </div>

      <div
        className="family-doctors-summary"
        id="family-doctors-summary"
        aria-live="polite"
      >
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
