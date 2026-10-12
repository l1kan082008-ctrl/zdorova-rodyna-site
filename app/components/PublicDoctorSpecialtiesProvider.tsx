"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getPublicDoctorCategories, type PublicDoctorCategory } from "@/lib/publicDoctorSpecialties";

const PublicDoctorSpecialtiesContext = createContext<PublicDoctorCategory[]>(getPublicDoctorCategories([]));

export function PublicDoctorSpecialtiesProvider({ categories, children }: { categories: PublicDoctorCategory[]; children: ReactNode }) {
  return <PublicDoctorSpecialtiesContext.Provider value={categories}>{children}</PublicDoctorSpecialtiesContext.Provider>;
}

export function usePublicDoctorSpecialties() {
  return useContext(PublicDoctorSpecialtiesContext);
}
