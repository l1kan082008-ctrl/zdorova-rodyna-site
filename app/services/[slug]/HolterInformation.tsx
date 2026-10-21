import Link from "next/link";
import { holterFaq } from "../holterContent";
import styles from "./HolterInformation.module.css";

export function HolterOverview() {
  return (
    <section className={`${styles.section} ${styles.columns}`} aria-labelledby="holter-about-title">
      <div>
        <span className="section-kicker">Про дослідження</span>
        <h2 id="holter-about-title">Добове моніторування ЕКГ у Рівному</h2>
        <p>
          Холтерівське моніторування — це тривалий запис електричної активності
          серця за допомогою невеликого переносного приладу. Електроди на грудній
          клітці передають сигнал реєстратору, який ви носите із собою протягом
          24 годин. Госпіталізація для цього обстеження не потрібна.
        </p>
        <p>
          У медичному центрі «Здорова Родина» встановлюють 12-канальний реєстратор,
          пояснюють правила моніторування та аналізують отриманий запис.
          Щоб пройти Холтер у Рівному, залиште заявку: адміністратор погодить
          час встановлення й повернення приладу.
        </p>
      </div>
      <div className={styles.explanation}>
        <h3>Навіщо спостерігати за серцем цілу добу</h3>
        <p>
          Відчуття перебоїв або серцебиття може з’являтися лише час від часу.
          Якщо під час короткої ЕКГ симптомів немає, лікар може рекомендувати
          добовий запис. Він допомагає оцінити ритм у різних ситуаціях —
          під час руху, відпочинку та сну.
        </p>
        <p>
          Результат Холтера оцінюють разом зі скаргами та іншими обстеженнями.
          Якщо епізод не повторився за час запису, це не завжди виключає
          порушення ритму; подальший план визначає лікар.
        </p>
        <Link className={styles.textLink} href="/services/cardiology">
          Кардіологія та діагностика серця <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export function HolterFaq() {
  return (
    <section className={`${styles.section} ${styles.faq}`} id="holter-faq" aria-labelledby="holter-faq-title">
      <header>
        <span className="section-kicker">Відповіді перед візитом</span>
        <h2 id="holter-faq-title">Часті запитання про Холтер</h2>
      </header>
      <div className="faq-list">
        {holterFaq.map(({ question, answer }) => (
          <details className="faq-item" key={question}>
            <summary className="faq-question">
              <span className="faq-question-copy"><strong>{question}</strong></span>
              <span className="faq-toggle" aria-hidden="true" />
            </summary>
            <p className={styles.answer}>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
