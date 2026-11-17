export const weekDays = [
  { key: "mon", short: "Пн", label: "Понеділок" },
  { key: "tue", short: "Вт", label: "Вівторок" },
  { key: "wed", short: "Ср", label: "Середа" },
  { key: "thu", short: "Чт", label: "Четвер" },
  { key: "fri", short: "Пт", label: "П’ятниця" },
  { key: "sat", short: "Сб", label: "Субота" },
  { key: "sun", short: "Нд", label: "Неділя" },
] as const;

export type DayKey = (typeof weekDays)[number]["key"];
export type DoctorSchedule = Partial<Record<DayKey, string>>;
export type DoctorPatientGroup = "adults" | "children";

export const doctorPatientGroupOptions: Array<{
  value: DoctorPatientGroup;
  label: string;
}> = [
  { value: "adults", label: "Дорослі" },
  { value: "children", label: "Діти" },
];

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number | null;
  experienceLabel?: string;
  consultationPrice: number | null;
  repeatConsultationPrice?: number | null;
  showConsultationPriceOnRequest?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  branch: string;
  description: string;
  biography: string;
  patientGroups: DoctorPatientGroup[];
  schedule: DoctorSchedule;
  photoUrl: string;
};

type MriReportingPartner = {
  id: string;
  sourceUrl: string;
  experienceLabel?: string;
  organization?: string;
  instagramUrl?: string;
};

export const mriReportingPartners: readonly MriReportingPartner[] = [
  { id: "chumak-anatolii", organization: "LifeScan", sourceUrl: "https://lifescan.ua/chumak-anatolij-anatolijovich/", experienceLabel: "У рентгенології з 2007 року", instagramUrl: "https://www.instagram.com/_rad_bros_/" },
  { id: "pyzhuk-mariia", organization: "LifeScan", sourceUrl: "https://lifescan.ua/pizhuk-marija-oleksandrivna/", experienceLabel: "Медична практика з 2021 року" },
  { id: "pavliuk-romanna", organization: "LifeScan", sourceUrl: "https://lifescan.ua/pavljuk-romanna/", experienceLabel: "У рентгенології з 2022 року" },
  { id: "radchenko-kateryna", organization: "LifeScan", sourceUrl: "https://lifescan.ua/radchenko-katerina-andriivna/", experienceLabel: "Медична практика з 2006 року" },
  { id: "deresh-nataliia", organization: "LifeScan", sourceUrl: "https://lifescan.ua/deresh-natalja-volodimirivna/", experienceLabel: "Медична практика з 2003 року" },
  { id: "ahii-vladyslava", sourceUrl: "https://diamed.uz.ua/doctors/agij-vladyslava-ivanivna/", experienceLabel: "Медична практика з 2008 року" },
];

export function getMriReportingPartner(doctor: { id?: string }) {
  return mriReportingPartners.find((partner) => partner.id === doctor.id);
}

export function getDoctorExperienceLabel(doctor: Pick<Doctor, "id" | "experienceLabel" | "experienceYears">, fallback = "Уточнюйте") {
  return doctor.experienceLabel ?? getMriReportingPartner(doctor)?.experienceLabel ?? (doctor.experienceYears
    ? `${doctor.experienceYears} років`
    : fallback);
}

// Organisational positions are separate from medical specialties and filters.
export function getDoctorPosition(doctor: Pick<Doctor, "id">): string | null {
  if (doctor.id === "deresh-nataliia") return "Завідувачка діагностичного центру LifeScan";
  const reportingPartner = getMriReportingPartner(doctor);
  if (reportingPartner) return reportingPartner.organization ? `${reportingPartner.organization} · опис МРТ` : "Опис МРТ";
  return doctor.id === "rohalskyi-vitalii"
    ? "Завідувач відділення рентгенології"
    : null;
}

export function getDoctorReportingModalities(doctor: Pick<Doctor, "id">): string | null {
  if (doctor.id === "rohalskyi-vitalii") return "КТ та МРТ";
  return ["pysarchuk-taras", "zhyber-kostiantyn", "verchenko-dmytro", "novak-bohdana"].includes(doctor.id)
    ? "КТ"
    : null;
}

