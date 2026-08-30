export const promoThemes = [
  "laboratory",
  "home",
  "heart",
  "mri",
  "doctors",
  "dermoscopy",
  "ct-photo",
] as const;

export type PromoTheme = (typeof promoThemes)[number];

export type PromoSlide = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  note: string;
  accent?: string;
  imageKey?: string;
  action: string;
  href: string;
  theme: PromoTheme;
  active: boolean;
  sortOrder: number;
};

export const defaultPromoSlides: PromoSlide[] = [
  {
    id: "laboratory",
    eyebrow: "Лабораторія",
    title: "Дослідження без зайвих очікувань",
    text: "Оберіть потрібні аналізи, дізнайтеся актуальну вартість і заплануйте візит у зручний час.",
    note: "Результати — дистанційно",
    accent: "Аналізи у режимі ЦИТО · до 2 годин",
    action: "Переглянути ціни",
    href: "/prices",
    theme: "laboratory",
    active: true,
    sortOrder: 0,
  },
  {
    id: "home-nurse",
    eyebrow: "Виїзна послуга",
    title: "Медсестра приїде до вас",
    text: "Забір матеріалу вдома — зручно для дітей, старших людей і тих, кому складно відвідати центр.",
    note: "Узгодимо день і час",
    action: "Замовити виїзд",
    href: "/contacts?service=Аналізи вдома#booking",
    theme: "home",
    active: true,
    sortOrder: 1,
  },
  {
    id: "cardiology",
    eyebrow: "Діагностика серця",
    title: "Серце під надійним контролем",
    text: "ЕКГ, ЕхоКГ та Холтер-моніторинг із консультацією фахівця і зрозумілими рекомендаціями.",
    note: "Комплексний підхід",
    action: "Записатися",
    href: "/contacts?service=Кардіологія#booking",
    theme: "heart",
    active: true,
    sortOrder: 2,
  },
  {
    id: "mri",
    eyebrow: "МРТ нового покоління",
    title: "Точне зображення. Більше впевненості",
    text: "Магнітно-резонансна томографія на Siemens MAGNETOM Flow Plus 1,5 Тесла — апараті 2026 року випуску.",
    note: "Без рентгенівського випромінювання",
    action: "Дізнатися про МРТ",
    href: "/services/mri",
    theme: "mri",
    active: true,
    sortOrder: 3,
  },
  {
    id: "doctors",
    eyebrow: "Команда лікарів",
    title: "Фахівець для кожного у вашій родині",
    text: "Оберіть лікаря за напрямом, перегляньте графік прийому та запишіться на зручний час.",
    note: "Прийом дорослих і дітей",
    action: "Обрати лікаря",
    href: "/doctors",
    theme: "doctors",
    active: true,
    sortOrder: 4,
  },
  {
    id: "dermoscopy",
    eyebrow: "Діагностика шкіри",
    title: "Уважна перевірка родимок",
    text: "Цифрова дерматоскопія допомагає збільшено розглянути структуру шкірного утворення та визначити подальші дії.",
    note: "Неінвазивно та безболісно",
    action: "Про дерматоскопію",
    href: "/services/dermoscopy",
    theme: "dermoscopy",
    active: true,
    sortOrder: 5,
  },
  {
    id: "ct",
    eyebrow: "КТ-діагностика",
    title: "Швидке дослідження з точним результатом",
    text: "Комп’ютерна томографія допомагає детально оцінити органи, судини, кістки та м’які тканини.",
    note: "Philips Brilliance · 64 зрізи",
    action: "Дізнатися про КТ",
    href: "/services/ct",
    theme: "ct-photo",
    active: true,
    sortOrder: 6,
  },
];
