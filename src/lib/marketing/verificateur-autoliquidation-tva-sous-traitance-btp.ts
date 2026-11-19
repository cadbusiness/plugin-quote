/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var TAUX_AMENDE = 5;
  var TAUX_TVA = [20, 10, 5.5];
  var DATE_CIBS = "2027-01-01";
  var DATE_FIN_REF_CGI = "2028-06-30";
  var ROLE_LABELS = { soustraitant: "sous-traitant", principale: "entreprise principale", direct: "entreprise qui facture directement le maître d'ouvrage" };
  var PRENEUR_LABELS = { assujetti: "entreprise assujettie à la TVA", nonAssujetti: "client non assujetti à la TVA" };
  var REGIME_LABELS = { reel: "sous-traitant redevable de la TVA", franchise: "sous-traitant en franchise en base" };
  var DOCUMENT_LABELS = { devis: "devis accepté ou bon de commande signé", contrat: "contrat de sous-traitance signé", aucun: "aucun écrit" };
  var NATURE_LABELS = {
    travaux: "travaux de construction en relation avec un immeuble",
    nettoyageLie: "nettoyage ou maintenance dans le même contrat que des travaux",
    maintenancePieces: "maintenance avec remplacement de pièces au-delà des menues fournitures",
    nettoyageSepare: "nettoyage de chantier sous contrat distinct",
    interventionSeule: "réglages, mise en service, contrôle ou maintenance sans pièces",
    intellectuelle: "prestation intellectuelle seule",
    atelier: "travaux en atelier sur des biens meubles",
    autre: "nature à préciser"
  };
  var FOURNITURE_LABELS = { non: "non", oui: "oui, sans pose" };
  var LOCATION_LABELS = { aucune: "aucune", seuleSans: "location seule sans opérateur", seuleAvec: "location seule avec chauffeur ou opérateur", incluse: "location incluse dans un contrat unique avec des travaux" };
  var DEFAULTS = {
    role: "soustraitant", preneur: "assujetti", regime: "reel", document: "devis",
    nature: "travaux", fourniture: "non", location: "aucune", dateOperation: "2026-10-29",
    montantHT: 40000, tauxTVA: 20
  };
  var MENTION_AUTOLIQUIDATION = "Autoliquidation";
  var MENTION_PRENEUR = "TVA due par le preneur assujetti (article 283, 2 nonies du CGI)";
  var MENTION_FRANCHISE = "TVA non applicable, article 293 B du CGI";

  function num(v, min, max, fallback) {
    var n = (v === "" || v == null) ? NaN : Number(v);
    if (!isFinite(n)) n = fallback;
    if (n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  }
  function pick(v, liste, fallback) { return liste.indexOf(v) >= 0 ? v : fallback; }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return d;
  }
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
  function fmtTaux(t) { return String(t).replace(".", ",") + "\u00a0%"; }
  function arrondi(n) { return Math.round(n * 100) / 100; }
  function tva(ht, taux) { return arrondi(ht * taux / 100); }

  // Référence légale selon la date : CGI jusqu'au 31/12/2026, CIBS ensuite, ancienne référence admise jusqu'au 30/06/2028
  // (BOFiP, ACTU-2026-00126 du 7 octobre 2026).
  function periodeReference(date) {
    if (!date) return "cgi";
    var iso = date.toISOString().slice(0, 10);
    if (iso < DATE_CIBS) return "cgi";
    if (iso <= DATE_FIN_REF_CGI) return "transition";
    return "cibs";
  }

  function qualifier(d) {
    if (d.role === "direct") return { reponse: "non", motif: "direct", texte: "Vous facturez directement le maître d'ouvrage : il n'y a pas de sous-traitance au sens de la loi du 31 décembre 1975. La TVA est facturée et collectée normalement." };
    if (d.preneur === "nonAssujetti") return { reponse: "non", motif: "preneur", texte: "Le client n'est pas assujetti à la TVA : l'article 283, 2 nonies ne s'applique qu'à un preneur assujetti. La TVA est facturée et collectée normalement par l'entreprise qui réalise les travaux." };
    if (d.regime === "franchise") return { reponse: "non", motif: "franchise", texte: "Le sous-traitant est en franchise en base : il ne facture pas de TVA, donc l'entreprise principale n'a rien à autoliquider (BOI-RES-TVA-000269, question 10). La facture porte la mention « " + MENTION_FRANCHISE + " »." };
    if (d.fourniture === "oui") return { reponse: "non", motif: "fourniture", texte: "Une fourniture ou une livraison de matériaux sans pose est une livraison de biens, hors du dispositif. La TVA est facturée normalement. Si la pose fait partie du même contrat, choisissez « je fournis et je pose »." };
    if (d.location === "seuleSans" || d.location === "seuleAvec") return { reponse: "non", motif: "location", texte: "La location seule d'engins ou de matériel de chantier est exclue, même avec montage et démontage sur le site, et même avec chauffeur (BOI-TVA-DECLA-10-10-20, § 534 ; BOI-RES-TVA-000269, questions 7.7 à 7.10). La TVA est facturée normalement." };
    var exclusions = {
      nettoyageSepare: "Le nettoyage de chantier réalisé indépendamment des travaux, par un contrat distinct, reste hors du dispositif (BOI-RES-TVA-000269, question 7.1). La TVA est facturée normalement.",
      interventionSeule: "Les réglages et mises en service seuls, les contrôles avant mise en service et la maintenance limitée à l'intervention, pièces facturées à part, ne sont pas autoliquidés (BOI-RES-TVA-000269, questions 3.8, 6.1 et 6.3). La TVA est facturée normalement.",
      intellectuelle: "Les prestations intellectuelles confiées à des bureaux d'études, des économistes de la construction ou des sociétés d'ingénierie sont exclues (BOI-TVA-DECLA-10-10-20, § 534). La TVA est facturée normalement, sauf si la prestation fait partie d'un contrat unique qui comprend des travaux.",
      atelier: "Les travaux réalisés en atelier sur des biens meubles et la fabrication de pièces spécifiques sont des opérations sur des biens meubles, hors du dispositif (BOI-RES-TVA-000269, question 3.5). La TVA est facturée normalement."
    };
    if (exclusions[d.nature]) return { reponse: "non", motif: d.nature, texte: exclusions[d.nature] };
    if (d.nature === "autre") return { reponse: "verifier", motif: "nature", texte: "La nature de la prestation n'est pas précisée : l'autoliquidation dépend de son lien avec un bien immobilier. Comparez-la aux exemples du rescrit BOI-RES-TVA-000269 et tranchez avant d'envoyer le devis." };
    if (d.document === "aucun") return { reponse: "verifier", motif: "document", texte: "Les conditions semblent réunies, mais rien n'est écrit. Sans contrat formel, un devis accepté ou un bon de commande signé établit l'accord sur les travaux et leur prix (BOI-TVA-DECLA-10-10-20, § 535) : faites signer le devis avant de commencer et de facturer." };
    var texte = "Travaux de construction sous-traités pour un preneur assujetti : le sous-traitant facture hors taxes avec la mention « Autoliquidation », et l'entreprise principale déclare et déduit la TVA (CGI, article 283, 2 nonies).";
    if (d.location === "incluse") texte += " La location fait partie d'un contrat unique qui comprend des travaux immobiliers : l'ensemble est autoliquidé (BOI-RES-TVA-000269, question 2).";
    if (d.nature === "nettoyageLie") texte += " Le nettoyage ou la maintenance compris dans le même contrat que les travaux suit le régime des travaux.";
    if (d.nature === "maintenancePieces") texte += " La maintenance qui prévoit le remplacement de pièces au-delà des menues fournitures est autoliquidée (BOI-RES-TVA-000269, question 6.1).";
    return { reponse: "oui", motif: "oui", texte: texte };
  }

  function computeAutoliquidation(input) {
    var d = {};
    for (var k in DEFAULTS) d[k] = (input && input[k] !== undefined) ? input[k] : DEFAULTS[k];
    d.role = pick(d.role, ["soustraitant", "principale", "direct"], "soustraitant");
    d.preneur = pick(d.preneur, ["assujetti", "nonAssujetti"], "assujetti");
    d.regime = pick(d.regime, ["reel", "franchise"], "reel");
    d.document = pick(d.document, ["devis", "contrat", "aucun"], "devis");
    d.nature = pick(d.nature, Object.keys(NATURE_LABELS), "travaux");
    d.fourniture = pick(d.fourniture, ["non", "oui"], "non");
    d.location = pick(d.location, Object.keys(LOCATION_LABELS), "aucune");
    var taux = num(d.tauxTVA, 0, 100, 20);
    if (TAUX_TVA.indexOf(taux) < 0) taux = 20;
    var ht = num(d.montantHT, 0, null, 0);
    var date = parseDate(d.dateOperation);
    var periode = periodeReference(date);

    var q = qualifier(d);
    var reponse = q.reponse;
    var tvaTheorique = tva(ht, taux);
    var tvaAutoliquidee = reponse === "oui" ? tvaTheorique : 0;
    var tvaFacturee = (reponse === "non" && d.regime !== "franchise") ? tvaTheorique : 0;
    if (reponse === "non" && d.regime === "franchise") tvaFacturee = 0;
    var montantFacture = arrondi(ht + tvaFacturee);
    var amende = reponse === "oui" ? tva(tvaAutoliquidee, TAUX_AMENDE) : 0;
    var etat = reponse === "oui" ? "ok" : (reponse === "non" ? "neutral" : "warn");
    var reponseLabel = reponse === "oui" ? "Oui" : (reponse === "non" ? "Non" : "À vérifier");

    var mentions = [];
    if (reponse === "oui") {
      mentions.push("Sur la facture : la mention « " + MENTION_AUTOLIQUIDATION + " » (annexe II au CGI, article 242 nonies A, I, 13°), sans montant de TVA.");
      mentions.push("Sur la facture : l'indication que la TVA est due par le preneur assujetti, par exemple « " + MENTION_PRENEUR + " ». La référence à l'article n'est pas obligatoire (BOI-TVA-DECLA-30-20-20-10, § 530).");
      mentions.push("Sur le devis : le prix hors taxes, la ligne « TVA : autoliquidation » et une réserve : si les conditions ne sont pas réunies, la TVA au taux applicable s'ajoute au prix.");
      mentions.push("Le numéro de TVA intracommunautaire du preneur n'est pas obligatoire pour ce cas d'autoliquidation (BOI-RES-TVA-000269, question 9.2).");
      mentions.push("Marché public : dans la déclaration de sous-traitance DC4, la ligne du taux de TVA porte « Autoliquidation » (BOI-RES-TVA-000269, question 8.1).");
    } else if (reponse === "non" && d.regime === "franchise") {
      mentions.push("Sur le devis et la facture : « " + MENTION_FRANCHISE + " », sans mention d'autoliquidation.");
    } else if (reponse === "non") {
      mentions.push("Sur le devis et la facture : le prix hors taxes, le taux de TVA (" + fmtTaux(taux) + "), le montant de TVA et le total TTC. Pas de mention « Autoliquidation ».");
    } else {
      mentions.push("Rien à figer tant que le régime n'est pas tranché : notez la question dans le dossier et faites valider le libellé par votre expert-comptable.");
      mentions.push("Si l'autoliquidation est confirmée : « " + MENTION_AUTOLIQUIDATION + " » et l'indication que la TVA est due par le preneur assujetti.");
    }

    var declarations = [];
    if (reponse === "oui") {
      declarations.push("Entreprise principale : " + fmtEur(ht) + " sur la ligne « autres opérations imposables », " + fmtEur(tvaAutoliquidee) + " de TVA brute, et la même somme en TVA déductible (ligne 20, autres biens et services), sur la déclaration de la période du paiement.");
      declarations.push("Sous-traitant : " + fmtEur(ht) + " sur la ligne « autres opérations non imposables ». Il garde le droit de déduire la TVA de ses propres achats.");
    } else if (reponse === "non" && d.regime === "franchise") {
      declarations.push("Pas de TVA collectée ni autoliquidée sur cette opération.");
    } else if (reponse === "non") {
      declarations.push("L'entreprise qui facture collecte et déclare " + fmtEur(tvaFacturee) + " de TVA ; un client assujetti la déduit dans les conditions de droit commun.");
    } else {
      declarations.push("À déterminer : si l'autoliquidation est confirmée, " + fmtEur(tvaTheorique) + " de TVA seront autoliquidés par l'entreprise principale ; sinon, collectés par le sous-traitant.");
    }

    var detail = [
      { ligne: "Montant des travaux hors taxes", montant: ht, qui: "Base" },
      { ligne: "TVA portée sur la facture", montant: tvaFacturee, qui: reponse === "oui" ? "Aucune : autoliquidation" : (d.regime === "franchise" && reponse === "non" ? "Aucune : franchise en base" : "Collectée par l'entreprise qui facture") },
      { ligne: "Montant facturé et payé", montant: montantFacture, qui: "Payé par le client" },
      { ligne: "TVA autoliquidée", montant: tvaAutoliquidee, qui: reponse === "oui" ? "Déclarée par l'entreprise principale" : "Sans objet" },
      { ligne: "TVA déductible correspondante", montant: tvaAutoliquidee, qui: reponse === "oui" ? "Déduite par l'entreprise principale, droit commun" : "Sans objet" },
      { ligne: "Amende en cas d'oubli de déclaration", montant: amende, qui: reponse === "oui" ? "5 % de la taxe déductible (CGI, art. 1788 A, 4)" : "Sans objet" }
    ];

    var conseils = [];
    conseils.push(q.texte);
    if (reponse === "oui") {
      conseils.push((d.role === "principale" ? "Vous autoliquidez" : "L'entreprise principale autoliquide") + " la TVA au moment du paiement, pas à la réception de la facture : l'autoliquidation ne change pas l'exigibilité, qui est l'encaissement pour des travaux (BOI-RES-TVA-000269, question 8.4).");
      conseils.push("En cas de paiement direct, de délégation de paiement ou d'action directe, le maître d'ouvrage paie le sous-traitant hors taxes et l'entreprise principale autoliquide quand même (BOI-TVA-DECLA-10-10-20, § 538).");
      conseils.push("L'amende de " + fmtEur(amende) + " est un ordre de grandeur : la doctrine citée par le Conseil constitutionnel ne l'applique pas à celui qui dépose spontanément une déclaration rectificative avant toute action de l'administration.");
      if (d.location !== "incluse") conseils.push("Si vous ajoutez une location d'échafaudage ou un nettoyage, un devis unique garde tout en autoliquidation ; un devis séparé pour ces lignes les fait sortir du dispositif.");
    } else if (reponse === "non" && (q.motif === "location" || d.nature === "nettoyageSepare" || d.nature === "intellectuelle")) {
      conseils.push("Si cette prestation est regroupée dans un contrat unique avec des travaux immobiliers, l'ensemble devient autoliquidé (BOI-RES-TVA-000269, question 2).");
    }
    if (periode === "cgi") conseils.push("Au " + fmtDate(date) + ", la référence est l'article 283, 2 nonies du CGI. À partir du 1er janvier 2027, les dispositions législatives de la TVA passent dans le code des impositions sur les biens et services ; les anciennes références au CGI restent utilisables jusqu'au 30 juin 2028.");
    else if (periode === "transition") conseils.push("Au " + fmtDate(date) + ", les dispositions législatives de la TVA sont dans le code des impositions sur les biens et services ; l'ancienne référence au CGI reste utilisable jusqu'au 30 juin 2028. La mention « Autoliquidation » ne change pas.");
    else conseils.push("Au " + fmtDate(date) + ", la période où l'ancienne référence au CGI restait utilisable est terminée : citez l'article du code des impositions sur les biens et services, ou aucune référence, puisqu'elle n'est pas obligatoire. La mention « Autoliquidation » ne change pas.");
    conseils.push("QuoteBuilder n'affiche ni HT ni TTC, ne porte pas de mention « Autoliquidation » et n'émet pas de factures : le régime de TVA se règle dans votre devis signé et votre logiciel de facturation. Vous pouvez ajouter au funnel une question « êtes-vous le propriétaire ou une entreprise titulaire du marché ? » pour repérer la sous-traitance dès la demande.");

    var recap = [
      "Autoliquidation de TVA, sous-traitance BTP (vérification indicative)",
      "Position : " + ROLE_LABELS[d.role] + " ; client : " + PRENEUR_LABELS[d.preneur] + " ; " + REGIME_LABELS[d.regime],
      "Prestation : " + NATURE_LABELS[d.nature] + " ; fourniture sans pose : " + FOURNITURE_LABELS[d.fourniture] + " ; location : " + LOCATION_LABELS[d.location] + " ; document : " + DOCUMENT_LABELS[d.document],
      "Autoliquidation : " + reponseLabel.toLowerCase() + (reponse === "oui" ? " (CGI, article 283, 2 nonies)" : ""),
      "Montant facturé : " + fmtEur(montantFacture) + (reponse === "oui" ? " HT, sans TVA" : (tvaFacturee > 0 ? " TTC, dont " + fmtEur(tvaFacturee) + " de TVA à " + fmtTaux(taux) : " HT, sans TVA")),
      "TVA à autoliquider par l'entreprise principale : " + fmtEur(tvaAutoliquidee) + (reponse === "oui" ? " (" + fmtTaux(taux) + ")" : ""),
      "Mentions : " + (reponse === "oui" ? "Autoliquidation ; TVA due par le preneur assujetti" : (reponse === "non" && d.regime === "franchise" ? MENTION_FRANCHISE : (reponse === "non" ? "TVA au taux de " + fmtTaux(taux) : "à trancher avant la facture"))),
      "Amende en cas d'oubli de déclaration : " + fmtEur(amende) + (reponse === "oui" ? " (5 % de la taxe déductible, CGI, article 1788 A, 4)" : ""),
      "Date : " + fmtDate(date),
      "Calcul : quotebuilder.co/outils/verificateur-autoliquidation-tva-sous-traitance-btp"
    ].join("\n");

    return {
      role: d.role, preneur: d.preneur, regime: d.regime, document: d.document, nature: d.nature, fourniture: d.fourniture, location: d.location,
      taux: taux, ht: ht, date: date, periode: periode, reponse: reponse, reponseLabel: reponseLabel, motif: q.motif, etat: etat, verdict: q.texte,
      tvaTheorique: tvaTheorique, tvaAutoliquidee: tvaAutoliquidee, tvaFacturee: tvaFacturee, montantFacture: montantFacture, amende: amende,
      mentions: mentions, declarations: declarations, detail: detail, conseils: conseils, recap: recap
    };
  }
  function buildRecap(input) { return computeAutoliquidation(input).recap; }

