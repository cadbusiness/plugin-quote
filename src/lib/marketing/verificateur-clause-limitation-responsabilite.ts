/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SEUIL_REPERE_PCT = 10;
  var DELAI_MIN_MOIS = 12;
  var DELAI_MAX_MOIS = 120;
  var PRESCRIPTION_ANS = 5;
  var SLUG = "verificateur-clause-limitation-responsabilite";
  var ROLE_LABELS = { prestataire: "prestataire qui rédige la clause", client: "client qui relit la clause" };
  var CLIENT_LABELS = { pro: "client professionnel", consommateur: "client consommateur" };
  var PRESTATION_LABELS = { service: "prestation de service seule", mixte: "fourniture d'un produit et installation", vente: "vente d'un produit seul" };
  var PLAFOND_LABELS = { pct: "pourcentage du prix du devis", fixe: "montant fixe", assurance: "montant garanti par l'assurance", aucun: "pas de plafond chiffré", exclusionTotale: "aucune responsabilité" };
  var EXCLUSIONS_LABELS = { liste: "préjudices exclus nommés", indirects: "formule « dommages indirects exclus »", aucune: "aucune exclusion" };
  var FAUTE_LOURDE_LABELS = { reserve: "faute lourde ou dolosive réservée", silence: "rien sur la faute lourde", couverte: "clause étendue à la faute lourde" };
  var OBLIGATION_LABELS = { preservee: "engagement principal indemnisé dans la limite du plafond", videe: "engagement principal vidé de sa substance" };
  var PERSONNES_LABELS = { hors: "dommages aux personnes hors plafond", inclus: "dommages aux personnes plafonnés" };
  var ACCEPTATION_LABELS = { signe: "clause écrite dans le devis signé", cgvSignees: "CGV remises et acceptées dans le devis signé", cgvVerso: "CGV au verso ou en lien, sans mention d'acceptation", aucune: "CGV jamais transmises" };
  var CGV_CLIENT_LABELS = { non: "pas de clause contraire chez le client", contraire: "clause contraire dans les conditions d'achat du client" };
  var NEGOCIATION_LABELS = { negociee: "clause négociée", adhesion: "CGV standard non négociables" };
  var DEPART_LABELS = { connaissance: "à compter de la connaissance des faits", fait: "à compter du fait générateur ou de la livraison" };
  var FAUTE_LABELS = { simple: "erreur ordinaire", lourde: "faute lourde ou dolosive établie" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var DEFAULTS = {
    role: "prestataire", client: "pro", prestation: "mixte", montant: 24000,
    plafondType: "pct", plafondPct: 100, plafondFixe: 10000, exclusions: "indirects", fauteLourde: "silence",
    obligationEssentielle: "preservee", personnes: "hors", acceptation: "cgvSignees", cgvClient: "non", negociation: "adhesion",
    assurance: 500000, delaiMois: 12, delaiDepart: "connaissance", dommageDirect: 18000, pertesExploitation: 42000, faute: "simple"
  };

  function num(v, min, max, fallback) {
    var n = typeof v === "number" ? v : parseFloat(String(v === undefined || v === null ? "" : v).replace(/[\s\u00a0]/g, "").replace(",", "."));
    if (!isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }
  function pick(v, obj, fallback) { return Object.prototype.hasOwnProperty.call(obj, v) ? v : fallback; }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) { return groupe(Math.round(n)) + "\u00a0€"; }
  function fmtPct(ratio) { return String(Math.round(ratio * 1000) / 10).replace(".", ",") + "\u00a0%"; }
  function pluriel(n, un, plusieurs) { return n + " " + (n > 1 ? plusieurs : un); }
  // Plafond en euros, ou null s'il n'y a pas de plafond chiffré. « Aucune responsabilité » vaut 0.
  function plafondDe(type, montant, pct, fixe, assurance) {
    if (type === "pct") return Math.round(montant * pct / 100);
    if (type === "fixe") return fixe;
    if (type === "assurance") return assurance;
    if (type === "exclusionTotale") return 0;
    return null;
  }

  function computeLimitation(input) {
    var d = {};
    for (var key in DEFAULTS) d[key] = input && input[key] !== undefined ? input[key] : DEFAULTS[key];
    var role = pick(d.role, ROLE_LABELS, "prestataire");
    var client = pick(d.client, CLIENT_LABELS, "pro");
    var prestation = pick(d.prestation, PRESTATION_LABELS, "service");
    var plafondType = pick(d.plafondType, PLAFOND_LABELS, "aucun");
    var exclusions = pick(d.exclusions, EXCLUSIONS_LABELS, "aucune");
    var fauteLourde = pick(d.fauteLourde, FAUTE_LOURDE_LABELS, "silence");
    var obligation = pick(d.obligationEssentielle, OBLIGATION_LABELS, "preservee");
    var personnes = pick(d.personnes, PERSONNES_LABELS, "hors");
    var acceptation = pick(d.acceptation, ACCEPTATION_LABELS, "aucune");
    var cgvClient = pick(d.cgvClient, CGV_CLIENT_LABELS, "non");
    var negociation = pick(d.negociation, NEGOCIATION_LABELS, "adhesion");
    var depart = pick(d.delaiDepart, DEPART_LABELS, "connaissance");
    var faute = pick(d.faute, FAUTE_LABELS, "simple");
    var montant = num(d.montant, 0, 1000000000, 0);
    var pct = num(d.plafondPct, 0, 1000, 0);
    var fixe = num(d.plafondFixe, 0, 1000000000, 0);
    var assurance = num(d.assurance, 0, 10000000000, 0);
    var delai = num(d.delaiMois, 0, 240, 0);
    var direct = num(d.dommageDirect, 0, 1000000000, 0);
    var pertes = num(d.pertesExploitation, 0, 1000000000, 0);
    var plafond = plafondDe(plafondType, montant, pct, fixe, assurance);
    var ratio = plafond !== null && montant > 0 ? plafond / montant : null;
    var controles = [], actions = [], raisonsEcart = [];
    function ajoute(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    // 1. Client
    if (client === "pro") ajoute("Client professionnel", "ok", "Client professionnel : la clause est en principe admise entre professionnels, sous réserve des points suivants.");
    else { ajoute("Client professionnel", "bad", "Client consommateur : une clause qui supprime ou réduit son droit à réparation est présumée abusive de manière irréfragable et interdite (article R. 212-1, 6° du code de la consommation). Elle est réputée non écrite."); actions.push("Retirer la clause de limitation du devis destiné au particulier."); raisonsEcart.push("client consommateur"); }

    // 2. Acceptation
    if (acceptation === "signe") ajoute("Acceptation de la clause (article 1119)", "ok", "Clause écrite dans le devis signé : la signature prouve que le client la connaissait et l'a acceptée.");
    else if (acceptation === "cgvSignees") ajoute("Acceptation de la clause (article 1119)", "ok", "CGV remises avec le devis, et le devis signé dit les accepter : connaissance et acceptation sont établies. Gardez la version datée des CGV transmises.");
    else if (acceptation === "cgvVerso") { ajoute("Acceptation de la clause (article 1119)", "warn", "CGV au verso ou en lien, sans mention d'acceptation : le client pourra soutenir qu'il ne les a pas acceptées. Les conditions générales n'ont effet que si elles ont été portées à sa connaissance et acceptées (article 1119)."); actions.push("Ajouter au devis la mention « J'ai pris connaissance et j'accepte les conditions générales jointes », avec leur date de version."); }
    else { ajoute("Acceptation de la clause (article 1119)", "bad", "CGV jamais transmises : elles n'ont pas d'effet à l'égard du client (article 1119). La limitation ne joue pas."); actions.push("Transmettre les CGV avec le devis et faire signer la mention d'acceptation, ou écrire la clause dans le devis lui-même."); raisonsEcart.push("CGV non acceptées"); }

    // 3. Conditions d'achat du client
    if (cgvClient === "non") ajoute("Conditions d'achat du client", "ok", "Pas de clause contraire dans les conditions d'achat du client.");
    else if (acceptation === "signe") ajoute("Conditions d'achat du client", "info", "Les conditions d'achat du client disent autre chose, mais la clause figure dans les conditions particulières du devis signé : en cas de discordance, les conditions particulières l'emportent sur les conditions générales (article 1119, alinéa 3).");
    else { ajoute("Conditions d'achat du client", "bad", "Deux conditions générales incompatibles : les clauses incompatibles sont sans effet (article 1119, alinéa 2). La limitation disparaît et le droit commun s'applique."); actions.push("Écrire la clause dans les conditions particulières du devis signé, pour qu'elle l'emporte sur les conditions d'achat du client."); raisonsEcart.push("conditions générales contraires"); }

    // 4. Plafond chiffré
    if (plafondType === "exclusionTotale") { ajoute("Plafond chiffré", "bad", "« Aucune responsabilité » revient à priver de substance l'engagement principal : la clause est réputée non écrite (article 1170) et le prestataire répond de tout le dommage prouvé."); actions.push("Remplacer « aucune responsabilité » par un plafond chiffré, par exemple le prix du devis (" + fmtEur(montant) + ")."); raisonsEcart.push("exclusion totale"); }
    else if (plafondType === "aucun") ajoute("Plafond chiffré", "info", "Pas de plafond chiffré : seules les exclusions de préjudices limitent la réparation.");
    else ajoute("Plafond chiffré", "ok", "Plafond de " + fmtEur(plafond) + (plafondType === "pct" ? ", soit " + pct + "\u00a0% du prix du devis." : (plafondType === "assurance" ? ", égal au montant garanti par l'assurance." : ", montant fixe.")));

    // 5. Niveau du plafond
    if (plafond === null || plafondType === "exclusionTotale") ajoute("Niveau du plafond", "info", "Sans objet : pas de plafond chiffré à situer par rapport au prix.");
    else if (ratio === null) ajoute("Niveau du plafond", "info", "Prix du devis à 0 € : impossible de situer le plafond par rapport au prix.");
    else if (ratio * 100 < SEUIL_REPERE_PCT) { ajoute("Niveau du plafond", "warn", "Plafond de " + fmtEur(plafond) + ", soit " + fmtPct(ratio) + " du prix. Sous 10\u00a0%, repère de cet outil et non seuil légal, le plafond risque d'être jugé dérisoire. Dans l'affaire Faurecia (Cass. com., 29 juin 2010, n° 09-11.841), un plafond égal au prix payé n'a pas été jugé dérisoire."); actions.push("Relever le plafond, idéalement au niveau du prix du devis, ou écrire dans le devis la contrepartie qui le justifie."); }
    else if (ratio < 1) ajoute("Niveau du plafond", "info", "Plafond de " + fmtEur(plafond) + ", soit " + fmtPct(ratio) + " du prix : sous le prix, la clause sera plus discutée. Écrivez dans le devis la contrepartie consentie (remise, garantie, prix).");
    else ajoute("Niveau du plafond", "ok", "Plafond de " + fmtEur(plafond) + ", soit " + fmtPct(ratio) + " du prix : un plafond au moins égal au prix est le plus facile à défendre.");

    // 6. Engagement principal
    if (obligation === "preservee") ajoute("Engagement principal (article 1170)", "ok", "Le manquement à l'engagement principal reste indemnisé dans la limite du plafond : la clause ne le prive pas de sa substance.");
    else { ajoute("Engagement principal (article 1170)", "bad", "La clause contredit la portée de l'engagement principal : elle est réputée non écrite (article 1170, dans la lignée de l'arrêt Chronopost, Cass. com., 22 octobre 1996, n° 93-18.632)."); actions.push("Rétablir la réparation du manquement à l'engagement principal, dans la limite du plafond."); raisonsEcart.push("engagement principal vidé"); }

    // 7. Faute lourde
    if (fauteLourde === "reserve") ajoute("Faute lourde ou dolosive", "ok", "La clause réserve la faute lourde et le dol : elle écrit ce que le juge appliquerait de toute façon.");
    else if (fauteLourde === "silence") { ajoute("Faute lourde ou dolosive", "info", "La clause n'en parle pas : elle serait quand même écartée en cas de faute lourde ou dolosive. L'écrire évite une discussion inutile."); actions.push("Facultatif : écrire que la limitation ne s'applique pas en cas de faute lourde ou dolosive."); }
    else { ajoute("Faute lourde ou dolosive", "warn", "La clause prétend s'appliquer même en cas de faute lourde ou dolosive : cette partie ne produira pas d'effet et donne au client un argument contre le reste. Retirez-la."); actions.push("Supprimer la phrase qui étend la clause à la faute lourde ou dolosive."); }

    // 8. Préjudices exclus
    if (exclusions === "liste") ajoute("Préjudices exclus", "ok", "Préjudices exclus nommés un par un : chacun sait ce qui est couvert et ce qui ne l'est pas.");
    else if (exclusions === "indirects") { ajoute("Préjudices exclus", "warn", "La formule « dommages indirects » est floue : une perte de production causée par une panne est souvent présentée comme un dommage direct. Nommez les préjudices exclus."); actions.push("Remplacer « dommages indirects » par la liste des préjudices exclus : perte d'exploitation, de production, de chiffre d'affaires ou de marge, de données."); }
    else ajoute("Préjudices exclus", "info", "Aucune exclusion : tous les préjudices prouvés sont indemnisables, dans la limite du plafond.");

    // 9. Personnes et produits
    if (prestation !== "service") {
      if (personnes === "inclus") { ajoute("Dommages aux personnes", "bad", "Un produit est fourni : les clauses qui écartent ou limitent la responsabilité du fait des produits défectueux sont interdites, sauf entre professionnels pour les dommages aux biens qui ne servent pas principalement à un usage privé (article 1245-14). Les dommages aux personnes ne peuvent pas être plafonnés."); actions.push("Sortir les dommages aux personnes du plafond."); }
      else ajoute("Dommages aux personnes", "ok", "Dommages aux personnes laissés hors plafond : cohérent avec l'article 1245-14 pour la partie produit.");
    } else {
      if (personnes === "inclus") { ajoute("Dommages aux personnes", "info", "Prestation de service seule : l'article 1245-14 ne s'applique pas. Laisser les dommages aux personnes hors plafond reste le choix le plus prudent."); actions.push("Envisager de sortir les dommages aux personnes du plafond."); }
      else ajoute("Dommages aux personnes", "ok", "Dommages aux personnes laissés hors plafond.");
    }

    // 10. Contrat d'adhésion
    if (negociation === "negociee") ajoute("Contrat d'adhésion (articles 1171 et 1190)", "ok", "Clause négociée : le contrôle du déséquilibre significatif de l'article 1171 vise les clauses non négociables d'un contrat d'adhésion. Gardez la trace des échanges.");
    else if (ratio !== null && ratio < 1) { ajoute("Contrat d'adhésion (articles 1171 et 1190)", "warn", "CGV non négociables et plafond sous le prix : le client pourra invoquer le déséquilibre significatif (article 1171), et toute ambiguïté s'interprétera contre celui qui a proposé la clause (article 1190)."); actions.push("Ouvrir la clause à la discussion et garder la trace de l'échange, ou relever le plafond au niveau du prix."); }
    else ajoute("Contrat d'adhésion (articles 1171 et 1190)", "info", "CGV non négociables : le juge peut contrôler le déséquilibre significatif (article 1171) et, dans le doute, interprète la clause contre celui qui l'a proposée (article 1190). Une rédaction précise limite ce risque.");

    // 11. Délai pour agir
    if (delai === 0) ajoute("Délai pour agir (article 2254)", "info", "Pas de délai contractuel : prescription de " + PRESCRIPTION_ANS + " ans à compter du jour où le client a connu ou aurait dû connaître les faits (article 2224).");
    else if (delai < DELAI_MIN_MOIS) { ajoute("Délai pour agir (article 2254)", "bad", "Délai de " + delai + " mois : la prescription ne peut pas être réduite à moins d'un an (article 2254). Ce point de la clause ne tiendrait pas, et le délai redeviendrait celui du droit commun."); actions.push("Fixer le délai entre 12 mois et 10 ans, à compter de la connaissance des faits."); }
    else if (delai > DELAI_MAX_MOIS) { ajoute("Délai pour agir (article 2254)", "bad", "Délai de " + delai + " mois : la prescription ne peut pas être étendue à plus de dix ans (article 2254)."); actions.push("Fixer le délai entre 12 mois et 10 ans, à compter de la connaissance des faits."); }
    else if (depart === "fait" && delai <= DELAI_MIN_MOIS) { ajoute("Délai pour agir (article 2254)", "bad", "Délai de " + delai + " mois à compter du fait générateur : la Cour de cassation a réputé non écrite une telle clause, car le point de départ doit rester la connaissance des faits (Cass. 1re civ., 13 mars 2024, n° 22-12.345)."); actions.push("Faire courir le délai à compter du jour où le client a connu ou aurait dû connaître les faits."); }
    else if (depart === "fait") { ajoute("Délai pour agir (article 2254)", "warn", "Délai de " + delai + " mois à compter du fait générateur : si le client découvre le problème tard, le délai réel peut tomber sous un an et ce point de la clause tomber avec lui."); actions.push("Faire courir le délai à compter du jour où le client a connu ou aurait dû connaître les faits."); }
    else ajoute("Délai pour agir (article 2254)", "ok", "Délai de " + delai + " mois à compter de la connaissance des faits : dans les bornes de l'article 2254 (entre un an et dix ans).");

    // 12. Assurance
    if (assurance === 0) { ajoute("Assurance", "warn", "Aucun plafond d'assurance indiqué : lisez l'attestation de responsabilité civile professionnelle avant de fixer le plafond de la clause."); actions.push("Demander l'attestation d'assurance RC professionnelle et y lire le plafond par sinistre."); }
    else if (plafondType === "exclusionTotale") ajoute("Assurance", "info", "Sans objet tant que la clause est réputée non écrite : le sinistre se règle au droit commun, dans la limite de " + fmtEur(assurance) + " d'assurance par sinistre.");
    else if (plafond === null) ajoute("Assurance", "info", "Sans plafond chiffré, tout sinistre au-delà de " + fmtEur(assurance) + " d'assurance par sinistre reste à la charge du prestataire.");
    else if (plafond > assurance) { ajoute("Assurance", "warn", "Le plafond (" + fmtEur(plafond) + ") dépasse l'assurance (" + fmtEur(assurance) + " par sinistre) : " + fmtEur(plafond - assurance) + " resteraient à la charge du prestataire dans le pire cas."); actions.push("Ramener le plafond sous le plafond d'assurance, ou augmenter la garantie."); }
    else ajoute("Assurance", "ok", "Le plafond (" + fmtEur(plafond) + ") reste sous l'assurance (" + fmtEur(assurance) + " par sinistre).");

    // Sinistre type
    if (faute === "lourde") raisonsEcart.push("faute lourde ou dolosive");
    var ecartee = raisonsEcart.length > 0;
    var total = direct + pertes;
    var exclus = !ecartee && exclusions === "liste" ? pertes : 0;
    var base = total - exclus;
    var plafondApplique = ecartee ? null : (plafondType === "aucun" ? null : plafond);
    var indemnisation = plafondApplique === null ? base : Math.min(base, plafondApplique);
    var siIndirect = !ecartee && exclusions === "indirects" ? (plafondApplique === null ? direct : Math.min(direct, plafondApplique)) : null;
    var horsAssurance = Math.max(0, indemnisation - assurance);
    var resteClient = total - indemnisation;
    var lignes = [
      { label: "Préjudice réclamé (dommage direct + pertes d'exploitation)", montant: fmtEur(total) },
      { label: "Préjudices exclus par la clause", montant: ecartee ? "0\u00a0€ (clause écartée : " + raisonsEcart.join(", ") + ")" : fmtEur(exclus) },
      { label: "Base indemnisable", montant: fmtEur(base) },
      { label: "Plafond appliqué", montant: plafondApplique === null ? "aucun" : fmtEur(plafondApplique) },
      { label: "À payer par le prestataire avec la clause", montant: fmtEur(indemnisation) }
    ];
    if (siIndirect !== null) lignes.push({ label: "Si le juge range les pertes d'exploitation parmi les dommages indirects", montant: fmtEur(siIndirect) });
    lignes.push({ label: "Part au-delà de l'assurance du prestataire", montant: fmtEur(horsAssurance) });
    lignes.push({ label: "Reste à la charge du client", montant: fmtEur(resteClient) });

    var nbBad = 0, nbWarn = 0, nbOk = 0, nbInfo = 0;
    controles.forEach(function (c) { if (c.statut === "bad") nbBad++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "ok") nbOk++; else nbInfo++; });
    var scenario = ecartee ? "Sur le sinistre type, la limitation ne jouerait pas (" + raisonsEcart.join(", ") + ") : jusqu'à " + fmtEur(total) + " réclamables, à prouver." : "Sur le sinistre type : " + fmtEur(indemnisation) + " à payer au lieu de " + fmtEur(total) + " réclamés.";
    var etat, statutLabel, verdict;
    if (nbBad > 0) { etat = "bad"; statutLabel = "Clause fragile"; verdict = pluriel(nbBad, "point bloquant", "points bloquants") + " à corriger avant d'envoyer ou de signer le devis. " + scenario; }
    else if (nbWarn > 0) { etat = "warn"; statutLabel = "À compléter"; verdict = "Aucun point bloquant, mais " + pluriel(nbWarn, "point à compléter", "points à compléter") + " avant la signature. " + scenario; }
    else { etat = "ok"; statutLabel = "Clause solide"; verdict = "Clause solide sur les douze points vérifiés. " + scenario; }

    var plafondLabel = plafondType === "pct" ? fmtEur(plafond) + " (" + pct + "\u00a0% du prix)" : (plafondType === "fixe" ? fmtEur(plafond) : (plafondType === "assurance" ? fmtEur(plafond) + " (montant assuré)" : (plafondType === "aucun" ? "aucun" : "0\u00a0€ (aucune responsabilité)")));

    // Clause proposée, corrigée des points bloquants
    var clause;
    if (client === "consommateur") {
      clause = "Client consommateur : pas de clause de limitation à proposer. Une telle clause est présumée abusive de manière irréfragable (article R. 212-1, 6° du code de la consommation). Décrivez plutôt avec précision la prestation, ses limites techniques et vos garanties.";
    } else {
      var cl = [];
      var plafondPropose = plafond === null || plafondType === "exclusionTotale" ? montant : plafond;
      if (plafondType === "assurance") cl.push("La responsabilité de [prestataire] au titre du présent devis, toutes causes confondues, est limitée au montant garanti par son assurance de responsabilité civile professionnelle, soit " + fmtEur(plafondPropose) + " par sinistre à la date du devis.");
      else if (plafondType === "pct") cl.push("La responsabilité de [prestataire] au titre du présent devis, toutes causes confondues, est limitée à " + fmtEur(plafondPropose) + ", soit " + pct + "\u00a0% du prix du devis.");
      else if (plafondType === "fixe") cl.push("La responsabilité de [prestataire] au titre du présent devis, toutes causes confondues, est limitée à " + fmtEur(plafondPropose) + ".");
      else cl.push("La responsabilité de [prestataire] au titre du présent devis, toutes causes confondues, est limitée au prix du devis, soit " + fmtEur(plafondPropose) + ".");
      if (exclusions !== "aucune") cl.push("Sont exclues de toute indemnisation la perte d'exploitation, la perte de production, la perte de chiffre d'affaires ou de marge et la perte de données.");
      cl.push("Ces limitations ne s'appliquent ni en cas de faute lourde ou dolosive, ni aux dommages causés aux personnes.");
      cl.push("Elles laissent entière l'obligation de [prestataire] de réaliser [engagement principal du devis] ; son manquement est réparé dans la limite du plafond ci-dessus.");
      cl.push("Les parties reconnaissent que le prix du devis tient compte de cette répartition des risques.");
      if (delai > 0) cl.push("Toute action en responsabilité contre [prestataire] se prescrit par " + Math.min(DELAI_MAX_MOIS, Math.max(DELAI_MIN_MOIS, delai)) + " mois à compter du jour où le client a connu ou aurait dû connaître les faits lui permettant d'agir.");
      cl.push("La présente clause figure dans les conditions particulières du devis signé et prévaut sur toute clause contraire des conditions générales d'achat du client.");
      clause = "Responsabilité\n" + cl.map(function (t, i) { return (i + 1) + ". " + t; }).join("\n");
    }

    var aTraiter = controles.filter(function (c) { return c.statut === "bad" || c.statut === "warn"; });
    var message;
    if (role === "prestataire") {
      if (client === "consommateur") message = "Bonjour,\n\nVous trouverez ci-joint notre devis de " + fmtEur(montant) + ". Il décrit précisément la prestation, ses limites techniques et nos garanties. N'hésitez pas à nous poser vos questions avant de le signer.\n\nBien cordialement,";
      else message = "Bonjour,\n\nVous trouverez ci-joint notre devis de " + fmtEur(montant) + ". Sa clause de responsabilité prévoit un plafond de " + fmtEur(plafond === null || plafondType === "exclusionTotale" ? montant : plafond) + (exclusions !== "aucune" ? ", exclut les pertes d'exploitation, de production, de chiffre d'affaires et de données" : "") + ", et ne s'applique ni à la faute lourde ni aux dommages causés aux personnes" + (delai > 0 ? ". Le délai pour agir est de " + Math.min(DELAI_MAX_MOIS, Math.max(DELAI_MIN_MOIS, delai)) + " mois à compter de la connaissance des faits" : "") + ".\n\nSi l'un de ces points pose problème pour votre activité, dites-le-nous avant la signature : nous pouvons en discuter, et revoir le prix si le plafond change.\n\nBien cordialement,";
    } else {
      if (aTraiter.length) message = "Bonjour,\n\nAvant de signer votre devis de " + fmtEur(montant) + ", nous souhaitons revoir la clause de responsabilité :\n" + aTraiter.map(function (c) { return "- " + c.point + " : " + STATUT_LABELS[c.statut].toLowerCase(); }).join("\n") + "\n\nPouvez-vous nous proposer une version modifiée, et nous transmettre votre attestation d'assurance de responsabilité civile professionnelle ?\n\nBien cordialement,";
      else message = "Bonjour,\n\nNous avons relu la clause de responsabilité de votre devis de " + fmtEur(montant) + " : elle nous convient. Pouvez-vous nous transmettre votre attestation d'assurance de responsabilité civile professionnelle, avec le plafond par sinistre ?\n\nBien cordialement,";
    }

    var recap = [
      "Clause de limitation de responsabilité : contrôle du devis",
      "Position : " + ROLE_LABELS[role],
      "Client : " + CLIENT_LABELS[client] + ", " + PRESTATION_LABELS[prestation],
      "Devis : " + fmtEur(montant),
      "Plafond : " + plafondLabel,
      "Clause : " + EXCLUSIONS_LABELS[exclusions] + ", " + FAUTE_LOURDE_LABELS[fauteLourde] + ", " + PERSONNES_LABELS[personnes] + ", " + ACCEPTATION_LABELS[acceptation],
      "Délai pour agir : " + (delai === 0 ? "droit commun, " + PRESCRIPTION_ANS + " ans" : delai + " mois " + DEPART_LABELS[depart]),
      "Statut : " + statutLabel + " (" + pluriel(nbBad, "bloquant", "bloquants") + ", " + nbWarn + " à compléter, " + pluriel(nbOk, "conforme", "conformes") + ", " + nbInfo + " pour information)",
      "Sinistre type : " + fmtEur(total) + " réclamés, " + fmtEur(indemnisation) + " à payer avec la clause" + (ecartee ? " (clause écartée)" : ""),
      "Au-delà de l'assurance : " + fmtEur(horsAssurance),
      "Points à traiter : " + (aTraiter.length ? aTraiter.map(function (c) { return c.point; }).join(" ; ") : "aucun"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      role: role, client: client, prestation: prestation, plafondType: plafondType, exclusions: exclusions, montant: montant, pct: pct, fixe: fixe, assurance: assurance, delaiMois: delai,
      plafond: plafond, ratio: ratio, plafondLabel: plafondLabel, controles: controles, nbBad: nbBad, nbWarn: nbWarn, nbOk: nbOk, nbInfo: nbInfo, etat: etat, statutLabel: statutLabel, verdict: verdict,
      ecartee: ecartee, raisonsEcart: raisonsEcart, total: total, exclus: exclus, base: base, plafondApplique: plafondApplique, indemnisation: indemnisation, siIndirect: siIndirect, horsAssurance: horsAssurance, resteClient: resteClient, lignes: lignes,
      clause: clause, actions: actions, message: message, recap: recap
    };
  }
  function buildRecap(input) { return computeLimitation(input).recap; }

export { SEUIL_REPERE_PCT, DELAI_MIN_MOIS, DELAI_MAX_MOIS, PRESCRIPTION_ANS, SLUG, ROLE_LABELS, CLIENT_LABELS, PRESTATION_LABELS, PLAFOND_LABELS, EXCLUSIONS_LABELS, FAUTE_LOURDE_LABELS, OBLIGATION_LABELS, PERSONNES_LABELS, ACCEPTATION_LABELS, CGV_CLIENT_LABELS, NEGOCIATION_LABELS, DEPART_LABELS, FAUTE_LABELS, STATUT_LABELS, DEFAULTS, computeLimitation, buildRecap, plafondDe, fmtEur, fmtPct };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = Object.keys(DEFAULTS);
    function read() { var o = {}; ids.forEach(function (k) { o[k] = $(k).value; }); return o; }
    function render() {
      var r = computeLimitation(read());
      $("plafond").textContent = r.plafondLabel;
      $("indemnisation").textContent = fmtEur(r.indemnisation);
      $("exposition").textContent = fmtEur(r.total);
      $("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("controles"); tb.innerHTML = "";
      r.controles.forEach(function (c) {
        var tr = document.createElement("tr");
        if (c.statut === "bad") tr.className = "cur"; else if (c.statut === "warn") tr.className = "weak";
        [c.point, STATUT_LABELS[c.statut], c.texte].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
        tb.appendChild(tr);
      });
      var ts = $("sinistre"); ts.innerHTML = "";
      r.lignes.forEach(function (l) {
        var tr = document.createElement("tr");
        [l.label, l.montant].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
        ts.appendChild(tr);
      });
      $("clause").textContent = r.clause;
      var ul = $("actions"); ul.innerHTML = "";
      (r.actions.length ? r.actions : ["Rien à corriger dans cette configuration."]).forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
      $("message").textContent = r.message;
      $("recap").textContent = r.recap;
    }
    document.querySelectorAll("#form input, #form select").forEach(function (el) {
      el.addEventListener("input", render); el.addEventListener("change", render);
    });
    document.querySelectorAll("button.copy").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = $(b.getAttribute("data-target")).textContent;
        if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { b.textContent = "Copié"; setTimeout(function () { b.textContent = "Copier"; }, 1500); });
      });
    });
    render();
  
  return built.snapshot();
}
