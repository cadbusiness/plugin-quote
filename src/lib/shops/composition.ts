import { getFunnelFamily, type FunnelFamilyId } from "@/lib/funnels/families";
import { emptyNode } from "@/lib/shops/layout";
import { shopPlaceholders } from "@/lib/shops/placeholders";
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
      heroHeading: `${name} — rayonnage et stockage sur devis`,
      heroSub: `Travées, charge et allées cadrés avant le chiffrage${here}. Catalogue réel, demande de devis — pas de paiement en ligne.`,
      heroCta: "Demander un devis",
      heroImageAlt: "Entrepôt avec travées de rayonnage",
      featuresHeading: "Ce que nous dimensionnons",
      features: [
        { title: "Charge et hauteur", text: "Niveaux, charge utile et hauteur sous poutre pour un brief chiffrable." },
        { title: "Allées et picking", text: "Circulation, réserve ou picking fréquent : la gamme suit l’usage." },
        { title: "Étude avant pose", text: "Vous recevez un devis écrit. La pose se planifie ensuite, sans caisse en ligne." },
      ],
      proofHeading: "Repères pour cadrer le projet",
      proof: [
        { title: "Charge", text: "Jusqu’à 800 kg et plus par niveau, selon la gamme." },
        { title: "Délai d’étude", text: "Brief relu sous 48 h ouvrées une fois le besoin posé." },
        { title: "Terrain", text: "Entrepôt, réserve, atelier ou archives." },
      ],
      aboutHeading: "Un brief d’entrepôt, pas un catalogue anonyme",
      aboutText: `${name} part de votre surface, de la hauteur utile et de la charge. Le catalogue sert à composer le devis, pas à encaisser.`,
      aboutImageAlt: "Allée de stockage industrielle",
      imageFirst: false,
      categoriesHeading: "Rayons",
      catalogHeading: "Gammes à chiffrer",
      processHeading: "Du brief au devis",
      process: [
        { title: "1. Cadrer", text: "Espace, surface, charge, contraintes d’accès." },
        { title: "2. Composer", text: "Travées et options depuis le catalogue." },
        { title: "3. Devis", text: "L’équipe commerciale revient avec un chiffrage écrit." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette vitrine prépare un devis. Vous composez le besoin, nous chiffrons.",
        },
        {
          q: "Quels projets de stockage acceptez-vous ?",
          a: "Entrepôt, réserve commerce, atelier, archives. Le funnel pose usage, surface et charge.",
        },
        {
          q: "Les prix affichés sont-ils fermes ?",
          a: "Ce sont des fourchettes catalogue. Le tarif contractuel figure sur le devis écrit.",
        },
        {
          q: "Intervenez-vous sur site ?",
          a: "Oui, une fois le devis accepté : calepinage, livraison et pose selon le brief.",
        },
      ],
      quoteHeading: "Chiffrer un projet de stockage",
      quoteText: "Décrivez l’espace ou partez du catalogue. Nous revenons avec un devis.",
      quoteCta: "Ouvrir le devis",
      catalogHeroHeading: "Catalogue rayonnage",
      catalogHeroSub: "Parcourez les gammes, ouvrez une fiche, ajoutez-la à la demande de devis.",
      seoDescription: `${name} — rayonnage et stockage${here}. Catalogue, catégories et demande de devis B2B. Pas de paiement en ligne.`,
    },
    habitat: {
      heroHeading: `${name} — cuisines et aménagements sur devis`,
      heroSub: `Pièce, style et budget cadrés avant le rendez-vous${here}. Vous composez, nous chiffrons — sans paiement en ligne.`,
      heroCta: "Demander un devis",
      heroImageAlt: "Cuisine aménagée sur mesure",
      featuresHeading: "Ce que nous cadrons",
      features: [
        { title: "Pièce et usage", text: "Cuisine complète, îlot ou partiel : le brief suit le chantier." },
        { title: "Style et matériaux", text: "Finitions, plan de travail et contraintes techniques avant le chiffrage." },
        { title: "Budget indicatif", text: "Fourchettes catalogue pour situer, devis écrit pour contracter." },
      ],
      proofHeading: "Repères chantier",
      proof: [
        { title: "Projets", text: "Cuisine, menuiserie, aménagements intérieurs." },
        { title: "Délai d’étude", text: "Retour sous 72 h une fois pièce et style posés." },
        { title: "Sur mesure", text: "Chaque devis part du plan, pas d’une grille tarifaire figée." },
      ],
      aboutHeading: "Un projet d’aménagement, pas une vente flash",
      aboutText: `${name} s’appuie sur le catalogue pour proposer des lignes, puis chiffre le chantier. Le paiement n’a pas lieu ici.`,
      aboutImageAlt: "Intérieur d’habitation aménagé",
      imageFirst: true,
      categoriesHeading: "Univers",
      catalogHeading: "Lignes et finitions",
      processHeading: "Du brief au devis",
      process: [
        { title: "1. La pièce", text: "Usage, dimensions, contraintes d’eau et d’électriques." },
        { title: "2. Le style", text: "Lignes catalogue et options de finition." },
        { title: "3. Le devis", text: "Chiffrage écrit, puis rendez-vous si besoin." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette boutique prépare un devis d’aménagement. Aucun paiement n’est pris ici.",
        },
        {
          q: "Faites-vous le sur-mesure ?",
          a: "Oui. Le catalogue pose les gammes ; le devis ajuste cotes, finitions et pose.",
        },
        {
          q: "Les prix affichés sont-ils fermes ?",
          a: "Fourchettes d’orientation. Le montant contractuel est sur le devis.",
        },
        {
          q: "Quels délais de pose ?",
          a: "Ils dépendent du brief (pièce, matériaux). Ils figurent sur le devis, pas en ligne.",
        },
      ],
      quoteHeading: "Chiffrer un aménagement",
      quoteText: "Décrivez la pièce ou partez du catalogue. Nous revenons avec un devis.",
      quoteCta: "Ouvrir le devis",
      catalogHeroHeading: "Catalogue aménagement",
      catalogHeroSub: "Lignes, finitions et options — à ajouter à votre demande de devis.",
      seoDescription: `${name} — cuisines et aménagements${here}. Catalogue et demande de devis. Pas de paiement en ligne.`,
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
      heroHeading: `${name} — accompagnements et équipements sur devis`,
      heroSub: `Acte ou équipement, contraintes et budget cadrés${here}. Le prospect se qualifie, nous chiffrons — sans paiement en ligne.`,
      heroCta: "Demander un devis",
      heroImageAlt: "Espace de soin professionnel",
      featuresHeading: "Ce que nous préparons",
      features: [
        { title: "Acte ou équipement", text: "Le brief distingue le soin, le bilan et le matériel." },
        { title: "Contraintes", text: "Locaux, normes, budget indicatif avant le rendez-vous." },
        { title: "Devis préalable", text: "Chiffrage écrit. Aucun paiement en ligne." },
      ],
      proofHeading: "Repères parcours",
      proof: [
        { title: "Cadre", text: "Bilan, équipement, accompagnement." },
        { title: "Délai", text: "Retour sous 72 h une fois le besoin posé." },
        { title: "Confidentialité", text: "Le dossier reste chez vous, pas sur une caisse." },
      ],
      aboutHeading: "Un rendez-vous préparé, pas une boutique santé",
      aboutText: `${name} utilise le catalogue pour situer l’offre, puis chiffre. Cette vitrine ne prend pas de paiement.`,
      aboutImageAlt: "Accueil d’un espace de soin",
      imageFirst: true,
      categoriesHeading: "Parcours",
      catalogHeading: "Offres à chiffrer",
      processHeading: "Du brief au devis",
      process: [
        { title: "1. Le besoin", text: "Acte, équipement, contraintes." },
        { title: "2. L’offre", text: "Ligne catalogue adaptée." },
        { title: "3. Le devis", text: "Chiffrage, puis prise de rendez-vous." },
      ],
      faqHeading: "Questions fréquentes",
      faq: [
        {
          q: "Puis-je commander en ligne ?",
          a: "Non. Cette vitrine prépare un devis. Aucun paiement n’est pris ici.",
        },
        {
          q: "Est-ce un rendez-vous médical ?",
          a: "Le funnel qualifie le besoin. Le rendez-vous se pose après le devis, selon l’offre.",
        },
        {
          q: "Les tarifs affichés sont-ils fermes ?",
          a: "Fourchettes. Le devis précise l’acte ou l’équipement.",
        },
        {
          q: "Les données restent-elles confidentielles ?",
          a: "Oui. La demande alimente le dossier commerçant, pas une caisse tierce.",
        },
      ],
      quoteHeading: "Préparer un devis",
      quoteText: "Décrivez l’acte ou l’équipement. Nous revenons avec un chiffrage.",
      quoteCta: "Ouvrir le devis",
      catalogHeroHeading: "Catalogue des offres",
      catalogHeroSub: "Parcours et équipements à ajouter à la demande de devis.",
      seoDescription: `${name} — santé et bien-être${here}. Offres, catalogue et demande de devis. Pas de paiement en ligne.`,
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

export function shopCopyForFamily(input: { name: string; sector: string; city?: string }): ShopCopy {
  const family = getFunnelFamily(input.sector);
  return packs(input.name, input.city ?? "")[family.id];
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

export function buildHomeLayout(input: { name: string; sector: string; city?: string }): ShopLayout {
  const copy = shopCopyForFamily(input);
  const photos = shopPlaceholders(input.sector);
  const textCol = [
    emptyNode("Heading", { text: copy.aboutHeading, level: "h2" }),
    emptyNode("Text", { text: copy.aboutText }),
    emptyNode("Button", { label: copy.heroCta, href: "/devis" }),
  ];
  const imageCol = [emptyNode("Image", { image: photos.split.image, imageAlt: copy.aboutImageAlt })];

  return asLayout([
    emptyNode("Hero", {
      heading: copy.heroHeading,
      sub: copy.heroSub,
      ctaLabel: copy.heroCta,
      image: photos.hero.image,
      imageAlt: copy.heroImageAlt,
      padding: "80px 0",
    }),
    emptyNode("Features", {
      heading: copy.featuresHeading,
      features: copy.features,
      padding: "64px 0",
    }),
    emptyNode("Section", {
      padding: "64px 0",
      background: WASH,
      children: [emptyNode("Heading", { text: copy.proofHeading, level: "h2" }), columnsOf(copy.proof)],
    }),
    emptyNode("Section", {
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
    emptyNode("Categories", { heading: copy.categoriesHeading, padding: "64px 0" }),
    emptyNode("Catalog", { heading: copy.catalogHeading, limit: 8, padding: "64px 0" }),
    emptyNode("Section", {
      padding: "64px 0",
      background: WASH,
      children: [emptyNode("Heading", { text: copy.processHeading, level: "h2" }), columnsOf(copy.process)],
    }),
    emptyNode("Faq", { heading: copy.faqHeading, faq: copy.faq, padding: "64px 0" }),
    emptyNode("QuoteCta", {
      heading: copy.quoteHeading,
      text: copy.quoteText,
      ctaLabel: copy.quoteCta,
      padding: "64px 0",
    }),
  ]);
}

export function buildCatalogLayout(input: { name: string; sector: string; city?: string }): ShopLayout {
  const copy = shopCopyForFamily(input);
  const photos = shopPlaceholders(input.sector);
  return asLayout([
    emptyNode("Hero", {
      heading: copy.catalogHeroHeading,
      sub: copy.catalogHeroSub,
      ctaLabel: copy.heroCta,
      image: photos.catalog.image,
      imageAlt: copy.heroImageAlt,
      padding: "80px 0",
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

export const HOME_RHYTHM = [
  "Hero",
  "Features",
  "Section",
  "Section",
  "Categories",
  "Catalog",
  "Section",
  "Faq",
  "QuoteCta",
] as const;

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
4. Rythme accueil à conserver ou rétablir : Hero → Features → preuves (Section + Columns) → à-propos (Section + Columns) → Categories → Catalog → parcours (Section + Columns) → Faq → QuoteCta.
5. Catalogue : Hero imagé + Categories + Catalog + QuoteCta. Insère un QuoteCta s’il manque.
6. Tous les slots image vides : renseigne image + imageAlt (placeholders ci-dessous si le brief n’envoie pas de photo).
7. set_page_seo accueil et catalogue (title unique, meta 150-160 caractères). set_seo global + GEO si une ville est dans le brief.
8. set_status published.

Préfère update_node sur les ids existants. insert_node seulement pour Colonnes / Image / QuoteCta manquants. Ne détruis pas Categories, Catalog ni QuoteCta.`;
