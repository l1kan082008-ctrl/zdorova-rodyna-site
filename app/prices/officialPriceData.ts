import type { CategoryId, PriceItem } from "./priceData";
import {
  DEFAULT_CITO_SURCHARGE,
  usesDefaultCitoPolicy,
} from "./citoPolicy.ts";

export const officialCatalogSource = {
  url: "https://zdorovarodynaplus.com.ua/pricelist",
  fetchedAt: "2026-07-27T17:35:55.4306886Z",
  version: "2026-07-27-full",
  itemCount: 726,
} as const;

export const officialCategoryOptions: ReadonlyArray<{
  id: CategoryId;
  label: string;
}> = [
  {
    "id": "ultrasound",
    "label": "УЗД"
  },
  {
    "id": "heart",
    "label": "Серце"
  },
  {
    "id": "doppler",
    "label": "Доплер судин"
  },
  {
    "id": "ct",
    "label": "КТ"
  },
  {
    "id": "general",
    "label": "Загальноклінічні дослідження"
  },
  {
    "id": "biochemistry",
    "label": "Біохімічні дослідження"
  },
  {
    "id": "diabetes",
    "label": "Панель цукрового діабету"
  },
  {
    "id": "hemostasis",
    "label": "Показники гемостазу"
  },
  {
    "id": "hormones",
    "label": "Гормони"
  },
  {
    "id": "growth",
    "label": "Фактори росту"
  },
  {
    "id": "prenatal",
    "label": "Пренатальна діагностика"
  },
  {
    "id": "oncology",
    "label": "Онкологічні маркери"
  },
  {
    "id": "rheumatology",
    "label": "Кардіо-ревматоїдна панель"
  },
  {
    "id": "anemia",
    "label": "Панель контролю анемії"
  },
  {
    "id": "immunology",
    "label": "Імунологічна панель"
  },
  {
    "id": "osteoporosis",
    "label": "Панель остеопорозу"
  },
  {
    "id": "cytology",
    "label": "Цитологічні та мікроскопічні дослідження"
  },
  {
    "id": "infections",
    "label": "Інфекції"
  },
  {
    "id": "hiv",
    "label": "ВІЛ/СНІД"
  },
  {
    "id": "torch",
    "label": "TORCH-інфекції"
  },
  {
    "id": "urogenital",
    "label": "Урогенітальні інфекції"
  },
  {
    "id": "allergy",
    "label": "Алергологічні дослідження"
  },
  {
    "id": "genetics",
    "label": "Генетичні дослідження"
  },
  {
    "id": "culture",
    "label": "Культуральні дослідження"
  },
  {
    "id": "bacteriology",
    "label": "Бактеріологічні дослідження"
  },
  {
    "id": "complexes",
    "label": "Комплексні дослідження"
  },
  {
    "id": "covid",
    "label": "COVID-19"
  },
  {
    "id": "sampling",
    "label": "Забір матеріалу"
  },
  {
    "id": "medical",
    "label": "Лікарські послуги"
  },
  {
    "id": "other-infections",
    "label": "Інші інфекції"
  },
  {
    "id": "mri",
    "label": "МРТ"
  }
];

