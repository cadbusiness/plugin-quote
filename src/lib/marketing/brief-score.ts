export type BriefScoreAnswers = {
  products: number | null;
  constraints: number | null;
  budget: number | null;
  urgency: number | null;
  fit: number | null;
};

export type BriefBand = "pending" | "hot" | "warm" | "cold" | "parking";

export type BriefScoreResult = {
  total: number;
  answered: number;
  band: BriefBand;
  label: string;
  text: string;
  tips: string[];
  partial: boolean;
};

const KEYS = ["products", "constraints", "budget", "urgency", "fit"] as const;

export function computeBriefScore(answers: BriefScoreAnswers): BriefScoreResult {
  const values = KEYS.map((key) => answers[key]);
  const answered = values.filter((value) => value !== null).length;
  const total = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);

  if (answered === 0) {
    return {
      total: 0,
      answered: 0,
      band: "pending",
      label: "En attente",
      text: "Répondez aux questions pour obtenir un score.",
      tips: ["Répondez aux cinq questions pour afficher une recommandation."],
      partial: false,
    };
  }

  if (total >= 80) {
    return {
      total,
      answered,
      band: "hot",
      label: "Hot",
      text: "Brief solide. Priorisez le chiffrage et nommez un owner.",
      tips: [
        "Confirmez réception et prochaines étapes dans l’heure.",
        "Si un détail manque encore, demandez-le dans le même fil (pas « on verra »).",
        "Planifiez la première relance dès l’envoi du devis.",
      ],
      partial: answered < 5,
    };
  }

  if (total >= 55) {
    return {
      total,
      answered,
      band: "warm",
      label: "Warm",
      text: "Correct, mais incomplet. Qualifiez avant un long chiffrage.",
      tips: [
        "Posez 2 ou 3 questions max (cotes, budget, délai).",
        "Proposez un pré-devis avec hypothèses écrites si besoin.",
        "Remontez en Hot dès que les réponses arrivent.",
      ],
      partial: answered < 5,
    };
  }

  if (total >= 30) {
    return {
      total,
      answered,
      band: "cold",
      label: "Cold",
      text: "Brief faible. Évitez de monopoliser un senior dessus.",
      tips: [
        "Renvoyez vers un parcours guidé plutôt qu’un pavé mail.",
        "Gardez une séquence de nurture légère.",
        "Revoir en hebdo : seuls les dossiers qui bougent remontent.",
      ],
      partial: answered < 5,
    };
  }

  return {
    total,
    answered,
    band: "parking",
    label: "Parking",
    text: "Trop flou ou hors cible. Protégez votre temps atelier.",
    tips: [
      "Réponse template polie, ou refuse soft si hors zone / hors offre.",
      "N’ouvrez pas un Excel de 40 lignes sur un score < 30.",
      "Notez pourquoi (fit, budget, complétude) pour calibrer plus tard.",
    ],
    partial: answered < 5,
  };
}
