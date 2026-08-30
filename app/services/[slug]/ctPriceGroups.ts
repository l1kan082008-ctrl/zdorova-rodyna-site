export const CT_PRICE_GROUPS = [
  { id: "head", label: "Голова" },
  { id: "bones", label: "Кістки, суглоби" },
  { id: "neck", label: "Шия" },
  { id: "chest", label: "Грудна клітина (легені, середостіння) (ОГК)" },
  {
    id: "abdomen",
    label: "Черевна порожнина, заочеревинний простір, малий таз (ОЧП)",
  },
  { id: "combined", label: "Комбіновані дослідження" },
  { id: "angiography", label: "Ангіографія" },
  { id: "heart", label: "Серце" },
  { id: "additional", label: "Додатково" },
] as const;

export type CtPriceGroupId = (typeof CT_PRICE_GROUPS)[number]["id"];
