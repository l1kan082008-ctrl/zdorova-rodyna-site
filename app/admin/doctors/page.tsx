"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  doctorAvailabilityOptions,
  doctorPatientGroupOptions,
  getDoctorInitials,
  weekDays,
  type Doctor,
  type DoctorAvailabilityStatus,
  type DoctorPatientGroup,
  type DoctorSchedule,
} from "../../doctors/doctorData";

type ApiPayload = {
  doctors?: Doctor[];
  error?: string;
};

function DoctorEditor({
  doctor,
  onUpdated,
}: {
  doctor: Doctor;
  onUpdated: (doctors: Doctor[]) => void;
}) {
  const [specialty, setSpecialty] = useState(doctor.specialty);
  const [experienceYears, setExperienceYears] = useState(
    doctor.experienceYears?.toString() ?? "",
  );
  const [branch, setBranch] = useState(doctor.branch);
  const [description, setDescription] = useState(doctor.description);
  const [biography, setBiography] = useState(doctor.biography);
  const [patientGroups, setPatientGroups] = useState<DoctorPatientGroup[]>(
    doctor.patientGroups,
  );
  const [schedule, setSchedule] = useState<DoctorSchedule>(doctor.schedule);
  const [availabilityStatus, setAvailabilityStatus] =
    useState<DoctorAvailabilityStatus>(
      doctor.availabilityStatus ?? "accepting",
    );
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/doctors", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: doctor.id,
          specialty,
          experienceYears: experienceYears ? Number(experienceYears) : null,
          branch,
          description,
          biography,
          patientGroups,
          schedule,
          availabilityStatus,
        }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.doctors) {
        throw new Error(payload.error || "Не вдалося зберегти зміни");
      }
      onUpdated(payload.doctors);
      setStatus("Профіль і графік збережено");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Сталася помилка");
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return;
    setSaving(true);
    setStatus("");

    try {
      const formData = new FormData();
      formData.set("doctorId", doctor.id);
      formData.set("photo", photo);
      const response = await fetch("/api/admin/doctors/photo", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.doctors) {
        throw new Error(payload.error || "Не вдалося завантажити фото");
      }
      onUpdated(payload.doctors);
      setPhoto(null);
      setStatus("Фотографію оновлено");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Сталася помилка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-doctor-editor">
      <div className="admin-editor-heading">
        <div
          className="admin-current-photo"
          style={
            doctor.photoUrl
              ? { backgroundImage: `url("${doctor.photoUrl}")` }
              : undefined
          }
          role={doctor.photoUrl ? "img" : undefined}
          aria-label={
            doctor.photoUrl ? `Фотографія ${doctor.name}` : undefined
          }
        >
          {!doctor.photoUrl ? getDoctorInitials(doctor.name) : null}
        </div>
        <div>
          <span>Редагування профілю</span>
          <h1>{doctor.name}</h1>
        </div>
      </div>

      <section className="admin-photo-panel">
        <div>
          <strong>Фотографія лікаря</strong>
          <p>JPG, PNG або WebP, до 5 МБ. Рекомендовано вертикальне фото.</p>
        </div>
        <label className="admin-file-picker">
          <span>{photo ? photo.name : "Обрати фотографію"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
          />
        </label>
        <button
          className="outline-button"
          type="button"
          disabled={!photo || saving}
          onClick={uploadPhoto}
        >
          Завантажити фото
        </button>
      </section>

      <form className="admin-doctor-form" onSubmit={saveProfile}>
        <div className="admin-form-grid">
          <label>
            Спеціальність
            <input
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              required
            />
          </label>
          <label>
            Стаж роботи, років
            <input
              type="number"
              min="0"
              max="80"
              value={experienceYears}
              onChange={(event) => setExperienceYears(event.target.value)}
              placeholder="Не вказано"
            />
          </label>
          <label>
            Статус прийому
            <select
              value={availabilityStatus}
              onChange={(event) =>
                setAvailabilityStatus(
                  event.target.value as DoctorAvailabilityStatus,
                )
              }
            >
              {doctorAvailabilityOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small>
              {
                doctorAvailabilityOptions.find(
                  (option) => option.value === availabilityStatus,
                )?.description
              }
            </small>
          </label>
        </div>

        <fieldset className="admin-patient-groups">
          <legend>Кого приймає лікар</legend>
          <p>Оберіть одну або обидві категорії пацієнтів.</p>
          <div>
            {doctorPatientGroupOptions.map((option) => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  checked={patientGroups.includes(option.value)}
                  onChange={(event) =>
                    setPatientGroups((current) =>
                      event.target.checked
                        ? [...current, option.value]
                        : current.filter((group) => group !== option.value),
                    )
                  }
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Відділення або адреса прийому
          <input
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
            placeholder="Наприклад, вул. В. Стельмаха, 18-М"
          />
        </label>

        <label>
          Коротко про лікаря
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Досвід, основні напрями роботи, особливості прийому"
          />
        </label>

        <label>
          Біографія лікаря
          <textarea
            className="admin-biography-field"
            value={biography}
            onChange={(event) => setBiography(event.target.value)}
            placeholder="Освіта, професійний шлях, кваліфікація, напрями роботи та досягнення"
          />
          <small>
            Цей текст буде повністю показаний на окремій сторінці лікаря.
          </small>
        </label>

        <fieldset className="admin-schedule-editor">
          <legend>Графік прийому</legend>
          <p>Залиште поле порожнім, якщо цього дня прийому немає.</p>
          <div>
            {weekDays.map((day) => (
              <label key={day.key}>
                <span>
                  <b>{day.short}</b>
                  {day.label}
                </span>
                <input
                  value={schedule[day.key] ?? ""}
                  onChange={(event) =>
                    setSchedule((current) => ({
                      ...current,
                      [day.key]: event.target.value,
                    }))
                  }
                  placeholder="09:00–15:00"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <div className="admin-form-actions">
          <p role="status">{status}</p>
          <button className="book-button" type="submit" disabled={saving}>
            {saving ? "Зберігаємо…" : "Зберегти профіль"}
            <span>→</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DoctorsAdminPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/doctors")
      .then(async (response) => {
        const payload = (await response.json()) as ApiPayload;
        if (!response.ok || !payload.doctors) {
          throw new Error(payload.error || "Не вдалося відкрити адмінку");
        }
        setDoctors(payload.doctors);
        setSelectedId(payload.doctors[0]?.id ?? "");
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Сталася помилка"),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredDoctors = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("uk");
    if (!normalized) return doctors;
    return doctors.filter((doctor) =>
      `${doctor.name} ${doctor.specialty}`
        .toLocaleLowerCase("uk")
        .includes(normalized),
    );
  }, [doctors, query]);

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedId);

  const updateDoctors = (updatedDoctors: Doctor[]) => {
    setDoctors(updatedDoctors);
  };

  return (
    <main className="admin-doctors-page">
      <header className="admin-topbar">
        <Link href="/doctors">← До каталогу лікарів</Link>
        <nav aria-label="Адміністративні розділи">
          <strong>Лікарі</strong>
          <Link href="/admin/bookings">Заявки</Link>
        </nav>
      </header>

      <section className="admin-intro">
        <span className="section-kicker">Адмін-панель</span>
        <h1>Профілі та графік лікарів</h1>
        <p>
          Зміни відразу з’являються у каталозі. У робочій версії доступ має бути
          дозволений лише адміністраторам центру.
        </p>
      </section>

      {loading ? (
        <div className="admin-state">Завантажуємо лікарів…</div>
      ) : error ? (
        <div className="admin-state admin-error">
          <h2>Доступ до адмінки закрито</h2>
          <p>{error}</p>
        </div>
      ) : (
        <section className="admin-doctors-layout">
          <aside className="admin-doctors-list">
            <label>
              <span>Знайти лікаря</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Прізвище або напрям"
              />
            </label>
            <div>
              {filteredDoctors.map((doctor) => (
                <button
                  type="button"
                  className={doctor.id === selectedId ? "is-active" : undefined}
                  onClick={() => setSelectedId(doctor.id)}
                  key={doctor.id}
                >
                  <span>{getDoctorInitials(doctor.name)}</span>
                  <span>
                    <strong>{doctor.name}</strong>
                    <small>{doctor.specialty}</small>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {selectedDoctor ? (
            <DoctorEditor
              key={selectedDoctor.id}
              doctor={selectedDoctor}
              onUpdated={updateDoctors}
            />
          ) : null}
        </section>
      )}
    </main>
  );
}
