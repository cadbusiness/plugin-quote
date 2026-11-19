/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-compensation-creances";
  var ROLE_LABELS = { fournisseur: "fournisseur dont la facture a été réduite", client: "client qui veut déduire une somme" };
  var VOIE_LABELS = { legale: "compensation légale (articles 1347 et 1347-1)", conventionnelle: "compensation convenue (article 1348-2)", judiciaire: "compensation demandée au juge (articles 1348 et 1348-1)" };
  var NATURE_LABELS = { penalites: "pénalités de retard", dommages: "dommages et intérêts", remise: "remise ou ristourne", avoir: "avoir", facture: "facture ou note de débit" };
  var CERTITUDE_LABELS = { reconnue: "reconnue par écrit", contestee: "contestée", eventuelle: "éventuelle" };
  var LIQUIDITE_LABELS = { chiffree: "chiffrée", aChiffrer: "à évaluer" };
  var EXIGIBILITE_LABELS = { echue: "échue", aTerme: "à terme" };
  var RECIPROCITE_LABELS = { oui: "mêmes personnes", groupe: "autre société du groupe", tiers: "tiers" };
  var FONGIBILITE_LABELS = { argent: "deux sommes d'argent", nature: "somme contre prestation ou chose" };
  var CONNEXITE_LABELS = { memeContrat: "même contrat", cadre: "accord-cadre commun", distincts: "contrats distincts" };
  var CLAUSE_LABELS = { aucune: "aucune clause", acceptee: "clause acceptée", transmise: "clause transmise, acceptation discutable", interdiction: "clause qui écarte la compensation" };
  var DISTRIBUTEUR_LABELS = { non: "non", oui: "oui" };
  var PROCEDURE_LABELS = { non: "aucune", oui: "ouverte" };
  var CESSION_LABELS = { non: "aucune", avant: "somme opposée née avant la notification", apres: "somme opposée née après la notification" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Réciprocité", "Fongibilité", "Certitude", "Liquidité", "Exigibilité", "Clause de compensation",
    "Connexité", "Nature de la somme opposée", "Procédure collective", "Cession ou affacturage",
    "Montants", "Voie et date d'effet"
  ];
  var DEFAULTS = {
    role: "fournisseur",
    voie: "legale",
    natureCreance: "penalites",
    montantFacture: 32200,
    montantOppose: 2070,
    dateFacture: "2027-02-26",
    dateOpposee: "2027-02-10",
    reciprocite: "oui",
    fongibilite: "argent",
    certitude: "contestee",
    liquidite: "chiffree",
    exigibilite: "echue",
    connexite: "memeContrat",
    clauseCompensation: "aucune",
    distributeur: "non",
    procedure: "non",
    cession: "non"
  };
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  function num(v, min, max, def) {
    var s = String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    var n = parseFloat(s);
    if (!isFinite(n)) return def;
    n = Math.floor(n);
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  }
  function pick(v, labels, def) { return Object.prototype.hasOwnProperty.call(labels, v) ? v : def; }
  function parseDate(s) {
    if (!s || typeof s !== "string") return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d };
  }
  function iso(p) { return p.y + "-" + String(p.m).padStart(2, "0") + "-" + String(p.d).padStart(2, "0"); }
  function cmpDate(a, b) { return iso(a) < iso(b) ? -1 : (iso(a) > iso(b) ? 1 : 0); }
  function fmtDate(p) {
    if (!p) return "";
    return (p.d === 1 ? "1er" : String(p.d)) + " " + MOIS[p.m - 1] + " " + p.y;
  }
  function fmtEur(n) {
    var s = String(Math.round(Math.abs(n)));
    var out = "";
    while (s.length > 3) { out = " " + s.slice(-3) + out; s = s.slice(0, -3); }
    return (n < 0 ? "\u2212" : "") + s + out + " €";
  }
  function plural(n, one, many) { return n + " " + (n > 1 ? many : one); }

  function computeCompensation(input) {
    var i = input || {};
    var d = {};
    for (var k in DEFAULTS) d[k] = i[k] !== undefined ? i[k] : DEFAULTS[k];
    d.role = pick(d.role, ROLE_LABELS, "fournisseur");
    d.voie = pick(d.voie, VOIE_LABELS, "legale");
    d.natureCreance = pick(d.natureCreance, NATURE_LABELS, "penalites");
    d.certitude = pick(d.certitude, CERTITUDE_LABELS, "contestee");
    d.liquidite = pick(d.liquidite, LIQUIDITE_LABELS, "chiffree");
    d.exigibilite = pick(d.exigibilite, EXIGIBILITE_LABELS, "echue");
    d.reciprocite = pick(d.reciprocite, RECIPROCITE_LABELS, "oui");
    d.fongibilite = pick(d.fongibilite, FONGIBILITE_LABELS, "argent");
    d.connexite = pick(d.connexite, CONNEXITE_LABELS, "memeContrat");
    d.clauseCompensation = pick(d.clauseCompensation, CLAUSE_LABELS, "aucune");
    d.distributeur = pick(d.distributeur, DISTRIBUTEUR_LABELS, "non");
    d.procedure = pick(d.procedure, PROCEDURE_LABELS, "non");
    d.cession = pick(d.cession, CESSION_LABELS, "non");
    d.montantFacture = num(d.montantFacture, 0, 999999999, 0);
    d.montantOppose = num(d.montantOppose, 0, 999999999, 0);
    var dF = parseDate(d.dateFacture) || parseDate(DEFAULTS.dateFacture);
    var dO = parseDate(d.dateOpposee) || parseDate(DEFAULTS.dateOpposee);
    d.dateFacture = iso(dF);
    d.dateOpposee = iso(dO);

    var V = d.voie;
    var connexe = d.connexite !== "distincts";
    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    // 1 Réciprocité
    if (d.reciprocite === "oui") add(POINTS[0], "ok", "Les deux dettes lient les mêmes personnes, dans les deux sens (article 1347).");
    else if (d.reciprocite === "groupe") add(POINTS[0], "bad", "Une autre société du groupe est une autre personne : pas de réciprocité (article 1347), sauf confusion des patrimoines constatée (Cass. com., 9 mai 1995, n° 93-11.724).");
    else add(POINTS[0], "bad", "La somme opposée concerne un tiers : pas d'obligations réciproques, donc pas de compensation (article 1347).");

    // 2 Fongibilité
    if (d.fongibilite === "argent") add(POINTS[1], "ok", "Deux sommes d'argent : obligations fongibles (article 1347-1).");
    else if (V === "conventionnelle") add(POINTS[1], "warn", "Une somme contre une prestation n'est pas fongible (article 1347-1) : un accord peut organiser l'échange, mais il faut l'écrire précisément.");
    else add(POINTS[1], "bad", "Une somme contre une prestation ou une chose n'est pas fongible (article 1347-1) : pas de compensation.");

    // 3 Certitude
    if (d.certitude === "reconnue") add(POINTS[2], "ok", "Somme opposée reconnue par écrit : créance certaine.");
    else if (d.certitude === "contestee") {
      if (V === "legale") add(POINTS[2], "bad", "Somme contestée : elle n'est pas certaine, la compensation légale ne joue pas (en présence d'une contestation, Cass. com., 24 mars 2015, n° 13-23.791).");
      else if (V === "judiciaire") add(POINTS[2], "warn", "Le juge devra d'abord établir la créance : l'article 1348 suppose une obligation certaine.");
      else add(POINTS[2], "warn", "Même avec une clause, une somme contestée reste à prouver : obtenez un accord écrit sur son principe et son montant.");
    } else {
      if (V === "conventionnelle") add(POINTS[2], "warn", "Créance future : l'article 1348-2 vise aussi les obligations futures, avec effet à leur coexistence. Vérifiez que la clause le dit.");
      else add(POINTS[2], "bad", "Créance seulement éventuelle : ni la compensation légale ni la compensation judiciaire (obligation « certaine », article 1348) ne peuvent jouer.");
    }

    // 4 Liquidité
    if (d.liquidite === "chiffree") add(POINTS[3], "ok", "Montant fixé : créance liquide (article 1347-1).");
    else if (V === "judiciaire") add(POINTS[3], "ok", "Le juge peut compenser une créance certaine pas encore liquide (article 1348).");
    else if (V === "conventionnelle") add(POINTS[3], "warn", "Montant à évaluer : fixez-le par écrit avant d'invoquer la clause.");
    else add(POINTS[3], "bad", "Montant à évaluer : la créance n'est pas liquide, pas de compensation légale.");

    // 5 Exigibilité
    if (d.exigibilite === "echue") add(POINTS[4], "ok", "Créance échue. Un délai de grâce n'empêche pas la compensation (article 1347-3).");
    else if (V === "judiciaire") add(POINTS[4], "ok", "Le juge peut compenser une créance pas encore exigible (article 1348).");
    else if (V === "conventionnelle") add(POINTS[4], "warn", "Créance non échue : la clause peut viser des créances à terme, si elle le prévoit.");
    else add(POINTS[4], "bad", "Créance non échue : pas de compensation légale avant l'échéance.");

    // 6 Clause
    if (d.clauseCompensation === "acceptee") add(POINTS[5], "ok", "Clause de compensation acceptée par les deux parties (article 1348-2).");
    else if (d.clauseCompensation === "transmise") add(POINTS[5], "warn", "Clause transmise mais acceptation discutable : faites-la accepter sur le devis signé ou par écrit.");
    else if (d.clauseCompensation === "interdiction") {
      if (d.role === "fournisseur") add(POINTS[5], "ok", "Votre contrat écarte la compensation : rappelez la clause au client et réclamez le paiement intégral.");
      else if (V === "judiciaire") add(POINTS[5], "warn", "Le contrat accepté écarte la compensation : une demande au juge reste à discuter avec votre conseil.");
      else add(POINTS[5], "bad", "Le contrat accepté écarte la compensation : ne déduisez rien sans l'accord écrit du fournisseur.");
    } else {
      if (V === "conventionnelle") add(POINTS[5], "bad", "Aucune clause ni accord écrit : la compensation convenue n'existe pas.");
      else add(POINTS[5], "info", "Pas de clause : seules la compensation légale et la demande au juge restent possibles.");
    }

    // 7 Connexité
    if (d.connexite === "memeContrat") add(POINTS[6], "ok", "Les deux dettes viennent du même contrat : elles sont connexes.");
    else if (d.connexite === "cadre") add(POINTS[6], "ok", "Accord-cadre ou ensemble contractuel unique : connexité possible (Cass. com., 9 mai 1995, n° 93-11.724). Une simple opération économique commune ne suffit pas (Cass. com., 6 mai 2026, n° 23-23.937).");
    else if (V === "judiciaire") add(POINTS[6], "warn", "Contrats distincts : l'article 1348-1 ne joue pas ; le juge garde le choix, et l'effet part en principe de sa décision (article 1348).");
    else add(POINTS[6], "info", "Contrats distincts : la compensation légale reste possible si les quatre conditions sont réunies ; la connexité compte surtout en procédure collective et face à un cessionnaire.");

    // 8 Nature
    var n8s = "ok", n8t = "";
    if (d.distributeur === "oui" && (d.natureCreance === "penalites" || d.natureCreance === "remise")) {
      n8s = "bad";
      n8t = "Relation fournisseur / distributeur : il est interdit de déduire d'office de la facture les pénalités ou rabais (article L441-17 du code de commerce), même fondés. Avis de pénalité avec preuves, délai pour contester, puis facture séparée.";
    } else if (d.natureCreance === "penalites") {
      if (d.certitude === "reconnue") { n8s = "ok"; n8t = "Pénalités reconnues : compensables. Le juge peut toutefois modérer une pénalité manifestement excessive, et elle suppose une mise en demeure sauf inexécution définitive (article 1231-5)."; }
      else if (V === "legale") { n8s = "bad"; n8t = "Pénalités contestées : elles ne sont ni certaines, ni liquides, ni exigibles (Cass. com., 24 mars 2015, n° 13-23.791). Elles se réclament à part."; }
      else { n8s = "warn"; n8t = "Pénalités contestées : il faudra les établir, et le juge peut les modérer (article 1231-5)."; }
    } else if (d.natureCreance === "dommages") {
      if (d.certitude === "reconnue" && d.liquidite === "chiffree") { n8s = "ok"; n8t = "Préjudice reconnu et chiffré : compensable."; }
      else if (V === "legale") { n8s = "bad"; n8t = "Dommages et intérêts non reconnus ou non chiffrés : pas de compensation légale ; c'est au juge de les fixer (articles 1348 et 1348-1)."; }
      else { n8s = "warn"; n8t = "Dommages et intérêts à établir : rassemblez constats, photos et devis de reprise."; }
    } else if (d.natureCreance === "remise") {
      if (d.certitude === "reconnue") { n8s = "ok"; n8t = "Remise ou ristourne convenue par écrit : compensable."; }
      else { n8s = "warn"; n8t = "Remise non prouvée par un accord : une facture ou une note de débit émise par celui qui s'en prévaut ne suffit pas (CA Bordeaux, 2 mai 2023, n° 22/04233)."; }
    } else if (d.natureCreance === "avoir") {
      if (d.certitude === "reconnue") { n8s = "ok"; n8t = "Avoir émis par l'autre partie : il vaut reconnaissance de la somme."; }
      else { n8s = "warn"; n8t = "Avoir discuté : obtenez sa confirmation écrite avant de l'imputer."; }
    } else {
      if (d.certitude === "reconnue") { n8s = "ok"; n8t = "Facture reconnue par l'autre partie : compensable."; }
      else { n8s = "warn"; n8t = "Une facture ou une note de débit émise par celui qui s'en prévaut ne prouve pas seule la créance (CA Bordeaux, 2 mai 2023, n° 22/04233)."; }
    }
    add(POINTS[7], n8s, n8t);

    // 9 Procédure collective
    if (d.procedure === "non") add(POINTS[8], "ok", "Pas de procédure collective connue.");
    else if (connexe) add(POINTS[8], "warn", "Procédure ouverte : seule la compensation de créances connexes reste possible pour les créances antérieures (article L622-7 du code de commerce). Déclarez votre créance dans les délais.");
    else add(POINTS[8], "bad", "Procédure ouverte : interdiction de payer les créances antérieures, sauf compensation de créances connexes (article L622-7). Ici, les contrats sont distincts.");

    // 10 Cession
    if (d.cession === "non") add(POINTS[9], "ok", "Pas de cession ni d'affacturage de la facture.");
    else if (d.cession === "avant") add(POINTS[9], "warn", "Facture cédée : la compensation reste opposable au cessionnaire si la somme opposée est connexe, ou née avant que la cession soit opposable (article 1324), sauf prise d'acte sans réserve de la cession (article 1347-5).");
    else if (connexe) add(POINTS[9], "warn", "Facture cédée : une dette connexe reste opposable au cessionnaire, même après la notification (article 1324 ; Cass. com., 10 sept. 2025, n° 24-17.326).");
    else add(POINTS[9], "bad", "Facture cédée : une somme non connexe, née après la notification de la cession, n'est pas opposable au cessionnaire (article 1324).");

    var badAvant = 0;
    controles.forEach(function (c) { if (c.statut === "bad") badAvant++; });
    var bloque = badAvant > 0;
    var montantsOk = d.montantFacture > 0 && d.montantOppose > 0;
    var potentiel = (!bloque && montantsOk) ? Math.min(d.montantFacture, d.montantOppose) : 0;
    var compense = V === "judiciaire" ? 0 : potentiel;
    var reste = Math.max(0, d.montantFacture - compense);
    var soldeAutre = Math.max(0, d.montantOppose - potentiel);
    var siAccord = montantsOk ? Math.min(d.montantFacture, d.montantOppose) : 0;
    var resteSiAccord = Math.max(0, d.montantFacture - siAccord);

    // 11 Montants
    if (!montantsOk) add(POINTS[10], "warn", "Saisissez les deux montants, en euros entiers.");
    else if (bloque) add(POINTS[10], "ok", "Facture " + fmtEur(d.montantFacture) + ", somme opposée " + fmtEur(d.montantOppose) + ". En l'état, rien n'est compensé : " + fmtEur(reste) + " restent exigibles.");
    else if (V === "judiciaire") add(POINTS[10], "ok", "Montant à demander au juge : " + fmtEur(potentiel) + ". Tant qu'il n'a pas statué, rien n'est déduit : " + fmtEur(reste) + " restent exigibles.");
    else add(POINTS[10], "ok", "Compensation à due concurrence (article 1347) : " + fmtEur(compense) + ". Reste exigible sur la facture : " + fmtEur(reste) + (soldeAutre > 0 ? " ; solde dû par le fournisseur : " + fmtEur(soldeAutre) : "") + ". Plusieurs dettes : imputation de l'article 1342-10 (article 1347-4).");

    // 12 Voie et date d'effet
    var effetLabel = "";
    var premiere = cmpDate(dF, dO) <= 0 ? dF : dO;
    var derniere = cmpDate(dF, dO) >= 0 ? dF : dO;
    if (bloque) effetLabel = "Aucune en l'état";
    else if (V === "legale") effetLabel = "Au plus tôt le " + fmtDate(derniere);
    else if (V === "judiciaire") effetLabel = connexe ? "Si le juge l'admet : réputée au " + fmtDate(premiere) : "Si le juge l'admet : date de la décision";
    else effetLabel = "À la date de l'accord";
    var t12 = "";
    if (V === "legale") t12 = "Compensation légale : elle doit être invoquée et prend effet à la date où ses conditions sont réunies (article 1347)" + (bloque ? "." : ", ici au plus tôt le " + fmtDate(derniere) + ", date où les deux dettes sont exigibles.");
    else if (V === "judiciaire") t12 = connexe ? "Demande au juge : pour des dettes connexes, il ne peut refuser au seul motif qu'une dette n'est pas liquide ou exigible, et la compensation est réputée faite à l'exigibilité de la première (article 1348-1)" + (bloque ? "." : ", ici le " + fmtDate(premiere) + ".") : "Demande au juge : effet à la date de la décision, sauf décision contraire (article 1348).";
    else t12 = "Compensation convenue : effet à la date de l'accord, ou à la coexistence des créances futures (article 1348-2).";
    add(POINTS[11], "info", t12);

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) {
      if (c.statut === "ok") nbOk++;
      else if (c.statut === "warn") nbWarn++;
      else if (c.statut === "bad") nbBad++;
      else nbInfo++;
    });
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");
    var regimeLabel = V === "legale" ? "Compensation légale" : (V === "conventionnelle" ? "Compensation convenue" : "Compensation judiciaire");
    var compensationLabel = bloque ? "Non acquise en l'état" : (V === "judiciaire" ? "À faire juger" : (nbWarn > 0 ? "Possible, à sécuriser" : "Possible"));

    var verdict = "";
    if (etat === "bad") verdict = plural(nbBad, "point bloquant", "points bloquants") + (nbWarn > 0 ? " et " + plural(nbWarn, "point à compléter", "points à compléter") : "") + " : la déduction de " + fmtEur(d.montantOppose) + " n'est pas acquise en l'état. Reste exigible : " + fmtEur(reste) + ".";
    else if (V === "judiciaire") verdict = (etat === "warn" ? "Aucun point bloquant, mais " + plural(nbWarn, "point à compléter", "points à compléter") + ". " : "Aucun point bloquant. ") + "Demande au juge possible pour " + fmtEur(potentiel) + " ; d'ici sa décision, la facture reste exigible pour " + fmtEur(reste) + ".";
    else if (etat === "warn") verdict = "Aucun point bloquant, mais " + plural(nbWarn, "point à compléter", "points à compléter") + ". " + regimeLabel + " possible à hauteur de " + fmtEur(compense) + ", reste exigible " + fmtEur(reste) + ".";
    else verdict = "Aucun point bloquant. " + regimeLabel + " à hauteur de " + fmtEur(compense) + " ; reste exigible " + fmtEur(reste) + ".";

    var art4 = d.distributeur === "oui"
      ? "Article 4. Pénalités. Les pénalités ou rabais pour inexécution font l'objet d'un avis écrit accompagné de la preuve du manquement et du préjudice, puis d'une facture distincte. Ils ne sont jamais déduits d'office de la facture du fournisseur (article L441-17 du code de commerce)."
      : "Article 4. Pénalités. Les pénalités contractuelles sont réclamées par une facture distincte, après mise en demeure lorsque l'article 1231-5 du code civil l'exige. Elles ne sont pas déduites d'office tant qu'elles ne sont pas reconnues par écrit.";
    var articles = [
      "Article 1. Paiement sans déduction. Les factures sont payées à leur échéance, pour leur montant total. Aucune somme contestée n'en est déduite sans l'accord écrit de l'autre partie.",
      "Article 2. Compensation convenue. Les parties peuvent compenser leurs dettes réciproques nées du présent contrat lorsqu'elles sont reconnues par écrit, chiffrées et échues (articles 1347, 1347-1 et 1348-2 du code civil). La partie qui l'invoque le fait par écrit, avec le détail des sommes.",
      "Article 3. Réclamation. Toute réclamation (retard, non-conformité, pénalité) est adressée par écrit avec ses justificatifs dans un délai de [15] jours. L'autre partie répond dans le même délai. Une réclamation en cours ne suspend pas le paiement des sommes non contestées.",
      art4,
      "Article 5. Imputation. Sauf indication du débiteur lors du paiement, paiements et compensations s'imputent selon l'article 1342-10 du code civil.",
      "Article 6. Cession et procédure collective. Toute cession de créance (affacturage) est notifiée à l'autre partie. Les articles 1324 et 1347-5 du code civil et L622-7 du code de commerce s'appliquent."
    ];
    var clause = "Clause « Paiement, réclamations et compensation » (devis et conditions générales)\n" + articles.join("\n");

    var actions = [];
    controles.forEach(function (c) { if (c.statut === "bad" || c.statut === "warn") actions.push(c.point + " : " + c.texte); });
    actions.push("Garder la preuve (devis signé, conditions acceptées, facture, réclamation, accord ou refus écrit) hors de QuoteBuilder : le dossier n'a pas de champ pour une compensation et l'équipe ne peut pas y joindre de fichier.");

    var badPoints = [];
    controles.forEach(function (c) { if (c.statut === "bad") badPoints.push(c.point); });
    var message = "";
    if (d.role === "fournisseur") {
      message = "Objet : facture n° [référence], échue le " + fmtDate(dF) + " : déduction de " + fmtEur(d.montantOppose) + "\n\nBonjour,\n\n";
      if (bloque) message += "Votre règlement fait apparaître une déduction de " + fmtEur(d.montantOppose) + " au titre de " + NATURE_LABELS[d.natureCreance] + ". Nous ne l'acceptons pas en l'état : les conditions d'une compensation ne sont pas réunies (" + badPoints.join(", ").toLowerCase() + "), et cette somme ne peut pas être retenue unilatéralement.\n\nNous vous remercions de régler le solde de " + fmtEur(reste) + " et de nous adresser votre réclamation détaillée, avec ses justificatifs. Nous l'examinerons et vous répondrons par écrit.";
      else if (V === "judiciaire") message += "Vous indiquez vouloir opposer " + fmtEur(d.montantOppose) + " au titre de " + NATURE_LABELS[d.natureCreance] + ". Tant qu'aucun accord ni décision ne fixe cette somme, la facture reste due pour " + fmtEur(reste) + ". Nous vous remercions de la régler et d'adresser votre réclamation séparément.";
      else message += "Nous prenons acte de la compensation de " + fmtEur(compense) + " au titre de " + NATURE_LABELS[d.natureCreance] + (reste > 0 ? ". Le solde restant dû sur la facture est de " + fmtEur(reste) + ". Merci de nous confirmer la date de son règlement." : ". La facture est ainsi soldée.");
      message += "\n\nCordialement";
    } else {
      message = "Objet : proposition de compensation sur la facture n° [référence]\n\nBonjour,\n\nNous vous proposons de compenser " + fmtEur(siAccord) + " au titre de " + NATURE_LABELS[d.natureCreance] + " avec votre facture de " + fmtEur(d.montantFacture) + ", échue le " + fmtDate(dF) + ". Merci de nous confirmer votre accord par écrit ; à réception, nous réglerons le solde de " + fmtEur(resteSiAccord) + ".\n\nSans accord de votre part, nous réglerons les sommes non contestées et vous adresserons une réclamation séparée.\n\nCordialement";
    }

    var recapLines = [
      "Outil : compensation de créances (articles 1347 à 1348-2 du code civil)",
      "Position : " + ROLE_LABELS[d.role],
      "Voie : " + VOIE_LABELS[d.voie] + " · Résultat : " + compensationLabel,
      "Somme opposée : " + NATURE_LABELS[d.natureCreance] + ", " + CERTITUDE_LABELS[d.certitude] + ", " + LIQUIDITE_LABELS[d.liquidite] + ", " + EXIGIBILITE_LABELS[d.exigibilite],
      "Réciprocité : " + RECIPROCITE_LABELS[d.reciprocite] + " · Objet : " + FONGIBILITE_LABELS[d.fongibilite],
      "Origine : " + CONNEXITE_LABELS[d.connexite] + " · Clause : " + CLAUSE_LABELS[d.clauseCompensation],
      "Distributeur (L441-17) : " + DISTRIBUTEUR_LABELS[d.distributeur] + " · Procédure collective : " + PROCEDURE_LABELS[d.procedure] + " · Cession : " + CESSION_LABELS[d.cession],
      "Montants : facture " + fmtEur(d.montantFacture) + " · opposé " + fmtEur(d.montantOppose) + " · compensé " + fmtEur(compense) + " · reste " + fmtEur(reste),
      "Échéances : facture " + fmtDate(dF) + " · somme opposée " + fmtDate(dO) + " · effet : " + effetLabel,
      "Contrôles : " + nbOk + " conforme" + (nbOk > 1 ? "s" : "") + ", " + nbWarn + " à compléter, " + nbBad + " bloquant" + (nbBad > 1 ? "s" : "") + ", " + nbInfo + " information" + (nbInfo > 1 ? "s" : ""),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    return {
      role: d.role, voie: d.voie, natureCreance: d.natureCreance, certitude: d.certitude, liquidite: d.liquidite,
      exigibilite: d.exigibilite, reciprocite: d.reciprocite, fongibilite: d.fongibilite, connexite: d.connexite,
      clauseCompensation: d.clauseCompensation, distributeur: d.distributeur, procedure: d.procedure, cession: d.cession,
      montantFacture: d.montantFacture, montantOppose: d.montantOppose, dateFacture: d.dateFacture, dateOpposee: d.dateOpposee,
      controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat,
      regimeLabel: regimeLabel, compensationLabel: compensationLabel, effetLabel: effetLabel,
      compense: compense, potentiel: potentiel, reste: reste, soldeAutre: soldeAutre, siAccord: siAccord, resteSiAccord: resteSiAccord,
      verdict: verdict, clause: clause, articles: articles.length, actions: actions, message: message,
      recap: recapLines.join("\n"), dateFactureFmt: fmtDate(dF), dateOpposeeFmt: fmtDate(dO)
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, ROLE_LABELS, VOIE_LABELS, NATURE_LABELS, CERTITUDE_LABELS, LIQUIDITE_LABELS, EXIGIBILITE_LABELS, RECIPROCITE_LABELS, FONGIBILITE_LABELS, CONNEXITE_LABELS, CLAUSE_LABELS, DISTRIBUTEUR_LABELS, PROCEDURE_LABELS, CESSION_LABELS, computeCompensation, buildRecap, fmtEur, fmtDate, parseDate, num };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computeCompensation(readForm());
      document.getElementById("voieOut").textContent = r.regimeLabel;
      document.getElementById("compensationOut").textContent = r.compensationLabel;
      document.getElementById("compenseOut").textContent = fmtEur(r.compense);
      document.getElementById("resteOut").textContent = fmtEur(r.reste);
      document.getElementById("effetOut").textContent = r.effetLabel;
      document.getElementById("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      var v = document.getElementById("verdict");
      v.textContent = r.verdict;
      v.className = "alert " + r.etat;
      var tb = document.getElementById("controles");
      tb.innerHTML = "";
      r.controles.forEach(function (c) {
        var tr = document.createElement("tr");
        if (c.statut === "warn") tr.className = "weak";
        if (c.statut === "bad") tr.className = "cur";
        var a = document.createElement("td"); a.textContent = c.point;
        var b = document.createElement("td"); b.textContent = STATUT_LABELS[c.statut];
        var e = document.createElement("td"); e.textContent = c.texte;
        tr.appendChild(a); tr.appendChild(b); tr.appendChild(e);
        tb.appendChild(tr);
      });
      document.getElementById("clause").textContent = r.clause;
      document.getElementById("message").textContent = r.message;
      document.getElementById("recap").textContent = r.recap;
      var ul = document.getElementById("actions");
      ul.innerHTML = "";
      r.actions.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    };
    document.getElementById("form").addEventListener("input", render);
    document.getElementById("form").addEventListener("change", render);
    document.querySelectorAll("button.copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = document.getElementById(btn.getAttribute("data-target")).textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
      });
    });
    render();
  
  return built.snapshot();
}
