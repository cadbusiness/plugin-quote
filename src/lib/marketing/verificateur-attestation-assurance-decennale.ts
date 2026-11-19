/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var AMENDE_MAX = 75000;
  var PRISON_MOIS = 6;
  var PLAFOND_R243_3 = 150000000;
  var SLUG = "verificateur-attestation-assurance-decennale";
  var ROLE_LABELS = { entreprise: "entreprise qui joint son attestation", client: "client qui vérifie l'attestation" };
  var RELATION_LABELS = { direct: "contrat direct avec le maître d'ouvrage", soustraitant: "sous-traitance" };
  var OUVRAGE_LABELS = {
    batiment: "bâtiment : construction, extension ou rénovation",
    accessoire: "ouvrage de la liste, accessoire à un bâtiment",
    exclu: "ouvrage exclu et non accessoire (article L. 243-1-1)",
    entretien: "entretien, dépannage ou petite réparation",
    autre: "nature à préciser"
  };
  var FORME_LABELS = { modele: "attestation au modèle de 2016", libre: "attestation au format libre", rcSeule: "attestation de responsabilité civile seule", aucune: "aucune attestation" };
  var ACTIVITE_LABELS = { couverte: "toutes les lignes dans les activités déclarées", partielle: "une partie du devis hors activités", absente: "aucune activité correspondante", procede: "activité limitée à un autre procédé", generique: "libellé générique" };
  var ZONE_LABELS = { oui: "chantier dans l'étendue géographique", non: "chantier hors étendue géographique", absente: "étendue géographique non précisée" };
  var TECH_LABELS = { couvertes: "techniques courantes ou listées", horsListe: "technique non courante absente de l'attestation", inconnu: "techniques à vérifier" };
  var MENTIONS = [
    { id: "mDenomination", label: "dénomination et adresse de l'assuré" },
    { id: "mIdentifiant", label: "numéro SIREN ou numéro de TVA" },
    { id: "mAssureur", label: "nom, siège et coordonnées de l'assureur" },
    { id: "mContrat", label: "numéro du contrat" },
    { id: "mValidite", label: "période de validité" },
    { id: "mEtablissement", label: "date d'établissement" },
    { id: "mActivites", label: "liste des activités ou missions" },
    { id: "mSignature", label: "signature de l'assureur ou de son mandataire" }
  ];
  var DEFAULTS = {
    role: "entreprise", relation: "direct", ouvrage: "batiment", forme: "modele",
    debut: "2026-01-01", fin: "2026-12-31", dateDevis: "2026-10-30", dateOuverture: "2027-01-11",
    activite: "partielle", montantNonCouvert: 9400, montantDevis: 86000, plafondMarche: 0,
    coutOperation: 420000, plafondCout: 1500000, zone: "oui", techniques: "couvertes",
    mDenomination: true, mIdentifiant: true, mAssureur: true, mContrat: true,
    mValidite: true, mEtablissement: true, mActivites: true, mSignature: true
  };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Sans objet" };
  var JOUR = 86400000;

  function num(v, min, max, fallback) {
    var n = (v === "" || v == null) ? NaN : Number(v);
    if (!isFinite(n)) n = fallback;
    if (n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  }
  function pick(v, liste, fallback) { return liste.indexOf(v) >= 0 ? v : fallback; }
  function bool(v) { return v === true || v === "true" || v === 1 || v === "1" || v === "on"; }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return d;
  }
  function fmtDate(d) {
    if (!d) return "n/a";
    return String(d.getUTCDate()).padStart(2, "0") + "/" + String(d.getUTCMonth() + 1).padStart(2, "0") + "/" + d.getUTCFullYear();
  }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) {
    if (n == null || !isFinite(n)) return "n/a";
    var c = Math.round(Math.abs(n) * 100);
    var neg = n < 0 && c !== 0;
    var txt = groupe(Math.floor(c / 100));
    if (c % 100 !== 0) txt += "," + String(c % 100).padStart(2, "0");
    return (neg ? "-" : "") + txt + "\u00a0€";
  }
  function fmtPct(p) { return String(Math.round(p * 10) / 10).replace(".", ",") + "\u00a0%"; }
  function jours(a, b) { return Math.round((b.getTime() - a.getTime()) / JOUR); }

  function obligationDe(d) {
    if (d.relation === "soustraitant") return { reponse: "non", texte: "Le sous-traitant n'est pas lié au maître d'ouvrage par un contrat de louage d'ouvrage : l'obligation légale d'assurance décennale ne le vise pas (code civil, article 1792-1). L'entreprise principale peut toutefois exiger une attestation dans le contrat de sous-traitance." };
    if (d.ouvrage === "exclu") return { reponse: "non", texte: "Ces ouvrages sont exclus de l'obligation d'assurance par l'article L. 243-1-1 du code des assurances, sauf s'ils sont accessoires à un ouvrage soumis. Votre responsabilité peut exister ; c'est l'obligation de s'assurer qui ne s'applique pas." };
    if (d.ouvrage === "entretien") return { reponse: "verifier", texte: "Un entretien ou un dépannage sans élément nouveau n'est en général pas un ouvrage. Dès que des travaux ajoutent un élément avec des techniques de construction, l'obligation revient : tranchez avant d'envoyer le devis." };
    if (d.ouvrage === "autre") return { reponse: "verifier", texte: "La nature des travaux n'est pas précisée : l'obligation dépend de l'existence d'un ouvrage au sens de l'article 1792 du code civil et de la liste de l'article L. 243-1-1 du code des assurances." };
    return { reponse: "oui", texte: d.ouvrage === "accessoire" ? "Ouvrage de la liste de l'article L. 243-1-1, mais accessoire à un bâtiment soumis : l'obligation s'applique." : "Travaux de construction pour le compte d'un maître d'ouvrage : l'entreprise doit être assurée et justifier de son assurance à l'ouverture du chantier (code des assurances, article L. 241-1)." };
  }

  function computeAttestation(input) {
    var d = {};
    for (var k in DEFAULTS) d[k] = (input && input[k] !== undefined) ? input[k] : DEFAULTS[k];
    d.role = pick(d.role, ["entreprise", "client"], "entreprise");
    d.relation = pick(d.relation, ["direct", "soustraitant"], "direct");
    d.ouvrage = pick(d.ouvrage, Object.keys(OUVRAGE_LABELS), "batiment");
    d.forme = pick(d.forme, Object.keys(FORME_LABELS), "modele");
    d.activite = pick(d.activite, Object.keys(ACTIVITE_LABELS), "couverte");
    d.zone = pick(d.zone, ["oui", "non", "absente"], "oui");
    d.techniques = pick(d.techniques, ["couvertes", "horsListe", "inconnu"], "couvertes");
    var montantDevis = num(d.montantDevis, 0, null, 0);
    var nonCouvert = Math.min(num(d.montantNonCouvert, 0, null, 0), montantDevis);
    var plafondMarche = num(d.plafondMarche, 0, null, 0);
    var cout = num(d.coutOperation, 0, null, 0);
    var plafondCout = num(d.plafondCout, 0, null, 0);
    var debut = parseDate(d.debut), fin = parseDate(d.fin), dateDevis = parseDate(d.dateDevis), ouverture = parseDate(d.dateOuverture);
    var periodeOk = !!(debut && fin && fin.getTime() >= debut.getTime());
    var manquantes = [];
    MENTIONS.forEach(function (m) { if (!bool(d[m.id])) manquantes.push(m.label); });

    var ob = obligationDe(d);
    var avecAttestation = d.forme === "modele" || d.forme === "libre";
    var controles = [];
    var demandes = [];
    function ajoute(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    if (d.forme === "modele") ajoute("Document fourni", "ok", "Attestation au modèle fixé par l'arrêté du 5 janvier 2016, avec la mention « Assurance de responsabilité décennale obligatoire ».");
    else if (d.forme === "libre") { ajoute("Document fourni", "warn", "Format libre : les formules du modèle (activités, ouverture pendant la validité, coût de chantier, étendue géographique) sont celles qui permettent le contrôle. Demandez l'attestation au modèle."); demandes.push("une attestation au modèle de l'arrêté du 5 janvier 2016, avec la liste des activités, la période de validité et le plafond de coût de chantier"); }
    else if (d.forme === "rcSeule") { ajoute("Document fourni", "bad", "Une attestation de responsabilité civile ne prouve pas l'assurance décennale : ce sont deux garanties distinctes."); demandes.push("l'attestation d'assurance de responsabilité décennale obligatoire, distincte de l'attestation de responsabilité civile"); }
    else { ajoute("Document fourni", "bad", "Aucune attestation : elle doit être jointe aux devis et aux factures des professionnels assurés (code des assurances, article L. 243-2)."); demandes.push("l'attestation d'assurance de responsabilité décennale en cours de validité"); }

    if (!avecAttestation) {
      ["Mentions minimales", "Activités déclarées", "Validité à la date du devis", "Ouverture du chantier", "Coût de l'opération", "Plafond de marché", "Étendue géographique", "Techniques et produits"].forEach(function (p) { ajoute(p, "info", "Sans objet tant qu'aucune attestation décennale n'est fournie."); });
    } else {
      if (manquantes.length === 0) ajoute("Mentions minimales", "ok", "Les mentions communes du modèle sont présentes, signature comprise.");
      else {
        var grave = manquantes.indexOf("période de validité") >= 0 || manquantes.indexOf("liste des activités ou missions") >= 0;
        ajoute("Mentions minimales", grave ? "bad" : "warn", "Il manque : " + manquantes.join(", ") + "." + (grave ? " Sans période ou sans activités, la couverture ne peut pas être vérifiée." : ""));
        demandes.push("une attestation complète (il manque : " + manquantes.join(", ") + ")");
      }

      if (d.activite === "couverte") ajoute("Activités déclarées", "ok", "Toutes les lignes du devis entrent dans une activité nommée sur l'attestation.");
      else if (d.activite === "partielle") {
        if (nonCouvert === 0) ajoute("Activités déclarées", "warn", "Une partie du devis sortirait des activités : indiquez le montant de ces lignes pour mesurer l'écart.");
        else ajoute("Activités déclarées", "bad", fmtEur(nonCouvert) + " du devis sortent des activités déclarées : ces travaux ne sont pas couverts. Retirez ces lignes, confiez-les à une entreprise assurée pour cette activité, ou obtenez l'extension de l'assureur avant l'ouverture.");
        demandes.push("la confirmation écrite que les lignes hors activités déclarées (" + fmtEur(nonCouvert) + ") sont garanties, ou une extension d'activité avant l'ouverture du chantier");
      } else if (d.activite === "absente") { ajoute("Activités déclarées", "bad", "Aucune activité de l'attestation ne correspond aux travaux : l'assureur peut refuser sa garantie, et le défaut d'assurance est pénalement sanctionné."); demandes.push("une attestation qui mentionne l'activité correspondant aux travaux du devis"); }
      else if (d.activite === "procede") { ajoute("Activités déclarées", "bad", "Activité déclarée pour un procédé précis, devis sur un autre : la garantie peut être refusée même si les deux procédés relèvent du même métier (Cass. 3e civ., 8 novembre 2018, n° 17-24.488)."); demandes.push("la confirmation que le procédé prévu au devis est garanti, ou l'extension correspondante"); }
      else { ajoute("Activités déclarées", "warn", "Un libellé générique ne remplace pas l'activité précise quand le contrat suit une nomenclature détaillée (Cass. 3e civ., 23 septembre 2014, n° 13-21.887). Comparez avec la nomenclature des conditions particulières."); demandes.push("une attestation qui nomme précisément les activités du devis, selon la nomenclature du contrat"); }

      if (!periodeOk) { ajoute("Validité à la date du devis", "warn", "Période de validité illisible ou incohérente : vérifiez les dates de début et de fin."); }
      else if (!dateDevis) ajoute("Validité à la date du devis", "warn", "Date du devis manquante.");
      else if (dateDevis.getTime() < debut.getTime()) { ajoute("Validité à la date du devis", "warn", "L'attestation n'est pas encore en vigueur au " + fmtDate(dateDevis) + " : joignez celle de la période en cours."); demandes.push("l'attestation en vigueur au " + fmtDate(dateDevis)); }
      else if (dateDevis.getTime() > fin.getTime()) { ajoute("Validité à la date du devis", "warn", "L'attestation a expiré le " + fmtDate(fin) + ", avant le devis du " + fmtDate(dateDevis) + " : joignez l'attestation en cours."); demandes.push("l'attestation en vigueur au " + fmtDate(dateDevis)); }
      else ajoute("Validité à la date du devis", "ok", "L'attestation est en vigueur au " + fmtDate(dateDevis) + ", date du devis.");

      if (!ouverture) ajoute("Ouverture du chantier", "warn", "Date d'ouverture inconnue : c'est elle qui désigne le contrat qui couvrira les travaux pendant dix ans. Notez-la dans le dossier dès qu'elle est connue.");
      else if (!periodeOk) ajoute("Ouverture du chantier", "warn", "Impossible de comparer l'ouverture à une période de validité incohérente.");
      else if (ouverture.getTime() > fin.getTime()) { ajoute("Ouverture du chantier", "warn", "Ouverture prévue le " + fmtDate(ouverture) + ", " + jours(fin, ouverture) + " jours après la fin de validité (" + fmtDate(fin) + ") : c'est le contrat en vigueur à l'ouverture qui couvrira. Fournissez l'attestation de la période suivante avant l'ouverture."); demandes.push("l'attestation valable à la date d'ouverture du chantier, prévue le " + fmtDate(ouverture)); }
      else if (ouverture.getTime() < debut.getTime()) { ajoute("Ouverture du chantier", "warn", "Ouverture prévue le " + fmtDate(ouverture) + ", avant le début de validité (" + fmtDate(debut) + ") : demandez l'attestation de la période qui couvre l'ouverture."); demandes.push("l'attestation valable à la date d'ouverture du chantier, prévue le " + fmtDate(ouverture)); }
      else ajoute("Ouverture du chantier", "ok", "Ouverture prévue le " + fmtDate(ouverture) + ", dans la période de validité : le contrat couvre ces travaux pour la durée de la responsabilité décennale.");

      if (cout > 0 && cout < montantDevis) { ajoute("Coût de l'opération", "warn", "Le coût total tous corps d'état (" + fmtEur(cout) + ") ne peut pas être inférieur au devis (" + fmtEur(montantDevis) + ") : demandez le chiffre au maître d'ouvrage."); demandes.push("le coût total de l'opération déclaré par le maître d'ouvrage"); }
      else if (plafondCout === 0) { ajoute("Coût de l'opération", "warn", "L'attestation n'indique pas de plafond de coût de chantier : pour un ensemble d'opérations, le modèle prévoit cette formule. Demandez-la."); demandes.push("le plafond de coût total de chantier couvert par le contrat"); }
      else if (cout === 0) ajoute("Coût de l'opération", "warn", "Coût total de l'opération inconnu : demandez au maître d'ouvrage le coût tous corps d'état pour le comparer au plafond de " + fmtEur(plafondCout) + ".");
      else if (cout > plafondCout) { ajoute("Coût de l'opération", "bad", "Coût de l'opération (" + fmtEur(cout) + ") supérieur au plafond de l'attestation (" + fmtEur(plafondCout) + ") : le chantier ne répond pas aux caractéristiques énoncées, l'assuré doit en informer l'assureur, qui peut délivrer une attestation pour cette opération."); demandes.push("une attestation pour cette opération, dont le coût total (" + fmtEur(cout) + ") dépasse le plafond de " + fmtEur(plafondCout)); }
      else ajoute("Coût de l'opération", "ok", fmtEur(cout) + " pour un plafond de " + fmtEur(plafondCout) + " : marge de " + fmtEur(plafondCout - cout) + ". Les travaux supplémentaires s'ajoutent au coût total.");

      if (plafondMarche === 0) ajoute("Plafond de marché", "ok", "Aucun plafond par marché indiqué sur l'attestation.");
      else if (montantDevis > plafondMarche) { ajoute("Plafond de marché", "bad", "Le devis (" + fmtEur(montantDevis) + ") dépasse le plafond de marché indiqué (" + fmtEur(plafondMarche) + ") : l'assuré en informe l'assureur avant l'ouverture."); demandes.push("la garantie d'un marché de " + fmtEur(montantDevis) + ", au-dessus du plafond de " + fmtEur(plafondMarche)); }
      else ajoute("Plafond de marché", "ok", "Le devis (" + fmtEur(montantDevis) + ") reste sous le plafond de marché (" + fmtEur(plafondMarche) + ").");

      if (d.zone === "oui") ajoute("Étendue géographique", "ok", "Le chantier est dans l'étendue géographique du contrat.");
      else if (d.zone === "non") { ajoute("Étendue géographique", "bad", "Chantier hors de l'étendue géographique : il ne répond pas aux caractéristiques de l'attestation."); demandes.push("l'extension géographique au lieu du chantier"); }
      else { ajoute("Étendue géographique", "warn", "L'étendue géographique n'est pas précisée : elle fait partie des formules du modèle."); demandes.push("l'étendue géographique du contrat"); }

      if (d.techniques === "couvertes") ajoute("Techniques et produits", "ok", "Techniques courantes ou listées sur l'attestation.");
      else if (d.techniques === "horsListe") { ajoute("Techniques et produits", "bad", "Technique non courante absente de l'attestation : l'assuré doit en informer l'assureur avant de l'employer."); demandes.push("la confirmation que la technique prévue au devis est garantie"); }
      else ajoute("Techniques et produits", "warn", "Vérifiez la formule « travaux, produits et procédés de construction » de l'attestation.");
    }

    var nbBad = 0, nbWarn = 0, nbOk = 0;
    controles.forEach(function (c) { if (c.statut === "bad") nbBad++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "ok") nbOk++; });
    var etat, statutLabel;
    if (ob.reponse === "non") { etat = "neutral"; statutLabel = "Hors obligation légale"; }
    else if (nbBad > 0) { etat = "bad"; statutLabel = "Bloquant"; }
    else if (nbWarn > 0 || ob.reponse === "verifier") { etat = "warn"; statutLabel = "À compléter"; }
    else { etat = "ok"; statutLabel = "Conforme"; }
    var obligationLabel = ob.reponse === "oui" ? "Oui" : (ob.reponse === "non" ? "Non" : "À vérifier");

    var partCouverte = 0;
    if (avecAttestation) {
      if (d.activite === "couverte" || d.activite === "generique") partCouverte = montantDevis;
      else if (d.activite === "partielle") partCouverte = montantDevis - nonCouvert;
    }
    var pct = montantDevis > 0 ? partCouverte / montantDevis * 100 : 0;

    var verdict = ob.texte + " ";
    if (etat === "bad") verdict += nbBad + " point" + (nbBad > 1 ? "s" : "") + " bloquant" + (nbBad > 1 ? "s" : "") + " et " + nbWarn + " à compléter avant l'ouverture du chantier.";
    else if (etat === "warn") verdict += nbWarn + " point" + (nbWarn > 1 ? "s" : "") + " à compléter avant l'ouverture du chantier.";
    else if (etat === "ok") verdict += "L'attestation correspond au devis sur tous les points contrôlés.";
    else verdict += nbBad + nbWarn > 0 ? "Si votre client exige l'attestation, " + (nbBad + nbWarn) + " point" + (nbBad + nbWarn > 1 ? "s" : "") + " reste" + (nbBad + nbWarn > 1 ? "nt" : "") + " à revoir." : "Rien à revoir sur les points contrôlés.";

    var actions = [];
    if (ob.reponse !== "non") {
      actions.push(d.role === "entreprise" ? "Joignez l'attestation au devis, puis à la facture (code des assurances, article L. 243-2), et gardez une copie datée dans le dossier." : "Demandez l'attestation avant de signer, comparez-la au devis ligne par ligne et gardez-la avec le devis signé.");
      actions.push("Défaut d'assurance : jusqu'à " + PRISON_MOIS + " mois d'emprisonnement et " + fmtEur(AMENDE_MAX) + " d'amende, ou l'une des deux peines (code des assurances, article L. 243-3).");
    }
    if (ob.reponse === "verifier") actions.push(ob.texte);
    if (avecAttestation && ob.reponse !== "non") actions.push("Si l'entreprise commence ses prestations après l'ouverture de l'opération, l'ouverture s'entend pour elle à la date où elle commence effectivement (code des assurances, annexe I à l'article A. 243-1).");
    if (d.relation === "soustraitant") actions.push("Sous-traitance : vérifiez ce que prévoit le contrat de sous-traitance sur l'assurance ; l'entreprise principale reste, elle, soumise à l'obligation envers le maître d'ouvrage.");
    actions.push("QuoteBuilder ne joint pas l'attestation au devis et ne contrôle pas les activités : le funnel peut seulement recueillir la date de démarrage souhaitée, le coût de l'opération et l'adresse du chantier, à reprendre dans votre devis signé.");

    var destinataire = d.role === "entreprise" ? "à l'assureur ou au courtier" : "à l'entreprise";
    var message;
    if (demandes.length === 0) message = "Rien à demander : l'attestation correspond au devis sur les points contrôlés. Conservez-la dans le dossier avec le devis.";
    else if (d.role === "entreprise") message = ["Bonjour,", "", "Nous préparons un devis de " + fmtEur(montantDevis) + " HT pour un chantier dont l'ouverture est prévue le " + fmtDate(ouverture) + ". Coût total de l'opération déclaré par le maître d'ouvrage : " + (cout > 0 ? fmtEur(cout) + " HT" : "à confirmer") + ".", "", "Pourriez-vous nous adresser :"].concat(demandes.map(function (t) { return "· " + t; })).concat(["", "Une réponse écrite avant l'ouverture du chantier nous permettra de joindre le bon document au devis.", "", "Cordialement"]).join("\n");
    else message = ["Bonjour,", "", "Avant de signer votre devis du " + fmtDate(dateDevis) + ", pourriez-vous nous transmettre :"].concat(demandes.map(function (t) { return "· " + t; })).concat(["", "Le chantier doit ouvrir le " + fmtDate(ouverture) + " ; nous avons besoin de ces éléments avant cette date.", "", "Cordialement"]).join("\n");

    var recap = [
      "Attestation d'assurance décennale (vérification indicative)",
      "Position : " + ROLE_LABELS[d.role] + " ; " + RELATION_LABELS[d.relation] + " ; travaux : " + OUVRAGE_LABELS[d.ouvrage],
      "Obligation : " + obligationLabel.toLowerCase() + " ; document : " + FORME_LABELS[d.forme],
      "Attestation : " + statutLabel.toLowerCase() + " (" + nbBad + " bloquant" + (nbBad > 1 ? "s" : "") + ", " + nbWarn + " à compléter, " + nbOk + " conforme" + (nbOk > 1 ? "s" : "") + ")",
      "Validité : du " + fmtDate(debut) + " au " + fmtDate(fin) + " ; devis du " + fmtDate(dateDevis) + " ; ouverture prévue le " + fmtDate(ouverture),
      "Activités : " + ACTIVITE_LABELS[d.activite] + " ; part du devis couverte : " + fmtEur(partCouverte) + " sur " + fmtEur(montantDevis) + " (" + fmtPct(pct) + ")",
      "Coût de l'opération : " + fmtEur(cout) + " ; plafond de l'attestation : " + (plafondCout > 0 ? fmtEur(plafondCout) : "non indiqué"),
      "Défaut d'assurance : " + PRISON_MOIS + " mois d'emprisonnement et " + fmtEur(AMENDE_MAX) + " d'amende au plus (code des assurances, article L. 243-3)",
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      role: d.role, relation: d.relation, ouvrage: d.ouvrage, forme: d.forme, activite: d.activite, zone: d.zone, techniques: d.techniques,
      montantDevis: montantDevis, nonCouvert: nonCouvert, plafondMarche: plafondMarche, cout: cout, plafondCout: plafondCout,
      debut: debut, fin: fin, dateDevis: dateDevis, ouverture: ouverture, periodeOk: periodeOk, manquantes: manquantes,
      obligation: ob.reponse, obligationLabel: obligationLabel, etat: etat, statutLabel: statutLabel, verdict: verdict,
      nbBad: nbBad, nbWarn: nbWarn, nbOk: nbOk, controles: controles, demandes: demandes,
      partCouverte: partCouverte, pct: pct, actions: actions, destinataire: destinataire, message: message, recap: recap
    };
  }
  function buildRecap(input) { return computeAttestation(input).recap; }

