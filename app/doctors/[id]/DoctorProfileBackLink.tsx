"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { resolveDoctorProfileReturnTo, safeDoctorReturnTo } from "@/lib/doctorProfileNavigation";

export function DoctorProfileBackLink({ doctorId, returnTo }: { doctorId: string; returnTo?: string }) {
  const [destination, setDestination] = useState(() => safeDoctorReturnTo(returnTo));
  useEffect(() => {
    setDestination(resolveDoctorProfileReturnTo(doctorId, returnTo));
  }, [doctorId, returnTo]);
  return <Link className="doctor-detail-back" href={destination ?? "/doctors"}>
    {destination ? "← Повернутися до вибору лікаря" : "← Всі лікарі"}
  </Link>;
}
