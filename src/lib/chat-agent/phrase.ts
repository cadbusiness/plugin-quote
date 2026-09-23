import Anthropic from "@anthropic-ai/sdk";
import { COMMERCE_AGENT_CONFIG } from "@/lib/commerce-agent/config";
import { fenceCatalogPayload } from "@/lib/commerce-agent/fencing";
import type { ChatDecision } from "@/lib/chat-agent/policy";

const PHRASE_SYSTEM = `Tu es l'assistant IA d'un commerçant B2B. Tu n'es pas un humain.
Reformule uniquement les faits du passage fencé. Français, 2 à 4 phrases.
Commence par « Je suis l'assistant IA du commerçant. »
N'ajoute aucun prix, délai ou jugement de faisabilité absent des passages.
Si une fourchette est donnée, dis que ce n'est pas un prix ferme.`;

/** Optional phrasing. Missing key or a bad reply falls back to the grounded text. */
export async function phraseGroundedAnswer(input: { message: string; decision: ChatDecision }): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;
  const passages = input.decision.citations.map((source) => ({
    product: source.productName,
    kind: source.kind,
    label: source.label,
    text: source.text,
    priceMin: source.priceMin,
    priceMax: source.priceMax,
  }));
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: COMMERCE_AGENT_CONFIG.model,
      max_tokens: 500,
      system: PHRASE_SYSTEM,
      messages: [
        {
          role: "user",
          content: `${fenceCatalogPayload({ passages })}\n\nQuestion:\n${input.message}`,
        },
      ],
    });
    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();
  } catch (error) {
    console.error("chat agent phrase failed", error);
    return null;
  }
}
