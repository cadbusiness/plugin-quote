import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { loadDefinition } from "@/lib/wizard/definition";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgSlug: string; configuratorSlug: string }> },
) {
  const { orgSlug, configuratorSlug } = await params;
  const definition = await loadDefinition(createServiceClient(), orgSlug, configuratorSlug);
  if (!definition) {
    return NextResponse.json({ error: "Configurateur introuvable" }, { status: 404 });
  }
  return NextResponse.json(definition);
}
