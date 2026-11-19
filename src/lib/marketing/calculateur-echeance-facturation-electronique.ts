/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var DATE_2026 = "2026-09-01";
  var DATE_2027 = "2027-09-01";
  var AMENDE_FACTURE = 50;
  var PLAFOND_AMENDE = 15000;
  var AMENDE_EREPORTING = 500;
  var AMENDE_RECEPTION_1 = 500;
  var AMENDE_RECEPTION_2 = 1000;
  var SEUIL_ALERTE_JOURS = 300;
  var SEUILS = {
    micro: { effectif: 10, ca: 2000000, bilan: 2000000 },
    pme: { effectif: 250, ca: 50000000, bilan: 43000000 },
    eti: { effectif: 5000, ca: 1500000000, bilan: 2000000000 }
  };
  var CATEGORIE_LABELS = { micro: "Micro-entreprise", pme: "PME", eti: "ETI (entreprise de taille intermédiaire)", ge: "Grande entreprise" };
  var DEFAULTS = {
    regime: "assujetti", assujettiUnique: "non", effectif: 14, ca: 1900000, bilan: 1100000, facturesMois: 35,
    b2c: "non", international: "non", encaissements: "oui", achatsEtranger: "non", plateforme: "encours", dateCalcul: "2026-10-28"
  };

  function num(v, fallback) {
    var n = Number(v);
    if (v === "" || v == null || !isFinite(n) || n < 0) return fallback;
    return n;
  }
  function parseDate(s) {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return null;
    var p = String(s).split("-");
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    return isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== String(s) ? null : d;
  }
  function iso(d) { return d ? d.toISOString().slice(0, 10) : null; }
  function diffDays(a, b) { return Math.round((b.getTime() - a.getTime()) / 86400000); }
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  function fmtDate(d) {
    if (!d) return "n/a";
    var j = d.getUTCDate();
    return (j === 1 ? "1er" : String(j)) + " " + MOIS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) { return groupe(Math.round(n)) + "\u00a0€"; }
  function fmtJours(n) { if (n == null || !isFinite(n)) return "n/a"; var a = Math.abs(n); return groupe(a) + (a > 1 ? " jours" : " jour"); }

  function categorie(effectif, ca, bilan) {
    function dans(s) { return effectif < s.effectif && (ca <= s.ca || bilan <= s.bilan); }
    if (dans(SEUILS.micro)) return "micro";
    if (dans(SEUILS.pme)) return "pme";
    if (dans(SEUILS.eti)) return "eti";
    return "ge";
  }

  function amendeEmission(facturesMois) {
    var brut = Math.max(0, Math.round(facturesMois)) * 12 * AMENDE_FACTURE;
    return { brut: brut, plafonnee: Math.min(brut, PLAFOND_AMENDE), plafondAtteint: brut > PLAFOND_AMENDE };
  }

  function etatLigne(date, calcul, faitOk) {
    if (calcul.getTime() < date.getTime()) return "À venir dans " + fmtJours(diffDays(calcul, date));
    return faitOk ? "En vigueur, en place" : "En vigueur depuis " + fmtJours(diffDays(date, calcul));
  }

  function computeEcheance(input) {
    var o = {};
    for (var k in DEFAULTS) o[k] = (input && input[k] !== undefined) ? input[k] : DEFAULTS[k];
    var effectif = num(o.effectif, 0), ca = num(o.ca, 0), bilan = num(o.bilan, 0), facturesMois = num(o.facturesMois, 0);
    var calcul = parseDate(o.dateCalcul) || parseDate(DEFAULTS.dateCalcul);
    var cat = categorie(effectif, ca, bilan);
    var au = o.assujettiUnique === "oui";
    var exonere = o.regime === "exonere";
    var d2026 = parseDate(DATE_2026), d2027 = parseDate(DATE_2027);
    var reception = d2026;
    var emission = exonere ? null : ((au || cat === "ge" || cat === "eti") ? d2026 : d2027);
    var plateformeOk = o.plateforme === "oui";
    var receptionEnVigueur = calcul.getTime() >= reception.getTime();
    var receptionRetard = receptionEnVigueur && !plateformeOk;
    var joursEmission = emission ? diffDays(calcul, emission) : null;
    var emissionEnVigueur = emission ? joursEmission <= 0 : false;

    var calendrier = [];
    calendrier.push({ date: reception, obligation: "Réception des factures électroniques via une plateforme agréée (toutes les entreprises assujetties)", etat: etatLigne(reception, calcul, plateformeOk) });
    var ereportingTransactions = false, ereportingPaiement = false, ereportingAchats = false;
    if (emission) {
      calendrier.push({ date: emission, obligation: "Émission de vos factures B2B France en facture électronique, avec les nouvelles mentions", etat: etatLigne(emission, calcul, false) });
      if (o.b2c === "oui" || o.international === "oui") {
        ereportingTransactions = true;
        calendrier.push({ date: emission, obligation: "E-reporting des transactions" + (o.b2c === "oui" && o.international === "oui" ? " (ventes aux particuliers et clients hors de France)" : (o.b2c === "oui" ? " (ventes aux particuliers, données cumulées par jour)" : " (clients hors de France)")), etat: etatLigne(emission, calcul, false) });
      }
      if (o.encaissements === "oui" && o.regime === "assujetti") {
        ereportingPaiement = true;
        calendrier.push({ date: emission, obligation: "E-reporting des paiements reçus sur vos prestations de services", etat: etatLigne(emission, calcul, false) });
      }
    }
    if (!exonere && o.achatsEtranger === "oui") {
      ereportingAchats = true;
      calendrier.push({ date: d2027, obligation: "E-reporting de vos achats autoliquidés et acquisitions intracommunautaires (toutes tailles)", etat: etatLigne(d2027, calcul, false) });
    }
    calendrier.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });

    var amende = emission ? amendeEmission(facturesMois) : { brut: 0, plafonnee: 0, plafondAtteint: false };

    var etat, verdict;
    if (receptionRetard && o.plateforme === "non") {
      etat = "bad";
      verdict = "Votre entreprise devrait déjà pouvoir recevoir des factures électroniques depuis le 1er septembre 2026. Choisissez une plateforme agréée maintenant : sans plateforme, l'administration peut mettre en demeure, puis appliquer 500 € d'amende, puis 1 000 € tous les trois mois.";
    } else if (receptionRetard) {
      etat = "warn";
      verdict = "La réception est obligatoire depuis le 1er septembre 2026 et votre démarche n'est pas finie. Terminez le choix de la plateforme et vérifiez que votre adresse de réception figure dans l'annuaire.";
    } else if (emission && emissionEnVigueur) {
      etat = "warn";
      verdict = "L'émission électronique s'applique déjà à votre entreprise depuis le " + fmtDate(emission) + ". Chaque facture B2B France émise hors plateforme expose à 50 € d'amende, dans la limite de 15 000 € par an.";
    } else if (emission && joursEmission <= SEUIL_ALERTE_JOURS) {
      etat = "warn";
      verdict = "Il reste " + fmtJours(joursEmission) + " avant l'émission obligatoire. C'est le moment de tester une facture réelle de bout en bout avec votre plateforme.";
    } else {
      etat = "ok";
      verdict = emission ? "Réception en place. L'émission obligatoire arrive le " + fmtDate(emission) + ", dans " + fmtJours(joursEmission) + "." : "Réception en place. Pour des opérations exonérées et dispensées de facture, pas d'émission électronique ni d'e-reporting à prévoir.";
    }

    var mentions = [];
    if (emission) {
      mentions.push("Le numéro SIREN de votre client.");
      mentions.push("L'adresse de livraison des biens, si elle diffère de l'adresse de facturation.");
      mentions.push("La catégorie de l'opération : livraison de biens, prestation de services, ou les deux.");
      mentions.push("La mention « Option pour le paiement de la taxe d'après les débits », si vous avez pris cette option.");
      mentions.push("Applicables à partir du " + fmtDate(emission) + " pour votre entreprise. Une mention manquante ou fausse expose à 15 € d'amende par mention, plafonnée au quart du montant de la facture.");
    } else {
      mentions.push("Pas de nouvelle mention à prévoir pour des opérations exonérées et dispensées de facture.");
    }

    var conseils = [];
    if (o.assujettiUnique === "oui" && cat !== "ge" && cat !== "eti") conseils.push("Votre taille seule vous placerait en " + CATEGORIE_LABELS[cat] + ", mais l'appartenance à un assujetti unique avance l'émission au 1er septembre 2026.");
    if (cat === "pme" && effectif < SEUILS.micro.effectif) conseils.push("Moins de 10 personnes, mais chiffre d'affaires et bilan tous deux au-dessus de 2 M€ : vous êtes classé PME. La date d'émission reste la même que pour une micro-entreprise.");
    if (o.regime === "franchise") conseils.push("La franchise en base ne vous dispense pas de la réforme : vos factures à des clients professionnels passent aussi par une plateforme agréée.");
    if (exonere) conseils.push("Si vous réalisez aussi des opérations soumises à la TVA, refaites le calcul en choisissant « Je facture de la TVA » : l'émission s'appliquera à ces opérations.");
    if (emission && !emissionEnVigueur) conseils.push("Avant votre date, aucun client ne peut vous imposer la facture électronique au titre de la réforme. Il ne peut pas non plus refuser de payer une facture au seul motif qu'elle n'est pas électronique.");
    if (emission && cat !== "ge" && cat !== "eti" && !au && !emissionEnVigueur) conseils.push("Vous pouvez émettre en électronique dès maintenant, de façon volontaire, si votre plateforme est prête.");
    if (emission && amende.plafondAtteint) conseils.push("Avec " + groupe(Math.round(facturesMois)) + " factures par mois, l'amende brute atteindrait " + fmtEur(amende.brut) + " sur un an : elle est ramenée au plafond de 15 000 €.");
    if (emission) conseils.push("Pas d'amende pour une première infraction (sur l'année et les trois précédentes) réparée spontanément ou dans les 30 jours d'une demande de l'administration.");
    if (ereportingPaiement) conseils.push("E-reporting des paiements : la date d'encaissement de chaque facture de services devra remonter. Un suivi des paiements à jour devient une obligation, plus seulement une bonne pratique.");
    if (emission) conseils.push("Pour émettre une facture conforme, il faut le SIREN du client dès la commande. Demandez-le au moment du devis.");

    var lignes = calendrier.map(function (l) { return "- " + fmtDate(l.date) + " : " + l.obligation + " (" + l.etat + ")"; });
    var recap = [
      "Facturation électronique, calcul au " + fmtDate(calcul),
      "Catégorie : " + CATEGORIE_LABELS[cat] + " (" + groupe(effectif) + " personnes, CA " + fmtEur(ca) + ", bilan " + fmtEur(bilan) + ")" + (au ? ", membre d'un assujetti unique" : ""),
      "Réception : obligatoire depuis le " + fmtDate(reception) + (receptionRetard ? ", pas encore en place" : (receptionEnVigueur ? ", en place" : "")),
      "Émission : " + (emission ? fmtDate(emission) : "pas d'émission électronique pour ces opérations"),
      "Calendrier :"
    ].concat(lignes).concat([
      emission ? "Amende théorique sur un an hors plateforme : " + fmtEur(amende.plafonnee) + (amende.plafondAtteint ? " (plafond)" : "") : "Amende théorique : sans objet",
      "Verdict : " + verdict
    ]).join("\n");

    return {
      categorie: cat, categorieLabel: CATEGORIE_LABELS[cat], reception: reception, emission: emission, joursEmission: joursEmission,
      emissionEnVigueur: emissionEnVigueur, receptionEnVigueur: receptionEnVigueur, receptionRetard: receptionRetard,
      ereportingTransactions: ereportingTransactions, ereportingPaiement: ereportingPaiement, ereportingAchats: ereportingAchats,
      amende: amende, calendrier: calendrier, mentions: mentions, conseils: conseils, etat: etat, verdict: verdict, recap: recap
    };
  }
  function buildRecap(input) { return computeEcheance(input).recap; }

