/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var TYPES = ["aucun", "relance", "reconnaissance", "mediation", "justice"];
  var TYPE_LABELS = { aucun: "Aucun", relance: "Relance ou mise en demeure", reconnaissance: "Reconnaissance de la dette", mediation: "Médiation ou conciliation", justice: "Demande en justice" };
  var DUREES = { pro: 5, conso: 2 };
  var BUTOIR_ANS = 20;
  var SEUIL_ALERTE_JOURS = 180;
  var SEUIL_PETITE_CREANCE = 5000;
  var DEFAULTS = {
    debiteur: "pro", clause: 0, dateExecution: "2021-11-30", dateEcheance: "2022-01-14", montant: 3840, dateCalcul: "2026-10-27",
    ev1Type: "relance", ev1Date: "2022-02-10", ev1Fin: "",
    ev2Type: "relance", ev2Date: "2026-09-15", ev2Fin: "",
    ev3Type: "aucun", ev3Date: "", ev3Fin: ""
  };

  function num(v, min, max, fallback) {
    var n = (v === "" || v == null) ? NaN : Number(v);
    if (!isFinite(n)) n = fallback;
    if (n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  }
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
  function addYears(d, n) { return addMonths(d, 12 * n); }
  function diffDays(a, b) { return Math.round((b.getTime() - a.getTime()) / 86400000); }
  function maxDate(a, b) { return a.getTime() >= b.getTime() ? a : b; }
  function fmtDate(d) {
    if (!d) return "n/a";
    return String(d.getUTCDate()).padStart(2, "0") + "/" + String(d.getUTCMonth() + 1).padStart(2, "0") + "/" + d.getUTCFullYear();
  }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) {
    if (n == null || !isFinite(n)) return "n/a";
    var c = Math.round(Math.abs(n) * 100);
    var neg = n < 0 && c !== 0;
    var txt = groupe(Math.floor(c / 100));
    if (c % 100 !== 0) txt += "," + String(c % 100).padStart(2, "0");
    return (neg ? "-" : "") + txt + "\u00a0€";
  }
  function fmtJours(n) { if (n == null || !isFinite(n)) return "n/a"; var a = Math.abs(n); return groupe(a) + (a > 1 ? " jours" : " jour"); }

  // Dernier jour du délai : le jour du point de départ ne compte pas, le délai court du lendemain à 0 h
  // et s'achève à 24 h le jour qui porte le même quantième (articles 2228 et 2229 du Code civil).
  // Pas de report au jour ouvrable suivant : les articles 641 et 642 du CPC ne s'appliquent pas à la prescription.
  function finDelai(depart, annees) {
    if (!depart) return null;
    return addDays(addYears(addDays(depart, 1), annees), -1);
  }

  function dureeApplicable(debiteur, clause) {
    if (debiteur === "conso") return { annees: DUREES.conso, source: "L218-2 du Code de la consommation", clauseIgnoree: clause > 0 };
    if (clause >= 1 && clause <= 10) return { annees: clause, source: "clause du contrat (article 2254 du Code civil)", clauseIgnoree: false };
    return { annees: DUREES.pro, source: "L110-4 du Code de commerce et 2224 du Code civil", clauseIgnoree: false };
  }

  function lireEvenements(o) {
    var evs = [];
    for (var i = 1; i <= 3; i++) {
      var t = o["ev" + i + "Type"];
      if (TYPES.indexOf(t) < 0) t = "aucun";
      if (t === "aucun") continue;
      var d = parseDate(o["ev" + i + "Date"]);
      if (!d) continue;
      var f = t === "mediation" ? parseDate(o["ev" + i + "Fin"]) : null;
      if (f && f.getTime() < d.getTime()) f = null;
      evs.push({ rang: i, type: t, date: d, fin: f });
    }
    evs.sort(function (a, b) { return a.date.getTime() - b.date.getTime() || a.rang - b.rang; });
    return evs;
  }

  // Déroule les événements dans l'ordre des dates à partir d'un point de départ.
  function scenario(depart, annees, evs) {
    var fin = finDelai(depart, annees);
    var lignes = [{ date: depart, evenement: "Point de départ", effet: "Le délai de " + annees + " ans commence à courir le lendemain", fin: fin }];
    var etat = "courant";
    var prolonge = false;
    var prescritLe = null;
    for (var i = 0; i < evs.length; i++) {
      var e = evs[i];
      var label = TYPE_LABELS[e.type];
      if (etat !== "courant") { lignes.push({ date: e.date, evenement: label, effet: "Non pris en compte : le délai est déjà arrêté", fin: null }); continue; }
      if (e.date.getTime() < depart.getTime()) { lignes.push({ date: e.date, evenement: label, effet: "Antérieur au point de départ : sans effet sur ce calcul", fin: fin }); continue; }
      if (e.date.getTime() > fin.getTime()) {
        prescritLe = prescritLe || fin;
        lignes.push({ date: e.date, evenement: label, effet: "Trop tard : la créance était déjà prescrite à cette date", fin: fin });
        continue;
      }
      if (e.type === "relance") {
        lignes.push({ date: e.date, evenement: label, effet: "Aucun : une relance ou une mise en demeure n'interrompt pas la prescription", fin: fin });
      } else if (e.type === "reconnaissance") {
        fin = finDelai(e.date, annees); prolonge = true;
        lignes.push({ date: e.date, evenement: label, effet: "Interruption : un nouveau délai de " + annees + " ans repart en entier (articles 2231 et 2240)", fin: fin });
      } else if (e.type === "mediation") {
        var reste = diffDays(e.date, fin);
        if (!e.fin) {
          etat = "suspendu";
          lignes.push({ date: e.date, evenement: label, effet: "Suspension en cours : il restera " + fmtJours(reste) + " à la fin de la médiation, et au moins six mois (article 2238)", fin: null });
        } else {
          var finReprise = addDays(e.fin, reste);
          var finMin = addMonths(e.fin, 6);
          fin = maxDate(finReprise, finMin); prolonge = true;
          lignes.push({ date: e.date, evenement: label + " (jusqu'au " + fmtDate(e.fin) + ")", effet: "Suspension : le délai reprend après la fin, pour " + fmtJours(reste) + " et au moins six mois (article 2238)", fin: fin });
        }
      } else if (e.type === "justice") {
        etat = "instance";
        lignes.push({ date: e.date, evenement: label, effet: "Interruption jusqu'à la fin de l'instance (articles 2241 et 2242)", fin: null });
      }
    }
    var butoir = finDelai(depart, BUTOIR_ANS);
    var butoirApplique = false;
    if (etat === "courant" && prolonge && fin.getTime() > butoir.getTime()) {
      fin = butoir; butoirApplique = true;
      lignes.push({ date: butoir, evenement: "Délai butoir", effet: "Vingt ans après le point de départ, même avec suspension ou reconnaissance (article 2232)", fin: fin });
    }
    return { depart: depart, fin: etat === "courant" ? fin : null, etat: etat, lignes: lignes, butoirApplique: butoirApplique, prescritLe: prescritLe };
  }

  function computePrescription(input) {
    var o = input || {};
    var debiteur = o.debiteur === "conso" ? "conso" : "pro";
    var clause = Math.round(num(o.clause, 0, 10, 0));
    var dateExecution = parseDate(o.dateExecution);
    var dateEcheance = parseDate(o.dateEcheance);
    var dateCalcul = parseDate(o.dateCalcul);
    var montant = num(o.montant, 0, 100000000, 0);
    var d = dureeApplicable(debiteur, clause);
    var evs = lireEvenements(o);

    if (dateEcheance && dateExecution && dateEcheance.getTime() < dateExecution.getTime()) dateEcheance = dateExecution;
    var departEcheance = dateEcheance || dateExecution;
    var valide = !!(departEcheance && dateCalcul);

    var sE = valide ? scenario(departEcheance, d.annees, evs) : null;
    var sX = valide && dateExecution ? scenario(dateExecution, d.annees, evs) : sE;
    var finEcheance = sE ? sE.fin : null;
    var finExecution = sX ? sX.fin : null;
    var etatDelai = sE ? (sE.etat === "courant" && sX.etat === "courant" ? "courant" : (sE.etat !== "courant" ? sE.etat : sX.etat)) : null;
    var finProche = (finEcheance && finExecution) ? (finExecution.getTime() < finEcheance.getTime() ? finExecution : finEcheance) : (finEcheance || finExecution);
    var joursRestants = (valide && finProche) ? diffDays(dateCalcul, finProche) : null;
    var joursEcheance = (valide && finEcheance) ? diffDays(dateCalcul, finEcheance) : null;

    var etat, verdict;
    if (!valide) {
      etat = "neutral"; verdict = "Renseignez au moins la date d'exécution ou l'échéance de paiement, et la date du calcul.";
    } else if (etatDelai === "instance") {
      etat = "neutral"; verdict = "Une demande en justice a été faite avant la fin du délai : la prescription est interrompue jusqu'à la fin de l'instance. Un nouveau délai repartira ensuite ; si le juge vous donne raison, c'est le jugement qui s'exécute.";
    } else if (etatDelai === "suspendu") {
      etat = "neutral"; verdict = "La médiation ou la conciliation est en cours : la prescription est suspendue. Notez la date de fin quand elle sera déclarée, le délai repartira pour au moins six mois.";
    } else if (joursEcheance < 0) {
      etat = "bad"; verdict = "Au " + fmtDate(dateCalcul) + ", la créance est prescrite selon les deux points de départ (fin du délai le " + fmtDate(finEcheance) + "). Le client peut opposer la prescription. Seule une renonciation de sa part, sans équivoque, changerait la donne.";
    } else if (joursRestants < 0) {
      etat = "bad"; verdict = "Si le juge retient la date d'exécution, le délai a pris fin le " + fmtDate(finExecution) + ". Avec l'échéance de la facture, il court jusqu'au " + fmtDate(finEcheance) + ". La créance est contestable : agissez sans attendre et faites valider le point de départ par un avocat.";
    } else if (joursRestants <= SEUIL_ALERTE_JOURS) {
      etat = "warn"; verdict = "Il reste " + fmtJours(joursRestants) + " avant le " + fmtDate(finProche) + ". Une nouvelle relance ou une mise en demeure ne prolongera rien : obtenez une reconnaissance écrite ou engagez une procédure avant cette date.";
    } else {
      etat = "ok"; verdict = "Il reste " + fmtJours(joursRestants) + " avant le " + fmtDate(finProche) + ". Le délai n'est pas une raison d'attendre : plus une facture vieillit, moins elle se recouvre.";
    }

    var procedures = [];
    procedures.push("Injonction de payer : quel que soit le montant, sur requête et sans audience. Tribunal de commerce (ou des activités économiques) si vous et votre client êtes commerçants, avec 33,47\u00a0€ de frais de greffe ; tribunal judiciaire sinon. L'ordonnance doit être signifiée dans les trois mois depuis le 1er septembre 2026.");
    if (montant > 0 && montant <= SEUIL_PETITE_CREANCE) {
      procedures.push(debiteur === "conso"
        ? "Procédure simplifiée de recouvrement des petites créances : possible jusqu'à 5\u00a0000\u00a0€, par un commissaire de justice. Le client a un mois pour accepter ; son accord suspend la prescription."
        : "Procédure simplifiée de recouvrement des petites créances : jusqu'à 5\u00a0000\u00a0€, par un commissaire de justice, mais pas pour une créance commerciale facturée entre commerçants. Le client a un mois pour accepter ; son accord suspend la prescription.");
    } else if (montant > SEUIL_PETITE_CREANCE) {
      procedures.push("Procédure simplifiée de recouvrement des petites créances : non, le montant dépasse 5\u00a0000\u00a0€.");
    }
    if (debiteur === "pro") {
      var applicable = dateCalcul && dateCalcul.getTime() >= Date.UTC(2027, 0, 1);
      procedures.push(applicable
        ? "Recouvrement des créances commerciales incontestées (entre commerçants, sans plafond, par commissaire de justice) : prévu pour s'appliquer au plus tard le 31 décembre 2026. Vérifiez l'arrêté de mise en œuvre."
        : "Recouvrement des créances commerciales incontestées (entre commerçants, sans plafond, par commissaire de justice) : créé par la loi du 23 avril 2026, pas encore applicable, en attente d'un arrêté et au plus tard le 31 décembre 2026.");
    }
    procedures.push("Assignation en paiement : la voie classique si le client conteste la dette, avec avocat obligatoire au-delà de 10\u00a0000\u00a0€.");

    var conseils = [];
    if (valide && finEcheance && finExecution && iso(finEcheance) !== iso(finExecution)) {
      conseils.push("Deux dates, parce que les juges n'ont pas toujours retenu le même point de départ : l'échéance de paiement de la facture (" + fmtDate(finEcheance) + ") ou l'exécution de la prestation (" + fmtDate(finExecution) + "). Calez votre agenda sur la plus proche.");
    } else if (valide) {
      conseils.push("Le délai se compte en jours. Il finit à minuit le jour qui porte le même quantième que le point de départ, sans report si ce jour tombe un week-end ou un jour férié.");
    } else {
      conseils.push("Le point de départ est la date à laquelle vous pouviez réclamer le paiement : en principe l'échéance de la facture, à défaut l'exécution de la prestation.");
    }
    conseils.push("Une relance, même par lettre recommandée avec accusé de réception, n'interrompt pas la prescription. La Cour de cassation l'a rappelé le 18 mai 2022 (n° 20-23.204).");
    conseils.push(evs.some(function (e) { return e.type === "reconnaissance"; })
      ? "Gardez la preuve de la reconnaissance : relevé du virement partiel, échéancier signé, courriel où le client admet devoir la somme. C'est elle qui fait repartir le délai."
      : "Un paiement partiel, un échéancier accepté ou un courriel où le client reconnaît la dette fait repartir le délai en entier. Demandez-le par écrit et gardez-le.");
    conseils.push("Une médiation ou une conciliation convenue par écrit après le litige suspend le délai ; de simples négociations, non. Si vous négociez près de l'échéance, mettez-vous d'accord par écrit sur une médiation.");
    conseils.push("Pour agir, il faudra prouver la créance : devis accepté, bon de commande, procès-verbal de réception ou bon de livraison, facture, échanges. Rassemblez-les avant de saisir le commissaire de justice ou le tribunal.");
    conseils.push("QuoteBuilder ne fait ni facture, ni encaissement, ni suivi d'échéance : la date de paiement est sur votre facture, pas dans le logiciel. Le dossier de la demande garde les réponses du client, ses fichiers et vos notes internes, utiles pour retrouver ce qui a été demandé.");

    var evTxt = evs.length ? evs.map(function (e) { return TYPE_LABELS[e.type].toLowerCase() + " le " + fmtDate(e.date) + (e.type === "mediation" && e.fin ? " (fin le " + fmtDate(e.fin) + ")" : ""); }).join(", ") : "aucun";
    var recap = [
      "Prescription d'une facture impayée (calcul indicatif)",
      "Client : " + (debiteur === "conso" ? "consommateur" : "professionnel") + ", délai de " + d.annees + " ans (" + d.source + ")",
      "Montant restant dû : " + fmtEur(montant),
      "Exécution : " + fmtDate(dateExecution) + ", échéance de paiement : " + fmtDate(dateEcheance),
      "Événements : " + evTxt,
      "Fin du délai, point de départ à l'échéance : " + (finEcheance ? fmtDate(finEcheance) : (etatDelai === "instance" ? "interrompu, instance en cours" : (etatDelai === "suspendu" ? "suspendu, médiation en cours" : "n/a"))),
      "Fin du délai par prudence, point de départ à l'exécution : " + (finExecution ? fmtDate(finExecution) : (etatDelai === "instance" ? "interrompu, instance en cours" : (etatDelai === "suspendu" ? "suspendu, médiation en cours" : "n/a"))),
      "Au " + fmtDate(dateCalcul) + " : " + (joursRestants == null ? "pas de date limite calculable" : (joursRestants < 0 ? "dépassé de " + fmtJours(joursRestants) + " sur la date la plus proche" : fmtJours(joursRestants) + " avant la date la plus proche")),
      "Calcul : quotebuilder.co/outils/calculateur-prescription-facture-impayee"
    ].join("\n");

    return {
      debiteur: debiteur, clause: clause, annees: d.annees, source: d.source, clauseIgnoree: d.clauseIgnoree, montant: montant,
      valide: valide, dateExecution: dateExecution, dateEcheance: dateEcheance, dateCalcul: dateCalcul, evenements: evs,
      finEcheance: finEcheance, finExecution: finExecution, finProche: finProche, joursRestants: joursRestants, joursEcheance: joursEcheance,
      etatDelai: etatDelai, butoirApplique: !!(sE && sE.butoirApplique) || !!(sX && sX.butoirApplique),
      calendrier: sE ? sE.lignes : [], etat: etat, verdict: verdict, procedures: procedures, conseils: conseils, recap: recap
    };
  }
  function buildRecap(input) { return computePrescription(input).recap; }

