/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-mention-dechets-devis-travaux";
  var TYPE_LABELS = { construction: "construction de bâtiment", renovation: "rénovation de bâtiment", demolition: "démolition de bâtiment", jardinage: "jardinage", travaux_publics: "travaux publics hors bâtiment", fabrication: "fabrication ou fourniture sans pose sur un bâtiment" };
  var PEMD_LABELS = { non: "non", oui: "oui", inconnu: "je ne sais pas" };
  var STATUT_ENT_LABELS = { morale: "personne morale", physique: "personne physique" };
  var PC_LABELS = { complet: "raison sociale, adresse et type d'installation", partiel: "nom seul ou incomplet", aucun: "non indiqué" };
  var AFF_LABELS = { ligne: "ligne chiffrée à part", inclus_montant: "compris dans une ligne, montant écrit", inclus: "compris dans le prix, sans montant", absent: "rien sur les déchets" };
  var LABEL_SETS = { typeTravaux: TYPE_LABELS, pemd: PEMD_LABELS, statut: STATUT_ENT_LABELS, pointCollecte: PC_LABELS, affichageCout: AFF_LABELS };
  var TYPES_CONCERNES = ["construction", "renovation", "demolition", "jardinage"];
  var AMENDE_MAX = { physique: 300000, morale: 1500000 };
  var DATE_VIGUEUR = "2021-07-01";
  var FLUX = [
    { key: "qPlatre", nom: "plâtre", de: "du plâtre" },
    { key: "qInertes", nom: "fraction minérale", de: "de la fraction minérale" },
    { key: "qBois", nom: "bois", de: "du bois" },
    { key: "qMetal", nom: "métal", de: "du métal" }
  ];
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Champ de l'obligation",
    "Quantité totale estimée",
    "Tri sur le chantier et collecte séparée",
    "Déchets dangereux",
    "Point de collecte",
    "Estimation des coûts",
    "Décomposition du coût",
    "Bordereau de dépôt",
    "Date du devis",
    "Sanction encourue"
  ];
  var DEFAULTS = {
    typeTravaux: "renovation", pemd: "non", statut: "morale", dateDevis: "2026-11-18", pointCollecte: "complet", affichageCout: "ligne",
    qPlatre: "3.2", qInertes: "0.8", qBois: "0.6", qMetal: "0.4", qMelange: "0.5", qDangereux: "0",
    prixTrie: "110", prixMelange: "190", prixDangereux: "0", forfaitTransport: "360", heuresTri: "6", tauxHoraire: "45"
  };
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  function clean(v) { return String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", "."); }
  function dec(v, max) {
    var n = parseFloat(clean(v));
    if (!isFinite(n) || n < 0) n = 0;
    if (n > max) n = max;
    return Math.round(n * 100);
  }
  function kg(v, maxT) {
    var n = parseFloat(clean(v));
    if (!isFinite(n) || n < 0) n = 0;
    if (n > maxT) n = maxT;
    return Math.round(n * 1000);
  }
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
  function fmtT(k) {
    var e = Math.floor(k / 1000);
    var r = k % 1000;
    var s = groupInt(e);
    if (r) { var d = String(1000 + r).slice(1).replace(/0+$/, ""); s += "," + d; }
    return s + " t";
  }
  function pct(part, total) { return total > 0 ? Math.round(part * 100 / total) : 0; }
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
  function pick(set, v, def) { return Object.prototype.hasOwnProperty.call(set, v) ? v : def; }
  function joinFr(list) {
    if (list.length <= 1) return list.join("");
    return list.slice(0, -1).join(", ") + " et " + list[list.length - 1];
  }
  function plural(n, un, plusieurs) { return n + " " + (n > 1 ? plusieurs : un); }
  function normalize(inp) {
    var i = inp || {};
    var o = {};
    o.typeTravaux = pick(TYPE_LABELS, i.typeTravaux, DEFAULTS.typeTravaux);
    o.pemd = pick(PEMD_LABELS, i.pemd, DEFAULTS.pemd);
    o.statut = pick(STATUT_ENT_LABELS, i.statut, DEFAULTS.statut);
    o.pointCollecte = pick(PC_LABELS, i.pointCollecte, DEFAULTS.pointCollecte);
    o.affichageCout = pick(AFF_LABELS, i.affichageCout, DEFAULTS.affichageCout);
    o.date = parseDate(i.dateDevis);
    o.kg = {};
    ["qPlatre", "qInertes", "qBois", "qMetal", "qMelange", "qDangereux"].forEach(function (k) { o.kg[k] = kg(i[k], 100000); });
    o.prixTrieC = dec(i.prixTrie, 100000);
    o.prixMelangeC = dec(i.prixMelange, 100000);
    o.prixDangereuxC = dec(i.prixDangereux, 1000000);
    o.transportC = dec(i.forfaitTransport, 10000000);
    o.heuresC = dec(i.heuresTri, 10000);
    o.tauxC = dec(i.tauxHoraire, 10000);
    return o;
  }
  function computeMention(inp) {
    var o = normalize(inp);
    var r = { input: o };
    var t = o.typeTravaux;
    var typeConcerne = TYPES_CONCERNES.indexOf(t) >= 0;
    var renoDemol = t === "renovation" || t === "demolition";
    var exempt = typeConcerne && renoDemol && o.pemd === "oui";
    var avant = !!(o.date && isoDate(o.date) < DATE_VIGUEUR);
    var inScope = typeConcerne && !exempt && !avant;
    r.inScope = inScope; r.exempt = exempt; r.avant = avant;
    var triKg = 0, flux = [], detail = [];
    FLUX.forEach(function (f) { var q = o.kg[f.key]; triKg += q; if (q > 0) { flux.push(f); detail.push(f.nom + " " + fmtT(q)); } });
    var melKg = o.kg.qMelange, dangKg = o.kg.qDangereux;
    if (melKg > 0) detail.push("mélange " + fmtT(melKg));
    if (dangKg > 0) detail.push("dangereux " + fmtT(dangKg));
    var totalKg = triKg + melKg + dangKg;
    r.triKg = triKg; r.melKg = melKg; r.dangKg = dangKg; r.totalKg = totalKg;
    r.coutTrieC = Math.round(triKg * o.prixTrieC / 1000);
    r.coutMelangeC = Math.round(melKg * o.prixMelangeC / 1000);
    r.coutDangereuxC = Math.round(dangKg * o.prixDangereuxC / 1000);
    r.traitementC = r.coutTrieC + r.coutMelangeC + r.coutDangereuxC;
    r.transportC = o.transportC;
    r.triC = Math.round(o.heuresC * o.tauxC / 100);
    r.totalC = r.traitementC + r.transportC + r.triC;
    r.champLabel = inScope ? "Devis concerné (L541-21-2-3)" : exempt ? "Exempté (diagnostic PEMD)" : (typeConcerne && avant) ? "Devis antérieur au 1er juillet 2021" : "Hors champ (mention facultative)";
    r.quantiteLabel = fmtT(totalKg);
    r.coutLabel = fmtEur(r.totalC) + " HT";
    r.traitementLabel = fmtEur(r.traitementC) + " HT";
    r.transportLabel = fmtEur(r.transportC) + " HT";
    r.triLabel = fmtEur(r.triC) + " HT";
    var detailTxt = detail.length ? " (" + detail.join(", ") + ")" : "";
    var decomp = "traitement " + fmtEur(r.traitementC) + ", transport et contenants " + fmtEur(r.transportC) + ", tri et chargement " + fmtEur(r.triC);
    var c = [];
    var add = function (statut, texte) { c.push({ point: POINTS[c.length], statut: statut, texte: texte }); };
    var soft = function (s) { return inScope ? s : "info"; };

    // 1. Champ
    if (!typeConcerne) add("info", "Hors champ de l'article L541-21-2-3 : un devis de " + TYPE_LABELS[t] + " ne porte ni sur des travaux de bâtiment, ni sur du jardinage. La mention reste conseillée ; le tri des déchets et la responsabilité du producteur s'appliquent (L541-2, L541-21-2).");
    else if (exempt) add("info", "Opération soumise au diagnostic PEMD : la mention n'est pas exigée (IV de l'article L541-21-2-3). Demandez au client la référence du diagnostic.");
    else if (avant) add("info", "Devis antérieur au 1er juillet 2021 : la mention n'était pas encore exigée (décret n° 2020-1817, article 2).");
    else if (renoDemol && o.pemd === "inconnu") add("warn", "Vérifiez si l'opération est soumise au diagnostic PEMD (plus de 1 000 m² de plancher ou bâtiment ayant accueilli des substances dangereuses, article R126-8 du code de la construction). Dans le doute, la mention reste due.");
    else if (!renoDemol && o.pemd === "oui") add("warn", "Le diagnostic PEMD vise la démolition et la rénovation significative : il n'exempte pas un devis de " + TYPE_LABELS[t] + ". La mention reste due.");
    else add("ok", "Devis concerné : " + TYPE_LABELS[t] + " (article L541-21-2-3, I). Les quatre informations de l'article D541-45-1 sont exigées.");

    // 2. Quantité
    if (totalKg > 0) add(soft("ok"), "Quantité totale estimée : " + fmtT(totalKg) + detailTxt + " (article D541-45-1, I, 1°)." + (inScope ? "" : " Mention facultative pour ce devis."));
    else add(soft("bad"), inScope ? "Aucune quantité saisie : le devis doit indiquer une estimation de la quantité totale de déchets (article D541-45-1, I, 1°)." : "Aucune quantité saisie. Mention facultative pour ce devis.");

    // 3. Tri
    var nonDang = triKg + melKg;
    var jard = t === "jardinage" ? " Pour le jardinage, précisez le broyage sur place ou l'évacuation des déchets verts." : "";
    if (totalKg === 0) add(soft("warn"), "Aucun déchet saisi : le tri prévu ne peut pas être décrit." + jard);
    else if (nonDang === 0) add(soft("ok"), "Seuls des déchets dangereux sont prévus : ils suivent leur propre filière." + jard);
    else if (flux.length === 0) add(soft("warn"), "Aucun flux en collecte séparée : tout part en mélange. Le tri à la source des déchets de construction et de démolition est obligatoire (L541-21-2, D543-281)." + jard);
    else if (melKg * 2 > nonDang) add(soft("warn"), "Plus de la moitié des déchets part en mélange (" + pct(melKg, nonDang) + " %). Prévoyez la collecte séparée des flux importants (L541-21-2, D543-281)." + jard);
    else add(soft("ok"), "Collecte séparée " + joinFr(flux.map(function (f) { return f.de; })) + (melKg > 0 ? " ; mélange " + fmtT(melKg) + " (" + pct(melKg, nonDang) + " %)" : "") + " (article D541-45-1, I, 2°)." + jard);

    // 4. Dangereux
    if (dangKg > 0) add("warn", fmtT(dangKg) + " de déchets dangereux : bordereau de suivi électronique (article R541-45, Trackdéchets) et filière autorisée." + (o.prixDangereuxC === 0 ? " Prix de traitement à 0 € : à vérifier." : "") + " Pour l'amiante, procédure à part.");
    else add("info", "Aucun déchet dangereux prévu : écrivez-le, et prévoyez au devis la découverte de déchets dangereux non identifiés, dont l'amiante.");

    // 5. Point de collecte
    if (o.pointCollecte === "complet") add(soft("ok"), "Point de collecte identifié par sa raison sociale, son adresse et son type d'installation (article D541-45-1, I, 3°).");
    else if (o.pointCollecte === "partiel") add(soft("warn"), "Point de collecte incomplet : il faut la raison sociale, l'adresse et le type d'installation (article D541-45-1, I, 3°).");
    else add(soft("bad"), "Aucun point de collecte : le devis doit nommer le ou les points où les déchets seront déposés (article L541-21-2-3, I, et D541-45-1, I, 3°).");

    // 6. Coûts
    var a = o.affichageCout;
    if (a === "absent") add(soft("bad"), "Aucun coût des déchets dans le devis : une estimation des coûts est exigée (article D541-45-1, I, 4°). Estimation : " + r.coutLabel + ".");
    else if (a === "inclus") add(soft("warn"), "Coût « compris » sans montant : écrivez le montant estimé, " + r.coutLabel + ", dans la ligne concernée (article D541-45-1, I, 4°).");
    else if (r.totalC === 0) add(soft("warn"), "Coût estimé à 0 € : vérifiez vos prix et vos quantités avant d'écrire la ligne.");
    else add(soft("ok"), (a === "ligne" ? "Coût estimé sur une ligne chiffrée : " : "Coût estimé écrit dans une ligne du devis : ") + r.coutLabel + " (article D541-45-1, I, 4°).");

    // 7. Décomposition
    add("info", "Coût estimé " + r.coutLabel + " : " + decomp + ". Traitement : flux triés " + fmtEur(r.coutTrieC) + ", mélange " + fmtEur(r.coutMelangeC) + ", dangereux " + fmtEur(r.coutDangereuxC) + ". Les prix sont les vôtres.");

    // 8. Bordereau
    add("info", "Après le chantier, demandez à l'installation le bordereau de dépôt gratuit, au nom du client ; conservez-le et transmettez-le sur demande (article L541-21-2-3, II, et D541-45-1, II).");

    // 9. Date
    if (!o.date) add("warn", "Date du devis absente ou invalide : datez le devis.");
    else if (avant) add("info", "Devis du " + fmtDate(o.date) + ", antérieur au 1er juillet 2021.");
    else add("ok", "Devis du " + fmtDate(o.date) + " : obligation en vigueur depuis le 1er juillet 2021.");

    // 10. Sanction
    if (inScope) add("info", "Un devis sans la mention expose à une amende administrative jusqu'à " + fmtEur(AMENDE_MAX[o.statut]) + " pour une " + STATUT_ENT_LABELS[o.statut] + " (article L541-21-2-3, III ; " + (o.statut === "morale" ? "3 000 € pour une personne physique" : "15 000 € pour une personne morale") + ").");
    else add("info", "Aucune amende au titre de l'article L541-21-2-3 pour ce devis (hors champ, exempté ou antérieur au 1er juillet 2021).");

    r.controles = c;
    r.nbOk = c.filter(function (x) { return x.statut === "ok"; }).length;
    r.nbWarn = c.filter(function (x) { return x.statut === "warn"; }).length;
    r.nbBad = c.filter(function (x) { return x.statut === "bad"; }).length;
    r.nbInfo = c.filter(function (x) { return x.statut === "info"; }).length;
    r.etat = r.nbBad ? "bad" : r.nbWarn ? "warn" : "ok";
    r.compteursLabel = r.nbBad + " / " + r.nbWarn;
    var resume = "Coût estimé : " + r.coutLabel + " pour " + fmtT(totalKg) + ".";
    if (r.nbBad) r.verdict = plural(r.nbBad, "point bloquant", "points bloquants") + " : la mention déchets est incomplète. Complétez-la avant d'envoyer le devis. " + resume;
    else if (r.nbWarn) r.verdict = "Aucun point bloquant, " + r.nbWarn + " à compléter. " + resume;
    else if (inScope) r.verdict = "Mention déchets complète : les quatre informations du décret sont présentes. " + resume;
    else r.verdict = "Mention non exigée par l'article L541-21-2-3 pour ce devis. " + resume;

    // Ligne du devis (8 lignes)
    var l = [];
    l.push(inScope ? "Gestion des déchets de chantier (article L541-21-2-3 du code de l'environnement)" : "Gestion des déchets (mention facultative pour ce devis)");
    l.push("Quantité totale estimée : " + (totalKg > 0 ? fmtT(totalKg) + detailTxt + "." : "[à compléter]."));
    l.push((flux.length ? "Tri sur le chantier : collecte séparée " + joinFr(flux.map(function (f) { return f.de; })) + (melKg > 0 ? " ; le reste en benne de mélange." : ".") : "Tri sur le chantier : [flux en collecte séparée à préciser].") + (t === "jardinage" ? " Déchets verts : broyage sur place ou évacuation, à préciser." : ""));
    l.push(dangKg > 0 ? "Déchets dangereux : " + fmtT(dangKg) + " prévues, évacuées avec un bordereau de suivi électronique vers une filière autorisée." : "Déchets dangereux : aucun prévu. Toute découverte de déchets dangereux non identifiés, dont l'amiante, suspend les travaux concernés et fera l'objet d'un devis séparé.");
    l.push("Point de collecte : [raison sociale], [adresse], [type d'installation].");
    l.push("Coût estimé de l'enlèvement et de la gestion" + (a === "inclus" || a === "inclus_montant" ? ", compris dans le prix des travaux : " : " : ") + r.coutLabel + " (" + decomp + ").");
    l.push("Les quantités et les coûts sont des estimations. Ils pourront être ajustés en fin de chantier au vu des bordereaux de dépôt.");
    l.push("Les bordereaux de dépôt sont conservés et transmis au client sur simple demande.");
    r.clause = l.join("\n");

    // Actions
    var act = [];
    if (exempt) act.push("Demandez au client la référence du diagnostic PEMD et la façon dont les déchets de votre lot y sont traités.");
    if (inScope && renoDemol && o.pemd === "inconnu") act.push("Demandez au client si l'opération est soumise au diagnostic PEMD.");
    if (totalKg === 0) act.push("Estimez les quantités à partir des bordereaux de vos chantiers comparables ou du métré de la dépose.");
    if (nonDang > 0 && (flux.length === 0 || melKg * 2 > nonDang)) act.push("Prévoyez des contenants séparés pour les flux importants : plâtre, bois, métal, gravats.");
    if (dangKg > 0) act.push("Organisez avant le chantier le bordereau de suivi électronique des déchets dangereux (Trackdéchets) et la filière d'élimination.");
    if (o.pointCollecte !== "complet") act.push("Demandez à votre collecteur la raison sociale, l'adresse et le type de l'installation de dépôt, et écrivez-les au devis.");
    if (a === "inclus" || a === "absent") act.push("Écrivez le montant estimé de " + r.coutLabel + " dans le devis, sur une ligne à part ou dans la ligne de dépose.");
    act.push("Vérifiez vos prix de traitement et de rotation auprès de votre collecteur : l'outil ne connaît aucun tarif.");
    act.push("Collez la ligne déchets dans votre devis, en remplaçant les crochets par le nom, l'adresse et le type du point de collecte.");
    act.push("En fin de chantier, demandez les bordereaux de dépôt au nom du client et rangez-les avec le devis signé.");
    r.actions = act;

    // Message
    var corps = inScope
      ? "Notre devis comporte une ligne « Gestion des déchets de chantier » de " + r.coutLabel + ". Elle est prévue par l'article L541-21-2-3 du code de l'environnement : nous y indiquons la quantité estimée (" + fmtT(totalKg) + "), le tri prévu sur place, le point de collecte et le coût estimé."
      : "Notre devis précise la gestion des déchets du chantier, même si la loi ne l'exige pas pour ces travaux : quantité estimée (" + fmtT(totalKg) + "), tri prévu, point de collecte et coût estimé de " + r.coutLabel + ".";
    r.message = [
      "Objet : Gestion des déchets de votre chantier",
      "",
      "Bonjour,",
      "",
      corps,
      "",
      "Ce montant couvre le traitement, le transport et les contenants, et le temps de tri. Il sera ajusté en fin de chantier au vu des bordereaux de dépôt, que nous vous transmettrons sur simple demande.",
      "",
      "Bien cordialement,"
    ].join("\n");

    r.recap = [
      "Vérification de la mention déchets (devis de travaux)",
      "Travaux : " + TYPE_LABELS[t] + " ; diagnostic PEMD : " + PEMD_LABELS[o.pemd] + " ; entreprise : " + STATUT_ENT_LABELS[o.statut],
      "Champ : " + r.champLabel,
      "Quantité totale estimée : " + fmtT(totalKg) + detailTxt,
      "Collecte séparée : " + (flux.length ? flux.map(function (f) { return f.nom; }).join(", ") : "aucune") + " ; mélange : " + fmtT(melKg) + " ; dangereux : " + fmtT(dangKg),
      "Point de collecte : " + PC_LABELS[o.pointCollecte],
      "Coût : " + AFF_LABELS[a] + " ; estimé : " + r.coutLabel,
      "Décomposition : " + decomp,
      "Date du devis : " + (o.date ? fmtDate(o.date) : "non saisie"),
      "Verdict : " + r.verdict,
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");
    return r;
  }
  function buildRecap(inp) { return computeMention(inp).recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, LABEL_SETS, FLUX, TYPE_LABELS, PEMD_LABELS, STATUT_ENT_LABELS, PC_LABELS, AFF_LABELS, TYPES_CONCERNES, AMENDE_MAX, DATE_VIGUEUR, computeMention, normalize, buildRecap, fmtEur, fmtT, fmtDate, parseDate, isoDate, dec, kg, joinFr };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var read = function () {
      var v = {};
      Object.keys(DEFAULTS).forEach(function (k) { v[k] = document.getElementById(k).value; });
      return v;
    };
    var render = function () {
      var r = computeMention(read());
      document.getElementById("champOut").textContent = r.champLabel;
      document.getElementById("quantiteOut").textContent = r.quantiteLabel;
      document.getElementById("coutOut").textContent = r.coutLabel;
      document.getElementById("traitementOut").textContent = r.traitementLabel;
      document.getElementById("transportOut").textContent = r.transportLabel;
      document.getElementById("triOut").textContent = r.triLabel;
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
