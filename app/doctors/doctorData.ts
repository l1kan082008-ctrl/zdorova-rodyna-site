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
export type DoctorAvailabilityStatus =
  | "accepting"
  | "by-confirmation"
  | "paused";
export type DoctorPatientGroup = "adults" | "children";

export const doctorAvailabilityOptions: Array<{
  value: DoctorAvailabilityStatus;
  label: string;
  description: string;
}> = [
  {
    value: "accepting",
    label: "Приймає пацієнтів",
    description: "Пацієнт може одразу перейти до запису.",
  },
  {
    value: "by-confirmation",
    label: "Прийом за уточненням",
    description: "Пацієнту запропонуємо уточнити можливість прийому.",
  },
  {
    value: "paused",
    label: "Тимчасово не приймає",
    description:
      "Пацієнт зможе уточнити можливість прийому в адміністратора.",
  },
];

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
  branch: string;
  description: string;
  biography: string;
  patientGroups: DoctorPatientGroup[];
  schedule: DoctorSchedule;
  photoUrl: string;
  availabilityStatus: DoctorAvailabilityStatus;
};

export const doctorPhotoUrls: Record<string, string> = {
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
  branch: "",
  description,
  biography: "",
  patientGroups: [],
  schedule: {},
  photoUrl: doctorPhotoUrls[id] ?? "",
  availabilityStatus: "accepting",
});

export const defaultDoctors: Doctor[] = [
  doctor("voloshko-tetiana", "Волошко Тетяна Іванівна", "Сімейний лікар, терапевт"),
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
  doctor("meretskyi-viktor", "Мерецький Віктор Миколайович", "Ортопед-травматолог, д.м.н., професор"),
  doctor("bevztetiana", "Бевз Тетяна Ігорівна", "Гастроентеролог"),
  doctor("martyniuk-halyna", "Мартинюк Галина Андріївна", "Гастроентеролог, інфекціоніст, гепатолог"),
  doctor("ishchuk-nadiia", "Іщук Надія Степанівна", "Педіатр, сімейний лікар"),
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
];

export function getDoctorInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getScheduleSummary(schedule: DoctorSchedule) {
  const activeDays = weekDays.filter((day) => schedule[day.key]);
  if (!activeDays.length) return "Графік уточнюється";

  if (activeDays.length === 1) {
    const day = activeDays[0];
    return `${day.short} · ${schedule[day.key]}`;
  }

  return `${activeDays[0].short}–${activeDays.at(-1)?.short} · за графіком`;
}

export function getDoctorAvailability(
  status: DoctorAvailabilityStatus | undefined,
) {
  return (
    doctorAvailabilityOptions.find((option) => option.value === status) ??
    doctorAvailabilityOptions[0]
  );
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
