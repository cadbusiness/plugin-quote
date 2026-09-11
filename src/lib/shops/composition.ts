import { getFunnelFamily, type FunnelFamilyId } from "@/lib/funnels/families";
import { emptyNode } from "@/lib/shops/layout";
import { shopPlaceholders } from "@/lib/shops/placeholders";
import {
  DEFAULT_HOME_RHYTHM,
  homeRhythmFor,
  homeTypeSequence,
  resolveShopSectorTemplate,
  type HomeBlockId,
} from "@/lib/shops/sector-templates";
import type { ShopFaqItem, ShopFeatureItem, ShopLayout, ShopNode } from "@/lib/shops/types";

const WASH = "#F6F1EA";

export type ShopStat = { title: string; text: string };
export type ShopStep = { title: string; text: string };

export type ShopCopy = {
  heroHeading: string;
  heroSub: string;
  heroCta: string;
  heroImageAlt: string;
  featuresHeading: string;
  features: ShopFeatureItem[];
  proofHeading: string;
  proof: ShopStat[];
  aboutHeading: string;
  aboutText: string;
  aboutImageAlt: string;
  imageFirst: boolean;
  categoriesHeading: string;
  catalogHeading: string;
  processHeading: string;
  process: ShopStep[];
  faqHeading: string;
  faq: ShopFaqItem[];
  quoteHeading: string;
  quoteText: string;
  quoteCta: string;
  catalogHeroHeading: string;
  catalogHeroSub: string;
  catalogPageTitle?: string;
  seoDescription: string;
};

const CHECKOUT_CTA = /\b(acheter|panier|checkout|payer en ligne|ajouter au panier|commander en ligne)\b/i;

export function hasCheckoutCtaLanguage(text: string) {
  return CHECKOUT_CTA.test(text);
}

function loc(city: string, prefix = " à ") {
  const trimmed = city.trim();
  return trimmed ? `${prefix}${trimmed}` : "";
}

