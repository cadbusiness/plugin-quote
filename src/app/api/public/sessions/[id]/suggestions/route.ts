import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getSession } from "@/lib/public/session";
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
    .select("configurator_id")
    .eq("id", id)
    .single();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("configurator_id", sessionRow!.configurator_id)
    .eq("is_active", true);
  const { data: rules } = await supabase
    .from("suggestion_rules")
    .select("*")
    .eq("configurator_id", sessionRow!.configurator_id);

  const answers = mergeAnswers(session.answers, session.extractedParams);
  const suggestions = evaluateSuggestions(answers, rules ?? [], (products ?? []).map(mapProductRow));
  return NextResponse.json({ suggestions });
}
