import type { CategoryId, PriceItem } from "./priceData";
import { proofreadPriceItem } from "./nameCorrections.ts";
import {
  DEFAULT_CITO_SURCHARGE,
  usesDefaultCitoPolicy,
} from "./citoPolicy.ts";

export const officialCatalogSource = {
  url: "owner-supplied:Прайс_Рівне 09.09.2026.docx",
  fetchedAt: "2026-09-15T00:00:00.000Z",
  version: "2026-09-09-rivne-reviewed",
  itemCount: 741,
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
    "id": "official-258-001",
    "name": "МРТ головного мозку без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3250,
    "aliases": [],
    "sortOrder": 0,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1101"
  },
  {
    "id": "official-258-002",
    "name": "МРТ головного мозку з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 1,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1102"
  },
  {
    "id": "official-258-003",
    "name": "МРТ головного мозку + МР-ангіографія (артерії головного мозку)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4400,
    "aliases": [
      "МРТ головного мозку + МР-ангіографія (артерії головного мозку) без контрасту"
    ],
    "sortOrder": 2,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1103"
  },
  {
    "id": "official-258-004",
    "name": "МРТ головного мозку + МР-ангіографія (артерії головного мозку) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6800,
    "aliases": [],
    "sortOrder": 3,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1104"
  },
  {
    "id": "official-258-005",
    "name": "МРТ головного мозку + МР-ангіографія (артерії та вени головного мозку)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5200,
    "aliases": [
      "МРТ головного мозку + МР-ангіографія (артерії та вени головного мозку) без контрасту"
    ],
    "sortOrder": 4,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1105"
  },
  {
    "id": "official-258-006",
    "name": "МРТ головного мозку + МР-ангіографія (артерії та вени головного мозку) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7800,
    "aliases": [],
    "sortOrder": 5,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1106"
  },
  {
    "id": "official-258-007",
    "name": "МРТ головного мозку + артерії голови та шиї без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5500,
    "aliases": [],
    "sortOrder": 6,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1107"
  },
  {
    "id": "official-258-008",
    "name": "МРТ головного мозку + артерії голови та шиї з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7800,
    "aliases": [],
    "sortOrder": 7,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1108"
  },
  {
    "id": "rivne-20260909-0-7-plain",
    "name": "МР-ангіографія артерій головного мозку",
    "amount": 2000,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 8,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1109"
  },
  {
    "id": "rivne-20260909-0-8-plain",
    "name": "МР-ангіографія вен головного мозку",
    "amount": 2000,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 9,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1110"
  },
  {
    "id": "rivne-20260909-0-9-plain",
    "name": "МР-ангіографія артерій та вен головного мозку",
    "amount": 3700,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 10,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1111"
  },
  {
    "id": "rivne-20260909-0-10-plain",
    "name": "МР-ангіографія артерій шиї",
    "amount": 2000,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 11,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1112"
  },
  {
    "id": "official-258-009",
    "name": "МР-ангіографія артерій головного мозку та шиї",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3700,
    "aliases": [
      "МРТ артерій голови та шиї без контрасту"
    ],
    "sortOrder": 12,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1113"
  },
  {
    "id": "official-258-010",
    "name": "МР-ангіографія артерій, вен головного мозку та артерій шиї",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4400,
    "aliases": [
      "МРТ артерій та вен головного мозку + артерії шиї без контрасту"
    ],
    "sortOrder": 13,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1114"
  },
  {
    "id": "official-258-011",
    "name": "МРТ головного мозку (діагностика епілепсії) без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5100,
    "aliases": [
      "МРТ головного мозку (діагностика епілепсії)"
    ],
    "sortOrder": 14,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1115"
  },
  {
    "id": "official-258-012",
    "name": "МРТ головного мозку (діагностика епілепсії) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7700,
    "aliases": [],
    "sortOrder": 15,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1116"
  },
  {
    "id": "official-258-013",
    "name": "МРТ гіпофіза без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3200,
    "aliases": [],
    "sortOrder": 16,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1117"
  },
  {
    "id": "official-258-014",
    "name": "МРТ гіпофіза з динамічним контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 17,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1118"
  },
  {
    "id": "official-258-015",
    "name": "МРТ внутрішнього вуха та мосто-мозочкового кута без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3250,
    "aliases": [],
    "sortOrder": 18,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1119"
  },
  {
    "id": "official-258-016",
    "name": "МРТ внутрішнього вуха та мосто-мозочкового кута з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 19,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1120"
  },
  {
    "id": "official-258-017",
    "name": "МРТ орбіт без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3250,
    "aliases": [],
    "sortOrder": 20,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1121"
  },
  {
    "id": "official-258-018",
    "name": "МРТ орбіт з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6200,
    "aliases": [],
    "sortOrder": 21,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1122"
  },
  {
    "id": "official-258-019",
    "name": "МРТ головного мозку та гіпофіза без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4900,
    "aliases": [],
    "sortOrder": 22,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1123"
  },
  {
    "id": "official-258-020",
    "name": "МРТ головного мозку та гіпофіза з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7100,
    "aliases": [],
    "sortOrder": 23,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1124"
  },
  {
    "id": "official-258-021",
    "name": "МРТ головного мозку та внутрішнього вуха й мосто-мозочкового кута без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4900,
    "aliases": [],
    "sortOrder": 24,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1125"
  },
  {
    "id": "official-258-022",
    "name": "МРТ головного мозку та внутрішнього вуха й мосто-мозочкового кута з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7500,
    "aliases": [],
    "sortOrder": 25,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1126"
  },
  {
    "id": "official-258-023",
    "name": "МРТ головного мозку та орбіт, зорових нервів без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5050,
    "aliases": [],
    "sortOrder": 26,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1127"
  },
  {
    "id": "official-258-024",
    "name": "МРТ головного мозку та орбіт, зорових нервів з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7750,
    "aliases": [],
    "sortOrder": 27,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1128"
  },
  {
    "id": "official-258-025",
    "name": "МРТ головного мозку та навколоносових пазух, порожнини носа без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5700,
    "aliases": [],
    "sortOrder": 28,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1129"
  },
  {
    "id": "official-258-026",
    "name": "МРТ головного мозку та навколоносових пазух, порожнини носа з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7750,
    "aliases": [],
    "sortOrder": 29,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1130"
  },
  {
    "id": "official-258-029",
    "name": "МРТ головного мозку з контрастуванням при розсіяному склерозі та інших демієлінізуючих захворюваннях",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5500,
    "aliases": [
      "МРТ головного мозку при розсіяному склерозі та інших демієлінізуючих захворюваннях нервової системи (з внутрішньовенним контрастуванням)"
    ],
    "sortOrder": 30,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1133"
  },
  {
    "id": "official-258-030",
    "name": "МРТ порожнини носа та навколоносових пазух без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3250,
    "aliases": [],
    "sortOrder": 31,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1201"
  },
  {
    "id": "official-258-031",
    "name": "МРТ порожнини носа та навколоносових пазух з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5150,
    "aliases": [],
    "sortOrder": 32,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1202"
  },
  {
    "id": "official-258-032",
    "name": "МРТ м'яких тканин щелепно-лицевої області без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3800,
    "aliases": [],
    "sortOrder": 33,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1203"
  },
  {
    "id": "official-258-033",
    "name": "МРТ м'яких тканин щелепно-лицевої області з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6600,
    "aliases": [],
    "sortOrder": 34,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1204"
  },
  {
    "id": "official-258-034",
    "name": "МРТ м'яких тканин шиї та щелепно-лицевої області без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6000,
    "aliases": [],
    "sortOrder": 35,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1205"
  },
  {
    "id": "official-258-035",
    "name": "МРТ м'яких тканин шиї та щелепно-лицевої області з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8000,
    "aliases": [],
    "sortOrder": 36,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1206"
  },
  {
    "id": "official-258-036",
    "name": "МРТ м'яких тканин шиї без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5150,
    "aliases": [],
    "sortOrder": 37,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1207"
  },
  {
    "id": "official-258-039",
    "name": "МРТ м'яких тканин шиї з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7750,
    "aliases": [],
    "sortOrder": 38,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1208"
  },
  {
    "id": "official-258-037",
    "name": "МРТ мʼяких тканин голови та шиї без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6000,
    "aliases": [],
    "sortOrder": 39,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1209"
  },
  {
    "id": "official-258-038",
    "name": "МРТ мʼяких тканин голови та шиї з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8000,
    "aliases": [],
    "sortOrder": 40,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1210"
  },
  {
    "id": "official-258-060",
    "name": "МРТ скронево-нижньощелепних суглобів без капи або з капою + в динаміці без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6500,
    "aliases": [
      "МРТ скронево-нижньощелепних суглобів без капи або з капою + в динаміці"
    ],
    "sortOrder": 41,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1211"
  },
  {
    "id": "official-258-061",
    "name": "МРТ скронево-нижньощелепних суглобів без капи та з капою + в динаміці без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6700,
    "aliases": [
      "МРТ скронево-нижньощелепних суглобів без капи та з капою + в динаміці"
    ],
    "sortOrder": 42,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1212"
  },
  {
    "id": "official-258-040",
    "name": "МРТ шийного відділу хребта без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [
      "МРТ шийного відділу хребта"
    ],
    "sortOrder": 43,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1301"
  },
  {
    "id": "official-258-041",
    "name": "МРТ шийного відділу хребта з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 44,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1302"
  },
  {
    "id": "official-258-043",
    "name": "МРТ грудного відділу хребта без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [
      "МРТ грудного відділу хребта"
    ],
    "sortOrder": 45,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1303"
  },
  {
    "id": "official-258-044",
    "name": "МРТ грудного відділу хребта з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 46,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1304"
  },
  {
    "id": "official-258-045",
    "name": "МРТ поперекового відділу хребта без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [
      "МРТ поперекового відділу хребта"
    ],
    "sortOrder": 47,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1305"
  },
  {
    "id": "official-258-046",
    "name": "МРТ поперекового відділу хребта з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 48,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1306"
  },
  {
    "id": "official-258-047",
    "name": "МРТ крижової кістки без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 49,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1307"
  },
  {
    "id": "official-258-048",
    "name": "МРТ крижової кістки з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 50,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1308"
  },
  {
    "id": "official-258-049",
    "name": "МРТ куприка без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 51,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1309"
  },
  {
    "id": "official-258-052",
    "name": "МРТ куприка з контрастуванням (пілонідальна кіста)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5900,
    "aliases": [],
    "sortOrder": 52,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1310"
  },
  {
    "id": "official-258-050",
    "name": "МРТ крижів та куприка без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3350,
    "aliases": [],
    "sortOrder": 53,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1311"
  },
  {
    "id": "official-258-051",
    "name": "МРТ крижів та куприка з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5600,
    "aliases": [],
    "sortOrder": 54,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1312"
  },
  {
    "id": "official-258-053",
    "name": "МРТ крижово-клубових сполучень без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 55,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1313"
  },
  {
    "id": "official-258-054",
    "name": "МРТ крижово-клубових сполучень з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 56,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1314"
  },
  {
    "id": "official-258-056",
    "name": "МРТ шийного, грудного та поперекового відділів хребта без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7300,
    "aliases": [],
    "sortOrder": 57,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1315"
  },
  {
    "id": "official-258-057",
    "name": "МРТ шийного, грудного та поперекового відділів хребта з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 9300,
    "aliases": [],
    "sortOrder": 58,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1316"
  },
  {
    "id": "official-258-055",
    "name": "МРТ скринінг хребта (шийний, грудний, попереково-крижовий відділи хребта) без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4500,
    "aliases": [
      "МРТ скринінг хребта (шийний, грудний, попереково-крижовий відділи хребта в сагітальній проекції з використанням Т1, Т2, Т2fs послідовностей)"
    ],
    "sortOrder": 59,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1317"
  },
  {
    "id": "official-258-058",
    "name": "МРТ ревматологічний скринінг хребта та крижово-клубових сполучень без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [
      "МРТ ревматологічний скринінг хребта та крижово-клубових сполучень"
    ],
    "sortOrder": 60,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1318"
  },
  {
    "id": "official-258-059",
    "name": "МРТ одного відділу хребта при сколіозі 3-4 ступеню без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3900,
    "aliases": [
      "МРТ одного відділу хребта при сколіозі 3-4 ступеню"
    ],
    "sortOrder": 61,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1319"
  },
  {
    "id": "official-258-042",
    "name": "МРТ шийного відділу хребта з МР-ангіографією артерій шиї (виключення диссекції)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5100,
    "aliases": [
      "МРТ шийного відділу хребта + МР-ангіографія (артерії шиї, виключення диссекції)"
    ],
    "sortOrder": 62,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1320"
  },
  {
    "id": "official-258-070",
    "name": "МРТ грудинно-ключичних сполучень без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4500,
    "aliases": [
      "МРТ грудинно-ключичних сполучень"
    ],
    "sortOrder": 63,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1401"
  },
  {
    "id": "rivne-20260909-0-47-plain",
    "name": "МРТ правого плечового суглоба без контрасту",
    "amount": 3350,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 64,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1402"
  },
  {
    "id": "rivne-20260909-0-48-plain",
    "name": "МРТ лівого плечового суглоба без контрасту",
    "amount": 3350,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 65,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1403"
  },
  {
    "id": "rivne-20260909-0-49-contrast",
    "name": "МРТ правого плечового суглоба з контрастуванням",
    "amount": 5000,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 66,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1404"
  },
  {
    "id": "rivne-20260909-0-50-contrast",
    "name": "МРТ лівого плечового суглоба з контрастуванням",
    "amount": 5000,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 67,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1405"
  },
  {
    "id": "rivne-20260909-0-51-plain",
    "name": "МРТ правого ліктьового суглоба без контрасту",
    "amount": 3900,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 68,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1406"
  },
  {
    "id": "rivne-20260909-0-52-plain",
    "name": "МРТ лівого ліктьового суглоба без контрасту",
    "amount": 3900,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 69,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1407"
  },
  {
    "id": "rivne-20260909-0-53-contrast",
    "name": "МРТ правого ліктьового суглоба з контрастуванням",
    "amount": 5300,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 70,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1408"
  },
  {
    "id": "rivne-20260909-0-54-contrast",
    "name": "МРТ лівого ліктьового суглоба з контрастуванням",
    "amount": 5300,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 71,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1409"
  },
  {
    "id": "rivne-20260909-0-55-plain",
    "name": "МРТ правого променево-зап'ясткового суглоба та проксимального відділу кисті без контрасту",
    "amount": 3900,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 72,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1410"
  },
  {
    "id": "rivne-20260909-0-56-plain",
    "name": "МРТ лівого променево-зап'ясткового суглоба та проксимального відділу кисті без контрасту",
    "amount": 3900,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 73,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1411"
  },
  {
    "id": "rivne-20260909-0-57-contrast",
    "name": "МРТ правого променево-зап'ясткового суглоба та проксимального відділу кисті з контрастуванням",
    "amount": 5300,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 74,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1412"
  },
  {
    "id": "rivne-20260909-0-58-contrast",
    "name": "МРТ лівого променево-зап'ясткового суглоба та проксимального відділу кисті з контрастуванням",
    "amount": 5300,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 75,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1413"
  },
  {
    "id": "rivne-20260909-0-59-plain",
    "name": "МРТ правої кисті (п'ясток та фаланги) без контрасту",
    "amount": 3900,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 76,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1414"
  },
  {
    "id": "rivne-20260909-0-60-plain",
    "name": "МРТ лівої кисті (п'ясток та фаланги) без контрасту",
    "amount": 3900,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 77,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1415"
  },
  {
    "id": "rivne-20260909-0-61-contrast",
    "name": "МРТ правої кисті (п'ясток та фаланги) з контрастуванням",
    "amount": 5300,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 78,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1416"
  },
  {
    "id": "rivne-20260909-0-62-contrast",
    "name": "МРТ лівої кисті (п'ясток та фаланги) з контрастуванням",
    "amount": 5300,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 79,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1417"
  },
  {
    "id": "official-258-079",
    "name": "МРТ великого пальця кисті без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3300,
    "aliases": [
      "МРТ великого пальця кисті"
    ],
    "sortOrder": 80,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1418"
  },
  {
    "id": "official-258-062",
    "name": "МРТ обох кульшових суглобів без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3900,
    "aliases": [
      "МРТ обох кульшових суглобів"
    ],
    "sortOrder": 81,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1501"
  },
  {
    "id": "official-258-063",
    "name": "МРТ обох кульшових суглобів з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5400,
    "aliases": [],
    "sortOrder": 82,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1502"
  },
  {
    "id": "rivne-20260909-0-66-plain",
    "name": "МРТ правого колінного суглоба без контрасту",
    "amount": 3250,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 83,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1503"
  },
  {
    "id": "rivne-20260909-0-67-plain",
    "name": "МРТ лівого колінного суглоба без контрасту",
    "amount": 3250,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 84,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1504"
  },
  {
    "id": "rivne-20260909-0-68-contrast",
    "name": "МРТ правого колінного суглоба з контрастуванням",
    "amount": 5300,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 85,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1505"
  },
  {
    "id": "rivne-20260909-0-69-contrast",
    "name": "МРТ лівого колінного суглоба з контрастуванням",
    "amount": 5300,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 86,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1506"
  },
  {
    "id": "rivne-20260909-0-70-plain",
    "name": "МРТ правого гомілковостопного суглоба та проксимального відділу стопи без контрасту",
    "amount": 3900,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 87,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1507"
  },
  {
    "id": "rivne-20260909-0-71-plain",
    "name": "МРТ лівого гомілковостопного суглоба та проксимального відділу стопи без контрасту",
    "amount": 3900,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 88,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1508"
  },
  {
    "id": "rivne-20260909-0-72-contrast",
    "name": "МРТ правого гомілковостопного суглоба та проксимального відділу стопи з контрастуванням",
    "amount": 5700,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 89,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1509"
  },
  {
    "id": "rivne-20260909-0-73-contrast",
    "name": "МРТ лівого гомілковостопного суглоба та проксимального відділу стопи з контрастуванням",
    "amount": 5700,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 90,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1510"
  },
  {
    "id": "rivne-20260909-0-74-plain",
    "name": "МРТ правої стопи (плесна та фаланги) без контрасту",
    "amount": 3900,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 91,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1511"
  },
  {
    "id": "rivne-20260909-0-75-plain",
    "name": "МРТ лівої стопи (плесна та фаланги) без контрасту",
    "amount": 3900,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 92,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1512"
  },
  {
    "id": "rivne-20260909-0-76-contrast",
    "name": "МРТ правої стопи (плесна та фаланги) з контрастуванням",
    "amount": 5300,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 93,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1513"
  },
  {
    "id": "rivne-20260909-0-77-contrast",
    "name": "МРТ лівої стопи (плесна та фаланги) з контрастуванням",
    "amount": 5300,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 94,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1514"
  },
  {
    "id": "rivne-20260909-0-78-plain",
    "name": "МРТ правої гомілки без контрасту",
    "amount": 5150,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 95,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1515"
  },
  {
    "id": "rivne-20260909-0-79-plain",
    "name": "МРТ лівої гомілки без контрасту",
    "amount": 5150,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 96,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1516"
  },
  {
    "id": "rivne-20260909-0-80-contrast",
    "name": "МРТ правої гомілки з контрастуванням",
    "amount": 7750,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 97,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1517"
  },
  {
    "id": "rivne-20260909-0-81-contrast",
    "name": "МРТ лівої гомілки з контрастуванням",
    "amount": 7750,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 98,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1518"
  },
  {
    "id": "rivne-20260909-0-82-plain",
    "name": "МРТ правого стегна без контрасту",
    "amount": 5150,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 99,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1519"
  },
  {
    "id": "rivne-20260909-0-83-plain",
    "name": "МРТ лівого стегна без контрасту",
    "amount": 5150,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 100,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1520"
  },
  {
    "id": "rivne-20260909-0-84-contrast",
    "name": "МРТ правого стегна з контрастуванням",
    "amount": 7750,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 101,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1521"
  },
  {
    "id": "rivne-20260909-0-85-contrast",
    "name": "МРТ лівого стегна з контрастуванням",
    "amount": 7750,
    "category": "mri",
    "categoryLabel": "МРТ",
    "sortOrder": 102,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1522"
  },
  {
    "id": "official-258-084",
    "name": "МРТ жовчовивідних протоків (безконтрастна холангіопанкреатографія)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3200,
    "aliases": [],
    "sortOrder": 103,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1601"
  },
  {
    "id": "official-258-085",
    "name": "МРТ черевної порожнини (печінка, селезінка, підшлункова залоза) + МРХПГ без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [
      "МРТ черевної порожнини (печінка, селезінка, підшлункова залоза) + МРХПГ"
    ],
    "sortOrder": 104,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1602"
  },
  {
    "id": "official-258-086",
    "name": "МРТ черевної порожнини (печінка, селезінка, підшлункова залоза) + МРХПГ з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [
      "МРТ черевної порожнини (печінка, селезінка, підшлункова залоза) з контрастуванням + МРХПГ"
    ],
    "sortOrder": 105,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1603"
  },
  {
    "id": "official-258-087",
    "name": "МРТ черевної порожнини та заочеревинного простору (печінка, селезінка, підшлункова залоза, нирки, наднирники) + МРХПГ без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [
      "МРТ черевної порожнини та заочеревинного простору (печінка, селезінка, підшлункова залоза, нирки, наднирники) + МРХПГ"
    ],
    "sortOrder": 106,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1604"
  },
  {
    "id": "official-258-088",
    "name": "МРТ черевної порожнини та заочеревинного простору (печінка, селезінка, підшлункова залоза, нирки, наднирники) + МРХПГ з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [
      "МРТ черевної порожнини та заочеревинного простору (печінка, селезінка, підшлункова залоза, нирки, наднирники) з контрастуванням + МРХПГ"
    ],
    "sortOrder": 107,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1605"
  },
  {
    "id": "official-258-089",
    "name": "МРТ черевної порожнини з контрастуванням (пухлина жовчних протоків) + МРХПГ",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8500,
    "aliases": [
      "МРТ черевної порожнини з контрастуванням (пухлина жовчих протоків) + МРХПГ"
    ],
    "sortOrder": 108,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1606"
  },
  {
    "id": "official-258-090",
    "name": "МРТ печінки з гепатотропним контрастним препаратом",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 10200,
    "aliases": [],
    "sortOrder": 109,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1607"
  },
  {
    "id": "official-258-091",
    "name": "МРТ стеатометрія без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3800,
    "aliases": [
      "МРТ стеатометрія"
    ],
    "sortOrder": 110,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1608"
  },
  {
    "id": "official-258-092",
    "name": "МРТ ентерографія",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8300,
    "aliases": [],
    "sortOrder": 111,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1609"
  },
  {
    "id": "official-258-094",
    "name": "МРТ заочеревинного простору (нирки, наднирники) без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [
      "МРТ заочеревинного простору (нирки, наднирники)"
    ],
    "sortOrder": 112,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1611"
  },
  {
    "id": "official-258-095",
    "name": "МРТ заочеревинного простору (нирки, наднирники) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [],
    "sortOrder": 113,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1612"
  },
  {
    "id": "official-258-096",
    "name": "МРТ малого таза (пряма кишка, анальний канал) без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [
      "МРТ малого таза (пряма кишка, анальний канал)"
    ],
    "sortOrder": 114,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1701"
  },
  {
    "id": "official-258-099",
    "name": "МРТ малого таза (пряма кишка, анальний канал) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [],
    "sortOrder": 115,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1702"
  },
  {
    "id": "official-258-097",
    "name": "МРТ малого таза (сечовий міхур) без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4900,
    "aliases": [
      "МРТ малого таза (сечовий міхур)"
    ],
    "sortOrder": 116,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1703"
  },
  {
    "id": "official-258-098",
    "name": "МРТ малого таза (сечовий міхур) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7500,
    "aliases": [],
    "sortOrder": 117,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1704"
  },
  {
    "id": "official-258-100",
    "name": "МРТ малого таза у жінок (матка, яєчники) без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [
      "МРТ малого таза у жінок (матка, яєчники)"
    ],
    "sortOrder": 118,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1705"
  },
  {
    "id": "official-258-101",
    "name": "МРТ малого таза у жінок (матка, яєчники) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [],
    "sortOrder": 119,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1706"
  },
  {
    "id": "official-258-102",
    "name": "МРТ малого таза у чоловіків (передміхурова залоза + кістки таза) без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 6100,
    "aliases": [
      "МРТ малого таза у чоловіків (передміхурова залоза + кістки таза)"
    ],
    "sortOrder": 120,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1707"
  },
  {
    "id": "official-258-103",
    "name": "МРТ малого таза у чоловіків (передміхурова залоза + кістки таза) з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 8800,
    "aliases": [],
    "sortOrder": 121,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1708"
  },
  {
    "id": "official-258-106",
    "name": "МРТ калитки, яєчок та статевого члена без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 4900,
    "aliases": [
      "МРТ калитки, яєчок та статевого члена"
    ],
    "sortOrder": 122,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1710"
  },
  {
    "id": "official-258-105",
    "name": "МРТ калитки, яєчок та статевого члена з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7500,
    "aliases": [],
    "sortOrder": 123,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1711"
  },
  {
    "id": "official-258-107",
    "name": "МРТ однієї анатомічної зони без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5150,
    "aliases": [],
    "sortOrder": 124,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1805"
  },
  {
    "id": "official-258-108",
    "name": "МРТ однієї анатомічної зони з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7750,
    "aliases": [],
    "sortOrder": 125,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1806"
  },
  {
    "id": "official-258-109",
    "name": "МРТ одного сегменту спинного мозку з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5100,
    "aliases": [],
    "sortOrder": 126,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1807"
  },
  {
    "id": "official-258-110",
    "name": "МРТ спинного мозку без контрасту",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 5000,
    "aliases": [],
    "sortOrder": 127,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1808"
  },
  {
    "id": "official-258-111",
    "name": "МРТ спинного мозку з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 9500,
    "aliases": [],
    "sortOrder": 128,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1809"
  },
  {
    "id": "official-258-112",
    "name": "МРТ двох ділянок (головний мозок, шийний або грудний відділ спинного мозку) при розсіяному склерозі з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 7600,
    "aliases": [
      "МРТ двох ділянок (головний мозок, шийний або грудний відділ спинного мозку) при РС та інших демієлінізуючих захворюваннях"
    ],
    "sortOrder": 129,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1810"
  },
  {
    "id": "official-258-113",
    "name": "МРТ трьох ділянок (головний мозок та шийний та грудний відділи спинного мозку) при розсіяному склерозі з контрастуванням",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 9800,
    "aliases": [
      "МРТ трьох ділянок (головний мозок + шийний + грудний відділи спинного мозку) з контрастуванням при РС та інших демієлінізуючих захворюваннях"
    ],
    "sortOrder": 130,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1811"
  },
  {
    "id": "official-258-116",
    "name": "КТ/МРТ 3D моделювання, сегментація, посегментна волюметрія печінки",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 2300,
    "aliases": [],
    "sortOrder": 131,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1901"
  },
  {
    "id": "official-258-117",
    "name": "КТ/МРТ 3D моделювання, сегментація, посегментна волюметрія печінки за результатами наданого DICOM дослідження КТ/МРТ з інших центрів",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 2500,
    "aliases": [],
    "sortOrder": 132,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1902"
  },
  {
    "id": "official-258-119",
    "name": "Підготовка до МРТ ОМТ",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 200,
    "aliases": [],
    "sortOrder": 133,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1904"
  },
  {
    "id": "official-258-120",
    "name": "Введення контрастної речовини через порт-систему для венозної інфузії",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 250,
    "aliases": [],
    "sortOrder": 134,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1905"
  },
  {
    "id": "official-258-121",
    "name": "Альтернативний опис наданого диску",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3000,
    "aliases": [
      "Альтернативний висновок (опис МРТ дослідження виконаного в іншому центрі)"
    ],
    "sortOrder": 135,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1906"
  },
  {
    "id": "official-258-122",
    "name": "Альтернативна оцінка динаміки лікування більше 3 дисків (друга думка)",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 3500,
    "aliases": [],
    "sortOrder": 136,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1907"
  },
  {
    "id": "official-258-123",
    "name": "Роздрук додаткової плівки в день обстеження",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 200,
    "aliases": [],
    "sortOrder": 137,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": ""
  },
  {
    "id": "official-258-118",
    "name": "Швидке тестування на креатинін",
    "category": "mri",
    "categoryLabel": "МРТ",
    "amount": 300,
    "aliases": [],
    "sortOrder": 138,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "969"
  },
  {
    "id": "official-230-001",
    "name": "КТ приносових пазух без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1500,
    "aliases": [
      "КТ приносових пазух"
    ],
    "sortOrder": 139,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "900"
  },
  {
    "id": "official-230-002",
    "name": "КТ приносових пазух з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3000,
    "aliases": [
      "КТ приносових пазух (з контрастуванням)"
    ],
    "sortOrder": 140,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "901"
  },
  {
    "id": "official-230-003",
    "name": "КТ щелепно-лицевої ділянки (лицьовий скелет + нижня щелепа) без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1500,
    "aliases": [
      "КТ щелепно-лицевої ділянки (лицьовій скелет + нижня щелепа)"
    ],
    "sortOrder": 141,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "908"
  },
  {
    "id": "official-230-004",
    "name": "КТ щелепно-лицевої ділянки (лицьовий скелет + нижня щелепа) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3200,
    "aliases": [
      "КТ щелепно-лицевої ділянки (лицьовій скелет + нижня щелепа) (з контрастуванням)"
    ],
    "sortOrder": 142,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "909"
  },
  {
    "id": "official-230-005",
    "name": "КТ головного мозку без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1500,
    "aliases": [
      "КТ головного мозку"
    ],
    "sortOrder": 143,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "902"
  },
  {
    "id": "official-230-006",
    "name": "КТ головного мозку з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3200,
    "aliases": [
      "КТ головного мозку (з контрастуванням)"
    ],
    "sortOrder": 144,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "903"
  },
  {
    "id": "official-230-007",
    "name": "КТ скроневих кісток (середнє і внутрішнє вухо, соскоподібний відросток) без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1600,
    "aliases": [
      "КТ скроневих кісток (середнє і внутрішнє вухо, соскоподібний відросток)"
    ],
    "sortOrder": 145,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "906"
  },
  {
    "id": "official-230-008",
    "name": "КТ головного мозку + приносових пазух без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2000,
    "aliases": [
      "КТ головного мозку + приносових пазух"
    ],
    "sortOrder": 146,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "904"
  },
  {
    "id": "official-230-009",
    "name": "КТ головного мозку + приносових пазух з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3300,
    "aliases": [
      "КТ головного мозку + приносових пазух (з контрастуванням)"
    ],
    "sortOrder": 147,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "905"
  },
  {
    "id": "official-230-010",
    "name": "КТ одного відділу хребта (шийний, грудний, попереково-крижовий) без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1500,
    "aliases": [
      "КТ одного відділу хребта (шийний, грудний, попереково-крижовий)"
    ],
    "sortOrder": 148,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "910"
  },
  {
    "id": "official-230-025",
    "name": "КТ двох відділів хребта без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2700,
    "aliases": [
      "КТ двох відділів хребта"
    ],
    "sortOrder": 149,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "911"
  },
  {
    "id": "official-230-027",
    "name": "КТ трьох відділів хребта без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [
      "КТ трьох відділів хребта"
    ],
    "sortOrder": 150,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "912"
  },
  {
    "id": "official-230-026",
    "name": "КТ одного відділу хребта + кістки таза без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2700,
    "aliases": [
      "КТ одного відділу хребта + кістки таза"
    ],
    "sortOrder": 151,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "950"
  },
  {
    "id": "official-230-011",
    "name": "КТ суглоба (кульшових, колінний, гомілковостопний, плечовий, ліктьовий, променево-зап'ястний) без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1600,
    "aliases": [
      "КТ суглоба (кульшових, колінний, гомілковостопний, плечовий, ліктьовий, променевозап'ястний)"
    ],
    "sortOrder": 152,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "917"
  },
  {
    "id": "official-230-012",
    "name": "КТ суглоба (кульшових, колінний, гомілковостопний, плечовий, ліктьовий, променево-зап'ястний) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3000,
    "aliases": [
      "КТ суглоба (кульшових, колінний, гомілковостопний, плечовий, ліктьовий, променевозап'ястний) (з контрастуванням)"
    ],
    "sortOrder": 153,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "918"
  },
  {
    "id": "official-230-013",
    "name": "КТ кісток таза без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [
      "КТ кісток таза"
    ],
    "sortOrder": 154,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "915"
  },
  {
    "id": "official-230-014",
    "name": "КТ кісток таза з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3500,
    "aliases": [
      "КТ кісток таза (з контрастуванням)"
    ],
    "sortOrder": 155,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "916"
  },
  {
    "id": "official-230-015",
    "name": "КТ попереково-крижового відділу хребта + куприк без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [
      "КТ попереково-крижового відділу хребта + куприк"
    ],
    "sortOrder": 156,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "913"
  },
  {
    "id": "official-230-016",
    "name": "КТ кисті/ променево-зап'ястковий суглоб без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [
      "КТ кисті/ променево-зап'ястковий суглоб"
    ],
    "sortOrder": 157,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "953"
  },
  {
    "id": "official-230-017",
    "name": "КТ кисті/ променево-зап'ястковий суглоб з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [
      "КТ кисті/ променево-зап'ястковий суглоб (з контрастуванням)"
    ],
    "sortOrder": 158,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "920-3"
  },
  {
    "id": "official-230-018",
    "name": "КТ стопи / гомілковостопний суглоб без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [
      "КТ стопи / гомілковостопний суглоб"
    ],
    "sortOrder": 159,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "954"
  },
  {
    "id": "official-230-019",
    "name": "КТ стопи / гомілковостопний суглоб з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [
      "КТ стопи / гомілковостопний суглоб (з контрастуванням)"
    ],
    "sortOrder": 160,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "920-6"
  },
  {
    "id": "official-230-020",
    "name": "КТ одного сегмента кінцівки (плече, передпліччя, кисть, стегно, гомілка, стопа) без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [
      "КТ одного сегмента кінцівки (плече, передпліччя, кисть, стегно, гомілка, стопа)"
    ],
    "sortOrder": 161,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "919"
  },
  {
    "id": "official-230-021",
    "name": "КТ одного сегмента кінцівки (плече, передпліччя, кисть, стегно, гомілка, стопа) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [
      "КТ одного сегмента кінцівки (плече, передпліччя, кисть, стегно, гомілка, стопа) (з контрастуванням)"
    ],
    "sortOrder": 162,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "920"
  },
  {
    "id": "official-230-022",
    "name": "КТ попереково-крижового відділу хребта + КТ-денситометрія без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2200,
    "aliases": [
      "КТ попереково-крижового відділу хребта + КТ-денситометрія"
    ],
    "sortOrder": 163,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "955"
  },
  {
    "id": "official-230-023",
    "name": "Пошук метастазів в кістковому скелеті (всі відділи хребта, ребра, ключиці, лопатки, кістки таза), в легенях, в лімфовузлах без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [
      "Пошук метастазів в кістковому скелеті (всі відділи хребта, ребра, ключиці, лопатки, кістки таза), в легенях, в лімфовузлах"
    ],
    "sortOrder": 164,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "914"
  },
  {
    "id": "official-230-024",
    "name": "КТ хребта, кісток таза та грудної клітини (політравма) без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [
      "КТ хребта, кісток таза та грудної клітини (політравма)"
    ],
    "sortOrder": 165,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "800"
  },
  {
    "id": "official-230-028",
    "name": "КТ м'яких тканин шиї (включаючи глотку, гортань, лімфовузли) без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1700,
    "aliases": [
      "КТ м'яких тканин шиї (включаючи глотку, гортань, лімфовузли)"
    ],
    "sortOrder": 166,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "910-4"
  },
  {
    "id": "official-230-029",
    "name": "КТ м'яких тканин шиї (включаючи глотку, гортань, лімфовузли) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [
      "КТ м'яких тканин шиї (включаючи глотку, гортань, лімфовузли) (з контрастуванням)"
    ],
    "sortOrder": 167,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "921"
  },
  {
    "id": "official-230-030",
    "name": "КТ органів грудної клітини без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 1800,
    "aliases": [
      "КТ органів грудної клітини"
    ],
    "sortOrder": 168,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "922"
  },
  {
    "id": "official-230-031",
    "name": "КТ органів грудної клітини з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3800,
    "aliases": [
      "КТ органів грудної клітини (з контрастуванням)"
    ],
    "sortOrder": 169,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "923"
  },
  {
    "id": "official-230-032",
    "name": "КТ органів сечовидільної системи (пошук конкрементів нирок, сечоводів, сечового міхура) без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2000,
    "aliases": [
      "КТ органів сечовидільної системи (пошук конкрементів нирок, сечоводів, сечового міхура)"
    ],
    "sortOrder": 170,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "925"
  },
  {
    "id": "official-230-033",
    "name": "КТ органів черевної порожнини + заочеревинного простору + органів таза (далі ОЧП) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4800,
    "aliases": [
      "КТ органів черевної порожнини + заочеревинного простору + органів таза (далі ОЧП)"
    ],
    "sortOrder": 171,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "926"
  },
  {
    "id": "official-230-034",
    "name": "КТ-ентерографія",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4800,
    "aliases": [],
    "sortOrder": 172,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "927"
  },
  {
    "id": "official-230-035",
    "name": "КТ-колонографія з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4800,
    "aliases": [
      "КТ-колонографія"
    ],
    "sortOrder": 173,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "928"
  },
  {
    "id": "official-230-036",
    "name": "КТ м'яких тканин шиї + ОГК з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4900,
    "aliases": [
      "КТ м'яких тканин шиї + ОГК"
    ],
    "sortOrder": 174,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "929"
  },
  {
    "id": "official-230-037",
    "name": "КТ головного мозку + ОГК з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4900,
    "aliases": [
      "КТ головного мозку + ОГК"
    ],
    "sortOrder": 175,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "933-1"
  },
  {
    "id": "official-230-038",
    "name": "КТ головного мозку + м’яких тканин шиї з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4900,
    "aliases": [
      "КТ головного мозку + м’яких тканин шиї"
    ],
    "sortOrder": 176,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "958"
  },
  {
    "id": "official-230-039",
    "name": "КТ головного мозку + ОЧП + ОМТ з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5800,
    "aliases": [
      "КТ головного мозку + ОЧП + ОМТ"
    ],
    "sortOrder": 177,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "933-2"
  },
  {
    "id": "official-230-040",
    "name": "КТ ОГК + ОЧП + органів таза без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 3700,
    "aliases": [
      "КТ ОГК + ОЧП + органів таза"
    ],
    "sortOrder": 178,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "930-1"
  },
  {
    "id": "official-230-041",
    "name": "КТ ОГК + ОЧП + органів таза з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5800,
    "aliases": [
      "КТ ОГК + ОЧП + органів таза (з контрастуванням)"
    ],
    "sortOrder": 179,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "930"
  },
  {
    "id": "official-230-042",
    "name": "КТ м'яких тканин шиї + ОГК + ОЧП + органів таза з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6500,
    "aliases": [
      "КТ м'яких тканин шиї + ОГК + ОЧП + органів таза"
    ],
    "sortOrder": 180,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "931"
  },
  {
    "id": "official-230-043",
    "name": "КТ головного мозку + м’яких тканин шиї + ОГК з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6200,
    "aliases": [
      "КТ головного мозку + м’яких тканин шиї + ОГК"
    ],
    "sortOrder": 181,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "959"
  },
  {
    "id": "official-230-044",
    "name": "КТ головного мозку + ОГК + ОЧП + ОМТ з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6500,
    "aliases": [
      "КТ головного мозку + ОГК + ОЧП + ОМТ"
    ],
    "sortOrder": 182,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "956"
  },
  {
    "id": "official-230-045",
    "name": "КТ головного мозку + м'яких тканин шиї + ОГК + ОЧП + органів таза (онкопошук) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 7000,
    "aliases": [
      "КТ головного мозку + м'яких тканин шиї + ОГК + ОЧП + органів таза (онкопошук)"
    ],
    "sortOrder": 183,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "932"
  },
  {
    "id": "official-230-046",
    "name": "КТ-ангіографія судин головного мозку з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4100,
    "aliases": [
      "КТ-ангіографія судин головного мозку"
    ],
    "sortOrder": 184,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "934"
  },
  {
    "id": "official-230-047",
    "name": "КТ-ангіографія судин шиї з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4100,
    "aliases": [
      "КТ-ангіографія судин шиї"
    ],
    "sortOrder": 185,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "935"
  },
  {
    "id": "official-230-049",
    "name": "КТ-ангіографія судин шиї та головного мозку з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4900,
    "aliases": [
      "КТ-ангіографія судин шиї та головного мозку"
    ],
    "sortOrder": 186,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "936"
  },
  {
    "id": "official-230-048",
    "name": "КТ-ангіографія грудного / черевного відділу аорти (без ЕКГ синхронізації) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 4500,
    "aliases": [
      "КТ-ангіографія грудного / черевного відділу аорти (без ЕКГ синхронізації)"
    ],
    "sortOrder": 187,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "937"
  },
  {
    "id": "official-230-050",
    "name": "КТ-ангіографія всієї аорти (без ЕКГ синхронізації) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5000,
    "aliases": [
      "КТ-ангіографія всієї аорти (без ЕКГ синхронізації)"
    ],
    "sortOrder": 188,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "938"
  },
  {
    "id": "official-230-051",
    "name": "КТ-ангіографія судин нижніх / верхніх кінцівок з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5500,
    "aliases": [
      "КТ-ангіографія судин нижніх / верхніх кінцівок"
    ],
    "sortOrder": 189,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "939/940"
  },
  {
    "id": "official-230-052",
    "name": "КТ аортального клапана та аорти з ЕКГ- синхронізацією (TAVI) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 7500,
    "aliases": [
      "КТ аортального клапана та аорти з ЕКГ- синхрн. (TAVI)"
    ],
    "sortOrder": 190,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "945"
  },
  {
    "id": "official-230-053",
    "name": "КТ серця для підрахунку кальцію в коронарних судинах без контрасту",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2500,
    "aliases": [
      "КТ серця для підрахунку кальцію в коронарних судинах"
    ],
    "sortOrder": 191,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "947"
  },
  {
    "id": "official-230-054",
    "name": "КТ серця з ЕКГ-синхронізацією (оцінка утворів) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5800,
    "aliases": [
      "КТ серця з ЕКГ-синхронізацією (оцінка утворів)"
    ],
    "sortOrder": 192,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "963"
  },
  {
    "id": "official-230-055",
    "name": "КТ серця з ЕКГ-синхронізацією (легеневі вени, ліве передсердя, як підготовка до абляції) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6700,
    "aliases": [
      "КТ серця з ЕКГ-синхронізацією (легеневі вени, ліве передсердя, як підготовка до абляції)"
    ],
    "sortOrder": 193,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "964"
  },
  {
    "id": "official-230-056",
    "name": "КТ-ангіографія грудної аорти з ЕКГ-синхронізацією з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6200,
    "aliases": [
      "КТ-ангіографія грудної аорти з ЕКГ-синхронізацією"
    ],
    "sortOrder": 194,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "965"
  },
  {
    "id": "official-230-057",
    "name": "КТ-ангіографія судин серця та грудної аорти з ЕКГ-синхронізацією з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6200,
    "aliases": [
      "КТ-ангіографія судин серця та грудної аорти з ЕКГ-синхронізацією"
    ],
    "sortOrder": 195,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "966"
  },
  {
    "id": "official-230-058",
    "name": "КТ-ангіографія всієї аорти (грудна аорта з ЕКГ синхронізацією) з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 6900,
    "aliases": [
      "КТ-ангіографія всієї аорти (грудна аорта з ЕКГ синхронізацією)"
    ],
    "sortOrder": 196,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "967"
  },
  {
    "id": "official-230-059",
    "name": "КТ -ангіографія судин серця (коронарографія) + ЕКГ синхронізація з контрастуванням",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 5800,
    "aliases": [
      "КТ -ангіографія судин серця (коронарографія) з ЕКГ синхронізацією"
    ],
    "sortOrder": 197,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "951"
  },
  {
    "id": "official-230-061",
    "name": "Плівка",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 200,
    "aliases": [],
    "sortOrder": 198,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "943"
  },
  {
    "id": "official-230-062",
    "name": "Додаткова флешка",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 150,
    "aliases": [],
    "sortOrder": 199,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "957"
  },
  {
    "id": "official-230-060",
    "name": "КТ-денситометрія (додаткове дослідження до КТ попереково-крижового відділу хребта)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 900,
    "aliases": [],
    "sortOrder": 200,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "952"
  },
  {
    "id": "official-230-063",
    "name": "3D-моделювання, сегментація, посегментна волюметрія печінки",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 900,
    "aliases": [],
    "sortOrder": 201,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "941"
  },
  {
    "id": "official-230-064",
    "name": "Додатковий опис хребта, суглоба при дослідженнях ОГК, ОЧП і малого таза, м'яких тканин шиї і при їх комбінаціях",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 900,
    "aliases": [],
    "sortOrder": 202,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "946"
  },
  {
    "id": "official-230-065",
    "name": "3D-моделювання товстої кишки, кольоровий друк",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 600,
    "aliases": [],
    "sortOrder": 203,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "941"
  },
  {
    "id": "official-230-066",
    "name": "Альтернативний висновок (опис КТ дослідження виконаного в іншому центрі)",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2500,
    "aliases": [],
    "sortOrder": 204,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "944"
  },
  {
    "id": "official-230-067",
    "name": "3D-моделювання, сегментація, посегментна волюметрія печінки з носія (флешка, СD) пацієнта",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 2500,
    "aliases": [],
    "sortOrder": 205,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "961"
  },
  {
    "id": "official-230-068",
    "name": "Швидке тестування на креатинін",
    "category": "ct",
    "categoryLabel": "КТ",
    "amount": 300,
    "aliases": [],
    "sortOrder": 206,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "969"
  },
  {
    "id": "official-231-001",
    "name": "Загальний розгорнутий аналіз крові (параметри аналізатора, ШОЕ (автоматичний підрахунок)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 210,
    "aliases": [],
    "sortOrder": 207,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "54"
  },
  {
    "id": "official-231-002",
    "name": "Загальний розгорнутий аналіз крові (параметри аналізатора, ШОЕ, лейкоцитарна формула) ручний підрахунок",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 260,
    "aliases": [],
    "sortOrder": 208,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "64"
  },
  {
    "id": "official-231-003",
    "name": "Аналіз крові на ретикулоцити з підрахуванням ретикулярного індексу",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 170,
    "aliases": [],
    "sortOrder": 209,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "700"
  },
  {
    "id": "official-231-004",
    "name": "Група крові та резус фактор",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 280,
    "aliases": [
      "Группа крові та резус фактор"
    ],
    "sortOrder": 210,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "264"
  },
  {
    "id": "official-231-005",
    "name": "Час згортання крові за Сухоревим",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 230,
    "aliases": [],
    "sortOrder": 211,
    "isActive": true,
    "turnaround": "15 хв",
    "code": "3"
  },
  {
    "id": "official-231-006",
    "name": "Аналіз сечі загальний (ЗАС + ручна мікроскопія осаду)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 180,
    "aliases": [
      "Аналіз сечі загальний (ЗАС+ручна мікроскопія осаду)"
    ],
    "sortOrder": 212,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "62"
  },
  {
    "id": "official-231-007",
    "name": "Аналіз сечі за Нечипоренко",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 170,
    "aliases": [],
    "sortOrder": 213,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "63"
  },
  {
    "id": "official-231-008",
    "name": "Аналіз сечі на цукор (кількісний)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 214,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "400"
  },
  {
    "id": "official-231-009",
    "name": "Аналіз сечі на кетони (напівкількісний)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 215,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "405"
  },
  {
    "id": "official-231-010",
    "name": "Аналіз сечі на білок",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 216,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "406"
  },
  {
    "id": "official-231-011",
    "name": "Аналіз сечі на білок Бенс-Джонса",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 180,
    "aliases": [],
    "sortOrder": 217,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "34"
  },
  {
    "id": "official-231-012",
    "name": "Кліренс ендогенного креатиніну (Проба Реберга, визначення швидкості клубочкової фільтрації)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 280,
    "aliases": [],
    "sortOrder": 218,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "411"
  },
  {
    "id": "official-231-013",
    "name": "Креатинін в сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 219,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "387"
  },
  {
    "id": "official-231-014",
    "name": "Мікроальбумінурія у сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 260,
    "aliases": [],
    "sortOrder": 220,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "286"
  },
  {
    "id": "official-231-015",
    "name": "Альбумін-креатинінове співвідношення",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 260,
    "aliases": [],
    "sortOrder": 221,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "386"
  },
  {
    "id": "official-231-016",
    "name": "Аналіз сечі на добову протеїнурію (напівкількісний)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 222,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "407"
  },
  {
    "id": "official-231-017",
    "name": "Сечова кислота в сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 223,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "408"
  },
  {
    "id": "official-231-018",
    "name": "Діастаза сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 224,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "409"
  },
  {
    "id": "official-231-019",
    "name": "Кальцій в сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 225,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "402"
  },
  {
    "id": "official-231-020",
    "name": "Фосфор в сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 226,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "403"
  },
  {
    "id": "official-231-021",
    "name": "Магній в сечі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 227,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "404"
  },
  {
    "id": "official-231-022",
    "name": "Аналіз зішкрібу на яйця гостриків (ентеробіоз)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 240,
    "aliases": [],
    "sortOrder": 228,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "414"
  },
  {
    "id": "official-231-023",
    "name": "Копрограма",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 260,
    "aliases": [],
    "sortOrder": 229,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "412"
  },
  {
    "id": "official-231-024",
    "name": "Аналіз калу на яйця гельмінтів",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 230,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "413"
  },
  {
    "id": "official-231-025",
    "name": "Кальпротектин в калі (кількісне визначення)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 720,
    "aliases": [],
    "sortOrder": 231,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "276"
  },
  {
    "id": "official-231-026",
    "name": "Дослідження калу на приховану кров",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 260,
    "aliases": [],
    "sortOrder": 232,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "484"
  },
  {
    "id": "official-231-027",
    "name": "Лактоферин (кількісне визначення)",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 800,
    "aliases": [],
    "sortOrder": 233,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "966"
  },
  {
    "id": "official-231-028",
    "name": "Панкреатична еластаза в калі",
    "category": "general",
    "categoryLabel": "Загальноклінічні дослідження",
    "amount": 850,
    "aliases": [],
    "sortOrder": 234,
    "isActive": true,
    "turnaround": "4-5 дн.",
    "code": "935"
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
    "sortOrder": 235,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "720"
  },
  {
    "id": "official-232-001",
    "name": "Білірубін загальний",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 236,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "65"
  },
  {
    "id": "official-232-002",
    "name": "Білірубін прямий",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 237,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "66"
  },
  {
    "id": "official-232-003",
    "name": "Білірубіновий комплекс (білірубін загальний+ білірубін прямий + білірубін непрямий)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 250,
    "aliases": [
      "Білірубіновий комплекс (білірубін загальний+ білірубін прямий+ білірубін непрямий)"
    ],
    "sortOrder": 238,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "425"
  },
  {
    "id": "official-232-004",
    "name": "Глюкоза (венозна кров)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 239,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "90"
  },
  {
    "id": "official-232-005",
    "name": "Альфа-амілаза",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 240,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "223"
  },
  {
    "id": "official-232-006",
    "name": "Панкреатична амілаза",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 241,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "174"
  },
  {
    "id": "official-232-007",
    "name": "Ліпаза",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 242,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "274"
  },
  {
    "id": "official-232-008",
    "name": "Аланінамінотрансфераза (АЛТ)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 243,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "68"
  },
  {
    "id": "official-232-009",
    "name": "Аспартатамінотрансфераза (АСТ)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 244,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "69"
  },
  {
    "id": "official-232-010",
    "name": "g-Глутамілтрансфераза (ГГТ)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 245,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "220"
  },
  {
    "id": "official-232-011",
    "name": "Лактатдегідрогеназа (ЛДГ)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 246,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "221"
  },
  {
    "id": "official-232-012",
    "name": "Лужна фосфотаза (ЛФ)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 247,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "70"
  },
  {
    "id": "official-232-013",
    "name": "Тимолова проба",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 248,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "222"
  },
  {
    "id": "official-232-014",
    "name": "Креатинкіназа (КФК)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [
      "Креатинінкіназа (КФК)"
    ],
    "sortOrder": 249,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "230"
  },
  {
    "id": "official-232-015",
    "name": "Креатинін",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 250,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "87"
  },
  {
    "id": "official-232-017",
    "name": "Сечова кислота",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 251,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "226"
  },
  {
    "id": "official-232-018",
    "name": "Сечовина",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 252,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "88"
  },
  {
    "id": "official-232-019",
    "name": "Альбумін",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 253,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "228"
  },
  {
    "id": "official-232-020",
    "name": "Загальний білок",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 254,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "89"
  },
  {
    "id": "official-232-021",
    "name": "Білкові фракції",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 330,
    "aliases": [],
    "sortOrder": 255,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "229"
  },
  {
    "id": "official-232-022",
    "name": "Холестерин загальний",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 256,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "239"
  },
  {
    "id": "official-232-023",
    "name": "Тригліцериди",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 257,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "238"
  },
  {
    "id": "official-232-024",
    "name": "ЛПВЩ (HDL)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 258,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "6"
  },
  {
    "id": "official-232-025",
    "name": "ЛПНЩ (LDL)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 259,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "7"
  },
  {
    "id": "official-232-026",
    "name": "Холінестераза",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 180,
    "aliases": [],
    "sortOrder": 260,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "277"
  },
  {
    "id": "official-232-027",
    "name": "Натрій",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 261,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "233"
  },
  {
    "id": "official-232-028",
    "name": "Калій",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 262,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "232"
  },
  {
    "id": "official-232-029",
    "name": "Кальцій",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 263,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "234"
  },
  {
    "id": "official-232-030",
    "name": "Кальцій іонізований",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 264,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "278"
  },
  {
    "id": "official-232-031",
    "name": "Магній",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 265,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "280"
  },
  {
    "id": "official-232-032",
    "name": "Фосфор",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 266,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "235"
  },
  {
    "id": "official-232-033",
    "name": "Хлор",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 267,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "237"
  },
  {
    "id": "official-232-034",
    "name": "Мідь",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 350,
    "aliases": [],
    "sortOrder": 268,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "819"
  },
  {
    "id": "official-232-035",
    "name": "Цинк",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 400,
    "aliases": [],
    "sortOrder": 269,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "820"
  },
  {
    "id": "official-232-036",
    "name": "Церулоплазмін (мідна оксидаза)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 280,
    "aliases": [],
    "sortOrder": 270,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "231"
  },
  {
    "id": "official-232-037",
    "name": "Сіалові кислоти",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 271,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "361"
  },
  {
    "id": "official-232-038",
    "name": "Азот сечовини",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 140,
    "aliases": [],
    "sortOrder": 272,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "339"
  },
  {
    "id": "official-232-039",
    "name": "Аполіпопротеїн-А (Апо-А)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 273,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "243"
  },
  {
    "id": "official-232-040",
    "name": "Аполіпопротеїн-В (Апо-В)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 274,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "244"
  },
  {
    "id": "official-232-045",
    "name": "Вальпроєва кислота",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 380,
    "aliases": [],
    "sortOrder": 275,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "102"
  },
  {
    "id": "official-232-041",
    "name": "Аполіпопротеїн А-1",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 276,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "858"
  },
  {
    "id": "official-232-042",
    "name": "Аполіпопротеїн В",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 277,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "859"
  },
  {
    "id": "official-232-043",
    "name": "Визначення рН крові",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 150,
    "aliases": [],
    "sortOrder": 278,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "1451"
  },
  {
    "id": "official-232-044",
    "name": "Цистатин С",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 279,
    "isActive": true,
    "turnaround": "8 дн.",
    "code": "1857"
  },
  {
    "id": "official-232-046",
    "name": "Індекс фіброзу печінки FIB-4 (АЛТ, АСТ, ЗАК)",
    "category": "biochemistry",
    "categoryLabel": "Біохімічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 280,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "99"
  },
  {
    "id": "official-233-002",
    "name": "Глюкоза (експрес-тест)",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 120,
    "aliases": [],
    "sortOrder": 281,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "802"
  },
  {
    "id": "official-233-003",
    "name": "Глікозильований гемоглобін",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 290,
    "aliases": [],
    "sortOrder": 282,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "331"
  },
  {
    "id": "official-233-004",
    "name": "Глюкоза (венозна кров)+толерантний тест",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 280,
    "aliases": [],
    "sortOrder": 283,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "600"
  },
  {
    "id": "official-233-005",
    "name": "індекс НОМА + Глюкоза + інсулін",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 390,
    "aliases": [
      "індекс НОМА+Глюкоза+інсулін"
    ],
    "sortOrder": 284,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "389"
  },
  {
    "id": "official-233-006",
    "name": "Інсулін",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 290,
    "aliases": [],
    "sortOrder": 285,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "218"
  },
  {
    "id": "official-233-007",
    "name": "С-пептид",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 290,
    "aliases": [],
    "sortOrder": 286,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "319"
  },
  {
    "id": "official-233-008",
    "name": "Лактат",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 300,
    "aliases": [],
    "sortOrder": 287,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "275"
  },
  {
    "id": "official-233-010",
    "name": "GADA Антитіла до глутамінокислої декарбоксилази",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 800,
    "aliases": [],
    "sortOrder": 288,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "1886"
  },
  {
    "id": "official-233-009",
    "name": "Лептин (LEP)",
    "category": "diabetes",
    "categoryLabel": "Панель цукрового діабету",
    "amount": 600,
    "aliases": [],
    "sortOrder": 289,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "355"
  },
  {
    "id": "official-234-001",
    "name": "Активований частковий тромбопластичний час (АЧТЧ)",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 150,
    "aliases": [],
    "sortOrder": 290,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "419"
  },
  {
    "id": "official-234-002",
    "name": "Коагулограма",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 450,
    "aliases": [],
    "sortOrder": 291,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "201"
  },
  {
    "id": "official-234-003",
    "name": "Протромбіновий тест (протромбіновий індекс за Квіком, протромбіновий час, МНВ (INR)",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 180,
    "aliases": [],
    "sortOrder": 292,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "417"
  },
  {
    "id": "official-234-004",
    "name": "Тромбіновий час",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 150,
    "aliases": [],
    "sortOrder": 293,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1201"
  },
  {
    "id": "official-234-005",
    "name": "Фібриноген",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 150,
    "aliases": [],
    "sortOrder": 294,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "418"
  },
  {
    "id": "official-234-006",
    "name": "Вовчаковий антикоагулянт",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 500,
    "aliases": [],
    "sortOrder": 295,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "420"
  },
  {
    "id": "official-234-007",
    "name": "Д-димер",
    "category": "hemostasis",
    "categoryLabel": "Показники гемостазу",
    "amount": 290,
    "aliases": [],
    "sortOrder": 296,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "421"
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
    "sortOrder": 297,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "91"
  },
  {
    "id": "official-235-002",
    "name": "Т4 вільний (Т4)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 250,
    "aliases": [],
    "sortOrder": 298,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "92"
  },
  {
    "id": "official-235-003",
    "name": "Т3 загальний (Т3)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 250,
    "aliases": [],
    "sortOrder": 299,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "93"
  },
  {
    "id": "official-235-004",
    "name": "Т3 вільний (FT3)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 250,
    "aliases": [],
    "sortOrder": 300,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "369"
  },
  {
    "id": "official-235-005",
    "name": "Т4 загальний (Т4)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 250,
    "aliases": [],
    "sortOrder": 301,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "376"
  },
  {
    "id": "official-235-006",
    "name": "Антитіла до тиреоглобуліну (А-ТГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 302,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "121"
  },
  {
    "id": "official-235-007",
    "name": "Тиреоглобулін (ТГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 303,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "123"
  },
  {
    "id": "official-235-008",
    "name": "Антитіла до тиреопероксидази (АТПО)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 300,
    "aliases": [],
    "sortOrder": 304,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "124"
  },
  {
    "id": "official-235-009",
    "name": "Кальцитонін",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 450,
    "aliases": [],
    "sortOrder": 305,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "290"
  },
  {
    "id": "official-235-010",
    "name": "Паратгормон",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 300,
    "aliases": [],
    "sortOrder": 306,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "291"
  },
  {
    "id": "official-235-011",
    "name": "Антитіла до рецепторів ТТГ",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 540,
    "aliases": [],
    "sortOrder": 307,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "377"
  },
  {
    "id": "official-235-012",
    "name": "Фолікулостимулюючий гормон (ФСГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 308,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "94"
  },
  {
    "id": "official-235-013",
    "name": "Лютеїнізуючий гормон (ЛГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 309,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "95"
  },
  {
    "id": "official-235-014",
    "name": "Пролактин (ПРЛ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 310,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "96"
  },
  {
    "id": "official-235-015",
    "name": "Пролактин з розведенням",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 311,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "42"
  },
  {
    "id": "official-235-016",
    "name": "Естрадіол (Е2)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 312,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "97"
  },
  {
    "id": "official-235-017",
    "name": "Прогестерон (ПРГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 313,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "98"
  },
  {
    "id": "official-235-018",
    "name": "Тестостерон (ТСТ загальний)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 314,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "100"
  },
  {
    "id": "official-235-019",
    "name": "Тестостерон вільний (ТСТ вільний)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 300,
    "aliases": [],
    "sortOrder": 315,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "101"
  },
  {
    "id": "official-235-020",
    "name": "Глобулін, що зв’язує статеві гормони (ГЗСГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 316,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "137"
  },
  {
    "id": "official-235-021",
    "name": "17-оксіпрогестерон (17-ОНПРГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 317,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "144"
  },
  {
    "id": "official-235-022",
    "name": "Дегідроепіандростерон-сульфат (ДГЕА-с)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 290,
    "aliases": [],
    "sortOrder": 318,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "146"
  },
  {
    "id": "official-235-023",
    "name": "Андростендіон",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 420,
    "aliases": [],
    "sortOrder": 319,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "147"
  },
  {
    "id": "official-235-024",
    "name": "Кортизол (в сироватці) (КР)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 340,
    "aliases": [],
    "sortOrder": 320,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "131"
  },
  {
    "id": "official-235-025",
    "name": "Антиспермальні антитіла (кров)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 380,
    "aliases": [],
    "sortOrder": 321,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "180"
  },
  {
    "id": "official-235-026",
    "name": "Антиспермальні антитіла (еякулят/слиз)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 380,
    "aliases": [],
    "sortOrder": 322,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "181"
  },
  {
    "id": "official-235-027",
    "name": "Антимюллерів гормон",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 670,
    "aliases": [],
    "sortOrder": 323,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "37"
  },
  {
    "id": "official-235-028",
    "name": "Дигідротестостерон",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 450,
    "aliases": [],
    "sortOrder": 324,
    "isActive": true,
    "turnaround": "4-5 дн.",
    "code": "378"
  },
  {
    "id": "official-235-029",
    "name": "Індекс вільного тестостерону (ТСТ заг./ГЗСГх100)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 460,
    "aliases": [
      "Індекс вільного тестостерону (ТСТ зг./ГЗСГх100)"
    ],
    "sortOrder": 325,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "392"
  },
  {
    "id": "official-235-030",
    "name": "Макропролактин",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 580,
    "aliases": [],
    "sortOrder": 326,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "743"
  },
  {
    "id": "official-235-031",
    "name": "Інгібін В (Ing B)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 780,
    "aliases": [],
    "sortOrder": 327,
    "isActive": true,
    "turnaround": "4-5 дн.",
    "code": "503"
  },
  {
    "id": "official-235-032",
    "name": "Андростендіола глюкуронід (3-альфа-Діол)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 550,
    "aliases": [],
    "sortOrder": 328,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "1544"
  },
  {
    "id": "official-235-033",
    "name": "Адренокортикотропний гормон (АКТГ)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 400,
    "aliases": [],
    "sortOrder": 329,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "130"
  },
  {
    "id": "official-235-035",
    "name": "Кортизол (в добовій сечі) (КР)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 340,
    "aliases": [],
    "sortOrder": 330,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "132"
  },
  {
    "id": "official-235-036",
    "name": "Кортизол (слина)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 390,
    "aliases": [],
    "sortOrder": 331,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "854"
  },
  {
    "id": "official-235-037",
    "name": "Метанефрини загальні (у добовій сечі)",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 750,
    "aliases": [],
    "sortOrder": 332,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "921"
  },
  {
    "id": "official-235-038",
    "name": "Альдостерон",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 520,
    "aliases": [],
    "sortOrder": 333,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "287"
  },
  {
    "id": "official-235-039",
    "name": "Альдостерон-ренінове співвідношення",
    "category": "hormones",
    "categoryLabel": "Гормони",
    "amount": 1560,
    "aliases": [],
    "sortOrder": 334,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "922"
  },
  {
    "id": "official-236-001",
    "name": "Соматотропний гормон (СТГ) (ЕХЛ) ROCHE",
    "category": "growth",
    "categoryLabel": "Фактори росту",
    "amount": 300,
    "aliases": [],
    "sortOrder": 335,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "288"
  },
  {
    "id": "official-236-002",
    "name": "Інсуліноподібний фактор росту, соматомедин С (IGF-1)",
    "category": "growth",
    "categoryLabel": "Фактори росту",
    "amount": 460,
    "aliases": [],
    "sortOrder": 336,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "129"
  },
  {
    "id": "official-237-001",
    "name": "Асоційований з вагітністю протеїн – А (РАРР-А)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 280,
    "aliases": [],
    "sortOrder": 337,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "136"
  },
  {
    "id": "official-237-002",
    "name": "Естріол некон’югований (Е3)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 280,
    "aliases": [],
    "sortOrder": 338,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "142"
  },
  {
    "id": "official-237-003",
    "name": "Бета-хоріонічний гонадотропін (ХГЛ загальний)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 280,
    "aliases": [],
    "sortOrder": 339,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "145"
  },
  {
    "id": "official-237-004",
    "name": "Бета-хоріонічний гонадотропін вільний (В-ХГЛ)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 280,
    "aliases": [],
    "sortOrder": 340,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "325"
  },
  {
    "id": "official-237-005",
    "name": "PRISCA 1 вагітність 8-13 тижнів (В-ХГЛ, РАРР-А) Пренатальний (біохімічний) скринінг (останнє УЗД)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 570,
    "aliases": [],
    "sortOrder": 341,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "357"
  },
  {
    "id": "official-237-006",
    "name": "PRISCA 2 вагітність 14-21 тижнів (ХГЛ, АФП, UЕ3) Пренатальний (біохімічний) скринінг (останнє УЗД)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 630,
    "aliases": [],
    "sortOrder": 342,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "358"
  },
  {
    "id": "official-237-007",
    "name": "Плацентарний лактоген",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 420,
    "aliases": [],
    "sortOrder": 343,
    "isActive": true,
    "turnaround": "4-5 дн.",
    "code": "370"
  },
  {
    "id": "official-237-008",
    "name": "Альфа-фетопротеїн (AFP) (вагітні)",
    "category": "prenatal",
    "categoryLabel": "Пренатальна діагностика",
    "amount": 280,
    "aliases": [],
    "sortOrder": 344,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "512"
  },
  {
    "id": "official-238-001",
    "name": "В2 мікроглобулін",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 340,
    "aliases": [],
    "sortOrder": 345,
    "isActive": true,
    "turnaround": "4-5 дн.",
    "code": "35"
  },
  {
    "id": "official-238-002",
    "name": "Альфа-фетопротеїн (АФП)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 280,
    "aliases": [],
    "sortOrder": 346,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "191"
  },
  {
    "id": "official-238-003",
    "name": "Онкомаркер ХГЛ (загальна В-субодиниця)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 280,
    "aliases": [],
    "sortOrder": 347,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "148"
  },
  {
    "id": "official-238-004",
    "name": "Раково-ембріональний антиген (СЕА)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 280,
    "aliases": [],
    "sortOrder": 348,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "192"
  },
  {
    "id": "official-238-005",
    "name": "Простат-специфічний антиген загальний (ПСА загальний)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 280,
    "aliases": [],
    "sortOrder": 349,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "193"
  },
  {
    "id": "official-238-006",
    "name": "Простат-специфічний антиген вільний (ПСА вільний)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 280,
    "aliases": [],
    "sortOrder": 350,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "194"
  },
  {
    "id": "official-238-007",
    "name": "Онкомаркер шлунку (СА 72-4)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 480,
    "aliases": [],
    "sortOrder": 351,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "195"
  },
  {
    "id": "official-238-008",
    "name": "Простата- специфічний антиген (ПСА загальний +ПСА вільний",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 530,
    "aliases": [
      "Простата- специфічний антиген (ПСА загальний +ПСА вільний)"
    ],
    "sortOrder": 352,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "268"
  },
  {
    "id": "official-238-009",
    "name": "Простатична кисла фосфотаза (PAP)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 350,
    "aliases": [],
    "sortOrder": 353,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "379"
  },
  {
    "id": "official-238-010",
    "name": "Онкомаркер підшлункової залози (СА 19-9)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 300,
    "aliases": [],
    "sortOrder": 354,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "196"
  },
  {
    "id": "official-238-011",
    "name": "Онкомаркер молочної залози (СА 15-3)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 300,
    "aliases": [],
    "sortOrder": 355,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "197"
  },
  {
    "id": "official-238-012",
    "name": "Онкомаркер яєчників (СА 125)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 300,
    "aliases": [],
    "sortOrder": 356,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "198"
  },
  {
    "id": "official-238-013",
    "name": "Онкомаркер CYFRA CA 21-1 (фрагмент цитокератину 19)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 400,
    "aliases": [],
    "sortOrder": 357,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "215"
  },
  {
    "id": "official-238-014",
    "name": "Нейроенолаза (NSE)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 490,
    "aliases": [],
    "sortOrder": 358,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "216"
  },
  {
    "id": "official-238-015",
    "name": "Антиген плоскоклітинної карциноми (SCC)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 500,
    "aliases": [],
    "sortOrder": 359,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "165"
  },
  {
    "id": "official-238-016",
    "name": "Онкомаркер раку яєчників (НЕ-4)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 570,
    "aliases": [],
    "sortOrder": 360,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "380"
  },
  {
    "id": "official-238-017",
    "name": "Онкомаркер ШКТ (СА-242)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 500,
    "aliases": [],
    "sortOrder": 361,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "900"
  },
  {
    "id": "official-238-018",
    "name": "Індекс ROMA (HE-4 + CA-125)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 750,
    "aliases": [],
    "sortOrder": 362,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1202"
  },
  {
    "id": "official-238-020",
    "name": "Плацентарний фактор росту",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 700,
    "aliases": [],
    "sortOrder": 363,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "1203"
  },
  {
    "id": "official-238-019",
    "name": "Онкомаркер підшлункової залози (СА 50)",
    "category": "oncology",
    "categoryLabel": "Онкологічні маркери",
    "amount": 500,
    "aliases": [],
    "sortOrder": 364,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "838"
  },
  {
    "id": "official-239-001",
    "name": "С-реактивний білок, СРБ (кількісний)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 180,
    "aliases": [
      "С-реактивний білок, СРБ (кількісний), високої чутливості"
    ],
    "sortOrder": 365,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "208"
  },
  {
    "id": "official-239-002",
    "name": "Ревматоїдний фактор, РФ (кількісний)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 180,
    "aliases": [],
    "sortOrder": 366,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "800"
  },
  {
    "id": "official-239-003",
    "name": "Антистрептолізин «О», АСЛО (кількісний)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 180,
    "aliases": [],
    "sortOrder": 367,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "801"
  },
  {
    "id": "official-239-004",
    "name": "Серомукоїди",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 160,
    "aliases": [],
    "sortOrder": 368,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "354"
  },
  {
    "id": "official-239-005",
    "name": "Антинуклеарні антитіла (ANA-скинінг)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 570,
    "aliases": [],
    "sortOrder": 369,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "254"
  },
  {
    "id": "official-239-006",
    "name": "ANA – профіль (U1-snRNP, Sm, SS-A(Ro), Ro-52, SS-B, Scl-70, PM-Scl, Jo-1, CENP-B, PCNA, dsDNA, Nucleosomes, Histones, P-protein, AMA-M2, Мі-2, Ku)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 1600,
    "aliases": [],
    "sortOrder": 370,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1207"
  },
  {
    "id": "official-239-007",
    "name": "Антитіла до циклічного цітрулінового пептиду (AntiCCP)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 550,
    "aliases": [
      "Антитіла до циклічного цітруліновому пептиду (AntiCCP)"
    ],
    "sortOrder": 371,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "486"
  },
  {
    "id": "official-239-008",
    "name": "Креатинкіназа-МВ (КФК-МВ)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 250,
    "aliases": [],
    "sortOrder": 372,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "812"
  },
  {
    "id": "official-239-009",
    "name": "Антитіла до 1-спіральної ДНК (ADNA 1)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 373,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "252"
  },
  {
    "id": "official-239-010",
    "name": "Антитіла до 2-спіральної ДНК (ADNA 2)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 374,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "253"
  },
  {
    "id": "official-239-011",
    "name": "Антимітохондріальні антитіла (АМА-М2)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 375,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "482"
  },
  {
    "id": "official-239-012",
    "name": "Антитіла до цітрулінірованого віментину (Anti-MCV IgG)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 690,
    "aliases": [],
    "sortOrder": 376,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "485"
  },
  {
    "id": "official-239-013",
    "name": "Тропонін І (кількісне визначення)",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 280,
    "aliases": [],
    "sortOrder": 377,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "391"
  },
  {
    "id": "official-239-014",
    "name": "Гомоцистеїн",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 550,
    "aliases": [],
    "sortOrder": 378,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "395"
  },
  {
    "id": "official-239-015",
    "name": "Прокальцитонін",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 750,
    "aliases": [],
    "sortOrder": 379,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "590"
  },
  {
    "id": "official-239-016",
    "name": "Мозковий натрій уретичний пептид",
    "category": "rheumatology",
    "categoryLabel": "Кардіо-ревматоїдна панель",
    "amount": 1050,
    "aliases": [],
    "sortOrder": 380,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "393"
  },
  {
    "id": "official-240-001",
    "name": "Залізо (сироватка)",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 150,
    "aliases": [],
    "sortOrder": 381,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "236"
  },
  {
    "id": "official-240-002",
    "name": "Залізо-зв’язуюча здатність сироватки крові загальна",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 250,
    "aliases": [],
    "sortOrder": 382,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "246"
  },
  {
    "id": "official-240-003",
    "name": "Трансферин",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 270,
    "aliases": [],
    "sortOrder": 383,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "247"
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
    "sortOrder": 384,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "248"
  },
  {
    "id": "official-240-005",
    "name": "Фолієва кислота (Вітамін В9)",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 300,
    "aliases": [],
    "sortOrder": 385,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "249"
  },
  {
    "id": "official-240-006",
    "name": "Цианкобаламін (Вітамін В12)",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 300,
    "aliases": [],
    "sortOrder": 386,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "250"
  },
  {
    "id": "official-240-007",
    "name": "Пряма проба Кумбса",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 400,
    "aliases": [],
    "sortOrder": 387,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "422"
  },
  {
    "id": "official-240-008",
    "name": "Еритропоетин",
    "category": "anemia",
    "categoryLabel": "Панель контролю анемії",
    "amount": 480,
    "aliases": [],
    "sortOrder": 388,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "1782"
  },
  {
    "id": "official-241-001",
    "name": "Аналіз крові на LE-клітини",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 270,
    "aliases": [],
    "sortOrder": 389,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "202"
  },
  {
    "id": "official-241-002",
    "name": "Циркулюючі імунокомплекси (ЦІК)",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 300,
    "aliases": [],
    "sortOrder": 390,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "211"
  },
  {
    "id": "official-241-003",
    "name": "Імунні антитіла до еритроцитів по системі Резус",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 480,
    "aliases": [],
    "sortOrder": 391,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "261"
  },
  {
    "id": "official-241-004",
    "name": "Гемолізини (імунні антитіла по системі ABO)",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 392,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "263"
  },
  {
    "id": "official-241-006",
    "name": "Вміст сироваткового імуноглобуліну A",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 250,
    "aliases": [],
    "sortOrder": 393,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "473"
  },
  {
    "id": "official-241-007",
    "name": "Вміст сироваткового імуноглобуліну M",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 250,
    "aliases": [],
    "sortOrder": 394,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "474"
  },
  {
    "id": "official-241-008",
    "name": "Вміст сироваткового імуноглобуліну G",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 250,
    "aliases": [],
    "sortOrder": 395,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "475"
  },
  {
    "id": "official-241-009",
    "name": "Антитіла Ig G до фосфоліпідів (APHL Ig G)",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 396,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "255"
  },
  {
    "id": "official-241-010",
    "name": "Антитіла Ig M до фосфоліпідів (APHL Ig M)",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 397,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "256"
  },
  {
    "id": "official-241-011",
    "name": "Печінковий блот Liver 7G. Антитіла IgG проти AMA-M2, LKM-1, LC-1, SLA/LP, Mi-2, Ku",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 900,
    "aliases": [],
    "sortOrder": 398,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1208"
  },
  {
    "id": "official-241-012",
    "name": "Антитіла IgG до гліадину",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 440,
    "aliases": [
      "Антитіла IgG до гліадіну"
    ],
    "sortOrder": 399,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "487"
  },
  {
    "id": "official-241-013",
    "name": "Антитіла IgA до гліадину",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 400,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "488"
  },
  {
    "id": "official-241-014",
    "name": "Антитіла IgG до кардіоліпіну",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 401,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "492"
  },
  {
    "id": "official-241-015",
    "name": "Антитіла IgМ до кардіоліпіну",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 402,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "493"
  },
  {
    "id": "official-241-016",
    "name": "Антитіла IgG до бета-2-глікопротеїну I",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 403,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "884"
  },
  {
    "id": "official-241-017",
    "name": "Антитіла IgM до бета-2-глікопротеїну I",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 440,
    "aliases": [],
    "sortOrder": 404,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "885"
  },
  {
    "id": "official-241-018",
    "name": "Мікросоми печінки і нирок, антитіла сумарні (LKM)",
    "category": "immunology",
    "categoryLabel": "Імунологічна панель",
    "amount": 400,
    "aliases": [],
    "sortOrder": 405,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "122"
  },
  {
    "id": "official-242-001",
    "name": "Остеокальцин",
    "category": "osteoporosis",
    "categoryLabel": "Панель остеопорозу",
    "amount": 350,
    "aliases": [],
    "sortOrder": 406,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "289"
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
    "sortOrder": 407,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "828"
  },
  {
    "id": "official-243-001",
    "name": "Мікроскопія урогенітального зішкрібу (жінки)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 408,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "16"
  },
  {
    "id": "official-243-002",
    "name": "Мікроскопія урогенітального зішкрібу (чоловіки)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 409,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "21"
  },
  {
    "id": "official-243-003",
    "name": "Мікроскопія вагінальних виділень за крітеріями Хей-Айсон (Hay-Ison)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 300,
    "aliases": [],
    "sortOrder": 410,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "865"
  },
  {
    "id": "official-243-004",
    "name": "Цитоморфологічне дослідження епітелію на атипові клітини (жінки)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 240,
    "aliases": [],
    "sortOrder": 411,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "9"
  },
  {
    "id": "official-243-005",
    "name": "Аналіз секрету передміхурової залози",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 412,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "22"
  },
  {
    "id": "official-243-006",
    "name": "Мікроскопічне дослідження відбитку з головки статевого члена",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 413,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "40"
  },
  {
    "id": "official-243-007",
    "name": "Гормональна кольпоцитологія",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 414,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "15"
  },
  {
    "id": "official-243-008",
    "name": "Цитоморфологічне дослідження виділень із соска молочної залози",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 400,
    "aliases": [],
    "sortOrder": 415,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "149"
  },
  {
    "id": "official-243-009",
    "name": "Цитологічне дослідження тонкоголкових пункційних біопсій молочної залози (1 локація)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 416,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "2001"
  },
  {
    "id": "official-243-010",
    "name": "Цитоморфологічне дослідження біологічного матеріалу (пунктати)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 500,
    "aliases": [
      "Цитоморфологічне дослідження біологічного матеріалу"
    ],
    "sortOrder": 417,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "2000"
  },
  {
    "id": "official-243-011",
    "name": "ПАП-ТЕСТ, цитологічне дослідження епітелію (скло)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 300,
    "aliases": [],
    "sortOrder": 418,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "659"
  },
  {
    "id": "official-243-012",
    "name": "Рідинна цитологія (ПАП-тест)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 570,
    "aliases": [],
    "sortOrder": 419,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "850"
  },
  {
    "id": "official-243-013",
    "name": "Аналіз калу на лямблії (мікроскопія)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 420,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "658"
  },
  {
    "id": "official-243-014",
    "name": "Назоцитограма",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 421,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "803"
  },
  {
    "id": "official-243-015",
    "name": "Дослідження на паразитарні гриби (все, окрім нігтів)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [
      "Дослідження на паразитарні гриби (все, крім нігтів)"
    ],
    "sortOrder": 422,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "804"
  },
  {
    "id": "official-243-016",
    "name": "Мікроскопічне дослідження нігтів на патагенні гриби (мікроскопія)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 423,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "1119"
  },
  {
    "id": "official-243-017",
    "name": "Дослідження на демодекоз (Demodex follicullorum)",
    "category": "cytology",
    "categoryLabel": "Цитологічні та мікроскопічні дослідження",
    "amount": 220,
    "aliases": [],
    "sortOrder": 424,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "999"
  },
  {
    "id": "official-244-001",
    "name": "Антитіла IgМ до вірусу гепатиту А (HAV IgМ)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 320,
    "aliases": [],
    "sortOrder": 425,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "176"
  },
  {
    "id": "official-244-002",
    "name": "ПЛР. Визначення РНК вірусу гепатиту А (плазма, якісне визначення)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 580,
    "aliases": [],
    "sortOrder": 426,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "335"
  },
  {
    "id": "official-244-003",
    "name": "HBsAg поверхневий антиген вірусу гепатиту В",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 320,
    "aliases": [],
    "sortOrder": 427,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "265"
  },
  {
    "id": "official-244-004",
    "name": "Антитіла IgG до вірусу гепатиту В (Anti- HBsAg, кількісне визначення)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 428,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "170"
  },
  {
    "id": "official-244-005",
    "name": "HBеAg вірусу гепатиту В",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 429,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "173"
  },
  {
    "id": "official-244-006",
    "name": "Сумарні антитіла до HBеAg вірусу гепатиту В (Anti- HBеAg)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 430,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "430"
  },
  {
    "id": "official-244-007",
    "name": "Антитіла IgМ до вірусу гепатиту В (Anti- HBcor IgM)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 431,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "171"
  },
  {
    "id": "official-244-008",
    "name": "Антитіла IgG до вірусу гепатиту В (Anti- HBcor IgG)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 432,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "172"
  },
  {
    "id": "official-244-009",
    "name": "Загальні антитіла до корового антигену вірусу гепатиту В (Anti- HBcor)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 433,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "431"
  },
  {
    "id": "official-244-010",
    "name": "ПЛР. Визначення ДНК вірусу гепатиту В (плазма, якісне визначення)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 580,
    "aliases": [],
    "sortOrder": 434,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "336"
  },
  {
    "id": "official-244-011",
    "name": "ПЛР. Кількісне визначення ДНК вірусу гепатиту В (Real-time) (плазма)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 990,
    "aliases": [],
    "sortOrder": 435,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "432"
  },
  {
    "id": "official-244-012",
    "name": "Сумарні антитіла до вірусу гепатиту С (HCV total)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 320,
    "aliases": [],
    "sortOrder": 436,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "340"
  },
  {
    "id": "official-244-013",
    "name": "Антитіла IgM до вірусу гепатиту С (HCV IgM)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 320,
    "aliases": [],
    "sortOrder": 437,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "433"
  },
  {
    "id": "official-244-014",
    "name": "Антитіла IgG до вірусу гепатиту С (HCV IgG)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 320,
    "aliases": [],
    "sortOrder": 438,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "434"
  },
  {
    "id": "official-244-015",
    "name": "Антитіла IgG до вірусу гепатиту С (Anti- HCV IgG corеАg, NS3, NS4, NS5) БЛОТ-аналіз",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 550,
    "aliases": [],
    "sortOrder": 439,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "175"
  },
  {
    "id": "official-244-016",
    "name": "ПЛР. Визначення РНК вірусу гепатиту С (плазма, якісне визначення)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 590,
    "aliases": [],
    "sortOrder": 440,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "337"
  },
  {
    "id": "official-244-017",
    "name": "ПЛР. Кількісне визначення РНК вірусу гепатиту С (Real-time) (плазма)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 1150,
    "aliases": [],
    "sortOrder": 441,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "115"
  },
  {
    "id": "official-244-018",
    "name": "ПЛР. Генотипування РНК вірусу гепатиту С (1а, 1b, 2,3a) (Real-time) (плазма)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 442,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "114"
  },
  {
    "id": "official-244-019",
    "name": "ПЛР. Визначення РНК вірусу гепатиту D (плазма, якісне визначення)",
    "category": "infections",
    "categoryLabel": "Інфекції",
    "amount": 550,
    "aliases": [],
    "sortOrder": 443,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "338"
  },
  {
    "id": "official-245-001",
    "name": "Антитіла до ВІЛ 1/2 тип",
    "category": "hiv",
    "categoryLabel": "ВІЛ/СНІД",
    "amount": 260,
    "aliases": [],
    "sortOrder": 444,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1111"
  },
  {
    "id": "official-245-002",
    "name": "Антитіла до ВІЛ (HIV1/HIV2 та р24 Аg)",
    "category": "hiv",
    "categoryLabel": "ВІЛ/СНІД",
    "amount": 400,
    "aliases": [
      "Антитіла до ВІЛ (НІV1/HIV2 та p24 Ag)"
    ],
    "sortOrder": 445,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "1461"
  },
  {
    "id": "official-246-001",
    "name": "Антитіла IgM до цитомегаловірусу (CMV)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 446,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "112"
  },
  {
    "id": "official-246-002",
    "name": "Антитіла IgG до цитомегаловірусу (CMV)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 447,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "113"
  },
  {
    "id": "official-246-003",
    "name": "Авідність антитіл IgG до цитомегаловірусу (CMV)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 448,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "645"
  },
  {
    "id": "official-246-004",
    "name": "ПЛР. Визначення ДНК цитомегаловірусу кількісне визначення (кров, ліквор, слина, зішкріб, сеча)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 449,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "293"
  },
  {
    "id": "official-246-005",
    "name": "ПЛР. Визначення ДНК цитомегаловірусу (СМV) якісне визначення (кров, зішкріб, сеча, ліквор, слина)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 450,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "77"
  },
  {
    "id": "official-246-006",
    "name": "Антитіла IgМ до вірусу герпесу 1 типу (HSV 1)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 451,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "109"
  },
  {
    "id": "official-246-007",
    "name": "Антитіла IgG до вірусу герпесу 1 типу (HSV 1)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 452,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "110"
  },
  {
    "id": "official-246-010",
    "name": "Авідність антитіл IgG до вірусу герпесу 1 типу",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 453,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "655"
  },
  {
    "id": "official-246-008",
    "name": "Антитіла IgМ до вірусу герпесу 2 типу (HSV 2)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 454,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "309"
  },
  {
    "id": "official-246-009",
    "name": "Антитіла IgG до вірусу герпесу 2 типу (HSV 2)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 455,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "111"
  },
  {
    "id": "official-246-011",
    "name": "Авідність антитіл IgG до вірусу герпесу 2 типу",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 456,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "644"
  },
  {
    "id": "official-246-012",
    "name": "Антитіла IgG до вірусу герпеса 1/2 (HSV 1/2)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 457,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "656"
  },
  {
    "id": "official-246-013",
    "name": "Антитіла IgМ до вірусу герпеса 1/2 (HSV 1/2)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 458,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "657"
  },
  {
    "id": "official-246-014",
    "name": "ПЛР. Вірусу герпесу 1/2 типу, якісне визначення (зішкріб)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 459,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "76"
  },
  {
    "id": "official-246-015",
    "name": "ПЛР. Вірус герпесу 1/2 типу, кількісне визначення (зішкріб, сеча)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 460,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "902"
  },
  {
    "id": "official-246-016",
    "name": "Антитіла IgМ до вірусу герпесу 3 типу (Varicella Zoster IgМ)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 461,
    "isActive": true,
    "turnaround": "4-5 дн.",
    "code": "139"
  },
  {
    "id": "official-246-017",
    "name": "Антитіла IgG до вірусу герпесу 3 типу (Varicella Zoster IgG)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 462,
    "isActive": true,
    "turnaround": "4-5 дн.",
    "code": "138"
  },
  {
    "id": "official-246-018",
    "name": "ПЛР Вірус Varicella Zoster (3 тип герпесу, VZV) (кров, урогенітальний зішкріб), якісно",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 463,
    "isActive": true,
    "turnaround": "4-5 дн.",
    "code": "1932"
  },
  {
    "id": "official-246-019",
    "name": "Антитіла IgG до вірусу герпесу 6 типу",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 464,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "140"
  },
  {
    "id": "official-246-020",
    "name": "ПЛР. Визначення ДНК вірусу герпесу (HSV1 і HSV2), кількісно. Визначення і типування в режимі Real-time",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 465,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "362"
  },
  {
    "id": "official-246-021",
    "name": "ПЛР. Визначення ДНК вірусу герпесу 6 типу, кількісне визначення (будь якій матеріал)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 330,
    "aliases": [
      "ПЛР. Визначення ДНК вірусу герпесу 6 типу, кількісне визначення"
    ],
    "sortOrder": 466,
    "isActive": true,
    "turnaround": "4-5 дн.",
    "code": "836"
  },
  {
    "id": "official-246-022",
    "name": "ПЛР. Вірус герпесу 7 типу, якісно",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 467,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "1908"
  },
  {
    "id": "official-246-023",
    "name": "Антитіла IgM до капсидного антигену вірусу Епштейна-Барр (VCA IgM)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 468,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "333"
  },
  {
    "id": "official-246-024",
    "name": "Антитіла IgG до капсидного антигену вірусу Епштейна-Барр (VCA IgG)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 469,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "334"
  },
  {
    "id": "official-246-025",
    "name": "ПЛР. Визначення ДНК вірусу Епштейна-Барр, якісне визначення (кров, ліквор, зішкріб, слина)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 470,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "332"
  },
  {
    "id": "official-246-026",
    "name": "ПЛР. Визначення ДНК вірусу Епштейна-Барр, кількісне визначення (кров, ліквор, зішкріб, слина)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 471,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "330"
  },
  {
    "id": "official-246-027",
    "name": "Антитіла IgG до нуклеарного антигену Епштейн-Барр (EBNA)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 472,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "440"
  },
  {
    "id": "official-246-028",
    "name": "Антитіла IgM до токсоплазми (Toxo IgM)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 473,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "107"
  },
  {
    "id": "official-246-029",
    "name": "Антитіла IgG до токсоплазми (Toxo IgG)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 474,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "108"
  },
  {
    "id": "official-246-030",
    "name": "Авідність антитіл IgG до токсоплазми (Toxoplasma gondii)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 475,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "642"
  },
  {
    "id": "official-246-031",
    "name": "ПЛР. Визначення ДНК токсоплазми, якісне визначення (кров, зішкріб, ліквор)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 476,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "313"
  },
  {
    "id": "official-246-032",
    "name": "Антитіла IgG до вірусу краснухи (Rub IgG)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 477,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "188"
  },
  {
    "id": "official-246-033",
    "name": "Антитіла IgМ до вірусу краснухи (Rub IgМ)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 478,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "189"
  },
  {
    "id": "official-246-034",
    "name": "Авідність антитіл IgG до вірусу краснухи (Rub IgG)",
    "category": "torch",
    "categoryLabel": "TORCH-інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 479,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "851"
  },
  {
    "id": "official-247-001",
    "name": "Антитіла IgA до хламідій",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 480,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "106"
  },
  {
    "id": "official-247-002",
    "name": "Антитіла IgG до хламідій (Chlamydia trachomatis IgG)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 481,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "104"
  },
  {
    "id": "official-247-003",
    "name": "Антитіла IgМ до хламідій (Chlamydia trachomatis IgМ)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 482,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "105"
  },
  {
    "id": "official-247-004",
    "name": "ПЛР. Визначення ДНК до хламідії трахоматіс (Chlamydia trachomatis), якісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 483,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "72"
  },
  {
    "id": "official-247-005",
    "name": "ПЛР. Визначення ДНК до хламідії трахоматіс (Chlamydia trachomatis), кількісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 484,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "904"
  },
  {
    "id": "official-247-006",
    "name": "Антитіла IgG до мікоплазма хомініс (Mycoplasma hominis)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 485,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "445"
  },
  {
    "id": "official-247-007",
    "name": "ПЛР. Визначення ДНК до мікоплазма хомініс (Mycoplasma hominis), якісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 486,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "74"
  },
  {
    "id": "official-247-008",
    "name": "ПЛР. Визначення ДНК до мікоплазма хомініс (Mycoplasma hominis), кількісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 487,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "905"
  },
  {
    "id": "official-247-009",
    "name": "ПЛР. Визначення ДНК до мікоплазма геніталіум (Mycoplasma genitalium), якісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 488,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "75"
  },
  {
    "id": "official-247-010",
    "name": "ПЛР. Визначення ДНК до мікоплазма геніталіум (Mycoplasma genitalium), кількісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 489,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "906"
  },
  {
    "id": "official-247-011",
    "name": "Антитіла IgG до Ureaplasma urealyticum",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 490,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "447"
  },
  {
    "id": "official-247-012",
    "name": "ПЛР. Визначення ДНК до уреаплазма спецієс (Ureaplasma species), якісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 491,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "73"
  },
  {
    "id": "official-247-013",
    "name": "ПЛР. Визначення ДНК до уреаплазма спецієс (Ureaplasma species), кількісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 492,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "907"
  },
  {
    "id": "official-247-014",
    "name": "ПЛР. Визначення ДНК Ureaplasma urealyticum (Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 493,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "83"
  },
  {
    "id": "official-247-015",
    "name": "ПЛР. Визначення ДНК Ureaplasma urealyticum (Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 494,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "1083"
  },
  {
    "id": "official-247-016",
    "name": "ПЛР. Визначення ДНК Ureaplasma parvum (Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 495,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "84"
  },
  {
    "id": "official-247-017",
    "name": "ПЛР. Визначення ДНК Ureaplasma parvum (Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 496,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "1084"
  },
  {
    "id": "official-247-018",
    "name": "ПЛР. Визначення ДНК до уреаплазма уреалітікум та уреаплазми парвум (Ureaplasma paryum та Ureaplasma urealytycum). (Диференціація Real-time) якісно",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 497,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "365"
  },
  {
    "id": "official-247-019",
    "name": "ПЛР. Визначення ДНК Ureaplasma parvum та Ureaplasma urealyticum. (Диференціація Real-time) Кількісно",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 450,
    "aliases": [],
    "sortOrder": 498,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "366"
  },
  {
    "id": "official-247-020",
    "name": "ПЛР. Визначення ДНК до трихомонади (Trichomonas vaginalis), якісне визначення (зішкріб, сеча)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 499,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "79"
  },
  {
    "id": "official-247-021",
    "name": "IgG Trichomonas vaginalis",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 500,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1205"
  },
  {
    "id": "official-247-022",
    "name": "ПЛР. Визначення ДНК до трихомонади (Trichomonas vaginalis) (Зішкріб, сеча. Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [
      "ПЛР.Визначення ДНК до трихомонади (Trichomonas vaginalis) (Зішкріб, сеча. Кількісне визначення)"
    ],
    "sortOrder": 501,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "910"
  },
  {
    "id": "official-247-023",
    "name": "Сифіліс РМП (Реакція мікропрецептації з кардіоліпіновим антигеном - RW",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 260,
    "aliases": [],
    "sortOrder": 502,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "217"
  },
  {
    "id": "official-247-024",
    "name": "Сумарні антитіла до сифiлiсу (Treponema Pallidum)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 503,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "272"
  },
  {
    "id": "official-247-025",
    "name": "Визначення ДНК збуднику сифiлiсу (Tr. Pallidum, якісно)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 504,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "451"
  },
  {
    "id": "official-247-026",
    "name": "ПЛР.Визначення ДНК до гарднерели (Gardnerella vaginallis) (Зішкріб, сеча. Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 505,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "80"
  },
  {
    "id": "official-247-027",
    "name": "ПЛР.Визначення ДНК до гарднерели (Gardnerella vaginallis) (Зішкріб, сеча. Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 506,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "1080"
  },
  {
    "id": "official-247-028",
    "name": "ПЛР. Визначення ДНК до нейсерія гонорея (Neisseria gonorrhoeae) (Зішкріб, сеча. Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 507,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "78"
  },
  {
    "id": "official-247-029",
    "name": "ПЛР. Визначення ДНК до нейсерія гонорея (Neisseria gonorrhoeae) (Зішкріб, сеча. Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 508,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "911"
  },
  {
    "id": "official-247-030",
    "name": "ПЛР.Визначення ДНК до кандіди альбіканс (Candida albicans ) (Зішкріб, сеча. Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 509,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "81"
  },
  {
    "id": "official-247-031",
    "name": "ПЛР.Визначення ДНК до кандіди альбіканс (Candida albicans ) (Зішкріб, сеча. Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 510,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "1081"
  },
  {
    "id": "official-247-032",
    "name": "ПЛР. HPV 16/18 тип (Зішкріб, сеча. Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 511,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "51"
  },
  {
    "id": "official-247-033",
    "name": "ПЛР. HPV 16/18 тип (Зішкріб, сеча. Кількісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 390,
    "aliases": [],
    "sortOrder": 512,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "86"
  },
  {
    "id": "official-247-034",
    "name": "ПЛР. HPV 6, 11 тип (Зішкріб, сеча. Якісне визначення)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 513,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "82"
  },
  {
    "id": "official-247-035",
    "name": "ПЛР. Визначення ДНК вірусу папіломи людини (ВПЛ) 14 типів (16, 18, 31, 33, 35, 39, 45, 51, 52, 56, 58, 59, 66, 68 типів). Якісне визначення з генотипуванням",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1000,
    "aliases": [],
    "sortOrder": 514,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "1082"
  },
  {
    "id": "official-247-036",
    "name": "ПЛР. Визначення ДНК папіломи людини (ВПЛ) Квант 21 кількісне з генотипуванням (6,11,44,16,18,26,31,33,35,39,45,51,52,53,56,58,59,66,68,73,82.)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 515,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "186"
  },
  {
    "id": "official-247-037",
    "name": "ПЛР. Визначення ДНК папіломи людини (ВПЛ) Квант 24 кількісне з генотипуванням (6,11,44,16,18,26,31,33,35,39,45,51,52,53,56,58,59,66,68,73,82, 43, 42, 81)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1600,
    "aliases": [],
    "sortOrder": 516,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "914"
  },
  {
    "id": "official-247-038",
    "name": "ПЛР. Визначення ДНК вірусу папіломи людини (ВПЛ) (14 типів - 16, 18, 31, 33, 35, 39, 45, 51, 52, 56, 58, 59, 66, 68) Кількісне визначення до типу в режимі Real-time",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 517,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "1816"
  },
  {
    "id": "official-247-039",
    "name": "12 ІПСШ ( Mycoplasma hominis, Mycoplasma genitalium, Ureaplasma spp. (U.parvum, U.urealyticum), Candida albicans, Gardnerella vaginalis, Chlamydia trachomatis, Trichomonas vaginalis, Neisseria gonorrhoeae, ДНК цитомегаловірусу CMV, ДНК герпесвірусу HSV 1/2, ВПЛ HPV 16 тип, ВПЛ HPV 18 тип.) Якісне визначення",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1650,
    "aliases": [
      "12 ІПСШ ( Mycoplasma hominis, Mycoplasma genitalium, Ureaplasma spp. (U.parvum, U.urealyticum), Candida albicans, Gardnerella vaginalis, Chlamydia trachomatis, Trichomonas vaginalis, Neisseria gonorrhoeae, ДНК цитомегаловірусу CMV, ДНК герпесвірусу HSV 1, 2., ВПЛ HPV 16 тип, ВПЛ HPV 18 тип.) Якісне визначення"
    ],
    "sortOrder": 518,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "497"
  },
  {
    "id": "official-247-040",
    "name": "ПЛР. 8 ІПСШ (Mycoplasma hominis+genitalium, Ureaplasma spp.(U.parvum,U.uralyticum), Gardnerella vaginalis, Clamydia trachomatis, Trichomonas vaginalis, Neisseria gonorroeae)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1400,
    "aliases": [],
    "sortOrder": 519,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "498"
  },
  {
    "id": "official-247-041",
    "name": "Бактеріальний вагіноз молекулярна діагностика (7 показників) (Lactobacillus acidophilus, Gardnerella vaginalis, Atopobium vaginalis, Mobiluncus spp., Bacteroides fragilis, Megasphaera phylotype, Clostridium (BVAB2))",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1300,
    "aliases": [],
    "sortOrder": 520,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "103"
  },
  {
    "id": "official-247-042",
    "name": "Фемофлор (Жіночий біоценоз) (Загальна бактеріальна маса,Lactobacillus spp., Enterobacterium spp., Streptococcus spp.,Staphylococcus spp., Gardnerella vaginаlis/Porphyromonas spp., Prevotella bivia, Bacteroides fragilis, Sneathia spp./Leptotrihia spp./Fusobacterium spp., Megasphaera spp./Veilonella spp./Dialister spp.,Lachnobacterium spp./Clostridium spp.,Mobiluncus spp./Corynebacterium spp., Atopobium vaginale, Mycoplasma hominis, Mycoplasma genitalium, Ureaplasma urealyticum, Ureaplasma parvum, Chlamydia trachomatis, Trichomonas vaginalis, Neisseria gonorrhoeae, Candida spp., Candida albicans, Candida glabrata)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 2500,
    "aliases": [],
    "sortOrder": 521,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "367"
  },
  {
    "id": "official-247-043",
    "name": "Флороценоз (Lactobacillus spp., Gardnerella vaginalis, Atopodium vaginae, Enterobacter spp., Staphylococcus spp., Streptococcus spp., Ureaplasma parvum, Ureaplasma urealyticum, Mycoplasma hominis, Candida albicans, Candida spp., Candida glabrata, Candida krusei)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1700,
    "aliases": [],
    "sortOrder": 522,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "521"
  },
  {
    "id": "official-247-044",
    "name": "Біоценоз урогенітального тракту (Фемофлор-скрін) (Lactobacterium, Gardnerella vaginalis, Mycoplasma hjminis, Mycoplasma genitalium, Ureaplasma urealyticum, Ureaplasma parvum, Candida spp., Trichomonas vaginalis, Neisseria gonorrhoeae, Chlamydia trahomatis)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1500,
    "aliases": [
      "Біоценоз урогенільтального тракту (Фемофлор-скрін) (Lactobacterium, Gardnerella vaginalis, Mycoplasma hjminis, Mycoplasma genitalium, Ureaplasma urealyticum, Ureaplasma parvum, Candida spp., Trichomonas vaginalis, Neisseria gonorrhoeae, Chlamydia trahomatis)"
    ],
    "sortOrder": 523,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "755"
  },
  {
    "id": "official-247-045",
    "name": "Урогенітальний для чоловіків. ПЛР Real-time якісний (Chlamydia trachomatis, Ureaplasma spp, Mycoplasma hominis, Mycoplasma genitalium, HSV 1, 2, CMV, Neisseria gonorroeae, Trichomonas vaginalis, Gardnerella vaginalis, Candida albicans)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1450,
    "aliases": [],
    "sortOrder": 524,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "577"
  },
  {
    "id": "official-247-046",
    "name": "Андрофлор (біоценоз чоловіків)",
    "category": "urogenital",
    "categoryLabel": "Урогенітальні інфекції",
    "amount": 1800,
    "aliases": [],
    "sortOrder": 525,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "817"
  },
  {
    "id": "official-257-001",
    "name": "Сумарні антитіла до лямблій (Giardia liamblia)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 526,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "452"
  },
  {
    "id": "official-257-002",
    "name": "Антитіла IgG до токсокарів",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 527,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "454"
  },
  {
    "id": "official-257-003",
    "name": "Антитіла IgG до аскарид",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 528,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "455"
  },
  {
    "id": "official-257-004",
    "name": "Антитіла IgG до опісторхів",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 529,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "458"
  },
  {
    "id": "official-257-005",
    "name": "Антитіла IgG до трихінел",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 530,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "459"
  },
  {
    "id": "official-257-006",
    "name": "Антитіла IgG до ехінококів",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 300,
    "aliases": [],
    "sortOrder": 531,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "460"
  },
  {
    "id": "official-257-007",
    "name": "Ієрсиніоз (Yersinia enterocolitica), антитіла IgA",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 550,
    "aliases": [
      "Ієрсіниоз (Yersinia enterocolitica), антитіла IgA"
    ],
    "sortOrder": 532,
    "isActive": true,
    "turnaround": "8 дн.",
    "code": "1055"
  },
  {
    "id": "official-257-008",
    "name": "Ієрсиніоз (Yersinia enterocolitica), антитіла IgG",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 550,
    "aliases": [
      "Ієрсіниоз (Yersinia enterocolitica), антитіла IgG"
    ],
    "sortOrder": 533,
    "isActive": true,
    "turnaround": "8 дн.",
    "code": "1056"
  },
  {
    "id": "official-257-009",
    "name": "Ієрсиніоз (Yersinia enterocolitica), антитіла IgA, методом Western Blot",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 1150,
    "aliases": [
      "Ієрсіниоз (Yersinia enterocolitica), антитіла IgA, методом Western Blot"
    ],
    "sortOrder": 534,
    "isActive": true,
    "turnaround": "8 дн.",
    "code": "1057"
  },
  {
    "id": "official-257-010",
    "name": "Ієрсиніоз (Yersinia enterocolitica), антитіла IgG, методом Western Blot",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 1150,
    "aliases": [
      "Ієрсіниоз (Yersinia enterocolitica), антитіла IgG, методом Western Blot"
    ],
    "sortOrder": 535,
    "isActive": true,
    "turnaround": "8 дн.",
    "code": "1058"
  },
  {
    "id": "official-257-011",
    "name": "Загальні антитіла до мікобактерій туберкульозу (Mycobacterium tuberculosis)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 290,
    "aliases": [],
    "sortOrder": 536,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "190"
  },
  {
    "id": "official-257-012",
    "name": "ПЛР. Визначення ДНК до мікобактерій туберкульозу (Mycobacterium tuberculosis) ( якісне визначення)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 450,
    "aliases": [],
    "sortOrder": 537,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "449"
  },
  {
    "id": "official-257-013",
    "name": "Квантіфероновий тест (діагностика латентного туберкульозу)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 3000,
    "aliases": [],
    "sortOrder": 538,
    "isActive": true,
    "turnaround": "7-8 дн.",
    "code": "1450"
  },
  {
    "id": "official-257-014",
    "name": "Антитіла IgM до мікоплазма пневмонії (Mycoplasma pneumoniae)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [],
    "sortOrder": 539,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "840"
  },
  {
    "id": "official-257-015",
    "name": "Антитіла IgG до мікоплазма пневмонії (Mycoplasma pneumoniae)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [],
    "sortOrder": 540,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "853"
  },
  {
    "id": "official-257-016",
    "name": "Антитіла IgG до хламідія пневмонії (Chlamydia pneumoniae)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [],
    "sortOrder": 541,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "841"
  },
  {
    "id": "official-257-017",
    "name": "Антитіла IgM до хламідія пневмонії (Chlamydia pneumoniae)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 280,
    "aliases": [],
    "sortOrder": 542,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "842"
  },
  {
    "id": "official-257-018",
    "name": "Антитіла IgМ до збуднику хвороби Лайма (Borrelia Burgdorferi)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 543,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "456"
  },
  {
    "id": "official-257-019",
    "name": "Антитіла IgG до збуднику хвороби Лайма (Borrelia Burgdorferi)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 544,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "457"
  },
  {
    "id": "official-257-020",
    "name": "Визначення ДНК Боррелій (Borrelia Burgdorferi) (кров/кліщ)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 500,
    "aliases": [],
    "sortOrder": 545,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "1960"
  },
  {
    "id": "official-257-021",
    "name": "Борелія Імуноблот IgM",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 546,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "1959"
  },
  {
    "id": "official-257-022",
    "name": "Борелія Імуноблот IgG",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 547,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "1958"
  },
  {
    "id": "official-257-023",
    "name": "Антитіла IgG до кашлюка (Bordetella pertussis)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 548,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "724"
  },
  {
    "id": "official-257-024",
    "name": "Антитіла IgМ до кашлюка (Bordetella pertussis)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 400,
    "aliases": [],
    "sortOrder": 549,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "725"
  },
  {
    "id": "official-257-025",
    "name": "ПЛР. Bordetella MULTI (зішкріб ротоглотки)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 550,
    "aliases": [],
    "sortOrder": 550,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "835"
  },
  {
    "id": "official-257-026",
    "name": "Антитіла IgМ до вірусу кору (Measles viruses)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 551,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "721"
  },
  {
    "id": "official-257-027",
    "name": "Антитіла IgG до вірусу кору (Measles viruses)",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 330,
    "aliases": [],
    "sortOrder": 552,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "822"
  },
  {
    "id": "official-257-028",
    "name": "Антитіла IgG до вірусу дифтерії",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 553,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "877"
  },
  {
    "id": "official-257-029",
    "name": "ПЛР. Brucella abortus bovis",
    "category": "other-infections",
    "categoryLabel": "Інші інфекції",
    "amount": 350,
    "aliases": [],
    "sortOrder": 554,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "995"
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
    "sortOrder": 555,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "178"
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
    "sortOrder": 556,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "654"
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
    "sortOrder": 557,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "701"
  },
  {
    "id": "official-249-001",
    "name": "Загальний імуноглобулін E",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 290,
    "aliases": [],
    "sortOrder": 558,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "212"
  },
  {
    "id": "official-249-002",
    "name": "Еозинофільний катіонний білок (ЕКБ, ECP)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 600,
    "aliases": [],
    "sortOrder": 559,
    "isActive": true,
    "turnaround": "4 дн.",
    "code": "756"
  },
  {
    "id": "rivne-20260909-2-418-item",
    "name": "Респіраторна панель №1\" (ССD Mixture (ccdx), Poplar mix (t14), d1 кліщ домашнього пилу, d2 кліщ пір'яний, і6 тарган, t3 береза, t2 вільха, t4 фундук, gx змішані трави, g12 пилок жита, w5 полин гірка, w206 ромашка, і1 отрута бджоли, і3 отрута оси, k82 латекс, m1 Penicillium notatum, m2 Clodosporium herbarum, m3 Aspergillus fumigatus, m6 Alternaria alternata, е1 епітелій кота, е3 епітелій коня, е5 епітелій собаки, е6 епітелій морської свинки, е84 епітелій золотого хом’ячка, е82 епітелій кролика, е88 епітелій миші, е87 епітелій щура, ех70 пір'я, w8 кульбаба, d70 борошняний кліщ)",
    "amount": 1350,
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "sortOrder": 560,
    "isActive": true,
    "turnaround": "1 дн.",
    "aliases": [],
    "code": "511"
  },
  {
    "id": "official-249-004",
    "name": "ХАРЧОВА ПАНЕЛЬ №3 Blot аналіз IgE 30 алергенів №1: Staphylococcus mix (Ентеротоксин, Ентеротоксин B, TSS-Токсин 1), арахіс, кокос, тріска, лосось, гречане борошно, вівсяне борошно, кукурудзяне борошно, морква, селера, яблуко, апельсин, яловичина , свинина, куряче м'ясо, картопля, пшеничне борошно, житнє борошно, помідор, болгарський перець, банан, яєчний білок, яєчний жовток, молоко, α-Lactoalbumine, бета-Lactoglobuline, казеїн, соя.",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 1350,
    "aliases": [],
    "sortOrder": 561,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "518"
  },
  {
    "id": "official-249-005",
    "name": "ПЕДІАТРИЧНА ПАНЕЛЬ №4. Blot аналіз IgE. 30 алергенів №1: Dermatophagoides pteronyssinus (Кліщ домашнього пилу), (Dermatophagoides farinae (Кліщ домашнього пилу), вільха, береза, ліщина, дуб, суміш трав, пилок жита, полин, подорожник, кішка, кінь, собака, морська свинка, Сирійський хом'як, кролик, Penicillium notatum (Пліснявий гриб), Cladosporium herbarum (Пліснявий гриб), Aspergillus fumigatus (Пліснявий гриб), Alternaria alternata (Пліснявий гриб), амброзія, тріска, краб, яєчний білок, молоко, арахіс, фундук, морква, пшеничне борошно, соєві боби.",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 1350,
    "aliases": [
      "ПЕДІАТРИЧНА ПАНЕЛЬ №4. Blot аналіз IgE. 30 алергенів №1: Dermatophagoides pteronyssinus (Кліщ домашнього пилу), (Dermatophagoides farinae (Кліщ домашнього пилу), вільха, береза, ліщина, дуб, суміш трав, пилок жита, полин, подорожник, кішка, кінь, собака, морська свинка, Сирійський хом'як, кролик,Penicillium notatum (Пліснявий гриб), Cladosporium herbarum (Пліснявий гриб), Aspergillus fumigatus (Пліснявий гриб), Alternaria alternata (Пліснявий гриб), амброзія, тріска, краб, яєчний білок, молоко, арахіс, фундук, морква, пшеничне борошно, соєві боби."
    ],
    "sortOrder": 562,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "520"
  },
  {
    "id": "official-249-006",
    "name": "Респіраторний профіль домашній (d205 алергокомпонент кліща домашнього пилу D.pter rDer p10, d202 алергокомпонент кліща домашнього пилу D.pter rDer p1 цистеін протеаза, d1 кліщ домашнього пилу D.pter, d2 кліщ пір'яний D. farinae, d70 борошняний кліщ Acarus siro, m1 Penicillium notatum, m2 Cladosporium herbatum, m3 Aspergillus fumigates, m5 Candida albicans, m229 алергокомпонент альтернарії rAlt a1, m6 Alternaria alternate, e227 алергокомпонент епітелію коня rEqu c1, ліпокалін, е3 епітелій коня, е226 алергокомпонент епітелію собаки rCan f5, аргінінестераза, е101 алергокомпонент епітелію собаки rCan f1, ліпокалін, е5 епітелій собаки, е94 алергокомпонент епітелію кота rFel d1, утероглобін, е1 епітелій кота, k82 латекс, і3 отрута оси, і1 отрута бджоли, і6 тарган)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 1350,
    "aliases": [],
    "sortOrder": 563,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "519"
  },
  {
    "id": "official-249-007",
    "name": "IgE специфічний до окремого алергену: (томати, молоко коров’яче, горіх волоський, м’ясо курки, банан, соя, рис, морква, яйце білок + жовток, собака, епітелій тварин скринінг (кіт, собака), амброзія, какао, яєчний білок, м’ясо свинини)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 350,
    "aliases": [
      "IgE специфічний до окремого алергену: (томати, молоко коров’яче, горіх волоський, м’ясо курки, банан, соя, рис, морква, яйце білок+жовток, собака, епітелій тварин скринінг (кіт, собака), амброзія, какао, яєчний білок, м’ясо свинини)"
    ],
    "sortOrder": 564,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": ""
  },
  {
    "id": "official-249-008",
    "name": "Артикаїн IgE, специфічний (ультракаїн, убістезин, септонест, артифрин)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 565,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "213"
  },
  {
    "id": "official-249-009",
    "name": "Лідокаїн IgE, специфічний",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 566,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "214"
  },
  {
    "id": "official-249-010",
    "name": "Лідокаїн IgE, специфічний (кількісно)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 567,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "240"
  },
  {
    "id": "official-249-011",
    "name": "Артикаїн IgE, специфічний, кількісний (ультракаїн, убістезин, септонест, артифрин)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 568,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "219"
  },
  {
    "id": "official-249-012",
    "name": "Мепівакаїн IgE, специфічний, кількісний",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 569,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "225"
  },
  {
    "id": "official-249-013",
    "name": "Бупівакаїн IgE, специфічний (лонгокаїн, маркаїн, новостезін)",
    "category": "allergy",
    "categoryLabel": "Алергологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 570,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "241"
  },
  {
    "id": "official-250-001",
    "name": "ПЛР. Генетика Метаболізму Лактози (1 точка) (букальний зішкріб, кров)",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 680,
    "aliases": [],
    "sortOrder": 571,
    "isActive": true,
    "turnaround": "4-5 дн.",
    "code": "462"
  },
  {
    "id": "official-250-002",
    "name": "ПЛР. HLA B27 головний комплекс гістосумісності людини",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 990,
    "aliases": [],
    "sortOrder": 572,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "464"
  },
  {
    "id": "official-250-003",
    "name": "ПЛР. ОнкоГенетика BRCA 1 та BRCA 2 (8 показників)",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 2000,
    "aliases": [],
    "sortOrder": 573,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "469"
  },
  {
    "id": "official-250-004",
    "name": "ПЛР. КардіоГенетика Тромбофілія",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 574,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "471"
  },
  {
    "id": "official-250-005",
    "name": "ПЛР. Генетика Метаболізму Фолатів",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 575,
    "isActive": true,
    "turnaround": "5 дн.",
    "code": "472"
  },
  {
    "id": "official-250-006",
    "name": "Діагностика синдрому Жильбера (мутації в гені UGTIAI)",
    "category": "genetics",
    "categoryLabel": "Генетичні дослідження",
    "amount": 1990,
    "aliases": [],
    "sortOrder": 576,
    "isActive": true,
    "turnaround": "14 дн.",
    "code": "1505"
  },
  {
    "id": "official-251-001",
    "name": "Бактеріальний урогенітальний скринінг (13 інфекцій: Mycoplasma hominis, Ureaplasma spp., Trichomonas vaginalis, Candida spp., Escherichia coli, Proteus spp., Pseudomonas spp., Gardnerella vaginalis, Staphylococcus aureus., Enterococcus spp., Neisseria spp., Streptococcus agalactiae) з чутливістю виявлених Mycoplasma homini, Ureaplasma spp. До антибіотиків та визначення концентрації в CFU/ml",
    "category": "culture",
    "categoryLabel": "Культуральні дослідження",
    "amount": 800,
    "aliases": [],
    "sortOrder": 577,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "843"
  },
  {
    "id": "official-252-001",
    "name": "Мікробіологічне дослідження біологічного матеріалу на грибкову флору з визначенням чутливості до протигрибкових препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 578,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "157"
  },
  {
    "id": "official-252-002",
    "name": "Мікробіологічне дослідження біологічного матеріалу на стафілокок з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 579,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "552"
  },
  {
    "id": "official-252-003",
    "name": "Мікробіологічне дослідження матеріалу на B-гемолітичний стрептокок",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 580,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "416"
  },
  {
    "id": "official-252-004",
    "name": "Мікробіологічне дослідження урогенітальних виділень з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 581,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "158"
  },
  {
    "id": "official-252-005",
    "name": "Мікробіологічне дослідження виділень із ока з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 582,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "159"
  },
  {
    "id": "official-252-006",
    "name": "Мікробіологічне дослідження матеріалу із рани з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 583,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "161"
  },
  {
    "id": "official-252-007",
    "name": "Мікробіологічне дослідження сечі з визначенням чутливості до антибактеріальних препаратів (Бак посів сечі)",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 584,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "162"
  },
  {
    "id": "official-252-008",
    "name": "Мікробіологічне дослідження харкотиння з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 585,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "163"
  },
  {
    "id": "official-252-009",
    "name": "Мікробіологічне дослідження біологічного матеріалу на анаеробну флору з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 586,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "164"
  },
  {
    "id": "official-252-010",
    "name": "Мікробіологічне дослідження крові на стерильність з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 580,
    "aliases": [],
    "sortOrder": 587,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "166"
  },
  {
    "id": "official-252-011",
    "name": "Мікробіологічне дослідження матеріалу із носу з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 588,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "283"
  },
  {
    "id": "official-252-012",
    "name": "Мікробіологічне дослідження матеріалу із зіву з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 589,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "553"
  },
  {
    "id": "official-252-013",
    "name": "Мікробіологічне дослідження матеріалу на дифтерію",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 590,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "381"
  },
  {
    "id": "official-252-014",
    "name": "Мікробіологічне дослідження калу на дисгрупу, патогенна мікрофлора кишкової групи з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 591,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "650"
  },
  {
    "id": "official-252-015",
    "name": "Аналіз калу на дисбактеріоз з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 592,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "554"
  },
  {
    "id": "official-252-016",
    "name": "Мікробіологічне дослідження матеріала із вуха з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 593,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "559"
  },
  {
    "id": "official-252-017",
    "name": "Мікробіологічне дослідження матеріалу грудного молока з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 594,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "560"
  },
  {
    "id": "official-252-018",
    "name": "Мікробіологічне дослідження жовчі з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 595,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "561"
  },
  {
    "id": "official-252-019",
    "name": "Мікробіологічне дослідження секрету простати з визначенням чутливості до антибактеріальних препаратів",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 596,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "694"
  },
  {
    "id": "official-252-020",
    "name": "Бакпосів еякуляту+антибіотикограма",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 550,
    "aliases": [],
    "sortOrder": 597,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "784"
  },
  {
    "id": "official-252-024",
    "name": "Стрептокок групи В (швидкий тест)",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 450,
    "aliases": [
      "Стрептококк групи В (швидкий тест)"
    ],
    "sortOrder": 598,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "846"
  },
  {
    "id": "official-252-025",
    "name": "Стрептокок групи А (швидкий тест)",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 350,
    "aliases": [
      "Стрептококк групи А (швидкий тест)"
    ],
    "sortOrder": 599,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "849"
  },
  {
    "id": "official-252-021",
    "name": "Бакпосів урогенітальний дитячій",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [],
    "sortOrder": 600,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "1168"
  },
  {
    "id": "official-252-022",
    "name": "Бакпосів синовіальної рідини + антибіотикограма",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [
      "Бакпосів синовіальної рідини + антибіотикограмма"
    ],
    "sortOrder": 601,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "860"
  },
  {
    "id": "official-252-023",
    "name": "Бакпосів плевральної рідини + антибіотикограма",
    "category": "bacteriology",
    "categoryLabel": "Бактеріологічні дослідження",
    "amount": 500,
    "aliases": [
      "Бакпосів плевральної рідини + антибіотикограмма"
    ],
    "sortOrder": 602,
    "isActive": true,
    "turnaround": "7 дн.",
    "code": "871"
  },
  {
    "id": "official-253-001",
    "name": "Комплекс «Щитоподібна залоза» №1 (ТТГ, Т3 вільний, Т4 вільний)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 675,
    "aliases": [],
    "sortOrder": 603,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "571"
  },
  {
    "id": "official-253-002",
    "name": "Комплекс «Щитоподібна залоза» №2 (ТТГ, Т4 вільний, АТПО)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 720,
    "aliases": [],
    "sortOrder": 604,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1210"
  },
  {
    "id": "official-253-003",
    "name": "Комплекс «Щитоподібна залоза» №4 (ТТГ, Т4 вільний, Т3 вільний, АТПО, Антитіла до рецепторів ТТГ)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1430,
    "aliases": [
      "Комплекс «Щитоподібна залоза» №4 (ТТГ, Т4 вільний, Т3 вільний, АТПО, антитіла до рецепторів ТТГ)"
    ],
    "sortOrder": 605,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "574"
  },
  {
    "id": "official-253-004",
    "name": "Комплекс «Щитоподібна залоза» №6 (ТТГ, Т4 вільний, Т3 вільний, АТПО, ТГ, Кальцитонін)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1610,
    "aliases": [
      "Комплекс «Щитоподібна залоза» №6 (ТТГ, Т4 вільний, Т3 вільний, АТПО, ТГ, кальцитонін)"
    ],
    "sortOrder": 606,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "856"
  },
  {
    "id": "official-253-005",
    "name": "Комплекс \"Гормони щитоподібна залоза + пролактин\" (ТТГ, Т4 вільний, Т3 вільний, Пролактин)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 935,
    "aliases": [
      "ТТГ",
      "TSH",
      "Комплекс \"Гормони щитоподібна залоза+пролактин\" (Тиреотропний гормон ТТГ, Т4 вільний, Т3 вільний, пролактин)"
    ],
    "sortOrder": 607,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "570"
  },
  {
    "id": "official-253-006",
    "name": "Комплекс «Діабетичний» (Глікозильований гемоглобін, С-пептид, Інсулін+ Глюкоза+ Індекс НОМА)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 910,
    "aliases": [],
    "sortOrder": 608,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "707"
  },
  {
    "id": "official-253-007",
    "name": "Комплекс \"Хірургічний\" (ВІЛ, RW, HBsAg, НСV)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1045,
    "aliases": [],
    "sortOrder": 609,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1232"
  },
  {
    "id": "official-253-008",
    "name": "Комплекс \"Хірургічний мінімальний\" (ЗАК, Група крові резус фактор, Коагулограма, Глюкоза, АЛТ, АСТ, Білок загальний, Білірубін загальний, Сечовина, Креатинін, РМП, Гепатит В, Гепатит С, ВІЛ)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 2815,
    "aliases": [
      "Комплекс \"Хірургічний мінімальний\" (ЗАК, група крові резус фактор, коагулограма, глюкоза, АЛТ, АСТ, білок загальний, білірубін загальний, сечовина, креатинін, РПМ, гепатит В, гепатит С, ВІЛ"
    ],
    "sortOrder": 610,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1277"
  },
  {
    "id": "official-253-009",
    "name": "Комплекс \"Хірургічний максимальний\" (ЗАК, Група крові резус фактор, Коагулограма, Глюкоза, АЛТ, АСТ, Білок загальний, Білірубін загальний, Сечовина, Креатинін, Калій, Натрій, Хлор, РМП, Гепатит В, Гепатит С, ВІЛ)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 3220,
    "aliases": [
      "Комплекс \"Хірургічний максимальний\" ЗАК, група крові резус фактор, коагулограма, глюкоза, АЛТ, АСТ, білок загальний, білірубін загальний, сечовина, креатинін, калій, натрій, хлор, РПМ, гепатит В, гепатит С, ВІЛ)"
    ],
    "sortOrder": 611,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1276"
  },
  {
    "id": "official-253-010",
    "name": "Комплекс «Репродуктивне гормональне жіноче здоров’я» (ЛГ, ФСГ, Пролактин, Прогестерон, Естрадіол)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1305,
    "aliases": [
      "Комплекс «Репродуктивне гормональне жіноче здоров’я» (ЛГ, ФСГ, пролактин, прогестерон, естрадіол)"
    ],
    "sortOrder": 612,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "224"
  },
  {
    "id": "official-253-011",
    "name": "Комплекс «Репродуктивне гормональне чоловіче здоров’я» (Прогестерон, Пролактин, Тестостерон загальний)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 785,
    "aliases": [
      "Комплекс «Репродуктивне гормональне чоловіче здоров’я» (Прогестерон, пролактин, тестостерон загальний)"
    ],
    "sortOrder": 613,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "227"
  },
  {
    "id": "official-253-012",
    "name": "Комплекс \"І фаза менструального циклу 2-3 день\" (ЛГ, ФСГ, Пролактин, Прогестерон, Тестостерон загальний, Естрадіол)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1565,
    "aliases": [],
    "sortOrder": 614,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1230"
  },
  {
    "id": "official-253-013",
    "name": "Комплекс \"Гормони репродукції жінки І фаза менструально циклу\" (Прогестерон, Естрадіол, Пролактин, Індекс вільного тестостерону, ДГЕА-С, 17-Оксипрогестерон, ТТГ, Т4 вільний)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 2170,
    "aliases": [
      "Комплекс \"Гормони репродукції жінки І фаза менс.циклу\" (Прогестерон, естрадіол, пролактин, індекс вільного тестостерону, ДГЕА-С, 17-Оксипрогестерон, ТТГ, Т4вільний)"
    ],
    "sortOrder": 615,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "1213"
  },
  {
    "id": "official-253-014",
    "name": "Комплекс \"Гормони репродукції жінки ІІ фаза менструального циклу\" (Прогестерон, Естрадіол)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 520,
    "aliases": [
      "Комплекс \"Гормони репродукції жінки ІІ фаза менс.циклу\" (прогестерон, естрадіол)"
    ],
    "sortOrder": 616,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1214"
  },
  {
    "id": "official-253-015",
    "name": "Комплекс \"Онкоскринінг для жінок\" (Тиреоглобулін, Раково-ембріональний антиген РЕА, Онкомаркер молочної залози СА 15-3, Онкомаркер підшлункової залози СА 19-9, Онкомаркер яєчників СА 125)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1325,
    "aliases": [
      "Комплекс \"Онкоскринінг для жінок\" (Тиреоглобулін, Раково-амбріональний антиген РЕА, Онкомаркер молочної залози СА 15-3, Онкомаркер підшлункової залози СА 19-9, Онкомаркер яєчників СА 125)"
    ],
    "sortOrder": 617,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "714"
  },
  {
    "id": "official-253-016",
    "name": "Комплекс \"Стрес-пакет\" (Пролактин, ТТГ, Магній, Т3 вільний, Т4 вільний, Вітамін В12, Вітамін D3, Фолієва кислота, Гомоцестеїн)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 2600,
    "aliases": [
      "вітамін Д",
      "Комплекс \"Стрес-пакет\" (Пролактин, ТТГ, Магній, Т3в, Т4в, вітамін В12, вітамін D, фолієва кислота, Гомоцестеїн)"
    ],
    "sortOrder": 618,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "1229"
  },
  {
    "id": "official-253-017",
    "name": "Комплекс №2 (ЗАК (параметри аналізатора + ШОЕ), ЗАС, Глюкоза)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 520,
    "aliases": [
      "Комплекс №2 (Загальний аналіз крові (параметри аналізатора+ СОЕ), загальний аналіз сечі, глюкоза)"
    ],
    "sortOrder": 619,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "582"
  },
  {
    "id": "official-253-018",
    "name": "Комплекс «Антитіла до паразитів» (Антитіла IgG до: аскарид, токсокарів, лямблій, ехінококів, трихінел, опісторхоз)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1620,
    "aliases": [
      "Комплекс «Антитіла до паразитів» (Антитіла IgG до: аскарид, токсокарів, лямблій, єхінококов, трихінел, описторхоз)"
    ],
    "sortOrder": 620,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "710"
  },
  {
    "id": "official-253-019",
    "name": "Комплекс «Метаболічний» (Холестерин, Тригліцериди, ЛПВЩ, ЛПНЩ, ЛПДНЩ, Коефіцієнт атерогенності, Глюкоза, Глікозильований гемоглобін Сечова кислота, Загальний білок, Інсулін, C-пептид)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1690,
    "aliases": [
      "Комплекс «Метаболічний» (холестерин, тригліцериди, ЛПВЩ, ЛПНЩ, ЛПДНЩ, коефіцієнт атерогенності, глюкоза, глікозильований гемоглобін сечова кислота, загальний білок, інсулін, C-пептид)"
    ],
    "sortOrder": 621,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "709"
  },
  {
    "id": "official-253-020",
    "name": "Комплекс «Ліпідний» «Дослідження ліпідного обміну» (Холестерин, Тригліцериди, ЛПВЩ, ЛПНЩ, Коефіцієнт атерогенності)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 530,
    "aliases": [
      "Комплекс «Ліпідний» «Дослідження ліпідного обміну» (холестерин, тригліцериди, ЛПВЩ, ЛПНЩ, коефіцієнт атерогенності)"
    ],
    "sortOrder": 622,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "311"
  },
  {
    "id": "official-253-021",
    "name": "Комплекс ''Біохімічний'' №1 (Білірубін загальний, АЛТ, АСТ, Креатинін, Сечовина, Загальний білок)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 755,
    "aliases": [
      "Комплекс ''Біохімічний'' №1 (Білірубін загальний, АЛТ, АСТ, креатинин, сечовина, загальний білок)"
    ],
    "sortOrder": 623,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "806"
  },
  {
    "id": "official-253-022",
    "name": "Комплекс «Біохімічний» №2 (АЛТ, АСТ, ЛФ, ГГТ, Білірубін загальний, прямий + непрямий; Загальний білок, Креатинін, Сечовина, Глюкоза, Амілаза панкреатична, Альфа-амілаза, Холестерин, Тригліцериди, ЛПВЩ, ЛПНЩ, ЛПДНЩ)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 2060,
    "aliases": [
      "Комплекс «Біохімічний» №2 (АЛТ, АСТ, ЛФ, ГГТ, білірубін загальний, прямий+непрямий; загальний білок, креатинін, сечовина, глюкоза, амілаза панкреатична, альфа-амілаза, холестерин, тригліцериди, ЛПВЩ, ЛПНЩ, ЛПДНЩ)"
    ],
    "sortOrder": 624,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "143"
  },
  {
    "id": "official-253-023",
    "name": "Комплекс \"Біохімічний стандартний\" (АЛТ, АСТ, Білірубін загальний + прямий + непрямий; Креатитін, Сечовина, Глюкоза, Загальний білок)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1010,
    "aliases": [
      "Комплекс \"Біохімічний стандартний\" (АЛТ, АСТ, Білірубін загальний+прямий+непрямий, креатитін, сечовина, глюкоза, білок загалий)"
    ],
    "sortOrder": 625,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1231"
  },
  {
    "id": "official-253-024",
    "name": "Комплекс «Печінкові проби» (АЛТ, АСТ, ЛФ, білірубін загальний, прямий + непрямий; ГГТ, Загальний білок)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 880,
    "aliases": [
      "Комплекс «Печінкові проби» (АЛТ, АСТ, ЛФ, білірубін загальний,прямий+непрямий ГГТ,загальний білок)"
    ],
    "sortOrder": 626,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "704"
  },
  {
    "id": "official-253-025",
    "name": "Комплекс «Ниркові проби №1 (Креатинін, Сечовина, Сечова кислота)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 380,
    "aliases": [
      "Комплекс «Ниркові проби №1 (креатинін, сечовина, сечова кислота)"
    ],
    "sortOrder": 627,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "427"
  },
  {
    "id": "official-253-026",
    "name": "Комплекс «Ниркові проби №2» (Креатинін, Сечовина, Загальний білок)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 380,
    "aliases": [
      "Комплекс «Ниркові проби №2» (креатинін, сечовина, білок загальний)"
    ],
    "sortOrder": 628,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "428"
  },
  {
    "id": "official-253-027",
    "name": "Комплекс «Ревмопроби» (С-реактивний білок, Ревматоїдний фактор, Антистрептолізин-О (кількісне визначення))",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 485,
    "aliases": [
      "Комплекс «Ревмопроби» (С-реактивний білок, ревматоїдний фактор, антистрептолізин-О (кількісне визначення)"
    ],
    "sortOrder": 629,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "715"
  },
  {
    "id": "official-253-028",
    "name": "Комплекс «Ревматологічний» (ЗАК, ЗАС, Сечова кислота, РФ та СРБ кількісні, Антитіла IgA до хламідії, AntiCCP)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1575,
    "aliases": [
      "Комплекс «Ревматологічний» (ЗАК, ЗАС, сечова кислота, РФ та СРБ кількісні, Антитіла IgA до хламідії, AntiCCP)"
    ],
    "sortOrder": 630,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "711"
  },
  {
    "id": "official-253-029",
    "name": "Комплекс \"Рання діагностика ревматоїдного артриту\" (Антитіла до циклічного цітруліновому пептиду AntiCCP, С-реактивний білок СРБ, Ревматоїдний фактор)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 820,
    "aliases": [
      "Комплекс \"Рання діагностика ревматоїдного артриту\" (Антитіла до циклічного цітруліновому пептиду AntiCCP, С-реактивний білок СРБ, Ревматоїдний фактор РФ)"
    ],
    "sortOrder": 631,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1228"
  },
  {
    "id": "official-253-030",
    "name": "Комплекс \"Остеопороз мінімальний\" (Кальцій, Кальцій іонізовний, Фосфор, Паратгормон, Вітамін D3)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1225,
    "aliases": [
      "Комплекс \"Остеопороз мінімальний\" (Кальцій, Кальцій іонізовний, Фосфор, Паратгормон, вітамі D3)"
    ],
    "sortOrder": 632,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1299"
  },
  {
    "id": "official-253-031",
    "name": "Комплекс \"Остеопороз оптимальний\" (Кальцій, Кальцій іонізований, Фосфор, Паратгормон, Вітамін D3, Лужна фосфотаза, Кальцитонін)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1755,
    "aliases": [
      "вітамін Д",
      "Комплекс \"Остеопороз оптимальний\" (Кальцій, Кальцій іонізований, Фосфор, Паратгормон, вітамін D3, Лужна фосфотаза, Кальцитонін)"
    ],
    "sortOrder": 633,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1300"
  },
  {
    "id": "official-253-032",
    "name": "Комплекс «Електроліти» (Калій, Натрій, Хлор, Фосфор, Кальцій іонізований)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 740,
    "aliases": [],
    "sortOrder": 634,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1247"
  },
  {
    "id": "official-253-033",
    "name": "Комплекс «Дефіцит вітаміну D» (Вітамін D3, Кальцій, Фосфор)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 755,
    "aliases": [
      "Комплекс «Дефіцит вітаміну D» (vit D, Кальцій, Фосфор)"
    ],
    "sortOrder": 635,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1239"
  },
  {
    "id": "official-253-034",
    "name": "Комплекс ''Контроль анемії'' (Залізо, Вітамін В12, Фолієва кислота, ЗАК, Феритин, Трансферин)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1510,
    "aliases": [
      "ферритин",
      "Комплекс ''Контроль анемії'' (залізо, Віт. В12, фолієва кислота, ЗАК, феритин, трансферин)"
    ],
    "sortOrder": 636,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "708"
  },
  {
    "id": "official-253-035",
    "name": "Комплекс «Проблемна шкіра» (мінімальний) (ЗАК, Глюкоза, АЛТ, АСТ, ТТГ, Естрадіол, Прогестерон, Мікроскопічне дослідження на демодекоз)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1555,
    "aliases": [
      "Комплекс «Проблемна шкіра» (мінімальний) (ЗАК, глюкоза, АЛТ, АСТ, ТТГ, Естрадіол, Прогестерон, Мікроскопічне дослідження на демодекоз)"
    ],
    "sortOrder": 637,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1236"
  },
  {
    "id": "official-253-036",
    "name": "Комплекс «Проблемна шкіра» (оптимальний) (ЗАК, ДГЕА-С, 17-ОНПРГ, Індекс вільного тестостерону, ТТГ, Глікований гемоглобін, Прогестерон, Естрадіол, Мікроскопічне дослідження на демодекоз)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 2375,
    "aliases": [
      "Комплекс «Проблемна шкіра» (оптимальний) (ЗАК, ДГЕА-С, 17-ОНПРГ, індекс вільного тестостерону, ТТГ, Глікований гемоглобін, Прогестерон, Естрадіол, Мікроскопічне дослідження на демодекоз)"
    ],
    "sortOrder": 638,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "1237"
  },
  {
    "id": "official-253-037",
    "name": "Комплекс «Проблемна шкіра» (максимальний) (ЗАК, Кальцій, АЛТ, АСТ, Лужна фосфатаза, Панкреатична Амілаза, Ліпаза, Прогестерон, Естрадіол, Пролактин, ТТГ, Т4віл., Індекс вільного тестостерону, ДГЕА-С, 17-ОНПРГ, Вітамін D3)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 3670,
    "aliases": [
      "вітамін Д",
      "Комплекс «Проблемна шкіра» (максимальний) (ЗАК, Кальцій, АЛТ, АСТ, Лужна фосфатаза, Панкреатична амілаза, Ліпаза, Прогестерон, Естрадіол, Пролактин, ТТГ, Т4віл., індекс вільного тестостерону, ДГЕА-С, 17-ОНПРГ, вітамін D)"
    ],
    "sortOrder": 639,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "1238"
  },
  {
    "id": "official-253-038",
    "name": "Комплекс “Covid-19” (ЗАК, Д-димер, С-реактивний білок (кількісний))",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 655,
    "aliases": [
      "Комплекс “Covid-19” (Загальний розгорнутий аналiз крові, Д-димер, С-реактивний білок (кількісний)"
    ],
    "sortOrder": 640,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1127"
  },
  {
    "id": "official-253-039",
    "name": "Комплекс TORCH min (Антитіла IgG до вірусу краснухи, Антитіла IgG до цитомегаловірусу, Антитіла IgG до токсоплазми, Антитіла IgG до вірусу герпесу ½ типу)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 950,
    "aliases": [],
    "sortOrder": 641,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "118"
  },
  {
    "id": "official-253-040",
    "name": "Комплекс TORCH mаx (Антитіла IgM+IgG до вірусу краснухи, Антитіла IgM+IgG до цитомегаловірусу, Антитіла IgM+IgG до токсоплазми, Антитіла IgM+IgG до вірусу герпеса ½ типу)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1870,
    "aliases": [],
    "sortOrder": 642,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "119"
  },
  {
    "id": "official-253-041",
    "name": "Цервікальний скринінг (ПАП-тест на основі рідинної цитології, ДНК вірусів 21 типів (ВПЛ) 6,11,44,16,18,26,31,33,35,39,45,51,52,53,56,58,59,66,68,73,82 типів) Кількісно",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1865,
    "aliases": [],
    "sortOrder": 643,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "780"
  },
  {
    "id": "official-253-042",
    "name": "Цервікальний скринінг (ПАП-тест на основі рідинної цитології, ДНК вірусів 14 типів (ВПЛ) 16, 18, 31, 33, 35, 39, 45, 51, 52, 56, 58, 59, 66, 68) Кількісно",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1500,
    "aliases": [],
    "sortOrder": 644,
    "isActive": true,
    "turnaround": "2 дн.",
    "code": "782"
  },
  {
    "id": "official-253-043",
    "name": "Цервікальний скринінг №2 (Рідинна цитологія+ Визначення ДНК вірусу папіломи людини КВАНТ 21 кількісно + ПЛР Mycoplasma genitalium, ПЛР Chlamidia trachomatis, ПЛР Trichomonas vaginalis, ПЛР Neisseria gonorrhoeae, ПЛР Candida albicans, ПЛР Gardnerella vaginalis, ПЛР Ureaplasma spp. якісно)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 3750,
    "aliases": [
      "Цервікальний скринінг №2 (Рідинна цитологія+ Визначення ДНК вірусу папіломи людини КВАНТ 21 кількісно+ПЛР Mycoplasma genitalium, ПЛР Chlamidia trachomatis, ПЛР Trichomonas vaginalis, ПЛр Neisseria gonorrhoeae, ПЛР Candida albicans, ПЛР Gardnerella vaginalis, ПЛР Ureaplasma spp. якісно)"
    ],
    "sortOrder": 645,
    "isActive": true,
    "turnaround": "3 дн.",
    "code": "1249"
  },
  {
    "id": "official-253-044",
    "name": "Комплекс «Анестетики», кількісно (Артикаїн IgE (ультракаїн, убістезін, септонест, артифрин), Мепівакаїн IgE, Лідокаїн IgE)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 1485,
    "aliases": [],
    "sortOrder": 646,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1253"
  },
  {
    "id": "official-253-045",
    "name": "Комплекс «Дефіцит Вітаміну D3» (мінімально) (Вітамін D3 + Кальцій)",
    "category": "complexes",
    "categoryLabel": "Комплексні дослідження",
    "amount": 620,
    "aliases": [
      "вітамін Д",
      "Комплекс «Дефіцит Вітаміну D» (мінімально) (vitD3+кальцій)"
    ],
    "sortOrder": 647,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1254"
  },
  {
    "id": "official-254-001",
    "name": "SARS Cov2 – спай білок",
    "category": "covid",
    "categoryLabel": "COVID-19",
    "amount": 280,
    "aliases": [],
    "sortOrder": 648,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1125"
  },
  {
    "id": "official-254-002",
    "name": "SARS-Cov-2 IgG",
    "category": "covid",
    "categoryLabel": "COVID-19",
    "amount": 270,
    "aliases": [],
    "sortOrder": 649,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1027"
  },
  {
    "id": "official-254-003",
    "name": "SARS-Cov-2 IgM",
    "category": "covid",
    "categoryLabel": "COVID-19",
    "amount": 270,
    "aliases": [],
    "sortOrder": 650,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1028"
  },
  {
    "id": "official-254-004",
    "name": "ПЛР SARS-Cov-2",
    "category": "covid",
    "categoryLabel": "COVID-19",
    "amount": 500,
    "aliases": [],
    "sortOrder": 651,
    "isActive": true,
    "turnaround": "1 дн.",
    "code": "1029"
  },
  {
    "id": "official-254-005",
    "name": "Визначення антигена вірусу SARS-Cov-2 (COVID-19) (швидкий тест)",
    "category": "covid",
    "categoryLabel": "COVID-19",
    "amount": 250,
    "aliases": [],
    "sortOrder": 652,
    "isActive": true,
    "turnaround": "15хв",
    "code": "1126"
  },
  {
    "id": "official-255-001",
    "name": "Забір крові до транспортної пробірки єврозразку",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 70,
    "aliases": [],
    "sortOrder": 653,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "10"
  },
  {
    "id": "official-255-002",
    "name": "Забір крові у дітей (до 14 років)",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 70,
    "aliases": [],
    "sortOrder": 654,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "31"
  },
  {
    "id": "official-255-003",
    "name": "Забір біологічного матеріалу для бактеріологічного дослідження",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 70,
    "aliases": [],
    "sortOrder": 655,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "13"
  },
  {
    "id": "official-255-004",
    "name": "Забір сечі для бактеріологічного дослідження сечі",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 70,
    "aliases": [],
    "sortOrder": 656,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "14"
  },
  {
    "id": "official-255-005",
    "name": "Забір біоматеріалу до тр.контейнеру Salivette",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 70,
    "aliases": [
      "Забір біоматеріалу до тр.контейрнеру Salivette"
    ],
    "sortOrder": 657,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "29"
  },
  {
    "id": "official-255-006",
    "name": "Забір крові до додаткової системи",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 10,
    "aliases": [],
    "sortOrder": 658,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "11"
  },
  {
    "id": "official-255-007",
    "name": "Забір сечі до транспортного стаканчику",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 20,
    "aliases": [],
    "sortOrder": 659,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "30"
  },
  {
    "id": "official-255-008",
    "name": "Забір бактеріологічного дослідження у додаткову пробірку",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 20,
    "aliases": [],
    "sortOrder": 660,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "19"
  },
  {
    "id": "official-255-009",
    "name": "Забір матеріалу до епіндорфу для ПЛР дослідження",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 30,
    "aliases": [],
    "sortOrder": 661,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "20"
  },
  {
    "id": "official-255-010",
    "name": "Термінове виконання 1-2 досліджень (до 2 годин)",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 200,
    "aliases": [
      "Термінове виконання 1-2 дослідженнь (до 2 годин)"
    ],
    "sortOrder": 662,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "32"
  },
  {
    "id": "official-255-011",
    "name": "Термінове виконання наступних досліджень (до 2 годин)",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 50,
    "aliases": [
      "Термінове виконання наступних дослідженнь (до 2 годин)"
    ],
    "sortOrder": 663,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "47"
  },
  {
    "id": "official-255-012",
    "name": "Забір зразків з урогенітального тракту",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 100,
    "aliases": [],
    "sortOrder": 664,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "28"
  },
  {
    "id": "official-255-013",
    "name": "Взяття зразків з урогенітального тракту для рідинної цитології",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 100,
    "aliases": [],
    "sortOrder": 665,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "17"
  },
  {
    "id": "official-255-014",
    "name": "Видача результатів з архіву",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 50,
    "aliases": [],
    "sortOrder": 666,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "33"
  },
  {
    "id": "official-255-015",
    "name": "Забір лейкоцитарної формули на скло",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 10,
    "aliases": [],
    "sortOrder": 667,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "25"
  },
  {
    "id": "official-255-016",
    "name": "Забір крові на дому (м. Рівне)",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 350,
    "aliases": [],
    "sortOrder": 668,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "26"
  },
  {
    "id": "official-255-017",
    "name": "Забір матеріалу на дому (передмістя Рівного до 20км)",
    "category": "sampling",
    "categoryLabel": "Забір матеріалу",
    "amount": 500,
    "aliases": [],
    "sortOrder": 669,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "27"
  },
  {
    "id": "official-256-001",
    "name": "Трихоскопія",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 400,
    "aliases": [],
    "sortOrder": 670,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "2008"
  },
  {
    "id": "official-256-002",
    "name": "Дермотоскопія до 5-ти новоутворень",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 350,
    "aliases": [],
    "sortOrder": 671,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "2009"
  },
  {
    "id": "official-256-003",
    "name": "Дермотоскопія кожного наступного новоутворення",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 100,
    "aliases": [],
    "sortOrder": 672,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "2010"
  },
  {
    "id": "official-256-004",
    "name": "Видалення новоутворень (електрокоагуляція) одного новоутворення",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 300,
    "aliases": [],
    "sortOrder": 673,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "2011"
  },
  {
    "id": "official-256-005",
    "name": "Видалення новоутворень (електрокоагуляція) 2-3 новоутворень",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 674,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "2012"
  },
  {
    "id": "official-256-006",
    "name": "Видалення новоутворень (електрокоагуляція) 5-10 новоутворень",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 900,
    "aliases": [],
    "sortOrder": 675,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "2013"
  },
  {
    "id": "official-256-007",
    "name": "Видалення рідким азотом 1 елемент",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 300,
    "aliases": [],
    "sortOrder": 676,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "2014"
  },
  {
    "id": "official-256-008",
    "name": "Видалення рідким азотом 2 елементи",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 677,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "2015"
  },
  {
    "id": "official-256-009",
    "name": "Видалення рідким азотом 3 елементи",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 600,
    "aliases": [],
    "sortOrder": 678,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "2016"
  },
  {
    "id": "official-256-010",
    "name": "Видалення новоутворень шкіри (радіохвильовий метод) Перше новоутворення (папілом, невусів, «бородавок»)",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 679,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1174"
  },
  {
    "id": "official-256-011",
    "name": "Видалення новоутворень (радіохвильовий метод) кожні наступні видалення (папіломи, невуси та ін.)",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 300,
    "aliases": [],
    "sortOrder": 680,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1296"
  },
  {
    "id": "official-256-012",
    "name": "Місцеве знеболення",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 400,
    "aliases": [],
    "sortOrder": 681,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1176"
  },
  {
    "id": "official-256-013",
    "name": "Радіохвильова діатермокоагуляція ерозії шийки матки",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 2800,
    "aliases": [],
    "sortOrder": 682,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1175"
  },
  {
    "id": "official-256-014",
    "name": "Видалення внутрішньоматкової спіралі",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 1000,
    "aliases": [],
    "sortOrder": 683,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1040"
  },
  {
    "id": "official-256-015",
    "name": "Кольпоскопія",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 684,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1121"
  },
  {
    "id": "official-256-016",
    "name": "Проведення пайпель біопсії",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 1600,
    "aliases": [],
    "sortOrder": 685,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1990"
  },
  {
    "id": "official-256-017",
    "name": "Аудіометрія",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 600,
    "aliases": [],
    "sortOrder": 686,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "4050"
  },
  {
    "id": "official-256-020",
    "name": "Прокол вушок",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 600,
    "aliases": [],
    "sortOrder": 687,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "150"
  },
  {
    "id": "official-256-018",
    "name": "Первинна консультація",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 700,
    "aliases": [],
    "sortOrder": 688,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1198"
  },
  {
    "id": "official-256-019",
    "name": "Вторинна консультація",
    "category": "medical",
    "categoryLabel": "Лікарські послуги",
    "amount": 500,
    "aliases": [],
    "sortOrder": 689,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1199"
  },
  {
    "id": "official-uzd-001",
    "name": "ОЧП (органи черевної порожнини) комплексно",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [],
    "sortOrder": 690,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1138"
  },
  {
    "id": "official-uzd-018",
    "name": "ОЧП з навантаженням + 2 фото",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 700,
    "aliases": [
      "УЗД ОЧП з навантаженням + 2 фото"
    ],
    "sortOrder": 691,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1181"
  },
  {
    "id": "official-uzd-019",
    "name": "Слинні залози",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [],
    "sortOrder": 692,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1140"
  },
  {
    "id": "rivne-20260909-4-4-item",
    "name": "УЗД мигдаликів",
    "amount": 400,
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "sortOrder": 693,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1330"
  },
  {
    "id": "rivne-20260909-4-5-item",
    "name": "УЗД гайморових пазух",
    "amount": 400,
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "sortOrder": 694,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1331"
  },
  {
    "id": "official-uzd-020",
    "name": "Плевральна порожнина",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [],
    "sortOrder": 695,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1141"
  },
  {
    "id": "rivne-20260909-4-7-item",
    "name": "УЗД легенів",
    "amount": 600,
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "sortOrder": 696,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1329"
  },
  {
    "id": "official-uzd-002",
    "name": "УЗД нирки + сечовий міхур (сечовидільна система)",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [
      "УЗД нирки+сечовий міхур (сечовидільна систама)"
    ],
    "sortOrder": 697,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1142"
  },
  {
    "id": "official-uzd-003",
    "name": "Нирки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [
      "УЗД нирок"
    ],
    "sortOrder": 698,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1143"
  },
  {
    "id": "official-uzd-035",
    "name": "Нирки + наднирники",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [
      "Нирки+наднирники"
    ],
    "sortOrder": 699,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1282"
  },
  {
    "id": "official-uzd-021",
    "name": "Сечовий міхур",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 350,
    "aliases": [
      "УЗД Сечового міхура"
    ],
    "sortOrder": 700,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1179"
  },
  {
    "id": "official-uzd-004",
    "name": "Щитоподібна залоза",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [
      "УЗД щитоподібної залози"
    ],
    "sortOrder": 701,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1145"
  },
  {
    "id": "rivne-20260909-4-13-item",
    "name": "УЗД колінного суглоба (одного)",
    "amount": 500,
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "sortOrder": 702,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1327"
  },
  {
    "id": "rivne-20260909-4-14-item",
    "name": "УЗД колінних суглобів (обох)",
    "amount": 900,
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "sortOrder": 703,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1328"
  },
  {
    "id": "official-uzd-005",
    "name": "М’які тканини",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [
      "УЗД м’яких тканин"
    ],
    "sortOrder": 704,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1153"
  },
  {
    "id": "official-uzd-024",
    "name": "Молочні залози",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 550,
    "aliases": [
      "УЗД молочних залоз"
    ],
    "sortOrder": 705,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1154"
  },
  {
    "id": "official-uzd-022",
    "name": "Грудні залози у чоловіків",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [
      "УЗД Грудних залоз у чоловіків"
    ],
    "sortOrder": 706,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1180"
  },
  {
    "id": "official-uzd-006",
    "name": "Лімфовузли, одна ділянка (шийні, аксилярні, клубові + пахові)",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [
      "УЗД лімфатичних вузлів одна ділянка (шийні, аксілярні, клубові+пахові)"
    ],
    "sortOrder": 707,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1157"
  },
  {
    "id": "official-uzd-008",
    "name": "Обстеження органів малого тазу жінок та ранні терміни вагітності (трансвагінально/трансабдомінально)",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [
      "УЗД органів малого тазу жінок та ранні терміни вагітності (трансвагінально або трансабдомінально)"
    ],
    "sortOrder": 708,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1159"
  },
  {
    "id": "official-uzd-007",
    "name": "УЗД фолікулометрія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [],
    "sortOrder": 709,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1169"
  },
  {
    "id": "official-uzd-034",
    "name": "УЗД цервікометрія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 450,
    "aliases": [],
    "sortOrder": 710,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1283"
  },
  {
    "id": "official-uzd-043",
    "name": "Обстеження калитки чоловіків",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [],
    "sortOrder": 711,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1161"
  },
  {
    "id": "official-uzd-010",
    "name": "Обстеження простати чоловіків (трансабдомінально)",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 500,
    "aliases": [
      "Обстеження простати чоловіків"
    ],
    "sortOrder": 712,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1162"
  },
  {
    "id": "official-uzd-023",
    "name": "ТРУЗД-трансректально",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [],
    "sortOrder": 713,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1183"
  },
  {
    "id": "official-uzd-009",
    "name": "Органи калитки чоловіків + еластографія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 900,
    "aliases": [],
    "sortOrder": 714,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1268"
  },
  {
    "id": "official-uzd-013",
    "name": "Доплерографія вен/артерій (1 кінцівка)",
    "category": "doppler",
    "categoryLabel": "Доплер судин",
    "amount": 600,
    "aliases": [],
    "sortOrder": 715,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1148"
  },
  {
    "id": "official-uzd-014",
    "name": "Доплерографія вен/артерій (2 кінцівки)",
    "category": "doppler",
    "categoryLabel": "Доплер судин",
    "amount": 800,
    "aliases": [],
    "sortOrder": 716,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1146"
  },
  {
    "id": "official-uzd-015",
    "name": "Доплерографія артерій + вен (1 кінцівка)",
    "category": "doppler",
    "categoryLabel": "Доплер судин",
    "amount": 800,
    "aliases": [
      "Доплерографія артерій+вен (1 кінцівка)"
    ],
    "sortOrder": 717,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1149"
  },
  {
    "id": "official-uzd-016",
    "name": "Доплерографія артерій + вен (2 кінцівки)",
    "category": "doppler",
    "categoryLabel": "Доплер судин",
    "amount": 1100,
    "aliases": [
      "Доплерографія артерій+вен (2 кінцівки)"
    ],
    "sortOrder": 718,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1150"
  },
  {
    "id": "official-uzd-017",
    "name": "Доплерографія судин шиї (артерії + вени)",
    "category": "doppler",
    "categoryLabel": "Доплер судин",
    "amount": 700,
    "aliases": [
      "Доплерографія судин шиї (артерії+вени)"
    ],
    "sortOrder": 719,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1136"
  },
  {
    "id": "official-uzd-012",
    "name": "ЕХО (УЗД) серця",
    "category": "heart",
    "categoryLabel": "Серце",
    "amount": 700,
    "aliases": [
      "УЗД серця",
      "ехокардіографія"
    ],
    "sortOrder": 720,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1168"
  },
  {
    "id": "official-uzd-026",
    "name": "УЗД ОЧП + нирки + сечовидільна система",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 800,
    "aliases": [
      "УЗД ОЧП+нирки+сечовидільна система"
    ],
    "sortOrder": 721,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1185"
  },
  {
    "id": "official-uzd-025",
    "name": "УЗД ОЧП + нирки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 700,
    "aliases": [
      "УЗД ОЧП+нирки"
    ],
    "sortOrder": 722,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1184"
  },
  {
    "id": "official-uzd-036",
    "name": "УЗД сечовидільної системи + наднирники",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [
      "УЗД сечовидільної системи+наднирники"
    ],
    "sortOrder": 723,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1288"
  },
  {
    "id": "official-uzd-037",
    "name": "УЗД ОЧП + нирки + наднирники",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 800,
    "aliases": [
      "УЗД ОЧП+нирки+наднирники"
    ],
    "sortOrder": 724,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1292"
  },
  {
    "id": "official-uzd-044",
    "name": "УЗД нирок та сечового міхура, з визначенням залишкової сечі",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 600,
    "aliases": [],
    "sortOrder": 725,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1320"
  },
  {
    "id": "official-uzd-045",
    "name": "УЗД нирок та сечового міхура з визначенням залишкової сечі та обстеження простати чоловіків",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1100,
    "aliases": [],
    "sortOrder": 726,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1321"
  },
  {
    "id": "official-uzd-029",
    "name": "Щитоподібна залоза + еластографія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 900,
    "aliases": [
      "Щитоподібна залоза+еластографія"
    ],
    "sortOrder": 727,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1264"
  },
  {
    "id": "official-uzd-030",
    "name": "Молочні залози + еластографія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 900,
    "aliases": [
      "Молочні залози+еластографія"
    ],
    "sortOrder": 728,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1265"
  },
  {
    "id": "official-uzd-031",
    "name": "Еластографія печінки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 900,
    "aliases": [],
    "sortOrder": 729,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1266"
  },
  {
    "id": "official-uzd-033",
    "name": "Лімфовузли, одна ділянка + еластографія",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 800,
    "aliases": [
      "Лімфовузли, одна ділянка+еластографія"
    ],
    "sortOrder": 730,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1267"
  },
  {
    "id": "official-uzd-032",
    "name": "Органи черевної порожнини+еластографія печінки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1200,
    "aliases": [],
    "sortOrder": 731,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1269"
  },
  {
    "id": "official-uzd-038",
    "name": "Еластографія печінки+селезінки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1200,
    "aliases": [],
    "sortOrder": 732,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1286"
  },
  {
    "id": "official-uzd-039",
    "name": "ОЧП + Еластографія печінки+селезінки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1300,
    "aliases": [
      "Еластографія ОЧП+печінки+селезінки"
    ],
    "sortOrder": 733,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1287"
  },
  {
    "id": "rivne-20260909-4-45-item",
    "name": "Еластографія вогнищевих змін інших органів (матка, передміхурова залоза, слинні залози, селезінка)",
    "amount": 900,
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "sortOrder": 734,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "aliases": [],
    "code": "1322"
  },
  {
    "id": "official-uzd-040",
    "name": "УЗД ОЧП+нирки+еластографія утворення",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1000,
    "aliases": [],
    "sortOrder": 735,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1289"
  },
  {
    "id": "official-uzd-041",
    "name": "УЗД ОЧП+еластографія утворення",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1000,
    "aliases": [],
    "sortOrder": 736,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1290"
  },
  {
    "id": "official-uzd-042",
    "name": "УЗД еластографія печінки+ОЧП+нирки",
    "category": "ultrasound",
    "categoryLabel": "УЗД",
    "amount": 1300,
    "aliases": [],
    "sortOrder": 737,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1291"
  },
  {
    "id": "official-uzd-011",
    "name": "ЕКГ (електрокардіограма)",
    "category": "heart",
    "categoryLabel": "Серце",
    "amount": 280,
    "aliases": [],
    "sortOrder": 738,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1041"
  },
  {
    "id": "official-uzd-028",
    "name": "ЕКГ (електрокардіограма) з ОПИСОМ",
    "category": "heart",
    "categoryLabel": "Серце",
    "amount": 320,
    "aliases": [
      "ЕКГ (електрокардіограма) + заключення"
    ],
    "sortOrder": 739,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1042"
  },
  {
    "id": "official-uzd-027",
    "name": "Холтер ЕКГ (Добове моніторування)",
    "category": "heart",
    "categoryLabel": "Серце",
    "amount": 900,
    "aliases": [
      "Холтер ЕКГ (добове моніторування)"
    ],
    "sortOrder": 740,
    "isActive": true,
    "turnaround": "Уточнюйте",
    "code": "1045"
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
).map(proofreadPriceItem);
