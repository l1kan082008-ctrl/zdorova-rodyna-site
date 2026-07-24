import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакти — Здорова Родина",
  description:
    "Адреси, графік роботи та телефони лікувально-діагностичного центру Здорова Родина у Рівному.",
};

export default function ContactsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
