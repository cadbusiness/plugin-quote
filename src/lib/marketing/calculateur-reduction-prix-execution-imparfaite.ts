/* eslint-disable */
// @ts-nocheck

  var SLUG = "calculateur-reduction-prix-execution-imparfaite";
  var STATUT_LABELS = { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" };
  var POINTS = [
    { id: "contrat", label: "Texte applicable" },
    { id: "clause", label: "Clause du devis" },
    { id: "gravite", label: "Exécution imparfaite" },
    { id: "defaut", label: "Preuve du défaut" },
    { id: "miseEnDemeure", label: "Mise en demeure préalable" },
    { id: "reprise", label: "Possibilité de corriger" },
    { id: "notification", label: "Notification de la réduction" },
    { id: "paiement", label: "Ce qui reste à payer" },
    { id: "montant", label: "Proportionnalité du montant" },
    { id: "accord", label: "Votre réponse écrite" }
  ];
  var LABEL_SETS = {
    dateContrat: {
      apres2018: "À partir du 1er octobre 2018",
      entre: "Entre le 1er octobre 2016 et le 30 septembre 2018",
      avant2016: "Avant le 1er octobre 2016"
    },
    clause: {
      aucune: "Rien d'écrit sur les défauts et la réduction",
      procedure: "Une procédure écrite (signalement, constat, reprise, calcul)",
      exclusion: "Une clause qui exclut toute réduction du prix"
    },
    gravite: {
      partielle: "Défaut partiel : la prestation reste utilisable",
      inutilisable: "La prestation est inutilisable en l'état"
    },
    preuve: {
      constat: "Constat contradictoire ou procès-verbal signé",
      client: "Photos ou relevé du client seul",
      aucune: "Aucune pièce"
    },
    reception: {
      signale: "Signalé par écrit à la livraison ou peu après",
      sansreserve: "Réception acceptée sans réserve, défaut apparent signalé plus tard"
    },
    repriseStatut: {
      aucune: "Vous n'avez pas proposé de reprise",
      refusee: "Vous avez proposé une reprise, le client l'a refusée",
      faite: "Vous avez repris et le défaut est corrigé"
    },
    miseEnDemeure: {
      ecrite: "Oui, par écrit, avec un délai pour corriger",
      orale: "Seulement de vive voix",
      aucune: "Non"
    },
    notification: {
      ecrite: "Écrite, dans les jours qui ont suivi",
      tardive: "Écrite, mais des semaines ou des mois après",
      orale: "De vive voix seulement",
      aucune: "Pas encore de notification"
    },
    accord: {
      aucun: "Vous n'avez pas encore répondu",
      ecrit: "Vous avez accepté un montant par écrit",
      refus: "Vous avez refusé par écrit"
    }
  };
  var DEFAULTS = {
    dateContrat: "apres2018",
    clause: "aucune",
    prix: "7400",
    paye: "2220",
    reprise: "620",
    quantite: "400",
    touches: "36",
    perte: "40",
    gravite: "partielle",
    preuve: "client",
    reception: "signale",
    repriseStatut: "refusee",
    miseEnDemeure: "ecrite",
    notification: "ecrite",
    demande: "1480",
    accord: "aucun",
    delaiSignal: "8",
    delaiReprise: "15"
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
  function fmtEur(n) { return fmtNum(n) + " €"; }
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
    x.paid = Math.min(clampNum(x.paye, 0, 1000000000, 0), x.P);
    x.R = clampNum(x.reprise, 0, 1000000000, 0);
    var q = ent(x.quantite); x.q = isFinite(q) && q >= 1 ? Math.min(q, 10000000) : 0;
    var t = ent(x.touches); x.t = isFinite(t) && t >= 0 ? Math.min(t, x.q) : 0;
    x.p = clampNum(x.perte, 0, 100, 0);
    x.D = clampNum(x.demande, 0, 1000000000, 0);
    var ds = ent(x.delaiSignal); x.ds = isFinite(ds) && ds >= 1 ? Math.min(ds, 365) : 8;
    var dr = ent(x.delaiReprise); x.dr = isFinite(dr) && dr >= 1 ? Math.min(dr, 365) : 15;
    return x;
  }

  function computeReduction(raw) {
    var x = normalize(raw);
    var c = [];
    var push = function (id, statut, texte) {
      var p = POINTS.filter(function (q) { return q.id === id; })[0];
      c.push({ id: id, point: p.label, statut: statut, texte: texte });
    };
    var incomplet = x.q === 0 || x.P === 0;
    var part = x.q > 0 ? x.t / x.q : 0;
    var red = incomplet ? 0 : round2(x.P * part * x.p / 100);
    if (x.repriseStatut === "faite") red = 0;
    var reste = round2(x.P - x.paid);
    var resteApres = round2(reste - red);
    var ecart = round2(x.D - red);
    var ratio = red > 0 ? x.D / red : null;
    var deduit = x.D > 0 ? x.D : red;

    // Libellés du résultat
    var reductionLabel;
    if (incomplet) reductionLabel = "À renseigner";
    else if (x.repriseStatut === "faite") reductionLabel = "Aucune : le défaut est corrigé";
    else if (x.t === 0) reductionLabel = "Aucun élément touché";
    else if (x.p === 0) reductionLabel = "Aucune : perte de valeur nulle";
    else reductionLabel = fmtEur(red) + " HT";
    var partLabel = x.q === 0 ? "À renseigner" : x.t + " sur " + x.q + " (" + fmtPct(part * 100) + ")";
    var ecartLabel;
    if (x.D === 0) ecartLabel = "Pas de réduction annoncée";
    else if (incomplet) ecartLabel = "À renseigner";
    else if (Math.abs(ecart) < 0.005) ecartLabel = "Aucun écart";
    else if (ecart > 0) ecartLabel = "Le client demande " + fmtEur(ecart) + " HT de plus";
    else ecartLabel = "Le client demande " + fmtEur(-ecart) + " HT de moins";
    var resteLabel;
    if (incomplet) resteLabel = "À renseigner";
    else if (resteApres >= 0) resteLabel = fmtEur(resteApres) + " HT";
    else resteLabel = "Trop payé de " + fmtEur(-resteApres) + " HT : remboursement par accord ou décision du juge";
    var repriseLabel;
    if (x.repriseStatut === "faite") repriseLabel = "Reprise faite : pas de réduction pour ce défaut";
    else if (incomplet) repriseLabel = "À renseigner";
    else if (x.R === 0) repriseLabel = "Coût de reprise non renseigné";
    else if (Math.abs(x.R - red) < 0.005) repriseLabel = "Même coût que la réduction";
    else if (x.R > red) repriseLabel = "La reprise vous coûte " + fmtEur(x.R - red) + " HT de plus que la réduction";
    else repriseLabel = "La reprise vous coûte " + fmtEur(red - x.R) + " HT de moins que la réduction";

    // 1 Texte applicable
    if (x.dateContrat === "apres2018") push("contrat", "ok", "Article 1223 dans sa rédaction issue de la loi n° 2018-287 du 20 avril 2018, applicable aux contrats conclus à partir du 1er octobre 2018.");
    else if (x.dateContrat === "entre") push("contrat", "warn", "Contrat conclu entre le 1er octobre 2016 et le 30 septembre 2018 : c'est la première rédaction de l'article 1223 qui s'applique. Faites vérifier par votre conseil.");
    else push("contrat", "bad", "Contrat conclu avant le 1er octobre 2016 : l'article 1223 ne s'applique pas, l'ancien droit reste applicable (Cass. 3e civ., 17 octobre 2024, n° 23-10.288). Prenez conseil.");

    // 2 Clause
    if (x.clause === "procedure") push("clause", "ok", "Votre devis organise la procédure : vérifiez qu'elle a été suivie (signalement sous " + pluriel(x.ds, "jour") + ", constat, reprise sous " + pluriel(x.dr, "jour ouvré", "jours ouvrés") + ").");
    else if (x.clause === "exclusion") push("clause", "warn", "Une clause qui exclut toute réduction peut être réputée non écrite si elle prive de sa substance votre obligation essentielle (article 1170) ou, dans un contrat d'adhésion, si elle crée un déséquilibre significatif (article 1171). Ne comptez pas seulement sur elle.");
    else push("clause", "info", "Rien d'écrit : l'article 1223 s'applique tel quel. Ajoutez une clause de procédure à vos prochains devis.");

    // 3 Gravité
    if (x.gravite === "partielle") push("gravite", "ok", "Exécution imparfaite, prestation utilisable : la réduction du prix est le remède prévu par l'article 1223.");
    else push("gravite", "warn", "Prestation inutilisable : le client demandera plutôt une reprise ou un remplacement (articles 1221 et 1222), ou la résolution (article 1224). Une réduction de 100 % sur les éléments touchés revient à rembourser ces éléments.");

    // 4 Preuve du défaut
    if (x.t === 0) push("defaut", "info", "Aucun élément touché : pas de réduction à calculer.");
    else {
      var st = x.preuve === "constat" ? "ok" : (x.preuve === "client" ? "warn" : "bad");
      var tx = x.preuve === "constat" ? "Défaut constaté contradictoirement : le nombre d'éléments touchés est établi." : (x.preuve === "client" ? "Seulement des photos ou un relevé du client : proposez un constat contradictoire pour arrêter le nombre d'éléments touchés." : "Aucune pièce : c'est au client de prouver le défaut. Sans preuve, la réduction n'est pas justifiée.");
      if (x.reception === "sansreserve") {
        if (st === "ok") st = "warn";
        tx += " Pour des travaux, une réception sans réserve couvre en principe les défauts apparents (article 1792-6).";
      }
      push("defaut", st, tx);
    }

    // 5 Mise en demeure
    if (x.miseEnDemeure === "ecrite") push("miseEnDemeure", "ok", "Mise en demeure écrite avec un délai : condition de l'article 1223 remplie.");
    else if (x.miseEnDemeure === "orale") push("miseEnDemeure", "warn", "Une demande orale prouve mal la mise en demeure (article 1344 : sommation ou acte portant interpellation suffisante). Demandez au client de l'écrire, ou écrivez vous-même ce qui a été demandé.");
    else push("miseEnDemeure", "bad", "Pas de mise en demeure : la condition de l'article 1223 n'est pas remplie, sauf urgence. Proposez une reprise datée.");

    // 6 Reprise
    if (x.repriseStatut === "faite") push("reprise", "bad", "Défaut corrigé : il n'y a plus d'exécution imparfaite à compenser par une baisse de prix. Seul un préjudice distinct, prouvé, pourrait être réparé.");
    else if (x.repriseStatut === "refusee") push("reprise", "ok", "Vous avez proposé de corriger. Le client peut préférer la réduction, mais votre offre montre votre bonne foi et pèse sur la perte de valeur.");
    else push("reprise", "warn", "Vous n'avez pas proposé de reprise. Comparez son coût avec la réduction et proposez par écrit la solution la plus raisonnable.");

    // 7 Notification
    if (x.notification === "ecrite") push("notification", "ok", "Notification écrite et rapide : conforme à l'exigence des « meilleurs délais ».");
    else if (x.notification === "tardive") push("notification", "warn", "Notification tardive : l'article 1223 exige qu'elle intervienne dans les meilleurs délais. Le retard peut être discuté.");
    else if (x.notification === "orale") push("notification", "warn", "Notification orale : demandez au client de l'écrire, avec le défaut, le calcul et le montant qu'il paiera.");
    else push("notification", "info", "Pas encore de notification : aucune réduction n'est décidée. Préparez votre chiffrage pour la discussion.");

    // 8 Reste à payer
    if (incomplet) push("paiement", "info", "Prix ou quantité à renseigner.");
    else if (x.paid >= x.P) push("paiement", "warn", "Tout est payé : le client ne peut pas réduire seul. Sans accord, il doit demander la réduction au juge (article 1223, troisième alinéa).");
    else if (deduit > reste) push("paiement", "warn", "La réduction dépasse le reste à payer (" + fmtEur(reste) + " HT) de " + fmtEur(deduit - reste) + " HT : pour cet excédent, il faut votre accord ou une décision du juge.");
    else push("paiement", "ok", "La réduction tient dans le reste à payer (" + fmtEur(reste) + " HT).");

    // 9 Montant
    if (incomplet) push("montant", "info", "Prix ou quantité à renseigner.");
    else if (x.D === 0) push("montant", "info", "Pas de montant annoncé : proposez la réduction calculée, " + fmtEur(red) + " HT.");
    else if (red === 0) push("montant", "bad", "Le calcul ne donne aucune réduction (aucun élément touché, perte nulle ou défaut corrigé) : le montant annoncé n'est pas justifié en l'état.");
    else if (ratio <= 1.1) push("montant", "ok", "La demande correspond à la réduction proportionnelle à 10 % près.");
    else if (ratio <= 1.5) push("montant", "warn", "La demande dépasse la réduction proportionnelle de " + fmtEur(ecart) + " HT. Demandez au client sur quoi il fonde ce chiffre.");
    else push("montant", "bad", "La demande représente " + String(Math.round(ratio * 10) / 10).replace(".", ",") + " fois la réduction proportionnelle : elle n'est pas proportionnelle au défaut. Répondez avec votre calcul.");

    // 10 Réponse
    if (x.accord === "ecrit") push("accord", "ok", "Votre acceptation écrite vous engage sur le montant accepté : émettez l'avoir correspondant, pas plus.");
    else if (x.accord === "refus") push("accord", "info", "Refus écrit : le client peut saisir le juge, qu'il ait payé ou non. S'il retient sans droit, il s'expose à des dommages et intérêts (Cass. 1re civ., 18 décembre 2024, n° 24-14.750).");
    else push("accord", "warn", "Répondez par écrit, vite : acceptez ce qui est justifié, refusez le reste. Votre silence pourrait être présenté comme un accord.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    c.forEach(function (p) {
      if (p.statut === "ok") nbOk++; else if (p.statut === "warn") nbWarn++; else if (p.statut === "bad") nbBad++; else nbInfo++;
    });
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");
    var verdict;
    if (nbBad > 0) verdict = "Réduction contestable en l'état : " + pluriel(nbBad, "point bloquant", "points bloquants") + (nbWarn > 0 ? ", " + pluriel(nbWarn, "point", "points") + " à revoir." : ".");
    else if (nbWarn > 0) verdict = "Pas de point bloquant, " + pluriel(nbWarn, "point", "points") + " à revoir.";
    else verdict = "Dossier en ordre : la réduction peut être réglée sur la base du calcul proportionnel.";

    // Actions
    var actions = [];
    if (x.dateContrat !== "apres2018") actions.push("Faites vérifier le texte applicable par votre conseil : contrat conclu avant le 1er octobre 2018.");
    if (x.miseEnDemeure === "aucune") actions.push("Rappelez au client que l'article 1223 exige une mise en demeure préalable, et proposez une reprise datée.");
    if (x.t > 0 && x.preuve !== "constat") actions.push("Proposez un constat contradictoire à une date proche, avec le devis et les critères d'acceptation.");
    if (x.gravite === "inutilisable" && x.repriseStatut !== "faite") actions.push("Proposez une reprise ou un remplacement : une réduction ne répare pas une prestation inutilisable.");
    if (!incomplet && red > 0 && x.D > 0 && ratio > 1.1) actions.push("Répondez avec votre calcul : éléments touchés " + x.t + " sur " + x.q + ", perte de valeur de " + fmtPct(x.p) + ", soit " + fmtEur(red) + " HT au lieu de " + fmtEur(x.D) + " HT.");
    if (x.repriseStatut === "aucune" && !incomplet && x.R > 0) actions.push("Comparez la reprise (" + fmtEur(x.R) + " HT) et la réduction (" + fmtEur(red) + " HT), et proposez par écrit la solution la plus raisonnable.");
    if (!incomplet && x.paid >= x.P) actions.push("Tout est payé : sans accord, le client doit saisir le juge. Ne remboursez pas sur simple demande.");
    if (x.accord === "aucun") actions.push("Répondez par écrit dans les meilleurs délais, et encaissez tout règlement partiel avec une réserve écrite.");
    if (x.accord === "ecrit") actions.push("Émettez un avoir du montant accepté, qui renvoie à la facture d'origine.");
    if (x.clause !== "procedure") actions.push("Ajoutez à vos prochains devis la clause de procédure ci-dessus.");
    actions.push("Gardez dans le dossier le devis, les échanges datés, le constat et votre calcul.");

    // Clause
    var clause = [
      "Défauts constatés et réduction du prix",
      "1. Le client signale par écrit tout défaut apparent dans un délai de " + pluriel(x.ds, "jour") + " après la livraison ou la fin de la prestation, avec photos et références des éléments concernés.",
      "2. Les défauts signalés sont constatés de façon contradictoire, à la demande de la partie la plus diligente, par rapport aux critères d'acceptation du devis (échantillon validé, tolérances, classe de finition).",
      "3. Le prestataire dispose d'un délai de " + pluriel(x.dr, "jour ouvré", "jours ouvrés") + " à compter du constat pour reprendre ou remplacer les éléments défectueux.",
      "4. Si la reprise est impossible, refusée par le prestataire ou non réalisée dans ce délai, le client peut demander une réduction du prix conformément à l'article 1223 du code civil.",
      "5. La réduction est calculée sur les seuls éléments défectueux : prix des éléments concernés × perte de valeur constatée.",
      "6. Le prix des éléments conformes reste dû aux échéances prévues ; aucune retenue ne porte sur eux.",
      "7. Toute réduction est acceptée par écrit et fait l'objet d'un avoir qui renvoie à la facture d'origine.",
      "8. Ces stipulations ne privent aucune partie des autres droits que lui donne la loi."
    ].join("\n");

    // Courrier
    var m = ["Objet : votre décision de réduction du prix", ""];
    if (x.D > 0) m.push("Nous avons bien reçu votre décision de réduire le prix de " + fmtEur(x.D) + " HT.");
    else m.push("Nous revenons vers vous au sujet des défauts que vous nous avez signalés.");
    if (incomplet) m.push("Nous reprenons le calcul dès que nous aurons arrêté ensemble le prix et les quantités concernées.");
    else if (x.repriseStatut === "faite") m.push("Les éléments concernés ont été repris et le défaut est corrigé : nous ne pouvons pas accepter de réduction du prix pour ce défaut.");
    else if (x.t === 0) m.push("À ce stade, aucun élément défectueux n'a été constaté : nous vous proposons une vérification commune.");
    else {
      m.push("Nous reconnaissons un défaut sur " + (x.q > 1 ? x.t + " des " + x.q + " éléments livrés" : "l'élément livré") + " (" + fmtPct(part * 100) + ").");
      m.push("L'article 1223 du code civil prévoit une réduction proportionnelle. Avec une perte de valeur de " + fmtPct(x.p) + " sur ces éléments, la réduction correspondante est de " + fmtEur(red) + " HT.");
      if (x.D > 0 && ratio !== null && ratio > 1.1) m.push("Le montant que vous annoncez dépasse ce calcul de " + fmtEur(ecart) + " HT : nous ne pouvons pas l'accepter en l'état.");
      if (x.preuve !== "constat") m.push("Nous vous proposons un constat contradictoire pour arrêter ensemble le nombre d'éléments concernés.");
      if (x.repriseStatut === "refusee") m.push("Notre proposition de reprise reste valable si vous la préférez.");
      if (x.repriseStatut === "aucune") m.push("Nous pouvons aussi reprendre les éléments concernés sous " + pluriel(x.dr, "jour ouvré", "jours ouvrés") + " si vous le préférez.");
      if (resteApres >= 0) m.push("Nous sommes prêts à accepter par écrit une réduction de " + fmtEur(red) + " HT et à vous adresser l'avoir correspondant. Le solde dû s'établirait alors à " + fmtEur(resteApres) + " HT.");
      else m.push("Nous sommes prêts à accepter par écrit une réduction de " + fmtEur(red) + " HT et à vous rembourser " + fmtEur(-resteApres) + " HT, avec l'avoir correspondant.");
    }
    m.push("");
    m.push("Cordialement,");
    var message = m.join("\n");

    var recap = [
      "Réduction du prix pour exécution imparfaite",
      "Prix : " + fmtEur(x.P) + " HT, déjà payé : " + fmtEur(x.paid) + " HT",
      "Éléments touchés : " + partLabel,
      "Perte de valeur retenue : " + fmtPct(x.p),
      "Réduction proportionnelle : " + reductionLabel,
      "Réduction annoncée : " + (x.D > 0 ? fmtEur(x.D) + " HT" : "aucune"),
      "Écart : " + ecartLabel,
      "Reste à payer après réduction : " + resteLabel,
      "Reprise : " + repriseLabel,
      "Contrôle : " + pluriel(nbOk, "conforme") + ", " + nbWarn + " à revoir, " + pluriel(nbBad, "bloquant") + ", " + pluriel(nbInfo, "information"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      x: x, incomplet: incomplet, part: part, reduction: red, reste: reste, resteApres: resteApres, ecart: ecart, ratio: ratio,
      reductionLabel: reductionLabel, partLabel: partLabel, ecartLabel: ecartLabel, resteLabel: resteLabel, repriseLabel: repriseLabel,
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
  computeReduction,
  normalize,
  fmtNum,
  fmtEur,
  fmtPct,
  dec,
  ent,
  pluriel,
  round2,
};
