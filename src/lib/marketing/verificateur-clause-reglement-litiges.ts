/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-clause-reglement-litiges";
  var ROLE_LABELS = { prestataire: "prestataire qui rédige la clause", client: "client qui relit la clause" };
  var QUALITE_P_LABELS = { societe: "société commerciale", commercant: "commerçant en entreprise individuelle", artisan: "artisan en entreprise individuelle", liberal: "profession libérale", association: "association", civile: "société civile" };
  var QUALITE_C_LABELS = { societe: "société commerciale", commercant: "commerçant en entreprise individuelle", artisan: "artisan en entreprise individuelle", liberal: "profession libérale", association: "association", civile: "société civile", particulier: "particulier hors activité professionnelle" };
  var ETRANGER_LABELS = { non: "client établi en France", ue: "client établi dans un autre État de l'Union", horsUe: "client établi hors de l'Union" };
  var ARBITRAGE_LABELS = { non: "pas de clause d'arbitrage", oui: "clause d'arbitrage" };
  var TRIBUNAL_LABELS = { precis: "tribunal nommé", vague: "formule vague", aucun: "aucun tribunal choisi" };
  var PRESENTATION_LABELS = { signature: "rappelée près de la signature", titre: "article titré en caractères distincts", noyee: "noyée dans les CGV", facture: "seulement sur la facture" };
  var ACCEPTATION_LABELS = { signee: "CGV jointes au devis signé", lien: "CGV en lien sans mention d'acceptation", aucune: "CGV jamais transmises" };
  var AMIABLE_LABELS = { aucune: "aucune étape amiable", vague: "formule amiable vague", precise: "procédure amiable écrite" };
  var TIERS_LABELS = { mediateur: "médiateur ou centre de médiation", conciliateur: "conciliateur de justice", dirigeants: "réunion entre dirigeants, sans tiers", aucun: "tiers non précisé" };
  var FRAIS_LABELS = { partages: "frais partagés", silence: "frais non prévus" };
  var RECIPROCITE_LABELS = { reciproque: "les deux parties", clientSeul: "le client seulement" };
  var EXCLUSION_LABELS = { oui: "factures non contestées exclues", non: "tout différend visé" };
  var URGENCE_LABELS = { oui: "urgence réservée", non: "urgence non mentionnée" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var DEFAULTS = {
    role: "prestataire", qualiteP: "societe", qualiteC: "societe", etranger: "non", arbitrage: "non",
    tribunal: "vague", presentation: "noyee", acceptation: "signee",
    amiable: "vague", tiers: "aucun", frais: "silence", delaiJours: 0, dateNotification: "2027-03-15", reciprocite: "reciproque",
    exclusionImpayes: "non", urgence: "non"
  };

  function num(v, min, max, fallback) {
    var n = typeof v === "number" ? v : parseFloat(String(v === undefined || v === null ? "" : v).replace(/[\s\u00a0]/g, "").replace(",", "."));
    if (!isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }
  function pick(v, obj, fallback) { return Object.prototype.hasOwnProperty.call(obj, v) ? v : fallback; }
  function pluriel(n, un, plusieurs) { return n + " " + (n > 1 ? plusieurs : un); }
  // Date ISO valide (AAAA-MM-JJ) ou null.
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var t = new Date(Date.UTC(y, mo - 1, d));
    if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d };
  }
  // Ajoute des jours calendaires.
  function addDays(dt, n) {
    var t = new Date(Date.UTC(dt.y, dt.m - 1, dt.d) + n * 86400000);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }
  function fmtDate(dt) { return (dt.d === 1 ? "1er" : String(dt.d)) + " " + MOIS[dt.m - 1] + " " + dt.y; }
  function estCommercant(q) { return q === "societe" || q === "commercant"; }

  function computeReglementLitiges(input) {
    var d = {};
    for (var key in DEFAULTS) d[key] = input && input[key] !== undefined ? input[key] : DEFAULTS[key];
    var role = pick(d.role, ROLE_LABELS, "prestataire");
    var qualiteP = pick(d.qualiteP, QUALITE_P_LABELS, "societe");
    var qualiteC = pick(d.qualiteC, QUALITE_C_LABELS, "societe");
    var etranger = pick(d.etranger, ETRANGER_LABELS, "non");
    var arbitrage = pick(d.arbitrage, ARBITRAGE_LABELS, "non");
    var tribunal = pick(d.tribunal, TRIBUNAL_LABELS, "vague");
    var presentation = pick(d.presentation, PRESENTATION_LABELS, "noyee");
    var acceptation = pick(d.acceptation, ACCEPTATION_LABELS, "signee");
    var amiable = pick(d.amiable, AMIABLE_LABELS, "vague");
    var tiers = pick(d.tiers, TIERS_LABELS, "aucun");
    var frais = pick(d.frais, FRAIS_LABELS, "silence");
    var reciprocite = pick(d.reciprocite, RECIPROCITE_LABELS, "reciproque");
    var exclusion = pick(d.exclusionImpayes, EXCLUSION_LABELS, "non");
    var urgence = pick(d.urgence, URGENCE_LABELS, "non");
    var delaiJours = num(d.delaiJours, 0, 365, 0);
    var notif = parseDate(d.dateNotification) || parseDate(DEFAULTS.dateNotification);

    var deuxCommercants = estCommercant(qualiteP) && estCommercant(qualiteC);
    var nonCommercant = !estCommercant(qualiteP) ? QUALITE_P_LABELS[qualiteP] : !estCommercant(qualiteC) ? QUALITE_C_LABELS[qualiteC] : "";
    var particulier = qualiteC === "particulier";
    var avecAmiable = amiable !== "aucune";

    var controles = [];
    var add = function (point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); };

    // 1. Qualité des parties (article 48 du code de procédure civile)
    if (etranger === "ue") add("Qualité des parties", "info", "Client établi dans un autre État de l'Union : c'est l'article 25 du règlement (UE) n° 1215/2012 qui encadre le choix du tribunal, pas seulement l'article 48. Voir le point « Client étranger ».");
    else if (tribunal === "aucun") add("Qualité des parties", "info", "Aucun tribunal n'est choisi : la qualité de commerçant ne joue pas. Les règles de droit commun s'appliquent (articles 42 et 46 du code de procédure civile).");
    else if (deuxCommercants) add("Qualité des parties", "ok", "Les deux parties ont contracté en qualité de commerçant (" + QUALITE_P_LABELS[qualiteP] + " et " + QUALITE_C_LABELS[qualiteC] + ") : une clause attributive de juridiction est possible (article 48 du code de procédure civile).");
    else add("Qualité des parties", "bad", "L'une des parties n'est pas commerçante (" + nonCommercant + ") : la clause qui choisit le tribunal est réputée non écrite (article 48 du code de procédure civile ; pour un artisan, Cass. com., 11 mai 1993, n° 91-14.734). Le tribunal se déterminera par les articles 42 et 46.");

    // 2. Présentation de la clause
    if (tribunal === "aucun") add("Présentation de la clause", "info", "Sans choix de tribunal, l'exigence d'une clause très apparente ne se pose pas. Gardez quand même l'étape amiable lisible, dans un article titré.");
    else if (presentation === "signature") add("Présentation de la clause", "ok", "Clause rappelée sur le devis, près de la signature du client : c'est la présentation la plus solide. Le juge vérifie la typographie et la présentation (Cass. com., 20 avril 2017, n° 15-20.908).");
    else if (presentation === "titre") add("Présentation de la clause", "ok", "Article titré en caractères distincts : défendable. Un rappel d'une ligne près de la signature la rendrait encore plus apparente.");
    else if (presentation === "noyee") add("Présentation de la clause", "warn", "Clause dans les CGV, même police, sans titre : elle risque de ne pas être jugée très apparente (Cass. com., 20 avril 2017, n° 15-20.908). Donnez-lui un titre, des caractères distincts, et un rappel sur le devis.");
    else add("Présentation de la clause", "bad", "Clause seulement sur la facture : elle arrive après l'accord, elle ne figure pas dans l'engagement du client. Elle ne lui est pas opposable.");

    // 3. Acceptation des CGV (article 1119 du code civil)
    if (acceptation === "signee") add("Acceptation des CGV", "ok", "CGV jointes au devis signé, qui dit les accepter : elles ont été portées à la connaissance du client et acceptées (article 1119 du code civil).");
    else if (acceptation === "lien") add("Acceptation des CGV", "warn", "CGV en lien, sans mention d'acceptation : il faudra prouver que le client les a connues et acceptées (article 1119). Ajoutez sur le devis la phrase « Je reconnais avoir reçu et accepté les conditions générales jointes ».");
    else add("Acceptation des CGV", "bad", "CGV jamais transmises : aucune clause qu'elles contiennent ne peut être opposée au client (article 1119 du code civil). Joignez-les au prochain devis.");

    // 4. Tribunal choisi
    if (tribunal === "precis") add("Tribunal choisi", "ok", "Tribunal nommé par sa ville. Si c'est un tribunal des activités économiques, la formule « ou la juridiction qui lui succède » évite de réécrire la clause.");
    else if (tribunal === "vague") add("Tribunal choisi", "warn", "Formule vague (« tribunal du siège du prestataire ») : le siège peut changer, et la juridiction n'est pas nommée. Écrivez « tribunal de commerce de [ville] ».");
    else add("Tribunal choisi", "info", "Aucun tribunal choisi : en principe, celui du lieu où demeure le défendeur, ou en matière contractuelle celui du lieu d'exécution de la prestation (articles 42 et 46 du code de procédure civile).");

    // 5. Client étranger
    if (etranger === "non") add("Client étranger", "info", "Client établi en France : les règles françaises de compétence s'appliquent.");
    else if (etranger === "ue") add("Client étranger", "warn", "Client établi dans l'Union : l'article 25 du règlement (UE) n° 1215/2012 permet de choisir le tribunal, avec ses propres exigences de forme (écrit, ou confirmation écrite). Choisir le tribunal ne règle pas la loi applicable. Faites relire la clause.");
    else add("Client étranger", "warn", "Client établi hors de l'Union : le choix du tribunal dépend aussi du droit de son pays et de l'exécution du jugement là-bas. Faites relire la clause par un conseil.");

    // 6. Étape amiable
    if (amiable === "aucune") add("Étape amiable", "info", "Aucune étape amiable : chaque partie peut saisir le juge directement. C'est un choix possible.");
    else if (amiable === "vague") add("Étape amiable", "warn", "Formule vague : une clause sans conditions de mise en œuvre a été jugée sans effet (Cass. com., 29 avril 2014, n° 12-27.004), une clause sommaire a aussi été appliquée (Cass. com., 30 mai 2018, n° 16-26.403). Précisez notification, tiers et durée.");
    else add("Étape amiable", "ok", "Procédure écrite : si une partie saisit le juge sans la respecter, l'autre peut faire déclarer l'action irrecevable (Cass. ch. mixte, 14 février 2003, n° 00-19.423), et lancer la procédure après l'assignation ne régularise pas (Cass. ch. mixte, 12 décembre 2014, n° 13-19.684).");

    // 7. Tiers
    if (!avecAmiable) add("Tiers", "info", "Pas d'étape amiable : pas de tiers à désigner.");
    else if (tiers === "mediateur" && frais === "partages") add("Tiers", "ok", "Médiateur ou centre de médiation, frais partagés : la clause dit qui intervient et qui paie.");
    else if (tiers === "mediateur") add("Tiers", "warn", "Médiateur prévu, mais rien sur ses frais. Écrivez qu'ils sont partagés par moitié, sauf accord contraire.");
    else if (tiers === "conciliateur") add("Tiers", "ok", "Conciliateur de justice : un tiers au sens de l'article 1530 du code de procédure civile. Indiquez comment le saisir.");
    else if (tiers === "dirigeants") add("Tiers", "warn", "Réunion entre dirigeants sans tiers : ce n'est pas une médiation au sens de l'article 1530. Appelez-la « réunion de conciliation entre les parties », ou prévoyez un médiateur à défaut d'accord.");
    else add("Tiers", "warn", "Le tiers n'est pas précisé : chacun pourra contester que l'étape a eu lieu. Nommez un centre de médiation, ou la façon de choisir le médiateur.");

    // 8. Durée de l'étape et date de saisine
    var saisine = avecAmiable && delaiJours > 0 ? addDays(notif, delaiJours) : null;
    var saisineLabel = !avecAmiable ? "Immédiatement" : delaiJours === 0 ? "Délai non fixé" : "Le " + fmtDate(saisine);
    if (!avecAmiable) add("Durée de l'étape", "info", "Pas d'étape amiable : pas de délai à respecter avant de saisir le juge.");
    else if (delaiJours === 0) add("Durée de l'étape", "warn", "Aucune durée : on ne sait pas quand l'étape est terminée. Fixez un nombre de jours à compter de la notification.");
    else if (delaiJours < 15) add("Durée de l'étape", "warn", pluriel(delaiJours, "jour", "jours") + " : court pour choisir un médiateur et se réunir. Saisine possible le " + fmtDate(saisine) + ".");
    else if (delaiJours > 90) add("Durée de l'étape", "warn", pluriel(delaiJours, "jour", "jours") + " : long, au-delà du repère de l'outil. Saisine possible le " + fmtDate(saisine) + ".");
    else add("Durée de l'étape", "ok", pluriel(delaiJours, "jour", "jours") + " à compter de la notification du " + fmtDate(notif) + " : saisine du juge possible le " + fmtDate(saisine) + ", sauf accord pour prolonger.");

    // 9. Factures non contestées
    if (!avecAmiable) add("Factures non contestées", "info", "Pas d'étape amiable : le recouvrement d'une facture peut être engagé directement.");
    else if (exclusion === "oui") add("Factures non contestées", "ok", "Les factures non contestées sont exclues : leur recouvrement ne passe pas par la médiation.");
    else if (role === "prestataire") add("Factures non contestées", "warn", "La clause vise tout différend : votre propre facture impayée devra d'abord passer par l'étape amiable. Excluez les factures non contestées.");
    else add("Factures non contestées", "info", "La clause vise tout différend : le prestataire devra passer par l'étape amiable avant de vous assigner en paiement.");

    // 10. Urgence (article 1537 du code de procédure civile)
    if (urgence === "oui") add("Urgence", "ok", "Référés et mesures conservatoires réservés : la clause dit ce que prévoit déjà l'article 1537 du code de procédure civile.");
    else if (!avecAmiable) add("Urgence", "info", "Pas d'étape amiable : rien ne retarde une demande en référé.");
    else add("Urgence", "warn", "La clause ne dit rien de l'urgence. L'article 1537 permet au juge d'ordonner une mesure d'instruction, provisoire ou conservatoire malgré l'étape amiable. Écrivez-le, pour éviter le débat.");

    // 11. Réciprocité (article 1171 du code civil)
    if (!avecAmiable) add("Réciprocité", "info", "Pas d'étape amiable : pas de question de réciprocité.");
    else if (reciprocite === "reciproque") add("Réciprocité", "ok", "L'étape amiable vaut pour les deux parties.");
    else add("Réciprocité", "warn", "L'étape amiable ne vaut que pour le client. Dans des CGV non négociables, une clause déséquilibrée peut être réputée non écrite (article 1171 du code civil). Rendez-la réciproque.");

    // 12. Arbitrage (articles 2061 du code civil et L721-3 du code de commerce)
    if (arbitrage === "non") add("Arbitrage", "info", "Pas de clause d'arbitrage : les litiges vont devant le tribunal.");
    else if (particulier) add("Arbitrage", "bad", "Clause d'arbitrage face à une partie qui n'a pas contracté dans le cadre de son activité professionnelle : elle ne peut pas lui être opposée (article 2061 du code civil).");
    else if (deuxCommercants) add("Arbitrage", "warn", "Entre commerçants, l'arbitrage est possible (article L721-3 du code de commerce), mais il coûte cher pour un devis courant. Vérifiez qu'il est voulu, et ne gardez pas en même temps une clause qui choisit un tribunal pour le fond.");
    else add("Arbitrage", "warn", "Clause d'arbitrage entre professionnels non commerçants : elle doit avoir été acceptée par la partie à qui on l'oppose (article 2061 du code civil). Faites-la relire, l'arbitrage coûte cher pour un devis courant.");

    // 13. Prescription (article 2238 du code civil)
    add("Prescription", "info", "Quand les parties conviennent, après la naissance du litige, de recourir à la médiation ou à la conciliation, la prescription est suspendue (article 2238 du code civil). Gardez la date de l'accord écrit ou de la première réunion.");

    var nb = { ok: 0, warn: 0, bad: 0, info: 0 };
    var aTraiter = [];
    for (var i = 0; i < controles.length; i++) {
      nb[controles[i].statut]++;
      if (controles[i].statut === "bad" || controles[i].statut === "warn") aTraiter.push(controles[i].point);
    }
    var etat = nb.bad > 0 ? "bad" : nb.warn > 0 ? "warn" : "ok";
    var statutLabel = STATUT_LABELS[etat];

    var tribunalLabel;
    if (tribunal === "aucun") tribunalLabel = "Droit commun";
    else if (etranger === "ue") tribunalLabel = "Règlement UE";
    else if (!deuxCommercants) tribunalLabel = "Réputée non écrite";
    else if (presentation === "facture" || acceptation === "aucune") tribunalLabel = "Inopposable";
    else if (presentation === "noyee" || acceptation === "lien" || tribunal === "vague") tribunalLabel = "Fragile";
    else tribunalLabel = "Opposable";
    var amiableLabel = !avecAmiable ? "Aucune" : amiable === "vague" ? "Trop vague" : "Écrite";

    var verdict;
    if (etat === "bad") verdict = "Au moins un point bloque : la clause, telle qu'elle est, ne produira pas l'effet attendu. Reprenez les points marqués Bloquant avant d'envoyer le devis.";
    else if (etat === "warn") verdict = "La clause tient en partie, mais " + pluriel(nb.warn, "point reste", "points restent") + " à compléter. Ce sont eux qui seront discutés le jour du litige.";
    else verdict = "La clause est complète sur les points vérifiés. Gardez la trace de son acceptation et de chaque notification.";

    // Clause proposée
    var art = [];
    var n = 1;
    {
      var d2 = delaiJours >= 15 && delaiJours <= 90 ? delaiJours : 45;
      art.push("Article [" + n + "] Règlement amiable préalable. En cas de différend relatif à la conclusion, l'exécution ou la fin du présent contrat, la partie la plus diligente le notifie à l'autre par lettre recommandée avec avis de réception ou par courriel avec accusé de réception, en exposant ses demandes. Les parties recourent alors à une médiation confiée à [nom du centre de médiation ou modalité de désignation du médiateur], dont les frais sont partagés par moitié, sauf accord contraire. À défaut d'accord dans un délai de " + d2 + " jours à compter de la notification, chaque partie retrouve la liberté de saisir le juge. Cette étape ne s'applique pas au recouvrement des factures non contestées. Elle ne fait pas obstacle à la saisine du juge des référés ni aux mesures conservatoires ou d'instruction.");
      n++;
    }
    if (deuxCommercants && etranger === "non") art.push("Article [" + n + "] Tribunal compétent. À défaut d'accord, tout litige relatif au présent contrat est soumis au tribunal de commerce de [ville], ou à la juridiction qui lui succède, y compris en cas de pluralité de défendeurs ou d'appel en garantie.");
    else if (etranger !== "non") art.push("Article [" + n + "] Tribunal compétent. Clause à rédiger avec un conseil : client établi " + (etranger === "ue" ? "dans un autre État de l'Union (règlement (UE) n° 1215/2012, article 25)" : "hors de l'Union") + ". Précisez aussi la loi applicable.");
    else art.push("Article [" + n + "] Tribunal compétent. À défaut d'accord, le litige est porté devant la juridiction compétente selon les règles de droit commun. (Pas de choix de tribunal : l'une des parties n'est pas commerçante.)");
    var clause = "Clauses proposées (à adapter avec votre conseil)\n" + art.join("\n");

    // Actions
    var actions = [];
    for (var k = 0; k < controles.length; k++) {
      var c = controles[k];
      if (c.statut === "bad") actions.push("Bloquant, " + c.point + " : " + c.texte);
      else if (c.statut === "warn") actions.push("À compléter, " + c.point + " : " + c.texte);
    }
    actions.push("Le jour d'un différend : notez dans le dossier la date et le mode de la notification, le nom du médiateur et la date de la première réunion.");

    // Message
    var message;
    if (role === "prestataire") {
      message = "Bonjour,\n\nNous avons revu l'article de nos conditions sur le règlement des litiges. ";
      message += "En cas de désaccord, nous prévoyons d'abord une médiation, avec un délai fixé, puis seulement le tribunal. ";
      message += "Vous trouverez la nouvelle rédaction dans le devis joint, rappelée près de la signature. N'hésitez pas à nous dire si un point vous gêne avant de signer.\n\nBien cordialement,";
    } else {
      message = "Bonjour,\n\nAvant de signer, nous avons relu l'article sur le règlement des litiges. ";
      if (aTraiter.length) message += "Nous souhaitons revoir avec vous les points suivants : " + aTraiter.join(", ") + ". ";
      if (!deuxCommercants && tribunal !== "aucun" && etranger === "non") message += "Notre structure n'étant pas commerçante, la clause qui choisit le tribunal ne nous serait pas opposable ; autant la retirer. ";
      message += "Pouvez-vous nous envoyer une version modifiée ?\n\nBien cordialement,";
    }

    var recap = [
      "Clause de règlement des litiges : contrôle",
      "Position : " + ROLE_LABELS[role],
      "Parties : " + QUALITE_P_LABELS[qualiteP] + " et " + QUALITE_C_LABELS[qualiteC] + ", " + ETRANGER_LABELS[etranger],
      "Tribunal : " + TRIBUNAL_LABELS[tribunal] + ", " + PRESENTATION_LABELS[presentation] + " (" + tribunalLabel + ")",
      "Acceptation : " + ACCEPTATION_LABELS[acceptation],
      "Étape amiable : " + AMIABLE_LABELS[amiable] + (avecAmiable ? ", " + TIERS_LABELS[tiers] + ", " + FRAIS_LABELS[frais] + ", pour " + RECIPROCITE_LABELS[reciprocite] : ""),
      "Saisine du juge : " + (saisine ? "possible le " + fmtDate(saisine) + " (notification du " + fmtDate(notif) + ", " + pluriel(delaiJours, "jour", "jours") + ")" : saisineLabel.toLowerCase()),
      "Exclusions : " + EXCLUSION_LABELS[exclusion] + ", " + URGENCE_LABELS[urgence] + ", " + ARBITRAGE_LABELS[arbitrage],
      "Statut : " + statutLabel + " (" + nb.bad + " bloquant" + (nb.bad > 1 ? "s" : "") + ", " + nb.warn + " à compléter, " + nb.ok + " conforme" + (nb.ok > 1 ? "s" : "") + ", " + nb.info + " pour information)",
      "Points à traiter : " + (aTraiter.length ? aTraiter.join(", ") : "aucun"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      role: role, qualiteP: qualiteP, qualiteC: qualiteC, deuxCommercants: deuxCommercants, delaiJours: delaiJours, notif: notif, saisine: saisine,
      saisineLabel: saisineLabel, tribunalLabel: tribunalLabel, amiableLabel: amiableLabel,
      controles: controles, nbOk: nb.ok, nbWarn: nb.warn, nbBad: nb.bad, nbInfo: nb.info, etat: etat, statutLabel: statutLabel,
      verdict: verdict, clause: clause, articles: art.length, actions: actions, message: message, recap: recap
    };
  }
  function buildRecap(input) { return computeReglementLitiges(input).recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, ROLE_LABELS, QUALITE_P_LABELS, QUALITE_C_LABELS, ETRANGER_LABELS, ARBITRAGE_LABELS, TRIBUNAL_LABELS, PRESENTATION_LABELS, ACCEPTATION_LABELS, AMIABLE_LABELS, TIERS_LABELS, FRAIS_LABELS, RECIPROCITE_LABELS, EXCLUSION_LABELS, URGENCE_LABELS, computeReglementLitiges, buildRecap, fmtDate, addDays, parseDate, num };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var IDS = Object.keys(DEFAULTS);
    var $ = function (id) { return document.getElementById(id); };
    var read = function () { var o = {}; for (var i = 0; i < IDS.length; i++) o[IDS[i]] = $(IDS[i]).value; return o; };
    var render = function () {
      var r = computeReglementLitiges(read());
      $("tribunalOut").textContent = r.tribunalLabel;
      $("saisineOut").textContent = r.saisineLabel;
      $("amiableOut").textContent = r.amiableLabel;
      $("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      $("verdict").className = "alert " + r.etat;
      $("verdict").textContent = r.verdict;
      var tb = $("controles");
      tb.innerHTML = "";
      for (var i = 0; i < r.controles.length; i++) {
        var c = r.controles[i];
        var tr = document.createElement("tr");
        if (c.statut === "bad") tr.className = "cur";
        else if (c.statut === "warn") tr.className = "weak";
        var a = document.createElement("td"); a.textContent = c.point;
        var b = document.createElement("td"); b.textContent = STATUT_LABELS[c.statut];
        var t = document.createElement("td"); t.textContent = c.texte;
        tr.appendChild(a); tr.appendChild(b); tr.appendChild(t); tb.appendChild(tr);
      }
      $("clause").textContent = r.clause;
      var ul = $("actions");
      ul.innerHTML = "";
      for (var j = 0; j < r.actions.length; j++) { var li = document.createElement("li"); li.textContent = r.actions[j]; ul.appendChild(li); }
      $("message").textContent = r.message;
      $("recap").textContent = r.recap;
    };
    for (var n = 0; n < IDS.length; n++) { $(IDS[n]).addEventListener("input", render); $(IDS[n]).addEventListener("change", render); }
    var btns = document.querySelectorAll("button.copy");
    for (var b2 = 0; b2 < btns.length; b2++) {
      btns[b2].addEventListener("click", function (ev) {
        var target = $(ev.currentTarget.getAttribute("data-target"));
        if (target && navigator.clipboard) navigator.clipboard.writeText(target.textContent);
      });
    }
    render();
  
  return built.snapshot();
}