function packs(name: string, city: string): Record<FunnelFamilyId, ShopCopy> {
  const here = loc(city);
  return {
    racking: {
      heroHeading: `${name} — rayonnage industriel et stock B2B`,
      heroSub: `Travées, charge utile et allées cadrées avant le calepinage${here}. Catalogue réel, devis écrit — pas de caisse.`,
      heroCta: "Demander un devis stock",
      heroImageAlt: "Entrepôt B2B, travées de rayonnage lourd",
      featuresHeading: "Ce que nous dimensionnons",
      features: [
        { title: "Charge et hauteur", text: "Niveaux, charge utile et hauteur sous poutre pour un brief chiffrable." },
        { title: "Allées et picking", text: "Circulation, réserve ou picking fréquent : la gamme suit l’usage." },
        { title: "Étude avant pose", text: "Devis écrit, puis calepinage et pose. Rien n’est encaissé ici." },
      ],
      proofHeading: "Repères techniques",
      proof: [
        { title: "Charge", text: "Jusqu’à 800 kg et plus par niveau, selon la gamme." },
        { title: "Étude", text: "Brief relu sous 48 h ouvrées une fois surface et charge posées." },
        { title: "Terrain", text: "Entrepôt, réserve, atelier ou archives." },
      ],
      aboutHeading: "Un brief d’entrepôt, pas un extrait catalogue",
      aboutText: `${name} part de la surface, de la hauteur utile et de la charge. Le catalogue compose le devis ; il n’encaisse rien.`,
      aboutImageAlt: "Allée de stockage palettier",
      imageFirst: false,
      categoriesHeading: "Gammes",
      catalogHeading: "Travées et accessoires",
      processHeading: "Du brief technique au devis",
      process: [
        { title: "1. Brief", text: "Espace, surface, charge, contraintes d’accès." },
        { title: "2. Calepinage", text: "Travées et options depuis le catalogue." },
        { title: "3. Devis", text: "Chiffrage écrit, puis planning de pose." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette vitrine prépare un devis stock. Vous composez le besoin, nous chiffrons.",
        },
        {
          q: "Quels projets de stockage acceptez-vous ?",
          a: "Entrepôt, réserve commerce, atelier, archives. Le funnel pose usage, surface et charge.",
        },
        {
          q: "Les prix affichés sont-ils fermes ?",
          a: "Fourchettes catalogue. Le tarif contractuel figure sur le devis écrit.",
        },
        {
          q: "Intervenez-vous sur site ?",
          a: "Oui, une fois le devis accepté : calepinage, livraison et pose selon le brief.",
        },
      ],
      quoteHeading: "Chiffrer un projet de stock",
      quoteText: "Surface, charge, allées : nous calepinons et envoyons un devis.",
      quoteCta: "Ouvrir le devis stock",
      catalogHeroHeading: "Catalogue rayonnage B2B",
      catalogHeroSub: "Gammes, travées et accessoires — à ajouter à la demande de devis.",
      catalogPageTitle: "Gammes",
      seoDescription: `${name} — rayonnage industriel et stock B2B${here}. Catalogue, gammes et demande de devis. Pas de paiement en ligne.`,
    },
    habitat: {
      heroHeading: `${name} — menuiserie et ouvrages sur devis`,
      heroSub: `Essence, cotes et pose cadrées avant le devis d’atelier${here}. Fabrication sur mesure — pas de paiement en ligne.`,
      heroCta: "Demander un devis d’ouvrage",
      heroImageAlt: "Atelier de menuiserie, établis et essences",
      featuresHeading: "Ce que l’atelier cadré",
      features: [
        { title: "Essence et finition", text: "Chêne, noyer, frêne ou laqué : le brief pose la matière avant le chiffrage." },
        { title: "Cotes et contraintes", text: "Linéaire, accès, pièce mansardée — on chiffre sur le réel, pas une grille figée." },
        { title: "Fabrication puis pose", text: "Le devis écrit précède l’atelier. Rien n’est encaissé ici." },
      ],
      proofHeading: "Repères d’atelier",
      proof: [
        { title: "Essences", text: "Chêne, noyer, frêne, laqué — selon le catalogue." },
        { title: "Étude", text: "Retour sous 72 h une fois l’ouvrage et les cotes posés." },
        { title: "Ouvrages", text: "Meuble, ouverture, escalier, agencement." },
      ],
      aboutHeading: "Un ouvrage d’atelier, pas une cuisine en kit",
      aboutText: `${name} part du relevé et de l’essence. Le catalogue montre les lignes ; le devis chiffre la fabrication et la pose.`,
      aboutImageAlt: "Détail d’un ouvrage en bois massif",
      imageFirst: true,
      categoriesHeading: "Ouvrages",
      catalogHeading: "Pièces et menuiseries",
      processHeading: "Du relevé au devis",
      process: [
        { title: "1. Relevé", text: "Usage, cotes, accès, contraintes de pose." },
        { title: "2. Essence", text: "Ligne catalogue et finition." },
        { title: "3. Devis", text: "Fabrication et pose chiffrées par écrit." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette boutique prépare un devis d’ouvrage. Aucun paiement n’est pris ici.",
        },
        {
          q: "Faites-vous le sur-mesure ?",
          a: "Oui. Le catalogue pose les gammes ; le devis ajuste cotes, essence et pose.",
        },
        {
          q: "Les prix affichés sont-ils fermes ?",
          a: "Fourchettes d’orientation. Le montant contractuel est sur le devis d’atelier.",
        },
        {
          q: "Quels délais de fabrication ?",
          a: "Ils dépendent de l’ouvrage et de l’essence. Ils figurent sur le devis, pas en ligne.",
        },
      ],
      quoteHeading: "Chiffrer un ouvrage",
      quoteText: "Décrivez l’ouvrage ou partez du catalogue. Nous revenons avec un devis d’atelier.",
      quoteCta: "Ouvrir le devis menuiserie",
      catalogHeroHeading: "Catalogue menuiserie",
      catalogHeroSub: "Meubles, ouvertures, escaliers, agencements — à ajouter à la demande de devis.",
      catalogPageTitle: "Ouvrages",
      seoDescription: `${name} — menuiserie et ouvrages sur mesure${here}. Catalogue et demande de devis. Pas de paiement en ligne.`,
    },
    events: {
      heroHeading: `${name} — location et événementiel sur devis`,
      heroSub: `Durée, lieu et jauge cadrés avant le chiffrage${here}. Matériel et options au catalogue, devis écrit ensuite.`,
      heroCta: "Demander un devis",
      heroImageAlt: "Salle prête pour un événement",
      featuresHeading: "Ce que nous calons",
      features: [
        { title: "Jauge et lieu", text: "Capacité, accès, intérieur ou extérieur." },
        { title: "Durée et options", text: "Montage, traiteur, chapiteau, son — selon le brief." },
        { title: "Devis global", text: "Une demande pour tout le dispositif, pas une réservation en ligne." },
      ],
      proofHeading: "Repères événement",
      proof: [
        { title: "Format", text: "Réception, séminaire, extérieurs." },
        { title: "Délai", text: "Étude sous 48 h si la date est posée." },
        { title: "Périmètre", text: "Matériel, structure, options de service." },
      ],
      aboutHeading: "Un dispositif, un devis",
      aboutText: `${name} assemble le matériel et les options à partir du catalogue. Le contrat est le devis, pas un paiement en ligne.`,
      aboutImageAlt: "Réception dressée",
      imageFirst: true,
      categoriesHeading: "Familles",
      catalogHeading: "Matériel et options",
      processHeading: "Du brief au devis",
      process: [
        { title: "1. L’événement", text: "Date, lieu, jauge, contraintes terrain." },
        { title: "2. La composition", text: "Chapiteau, mobilier, options depuis le catalogue." },
        { title: "3. Le devis", text: "Chiffrage unique pour tout le dispositif." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette vitrine prépare un devis de location. Aucun paiement n’est pris ici.",
        },
        {
          q: "Gérez-vous le montage ?",
          a: "Oui, si le brief le demande. Montage et démontage figurent au devis.",
        },
        {
          q: "Les prix affichés sont-ils fermes ?",
          a: "Fourchettes catalogue. Le tarif de la date et du lieu est sur le devis.",
        },
        {
          q: "Quelle jauge maximale ?",
          a: "Elle dépend du matériel et du site. Le funnel pose capacité et contraintes.",
        },
      ],
      quoteHeading: "Chiffrer un événement",
      quoteText: "Date, lieu, jauge : nous composons le dispositif et envoyons un devis.",
      quoteCta: "Ouvrir le devis",
      catalogHeroHeading: "Catalogue événementiel",
      catalogHeroSub: "Matériel et options à ajouter à la demande de devis.",
      seoDescription: `${name} — location et événementiel${here}. Catalogue et demande de devis. Pas de paiement en ligne.`,
    },
    industry: {
      heroHeading: `${name} — fabrication et séries sur devis`,
      heroSub: `Série, matière et délai cadrés avant le chiffrage${here}. Le catalogue oriente, le devis contracte.`,
      heroCta: "Demander un devis",
      heroImageAlt: "Atelier de fabrication",
      featuresHeading: "Ce que nous industrialisons",
      features: [
        { title: "Série et matière", text: "Quantité, matière, tolérances : le brief part de la pièce." },
        { title: "Délai de lot", text: "Vous situez l’échéance ; le devis confirme le planning." },
        { title: "Devis atelier", text: "Pas de commande en ligne : un chiffrage écrit, puis lancement." },
      ],
      proofHeading: "Repères production",
      proof: [
        { title: "Lots", text: "Prototype, petite et moyenne série." },
        { title: "Étude", text: "Retour sous 72 h une fois la pièce cadrée." },
        { title: "Matières", text: "Selon gammes catalogue et brief technique." },
      ],
      aboutHeading: "Un lot chiffré, pas un extrait usine",
      aboutText: `${name} s’appuie sur le catalogue pour les gammes, puis chiffre la série. Le paiement n’est pas pris sur cette vitrine.`,
      aboutImageAlt: "Ligne de production",
      imageFirst: false,
      categoriesHeading: "Gammes",
      catalogHeading: "Pièces et procédés",
      processHeading: "Du brief au devis",
      process: [
        { title: "1. La pièce", text: "Matière, cote, quantité, contrainte qualité." },
        { title: "2. Le procédé", text: "Gamme catalogue et options d’usinage ou d’emballage." },
        { title: "3. Le devis", text: "Prix de lot et délai écrits." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette vitrine prépare un devis de fabrication. Aucun paiement ici.",
        },
        {
          q: "Prenez-vous les prototypes ?",
          a: "Oui. Le funnel distingue prototype et série pour caler le devis.",
        },
        {
          q: "Les prix affichés sont-ils fermes ?",
          a: "Fourchettes. Le prix de lot dépend de la matière et de la quantité.",
        },
        {
          q: "Livrez-vous sur site ?",
          a: "Selon le brief. Incoterm et délai figurent sur le devis.",
        },
      ],
      quoteHeading: "Chiffrer une série",
      quoteText: "Décrivez la pièce ou partez du catalogue. Nous revenons avec un devis de lot.",
      quoteCta: "Ouvrir le devis",
      catalogHeroHeading: "Catalogue fabrication",
      catalogHeroSub: "Gammes et procédés à ajouter à la demande de devis.",
      seoDescription: `${name} — fabrication et séries${here}. Catalogue et demande de devis. Pas de paiement en ligne.`,
    },
    services: {
      heroHeading: `${name} — missions et espaces sur devis`,
      heroSub: `Besoin, volume et échéance cadrés${here}. Coworking, formation ou studio : un brief, puis un devis.`,
      heroCta: "Demander un devis",
      heroImageAlt: "Espace de travail professionnel",
      featuresHeading: "Ce que nous organisons",
      features: [
        { title: "Besoin", text: "Espace, formation, studio : le brief pose l’usage." },
        { title: "Volume et dates", text: "Jauge, durée, créneaux — avant le chiffrage." },
        { title: "Devis unique", text: "Une demande globale, pas un paiement de réservation en ligne." },
      ],
      proofHeading: "Repères mission",
      proof: [
        { title: "Formats", text: "Salle, formation, studio, accompagnement." },
        { title: "Délai", text: "Retour sous 48 h si les dates sont posées." },
        { title: "Interlocuteur", text: "Un commercial suit la demande jusqu’au devis." },
      ],
      aboutHeading: "Un créneau chiffré, pas une caisse",
      aboutText: `${name} s’appuie sur le catalogue pour les offres, puis chiffre la mission. Rien n’est encaissé ici.`,
      aboutImageAlt: "Salle de réunion",
      imageFirst: false,
      categoriesHeading: "Offres",
      catalogHeading: "Formules à chiffrer",
      processHeading: "Du brief au devis",
      process: [
        { title: "1. Le besoin", text: "Usage, nombre de personnes, échéance." },
        { title: "2. L’offre", text: "Formule catalogue et options." },
        { title: "3. Le devis", text: "Chiffrage écrit, puis confirmation de créneau." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette vitrine prépare un devis de mission. Aucun paiement n’est pris ici.",
        },
        {
          q: "Peut-on réserver plusieurs dates ?",
          a: "Oui. Le brief compile les créneaux ; le devis les chiffre ensemble.",
        },
        {
          q: "Les prix affichés sont-ils fermes ?",
          a: "Fourchettes. Le tarif dépend des dates et du volume.",
        },
        {
          q: "Un interlocuteur dédié ?",
          a: "Oui. La demande est assignée ; vous ne relancez pas un formulaire anonyme.",
        },
      ],
      quoteHeading: "Chiffrer une mission",
      quoteText: "Décrivez le besoin ou choisissez une formule. Nous envoyons un devis.",
      quoteCta: "Ouvrir le devis",
      catalogHeroHeading: "Catalogue des offres",
      catalogHeroSub: "Formules et options à ajouter à la demande de devis.",
      seoDescription: `${name} — missions et espaces professionnels${here}. Catalogue et demande de devis. Pas de paiement en ligne.`,
    },
    property: {
      heroHeading: `${name} — missions immo et construction sur devis`,
      heroSub: `Type de mission, échéance et contexte cadrés${here}. Le dossier arrive complet ; le devis suit.`,
      heroCta: "Demander un devis",
      heroImageAlt: "Immeuble et chantier urbain",
      featuresHeading: "Ce que nous instruisons",
      features: [
        { title: "Mission", text: "Étude, conception, relevé : le brief pose le cadre." },
        { title: "Contexte terrain", text: "Site, contraintes, échéance permis ou livraison." },
        { title: "Devis de mission", text: "Honoraires écrits. Pas de paiement en ligne." },
      ],
      proofHeading: "Repères dossier",
      proof: [
        { title: "Missions", text: "Promoteur, architecte, géomètre, AMO." },
        { title: "Délai", text: "Retour sous 72 h une fois le contexte posé." },
        { title: "Pièces", text: "Le funnel demande le minimum pour chiffrer." },
      ],
      aboutHeading: "Un dossier cadré, pas un devis à vide",
      aboutText: `${name} reçoit un brief de mission, pas un appel générique. Le catalogue oriente les prestations ; le devis les chiffre.`,
      aboutImageAlt: "Plans et architecture",
      imageFirst: false,
      categoriesHeading: "Prestations",
      catalogHeading: "Missions à chiffrer",
      processHeading: "Du brief au devis",
      process: [
        { title: "1. La mission", text: "Type, site, échéance, pièces déjà disponibles." },
        { title: "2. Le périmètre", text: "Prestations catalogue et options." },
        { title: "3. Le devis", text: "Honoraires et jalons écrits." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette vitrine prépare un devis de mission. Aucun paiement ici.",
        },
        {
          q: "Quelles pièces joindre ?",
          a: "Plans, photos, contraintes de site si vous les avez. Le funnel liste le minimum.",
        },
        {
          q: "Les honoraires affichés sont-ils fermes ?",
          a: "Fourchettes. Le devis précise le forfait ou le temps passé.",
        },
        {
          q: city.trim() ? `Intervenez-vous hors de ${city.trim()} ?` : "Intervenez-vous hors secteur ?",
          a: "Selon la mission. Indiquez le site dans le brief.",
        },
      ],
      quoteHeading: "Chiffrer une mission",
      quoteText: "Type de mission et contexte : nous revenons avec un devis d’honoraires.",
      quoteCta: "Ouvrir le devis",
      catalogHeroHeading: "Catalogue des missions",
      catalogHeroSub: "Prestations à ajouter à la demande de devis.",
      seoDescription: `${name} — immobilier et construction${here}. Missions, catalogue et demande de devis. Pas de paiement en ligne.`,
    },
    health: {
      heroHeading: `${name} — soins et protocoles sur devis`,
      heroSub: `Peau, rituel et contraintes cadrés avant le bilan${here}. Protocoles au catalogue, devis écrit — sans paiement en ligne.`,
      heroCta: "Demander un devis soin",
      heroImageAlt: "Rituel skincare et actifs en situation",
      featuresHeading: "Ce que nous préparons",
      features: [
        { title: "Diagnostic", text: "Type de peau, objectif, contre-indications avant le protocole." },
        { title: "Rituel", text: "Actifs, durée, rythme : le brief pose le cadre du soin." },
        { title: "Devis préalable", text: "Chiffrage écrit. Aucun paiement en ligne." },
      ],
      proofHeading: "Repères cabinet",
      proof: [
        { title: "Protocoles", text: "Visage, silhouette, peau / laser, accompagnement." },
        { title: "Délai", text: "Retour sous 72 h une fois le besoin posé." },
        { title: "Confidentialité", text: "Le dossier reste chez vous, pas sur une caisse." },
      ],
      aboutHeading: "Un protocole préparé, pas une boutique cosmétique",
      aboutText: `${name} situe l’offre au catalogue, puis chiffre le rituel. Cette vitrine ne vend pas de flacons en ligne.`,
      aboutImageAlt: "Espace de soin apaisé",
      imageFirst: true,
      categoriesHeading: "Rituels",
      catalogHeading: "Soins et protocoles",
      processHeading: "Du bilan au devis",
      process: [
        { title: "1. Le bilan", text: "Peau, objectif, contraintes." },
        { title: "2. Le protocole", text: "Ligne catalogue adaptée." },
        { title: "3. Le devis", text: "Chiffrage, puis prise de rendez-vous." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette vitrine prépare un devis soin. Aucun paiement n’est pris ici.",
        },
        {
          q: "Est-ce un rendez-vous médical ?",
          a: "Le funnel qualifie le besoin. Le rendez-vous se pose après le devis, selon le protocole.",
        },
        {
          q: "Les tarifs affichés sont-ils fermes ?",
          a: "Fourchettes. Le devis précise le rituel ou l’équipement.",
        },
        {
          q: "Les données restent-elles confidentielles ?",
          a: "Oui. La demande alimente le dossier commerçant, pas une caisse tierce.",
        },
      ],
      quoteHeading: "Préparer un devis soin",
      quoteText: "Décrivez le rituel ou l’équipement. Nous revenons avec un chiffrage.",
      quoteCta: "Ouvrir le devis",
      catalogHeroHeading: "Catalogue des rituels",
      catalogHeroSub: "Soins, protocoles et équipements — à ajouter à la demande de devis.",
      catalogPageTitle: "Rituels",
      seoDescription: `${name} — soins et protocoles${here}. Catalogue et demande de devis. Pas de paiement en ligne.`,
    },
    tech: {
      heroHeading: `${name} — missions tech et conseil sur devis`,
      heroSub: `Besoin, volume et échéance cadrés${here}. Agence, ESN ou logiciel : un brief, puis un devis — pas un cahier des charges vide.`,
      heroCta: "Demander un devis",
      heroImageAlt: "Équipe produit au travail",
      featuresHeading: "Ce que nous cadrons",
      features: [
        { title: "Cible et périmètre", text: "Produit, intégration ou conseil : le brief pose le cadre." },
        { title: "Volume et délai", text: "Charge, jalons, contraintes stack." },
        { title: "Devis de mission", text: "Forfait ou régie écrits. Pas de paiement en ligne." },
      ],
      proofHeading: "Repères mission",
      proof: [
        { title: "Formats", text: "Cadrage, build, TMA, conseil." },
        { title: "Délai", text: "Retour sous 72 h une fois le besoin posé." },
        { title: "Preuves", text: "Le catalogue oriente les offres, le devis les chiffre." },
      ],
      aboutHeading: "Un cadrage commercial, pas un store SaaS",
      aboutText: `${name} vend des missions sur devis. Le catalogue décrit les offres ; cette vitrine n’encaisse rien.`,
      aboutImageAlt: "Tableau de bord et analyse",
      imageFirst: false,
      categoriesHeading: "Offres",
      catalogHeading: "Missions à chiffrer",
      processHeading: "Du brief au devis",
      process: [
        { title: "1. Le besoin", text: "Objectif, stack, échéance." },
        { title: "2. L’offre", text: "Formule catalogue et options." },
        { title: "3. Le devis", text: "Charge, jalons et prix écrits." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette vitrine prépare un devis de mission. Aucun paiement ici.",
        },
        {
          q: "Travaillez-vous au forfait ?",
          a: "Forfait ou régie selon le brief. C’est tranché sur le devis.",
        },
        {
          q: "Les prix affichés sont-ils fermes ?",
          a: "Fourchettes. Le montant dépend du périmètre.",
        },
        {
          q: "Un interlocuteur unique ?",
          a: "Oui. La demande est assignée dans QuoteBuilder après envoi.",
        },
      ],
      quoteHeading: "Chiffrer une mission",
      quoteText: "Décrivez le besoin ou choisissez une offre. Nous envoyons un devis.",
      quoteCta: "Ouvrir le devis",
      catalogHeroHeading: "Catalogue des offres",
      catalogHeroSub: "Missions et formules à ajouter à la demande de devis.",
      seoDescription: `${name} — tech et conseil${here}. Offres, catalogue et demande de devis. Pas de paiement en ligne.`,
    },
    custom: {
      heroHeading: `${name} — catalogue et devis sur mesure`,
      heroSub: `Présentez vos gammes, cadrez le besoin, envoyez une demande de devis${here}. Pas de paiement en ligne.`,
      heroCta: "Demander un devis",
      heroImageAlt: "Showroom et espace d’accueil",
      featuresHeading: "Pourquoi cette vitrine",
      features: [
        { title: "Catalogue réel", text: "Fiches, photos, fourchettes et catégories depuis QuoteBuilder." },
        { title: "Devis, pas de caisse", text: "Le prospect compose une demande ; vous restez maître du prix." },
        { title: "Référencement", text: "Pages indexables, FAQ, mentions légales." },
      ],
      proofHeading: "Le rythme d’une vitrine de devis",
      proof: [
        { title: "Catalogue", text: "Les rayons se remplissent depuis vos fiches." },
        { title: "Brief", text: "Le funnel pose les champs qui font un devis chiffrable." },
        { title: "Suite", text: "Assignation et relances côté équipe commerciale." },
      ],
      aboutHeading: "Une boutique née structurée",
      aboutText: `${name} ouvre avec accueil, catalogue, preuves, FAQ et CTA devis. Affinez les textes et les photos dans Puck.`,
      aboutImageAlt: "Espace d’accueil professionnel",
      imageFirst: false,
      categoriesHeading: "Rayons",
      catalogHeading: "Produits",
      processHeading: "Du brief au devis",
      process: [
        { title: "1. Parcourir", text: "Rayons et fiches du catalogue." },
        { title: "2. Composer", text: "Produits et précisions dans le funnel." },
        { title: "3. Envoyer", text: "Une demande globale, puis le devis écrit." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette boutique prépare un devis. Aucun paiement n’est pris ici.",
        },
        {
          q: "Puis-je ajouter plusieurs produits ?",
          a: "Oui. Le funnel reprend le catalogue et compile une demande globale.",
        },
        {
          q: "Les prix affichés sont-ils fermes ?",
          a: "Fourchettes catalogue. Le tarif contractuel figure sur le devis.",
        },
        {
          q: "Comment remplacer les photos ?",
          a: "Dans l’éditeur Puck : bloc Image ou Hero, champ URL. Les visuels actuels sont des placeholders.",
        },
      ],
      quoteHeading: "Chiffrer un projet",
      quoteText: "Décrivez le besoin ou partez du catalogue. Nous revenons avec un devis.",
      quoteCta: "Ouvrir le devis",
      catalogHeroHeading: "Catalogue",
      catalogHeroSub: "Parcourez les rayons, ouvrez une fiche, ajoutez-la au devis.",
      seoDescription: `${name} — catalogue, catégories et demande de devis B2B${here}. Pas de paiement en ligne.`,
    },
  };
}

