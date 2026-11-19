/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-plan-prevention-entreprise-exterieure";
  var ROLE_LABELS = { exterieure: "entreprise extérieure, qui intervient chez le client", utilisatrice: "entreprise utilisatrice, qui accueille le prestataire" };
  var NATURE_LABELS = { site: "travaux ou prestation dans l'établissement du client", chargement: "chargement ou déchargement par un transporteur", chantier: "chantier clos et indépendant ou soumis à coordination SPS" };
  var DANGEREUX_LABELS = { aucun: "aucun", electrique: "contact avec des pièces nues sous tension au-delà de la très basse tension", levage: "recours à des ponts roulants, des grues ou des transtockeurs", hauteur: "travaux du BTP avec risque de chute de plus de 3 mètres", confine: "travaux en cuve ou en atmosphère confinée", soudage: "soudage oxyacétylénique avec permis de feu", temperature: "maintenance sur installations à très haute ou très basse température", substances: "exposition à des substances dangereuses ou des agents biologiques", autre: "autre catégorie de la liste" };
  var INSPECTION_LABELS = { faite: "faite", prevue: "prévue, pas encore faite", non: "pas prévue" };
  var PLAN_LABELS = { ecrit: "écrit et signé", oral: "convenu oralement", aucun: "rien de convenu" };
  var ST_LABELS = { declares: "annoncés par écrit", nonDeclares: "pas encore annoncés" };
  var AMIANTE_LABELS = { fourni: "reçus", demande: "demandés, pas encore reçus", nonDemande: "pas demandés" };
  var INFO_LABELS = { prevue: "prévue avant le début", non: "pas prévue" };
  var ISOLEMENT_LABELS = { non: "non", ouiPrevu: "oui, avec mesures", ouiNonPrevu: "oui, rien de prévu" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Champ d'application", "Inspection commune", "Seuil des 400 heures", "Travaux dangereux", "Forme du plan",
    "Calendrier", "Sous-traitants", "Amiante", "Information des salariés", "Travail isolé",
    "Ouverture des travaux", "Temps de prévention au devis"
  ];
  var DEFAULTS = {
    role: "exterieure",
    nature: "site",
    heuresEE: 320,
    heuresST: 120,
    dureeMois: 2,
    dangereux: "aucun",
    inspection: "faite",
    dateInspection: "2026-11-30",
    dateDebut: "2026-12-07",
    plan: "ecrit",
    dateSignature: "2026-12-02",
    sousTraitants: "declares",
    amiante: "demande",
    information: "prevue",
    isolement: "non",
    heuresPrevention: 14,
    tauxHoraire: 55
  };
  var SEUIL_HEURES = 400;
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
  function daysBetween(a, b) { return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000); }
  function fmtDate(p) {
    if (!p) return "";
    return (p.d === 1 ? "1er" : String(p.d)) + " " + MOIS[p.m - 1] + " " + p.y;
  }
  function fmtInt(n) {
    var s = String(Math.round(Math.abs(n)));
    var out = "";
    while (s.length > 3) { out = " " + s.slice(-3) + out; s = s.slice(0, -3); }
    return (n < 0 ? "\u2212" : "") + s + out;
  }
  function fmtEur(n) { return fmtInt(n) + " €"; }
  function fmtTaux(x) {
    var r = Math.round(x * 100) / 100;
    var s = r.toFixed(2).replace(".", ",");
    if (s.slice(-3) === ",00") s = s.slice(0, -3);
    return s + " €";
  }
  function fmtH(n) { return fmtInt(n) + " h"; }
  function plural(n, one, many) { return fmtInt(n) + " " + (n > 1 ? many : one); }
  function dOr(p) { return p ? fmtDate(p) : "[date]"; }
  function bOr(p) { return p ? "[" + fmtDate(p) + "]" : "[date]"; }

  function computeHeures(heuresEE, heuresST, dureeMois) {
    var total = heuresEE + heuresST;
    var estime = dureeMois > 12;
    var douze = estime ? Math.ceil(total * 12 / dureeMois) : total;
    return { total: total, douze: douze, estime: estime, atteint: douze >= SEUIL_HEURES, proche: douze >= 350 && douze < SEUIL_HEURES };
  }

  function computePrevention(input) {
    var i = input || {};
    var role = pick(i.role, ROLE_LABELS, DEFAULTS.role);
    var nature = pick(i.nature, NATURE_LABELS, DEFAULTS.nature);
    var dangereux = pick(i.dangereux, DANGEREUX_LABELS, DEFAULTS.dangereux);
    var inspection = pick(i.inspection, INSPECTION_LABELS, DEFAULTS.inspection);
    var plan = pick(i.plan, PLAN_LABELS, DEFAULTS.plan);
    var sousTraitants = pick(i.sousTraitants, ST_LABELS, DEFAULTS.sousTraitants);
    var amiante = pick(i.amiante, AMIANTE_LABELS, DEFAULTS.amiante);
    var information = pick(i.information, INFO_LABELS, DEFAULTS.information);
    var isolement = pick(i.isolement, ISOLEMENT_LABELS, DEFAULTS.isolement);
    var heuresEE = num(i.heuresEE, 0, 1000000, 0);
    var heuresST = num(i.heuresST, 0, 1000000, 0);
    var dureeMois = num(i.dureeMois, 1, 60, 1);
    var heuresPrevention = num(i.heuresPrevention, 0, 100000, 0);
    var tauxHoraire = dec(i.tauxHoraire, 0, 100000, 0);
    var dI = parseDate(i.dateInspection), dD = parseDate(i.dateDebut), dS = parseDate(i.dateSignature);
    var h = computeHeures(heuresEE, heuresST, dureeMois);
    var site = nature === "site", charg = nature === "chargement", chantier = nature === "chantier";
    var ecritHeures = site && h.atteint;
    var ecritDangereux = site && dangereux !== "aucun";
    var ecritObligatoire = charg || ecritHeures || ecritDangereux;
    var cout = Math.round(heuresPrevention * tauxHoraire);
    var dLabel = DANGEREUX_LABELS[dangereux];
    var dureeTxt = plural(dureeMois, "mois", "mois");
    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }
    var sansObjet = "Sans objet au titre du plan de prévention : sur ce type de chantier, c'est le régime de la coordination de chantier qui s'applique (article R4511-3).";

    // 1 Champ
    if (site) add(POINTS[0], "info", "Des salariés d'une entreprise extérieure interviennent dans l'établissement du client : les articles R4511-1 et suivants du code du travail s'appliquent, quelle que soit la nature ou la durée de l'opération.");
    else if (charg) add(POINTS[0], "info", "Chargement ou déchargement par une entreprise de transport : un protocole de sécurité écrit remplace le plan de prévention (articles R4515-1 et R4515-4).");
    else add(POINTS[0], "info", "Chantier de bâtiment ou de génie civil soumis à la coordination SPS, ou chantier clos et indépendant : le titre sur les entreprises extérieures ne s'applique pas (article R4511-3). Le client coopère avec le coordonnateur.");

    // 2 Inspection
    if (charg) add(POINTS[1], "info", "Pas d'inspection commune au sens de l'article R4512-2 pour ces opérations (dérogation de l'article R4515-1) : l'échange préalable entre employeurs la remplace (article R4515-8).");
    else if (chantier) add(POINTS[1], "info", sansObjet);
    else if (inspection === "non") add(POINTS[1], "bad", "Aucune inspection commune prévue. Elle est due avant toute opération d'une entreprise extérieure : lieux, installations, matériels mis à disposition (article R4512-2).");
    else if (inspection === "prevue") {
      if (dI && dD && daysBetween(dI, dD) > 0) add(POINTS[1], "warn", "Prévue le " + fmtDate(dI) + ", avant le début du " + fmtDate(dD) + " : à tenir, avec le responsable de l'intervention, en laissant le temps de rédiger le plan.");
      else if (dI && dD) add(POINTS[1], "bad", "Prévue le " + fmtDate(dI) + ", qui n'est pas avant le début des travaux (" + fmtDate(dD) + "). L'inspection est préalable à l'opération (article R4512-2).");
      else add(POINTS[1], "warn", "Prévue, mais sans date ou sans date de début : fixez-la par écrit avant le début des travaux.");
    } else {
      if (dI && dD && daysBetween(dI, dD) < 0) add(POINTS[1], "bad", "Faite le " + fmtDate(dI) + ", après le début des travaux (" + fmtDate(dD) + "). Elle devait précéder l'opération (article R4512-2).");
      else if (dI && dD) add(POINTS[1], "ok", "Faite le " + fmtDate(dI) + ", avant le début du " + fmtDate(dD) + " : secteur délimité, zones dangereuses, circulations et consignes communiquées (articles R4512-2 à R4512-4).");
      else add(POINTS[1], "warn", "Faite, mais la date de l'inspection ou du début manque : notez-les, elles prouvent que l'inspection était préalable.");
    }

    // 3 Seuil
    var hTxt = fmtH(h.total) + " prévisibles" + (heuresST > 0 ? " (" + fmtH(heuresEE) + " de vos équipes et " + fmtH(heuresST) + " de sous-traitance)" : "") + " sur " + dureeTxt;
    var estTxt = h.estime ? ", soit environ " + fmtH(h.douze) + " ramenées à douze mois au prorata, à vérifier sur la période de douze mois la plus chargée" : "";
    if (!site) add(POINTS[2], "info", charg ? "Le seuil des 400 heures ne joue pas : le protocole de sécurité est écrit quelle que soit la durée (article R4515-4)." : sansObjet);
    else if (h.atteint) add(POINTS[2], h.estime ? "warn" : "info", hTxt + estTxt + ". Seuil de 400 heures atteint : le plan doit être écrit (article R4512-7, 1°)." + (heuresEE < SEUIL_HEURES && heuresST > 0 && !h.estime ? " C'est la sous-traitance qui fait franchir le seuil." : ""));
    else if (h.proche) add(POINTS[2], "warn", hTxt + estTxt + ". Sous le seuil, mais tout près : un avenant ou un sous-traitant de plus peut le faire franchir en cours de route, et l'écrit devient alors obligatoire (article R4512-7, 1°).");
    else add(POINTS[2], h.estime ? "warn" : "ok", hTxt + estTxt + ". Sous le seuil de 400 heures : l'écrit n'est pas obligatoire à ce titre.");

    // 4 Dangereux
    if (chantier) add(POINTS[3], "info", sansObjet);
    else if (charg) add(POINTS[3], "info", "La liste de l'arrêté du 19 mars 1993 vise le plan de prévention. Pour le transport, le protocole décrit la marchandise et les précautions particulières, notamment pour les matières dangereuses (article R4515-7).");
    else if (dangereux === "aucun") add(POINTS[3], "ok", "Aucun travail de la liste de l'arrêté du 19 mars 1993 déclaré. Relisez quand même les vingt et une catégories : raccordement, levage ou soudure peuvent en relever.");
    else add(POINTS[3], "info", "Travail de la liste de l'arrêté du 19 mars 1993 (" + dLabel + ") : le plan doit être écrit quelle que soit la durée (article R4512-7, 2°).");

    // 5 Forme
    var motifEcrit = ecritHeures && ecritDangereux ? "400 heures atteintes et travail de la liste" : ecritHeures ? "400 heures atteintes" : ecritDangereux ? "travail de la liste" : "";
    if (chantier) add(POINTS[4], "info", sansObjet);
    else if (charg) {
      if (plan === "ecrit") add(POINTS[4], "ok", "Protocole de sécurité écrit, daté et signé (articles R4515-4 et R4515-11).");
      else add(POINTS[4], "bad", "Le protocole de sécurité est toujours écrit (article R4515-4). Un accord oral ne suffit pas.");
    } else if (ecritObligatoire) {
      if (plan === "ecrit") add(POINTS[4], "ok", "Plan écrit et signé, comme exigé (" + motifEcrit + ").");
      else if (plan === "oral") add(POINTS[4], "bad", "Plan seulement oral alors que l'écrit est obligatoire (" + motifEcrit + ", article R4512-7).");
      else add(POINTS[4], "bad", "Aucun plan alors que l'écrit est obligatoire (" + motifEcrit + ", articles R4512-6 et R4512-7).");
    } else {
      if (plan === "ecrit") add(POINTS[4], "ok", "Plan écrit alors qu'il n'est pas obligatoire : c'est une bonne pratique, et il se prouve.");
      else if (plan === "oral") add(POINTS[4], "info", "Plan oral possible ici. Un écrit simplifié reste prudent, et beaucoup de clients l'exigent.");
      else add(POINTS[4], "warn", "Rien de convenu. Dès qu'il existe des risques d'interférence entre les activités, un plan est dû, même oral (article R4512-6).");
    }

    // 6 Calendrier
    if (chantier) add(POINTS[5], "info", sansObjet);
    else if (plan !== "ecrit") add(POINTS[5], "info", "Pas de document écrit : pas de date de signature à contrôler.");
    else if (dS && dD && daysBetween(dS, dD) < 0) add(POINTS[5], ecritObligatoire ? "bad" : "warn", "Signé le " + fmtDate(dS) + ", après le début du " + fmtDate(dD) + ". " + (charg ? "Le protocole s'établit avant l'opération (article R4515-8)." : "Le plan est arrêté avant le commencement des travaux (articles R4512-6 et R4512-7)."));
    else if (dS && dD) add(POINTS[5], "ok", "Signé le " + fmtDate(dS) + ", avant le début du " + fmtDate(dD) + ".");
    else add(POINTS[5], "warn", "Date de signature ou de début manquante : notez-les, elles prouvent que le document précède les travaux.");

    // 7 Sous-traitants
    if (chantier) add(POINTS[6], "info", "Les sous-traitants se déclarent selon le régime du chantier et de la sous-traitance (loi de 1975, obligation de vigilance).");
    else if (charg) add(POINTS[6], "info", "Si le transport est sous-traité, le protocole se fait avec le transporteur qui vient réellement : identifiez-le avant l'opération, ou l'entreprise d'accueil recueille les éléments par tout moyen (article R4515-10).");
    else if (heuresST === 0) add(POINTS[6], "info", "Pas de sous-traitant prévu. Tout sous-traitant ajouté s'annonce par écrit avant le début de ses travaux (article R4511-10).");
    else if (sousTraitants === "declares") add(POINTS[6], "ok", "Sous-traitants annoncés par écrit, avec leurs travaux (article R4511-10, 4° et 5°). Leurs " + fmtH(heuresST) + " comptent dans le seuil.");
    else add(POINTS[6], "warn", "Sous-traitants pas encore annoncés : noms, références et travaux confiés, par écrit, avant le début de leurs travaux (article R4511-10). Leurs " + fmtH(heuresST) + " comptent dans le seuil.");

    // 8 Amiante
    if (charg) add(POINTS[7], "info", "Sans objet pour un chargement ou un déchargement.");
    else if (chantier) add(POINTS[7], "info", "Les documents amiante restent à demander avant de toucher au bâti, selon le régime du chantier.");
    else if (amiante === "fourni") add(POINTS[7], "ok", "Documents amiante reçus. Ils sont joints au plan de prévention (articles R4511-8 et R4512-11).");
    else if (amiante === "demande") add(POINTS[7], "warn", "Documents amiante demandés, pas encore reçus. " + (role === "utilisatrice" ? "C'est à vous de les demander au propriétaire et de les transmettre (article R4511-8)." : "Ne touchez pas aux matériaux susceptibles d'en contenir avant de les avoir (articles R4511-8 et R4512-11)."));
    else add(POINTS[7], "warn", role === "utilisatrice" ? "Documents amiante pas demandés : le client, entreprise utilisatrice, les demande au propriétaire et les communique à l'entreprise extérieure (article R4511-8)." : "Documents amiante pas demandés : demandez-les par écrit au client avant de percer, fixer ou découper (articles R4511-8 et R4512-11).");

    // 9 Information
    if (chantier) add(POINTS[8], "info", sansObjet);
    else if (information === "prevue") add(POINTS[8], "ok", "Information prévue sur place avant le début : dangers, zones, protections, accès et issues de secours (article R4512-15). C'est du temps de travail effectif (article R4512-16).");
    else add(POINTS[8], "warn", "Information des salariés pas prévue : elle se fait avant le début, sur le lieu même des travaux (article R4512-15), et c'est du temps de travail effectif à chiffrer (article R4512-16).");

    // 10 Isolement
    if (chantier) add(POINTS[9], "info", sansObjet);
    else if (isolement === "non") add(POINTS[9], "info", "Travaux pendant l'activité du site : pas de travail de nuit, isolé ou site à l'arrêt déclaré.");
    else if (isolement === "ouiPrevu") add(POINTS[9], "ok", "Nuit, lieu isolé ou site à l'arrêt, avec des mesures pour qu'aucun salarié ne travaille seul hors de portée des secours (article R4512-13).");
    else add(POINTS[9], "bad", "Nuit, lieu isolé ou site à l'arrêt, sans mesure prévue : personne ne doit travailler isolément là où il ne pourrait pas être secouru à bref délai (article R4512-13). Prévoyez un deuxième intervenant ou un dispositif d'alerte, et chiffrez-le.");

    // 11 Ouverture
    if (chantier) add(POINTS[10], "info", sansObjet);
    else if (charg) add(POINTS[10], "info", "Pas d'information de l'inspection du travail au titre de l'article R4512-12. Chaque employeur garde un exemplaire daté et signé du protocole, à la disposition du CSE et de l'inspection du travail (article R4515-11).");
    else if (ecritObligatoire) add(POINTS[10], "info", "Plan écrit obligatoire : il reste à la disposition de l'inspection du travail pendant les travaux, et le client informe par écrit l'inspection du travail de l'ouverture des travaux (article R4512-12)." + (role === "utilisatrice" ? " Cette information est à votre charge." : ""));
    else add(POINTS[10], "info", "Plan écrit non obligatoire : pas d'information de l'inspection du travail au titre de l'article R4512-12.");

    // 12 Devis
    if (heuresPrevention === 0) add(POINTS[11], "warn", "Aucun temps de prévention chiffré : préparation, inspection, rédaction du plan et accueil sécurité restent à prévoir dans le prix, en ligne à part ou en hypothèse écrite.");
    else if (tauxHoraire === 0) add(POINTS[11], "warn", plural(heuresPrevention, "heure", "heures") + " de prévention prévues, sans taux horaire : le montant reste à chiffrer.");
    else add(POINTS[11], "ok", plural(heuresPrevention, "heure", "heures") + " de prévention chiffrées à " + fmtTaux(tauxHoraire) + " de l'heure : " + fmtEur(cout) + ". Écrivez aussi ce qui se passe si le site impose davantage.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) { if (c.statut === "ok") nbOk++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : nbWarn > 0 ? "warn" : "ok";
    var badPoints = controles.filter(function (c) { return c.statut === "bad"; }).map(function (c) { return c.point.toLowerCase(); });

    var planLabel, motif;
    if (charg) { planLabel = "Protocole de sécurité écrit"; motif = "Chargement ou déchargement"; }
    else if (chantier) { planLabel = "Sans objet"; motif = "Chantier clos ou coordination SPS"; }
    else if (ecritObligatoire) { planLabel = "Écrit obligatoire"; motif = ecritHeures && ecritDangereux ? "400 heures et travail de la liste" : ecritHeures ? "400 heures atteintes" : "Travail de la liste"; }
    else { planLabel = "Écrit non obligatoire"; motif = "Sous le seuil, aucun travail de la liste"; }

    var resume;
    if (charg) resume = "Chargement ou déchargement : protocole de sécurité écrit, établi avant l'opération.";
    else if (chantier) resume = "Chantier clos ou soumis à coordination SPS : le plan de prévention ne s'applique pas, voir la coordination de chantier.";
    else if (ecritHeures && ecritDangereux) resume = "Plan de prévention écrit obligatoire : " + fmtH(h.total).replace(" h", " heures") + " prévisibles sur " + dureeTxt + ", sous-traitants compris, et travail de la liste (" + dLabel + ").";
    else if (ecritHeures) resume = "Plan de prévention écrit obligatoire : " + fmtH(h.total).replace(" h", " heures") + " prévisibles sur " + dureeTxt + ", sous-traitants compris (seuil de 400 heures).";
    else if (ecritDangereux) resume = "Plan de prévention écrit obligatoire : travail de la liste de l'arrêté du 19 mars 1993 (" + dLabel + "), quelle que soit la durée.";
    else resume = "Plan de prévention écrit non obligatoire : " + fmtH(h.total).replace(" h", " heures") + " prévisibles sur " + dureeTxt + ", aucun travail de la liste. Un plan reste dû s'il existe des risques d'interférence.";
    var verdict;
    if (nbBad > 0) verdict = plural(nbBad, "point bloquant", "points bloquants") + " (" + badPoints.join(", ") + ")" + (nbWarn > 0 ? ", " + fmtInt(nbWarn) + " à compléter" : "") + ". " + resume;
    else if (nbWarn > 0) verdict = "Aucun point bloquant, " + fmtInt(nbWarn) + " à compléter. " + resume;
    else verdict = "Aucun point bloquant, rien à compléter. " + resume;

    // Clause
    var lignePrix = "4. Le prix comprend [" + fmtInt(heuresPrevention) + "] heures de préparation, d'inspection et d'accueil sécurité ([" + fmtEur(cout) + "]). Les exigences du site connues après la date du devis sont facturées au taux de [" + fmtTaux(tauxHoraire) + "] de l'heure, après accord écrit.";
    var ligneST = heuresST > 0 ? "6. Les sous-traitants de l'entreprise sont : [noms, travaux confiés, " + fmtInt(heuresST) + " heures prévues]." : "6. L'entreprise n'a pas prévu de sous-traitant. Tout sous-traitant ajouté est annoncé par écrit avant le début de ses travaux.";
    var clauseLines;
    if (charg) clauseLines = [
      "Article [X] : Protocole de sécurité pour le chargement et le déchargement",
      "1. Les opérations de chargement et de déchargement chez le client font l'objet d'un protocole de sécurité écrit (articles R4515-1 à R4515-11 du code du travail).",
      "2. Le client communique avant la première opération ses consignes, le lieu de livraison, le plan d'accès et de circulation, les engins utilisés, les moyens de secours et le nom du responsable désigné.",
      "3. Le transporteur communique les caractéristiques du véhicule, la nature et le conditionnement de la marchandise et les précautions particulières.",
      lignePrix,
      "5. Pour des opérations répétitives, un seul protocole vaut tant que leurs conditions ne changent pas de façon significative.",
      "6. Chaque partie garde un exemplaire daté et signé du protocole."
    ];
    else if (chantier) clauseLines = [
      "Article [X] : Prévention des risques sur le chantier",
      "1. Les travaux se déroulent sur un chantier [clos et indépendant / soumis à la coordination SPS]. La coordination de chantier s'applique, pas le plan de prévention (article R4511-3 du code du travail).",
      "2. L'entreprise respecte le plan général de coordination et les consignes du coordonnateur quand ils existent.",
      "3. L'entreprise remet les documents de prévention prévus par le régime du chantier [à préciser].",
      lignePrix,
      "5. Le client communique avant le début les documents amiante relatifs aux zones d'intervention.",
      ligneST
    ];
    else clauseLines = [
      "Article [X] : Prévention des risques sur le site du client",
      "1. Les travaux se déroulent dans l'établissement du client. Les parties appliquent les articles R4511-1 et suivants du code du travail.",
      "2. Une inspection commune préalable a lieu au plus tard le " + bOr(dI) + ", en présence du responsable de l'intervention.",
      "3. Un plan de prévention est arrêté d'un commun accord et signé avant le début des travaux, prévu le " + bOr(dD) + ". Il est établi par écrit " + (ecritHeures && ecritDangereux ? "car l'opération atteint " + fmtInt(h.total) + " heures prévisibles, sous-traitants compris, et comporte un travail de la liste de l'arrêté du 19 mars 1993." : ecritHeures ? "car l'opération atteint " + fmtInt(h.total) + " heures prévisibles, sous-traitants compris." : ecritDangereux ? "car l'opération comporte un travail de la liste de l'arrêté du 19 mars 1993." : "à la demande des parties."),
      lignePrix,
      "5. Le client communique avant le début les documents amiante relatifs aux zones d'intervention. À défaut, les travaux touchant des matériaux susceptibles d'en contenir sont suspendus.",
      ligneST
    ];
    var clause = clauseLines.join("\n");

    // Actions
    var actionMap = {};
    actionMap[POINTS[1]] = "Fixez l'inspection commune par écrit, au moins une semaine avant le début, avec le responsable de l'intervention.";
    actionMap[POINTS[2]] = h.estime ? "Recomptez les heures sur la période de douze mois la plus chargée, sous-traitants compris." : "Surveillez les heures en cours de chantier : au-delà de 400, passez le plan à l'écrit avant la suite des travaux.";
    actionMap[POINTS[4]] = charg ? "Établissez le protocole de sécurité par écrit, daté et signé, avant l'opération." : "Rédigez et signez le plan de prévention avec le client avant le début des travaux.";
    actionMap[POINTS[5]] = "Ne démarrez pas avant la signature : décalez le début ou avancez la signature.";
    actionMap[POINTS[6]] = "Annoncez vos sous-traitants par écrit au client : noms, références, travaux confiés, heures prévues.";
    actionMap[POINTS[7]] = role === "utilisatrice" ? "Demandez les documents amiante au propriétaire et transmettez-les au prestataire avant le début." : "Relancez le client pour les documents amiante ; pas d'intervention sur le bâti ancien sans eux.";
    actionMap[POINTS[8]] = "Prévoyez l'information de vos salariés sur place, avant le début, et comptez ce temps dans le prix.";
    actionMap[POINTS[9]] = "Prévoyez un deuxième intervenant ou un dispositif d'alerte pour les interventions de nuit, isolées ou site à l'arrêt.";
    actionMap[POINTS[11]] = "Ajoutez au devis le temps de préparation, d'inspection et d'accueil, avec une hypothèse écrite pour les exigences supplémentaires.";
    var actions = [];
    controles.forEach(function (c) { if (c.statut === "bad") actions.push(actionMap[c.point]); });
    controles.forEach(function (c) { if (c.statut === "warn") actions.push(actionMap[c.point]); });
    actions.push(role === "utilisatrice" ? "Gardez la trace : inspection, plan ou protocole signé, informations reçues du prestataire, déclaration d'ouverture quand elle est due." : "Gardez la trace : courrier d'annonce, compte rendu d'inspection, plan signé, émargement de l'information, relevés d'heures.");

    // Message
    var corps;
    if (charg) {
      if (role === "utilisatrice") corps = "Avant votre prochaine opération de chargement ou de déchargement sur notre site, prévue le " + dOr(dD) + ", nous devons établir ensemble le protocole de sécurité prévu par les articles R4515-1 et suivants du code du travail. Nous vous transmettons nos consignes, le plan d'accès et de circulation, les engins utilisés et le nom de notre responsable. Merci de nous indiquer les caractéristiques de votre véhicule, la nature et le conditionnement de la marchandise et les précautions particulières.";
      else corps = "Avant notre opération de chargement ou de déchargement sur votre site, prévue le " + dOr(dD) + ", pouvez-vous nous transmettre votre protocole de sécurité ou vos éléments (consignes, lieu, plan d'accès et de circulation, engins, moyens de secours, responsable désigné) ? De notre côté, nous vous indiquons les caractéristiques du véhicule, la marchandise et son conditionnement.";
    } else if (chantier) {
      corps = role === "utilisatrice" ? "Les travaux du " + dOr(dD) + " se feront sur un chantier relevant de la coordination de chantier. Merci de vous rapprocher du coordonnateur pour les documents de prévention prévus, et de nous indiquer vos sous-traitants." : "Pour les travaux du " + dOr(dD) + ", pouvez-vous nous confirmer le régime du chantier (chantier clos et indépendant ou coordination SPS), les coordonnées du coordonnateur et les documents attendus, ainsi que les documents amiante des zones concernées ?";
    } else if (role === "utilisatrice") {
      corps = "Votre intervention se fera dans notre établissement en activité, à partir du " + dOr(dD) + ". Merci de nous indiquer par écrit vos intervenants, leur responsable, vos sous-traitants et les heures prévisibles (article R4511-10 du code du travail). " + (dI ? "L'inspection commune est proposée le " + fmtDate(dI) + ". " : "Nous vous proposerons une date d'inspection commune. ") + (ecritObligatoire ? "Le plan de prévention sera établi par écrit et signé avant le démarrage." : "Nous conviendrons du plan de prévention avant le démarrage.");
    } else {
      corps = "Pour préparer notre intervention, voici les informations prévues par l'article R4511-10 du code du travail : arrivée le " + dOr(dD) + ", durée prévisible " + dureeTxt + ", [nombre] intervenants, responsable de l'intervention [nom, téléphone], " + (heuresST > 0 ? "sous-traitant [nom] pour [travaux], " + fmtH(heuresST) + " prévues. " : "pas de sous-traitant. ") + "Le total prévisible est de " + fmtH(h.total) + (heuresST > 0 ? ", sous-traitants compris" : "") + (ecritObligatoire ? " : le plan de prévention sera donc écrit. " : ". ") + (inspection === "faite" && dI ? "À la suite de l'inspection commune du " + fmtDate(dI) + ", merci de nous transmettre votre modèle de plan, la durée de votre accueil sécurité" : "Pouvez-vous nous proposer une date d'inspection commune avant le début, et nous transmettre votre modèle de plan, la durée de votre accueil sécurité") + (amiante === "fourni" ? "." : " et les documents amiante des zones concernées.");
    }
    var objet = charg ? "Objet : protocole de sécurité avant l'opération du " + dOr(dD) : role === "utilisatrice" ? "Objet : préparation de votre intervention du " + dOr(dD) : "Objet : intervention du " + dOr(dD) + " sur votre site : informations préalables";
    var message = objet + "\n\nBonjour,\n\n" + corps + "\n\nCordialement";

    var totalLabel = fmtH(h.total) + (heuresST > 0 ? " (dont " + fmtH(heuresST) + " de sous-traitance)" : "");
    var douzeLabel = h.estime ? "environ " + fmtH(h.douze) + " (au prorata)" : fmtH(h.douze);
    var coutLabel = heuresPrevention > 0 ? fmtH(heuresPrevention) + ", soit " + fmtEur(cout) : "Non chiffré";

    var recap = [
      "Vérification plan de prévention, entreprise extérieure",
      "Position : " + ROLE_LABELS[role],
      "Situation : " + NATURE_LABELS[nature],
      "Heures prévisibles : " + fmtH(h.total) + (heuresST > 0 ? " dont " + fmtH(heuresST) + " de sous-traitance" : "") + ", sur " + dureeTxt,
      "Ramenées à douze mois : " + douzeLabel,
      "Travail de la liste : " + dLabel,
      "Plan : " + planLabel + " (" + motif + ")",
      "Inspection commune : " + (dI ? fmtDate(dI) : "non datée") + " ; début : " + (dD ? fmtDate(dD) : "non daté"),
      "Temps de prévention chiffré : " + coutLabel,
      "Contrôle : " + plural(nbOk, "conforme", "conformes") + ", " + fmtInt(nbWarn) + " à compléter, " + plural(nbBad, "bloquant", "bloquants") + ", " + plural(nbInfo, "information", "informations"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      role: role, nature: nature, dangereux: dangereux, inspection: inspection, plan: plan, sousTraitants: sousTraitants,
      amiante: amiante, information: information, isolement: isolement,
      heuresEE: heuresEE, heuresST: heuresST, dureeMois: dureeMois, heuresPrevention: heuresPrevention, tauxHoraire: tauxHoraire,
      total: h.total, douze: h.douze, estime: h.estime, ecritHeures: ecritHeures, ecritDangereux: ecritDangereux, ecritObligatoire: ecritObligatoire,
      cout: cout, controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat,
      planLabel: planLabel, motif: motif, verdict: verdict, clause: clause, actions: actions, message: message, recap: recap,
      totalLabel: totalLabel, douzeLabel: douzeLabel, coutLabel: coutLabel
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, SEUIL_HEURES, ROLE_LABELS, NATURE_LABELS, DANGEREUX_LABELS, INSPECTION_LABELS, PLAN_LABELS, ST_LABELS, AMIANTE_LABELS, INFO_LABELS, ISOLEMENT_LABELS, computePrevention, computeHeures, buildRecap, fmtEur, fmtInt, fmtH, fmtTaux, fmtDate, parseDate, num, dec, daysBetween };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computePrevention(readForm());
      document.getElementById("totalOut").textContent = r.totalLabel;
      document.getElementById("douzeOut").textContent = r.douzeLabel;
      document.getElementById("planOut").textContent = r.planLabel;
      document.getElementById("motifOut").textContent = r.motif;
      document.getElementById("coutOut").textContent = r.coutLabel;
      document.getElementById("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
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
      document.getElementById("recap").textContent = r.recap;
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
