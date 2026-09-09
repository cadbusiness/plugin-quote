import { NextResponse } from "next/server";
import { loadProspectByToken } from "@/lib/prospect/access";
import { inviteCollaborator, type CollaboratorRole } from "@/lib/prospect/collaborators";

const ROLES = new Set<CollaboratorRole>(["finance", "technical", "buyer", "other"]);

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bundle = await loadProspectByToken(token);
  if (!bundle) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (bundle.viewer.kind !== "primary") {
    return NextResponse.json({ error: "Seul le contact principal peut inviter" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim();
  const name = String(body.name ?? "").trim();
  const roleRaw = String(body.role ?? "finance") as CollaboratorRole;
  const role = ROLES.has(roleRaw) ? roleRaw : "finance";

  try {
    const result = await inviteCollaborator({
      organizationId: bundle.quote.organization_id,
      quoteId: bundle.quote.id,
      email,
      name,
      role,
      invitedBy: "prospect",
      contactName: bundle.quote.contact_name,
      contactCompany: bundle.quote.contact_company,
      notifyAssignees: true,
    });
    return NextResponse.json({
      ok: true,
      url: result.url,
      collaborator: {
        id: result.collaborator.id,
        name: result.collaborator.name,
        email: result.collaborator.email,
        role: result.collaborator.role,
        status: result.collaborator.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invitation impossible";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
