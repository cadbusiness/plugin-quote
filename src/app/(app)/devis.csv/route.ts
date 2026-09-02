import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";

function csvEscape(value: unknown) {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  const supabase = await createClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  const header = [
    "date",
    "nom",
    "email",
    "telephone",
    "societe",
    "statut",
    "score",
    "qualification",
  ];
  const rows = (quotes ?? []).map((q) =>
    [
      q.created_at,
      q.contact_name,
      q.contact_email,
      q.contact_phone,
      q.contact_company,
      q.status,
      q.score,
      q.score_label,
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
