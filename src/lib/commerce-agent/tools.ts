import type Anthropic from "@anthropic-ai/sdk";

/** Tool contracts for the QuoteBuilder B2B devis shopping agent. */
export const QUOTE_AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "update_brief",
    description:
      "Enregistre les paramètres métier extraits du besoin (clés wizard). Appeler dès qu'une info utile apparaît.",
    input_schema: {
      type: "object",
      properties: {
        params: {
          type: "object",
          additionalProperties: true,
          description:
            "Clés alignées sur le wizard (project_type, surface, height, load, constraints, budget, deadline, …)",
        },
      },
      required: ["params"],
    },
  },
  {
    name: "search_catalog",
    description:
      "Recherche dans le catalogue commerçant (déjà classé). Utiliser avant de citer un produit ou un prix.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Mots-clés libres (ex. rayonnage lourd 6m)" },
        category: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "match_configurations",
    description:
      "Évalue les règles Si/Alors du funnel sur le brief courant et renvoie des packs de suggestion (prix fourchettes catalogue).",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number" },
      },
    },
  },
  {
    name: "collect_contact",
    description:
      "Enregistre prénom / email / téléphone / société pour envoyer la configuration. Email obligatoire pour handoff_quote.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        company: { type: "string" },
      },
    },
  },
  {
    name: "present_configurations",
    description:
      "Affiche côté UI les configurations catalogue déjà matchées. Exige un search_catalog ou match_configurations préalable.",
    input_schema: {
      type: "object",
      properties: {
        ready: { type: "boolean" },
      },
      required: ["ready"],
    },
  },
  {
    name: "handoff_quote",
    description:
      "Passe à l'étape coordonnées / soumission du devis. N'envoie pas le devis ni ne prend de paiement. Exige un email collecté.",
    input_schema: {
      type: "object",
      properties: {
        ready: { type: "boolean" },
      },
      required: ["ready"],
    },
  },
];
