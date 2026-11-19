/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SEUIL_HT = 5000;
  var PERIODE_MOIS = 6;
  var PRISON_ANS = 3;
  var AMENDE_MAX = 45000;
  var SLUG = "verificateur-obligation-vigilance-sous-traitant";
  var ROLE_LABELS = { prestataire: "prestataire qui remet ses documents", donneur: "donneur d'ordre qui vérifie" };
  var CLIENT_LABELS = { entreprise: "client professionnel (entreprise, association, SCI)", public: "personne morale de droit public", particulier: "particulier pour son usage personnel ou familial" };
  var ETABLI_LABELS = { france: "prestataire établi en France", etranger: "prestataire établi ou domicilié à l'étranger" };
  var TYPE_ATT_LABELS = { urssaf: "attestation de vigilance de l'organisme de recouvrement", provisoire: "attestation provisoire de début d'activité", honneur: "attestation sur l'honneur du dirigeant", aucune: "aucune attestation" };
  var PIECE_LABELS = { kbis: "extrait K ou Kbis", rne: "extrait d'immatriculation au RNE (métiers et artisanat)", devis: "devis, document publicitaire ou correspondance avec nom, adresse et numéro d'immatriculation", accuse: "accusé de réception électronique de l'article R. 123-6 du code de commerce", aucune: "aucune pièce d'immatriculation", nonRequis: "immatriculation non obligatoire, profession non réglementée" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var DEFAULTS = {
    role: "prestataire", client: "entreprise", etabli: "france", montant: 18600,
    dateConclusion: "2026-11-16", dateFin: "2027-09-30", typeAttestation: "urssaf", dateAttestation: "2026-10-12",
    authenticite: "oui", piece: "rne", salaries: "oui", etrangers: "non", sousTraitant: "oui"
  };

  function num(v, min, max, fallback) {
    var n = typeof v === "number" ? v : parseFloat(String(v === undefined || v === null ? "" : v).replace(/[\s\u00a0]/g, "").replace(",", "."));
    if (!isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }
  function pick(v, obj, fallback) { return Object.prototype.hasOwnProperty.call(obj, v) ? v : fallback; }
  function oui(v) { return v === true || v === "oui" || v === "true"; }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return dt;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtDate(d) { return d ? pad(d.getUTCDate()) + "/" + pad(d.getUTCMonth() + 1) + "/" + d.getUTCFullYear() : "n/a"; }
  function iso(d) { return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) { return groupe(Math.round(n)) + "\u00a0€"; }
  // Ajoute des mois ; le jour est ramené au dernier jour du mois si besoin (31 août + 6 mois = 28 ou 29 février).
  function addMonths(d, k) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + k, j = d.getUTCDate();
    var ny = y + Math.floor(m / 12), nm = ((m % 12) + 12) % 12;
    var dernier = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
    return new Date(Date.UTC(ny, nm, Math.min(j, dernier)));
  }
  function addDays(d, k) { return new Date(d.getTime() + k * 86400000); }
  // Une attestation « datant de moins de six mois » à la date x : délivrée après x moins six mois.
  function fraicheAu(att, x) { return att.getTime() > addMonths(x, -PERIODE_MOIS).getTime() && att.getTime() <= x.getTime(); }
  function dernierJourUtile(att) { return addDays(addMonths(att, PERIODE_MOIS), -1); }

  function echeancier(conclusion, fin) {
    var dates = [conclusion];
    if (!fin || fin.getTime() <= conclusion.getTime()) return dates;
    for (var k = 1; k < 200; k++) {
      var x = addMonths(conclusion, PERIODE_MOIS * k);
      if (x.getTime() > fin.getTime()) break;
      dates.push(x);
    }
    return dates;
  }

  function computeVigilance(input) {
    var d = {};
    for (var key in DEFAULTS) d[key] = input && input[key] !== undefined ? input[key] : DEFAULTS[key];
    var role = pick(d.role, ROLE_LABELS, "prestataire");
    var client = pick(d.client, CLIENT_LABELS, "entreprise");
    var etabli = pick(d.etabli, ETABLI_LABELS, "france");
    var typeAtt = pick(d.typeAttestation, TYPE_ATT_LABELS, "aucune");
    var piece = pick(d.piece, PIECE_LABELS, "aucune");
    var montant = num(d.montant, 0, 1000000000, 0);
    var salaries = oui(d.salaries), etrangers = oui(d.etrangers), sousTraitant = oui(d.sousTraitant), authenticite = oui(d.authenticite);
    var conclusion = parseDate(d.dateConclusion), fin = parseDate(d.dateFin), att = parseDate(d.dateAttestation);
    var particulier = client === "particulier";
    var obligatoire = montant >= SEUIL_HT;
    var controles = [], actions = [], pieces = [];
    function ajoute(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    // 1. Seuil
    if (obligatoire) ajoute("Seuil de 5 000 € HT", "ok", "Contrat de " + fmtEur(montant) + " HT : les vérifications sont obligatoires (article R. 8222-1). Le seuil s'apprécie sur le montant global du contrat, même payé en plusieurs factures.");
    else ajoute("Seuil de 5 000 € HT", "info", "Contrat de " + fmtEur(montant) + " HT, sous le seuil de l'article R. 8222-1 : les vérifications ne sont pas obligatoires. Si le contrat est complété par des commandes ou un avenant, refaites le compte sur le montant global.");

    // 2. Dates
    var datesOk = !!conclusion;
    if (!conclusion) ajoute("Dates du contrat", "warn", "Date de conclusion absente ou invalide : l'échéancier ne peut pas être calculé.");
    else if (!fin) ajoute("Dates du contrat", "warn", "Date de fin d'exécution absente : seule la remise à la conclusion est calculée. Indiquez la fin prévue pour connaître les renouvellements.");
    else if (fin.getTime() < conclusion.getTime()) ajoute("Dates du contrat", "warn", "La fin d'exécution (" + fmtDate(fin) + ") précède la conclusion (" + fmtDate(conclusion) + ") : vérifiez les dates.");
    else ajoute("Dates du contrat", "ok", "Conclusion le " + fmtDate(conclusion) + ", fin d'exécution prévue le " + fmtDate(fin) + ".");

    var dates = conclusion ? echeancier(conclusion, fin) : [];
    var lignes = dates.map(function (x, i) {
      var seuilFraicheur = addMonths(x, -PERIODE_MOIS);
      return { rang: i + 1, date: x, label: i === 0 ? "Conclusion du contrat" : "Renouvellement n° " + i, delivreeApres: seuilFraicheur, texte: (etabli === "etranger" ? "documents des articles D. 8222-7 et D. 8222-8" : (particulier ? "l'un des documents de l'article D. 8222-5" : "attestation de vigilance délivrée après le " + fmtDate(seuilFraicheur))) + (etrangers ? (particulier && i > 0 ? "" : " + liste nominative des salariés étrangers") : "") };
    });

    // 3. Attestation
    var attOk = false;
    if (!obligatoire) {
      ajoute("Attestation de vigilance", "info", "Sans objet sous le seuil. Rien n'empêche le client de la demander quand même ; elle se télécharge dans l'espace en ligne de l'Urssaf.");
    } else if (etabli === "etranger") {
      ajoute("Documents du prestataire étranger", "warn", "Prestataire établi à l'étranger : la liste est celle de l'article D. 8222-7 (numéro d'identification de l'article 286 ter du CGI ou identité et adresse, document sur la situation sociale au regard du règlement (CE) n° 883/2004 ou d'une convention, et pièce d'immatriculation si le pays l'exige), en français ou traduits (article D. 8222-8).");
      pieces.push("Document portant le numéro individuel d'identification de l'article 286 ter du CGI, ou identité et adresse");
      pieces.push("Document attestant la régularité de la situation sociale (règlement (CE) n° 883/2004 ou convention internationale)");
      pieces.push("Pièce d'immatriculation au registre professionnel du pays, si elle y est obligatoire");
      pieces.push("Traduction en français de chaque document qui n'est pas rédigé en français");
      actions.push("Rassembler les documents de l'article D. 8222-7 et leur traduction avant la signature.");
    } else if (typeAtt === "aucune") {
      if (particulier && piece !== "aucune" && piece !== "nonRequis") { ajoute("Attestation de vigilance", "ok", "Client particulier : un seul des documents de l'article D. 8222-5 suffit (article D. 8222-4). La pièce d'immatriculation fournie remplit cette condition."); attOk = true; }
      else { ajoute("Attestation de vigilance", "bad", "Aucune attestation : " + (particulier ? "le particulier doit recevoir au moins l'un des documents de l'article D. 8222-5 (article D. 8222-4)." : "sans elle, le client n'est pas réputé avoir vérifié, et la Cour de cassation n'admet aucun document de remplacement.")); actions.push("Télécharger l'attestation de vigilance dans l'espace en ligne de l'Urssaf (ou de la MSA) avant la signature."); }
    } else if (typeAtt === "honneur") {
      ajoute("Attestation de vigilance", "bad", "Une attestation sur l'honneur ne remplace pas l'attestation de l'organisme de recouvrement : seuls les documents de l'article D. 8222-5 comptent (Cass. 2e civ., 11 février 2016, n° 14-10.614 ; 5 décembre 2024, n° 22-21.152).");
      actions.push("Remplacer l'attestation sur l'honneur par l'attestation de vigilance téléchargée sur l'espace en ligne de l'organisme.");
    } else if (!att || !conclusion) {
      ajoute("Attestation de vigilance", "warn", "Date de l'attestation absente ou invalide : impossible de dire si elle date de moins de six mois à la conclusion.");
    } else if (att.getTime() > conclusion.getTime()) {
      ajoute("Attestation de vigilance", "warn", "L'attestation est datée du " + fmtDate(att) + ", après la conclusion prévue le " + fmtDate(conclusion) + " : la remise doit avoir lieu lors de la conclusion. Vérifiez les dates.");
    } else if (!fraicheAu(att, conclusion)) {
      ajoute("Attestation de vigilance", "bad", "Attestation du " + fmtDate(att) + " : elle a plus de six mois le " + fmtDate(conclusion) + " (dernier jour utile : " + fmtDate(dernierJourUtile(att)) + "). Il faut une attestation délivrée après le " + fmtDate(addMonths(conclusion, -PERIODE_MOIS)) + ".");
      actions.push("Télécharger une attestation récente avant la signature.");
    } else {
      attOk = true;
      ajoute("Attestation de vigilance", "ok", (typeAtt === "provisoire" ? "Attestation provisoire" : "Attestation") + " du " + fmtDate(att) + " : moins de six mois à la conclusion, utilisable jusqu'au " + fmtDate(dernierJourUtile(att)) + " inclus." + (typeAtt === "provisoire" ? " Une attestation provisoire ne vaut que jusqu'à la première échéance déclarative ou de paiement (article L. 243-15 du code de la sécurité sociale)." : ""));
    }
    if (obligatoire && etabli === "france" && (typeAtt === "urssaf" || typeAtt === "provisoire")) pieces.push((typeAtt === "provisoire" ? "Attestation provisoire" : "Attestation de vigilance") + (att ? " du " + fmtDate(att) : "") + ", à renouveler à chaque échéance");

    // 4. Authenticité
    if (obligatoire && etabli === "france" && (typeAtt === "urssaf" || typeAtt === "provisoire")) {
      if (particulier) ajoute("Authenticité", "info", "Pour un particulier, l'article D. 8222-4 ne prévoit pas de contrôle d'authenticité. Le code de sécurité de l'attestation permet quand même de la vérifier en ligne.");
      else if (authenticite) ajoute("Authenticité", "ok", "Authenticité vérifiée auprès de l'organisme avec le code de sécurité de l'attestation, comme l'exige l'article D. 8222-5. Gardez une trace de la vérification avec la date.");
      else { ajoute("Authenticité", "warn", "Le client doit s'assurer de l'authenticité de l'attestation auprès de l'organisme (article D. 8222-5). Sans cette vérification, une attestation falsifiée ne le protège pas."); actions.push(role === "donneur" ? "Vérifier l'attestation sur le service de vérification de l'Urssaf avec son code de sécurité, et conserver le résultat daté." : "Signaler au client que l'attestation porte un code de sécurité vérifiable sur le site de l'Urssaf."); }
    }

    // 5. Salariés
    if (obligatoire && etabli === "france" && (typeAtt === "urssaf" || typeAtt === "provisoire")) {
      if (salaries) ajoute("Mentions liées aux salariés", "ok", "Le prestataire emploie des salariés : l'attestation doit mentionner le nombre de salariés et le total des rémunérations déclarées (article D. 243-15 du code de la sécurité sociale). Une attestation limitée à la situation personnelle du dirigeant ne suffit pas (Cass. 2e civ., 5 décembre 2024).");
      else ajoute("Mentions liées aux salariés", "info", "Prestataire sans salarié : l'attestation porte sur ses propres déclarations et cotisations de travailleur indépendant.");
    }

    // 6. Immatriculation
    if (obligatoire && etabli === "france") {
      if (piece === "nonRequis") ajoute("Immatriculation", "info", "Immatriculation non obligatoire et profession non réglementée : l'article D. 8222-5 ne demande pas de pièce d'immatriculation dans ce cas.");
      else if (piece === "aucune") { ajoute("Immatriculation", particulier && attOk ? "info" : "bad", particulier && attOk ? "Client particulier : l'attestation suffit, un seul document étant exigé (article D. 8222-4)." : "Immatriculation obligatoire ou profession réglementée : il faut l'une des pièces du 2° de l'article D. 8222-5 (Kbis, extrait RNE, devis ou document mentionnant le numéro, accusé de réception R. 123-6)."); if (!(particulier && attOk)) actions.push("Joindre un extrait Kbis ou RNE récent, ou faire figurer nom, adresse complète et numéro d'immatriculation sur le devis."); }
      else { ajoute("Immatriculation", "ok", "Pièce fournie : " + PIECE_LABELS[piece] + "."); pieces.push(PIECE_LABELS[piece].charAt(0).toUpperCase() + PIECE_LABELS[piece].slice(1)); }
    }

    // 7. Salariés étrangers
    if (obligatoire && etrangers) {
      ajoute("Salariés étrangers", "warn", "Le prestataire emploie des salariés étrangers soumis à autorisation de travail : liste nominative à remettre à la conclusion (date d'embauche, nationalité, type et numéro d'ordre du titre, article D. 8254-2)" + (particulier ? ", sans renouvellement semestriel pour un particulier (article D. 8254-4)." : ", puis tous les six mois (article D. 8254-4)."));
      pieces.push("Liste nominative des salariés étrangers soumis à autorisation de travail, tirée du registre unique du personnel");
      actions.push("Préparer la liste nominative à partir du registre unique du personnel.");
    }

    // 8. Client public
    if (client === "public") ajoute("Client public", "info", "Personne morale de droit public : informée par écrit d'une situation irrégulière par un agent de contrôle, elle enjoint à l'entreprise d'y mettre fin ; sans justification dans les deux mois, le contrat peut être rompu sans indemnité (article L. 8222-6). Les pièces de candidature d'un marché public relèvent en plus du code de la commande publique, non traité ici.");

    // 9. Sous-traitant accepté
    if (sousTraitant) ajoute("Sous-traitant accepté", "info", "L'article L. 8222-1-1, créé par la loi n° 2026-534 du 25 juin 2026, obligera aussi le maître de l'ouvrage à vérifier les sous-traitants qu'il accepte. Il entre en vigueur à une date fixée par décret, au plus tard six mois après la promulgation. Prévoyez de lui remettre les mêmes pièces.");

    var nbBad = 0, nbWarn = 0, nbOk = 0;
    controles.forEach(function (c) { if (c.statut === "bad") nbBad++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "ok") nbOk++; });
    var etat, statutLabel, verdict;
    if (!obligatoire) { etat = "neutral"; statutLabel = "Non obligatoire"; verdict = "Sous le seuil de 5 000 € HT, la loi n'impose pas ces vérifications. Gardez le réflexe si le contrat peut grossir."; }
    else if (nbBad > 0) { etat = "bad"; statutLabel = "Bloquant"; verdict = nbBad + (nbBad > 1 ? " points bloquants" : " point bloquant") + " : en l'état, le client ne serait pas réputé avoir fait les vérifications et resterait exposé à la solidarité financière (article L. 8222-2)."; }
    else if (nbWarn > 0) { etat = "warn"; statutLabel = "À compléter"; verdict = "Dossier presque complet : " + nbWarn + (nbWarn > 1 ? " points à compléter" : " point à compléter") + " avant la signature."; }
    else { etat = "ok"; statutLabel = "Complet"; verdict = "Dossier complet à la conclusion. Il reste à tenir l'échéancier jusqu'à la fin d'exécution."; }

    var prochaine = lignes.length > 1 ? lignes[1].date : null;
    if (obligatoire && prochaine) actions.push("Programmer le renouvellement : " + (etabli === "etranger" ? "documents à jour" : "nouvelle attestation, délivrée après le " + fmtDate(addMonths(prochaine, -PERIODE_MOIS)) + ",") + " à remettre au plus tard le " + fmtDate(prochaine) + (lignes.length > 2 ? ", puis tous les six mois jusqu'à la fin d'exécution" : "") + ".");
    if (obligatoire) actions.push("Conserver les pièces et les dates de remise avec le contrat, pour pouvoir les produire en cas de contrôle.");

    var nbRemises = obligatoire ? lignes.length : 0;
    var message;
    var eur = fmtEur(montant);
    if (!obligatoire) message = ["Bonjour,", "", "Le contrat porte sur " + eur + " HT, sous le seuil de 5 000 € HT de l'article R. 8222-1 : l'attestation de vigilance n'est pas obligatoire. Nous pouvons la fournir si vous le souhaitez.", "", "Cordialement"].join("\n");
    else if (role === "prestataire") message = ["Bonjour,", "", "Pour notre contrat de " + eur + " HT, dont la signature est prévue le " + fmtDate(conclusion) + ", vous trouverez ci-joint :"].concat(pieces.map(function (t) { return "· " + t; })).concat(["", (prochaine ? "Nous vous adresserons une attestation à jour au plus tard le " + fmtDate(prochaine) + ", puis tous les six mois jusqu'à la fin de l'exécution." : "Le contrat se termine avant le premier renouvellement semestriel."), "L'attestation porte un code de sécurité qui permet d'en vérifier l'authenticité sur le site de l'Urssaf.", "", "Cordialement"]).join("\n");
    else message = ["Bonjour,", "", "Avant la signature de notre contrat de " + eur + " HT prévue le " + fmtDate(conclusion) + ", pourriez-vous nous transmettre :"].concat((pieces.length ? pieces : ["Attestation de vigilance de moins de six mois", "Extrait Kbis ou RNE, ou document mentionnant votre numéro d'immatriculation"]).map(function (t) { return "· " + t; })).concat(["", (prochaine ? "Nous vous redemanderons une attestation à jour au plus tard le " + fmtDate(prochaine) + ", puis tous les six mois jusqu'à la fin de l'exécution." : "Une remise à la signature suffit, le contrat se terminant avant six mois."), "", "Cordialement"]).join("\n");

    var recap = [
      "Obligation de vigilance : " + (obligatoire ? "oui" : "non") + " (" + eur + " HT, seuil 5 000 € HT)",
      "Position : " + ROLE_LABELS[role] + " ; client : " + CLIENT_LABELS[client] + " ; " + ETABLI_LABELS[etabli],
      "Conclusion : " + fmtDate(conclusion) + " ; fin d'exécution : " + fmtDate(fin),
      "Pièce sociale : " + TYPE_ATT_LABELS[typeAtt] + (att && (typeAtt === "urssaf" || typeAtt === "provisoire") ? " du " + fmtDate(att) : ""),
      "Remises prévues : " + nbRemises + (nbRemises ? " (" + lignes.map(function (l) { return fmtDate(l.date); }).join(", ") + ")" : ""),
      "Statut : " + statutLabel + " (" + nbBad + " bloquant" + (nbBad > 1 ? "s" : "") + ", " + nbWarn + " à compléter, " + nbOk + " conforme" + (nbOk > 1 ? "s" : "") + ")",
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      role: role, client: client, etabli: etabli, typeAttestation: typeAtt, piece: piece, montant: montant,
      obligatoire: obligatoire, obligationLabel: obligatoire ? "Oui" : "Non", datesOk: datesOk,
      echeances: obligatoire ? lignes : [], nbRemises: nbRemises, prochaine: obligatoire ? prochaine : null,
      controles: controles, nbBad: nbBad, nbWarn: nbWarn, nbOk: nbOk, etat: etat, statutLabel: statutLabel,
      verdict: verdict, actions: actions, pieces: pieces, message: message, recap: recap,
      dernierJour: att ? dernierJourUtile(att) : null
    };
  }
  function buildRecap(input) { return computeVigilance(input).recap; }

export { SEUIL_HT, PERIODE_MOIS, PRISON_ANS, AMENDE_MAX, SLUG, ROLE_LABELS, CLIENT_LABELS, ETABLI_LABELS, TYPE_ATT_LABELS, PIECE_LABELS, STATUT_LABELS, DEFAULTS, computeVigilance, buildRecap, echeancier, addMonths, fraicheAu, dernierJourUtile, parseDate, fmtDate, fmtEur };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = Object.keys(DEFAULTS);
    function read() { var o = {}; ids.forEach(function (k) { o[k] = $(k).value; }); return o; }
    function liste(id, items) {
      var ul = $(id); ul.innerHTML = "";
      items.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    }
    function render() {
      var r = computeVigilance(read());
      $("obligation").textContent = r.obligationLabel;
      $("statut").textContent = r.statutLabel;
      $("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      $("remises").textContent = r.nbRemises + (r.prochaine ? " (prochaine le " + fmtDate(r.prochaine) + ")" : "");
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("controles"); tb.innerHTML = "";
      r.controles.forEach(function (c) {
        var tr = document.createElement("tr");
        if (c.statut === "bad") tr.className = "cur"; else if (c.statut === "warn") tr.className = "weak";
        [c.point, STATUT_LABELS[c.statut], c.texte].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
        tb.appendChild(tr);
      });
      var te = $("echeances"); te.innerHTML = "";
      r.echeances.forEach(function (l) {
        var tr = document.createElement("tr");
        [fmtDate(l.date), l.label, l.texte].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
        te.appendChild(tr);
      });
      liste("pieces", r.pieces.length ? r.pieces : ["Aucune pièce exigée par les textes dans cette configuration."]);
      liste("actions", r.actions.length ? r.actions : ["Rien à faire de plus pour l'instant."]);
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
