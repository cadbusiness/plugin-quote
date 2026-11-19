/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-clause-cession-droits-auteur";
  var TAUX_DIFFUSEUR = 1.1;
  var DUREE_POST_MORTEM = 70;
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var AUTEUR_LABELS = { independant: "un indépendant (photographe, graphiste, vidéaste)", agence: "une agence ou un studio dont les auteurs sont salariés ou pigistes", salarie: "un salarié de votre entreprise", inconnu: "on ne sait pas qui a créé" };
  var OEUVRE_LABELS = { photo: "photographies", video: "vidéos", graphisme: "créations graphiques", texte: "textes", logiciel: "logiciel" };
  var ECRIT_LABELS = { signe: "dans le devis ou le contrat signé", cgv: "seulement dans des conditions générales jointes", email: "dans des e-mails échangés", oral: "rien d'écrit" };
  var DESTINATION_LABELS = { institutionnelle: "communication institutionnelle et commerciale de l'entreprise, hors campagne publicitaire achetée", publicite: "campagne publicitaire (achat d'espace, affichage, annonces)", edition: "édition d'un ouvrage ou d'un catalogue vendu", interne: "usage interne seulement (intranet, formation, présentations)", nonprecisee: "non précisée" };
  var TERRITOIRE_LABELS = { france: "France", ue: "Union européenne", monde: "monde entier", nonprecise: "non précisé" };
  var DUREE_LABELS = { annees: "un nombre d'années", legale: "toute la durée légale des droits", nonprecisee: "non précisée" };
  var REMU_LABELS = { proportionnelle: "proportionnelle aux recettes", forfait: "forfait", incluse: "comprise dans le prix de la prestation, sans montant à part", gratuite: "cession gratuite", nonprecisee: "non précisée" };
  var FORFAIT_CAS = { aucun: "pas de motif écrit", "1": "la base de calcul proportionnelle ne peut pas être déterminée (1°)", "2": "les moyens de contrôler une participation font défaut (2°)", "3": "les frais de calcul et de contrôle seraient hors de proportion (3°)", "4": "la contribution de l'auteur est accessoire à l'objet exploité (4°)", "5": "cession de droits sur un logiciel (5°)" };
  var NOM_LABELS = { oui: "crédit prévu", renonce: "l'auteur accepte par écrit de ne pas être cité sur certains supports", rien: "rien de prévu" };
  var SOUS_LABELS = { nonbesoin: "pas besoin", prevue: "prévue dans la clause", besoin: "nécessaire mais pas prévue" };
  var IMAGE_LABELS = { aucune: "personne de reconnaissable", autorisees: "autorisations écrites obtenues", nonautorisees: "personnes reconnaissables, autorisations à obtenir" };
  var EXCLU_LABELS = { exclusive: "exclusive", nonexclusive: "non exclusive", nonprecisee: "non précisée" };
  var SUPPORTS = [
    { id: "web", label: "site internet" },
    { id: "reseaux", label: "réseaux sociaux" },
    { id: "print", label: "imprimés (catalogue, plaquette, fiche produit)" },
    { id: "salon", label: "stand et documents de salon" },
    { id: "affichage", label: "affichage" },
    { id: "presse", label: "annonces presse" },
    { id: "packaging", label: "emballages et étiquettes" },
    { id: "tv", label: "télévision et cinéma" }
  ];
  var CHECKS = [
    { id: "ecrit", label: "Un écrit" },
    { id: "droits", label: "Chaque droit cédé nommé" },
    { id: "adaptation", label: "Modifications par le client" },
    { id: "supports", label: "Supports (étendue)" },
    { id: "destination", label: "Destination" },
    { id: "territoire", label: "Territoire" },
    { id: "duree", label: "Durée" },
    { id: "remuneration", label: "Rémunération de la cession" },
    { id: "titularite", label: "Qui détient les droits" },
    { id: "nom", label: "Nom de l'auteur" },
    { id: "futures", label: "Œuvres futures" },
    { id: "souscession", label: "Transmission à des tiers" },
    { id: "image", label: "Personnes photographiées ou filmées" },
    { id: "exclusivite", label: "Exclusivité" }
  ];
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var DEFAULTS = {
    auteur: "independant", oeuvre: "photo", nbOeuvres: 40, ecrit: "signe",
    repro: true, repres: true, adapt: false, modifs: true,
    sup_web: true, sup_reseaux: true, sup_print: true, sup_salon: false, sup_affichage: false, sup_presse: false, sup_packaging: false, sup_tv: false,
    tousSupports: false,
    destination: "institutionnelle", territoire: "monde", dureeMode: "annees", duree: 5, dateDebut: "2026-10-30",
    remuneration: "forfait", forfaitCas: "aucun", montantPrestation: 1800, montantCession: 600,
    nom: "rien", futures: false, souscession: "besoin", image: "nonautorisees", exclusivite: "nonprecisee",
    garantieAgence: false, artisteAuteur: true
  };

  function num(v, min, max, fallback) {
    var n = (v === "" || v == null) ? NaN : Number(v);
    if (!isFinite(n)) n = fallback;
    if (n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  }
  function pick(v, liste, fallback) { return liste.indexOf(v) >= 0 ? v : fallback; }
  function bool(v, fallback) { if (v === undefined) return fallback; return v === true || v === "true" || v === 1 || v === "1" || v === "on"; }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) {
    if (n == null || !isFinite(n)) return "n/a";
    var c = Math.round(Math.abs(n) * 100);
    var neg = n < 0 && c !== 0;
    var txt = groupe(Math.floor(c / 100));
    if (c % 100 !== 0) txt += "," + String(c % 100).padStart(2, "0");
    return (neg ? "-" : "") + txt + "\u00a0€";
  }
  function fmtPct(n) {
    if (n == null || !isFinite(n)) return "n/a";
    var r = Math.round(n * 10) / 10;
    return String(r).replace(".", ",") + "\u00a0%";
  }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCMonth() !== +m[2] - 1) return null;
    return d;
  }
  function fmtDate(d) {
    if (!d) return "n/a";
    var j = d.getUTCDate();
    return (j === 1 ? "1er" : String(j)) + " " + MOIS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function finCession(debut, annees) {
    if (!debut) return null;
    var y = debut.getUTCFullYear() + annees, mo = debut.getUTCMonth(), j = debut.getUTCDate();
    var d = new Date(Date.UTC(y, mo, j));
    if (d.getUTCMonth() !== mo) d = new Date(Date.UTC(y, mo + 1, 1));
    return new Date(d.getTime() - 86400000);
  }
  function plural(n, s, p) { return n + " " + (n > 1 ? p : s); }

  function normalise(input) {
    var i = input || {};
    var d = {
      auteur: pick(i.auteur, Object.keys(AUTEUR_LABELS), DEFAULTS.auteur),
      oeuvre: pick(i.oeuvre, Object.keys(OEUVRE_LABELS), DEFAULTS.oeuvre),
      nbOeuvres: Math.round(num(i.nbOeuvres, 1, 100000, DEFAULTS.nbOeuvres)),
      ecrit: pick(i.ecrit, Object.keys(ECRIT_LABELS), DEFAULTS.ecrit),
      repro: bool(i.repro, DEFAULTS.repro), repres: bool(i.repres, DEFAULTS.repres), adapt: bool(i.adapt, DEFAULTS.adapt), modifs: bool(i.modifs, DEFAULTS.modifs),
      tousSupports: bool(i.tousSupports, DEFAULTS.tousSupports),
      destination: pick(i.destination, Object.keys(DESTINATION_LABELS), DEFAULTS.destination),
      territoire: pick(i.territoire, Object.keys(TERRITOIRE_LABELS), DEFAULTS.territoire),
      dureeMode: pick(i.dureeMode, Object.keys(DUREE_LABELS), DEFAULTS.dureeMode),
      duree: Math.round(num(i.duree, 1, 99, DEFAULTS.duree)),
      dateDebut: parseDate(i.dateDebut) ? String(i.dateDebut) : DEFAULTS.dateDebut,
      remuneration: pick(i.remuneration, Object.keys(REMU_LABELS), DEFAULTS.remuneration),
      forfaitCas: pick(String(i.forfaitCas == null ? "" : i.forfaitCas), Object.keys(FORFAIT_CAS), DEFAULTS.forfaitCas),
      montantPrestation: Math.round(num(i.montantPrestation, 0, 10000000, DEFAULTS.montantPrestation)),
      montantCession: Math.round(num(i.montantCession, 0, 10000000, DEFAULTS.montantCession)),
      nom: pick(i.nom, Object.keys(NOM_LABELS), DEFAULTS.nom),
      futures: bool(i.futures, DEFAULTS.futures),
      souscession: pick(i.souscession, Object.keys(SOUS_LABELS), DEFAULTS.souscession),
      image: pick(i.image, Object.keys(IMAGE_LABELS), DEFAULTS.image),
      exclusivite: pick(i.exclusivite, Object.keys(EXCLU_LABELS), DEFAULTS.exclusivite),
      garantieAgence: bool(i.garantieAgence, DEFAULTS.garantieAgence),
      artisteAuteur: bool(i.artisteAuteur, DEFAULTS.artisteAuteur)
    };
    SUPPORTS.forEach(function (s) { d["sup_" + s.id] = bool(i["sup_" + s.id], DEFAULTS["sup_" + s.id]); });
    return d;
  }

  function computeCession(input) {
    var d = normalise(input);
    var res = {};
    function set(id, statut, texte, action, trou) { res[id] = { statut: statut, texte: texte, action: action || "", trou: trou || "" }; }
    var oeuvres = OEUVRE_LABELS[d.oeuvre];

    if (d.ecrit === "signe") set("ecrit", "ok", "La cession est écrite dans le devis ou le contrat signé : c'est ce qu'exige l'article L131-2 du code de la propriété intellectuelle.");
    else if (d.ecrit === "cgv") set("ecrit", "warn", "Une clause de cession générale glissée dans des conditions générales a déjà été jugée inopérante (Cass. 1re civ., 12 juillet 2006, n° 05-15.472).", "Reprendre la cession dans le devis signé, avec les supports, la destination, le territoire et la durée.", "Reprendre la cession dans le devis signé");
    else if (d.ecrit === "email") set("ecrit", "warn", "Des e-mails sont un écrit, mais la cession est éparpillée : en cas de désaccord, il faudra reconstituer ce qui a été accepté.", "Regrouper la cession dans un seul document signé : le devis ou un contrat court.", "Regrouper la cession dans le devis signé");
    else set("ecrit", "bad", "Rien d'écrit : depuis 2016, les contrats qui transmettent des droits d'auteur doivent être constatés par écrit (CPI, article L131-2). Le client a payé une prestation, pas une cession.", "Écrire la cession avant de livrer les fichiers.", "Écrire la cession");

    var droits = [];
    if (d.repro) droits.push("le droit de reproduction");
    if (d.repres) droits.push("le droit de représentation");
    if (d.adapt) droits.push("le droit d'adaptation");
    if (droits.length === 0) set("droits", "bad", "Aucun droit n'est nommé : chaque droit cédé doit faire l'objet d'une mention distincte (CPI, article L131-3). Céder le droit de reproduction n'emporte pas celui de représentation (article L122-7).", "Nommer les droits cédés un par un : reproduction, représentation, et adaptation si le client modifie.", "Nommer les droits cédés");
    else if (d.repro && !d.repres) set("droits", "warn", "Seul le droit de reproduction est cédé : il ne couvre pas la diffusion en ligne ou à l'écran, qui relève du droit de représentation (article L122-7).", "Ajouter le droit de représentation si les " + oeuvres + " vont sur un site, des réseaux ou un écran.", "Ajouter le droit de représentation");
    else set("droits", "ok", "Droits nommés : " + droits.join(", ") + ".");

    if (d.modifs && !d.adapt) set("adaptation", "warn", "Le client prévoit de recadrer, retoucher ou ajouter du texte, mais le droit d'adaptation n'est pas cédé. Une modification sans accord touche aussi au droit moral (CPI, article L121-1 ; Cass. 1re civ., 12 juillet 2006, n° 05-15.472).", "Céder le droit d'adaptation et lister les modifications acceptées (recadrage, retouche, texte superposé).", "Lister les modifications acceptées (recadrage, retouche, texte)");
    else if (d.modifs) set("adaptation", "ok", "Le droit d'adaptation est cédé. Listez les modifications acceptées, l'auteur garde son droit au respect de l'œuvre.");
    else set("adaptation", "ok", "Aucune modification prévue : les " + oeuvres + " sont utilisées telles quelles.");

    var supports = SUPPORTS.filter(function (s) { return d["sup_" + s.id]; }).map(function (s) { return s.label; });
    if (d.tousSupports) set("supports", "warn", "« Tous supports, connus et inconnus » est une formule générale : le juge peut la lire de façon restrictive, à la lumière de ce qui était prévu à la commande.", "Remplacer la formule générale par la liste des supports réellement prévus.", "Lister les supports réellement prévus");
    else if (supports.length === 0) set("supports", "bad", "Aucun support n'est listé : le domaine d'exploitation doit être délimité dans son étendue (article L131-3).", "Lister les supports : site, réseaux, imprimés, salon, affichage, emballage.", "Lister les supports");
    else set("supports", "ok", "Supports listés : " + supports.join(", ") + ".");

    if (d.destination === "nonprecisee") set("destination", "bad", "La destination n'est pas écrite : c'est elle qui sert à trancher les usages imprévus (article L131-3).", "Écrire à quoi servent les " + oeuvres + " : communication de l'entreprise, publicité, édition, usage interne.", "Écrire la destination");
    else if (d.destination === "publicite") set("destination", "ok", "Destination publicitaire. Pour une œuvre de commande utilisée pour la publicité, l'article L132-31 attend une rémunération distincte pour chaque mode d'exploitation.");
    else set("destination", "ok", "Destination : " + DESTINATION_LABELS[d.destination] + ".");

    if (d.territoire === "nonprecise") set("territoire", "bad", "Le territoire n'est pas écrit (article L131-3).", "Écrire le territoire : France, Union européenne ou monde entier (un site internet se consulte partout).", "Écrire le territoire");
    else set("territoire", "ok", "Territoire : " + TERRITOIRE_LABELS[d.territoire] + ".");

    var debut = parseDate(d.dateDebut);
    var fin = d.dureeMode === "annees" ? finCession(debut, d.duree) : null;
    if (d.dureeMode === "nonprecisee") set("duree", "bad", "La durée n'est pas écrite (article L131-3).", "Écrire une durée en années avec sa date de départ, ou « pour toute la durée légale des droits ».", "Écrire la durée");
    else if (d.dureeMode === "legale") set("duree", "info", "Cession pour la durée légale : la vie de l'auteur et 70 ans après son décès (CPI, article L123-1). C'est une durée, écrivez-la en toutes lettres.");
    else set("duree", "ok", "Durée : " + plural(d.duree, "an", "ans") + " à compter du " + fmtDate(debut) + ", soit jusqu'au " + fmtDate(fin) + ".");

    var cas = d.oeuvre === "logiciel" ? "5" : d.forfaitCas;
    var distinct = d.montantCession > 0;
    if (d.remuneration === "nonprecisee") set("remuneration", "bad", "La rémunération de l'auteur n'est pas écrite : la cession doit en comporter une, appropriée et proportionnelle aux recettes, sauf cas de forfait (CPI, article L131-4).", "Écrire le montant de la cession, à part du prix de la prestation.", "Écrire le montant de la cession");
    else if (d.remuneration === "gratuite") set("remuneration", "warn", "La cession gratuite est possible (article L122-7), mais elle doit être voulue et écrite comme telle.", "Écrire « à titre gratuit » dans la clause si c'est bien l'intention.", "Confirmer par écrit la cession à titre gratuit");
    else if (d.remuneration === "incluse") set("remuneration", "warn", "La cession est noyée dans le prix de la prestation : impossible de savoir ce qui paie le travail et ce qui paie l'usage." + (d.destination === "publicite" ? " En publicité, l'article L132-31 attend une rémunération distincte par mode d'exploitation." : ""), "Isoler le montant de la cession sur une ligne du devis.", "Isoler le montant de la cession");
    else if (d.remuneration === "proportionnelle") set("remuneration", "ok", "Rémunération proportionnelle aux recettes : c'est la règle de l'article L131-4. Écrivez l'assiette et le pourcentage.");
    else if (cas === "aucun") set("remuneration", "warn", "Forfait sans motif écrit. L'article L131-4 pose la règle d'une rémunération proportionnelle et liste les cas où le forfait est permis.", "Écrire pourquoi le forfait s'applique, par exemple : la base de calcul proportionnelle ne peut pas être déterminée pour un site ou des réseaux sociaux.", "Écrire le motif du forfait (article L131-4)");
    else set("remuneration", "ok", "Forfait, motif écrit : " + FORFAIT_CAS[cas] + ".");
    if (d.remuneration === "forfait" && !distinct && res.remuneration.statut === "ok") set("remuneration", "warn", "Forfait annoncé, mais aucun montant de cession n'est saisi.", "Écrire le montant du forfait de cession.", "Écrire le montant du forfait");

    if (d.auteur === "independant") set("titularite", "ok", "L'auteur indépendant détient les droits. Payer la prestation ne les transfère pas : la commande n'emporte aucune dérogation (CPI, article L111-1, alinéa 3). Seule la clause transmet.");
    else if (d.auteur === "agence" && d.garantieAgence) set("titularite", "ok", "L'agence garantit par écrit détenir les droits de ses auteurs sur les " + oeuvres + " livrées.");
    else if (d.auteur === "agence") set("titularite", "warn", "L'agence ne peut céder que ce qu'elle détient : le contrat de travail de ses photographes ou graphistes ne lui transfère pas leurs droits (article L111-1), sauf pour le logiciel.", "Demander à l'agence une garantie écrite qu'elle détient les droits de ses auteurs.", "Garantie de l'agence sur les droits de ses auteurs");
    else if (d.auteur === "salarie" && d.oeuvre === "logiciel") set("titularite", "ok", "Logiciel créé par un salarié dans ses fonctions : les droits patrimoniaux reviennent à l'employeur (CPI, article L113-9).");
    else if (d.auteur === "salarie") set("titularite", "warn", "Le contrat de travail n'emporte pas cession des droits d'auteur du salarié (article L111-1), hors logiciel et cas particuliers.", "Prévoir une cession écrite avec le salarié, œuvre par œuvre ou par avenant délimité.", "Cession écrite avec le salarié auteur");
    else set("titularite", "bad", "On ne sait pas qui a créé : personne ne peut garantir la cession.", "Identifier l'auteur de chaque fichier avant de signer.", "Identifier l'auteur");

    if (d.nom === "oui") set("nom", "ok", "Le crédit de l'auteur est prévu : le droit au nom fait partie du droit moral, qui ne se cède pas (article L121-1).");
    else if (d.nom === "renonce") set("nom", "ok", "L'auteur accepte par écrit de ne pas être cité sur certains supports. Gardez cet accord avec la clause.");
    else set("nom", "warn", "Rien sur le nom de l'auteur. Le nom ne peut pas être omis sans son autorisation, même en petit format (Cass. 1re civ., 12 juillet 2006, n° 05-15.472).", "Écrire le crédit prévu (« Photo : Prénom Nom ») ou les supports où l'auteur accepte de ne pas être cité.", "Écrire le crédit de l'auteur ou ses exceptions");

    if (d.futures) set("futures", "bad", "La clause cède toutes les œuvres futures de l'auteur : la cession globale des œuvres futures est nulle (CPI, article L131-1).", "Limiter la cession aux " + oeuvres + " de cette commande.", "Limiter la cession aux œuvres de cette commande");
    else set("futures", "ok", "La cession porte sur les " + d.nbOeuvres + " " + oeuvres + " de cette commande.");

    if (d.souscession === "besoin") set("souscession", "warn", "Le client veut transmettre les " + oeuvres + " (distributeurs, filiales, agence) mais la clause ne le prévoit pas. Une cession s'interprète de façon restrictive.", "Autoriser la transmission à des tiers nommés, pour les mêmes supports, destination, territoire et durée.", "Autoriser la transmission aux tiers nommés");
    else if (d.souscession === "prevue") set("souscession", "ok", "La transmission à des tiers est prévue dans la clause.");
    else set("souscession", "ok", "Pas de transmission à des tiers prévue.");

    if (d.image === "nonautorisees") set("image", "warn", "Des personnes sont reconnaissables. Leur image ne relève pas du droit d'auteur mais du respect de la vie privée (code civil, article 9) : la cession du photographe ne la couvre pas.", "Faire signer une autorisation écrite à chaque personne reconnaissable, avec les mêmes supports et la même durée.", "Autorisations des personnes reconnaissables");
    else if (d.image === "autorisees") set("image", "ok", "Les autorisations des personnes reconnaissables sont obtenues par écrit.");
    else set("image", "ok", "Personne de reconnaissable sur les " + oeuvres + ".");

    if (d.exclusivite === "exclusive") set("exclusivite", "ok", "Cession exclusive : l'auteur ne peut pas céder les mêmes " + oeuvres + " à d'autres sur le même domaine.");
    else if (d.exclusivite === "nonexclusive") set("exclusivite", "info", "Cession non exclusive : l'auteur peut réutiliser ou céder les mêmes " + oeuvres + " ailleurs.");
    else set("exclusivite", "info", "Exclusivité non précisée : écrivez-la si un concurrent ne doit pas pouvoir utiliser les mêmes " + oeuvres + ".", "", "Exclusive ou non exclusive");

    var lignes = CHECKS.map(function (c) { var x = res[c.id]; return { id: c.id, label: c.label, statut: x.statut, statutLabel: STATUT_LABELS[x.statut], texte: x.texte, action: x.action, trou: x.trou }; });
    var compte = { ok: 0, warn: 0, bad: 0, info: 0 };
    lignes.forEach(function (l) { compte[l.statut]++; });
    var etat = compte.bad > 0 ? "bad" : (compte.warn > 0 ? "warn" : "ok");
    var verdict = etat === "bad"
      ? plural(compte.bad, "point bloquant", "points bloquants") + " : sur ces points, la cession risque de ne rien transférer. Corrigez la clause avant de livrer les fichiers."
      : (etat === "warn" ? "Aucun point bloquant, mais " + plural(compte.warn, "point à compléter", "points à compléter") + " avant de signer." : "La clause couvre les " + CHECKS.length + " points vérifiés.");

    var total = d.montantPrestation + d.montantCession;
    var partCession = total > 0 ? d.montantCession / total * 100 : 0;
    var coutParAn = d.dureeMode === "annees" ? Math.round(d.montantCession / d.duree * 100) / 100 : null;
    var contribution = (d.artisteAuteur && d.auteur === "independant" && d.remuneration !== "gratuite" && d.remuneration !== "nonprecisee") ? Math.round(d.montantCession * TAUX_DIFFUSEUR) / 100 : 0;

    var alertes = lignes.filter(function (l) { return l.statut === "bad" || l.statut === "warn"; }).map(function (l) { return l.statutLabel + " · " + l.label + " : " + l.texte; });
    if (d.destination === "publicite" && d.remuneration !== "incluse") alertes.push("Publicité : l'article L132-31 présume la cession au producteur si le contrat précise la rémunération distincte pour chaque mode d'exploitation, selon la zone, la durée, le tirage et le support.");
    if (contribution > 0) alertes.push("Si l'auteur est artiste-auteur et qu'il est payé en droits d'auteur, l'entreprise qui exploite l'œuvre verse une contribution diffuseur de " + fmtPct(TAUX_DIFFUSEUR) + " de la rémunération brute hors taxes, soit " + fmtEur(contribution) + " ici. Taux publiés par la Sécurité sociale des artistes-auteurs, à vérifier l'année du paiement.");
    if (alertes.length === 0) alertes.push("Rien à signaler sur les points vérifiés.");

    var actions = lignes.filter(function (l) { return l.action && (l.statut === "bad" || l.statut === "warn"); }).map(function (l) { return l.action; });
    actions.push("Garder le devis signé, avec la clause, dans le dossier du client, et noter la date de fin de la cession.");
    actions.push("Pour tout usage qui n'est pas dans la liste, demander l'accord écrit de l'auteur avant de publier.");

    var trous = lignes.filter(function (l) { return (l.statut === "bad" || l.statut === "warn" || (l.statut === "info" && l.trou)) && l.trou; });
    var tp = function (id) { var l = res[id]; return (l.statut === "bad" || l.statut === "warn" || (l.statut === "info" && l.trou)) ? "[à préciser : " + l.trou + "]" : ""; };
    var clause = [];
    clause.push("Cession de droits d'auteur");
    clause.push("Objet : les " + d.nbOeuvres + " " + oeuvres + " livrées au titre du présent devis." + (tp("ecrit") ? " " + tp("ecrit") : ""));
    clause.push("Droits cédés : " + (droits.length ? droits.join(" ; ") : tp("droits")) + "." + (res.adaptation.statut !== "ok" ? " " + tp("adaptation") : (d.adapt ? " Modifications acceptées : recadrage, retouche, ajout de texte." : "")));
    clause.push("Supports : " + (res.supports.statut === "ok" ? supports.join(", ") : tp("supports")) + ".");
    clause.push("Destination : " + (res.destination.statut === "ok" ? DESTINATION_LABELS[d.destination] : tp("destination")) + ".");
    clause.push("Territoire : " + (res.territoire.statut === "ok" ? TERRITOIRE_LABELS[d.territoire] : tp("territoire")) + ".");
    clause.push("Durée : " + (d.dureeMode === "annees" ? plural(d.duree, "an", "ans") + " à compter du " + fmtDate(debut) + ", soit jusqu'au " + fmtDate(fin) : (d.dureeMode === "legale" ? "toute la durée légale des droits d'auteur" : tp("duree"))) + ".");
    var remu;
    if (d.remuneration === "nonprecisee") remu = tp("remuneration");
    else if (d.remuneration === "gratuite") remu = "à titre gratuit. " + tp("remuneration");
    else if (d.remuneration === "proportionnelle") remu = "proportionnelle aux recettes d'exploitation, selon l'assiette et le taux convenus.";
    else if (d.remuneration === "incluse") remu = tp("remuneration");
    else remu = fmtEur(d.montantCession) + " pour la cession, distincts du prix de la prestation (" + fmtEur(d.montantPrestation) + "). " + (cas === "aucun" ? tp("remuneration") : "Forfait retenu car " + FORFAIT_CAS[cas] + ", article L131-4 du code de la propriété intellectuelle.");
    clause.push("Rémunération : " + remu.trim());
    clause.push("Exclusivité : " + (d.exclusivite === "nonprecisee" ? tp("exclusivite") : "cession " + EXCLU_LABELS[d.exclusivite]) + ".");
    clause.push("Nom de l'auteur : " + (d.nom === "oui" ? "crédit « Photo : Prénom Nom » ou équivalent sur chaque support où c'est possible" : (d.nom === "renonce" ? "selon l'accord écrit de l'auteur, joint" : tp("nom"))) + ".");
    if (d.souscession !== "nonbesoin") clause.push("Transmission : " + (d.souscession === "prevue" ? "le client peut transmettre ces droits aux tiers nommés ci-après, pour les mêmes supports, destination, territoire et durée" : tp("souscession")) + ".");
    if (d.image !== "aucune") clause.push("Personnes reconnaissables : " + (d.image === "autorisees" ? "autorisations écrites jointes" : tp("image")) + ".");
    if (res.titularite.statut !== "ok") clause.push("Garantie : " + tp("titularite") + ".");
    if (d.futures) clause.push(tp("futures") + ".");
    clause.push("Tout usage qui n'est pas listé ci-dessus reste soumis à l'accord écrit de l'auteur.");
    var nbTrous = clause.join("\n").split("[à préciser").length - 1;

    var aCompleter = lignes.filter(function (l) { return l.statut === "bad" || l.statut === "warn"; });
    var message = [];
    message.push("Bonjour,");
    message.push("");
    if (aCompleter.length) {
      message.push("Avant de signer le devis, je vous propose de compléter la clause de cession de droits sur " + plural(aCompleter.length, "point", "points") + " :");
      aCompleter.forEach(function (l) { message.push("- " + l.label + " : " + l.action); });
    } else {
      message.push("La clause de cession de droits du devis me convient : droits, supports, destination, territoire, durée et rémunération sont écrits.");
    }
    message.push("");
    message.push("L'idée est simple : écrire noir sur blanc ce que nous pourrons faire des " + oeuvres + ", pour éviter toute discussion plus tard.");
    message.push("");
    message.push("Bien à vous,");
    message = message.join("\n");

    var recap = [
      "Vérificateur de clause de cession de droits d'auteur",
      "Œuvres : " + d.nbOeuvres + " " + oeuvres + ", créées par " + AUTEUR_LABELS[d.auteur],
      "Écrit : " + ECRIT_LABELS[d.ecrit],
      "Conformes : " + compte.ok + " / " + CHECKS.length + " ; à compléter : " + compte.warn + " ; bloquants : " + compte.bad + " ; information : " + compte.info
    ];
    lignes.forEach(function (l) { recap.push("· " + l.label + " : " + l.statutLabel); });
    recap.push("Prestation : " + fmtEur(d.montantPrestation) + " ; cession : " + fmtEur(d.montantCession) + " (" + fmtPct(partCession) + " du total)");
    if (coutParAn != null) recap.push("Cession par an : " + fmtEur(coutParAn) + " ; fin : " + fmtDate(fin));
    recap.push("Calcul : quotebuilder.co/outils/" + SLUG);

    return {
      input: d, lignes: lignes, compte: compte, etat: etat, verdict: verdict, total: total, partCession: partCession,
      coutParAn: coutParAn, contribution: contribution, dateFin: fin ? fin.toISOString().slice(0, 10) : null, dateFinTexte: fin ? fmtDate(fin) : null,
      alertes: alertes, actions: actions, clause: clause.join("\n"), nbTrous: nbTrous, message: message, recap: recap.join("\n")
    };
  }
  function buildRecap(input) { return computeCession(input).recap; }

export { SLUG, TAUX_DIFFUSEUR, DUREE_POST_MORTEM, SUPPORTS, CHECKS, STATUT_LABELS, AUTEUR_LABELS, OEUVRE_LABELS, ECRIT_LABELS, DESTINATION_LABELS, TERRITOIRE_LABELS, DUREE_LABELS, REMU_LABELS, FORFAIT_CAS, NOM_LABELS, SOUS_LABELS, IMAGE_LABELS, EXCLU_LABELS, DEFAULTS, computeCession, buildRecap, normalise, fmtEur, fmtPct, fmtDate, finCession, parseDate };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var selects = ["auteur", "oeuvre", "ecrit", "destination", "territoire", "dureeMode", "remuneration", "forfaitCas", "nom", "souscession", "image", "exclusivite"];
    var nums = ["nbOeuvres", "duree", "montantPrestation", "montantCession", "dateDebut"];
    var checks = ["repro", "repres", "adapt", "modifs", "tousSupports", "futures", "garantieAgence", "artisteAuteur"];
    function read() {
      var o = {};
      selects.concat(nums).forEach(function (k) { o[k] = $(k).value; });
      checks.forEach(function (k) { o[k] = $(k).checked; });
      SUPPORTS.forEach(function (s) { o["sup_" + s.id] = $("sup_" + s.id).checked; });
      return o;
    }
    function liste(id, items) {
      var ul = $(id); ul.innerHTML = "";
      items.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
    }
    function render() {
      var r = computeCession(read());
      $("nbOk").textContent = r.compte.ok + " / " + CHECKS.length;
      $("nbWarn").textContent = String(r.compte.warn);
      $("nbBad").textContent = String(r.compte.bad);
      $("part").textContent = fmtEur(r.input.montantCession) + " · " + fmtPct(r.partCession);
      $("parAn").textContent = r.coutParAn == null ? "durée non chiffrée" : fmtEur(r.coutParAn) + " jusqu'au " + r.dateFinTexte;
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("resultats"); tb.innerHTML = "";
      r.lignes.forEach(function (l) {
        var tr = document.createElement("tr");
        if (l.statut === "bad") tr.className = "cur"; else if (l.statut === "warn") tr.className = "weak";
        [l.label, l.statutLabel, l.texte].forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
        tb.appendChild(tr);
      });
      liste("alertes", r.alertes);
      liste("actions", r.actions);
      $("clause").textContent = r.clause;
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
