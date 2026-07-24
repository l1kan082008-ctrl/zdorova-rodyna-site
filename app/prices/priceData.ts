export type CategoryId =
  | "ultrasound"
  | "heart"
  | "doppler"
  | "ct"
  | "mri"
  | "general"
  | "biochemistry"
  | "diabetes"
  | "hemostasis"
  | "hormones"
  | "complexes"
  | "medical"
  | "covid"
  | "rheumatology"
  | "cytology";

export type AdditionalPriceItem = {
  id: string;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  amount: number;
};

const priceItem = (
  id: string,
  name: string,
  category: CategoryId,
  categoryLabel: string,
  amount: number,
): AdditionalPriceItem => ({ id, name, category, categoryLabel, amount });

export const additionalCategories = [
  { id: "ct", label: "КТ" },
  { id: "mri", label: "МРТ" },
  { id: "general", label: "Загальноклінічні" },
  { id: "biochemistry", label: "Біохімія" },
  { id: "diabetes", label: "Цукровий діабет" },
  { id: "hemostasis", label: "Гемостаз" },
  { id: "hormones", label: "Гормони" },
  { id: "complexes", label: "Комплексні аналізи" },
  { id: "medical", label: "Лікарські послуги" },
  { id: "covid", label: "COVID-19" },
  { id: "rheumatology", label: "Кардіо-ревматологія" },
  { id: "cytology", label: "Цитологія" },
] as const;

