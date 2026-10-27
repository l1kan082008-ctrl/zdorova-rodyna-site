import type { ReactNode } from "react";
import { cookies } from "next/headers";
import AdminShell from "./AdminShell";
import { ADMIN_THEME_COOKIE, resolveAdminTheme } from "./adminTheme";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  return <AdminShell initialTheme={resolveAdminTheme(cookieStore.get(ADMIN_THEME_COOKIE)?.value)}>{children}</AdminShell>;
}