export const DEFAULT_DOCTOR_SORT_ORDER = 1000;
export const defaultFeaturedDoctorIds = [
  "pochtar-kateryna", "voloshko-tetiana", "iziumska-olena", "ishchuk-nadiia",
] as const;

export function getDefaultDoctorSortOrder(id: string) {
  const rank = defaultFeaturedDoctorIds.findIndex((featuredId) => featuredId === id);
  return rank < 0 ? DEFAULT_DOCTOR_SORT_ORDER : rank;
}

export function getDoctorSortOrder(doctor: Pick<Doctor, "id" | "sortOrder">): number {
  return doctor.sortOrder ?? getDefaultDoctorSortOrder(doctor.id);
}

export function compareDoctors(first: Doctor, second: Doctor): number {
  return getDoctorSortOrder(first) - getDoctorSortOrder(second) ||
    first.name.localeCompare(second.name, "uk-UA", { sensitivity: "base" }) ||
    first.id.localeCompare(second.id);
}

export function getPublicDoctors(doctors: readonly Doctor[]): Doctor[] {
  return doctors.filter((doctor) => doctor.isActive !== false).sort(compareDoctors);
}

export const doctorPhotoUrls: Record<string, string> = {
  "chumak-anatolii": "/doctors/chumak-anatolii.webp",
  "pyzhuk-mariia": "/doctors/pyzhuk-mariia.webp",
  "pavliuk-romanna": "/doctors/pavliuk-romanna.webp",
  "radchenko-kateryna": "/doctors/radchenko-kateryna.webp",
  "deresh-nataliia": "/doctors/deresh-nataliia.webp",
  "ahii-vladyslava": "/doctors/ahii-vladyslava-selected.webp",
  "voloshko-tetiana": "/doctors/voloshko-tetiana.webp",
  "yatseniuk-zinoviia": "/doctors/yatseniuk-zinoviia.webp",
  "danylkiv-yurii": "/doctors/danylkiv-yurii.webp",
  "romanenko-liliia": "/doctors/romanenko-liliia.webp",
  "koziar-nila": "/doctors/koziar-nila.webp",
  "afonin-dmytro": "/doctors/afonin-dmytro.webp",
  "korolkova-olena": "/doctors/korolkova-olena.webp",
  "romanchuk-andrii": "/doctors/romanchuk-andrii.webp",
  "ponomarova-olena": "/doctors/ponomarova-olena.webp",
  "pysarchuk-taras": "/doctors/pysarchuk-taras.webp",
  "rudenko-iryna": "/doctors/rudenko-iryna.webp",
  // Temporary fictional portraits; replace through the admin panel.
  "kyselchuk-tetiana": "/doctors/kyselchuk-tetiana.webp",
  "bereska-oksana": "/doctors/bereska-oksana.webp",
  "kondratyshyna-oksana": "/doctors/kondratyshyna-oksana.webp",
  "rohalskyi-vitalii": "/doctors/rohalskyi-vitalii.webp",
  "dombrovska-halyna": "/doctors/dombrovska-halyna.webp",
  "nalbandian-taron": "/doctors/nalbandian-taron.webp",
  "iziumska-olena": "/doctors/iziumska-olena.webp",
  "stoliarska-nataliia": "/doctors/stoliarska-nataliia.webp",
  "zhyber-kostiantyn": "/doctors/zhyber-kostiantyn.webp",
  "verchenko-dmytro": "/doctors/verchenko-dmytro.webp",
  "meretskyi-viktor": "/doctors/meretskyi-viktor.webp",
  bevztetiana: "/doctors/bevztetiana.webp",
  "martyniuk-halyna": "/doctors/martyniuk-halyna.webp",
  "ishchuk-nadiia": "/doctors/ishchuk-nadiia.webp",
  "krokhmal-oksana": "/doctors/krokhmal-oksana.webp",
  "havrysh-olena": "/doctors/havrysh-olena.webp",
  "pshenychna-valentyna": "/doctors/pshenychna-valentyna.webp",
  "korniiets-nellia": "/doctors/korniiets-nellia.webp",
  "luniakin-vitalii": "/doctors/luniakin-vitalii.webp",
  "vankevych-iryna": "/doctors/vankevych-iryna.webp",
  "novak-bohdana": "/doctors/novak-bohdana.webp",
  "skakalska-tetiana": "/doctors/skakalska-tetiana.webp",
  "pochtar-kateryna": "/doctors/pochtar-kateryna.webp",
  "antonenko-oleksandra": "/doctors/antonenko-oleksandra.webp",
  "videlska-tetiana": "/doctors/videlska-tetiana.webp",
  "talalaieva-daria": "/doctors/talalaieva-daria.webp",
};

