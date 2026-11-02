"use client";

import { useEffect } from "react";
import { startAdminSessionMonitor } from "./adminSessionClient";

export function useAdminSession(active: boolean) {
  useEffect(() => {
    if (active) return startAdminSessionMonitor();
  }, [active]);
}
