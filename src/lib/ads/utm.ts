export function adsLandingUrl(publicUrl: string, campaign: string, content?: string) {
  const url = new URL(publicUrl);
  url.searchParams.set("utm_source", "google");
  url.searchParams.set("utm_medium", "cpc");
  url.searchParams.set("utm_campaign", campaign);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}

/** Trois gestes, pas un guide Ads. La pub se crée dans Google. */
export const CAMPAIGN_STEPS = [
  {
    id: "ou",
    title: "Où le visiteur arrive",
    text: "La page qui ouvre le devis : configurateur, boutique, ou site WordPress.",
  },
  {
    id: "lien",
    title: "Copiez le lien dans l’annonce",
    text: "Collez-le sans le modifier : le suivi est déjà dedans.",
  },
  {
    id: "nom",
    title: "Nommez la campagne comme indiqué",
    text: "QuoteBuilder rattache les clics à ce nom. Les mots-clés du métier sont optionnels.",
  },
] as const;
