/* eslint-disable */
// @ts-nocheck
var SLUG = "calculateur-preavis-commission-agent-commercial";
  var STATUT_LABELS = { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" };
  var POINTS = [
    { id: "statut", label: "Statut de l'intermédiaire" },
    { id: "ecrit", label: "Contrat écrit" },
    { id: "preavis", label: "Durée du préavis" },
    { id: "finPreavis", label: "Date de fin du contrat" },
    { id: "indemnite", label: "Indemnité de fin de contrat" },
    { id: "delaiAn", label: "Délai d'un an pour la réclamer" },
    { id: "nonConcurrence", label: "Non-concurrence après le contrat" },
    { id: "commission", label: "Commission sur le devis" },
    { id: "paiement", label: "Paiement et relevé" },
    { id: "rupture", label: "Rupture brutale (article L442-1)" }
  ];
  var LABEL_SETS = {
    mission: {
      permanente_negociation: "Mission permanente : il prospecte, conseille et suit les négociations",
      permanente_presentation: "Mission permanente : il présente l'entreprise et transmet les contacts",
      ponctuelle: "Mission ponctuelle : il présente un ou quelques prospects nommés, puis se retire"
    },
    independance: {
      independant: "Il organise seul son travail",
      encadre: "Horaires, rapports et objectifs imposés de près"
    },
    ecrit: {
      oui: "Oui, contrat écrit et signé",
      non: "Non, accord oral ou simples e-mails"
    },
    secteurConfie: {
      oui: "Oui, un secteur ou une clientèle lui est confié",
      non: "Non"
    },
    typeContrat: {
      cdi: "Durée indéterminée",
      cdd_poursuivi: "Durée déterminée, poursuivie après son terme",
      cdd_terme: "Durée déterminée, qui s'arrête à son terme"
    },
    initiative: {
      mandant: "L'entreprise, sans faute grave de l'agent",
      faute_grave: "L'entreprise, pour une faute grave décrite dans la lettre",
      agent: "L'agent, sans reproche envers l'entreprise",
      agent_justifie: "L'agent, pour un manquement de l'entreprise, ou pour âge, infirmité ou maladie",
      cession: "L'agent cède son contrat à un successeur, avec l'accord de l'entreprise",
      force_majeure: "Force majeure"
    },
    finMois: {
      fin_mois: "Rien de contraire : fin à la fin d'un mois civil",
      date_a_date: "Le contrat prévoit une fin de date à date"
    },
    origine: {
      agent: "Préparé grâce à l'agent, ou client qu'il a déjà apporté",
      secteur: "Client de son secteur, venu en direct",
      autre: "Client hors de son secteur, sans son intervention"
    }
  };
  var DEFAULTS = {
    mission: "permanente_negociation",
    independance: "independant",
    ecrit: "oui",
    secteurConfie: "oui",
    typeContrat: "cdi",
    dateDebut: "2021-03-01",
    dateNotif: "2026-11-16",
    initiative: "mandant",
    preavisContrat: "1",
    finMois: "fin_mois",
    nonConcurrenceMois: "36",
    commissions24: "86400",
    origine: "agent",
    montantDevis: "48000",
    taux: "5",
    dateSignature: "2026-12-10",
    dateExecution: "2027-02-15"
  };
  var PREAVIS_MIN_MOIS = [1, 2, 3];
  var NON_CONCURRENCE_MAX_MOIS = 24;
  var DELAI_RECLAMATION_MOIS = 12;
  var REPERE_ANNEES_MIN = 2;
  var REPERE_ANNEES_MAX = 3;
  var MOIS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  function dec(v) {
    if (v === null || v === undefined) return NaN;
    var s = String(v).replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    if (s === "" || !/^-?\d*\.?\d+$/.test(s)) return NaN;
    return parseFloat(s);
  }
  function ent(v) {
    var n = dec(v);
    return isFinite(n) ? Math.floor(n) : NaN;
  }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, d = +m[3];
    var dt = new Date(Date.UTC(y, mo, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo || dt.getUTCDate() !== d) return null;
    return dt;
  }
  function isoDate(d) {
    if (!d) return "";
    var mm = d.getUTCMonth() + 1, dd = d.getUTCDate();
    return d.getUTCFullYear() + "-" + (mm < 10 ? "0" : "") + mm + "-" + (dd < 10 ? "0" : "") + dd;
  }
  function lastDay(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
  function addMonths(d, n) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
    var ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
    return new Date(Date.UTC(ty, tm, Math.min(day, lastDay(ty, tm))));
  }
  function finDeMois(d) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)); }
  function moisEcoules(a, b) {
    var n = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
    if (b.getUTCDate() < a.getUTCDate()) n -= 1;
    return n;
  }
  function limitePaiement(d) {
    var q = Math.floor(d.getUTCMonth() / 3) * 3 + 2;
    return new Date(Date.UTC(d.getUTCFullYear(), q + 2, 0));
  }
  function trimestre(d) { return Math.floor(d.getUTCMonth() / 3) + 1; }
  function fmtDate(d) {
    if (!d) return "date non renseignée";
    var j = d.getUTCDate();
    return (j === 1 ? "1er" : String(j)) + " " + MOIS_FR[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function fmtNum(n) {
    var r = Math.round(n * 100) / 100;
    var neg = r < 0; r = Math.abs(r);
    var ip = Math.floor(r), fp = Math.round((r - ip) * 100);
    var s = String(ip).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if (fp > 0) s += "," + (fp < 10 ? "0" : "") + fp;
    return (neg ? "-" : "") + s;
  }
  function fmtEur(n) { return fmtNum(n) + " €"; }
  function pluriel(n, s, p) { return n + " " + (n > 1 ? (p || s + "s") : s); }

  function normalize(raw) {
    var x = {};
    raw = raw || {};
    Object.keys(DEFAULTS).forEach(function (k) {
      var v = raw[k] === undefined || raw[k] === null ? DEFAULTS[k] : String(raw[k]);
      if (LABEL_SETS[k] && !Object.prototype.hasOwnProperty.call(LABEL_SETS[k], v)) v = DEFAULTS[k];
      x[k] = v;
    });
    x.debut = parseDate(x.dateDebut);
    x.notif = parseDate(x.dateNotif);
    x.signature = parseDate(x.dateSignature);
    x.execution = parseDate(x.dateExecution);
    var p = ent(x.preavisContrat); x.preavis = isFinite(p) && p >= 0 ? Math.min(p, 120) : 0;
    var nc = ent(x.nonConcurrenceMois); x.nc = isFinite(nc) && nc >= 0 ? Math.min(nc, 240) : 0;
    var c = dec(x.commissions24); x.c24 = isFinite(c) && c >= 0 ? c : 0;
    var mt = dec(x.montantDevis); x.montant = isFinite(mt) && mt >= 0 ? mt : 0;
    var t = dec(x.taux); x.tx = isFinite(t) && t >= 0 ? Math.min(t, 100) : 0;
    return x;
  }

  function computeAgent(raw) {
    var x = normalize(raw);
    var c = [];
    var actions = [];
    var push = function (id, statut, texte) {
      var p = POINTS.filter(function (q) { return q.id === id; })[0];
      c.push({ id: id, point: p.label, statut: statut, texte: texte });
    };
    var estAgent = x.mission !== "ponctuelle";
    var datesOk = !!(x.debut && x.notif && x.notif >= x.debut);

    // 1. Statut
    if (!estAgent) {
      push("statut", "info", "Mission ponctuelle : le statut d'agent commercial (article L134-1) ne s'applique en principe pas. Votre contrat d'apporteur fixe seul la commission et la fin. Vérifiez que la pratique suit le contrat : un apporteur qui négocie de façon permanente peut être requalifié en agent.");
      actions.push("Relire le contrat d'apporteur : prospects nommés, durée de suivi, assiette et date de paiement de la commission.");
    } else if (x.independance === "encadre") {
      push("statut", "warn", "Horaires, rapports et objectifs imposés de près : l'intermédiaire n'est peut-être pas indépendant. Le risque se déplace vers un contrat de travail, que cet outil ne traite pas. Les calculs ci-dessous supposent le statut d'agent.");
      actions.push("Faire vérifier la qualification (agent commercial ou salarié) avant d'envoyer une lettre de rupture.");
    } else if (x.mission === "permanente_presentation") {
      push("statut", "warn", "Mission permanente de présentation : depuis 2020, il n'est pas nécessaire de pouvoir modifier les prix pour être agent, et informer, conseiller et discuter avec les clients peut suffire (Cass. com., 24 avril 2024, n° 23-12.643). L'outil applique le statut d'agent.");
      actions.push("Ne pas compter sur l'intitulé « apporteur d'affaires » : le juge regarde ce que fait vraiment l'intermédiaire.");
    } else {
      push("statut", "ok", "Mission permanente de prospection et de négociation, travail organisé seul : c'est un agent commercial au sens de l'article L134-1, même sans pouvoir sur les prix ni sur la signature.");
    }

    // 2. Écrit
    if (x.ecrit === "oui") {
      push("ecrit", "ok", "Contrat écrit. Chaque partie peut aussi demander un écrit signé qui reprend le contrat et ses avenants (article L134-2).");
    } else {
      push("ecrit", estAgent ? "warn" : "info", "Pas de contrat écrit. Chaque partie peut exiger un écrit signé qui reprend le contenu du contrat (article L134-2). Une non-concurrence après le contrat doit être écrite (article L134-14).");
      actions.push("Mettre par écrit le contenu du contrat : secteur, commission, préavis.");
    }

    // 3 et 4. Préavis et date de fin
    var anneeContrat = null, preavisMin = null, preavisRetenu = null, finPreavis = null, cessation = null;
    var preavisApplicable = estAgent && x.typeContrat !== "cdd_terme" && x.initiative !== "faute_grave" && x.initiative !== "force_majeure";
    if (!datesOk) {
      push("preavis", "warn", "Dates du contrat ou de la notification manquantes ou incohérentes : impossible de calculer le préavis.");
      push("finPreavis", "warn", "Renseignez la date de début du contrat et la date de la lettre.");
    } else if (!estAgent) {
      cessation = addMonths(x.notif, x.preavis);
      push("preavis", "info", "Pas de préavis légal pour un apporteur : celui du contrat s'applique (" + pluriel(x.preavis, "mois", "mois") + ").");
      push("finPreavis", "info", "Fin de la mission selon le contrat : " + fmtDate(cessation) + ".");
    } else {
      anneeContrat = Math.floor(moisEcoules(x.debut, x.notif) / 12) + 1;
      preavisMin = PREAVIS_MIN_MOIS[Math.min(anneeContrat, 3) - 1];
      if (x.typeContrat === "cdd_terme") {
        cessation = x.notif;
        push("preavis", "info", "Contrat à durée déterminée qui prend fin à son terme : pas de préavis de l'article L134-11. Attention, s'il continue à être exécuté après le terme, il devient à durée indéterminée.");
        push("finPreavis", "info", "Fin du contrat à son terme, saisi comme date de la lettre : " + fmtDate(cessation) + ".");
      } else if (!preavisApplicable) {
        cessation = x.notif;
        push("preavis", x.initiative === "faute_grave" ? "warn" : "info", x.initiative === "faute_grave"
          ? "Faute grave : le préavis de l'article L134-11 n'est pas dû, à condition que la faute soit réelle, grave et à l'origine de la rupture. En cas de doute, le préavis légal serait de " + pluriel(preavisMin, "mois", "mois") + "."
          : "Force majeure : le préavis de l'article L134-11 n'est pas dû.");
        push("finPreavis", "info", "Fin du contrat à la date de la lettre : " + fmtDate(cessation) + ".");
        if (x.initiative === "faute_grave") actions.push("Décrire précisément la faute grave dans la lettre de résiliation : une faute qui n'y figure pas ne prive pas l'agent de son indemnité.");
      } else {
        preavisRetenu = Math.max(preavisMin, x.preavis);
        var txtAnc = (x.typeContrat === "cdd_poursuivi" ? "Contrat à durée déterminée poursuivi, donc à durée indéterminée ; l'ancienneté compte depuis le début. " : "") +
          "À la date de la lettre, le contrat est dans sa " + (anneeContrat === 1 ? "première" : anneeContrat === 2 ? "deuxième" : anneeContrat + "e") + " année : préavis minimum " + pluriel(preavisMin, "mois", "mois") + " (article L134-11).";
        if (x.preavis < preavisMin) {
          push("preavis", "bad", txtAnc + " La clause de " + pluriel(x.preavis, "mois", "mois") + " est plus courte : elle est réputée non écrite (article L134-16). Le préavis légal s'applique.");
          actions.push("Appliquer un préavis de " + pluriel(preavisMin, "mois", "mois") + ", pas celui du contrat, et corriger la clause pour l'avenir.");
        } else {
          push("preavis", "ok", txtAnc + " Le préavis du contrat (" + pluriel(x.preavis, "mois", "mois") + ") respecte ce minimum. Le préavis du mandant ne doit pas être plus court que celui de l'agent.");
        }
        var brut = addMonths(x.notif, preavisRetenu);
        finPreavis = x.finMois === "fin_mois" ? finDeMois(brut) : brut;
        cessation = finPreavis;
        push("finPreavis", "info", x.finMois === "fin_mois"
          ? "Préavis de " + pluriel(preavisRetenu, "mois", "mois") + " à partir du " + fmtDate(x.notif) + ", soit le " + fmtDate(brut) + ", repoussé à la fin du mois civil (article L134-11) : le contrat prend fin le " + fmtDate(finPreavis) + "."
          : "Préavis de " + pluriel(preavisRetenu, "mois", "mois") + " de date à date, comme le prévoit le contrat : fin le " + fmtDate(finPreavis) + ".");
        actions.push("Indiquer dans la lettre la date de fin du contrat : " + fmtDate(finPreavis) + ".");
      }
    }

    // 5 et 6. Indemnité et délai
    var indemniteDue = null, repereMin = null, repereMax = null, limiteReclamation = null;
    if (!estAgent) {
      push("indemnite", "info", "Pas d'indemnité de fin de contrat légale pour un apporteur d'affaires. Seul le contrat compte.");
      push("delaiAn", "info", "Sans objet pour un apporteur d'affaires.");
    } else {
      indemniteDue = !(x.initiative === "faute_grave" || x.initiative === "agent" || x.initiative === "cession");
      var moyenne = x.c24 / 2;
      if (x.c24 > 0) { repereMin = moyenne * REPERE_ANNEES_MIN; repereMax = moyenne * REPERE_ANNEES_MAX; }
      var rep = x.c24 > 0 ? " Repère cité par Service Public Entreprendre (deux ou trois années de commissions) : " + fmtEur(repereMin) + " à " + fmtEur(repereMax) + ", sur une moyenne de " + fmtEur(moyenne) + " par an. Ce n'est pas un barème." : " Renseignez les commissions des 24 derniers mois pour obtenir un ordre de grandeur.";
      if (indemniteDue) {
        push("indemnite", "warn", "Indemnité compensatrice due (article L134-12) : aucune des trois exceptions de l'article L134-13 ne s'applique." + rep);
        actions.push("Budgéter l'indemnité de fin de contrat et préparer la discussion avec l'agent.");
      } else if (x.initiative === "faute_grave") {
        push("indemnite", "warn", "Pas d'indemnité si la faute grave a provoqué la rupture (article L134-13, 1°). Une faute absente de la lettre et découverte après ne suffit pas (Cass. com., 16 novembre 2022, n° 21-17.423)." + rep);
      } else if (x.initiative === "agent") {
        push("indemnite", "info", "Départ à l'initiative de l'agent sans circonstance imputable à l'entreprise ni raison d'âge, d'infirmité ou de maladie : pas d'indemnité (article L134-13, 2°).");
      } else {
        push("indemnite", "info", "Cession du contrat à un successeur avec l'accord de l'entreprise : pas d'indemnité (article L134-13, 3°).");
      }
      if (cessation) {
        limiteReclamation = addMonths(cessation, DELAI_RECLAMATION_MOIS);
        push("delaiAn", "info", indemniteDue || x.initiative === "faute_grave"
          ? "L'agent doit notifier qu'il entend faire valoir ses droits au plus tard le " + fmtDate(limiteReclamation) + ", un an après la fin du contrat (article L134-12)."
          : "Délai d'un an après la fin du contrat (article L134-12) : " + fmtDate(limiteReclamation) + ". Sans indemnité due, il ne joue que si l'agent conteste le motif.");
      } else {
        push("delaiAn", "warn", "Date de fin du contrat inconnue : délai impossible à calculer.");
      }
    }

    // 7. Non-concurrence
    var finNC = null;
    if (x.nc === 0) {
      push("nonConcurrence", "ok", "Pas de non-concurrence après le contrat.");
    } else if (!estAgent) {
      push("nonConcurrence", "info", "Non-concurrence de " + pluriel(x.nc, "mois", "mois") + " : l'article L134-14 ne vise que l'agent commercial. Pour un apporteur, la clause doit rester proportionnée à ce qu'elle protège.");
    } else if (x.ecrit === "non") {
      push("nonConcurrence", "bad", "Une non-concurrence après le contrat doit être établie par écrit (article L134-14). Sans écrit, elle ne tient pas.");
      actions.push("Ne pas opposer à l'agent une non-concurrence qui n'est pas écrite.");
    } else if (x.nc > NON_CONCURRENCE_MAX_MOIS) {
      finNC = cessation ? addMonths(cessation, NON_CONCURRENCE_MAX_MOIS) : null;
      push("nonConcurrence", "bad", pluriel(x.nc, "mois", "mois") + " : au-delà de deux ans après la fin du contrat, la clause est réputée non écrite (articles L134-14 et L134-16)." + (finNC ? " Elle ne peut pas aller au-delà du " + fmtDate(finNC) + "," : "") + " et seulement sur le secteur, la clientèle et les produits confiés.");
      actions.push("Ramener la non-concurrence à deux ans au plus, sur le secteur et les produits confiés.");
    } else {
      finNC = cessation ? addMonths(cessation, x.nc) : null;
      push("nonConcurrence", "ok", pluriel(x.nc, "mois", "mois") + ", dans la limite de deux ans" + (finNC ? " : fin le " + fmtDate(finNC) : "") + ". Elle doit viser le secteur, la clientèle et les produits confiés (article L134-14).");
    }

    // 8. Commission sur le devis
    var commission = x.montant * x.tx / 100;
    var commissionDue = "non";
    var pendant = !!(x.signature && cessation && x.signature <= cessation);
    if (!x.signature) {
      push("commission", "warn", "Date de signature du devis manquante.");
    } else if (!estAgent) {
      commissionDue = "contrat";
      push("commission", "info", "Commission de l'apporteur selon son contrat : " + fmtEur(commission) + " (" + fmtNum(x.tx) + " % de " + fmtEur(x.montant) + " HT), si ce prospect fait partie de ceux qu'il a présentés.");
    } else if (!cessation || pendant) {
      if (x.origine === "agent") {
        commissionDue = "oui";
        push("commission", "ok", "Devis signé le " + fmtDate(x.signature) + ", pendant le contrat, grâce à l'agent ou avec un client qu'il a apporté : commission due (article L134-6), soit " + fmtEur(commission) + ".");
      } else if (x.origine === "secteur" && x.secteurConfie === "oui") {
        commissionDue = "oui";
        push("commission", "warn", "Client de son secteur, venu en direct, devis signé pendant le contrat : commission due (article L134-6, deuxième alinéa), soit " + fmtEur(commission) + ", sauf si le contrat l'exclut clairement.");
        actions.push("Vérifier ce que dit le contrat sur les demandes entrantes du secteur de l'agent.");
      } else {
        push("commission", "info", "Client hors de son secteur, sans son intervention : pas de commission au titre de l'article L134-6.");
      }
    } else {
      if (x.origine === "agent") {
        commissionDue = "a_apprecier";
        push("commission", "warn", "Devis signé le " + fmtDate(x.signature) + ", après la fin du contrat : commission due (" + fmtEur(commission) + ") si la commande a été reçue avant la fin, ou si l'affaire est principalement due au travail de l'agent et signée dans un délai raisonnable (article L134-7).");
        actions.push("Faire la liste des devis en cours à la fin du contrat et dire, pour chacun, s'il ouvre droit à commission.");
      } else {
        push("commission", "info", "Devis signé après la fin du contrat sans intervention de l'agent : pas de commission, sauf si la commande avait été reçue avant la fin (article L134-7).");
      }
    }

    // 9. Paiement
    var acquisition = null, limite = null;
    if (commissionDue === "oui" || commissionDue === "a_apprecier") {
      if (x.execution) {
        acquisition = x.execution;
        limite = limitePaiement(acquisition);
        var avant = x.signature && x.execution < x.signature;
        push("paiement", avant ? "warn" : "info", (avant ? "La date d'exécution est antérieure à la signature : vérifiez les dates. " : "") +
          "Commission acquise à l'exécution, le " + fmtDate(acquisition) + " (trimestre " + trimestre(acquisition) + " de " + acquisition.getUTCFullYear() + "), et au plus tard quand le client a payé ou aurait dû payer. Paiement et relevé au plus tard le " + fmtDate(limite) + " (articles L134-9 et R134-3).");
        actions.push("Payer la commission et remettre le relevé au plus tard le " + fmtDate(limite) + ".");
      } else {
        push("paiement", "warn", "Date d'exécution manquante : la commission est acquise quand l'opération est exécutée.");
      }
    } else if (commissionDue === "contrat") {
      push("paiement", "info", "Paiement selon le contrat d'apporteur (par exemple dans le mois qui suit l'encaissement).");
    } else {
      push("paiement", "info", "Pas de commission à payer sur ce devis.");
    }

    // 10. Rupture brutale
    push("rupture", "info", estAgent
      ? "L'article L442-1 II ne s'applique pas entre un agent commercial et son mandant : le préavis est celui de l'article L134-11 (Cass. com., 3 avril 2012, n° 11-13.527)."
      : "Pour un apporteur qui n'est pas agent, une relation commerciale établie peut relever de l'article L442-1 II (rupture brutale) : un préavis écrit raisonnable reste prudent.");

    var nbBad = c.filter(function (p) { return p.statut === "bad"; }).length;
    var nbWarn = c.filter(function (p) { return p.statut === "warn"; }).length;
    var nbOk = c.filter(function (p) { return p.statut === "ok"; }).length;
    var nbInfo = c.filter(function (p) { return p.statut === "info"; }).length;
    var etat = nbBad > 0 ? "bad" : nbWarn > 0 ? "warn" : "ok";
    var verdict;
    if (!estAgent) verdict = "Apporteur d'affaires : le contrat fixe la commission et la fin. " + (nbBad ? pluriel(nbBad, "point bloquant", "points bloquants") + " à corriger." : "Vérifiez que la pratique reste celle d'un apporteur.");
    else if (nbBad > 0) verdict = pluriel(nbBad, "point bloquant", "points bloquants") + " et " + pluriel(nbWarn, "point") + " à revoir : votre contrat ou votre lettre ne tient pas sur ces points.";
    else if (nbWarn > 0) verdict = "Aucun point bloquant, " + pluriel(nbWarn, "point") + " à revoir avant d'envoyer la lettre.";
    else verdict = "Aucun point bloquant ni à revoir sur ces réponses.";
    actions.push("Garder la trace de l'origine de chaque demande de devis (lien dédié par agent, notes internes) pour établir les relevés.");

    var preavisLabel = !estAgent ? "Selon le contrat" : preavisRetenu !== null ? pluriel(preavisRetenu, "mois", "mois") + (preavisMin !== null && x.preavis < preavisMin ? " (minimum légal)" : "") : preavisApplicable ? "À calculer" : "Non dû";
    var finLabel = cessation ? fmtDate(cessation) : "À calculer";
    var indemniteLabel = !estAgent ? "Non (apporteur)" : indemniteDue ? (repereMin !== null ? fmtEur(repereMin) + " à " + fmtEur(repereMax) : "Due, montant à estimer") : x.initiative === "faute_grave" ? "Non, si la faute grave est établie" : "Non due";
    var commissionLabel = commissionDue === "non" ? "Pas de commission" : fmtEur(commission) + (commissionDue === "a_apprecier" ? " (à apprécier)" : "");
    var limiteLabel = limite ? fmtDate(limite) : "Sans objet";

    var clause = [
      "Secteur confié : [départements, types de clients, comptes nommés, comptes exclus].",
      "Commission : " + fmtNum(x.tx) + " % du montant hors taxes facturé, hors transport [à adapter], sur les affaires conclues grâce à l'agent, avec les clients qu'il a apportés et avec les clients de son secteur [ou : à l'exclusion des demandes reçues en direct, au taux de ... %].",
      "Acquisition et paiement : la commission est acquise à la livraison ou à l'exécution, et au plus tard au paiement du client ou à la date où il aurait dû payer. Elle est payée, avec un relevé détaillé, au plus tard le dernier jour du mois qui suit le trimestre où elle est acquise.",
      "Devis en cours à la fin du contrat : commission due sur les commandes reçues avant la fin, et sur les devis remis par l'agent et signés dans les [six] mois qui suivent la fin, s'ils sont principalement dus à son activité.",
      "Préavis : un mois la première année, deux mois la deuxième année commencée, trois mois ensuite, la fin du préavis coïncidant avec la fin d'un mois civil. Le préavis du mandant n'est jamais plus court que celui de l'agent.",
      "Non-concurrence : pendant " + (estAgent ? Math.min(x.nc || NON_CONCURRENCE_MAX_MOIS, NON_CONCURRENCE_MAX_MOIS) : x.nc) + " mois après la fin du contrat, limitée au secteur et à la clientèle confiés et aux produits représentés.",
      "Pouvoir : l'agent n'a pas le pouvoir de signer ni de modifier un devis au nom de la société [ou : dans la limite de ...]."
    ].join("\n");

    var message = estAgent ? [
      "Objet : fin de notre contrat d'agence",
      "",
      "Bonjour,",
      "",
      cessation && preavisApplicable
        ? "Par la présente, nous mettons fin au contrat d'agence commerciale qui nous lie depuis le " + fmtDate(x.debut) + ". Compte tenu du préavis de " + pluriel(preavisRetenu, "mois", "mois") + ", le contrat prendra fin le " + fmtDate(cessation) + "."
        : "Nous revenons vers vous au sujet de la fin du contrat d'agence commerciale qui nous lie depuis " + (x.debut ? "le " + fmtDate(x.debut) : "[date]") + ", qui prend fin le " + (cessation ? fmtDate(cessation) : "[date]") + ".",
      "",
      "Jusqu'à cette date, vos commissions restent dues dans les conditions habituelles. Vous trouverez en pièce jointe la liste des devis en cours sur votre secteur, avec pour chacun la règle de commission qui s'appliquera s'il est signé après la fin du contrat.",
      "",
      commissionDue === "oui" || commissionDue === "a_apprecier"
        ? "Pour le devis de " + fmtEur(x.montant) + " HT (signature le " + fmtDate(x.signature) + ")" + ", la commission de " + fmtEur(commission) + " sera payée avec le relevé au plus tard le " + (limite ? fmtDate(limite) : "[date]") + "."
        : "",
      "",
      "Nous vous proposons un rendez-vous pour faire le point sur le relevé de fin de contrat et sur les suites.",
      "",
      "Bien cordialement,"
    ].filter(function (l, i, a) { return !(l === "" && a[i - 1] === ""); }).join("\n") : [
      "Objet : fin de notre collaboration d'apport d'affaires",
      "",
      "Bonjour,",
      "",
      "Comme prévu à notre contrat, nous mettons fin à votre mission d'apport d'affaires. Les prospects que vous nous avez présentés par écrit avant cette date restent couverts pendant la durée de suivi prévue au contrat.",
      "",
      "Bien cordialement,"
    ].join("\n");

    var recap = [
      "Calculateur de préavis, de commission et d'indemnité d'agent commercial (QuoteBuilder)",
      "Statut : " + LABEL_SETS.mission[x.mission],
      "Contrat depuis le " + fmtDate(x.debut) + ", lettre du " + fmtDate(x.notif) + (anneeContrat ? " (année " + anneeContrat + " du contrat)" : ""),
      "Préavis : " + preavisLabel,
      "Fin du contrat : " + finLabel,
      "Indemnité (repère, pas un barème) : " + indemniteLabel,
      "Réclamation de l'indemnité au plus tard : " + (limiteReclamation ? fmtDate(limiteReclamation) : "Sans objet"),
      "Non-concurrence : " + (x.nc === 0 ? "aucune" : pluriel(x.nc, "mois", "mois") + (estAgent && x.nc > NON_CONCURRENCE_MAX_MOIS ? " prévus, 24 mois au plus" : "") + (finNC ? ", jusqu'au " + fmtDate(finNC) + " au plus tard" : "")),
      "Commission sur le devis de " + fmtEur(x.montant) + " HT : " + commissionLabel,
      "Paiement et relevé au plus tard : " + limiteLabel,
      "Points bloquants / à revoir : " + nbBad + " / " + nbWarn,
      "Résultat indicatif, pas un conseil juridique."
    ].join("\n");

    return {
      input: x, estAgent: estAgent, anneeContrat: anneeContrat, preavisMin: preavisMin, preavisRetenu: preavisRetenu,
      finPreavis: finPreavis, cessation: cessation, indemniteDue: indemniteDue, repereMin: repereMin, repereMax: repereMax,
      limiteReclamation: limiteReclamation, finNC: finNC, commission: commission, commissionDue: commissionDue,
      acquisition: acquisition, limite: limite,
      preavisLabel: preavisLabel, finLabel: finLabel, indemniteLabel: indemniteLabel, commissionLabel: commissionLabel, limiteLabel: limiteLabel,
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
  PREAVIS_MIN_MOIS,
  NON_CONCURRENCE_MAX_MOIS,
  DELAI_RECLAMATION_MOIS,
  REPERE_ANNEES_MIN,
  REPERE_ANNEES_MAX,
  computeAgent,
  normalize,
  parseDate,
  isoDate,
  addMonths,
  finDeMois,
  moisEcoules,
  limitePaiement,
  trimestre,
  fmtDate,
  fmtNum,
  fmtEur,
  dec,
  ent,
  pluriel,
};
