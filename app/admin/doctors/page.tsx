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
import Image from "next/image";
import { canOptimizeImage, resolveImageSource } from "@/lib/imageSource";
import { centerLocations, type CenterLocation } from "../../contacts/locationData";
import { isInformationOnlyLocation } from "@/lib/locationPolicy";
import DoctorSpecialtyPicker from "./DoctorSpecialtyPicker";
import { doctorProfileDraft, getSpecialtyOptions, upgradeLegacyDoctorDraft, type DoctorProfileDraft } from "./doctorFormState";
import styles from "./doctors.module.css";
import AdminNavigation from "../AdminNavigation";
import {
  DEFAULT_DOCTOR_SORT_ORDER,
  compareDoctors,
  defaultDoctors,
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
  doctor?: Doctor;
  doctors?: Doctor[];
  error?: string;
};

function formatSaveTime(timestamp: number) {
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

type BranchChoices = { locations: CenterLocation[]; loading: boolean; error: string };

function BranchSelect({ value, onChange, branches }: { value: string; onChange: (value: string) => void; branches: BranchChoices }) {
  const addresses = [...new Set(branches.locations.map((location) => location.fullAddress).filter(Boolean))];
  return (
    <label>
      Відділення
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={branches.loading} aria-busy={branches.loading}>
        <option value="">Не вказано</option>
        {value && !addresses.includes(value) && <option value={value}>{value} — поточне значення</option>}
        {addresses.map((address) => <option key={address} value={address}>{address}</option>)}
      </select>
      {branches.loading ? <small>Завантажуємо відділення…</small> : branches.error ? <small>{branches.error}</small> : null}
    </label>
  );
}

function DoctorAvatar({ doctor, sizes }: { doctor: Pick<Doctor, "photoUrl" | "name">; sizes: string }) {
  const [failedSource, setFailedSource] = useState("");
  return doctor.photoUrl && failedSource !== doctor.photoUrl ? (
    <Image src={resolveImageSource(doctor.photoUrl)} unoptimized={!canOptimizeImage(doctor.photoUrl)} alt="" fill sizes={sizes} quality={85} onError={() => setFailedSource(doctor.photoUrl)} />
  ) : getDoctorInitials(doctor.name);
}

function DoctorPublicationFields({ isActive, sortOrder, onActiveChange, onOrderChange }: {
  isActive: boolean;
  sortOrder: string;
  onActiveChange: (value: boolean) => void;
  onOrderChange: (value: string) => void;
}) {
  return (
    <div className={styles.publicationGrid}>
      <label className={`admin-toggle-row ${styles.visibilityControl}`}>
        <span><strong>Показувати на сайті</strong><small>{isActive ? "Буде доступний відвідувачам після збереження." : "Буде прихований після збереження."}</small></span>
        <input type="checkbox" role="switch" aria-label="Показувати на сайті" checked={isActive} onChange={(event) => onActiveChange(event.target.checked)} />
        <span className="admin-toggle" aria-hidden="true"><span /></span>
      </label>
      <label>
        Порядок показу
        <input type="number" min="0" max="2147483647" step="1" required value={sortOrder} onChange={(event) => onOrderChange(event.target.value)} />
        <small>Менше число — вище у списку. Однакові значення — за ім’ям.</small>
      </label>
    </div>
  );
}

type NewDoctorDraft = Pick<DoctorProfileDraft, "name" | "specialty" | "branch" | "consultationPrice" | "repeatConsultationPrice" | "isActive" | "sortOrder">;
const emptyNewDoctorDraft: NewDoctorDraft = { name: "", specialty: "", branch: "", consultationPrice: "", repeatConsultationPrice: "", isActive: true, sortOrder: String(DEFAULT_DOCTOR_SORT_ORDER) };

function CreateDoctorForm({ specialtyOptions, branches, onCreated, onCancel, onRegisterGuard }: {
  specialtyOptions: string[];
  branches: BranchChoices;
  onCreated: (doctor: Doctor, doctors: Doctor[]) => void;
  onCancel: () => void;
  onRegisterGuard: (guard: (() => boolean) | null) => void;
}) {
  const [draft, setDraft] = useState<NewDoctorDraft>(emptyNewDoctorDraft);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  function update<K extends keyof NewDoctorDraft>(key: K, value: NewDoctorDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const create = async () => {
    if (creating) return;
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: draft.name.trim(),
          specialty: draft.specialty,
          branch: draft.branch,
          consultationPrice: draft.consultationPrice === "" ? null : Number(draft.consultationPrice),
          repeatConsultationPrice: draft.repeatConsultationPrice === "" ? null : Number(draft.repeatConsultationPrice),
          isActive: draft.isActive,
          sortOrder: Number(draft.sortOrder),
        }),
      });
      const payload = await response.json() as ApiPayload;
      if (!response.ok || !payload.doctor || !payload.doctors) throw new Error(payload.error || "Не вдалося додати лікаря. Спробуйте ще раз.");
      safeSave.clearStoredDraft();
      onCreated(payload.doctor, payload.doctors);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не вдалося додати лікаря. Спробуйте ще раз.");
    } finally {
      setCreating(false);
    }
  };
  useEffect(() => {
    const key = "admin-safe-draft:doctor:new";
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const upgraded = upgradeLegacyDoctorDraft(raw, emptyNewDoctorDraft);
        if (upgraded !== raw) window.localStorage.setItem(key, upgraded);
      }
    } catch {
      // Browser storage restrictions must not prevent creating a profile.
    }
  }, []);
  const safeSave = useAdminSafeSave<NewDoctorDraft>({
    storageKey: "admin-safe-draft:doctor:new",
    value: draft,
    baseline: emptyNewDoctorDraft,
    onRestore: setDraft,
    onSave: () => { if (formRef.current?.reportValidity()) return create(); },
    busy: creating,
  });
  const { confirmDiscard } = safeSave;
  useEffect(() => {
    onRegisterGuard(() => !creating && confirmDiscard());
    return () => onRegisterGuard(null);
  }, [creating, onRegisterGuard, confirmDiscard]);

  return (
    <section className={`admin-doctor-editor ${styles.editor}`} aria-labelledby="new-doctor-title">
      <header className={styles.createHeader}>
        <h2 id="new-doctor-title">Додати лікаря</h2>
        <p>Спочатку заповніть основні дані. Після створення можна додати фото, біографію та графік прийому.</p>
      </header>
      <form ref={formRef} className="admin-doctor-form" onSubmit={(event) => { event.preventDefault(); void create(); }}>
        <fieldset className={styles.formFields} disabled={creating}>
          <div className={`admin-form-grid ${styles.formGrid}`}>
            <label className={styles.fullWidth}>
              Ім’я та прізвище лікаря
              <input autoFocus value={draft.name} onChange={(event) => update("name", event.target.value)} required pattern=".*\S.*" autoComplete="name" placeholder="Наприклад, Іваненко Олена Петрівна" />
            </label>
            <DoctorSpecialtyPicker value={draft.specialty} options={specialtyOptions} onChange={(value) => update("specialty", value)} disabled={creating} />
            <BranchSelect value={draft.branch} onChange={(value) => update("branch", value)} branches={branches} />
            <label>
              Первинна консультація, ₴
              <input type="number" min="0" max="100000" step="1" value={draft.consultationPrice} onChange={(event) => update("consultationPrice", event.target.value)} placeholder="Не вказано" />
            </label>
            <label>
              Повторна консультація, ₴
              <input type="number" min="0" max="100000" step="1" value={draft.repeatConsultationPrice} onChange={(event) => update("repeatConsultationPrice", event.target.value)} placeholder="Не вказано" />
            </label>
          </div>
          <p className={styles.fieldHint}>Ціни можна залишити порожніми, якщо вартість потрібно уточнювати.</p>
          <DoctorPublicationFields isActive={draft.isActive} sortOrder={draft.sortOrder} onActiveChange={(value) => update("isActive", value)} onOrderChange={(value) => update("sortOrder", value)} />
        </fieldset>
        {error && <p className={styles.fieldError} role="alert">{error}</p>}
        <p className={styles.createStatus} role="status" aria-live="polite">
          {creating ? "Створюємо профіль…" : safeSave.recoveredAt ? "Відновлено незбережену чернетку нового лікаря." : safeSave.dirty ? "Чернетка зберігається у цьому браузері · Ctrl+S" : draft.isActive ? "Профіль з’явиться у каталозі після створення." : "Профіль буде створено прихованим — без публікації на сайті."}
        </p>
        <div className={styles.createActions}>
          <button className="admin-ui-button" data-variant="primary" type="submit" disabled={creating} aria-busy={creating}>{creating ? "Створюємо…" : "Створити профіль"}</button>
          <button className="admin-ui-button" data-variant="secondary" type="button" disabled={creating} onClick={onCancel}>Скасувати</button>
        </div>
      </form>
    </section>
  );
}

