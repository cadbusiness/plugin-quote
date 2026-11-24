/* eslint-disable */
// @ts-nocheck

  var SLUG = "verificateur-devoir-conseil-client-professionnel";
  var STATUT_LABELS = { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" };
  var POINTS = [
    { id: "relation", label: "Nature du contrat" },
    { id: "competence", label: "Compétence du client" },
    { id: "besoin", label: "Besoin exprimé par le client" },
    { id: "usage", label: "Usage repris dans le devis" },
    { id: "visite", label: "Visite ou relevé sur place" },
    { id: "limites", label: "Limites d'emploi" },
    { id: "miseEnGarde", label: "Mise en garde sur le choix du client" },
    { id: "travaux", label: "Préalables à la charge du client" },
    { id: "clause", label: "Clause sur l'information" },
    { id: "preuve", label: "Preuve conservée" }
  ];
  var LABEL_SETS = {
    relation: {
      vente: "Je vends le matériel, sans l'installer",
      vente_pose: "Je vends et j'installe le matériel",
      entreprise: "Je fabrique ou réalise sur mesure (contrat d'entreprise)"
    },
    competence: {
      meme: "Il exerce le même métier que moi ou fabrique ce type de matériel",
      utilisateur: "Il utilise déjà ce type de matériel depuis des années",
      autre_pro: "Professionnel d'un autre métier, sans compétence technique sur ce matériel",
      conseil: "Son équipe technique ou un bureau d'études a conçu le projet"
    },
    besoin: {
      cdc: "Par un cahier des charges écrit",
      questionnaire: "En répondant à des questions écrites (formulaire, funnel, compte rendu de visite)",
      oral: "À l'oral seulement (téléphone, salon, visite sans compte rendu)",
      aucun: "Il a commandé une référence sans rien dire de l'usage"
    },
    usage: {
      oui: "Oui, avec les données chiffrées du client",
      partiel: "En partie (une valeur, sans dire d'où elle vient)",
      non: "Non, le devis ne liste que des références et des prix"
    },
    visite: {
      oui: "Oui, avec un compte rendu écrit",
      non_necessaire: "Pas nécessaire : le matériel ne dépend pas du site",
      non: "Non, alors que le site compte (sol, alimentation, accès)"
    },
    limites: {
      ecrites: "Oui : charge ou capacité maximale, conditions d'emploi, ce qui est exclu",
      partielles: "Une valeur est écrite, sans dire ce qui se passe au-delà",
      aucune: "Aucune"
    },
    miseEnGarde: {
      sans_objet: "Non, il suit notre proposition",
      ecrite: "Oui, et notre mise en garde est écrite dans le devis ou un courrier",
      orale: "Oui, nous l'avons prévenu à l'oral",
      aucune: "Oui, et nous n'avons rien dit"
    },
    travaux: {
      aucun: "Aucun préalable n'est nécessaire",
      ecrits: "Listés dans le devis avec les données (puissance, charge au sol, cotes)",
      vagues: "Mentionnés sans données (« alimentation à la charge du client »)",
      non: "Nécessaires, mais le devis n'en dit rien"
    },
    clause: {
      aucune: "Aucune",
      recap: "Une mention qui récapitule les informations reçues et données",
      exclusion: "Une clause où le client renonce à tout conseil ou reconnaît être seul juge"
    },
    preuve: {
      dossier: "Les échanges écrits datés : demande, réponses, compte rendu, devis accepté",
      partielle: "Une partie seulement (devis accepté, quelques e-mails)",
      aucune: "Rien d'autre que la facture"
    },
    incident: {
      aucun: "Avant d'envoyer le devis : je vérifie",
      inadapte: "Le client dit que le matériel n'est pas adapté à son usage",
      cout_cache: "Le client découvre un coût d'adaptation qu'il n'avait pas prévu"
    }
  };
  var DEFAULTS = {
    relation: "vente_pose",
    competence: "autre_pro",
    besoin: "questionnaire",
    usage: "partiel",
    visite: "oui",
    limites: "partielles",
    miseEnGarde: "sans_objet",
    travaux: "aucun",
    clause: "aucune",
    preuve: "partielle",
    incident: "inadapte",
    montantDevis: "18400",
    coutAdaptation: "6800",
    surcoutInitial: "3100"
  };
  var MAX_MONTANT = 100000000;
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
    x.coutAdaptation = montant(r.coutAdaptation);
    x.surcoutInitial = montant(r.surcoutInitial);
    return x;
  }
  function verifierConseil(raw) {
    var x = normalize(raw);
    var plein = x.competence === "autre_pro";
    var reduit = x.competence === "meme" || x.competence === "utilisateur";
    var assiste = x.competence === "conseil";
    var cout = x.coutAdaptation;
    var deTouteFacon = Math.min(x.surcoutInitial, cout);
    var ecart = round2(cout - deTouteFacon);
    var pct = x.montantDevis > 0 ? round2(cout / x.montantDevis * 100) : null;
    var inst = x.relation === "vente" ? "la livraison" : "l'installation";
    var c = [];
    function add(statut, texte) { c.push({ point: POINTS[c.length].label, statut: statut, texte: texte }); }
    // 1. Nature du contrat
    var REL_TXT = {
      vente: "Vente de matériel : le vendeur doit expliquer clairement ce à quoi il s'oblige (article 1602) et, envers un client qui n'a pas la compétence technique, se renseigner sur son besoin pour lui dire si le matériel y est adapté.",
      vente_pose: "Vente avec installation : vous répondez du conseil sur le matériel et sur les conditions de son installation chez le client, comme le vendeur et l'installateur de l'arrêt du 11 mars 2020.",
      entreprise: "Fabrication ou réalisation sur mesure : votre conseil porte sur la solution que vous concevez à partir du besoin du client ; plus ce besoin est écrit, plus la discussion sera simple."
    };
    add("info", REL_TXT[x.relation]);
    // 2. Compétence du client
    if (plein) add("info", "Le client n'a pas de compétence technique sur ce matériel : le devoir de conseil joue pleinement, et c'est à vous de prouver que vous vous êtes renseigné sur son besoin et l'avez informé (arrêt du 28 octobre 2010).");
    else if (assiste) add("info", "Le projet a été conçu par l'équipe technique du client ou un bureau d'études : c'est à lui d'expliciter ses besoins pour que vous puissiez le conseiller utilement (arrêt du 21 janvier 2026). Signalez quand même par écrit ce que vous voyez d'inadapté.");
    else {
      var base = x.competence === "utilisateur"
        ? "Le client utilise ce type de matériel depuis des années : envers un acheteur professionnel dont la compétence permet d'apprécier les caractéristiques techniques, le devoir de conseil sur l'adaptation du matériel ne joue pas, quel que soit son métier (arrêt du 8 juillet 2026)."
        : "Le client exerce votre métier ou fabrique ce type de matériel : sa compétence lui permet d'apprécier les caractéristiques techniques, et le devoir de conseil sur l'adaptation du matériel ne joue pas envers lui (arrêts du 14 janvier 2014, du 22 mars 2017 et du 8 juillet 2026).";
      if (x.preuve === "aucune") add("warn", base + " Mais vous n'avez rien pour montrer cette compétence : notez-la (années d'activité, matériel déjà en service).");
      else add("ok", base + " Gardez la trace de cette compétence (années d'activité, matériel déjà en service).");
    }
    // 3. Besoin exprimé
    if (x.besoin === "cdc") add("ok", "Le besoin est écrit par le client : c'est la meilleure base. Vérifiez que votre proposition y répond point par point et signalez par écrit tout écart.");
    else if (x.besoin === "questionnaire") add("ok", "Le besoin est passé par des questions écrites : vous montrez que vous vous êtes renseigné. Vérifiez que les questions portaient sur ce qui compte (charges, cadence, environnement) et pas seulement sur des fourchettes.");
    else if (x.besoin === "oral") add("warn", "Le besoin n'est connu qu'à l'oral : vous aurez du mal à prouver ce que vous avez demandé et ce que le client a répondu. Faites-le confirmer par écrit avant l'acceptation.");
    else if (plein) add("bad", "Le client n'a rien dit de l'usage et n'a pas la compétence technique : c'est à vous de lui poser les questions. Sans elles, vous ne pourrez pas prouver que vous vous êtes renseigné.");
    else add("warn", "Le client n'a rien dit de l'usage. Un vendeur a été mis hors de cause face à un client compétent qui n'avait remis ni cahier des charges ni indication sur la destination du matériel (arrêt du 14 janvier 2014), mais une question écrite vous coûte peu.");
    // 4. Usage repris dans le devis
    if (x.usage === "oui") add("ok", "Le devis reprend l'usage prévu avec les données du client : en cas de litige, on voit sur quelle base vous avez proposé ce matériel.");
    else if (x.usage === "partiel") add("warn", "Le devis donne une valeur sans dire d'où elle vient ni à quel usage elle répond. Écrivez l'usage décrit par le client et les données qu'il vous a fournies.");
    else if (plein && (x.besoin === "oral" || x.besoin === "aucun")) add("bad", "Ni le besoin ni le devis ne disent à quoi le matériel doit servir : rien ne montre que vous avez adapté votre proposition à l'usage du client.");
    else add("warn", "Le devis ne liste que des références et des prix. Ajoutez l'usage prévu et les données qui ont servi au choix.");
    // 5. Visite
    if (x.visite === "oui") add("ok", "La visite a un compte rendu écrit : il montre ce que vous avez vu et relevé sur place.");
    else if (x.visite === "non_necessaire") add("info", "Pas de visite, et selon vous le matériel ne dépend pas du site. Si le client vous a parlé de son site, notez pourquoi la visite n'était pas utile.");
    else if (x.travaux === "non") add("bad", "Le site compte, aucune visite n'a eu lieu et le devis ne dit rien des préalables : c'est la situation où l'on reproche au fournisseur de ne pas avoir alerté le client.");
    else add("warn", "Le site compte et aucune visite n'a eu lieu. Proposez-la avant l'acceptation, ou demandez par écrit les données du site (plan, photos, puissance disponible, charge au sol).");
    // 6. Limites d'emploi
    if (x.limites === "ecrites") add("ok", "Les limites d'emploi sont écrites : le client sait ce que le matériel ne fera pas.");
    else if (x.limites === "partielles") add("warn", "Une valeur est écrite, mais pas ce qui se passe au-delà. Écrivez la limite comme une limite : « charge maximale par niveau : 800 kg ; au-delà, le matériel n'est pas prévu pour cet usage ».");
    else if (plein) add("bad", "Aucune limite d'emploi n'est écrite, pour un client qui ne peut pas les deviner. Ajoutez la capacité maximale et les conditions d'emploi.");
    else add("warn", "Aucune limite d'emploi n'est écrite. Même un client compétent lira le devis en cas de litige : ajoutez la capacité maximale.");
    // 7. Mise en garde
    if (x.miseEnGarde === "sans_objet") add("info", "Le client suit votre proposition : pas de mise en garde particulière à écrire.");
    else if (x.miseEnGarde === "ecrite") add("ok", "Votre mise en garde est écrite : le client a choisi en connaissance de cause. Gardez son accord sur le choix retenu.");
    else if (x.miseEnGarde === "orale") add("warn", "Vous avez prévenu le client à l'oral : en cas de litige, ce sera parole contre parole. Écrivez la mise en garde dans le devis ou un e-mail et faites-la accepter.");
    else if (reduit) add("warn", "Le client impose un choix que vous déconseillez et rien n'est dit. Même compétent, il peut ignorer ce que vous savez : écrivez la mise en garde.");
    else add("bad", "Le client impose un choix que vous déconseillez et rien n'est dit : c'est le manquement le plus simple à établir contre vous. Écrivez la mise en garde avant d'exécuter.");
    // 8. Préalables
    if (x.travaux === "aucun") add("ok", "Aucun préalable chez le client d'après vous." + (x.visite === "oui" ? " La visite le confirme." : " Écrivez-le dans le devis, avec ce sur quoi vous vous fondez."));
    else if (x.travaux === "ecrits") add("ok", "Les préalables à la charge du client sont listés avec leurs données : il peut les chiffrer avant de signer.");
    else if (x.travaux === "vagues") add("warn", "Les préalables sont mentionnés sans données. Dans l'affaire du 11 mars 2020, l'offre mettait l'alimentation électrique à la charge du client et donnait la puissance, et le débat a quand même porté sur l'alerte : donnez les chiffres et dites ce qu'ils impliquent chez lui.");
    else if (plein) add("bad", "Des préalables sont nécessaires et le devis n'en dit rien : le client découvrira un coût qu'il n'a pas prévu. Listez-les avec leurs données.");
    else add("warn", "Des préalables sont nécessaires et le devis n'en dit rien. Même compétent, le client doit savoir ce qu'il doit préparer.");
    // 9. Clause
    if (x.clause === "recap") add("ok", "Le devis récapitule les informations reçues et données : c'est une preuve utile, à condition qu'elle corresponde à ce qui a vraiment été dit.");
    else if (x.clause === "exclusion") add("bad", "Une clause où le client renonce à toute information ne tient pas pour l'information déterminante : les parties ne peuvent ni limiter ni exclure ce devoir (article 1112-1). Remplacez-la par un récapitulatif des informations données.");
    else add("warn", "Pas de mention qui récapitule les informations échangées. Ajoutez-en une : elle aide la preuve sans rien limiter.");
    // 10. Preuve
    if (x.preuve === "dossier") add("ok", "Les échanges écrits datés sont gardés : vous pourrez montrer ce que vous avez demandé, reçu et répondu. Entre commerçants, la preuve est libre (article L110-3 du code de commerce).");
    else if (x.preuve === "partielle") add("warn", "Le dossier est incomplet. Rassemblez maintenant la demande, les réponses du client, le compte rendu et le devis accepté, tant que les souvenirs sont frais.");
    else if (plein) add("bad", "Rien d'autre que la facture : vous ne pourrez pas prouver le conseil que la loi met à votre charge. Reconstituez ce qui peut l'être (e-mails, messages, notes datées).");
    else add("warn", "Rien d'autre que la facture. Même si le client est compétent, il faudra le montrer : gardez les traces de son expérience et de ses demandes.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    c.forEach(function (p) { if (p.statut === "ok") nbOk++; else if (p.statut === "warn") nbWarn++; else if (p.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad ? "bad" : nbWarn ? "warn" : "ok";
    var verdict = nbBad
      ? "À reprendre avant " + (x.incident === "aucun" ? "d'envoyer le devis" : "de répondre au client") + " : " + pluriel(nbBad, "point bloquant", "points bloquants") + (nbWarn ? ", " + pluriel(nbWarn, "point à revoir", "points à revoir") : "") + "."
      : nbWarn ? "Pas de point bloquant, " + pluriel(nbWarn, "point à revoir", "points à revoir") + "."
      : "Dossier solide : le besoin, les limites et les mises en garde sont écrits.";

    var devoirLabel = plein ? "Dû pleinement" : reduit ? "Pas dû si sa compétence est établie" : "Limité : au client d'expliciter son besoin";
    var preuveLabel = plein ? "Que vous vous êtes renseigné et avez informé" : reduit ? "La compétence réelle du client" : "Ce que le client vous a demandé, et vos alertes";
    var adaptLabel = cout === 0 ? "Aucune remise à niveau" : pct === null ? fmtEur(cout) + " HT (montant du devis à renseigner)" : fmtEur(cout) + " HT, soit " + fmtPct(pct) + " du devis";
    var ecartLabel = cout === 0 ? "Sans objet" : ecart === 0 ? "0 € : le client aurait payé autant pour la bonne solution" : fmtEur(ecart) + " HT";

    var actions = [];
    if (c[1].statut === "warn") actions.push("Notez dans le dossier ce qui montre la compétence du client : années d'activité, matériel du même type déjà en service, cahier des charges rédigé par ses soins.");
    if (c[2].statut === "warn" || c[2].statut === "bad") actions.push(x.besoin === "oral"
      ? "Faites confirmer le besoin par écrit : envoyez au client un e-mail qui reprend l'usage, les charges, la cadence et l'environnement, et demandez-lui de corriger ce qui est faux."
      : "Posez par écrit les questions d'usage avant de chiffrer : à quoi sert le matériel, quelles charges, quelle cadence, quel environnement, quelles contraintes du site.");
    if (c[3].statut === "warn" || c[3].statut === "bad") actions.push("Ajoutez au devis un paragraphe « Usage prévu » avec les données du client et leur source (questionnaire, compte rendu, e-mail).");
    if (c[4].statut === "warn" || c[4].statut === "bad") actions.push("Proposez une visite, ou obtenez par écrit les données du site : plan, photos, puissance électrique disponible, charge admissible au sol, accès.");
    if (c[5].statut === "warn" || c[5].statut === "bad") actions.push("Écrivez les limites d'emploi comme des limites : capacité maximale, conditions d'emploi, usages exclus.");
    if (c[6].statut === "warn" || c[6].statut === "bad") actions.push("Écrivez votre mise en garde (le choix du client, la solution recommandée, les risques) et faites-la accepter avant d'exécuter.");
    if (c[7].statut === "warn" || c[7].statut === "bad") actions.push("Listez les préalables à la charge du client avec leurs données (puissance, charge au sol, cotes, autorisations) et dites ce qu'ils impliquent chez lui.");
    if (c[8].statut === "bad") actions.push("Retirez la clause de renonciation et remplacez-la par une mention qui récapitule les informations reçues et données.");
    else if (c[8].statut === "warn") actions.push("Ajoutez la mention qui récapitule les informations reçues et données (modèle ci-dessous).");
    if (c[9].statut === "warn" || c[9].statut === "bad") actions.push("Rassemblez dans le dossier la demande, les réponses du client, le compte rendu de visite, le devis accepté et les e-mails datés.");
    if (x.incident === "inadapte") actions.push("Avant de répondre, relisez ce que le client a écrit de son usage et ce que dit votre devis ; proposez une constatation sur place, sans reconnaître de responsabilité.");
    if (x.incident === "cout_cache") actions.push("Demandez au client le détail du coût d'adaptation et ce qui l'a rendu nécessaire, puis comparez avec ce que disait votre devis.");
    if (x.incident !== "aucun" && cout > 0) actions.push("Séparez ce que le client aurait payé de toute façon pour la bonne solution (" + fmtEur(deTouteFacon) + " HT) de ce qui vient du fait de devoir refaire (" + fmtEur(ecart) + " HT) : seule la seconde part peut se discuter.");
    actions.push("Gardez dans le dossier " + (plein
      ? "les questions posées, les réponses du client et les informations que vous lui avez données"
      : reduit ? "la trace de la compétence du client et de ses demandes"
      : "le cahier des charges ou le dossier technique du client et vos alertes écrites") + ".");

    var clause = [
      "Besoin exprimé et conditions d'emploi",
      x.besoin === "cdc"
        ? "Usage prévu : celui décrit dans votre cahier des charges du [date], référence [référence], que notre proposition reprend point par point."
        : "Usage prévu, tel que vous nous l'avez décrit" + (x.besoin === "questionnaire" ? " dans vos réponses du [date]" : "") + " : [usage, charges, cadence, environnement].",
      "Limites d'emploi : [capacité maximale, conditions d'emploi, usages exclus]. Au-delà, le matériel n'est pas prévu pour cet usage.",
      x.travaux === "aucun"
        ? "Aucun préalable n'est nécessaire chez vous, d'après " + (x.visite === "oui" ? "notre visite du [date]" : "les informations que vous nous avez données") + "."
        : "À votre charge avant " + inst + " : [préalables et données : puissance électrique disponible, charge admissible au sol, cotes, accès].",
      x.miseEnGarde === "sans_objet"
        ? "Si l'usage change (charges, cadence, environnement), prévenez-nous avant de modifier ou de déplacer le matériel."
        : "Vous avez retenu [choix du client] alors que nous recommandions [solution] ; les risques de ce choix sont les suivants : [risques].",
      "Toute information différente ou complémentaire sur l'usage doit nous être transmise avant l'acceptation de ce devis : nous adapterons la proposition.",
      "Ce devis récapitule les informations échangées avant sa signature ; il ne limite pas notre devoir d'information."
    ].join("\n");

    var OBJETS = {
      aucun: "votre devis n° [référence] : usage prévu et limites d'emploi",
      inadapte: "votre réclamation du [date] sur [matériel]",
      cout_cache: "le coût d'adaptation de votre installation"
    };
    var m = ["Objet : " + OBJETS[x.incident], "", "Madame, Monsieur,", ""];
    var split = cout > 0 && deTouteFacon > 0
      ? "Une partie de ce coût, " + fmtEur(deTouteFacon) + " HT, correspond à ce que la bonne solution aurait coûté si elle avait été prévue dès le départ ; " + (ecart > 0 ? "c'est la part restante, " + fmtEur(ecart) + " HT, que nous vous proposons d'examiner ensemble." : "il ne reste donc pas de surcoût lié au fait de devoir refaire.")
      : "";
    if (x.incident === "aucun") {
      m.push("Avant que vous acceptiez notre devis n° [référence], merci de vérifier les informations sur lesquelles repose notre proposition :");
      m.push("Usage prévu : [usage, charges, cadence, environnement].");
      m.push("Limites d'emploi : [capacité maximale, conditions d'emploi].");
      m.push(x.travaux === "aucun" ? "Aucun préalable n'est à prévoir chez vous." : "À votre charge avant " + inst + " : [préalables et données].");
      if (x.miseEnGarde !== "sans_objet") m.push("Vous avez retenu [choix du client] ; nous vous recommandons [solution], pour les raisons suivantes : [risques].");
      m.push("Si l'une de ces informations est inexacte ou incomplète, dites-le-nous avant l'acceptation : nous adapterons le devis.");
    } else {
      if (x.incident === "inadapte") {
        m.push("Nous avons bien reçu votre courrier du [date] : vous indiquez que [matériel] n'est pas adapté à votre usage" + (cout > 0 ? " et vous évaluez sa remise à niveau à " + fmtEur(cout) + " HT." : "."));
      }
      else m.push("Vous nous indiquez devoir engager [travaux] pour un montant de " + (cout > 0 ? fmtEur(cout) + " HT" : "[montant]") + ".");
      var BASE = {
        cdc: "Notre proposition a été établie à partir de votre cahier des charges du [date].",
        questionnaire: "Notre proposition a été établie à partir de vos réponses du [date] : [rappel des réponses].",
        oral: "Notre proposition a été établie à partir des informations données lors de notre échange du [date] : [rappel].",
        aucun: "Votre commande portait sur [référence], sans indication particulière sur l'usage prévu."
      };
      m.push(BASE[x.besoin]);
      if (x.incident === "cout_cache") {
        if (x.travaux === "ecrits") m.push("Notre devis n° [référence] mentionnait ces préalables : [rappel avec les données].");
        else if (x.travaux === "vagues") m.push("Notre devis n° [référence] indiquait que [préalable] restait à votre charge.");
        else m.push("Nous reprenons volontiers avec vous ce que ces travaux recouvrent et pourquoi ils sont nécessaires.");
      } else if (x.usage !== "non") m.push("Notre devis n° [référence] indique : [valeurs écrites dans le devis].");
      if (split) m.push(split);
      m.push("Pour comprendre l'écart, nous vous proposons une constatation sur place, avec vos équipes, le [date]. Pouvez-vous nous transmettre d'ici là [données réelles d'usage : poids, cadence, conditions] ?");
      m.push("Ce courrier ne vaut pas reconnaissance de responsabilité ; nous cherchons avec vous la solution la plus simple.");
    }
    m.push("", "Nous restons à votre disposition.", "", "Veuillez agréer, Madame, Monsieur, nos salutations distinguées.");
    var message = m.join("\n");

    var recap = [
      "Devoir de conseil envers un client professionnel : récapitulatif",
      "Contrat : " + LABEL_SETS.relation[x.relation],
      "Client : " + LABEL_SETS.competence[x.competence],
      "Besoin : " + LABEL_SETS.besoin[x.besoin],
      "Devoir de conseil : " + devoirLabel,
      "À prouver : " + preuveLabel,
      "Situation : " + LABEL_SETS.incident[x.incident],
      "Remise à niveau : " + adaptLabel,
      "Part discutable : " + ecartLabel,
      "Contrôle : " + pluriel(nbOk, "conforme") + ", " + nbWarn + " à revoir, " + pluriel(nbBad, "bloquant") + ", " + pluriel(nbInfo, "information"),
      "Vérification : quotebuilder.co/outils/" + SLUG
    ].join("\n");
    return {
      x: x, plein: plein, reduit: reduit, assiste: assiste, pct: pct, deTouteFacon: deTouteFacon, ecart: ecart,
      devoirLabel: devoirLabel, preuveLabel: preuveLabel, adaptLabel: adaptLabel, ecartLabel: ecartLabel,
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
  verifierConseil,
  normalize,
  dec,
  round2,
  fmtNum,
  fmtEur,
  fmtPct,
  pluriel,
  montant,
};
