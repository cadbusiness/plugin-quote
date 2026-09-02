import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { listQuotes } from "@/lib/crm/quotes";

function csvEscape(value: unknown) {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  const url = new URL(req.url);
  const supabase = await createClient();
  const quotes = await listQuotes(supabase, ctx.organization.id, {
    status: url.searchParams.get("status") ?? undefined,
    assigned: url.searchParams.get("assigned") ?? undefined,
    score: url.searchParams.get("score") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });
  const { data: statuses } = await supabase
    .from("quote_statuses")
    .select("*")
    .eq("organization_id", ctx.organization.id);
  const labels = new Map((statuses ?? []).map((s) => [s.id, s.label]));

  const header = ["date", "nom", "email", "telephone", "societe", "statut", "score", "qualification", "assigne"];
  const rows = quotes.map((q) =>
    [
      q.created_at,
      q.contact_name,
      q.contact_email,
      q.contact_phone,
      q.contact_company,
      (q.status_id && labels.get(q.status_id)) || q.status,
      q.score,
      q.score_label,
      q.assigned_to ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=devis.csv",
    },
  });
}
