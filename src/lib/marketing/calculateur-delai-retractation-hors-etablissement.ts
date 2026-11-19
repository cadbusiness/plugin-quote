/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var LIEUX = ["hors", "apres_sollicitation", "distance", "locaux"];
  var EFFECTIFS = ["0_5", "plus_5", "inconnu"];
  var OBJETS = ["hors_activite", "activite", "doute"];
  var TYPES = ["service", "vente"];
  var INFOS = ["oui", "non", "tard"];
  var EXCEPTIONS = ["aucune", "sur_mesure"];
  var DEFAULTS = { lieu: "hors", effectif: "0_5", objet: "hors_activite", type: "service", exception: "aucune", conclusion: "2026-10-28", reception: "", info: "oui", dateInfo: "", montant: 1200, paiementMontant: 0, paiementDate: "", execution: "non", pct: 0 };
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

  function pick(v, list, fallback) { return list.indexOf(v) >= 0 ? v : fallback; }
  function num(v, min, max, fallback) {
    var n = (v === "" || v == null) ? NaN : Number(v);
    if (!isFinite(n)) n = fallback;
    if (n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  }
  function r2(n) { var x = Math.round(n * 100) / 100; return x === 0 ? 0 : x; }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) {
    if (n == null || !isFinite(n)) return "n/a";
    var c = Math.round(Math.abs(n) * 100);
    var neg = n < 0 && c !== 0;
    var txt = groupe(Math.floor(c / 100));
    if (c % 100 !== 0) txt += "," + String(c % 100).padStart(2, "0");
    return (neg ? "-" : "") + txt + "\u00a0€";
  }
  function fmtHt(n) { if (n == null || !isFinite(n)) return "n/a"; return fmtEur(n) + " HT"; }

  // Dates en UTC, sans heure, pour éviter les décalages d'heure d'été.
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return d;
  }
  function iso(d) { return d ? d.toISOString().slice(0, 10) : null; }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function addMonths(d, n) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
    var ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
    var last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
    return new Date(Date.UTC(ty, tm, Math.min(day, last)));
  }
  function diffDays(a, b) { return Math.round((b.getTime() - a.getTime()) / 86400000); }
  function fmtDate(d) {
    if (!d) return "n/a";
    return String(d.getUTCDate()).padStart(2, "0") + "/" + String(d.getUTCMonth() + 1).padStart(2, "0") + "/" + d.getUTCFullYear();
  }
  function fmtJour(d) { return d ? JOURS[d.getUTCDay()] + " " + fmtDate(d) : "n/a"; }

  // Dimanche de Pâques, calendrier grégorien (algorithme de Meeus).
  function paques(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mois = Math.floor((h + l - 7 * m + 114) / 31), jour = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(y, mois - 1, jour));
  }
  // Les onze jours fériés nationaux (article L3133-1 du Code du travail).
  function joursFeries(y) {
    var p = paques(y), out = {};
    out[y + "-01-01"] = "Jour de l'an";
    out[iso(addDays(p, 1))] = "Lundi de Pâques";
    out[y + "-05-01"] = "Fête du travail";
    out[y + "-05-08"] = "Victoire 1945";
    out[iso(addDays(p, 39))] = "Ascension";
    out[iso(addDays(p, 50))] = "Lundi de Pentecôte";
    out[y + "-07-14"] = "Fête nationale";
    out[y + "-08-15"] = "Assomption";
    out[y + "-11-01"] = "Toussaint";
    out[y + "-11-11"] = "Armistice 1918";
    out[y + "-12-25"] = "Noël";
    return out;
  }
  function ferie(d) { return joursFeries(d.getUTCFullYear())[iso(d)] || null; }
  function raisonNonOuvrable(d) {
    var w = d.getUTCDay();
    var f = ferie(d);
    if (f) return "un jour férié, " + f;
    if (w === 6) return "un samedi";
    if (w === 0) return "un dimanche";
    return null;
  }
  function proroger(d) {
    var raison = raisonNonOuvrable(d), cur = d;
    while (raisonNonOuvrable(cur)) cur = addDays(cur, 1);
    return { brute: d, date: cur, prorogee: cur.getTime() !== d.getTime(), raison: raison };
  }
  function phraseProrogation(p) {
    return p.prorogee ? " (le " + fmtDate(p.brute) + " tombe " + p.raison + " : report au " + fmtJour(p.date) + ")" : "";
  }

  var STATUT_LABEL = { oui: "Réunies", a_verifier: "À vérifier", non: "Non réunies" };
  var INFO_LABEL = { oui: "donnée à la signature", non: "jamais donnée", tard: "donnée plus tard" };

  function computeRetractation(input) {
    var o = input || {};
    var lieu = pick(o.lieu, LIEUX, "hors");
    var effectif = pick(o.effectif, EFFECTIFS, "0_5");
    var objet = pick(o.objet, OBJETS, "hors_activite");
    var type = pick(o.type, TYPES, "service");
    var exception = pick(o.exception, EXCEPTIONS, "aucune");
    var info = pick(o.info, INFOS, "oui");
    var execution = pick(o.execution, ["non", "oui"], "non");
    var montant = num(o.montant, 0, 100000000, 0);
    var paiementMontant = num(o.paiementMontant, 0, 100000000, 0);
    var pct = num(o.pct, 0, 100, 0);
    var conclusion = parseDate(o.conclusion);
    var reception = parseDate(o.reception);
    var dateInfo = parseDate(o.dateInfo);
    var paiementDate = parseDate(o.paiementDate);

    var motifs = [];
    if (lieu === "distance") motifs.push("contrat conclu à distance, sans rencontre hors de vos locaux");
    if (lieu === "locaux") motifs.push("contrat signé dans vos locaux sans sollicitation extérieure");
    if (effectif === "plus_5") motifs.push("client de plus de cinq salariés");
    if (objet === "activite") motifs.push("contrat dans le champ de son activité principale");
    var statut = motifs.length ? "non" : (effectif === "inconnu" || objet === "doute") ? "a_verifier" : "oui";

    var valide = !!conclusion;
    var applicable = valide && statut !== "non";
    var debut = null, pInit = null, pProl = null, finInitiale = null, finProlongee = null, fin = null, mode = null, pTard = null;
    if (applicable) {
      debut = type === "service" ? conclusion : reception;
      if (debut && debut.getTime() < conclusion.getTime()) debut = conclusion;
    }
    if (applicable && debut) {
      pInit = proroger(addDays(debut, 14));
      finInitiale = pInit.date;
      pProl = proroger(addMonths(finInitiale, 12));
      finProlongee = pProl.date;
      if (info === "oui") { fin = finInitiale; mode = "initial"; }
      else if (info === "non" || !dateInfo) { fin = finProlongee; mode = "prolonge"; }
      else if (dateInfo.getTime() <= conclusion.getTime()) { fin = finInitiale; mode = "initial"; }
      else if (dateInfo.getTime() > finProlongee.getTime()) { fin = finProlongee; mode = "prolonge"; }
      else {
        pTard = proroger(addDays(dateInfo, 14));
        fin = pTard.date.getTime() > finInitiale.getTime() ? pTard.date : finInitiale;
        mode = "info_tardive";
      }
    }
    var finSept = valide ? addDays(conclusion, 7) : null;
    var paiementDes = valide ? addDays(conclusion, 8) : null;
    var paiementTrop = applicable && paiementMontant > 0 && !!paiementDate && paiementDate.getTime() <= finSept.getTime();
    var du = type === "service" ? (execution === "oui" ? r2(montant * pct / 100) : 0) : null;
    var solde = r2(Math.max(0, paiementMontant - (du || 0)));
    var dureeJours = fin ? diffDays(conclusion, fin) : null;

    var etat, verdict;
    if (!valide) {
      etat = "neutral"; verdict = "Renseignez la date de signature du contrat.";
    } else if (statut === "non") {
      etat = "neutral"; verdict = "L'article L221-3 ne semble pas jouer : " + motifs.join(", ") + ". Le contrat suit alors le droit commun entre professionnels, sans délai de rétractation légal. Vérifiez quand même vos propres conditions générales.";
    } else if (paiementTrop) {
      etat = "bad"; verdict = "Encaissement trop tôt : " + fmtEur(paiementMontant) + " reçus le " + fmtDate(paiementDate) + ", alors qu'aucun paiement ne peut être exigé ni reçu avant la fin du délai de sept jours, le " + fmtDate(finSept) + " (L221-10). Rendez la somme ou faites valider la situation par un juriste.";
    } else if (!debut) {
      etat = "warn"; verdict = "Pour une vente, le délai de 14 jours part de la réception du bien. Renseignez la date de livraison ou de pose. Le client peut déjà se rétracter dès la signature.";
    } else if (mode === "prolonge") {
      etat = "warn"; verdict = "Sans information sur la rétractation, le délai est prolongé de douze mois : le client peut se rétracter jusqu'au " + fmtJour(fin) + phraseProrogation(pProl) + ". Envoyez l'information et le formulaire maintenant : le délai finira 14 jours après leur réception.";
    } else if (mode === "info_tardive") {
      etat = "warn"; verdict = "Information donnée le " + fmtDate(dateInfo) + " : le délai finit le " + fmtJour(fin) + (fin === finInitiale ? ", à la fin du délai initial" : ", 14 jours après la réception de l'information" + phraseProrogation(pTard)) + ".";
    } else if (exception === "sur_mesure") {
      etat = "warn"; verdict = "Si le bien est vraiment fabriqué selon les spécifications du client ou nettement personnalisé, il n'y a pas de droit de rétractation (L221-28, 3°). Sinon, le délai finit le " + fmtJour(fin) + ". En cas de doute, raisonnez comme si le droit existait.";
    } else if (statut === "a_verifier") {
      etat = "warn"; verdict = "Une condition reste à vérifier (effectif ou activité principale). Si elle est remplie, le client peut se rétracter jusqu'au " + fmtJour(fin) + phraseProrogation(pInit) + ".";
    } else {
      etat = "ok"; verdict = "Le client peut se rétracter jusqu'au " + fmtJour(fin) + " inclus" + phraseProrogation(pInit) + ". Après cette date, le contrat tient.";
    }

    var calendrier = [];
    if (valide) {
      calendrier.push({ date: iso(conclusion), texte: applicable ? "Signature du contrat. Le client peut se rétracter dès ce jour." : "Signature du contrat. Sans les trois conditions de L221-3, pas de délai de rétractation légal." });
      if (applicable) {
        calendrier.push({ date: iso(finSept), texte: "Fin du délai de sept jours sans paiement (L221-10)." });
        calendrier.push({ date: iso(paiementDes), texte: "Premier jour où un paiement peut être demandé ou reçu." });
        if (type === "vente" && debut) calendrier.push({ date: iso(debut), texte: "Réception du bien : départ du délai de 14 jours." });
        if (finInitiale) calendrier.push({ date: iso(finInitiale), texte: "Fin du délai de 14 jours" + (pInit.prorogee ? ", reportée : le " + fmtDate(pInit.brute) + " tombe " + pInit.raison : "") + "." });
        if (mode === "info_tardive") calendrier.push({ date: iso(dateInfo), texte: "Information sur la rétractation reçue par le client." });
        if (fin && fin !== finInitiale) calendrier.push({ date: iso(fin), texte: mode === "prolonge" ? "Fin du délai prolongé de douze mois (L221-20)." : "Fin du délai, 14 jours après l'information (L221-20)." });
      }
      calendrier.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    }

    var conseils = [];
    conseils.push("Les trois conditions sont cumulatives : signature hors établissement, client de cinq salariés au plus, contrat hors de son activité principale. Une seule manque et l'article L221-3 ne joue pas.");
    conseils.push("Un contrat signé par internet ou par téléphone sans rencontre préalable n'ouvre pas ce droit au professionnel. En revanche, une signature par e-mail juste après la visite du commercial reste un contrat hors établissement.");
    conseils.push("Remettez à la signature un exemplaire daté du contrat, avec les conditions de rétractation et le formulaire type. Sans eux, le contrat peut être annulé (L242-1) et le délai court douze mois de plus.");
    conseils.push("Pas d'acompte le jour de la visite : rien ne peut être exigé ni reçu avant la fin du délai de sept jours. Le premier encaissement possible ici : " + (paiementDes ? fmtDate(paiementDes) : "n/a") + ".");
    conseils.push("Pour démarrer un service pendant le délai, faites signer une demande expresse sur papier ou sur un support durable. Sans elle, le client qui se rétracte ne doit rien pour la part exécutée (L221-25).");
    conseils.push("QuoteBuilder ne gère ni la signature, ni l'encaissement, ni le délai de rétractation : son récapitulatif PDF est un document indicatif, non contractuel. Les mentions vont dans votre devis final et vos conditions générales.");

    var recap = [
      "Délai de rétractation hors établissement (contrat entre professionnels)",
      "Conditions de l'article L221-3 : " + STATUT_LABEL[statut] + (motifs.length ? " (" + motifs.join(", ") + ")" : ""),
      "Contrat : " + (type === "service" ? "prestation de services" : "vente de biens") + ", signé le " + fmtDate(conclusion) + (type === "vente" ? ", bien reçu le " + fmtDate(reception) : ""),
      "Début du délai : " + (debut ? fmtDate(debut) + " (jour non compté)" : "n/a"),
      "Fin du délai de 14 jours : " + (finInitiale ? fmtJour(finInitiale) + phraseProrogation(pInit) : "n/a"),
      "Information sur la rétractation : " + INFO_LABEL[info] + (mode === "info_tardive" ? " le " + fmtDate(dateInfo) : "") + ", fin effective : " + (fin ? fmtJour(fin) : "n/a"),
      applicable ? "Aucun paiement jusqu'au " + fmtDate(finSept) + ", premier encaissement possible le " + fmtDate(paiementDes) : "Délai de sept jours sans paiement : sans objet",
      "Prix : " + fmtHt(montant) + ", encaissé : " + fmtEur(paiementMontant) + ", part exécutée due : " + (du == null ? "n/a (vente)" : fmtEur(du)) + ", à rendre : " + fmtEur(solde),
      "Calcul : quotebuilder.co/outils/calculateur-delai-retractation-hors-etablissement"
    ].join("\n");

    return {
      lieu: lieu, effectif: effectif, objet: objet, type: type, exception: exception, info: info, execution: execution,
      montant: montant, paiementMontant: paiementMontant, pct: pct,
      valide: valide, statut: statut, motifs: motifs, applicable: applicable,
      conclusion: iso(conclusion), reception: iso(reception), debut: iso(debut),
      finBrute: pInit ? iso(pInit.brute) : null, finInitiale: iso(finInitiale), prorogee: pInit ? pInit.prorogee : false, raison: pInit ? pInit.raison : null,
      finProlongee: iso(finProlongee), fin: iso(fin), mode: mode, dureeJours: dureeJours,
      finSept: iso(finSept), paiementDes: iso(paiementDes), paiementTrop: paiementTrop, du: du, solde: solde,
      calendrier: calendrier, etat: etat, verdict: verdict, conseils: conseils, recap: recap
    };
  }
  function buildRecap(input) { return computeRetractation(input).recap; }

