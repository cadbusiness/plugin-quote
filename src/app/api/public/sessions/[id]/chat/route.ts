import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { getSession, updateSession } from "@/lib/public/session";
import { loadDefinition } from "@/lib/wizard/definition";
import { runChatTurn } from "@/lib/chat/claude";
import { mergeAnswers } from "@/lib/wizard/suggestions";

const schema = z.object({ message: z.string().min(1).max(4000) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get("x-session-token")?.trim() ?? "";
  const session = await getSession(id, token);
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: row } = await supabase
    .from("quote_sessions")
    .select("organization_id, configurator_id")
    .eq("id", id)
    .single();
  const { data: org } = await supabase
    .from("organizations")
    .select("slug")
    .eq("id", row!.organization_id)
    .single();
  const { data: cfg } = await supabase
    .from("configurators")
    .select("slug")
    .eq("id", row!.configurator_id)
    .single();

  const definition = await loadDefinition(supabase, org!.slug, cfg!.slug);
  if (!definition?.configurator.chatEnabled) {
    return NextResponse.json({ error: "Chat désactivé" }, { status: 403 });
  }

  const currentAnswers = mergeAnswers(session.answers, session.extractedParams);
  try {
    const turn = await runChatTurn({
      definition,
      history: session.chatMessages,
      userMessage: parsed.data.message,
      currentAnswers,
    });

    const chatMessages = [
      ...session.chatMessages,
      { role: "user" as const, content: parsed.data.message },
      { role: "assistant" as const, content: turn.assistantText },
    ];

    const suggestionStep = definition.steps.findIndex((s) => s.screenType === "suggestions");
    const contactStep = definition.steps.findIndex((s) => s.screenType === "contact");
    let currentStep = session.currentStep;
    if (turn.goContact && contactStep >= 0) currentStep = contactStep;
    else if (turn.goSuggestions && suggestionStep >= 0) currentStep = suggestionStep;

    const next = await updateSession(id, token, {
      mode: "chat",
      extractedParams: turn.extracted,
      chatMessages,
      currentStep,
    });

    return NextResponse.json({
      session: next,
      message: turn.assistantText,
      goSuggestions: turn.goSuggestions,
      goContact: turn.goContact,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat indisponible";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
