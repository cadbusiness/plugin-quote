"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import { visitPageLabel } from "@/lib/stats/visit";

function visitorId() {
  try {
    const existing = localStorage.getItem("qb-vid");
    if (existing) return existing;
    const next = crypto.randomUUID();
    localStorage.setItem("qb-vid", next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

export function StorefrontVisitTracker({
  orgSlug,
  shopSlug,
  funnelSlug,
}: {
  orgSlug: string;
  shopSlug: string;
  funnelSlug: string | null;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const path = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
    fetch("/api/public/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orgSlug,
        shopSlug,
        configuratorSlug: funnelSlug ?? undefined,
        eventType: ANALYTICS_EVENTS.pageView,
        visitorId: visitorId(),
        search: typeof window !== "undefined" ? window.location.search : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
        landingPath: path,
        title: visitPageLabel(path),
      }),
    }).catch(() => undefined);
  }, [orgSlug, shopSlug, funnelSlug, pathname]);

  return null;
}
