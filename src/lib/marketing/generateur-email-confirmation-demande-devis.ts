export type ConfirmationUnite = "jours" | "heures";
export type ConfirmationEtape = "appel" | "email" | "visite" | "devis";
export type ConfirmationFormat = "quotebuilder" | "neutre";
export type ConfirmationTone = "ok" | "bad" | "warn" | "info";

export type ConfirmationEmailInput = {
  entreprise?: unknown;
  signataire?: unknown;
  email?: unknown;
  telephone?: unknown;
  delai?: unknown;
  unite?: unknown;
  delaiReel?: unknown;
  etape?: unknown;
  reprise?: unknown;
  pdf?: unknown;
  fourchette?: unknown;
  suivi?: unknown;
  membres?: unknown;
  format?: unknown;
  delaiRassurant?: unknown;
};

export type NormalizedConfirmation = {
  entreprise: string;
  signataire: string;
  email: string;
  telephone: string;
  delai: number;
  unite: ConfirmationUnite;
  delaiReel: number;
  etape: ConfirmationEtape;
  reprise: string;
  pdf: boolean;
  fourchette: boolean;
  suivi: boolean;
  membres: boolean;
  format: ConfirmationFormat;
  delaiRassurant: number;
};

export type ConfirmationCheck = { tone: ConfirmationTone; text: string };
export type ConfirmationVerdict = { tone: Exclude<ConfirmationTone, "info">; text: string };

export type ConfirmationEmailResult = {
  subject: string;
  body: string;
  recap: string;
  words: number;
  lines: number;
  checks: ConfirmationCheck[];
  verdict: ConfirmationVerdict;
  input: NormalizedConfirmation;
};

export const CONFIRMATION_EMAIL_DEFAULTS: NormalizedConfirmation = {
  entreprise: "Atelier Martin",
  signataire: "Claire, service devis",
  email: "devis@atelier-martin.fr",
  telephone: "01 23 45 67 89",
  delai: 2,
  unite: "jours",
  delaiReel: 2,
  etape: "appel",
  reprise: "",
  pdf: true,
  fourchette: true,
  suivi: true,
  membres: false,
  format: "quotebuilder",
  delaiRassurant: 48,
};

const VARS = {
  quotebuilder: {
    nom: "{{contact_name}}",
    projet: "{{suggestion_name}}",
    prix: "{{price_range}}",
    suivi: "{{suivi_url}}",
    pin: "{{pin}}",
    membres: "{{membres_url}}",
  },
  neutre: {
    nom: "[Prénom Nom]",
    projet: "[Projet demandé]",
    prix: "[Fourchette indicative]",
    suivi: "[Lien de suivi]",
    pin: "[Code]",
    membres: "[Lien espace client]",
  },
} as const;

const ETAPES: Record<ConfirmationEtape, (delay: string) => string> = {
  appel: (delay) => `Un membre de l'équipe vous appelle${delay} pour valider votre besoin.`,
  email: (delay) => `Nous vous écrivons${delay} avec nos questions sur votre projet.`,
  visite: (delay) =>
    `Pour ce type de projet, nous passons par une visite sur site avant de chiffrer. Nous vous proposons un créneau${delay}.`,
  devis: (delay) => `Vous recevez votre devis chiffré${delay}.`,
};

function cleanText(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/[\u2013\u2014]/g, ",")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function cleanInt(value: unknown, max: number) {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return 0;
  const rounded = Math.round(n);
  return rounded > max ? max : rounded;
}

function cleanBool(value: unknown) {
  return value === true || value === "true" || value === "on" || value === 1 || value === "1";
}

export function fmtDelai(n: number, unite: string) {
  if (unite === "heures") return `${n}\u00a0heure${n > 1 ? "s" : ""} ouvrée${n > 1 ? "s" : ""}`;
  return `${n}\u00a0jour${n > 1 ? "s" : ""} ouvré${n > 1 ? "s" : ""}`;
}

export function countWords(text: string) {
  const matches = text.match(/[A-Za-zÀ-ÿ0-9{}_@.[\]]+/g);
  return matches ? matches.length : 0;
}

export function normalize(input: ConfirmationEmailInput | null | undefined): NormalizedConfirmation {
  const source = input ?? {};
  const unite: ConfirmationUnite = source.unite === "heures" ? "heures" : "jours";
  const etape: ConfirmationEtape =
    source.etape === "email" || source.etape === "visite" || source.etape === "devis" || source.etape === "appel"
      ? source.etape
      : "appel";
  const format: ConfirmationFormat = source.format === "neutre" ? "neutre" : "quotebuilder";
  return {
    entreprise: cleanText(source.entreprise),
    signataire: cleanText(source.signataire),
    email: cleanText(source.email),
    telephone: cleanText(source.telephone),
    delai: cleanInt(source.delai, 99),
    unite,
    delaiReel: cleanInt(source.delaiReel, 99),
    etape,
    reprise: cleanText(source.reprise).slice(0, 40),
    pdf: cleanBool(source.pdf),
    fourchette: cleanBool(source.fourchette),
    suivi: cleanBool(source.suivi),
    membres: cleanBool(source.membres),
    format,
    delaiRassurant: cleanInt(source.delaiRassurant, 999),
  };
}