export function shopCopyForFamily(input: {
  name: string;
  sector: string;
  city?: string;
  templateId?: string | null;
}): ShopCopy {
  const family = getFunnelFamily(input.sector);
  const template = resolveShopSectorTemplate(input.templateId, family.id);
  return packs(input.name, input.city ?? "")[template?.family ?? family.id];
}

function asLayout(content: ShopNode[]): ShopLayout {
  return { root: { props: {} }, content };
}

function statColumn(item: ShopStat): ShopNode[] {
  return [emptyNode("Heading", { text: item.title, level: "h3" }), emptyNode("Text", { text: item.text })];
}

function columnsOf(items: ShopStat[], gap = "28px"): ShopNode {
  return emptyNode("Columns", {
    count: String(Math.min(4, Math.max(2, items.length))),
    gap,
    col1: items[0] ? statColumn(items[0]) : [],
    col2: items[1] ? statColumn(items[1]) : [],
    col3: items[2] ? statColumn(items[2]) : [],
    col4: items[3] ? statColumn(items[3]) : [],
  });
}

function homeBlocks(input: {
  name: string;
  sector: string;
  city?: string;
  templateId?: string | null;
}): Record<HomeBlockId, ShopNode> {
  const copy = shopCopyForFamily(input);
  const photos = shopPlaceholders(input.sector, input.templateId);
  const template = resolveShopSectorTemplate(input.templateId, input.sector);
  const wash = template?.wash ?? WASH;
  const textCol = [
    emptyNode("Heading", { text: copy.aboutHeading, level: "h2" }),
    emptyNode("Text", { text: copy.aboutText }),
    emptyNode("Button", { label: copy.heroCta, href: "/devis" }),
  ];
  const imageCol = [emptyNode("Image", { image: photos.split.image, imageAlt: copy.aboutImageAlt })];

  return {
    hero: emptyNode("Hero", {
      heading: copy.heroHeading,
      sub: copy.heroSub,
      ctaLabel: copy.heroCta,
      image: photos.hero.image,
      imageAlt: copy.heroImageAlt,
      padding: template?.heroPadding ?? "80px 0",
    }),
    features: emptyNode("Features", {
      heading: copy.featuresHeading,
      features: copy.features,
      padding: "64px 0",
    }),
    proof: emptyNode("Section", {
      padding: "64px 0",
      background: wash,
      children: [emptyNode("Heading", { text: copy.proofHeading, level: "h2" }), columnsOf(copy.proof)],
    }),
    about: emptyNode("Section", {
      padding: "64px 0",
      children: [
        emptyNode("Columns", {
          count: "2",
          gap: "40px",
          col1: copy.imageFirst ? imageCol : textCol,
          col2: copy.imageFirst ? textCol : imageCol,
        }),
      ],
    }),
    categories: emptyNode("Categories", { heading: copy.categoriesHeading, padding: "64px 0" }),
    catalog: emptyNode("Catalog", { heading: copy.catalogHeading, limit: 8, padding: "64px 0" }),
    process: emptyNode("Section", {
      padding: "64px 0",
      background: wash,
      children: [emptyNode("Heading", { text: copy.processHeading, level: "h2" }), columnsOf(copy.process)],
    }),
    faq: emptyNode("Faq", { heading: copy.faqHeading, faq: copy.faq, padding: "64px 0" }),
    quote: emptyNode("QuoteCta", {
      heading: copy.quoteHeading,
      text: copy.quoteText,
      ctaLabel: copy.quoteCta,
      padding: "64px 0",
    }),
  };
}