export { TYPES, TYPE_LABELS, DUREES, BUTOIR_ANS, SEUIL_ALERTE_JOURS, SEUIL_PETITE_CREANCE, DEFAULTS, computePrescription, buildRecap, scenario, finDelai, dureeApplicable, lireEvenements, parseDate, iso, addDays, addMonths, addYears, diffDays, fmtDate, fmtEur, fmtJours };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = ["debiteur", "clause", "dateExecution", "dateEcheance", "montant", "dateCalcul", "ev1Type", "ev1Date", "ev1Fin", "ev2Type", "ev2Date", "ev2Fin", "ev3Type", "ev3Date", "ev3Fin"];
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
      var r = computePrescription(read());
      $("duree").textContent = r.annees + " ans, " + r.source + (r.clauseIgnoree ? " (clause ignorée contre un consommateur)" : "");
      $("finEcheance").textContent = r.finEcheance ? fmtDate(r.finEcheance) : "n/a";
      $("finExecution").textContent = r.finExecution ? fmtDate(r.finExecution) : "n/a";
      $("joursRestants").textContent = r.joursRestants == null ? "n/a" : (r.joursRestants < 0 ? "dépassé de " + fmtJours(r.joursRestants) : fmtJours(r.joursRestants));
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("calendrier"); tb.innerHTML = "";
      r.calendrier.forEach(function (l) { row(tb, [fmtDate(l.date), l.evenement, l.effet, l.fin ? fmtDate(l.fin) : "n/a"], /Interruption|Suspension/.test(l.effet) ? "cur" : (/Trop tard/.test(l.effet) ? "weak" : "")); });
      list("procedures", r.procedures);
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