export { TAUX_AMENDE, TAUX_TVA, DATE_CIBS, DATE_FIN_REF_CGI, ROLE_LABELS, PRENEUR_LABELS, REGIME_LABELS, DOCUMENT_LABELS, NATURE_LABELS, FOURNITURE_LABELS, LOCATION_LABELS, DEFAULTS, MENTION_AUTOLIQUIDATION, MENTION_PRENEUR, MENTION_FRANCHISE, computeAutoliquidation, buildRecap, qualifier, periodeReference, parseDate, fmtDate, fmtEur, fmtTaux, tva };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = ["role", "preneur", "regime", "document", "nature", "fourniture", "location", "dateOperation", "montantHT", "tauxTVA"];
    function read() { var o = {}; ids.forEach(function (k) { o[k] = $(k).value; }); return o; }
    function row(tb, cells, cls) {
      var tr = document.createElement("tr"); if (cls) tr.className = cls;
      cells.forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
      tb.appendChild(tr);
    }
    function liste(id, items) {
      var ul = $(id); ul.innerHTML = "";
      items.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    }
    function render() {
      var r = computeAutoliquidation(read());
      $("reponse").textContent = r.reponseLabel;
      $("facture").textContent = fmtEur(r.montantFacture) + (r.tvaFacturee > 0 ? " TTC" : " HT");
      $("tvaAuto").textContent = fmtEur(r.tvaAutoliquidee);
      $("amende").textContent = fmtEur(r.amende);
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("detail"); tb.innerHTML = "";
      r.detail.forEach(function (l) { row(tb, [l.ligne, fmtEur(l.montant), l.qui], l.ligne === "TVA autoliquidée" && l.montant > 0 ? "cur" : ""); });
      liste("mentions", r.mentions);
      liste("declarations", r.declarations);
      liste("conseils", r.conseils);
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
