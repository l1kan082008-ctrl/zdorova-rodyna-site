import type { CategoryId } from "./priceData";

type IconKind =
  | "brain"
  | "doctor"
  | "drop"
  | "flask"
  | "heart"
  | "kidneys"
  | "scan"
  | "shield"
  | "stomach"
  | "virus";

const categoryIcons: Record<CategoryId, IconKind> = {
  ultrasound: "scan",
  heart: "heart",
  doppler: "heart",
  ct: "scan",
  mri: "brain",
  general: "flask",
  biochemistry: "flask",
  diabetes: "drop",
  hemostasis: "drop",
  hormones: "flask",
  growth: "heart",
  prenatal: "heart",
  oncology: "shield",
  rheumatology: "heart",
  anemia: "drop",
  immunology: "shield",
  osteoporosis: "shield",
  cytology: "flask",
  infections: "virus",
  hiv: "shield",
  torch: "virus",
  urogenital: "kidneys",
  allergy: "shield",
  genetics: "brain",
  culture: "flask",
  bacteriology: "virus",
  complexes: "flask",
  covid: "virus",
  sampling: "drop",
  medical: "doctor",
  "other-infections": "virus",
};

export function PriceCategoryIcon({
  category,
}: {
  category: CategoryId | "all";
}) {
  const kind = category === "all" ? "flask" : categoryIcons[category];

  const content = (() => {
    switch (kind) {
      case "drop":
        return (
          <>
            <path d="M32 7S16 27 16 40a16 16 0 0 0 32 0C48 27 32 7 32 7Z" />
            <path d="M24 42c1 5 4 8 9 9" />
          </>
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
            <circle cx="32" cy="15" r="8" />
            <path d="M13 57v-9c0-11 8-19 19-19s19 8 19 19v9M22 32v9a10 10 0 0 0 20 0v-9M19 57V45M45 57V45" />
            <circle cx="42" cy="43" r="3" />
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
