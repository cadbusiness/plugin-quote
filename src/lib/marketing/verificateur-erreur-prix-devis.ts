/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-erreur-prix-devis";
  var ROLE_LABELS = { emetteur: "émetteur du devis", client: "client destinataire du devis" };
  var STADE_LABELS = { brouillon: "pas encore envoyé", envoye: "envoyé, pas encore accepté", accepte: "accepté, pas encore exécuté", execution: "en cours d'exécution ou exécuté" };
  var TYPE_LABELS = { total: "total différent de la somme des lignes", unitaire: "prix unitaire erroné", quantite: "quantité erronée", oubli: "ligne ou poste oublié", estimation: "coût ou temps mal estimé" };
  var ELEMENTS_LABELS = { visibles: "lignes, quantités et prix unitaires visibles", partiels: "détail partiel", absents: "prix global seul" };
  var EVIDENCE_LABELS = { grossiere: "écart évident pour un professionnel", plausible: "prix plausible à première lecture" };
  var CONFIRMATION_LABELS = { non: "prix non confirmé", oui: "prix confirmé par écrit" };
  var CLIENTPRO_LABELS = { autre: "professionnel d'un autre domaine", memeMetier: "professionnel du même métier" };
  var FORFAIT_LABELS = { non: "prix détaillé ou à l'unité", global: "prix global et forfaitaire", batiment: "marché à forfait de construction" };
  var CLAUSE_LABELS = { aucune: "aucune clause", presente: "clause acceptée", transmise: "clause transmise, acceptation discutable" };
  var TIERS_LABELS = { non: "aucun tiers vérificateur", oui: "tiers chargé de vérifier" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Stade du devis", "Nature de l'erreur", "Éléments de calcul", "Caractère décelable", "Confirmation du prix",
    "Qualité du client", "Type de prix", "Clause d'erreur matérielle", "Tiers vérificateur", "Montants et écart",
    "Délai de réaction", "Délai pour agir"
  ];
  var DEFAULTS = {
    role: "emetteur",
    stade: "accepte",
    typeErreur: "total",
    montantDevis: 20310,
    montantCorrect: 27030,
    dateAcceptation: "2026-11-20",
    dateDecouverte: "2026-11-25",
    dateSignalement: "2026-11-26",
    elementsCalcul: "visibles",
    evidence: "grossiere",
    confirmation: "non",
    clientPro: "autre",
    forfait: "non",
    clauseErreur: "aucune",
    tiers: "non"
  };
  var REPERE_JOURS = 8;
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
  function daysBetween(a, b) { return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000); }
  function addYears(p, n) {
    var y = p.y + n, d = p.d;
    var last = new Date(Date.UTC(y, p.m, 0)).getUTCDate();
    if (d > last) d = last;
    return { y: y, m: p.m, d: d };
  }
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

  function computeErreurPrix(input) {
    var i = input || {};
    var role = pick(i.role, ROLE_LABELS, DEFAULTS.role);
    var stade = pick(i.stade, STADE_LABELS, DEFAULTS.stade);
    var typeErreur = pick(i.typeErreur, TYPE_LABELS, DEFAULTS.typeErreur);
    var elementsCalcul = pick(i.elementsCalcul, ELEMENTS_LABELS, DEFAULTS.elementsCalcul);
    var evidence = pick(i.evidence, EVIDENCE_LABELS, DEFAULTS.evidence);
    var confirmation = pick(i.confirmation, CONFIRMATION_LABELS, DEFAULTS.confirmation);
    var clientPro = pick(i.clientPro, CLIENTPRO_LABELS, DEFAULTS.clientPro);
    var forfait = pick(i.forfait, FORFAIT_LABELS, DEFAULTS.forfait);
    var clauseErreur = pick(i.clauseErreur, CLAUSE_LABELS, DEFAULTS.clauseErreur);
    var tiers = pick(i.tiers, TIERS_LABELS, DEFAULTS.tiers);
    var dev = num(i.montantDevis, 0, 1000000000, 0);
    var cor = num(i.montantCorrect, 0, 1000000000, 0);
    var dA = parseDate(i.dateAcceptation);
    var dD = parseDate(i.dateDecouverte);
    var dS = parseDate(i.dateSignalement);

    var pre = stade === "brouillon" || stade === "envoye";
    var ecart = cor - dev;
    var ecartAbs = Math.abs(ecart);
    var sens = ecart > 0 ? "bas" : (ecart < 0 ? "haut" : "aucun");
    var base = cor > 0 ? cor : dev;
    var pct = base > 0 ? (ecartAbs / base) * 100 : 0;
    var pctLabel = fmtPct(pct) + " %";
    var demandeur = sens === "bas" ? "emetteur" : "client";
    var sensLabel = sens === "bas" ? "Prix trop bas, au détriment de l'émetteur" : (sens === "haut" ? "Prix trop élevé, au détriment du client" : "Aucun écart");
    var accLabel = dA ? "le " + fmtDate(dA) : "à la date d'acceptation";

    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    // 1. Stade
    if (stade === "brouillon") add(POINTS[0], "ok", "Le devis n'est pas encore parti : corrigez-le avant l'envoi, rien ne vous lie encore.");
    else if (stade === "envoye") add(POINTS[0], "info", "Le devis envoyé est une offre (articles 1113 et 1114). Tant qu'elle n'est pas parvenue au client, elle se retire librement (article 1115) ; une fois reçue, sa rétractation avant acceptation empêche le contrat de se former, mais peut engager la responsabilité extracontractuelle de son auteur s'il avait fixé un délai ou si un délai raisonnable n'est pas écoulé (article 1116).");
    else if (stade === "accepte") add(POINTS[0], "info", "Le contrat est formé depuis l'acceptation, " + accLabel + " (article 1121), et il oblige les deux parties (article 1103). Le prix ne change plus sans accord, sauf erreur rectifiable par interprétation ou nullité prononcée.");
    else add(POINTS[0], "warn", "Le contrat est formé et son exécution a commencé : la correction reste possible, mais elle se discute désormais avec les livraisons, les factures et les paiements déjà faits. Écrivez sans attendre.");

    // 2. Nature
    if (pre) add(POINTS[1], "info", "Avant acceptation, la nature de l'erreur compte peu : un devis corrigé, daté et numéroté, remplace le précédent.");
    else if (typeErreur === "total") add(POINTS[1], "ok", "Erreur d'arithmétique : le total ne correspond pas aux lignes. Le juge doit rechercher si elle est rectifiable en fonction des éléments de calcul connus des deux parties au moment de l'acceptation (Cass. 3e civ., 12 septembre 2012, n° 11-13.120).");
    else if (typeErreur === "unitaire") add(POINTS[1], "warn", "Erreur matérielle sur un prix unitaire : elle ne se déduit pas d'une simple addition. Il faut montrer que ce prix ne correspond pas à la commune intention des parties (article 1188) : catalogue, devis antérieurs, prix des lignes voisines.");
    else if (typeErreur === "quantite") add(POINTS[1], "warn", "Quantité erronée : elle se prouve par le métré, les plans ou la demande du client. Le prix a été accepté sur cette quantité, et l'écart ne se rattrape pas d'office.");
    else if (typeErreur === "oubli") add(POINTS[1], "warn", "Poste oublié : le client a accepté un périmètre sans ce poste. Sauf preuve qu'il était convenu, c'est un travail à chiffrer à part et à faire accepter par avenant.");
    else add(POINTS[1], "bad", "Erreur d'estimation : l'appréciation économique inexacte d'une prestation, sans erreur sur ses qualités essentielles, n'est pas une cause de nullité (article 1136). Le prix accepté reste dû ; seule une négociation peut le changer.");

    // 3. Éléments de calcul
    if (pre) add(POINTS[2], "info", "Profitez de la correction pour détailler chaque ligne : désignation, quantité, prix unitaire, montant.");
    else if (typeErreur === "estimation") add(POINTS[2], "info", "Sans incidence ici : une erreur d'estimation ne se lit pas dans le devis.");
    else if (elementsCalcul === "visibles") add(POINTS[2], "ok", "Les lignes, quantités et prix unitaires figurent sur le devis accepté : le calcul correct se refait à partir du document lui-même.");
    else if (elementsCalcul === "partiels") add(POINTS[2], "warn", "Le détail est partiel : complétez la preuve par les pièces échangées avant l'acceptation (métré, plans, catalogue, courriels).");
    else if (typeErreur === "total") add(POINTS[2], "bad", "Prix global seul : aucune discordance entre lignes et total ne se lit sur le devis. Le total accepté fait foi.");
    else add(POINTS[2], "warn", "Prix global seul : la preuve de l'erreur repose entièrement sur des pièces extérieures au devis.");

    // 4. Caractère décelable
    if (pre) add(POINTS[3], "info", "Sans objet avant l'acceptation : l'erreur est corrigée à la source.");
    else if (typeErreur === "estimation") add(POINTS[3], "info", "Sans objet : une sous-estimation ou une surestimation ne se voit pas à la lecture du devis.");
    else if (typeErreur === "total") add(POINTS[3], "ok", "La discordance se voit sur le devis lui-même : il suffit de refaire l'addition.");
    else if (evidence === "grossiere") add(POINTS[3], "ok", "L'écart se voit à la lecture pour un professionnel : il est difficile de soutenir que ce prix a été voulu tel quel.");
    else add(POINTS[3], "warn", "Le prix paraît plausible : l'autre partie a pu de bonne foi le croire voulu. La rectification sera plus difficile à obtenir.");

    // 5. Confirmation
    if (pre) add(POINTS[4], "info", "Sans objet avant l'acceptation.");
    else if (confirmation === "oui" && sens === "bas") add(POINTS[4], "bad", "Le prix a été confirmé par écrit en termes clairs : une erreur ainsi confirmée a été jugée inexcusable, et l'offre acceptée ne pouvait plus être rétractée (Cass. 3e civ., 8 juin 2010, n° 09-66.495 ; article 1132).");
    else if (confirmation === "oui" && sens === "haut") add(POINTS[4], "warn", "Le client a obtenu confirmation du prix avant d'accepter : il l'a accepté en connaissance de cause, ce qui affaiblit une demande de baisse.");
    else if (confirmation === "oui") add(POINTS[4], "info", "Prix confirmé, sans écart : rien à rectifier.");
    else add(POINTS[4], "ok", "Le prix n'a pas été confirmé après une question : rien ne montre qu'il ait été voulu tel quel.");

    // 6. Qualité du client
    if (clientPro === "memeMetier") add(POINTS[5], "info", "Client du même métier : il était à même de repérer l'erreur, ce qui compte dans l'appréciation de la bonne foi (article 1104). Son seul silence ne suffit pas toujours : faute d'obligation de vérifier, une condamnation fondée sur ce silence a été censurée (Cass. 3e civ., 28 février 2018, n° 17-11.226).");
    else add(POINTS[5], "info", "Client professionnel d'un autre domaine : on attend moins de lui qu'il repère une erreur technique ; une erreur de total reste visible par tous.");

    // 7. Type de prix
    if (pre) add(POINTS[6], "info", "Indiquez clairement sur le devis corrigé si le prix est global et forfaitaire ou établi à l'unité.");
    else if (forfait === "non") add(POINTS[6], "ok", "Prix détaillé ou à l'unité : chaque ligne se lit, et une erreur de calcul se démontre.");
    else if (forfait === "global") add(POINTS[6], "warn", "Prix global et forfaitaire : l'accord a porté sur le total. Le détail sert de preuve, sans garantir la rectification.");
    else if (typeErreur === "quantite" || typeErreur === "oubli" || typeErreur === "estimation") add(POINTS[6], "bad", "Marché à forfait de construction : le prix convenu est intangible (article 1793). Une erreur de métré, un oubli ou une mauvaise estimation ne permet ni d'augmenter le prix sans accord écrit, ni d'exiger un remboursement sans obligation de vérifier (Cass. 3e civ., 28 février 2018, n° 17-11.226).");
    else add(POINTS[6], "warn", "Marché à forfait de construction : le prix est intangible (article 1793), mais la recherche d'une erreur d'arithmétique rectifiable a été exigée dans un marché de travaux (11-13.120). À défendre pièces à l'appui.");

    // 8. Clause
    if (pre && clauseErreur !== "presente") add(POINTS[7], "info", "Ajoutez au devis corrigé une clause qui dit ce qui fait foi en cas de discordance entre les lignes et le total.");
    else if (clauseErreur === "presente") add(POINTS[7], "ok", "Une clause acceptée dit ce qui fait foi en cas de discordance : appliquez-la et citez-la dans votre message.");
    else if (clauseErreur === "transmise") add(POINTS[7], "warn", "La clause a été transmise, mais son acceptation se discute (article 1119) : ne bâtissez pas tout dessus.");
    else add(POINTS[7], "warn", "Aucune clause sur les erreurs matérielles : la solution dépend de l'interprétation du contrat (articles 1188 à 1192), et dans le doute le contrat de gré à gré s'interprète en faveur du débiteur (article 1190).");

    // 9. Tiers
    if (tiers === "oui") add(POINTS[8], "info", "Un tiers chargé d'analyser les offres pouvait repérer l'erreur : sa responsabilité peut être recherchée (11-13.120). Le caractère forfaitaire du marché n'exonère pas le bureau d'études dont l'erreur a conduit à un avenant (Cass. 3e civ., 13 février 2013, n° 11-25.978).");
    else add(POINTS[8], "info", "Aucun tiers chargé de vérifier le devis : la discussion reste entre les deux parties.");

    // 10. Montants
    if (dev === 0 && cor === 0) add(POINTS[9], "warn", "Indiquez le montant figurant sur le devis et le montant correct.");
    else if (ecart === 0) add(POINTS[9], "warn", "Les deux montants sont égaux : il n'y a pas d'écart à rectifier.");
    else add(POINTS[9], "ok", "Écart de " + fmtEur(ecartAbs) + " (" + pctLabel + " du montant correct) : le prix du devis est " + (sens === "bas" ? "trop bas." : "trop élevé."));

    // 11. Délai de réaction
    var delaiReaction = null;
    if (!dD || !dS) add(POINTS[10], "warn", "Date de découverte ou de signalement absente ou invalide : datez les deux.");
    else {
      delaiReaction = daysBetween(dD, dS);
      if (delaiReaction < 0) add(POINTS[10], "warn", "Le signalement est daté avant la découverte : vérifiez les dates.");
      else if (!pre && dA && cmpDate(dD, dA) < 0 && role === demandeur && ecart !== 0) add(POINTS[10], "warn", "L'erreur était connue avant l'acceptation du " + fmtDate(dA) + " : il fallait corriger ou retirer le devis à ce moment (articles 1115 et 1116). La demande sera plus difficile à défendre.");
      else if (delaiReaction <= REPERE_JOURS) add(POINTS[10], "ok", "Signalement " + plural(delaiReaction, "jour", "jours") + " après la découverte. Repère de l'outil : " + REPERE_JOURS + " jours au plus, ce n'est pas un délai légal.");
      else add(POINTS[10], "warn", "Signalement " + plural(delaiReaction, "jour", "jours") + " après la découverte, au-delà du repère de " + REPERE_JOURS + " jours de l'outil : plus on attend, plus le silence se lit comme une acceptation du prix.");
    }

    // 12. Délai pour agir
    var dateLimite = null;
    if (pre) add(POINTS[11], "info", "Pas de délai à surveiller : le devis n'est pas accepté.");
    else if (!dD) add(POINTS[11], "info", "Date de découverte invalide : délai non calculé.");
    else {
      dateLimite = addYears(dD, 5);
      add(POINTS[11], "info", "Repère : les actions entre professionnels se prescrivent par cinq ans (article 2224 du code civil, article L110-4 du code de commerce) et, pour une nullité pour erreur, le délai court du jour de la découverte (article 1144), soit au plus tard vers le " + fmtDate(dateLimite) + ". Le point de départ exact dépend de l'action choisie.");
    }

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) {
      if (c.statut === "ok") nbOk++;
      else if (c.statut === "warn") nbWarn++;
      else if (c.statut === "bad") nbBad++;
      else nbInfo++;
    });
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");

    var issue, retenu;
    if (ecart === 0) { issue = "Aucun écart"; retenu = dev; }
    else if (stade === "brouillon") { issue = "Corriger avant l'envoi"; retenu = cor; }
    else if (stade === "envoye") { issue = role === "emetteur" ? "Retirer l'offre et envoyer un devis corrigé" : "Signaler l'erreur avant d'accepter"; retenu = cor; }
    else if (nbBad > 0) { issue = "Prix accepté maintenu"; retenu = dev; }
    else if (typeErreur === "total") { issue = "Rectification envisageable"; retenu = cor; }
    else { issue = "Rectification à négocier"; retenu = cor; }

    var prefix = nbBad > 0
      ? plural(nbBad, "point bloquant", "points bloquants") + (nbWarn > 0 ? " et " + nbWarn + " à compléter" : "")
      : (nbWarn > 0 ? "Aucun point bloquant, " + nbWarn + " à compléter" : "Aucun point bloquant");
    var body;
    if (ecart === 0) body = "Aucun écart à rectifier : le prix de " + fmtEur(dev) + " reste celui du devis.";
    else if (stade === "brouillon") body = "Corrigez avant l'envoi : " + fmtEur(cor) + " au lieu de " + fmtEur(dev) + ".";
    else if (stade === "envoye") body = (role === "emetteur" ? "Offre à retirer et à remplacer : " : "Signalez l'erreur avant d'accepter : ") + fmtEur(cor) + " au lieu de " + fmtEur(dev) + ".";
    else if (nbBad > 0) body = "Le prix accepté de " + fmtEur(dev) + " reste la référence ; écart en jeu : " + fmtEur(ecartAbs) + " (" + pctLabel + ").";
    else if (typeErreur === "total") body = "Erreur arithmétique rectifiable : total défendable " + fmtEur(cor) + " au lieu de " + fmtEur(dev) + " (écart " + fmtEur(ecartAbs) + ", " + pctLabel + ").";
    else body = "Rectification à négocier : " + fmtEur(cor) + " au lieu de " + fmtEur(dev) + " (écart " + fmtEur(ecartAbs) + ", " + pctLabel + ").";
    var verdict = prefix + ". " + body;

    var articles = [
      "Article 1. Détail du prix. Le prix est détaillé ligne par ligne : désignation, quantité, prix unitaire et montant. Le total est la somme des montants des lignes.",
      "Article 2. Erreur de calcul. En cas de discordance entre le total et la somme des lignes, ou entre le montant d'une ligne et le produit de sa quantité par son prix unitaire, les quantités et prix unitaires font foi et le total est rectifié, à la hausse comme à la baisse.",
      "Article 3. Signalement. Chaque partie signale par écrit à l'autre toute erreur matérielle apparente dans les [" + REPERE_JOURS + "] jours de sa découverte. La rectification est constatée par un écrit des deux parties.",
      "Article 4. Quantités. Les quantités sont établies d'après [le métré du / les plans transmis le] [date]. Toute variation de quantité et tout poste nouveau font l'objet d'un avenant écrit avant exécution.",
      "Article 5. Estimation. Hors erreur matérielle au sens des articles 2 et 3, le prix accepté n'est pas révisé pour une erreur d'estimation du coût ou du temps." + (forfait === "batiment" ? " Pour un marché à forfait de construction, l'article 1793 du code civil s'applique." : ""),
      "Article 6. Document accepté. L'acceptation porte sur le devis n° [référence] daté du [date], dans son intégralité. Un récapitulatif indicatif ne vaut pas devis."
    ];
    var clause = ["Prix et erreurs matérielles"].concat(articles).join("\n");

    var actions = [];
    controles.forEach(function (c) { if (c.statut === "bad" || c.statut === "warn") actions.push(c.point + " : " + c.texte); });
    if (ecart === 0) actions.push("Conserver le devis et les échanges ; aucune correction à demander.");
    else if (pre) actions.push("Envoyer un devis corrigé, numéroté et daté, qui remplace expressément le précédent, et garder les deux versions.");
    else if (nbBad > 0) actions.push("Ne pas facturer ni retenir l'écart d'office : proposer, si besoin, un avenant que l'autre partie reste libre de refuser.");
    else actions.push("Écrire à l'autre partie avec le calcul ligne par ligne, demander un accord écrit sur le montant rectifié et conserver le devis accepté, les échanges et la réponse.");

    var objetRef = "devis n° [référence]";
    var lines;
    if (ecart === 0) {
      lines = ["Objet : " + objetRef + " : prix confirmé", "", "Bonjour,", "", "Après vérification, le montant de " + fmtEur(dev) + " figurant sur le devis est exact. Il n'y a pas lieu de le modifier.", "", "Cordialement"];
    } else if (stade === "brouillon") {
      if (role === "emetteur") lines = ["Objet : " + objetRef + " : contrôle avant envoi", "", "À vérifier avant de l'envoyer :", "1. Le total est égal à la somme des lignes : " + fmtEur(cor) + " (et non " + fmtEur(dev) + ").", "2. Chaque montant de ligne est égal à la quantité multipliée par le prix unitaire.", "3. Les quantités sont reprises du métré ou des plans, avec leur date.", "4. La clause sur les erreurs matérielles figure dans le devis."];
      else lines = ["Objet : demande de devis : détail attendu", "", "Bonjour,", "", "Pour comparer les offres, merci de détailler votre devis ligne par ligne (désignation, quantité, prix unitaire, montant), avec un total égal à la somme des lignes.", "", "Cordialement"];
    } else if (stade === "envoye") {
      if (role === "emetteur") lines = ["Objet : " + objetRef + " : devis retiré et remplacé", "", "Bonjour,", "", "Une erreur s'est glissée dans le devis que nous vous avons adressé : le montant de " + fmtEur(dev) + " est erroné. Nous retirons ce devis, qui ne doit pas être accepté, et vous adressons ci-joint le devis n° [référence] corrigé, d'un montant de " + fmtEur(cor) + ", avec le détail ligne par ligne.", "", "Nous restons à votre disposition pour en parler.", "", "Cordialement"];
      else lines = ["Objet : " + objetRef + " : erreur à vérifier avant acceptation", "", "Bonjour,", "", "En relisant votre devis, nous constatons que le montant de " + fmtEur(dev) + " ne correspond pas au détail des lignes, qui donne " + fmtEur(cor) + ". Pouvez-vous nous adresser un devis corrigé ? Nous l'examinerons avant toute acceptation.", "", "Cordialement"];
    } else {
      var objet = "Objet : " + objetRef + " accepté " + accLabel + " : " + (typeErreur === "total" ? "erreur de calcul sur le total" : "erreur matérielle sur le prix");
      if (role === demandeur && nbBad > 0) {
        lines = ["Objet : " + objetRef + " accepté " + accLabel + " : demande de réexamen du prix", "", "Bonjour,", "", "Le devis accepté prévoit " + fmtEur(dev) + ". Nous avons constaté depuis un écart de " + fmtEur(ecartAbs) + " par rapport au montant que nous aurions dû retenir (" + fmtEur(cor) + "). Nous savons que le prix accepté nous engage. Nous vous proposons néanmoins d'en parler et, si vous en êtes d'accord, de formaliser un avenant.", "", "Sans accord de votre part, le devis s'exécutera au prix convenu.", "", "Cordialement"];
      } else if (role === demandeur && role === "emetteur") {
        lines = [objet, "", "Bonjour,", "", "En reprenant votre dossier, nous avons relevé une erreur sur le devis que vous avez accepté : " + (typeErreur === "total" ? "le total indiqué, " + fmtEur(dev) + ", ne correspond pas à la somme des lignes, qui donne " + fmtEur(cor) + "." : "le montant de " + fmtEur(dev) + " repose sur une erreur matérielle ; le montant correct est de " + fmtEur(cor) + ".") + " Les quantités et les prix unitaires que vous avez acceptés restent inchangés.", "", "Nous vous proposons de constater cette rectification par un écrit commun, ou d'en parler avant la date d'exécution prévue. Le détail du calcul est joint.", "", "Cordialement"];
      } else if (role === demandeur) {
        lines = [objet, "", "Bonjour,", "", "En vérifiant le devis que nous avons accepté, nous avons relevé une erreur : " + (typeErreur === "total" ? "le total indiqué, " + fmtEur(dev) + ", est supérieur à la somme des lignes, qui donne " + fmtEur(cor) + "." : "le montant de " + fmtEur(dev) + " repose sur une erreur matérielle ; le montant correct est de " + fmtEur(cor) + ".") + " Merci de nous confirmer par écrit le montant rectifié.", "", "Cordialement"];
      } else if (role === "emetteur") {
        lines = [objet, "", "Bonjour,", "", "En relisant votre dossier, nous avons relevé une erreur en votre défaveur sur le devis accepté : le montant correct est de " + fmtEur(cor) + " et non de " + fmtEur(dev) + ". Nous rectifions le montant à votre avantage, sans autre changement.", "", "Cordialement"];
      } else {
        lines = [objet, "", "Bonjour,", "", "En relisant le devis que nous avons accepté, nous constatons que le montant de " + fmtEur(dev) + " ne correspond pas au détail, qui donne " + fmtEur(cor) + ". Nous préférons vous le signaler maintenant. Merci de nous indiquer par écrit le montant que vous retenez.", "", "Cordialement"];
      }
    }
    var message = lines.join("\n");

    var delaiLabel = pre ? "Sans objet" : (dateLimite ? "Vers le " + fmtDate(dateLimite) + " (repère)" : "Non calculé");
    var ecartLabel = ecart === 0 ? "0 €" : fmtEur(ecartAbs) + " (" + pctLabel + ")";
    var recapLines = [
      "Vérificateur d'erreur de prix dans un devis (QuoteBuilder)",
      "Position : " + ROLE_LABELS[role],
      "Stade : " + STADE_LABELS[stade],
      "Erreur : " + TYPE_LABELS[typeErreur],
      "Montant du devis : " + fmtEur(dev) + " ; montant correct : " + fmtEur(cor),
      "Écart : " + ecartLabel + " ; " + sensLabel.toLowerCase(),
      "Issue : " + issue,
      "Prix de référence : " + fmtEur(retenu),
      "Contrôles : " + plural(nbOk, "conforme", "conformes") + ", " + nbWarn + " à compléter, " + plural(nbBad, "bloquant", "bloquants") + ", " + plural(nbInfo, "information", "informations"),
      "Délai pour agir : " + delaiLabel,
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    return {
      role: role, stade: stade, typeErreur: typeErreur, pre: pre,
      montantDevis: dev, montantCorrect: cor, ecart: ecart, ecartAbs: ecartAbs, pct: pct, pctLabel: pctLabel,
      sens: sens, sensLabel: sensLabel, demandeur: demandeur, ecartLabel: ecartLabel,
      controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat,
      issue: issue, retenu: retenu, verdict: verdict, clause: clause, articles: articles.length,
      actions: actions, message: message, delaiReaction: delaiReaction,
      dateLimite: dateLimite ? iso(dateLimite) : null, delaiLabel: delaiLabel,
      recap: recapLines.join("\n")
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, REPERE_JOURS, ROLE_LABELS, STADE_LABELS, TYPE_LABELS, ELEMENTS_LABELS, EVIDENCE_LABELS, CONFIRMATION_LABELS, CLIENTPRO_LABELS, FORFAIT_LABELS, CLAUSE_LABELS, TIERS_LABELS, computeErreurPrix, buildRecap, fmtEur, fmtDate, fmtPct, parseDate, num, addYears, daysBetween };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computeErreurPrix(readForm());
      document.getElementById("issueOut").textContent = r.issue;
      document.getElementById("sensOut").textContent = r.sensLabel;
      document.getElementById("ecartOut").textContent = r.ecartLabel;
      document.getElementById("retenuOut").textContent = fmtEur(r.retenu);
      document.getElementById("delaiOut").textContent = r.delaiLabel;
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