export function buildHomeLayout(input: {
  name: string;
  sector: string;
  city?: string;
  templateId?: string | null;
}): ShopLayout {
  const rhythm = homeRhythmFor(input.sector, input.templateId);
  const blocks = homeBlocks(input);
  return asLayout(rhythm.map((id) => blocks[id]));
}

export function buildCatalogLayout(input: {
  name: string;
  sector: string;
  city?: string;
  templateId?: string | null;
}): ShopLayout {
  const copy = shopCopyForFamily(input);
  const photos = shopPlaceholders(input.sector, input.templateId);
  const template = resolveShopSectorTemplate(input.templateId, input.sector);
  return asLayout([
    emptyNode("Hero", {
      heading: copy.catalogHeroHeading,
      sub: copy.catalogHeroSub,
      ctaLabel: copy.heroCta,
      image: photos.catalog.image,
      imageAlt: copy.heroImageAlt,
      padding: template?.heroPadding ?? "80px 0",
    }),
    emptyNode("Categories", { heading: copy.categoriesHeading, padding: "64px 0" }),
    emptyNode("Catalog", { heading: copy.catalogHeading, limit: 24, padding: "64px 0" }),
    emptyNode("QuoteCta", {
      heading: copy.quoteHeading,
      text: copy.quoteText,
      ctaLabel: copy.quoteCta,
      padding: "64px 0",
    }),
  ]);
}