const doctor = (
  id: string,
  name: string,
  specialty: string,
  description = "",
): Doctor => ({
  id,
  name,
  specialty,
  experienceYears: null,
  consultationPrice: null,
  isActive: true,
  sortOrder: getDefaultDoctorSortOrder(id),
  branch: "",
  description,
  biography: "",
  patientGroups: [],
  schedule: {},
  photoUrl: doctorPhotoUrls[id] ?? "",
});

export const defaultDoctors: Doctor[] = [
  {
    ...doctor("voloshko-tetiana", "Волошко Тетяна Іванівна", "Сімейний лікар, терапевт"),
    // Sources checked 2026-09-07; identity confirmed by the site owner.
    // https://zdorovarodynaplus.com.ua/doctors/voloshko-tetyana-ivanivna-2
    // https://www.rokl.rv.ua/nashi-pidrozdily/viddilennia-ekstrenoi-medychnoi-dopomohy
    biography: "Тетяна Іванівна Волошко — сімейна лікарка та терапевтка медичного центру «Здорова Родина» у Рівному. Консультує пацієнтів у відділенні на вулиці Володимира Стельмаха, 18-М.\nОчолює відділення екстреної медичної допомоги Рівненської обласної клінічної лікарні імені Юрія Семенюка. Лікарка з медицини невідкладних станів вищої кваліфікаційної категорії.\nДо напрямів її роботи належать допомога при застудних захворюваннях і гарячці, скаргах із боку травної та серцево-судинної систем. У профілі лікарки також зазначені артеріальна гіпертензія, порушення серцевого ритму та артрит.",
    // Local layout sample only; do not publish these trial details as real data.
    ...(process.env.NODE_ENV === "development" ? {
      experienceYears: 25,
      experienceLabel: "Понад 25 років",
      consultationPrice: 700,
      repeatConsultationPrice: 500,
      branch: "вул. Володимира Стельмаха, 18-М",
      patientGroups: ["adults", "children"] as DoctorPatientGroup[],
      schedule: {
        mon: "Приймає · час уточнюйте", tue: "Приймає · час уточнюйте",
        wed: "Приймає · час уточнюйте", thu: "Приймає · час уточнюйте",
        fri: "Приймає · час уточнюйте",
      },
    } : {}),
  },
  doctor("yatseniuk-zinoviia", "Яценюк Зіновія Михайлівна", "Ендокринолог"),
  doctor("danylkiv-yurii", "Данилків Юрій Степанович", "Уролог"),
  doctor("romanenko-liliia", "Романенко Лілія Георгіївна", "Гінеколог"),
  doctor("koziar-nila", "Козяр Ніла Андріївна", "Гінеколог"),
  doctor("afonin-dmytro", "Афонін Дмитро Миколайович", "Лікар УЗД, хірург, к.мед.н., доцент"),
  doctor("korolkova-olena", "Королькова Олена Віталіївна", "Лікар УЗД"),
  doctor("romanchuk-andrii", "Романчук Андрій Володимирович", "Флеболог"),
  doctor("ponomarova-olena", "Пономарьова Олена Іванівна", "Ревматолог"),
  doctor("pysarchuk-taras", "Писарчук Тарас Валерійович", "Рентгенолог"),
  doctor("rudenko-iryna", "Руденко Ірина Василівна", "Дитячий алерголог"),
  doctor("kyselchuk-tetiana", "Кисельчук Тетяна Василівна", "Кардіолог"),
  doctor("bereska-oksana", "Береська Оксана Ростиславівна", "Мамолог"),
  doctor("kondratyshyna-oksana", "Кондратишина Оксана Ярославівна", "Кардіолог"),
  doctor("rohalskyi-vitalii", "Рогальський Віталій Олександрович", "Рентгенолог"),
  doctor("dombrovska-halyna", "Домбровська Галина Савівна", "Невропатолог"),
  doctor("nalbandian-taron", "Налбандян Тарон Альбертович", "Уролог-онколог"),
  doctor("iziumska-olena", "Ізюмська Олена Вікторівна", "Сімейний лікар, терапевт, невролог"),
  doctor("stoliarska-nataliia", "Столярська Наталія Анатоліївна", "Кардіолог, лікар УЗД серця"),
  doctor("zhyber-kostiantyn", "Жибер Костянтин Олександрович", "Рентгенолог"),
  doctor("verchenko-dmytro", "Верченко Дмитро Ігорович", "Рентгенолог"),
  doctor("meretskyi-viktor", "Мерецький Віктор Миколайович", "Ортопед-травматолог, д.м.н., професор"),
  doctor("bevztetiana", "Бевз Тетяна Ігорівна", "Гастроентеролог"),
  doctor("martyniuk-halyna", "Мартинюк Галина Андріївна", "Гастроентеролог, інфекціоніст, гепатолог"),
  doctor("ishchuk-nadiia", "Іщук Надія Степанівна", "Педіатр, сімейний лікар"),
  {
    ...doctor("doctor-4cd65e03-d5d5-4cdc-b2ab-98668b2b7098", "Мельник Віра Олегівна", "Сімейний лікар, Педіатр, терапевт"),
    // Published profile verified 2026-10-21; also used by the local screening preview.
    consultationPrice: 700,
    repeatConsultationPrice: 500,
    branch: "м. Рівне, вул. Володимира Стельмаха, 18-М",
    patientGroups: ["adults", "children"],
    schedule: { sat: "9.00-15.00" },
  },
  doctor("krokhmal-oksana", "Крохмаль Оксана Петрівна", "Дитячий ендокринолог"),
  doctor("havrysh-olena", "Гавриш Олена Валеріївна", "Дитячий отоларинголог"),
  doctor("pshenychna-valentyna", "Пшенична Валентина Антонівна", "Лікар УЗД серця"),
  doctor("korniiets-nellia", "Корнієць Нелля Григорівна", "Гінеколог-ендокринолог"),
  doctor("luniakin-vitalii", "Лунякін Віталій Олександрович", "Отоларинголог, дитячий і дорослий"),
  doctor("vankevych-iryna", "Ванкевич Ірина Степанівна", "Дерматолог, дитячий і дорослий"),
  doctor("novak-bohdana", "Новак Богдана Ігорівна", "Рентгенолог"),
  doctor("skakalska-tetiana", "Скакальська Тетяна Георгіївна", "Кардіолог"),
  doctor("pochtar-kateryna", "Почтар Катерина Дмитрівна", "Сімейний лікар, терапевт"),
  doctor("antonenko-oleksandra", "Антоненко Олександра Равилівна", "Гастроентеролог"),
  doctor("videlska-tetiana", "Відельська Тетяна Юріївна", "Дитячий гастроентеролог"),
  doctor("talalaieva-daria", "Талалаєва Дар’я Володимирівна", "Акушер-гінеколог"),
  // Official profiles checked 2026-11-17; MRI reporting team confirmed by the owner.
  // Existing production databases are managed separately; defaults never restore hidden records.
  {
    ...doctor("chumak-anatolii", "Чумак Анатолій Анатолійович", "Рентгенолог"),
    description: "Лікар-рентгенолог LifeScan. Виконує опис МРТ-досліджень для медичного центру «Здорова Родина».",
    biography: [
      "## Напрями роботи",
      "Лікар-рентгенолог вищої категорії. У медицині та рентгенології — **з 2007 року**.",
      "- Нейрорадіологія; КТ і МРТ голови, м’яких тканин шиї та ЛОР-органів.",
      "- КТ і МРТ живота й таза; візуалізація новоутворень і запальних змін.",
      "## Освіта",
      "- **2001–2007** — Буковинський державний медичний університет, «Лікувальна справа».",
      "- **2007–2009** — інтернатура з радіологічної діагностики в НМАПО імені П. Л. Шупика.",
      "- **2010** — спеціалізація з рентгенології.",
      "## Підвищення кваліфікації",
      "- **2011** — КТ та МРТ, академія імені П. Л. Шупика.",
      "- **2016** — променева діагностика захворювань молочної залози, академія імені П. Л. Шупика.",
      "- **2020** — КТ і МРТ грудної порожнини, академія імені П. Л. Шупика.",
      "- **Травень 2025** — оновлення критеріїв діагностики розсіяного склерозу.",
      "- **Вересень 2025** — сучасна візуалізація передміхурової залози, майстер-клас ESOR та Асоціації радіологів України.",
      "- **2026** — участь у конгресі ECR.",
      "## Викладання та професійні спільноти",
      "- Викладає на кафедрі радіології НУОЗ України імені П. Л. Шупика.",
      "- Бере участь в освітньому Instagram-проєкті **_rad_bros_**.",
      "- Член Європейського товариства радіології (ESR) та Асоціації радіологів України.",
    ].join("\n"),
  },
  {
    ...doctor("pyzhuk-mariia", "Пижук Марія Олександрівна", "Рентгенолог"),
    description: "Лікарка-рентгенологиня LifeScan. Виконує опис МРТ-досліджень для медичного центру «Здорова Родина».",
    biography: [
      "## Напрями роботи",
      "У медицині — **з 2021 року**.",
      "- Онкорадіологія; КТ і МРТ живота й малого таза.",
      "- Оцінювання відповіді пухлин на лікування; візуалізація захворювань кишківника.",
      "## Освіта",
      "- **2021** — НМУ імені О. О. Богомольця.",
      "- **2023** — інтернатура з радіології та спеціалізація з рентгенології в НУОЗ України імені П. Л. Шупика.",
      "## Підвищення кваліфікації",
      "- **2023, Німеччина** — навчання ESOI/EORTC з оцінювання результатів протипухлинної терапії, RECIST Qualification.",
      "- **2024–2026** — конгреси ECR у Відні; **2024** — ESOI Touchdown у Валенсії.",
      "- Українські радіологічні конгреси та курси ESOR. Додаткове навчання з діагностики печінки й жовчних протоків, дитячої радіології та КТ-ангіографії.",
      "## Наукова та викладацька робота",
      "- **2025–2026** — доповіді про МР-ентерографію, запальні захворювання кишківника, дивертикулярну хворобу та її ускладнення.",
      "- **Липень 2026** — онлайн-курс LifeScan Education про застосування МР-ентерографії.",
      "- **ECR 2025** — співавторка постера про допомогу при вибухових травмах нижньої щелепи, опублікованого в EPOS; досвід усної постерної доповіді.",
      "## Професійні спільноти",
      "ESR, ESOI та Асоціація радіологів України.",
    ].join("\n"),
  },
  {
    ...doctor("pavliuk-romanna", "Павлюк Романна Святославівна", "Рентгенолог"),
    description: "Лікарка-рентгенологиня LifeScan. Виконує опис МРТ-досліджень для медичного центру «Здорова Родина».",
    biography: [
      "## Напрями роботи",
      "У медицині — **з 2020 року**, у рентгенології — **з 2022 року**.",
      "- КТ грудної клітки, живота й таза.",
      "- МРТ живота й малого таза; професійний інтерес — онкологічна візуалізація.",
      "## Освіта",
      "- **2020** — Тернопільський національний медичний університет імені І. Я. Горбачевського.",
      "- **2022** — інтернатура з рентгенології: Київський медичний університет та лікарня LISOD.",
      "- **2022** — спеціалізація з рентгенології у Львівському національному медичному університеті імені Данила Галицького.",
      "- **2024–2026** — магістерська програма з менеджменту в охороні здоров’я Києво-Могилянської академії.",
      "## Стажування та навчання",
      "- **2018** — Bahçeşehir, Стамбул; **2019** — університетська клінічна лікарня, Вроцлав.",
      "- **2024** — МРТ передміхурової залози, ESUR, Нідерланди; ESOI Touchdown, Валенсія.",
      "- **2025** — візуалізація печінки, ESGAR, Мальта; діагностика простати, ESOR.",
      "- **2023–2025** — участь у ECR, українських онкологічних і радіологічних заходах.",
      "## Наукова робота",
      "Співавторка публікацій **2024–2025 років** за темами:",
      "- Хірургія метастазів колоректального раку в печінці та оцінювання пухлинного навантаження.",
      "- КТ-характеристики підшлункової залози й прогнозування післяопераційної панкреатичної нориці.",
      "## Професійні спільноти",
      "ARU, ESR, ESOI, ESUR та ESGAR.",
    ].join("\n"),
  },
  {
    ...doctor("radchenko-kateryna", "Радченко Катерина Андріївна", "Рентгенолог"),
    description: "Лікарка-рентгенологиня LifeScan. Виконує опис МРТ-досліджень для медичного центру «Здорова Родина».",
    biography: [
      "## Напрями роботи",
      "Лікарка-рентгенологиня вищої категорії. Медична практика — **з 2006 року**.",
      "- МРТ в ортопедії та травматології.",
      "- Професійний фокус — травми й захворювання гомілковостопного суглоба та стопи.",
      "- Працює також із мультиспіральною КТ, рентгенографією та денситометрією.",
      "## Підвищення кваліфікації",
      "Проходила профільні курси в Україні та за кордоном, зокрема в Польщі. Бере участь у конференціях із променевої діагностики та суміжних медичних спеціальностей.",
      "## Наукова робота",
      "- Досліджує діагностику пошкоджень і захворювань гомілковостопного суглоба та стопи.",
      "- Авторка **12 наукових статей**; виступає з доповідями на конференціях і з’їздах.",
    ].join("\n"),
  },
  {
    ...doctor("deresh-nataliia", "Дереш Наталя Володимирівна", "Рентгенолог"),
    description: "Лікарка-рентгенологиня LifeScan, кандидат медичних наук. Виконує опис МРТ-досліджень для медичного центру «Здорова Родина».",
    biography: [
      "## Кваліфікація",
      "Лікарка-рентгенологиня, **кандидат медичних наук**. Медична практика — **з 2003 року**. Очолює діагностичний центр LifeScan.",
      "## Освіта",
      "- **1996–2003** — Тернопільська державна медична академія імені І. Я. Горбачевського, «Лікувальна справа».",
      "- **2003–2004** — інтернатура з радіологічної діагностики у Львівському національному медичному університеті імені Данила Галицького.",
      "- **2006, 2014** — спеціалізації з рентгенології в Харкові та Львові.",
      "- **2017** — навчання з КТ і МРТ в академії імені П. Л. Шупика.",
      "- **2021** — науковий ступінь із променевої діагностики та променевої терапії, НУОЗ України імені П. Л. Шупика.",
      "## Стажування та навчання",
      "- **2019, Відень** — діагностика захворювань печінки та жовчних шляхів.",
      "- **2021, Осло; 2025, Мальта** — практичні курси ESGAR із візуалізації печінки.",
      "- **2024–2025, Австрія** — HRCT TTT ILD, діагностика інтерстиціальних захворювань легень.",
      "## Викладання та наукова робота",
      "- Запрошена лекторка кафедри радіології НУОЗ України імені П. Л. Шупика та Європейської школи онкології.",
      "- Учасниця розроблення стандарту допомоги при раку підшлункової залози МОЗ України (**2025**).",
      "- Доповідачка ECR EPOS, Baltic Congress of Radiology, LiverOnco та OncoHub.",
      "## Професійні спільноти",
      "Віцепрезидентка Всеукраїнської асоціації рентгенологів; членкиня виконкому АРУ, комітету членства ESOI, товариств ESR та ESGAR.",
    ].join("\n"),
  },
  {
    ...doctor("ahii-vladyslava", "Агій Владислава Іванівна", "Рентгенолог"),
    experienceYears: 18,
    experienceLabel: "Медична практика з 2008 року",
    description: "Лікарка-рентгенологиня, кандидат медичних наук. Виконує опис МРТ-досліджень для медичного центру «Здорова Родина».",
    biography: [
      "## Напрями роботи",
      "Лікарка-рентгенологиня, **кандидат медичних наук**. Професійний напрям — нейрорадіологія.",
      "- Аналіз МРТ головного мозку, МР-перфузії та МР-спектроскопії.",
      "- Нейрорадіологічна діагностика у складі команди центру хірургії епілепсії.",
      "## Професійний досвід",
      "**18 років** досвіду роботи лікаркою-рентгенологинею, зокрема **10 років — на МРТ**.",
      "- Очолює відділення МРТ медичного центру «Діамед» в Ужгороді.",
      "- Працює на кафедрі онкології та радіології Ужгородського національного університету.",
      "## Наукова робота",
      "- **2016** — захист кандидатської дисертації з променевої діагностики та променевої терапії. Тема дослідження — поєднання рентгенологічних та ультразвукових методів у діагностиці травм надп’ятково-гомілкового суглоба в дітей.",
      "- **2026** — участь в українсько-австрійському дослідницькому проєкті УжНУ із застосування штучного інтелекту для візуалізації онкологічних захворювань у жінок.",
      "## Викладання",
      "Лекторка фахових радіологічних заходів. Зокрема, виступала на конференції з променевої діагностики захворювань суглобів у Яремче **8–9 листопада 2024 року**.",
    ].join("\n"),
  },
];