export function buildConfirmationEmail(input?: ConfirmationEmailInput | null): ConfirmationEmailResult {
  const options = normalize(input);
  const vars = VARS[options.format];
  let subject: string;
  if (options.reprise) subject = `Demande reçue, réponse à partir du ${options.reprise}`;
  else if (options.entreprise) subject = `Demande de devis reçue, ${options.entreprise}`;
  else subject = "Votre demande de devis est bien reçue";

  const lines: string[] = [];
  lines.push(`Bonjour ${vars.nom},`);
  lines.push("");
  lines.push(`Nous avons bien reçu votre demande : ${vars.projet}.`);
  if (options.pdf && options.fourchette) {
    lines.push(
      `Vous trouverez en pièce jointe le récapitulatif de vos réponses, avec une fourchette indicative (${vars.prix}). Ce n'est pas encore un devis.`,
    );
  } else if (options.pdf) {
    lines.push("Vous trouverez en pièce jointe le récapitulatif de vos réponses.");
  } else if (options.fourchette) {
    lines.push(`Fourchette indicative : ${vars.prix}. Ce n'est pas encore un devis.`);
  }
  lines.push("");
  if (options.reprise) {
    lines.push(
      `Notre équipe est absente pour le moment : nous traitons les demandes dans l'ordre d'arrivée à partir du ${options.reprise}.`,
    );
  }
  const delay = options.delai > 0 ? ` sous ${fmtDelai(options.delai, options.unite)}` : "";
  lines.push(ETAPES[options.etape](delay));
  lines.push("");
  if (options.suivi) {
    lines.push(`Un plan, une photo ou une précision à ajouter ? Ouvrez votre demande : ${vars.suivi}`);
    lines.push(`Code PIN : ${vars.pin}`);
  } else {
    lines.push("Un plan, une photo ou une précision à ajouter ? Répondez simplement à ce message.");
  }
  if (options.membres) lines.push(`Tous vos devis : ${vars.membres}`);
  const contacts = [options.email, options.telephone].filter((item) => item);
  if (contacts.length) {
    lines.push("");
    lines.push(`Une question d'ici là : ${contacts.join(" ou ")}.`);
  }
  lines.push("");
  const signature =
    options.signataire && options.entreprise
      ? `${options.signataire}, ${options.entreprise}`
      : options.signataire || options.entreprise || "[Signature]";
  lines.push(signature);
  const body = lines.join("\n");

  const checks: ConfirmationCheck[] = [];
  if (options.delai === 0) {
    checks.push({ tone: "bad", text: "Aucun délai annoncé : le client ne sait pas quand il aura une réponse." });
  } else if (options.delaiReel === 0) {
    checks.push({
      tone: "warn",
      text: `Délai réel non renseigné : mesurez-le sur vos dernières demandes avant de promettre ${fmtDelai(options.delai, options.unite)}.`,
    });
  } else if (options.delaiReel > options.delai) {
    checks.push({
      tone: "bad",
      text: `Vous promettez ${fmtDelai(options.delai, options.unite)} alors que votre délai tenu est de ${fmtDelai(options.delaiReel, options.unite)}. Annoncez le délai tenu, ou réduisez-le d'abord.`,
    });
  } else {
    checks.push({ tone: "ok", text: "Le délai annoncé couvre le délai que votre équipe tient." });
  }

  if (options.format === "quotebuilder" && options.delai > 0 && options.delaiRassurant > 0) {
    const promisHeures = options.unite === "heures" ? options.delai : options.delai * 24;
    if (promisHeures !== options.delaiRassurant) {
      checks.push({
        tone: "warn",
        text: `L'email rassurant annonce ${options.delaiRassurant}\u00a0h, la confirmation ${fmtDelai(options.delai, options.unite)} : alignez les deux textes dans Paramètres, rubrique Emails.`,
      });
    } else {
      checks.push({ tone: "ok", text: "La confirmation et l'email rassurant annoncent le même délai." });
    }
  }
  if (!options.signataire && !options.entreprise) {
    checks.push({ tone: "bad", text: "Pas de signature : ajoutez un prénom, un service ou le nom de l'entreprise." });
  }
  if (!options.email && !options.telephone) {
    checks.push({ tone: "warn", text: "Aucun contact direct : écrivez une adresse ou un numéro joignable dans le message." });
  }
  if (!options.suivi) {
    checks.push({
      tone: "info",
      text: "Sans lien de suivi, le client complète en répondant au message : vérifiez que la réponse arrive dans une boîte lue.",
    });
  }
  if (options.format === "quotebuilder" && !options.pdf) {
    checks.push({
      tone: "info",
      text: "Décochez aussi « Joindre le récapitulatif » sur l'étape d'envoi du Parcours demande.",
    });
  }
  if (options.format === "quotebuilder" && options.membres) {
    checks.push({ tone: "info", text: "Le lien {{membres_url}} reste vide tant qu'aucun espace membres n'est publié." });
  }
  if (options.reprise) checks.push({ tone: "info", text: "Pensez à remettre votre texte habituel à la reprise." });
  const words = countWords(body);
  if (words > 140) checks.push({ tone: "warn", text: `Message long (${words} mots) : visez moins de dix lignes de texte.` });
  checks.push({
    tone: "info",
    text: "Pas de score, de classement ni de réponses brutes dans ce message : ces informations restent internes.",
  });

  const hasBad = checks.some((check) => check.tone === "bad");
  const hasWarn = checks.some((check) => check.tone === "warn");
  const verdict: ConfirmationVerdict = hasBad
    ? { tone: "bad", text: "À corriger avant de publier." }
    : hasWarn
      ? { tone: "warn", text: "Utilisable, avec des points à vérifier." }
      : { tone: "ok", text: "Prêt à coller, après une demande de test." };

  return {
    subject,
    body,
    recap: `Objet : ${subject}\n\n${body}`,
    words,
    lines: body.split("\n").filter((line) => line.trim()).length,
    checks,
    verdict,
    input: options,
  };
}