export { LIEUX, EFFECTIFS, OBJETS, TYPES, INFOS, EXCEPTIONS, DEFAULTS, computeRetractation, buildRecap, parseDate, addDays, addMonths, paques, joursFeries, proroger, fmtDate, fmtJour, fmtEur, fmtHt, iso };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = ["lieu", "effectif", "objet", "type", "exception", "conclusion", "reception", "info", "dateInfo", "montant", "paiementMontant", "paiementDate", "execution", "pct"];
    function read() { var o = {}; ids.forEach(function (k) { o[k] = $(k).value; }); return o; }
    function render() {
      var r = computeRetractation(read());
      $("statut").textContent = STATUT_LABEL[r.statut];
      $("debut").textContent = r.debut ? fmtDate(parseDate(r.debut)) : "n/a";
      $("finInitiale").textContent = r.finInitiale ? fmtJour(parseDate(r.finInitiale)) : "n/a";
      $("fin").textContent = r.fin ? fmtJour(parseDate(r.fin)) : "n/a";
      $("finSept").textContent = r.applicable ? fmtDate(parseDate(r.finSept)) : "n/a";
      $("paiementDes").textContent = r.applicable ? fmtDate(parseDate(r.paiementDes)) : "n/a";
      $("du").textContent = r.du == null ? "n/a (vente)" : fmtEur(r.du);
      $("solde").textContent = fmtEur(r.solde);
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("calendrier"); tb.innerHTML = "";
      r.calendrier.forEach(function (l) {
        var tr = document.createElement("tr");
        [fmtJour(parseDate(l.date)), l.texte].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
        tb.appendChild(tr);
      });
      var ul = $("conseils"); ul.innerHTML = "";
      r.conseils.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
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
