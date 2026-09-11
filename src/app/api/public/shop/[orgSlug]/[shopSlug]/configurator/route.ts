import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { gateShopCatalogRequest, resolveShopCatalog } from "@/lib/shops/catalog-scope";
import { loadShopDefinition } from "@/lib/wizard/definition";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgSlug: string; shopSlug: string }> },
) {
  const { orgSlug, shopSlug } = await params;
  const url = new URL(req.url);
  const requestedConfiguratorId = url.searchParams.get("configuratorId") ?? url.searchParams.get("catalog");
  const requestedConfiguratorSlug = url.searchParams.get("configuratorSlug") ?? url.searchParams.get("funnel");

  const resolved = await resolveShopCatalog(orgSlug, shopSlug);
  const gate = gateShopCatalogRequest(resolved, {
    configuratorId: requestedConfiguratorId,
    configuratorSlug: requestedConfiguratorSlug,
  });
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const definition = await loadShopDefinition(createServiceClient(), gate.scope);
  if (!definition) {
    return NextResponse.json({ error: "Catalogue de cette boutique introuvable" }, { status: 404 });
  }
  return NextResponse.json(definition);
}
