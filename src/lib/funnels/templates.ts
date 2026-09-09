import type { Json } from "@/lib/db/database.types";
import type { FunnelKind } from "@/lib/funnels/builder";
import {
  catalogSteps,
  equipSteps,
  makeSteps,
  projectSteps,
  rentalSteps,
  serviceSteps,
} from "@/lib/funnels/archetypes";
import { getFunnelFamily, type FunnelFamily, type FunnelFamilyId } from "@/lib/funnels/families";
import type { QuestionType, ScreenType } from "@/lib/wizard/types";

export type TemplateQuestion = {
  key: string;
  label: string;
  help_text: string | null;
  type: QuestionType;
  required: boolean;
  options: Json;
};

export type TemplateStep = {
  title: string;
  subtitle: string | null;
  screen_type: ScreenType;
  questions?: TemplateQuestion[];
};

export type FunnelTemplate = {
  id: string;
  family: FunnelFamilyId;
  defaultKind: FunnelKind;
  label: string;
  blurb: string;
  defaultName: string;
  accent: string;
  tint: string;
  steps: TemplateStep[];
};

const contactStep: TemplateStep = {
  title: "Vos coordonnées",
  subtitle: "Recevez le récapitulatif de votre projet",
  screen_type: "contact",
};

const suggestionsStep = (subtitle: string): TemplateStep => ({
  title: "Solutions recommandées",
  subtitle,
  screen_type: "suggestions",
});

const customizeStep: TemplateStep = {
  title: "Personnalisation",
  subtitle: "Quantités, options et précisions",
  screen_type: "customize",
};

export const CATALOG_FUNNEL_STEPS: TemplateStep[] = catalogSteps();

function choices(items: { value: string; label: string; description?: string }[]): Json {
  return { choices: items };
}

