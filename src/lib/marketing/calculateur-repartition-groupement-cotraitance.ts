/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "calculateur-repartition-groupement-cotraitance";
  var ROLE_LABELS = { mandataire: "mandataire du groupement", cotraitant: "membre cotraitant", client: "client qui reçoit le devis" };
  var FORME_LABELS = { conjoint: "groupement conjoint", mandataireSolidaire: "groupement conjoint, mandataire solidaire", solidaire: "groupement solidaire", nonPrecise: "forme pas précisée" };
  var ECRITE_LABELS = { devis: "écrite dans le devis accepté", convention: "écrite seulement dans la convention", non: "écrite nulle part" };
  var COMMERCANTS_LABELS = { oui: "sociétés commerciales ou commerçants", non: "artisans ou professions libérales", mixte: "mélange de commerçants et de non-commerçants" };
  var POUVOIR_LABELS = { ecrit: "pouvoir écrit de chaque membre", oral: "accord oral seulement", aucun: "aucun pouvoir" };
  var RELATION_LABELS = { cotraitance: "chaque membre est partie au devis", soustraitance: "un membre ne traite qu'avec le mandataire" };
  var REPARTITION_LABELS = { parMembre: "prestations et montant de chaque membre", totalSeul: "un total sans répartition" };
  var CLE_LABELS = { prorata: "au prorata des parts", egale: "parts égales", nonPrevue: "rien de prévu" };
  var PAIEMENT_LABELS = { separes: "le client paie chaque membre", compteMandataire: "le client paie tout au mandataire" };
  var CONVENTION_LABELS = { signee: "convention signée", projet: "convention en projet", aucune: "aucune convention" };
  var DEFAILLANT_LABELS = { aucun: "aucun scénario", A: "membre A (mandataire)", B: "membre B", C: "membre C", D: "membre D" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var MEMBRES = ["A", "B", "C", "D"];
  var POINTS = [
    "Forme du groupement", "Écrit opposable au client", "Présomption de solidarité", "Mandataire et pouvoirs",
    "Répartition dans le devis", "Cohérence des montants", "Frais communs", "Rémunération du mandataire",
    "Circuit de paiement", "Convention de groupement", "Cotraitant ou sous-traitant", "Défaillance d'un membre"
  ];
  var DEFAULTS = {
    role: "mandataire",
    forme: "mandataireSolidaire",
    formeEcrite: "devis",
    membresCommercants: "oui",
    pouvoir: "ecrit",
    relation: "cotraitance",
    montantTotal: 88000,
    repartitionDevis: "parMembre",
    partA: 48000,
    partB: 22000,
    partC: 18000,
    partD: 0,
    fraisCommuns: 2400,
    cleFrais: "prorata",
    remunMandataire: 2,
    paiement: "compteMandataire",
    convention: "projet",
    defaillant: "B",
    montantNonExecute: 9000
  };

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
  function nomMembre(k) { return k === "A" ? "membre A (mandataire)" : "membre " + k; }

  // Répartit un montant entier selon des poids (méthode du plus fort reste) : la somme est exacte.
  function splitInt(total, weights) {
    var n = weights.length;
    var res = [];
    var sw = 0, i;
    for (i = 0; i < n; i++) sw += weights[i];
    if (total <= 0 || sw <= 0) { for (i = 0; i < n; i++) res.push(0); return res; }
    var rest = total, fr = [];
    for (i = 0; i < n; i++) {
      var exact = total * weights[i] / sw;
      var f = Math.floor(exact);
      res.push(f);
      rest -= f;
      fr.push({ i: i, r: exact - f, w: weights[i] });
    }
    fr.sort(function (a, b) { return (b.r - a.r) || (b.w - a.w) || (a.i - b.i); });
    for (var j = 0; j < rest; j++) res[fr[j % n].i] += 1;
    return res;
  }

  function formeFaceClient(forme, formeEcrite, membresCommercants) {
    if (forme !== "nonPrecise" && formeEcrite === "devis") return forme;
    return membresCommercants === "non" ? "conjoint" : "solidaire";
  }

  function computeRepartition(parts, frais, cle, taux) {
    var actifs = parts.map(function (p, i) { return i === 0 || p > 0; });
    var somme = parts.reduce(function (a, b) { return a + b; }, 0);
    var n = actifs.filter(Boolean).length;
    var poidsFrais = parts.map(function (p, i) { return actifs[i] ? (cle === "egale" ? 1 : p) : 0; });
    var fraisPart = splitInt(frais, poidsFrais);
    var remun = parts.map(function (p, i) { return i === 0 ? 0 : Math.round(p * taux / 100); });
    var remunTotal = remun.reduce(function (a, b) { return a + b; }, 0);
    var net = parts.map(function (p, i) { return p - fraisPart[i] - remun[i] + (i === 0 ? remunTotal : 0); });
    var pct = parts.map(function (p) { return somme > 0 ? p / somme * 100 : 0; });
    return { actifs: actifs, somme: somme, n: n, fraisPart: fraisPart, remun: remun, remunTotal: remunTotal, net: net, pct: pct };
  }

  function computeExposition(parts, actifs, formeClient, defaillant, montant) {
    var expo = [0, 0, 0, 0], perte = [0, 0, 0, 0];
    var k = MEMBRES.indexOf(defaillant);
    if (k < 0 || !actifs[k] || parts[k] <= 0) return { k: -1, m: 0, plafonne: false, expo: expo, perte: perte };
    var m = Math.min(montant, parts[k]);
    var exposes = [false, false, false, false];
    for (var i = 0; i < 4; i++) {
      if (i === k || !actifs[i]) continue;
      if (formeClient === "solidaire") exposes[i] = true;
      else if (formeClient === "mandataireSolidaire" && i === 0) exposes[i] = true;
    }
    for (i = 0; i < 4; i++) if (exposes[i]) expo[i] = m;
    var poids = parts.map(function (p, j) { return exposes[j] ? Math.max(p, 0) : 0; });
    var sp = poids.reduce(function (a, b) { return a + b; }, 0);
    if (sp === 0) poids = exposes.map(function (e) { return e ? 1 : 0; });
    var nbExp = exposes.filter(Boolean).length;
    perte = nbExp > 0 ? splitInt(m, poids) : perte;
    return { k: k, m: m, plafonne: montant > parts[k], expo: expo, perte: perte };
  }

  function computeGroupement(input) {
    var i = input || {};
    var role = pick(i.role, ROLE_LABELS, DEFAULTS.role);
    var forme = pick(i.forme, FORME_LABELS, DEFAULTS.forme);
    var formeEcrite = pick(i.formeEcrite, ECRITE_LABELS, DEFAULTS.formeEcrite);
    var membresCommercants = pick(i.membresCommercants, COMMERCANTS_LABELS, DEFAULTS.membresCommercants);
    var pouvoir = pick(i.pouvoir, POUVOIR_LABELS, DEFAULTS.pouvoir);
    var relation = pick(i.relation, RELATION_LABELS, DEFAULTS.relation);
    var repartitionDevis = pick(i.repartitionDevis, REPARTITION_LABELS, DEFAULTS.repartitionDevis);
    var cleFrais = pick(i.cleFrais, CLE_LABELS, DEFAULTS.cleFrais);
    var paiement = pick(i.paiement, PAIEMENT_LABELS, DEFAULTS.paiement);
    var convention = pick(i.convention, CONVENTION_LABELS, DEFAULTS.convention);
    var defaillant = pick(i.defaillant, DEFAILLANT_LABELS, DEFAULTS.defaillant);
    var montantTotal = num(i.montantTotal, 0, 1000000000, 0);
    var parts = [num(i.partA, 0, 1000000000, 0), num(i.partB, 0, 1000000000, 0), num(i.partC, 0, 1000000000, 0), num(i.partD, 0, 1000000000, 0)];
    var frais = num(i.fraisCommuns, 0, 1000000000, 0);
    var taux = dec(i.remunMandataire, 0, 20, 0);
    var montantNonExecute = num(i.montantNonExecute, 0, 1000000000, 0);

    var rep = computeRepartition(parts, frais, cleFrais, taux);
    var formeClient = formeFaceClient(forme, formeEcrite, membresCommercants);
    var ex = computeExposition(parts, rep.actifs, formeClient, defaillant, montantNonExecute);
    var ecart = montantTotal - rep.somme;
    var partEgale = rep.n > 0 ? Math.round(montantTotal / rep.n) : 0;
    var expoMax = Math.max.apply(null, ex.expo);
    var conjointes = formeClient === "conjoint" || formeClient === "mandataireSolidaire";
    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    // 1
    if (forme === "nonPrecise") {
      if (membresCommercants === "non") add(POINTS[0], "warn", "Forme non précisée. Entre membres qui ne sont pas commerçants, la solidarité ne se présume pas (article 1310 du code civil) : chacun ne doit que sa part (article 1309). Écrivez-le quand même, le client ne le sait pas.");
      else add(POINTS[0], "bad", "Forme non précisée entre commerçants : le juge présume en principe la solidarité passive en matière commerciale. Chaque membre risque de devoir tout le devis au client. Choisissez une forme et écrivez-la dans le devis.");
    } else if (forme === "conjoint") add(POINTS[0], "ok", "Groupement conjoint : chaque membre s'engage à exécuter ses propres prestations (vocabulaire de l'article R2142-20 du code de la commande publique, repris dans les marchés privés).");
    else if (forme === "mandataireSolidaire") add(POINTS[0], "ok", "Groupement conjoint avec mandataire solidaire : chaque membre répond de ses prestations, et le mandataire répond en plus de chacun envers le client (schéma de l'article R2142-24 du code de la commande publique).");
    else add(POINTS[0], "ok", "Groupement solidaire : chaque membre est engagé pour la totalité envers le client (article R2142-20, 2°, du code de la commande publique ; article 1313 du code civil pour l'effet).");
    // 2
    if (formeEcrite === "devis") add(POINTS[1], "ok", "La forme figure dans le devis accepté : le client la connaît et l'a acceptée avec le prix.");
    else if (formeEcrite === "convention") add(POINTS[1], "warn", "Écrite seulement dans la convention entre membres : le client n'y est pas partie et elle ne l'engage pas (article 1199 du code civil). Face à lui, c'est comme si rien n'était écrit. Reprenez la forme dans le devis.");
    else add(POINTS[1], "bad", "La forme n'est écrite nulle part : ni le client ni les membres ne peuvent prouver ce qui a été convenu. Écrivez-la dans le devis avant acceptation.");
    // 3
    if (forme !== "nonPrecise" && formeEcrite === "devis") add(POINTS[2], "ok", "La forme est stipulée dans le devis : c'est elle qui joue, et non une présomption. Une solidarité conventionnelle doit être écrite (article 1310 du code civil) ; son exclusion entre commerçants aussi.");
    else if (membresCommercants === "non") add(POINTS[2], "info", "Membres non commerçants : sans texte ni clause, pas de solidarité (article 1310 du code civil). Chaque membre ne doit que sa part, et sans répartition écrite la division se fait par parts égales (article 1309).");
    else if (membresCommercants === "mixte") add(POINTS[2], "warn", "Groupement mixte : la présomption de solidarité passive entre commerçants peut viser certains membres et pas d'autres. L'outil retient le cas le plus lourd (solidaire). Écrivez la forme dans le devis.");
    else add(POINTS[2], "warn", "Entre commerçants, la solidarité passive est présumée par la jurisprudence ; seule la solidarité active ne l'est pas (Cass. com., 26 septembre 2018, n° 16-28.133). Face au client, l'outil retient donc un groupement solidaire.");
    // 4
    if (pouvoir === "ecrit") add(POINTS[3], "ok", "Le mandataire agit au nom des membres (article 1984 du code civil) dans les limites de son pouvoir (article 1989). Le pouvoir écrit permet de le montrer au client.");
    else if (pouvoir === "oral") add(POINTS[3], "warn", "Le mandat peut être verbal ou tacite (article 1985 du code civil), mais sa preuve suit le droit commun. Faites signer un pouvoir par chaque membre avant d'envoyer le devis.");
    else add(POINTS[3], "bad", "Sans pouvoir, le mandataire n'engage que lui : les autres membres ne sont pas liés par le devis qu'il signe (articles 1984 et 1989 du code civil). Faites signer le devis par chaque membre ou obtenez un pouvoir écrit.");
    // 5
    if (repartitionDevis === "parMembre") add(POINTS[4], "ok", "Le devis dit qui fait quoi et pour combien : c'est la base de la responsabilité de chacun et du paiement.");
    else if (conjointes) add(POINTS[4], "bad", "Un total sans répartition dans un groupement conjoint : faute de répartition prévue par le contrat, la dette se divise par parts égales (article 1309 du code civil), soit environ " + fmtEur(partEgale) + " par membre. Détaillez les prestations de chacun.");
    else add(POINTS[4], "warn", "Un total sans répartition : face au client, chacun doit le tout, mais entre membres la contribution se fait « chacun pour sa part » (article 1317 du code civil). Sans répartition écrite, ces parts sont à prouver.");
    // 6
    if (montantTotal === 0) add(POINTS[5], "warn", "Total du devis nul : indiquez le montant accepté par le client.");
    else if (ecart === 0) add(POINTS[5], "ok", "La somme des parts (" + fmtEur(rep.somme) + ") correspond au total du devis.");
    else add(POINTS[5], "bad", "La somme des parts (" + fmtEur(rep.somme) + ") ne correspond pas au total du devis (" + fmtEur(montantTotal) + ") : écart de " + fmtEur(ecart) + ". Une part non attribuée, ou attribuée deux fois, se retrouvera dans un litige.");
    // 7
    var fraisTxt = MEMBRES.map(function (m, j) { return rep.actifs[j] ? m + " " + fmtEur(rep.fraisPart[j]) : null; }).filter(Boolean).join(", ");
    if (frais === 0) add(POINTS[6], "info", "Aucun frais commun déclaré. Vérifiez qu'aucune dépense partagée (plans, coordination, benne, nettoyage) n'a été oubliée.");
    else if (cleFrais === "nonPrevue") add(POINTS[6], "warn", fmtEur(frais) + " de frais communs sans clé de répartition. L'outil montre le prorata des parts à titre de repère (" + fraisTxt + "). Écrivez la clé dans la convention.");
    else add(POINTS[6], "ok", fmtEur(frais) + " de frais communs répartis " + CLE_LABELS[cleFrais] + " : " + fraisTxt + ".");
    // 8
    if (taux === 0 && forme === "mandataireSolidaire") add(POINTS[7], "warn", "Le mandataire porte la solidarité de tous sans rémunération. Prévoyez une rémunération de mandataire ou une garantie des autres membres dans la convention.");
    else if (taux === 0) add(POINTS[7], "info", "Pas de rémunération du mandataire : la coordination est à sa charge. À écrire dans la convention pour éviter la discussion plus tard.");
    else add(POINTS[7], "info", fmtPct(taux) + " % des parts des autres membres, soit " + fmtEur(rep.remunTotal) + " pour le mandataire. Un mandat rémunéré est apprécié plus rigoureusement en cas de faute de gestion (article 1992 du code civil).");
    // 9
    if (paiement === "separes") add(POINTS[8], "ok", "Chaque membre reçoit le paiement de sa part : aucun membre ne détient l'argent des autres.");
    else if (formeClient === "solidaire") add(POINTS[8], "info", "Le mandataire encaisse pour tous : il doit rendre compte et reverser ce qu'il a reçu (article 1993 du code civil). Prévoyez le délai de reversement dans la convention.");
    else add(POINTS[8], "warn", "Le client paie tout au mandataire alors que chacun ne répond que de sa part : les autres membres portent le risque d'un retard ou d'une défaillance du mandataire. Il doit rendre compte et reverser (article 1993 du code civil) ; fixez un délai de reversement, ou faites payer chaque membre.");
    // 10
    if (convention === "signee") add(POINTS[9], "ok", "Convention signée : frais communs, rémunération, reversement et défaillance sont réglés entre membres.");
    else if (convention === "projet") add(POINTS[9], "warn", "Convention en projet : signez-la avant l'acceptation du devis. Après, chaque membre négocie avec un chantier déjà engagé.");
    else add(POINTS[9], "bad", "Aucune convention : rien ne règle entre vous la clé des frais, la rémunération du mandataire, le reversement ni la défaillance d'un membre. Rédigez-la avant d'envoyer le devis.");
    // 11
    if (relation === "cotraitance") add(POINTS[10], "ok", "Chaque membre est partie au devis : ce sont des cotraitants, chacun lié directement au client.");
    else add(POINTS[10], "bad", "Un membre qui ne traite qu'avec le mandataire n'est pas cotraitant : il est sous-traitant au sens de la loi n° 75-1334 du 31 décembre 1975 (acceptation et agrément par le client, caution ou délégation). Faites-le entrer au devis, ou appliquez cette loi.");
    // 12
    if (ex.k < 0) add(POINTS[11], "info", defaillant === "aucun" ? "Aucun scénario de défaillance choisi." : "Le membre choisi n'a pas de part : aucun scénario calculé.");
    else {
      var kNom = nomMembre(MEMBRES[ex.k]);
      var exposesTxt = MEMBRES.map(function (m, j) { return ex.expo[j] > 0 ? nomMembre(m) + " " + fmtEur(ex.expo[j]) : null; }).filter(Boolean);
      var base = "Si le " + kNom + " fait défaut sur " + fmtEur(ex.m) + (ex.plafonne ? " (montant plafonné à sa part)" : "") + ", ";
      if (exposesTxt.length === 0) add(POINTS[11], "info", base + "aucun autre membre n'en répond envers le client : c'est le client qui porte ce risque face au membre défaillant (article 1309 du code civil).");
      else add(POINTS[11], "info", base + "le client peut réclamer : " + exposesTxt.join(", ") + ". Le membre qui paie se retourne ensuite contre le défaillant, qui en supporte seul la charge définitive (articles 1317 à 1319 du code civil).");
    }

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) { if (c.statut === "ok") nbOk++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");
    var badPoints = controles.filter(function (c) { return c.statut === "bad"; }).map(function (c) { return c.point.toLowerCase(); });
    var formeLabel = FORME_LABELS[formeClient].charAt(0).toUpperCase() + FORME_LABELS[formeClient].slice(1);
    var resume = "Face au client : " + FORME_LABELS[formeClient] + ", " + plural(rep.n, "membre", "membres") + ", " + fmtEur(montantTotal) + ". ";
    if (ex.k < 0) resume += "Aucun scénario de défaillance.";
    else if (expoMax === 0) resume += "Si le " + nomMembre(MEMBRES[ex.k]) + " fait défaut sur " + fmtEur(ex.m) + ", aucun autre membre n'en répond envers le client.";
    else resume += "Si le " + nomMembre(MEMBRES[ex.k]) + " fait défaut sur " + fmtEur(ex.m) + ", un autre membre peut devoir jusqu'à " + fmtEur(expoMax) + " au client.";
    var verdict;
    if (nbBad > 0) verdict = plural(nbBad, "point bloquant", "points bloquants") + " : " + badPoints.join(", ") + ". " + (role === "client" ? "À faire préciser avant d'accepter le devis." : "À régler avant d'envoyer le devis.");
    else verdict = "Aucun point bloquant, " + (nbWarn > 0 ? nbWarn + " à compléter. " : "rien à compléter. ") + resume;

    var formeClause = forme === "nonPrecise" ? "[conjoint / conjoint avec mandataire solidaire / solidaire]" : (forme === "conjoint" ? "conjoint" : (forme === "solidaire" ? "solidaire" : "conjoint avec mandataire solidaire"));
    var membresClause = MEMBRES.filter(function (m, j) { return rep.actifs[j]; }).map(function (m) { return m === "A" ? "[membre A], mandataire" : "[membre " + m + "]"; }).join(" ; ");
    var art2 = forme === "solidaire" ? "2. Les membres sont tenus solidairement envers le client de l'exécution de l'ensemble des prestations du devis (article 1313 du code civil)."
      : (forme === "conjoint" ? "2. Chaque membre exécute les prestations désignées à son nom dans le détail du devis et n'est tenu que de celles-ci."
      : (forme === "mandataireSolidaire" ? "2. Chaque membre exécute les prestations désignées à son nom dans le détail du devis. Le mandataire est solidaire de chaque membre pour l'exécution de ses obligations envers le client."
      : "2. [Préciser : chaque membre n'est tenu que de ses prestations / le mandataire est solidaire de chaque membre / les membres sont tenus solidairement.]"));
    var art4 = paiement === "separes" ? "4. Le client règle chaque membre, sur facture de ses propres prestations." : "4. Le mandataire est habilité à recevoir les paiements au nom des membres, sur le compte désigné ; il reverse à chacun sa part dans les [10] jours de l'encaissement.";
    var art5 = forme === "solidaire" ? "5. La solidarité ne s'étend pas aux prestations ajoutées par avenant sans l'accord écrit de tous les membres." : "5. Hors le cas prévu à l'article 2, aucune solidarité n'est stipulée entre les membres (article 1310 du code civil).";
    var clause = [
      "Article [X] : Groupement d'entreprises",
      "1. Le présent devis est présenté par un groupement " + formeClause + " composé de : " + membresClause + ".",
      art2,
      "3. Le mandataire représente les membres auprès du client et coordonne leurs prestations. Il dispose d'un pouvoir écrit de chacun d'eux, joint au devis.",
      art4,
      art5,
      "6. La répartition des frais communs, la rémunération du mandataire et les suites de la défaillance d'un membre relèvent de la convention de groupement, qui ne modifie pas les engagements pris envers le client."
    ].join("\n");

    var actionMap = {
      "Forme du groupement": "Choisissez la forme du groupement (conjoint, conjoint avec mandataire solidaire, solidaire) et écrivez-la dans le devis.",
      "Écrit opposable au client": "Reprenez la forme du groupement dans le devis lui-même, pas seulement dans la convention (clause ci-dessus).",
      "Présomption de solidarité": "Écrivez dans le devis si la solidarité est stipulée ou exclue, pour ne pas laisser jouer la présomption entre commerçants.",
      "Mandataire et pouvoirs": "Faites signer un pouvoir écrit au mandataire par chaque membre, ou faites signer le devis par tous.",
      "Répartition dans le devis": "Détaillez dans le devis les prestations et le montant de chaque membre.",
      "Cohérence des montants": montantTotal === 0 ? "Indiquez le total du devis accepté." : "Reprenez les parts pour que leur somme égale le total du devis (" + fmtEur(montantTotal) + ").",
      "Frais communs": "Écrivez la clé de répartition des frais communs dans la convention.",
      "Rémunération du mandataire": "Prévoyez la rémunération du mandataire ou une contre-garantie des autres membres.",
      "Circuit de paiement": "Fixez le délai de reversement du mandataire, ou faites payer chaque membre directement.",
      "Convention de groupement": convention === "projet" ? "Signez la convention de groupement avant l'acceptation du devis." : "Rédigez et signez une convention de groupement avant d'envoyer le devis.",
      "Cotraitant ou sous-traitant": "Faites entrer ce membre au devis comme cotraitant, ou traitez-le en sous-traitant selon la loi de 1975."
    };
    if (role === "client") {
      actionMap["Forme du groupement"] = "Demandez au mandataire la forme du groupement, écrite dans le devis.";
      actionMap["Écrit opposable au client"] = "Demandez que la forme du groupement figure dans le devis que vous acceptez.";
      actionMap["Présomption de solidarité"] = "Demandez une clause claire sur la solidarité plutôt que de compter sur une présomption.";
      actionMap["Mandataire et pouvoirs"] = "Demandez les pouvoirs écrits du mandataire, ou la signature de chaque membre.";
      actionMap["Répartition dans le devis"] = "Demandez le détail des prestations et du montant de chaque membre.";
      actionMap["Cohérence des montants"] = "Faites corriger le devis : la somme des parts doit égaler le total.";
      actionMap["Circuit de paiement"] = "Demandez qui vous devez payer, sur quel compte, et à quel titre.";
      actionMap["Convention de groupement"] = "Demandez confirmation que la convention de groupement est signée entre les membres.";
      actionMap["Cotraitant ou sous-traitant"] = "Demandez si ce membre est cotraitant ou sous-traitant ; s'il est sous-traitant, il doit vous être présenté pour acceptation.";
    }
    var actions = [];
    controles.forEach(function (c) { if (c.statut === "bad") actions.push(actionMap[c.point]); });
    controles.forEach(function (c) { if (c.statut === "warn") actions.push(actionMap[c.point]); });
    actions.push(role === "client" ? "Gardez avec le devis accepté la liste des membres, leurs parts et le nom du mandataire." : "Gardez avec le devis la convention, les pouvoirs et le détail des parts de chaque membre.");

    var repLignes = MEMBRES.map(function (m, j) { return rep.actifs[j] ? "- " + nomMembre(m) + " : " + fmtEur(parts[j]) + " (" + fmtPct(rep.pct[j]) + " %)" : null; }).filter(Boolean);
    var lines;
    if (role === "mandataire") {
      lines = ["Objet : groupement pour le devis [référence] : forme, parts et convention", "", "Bonjour,", "", "Voici la répartition que je propose pour le devis [référence], d'un total de " + fmtEur(montantTotal) + " :"].concat(repLignes);
      lines.push("", "Forme proposée : " + FORME_LABELS[forme] + ". Frais communs : " + fmtEur(frais) + ", " + CLE_LABELS[cleFrais] + ". Rémunération du mandataire : " + fmtPct(taux) + " % des parts des autres membres.");
      lines.push("", "Merci de me retourner le pouvoir signé et vos remarques sur la convention avant l'envoi du devis au client.", "", "Cordialement");
    } else if (role === "cotraitant") {
      lines = ["Objet : groupement pour le devis [référence] : points à confirmer avant l'envoi", "", "Bonjour,", "", "Avant de vous donner mon pouvoir pour le devis [référence], merci de confirmer par écrit :", "- la forme du groupement retenue et sa mention dans le devis ;", "- le détail de mes prestations et leur montant ;", "- le circuit de paiement et le délai de reversement ;", "- la clé des frais communs et votre rémunération de mandataire.", "", "Je signerai la convention de groupement une fois ces points fixés.", "", "Cordialement"];
    } else {
      lines = ["Objet : devis [référence] présenté par un groupement : précisions avant acceptation", "", "Bonjour,", "", "Avant d'accepter votre devis de " + fmtEur(montantTotal) + ", merci de nous préciser par écrit :", "- la forme du groupement et la solidarité éventuelle entre ses membres ;", "- les prestations et le montant de chaque membre ;", "- les pouvoirs du mandataire ;", "- qui nous devons payer, et sur quel compte.", "", "Ces éléments seront repris dans le devis accepté.", "", "Cordialement"];
    }
    var message = lines.join("\n");

    var repartitionRows = MEMBRES.map(function (m, j) {
      return { membre: nomMembre(m), actif: rep.actifs[j], part: parts[j], pct: rep.pct[j], frais: rep.fraisPart[j], remun: j === 0 ? rep.remunTotal : -rep.remun[j], net: rep.net[j], expo: ex.expo[j], perte: ex.perte[j], defaillant: j === ex.k };
    }).filter(function (r) { return r.actif; });

    var ecartLabel = ecart === 0 ? "Aucun" : fmtEur(ecart);
    var expoLabel = ex.k < 0 ? "Aucun scénario" : fmtEur(expoMax);
    var recapLines = [
      "Calculateur de répartition d'un groupement de cotraitants (QuoteBuilder)",
      "Position : " + ROLE_LABELS[role],
      "Forme : " + FORME_LABELS[forme] + ", " + ECRITE_LABELS[formeEcrite] + " ; face au client : " + FORME_LABELS[formeClient],
      "Membres : " + COMMERCANTS_LABELS[membresCommercants] + " ; " + POUVOIR_LABELS[pouvoir] + " ; " + RELATION_LABELS[relation],
      "Devis : " + fmtEur(montantTotal) + " ; somme des parts " + fmtEur(rep.somme) + " ; écart " + (ecart === 0 ? "aucun" : fmtEur(ecart)),
      "Parts : " + MEMBRES.map(function (m, j) { return rep.actifs[j] ? m + " " + fmtEur(parts[j]) : null; }).filter(Boolean).join(", "),
      "Frais communs : " + fmtEur(frais) + ", " + CLE_LABELS[cleFrais] + " ; rémunération du mandataire " + fmtEur(rep.remunTotal),
      "Paiement : " + PAIEMENT_LABELS[paiement] + " ; " + CONVENTION_LABELS[convention],
      "Défaillance : " + (ex.k < 0 ? "aucun scénario" : nomMembre(MEMBRES[ex.k]) + ", " + fmtEur(ex.m) + " ; exposition maximale d'un autre membre " + fmtEur(expoMax)),
      "Contrôles : " + plural(nbOk, "conforme", "conformes") + ", " + nbWarn + " à compléter, " + plural(nbBad, "bloquant", "bloquants") + ", " + plural(nbInfo, "information", "informations"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    return {
      role: role, forme: forme, formeEcrite: formeEcrite, membresCommercants: membresCommercants, pouvoir: pouvoir, relation: relation,
      repartitionDevis: repartitionDevis, cleFrais: cleFrais, paiement: paiement, convention: convention, defaillant: defaillant,
      montantTotal: montantTotal, parts: parts, frais: frais, taux: taux, montantNonExecute: montantNonExecute,
      somme: rep.somme, n: rep.n, ecart: ecart, partEgale: partEgale, fraisPart: rep.fraisPart, remun: rep.remun, remunTotal: rep.remunTotal, net: rep.net, pct: rep.pct,
      formeClient: formeClient, k: ex.k, m: ex.m, plafonne: ex.plafonne, expo: ex.expo, perte: ex.perte, expoMax: expoMax,
      ecartLabel: ecartLabel, expoLabel: expoLabel, formeLabel: formeLabel, repartitionRows: repartitionRows,
      controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat,
      verdict: verdict, clause: clause, actions: actions, message: message, recap: recapLines.join("\n")
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, MEMBRES, ROLE_LABELS, FORME_LABELS, ECRITE_LABELS, COMMERCANTS_LABELS, POUVOIR_LABELS, RELATION_LABELS, REPARTITION_LABELS, CLE_LABELS, PAIEMENT_LABELS, CONVENTION_LABELS, DEFAILLANT_LABELS, computeGroupement, computeRepartition, computeExposition, formeFaceClient, splitInt, buildRecap, fmtEur, fmtPct, num, dec };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var cell = function (tr, txt) { var td = document.createElement("td"); td.textContent = txt; tr.appendChild(td); };
    var render = function () {
      var r = computeGroupement(readForm());
      document.getElementById("sommeOut").textContent = fmtEur(r.somme);
      document.getElementById("ecartOut").textContent = r.ecartLabel;
      document.getElementById("formeOut").textContent = r.formeLabel;
      document.getElementById("expoOut").textContent = r.expoLabel;
      document.getElementById("remunOut").textContent = fmtEur(r.remunTotal);
      document.getElementById("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      var v = document.getElementById("verdict");
      v.textContent = r.verdict;
      v.className = "alert " + r.etat;
      var tr0 = document.getElementById("repartition");
      tr0.innerHTML = "";
      r.repartitionRows.forEach(function (row) {
        var tr = document.createElement("tr");
        if (row.defaillant) tr.className = "weak";
        cell(tr, row.membre); cell(tr, fmtEur(row.part)); cell(tr, fmtPct(row.pct) + " %"); cell(tr, fmtEur(row.frais));
        cell(tr, fmtEur(row.remun)); cell(tr, fmtEur(row.net)); cell(tr, row.defaillant ? "défaillant" : fmtEur(row.expo)); cell(tr, row.defaillant ? "" : fmtEur(row.perte));
        tr0.appendChild(tr);
      });
      var tb = document.getElementById("controles");
      tb.innerHTML = "";
      r.controles.forEach(function (c) {
        var tr = document.createElement("tr");
        if (c.statut === "warn") tr.className = "weak";
        if (c.statut === "bad") tr.className = "cur";
        cell(tr, c.point); cell(tr, STATUT_LABELS[c.statut]); cell(tr, c.texte);
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
