import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { getDoctorById } from "../../api/doctors/doctorStore";
import { defaultDoctors, type Doctor } from "../doctorData";
import { DoctorProfileDetails } from "./DoctorProfileDetails";

async function loadDoctor(id: string): Promise<Doctor | null> {
  const fallback = defaultDoctors.find((doctor) => doctor.id === id) ?? null;

  try {
    return (await getDoctorById(id)) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doctor = await loadDoctor(id);

  if (!doctor) {
    return {
      title: "Лікаря не знайдено — Здорова Родина",
      description: "Перегляньте каталог лікарів медичного центру.",
    };
  }

  return {
    title: `${doctor.name} — Здорова Родина`,
    description: `${doctor.specialty}. Інформація про лікаря, графік прийому та запис у медичному центрі «Здорова Родина».`,
  };
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doctor = await loadDoctor(id);

  return (
    <main className="inner-page">
      <SiteHeader active="doctors" />
      <DoctorProfileDetails doctor={doctor} />
      <SiteFooter />
    </main>
  );
}
