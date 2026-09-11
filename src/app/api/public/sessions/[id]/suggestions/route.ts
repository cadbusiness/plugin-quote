import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getSession } from "@/lib/public/session";
import { gateShopCatalogRequest, resolveShopCatalog } from "@/lib/shops/catalog-scope";
import { mapProductRow } from "@/lib/wizard/definition";
import { evaluateSuggestions, mergeAnswers } from "@/lib/wizard/suggestions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get("x-session-token")?.trim() ?? "";
  const session = await getSession(id, token);
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

  const supabase = createServiceClient();
  const { data: sessionRow } = await supabase
    .from("quote_sessions")
    .select("configurator_id, organization_id")
    .eq("id", id)
    .maybeSingle();
  if (!sessionRow) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

  const url = new URL(req.url);
  const shopSlug = url.searchParams.get("shop") ?? req.headers.get("x-shop-slug")?.trim() ?? "";
  const orgSlug = url.searchParams.get("org") ?? req.headers.get("x-org-slug")?.trim() ?? "";
  const requestedCatalog = url.searchParams.get("configuratorId") ?? url.searchParams.get("catalog");
  if (shopSlug && orgSlug) {
    const gate = gateShopCatalogRequest(await resolveShopCatalog(orgSlug, shopSlug), {
      configuratorId: requestedCatalog ?? sessionRow.configurator_id,
    });
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status });
    }
    if (sessionRow.configurator_id !== gate.scope.configuratorId) {
      return NextResponse.json({ error: "Ce catalogue n’appartient pas à cette boutique" }, { status: 403 });
    }
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("configurator_id", sessionRow.configurator_id)
    .eq("organization_id", sessionRow.organization_id)
    .eq("is_active", true);
  const { data: rules } = await supabase
    .from("suggestion_rules")
    .select("*")
    .eq("configurator_id", sessionRow.configurator_id);

  const answers = mergeAnswers(session.answers, session.extractedParams);
  const suggestions = evaluateSuggestions(answers, rules ?? [], (products ?? []).map(mapProductRow));
  return NextResponse.json({ suggestions });
}