const officialPriceItemsBase: PriceItem[] = [
  {
    "id": "official-uzd-001",
    "name": "ОЧП (органи черевної порожнини) комплексно",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [],
    "sortOrder": 0
  },
  {
    "id": "official-uzd-002",
    "name": "УЗД нирки+сечовий міхур (сечовидільна систама)",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [],
    "sortOrder": 1
  },
  {
    "id": "official-uzd-003",
    "name": "УЗД нирок",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [],
    "sortOrder": 2
  },
  {
    "id": "official-uzd-004",
    "name": "УЗД щитоподібної залози",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [],
    "sortOrder": 3
  },
  {
    "id": "official-uzd-005",
    "name": "УЗД м’яких тканин",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [],
    "sortOrder": 4
  },
  {
    "id": "official-uzd-006",
    "name": "УЗД лімфатичних вузлів одна ділянка (шийні, аксілярні, клубові+пахові)",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [],
    "sortOrder": 5
  },
  {
    "id": "official-uzd-007",
    "name": "УЗД фолікулометрія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [],
    "sortOrder": 6
  },
  {
    "id": "official-uzd-008",
    "name": "УЗД органів малого тазу жінок та ранні терміни вагітності (трансвагінально або трансабдомінально)",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [],
    "sortOrder": 7
  },
  {
    "id": "official-uzd-009",
    "name": "Органи калитки чоловіків + еластографія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [],
    "sortOrder": 8
  },
  {
    "id": "official-uzd-010",
    "name": "Обстеження простати чоловіків",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [],
    "sortOrder": 9
  },
  {
    "id": "official-uzd-011",
    "name": "ЕКГ (електрокардіограма)",
    "category": "heart",
    "categoryLabel": "Серце",
    "amount": 280,
    "aliases": [],
    "sortOrder": 1010
  },
  {
    "id": "official-uzd-012",
    "name": "ЕХО (УЗД) серця",
    "category": "heart",
    "categoryLabel": "Серце",
    "amount": 650,
    "aliases": [
      "УЗД серця",
      "ехокардіографія"
    ],
    "sortOrder": 1011
  },
  {
    "id": "official-uzd-013",
    "name": "Доплерографія вен/артерій (1 кінцівка)",
    "category": "doppler",
    "categoryLabel": "Доплер судин",
    "amount": 600,
    "aliases": [],
    "sortOrder": 2012
  },
  {
    "id": "official-uzd-014",
    "name": "Доплерографія вен/артерій (2 кінцівки)",
    "category": "doppler",
    "categoryLabel": "Доплер судин",
    "amount": 800,
    "aliases": [],
    "sortOrder": 2013
  },
  {
    "id": "official-uzd-015",
    "name": "Доплерографія артерій+вен (1 кінцівка)",
    "category": "doppler",
    "categoryLabel": "Доплер судин",
    "amount": 800,
    "aliases": [],
    "sortOrder": 2014
  },
  {
    "id": "official-uzd-016",
    "name": "Доплерографія артерій+вен (2 кінцівки)",
    "category": "doppler",
    "categoryLabel": "Доплер судин",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 2015
  },
  {
    "id": "official-uzd-017",
    "name": "Доплерографія судин шиї (артерії+вени)",
    "category": "doppler",
    "categoryLabel": "Доплер судин",
    "amount": 700,
    "aliases": [],
    "sortOrder": 2016
  },
  {
    "id": "official-uzd-018",
    "name": "УЗД ОЧП з навантаженням + 2 фото",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 700,
    "aliases": [],
    "sortOrder": 17
  },
  {
    "id": "official-uzd-019",
    "name": "Слинні залози",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [],
    "sortOrder": 18
  },
  {
    "id": "official-uzd-020",
    "name": "Плевральна порожнина",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [],
    "sortOrder": 19
  },
  {
    "id": "official-uzd-021",
    "name": "УЗД Сечового міхура",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 350,
    "aliases": [],
    "sortOrder": 20
  },
  {
    "id": "official-uzd-022",
    "name": "УЗД Грудних залоз у чоловіків",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [],
    "sortOrder": 21
  },
  {
    "id": "official-uzd-023",
    "name": "ТРУЗД-трансректально",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [],
    "sortOrder": 22
  },
  {
    "id": "official-uzd-024",
    "name": "УЗД молочних залоз",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 550,
    "aliases": [],
    "sortOrder": 23
  },
  {
    "id": "official-uzd-025",
    "name": "УЗД ОЧП+нирки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 700,
    "aliases": [],
    "sortOrder": 24
  },
  {
    "id": "official-uzd-026",
    "name": "УЗД ОЧП+нирки+сечовидільна система",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 800,
    "aliases": [],
    "sortOrder": 25
  },
  {
    "id": "official-uzd-027",
    "name": "Холтер ЕКГ (добове моніторування)",
    "category": "heart",
    "categoryLabel": "Серце",
    "amount": 900,
    "aliases": [],
    "sortOrder": 1026
  },
  {
    "id": "official-uzd-028",
    "name": "ЕКГ (електрокардіограма) + заключення",
    "category": "heart",
    "categoryLabel": "Серце",
    "amount": 320,
    "aliases": [],
    "sortOrder": 1027
  },
  {
    "id": "official-uzd-029",
    "name": "Щитоподібна залоза+еластографія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 800,
    "aliases": [],
    "sortOrder": 28
  },
  {
    "id": "official-uzd-030",
    "name": "Молочні залози+еластографія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 800,
    "aliases": [],
    "sortOrder": 29
  },
  {
    "id": "official-uzd-031",
    "name": "Еластографія печінки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 800,
    "aliases": [],
    "sortOrder": 30
  },
  {
    "id": "official-uzd-032",
    "name": "Органи черевної порожнини+еластографія печінки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 31
  },
  {
    "id": "official-uzd-033",
    "name": "Лімфовузли, одна ділянка+еластографія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 800,
    "aliases": [],
    "sortOrder": 32
  },
  {
    "id": "official-uzd-034",
    "name": "УЗД цервікометрія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [],
    "sortOrder": 33
  },
  {
    "id": "official-uzd-035",
    "name": "Нирки+наднирники",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [],
    "sortOrder": 34
  },
  {
    "id": "official-uzd-036",
    "name": "УЗД сечовидільної системи+наднирники",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [],
    "sortOrder": 35
  },
  {
    "id": "official-uzd-037",
    "name": "УЗД ОЧП+нирки+наднирники",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 800,
    "aliases": [],
    "sortOrder": 36
  },
  {
    "id": "official-uzd-038",
    "name": "Еластографія печінки+селезінки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1000,
    "aliases": [],
    "sortOrder": 37
  },
  {
    "id": "official-uzd-039",
    "name": "Еластографія ОЧП+печінки+селезінки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1200,
    "aliases": [],
    "sortOrder": 38
  },
  {
    "id": "official-uzd-040",
    "name": "УЗД ОЧП+нирки+еластографія утворення",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 950,
    "aliases": [],
    "sortOrder": 39
  },
  {
    "id": "official-uzd-041",
    "name": "УЗД ОЧП+еластографія утворення",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 800,
    "aliases": [],
    "sortOrder": 40
  },
  {
    "id": "official-uzd-042",
    "name": "УЗД еластографія печінки+ОЧП+нирки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1200,
    "aliases": [],
    "sortOrder": 41
  },
  {
    "id": "official-uzd-043",
    "name": "Обстеження калитки чоловіків",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 400,
    "aliases": [],
    "sortOrder": 42
  },
  {
    "id": "official-uzd-044",
    "name": "УЗД нирок та сечового міхура, з визначенням залишкової сечі",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [],
    "sortOrder": 43
  },
  {
    "id": "official-uzd-045",
    "name": "УЗД нирок та сечового міхура з визначенням залишкової сечі та обстеження простати чоловіків",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 44
  },
  {
    "id": "official-230-001",
    "name": "КТ приносових пазух",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 3000
  },
  {
    "id": "official-230-002",
    "name": "КТ приносових пазух (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 3001
  },
  {
    "id": "official-230-003",
    "name": "КТ щелепно-лицевої ділянки (лицьовій скелет + нижня щелепа)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 3002
  },
  {
    "id": "official-230-004",
    "name": "КТ щелепно-лицевої ділянки (лицьовій скелет + нижня щелепа) (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3200,
    "aliases": [],
    "sortOrder": 3003
  },
  {
    "id": "official-230-005",
    "name": "КТ головного мозку",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 3004
  },
  {
    "id": "official-230-006",
    "name": "КТ головного мозку (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3200,
    "aliases": [],
    "sortOrder": 3005
  },
  {
    "id": "official-230-007",
    "name": "КТ скроневих кісток (середнє і внутрішнє вухо, соскоподібний відросток)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1600,
    "aliases": [],
    "sortOrder": 3006
  },
  {
    "id": "official-230-008",
    "name": "КТ головного мозку + приносових пазух",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2000,
    "aliases": [],
    "sortOrder": 3007
  },
  {
    "id": "official-230-009",
    "name": "КТ головного мозку + приносових пазух (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3300,
    "aliases": [],
    "sortOrder": 3008
  },
  {
    "id": "official-230-010",
    "name": "КТ одного відділу хребта (шийний, грудний, попереково-крижовий)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 3009
  },
  {
    "id": "official-230-011",
    "name": "КТ суглоба (кульшових, колінний, гомілковостопний, плечовий, ліктьовий, променевозап'ястний)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1600,
    "aliases": [],
    "sortOrder": 3010
  },
  {
    "id": "official-230-012",
    "name": "КТ суглоба (кульшових, колінний, гомілковостопний, плечовий, ліктьовий, променевозап'ястний) (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 3011
  },
  {
    "id": "official-230-013",
    "name": "КТ кісток таза",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [],
    "sortOrder": 3012
  },
  {
    "id": "official-230-014",
    "name": "КТ кісток таза (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3500,
    "aliases": [],
    "sortOrder": 3013
  },
  {
    "id": "official-230-015",
    "name": "КТ попереково-крижового відділу хребта + куприк",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [],
    "sortOrder": 3014
  },
  {
    "id": "official-230-016",
    "name": "КТ кисті/ променево-зап'ястковий суглоб",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [],
    "sortOrder": 3015
  },
  {
    "id": "official-230-017",
    "name": "КТ кисті/ променево-зап'ястковий суглоб (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 3016
  },
  {
    "id": "official-230-018",
    "name": "КТ стопи / гомілковостопний суглоб",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [],
    "sortOrder": 3017
  },
  {
    "id": "official-230-019",
    "name": "КТ стопи / гомілковостопний суглоб (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 3018
  },
  {
    "id": "official-230-020",
    "name": "КТ одного сегмента кінцівки (плече, передпліччя, кисть, стегно, гомілка, стопа)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [],
    "sortOrder": 3019
  },
  {
    "id": "official-230-021",
    "name": "КТ одного сегмента кінцівки (плече, передпліччя, кисть, стегно, гомілка, стопа) (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 3020
  },
  {
    "id": "official-230-022",
    "name": "КТ попереково-крижового відділу хребта + КТ-денситометрія",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2200,
    "aliases": [],
    "sortOrder": 3021
  },
  {
    "id": "official-230-023",
    "name": "Пошук метастазів в кістковому скелеті (всі відділи хребта, ребра, ключиці, лопатки, кістки таза), в легенях, в лімфовузлах",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 3022
  },
  {
    "id": "official-230-024",
    "name": "КТ хребта, кісток таза та грудної клітини (політравма)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 3023
  },
  {
    "id": "official-230-025",
    "name": "КТ двох відділів хребта",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2700,
    "aliases": [],
    "sortOrder": 3024
  },
  {
    "id": "official-230-026",
    "name": "КТ одного відділу хребта + кістки таза",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2700,
    "aliases": [],
    "sortOrder": 3025
  },
  {
    "id": "official-230-027",
    "name": "КТ трьох відділів хребта",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 3026
  },
  {
    "id": "official-230-028",
    "name": "КТ м'яких тканин шиї (включаючи глотку, гортань, лімфовузли)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1700,
    "aliases": [],
    "sortOrder": 3027
  },
  {
    "id": "official-230-029",
    "name": "КТ м'яких тканин шиї (включаючи глотку, гортань, лімфовузли) (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 3028
  },
  {
    "id": "official-230-030",
    "name": "КТ органів грудної клітини",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [],
    "sortOrder": 3029
  },
  {
    "id": "official-230-031",
    "name": "КТ органів грудної клітини (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 3030
  },
  {
    "id": "official-230-032",
    "name": "КТ органів сечовидільної системи (пошук конкрементів нирок, сечоводів, сечового міхура)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2000,
    "aliases": [],
    "sortOrder": 3031
  },
  {
    "id": "official-230-033",
    "name": "КТ органів черевної порожнини + заочеревинного простору + органів таза (далі ОЧП)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4800,
    "aliases": [],
    "sortOrder": 3032
  },
  {
    "id": "official-230-034",
    "name": "КТ-ентерографія",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4800,
    "aliases": [],
    "sortOrder": 3033
  },
  {
    "id": "official-230-035",
    "name": "КТ-колонографія",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4800,
    "aliases": [],
    "sortOrder": 3034
  },
  {
    "id": "official-230-036",
    "name": "КТ м'яких тканин шиї + ОГК",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4900,
    "aliases": [],
    "sortOrder": 3035
  },
  {
    "id": "official-230-037",
    "name": "КТ головного мозку + ОГК",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4900,
    "aliases": [],
    "sortOrder": 3036
  },
  {
    "id": "official-230-038",
    "name": "КТ головного мозку + м’яких тканин шиї",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4900,
    "aliases": [],
    "sortOrder": 3037
  },
  {
    "id": "official-230-039",
    "name": "КТ головного мозку + ОЧП + ОМТ",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5800,
    "aliases": [],
    "sortOrder": 3038
  },
  {
    "id": "official-230-040",
    "name": "КТ ОГК + ОЧП + органів таза",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3700,
    "aliases": [],
    "sortOrder": 3039
  },
  {
    "id": "official-230-041",
    "name": "КТ ОГК + ОЧП + органів таза (з контрастуванням)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5800,
    "aliases": [],
    "sortOrder": 3040
  },
  {
    "id": "official-230-042",
    "name": "КТ м'яких тканин шиї + ОГК + ОЧП + органів таза",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6500,
    "aliases": [],
    "sortOrder": 3041
  },
  {
    "id": "official-230-043",
    "name": "КТ головного мозку + м’яких тканин шиї + ОГК",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 3042
  },
  {
    "id": "official-230-044",
    "name": "КТ головного мозку + ОГК + ОЧП + ОМТ",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6500,
    "aliases": [],
    "sortOrder": 3043
  },
  {
    "id": "official-230-045",
    "name": "КТ головного мозку + м'яких тканин шиї + ОГК + ОЧП + органів таза (онкопошук)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 7000,
    "aliases": [],
    "sortOrder": 3044
  },
  {
    "id": "official-230-046",
    "name": "КТ-ангіографія судин головного мозку",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4100,
    "aliases": [],
    "sortOrder": 3045
  },
  {
    "id": "official-230-047",
    "name": "КТ-ангіографія судин шиї",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4100,
    "aliases": [],
    "sortOrder": 3046
  },
  {
    "id": "official-230-048",
    "name": "КТ-ангіографія грудного / черевного відділу аорти (без ЕКГ синхронізації)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4500,
    "aliases": [],
    "sortOrder": 3047
  },
  {
    "id": "official-230-049",
    "name": "КТ-ангіографія судин шиї та головного мозку",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4900,
    "aliases": [],
    "sortOrder": 3048
  },
  {
    "id": "official-230-050",
    "name": "КТ-ангіографія всієї аорти (без ЕКГ синхронізації)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 3049
  },
  {
    "id": "official-230-051",
    "name": "КТ-ангіографія судин нижніх / верхніх кінцівок",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5500,
    "aliases": [],
    "sortOrder": 3050
  },
  {
    "id": "official-230-052",
    "name": "КТ аортального клапана та аорти з ЕКГ- синхрн. (TAVI)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 7500,
    "aliases": [],
    "sortOrder": 3051
  },
  {
    "id": "official-230-053",
    "name": "КТ серця для підрахунку кальцію в коронарних судинах",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2500,
    "aliases": [],
    "sortOrder": 3052
  },
  {
    "id": "official-230-054",
    "name": "КТ серця з ЕКГ-синхронізацією (оцінка утворів)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5800,
    "aliases": [],
    "sortOrder": 3053
  },
  {
    "id": "official-230-055",
    "name": "КТ серця з ЕКГ-синхронізацією (легеневі вени, ліве передсердя, як підготовка до абляції)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6700,
    "aliases": [],
    "sortOrder": 3054
  },
  {
    "id": "official-230-056",
    "name": "КТ-ангіографія грудної аорти з ЕКГ-синхронізацією",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 3055
  },
  {
    "id": "official-230-057",
    "name": "КТ-ангіографія судин серця та грудної аорти з ЕКГ-синхронізацією",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 3056
  },
  {
    "id": "official-230-058",
    "name": "КТ-ангіографія всієї аорти (грудна аорта з ЕКГ синхронізацією)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6900,
    "aliases": [],
    "sortOrder": 3057
  },
  {
    "id": "official-230-059",
    "name": "КТ -ангіографія судин серця (коронарографія) з ЕКГ синхронізацією",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5800,
    "aliases": [],
    "sortOrder": 3058
  },
  {
    "id": "official-230-060",
    "name": "КТ-денситометрія (додаткове дослідження до КТ попереково-крижового відділу хребта)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 900,
    "aliases": [],
    "sortOrder": 3059
  },
  {
    "id": "official-230-061",
    "name": "Плівка",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 200,
    "aliases": [],
    "sortOrder": 3060
  },
  {
    "id": "official-230-062",
    "name": "Додаткова флешка",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 150,
    "aliases": [],
    "sortOrder": 3061
  },
  {
    "id": "official-230-063",
    "name": "3D-моделювання, сегментація, посегментна волюметрія печінки",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 900,
    "aliases": [],
    "sortOrder": 3062
  },
  {
    "id": "official-230-064",
    "name": "Додатковий опис хребта, суглоба при дослідженнях ОГК, ОЧП і малого таза, м'яких тканин шиї і при їх комбінаціях",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 900,
    "aliases": [],
    "sortOrder": 3063
  },
  {
    "id": "official-230-065",
    "name": "3D-моделювання товстої кишки, кольоровий друк",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 600,
    "aliases": [],
    "sortOrder": 3064
  },
  {
    "id": "official-230-066",
    "name": "Альтернативний висновок (опис КТ дослідження виконаного в іншому центрі)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2500,
    "aliases": [],
    "sortOrder": 3065
  },
  {
    "id": "official-230-067",
    "name": "3D-моделювання, сегментація, посегментна волюметрія печінки з носія (флешка, СD) пацієнта",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2500,
    "aliases": [],
    "sortOrder": 3066
  },
  {
    "id": "official-230-068",
    "name": "Швидке тестування на креатинін",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 300,
    "aliases": [],
    "sortOrder": 3067
  },
  {
    "id": "official-231-001",
    "name": "Загальний розгорнутий аналіз крові (параметри аналізатора, ШОЕ (автоматичний підрахунок)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 210,
    "aliases": [],
    "sortOrder": 4000
  },
  {
    "id": "official-231-002",
    "name": "Загальний розгорнутий аналіз крові (параметри аналізатора, ШОЕ, лейкоцитарна формула) ручний підрахунок",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 260,
    "aliases": [],
    "sortOrder": 4001
  },
  {
    "id": "official-231-003",
    "name": "Аналіз крові на ретикулоцити з підрахуванням ретикулярного індексу",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 170,
    "aliases": [],
    "sortOrder": 4002
  },
  {
    "id": "official-231-004",
    "name": "Группа крові та резус фактор",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 280,
    "aliases": [],
    "sortOrder": 4003
  },
  {
    "id": "official-231-005",
    "name": "Час згортання крові за Сухоревим",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 230,
    "aliases": [],
    "sortOrder": 4004
  },
  {
    "id": "official-231-006",
    "name": "Аналіз сечі загальний (ЗАС+ручна мікроскопія осаду)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 180,
    "aliases": [],
    "sortOrder": 4005
  },
  {
    "id": "official-231-007",
    "name": "Аналіз сечі за Нечипоренко",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 170,
    "aliases": [],
    "sortOrder": 4006
  },
  {
    "id": "official-231-008",
    "name": "Аналіз сечі на цукор (кількісний)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 4007
  },
  {
    "id": "official-231-009",
    "name": "Аналіз сечі на кетони (напівкількісний)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 4008
  },
  {
    "id": "official-231-010",
    "name": "Аналіз сечі на білок",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 4009
  },
  {
    "id": "official-231-011",
    "name": "Аналіз сечі на білок Бенс-Джонса",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 180,
    "aliases": [],
    "sortOrder": 4010
  },
  {
    "id": "official-231-012",
    "name": "Кліренс ендогенного креатиніну (Проба Реберга, визначення швидкості клубочкової фільтрації)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 280,
    "aliases": [],
    "sortOrder": 4011
  },
  {
    "id": "official-231-013",
    "name": "Креатинін в сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 4012
  },
  {
    "id": "official-231-014",
    "name": "Мікроальбумінурія у сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 260,
    "aliases": [],
    "sortOrder": 4013
  },
  {
    "id": "official-231-015",
    "name": "Альбумін-креатинінове співвідношення",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 260,
    "aliases": [],
    "sortOrder": 4014
  },
  {
    "id": "official-231-016",
    "name": "Аналіз сечі на добову протеїнурію (напівкількісний)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 4015
  },
  {
    "id": "official-231-017",
    "name": "Сечова кислота в сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 4016
  },
  {
    "id": "official-231-018",
    "name": "Діастаза сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 4017
  },
  {
    "id": "official-231-019",
    "name": "Кальцій в сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 4018
  },
  {
    "id": "official-231-020",
    "name": "Фосфор в сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 4019
  },
  {
    "id": "official-231-021",
    "name": "Магній в сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 4020
  },
  {
    "id": "official-231-022",
    "name": "Аналіз зішкрібу на яйця гостриків (ентеробіоз)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 240,
    "aliases": [],
    "sortOrder": 4021
  },
  {
    "id": "official-231-023",
    "name": "Копрограма",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 260,
    "aliases": [],
    "sortOrder": 4022
  },
  {
    "id": "official-231-024",
    "name": "Аналіз калу на яйця гельмінтів",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 4023
  },
  {
    "id": "official-231-025",
    "name": "Кальпротектин в калі (кількісне визначення)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 720,
    "aliases": [],
    "sortOrder": 4024
  },
  {
    "id": "official-231-026",
    "name": "Дослідження калу на приховану кров",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 260,
    "aliases": [],
    "sortOrder": 4025
  },
  {
    "id": "official-231-027",
    "name": "Лактоферин (кількісне визначення)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 800,
    "aliases": [],
    "sortOrder": 4026
  },
  {
    "id": "official-231-028",
    "name": "Панкреатична еластаза в калі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 850,
    "aliases": [],
    "sortOrder": 4027
  },
  {
    "id": "official-231-029",
    "name": "Helicobacter pylori Ag (кал)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 420,
    "aliases": [
      "хелікобактер"
    ],
    "sortOrder": 4028
  },
  {
    "id": "official-232-001",
    "name": "Білірубін загальний",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5000
  },
  {
    "id": "official-232-002",
    "name": "Білірубін прямий",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5001
  },
  {
    "id": "official-232-003",
    "name": "Білірубіновий комплекс (білірубін загальний+ білірубін прямий+ білірубін непрямий)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 250,
    "aliases": [],
    "sortOrder": 5002
  },
  {
    "id": "official-232-004",
    "name": "Глюкоза (венозна кров)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5003
  },
  {
    "id": "official-232-005",
    "name": "Альфа-амілаза",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5004
  },
  {
    "id": "official-232-006",
    "name": "Панкреатична амілаза",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5005
  },
  {
    "id": "official-232-007",
    "name": "Ліпаза",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5006
  },
  {
    "id": "official-232-008",
    "name": "Аланінамінотрансфераза (АЛТ)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5007
  },
  {
    "id": "official-232-009",
    "name": "Аспартатамінотрансфераза (АСТ)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5008
  },
  {
    "id": "official-232-010",
    "name": "g-Глутамілтрансфераза (ГГТ)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5009
  },
  {
    "id": "official-232-011",
    "name": "Лактатдегідрогеназа (ЛДГ)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5010
  },
  {
    "id": "official-232-012",
    "name": "Лужна фосфотаза (ЛФ)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5011
  },
  {
    "id": "official-232-013",
    "name": "Тимолова проба",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5012
  },
  {
    "id": "official-232-014",
    "name": "Креатинінкіназа (КФК)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5013
  },
  {
    "id": "official-232-015",
    "name": "Креатинін",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5014
  },
  {
    "id": "official-232-016",
    "name": "Кліренс ендогенного креатиніну (Проба Реберга, визначення швидкості клубочкової фільтрації)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 280,
    "aliases": [],
    "sortOrder": 5015
  },
  {
    "id": "official-232-017",
    "name": "Сечова кислота",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5016
  },
  {
    "id": "official-232-018",
    "name": "Сечовина",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5017
  },
  {
    "id": "official-232-019",
    "name": "Альбумін",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5018
  },
  {
    "id": "official-232-020",
    "name": "Загальний білок",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5019
  },
  {
    "id": "official-232-021",
    "name": "Білкові фракції",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 330,
    "aliases": [],
    "sortOrder": 5020
  },
  {
    "id": "official-232-022",
    "name": "Холестерин загальний",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5021
  },
  {
    "id": "official-232-023",
    "name": "Тригліцериди",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5022
  },
  {
    "id": "official-232-024",
    "name": "ЛПВЩ (HDL)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5023
  },
  {
    "id": "official-232-025",
    "name": "ЛПНЩ (LDL)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5024
  },
  {
    "id": "official-232-026",
    "name": "Холінестераза",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 180,
    "aliases": [],
    "sortOrder": 5025
  },
  {
    "id": "official-232-027",
    "name": "Натрій",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5026
  },
  {
    "id": "official-232-028",
    "name": "Калій",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5027
  },
  {
    "id": "official-232-029",
    "name": "Кальцій",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5028
  },
  {
    "id": "official-232-030",
    "name": "Кальцій іонізований",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 5029
  },
  {
    "id": "official-232-031",
    "name": "Магній",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5030
  },
  {
    "id": "official-232-032",
    "name": "Фосфор",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5031
  },
  {
    "id": "official-232-033",
    "name": "Хлор",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5032
  },
  {
    "id": "official-232-034",
    "name": "Мідь",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 350,
    "aliases": [],
    "sortOrder": 5033
  },
  {
    "id": "official-232-035",
    "name": "Цинк",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 400,
    "aliases": [],
    "sortOrder": 5034
  },
  {
    "id": "official-232-036",
    "name": "Церулоплазмін (мідна оксидаза)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 280,
    "aliases": [],
    "sortOrder": 5035
  },
  {
    "id": "official-232-037",
    "name": "Сіалові кислоти",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 5036
  },
  {
    "id": "official-232-038",
    "name": "Азот сечовини",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 5037
  },
  {
    "id": "official-232-039",
    "name": "Аполіпопротеїн-А (Апо-А)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 5038
  },
  {
    "id": "official-232-040",
    "name": "Аполіпопротеїн-В (Апо-В)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 5039
  },
  {
    "id": "official-232-041",
    "name": "Аполіпопротеїн А-1",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 5040
  },
  {
    "id": "official-232-042",
    "name": "Аполіпопротеїн В",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 5041
  },
  {
    "id": "official-232-043",
    "name": "Визначення рН крові",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 5042
  },
  {
    "id": "official-232-044",
    "name": "Цистатин С",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 5043
  },
  {
    "id": "official-232-045",
    "name": "Вальпроєва кислота",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 380,
    "aliases": [],
    "sortOrder": 5044
  },
  {
    "id": "official-232-046",
    "name": "Індекс фіброзу печінки FIB-4 (АЛТ, АСТ, ЗАК)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 5045
  },
  {
    "id": "official-233-001",
    "name": "Глюкоза (венозна кров)",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 140,
    "aliases": [],
    "sortOrder": 6000
  },
  {
    "id": "official-233-002",
    "name": "Глюкоза (експрес-тест)",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 120,
    "aliases": [],
    "sortOrder": 6001
  },
  {
    "id": "official-233-003",
    "name": "Глікозильований гемоглобін",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 290,
    "aliases": [],
    "sortOrder": 6002
  },
  {
    "id": "official-233-004",
    "name": "Глюкоза (венозна кров)+толерантний тест",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 280,
    "aliases": [],
    "sortOrder": 6003
  },
  {
    "id": "official-233-005",
    "name": "індекс НОМА+Глюкоза+інсулін",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 390,
    "aliases": [],
    "sortOrder": 6004
  },
  {
    "id": "official-233-006",
    "name": "Інсулін",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 290,
    "aliases": [],
    "sortOrder": 6005
  },
  {
    "id": "official-233-007",
    "name": "С-пептид",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 290,
    "aliases": [],
    "sortOrder": 6006
  },
  {
    "id": "official-233-008",
    "name": "Лактат",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 300,
    "aliases": [],
    "sortOrder": 6007
  },
  {
    "id": "official-233-009",
    "name": "Лептин (LEP)",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 600,
    "aliases": [],
    "sortOrder": 6008
  },
  {
    "id": "official-233-010",
    "name": "GADA Антитіла до глутамінокислої декарбоксилази",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 800,
    "aliases": [],
    "sortOrder": 6009
  },
  {
    "id": "official-234-001",
    "name": "Активований частковий тромбопластичний час (АЧТЧ)",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 150,
    "aliases": [],
    "sortOrder": 7000
  },
  {
    "id": "official-234-002",
    "name": "Коагулограма",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 450,
    "aliases": [],
    "sortOrder": 7001
  },
  {
    "id": "official-234-003",
    "name": "Протромбіновий тест (протромбіновий індекс за Квіком, протромбіновий час, МНВ (INR)",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 180,
    "aliases": [],
    "sortOrder": 7002
  },
  {
    "id": "official-234-004",
    "name": "Тромбіновий час",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 150,
    "aliases": [],
    "sortOrder": 7003
  },
  {
    "id": "official-234-005",
    "name": "Фібриноген",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 150,
    "aliases": [],
    "sortOrder": 7004
  },
  {
    "id": "official-234-006",
    "name": "Вовчаковий антикоагулянт",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 500,
    "aliases": [],
    "sortOrder": 7005
  },
  {
    "id": "official-234-007",
    "name": "Д-димер",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 290,
    "aliases": [],
    "sortOrder": 7006
  },
  {
    "id": "official-235-001",
    "name": "Тиреотропний гормон (ТТГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 250,
    "aliases": [
      "ТТГ",
      "TSH"
    ],
    "sortOrder": 8000
  },
  {
    "id": "official-235-002",
    "name": "Т4 вільний (Т4)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 250,
    "aliases": [],
    "sortOrder": 8001
  },
  {
    "id": "official-235-003",
    "name": "Т3 загальний (Т3)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 250,
    "aliases": [],
    "sortOrder": 8002
  },
  {
    "id": "official-235-004",
    "name": "Т3 вільний (FT3)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 250,
    "aliases": [],
    "sortOrder": 8003
  },
  {
    "id": "official-235-005",
    "name": "Т4 загальний (Т4)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 250,
    "aliases": [],
    "sortOrder": 8004
  },
  {
    "id": "official-235-006",
    "name": "Антитіла до тиреоглобуліну (А-ТГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8005
  },
  {
    "id": "official-235-007",
    "name": "Тиреоглобулін (ТГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8006
  },
  {
    "id": "official-235-008",
    "name": "Антитіла до тиреопероксидази (АТПО)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 300,
    "aliases": [],
    "sortOrder": 8007
  },
  {
    "id": "official-235-009",
    "name": "Кальцитонін",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 450,
    "aliases": [],
    "sortOrder": 8008
  },
  {
    "id": "official-235-010",
    "name": "Паратгормон",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 300,
    "aliases": [],
    "sortOrder": 8009
  },
  {
    "id": "official-235-011",
    "name": "Антитіла до рецепторів ТТГ",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 550,
    "aliases": [],
    "sortOrder": 8010
  },
  {
    "id": "official-235-012",
    "name": "Фолікулостимулюючий гормон (ФСГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8011
  },
  {
    "id": "official-235-013",
    "name": "Лютеїнізуючий гормон (ЛГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8012
  },
  {
    "id": "official-235-014",
    "name": "Пролактин (ПРЛ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8013
  },
  {
    "id": "official-235-015",
    "name": "Пролактин з розведенням",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8014
  },
  {
    "id": "official-235-016",
    "name": "Естрадіол (Е2)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8015
  },
  {
    "id": "official-235-017",
    "name": "Прогестерон (ПРГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8016
  },
  {
    "id": "official-235-018",
    "name": "Тестостерон (ТСТ загальний)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8017
  },
  {
    "id": "official-235-019",
    "name": "Тестостерон вільний (ТСТ вільний)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 300,
    "aliases": [],
    "sortOrder": 8018
  },
  {
    "id": "official-235-020",
    "name": "Глобулін, що зв’язує статеві гормони (ГЗСГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8019
  },
  {
    "id": "official-235-021",
    "name": "17-оксіпрогестерон (17-ОНПРГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8020
  },
  {
    "id": "official-235-022",
    "name": "Дегідроепіандростерон-сульфат (ДГЕА-с)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 8021
  },
  {
    "id": "official-235-023",
    "name": "Андростендіон",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 420,
    "aliases": [],
    "sortOrder": 8022
  },
  {
    "id": "official-235-024",
    "name": "Кортизол (в сироватці) (КР)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 340,
    "aliases": [],
    "sortOrder": 8023
  },
  {
    "id": "official-235-025",
    "name": "Антиспермальні антитіла (кров)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 380,
    "aliases": [],
    "sortOrder": 8024
  },
  {
    "id": "official-235-026",
    "name": "Антиспермальні антитіла (еякулят/слиз)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 380,
    "aliases": [],
    "sortOrder": 8025
  },
  {
    "id": "official-235-027",
    "name": "Антимюллерів гормон",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 670,
    "aliases": [],
    "sortOrder": 8026
  },
  {
    "id": "official-235-028",
    "name": "Дигідротестостерон",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 450,
    "aliases": [],
    "sortOrder": 8027
  },
  {
    "id": "official-235-029",
    "name": "Індекс вільного тестостерону (ТСТ зг./ГЗСГх100)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 460,
    "aliases": [],
    "sortOrder": 8028
  },
  {
    "id": "official-235-030",
    "name": "Макропролактин",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 580,
    "aliases": [],
    "sortOrder": 8029
  },
  {
    "id": "official-235-031",
    "name": "Інгібін В (Ing B)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 780,
    "aliases": [],
    "sortOrder": 8030
  },
  {
    "id": "official-235-032",
    "name": "Андростендіола глюкуронід (3-альфа-Діол)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 550,
    "aliases": [],
    "sortOrder": 8031
  },
  {
    "id": "official-235-033",
    "name": "Адренокортикотропний гормон (АКТГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 400,
    "aliases": [],
    "sortOrder": 8032
  },
  {
    "id": "official-235-034",
    "name": "Кортизол (в сироватці) (КР)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 340,
    "aliases": [],
    "sortOrder": 8033
  },
  {
    "id": "official-235-035",
    "name": "Кортизол (в добовій сечі) (КР)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 340,
    "aliases": [],
    "sortOrder": 8034
  },
  {
    "id": "official-235-036",
    "name": "Кортизол (слина)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 390,
    "aliases": [],
    "sortOrder": 8035
  },
  {
    "id": "official-235-037",
    "name": "Метанефрини загальні (у добовій сечі)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 750,
    "aliases": [],
    "sortOrder": 8036
  },
  {
    "id": "official-235-038",
    "name": "Альдостерон",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 520,
    "aliases": [],
    "sortOrder": 8037
  },
  {
    "id": "official-235-039",
    "name": "Альдостерон-ренінове співвідношення",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 1560,
    "aliases": [],
    "sortOrder": 8038
  },
  {
    "id": "official-236-001",
    "name": "Соматотропний гормон (СТГ) (ЕХЛ) ROCHE",
    "category": "growth",
    "categoryLabel": "Фактори росту",
    "amount": 300,
    "aliases": [],
    "sortOrder": 9000
  },
  {
    "id": "official-236-002",
    "name": "Інсуліноподібний фактор росту, соматомедин С (IGF-1)",
    "category": "growth",
    "categoryLabel": "Фактори росту",
    "amount": 460,
    "aliases": [],
    "sortOrder": 9001
  },
  {
    "id": "official-237-001",
    "name": "Асоційований з вагітністю протеїн – А (РАРР-А)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 280,
    "aliases": [],
    "sortOrder": 10000
  },
  {
    "id": "official-237-002",
    "name": "Естріол некон’югований (Е3)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 280,
    "aliases": [],
    "sortOrder": 10001
  },
  {
    "id": "official-237-003",
    "name": "Бета-хоріонічний гонадотропін (ХГЛ загальний)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 280,
    "aliases": [],
    "sortOrder": 10002
  },
  {
    "id": "official-237-004",
    "name": "Бета-хоріонічний гонадотропін вільний (В-ХГЛ)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 280,
    "aliases": [],
    "sortOrder": 10003
  },
  {
    "id": "official-237-005",
    "name": "PRISCA 1 вагітність 8-13 тижнів (В-ХГЛ, РАРР-А) Пренатальний (біохімічний) скринінг (останнє УЗД)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 570,
    "aliases": [],
    "sortOrder": 10004
  },
  {
    "id": "official-237-006",
    "name": "PRISCA 2 вагітність 14-21 тижнів (ХГЛ, АФП, UЕ3) Пренатальний (біохімічний) скринінг (останнє УЗД)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 630,
    "aliases": [],
    "sortOrder": 10005
  },
  {
    "id": "official-237-007",
    "name": "Плацентарний лактоген",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 420,
    "aliases": [],
    "sortOrder": 10006
  },
  {
    "id": "official-237-008",
    "name": "Альфа-фетопротеїн (AFP) (вагітні)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 280,
    "aliases": [],
    "sortOrder": 10007
  },
  {
    "id": "official-238-001",
    "name": "В2 мікроглобулін",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 340,
    "aliases": [],
    "sortOrder": 11000
  },
  {
    "id": "official-238-002",
    "name": "Альфа-фетопротеїн (АФП)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 280,
    "aliases": [],
    "sortOrder": 11001
  },
  {
    "id": "official-238-003",
    "name": "Онкомаркер ХГЛ (загальна В-субодиниця)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 280,
    "aliases": [],
    "sortOrder": 11002
  },
  {
    "id": "official-238-004",
    "name": "Раково-ембріональний антиген (СЕА)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 280,
    "aliases": [],
    "sortOrder": 11003
  },
  {
    "id": "official-238-005",
    "name": "Простат-специфічний антиген загальний (ПСА загальний)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 280,
    "aliases": [],
    "sortOrder": 11004
  },
  {
    "id": "official-238-006",
    "name": "Простат-специфічний антиген вільний (ПСА вільний)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 280,
    "aliases": [],
    "sortOrder": 11005
  },
  {
    "id": "official-238-007",
    "name": "Онкомаркер шлунку (СА 72-4)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 480,
    "aliases": [],
    "sortOrder": 11006
  },
  {
    "id": "official-238-008",
    "name": "Простата- специфічний антиген (ПСА загальний +ПСА вільний)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 530,
    "aliases": [],
    "sortOrder": 11007
  },
  {
    "id": "official-238-009",
    "name": "Простатична кисла фосфотаза (PAP)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 350,
    "aliases": [],
    "sortOrder": 11008
  },
  {
    "id": "official-238-010",
    "name": "Онкомаркер підшлункової залози (СА 19-9)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 300,
    "aliases": [],
    "sortOrder": 11009
  },
  {
    "id": "official-238-011",
    "name": "Онкомаркер молочної залози (СА 15-3)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 300,
    "aliases": [],
    "sortOrder": 11010
  },
  {
    "id": "official-238-012",
    "name": "Онкомаркер яєчників (СА 125)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 300,
    "aliases": [],
    "sortOrder": 11011
  },
  {
    "id": "official-238-013",
    "name": "Онкомаркер CYFRA CA 21-1 (фрагмент цитокератину 19)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 400,
    "aliases": [],
    "sortOrder": 11012
  },
  {
    "id": "official-238-014",
    "name": "Нейроенолаза (NSE)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 490,
    "aliases": [],
    "sortOrder": 11013
  },
  {
    "id": "official-238-015",
    "name": "Антиген плоскоклітинної карциноми (SCC)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 500,
    "aliases": [],
    "sortOrder": 11014
  },
  {
    "id": "official-238-016",
    "name": "Онкомаркер раку яєчників (НЕ-4)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 570,
    "aliases": [],
    "sortOrder": 11015
  },
  {
    "id": "official-238-017",
    "name": "Онкомаркер ШКТ (СА-242)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 500,
    "aliases": [],
    "sortOrder": 11016
  },
  {
    "id": "official-238-018",
    "name": "Індекс ROMA (HE-4 + CA-125)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 750,
    "aliases": [],
    "sortOrder": 11017
  },
  {
    "id": "official-238-019",
    "name": "Онкомаркер підшлункової залози (СА 50)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 500,
    "aliases": [],
    "sortOrder": 11018
  },
  {
    "id": "official-238-020",
    "name": "Плацентарний фактор росту",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 700,
    "aliases": [],
    "sortOrder": 11019
  },
  {
    "id": "official-239-001",
    "name": "С-реактивний білок, СРБ (кількісний), високої чутливості",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 180,
    "aliases": [],
    "sortOrder": 12000
  },
  {
    "id": "official-239-002",
    "name": "Ревматоїдний фактор, РФ (кількісний)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 180,
    "aliases": [],
    "sortOrder": 12001
  },
  {
    "id": "official-239-003",
    "name": "Антистрептолізин «О», АСЛО (кількісний)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 180,
    "aliases": [],
    "sortOrder": 12002
  },
  {
    "id": "official-239-004",
    "name": "Серомукоїди",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 160,
    "aliases": [],
    "sortOrder": 12003
  },
  {
    "id": "official-239-005",
    "name": "Антинуклеарні антитіла (ANA-скинінг)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 570,
    "aliases": [],
    "sortOrder": 12004
  },
  {
    "id": "official-239-006",
    "name": "ANA – профіль (U1-snRNP, Sm, SS-A(Ro), Ro-52, SS-B, Scl-70, PM-Scl, Jo-1, CENP-B, PCNA, dsDNA, Nucleosomes, Histones, P-protein, AMA-M2, Мі-2, Ku)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 1600,
    "aliases": [],
    "sortOrder": 12005
  },
  {
    "id": "official-239-007",
    "name": "Антитіла до циклічного цітруліновому пептиду (AntiCCP)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 550,
    "aliases": [],
    "sortOrder": 12006
  },
  {
    "id": "official-239-008",
    "name": "Креатинкіназа-МВ (КФК-МВ)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 250,
    "aliases": [],
    "sortOrder": 12007
  },
  {
    "id": "official-239-009",
    "name": "Антитіла до 1-спіральної ДНК (ADNA 1)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 12008
  },
  {
    "id": "official-239-010",
    "name": "Антитіла до 2-спіральної ДНК (ADNA 2)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 12009
  },
  {
    "id": "official-239-011",
    "name": "Антимітохондріальні антитіла (АМА-М2)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 12010
  },
  {
    "id": "official-239-012",
    "name": "Антитіла до цітрулінірованого віментину (Anti-MCV IgG)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 690,
    "aliases": [],
    "sortOrder": 12011
  },
  {
    "id": "official-239-013",
    "name": "Тропонін І (кількісне визначення)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 280,
    "aliases": [],
    "sortOrder": 12012
  },
  {
    "id": "official-239-014",
    "name": "Гомоцистеїн",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 550,
    "aliases": [],
    "sortOrder": 12013
  },
  {
    "id": "official-239-015",
    "name": "Прокальцитонін",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 750,
    "aliases": [],
    "sortOrder": 12014
  },
  {
    "id": "official-239-016",
    "name": "Мозковий натрій уретичний пептид",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 1050,
    "aliases": [],
    "sortOrder": 12015
  },
  {
    "id": "official-240-001",
    "name": "Залізо (сироватка)",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 150,
    "aliases": [],
    "sortOrder": 13000
  },
  {
    "id": "official-240-002",
    "name": "Залізо-зв’язуюча здатність сироватки крові загальна",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 250,
    "aliases": [],
    "sortOrder": 13001
  },
  {
    "id": "official-240-003",
    "name": "Трансферин",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 270,
    "aliases": [],
    "sortOrder": 13002
  },
  {
    "id": "official-240-004",
    "name": "Феритин",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 300,
    "aliases": [
      "ферритин"
    ],
    "sortOrder": 13003
  },
  {
    "id": "official-240-005",
    "name": "Фолієва кислота (Вітамін В9)",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 300,
    "aliases": [],
    "sortOrder": 13004
  },
  {
    "id": "official-240-006",
    "name": "Цианкобаламін (Вітамін В12)",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 300,
    "aliases": [],
    "sortOrder": 13005
  },
  {
    "id": "official-240-007",
    "name": "Пряма проба Кумбса",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 400,
    "aliases": [],
    "sortOrder": 13006
  },
  {
    "id": "official-240-008",
    "name": "Еритропоетин",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 480,
    "aliases": [],
    "sortOrder": 13007
  },
  {
    "id": "official-241-001",
    "name": "Аналіз крові на LE-клітини",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 270,
    "aliases": [],
    "sortOrder": 14000
  },
  {
    "id": "official-241-002",
    "name": "Циркулюючі імунокомплекси (ЦІК)",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 300,
    "aliases": [],
    "sortOrder": 14001
  },
  {
    "id": "official-241-003",
    "name": "Імунні антитіла до еритроцитів по системі Резус",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 480,
    "aliases": [],
    "sortOrder": 14002
  },
  {
    "id": "official-241-004",
    "name": "Гемолізини (імунні антитіла по системі ABO)",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 14003
  },
  {
    "id": "official-241-005",
    "name": "Пряма проба Кумбса",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 14004
  },
  {
    "id": "official-241-006",
    "name": "Вміст сироваткового імуноглобуліну A",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 250,
    "aliases": [],
    "sortOrder": 14005
  },
  {
    "id": "official-241-007",
    "name": "Вміст сироваткового імуноглобуліну M",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 250,
    "aliases": [],
    "sortOrder": 14006
  },
  {
    "id": "official-241-008",
    "name": "Вміст сироваткового імуноглобуліну G",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 250,
    "aliases": [],
    "sortOrder": 14007
  },
  {
    "id": "official-241-009",
    "name": "Антитіла Ig G до фосфоліпідів (APHL Ig G)",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 14008
  },
  {
    "id": "official-241-010",
    "name": "Антитіла Ig M до фосфоліпідів (APHL Ig M)",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 14009
  },
  {
    "id": "official-241-011",
    "name": "Печінковий блот Liver 7G. Антитіла IgG проти AMA-M2, LKM-1, LC-1, SLA/LP, Mi-2, Ku",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 900,
    "aliases": [],
    "sortOrder": 14010
  },
  {
    "id": "official-241-012",
    "name": "Антитіла IgG до гліадіну",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 14011
  },
  {
    "id": "official-241-013",
    "name": "Антитіла IgA до гліадину",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 14012
  },
  {
    "id": "official-241-014",
    "name": "Антитіла IgG до кардіоліпіну",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 14013
  },
  {
    "id": "official-241-015",
    "name": "Антитіла IgМ до кардіоліпіну",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 14014
  },
  {
    "id": "official-241-016",
    "name": "Антитіла IgG до бета-2-глікопротеїну I",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 14015
  },
  {
    "id": "official-241-017",
    "name": "Антитіла IgM до бета-2-глікопротеїну I",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 14016
  },
  {
    "id": "official-241-018",
    "name": "Мікросоми печінки і нирок, антитіла сумарні (LKM)",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 14017
  },
  {
    "id": "official-242-001",
    "name": "Остеокальцин",
    "category": "osteoporosis",
    "categoryLabel": "Панель остеопорозу",
    "amount": 350,
    "aliases": [],
    "sortOrder": 15000
  },
  {
    "id": "official-242-002",
    "name": "Прокальцитонін",
    "category": "osteoporosis",
    "categoryLabel": "Панель остеопорозу",
    "amount": 750,
    "aliases": [],
    "sortOrder": 15001
  },
  {
    "id": "official-242-003",
    "name": "Вітамін D загальний 25ОН VitD (D3)",
    "category": "osteoporosis",
    "categoryLabel": "Панель остеопорозу",
    "amount": 550,
    "aliases": [
      "вітамін Д"
    ],
    "sortOrder": 15002
  },
  {
    "id": "official-243-001",
    "name": "Мікроскопія урогенітального зішкрібу (жінки)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 16000
  },
  {
    "id": "official-243-002",
    "name": "Мікроскопія урогенітального зішкрібу (чоловіки)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 16001
  },
  {
    "id": "official-243-003",
    "name": "Мікроскопія вагінальних виділень за крітеріями Хей-Айсон (Hay-Ison)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 300,
    "aliases": [],
    "sortOrder": 16002
  },
  {
    "id": "official-243-004",
    "name": "Цитоморфологічне дослідження епітелію на атипові клітини (жінки)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 240,
    "aliases": [],
    "sortOrder": 16003
  },
  {
    "id": "official-243-005",
    "name": "Аналіз секрету передміхурової залози",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 16004
  },
  {
    "id": "official-243-006",
    "name": "Мікроскопічне дослідження відбитку з головки статевого члена",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 16005
  },
  {
    "id": "official-243-007",
    "name": "Гормональна кольпоцитологія",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 16006
  },
  {
    "id": "official-243-008",
    "name": "Цитоморфологічне дослідження виділень із соска молочної залози",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 400,
    "aliases": [],
    "sortOrder": 16007
  },
  {
    "id": "official-243-009",
    "name": "Цитологічне дослідження тонкоголкових пункційних біопсій молочної залози (1 локація)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 16008
  },
  {
    "id": "official-243-010",
    "name": "Цитоморфологічне дослідження біологічного матеріалу",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 16009
  },
  {
    "id": "official-243-011",
    "name": "ПАП-ТЕСТ, цитологічне дослідження епітелію (скло)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 300,
    "aliases": [],
    "sortOrder": 16010
  },
  {
    "id": "official-243-012",
    "name": "Рідинна цитологія (ПАП-тест)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 570,
    "aliases": [],
    "sortOrder": 16011
  },
  {
    "id": "official-243-013",
    "name": "Аналіз калу на лямблії (мікроскопія)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 16012
  },
  {
    "id": "official-243-014",
    "name": "Назоцитограма",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 16013
  },
  {
    "id": "official-243-015",
    "name": "Дослідження на паразитарні гриби (все, крім нігтів)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 16014
  },
  {
    "id": "official-243-016",
    "name": "Мікроскопічне дослідження нігтів на патагенні гриби (мікроскопія)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 16015
  },
  {
    "id": "official-243-017",
    "name": "Дослідження на демодекоз (Demodex follicullorum)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 16016
  },
  {
    "id": "official-244-001",
    "name": "Антитіла IgМ до вірусу гепатиту А (HAV IgМ)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 320,
    "aliases": [],
    "sortOrder": 17000
  },
  {
    "id": "official-244-002",
    "name": "ПЛР. Визначення РНК вірусу гепатиту А (плазма, якісне визначення)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 580,
    "aliases": [],
    "sortOrder": 17001
  },
  {
    "id": "official-244-003",
    "name": "HBsAg поверхневий антиген вірусу гепатиту В",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 320,
    "aliases": [],
    "sortOrder": 17002
  },
  {
    "id": "official-244-004",
    "name": "Антитіла IgG до вірусу гепатиту В (Anti- HBsAg, кількісне визначення)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 17003
  },
  {
    "id": "official-244-005",
    "name": "HBеAg вірусу гепатиту В",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 17004
  },
  {
    "id": "official-244-006",
    "name": "Сумарні антитіла до HBеAg вірусу гепатиту В (Anti- HBеAg)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 17005
  },
  {
    "id": "official-244-007",
    "name": "Антитіла IgМ до вірусу гепатиту В (Anti- HBcor IgM)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 17006
  },
  {
    "id": "official-244-008",
    "name": "Антитіла IgG до вірусу гепатиту В (Anti- HBcor IgG)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 17007
  },
  {
    "id": "official-244-009",
    "name": "Загальні антитіла до корового антигену вірусу гепатиту В (Anti- HBcor)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 17008
  },
  {
    "id": "official-244-010",
    "name": "ПЛР. Визначення ДНК вірусу гепатиту В (плазма, якісне визначення)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 580,
    "aliases": [],
    "sortOrder": 17009
  },
  {
    "id": "official-244-011",
    "name": "ПЛР. Кількісне визначення ДНК вірусу гепатиту В (Real-time) (плазма)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 990,
    "aliases": [],
    "sortOrder": 17010
  },
  {
    "id": "official-244-012",
    "name": "Сумарні антитіла до вірусу гепатиту С (HCV total)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 320,
    "aliases": [],
    "sortOrder": 17011
  },
  {
    "id": "official-244-013",
    "name": "Антитіла IgM до вірусу гепатиту С (HCV IgM)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 320,
    "aliases": [],
    "sortOrder": 17012
  },
  {
    "id": "official-244-014",
    "name": "Антитіла IgG до вірусу гепатиту С (HCV IgG)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 320,
    "aliases": [],
    "sortOrder": 17013
  },
  {
    "id": "official-244-015",
    "name": "Антитіла IgG до вірусу гепатиту С (Anti- HCV IgG corеАg, NS3, NS4, NS5) БЛОТ-аналіз",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 550,
    "aliases": [],
    "sortOrder": 17014
  },
  {
    "id": "official-244-016",
    "name": "ПЛР. Визначення РНК вірусу гепатиту С (плазма, якісне визначення)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 590,
    "aliases": [],
    "sortOrder": 17015
  },
  {
    "id": "official-244-017",
    "name": "ПЛР. Кількісне визначення РНК вірусу гепатиту С (Real-time) (плазма)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 1150,
    "aliases": [],
    "sortOrder": 17016
  },
  {
    "id": "official-244-018",
    "name": "ПЛР. Генотипування РНК вірусу гепатиту С (1а, 1b, 2,3a) (Real-time) (плазма)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 17017
  },
  {
    "id": "official-244-019",
    "name": "ПЛР. Визначення РНК вірусу гепатиту D (плазма, якісне визначення)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 550,
    "aliases": [],
    "sortOrder": 17018
  },
  {
    "id": "official-245-001",
    "name": "Антитіла до ВІЛ 1/2 тип",
    "category": "hiv",
    "categoryLabel": "ВІЛ/СНІД",
    "amount": 260,
    "aliases": [],
    "sortOrder": 18000
  },
  {
    "id": "official-245-002",
    "name": "Антитіла до ВІЛ (НІV1/HIV2 та p24 Ag)",
    "category": "hiv",
    "categoryLabel": "ВІЛ/СНІД",
    "amount": 400,
    "aliases": [],
    "sortOrder": 18001
  },
  {
    "id": "official-246-001",
    "name": "Антитіла IgM до цитомегаловірусу (CMV)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19000
  },
  {
    "id": "official-246-002",
    "name": "Антитіла IgG до цитомегаловірусу (CMV)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19001
  },
  {
    "id": "official-246-003",
    "name": "Авідність антитіл IgG до цитомегаловірусу (CMV)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 19002
  },
  {
    "id": "official-246-004",
    "name": "ПЛР. Визначення ДНК цитомегаловірусу кількісне визначення (кров, ліквор, слина, зішкріб, сеча)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 19003
  },
  {
    "id": "official-246-005",
    "name": "ПЛР. Визначення ДНК цитомегаловірусу (СМV) якісне визначення (кров, зішкріб, сеча, ліквор, слина)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 19004
  },
  {
    "id": "official-246-006",
    "name": "Антитіла IgМ до вірусу герпесу 1 типу (HSV 1)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19005
  },
  {
    "id": "official-246-007",
    "name": "Антитіла IgG до вірусу герпесу 1 типу (HSV 1)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19006
  },
  {
    "id": "official-246-008",
    "name": "Антитіла IgМ до вірусу герпесу 2 типу (HSV 2)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19007
  },
  {
    "id": "official-246-009",
    "name": "Антитіла IgG до вірусу герпесу 2 типу (HSV 2)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19008
  },
  {
    "id": "official-246-010",
    "name": "Авідність антитіл IgG до вірусу герпесу 1 типу",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 19009
  },
  {
    "id": "official-246-011",
    "name": "Авідність антитіл IgG до вірусу герпесу 2 типу",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 19010
  },
  {
    "id": "official-246-012",
    "name": "Антитіла IgG до вірусу герпеса 1/2 (HSV 1/2)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19011
  },
  {
    "id": "official-246-013",
    "name": "Антитіла IgМ до вірусу герпеса 1/2 (HSV 1/2)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19012
  },
  {
    "id": "official-246-014",
    "name": "ПЛР. Вірусу герпесу 1/2 типу, якісне визначення (зішкріб)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 19013
  },
  {
    "id": "official-246-015",
    "name": "ПЛР. Вірус герпесу 1/2 типу, кількісне визначення (зішкріб, сеча)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 19014
  },
  {
    "id": "official-246-016",
    "name": "Антитіла IgМ до вірусу герпесу 3 типу (Varicella Zoster IgМ)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 19015
  },
  {
    "id": "official-246-017",
    "name": "Антитіла IgG до вірусу герпесу 3 типу (Varicella Zoster IgG)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 19016
  },
  {
    "id": "official-246-018",
    "name": "ПЛР Вірус Varicella Zoster (3 тип герпесу, VZV) (кров, урогенітальний зішкріб), якісно",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 19017
  },
  {
    "id": "official-246-019",
    "name": "Антитіла IgG до вірусу герпесу 6 типу",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 19018
  },
  {
    "id": "official-246-020",
    "name": "ПЛР. Визначення ДНК вірусу герпесу (HSV1 і HSV2), кількісно. Визначення і типування в режимі Real-time",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 19019
  },
  {
    "id": "official-246-021",
    "name": "ПЛР. Визначення ДНК вірусу герпесу 6 типу, кількісне визначення",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 19020
  },
  {
    "id": "official-246-022",
    "name": "ПЛР. Вірус герпесу 7 типу, якісно",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 19021
  },
  {
    "id": "official-246-023",
    "name": "Антитіла IgM до капсидного антигену вірусу Епштейна-Барр (VCA IgM)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19022
  },
  {
    "id": "official-246-024",
    "name": "Антитіла IgG до капсидного антигену вірусу Епштейна-Барр (VCA IgG)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19023
  },
  {
    "id": "official-246-025",
    "name": "ПЛР. Визначення ДНК вірусу Епштейна-Барр, якісне визначення (кров, ліквор, зішкріб, слина)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 19024
  },
  {
    "id": "official-246-026",
    "name": "ПЛР. Визначення ДНК вірусу Епштейна-Барр, кількісне визначення (кров, ліквор, зішкріб, слина)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 19025
  },
  {
    "id": "official-246-027",
    "name": "Антитіла IgG до нуклеарного антигену Епштейн-Барр (EBNA)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19026
  },
  {
    "id": "official-246-028",
    "name": "Антитіла IgM до токсоплазми (Toxo IgM)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19027
  },
  {
    "id": "official-246-029",
    "name": "Антитіла IgG до токсоплазми (Toxo IgG)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19028
  },
  {
    "id": "official-246-030",
    "name": "Авідність антитіл IgG до токсоплазми (Toxoplasma gondii)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 19029
  },
  {
    "id": "official-246-031",
    "name": "ПЛР. Визначення ДНК токсоплазми, якісне визначення (кров, зішкріб, ліквор)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 19030
  },
  {
    "id": "official-246-032",
    "name": "Антитіла IgG до вірусу краснухи (Rub IgG)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19031
  },
  {
    "id": "official-246-033",
    "name": "Антитіла IgМ до вірусу краснухи (Rub IgМ)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 19032
  },
  {
    "id": "official-246-034",
    "name": "Авідність антитіл IgG до вірусу краснухи (Rub IgG)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 19033
  },
  {
    "id": "official-247-001",
    "name": "Антитіла IgA до хламідій",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 20000
  },
  {
    "id": "official-247-002",
    "name": "Антитіла IgG до хламідій (Chlamydia trachomatis IgG)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 20001
  },
  {
    "id": "official-247-003",
    "name": "Антитіла IgМ до хламідій (Chlamydia trachomatis IgМ)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 20002
  },
  {
    "id": "official-247-004",
    "name": "ПЛР. Визначення ДНК до хламідії трахоматіс (Chlamydia trachomatis), якісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20003
  },
  {
    "id": "official-247-005",
    "name": "ПЛР. Визначення ДНК до хламідії трахоматіс (Chlamydia trachomatis), кількісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 20004
  },
  {
    "id": "official-247-006",
    "name": "Антитіла IgG до мікоплазма хомініс (Mycoplasma hominis)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 20005
  },
  {
    "id": "official-247-007",
    "name": "ПЛР. Визначення ДНК до мікоплазма хомініс (Mycoplasma hominis), якісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20006
  },
  {
    "id": "official-247-008",
    "name": "ПЛР. Визначення ДНК до мікоплазма хомініс (Mycoplasma hominis), кількісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 20007
  },
  {
    "id": "official-247-009",
    "name": "ПЛР. Визначення ДНК до мікоплазма геніталіум (Mycoplasma genitalium), якісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20008
  },
  {
    "id": "official-247-010",
    "name": "ПЛР. Визначення ДНК до мікоплазма геніталіум (Mycoplasma genitalium), кількісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 20009
  },
  {
    "id": "official-247-011",
    "name": "Антитіла IgG до Ureaplasma urealyticum",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 20010
  },
  {
    "id": "official-247-012",
    "name": "ПЛР. Визначення ДНК до уреаплазма спецієс (Ureaplasma species), якісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20011
  },
  {
    "id": "official-247-013",
    "name": "ПЛР. Визначення ДНК до уреаплазма спецієс (Ureaplasma species), кількісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 20012
  },
  {
    "id": "official-247-014",
    "name": "ПЛР. Визначення ДНК Ureaplasma urealyticum (Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20013
  },
  {
    "id": "official-247-015",
    "name": "ПЛР. Визначення ДНК Ureaplasma urealyticum (Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 20014
  },
  {
    "id": "official-247-016",
    "name": "ПЛР. Визначення ДНК Ureaplasma parvum (Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20015
  },
  {
    "id": "official-247-017",
    "name": "ПЛР. Визначення ДНК Ureaplasma parvum (Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 20016
  },
  {
    "id": "official-247-018",
    "name": "ПЛР. Визначення ДНК до уреаплазма уреалітікум та уреаплазми парвум (Ureaplasma paryum та Ureaplasma urealytycum). (Диференціація Real-time) якісно",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 20017
  },
  {
    "id": "official-247-019",
    "name": "ПЛР. Визначення ДНК Ureaplasma parvum та Ureaplasma urealyticum. (Диференціація Real-time) Кількісно",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 450,
    "aliases": [],
    "sortOrder": 20018
  },
  {
    "id": "official-247-020",
    "name": "ПЛР. Визначення ДНК до трихомонади (Trichomonas vaginalis), якісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20019
  },
  {
    "id": "official-247-021",
    "name": "IgG Trichomonas vaginalis",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 20020
  },
  {
    "id": "official-247-022",
    "name": "ПЛР.Визначення ДНК до трихомонади (Trichomonas vaginalis) (Зішкріб, сеча. Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 20021
  },
  {
    "id": "official-247-023",
    "name": "Сифіліс РМП (Реакція мікропрецептації з кардіоліпіновим антигеном - RW",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 20022
  },
  {
    "id": "official-247-024",
    "name": "Сумарні антитіла до сифiлiсу (Treponema Pallidum)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20023
  },
  {
    "id": "official-247-025",
    "name": "Визначення ДНК збуднику сифiлiсу (Tr. Pallidum, якісно)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 20024
  },
  {
    "id": "official-247-026",
    "name": "ПЛР.Визначення ДНК до гарднерели (Gardnerella vaginallis) (Зішкріб, сеча. Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20025
  },
  {
    "id": "official-247-027",
    "name": "ПЛР.Визначення ДНК до гарднерели (Gardnerella vaginallis) (Зішкріб, сеча. Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 20026
  },
  {
    "id": "official-247-028",
    "name": "ПЛР. Визначення ДНК до нейсерія гонорея (Neisseria gonorrhoeae) (Зішкріб, сеча. Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20027
  },
  {
    "id": "official-247-029",
    "name": "ПЛР. Визначення ДНК до нейсерія гонорея (Neisseria gonorrhoeae) (Зішкріб, сеча. Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 20028
  },
  {
    "id": "official-247-030",
    "name": "ПЛР.Визначення ДНК до кандіди альбіканс (Candida albicans ) (Зішкріб, сеча. Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 20029
  },
  {
    "id": "official-247-031",
    "name": "ПЛР.Визначення ДНК до кандіди альбіканс (Candida albicans ) (Зішкріб, сеча. Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 20030
  },
  {
    "id": "official-247-032",
    "name": "ПЛР. HPV 16/18 тип (Зішкріб, сеча. Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 20031
  },
  {
    "id": "official-247-033",
    "name": "ПЛР. HPV 16/18 тип (Зішкріб, сеча. Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 390,
    "aliases": [],
    "sortOrder": 20032
  },
  {
    "id": "official-247-034",
    "name": "ПЛР. HPV 6, 11 тип (Зішкріб, сеча. Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 20033
  },
  {
    "id": "official-247-035",
    "name": "ПЛР. Визначення ДНК вірусу папіломи людини (ВПЛ) 14 типів (16, 18, 31, 33, 35, 39, 45, 51, 52, 56, 58, 59, 66, 68 типів). Якісне визначення з генотипуванням",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1000,
    "aliases": [],
    "sortOrder": 20034
  },
  {
    "id": "official-247-036",
    "name": "ПЛР. Визначення ДНК папіломи людини (ВПЛ) Квант 21 кількісне з генотипуванням (6,11,44,16,18,26,31,33,35,39,45,51,52,53,56,58,59,66,68,73,82.)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 20035
  },
  {
    "id": "official-247-037",
    "name": "ПЛР. Визначення ДНК папіломи людини (ВПЛ) Квант 24 кількісне з генотипуванням (6,11,44,16,18,26,31,33,35,39,45,51,52,53,56,58,59,66,68,73,82, 43, 42, 81)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1600,
    "aliases": [],
    "sortOrder": 20036
  },
  {
    "id": "official-247-038",
    "name": "ПЛР. Визначення ДНК вірусу папіломи людини (ВПЛ) (14 типів - 16, 18, 31, 33, 35, 39, 45, 51, 52, 56, 58, 59, 66, 68) Кількісне визначення до типу в режимі Real-time",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 20037
  },
  {
    "id": "official-247-039",
    "name": "12 ІПСШ ( Mycoplasma hominis, Mycoplasma genitalium, Ureaplasma spp. (U.parvum, U.urealyticum), Candida albicans, Gardnerella vaginalis, Chlamydia trachomatis, Trichomonas vaginalis, Neisseria gonorrhoeae, ДНК цитомегаловірусу CMV, ДНК герпесвірусу HSV 1, 2., ВПЛ HPV 16 тип, ВПЛ HPV 18 тип.) Якісне визначення",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1650,
    "aliases": [],
    "sortOrder": 20038
  },
  {
    "id": "official-247-040",
    "name": "ПЛР. 8 ІПСШ (Mycoplasma hominis+genitalium, Ureaplasma spp.(U.parvum,U.uralyticum), Gardnerella vaginalis, Clamydia trachomatis, Trichomonas vaginalis, Neisseria gonorroeae)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1400,
    "aliases": [],
    "sortOrder": 20039
  },
  {
    "id": "official-247-041",
    "name": "Бактеріальний вагіноз молекулярна діагностика (7 показників) (Lactobacillus acidophilus, Gardnerella vaginalis, Atopobium vaginalis, Mobiluncus spp., Bacteroides fragilis, Megasphaera phylotype, Clostridium (BVAB2))",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1300,
    "aliases": [],
    "sortOrder": 20040
  },
  {
    "id": "official-247-042",
    "name": "Фемофлор (Жіночий біоценоз) (Загальна бактеріальна маса,Lactobacillus spp., Enterobacterium spp., Streptococcus spp.,Staphylococcus spp., Gardnerella vaginаlis/Porphyromonas spp., Prevotella bivia, Bacteroides fragilis, Sneathia spp./Leptotrihia spp./Fusobacterium spp., Megasphaera spp./Veilonella spp./Dialister spp.,Lachnobacterium spp./Clostridium spp.,Mobiluncus spp./Corynebacterium spp., Atopobium vaginale, Mycoplasma hominis, Mycoplasma genitalium, Ureaplasma urealyticum, Ureaplasma parvum, Chlamydia trachomatis, Trichomonas vaginalis, Neisseria gonorrhoeae, Candida spp., Candida albicans, Candida glabrata)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 2500,
    "aliases": [],
    "sortOrder": 20041
  },
  {
    "id": "official-247-043",
    "name": "Флороценоз (Lactobacillus spp., Gardnerella vaginalis, Atopodium vaginae, Enterobacter spp., Staphylococcus spp., Streptococcus spp., Ureaplasma parvum, Ureaplasma urealyticum, Mycoplasma hominis, Candida albicans, Candida spp., Candida glabrata, Candida krusei)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1700,
    "aliases": [],
    "sortOrder": 20042
  },
  {
    "id": "official-247-044",
    "name": "Біоценоз урогенільтального тракту (Фемофлор-скрін) (Lactobacterium, Gardnerella vaginalis, Mycoplasma hjminis, Mycoplasma genitalium, Ureaplasma urealyticum, Ureaplasma parvum, Candida spp., Trichomonas vaginalis, Neisseria gonorrhoeae, Chlamydia trahomatis)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 20043
  },
  {
    "id": "official-247-045",
    "name": "Урогенітальний для чоловіків. ПЛР Real-time якісний (Chlamydia trachomatis, Ureaplasma spp, Mycoplasma hominis, Mycoplasma genitalium, HSV 1, 2, CMV, Neisseria gonorroeae, Trichomonas vaginalis, Gardnerella vaginalis, Candida albicans)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1450,
    "aliases": [],
    "sortOrder": 20044
  },
  {
    "id": "official-247-046",
    "name": "Андрофлор (біоценоз чоловіків)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1800,
    "aliases": [],
    "sortOrder": 20045
  },
  {
    "id": "official-249-001",
    "name": "Загальний імуноглобулін E",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 290,
    "aliases": [],
    "sortOrder": 21000
  },
  {
    "id": "official-249-002",
    "name": "Еозинофільний катіонний білок (ЕКБ, ECP)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 480,
    "aliases": [],
    "sortOrder": 21001
  },
  {
    "id": "official-249-003",
    "name": "Респіраторна панель №2\" (бромелаїн (BR), пероксидаза хрону (НР), аскорбатоксидаза (АО), епітелій хом'ячка (е84), епітелій морської свинки (е6), епітелій кролика (е82), епітелій щура (е73), епітелій миші (е71), епітелій собаки (е2), епітелій кота (е1), латекс (k82), отрута оси (і3), отрута бджоли (і1), тарган (і6), Alternaria alternate (m6), Aspergillus fumigates (m3), Cladosporium herbatum (m2), Penicillium notatum (m1), борошняний кліщ (d70), кліщ пір'яний (d2), кліщ домашнього пилу (d1), полін звичайний (w6), амброзія полинолиста (w1), тимофіївка лугова (g6), платан лондонський (t11), кипарис вічнозелений (t23), олива європейська (t9), береза повисла (t3))",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 1350,
    "aliases": [],
    "sortOrder": 21002
  },
  {
    "id": "official-249-004",
    "name": "ХАРЧОВА ПАНЕЛЬ №3 Blot аналіз IgE 30 алергенів №1: Staphylococcus mix (Ентеротоксин, Ентеротоксин B, TSS-Токсин 1), арахіс, кокос, тріска, лосось, гречане борошно, вівсяне борошно, кукурудзяне борошно, морква, селера, яблуко, апельсин, яловичина , свинина, куряче м'ясо, картопля, пшеничне борошно, житнє борошно, помідор, болгарський перець, банан, яєчний білок, яєчний жовток, молоко, α-Lactoalbumine, бета-Lactoglobuline, казеїн, соя.",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 1350,
    "aliases": [],
    "sortOrder": 21003
  },
  {
    "id": "official-249-005",
    "name": "ПЕДІАТРИЧНА ПАНЕЛЬ №4. Blot аналіз IgE. 30 алергенів №1: Dermatophagoides pteronyssinus (Кліщ домашнього пилу), (Dermatophagoides farinae (Кліщ домашнього пилу), вільха, береза, ліщина, дуб, суміш трав, пилок жита, полин, подорожник, кішка, кінь, собака, морська свинка, Сирійський хом'як, кролик,Penicillium notatum (Пліснявий гриб), Cladosporium herbarum (Пліснявий гриб), Aspergillus fumigatus (Пліснявий гриб), Alternaria alternata (Пліснявий гриб), амброзія, тріска, краб, яєчний білок, молоко, арахіс, фундук, морква, пшеничне борошно, соєві боби.",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 1350,
    "aliases": [],
    "sortOrder": 21004
  },
  {
    "id": "official-249-006",
    "name": "Респіраторний профіль домашній (d205 алергокомпонент кліща домашнього пилу D.pter rDer p10, d202 алергокомпонент кліща домашнього пилу D.pter rDer p1 цистеін протеаза, d1 кліщ домашнього пилу D.pter, d2 кліщ пір'яний D. farinae, d70 борошняний кліщ Acarus siro, m1 Penicillium notatum, m2 Cladosporium herbatum, m3 Aspergillus fumigates, m5 Candida albicans, m229 алергокомпонент альтернарії rAlt a1, m6 Alternaria alternate, e227 алергокомпонент епітелію коня rEqu c1, ліпокалін, е3 епітелій коня, е226 алергокомпонент епітелію собаки rCan f5, аргінінестераза, е101 алергокомпонент епітелію собаки rCan f1, ліпокалін, е5 епітелій собаки, е94 алергокомпонент епітелію кота rFel d1, утероглобін, е1 епітелій кота, k82 латекс, і3 отрута оси, і1 отрута бджоли, і6 тарган)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 1350,
    "aliases": [],
    "sortOrder": 21005
  },
  {
    "id": "official-249-007",
    "name": "IgE специфічний до окремого алергену: (томати, молоко коров’яче, горіх волоський, м’ясо курки, банан, соя, рис, морква, яйце білок+жовток, собака, епітелій тварин скринінг (кіт, собака), амброзія, какао, яєчний білок, м’ясо свинини)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 350,
    "aliases": [],
    "sortOrder": 21006
  },
  {
    "id": "official-249-008",
    "name": "Артикаїн IgE, специфічний (ультракаїн, убістезин, септонест, артифрин)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 21007
  },
  {
    "id": "official-249-009",
    "name": "Лідокаїн IgE, специфічний",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 21008
  },
  {
    "id": "official-249-010",
    "name": "Лідокаїн IgE, специфічний (кількісно)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 21009
  },
  {
    "id": "official-249-011",
    "name": "Артикаїн IgE, специфічний, кількісний (ультракаїн, убістезин, септонест, артифрин)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 21010
  },
  {
    "id": "official-249-012",
    "name": "Мепівакаїн IgE, специфічний, кількісний",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 21011
  },
  {
    "id": "official-249-013",
    "name": "Бупівакаїн IgE, специфічний (лонгокаїн, маркаїн, новостезін)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 21012
  },
  {
    "id": "official-249-014",
    "name": "Еозинофільний катіонний білок ( ЕКБ, ЕСР)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 600,
    "aliases": [],
    "sortOrder": 21013
  },
  {
    "id": "official-250-001",
    "name": "ПЛР. Генетика Метаболізму Лактози (1 точка) (букальний зішкріб, кров)",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 680,
    "aliases": [],
    "sortOrder": 22000
  },
  {
    "id": "official-250-002",
    "name": "ПЛР. HLA B27 головний комплекс гістосумісності людини",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 990,
    "aliases": [],
    "sortOrder": 22001
  },
  {
    "id": "official-250-003",
    "name": "ПЛР. ОнкоГенетика BRCA 1 та BRCA 2 (8 показників)",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 2000,
    "aliases": [],
    "sortOrder": 22002
  },
  {
    "id": "official-250-004",
    "name": "ПЛР. КардіоГенетика Тромбофілія",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 22003
  },
  {
    "id": "official-250-005",
    "name": "ПЛР. Генетика Метаболізму Фолатів",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 22004
  },
  {
    "id": "official-250-006",
    "name": "Діагностика синдрому Жильбера (мутації в гені UGTIAI)",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 1990,
    "aliases": [],
    "sortOrder": 22005
  },
  {
    "id": "official-251-001",
    "name": "Бактеріальний урогенітальний скринінг (13 інфекцій: Mycoplasma hominis, Ureaplasma spp., Trichomonas vaginalis, Candida spp., Escherichia coli, Proteus spp., Pseudomonas spp., Gardnerella vaginalis, Staphylococcus aureus., Enterococcus spp., Neisseria spp., Streptococcus agalactiae) з чутливістю виявлених Mycoplasma homini, Ureaplasma spp. До антибіотиків та визначення концентрації в CFU/ml",
    "category": "culture",
    "categoryLabel": "Культуральні дослідження",
    "amount": 800,
    "aliases": [],
    "sortOrder": 23000
  },
  {
    "id": "official-252-001",
    "name": "Мікробіологічне дослідження біологічного матеріалу на грибкову флору з визначенням чутливості до протигрибкових препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24000
  },
  {
    "id": "official-252-002",
    "name": "Мікробіологічне дослідження біологічного матеріалу на стафілокок з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24001
  },
  {
    "id": "official-252-003",
    "name": "Мікробіологічне дослідження матеріалу на B-гемолітичний стрептокок",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24002
  },
  {
    "id": "official-252-004",
    "name": "Мікробіологічне дослідження урогенітальних виділень з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24003
  },
  {
    "id": "official-252-005",
    "name": "Мікробіологічне дослідження виділень із ока з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24004
  },
  {
    "id": "official-252-006",
    "name": "Мікробіологічне дослідження матеріалу із рани з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24005
  },
  {
    "id": "official-252-007",
    "name": "Мікробіологічне дослідження сечі з визначенням чутливості до антибактеріальних препаратів (Бак посів сечі)",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 24006
  },
  {
    "id": "official-252-008",
    "name": "Мікробіологічне дослідження харкотиння з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24007
  },
  {
    "id": "official-252-009",
    "name": "Мікробіологічне дослідження біологічного матеріалу на анаеробну флору з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24008
  },
  {
    "id": "official-252-010",
    "name": "Мікробіологічне дослідження крові на стерильність з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 580,
    "aliases": [],
    "sortOrder": 24009
  },
  {
    "id": "official-252-011",
    "name": "Мікробіологічне дослідження матеріалу із носу з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24010
  },
  {
    "id": "official-252-012",
    "name": "Мікробіологічне дослідження матеріалу із зіву з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24011
  },
  {
    "id": "official-252-013",
    "name": "Мікробіологічне дослідження матеріалу на дифтерію",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24012
  },
  {
    "id": "official-252-014",
    "name": "Мікробіологічне дослідження калу на дисгрупу, патогенна мікрофлора кишкової групи з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24013
  },
  {
    "id": "official-252-015",
    "name": "Аналіз калу на дисбактеріоз з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24014
  },
  {
    "id": "official-252-016",
    "name": "Мікробіологічне дослідження матеріала із вуха з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24015
  },
  {
    "id": "official-252-017",
    "name": "Мікробіологічне дослідження матеріалу грудного молока з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24016
  },
  {
    "id": "official-252-018",
    "name": "Мікробіологічне дослідження жовчі з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24017
  },
  {
    "id": "official-252-019",
    "name": "Мікробіологічне дослідження секрету простати з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24018
  },
  {
    "id": "official-252-020",
    "name": "Бакпосів еякуляту+антибіотикограма",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 24019
  },
  {
    "id": "official-252-021",
    "name": "Бакпосів урогенітальний дитячій",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24020
  },
  {
    "id": "official-252-022",
    "name": "Бакпосів синовіальної рідини + антибіотикограмма",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24021
  },
  {
    "id": "official-252-023",
    "name": "Бакпосів плевральної рідини + антибіотикограмма",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 24022
  },
  {
    "id": "official-252-024",
    "name": "Стрептококк групи В (швидкий тест)",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 450,
    "aliases": [],
    "sortOrder": 24023
  },
  {
    "id": "official-252-025",
    "name": "Стрептококк групи А (швидкий тест)",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 350,
    "aliases": [],
    "sortOrder": 24024
  },
  {
    "id": "official-253-001",
    "name": "Комплекс «Щитоподібна залоза» №1 (ТТГ, Т3 вільний, Т4 вільний)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 675,
    "aliases": [],
    "sortOrder": 25000
  },
  {
    "id": "official-253-002",
    "name": "Комплекс «Щитоподібна залоза» №2 (ТТГ, Т4 вільний, АТПО)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 720,
    "aliases": [],
    "sortOrder": 25001
  },
  {
    "id": "official-253-003",
    "name": "Комплекс «Щитоподібна залоза» №4 (ТТГ, Т4 вільний, Т3 вільний, АТПО, антитіла до рецепторів ТТГ)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1430,
    "aliases": [],
    "sortOrder": 25002
  },
  {
    "id": "official-253-004",
    "name": "Комплекс «Щитоподібна залоза» №6 (ТТГ, Т4 вільний, Т3 вільний, АТПО, ТГ, кальцитонін)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1610,
    "aliases": [],
    "sortOrder": 25003
  },
  {
    "id": "official-253-005",
    "name": "Комплекс \"Гормони щитоподібна залоза+пролактин\" (Тиреотропний гормон ТТГ, Т4 вільний, Т3 вільний, пролактин)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 935,
    "aliases": [
      "ТТГ",
      "TSH"
    ],
    "sortOrder": 25004
  },
  {
    "id": "official-253-006",
    "name": "Комплекс «Діабетичний» (Глікозильований гемоглобін, С-пептид, Інсулін+ Глюкоза+ Індекс НОМА)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 910,
    "aliases": [],
    "sortOrder": 25005
  },
  {
    "id": "official-253-007",
    "name": "Комплекс \"Хірургічний\" (ВІЛ, RW, HBsAg, НСV)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1045,
    "aliases": [],
    "sortOrder": 25006
  },
  {
    "id": "official-253-008",
    "name": "Комплекс \"Хірургічний мінімальний\" (ЗАК, група крові резус фактор, коагулограма, глюкоза, АЛТ, АСТ, білок загальний, білірубін загальний, сечовина, креатинін, РПМ, гепатит В, гепатит С, ВІЛ",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 2815,
    "aliases": [],
    "sortOrder": 25007
  },
  {
    "id": "official-253-009",
    "name": "Комплекс \"Хірургічний максимальний\" ЗАК, група крові резус фактор, коагулограма, глюкоза, АЛТ, АСТ, білок загальний, білірубін загальний, сечовина, креатинін, калій, натрій, хлор, РПМ, гепатит В, гепатит С, ВІЛ)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 3220,
    "aliases": [],
    "sortOrder": 25008
  },
  {
    "id": "official-253-010",
    "name": "Комплекс «Репродуктивне гормональне жіноче здоров’я» (ЛГ, ФСГ, пролактин, прогестерон, естрадіол)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1305,
    "aliases": [],
    "sortOrder": 25009
  },
  {
    "id": "official-253-011",
    "name": "Комплекс «Репродуктивне гормональне чоловіче здоров’я» (Прогестерон, пролактин, тестостерон загальний)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 785,
    "aliases": [],
    "sortOrder": 25010
  },
  {
    "id": "official-253-012",
    "name": "Комплекс \"І фаза менструального циклу 2-3 день\" (ЛГ, ФСГ, Пролактин, Прогестерон, Тестостерон загальний, Естрадіол)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1565,
    "aliases": [],
    "sortOrder": 25011
  },
  {
    "id": "official-253-013",
    "name": "Комплекс \"Гормони репродукції жінки І фаза менс.циклу\" (Прогестерон, естрадіол, пролактин, індекс вільного тестостерону, ДГЕА-С, 17-Оксипрогестерон, ТТГ, Т4вільний)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 2170,
    "aliases": [],
    "sortOrder": 25012
  },
  {
    "id": "official-253-014",
    "name": "Комплекс \"Гормони репродукції жінки ІІ фаза менс.циклу\" (прогестерон, естрадіол)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 520,
    "aliases": [],
    "sortOrder": 25013
  },
  {
    "id": "official-253-015",
    "name": "Комплекс \"Онкоскринінг для жінок\" (Тиреоглобулін, Раково-амбріональний антиген РЕА, Онкомаркер молочної залози СА 15-3, Онкомаркер підшлункової залози СА 19-9, Онкомаркер яєчників СА 125)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1325,
    "aliases": [],
    "sortOrder": 25014
  },
  {
    "id": "official-253-016",
    "name": "Комплекс \"Стрес-пакет\" (Пролактин, ТТГ, Магній, Т3в, Т4в, вітамін В12, вітамін D, фолієва кислота, Гомоцестеїн)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 2600,
    "aliases": [
      "вітамін Д"
    ],
    "sortOrder": 25015
  },
  {
    "id": "official-253-017",
    "name": "Комплекс №2 (Загальний аналіз крові (параметри аналізатора+ СОЕ), загальний аналіз сечі, глюкоза)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 520,
    "aliases": [],
    "sortOrder": 25016
  },
  {
    "id": "official-253-018",
    "name": "Комплекс «Антитіла до паразитів» (Антитіла IgG до: аскарид, токсокарів, лямблій, єхінококов, трихінел, описторхоз)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1620,
    "aliases": [],
    "sortOrder": 25017
  },
  {
    "id": "official-253-019",
    "name": "Комплекс «Метаболічний» (холестерин, тригліцериди, ЛПВЩ, ЛПНЩ, ЛПДНЩ, коефіцієнт атерогенності, глюкоза, глікозильований гемоглобін сечова кислота, загальний білок, інсулін, C-пептид)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1690,
    "aliases": [],
    "sortOrder": 25018
  },
  {
    "id": "official-253-020",
    "name": "Комплекс «Ліпідний» «Дослідження ліпідного обміну» (холестерин, тригліцериди, ЛПВЩ, ЛПНЩ, коефіцієнт атерогенності)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 530,
    "aliases": [],
    "sortOrder": 25019
  },
  {
    "id": "official-253-021",
    "name": "Комплекс ''Біохімічний'' №1 (Білірубін загальний, АЛТ, АСТ, креатинин, сечовина, загальний білок)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 755,
    "aliases": [],
    "sortOrder": 25020
  },
  {
    "id": "official-253-022",
    "name": "Комплекс «Біохімічний» №2 (АЛТ, АСТ, ЛФ, ГГТ, білірубін загальний, прямий+непрямий; загальний білок, креатинін, сечовина, глюкоза, амілаза панкреатична, альфа-амілаза, холестерин, тригліцериди, ЛПВЩ, ЛПНЩ, ЛПДНЩ)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 2060,
    "aliases": [],
    "sortOrder": 25021
  },
  {
    "id": "official-253-023",
    "name": "Комплекс \"Біохімічний стандартний\" (АЛТ, АСТ, Білірубін загальний+прямий+непрямий, креатитін, сечовина, глюкоза, білок загалий)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1010,
    "aliases": [],
    "sortOrder": 25022
  },
  {
    "id": "official-253-024",
    "name": "Комплекс «Печінкові проби» (АЛТ, АСТ, ЛФ, білірубін загальний,прямий+непрямий ГГТ,загальний білок)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 880,
    "aliases": [],
    "sortOrder": 25023
  },
  {
    "id": "official-253-025",
    "name": "Комплекс «Ниркові проби №1 (креатинін, сечовина, сечова кислота)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 380,
    "aliases": [],
    "sortOrder": 25024
  },
  {
    "id": "official-253-026",
    "name": "Комплекс «Ниркові проби №2» (креатинін, сечовина, білок загальний)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 380,
    "aliases": [],
    "sortOrder": 25025
  },
  {
    "id": "official-253-027",
    "name": "Комплекс «Ревмопроби» (С-реактивний білок, ревматоїдний фактор, антистрептолізин-О (кількісне визначення)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 485,
    "aliases": [],
    "sortOrder": 25026
  },
  {
    "id": "official-253-028",
    "name": "Комплекс «Ревматологічний» (ЗАК, ЗАС, сечова кислота, РФ та СРБ кількісні, Антитіла IgA до хламідії, AntiCCP)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1575,
    "aliases": [],
    "sortOrder": 25027
  },
  {
    "id": "official-253-029",
    "name": "Комплекс \"Рання діагностика ревматоїдного артриту\" (Антитіла до циклічного цітруліновому пептиду AntiCCP, С-реактивний білок СРБ, Ревматоїдний фактор РФ)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 820,
    "aliases": [],
    "sortOrder": 25028
  },
  {
    "id": "official-253-030",
    "name": "Комплекс \"Остеопороз мінімальний\" (Кальцій, Кальцій іонізовний, Фосфор, Паратгормон, вітамі D3)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1225,
    "aliases": [],
    "sortOrder": 25029
  },
  {
    "id": "official-253-031",
    "name": "Комплекс \"Остеопороз оптимальний\" (Кальцій, Кальцій іонізований, Фосфор, Паратгормон, вітамін D3, Лужна фосфотаза, Кальцитонін)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1755,
    "aliases": [
      "вітамін Д"
    ],
    "sortOrder": 25030
  },
  {
    "id": "official-253-032",
    "name": "Комплекс «Електроліти» (Калій, Натрій, Хлор, Фосфор, Кальцій іонізований)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 740,
    "aliases": [],
    "sortOrder": 25031
  },
  {
    "id": "official-253-033",
    "name": "Комплекс «Дефіцит вітаміну D» (vit D, Кальцій, Фосфор)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 755,
    "aliases": [],
    "sortOrder": 25032
  },
  {
    "id": "official-253-034",
    "name": "Комплекс ''Контроль анемії'' (залізо, Віт. В12, фолієва кислота, ЗАК, феритин, трансферин)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1510,
    "aliases": [
      "ферритин"
    ],
    "sortOrder": 25033
  },
  {
    "id": "official-253-035",
    "name": "Комплекс «Проблемна шкіра» (мінімальний) (ЗАК, глюкоза, АЛТ, АСТ, ТТГ, Естрадіол, Прогестерон, Мікроскопічне дослідження на демодекоз)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1555,
    "aliases": [],
    "sortOrder": 25034
  },
  {
    "id": "official-253-036",
    "name": "Комплекс «Проблемна шкіра» (оптимальний) (ЗАК, ДГЕА-С, 17-ОНПРГ, індекс вільного тестостерону, ТТГ, Глікований гемоглобін, Прогестерон, Естрадіол, Мікроскопічне дослідження на демодекоз)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 2375,
    "aliases": [],
    "sortOrder": 25035
  },
  {
    "id": "official-253-037",
    "name": "Комплекс «Проблемна шкіра» (максимальний) (ЗАК, Кальцій, АЛТ, АСТ, Лужна фосфатаза, Панкреатична амілаза, Ліпаза, Прогестерон, Естрадіол, Пролактин, ТТГ, Т4віл., індекс вільного тестостерону, ДГЕА-С, 17-ОНПРГ, вітамін D)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 3670,
    "aliases": [
      "вітамін Д"
    ],
    "sortOrder": 25036
  },
  {
    "id": "official-253-038",
    "name": "Комплекс “Covid-19” (Загальний розгорнутий аналiз крові, Д-димер, С-реактивний білок (кількісний)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 655,
    "aliases": [],
    "sortOrder": 25037
  },
  {
    "id": "official-253-039",
    "name": "Комплекс TORCH min (Антитіла IgG до вірусу краснухи, Антитіла IgG до цитомегаловірусу, Антитіла IgG до токсоплазми, Антитіла IgG до хламідій)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 950,
    "aliases": [],
    "sortOrder": 25038
  },
  {
    "id": "official-253-040",
    "name": "Комплекс TORCH mаx (Антитіла IgM+IgG до вірусу краснухи, Антитіла IgM+IgG до цитомегаловірусу, Антитіла IgM+IgG до токсоплазми, Антитіла IgM+IgG до хламідій)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1870,
    "aliases": [],
    "sortOrder": 25039
  },
  {
    "id": "official-253-041",
    "name": "Цервікальний скринінг (ПАП-тест на основі рідинної цитології, ДНК вірусів 21 типів (ВПЛ) 6,11,44,16,18,26,31,33,35,39,45,51,52,53,56,58,59,66,68,73,82 типів) Кількісно",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1865,
    "aliases": [],
    "sortOrder": 25040
  },
  {
    "id": "official-253-042",
    "name": "Цервікальний скринінг (ПАП-тест на основі рідинної цитології, ДНК вірусів 14 типів (ВПЛ) 16, 18, 31, 33, 35, 39, 45, 51, 52, 56, 58, 59, 66, 68) Кількісно",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 25041
  },
  {
    "id": "official-253-043",
    "name": "Цервікальний скринінг №2 (Рідинна цитологія+ Визначення ДНК вірусу папіломи людини КВАНТ 21 кількісно+ПЛР Mycoplasma genitalium, ПЛР Chlamidia trachomatis, ПЛР Trichomonas vaginalis, ПЛр Neisseria gonorrhoeae, ПЛР Candida albicans, ПЛР Gardnerella vaginalis, ПЛР Ureaplasma spp. якісно)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 3750,
    "aliases": [],
    "sortOrder": 25042
  },
  {
    "id": "official-253-044",
    "name": "Комплекс «Анестетики», кількісно (Артикаїн IgE (ультракаїн, убістезін, септонест, артифрин), Мепівакаїн IgE, Лідокаїн IgE)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1485,
    "aliases": [],
    "sortOrder": 25043
  },
  {
    "id": "official-253-045",
    "name": "Комплекс «Дефіцит Вітаміну D» (мінімально) (vitD3+кальцій)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 620,
    "aliases": [
      "вітамін Д"
    ],
    "sortOrder": 25044
  },
  {
    "id": "official-254-001",
    "name": "SARS Cov2 – спай білок",
    "category": "covid",
    "categoryLabel": "COVID-19",
    "amount": 280,
    "aliases": [],
    "sortOrder": 26000
  },
  {
    "id": "official-254-002",
    "name": "SARS-Cov-2 IgG",
    "category": "covid",
    "categoryLabel": "COVID-19",
    "amount": 270,
    "aliases": [],
    "sortOrder": 26001
  },
  {
    "id": "official-254-003",
    "name": "SARS-Cov-2 IgM",
    "category": "covid",
    "categoryLabel": "COVID-19",
    "amount": 270,
    "aliases": [],
    "sortOrder": 26002
  },
  {
    "id": "official-254-004",
    "name": "ПЛР SARS-Cov-2",
    "category": "covid",
    "categoryLabel": "COVID-19",
    "amount": 500,
    "aliases": [],
    "sortOrder": 26003
  },
  {
    "id": "official-254-005",
    "name": "Визначення антигена вірусу SARS-Cov-2 (COVID-19) (швидкий тест)",
    "category": "covid",
    "categoryLabel": "COVID-19",
    "amount": 250,
    "aliases": [],
    "sortOrder": 26004
  },
  {
    "id": "official-255-001",
    "name": "Забір крові до транспортної пробірки єврозразку",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 70,
    "aliases": [],
    "sortOrder": 27000
  },
  {
    "id": "official-255-002",
    "name": "Забір крові у дітей (до 14 років)",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 70,
    "aliases": [],
    "sortOrder": 27001
  },
  {
    "id": "official-255-003",
    "name": "Забір біологічного матеріалу для бактеріологічного дослідження",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 70,
    "aliases": [],
    "sortOrder": 27002
  },
  {
    "id": "official-255-004",
    "name": "Забір сечі для бактеріологічного дослідження сечі",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 70,
    "aliases": [],
    "sortOrder": 27003
  },
  {
    "id": "official-255-005",
    "name": "Забір біоматеріалу до тр.контейрнеру Salivette",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 70,
    "aliases": [],
    "sortOrder": 27004
  },
  {
    "id": "official-255-006",
    "name": "Забір крові до додаткової системи",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 10,
    "aliases": [],
    "sortOrder": 27005
  },
  {
    "id": "official-255-007",
    "name": "Забір сечі до транспортного стаканчику",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 20,
    "aliases": [],
    "sortOrder": 27006
  },
  {
    "id": "official-255-008",
    "name": "Забір бактеріологічного дослідження у додаткову пробірку",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 20,
    "aliases": [],
    "sortOrder": 27007
  },
  {
    "id": "official-255-009",
    "name": "Забір матеріалу до епіндорфу для ПЛР дослідження",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 30,
    "aliases": [],
    "sortOrder": 27008
  },
  {
    "id": "official-255-010",
    "name": "Термінове виконання 1-2 дослідженнь (від 2,5 годин)",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 200,
    "aliases": [],
    "sortOrder": 27009
  },
  {
    "id": "official-255-011",
    "name": "Термінове виконання наступних дослідженнь (від 2,5 годин)",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 50,
    "aliases": [],
    "sortOrder": 27010
  },
  {
    "id": "official-255-012",
    "name": "Забір зразків з урогенітального тракту",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 100,
    "aliases": [],
    "sortOrder": 27011
  },
  {
    "id": "official-255-013",
    "name": "Взяття зразків з урогенітального тракту для рідинної цитології",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 100,
    "aliases": [],
    "sortOrder": 27012
  },
  {
    "id": "official-255-014",
    "name": "Видача результатів з архіву",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 50,
    "aliases": [],
    "sortOrder": 27013
  },
  {
    "id": "official-255-015",
    "name": "Забір лейкоцитарної формули на скло",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 10,
    "aliases": [],
    "sortOrder": 27014
  },
  {
    "id": "official-255-016",
    "name": "Забір крові на дому (м. Рівне)",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 350,
    "aliases": [],
    "sortOrder": 27015
  },
  {
    "id": "official-255-017",
    "name": "Забір матеріалу на дому (передмістя Рівного до 20км)",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 500,
    "aliases": [],
    "sortOrder": 27016
  },
  {
    "id": "official-256-001",
    "name": "Трихоскопія",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 400,
    "aliases": [],
    "sortOrder": 28000
  },
  {
    "id": "official-256-002",
    "name": "Дермотоскопія до 5-ти новоутворень",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 350,
    "aliases": [],
    "sortOrder": 28001
  },
  {
    "id": "official-256-003",
    "name": "Дермотоскопія кожного наступного новоутворення",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 100,
    "aliases": [],
    "sortOrder": 28002
  },
  {
    "id": "official-256-004",
    "name": "Видалення новоутворень (електрокоагуляція) одного новоутворення",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 300,
    "aliases": [],
    "sortOrder": 28003
  },
  {
    "id": "official-256-005",
    "name": "Видалення новоутворень (електрокоагуляція) 2-3 новоутворень",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 28004
  },
  {
    "id": "official-256-006",
    "name": "Видалення новоутворень (електрокоагуляція) 5-10 новоутворень",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 900,
    "aliases": [],
    "sortOrder": 28005
  },
  {
    "id": "official-256-007",
    "name": "Видалення рідким азотом 1 елемент",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 300,
    "aliases": [],
    "sortOrder": 28006
  },
  {
    "id": "official-256-008",
    "name": "Видалення рідким азотом 2 елементи",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 28007
  },
  {
    "id": "official-256-009",
    "name": "Видалення рідким азотом 3 елементи",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 600,
    "aliases": [],
    "sortOrder": 28008
  },
  {
    "id": "official-256-010",
    "name": "Видалення новоутворень шкіри (радіохвильовий метод) Перше новоутворення (папілом, невусів, «бородавок»)",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 28009
  },
  {
    "id": "official-256-011",
    "name": "Видалення новоутворень (радіохвильовий метод) кожні наступні видалення (папіломи, невуси та ін.)",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 300,
    "aliases": [],
    "sortOrder": 28010
  },
  {
    "id": "official-256-012",
    "name": "Місцеве знеболення",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 400,
    "aliases": [],
    "sortOrder": 28011
  },
  {
    "id": "official-256-013",
    "name": "Радіохвильова діатермокоагуляція ерозії шийки матки",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 2800,
    "aliases": [],
    "sortOrder": 28012
  },
  {
    "id": "official-256-014",
    "name": "Видалення внутрішньоматкової спіралі",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 1000,
    "aliases": [],
    "sortOrder": 28013
  },
  {
    "id": "official-256-015",
    "name": "Кольпоскопія",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 28014
  },
  {
    "id": "official-256-016",
    "name": "Проведення пайпель біопсії",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 1600,
    "aliases": [],
    "sortOrder": 28015
  },
  {
    "id": "official-256-017",
    "name": "Аудіометрія",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 28016
  },
  {
    "id": "official-256-018",
    "name": "Первинна консультація",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 700,
    "aliases": [],
    "sortOrder": 28017
  },
  {
    "id": "official-256-019",
    "name": "Вторинна консультація",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 28018
  },
  {
    "id": "official-256-020",
    "name": "Прокол вушок",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 600,
    "aliases": [],
    "sortOrder": 28019
  },
  {
    "id": "official-257-001",
    "name": "Сумарні антитіла до лямблій (Giardia liamblia)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 29000
  },
  {
    "id": "official-257-002",
    "name": "Антитіла IgG до токсокарів",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 29001
  },
  {
    "id": "official-257-003",
    "name": "Антитіла IgG до аскарид",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 29002
  },
  {
    "id": "official-257-004",
    "name": "Антитіла IgG до опісторхів",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 29003
  },
  {
    "id": "official-257-005",
    "name": "Антитіла IgG до трихінел",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 29004
  },
  {
    "id": "official-257-006",
    "name": "Антитіла IgG до ехінококів",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 29005
  },
  {
    "id": "official-257-007",
    "name": "Ієрсіниоз (Yersinia enterocolitica), антитіла IgA",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 550,
    "aliases": [],
    "sortOrder": 29006
  },
  {
    "id": "official-257-008",
    "name": "Ієрсіниоз (Yersinia enterocolitica), антитіла IgG",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 550,
    "aliases": [],
    "sortOrder": 29007
  },
  {
    "id": "official-257-009",
    "name": "Ієрсіниоз (Yersinia enterocolitica), антитіла IgA, методом Western Blot",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 1150,
    "aliases": [],
    "sortOrder": 29008
  },
  {
    "id": "official-257-010",
    "name": "Ієрсіниоз (Yersinia enterocolitica), антитіла IgG, методом Western Blot",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 1150,
    "aliases": [],
    "sortOrder": 29009
  },
  {
    "id": "official-257-011",
    "name": "Загальні антитіла до мікобактерій туберкульозу (Mycobacterium tuberculosis)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 290,
    "aliases": [],
    "sortOrder": 29010
  },
  {
    "id": "official-257-012",
    "name": "ПЛР. Визначення ДНК до мікобактерій туберкульозу (Mycobacterium tuberculosis) ( якісне визначення)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 450,
    "aliases": [],
    "sortOrder": 29011
  },
  {
    "id": "official-257-013",
    "name": "Квантіфероновий тест (діагностика латентного туберкульозу)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 29012
  },
  {
    "id": "official-257-014",
    "name": "Антитіла IgM до мікоплазма пневмонії (Mycoplasma pneumoniae)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [],
    "sortOrder": 29013
  },
  {
    "id": "official-257-015",
    "name": "Антитіла IgG до мікоплазма пневмонії (Mycoplasma pneumoniae)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [],
    "sortOrder": 29014
  },
  {
    "id": "official-257-016",
    "name": "Антитіла IgG до хламідія пневмонії (Chlamydia pneumoniae)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [],
    "sortOrder": 29015
  },
  {
    "id": "official-257-017",
    "name": "Антитіла IgM до хламідія пневмонії (Chlamydia pneumoniae)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [],
    "sortOrder": 29016
  },
  {
    "id": "official-257-018",
    "name": "Антитіла IgМ до збуднику хвороби Лайма (Borrelia Burgdorferi)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 29017
  },
  {
    "id": "official-257-019",
    "name": "Антитіла IgG до збуднику хвороби Лайма (Borrelia Burgdorferi)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 29018
  },
  {
    "id": "official-257-020",
    "name": "Визначення ДНК Боррелій (Borrelia Burgdorferi) (кров/кліщ)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 500,
    "aliases": [],
    "sortOrder": 29019
  },
  {
    "id": "official-257-021",
    "name": "Борелія Імуноблот IgM",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 29020
  },
  {
    "id": "official-257-022",
    "name": "Борелія Імуноблот IgG",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 29021
  },
  {
    "id": "official-257-023",
    "name": "Антитіла IgG до кашлюка (Bordetella pertussis)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 29022
  },
  {
    "id": "official-257-024",
    "name": "Антитіла IgМ до кашлюка (Bordetella pertussis)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 29023
  },
  {
    "id": "official-257-025",
    "name": "ПЛР. Bordetella MULTI (зішкріб ротоглотки)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 550,
    "aliases": [],
    "sortOrder": 29024
  },
  {
    "id": "official-257-026",
    "name": "Антитіла IgМ до вірусу кору (Measles viruses)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 29025
  },
  {
    "id": "official-257-027",
    "name": "Антитіла IgG до вірусу кору (Measles viruses)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 29026
  },
  {
    "id": "official-257-028",
    "name": "Антитіла IgG до вірусу дифтерії",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 29027
  },
  {
    "id": "official-257-029",
    "name": "ПЛР. Brucella abortus bovis",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 29028
  },
  {
    "id": "official-257-030",
    "name": "Антитіла IgG до хелікобактеру пілорі (Helicobacter pylori)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [
      "хелікобактер"
    ],
    "sortOrder": 29029
  },
  {
    "id": "official-257-031",
    "name": "Антитіла IgМ до хелікобактеру пілорі (Helicobacter pylori)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [
      "хелікобактер"
    ],
    "sortOrder": 29030
  },
  {
    "id": "official-257-032",
    "name": "Сумарні антитіла до хелікобактеру пілорі (Helicobacter pylori)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [
      "хелікобактер"
    ],
    "sortOrder": 29031
  },
  {
    "id": "official-257-033",
    "name": "Helicobacter pylori Ag (кал)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 420,
    "aliases": [
      "хелікобактер"
    ],
    "sortOrder": 29032
  },
  {
    "id": "official-258-001",
    "name": "МРТ головного мозку без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3250,
    "aliases": [],
    "sortOrder": 30000
  },
  {
    "id": "official-258-002",
    "name": "МРТ головного мозку з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 30001
  },
  {
    "id": "official-258-003",
    "name": "МРТ головного мозку + МР-ангіографія (артерії головного мозку) без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4400,
    "aliases": [],
    "sortOrder": 30002
  },
  {
    "id": "official-258-004",
    "name": "МРТ головного мозку + МР-ангіографія (артерії головного мозку) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5800,
    "aliases": [],
    "sortOrder": 30003
  },
  {
    "id": "official-258-005",
    "name": "МРТ головного мозку + МР-ангіографія (артерії та вени головного мозку) без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5200,
    "aliases": [],
    "sortOrder": 30004
  },
  {
    "id": "official-258-006",
    "name": "МРТ головного мозку + МР-ангіографія (артерії та вени головного мозку) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7800,
    "aliases": [],
    "sortOrder": 30005
  },
  {
    "id": "official-258-007",
    "name": "МРТ головного мозку + артерії голови та шиї без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5500,
    "aliases": [],
    "sortOrder": 30006
  },
  {
    "id": "official-258-008",
    "name": "МРТ головного мозку + артерії голови та шиї з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7800,
    "aliases": [],
    "sortOrder": 30007
  },
  {
    "id": "official-258-009",
    "name": "МРТ артерій голови та шиї без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3700,
    "aliases": [],
    "sortOrder": 30008
  },
  {
    "id": "official-258-010",
    "name": "МРТ артерій та вен головного мозку + артерії шиї без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4400,
    "aliases": [],
    "sortOrder": 30009
  },
  {
    "id": "official-258-011",
    "name": "МРТ головного мозку (діагностика епілепсії)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5100,
    "aliases": [],
    "sortOrder": 30010
  },
  {
    "id": "official-258-012",
    "name": "МРТ головного мозку (діагностика епілепсії) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7700,
    "aliases": [],
    "sortOrder": 30011
  },
  {
    "id": "official-258-013",
    "name": "МРТ гіпофіза без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3200,
    "aliases": [],
    "sortOrder": 30012
  },
  {
    "id": "official-258-014",
    "name": "МРТ гіпофіза з динамічним контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 30013
  },
  {
    "id": "official-258-015",
    "name": "МРТ внутрішнього вуха та мосто-мозочкового кута без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3250,
    "aliases": [],
    "sortOrder": 30014
  },
  {
    "id": "official-258-016",
    "name": "МРТ внутрішнього вуха та мосто-мозочкового кута з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 30015
  },
  {
    "id": "official-258-017",
    "name": "МРТ орбіт без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3250,
    "aliases": [],
    "sortOrder": 30016
  },
  {
    "id": "official-258-018",
    "name": "МРТ орбіт з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 30017
  },
  {
    "id": "official-258-019",
    "name": "МРТ головного мозку та гіпофіза без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4900,
    "aliases": [],
    "sortOrder": 30018
  },
  {
    "id": "official-258-020",
    "name": "МРТ головного мозку та гіпофіза з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7100,
    "aliases": [],
    "sortOrder": 30019
  },
  {
    "id": "official-258-021",
    "name": "МРТ головного мозку та внутрішнього вуха й мосто-мозочкового кута без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4900,
    "aliases": [],
    "sortOrder": 30020
  },
  {
    "id": "official-258-022",
    "name": "МРТ головного мозку та внутрішнього вуха й мосто-мозочкового кута з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6900,
    "aliases": [],
    "sortOrder": 30021
  },
  {
    "id": "official-258-023",
    "name": "МРТ головного мозку та орбіт, зорових нервів без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5050,
    "aliases": [],
    "sortOrder": 30022
  },
  {
    "id": "official-258-024",
    "name": "МРТ головного мозку та орбіт, зорових нервів з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7750,
    "aliases": [],
    "sortOrder": 30023
  },
  {
    "id": "official-258-025",
    "name": "МРТ головного мозку та навколоносових пазух, порожнини носа без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5700,
    "aliases": [],
    "sortOrder": 30024
  },
  {
    "id": "official-258-026",
    "name": "МРТ головного мозку та навколоносових пазух, порожнини носа з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7750,
    "aliases": [],
    "sortOrder": 30025
  },
  {
    "id": "official-258-027",
    "name": "МРТ головного мозку нейроонкологічний протокол (головний мозок + МР-перфузія + спектроскопія) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6300,
    "aliases": [],
    "sortOrder": 30026
  },
  {
    "id": "official-258-028",
    "name": "МРТ головного мозку, спинного мозку та хребта за нейроонкологічним протоколом з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 12200,
    "aliases": [],
    "sortOrder": 30027
  },
  {
    "id": "official-258-029",
    "name": "МРТ головного мозку при розсіяному склерозі та інших демієлінізуючих захворюваннях нервової системи (з внутрішньовенним контрастуванням)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5500,
    "aliases": [],
    "sortOrder": 30028
  },
  {
    "id": "official-258-030",
    "name": "МРТ порожнини носа та навколоносових пазух без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3250,
    "aliases": [],
    "sortOrder": 30029
  },
  {
    "id": "official-258-031",
    "name": "МРТ порожнини носа та навколоносових пазух з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5150,
    "aliases": [],
    "sortOrder": 30030
  },
  {
    "id": "official-258-032",
    "name": "МРТ м'яких тканин щелепно-лицевої області без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 30031
  },
  {
    "id": "official-258-033",
    "name": "МРТ м'яких тканин щелепно-лицевої області з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6600,
    "aliases": [],
    "sortOrder": 30032
  },
  {
    "id": "official-258-034",
    "name": "МРТ м'яких тканин шиї та щелепно-лицевої області без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4400,
    "aliases": [],
    "sortOrder": 30033
  },
  {
    "id": "official-258-035",
    "name": "МРТ м'яких тканин шиї та щелепно-лицевої області з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6900,
    "aliases": [],
    "sortOrder": 30034
  },
  {
    "id": "official-258-036",
    "name": "МРТ м'яких тканин шиї без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5150,
    "aliases": [],
    "sortOrder": 30035
  },
  {
    "id": "official-258-037",
    "name": "МРТ мʼяких тканин голови та шиї без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6000,
    "aliases": [],
    "sortOrder": 30036
  },
  {
    "id": "official-258-038",
    "name": "МРТ мʼяких тканин голови та шиї з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6900,
    "aliases": [],
    "sortOrder": 30037
  },
  {
    "id": "official-258-039",
    "name": "МРТ м'яких тканин шиї з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7750,
    "aliases": [],
    "sortOrder": 30038
  },
  {
    "id": "official-258-040",
    "name": "МРТ шийного відділу хребта",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 30039
  },
  {
    "id": "official-258-041",
    "name": "МРТ шийного відділу хребта з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 30040
  },
  {
    "id": "official-258-042",
    "name": "МРТ шийного відділу хребта + МР-ангіографія (артерії шиї, виключення диссекції)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5100,
    "aliases": [],
    "sortOrder": 30041
  },
  {
    "id": "official-258-043",
    "name": "МРТ грудного відділу хребта",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 30042
  },
  {
    "id": "official-258-044",
    "name": "МРТ грудного відділу хребта з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 30043
  },
  {
    "id": "official-258-045",
    "name": "МРТ поперекового відділу хребта",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 30044
  },
  {
    "id": "official-258-046",
    "name": "МРТ поперекового відділу хребта з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 30045
  },
  {
    "id": "official-258-047",
    "name": "МРТ крижової кістки без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 30046
  },
  {
    "id": "official-258-048",
    "name": "МРТ крижової кістки з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 30047
  },
  {
    "id": "official-258-049",
    "name": "МРТ куприка без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 30048
  },
  {
    "id": "official-258-050",
    "name": "МРТ крижів та куприка без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3350,
    "aliases": [],
    "sortOrder": 30049
  },
  {
    "id": "official-258-051",
    "name": "МРТ крижів та куприка з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5600,
    "aliases": [],
    "sortOrder": 30050
  },
  {
    "id": "official-258-052",
    "name": "МРТ куприка з контрастуванням (пілонідальна кіста)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5900,
    "aliases": [],
    "sortOrder": 30051
  },
  {
    "id": "official-258-053",
    "name": "МРТ крижово-клубових сполучень без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 30052
  },
  {
    "id": "official-258-054",
    "name": "МРТ крижово-клубових сполучень з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 30053
  },
  {
    "id": "official-258-055",
    "name": "МРТ скринінг хребта (шийний, грудний, попереково-крижовий відділи хребта в сагітальній проекції з використанням Т1, Т2, Т2fs послідовностей)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4500,
    "aliases": [],
    "sortOrder": 30054
  },
  {
    "id": "official-258-056",
    "name": "МРТ шийного, грудного та поперекового відділів хребта без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7300,
    "aliases": [],
    "sortOrder": 30055
  },
  {
    "id": "official-258-057",
    "name": "МРТ шийного, грудного та поперекового відділів хребта з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 9300,
    "aliases": [],
    "sortOrder": 30056
  },
  {
    "id": "official-258-058",
    "name": "МРТ ревматологічний скринінг хребта та крижово-клубових сполучень",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 30057
  },
  {
    "id": "official-258-059",
    "name": "МРТ одного відділу хребта при сколіозі 3-4 ступеню",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3900,
    "aliases": [],
    "sortOrder": 30058
  },
  {
    "id": "official-258-060",
    "name": "МРТ скронево-нижньощелепних суглобів без капи або з капою + в динаміці",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6500,
    "aliases": [],
    "sortOrder": 30059
  },
  {
    "id": "official-258-061",
    "name": "МРТ скронево-нижньощелепних суглобів без капи та з капою + в динаміці",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6700,
    "aliases": [],
    "sortOrder": 30060
  },
  {
    "id": "official-258-062",
    "name": "МРТ обох кульшових суглобів",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3900,
    "aliases": [],
    "sortOrder": 30061
  },
  {
    "id": "official-258-063",
    "name": "МРТ обох кульшових суглобів з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5400,
    "aliases": [],
    "sortOrder": 30062
  },
  {
    "id": "official-258-064",
    "name": "МРТ одного колінного суглоба",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3250,
    "aliases": [],
    "sortOrder": 30063
  },
  {
    "id": "official-258-065",
    "name": "МРТ колінного суглоба з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5300,
    "aliases": [],
    "sortOrder": 30064
  },
  {
    "id": "official-258-066",
    "name": "МРТ одного гомілковостопного суглоба та проксимального відділу стопи",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3900,
    "aliases": [],
    "sortOrder": 30065
  },
  {
    "id": "official-258-067",
    "name": "МРТ гомілковостопного суглоба та проксимального відділу стопи з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5700,
    "aliases": [],
    "sortOrder": 30066
  },
  {
    "id": "official-258-068",
    "name": "МРТ однієї стопи (плесна та фаланги)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3900,
    "aliases": [],
    "sortOrder": 30067
  },
  {
    "id": "official-258-069",
    "name": "МРТ стопи (плесна та фаланги) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5300,
    "aliases": [],
    "sortOrder": 30068
  },
  {
    "id": "official-258-070",
    "name": "МРТ грудинно-ключичних сполучень",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4500,
    "aliases": [],
    "sortOrder": 30069
  },
  {
    "id": "official-258-071",
    "name": "МРТ одного плечового суглоба",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3350,
    "aliases": [],
    "sortOrder": 30070
  },
  {
    "id": "official-258-072",
    "name": "МРТ плечового суглоба з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 30071
  },
  {
    "id": "official-258-073",
    "name": "МРТ одного ліктьового суглоба",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3900,
    "aliases": [],
    "sortOrder": 30072
  },
  {
    "id": "official-258-074",
    "name": "МРТ ліктьового суглоба з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5300,
    "aliases": [],
    "sortOrder": 30073
  },
  {
    "id": "official-258-075",
    "name": "МРТ одного променево-зап’ясткового суглоба та проксимального відділу кисті",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3900,
    "aliases": [],
    "sortOrder": 30074
  },
  {
    "id": "official-258-076",
    "name": "МРТ променево-зап’ясткового суглоба та проксимального відділу кисті з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5300,
    "aliases": [],
    "sortOrder": 30075
  },
  {
    "id": "official-258-077",
    "name": "МРТ однієї кисті (п'ясток та фаланги)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3900,
    "aliases": [],
    "sortOrder": 30076
  },
  {
    "id": "official-258-078",
    "name": "МРТ кисті (п'ясток та фаланги) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5300,
    "aliases": [],
    "sortOrder": 30077
  },
  {
    "id": "official-258-079",
    "name": "МРТ великого пальця кисті",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3300,
    "aliases": [],
    "sortOrder": 30078
  },
  {
    "id": "official-258-080",
    "name": "МРТ гомілки без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5150,
    "aliases": [],
    "sortOrder": 30079
  },
  {
    "id": "official-258-081",
    "name": "МРТ гомілки з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7750,
    "aliases": [],
    "sortOrder": 30080
  },
  {
    "id": "official-258-082",
    "name": "МРТ стегна без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5150,
    "aliases": [],
    "sortOrder": 30081
  },
  {
    "id": "official-258-083",
    "name": "МРТ стегна з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7750,
    "aliases": [],
    "sortOrder": 30082
  },
  {
    "id": "official-258-084",
    "name": "МРТ жовчовивідних протоків (безконтрастна холангіопанкреатографія)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3200,
    "aliases": [],
    "sortOrder": 30083
  },
  {
    "id": "official-258-085",
    "name": "МРТ черевної порожнини (печінка, селезінка, підшлункова залоза) + МРХПГ",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [],
    "sortOrder": 30084
  },
  {
    "id": "official-258-086",
    "name": "МРТ черевної порожнини (печінка, селезінка, підшлункова залоза) з контрастуванням + МРХПГ",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [],
    "sortOrder": 30085
  },
  {
    "id": "official-258-087",
    "name": "МРТ черевної порожнини та заочеревинного простору (печінка, селезінка, підшлункова залоза, нирки, наднирники) + МРХПГ",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [],
    "sortOrder": 30086
  },
  {
    "id": "official-258-088",
    "name": "МРТ черевної порожнини та заочеревинного простору (печінка, селезінка, підшлункова залоза, нирки, наднирники) з контрастуванням + МРХПГ",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [],
    "sortOrder": 30087
  },
  {
    "id": "official-258-089",
    "name": "МРТ черевної порожнини з контрастуванням (пухлина жовчих протоків) + МРХПГ",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8500,
    "aliases": [],
    "sortOrder": 30088
  },
  {
    "id": "official-258-090",
    "name": "МРТ печінки з гепатотропним контрастним препаратом",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 10200,
    "aliases": [],
    "sortOrder": 30089
  },
  {
    "id": "official-258-091",
    "name": "МРТ стеатометрія",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 30090
  },
  {
    "id": "official-258-092",
    "name": "МРТ ентерографія",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8300,
    "aliases": [],
    "sortOrder": 30091
  },
  {
    "id": "official-258-093",
    "name": "МРТ ОЧП та ОМТ з одноразовим введенням контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 13000,
    "aliases": [],
    "sortOrder": 30092
  },
  {
    "id": "official-258-094",
    "name": "МРТ заочеревинного простору (нирки, наднирники)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [],
    "sortOrder": 30093
  },
  {
    "id": "official-258-095",
    "name": "МРТ заочеревинного простору (нирки, наднирники) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [],
    "sortOrder": 30094
  },
  {
    "id": "official-258-096",
    "name": "МРТ малого таза (пряма кишка, анальний канал)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [],
    "sortOrder": 30095
  },
  {
    "id": "official-258-097",
    "name": "МРТ малого таза (сечовий міхур)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4900,
    "aliases": [],
    "sortOrder": 30096
  },
  {
    "id": "official-258-098",
    "name": "МРТ малого таза (сечовий міхур) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7500,
    "aliases": [],
    "sortOrder": 30097
  },
  {
    "id": "official-258-099",
    "name": "МРТ малого таза (пряма кишка, анальний канал) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [],
    "sortOrder": 30098
  },
  {
    "id": "official-258-100",
    "name": "МРТ малого таза у жінок (матка, яєчники)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [],
    "sortOrder": 30099
  },
  {
    "id": "official-258-101",
    "name": "МРТ малого таза у жінок (матка, яєчники) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [],
    "sortOrder": 30100
  },
  {
    "id": "official-258-102",
    "name": "МРТ малого таза у чоловіків (передміхурова залоза + кістки таза)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [],
    "sortOrder": 30101
  },
  {
    "id": "official-258-103",
    "name": "МРТ малого таза у чоловіків (передміхурова залоза + кістки таза) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [],
    "sortOrder": 30102
  },
  {
    "id": "official-258-104",
    "name": "МРТ мультипланарне дослідження передміхуровой залози перед Fusion біопсією",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 2300,
    "aliases": [],
    "sortOrder": 30103
  },
  {
    "id": "official-258-105",
    "name": "МРТ калитки, яєчок та статевого члена з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7500,
    "aliases": [],
    "sortOrder": 30104
  },
  {
    "id": "official-258-106",
    "name": "МРТ калитки, яєчок та статевого члена",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4900,
    "aliases": [],
    "sortOrder": 30105
  },
  {
    "id": "official-258-107",
    "name": "МРТ однієї анатомічної зони без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5150,
    "aliases": [],
    "sortOrder": 30106
  },
  {
    "id": "official-258-108",
    "name": "МРТ однієї анатомічної зони з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7750,
    "aliases": [],
    "sortOrder": 30107
  },
  {
    "id": "official-258-109",
    "name": "МРТ одного сегменту спинного мозку з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5100,
    "aliases": [],
    "sortOrder": 30108
  },
  {
    "id": "official-258-110",
    "name": "МРТ спинного мозку без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 30109
  },
  {
    "id": "official-258-111",
    "name": "МРТ спинного мозку з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 9500,
    "aliases": [],
    "sortOrder": 30110
  },
  {
    "id": "official-258-112",
    "name": "МРТ двох ділянок (головний мозок, шийний або грудний відділ спинного мозку) при РС та інших демієлінізуючих захворюваннях",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7600,
    "aliases": [],
    "sortOrder": 30111
  },
  {
    "id": "official-258-113",
    "name": "МРТ трьох ділянок (головний мозок + шийний + грудний відділи спинного мозку) з контрастуванням при РС та інших демієлінізуючих захворюваннях",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 9800,
    "aliases": [],
    "sortOrder": 30112
  },
  {
    "id": "official-258-114",
    "name": "МРТ дифузія всього тіла без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 13500,
    "aliases": [],
    "sortOrder": 30113
  },
  {
    "id": "official-258-115",
    "name": "МРТ дифузія всього тіла з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 16000,
    "aliases": [],
    "sortOrder": 30114
  },
  {
    "id": "official-258-116",
    "name": "КТ/МРТ 3D моделювання, сегментація, посегментна волюметрія печінки",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 2300,
    "aliases": [],
    "sortOrder": 30115
  },
  {
    "id": "official-258-117",
    "name": "КТ/МРТ 3D моделювання, сегментація, посегментна волюметрія печінки за результатами наданого DICOM дослідження КТ/МРТ з інших центрів",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 2500,
    "aliases": [],
    "sortOrder": 30116
  },
  {
    "id": "official-258-118",
    "name": "Швидке тестування на креатинін",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 300,
    "aliases": [],
    "sortOrder": 30117
  },
  {
    "id": "official-258-119",
    "name": "Підготовка до МРТ ОМТ",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 200,
    "aliases": [],
    "sortOrder": 30118
  },
  {
    "id": "official-258-120",
    "name": "Введення контрастної речовини через порт-систему для венозної інфузії",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 250,
    "aliases": [],
    "sortOrder": 30119
  },
  {
    "id": "official-258-121",
    "name": "Альтернативний висновок (опис МРТ дослідження виконаного в іншому центрі)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 30120
  },
  {
    "id": "official-258-122",
    "name": "Альтернативна оцінка динаміки лікування більше 3 дисків (друга думка)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3500,
    "aliases": [],
    "sortOrder": 30121
  },
  {
    "id": "official-258-123",
    "name": "Роздрук додаткової плівки в день обстеження",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 200,
    "aliases": [],
    "sortOrder": 30122
  }
];

export const officialPriceItems: PriceItem[] = officialPriceItemsBase.map(
  (item) =>
    usesDefaultCitoPolicy(item.category)
      ? {
          ...item,
          citoAvailable: true,
          citoSurcharge:
            (item.citoSurcharge ?? 0) > 0
              ? item.citoSurcharge
              : DEFAULT_CITO_SURCHARGE,
        }
      : item,
);
