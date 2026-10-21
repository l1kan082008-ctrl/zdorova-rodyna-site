import Image from "next/image";
import styles from "./HolterEquipment.module.css";

// Model specifications: https://ecgpro.ua/price/ (BS6930-12).
// ECGpro uses the same BS6930 product photo for its 3- and 12-channel recorders.
// The monitor supports longer recordings; this page describes our 24-hour service.
export function HolterEquipment() {
  return (
    <section
      className={styles.equipment}
      id="holter-equipment"
      aria-labelledby="holter-equipment-title"
    >
      <header className={styles.heading}>
        <span className="section-kicker">Наше обладнання</span>
        <h2 id="holter-equipment-title">ECGpro Holter</h2>
        <p>12-канальний монітор BS6930-12</p>
      </header>

      <figure className={styles.photo}>
        <Image
          src="/equipment/ecgpro-holter-bs6930.webp"
          alt="Портативний монітор ECGpro Holter з екраном і кабелем для електродів"
          width={1200}
          height={913}
          quality={85}
          sizes="(max-width: 426px) calc(100vw - 66px), (max-width: 720px) 360px, (max-width: 760px) calc(50vw - 53px), (max-width: 1000px) calc(50vw - 61px), (max-width: 1288px) calc(46vw - 71px), 522px"
        />
      </figure>

      <div className={styles.description}>
        <p className={styles.intro}>
          У «Здоровій Родині» використовуємо 12-канальний монітор
          BS6930-12 системи ECGpro Holter для добового спостереження за серцем. Прилад записує
          ЕКГ, поки ви займаєтеся звичними справами та спите.
        </p>

        <dl className={styles.facts}>
          <div>
            <dt>Запис ЕКГ</dt>
            <dd>12 каналів</dd>
          </div>
          <div>
            <dt>Вага без батарейки</dt>
            <dd>50 г</dd>
          </div>
          <div>
            <dt>Розміри монітора</dt>
            <dd>75 × 58 × 17 мм</dd>
          </div>
        </dl>

        <div className={styles.explanation}>
          <h3>Невеликий прилад — повний запис доби</h3>
          <p>
            Монітор зберігає ЕКГ у 12 каналах, а вбудований LCD-екран
            дозволяє переглянути сигнал під час налаштування. Перед
            обстеженням фахівець встановлює електроди та пояснює, як
            користуватися реєстратором.
          </p>
          <h3>Аналіз програми, висновок лікаря</h3>
          <p>
            Після повернення приладу програма ECGpro Holter
            допомагає знаходити епізоди порушень ритму. Лікар перевіряє
            запис, зіставляє його зі щоденником симптомів і готує
            висновок.
          </p>
        </div>
      </div>
    </section>
  );
}
