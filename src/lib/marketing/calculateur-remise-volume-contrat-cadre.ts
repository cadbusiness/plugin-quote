/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var MAX_PALIERS = 4;
  var MODE_LABELS = { global: "global (le palier atteint s'applique à tout le volume)", tranche: "par tranche (chaque tranche garde son taux)" };
  var DEFAULTS = {
    prixBase: 48, mode: "global",
    s1: 1000, r1: 3, s2: 2500, r2: 5, s3: 5000, r3: 8, s4: 0, r4: 0,
    volEngage: 5000, volRealise: 3800, remiseAppliquee: 8, rappel: "oui", penalite: 0,
    dateDebut: "2026-01-01", dateFin: "2026-12-31", dateCalcul: "2026-10-29"
  };

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
  function diffDays(a, b) { return Math.round((b.getTime() - a.getTime()) / 86400000); }
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
  function fmtNb(n) { if (n == null || !isFinite(n)) return "n/a"; return (n < 0 ? "-" : "") + groupe(Math.round(Math.abs(n))); }
  function fmtTaux(t) {
    if (t == null || !isFinite(t)) return "n/a";
    var r = Math.round(t * 10) / 10;
    return String(r).replace(".", ",") + "\u00a0%";
  }
  function arrondi(n) { return Math.round(n * 100) / 100; }

  // Paliers valides : seuil strictement positif, triés par seuil croissant. Un seuil répété garde la dernière remise saisie.
  function normaliserPaliers(input) {
    var map = {};
    for (var i = 1; i <= MAX_PALIERS; i++) {
      var s = Math.floor(num(input["s" + i], 0, null, 0));
      var r = num(input["r" + i], 0, 100, 0);
      if (s > 0) map[s] = r;
    }
    return Object.keys(map).map(Number).sort(function (a, b) { return a - b; }).map(function (s) { return { seuil: s, remise: map[s] }; });
  }
  // Index du palier atteint pour un volume (-1 : aucun palier, prix de base).
  function indexPalier(paliers, volume) {
    var idx = -1;
    for (var i = 0; i < paliers.length; i++) if (volume >= paliers[i].seuil) idx = i;
    return idx;
  }
  function remiseAuVolume(paliers, volume) { var i = indexPalier(paliers, volume); return i < 0 ? 0 : paliers[i].remise; }
  // Montant global : tout le volume au taux du palier atteint.
  function montantGlobal(prix, paliers, volume) { return arrondi(volume * prix * (1 - remiseAuVolume(paliers, volume) / 100)); }
  // Montant par tranche : unités de 0 au premier seuil au prix de base, puis chaque tranche à son taux.
  function montantTranche(prix, paliers, volume) {
    var bornes = [{ seuil: 0, remise: 0 }].concat(paliers), total = 0;
    for (var i = 0; i < bornes.length; i++) {
      var debut = bornes[i].seuil, fin = i + 1 < bornes.length ? bornes[i + 1].seuil : Infinity;
      var q = Math.max(0, Math.min(volume, fin) - debut);
      total += q * prix * (1 - bornes[i].remise / 100);
    }
    return arrondi(total);
  }
  function montant(mode, prix, paliers, volume) { return mode === "tranche" ? montantTranche(prix, paliers, volume) : montantGlobal(prix, paliers, volume); }

  function computeRemise(input) {
    var o = input || {};
    var prix = num(o.prixBase, 0, null, DEFAULTS.prixBase);
    var mode = pick(o.mode, ["global", "tranche"], "global");
    var paliers = normaliserPaliers(o);
    var volEngage = Math.floor(num(o.volEngage, 0, null, 0));
    var volRealise = Math.floor(num(o.volRealise, 0, null, 0));
    var remiseAppliquee = num(o.remiseAppliquee, 0, 100, 0);
    var rappel = pick(o.rappel, ["oui", "non"], "oui");
    var penalitePct = num(o.penalite, 0, 100, 0);
    var debut = parseDate(o.dateDebut), fin = parseDate(o.dateFin), calc = parseDate(o.dateCalcul);

    var brut = arrondi(volRealise * prix);
    var du = montant(mode, prix, paliers, volRealise);
    var autreMode = mode === "global" ? "tranche" : "global";
    var duAutreMode = montant(autreMode, prix, paliers, volRealise);
    var facture = arrondi(volRealise * prix * (1 - remiseAppliquee / 100));
    var idx = indexPalier(paliers, volRealise);
    var idxEngage = indexPalier(paliers, volEngage);
    var palierLabel = idx < 0 ? "Aucun palier (prix de base)" : "Palier " + (idx + 1) + " : " + fmtTaux(paliers[idx].remise) + " dès " + fmtNb(paliers[idx].seuil) + " unités";
    var remiseEffective = brut > 0 ? arrondi((1 - du / brut) * 100) : 0;
    var prixMoyen = volRealise > 0 ? arrondi(du / volRealise) : null;
    var atteinte = volEngage > 0 ? Math.round(volRealise / volEngage * 1000) / 10 : null;
    var manque = Math.max(0, volEngage - volRealise);
    var penalite = arrondi(manque * prix * penalitePct / 100);

    // Écart entre ce qui a été facturé et ce qui était dû.
    var ecart = arrondi(du - facture);
    var typeEcart, montantRappel = 0, montantAvoir = 0, perte = 0;
    if (Math.abs(ecart) < 0.005) { typeEcart = "aucun"; ecart = 0; }
    else if (ecart > 0) {
      if (rappel === "oui") { typeEcart = "rappel"; montantRappel = ecart; }
      else { typeEcart = "perte"; perte = ecart; }
    } else { typeEcart = "avoir"; montantAvoir = -ecart; }

    // Prochain palier et effet de seuil (mode global).
    var prochain = null;
    if (idx + 1 < paliers.length) {
      var p = paliers[idx + 1];
      var montantAuSeuil = montant(mode, prix, paliers, p.seuil);
      prochain = { seuil: p.seuil, remise: p.remise, unitesManquantes: p.seuil - volRealise, montantAuSeuil: montantAuSeuil, coutUnitesSupplementaires: arrondi(montantAuSeuil - du) };
      if (mode === "global") {
        var tauxActuel = 1 - remiseAuVolume(paliers, volRealise) / 100;
        var tauxSuivant = 1 - p.remise / 100;
        prochain.debutZoneSeuil = tauxActuel > 0 ? Math.floor(p.seuil * tauxSuivant / tauxActuel) + 1 : null;
        prochain.dansZoneSeuil = prochain.debutZoneSeuil != null && volRealise >= prochain.debutZoneSeuil;
      }
    }

    // Projection au rythme actuel.
    var projection = null, joursEcoules = null, joursTotal = null, idxProjection = null, periodeTerminee = false;
    if (debut && fin && calc && diffDays(debut, fin) >= 0 && diffDays(debut, calc) >= 0) {
      joursTotal = diffDays(debut, fin) + 1;
      joursEcoules = Math.min(joursTotal, diffDays(debut, calc) + 1);
      periodeTerminee = joursEcoules >= joursTotal;
      projection = Math.round(volRealise * joursTotal / joursEcoules);
      idxProjection = indexPalier(paliers, projection);
    }

    var etat, verdict;
    if (typeEcart === "rappel") {
      etat = "warn";
      verdict = "Le volume réalisé (" + fmtNb(volRealise) + " unités) n'atteint pas le palier de la remise appliquée sur les factures. Au palier réellement atteint, le client doit " + fmtEur(du) + " HT ; il a été facturé " + fmtEur(facture) + " HT. Le contrat prévoit un rappel : " + fmtEur(montantRappel) + " HT à facturer en complément, avec le détail du calcul.";
    } else if (typeEcart === "perte") {
      etat = "bad";
      verdict = "Le client a reçu " + fmtEur(perte) + " HT de remise de plus que ce que son volume justifie, et le contrat ne prévoit pas de rappel. Cette somme est en pratique perdue pour cette période. Écrivez une clause de rappel ou une remise de fin de période pour la suivante.";
    } else if (typeEcart === "avoir") {
      etat = "neutral";
      verdict = "Le volume réalisé dépasse le palier de la remise appliquée. Au palier atteint, le client doit " + fmtEur(du) + " HT au lieu des " + fmtEur(facture) + " HT facturés : un avoir de " + fmtEur(montantAvoir) + " HT (ristourne de fin de période) est à émettre si le contrat la prévoit.";
    } else {
      etat = "ok";
      verdict = "La remise appliquée sur les factures correspond au palier atteint : ni rappel ni avoir. Montant dû : " + fmtEur(du) + " HT pour " + fmtNb(volRealise) + " unités.";
    }
    if (!periodeTerminee && projection != null) verdict += " La période n'est pas terminée : bilan provisoire au " + fmtDate(calc) + ".";

    var grille = [{ palier: "Prix de base", seuil: 0, remise: 0 }].concat(paliers.map(function (p, i) { return { palier: "Palier " + (i + 1), seuil: p.seuil, remise: p.remise }; }));
    grille = grille.map(function (g, i) {
      var vol = Math.max(volRealise, g.seuil);
      var m = mode === "tranche" ? montantTranche(prix, paliers, vol) : arrondi(vol * prix * (1 - g.remise / 100));
      return { palier: g.palier, seuil: g.seuil, remise: g.remise, volume: vol, montant: m, atteint: i === idx + 1 };
    });

    var conseils = [];
    if (volEngage > 0) {
      conseils.push("Engagement : " + fmtNb(volRealise) + " unités réalisées sur " + fmtNb(volEngage) + " annoncées, soit " + fmtTaux(atteinte) + ". " + (idxEngage > idx ? "Le palier prévu au contrat n'est pas atteint : c'est la remise réelle, pas la remise promise, qui fixe le prix." : "Le palier correspondant à l'engagement est atteint."));
    } else {
      conseils.push("Aucun volume engagé : la remise dépend seulement du volume réalisé. Le client ne doit rien s'il commande moins, et vous ne pouvez rien lui réclamer de plus que le prix du palier atteint.");
    }
    if (typeEcart === "rappel") conseils.push("Rappel de prix : facturez " + fmtEur(montantRappel) + " HT en indiquant la période, le volume réalisé, le palier atteint et la remise déjà accordée. Une clause claire évite la discussion ; sans elle, le client peut soutenir que la remise était acquise.");
    else if (typeEcart === "perte") conseils.push("Remise accordée d'avance sans clause de rappel : " + fmtEur(perte) + " HT sans contrepartie. Pour la période suivante, appliquez le taux du palier réellement atteint en cours d'année, ou prévoyez une ristourne versée en fin de période.");
    else if (typeEcart === "avoir") conseils.push("Avoir de fin de période : " + fmtEur(montantAvoir) + " HT. La TVA suit la réduction de prix (article 267 du CGI) : l'avoir réduit la base de la TVA déjà facturée. Faites valider le traitement par votre expert-comptable.");
    else conseils.push("Remise appliquée et palier atteint concordent. Vérifiez tout de même le cumul des bons de commande avant d'arrêter le bilan : une livraison oubliée change parfois le palier.");
    if (manque > 0 && penalitePct > 0) conseils.push("Pénalité : " + fmtNb(manque) + " unités manquantes × " + fmtEur(prix) + " × " + fmtTaux(penalitePct) + " = " + fmtEur(penalite) + " HT. C'est une clause pénale : le juge peut la réduire si elle est manifestement excessive (article 1231-5 du Code civil).");
    else if (manque > 0) conseils.push("Aucune pénalité saisie pour les " + fmtNb(manque) + " unités manquantes. Sans clause, le seul effet d'un volume plus faible est un palier plus bas : c'est souvent suffisant et mieux accepté.");
    else conseils.push("Le volume réalisé couvre l'engagement : aucune pénalité ne se pose.");
    if (prochain) {
      var t = "Prochain palier : " + fmtTaux(prochain.remise) + " dès " + fmtNb(prochain.seuil) + " unités, soit " + fmtNb(prochain.unitesManquantes) + " de plus, pour un montant total de " + fmtEur(prochain.montantAuSeuil) + " HT.";
      if (mode === "global" && prochain.debutZoneSeuil != null) t += prochain.dansZoneSeuil ? " Effet de seuil : à ce volume, le client paierait moins cher en commandant " + fmtNb(prochain.seuil) + " unités. Il le verra : préparez la réponse ou passez au mode par tranche." : " Effet de seuil en mode global : à partir de " + fmtNb(prochain.debutZoneSeuil) + " unités, commander jusqu'au seuil coûte moins cher au client que de s'arrêter.";
      conseils.push(t);
    } else conseils.push(paliers.length ? "Le dernier palier de la grille est atteint : aucune remise supplémentaire n'est prévue au-delà." : "Aucun palier saisi : le prix de base s'applique à tout le volume.");
    conseils.push("Même volume en mode " + (autreMode === "global" ? "global" : "par tranche") + " : " + fmtEur(duAutreMode) + " HT, contre " + fmtEur(du) + " HT en mode " + (mode === "global" ? "global" : "par tranche") + ". Le contrat doit dire lequel s'applique ; à défaut, chacun lira la grille à son avantage.");
    conseils.push("QuoteBuilder ne suit ni les volumes cumulés, ni les factures, ni les avoirs, et son catalogue n'a pas de prix par palier : le montant d'une ligne est le prix unitaire multiplié par la quantité. Ce bilan se fait à part, avec ce calculateur ou votre logiciel de facturation.");

    var lignes = [
      "Remise sur volume d'un contrat-cadre, bilan " + (periodeTerminee ? "de fin de période" : "provisoire au " + fmtDate(calc)),
      "Période : " + fmtDate(debut) + " au " + fmtDate(fin),
      "Prix de base : " + fmtEur(prix) + " HT par unité, mode " + MODE_LABELS[mode],
      "Paliers : " + (paliers.length ? paliers.map(function (p) { return fmtNb(p.seuil) + " unités = " + fmtTaux(p.remise); }).join(" ; ") : "aucun"),
      "Volume engagé : " + fmtNb(volEngage) + " unités ; volume réalisé : " + fmtNb(volRealise) + " unités" + (atteinte != null ? " (" + fmtTaux(atteinte) + ")" : ""),
      "Palier atteint : " + palierLabel,
      "Montant dû au palier atteint : " + fmtEur(du) + " HT (remise effective " + fmtTaux(remiseEffective) + ", prix moyen " + fmtEur(prixMoyen) + ")",
      "Montant facturé avec " + fmtTaux(remiseAppliquee) + " de remise : " + fmtEur(facture) + " HT",
      typeEcart === "rappel" ? "Rappel de prix à facturer : " + fmtEur(montantRappel) + " HT" : typeEcart === "avoir" ? "Avoir à émettre : " + fmtEur(montantAvoir) + " HT" : typeEcart === "perte" ? "Remise accordée sans clause de rappel : " + fmtEur(perte) + " HT" : "Ni rappel ni avoir",
      "Pénalité : " + (penalite > 0 ? fmtEur(penalite) + " HT" : "aucune"),
      projection != null && !periodeTerminee ? "Projection fin de période au rythme actuel : " + fmtNb(projection) + " unités" : "Projection : période terminée",
      "Calcul : quotebuilder.co/outils/calculateur-remise-volume-contrat-cadre"
    ];

    return {
      prix: prix, mode: mode, paliers: paliers, volEngage: volEngage, volRealise: volRealise, remiseAppliquee: remiseAppliquee,
      brut: brut, du: du, duAutreMode: duAutreMode, facture: facture, ecart: ecart, typeEcart: typeEcart,
      montantRappel: montantRappel, montantAvoir: montantAvoir, perte: perte,
      idx: idx, idxEngage: idxEngage, palierLabel: palierLabel, remiseEffective: remiseEffective, prixMoyen: prixMoyen,
      atteinte: atteinte, manque: manque, penalite: penalite, prochain: prochain,
      projection: projection, idxProjection: idxProjection, joursEcoules: joursEcoules, joursTotal: joursTotal, periodeTerminee: periodeTerminee,
      etat: etat, verdict: verdict, grille: grille, conseils: conseils, recap: lignes.join("\n")
    };
  }
  function buildRecap(input) { return computeRemise(input).recap; }

