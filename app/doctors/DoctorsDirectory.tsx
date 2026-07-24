"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultDoctors,
  getDoctorAvailability,
  getDoctorInitials,
  getScheduleSummary,
  weekDays,
  type Doctor,
} from "./doctorData";

const initiallyVisible = 12;

export function DoctorsDirectory() {
  const [doctors, setDoctors] = useState<Doctor[]>(defaultDoctors);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/doctors")
      .then((response) => {
        if (!response.ok) throw new Error("Doctors API unavailable");
        return response.json() as Promise<{ doctors: Doctor[] }>;
      })
      .then((payload) => {
        if (active && payload.doctors.length) setDoctors(payload.doctors);
      })
      .catch(() => {
        // The verified static list remains visible if storage is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  const specialties = useMemo(
    () =>
      Array.from(new Set(doctors.map((doctor) => doctor.specialty))).sort(
        (left, right) => left.localeCompare(right, "uk"),
      ),
    [doctors],
  );

  const filteredDoctors = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("uk");

    return doctors.filter((doctor) => {
      const matchesQuery =
        !normalized ||
        `${doctor.name} ${doctor.specialty} ${doctor.branch}`
          .toLocaleLowerCase("uk")
          .includes(normalized);
      const matchesSpecialty =
        specialty === "all" || doctor.specialty === specialty;

      return matchesQuery && matchesSpecialty;
    });
  }, [doctors, query, specialty]);

  const hasActiveFilters = Boolean(query.trim() || specialty !== "all");
  const visibleDoctors =
    showAll || hasActiveFilters
      ? filteredDoctors
      : filteredDoctors.slice(0, initiallyVisible);

  return (
    <section className="doctors-directory-section" aria-label="Каталог лікарів">
      <div className="directory-toolbar doctor-directory-toolbar">
        <label htmlFor="doctor-search">
          <span>Пошук лікаря</span>
          <input
            id="doctor-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowAll(false);
            }}
            placeholder="Прізвище або спеціальність"
            autoComplete="off"
          />
        </label>
        <label htmlFor="doctor-specialty">
          <span>Напрям</span>
          <select
            id="doctor-specialty"
            value={specialty}
            onChange={(event) => {
              setSpecialty(event.target.value);
              setShowAll(false);
            }}
          >
            <option value="all">Усі спеціальності</option>
            {specialties.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visibleDoctors.length ? (
        <div className="doctors-directory">
          {visibleDoctors.map((doctor) => {
            const activeSchedule = weekDays.filter(
              (day) => doctor.schedule[day.key],
            );
            const availability = getDoctorAvailability(
              doctor.availabilityStatus,
            );
            const isPaused = availability.value === "paused";
            const needsConfirmation =
              availability.value === "by-confirmation";

            return (
              <article className="doctor-profile-card" key={doctor.id}>
                <div className="doctor-profile-photo">
                  {doctor.photoUrl ? (
                    <div
                      className="doctor-photo-image"
                      role="img"
                      aria-label={`Фотографія лікаря ${doctor.name}`}
                      style={{ backgroundImage: `url("${doctor.photoUrl}")` }}
                    />
                  ) : (
                    <div className="doctor-photo-placeholder" aria-hidden="true">
                      {getDoctorInitials(doctor.name)}
                    </div>
                  )}
                  <span
                    className={`doctor-status is-${availability.value}`}
                  >
                    <i aria-hidden="true" />
                    {availability.label}
                  </span>
                </div>

                <div className="doctor-profile-content">
                  <span className="doctor-specialty">{doctor.specialty}</span>
                  <h2>{doctor.name}</h2>

                  <div className="doctor-profile-meta">
                    {doctor.experienceYears ? (
                      <span>Досвід {doctor.experienceYears} років</span>
                    ) : null}
                    <span>
                      {doctor.branch || "Відділення уточнюйте"}
                    </span>
                  </div>

                  {doctor.description ? (
                    <p className="doctor-description">{doctor.description}</p>
                  ) : null}

                  <div className="doctor-schedule-preview">
                    <span>Графік прийому</span>
                    <strong>{getScheduleSummary(doctor.schedule)}</strong>
                    {activeSchedule.length ? (
                      <details>
                        <summary>Переглянути тиждень</summary>
                        <div className="doctor-week">
                          {weekDays.map((day) => (
                            <div key={day.key}>
                              <span>{day.short}</span>
                              <b>{doctor.schedule[day.key] || "—"}</b>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : (
                      <small>
                        Актуальний час підтвердить адміністратор
                      </small>
                    )}
                  </div>

                  {isPaused ? (
                    <button
                      className="book-button doctor-book-button"
                      type="button"
                      disabled
                    >
                      Запис недоступний
                    </button>
                  ) : (
                    <a
                      className="book-button doctor-book-button"
                      href={`/contacts?doctor=${encodeURIComponent(doctor.name)}#booking`}
                    >
                      {needsConfirmation
                        ? "Уточнити прийом"
                        : "Записатися"}{" "}
                      <span>→</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="directory-empty">
          <h2>Лікаря не знайдено</h2>
          <p>Спробуйте інше прізвище або напрям.</p>
          <button
            className="outline-button"
            type="button"
            onClick={() => {
              setQuery("");
              setSpecialty("all");
            }}
          >
            Очистити фільтри
          </button>
        </div>
      )}

      {!hasActiveFilters && filteredDoctors.length > initiallyVisible ? (
        <button
          className="outline-button directory-more"
          type="button"
          onClick={() => setShowAll((current) => !current)}
          aria-expanded={showAll}
        >
          {showAll ? "Згорнути список" : "Показати всіх лікарів"}
          <span>{showAll ? " ↑" : " ↓"}</span>
        </button>
      ) : null}
    </section>
  );
}
