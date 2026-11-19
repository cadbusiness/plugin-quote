/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-cession-creance-affacturage";
  var ROLE_LABELS = { cedant: "fournisseur qui cède sa facture", debiteur: "client qui doit payer la facture" };
  var MODE_LABELS = { affacturage: "affacturage (subrogation)", dailly: "cession Dailly à une banque", civile: "cession de créance du code civil" };
  var RECOURS_LABELS = { avec: "avec recours contre le fournisseur", sans: "sans recours (garantie d'impayé)" };
  var EXECUTION_LABELS = { executee: "prestation livrée ou exécutée", partielle: "prestation exécutée en partie", future: "prestation pas encore exécutée" };
  var CLAUSE_LABELS = { aucune: "aucune clause d'incessibilité", presente: "clause d'incessibilité" };
  var DEBITEUR_LABELS = { pro: "entreprise (production, distribution ou services)", autre: "autre cas, à vérifier" };
  var ECRIT_LABELS = { oui: "acte complet", incomplet: "acte incomplet", non: "pas d'acte écrit" };
  var NOTIF_LABELS = { aucune: "client pas encore informé", notifiee: "notification écrite au client", acceptee: "prise d'acte ou acceptation écrite du client" };
  var LITIGE_LABELS = { aucun: "aucune réserve ni avoir", avoir: "avoir ou somme à déduire", reserves: "réserves ou réclamation du client" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Nature de l'opération", "Créance cédée", "Écrit", "Clause d'incessibilité", "Information du client",
    "Exceptions du client", "Délai de paiement", "Durée financée", "Coût du financement", "Retenue de garantie",
    "Risque d'impayé", "Paiement libératoire"
  ];
  var DEFAULTS = {
    role: "cedant",
    mode: "affacturage",
    recours: "avec",
    montant: 18000,
    execution: "executee",
    dateFacture: "2026-11-12",
    dateEcheance: "2027-01-11",
    dateCession: "2026-11-16",
    clauseIncessibilite: "presente",
    debiteurPro: "pro",
    ecrit: "oui",
    notification: "aucune",
    litige: "avoir",
    commission: 0.8,
    tauxFinancement: 5.5,
    retenueGarantie: 10,
    fraisFixes: 15
  };
  var REPERE_TAUX = 20;
  var DELAI_MAX = 60;
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  function clean(v) { return String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", "."); }
  function num(v, min, max, def) {
    var n = parseFloat(clean(v));
    if (!isFinite(n)) return def;
    n = Math.floor(n);
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  }
  function dec(v, min, max, def) {
    var n = parseFloat(clean(v));
    if (!isFinite(n)) return def;
    n = Math.round(n * 100) / 100;
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
  function daysBetween(a, b) { return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000); }
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
  function fmtPct(x) {
    var r = Math.round(x * 10) / 10;
    var s = r.toFixed(1).replace(".", ",");
    return s.slice(-2) === ",0" ? s.slice(0, -2) : s;
  }
  function plural(n, one, many) { return n + " " + (n > 1 ? many : one); }

  function computeFinancement(montant, commission, taux, retenue, frais, jours) {
    var finance = Math.round(montant * (100 - retenue) / 100);
    var commissionEur = Math.round(montant * commission / 100);
    var agios = jours > 0 ? Math.round(finance * taux / 100 * jours / 365) : 0;
    var fraisEur = montant > 0 ? frais : 0;
    var cout = commissionEur + agios + fraisEur;
    var net = Math.max(0, finance - cout);
    var retenueEur = montant - finance;
    var coutPct = montant > 0 ? cout / montant * 100 : 0;
    var tauxAnnuel = (jours > 0 && finance > 0) ? cout / finance * 365 / jours * 100 : null;
    return { finance: finance, commissionEur: commissionEur, agios: agios, frais: fraisEur, cout: cout, net: net, retenueEur: retenueEur, coutPct: coutPct, tauxAnnuel: tauxAnnuel };
  }

  function computeCession(input) {
    var i = input || {};
    var role = pick(i.role, ROLE_LABELS, DEFAULTS.role);
    var mode = pick(i.mode, MODE_LABELS, DEFAULTS.mode);
    var recours = pick(i.recours, RECOURS_LABELS, DEFAULTS.recours);
    var execution = pick(i.execution, EXECUTION_LABELS, DEFAULTS.execution);
    var clauseIncessibilite = pick(i.clauseIncessibilite, CLAUSE_LABELS, DEFAULTS.clauseIncessibilite);
    var debiteurPro = pick(i.debiteurPro, DEBITEUR_LABELS, DEFAULTS.debiteurPro);
    var ecrit = pick(i.ecrit, ECRIT_LABELS, DEFAULTS.ecrit);
    var notification = pick(i.notification, NOTIF_LABELS, DEFAULTS.notification);
    var litige = pick(i.litige, LITIGE_LABELS, DEFAULTS.litige);
    var montant = num(i.montant, 0, 1000000000, 0);
    var commission = dec(i.commission, 0, 20, 0);
    var taux = dec(i.tauxFinancement, 0, 50, 0);
    var retenue = dec(i.retenueGarantie, 0, 100, 0);
    var frais = num(i.fraisFixes, 0, 100000, 0);
    var dF = parseDate(i.dateFacture), dE = parseDate(i.dateEcheance), dC = parseDate(i.dateCession);
    var delaiPaiement = (dF && dE) ? daysBetween(dF, dE) : null;
    var jours = (dC && dE) ? daysBetween(dC, dE) : null;
    var f = computeFinancement(montant, commission, taux, retenue, frais, jours && jours > 0 ? jours : 0);
    var dailly = mode === "dailly", aff = mode === "affacturage", civ = mode === "civile";
    var acceptDailly = dailly && notification === "acceptee";
    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    // 1
    if (aff) add(POINTS[0], "info", "Le factor paie la facture et prend votre place de créancier par subrogation (articles 1346-1 et 1346-5 du code civil). La subrogation doit être expresse et consentie en même temps que le paiement.");
    else if (dailly) add(POINTS[0], "info", "La banque reçoit la créance par la seule remise d'un bordereau (articles L313-23 à L313-34 du code monétaire et financier). La cession prend effet à la date portée sur le bordereau (article L313-27).");
    else add(POINTS[0], "info", "Le cessionnaire reçoit la créance par un contrat de cession (articles 1321 à 1326 du code civil). L'accord du client n'est pas requis, sauf si la créance a été stipulée incessible.");
    // 2
    if (execution === "executee") add(POINTS[1], "ok", "Prestation exécutée et facture émise : la créance est née et chiffrée. C'est le cas le plus simple à céder ou à financer.");
    else if (execution === "partielle") add(POINTS[1], "warn", "Seule la partie exécutée et facturée est solide. Cédez la facture de cette partie, pas le montant total du devis.");
    else if (aff) add(POINTS[1], "bad", "Pas de facture, pas de paiement à subroger : le factor paie une facture émise, il ne paie pas un devis. Attendez l'exécution et la facture.");
    else add(POINTS[1], "warn", "La loi permet de céder une créance future (article 1321 du code civil" + (dailly ? ", article L313-23 du code monétaire et financier" : "") + "), mais le client pourra opposer tout défaut d'exécution. Le cessionnaire le sait et le prix s'en ressent.");
    // 3
    if (ecrit === "oui") add(POINTS[2], "ok", civ ? "Écrit exigé à peine de nullité (article 1322 du code civil) : fait." : (dailly ? "Bordereau avec les mentions de l'article L313-23 du code monétaire et financier : fait." : "Quittance subrogative expresse, datée du jour du paiement (article 1346-1 du code civil) : fait."));
    else if (ecrit === "incomplet") {
      if (dailly) add(POINTS[2], "bad", "Un titre auquel manque une des mentions de l'article L313-23 du code monétaire et financier ne vaut pas acte de cession de créances professionnelles.");
      else if (civ) add(POINTS[2], "warn", "Vérifiez que l'écrit désigne la créance (client, facture, montant, échéance) et qu'il est signé. L'article 1322 du code civil exige un écrit.");
      else add(POINTS[2], "warn", "La subrogation doit être expresse et consentie au moment du paiement (article 1346-1 du code civil). Faites reprendre la quittance.");
    } else {
      if (dailly) add(POINTS[2], "bad", "Sans bordereau, pas de cession Dailly (article L313-23 du code monétaire et financier).");
      else if (civ) add(POINTS[2], "bad", "Sans écrit, la cession de créance est nulle (article 1322 du code civil).");
      else add(POINTS[2], "bad", "Sans subrogation expresse, le factor n'a pas de droit propre contre votre client (article 1346-1 du code civil).");
    }
    // 4
    if (clauseIncessibilite === "aucune") add(POINTS[3], "ok", "Aucune clause n'interdit de céder la facture.");
    else if (debiteurPro === "pro") add(POINTS[3], "info", "Entre entreprises qui exercent une activité de production, de distribution ou de services, la clause qui interdit au cocontractant de céder ses créances à des tiers est nulle (article L442-3 c) du code de commerce). Prévenez quand même le client, pour garder la relation.");
    else add(POINTS[3], "bad", "Hors du champ de l'article L442-3 c) du code de commerce, une créance stipulée incessible ne se cède pas sans l'accord du client (article 1321 du code civil). Obtenez son accord écrit.");
    // 5
    if (notification === "aucune") {
      if (dailly) add(POINTS[4], "warn", "La cession est opposable aux tiers à la date du bordereau (article L313-27), mais tant que la banque n'a pas notifié, le client peut encore vous payer (article L313-28 du code monétaire et financier).");
      else if (aff) add(POINTS[4], "warn", "La subrogation n'est opposable au client que si elle lui a été notifiée ou s'il en a pris acte (article 1346-5 du code civil). D'ici là, il peut vous payer.");
      else add(POINTS[4], "warn", "La cession n'est opposable au client que si elle lui a été notifiée ou s'il en a pris acte (article 1324 du code civil). D'ici là, il peut vous payer.");
    } else if (notification === "notifiee") {
      add(POINTS[4], "ok", dailly ? "Notification faite : le client ne se libère valablement qu'auprès de la banque (article L313-28 du code monétaire et financier)." : "Notification faite : la " + (aff ? "subrogation" : "cession") + " est opposable au client (article " + (aff ? "1346-5" : "1324") + " du code civil).");
    } else {
      add(POINTS[4], "ok", dailly ? "Acte d'acceptation écrit (article L313-29 du code monétaire et financier) : le client s'engage à payer directement la banque." : "Le client a pris acte : la " + (aff ? "subrogation" : "cession") + " lui est opposable (article " + (aff ? "1346-5" : "1324") + " du code civil).");
    }
    // 6
    if (litige === "aucun") add(POINTS[5], "ok", "Aucune réserve ni avoir connu : le client n'a rien à opposer au cessionnaire à ce stade.");
    else if (acceptDailly) add(POINTS[5], "info", "Après l'acte d'acceptation, le client ne peut plus opposer à la banque les exceptions fondées sur ses rapports personnels avec vous, sauf si elle a agi sciemment à son détriment (article L313-29). Le différend reste à régler entre vous et le client.");
    else if (litige === "avoir") add(POINTS[5], "warn", "Le client peut opposer au cessionnaire la compensation des dettes connexes (articles 1324 et 1346-5 du code civil). Déduisez l'avoir avant de céder, ou cédez le solde.");
    else add(POINTS[5], "bad", "Le client peut opposer au cessionnaire l'exception d'inexécution ou la résolution (articles 1324 et 1346-5 du code civil). Une facture contestée se finance mal : levez les réserves avant.");
    // 7
    if (delaiPaiement === null || delaiPaiement < 0) add(POINTS[6], "warn", "Dates de facture ou d'échéance absentes ou incohérentes : le délai de paiement n'est pas calculé.");
    else if (delaiPaiement <= DELAI_MAX) add(POINTS[6], "ok", "Échéance à " + plural(delaiPaiement, "jour", "jours") + " de la facture, dans la limite de soixante jours après la date d'émission (article L441-10 du code de commerce).");
    else add(POINTS[6], "warn", "Échéance à " + delaiPaiement + " jours de la facture. Au-delà de soixante jours après l'émission, seul un délai de quarante-cinq jours fin de mois expressément stipulé est admis (article L441-10 du code de commerce). Vérifiez le délai convenu.");
    // 8
    if (jours === null) add(POINTS[7], "warn", "Date de cession ou d'échéance manquante : la durée financée n'est pas calculée.");
    else if (jours <= 0) add(POINTS[7], "warn", "L'échéance est déjà passée à la date de cession : la facture est en retard. Relancez le client avant de la céder, et vérifiez que le financeur la prend encore.");
    else add(POINTS[7], "info", plural(jours, "jour", "jours") + " entre la cession, le " + fmtDate(dC) + ", et l'échéance, le " + fmtDate(dE) + ".");
    // 9
    var coutTxt = "Coût estimé " + fmtEur(f.cout) + " (commission " + fmtEur(f.commissionEur) + ", intérêts " + fmtEur(f.agios) + ", frais " + fmtEur(f.frais) + "), soit " + fmtPct(f.coutPct) + " % de la facture";
    if (montant === 0) add(POINTS[8], "warn", "Montant de facture nul : rien à calculer.");
    else if (f.tauxAnnuel !== null && f.tauxAnnuel > REPERE_TAUX) add(POINTS[8], "warn", coutTxt + " et environ " + fmtPct(f.tauxAnnuel) + " % par an sur la somme avancée, au-dessus du repère de " + REPERE_TAUX + " % de l'outil. Comparez avec un découvert, un escompte ou un acompte.");
    else add(POINTS[8], "info", coutTxt + (f.tauxAnnuel !== null ? ", et environ " + fmtPct(f.tauxAnnuel) + " % par an sur la somme avancée." : "."));
    // 10
    if (f.retenueEur > 0) add(POINTS[9], "info", fmtEur(f.retenueEur) + " retenus (" + fmtPct(retenue) + " %) : en principe versés après le paiement du client, selon votre contrat. Ils ne sont pas perdus, mais ils ne sont pas avancés.");
    else add(POINTS[9], "info", "Aucune retenue : toute la facture est avancée, moins le coût.");
    // 11
    if (civ) add(POINTS[10], "info", recours === "avec" ? "Vous vous êtes engagé sur la solvabilité du client : la garantie ne joue que jusqu'au prix retiré de la cession, et pour la solvabilité actuelle sauf mention expresse (article 1326 du code civil)." : "Vous garantissez l'existence de la créance, pas la solvabilité du client, sauf engagement de votre part (article 1326 du code civil).");
    else add(POINTS[10], "info", recours === "avec" ? "Si le client ne paie pas, le " + (aff ? "factor" : "banquier") + " se retourne contre vous : le risque d'impayé reste chez vous." : "Garantie d'impayé : lisez les plafonds par client, les créances exclues et les cas où le recours revient (litige, réserves, facture contestée).");
    // 12
    if (role === "debiteur") add(POINTS[11], "info", notification === "aucune" ? "Tant que vous n'êtes pas informé de façon régulière, payer le fournisseur vous libère. Un simple e-mail de changement de coordonnées bancaires n'est pas une notification : vérifiez par téléphone au numéro habituel." : "Après la notification, payez le cessionnaire. Payer l'ancien compte du fournisseur ne vous libère plus et peut vous obliger à payer deux fois.");
    else add(POINTS[11], "info", notification === "aucune" ? "Si le client vous paie, reversez la somme au cessionnaire comme prévu au contrat. Ne laissez pas circuler deux coordonnées bancaires différentes." : "Les coordonnées du cessionnaire doivent figurer sur la facture et dans la notification. Si le client vous paie quand même, reversez.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) { if (c.statut === "ok") nbOk++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");
    var badPoints = controles.filter(function (c) { return c.statut === "bad"; }).map(function (c) { return c.point.toLowerCase(); });
    var resume = "Net versé à la cession environ " + fmtEur(f.net) + " sur une facture de " + fmtEur(montant) + ", coût " + fmtEur(f.cout) + " (" + fmtPct(f.coutPct) + " %).";
    var verdict;
    if (nbBad > 0) verdict = plural(nbBad, "point bloquant", "points bloquants") + " : " + badPoints.join(", ") + ". " + (role === "cedant" ? "À régler avant de céder cette facture." : "À vérifier avant de payer qui que ce soit.");
    else verdict = "Aucun point bloquant, " + (nbWarn > 0 ? nbWarn + " à compléter. " : "rien à compléter. ") + resume;

    var clause = [
      "Article [X] : Cession des créances et paiement",
      "1. Le prestataire peut céder ou nantir les créances nées du présent devis, notamment au profit d'un établissement de crédit ou d'une société d'affacturage.",
      "2. Entre professionnels, une stipulation des conditions d'achat du client interdisant cette cession est nulle dans les conditions de l'article L442-3 c) du code de commerce.",
      "3. Le client est informé de la cession par écrit. À compter de cette information, il ne se libère valablement qu'entre les mains du cessionnaire désigné.",
      "4. Les coordonnées bancaires de paiement ne peuvent être modifiées que par un écrit signé du prestataire et, le cas échéant, du cessionnaire.",
      "5. Le client signale par écrit toute réserve sur la prestation dans les [8] jours de sa réalisation.",
      "6. Les factures sont payables à [30] jours à compter de leur date d'émission, sans dépasser soixante jours (article L441-10 du code de commerce)."
    ].join("\n");

    var actionMap = {
      "Créance cédée": execution === "partielle" ? "Cédez la facture de la partie exécutée, pas le montant total du devis." : "Attendez l'exécution et la facture avant de céder ou de financer.",
      "Écrit": civ ? "Rédigez et signez l'acte de cession (client, facture, montant, échéance)." : (dailly ? "Complétez le bordereau avec les mentions de l'article L313-23 du code monétaire et financier." : "Faites établir la quittance subrogative au moment du paiement par le factor."),
      "Clause d'incessibilité": "Demandez l'accord écrit du client avant de céder la facture.",
      "Information du client": role === "cedant" ? "Envoyez la notification au client avec les coordonnées du cessionnaire (modèle ci-dessous)." : "Demandez une notification écrite, signée du fournisseur et du cessionnaire, avant de changer de coordonnées de paiement.",
      "Exceptions du client": role === "cedant" ? (litige === "avoir" ? "Déduisez l'avoir ou cédez seulement le solde de la facture." : "Levez les réserves par écrit avant de céder la facture.") : (litige === "avoir" ? "Signalez l'avoir par écrit au cessionnaire dès la notification." : "Écrivez vos réserves au fournisseur et au cessionnaire avant l'échéance."),
      "Délai de paiement": "Vérifiez le délai de paiement convenu et la date d'échéance portée sur la facture.",
      "Durée financée": "Vérifiez les dates de cession et d'échéance, et relancez le client si la facture est échue.",
      "Coût du financement": montant === 0 ? "Indiquez le montant de la facture." : "Comparez ce coût annuel avec un découvert, un escompte pour paiement anticipé ou un acompte demandé dès le devis."
    };
    var actions = [];
    controles.forEach(function (c) { if (c.statut === "bad") actions.push(actionMap[c.point]); });
    controles.forEach(function (c) { if (c.statut === "warn") actions.push(actionMap[c.point]); });
    actions.push(role === "cedant" ? "Gardez avec le devis et la facture la date de cession, l'échéance et la preuve de notification." : "Archivez la notification et la preuve de votre paiement avec la facture.");

    var dateFTxt = dF ? fmtDate(dF) : "[date]";
    var dateETxt = dE ? fmtDate(dE) : "[date]";
    var dateCTxt = dC ? fmtDate(dC) : "[date]";
    var lines;
    if (role === "cedant") {
      var qui = aff ? "[nom du factor]" : (dailly ? "[nom de la banque]" : "[nom du cessionnaire]");
      var corps = aff ? "a été payée par " + qui + ", qui est subrogé dans nos droits." : (dailly ? "a été cédée à " + qui + " par bordereau, selon les articles L313-23 et suivants du code monétaire et financier." : "a été cédée à " + qui + " par acte du " + dateCTxt + ".");
      lines = ["Objet : facture n° [référence] du " + dateFTxt + " : paiement à " + qui, "", "Bonjour,", "", "Nous vous informons que la facture n° [référence] du " + dateFTxt + ", d'un montant de " + fmtEur(montant) + ", à échéance du " + dateETxt + ", " + corps, "", "Pour être libératoire, le paiement doit être fait sur le compte de " + qui + ", dont les coordonnées figurent sur l'attestation jointe, signée par nous et par lui. Avant tout virement, vous pouvez confirmer ce changement en appelant notre numéro habituel."];
      if (litige === "avoir") lines.push("", "L'avoir n° [référence] reste à déduire. Le montant à payer est de [montant].");
      if (litige === "reserves") lines.push("", "Nous restons votre interlocuteur pour vos réserves sur la prestation.");
      lines.push("", "Cordialement");
    } else {
      lines = ["Objet : facture n° [référence] : demande de paiement à un autre bénéficiaire", "", "Bonjour,", "", "Nous avons reçu une demande de paiement de la facture n° [référence] (" + fmtEur(montant) + ", à échéance du " + dateETxt + ") sur un autre compte que le vôtre."];
      if (notification === "aucune") lines.push("", "Avant de modifier nos coordonnées de paiement, merci de nous adresser une notification écrite de la cession, signée par vous et par le cessionnaire. Nous la confirmerons aussi par téléphone à votre numéro habituel.");
      else lines.push("", "Nous prenons acte de la cession et réglerons le cessionnaire à l'échéance, sur les coordonnées figurant dans la notification.");
      if (litige === "reserves") lines.push("", "Nos réserves du [date] sur la prestation restent valables.");
      if (litige === "avoir") lines.push("", "L'avoir n° [référence] reste à déduire du montant à payer.");
      lines.push("", "Cordialement");
    }
    var message = lines.join("\n");

    var joursLabel = (jours !== null && jours > 0) ? plural(jours, "jour", "jours") : "Non calculé";
    var tauxLabel = f.tauxAnnuel !== null ? fmtPct(f.tauxAnnuel) + " % par an" : "Non calculé";
    var coutLabel = fmtEur(f.cout) + " (" + fmtPct(f.coutPct) + " %)";
    var recapLines = [
      "Vérificateur de cession de créance et d'affacturage (QuoteBuilder)",
      "Position : " + ROLE_LABELS[role],
      "Opération : " + MODE_LABELS[mode] + ", " + RECOURS_LABELS[recours],
      "Facture : " + fmtEur(montant) + " du " + dateFTxt + ", échéance " + dateETxt,
      "Durée financée : " + joursLabel,
      "Coût : " + coutLabel + " ; ramené à l'année : " + tauxLabel,
      "Net versé à la cession : " + fmtEur(f.net) + " ; retenue versée plus tard : " + fmtEur(f.retenueEur),
      "Client : " + NOTIF_LABELS[notification] + " ; " + LITIGE_LABELS[litige],
      "Clause : " + CLAUSE_LABELS[clauseIncessibilite] + " ; " + DEBITEUR_LABELS[debiteurPro],
      "Contrôles : " + plural(nbOk, "conforme", "conformes") + ", " + nbWarn + " à compléter, " + plural(nbBad, "bloquant", "bloquants") + ", " + plural(nbInfo, "information", "informations"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    return {
      role: role, mode: mode, recours: recours, execution: execution, clauseIncessibilite: clauseIncessibilite, debiteurPro: debiteurPro,
      ecrit: ecrit, notification: notification, litige: litige, montant: montant, commission: commission, taux: taux, retenue: retenue, frais: frais,
      delaiPaiement: delaiPaiement, jours: jours, finance: f.finance, commissionEur: f.commissionEur, agios: f.agios, fraisEur: f.frais,
      cout: f.cout, net: f.net, retenueEur: f.retenueEur, coutPct: f.coutPct, tauxAnnuel: f.tauxAnnuel,
      joursLabel: joursLabel, tauxLabel: tauxLabel, coutLabel: coutLabel,
      controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat,
      verdict: verdict, clause: clause, actions: actions, message: message, recap: recapLines.join("\n")
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, REPERE_TAUX, DELAI_MAX, ROLE_LABELS, MODE_LABELS, RECOURS_LABELS, EXECUTION_LABELS, CLAUSE_LABELS, DEBITEUR_LABELS, ECRIT_LABELS, NOTIF_LABELS, LITIGE_LABELS, computeCession, computeFinancement, buildRecap, fmtEur, fmtDate, fmtPct, parseDate, num, dec, daysBetween };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computeCession(readForm());
      document.getElementById("netOut").textContent = fmtEur(r.net);
      document.getElementById("coutOut").textContent = r.coutLabel;
      document.getElementById("tauxOut").textContent = r.tauxLabel;
      document.getElementById("joursOut").textContent = r.joursLabel;
      document.getElementById("retenueOut").textContent = fmtEur(r.retenueEur);
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
