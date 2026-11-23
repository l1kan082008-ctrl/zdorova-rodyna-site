import Link from "next/link";
import Image from "next/image";
import { canOptimizeImage, resolveImageSource } from "@/lib/imageSource";
import { doctorBookingHref, getDoctorPhoneBooking, getPublicDoctorBranches } from "@/lib/doctorBranches";
import { screeningDoctorIds, screeningServiceName } from "@/lib/screening40";
import "../portraits.css";
import screeningStyles from "../screening-actions.module.css";
import { DoctorProfileBackLink } from "./DoctorProfileBackLink";
import { DoctorCertificates } from "./DoctorCertificates";
import { DoctorBiography } from "./DoctorBiography";
import styles from "./DoctorProfileDetails.module.css";
import { doctorCertificates } from "../doctorCertificates";
import {
  getDoctorInitials,
  getDoctorPosition,
  getFullLandscapePortrait,
  getDoctorReportingModalities,
  getDoctorExperienceLabel,
  getReportingPartner,
  formatDoctorConsultations,
  canBookDoctorConsultation,
  getDoctorPatientGroups,
  getDoctorScheduleDays,
  getDoctorScheduleNotice,
  type Doctor,
} from "../doctorData";

type DoctorProfileDetailsProps = {
  doctor: Doctor | null;
  returnTo?: string;
};

