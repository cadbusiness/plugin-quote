/* eslint-disable */
// @ts-nocheck

  var SLUG = "verificateur-condition-suspensive-devis";
  var STATUT_LABELS = { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" };
  var POINTS = [
    { id: "evenement", label: "Nature de l'événement" },
    { id: "redaction", label: "Formation de la commande" },
    { id: "delai", label: "Date limite" },
    { id: "demarches", label: "Démarches et preuve à fournir" },
    { id: "beneficiaire", label: "Bénéficiaire de la condition" },
    { id: "acompte", label: "Acompte" },
    { id: "engagements", label: "Engagements avant la réalisation" },
    { id: "suivi", label: "Suivi du dossier" },
    { id: "preuve", label: "Preuve conservée" },
    { id: "situation", label: "Situation actuelle" }
  ];
  var LABEL_SETS = {
      "evenement": {
        "financement": "Un financement du client (prêt, crédit-bail, location financière, subvention)",
        "marche": "L'obtention par le client d'un marché ou d'une commande de son propre client",
        "autorisation": "L'accord ou l'autorisation d'un tiers (administration, bailleur des locaux, copropriété)",
        "interne": "L'accord interne du client (direction, conseil, maison mère, budget)",
        "nous": "Notre propre validation (visite technique, étude, faisabilité)"
      },
      "redaction": {
        "precise": "Écrite dans le devis, avec un événement précis (montant, référence, critère mesurable)",
        "vague": "Écrite dans le devis en termes généraux (« sous réserve de financement »)",
        "ajout_accepte": "Ajoutée par le client à la signature, et nous l'avons acceptée par écrit",
        "ajout_sans_reponse": "Ajoutée par le client à la signature, sans réponse écrite de notre part",
        "orale": "Convenue à l'oral seulement"
      },
      "delai": {
        "date": "Oui, une date limite est écrite",
        "aucun": "Non, aucune date limite"
      },
      "demarches": {
        "ecrites": "Écrites : ce que le client doit faire, avant quand, et la preuve à nous transmettre",
        "partielles": "En partie (une démarche est citée, sans date ou sans preuve à transmettre)",
        "aucune": "Rien n'est écrit"
      },
      "beneficiaire": {
        "client": "Dans l'intérêt exclusif du client",
        "nous": "Dans notre intérêt exclusif",
        "deux": "Dans l'intérêt des deux parties",
        "non_dit": "Le devis ne le dit pas"
      },
      "acompteClause": {
        "restitution": "Il est restitué si la condition défaille",
        "exigible_apres": "Il n'est exigible qu'à la réalisation de la condition",
        "acquis": "Il reste acquis en toute hypothèse",
        "rien": "Rien n'est écrit sur l'acompte"
      },
      "engagements": {
        "aucun": "Rien n'est commandé ni commencé avant la réalisation",
        "etude": "Seulement une étude ou des plans, facturés à part par un accord distinct",
        "commande": "Matériel commandé ou travaux commencés avant la réalisation"
      },
      "suivi": {
        "statut_date": "Dossier en attente, date limite notée, relance prévue",
        "partiel": "Dossier suivi, sans date limite notée",
        "aucun": "Dossier déjà marqué gagné, ou pas suivi"
      },
      "preuve": {
        "dossier": "Tout est daté et gardé : devis, réserve, réponses, relances, justificatifs",
        "partielle": "Une partie seulement (le devis signé, quelques e-mails)",
        "aucune": "Rien d'écrit en dehors du devis"
      },
      "situation": {
        "avant": "Avant d'envoyer le devis : je vérifie la clause",
        "attente": "La condition est en attente, la date limite n'est pas atteinte",
        "realisee": "La condition est réalisée (financement, accord ou marché obtenu)",
        "refus_justifie": "Le client annonce un refus, justificatif à l'appui",
        "refus_non_justifie": "Le client annonce un refus, sans justificatif",
        "client_empeche": "Le client n'a pas fait ses démarches ou a fait échouer la condition",
        "nous_empeche": "La condition a échoué de notre fait (pièces non transmises au tiers)",
        "date_passee": "La date limite est passée sans réalisation",
        "renonciation_avant": "Le client veut renoncer à la condition avant la date limite",
        "renonciation_tardive": "Le client veut commander quand même, après la date limite"
      }
    };
  var DEFAULTS = {
      "evenement": "financement",
      "redaction": "ajout_accepte",
      "delai": "aucun",
      "demarches": "aucune",
      "beneficiaire": "non_dit",
      "acompteClause": "rien",
      "engagements": "commande",
      "suivi": "partiel",
      "preuve": "partielle",
      "situation": "refus_non_justifie",
      "montantDevis": "46800",
      "acompte": "16848",
      "fraisEngages": "17900"
    };
  var MAX_MONTANT = 100000000;
  var EVT = {
    financement: "de financement",
    marche: "d'attribution du marché",
    autorisation: "d'autorisation",
    interne: "d'accord de votre direction",
    nous: "de validation technique"
  };
  function dec(v) {
    if (v === null || v === undefined) return NaN;
    var s = String(v).replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    if (s === "" || !/^-?\d*\.?\d+$/.test(s)) return NaN;
    return parseFloat(s);
  }
  function round2(n) { return Math.round(n * 100) / 100; }
  function fmtNum(n) {
    var r = round2(n);
    var neg = r < 0; r = Math.abs(r);
    var ip = Math.floor(r), fp = Math.round((r - ip) * 100);
    if (fp === 100) { ip += 1; fp = 0; }
    var s = String(ip).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if (fp > 0) s += "," + (fp < 10 ? "0" : "") + fp;
    return (neg ? "-" : "") + s;
  }
  function fmtEur(n) { return fmtNum(n) + " €"; }
  function fmtPct(n) { return fmtNum(n) + " %"; }
  function pluriel(n, s, p) { return n + " " + (n > 1 ? (p || s + "s") : s); }
  function montant(v) {
    var n = dec(v);
    if (!isFinite(n) || n < 0) return 0;
    return round2(Math.min(n, MAX_MONTANT));
  }
  function pick(v, set, def) { return Object.prototype.hasOwnProperty.call(set, v) ? v : def; }
  function normalize(raw) {
    var r = raw || {};
    var x = {};
    Object.keys(LABEL_SETS).forEach(function (k) { x[k] = pick(String(r[k] == null ? "" : r[k]).trim(), LABEL_SETS[k], DEFAULTS[k]); });
    x.montantDevis = montant(r.montantDevis);
    x.acompte = montant(r.acompte);
    x.fraisEngages = montant(r.fraisEngages);
    return x;
  }
  function categorie(x) {
    var s = x.situation;
    if (x.redaction === "ajout_sans_reponse" && s !== "avant") return "pas_de_contrat";
    if (s === "realisee") return "ferme";
    if (s === "renonciation_avant") return x.beneficiaire === "client" ? "ferme" : x.beneficiaire === "non_dit" ? "renonciation_douteuse" : "attente";
    if (s === "refus_justifie" || s === "nous_empeche" || s === "renonciation_tardive") return "jamais";
    if (s === "date_passee") return x.delai === "date" ? "jamais" : "attente";
    if (s === "refus_non_justifie") return "verifier";
    if (s === "client_empeche") return "empeche";
    return "attente";
  }
  function verifierCondition(raw) {
    var x = normalize(raw);
    var cat = categorie(x);
    var s = x.situation;
    var tiers = x.evenement === "financement" || x.evenement === "marche" || x.evenement === "autorisation";
    var echec = cat === "jamais" || cat === "pas_de_contrat";
    var pct = x.montantDevis > 0 ? round2(x.fraisEngages / x.montantDevis * 100) : null;
    var c = [];
    function add(statut, texte) { c.push({ point: POINTS[c.length].label, statut: statut, texte: texte }); }

    // 1. Nature de l'événement
    if (tiers) {
      if (x.redaction === "precise") add("ok", "L'événement dépend d'un tiers (banque, donneur d'ordre, autorité) et il est décrit précisément : la condition est valable et se vérifie.");
      else add("warn", "L'événement dépend d'un tiers, la condition est donc valable ; mais sans montant, durée, référence ou nature précise, on ne saura pas dire si elle est remplie, et dans le doute le contrat se lit en faveur du client débiteur du prix (article 1190).");
    } else if (x.evenement === "interne") {
      if (x.redaction === "precise") add("warn", "L'accord interne du client reste très proche de sa seule volonté, même décrit (vote d'un budget à une date, procès-verbal transmis). Une condition qui dépend de la seule volonté du débiteur est nulle (article 1304-2) : mieux vaut attendre la décision avant d'accepter la commande.");
      else add("bad", "La commande dépend de la seule décision du client : son obligation est exposée à la nullité (article 1304-2). La Cour de cassation exige de dire de quel acte de volonté, autre que celui des parties, ou de quelle circonstance dépend la condition (arrêt du 25 juin 2025, n° 22-17.090).");
    } else {
      if (x.redaction === "precise") add("ok", "La réserve dépend de votre validation, mais elle repose sur un critère mesurable et vérifiable : une condition qui dépend de circonstances objectives susceptibles d'être contrôlées par un juge n'est pas potestative (arrêt du 22 septembre 2021, n° 19-23.958).");
      else add("bad", "« Sous réserve de validation par nos services » fait dépendre votre engagement de votre seule volonté : l'obligation est exposée à la nullité (article 1304-2) et le client peut soutenir que vous ne vous êtes engagé à rien. Écrivez le critère mesurable que la visite ou l'étude doit constater.");
    }

    // 2. Formation de la commande
    if (x.redaction === "precise" || x.redaction === "vague") add("ok", "La condition figure dans votre devis, accepté par le client : la commande est formée sous cette condition.");
    else if (x.redaction === "ajout_accepte") add("warn", "La réserve du client était une offre nouvelle (article 1118, alinéa 3) ; en l'acceptant par écrit, vous avez conclu la commande sous la condition telle qu'il l'a écrite, avec ses imprécisions. Faites-la remplacer par une clause complète.");
    else if (x.redaction === "ajout_sans_reponse") add("bad", "Une acceptation non conforme à l'offre est dépourvue d'effet, sauf à constituer une offre nouvelle (article 1118), et le silence ne vaut pas acceptation (article 1120) : tant que vous n'avez pas répondu, il n'y a pas de commande.");
    else add("bad", "Une condition seulement orale se prouve mal : chacun se souviendra d'un événement, d'une date et d'un montant différents. Écrivez-la et faites-la signer.");

    // 3. Date limite
    if (x.delai === "date") add("ok", "Une date limite est écrite : à cette date, la condition est réalisée ou elle a défailli, et la commande est ferme ou réputée n'avoir jamais existé (article 1304-6).");
    else add("bad", "Aucune date limite : le code n'en fixe pas à votre place. La commande reste en suspens, vous ne pouvez rien planifier et le client peut revenir des mois plus tard. Fixez une date par écrit, signée des deux parties.");

    // 4. Démarches
    if (x.evenement === "nous") add("info", "Sans objet pour le client : l'événement dépend de votre visite ou de votre étude. Écrivez sa date et le délai dans lequel vous communiquez le résultat.");
    else if (x.demarches === "ecrites") add("ok", "Les démarches du client et la preuve à transmettre sont écrites : s'il ne fait rien, il manque à une obligation écrite, et vous le savez à temps.");
    else {
      var lourd = x.demarches === "aucune" && (s === "client_empeche" || s === "refus_non_justifie");
      add(lourd ? "bad" : "warn", "Celui qui réclame l'exécution d'une obligation doit la prouver (article 1353) : sans démarches écrites ni preuve à transmettre, il vous sera difficile de montrer que le client a fait échouer la condition." + (lourd ? " C'est précisément la question qui se pose aujourd'hui." : ""));
    }

    // 5. Bénéficiaire
    if (s === "renonciation_avant" && (x.beneficiaire === "nous" || x.beneficiaire === "deux")) add("bad", "Le client veut renoncer à une condition qui n'est pas stipulée dans son intérêt exclusif : il ne peut pas le faire seul (article 1304-4). Il faut un accord écrit des deux parties.");
    else if (x.beneficiaire === "non_dit") add("warn", "Le devis ne dit pas dans l'intérêt de qui la condition est stipulée. Or seule la partie dans l'intérêt exclusif de laquelle elle l'est peut y renoncer seule (article 1304-4) : écrivez-le.");
    else add("ok", x.beneficiaire === "client" ? "La condition est stipulée dans l'intérêt exclusif du client : lui seul peut y renoncer, par écrit, avant qu'elle soit réalisée ou ait défailli." : x.beneficiaire === "nous" ? "La condition est stipulée dans votre intérêt exclusif : vous seul pouvez y renoncer, avant qu'elle soit réalisée ou ait défailli." : "La condition est stipulée dans l'intérêt des deux parties : elle ne se lève que d'un commun accord écrit.");

    // 6. Acompte
    if (x.acompte <= 0) add("ok", x.acompteClause === "acquis" ? "Aucun acompte encaissé. Retirez quand même la mention « acquis en toute hypothèse » : elle ne rend pas ferme une commande qui n'a jamais existé." : "Aucun acompte encaissé avant la réalisation : rien à restituer en cas d'échec.");
    else if (x.acompteClause === "restitution") add("ok", "Le sort de l'acompte est écrit : restitué en cas de défaillance. C'est ce que prévoient de toute façon les articles 1304-5 et 1304-6, et le client sait qu'il récupère son argent s'il joue le jeu.");
    else if (x.acompteClause === "exigible_apres") add("warn", "Le devis rend l'acompte exigible à la réalisation, mais vous l'avez déjà encaissé : tant que la condition n'est pas réalisée, le client peut le réclamer (article 1304-5, alinéa 2).");
    else if (x.acompteClause === "acquis") add("bad", "« Acquis en toute hypothèse » ne résiste pas aux articles 1304-5 et 1304-6 : si la condition défaille, la commande est réputée n'avoir jamais existé et ce qui a été versé se rend (arrêt du 18 juin 2025, n° 23-14.050). La mention risque d'être discutée comme une pénalité.");
    else add("warn", "Rien n'est écrit sur l'acompte. Tant que la condition n'est pas réalisée, ce qui a été payé peut être réclamé (article 1304-5, alinéa 2) ; en cas de défaillance, il se rend (article 1304-6).");

    // 7. Engagements
    if (cat === "ferme") add("ok", "La commande est ferme : vos engagements portent désormais sur une commande ferme.");
    else if (x.engagements === "aucun") add("ok", "Rien n'est engagé avant la réalisation : en cas d'échec, vous ne perdez que le temps du devis.");
    else if (x.engagements === "etude") add("ok", "L'étude ou les plans sont payés par un accord distinct, indépendant de la condition : ils restent dus même si la commande n'aboutit pas.");
    else if (echec && x.fraisEngages > 0) add("bad", "Du matériel a été commandé ou des travaux commencés avant la réalisation, et la condition a défailli : ces frais restent à votre charge. Pendant l'attente, la chose reste aux risques du débiteur (article 1304-6).");
    else add("warn", "Du matériel a été commandé ou des travaux commencés avant la réalisation : à vos risques. Si la condition défaille, rien dans le code ne met ces frais à la charge du client (article 1304-6).");

    // 8. Suivi
    if (x.suivi === "statut_date") add("ok", "Le dossier est en attente, avec sa date limite et une relance : vous saurez à temps s'il faut proroger.");
    else if (x.suivi === "partiel") add("warn", "Le dossier est suivi, mais la date limite n'est pas notée : la relance d'avant l'échéance risque de partir trop tard.");
    else add("warn", "Le dossier est marqué gagné ou n'est pas suivi : votre prévision et votre planning comptent une commande qui n'est pas ferme.");

    // 9. Preuve
    if (x.preuve === "dossier") add("ok", "Tout est daté et gardé : entre commerçants, la preuve est libre (article L110-3 du code de commerce), et un e-mail daté vaut mieux qu'un souvenir.");
    else if (x.preuve === "partielle") add("warn", "Une partie seulement est gardée : réunissez la réserve, votre réponse, les relances et les justificatifs, datés.");
    else add("bad", "Rien d'écrit en dehors du devis : vous ne pourrez prouver ni la condition convenue, ni les démarches du client, ni vos propres envois.");

    // 10. Situation
    var SIT = {
      avant: ["info", "Avant l'envoi : c'est le meilleur moment pour écrire l'événement, la date, les démarches, le bénéficiaire et le sort de l'acompte."],
      attente: ["info", "Condition en attente : ni vous ni le client n'êtes tenus d'exécuter. Le client doit s'abstenir de tout acte qui empêcherait la bonne exécution (article 1304-5)."],
      realisee: ["ok", "Condition réalisée : l'obligation devient pure et simple à compter de sa réalisation (article 1304-6). Demandez le justificatif."],
      refus_justifie: ["info", "Refus justifié : la condition a défailli et la commande est réputée n'avoir jamais existé (article 1304-6). Le contrat ne s'est pas formé, ce qui a été versé se rend (arrêt du 18 juin 2025, n° 23-14.050)."],
      refus_non_justifie: ["warn", "Refus annoncé sans justificatif : demandez la réponse de l'établissement ou du tiers, avec la date et l'objet de la demande. Elle dit si la condition a défailli (la commande n'a jamais existé) ou si le client l'a fait échouer (elle est réputée accomplie). Retenir l'acompte en attendant est fragile : tant que la condition n'est pas réalisée, ce qui a été payé peut être réclamé (article 1304-5)."],
      client_empeche: ["warn", "Si vous prouvez que le client, débiteur obligé sous la condition, en a empêché l'accomplissement, elle est réputée accomplie et la commande est ferme (article 1304-3 ; arrêt publié du 24 septembre 2026, n° 24-16.732). Tout repose sur la preuve."],
      nous_empeche: ["bad", "L'échec vient de vous : la condition n'est pas réputée accomplie contre le client, et il peut vous demander réparation (arrêt publié du 24 septembre 2026, n° 24-16.732). Proposez un report écrit."],
      date_passee: x.delai === "date"
        ? ["info", "Date passée sans réalisation : la condition a défailli, la commande est réputée n'avoir jamais existé (article 1304-6)."]
        : ["warn", "Aucune date n'étant écrite, rien n'a expiré : la commande reste en suspens. Convenez d'une date par écrit."],
      renonciation_avant: x.beneficiaire === "client"
        ? ["ok", "Le client peut renoncer à une condition stipulée dans son intérêt exclusif tant qu'elle n'est ni réalisée ni défaillie (article 1304-4). Demandez une renonciation écrite et claire : son silence ne vaut pas renonciation (arrêt du 24 septembre 2026, n° 24-16.361)."]
        : x.beneficiaire === "non_dit"
        ? ["warn", "Le client ne peut renoncer seul que si la condition est stipulée dans son intérêt exclusif (article 1304-4), et le devis ne le dit pas. Faites signer la renonciation par les deux parties."]
        : ["bad", "La condition n'est pas dans l'intérêt exclusif du client : sa renonciation seule ne lève pas la condition (article 1304-4)."],
      renonciation_tardive: ["warn", "Après la date limite, la condition a défailli et ne peut plus faire l'objet d'une renonciation (article 1304-4) : il faut un nouvel accord, au prix et au planning du jour."]
    };
    add(SIT[s][0], SIT[s][1]);

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    c.forEach(function (p) { if (p.statut === "ok") nbOk++; else if (p.statut === "warn") nbWarn++; else if (p.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : nbWarn > 0 ? "warn" : "ok";
    var verdict;
    if (nbBad > 0) verdict = (s === "avant" ? "À corriger avant d'envoyer le devis : " : "À reprendre avant de répondre au client : ") + pluriel(nbBad, "point bloquant", "points bloquants") + (nbWarn > 0 ? ", " + pluriel(nbWarn, "point à revoir", "points à revoir") : "") + ".";
    else if (nbWarn > 0) verdict = "Pas de point bloquant, " + pluriel(nbWarn, "point à revoir", "points à revoir") + ".";
    else verdict = "Condition bien cadrée : l'événement, la date, les démarches et l'acompte sont écrits.";

    var ETAT_LABELS = {
      pas_de_contrat: "Pas de commande : la réserve du client est une offre nouvelle (article 1118)",
      ferme: s === "realisee" ? "Ferme depuis la réalisation de la condition" : "Ferme : le client renonce à une condition stipulée dans son intérêt",
      renonciation_douteuse: "Ferme seulement si la condition était dans l'intérêt exclusif du client",
      jamais: s === "refus_justifie" ? "Réputée n'avoir jamais existé"
        : s === "nous_empeche" ? "Réputée n'avoir jamais existé, et le client peut demander réparation"
        : s === "renonciation_tardive" ? "Défaillie : il faut un nouvel accord écrit"
        : "Réputée n'avoir jamais existé",
      verifier: "À vérifier : demandez le justificatif du refus",
      empeche: "Réputée ferme si vous prouvez que le client a empêché la condition",
      attente: s === "avant" ? "Pas encore proposée : vérifiez la clause avant d'envoyer le devis"
        : s === "date_passee" ? "Toujours en attente : aucune date limite n'est écrite"
        : s === "renonciation_avant" ? "Toujours sous condition : le client ne peut pas renoncer seul"
        : "Formée sous condition, pas encore ferme"
    };
    var etatLabel = ETAT_LABELS[cat];

    var a = x.acompte;
    var acompteLabel;
    if (a <= 0) acompteLabel = "Aucun acompte encaissé";
    else if (cat === "ferme") acompteLabel = fmtEur(a) + " : acompte sur une commande ferme";
    else if (cat === "jamais" || cat === "pas_de_contrat") acompteLabel = fmtEur(a) + " à restituer";
    else if (cat === "verifier") acompteLabel = fmtEur(a) + " : réclamable par le client tant que la condition n'est pas réalisée";
    else if (cat === "empeche") acompteLabel = fmtEur(a) + " : conservé comme acompte si la condition est réputée accomplie";
    else if (cat === "renonciation_douteuse") acompteLabel = fmtEur(a) + " : acompte sur une commande ferme si la renonciation est valable";
    else acompteLabel = fmtEur(a) + " : réclamable par le client tant que la condition n'est pas réalisée";

    var f = x.fraisEngages;
    var fraisBase = fmtEur(f) + " HT" + (pct === null ? " (montant du devis à renseigner)" : ", soit " + fmtPct(pct) + " du devis");
    var fraisLabel;
    if (f <= 0) fraisLabel = "Aucun frais engagé";
    else if (cat === "ferme") fraisLabel = "Plus à votre risque : la commande est ferme";
    else if (cat === "jamais" || cat === "pas_de_contrat") fraisLabel = fraisBase + ", à votre charge";
    else if (cat === "empeche") fraisLabel = fraisBase + ", base de votre demande de réparation";
    else fraisLabel = fraisBase + ", à votre risque";

    var actions = [];
    var FIRST = {
      ajout_sans_reponse: "Répondez par écrit à la réserve du client : refusez-la, ou proposez une clause complète (événement, démarches, date limite, acompte). Tant que vous n'avez pas répondu, il n'y a pas de commande.",
      ajout_accepte: "Faites signer au client une clause complète qui remplace sa réserve : montant ou référence, démarches, date limite, sort de l'acompte.",
      orale: "Écrivez la condition et faites-la signer : une réserve orale ne se prouve pas.",
      vague: "Précisez l'événement dans le devis : montant et durée du financement, référence du marché, nature de l'autorisation ou critère mesurable.",
      precise: "Gardez la clause telle qu'elle est écrite et reprenez-la mot pour mot dans vos échanges avec le client."
    };
    actions.push(FIRST[x.redaction]);
    if (c[0].statut === "bad") actions.push(x.evenement === "nous"
      ? "Remplacez « sous réserve de validation par nos services » par le critère mesurable que la visite ou l'étude doit constater, avec sa date."
      : "Ne prenez pas de commande qui dépend de la seule décision du client : attendez sa décision écrite, ou faites décrire l'événement extérieur dont elle dépend.");
    if (x.delai === "aucun") actions.push("Fixez une date limite par écrit, signée des deux parties, et dites ce qui se passe à cette date.");
    if (x.evenement !== "nous" && x.demarches !== "ecrites") actions.push("Demandez au client la preuve de ses démarches (date, objet et montant de la demande) et écrivez qu'il doit vous la transmettre.");
    if (x.beneficiaire === "non_dit") actions.push("Écrivez dans l'intérêt de qui la condition est stipulée : c'est ce qui décide si le client peut y renoncer seul.");
    if (a > 0 && (x.acompteClause === "rien" || x.acompteClause === "acquis")) actions.push("Écrivez le sort de l'acompte : restitué sous quinze jours en cas de défaillance justifiée, ou exigible seulement à la réalisation.");
    if (x.engagements === "commande" && cat !== "ferme") actions.push("Listez ce que vous avez commandé, à quelle date, et ce qui peut encore être annulé ou réutilisé : ces frais restent à votre risque tant que la condition n'est pas réalisée.");
    if (x.suivi !== "statut_date") actions.push("Mettez le dossier en attente, notez la date limite et prévoyez une relance une semaine avant.");
    var SIT_ACT = {
      realisee: "Demandez le justificatif de la réalisation (offre de prêt, accord écrit, décision d'attribution) et passez le dossier en gagné.",
      refus_non_justifie: "Demandez par écrit la réponse de l'établissement ou du tiers, avec la date et l'objet de la demande : elle dit si la condition a défailli ou si le client l'a fait échouer.",
      client_empeche: "Rassemblez la preuve que le client n'a pas fait ses démarches (e-mails, absence de pièces malgré vos demandes) avant de soutenir que la condition est réputée accomplie.",
      nous_empeche: "Envoyez sans attendre les pièces demandées par le tiers et proposez au client, par écrit, un report de la date limite.",
      renonciation_avant: "Demandez une renonciation écrite, claire et datée, avant la date limite.",
      renonciation_tardive: "Faites signer un nouveau devis : la condition a défailli, la renonciation n'est plus possible."
    };
    if (cat === "pas_de_contrat") { if (a > 0) actions.push("Restituez l'acompte si le client ne signe pas la clause complète."); }
    else if (SIT_ACT[s]) actions.push(SIT_ACT[s]);
    else if (cat === "jamais") actions.push(a > 0 ? "Restituez l'acompte et proposez un nouveau devis si le projet reprend." : "Prenez acte de la défaillance par écrit et proposez un nouveau devis si le projet reprend.");
    actions.push("Gardez dans le dossier le devis, la réserve, vos réponses, les relances et les justificatifs, datés.");

    var EVENT_TXT = {
      financement: "La présente commande est conclue sous la condition suspensive de l'obtention par le client d'un [prêt, crédit-bail ou location financière] d'un montant maximal de [montant] €, d'une durée maximale de [durée] mois, auprès de [l'établissement de son choix].",
      marche: "La présente commande est conclue sous la condition suspensive de l'attribution au client du marché [référence ou désignation] par [donneur d'ordre].",
      autorisation: "La présente commande est conclue sous la condition suspensive de l'obtention par le client de [autorisation ou accord écrit] délivré par [autorité ou tiers] pour [objet].",
      interne: "La présente commande est conclue sous la condition suspensive de la décision écrite de [direction, conseil ou maison mère] du client approuvant [budget ou investissement], que le client nous transmet.",
      nous: "La présente commande est conclue sous la condition suspensive de la confirmation, par le relevé de notre visite technique du [date], de [critère mesurable : épaisseur de dalle, puissance disponible, accès]."
    };
    var clause = [
      "Condition suspensive",
      EVENT_TXT[x.evenement],
      x.evenement === "nous"
        ? "Le client nous donne accès au site le [date] pour cette visite ; le relevé lui est transmis dans les cinq jours ouvrés."
        : "Le client engage les démarches nécessaires au plus tard le [date] et nous en transmet la preuve dans les cinq jours ouvrés." + (x.evenement === "financement" ? " Nous transmettons à l'établissement, à première demande, la facture pro forma et les fiches techniques nécessaires." : ""),
      "La condition doit être réalisée au plus tard le [date]. " + (x.evenement === "nous" ? "Nous informons le client du résultat par écrit, relevé joint." : "Le client nous informe par écrit de sa réalisation ou de sa défaillance dans les cinq jours ouvrés, justificatif joint."),
      x.beneficiaire === "nous" ? "La condition est stipulée dans notre intérêt exclusif ; nous pouvons y renoncer par écrit avant cette date."
        : x.beneficiaire === "deux" ? "La condition est stipulée dans l'intérêt des deux parties ; elle ne peut être levée que par un accord écrit des deux."
        : "La condition est stipulée dans l'intérêt exclusif du client, qui peut y renoncer par écrit avant cette date ; la commande devient alors ferme.",
      "À défaut de réalisation à cette date, la commande est réputée n'avoir jamais existé" + (x.acompteClause === "exigible_apres" ? " ; l'acompte n'est exigible qu'à la réalisation de la condition." : " ; l'acompte versé est restitué dans les quinze jours de la notification de la défaillance, justificatif joint."),
      x.engagements === "etude"
        ? "Aucune commande de matériel ni aucun travail n'est engagé avant la réalisation de la condition, en dehors de [l'étude] facturée à part ; le délai d'exécution court à compter de la réalisation."
        : "Aucune commande de matériel ni aucun travail n'est engagé avant la réalisation de la condition ou la renonciation écrite du client ; le délai d'exécution court à compter de cette date."
    ].join("\n");

    var ev = EVT[x.evenement];
    var m = [];
    var body = [];
    var objet;
    var montantAcompte = a > 0 ? fmtEur(a) : "[montant] €";
    if (cat === "pas_de_contrat") {
      objet = "votre acceptation du devis n° [référence] sous réserve";
      body.push("Nous avons bien reçu le devis signé, avec la mention « [mention du client] ». Cette réserve modifie notre proposition : pour l'accepter, nous avons besoin de la préciser avec vous.");
      body.push("Nous vous proposons la rédaction jointe : [événement précis], démarches avant le [date], réalisation avant le [date], restitution de l'acompte sous quinze jours en cas de défaillance justifiée, aucune commande de matériel avant la réalisation.");
      body.push("Merci de nous la retourner signée. D'ici là, la commande n'est pas lancée.");
    } else if (s === "avant") {
      objet = "notre devis n° [référence] sous condition suspensive";
      body.push("Vous trouverez ci-joint notre devis. Comme convenu, la commande est conclue sous la condition " + ev + " décrite au paragraphe « Condition suspensive ».");
      body.push("Merci de vérifier avec nous l'événement visé, la date limite du [date] et les justificatifs à nous transmettre avant de signer : si l'un de ces points ne vous convient pas, dites-le-nous et nous adapterons la rédaction.");
    } else if (s === "attente") {
      objet = "condition " + ev + " du devis n° [référence], échéance du [date]";
      body.push("La condition " + ev + " prévue à notre devis arrive à échéance le [date]. Pouvez-vous nous indiquer où en est votre demande et nous transmettre la réponse dès que vous l'avez ?");
      body.push("Si un délai supplémentaire est nécessaire, nous pouvons signer un report avant cette date.");
    } else if (s === "realisee") {
      objet = "réalisation de la condition du devis n° [référence]";
      body.push("Nous avons bien reçu [justificatif] du [date]. La condition est réalisée : la commande est ferme.");
      if (x.acompteClause === "exigible_apres") body.push("L'acompte prévu au devis est désormais exigible.");
      body.push("Nous vous proposons de fixer [la livraison et la pose] au [date].");
    } else if (s === "refus_non_justifie") {
      objet = "votre courrier du [date] sur la condition " + ev + " du devis n° [référence]";
      body.push("Vous nous indiquez que la condition " + ev + " ne sera pas réalisée" + (a > 0 ? " et vous nous demandez la restitution de l'acompte de " + montantAcompte : "") + ". Pour que nous puissions constater la défaillance de la condition, merci de nous transmettre la réponse que vous avez reçue, avec la date et l'objet de votre demande.");
      body.push("Dès réception, nous " + (a > 0 ? "vous confirmerons la date de restitution" : "prendrons acte de la défaillance") + ". Dans l'attente, l'exécution prévue le [date] est suspendue.");
    } else if (s === "client_empeche") {
      objet = "condition " + ev + " du devis n° [référence]";
      body.push("Vous nous indiquez que la condition " + ev + " n'est pas réalisée. Or [faits établis : aucune demande déposée, demande d'un objet différent, dossier retiré, pièces non transmises malgré nos demandes du [dates]].");
      body.push("Une condition suspensive est réputée accomplie lorsque celui qui y était obligé en a empêché l'accomplissement (article 1304-3 du code civil). Nous considérons donc que la commande est ferme et vous proposons [l'exécution au [date] / un échange sur les frais engagés].");
      body.push("Nous restons ouverts à une solution amiable et vous remercions de nous répondre d'ici le [date].");
    } else if (s === "nous_empeche") {
      objet = "report de la date limite de la condition du devis n° [référence]";
      body.push("Les pièces demandées par [établissement ou tiers] ne lui ont pas été transmises à temps de notre fait. Nous les lui adressons ce jour.");
      body.push("Nous vous proposons de reporter la date limite de la condition au [date], par un avenant signé des deux parties. Si vous préférez en rester là, nous vous restituons " + (a > 0 ? "l'acompte de " + montantAcompte : "toute somme versée") + " sous quinze jours.");
    } else if (s === "renonciation_avant") {
      objet = "renonciation à la condition du devis n° [référence]";
      if (x.beneficiaire === "nous" || x.beneficiaire === "deux") {
        body.push("Vous souhaitez lancer la commande sans attendre la réalisation de la condition " + ev + ". Cette condition étant stipulée " + (x.beneficiaire === "nous" ? "dans notre intérêt" : "dans l'intérêt des deux parties") + ", elle ne peut être levée que d'un commun accord.");
        body.push("Nous vous proposons de signer ensemble la mention suivante : « Les parties renoncent à la condition prévue au devis n° [référence] ; la commande est ferme à compter du [date]. »");
      } else {
        body.push("Vous souhaitez lancer la commande sans attendre la réalisation de la condition " + ev + ". Pour que la commande soit ferme, merci de nous retourner la mention suivante, datée et signée : « Nous renonçons à la condition prévue au devis n° [référence] ; la commande est ferme à compter de ce jour. »");
        if (x.beneficiaire === "non_dit") body.push("Le devis ne précisant pas dans l'intérêt de qui la condition est stipulée, nous la contresignerons.");
      }
    } else if (s === "renonciation_tardive") {
      objet = "votre commande sur le devis n° [référence] après l'échéance du [date]";
      body.push("La condition " + ev + " n'était pas réalisée à la date limite : la commande est réputée n'avoir jamais existé, et il n'est plus possible d'y renoncer.");
      body.push("Nous vous adressons un nouveau devis, au prix et au planning actuels." + (a > 0 ? " L'acompte de " + montantAcompte + " vous est restitué, ou imputé sur le nouveau devis si vous le signez." : ""));
    } else if (s === "date_passee" && x.delai !== "date") {
      objet = "condition " + ev + " du devis n° [référence] : convenons d'une date";
      body.push("Notre devis ne fixait pas de date limite pour la réalisation de la condition " + ev + ". Pour que chacun puisse s'organiser, nous vous proposons de convenir par écrit qu'elle devra être réalisée au plus tard le [date], faute de quoi la commande sera réputée n'avoir jamais existé" + (a > 0 ? " et l'acompte de " + montantAcompte + " vous sera restitué" : "") + ".");
    } else {
      objet = "défaillance de la condition " + ev + " du devis n° [référence]";
      body.push(s === "refus_justifie" ? "Nous avons bien reçu la réponse de [établissement ou tiers] du [date]. La condition " + ev + " n'étant pas réalisée, la commande est réputée n'avoir jamais existé." : "La condition " + ev + " n'était pas réalisée à la date limite du [date] : la commande est réputée n'avoir jamais existé.");
      body.push((a > 0 ? "Nous vous restituons l'acompte de " + montantAcompte + " par virement d'ici le [date]. " : "") + "Si votre projet reprend, nous établirons volontiers un nouveau devis.");
    }
    m.push("Objet : " + objet, "", "Madame, Monsieur,", "");
    body.forEach(function (l) { m.push(l); });
    m.push("", "Nous restons à votre disposition.", "", "Veuillez agréer, Madame, Monsieur, nos salutations distinguées.");
    var message = m.join("\n");

    var recap = [
      "Condition suspensive dans un devis : récapitulatif",
      "Événement : " + LABEL_SETS.evenement[x.evenement],
      "Rédaction : " + LABEL_SETS.redaction[x.redaction],
      "Date limite : " + LABEL_SETS.delai[x.delai],
      "Situation : " + LABEL_SETS.situation[x.situation],
      "Commande : " + etatLabel,
      "Acompte : " + acompteLabel,
      "Frais engagés : " + fraisLabel,
      "Contrôle : " + pluriel(nbOk, "conforme") + ", " + nbWarn + " à revoir, " + pluriel(nbBad, "bloquant") + ", " + pluriel(nbInfo, "information"),
      "Verdict : " + verdict,
      "Vérification : quotebuilder.co/outils/" + SLUG
    ].join("\n");
    return {
      x: x, categorie: cat, pct: pct,
      etatLabel: etatLabel, acompteLabel: acompteLabel, fraisLabel: fraisLabel,
      controles: c, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat, verdict: verdict,
      actions: actions, clause: clause, message: message, recap: recap
    };
  }

export {
  SLUG,
  DEFAULTS,
  STATUT_LABELS,
  POINTS,
  LABEL_SETS,
  MAX_MONTANT,
  verifierCondition,
  categorie,
  normalize,
  dec,
  round2,
  fmtNum,
  fmtEur,
  fmtPct,
  pluriel,
  montant,
};
