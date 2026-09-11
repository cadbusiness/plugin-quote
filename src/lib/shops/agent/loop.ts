import Anthropic from "@anthropic-ai/sdk";
import { COMMERCE_AGENT_CONFIG } from "@/lib/commerce-agent/config";
import { executeShopTool } from "@/lib/shops/agent/executor";
import { buildShopAgentSystemPrompt } from "@/lib/shops/agent/prompt";
import { SHOP_AGENT_TOOLS } from "@/lib/shops/agent/tools";
import type { ShopDocument } from "@/lib/shops/types";

export type ShopChatMessage = { role: "user" | "assistant"; content: string };

export type ShopAgentTurnResult = {
  assistantText: string;
  toolTrace: { name: string; status: string }[];
};

export async function runShopAgentTurn(input: {
  doc: ShopDocument;
  orgName: string;
  history: ShopChatMessage[];
  userMessage: string;
}): Promise<ShopAgentTurnResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquante");
  }

  const client = new Anthropic({ apiKey });
  const isSeedTurn = input.history.length === 0;
  const system = buildShopAgentSystemPrompt(input.doc, input.orgName, { isSeedTurn });
  const messages: Anthropic.MessageParam[] = [
    ...input.history.map((message) => ({ role: message.role, content: message.content })),
    { role: "user", content: input.userMessage },
  ];

  const toolTrace: ShopAgentTurnResult["toolTrace"] = [];
  let assistantText = "";
  const maxRounds = isSeedTurn ? COMMERCE_AGENT_CONFIG.maxToolIterations + 2 : COMMERCE_AGENT_CONFIG.maxToolIterations;
  const maxTokens = isSeedTurn ? 2400 : 1800;

  for (let round = 0; round < maxRounds; round++) {
    const forceText = round === maxRounds - 1;
    const response = await client.messages.create({
      model: COMMERCE_AGENT_CONFIG.model,
      max_tokens: maxTokens,
      system,
      tools: SHOP_AGENT_TOOLS,
      tool_choice: forceText ? { type: "none" } : { type: "auto" },
      messages,
    });

    const toolUses = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    const texts = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text);
    if (texts.length) assistantText = texts.join("\n").trim();

    if (toolUses.length === 0 || response.stop_reason === "end_turn") break;

    messages.push({ role: "assistant", content: response.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      const args = (use.input ?? {}) as Record<string, unknown>;
      const result = executeShopTool(input.doc, use.name, args);
      toolTrace.push({ name: use.name, status: result.ok ? "ok" : "error" });
      toolResults.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: result.ok ? result.summary : result.error,
        is_error: !result.ok,
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return { assistantText: assistantText || "C’est mis à jour.", toolTrace };
}
