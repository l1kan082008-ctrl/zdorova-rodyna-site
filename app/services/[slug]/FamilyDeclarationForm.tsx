"use client";

import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import { TurnstileField } from "@/app/components/TurnstileField";

type FamilyDoctorOption = {
  id: string;
  name: string;
  specialty: string;
  photoUrl?: string;
  branch?: string;
};

type FamilyDeclarationFormProps = {
  doctors: FamilyDoctorOption[];
};

const PHONE_PREFIX = "+38 ";

function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];
  return parts.filter(Boolean).join(".");
}

function getUkrainianPhoneDigits(value: string) {
  let digits = value.replace(/\D/g, "");

  if (value.trimStart().startsWith("+38") && digits.startsWith("38")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("380") && digits.length > 10) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
}

function formatPhoneNumber(value: string) {
  const digits = getUkrainianPhoneDigits(value);
  if (!digits) return PHONE_PREFIX;

  const operator = digits.slice(0, 3);
  const first = digits.slice(3, 6);
  const second = digits.slice(6, 8);
  const third = digits.slice(8, 10);

  let formatted = `+38 ${operator}`;
  if (first) formatted += ` ${first}`;
  if (second) formatted += `-${second}`;
  if (third) formatted += `-${third}`;
  return formatted;
}

function validatePhoneNumber(value: string) {
  const digits = getUkrainianPhoneDigits(value);
  if (/^0\d{9}$/.test(digits)) return "";
  return "Будь ласка, вкажіть номер у форматі +38 0XX XXX-XX-XX.";
}

function parseBirthDate(value: string) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function validateBirthDate(value: string) {
  if (!value.trim()) return "Вкажіть дату народження.";

  const date = parseBirthDate(value);
  if (!date) return "Введіть коректну дату у форматі дд.мм.рррр.";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) return "Дата народження не може бути в майбутньому.";

  const earliestDate = new Date(today);
  earliestDate.setFullYear(earliestDate.getFullYear() - 100);

  if (date < earliestDate) {
    return "Будь ласка, перевірте рік народження. Якщо дату введено правильно, зверніться до адміністратора — ми допоможемо подати заявку.";
  }

  return "";
}

function formatBranch(branch?: string) {
  if (!branch) return "Відділення уточнить адміністратор";

  if (/стельмаха/i.test(branch)) {
    return "Відділення: вул. Стельмаха, 18-М";
  }

  return branch.replace(/\s+18\s*м\.?$/i, ", 18-М");
}

