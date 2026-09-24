import { SITE_URL } from "@/lib/marketing/site";

export const CHECKLIST_MENTIONS_ARTICLE = `${SITE_URL}/blog/mentions-obligatoires-devis-france`;

export type ChecklistMentionsTone = "neutral" | "ok" | "warn" | "bad";

export type ChecklistMentionsItem = {
  id: string;
  title: string;
  hint: string;
  /** Libellé recopié dans le récap des manques. */
  recapLabel: string;
};

export type ChecklistMentionsGroup = {
  id: string;
  title: string;
  items: readonly ChecklistMentionsItem[];
};

export const CHECKLIST_MENTIONS_GROUPS: readonly ChecklistMentionsGroup[] = [
  {
    id: "identite",
    title: "Identité & admin",
    items: [
      {
        id: "c1",
        title: "Raison sociale, forme, adresse",
        hint: "Dénomination claire de l’émetteur (et établissement si besoin).",
        recapLabel: "Raison sociale, forme juridique, adresse du siège",
      },
      {
        id: "c2",
        title: "SIRET / SIREN",
        hint: "Identifiant de la bonne entité du groupe.",
        recapLabel: "SIRET / SIREN affiché",
      },
      {
        id: "c3",
        title: "TVA (numéro / libellés)",
        hint: "Numéro intracommunautaire et mentions validées par l’expert-comptable.",
        recapLabel: "TVA (numéro et/ou libellés validés)",
      },
      {
        id: "c4",
        title: "Coordonnées + commercial",
        hint: "E-mail, téléphone, nom de l’interlocuteur.",
        recapLabel: "Coordonnées + commercial / estimateur",
      },
      {
        id: "c5",
        title: "Numéro et date du devis",
        hint: "Référence unique, date d’émission, version si itération.",
        recapLabel: "Numéro unique et date d’émission du devis",
      },
      {
        id: "c6",
        title: "Identité du client",
        hint: "Société, adresse, contact décideur / référence AO.",
        recapLabel: "Identité client (raison sociale, adresse, contact)",
      },
    ],
  },
  {
    id: "offre",
    title: "Offre (description & prix)",
    items: [
      {
        id: "c7",
        title: "Description claire",
        hint: "Désignation compréhensible, pas seulement une référence opaque.",
        recapLabel: "Description claire des prestations / produits",
      },
      {
        id: "c8",
        title: "Quantités, unités, exclusions",
        hint: "Ce qui est hors scope doit être écrit.",
        recapLabel: "Quantités, unités, exclusions / hypothèses",
      },
      {
        id: "c9",
        title: "Prix HT / TVA / TTC",
        hint: "Totaux stables, taux affichés, plusieurs taux si besoin.",
        recapLabel: "Prix HT, montant TVA, total TTC",
      },
      {
        id: "c10",
        title: "Remises explicites",
        hint: "Sur quoi porte la remise, jusqu’à quand.",
        recapLabel: "Remises explicites (base et montant)",
      },
      {
        id: "c11",
        title: "Options / variantes séparées",
        hint: "Évite le total ambigu après négociation.",
        recapLabel: "Options / variantes séparées du socle",
      },
    ],
  },
  {
    id: "cadre",
    title: "Cadre commercial",
    items: [
      {
        id: "c12",
        title: "Validité (date claire)",
        hint: "Date butoir, pas seulement « 30 jours » flous.",
        recapLabel: "Date de validité de l’offre",
      },
      {
        id: "c13",
        title: "Délais et conditions de démarrage",
        hint: "Fourchettes + prérequis (acompte, plans, accès).",
        recapLabel: "Délais d’exécution / livraison et conditions de démarrage",
      },
      {
        id: "c14",
        title: "Acompte / échéancier",
        hint: "Montant ou %, déclencheurs, solde.",
        recapLabel: "Acompte et/ou échéancier",
      },
      {
        id: "c15",
        title: "Conditions de paiement",
        hint: "Modes acceptés, délais de règlement.",
        recapLabel: "Conditions et modes de paiement",
      },
      {
        id: "c16",
        title: "CGV accessibles + version",
        hint: "Lien, annexe ou page espace prospect, datées.",
        recapLabel: "CGV accessibles (lien ou annexe) avec version",
      },
      {
        id: "c17",
        title: "Assurances / qualifications",
        hint: "Décennale, RC pro, RGE, Qualibat… selon le métier.",
        recapLabel: "Assurances / qualifications si pertinent au secteur",
      },
    ],
  },
  {
    id: "process",
    title: "Process (qualité d’envoi)",
    items: [
      {
        id: "c18",
        title: "Version courante unique",
        hint: "Pas trois PDF « final » dans la boîte mail.",
        recapLabel: "Une seule version courante envoyée au client",
      },
      {
        id: "c19",
        title: "Acceptation tracée",
        hint: "Mail, signature, bouton : sur la version affichée.",
        recapLabel: "Acceptation / signature tracée sur la bonne version",
      },
      {
        id: "c20",
        title: "Alignement devis → facture",
        hint: "Mêmes blocs d’identité et de TVA en aval.",
        recapLabel: "Alignement prévu devis → facture (identité, TVA, montants)",
      },
    ],
  },
];