export function getDoctorInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatDoctorConsultationPrice(price: number | null) {
  if (price === null) return "Уточнюйте";
  return `${new Intl.NumberFormat("uk-UA").format(price)} ₴`;
}

export function getDoctorScheduleDays(schedule: DoctorSchedule) {
  return weekDays.filter((day) => schedule[day.key]?.trim());
}

export function getDoctorScheduleNotice(doctor: Pick<Doctor, "specialty"> & { id?: string }) {
  if (getMriReportingPartner(doctor)) return "Опис МРТ-досліджень для медичного центру «Здорова Родина».";
  return canBookDoctorConsultation(doctor)
    ? "Графік прийому уточнюйте в адміністратора."
    : "Графік роботи уточнюйте в адміністратора.";
}

export function getScheduleSummary(schedule: DoctorSchedule) {
  const activeDays = getDoctorScheduleDays(schedule);
  if (!activeDays.length) return "Графік уточнюйте в адміністратора.";

  if (activeDays.length === 1) {
    const day = activeDays[0];
    return `${day.short} · ${schedule[day.key]}`;
  }

  return `${activeDays[0].short}–${activeDays.at(-1)?.short} · за графіком`;
}

export function getDoctorPatientGroups(groups: DoctorPatientGroup[]) {
  if (!groups.length) return "Дорослі чи діти — уточнюйте";

  return groups
    .map(
      (group) =>
        doctorPatientGroupOptions.find((option) => option.value === group)
          ?.label,
    )
    .filter(Boolean)
    .join(" · ");
}

export function canBookDoctorConsultation(doctor: Pick<Doctor, 'specialty'>): boolean {
  return !/рентгенолог|radiolog/iu.test(doctor.specialty);
}

type DoctorConsultationPricing = Pick<Doctor, "consultationPrice" | "repeatConsultationPrice" | "showConsultationPriceOnRequest">;

export function getDoctorConsultationPrices(doctor: DoctorConsultationPricing) {
  const prices: { label: string; value: string }[] = [];
  if (doctor.consultationPrice != null || doctor.showConsultationPriceOnRequest === true) {
    prices.push({
      label: doctor.repeatConsultationPrice != null ? "Первинна" : "Консультація",
      value: formatDoctorConsultationPrice(doctor.consultationPrice ?? null),
    });
  }
  if (doctor.repeatConsultationPrice != null) {
    prices.push({ label: "Повторна", value: formatDoctorConsultationPrice(doctor.repeatConsultationPrice) });
  }
  return prices;
}

export function formatDoctorConsultations(doctor: DoctorConsultationPricing) {
  const prices = getDoctorConsultationPrices(doctor);
  if (!prices.length) return null;
  return prices.map(({ label, value }) => label === "Консультація" ? value : `${label} — ${value}`).join(" · ");
}
