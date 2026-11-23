export type Statut = "ok" | "warn" | "bad" | "info";

export type Controle = { point: string; statut: Statut; texte: string };

export type Normalized = {
  role: string;
  produit: string;
  couverture: string;
  regime: string;
  procede: string;
  pose: string;
  systeme: string;
  organisme: string;
  micro: string;
  dop: string;
  ce: string;
  remise: string;
  langue: string;
  perfDevis: string;
  date: Date | null;
};

export type MarquageResult = {
  x: Normalized;
  roleFab: boolean;
  roleImp: boolean;
  roleDist: boolean;
  couvert: boolean;
  derogCond: boolean;
  derogUsed: boolean;
  relevant: boolean;
  onNeeded: boolean;
  microS3: boolean;
  finConservation: Date | null;
  dopLabel: string;
  ceLabel: string;
  organismeLabel: string;
  conservationLabel: string;
  controles: Controle[];
  nbOk: number;
  nbWarn: number;
  nbBad: number;
  nbInfo: number;
  etat: "ok" | "warn" | "bad";
  verdict: string;
  actions: string[];
  clause: string;
  message: string;
  recap: string;
};

export const SLUG = "verificateur-marquage-ce-declaration-performances";
export const STATUT_LABELS: { [key: string]: string } = { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" };
export const POINTS: { id: string; label: string }[] = [
  { id: "role", label: "Votre rôle" },
  { id: "couverture", label: "Spécification harmonisée" },
  { id: "regime", label: "Règlement applicable" },
  { id: "derogation", label: "Dérogation du sur-mesure (article 5)" },
  { id: "organisme", label: "Système et organisme notifié" },
  { id: "dop", label: "Déclaration des performances" },
  { id: "ce", label: "Marquage CE" },
  { id: "remise", label: "Remise de la déclaration au client" },
  { id: "performances", label: "Performances écrites sur le devis" },
  { id: "conservation", label: "Conservation des documents" }
];
export const LABEL_SETS: { [key: string]: { [key: string]: string } } = {
  role: {
    fabricant: "Je le fabrique et le vends sous mon nom",
    marque: "Je le fais fabriquer et le vends sous mon nom ou ma marque",
    modifie: "J'achète un produit déjà marqué CE et je le modifie (recoupe, assemblage, vitrage changé)",
    importateur: "Je l'importe d'un pays hors de l'Union européenne",
    distributeur: "Je le revends tel quel, sous le nom du fabricant",
    poseur: "Je le pose sans le modifier, il est fourni par un fabricant"
  },
  produit: {
    fenetre: "Fenêtre ou porte extérieure pour piétons (NF EN 14351-1)",
    structure: "Élément de structure en acier ou en aluminium (NF EN 1090-1)",
    vitrage: "Vitrage isolant (NF EN 1279-5)",
    porte: "Porte industrielle, commerciale, de garage ou portail (NF EN 13241)",
    autre: "Autre produit de construction"
  },
  couverture: {
    norme: "Une norme harmonisée (citée au Journal officiel de l'UE)",
    ete: "Une évaluation technique européenne (ETE) obtenue pour lui",
    aucune: "Aucune spécification harmonisée",
    inconnu: "Je ne sais pas"
  },
  regime: {
    rpc2011: "Règlement 305/2011 (la norme n'a pas encore été remplacée)",
    rpc2024: "Règlement 2024/3110 (une nouvelle spécification est devenue obligatoire)",
    inconnu: "Je ne sais pas"
  },
  procede: {
    serie: "En atelier, par un procédé répété, même si les cotes changent à chaque commande",
    unique: "Pièce unique sur commande, procédé non répété",
    chantier: "Fabriqué sur le chantier, pour cet ouvrage",
    patrimoine: "Fabrication traditionnelle pour un bâtiment protégé"
  },
  pose: {
    oui: "Oui, c'est nous qui posons, chantier connu",
    non: "Non, le produit est livré au client ou à un poseur"
  },
  systeme: {
    s1plus: "Système 1+",
    s1: "Système 1",
    s2plus: "Système 2+",
    s3: "Système 3",
    s4: "Système 4",
    inconnu: "Je ne sais pas"
  },
  organisme: {
    oui: "Oui, j'ai son certificat ou son rapport d'essais",
    non: "Non"
  },
  micro: {
    oui: "Oui",
    non: "Non"
  },
  dop: {
    oui: "Oui",
    non: "Non"
  },
  ce: {
    oui: "Oui (sur le produit, l'étiquette, l'emballage ou les documents)",
    non: "Non"
  },
  remise: {
    papier: "Sur papier, avec la livraison",
    email: "Par voie électronique (PDF par e-mail)",
    site: "Sur notre site internet, avec le lien et le code du produit type",
    non: "Non, elle n'est pas remise"
  },
  langue: {
    fr: "Français",
    autre: "Une autre langue seulement"
  },
  perfDevis: {
    aucune: "Aucune",
    dop: "Seulement celles de la déclaration des performances",
    horsdop: "Des valeurs qui ne figurent pas dans la déclaration"
  }
};
export const DEFAULTS: { [key: string]: string } = {
  role: "fabricant",
  produit: "fenetre",
  couverture: "norme",
  regime: "rpc2011",
  procede: "serie",
  pose: "oui",
  systeme: "s3",
  organisme: "oui",
  micro: "oui",
  dateMiseMarche: "2027-03-15",
  dop: "oui",
  ce: "oui",
  remise: "non",
  langue: "fr",
  perfDevis: "horsdop"
};
export const CONSERVATION_ANS = 10;
export const SYSTEMES_ORGANISME: string[] = ["s1plus", "s1", "s2plus", "s3"];
export const SYSTEME_NOM: { [key: string]: string } = { s1plus: "1+", s1: "1", s2plus: "2+", s3: "3", s4: "4" };
export const PIECE_ORGANISME: { [key: string]: string } = {
  s1plus: "certificat de constance des performances",
  s1: "certificat de constance des performances",
  s2plus: "certificat du contrôle de la production en usine",
  s3: "rapport d'essais d'un laboratoire notifié"
};
export const PRODUIT_COURT: { [key: string]: string } = {
  fenetre: "fenêtre ou porte extérieure pour piétons, NF EN 14351-1",
  structure: "élément de structure en acier ou en aluminium, NF EN 1090-1",
  vitrage: "vitrage isolant, NF EN 1279-5",
  porte: "porte industrielle, commerciale, de garage ou portail, NF EN 13241",
  autre: "produit de construction"
};
const MOIS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export function parseDate(s: unknown): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
  if (!m) return null;
  const y = +m[1], mo = +m[2] - 1, d = +m[3];
  const dt = new Date(Date.UTC(y, mo, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo || dt.getUTCDate() !== d) return null;
  return dt;
}
export function isoDate(d: Date | null): string {
  if (!d) return "";
  const mm = d.getUTCMonth() + 1, dd = d.getUTCDate();
  return d.getUTCFullYear() + "-" + (mm < 10 ? "0" : "") + mm + "-" + (dd < 10 ? "0" : "") + dd;
}
function lastDay(y: number, m: number): number { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
export function addYears(d: Date, n: number): Date {
  const y = d.getUTCFullYear() + n, m = d.getUTCMonth();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), lastDay(y, m))));
}
export function fmtDate(d: Date | null): string {
  if (!d) return "date non renseignée";
  const j = d.getUTCDate();
  return (j === 1 ? "1er" : String(j)) + " " + MOIS_FR[d.getUTCMonth()] + " " + d.getUTCFullYear();
}
export function pluriel(n: number, sing: string, plur?: string): string { return n + " " + (n > 1 ? (plur || sing + "s") : sing); }
function pick(v: string, set: { [key: string]: string }, def: string): string { return Object.prototype.hasOwnProperty.call(set, v) ? v : def; }

