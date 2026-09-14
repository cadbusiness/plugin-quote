import Anthropic from "@anthropic-ai/sdk";
import { COMMERCE_AGENT_CONFIG } from "@/lib/commerce-agent/config";
import { executeShopTool } from "@/lib/shops/agent/executor";
import { shopAgentClosingText, shopToolLabel, shopToolTouched, type ShopAgentStreamEvent } from "@/lib/shops/agent/events";
import { buildShopAgentSystemPrompt } from "@/lib/shops/agent/prompt";
import type { ShopAgentSelection } from "@/lib/shops/agent/selection";
import { SHOP_AGENT_TOOLS } from "@/lib/shops/agent/tools";
import { plainShopChatText, type ShopChatMessage } from "@/lib/shops/chat-store";
import { serializeEditorDraft } from "@/lib/shops/draft";
import type { ShopDocument } from "@/lib/shops/types";

export type { ShopChatMessage };

export type ShopAgentTurnResult = {
  assistantText: string;
  toolTrace: { name: string; status: string }[];
  nodeId?: string;
  pageSlug?: string;
};

export async function runShopAgentTurn(input: {
  doc: ShopDocument;
  orgName: string;
  history: ShopChatMessage[];
  userMessage: string;
  selection?: ShopAgentSelection | null;
  seed?: boolean;
  imageUrl?: string;
  signal?: AbortSignal;
  onEvent?: (event: ShopAgentStreamEvent) => void | Promise<void>;
}): Promise<ShopAgentTurnResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquante");
  }

  const client = new Anthropic({ apiKey });
  const isSeedTurn = Boolean(input.seed);
  const system = buildShopAgentSystemPrompt(input.doc, input.orgName, {
    isSeedTurn,
    selection: input.selection,
  });
  const userMessage = input.imageUrl
    ? `${input.userMessage}\n\nImage de référence (utilise-la comme visuel du bloc visé si ça colle) : ${input.imageUrl}`
    : input.userMessage;
  const messages: Anthropic.MessageParam[] = [
    ...input.history.map((message) => ({ role: message.role, content: message.content })),
    { role: "user", content: userMessage },
  ];

  const toolTrace: ShopAgentTurnResult["toolTrace"] = [];
  let assistantText = "";
  let lastNodeId: string | undefined;
  let lastPageSlug: string | undefined;
  const maxRounds = isSeedTurn ? COMMERCE_AGENT_CONFIG.maxToolIterations + 2 : COMMERCE_AGENT_CONFIG.maxToolIterations;
  const maxTokens = isSeedTurn ? 2400 : 1800;

  for (let round = 0; round < maxRounds; round++) {
    if (input.signal?.aborted) {
      throw new DOMException("Arrêté.", "AbortError");
    }
    const forceText = round === maxRounds - 1;
    const response = await client.messages.create(
      {
        model: COMMERCE_AGENT_CONFIG.model,
        max_tokens: maxTokens,
        system,
        tools: SHOP_AGENT_TOOLS,
        tool_choice: forceText ? { type: "none" } : { type: "auto" },
        messages,
      },
      { signal: input.signal },
    );

    const toolUses = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    const texts = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text);
    if (texts.length) {
      assistantText = plainShopChatText(texts.join("\n"));
      await input.onEvent?.({ type: "text", text: assistantText });
    }

    if (toolUses.length === 0 || response.stop_reason === "end_turn") break;

    messages.push({ role: "assistant", content: response.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      if (input.signal?.aborted) {
        throw new DOMException("Arrêté.", "AbortError");
      }
      const args = (use.input ?? {}) as Record<string, unknown>;
      await input.onEvent?.({
        type: "tool",
        step: { name: use.name, label: shopToolLabel(use.name), status: "run" },
      });
      const result = executeShopTool(input.doc, use.name, args);
      const touched = shopToolTouched(use.name, args, result.ok ? result.summary : "");
      toolTrace.push({ name: use.name, status: result.ok ? "ok" : "error" });
      if (touched.nodeId) lastNodeId = touched.nodeId;
      if (touched.pageSlug) lastPageSlug = touched.pageSlug;
      await input.onEvent?.({
        type: "tool",
        step: {
          name: use.name,
          label: shopToolLabel(use.name),
          status: result.ok ? "ok" : "error",
          summary: result.ok ? result.summary : result.error,
        },
        nodeId: touched.nodeId,
        pageSlug: touched.pageSlug,
      });
      if (result.ok && touched.mutated) {
        await input.onEvent?.({ type: "draft", draft: serializeEditorDraft(input.doc) });
      }
      toolResults.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: result.ok ? result.summary : result.error,
        is_error: !result.ok,
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return {
    assistantText: shopAgentClosingText(plainShopChatText(assistantText), toolTrace),
    toolTrace,
    nodeId: lastNodeId,
    pageSlug: lastPageSlug,
  };
}
