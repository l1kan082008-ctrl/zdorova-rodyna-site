export const branchServiceCatalog = [
  { id: "laboratory", label: "Аналізи" },
  { id: "ct", label: "КТ" },
  { id: "mri", label: "МРТ" },
  { id: "ultrasound", label: "УЗД" },
  { id: "doctors", label: "Лікарі" },
] as const;

export type BranchServiceId = (typeof branchServiceCatalog)[number]["id"];

export type CenterLocation = {
  id: string;
  city: string;
  name: string;
  type: string;
  address: string;
  fullAddress: string;
  landmark?: string;
  description: string;
  hours: string[];
  phone: string;
  services: BranchServiceId[];
  coordinates: {
    lat: number;
    lng: number;
  };
  gallery: {
    src: string;
    alt: string;
    caption: string;
  }[];
  videoUrl?: string;
};

export const centerLocations: CenterLocation[] = [
  {
    id: "stelmakha-18m",
    city: "Рівне",
    name: "Стельмаха, 18-М",
    type: "Головний медичний центр",
    address: "вул. Володимира Стельмаха, 18-М",
    fullAddress:
      "м. Рівне, вул. Володимира Стельмаха (Курчатова), 18-М",
    description:
      "Консультації лікарів, лабораторна діагностика, УЗД, КТ та МРТ в одному відділенні.",
    hours: [
      "Пн–Пт · 08:00–19:00",
      "Сб · 08:00–15:00",
      "Нд · вихідний",
    ],
    phone: "+380676714444",
    services: ["ct", "mri", "laboratory", "doctors", "ultrasound"],
    coordinates: { lat: 50.6031702, lng: 26.2797542 },
    gallery: [
      {
        src: "/locations/stelmakha-18m.webp",
        alt: "Фасад медичного центру «Здорова Родина» на вулиці Стельмаха",
        caption: "Головний вхід з вул. Володимира Стельмаха",
      },
    ],
  },
  {
    id: "chornovola-79",
    city: "Рівне",
    name: "Чорновола, 79",
    type: "Пункт забору аналізів",
    address: "вул. Чорновола, 79",
    fullAddress: "м. Рівне, вул. Чорновола, 79",
    landmark: "Чорнобильська лікарня",
    description:
      "Зручний пункт для здачі лабораторних досліджень у приміщенні Чорнобильської лікарні.",
    hours: [
      "Пн–Пт · 08:00–14:00",
      "Сб–Нд · вихідні",
    ],
    phone: "+380676714444",
    services: ["laboratory"],
    coordinates: { lat: 50.6033456, lng: 26.2600134 },
    gallery: [
      {
        src: "/locations/chornovola-79.jpg",
        alt: "Пункт медичного центру «Здорова Родина» на вулиці Чорновола",
        caption: "Вхід до пункту на вул. Чорновола, 79",
      },
    ],
  },
  {
    id: "kulyka-hudacheka-3",
    city: "Рівне",
    name: "Кулика і Гудачека, 3",
    type: "Пункт забору аналізів",
    address: "вул. Кулика і Гудачека, 3",
    fullAddress: "м. Рівне, вул. Кулика і Гудачека, 3, каб. 219",
    landmark: "кабінет 219",
    description:
      "Пункт лабораторної діагностики у зручній локації мікрорайону Ювілейний.",
    hours: [
      "Пн–Пт · 08:00–14:00",
      "Сб–Нд · вихідні",
    ],
    phone: "+380676714444",
    services: ["laboratory"],
    coordinates: { lat: 50.6349071, lng: 26.1985517 },
    gallery: [
      {
        src: "/locations/kulyka-hudacheka-3.jpg",
        alt: "Пункт медичного центру «Здорова Родина» на вулиці Кулика і Гудачека",
        caption: "Орієнтир для входу до пункту, кабінет 219",
      },
    ],
  },
  {
    id: "olesia-13",
    city: "Рівне",
    name: "Олександра Олеся, 13",
    type: "Медичне відділення",
    address: "вул. Олександра Олеся, 13",
    fullAddress: "м. Рівне, вул. Олександра Олеся, 13",
    description:
      "Відділення для лабораторних досліджень та медичних послуг із розширеним графіком у будні.",
    hours: [
      "Пн–Пт · 08:00–18:00",
      "Сб–Нд · вихідні",
    ],
    phone: "+380932332043",
    services: ["laboratory", "ct"],
    coordinates: { lat: 50.6105105, lng: 26.2209196 },
    gallery: [
      {
        src: "/locations/olesia-13.jpg",
        alt: "Відділення медичного центру «Здорова Родина» на вулиці Олександра Олеся",
        caption: "Вхід до відділення на вул. Олександра Олеся, 13",
      },
    ],
  },
  {
    id: "brody-zaliznychna-37b",
    city: "Броди",
    name: "Залізнична, 37-Б",
    type: "Пункт забору аналізів",
    address: "вул. Залізнична, 37-Б",
    fullAddress: "м. Броди, вул. Залізнична, 37-Б",
    description:
      "Пункт лабораторної діагностики «Здорова Родина» у Бродах.",
    hours: ["Графік роботи уточнюйте"],
    phone: "+380970993130",
    services: ["laboratory"],
    coordinates: { lat: 50.0927788, lng: 25.1347706 },
    gallery: [
      {
        src: "/locations/brody-zaliznychna-37b.jpg",
        alt: "Пункт медичного центру «Здорова Родина» у Бродах",
        caption: "Пункт на вул. Залізничній, 37-Б у Бродах",
      },
    ],
  },
  {
    id: "zviahel-shevchenka-41-1",
    city: "Звягель",
    name: "Шевченка, 41/1",
    type: "Пункт забору аналізів",
    address: "вул. Тараса Шевченка, 41/1",
    fullAddress: "м. Звягель, вул. Тараса Шевченка, 41/1",
    description:
      "Пункт лабораторної діагностики «Здорова Родина» у Звягелі.",
    hours: ["Графік роботи уточнюйте"],
    phone: "+380970383113",
    services: ["laboratory"],
    coordinates: { lat: 50.5897806, lng: 27.615086 },
    gallery: [
      {
        src: "/locations/zviahel-shevchenka-41-1.jpg",
        alt: "Пункт медичного центру «Здорова Родина» у Звягелі",
        caption: "Пункт на вул. Тараса Шевченка, 41/1 у Звягелі",
      },
    ],
  },
  {
    id: "kostopil-hrushevskoho-4",
    city: "Костопіль",
    name: "Грушевського, 4",
    type: "Пункт забору аналізів",
    address: "вул. Грушевського, 4",
    fullAddress: "м. Костопіль, вул. Грушевського, 4",
    description:
      "Пункт лабораторної діагностики «Здорова Родина» у Костополі.",
    hours: ["Графік роботи уточнюйте"],
    phone: "+380982002300",
    services: ["laboratory", "ct"],
    coordinates: { lat: 50.8817744, lng: 26.451782 },
    gallery: [
      {
        src: "/locations/kostopil-hrushevskoho-4.jpg",
        alt: "Пункт медичного центру «Здорова Родина» у Костополі",
        caption: "Пункт на вул. Грушевського, 4 у Костополі",
      },
    ],
  },
];

export function getMapEmbedUrl(location: CenterLocation) {
  const { lat, lng } = location.coordinates;
  const longitudePadding = 0.008;
  const latitudePadding = 0.0048;
  const bbox = [
    lng - longitudePadding,
    lat - latitudePadding,
    lng + longitudePadding,
    lat + latitudePadding,
  ].join(",");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox,
  )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function getDirectionsUrl(location: CenterLocation) {
  const { lat, lng } = location.coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
