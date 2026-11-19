/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-pouvoir-signataire-devis";
  var FORME_LABELS = { sarl: "SARL ou EURL", sas: "SAS ou SASU", sa: "SA", association: "association", ei: "entreprise individuelle", autre: "autre structure", public: "acheteur public" };
  var QUALITE_LABELS = {
    dirigeant: "représentant légal",
    dg_statutaire: "directeur général ou directeur général délégué",
    salarie_ecrite: "salarié avec délégation écrite",
    salarie_annonce: "salarié, délégation annoncée mais pas montrée",
    salarie_aucune: "salarié sans délégation",
    mandataire_ecrit: "mandataire avec mandat écrit",
    mandataire_sans: "mandataire sans mandat écrit",
    inconnu: "signataire inconnu"
  };
  var REGISTRE_LABELS = { verifie: "représentant légal vérifié", non_verifie: "pas vérifié", discordant: "nom discordant ou ancien dirigeant" };
  var APPARENCE_LABELS = { forte: "forte", moyenne: "moyenne", faible: "faible" };
  var HISTORIQUE_LABELS = { precedent_paye: "devis déjà signés et payés", premier: "première commande" };
  var CONFIRMATION_LABELS = { confirme: "confirmation écrite reçue", envoyee: "demande envoyée", aucune: "aucune demande" };
  var ACOMPTE_LABELS = { verse_societe: "payé par le client", prevu: "prévu", aucun: "pas d'acompte" };
  var LABEL_SETS = { forme: FORME_LABELS, qualite: QUALITE_LABELS, registre: REGISTRE_LABELS, apparence: APPARENCE_LABELS, historique: HISTORIQUE_LABELS, confirmation: CONFIRMATION_LABELS, acompte: ACOMPTE_LABELS };
  var REP_LEGAL = {
    sarl: "le gérant (article L223-18 du code de commerce)",
    sas: "le président (article L227-6 du code de commerce), ou un directeur général ou directeur général délégué si les statuts le prévoient",
    sa: "le directeur général (article L225-56 du code de commerce) ou, dans une SA à directoire, le président du directoire",
    association: "la personne que désignent les statuts, souvent le président",
    ei: "l'entrepreneur lui-même",
    autre: "la personne que désignent la loi et les statuts (gérant, administrateur)",
    public: "la personne habilitée à signer selon les règles de l'acheteur"
  };
  var TITRE = { sarl: "gérant", sas: "président", sa: "directeur général", association: "représentant désigné par les statuts", ei: "entrepreneur", autre: "représentant légal", public: "personne habilitée à signer pour l'acheteur" };
  var NIVEAU_LABELS = { ok: "Pouvoir établi", warn: "À sécuriser", bad: "Pouvoir non établi" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = ["Forme du client et représentant légal", "Qualité du signataire", "Vérification au registre", "Délégation et étendue du pouvoir", "Montant et limites internes", "Apparence et mandat apparent", "Confirmation du représentant légal", "Délai fixé dans la demande", "Ratification et acompte", "Preuves à garder"];
  var DEFAULTS = { forme: "sas", qualite: "salarie_annonce", montant: "38600", plafond: "0", registre: "verifie", apparence: "moyenne", historique: "premier", confirmation: "envoyee", dateDemande: "2026-11-20", delai: "10", dateDebut: "2026-12-07", acompte: "prevu" };
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  function dec(v, max) {
    var s = String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    var n = parseFloat(s);
    if (!isFinite(n) || n < 0) n = 0;
    if (n > max) n = max;
    return Math.round(n * 100);
  }
  function num(v, max) {
    var s = String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    var n = parseFloat(s);
    if (!isFinite(n) || n < 0) n = 0;
    if (n > max) n = max;
    return Math.floor(n);
  }
  function groupInt(n) {
    var s = String(n);
    var out = "";
    while (s.length > 3) { out = " " + s.slice(-3) + out; s = s.slice(0, -3); }
    return s + out;
  }
  function fmtEur(cents) {
    var c = Math.round(cents);
    var e = Math.floor(c / 100);
    var r = c % 100;
    return groupInt(e) + (r ? "," + (r < 10 ? "0" : "") + r : "") + " €";
  }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s == null ? "" : s));
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return d;
  }
  function fmtDate(d) {
    if (!d) return "[date]";
    return JOURS[d.getUTCDay()] + " " + d.getUTCDate() + " " + MOIS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function isoDate(d) { return d ? d.toISOString().slice(0, 10) : ""; }
  function addDays(d, n) { return d ? new Date(d.getTime() + n * 86400000) : null; }
  function diffDays(a, b) { return Math.round((b.getTime() - a.getTime()) / 86400000); }
  function pick(set, v, def) { return Object.prototype.hasOwnProperty.call(set, v) ? v : def; }
  function plural(n, s, p) { return n + " " + (n > 1 ? p : s); }

  function normalize(inp) {
    var i = inp || {};
    var o = {};
    Object.keys(LABEL_SETS).forEach(function (k) { o[k] = pick(LABEL_SETS[k], i[k], DEFAULTS[k]); });
    o.montantCents = dec(i.montant, 100000000);
    o.plafondCents = dec(i.plafond, 100000000);
    o.delaiJ = num(i.delai, 365);
    o.dDemande = parseDate(i.dateDemande);
    o.dDebut = parseDate(i.dateDebut);
    return o;
  }

  function computePouvoir(inp) {
    var o = normalize(inp);
    var q = o.qualite, f = o.forme;
    var societe = f === "sarl" || f === "sas" || f === "sa";
    var legal = q === "dirigeant" || (q === "dg_statutaire" && (f === "sas" || f === "sa"));
    var ecrit = q === "salarie_ecrite" || q === "mandataire_ecrit";
    var depasse = ecrit && o.plafondCents > 0 && o.montantCents > o.plafondCents;
    var written = ecrit && !depasse && o.registre !== "discordant";
    var confirmed = o.confirmation === "confirme" && o.registre !== "discordant";
    var envoyee = o.confirmation === "envoyee" && !legal;
    var etabli = (legal && o.registre === "verifie") || written || confirmed;
    var echeance = envoyee && o.dDemande ? addDays(o.dDemande, o.delaiJ) : null;
    var m = fmtEur(o.montantCents);
    var p = fmtEur(o.plafondCents);
    var c = [];
    var add = function (statut, texte) { c.push({ point: POINTS[c.length], statut: statut, texte: texte }); };

    // 0 Forme
    if (f === "public") add("warn", "Un acheteur public suit ses propres règles de signature et de délégation, et souvent un bon de commande. Vérifiez qui est habilité à signer chez lui avant de lancer quoi que ce soit.");
    else add("info", "Pour une " + FORME_LABELS[f] + ", la personne qui engage le client est " + REP_LEGAL[f] + ".");

    // 1 Qualité
    if (confirmed) add("ok", "Le représentant légal a confirmé par écrit que le signataire (" + QUALITE_LABELS[q] + ") peut conclure ce devis.");
    else if (legal) {
      if (o.registre === "verifie") add("ok", "Le signataire est le " + (q === "dg_statutaire" ? "directeur général ou directeur général délégué prévu par les statuts" : TITRE[f]) + ", et vous l'avez vérifié au registre.");
      else if (o.registre === "discordant") add("bad", "Le signataire se présente comme représentant légal, mais le registre ne le confirme pas.");
      else add("warn", "Le signataire se présente comme représentant légal : vérifiez-le au registre avant de lancer la commande.");
    } else if (q === "dg_statutaire") add("warn", "Dans cette forme, le titre de directeur général ne donne pas à lui seul le pouvoir d'engager le client : demandez une délégation ou la confirmation du représentant légal.");
    else if (ecrit) {
      if (depasse) add("bad", "La délégation reçue ne couvre pas ce montant.");
      else add("ok", "Le signataire agit en vertu d'un écrit que vous avez reçu (" + QUALITE_LABELS[q] + ").");
    } else if (q === "salarie_annonce") add("warn", "Le signataire dit avoir une délégation, mais vous ne l'avez pas vue : pour l'instant, rien ne prouve son pouvoir.");
    else add("bad", "Rien ne montre que le signataire (" + QUALITE_LABELS[q] + ") peut engager le client.");

    // 2 Registre
    if (o.registre === "verifie") add("ok", f === "ei" ? "Vous avez vérifié que l'entrepreneur inscrit est bien la personne avec qui vous traitez, et gardé la preuve." : "Le représentant légal inscrit est connu et la preuve est gardée (capture datée ou justificatif d'immatriculation).");
    else if (o.registre === "discordant") add("bad", "La société ne peut vous opposer un changement de dirigeant que s'il a été publié au registre (article L123-9 du code de commerce) ; s'il l'est, il vous est opposable. Clarifiez qui dirige le client avant toute chose.");
    else add("warn", "Vérifiez le représentant légal sur l'Annuaire des entreprises ou sur un justificatif d'immatriculation, et gardez une capture datée.");

    // 3 Délégation
    if (legal) add("info", "Pas de délégation à demander : le représentant légal tient son pouvoir de la loi et des statuts.");
    else if (confirmed) add("ok", "La confirmation écrite du représentant légal tient lieu de preuve du pouvoir pour cet acte.");
    else if (ecrit) {
      if (depasse) add("bad", "Le montant (" + m + ") dépasse le plafond écrit (" + p + ") : au-delà de ses pouvoirs, l'acte est inopposable au client (article 1156 du code civil), sauf ratification.");
      else if (o.registre === "discordant") add("warn", "L'écrit reçu doit venir du représentant légal actuel : vérifiez qui l'a signé.");
      else add("ok", "Écrit reçu" + (o.plafondCents > 0 ? ", plafond " + p + " respecté" : ", sans plafond indiqué") + ". Vérifiez qu'il vise ce type de contrat : un pouvoir défini en termes généraux ne couvre que les actes conservatoires et d'administration (article 1155 du code civil).");
    } else if (q === "salarie_annonce" || q === "dg_statutaire") add("warn", "Demandez la copie de la délégation, ou la confirmation écrite du représentant légal.");
    else add("bad", "Aucun pouvoir montré : un acte accompli par un représentant sans pouvoir est inopposable au client (article 1156 du code civil), sauf mandat apparent ou ratification.");

    // 4 Montant
    if (o.montantCents <= 0) add("warn", "Indiquez le montant hors taxes du devis : c'est lui qu'il faut comparer au pouvoir du signataire.");
    else if (legal && societe) add("info", "Montant : " + m + ". Les clauses des statuts qui limitent les pouvoirs du dirigeant sont inopposables aux tiers (articles L223-18, L227-6 et L225-56 du code de commerce) : elles jouent entre associés, pas contre vous.");
    else if (legal && f === "ei") add("info", "Montant : " + m + ". L'entrepreneur s'engage lui-même.");
    else if (legal && f === "public") add("info", "Montant : " + m + ". Les seuils et la forme de l'engagement relèvent des règles de l'acheteur public.");
    else if (legal) add("warn", "Montant : " + m + ". Pour cette forme, les statuts peuvent organiser ou limiter le pouvoir de signer : demandez-les si l'enjeu est important.");
    else add("info", "Montant : " + m + ". " + (o.plafondCents > 0 ? "Plafond écrit : " + p + "." : "Aucun plafond écrit.") + " Une bonne délégation nomme le type de contrat et le montant maximal.");

    // 5 Apparence
    if (etabli) add("info", "Le pouvoir est établi : vous n'avez pas besoin de l'argument du mandat apparent.");
    else if (o.apparence === "faible") add("bad", "Rien ne permet de soutenir que vous avez légitimement cru au pouvoir du signataire (article 1156 du code civil). Ne comptez pas sur l'apparence.");
    else if (o.apparence === "forte" && o.historique === "precedent_paye") add("warn", "Vous pourriez soutenir avoir légitimement cru au pouvoir du signataire, en raison du comportement du client (article 1156 du code civil). C'est un argument à faire valoir en cas de litige, pas une garantie : sécurisez plutôt par écrit.");
    else add("warn", "L'apparence est un argument fragile ici. Le texte vise surtout le comportement ou les déclarations du client lui-même, pas ce que dit le signataire.");

    // 6 Confirmation
    if (legal) add("info", "La demande de confirmation de l'article 1158 du code civil vise le représentant conventionnel. Pour un représentant légal, la vérification au registre suffit.");
    else if (confirmed) add("ok", "Confirmation écrite reçue : gardez-la dans le dossier avec le devis signé.");
    else if (envoyee) {
      if (!o.dDemande) add("warn", "Indiquez la date d'envoi de la demande pour connaître la fin du délai.");
      else if (o.dDebut && o.dDebut.getTime() < echeance.getTime()) add("bad", "Vous prévoyez de commander ou de démarrer le " + fmtDate(o.dDebut) + ", avant la fin du délai de réponse (" + fmtDate(echeance) + ").");
      else add("warn", "Réponse attendue au plus tard le " + fmtDate(echeance) + ". Sans réponse à cette date, le signataire est réputé habilité à conclure ce devis, à condition que votre écrit l'ait annoncé (article 1158 du code civil)." + (o.dDebut ? "" : " Indiquez aussi la date de démarrage prévue."));
    } else if (written) add("info", "Pas indispensable : l'écrit reçu suffit. Elle reste utile si vous doutez de son étendue.");
    else add("warn", "Envoyez au représentant légal une demande écrite de confirmation, avec une date de réponse précise et la mention prévue par l'article 1158 du code civil. Le texte vise un acte que vous vous apprêtez à conclure : envoyez-la avant de traiter le devis comme accepté.");

    // 7 Délai
    if (envoyee && o.delaiJ <= 0) add("bad", "Un délai de 0 jour ne laisse pas au client le temps de répondre : le texte exige un délai raisonnable. Renvoyez la demande avec une date de réponse.");
    else if (envoyee && o.dDemande) add("info", "Délai de " + plural(o.delaiJ, "jour", "jours") + ", fin le " + fmtDate(echeance) + ". Le code civil ne fixe pas de durée : il doit être raisonnable. Écrivez la date de réponse dans la demande, pas seulement un nombre de jours.");
    else if (envoyee) add("info", "Date d'envoi manquante : la fin du délai ne peut pas être calculée.");
    else add("info", "Pas de demande en cours. Si vous en envoyez une, fixez une date de réponse précise et raisonnable.");

    // 8 Ratification
    if (o.acompte === "verse_societe") {
      if (etabli) add("info", "L'acompte payé par le client confirme qu'il exécute le devis.");
      else add("ok", "Un acompte payé depuis un compte du client après la signature est un indice de ratification tacite (article 1998, alinéa 2, et article 1156, alinéa 3, du code civil). Faites-la confirmer par écrit.");
    } else if (o.acompte === "prevu") add("info", "Demandez que l'acompte soit payé depuis un compte au nom du client : ce paiement aide à montrer qu'il a accepté le devis.");
    else add("info", "Sans acompte, une ratification devra venir d'un écrit ou d'un autre acte clair du client.");

    // 9 Preuves
    add("info", "Gardez dans le dossier : la preuve de vérification au registre, la délégation ou la confirmation, l'e-mail d'acceptation et la date de chaque pièce.");

    var nb = { ok: 0, warn: 0, bad: 0, info: 0 };
    c.forEach(function (x) { nb[x.statut]++; });
    var etat = nb.bad ? "bad" : nb.warn ? "warn" : "ok";
    var verdict;
    if (nb.bad) verdict = plural(nb.bad, "point bloquant", "points bloquants") + " : le pouvoir du signataire n'est pas établi. Ne lancez rien avant une délégation écrite ou une confirmation du représentant légal.";
    else if (nb.warn) verdict = "Aucun point bloquant, " + nb.warn + " à compléter. Signataire : à sécuriser avant de lancer la commande.";
    else verdict = "Aucun point bloquant ni à compléter. Signataire : pouvoir établi pour ce devis.";

    var engage = etabli ? (f === "ei" ? "L'entrepreneur" : f === "association" ? "L'association cliente" : f === "public" ? "L'acheteur public, selon ses règles" : "La société cliente") : "Incertain (article 1156)";
    var echeanceLabel = echeance ? fmtDate(echeance) : (envoyee ? "[date d'envoi manquante]" : "Pas de demande en cours");

    var actions = [];
    if (o.registre !== "verifie") actions.push("Vérifiez le représentant légal sur l'Annuaire des entreprises ou un justificatif d'immatriculation, et gardez une capture datée.");
    if (q === "salarie_annonce" && !confirmed) actions.push("Demandez la copie de la délégation annoncée par le signataire.");
    if (depasse && !confirmed) actions.push("Demandez une délégation qui couvre " + m + ", ou la signature du représentant légal.");
    if (!legal && !etabli && o.confirmation === "aucune") actions.push("Envoyez au représentant légal la demande de confirmation ci-dessous, avec une date de réponse précise.");
    if (envoyee && o.delaiJ <= 0) actions.push("Renvoyez la demande avec un délai raisonnable et une date de réponse écrite.");
    if (envoyee && echeance && o.delaiJ > 0) actions.push("Ne commandez rien et ne démarrez pas avant le " + fmtDate(echeance) + ", sauf confirmation reçue plus tôt.");
    if (envoyee && !o.dDemande) actions.push("Notez la date d'envoi de la demande de confirmation.");
    if (!o.dDebut) actions.push("Indiquez la date prévue de commande de matériel ou de démarrage.");
    if (o.montantCents <= 0) actions.push("Indiquez le montant hors taxes du devis.");
    if (f === "public") actions.push("Suivez les règles de signature de l'acheteur public (délégation de signature, bon de commande).");
    if (legal && (f === "association" || f === "autre")) actions.push("Demandez les statuts si l'enjeu est important.");
    if (o.acompte === "prevu") actions.push("Demandez que l'acompte soit payé depuis un compte au nom du client.");
    actions.push("Classez dans le dossier la preuve de vérification, la délégation ou la confirmation, et l'e-mail d'acceptation.");

    var titre = q === "dg_statutaire" && legal ? "directeur général ou directeur général délégué" : TITRE[f];
    var clause = [
      "Article [X] : Signature et pouvoir du signataire",
      "Le présent devis est accepté au nom et pour le compte de [raison sociale du client], " + FORME_LABELS[f] + ", par [nom du signataire], agissant en qualité de [fonction].",
      "Le signataire déclare disposer du pouvoir d'engager le client pour ce devis, d'un montant de " + m + " hors taxes.",
      legal ? "Il est inscrit comme " + titre + " à la date de signature." : "Il agit en vertu d'une délégation écrite de [nom du représentant légal], jointe au devis ou remise avant tout début d'exécution.",
      legal ? "Tout changement de représentant légal en cours d'exécution est signalé par écrit au prestataire." : "À défaut de délégation remise, le prestataire peut demander par écrit au représentant légal du client de confirmer le pouvoir du signataire, dans le délai fixé dans sa demande (article 1158 du code civil).",
      legal ? "Les commandes de matériel sont lancées à réception de l'acceptation signée" + (o.acompte !== "aucun" ? " et de l'acompte." : ".") : "Aucune commande de matériel ni aucun démarrage n'intervient avant la remise de la délégation, la confirmation écrite ou l'expiration de ce délai sans réponse.",
      o.acompte !== "aucun" ? "L'acompte est payé depuis un compte ouvert au nom du client." : "Les factures sont réglées depuis un compte ouvert au nom du client.",
      "Tout avenant ou toute modification du devis est signé par une personne disposant du même pouvoir."
    ].join("\n");

    var message;
    if (legal) {
      message = ["Objet : Acceptation de notre devis n° [numéro] du [date]", "", "Bonjour [nom],", "", "Nous avons bien reçu votre acceptation de notre devis n° [numéro], d'un montant de " + m + " hors taxes, signée en qualité de " + titre + "."].concat(
        o.registre !== "verifie" ? ["Pour notre dossier, pouvez-vous nous transmettre un justificatif d'immatriculation récent ?"] : []
      ).concat(["Nous revenons vers vous pour planifier la suite.", "", "Cordialement,", "[signature]"]).join("\n");
    } else if (confirmed) {
      message = ["Objet : Confirmation du pouvoir de signature, devis n° [numéro]", "", "Madame, Monsieur [nom du représentant légal],", "", "Nous avons bien reçu votre confirmation du [date] : [nom du signataire] est habilité à conclure notre devis n° [numéro], d'un montant de " + m + " hors taxes, au nom de [raison sociale].", "Nous lançons la suite du dossier.", "", "Cordialement,", "[signature]"].join("\n");
    } else {
      message = ["Objet : Confirmation du pouvoir de signature, devis n° [numéro] du [date]", "", "Madame, Monsieur [nom du représentant légal],", "", "[Nom du signataire], [fonction], s'apprête à accepter au nom de [raison sociale] notre devis n° [numéro], d'un montant de " + m + " hors taxes.", "Nous vous demandons de nous confirmer par écrit, au plus tard le " + (echeance ? fmtDate(echeance) : "[date de réponse]") + ", que [nom du signataire] est habilité à conclure ce contrat au nom de [raison sociale].", "À défaut de réponse dans ce délai, [nom du signataire] sera réputé habilité à conclure cet acte (article 1158 du code civil).", "", "Cordialement,", "[signature]"].join("\n");
    }

    var recap = [
      "Vérification du pouvoir du signataire",
      "Client : " + FORME_LABELS[f],
      "Signataire : " + QUALITE_LABELS[q],
      "Montant du devis : " + m + " HT ; plafond écrit : " + (o.plafondCents > 0 && !legal ? p : "aucun"),
      "Registre : " + REGISTRE_LABELS[o.registre],
      "Apparence : " + APPARENCE_LABELS[o.apparence] + " ; historique : " + HISTORIQUE_LABELS[o.historique],
      "Confirmation : " + (legal ? "sans objet (représentant légal)" : CONFIRMATION_LABELS[o.confirmation] + (envoyee ? " le " + fmtDate(o.dDemande) + ", délai " + plural(o.delaiJ, "jour", "jours") + ", fin le " + (echeance ? fmtDate(echeance) : "[date]") : "")),
      "Démarrage prévu : " + fmtDate(o.dDebut) + " ; acompte : " + ACOMPTE_LABELS[o.acompte],
      "Résultat : " + NIVEAU_LABELS[etat] + " ; qui est engagé : " + engage,
      "Points : " + nb.bad + " bloquant" + (nb.bad > 1 ? "s" : "") + ", " + nb.warn + " à compléter, " + nb.ok + " conforme" + (nb.ok > 1 ? "s" : "") + ", " + nb.info + " information" + (nb.info > 1 ? "s" : ""),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      input: o, legal: legal, etabli: etabli, depasse: depasse, echeance: echeance,
      controles: c, nbOk: nb.ok, nbWarn: nb.warn, nbBad: nb.bad, nbInfo: nb.info, etat: etat,
      niveauLabel: NIVEAU_LABELS[etat], engageLabel: engage, echeanceLabel: echeanceLabel,
      verdict: verdict, actions: actions, clause: clause, message: message, recap: recap
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, LABEL_SETS, FORME_LABELS, QUALITE_LABELS, REGISTRE_LABELS, APPARENCE_LABELS, HISTORIQUE_LABELS, CONFIRMATION_LABELS, ACOMPTE_LABELS, REP_LEGAL, TITRE, NIVEAU_LABELS, computePouvoir, normalize, buildRecap, fmtEur, fmtDate, parseDate, isoDate, addDays, diffDays, dec, num };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computePouvoir(readForm());
      document.getElementById("niveauOut").textContent = r.niveauLabel;
      document.getElementById("engageOut").textContent = r.engageLabel;
      document.getElementById("echeanceOut").textContent = r.echeanceLabel;
      document.getElementById("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      var v = document.getElementById("verdict");
      v.textContent = r.verdict;
      v.className = "alert " + r.etat;
      var tb = document.getElementById("controles");
      while (tb.firstChild) tb.removeChild(tb.firstChild);
      r.controles.forEach(function (c) {
        var tr = document.createElement("tr");
        if (c.statut === "bad" || c.statut === "warn") tr.className = "weak";
        var a = document.createElement("td"); a.textContent = c.point;
        var b = document.createElement("td"); b.textContent = STATUT_LABELS[c.statut];
        var e = document.createElement("td"); e.textContent = c.texte;
        tr.appendChild(a); tr.appendChild(b); tr.appendChild(e);
        tb.appendChild(tr);
      });
      document.getElementById("clause").textContent = r.clause;
      document.getElementById("message").textContent = r.message;
      document.getElementById("recapOut").textContent = r.recap;
      var ul = document.getElementById("actions");
      while (ul.firstChild) ul.removeChild(ul.firstChild);
      r.actions.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    };
    document.getElementById("form").addEventListener("input", render);
    document.getElementById("form").addEventListener("change", render);
    document.querySelectorAll("button.copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = document.getElementById(btn.getAttribute("data-target")).textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
      });
    });
    render();
  
  return built.snapshot();
}
