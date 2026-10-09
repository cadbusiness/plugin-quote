export type MentionBasePro = "consentement" | "interet";
export type MentionHorsUE = "non" | "oui";

export type MentionInput = {
  societe?: string;
  adresse?: string;
  email?: string;
  dpo?: string;
  url?: string;
  suivi?: boolean;
  prospection?: boolean;
  basePro?: string;
  mesure?: boolean;
  duree?: number | string;
  soustraitants?: string;
  horsUE?: string;
  garanties?: string;
};

export type MentionResult = {
  courte: string;
  courteLength: number;
  complete: string;
  rappels: string[];
  duree: number;
};

export const MENTION_RGPD_DEFAULTS: Required<Omit<MentionInput, "basePro" | "horsUE" | "duree">> & {
  basePro: MentionBasePro;
  horsUE: MentionHorsUE;
  duree: number;
} = {
  societe: "Rayonnages Martin SAS",
  adresse: "",
  email: "rgpd@rayonnages-martin.fr",
  dpo: "",
  url: "rayonnages-martin.fr/confidentialite",
  suivi: true,
  prospection: true,
  basePro: "consentement",
  mesure: false,
  duree: 3,
  soustraitants: "l'éditeur de notre logiciel de demande de devis, notre CRM",
  horsUE: "non",
  garanties: "clauses contractuelles types de la Commission européenne",
};

function clean(value: unknown) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
}

function anneesTexte(n: number | string | undefined) {
  let d = Math.round(Number(n));
  if (!isFinite(d) || d < 1) d = 3;
  if (d > 10) d = 10;
  return { n: d, txt: d === 1 ? "1 an" : d + " ans" };
}

/** Mention courte + texte art. 13. Reprise de `buildMentions` du générateur HTML. */
export function buildMentions(input: MentionInput): MentionResult {
  const societe = clean(input.societe) || "Notre entreprise";
  const email = clean(input.email);
  const dpo = clean(input.dpo);
  const url = clean(input.url);
  const adresse = clean(input.adresse);
  const duree = anneesTexte(input.duree);
  const sous = clean(input.soustraitants);
  const rappels: string[] = [];

  let courte = "Vos données servent à établir votre devis";
  if (input.suivi) courte += " et à en assurer le suivi";
  courte += ". Responsable : " + societe + ".";
  courte += " Conservation " + duree.txt + " après notre dernier échange.";
  if (input.prospection) {
    courte +=
      input.basePro === "interet"
        ? " Offres liées à votre activité possibles, opposition à tout moment."
        : " Offres envoyées seulement si vous cochez la case.";
  }
  if (email) courte += " Vos droits : " + email + ".";
  if (url) courte += " Détails : " + url + ".";

  const lines: string[] = [];
  lines.push("Données collectées par notre formulaire de demande de devis");
  lines.push("");
  lines.push("Responsable de traitement : " + societe + (adresse ? ", " + adresse : "") + ".");
  if (dpo) lines.push("Délégué à la protection des données : " + dpo + ".");
  lines.push("");
  lines.push("Finalités et bases légales :");
  lines.push(
    "- établir le devis que vous nous demandez, sur la base de mesures précontractuelles prises à votre demande (article 6.1.b du RGPD) ;",
  );
  if (input.suivi) lines.push("- suivre votre demande et vous recontacter à son sujet, sur la même base ;");
  if (input.prospection) {
    if (input.basePro === "interet") {
      lines.push(
        "- vous adresser des offres en rapport avec votre activité professionnelle, sur la base de notre intérêt légitime (article 6.1.f du RGPD). Vous pouvez vous y opposer à tout moment, gratuitement, et dans chaque message ;",
      );
    } else {
      lines.push(
        "- vous adresser des offres ou notre newsletter, uniquement si vous avez coché la case prévue, sur la base de votre consentement (article 6.1.a du RGPD). Vous pouvez le retirer à tout moment ;",
      );
    }
  }
  if (input.mesure)
    lines.push("- mesurer l'audience du formulaire, uniquement si vous l'acceptez dans notre outil de gestion des cookies ;");
  lines.push("");
  lines.push(
    "Données concernées : vos coordonnées (nom, email, téléphone, société), vos réponses au formulaire et les fichiers que vous joignez. Les champs nécessaires au devis sont signalés ; sans eux, nous ne pourrons pas vous répondre précisément.",
  );
  lines.push("");
  lines.push(
    "Destinataires : les membres de notre équipe chargés de votre demande" +
      (sous ? ", et nos prestataires qui les traitent pour notre compte : " + sous : "") +
      ". Nous ne vendons pas vos données.",
  );
  if (input.horsUE === "oui") {
    const garanties = clean(input.garanties);
    lines.push(
      "Certaines données peuvent être transférées hors de l'Union européenne" +
        (garanties ? ", avec les garanties suivantes : " + garanties : "") +
        ".",
    );
    if (!garanties)
      rappels.push(
        "Précisez les garanties prévues pour le transfert hors UE (décision d'adéquation, clauses contractuelles types...).",
      );
  }
  lines.push("");
  lines.push(
    "Durée de conservation : " +
      duree.txt +
      " à compter de notre dernier échange si votre demande n'aboutit pas. Si elle aboutit, vos données suivent la relation commerciale, et les pièces comptables sont conservées dix ans comme le prévoit le Code de commerce.",
  );
  lines.push("");
  lines.push(
    "Vos droits : accès, rectification, effacement, limitation, opposition et portabilité" +
      (email ? ", en écrivant à " + email : "") +
      ". Vous pouvez aussi introduire une réclamation auprès de la CNIL (cnil.fr).",
  );
  const complete = lines.join("\n");

  if (!email) rappels.push("Ajoutez un email pour exercer ses droits : c'est une mention obligatoire.");
  if (courte.length > 320)
    rappels.push("La mention courte dépasse 320 caractères : raccourcissez la raison sociale ou retirez l'adresse de la page.");
  if (input.prospection && input.basePro === "interet")
    rappels.push(
      "L'intérêt légitime ne vaut que pour des professionnels et des offres en rapport avec leur activité. Pour des particuliers, il faut un consentement.",
    );
  if (input.prospection) rappels.push("Chaque email de prospection doit permettre de se désinscrire simplement.");
  if (input.mesure) rappels.push("Vérifiez que vos outils de mesure ne se chargent qu'après le choix du visiteur.");
  rappels.push("Prévoyez une revue régulière des vieilles demandes pour appliquer la durée de " + duree.txt + ".");

  return { courte, courteLength: courte.length, complete, rappels, duree: duree.n };
}
