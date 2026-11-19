/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-accord-confidentialite-nda";
  var ROLE_LABELS = { divulgateur: "entreprise qui transmet ses informations", destinataire: "fournisseur qui reçoit les informations" };
  var SENS_LABELS = { unilateral: "accord unilatéral", mutuel: "accord mutuel" };
  var MOMENT_LABELS = { avant: "signé avant tout envoi", apres: "signé après un premier envoi", nonSigne: "pas encore signé" };
  var BREVET_LABELS = { oui: "invention non encore déposée", non: "pas d'invention à breveter" };
  var ECHANTILLONS_LABELS = { oui: "échantillon ou prototype confié", non: "documents et fichiers seulement" };
  var DEFINITION_LABELS = { categories: "catégories listées et documents marqués", large: "« toute information échangée »", aucune: "aucune définition" };
  var ORAL_LABELS = { confirme: "oral confirmé par écrit", silence: "rien sur l'oral" };
  var EXCLUSIONS_LABELS = { completes: "quatre exclusions", partielles: "exclusions partielles", aucune: "aucune exclusion" };
  var FINALITE_LABELS = { limitee: "usage limité au devis", absente: "pas de finalité" };
  var RETRO_LABELS = { interdite: "rétro-ingénierie interdite", silence: "rien sur la rétro-ingénierie" };
  var DESTINATAIRES_LABELS = { besoin: "accès limité au besoin", libre: "accès libre", silence: "rien sur les destinataires" };
  var SURVIE_LABELS = { oui: "obligation maintenue après les discussions", non: "fin avec les discussions" };
  var RESTITUTION_LABELS = { prevue: "restitution prévue", silence: "rien sur la restitution" };
  var LICENCE_LABELS = { exclue: "aucune licence", silence: "rien sur les droits" };
  var SANCTION_LABELS = { penale: "clause pénale", droitCommun: "droit commun" };
  var ETRANGER_LABELS = { non: "partie établie en France", oui: "partie établie à l'étranger" };
  var JURIDICTION_LABELS = { prevue: "droit et tribunal prévus", silence: "rien sur le droit et le tribunal" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var DEFAULTS = {
    role: "divulgateur", sens: "unilateral", moment: "avant", dateSignature: "2026-11-05", brevet: "oui", echantillons: "oui",
    definition: "categories", oral: "silence", exclusions: "completes", finalite: "limitee", retro: "interdite", destinataires: "besoin",
    dureeAns: 5, vieAns: 8, survie: "oui", restitution: "silence", licence: "silence", sanction: "penale", penalite: 20000,
    etranger: "non", juridiction: "prevue"
  };

  function num(v, min, max, fallback) {
    var n = typeof v === "number" ? v : parseFloat(String(v === undefined || v === null ? "" : v).replace(/[\s\u00a0]/g, "").replace(",", "."));
    if (!isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }
  function pick(v, obj, fallback) { return Object.prototype.hasOwnProperty.call(obj, v) ? v : fallback; }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) { return groupe(Math.round(n)) + "\u00a0€"; }
  function pluriel(n, un, plusieurs) { return n + " " + (n > 1 ? plusieurs : un); }
  // Date ISO valide (AAAA-MM-JJ) ou null.
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var t = new Date(Date.UTC(y, mo - 1, d));
    if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d };
  }
  function bissextile(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  // Ajoute des années ; un 29 février tombe au 28 février d'une année non bissextile.
  function addYears(dt, n) {
    var y = dt.y + n, d = dt.d;
    if (dt.m === 2 && d === 29 && !bissextile(y)) d = 28;
    return { y: y, m: dt.m, d: d };
  }
  function fmtDate(dt) { return (dt.d === 1 ? "1er" : String(dt.d)) + " " + MOIS[dt.m - 1] + " " + dt.y; }
  function ans(n) { return pluriel(n, "an", "ans"); }

  function computeNda(input) {
    var d = {};
    for (var key in DEFAULTS) d[key] = input && input[key] !== undefined ? input[key] : DEFAULTS[key];
    var role = pick(d.role, ROLE_LABELS, "divulgateur");
    var sens = pick(d.sens, SENS_LABELS, "unilateral");
    var moment = pick(d.moment, MOMENT_LABELS, "nonSigne");
    var brevet = pick(d.brevet, BREVET_LABELS, "non");
    var echantillons = pick(d.echantillons, ECHANTILLONS_LABELS, "non");
    var definition = pick(d.definition, DEFINITION_LABELS, "aucune");
    var oral = pick(d.oral, ORAL_LABELS, "silence");
    var exclusions = pick(d.exclusions, EXCLUSIONS_LABELS, "aucune");
    var finalite = pick(d.finalite, FINALITE_LABELS, "absente");
    var retro = pick(d.retro, RETRO_LABELS, "silence");
    var destinataires = pick(d.destinataires, DESTINATAIRES_LABELS, "silence");
    var survie = pick(d.survie, SURVIE_LABELS, "non");
    var restitution = pick(d.restitution, RESTITUTION_LABELS, "silence");
    var licence = pick(d.licence, LICENCE_LABELS, "silence");
    var sanction = pick(d.sanction, SANCTION_LABELS, "droitCommun");
    var etranger = pick(d.etranger, ETRANGER_LABELS, "non");
    var juridiction = pick(d.juridiction, JURIDICTION_LABELS, "silence");
    var dureeAns = num(d.dureeAns, 0, 50, 0);
    var vieAns = num(d.vieAns, 1, 50, 1);
    var penalite = num(d.penalite, 0, 100000000, 0);
    var date = parseDate(d.dateSignature) || parseDate(DEFAULTS.dateSignature);
    var divulgateur = role === "divulgateur";

    var fin = dureeAns > 0 ? addYears(date, dureeAns) : null;
    var finLabel = fin ? fmtDate(fin) : "Sans limite écrite";
    var ecart = dureeAns > 0 ? dureeAns - vieAns : null;
    var ecartLabel = ecart === null ? "Durée à fixer" : (ecart >= 0 ? "Couverte" : ans(-ecart) + " de moins");
    var sanctionLabel = sanction === "penale" ? fmtEur(penalite) : "Préjudice à prouver";

    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    if (moment === "avant") add("Moment de la signature", "ok", "L'accord est signé avant le premier envoi : tout ce que vous échangez ensuite est couvert.");
    else if (moment === "apres") add("Moment de la signature", "warn", "Des fichiers sont partis avant la signature. Écrivez dans l'accord qu'il couvre aussi les informations transmises avant sa date, en les listant.");
    else add("Moment de la signature", "warn", "Rien n'est signé. N'envoyez ni plan ni fichier avant la signature : sans accord, il faut prouver soi-même le caractère confidentiel (article 1112-2 du code civil) ou un secret des affaires (article L151-1 du code de commerce).");

    if (brevet === "non") add("Invention et brevet", "info", "Pas d'invention à breveter : le secret des affaires et l'accord suffisent à protéger vos informations.");
    else if (moment === "avant") add("Invention et brevet", "ok", "L'accord précède la divulgation. Gardez une preuve de date de votre création (enveloppe e-Soleau de l'INPI) et faites le point sur un dépôt avec un conseil en propriété industrielle.");
    else if (moment === "apres") add("Invention et brevet", "bad", "Une invention a été montrée avant tout engagement de confidentialité. Cela peut compromettre la nouveauté exigée pour un brevet : voyez un conseil en propriété industrielle avant d'aller plus loin.");
    else add("Invention et brevet", "warn", "Une invention non déposée est en jeu : ne montrez rien avant la signature, ou déposez d'abord. L'INPI rappelle qu'une divulgation avant le dépôt peut détruire la nouveauté.");

    if (sens === "mutuel") add("Sens de l'accord", "ok", "Accord mutuel : les informations du fournisseur (procédé, méthode de chiffrage, prix) sont protégées comme celles du client.");
    else if (divulgateur) add("Sens de l'accord", "ok", "Accord unilatéral : il protège ce que vous transmettez, c'est le cas courant avant une demande de devis.");
    else add("Sens de l'accord", "info", "Accord unilatéral : votre devis, votre procédé et vos prix ne sont pas protégés. Si vous détaillez votre méthode, proposez un accord mutuel.");

    if (definition === "categories") add("Définition des informations", "ok", "Les catégories sont listées et les documents sont marqués : chacun sait ce qui est protégé.");
    else if (definition === "large") add("Définition des informations", "warn", "« Toute information échangée » est difficile à appliquer et à prouver. Listez les catégories : plans, fichiers, cahier des charges, prix cible, volumes, nom du client final.");
    else add("Définition des informations", "bad", "Sans définition, personne ne sait ce qui est protégé. C'est le premier article à écrire.");

    if (oral === "confirme") add("Informations orales", "ok", "Ce qui est dit en réunion ou au téléphone est couvert dès qu'il est confirmé par écrit.");
    else add("Informations orales", "warn", "L'accord ne dit rien de l'oral. Prévoyez une confirmation écrite (un courriel suffit) dans un délai court après chaque échange.");

    if (exclusions === "completes") add("Exclusions", "ok", "Les quatre exclusions classiques sont là : information publique, déjà connue, reçue d'un tiers, développée seul. L'article L151-3 du code de commerce reconnaît la découverte et la création indépendantes.");
    else if (exclusions === "partielles") add("Exclusions", "warn", "Il manque une partie des exclusions. Vérifiez les quatre : information publique, déjà connue, reçue d'un tiers, développée seul.");
    else if (divulgateur) add("Exclusions", "warn", "Aucune exclusion : un fournisseur sérieux refusera de signer ou demandera de les ajouter. Mieux vaut les prévoir tout de suite.");
    else add("Exclusions", "bad", "Aucune exclusion : vous vous engagez sur des informations que vous connaissiez déjà ou qui sont publiques. Ne signez pas sans les quatre exclusions.");

    if (finalite === "limitee") add("Finalité", "ok", "L'usage est limité à l'étude de la demande et au devis : le destinataire ne peut pas s'en servir pour autre chose.");
    else add("Finalité", "bad", "L'accord interdit de divulguer mais pas d'utiliser. Ajoutez que les informations servent uniquement à étudier la demande et à établir le devis (l'article L151-5 du code de commerce vise les deux).");

    if (echantillons === "non") add("Rétro-ingénierie", "info", "Aucun échantillon confié. Si vous en envoyez un plus tard, ajoutez une clause sur le démontage et les essais.");
    else if (retro === "interdite") add("Rétro-ingénierie", "ok", "Le démontage et l'analyse de l'échantillon sont interdits, hors mesures utiles au devis.");
    else if (divulgateur) add("Rétro-ingénierie", "bad", "Un échantillon est confié et l'accord ne dit rien : l'article L151-3 du code de commerce rend licite l'étude d'un objet détenu sans obligation contraire. Ajoutez l'interdiction.");
    else add("Rétro-ingénierie", "info", "Un échantillon vous est confié et l'accord ne dit rien. Le client vous demandera sûrement de ne pas le démonter : précisez ce qui reste permis pour chiffrer (mesures, essais).");

    if (destinataires === "besoin") add("Destinataires", "ok", "Seules les personnes qui en ont besoin pour le devis reçoivent les informations, sous-traitants compris s'ils sont acceptés par écrit.");
    else if (destinataires === "libre") add("Destinataires", "warn", "Toute l'entreprise et ses partenaires peuvent recevoir les informations : limitez au besoin du devis et faites accepter les sous-traitants par écrit.");
    else add("Destinataires", "warn", "L'accord ne dit pas qui peut recevoir les informations. Précisez-le, en particulier pour les sous-traitants.");

    if (dureeAns === 0) add("Durée", "warn", "Aucune durée écrite. Les engagements perpétuels sont prohibés (article 1210 du code civil) et un engagement sans durée peut être résilié à tout moment avec un préavis raisonnable (article 1211). Fixez une durée.");
    else if (ecart < 0) add("Durée", divulgateur ? "warn" : "info", "L'obligation s'arrête le " + finLabel + ", " + ans(-ecart) + " avant que l'information perde sa valeur selon votre estimation. " + (divulgateur ? "Allongez la durée à " + ans(vieAns) + "." : "Le client pourra demander plus long."));
    else add("Durée", "ok", "L'obligation court jusqu'au " + finLabel + ", au moins aussi longtemps que l'information garde sa valeur selon votre estimation.");

    if (survie === "oui") add("Après les discussions", "ok", "L'obligation continue que le devis soit accepté ou non.");
    else add("Après les discussions", "warn", "L'accord prend fin avec les discussions : un devis refusé libère le destinataire. Écrivez que l'obligation continue pendant toute sa durée, quelle que soit l'issue.");

    if (restitution === "prevue") add("Restitution et destruction", "ok", "Les fichiers sont rendus ou détruits sur demande, avec une confirmation écrite.");
    else add("Restitution et destruction", "warn", "Rien n'est prévu pour la fin. Ajoutez la destruction des fichiers et des copies sur demande, avec une confirmation écrite, sauf copies légales à conserver.");

    if (licence === "exclue") add("Droits sur les informations", "ok", "L'accord ne donne aucune licence et n'oblige personne à commander ni à chiffrer.");
    else add("Droits sur les informations", "info", "L'accord ne dit rien des droits. Une phrase évite tout malentendu : aucune licence, aucune obligation de commander ni de remettre un devis.");

    if (sanction === "penale" && penalite > 0) add("Sanction", "ok", "Une pénalité de " + fmtEur(penalite) + " est prévue : pas besoin de prouver le montant du préjudice. Le juge peut la réduire si elle est manifestement excessive (article 1231-5 du code civil).");
    else if (sanction === "penale") add("Sanction", "warn", "Une clause pénale est prévue sans montant. Chiffrez-la, à un niveau en rapport avec ce que vaut l'information.");
    else if (divulgateur) add("Sanction", "warn", "Sans clause pénale, il faudra prouver le préjudice et son lien avec le manquement, ce qui n'a pas abouti dans l'affaire jugée le 7 mai 2019 (Cass. com., n° 18-11.128). Envisagez une pénalité chiffrée.");
    else add("Sanction", "info", "Droit commun : en cas de manquement, le client devra prouver son préjudice. Les articles L152-1 et suivants du code de commerce restent ouverts en cas d'atteinte au secret des affaires.");

    if (juridiction === "prevue") add("Droit applicable et tribunal", "ok", "Le droit applicable et le tribunal compétent sont écrits.");
    else if (etranger === "oui") add("Droit applicable et tribunal", "warn", "L'autre partie est à l'étranger et l'accord ne dit rien : fixez le droit applicable et le tribunal compétent avant de signer.");
    else add("Droit applicable et tribunal", "info", "Les deux parties sont en France : à défaut de clause, les règles ordinaires s'appliquent. Une ligne sur le tribunal compétent reste utile.");

    var nb = { ok: 0, warn: 0, bad: 0, info: 0 };
    for (var i = 0; i < controles.length; i++) nb[controles[i].statut]++;
    var etat = nb.bad > 0 ? "bad" : (nb.warn > 0 ? "warn" : "ok");
    var verdict;
    if (etat === "bad") verdict = pluriel(nb.bad, "point bloquant", "points bloquants") + (nb.warn ? " et " + pluriel(nb.warn, "point", "points") + " à compléter" : "") + " : corrigez l'accord avant tout envoi de fichiers.";
    else if (etat === "warn") verdict = "Aucun point bloquant, mais " + pluriel(nb.warn, "point", "points") + " à compléter avant la signature.";
    else verdict = "L'accord couvre les points essentiels. Gardez la version signée et la liste de ce que vous avez envoyé, avec les dates.";
    verdict += fin ? " Obligation jusqu'au " + finLabel + "." : " Aucune date de fin écrite.";

    // Clauses proposées, avec les points corrigés.
    var dureeProposee = dureeAns === 0 ? vieAns : (divulgateur ? Math.max(dureeAns, vieAns) : dureeAns);
    var finProposee = fmtDate(addYears(date, dureeProposee));
    var qui = sens === "mutuel" ? "Chaque partie, pour les informations qu'elle reçoit de l'autre," : "Le Destinataire";
    var de = sens === "mutuel" ? "de l'autre partie" : "du Divulgateur";
    var art = [];
    art.push("Objet : le présent accord encadre les informations " + de + " communiquées pour l'étude de la demande de devis [objet de la demande]" + (moment === "avant" ? "." : ", y compris celles transmises avant sa signature et listées en annexe."));
    art.push("Informations confidentielles : plans, fichiers, cahier des charges, prix cible, volumes, nom du client final et tout document marqué « Confidentiel », ainsi que les informations orales identifiées comme confidentielles et confirmées par écrit dans les [8] jours.");
    art.push("Exclusions : ne sont pas confidentielles les informations publiques sans faute du destinataire, déjà connues de lui, reçues d'un tiers libre de les communiquer ou développées par lui de façon indépendante, ce qu'il lui revient de prouver.");
    art.push("Usage : " + qui.charAt(0).toLowerCase() + qui.slice(1) + " n'utilise les informations que pour étudier la demande et établir le devis, et ne les communique qu'aux personnes qui en ont besoin à cette fin, sous-traitants compris s'ils ont été acceptés par écrit et sont tenus aux mêmes obligations.");
    if (echantillons === "oui") art.push("Échantillons : l'échantillon confié reste la propriété de son propriétaire. Il ne peut être démonté, analysé ou reproduit, hors mesures et essais nécessaires au devis.");
    art.push("Durée : l'obligation de confidentialité court pendant " + ans(dureeProposee) + " à compter du [date de signature], soit jusqu'au " + finProposee + ", que le devis soit accepté ou non.");
    art.push("Fin : à la première demande, ou en cas de devis non retenu, le destinataire restitue ou détruit les informations et leurs copies et le confirme par écrit sous [15] jours, sauf copies qu'il doit conserver en vertu de la loi.");
    art.push("Droits : l'accord ne donne aucune licence et n'oblige ni à commander ni à remettre un devis.");
    if (sanction === "penale") art.push("Sanction : tout manquement entraîne le paiement d'une pénalité de " + (penalite > 0 ? fmtEur(penalite) : "[montant] €") + ", sans préjudice des autres recours.");
    else art.push("Sanction : tout manquement engage la responsabilité de son auteur dans les conditions du droit commun.");
    art.push("Droit applicable : l'accord est soumis au droit français. Tout litige relève de [la juridiction compétente du ressort de ville].");
    var clause = "Accord de confidentialité";
    for (var j = 0; j < art.length; j++) clause += "\n" + (j + 1) + ". " + art[j];

    var actions = [];
    for (var k = 0; k < controles.length; k++) if (controles[k].statut === "bad" || controles[k].statut === "warn") actions.push(controles[k].point + " : " + controles[k].texte);
    actions.push("Notez dans le dossier la date de signature, la durée et la liste des fichiers envoyés, avec leurs dates.");

    var aTraiter = [];
    for (var q = 0; q < controles.length; q++) if (controles[q].statut === "bad" || controles[q].statut === "warn") aTraiter.push(controles[q].point.toLowerCase());
    var message;
    if (divulgateur) {
      message = "Bonjour,\n\nPour vous permettre de chiffrer notre demande, nous allons vous transmettre des plans et des fichiers confidentiels. ";
      message += moment === "avant" && etat === "ok" ? "L'accord de confidentialité est signé : vous recevrez les fichiers dans la journée." : "Avant cet envoi, nous vous proposons l'accord de confidentialité ci-joint, d'une durée de " + ans(dureeProposee) + ", limité à l'étude de la demande et au devis.";
      message += "\n\nMerci de nous le retourner signé, ou de nous dire ce qui vous pose question.\n\nBien cordialement,\n[Nom]";
    } else {
      message = "Bonjour,\n\nMerci pour votre demande de devis et pour votre projet d'accord de confidentialité. ";
      message += aTraiter.length ? "Avant de le signer, nous souhaitons revoir ces points : " + aTraiter.join(", ") + ". Vous trouverez une proposition de rédaction ci-dessous." : "Il nous convient : nous vous le retournons signé et attendons vos fichiers pour établir le devis.";
      message += "\n\nBien cordialement,\n[Nom]";
    }

    var statutLabel = STATUT_LABELS[etat];
    var recap = [
      "Accord de confidentialité : contrôle avant devis",
      "Position : " + ROLE_LABELS[role],
      "Accord : " + SENS_LABELS[sens] + ", " + MOMENT_LABELS[moment],
      "Signature : " + fmtDate(date),
      "Durée : " + (dureeAns > 0 ? ans(dureeAns) + ", jusqu'au " + finLabel : "aucune durée écrite"),
      "Vie de l'information : " + ans(vieAns) + " (estimation)",
      "Sanction : " + (sanction === "penale" ? "clause pénale de " + fmtEur(penalite) : "droit commun, préjudice à prouver"),
      "Échantillons : " + ECHANTILLONS_LABELS[echantillons] + (echantillons === "oui" ? ", " + RETRO_LABELS[retro] : ""),
      "Statut : " + statutLabel + " (" + nb.bad + " bloquant" + (nb.bad > 1 ? "s" : "") + ", " + nb.warn + " à compléter, " + nb.ok + " conforme" + (nb.ok > 1 ? "s" : "") + ", " + nb.info + " pour information)",
      "Points à traiter : " + (aTraiter.length ? aTraiter.join(", ") : "aucun"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      role: role, sens: sens, moment: moment, dureeAns: dureeAns, vieAns: vieAns, penalite: penalite, sanction: sanction,
      date: date, fin: fin, finLabel: finLabel, ecart: ecart, ecartLabel: ecartLabel, sanctionLabel: sanctionLabel,
      controles: controles, nbOk: nb.ok, nbWarn: nb.warn, nbBad: nb.bad, nbInfo: nb.info, etat: etat, statutLabel: statutLabel,
      verdict: verdict, dureeProposee: dureeProposee, clause: clause, articles: art.length, actions: actions, message: message, recap: recap
    };
  }
  function buildRecap(input) { return computeNda(input).recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, ROLE_LABELS, SENS_LABELS, MOMENT_LABELS, BREVET_LABELS, ECHANTILLONS_LABELS, DEFINITION_LABELS, ORAL_LABELS, EXCLUSIONS_LABELS, FINALITE_LABELS, RETRO_LABELS, DESTINATAIRES_LABELS, SURVIE_LABELS, RESTITUTION_LABELS, LICENCE_LABELS, SANCTION_LABELS, ETRANGER_LABELS, JURIDICTION_LABELS, computeNda, buildRecap, fmtEur, fmtDate, addYears, parseDate, num };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var IDS = Object.keys(DEFAULTS);
    var $ = function (id) { return document.getElementById(id); };
    var read = function () { var o = {}; for (var i = 0; i < IDS.length; i++) o[IDS[i]] = $(IDS[i]).value; return o; };
    var render = function () {
      var r = computeNda(read());
      $("fin").textContent = r.finLabel;
      $("ecart").textContent = r.ecartLabel;
      $("sanctionOut").textContent = r.sanctionLabel;
      $("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      $("verdict").className = "alert " + r.etat;
      $("verdict").textContent = r.verdict;
      var tb = $("controles");
      tb.innerHTML = "";
      for (var i = 0; i < r.controles.length; i++) {
        var c = r.controles[i];
        var tr = document.createElement("tr");
        if (c.statut === "bad") tr.className = "cur";
        else if (c.statut === "warn") tr.className = "weak";
        var a = document.createElement("td"); a.textContent = c.point;
        var b = document.createElement("td"); b.textContent = STATUT_LABELS[c.statut];
        var t = document.createElement("td"); t.textContent = c.texte;
        tr.appendChild(a); tr.appendChild(b); tr.appendChild(t); tb.appendChild(tr);
      }
      $("clause").textContent = r.clause;
      var ul = $("actions");
      ul.innerHTML = "";
      for (var j = 0; j < r.actions.length; j++) { var li = document.createElement("li"); li.textContent = r.actions[j]; ul.appendChild(li); }
      $("message").textContent = r.message;
      $("recap").textContent = r.recap;
    };
    for (var n = 0; n < IDS.length; n++) { $(IDS[n]).addEventListener("input", render); $(IDS[n]).addEventListener("change", render); }
    var btns = document.querySelectorAll("button.copy");
    for (var b2 = 0; b2 < btns.length; b2++) {
      btns[b2].addEventListener("click", function (ev) {
        var target = $(ev.currentTarget.getAttribute("data-target"));
        if (target && navigator.clipboard) navigator.clipboard.writeText(target.textContent);
      });
    }
    render();
  
  return built.snapshot();
}
