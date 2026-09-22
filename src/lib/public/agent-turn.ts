import { createServiceClient } from "@/lib/supabase/service";
import { getSession, updateSession } from "@/lib/public/session";
import { loadDefinition } from "@/lib/wizard/definition";
import { runChatTurn } from "@/lib/chat/claude";
import { mergeAnswers } from "@/lib/wizard/suggestions";
import type { QuoteSession } from "@/lib/wizard/types";

export type AgentTurnResult = {
  session: QuoteSession;
  message: string;
  goSuggestions: boolean;
  goContact: boolean;
  toolTrace: { name: string; status: string; gate?: string }[];
};

/** Site modules (carte, bloc) can talk to the agent on a form funnel. The public page still requires chat. */
export async function applyAgentTurn(input: {
  sessionId: string;
  token: string;
  message: string;
  requireChat: boolean;
}): Promise<{ ok: true; turn: AgentTurnResult } | { ok: false; error: string; status: number }> {
  const session = await getSession(input.sessionId, input.token);
  if (!session) return { ok: false, error: "Session introuvable", status: 404 };

  const supabase = createServiceClient();
  const { data: row } = await supabase
    .from("quote_sessions")
    .select("organization_id, configurator_id")
    .eq("id", input.sessionId)
    .single();
  if (!row) return { ok: false, error: "Session introuvable", status: 404 };

  const { data: org } = await supabase.from("organizations").select("slug").eq("id", row.organization_id).single();
  const { data: cfg } = await supabase.from("configurators").select("slug").eq("id", row.configurator_id).single();
  if (!org?.slug || !cfg?.slug) return { ok: false, error: "Configurateur introuvable", status: 404 };

  const definition = await loadDefinition(supabase, org.slug, cfg.slug);
  if (!definition) return { ok: false, error: "Configurateur introuvable", status: 404 };
  if (input.requireChat && !definition.configurator.chatEnabled) {
    return { ok: false, error: "Chat désactivé", status: 403 };
  }

  const { data: rules } = await supabase
    .from("suggestion_rules")
    .select("*")
    .eq("configurator_id", row.configurator_id)
    .eq("is_active", true)
    .order("priority", { ascending: false });

  const currentAnswers = mergeAnswers(session.answers, session.extractedParams);
  const turn = await runChatTurn({
    definition,
    rules: rules ?? [],
    history: session.chatMessages,
    userMessage: input.message,
    currentAnswers,
    contactDraft: session.contactDraft,
  });

  const chatMessages = [
    ...session.chatMessages,
    { role: "user" as const, content: input.message },
    { role: "assistant" as const, content: turn.assistantText },
  ];

  const suggestionStep = definition.steps.findIndex((s) => s.screenType === "suggestions");
  const contactStep = definition.steps.findIndex((s) => s.screenType === "contact");
  const hostCollectsEmail = turn.toolTrace.some((step) => step.gate === "contact_email_required");
  const goContact = turn.goContact || hostCollectsEmail;
  let currentStep = session.currentStep;
  if (goContact && contactStep >= 0) currentStep = contactStep;
  else if (turn.goSuggestions && suggestionStep >= 0) currentStep = suggestionStep;

  const next = await updateSession(input.sessionId, input.token, {
    mode: input.requireChat ? "chat" : session.mode,
    extractedParams: turn.extracted,
    chatMessages,
    currentStep,
    contactDraft: {
      ...session.contactDraft,
      ...turn.contactDraft,
    },
  });
  if (!next) return { ok: false, error: "Session introuvable", status: 404 };

  return {
    ok: true,
    turn: {
      session: next,
      message: turn.assistantText,
      goSuggestions: turn.goSuggestions,
      goContact,
      toolTrace: turn.toolTrace,
    },
  };
}
