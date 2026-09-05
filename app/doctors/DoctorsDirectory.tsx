"use client";

import { useEffect, useMemo, useState } from "react";
import {
  doctorPatientGroupOptions,
  getDoctorInitials,
  formatDoctorConsultationPrice,
  getScheduleSummary,
  weekDays,
  type Doctor,
} from "./doctorData";

const formatDoctorSpecialty = (specialty: string) =>
  specialty
    .split(/\s*,\s*/)
    .filter(Boolean)
    .join(" · ");

const formatDoctorBranch = (branch: string) => {
  const value = branch.trim();
  if (!value) return "Відділення уточнюйте";
  if (/^відділення\s*:/iu.test(value)) return value;
  if (/^(?:вул\.?\s*)?стельмаха[,\s]+18[-\s]*м$/iu.test(value)) {
    return "вул. Стельмаха, 18-М";
  }

  return value;
};

type MobileDoctorView = "single" | "double" | "quad";

const mobileDoctorViewStorageKey = "zdorova-rodyna-doctors-view";

const groupedSpecialties = [
  {
    value: "group:family",
    label: "Сімейна медицина",
    keywords: ["сімейний лікар"],
    urlAliases: ["сімейна медицина", "сімейний лікар", "сімейні лікарі"],
  },
  {
    value: "group:pediatrics",
    label: "Педіатрія",
    keywords: ["педіатр"],
    urlAliases: ["педіатр", "педіатрія"],
  },
  {
    value: "group:cardiology",
    label: "Кардіологія",
    keywords: ["кардіолог"],
    urlAliases: ["кардіолог", "кардіологія"],
  },
  {
    value: "group:neurology",
    label: "Неврологія",
    keywords: ["невролог", "невропатолог"],
    urlAliases: ["невролог", "неврологія", "невропатолог"],
  },
  {
    value: "group:gastroenterology",
    label: "Гастроентерологія",
    keywords: ["гастроентеролог"],
    urlAliases: ["гастроентеролог", "гастроентерологія"],
  },
  {
    value: "group:dermatology",
    label: "Дерматологія",
    keywords: ["дерматолог"],
    urlAliases: ["дерматолог", "дерматологія"],
  },
  {
    value: "group:gynecology",
    label: "Гінекологія",
    keywords: ["гінеколог"],
    urlAliases: ["гінеколог", "гінекологія", "акушер-гінеколог"],
  },
  {
    value: "group:surgery-urology",
    label: "Хірургія та урологія",
    keywords: ["хірург", "уролог"],
    urlAliases: [
      "хірург",
      "хірургія",
      "уролог",
      "урологія",
      "хірургія та урологія",
    ],
  },
] as const;

