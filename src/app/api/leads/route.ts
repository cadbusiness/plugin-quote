import { isApiAuth, jsonError, jsonOk, requireApiAuth } from "@/lib/api/http";
import { apiGetLeads, apiCreateLead, type LeadScore, type LeadStatusSlug } from "@/lib/api/leads";

export async function GET(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as LeadStatusSlug | null;
  const score = url.searchParams.get("score") as LeadScore | null;
  const daysRaw = url.searchParams.get("days");
  const days = daysRaw ? Number(daysRaw) : undefined;

  try {
    const leads = await apiGetLeads(auth.organizationId, {
      status: status || undefined,
      score: score || undefined,
      days: Number.isFinite(days) ? days : undefined,
    });
    return jsonOk({ leads });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 500);
  }
}

export async function POST(req: Request) {
  const auth = await requireApiAuth(req);
  if (!isApiAuth(auth)) return auth;

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const lead = await apiCreateLead(auth.organizationId, {
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      phone: body.phone ? String(body.phone) : undefined,
      company: body.company ? String(body.company) : undefined,
      funnel_id: String(body.funnel_id ?? ""),
      data:
        body.data && typeof body.data === "object" && !Array.isArray(body.data)
          ? (body.data as Record<string, unknown>)
          : {},
    });
    return jsonOk({ lead }, { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError(error instanceof Error ? error.message : "Erreur", 400);
  }
}
