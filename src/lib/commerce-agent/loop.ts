import Anthropic from "@anthropic-ai/sdk";
import type { Tables } from "@/lib/db/database.types";
import type {
  Answers,
  ChatMessage,
  ConfiguratorDefinition,
  ContactDraft,
} from "@/lib/wizard/types";
import { COMMERCE_AGENT_CONFIG } from "./config";
import { executeQuoteTool } from "./executor";
import { emptyProvenance } from "./types";
import type { AgentSessionState } from "./types";
import { buildQuoteAgentSystemPrompt } from "./prompt";
import { QUOTE_AGENT_TOOLS } from "./tools";

export type QuoteAgentTurnResult = {
  assistantText: string;
  extracted: Answers;
  contactDraft: ContactDraft;
  goSuggestions: boolean;
  goContact: boolean;
  toolTrace: { name: string; status: string; gate?: string }[];
};

function toAnthropicHistory(
  history: ChatMessage[],
): Anthropic.MessageParam[] {
  return history.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

/**
 * Messages API agent loop (commerce-agents pattern):
 * reason → tool calls → observe results → until text or max iterations.
 */
export async function runQuoteAgentTurn(input: {
  definition: ConfiguratorDefinition;
  rules: Tables<"suggestion_rules">[];
  history: ChatMessage[];
  userMessage: string;
  currentAnswers: Answers;
  contactDraft?: ContactDraft;
}): Promise<QuoteAgentTurnResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquante");
  }

  const client = new Anthropic({ apiKey });
  const system = buildQuoteAgentSystemPrompt(input.definition);

  let state: AgentSessionState = {
    answers: { ...input.currentAnswers },
    contactDraft: { ...(input.contactDraft ?? {}) },
    provenance: emptyProvenance(),
    goSuggestions: false,
    goContact: false,
    lastSuggestions: [],
  };

  const messages: Anthropic.MessageParam[] = [
    ...toAnthropicHistory(input.history),
    {
      role: "user",
      content: `${input.userMessage}\n\nBrief déjà connu: ${JSON.stringify(state.answers)}\nContact: ${JSON.stringify(state.contactDraft)}`,
    },
  ];

  const toolTrace: QuoteAgentTurnResult["toolTrace"] = [];
  let assistantText = "";

  for (let round = 0; round < COMMERCE_AGENT_CONFIG.maxToolIterations; round++) {
    const forceText = round === COMMERCE_AGENT_CONFIG.maxToolIterations - 1;
    const response = await client.messages.create({
      model: COMMERCE_AGENT_CONFIG.model,
      max_tokens: COMMERCE_AGENT_CONFIG.maxTokens,
      system,
      tools: QUOTE_AGENT_TOOLS,
      tool_choice: forceText ? { type: "none" } : { type: "auto" },
      messages,
    });

    const toolUses = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    const texts = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((b) => b.text);
    if (texts.length) assistantText = texts.join("\n").trim();

    if (toolUses.length === 0 || response.stop_reason === "end_turn") {
      break;
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      const args =
        use.input && typeof use.input === "object"
          ? (use.input as Record<string, unknown>)
          : {};
      const { outcome, state: next } = executeQuoteTool({
        name: use.name,
        args,
        state,
        products: input.definition.products,
        rules: input.rules,
      });
      state = next;
      toolTrace.push({
        name: use.name,
        status: outcome.status,
        gate: outcome.gate,
      });
      toolResults.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: JSON.stringify({
          status: outcome.status,
          gate: outcome.gate ?? null,
          ...outcome.result,
        }),
        is_error: outcome.status === "error",
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  if (!assistantText) {
    assistantText = state.goSuggestions
      ? "J’ai assez d’éléments pour vous proposer des configurations adaptées à votre projet."
      : state.goContact
        ? "Parfait — je vous oriente vers la finalisation de votre demande de devis."
        : "Pouvez-vous préciser un peu plus votre projet ?";
  }

  return {
    assistantText,
    extracted: state.answers,
    contactDraft: state.contactDraft,
    goSuggestions: state.goSuggestions,
    goContact: state.goContact,
    toolTrace,
  };
}
