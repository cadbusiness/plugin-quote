/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-bon-a-tirer-validation-production";
  var ROLE_LABELS = { fabricant: "fabricant qui fait valider", client: "client qui valide" };
  var TYPE_LABELS = { bat_fichier: "BAT fichier (PDF, maquette)", epreuve: "épreuve ou BAT physique", echantillon: "échantillon", prototype: "prototype", preserie: "présérie" };
  var VALIDEUR_LABELS = { nomme: "personne désignée par écrit", service: "un service, sans nom", rien: "rien d'écrit" };
  var CANAL_LABELS = { ecrit_version: "écrit qui cite la version", email_simple: "e-mail sans numéro de version", oral: "oralement", rien: "rien de prévu" };
  var SILENCE_LABELS = { suspendu: "production suspendue jusqu'à validation écrite", tacite: "BAT réputé accepté après le délai", rien: "rien d'écrit" };
  var PERIMETRE_LABELS = { liste: "liste écrite", partiel: "quelques éléments", rien: "rien d'écrit" };
  var TOLERANCE_LABELS = { ecrite: "écrites", rien: "rien d'écrit", sans_objet: "sans objet" };
  var RESPONSABILITE_LABELS = { ecrite: "écrite dans le devis", rien: "rien d'écrit" };
  var VERSIONS_LABELS = { oui: "oui", non: "non" };
  var DEPART_LABELS = { bat: "à partir de la validation écrite", commande: "à partir de la commande", rien: "rien d'écrit" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = ["Ce qui est soumis", "Qui valide", "Par quel écrit", "Délai de réponse", "Si le client ne répond pas", "Ce que la validation fige", "Tolérances", "Tours de corrections", "Erreur validée", "Départ du délai de fabrication", "Date de livraison", "Trace des versions"];
  var DEFAULTS = {
    role: "fabricant", type: "bat_fichier", valideur: "nomme", canal: "email_simple", delaiReponse: "2", silence: "suspendu",
    perimetre: "partiel", tolerance: "rien", responsabilite: "rien", versions: "oui",
    prixTour: "45", toursInclus: "2", toursReels: "4", delaiDepart: "bat", delaiProd: "5",
    dateValidation: "2026-11-16", datePromise: "2026-11-20"
  };
  var LABEL_SETS = { role: ROLE_LABELS, type: TYPE_LABELS, valideur: VALIDEUR_LABELS, canal: CANAL_LABELS, silence: SILENCE_LABELS, perimetre: PERIMETRE_LABELS, tolerance: TOLERANCE_LABELS, responsabilite: RESPONSABILITE_LABELS, versions: VERSIONS_LABELS, delaiDepart: DEPART_LABELS };
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  function num(v, max) {
    var s = String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "");
    var n = parseInt(s, 10);
    if (!isFinite(n) || n < 0) n = 0;
    if (n > max) n = max;
    return n;
  }
  function dec(v, max) {
    var s = String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    var n = parseFloat(s);
    if (!isFinite(n) || n < 0) n = 0;
    if (n > max) n = max;
    return Math.round(n * 100);
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
  function plural(n, one, many) { return n + " " + (n > 1 ? many : one); }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s == null ? "" : s));
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return d;
  }
  function fmtDate(d) {
    if (!d) return "[date]";
    return JOURS[d.getUTCDay()] + " " + d.getUTCDate() + " " + MOIS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function isoDate(d) { return d ? d.toISOString().slice(0, 10) : ""; }
  function addBusinessDays(d, n) {
    if (!d) return null;
    var x = new Date(d.getTime());
    var k = 0;
    while (k < n) { x = new Date(x.getTime() + 86400000); var w = x.getUTCDay(); if (w !== 0 && w !== 6) k++; }
    return x;
  }
  function subBusinessDays(d, n) {
    if (!d) return null;
    var x = new Date(d.getTime());
    var k = 0;
    while (k < n) { x = new Date(x.getTime() - 86400000); var w = x.getUTCDay(); if (w !== 0 && w !== 6) k++; }
    return x;
  }
  function businessDaysBetween(a, b) {
    if (!a || !b) return 0;
    if (b.getTime() <= a.getTime()) return 0;
    var x = new Date(a.getTime());
    var k = 0;
    while (x.getTime() < b.getTime()) { x = new Date(x.getTime() + 86400000); var w = x.getUTCDay(); if (w !== 0 && w !== 6) k++; }
    return k;
  }
  function pick(v, set, def) { return Object.prototype.hasOwnProperty.call(set, v) ? v : def; }

  function normalize(input) {
    var i = input || {};
    var o = {};
    Object.keys(LABEL_SETS).forEach(function (k) { o[k] = pick(i[k], LABEL_SETS[k], DEFAULTS[k]); });
    o.delaiReponse = num(i.delaiReponse, 60);
    o.toursInclus = num(i.toursInclus, 50);
    o.toursReels = num(i.toursReels, 50);
    o.delaiProd = num(i.delaiProd, 250);
    o.prixTourCents = dec(i.prixTour, 1000000);
    o.dateValidation = parseDate(i.dateValidation);
    o.datePromise = parseDate(i.datePromise);
    return o;
  }

  function computeDates(o) {
    var livraison = addBusinessDays(o.dateValidation, o.delaiProd);
    var limite = subBusinessDays(o.datePromise, o.delaiProd);
    var retard = 0, avance = 0;
    if (livraison && o.datePromise) {
      retard = businessDaysBetween(o.datePromise, livraison);
      avance = businessDaysBetween(livraison, o.datePromise);
    }
    return { livraison: livraison, limite: limite, retard: retard, avance: avance, complet: !!(livraison && o.datePromise) };
  }
  function computeTours(o) {
    var extra = Math.max(0, o.toursReels - o.toursInclus);
    return { extra: extra, coutCents: extra * o.prixTourCents };
  }

  var SOUMIS_TEXTES = {
    bat_fichier: "Le BAT fichier valide les textes, numéros, visuels, la mise en page et les dimensions. Il ne valide pas la couleur imprimée sur le support réel.",
    epreuve: "L'épreuve valide le contenu et donne une couleur plus fiable sur le support ou un support proche. Notez le support utilisé.",
    echantillon: "L'échantillon valide la matière, la teinte et la finition. Conservez-en un exemplaire identifié de chaque côté comme référence.",
    prototype: "Le prototype valide la forme et la fonction, rarement la tenue en série. Écrivez les écarts admis entre prototype et série.",
    preserie: "La présérie est faite dans les conditions de la série et sert de référence. Écrivez son prix et s'il reste dû sans commande de série."
  };

  function computeBat(input) {
    var o = normalize(input);
    var d = computeDates(o);
    var t = computeTours(o);
    var controles = [];
    function add(i, statut, texte) { controles.push({ point: POINTS[i], statut: statut, texte: texte }); }

    add(0, "info", SOUMIS_TEXTES[o.type]);

    if (o.valideur === "nomme") add(1, "ok", "Une personne désignée par écrit valide. Les remarques des autres passent par elle.");
    else if (o.valideur === "service") add(1, "warn", "Un service valide, sans nom : plusieurs personnes risquent de commenter chaque version. Faites désigner une personne.");
    else add(1, "bad", "Personne n'est désigné pour valider : n'importe quel « OK » sera discuté. Désignez une personne par écrit avant le premier envoi.");

    if (o.canal === "ecrit_version") add(2, "ok", "La validation est écrite et cite le numéro de version : c'est la trace la plus solide (articles 1366 et 1367 du code civil).");
    else if (o.canal === "email_simple") add(2, "warn", "Un e-mail « OK » sans numéro de version est une trace faible quand plusieurs versions circulent. Demandez la version dans la validation.");
    else if (o.canal === "oral") add(2, "bad", "Une validation orale ne laisse aucune trace. Exigez un écrit avant de lancer la production.");
    else add(2, "bad", "Rien n'est prévu pour donner la validation. Écrivez qu'elle se fait par écrit en citant la version.");

    if (o.delaiReponse > 0) add(3, "ok", "Le client répond sous " + plural(o.delaiReponse, "jour ouvré", "jours ouvrés") + " : ce délai sert à expliquer pourquoi la date bouge.");
    else add(3, "warn", "Aucun délai de réponse n'est écrit : impossible de rattacher un retard de validation au planning.");

    if (o.silence === "suspendu") add(4, "ok", "Sans validation écrite, rien n'est produit. Le délai glisse d'autant, ce que la clause doit dire.");
    else if (o.silence === "tacite") add(4, "warn", "La validation tacite est un pari : le silence ne vaut pas acceptation par principe (article 1120 du code civil). Relancez avant l'échéance plutôt que de produire sur un silence.");
    else add(4, "warn", "Rien n'est écrit : un fabricant qui produit sans réponse produit à ses risques. Écrivez que la production attend la validation écrite.");

    if (o.perimetre === "liste") add(5, "ok", "La validation porte sur une liste écrite : textes, numéros, visuels, cotes, quantités.");
    else if (o.perimetre === "partiel") add(5, "warn", "Seuls quelques éléments sont listés : ce qui n'est pas listé reste ouvert. Ajoutez coordonnées, numéros, dimensions et quantités par référence.");
    else add(5, "bad", "Rien ne dit ce que la validation fige : en cas d'erreur, chaque partie y mettra ce qui l'arrange. Listez-le.");

    if (o.tolerance === "ecrite") add(6, "ok", "Les tolérances de couleur, de cote ou de quantité livrée sont écrites.");
    else if (o.tolerance === "rien") add(6, "warn", "Aucune tolérance écrite : le client attend la couleur validée et la quantité exacte. Écrivez l'écart admis si votre fabrication en a un.");
    else add(6, "info", "Pas de tolérance utile pour cette fabrication.");

    if (o.toursInclus === 0) add(7, "warn", "Aucun tour de corrections n'est écrit comme inclus : chaque retour sera discuté. Fixez un nombre et le prix des suivants.");
    else if (t.extra === 0) add(7, "ok", plural(o.toursReels, "tour réalisé", "tours réalisés") + " sur " + o.toursInclus + " inclus.");
    else if (o.prixTourCents > 0) add(7, "info", plural(t.extra, "tour supplémentaire", "tours supplémentaires") + " au-delà des " + o.toursInclus + " inclus, à " + fmtEur(o.prixTourCents) + " : " + fmtEur(t.coutCents) + " à facturer comme prévu.");
    else add(7, "warn", plural(t.extra, "tour supplémentaire", "tours supplémentaires") + " au-delà des " + o.toursInclus + " inclus, sans prix écrit : ils seront difficiles à facturer.");

    if (o.responsabilite === "ecrite") add(8, "ok", "Le devis dit qui supporte une erreur présente dans la version validée.");
    else add(8, "warn", "Rien n'est écrit sur l'erreur validée : l'article 1642 du code civil aide le fabricant, mais la discussion dépendra des faits. Écrivez la règle.");

    if (o.delaiDepart === "bat") add(9, "ok", "Le délai de fabrication court à partir de la validation écrite.");
    else if (o.delaiDepart === "commande") add(9, "warn", "Le délai court depuis la commande : chaque jour passé sur les corrections est pris sur la fabrication.");
    else add(9, "warn", "Rien ne dit d'où part le délai : le client lira la date promise comme ferme.");

    var livTxt = fmtDate(d.livraison);
    if (!d.complet) add(10, "warn", "Indiquez la date de validation et la date promise pour calculer l'écart.");
    else if (d.retard === 0) add(10, "ok", "Livraison calculée le " + livTxt + (d.avance > 0 ? ", " + plural(d.avance, "jour ouvré", "jours ouvrés") + " avant la date promise." : ", à la date promise."));
    else if (o.delaiDepart === "bat") add(10, "info", "Livraison calculée le " + livTxt + ", " + plural(d.retard, "jour ouvré", "jours ouvrés") + " après la date promise. Conforme à la clause, mais prévenez le client par écrit.");
    else add(10, "bad", "Livraison calculée le " + livTxt + ", " + plural(d.retard, "jour ouvré", "jours ouvrés") + " après la date promise, sans clause qui rattache le délai à la validation : le client peut vous opposer la date promise.");

    if (o.versions === "oui") add(11, "ok", "Chaque version est numérotée et conservée avec le dossier.");
    else add(11, "warn", "Les versions ne sont ni numérotées ni conservées : impossible de prouver ce qui a été validé.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) { if (c.statut === "ok") nbOk++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : nbWarn > 0 ? "warn" : "ok";

    var tete;
    if (nbBad > 0) tete = plural(nbBad, "point bloquant", "points bloquants") + ", " + nbWarn + " à compléter.";
    else if (nbWarn > 0) tete = "Aucun point bloquant, " + nbWarn + " à compléter.";
    else tete = "Tout est en place.";
    var corps = "";
    if (d.livraison) {
      corps = " Livraison calculée le " + livTxt + ", " + plural(o.delaiProd, "jour ouvré", "jours ouvrés") + " après la validation du " + fmtDate(o.dateValidation);
      if (o.datePromise) {
        if (d.retard > 0) corps += " : " + plural(d.retard, "jour ouvré", "jours ouvrés") + " après la date promise du " + fmtDate(o.datePromise) + ".";
        else corps += " : date promise du " + fmtDate(o.datePromise) + " tenue.";
      } else corps += ".";
    }
    if (t.extra > 0) corps += " " + plural(t.extra, "tour supplémentaire", "tours supplémentaires") + (o.prixTourCents > 0 ? " : " + fmtEur(t.coutCents) + "." : ", sans prix écrit.");
    var verdict = tete + corps;

    var soumisClause = { bat_fichier: "Un BAT au format PDF est soumis", epreuve: "Une épreuve sur support est soumise", echantillon: "Un échantillon est soumis", prototype: "Un prototype est soumis", preserie: "Une présérie est soumise" }[o.type];
    var porteeClause = {
      bat_fichier: "La validation porte sur les textes, numéros, coordonnées, visuels, mise en page, dimensions et quantités par référence. Le BAT PDF ne valide pas le rendu exact des couleurs à l'impression.",
      epreuve: "La validation porte sur les textes, numéros, coordonnées, visuels, mise en page, dimensions, quantités par référence et sur le rendu des couleurs, avec une tolérance de [à préciser].",
      echantillon: "La validation porte sur la matière, la teinte, la finition et les dimensions de l'échantillon, conservé par chaque partie comme référence ; les variations admises entre l'échantillon et la production sont [à préciser].",
      prototype: "La validation porte sur les dimensions, matériaux, finitions et fonctions du prototype ; les écarts admis entre le prototype et la série sont [à préciser].",
      preserie: "Les unités de présérie validées servent de référence pour la série. La présérie est facturée [prix] même si la série n'est pas commandée."
    }[o.type];
    var clauseLines = [
      "Article [X] : Validation avant production",
      "1. " + soumisClause + " après acceptation du devis et réception des éléments du client. Chaque version est numérotée et datée.",
      "2. La validation est donnée par écrit par [nom, fonction], en citant le numéro de version. Les remarques d'autres personnes lui sont transmises par le client.",
      "3. Le client répond sous [" + (o.delaiReponse > 0 ? o.delaiReponse : 2) + "] jours ouvrés. Sans validation écrite, la production n'est pas lancée.",
      "4. " + porteeClause,
      "5. [" + (o.toursInclus > 0 ? o.toursInclus : 2) + "] tours de corrections sont inclus. Chaque tour supplémentaire est facturé [" + (o.prixTourCents > 0 ? fmtEur(o.prixTourCents) : "prix") + "]. Une modification de la commande fait l'objet d'un avenant.",
      "6. Le délai de fabrication est de [" + o.delaiProd + "] jours ouvrés à compter de la validation écrite de la dernière version. La date du [" + (o.datePromise ? fmtDate(o.datePromise) : "date") + "] suppose une validation au plus tard le [" + (d.limite ? fmtDate(d.limite) : "date") + "].",
      "7. Une erreur présente dans la version validée et reproduite à l'identique reste à la charge du client. Une erreur apparue en fabrication reste à la charge du fabricant."
    ];
    var clause = clauseLines.join("\n");

    var actions = [];
    controles.forEach(function (c, i) {
      if (c.statut !== "warn" && c.statut !== "bad") return;
      var a = {
        1: "Faire désigner par écrit la personne qui valide, avec son nom et sa fonction.",
        2: "Demander une validation écrite qui cite le numéro de version.",
        3: "Écrire un délai de réponse en jours ouvrés.",
        4: "Écrire que la production attend la validation écrite, et relancer avant l'échéance.",
        5: "Lister ce que la validation fige : textes, numéros, coordonnées, visuels, dimensions, quantités.",
        6: "Écrire les tolérances admises (couleur, cotes, quantité livrée) ou dire qu'il n'y en a pas.",
        7: "Fixer le nombre de tours inclus et le prix d'un tour supplémentaire.",
        8: "Écrire qui supporte une erreur présente dans la version validée.",
        9: "Rattacher le délai de fabrication à la validation écrite de la dernière version.",
        10: d.complet ? "Prévenir le client par écrit de la nouvelle date avant la date promise, en citant la clause." : "Renseigner la date de validation et la date promise.",
        11: "Numéroter chaque version et la conserver avec le dossier."
      }[i];
      if (a) actions.push(a);
    });
    if (!actions.length) actions.push("Rien à ajouter : gardez la version validée et la validation écrite avec le dossier.");

    var message;
    if (o.role === "fabricant") {
      message = "Objet : commande [référence] : validation et date de livraison\n\nBonjour [prénom],\n\n";
      message += "Merci pour votre validation du " + fmtDate(o.dateValidation) + ". La fabrication prend " + plural(o.delaiProd, "jour ouvré", "jours ouvrés") + " à partir de cette validation : livraison le " + livTxt + ".";
      if (d.retard > 0) message += " La date du " + fmtDate(o.datePromise) + " supposait une validation au plus tard le " + fmtDate(d.limite) + ".";
      if (t.extra > 0 && o.prixTourCents > 0) message += "\n\n" + plural(t.extra, "tour de corrections a été nécessaire", "tours de corrections ont été nécessaires") + " au-delà des " + o.toursInclus + " inclus ; " + (t.extra > 1 ? "ils apparaîtront" : "il apparaîtra") + " sur la facture pour " + fmtEur(t.coutCents) + ", comme prévu au devis.";
      message += "\n\nBien à vous,\n[signature]";
    } else {
      message = "Objet : commande [référence] : conditions de validation avant production\n\nBonjour,\n\n";
      message += "Avant de valider la prochaine version, pouvez-vous confirmer par écrit qui doit valider chez nous, ce que la validation couvre, le nombre de tours inclus et leur prix au-delà ?";
      message += " Si nous validons le " + fmtDate(o.dateValidation) + ", la livraison aurait lieu le " + livTxt + " d'après votre délai de " + plural(o.delaiProd, "jour ouvré", "jours ouvrés") + (o.datePromise ? " ; la date prévue au devis est le " + fmtDate(o.datePromise) + "." : ".");
      message += "\n\nBien à vous,\n[signature]";
    }

    var recapLines = [
      "Vérificateur de bon à tirer avant production",
      "Position : " + ROLE_LABELS[o.role] + " ; soumis : " + TYPE_LABELS[o.type],
      "Valideur : " + VALIDEUR_LABELS[o.valideur] + " ; validation : " + CANAL_LABELS[o.canal],
      "Délai de réponse : " + plural(o.delaiReponse, "jour ouvré", "jours ouvrés") + " ; silence : " + SILENCE_LABELS[o.silence],
      "Périmètre : " + PERIMETRE_LABELS[o.perimetre] + " ; tolérances : " + TOLERANCE_LABELS[o.tolerance] + " ; erreur validée : " + RESPONSABILITE_LABELS[o.responsabilite],
      "Tours : " + o.toursReels + " réalisés, " + o.toursInclus + " inclus, " + t.extra + " en plus" + (o.prixTourCents > 0 ? " à " + fmtEur(o.prixTourCents) + " : " + fmtEur(t.coutCents) : ", sans prix écrit"),
      "Délai de fabrication : " + plural(o.delaiProd, "jour ouvré", "jours ouvrés") + ", " + DEPART_LABELS[o.delaiDepart],
      "Validation : " + fmtDate(o.dateValidation) + " ; livraison calculée : " + livTxt + " ; promise : " + fmtDate(o.datePromise),
      "Écart : " + (!d.complet ? "non calculé" : d.retard > 0 ? plural(d.retard, "jour ouvré", "jours ouvrés") + " de retard" : "aucun retard") + " ; validation au plus tard : " + fmtDate(d.limite),
      "Contrôle : " + nbOk + " conformes, " + nbWarn + " à compléter, " + nbBad + " bloquants, " + nbInfo + " informations",
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    var ecartLabel = !d.complet ? "Dates à renseigner" : d.retard > 0 ? plural(d.retard, "jour ouvré", "jours ouvrés") + " de retard" : d.avance > 0 ? plural(d.avance, "jour ouvré", "jours ouvrés") + " d'avance" : "À la date promise";
    var toursLabel = t.extra === 0 ? "Aucun" : plural(t.extra, "tour", "tours") + (o.prixTourCents > 0 ? ", soit " + fmtEur(t.coutCents) : ", sans prix écrit");

    return {
      input: o, livraison: d.livraison, limite: d.limite, retard: d.retard, avance: d.avance, complet: d.complet,
      extra: t.extra, coutCents: t.coutCents, controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat,
      verdict: verdict, clause: clause, actions: actions, message: message, recap: recapLines.join("\n"),
      livraisonLabel: fmtDate(d.livraison), limiteLabel: fmtDate(d.limite), ecartLabel: ecartLabel, toursLabel: toursLabel
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, LABEL_SETS, ROLE_LABELS, TYPE_LABELS, VALIDEUR_LABELS, CANAL_LABELS, SILENCE_LABELS, PERIMETRE_LABELS, TOLERANCE_LABELS, RESPONSABILITE_LABELS, VERSIONS_LABELS, DEPART_LABELS, computeBat, computeDates, computeTours, normalize, buildRecap, fmtEur, fmtDate, parseDate, isoDate, num, dec, addBusinessDays, subBusinessDays, businessDaysBetween };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computeBat(readForm());
      document.getElementById("livraisonOut").textContent = r.livraisonLabel;
      document.getElementById("ecartOut").textContent = r.ecartLabel;
      document.getElementById("limiteOut").textContent = r.limiteLabel;
      document.getElementById("toursOut").textContent = r.toursLabel;
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
