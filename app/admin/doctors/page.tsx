"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import AdminNavigation from "../AdminNavigation";
import {
  doctorPatientGroupOptions,
  getDoctorInitials,
  weekDays,
  type Doctor,
  type DoctorPatientGroup,
  type DoctorSchedule,
} from "../../doctors/doctorData";
import { useAdminSafeSave } from "../useAdminSafeSave";
import AdminRevisionHistory from "../AdminRevisionHistory";

type ApiPayload = {
  doctors?: Doctor[];
  error?: string;
};

type DoctorProfileDraft = {
  id: string;
  name: string;
  specialty: string;
  experienceYears: string;
  consultationPrice: string;
  branch: string;
  description: string;
  biography: string;
  patientGroups: DoctorPatientGroup[];
  schedule: DoctorSchedule;
};

function doctorProfileDraft(doctor: Doctor): DoctorProfileDraft {
  return {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    experienceYears: doctor.experienceYears?.toString() ?? "",
    consultationPrice: doctor.consultationPrice?.toString() ?? "",
    branch: doctor.branch,
    description: doctor.description,
    biography: doctor.biography,
    patientGroups: doctor.patientGroups,
    schedule: doctor.schedule,
  };
}

function formatSaveTime(timestamp: number) {
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function DoctorEditor({
  doctor,
  onUpdated,
  onDeleted,
  onRegisterGuard,
}: {
  doctor: Doctor;
  onUpdated: (doctors: Doctor[]) => void;
  onDeleted: (doctors: Doctor[]) => void;
  onRegisterGuard: (guard: (() => boolean) | null) => void;
}) {
  const [name, setName] = useState(doctor.name);
  const [specialty, setSpecialty] = useState(doctor.specialty);
  const [experienceYears, setExperienceYears] = useState(
    doctor.experienceYears?.toString() ?? "",
  );
  const [consultationPrice, setConsultationPrice] = useState(
    doctor.consultationPrice?.toString() ?? "",
  );
  const [branch, setBranch] = useState(doctor.branch);
  const [description, setDescription] = useState(doctor.description);
  const [biography, setBiography] = useState(doctor.biography);
  const [patientGroups, setPatientGroups] = useState<DoctorPatientGroup[]>(
    doctor.patientGroups,
  );
  const [schedule, setSchedule] = useState<DoctorSchedule>(doctor.schedule);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [hasError, setHasError] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const baseline = useMemo(() => doctorProfileDraft(doctor), [doctor]);
  const draft = useMemo<DoctorProfileDraft>(() => ({
    id: doctor.id,
    name,
    specialty,
    experienceYears,
    consultationPrice,
    branch,
    description,
    biography,
    patientGroups,
    schedule,
  }), [
    biography,
    branch,
    description,
    doctor.id,
    experienceYears,
    consultationPrice,
    name,
    patientGroups,
    schedule,
    specialty,
  ]);

  const saveProfile = useCallback(async () => {
    setSaving(true);
    setStatus("");
    setHasError(false);

    try {
      const response = await fetch("/api/admin/doctors", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...draft,
          experienceYears: draft.experienceYears
            ? Number(draft.experienceYears)
            : null,
          consultationPrice: draft.consultationPrice
            ? Number(draft.consultationPrice)
            : null,
        }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.doctors) {
        throw new Error(payload.error || "Не вдалося зберегти зміни");
      }
      onUpdated(payload.doctors);
      setStatus("Профіль і графік збережено");
      setLastSavedAt(Date.now());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Сталася помилка");
      setHasError(true);
    } finally {
      setSaving(false);
    }
  }, [draft, onUpdated]);

  const requestProfileSave = useCallback(() => {
    if (formRef.current?.reportValidity() === false) return;
    return saveProfile();
  }, [saveProfile]);

  const safeSave = useAdminSafeSave<DoctorProfileDraft>({
    storageKey: `admin-safe-draft:doctor:${doctor.id}`,
    value: draft,
    baseline,
    onRestore: (restored) => {
      setName(restored.name);
      setSpecialty(restored.specialty);
      setExperienceYears(restored.experienceYears);
      setConsultationPrice(restored.consultationPrice ?? "");
      setBranch(restored.branch);
      setDescription(restored.description);
      setBiography(restored.biography);
      setPatientGroups(restored.patientGroups);
      setSchedule(restored.schedule);
      setStatus("");
      setHasError(false);
    },
    onSave: requestProfileSave,
    busy: saving,
  });

  useEffect(() => {
    onRegisterGuard(safeSave.confirmDiscard);
    return () => onRegisterGuard(null);
  }, [onRegisterGuard, safeSave.confirmDiscard]);

  const uploadPhoto = async () => {
    if (!photo) return;
    setSaving(true);
    setStatus("");
    setHasError(false);

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
      setHasError(true);
    } finally {
      setSaving(false);
    }
  };

  const deleteProfile = async () => {
    if (!window.confirm(`Видалити профіль «${doctor.name}»?`)) return;
    setSaving(true);
    setStatus("");
    setHasError(false);
    try {
      const response = await fetch(
        `/api/admin/doctors?id=${encodeURIComponent(doctor.id)}`,
        { method: "DELETE" },
      );
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.doctors) {
        throw new Error(payload.error || "Не вдалося видалити лікаря");
      }
      safeSave.clearStoredDraft();
      onDeleted(payload.doctors);
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : "Сталася помилка");
      setHasError(true);
    } finally {
      setSaving(false);
    }
  };

  const saveStateLabel = saving
    ? "Зберігаємо зміни…"
    : hasError
      ? "Збереження потребує уваги"
      : safeSave.dirty
        ? "Є незбережені зміни"
        : lastSavedAt
          ? `Збережено о ${formatSaveTime(lastSavedAt)}`
          : "Усі зміни збережено";
  const saveStateDetail = hasError
    ? status
    : safeSave.recoveredAt
      ? `Відновлено чернетку о ${formatSaveTime(safeSave.recoveredAt)} · Ctrl+S`
      : safeSave.dirty
        ? "Чернетка зберігається у цьому браузері · Ctrl+S"
        : status || "Можна безпечно перейти до іншого профілю.";

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

      <div className="admin-editor-actions admin-safe-save-bar admin-doctor-safe-save-bar">
        <div className="admin-safe-save-summary" role="status" aria-live="polite">
          <span className={`admin-safe-save-state${hasError ? " is-error" : safeSave.dirty ? " is-dirty" : " is-saved"}`}>
            <i aria-hidden="true" />
            {saveStateLabel}
          </span>
          <small>{saveStateDetail}</small>
        </div>
        <div className="admin-safe-save-buttons">
          <AdminRevisionHistory
            entityType="doctor"
            entityId={doctor.id}
            entityLabel={doctor.name}
            draftStorageKey={`admin-safe-draft:doctor:${doctor.id}`}
            disabled={saving}
            hasUnsavedChanges={safeSave.dirty}
          />
          <button
            className="admin-danger-button"
            type="button"
            disabled={saving}
            onClick={deleteProfile}
          >
            Видалити профіль
          </button>
          <button
            className="admin-save-button admin-safe-save-button"
            type="submit"
            form="admin-doctor-profile-form"
            disabled={!safeSave.dirty || saving}
            aria-busy={saving}
            aria-keyshortcuts="Control+S Meta+S"
          >
            {saving ? <span className="admin-button-loader" aria-hidden="true" /> : null}
            {saving ? "Збереження..." : "Зберегти профіль"}
          </button>
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

      <form
        ref={formRef}
        id="admin-doctor-profile-form"
        className="admin-doctor-form"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          void saveProfile();
        }}
      >
        <div className="admin-form-grid">
          <label>
            Ім’я та прізвище лікаря
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
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
            Вартість консультації, ₴
            <input
              type="number"
              min="0"
              max="100000"
              step="1"
              value={consultationPrice}
              onChange={(event) => setConsultationPrice(event.target.value)}
              placeholder="Не вказано"
            />
            <small>Залиште порожнім, якщо вартість потрібно уточнювати.</small>
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
  const [creating, setCreating] = useState(false);
  const editorGuardRef = useRef<(() => boolean) | null>(null);

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

  const updateDoctors = useCallback((updatedDoctors: Doctor[]) => {
    setDoctors(updatedDoctors);
  }, []);

  const registerEditorGuard = useCallback(
    (guard: (() => boolean) | null) => {
      editorGuardRef.current = guard;
    },
    [],
  );

  const createDoctor = async () => {
    if (editorGuardRef.current?.() === false) return;
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Новий лікар",
          specialty: "Спеціальність уточнюється",
        }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.doctors) {
        throw new Error(payload.error || "Не вдалося додати лікаря");
      }
      setDoctors(payload.doctors);
      const created = payload.doctors.find(
        (doctor) => !doctors.some((item) => item.id === doctor.id),
      );
      setSelectedId(created?.id ?? payload.doctors.at(-1)?.id ?? "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Сталася помилка");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="admin-doctors-page">
      <header className="admin-topbar">
        <Link href="/doctors">← До каталогу лікарів</Link>
        <AdminNavigation current="doctors" />
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
            <button
              className="admin-create-button"
              type="button"
              onClick={createDoctor}
              disabled={creating}
            >
              <span>+</span>
              <span>
                <strong>{creating ? "Додаємо…" : "Додати лікаря"}</strong>
                <small>Створити новий профіль</small>
              </span>
            </button>
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
                  onClick={() => {
                    if (
                      doctor.id === selectedId ||
                      editorGuardRef.current?.() !== false
                    ) {
                      setSelectedId(doctor.id);
                    }
                  }}
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
              onRegisterGuard={registerEditorGuard}
              onDeleted={(updatedDoctors) => {
                setDoctors(updatedDoctors);
                setSelectedId(updatedDoctors[0]?.id ?? "");
              }}
            />
          ) : null}
        </section>
      )}
    </main>
  );
}