export { AMENDE_MAX, PRISON_MOIS, PLAFOND_R243_3, SLUG, ROLE_LABELS, RELATION_LABELS, OUVRAGE_LABELS, FORME_LABELS, ACTIVITE_LABELS, ZONE_LABELS, TECH_LABELS, MENTIONS, DEFAULTS, STATUT_LABELS, computeAttestation, buildRecap, obligationDe, parseDate, fmtDate, fmtEur, fmtPct };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = ["role", "relation", "ouvrage", "forme", "debut", "fin", "dateDevis", "dateOuverture", "activite", "montantNonCouvert", "montantDevis", "plafondMarche", "coutOperation", "plafondCout", "zone", "techniques"];
    function read() {
      var o = {};
      ids.forEach(function (k) { o[k] = $(k).value; });
      MENTIONS.forEach(function (m) { o[m.id] = $(m.id).checked; });
      return o;
    }
    function liste(id, items) {
      var ul = $(id); ul.innerHTML = "";
      items.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    }
    function render() {
      var r = computeAttestation(read());
      $("obligation").textContent = r.obligationLabel;
      $("statut").textContent = r.statutLabel;
      $("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      $("partCouverte").textContent = fmtEur(r.partCouverte) + " (" + fmtPct(r.pct) + ")";
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("controles"); tb.innerHTML = "";
      r.controles.forEach(function (c) {
        var tr = document.createElement("tr");
        if (c.statut === "bad") tr.className = "cur"; else if (c.statut === "warn") tr.className = "weak";
        [c.point, STATUT_LABELS[c.statut], c.texte].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
        tb.appendChild(tr);
      });
      liste("actions", r.actions);
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
