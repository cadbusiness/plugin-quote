/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

"use strict";
  var MAX_LIGNES = 5;
  var TYPE_LABELS = {
    forfait: "Forfait de construction d'un bâtiment (article 1793 du Code civil)",
    forfaitAutre: "Prix global hors construction de bâtiment",
    unitaires: "Prix unitaires, métré ou régie"
  };
  var ACCORD_LABELS = {
    ecritPrix: "Accord écrit avec le prix, avant les travaux",
    apres: "Accepté par écrit, de façon expresse, après exécution",
    ecritSansPrix: "Accord écrit, mais sans prix",
    oral: "Accord oral seulement",
    aucun: "Aucun accord du client"
  };
  var ETAT_LABELS = { fait: "Déjà réalisés", afaire: "Pas encore commencés" };
  var STATUT_LABELS = { ok: "Sécurisé", warn: "À régulariser", bad: "À risque" };
  var DEFAULTS = {
    typeMarche: "forfait", ref: "D-2026-118", montantInitial: 48000, seuilSignal: 20,
    l1: "Renfort de dalle sous rayonnage", m1: 3200, a1: "ecritPrix", e1: "fait",
    l2: "Six prises supplémentaires au bureau", m2: 1450, a2: "oral", e2: "fait",
    l3: "Cloison vitrée supplémentaire", m3: 6800, a3: "ecritSansPrix", e3: "afaire",
    l4: "Reprise d'enduit découverte au démontage", m4: 2100, a4: "aucun", e4: "fait",
    l5: "", m5: 0, a5: "ecritPrix", e5: "afaire"
  };

  function num(v, min, max, fallback) {
    if (v === "" || v == null) return fallback;
    var n = Number(String(v).replace(",", "."));
    if (!isFinite(n)) return fallback;
    if (min != null && n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  }
  function pick(v, liste, fallback) { return liste.indexOf(v) >= 0 ? v : fallback; }
  function arrondi(n) { return Math.round(n * 100) / 100; }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) {
    if (n == null || !isFinite(n)) return "n/a";
    var neg = n < 0; var a = Math.abs(arrondi(n));
    var ent = Math.floor(a); var cts = Math.round((a - ent) * 100);
    var s = groupe(ent) + (cts ? "," + (cts < 10 ? "0" : "") + cts : "");
    return (neg ? "-" : "") + s + "\u00a0€";
  }
  function fmtTaux(t) {
    if (t == null || !isFinite(t)) return "n/a";
    var r = Math.round(t * 10) / 10;
    return String(r).replace(".", ",") + "\u00a0%";
  }
  function propre(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, 120); }

  function classer(type, accord, etat) {
    if (accord === "ecritPrix" || accord === "apres") return "ok";
    if (type === "unitaires" && accord === "ecritSansPrix") return "ok";
    if (etat === "afaire") return "warn";
    if (type === "forfait") return "bad";
    if (accord === "aucun") return "bad";
    return "warn";
  }

  function action(type, accord, etat, statut) {
    if (statut === "ok") {
      if (type === "unitaires" && accord === "ecritSansPrix") return "Commande écrite : le prix suit les prix unitaires du devis. Vérifier que la ligne existe bien au bordereau.";
      if (accord === "apres") return "Garder l'écrit d'acceptation dans le dossier et le joindre à la facture.";
      return "Rien à faire de plus : garder l'écrit et le prix dans le dossier.";
    }
    if (etat === "afaire") {
      if (accord === "ecritSansPrix") return "Chiffrer et faire accepter le prix par écrit avant de commencer.";
      return "Ne pas commencer avant un accord écrit qui mentionne le prix (avenant ou devis complémentaire signé).";
    }
    if (statut === "bad" && type === "forfait") return "Sans écrit préalable ni acceptation expresse après coup, ce montant risque de ne pas être payé. Demander une acceptation écrite et sans réserve avant la facture.";
    if (statut === "bad") return "Aucune commande prouvée. Demander une acceptation écrite et expresse avant la facture, sinon prévoir de ne pas être payé.";
    if (accord === "oral") return "Faire confirmer par écrit l'accord et le prix (un e-mail du client qui reprend le montant vaut mieux que rien).";
    return "Le principe est acquis, pas le prix : faire accepter le montant par écrit avant la facture.";
  }

  function computeAvenant(input) {
    var o = {};
    for (var k in DEFAULTS) o[k] = DEFAULTS[k];
    if (input) for (var j in input) if (input[j] !== undefined) o[j] = input[j];
    var type = pick(o.typeMarche, Object.keys(TYPE_LABELS), DEFAULTS.typeMarche);
    var initial = num(o.montantInitial, 0, null, 0);
    var seuil = num(o.seuilSignal, 0, 1000, DEFAULTS.seuilSignal);
    var ref = propre(o.ref) || "sans référence";
    var lignes = [];
    for (var i = 1; i <= MAX_LIGNES; i++) {
      var libelle = propre(o["l" + i]);
      var montant = arrondi(num(o["m" + i], 0, null, 0));
      if (!libelle && montant === 0) continue;
      var accord = pick(o["a" + i], Object.keys(ACCORD_LABELS), "aucun");
      var etat = pick(o["e" + i], Object.keys(ETAT_LABELS), "fait");
      var statut = classer(type, accord, etat);
      lignes.push({ n: i, libelle: libelle || "Ligne " + i, montant: montant, accord: accord, etat: etat, statut: statut, action: action(type, accord, etat, statut) });
    }
    var tot = { ok: 0, warn: 0, bad: 0 };
    lignes.forEach(function (l) { tot[l.statut] = arrondi(tot[l.statut] + l.montant); });
    var totalSupp = arrondi(tot.ok + tot.warn + tot.bad);
    var nouveau = arrondi(initial + totalSupp);
    var securise = arrondi(initial + tot.ok);
    var ecartPct = initial > 0 ? totalSupp / initial * 100 : null;
    var ecartOkPct = initial > 0 ? tot.ok / initial * 100 : null;
    var signal = ecartPct != null && seuil > 0 && ecartPct >= seuil;
    var nb = { ok: 0, warn: 0, bad: 0 };
    lignes.forEach(function (l) { nb[l.statut]++; });

    var etatG, verdict;
    if (!lignes.length) { etatG = "neutral"; verdict = "Aucune ligne de travaux supplémentaires saisie."; }
    else if (tot.bad > 0) { etatG = "bad"; verdict = fmtEur(tot.bad) + " HT de travaux déjà réalisés sont à risque : ni accord écrit avec prix avant les travaux, ni acceptation expresse après coup."; }
    else if (tot.warn > 0) { etatG = "warn"; verdict = fmtEur(tot.warn) + " HT sont à régulariser : obtenir un accord écrit avec le prix avant de commencer ou avant de facturer."; }
    else { etatG = "ok"; verdict = "Toutes les lignes ont un accord exploitable : " + fmtEur(tot.ok) + " HT sécurisés."; }

    var conseils = [];
    if (type === "forfait") conseils.push("Marché à forfait de construction d'un bâtiment : l'entrepreneur ne peut demander de supplément que si les changements ont été autorisés par écrit et le prix convenu (article 1793 du Code civil), ou si le client les a acceptés de façon expresse et non équivoque une fois réalisés. Le silence au décompte final ne vaut pas acceptation (Cass. 3e civ., 8 juin 2023, n° 22-10.393).");
    if (type === "forfaitAutre") conseils.push("Hors construction d'un bâtiment, l'article 1793 ne s'applique pas automatiquement (Cass. 3e civ., 23 juin 1999, n° 98-10.276, rénovation ponctuelle d'un appartement). Il faut alors prouver que le client a commandé les travaux : entre commerçants la preuve est libre (article L110-3 du Code de commerce), mais un écrit reste ce qui se discute le moins.");
    if (type === "unitaires") conseils.push("Prix unitaires ou métré : les quantités réelles se facturent aux prix du bordereau. Les ouvrages nouveaux, sans prix au bordereau, demandent un prix accepté par écrit comme une commande nouvelle.");
    if (nb.bad > 0) conseils.push(nb.bad + (nb.bad > 1 ? " lignes sont" : " ligne est") + " à risque. Avant d'envoyer la facture, demander une acceptation écrite qui reprend le libellé et le montant. Prévenir le client, l'informer en réunion de chantier ou constater qu'il n'a pas protesté ne suffit pas (Cass. 3e civ., 27 juin 2019, n° 16-25.262).");
    if (nb.warn > 0) conseils.push(nb.warn + (nb.warn > 1 ? " lignes sont" : " ligne est") + " à régulariser. Le plus simple : un avenant ou un devis complémentaire signé, daté, avec le prix, avant de commencer.");
    if (signal) conseils.push("L'écart atteint " + fmtTaux(ecartPct) + ", au-dessus de votre seuil d'alerte de " + fmtTaux(seuil) + ". Aucun pourcentage légal ne fait perdre son caractère forfaitaire à un marché privé : le juge regarde si les modifications, par leur nature et leur importance, ont bouleversé l'économie du contrat (Cass. 3e civ., 26 novembre 2003, n° 02-13.875). Mieux vaut un avenant global qu'une suite de petits accords.");
    if (initial === 0) conseils.push("Montant initial à 0 : l'écart en pourcentage ne peut pas être calculé.");
    conseils.push("Client public (État, collectivité, établissement public) : les modifications du marché suivent le Code de la commande publique (articles R2194-1 et suivants), pas cet outil.");

    var lignesAvenant = lignes.map(function (l, idx) {
      var suffixe = l.statut === "ok" ? " (déjà accepté)" : "";
      return (idx + 1) + ". " + l.libelle + " : " + fmtEur(l.montant) + " HT" + suffixe;
    });
    var avenant = [
      "Projet d'avenant au devis " + ref,
      "Montant initial du devis : " + fmtEur(initial) + " HT",
      "Travaux supplémentaires :"
    ].concat(lignesAvenant.length ? lignesAvenant : ["(aucune ligne)"]).concat([
      "Total des travaux supplémentaires : " + fmtEur(totalSupp) + " HT",
      "Nouveau montant : " + fmtEur(nouveau) + " HT",
      "Le client autorise les travaux listés ci-dessus et accepte leur prix. Les autres conditions du devis initial restent inchangées.",
      "Date, nom et signature du client :",
      "Date, nom et signature de l'entreprise :"
    ]).join("\n");

    var recap = [
      "Devis " + ref + " · " + TYPE_LABELS[type],
      "Montant initial : " + fmtEur(initial) + " HT",
      "Travaux supplémentaires : " + fmtEur(totalSupp) + " HT sur " + lignes.length + " ligne(s)",
      "Sécurisé : " + fmtEur(tot.ok) + " HT · à régulariser : " + fmtEur(tot.warn) + " HT · à risque : " + fmtEur(tot.bad) + " HT",
      "Montant si tout est accepté : " + fmtEur(nouveau) + " HT (écart " + fmtTaux(ecartPct) + ")",
      "Montant sécurisé aujourd'hui : " + fmtEur(securise) + " HT (écart " + fmtTaux(ecartOkPct) + ")"
    ].concat(lignes.map(function (l) { return "· " + l.libelle + " : " + fmtEur(l.montant) + " HT, " + ACCORD_LABELS[l.accord].toLowerCase() + ", " + ETAT_LABELS[l.etat].toLowerCase() + " → " + STATUT_LABELS[l.statut]; })).concat([
      "Calcul indicatif fait avec le calculateur d'avenant QuoteBuilder, pas un conseil juridique."
    ]).join("\n");

    return { type: type, ref: ref, initial: initial, seuil: seuil, lignes: lignes, totalSupp: totalSupp, totalOk: tot.ok, totalWarn: tot.warn, totalBad: tot.bad, nb: nb, nouveau: nouveau, securise: securise, ecartPct: ecartPct, ecartOkPct: ecartOkPct, signal: signal, etat: etatG, verdict: verdict, conseils: conseils, avenant: avenant, recap: recap };
  }
  function buildRecap(input) { return computeAvenant(input).recap; }
  function buildAvenant(input) { return computeAvenant(input).avenant; }

