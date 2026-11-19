/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "calculateur-declaration-creance-procedure-collective";
  var PROCEDURE_LABELS = { sauvegarde: "sauvegarde", redressement: "redressement judiciaire", liquidation: "liquidation judiciaire" };
  var ADMIN_LABELS = { oui: "administrateur désigné", non: "pas d'administrateur" };
  var DOMICILE_LABELS = { meme: "même territoire que le tribunal", autre: "hors du territoire du tribunal" };
  var SURETE_LABELS = { aucune: "aucune sûreté ni contrat publié", publiee: "sûreté ou contrat publié" };
  var ETAT_LABELS = { a_faire: "pas encore envoyée", envoyee: "déjà envoyée" };
  var TVA_LABELS = { "20": "20 %", "10": "10 %", "5.5": "5,5 %", "0": "0 %" };
  var TVA_BP = { "20": 2000, "10": 1000, "5.5": 550, "0": 0 };
  var PIECES_LABELS = { complet: "pièces complètes", partiel: "pièces partielles", aucun: "aucune pièce" };
  var SIGNATAIRE_LABELS = { representant: "représentant légal", prepose_pouvoir: "salarié avec pouvoir écrit", mandataire_pouvoir: "avocat ou mandataire avec pouvoir", sans_pouvoir: "salarié sans pouvoir écrit" };
  var CONTRAT_LABELS = { termine: "tout exécuté avant le jugement", en_cours: "une partie reste à exécuter" };
  var REPONSE_LABELS = { aucune: "pas de réponse", poursuite: "poursuite demandée", refus: "refus de poursuivre" };
  var RESERVE_LABELS = { aucune: "pas de réserve de propriété", reserve: "réserve de propriété, biens impayés" };
  var DEMARCHE_LABELS = { rien: "déclaration seule", relance: "relance ou paiement", injonction: "action en paiement", compensation: "compensation" };
  var LABEL_SETS = { procedure: PROCEDURE_LABELS, administrateur: ADMIN_LABELS, domicile: DOMICILE_LABELS, surete: SURETE_LABELS, etatDeclaration: ETAT_LABELS, tva: TVA_LABELS, pieces: PIECES_LABELS, signataire: SIGNATAIRE_LABELS, contrat: CONTRAT_LABELS, reponse: REPONSE_LABELS, reserve: RESERVE_LABELS, demarche: DEMARCHE_LABELS };
  var DESTINATAIRE = { sauvegarde: "mandataire judiciaire", redressement: "mandataire judiciaire", liquidation: "liquidateur" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = ["Procédure et destinataire", "Publication au BODACC", "Délai de déclaration", "Montant antérieur à déclarer", "Prestations après le jugement", "Pièces justificatives", "Signataire de la déclaration", "Contrat en cours", "Réserve de propriété", "Paiements et poursuites"];
  var DEFAULTS = { procedure: "redressement", administrateur: "oui", dateJugement: "2026-11-05", datePublication: "2026-11-17", domicile: "meme", surete: "aucune", dateAvertissement: "", etatDeclaration: "a_faire", dateCalcul: "2026-11-18", montantExecute: "28080", dejaPaye: "14040", tva: "20", penalites: "0", dateEcheance: "2026-11-14", posterieur: "0", pieces: "complet", signataire: "representant", contrat: "en_cours", dateMiseEnDemeure: "2026-11-19", reponse: "aucune", reserve: "aucune", demarche: "rien" };
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  function dec(v, max) {
    var s = String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    var n = parseFloat(s);
    if (!isFinite(n) || n < 0) n = 0;
    if (n > max) n = max;
    return Math.round(n * 100);
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
    if (+m[1] < 1990 || +m[1] > 2100) return null;
    return d;
  }
  function fmtDate(d) {
    if (!d) return "[date]";
    return JOURS[d.getUTCDay()] + " " + d.getUTCDate() + " " + MOIS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function isoDate(d) { return d ? d.toISOString().slice(0, 10) : ""; }
  function addDays(d, n) { return d ? new Date(d.getTime() + n * 86400000) : null; }
  function diffDays(a, b) { return Math.round((b.getTime() - a.getTime()) / 86400000); }
  function addMonths(d, n) {
    if (!d) return null;
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
    var ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
    var last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
    return new Date(Date.UTC(ty, tm, Math.min(day, last)));
  }
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(y, month - 1, day));
  }
  function joursFeries(y) {
    var p = easter(y);
    var list = [[0, 1], [4, 1], [4, 8], [6, 14], [7, 15], [10, 1], [10, 11], [11, 25]].map(function (x) { return isoDate(new Date(Date.UTC(y, x[0], x[1]))); });
    list.push(isoDate(addDays(p, 1)), isoDate(addDays(p, 39)), isoDate(addDays(p, 50)));
    return list;
  }
  function isOuvrable(d) {
    var w = d.getUTCDay();
    if (w === 0 || w === 6) return false;
    return joursFeries(d.getUTCFullYear()).indexOf(isoDate(d)) < 0;
  }
  function nextOuvrable(d) { if (!d) return null; var x = d; while (!isOuvrable(x)) x = addDays(x, 1); return x; }
  function prevOuvrable(d) { if (!d) return null; var x = d; while (!isOuvrable(x)) x = addDays(x, -1); return x; }
  function pick(set, v, def) { return Object.prototype.hasOwnProperty.call(set, v) ? v : def; }
  function plural(n, s, p) { return n + " " + (n > 1 ? p : s); }
  function later(a, b) { if (!a) return b; if (!b) return a; return a.getTime() >= b.getTime() ? a : b; }

  function normalize(inp) {
    var i = inp || {};
    var o = {};
    Object.keys(LABEL_SETS).forEach(function (k) { o[k] = pick(LABEL_SETS[k], i[k], DEFAULTS[k]); });
    o.executeCents = dec(i.montantExecute, 100000000);
    o.payeCents = dec(i.dejaPaye, 100000000);
    o.penalCents = dec(i.penalites, 100000000);
    o.posterieurCents = dec(i.posterieur, 100000000);
    o.dJugement = parseDate(i.dateJugement);
    o.dPublication = parseDate(i.datePublication);
    o.dAvertissement = parseDate(i.dateAvertissement);
    o.dCalcul = parseDate(i.dateCalcul);
    o.dEcheance = parseDate(i.dateEcheance);
    o.dMiseEnDemeure = parseDate(i.dateMiseEnDemeure);
    return o;
  }

  function computeDeclaration(inp) {
    var o = normalize(inp);
    var proc = o.procedure, lj = proc === "liquidation";
    var admin = !lj && o.administrateur === "oui";
    var dest = DESTINATAIRE[proc];
    var optionPar = lj ? "au liquidateur" : admin ? "à l'administrateur" : "à votre client lui-même, après avis conforme du mandataire judiciaire (article L627-2)";
    var optionCourt = lj ? "au liquidateur" : admin ? "à l'administrateur" : "au client, avec copie au mandataire judiciaire";
    var artContrat = lj ? "L641-11-1" : "L622-13";
    var nbMois = o.domicile === "autre" ? 4 : 2;
    var publiee = o.surete === "publiee";
    var base = o.dPublication;
    if (publiee && o.dAvertissement) base = later(o.dAvertissement, o.dPublication);
    var fin = base ? addMonths(base, nbMois) : null;
    var envoi = fin ? prevOuvrable(fin) : null;
    var proroge = fin ? nextOuvrable(fin) : null;
    var tombeOff = fin ? !isOuvrable(fin) : false;
    var releve = o.dPublication ? addMonths(publiee && o.dAvertissement ? later(o.dAvertissement, o.dPublication) : o.dPublication, 6) : null;
    var revendication = o.dPublication ? addMonths(o.dPublication, 3) : null;
    var posterieurLimite = lj && o.dPublication ? addMonths(o.dPublication, 6) : null;
    var htCents = Math.max(0, o.executeCents - o.payeCents);
    var excedentCents = Math.max(0, o.payeCents - o.executeCents);
    var tvaCents = Math.round(htCents * TVA_BP[o.tva] / 10000);
    var ttcCents = htCents + tvaCents;
    var totalCents = ttcCents + o.penalCents;
    var aEchoir = !!(o.dEcheance && o.dJugement && o.dEcheance.getTime() > o.dJugement.getTime() && ttcCents > 0);
    var finOption = o.dMiseEnDemeure ? addMonths(o.dMiseEnDemeure, 1) : null;
    var enCours = o.contrat === "en_cours";
    var resilie = enCours && ((o.reponse === "refus") || (o.reponse === "aucune" && finOption && o.dCalcul && o.dCalcul.getTime() > finOption.getTime()));
    var limiteIndemnite = enCours && o.reponse === "aucune" && finOption && resilie ? addMonths(finOption, 1) : null;
    var envoyee = o.etatDeclaration === "envoyee";
    var c = [];
    var add = function (statut, texte) { c.push({ point: POINTS[c.length], statut: statut, texte: texte }); };

    // 1. Procédure et destinataire
    add("info", (lj ? "Liquidation judiciaire : la déclaration va au liquidateur (article L641-3), qui décide aussi du sort des contrats en cours (article L641-11-1)."
      : (proc === "sauvegarde" ? "Sauvegarde" : "Redressement judiciaire") + " : la déclaration va au mandataire judiciaire (article L622-24). " + (admin ? "L'administrateur décide de la poursuite des contrats en cours (article L622-13)." : "Sans administrateur, c'est votre client qui décide de la poursuite des contrats, après avis conforme du mandataire judiciaire (article L627-2).")) + " Leurs noms et adresses figurent dans l'annonce du BODACC.");

    // 2. Publication
    if (!o.dPublication) add("bad", "Sans date de publication au BODACC, aucun délai ne peut être calculé : c'est elle, et non la date du jugement, qui fait courir le délai de déclaration (article R622-24). Cherchez l'annonce sur bodacc.fr ou dans la fiche de votre client sur l'Annuaire des entreprises.");
    else if (o.dJugement && o.dPublication.getTime() < o.dJugement.getTime()) add("warn", "La date de publication (" + fmtDate(o.dPublication) + ") est antérieure à celle du jugement (" + fmtDate(o.dJugement) + ") : vérifiez les deux dates sur l'annonce.");
    else if (!o.dJugement) add("warn", "Indiquez la date du jugement : elle sépare les créances antérieures, à déclarer, des créances postérieures, et fixe le montant dû au jour du jugement (article L622-25).");
    else if (publiee && !o.dAvertissement) add("warn", "Titulaire d'une sûreté ou d'un contrat publié : votre délai court de la notification de l'avertissement personnel du mandataire (article L622-24). Vous ne l'avez pas reçu : déclarez quand même dans les " + nbMois + " mois de la publication du " + fmtDate(o.dPublication) + ".");
    else if (publiee) add("ok", "Sûreté ou contrat publié : avertissement reçu le " + fmtDate(o.dAvertissement) + ". L'outil part de la plus tardive de cette date et de la publication (" + fmtDate(o.dPublication) + ").");
    else add("ok", "Jugement du " + fmtDate(o.dJugement) + ", publié au BODACC le " + fmtDate(o.dPublication) + " : c'est la publication qui fait courir les délais (article R622-24).");

    // 3. Délai de déclaration
    var hors = nbMois === 4 ? " (deux mois, plus deux mois parce que vous n'êtes pas sur le territoire du tribunal)" : " (deux mois, article R622-24)";
    var noteOff = tombeOff ? " Ce jour tombe un " + JOURS[fin.getUTCDay()] + (JOURS[fin.getUTCDay()] === "samedi" || JOURS[fin.getUTCDay()] === "dimanche" ? "" : " férié") + " : l'article 642 du code de procédure civile reporte au " + fmtDate(proroge) + ", mais ne comptez pas dessus." : "";
    var forclos = "Le délai est passé : vous êtes forclos. Vous ne participerez aux répartitions que si le juge-commissaire vous relève de la forclusion, sur demande faite avant le " + fmtDate(releve) + " (six mois), et seulement si le retard n'est pas de votre fait ou vient d'une omission de votre client sur la liste de ses créanciers (article L622-26).";
    if (!fin) add("bad", "Délai non calculable sans la date de publication.");
    else if (!o.dCalcul) add("warn", "Fin du délai le " + fmtDate(fin) + hors + ". Indiquez la date du jour ou la date d'envoi pour savoir où vous en êtes.");
    else if (envoyee) {
      if (o.dCalcul.getTime() < o.dPublication.getTime()) add("warn", "Déclaration envoyée le " + fmtDate(o.dCalcul) + ", avant la publication du " + fmtDate(o.dPublication) + " : le texte vise les déclarations faites à partir de la publication. Par prudence, renvoyez-la après cette date, avant le " + fmtDate(envoi) + ".");
      else if (o.dCalcul.getTime() <= fin.getTime()) add("ok", "Déclaration envoyée le " + fmtDate(o.dCalcul) + ", dans le délai qui finit le " + fmtDate(fin) + hors + ". Gardez l'avis de réception.");
      else if (o.dCalcul.getTime() <= proroge.getTime()) add("warn", "Envoyée le " + fmtDate(o.dCalcul) + ", après le " + fmtDate(fin) + " : vous comptez sur le report de l'article 642 du code de procédure civile au " + fmtDate(proroge) + ". Gardez la preuve de la date d'envoi.");
      else add("bad", "Envoyée le " + fmtDate(o.dCalcul) + ", après la fin du délai (" + fmtDate(fin) + "). " + forclos + (releve && o.dCalcul.getTime() > releve.getTime() ? " Le délai de six mois est lui aussi expiré, sauf si vous ne pouviez pas connaître votre créance." : ""));
    } else {
      if (o.dCalcul.getTime() > proroge.getTime()) add("bad", "Pas encore envoyée au " + fmtDate(o.dCalcul) + ", alors que le délai a pris fin le " + fmtDate(fin) + ". " + forclos + (releve && o.dCalcul.getTime() > releve.getTime() ? " Le délai de six mois est lui aussi expiré, sauf si vous ne pouviez pas connaître votre créance." : ""));
      else if (o.dCalcul.getTime() < o.dPublication.getTime()) add("warn", "Le délai court à partir de la publication du " + fmtDate(o.dPublication) + " : préparez la déclaration, envoyez-la après cette date et au plus tard le " + fmtDate(envoi) + ".");
      else {
        var reste = diffDays(o.dCalcul, envoi);
        add("warn", "À envoyer au plus tard le " + fmtDate(envoi) + " : fin du délai le " + fmtDate(fin) + hors + "." + noteOff + (reste >= 0 ? " Il reste " + plural(reste, "jour", "jours") + " avant la date d'envoi conseillée." : " La date d'envoi conseillée est passée : envoyez aujourd'hui."));
      }
    }

    // 4. Montant antérieur
    var montantTxt = fmtEur(ttcCents) + " TTC (" + fmtEur(htCents) + " HT et " + fmtEur(tvaCents) + " de TVA à " + TVA_LABELS[o.tva] + ")";
    if (excedentCents > 0) add("warn", "Vous avez reçu " + fmtEur(excedentCents) + " HT de plus que la valeur de ce qui a été exécuté avant le jugement : rien d'antérieur à déclarer sur le prix" + (o.penalCents ? ", seulement " + fmtEur(o.penalCents) + " de pénalités" : "") + ". Si le contrat n'est pas poursuivi, vous pouvez différer la restitution de cet excédent jusqu'à ce qu'il soit statué sur vos dommages et intérêts (article " + artContrat + ", V).");
    else if (totalCents === 0) add("info", "D'après vos chiffres, rien d'antérieur au jugement n'est impayé : pas de créance à déclarer sur ce devis pour l'instant.");
    else add("ok", "À déclarer : " + montantTxt + (o.penalCents ? ", plus " + fmtEur(o.penalCents) + " de pénalités courues jusqu'au jugement" : "") + ". Le jugement arrête le cours des intérêts et pénalités de retard (article L622-28) : n'ajoutez rien pour la période qui suit." + (aEchoir ? " Au jour du jugement, la facture n'était pas encore échue : indiquez-la comme somme à échoir le " + fmtDate(o.dEcheance) + " (article L622-25). Elle reste une créance antérieure." : ""));

    // 5. Postérieures
    if (o.posterieurCents === 0) add("info", "Aucune prestation impayée fournie après le jugement.");
    else if (lj) add("warn", fmtEur(o.posterieurCents) + " HT fournis après le jugement : ces créances se paient à l'échéance si elles entrent dans l'article L641-13. Impayées, elles ne gardent leur privilège que si vous les portez à la connaissance du liquidateur " + (posterieurLimite ? "au plus tard le " + fmtDate(posterieurLimite) + " (six mois après la publication, article L641-13 III)" : "dans les six mois de la publication du jugement (article L641-13 III)") + ". Ne les mélangez pas avec la déclaration.");
    else add("warn", fmtEur(o.posterieurCents) + " HT fournis après le jugement : ces créances se paient à l'échéance (article L622-17 I). Impayées, elles ne gardent leur privilège que si vous les portez à la connaissance de l'administrateur, ou à défaut du mandataire judiciaire, dans l'année qui suit la fin de la période d'observation (article L622-17 IV). Ne les mélangez pas avec la déclaration.");

    // 6. Pièces
    if (o.pieces === "complet") add("ok", "Devis accepté, factures, bons de livraison ou procès-verbal, relevé de compte : joints sous bordereau, en copie (article R622-23).");
    else if (o.pieces === "partiel") add("warn", "Complétez les pièces : la déclaration doit contenir les éléments qui prouvent l'existence et le montant de la créance, joints sous bordereau (article R622-23). Le mandataire peut en demander d'autres à tout moment.");
    else add("bad", "Aucune pièce : une créance qui ne résulte pas d'un titre doit être prouvée par la déclaration (article R622-23, 1°). Rassemblez au moins le devis accepté, la facture et la preuve de livraison.");

    // 7. Signataire
    if (o.signataire === "representant") add("ok", "Signée par le représentant légal de votre entreprise : pas de pouvoir à joindre.");
    else if (o.signataire === "prepose_pouvoir") add("ok", "Un salarié peut déclarer pour vous (article L622-24) : joignez son pouvoir écrit, comme le demande le CNAJMJ.");
    else if (o.signataire === "mandataire_pouvoir") add("ok", "Un mandataire de votre choix peut déclarer (article L622-24) : joignez son pouvoir, sauf s'il est avocat.");
    else add("bad", "Un salarié sans pouvoir écrit ne devrait pas signer : le CNAJMJ rappelle que la déclaration doit être signée par une personne qui a un pouvoir pour cette formalité, joint si ce n'est pas le représentant légal. Faites signer le représentant légal ou établissez le pouvoir. La loi permet de ratifier la déclaration jusqu'à ce que le juge statue, mais ne comptez pas sur ce rattrapage.");

    // 8. Contrat en cours
    var comptant = proc === "sauvegarde" ? " En sauvegarde, le texte demande à l'administrateur de s'assurer qu'il disposera des fonds : fixez par écrit les conditions de paiement de la suite." : " Le paiement de la suite se fait au comptant, sauf si vous acceptez des délais (article " + (lj ? "L641-11-1 II" : "L631-14") + ").";
    if (!enCours) add("info", "Tout a été livré ou exécuté avant le jugement : pas de contrat en cours à trancher. La déclaration suffit.");
    else if (o.reponse === "poursuite") add("ok", "Poursuite demandée par " + (lj ? "le liquidateur" : admin ? "l'administrateur" : "votre client avec l'avis conforme du mandataire") + " : vous exécutez la suite, même si la facture antérieure reste impayée (article " + artContrat + ", I)." + comptant + " Ce qui sera fourni à partir de là n'entre pas dans la déclaration.");
    else if (o.reponse === "refus") add("warn", "Refus de poursuivre : le contrat est résilié de plein droit à la réception de ce refus. Déclarez la créance née de la résiliation (dommages et intérêts, article " + artContrat + ", V) dans le mois qui suit cette réception (article R622-21).");
    else if (!o.dMiseEnDemeure) add("warn", "Une partie reste à exécuter. La décision de poursuivre appartient " + optionPar + ", et l'ouverture de la procédure ne résilie pas le contrat à elle seule (article " + artContrat + ", I). Pour sortir de l'attente, adressez une mise en demeure de prendre parti " + optionCourt + " : sans réponse pendant plus d'un mois, le contrat est résilié de plein droit.");
    else if (resilie) add("warn", "Mise en demeure reçue le " + fmtDate(o.dMiseEnDemeure) + ", sans réponse au " + fmtDate(finOption) + " : le contrat est résilié de plein droit (article " + artContrat + ", III). Déclarez la créance née de la résiliation dans le mois (article R622-21), au plus tard le " + fmtDate(limiteIndemnite) + ".");
    else add("warn", "Mise en demeure reçue le " + fmtDate(o.dMiseEnDemeure) + " : réponse attendue au plus tard le " + fmtDate(finOption) + " (un mois, que le juge-commissaire peut raccourcir ou prolonger dans la limite de deux mois, article " + artContrat + ", III). Ne refusez pas d'exécuter au seul motif de la facture impayée, et demandez par écrit comment la suite sera payée.");

    // 9. Réserve de propriété
    if (o.reserve === "aucune") add("info", "Pas de réserve de propriété sur des biens impayés : les biens livrés appartiennent au client, seule la déclaration vous protège.");
    else if (!revendication) add("bad", "Réserve de propriété : le délai de revendication de trois mois court de la publication, à indiquer.");
    else if (o.dCalcul && o.dCalcul.getTime() > revendication.getTime()) add("bad", "Le délai de revendication de trois mois a pris fin le " + fmtDate(revendication) + " (article L624-9) : votre propriété n'est plus opposable à la procédure. Il reste la déclaration.");
    else add("warn", "Revendiquez les biens encore en nature au plus tard le " + fmtDate(prevOuvrable(revendication)) + " (fin du délai de trois mois le " + fmtDate(revendication) + ", article L624-9), par lettre recommandée avec avis de réception " + (lj ? "au liquidateur" : admin ? "à l'administrateur, avec copie au mandataire judiciaire" : "à votre client, avec copie au mandataire judiciaire") + " (article R624-13). Déclarez aussi la créance : ce sont deux démarches distinctes.");

    // 10. Paiements et poursuites
    if (o.demarche === "rien") add("ok", "Plus de relance en paiement ni d'action pour la facture antérieure : le jugement interrompt ou interdit ces actions (article L622-21). La déclaration les remplace.");
    else if (o.demarche === "relance") add("bad", "Le jugement interdit de payer une créance née avant lui (article L622-7 I). Un paiement reçu malgré tout peut être annulé à la demande de tout intéressé dans les trois ans (article L622-7 III). Coupez les relances automatiques sur cette facture.");
    else if (o.demarche === "injonction") add("bad", "Une action en paiement, une injonction de payer ou une saisie sont interrompues ou interdites par le jugement pour une créance antérieure (article L622-21). Déclarez la créance à la place.");
    else add("warn", "Seule la compensation de créances connexes reste permise après le jugement (article L622-7 I). Vérifiez que la somme que vous devez au client vient du même ensemble contractuel avant de la déduire, sinon déclarez la totalité.");

    var nb = { ok: 0, warn: 0, bad: 0, info: 0 };
    c.forEach(function (x) { nb[x.statut]++; });
    var etat = nb.bad ? "bad" : nb.warn ? "warn" : "ok";
    var finLabel = fin ? fmtDate(fin) : "Non calculable";
    var envoiLabel = !fin ? "Non calculable" : envoyee && o.dCalcul ? "Envoyée le " + fmtDate(o.dCalcul) : fmtDate(envoi);
    var montantLabel = totalCents ? fmtEur(totalCents) + " TTC" : "Rien à déclarer";
    var suite = !fin ? "Délai non calculable sans la date de publication au BODACC." : envoyee ? "Déclaration envoyée le " + fmtDate(o.dCalcul) + "." : "Déclaration à envoyer au plus tard le " + fmtDate(envoi) + ".";
    var verdict;
    if (etat === "bad") verdict = plural(nb.bad, "point bloquant", "points bloquants") + ", " + nb.warn + " à compléter. " + suite;
    else if (etat === "warn") verdict = "Aucun point bloquant, " + nb.warn + " à compléter. " + suite;
    else verdict = "Dossier en ordre : " + suite.charAt(0).toLowerCase() + suite.slice(1);

    var actions = [];
    if (!o.dPublication) actions.push("Retrouvez l'annonce du jugement au BODACC (bodacc.fr) et notez sa date de publication, le nom du mandataire judiciaire" + (lj ? " ou du liquidateur" : "") + " et son adresse.");
    if (fin && !envoyee && !(o.dCalcul && o.dCalcul.getTime() > proroge.getTime())) actions.push("Envoyez la déclaration au " + dest + " par lettre recommandée avec avis de réception avant le " + fmtDate(envoi) + ", sans attendre son avertissement.");
    if (fin && o.dCalcul && o.dCalcul.getTime() > proroge.getTime() && !envoyee) actions.push("Envoyez la déclaration tout de suite et demandez au juge-commissaire un relevé de forclusion avant le " + fmtDate(releve) + ", en expliquant pourquoi le retard n'est pas de votre fait.");
    if (o.pieces !== "complet") actions.push("Rassemblez le devis accepté, les factures, les bons de livraison ou procès-verbaux et le relevé de compte du client.");
    if (o.signataire === "sans_pouvoir") actions.push("Faites signer la déclaration par le représentant légal, ou faites-lui établir un pouvoir écrit pour la personne qui la signe.");
    if (enCours && o.reponse === "aucune" && !o.dMiseEnDemeure) actions.push("Adressez " + optionCourt + " une mise en demeure de prendre parti sur la poursuite du devis, par lettre recommandée avec avis de réception.");
    if (enCours && o.reponse === "aucune" && o.dMiseEnDemeure && !resilie) actions.push("Notez le " + fmtDate(finOption) + " : sans réponse à cette date, le contrat est résilié et vous avez un mois pour déclarer la créance née de la résiliation.");
    if (resilie && limiteIndemnite) actions.push("Déclarez la créance née de la résiliation avant le " + fmtDate(limiteIndemnite) + ".");
    if (resilie && !limiteIndemnite) actions.push("Déclarez la créance née de la résiliation dans le mois qui suit la réception du refus.");
    if (enCours && o.reponse === "poursuite") actions.push("Confirmez par écrit les conditions de paiement de la suite, puis livrez ; ne faites pas entrer ces sommes dans la déclaration.");
    if (o.reserve === "reserve" && revendication && !(o.dCalcul && o.dCalcul.getTime() > revendication.getTime())) actions.push("Envoyez la demande en revendication avant le " + fmtDate(prevOuvrable(revendication)) + " et faites l'inventaire des biens encore en nature chez le client.");
    if (o.posterieurCents > 0) actions.push(lj ? "Portez les " + fmtEur(o.posterieurCents) + " HT fournis après le jugement à la connaissance du liquidateur " + (posterieurLimite ? "avant le " + fmtDate(posterieurLimite) : "dans les six mois de la publication") + "." : "Portez les " + fmtEur(o.posterieurCents) + " HT fournis après le jugement à la connaissance de l'administrateur, ou à défaut du mandataire judiciaire, dès qu'ils sont impayés.");
    if (o.demarche === "relance" || o.demarche === "injonction") actions.push("Arrêtez toute relance, injonction ou saisie pour la facture antérieure, et retirez-la des séquences de relance automatique.");
    if (o.demarche === "compensation") actions.push("Faites vérifier le lien entre les deux sommes avant toute compensation ; à défaut, déclarez la totalité.");
    actions.push("Classez dans le dossier du client l'annonce du BODACC, la déclaration, l'avis de réception et les courriers échangés avec " + (lj ? "le liquidateur" : admin ? "l'administrateur et le mandataire" : "le mandataire") + ".");

    var nomProc = PROCEDURE_LABELS[proc];
    var declaration = [
      "Objet : Déclaration de créance, procédure de " + nomProc + " de [raison sociale du client], jugement du " + fmtDate(o.dJugement),
      "Destinataire : [Nom], " + (lj ? "liquidateur" : "mandataire judiciaire") + ", [adresse indiquée au BODACC]",
      "Créancier : [raison sociale, forme, SIREN, adresse de votre entreprise]",
      "Débiteur : [raison sociale et SIREN du client], procédure de " + nomProc + " ouverte le " + fmtDate(o.dJugement) + ", publiée au BODACC le " + fmtDate(o.dPublication),
      "Nature de la créance : prix des fournitures et travaux exécutés avant le jugement, devis accepté le [date]",
      "Montant échu au jour du jugement : " + (aEchoir ? "néant" : ttcCents ? montantTxt : "néant"),
      "Sommes à échoir : " + (aEchoir ? montantTxt + ", échéance le " + fmtDate(o.dEcheance) : "néant"),
      "Pénalités et intérêts courus jusqu'au jugement : " + (o.penalCents ? fmtEur(o.penalCents) : "néant"),
      "Sûreté ou réserve de propriété : " + (o.reserve === "reserve" ? "clause de réserve de propriété acceptée le [date], revendication envoyée séparément" : publiee ? "[nature, date et assiette de la sûreté]" : "néant"),
      "Litige en cours : [néant, ou juridiction saisie]",
      "Pièces jointes sous bordereau : devis accepté, factures, bons de livraison ou procès-verbaux, relevé de compte" + (o.signataire !== "representant" ? ", pouvoir du signataire" : ""),
      "Je certifie sincère la présente déclaration de créance (article L622-25), montant total déclaré : " + fmtEur(totalCents) + ".",
      "Fait le [date], par [nom], " + (o.signataire === "representant" ? "[qualité du représentant légal]" : "[fonction], muni du pouvoir joint")
    ].join("\n");

    var message;
    if (enCours && o.reponse === "aucune" && !resilie) message = [
      "Objet : Mise en demeure de prendre parti sur la poursuite du contrat (article " + artContrat + ", III)",
      "Lettre recommandée avec avis de réception adressée " + optionCourt,
      "Madame, Monsieur,",
      "La société [client] nous a confié, par devis accepté le [date], la fabrication et la livraison de [objet], pour " + fmtEur(o.executeCents) + " HT déjà exécutés avant le jugement du " + fmtDate(o.dJugement) + " et [montant] HT restant à exécuter.",
      "Ce contrat est en cours. Nous vous mettons en demeure de nous faire savoir si vous entendez en exiger la poursuite.",
      "En cas de poursuite, nous vous remercions de nous confirmer les conditions de paiement de la suite" + (proc === "sauvegarde" ? "." : ", payable au comptant sauf accord de notre part sur des délais."),
      "Faute de réponse dans le délai d'un mois à compter de la réception de cette lettre, le contrat sera résilié de plein droit.",
      "Notre créance antérieure fait l'objet d'une déclaration séparée auprès du " + dest + ".",
      "Nous vous prions d'agréer, Madame, Monsieur, nos salutations distinguées.",
      "[Nom, qualité, société]"
    ].join("\n");
    else if (o.reserve === "reserve") message = [
      "Objet : Demande en revendication de biens vendus avec réserve de propriété (articles L624-9 et R624-13)",
      "Lettre recommandée avec avis de réception adressée " + (lj ? "au liquidateur" : admin ? "à l'administrateur, copie au mandataire judiciaire" : "à la société [client], copie au mandataire judiciaire"),
      "Madame, Monsieur,",
      "Par devis accepté le [date], dont les conditions comportent une clause de réserve de propriété, nous avons livré à la société [client] les biens suivants : [désignation, quantités, numéros].",
      "Ces biens n'ont pas été payés à la date du jugement du " + fmtDate(o.dJugement) + ".",
      "Nous en revendiquons la propriété et en demandons la restitution, pour ceux qui se retrouvent en nature.",
      "Nous vous remercions de nous indiquer sous un mois si vous acquiescez à cette demande.",
      "Notre créance fait par ailleurs l'objet d'une déclaration auprès du " + dest + ".",
      "Nous vous prions d'agréer, Madame, Monsieur, nos salutations distinguées.",
      "[Nom, qualité, société]"
    ].join("\n");
    else message = [
      "Objet : Note interne, procédure collective de [client]",
      "Procédure : " + nomProc + ", jugement du " + fmtDate(o.dJugement) + ", publié au BODACC le " + fmtDate(o.dPublication) + ".",
      "Destinataire de la déclaration : " + dest + ", [nom et adresse].",
      "Fin du délai de déclaration : " + finLabel + (fin ? ", envoi au plus tard le " + fmtDate(envoi) : "") + ".",
      "Montant déclaré ou à déclarer : " + montantLabel + ".",
      "Contrat : " + CONTRAT_LABELS[o.contrat] + (enCours ? ", " + REPONSE_LABELS[o.reponse] : "") + ".",
      "Relance automatique : coupée sur ce client ; aucune facture antérieure ne doit être encaissée.",
      "Nouvelles commandes : seulement avec l'accord écrit " + (lj ? "du liquidateur" : admin ? "de l'administrateur" : "du client et du mandataire") + " et un paiement à la commande.",
      "Relevé de forclusion possible jusqu'au : " + (releve ? fmtDate(releve) : "[date]") + ".",
      "Responsable du suivi : [nom]."
    ].join("\n");

    var recap = [
      "Procédure : " + nomProc + " (" + (lj ? "liquidateur" : ADMIN_LABELS[o.administrateur]) + ")",
      "Jugement : " + fmtDate(o.dJugement) + " ; publication au BODACC : " + fmtDate(o.dPublication),
      "Fin du délai de déclaration : " + finLabel + (nbMois === 4 ? " (quatre mois, hors territoire)" : ""),
      "Envoi : " + envoiLabel,
      "Montant à déclarer : " + montantLabel + (aEchoir ? " (à échoir le " + fmtDate(o.dEcheance) + ")" : ""),
      "Contrat : " + CONTRAT_LABELS[o.contrat] + (enCours ? ", " + REPONSE_LABELS[o.reponse] + (finOption && o.reponse === "aucune" ? ", réponse attendue le " + fmtDate(finOption) : "") : ""),
      "Revendication : " + (o.reserve === "reserve" ? (revendication ? "avant le " + fmtDate(revendication) : "non calculable") : "sans objet"),
      "Relevé de forclusion : jusqu'au " + (releve ? fmtDate(releve) : "[date]"),
      "Contrôles : " + plural(nb.ok, "conforme", "conformes") + ", " + nb.warn + " à compléter, " + plural(nb.bad, "bloquant", "bloquants") + ", " + plural(nb.info, "information", "informations"),
      "Verdict : " + verdict,
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      input: o, controles: c, nbOk: nb.ok, nbWarn: nb.warn, nbBad: nb.bad, nbInfo: nb.info, etat: etat,
      fin: fin, envoi: envoi, proroge: proroge, releve: releve, revendication: revendication, finOption: finOption, limiteIndemnite: limiteIndemnite, posterieurLimite: posterieurLimite,
      htCents: htCents, tvaCents: tvaCents, ttcCents: ttcCents, totalCents: totalCents, excedentCents: excedentCents, aEchoir: aEchoir, resilie: !!resilie, nbMois: nbMois,
      finLabel: finLabel, envoiLabel: envoiLabel, montantLabel: montantLabel,
      verdict: verdict, actions: actions, declaration: declaration, message: message, recap: recap
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, LABEL_SETS, PROCEDURE_LABELS, ADMIN_LABELS, DOMICILE_LABELS, SURETE_LABELS, ETAT_LABELS, TVA_LABELS, TVA_BP, PIECES_LABELS, SIGNATAIRE_LABELS, CONTRAT_LABELS, REPONSE_LABELS, RESERVE_LABELS, DEMARCHE_LABELS, DESTINATAIRE, computeDeclaration, normalize, buildRecap, fmtEur, fmtDate, parseDate, isoDate, addDays, diffDays, addMonths, easter, joursFeries, isOuvrable, nextOuvrable, prevOuvrable, dec };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computeDeclaration(readForm());
      document.getElementById("finOut").textContent = r.finLabel;
      document.getElementById("envoiOut").textContent = r.envoiLabel;
      document.getElementById("montantOut").textContent = r.montantLabel;
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
      document.getElementById("declaration").textContent = r.declaration;
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