export function FamilyDeclarationForm({ doctors }: FamilyDeclarationFormProps) {
  const firstDoctorInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const birthDateInputRef = useRef<HTMLInputElement>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorError, setDoctorError] = useState("");
  const [patientType, setPatientType] = useState<"adult" | "child">("adult");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(PHONE_PREFIX);
  const [phoneError, setPhoneError] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<
    { type: "idle" } | { type: "loading" } | { type: "success"; text: string } | { type: "error"; text: string }
  >({ type: "idle" });

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === selectedDoctorId),
    [doctors, selectedDoctorId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextPhoneError = validatePhoneNumber(phone);
    const nextBirthDateError = validateBirthDate(birthDate);
    const nextDoctorError = selectedDoctor
      ? ""
      : "Оберіть сімейного лікаря, щоб подати заявку.";

    setPhoneError(nextPhoneError);
    setBirthDateError(nextBirthDateError);
    setDoctorError(nextDoctorError);

    firstDoctorInputRef.current?.setCustomValidity(nextDoctorError);
    phoneInputRef.current?.setCustomValidity(nextPhoneError);
    birthDateInputRef.current?.setCustomValidity(nextBirthDateError);

    if (nextDoctorError || nextPhoneError || nextBirthDateError) {
      setStatus({ type: "idle" });
      const invalidField = nextDoctorError
        ? firstDoctorInputRef.current
        : nextPhoneError
          ? phoneInputRef.current
          : birthDateInputRef.current;
      invalidField?.reportValidity();
      return;
    }

    if (!selectedDoctor) return;

    if (!consent) {
      setStatus({
        type: "error",
        text: "Підтвердьте згоду на обробку контактних даних.",
      });
      return;
    }

    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          service: "Заявка на декларацію із сімейним лікарем",
          doctor: selectedDoctor.name,
          comment: [
            `Пацієнт: ${patientType === "child" ? "дитина" : "дорослий"}.`,
            birthDate ? `Дата народження: ${birthDate}.` : "",
            comment,
          ]
            .filter(Boolean)
            .join(" "),
          source: "family-declaration",
          consent,
          consentVersion: "family-declaration-v1",
          turnstileToken,
        }),
      });

      const result = (await response.json()) as {
        reference?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Не вдалося надіслати заявку");
      }

      setStatus({
        type: "success",
        text: `Заявку ${result.reference ? `№ ${result.reference} ` : ""}отримано. Адміністратор перевірить можливість оформлення декларації в ЕСОЗ, перелік документів і зв’яжеться з вами.`,
      });
      setName("");
      setPhone(PHONE_PREFIX);
      setPhoneError("");
      setBirthDate("");
      setBirthDateError("");
      setComment("");
      setConsent(false);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Не вдалося надіслати заявку",
      });
    }
  }

  return (
    <section
      className="family-declaration"
      id="family-declaration"
      aria-labelledby="family-declaration-title"
    >
      <div className="family-declaration-heading">
        <div>
          <span className="section-kicker">Заявка на декларацію</span>
          <h2 id="family-declaration-title">Оберіть свого сімейного лікаря</h2>
        </div>
        <p>
          Це попередня заявка, а не підписана декларація. Адміністратор
          перевірить дані в ЕСОЗ і підкаже наступний крок.
        </p>
      </div>

      <div className="family-declaration-layout">
        <fieldset
          className={`family-doctor-options${doctorError ? " is-invalid" : ""}`}
          aria-invalid={Boolean(doctorError)}
          aria-label="Оберіть сімейного лікаря"
        >
          {doctors.length ? (
            doctors.map((doctor, doctorIndex) => {
              const isSelected = doctor.id === selectedDoctorId;
              return (
                <div
                  className={`family-doctor-option${isSelected ? " is-selected" : ""}`}
                  key={doctor.id}
                >
                  <input
                    id={`family-doctor-${doctor.id}`}
                    ref={doctorIndex === 0 ? firstDoctorInputRef : undefined}
                    type="checkbox"
                    name="familyDoctor"
                    value={doctor.id}
                    checked={isSelected}
                    onChange={() => {
                      firstDoctorInputRef.current?.setCustomValidity("");
                      setSelectedDoctorId(isSelected ? "" : doctor.id);
                      setDoctorError("");
                      if (status.type === "error") setStatus({ type: "idle" });
                    }}
                  />
                  <label
                    className="family-doctor-choice"
                    htmlFor={`family-doctor-${doctor.id}`}
                  >
                    <span
                      className="family-doctor-photo"
                      style={
                        doctor.photoUrl
                          ? { backgroundImage: `url("${doctor.photoUrl}")` }
                          : undefined
                      }
                      aria-hidden="true"
                    >
                      {!doctor.photoUrl
                        ? doctor.name
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                        : null}
                    </span>
                    <span className="family-doctor-copy">
                      <strong>{doctor.name}</strong>
                      <small>{doctor.specialty}</small>
                      <em>{formatBranch(doctor.branch)}</em>
                    </span>
                    <span className="family-doctor-check" aria-hidden="true">
                      {isSelected ? "✓" : ""}
                    </span>
                  </label>
                  <Link
                    className="family-doctor-biography"
                    href={`/doctors/${doctor.id}?returnTo=${encodeURIComponent("/services/family#family-declaration")}`}
                    aria-label={`Переглянути біографію: ${doctor.name}`}
                  >
                    Біографія <span aria-hidden="true">→</span>
                  </Link>
                </div>
              );
            })
          ) : (
            <p className="family-doctor-empty">
              Доступних лікарів для онлайн-вибору зараз немає. Залиште
              контакти — адміністрація допоможе з вибором.
            </p>
          )}
        </fieldset>

        <form className="family-declaration-form" onSubmit={handleSubmit}>
          <div className="family-patient-switch" role="group" aria-label="Для кого декларація">
            <button
              type="button"
              className={patientType === "adult" ? "is-active" : ""}
              aria-pressed={patientType === "adult"}
              onClick={() => setPatientType("adult")}
            >
              Для дорослого
            </button>
            <button
              type="button"
              className={patientType === "child" ? "is-active" : ""}
              aria-pressed={patientType === "child"}
              onClick={() => setPatientType("child")}
            >
              Для дитини
            </button>
          </div>

          <label>
            <span>Ім’я та прізвище пацієнта</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onInput={(event) => event.currentTarget.setCustomValidity("")}
              onInvalid={(event) =>
                event.currentTarget.setCustomValidity(
                  event.currentTarget.validity.valueMissing
                    ? "Вкажіть ім’я та прізвище пацієнта."
                    : "Вкажіть щонайменше два символи.",
                )
              }
              autoComplete="name"
              required
              minLength={2}
              placeholder="Наприклад, Олена Коваль"
            />
          </label>

          <div className="family-form-row">
            <label>
              <span>Номер телефону</span>
              <input
                ref={phoneInputRef}
                className={phone === PHONE_PREFIX ? "is-prefix-only" : undefined}
                type="tel"
                value={phone}
                onChange={(event) => {
                  const nextValue = formatPhoneNumber(event.target.value) || PHONE_PREFIX;
                  event.currentTarget.setCustomValidity("");
                  setPhone(nextValue);
                  if (phoneError) {
                    setPhoneError(
                      getUkrainianPhoneDigits(nextValue).length === 10
                        ? validatePhoneNumber(nextValue)
                        : "",
                    );
                  }
                }}
                onFocus={(event) => {
                  const input = event.currentTarget;
                  if ((input.selectionStart ?? 0) < PHONE_PREFIX.length) {
                    window.requestAnimationFrame(() => {
                      input.setSelectionRange(input.value.length, input.value.length);
                    });
                  }
                }}
                onClick={(event) => {
                  const input = event.currentTarget;
                  if ((input.selectionStart ?? 0) < PHONE_PREFIX.length) {
                    input.setSelectionRange(input.value.length, input.value.length);
                  }
                }}
                onKeyDown={(event) => {
                  const input = event.currentTarget;
                  const selectionStart = input.selectionStart ?? input.value.length;
                  const selectionEnd = input.selectionEnd ?? selectionStart;
                  const hasSelection = selectionEnd > selectionStart;

                  if (
                    !hasSelection &&
                    ((event.key === "Backspace" &&
                      selectionStart <= PHONE_PREFIX.length) ||
                      (event.key === "Delete" &&
                        selectionStart < PHONE_PREFIX.length))
                  ) {
                    event.preventDefault();
                    input.setSelectionRange(input.value.length, input.value.length);
                  }
                }}
                onBlur={(event) => {
                  const error = validatePhoneNumber(phone);
                  setPhoneError(error);
                  event.currentTarget.setCustomValidity(error);
                }}
                onInvalid={(event) => {
                  const error = validatePhoneNumber(phone);
                  event.currentTarget.setCustomValidity(error);
                }}
                autoComplete="tel"
                inputMode="tel"
                maxLength={17}
                required
                aria-invalid={Boolean(phoneError)}
              />
            </label>
            <label>
              <span>Дата народження</span>
              <span className="family-date-field">
                <input
                  ref={birthDateInputRef}
                  type="text"
                  value={birthDate}
                  onChange={(event) => {
                    const nextValue = formatBirthDate(event.target.value);
                    event.currentTarget.setCustomValidity("");
                    setBirthDate(nextValue);
                    if (birthDateError) {
                      setBirthDateError(
                        nextValue.length === 10 ? validateBirthDate(nextValue) : "",
                      );
                    }
                  }}
                  onBlur={(event) => {
                    const error = validateBirthDate(birthDate);
                    setBirthDateError(error);
                    event.currentTarget.setCustomValidity(error);
                  }}
                  onInvalid={(event) => {
                    const error = validateBirthDate(birthDate);
                    event.currentTarget.setCustomValidity(error);
                  }}
                  inputMode="numeric"
                  autoComplete="bday"
                  maxLength={10}
                  required
                  aria-invalid={Boolean(birthDateError)}
                  placeholder="дд.мм.рррр"
                  aria-label="Дата народження у форматі день, місяць, рік"
                />
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
                </svg>
              </span>
            </label>
          </div>

          <label>
            <span>Коментар</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              placeholder="Наприклад, зручний час для дзвінка"
            />
          </label>

          <label className="family-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              onInput={(event) => event.currentTarget.setCustomValidity("")}
              onInvalid={(event) =>
                event.currentTarget.setCustomValidity(
                  "Підтвердьте згоду на обробку контактних даних.",
                )
              }
              required
            />
            <span className="family-consent-check" aria-hidden="true">
              <svg viewBox="0 0 16 16">
                <path d="m3 8 3 3 7-7" />
              </svg>
            </span>
            <span>
              Погоджуюся на обробку контактних даних для зворотного зв’язку
              щодо декларації.
            </span>
          </label>

          <TurnstileField onToken={setTurnstileToken} />

          {status.type === "success" ? (
            <div
              className="family-declaration-success"
              role="status"
              aria-live="polite"
            >
              <span className="family-declaration-success-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="m6 12 4 4 8-9" />
                </svg>
              </span>
              <div className="family-declaration-success-copy">
                <span className="family-declaration-success-kicker">
                  Заявку успішно подано
                </span>
                <strong>Дякуємо! Ми отримали ваші дані.</strong>
                <p>{status.text}</p>
                {selectedDoctor ? (
                  <small>Обраний лікар: {selectedDoctor.name}</small>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setStatus({ type: "idle" })}
              >
                Подати ще одну заявку
              </button>
            </div>
          ) : (
            <>
              <button
                className="family-declaration-submit"
                type="submit"
                disabled={status.type === "loading" || !doctors.length}
              >
                {status.type === "loading" ? "Надсилаємо…" : "Подати заявку"}
                <span aria-hidden="true">→</span>
              </button>

              {status.type === "error" ? (
                <p className="family-form-status is-error" role="alert">
                  {status.text}
                </p>
              ) : null}
            </>
          )}
        </form>
      </div>
    </section>
  );
}