export const HOME_RHYTHM = homeTypeSequence(DEFAULT_HOME_RHYTHM);

export function layoutTypeSequence(layout: ShopLayout): string[] {
  return layout.content.map((node) => node.type);
}

export function collectNodeTypes(nodes: ShopNode[]): string[] {
  const types: string[] = [];
  const visit = (list: ShopNode[]) => {
    for (const node of list) {
      types.push(node.type);
      for (const value of Object.values(node.props)) {
        if (Array.isArray(value) && value.every((item) => item && typeof item === "object" && "type" in item)) {
          visit(value as ShopNode[]);
        }
      }
    }
  };
  visit(nodes);
  return types;
}

export function collectFilledImages(nodes: ShopNode[]): { image: string; imageAlt: string }[] {
  const found: { image: string; imageAlt: string }[] = [];
  const visit = (list: ShopNode[]) => {
    for (const node of list) {
      const image = String(node.props.image ?? "").trim();
      const imageAlt = String(node.props.imageAlt ?? "").trim();
      if (image) found.push({ image, imageAlt });
      for (const value of Object.values(node.props)) {
        if (Array.isArray(value) && value.every((item) => item && typeof item === "object" && "type" in item)) {
          visit(value as ShopNode[]);
        }
      }
    }
  };
  visit(nodes);
  return found;
}

