/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-exception-inexecution";
  var ROLE_LABELS = { prestataire: "prestataire qui rédige la clause", client: "client qui relit la clause" };
  var VOIE_LABELS = { "1219": "article 1219 (refus réactif)", "1220": "article 1220 (suspension anticipée)", aucune: "voie non tranchée" };
  var MANQUEMENT_LABELS = {
    impayeAcompte: "impayé d'acompte",
    impayeSolde: "impayé de solde",
    nonReception: "non-réception sans motif",
    nonFourniture: "non-fourniture / non-pose",
    retardsRepetes: "retards répétés",
    annonceExpresse: "annonce expresse de non-exécution",
    defaillanceConnue: "défaillance connue documentée",
    autre: "autre manquement"
  };
  var GRAVITE_LABELS = { legere: "légère", moyenne: "moyenne", suffisante: "suffisamment grave", tresGrave: "très grave" };
  var INEXEC_LABELS = { oui: "inexécution actuelle constatée", partielle: "inexécution partielle", non: "pas d'inexécution actuelle" };
  var MANIFESTE_LABELS = { oui: "caractère manifeste", doute: "caractère discutable", non: "pas manifeste" };
  var CONSEQ_LABELS = { oui: "conséquences suffisamment graves", non: "conséquences non caractérisées" };
  var NOTIFICATION_LABELS = { ouiDate: "notification écrite datée", ouiSansDate: "notification sans date claire", non: "pas de notification" };
  var RECIPROQUE_LABELS = { oui: "obligations réciproques", non: "lien réciproque faible ou absent" };
  var PROPORTION_LABELS = { partielle: "suspension partielle", totale: "suspension totale", excessive: "suspension excessive" };
  var MISE_LABELS = { oui: "mise en demeure faite", non: "pas de mise en demeure", inutile: "mise en demeure jugée inutile (bonne pratique)" };
  var ACCEPTATION_LABELS = { signee: "CGV jointes au devis signé", transmise: "CGV transmises, acceptation discutable", jamais: "CGV jamais transmises" };
  var CONTINUE_LABELS = { oui: "relation poursuivie sans réserve", non: "suspension affichée" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var DEFAULTS = {
    role: "prestataire",
    voie: "1219",
    manquement: "impayeAcompte",
    gravite: "suffisante",
    inexecutionActuelle: "oui",
    caractereManifeste: "doute",
    consequencesGraves: "oui",
    notification: "ouiDate",
    delaiNotifJours: 1,
    dateEvenement: "2026-12-20",
    dateNotification: "2026-12-21",
    obligationsReciproques: "oui",
    proportionSuspension: "partielle",
    miseEnDemeure: "non",
    acceptationCgv: "signee",
    continueRelation: "non"
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
  function computeExceptionInexecution(input) {
    var d = {};
    for (var key in DEFAULTS) d[key] = input && input[key] !== undefined ? input[key] : DEFAULTS[key];
    d.role = pick(d.role, ROLE_LABELS, "prestataire");
    d.voie = pick(d.voie, VOIE_LABELS, "1219");
    d.manquement = pick(d.manquement, MANQUEMENT_LABELS, "impayeAcompte");
    d.gravite = pick(d.gravite, GRAVITE_LABELS, "suffisante");
    d.inexecutionActuelle = pick(d.inexecutionActuelle, INEXEC_LABELS, "oui");
    d.caractereManifeste = pick(d.caractereManifeste, MANIFESTE_LABELS, "doute");
    d.consequencesGraves = pick(d.consequencesGraves, CONSEQ_LABELS, "oui");
    d.notification = pick(d.notification, NOTIFICATION_LABELS, "ouiDate");
    d.obligationsReciproques = pick(d.obligationsReciproques, RECIPROQUE_LABELS, "oui");
    d.proportionSuspension = pick(d.proportionSuspension, PROPORTION_LABELS, "partielle");
    d.miseEnDemeure = pick(d.miseEnDemeure, MISE_LABELS, "non");
    d.acceptationCgv = pick(d.acceptationCgv, ACCEPTATION_LABELS, "signee");
    d.continueRelation = pick(d.continueRelation, CONTINUE_LABELS, "non");
    d.delaiNotifJours = num(d.delaiNotifJours, 0, 365, 0);
    var dateE = parseDate(d.dateEvenement) || parseDate(DEFAULTS.dateEvenement);
    var dateN = parseDate(d.dateNotification) || parseDate(DEFAULTS.dateNotification);
    d.dateEvenement = dateE.y + "-" + String(dateE.m).padStart(2, "0") + "-" + String(dateE.d).padStart(2, "0");
    d.dateNotification = dateN.y + "-" + String(dateN.m).padStart(2, "0") + "-" + String(dateN.d).padStart(2, "0");

    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    var regime = d.voie;
    var regimeLabel = d.voie === "1219" ? "Exception 1219 (réactive)" : (d.voie === "1220" ? "Exception 1220 (anticipée)" : "À trancher");

    // 1 Voie
    if (d.voie === "aucune") {
      add("Voie", "warn", "Choisissez 1219 (inexécution actuelle) ou 1220 (inexécution manifeste à l'échéance).");
      regimeLabel = "À trancher";
    } else if (d.voie === "1219" && d.manquement === "annonceExpresse" && d.inexecutionActuelle === "non") {
      add("Voie", "warn", "Une annonce expresse sans inexécution actuelle oriente plutôt vers l'article 1220.");
      regime = "1220";
      regimeLabel = "Plutôt 1220 (anticipée)";
    } else if (d.voie === "1220" && d.inexecutionActuelle === "oui" && d.manquement !== "annonceExpresse" && d.manquement !== "defaillanceConnue") {
      add("Voie", "warn", "L'inexécution est déjà là : l'article 1219 est souvent plus adapté que 1220.");
      regimeLabel = "1219 plus adapté ?";
    } else {
      add("Voie", "ok", d.voie === "1219" ? "Voie 1219 : refus face à une inexécution actuelle." : "Voie 1220 : suspension anticipée avec notification.");
    }

    // 2 Gravité
    if (d.gravite === "legere") {
      add("Gravité", "bad", "Une gravité légère peine à fonder l'exception (« suffisamment grave »). Risque d'abus.");
    } else if (d.gravite === "moyenne") {
      add("Gravité", "warn", "Gravité moyenne : documentez l'économie du contrat et le caractère essentiel du manquement.");
    } else {
      add("Gravité", "ok", "Gravité " + GRAVITE_LABELS[d.gravite] + " : cohérente avec l'exigence de suffisance (repère outil, pas un seuil légal).");
    }

    // 3 Inexécution actuelle (1219)
    if (d.voie === "1219" || regime === "1219") {
      if (d.inexecutionActuelle === "non") {
        add("Inexécution actuelle (1219)", "bad", "Sans inexécution actuelle, l'article 1219 ne s'applique pas. Regardez 1220.");
      } else if (d.inexecutionActuelle === "partielle") {
        add("Inexécution actuelle (1219)", "warn", "Inexécution partielle : la proportionnalité de la suspension devient décisive.");
      } else {
        add("Inexécution actuelle (1219)", "ok", "Inexécution actuelle constatée, condition de l'article 1219.");
      }
    } else {
      add("Inexécution actuelle (1219)", "info", "Sans objet prioritaire sous 1220 (on regarde le caractère manifeste).");
    }

    // 4 Caractère manifeste (1220)
    if (d.voie === "1220" || regime === "1220") {
      if (d.caractereManifeste === "non") {
        add("Caractère manifeste (1220)", "bad", "Sans caractère manifeste, l'article 1220 ne s'applique pas.");
      } else if (d.caractereManifeste === "doute") {
        add("Caractère manifeste (1220)", "warn", "Caractère discutable : obtenez une confirmation écrite avant de suspendre.");
      } else {
        add("Caractère manifeste (1220)", "ok", "Caractère manifeste affirmé : condition de l'article 1220.");
      }
    } else {
      add("Caractère manifeste (1220)", "info", "Sans objet prioritaire sous 1219.");
    }

    // 5 Conséquences
    if (d.voie === "1220" || regime === "1220") {
      if (d.consequencesGraves === "non") {
        add("Conséquences", "bad", "L'article 1220 exige des conséquences suffisamment graves pour vous.");
      } else {
        add("Conséquences", "ok", "Conséquences suffisamment graves affirmées (1220).");
      }
    } else {
      add("Conséquences", d.gravite === "legere" ? "warn" : "ok",
        d.gravite === "legere" ? "Sous 1219, la gravité de l'inexécution reste le critère central." : "Sous 1219, la gravité porte sur l'inexécution elle-même.");
    }

    // 6 Notification
    if (d.voie === "1220" || regime === "1220") {
      if (d.notification === "non") {
        add("Notification", "bad", "Sous 1220, la suspension doit être notifiée dans les meilleurs délais.");
      } else if (d.notification === "ouiSansDate") {
        add("Notification", "warn", "Notification sans date claire : fragilise la preuve des « meilleurs délais ».");
      } else {
        add("Notification", "ok", "Notification écrite datée (exigence 1220).");
      }
    } else {
      if (d.notification === "non") {
        add("Notification", "warn", "Sous 1219, la mise en demeure n'est pas toujours obligatoire (Cass. 3e civ. 18 sept. 2025, n° 23-24.005), mais une information écrite reste une bonne pratique.");
      } else {
        add("Notification", "ok", "Information écrite présente (bonne pratique sous 1219).");
      }
    }

    // 7 Délai notification
    if (d.notification === "ouiDate" || d.notification === "ouiSansDate") {
      if (d.delaiNotifJours > 15) {
        add("Délai notification", "warn", "Délai de " + d.delaiNotifJours + " jours : au-delà du repère outil de quinze jours (pas un seuil légal).");
      } else {
        add("Délai notification", "ok", "Délai de " + d.delaiNotifJours + " jour" + (d.delaiNotifJours > 1 ? "s" : "") + " (repère outil : quinze jours).");
      }
    } else {
      add("Délai notification", d.voie === "1220" ? "bad" : "info",
        d.voie === "1220" ? "Sans notification, le délai ne peut pas être apprécié sous 1220." : "Pas de notification datée : délai non mesuré.");
    }

    // 8 Réciprocité
    if (d.obligationsReciproques === "non") {
      add("Réciprocité", "bad", "Sans obligations réciproques liées, l'exception d'inexécution est hors sujet.");
    } else {
      add("Réciprocité", "ok", "Lien synallagmatique affirmé entre les obligations.");
    }

    // 9 Proportionnalité
    if (d.proportionSuspension === "excessive") {
      add("Proportionnalité", "bad", "Suspension excessive : risque d'inexécution fautive (article 1231-1).");
    } else if (d.proportionSuspension === "totale" && (d.gravite === "legere" || d.gravite === "moyenne" || d.inexecutionActuelle === "partielle")) {
      add("Proportionnalité", "warn", "Suspension totale alors que le manquement est partiel ou de gravité limitée : justifiez.");
    } else {
      add("Proportionnalité", "ok", PROPORTION_LABELS[d.proportionSuspension] + " cohérente avec les faits déclarés.");
    }

    // 10 CGV
    if (d.acceptationCgv === "jamais") {
      add("CGV/acceptation", "bad", "CGV jamais transmises : clause difficilement opposable (article 1119).");
    } else if (d.acceptationCgv === "transmise") {
      add("CGV/acceptation", "warn", "CGV transmises mais acceptation discutable : sécurisez la mention sur le devis signé.");
    } else {
      add("CGV/acceptation", "ok", "CGV jointes au devis signé avec acceptation.");
    }

    // 11 Risque d'abus
    var abus = false;
    if (d.gravite === "legere" || d.proportionSuspension === "excessive" || d.continueRelation === "oui") abus = true;
    if (abus) {
      add("Risque d'abus", "bad", "Signaux d'abus : gravité faible, suspension excessive ou relation poursuivie sans réserve. Votre refus peut devenir fautif (1231-1).");
    } else if (d.gravite === "moyenne" || d.miseEnDemeure === "non" && d.voie === "1219") {
      add("Risque d'abus", "warn", "Surveillez la bonne foi (article 1104) et documentez. Une mise en demeure écrite reste utile sous 1219.");
    } else {
      add("Risque d'abus", "ok", "Pas de signal fort d'abus sur les réponses données.");
    }

    // 12 Articulation résolution
    add("Articulation résolution", "info", "L'exception suspend ou refuse ; elle ne résout pas. Pour sortir du contrat : articles 1224 à 1226 (clause résolutoire, notification 1226, juge).");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) {
      if (c.statut === "ok") nbOk++;
      else if (c.statut === "warn") nbWarn++;
      else if (c.statut === "bad") nbBad++;
      else nbInfo++;
    });
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");
    var statutLabel = etat === "ok" ? "Prêt" : (etat === "warn" ? "À compléter" : "Bloquant");

    var clauseQuality = "Correcte";
    if (d.acceptationCgv === "jamais") clauseQuality = "Inopposable";
    else if (nbBad > 0) clauseQuality = "Fragile";
    else if (nbWarn === 0 && d.acceptationCgv === "signee") clauseQuality = "Solide";
    else if (nbWarn > 2) clauseQuality = "Fragile";
    else clauseQuality = "Correcte";

    var notifLabel = "Absente";
    if (d.notification === "ouiDate") notifLabel = "Datée (J+" + d.delaiNotifJours + ")";
    else if (d.notification === "ouiSansDate") notifLabel = "Sans date claire";

    var articles = [
      "Article 1. Exception d'inexécution. Les parties rappellent qu'elles peuvent se prévaloir des articles 1219 et 1220 du code civil. En cas d'inexécution suffisamment grave de l'autre, une partie peut refuser d'exécuter son obligation (article 1219), alors même que celle-ci est exigible. Lorsqu'il est manifeste que le cocontractant ne s'exécutera pas à l'échéance et que les conséquences sont suffisamment graves pour elle, une partie peut suspendre l'exécution de son obligation (article 1220).",
      "Article 2. Exemples de manquements. Sans caractère limitatif, sont notamment regardés comme susceptibles d'être suffisamment graves : le défaut de paiement d'un acompte ou d'une échéance contractuelle ; le défaut de réception sans motif légitime ; l'annonce expresse de non-exécution à l'échéance ; la non-fourniture d'un accès ou d'une information indispensable à la prestation.",
      "Article 3. Notification. Toute suspension anticipée fondée sur l'article 1220 est notifiée par écrit dans les meilleurs délais. Toute suspension ou tout refus fondé sur l'article 1219 fait l'objet d'une information écrite datée, sans préjudice des cas où aucune mise en demeure préalable n'est exigée.",
      "Article 4. Proportionnalité et reprise. La suspension porte en priorité sur les prestations non encore exécutées en lien avec le manquement. Elle cesse dès régularisation ou accord écrit de report. Les autres remèdes de l'article 1217 restent ouverts (exécution forcée, réduction du prix, résolution, réparation).",
      "Article 5. Réciprocité. La présente clause joue pour chacune des parties dans les mêmes conditions. Elle ne fait pas obstacle aux articles 1104 et 1171 du code civil."
    ];
    var clause = articles.join("\n\n");

    var actions = [];
    controles.forEach(function (c) {
      if (c.statut === "bad" || c.statut === "warn") actions.push(c.point + " : " + c.texte);
    });
    actions.push("Conserver la preuve (contrat, CGV acceptées, manquement, notification) hors de QuoteBuilder ; le dossier n'a pas de champ dédié.");

    var verdict = "";
    if (etat === "ok") verdict = "Aucun point bloquant. Régime : " + regimeLabel + ". Vous pouvez partir de la clause proposée et l'adapter.";
    else if (etat === "warn") verdict = "Aucun point bloquant, mais " + nbWarn + " point" + (nbWarn > 1 ? "s" : "") + " à compléter. Régime : " + regimeLabel + ".";
    else verdict = nbBad + " point" + (nbBad > 1 ? "s" : "") + " bloquant" + (nbBad > 1 ? "s" : "") + ". Régime affiché : " + regimeLabel + ". Corrigez avant de suspendre ou de refuser.";

    var message = "";
    if (d.role === "client") {
      message = "Bonjour,\n\nAvant de signer, merci de confirmer que vos conditions générales rappellent clairement les articles 1219 et 1220 du code civil (exception d'inexécution), la notification sous 1220, la proportionnalité et la réciprocité.\n\nNous souhaitons éviter une clause unilatérale ou disproportionnée.\n\nCordialement";
    } else {
      message = "Bonjour,\n\nNous nous référons au devis signé et aux conditions générales acceptées.\n\nFaits : " + MANQUEMENT_LABELS[d.manquement] + ", constaté ou annoncé le " + fmtDate(dateE) + ".\n\nSur le fondement de l'article " + (d.voie === "1220" ? "1220" : "1219") + " du code civil" + (d.voie === "1220" ? " (suspension anticipée notifiée dans les meilleurs délais)" : " (refus face à une inexécution actuelle suffisamment grave)") + ", nous " + (d.voie === "1220" ? "suspendons" : "refusons d'exécuter") + " les prestations non encore réalisées en lien avec ce manquement, à compter du " + fmtDate(dateN) + ".\n\nLa reprise interviendra dès régularisation ou accord écrit de report.\n\nTous droits et actions réservés (article 1217).\n\nCordialement";
    }

    var recapLines = [
      "Outil : exception d'inexécution (1219 / 1220)",
      "Position : " + ROLE_LABELS[d.role],
      "Voie : " + VOIE_LABELS[d.voie] + " · Régime : " + regimeLabel,
      "Manquement : " + MANQUEMENT_LABELS[d.manquement] + " · Gravité : " + GRAVITE_LABELS[d.gravite],
      "Inexécution actuelle : " + INEXEC_LABELS[d.inexecutionActuelle] + " · Manifeste : " + MANIFESTE_LABELS[d.caractereManifeste],
      "Dates : événement " + fmtDate(dateE) + " · notification " + fmtDate(dateN),
      "Notification : " + notifLabel + " · Proportion : " + PROPORTION_LABELS[d.proportionSuspension],
      "CGV : " + ACCEPTATION_LABELS[d.acceptationCgv] + " · Réciprocité : " + RECIPROQUE_LABELS[d.obligationsReciproques],
      "Mise en demeure : " + MISE_LABELS[d.miseEnDemeure] + " · Relation : " + CONTINUE_LABELS[d.continueRelation],
      "Contrôles : " + nbOk + " conforme" + (nbOk > 1 ? "s" : "") + ", " + nbWarn + " à compléter, " + nbBad + " bloquant" + (nbBad > 1 ? "s" : "") + ", " + nbInfo + " information" + (nbInfo > 1 ? "s" : ""),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    return {
      role: d.role, voie: d.voie, manquement: d.manquement, gravite: d.gravite,
      inexecutionActuelle: d.inexecutionActuelle, caractereManifeste: d.caractereManifeste,
      consequencesGraves: d.consequencesGraves, notification: d.notification,
      delaiNotifJours: d.delaiNotifJours, dateEvenement: d.dateEvenement, dateNotification: d.dateNotification,
      obligationsReciproques: d.obligationsReciproques, proportionSuspension: d.proportionSuspension,
      miseEnDemeure: d.miseEnDemeure, acceptationCgv: d.acceptationCgv, continueRelation: d.continueRelation,
      regime: regime, regimeLabel: regimeLabel, clauseQuality: clauseQuality, notifLabel: notifLabel,
      controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo,
      etat: etat, statutLabel: statutLabel, verdict: verdict, clause: clause, articles: articles.length,
      actions: actions, message: message, recap: recapLines.join("\n"),
      dateEvenementFmt: fmtDate(dateE), dateNotificationFmt: fmtDate(dateN)
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, ROLE_LABELS, VOIE_LABELS, MANQUEMENT_LABELS, GRAVITE_LABELS, INEXEC_LABELS, MANIFESTE_LABELS, CONSEQ_LABELS, NOTIFICATION_LABELS, RECIPROQUE_LABELS, PROPORTION_LABELS, MISE_LABELS, ACCEPTATION_LABELS, CONTINUE_LABELS, computeExceptionInexecution, buildRecap, fmtDate, addDays, parseDate, num };

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
      var r = computeExceptionInexecution(readForm());
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
