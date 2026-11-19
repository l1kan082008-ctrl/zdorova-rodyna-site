"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { resolveDoctorProfileReturnTo, safeDoctorReturnTo } from "@/lib/doctorProfileNavigation";

export function DoctorProfileBackLink({ doctorId, returnTo }: { doctorId: string; returnTo?: string }) {
  const [destination, setDestination] = useState(() => safeDoctorReturnTo(returnTo));
  useEffect(() => {
    setDestination(resolveDoctorProfileReturnTo(doctorId, returnTo));
  }, [doctorId, returnTo]);
  // Native navigation keeps a direct CT entry's fragment from being appended twice by the router.
  if (destination?.startsWith("/services/ct#")) {
    return <a className="doctor-detail-back" href={destination}>← Повернутися до лікарів КТ</a>;
  }
  return <Link className="doctor-detail-back" href={destination ?? "/doctors"}>
    {destination?.startsWith("/services/mri") ? "← Повернутися до лікарів МРТ" : destination ? "← Повернутися до вибору лікаря" : "← Всі лікарі"}
  </Link>;
}
