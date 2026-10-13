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

  server.registerPrompt(
    "configurer_mon_funnel",
    {
      title: "Configurer mon funnel",
      description:
        "Construit un funnel (formulaire, chat IA ou catalogue) à partir du site et du catalogue : plan validé avec vous, brouillon, codes d’intégration, publication sur confirmation.",
      argsSchema: z.object({
        site: z.string().optional().describe("URL du site du marchand"),
        mode: z.string().optional().describe("form, chat ou catalog (défaut : à proposer)"),
        funnel_id: z.string().optional().describe("Funnel existant à retravailler (optionnel)"),
      }),
    },
    ({ site, mode, funnel_id }) => {
      const wanted = mode && ["form", "chat", "catalog"].includes(mode.trim()) ? mode.trim() : null;
      return userMessage(
        [
          funnel_id
            ? `Aide-moi à retravailler le funnel QuoteBuilder ${funnel_id} (commence par get_funnel).`
            : `Configure-moi un funnel QuoteBuilder${wanted ? ` en mode ${wanted}` : ""} pour mon site à partir de mon catalogue.`,
          `1. Site : ${site?.trim() ? `lis ${site.trim()} si tu peux naviguer` : "demande-moi l’URL de mon site et lis-la si tu peux naviguer"} (offre, clients cibles, ton, gammes).`,
          "2. Appelle list_funnel_templates et list_funnels, puis search_catalog (plusieurs requêtes : gammes principales, SKU, catégories) pour comprendre les produits et repérer le funnel qui porte le catalogue.",
          "3. Propose un plan en français : mode (form / chat / catalog) et modèle, étapes et questions (types, options), règles « si réponse → produits » avec les produits réels trouvés, et pour un funnel chat les consignes de ton et le message d’accueil. Puis ARRÊTE-TOI et attends ma validation explicite.",
          "4. Après validation seulement : create_funnel (toujours non publié, avec from_catalog pour un funnel chat ou catalogue), update_funnel_steps, set_suggestion_rules, set_chat_agent si chat, set_funnel_tracking si je te donne mes IDs GA4 / GTM / Pixel. Si un outil refuse (produit introuvable, clé inconnue…), montre l’erreur et propose une correction, ne devine pas.",
          "5. Montre le résultat (get_funnel : étapes, règles, publish_check) puis get_embed_code : code recommandé pour mon site, shortcode WordPress et lien de test, en précisant qu’ils ne répondent qu’après publication.",
          "6. Ne publie (publish_funnel avec confirm=true) qu’après mon accord explicite dans cette conversation. Si le funnel est déjà publié, n’utilise confirm_published=true qu’après m’avoir montré le changement et obtenu mon accord.",
        ].join("\n"),
      );
    },
  );
}
