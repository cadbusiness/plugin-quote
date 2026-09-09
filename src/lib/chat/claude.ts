/**
 * @deprecated Prefer `@/lib/commerce-agent`. Kept as a thin adapter for the public chat route.
 */
import type { Tables } from "@/lib/db/database.types";
import type {
  Answers,
  ChatMessage,
  ConfiguratorDefinition,
  ContactDraft,
} from "@/lib/wizard/types";
import { runQuoteAgentTurn } from "@/lib/commerce-agent";

export async function runChatTurn(input: {
  definition: ConfiguratorDefinition;
  rules?: Tables<"suggestion_rules">[];
  history: ChatMessage[];
  userMessage: string;
  currentAnswers: Answers;
  contactDraft?: ContactDraft;
}) {
  const turn = await runQuoteAgentTurn({
    definition: input.definition,
    rules: input.rules ?? [],
    history: input.history,
    userMessage: input.userMessage,
    currentAnswers: input.currentAnswers,
    contactDraft: input.contactDraft,
  });

  return {
    assistantText: turn.assistantText,
    extracted: turn.extracted,
    contactDraft: turn.contactDraft,
    goSuggestions: turn.goSuggestions,
    goContact: turn.goContact,
    toolTrace: turn.toolTrace,
  };
}