export { MAX_LIGNES, TYPE_LABELS, ACCORD_LABELS, ETAT_LABELS, STATUT_LABELS, DEFAULTS, computeAvenant, buildRecap, buildAvenant, classer, action, num, fmtEur, fmtTaux, propre };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = ["typeMarche", "ref", "montantInitial", "seuilSignal"];
    for (var n = 1; n <= MAX_LIGNES; n++) ids.push("l" + n, "m" + n, "a" + n, "e" + n);
    function read() { var o = {}; ids.forEach(function (k) { o[k] = $(k).value; }); return o; }
    function render() {
      var r = computeAvenant(read());
      $("totalSupp").textContent = fmtEur(r.totalSupp) + " HT";
      $("totalOk").textContent = fmtEur(r.totalOk) + " HT";
      $("totalWarn").textContent = fmtEur(r.totalWarn) + " HT";
      $("totalBad").textContent = fmtEur(r.totalBad) + " HT";
      $("nouveau").textContent = fmtEur(r.nouveau) + " HT";
      $("securise").textContent = fmtEur(r.securise) + " HT";
      $("ecart").textContent = r.ecartPct == null ? "n/a" : fmtTaux(r.ecartPct) + (r.signal ? " (au-dessus de votre seuil)" : "");
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("lignes"); tb.innerHTML = "";
      r.lignes.forEach(function (l) {
        var tr = document.createElement("tr"); tr.className = l.statut;
        [l.libelle, fmtEur(l.montant) + " HT", STATUT_LABELS[l.statut], l.action].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
        tb.appendChild(tr);
      });
      var ul = $("conseils"); ul.innerHTML = "";
      r.conseils.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
      $("avenant").textContent = r.avenant;
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
