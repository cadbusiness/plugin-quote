/** Status-only slice — no answers, notes, suivi_url, or contact dump. */

export type QuoteStatusSlice = {
  id: string;
  status: string;
  status_label: string | null;
  score: number | null;
  score_label: string | null;
  assigned_to: { id: string; label: string }[] | null;
  created_at: string | null;
  funnel: { id: string; name: string; slug: string } | null;
};

function asFunnel(value: unknown): QuoteStatusSlice["funnel"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id : "";
  const name = typeof row.name === "string" ? row.name : "";
  const slug = typeof row.slug === "string" ? row.slug : "";
  if (!id && !name && !slug) return null;
  return { id, name, slug };
}

function asAssigned(lead: Record<string, unknown>): QuoteStatusSlice["assigned_to"] {
  const fromMembers = Array.isArray(lead.assignees)
    ? lead.assignees
    : Array.isArray(lead.assigned_to)
      ? lead.assigned_to
      : null;
  if (fromMembers) {
    const members = fromMembers
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const id = typeof row.id === "string" ? row.id : typeof row.userId === "string" ? row.userId : "";
        const label = typeof row.label === "string" ? row.label : id;
        if (!id && !label) return null;
        return { id, label };
      })
      .filter((row): row is { id: string; label: string } => row !== null);
    return members.length ? members : null;
  }
  if (typeof lead.assigned_to === "string" && lead.assigned_to) {
    return [{ id: lead.assigned_to, label: lead.assigned_to }];
  }
  return null;
}

export function sliceQuoteStatus(lead: unknown): QuoteStatusSlice {
  if (!lead || typeof lead !== "object" || Array.isArray(lead)) {
    throw new Error("Devis introuvable");
  }
  const row = lead as Record<string, unknown>;
  return {
    id: typeof row.id === "string" ? row.id : "",
    status: typeof row.status === "string" ? row.status : "",
    status_label: typeof row.status_label === "string" ? row.status_label : null,
    score: typeof row.score === "number" ? row.score : null,
    score_label: typeof row.score_label === "string" ? row.score_label : null,
    assigned_to: asAssigned(row),
    created_at: typeof row.created_at === "string" ? row.created_at : null,
    funnel: asFunnel(row.funnel),
  };
}

export function leadFromDetailPayload(data: unknown): unknown {
  if (data && typeof data === "object" && data !== null && "lead" in data) {
    return (data as { lead: unknown }).lead;
  }
  return data;
}
