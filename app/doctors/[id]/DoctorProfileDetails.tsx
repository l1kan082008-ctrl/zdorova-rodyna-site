"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getDoctorAvailability,
  getDoctorInitials,
  getDoctorPatientGroups,
  weekDays,
  type Doctor,
} from "../doctorData";

type DoctorPayload = {
  doctor?: Doctor;
  error?: string;
};

export function DoctorProfileDetails({ doctorId }: { doctorId: string }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(`/api/doctors?id=${encodeURIComponent(doctorId)}`)
      .then(async (response) => {
        const payload = (await response.json()) as DoctorPayload;
        if (!response.ok || !payload.doctor) {
          throw new Error(payload.error || "Лікаря не знайдено");
        }
        if (active) setDoctor(payload.doctor);
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : "Сталася помилка",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [doctorId]);

  if (loading) {
    return (
      <section className="doctor-detail-state" aria-live="polite">
        Завантажуємо профіль лікаря…
      </section>
    );
  }

  if (!doctor || error) {
    return (
      <section className="doctor-detail-state">
        <span className="section-kicker">Лікарі</span>
        <h1>{error || "Лікаря не знайдено"}</h1>
        <p>Поверніться до каталогу та оберіть іншого спеціаліста.</p>
        <Link className="outline-button" href="/doctors">
          ← До всіх лікарів
        </Link>
      </section>
    );
  }

  const availability = getDoctorAvailability(doctor.availabilityStatus);
  const isPaused = availability.value === "paused";
  const needsConfirmation = availability.value === "by-confirmation";
  const biographyParagraphs = doctor.biography
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <>
      <section className="doctor-detail-shell">
        <Link className="doctor-detail-back" href="/doctors">
          ← Всі лікарі
        </Link>

        <div className="doctor-detail-hero">
          <div className="doctor-detail-photo">
            {doctor.photoUrl ? (
              <div
                role="img"
                aria-label={`Фотографія лікаря ${doctor.name}`}
                style={{ backgroundImage: `url("${doctor.photoUrl}")` }}
              />
            ) : (
              <span aria-hidden="true">{getDoctorInitials(doctor.name)}</span>
            )}
          </div>

          <div className="doctor-detail-heading">
            <span
              className={`doctor-detail-status is-${availability.value}`}
            >
              <i aria-hidden="true" />
              {availability.label}
            </span>
            <span className="doctor-specialty">{doctor.specialty}</span>
            <h1>{doctor.name}</h1>

            <dl className="doctor-detail-facts">
              <div>
                <dt>Стаж роботи</dt>
                <dd>
                  {doctor.experienceYears
                    ? `${doctor.experienceYears} років`
                    : "Уточнюється"}
                </dd>
              </div>
              <div>
                <dt>Приймає</dt>
                <dd>{getDoctorPatientGroups(doctor.patientGroups ?? [])}</dd>
              </div>
              <div>
                <dt>Місце прийому</dt>
                <dd>{doctor.branch || "Відділення уточнюйте"}</dd>
              </div>
            </dl>

            {doctor.description ? (
              <p className="doctor-detail-lead">{doctor.description}</p>
            ) : null}

            <div className="doctor-detail-actions">
              {isPaused ? (
                <button className="book-button" type="button" disabled>
                  Запис тимчасово недоступний
                </button>
              ) : (
                <a
                  className="book-button"
                  href={`/contacts?doctor=${encodeURIComponent(doctor.name)}#booking`}
                >
                  {needsConfirmation
                    ? "Уточнити можливість прийому"
                    : "Записатися на прийом"}{" "}
                  <span>→</span>
                </a>
              )}
              <a className="outline-button" href="tel:+380676714444">
                +38 (067) 671-44-44
              </a>
            </div>
          </div>
        </div>

        <div className="doctor-detail-content">
          <article className="doctor-biography">
            <span className="section-kicker">Про лікаря</span>
            <h2>Біографія та професійний досвід</h2>
            {biographyParagraphs.length ? (
              biographyParagraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>
              ))
            ) : (
              <div className="doctor-biography-empty">
                <strong>Інформація доповнюється</strong>
                <p>
                  Детальну інформацію про освіту, кваліфікацію та професійний
                  досвід можна уточнити в адміністратора центру.
                </p>
              </div>
            )}
          </article>

          <aside className="doctor-detail-schedule">
            <span className="section-kicker">Графік</span>
            <h2>Години прийому</h2>
            <div>
              {weekDays.map((day) => (
                <p key={day.key}>
                  <span>{day.label}</span>
                  <strong>{doctor.schedule[day.key] || "Не приймає"}</strong>
                </p>
              ))}
            </div>
            <small>
              Перед візитом радимо підтвердити актуальний час в адміністратора.
            </small>
          </aside>
        </div>
      </section>
    </>
  );
}
