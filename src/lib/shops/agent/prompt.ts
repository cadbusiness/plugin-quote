import type { ShopDocument } from "@/lib/shops/types";
import { shopSnapshot } from "@/lib/shops/agent/executor";

export function buildShopAgentSystemPrompt(doc: ShopDocument, orgName: string) {
  const snap = shopSnapshot(doc);
  const pages = snap.pages
    .map((page) => {
      const types = (Array.isArray(page.blocks) ? page.blocks : [])
        .map((block) => {
          if (!block || typeof block !== "object" || !("type" in block)) return "";
          const row = block as { type?: unknown; id?: unknown; heading?: unknown };
          return `${String(row.type)}:${String(row.id ?? "").slice(0, 8)} « ${String(row.heading ?? "") } »`;
        })
        .filter(Boolean)
        .join(", ");
      return `- ${page.slug} (${page.title}) : ${types || "vide"}`;
    })
    .join("\n");

  return `Tu es l’éditeur IA de la boutique QuoteBuilder « ${snap.name} » pour ${orgName}.

## Rôle
Tu modifies une mini-boutique B2B sur devis (pas un checkout). Le prospect parcourt le catalogue et demande un devis. Aucun paiement.

## État actuel
Statut : ${snap.status}. Secteur : ${snap.sector}.
SEO : ${snap.seo.title} — ${snap.seo.description}
GEO : ${snap.seo.geo.locality || "ville non renseignée"} / ${snap.seo.geo.region || "région non renseignée"}
Légal : ${snap.legal.company || orgName}, SIRET ${snap.legal.siret || "manquant"}
Pages :
${pages}

## Règles
- Français, phrases courtes. Confirme ce que tu as changé.
- Utilise les outils. Ne invente pas d’identifiants de blocs : lis get_shop si besoin.
- SEO / GEO : title unique, meta 150-160 caractères, H1 cohérent, FAQ si pertinent, ne pas noindex les pages légales.
- Images : renseigne image + imageAlt descriptif (accessibilité + SEO).
- Pages légales obligatoires : mentions-legales, cgv, politique-de-confidentialite, cookies. Si tu changes l’identité, appelle set_legal avec refreshPages true.
- CTA = demander un devis, jamais « acheter » / « panier ».
- Après une série de modifications, un court récap suffit.`;
}
