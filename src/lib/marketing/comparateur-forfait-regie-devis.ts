/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "comparateur-forfait-regie-devis";
  var ROLE_LABELS = { prestataire: "prestataire, qui chiffre", client: "client, qui compare des offres" };
  var MODELE_LABELS = { forfait: "forfait", regie: "régie", plafond: "régie plafonnée", phases: "forfait par phase, puis régie" };
  var PERIMETRE_LABELS = { ferme: "cahier des charges écrit et validé", partiel: "besoin décrit, détails à préciser", flou: "besoin flou" };
  var INCONNUES_LABELS = { aucune: "aucune ou presque", quelques: "quelques-unes", nombreuses: "nombreuses" };
  var AVENANT_LABELS = { ecrit: "avenant écrit et chiffré avant exécution", oral: "convenu à l'oral ou par e-mail", aucun: "rien de prévu" };
  var SUIVI_LABELS = { releve: "relevé d'heures partagé avec le client", interne: "suivi interne seulement", aucun: "aucun suivi" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Cohérence des estimations", "Périmètre", "Inconnues", "Écart entre les estimations", "Mode choisi",
    "Réserve de risque", "Marge du forfait", "Changements de périmètre", "Suivi des heures", "Plafond de la régie"
  ];
  var DEFAULTS = {
    role: "prestataire",
    modele: "forfait",
    hBasse: 60,
    hProbable: 80,
    hHaute: 100,
    taux: 85,
    coutRevient: 52,
    perimetre: "partiel",
    inconnues: "quelques",
    changements: 2,
    hParChangement: 10,
    reserve: 15,
    plafondPct: 20,
    avenant: "oral",
    suivi: "releve"
  };

  function clean(v) { return String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", "."); }
  function num(v, min, max, def) {
    var n = parseFloat(clean(v));
    if (!isFinite(n)) return def;
    n = Math.floor(n);
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  }
  function dec(v, min, max, def) {
    var n = parseFloat(clean(v));
    if (!isFinite(n)) return def;
    n = Math.round(n * 100) / 100;
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  }
  function pick(v, labels, def) { return Object.prototype.hasOwnProperty.call(labels, v) ? v : def; }
  function fmtInt(n) {
    var s = String(Math.round(Math.abs(n)));
    var out = "";
    while (s.length > 3) { out = " " + s.slice(-3) + out; s = s.slice(0, -3); }
    return (n < 0 && Math.round(Math.abs(n)) !== 0 ? "\u2212" : "") + s + out;
  }
  function fmtEur(n) { return fmtInt(n) + " €"; }
  function fmtTaux(x) {
    var r = Math.round(x * 100) / 100;
    var s = r.toFixed(2).replace(".", ",");
    if (s.slice(-3) === ",00") s = s.slice(0, -3);
    return s + " €";
  }
  function fmtH(n) { return fmtInt(n) + " h"; }
  function fmtPct(x) { return fmtInt(Math.round(x * 100)) + " %"; }

  function computeForfaitRegie(input) {
    input = input || {};
    var role = pick(input.role, ROLE_LABELS, DEFAULTS.role);
    var modele = pick(input.modele, MODELE_LABELS, DEFAULTS.modele);
    var perimetre = pick(input.perimetre, PERIMETRE_LABELS, DEFAULTS.perimetre);
    var inconnues = pick(input.inconnues, INCONNUES_LABELS, DEFAULTS.inconnues);
    var avenant = pick(input.avenant, AVENANT_LABELS, DEFAULTS.avenant);
    var suivi = pick(input.suivi, SUIVI_LABELS, DEFAULTS.suivi);
    var h1 = num(input.hBasse, 0, 100000, DEFAULTS.hBasse);
    var h2 = num(input.hProbable, 0, 100000, DEFAULTS.hProbable);
    var h3 = num(input.hHaute, 0, 100000, DEFAULTS.hHaute);
    var ordonne = h1 <= h2 && h2 <= h3;
    var tri = [h1, h2, h3].sort(function (a, b) { return a - b; });
    var hBasse = tri[0], hProbable = tri[1], hHaute = tri[2];
    var taux = dec(input.taux, 0, 100000, DEFAULTS.taux);
    var cout = dec(input.coutRevient, 0, 100000, DEFAULTS.coutRevient);
    var changements = num(input.changements, 0, 50, DEFAULTS.changements);
    var hParChg = num(input.hParChangement, 0, 500, DEFAULTS.hParChangement);
    var reserve = num(input.reserve, 0, 100, DEFAULTS.reserve);
    var plafondPct = num(input.plafondPct, 0, 200, DEFAULTS.plafondPct);

    var regieProbable = Math.round(hProbable * taux);
    var regieBasse = Math.round(hBasse * taux);
    var regieHaute = Math.round(hHaute * taux);
    var forfait = Math.round(hProbable * taux * (1 + reserve / 100));
    var plafond = Math.round(hProbable * taux * (1 + plafondPct / 100));
    var coutProbable = Math.round(hProbable * cout);
    var coutHaute = Math.round(hHaute * cout);
    var margeProbable = forfait - coutProbable;
    var margeHaute = forfait - coutHaute;
    var pointMort = cout > 0 ? Math.floor(forfait / cout) : null;
    var heuresChg = changements * hParChg;
    var perteChg = Math.round(heuresChg * cout);
    var factureChg = Math.round(heuresChg * taux);
    var ecart = hProbable > 0 ? (hHaute - hBasse) / hProbable : (hHaute > hBasse ? 1 : 0);
    var ecartPts = ecart < 0.3 ? 0 : ecart < 0.6 ? 1 : 2;
    var perPts = perimetre === "ferme" ? 0 : perimetre === "partiel" ? 1 : 2;
    var incPts = inconnues === "aucune" ? 0 : inconnues === "quelques" ? 1 : 2;
    var score = perPts + incPts + ecartPts;
    var conseil = score <= 1 ? "forfait" : score <= 3 ? "phases" : "plafond";
    var conseilLabel = score <= 1 ? "Forfait" : score <= 3 ? "Forfait par phase, puis régie" : "Régie plafonnée, après une étude payante si possible";
    var estForfait = modele === "forfait" || modele === "phases";
    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    if (!ordonne) add(POINTS[0], "warn", "Les trois estimations ne sont pas dans l'ordre (basse, probable, haute). L'outil les a remises dans l'ordre : " + fmtH(hBasse) + ", " + fmtH(hProbable) + ", " + fmtH(hHaute) + ". Vérifiez la saisie.");
    else if (hProbable === 0) add(POINTS[0], "warn", "L'estimation probable est à 0 heure : aucun prix ne peut en sortir.");
    else add(POINTS[0], "ok", "Trois estimations dans l'ordre : " + fmtH(hBasse) + ", " + fmtH(hProbable) + ", " + fmtH(hHaute) + ".");

    if (perimetre === "ferme") add(POINTS[1], "ok", "Un cahier des charges écrit et validé permet de chiffrer un forfait sans trop de réserve.");
    else if (perimetre === "partiel") add(POINTS[1], "warn", "Le besoin est décrit mais pas tous les détails. Écrivez les hypothèses retenues dans le devis, ou découpez en phases.");
    else add(POINTS[1], estForfait && modele === "forfait" ? "bad" : "warn", "Le besoin est flou. Un forfait sur un besoin flou se transforme en discussion sur ce qui était compris. Mieux vaut une étude payante ou une régie plafonnée.");

    if (inconnues === "aucune") add(POINTS[2], "ok", "Peu d'inconnues : l'existant, les accès et les tiers sont connus.");
    else if (inconnues === "quelques") add(POINTS[2], "warn", "Quelques inconnues. Listez-les dans le devis comme hypothèses, avec ce qui se passe si elles sont fausses.");
    else add(POINTS[2], modele === "forfait" ? "bad" : "warn", "Beaucoup d'inconnues. Le forfait les fait porter par le prestataire, la régie par le client : choisissez qui porte quoi avant de signer.");

    if (hProbable === 0) add(POINTS[3], "info", "Écart non calculable sans estimation probable.");
    else if (ecartPts === 0) add(POINTS[3], "ok", "Écart entre la basse et la haute : " + fmtPct(ecart) + " de l'estimation probable. Les estimations sont proches.");
    else if (ecartPts === 1) add(POINTS[3], "info", "Écart entre la basse et la haute : " + fmtPct(ecart) + " de l'estimation probable. Une réserve de risque et des hypothèses écrites sont utiles.");
    else add(POINTS[3], "warn", "Écart entre la basse et la haute : " + fmtPct(ecart) + " de l'estimation probable. Une telle dispersion dit que le besoin n'est pas assez connu pour un forfait ferme.");

    if (modele === conseil) add(POINTS[4], "ok", "Le mode choisi (" + MODELE_LABELS[modele] + ") correspond à ce que suggèrent vos réponses.");
    else if (modele === "forfait" && conseil === "plafond") add(POINTS[4], "bad", "Un forfait ferme alors que vos réponses suggèrent beaucoup d'incertitude : le risque de perdre de l'argent ou de se disputer est élevé. Passez à une régie plafonnée ou découpez en phases.");
    else if (modele === "regie" && conseil === "forfait") add(POINTS[4], "warn", "La régie sur une prestation bien cadrée : un client B2B préférera souvent un prix ferme. Proposez un forfait, la régie pour les options.");
    else if (modele === "regie") add(POINTS[4], "info", "La régie pure convient quand le besoin évolue, mais le client n'a aucun plafond. Pensez à une alerte à 80 % de l'estimation.");
    else if (modele === "plafond" && conseil === "forfait") add(POINTS[4], "info", "La régie plafonnée sur une prestation bien cadrée : un forfait serait plus simple à facturer et à comprendre.");
    else add(POINTS[4], "warn", "Le mode choisi (" + MODELE_LABELS[modele] + ") diffère de ce que suggèrent vos réponses (" + conseilLabel.toLowerCase() + "). Ce n'est pas interdit, mais écrivez pourquoi.");

    var reserveMini = Math.round(ecart * 50);
    if (!estForfait) add(POINTS[5], "info", "Sans objet pour une " + MODELE_LABELS[modele] + " : le risque d'heures en plus reste chez le client, dans la limite du plafond s'il y en a un.");
    else if (reserve >= reserveMini) add(POINTS[5], "ok", "Réserve de " + fmtInt(reserve) + " % pour un écart de " + fmtPct(ecart) + " entre les estimations : la réserve couvre au moins la moitié de l'écart.");
    else add(POINTS[5], "warn", "Réserve de " + fmtInt(reserve) + " % pour un écart de " + fmtPct(ecart) + " : elle ne couvre pas la moitié de l'écart (" + fmtInt(reserveMini) + " %). Relevez-la ou resserrez le périmètre.");

    if (!estForfait) add(POINTS[6], "info", "Sans objet pour une " + MODELE_LABELS[modele] + " : la marge suit les heures facturées.");
    else if (cout <= 0) add(POINTS[6], "info", "Coût de revient non renseigné : marge non calculable.");
    else if (margeHaute < 0) add(POINTS[6], "bad", "À l'estimation haute (" + fmtH(hHaute) + "), le forfait de " + fmtEur(forfait) + " est perdant de " + fmtEur(-margeHaute) + " pour un coût de " + fmtEur(coutHaute) + ".");
    else if (margeHaute * 10 < forfait) add(POINTS[6], "warn", "À l'estimation haute, la marge tombe à " + fmtEur(margeHaute) + ", moins de 10 % du forfait.");
    else add(POINTS[6], "ok", "Marge de " + fmtEur(margeProbable) + " au probable et " + fmtEur(margeHaute) + " à l'estimation haute.");

    if (changements === 0 || hParChg === 0) add(POINTS[7], "info", "Aucun changement de périmètre prévu. Gardez quand même la règle de l'avenant écrit dans le devis.");
    else if (avenant === "ecrit") add(POINTS[7], "ok", "Les " + fmtInt(changements) + " changements probables (" + fmtH(heuresChg) + ") donneront un avenant écrit avant exécution : " + fmtEur(factureChg) + " facturables au taux du devis.");
    else if (modele === "regie") add(POINTS[7], "info", "En régie, les changements sont facturés au temps passé. Un accord écrit sur les gros changements reste utile.");
    else add(POINTS[7], avenant === "aucun" && estForfait ? "bad" : "warn", "Les " + fmtInt(changements) + " changements probables représentent " + fmtH(heuresChg) + ", soit " + fmtEur(perteChg) + " de coût de revient. Sans avenant écrit et chiffré avant exécution, ces heures sont difficiles à facturer.");

    if (estForfait && modele === "forfait") add(POINTS[8], suivi === "aucun" ? "warn" : "info", suivi === "aucun" ? "Aucun suivi des heures : vous ne saurez pas si le forfait tient, ni quand prévenir le client." : "Au forfait, le client ne voit pas les heures, mais le suivi interne dit quand prévenir d'un dépassement du périmètre.");
    else if (suivi === "releve") add(POINTS[8], "ok", "Le relevé d'heures partagé donne au client de quoi vérifier la facture.");
    else add(POINTS[8], "bad", "Une facturation au temps passé exige un relevé d'heures que le client peut vérifier, par exemple chaque semaine. Sans lui, la facture sera contestée.");

    if (modele === "plafond" || modele === "phases") {
      if (plafond < regieHaute && modele === "plafond") add(POINTS[9], "warn", "Le plafond de " + fmtEur(plafond) + " est sous la régie à l'estimation haute (" + fmtEur(regieHaute) + ") : si les inconnues tournent mal, vous travaillerez gratuitement ou vous renégocierez.");
      else if (modele === "plafond") add(POINTS[9], "ok", "Plafond de " + fmtEur(plafond) + ", au-dessus de la régie à l'estimation haute (" + fmtEur(regieHaute) + ").");
      else add(POINTS[9], "info", "Fixez le forfait de la première phase et la façon de chiffrer la suite (régie, plafond ou nouveau forfait) avant de signer.");
    } else add(POINTS[9], "info", "Sans objet pour le mode " + MODELE_LABELS[modele] + ".");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) { if (c.statut === "ok") nbOk++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : nbWarn > 0 ? "warn" : "ok";
    var verdict = (nbBad > 0 ? fmtInt(nbBad) + " point" + (nbBad > 1 ? "s" : "") + " bloquant" + (nbBad > 1 ? "s" : "") + ", " + fmtInt(nbWarn) + " à compléter." : "Aucun point bloquant, " + fmtInt(nbWarn) + " à compléter.") +
      " Mode choisi : " + MODELE_LABELS[modele] + ". Mode suggéré par vos réponses : " + conseilLabel.toLowerCase() + ".";

    var tauxTxt = fmtTaux(taux);
    var clause;
    if (modele === "forfait") {
      clause = [
        "Article [X] : Prix forfaitaire",
        "1. Le prix de " + fmtEur(forfait) + " [hors taxes ou toutes taxes comprises] couvre uniquement le périmètre décrit dans [document, version, date].",
        "2. Les hypothèses retenues pour ce prix sont : [hypothèses]. Si l'une d'elles se révèle fausse, les parties se rapprochent pour un avenant avant de poursuivre.",
        "3. Toute demande hors de ce périmètre fait l'objet d'un avenant écrit, chiffré avant exécution, au taux de " + tauxTxt + " de l'heure.",
        "4. Le client fournit [éléments, accès, interlocuteur] avant le [date]. Un retard décale le planning et peut donner lieu à avenant.",
        "5. Le prix ne varie pas en fonction du temps réellement passé, dans le périmètre décrit.",
        "6. Facturation : [échéances]."
      ].join("\n");
    } else if (modele === "regie") {
      clause = [
        "Article [X] : Prestation en régie",
        "1. La prestation est facturée au temps passé, au taux de " + tauxTxt + " de l'heure [hors taxes ou toutes taxes comprises].",
        "2. L'estimation de " + fmtH(hBasse) + " à " + fmtH(hHaute) + " (" + fmtH(hProbable) + " les plus probables) n'est pas un engagement sur le nombre d'heures.",
        "3. Le prestataire communique un relevé d'heures [chaque semaine] et prévient le client quand 80 % de l'estimation probable sont atteints.",
        "4. Le client dispose de [délai] pour contester un relevé, par écrit.",
        "5. Un changement de périmètre important est confirmé par écrit avant exécution.",
        "6. Facturation : [échéances]."
      ].join("\n");
    } else if (modele === "plafond") {
      clause = [
        "Article [X] : Régie plafonnée",
        "1. La prestation est facturée au temps passé, au taux de " + tauxTxt + " de l'heure [hors taxes ou toutes taxes comprises], sans dépasser " + fmtEur(plafond) + ".",
        "2. Le prestataire communique un relevé d'heures [chaque semaine] et prévient le client quand 80 % du plafond sont atteints.",
        "3. Au-delà du plafond, aucune heure n'est facturée sans accord écrit préalable du client.",
        "4. Le plafond couvre le périmètre décrit dans [document, version, date]. Un changement de périmètre fait l'objet d'un avenant écrit.",
        "5. Le client dispose de [délai] pour contester un relevé, par écrit.",
        "6. Facturation : [échéances]."
      ].join("\n");
    } else {
      clause = [
        "Article [X] : Forfait par phase, puis régie",
        "1. La phase 1, décrite dans [document, version, date], est facturée au forfait de " + fmtEur(forfait) + " [hors taxes ou toutes taxes comprises].",
        "2. À la fin de la phase 1, le prestataire remet [livrable] et une estimation de la phase 2 en heures.",
        "3. La phase 2 est facturée [en régie au taux de " + tauxTxt + " de l'heure, plafonnée à un montant fixé par avenant] ou [au forfait fixé par avenant], au choix du client.",
        "4. Aucune heure de la phase 2 n'est commencée sans avenant écrit.",
        "5. Le prestataire communique un relevé d'heures [chaque semaine] pour la partie en régie.",
        "6. Facturation : [échéances]."
      ].join("\n");
    }

    var actions = [];
    controles.forEach(function (c) { if (c.statut === "bad") actions.push(c.point + " : " + actionFor(c.point, role, modele)); });
    controles.forEach(function (c) { if (c.statut === "warn") actions.push(c.point + " : " + actionFor(c.point, role, modele)); });
    actions.push(role === "client" ? "Comparez les offres sur la même base : même périmètre, même hypothèses, même durée. Un forfait plus bas peut cacher un périmètre plus étroit." : "Gardez les trois estimations et leurs hypothèses dans le dossier du devis, pour pouvoir expliquer le prix si on vous le demande.");

    var message;
    if (role === "client") {
      message = [
        "Objet : Mode de facturation de votre devis",
        "",
        "Bonjour,",
        "",
        "Merci pour votre proposition. Avant de signer, pouvez-vous nous indiquer ce que couvre exactement le prix, les hypothèses retenues, et la façon dont seraient traités les changements de périmètre ? Nous souhaitons aussi savoir si un relevé d'heures ou un plafond est possible.",
        "",
        "Cordialement"
      ].join("\n");
    } else {
      message = [
        "Objet : Proposition de mode de facturation pour votre projet",
        "",
        "Bonjour,",
        "",
        "Pour votre projet, nous vous proposons " + (modele === "forfait" ? "un prix forfaitaire de " + fmtEur(forfait) : modele === "regie" ? "une facturation au temps passé à " + tauxTxt + " de l'heure, pour une estimation de " + fmtH(hBasse) + " à " + fmtH(hHaute) : modele === "plafond" ? "une facturation au temps passé à " + tauxTxt + " de l'heure, plafonnée à " + fmtEur(plafond) : "un forfait de " + fmtEur(forfait) + " pour la première phase, puis une estimation de la suite") + ". Les hypothèses sont écrites dans le devis, et tout changement de périmètre sera chiffré avant d'être exécuté. Nous restons disponibles pour en discuter.",
        "",
        "Cordialement"
      ].join("\n");
    }

    var recap = [
      "Mode de facturation : " + MODELE_LABELS[modele],
      "Estimations : " + fmtH(hBasse) + " / " + fmtH(hProbable) + " / " + fmtH(hHaute) + " au taux de " + tauxTxt,
      "Régie : " + fmtEur(regieProbable) + " au probable (" + fmtEur(regieBasse) + " à " + fmtEur(regieHaute) + ")",
      "Forfait avec " + fmtInt(reserve) + " % de réserve : " + fmtEur(forfait),
      "Régie plafonnée à +" + fmtInt(plafondPct) + " % : " + fmtEur(plafond),
      "Marge du forfait : " + fmtEur(margeProbable) + " au probable, " + fmtEur(margeHaute) + " à l'estimation haute",
      "Point mort du forfait : " + (pointMort === null ? "non calculable" : fmtH(pointMort)),
      "Changements de périmètre : " + fmtInt(changements) + " x " + fmtH(hParChg) + " = " + fmtH(heuresChg),
      "Mode suggéré : " + conseilLabel,
      "Contrôle : " + fmtInt(nbBad) + " bloquant(s), " + fmtInt(nbWarn) + " à compléter",
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      role: role, modele: modele, hBasse: hBasse, hProbable: hProbable, hHaute: hHaute, taux: taux, cout: cout,
      regieProbable: regieProbable, regieBasse: regieBasse, regieHaute: regieHaute, forfait: forfait, plafond: plafond,
      margeProbable: margeProbable, margeHaute: margeHaute, pointMort: pointMort, heuresChg: heuresChg, perteChg: perteChg, factureChg: factureChg,
      ecart: ecart, score: score, conseil: conseil, conseilLabel: conseilLabel,
      regieLabel: fmtEur(regieProbable),
      fourchetteLabel: fmtEur(regieBasse) + " à " + fmtEur(regieHaute),
      forfaitLabel: fmtEur(forfait),
      plafondLabel: fmtEur(plafond),
      margeLabel: fmtEur(margeProbable) + " puis " + fmtEur(margeHaute),
      pointMortLabel: pointMort === null ? "Non calculable" : fmtH(pointMort),
      changementLabel: fmtEur(perteChg) + " (" + fmtH(heuresChg) + ")",
      controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat, verdict: verdict,
      clause: clause, actions: actions, message: message, recap: recap, ordonne: ordonne
    };
  }
  function actionFor(point, role, modele) {
    var m = {
      "Cohérence des estimations": "refaites les trois estimations, dans l'ordre, avec les hypothèses de chacune.",
      "Périmètre": "écrivez ce qui est compris et ce qui ne l'est pas, ou proposez une première phase d'étude payante.",
      "Inconnues": "listez les inconnues dans le devis et dites qui porte le risque si elles se révèlent.",
      "Écart entre les estimations": "réduisez l'écart par une visite, un échantillon ou une phase d'étude, avant de figer un prix.",
      "Mode choisi": "changez de mode ou écrivez pourquoi vous gardez celui-ci.",
      "Réserve de risque": "relevez la réserve ou resserrez le périmètre.",
      "Marge du forfait": "relevez le prix, resserrez le périmètre ou passez en régie plafonnée.",
      "Changements de périmètre": "écrivez la règle de l'avenant (écrit, chiffré, accepté avant exécution).",
      "Suivi des heures": "mettez en place un relevé d'heures que le client peut vérifier chaque semaine.",
      "Plafond de la régie": "fixez un plafond au moins égal à la régie à l'estimation haute, ou dites comment il sera renégocié."
    };
    return m[point] || "relisez ce point avec vos hypothèses.";
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, ROLE_LABELS, MODELE_LABELS, PERIMETRE_LABELS, INCONNUES_LABELS, AVENANT_LABELS, SUIVI_LABELS, computeForfaitRegie, buildRecap, fmtEur, fmtInt, fmtH, fmtTaux, fmtPct, num, dec };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computeForfaitRegie(readForm());
      document.getElementById("regieOut").textContent = r.regieLabel;
      document.getElementById("fourchetteOut").textContent = r.fourchetteLabel;
      document.getElementById("forfaitOut").textContent = r.forfaitLabel;
      document.getElementById("plafondOut").textContent = r.plafondLabel;
      document.getElementById("margeOut").textContent = r.margeLabel;
      document.getElementById("pointMortOut").textContent = r.pointMortLabel;
      document.getElementById("changementOut").textContent = r.changementLabel;
      document.getElementById("conseilOut").textContent = r.conseilLabel;
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
      document.getElementById("recap").textContent = r.recap;
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
