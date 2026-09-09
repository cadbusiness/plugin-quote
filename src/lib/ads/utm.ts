export function adsLandingUrl(publicUrl: string, campaign: string, content?: string) {
  const url = new URL(publicUrl);
  url.searchParams.set("utm_source", "google");
  url.searchParams.set("utm_medium", "cpc");
  url.searchParams.set("utm_campaign", campaign);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}

export const CAMPAIGN_GUIDE = [
  {
    id: "compte",
    title: "Compte Google Ads",
    text: "Créez un compte Google Ads (ou utilisez celui de l’entreprise). Pas besoin d’agence. Un budget quotidien de 10–30 € suffit pour tester.",
  },
  {
    id: "campagne",
    title: "Campagne Search",
    text: "Nouvelle campagne → Objectif « Leads » ou « Ventes » → type Search. Nommez-la comme le modèle ci-dessous : QuoteBuilder s’en sert pour matcher le trafic.",
  },
  {
    id: "mots",
    title: "Mots-clés du secteur",
    text: "Collez la liste pré-configurée (large, expression, exact + négatifs). Restez sur la recherche. Évitez le Display pour le premier test.",
  },
  {
    id: "url",
    title: "URL du funnel",
    text: "La page de destination est le funnel QuoteBuilder, pas la home du site. Copiez l’URL UTM : chaque clic arrive déjà attribué.",
  },
  {
    id: "conversion",
    title: "Conversion devis",
    text: "Connectez Google Ads ici. QuoteBuilder envoie la conversion à chaque devis soumis, puis une seconde quand le dossier passe Gagné.",
  },
  {
    id: "lire",
    title: "Lire le ROI ici",
    text: "Dans Stats et Ads, vous voyez campagne → devis → gagnés, coût par devis et coût par client. C’est la boucle, pas le gestionnaire d’enchères.",
  },
] as const;
