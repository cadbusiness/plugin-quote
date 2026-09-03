import { NextResponse } from "next/server";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { loadStatsDashboard, resolveRange } from "@/lib/stats/dashboard";
import { StatsPdf } from "@/lib/pdf/stats-pdf";

export async function GET(req: Request) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.redirect(new URL("/onboarding", req.url));
  const range = resolveRange(new URL(req.url).searchParams.get("range") ?? undefined);
  const supabase = await createClient();
  const stats = await loadStatsDashboard(supabase, ctx.organization.id, range);
  const buffer = await renderToBuffer(
    createElement(StatsPdf, {
      organizationName: ctx.organization.name,
      stats,
    }) as Parameters<typeof renderToBuffer>[0],
  );
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quotebuilder-stats.pdf"`,
    },
  });
}
