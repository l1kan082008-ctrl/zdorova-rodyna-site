// Patient guidance: Mayo Clinic (Holter monitor), North Bristol NHS Trust
// (Ambulatory ECG monitoring), CUH (Holter Symptom Diary), Princess Alexandra
// Hospital NHS Trust (ECG Monitor). Service duration/equipment come from our catalog.
export const holterUrl = "https://zdorovarodynaplus.com.ua/services/holter";
export const holterSeoTitle = "Холтер ЕКГ у Рівному — добове моніторування | Здорова Родина";
export const holterSeoDescription =
  "Холтер ЕКГ у Рівному: запис ритму серця 24 години. Опис і розшифрування результатів лікарем входять у вартість. Підготовка та запис у «Здоровій Родині».";
export const holterSeoImage = {
  url: "https://zdorovarodynaplus.com.ua/equipment/ecgpro-holter-bs6930-3.webp",
  width: 1200,
  height: 913,
  type: "image/webp",
  alt: "Монітор ЕКГ BS6930-3 для добового Холтер-моніторування у «Здоровій Родині»",
} as const;

export const holterFaq = [
  {
    question: "Чи входить опис результатів у вартість Холтера?",
    answer: "Так. Опис і розшифрування результатів лікарем входять у вартість Холтер-моніторування. Окремо оплачувати опис не потрібно.",
  },
  {
    question: "Чим Холтер відрізняється від звичайної ЕКГ?",
    answer: "Звичайна ЕКГ фіксує роботу серця протягом короткого обстеження. Холтер безперервно записує ЕКГ упродовж доби, зокрема під час сну та звичних справ. Це допомагає зафіксувати порушення ритму, які виникають періодично й можуть не потрапити на короткий запис.",
  },
  {
    question: "Чи можна працювати та спати з Холтером?",
    answer: "Так, моніторування проходить у звичних умовах, і прилад залишається під’єднаним під час сну. Дотримуйтеся рекомендацій лікаря щодо навантаження, бережіть електроди та дроти. Не потрібно спеціально провокувати серцебиття чи незвичне фізичне навантаження заради запису.",
  },
  {
    question: "Чи можна приймати душ під час моніторування?",
    answer: "Із встановленим реєстратором не можна приймати душ, ванну або плавати: прилад та електроди мають залишатися сухими. Прийміть душ до встановлення. Якщо електрод відклеївся, дотримуйтеся отриманої інструкції або зв’яжіться з центром.",
  },
  {
    question: "Чи потрібно скасовувати ліки або приходити натще?",
    answer: "Для самого Холтер-моніторування зазвичай не потрібно бути натще. Приймайте призначені ліки у звичному режимі, якщо лікар не дав інших вказівок. Не скасовуйте й не змінюйте дозування самостійно. Якщо того самого дня заплановані інші обстеження, уточніть їхні правила підготовки.",
  },
  {
    question: "Коли можна отримати результат Холтера?",
    answer: "Результат готують після завершення добового запису та повернення реєстратора. Лікар має переглянути ЕКГ і зіставити її зі щоденником симптомів. Термін готовності та спосіб отримання висновку уточніть в адміністратора під час запису або повернення приладу.",
  },
] as const;

export const holterStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalWebPage",
      "@id": `${holterUrl}#webpage`,
      url: holterUrl,
      name: holterSeoTitle,
      description: holterSeoDescription,
      inLanguage: "uk-UA",
      image: { "@id": `${holterUrl}#primaryimage` },
      primaryImageOfPage: { "@id": `${holterUrl}#primaryimage` },
      about: { "@type": "MedicalTest", name: "Холтерівське моніторування ЕКГ" },
      breadcrumb: { "@id": `${holterUrl}#breadcrumbs` },
    },
    {
      "@type": "ImageObject",
      "@id": `${holterUrl}#primaryimage`,
      url: holterSeoImage.url,
      contentUrl: holterSeoImage.url,
      width: holterSeoImage.width,
      height: holterSeoImage.height,
      encodingFormat: holterSeoImage.type,
      caption: holterSeoImage.alt,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${holterUrl}#breadcrumbs`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Послуги", item: "https://zdorovarodynaplus.com.ua/services" },
        { "@type": "ListItem", position: 2, name: "Холтер", item: holterUrl },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${holterUrl}#faq`,
      inLanguage: "uk-UA",
      mainEntity: holterFaq.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};
