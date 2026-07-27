import {
  officialCategoryOptions,
  officialPriceItems,
} from "./officialPriceData";

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
  | "growth"
  | "prenatal"
  | "oncology"
  | "rheumatology"
  | "anemia"
  | "immunology"
  | "osteoporosis"
  | "cytology"
  | "infections"
  | "hiv"
  | "torch"
  | "urogenital"
  | "allergy"
  | "genetics"
  | "culture"
  | "bacteriology"
  | "complexes"
  | "covid"
  | "sampling"
  | "medical"
  | "other-infections";

export type PriceItem = {
  id: string;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  amount: number;
  turnaround?: string;
  aliases?: string[];
  isActive?: boolean;
  sortOrder?: number;
};

export const categoryOptions = officialCategoryOptions;
export const catalogItems = officialPriceItems;
