import Link from "next/link";

const adminSections = [
  { id: "doctors", href: "/admin/doctors", label: "Лікарі" },
  { id: "bookings", href: "/admin/bookings", label: "Заявки" },
  { id: "prices", href: "/admin/prices", label: "Прайс" },
  { id: "locations", href: "/admin/locations", label: "Відділення" },
  { id: "banners", href: "/admin/banners", label: "Банери" },
  { id: "ai-operator", href: "/admin/ai-operator", label: "AI Call Center" },
] as const;

type AdminSectionId = (typeof adminSections)[number]["id"];

type AdminNavigationProps = {
  current: AdminSectionId;
  className?: string;
  showSiteLink?: boolean;
};

export default function AdminNavigation({
  current,
  className = "",
  showSiteLink = false,
}: AdminNavigationProps) {
  return (
    <nav
      className={`admin-navigation${className ? ` ${className}` : ""}`}
      aria-label="Розділи адмінпанелі"
    >
      {adminSections.map((section) =>
        section.id === current ? (
          <strong key={section.id} aria-current="page">
            {section.label}
          </strong>
        ) : (
          <Link key={section.id} href={section.href}>
            {section.label}
          </Link>
        ),
      )}
      {showSiteLink ? <Link href="/">На сайт</Link> : null}
    </nav>
  );
}
