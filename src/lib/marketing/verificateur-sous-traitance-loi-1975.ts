/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-sous-traitance-loi-1975";
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var ROLE_LABELS = { sousTraitant: "sous-traitant qui veut être payé", entreprisePrincipale: "entreprise principale qui sous-traite", maitreOuvrage: "maître de l'ouvrage" };
  var NATURE_LABELS = { travailSpecifique: "travail spécifique, fait pour ce chantier ou ce client", fournitureSerie: "fourniture de produits standard, sur catalogue", incertain: "mélange des deux, à qualifier" };
  var PRINCIPAL_LABELS = { entreprisePrive: "contrat d'entreprise privé", marchePublic: "marché public", ventePrincipale: "vente d'un produit fini" };
  var SECTEUR_LABELS = { btp: "bâtiment ou travaux publics", industriel: "sous-traitance industrielle", services: "autre prestation de services" };
  var RANG_LABELS = { premier: "premier rang", second: "second rang ou plus" };
  var MO_TYPE_LABELS = { entreprise: "entreprise ou personne morale", particulierLogement: "particulier qui construit son logement", acheteurPublic: "acheteur public" };
  var ACCEPTATION_LABELS = { expresse: "écrite", tacite: "tacite", informe: "maître de l'ouvrage seulement informé", aucune: "aucune" };
  var AGREMENT_LABELS = { oui: "écrit", tacite: "tacite", non: "aucun" };
  var GARANTIE_LABELS = { caution: "caution remise à temps", cautionTardive: "caution remise trop tard", delegation: "délégation du maître de l'ouvrage", delegationEP: "délégation sur un autre payeur", aucune: "ni caution ni délégation" };
  var MED_LABELS = { avecCopie: "envoyée, copie au maître de l'ouvrage", sansCopie: "envoyée, sans copie au maître de l'ouvrage", declarationCreance: "créance déclarée à la liquidation", non: "pas encore envoyée" };
  var CONNAISSANCE_LABELS = { oui: "connaît la présence du sous-traitant", non: "ignore la présence du sous-traitant" };
  var MO_MED_LABELS = { oui: "a mis l'entreprise principale en demeure", non: "n'a pas mis l'entreprise principale en demeure" };
  var RENONCIATION_LABELS = { non: "aucune renonciation", oui: "renonciation dans le sous-traité" };
  var ETRANGER_LABELS = { non: "droit français", oui: "loi étrangère" };
  var REGIME_LABELS = {
    actionDirecte: "Action directe (articles 12 et 13)",
    paiementDirect: "Paiement direct (marché public)",
    rang2Public: "Caution ou délégation (article 6)",
    hors: "Hors loi de 1975"
  };
  var DEFAULTS = {
    role: "sousTraitant", natureSousTraite: "travailSpecifique", contratPrincipal: "entreprisePrive", secteur: "btp",
    rang: "premier", moType: "entreprise", contratEtranger: "non", acceptation: "tacite", agrement: "tacite",
    garantie: "caution", moConnaissance: "oui", moMiseEnDemeure: "non", clauseRenonciation: "non",
    montantSousTraite: 14600, dejaPaye: 4380, resteDuMO: 19440, miseEnDemeure: "avecCopie", dateMiseEnDemeure: "2027-03-01"
  };
  var POINTS = [
    "Qualification", "Contrat principal", "Rang", "Acceptation", "Agrément des conditions de paiement",
    "Garantie de paiement", "Montant dû", "Mise en demeure", "Assiette (article 13)",
    "Maître de l'ouvrage (article 14-1)", "Clauses contraires", "Loi applicable"
  ];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  function num(v, min, max, def) {
    var s = String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
    var n = parseFloat(s);
    if (!isFinite(n)) return def;
    n = Math.floor(n);
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  }
  function pick(v, labels, def) { return Object.prototype.hasOwnProperty.call(labels, v) ? v : def; }
  function daysIn(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > daysIn(y, mo)) return null;
    return { y: y, m: mo, d: d };
  }
  function addMonths(dt, n) {
    var t = dt.m - 1 + n;
    var y = dt.y + Math.floor(t / 12);
    var m = ((t % 12) + 12) % 12 + 1;
    var d = Math.min(dt.d, daysIn(y, m));
    return { y: y, m: m, d: d };
  }
  function fmtDate(dt) { return (dt.d === 1 ? "1er" : String(dt.d)) + " " + MOIS[dt.m - 1] + " " + dt.y; }
  function fmtEur(n) {
    var s = String(Math.round(Math.abs(n)));
    var out = "";
    while (s.length > 3) { out = " " + s.slice(-3) + out; s = s.slice(0, -3); }
    return (n < 0 ? "\u2212" : "") + s + out + " €";
  }
  function plural(n, one, many) { return n + " " + (n > 1 ? many : one); }

  function computeSousTraitance(input) {
    var i = input || {};
    var r = {};
    r.role = pick(i.role, ROLE_LABELS, DEFAULTS.role);
    r.natureSousTraite = pick(i.natureSousTraite, NATURE_LABELS, DEFAULTS.natureSousTraite);
    r.contratPrincipal = pick(i.contratPrincipal, PRINCIPAL_LABELS, DEFAULTS.contratPrincipal);
    r.secteur = pick(i.secteur, SECTEUR_LABELS, DEFAULTS.secteur);
    r.rang = pick(i.rang, RANG_LABELS, DEFAULTS.rang);
    r.moType = pick(i.moType, MO_TYPE_LABELS, DEFAULTS.moType);
    r.contratEtranger = pick(i.contratEtranger, ETRANGER_LABELS, DEFAULTS.contratEtranger);
    r.acceptation = pick(i.acceptation, ACCEPTATION_LABELS, DEFAULTS.acceptation);
    r.agrement = pick(i.agrement, AGREMENT_LABELS, DEFAULTS.agrement);
    r.garantie = pick(i.garantie, GARANTIE_LABELS, DEFAULTS.garantie);
    r.moConnaissance = pick(i.moConnaissance, CONNAISSANCE_LABELS, DEFAULTS.moConnaissance);
    r.moMiseEnDemeure = pick(i.moMiseEnDemeure, MO_MED_LABELS, DEFAULTS.moMiseEnDemeure);
    r.clauseRenonciation = pick(i.clauseRenonciation, RENONCIATION_LABELS, DEFAULTS.clauseRenonciation);
    r.miseEnDemeure = pick(i.miseEnDemeure, MED_LABELS, DEFAULTS.miseEnDemeure);
    r.montantSousTraite = num(i.montantSousTraite === undefined ? DEFAULTS.montantSousTraite : i.montantSousTraite, 0, 999999999, 0);
    r.dejaPaye = num(i.dejaPaye === undefined ? DEFAULTS.dejaPaye : i.dejaPaye, 0, 999999999, 0);
    r.resteDuMO = num(i.resteDuMO === undefined ? DEFAULTS.resteDuMO : i.resteDuMO, 0, 999999999, 0);
    var dt = parseDate(i.dateMiseEnDemeure === undefined ? DEFAULTS.dateMiseEnDemeure : i.dateMiseEnDemeure) || parseDate(DEFAULTS.dateMiseEnDemeure);
    r.dateMiseEnDemeureFmt = fmtDate(dt);

    var role = r.role;
    var st = role === "sousTraitant", ep = role === "entreprisePrincipale", mo = role === "maitreOuvrage";
    var publicMarche = r.contratPrincipal === "marchePublic" || r.moType === "acheteurPublic";
    r.horsLoi = r.natureSousTraite === "fournitureSerie" || r.contratPrincipal === "ventePrincipale";
    r.sousSeuil = false;
    if (r.horsLoi) r.regime = "hors";
    else if (publicMarche && r.rang === "second") r.regime = "rang2Public";
    else if (publicMarche && r.montantSousTraite >= 600) r.regime = "paiementDirect";
    else { r.regime = "actionDirecte"; r.sousSeuil = publicMarche; }
    r.regimeLabel = REGIME_LABELS[r.regime] + (r.sousSeuil ? ", sous le seuil de 600 €" : "");
    var ad = r.regime === "actionDirecte";

    r.creance = Math.max(0, r.montantSousTraite - r.dejaPaye);
    r.assiette = ad ? Math.min(r.creance, r.resteDuMO) : (r.regime === "paiementDirect" ? r.creance : 0);
    r.creanceFmt = fmtEur(r.creance);
    r.assietteFmt = fmtEur(r.assiette);

    var ouverture = null;
    if (ad && (r.miseEnDemeure === "avecCopie" || r.miseEnDemeure === "sansCopie")) {
      ouverture = addMonths(dt, 1);
      r.ouvertureLabel = "À partir du " + fmtDate(ouverture);
      r.ouvertureFmt = fmtDate(ouverture);
    } else if (ad && r.miseEnDemeure === "declarationCreance") {
      r.ouvertureLabel = "Dès la déclaration de créance";
      r.ouvertureFmt = "dès la déclaration de créance";
    } else if (ad) {
      r.ouvertureLabel = "Pas encore ouverte";
      r.ouvertureFmt = "pas encore ouverte";
    } else if (r.regime === "paiementDirect") {
      r.ouvertureLabel = "Paiement par l'acheteur";
      r.ouvertureFmt = "paiement par l'acheteur, selon le marché";
    } else {
      r.ouvertureLabel = "Sans objet";
      r.ouvertureFmt = "sans objet";
    }
    r.montantLabel = r.regime === "hors" || r.regime === "rang2Public" ? "Sans objet" : r.assietteFmt;

    var C = [];
    function add(point, statut, texte, action) { C.push({ point: point, statut: statut, texte: texte, action: action || "" }); }

    // 1. Qualification
    if (r.natureSousTraite === "travailSpecifique") add(POINTS[0], "ok", "Travail spécifique : c'est un contrat d'entreprise, la qualité de sous-traitant au sens de l'article 1er est possible (Cass. com., 17 mars 1998, n° 95-17.997).");
    else if (r.natureSousTraite === "fournitureSerie") add(POINTS[0], st ? "bad" : "info", "Fourniture de produits définis à l'avance : c'est une vente, pas une sous-traitance. Ni action directe, ni caution de l'article 14. La protection passe par l'acompte, la réserve de propriété et les pénalités de retard.", "Ne comptez pas sur la loi de 1975 : prévoyez un acompte, une réserve de propriété et des pénalités de retard dans le devis.");
    else add(POINTS[0], "warn", "Qualification à trancher : ce qui compte est le caractère spécifique du travail, pas le nom du contrat. Écrivez dans le devis ce qui est fait sur mesure (plans, cotes, finition, pose).", "Décrivez dans le devis ce qui est fait sur mesure pour ce chantier ou ce client.");

    // 2. Contrat principal
    if (r.contratPrincipal === "entreprisePrive") add(POINTS[1], "ok", "Contrat d'entreprise privé : c'est le titre III de la loi, l'action directe (article 11).");
    else if (r.contratPrincipal === "marchePublic") add(POINTS[1], "info", "Marché public : paiement direct par l'acheteur du sous-traitant direct accepté (article 6 de la loi ; articles L2193-10 et suivants du code de la commande publique). La présentation passe par la déclaration de sous-traitance (DC4).");
    else add(POINTS[1], st ? "bad" : "info", "Le contrat principal est une vente : la loi de 1975 ne joue pas, même si votre travail est spécifique (Cass. com., 26 juin 2019, n° 17-30.970).", "Contrat principal de vente : sécurisez le paiement par l'acompte et la réserve de propriété, pas par l'action directe.");

    // 3. Rang
    if (r.rang === "premier") add(POINTS[2], "ok", "Sous-traitant direct de l'entreprise principale.");
    else if (publicMarche && !r.horsLoi) add(POINTS[2], "warn", "Second rang en marché public : le paiement direct ne vise que le sous-traitant direct (article 6). Votre donneur d'ordre doit vous remettre une caution ou une délégation de paiement (article 6, dernier alinéa).", "Demandez à votre donneur d'ordre la caution ou la délégation de l'article 6, avant de commencer.");
    else add(POINTS[2], "info", "Article 2 : le sous-traitant qui sous-traite à son tour est entrepreneur principal à l'égard de ses propres sous-traitants. C'est lui qui doit faire accepter et garantir le second rang.");

    // 4. Acceptation
    if (r.horsLoi) add(POINTS[3], "info", "Sans objet hors loi de 1975.");
    else if (r.acceptation === "expresse") add(POINTS[3], "ok", "Acceptation écrite : la preuve est simple. Gardez l'acte daté et signé.");
    else if (r.acceptation === "tacite") add(POINTS[3], "warn", "Une acceptation tacite doit résulter d'actes sans équivoque du maître de l'ouvrage (Cass. 3e civ., 18 juillet 1984, n° 83-11.401 ; 28 janvier 2021, n° 19-26.271). Elle se discute. Un écrit reste possible après la signature du sous-traité (Cass. ch. mixte, 13 mars 1981, n° 80-12.125).", "Obtenez une acceptation écrite du maître de l'ouvrage, même tardive.");
    else {
      var accTxt = r.acceptation === "informe" ? "Savoir n'est pas accepter : une attitude passive du maître de l'ouvrage ne vaut pas acceptation (Cass. 3e civ., 18 juillet 1984, n° 83-11.401). " : "Le sous-traitant n'a jamais été présenté au maître de l'ouvrage. ";
      if (st) accTxt += "Sans acceptation ni agrément, pas d'action directe. Demandez à l'entreprise principale de vous présenter ; à défaut, la jurisprudence vous laisse résilier le sous-traité (Cass. 3e civ., 10 novembre 2021, n° 20-19.372).";
      else if (ep) accTxt += "Article 3 : vous restez tenu envers le sous-traitant mais ne pouvez pas lui opposer le sous-traité. Le défaut d'acceptation est puni d'une amende de 7 500 € (article L8271-1-1 du code du travail).";
      else accTxt += "Si vous connaissez sa présence, l'article 14-1 vous oblige à mettre l'entreprise principale en demeure de le présenter.";
      add(POINTS[3], "bad", accTxt, st ? "Demandez par écrit à l'entreprise principale de vous présenter au maître de l'ouvrage." : (ep ? "Présentez le sous-traitant au maître de l'ouvrage et obtenez son acceptation écrite." : "Mettez l'entreprise principale en demeure de présenter le sous-traitant."));
    }

    // 5. Agrément
    if (r.horsLoi) add(POINTS[4], "info", "Sans objet hors loi de 1975.");
    else if (r.agrement === "oui") add(POINTS[4], "ok", "Conditions de paiement agréées par écrit (article 3).");
    else if (r.agrement === "tacite") add(POINTS[4], "warn", "Agrément tacite : à prouver, comme l'acceptation (paiements faits directement, échéancier validé par écrit). L'action directe suppose l'acceptation et l'agrément (articles 3 et 12).", "Faites agréer par écrit l'échéancier et le délai de paiement du sous-traité.");
    else add(POINTS[4], "bad", "Conditions de paiement jamais agréées : l'action directe suppose l'acceptation et l'agrément (articles 3 et 12).", "Faites agréer les conditions de paiement par le maître de l'ouvrage.");

    // 6. Garantie
    if (r.horsLoi) add(POINTS[5], "info", "Sans objet hors loi de 1975.");
    else if (r.regime === "paiementDirect") add(POINTS[5], "info", "Paiement direct par l'acheteur : la caution de l'article 14 n'est pas exigée pour le sous-traitant direct. Toute renonciation au paiement direct est réputée non écrite (article 7).");
    else if (r.garantie === "caution") add(POINTS[5], "ok", "Caution personnelle et solidaire remise à temps : avant le sous-traité, ou avant le début des travaux s'ils ont commencé plus tôt (Cass. 3e civ., 21 janvier 2021, n° 19-22.219).");
    else if (r.garantie === "delegation") add(POINTS[5], "ok", "Délégation du maître de l'ouvrage au sous-traitant, à concurrence des prestations exécutées (article 14). La délégation est aujourd'hui régie par l'article 1336 du code civil.");
    else {
      var gTxt;
      if (r.garantie === "cautionTardive") gTxt = "Caution remise trop tard : le sous-traité est nul (Cass. 3e civ., 21 janvier 2021, n° 19-22.219). C'est une nullité relative : seul le sous-traitant l'invoque, et il peut confirmer le contrat (Cass. 3e civ., 23 novembre 2023, n° 22-21.463).";
      else if (r.garantie === "delegationEP") gTxt = "Une délégation qui ne désigne pas le maître de l'ouvrage n'est pas la délégation de l'article 14 (Cass. 3e civ., 23 novembre 2023, n° 22-17.027). Il faut une caution, ou une délégation sur le maître de l'ouvrage.";
      else gTxt = "Ni caution ni délégation : le sous-traité est nul à la demande du sous-traitant (article 14). S'il a été exécuté, le sous-traitant récupère le coût réel des travaux, hors reprise de ses propres malfaçons (Cass. 3e civ., 8 juin 2023, n° 22-13.330).";
      if (st) gTxt += " La nullité ne vous autorise pas à quitter le chantier sans la demander (Cass. 3e civ., 10 novembre 2021, n° 20-19.372).";
      add(POINTS[5], mo ? "warn" : "bad", gTxt, st ? "Exigez la caution ou la délégation avant le début des travaux, ou décidez avec votre conseil d'invoquer la nullité." : (ep ? "Remettez une caution bancaire avant la signature du sous-traité, ou faites signer une délégation par le maître de l'ouvrage." : "Exigez de l'entreprise principale la justification de la caution (article 14-1)."));
    }

    // 7. Montant
    if (r.montantSousTraite === 0) add(POINTS[6], "warn", "Montant du sous-traité non renseigné : impossible de chiffrer ce qui reste dû.", "Renseignez le montant du sous-traité.");
    else if (r.sousSeuil) add(POINTS[6], "info", "Sous-traité de moins de 600 euros en marché public : pas de paiement direct (article 6, alinéa 2 ; article R2193-10 du code de la commande publique, seuil exprimé toutes taxes comprises). Le titre III s'applique alors. Reste dû : " + r.creanceFmt + ".");
    else if (r.creance === 0) add(POINTS[6], "info", "Au vu des montants saisis, rien n'est plus dû au sous-traitant.");
    else add(POINTS[6], "ok", "Reste dû par l'entreprise principale : " + r.creanceFmt + " (sous-traité de " + fmtEur(r.montantSousTraite) + ", moins " + fmtEur(r.dejaPaye) + " déjà payés).");

    // 8. Mise en demeure
    if (!ad) add(POINTS[7], "info", r.regime === "paiementDirect" ? "Paiement direct : les demandes de paiement suivent les modalités du marché et du code de la commande publique (articles R2193-10 et suivants), sans mise en demeure préalable de l'entreprise principale." : "Sans objet : pas d'action directe dans ce cas.");
    else if (r.creance === 0) add(POINTS[7], "info", "Rien n'est dû : pas de mise en demeure à envoyer.");
    else if (r.miseEnDemeure === "avecCopie") add(POINTS[7], "ok", "Mise en demeure du " + r.dateMiseEnDemeureFmt + ", copie au maître de l'ouvrage : l'action directe est ouverte un mois après, soit à partir du " + r.ouvertureFmt + " si rien n'est payé (article 12).");
    else if (r.miseEnDemeure === "sansCopie") add(POINTS[7], "warn", "Copie au maître de l'ouvrage manquante : envoyez-la en recommandé. C'est sa réception qui fixe ce qu'il doit encore (article 13).", "Envoyez au maître de l'ouvrage, en recommandé, une copie de la mise en demeure.");
    else if (r.miseEnDemeure === "declarationCreance") add(POINTS[7], "ok", "Entreprise principale en liquidation sans mise en demeure préalable : la déclaration de créance vaut mise en demeure (Cass. 3e civ., 13 juillet 2023, n° 21-23.747). Prévenez aussi le maître de l'ouvrage par écrit.");
    else add(POINTS[7], st ? "bad" : "warn", "Pas de mise en demeure : pas d'action directe. Il faut une lettre recommandée à l'entreprise principale, avec copie au maître de l'ouvrage (article 12).", "Envoyez la mise en demeure en recommandé à l'entreprise principale, copie au maître de l'ouvrage.");

    // 9. Assiette
    if (!ad || r.creance === 0) add(POINTS[8], "info", "Sans objet.");
    else if (r.resteDuMO === 0) add(POINTS[8], st ? "bad" : "warn", "Le maître de l'ouvrage ne doit plus rien à l'entreprise principale : l'action directe ne porte sur rien (article 13). Restent la caution, et la responsabilité du maître de l'ouvrage s'il a manqué à l'article 14-1.", "Appelez la caution, ou examinez avec votre conseil la responsabilité du maître de l'ouvrage.");
    else if (r.resteDuMO < r.creance) add(POINTS[8], "warn", "Action limitée à " + r.assietteFmt + " : ce que le maître de l'ouvrage doit encore à l'entreprise principale à la réception de la copie (article 13). Le reste, " + fmtEur(r.creance - r.assiette) + ", se réclame à l'entreprise principale ou à la caution.", "Réclamez le solde non couvert à l'entreprise principale ou à la caution.");
    else add(POINTS[8], "ok", "Action possible jusqu'à " + r.assietteFmt + " : la créance tient dans ce que le maître de l'ouvrage doit encore (article 13). Elle ne vise que les prestations du sous-traité dont il profite. Une retenue de garantie ne se libère qu'après réception des travaux (Cass. 3e civ., 8 novembre 2018, n° 17-20.677).");

    // 10. Maître de l'ouvrage (14-1)
    var pbAcc = r.acceptation === "informe" || r.acceptation === "aucune" || r.agrement === "non";
    var pbGar = (r.garantie === "aucune" || r.garantie === "cautionTardive" || r.garantie === "delegationEP") && (ad || r.regime === "rang2Public");
    if (r.horsLoi) add(POINTS[9], "info", "Sans objet hors loi de 1975.");
    else if (r.moType === "particulierLogement") add(POINTS[9], "info", "Particulier qui construit un logement pour lui ou sa famille : les obligations de l'article 14-1 ne s'appliquent pas à lui.");
    else if (r.secteur === "services") add(POINTS[9], "info", "L'article 14-1 vise les travaux de bâtiment et de travaux publics, et la sous-traitance industrielle. Pour une autre prestation, il ne s'applique pas tel quel.");
    else if (r.moConnaissance === "non") add(POINTS[9], st ? "warn" : "info", "Le maître de l'ouvrage n'est tenu que s'il connaît lui-même la présence du sous-traitant (Cass. 3e civ., 15 avril 2021, n° 19-20.424). Le moment importe peu : même après la fin des travaux (Cass. 3e civ., 11 septembre 2013, n° 12-21.077).", st ? "Écrivez au maître de l'ouvrage pour signaler votre intervention." : "");
    else if (!pbAcc && !pbGar) add(POINTS[9], "ok", "Pas de manquement visible au regard de l'article 14-1" + (r.secteur === "industriel" ? " (en sous-traitance industrielle, il joue même hors chantier)." : "."));
    else if (r.moMiseEnDemeure === "oui") add(POINTS[9], "ok", "Le maître de l'ouvrage a agi par écrit : c'est ce que l'article 14-1 lui demande.");
    else {
      var moTxt = "Le maître de l'ouvrage connaît la présence du sous-traitant" + (pbAcc ? " non accepté ou non agréé : il doit mettre l'entreprise principale en demeure de régulariser" : "") + (pbGar ? (pbAcc ? ", et" : " :") + " sans délégation, il doit exiger la justification de la caution" : "") + " (article 14-1). À défaut, sa responsabilité peut être engagée (Cass. 3e civ., 11 septembre 2013, n° 12-21.077).";
      add(POINTS[9], mo ? "bad" : "warn", moTxt, mo ? "Mettez l'entreprise principale en demeure par écrit (article 14-1), et gardez la preuve." : (st ? "Signalez par écrit au maître de l'ouvrage ce qui manque : il doit agir (article 14-1)." : "Régularisez avant que le maître de l'ouvrage ne vous mette en demeure."));
    }

    // 11. Clauses contraires
    if (r.clauseRenonciation === "non") add(POINTS[10], "ok", "Aucune clause ne prive le sous-traitant de ses droits.");
    else add(POINTS[10], "warn", "Toute renonciation à l'action directe ou au paiement direct est réputée non écrite (articles 7 et 12), et les clauses qui font échec à la loi sont nulles (article 15). Une mainlevée de caution consentie après coup est nulle aussi (Cass. 3e civ., 14 septembre 2017, n° 16-18.146).", "Retirez la clause de renonciation du sous-traité : elle ne vaut rien et brouille la lecture.");

    // 12. Loi applicable
    if (r.contratEtranger === "non") add(POINTS[11], "ok", "Contrats soumis au droit français.");
    else add(POINTS[11], "info", "Pour la construction d'un immeuble en France, les dispositions protectrices de la loi de 1975 s'appliquent comme loi de police, malgré le choix d'une loi étrangère (Cass. ch. mixte, 30 novembre 2007, n° 06-14.006). Ailleurs, il faut un lien de rattachement avec la France (Cass. com., 20 avril 2017, n° 15-16.922).");

    r.controles = C;
    r.nbOk = 0; r.nbWarn = 0; r.nbBad = 0; r.nbInfo = 0;
    for (var k = 0; k < C.length; k++) {
      if (C[k].statut === "ok") r.nbOk++;
      else if (C[k].statut === "warn") r.nbWarn++;
      else if (C[k].statut === "bad") r.nbBad++;
      else r.nbInfo++;
    }
    r.etat = r.nbBad > 0 ? "bad" : (r.nbWarn > 0 ? "warn" : "ok");
    r.statutLabel = STATUT_LABELS[r.etat];

    var suite = "";
    if (ad && r.creance > 0) {
      if (r.miseEnDemeure === "non") suite = " Action directe pas encore ouverte : il faut d'abord une mise en demeure.";
      else if (r.miseEnDemeure === "declarationCreance") suite = " Action directe ouverte dès la déclaration de créance, jusqu'à " + r.assietteFmt + ".";
      else suite = " Action directe à partir du " + r.ouvertureFmt + ", jusqu'à " + r.assietteFmt + ".";
    } else if (r.regime === "paiementDirect") suite = " Paiement direct par l'acheteur pour " + r.creanceFmt + ".";
    else if (r.regime === "hors") suite = " La loi de 1975 ne protège pas ce contrat.";
    else if (r.regime === "rang2Public") suite = " Pas d'action directe : la protection passe par la caution ou la délégation.";
    if (r.etat === "bad") r.verdict = plural(r.nbBad, "point bloquant", "points bloquants") + (r.nbWarn ? " et " + plural(r.nbWarn, "point à compléter", "points à compléter") : "") + " : en l'état, le paiement du sous-traitant n'est pas sécurisé." + suite;
    else if (r.etat === "warn") r.verdict = "Aucun point bloquant, mais " + plural(r.nbWarn, "point à compléter", "points à compléter") + "." + suite;
    else r.verdict = "Dossier cohérent avec la loi de 1975." + suite;

    // Clauses
    var L = [];
    if (r.regime === "hors") {
      L.push("La loi de 1975 ne s'appliquant pas, clauses de protection à prévoir dans le devis (à adapter) :");
      L.push("Article 1. Objet. [Fournisseur] livre à [client] [désignation des produits], conformément au devis n° [numéro] accepté le [date].");
      L.push("Article 2. Acompte. Un acompte de [x] % est payable à la commande ; la fabrication ou la livraison commence à son encaissement.");
      L.push("Article 3. Réserve de propriété. Les produits restent la propriété de [fournisseur] jusqu'au paiement complet du prix.");
      L.push("Article 4. Paiement. Le solde est payable à [x] jours à compter de la facture. Pénalités de retard et indemnité forfaitaire pour frais de recouvrement selon les conditions générales.");
      L.push("Article 5. Livraison. Les délais sont indicatifs sauf mention contraire ; le transfert des risques a lieu à [la livraison / l'enlèvement].");
      L.push("Article 6. Conditions générales. Les conditions générales jointes au devis s'appliquent ; le client déclare les avoir reçues et acceptées.");
    } else {
      L.push("Clauses à reprendre dans le sous-traité ou dans le devis du sous-traitant (à adapter) :");
      L.push("Article 1. Qualité de sous-traitant. [Sous-traitant] exécute pour [entreprise principale] [nature des travaux], au titre du contrat conclu avec [maître de l'ouvrage] pour [chantier ou commande]. Le présent contrat est un sous-traité au sens de la loi n° 75-1334 du 31 décembre 1975.");
      L.push("Article 2. Acceptation et agrément. [Entreprise principale] présente [sous-traitant] au maître de l'ouvrage" + (publicMarche ? " par une déclaration de sous-traitance (DC4) ou un acte spécial" : "") + " et fait agréer les conditions de paiement ci-dessous avant le début des travaux. Elle remet au sous-traitant une copie de l'acte d'acceptation.");
      if (r.regime === "paiementDirect") L.push("Article 3. Paiement direct. Le sous-traitant accepté est payé directement par l'acheteur pour la part du marché qu'il exécute. Toute renonciation au paiement direct est réputée non écrite (article 7).");
      else L.push("Article 3. Garantie de paiement. Avant la signature du présent contrat, et en tout cas avant le début des travaux, [entreprise principale] remet une caution personnelle et solidaire d'un établissement habilité, ou une délégation de paiement signée par le maître de l'ouvrage, à concurrence du montant des prestations (article 14).");
      L.push("Article 4. Conditions de paiement. Montant : " + (r.montantSousTraite > 0 ? fmtEur(r.montantSousTraite) : "[montant] €") + ". Échéances : [acompte, situations, solde]. Délai : [x] jours à compter de [la facture]. Pénalités de retard et indemnité forfaitaire selon les conditions générales.");
      if (r.regime === "paiementDirect") L.push("Article 5. Demandes de paiement. Le sous-traitant adresse ses demandes de paiement selon les modalités du marché ; [entreprise principale] les vise ou les refuse par écrit dans le délai prévu.");
      else L.push("Article 5. Action directe. À défaut de paiement un mois après une mise en demeure, dont copie est adressée au maître de l'ouvrage, le sous-traitant peut agir directement contre celui-ci (articles 12 et 13). Toute renonciation à l'action directe est réputée non écrite.");
      L.push("Article 6. Pièces. [Entreprise principale] communique au sous-traitant, à sa demande, l'acte d'acceptation, l'agrément des conditions de paiement et " + (r.regime === "paiementDirect" ? "les pièces du marché utiles au paiement direct." : "l'acte de caution ou de délégation."));
    }
    r.clause = L.join("\n");
    r.articles = 6;

    // Actions
    var A = [];
    for (var a = 0; a < C.length; a++) if ((C[a].statut === "bad" || C[a].statut === "warn") && C[a].action) A.push(C[a].action);
    for (var b = 0; b < C.length; b++) if ((C[b].statut === "bad" || C[b].statut === "warn") && !C[b].action) A.push("Point « " + C[b].point + " » : à revoir avec votre conseil.");
    A.push("Gardez ensemble le devis accepté, le sous-traité, l'acte d'acceptation, la caution ou la délégation, et les lettres recommandées avec leurs accusés de réception.");
    r.actions = A;

    // Message
    var msg;
    if (st && ad && r.creance > 0 && (r.miseEnDemeure === "non" || r.miseEnDemeure === "sansCopie")) {
      msg = "Objet : mise en demeure de payer, sous-traité du [date]\n\nMadame, Monsieur,\n\nAu titre du sous-traité du [date] pour [chantier], vous restez devoir " + r.creanceFmt + ". Je vous mets en demeure de régler cette somme.\n\nÀ défaut de paiement dans un délai d'un mois, j'exercerai l'action directe prévue par l'article 12 de la loi n° 75-1334 du 31 décembre 1975 contre le maître de l'ouvrage, à qui une copie de la présente est adressée.\n\n[Signature]";
    } else if (st && ad && r.creance > 0) {
      msg = "Objet : action directe du sous-traitant, loi n° 75-1334 du 31 décembre 1975\n\nMadame, Monsieur,\n\nJ'interviens sur [chantier] comme sous-traitant de [entreprise principale]. Celle-ci ne m'a pas réglé " + r.creanceFmt + " malgré " + (r.miseEnDemeure === "declarationCreance" ? "la déclaration de ma créance à sa liquidation" : "la mise en demeure du " + r.dateMiseEnDemeureFmt + ", dont vous avez reçu copie") + ".\n\nJe vous demande de me régler directement cette somme, dans la limite de ce que vous devez encore à [entreprise principale] (articles 12 et 13).\n\n[Signature]";
    } else if (st) {
      msg = "Objet : présentation au maître de l'ouvrage et garantie de paiement\n\nBonjour,\n\nAvant de commencer [travaux], merci de me présenter au maître de l'ouvrage et de faire agréer nos conditions de paiement (article 3 de la loi n° 75-1334 du 31 décembre 1975), puis de me remettre " + (r.regime === "paiementDirect" ? "une copie de la déclaration de sous-traitance acceptée." : "la caution bancaire ou la délégation de paiement prévue par l'article 14.") + "\n\nBien cordialement,\n[Signature]";
    } else if (ep) {
      msg = "Objet : présentation d'un sous-traitant, loi n° 75-1334 du 31 décembre 1975\n\nMadame, Monsieur,\n\nPour [chantier], je vous présente [sous-traitant] pour [travaux sous-traités], pour un montant de " + (r.montantSousTraite > 0 ? fmtEur(r.montantSousTraite) : "[montant] €") + ". Conditions de paiement : [échéances et délai].\n\nMerci de me retourner l'acte d'acceptation signé, avec votre agrément de ces conditions de paiement" + (r.regime === "paiementDirect" ? " (déclaration de sous-traitance jointe)." : ".") + "\n\n[Signature]";
    } else {
      msg = "Objet : sous-traitant présent sur le chantier, article 14-1 de la loi n° 75-1334 du 31 décembre 1975\n\nMadame, Monsieur,\n\nJ'ai constaté l'intervention de [sous-traitant] sur [chantier]. Je vous mets en demeure, dans un délai de [x] jours, de me le présenter et de faire agréer ses conditions de paiement, puis de justifier de la caution remise à ce sous-traitant, sauf délégation de paiement.\n\n[Signature]";
    }
    r.message = msg;
    r.recap = buildRecap(r);
    return r;
  }

  function buildRecap(r) {
    return [
      "Vérification sous-traitance (loi n° 75-1334 du 31 décembre 1975)",
      "Position : " + ROLE_LABELS[r.role],
      "Contrat principal : " + PRINCIPAL_LABELS[r.contratPrincipal] + " ; travail : " + NATURE_LABELS[r.natureSousTraite],
      "Régime : " + r.regimeLabel,
      "Acceptation : " + ACCEPTATION_LABELS[r.acceptation] + " ; agrément : " + AGREMENT_LABELS[r.agrement],
      "Garantie : " + GARANTIE_LABELS[r.garantie],
      "Créance : " + r.creanceFmt + " (sous-traité " + fmtEur(r.montantSousTraite) + ", payé " + fmtEur(r.dejaPaye) + ")",
      "Ouverture : " + r.ouvertureLabel + " ; montant visé : " + r.montantLabel,
      "Mise en demeure : " + MED_LABELS[r.miseEnDemeure] + " (" + r.dateMiseEnDemeureFmt + ")",
      "Contrôles : " + r.nbOk + " conformes, " + r.nbWarn + " à compléter, " + r.nbBad + " bloquants, " + r.nbInfo + " informations",
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");
  }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, REGIME_LABELS, ROLE_LABELS, NATURE_LABELS, PRINCIPAL_LABELS, SECTEUR_LABELS, RANG_LABELS, MO_TYPE_LABELS, ACCEPTATION_LABELS, AGREMENT_LABELS, GARANTIE_LABELS, MED_LABELS, CONNAISSANCE_LABELS, MO_MED_LABELS, RENONCIATION_LABELS, ETRANGER_LABELS, computeSousTraitance, buildRecap, fmtEur, fmtDate, addMonths, parseDate, num };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  function readForm() {
    var o = {};
    for (var k in DEFAULTS) {
      var el = document.getElementById(k);
      if (!el) continue;
      o[k] = el.value;
    }
    return o;
  }
