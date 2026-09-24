"use client";

import { doctorCategories as groupedSpecialties } from "./doctorCategories";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { canOptimizeImage, resolveImageSource } from "@/lib/imageSource";
import { doctorBookingHref, splitDoctorBranches } from "@/lib/doctorBranches";
import "./portraits.css";
import { CloseIcon } from "../components/CloseIcon";
import {
  doctorPatientGroupOptions,
  getDoctorInitials,
  formatDoctorConsultations,
  getDoctorConsultationPrices,
  canBookDoctorConsultation,
  getScheduleSummary,
  getDoctorScheduleDays,
  getDoctorScheduleNotice,
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

type MobileDoctorView = "double" | "quad";

const directoryUrl = (nextSpecialty: string, nextQuery: string) => {
  const params = new URLSearchParams();
  if (nextSpecialty !== "all") params.set("specialty", nextSpecialty);
  if (nextQuery) params.set("search", nextQuery);
  return `/doctors${params.size ? `?${params}` : ""}`;
};

// Keep the directory in the initial HTML while URL state hydrates separately.
function DirectoryUrlSync({ onChange }: { onChange: (params: string) => void }) {
  const searchParams = useSearchParams();
  const serializedParams = searchParams.toString();

  useEffect(() => {
    onChange(serializedParams);
  }, [serializedParams, onChange]);

  return null;
}

export function DoctorsDirectory({
  initialDoctors,
}: {
  initialDoctors: Doctor[];
}) {
  const doctors = initialDoctors;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [focusedDoctorId, setFocusedDoctorId] = useState<string | null>(null);
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileDoctorView>("quad");

  const changeFilters = (nextSpecialty: string, nextQuery: string) => {
    setSpecialty(nextSpecialty);
    setQuery(nextQuery);
    setFocusedDoctorId(null);
    setExpandedDoctorId(null);
    window.history.replaceState(null, "", directoryUrl(nextSpecialty, nextQuery));
  };

const changeMobileView = (nextView: MobileDoctorView) => {
    setMobileView(nextView);
    setFocusedDoctorId(null);
    setExpandedDoctorId(null);

  };

  const focusDoctorPhoto = (doctorId: string) => {
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
    setFocusedDoctorId(doctorId);
    setExpandedDoctorId(willExpand ? doctorId : null);

    if (willExpand) {
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

  const syncUrlFilters = useCallback((serializedParams: string) => {
    const params = new URLSearchParams(serializedParams);
    const requestedSearch = params.get("search") ?? "";
    const requestedSpecialty = params.get("specialty")?.trim();
    setQuery(requestedSearch.trim() ? requestedSearch : "");

    // A shared or saved name search must not inherit a stale category.
    if (requestedSearch.trim()) {
      setSpecialty("all");
      if (params.has("specialty")) {
        params.delete("specialty");
        window.history.replaceState(null, "", `/doctors?${params}${window.location.hash}`);
      }
      return;
    }

    if (!requestedSpecialty) {
      setSpecialty("all");
      return;
    }

    const normalizedRequested = requestedSpecialty.toLocaleLowerCase("uk");
    const matchingGroup = groupedSpecialties.find((group) =>
      group.value === normalizedRequested || group.urlAliases.some((alias) => alias === normalizedRequested),
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

    setSpecialty(matchingSpecialty ?? "all");
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
      <Suspense fallback={null}>
        <DirectoryUrlSync onChange={syncUrlFilters} />
      </Suspense>
      <div className="directory-toolbar doctor-directory-toolbar">
        <div className="doctor-directory-search">
        <label htmlFor="doctor-search">
          <span className="sr-only">Пошук лікаря</span>
          <input
            id="doctor-search"
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(event) => changeFilters("all", event.target.value)}
            placeholder="Прізвище або спеціальність"
            autoComplete="off"
          />
        </label>
        {query && <button className="price-search-clear" type="button" aria-label="Очистити пошук"
          onClick={() => { changeFilters(specialty, ""); searchInputRef.current?.focus(); }}>
          <CloseIcon />
        </button>}
        </div>
        <label htmlFor="doctor-specialty">
          <span className="sr-only">Напрям</span>
          <select
            id="doctor-specialty"
            value={specialty}
            onChange={(event) => changeFilters(event.target.value, "")}
          >
            <option value="all">Усі категорії лікарів</option>
            {groupedSpecialties.map((group) => (
              <option value={group.value} key={group.value}>
                {group.label}
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
            const activeSchedule = getDoctorScheduleDays(doctor.schedule);
            const profileLinkLabel = doctor.biography.trim() ? "Біографія" : "Профіль";
            const returnTo = `${directoryUrl(specialty, query)}#doctor-card-${doctor.id}`;
            const profileHref = `/doctors/${doctor.id}?returnTo=${encodeURIComponent(returnTo)}`;
            const bookingHref = doctorBookingHref(doctor);
            const consultationPrices = getDoctorConsultationPrices(doctor);
            const consultationSummary = formatDoctorConsultations(doctor);
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
                    <span className="doctor-photo-image">
                      <Image
                        className="doctor-portrait"
                        src={resolveImageSource(doctor.photoUrl)}
                        unoptimized={!canOptimizeImage(doctor.photoUrl)}
                        alt={`Фотографія лікаря ${doctor.name}`}
                        fill
                        quality={85}
                        loading="lazy"
                        sizes={mobileView === "double" || isFocused || isExpanded
                          ? "(max-width: 720px) calc(100vw - 32px), (max-width: 1180px) 40vw, (max-width: 1288px) 22vw, 266px"
                          : "(max-width: 720px) calc((100vw - 42px) / 2), (max-width: 1180px) 40vw, (max-width: 1288px) 22vw, 266px"}
                      />
                    </span>
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
                    aria-label={`Збільшити фотографію лікаря ${doctor.name}`}
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

                  <div className="doctor-photo-caption">
                  <span className="doctor-card-photo-identity">
                    <span>
                      <b>{doctor.name}</b>
                      <small>{formatDoctorSpecialty(doctor.specialty)}</small>
                      {canBookDoctorConsultation(doctor) && consultationSummary && (<span className="doctor-card-consultation-price">
                        {doctor.repeatConsultationPrice != null ? consultationPrices.map(({ label, value }) => (
                          <span className="doctor-price-row" key={label}><span>{label}</span><span>{value}</span></span>
                        )) : <>Консультація · {consultationSummary}</>}
                      </span>)}
                    </span>
                  </span>

                  {!isExpanded && (
                    <div className="doctor-photo-actions">
                      <a className="doctor-photo-biography" href={profileHref}>{profileLinkLabel}</a>
                      {canBookDoctorConsultation(doctor) && (
                        <a className="doctor-photo-booking" href={bookingHref}>Записатися</a>
                      )}
                    </div>
                  )}
                  </div>
                </div>

                <div className="doctor-profile-content doctor-card-editorial-content">
                  <div className="doctor-card-facts">
                    <div>
                      <span>Досвід</span>
                      <strong>
                        {doctor.experienceLabel ?? (doctor.experienceYears ? `${doctor.experienceYears} років` : "Уточнюйте")}
                      </strong>
                    </div>
                    {canBookDoctorConsultation(doctor) && (<div><span>Приймає</span><strong>{patientGroups || "Вік уточнюйте"}</strong></div>)}
                    <div>
                      <span>Відділення</span>
                      <strong className="doctor-branch-addresses">{splitDoctorBranches(doctor.branch).map(formatDoctorBranch).join("\n") || "Відділення уточнюйте"}</strong>
                    </div>
                    {canBookDoctorConsultation(doctor) && consultationSummary && (<div>
                      <span>Консультація</span>
                      <strong>{consultationSummary}</strong>
                    </div>)}
                  </div>

                  {activeSchedule.length ? <div className="doctor-card-schedule-line">
                    <div>
                      <span>Найближчий графік</span>
                      <strong>{getScheduleSummary(doctor.schedule)}</strong>
                    </div>
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
                  </div> : <p className="doctor-schedule-notice">{getDoctorScheduleNotice(doctor)}</p>}

                  <div className="doctor-card-text-actions">
                    <a
                      className="doctor-biography-link"
                      href={profileHref}
                    >
                      {profileLinkLabel}
                    </a>
                    {canBookDoctorConsultation(doctor) && (<a
                      className="doctor-book-text-link doctor-book-cta"
                      href={bookingHref}
                    >
                      Записатися <span>→</span>
                    </a>)}
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
            onClick={() => changeFilters("all", "")}
          >
            Очистити фільтри
          </button>
        </div>
      )}

    </section>
  );
}
