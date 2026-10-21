import { listPublicDoctors } from "../../api/doctors/publicDoctors";
import { screeningDoctorIds } from "@/lib/screening40";
import { ScreeningTherapistPicker } from "./ScreeningTherapistPicker";
import styles from "./ScreeningTherapists.module.css";

export async function ScreeningTherapists({ phone }: { phone: string }) {
  const publishedDoctors = await listPublicDoctors();
  const doctors = screeningDoctorIds.flatMap((id) => {
    const doctor = publishedDoctors.find((item) => item.id === id && item.isActive !== false);
    return doctor ? [{ id: doctor.id, name: doctor.name, specialty: doctor.specialty, photoUrl: doctor.photoUrl }] : [];
  });

  return (
    <section id="screening-doctors" className={`family-declaration ${styles.section}`} aria-labelledby="screening-doctors-title">
      <div className={`family-declaration-heading ${styles.heading}`}>
        <div>
          <span className="section-kicker">Заявка на скринінг 40+</span>
          <h2 id="screening-doctors-title">Лікарі програми 40+</h2>
        </div>
      </div>
      <ScreeningTherapistPicker doctors={doctors} phone={phone} />
    </section>
  );
}
