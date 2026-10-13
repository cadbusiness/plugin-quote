import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";

function userMessage(text: string) {
  return {
    messages: [{ role: "user" as const, content: { type: "text" as const, text } }],
  };
}

function days(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= 366 ? n : fallback;
}

/** Ready-made prompts (slash commands in Claude, suggestions in other clients). */
export function registerQuoteBuilderPrompts(server: McpServer) {
  server.registerPrompt(
    "rapport_hebdo_ads",
    {
      title: "Rapport Google Ads de la semaine",
      description: "Synthèse dépense → devis → clients gagnés par campagne, attribution et santé des conversions.",
      argsSchema: z.object({
        jours: z.string().optional().describe("Période en jours (défaut 7)"),
      }),
    },
    ({ jours }) => {
      const period = days(jours, 7);
      return userMessage(
        [
          `Prépare le rapport Google Ads QuoteBuilder des ${period} derniers jours, en français, pour le marchand et son agence.`,
          `1. Appelle get_ads_performance (days=${period}) puis get_ads_performance sur les ${period} jours précédents (from/to) pour comparer.`,
          `2. Appelle get_attribution_breakdown (days=${period}, group_by=campaign) et get_conversion_uploads (days=${period}).`,
          "3. Rends : un tableau par campagne (dépense, clics, devis, gagnés, coût par devis, coût par client gagné, ROAS estimé, évolution), les 3 constats clés, les devis Google Ads non rattachés à une campagne, l’état des conversions envoyées à Google Ads (avec les pistes de correction) et 3 recommandations concrètes de budget / enchères.",
          "Précise que les montants de devis sont des estimations et ne lance aucune action d’écriture.",
        ].join("\n"),
      );
    },
  );

  server.registerPrompt(
    "leads_a_relancer",
    {
      title: "Demandes à relancer",
      description: "Liste priorisée des demandes ouvertes à relancer aujourd’hui, avec un message proposé pour chacune.",
      argsSchema: z.object({
        limite: z.string().optional().describe("Nombre de demandes (défaut 10)"),
      }),
    },
    ({ limite }) => {
      const max = days(limite, 10);
      return userMessage(
        [
          `Trouve les ${max} demandes QuoteBuilder à relancer en priorité aujourd’hui.`,
          "1. Appelle get_pending_followups, puis get_leads (score=hot, days=30) pour compléter.",
          "2. Pour les plus prioritaires, appelle get_lead_timeline pour voir le dernier échange.",
          "3. Rends un tableau : prospect, société, montant estimé, ancienneté, dernier contact, assigné, raison de la priorité, et un message de relance court (email ou appel) adapté au besoin.",
          "N’envoie aucune relance (trigger_followup) et ne change aucun statut sans ma confirmation explicite, demande par demande.",
        ].join("\n"),
      );
    },
  );

  server.registerPrompt(
    "preparer_devis",
    {
      title: "Préparer un devis",
      description: "À partir d’une demande (ou d’un besoin décrit), propose les produits du catalogue, quantités et prix.",
      argsSchema: z.object({
        lead_id: z.string().optional().describe("ID de la demande (optionnel)"),
        besoin: z.string().optional().describe("Besoin décrit librement si pas de lead_id"),
      }),
    },
    ({ lead_id, besoin }) => {
      const subject = lead_id
        ? `la demande ${lead_id} (appelle get_lead_detail pour lire les réponses du prospect)`
        : `ce besoin : « ${besoin?.trim() || "à préciser"} »`;
      return userMessage(
        [
          `Prépare une proposition de devis pour ${subject}.`,
          "1. Déduis les produits nécessaires (dimensions, charges, quantités, accessoires) et cherche-les avec search_catalog (plusieurs requêtes si besoin, in_stock_only si le délai compte).",
          "2. Rends un tableau : produit, SKU / variation, quantité, prix unitaire HT, total HT, stock ; puis total HT, hypothèses et questions à poser au prospect.",
          "3. Signale les produits introuvables ou hors stock et propose une alternative du catalogue.",
          lead_id
            ? "Si je valide, propose d’ajouter la synthèse en note interne avec add_lead_note (ne l’ajoute pas sans mon accord)."
            : "Ne crée aucune demande sans mon accord.",
        ].join("\n"),
      );
    },
  );
}
