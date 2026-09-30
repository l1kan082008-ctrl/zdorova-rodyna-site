"use client";

import { useId } from "react";
import { doctorAcademicStatusOptions, getDoctorAcademicStatus, splitSpecialties, withDoctorAcademicStatus } from "./doctorFormState";
import styles from "./doctors.module.css";

export default function DoctorAcademicStatusPicker({ value, onChange, disabled = false }: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const hintId = useId();
  const selected = new Set(splitSpecialties(value).map(getDoctorAcademicStatus));

  return (
    <fieldset className={styles.academicPicker} disabled={disabled} aria-describedby={hintId}>
      <legend>Статуси та звання</legend>
      <p className={styles.fieldHint} id={hintId}>Необов’язково. Оберіть науковий ступінь і звання — вони відображатимуться поруч зі спеціальністю лікаря.</p>
      <div className={styles.academicOptions}>
        {doctorAcademicStatusOptions.map((option) => (
          <label key={option.value} className={styles.specialtyOption}>
            <input
              type="checkbox"
              checked={selected.has(option.value)}
              onChange={(event) => onChange(withDoctorAcademicStatus(value, option.value, event.target.checked))}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
