/* eslint-disable */
// @ts-nocheck

  var SLUG = "verificateur-cession-contrat-changement-client";
  var STATUT_LABELS = { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" };
  var POINTS = [
    { id: "operation", label: "Nature de l'opération" },
    { id: "accord", label: "Votre accord" },
    { id: "forme", label: "Forme de l'accord" },
    { id: "acte", label: "Écrit de cession" },
    { id: "notification", label: "Notification ou prise d'acte" },
    { id: "liberation", label: "Libération du cédant" },
    { id: "suretes", label: "Sûretés et acompte" },
    { id: "nouveau", label: "Vérification du nouveau client" },
    { id: "avenant", label: "Avenant à trois parties" },
    { id: "clause", label: "Clause de votre devis" }
  ];
  var LABEL_SETS = {
    operation: {
      cession: "Cession de contrat : le client passe la commande à une autre société",
      fusion: "Fusion ou dissolution avec transmission universelle du patrimoine",
      fonds: "Vente du fonds de commerce ou d'une activité",
      parts: "Cession de parts ou d'actions : la société reste la même",
      judiciaire: "Plan de cession arrêté par un tribunal",
      nom: "Changement de nom ou de forme juridique"
    },
    sens: {
      client: "C'est votre client qui change",
      vous: "C'est vous qui cédez votre activité"
    },
    accord: {
      aucun: "Vous n'avez encore rien répondu",
      expres: "Vous avez accepté par écrit, sans ambiguïté",
      ambigu: "Vous avez répondu de façon ambiguë (courriel, livraison, acompte, facture)",
      refuse: "Vous avez refusé par écrit",
      avance: "Vos conditions prévoient un accord par avance"
    },
    acte: {
      oui: "Vous avez la copie de l'acte entre cédant et cessionnaire",
      non: "Vous ne l'avez pas vu",
      refus: "Le client refuse de vous le montrer"
    },
    notification: {
      ecrite: "Le contrat de cession vous a été notifié par écrit",
      aucune: "Aucune notification, rien que l'annonce du client",
      paiement: "Le nouveau client a déjà payé, commandé ou confirmé quelque chose"
    },
    liberation: {
      aucune: "Vous n'avez pas libéré le cédant",
      expresse: "Vous l'avez libéré expressément par écrit",
      flou: "Vous avez dit « on s'arrange » ou équivalent, sans écrit précis"
    },
    suretes: {
      aucune: "Aucune garantie ni caution sur cette commande",
      maintenues: "Les garanties existantes sont confirmées par écrit",
      aconfirmer: "Une garantie existe et n'est pas confirmée pour le nouveau client"
    },
    imputation: {
      passe: "L'acompte s'impute d'abord sur le travail déjà exécuté",
      suit: "L'acompte suit le contrat : le nouveau client est crédité"
    },
    nouveau: {
      verifie: "Identité, pouvoir du signataire et comptes vérifiés",
      partiel: "Identité vérifiée, le reste non",
      aucun: "Rien n'est vérifié"
    },
    avenant: {
      signe: "Avenant à trois parties signé",
      projet: "Projet en cours de discussion",
      aucun: "Aucun avenant"
    },
    clause: {
      aucune: "Rien d'écrit sur la cession",
      large: "Accord par avance pour toute cession, sans condition",
      groupe: "Accord par avance limité aux sociétés du groupe, avec information et garantie",
      interdit: "Cession interdite sans votre accord écrit"
    }
  };
  var DEFAULTS = {
    operation: "cession", sens: "client", accord: "aucun", acte: "non", notification: "aucune",
    liberation: "aucune", suretes: "aucune", imputation: "passe", nouveau: "partiel", avenant: "aucun", clause: "aucune",
    prix: "48000", acompte: "14400", avancement: "35", delai: "15"
  };

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
  function fmtEur(n) { return fmtNum(n) + " € HT"; }
  function fmtPct(n) { return fmtNum(n) + " %"; }
  function pluriel(n, s, p) { return n + " " + (n > 1 ? (p || s + "s") : s); }
  function clampNum(v, min, max, dflt) {
    var n = dec(v);
    if (!isFinite(n) || n < min) return dflt;
    return Math.min(n, max);
  }

  function normalize(raw) {
    var x = {};
    raw = raw || {};
    Object.keys(DEFAULTS).forEach(function (k) {
      var v = raw[k] === undefined || raw[k] === null ? DEFAULTS[k] : String(raw[k]);
      if (LABEL_SETS[k] && !Object.prototype.hasOwnProperty.call(LABEL_SETS[k], v)) v = DEFAULTS[k];
      x[k] = v;
    });
    x.P = clampNum(x.prix, 0, 1000000000, 0);
    x.paid = Math.min(clampNum(x.acompte, 0, 1000000000, 0), x.P);
    x.av = Math.min(clampNum(x.avancement, 0, 100, 0), 100);
    var d = ent(x.delai); x.d = isFinite(d) && d >= 1 ? Math.min(d, 365) : 15;
    return x;
  }

  function computeCession(raw) {
    var x = normalize(raw);
    var incomplet = !(x.P > 0);
    var cession = x.operation === "cession" || x.operation === "fonds";
    var execute = round2(x.P * x.av / 100);
    var reste = round2(x.P - execute);
    var solde = round2(x.P - x.paid);
    var dueCedant = 0, dueCessionnaire = 0, surplus = 0;
    if (!cession) {
      dueCedant = 0; dueCessionnaire = solde;
    } else if (x.imputation === "passe") {
      dueCedant = round2(Math.max(0, execute - x.paid));
      surplus = round2(Math.max(0, x.paid - execute));
      dueCessionnaire = round2(Math.max(0, reste - surplus));
    } else {
      dueCedant = 0; dueCessionnaire = solde;
    }
    var libere = x.liberation === "expresse";
    var exposition = cession && libere ? dueCessionnaire : 0;
    var sansAccord = cession && (x.accord === "aucun" || x.accord === "refuse");
    var c = [];
    var add = function (id, statut, texte) {
      var p = POINTS.filter(function (q) { return q.id === id; })[0];
      c.push({ id: id, point: p.label, statut: statut, texte: texte });
    };

    // 1 Nature de l'opération
    var opTexte = {
      cession: "Cession de contrat au sens des articles 1216 à 1216-3 du code civil : votre accord est nécessaire pour que la cession vous soit opposable.",
      fusion: "Fusion ou dissolution avec transmission universelle (code de commerce L236-3, code civil 1844-5) : le contrat suit sans accord à demander. Exigez la preuve de l'opération et facturez la société qui reprend.",
      fonds: "Le fonds se vend, mais les contrats avec les clients ne suivent pas automatiquement, sauf contrats que la loi transfère. Traitez la reprise de votre devis comme une cession de contrat, avec votre accord.",
      parts: "La société reste la même personne morale et le même cocontractant : il n'y a pas de cession de contrat. Seule une clause de changement de contrôle de vos conditions peut jouer.",
      judiciaire: "Le jugement qui arrête le plan emporte cession des contrats nécessaires au maintien de l'activité (code de commerce L642-7). Lisez le jugement : si votre contrat n'y figure pas, il n'est pas transféré par ce moyen.",
      nom: "La personne morale ne change pas : mettez à jour vos documents, il n'y a rien à céder."
    }[x.operation];
    add("operation", x.operation === "fonds" || x.operation === "judiciaire" ? "warn" : "info", opTexte);

    // 2 Votre accord
    if (!cession) {
      add("accord", "info", x.operation === "fusion" || x.operation === "judiciaire" ? "Votre accord n'est pas la condition du transfert dans ce cas, mais vous pouvez vérifier les pièces avant de livrer ou de facturer." : "Pas de changement de partie : aucun accord de cession à donner.");
    } else if (x.accord === "aucun") {
      add("accord", "ok", "Vous n'avez rien accepté : à ce stade la cession ne vous est pas opposable, et vous restez lié à votre client d'origine. Répondez par écrit sans attendre pour que le silence ne soit pas lu comme un accord.");
    } else if (x.accord === "refuse") {
      add("accord", "ok", "Votre refus est écrit : la cession entre cédant et cessionnaire reste valable entre eux, mais elle ne vous est pas opposable (Cass. com., 24 avril 2024, n° 22-15.958).");
    } else if (x.accord === "expres") {
      add("accord", x.avenant === "signe" ? "ok" : "warn", "Votre accord est donné : la cession vous est opposable. Vérifiez que vos conditions (libération, acompte, garanties) figurent dans un avenant signé.");
    } else if (x.accord === "ambigu") {
      add("accord", "bad", "L'accord du cédé peut être donné sans forme, pourvu qu'il soit non équivoque, et se prouve par tout moyen (Cass. com., 24 avril 2024, n° 22-15.958). Un geste ambigu peut être présenté comme un accord : clarifiez par écrit tout de suite ce que vous acceptez et à quelles conditions.");
    } else {
      add("accord", "warn", "L'accord donné par avance dans vos conditions suffit pour le principe, mais la cession ne produit effet à votre égard que si le contrat de cession vous est notifié ou si vous en prenez acte (article 1216, alinéa 2).");
    }

    // 3 Forme de l'accord
    if (cession && x.accord === "expres") add("forme", "ok", "Accord écrit : la preuve est simple. Conservez le courriel ou l'avenant dans le dossier.");
    else if (cession && x.accord === "ambigu") add("forme", "warn", "Aucune forme n'est exigée pour l'accord du cédé : la preuve est libre, donc une livraison, un acompte ou une facture au nom du nouveau client peuvent compter.");
    else add("forme", "info", "Pas d'accord donné ou pas de cession : rien à prouver pour l'instant. Gardez une trace datée de votre réponse.");

    // 4 Écrit de cession
    if (!cession) add("acte", "info", "Pas de cession de contrat entre deux parties : l'écrit de l'article 1216, alinéa 3, ne s'applique pas.");
    else if (x.acte === "oui") add("acte", "ok", "L'écrit de cession est exigé à peine de nullité entre cédant et cessionnaire (article 1216, alinéa 3) : vous l'avez, lisez la date d'effet, la liste des contrats et les clauses qui vous concernent.");
    else if (x.acte === "non") add("acte", "warn", "Demandez l'acte, ou au moins les clauses qui concernent votre contrat : date d'effet, étendue de ce qui est transmis, garanties données entre le cédant et le cessionnaire.");
    else add("acte", "bad", "Un cessionnaire sérieux montre l'acte qui le rend titulaire du contrat. Un refus est un signal : n'acceptez rien avant de l'avoir vu.");

    // 5 Notification ou prise d'acte
    if (!cession) add("notification", "info", "Pas de cession de contrat : la notification de l'article 1216 n'est pas en jeu.");
    else if (x.notification === "paiement" && sansAccord) add("notification", "bad", "Un paiement ou une commande du nouveau client peut être lu comme une prise d'acte (Cass. com., 9 juin 2022, n° 20-18.490). Écrivez tout de suite vos réserves : vous n'avez pas accepté la cession.");
    else if (x.notification === "paiement") add("notification", "warn", "Le paiement du cessionnaire vaut en principe prise d'acte quand l'accord a été donné par avance (Cass. com., 9 juin 2022, n° 20-18.490). Vérifiez que cela correspond à ce que vous voulez.");
    else if (x.notification === "ecrite") add("notification", "ok", "La notification écrite fixe la date à partir de laquelle la cession produit effet, si vous aviez donné un accord par avance.");
    else add("notification", "info", "Une annonce du client n'est pas la notification du contrat de cession : demandez le contrat ou ses clauses, et gardez la date de réception.");

    // 6 Libération du cédant
    if (!cession) add("liberation", "info", "Pas de changement de partie : pas de cédant à libérer.");
    else if (x.liberation === "aucune") add("liberation", "ok", "Le cédant n'est pas libéré : sauf clause contraire, il reste tenu solidairement avec le cessionnaire (article 1216-1). C'est votre protection de base.");
    else if (x.liberation === "flou") add("liberation", "bad", "La libération suppose un consentement exprès du cédé (article 1216-1). Un « on s'arrange » peut être lu comme un accord : écrivez que le cédant reste tenu tant que vous ne l'avez pas libéré par écrit.");
    else if (x.nouveau === "verifie" && x.suretes !== "aconfirmer") add("liberation", "warn", "Libération expresse, pour l'avenir seulement : ce qui était déjà exécuté avant la date d'effet reste, en lecture prudente, à la charge du cédant. Écrivez-le dans l'avenant.");
    else add("liberation", "bad", "Vous avez libéré le cédant sans avoir tout vérifié sur le cessionnaire ou sans garantie confirmée : vous n'avez plus qu'un débiteur, dont la solidité n'est pas établie.");

    // 7 Sûretés et acompte
    var acompteTxt = "Acompte reçu : " + fmtEur(x.paid) + ". " + (x.imputation === "passe" ? "Imputé d'abord sur le travail exécuté (" + fmtEur(execute) + ")." : "Suit le contrat : le nouveau client est crédité.");
    if (cession && x.suretes === "aconfirmer") add("suretes", libere ? "bad" : "warn", "Si le cédant est libéré, les sûretés qu'il ou des tiers ont consenties ne subsistent qu'avec leur accord (article 1216-3). Faites confirmer chaque garant par écrit. " + acompteTxt);
    else if (cession && x.suretes === "maintenues") add("suretes", "ok", "Les garanties sont confirmées par écrit. " + acompteTxt);
    else add("suretes", "info", acompteTxt);

    // 8 Vérification du nouveau client
    if (x.operation === "nom") add("nouveau", "info", "Même personne morale : vérifiez seulement l'extrait d'immatriculation à jour.");
    else if (x.nouveau === "verifie") add("nouveau", "ok", "Identité, pouvoir et comptes vérifiés : vous pouvez décider en connaissance de cause.");
    else if (x.nouveau === "partiel") add("nouveau", "warn", "Complétez : pouvoir du signataire, comptes déposés, absence de procédure collective, adresse de facturation.");
    else add("nouveau", "bad", "Rien n'est vérifié sur le nouveau client : extrait d'immatriculation récent, pouvoir du signataire et solvabilité avant tout accord.");

    // 9 Avenant
    if (!cession) add("avenant", "info", x.operation === "parts" || x.operation === "nom" ? "Pas d'avenant nécessaire : mettez à jour vos informations et gardez une note dans le dossier." : "Pas d'avenant de cession, mais demandez la preuve de l'opération et une confirmation écrite que le contrat est repris.");
    else if (x.avenant === "signe") add("avenant", "ok", "Avenant signé : conservez-le avec le devis. L'équipe ne peut pas le joindre à un dossier QuoteBuilder : il reste dans vos outils.");
    else if (x.avenant === "projet") add("avenant", "warn", "Faites figurer : les parties, la date d'effet, l'avancement chiffré, l'acompte et son imputation, la libération ou non du cédant, les sûretés, vos conditions, la facturation.");
    else if (x.accord === "expres" || x.accord === "ambigu" || x.notification === "paiement") add("avenant", "bad", "Vous avez accepté ou agi sans avenant : faites-en signer un, à trois parties, avant la prochaine livraison ou facture.");
    else add("avenant", "info", "Pas d'avenant tant que vous n'avez rien accepté. Si vous acceptez, proposez un avenant à trois parties.");

    // 10 Clause du devis
    if (x.clause === "aucune") add("clause", "warn", "Rien n'est écrit : l'article 1216 s'applique seul. Ajoutez une clause qui encadre la cession (information préalable, pièces, solidarité du cédant, acompte).");
    else if (x.clause === "large") add("clause", "warn", "Un accord par avance pour toute cession vous prive du choix de votre débiteur : une notification ou un paiement du cessionnaire suffit. Limitez-le aux sociétés du groupe, avec information et garantie.");
    else if (x.clause === "groupe") add("clause", "ok", "Accord par avance limité, information préalable et solidarité du cédant : c'est la rédaction la plus équilibrée.");
    else add("clause", "ok", "Cession interdite sans accord écrit : vous gardez la main. Prévoyez la procédure à suivre quand vous acceptez.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    c.forEach(function (p) { if (p.statut === "ok") nbOk++; else if (p.statut === "warn") nbWarn++; else if (p.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : nbWarn > 0 ? "warn" : "ok";
    var verdict = incomplet ? "Indiquez le prix de la commande pour obtenir la répartition."
      : nbBad > 0 ? pluriel(nbBad, "point bloquant", "points bloquants") + " : corrigez avant tout nouvel accord, livraison ou facture."
      : nbWarn > 0 ? "Possible, avec " + pluriel(nbWarn, "point") + " à revoir avant de signer."
      : "Le dossier est cohérent : gardez les pièces et poursuivez.";

    var repLabel = !cession ? "Pas de répartition : un seul débiteur" : fmtEur(dueCedant) + " au cédant, " + fmtEur(dueCessionnaire) + " au cessionnaire";
    var actions = [];
    if (cession) {
      if (x.accord === "aucun" || x.accord === "ambigu") actions.push("Répondez par écrit : vous n'avez pas donné d'accord à ce jour, ou vous précisez les conditions de celui que vous donnez.");
      if (x.acte !== "oui") actions.push("Demandez l'acte de cession ou ses clauses sur ce contrat, un extrait d'immatriculation de moins de trois mois et le nom du signataire.");
      if (x.nouveau !== "verifie") actions.push("Vérifiez le nouveau client : identité, pouvoir du signataire, comptes déposés, procédure collective, adresse de facturation.");
      if (x.liberation !== "expresse") actions.push("Écrivez que le cédant reste tenu solidairement tant que vous ne l'avez pas libéré par écrit.");
      if (x.suretes === "aconfirmer") actions.push("Faites confirmer par écrit chaque garantie ou caution pour le nouveau client avant toute libération.");
      if (x.avenant !== "signe") actions.push("Faites signer un avenant à trois parties : date d'effet, avancement chiffré, acompte, libération ou non, sûretés, conditions, facturation.");
      if (x.notification === "paiement") actions.push("Notez dans le dossier la date et la nature du paiement ou de la confirmation du nouveau client, et écrivez vos réserves si vous n'avez pas accepté.");
      actions.push("Conservez l'acte, l'avenant et vos courriels dans vos outils : l'équipe ne peut pas joindre de fichier à un dossier QuoteBuilder.");
      if (x.clause !== "groupe" && x.clause !== "interdit") actions.push("Réécrivez la clause de cession de vos prochains devis, en limitant l'accord par avance aux sociétés du groupe et en gardant la solidarité du cédant.");
    } else if (x.operation === "fusion") {
      actions.push("Demandez l'extrait d'immatriculation à jour de la société qui reprend, la preuve de l'opération et une confirmation écrite qu'elle reprend le contrat. Facturez-la.");
      actions.push("Vérifiez le délai d'opposition des créanciers si la dissolution est faite en application de l'article 1844-5 du code civil.");
    } else if (x.operation === "judiciaire") {
      actions.push("Lisez le jugement qui arrête le plan : le contrat doit y figurer, et il s'exécute aux conditions en vigueur au jour de l'ouverture de la procédure.");
      actions.push("Si votre devis n'est pas cité, relisez les règles de déclaration de créance de votre client d'origine.");
    } else if (x.operation === "parts") {
      actions.push("Mettez à jour vos contacts et votre adresse de facturation, vérifiez la solvabilité du nouveau propriétaire et relisez vos conditions sur le changement de contrôle.");
    } else {
      actions.push("Mettez à jour la raison sociale ou la forme dans vos documents, avec un extrait d'immatriculation à jour.");
    }
    actions.push("Notez l'annonce, la date et votre réponse dans une note interne du dossier : elle ne se modifie pas.");

    var clause;
    var delai = pluriel(x.d, "jour");
    if (x.clause === "interdit") {
      clause = "Cession du contrat. Le client ne peut céder le contrat à un tiers, en tout ou partie, qu'avec l'accord écrit préalable du prestataire. Le prestataire peut le refuser. Tant qu'il ne l'a pas libéré par écrit, le client reste tenu solidairement avec le cessionnaire de toutes les obligations du contrat.";
    } else {
      clause = "Cession du contrat. Le client ne peut céder le contrat à un tiers, en tout ou partie, qu'avec l'accord écrit préalable du prestataire. Pour une cession à une société du même groupe, l'accord du prestataire est donné par avance, sous réserve que le client lui notifie par écrit, au moins " + delai + " avant la date d'effet, l'identité du cessionnaire, un extrait d'immatriculation de moins de trois mois, l'acte de cession ou la partie de cet acte qui concerne le contrat, et le nom de son représentant. Le client reste tenu solidairement avec le cessionnaire de toutes les obligations du contrat, nées avant ou après la cession, jusqu'à ce que le prestataire l'en libère expressément par écrit. Les sûretés consenties pour l'exécution du contrat sont maintenues. Les sommes déjà versées restent imputées sur la partie du prix correspondant aux prestations exécutées avant la date d'effet.";
    }

    var message;
    if (cession && (x.accord === "expres")) {
      message = "Objet : cession du contrat, confirmation de notre accord\n\nBonjour,\n\nNous acceptons la cession du contrat à la société cessionnaire, avec effet à la date convenue, aux conditions de l'avenant signé. " + (libere ? "Le cédant est libéré pour l'avenir à compter de la date d'effet ; la part du prix correspondant au travail exécuté avant cette date reste due par lui." : "Le cédant n'est pas libéré et reste tenu solidairement avec le cessionnaire tant que nous ne l'aurons pas libéré par écrit.") + "\n\nRépartition retenue : " + repLabel + ".\n\nCordialement,";
    } else if (cession) {
      message = "Objet : votre annonce de cession, contrat en cours\n\nBonjour,\n\nNous avons bien reçu votre message nous informant du changement de société. Nous n'avons à ce jour donné aucun accord à un changement de cocontractant, et nous ne facturerons ni ne livrerons au nom d'une autre société tant que rien n'est signé.\n\nLe contrat se poursuit donc avec vous, dans les conditions du devis. Si vous souhaitez qu'une autre société le reprenne, merci de nous transmettre l'acte de cession ou ses clauses sur ce contrat, un extrait d'immatriculation de moins de trois mois, le nom et le pouvoir de son signataire. Nous vous proposerons ensuite un avenant à trois parties, qui précisera la répartition de l'acompte et le maintien de votre engagement tant que nous ne vous aurons pas libéré par écrit.\n\nCordialement,";
    } else {
      message = "Objet : changement dans votre société, contrat en cours\n\nBonjour,\n\nNous avons bien reçu votre information. Pour mettre à jour notre dossier et poursuivre le contrat dans de bonnes conditions, merci de nous transmettre un extrait d'immatriculation à jour, la preuve de l'opération et l'adresse de facturation à utiliser.\n\nCordialement,";
    }

    var recap = "Opération : " + LABEL_SETS.operation[x.operation] + "\n" +
      "Prix de la commande : " + fmtEur(x.P) + " ; acompte reçu : " + fmtEur(x.paid) + " ; avancement : " + fmtPct(x.av) + "\n" +
      "Travail exécuté : " + fmtEur(execute) + " ; reste à exécuter : " + fmtEur(reste) + " ; solde : " + fmtEur(solde) + "\n" +
      "Répartition : " + repLabel + "\n" +
      "Imputation de l'acompte : " + LABEL_SETS.imputation[x.imputation] + "\n" +
      "Votre accord : " + LABEL_SETS.accord[x.accord] + "\n" +
      "Libération du cédant : " + LABEL_SETS.liberation[x.liberation] + "\n" +
      "Points : " + nbBad + " bloquant(s), " + nbWarn + " à revoir\n" +
      "Verdict : " + verdict + "\n" +
      "Calcul indicatif, pas un conseil juridique.";

    return {
      x: x, incomplet: incomplet, cession: cession, execute: execute, reste: reste, solde: solde, surplus: surplus,
      dueCedant: dueCedant, dueCessionnaire: dueCessionnaire, exposition: exposition, sansAccord: sansAccord,
      executeLabel: fmtEur(execute), resteLabel: fmtEur(reste), soldeLabel: fmtEur(solde),
      cedantLabel: cession ? fmtEur(dueCedant) : "Sans objet", cessionnaireLabel: fmtEur(dueCessionnaire),
      expositionLabel: cession && libere ? fmtEur(exposition) : "Aucune : le cédant reste tenu",
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
  computeCession,
  normalize,
  fmtNum,
  fmtEur,
  fmtPct,
  dec,
  ent,
  pluriel,
  round2,
};