export { DATE_2026, DATE_2027, AMENDE_FACTURE, PLAFOND_AMENDE, AMENDE_EREPORTING, AMENDE_RECEPTION_1, AMENDE_RECEPTION_2, SEUIL_ALERTE_JOURS, SEUILS, CATEGORIE_LABELS, DEFAULTS, categorie, amendeEmission, computeEcheance, buildRecap, parseDate, iso, diffDays, fmtDate, fmtEur, fmtJours };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = ["regime", "assujettiUnique", "effectif", "ca", "bilan", "facturesMois", "b2c", "international", "encaissements", "achatsEtranger", "plateforme", "dateCalcul"];
    function read() { var o = {}; ids.forEach(function (k) { o[k] = $(k).value; }); return o; }
    function row(tb, cells, cls) {
      var tr = document.createElement("tr"); if (cls) tr.className = cls;
      cells.forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
      tb.appendChild(tr);
    }
    function list(id, items) {
      var ul = $(id); ul.innerHTML = "";
      items.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    }
    function render() {
      var r = computeEcheance(read());
      $("categorie").textContent = r.categorieLabel;
      $("reception").textContent = fmtDate(r.reception) + (r.receptionRetard ? ", pas encore en place" : "");
      $("emission").textContent = r.emission ? fmtDate(r.emission) : "Non concernée (opérations exonérées)";
      $("joursEmission").textContent = r.joursEmission == null ? "n/a" : (r.joursEmission <= 0 ? "déjà en vigueur" : fmtJours(r.joursEmission));
      $("amende").textContent = r.emission ? fmtEur(r.amende.plafonnee) + (r.amende.plafondAtteint ? " (plafond)" : "") : "n/a";
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("calendrier"); tb.innerHTML = "";
      r.calendrier.forEach(function (l) { row(tb, [fmtDate(l.date), l.obligation, l.etat], /depuis/.test(l.etat) ? "cur" : ""); });
      list("mentions", r.mentions);
      list("conseils", r.conseils);
      $("recap").textContent = r.recap;
    }
    document.querySelectorAll("#form input, #form select").forEach(function (el) {
      el.addEventListener("input", render); el.addEventListener("change", render);
    });
    document.querySelectorAll("button.copy").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = $(b.getAttribute("data-target")).textContent;
        if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { b.textContent = "Copié"; setTimeout(function () { b.textContent = "Copier"; }, 1500); });
      });
    });
    render();
  
  return built.snapshot();
}