function render() {
    var r = computeSousTraitance(readForm());
    document.getElementById("regimeOut").textContent = r.regimeLabel;
    document.getElementById("montantOut").textContent = r.montantLabel;
    document.getElementById("ouvertureOut").textContent = r.ouvertureLabel;
    document.getElementById("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
    var v = document.getElementById("verdict");
    v.textContent = r.verdict;
    v.className = "alert " + r.etat;
    var tb = document.getElementById("controles");
    tb.innerHTML = "";
    for (var i = 0; i < r.controles.length; i++) {
      var c = r.controles[i];
      var tr = document.createElement("tr");
      if (c.statut === "warn") tr.className = "weak";
      if (c.statut === "bad") tr.className = "cur";
      var td1 = document.createElement("td"); td1.textContent = c.point;
      var td2 = document.createElement("td"); td2.textContent = STATUT_LABELS[c.statut];
      var td3 = document.createElement("td"); td3.textContent = c.texte;
      tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
      tb.appendChild(tr);
    }
    document.getElementById("clause").textContent = r.clause;
    var ul = document.getElementById("actions");
    ul.innerHTML = "";
    for (var j = 0; j < r.actions.length; j++) {
      var li = document.createElement("li");
      li.textContent = r.actions[j];
      ul.appendChild(li);
    }
    document.getElementById("message").textContent = r.message;
    document.getElementById("recap").textContent = r.recap;
  }

  
    document.getElementById("form").addEventListener("input", render);
    document.getElementById("form").addEventListener("change", render);
    document.querySelectorAll("button.copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-target");
        var t = document.getElementById(id);
        if (t && navigator.clipboard) navigator.clipboard.writeText(t.textContent || "");
      });
    });
    render();
  
  return built.snapshot();
}
