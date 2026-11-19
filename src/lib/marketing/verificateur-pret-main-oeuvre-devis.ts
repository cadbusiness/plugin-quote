/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-pret-main-oeuvre-devis";
  var STATUT_LABELS = { ok: "Conforme", warn: "À surveiller", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Cadre de l'opération",
    "Objet et livrable",
    "Mode de prix",
    "Encadrement et ordres au quotidien",
    "Horaires, congés et intégration",
    "Matériel et outils",
    "Savoir-faire propre",
    "Choix des personnes",
    "But lucratif",
    "Formalités de mise à disposition"
  ];
  var LABEL_SETS = {
    cadre: { classique: "Entreprise classique", ett: "Travail temporaire, temps partagé ou portage", l8241_3: "Dispositif de l'article L8241-3" },
    objet: { prestation: "Prestation ou travaux définis", assistance: "Assistance technique ou régie", mad: "Mise à disposition de personnel" },
    livrable: { defini: "Livrable défini", partiel: "Objet vague", aucun: "Aucun livrable" },
    prix: { forfait: "Forfait", unites: "Unités d'œuvre", temps_objet: "Temps passé sur un objet défini", heure_personne: "Taux par personne présente" },
    encadrement: { prestataire: "Votre référent", mixte: "Votre référent et coordination du client", client: "Le client" },
    ordres: { prestataire: "Vous", client: "Le client" },
    horaires: { prestataire: "Vous", client: "Le client" },
    integration: { non: "Non", oui: "Oui" },
    materiel: { prestataire: "Vous", mixte: "Partagé", client: "Le client" },
    savoirFaire: { specifique: "Spécifique", proche: "Proche, avec un apport propre", identique: "Identique" },
    choixPersonnes: { prestataire: "Vous", client: "Le client" },
    formalites: { complet: "Toutes faites", partiel: "En partie", aucun: "Aucune" }
  };
  var DEFAULTS = {
    cadre: "classique", objet: "assistance", livrable: "aucun", prix: "heure_personne", dureeMois: "6", nbPersonnes: "2",
    encadrement: "client", ordres: "client", horaires: "client", integration: "oui", materiel: "client", savoirFaire: "identique",
    choixPersonnes: "client", formalites: "aucun", salaireBrut: "2600", tauxCharges: "42", fraisMensuels: "150", prixMensuel: "5760"
  };
  var POIDS = {
    livrable: { defini: 0, partiel: 1, aucun: 2 },
    prix: { forfait: 0, unites: 0, temps_objet: 1, heure_personne: 2 },
    encadrement: { prestataire: 0, mixte: 1, client: 3 },
    ordres: { prestataire: 0, client: 2 },
    horaires: { prestataire: 0, client: 1 },
    integration: { non: 0, oui: 2 },
    materiel: { prestataire: 0, mixte: 0, client: 1 },
    savoirFaire: { specifique: 0, proche: 1, identique: 3 },
    choixPersonnes: { prestataire: 0, client: 1 }
  };
  var SCORE_MAX = 18;
  var SEUIL_ELEVE = 9;
  var SEUIL_SURVEILLER = 4;
  var DUREE_MAX_L8241_3 = 36;
  var AMENDE_BASE = 30000;
  var NIVEAU_LABELS = { faible: "Faible", surveiller: "À surveiller", eleve: "Élevé", hors_champ: "Hors champ", mad: "Sans objet (mise à disposition)" };

  function clean(v) { return String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", "."); }
  function dec(v, max) {
    var n = parseFloat(clean(v));
    if (!isFinite(n) || n < 0) n = 0;
    if (n > max) n = max;
    return Math.round(n * 100);
  }
  function ent(v, max) {
    var n = parseFloat(clean(v));
    if (!isFinite(n) || n < 0) n = 0;
    if (n > max) n = max;
    return Math.floor(n);
  }
  function pick(set, v, def) { return Object.prototype.hasOwnProperty.call(LABEL_SETS[set], v) ? v : def; }
  function normalize(raw) {
    var r = raw || {};
    var o = {};
    ["cadre", "objet", "livrable", "prix", "encadrement", "ordres", "horaires", "integration", "materiel", "savoirFaire", "choixPersonnes", "formalites"].forEach(function (k) {
      o[k] = pick(k, r[k], DEFAULTS[k]);
    });
    o.dureeMois = ent(r.dureeMois, 120);
    o.nbPersonnes = ent(r.nbPersonnes, 50);
    o.salaireC = dec(r.salaireBrut, 100000);
    o.tauxBp = dec(r.tauxCharges, 100);
    o.fraisC = dec(r.fraisMensuels, 100000);
    o.prixC = dec(r.prixMensuel, 1000000);
    return o;
  }
  function groupe(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function fmtEur(c) {
    var neg = c < 0;
    var a = Math.abs(Math.round(c));
    var e = Math.floor(a / 100);
    var ct = a % 100;
    var s = groupe(e) + (ct ? "," + (ct < 10 ? "0" : "") + ct : "") + " €";
    return (neg ? "-" : "") + s;
  }
  function fmtPct(bp) {
    var e = Math.floor(bp / 100);
    var r = bp % 100;
    return e + (r ? "," + (r % 10 === 0 ? String(r / 10) : (r < 10 ? "0" : "") + r) : "") + " %";
  }
  function pluriel(n, s, p) { return n + " " + (n > 1 ? p : s); }
  function joinFr(arr) {
    if (!arr.length) return "";
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(", ") + " et " + arr[arr.length - 1];
  }

  function computePret(raw) {
    var x = normalize(raw);
    var horsChamp = x.cadre === "ett";
    var mad = !horsChamp && x.objet === "mad";
    var chargesC = Math.round(x.salaireC * x.tauxBp / 10000);
    var coutC = x.salaireC + chargesC + x.fraisC;
    var ecartC = x.prixC - coutC;
    var ecartTotalC = ecartC * x.nbPersonnes * x.dureeMois;
    var w = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    w[1] = POIDS.livrable[x.livrable];
    w[2] = POIDS.prix[x.prix];
    w[3] = POIDS.encadrement[x.encadrement] + POIDS.ordres[x.ordres];
    w[4] = POIDS.horaires[x.horaires] + POIDS.integration[x.integration] + (x.dureeMois > 12 ? 1 : 0);
    w[5] = POIDS.materiel[x.materiel];
    w[6] = POIDS.savoirFaire[x.savoirFaire];
    w[7] = POIDS.choixPersonnes[x.choixPersonnes];
    var score = w[1] + w[2] + w[3] + w[4] + w[5] + w[6] + w[7];
    var niveau = horsChamp ? "hors_champ" : mad ? "mad" : score >= SEUIL_ELEVE ? "eleve" : score >= SEUIL_SURVEILLER ? "surveiller" : "faible";
    var c = [];
    function add(statut, texte) { c.push({ point: POINTS[c.length], statut: statut, texte: texte }); }
    function indice(i, textes) {
      var st = w[i] === 0 ? "ok" : w[i] === 1 ? "warn" : (score >= SEUIL_ELEVE ? "bad" : "warn");
      add(st, textes);
    }
    var ecartTxt = fmtEur(ecartC) + " par personne et par mois";
    var ecartTotTxt = fmtEur(ecartTotalC) + " sur " + pluriel(x.dureeMois, "mois", "mois") + " et " + pluriel(x.nbPersonnes, "personne", "personnes");

    if (horsChamp) {
      add("info", "Travail temporaire, temps partagé ou portage salarial : l'interdiction de l'article L8241-1 ne vise pas ces régimes, qui ont leurs propres contrats et obligations. L'outil ne les vérifie pas.");
      for (var i = 1; i < 10; i++) add("info", "Sans objet dans un régime autorisé de mise à disposition. Les indices ne servent qu'à distinguer une prestation d'une fourniture de personnel.");
    } else if (mad) {
      if (x.cadre === "l8241_3") {
        if (x.dureeMois > DUREE_MAX_L8241_3) add("bad", "Dispositif de l'article L8241-3 : la mise à disposition ne peut pas dépasser trois ans. Vous avez indiqué " + x.dureeMois + " mois.");
        else add("info", "Dispositif de l'article L8241-3 : prêteur entreprise ou groupe d'au moins 5 000 salariés, bénéficiaire jeune entreprise, PME de moins de 250 salariés ou organisme d'intérêt général, hors même groupe, trois ans au plus. Vérifiez que vous y entrez.");
      } else {
        add("info", "Mise à disposition entre entreprises : permise si elle n'a pas de but lucratif (article L8241-2).");
      }
      add("info", "Dans une mise à disposition, le salarié travaille pour l'entreprise utilisatrice : l'absence de livrable est normale. Ce qui compte, c'est le prix et les formalités.");
      add("info", "Le prix d'une mise à disposition se limite au salaire, aux charges sociales et aux frais remboursés : le mode de prix commercial ne joue pas ici.");
      add("info", "Le salarié mis à disposition travaille sous la direction de l'entreprise utilisatrice : c'est l'objet même de l'opération.");
      add("info", "Horaires et poste sont précisés dans l'avenant au contrat de travail du salarié.");
      add("info", "Le matériel peut être fourni par l'entreprise utilisatrice dans une mise à disposition.");
      add("info", "Le savoir-faire n'est pas une condition d'une mise à disposition sans but lucratif.");
      add("info", "L'identité et la qualification du salarié figurent dans la convention de mise à disposition.");
      if (coutC === 0) add("warn", "Coût non renseigné : indiquez le salaire, les charges et les frais pour vérifier le prix.");
      else if (ecartC > 0) add("bad", "Vous facturez " + ecartTxt + " de plus que le coût (" + ecartTotTxt + ") : c'est un but lucratif au sens de l'article L8241-1.");
      else if (ecartC < 0 && x.cadre === "l8241_3") add("ok", "Facturé sous le coût : permis dans le dispositif de l'article L8241-3, même à zéro.");
      else if (ecartC < 0) add("warn", "Facturé " + fmtEur(-ecartC) + " sous le coût par personne et par mois : le ministère du Travail indique que la facturation ne peut pas être inférieure au coût, hors dispositif L8241-3.");
      else add("ok", "Prix égal au coût refacturable : pas de but lucratif.");
      if (x.cadre === "l8241_3") add("info", "Les formalités de l'article L8241-2 ne s'appliquent pas à ce dispositif ; ses conditions sont fixées par décret.");
      else if (x.formalites === "complet") add("ok", "Accord du salarié, convention de mise à disposition, avenant au contrat et consultation des CSE : faits.");
      else if (x.formalites === "partiel") add("warn", "Formalités incomplètes : il faut l'accord du salarié, une convention, un avenant signé et la consultation préalable des CSE (article L8241-2).");
      else add("bad", "Aucune formalité : sans accord du salarié, convention, avenant et consultation des CSE, la mise à disposition n'est pas régulière (article L8241-2).");
    } else {
      if (x.cadre === "l8241_3") add("info", "Le dispositif de l'article L8241-3 vise les mises à disposition. Pour une prestation, il ne joue pas : ce sont les indices ci-dessous qui comptent.");
      else add("info", "Entreprise classique : l'interdiction de l'article L8241-1 s'applique si l'opération n'est en réalité qu'une fourniture de personnel, quel que soit le titre du devis.");
      indice(1, x.livrable === "defini" ? "Le devis décrit un résultat vérifiable : c'est la marque d'une prestation." : x.livrable === "partiel" ? "Objet vague : décrivez le périmètre, les livrables et la façon de constater le résultat." : "Aucun livrable : le devis vend des personnes et une durée. Décrivez ce qui doit être fait et livré.");
      indice(2, x.prix === "forfait" ? "Forfait pour un résultat : le prix paie une prestation." : x.prix === "unites" ? "Unités d'œuvre : le prix est rattaché à des interventions ou des livrables définis." : x.prix === "temps_objet" ? "Temps passé sur un objet défini : possible, avec un relevé détaillé de ce qui a été fait." : "Taux par personne présente : le prix ressemble à un salaire chargé. Préférez un forfait ou des unités d'œuvre.");
      indice(3, w[3] === 0 ? "Votre référent organise le travail et reçoit les demandes du client." : w[3] === 1 ? "Coordination du client sur place : acceptable si elle reste organisationnelle et si les ordres passent par votre référent." : "Le client dirige vos salariés au quotidien : c'est l'indice que les juges regardent en premier. Désignez un responsable chez vous.");
      indice(4, w[4] === 0 ? "Horaires et congés gérés chez vous, équipe distincte." : "À revoir : " + joinFr([x.horaires === "client" ? "horaires et congés fixés par le client" : "", x.integration === "oui" ? "salariés fondus dans une équipe du client" : "", x.dureeMois > 12 ? "mission de plus de douze mois" : ""].filter(Boolean)) + ".");
      indice(5, x.materiel === "client" ? "Le client fournit l'outillage : vous n'apportez que des personnes. Fournissez vos outils et vos équipements." : x.materiel === "mixte" ? "Partage normal : le client fournit l'accès, le local ou l'énergie, vous l'outillage." : "Vous fournissez l'outillage et les équipements.");
      indice(6, x.savoirFaire === "specifique" ? "Savoir-faire distinct de celui des salariés du client." : x.savoirFaire === "proche" ? "Métier proche de celui du client : mettez en avant votre apport propre (méthode, audit, dossier, garantie)." : "Vos salariés feront la même chose que ceux du client : un personnel qui sert de volant exclut tout savoir-faire spécifique.");
      indice(7, x.choixPersonnes === "client" ? "Le client désigne vos salariés : annoncez une qualification et un effectif, gardez le choix et le remplacement." : "Vous choisissez et pouvez remplacer les intervenants.");
      if (coutC === 0) add("info", "Coût non renseigné : l'écart entre prix et coût n'est pas calculé.");
      else add("info", "Écart prix moins coût : " + ecartTxt + " (" + ecartTotTxt + "). C'est votre marge, normale dans une vraie prestation. Si l'opération était requalifiée en prêt de main-d'œuvre, cet écart ferait le but lucratif.");
      add("info", "Pas de convention de mise à disposition dans une vraie prestation. Si vous assumez une mise à disposition, choisissez « Une mise à disposition de personnel assumée ».");
    }

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    c.forEach(function (k) { if (k.statut === "ok") nbOk++; else if (k.statut === "warn") nbWarn++; else if (k.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad ? "bad" : nbWarn ? "warn" : "ok";

    var verdict;
    if (horsChamp) verdict = "Hors champ : travail temporaire, temps partagé ou portage. L'outil ne vérifie pas ces régimes.";
    else if (mad) {
      if (nbBad) verdict = (ecartC > 0 && coutC > 0) ? "Mise à disposition à but lucratif : vous facturez " + ecartTxt + " de plus que le coût. Refacturez au coût ou proposez une prestation définie." : "Mise à disposition irrégulière : " + pluriel(nbBad, "point bloquant", "points bloquants") + " à régler avant de commencer.";
      else if (nbWarn) verdict = "Mise à disposition à compléter : " + pluriel(nbWarn, "point", "points") + " à surveiller.";
      else verdict = "Mise à disposition sans but lucratif : prix égal au coût et formalités en ordre.";
    } else {
      var base = "(" + score + " sur " + SCORE_MAX + ")";
      if (niveau === "eleve") verdict = "Indices élevés " + base + " : tel qu'il est décrit, ce devis ressemble à une fourniture de personnel. Redéfinissez l'objet, l'encadrement et le prix.";
      else if (niveau === "surveiller") verdict = "Indices à surveiller " + base + " : la prestation tient, mais " + pluriel(nbWarn + nbBad, "point est", "points sont") + " à corriger.";
      else verdict = "Indices faibles " + base + " : le devis décrit une prestation." + (nbWarn ? " " + pluriel(nbWarn, "point reste", "points restent") + " à surveiller." : "") + " Vérifiez que le terrain suit.";
    }

    var actions = [];
    if (horsChamp) {
      actions.push("Utilisez les contrats propres à votre régime (contrat de mise à disposition, contrat de mission).");
    } else if (mad) {
      if (ecartC > 0 && coutC > 0) actions.push("Ramenez le prix à " + fmtEur(coutC) + " par personne et par mois, ou transformez la demande en prestation définie.");
      if (ecartC < 0 && x.cadre !== "l8241_3") actions.push("Remontez le prix au coût refacturable : " + fmtEur(coutC) + " par personne et par mois.");
      if (x.cadre !== "l8241_3" && x.formalites !== "complet") actions.push("Faites signer l'accord du salarié et l'avenant, rédigez la convention de mise à disposition et consultez les CSE avant le début.");
      if (x.cadre === "l8241_3" && x.dureeMois > DUREE_MAX_L8241_3) actions.push("Limitez la durée à trois ans.");
      actions.push("Gardez les bulletins de salaire et les notes de frais : ils prouvent le calcul du coût.");
    } else {
      if (w[1]) actions.push("Décrivez l'objet, le périmètre et les livrables, et la façon de constater le résultat.");
      if (w[2]) actions.push("Remplacez le taux par personne par un forfait ou des unités d'œuvre rattachées à des livrables.");
      if (w[3]) actions.push("Désignez un responsable de la prestation chez vous ; écrivez que les demandes du client passent par lui.");
      if (w[4]) actions.push("Gardez chez vous les horaires, les congés, les absences et les frais ; formez une équipe distincte.");
      if (w[5]) actions.push("Fournissez l'outillage, les instruments et les équipements de protection.");
      if (w[6]) actions.push("Mettez en avant ce que vous apportez en propre : méthode, audit, dossier, garantie.");
      if (w[7]) actions.push("Annoncez une qualification et un effectif, pas des noms ; gardez le droit de remplacer.");
      if (niveau === "eleve") actions.push("Si le client veut vraiment des personnes sous ses ordres, orientez-le vers l'intérim ou proposez un prêt au coût.");
      actions.push("Pendant la mission, gardez les preuves : passages du référent, comptes rendus, demandes écrites du client.");
    }
    actions.push("Pour un contrat à fort enjeu, faites relire le devis par un avocat en droit du travail.");

    var clause;
    if (horsChamp) {
      clause = [
        "Régime autorisé : travail temporaire, temps partagé ou portage salarial",
        "Ces régimes ont leurs propres contrats, que cet outil ne vérifie pas.",
        "Personnes : " + pluriel(x.nbPersonnes, "personne", "personnes") + ".",
        "Durée : " + pluriel(x.dureeMois, "mois", "mois") + ".",
        "Prix facturé : " + fmtEur(x.prixC) + " HT par personne et par mois.",
        "Coût salarial de référence : " + fmtEur(coutC) + " par personne et par mois.",
        "Écart : " + ecartTxt + ".",
        "Document à établir : le contrat propre à votre régime."
      ];
    } else if (mad) {
      clause = [
        "Mise à disposition de personnel sans but lucratif (article L8241-2 du code du travail)",
        "Personnes : " + pluriel(x.nbPersonnes, "salarié", "salariés") + ", identité et qualification précisées dans la convention.",
        "Durée : " + pluriel(x.dureeMois, "mois", "mois") + ".",
        "Facturation : salaire brut, charges sociales afférentes et frais professionnels remboursés, sans marge ni frais de gestion.",
        "Coût de référence : " + fmtEur(coutC) + " par personne et par mois (salaire " + fmtEur(x.salaireC) + ", charges " + fmtEur(chargesC) + " soit " + fmtPct(x.tauxBp) + ", frais " + fmtEur(x.fraisC) + ").",
        "Formalités : accord écrit du salarié, avenant à son contrat de travail, convention de mise à disposition, consultation des CSE.",
        "Fin : le salarié retrouve son poste ou un poste équivalent.",
        "Document à établir : une convention de mise à disposition, pas un devis commercial."
      ];
    } else {
      clause = [
        "Organisation de la prestation",
        "Objet : la prestation décrite au devis, avec ses livrables et la façon de constater le résultat.",
        "Encadrement : un responsable désigné par le prestataire organise le travail et répartit les tâches ; les demandes du client lui sont adressées.",
        "Moyens : le prestataire fournit l'outillage, les instruments et les équipements de protection ; le client fournit l'accès au site, l'énergie et un local.",
        "Personnel : effectif prévisionnel de " + pluriel(x.nbPersonnes, "personne", "personnes") + ", recrutées, rémunérées, formées et encadrées par le prestataire, qui peut remplacer un intervenant en informant le client.",
        "Horaires : fixés par le prestataire dans les plages d'ouverture du site ; congés et absences gérés par le prestataire.",
        "Durée : " + pluriel(x.dureeMois, "mois", "mois") + ", ou jusqu'à la remise des livrables.",
        "Hors périmètre : toute tâche non décrite fait l'objet d'une commande complémentaire."
      ];
    }
    clause = clause.join("\n");

    var message;
    if (horsChamp) message = "Bonjour,\n\nMerci pour votre demande. Nous vous adressons le contrat de mise à disposition correspondant, avec la durée, la qualification et le prix.\n\nCordialement,";
    else if (mad) message = "Bonjour,\n\nNous pouvons mettre " + pluriel(x.nbPersonnes, "salarié", "salariés") + " à votre disposition pendant " + pluriel(x.dureeMois, "mois", "mois") + ", sans but lucratif : nous vous refacturerons le salaire, les charges sociales et les frais professionnels, soit " + fmtEur(coutC) + " par personne et par mois, sans marge.\n\nAvant le début, il faudra l'accord écrit du salarié, une convention entre nos deux entreprises et la consultation de nos représentants du personnel. Nous vous envoyons le projet de convention.\n\nCordialement,";
    else if (niveau === "eleve") message = "Bonjour,\n\nMerci pour votre demande. Nous pouvons vous aider, mais pas sous la forme de personnes facturées à l'heure et placées sous vos ordres : le code du travail réserve cette forme aux agences d'intérim, et elle vous exposerait autant que nous.\n\nNous vous proposons une prestation définie, organisée par notre responsable, avec nos moyens, à prix forfaitaire ou par intervention. Pouvez-vous nous dire ce qui doit être réglé en priorité et comment vous constaterez que c'est fait ?\n\nCordialement,";
    else message = "Bonjour,\n\nVous trouverez notre devis pour la prestation demandée. Notre responsable organisera le travail sur place avec nos moyens ; vos demandes passeront par lui. Le devis précise les livrables et la façon de constater le résultat.\n\nCordialement,";

    var recap = [
      "Vérification prêt de main-d'œuvre (indicatif)",
      "Cadre : " + LABEL_SETS.cadre[x.cadre] + " ; objet : " + LABEL_SETS.objet[x.objet],
      "Livrable : " + LABEL_SETS.livrable[x.livrable] + " ; prix : " + LABEL_SETS.prix[x.prix],
      "Niveau d'indices : " + NIVEAU_LABELS[niveau] + (horsChamp || mad ? "" : " (" + score + " sur " + SCORE_MAX + ")"),
      "Points bloquants / à surveiller : " + nbBad + " / " + nbWarn,
      "Coût refacturable : " + fmtEur(coutC) + " par personne et par mois",
      "Prix facturé : " + fmtEur(x.prixC) + " HT par personne et par mois",
      "Écart : " + ecartTxt + ", " + fmtEur(ecartTotalC) + " sur la durée",
      "Durée et effectif : " + pluriel(x.dureeMois, "mois", "mois") + ", " + pluriel(x.nbPersonnes, "personne", "personnes"),
      "Verdict : " + verdict,
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      input: x, horsChamp: horsChamp, mad: mad, score: score, poids: w, niveau: niveau, niveauLabel: NIVEAU_LABELS[niveau] + (horsChamp || mad ? "" : " (" + score + " sur " + SCORE_MAX + ")"),
      chargesC: chargesC, coutC: coutC, ecartC: ecartC, ecartTotalC: ecartTotalC,
      coutLabel: fmtEur(coutC), prixLabel: fmtEur(x.prixC) + " HT", ecartLabel: fmtEur(ecartC), ecartTotalLabel: fmtEur(ecartTotalC),
      controles: c, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat, verdict: verdict,
      actions: actions, clause: clause, message: message, recap: recap
    };
  }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, LABEL_SETS, POIDS, SCORE_MAX, SEUIL_ELEVE, SEUIL_SURVEILLER, DUREE_MAX_L8241_3, AMENDE_BASE, NIVEAU_LABELS, computePret, normalize, fmtEur, fmtPct, dec, ent, joinFr, pluriel };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var ids = Object.keys(DEFAULTS);
    var render = function () {
      var raw = {};
      ids.forEach(function (k) { raw[k] = document.getElementById(k).value; });
      var r = computePret(raw);
      document.getElementById("niveauOut").textContent = r.niveauLabel;
      document.getElementById("coutOut").textContent = r.coutLabel;
      document.getElementById("prixOut").textContent = r.prixLabel;
      document.getElementById("ecartOut").textContent = r.ecartLabel;
      document.getElementById("ecartTotalOut").textContent = r.ecartTotalLabel;
      document.getElementById("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      var v = document.getElementById("verdict");
      v.className = "alert " + r.etat;
      v.textContent = r.verdict;
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
