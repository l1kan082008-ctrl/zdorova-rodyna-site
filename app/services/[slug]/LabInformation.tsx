import { labResearchGroups, type ServiceDetail } from "../serviceData";
import styles from "./LabInformation.module.css";

export function LabInformation({ service }: { service: ServiceDetail }) {
  return (
    <>
      <section className={styles.section} aria-labelledby="lab-directions-title">
        <header className={styles.heading}>
          <span className="section-kicker">Напрямки досліджень</span>
          <h2 id="lab-directions-title">{service.indicationsTitle}</h2>
        </header>
        <div className={styles.groups}>
          {labResearchGroups.map((group) => (
            <div className={styles.group} key={group.title}>
              <h3>{group.title}</h3>
              <ul className={styles.researchList} role="list">
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="lab-preparation-title">
        <header className={styles.heading}>
          <span className="section-kicker">Перед візитом</span>
          <h2 id="lab-preparation-title">Як підготуватися</h2>
        </header>
        <ol className={styles.preparation} role="list">
          {service.preparation.map((item, index) => (
            <li key={item}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
