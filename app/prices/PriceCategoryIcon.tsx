import type { CategoryId } from "./priceData";

type IconKind =
  | "allergy"
  | "bone"
  | "brain"
  | "catalog"
  | "complex"
  | "ct"
  | "dna"
  | "doctor"
  | "doppler"
  | "drop"
  | "flask"
  | "heart"
  | "kidneys"
  | "microscope"
  | "molecule"
  | "mri"
  | "needle"
  | "pregnancy"
  | "ribbon"
  | "ruler"
  | "scan"
  | "shield"
  | "stomach"
  | "ultrasound"
  | "vessel"
  | "virus";

const categoryIcons: Record<CategoryId, IconKind> = {
  ultrasound: "ultrasound",
  heart: "heart",
  doppler: "doppler",
  ct: "ct",
  mri: "mri",
  general: "flask",
  biochemistry: "molecule",
  diabetes: "drop",
  hemostasis: "vessel",
  hormones: "flask",
  growth: "ruler",
  prenatal: "pregnancy",
  oncology: "shield",
  rheumatology: "bone",
  anemia: "drop",
  immunology: "shield",
  osteoporosis: "bone",
  cytology: "microscope",
  infections: "virus",
  hiv: "ribbon",
  torch: "virus",
  urogenital: "kidneys",
  allergy: "allergy",
  genetics: "dna",
  culture: "microscope",
  bacteriology: "microscope",
  complexes: "complex",
  covid: "virus",
  sampling: "needle",
  medical: "doctor",
  "other-infections": "virus",
};

