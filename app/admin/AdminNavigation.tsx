export type AdminSection =
  | "doctors"
  | "bookings"
  | "prices"
  | "locations"
  | "banners"
  | "ai-operator";

type AdminNavigationProps = {
  current: AdminSection;
  className?: string;
  showSiteLink?: boolean;
};

// Навігація тепер централізована в app/admin/layout.tsx.
// Компонент залишено тимчасово, щоб сторінки не потребували масового переписування.
export default function AdminNavigation(_props: AdminNavigationProps) {
  return null;
}
