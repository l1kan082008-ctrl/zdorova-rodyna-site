import Link from "next/link";
import Image from "next/image";
import { canOptimizeImage, resolveImageSource } from "@/lib/imageSource";
import { doctorBookingHref, splitDoctorBranches } from "@/lib/doctorBranches";
import { screeningDoctorIds, screeningServiceName } from "@/lib/screening40";
import "../portraits.css";
import screeningStyles from "../screening-actions.module.css";
import { DoctorProfileBackLink } from "./DoctorProfileBackLink";
import { DoctorCertificates } from "./DoctorCertificates";
import { DoctorBiography } from "./DoctorBiography";
import { doctorCertificates } from "../doctorCertificates";
import {
  getDoctorInitials,
  getDoctorPosition,
  getDoctorReportingModalities,
  getDoctorExperienceLabel,
  getMriReportingPartner,
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
  const reportingPartner = getMriReportingPartner(doctor);
  const canBookScreening = canBookDoctorConsultation(doctor)
    && screeningDoctorIds.some((id) => id === doctor.id);
  const branches = splitDoctorBranches(doctor.branch);
  const activeDays = getDoctorScheduleDays(doctor.schedule);
  const hasBiography = Boolean(doctor.biography.trim());
  const structuredBiography = Boolean(reportingPartner) && /^##\s+/m.test(doctor.biography);

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
                  src={resolveImageSource(doctor.photoUrl)}
                  unoptimized={!canOptimizeImage(doctor.photoUrl)}
                  alt={`Фотографія лікаря ${doctor.name}`}
                  fill
                  quality={85}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 720px) calc(100vw - 32px), (max-width: 1288px) 43vw, 534px"
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
              <div>
                <dt>{reportingPartner ? reportingPartner.organization ? "Співпраця" : "Напрям роботи" : branches.length > 1 ? "Місця прийому" : "Місце прийому"}</dt>
                <dd className="doctor-branch-addresses">{reportingPartner ? reportingPartner.organization ? `Медичний центр ${reportingPartner.organization}` : "Опис МРТ-досліджень" : branches.join("\n") || "Відділення уточнюйте"}</dd>
              </div>
              {canBookDoctorConsultation(doctor) && consultationSummary && (<div>
                <dt>Вартість консультації</dt>
                <dd>{consultationSummary}</dd>
              </div>)}
              {reportingModalities && <div>
                <dt>Що описує лікар</dt>
                <dd>{reportingModalities}</dd>
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
                  Перед візитом радимо підтвердити актуальний час в адміністратора.
                </small>
              </aside>
            ) : !reportingPartner ? (
              <p className="doctor-schedule-notice">{getDoctorScheduleNotice(doctor)}</p>
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
                Записатися на прийом <span>→</span>
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
