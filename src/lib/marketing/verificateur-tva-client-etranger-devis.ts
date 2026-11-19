/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-tva-client-etranger-devis";
  var OPERATION_LABELS = { biens: "livraison de biens", installation: "biens montés ou installés par vous", services: "prestation de services", immeuble: "prestation sur un immeuble" };
  var DESTINATION_LABELS = { france: "France", ue: "autre pays de l'UE", hors_ue: "hors UE" };
  var ETAB_LABELS = { france: "France", ue: "autre pays de l'UE", hors_ue: "hors UE" };
  var STATUT_CLIENT_LABELS = { assujetti: "entreprise assujettie", pm_identifiee: "personne morale identifiée à la TVA", non_assujetti: "client sans numéro de TVA" };
  var NUMERO_LABELS = { verifie: "communiqué et vérifié", communique: "communiqué, non vérifié", absent: "pas communiqué", francais: "numéro français" };
  var TRANSPORT_LABELS = { vendeur: "par vous", client: "par le client", aucun: "pas de transport hors de France" };
  var PREUVES_LABELS = { completes: "réunies", partielles: "partielles", aucune: "aucune" };
  var RECAP_LABELS = { oui: "déposé", nsp: "inconnu", non: "non déposé" };
  var FRANCHISE_LABELS = { non: "non", oui: "oui" };
  var LABEL_SETS = { operation: OPERATION_LABELS, destination: DESTINATION_LABELS, clientEtab: ETAB_LABELS, statut: STATUT_CLIENT_LABELS, numero: NUMERO_LABELS, transport: TRANSPORT_LABELS, preuves: PREUVES_LABELS, recap: RECAP_LABELS, franchise: FRANCHISE_LABELS };
  var REGIME_LABELS = {
    tva_fr: "TVA française",
    exo_intracom: "Livraison intracommunautaire exonérée",
    export: "Exportation exonérée",
    autoliq_ue: "Autoliquidation par le client",
    hors_fr_services: "Hors de France, pas de TVA française",
    hors_fr_local: "TVA du pays de l'opération",
    franchise: "Franchise en base, à valider",
    a_valider: "À valider avec votre comptable"
  };
  var MENTION_LABELS = {
    tva_fr: "Taux et montant de TVA",
    exo_intracom: "Exonération, article 262 ter I du CGI",
    export: "Exonération, article 262 I du CGI",
    autoliq_ue: "Autoliquidation",
    hors_fr_services: "Pas de TVA française",
    hors_fr_local: "Selon le pays concerné",
    franchise: "Mention de franchise",
    a_valider: "À valider"
  };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = ["Nature de l'opération", "Lieu de taxation", "Statut du client", "Numéro de TVA du client", "Transport et preuves", "État récapitulatif", "Franchise en base", "Mentions de la facture", "TVA en jeu", "Date de facture et code applicable"];
  var DEFAULTS = { operation: "biens", destination: "ue", montant: "14400", taux: "20", clientEtab: "ue", statut: "assujetti", numero: "communique", franchise: "non", transport: "vendeur", preuves: "partielles", recap: "nsp", dateFacture: "2027-01-08" };
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var BASCULE = "2027-01-01";
  var FIN_RENVOIS = "2028-06-30";

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
  function fmtTaux(c) {
    var e = Math.floor(c / 100);
    var r = c % 100;
    if (!r) return e + " %";
    var d = r % 10 === 0 ? String(r / 10) : (r < 10 ? "0" : "") + r;
    return e + "," + d + " %";
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
  function pick(set, v, def) { return Object.prototype.hasOwnProperty.call(set, v) ? v : def; }

  function normalize(inp) {
    var i = inp || {};
    var o = {};
    Object.keys(LABEL_SETS).forEach(function (k) { o[k] = pick(LABEL_SETS[k], i[k], DEFAULTS[k]); });
    o.montantCents = dec(i.montant, 100000000);
    o.tauxC = dec(i.taux, 100);
    o.date = parseDate(i.dateFacture);
    return o;
  }

  function computeRegime(o) {
    if (o.franchise === "oui") return "franchise";
    if (o.operation === "immeuble" || o.operation === "installation") return o.destination === "france" ? "tva_fr" : "hors_fr_local";
    if (o.operation === "services") {
      if (o.statut === "non_assujetti") return "tva_fr";
      if (o.clientEtab === "france") return "tva_fr";
      return o.clientEtab === "ue" ? "autoliq_ue" : "hors_fr_services";
    }
    if (o.destination === "france" || o.transport === "aucun") return "tva_fr";
    if (o.destination === "ue") {
      if (o.statut === "non_assujetti") return "a_valider";
      if (o.numero === "absent" || o.numero === "francais") return "tva_fr";
      return "exo_intracom";
    }
    if (o.transport === "client" && o.clientEtab === "france") return "a_valider";
    return "export";
  }

  function computeTva(inp) {
    var o = normalize(inp);
    var regime = computeRegime(o);
    var tvaPleine = Math.round(o.montantCents * o.tauxC / 10000);
    var biensSortent = o.operation === "biens" && o.destination !== "france" && o.transport !== "aucun";
    var exoBiensUe = o.operation === "biens" && o.destination === "ue" && o.transport !== "aucun" && o.statut !== "non_assujetti";
    var c = [];
    var add = function (statut, texte) { c.push({ point: POINTS[c.length], statut: statut, texte: texte }); };

    // 0 Nature
    if (o.operation === "biens") add("info", "Livraison de biens meubles : elle est située en France si le bien s'y trouve au départ de l'expédition ou du transport (article 258 I a du CGI). L'exonération éventuelle vient ensuite (articles 262 ou 262 ter).");
    else if (o.operation === "installation") add("info", "Biens montés ou installés par vous : la livraison est située là où a lieu le montage ou l'installation (article 258 I b du CGI).");
    else if (o.operation === "services") add("info", "Prestation de services : entre professionnels, elle est située là où le client est établi (article 259, 1° du CGI), sauf exceptions des articles 259 A à 259 D.");
    else add("info", "Prestation se rattachant à un immeuble : elle est située là où se trouve l'immeuble, quel que soit le client (article 259 A, 2° du CGI).");

    // 1 Lieu
    if (regime === "tva_fr") {
      if (o.operation === "biens" && o.destination === "ue" && (o.numero === "absent" || o.numero === "francais")) add("bad", "Les biens partent dans un autre pays de l'UE, mais sans numéro de TVA d'un autre État membre l'exonération ne s'applique pas : TVA française à facturer (BOFiP, BOI-TVA-CHAMP-30-20-10, § 100).");
      else if (o.operation === "services" && o.statut === "non_assujetti") add("info", "Client non assujetti : la prestation est située en France quand vous y êtes établi (article 259, 2° du CGI). Certaines prestations suivent d'autres règles (articles 259 A à 259 D).");
      else add("ok", "Opération située en France, TVA française au taux de votre activité.");
    } else if (regime === "exo_intracom") add("ok", "Livraison située en France au départ, exonérée si les conditions de l'article 262 ter I du CGI sont réunies : client identifié dans un autre État membre, numéro communiqué, transport prouvé, état récapitulatif déposé.");
    else if (regime === "export") add("ok", "Biens expédiés hors de l'Union européenne : exonération de l'article 262 I du CGI, à condition de prouver la sortie.");
    else if (regime === "autoliq_ue") add("ok", "Prestation située dans le pays du client : pas de TVA française, le client paie la TVA dans son pays (autoliquidation).");
    else if (regime === "hors_fr_services") add("warn", "Prestation située hors de France (article 259, 1° du CGI a contrario) : pas de TVA française. Le pays du client peut avoir ses propres règles : vérifiez-les avant la facture.");
    else if (regime === "hors_fr_local") add("warn", "Opération située dans le pays du chantier ou de l'installation : pas de TVA française, mais la TVA de ce pays peut s'appliquer, et vous devrez peut-être vous y identifier. Cet outil ne traite pas les règles étrangères.");
    else if (regime === "franchise") add("warn", "Vous êtes en franchise en base : les règles de l'exonération intracommunautaire ne s'appliquent pas à vos livraisons (article 262 ter I du CGI), et vos mentions sont propres à la franchise. À valider avec votre comptable.");
    else if (o.destination === "ue") add("warn", "Vente de biens envoyés dans un autre pays de l'UE à un client sans numéro de TVA : régime des ventes à distance, non traité ici. À valider avant le devis.");
    else add("warn", "Biens emportés hors de l'UE par un acheteur établi en France : le 2° de l'article 262 I vise l'acheteur qui n'est pas établi en France. À valider avant le devis.");

    // 2 Statut
    if (o.statut === "non_assujetti") {
      if (o.operation === "services") add("info", "Client sans numéro de TVA : les règles entre professionnels ne s'appliquent pas, la prestation suit la règle des non-assujettis.");
      else if (o.operation === "biens" && o.destination === "ue" && o.transport !== "aucun") add("warn", "Client sans numéro de TVA dans un autre pays de l'UE : l'exonération intracommunautaire ne s'applique pas. Vérifiez s'il s'agit vraiment d'un client sans numéro.");
      else add("info", "Client sans numéro de TVA : sans effet sur ce régime.");
    } else if (o.statut === "pm_identifiee") {
      add("ok", "Personne morale non assujettie mais identifiée à la TVA : elle est traitée comme un assujetti pour le lieu des services (article 259-0, 2° du CGI) et peut recevoir une livraison intracommunautaire exonérée (article 262 ter I, 1°).");
    } else if (o.operation === "biens" && o.destination === "ue" && o.clientEtab === "france") {
      add("warn", "Client établi en France pour des biens envoyés dans un autre pays de l'UE : l'exonération demande un numéro attribué par un autre État que la France.");
    } else add("ok", "Client assujetti agissant en tant que tel.");

    // 3 Numéro
    var numeroUtile = regime === "exo_intracom" || regime === "autoliq_ue" || (o.operation === "biens" && o.destination === "ue" && o.transport !== "aucun" && o.statut !== "non_assujetti" && o.franchise === "non");
    if (!numeroUtile) add("info", "Numéro de TVA du client : sans effet sur le régime retenu ici. Mettez-le quand même sur la facture s'il existe.");
    else if (o.numero === "verifie") add("ok", "Numéro communiqué par écrit et vérifié : gardez la preuve de la vérification avec le dossier.");
    else if (o.numero === "communique") add("warn", "Numéro communiqué mais pas vérifié : le vendeur doit s'assurer de son existence et de sa validité (BOFiP, BOI-TVA-CHAMP-30-20-10, § 100). Vérifiez-le et gardez la trace datée.");
    else if (o.operation === "services") add("warn", "Numéro manquant : la facture doit porter le numéro fourni par le preneur (article 242 nonies A, 4° de l'annexe II du CGI) et l'état récapitulatif le demande aussi (article 289 B, III).");
    else if (o.numero === "francais") add("bad", "Numéro français pour des biens qui partent dans un autre pays : l'exonération demande un numéro attribué par un autre État membre que la France. Sinon, TVA française.");
    else add("bad", "Pas de numéro de TVA : l'exonération intracommunautaire ne s'applique pas, le vendeur n'a pas d'autre choix que de facturer la TVA (BOFiP, BOI-TVA-CHAMP-30-20-10, § 100). Demandez le numéro avant l'expédition.");

    // 4 Transport et preuves
    if (!biensSortent) add("info", "Pas de biens qui quittent la France : point sans objet.");
    else if (o.preuves === "completes") add("ok", o.destination === "ue" ? "Preuves du transport vers l'autre État membre réunies. Classez-les avec la facture." : "Preuve de la sortie de l'UE réunie. Classez-la avec la facture.");
    else if (o.preuves === "partielles") {
      if (o.destination === "ue") add("warn", o.transport === "client" ? "Le client transporte lui-même : recueillez pour chaque livraison la confirmation de réception dans l'autre État et les documents de transport (BOFiP, BOI-TVA-CHAMP-30-20-10, § 60 à 80)." : "Preuves partielles : complétez avec les documents de transport (lettre de voiture CMR, facture du transporteur) et la confirmation de réception par le client.");
      else add("warn", o.transport === "client" ? "Le client organise le transport : gardez la déclaration du transporteur ou du transitaire et la preuve du paiement par le client (BOFiP, BOI-TVA-CHAMP-30-30-10-20, § 25)." : "Preuve de sortie incomplète : gardez la déclaration en douane d'exportation certifiée ou une preuve alternative admise.");
    } else add("bad", o.destination === "ue" ? "Aucune preuve du transport : si vous n'avez pas de justification suffisante, la livraison est soumise à la TVA (BOFiP, BOI-TVA-CHAMP-30-20-10)." : "Aucune preuve de sortie : l'exonération à l'export est subordonnée à la justification de la réalité de l'exportation (BOFiP, BOI-TVA-CHAMP-30-30-10-20, § 25).");

    // 5 État récapitulatif
    var recapUtile = regime === "exo_intracom" || regime === "autoliq_ue";
    if (!recapUtile) add("info", "État récapitulatif des clients : sans objet pour ce régime.");
    else if (o.recap === "oui") add("ok", "État récapitulatif déposé : vérifiez qu'il contient le numéro du client et le montant (article 289 B du CGI).");
    else if (o.recap === "non") add(regime === "exo_intracom" ? "bad" : "warn", regime === "exo_intracom" ? "Sans état récapitulatif, l'exonération ne s'applique pas, sauf manquement dûment justifié (article 262 ter I, 1° du CGI)." : "L'état récapitulatif des services est une obligation (article 289 B, I et III du CGI). Déposez-le pour le mois concerné.");
    else add("warn", "Vérifiez avec votre comptable que l'état récapitulatif des clients est déposé pour le mois où la taxe devient exigible dans l'autre État (article 289 B du CGI).");

    // 6 Franchise
    if (o.franchise === "oui") add("warn", "Franchise en base : pas de TVA facturée, mais les mentions et les règles de l'exonération intracommunautaire diffèrent. Faites valider la facture.");
    else add("ok", "Vous facturez la TVA normalement : les règles ci-dessus s'appliquent.");

    // 7 Mentions
    var mentions;
    if (regime === "tva_fr") mentions = "Total hors taxe et TVA par taux (article 242 nonies A, 11° de l'annexe II du CGI), numéros d'identification des deux parties s'ils existent.";
    else if (regime === "exo_intracom") mentions = "Numéros de TVA du vendeur et de l'acquéreur (3°) et la référence de l'exonération, par exemple « Exonération de TVA, article 262 ter I du CGI » (12°).";
    else if (regime === "export") mentions = "La référence de l'exonération, par exemple « Exonération de TVA, article 262 I du CGI » (12°), et l'adresse de livraison si elle diffère (7° bis).";
    else if (regime === "autoliq_ue") mentions = "La mention « Autoliquidation » (13°) et les numéros de TVA du prestataire et du preneur (4°), sans montant de TVA.";
    else if (regime === "franchise") mentions = "La mention propre à la franchise en base, que votre comptable vous donne.";
    else mentions = "Pas de TVA française ; la mention dépend du pays concerné ou du régime à valider : demandez-la à votre comptable.";
    add("info", mentions + " Indiquez aussi si la facture porte sur des biens, des services ou les deux (8° bis).");

    // 8 TVA en jeu
    var exoRegime = regime === "exo_intracom" || regime === "export";
    var bloquant = c.some(function (x) { return x.statut === "bad"; });
    var tvaCents;
    if (regime === "tva_fr" || regime === "a_valider") tvaCents = tvaPleine;
    else if (exoRegime && bloquant) tvaCents = tvaPleine;
    else tvaCents = 0;
    var enJeuCents = (exoRegime || regime === "autoliq_ue") ? tvaPleine : 0;
    if (o.montantCents === 0) add("warn", "Montant à renseigner pour chiffrer la TVA.");
    else if (o.tauxC === 0 && regime !== "franchise") add("warn", "Taux de TVA à renseigner : sans taux, la TVA en jeu ne se calcule pas.");
    else if (exoRegime || regime === "autoliq_ue") add("info", "Si une condition manque, " + fmtEur(tvaPleine) + " de TVA française au taux de " + fmtTaux(o.tauxC) + " sur " + fmtEur(o.montantCents) + " hors taxes peuvent rester à votre charge.");
    else if (regime === "tva_fr" || regime === "a_valider") add("info", "TVA française au taux de " + fmtTaux(o.tauxC) + " : " + fmtEur(tvaPleine) + ", soit " + fmtEur(o.montantCents + tvaPleine) + " toutes taxes comprises.");
    else add("info", "Pas de TVA française chiffrée sur ce régime.");

    // 9 Date
    var dIso = isoDate(o.date);
    if (!o.date) add("warn", "Date de facture à renseigner.");
    else if (dIso < BASCULE) add("ok", "Facture avant le 1er janvier 2027 : les articles du code général des impôts s'appliquent tels quels.");
    else if (dIso <= FIN_RENVOIS) add("info", "À partir du 1er janvier 2027, la TVA passe dans le code des impositions sur les biens et services. Les renvois au code général des impôts dans les mentions des factures restent possibles jusqu'au 30 juin 2028 (BOI-RES-TVA-000253-20261007).");
    else add("warn", "Facture après le 30 juin 2028 : citez dans la mention l'article correspondant du code des impositions sur les biens et services, plus le code général des impôts.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    c.forEach(function (x) { if (x.statut === "ok") nbOk++; else if (x.statut === "warn") nbWarn++; else if (x.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad ? "bad" : nbWarn ? "warn" : "ok";

    var verdict;
    if (nbBad) verdict = (nbBad > 1 ? nbBad + " points bloquants" : "1 point bloquant") + (exoRegime || (regime === "tva_fr" && o.operation === "biens" && o.destination === "ue") ? " : en l'état, facturez la TVA française (" + fmtEur(tvaPleine) + ") ou réunissez les conditions avant la facture." : " : corrigez avant d'envoyer le devis.");
    else if (nbWarn) verdict = "Aucun point bloquant, " + nbWarn + " à compléter. Régime : " + REGIME_LABELS[regime].toLowerCase() + ".";
    else verdict = "Aucun point bloquant ni à compléter. Régime : " + REGIME_LABELS[regime].toLowerCase() + ".";

    var cond;
    if (regime === "exo_intracom") cond = "2. Ce régime suppose que le client nous communique par écrit, avant l'expédition, un numéro de TVA valide attribué par un autre État membre que la France ; nous le vérifions.";
    else if (regime === "export") cond = "2. Ce régime suppose la preuve de la sortie des biens hors de l'Union européenne ; si le client organise le transport, il nous remet la déclaration de son transporteur ou transitaire.";
    else if (regime === "autoliq_ue") cond = "2. Le client, assujetti établi dans un autre État membre, nous communique son numéro de TVA ; il acquitte la TVA dans son pays (autoliquidation).";
    else if (regime === "tva_fr") cond = "2. La TVA française au taux en vigueur à la date de l'opération s'ajoute aux prix.";
    else cond = "2. Le traitement de la TVA sera confirmé par écrit avant la facture, après vérification par notre conseil.";
    var preuveLigne = biensSortent && o.transport === "client"
      ? (o.destination === "ue" ? "3. Si le client transporte ou fait transporter les biens, il nous remet les documents de transport et une confirmation écrite de réception dans l'autre État membre." : "3. Si le client transporte ou fait transporter les biens, il nous remet la déclaration du transporteur ou du transitaire attestant la sortie de l'Union européenne.")
      : "3. Le client nous signale par écrit toute erreur sur l'adresse de livraison ou sur le pays de destination avant l'expédition.";
    var clause = [
      "Article [X] : TVA et client établi hors de France",
      "1. Les prix sont indiqués hors taxes. Régime de TVA retenu à la date du devis : " + REGIME_LABELS[regime].toLowerCase() + ".",
      cond,
      preuveLigne,
      "4. Si une condition manque à la date de la facture, la TVA française est facturée ; si la condition est remplie ensuite, une facture rectificative est émise lorsque la loi le permet.",
      "5. Toute TVA mise à notre charge du fait d'un numéro ou d'un document inexact fourni par le client lui est refacturée.",
      "6. Le client nous informe sans délai de tout changement de numéro de TVA, d'adresse ou d'établissement.",
      "7. À compter du 1er janvier 2027, les références légales de nos factures pourront viser le code général des impôts ou le code des impositions sur les biens et services."
    ].join("\n");

    var actions = [];
    if (numeroUtile && o.numero !== "verifie") actions.push("Obtenir le numéro de TVA du client par écrit, le vérifier et classer la preuve datée de la vérification avec le devis.");
    if (biensSortent && o.preuves !== "completes") actions.push(o.destination === "ue" ? "Lister dans le devis les documents attendus : lettre de voiture, facture du transporteur, confirmation de réception." : "Prévoir la déclaration d'exportation, ou la déclaration du transporteur et la preuve du paiement si le client transporte.");
    if (recapUtile && o.recap !== "oui") actions.push("Vérifier avec votre comptable le dépôt de l'état récapitulatif des clients pour le mois concerné.");
    if (regime === "hors_fr_local" || regime === "hors_fr_services" || regime === "a_valider" || regime === "franchise") actions.push("Faire valider le régime par votre expert-comptable avant d'envoyer le devis, et noter sa réponse dans le dossier.");
    if (exoRegime || regime === "autoliq_ue") actions.push("Écrire dans le devis que les prix sont hors taxes et que la TVA française sera facturée si une condition manque.");
    if (o.date && isoDate(o.date) >= BASCULE) actions.push("Mettre à jour vos modèles de facture pour 2027 : renvois au code général des impôts possibles jusqu'au 30 juin 2028.");
    if (o.montantCents === 0) actions.push("Renseigner le montant hors taxes pour chiffrer la TVA en jeu.");
    if (!actions.length) actions.push("Rien de bloquant : gardez le devis, le numéro vérifié et les preuves dans le même dossier.");

    var demande;
    if (regime === "exo_intracom") demande = "Pour vous facturer hors taxes, nous avons besoin, avant l'expédition, de votre numéro de TVA intracommunautaire par écrit" + (o.transport === "client" ? ", puis, à réception, d'une confirmation écrite de réception avec les documents de transport." : ", puis d'une confirmation de réception à l'arrivée.");
    else if (regime === "export") demande = o.transport === "client" ? "Comme vous organisez le transport, merci de nous transmettre la déclaration de votre transporteur ou transitaire attestant la sortie de l'Union européenne." : "Nous préparons l'export ; merci de nous confirmer l'adresse de livraison exacte et le destinataire.";
    else if (regime === "autoliq_ue") demande = "La prestation sera facturée hors taxes avec la mention « Autoliquidation ». Merci de nous confirmer par écrit votre numéro de TVA intracommunautaire et l'adresse de l'établissement concerné.";
    else if (regime === "tva_fr") demande = "Le devis est établi avec la TVA française au taux en vigueur. Si votre société dispose d'un numéro de TVA dans un autre État membre et que les biens y sont livrés, envoyez-le nous avant l'expédition.";
    else demande = "Nous vérifions avec notre conseil le traitement de la TVA pour cette opération et revenons vers vous par écrit avant la facture.";
    var message = [
      "Objet : TVA de notre devis du [date]",
      "",
      "Bonjour,",
      "",
      demande,
      "Le devis indique les prix hors taxes ; si une condition manque à la date de la facture, la TVA française s'ajoutera.",
      "",
      "Merci,",
      "[Prénom Nom]"
    ].join("\n");

    var recapLines = [
      "Vérificateur TVA client étranger pour un devis B2B",
      "Opération : " + OPERATION_LABELS[o.operation] + " ; destination : " + DESTINATION_LABELS[o.destination],
      "Client : " + STATUT_CLIENT_LABELS[o.statut] + ", établi " + (o.clientEtab === "france" ? "en France" : o.clientEtab === "ue" ? "dans un autre pays de l'UE" : "hors UE") + " ; numéro : " + NUMERO_LABELS[o.numero],
      "Transport : " + TRANSPORT_LABELS[o.transport] + " ; preuves : " + PREUVES_LABELS[o.preuves] + " ; état récapitulatif : " + RECAP_LABELS[o.recap],
      "Franchise en base : " + FRANCHISE_LABELS[o.franchise],
      "Montant : " + fmtEur(o.montantCents) + " hors taxes ; taux : " + fmtTaux(o.tauxC),
      "Régime : " + REGIME_LABELS[regime] + " ; mention : " + MENTION_LABELS[regime],
      "TVA française à facturer : " + fmtEur(tvaCents) + " ; TVA en jeu : " + fmtEur(enJeuCents),
      "Facture prévue : " + fmtDate(o.date),
      "Contrôle : " + nbOk + " conformes, " + nbWarn + " à compléter, " + nbBad + " bloquants, " + nbInfo + " informations",
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    return {
      input: o, regime: regime, regimeLabel: REGIME_LABELS[regime], mentionLabel: MENTION_LABELS[regime],
      tvaPleineCents: tvaPleine, tvaCents: tvaCents, enJeuCents: enJeuCents,
      tvaLabel: fmtEur(tvaCents), enJeuLabel: enJeuCents ? fmtEur(enJeuCents) : "Sans objet",
      controles: c, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat,
      verdict: verdict, clause: clause, actions: actions, message: message, recap: recapLines.join("\n")
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, LABEL_SETS, OPERATION_LABELS, DESTINATION_LABELS, ETAB_LABELS, STATUT_CLIENT_LABELS, NUMERO_LABELS, TRANSPORT_LABELS, PREUVES_LABELS, RECAP_LABELS, FRANCHISE_LABELS, REGIME_LABELS, MENTION_LABELS, computeTva, computeRegime, normalize, buildRecap, fmtEur, fmtTaux, fmtDate, parseDate, isoDate, dec };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computeTva(readForm());
      document.getElementById("regimeOut").textContent = r.regimeLabel;
      document.getElementById("tvaOut").textContent = r.tvaLabel;
      document.getElementById("enJeuOut").textContent = r.enJeuLabel;
      document.getElementById("mentionOut").textContent = r.mentionLabel;
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
