import type { Json } from "@/lib/db/database.types";
import type { TemplateStep } from "@/lib/funnels/templates";

function choices(items: { value: string; label: string; description?: string }[]): Json {
  return { choices: items };
}

const contactStep: TemplateStep = {
  title: "Vos coordonnées",
  subtitle: "Recevez le récapitulatif de votre projet",
  screen_type: "contact",
};

const customizeStep: TemplateStep = {
  title: "Personnalisation",
  subtitle: "Quantités, options et précisions",
  screen_type: "customize",
};

const suggestionsStep = (subtitle: string): TemplateStep => ({
  title: "Solutions recommandées",
  subtitle,
  screen_type: "suggestions",
});

export type Choice = { value: string; label: string; description?: string };

export function catalogSteps(): TemplateStep[] {
  return [
    {
      title: "Catalogue",
      subtitle: "Parcourez les gammes et ajoutez les produits au devis",
      screen_type: "suggestions",
    },
    {
      title: "Votre devis",
      subtitle: "Quantités, options et précisions",
      screen_type: "customize",
    },
    contactStep,
  ];
}

export function rentalSteps(copy: {
  title: string;
  subtitle: string;
  categoryLabel: string;
  categories: Choice[];
  suggestions: string;
}): TemplateStep[] {
  return [
    {
      title: copy.title,
      subtitle: copy.subtitle,
      screen_type: "questions",
      questions: [
        {
          key: "category",
          label: copy.categoryLabel,
          help_text: null,
          type: "visual_choice",
          required: true,
          options: choices(copy.categories),
        },
        {
          key: "duration",
          label: "Durée",
          help_text: null,
          type: "select",
          required: true,
          options: choices([
            { value: "day", label: "1 jour" },
            { value: "week", label: "Quelques jours" },
            { value: "month", label: "1 mois et +" },
          ]),
        },
        {
          key: "when",
          label: "Date ou lieu",
          help_text: "Approximatif si besoin",
          type: "text",
          required: false,
          options: { placeholder: "Ex. semaine du 14, Paris 11e" },
        },
      ],
    },
    suggestionsStep(copy.suggestions),
    customizeStep,
    contactStep,
  ];
}

export function makeSteps(copy: {
  title: string;
  subtitle: string;
  pieceLabel: string;
  pieces: Choice[];
  materialLabel: string;
  materials: Choice[];
  suggestions: string;
}): TemplateStep[] {
  return [
    {
      title: copy.title,
      subtitle: copy.subtitle,
      screen_type: "questions",
      questions: [
        {
          key: "project_type",
          label: copy.pieceLabel,
          help_text: null,
          type: "visual_choice",
          required: true,
          options: choices(copy.pieces),
        },
        {
          key: "material",
          label: copy.materialLabel,
          help_text: null,
          type: "select",
          required: false,
          options: choices(copy.materials),
        },
        {
          key: "quantity",
          label: "Volume ou quantité",
          help_text: "Ordre de grandeur",
          type: "text",
          required: false,
          options: { placeholder: "Ex. 2 000 pièces, 1 série proto" },
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
    suggestionsStep(copy.suggestions),
    customizeStep,
    contactStep,
  ];
}

export function serviceSteps(copy: {
  title: string;
  subtitle: string;
  needLabel: string;
  needs: Choice[];
  suggestions: string;
}): TemplateStep[] {
  return [
    {
      title: copy.title,
      subtitle: copy.subtitle,
      screen_type: "questions",
      questions: [
        {
          key: "project_type",
          label: copy.needLabel,
          help_text: null,
          type: "visual_choice",
          required: true,
          options: choices(copy.needs),
        },
        {
          key: "notes",
          label: "Contexte",
          help_text: "Objectif, contraintes, déjà en place",
          type: "text",
          required: false,
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
    suggestionsStep(copy.suggestions),
    customizeStep,
    contactStep,
  ];
}

export function projectSteps(copy: {
  title: string;
  subtitle: string;
  typeLabel: string;
  types: Choice[];
  styleLabel: string;
  styles: Choice[];
  suggestions: string;
}): TemplateStep[] {
  return [
    {
      title: copy.title,
      subtitle: copy.subtitle,
      screen_type: "questions",
      questions: [
        {
          key: "project_type",
          label: copy.typeLabel,
          help_text: null,
          type: "visual_choice",
          required: true,
          options: choices(copy.types),
        },
        {
          key: "style",
          label: copy.styleLabel,
          help_text: null,
          type: "select",
          required: false,
          options: choices(copy.styles),
        },
        {
          key: "budget",
          label: "Budget indicatif",
          help_text: "Fourchette, pas un devis",
          type: "select",
          required: false,
          options: choices([
            { value: "low", label: "À cadrer" },
            { value: "mid", label: "Intermédiaire" },
            { value: "high", label: "Premium" },
          ]),
        },
      ],
    },
    suggestionsStep(copy.suggestions),
    customizeStep,
    contactStep,
  ];
}

export function equipSteps(copy: {
  title: string;
  subtitle: string;
  spaceLabel: string;
  spaces: Choice[];
  suggestions: string;
}): TemplateStep[] {
  return [
    {
      title: copy.title,
      subtitle: copy.subtitle,
      screen_type: "questions",
      questions: [
        {
          key: "project_type",
          label: copy.spaceLabel,
          help_text: null,
          type: "visual_choice",
          required: true,
          options: choices(copy.spaces),
        },
        {
          key: "surface",
          label: "Surface ou volume",
          help_text: "Approximatif",
          type: "text",
          required: false,
          options: { placeholder: "Ex. 80 m², 12 box" },
        },
        {
          key: "constraints",
          label: "Contraintes",
          help_text: "Plusieurs choix possibles",
          type: "multi_select",
          required: false,
          options: choices([
            { value: "access", label: "Accès / livraison" },
            { value: "norm", label: "Norme ou agrément" },
            { value: "height", label: "Hauteur limitée" },
            { value: "none", label: "Aucune particulière" },
          ]),
        },
      ],
    },
    suggestionsStep(copy.suggestions),
    customizeStep,
    contactStep,
  ];
}
