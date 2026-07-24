import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { DoctorProfileDetails } from "./DoctorProfileDetails";

export const metadata: Metadata = {
  title: "Профіль лікаря — Здорова Родина",
  description:
    "Інформація про лікаря, стаж роботи, категорії пацієнтів і графік прийому.",
};

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="inner-page">
      <SiteHeader active="doctors" />
      <DoctorProfileDetails doctorId={id} />
      <SiteFooter />
    </main>
  );
}