export const SHOP_AGENT_FIRST_TURN_PLAYBOOK = `## Premier tour (création)
L’historique est vide : c’est un brief de création. Tu ne te contentes pas de retoucher deux phrases.

Checklist obligatoire :
1. get_tree slug=accueil puis slug=catalogue (lis les ids, n’invente pas).
2. Hero accueil : heading spécifique au brief (pas seulement le nom), chapô 2 phrases métier, image + imageAlt remplis. CTA = demander un devis.
3. Features, preuves (colonnes), à-propos (colonnes texte + image), FAQ, QuoteCta : vocabulaire du secteur / brief. Jamais « acheter », « panier », « checkout », « payer en ligne ».
4. Rythme accueil : conserve Hero, Features, Categories, Catalog, Faq, QuoteCta et les 3 Sections (preuves, à-propos, parcours). L’ordre peut suivre le template (atelier menuiserie, rituel skincare, spec stock B2B). Ne réordonne pas sans raison.
5. Catalogue : Hero imagé + Categories + Catalog + QuoteCta. Insère un QuoteCta s’il manque.
6. Tous les slots image vides : renseigne image + imageAlt (placeholders ci-dessous si le brief n’envoie pas de photo).
7. set_page_seo accueil et catalogue (title unique, meta 150-160 caractères). set_seo global + GEO si une ville est dans le brief.
8. set_status published.

Préfère update_node sur les ids existants. insert_node seulement pour Colonnes / Image / QuoteCta manquants. Ne détruis pas Categories, Catalog ni QuoteCta.`;
