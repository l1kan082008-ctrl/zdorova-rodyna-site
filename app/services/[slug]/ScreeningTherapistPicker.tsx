"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { TurnstileField } from "@/app/components/TurnstileField";
import { useBookingConfirmation } from "@/app/components/useBookingConfirmation";
import { getDoctorInitials, type Doctor } from "../../doctors/doctorData";
import { PHONE_PREFIX, formatPhoneNumber, getUkrainianPhoneDigits, validatePhoneNumber } from "@/lib/ukrainianPhone";
import { preventNativeBookingSubmit, submitBookingFromClick } from "@/lib/bookingSubmission";
import { canOptimizeImage, resolveImageSource } from "@/lib/imageSource";
import { isScreeningFullName, screeningAddress, screeningServiceName } from "@/lib/screening40";
import { sitePhoneHref } from "@/lib/siteSettings";
import styles from "./ScreeningTherapists.module.css";

type ScreeningDoctor = Pick<Doctor, "id" | "name" | "specialty" | "photoUrl">;
type FormStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; reference: string; doctorName?: string }
  | { type: "error"; text: string };

class ScreeningSubmissionError extends Error {}

function nameError(value: string) {
  return isScreeningFullName(value) ? "" : "Вкажіть прізвище, ім’я та по батькові повністю.";
}

