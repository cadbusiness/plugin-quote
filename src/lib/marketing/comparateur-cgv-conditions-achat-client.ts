/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "comparateur-cgv-conditions-achat-client";
  var DELAI_LEGAL_DEFAUT = 30;
  var PLAFOND_JOURS = 60;
  var PLAFOND_FIN_DE_MOIS = 45;
  var CLAUSES = [
    { id: "paiement", label: "Délai de paiement", droitCommun: "30 jours après la réception des marchandises ou l'exécution de la prestation (code de commerce, article L441-10)" },
    { id: "penalites", label: "Pénalités de retard de paiement", droitCommun: "taux de la BCE majoré de 10 points et indemnité forfaitaire de 40 € (article L441-10), même sans clause" },
    { id: "reserve", label: "Réserve de propriété", droitCommun: "pas de réserve de propriété : vous ne pourrez pas revendiquer le bien si le client ne paie pas" },
    { id: "responsabilite", label: "Limitation de responsabilité", droitCommun: "pas de plafond convenu : la réparation suit le droit commun de la responsabilité contractuelle" },
    { id: "retard", label: "Pénalités de retard de livraison", droitCommun: "pas de pénalité forfaitaire : le client doit prouver son préjudice" },
    { id: "juridiction", label: "Tribunal compétent", droitCommun: "règles de compétence de droit commun (Cass. 1re civ., 28 mars 1995, n° 93-13.237)" },
    { id: "annulation", label: "Frais d'annulation", droitCommun: "pas de frais d'annulation convenus : le contrat engage les deux parties" },
    { id: "revision", label: "Révision du prix", droitCommun: "prix ferme : pas de révision sans nouvel accord" }
  ];
  var CGV_LABELS = { signees: "jointes au devis, devis signé", jointes: "jointes au devis, devis non signé (commande par bon de commande)", facture: "au dos des factures ou bons de livraison seulement", aucune: "non transmises" };
  var CGA_LABELS = { commande: "au dos du bon de commande, commande exécutée", portail: "acceptées sur un portail ou dans un appel d'offres", refus: "refusées par écrit, vos conditions confirmées par le client", aucune: "aucune" };
  var SOURCE_LABELS = { cp: "Le devis signé (condition particulière)", cgv: "Vos CGV", cga: "Les conditions d'achat du client", neutralisee: "Aucune des deux clauses", droitCommun: "Le droit commun" };
  var STATUT_LABELS = { ok: "Vos conditions", warn: "À surveiller", bad: "Perdue", info: "Sans clause" };
  var DEFAULTS = {
    cgvStatut: "jointes", cgaStatut: "commande", primaute: true,
    montant: 28400, taux: 6, cgvDelai: 30, cgaDelai: 60, cgaFinDeMois: false,
    cgv_paiement: "oui", cga_paiement: "contraire", cp_paiement: false,
    cgv_penalites: "oui", cga_penalites: "absente", cp_penalites: false,
    cgv_reserve: "oui", cga_reserve: "contraire", cp_reserve: false,
    cgv_responsabilite: "oui", cga_responsabilite: "contraire", cp_responsabilite: false,
    cgv_retard: "non", cga_retard: "compatible", cp_retard: false,
    cgv_juridiction: "oui", cga_juridiction: "contraire", cp_juridiction: false,
    cgv_annulation: "oui", cga_annulation: "absente", cp_annulation: false,
    cgv_revision: "non", cga_revision: "absente", cp_revision: false
  };

  function num(v, min, max, fallback) {
    var n = (v === "" || v == null) ? NaN : Number(v);
    if (!isFinite(n)) n = fallback;
    if (n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  }
  function pick(v, liste, fallback) { return liste.indexOf(v) >= 0 ? v : fallback; }
  function bool(v) { return v === true || v === "true" || v === 1 || v === "1" || v === "on"; }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) {
    if (n == null || !isFinite(n)) return "n/a";
    var c = Math.round(Math.abs(n) * 100);
    var neg = n < 0 && c !== 0;
    var txt = groupe(Math.floor(c / 100));
    if (c % 100 !== 0) txt += "," + String(c % 100).padStart(2, "0");
    return (neg ? "-" : "") + txt + "\u00a0€";
  }
  function fmtJours(n) { return n + (n > 1 ? " jours" : " jour"); }

  function normalise(input) {
    var i = input || {};
    var d = {
      cgvStatut: pick(i.cgvStatut, ["signees", "jointes", "facture", "aucune"], DEFAULTS.cgvStatut),
      cgaStatut: pick(i.cgaStatut, ["commande", "portail", "refus", "aucune"], DEFAULTS.cgaStatut),
      primaute: i.primaute === undefined ? DEFAULTS.primaute : bool(i.primaute),
      montant: num(i.montant, 0, null, DEFAULTS.montant),
      taux: num(i.taux, 0, 30, DEFAULTS.taux),
      cgvDelai: Math.round(num(i.cgvDelai, 0, 120, DEFAULTS.cgvDelai)),
      cgaDelai: Math.round(num(i.cgaDelai, 0, 180, DEFAULTS.cgaDelai)),
      cgaFinDeMois: i.cgaFinDeMois === undefined ? DEFAULTS.cgaFinDeMois : bool(i.cgaFinDeMois)
    };
    CLAUSES.forEach(function (c) {
      d["cgv_" + c.id] = pick(i["cgv_" + c.id], ["oui", "non"], DEFAULTS["cgv_" + c.id]);
      d["cga_" + c.id] = pick(i["cga_" + c.id], ["contraire", "compatible", "absente"], DEFAULTS["cga_" + c.id]);
      d["cp_" + c.id] = i["cp_" + c.id] === undefined ? DEFAULTS["cp_" + c.id] : bool(i["cp_" + c.id]);
    });
    return d;
  }

  function opposabilite(d) {
    return {
      cgv: d.cgvStatut === "signees" || d.cgvStatut === "jointes",
      cga: d.cgaStatut === "commande" || d.cgaStatut === "portail"
    };
  }

  function resoudre(c, d, op) {
    var cgv = d["cgv_" + c.id], cga = d["cga_" + c.id], cp = d["cp_" + c.id];
    var aCgv = cgv === "oui", aCga = cga !== "absente";
    if (cp) return { source: "cp", statut: "ok", texte: "La clause écrite dans le devis signé l'emporte sur les deux conditions générales (article 1119, alinéa 3)." };
    if (op.cgv && op.cga && aCgv && cga === "contraire") {
      if (c.id === "reserve") return { source: "neutralisee", statut: "bad", texte: "Clauses croisées qui se contredisent : pas de réserve de propriété, sauf acceptation expresse du client avant la livraison. Exécuter la commande ou faire signer le bon de livraison ne suffit pas (Cass. com., 11 février 2026, n° 24-13.195)." };
      if (c.id === "juridiction") return { source: "neutralisee", statut: "bad", texte: "Deux clauses attributives qui se contredisent : on revient aux règles de compétence de droit commun (Cass. 1re civ., 28 mars 1995, n° 93-13.237)." };
      return { source: "neutralisee", statut: "bad", texte: "Les deux conditions générales sont acceptées et disent l'inverse : les clauses incompatibles sont sans effet (article 1119, alinéa 2). Reste : " + c.droitCommun + "." };
    }
    if (op.cgv && aCgv) return { source: "cgv", statut: "ok", texte: aCga ? "Les conditions d'achat traitent le point sans contredire vos CGV : votre clause s'applique." : "Les conditions d'achat ne disent rien sur ce point : votre clause s'applique." };
    if (op.cga && aCga) {
      if (c.id === "reserve") return { source: "cga", statut: "bad", texte: "Le refus de réserve de propriété du client joue dès lors que vous le connaissiez, sans que vous ayez à l'accepter (Cass. com., 11 juillet 1995, n° 93-10.383)." };
      return { source: "cga", statut: "warn", texte: aCgv ? "Vos CGV ne sont pas opposables au client : sa clause s'applique." : "Vos CGV ne prévoient rien sur ce point : la clause du client s'applique." };
    }
    if (aCgv) return { source: "droitCommun", statut: "bad", texte: "Votre clause existe, mais vos CGV n'ont pas été acceptées par le client : " + c.droitCommun + "." };
    return { source: "droitCommun", statut: "info", texte: "Aucune clause applicable : " + c.droitCommun + "." };
  }

  function computeComparaison(input) {
    var d = normalise(input);
    var op = opposabilite(d);
    var lignes = CLAUSES.map(function (c) {
      var r = resoudre(c, d, op);
      return { id: c.id, label: c.label, source: r.source, sourceLabel: SOURCE_LABELS[r.source], statut: r.statut, texte: r.texte };
    });
    var compte = { cp: 0, cgv: 0, cga: 0, neutralisee: 0, droitCommun: 0 };
    lignes.forEach(function (l) { compte[l.source] += 1; });
    var perdues = lignes.filter(function (l) { return l.statut === "bad"; });
    var nbCgv = compte.cp + compte.cgv;

    var lp = lignes[0];
    var delaiApplicable = (lp.source === "cp" || lp.source === "cgv") ? d.cgvDelai : (lp.source === "cga" ? d.cgaDelai : DELAI_LEGAL_DEFAUT);
    var delaiPratique = d.cga_paiement !== "absente" && d.cgaStatut !== "aucune" && d.cgaStatut !== "refus" ? d.cgaDelai : delaiApplicable;
    var ecartJours = Math.max(0, delaiPratique - delaiApplicable);
    var coutEcart = Math.round(d.montant * ecartJours / 365 * d.taux / 100);
    var plafondCga = d.cgaFinDeMois ? PLAFOND_FIN_DE_MOIS : PLAFOND_JOURS;
    var cgaHorsPlafond = d.cga_paiement !== "absente" && d.cgaStatut !== "aucune" && d.cgaDelai > plafondCga;
    var cgvHorsPlafond = d.cgv_paiement === "oui" && d.cgvDelai > PLAFOND_JOURS;

    var alertes = [];
    if (d.cgvStatut === "jointes") alertes.push("Vos CGV étaient jointes au devis, mais le client n'a pas signé le devis : il faudra prouver qu'il les a connues et acceptées (article 1119, alinéa 1). Un bon de commande qui reprend le numéro de votre devis aide, sans tout régler.");
    if (d.cgvStatut === "facture") alertes.push("Des CGV qui n'apparaissent qu'au dos des factures ou des bons de livraison arrivent après la commande : en principe, elles ne sont pas opposables au client.");
    if (d.cgvStatut === "aucune") alertes.push("Sans CGV transmises, il reste le devis, le droit commun et les conditions d'achat du client. Un acheteur professionnel peut d'ailleurs exiger vos CGV (code de commerce, article L441-1, II).");
    if (d.cgaStatut === "commande") alertes.push("Le bon de commande arrivé après votre devis, avec d'autres conditions, vaut nouvelle offre (article 1118). En l'exécutant sans réserve, vous l'acceptez par votre comportement (article 1113).");
    if (d.primaute && op.cga) alertes.push("Votre clause « nos CGV prévalent sur toute condition d'achat » ne tranche rien si les conditions d'achat disent la même chose dans l'autre sens : l'article 1119 neutralise les clauses incompatibles.");
    if (cgaHorsPlafond) alertes.push("Le délai des conditions d'achat (" + fmtJours(d.cgaDelai) + (d.cgaFinDeMois ? " fin de mois" : "") + ") dépasse le plafond de l'article L441-10 : 60 jours après la date de la facture, ou 45 jours fin de mois si c'est convenu. Rédaction en vigueur au 2 novembre 2026, une nouvelle rédaction est annoncée au 1er janvier 2027.");
    if (cgvHorsPlafond) alertes.push("Le délai de vos propres CGV (" + fmtJours(d.cgvDelai) + ") dépasse le plafond de 60 jours de l'article L441-10.");
    if (compte.neutralisee > 0) alertes.push(compte.neutralisee + " clause" + (compte.neutralisee > 1 ? "s se neutralisent" : " se neutralise") + " : ni votre version ni celle du client ne s'applique sur " + (compte.neutralisee > 1 ? "ces points" : "ce point") + ".");
    if (alertes.length === 0) alertes.push("Rien de bloquant avec ces réponses.");

    var aFixer = lignes.filter(function (l) { return l.statut === "bad" || l.statut === "warn"; });
    var actions = [];
    aFixer.forEach(function (l) {
      if (l.id === "reserve") actions.push("Réserve de propriété : obtenir l'accord exprès du client avant la livraison, par écrit, dans le devis signé ou un avenant. La signature du bon de livraison ne suffit pas.");
      else if (l.id === "paiement") actions.push("Délai de paiement : écrire " + fmtJours(d.cgvDelai) + " à compter de la date de facture dans le devis, et le faire signer.");
      else if (d["cgv_" + l.id] === "non") actions.push(l.label + " : vos CGV ne disent rien, la clause du client s'applique. Acceptez-la en connaissance de cause, ou proposez dans le devis une version que vous pouvez tenir (plafond, cas exclus).");
      else actions.push(l.label + " : reprendre votre clause dans le devis, en conditions particulières, ou accepter celle du client en connaissance de cause.");
    });
    if (aFixer.length > 0) actions.push("Faire dater et signer le devis par le client avant d'exécuter, avec la mention que ses conditions particulières priment sur les conditions générales des deux parties.");
    if (aFixer.length > 0 && d.cgaStatut === "commande") actions.push("Pour les prochaines commandes : répondre au bon de commande par écrit, avant d'exécuter, en listant les points de ses conditions d'achat que vous n'acceptez pas.");
    if (actions.length === 0) actions.push("Garder le devis signé et la preuve de l'envoi de vos CGV dans le dossier.");

    var puces = aFixer.map(function (l) {
      if (l.id === "paiement") return "· " + l.label + " : " + fmtJours(d.cgvDelai) + " à compter de la date de facture";
      if (d["cgv_" + l.id] === "non") return "· " + l.label + " : une version à convenir ensemble, avec un plafond";
      return "· " + l.label + " : selon l'article joint de nos conditions";
    });
    var message = aFixer.length === 0
      ? "Bonjour,\n\nMerci pour votre commande. Nous avons bien noté que nos conditions s'appliquent ; vous les trouverez à nouveau jointes au devis signé.\n\nCordialement"
      : "Bonjour,\n\nMerci pour votre commande. Votre bon de commande renvoie à vos conditions générales d'achat et notre devis à nos conditions générales de vente. Sur quelques points, les deux textes ne disent pas la même chose. Pour que tout soit clair avant la livraison, nous vous proposons de les fixer dans le devis lui-même :\n" + puces.join("\n") + "\n\nPouvez-vous nous retourner le devis daté et signé avec ces précisions ? Si un point vous pose problème, dites-le nous, nous en parlons avant de lancer la fabrication.\n\nCordialement";

    var etat = perdues.length > 0 ? "bad" : (aFixer.length > 0 || d.cgvStatut === "jointes" ? "warn" : "ok");
    var verdict = etat === "bad"
      ? perdues.length + " clause" + (perdues.length > 1 ? "s" : "") + " sur " + CLAUSES.length + " ne joue" + (perdues.length > 1 ? "nt" : "") + " plus en votre faveur. Fixez-les dans le devis signé avant la livraison."
      : (etat === "warn" ? "Pas de clause perdue, mais " + (aFixer.length > 0 ? aFixer.length + " point" + (aFixer.length > 1 ? "s suivent" : " suit") + " les conditions du client" : "l'acceptation de vos CGV reste à prouver") + "." : "Vos conditions s'appliquent sur les " + CLAUSES.length + " points.");

    var recap = [
      "Comparateur CGV et conditions d'achat du client",
      "Montant du devis : " + fmtEur(d.montant) + " HT",
      "Vos CGV : " + CGV_LABELS[d.cgvStatut],
      "Conditions d'achat : " + CGA_LABELS[d.cgaStatut],
      "Clauses à vos conditions : " + nbCgv + " / " + CLAUSES.length,
      "Clauses du client : " + compte.cga + " / " + CLAUSES.length,
      "Clauses neutralisées : " + compte.neutralisee + " / " + CLAUSES.length,
      "Droit commun : " + compte.droitCommun + " / " + CLAUSES.length
    ];
    lignes.forEach(function (l) { recap.push("· " + l.label + " : " + l.sourceLabel); });
    recap.push("Délai de paiement applicable : " + fmtJours(delaiApplicable) + " ; pratiqué par le client : " + fmtJours(delaiPratique));
    recap.push("Coût de trésorerie de l'écart : " + fmtEur(coutEcart));
    recap.push("Calcul : quotebuilder.co/outils/" + SLUG);

    return {
      input: d, opposable: op, lignes: lignes, compte: compte, nbCgv: nbCgv, nbCga: compte.cga, nbPerdues: perdues.length,
      delaiApplicable: delaiApplicable, delaiPratique: delaiPratique, ecartJours: ecartJours, coutEcart: coutEcart,
      cgaHorsPlafond: cgaHorsPlafond, cgvHorsPlafond: cgvHorsPlafond, alertes: alertes, actions: actions,
      message: message, etat: etat, verdict: verdict, recap: recap.join("\n")
    };
  }
  function buildRecap(input) { return computeComparaison(input).recap; }

