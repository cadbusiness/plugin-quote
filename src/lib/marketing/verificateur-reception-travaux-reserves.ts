/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-reception-travaux-reserves";
  var ROLE_LABELS = { entreprise: "entreprise qui a fait les travaux", maitre: "client, maître de l'ouvrage" };
  var NATURE_LABELS = { batiment: "ouvrage de bâtiment ou de génie civil", equipement: "élément d'équipement d'un ouvrage", pro: "équipement servant seulement à l'activité professionnelle", hors: "prestation hors construction" };
  var FORME_LABELS = { pv: "procès-verbal signé par les deux parties", pvMaitre: "procès-verbal signé par le client seul", tacite: "réception tacite, sans procès-verbal", judiciaire: "réception judiciaire", aucune: "pas encore de réception" };
  var CONVOC_LABELS = { ecrite: "convocation écrite", orale: "convocation orale", aucune: "aucune convocation" };
  var RESERVES_LABELS = { aucune: "aucune réserve", mineures: "réserves mineures", majeures: "réserves importantes" };
  var LEVEE_LABELS = { non: "pas encore levées", partielle: "levées en partie", levees: "toutes levées" };
  var GARANTIE_LABELS = { caution: "remplacée par une caution", consignation: "consignée", nonConsignee: "gardée par le client, non consignée" };
  var CLAUSE_LABELS = { aucune: "aucune clause qui réduit les garanties", limitative: "clause qui exclut ou réduit les garanties" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Forme de la réception", "Caractère contradictoire", "Date de réception", "Réserves", "Levée des réserves",
    "Garantie de parfait achèvement", "Garantie de bon fonctionnement", "Responsabilité décennale",
    "Retenue de garantie", "Libération de la retenue", "Transfert des risques", "Clause du devis"
  ];
  var DEFAULTS = {
    role: "entreprise",
    nature: "batiment",
    montant: 64000,
    dateFin: "2026-12-04",
    dateControle: "2026-12-18",
    forme: "pv",
    convocation: "ecrite",
    dateReception: "2026-12-11",
    reserves: "mineures",
    nbReserves: 3,
    delaiLevee: 30,
    levee: "non",
    retenue: 5,
    garantieRetenue: "caution",
    clauseGaranties: "aucune"
  };
  var PLAFOND_RETENUE = 5;
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
  function fromUtc(t) { var dt = new Date(t); return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() }; }
  function daysBetween(a, b) { return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000); }
  function addDays(p, n) { return fromUtc(Date.UTC(p.y, p.m - 1, p.d) + n * 86400000); }
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function addYears(p, n) {
    var y = p.y + n, d = p.d;
    if (p.m === 2 && d === 29 && !isLeap(y)) d = 28;
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
  function restant(fin, ctrl) {
    if (!fin || !ctrl) return "";
    var j = daysBetween(ctrl, fin);
    return j >= 0 ? " (" + plural(j, "jour restant", "jours restants") + " au " + fmtDate(ctrl) + ")" : "";
  }

  function computeDelais(rec, delaiLevee) {
    if (!rec) return { levee: null, gpa: null, biennale: null, decennale: null, liberation: null };
    return {
      levee: delaiLevee > 0 ? addDays(rec, delaiLevee) : null,
      gpa: addYears(rec, 1),
      biennale: addYears(rec, 2),
      decennale: addYears(rec, 10),
      liberation: addYears(rec, 1)
    };
  }

  function computeReception(input) {
    var i = input || {};
    var role = pick(i.role, ROLE_LABELS, DEFAULTS.role);
    var nature = pick(i.nature, NATURE_LABELS, DEFAULTS.nature);
    var forme = pick(i.forme, FORME_LABELS, DEFAULTS.forme);
    var convocation = pick(i.convocation, CONVOC_LABELS, DEFAULTS.convocation);
    var reserves = pick(i.reserves, RESERVES_LABELS, DEFAULTS.reserves);
    var levee = pick(i.levee, LEVEE_LABELS, DEFAULTS.levee);
    var garantieRetenue = pick(i.garantieRetenue, GARANTIE_LABELS, DEFAULTS.garantieRetenue);
    var clauseG = pick(i.clauseGaranties, CLAUSE_LABELS, DEFAULTS.clauseGaranties);
    var montant = num(i.montant, 0, 1000000000, 0);
    var nbReserves = num(i.nbReserves, 0, 500, 0);
    var delaiLevee = num(i.delaiLevee, 0, 365, 0);
    var retenue = dec(i.retenue, 0, 100, 0);
    var dFin = parseDate(i.dateFin), dCtrl = parseDate(i.dateControle);
    var recue = forme !== "aucune";
    var dRec = recue ? parseDate(i.dateReception) : null;
    var dl = computeDelais(dRec, delaiLevee);
    var construction = nature === "batiment" || nature === "equipement";
    var aReserves = recue && reserves !== "aucune";
    var retenueEur = Math.round(montant * retenue / 100);
    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    // 1 Forme
    if (forme === "pv") add(POINTS[0], "ok", "Procès-verbal daté et signé par vous deux : c'est la forme la plus sûre. La réception est l'acte par lequel le maître de l'ouvrage déclare accepter l'ouvrage, avec ou sans réserves (article 1792-6 du code civil).");
    else if (forme === "pvMaitre") add(POINTS[0], "warn", "Procès-verbal signé par le client seul : la réception doit être prononcée contradictoirement (article 1792-6 du code civil). Faites contresigner le procès-verbal, ou gardez la preuve que l'entreprise a été convoquée.");
    else if (forme === "tacite") add(POINTS[0], "warn", "Pas de procès-verbal : les tribunaux admettent une réception tacite quand le client montre une volonté claire d'accepter l'ouvrage, par exemple en prenant possession et en payant l'essentiel du prix. Elle se prouve mal. Faites un procès-verbal, même après coup.");
    else if (forme === "judiciaire") add(POINTS[0], "info", "Réception prononcée par le juge, à défaut d'accord (article 1792-6 du code civil). La date retenue est celle que fixe la décision.");
    else add(POINTS[0], "bad", "Pas de réception : aucune garantie ne court, la retenue reste bloquée et le solde lié à la réception n'est pas exigible. Elle se demande par la partie la plus diligente (article 1792-6 du code civil). Demandez-la par écrit.");
    // 2 Contradictoire
    if (!recue) add(POINTS[1], "warn", "Rien à constater pour l'instant. Convoquez l'autre partie par écrit, avec une date, une heure et le lieu de la visite.");
    else if (forme === "judiciaire") add(POINTS[1], "info", "Le juge entend les deux parties : le caractère contradictoire est assuré par la procédure.");
    else if (forme === "tacite") add(POINTS[1], "info", "Pas de visite commune : rien n'a été constaté ensemble. Les défauts relevés après coup se signalent par écrit.");
    else if (convocation === "ecrite") add(POINTS[1], "ok", "Convocation écrite avec date et heure : vous pourrez prouver que les deux parties ont été appelées.");
    else if (convocation === "orale") add(POINTS[1], "warn", "Convocation orale : elle se prouve mal. Confirmez la date et l'heure par écrit, même par un simple e-mail.");
    else if (forme === "pv") add(POINTS[1], "info", "Pas de convocation écrite, mais vous avez signé ensemble : le caractère contradictoire est acquis par le procès-verbal commun.");
    else add(POINTS[1], "bad", "Procès-verbal du client seul, sans convocation de l'entreprise : la réception n'est pas contradictoire et peut être contestée (article 1792-6 du code civil).");
    // 3 Date
    if (!recue) add(POINTS[2], "info", "Pas de date de réception : aucun délai de garantie ne commence.");
    else if (!dRec) add(POINTS[2], "bad", "Date de réception absente ou invalide : c'est elle qui fait courir toutes les garanties. Datez le procès-verbal.");
    else if (dFin && daysBetween(dFin, dRec) < 0) add(POINTS[2], "warn", "Réception le " + fmtDate(dRec) + ", avant la fin des travaux annoncée (" + fmtDate(dFin) + ") : c'est possible, mais tout ce qui reste à faire doit figurer en réserves.");
    else add(POINTS[2], "ok", "Réception le " + fmtDate(dRec) + (dFin ? ", " + plural(daysBetween(dFin, dRec), "jour", "jours") + " après la fin des travaux annoncée." : "."));
    // 4 Réserves
    if (!recue) add(POINTS[3], "info", "Sans objet tant que la réception n'est pas prononcée. Listez déjà ce qui reste à faire avant la visite.");
    else if (reserves === "aucune") add(POINTS[3], "ok", "Réception sans réserves. Les défauts apparents non réservés se reprochent ensuite difficilement ; ceux qui apparaissent dans l'année se signalent par écrit (article 1792-6 du code civil).");
    else if (nbReserves === 0) add(POINTS[3], "warn", "Réserves annoncées mais non listées : chaque réserve doit être décrite au procès-verbal (lieu, défaut constaté, travaux attendus).");
    else if (reserves === "mineures") add(POINTS[3], "info", plural(nbReserves, "réserve mineure", "réserves mineures") + " : la réception est acquise, les réserves sont à reprendre au titre de la garantie de parfait achèvement (article 1792-6 du code civil).");
    else add(POINTS[3], "warn", plural(nbReserves, "réserve importante", "réserves importantes") + " : la réception reste acquise une fois prononcée, mais l'usage peut être limité. Fixez un délai court et un constat de levée par écrit.");
    // 5 Levée
    var leveeLabel = "Sans objet";
    if (!recue) add(POINTS[4], "info", "Sans objet tant que la réception n'est pas prononcée.");
    else if (reserves === "aucune") add(POINTS[4], "info", "Sans objet : aucune réserve au procès-verbal.");
    else if (levee === "levees") { leveeLabel = "Réserves levées"; add(POINTS[4], "ok", "Levée constatée par écrit : gardez ce constat avec le procès-verbal. L'exécution des reprises se constate d'un commun accord, ou à défaut en justice (article 1792-6 du code civil)."); }
    else if (delaiLevee === 0) { leveeLabel = "Délai non fixé"; add(POINTS[4], "warn", "Aucun délai écrit : les délais de reprise se fixent d'un commun accord entre le maître de l'ouvrage et l'entreprise (article 1792-6 du code civil). Écrivez-le au procès-verbal."); }
    else if (!dl.levee) { leveeLabel = "Non calculé"; add(POINTS[4], "warn", "Date de réception manquante : la date limite de levée n'est pas calculée."); }
    else {
      leveeLabel = fmtDate(dl.levee);
      var retard = dCtrl ? daysBetween(dl.levee, dCtrl) : null;
      var quoi = nbReserves > 0 ? plural(nbReserves, "réserve", "réserves") : "Les réserves";
      if (retard !== null && retard > 0) add(POINTS[4], "bad", "Délai dépassé de " + plural(retard, "jour", "jours") + " (limite du " + fmtDate(dl.levee) + ")" + (levee === "partielle" ? ", reprises faites en partie" : "") + ". Après une mise en demeure restée sans effet, le client peut faire exécuter les reprises aux frais et risques de l'entreprise (article 1792-6 du code civil).");
      else add(POINTS[4], "warn", quoi + " à lever d'ici le " + fmtDate(dl.levee) + restant(dl.levee, dCtrl) + (levee === "partielle" ? ", une partie est déjà reprise" : "") + ". Constatez la levée par écrit.");
    }
    // 6 GPA
    if (!recue) add(POINTS[5], "info", "Ne court pas sans réception. Avant la réception, les défauts relèvent de la responsabilité contractuelle ordinaire de l'entreprise.");
    else if (!dl.gpa) add(POINTS[5], "info", "Non calculée : date de réception manquante.");
    else if (nature === "hors") add(POINTS[5], "info", "Hors travaux de construction, pas de garantie de parfait achèvement de l'article 1792-6 : c'est la garantie écrite au devis qui compte. Repère d'un an : " + fmtDate(dl.gpa) + ".");
    else if (dCtrl && daysBetween(dl.gpa, dCtrl) > 0) add(POINTS[5], "info", "Expirée le " + fmtDate(dl.gpa) + ". Les réserves déjà notifiées restent à reprendre ; les nouveaux désordres relèvent des autres garanties.");
    else add(POINTS[5], "info", "Un an à compter de la réception, jusqu'au " + fmtDate(dl.gpa) + restant(dl.gpa, dCtrl) + " : l'entreprise répare les désordres réservés et ceux notifiés par écrit pendant l'année, hors usure normale (article 1792-6 du code civil).");
    // 7 Biennale
    if (!recue || !dl.biennale) add(POINTS[6], "info", "Ne court pas sans date de réception.");
    else if (nature === "pro") add(POINTS[6], "info", "Un équipement dont la fonction exclusive est de permettre l'activité professionnelle n'est pas un élément d'équipement au sens des articles 1792 à 1792-4 (article 1792-7 du code civil) : garantie du devis et vices cachés.");
    else if (nature === "hors") add(POINTS[6], "info", "Pas de garantie de bon fonctionnement de l'article 1792-3 hors construction : garantie du devis et vices cachés.");
    else add(POINTS[6], "info", "Éléments d'équipement dissociables : deux ans au moins à compter de la réception, jusqu'au " + fmtDate(dl.biennale) + " (article 1792-3 du code civil).");
    // 8 Décennale
    var decLabel = "Non applicable";
    if (!recue || !dl.decennale) { decLabel = "Ne court pas"; add(POINTS[7], "info", "Ne court pas sans date de réception."); }
    else if (nature === "batiment") { decLabel = fmtDate(dl.decennale); add(POINTS[7], "info", "Dommages qui compromettent la solidité de l'ouvrage ou le rendent impropre à sa destination (article 1792) : dix ans à compter de la réception, jusqu'au " + fmtDate(dl.decennale) + " (article 1792-4-1). L'entreprise doit en principe être assurée (article L241-1 du code des assurances)."); }
    else if (nature === "equipement") { decLabel = fmtDate(dl.decennale); add(POINTS[7], "info", "Si l'élément fait indissociablement corps avec l'ouvrage (article 1792-2) ou si son défaut rend l'ouvrage impropre à sa destination, dix ans jusqu'au " + fmtDate(dl.decennale) + " (article 1792-4-1 du code civil)."); }
    else add(POINTS[7], "info", nature === "pro" ? "Équipement professionnel exclu des éléments d'équipement de l'article 1792 (article 1792-7 du code civil) : la décennale ne joue pas pour lui, elle peut jouer pour l'ouvrage qui le reçoit." : "Hors construction, pas de responsabilité décennale : responsabilité contractuelle et garantie du devis.");
    // 9 Retenue
    if (retenue === 0) add(POINTS[8], "info", "Aucune retenue de garantie.");
    else if (retenue > PLAFOND_RETENUE) {
      if (construction) add(POINTS[8], "bad", fmtPct(retenue) + " % (" + fmtEur(retenueEur) + ") : au-delà du plafond de 5 % des acomptes dans les marchés de travaux privés (loi n° 71-584 du 16 juillet 1971, article 1er).");
      else add(POINTS[8], "warn", fmtPct(retenue) + " % (" + fmtEur(retenueEur) + ") : le plafond de 5 % vise les marchés de travaux privés (loi n° 71-584, article 1er). Vérifiez si votre contrat en relève.");
    }
    else if (garantieRetenue === "caution") add(POINTS[8], "ok", fmtEur(retenueEur) + " (" + fmtPct(retenue) + " %) remplacés par une caution personnelle et solidaire d'un établissement financier : la retenue n'est alors pas pratiquée (loi n° 71-584, article 1er).");
    else if (garantieRetenue === "consignation") add(POINTS[8], "ok", fmtEur(retenueEur) + " (" + fmtPct(retenue) + " %) consignés chez un tiers accepté par les deux parties (loi n° 71-584, article 1er).");
    else add(POINTS[8], "warn", fmtEur(retenueEur) + " (" + fmtPct(retenue) + " %) gardés par le client : il doit consigner une somme égale chez un consignataire (loi n° 71-584, article 1er).");
    // 10 Libération
    var libLabel = "Sans objet";
    if (retenue === 0) add(POINTS[9], "info", "Rien à libérer.");
    else if (!recue || !dl.liberation) { libLabel = "Bloquée"; add(POINTS[9], "warn", "Sans date de réception, le délai d'un an ne court pas : la retenue ou la caution reste bloquée."); }
    else {
      libLabel = fmtDate(dl.liberation);
      var echue = dCtrl && daysBetween(dl.liberation, dCtrl) >= 0;
      add(POINTS[9], "info", (echue ? "Libérable depuis le " : "Le ") + fmtDate(dl.liberation) + ", un an après la réception, avec ou sans réserves, même sans mainlevée, sauf opposition motivée notifiée par lettre recommandée (loi n° 71-584, article 2)." + (role === "entreprise" ? "" : " Une opposition abusive expose à des dommages-intérêts."));
    }
    // 11 Risques
    if (!recue) add(POINTS[10], "warn", "Avant la livraison, si l'entreprise a fourni la matière, la perte de l'ouvrage est pour elle, sauf si le client était en demeure de recevoir (article 1788 du code civil). Gardez l'assurance du chantier jusqu'à la réception.");
    else if (!dRec) add(POINTS[10], "warn", "Sans date de réception, le moment où la garde passe au client n'est pas établi.");
    else add(POINTS[10], "ok", "Ouvrage reçu le " + fmtDate(dRec) + " : en pratique, la réception marque la livraison, et le risque de perte de l'article 1788 du code civil ne pèse plus sur l'entreprise.");
    // 12 Clause
    if (clauseG === "aucune") add(POINTS[11], "ok", "Aucune clause ne réduit les garanties légales.");
    else if (construction) add(POINTS[11], "bad", "Une clause qui exclut ou limite les garanties des articles 1792 à 1792-6 est réputée non écrite (article 1792-5 du code civil). Elle ne protège pas l'entreprise et trompe le client. Retirez-la.");
    else add(POINTS[11], "info", "Hors garanties légales de la construction, une clause limitative se discute entre professionnels, dans les limites du droit commun des contrats.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) { if (c.statut === "ok") nbOk++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");
    var badPoints = controles.filter(function (c) { return c.statut === "bad"; }).map(function (c) { return c.point.toLowerCase(); });
    var recLabel = !recue ? "Pas de réception" : (dRec ? fmtDate(dRec) : "Non datée");
    var gpaLabel = (recue && dl.gpa) ? fmtDate(dl.gpa) : "Ne court pas";
    var bienLabel = (recue && dl.biennale) ? (construction ? fmtDate(dl.biennale) : "non applicable") : "ne court pas";
    var retenueLabel = retenue === 0 ? "Aucune" : fmtEur(retenueEur) + " (" + fmtPct(retenue) + " %)";
    var resume;
    if (!recue || !dRec) resume = "Aucune date de réception : les garanties ne courent pas.";
    else resume = "Réception du " + fmtDate(dRec) + " : " + (aReserves ? (levee === "levees" ? "réserves levées" : (nbReserves > 0 ? plural(nbReserves, "réserve", "réserves") : "réserves") + " à lever" + (dl.levee ? " avant le " + fmtDate(dl.levee) : "")) : "sans réserves") + ", garantie de parfait achèvement jusqu'au " + fmtDate(dl.gpa) + ".";
    var verdict;
    if (nbBad > 0) verdict = plural(nbBad, "point bloquant", "points bloquants") + " : " + badPoints.join(", ") + ". " + resume;
    else verdict = "Aucun point bloquant, " + (nbWarn > 0 ? nbWarn + " à compléter. " : "rien à compléter. ") + resume;

    var clauseLines = [
      "Article [X] : Réception des travaux",
      "1. La réception est demandée par la partie la plus diligente. L'entreprise convoque le client par écrit au moins [8] jours avant la date proposée, en indiquant le lieu et l'heure.",
      "2. Elle est constatée par un procès-verbal daté et signé par les deux parties, avec ou sans réserves. Chaque réserve y est décrite : lieu, défaut constaté, travaux attendus.",
      "3. Le délai de levée des réserves est fixé d'un commun accord dans le procès-verbal ; à défaut, il est de [" + (delaiLevee > 0 ? delaiLevee : 30) + "] jours. La levée est constatée par écrit.",
      retenue > 0
        ? "4. Une retenue de garantie de " + fmtPct(Math.min(retenue, PLAFOND_RETENUE)) + " % au plus peut être pratiquée sur les acomptes. Elle n'est pas pratiquée si l'entreprise fournit une caution d'un montant égal, et elle est libérée un an après la réception, sauf opposition motivée (loi n° 71-584 du 16 juillet 1971)."
        : "4. Aucune retenue de garantie n'est pratiquée sur les acomptes.",
      "5. Le solde du prix est payable à la réception, sous déduction de la retenue de garantie éventuelle, dans le délai de paiement indiqué au devis.",
      construction
        ? "6. Les garanties des articles 1792 à 1792-6 du code civil s'appliquent ; aucune stipulation du présent devis ne les limite."
        : "6. La prestation est garantie [12] mois à compter de la réception, hors usure normale et mauvaise utilisation."
    ];
    var clauseTxt = clauseLines.join("\n");

    var actionMap = {
      "Forme de la réception": forme === "aucune" ? (role === "entreprise" ? "Demandez la réception par écrit, avec une date de visite et le procès-verbal prêt à signer." : "Proposez une date de visite de réception et préparez la liste de vos réserves.") : "Établissez un procès-verbal daté et signé par les deux parties, même après coup.",
      "Caractère contradictoire": forme === "aucune" ? "Envoyez une convocation écrite avec date, heure et lieu." : (convocation === "orale" ? "Confirmez la convocation par écrit." : "Faites contresigner le procès-verbal par l'entreprise, ou refaites une visite commune."),
      "Date de réception": dRec ? "Listez en réserves ce qui reste à faire à la date de réception." : "Datez le procès-verbal : sans date, aucune garantie ne se calcule.",
      "Réserves": nbReserves === 0 ? "Décrivez chaque réserve une par une au procès-verbal." : "Fixez un délai court pour les réserves importantes et prévoyez une visite de levée.",
      "Levée des réserves": delaiLevee === 0 ? "Écrivez au procès-verbal un délai de levée accepté par les deux parties." : (role === "entreprise" ? "Planifiez les reprises et proposez une date pour constater la levée." : "Envoyez une mise en demeure écrite avec un délai, avant de faire exécuter les reprises par un tiers."),
      "Retenue de garantie": retenue > PLAFOND_RETENUE ? "Ramenez la retenue à 5 % au plus des acomptes." : "Faites consigner la retenue chez un tiers, ou proposez une caution bancaire.",
      "Libération de la retenue": "Prononcez la réception pour faire courir le délai d'un an de libération.",
      "Transfert des risques": "Gardez le chantier assuré et protégé jusqu'à la réception.",
      "Clause du devis": "Retirez du devis toute clause qui exclut ou réduit les garanties légales."
    };
    var actions = [];
    controles.forEach(function (c) { if (c.statut === "bad") actions.push(actionMap[c.point]); });
    controles.forEach(function (c) { if (c.statut === "warn") actions.push(actionMap[c.point]); });
    actions.push(role === "entreprise" ? "Classez avec le devis le procès-verbal, la convocation, le constat de levée et la date de fin de chaque garantie." : "Classez le procès-verbal et notez dans votre agenda la fin de la garantie de parfait achèvement.");

    var finTxt = dFin ? fmtDate(dFin) : "[date]";
    var recTxt = dRec ? fmtDate(dRec) : "[date]";
    var leveeTxt = dl.levee ? fmtDate(dl.levee) : "[date]";
    var lines;
    if (role === "entreprise") {
      if (!recue) {
        lines = ["Objet : chantier [référence] : demande de réception des travaux", "", "Bonjour,", "", "Les travaux prévus au devis n° [référence] sont terminés depuis le " + finTxt + ". Nous vous proposons de procéder ensemble à leur réception le [date] à [heure], sur place.", "", "Nous apporterons le procès-verbal. Vous pourrez y noter vos réserves éventuelles, une par une. Merci de nous confirmer ce rendez-vous ou de nous en proposer un autre."];
      } else {
        lines = ["Objet : chantier [référence] : réception du " + recTxt + " et suite", "", "Bonjour,", "", "Merci pour la réception des travaux du " + recTxt + "."];
        if (aReserves && levee !== "levees") lines.push("", "Nous reprendrons " + (nbReserves > 0 ? "les " + plural(nbReserves, "réserve", "réserves") + " listées" : "les réserves notées") + " au procès-verbal d'ici le " + leveeTxt + ", puis nous vous proposerons une date pour constater leur levée ensemble.");
        else if (aReserves) lines.push("", "Les réserves du procès-verbal sont levées. Nous vous adressons le constat de levée signé.");
        else lines.push("", "La réception a été prononcée sans réserves.");
        if (retenue > 0 && dl.liberation) lines.push("", "La retenue de garantie de " + fmtEur(retenueEur) + " sera libérable le " + fmtDate(dl.liberation) + ", sauf opposition motivée de votre part.");
      }
    } else {
      if (!recue) {
        lines = ["Objet : chantier [référence] : réception des travaux", "", "Bonjour,", "", "Vous nous indiquez que les travaux du devis n° [référence] sont terminés. Nous vous proposons une visite de réception contradictoire le [date] à [heure].", "", "Nous noterons au procès-verbal nos réserves éventuelles, une par une, avec un délai de reprise convenu ensemble."];
      } else {
        lines = ["Objet : chantier [référence] : réserves du procès-verbal du " + recTxt, "", "Bonjour,"];
        var depasse = dl.levee && dCtrl && daysBetween(dl.levee, dCtrl) > 0 && aReserves && levee !== "levees";
        if (depasse) lines.push("", "Le procès-verbal du " + recTxt + " prévoyait la levée des réserves avant le " + leveeTxt + ". Ce délai est dépassé. Nous vous mettons en demeure de reprendre ces réserves sous [15] jours. À défaut, nous pourrons les faire exécuter à vos frais et risques (article 1792-6 du code civil).");
        else if (aReserves && levee !== "levees") lines.push("", "Le procès-verbal du " + recTxt + " liste " + (nbReserves > 0 ? plural(nbReserves, "réserve", "réserves") : "des réserves") + ". Merci de les reprendre d'ici le " + leveeTxt + ", puis de nous proposer une date pour constater leur levée.");
        else lines.push("", "Nous vous confirmons la réception du " + recTxt + ". Nous vous signalerons par écrit tout désordre qui apparaîtrait " + (dl.gpa ? "d'ici le " + fmtDate(dl.gpa) : "dans l'année qui suit la réception") + ".");
      }
    }
    lines.push("", "Cordialement");
    var message = lines.join("\n");

    var recapLines = [
      "Vérificateur de réception des travaux et des réserves (QuoteBuilder)",
      "Position : " + ROLE_LABELS[role],
      "Travaux : " + NATURE_LABELS[nature] + ", marché de " + fmtEur(montant),
      "Réception : " + FORME_LABELS[forme] + (recue ? " ; date : " + recLabel + " ; " + CONVOC_LABELS[convocation] : ""),
      "Réserves : " + (recue ? RESERVES_LABELS[reserves] + (aReserves ? " (" + nbReserves + "), " + LEVEE_LABELS[levee] : "") : "sans objet") + " ; levée : " + leveeLabel,
      "Parfait achèvement : " + gpaLabel + " ; bon fonctionnement : " + bienLabel,
      "Décennale : " + decLabel,
      "Retenue : " + retenueLabel + (retenue > 0 ? ", " + GARANTIE_LABELS[garantieRetenue] : "") + " ; libération : " + libLabel,
      "Clause : " + CLAUSE_LABELS[clauseG],
      "Contrôles : " + plural(nbOk, "conforme", "conformes") + ", " + nbWarn + " à compléter, " + plural(nbBad, "bloquant", "bloquants") + ", " + plural(nbInfo, "information", "informations"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    return {
      role: role, nature: nature, forme: forme, convocation: convocation, reserves: reserves, levee: levee, garantieRetenue: garantieRetenue, clauseGaranties: clauseG,
      montant: montant, nbReserves: nbReserves, delaiLevee: delaiLevee, retenue: retenue, retenueEur: retenueEur,
      dateReception: dRec, delais: dl, recLabel: recLabel, leveeLabel: leveeLabel, gpaLabel: gpaLabel, decLabel: decLabel, retenueLabel: retenueLabel, libLabel: libLabel,
      controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat,
      verdict: verdict, clause: clauseTxt, actions: actions, message: message, recap: recapLines.join("\n")
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, PLAFOND_RETENUE, ROLE_LABELS, NATURE_LABELS, FORME_LABELS, CONVOC_LABELS, RESERVES_LABELS, LEVEE_LABELS, GARANTIE_LABELS, CLAUSE_LABELS, computeReception, computeDelais, buildRecap, fmtEur, fmtDate, fmtPct, parseDate, num, dec, daysBetween, addDays, addYears };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computeReception(readForm());
      document.getElementById("recOut").textContent = r.recLabel;
      document.getElementById("leveeOut").textContent = r.leveeLabel;
      document.getElementById("gpaOut").textContent = r.gpaLabel;
      document.getElementById("decennaleOut").textContent = r.decLabel;
      document.getElementById("retenueOut").textContent = r.retenueLabel;
      document.getElementById("liberationOut").textContent = r.libLabel;
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
