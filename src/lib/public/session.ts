import { randomBytes } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import type { Tables } from "@/lib/db/database.types";
import type {
  Answers,
  ChatMessage,
  Customization,
  QuoteSession,
  SessionMode,
} from "@/lib/wizard/types";
import type { Json } from "@/lib/db/database.types";

export function mapSession(row: Tables<"quote_sessions">): QuoteSession {
  const customization = (row.customization ?? {}) as Partial<Customization>;
  return {
    id: row.id,
    token: row.token,
    mode: row.mode as SessionMode,
    currentStep: row.current_step,
    answers: (row.answers ?? {}) as Answers,
    extractedParams: (row.extracted_params ?? {}) as Answers,
    chatMessages: (row.chat_messages ?? []) as ChatMessage[],
    selectedSuggestionId: row.selected_suggestion_id,
    customization: {
      quantities: customization.quantities ?? {},
      options: customization.options ?? {},
      notes: customization.notes,
    },
    submittedQuoteId: row.submitted_quote_id,
  };
}

export async function createSession(orgSlug: string, configuratorSlug: string) {
  const supabase = createServiceClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .maybeSingle();
  if (!org) return null;
  const { data: cfg } = await supabase
    .from("configurators")
    .select("id")
    .eq("organization_id", org.id)
    .eq("slug", configuratorSlug)
    .eq("is_active", true)
    .maybeSingle();
  if (!cfg) return null;

  const token = randomBytes(24).toString("hex");
  const { data, error } = await supabase
    .from("quote_sessions")
    .insert({
      organization_id: org.id,
      configurator_id: cfg.id,
      token,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return mapSession(data);
}

export async function getSession(id: string, token: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("quote_sessions")
    .select("*")
    .eq("id", id)
    .eq("token", token)
    .maybeSingle();
  return data ? mapSession(data) : null;
}

export async function updateSession(
  id: string,
  token: string,
  patch: {
    mode?: SessionMode;
    currentStep?: number;
    answers?: Answers;
    extractedParams?: Answers;
    chatMessages?: ChatMessage[];
    selectedSuggestionId?: string | null;
    customization?: Customization;
  },
) {
  const supabase = createServiceClient();
  const update: DatabaseUpdate = {};
  if (patch.mode) update.mode = patch.mode;
  if (patch.currentStep != null) update.current_step = patch.currentStep;
  if (patch.answers) update.answers = patch.answers;
  if (patch.extractedParams) update.extracted_params = patch.extractedParams;
  if (patch.chatMessages) update.chat_messages = patch.chatMessages as unknown as Json;
  if (patch.selectedSuggestionId !== undefined) {
    update.selected_suggestion_id = patch.selectedSuggestionId;
  }
  if (patch.customization) update.customization = patch.customization as unknown as Json;

  const { data, error } = await supabase
    .from("quote_sessions")
    .update(update)
    .eq("id", id)
    .eq("token", token)
    .select("*")
    .single();
  if (error || !data) return null;
  return mapSession(data);
}

type DatabaseUpdate = {
  mode?: string;
  current_step?: number;
  answers?: Json;
  extracted_params?: Json;
  chat_messages?: Json;
  selected_suggestion_id?: string | null;
  customization?: Json;
};