export function ScreeningTherapistPicker({ doctors, phone: sitePhone }: { doctors: ScreeningDoctor[]; phone: string }) {
  const submittingRef = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(PHONE_PREFIX);
  const [errors, setErrors] = useState({ name: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedId);
  const loading = status.type === "loading";

  useBookingConfirmation(status.type === "success" ? status.reference : "", "screening_40");

  async function handleSubmit() {
    if (submittingRef.current) return;
    const nextErrors = {
      name: nameError(name),
      phone: validatePhoneNumber(phone),
    };
    setErrors(nextErrors);
    nameRef.current?.setCustomValidity(nextErrors.name);
    phoneRef.current?.setCustomValidity(nextErrors.phone);
    const invalidField = nextErrors.name ? nameRef.current : nextErrors.phone ? phoneRef.current : null;
    if (invalidField) {
      invalidField?.reportValidity();
      return;
    }
    if (!consent) {
      setStatus({ type: "error", text: "Підтвердьте згоду на обробку контактних даних." });
      return;
    }

    submittingRef.current = true;
    setStatus({ type: "loading" });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          source: "screening-40",
          consentVersion: "screening-40-v1",
          service: screeningServiceName,
          doctorId: selectedDoctor?.id,
          name: name.trim().replace(/\s+/g, " "),
          phone: `+38${getUkrainianPhoneDigits(phone)}`,
          consent,
          website: "",
          turnstileToken,
        }),
      });
      const result = await response.json() as { reference?: string; error?: string };
      if (!response.ok || typeof result.reference !== "string" || !result.reference.trim()) {
        throw new ScreeningSubmissionError(result.error || "Не вдалося отримати підтвердження заявки. Зателефонуйте нам, щоб перевірити її.");
      }
      setStatus({ type: "success", reference: result.reference, doctorName: selectedDoctor?.name });
      setName("");
      setPhone(PHONE_PREFIX);
      setConsent(false);
    } catch (error) {
      setStatus({
        type: "error",
        text: controller.signal.aborted
          ? "Не вдалося отримати підтвердження вчасно. Заявка могла бути отримана. Зателефонуйте нам, щоб перевірити її, перш ніж надсилати повторно."
          : error instanceof ScreeningSubmissionError ? error.message : "Не вдалося отримати підтвердження заявки. Перевірте з’єднання або зателефонуйте нам.",
      });
    } finally {
      window.clearTimeout(timeout);
      submittingRef.current = false;
      setTurnstileToken("");
      setTurnstileKey((value) => value + 1);
    }
  }

  return (
    <div className={`family-declaration-layout ${styles.layout}`}>
      <fieldset
        className={`family-doctor-options ${styles.choices}`}
        disabled={loading}
      >
        <legend className={styles.srOnly}>Вибір конкретного лікаря для заявки — за бажанням</legend>
        {doctors.length > 0 ? doctors.map((doctor) => {
          const selected = doctor.id === selectedId;
          return (
            <div className={`family-doctor-option ${styles.choice}${selected ? " is-selected" : ""}`} key={doctor.id}>
              <input
                id={`screening-doctor-${doctor.id}`}
                type="radio"
                name="screeningDoctor"
                value={doctor.id}
                checked={selected}
                aria-label={doctor.name}
                onClick={() => {
                  if (selected) {
                    setSelectedId("");
                    if (status.type === "error") setStatus({ type: "idle" });
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === " ") {
                    event.preventDefault();
                    if (!event.repeat) {
                      setSelectedId(selected ? "" : doctor.id);
                      if (status.type === "error") setStatus({ type: "idle" });
                    }
                  }
                }}
                onChange={() => {
                  setSelectedId(doctor.id);
                  if (status.type === "error") setStatus({ type: "idle" });
                }}
              />
              <label className={`family-doctor-choice ${styles.doctorChoice}`} htmlFor={`screening-doctor-${doctor.id}`}>
                <span className={`family-doctor-photo ${styles.portrait}`} aria-hidden="true">
                  {doctor.photoUrl ? (
                    <Image
                      src={resolveImageSource(doctor.photoUrl)}
                      unoptimized={!canOptimizeImage(doctor.photoUrl)}
                      alt=""
                      fill
                      sizes="(max-width: 360px) 52px, (max-width: 760px) 64px, 76px"
                      quality={85}
                    />
                  ) : getDoctorInitials(doctor.name)}
                </span>
                <span className="family-doctor-copy">
                  <strong>{doctor.name}</strong>
                  <small>{doctor.specialty}</small>
                  <em className="doctor-branch-addresses">{screeningAddress}</em>
                </span>
                <span className="family-doctor-check" aria-hidden="true">{selected ? "✓" : ""}</span>
              </label>
              <Link
                className="family-doctor-biography"
                href={`/doctors/${doctor.id}?returnTo=${encodeURIComponent("/services/screening-40#screening-doctors")}`}
                aria-label={`Переглянути профіль: ${doctor.name}`}
              >
                Профіль <span aria-hidden="true">→</span>
              </Link>
            </div>
          );
        }) : <p className="family-doctor-empty">Перелік лікарів зараз недоступний. Залиште заявку — адміністратор допоможе обрати спеціаліста.</p>}
      </fieldset>

      <form id="screening-application" className={`family-declaration-form ${styles.form}`} onSubmit={preventNativeBookingSubmit} aria-label="Заявка на скринінг 40+" aria-busy={loading}>
        {status.type === "success" ? (
          <div className="family-declaration-success" role="status" aria-live="polite">
            <span className="family-declaration-success-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9" /></svg></span>
            <div className="family-declaration-success-copy">
              <span className="family-declaration-success-kicker">Заявку успішно подано</span>
              <strong>Дякуємо! Ми отримали вашу заявку.</strong>
              <p>Заявка № {status.reference}. Адміністратор зателефонує, щоб погодити дату й час скринінгу.</p>
              <small>{status.doctorName ? `Обраний лікар: ${status.doctorName}` : "Адміністратор допоможе обрати лікаря."}</small>
            </div>
            <button type="button" onClick={() => { setStatus({ type: "idle" }); setSelectedId(""); setErrors({ name: "", phone: "" }); }}>Подати ще одну заявку</button>
          </div>
        ) : (
          <>
            <div className={styles.formIntro}>
              <h3>Ваші контактні дані</h3>
              <p>Залиште заявку на участь у програмі. Дату й час візиту підтвердить адміністратор.</p>
              <div className={styles.selection}>
                <p aria-live="polite" aria-atomic="true">
                  {selectedDoctor ? <>Обраний лікар: <strong>{selectedDoctor.name}</strong></> : "Конкретного лікаря можна обрати пізніше — адміністратор допоможе під час дзвінка."}
                </p>
                {selectedDoctor && <button className={styles.clearChoice} type="button" disabled={loading} onClick={() => { setSelectedId(""); if (status.type === "error") setStatus({ type: "idle" }); }}>Скасувати вибір лікаря</button>}
              </div>
            </div>
            <label>
              <span>Прізвище, ім’я та по батькові</span>
              <input
                ref={nameRef}
                type="text"
                name="name"
                value={name}
                disabled={loading}
                onChange={(event) => { event.currentTarget.setCustomValidity(""); setName(event.target.value); setErrors((current) => ({ ...current, name: "" })); }}
                onBlur={(event) => { const error = nameError(name); event.currentTarget.setCustomValidity(error); setErrors((current) => ({ ...current, name: error })); }}
                onInvalid={(event) => { const error = nameError(name); event.currentTarget.setCustomValidity(error); setErrors((current) => ({ ...current, name: error })); }}
                autoComplete="name"
                placeholder="П.І.Б."
                required
                maxLength={100}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "screening-name-error" : undefined}
              />
              {errors.name && <span className="family-field-error" id="screening-name-error">{errors.name}</span>}
            </label>
            <label>
              <span>Номер телефону</span>
              <input
                ref={phoneRef}
                className={phone === PHONE_PREFIX ? "is-prefix-only" : undefined}
                type="tel"
                name="phone"
                value={phone === PHONE_PREFIX ? "" : phone}
                disabled={loading}
                onChange={(event) => {
                  const nextValue = formatPhoneNumber(event.target.value);
                  event.currentTarget.setCustomValidity("");
                  setPhone(nextValue);
                  setErrors((current) => ({
                    ...current,
                    phone: current.phone && getUkrainianPhoneDigits(nextValue).length === 10
                      ? validatePhoneNumber(nextValue) : "",
                  }));
                }}
                onFocus={(event) => {
                  const input = event.currentTarget;
                  if ((input.selectionStart ?? 0) < PHONE_PREFIX.length) {
                    window.requestAnimationFrame(() => {
                      const start = input.selectionStart ?? 0;
                      const end = input.selectionEnd ?? start;
                      if (start === end && start < PHONE_PREFIX.length) {
                        input.setSelectionRange(input.value.length, input.value.length);
                      }
                    });
                  }
                }}
                onClick={(event) => {
                  const input = event.currentTarget;
                  const start = input.selectionStart ?? 0;
                  const end = input.selectionEnd ?? start;
                  if (start === end && start < PHONE_PREFIX.length) {
                    input.setSelectionRange(input.value.length, input.value.length);
                  }
                }}
                onKeyDown={(event) => {
                  const input = event.currentTarget;
                  const selectionStart = input.selectionStart ?? input.value.length;
                  const selectionEnd = input.selectionEnd ?? selectionStart;
                  const hasSelection = selectionEnd > selectionStart;
                  if (!hasSelection && (
                    (event.key === "Backspace" && selectionStart <= PHONE_PREFIX.length)
                    || (event.key === "Delete" && selectionStart < PHONE_PREFIX.length)
                  )) {
                    event.preventDefault();
                    input.setSelectionRange(input.value.length, input.value.length);
                  }
                }}
                onBlur={(event) => { const error = validatePhoneNumber(phone); event.currentTarget.setCustomValidity(error); setErrors((current) => ({ ...current, phone: error })); }}
                onInvalid={(event) => { const error = validatePhoneNumber(phone); event.currentTarget.setCustomValidity(error); setErrors((current) => ({ ...current, phone: error })); }}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+38 (___) ___-__-__"
                maxLength={17}
                pattern={"\\+38 (?!000 000-00-00)0[0-9]{2} [0-9]{3}-[0-9]{2}-[0-9]{2}"}
                required
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "screening-phone-error" : undefined}
              />
              {errors.phone && <span className="family-field-error" id="screening-phone-error">{errors.phone}</span>}
            </label>
            <label className={`family-consent ${styles.consent}`}>
              <input type="checkbox" checked={consent} disabled={loading} required
                onChange={(event) => { event.currentTarget.setCustomValidity(""); setConsent(event.target.checked); }}
                onInvalid={(event) => event.currentTarget.setCustomValidity("Підтвердьте згоду на обробку контактних даних.")}
              />
              <span className="family-consent-check" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" /></svg></span>
              <span>Погоджуюся на обробку контактних даних для зворотного зв’язку щодо програми «Скринінг здоров’я 40+».</span>
            </label>
            <TurnstileField key={turnstileKey} onToken={setTurnstileToken} />
            <button className={`family-declaration-submit ${styles.submit}`} type="submit" disabled={loading} onClick={(event) => submitBookingFromClick(event, handleSubmit)}>
              {loading ? "Надсилаємо…" : "Подати заявку"}<span aria-hidden="true">→</span>
            </button>
            {status.type === "error" && <p className="family-form-status is-error" role="alert">{status.text}</p>}
          </>
        )}
        <div className={styles.phoneAlternative}>
          <span>Зручніше телефоном?</span>
          <a href={sitePhoneHref(sitePhone)}>{sitePhone}<span aria-hidden="true">→</span></a>
        </div>
      </form>
    </div>
  );
}