export function normalize(raw: Record<string, unknown> | null | undefined): Normalized {
  const r = (raw ?? {}) as Record<string, unknown>;
  const x: { [key: string]: string | Date | null } = {};
  Object.keys(LABEL_SETS).forEach(function (k) {
    const value = r[k];
    x[k] = pick(String(value == null ? "" : value).trim(), LABEL_SETS[k], DEFAULTS[k]);
  });
  x.date = parseDate(r.dateMiseMarche);
  return x as Normalized;
}

export function verifierMarquage(raw: Record<string, unknown> | null | undefined): MarquageResult {
  const x = normalize(raw);
  const roleFab = x.role === "fabricant" || x.role === "marque" || x.role === "modifie";
  const roleImp = x.role === "importateur";
  const roleDist = x.role === "distributeur" || x.role === "poseur";
  const poseur = x.role === "poseur";
  const couvert = x.couverture !== "aucune";
  const derogCond = roleFab && (x.couverture === "norme" || x.couverture === "inconnu") &&
    ((x.procede === "unique" && x.pose === "oui") || x.procede === "chantier" || x.procede === "patrimoine");
  const derogUsed = derogCond && x.dop === "non";
  const relevant = couvert && !derogUsed;
  const onNeeded = SYSTEMES_ORGANISME.indexOf(x.systeme) >= 0;
  const microS3 = x.micro === "oui" && x.systeme === "s3" && x.regime !== "rpc2024";
  const sys = SYSTEME_NOM[x.systeme] || "";
  const fin = x.date ? addYears(x.date, CONSERVATION_ANS) : null;
  const c: Controle[] = [];
  function add(statut: Statut, texte: string) { c.push({ point: POINTS[c.length].label, statut: statut, texte: texte }); }

  // 1. Rôle
  const ROLE_TXT: { [key: string]: string } = {
    fabricant: "Vous êtes le fabricant : la déclaration, le marquage CE et la documentation technique vous incombent (article 11).",
    marque: "Vous vendez sous votre nom un produit fabriqué par un autre : vous êtes le fabricant au sens du règlement (articles 2 et 15) et vous portez ses obligations.",
    modifie: "Vous modifiez un produit déjà mis sur le marché d'une façon qui peut changer ses performances : vous devenez le fabricant (article 15), et la déclaration du fournisseur ne couvre plus le produit modifié.",
    importateur: "Vous importez : avant la mise sur le marché, vous vérifiez que le fabricant a fait l'évaluation, établi la déclaration et apposé le marquage CE, et vous gardez une copie de la déclaration pendant dix ans (article 13).",
    distributeur: "Vous revendez : vous vérifiez que le produit porte le marquage CE et arrive avec sa déclaration et ses instructions en français (article 14).",
    poseur: "Vous posez un produit fourni par un fabricant, sans le modifier : par prudence, vérifiez le marquage CE et transmettez la déclaration du fabricant comme le ferait un distributeur (article 14)."
  };
  add("info", ROLE_TXT[x.role]);

  // 2. Couverture
  const normeTxt = x.produit === "autre" ? "une norme harmonisée" : "une norme harmonisée (" + PRODUIT_COURT[x.produit].split(", ").pop() + ")";
  if (x.couverture === "norme") add("ok", "Le produit est couvert par " + normeTxt + " : le régime de la déclaration des performances s'applique (article 4).");
  else if (x.couverture === "ete") add("ok", "Une évaluation technique européenne a été délivrée pour le produit : la déclaration est obligatoire, et la dérogation de l'article 5 ne joue pas.");
  else if (x.couverture === "aucune") add("info", "Aucune spécification harmonisée : pas de déclaration des performances ni de marquage CE au titre du règlement. Les règles nationales et vos garanties s'appliquent toujours.");
  else add("warn", "À vérifier avant tout : cherchez si une norme harmonisée couvre votre produit. L'outil raisonne ici comme si c'était le cas, par prudence.");

  // 3. Règlement applicable
  if (!couvert) add("info", "Sans objet sans spécification harmonisée.");
  else if (x.regime === "rpc2011") add("info", "Aucune nouvelle spécification n'est obligatoire pour votre famille : les règles de la déclaration des performances et du marquage CE du règlement 305/2011 continuent de s'appliquer, jusqu'à son abrogation complète le 8 janvier 2040 (article 95 du règlement 2024/3110).");
  else if (x.regime === "rpc2024") add("info", "Une spécification du règlement 2024/3110 est devenue obligatoire pour votre famille : la déclaration devient une déclaration des performances et de conformité, plus complète, et la dérogation du sur-mesure figure à son article 14. L'outil suit les principes communs aux deux textes ; vérifiez le détail dans le règlement 2024/3110.");
  else add("warn", "À vérifier : le règlement 2024/3110 s'applique famille par famille, un an après l'acte qui rend obligatoire la nouvelle spécification (article 95, paragraphe 9). Tant que rien n'est obligatoire pour votre famille, c'est le règlement 305/2011.");

  // 4. Dérogation
  if (!roleFab) add("info", "La dérogation ne concerne que le fabricant. Celui qui revend ou pose transmet les documents du fabricant.");
  else if (!couvert) add("info", "Sans objet sans spécification harmonisée.");
  else if (x.couverture === "ete") add("info", "Pas de dérogation pour un produit qui a fait l'objet d'une évaluation technique européenne : l'article 5 vise les produits couverts par une norme harmonisée.");
  else if (derogCond) {
    let cas = x.procede === "unique"
      ? "Les conditions de l'article 5 a) sont réunies d'après vos réponses : pièce unique fabriquée sur commande par un procédé non répété, posée par vous dans un ouvrage identifié."
      : x.procede === "chantier"
        ? "Les conditions de l'article 5 b) sont réunies d'après vos réponses : produit fabriqué sur le chantier pour être incorporé à cet ouvrage."
        : "Les conditions de l'article 5 c) sont réunies d'après vos réponses : fabrication traditionnelle, non industrielle, pour rénover un bâtiment officiellement protégé.";
    cas += " Vous pouvez vous dispenser de la déclaration si aucune règle nationale ou européenne n'exige de déclarer ses caractéristiques là où il est posé.";
    if (x.dop === "oui") cas += " Vous avez quand même établi une déclaration : elle vous engage, et le marquage CE devient obligatoire.";
    add("ok", cas);
  } else if (x.procede === "serie") add("info", "Pas de dérogation : un produit fabriqué par un procédé répété relève de la production en série, même fait sur mesure. La déclaration est obligatoire.");
  else add("info", "Pas de dérogation : la pièce est unique, mais vous ne la posez pas vous-même dans un ouvrage identifié. La déclaration est obligatoire.");

  // 5. Système et organisme notifié
  if (!relevant) add("info", "Sans objet : aucune déclaration des performances n'est en jeu.");
  else if (roleDist) add("info", "Affaire du fabricant : vous n'avez pas à faire intervenir d'organisme notifié.");
  else if (x.systeme === "inconnu") add("warn", "Cherchez le système dans l'annexe ZA de la norme, ou dans l'évaluation technique européenne : il dit qui fait quoi entre le fabricant et l'organisme notifié.");
  else if (x.systeme === "s4") add("ok", "Système 4 : le fabricant détermine lui-même le produit type et tient son contrôle de la production en usine, sans organisme notifié.");
  else if (x.organisme === "oui") add("ok", "Système " + sys + " : l'organisme notifié est intervenu (" + PIECE_ORGANISME[x.systeme] + "). Son numéro figure dans la déclaration et à côté du marquage CE.");
  else if (microS3 && roleFab) add("warn", "Système 3 sans laboratoire notifié : une microentreprise peut traiter le produit selon le système 4 (article 37 du règlement 305/2011), à condition de justifier ce choix dans une documentation technique spécifique et de démontrer l'équivalence des méthodes.");
  else if (roleImp) add("bad", "Le système " + sys + " exige un organisme notifié : en tant qu'importateur, ne mettez pas le produit sur le marché tant que le fabricant ne l'a pas fait intervenir (article 13).");
  else add("bad", "Le système " + sys + " exige l'intervention d'un organisme notifié (" + PIECE_ORGANISME[x.systeme] + ") avant la déclaration. Sans elle, la déclaration ne tient pas.");

  // 6. Déclaration des performances
  if (!couvert) {
    if (x.dop === "oui") add("info", "Un document qui décrit vos performances reste utile, mais ce n'est pas une déclaration des performances au sens du règlement : ne l'appelez pas ainsi et n'y associez pas de marquage CE.");
    else add("info", "Pas de déclaration à établir au titre du règlement.");
  } else if (derogUsed) add("ok", "Pas de déclaration : c'est permis par la dérogation. Gardez la trace des conditions (commande, ouvrage, pose par vous).");
  else if (roleFab) {
    if (x.dop === "oui") add("ok", "Déclaration établie : vous assumez les performances déclarées (article 4, paragraphe 3). Elle suit le modèle de l'annexe III : produit type, usage prévu, système, norme, performances, et NPD pour les caractéristiques non déclarées.");
    else add("bad", "Déclaration manquante : elle est obligatoire dès la mise sur le marché (article 4). Établissez-la avant de livrer.");
  } else if (roleImp) {
    if (x.dop === "oui") add("ok", "Le fabricant a établi la déclaration : gardez-en une copie.");
    else add("bad", "Sans déclaration du fabricant, ne mettez pas le produit sur le marché (article 13).");
  } else if (x.dop === "oui") add("ok", "Vous avez la déclaration du fabricant.");
  else if (poseur) add("warn", "Demandez la déclaration au fournisseur avant la pose : le maître d'ouvrage ou le contrôleur la réclamera.");
  else add("bad", "Sans déclaration du fabricant, ne livrez pas le produit : demandez-la-lui (article 14).");

  // 7. Marquage CE
  if (!couvert) {
    if (x.ce === "oui") add("bad", "Marquage CE sans spécification harmonisée ni évaluation technique européenne : il n'a pas de base, retirez-le.");
    else add("ok", "Pas de marquage CE : c'est normal sans spécification harmonisée.");
  } else if (derogUsed) {
    if (x.ce === "oui") add("bad", "Marquage CE sans déclaration des performances : c'est interdit (article 8, paragraphe 2). Retirez-le ou établissez la déclaration.");
    else add("ok", "Pas de marquage CE : cohérent avec la dérogation.");
  } else if (roleFab) {
    if (x.dop === "oui" && x.ce === "oui") add("ok", "Marquage CE apposé : il suit la déclaration, avec l'année, le fabricant, le code du produit type, le numéro de la déclaration, les performances, la norme, l'organisme notifié le cas échéant et l'usage prévu (article 9).");
    else if (x.dop === "oui") add("bad", "Déclaration établie mais pas de marquage CE : il est obligatoire (article 8), sur le produit, une étiquette, l'emballage ou les documents d'accompagnement.");
    else if (x.ce === "oui") add("bad", "Marquage CE sans déclaration des performances : c'est interdit (article 8, paragraphe 2).");
    else add("bad", "Ni déclaration ni marquage CE : les deux sont obligatoires pour ce produit.");
  } else if (x.ce === "oui") add("ok", "Le produit porte le marquage CE.");
  else if (poseur) add("warn", "Produit sans marquage CE : faites-le confirmer par le fournisseur avant la pose.");
  else add("bad", "Produit sans marquage CE : ne le mettez pas à disposition (articles 13 et 14).");

  // 8. Remise
  if (!relevant) add("info", "Rien à remettre au titre du règlement. Donnez quand même au client vos fiches techniques et la notice.");
  else if (x.dop === "non") add(poseur ? "warn" : "bad", "Pas de déclaration à remettre : réglez d'abord le point précédent, puis envoyez-la au client.");
  else if (x.remise === "non") add(poseur ? "warn" : "bad", "La déclaration doit être fournie au client, sur papier ou par voie électronique (article 7), et sur papier s'il le demande." + (x.langue === "autre" ? " Elle doit aussi être en français (article 7, paragraphe 4)." : ""));
  else if (x.langue === "autre") add(poseur ? "warn" : "bad", "La déclaration doit être fournie dans la langue exigée par l'État où le produit est mis à disposition, en France le français (article 7, paragraphe 4).");
  else if (x.remise === "papier") add("ok", "Remise sur papier avec la livraison : conforme (article 7).");
  else if (x.remise === "email") add("ok", "Remise par voie électronique : conforme (article 7). Une copie papier reste due si le client la demande.");
  else add("ok", "Mise à disposition sur votre site : permise si son contenu ne change plus, si elle reste accessible gratuitement pendant dix ans et si le client reçoit le lien et le code du produit type (règlement délégué 157/2014).");

  // 9. Performances sur le devis
  if (x.perfDevis === "aucune") add("info", "Le devis n'annonce aucune performance : rien à vérifier ici. Si le client en demande, renvoyez à la déclaration ou à vos fiches.");
  else if (x.perfDevis === "dop") {
    if (relevant && x.dop === "oui") add("ok", "Les performances du devis reprennent la déclaration : c'est ce que demande l'article 4, paragraphe 2.");
    else if (relevant) add("bad", "Le devis cite les performances d'une déclaration qui n'existe pas encore : établissez-la ou obtenez-la avant d'envoyer le devis.");
    else add("ok", "Vous citez des performances documentées : gardez la preuve dans le dossier.");
  } else if (relevant) add("bad", "Le devis annonce des performances absentes de la déclaration : pour un produit couvert par une norme harmonisée ou une évaluation technique européenne, toute information sur ses caractéristiques essentielles doit venir de la déclaration (article 4, paragraphe 2). Retirez-les ou mettez la déclaration à jour.");
  else add("warn", "Sans déclaration, l'article 4 ne limite pas ce que vous écrivez, mais vous répondez de chaque valeur annoncée devant le client : gardez la preuve (essais, fiches des composants).");

  // 10. Conservation
  if (!couvert) add("info", "Sans objet au titre du règlement. Gardez vos preuves au moins pendant la durée de vos garanties.");
  else if (derogUsed) add("info", "Pas de déclaration à conserver. Gardez le dossier de l'ouvrage (commande, plans, preuves des performances) pendant la durée de vos garanties.");
  else if (!fin) add("warn", "Indiquez la date de livraison pour calculer la fin de conservation.");
  else if (roleDist) add("info", "Pas de durée imposée à votre rôle, mais gardez la déclaration du fabricant jusqu'au " + fmtDate(fin) + " : c'est la durée qui s'impose au fabricant.");
  else add("info", "Déclaration et documentation technique à garder jusqu'au " + fmtDate(fin) + " (dix ans après la mise sur le marché, article 11, paragraphe 2" + (roleImp ? ", et article 13, paragraphe 8" : "") + ").");

  let nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
  c.forEach(function (p) { if (p.statut === "ok") nbOk++; else if (p.statut === "warn") nbWarn++; else if (p.statut === "bad") nbBad++; else nbInfo++; });
  const etat: "ok" | "warn" | "bad" = nbBad ? "bad" : nbWarn ? "warn" : "ok";

  const dopLabel = !couvert ? "Hors champ du marquage CE"
    : derogUsed ? "Pas obligatoire (dérogation de l'article 5)"
    : !roleFab ? "Celle du fabricant, à transmettre"
    : derogCond ? "Établie volontairement, elle vous engage"
    : x.couverture === "inconnu" ? "Obligatoire si une norme couvre le produit"
    : "Obligatoire";
  const ceLabel = !couvert ? "Pas de marquage CE possible" : derogUsed ? "À ne pas apposer sans déclaration" : "Obligatoire";
  const organismeLabel = !relevant ? "Sans objet"
    : roleDist ? "Affaire du fabricant"
    : x.systeme === "inconnu" ? "Système à vérifier"
    : x.systeme === "s4" ? "Non requis (système 4)"
    : x.organisme === "oui" ? "Intervenu (système " + sys + ")"
    : microS3 && roleFab ? "Système 3, ou 4 pour une microentreprise (article 37)"
    : "Requis (système " + sys + "), manquant";
  const conservationLabel = !relevant ? "Sans objet" : !fin ? "Date à renseigner" : roleDist ? fmtDate(fin) + " (conseillé)" : fmtDate(fin);

  let verdict = "";
  if (etat === "bad") verdict = "À régulariser avant de livrer : " + pluriel(nbBad, "point bloquant", "points bloquants") + (nbWarn ? ", " + pluriel(nbWarn, "point") + " à revoir." : ".");
  else if (etat === "warn") verdict = "Pas de point bloquant, " + pluriel(nbWarn, "point") + " à revoir.";
  else if (!couvert) verdict = "Pas de marquage CE à prévoir pour ce produit : vos devis peuvent rester sans mention du règlement.";
  else if (derogUsed) verdict = "Dérogation cohérente : écrivez-la dans le devis et gardez les preuves.";
  else verdict = "Dossier en ordre sur ces points : vous pouvez livrer avec ces documents.";

  const actions: string[] = [];
  if (x.role === "marque" || x.role === "modifie") actions.push("Traitez ce produit comme le vôtre : déclaration, marquage CE, documentation technique et contrôle de la production à votre nom (article 15).");
  if (x.couverture === "inconnu") actions.push("Vérifiez si une norme harmonisée couvre votre produit : liste publiée par la Commission européenne, ou votre organisation professionnelle.");
  if (couvert && x.regime === "inconnu") actions.push("Vérifiez si une spécification du règlement 2024/3110 est devenue obligatoire pour votre famille de produits ; sinon, le règlement 305/2011 s'applique.");
  if (c[4].statut === "bad") actions.push("Faites intervenir un organisme notifié pour le système " + sys + " avant d'établir ou d'accepter la déclaration.");
  if (c[4].statut === "warn") actions.push(x.systeme === "inconnu" ? "Lisez l'annexe ZA de la norme pour connaître le système d'évaluation et le rôle de l'organisme notifié." : "Si vous traitez le produit en système 4 (article 37), rédigez la documentation technique spécifique qui le justifie.");
  if (c[5].statut === "bad" || c[5].statut === "warn") actions.push(roleFab ? "Établissez la déclaration des performances sur le modèle de l'annexe III : produit type et son code, usage prévu, système, norme, performances, NPD pour ce qui n'est pas déclaré." : poseur ? "Demandez la déclaration des performances au fournisseur avant la pose." : "Demandez la déclaration des performances au fabricant et ne livrez pas sans elle.");
  if (c[6].statut === "bad" || c[6].statut === "warn") {
    if (x.ce === "oui") actions.push("Retirez le marquage CE des produits, étiquettes et documents tant qu'aucune déclaration ne le justifie.");
    else if (roleFab) actions.push("Apposez le marquage CE avec les mentions de l'article 9 avant la livraison.");
    else if (poseur) actions.push("Faites confirmer le marquage CE par le fournisseur avant la pose.");
    else actions.push("Ne livrez pas un produit sans marquage CE : retournez-le au fournisseur ou demandez sa mise en conformité.");
  }
  if ((c[7].statut === "bad" || c[7].statut === "warn") && x.dop === "oui") {
    if (x.remise === "non") actions.push("Envoyez la déclaration au client avec la livraison, en PDF par e-mail ou sur papier, et sur papier s'il le demande.");
    if (x.langue === "autre") actions.push("Faites établir la déclaration en français.");
  }
  if (c[8].statut === "bad" && x.perfDevis === "horsdop") actions.push("Retirez du devis les performances absentes de la déclaration, ou mettez la déclaration à jour avant d'envoyer le devis.");
  if (c[8].statut === "warn") actions.push("Pour chaque performance annoncée, gardez la preuve : essais, fiches des composants, notes de calcul.");
  if (derogUsed) actions.push("Écrivez dans le devis que le produit relève de la dérogation de l'article 5, sans déclaration ni marquage CE, et ne présentez pas ses performances comme déclarées.");
  actions.push("Gardez dans le dossier " + (relevant
    ? "la déclaration, la pièce de l'organisme notifié s'il y en a une et la preuve de remise au client" + (fin ? ", jusqu'au " + fmtDate(fin) : "")
    : derogUsed ? "la commande, l'adresse de l'ouvrage, la preuve que vous avez posé et les justificatifs des performances"
    : "vos fiches techniques et la preuve des performances annoncées") + ".");

  const clauseL3 = relevant
    ? (roleFab ? "Le produit fait l'objet de notre déclaration des performances n° [référence] et porte le marquage CE." : "Le produit fait l'objet de la déclaration des performances de son fabricant, [nom], n° [référence], et porte le marquage CE.")
    : derogUsed
      ? "Le produit est " + (x.procede === "chantier" ? "fabriqué sur le chantier pour cet ouvrage" : x.procede === "patrimoine" ? "fabriqué de façon traditionnelle pour la rénovation de ce bâtiment protégé" : "fabriqué sur mesure pour cet ouvrage et posé par nos soins") + " : il ne fait pas l'objet d'une déclaration des performances ni d'un marquage CE (règlement (UE) n° 305/2011, article 5)."
      : "Le produit n'est couvert par aucune spécification technique harmonisée : il ne porte pas de marquage CE.";
  const clause = [
    "Marquage CE et déclaration des performances",
    "Produit : " + PRODUIT_COURT[x.produit] + ".",
    clauseL3,
    relevant ? "La déclaration est remise avec la livraison, en français, " + (x.remise === "site" ? "à l'adresse internet indiquée sur le bon de livraison" : x.remise === "papier" ? "sur papier" : "par voie électronique") + " ; une copie papier est fournie sur demande." : "Les fiches techniques et la notice sont remises avec la livraison.",
    relevant ? "Les performances indiquées dans ce devis sont celles de la déclaration ; les caractéristiques non déclarées y figurent comme NPD." : "Les performances indiquées dans ce devis sont justifiées par nos essais ou les fiches de nos fournisseurs, tenues à votre disposition.",
    "Une modification du produit après livraison peut changer ses performances : prévenez-nous avant toute intervention."
  ].join("\n");

  const livre = x.date ? " livré le " + fmtDate(x.date) : " livré";
  const m = ["Objet : " + (relevant ? "déclaration des performances et marquage CE" : "performances et documents") + ", " + PRODUIT_COURT[x.produit], "", "Madame, Monsieur,", ""];
  if (relevant) {
    if (x.dop === "oui") m.push("Vous trouverez " + (x.remise === "site" ? "à l'adresse indiquée ci-dessous" : "ci-joint") + " la déclaration des performances du produit" + livre + ".");
    else m.push("La déclaration des performances du produit" + livre + " vous sera transmise dès que nous l'aurons.");
    if (x.remise === "site") m.push("Adresse : [lien] ; code du produit type : [code]. Elle reste consultable gratuitement pendant dix ans.");
    m.push("Les performances qui s'appliquent sont celles de cette déclaration ; les caractéristiques marquées NPD ne sont pas déclarées.");
    m.push("Une copie papier vous sera envoyée sur simple demande.");
  } else if (derogUsed) {
    m.push("Le produit" + livre + " a été fabriqué pour votre ouvrage. Il relève de la dérogation de l'article 5 du règlement (UE) n° 305/2011 : il ne fait pas l'objet d'une déclaration des performances ni d'un marquage CE.");
    m.push("Les performances annoncées dans notre devis sont justifiées par les documents joints.");
  } else {
    m.push("Le produit" + livre + " n'est couvert par aucune spécification technique harmonisée et ne porte donc pas de marquage CE. Vous trouverez ci-joint sa fiche technique et sa notice.");
  }
  m.push("", "Nous restons à votre disposition pour toute question.", "", "Veuillez agréer, Madame, Monsieur, nos salutations distinguées.");
  const message = m.join("\n");

  const recap = [
    "Marquage CE et déclaration des performances : récapitulatif",
    "Rôle : " + LABEL_SETS.role[x.role],
    "Produit : " + LABEL_SETS.produit[x.produit],
    "Couverture : " + LABEL_SETS.couverture[x.couverture],
    "Fabrication : " + LABEL_SETS.procede[x.procede] + (x.pose === "oui" ? ", posé par vous" : ", livré sans pose"),
    "Déclaration des performances : " + dopLabel,
    "Marquage CE : " + ceLabel,
    "Organisme notifié : " + organismeLabel,
    "Conservation : " + conservationLabel,
    "Contrôle : " + pluriel(nbOk, "conforme") + ", " + nbWarn + " à revoir, " + pluriel(nbBad, "bloquant") + ", " + pluriel(nbInfo, "information"),
    "Vérification : quotebuilder.co/outils/" + SLUG
  ].join("\n");

  return {
    x: x, roleFab: roleFab, roleImp: roleImp, roleDist: roleDist, couvert: couvert, derogCond: derogCond, derogUsed: derogUsed, relevant: relevant,
    onNeeded: onNeeded, microS3: microS3, finConservation: fin,
    dopLabel: dopLabel, ceLabel: ceLabel, organismeLabel: organismeLabel, conservationLabel: conservationLabel,
    controles: c, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat, verdict: verdict,
    actions: actions, clause: clause, message: message, recap: recap
  };
}

