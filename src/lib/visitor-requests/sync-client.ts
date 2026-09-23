import { linesFromQuantities } from "@/lib/visitor-requests/lines";

export function syncVisitorDraft(input: {
  orgSlug: string;
  configuratorSlug?: string;
  shopSlug?: string;
  configuratorId?: string;
  customization: {
    quantities: Record<string, number>;
    options?: Record<string, Record<string, string> | undefined>;
  };
}) {
  const lines = linesFromQuantities(input.customization);
  void fetch("/api/public/requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      orgSlug: input.orgSlug,
      configuratorSlug: input.configuratorSlug,
      shopSlug: input.shopSlug,
      configuratorId: input.configuratorId,
      lines,
    }),
  }).catch(() => undefined);
}
