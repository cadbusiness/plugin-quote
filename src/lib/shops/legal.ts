import type { ShopLegal } from "@/lib/shops/types";

function line(label: string, value: string) {
  const trimmed = value.trim();
  return trimmed ? `${label} : ${trimmed}` : null;
}

export function legalAddress(legal: ShopLegal) {
  return [legal.address, [legal.postalCode, legal.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

export function fillLegalPlaceholders(template: string, legal: ShopLegal, shopName: string) {
  return template
    .replaceAll("{{shop}}", shopName)
    .replaceAll("{{company}}", legal.company || shopName)
    .replaceAll("{{siret}}", legal.siret || "à compléter")
    .replaceAll("{{address}}", legalAddress(legal) || "à compléter")
    .replaceAll("{{email}}", legal.email || "à compléter")
    .replaceAll("{{phone}}", legal.phone || "à compléter")
    .replaceAll("{{director}}", legal.director || "le responsable de publication");
}

export function mentionsLegalesBody(legal: ShopLegal, shopName: string) {
  const identity = [
    line("Raison sociale", legal.company || shopName),
    line("SIRET", legal.siret),
    line("Siège", legalAddress(legal)),
    line("Email", legal.email),
    line("Téléphone", legal.phone),
    line("Directeur de la publication", legal.director),
  ]
    .filter(Boolean)
    .join("\n");

  return fillLegalPlaceholders(
    `Éditeur
${identity || "Complétez l’identité de l’éditeur dans l’onglet Légal."}

Hébergement
La boutique est publiée par QuoteBuilder (Vinci Liberta LTD, Dublin). Les contenus, le catalogue et les demandes de devis restent chez {{company}}.

Objet
Ce site présente un catalogue B2B et permet de demander un devis. Il n’est pas une boutique de paiement en ligne : aucun panier Stripe ni commande n’est conclu ici.

Propriété intellectuelle
Textes, photos et fiches produits appartiennent à {{company}} ou à leurs ayants droit. Toute reproduction non autorisée est interdite.

Contact
{{email}}`,
    legal,
    shopName,
  );
}

export function cgvBody(legal: ShopLegal, shopName: string) {
  return fillLegalPlaceholders(
    `Objet
Les présentes conditions encadrent les demandes de devis adressées à {{company}} via la boutique {{shop}}. Elles ne constituent pas des conditions de vente e-commerce : aucun paiement n’est collecté sur ce site.

Demande de devis
Le prospect compose une sélection à partir du catalogue, ou décrit son projet dans le funnel. La demande n’engage ni stock ni tarif ferme tant qu’un devis écrit n’est pas accepté.

Tarifs
Les prix affichés sont indicatifs (fourchettes catalogue). Le prix contractuel figure sur le devis remis par {{company}}.

Données
Les informations transmises (identité, besoin, fichiers) servent à établir et suivre le devis. Voir la politique de confidentialité.

Droit applicable
Droit français. En cas de litige, compétence des tribunaux du siège de {{company}}, sous réserve des règles impératives de protection du consommateur le cas échéant.`,
    legal,
    shopName,
  );
}

export function privacyBody(legal: ShopLegal, shopName: string) {
  return fillLegalPlaceholders(
    `Responsable
{{company}} est responsable des traitements liés aux demandes de devis collectées sur {{shop}}. Contact : {{email}}.

Données
Identité (nom, email, téléphone, société), contenu de la configuration, fichiers éventuellement joints, traces techniques (pages vues).

Finalités
Établir un devis, relancer un projet, suivre la relation commerciale, améliorer le catalogue. Base : mesures précontractuelles et intérêt légitime.

Durée
Les demandes sont conservées le temps de la relation commerciale, puis archivées selon les obligations comptables et fiscales.

Destinataires
L’équipe commerciale de {{company}}. Prestataires techniques (hébergement QuoteBuilder) en sous-traitance.

Droits
Accès, rectification, effacement, limitation, opposition, portabilité : {{email}}. Réclamation possible auprès de la CNIL.

Cookies
Mesure d’audience et, le cas échéant, suivi de campagnes. Détail sur la page Cookies.`,
    legal,
    shopName,
  );
}

export function cookiesBody(legal: ShopLegal, shopName: string) {
  return fillLegalPlaceholders(
    `Cookies nécessaires
Session de devis et sécurité. Ils ne peuvent pas être désactivés si vous utilisez le funnel.

Mesure d’audience
Si un suivi (GTM / gtag) est activé sur le funnel lié, des cookies statistiques peuvent être déposés. Ils servent à comprendre le trafic, pas à vendre de la publicité tierce depuis cette boutique.

Campagnes
Si vous arrivez via une campagne (UTM, gclid), l’attribution est conservée avec la demande de devis.

Contact
Questions : {{email}}.`,
    legal,
    shopName,
  );
}

export const LEGAL_SLUGS = {
  mentions: "mentions-legales",
  cgv: "cgv",
  privacy: "politique-de-confidentialite",
  cookies: "cookies",
} as const;

export function legalBodyForSlug(slug: string, legal: ShopLegal, shopName: string) {
  if (slug === LEGAL_SLUGS.mentions) return mentionsLegalesBody(legal, shopName);
  if (slug === LEGAL_SLUGS.cgv) return cgvBody(legal, shopName);
  if (slug === LEGAL_SLUGS.privacy) return privacyBody(legal, shopName);
  if (slug === LEGAL_SLUGS.cookies) return cookiesBody(legal, shopName);
  return "";
}
