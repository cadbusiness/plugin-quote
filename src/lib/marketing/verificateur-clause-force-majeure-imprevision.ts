/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-clause-force-majeure-imprevision";
  var ROLE_LABELS = { prestataire: "prestataire qui rédige la clause", client: "client qui relit la clause" };
  var SITUATION_LABELS = { forceMajeure: "plutôt force majeure", imprevision: "plutôt imprévision", incertaine: "situation pas encore tranchée" };
  var EVENEMENT_LABELS = {
    defaillanceFournisseur: "défaillance ou incendie chez un fournisseur",
    catastrophe: "catastrophe naturelle, incendie, inondation",
    epidemie: "épidémie ou mesures sanitaires",
    greveTiers: "grève des transports ou chez un tiers",
    haussePrix: "hausse brutale des prix ou des coûts",
    reglementation: "interdiction ou norme nouvelle",
    decisionInterne: "décision interne",
    autre: "autre événement"
  };
  var CONTROLE_LABELS = { hors: "hors de contrôle", doute: "contrôle discutable", sousControle: "sous contrôle" };
  var PREVISIBILITE_LABELS = { imprevisible: "non raisonnablement prévisible", discute: "prévisibilité discutable", previsible: "déjà prévisible à la signature" };
  var MESURES_LABELS = { insuffisantes: "mesures tentées sans alternative utile", aucunePossible: "aucune mesure possible", alternativesExistent: "alternatives existantes non prises" };
  var EMPECHEMENT_LABELS = { total: "empêchement total", partiel: "empêchement partiel", aucun: "aucun empêchement (coût seulement)" };
  var DUREE_LABELS = { temporaire: "temporaire", definitif: "définitif", inconnu: "durée inconnue" };
  var ONEROSITE_LABELS = { none: "pas de hausse pertinente", p30: "environ +30 %", p50: "environ +50 %", p100: "environ +100 % ou plus", custom: "pourcentage personnalisé" };
  var RISQUE_LABELS = { non: "risque non accepté", ouiClause: "exclusion claire de l'article 1195", ouiSilence: "seulement « prix fermes »" };
  var CLAUSE_LABELS = {
    listeFermee: "liste fermée",
    listeOuverte: "liste ouverte + renvoi 1218",
    renvoi1218: "renvoi à l'article 1218",
    exclusion1195: "exclusion claire de l'article 1195",
    aucune: "aucune clause"
  };
  var ACCEPTATION_LABELS = { signee: "CGV jointes au devis signé", cgvSignees: "CGV signées séparément", lien: "lien sans acceptation", aucune: "CGV jamais transmises" };
  var NOTIFICATION_LABELS = { ouiDate: "notification écrite datée", ouiSansDate: "notification sans date claire", non: "pas de notification" };
  var RECIPROQUE_LABELS = { oui: "clause réciproque", non: "clause unilatérale" };
  var CONTINUE_LABELS = { oui: "exécution poursuivie", non: "exécution arrêtée", na: "sans objet" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var DEFAULTS = {
    role: "prestataire",
    situation: "forceMajeure",
    evenement: "defaillanceFournisseur",
    dateContrat: "2026-11-18",
    dateEvenement: "2027-01-12",
    controle: "hors",
    previsibilite: "imprevisible",
    mesures: "insuffisantes",
    empechement: "total",
    dureeEmpechement: "temporaire",
    onerosite: "p100",
    onerositePct: 62,
    risqueAccepte: "non",
    clauseRedigee: "listeFermee",
    acceptation: "signee",
    notification: "ouiDate",
    delaiNotifJours: 1,
    reciproque: "non",
    continueExec: "oui"
  };
  var MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  function num(v, min, max, fallback) {
    var n = parseInt(String(v).replace(",", "."), 10);
    if (!isFinite(n)) return fallback;
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }
  function parseDate(s) {
    if (!s || typeof s !== "string") return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d };
  }
  function fmtDate(p) {
    if (!p) return "";
    var day = p.d === 1 ? "1er" : String(p.d);
    return day + " " + MOIS[p.m - 1] + " " + p.y;
  }
  function addDays(p, n) {
    var dt = new Date(Date.UTC(p.y, p.m - 1, p.d));
    dt.setUTCDate(dt.getUTCDate() + n);
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
  }
  function pick(v, map, fallback) {
    return map[v] ? v : fallback;
  }
  function onerositeValue(d) {
    if (d.onerosite === "none") return 0;
    if (d.onerosite === "p30") return 30;
    if (d.onerosite === "p50") return 50;
    if (d.onerosite === "p100") return 100;
    return num(d.onerositePct, 0, 500, 0);
  }
  function computeForceMajeureImprevision(input) {
    var d = {};
    for (var key in DEFAULTS) d[key] = input && input[key] !== undefined ? input[key] : DEFAULTS[key];
    d.role = pick(d.role, ROLE_LABELS, "prestataire");
    d.situation = pick(d.situation, SITUATION_LABELS, "forceMajeure");
    d.evenement = pick(d.evenement, EVENEMENT_LABELS, "defaillanceFournisseur");
    d.controle = pick(d.controle, CONTROLE_LABELS, "hors");
    d.previsibilite = pick(d.previsibilite, PREVISIBILITE_LABELS, "imprevisible");
    d.mesures = pick(d.mesures, MESURES_LABELS, "insuffisantes");
    d.empechement = pick(d.empechement, EMPECHEMENT_LABELS, "total");
    d.dureeEmpechement = pick(d.dureeEmpechement, DUREE_LABELS, "temporaire");
    d.onerosite = pick(d.onerosite, ONEROSITE_LABELS, "p100");
    d.risqueAccepte = pick(d.risqueAccepte, RISQUE_LABELS, "non");
    d.clauseRedigee = pick(d.clauseRedigee, CLAUSE_LABELS, "listeFermee");
    d.acceptation = pick(d.acceptation, ACCEPTATION_LABELS, "signee");
    d.notification = pick(d.notification, NOTIFICATION_LABELS, "ouiDate");
    d.reciproque = pick(d.reciproque, RECIPROQUE_LABELS, "non");
    d.continueExec = pick(d.continueExec, CONTINUE_LABELS, "oui");
    d.delaiNotifJours = num(d.delaiNotifJours, 0, 365, 0);
    d.onerositePct = num(d.onerositePct, 0, 500, 0);
    var dateC = parseDate(d.dateContrat) || parseDate(DEFAULTS.dateContrat);
    var dateE = parseDate(d.dateEvenement) || parseDate(DEFAULTS.dateEvenement);
    d.dateContrat = dateC.y + "-" + String(dateC.m).padStart(2, "0") + "-" + String(dateC.d).padStart(2, "0");
    d.dateEvenement = dateE.y + "-" + String(dateE.m).padStart(2, "0") + "-" + String(dateE.d).padStart(2, "0");
    var pct = onerositeValue(d);

    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    // 1. Caractérisation FM vs imprévision
    var regime = "mixte";
    var regimeLabel = "À trancher";
    if (d.evenement === "decisionInterne") {
      regime = "ni";
      regimeLabel = "Hors force majeure";
      add("Caractérisation", "bad", "Une décision interne reste en principe sous le contrôle du débiteur : ce n'est pas de la force majeure (article 1218).");
    } else if (d.evenement === "haussePrix" || d.empechement === "aucun" || d.situation === "imprevision") {
      regime = "imprevision";
      regimeLabel = "Imprévision (1195)";
      add("Caractérisation", d.situation === "forceMajeure" && d.empechement === "aucun" ? "warn" : "ok",
        d.empechement === "aucun" || d.evenement === "haussePrix"
          ? "L'exécution reste possible : on est du côté de l'article 1195 (imprévision), pas de l'article 1218."
          : "Vous orientez l'analyse vers l'imprévision (article 1195).");
    } else if (d.situation === "forceMajeure" || d.empechement === "total" || d.empechement === "partiel") {
      regime = "forceMajeure";
      regimeLabel = "Force majeure (1218)";
      add("Caractérisation", "ok", "Empêchement d'exécuter : on raisonne d'abord sur l'article 1218 (force majeure).");
    } else {
      add("Caractérisation", "warn", "Situation encore incertaine : séparez empêchement (1218) et simple onérosité (1195) avant d'écrire au cocontractant.");
    }

    // 2. Contrôle
    if (d.controle === "hors") add("Contrôle", "ok", "Événement présenté comme échappant au contrôle du débiteur (premier volet de l'article 1218).");
    else if (d.controle === "doute") add("Contrôle", "warn", "Contrôle discutable : le juge regardera si le débiteur pouvait réellement maîtriser l'événement.");
    else add("Contrôle", "bad", "Événement sous le contrôle du débiteur : la force majeure de l'article 1218 ne peut pas jouer.");

    // 3. Prévisibilité
    if (d.previsibilite === "imprevisible") add("Prévisibilité", "ok", "Présenté comme non raisonnablement prévisible lors de la conclusion du contrat (" + fmtDate(dateC) + ").");
    else if (d.previsibilite === "discute") add("Prévisibilité", "warn", "Prévisibilité discutable au " + fmtDate(dateC) + " : documentez ce qui était connu à la signature.");
    else add("Prévisibilité", "bad", "Événement déjà prévisible à la signature : la condition d'imprévisibilité de l'article 1218 (et de l'article 1195) manque.");

    // 4. Mesures appropriées
    if (d.mesures === "aucunePossible") add("Mesures appropriées", "ok", "Aucune mesure appropriée n'était possible pour éviter les effets : condition d'irrésistibilité a priori réunie.");
    else if (d.mesures === "insuffisantes") add("Mesures appropriées", "ok", "Mesures tentées sans alternative utile : gardez les preuves (devis, refus, échanges).");
    else add("Mesures appropriées", "bad", "Des alternatives existent et n'ont pas été prises : l'article 1218 exige que les effets ne puissent être évités par des mesures appropriées.");

    // 5. Effets temporaires / définitifs
    if (d.empechement === "aucun") {
      add("Effet de l'empêchement", "info", "Pas d'empêchement : l'article 1218 (suspension / résolution de plein droit) n'est pas le bon outil. Regardez l'article 1195.");
    } else if (d.dureeEmpechement === "temporaire") {
      add("Effet de l'empêchement", "ok", "Empêchement temporaire : suspension de l'exécution, sauf si le retard justifie la résolution (article 1218).");
    } else if (d.dureeEmpechement === "definitif") {
      add("Effet de l'empêchement", "ok", "Empêchement définitif : résolution de plein droit et libération dans les conditions des articles 1351 et 1351-1.");
    } else {
      add("Effet de l'empêchement", "warn", "Durée encore inconnue : précisez si l'empêchement est temporaire ou définitif avant de choisir suspension ou résolution.");
    }

    // 6. Conditions 1195 / onérosité
    if (regime === "forceMajeure" && pct < 30) {
      add("Onérosité (1195)", "info", "Analyse orientée force majeure : le débat d'onérosité de l'article 1195 n'est pas central ici.");
    } else if (d.risqueAccepte === "ouiClause") {
      add("Onérosité (1195)", "ok", "Clause claire d'acceptation du risque : l'article 1195 est écarté entre professionnels, sous réserve de l'acceptation des CGV.");
    } else if (pct >= 50) {
      add("Onérosité (1195)", "warn", "Hausse autour de +" + pct + " % (repère de l'outil, pas un seuil légal) : une demande de renégociation au titre de l'article 1195 peut se discuter si le risque n'a pas été accepté.");
    } else if (pct >= 30) {
      add("Onérosité (1195)", "warn", "Hausse autour de +" + pct + " % (repère de l'outil) : zone intermédiaire. Documentez l'impact sur la marge du contrat.");
    } else if (d.situation === "imprevision" || d.evenement === "haussePrix") {
      add("Onérosité (1195)", "warn", "Hausse faible ou absente au regard des repères de l'outil : l'« exécution excessivement onéreuse » sera difficile à soutenir.");
    } else {
      add("Onérosité (1195)", "info", "Pas de hausse marquante renseignée. Les pourcentages de l'outil ne sont pas des seuils légaux.");
    }

    // 7. Risque accepté
    if (d.risqueAccepte === "ouiClause") add("Risque accepté", "ok", "Exclusion claire de l'article 1195 : la partie a accepté d'assumer le risque.");
    else if (d.risqueAccepte === "ouiSilence") add("Risque accepté", "warn", "« Prix fermes » sans renvoi à l'article 1195 : ce n'est pas forcément une acceptation du risque d'imprévision.");
    else add("Risque accepté", "ok", "Aucun acceptation du risque : la porte de l'article 1195 reste ouverte (si ses autres conditions sont réunies).");

    // 8. Qualité de la clause
    if (d.clauseRedigee === "listeOuverte" || d.clauseRedigee === "renvoi1218") add("Rédaction de la clause", "ok", "Renvoi à l'article 1218" + (d.clauseRedigee === "listeOuverte" ? " avec liste ouverte" : "") + " : la clause suit le texte légal.");
    else if (d.clauseRedigee === "exclusion1195") add("Rédaction de la clause", "ok", "Exclusion claire de l'article 1195 : utile pour le prix ferme, à coupler avec un article force majeure distinct.");
    else if (d.clauseRedigee === "listeFermee") add("Rédaction de la clause", "warn", "Liste fermée : un incendie fournisseur, une inondation ou une interdiction non listée restent hors clause. Renvoyez à l'article 1218.");
    else add("Rédaction de la clause", "warn", "Aucune clause : seuls les articles 1218 et 1195 du code civil s'appliquent, sans aménagement contractuel.");

    // 9. Acceptation 1119
    if (d.acceptation === "signee" || d.acceptation === "cgvSignees") add("Acceptation des CGV", "ok", "CGV portées à connaissance et acceptées (article 1119).");
    else if (d.acceptation === "lien") add("Acceptation des CGV", "warn", "Lien sans mention d'acceptation : l'opposabilité de la clause est fragile (article 1119).");
    else add("Acceptation des CGV", "bad", "CGV jamais transmises : la clause contractuelle est inopposable (article 1119). Le débat légal 1218 / 1195 reste possible.");

    // 10. Notification
    if (d.notification === "ouiDate" && d.delaiNotifJours <= 15) add("Notification", "ok", "Notification écrite datée sous " + d.delaiNotifJours + " jour" + (d.delaiNotifJours > 1 ? "s" : "") + " (repère de l'outil : quinze jours).");
    else if (d.notification === "ouiDate") add("Notification", "warn", "Notification datée mais " + d.delaiNotifJours + " jours après la connaissance : au-delà du repère de quinze jours de l'outil. Gardez la preuve du contenu.");
    else if (d.notification === "ouiSansDate") add("Notification", "warn", "Notification sans date claire : précisez la date de connaissance et la date d'envoi.");
    else add("Notification", "warn", "Pas de notification écrite : la preuve de l'événement et des mesures part mal. Écrivez maintenant.");

    // 11. Réciprocité
    if (d.reciproque === "oui") add("Réciprocité", "ok", "Clause réciproque : elle joue pour les deux parties.");
    else add("Réciprocité", "warn", "Clause unilatérale : dans un contrat d'adhésion, un déséquilibre significatif peut être discuté (article 1171).");

    // 12. Exécution continue sous 1195
    if (regime === "imprevision" || d.situation === "imprevision" || d.evenement === "haussePrix" || d.empechement === "aucun") {
      if (d.continueExec === "oui") add("Exécution pendant renégociation", "ok", "Exécution poursuivie pendant la renégociation : conforme à l'article 1195.");
      else if (d.continueExec === "non") add("Exécution pendant renégociation", "bad", "Exécution arrêtée pendant une demande 1195 : le texte impose de continuer d'exécuter. Risque de sanctions (article 1217).");
      else add("Exécution pendant renégociation", "warn", "Sans objet coché alors que l'analyse penche vers l'imprévision : confirmez si l'exécution continue.");
    } else {
      add("Exécution pendant renégociation", "info", "Hors débat central d'imprévision : l'obligation de continuer d'exécuter de l'article 1195 n'est pas le premier sujet.");
    }

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    for (var i = 0; i < controles.length; i++) {
      if (controles[i].statut === "ok") nbOk++;
      else if (controles[i].statut === "warn") nbWarn++;
      else if (controles[i].statut === "bad") nbBad++;
      else nbInfo++;
    }
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");
    var statutLabel = STATUT_LABELS[etat];

    var clauseQuality = "Fragile";
    if (d.acceptation === "aucune") clauseQuality = "Inopposable";
    else if (d.clauseRedigee === "listeOuverte" || d.clauseRedigee === "renvoi1218" || d.clauseRedigee === "exclusion1195") clauseQuality = d.reciproque === "oui" ? "Solide" : "Correcte";
    else if (d.clauseRedigee === "aucune") clauseQuality = "Absente";
    else clauseQuality = "Fragile";

    var notifLabel = d.notification === "ouiDate" ? ("Datée (J+" + d.delaiNotifJours + ")") : (d.notification === "ouiSansDate" ? "Sans date claire" : "Manquante");

    var verdict;
    if (nbBad > 0) verdict = "Au moins un point bloquant : " + nbBad + " bloquant" + (nbBad > 1 ? "s" : "") + ", " + nbWarn + " à compléter. Ne vous appuyez pas sur la clause en l'état.";
    else if (nbWarn > 0) verdict = "Aucun point bloquant, mais " + nbWarn + " point" + (nbWarn > 1 ? "s" : "") + " à compléter. Régime probable : " + regimeLabel + ".";
    else verdict = "Les points contrôlés sont en ordre sur la base de vos réponses. Régime probable : " + regimeLabel + ". Faites relire la clause.";

    // Clause proposée
    var articles = [];
    articles.push("Article 1. Force majeure. Il y a force majeure au sens du présent contrat lorsqu'un événement répond aux conditions de l'article 1218 du code civil. Constituent notamment, sans que cette liste soit limitative, des exemples susceptibles d'être examinés : catastrophe naturelle, incendie, inondation, défaillance d'un fournisseur exclusif dûment justifiée, interdiction réglementaire postérieure à la signature, fait du prince.");
    articles.push("Article 2. Notification. La partie empêchée notifie l'autre partie par écrit dans les quinze jours de la connaissance de l'événement, en décrivant l'événement, ses effets et les mesures déjà prises. Ce délai est contractuel.");
    articles.push("Article 3. Effets. Si l'empêchement est temporaire, les obligations concernées sont suspendues et les délais prolongés d'autant. Si la suspension dépasse quatre-vingt-dix jours, ou si le retard justifie la résolution, chaque partie peut notifier la résolution sans dommages et intérêts de ce seul chef, sous réserve des restitutions. Si l'empêchement est définitif, le contrat est résolu de plein droit dans les conditions des articles 1351 et 1351-1.");
    if (d.risqueAccepte === "ouiClause" || d.clauseRedigee === "exclusion1195") {
      articles.push("Article 4. Imprévision. Les parties acceptent d'assumer le risque de variation du prix des matières premières, de l'énergie et des transports, et renoncent à se prévaloir de l'article 1195 du code civil.");
    } else {
      articles.push("Article 4. Imprévision. Si un changement de circonstances imprévisible lors de la conclusion du contrat rend l'exécution excessivement onéreuse pour une partie qui n'avait pas accepté d'en assumer le risque, celle-ci peut demander une renégociation par écrit. Elle continue d'exécuter ses obligations durant la renégociation, conformément à l'article 1195 du code civil.");
    }
    if (d.reciproque === "oui" || true) {
      articles.push("Article 5. Réciprocité. La présente clause s'applique à chacune des parties.");
    }
    var clause = articles.join("\n");

    // Actions
    var actions = [];
    for (var j = 0; j < controles.length; j++) {
      if (controles[j].statut === "bad" || controles[j].statut === "warn") {
        actions.push(controles[j].point + " : " + controles[j].texte);
      }
    }
    actions.push("Faites relire la clause par votre conseil avant de l'intégrer au devis ferme et aux CGV.");

    // Message
    var message;
    if (d.role === "client") {
      var pts = controles.filter(function (c) { return c.statut === "bad" || c.statut === "warn"; }).map(function (c) { return c.point; });
      message = "Bonjour,\n\nAvant de signer, nous avons relu la clause de force majeure / imprévision.";
      if (pts.length) message += " Nous relevons les points suivants : " + pts.join(", ") + ".";
      message += "\n\nPouvez-vous nous envoyer une version qui renvoie à l'article 1218, traite séparément l'article 1195, et précise la notification ?\n\nBien cordialement,";
    } else {
      message = "Bonjour,\n\nNous vous informons d'un événement survenu le " + fmtDate(dateE) + " (" + EVENEMENT_LABELS[d.evenement] + "), postérieur à notre contrat du " + fmtDate(dateC) + ".\n\n";
      if (regime === "imprevision") {
        message += "L'exécution reste possible mais est devenue excessivement onéreuse. Conformément à l'article 1195 du code civil, nous demandons l'ouverture d'une renégociation. Nous continuons d'exécuter nos obligations durant cette phase.\n\n";
      } else {
        message += "Cet événement empêche l'exécution de nos obligations au sens de l'article 1218 du code civil. Nous avons pris / tenté les mesures suivantes : [à compléter]. Nous vous proposons [suspension des délais / résolution amiable].\n\n";
      }
      message += "Restant à votre disposition pour en discuter.\n\nBien cordialement,";
    }

    var recapLines = [
      "Position : " + ROLE_LABELS[d.role],
      "Situation : " + SITUATION_LABELS[d.situation],
      "Événement : " + EVENEMENT_LABELS[d.evenement],
      "Contrat : " + fmtDate(dateC) + " · Événement : " + fmtDate(dateE),
      "Régime probable : " + regimeLabel,
      "Clause : " + CLAUSE_LABELS[d.clauseRedigee] + " (" + clauseQuality + ")",
      "Acceptation : " + ACCEPTATION_LABELS[d.acceptation],
      "Notification : " + notifLabel,
      "Onérosité (repère outil) : +" + pct + " % · Risque : " + RISQUE_LABELS[d.risqueAccepte],
      "Contrôles : " + nbOk + " conforme" + (nbOk > 1 ? "s" : "") + ", " + nbWarn + " à compléter, " + nbBad + " bloquant" + (nbBad > 1 ? "s" : "") + ", " + nbInfo + " information" + (nbInfo > 1 ? "s" : ""),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    return {
      role: d.role,
      situation: d.situation,
      evenement: d.evenement,
      dateContrat: d.dateContrat,
      dateEvenement: d.dateEvenement,
      controle: d.controle,
      previsibilite: d.previsibilite,
      mesures: d.mesures,
      empechement: d.empechement,
      dureeEmpechement: d.dureeEmpechement,
      onerosite: d.onerosite,
      onerositePct: d.onerositePct,
      risqueAccepte: d.risqueAccepte,
      clauseRedigee: d.clauseRedigee,
      acceptation: d.acceptation,
      notification: d.notification,
      delaiNotifJours: d.delaiNotifJours,
      reciproque: d.reciproque,
      continueExec: d.continueExec,
      pct: pct,
      regime: regime,
      regimeLabel: regimeLabel,
      clauseQuality: clauseQuality,
      notifLabel: notifLabel,
      controles: controles,
      nbOk: nbOk,
      nbWarn: nbWarn,
      nbBad: nbBad,
      nbInfo: nbInfo,
      etat: etat,
      statutLabel: statutLabel,
      verdict: verdict,
      clause: clause,
      articles: articles.length,
      actions: actions,
      message: message,
      recap: recapLines.join("\n"),
      dateContratFmt: fmtDate(dateC),
      dateEvenementFmt: fmtDate(dateE)
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, ROLE_LABELS, SITUATION_LABELS, EVENEMENT_LABELS, CONTROLE_LABELS, PREVISIBILITE_LABELS, MESURES_LABELS, EMPECHEMENT_LABELS, DUREE_LABELS, ONEROSITE_LABELS, RISQUE_LABELS, CLAUSE_LABELS, ACCEPTATION_LABELS, NOTIFICATION_LABELS, RECIPROQUE_LABELS, CONTINUE_LABELS, computeForceMajeureImprevision, buildRecap, fmtDate, addDays, parseDate, num, onerositeValue };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    function readForm() {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) {
        var el = document.getElementById(k);
        if (!el) return;
        o[k] = el.value;
      });
      return o;
    }
    function render() {
      var r = computeForceMajeureImprevision(readForm());
      document.getElementById("regimeOut").textContent = r.regimeLabel;
      document.getElementById("clauseOut").textContent = r.clauseQuality;
      document.getElementById("notifOut").textContent = r.notifLabel;
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
        var dcel = document.createElement("td"); dcel.textContent = c.texte;
        tr.appendChild(a); tr.appendChild(b); tr.appendChild(dcel);
        tb.appendChild(tr);
      });
      document.getElementById("clause").textContent = r.clause;
      document.getElementById("message").textContent = r.message;
      document.getElementById("recap").textContent = r.recap;
      var ul = document.getElementById("actions");
      ul.innerHTML = "";
      r.actions.forEach(function (t) {
        var li = document.createElement("li");
        li.textContent = t;
        ul.appendChild(li);
      });
    }
    document.getElementById("form").addEventListener("input", render);
    document.getElementById("form").addEventListener("change", render);
    document.querySelectorAll("button.copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-target");
        var text = document.getElementById(id).textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
      });
    });
    render();
  
  return built.snapshot();
}
