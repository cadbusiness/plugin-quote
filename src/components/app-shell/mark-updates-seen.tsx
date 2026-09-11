"use client";

import { useEffect } from "react";
import { markProductUpdatesSeen } from "@/app/(app)/mises-a-jour/actions";

export function MarkUpdatesSeen({ latestVersion }: { latestVersion: string | null }) {
  useEffect(() => {
    if (!latestVersion) return;
    void markProductUpdatesSeen(latestVersion);
  }, [latestVersion]);
  return null;
}
