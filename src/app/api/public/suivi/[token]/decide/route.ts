import { NextResponse } from "next/server";
import { loadProspectByToken } from "@/lib/prospect/access";
import { decideAsCollaborator } from "@/lib/prospect/collaborators";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bundle = await loadProspectByToken(token);
  if (!bundle) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (bundle.viewer.kind !== "collaborator") {
    return NextResponse.json({ error: "Réservé aux décideurs invités" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const decision = body.decision === "changes_requested" ? "changes_requested" : body.decision === "approved" ? "approved" : null;
  if (!decision) return NextResponse.json({ error: "Décision invalide" }, { status: 400 });

  const budgetRaw = body.budget_max;
  let budgetMax: number | null = null;
  if (budgetRaw != null && budgetRaw !== "") {
    const n = Number(budgetRaw);
    if (!Number.isFinite(n) || n < 0) {
      return NextResponse.json({ error: "Budget invalide" }, { status: 400 });
    }
    budgetMax = n;
  }

  const comment = String(body.comment ?? "").trim();
  if (decision === "changes_requested" && !comment) {
    return NextResponse.json({ error: "Précisez les modifications demandées" }, { status: 400 });
  }

  try {
    const result = await decideAsCollaborator({
      collaboratorId: bundle.viewer.collaborator.id,
      organizationId: bundle.quote.organization_id,
      quoteId: bundle.quote.id,
      decision,
      budgetMax,
      comment: comment || null,
      contactName: bundle.quote.contact_name,
      contactCompany: bundle.quote.contact_company,
    });
    return NextResponse.json({
      ok: true,
      status: result.collaborator.status,
      validation: result.stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Décision impossible";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
