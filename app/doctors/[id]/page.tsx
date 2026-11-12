import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SiteFooter, SiteHeader } from "../../components/SiteChrome";
import { getPublicDoctorById } from "../../api/doctors/publicDoctors";
import { safeDoctorReturnTo } from "../../../lib/doctorProfileNavigation";
import { DoctorProfileDetails } from "./DoctorProfileDetails";

export const dynamic = "force-dynamic";
const loadDoctor = cache(getPublicDoctorById);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doctor = await loadDoctor(id);

  if (!doctor) notFound();

  return {
    title: `${doctor.name} — Здорова Родина`,
    description: `${doctor.specialty}. Інформація про лікаря, графік прийому та запис у медичному центрі «Здорова Родина».`,
  };
}

export default async function DoctorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const requestedReturnTo = Array.isArray(resolvedSearchParams.returnTo)
    ? resolvedSearchParams.returnTo[0]
    : resolvedSearchParams.returnTo;
  const returnTo = safeDoctorReturnTo(requestedReturnTo);
  const doctor = await loadDoctor(id);
  if (!doctor) notFound();

  return (
    <main className="inner-page">
      {/* React hoists this server-rendered link into the initial head. Keeping it
          outside streamed generateMetadata also covers ordinary browser agents. */}
      <link
        rel="canonical"
        href={`https://zdorovarodynaplus.com.ua/doctors/${encodeURIComponent(doctor.id)}`}
      />
      <SiteHeader active="doctors" />
      <DoctorProfileDetails doctor={doctor} returnTo={returnTo} />
      <SiteFooter />
    </main>
  );
}
