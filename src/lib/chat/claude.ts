import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, ConfiguratorDefinition } from "@/lib/wizard/types";
import type { Answers } from "@/lib/wizard/types";

const TOOLS: Anthropic.Tool[] = [
  {
    name: "update_session_params",
    description:
      "Enregistre les paramètres extraits du besoin prospect. Utilise les clés du wizard.",
    input_schema: {
      type: "object",
      properties: {
        params: {
          type: "object",
          additionalProperties: true,
          description: "Clés alignées sur le wizard (project_type, surface, height, constraints, load, access, …)",
        },
      },
      required: ["params"],
    },
  },
  {
    name: "propose_suggestions",
    description: "Indique que le brief est assez complet pour proposer des configurations.",
    input_schema: {
      type: "object",
      properties: {
        ready: { type: "boolean" },
      },
      required: ["ready"],
    },
  },
  {
    name: "request_contact",
    description: "Passe à l'étape coordonnées lorsque le prospect veut soumettre.",
    input_schema: {
      type: "object",
      properties: {
        ready: { type: "boolean" },
      },
      required: ["ready"],
    },
  },
];

export async function runChatTurn(input: {
  definition: ConfiguratorDefinition;
  history: ChatMessage[];
  userMessage: string;
  currentAnswers: Answers;
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquante");
  }

  const questions = input.definition.steps.flatMap((s) =>
    s.questions.map((q) => `${q.key} (${q.type}): ${q.label}`),
  );

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    tools: TOOLS,
    system: `Tu es l'assistant de qualification QuoteBuilder pour ${input.definition.organization.name} (${input.definition.configurator.name}).
Pose des questions courtes en français pour remplir le brief.
Clés à extraire : ${questions.join(" ; ")}.
Valeurs project_type possibles : entrepot, commerce, cuisine_pro, garage.
Dès que tu as type de projet + surface + charge, appelle update_session_params puis propose_suggestions.
N'invente pas de prix hors fourchettes produits. Ne demande pas de carte bancaire.`,
    messages: [
      ...input.history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: "user" as const,
        content: `${input.userMessage}\n\nParamètres déjà connus: ${JSON.stringify(input.currentAnswers)}`,
      },
    ],
  });

  let assistantText = "";
  let extracted: Answers = { ...input.currentAnswers };
  let goSuggestions = false;
  let goContact = false;

  for (const block of response.content) {
    if (block.type === "text") assistantText += block.text;
    if (block.type === "tool_use") {
      if (block.name === "update_session_params") {
        const params = (block.input as { params?: Answers }).params ?? {};
        extracted = { ...extracted, ...params };
      }
      if (block.name === "propose_suggestions") goSuggestions = true;
      if (block.name === "request_contact") goContact = true;
    }
  }

  if (!assistantText) {
    assistantText = goSuggestions
      ? "J’ai assez d’éléments pour vous proposer des configurations."
      : "Pouvez-vous préciser un peu plus votre projet ?";
  }

  return {
    assistantText,
    extracted,
    goSuggestions,
    goContact,
  };
}