export function PriceCategoryIcon({
  category,
}: {
  category: CategoryId | "all";
}) {
  const kind = category === "all" ? "catalog" : categoryIcons[category];

  const content = (() => {
    switch (kind) {
      case "catalog":
        return (
          <>
            <rect x="9" y="10" width="20" height="20" rx="5" />
            <rect
              x="35"
              y="8"
              width="20"
              height="20"
              rx="5"
              transform="rotate(14 45 18)"
            />
            <rect x="9" y="36" width="20" height="20" rx="5" />
            <rect x="35" y="36" width="20" height="20" rx="5" />
          </>
        );
      case "drop":
        return (
          <>
            <path d="M32 7S16 27 16 40a16 16 0 0 0 32 0C48 27 32 7 32 7Z" />
            <path d="M24 42c1 5 4 8 9 9" />
          </>
        );
      case "vessel":
        return (
          <>
            <path d="M14 8v18c0 8 6 14 14 14h8c8 0 14 6 14 14v2M50 8v14c0 8-6 14-14 14h-8c-8 0-14 6-14 14v6" />
            <path d="M9 18h10M45 18h10M9 50h10M45 50h10" />
          </>
        );
      case "doppler":
        return (
          <>
            <path d="M8 20c9-7 17-7 25 0s14 7 23 0" />
            <path d="M8 44c9-7 17-7 25 0s14 7 23 0" />
            <path d="M15 32h32" />
            <path d="m40 25 7 7-7 7" />
          </>
        );
      case "ct":
        return (
          <>
            <rect x="8" y="8" width="48" height="39" rx="8" />
            <circle cx="32" cy="27" r="12" />
            <path d="M32 39v5M17 47h30M13 53h38M21 53v4M43 53v4" />
          </>
        );
      case "mri":
        return (
          <>
            <circle cx="32" cy="27" r="22" />
            <circle cx="32" cy="27" r="13" />
            <path d="M27 9h10" />
            <path d="M22 31h20l8 16H14l8-16Z" />
            <path d="M14 47h36v6H14zM22 53v5M42 53v5M17 58h30" />
          </>
        );
      case "molecule":
        return (
          <>
            <circle cx="18" cy="34" r="7" />
            <circle cx="42" cy="16" r="7" />
            <circle cx="47" cy="46" r="8" />
            <path d="m24 29 12-9M24 38l15 6M43 23l3 15" />
          </>
        );
      case "ruler":
        return (
          <>
            <path d="M20 55 8 43 43 8l12 12-35 35Z" />
            <path d="m38 13 6 6M31 20l6 6M24 27l6 6M17 34l6 6" />
          </>
        );
      case "pregnancy":
        return (
          <>
            <circle cx="32" cy="13" r="7" />
            <path d="M25 24c-5 6-7 13-6 21l2 12M39 24c5 6 7 13 6 21l-2 12M25 26h14M24 39c4-4 12-4 17 1M23 49h19" />
            <circle cx="33" cy="40" r="5" />
          </>
        );
      case "bone":
        return (
          <path d="M18 16c-3-3-8-3-11 0s-3 8 0 11c2 2 5 3 7 2l21 21c-1 3 0 6 2 8 3 3 8 3 11 0s3-8 0-11c-2-2-5-3-7-2L20 24c1-3 0-6-2-8ZM46 7c3-3 8-3 11 0s3 8 0 11c-2 2-5 3-7 2L20 50c1 3 0 6-2 8-3 3-8 3-11 0s-3-8 0-11c2-2 5-3 7-2l30-30c-1-3 0-6 2-8Z" />
        );
      case "microscope":
        return (
          <>
            <path d="m27 8 13 13-7 7-13-13 7-7ZM30 28l-8 8c-5 5-5 13 0 18M37 19l6 6M11 56h43M21 48h25M42 28c8 2 12 8 12 16" />
            <circle cx="41" cy="39" r="6" />
          </>
        );
      case "allergy":
        return (
          <>
            <circle cx="32" cy="32" r="7" />
            <path d="M32 8c6 0 8 9 0 17-8-8-6-17 0-17ZM56 32c0 6-9 8-17 0 8-8 17-6 17 0ZM32 56c-6 0-8-9 0-17 8 8 6 17 0 17ZM8 32c0-6 9-8 17 0-8 8-17 6-17 0Z" />
          </>
        );
      case "dna":
        return (
          <>
            <path d="M18 8c0 18 28 30 28 48M46 8c0 18-28 30-28 48" />
            <path d="M22 15h20M20 25h24M20 39h24M22 49h20" />
          </>
        );
      case "complex":
        return (
          <>
            <rect x="10" y="10" width="18" height="18" rx="4" />
            <rect x="36" y="10" width="18" height="18" rx="4" />
            <rect x="10" y="36" width="18" height="18" rx="4" />
            <rect x="36" y="36" width="18" height="18" rx="4" />
            <path d="M28 19h8M19 28v8M45 28v8M28 45h8" />
          </>
        );
      case "needle":
        return (
          <>
            <path d="M15 10h34v9H15z" />
            <path d="M19 19h26v30a8 8 0 0 1-8 8H27a8 8 0 0 1-8-8V19Z" />
            <path d="M32 28v19M23 37h18" />
          </>
        );
      case "ribbon":
        return (
          <path d="M32 8c13 0 18 8 18 17 0 8-5 16-12 24l-6 7-6-7C19 41 14 33 14 25c0-9 5-17 18-17ZM32 8c-6 8-8 17-6 26M32 8c6 8 8 17 6 26" />
        );
      case "heart":
        return (
          <>
            <path d="M32 55S9 42 9 24c0-9 6-15 14-15 5 0 8 3 9 7 2-4 5-7 10-7 8 0 14 6 14 15 0 18-24 31-24 31Z" />
            <path d="M14 32h10l4-8 7 17 5-9h10" />
          </>
        );
      case "shield":
        return (
          <>
            <path d="M32 7 51 14v15c0 13-8 23-19 28C21 52 13 42 13 29V14l19-7Z" />
            <path d="m23 31 6 6 13-14" />
          </>
        );
      case "virus":
        return (
          <>
            <circle cx="32" cy="32" r="13" />
            <path d="M32 7v8M32 49v8M7 32h8M49 32h8M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6" />
            <circle cx="27" cy="28" r="2" />
            <circle cx="38" cy="34" r="2" />
            <circle cx="28" cy="39" r="2" />
          </>
        );
      case "stomach":
        return (
          <path d="M25 8v16c0 5-4 8-8 7-5-1-8 3-7 8 2 10 10 17 21 17 14 0 24-10 24-24 0-8-4-13-10-16-3-1-5 1-5 4v9c0 5-3 9-8 9-5 0-9-4-9-9" />
        );
      case "kidneys":
        return (
          <>
            <path d="M25 12c-9 0-15 8-15 19 0 10 5 18 12 18 6 0 9-5 9-12V20c0-5-2-8-6-8ZM39 12c9 0 15 8 15 19 0 10-5 18-12 18-6 0-9-5-9-12V20c0-5 2-8 6-8Z" />
            <path d="M31 38v18M33 38v18" />
          </>
        );
      case "brain":
        return (
          <>
            <path d="M31 11c-7-7-17-1-16 7-7 1-8 11-3 15-5 6-1 15 6 15 2 7 11 8 14 2V14c0-1 0-2-1-3ZM33 11c7-7 17-1 16 7 7 1 8 11 3 15 5 6 1 15-6 15-2 7-11 8-14 2V14c0-1 0-2 1-3Z" />
            <path d="M20 20c5 0 7 3 7 7M17 39c6-1 9 2 10 7M44 20c-5 0-7 3-7 7M47 39c-6-1-9 2-10 7" />
          </>
        );
      case "doctor":
        return (
          <>
            <circle cx="22" cy="15" r="7" />
            <path d="M9 42v-3c0-10 6-17 13-17s13 7 13 17v3" />
            <path d="M16 25v10a6 6 0 0 0 12 0V25" />
            <path d="M35 14h20M45 4v20" />
            <path d="M35 40v4a10 10 0 0 0 20 0V33" />
            <circle cx="55" cy="29" r="4" />
            <path d="M9 56h46" />
          </>
        );
      case "ultrasound":
        return (
          <>
            <path d="M17 18c8-8 22-8 30 0" />
            <path d="M22 23c5-5 15-5 20 0" />
            <path d="M27 28c3-3 7-3 10 0" />
            <path d="M17 33h30v5c0 6-4 10-9 12v7H26v-7c-5-2-9-6-9-12v-5Z" />
            <path d="M17 38h30M32 57v4" />
          </>
        );
      case "scan":
        return (
          <>
            <circle cx="32" cy="28" r="18" />
            <circle cx="32" cy="28" r="9" />
            <path d="M8 55h48M18 48h28v7" />
          </>
        );
      case "flask":
      default:
        return (
          <>
            <path d="M23 8h18M27 8v16L14 48c-2 4 1 8 6 8h24c5 0 8-4 6-8L37 24V8" />
            <path d="M21 40h22M25 32h14" />
          </>
        );
    }
  })();

  return (
    <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
      {content}
    </svg>
  );
}