export { SLUG, DELAI_LEGAL_DEFAUT, PLAFOND_JOURS, PLAFOND_FIN_DE_MOIS, CLAUSES, CGV_LABELS, CGA_LABELS, SOURCE_LABELS, STATUT_LABELS, DEFAULTS, computeComparaison, buildRecap, normalise, fmtEur, fmtJours };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = ["cgvStatut", "cgaStatut", "montant", "taux", "cgvDelai", "cgaDelai"];
    function read() {
      var o = {};
      ids.forEach(function (k) { o[k] = $(k).value; });
      o.primaute = $("primaute").checked;
      o.cgaFinDeMois = $("cgaFinDeMois").checked;
      CLAUSES.forEach(function (c) {
        o["cgv_" + c.id] = $("cgv_" + c.id).value;
        o["cga_" + c.id] = $("cga_" + c.id).value;
        o["cp_" + c.id] = $("cp_" + c.id).checked;
      });
      return o;
    }
    function liste(id, items) {
      var ul = $(id); ul.innerHTML = "";
      items.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    }
    function render() {
      var r = computeComparaison(read());
      $("nbCgv").textContent = r.nbCgv + " / " + CLAUSES.length;
      $("nbCga").textContent = r.nbCga + " / " + CLAUSES.length;
      $("nbPerdues").textContent = r.nbPerdues + " / " + CLAUSES.length;
      $("delais").textContent = fmtJours(r.delaiApplicable) + " / " + fmtJours(r.delaiPratique);
      $("coutEcart").textContent = fmtEur(r.coutEcart);
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("resultats"); tb.innerHTML = "";
      r.lignes.forEach(function (l) {
        var tr = document.createElement("tr");
        if (l.statut === "bad") tr.className = "cur"; else if (l.statut === "warn") tr.className = "weak";
        [l.label, l.sourceLabel, l.texte].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
        tb.appendChild(tr);
      });
      liste("alertes", r.alertes);
      liste("actions", r.actions);
      $("message").textContent = r.message;
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
