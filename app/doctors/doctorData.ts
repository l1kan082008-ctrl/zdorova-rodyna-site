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

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number | null;
  branch: string;
  description: string;
  schedule: DoctorSchedule;
  photoUrl: string;
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
  schedule: {},
  photoUrl: "",
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