export const CHECKLIST_MENTIONS_ITEMS: readonly ChecklistMentionsItem[] = CHECKLIST_MENTIONS_GROUPS.flatMap(
  (group) => group.items,
);

export type ChecklistMentionsResult = {
  total: number;
  done: number;
  pct: number;
  missing: readonly ChecklistMentionsItem[];
  alertTone: ChecklistMentionsTone;
  alert: string;
  tip: string;
  countLabel: string;
  pctLabel: string;
  recap: string;
};

export function computeChecklistMentions(checkedIds: readonly string[]): ChecklistMentionsResult {
  const checked = new Set(checkedIds);
  const total = CHECKLIST_MENTIONS_ITEMS.length;
  const missing = CHECKLIST_MENTIONS_ITEMS.filter((item) => !checked.has(item.id));
  const done = total - missing.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  let alertTone: ChecklistMentionsTone = "neutral";
  let alert = "";
  let tip = "";

  if (done === 0) {
    alertTone = "neutral";
    alert = "Cochez les items déjà présents sur votre template de devis.";
    tip = "Priorité typique : identité, SIRET, TVA, description, prix HT/TTC, validité, CGV.";
  } else if (pct < 50) {
    alertTone = "bad";
    alert = `Template incomplet · ${pct} % (${missing.length} manques).`;
    tip = "Corrigez le modèle une fois pour toutes. Ne comblez pas les trous devis par devis à la main.";
  } else if (pct < 85) {
    alertTone = "warn";
    alert = `Base correcte, encore des trous · ${pct} %.`;
    tip = "Vérifiez validité, acomptes, CGV versionnées et process d’acceptation sur la bonne version.";
  } else if (pct < 100) {
    alertTone = "warn";
    alert = `Presque complet · ${pct} %.`;
    tip = "Finalisez les derniers blocs, puis faites relire TVA / CGV / assurances par un professionnel.";
  } else {
    alertTone = "ok";
    alert = "Checklist complète · 100 % (rappel : pas une validation juridique).";
    tip = "Industrialisez : templates figés, champs obligatoires avant envoi, une version courante côté client.";
  }

  const lines = [
    "Récap checklist mentions devis France (B2B) - pédagogique",
    `Score : ${pct} % (${done}/${total})`,
    `Statut : ${alert}`,
    "",
  ];
  if (missing.length === 0) {
    lines.push("Aucun item manquant dans cette checklist.");
  } else {
    lines.push("Items manquants :");
    for (const item of missing) lines.push(`- ${item.recapLabel}`);
  }
  lines.push("");
  lines.push("Rappel : outil pédagogique, pas une validation juridique.");
  lines.push(`Article : ${CHECKLIST_MENTIONS_ARTICLE}`);

  return {
    total,
    done,
    pct,
    missing,
    alertTone,
    alert,
    tip,
    countLabel: `${done} / ${total} cochés`,
    pctLabel: `${pct} %`,
    recap: lines.join("\n"),
  };
}
