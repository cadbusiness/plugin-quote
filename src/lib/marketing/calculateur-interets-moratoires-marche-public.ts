/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "calculateur-interets-moratoires-marche-public";
  var ACHETEUR_LABELS = { collectivite: "État, collectivité ou autre pouvoir adjudicateur", sante: "établissement public de santé", entreprise_publique: "entreprise publique", prive: "client privé" };
  var NATURE_LABELS = { fournitures_services: "fournitures ou services", travaux: "travaux" };
  var DEPOT_LABELS = { chorus: "Chorus Pro", plateforme: "plateforme agréée", email: "e-mail ou courrier" };
  var INTERRUPTION_LABELS = { non: "aucune", une: "une interruption", plusieurs: "plusieurs interruptions" };
  var LABEL_SETS = { acheteur: ACHETEUR_LABELS, nature: NATURE_LABELS, depot: DEPOT_LABELS, interruption: INTERRUPTION_LABELS };
  var DELAI_REGLEMENTAIRE = { collectivite: 30, sante: 50, entreprise_publique: 60 };
  var DELAI_ARTICLE = { collectivite: "article R2192-10", sante: "article R2192-11, 1°", entreprise_publique: "article R2192-11, 2°" };
  var BCE_TABLE = { "2024-1": 450, "2024-2": 425, "2025-1": 315, "2025-2": 215, "2026-1": 215, "2026-2": 240 };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Acheteur et délai réglementaire",
    "Délai prévu au marché",
    "Transmission de la facture",
    "Point de départ du délai",
    "Interruption du délai",
    "Retard de paiement",
    "Taux des intérêts moratoires",
    "Base de calcul",
    "Indemnité forfaitaire et frais",
    "Écrit, procédure et avance"
  ];
  var DEFAULTS = {
    acheteur: "collectivite", nature: "travaux", montantMarcheHT: "18000", dureeMois: "1", delaiMarche: "30", depot: "chorus",
    montantTTC: "21600", retenue: "0", dateServiceFait: "2026-09-11", dateReception: "2026-09-14",
    interruption: "non", datePaiement: "2026-11-13", dateNotif: "", datePieces: "", tauxBce: "", frais: "0"
  };
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var JOUR_MS = 86400000;
  function dec(v, max) {
    var s = String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    var n = parseFloat(s);
    if (!isFinite(n) || n < 0) n = 0;
    if (n > max) n = max;
    return Math.round(n * 100);
  }
  function num(v, max) { return Math.round(dec(v, max) / 100); }
  function isBlank(v) { return String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "") === ""; }
  function groupInt(n) {
    var s = String(n);
    var out = "";
    while (s.length > 3) { out = " " + s.slice(-3) + out; s = s.slice(0, -3); }
    return s + out;
  }
  function fmtEur(cents) {
    var c = Math.round(cents);
    var e = Math.floor(c / 100);
    var r = c % 100;
    return groupInt(e) + (r ? "," + (r < 10 ? "0" : "") + r : "") + " €";
  }
  function fmtTaux(c) {
    var e = Math.floor(c / 100);
    var r = c % 100;
    if (!r) return e + " %";
    return e + "," + (r < 10 ? "0" : "") + r + " %";
  }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s == null ? "" : s));
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return d;
  }
  function fmtDate(d) {
    if (!d) return "[date]";
    return JOURS[d.getUTCDay()] + " " + (d.getUTCDate() === 1 ? "1er" : d.getUTCDate()) + " " + MOIS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function isoDate(d) { return d ? d.toISOString().slice(0, 10) : ""; }
  function addDays(d, n) { return new Date(d.getTime() + n * JOUR_MS); }
  function diffDays(a, b) { return Math.round((a.getTime() - b.getTime()) / JOUR_MS); }
  function reportOuvre(d) {
    var j = d.getUTCDay();
    if (j === 6) return addDays(d, 2);
    if (j === 0) return addDays(d, 1);
    return d;
  }
  function semestre(d) { return d.getUTCFullYear() + "-" + (d.getUTCMonth() < 6 ? 1 : 2); }
  function debutSemestre(d) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() < 6 ? 0 : 6, 1)); }
  function pick(set, v, def) { return Object.prototype.hasOwnProperty.call(set, v) ? v : def; }
  function plural(n, un, plusieurs) { return n + " " + (n > 1 ? plusieurs : un); }
  function normalize(inp) {
    var i = inp || {};
    var o = {};
    Object.keys(LABEL_SETS).forEach(function (k) { o[k] = pick(LABEL_SETS[k], i[k], DEFAULTS[k]); });
    o.marcheCents = dec(i.montantMarcheHT, 100000000);
    o.dureeMois = num(i.dureeMois, 600);
    o.delaiMarche = num(i.delaiMarche, 365);
    o.ttcCents = dec(i.montantTTC, 100000000);
    o.retenueCents = dec(i.retenue, 100000000);
    o.fraisCents = dec(i.frais, 10000000);
    o.tauxSaisi = isBlank(i.tauxBce) ? null : dec(i.tauxBce, 20);
    o.serviceFait = parseDate(i.dateServiceFait);
    o.reception = parseDate(i.dateReception);
    o.paiement = parseDate(i.datePaiement);
    o.notif = parseDate(i.dateNotif);
    o.pieces = parseDate(i.datePieces);
    return o;
  }
  function computeMoratoires(inp) {
    var o = normalize(inp);
    var c = [];
    var add = function (statut, texte) { c.push({ point: POINTS[c.length], statut: statut, texte: texte }); };
    var prive = o.acheteur === "prive";
    var reg = prive ? 0 : DELAI_REGLEMENTAIRE[o.acheteur];
    var delai = prive ? 0 : (o.delaiMarche > 0 ? Math.min(o.delaiMarche, reg) : reg);
    var r = { input: o, delaiReglementaire: reg, delai: delai, depart: null, echeance: null, echeanceReportee: false, retard: null, tauxBceC: null, tauxSource: "aucun", tauxC: null, baseCents: 0, interetsCents: 0, indemniteCents: 0, complementCents: 0, totalCents: 0, dateLimiteVersement: null, avanceDue: false };

    // 1. Acheteur
    if (prive) add("bad", "Client privé : ces règles ne s'appliquent pas. Entre entreprises, les pénalités de retard relèvent du code de commerce.");
    else add("info", "Délai réglementaire : " + reg + " jours (" + DELAI_ARTICLE[o.acheteur] + ").");

    // 2. Délai du marché
    if (prive) add("info", "Non calculé : client privé.");
    else if (o.delaiMarche === 0) add("info", "Le marché ne fixe pas de délai : le délai réglementaire de " + reg + " jours s'applique.");
    else if (o.delaiMarche <= reg) add("ok", "Le marché prévoit " + o.delaiMarche + " jours, dans la limite réglementaire de " + reg + " jours.");
    else add("warn", "Le marché prévoit " + o.delaiMarche + " jours, plus que les " + reg + " jours permis (article L2192-10) : le calcul retient " + reg + " jours.");

    // 3. Transmission
    if (o.depot === "chorus") add("ok", "Facture déposée sur Chorus Pro : la date de réception y est tracée.");
    else if (o.depot === "plateforme" && o.nature === "travaux") add("warn", "Pour une facture de marché de travaux, Chorus Pro reste le circuit à utiliser : vérifiez que la facture y est bien arrivée.");
    else if (o.depot === "plateforme") add("ok", "Facture transmise par une plateforme agréée, possible depuis septembre 2026 : gardez la date de réception.");
    else add("warn", "Le titulaire d'un marché public transmet ses factures sous forme électronique (article L2192-1) : déposez la facture sur Chorus Pro, sinon la date de réception sera discutée.");

    // 4. Point de départ
    var departOk = false;
    if (prive) add("info", "Non calculé : client privé.");
    else if (!o.reception) add("bad", "Date de réception de la facture à saisir.");
    else if (!o.serviceFait) { r.depart = o.reception; departOk = true; add("warn", "Fin des prestations non saisie : si la facture est arrivée avant, le délai court de la fin des prestations (article R2192-13)."); }
    else if (diffDays(o.reception, o.serviceFait) < 0) { r.depart = o.serviceFait; departOk = true; add("warn", "Facture reçue le " + fmtDate(o.reception) + ", avant la fin des prestations le " + fmtDate(o.serviceFait) + " : le délai court du " + fmtDate(o.serviceFait) + " (article R2192-13)."); }
    else { r.depart = o.reception; departOk = true; add("ok", "Le délai court de la réception de la facture, le " + fmtDate(o.reception) + " (article R2192-12)."); }

    // 5. Interruption
    var echeanceBrute = null;
    if (prive) add("info", "Non calculé : client privé.");
    else if (!departOk) add("info", "Non calculé : point de départ à compléter.");
    else if (o.interruption === "non") { echeanceBrute = addDays(r.depart, delai); add("ok", "Aucune interruption notifiée."); }
    else if (!o.notif || !o.pieces) add("bad", "Dates de la notification d'interruption et de réception des pièces à saisir.");
    else if (diffDays(o.notif, r.depart) < 0 || diffDays(o.pieces, o.notif) < 0) add("bad", "Dates incohérentes : la notification suit le départ du délai, et les pièces suivent la notification.");
    else {
      var initiale = reportOuvre(addDays(r.depart, delai));
      var solde = delai - diffDays(o.notif, r.depart);
      var nouveau = Math.max(30, solde);
      echeanceBrute = addDays(o.pieces, nouveau);
      r.nouveauDelai = nouveau;
      var base5 = "Délai interrompu le " + fmtDate(o.notif) + " ; nouveau délai de " + nouveau + " jours à compter de la réception des pièces le " + fmtDate(o.pieces) + " (article R2192-29).";
      if (o.interruption === "plusieurs") add("warn", "Une seule interruption est permise (article R2192-27) : le calcul retient la première. " + base5);
      else if (diffDays(o.notif, initiale) > 0) add("warn", "Interruption notifiée après l'échéance du délai initial (" + fmtDate(initiale) + ") : faites vérifier sa validité. " + base5);
      else add("info", base5);
    }

    // 6. Retard
    if (echeanceBrute) {
      r.echeance = reportOuvre(echeanceBrute);
      r.echeanceReportee = diffDays(r.echeance, echeanceBrute) > 0;
    }
    var rep = r.echeanceReportee ? " (dernier jour reporté au lundi)" : "";
    if (!r.echeance) add("info", "Non calculé : complétez les points bloquants.");
    else if (!o.paiement) add("bad", "Date de mise en paiement à saisir (mettez la date du jour si vous attendez encore).");
    else if (diffDays(o.paiement, r.depart) < 0) add("bad", "La mise en paiement précède le départ du délai : vérifiez les dates.");
    else {
      r.retard = Math.max(0, diffDays(o.paiement, r.echeance));
      if (r.retard === 0) add("ok", "Mise en paiement le " + fmtDate(o.paiement) + ", dans le délai (échéance le " + fmtDate(r.echeance) + rep + ").");
      else {
        r.dateLimiteVersement = addDays(o.paiement, 45);
        add("warn", "Échéance le " + fmtDate(r.echeance) + rep + ", mise en paiement le " + fmtDate(o.paiement) + " : " + plural(r.retard, "jour", "jours") + " de retard. Intérêts et indemnité sont dus de plein droit (article L2192-13), à verser au plus tard le " + fmtDate(r.dateLimiteVersement) + " (article R2192-36).");
      }
    }

    // 7. Taux
    var tauxBloque = false;
    if (!r.retard) add("info", "Pas d'intérêts à calculer.");
    else {
      var debut = addDays(r.echeance, 1);
      var sem = debutSemestre(debut);
      if (o.tauxSaisi !== null) { r.tauxBceC = o.tauxSaisi; r.tauxSource = "saisi"; r.tauxC = o.tauxSaisi + 800; add("info", "Taux de la BCE saisi : " + fmtTaux(r.tauxBceC) + ", soit " + fmtTaux(r.tauxC) + " (article R2192-31)."); }
      else if (Object.prototype.hasOwnProperty.call(BCE_TABLE, semestre(debut))) { r.tauxBceC = BCE_TABLE[semestre(debut)]; r.tauxSource = "table"; r.tauxC = r.tauxBceC + 800; add("ok", "Les intérêts courent du " + fmtDate(debut) + ". Taux de la BCE en vigueur le " + fmtDate(sem) + " : " + fmtTaux(r.tauxBceC) + ", plus huit points, soit " + fmtTaux(r.tauxC) + " (article R2192-31)."); }
      else { tauxBloque = true; add("bad", "Les intérêts courent du " + fmtDate(debut) + ". Le taux de la BCE en vigueur le " + fmtDate(sem) + " n'est pas dans l'outil : saisissez-le (tableau des taux directeurs de la Banque de France)."); }
    }

    // 8. Base
    var baseOk = false;
    if (o.ttcCents === 0) add("bad", "Montant TTC de la facture à saisir.");
    else if (o.retenueCents > o.ttcCents) add("bad", "La retenue de garantie dépasse le montant de la facture.");
    else { baseOk = true; r.baseCents = o.ttcCents - o.retenueCents; add("info", "Base : " + fmtEur(r.baseCents) + " TTC (montant TTC diminué de la retenue de garantie, article R2192-33)."); }

    // 9. Indemnité
    if (r.retard && !prive) {
      r.indemniteCents = 4000;
      r.complementCents = Math.max(0, o.fraisCents - 4000);
      if (r.complementCents > 0) add("info", "Indemnité forfaitaire de 40 € (article D2192-35), plus " + fmtEur(r.complementCents) + " d'indemnisation complémentaire à demander sur justificatifs (article L2192-13).");
      else add("info", "Indemnité forfaitaire de 40 € (article D2192-35), due de plein droit en cas de retard.");
    } else add("info", "Pas d'indemnité : pas de retard constaté.");

    // 10. Écrit, procédure, avance
    var seuil = o.nature === "travaux" ? 10000000 : 6000000;
    if (o.marcheCents === 0) add("info", "Montant du marché non saisi : écrit, procédure et avance non vérifiés.");
    else {
      var ecrit = o.marcheCents >= 2500000 ? "Écrit obligatoire dès 25 000 € HT (article R2112-1)" : "Sous 25 000 € HT, l'écrit n'est pas imposé (article R2112-1) : gardez le devis accepté et le bon de commande";
      var proc = o.marcheCents < seuil ? "sous " + fmtEur(seuil) + " HT, l'acheteur peut commander sans publicité ni mise en concurrence (article R2122-8)" : "à partir de " + fmtEur(seuil) + " HT, l'acheteur doit organiser une publicité et une mise en concurrence";
      r.avanceDue = o.marcheCents > 5000000 && o.dureeMois > 2;
      if (r.avanceDue) add("warn", ecrit + " ; " + proc + " ; avance obligatoire, sauf si vous la refusez (articles R2191-3 et R2191-5) : vérifiez qu'elle figure au marché.");
      else add("info", ecrit + " ; " + proc + " ; pas d'avance obligatoire (plus de 50 000 € HT et plus de deux mois, article R2191-3).");
    }

    if (r.retard && r.tauxC !== null && baseOk) r.interetsCents = Math.round(r.baseCents * r.tauxC * r.retard / (10000 * 365));
    r.totalCents = r.interetsCents + r.indemniteCents + r.complementCents;

    r.controles = c;
    r.nbOk = c.filter(function (x) { return x.statut === "ok"; }).length;
    r.nbWarn = c.filter(function (x) { return x.statut === "warn"; }).length;
    r.nbBad = c.filter(function (x) { return x.statut === "bad"; }).length;
    r.nbInfo = c.filter(function (x) { return x.statut === "info"; }).length;
    r.etat = r.nbBad ? "bad" : r.nbWarn ? "warn" : "ok";

    var prefix = r.nbWarn ? "Aucun point bloquant, " + r.nbWarn + " à compléter." : "Aucun point bloquant.";
    if (prive) r.verdict = "Client privé : ce calculateur vise les acheteurs publics. Utilisez les pénalités de retard prévues entre entreprises.";
    else if (r.nbBad) r.verdict = plural(r.nbBad, "point bloquant", "points bloquants") + " : complétez ou corrigez avant de réclamer quoi que ce soit.";
    else if (r.retard) r.verdict = prefix + " Intérêts moratoires : " + fmtEur(r.interetsCents) + ", indemnité forfaitaire : 40 €" + (r.complementCents ? ", complément : " + fmtEur(r.complementCents) : "") + ", total : " + fmtEur(r.totalCents) + ".";
    else r.verdict = prefix + " Payé dans le délai : rien à réclamer.";

    r.echeanceLabel = r.echeance ? fmtDate(r.echeance) : "Non calculée";
    r.retardLabel = r.retard === null ? "Non calculé" : plural(r.retard, "jour", "jours");
    r.tauxLabel = r.tauxC !== null ? fmtTaux(r.tauxC) + " (BCE " + fmtTaux(r.tauxBceC) + " + 8 points)" : (tauxBloque ? "À saisir" : "Sans objet");
    r.interetsLabel = fmtEur(r.interetsCents);
    r.indemniteLabel = fmtEur(r.indemniteCents + r.complementCents);
    r.totalLabel = fmtEur(r.totalCents);
    r.compteursLabel = r.nbBad + " / " + r.nbWarn;

    var dRef = prive ? 30 : reg;
    if (prive) {
      r.clause = [
        "Article [X] : Paiement (client privé)",
        "Ce calculateur vise les acheteurs publics : ce client n'en est pas un.",
        "Pour un client privé, les pénalités de retard relèvent du code de commerce.",
        "Écrivez le délai de paiement convenu, dans les limites légales.",
        "Écrivez le taux des pénalités de retard et leur point de départ.",
        "Rappelez l'indemnité forfaitaire pour frais de recouvrement.",
        "Voyez le calculateur de pénalités de retard de paiement de QuoteBuilder."
      ].join("\n");
    } else {
      r.clause = [
        "Article [X] : Paiement et retard de paiement (acheteur public)",
        "Le paiement intervient dans le délai de " + dRef + " jours prévu par le code de la commande publique (" + DELAI_ARTICLE[o.acheteur] + "), à compter de la réception de la facture.",
        "La facture est déposée sur Chorus Pro et porte les références communiquées par l'acheteur : SIRET de la structure, code service et numéro d'engagement lorsqu'ils existent.",
        "Tout retard fait courir de plein droit des intérêts moratoires au taux de la Banque centrale européenne majoré de huit points (articles L2192-13 et R2192-31), sur le montant TTC diminué de la retenue de garantie.",
        "Le retard ouvre droit à l'indemnité forfaitaire pour frais de recouvrement de 40 € (article D2192-35) et, sur justificatifs, à une indemnisation complémentaire.",
        "Le délai ne peut être interrompu qu'une fois, par une notification qui précise les pièces à fournir (articles R2192-27 et R2192-28).",
        r.avanceDue ? "Le titulaire bénéficie de l'avance prévue à l'article R2191-3, sauf s'il la refuse." : "Une avance peut être prévue au marché même lorsqu'elle n'est pas obligatoire (article R2191-4)."
      ].join("\n");
    }

    var a = [];
    if (r.nbBad) a.push("Complétez ou corrigez les points marqués bloquants.");
    if (r.retard && !r.nbBad) {
      a.push("Envoyez la demande d'intérêts moratoires et d'indemnité à l'acheteur, avec le calcul ci-dessous.");
      a.push("Notez la date limite de versement dans le dossier : " + fmtDate(r.dateLimiteVersement) + ".");
    }
    if (o.depot === "email") a.push("Déposez la facture sur Chorus Pro et gardez l'accusé de dépôt.");
    if (r.avanceDue) a.push("Vérifiez que l'avance figure au marché, ou écrivez que vous la refusez.");
    if (r.complementCents > 0) a.push("Rassemblez les justificatifs des frais de recouvrement engagés.");
    a.push("Pour le prochain devis, demandez avant de chiffrer le SIRET de l'acheteur, le code service et le numéro d'engagement à porter sur la facture.");
    a.push("Gardez dans le dossier la date de réception de la facture et la date de mise en paiement.");
    r.actions = a;

    if (r.retard && !r.nbBad) {
      r.message = [
        "Objet : intérêts moratoires sur notre facture reçue le " + fmtDate(o.reception),
        "",
        "Bonjour,",
        "",
        "Notre facture de " + fmtEur(o.ttcCents) + " TTC, reçue le " + fmtDate(o.reception) + ", a été mise en paiement le " + fmtDate(o.paiement) + " pour une échéance au " + fmtDate(r.echeance) + ", soit " + plural(r.retard, "jour", "jours") + " de retard.",
        "",
        "En application des articles L2192-13, R2192-31 et D2192-35 du code de la commande publique, nous vous remercions de nous verser les intérêts moratoires, " + fmtEur(r.interetsCents) + " au taux de " + fmtTaux(r.tauxC) + ", et l'indemnité forfaitaire de 40 €" + (r.complementCents ? ", ainsi que " + fmtEur(r.complementCents) + " de frais justifiés" : "") + ", soit " + fmtEur(r.totalCents) + ". L'article R2192-36 prévoit leur versement dans les 45 jours suivant la mise en paiement, soit au plus tard le " + fmtDate(r.dateLimiteVersement) + ".",
        "",
        "Le détail du calcul est joint. Nous restons à votre disposition.",
        "",
        "Bien cordialement,"
      ].join("\n");
    } else {
      r.message = [
        "Objet : références de facturation pour notre devis",
        "",
        "Bonjour,",
        "",
        "Pour que notre facture soit traitée sans retard, pourriez-vous nous indiquer le SIRET de votre structure, le code service et le numéro d'engagement à reporter sur Chorus Pro ?",
        "",
        "Nous les reprendrons dans le devis, avec le délai de paiement applicable.",
        "",
        "Bien cordialement,"
      ].join("\n");
    }

    r.recap = [
      "Calcul des intérêts moratoires (acheteur public)",
      "Acheteur : " + ACHETEUR_LABELS[o.acheteur] + " ; délai retenu : " + (prive ? "sans objet" : delai + " jours"),
      "Facture : " + fmtEur(o.ttcCents) + " TTC, transmise par " + DEPOT_LABELS[o.depot] + " ; retenue : " + fmtEur(o.retenueCents),
      "Départ du délai : " + (r.depart ? fmtDate(r.depart) : "non calculé"),
      "Interruption : " + INTERRUPTION_LABELS[o.interruption],
      "Échéance : " + r.echeanceLabel,
      "Mise en paiement : " + (o.paiement ? fmtDate(o.paiement) : "non saisie") + " ; retard : " + r.retardLabel,
      "Taux : " + r.tauxLabel,
      "Intérêts : " + r.interetsLabel + " ; indemnités : " + r.indemniteLabel + " ; total : " + r.totalLabel,
      "Verdict : " + r.verdict,
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");
    return r;
  }
  function buildRecap(inp) { return computeMoratoires(inp).recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, LABEL_SETS, ACHETEUR_LABELS, NATURE_LABELS, DEPOT_LABELS, INTERRUPTION_LABELS, DELAI_REGLEMENTAIRE, BCE_TABLE, computeMoratoires, normalize, buildRecap, fmtEur, fmtTaux, fmtDate, parseDate, isoDate, addDays, diffDays, reportOuvre, dec, num };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var read = function () {
      var v = {};
      Object.keys(DEFAULTS).forEach(function (k) { v[k] = document.getElementById(k).value; });
      return v;
    };
    var render = function () {
      var r = computeMoratoires(read());
      document.getElementById("echeanceOut").textContent = r.echeanceLabel;
      document.getElementById("retardOut").textContent = r.retardLabel;
      document.getElementById("tauxOut").textContent = r.tauxLabel;
      document.getElementById("interetsOut").textContent = r.interetsLabel;
      document.getElementById("indemniteOut").textContent = r.indemniteLabel;
      document.getElementById("totalOut").textContent = r.totalLabel;
      document.getElementById("compteurs").textContent = r.compteursLabel;
      var v = document.getElementById("verdict");
      v.textContent = r.verdict;
      v.className = "alert " + r.etat;
      var tb = document.getElementById("controles");
      while (tb.firstChild) tb.removeChild(tb.firstChild);
      r.controles.forEach(function (c) {
        var tr = document.createElement("tr");
        if (c.statut === "bad" || c.statut === "warn") tr.className = "weak";
        var a = document.createElement("td"); a.textContent = c.point;
        var b = document.createElement("td"); b.textContent = STATUT_LABELS[c.statut];
        var e = document.createElement("td"); e.textContent = c.texte;
        tr.appendChild(a); tr.appendChild(b); tr.appendChild(e);
        tb.appendChild(tr);
      });
      document.getElementById("clause").textContent = r.clause;
      document.getElementById("message").textContent = r.message;
      document.getElementById("recapOut").textContent = r.recap;
      var ul = document.getElementById("actions");
      while (ul.firstChild) ul.removeChild(ul.firstChild);
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