export function DoctorProfileDetails({ doctor, returnTo }: DoctorProfileDetailsProps) {
  if (!doctor) {
    return (
      <section className="doctor-detail-state">
        <span className="section-kicker">Лікарі</span>
        <h1>Лікаря не знайдено</h1>
        <p>Поверніться до каталогу та оберіть іншого спеціаліста.</p>
        <Link className="outline-button" href="/doctors">
          ← До всіх лікарів
        </Link>
      </section>
    );
  }

  const consultationSummary = formatDoctorConsultations(doctor);
  const position = getDoctorPosition(doctor);
  const reportingModalities = getDoctorReportingModalities(doctor);
  const reportingPartner = getReportingPartner(doctor);
  const canBookScreening = canBookDoctorConsultation(doctor)
    && screeningDoctorIds.some((id) => id === doctor.id);
  const branches = getPublicDoctorBranches(doctor);
  const phoneBooking = getDoctorPhoneBooking(doctor.id);
  const activeDays = getDoctorScheduleDays(doctor.schedule);
  const hasBiography = Boolean(doctor.biography.trim());
  const structuredBiography = Boolean(reportingPartner) && /^##\s+/m.test(doctor.biography);
  const fullLandscapePortrait = getFullLandscapePortrait(doctor);
  const portraitSource = fullLandscapePortrait ?? resolveImageSource(doctor.photoUrl ?? "");

  return (
    <>
      <section className={`doctor-detail-shell${doctorCertificates[doctor.id]?.length ? " doctor-detail-shell--certificates" : ""}`}>
        <DoctorProfileBackLink doctorId={doctor.id} returnTo={returnTo} />

        <div className="doctor-detail-hero">
          <div className="doctor-detail-photo">
            {doctor.photoUrl ? (
              <div className="doctor-detail-portrait-frame">
                <Image
                  className="doctor-portrait doctor-detail-portrait"
                  src={portraitSource}
                  unoptimized={!canOptimizeImage(portraitSource)}
                  alt={`Фотографія лікаря ${doctor.name}`}
                  fill
                  quality={fullLandscapePortrait ? 90 : 85}
                  loading="eager"
                  fetchPriority="high"
                  // This landscape original covers a tall frame; select enough pixels for its height.
                  sizes={fullLandscapePortrait
                    ? "(max-width: 720px) 720px, 900px"
                    : "(max-width: 720px) calc(100vw - 32px), (max-width: 1288px) 43vw, 534px"}
                />
              </div>
            ) : (
              <span aria-hidden="true">{getDoctorInitials(doctor.name)}</span>
            )}
          </div>

          <div className="doctor-detail-heading">
            <span className="doctor-specialty">{doctor.specialty}</span>
            <h1>{doctor.name}</h1>
            {position && <p className="doctor-detail-lead">{position}</p>}

            <dl className="doctor-detail-facts">
              {(!reportingPartner || getDoctorExperienceLabel(doctor, "")) && <div>
                <dt>Стаж роботи</dt>
                <dd>
                  {getDoctorExperienceLabel(doctor, "Уточнюється")}
                </dd>
              </div>}
              {canBookDoctorConsultation(doctor) && (<div><dt>Приймає</dt><dd>{getDoctorPatientGroups(doctor.patientGroups ?? [])}</dd></div>)}
              {reportingPartner ? (
                <div>
                  <dt>{reportingPartner.organization ? "Співпраця" : "Напрям роботи"}</dt>
                  <dd>{reportingPartner.organization ? `Медичний центр ${reportingPartner.organization}` : "Опис МРТ-досліджень"}</dd>
                </div>
              ) : branches && (
                <div>
                  <dt>{branches.length > 1 ? "Місця прийому" : "Місце прийому"}</dt>
                  <dd className="doctor-branch-addresses">{branches.join("\n") || "Відділення уточнюйте"}</dd>
                </div>
              )}
              {canBookDoctorConsultation(doctor) && consultationSummary && (<div>
                <dt>Вартість консультації</dt>
                <dd>{consultationSummary}</dd>
              </div>)}
              {reportingModalities && <div>
                <dt>Що описує лікар</dt>
                <dd>{reportingModalities}</dd>
              </div>}
              {reportingPartner?.instagramUrl && <div className={styles.socialFact}>
                <dt className="sr-only">Instagram</dt>
                <dd>
                  <a
                    className={`footer-social-link ${styles.instagram}`}
                    href={reportingPartner.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram — ${doctor.name}, відкриється в новій вкладці`}
                    title={`Instagram — ${doctor.name}`}
                  >
                    <svg className="footer-social-icon footer-social-icon-instagram" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="5" />
                      <circle cx="12" cy="12" r="3.65" />
                      <circle className="footer-social-icon-dot" cx="17.35" cy="6.8" r="1" />
                    </svg>
                  </a>
                </dd>
              </div>}
            </dl>

            {doctor.description ? (
              <p className="doctor-detail-lead">{doctor.description}</p>
            ) : null}

            {!reportingModalities && (activeDays.length ? (
              <aside className="doctor-detail-schedule doctor-detail-schedule--inline">
                <h2>{canBookDoctorConsultation(doctor) ? "Години прийому" : "Години роботи"}</h2>
                <div>
                  {activeDays.map((day) => (
                    <p key={day.key}>
                      <span>{day.label}</span>
                      <strong>{doctor.schedule[day.key]?.trim()}</strong>
                    </p>
                  ))}
                </div>
                <small>
                  {phoneBooking?.notice ?? "Перед візитом радимо підтвердити актуальний час в адміністратора."}
                </small>
              </aside>
            ) : !reportingPartner ? (
              <p className="doctor-schedule-notice">{phoneBooking?.notice ?? getDoctorScheduleNotice(doctor)}</p>
            ) : null)}

            {canBookDoctorConsultation(doctor) && (<div className={`doctor-detail-actions${canBookScreening ? ` ${screeningStyles.profileActions}` : ""}`}>
              {canBookScreening && (
                <a
                  className="outline-button"
                  href={doctorBookingHref(doctor, screeningServiceName)}
                  aria-label={`Скринінг 40+ — ${doctor.name}`}
                >
                  Скринінг 40+ <span aria-hidden="true">→</span>
                </a>
              )}
              <a
                className="book-button"
                href={doctorBookingHref(doctor)}
              >
                {phoneBooking ? `Зателефонувати ${phoneBooking.phone}` : <>Записатися на прийом <span>→</span></>}
              </a>
            </div>)}
          </div>
        </div>

        {hasBiography && (
          <div className={`doctor-detail-content${structuredBiography ? " doctor-detail-content--structured" : ""}`}>
            <article className="doctor-biography">
              <span className="section-kicker">Про лікаря</span>
              <h2>{structuredBiography ? "Професійний досвід" : "Біографія та професійний досвід"}</h2>
              {reportingPartner ? (
                <DoctorBiography biography={doctor.biography} instagramUrl={reportingPartner.instagramUrl} />
              ) : doctor.biography.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean).map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>
              ))}
            </article>
          </div>
        )}
        <DoctorCertificates doctorName={doctor.name} certificates={doctorCertificates[doctor.id] ?? []} />
      </section>
    </>
  );
}
