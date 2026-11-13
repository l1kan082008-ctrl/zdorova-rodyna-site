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
  return <>
    {/* React hoists this link into the initial head, including URL variants. */}
    <link rel="canonical" href="https://zdorovarodynaplus.com.ua/contacts" />
    <link rel="preconnect" href="https://www.google.com" />
    {children}
  </>;
}
