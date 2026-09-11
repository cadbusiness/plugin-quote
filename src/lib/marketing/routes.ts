export type MarketingRoute = {
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

/** Public marketing URLs that return 200 and should be indexed. */
export const MARKETING_ROUTES: MarketingRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/fonctionnalites", changeFrequency: "weekly", priority: 0.9 },
  { path: "/fonctionnalites/funnel", changeFrequency: "monthly", priority: 0.8 },
  { path: "/fonctionnalites/catalogue", changeFrequency: "monthly", priority: 0.8 },
  { path: "/fonctionnalites/ads", changeFrequency: "monthly", priority: 0.7 },
  { path: "/fonctionnalites/demandes", changeFrequency: "monthly", priority: 0.8 },
  { path: "/fonctionnalites/autopilote", changeFrequency: "monthly", priority: 0.8 },
  { path: "/fonctionnalites/espace-prospect", changeFrequency: "monthly", priority: 0.7 },
  { path: "/fonctionnalites/stats", changeFrequency: "monthly", priority: 0.7 },
  { path: "/fonctionnalites/equipe", changeFrequency: "monthly", priority: 0.6 },
  { path: "/fonctionnalites/integrations", changeFrequency: "monthly", priority: 0.8 },
  { path: "/comment-ca-marche", changeFrequency: "monthly", priority: 0.8 },
  { path: "/secteurs", changeFrequency: "monthly", priority: 0.8 },
  { path: "/secteurs/funnel-devis-rayonnage-stockage", changeFrequency: "monthly", priority: 0.8 },
  { path: "/secteurs/funnel-devis-menuiserie-sur-mesure", changeFrequency: "monthly", priority: 0.8 },
  { path: "/secteurs/funnel-devis-location-evenementiel", changeFrequency: "monthly", priority: 0.8 },
  { path: "/tarifs", changeFrequency: "weekly", priority: 0.9 },
  { path: "/a-propos", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog/visite-guidee-parcours-devis-b2b", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/relancer-devis-hot-depuis-dossier", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/delai-reponse-demande-devis-b2b", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/template-boutique-en-ligne-menuiserie-devis", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/score-demande-devis-b2b", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/configurateur-devis-vs-excel-pdf", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/pourquoi-les-devis-meurent-sans-relance", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/formulaire-contact-vs-funnel-devis-b2b", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog/installer-widget-devis-wordpress-javascript", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog/sync-catalogue-woocommerce-shopify-parcours-devis", changeFrequency: "monthly", priority: 0.7 },
  { path: "/outils", changeFrequency: "monthly", priority: 0.6 },
  { path: "/outils/cout-devis-non-relance", changeFrequency: "monthly", priority: 0.7 },
  { path: "/outils/generateur-sequence-relances", changeFrequency: "monthly", priority: 0.7 },
  { path: "/outils/score-brief-devis", changeFrequency: "monthly", priority: 0.7 },
  { path: "/legal/cgu", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/confidentialite", changeFrequency: "yearly", priority: 0.3 },
];