export const additionalPriceItems: AdditionalPriceItem[] = [
  priceItem("ct-sinuses", "КТ приносових пазух", "ct", "КТ", 1500),
  priceItem("ct-sinuses-contrast", "КТ приносових пазух з контрастуванням", "ct", "КТ", 3000),
  priceItem("ct-face", "КТ щелепно-лицевої ділянки", "ct", "КТ", 1500),
  priceItem("ct-face-contrast", "КТ щелепно-лицевої ділянки з контрастуванням", "ct", "КТ", 3200),
  priceItem("ct-brain", "КТ головного мозку", "ct", "КТ", 1500),
  priceItem("ct-brain-contrast", "КТ головного мозку з контрастуванням", "ct", "КТ", 3200),
  priceItem("ct-temporal", "КТ скроневих кісток", "ct", "КТ", 1600),
  priceItem("ct-brain-sinuses", "КТ головного мозку та приносових пазух", "ct", "КТ", 2000),
  priceItem("ct-spine", "КТ одного відділу хребта", "ct", "КТ", 1500),
  priceItem("ct-joint", "КТ одного суглоба", "ct", "КТ", 1600),

  priceItem("mri-brain", "МРТ головного мозку без контрасту", "mri", "МРТ", 3250),
  priceItem("mri-brain-contrast", "МРТ головного мозку з контрастуванням", "mri", "МРТ", 6200),
  priceItem("mri-brain-arteries", "МРТ головного мозку та артерій без контрасту", "mri", "МРТ", 4400),
  priceItem("mri-brain-vessels", "МРТ головного мозку, артерій та вен без контрасту", "mri", "МРТ", 5200),
  priceItem("mri-head-neck", "МРТ головного мозку та артерій голови і шиї", "mri", "МРТ", 5500),
  priceItem("mri-pituitary", "МРТ гіпофіза без контрасту", "mri", "МРТ", 3200),
  priceItem("mri-inner-ear", "МРТ внутрішнього вуха без контрасту", "mri", "МРТ", 3250),
  priceItem("mri-orbits", "МРТ орбіт без контрасту", "mri", "МРТ", 3250),
  priceItem("mri-bile-ducts", "МРТ жовчовивідних протоків", "mri", "МРТ", 3200),
  priceItem("mri-abdomen", "МРТ черевної порожнини та МРХПГ", "mri", "МРТ", 6100),

  priceItem("cbc-auto", "Загальний розгорнутий аналіз крові, автоматичний підрахунок", "general", "Загальноклінічні", 210),
  priceItem("cbc-manual", "Загальний розгорнутий аналіз крові, ручна формула", "general", "Загальноклінічні", 260),
  priceItem("reticulocytes", "Аналіз крові на ретикулоцити", "general", "Загальноклінічні", 170),
  priceItem("blood-group", "Група крові та резус-фактор", "general", "Загальноклінічні", 280),
  priceItem("urine-general", "Загальний аналіз сечі з мікроскопією осаду", "general", "Загальноклінічні", 180),
  priceItem("urine-nechiporenko", "Аналіз сечі за Нечипоренко", "general", "Загальноклінічні", 170),
  priceItem("coprogram", "Копрограма", "general", "Загальноклінічні", 260),
  priceItem("helminths", "Аналіз калу на яйця гельмінтів", "general", "Загальноклінічні", 220),
  priceItem("calprotectin", "Кальпротектин у калі, кількісно", "general", "Загальноклінічні", 720),
  priceItem("helicobacter-ag", "Helicobacter pylori Ag у калі", "general", "Загальноклінічні", 420),

  priceItem("bilirubin-total", "Білірубін загальний", "biochemistry", "Біохімія", 140),
  priceItem("bilirubin-direct", "Білірубін прямий", "biochemistry", "Біохімія", 140),
  priceItem("bilirubin-complex", "Білірубіновий комплекс", "biochemistry", "Біохімія", 250),
  priceItem("alpha-amylase", "Альфа-амілаза", "biochemistry", "Біохімія", 150),
  priceItem("lipase", "Ліпаза", "biochemistry", "Біохімія", 150),
  priceItem("alt", "Аланінамінотрансфераза (АЛТ)", "biochemistry", "Біохімія", 140),
  priceItem("ast", "Аспартатамінотрансфераза (АСТ)", "biochemistry", "Біохімія", 140),
  priceItem("ggt", "Гамма-глутамілтрансфераза (ГГТ)", "biochemistry", "Біохімія", 140),
  priceItem("creatinine", "Креатинін", "biochemistry", "Біохімія", 140),
  priceItem("urea", "Сечовина", "biochemistry", "Біохімія", 140),
  priceItem("cholesterol", "Холестерин загальний", "biochemistry", "Біохімія", 140),
  priceItem("triglycerides", "Тригліцериди", "biochemistry", "Біохімія", 150),

  priceItem("glucose-venous", "Глюкоза, венозна кров", "diabetes", "Цукровий діабет", 140),
  priceItem("glucose-fast", "Глюкоза, експрес-тест", "diabetes", "Цукровий діабет", 120),
  priceItem("hba1c", "Глікозильований гемоглобін", "diabetes", "Цукровий діабет", 290),
  priceItem("glucose-tolerance", "Глюкозотолерантний тест", "diabetes", "Цукровий діабет", 280),
  priceItem("homa", "Індекс HOMA, глюкоза та інсулін", "diabetes", "Цукровий діабет", 390),
  priceItem("insulin", "Інсулін", "diabetes", "Цукровий діабет", 290),
  priceItem("c-peptide", "С-пептид", "diabetes", "Цукровий діабет", 290),
  priceItem("leptin", "Лептин (LEP)", "diabetes", "Цукровий діабет", 600),

  priceItem("aptt", "Активований частковий тромбопластичний час", "hemostasis", "Гемостаз", 150),
  priceItem("coagulogram", "Коагулограма", "hemostasis", "Гемостаз", 450),
  priceItem("prothrombin", "Протромбіновий тест та МНВ", "hemostasis", "Гемостаз", 180),
  priceItem("thrombin-time", "Тромбіновий час", "hemostasis", "Гемостаз", 150),
  priceItem("fibrinogen", "Фібриноген", "hemostasis", "Гемостаз", 150),
  priceItem("lupus-anticoagulant", "Вовчаковий антикоагулянт", "hemostasis", "Гемостаз", 500),
  priceItem("d-dimer", "Д-димер", "hemostasis", "Гемостаз", 290),

  priceItem("tsh", "Тиреотропний гормон (ТТГ)", "hormones", "Гормони", 250),
  priceItem("t4-free", "Т4 вільний", "hormones", "Гормони", 250),
  priceItem("t3-free", "Т3 вільний", "hormones", "Гормони", 250),
  priceItem("anti-tg", "Антитіла до тиреоглобуліну", "hormones", "Гормони", 290),
  priceItem("anti-tpo", "Антитіла до тиреопероксидази", "hormones", "Гормони", 300),
  priceItem("calcitonin", "Кальцитонін", "hormones", "Гормони", 450),
  priceItem("parathyroid", "Паратгормон", "hormones", "Гормони", 300),
  priceItem("fsh", "Фолікулостимулюючий гормон", "hormones", "Гормони", 290),
  priceItem("prolactin", "Пролактин", "hormones", "Гормони", 290),
  priceItem("testosterone", "Тестостерон загальний", "hormones", "Гормони", 290),

  priceItem("complex-thyroid-1", "Комплекс «Щитоподібна залоза» №1", "complexes", "Комплексні аналізи", 620),
  priceItem("complex-thyroid-2", "Комплекс «Щитоподібна залоза» №2", "complexes", "Комплексні аналізи", 660),
  priceItem("complex-thyroid-4", "Комплекс «Щитоподібна залоза» №4", "complexes", "Комплексні аналізи", 1300),
  priceItem("complex-diabetes", "Комплекс «Діабетичний»", "complexes", "Комплексні аналізи", 820),
  priceItem("complex-surgery", "Комплекс «Хірургічний»", "complexes", "Комплексні аналізи", 930),
  priceItem("complex-surgery-min", "Комплекс «Хірургічний мінімальний»", "complexes", "Комплексні аналізи", 2500),
  priceItem("complex-female", "Комплекс «Репродуктивне жіноче здоров’я»", "complexes", "Комплексні аналізи", 1125),
  priceItem("complex-male", "Комплекс «Репродуктивне чоловіче здоров’я»", "complexes", "Комплексні аналізи", 675),

  priceItem("trichoscopy", "Трихоскопія", "medical", "Лікарські послуги", 400),
  priceItem("dermoscopy-five", "Дермоскопія до 5 новоутворень", "medical", "Лікарські послуги", 350),
  priceItem("electrocoagulation-one", "Електрокоагуляція одного новоутворення", "medical", "Лікарські послуги", 300),
  priceItem("cryodestruction-one", "Видалення рідким азотом, 1 елемент", "medical", "Лікарські послуги", 300),
  priceItem("colposcopy", "Кольпоскопія", "medical", "Лікарські послуги", 500),
  priceItem("pipe-biopsy", "Проведення пайпель-біопсії", "medical", "Лікарські послуги", 1600),
  priceItem("audiometry", "Аудіометрія", "medical", "Лікарські послуги", 500),
  priceItem("consult-primary", "Первинна консультація лікаря", "medical", "Лікарські послуги", 700),
  priceItem("consult-secondary", "Повторна консультація лікаря", "medical", "Лікарські послуги", 500),
  priceItem("ear-piercing", "Прокол вушок", "medical", "Лікарські послуги", 600),

  priceItem("covid-spike", "SARS-CoV-2 — спайк-білок", "covid", "COVID-19", 280),
  priceItem("covid-igg", "SARS-CoV-2 IgG", "covid", "COVID-19", 270),
  priceItem("covid-igm", "SARS-CoV-2 IgM", "covid", "COVID-19", 270),
  priceItem("covid-pcr", "ПЛР SARS-CoV-2", "covid", "COVID-19", 500),
  priceItem("covid-antigen", "Антиген SARS-CoV-2, швидкий тест", "covid", "COVID-19", 250),

  priceItem("crp", "С-реактивний білок, високої чутливості", "rheumatology", "Кардіо-ревматологія", 180),
  priceItem("rheumatoid-factor", "Ревматоїдний фактор", "rheumatology", "Кардіо-ревматологія", 180),
  priceItem("aslo", "Антистрептолізин-О", "rheumatology", "Кардіо-ревматологія", 180),
  priceItem("seromucoids", "Серомукоїди", "rheumatology", "Кардіо-ревматологія", 160),
  priceItem("ana-screen", "Антинуклеарні антитіла, ANA-скринінг", "rheumatology", "Кардіо-ревматологія", 570),

  priceItem("pap-test", "ПАП-тест, цитологічне дослідження", "cytology", "Цитологія", 280),
  priceItem("liquid-cytology", "Рідинна цитологія, ПАП-тест", "cytology", "Цитологія", 550),
  priceItem("cytomorphology", "Цитоморфологічне дослідження біоматеріалу", "cytology", "Цитологія", 400),
  priceItem("giardia", "Аналіз калу на лямблії", "cytology", "Цитологія", 180),
  priceItem("nasocytogram", "Назоцитограма", "cytology", "Цитологія", 200),
  priceItem("fungi-skin", "Дослідження на паразитарні гриби", "cytology", "Цитологія", 200),
  priceItem("fungi-nails", "Мікроскопія нігтів на патогенні гриби", "cytology", "Цитологія", 220),
  priceItem("demodex", "Дослідження на демодекоз", "cytology", "Цитологія", 220),
];