function DoctorEditor({
  doctor,
  onUpdated,
  onDeleted,
  onRegisterGuard,
  specialtyOptions,
  branches,
}: {
  doctor: Doctor;
  onUpdated: (doctors: Doctor[]) => void;
  onDeleted: (doctors: Doctor[]) => void;
  onRegisterGuard: (guard: (() => boolean) | null) => void;
  specialtyOptions: string[];
  branches: BranchChoices;
}) {
  const [name, setName] = useState(doctor.name);
  const [specialty, setSpecialty] = useState(doctor.specialty);
  const [experienceYears, setExperienceYears] = useState(
    doctor.experienceYears?.toString() ?? "",
  );
  const [consultationPrice, setConsultationPrice] = useState(
    doctor.consultationPrice?.toString() ?? "",
  );
  const [repeatConsultationPrice, setRepeatConsultationPrice] = useState(
    doctor.repeatConsultationPrice?.toString() ?? "",
  );
  const [isActive, setIsActive] = useState(doctor.isActive !== false);
  const [sortOrder, setSortOrder] = useState(() => doctorProfileDraft(doctor).sortOrder);
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
    repeatConsultationPrice,
    branch,
    description,
    biography,
    patientGroups,
    schedule,
    isActive,
    sortOrder,
  }), [
    biography,
    branch,
    description,
    doctor.id,
    experienceYears,
    consultationPrice,
    repeatConsultationPrice,
    name,
    patientGroups,
    schedule,
    specialty,
    isActive,
    sortOrder,
  ]);

  const applyProfileDraft = useCallback((restored: DoctorProfileDraft) => {
    setName(restored.name);
    setSpecialty(restored.specialty);
    setExperienceYears(restored.experienceYears);
    setConsultationPrice(restored.consultationPrice ?? "");
    setRepeatConsultationPrice(restored.repeatConsultationPrice ?? "");
    setBranch(restored.branch);
    setDescription(restored.description);
    setBiography(restored.biography);
    setPatientGroups(restored.patientGroups);
    setSchedule(restored.schedule);
    setIsActive(restored.isActive !== false);
    setSortOrder(restored.sortOrder ?? String(DEFAULT_DOCTOR_SORT_ORDER));
  }, []);

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
          sortOrder: Number(draft.sortOrder),
          experienceYears: draft.experienceYears
            ? Number(draft.experienceYears)
            : null,
          consultationPrice: draft.consultationPrice
            ? Number(draft.consultationPrice)
            : null,
          repeatConsultationPrice: draft.repeatConsultationPrice
            ? Number(draft.repeatConsultationPrice)
            : null,
        }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.doctors) {
        throw new Error(payload.error || "Не вдалося зберегти зміни");
      }
      const savedDoctor = payload.doctors.find((item) => item.id === draft.id);
      if (!savedDoctor) throw new Error("Не вдалося отримати збережений профіль. Оновіть сторінку.");
      applyProfileDraft(doctorProfileDraft(savedDoctor));
      onUpdated(payload.doctors);
      setStatus("Профіль і графік збережено");
      setLastSavedAt(Date.now());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Сталася помилка");
      setHasError(true);
    } finally {
      setSaving(false);
    }
  }, [applyProfileDraft, draft, onUpdated]);

  const requestProfileSave = useCallback(() => {
    if (formRef.current?.reportValidity() === false) return;
    return saveProfile();
  }, [saveProfile]);

  useEffect(() => {
    const key = `admin-safe-draft:doctor:${doctor.id}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const upgraded = upgradeLegacyDoctorDraft(raw, baseline);
        if (upgraded !== raw) window.localStorage.setItem(key, upgraded);
      }
    } catch {
      // Browser storage restrictions must not prevent editing.
    }
  }, [baseline, doctor.id]);

  const safeSave = useAdminSafeSave<DoctorProfileDraft>({
    storageKey: `admin-safe-draft:doctor:${doctor.id}`,
    value: draft,
    baseline,
    onRestore: (restored) => {
      applyProfileDraft(restored);
      setStatus("");
      setHasError(false);
    },
    onSave: requestProfileSave,
    busy: saving,
  });

  const { confirmDiscard } = safeSave;
  useEffect(() => {
    onRegisterGuard(() => !saving && confirmDiscard());
    return () => onRegisterGuard(null);
  }, [onRegisterGuard, confirmDiscard, saving]);

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
    <div className={`admin-doctor-editor ${styles.editor}`}>
      <div className="admin-editor-heading">
        <div
          className={`admin-current-photo ${styles.editorPhoto}`}
          role={doctor.photoUrl ? "img" : undefined}
          aria-label={
            doctor.photoUrl ? `Фотографія ${doctor.name}` : undefined
          }
        >
          <DoctorAvatar doctor={doctor} sizes="(max-width: 760px) 62px, 76px" />
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
            className="admin-ui-button"
            data-variant="danger"
            type="button"
            disabled={saving}
            onClick={deleteProfile}
          >
            Видалити профіль
          </button>
          <button
            className="admin-ui-button admin-safe-save-button"
            data-variant="primary"
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
        <label className="admin-file-picker admin-ui-button" data-variant="secondary">
          <span>{photo ? photo.name : "Обрати фотографію"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={saving}
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
          />
        </label>
        <button
          className="admin-ui-button"
          data-variant="secondary"
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
        <fieldset className={styles.formFields} disabled={saving}>
        <div className={`admin-form-grid ${styles.formGrid}`}>
          <label>
            Ім’я та прізвище лікаря
            <input value={name} onChange={(event) => setName(event.target.value)} required pattern=".*\S.*" />
          </label>
          <DoctorSpecialtyPicker value={specialty} options={specialtyOptions} onChange={setSpecialty} disabled={saving} />
          <label>
            Стаж роботи, років
            <input type="number" min="0" max="80" step="1" value={experienceYears} onChange={(event) => setExperienceYears(event.target.value)} placeholder="Не вказано" />
          </label>
          <BranchSelect value={branch} onChange={setBranch} branches={branches} />
          <label>
            Первинна консультація, ₴
            <input type="number" min="0" max="100000" step="1" value={consultationPrice} onChange={(event) => setConsultationPrice(event.target.value)} placeholder="Не вказано" />
            <small>Порожнє поле — вартість уточнюється.</small>
          </label>
          <label>
            Повторна консультація, ₴
            <input type="number" min="0" max="100000" step="1" value={repeatConsultationPrice} onChange={(event) => setRepeatConsultationPrice(event.target.value)} placeholder="Не вказано" />
            <small>Вкажіть окрему ціну повторного прийому.</small>
          </label>
        </div>

        <DoctorPublicationFields isActive={isActive} sortOrder={sortOrder} onActiveChange={setIsActive} onOrderChange={setSortOrder} />

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
        </fieldset>
      </form>
    </div>
  );
}

export default function DoctorsAdminPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "published" | "hidden">("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [branches, setBranches] = useState<BranchChoices>({ locations: [], loading: true, error: "" });
  const editorGuardRef = useRef<(() => boolean) | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/admin/doctors", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as ApiPayload;
        if (!response.ok || !payload.doctors) throw new Error(payload.error || "Не вдалося завантажити лікарів.");
        setDoctors(payload.doctors);
        setSelectedId(payload.doctors[0]?.id ?? "");
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Не вдалося завантажити лікарів.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [loadAttempt]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/locations", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { locations?: CenterLocation[] };
        if (!response.ok || !Array.isArray(payload.locations)) throw new Error("locations unavailable");
        setBranches({ locations: payload.locations.filter((location) => !isInformationOnlyLocation(location)), loading: false, error: "" });
      })
      .catch(() => {
        if (!controller.signal.aborted) setBranches({ locations: centerLocations.filter((location) => !isInformationOnlyLocation(location)), loading: false, error: "Не вдалося оновити відділення. Показано базовий список адрес." });
      });
    return () => controller.abort();
  }, []);

  const specialtyOptions = useMemo(() => getSpecialtyOptions([...defaultDoctors, ...doctors].map((doctor) => doctor.specialty)), [doctors]);
  const filteredDoctors = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("uk");
    return doctors.filter((doctor) => {
      const matchesVisibility = visibilityFilter === "all" || (visibilityFilter === "hidden" ? doctor.isActive === false : doctor.isActive !== false);
      return matchesVisibility && (!normalized || `${doctor.name} ${doctor.specialty}`.toLocaleLowerCase("uk").includes(normalized));
    }).sort(compareDoctors);
  }, [doctors, query, visibilityFilter]);
  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedId);
  const updateDoctors = useCallback((updatedDoctors: Doctor[]) => setDoctors(updatedDoctors), []);
  const registerEditorGuard = useCallback((guard: (() => boolean) | null) => { editorGuardRef.current = guard; }, []);
  const openCreateForm = () => {
    if (showCreateForm || editorGuardRef.current?.() === false) return;
    setShowCreateForm(true);
  };

  return (
    <main className={`admin-doctors-page ${styles.page}`}>
      <header className="admin-topbar">
        <Link href="/doctors">← До каталогу лікарів</Link>
        <AdminNavigation current="doctors" />
      </header>
      <section className="admin-intro">
        <span className="section-kicker">Адмін-панель</span>
        <h1>Профілі та графік лікарів</h1>
        <p>Оберіть профіль для редагування або додайте нового лікаря. Збережені зміни з’являються у каталозі.</p>
      </section>
      {loading ? (
        <div className="admin-state" role="status">Завантажуємо лікарів…</div>
      ) : error ? (
        <div className="admin-state admin-error" role="alert">
          <h2>Не вдалося завантажити лікарів</h2>
          <p>{error}</p>
          <button className="admin-ui-button" data-variant="secondary" type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Спробувати ще раз</button>
        </div>
      ) : (
        <section className="admin-doctors-layout">
          <aside className="admin-doctors-list" aria-label="Профілі лікарів">
            <div className={styles.listActions}>
              <button className="admin-ui-button" data-variant="primary" type="button" onClick={openCreateForm} disabled={showCreateForm}><span aria-hidden="true">+</span> Додати лікаря</button>
            </div>
            <label>
              <span>Знайти лікаря</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Прізвище або напрям" />
            </label>
            <label className={styles.listFilter}>
              <span>Видимість профілів</span>
              <select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value as "all" | "published" | "hidden")}>
                <option value="all">Усі профілі ({doctors.length})</option>
                <option value="published">На сайті ({doctors.filter((doctor) => doctor.isActive !== false).length})</option>
                <option value="hidden">Приховані ({doctors.filter((doctor) => doctor.isActive === false).length})</option>
              </select>
            </label>
            <div className={styles.doctorList}>
              {filteredDoctors.map((doctor) => (
                <button
                  type="button"
                  className={!showCreateForm && doctor.id === selectedId ? "is-active" : undefined}
                  aria-pressed={!showCreateForm && doctor.id === selectedId}
                  data-hidden={doctor.isActive === false || undefined}
                  onClick={() => {
                    if ((!showCreateForm && doctor.id === selectedId) || editorGuardRef.current?.() !== false) {
                      setSelectedId(doctor.id);
                      setShowCreateForm(false);
                    }
                  }}
                  key={doctor.id}
                >
                  <span className={styles.thumbnail} aria-hidden="true"><DoctorAvatar doctor={doctor} sizes="44px" /></span>
                  <span><strong>{doctor.name}</strong><small>{doctor.specialty}</small>{doctor.isActive === false && <span className={styles.hiddenStatus}>Приховано</span>}</span>
                </button>
              ))}
              {!filteredDoctors.length && <p className={styles.emptyList} role="status">{query.trim() ? "Лікарів не знайдено. Змініть пошук або фільтр видимості." : visibilityFilter !== "all" ? "За цим фільтром профілів немає." : "Профілів ще немає. Додайте першого лікаря."}</p>}
            </div>
          </aside>
          {showCreateForm ? (
            <CreateDoctorForm
              specialtyOptions={specialtyOptions}
              branches={branches}
              onRegisterGuard={registerEditorGuard}
              onCancel={() => { if (editorGuardRef.current?.() !== false) setShowCreateForm(false); }}
              onCreated={(doctor, updatedDoctors) => {
                setDoctors(updatedDoctors);
                setSelectedId(doctor.id);
                setQuery("");
                setVisibilityFilter("all");
                setShowCreateForm(false);
              }}
            />
          ) : selectedDoctor ? (
            <DoctorEditor
              key={selectedDoctor.id}
              doctor={selectedDoctor}
              specialtyOptions={specialtyOptions}
              branches={branches}
              onUpdated={updateDoctors}
              onRegisterGuard={registerEditorGuard}
              onDeleted={(updatedDoctors) => { setDoctors(updatedDoctors); setSelectedId(updatedDoctors[0]?.id ?? ""); }}
            />
          ) : (
            <div className={styles.emptyEditor}><h2>Додайте першого лікаря</h2><p>Новий профіль починається з імені, спеціальностей та вартості прийому.</p></div>
          )}
        </section>
      )}
    </main>
  );
}