function thin(
  id: string,
  family: FunnelFamilyId,
  defaultKind: FunnelKind,
  label: string,
  blurb: string,
  defaultName: string,
  tint: string,
  accent: string,
  steps: TemplateStep[],
): FunnelTemplate {
  return { id, family, defaultKind, label, blurb, defaultName, accent, tint, steps };
}

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  {
    id: "racking",
    family: "racking",
    defaultKind: "form",
    label: "Configurateur projet",
    blurb: "Type d’espace, surface, charge, puis les gammes adaptées.",
    defaultName: "Funnel rayonnage",
    accent: "#D97706",
    tint: "bg-amber-50 text-amber-800 ring-amber-200",
    steps: [
      {
        title: "Type de projet",
        subtitle: "Quel espace souhaitez-vous équiper ?",
        screen_type: "questions",
        questions: [
          {
            key: "project_type",
            label: "Type d’espace",
            help_text: "Choisissez le contexte le plus proche",
            type: "visual_choice",
            required: true,
            options: choices([
              { value: "entrepot", label: "Entrepôt", description: "Palettes, allées, hauteur utile" },
              { value: "commerce", label: "Commerce", description: "Réserve, picking fréquent" },
              { value: "atelier", label: "Atelier", description: "Pièces, outillage, charges ponctuelles" },
              { value: "archive", label: "Archives", description: "Dossiers, rayonnage léger" },
            ]),
          },
        ],
      },
      {
        title: "Dimensionnement",
        subtitle: "Surface, hauteur et contraintes",
        screen_type: "questions",
        questions: [
          {
            key: "surface",
            label: "Surface au sol (m²)",
            help_text: "Surface approximative à équiper",
            type: "number",
            required: true,
            options: { min: 10, max: 20000, step: 10, unit: "m²", placeholder: "600" },
          },
          {
            key: "height",
            label: "Hauteur disponible (m)",
            help_text: "Hauteur sous plafond ou sous poutre",
            type: "number",
            required: true,
            options: { min: 2, max: 16, step: 0.5, unit: "m", placeholder: "8" },
          },
          {
            key: "load",
            label: "Charge par niveau",
            help_text: null,
            type: "select",
            required: true,
            options: choices([
              { value: "light", label: "Légère (< 250 kg)" },
              { value: "medium", label: "Moyenne (250–800 kg)" },
              { value: "heavy", label: "Lourde (> 800 kg)" },
            ]),
          },
        ],
      },
      suggestionsStep("2 à 3 configurations adaptées à votre brief"),
      customizeStep,
      contactStep,
    ],
  },
  thin(
    "racking_catalog",
    "racking",
    "catalog",
    "Catalogue gammes",
    "Le prospect parcourt vos travées et ajoute au devis.",
    "Catalogue rayonnage",
    "bg-amber-50 text-amber-800 ring-amber-200",
    "#D97706",
    catalogSteps(),
  ),
  thin(
    "racking_chat",
    "racking",
    "chat",
    "Brief chat",
    "Le prospect décrit l’espace, l’IA cadré le besoin.",
    "Chat rayonnage",
    "bg-amber-50 text-amber-800 ring-amber-200",
    "#D97706",
    equipSteps({
      title: "Votre stockage",
      subtitle: "Décrivez l’espace à équiper",
      spaceLabel: "Type d’espace",
      spaces: [
        { value: "entrepot", label: "Entrepôt", description: "Palettes, allées" },
        { value: "commerce", label: "Commerce", description: "Réserve, picking" },
        { value: "atelier", label: "Atelier", description: "Outillage, charges" },
        { value: "archive", label: "Archives", description: "Rayonnage léger" },
      ],
      suggestions: "Gammes adaptées à votre brief",
    }),
  ),
  {
    id: "kitchen",
    family: "habitat",
    defaultKind: "form",
    label: "Cuisiniste",
    blurb: "Pièce, style, budget, le prospect compose avant l’appel.",
    defaultName: "Funnel cuisine",
    accent: "#E11D48",
    tint: "bg-rose-50 text-rose-800 ring-rose-200",
    steps: [
      {
        title: "Votre cuisine",
        subtitle: "Cadrer le projet en quelques choix",
        screen_type: "questions",
        questions: [
          {
            key: "project_type",
            label: "Type de projet",
            help_text: null,
            type: "visual_choice",
            required: true,
            options: choices([
              { value: "complete", label: "Cuisine complète", description: "Pièce à équiper ou rénover" },
              { value: "ilot", label: "Îlot / snack", description: "Ajout ou remplacement" },
              { value: "partial", label: "Partiel", description: "Meubles ou plan de travail" },
            ]),
          },
          {
            key: "style",
            label: "Style souhaité",
            help_text: null,
            type: "select",
            required: true,
            options: choices([
              { value: "modern", label: "Contemporain" },
              { value: "classic", label: "Classique" },
              { value: "industrial", label: "Industriel" },
              { value: "undecided", label: "Pas encore tranché" },
            ]),
          },
          {
            key: "budget",
            label: "Budget indicatif",
            help_text: "Fourchette, pas un devis",
            type: "select",
            required: false,
            options: choices([
              { value: "10k", label: "Moins de 10 000 €" },
              { value: "20k", label: "10 000 – 20 000 €" },
              { value: "40k", label: "20 000 – 40 000 €" },
              { value: "40k+", label: "Plus de 40 000 €" },
            ]),
          },
        ],
      },
      suggestionsStep("Compositions à partir de votre catalogue"),
      customizeStep,
      contactStep,
    ],
  },
  {
    id: "wood",
    family: "habitat",
    defaultKind: "form",
    label: "Menuisier",
    blurb: "Usage, essence, dimensions, uniquement ce que vous fabriquez.",
    defaultName: "Funnel menuiserie",
    accent: "#B45309",
    tint: "bg-orange-50 text-orange-800 ring-orange-200",
    steps: [
      {
        title: "Votre ouvrage",
        subtitle: "Ce que vous voulez faire réaliser",
        screen_type: "questions",
        questions: [
          {
            key: "usage",
            label: "Type d’ouvrage",
            help_text: null,
            type: "visual_choice",
            required: true,
            options: choices([
              { value: "furniture", label: "Meuble", description: "Table, dressing, bibliothèque" },
              { value: "opening", label: "Ouverture", description: "Fenêtre, porte, store" },
              { value: "stair", label: "Escalier / garde-corps" },
              { value: "fitout", label: "Agencement", description: "Sur-mesure pièce" },
            ]),
          },
          {
            key: "essence",
            label: "Essence ou finition",
            help_text: "Si vous avez une préférence",
            type: "select",
            required: false,
            options: choices([
              { value: "oak", label: "Chêne" },
              { value: "walnut", label: "Noyer" },
              { value: "ash", label: "Frêne" },
              { value: "painted", label: "Laqué / peint" },
              { value: "open", label: "À conseiller" },
            ]),
          },
          {
            key: "notes",
            label: "Dimensions ou contraintes",
            help_text: "Cotes approximatives, accès, délais",
            type: "text",
            required: false,
            options: { placeholder: "Ex. 3,20 m de linéaire, pièce mansardée" },
          },
        ],
      },
      suggestionsStep("Pièces et finitions de votre catalogue"),
      customizeStep,
      contactStep,
    ],
  },
  {
    id: "garden",
    family: "habitat",
    defaultKind: "form",
    label: "Paysagiste",
    blurb: "Surface, usage, entretien, le projet se compose avant le RDV.",
    defaultName: "Funnel jardin",
    accent: "#059669",
    tint: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    steps: [
      {
        title: "Votre extérieur",
        subtitle: "Surface, usage et niveau d’entretien",
        screen_type: "questions",
        questions: [
          {
            key: "usage",
            label: "Usage principal",
            help_text: "Plusieurs choix possibles",
            type: "multi_select",
            required: true,
            options: choices([
              { value: "terrace", label: "Terrasse / salon d’été" },
              { value: "lawn", label: "Pelouse / massifs" },
              { value: "pool", label: "Tour de piscine" },
              { value: "full", label: "Jardin complet" },
            ]),
          },
          {
            key: "surface",
            label: "Surface (m²)",
            help_text: null,
            type: "number",
            required: true,
            options: { min: 10, max: 5000, step: 10, unit: "m²", placeholder: "120" },
          },
          {
            key: "upkeep",
            label: "Niveau d’entretien souhaité",
            help_text: null,
            type: "select",
            required: true,
            options: choices([
              { value: "low", label: "Minimal" },
              { value: "medium", label: "Régulier" },
              { value: "high", label: "Jardin soigné" },
            ]),
          },
        ],
      },
      suggestionsStep("Aménagements à partir de vos gammes"),
      customizeStep,
      contactStep,
    ],
  },
  thin(
    "habitat_catalog",
    "habitat",
    "catalog",
    "Catalogue aménagement",
    "Gammes cuisine, menuiserie ou jardin à parcourir.",
    "Catalogue habitat",
    "bg-rose-50 text-rose-800 ring-rose-200",
    "#E11D48",
    catalogSteps(),
  ),
  {
    id: "rental",
    family: "events",
    defaultKind: "form",
    label: "Location matériel",
    blurb: "Durée, capacité, options, une demande complète, pas un appel à vide.",
    defaultName: "Funnel location",
    accent: "#0284C7",
    tint: "bg-sky-50 text-sky-800 ring-sky-200",
    steps: [
      {
        title: "Votre location",
        subtitle: "Matériel, durée et conditions de chantier",
        screen_type: "questions",
        questions: [
          {
            key: "category",
            label: "Famille de matériel",
            help_text: null,
            type: "visual_choice",
            required: true,
            options: choices([
              { value: "lift", label: "Levage / Nacelle" },
              { value: "earth", label: "Terrassement" },
              { value: "power", label: "Énergie / Groupe" },
              { value: "other", label: "Autre" },
            ]),
          },
          {
            key: "duration",
            label: "Durée",
            help_text: null,
            type: "select",
            required: true,
            options: choices([
              { value: "day", label: "1 jour" },
              { value: "week", label: "1 semaine" },
              { value: "month", label: "1 mois et +" },
            ]),
          },
          {
            key: "when",
            label: "Date souhaitée",
            help_text: "Approximative si besoin",
            type: "text",
            required: false,
            options: { placeholder: "Ex. semaine du 14" },
          },
        ],
      },
      suggestionsStep("Matériel disponible dans votre parc"),
      customizeStep,
      contactStep,
    ],
  },
  thin(
    "events_catering",
    "events",
    "form",
    "Traiteur",
    "Date, lieu, convives, le brief arrive avant le devis.",
    "Funnel traiteur",
    "bg-sky-50 text-sky-800 ring-sky-200",
    "#0284C7",
    rentalSteps({
      title: "Votre événement",
      subtitle: "Date, lieu et nombre de convives",
      categoryLabel: "Type de prestation",
      categories: [
        { value: "cocktail", label: "Cocktail / standing" },
        { value: "seated", label: "Assis" },
        { value: "buffet", label: "Buffet" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Formules adaptées à votre brief",
    }),
  ),
  thin(
    "events_venue",
    "events",
    "form",
    "Chapiteaux & agence",
    "Durée, jauge, options — un brief événementiel, pas un appel.",
    "Funnel événementiel",
    "bg-sky-50 text-sky-800 ring-sky-200",
    "#0284C7",
    rentalSteps({
      title: "Votre événement",
      subtitle: "Jauge, lieu et durée",
      categoryLabel: "Type d’événement",
      categories: [
        { value: "tent", label: "Chapiteau / structure" },
        { value: "corporate", label: "Séminaire / soirée" },
        { value: "private", label: "Privé" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Structures et options de votre catalogue",
    }),
  ),
  thin(
    "events_catalog",
    "events",
    "catalog",
    "Catalogue événementiel",
    "Matériel, formules ou structures à parcourir.",
    "Catalogue événementiel",
    "bg-sky-50 text-sky-800 ring-sky-200",
    "#0284C7",
    catalogSteps(),
  ),
  {
    id: "fitout",
    family: "industry",
    defaultKind: "form",
    label: "Aménagement industriel",
    blurb: "Site, contraintes, gammes, vous rappelez pour proposer, pas pour découvrir.",
    defaultName: "Funnel aménagement",
    accent: "#4F46E5",
    tint: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    steps: [
      {
        title: "Le site",
        subtitle: "Usage et contraintes d’implantation",
        screen_type: "questions",
        questions: [
          {
            key: "site",
            label: "Type de site",
            help_text: null,
            type: "visual_choice",
            required: true,
            options: choices([
              { value: "warehouse", label: "Entrepôt / logistique" },
              { value: "workshop", label: "Atelier de production" },
              { value: "office", label: "Bureaux / vestiaires" },
              { value: "other", label: "Autre" },
            ]),
          },
          {
            key: "constraints",
            label: "Contraintes",
            help_text: "Plusieurs choix possibles",
            type: "multi_select",
            required: false,
            options: choices([
              { value: "food", label: "Normes alimentaires" },
              { value: "height", label: "Hauteur limitée" },
              { value: "access", label: "Accès / quai" },
              { value: "none", label: "Aucune particulière" },
            ]),
          },
        ],
      },
      suggestionsStep("Ensembles adaptés à votre site"),
      customizeStep,
      contactStep,
    ],
  },
  thin(
    "industry_parts",
    "industry",
    "form",
    "Pièces & sous-traitance",
    "Pièce, série, matière, délai — un brief atelier.",
    "Funnel pièces",
    "bg-indigo-50 text-indigo-800 ring-indigo-200",
    "#4F46E5",
    makeSteps({
      title: "Votre pièce",
      subtitle: "Série, matière et délai",
      pieceLabel: "Type de besoin",
      pieces: [
        { value: "proto", label: "Prototype", description: "Une pièce ou petite série" },
        { value: "series", label: "Série", description: "Production répétée" },
        { value: "repair", label: "Reprise / usinage" },
        { value: "other", label: "Autre" },
      ],
      materialLabel: "Matière",
      materials: [
        { value: "steel", label: "Acier" },
        { value: "alu", label: "Aluminium" },
        { value: "plastic", label: "Plastique" },
        { value: "open", label: "À conseiller" },
      ],
      suggestions: "Capacités et finitions de votre atelier",
    }),
  ),
  thin(
    "industry_packaging",
    "industry",
    "form",
    "Emballages",
    "Volume, matière, délai — une demande de conditionnement cadrée.",
    "Funnel emballages",
    "bg-indigo-50 text-indigo-800 ring-indigo-200",
    "#4F46E5",
    makeSteps({
      title: "Votre conditionnement",
      subtitle: "Volume, matière et délai",
      pieceLabel: "Type d’emballage",
      pieces: [
        { value: "box", label: "Carton / caisse" },
        { value: "film", label: "Film / sachet" },
        { value: "wood", label: "Caisse bois" },
        { value: "other", label: "Autre" },
      ],
      materialLabel: "Matière",
      materials: [
        { value: "cardboard", label: "Carton" },
        { value: "plastic", label: "Plastique" },
        { value: "wood", label: "Bois" },
        { value: "open", label: "À conseiller" },
      ],
      suggestions: "Solutions de votre catalogue",
    }),
  ),
  thin(
    "industry_lab",
    "industry",
    "form",
    "Labos & fabrication",
    "Série, contrainte, délai — un brief labo, pas un appel à vide.",
    "Funnel labo",
    "bg-indigo-50 text-indigo-800 ring-indigo-200",
    "#4F46E5",
    makeSteps({
      title: "Votre fabrication",
      subtitle: "Série, contrainte et délai",
      pieceLabel: "Type de besoin",
      pieces: [
        { value: "batch", label: "Lot / série" },
        { value: "custom", label: "Formule sur mesure" },
        { value: "pack", label: "Conditionnement" },
        { value: "other", label: "Autre" },
      ],
      materialLabel: "Contrainte principale",
      materials: [
        { value: "iso", label: "Norme / ISO" },
        { value: "food", label: "Alimentaire / cosmétique" },
        { value: "delay", label: "Délai court" },
        { value: "open", label: "À préciser" },
      ],
      suggestions: "Prestations adaptées à votre brief",
    }),
  ),
  thin(
    "services_spaces",
    "services",
    "form",
    "Location d’espaces",
    "Durée, jauge, usage — coworking, salle ou studio partagent le même brief.",
    "Funnel espaces",
    "bg-violet-50 text-violet-800 ring-violet-200",
    "#7C3AED",
    rentalSteps({
      title: "Votre réservation",
      subtitle: "Usage, jauge et durée",
      categoryLabel: "Type d’espace",
      categories: [
        { value: "cowork", label: "Coworking / bureau" },
        { value: "meeting", label: "Salle de réunion" },
        { value: "event", label: "Salle événementielle" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Espaces disponibles",
    }),
  ),
  thin(
    "services_training",
    "services",
    "form",
    "Formation",
    "Besoin, volume, échéance — un brief pédagogique cadré.",
    "Funnel formation",
    "bg-violet-50 text-violet-800 ring-violet-200",
    "#7C3AED",
    serviceSteps({
      title: "Votre formation",
      subtitle: "Public, format et échéance",
      needLabel: "Format souhaité",
      needs: [
        { value: "intra", label: "Intra-entreprise" },
        { value: "inter", label: "Inter / catalogue" },
        { value: "online", label: "Distanciel" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Parcours de votre catalogue",
    }),
  ),
  thin(
    "services_studio",
    "services",
    "form",
    "Studio & imprimerie",
    "Besoin, volume, échéance — un brief prod, pas un cahier flou.",
    "Funnel studio",
    "bg-violet-50 text-violet-800 ring-violet-200",
    "#7C3AED",
    serviceSteps({
      title: "Votre projet",
      subtitle: "Support, volume et échéance",
      needLabel: "Type de besoin",
      needs: [
        { value: "print", label: "Impression" },
        { value: "photo", label: "Studio / shooting" },
        { value: "sign", label: "Signalétique" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Prestations de votre catalogue",
    }),
  ),
  thin(
    "property_developer",
    "property",
    "form",
    "Promoteur",
    "Type de bien, échéance, le prospect cadre avant le RDV.",
    "Funnel promoteur",
    "bg-stone-100 text-stone-800 ring-stone-200",
    "#78716C",
    serviceSteps({
      title: "Votre projet",
      subtitle: "Type de bien et échéance",
      needLabel: "Type de projet",
      needs: [
        { value: "new", label: "Programme neuf" },
        { value: "invest", label: "Investissement" },
        { value: "residence", label: "Résidence principale" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Programmes adaptés",
    }),
  ),
  thin(
    "property_architect",
    "property",
    "form",
    "Architecte / BET",
    "Mission, volume, échéance — un brief de mission, pas un appel à vide.",
    "Funnel architecte",
    "bg-stone-100 text-stone-800 ring-stone-200",
    "#78716C",
    serviceSteps({
      title: "Votre mission",
      subtitle: "Type de mission et échéance",
      needLabel: "Type de mission",
      needs: [
        { value: "design", label: "Conception / PC" },
        { value: "site", label: "Suivi de chantier" },
        { value: "study", label: "Étude / BET" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Missions types",
    }),
  ),
  thin(
    "property_surveyor",
    "property",
    "form",
    "Géomètre",
    "Type de levé, délai — une demande technique cadrée.",
    "Funnel géomètre",
    "bg-stone-100 text-stone-800 ring-stone-200",
    "#78716C",
    serviceSteps({
      title: "Votre levé",
      subtitle: "Type de mission et échéance",
      needLabel: "Type de levé",
      needs: [
        { value: "boundary", label: "Bornage / division" },
        { value: "topo", label: "Topographie" },
        { value: "copro", label: "Copropriété" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Prestations adaptées",
    }),
  ),
  thin(
    "health_clinic",
    "health",
    "form",
    "Clinique esthétique",
    "Acte, style, budget — le prospect se qualifie avant le bilan.",
    "Funnel clinique",
    "bg-emerald-50 text-emerald-800 ring-emerald-200",
    "#059669",
    projectSteps({
      title: "Votre projet",
      subtitle: "Acte, attente et budget",
      typeLabel: "Type d’acte",
      types: [
        { value: "face", label: "Visage" },
        { value: "body", label: "Silhouette" },
        { value: "skin", label: "Peau / laser" },
        { value: "other", label: "Autre" },
      ],
      styleLabel: "Objectif",
      styles: [
        { value: "natural", label: "Naturel" },
        { value: "marked", label: "Plus marqué" },
        { value: "undecided", label: "À préciser en bilan" },
      ],
      suggestions: "Actes adaptés à votre brief",
    }),
  ),
  thin(
    "health_equipment",
    "health",
    "form",
    "Équipement médical",
    "Espace, contraintes, volume — un brief d’équipement.",
    "Funnel équipement médical",
    "bg-emerald-50 text-emerald-800 ring-emerald-200",
    "#059669",
    equipSteps({
      title: "Votre équipement",
      subtitle: "Espace et contraintes",
      spaceLabel: "Type d’espace",
      spaces: [
        { value: "cabinet", label: "Cabinet" },
        { value: "clinic", label: "Clinique / bloc" },
        { value: "home", label: "Domicile / EHPAD" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Équipements adaptés",
    }),
  ),
  thin(
    "tech_agency",
    "tech",
    "form",
    "Agence / ESN",
    "Besoin, volume, échéance — un brief projet, pas un cahier flou.",
    "Funnel agence",
    "bg-slate-100 text-slate-800 ring-slate-200",
    "#334155",
    serviceSteps({
      title: "Votre projet",
      subtitle: "Besoin, volume et échéance",
      needLabel: "Type de besoin",
      needs: [
        { value: "web", label: "Site / produit" },
        { value: "staff", label: "Renfort / TMA" },
        { value: "data", label: "Data / SI" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Offres adaptées",
    }),
  ),
  thin(
    "tech_consulting",
    "tech",
    "form",
    "Conseil",
    "Sujet, volume, échéance — une mission cadrée.",
    "Funnel conseil",
    "bg-slate-100 text-slate-800 ring-slate-200",
    "#334155",
    serviceSteps({
      title: "Votre mission",
      subtitle: "Sujet et échéance",
      needLabel: "Type de mission",
      needs: [
        { value: "audit", label: "Audit / diagnostic" },
        { value: "transform", label: "Accompagnement" },
        { value: "interim", label: "Management de transition" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Missions types",
    }),
  ),
  thin(
    "tech_software",
    "tech",
    "form",
    "Logiciel sur mesure",
    "Besoin, volume, échéance — un brief produit.",
    "Funnel logiciel",
    "bg-slate-100 text-slate-800 ring-slate-200",
    "#334155",
    serviceSteps({
      title: "Votre logiciel",
      subtitle: "Besoin et échéance",
      needLabel: "Type de besoin",
      needs: [
        { value: "new", label: "Nouveau produit" },
        { value: "rebuild", label: "Refonte" },
        { value: "integrate", label: "Intégration" },
        { value: "other", label: "Autre" },
      ],
      suggestions: "Approches adaptées",
    }),
  ),
  {
    id: "general",
    family: "custom",
    defaultKind: "form",
    label: "Questionnaire générique",
    blurb: "Un funnel générique : cadrage, catalogue, contact. Vous affinez ensuite.",
    defaultName: "Nouveau funnel",
    accent: "#E85D04",
    tint: "bg-orange-50 text-orange-800 ring-orange-200",
    steps: [
      {
        title: "Votre projet",
        subtitle: "Quelques questions pour cadrer le besoin",
        screen_type: "questions",
        questions: [
          {
            key: "project_type",
            label: "Quel est votre projet ?",
            help_text: null,
            type: "text",
            required: true,
            options: { placeholder: "Décrivez en une phrase" },
          },
          {
            key: "timeline",
            label: "Échéance",
            help_text: null,
            type: "select",
            required: false,
            options: choices([
              { value: "asap", label: "Dès que possible" },
              { value: "month", label: "Dans le mois" },
              { value: "quarter", label: "Ce trimestre" },
              { value: "explore", label: "Je me renseigne" },
            ]),
          },
        ],
      },
      suggestionsStep("Produits de votre catalogue"),
      customizeStep,
      contactStep,
    ],
  },
  thin(
    "custom_catalog",
    "custom",
    "catalog",
    "Catalogue générique",
    "Parcours vitrine : rayons, fiches, une demande globale.",
    "Catalogue",
    "bg-orange-50 text-orange-800 ring-orange-200",
    "#E85D04",
    catalogSteps(),
  ),
];

const LEGACY: Record<string, string> = {
  rayonnage: "racking",
};

export function getFunnelTemplate(id: string) {
  const normalized = LEGACY[id] ?? id;
  return FUNNEL_TEMPLATES.find((t) => t.id === normalized) ?? FUNNEL_TEMPLATES.find((t) => t.id === "general")!;
}

export function templatesForFamily(family: FunnelFamilyId) {
  return FUNNEL_TEMPLATES.filter((template) => template.family === family);
}

export function defaultTemplateForFamily(family: FunnelFamilyId) {
  return templatesForFamily(family)[0] ?? getFunnelTemplate("general");
}

export function getTemplateFamily(id: string): FunnelFamily {
  return getFunnelFamily(getFunnelTemplate(id).family);
}