export { MAX_PALIERS, MODE_LABELS, DEFAULTS, computeRemise, buildRecap, normaliserPaliers, indexPalier, remiseAuVolume, montantGlobal, montantTranche, montant, parseDate, diffDays, fmtDate, fmtEur, fmtNb, fmtTaux, num };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = ["prixBase", "mode", "s1", "r1", "s2", "r2", "s3", "r3", "s4", "r4", "volEngage", "volRealise", "remiseAppliquee", "rappel", "penalite", "dateDebut", "dateFin", "dateCalcul"];
    function read() { var o = {}; ids.forEach(function (k) { o[k] = $(k).value; }); return o; }
    function row(tb, cells, cls) {
      var tr = document.createElement("tr"); if (cls) tr.className = cls;
      cells.forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
      tb.appendChild(tr);
    }
    function render() {
      var r = computeRemise(read());
      $("palier").textContent = r.palierLabel;
      $("montantDu").textContent = fmtEur(r.du) + " HT";
      $("montantFacture").textContent = fmtEur(r.facture) + " HT";
      $("ecart").textContent = r.typeEcart === "rappel" ? "Rappel : " + fmtEur(r.montantRappel) + " HT" : r.typeEcart === "avoir" ? "Avoir : " + fmtEur(r.montantAvoir) + " HT" : r.typeEcart === "perte" ? "Perdu, faute de clause : " + fmtEur(r.perte) + " HT" : "Aucun";
      $("penaliteMontant").textContent = r.penalite > 0 ? fmtEur(r.penalite) + " HT" : "Aucune";
      $("atteinte").textContent = r.atteinte == null ? "Pas d'engagement" : fmtTaux(r.atteinte);
      $("prixMoyen").textContent = r.prixMoyen == null ? "n/a" : fmtEur(r.prixMoyen) + " HT";
      $("projection").textContent = r.projection == null ? "n/a" : (r.periodeTerminee ? "Période terminée" : fmtNb(r.projection) + " unités");
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("grille"); tb.innerHTML = "";
      r.grille.forEach(function (g) { row(tb, [g.palier, fmtNb(g.seuil) + " unités", fmtTaux(g.remise), fmtEur(g.montant) + " HT pour " + fmtNb(g.volume) + " unités"], g.atteint ? "cur" : ""); });
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