export function DoctorsDirectory({
  initialDoctors,
}: {
  initialDoctors: Doctor[];
}) {
  const doctors = initialDoctors;
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [focusedDoctorId, setFocusedDoctorId] = useState<string | null>(null);
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileDoctorView>("single");

  useEffect(() => {
    const savedView = window.localStorage.getItem(mobileDoctorViewStorageKey);
    if (savedView === "single" || savedView === "double" || savedView === "quad") {
      setMobileView(savedView);
    }
  }, []);

  const changeMobileView = (nextView: MobileDoctorView) => {
    setMobileView(nextView);
    setFocusedDoctorId(null);
    setExpandedDoctorId(null);
    window.localStorage.setItem(mobileDoctorViewStorageKey, nextView);
  };

  const focusDoctorPhoto = (doctorId: string) => {
    if (mobileView === "single") {
      toggleDoctorDetails(doctorId);
      return;
    }

    if (focusedDoctorId === doctorId) {
      setFocusedDoctorId(null);
      setExpandedDoctorId(null);
      return;
    }

    setFocusedDoctorId(doctorId);
    setExpandedDoctorId(null);

    window.setTimeout(() => {
      document.getElementById(`doctor-card-${doctorId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
  };

  const toggleDoctorDetails = (doctorId: string) => {
    const willExpand = expandedDoctorId !== doctorId;
    if (mobileView !== "single") {
      setFocusedDoctorId(doctorId);
    }
    setExpandedDoctorId(willExpand ? doctorId : null);

    if (willExpand && mobileView !== "single") {
      window.setTimeout(() => {
        document.getElementById(`doctor-card-${doctorId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 80);
    }
  };

  const specialties = useMemo(
    () =>
      Array.from(new Set(doctors.map((doctor) => doctor.specialty))).sort(
        (left, right) => left.localeCompare(right, "uk"),
      ),
    [doctors],
  );

  useEffect(() => {
    const requestedSearch = new URLSearchParams(window.location.search).get("search");
    if (requestedSearch) setQuery(requestedSearch);
    const requestedSpecialty = new URLSearchParams(window.location.search)
      .get("specialty")
      ?.trim();

    if (!requestedSpecialty) return;

    const normalizedRequested = requestedSpecialty.toLocaleLowerCase("uk");
    const matchingGroup = groupedSpecialties.find((group) =>
      group.urlAliases.some((alias) => alias === normalizedRequested),
    );

    if (matchingGroup) {
      setSpecialty(matchingGroup.value);
      return;
    }

    const matchingSpecialty = specialties.find((item) =>
      item
        .toLocaleLowerCase("uk")
        .split(/\s*,\s*/)
        .some(
          (part) =>
            part === normalizedRequested || part.includes(normalizedRequested),
        ),
    );

    if (matchingSpecialty) setSpecialty(matchingSpecialty);
  }, [specialties]);

  const filteredDoctors = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("uk");

    return doctors.filter((doctor) => {
      const matchesQuery =
        !normalized ||
        `${doctor.name} ${doctor.specialty} ${doctor.branch}`
          .toLocaleLowerCase("uk")
          .includes(normalized);
      const selectedGroup = groupedSpecialties.find(
        (group) => group.value === specialty,
      );
      const normalizedSpecialty = doctor.specialty.toLocaleLowerCase("uk");
      const matchesSpecialty =
        specialty === "all" ||
        doctor.specialty === specialty ||
        Boolean(
          selectedGroup?.keywords.some((keyword) =>
            normalizedSpecialty.includes(keyword),
          ),
        );

      return matchesQuery && matchesSpecialty;
    });
  }, [doctors, query, specialty]);

  const visibleDoctors = filteredDoctors;

  return (
    <section className="doctors-directory-section" aria-label="Каталог лікарів">
      <div className="directory-toolbar doctor-directory-toolbar">
        <label htmlFor="doctor-search">
          <span>Пошук лікаря</span>
          <input
            id="doctor-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Прізвище або спеціальність"
            autoComplete="off"
          />
        </label>
        <label htmlFor="doctor-specialty">
          <span>Напрям</span>
          <select
            id="doctor-specialty"
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
          >
            <option value="all">Усі спеціальності</option>
            {groupedSpecialties.map((group) => (
              <option value={group.value} key={group.value}>
                {group.label}
              </option>
            ))}
            {specialties.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="doctor-mobile-view-picker" aria-label="Кількість карток лікарів на екрані">
        <span>Вигляд</span>
        <div role="group" aria-label="Оберіть щільність карток">
          {(
            [
              ["single", "Одна картка", "1"],
              ["double", "Дві картки", "2"],
              ["quad", "Чотири картки", "4"],
            ] as const
          ).map(([value, label, shortLabel]) => (
            <button
              className={mobileView === value ? "is-active" : ""}
              type="button"
              aria-label={label}
              aria-pressed={mobileView === value}
              title={label}
              onClick={() => changeMobileView(value)}
              key={value}
            >
              <i className={`doctor-view-icon is-${value}`} aria-hidden="true" />
              <b>{shortLabel}</b>
            </button>
          ))}
        </div>
      </div>

      {visibleDoctors.length ? (
        <div className={`doctors-directory doctors-directory-v2 is-mobile-view-${mobileView}`}>
          {visibleDoctors.map((doctor) => {
            const activeSchedule = weekDays.filter(
              (day) => doctor.schedule[day.key],
            );
            const profileHref = `/doctors/${doctor.id}`;
            const bookingHref = `/contacts?doctor=${encodeURIComponent(doctor.name)}#booking`;
            const isFocused = focusedDoctorId === doctor.id;
            const isExpanded = expandedDoctorId === doctor.id;
            const patientGroups = doctorPatientGroupOptions
              .filter((option) => doctor.patientGroups?.includes(option.value))
              .map((option) => option.label)
              .join(" · ");

            return (
              <article
                className={`doctor-profile-card doctor-profile-card-v2${isFocused ? " is-focused" : ""}${isExpanded ? " is-expanded" : ""}`}
                key={doctor.id}
                id={`doctor-card-${doctor.id}`}
              >
                <div className="doctor-card-photo-link">
                  {doctor.photoUrl ? (
                    <span
                      className="doctor-photo-image"
                      role="img"
                      aria-label={`Фотографія лікаря ${doctor.name}`}
                      style={{ backgroundImage: `url("${doctor.photoUrl}")` }}
                    />
                  ) : (
                    <span className="doctor-photo-placeholder" aria-hidden="true">
                      {getDoctorInitials(doctor.name)}
                    </span>
                  )}

                  <a
                    className="doctor-card-photo-profile-link"
                    href={profileHref}
                    aria-label={`Відкрити профіль лікаря ${doctor.name}`}
                  />

                  <button
                    className="doctor-card-photo-toggle"
                    type="button"
                    aria-label={
                      mobileView === "single"
                        ? `${isExpanded ? "Сховати" : "Показати"} інформацію про лікаря ${doctor.name}`
                        : `Збільшити фотографію лікаря ${doctor.name}`
                    }
                    onClick={() => focusDoctorPhoto(doctor.id)}
                  />

                  <button
                    className="doctor-card-details-toggle"
                    type="button"
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? "Згорнути" : "Розкрити"} інформацію про лікаря ${doctor.name}`}
                    onClick={() => toggleDoctorDetails(doctor.id)}
                  >
                    <span aria-hidden="true" />
                  </button>

                  <span className="doctor-card-photo-identity">
                    <span>
                      <b>{doctor.name}</b>
                      <small>{formatDoctorSpecialty(doctor.specialty)}</small>
                      <span className="doctor-card-consultation-price">
                        Консультація · {formatDoctorConsultationPrice(doctor.consultationPrice)}
                      </span>
                    </span>
                  </span>

                  <a className="doctor-book-on-photo" href={bookingHref}>
                    Записатися <span aria-hidden="true">→</span>
                  </a>
                </div>

                <div className="doctor-profile-content doctor-card-editorial-content">
                  <div className="doctor-card-facts">
                    <div>
                      <span>Досвід</span>
                      <strong>
                        {doctor.experienceYears
                          ? `${doctor.experienceYears} років`
                          : "Уточнюйте"}
                      </strong>
                    </div>
                    <div>
                      <span>Приймає</span>
                      <strong>{patientGroups || "Вік уточнюйте"}</strong>
                    </div>
                    <div>
                      <span>Відділення</span>
                      <strong>{formatDoctorBranch(doctor.branch)}</strong>
                    </div>
                    <div>
                      <span>Консультація</span>
                      <strong>{formatDoctorConsultationPrice(doctor.consultationPrice)}</strong>
                    </div>
                  </div>

                  <div className="doctor-card-schedule-line">
                    <div>
                      <span>Найближчий графік</span>
                      <strong>{getScheduleSummary(doctor.schedule)}</strong>
                    </div>
                    {activeSchedule.length ? (
                      <details>
                        <summary>
                          <span>Графік на тиждень</span>
                          <i aria-hidden="true" />
                        </summary>
                        <div className="doctor-week">
                          {activeSchedule.map((day) => (
                            <div key={day.key}>
                              <span>{day.label}</span>
                              <b>{doctor.schedule[day.key]}</b>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : (
                      <small>Час підтвердить адміністратор</small>
                    )}
                  </div>

                  <div className="doctor-card-text-actions">
                    <a
                      className="doctor-biography-link"
                      href={profileHref}
                    >
                      Біографія
                    </a>
                    <a
                      className="doctor-book-text-link doctor-book-cta"
                      href={bookingHref}
                    >
                      Записатися <span>→</span>
                    </a>
                  </div>
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

    </section>
  );
}
