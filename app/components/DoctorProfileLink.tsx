"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { doctorProfileHref, rememberDoctorProfileNavigation, safeDoctorReturnTo } from "@/lib/doctorProfileNavigation";

type DoctorProfileLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  doctorId: string;
  returnTo?: string;
};

export function DoctorProfileLink({ doctorId, returnTo, onClick, onAuxClick, onContextMenu, ...props }: DoctorProfileLinkProps) {
  const remember = () => rememberDoctorProfileNavigation(doctorId, returnTo);
  return <Link
    {...props}
    href={doctorProfileHref(doctorId)}
    data-doctor-return-to={safeDoctorReturnTo(returnTo)}
    onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) remember(); }}
    onAuxClick={(event) => { onAuxClick?.(event); if (!event.defaultPrevented && event.button === 1) remember(); }}
    onContextMenu={(event) => { onContextMenu?.(event); if (!event.defaultPrevented) remember(); }}
  />;
}
