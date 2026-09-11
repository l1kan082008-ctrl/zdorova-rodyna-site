import Image from "next/image";
import styles from "./HolterEquipment.module.css";

// Model specifications: https://ecgpro.ua/price/ (ECGpro Holter Lite / BS6930-3).
// Official photo: https://ecgpro.ua/wp-content/uploads/2019/05/recorder_tr04.png
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
        <h2 id="holter-equipment-title">ECGpro Holter Lite</h2>
        <p>з монітором BS6930-3</p>
      </header>

      <figure className={styles.photo}>
        <Image
          src="/equipment/ecgpro-holter-bs6930-3.webp"
          alt="Портативний монітор ЕКГ BS6930-3 з екраном і кабелем для електродів"
          width={1200}
          height={913}
          sizes="(max-width: 720px) calc(100vw - 60px), (max-width: 1000px) 42vw, 520px"
        />
      </figure>

      <div className={styles.description}>
        <p className={styles.intro}>
          У «Здоровій Родині» використовуємо ECGpro Holter Lite для
          добового спостереження за серцем. Компактний монітор записує
          ЕКГ, поки ви займаєтеся звичними справами та спите.
        </p>

        <dl className={styles.facts}>
          <div>
            <dt>Запис ЕКГ</dt>
            <dd>3 канали</dd>
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
            Монітор зберігає ЕКГ у трьох каналах, а вбудований LCD-екран
            дозволяє переглянути сигнал під час налаштування. Перед
            обстеженням фахівець встановлює електроди та пояснює, як
            користуватися реєстратором.
          </p>
          <h3>Аналіз програми, висновок лікаря</h3>
          <p>
            Після повернення приладу програма ECGpro Holter Lite
            допомагає знаходити епізоди порушень ритму. Лікар перевіряє
            запис, зіставляє його зі щоденником симптомів і готує
            висновок.
          </p>
        </div>
      </div>
    </section>
  );
}
