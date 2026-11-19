/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";


  var SLUG = "verificateur-clause-exclusivite";
  var STATUT_LABELS = { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Qui s'engage et sur quoi",
    "Durée et terme",
    "Contrats successifs",
    "Périmètre",
    "Parts de marché",
    "Durée d'une obligation de non-concurrence",
    "Après la fin du contrat",
    "Contrepartie",
    "Sortie et sanction",
    "Information précontractuelle"
  ];
  var LABEL_SETS = {
    sens: { achat_exclusif: "Achat exclusif (le client s'engage)", fourniture_exclusive: "Fourniture exclusive (le fournisseur s'engage)", reciproque: "Exclusivité réciproque" },
    objet: { biens: "Biens", services: "Services", mixte: "Biens et services" },
    typeDuree: { determinee: "Durée fixe", tacite: "Durée fixe reconduite tacitement", indeterminee: "Sans terme" },
    perimetre: { liste: "Références listées", famille: "Famille définie", similaires: "Produits identiques ou similaires", tout: "Toute l'activité" },
    postCadre: { locaux_savoirfaire: "Limitée aux locaux et au savoir-faire", large: "Large" },
    concurrents: { non: "Non concurrents", oui: "Concurrents" },
    marque: { non: "Non", oui: "Oui" },
    dip: { non_remis: "Pas remis", tardif: "Remis moins de vingt jours avant", remis_20j: "Remis vingt jours ou plus avant" },
    contrepartie: { aucune: "Rien de précis", prix: "Prix ou remise réservés", volume: "Volume garanti", investissement: "Investissement" },
    sortie: { aucune: "Aucune", preavis: "Résiliation avec préavis", objectifs: "Fin si engagements non tenus" },
    penalite: { aucune: "Aucune", chiffree: "Somme chiffrée liée à un coût réel", lourde: "Somme forfaitaire lourde" }
  };
  var DEFAULTS = {
    sens: "achat_exclusif", objet: "biens", typeDuree: "tacite", dureeMois: "144", dateDebut: "2027-01-04", finPremier: "",
    perimetre: "famille", partAchats: "100", postMois: "24", postCadre: "large",
    pdmFournisseur: "3", pdmAcheteur: "2", concurrents: "non", marque: "non", dip: "non_remis",
    contrepartie: "investissement", sortie: "aucune", penalite: "lourde"
  };
  var PLAFOND_L330_1_MOIS = 120;
  var SEUIL_NON_CONCURRENCE_MOIS = 60;
  var SEUIL_ACHATS_PCT = 80;
  var SEUIL_EXEMPTION_PCT = 30;
  var SEUIL_MINIMIS_NON_CONCURRENTS = 15;
  var SEUIL_MINIMIS_CONCURRENTS = 10;
  var POST_MAX_MOIS = 12;
  var DELAI_DIP_JOURS = 20;
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

  function clean(v) { return String(v == null ? "" : v).replace(/[\s\u00a0\u202f]/g, "").replace(",", "."); }
  function dec(v, max) {
    var n = parseFloat(clean(v));
    if (!isFinite(n) || n < 0) return 0;
    return Math.min(n, max);
  }
  function ent(v, max) { return Math.floor(dec(v, max)); }
  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v == null ? "" : v).trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (y < 1900 || y > 2200 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return dt;
  }
  function isoDate(d) { return d ? d.toISOString().slice(0, 10) : ""; }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function addMonths(d, n) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
    var ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
    var last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
    return new Date(Date.UTC(ty, tm, Math.min(day, last)));
  }
  function finApres(d, mois) { return addDays(addMonths(d, mois), -1); }
  function fmtDate(d) {
    if (!d) return "";
    var j = d.getUTCDate();
    return JOURS[d.getUTCDay()] + " " + (j === 1 ? "1er" : j) + " " + MOIS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function fmtNum(n) {
    var r = Math.round(n * 10) / 10;
    var s = String(Math.abs(r)).replace(".", ",");
    var p = s.split(",");
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
    return (r < 0 ? "-" : "") + p.join(",");
  }
  function fmtPct(n) { return fmtNum(n) + " %"; }
  function pluriel(n, s, p) { return fmtNum(n) + " " + (n > 1 ? p : s); }
  function fmtDuree(mois) {
    if (mois <= 0) return "non renseignée";
    var a = Math.floor(mois / 12), r = mois % 12;
    var t = pluriel(mois, "mois", "mois");
    if (a > 0) t += " (" + pluriel(a, "an", "ans") + (r ? " et " + pluriel(r, "mois", "mois") : "") + ")";
    return t;
  }
  function pick(set, v, def) { return Object.prototype.hasOwnProperty.call(LABEL_SETS[set], v) ? v : def; }

  function normalize(raw) {
    raw = raw || {};
    var x = {};
    Object.keys(LABEL_SETS).forEach(function (k) { x[k] = pick(k, raw[k], DEFAULTS[k]); });
    x.dureeMois = ent(raw.dureeMois, 600);
    x.dateDebut = parseDate(raw.dateDebut);
    x.finPremier = parseDate(raw.finPremier);
    x.partAchats = dec(raw.partAchats, 100);
    x.postMois = ent(raw.postMois, 120);
    x.pdmFournisseur = dec(raw.pdmFournisseur, 100);
    x.pdmAcheteur = dec(raw.pdmAcheteur, 100);
    return x;
  }

  function computeExclusivite(raw) {
    var x = normalize(raw);
    var acheteurLie = x.sens === "achat_exclusif" || x.sens === "reciproque";
    var fournisseurLie = x.sens === "fourniture_exclusive" || x.sens === "reciproque";
    var biens = x.objet === "biens" || x.objet === "mixte";
    var l3301 = acheteurLie && biens;
    var nonConc = acheteurLie && x.partAchats > SEUIL_ACHATS_PCT;
    var d = x.dureeMois;
    var sansTerme = x.typeDuree === "indeterminee" || d === 0;
    var concurrents = x.concurrents === "oui";
    var deMinimis = concurrents ? (x.pdmFournisseur + x.pdmAcheteur) <= SEUIL_MINIMIS_CONCURRENTS : (x.pdmFournisseur <= SEUIL_MINIMIS_NON_CONCURRENTS && x.pdmAcheteur <= SEUIL_MINIMIS_NON_CONCURRENTS);
    var sousTrente = !concurrents && x.pdmFournisseur <= SEUIL_EXEMPTION_PCT && x.pdmAcheteur <= SEUIL_EXEMPTION_PCT;
    var debut = x.dateDebut;
    var fin = (!sansTerme && debut) ? finApres(debut, d) : null;
    var limite10 = debut ? finApres(debut, PLAFOND_L330_1_MOIS) : null;
    var date5 = debut ? finApres(debut, SEUIL_NON_CONCURRENCE_MOIS) : null;
    var dureeTxt = sansTerme ? (x.typeDuree === "indeterminee" ? "sans terme" : "durée non écrite, traitée comme sans terme") : fmtDuree(d);
    var c = [];
    function add(statut, texte) { c.push({ point: POINTS[c.length], statut: statut, texte: texte }); }
    var marches = "parts de marché de " + fmtPct(x.pdmFournisseur) + " pour le fournisseur et " + fmtPct(x.pdmAcheteur) + " pour l'acheteur";

    // 1. Qui s'engage
    var t1;
    if (x.sens === "achat_exclusif") t1 = "Le client s'engage à acheter chez vous" + (biens ? " des biens : l'article L330-1 du code de commerce s'applique (dix ans au plus)." : " des services : l'article L330-1, qui vise les biens meubles, ne s'applique pas ; restent le code civil et le droit de la concurrence.");
    else if (x.sens === "fourniture_exclusive") t1 = "C'est vous, fournisseur, qui vous engagez à ne servir que ce client. L'article L330-1 vise l'acheteur et ne vous protège pas : la durée, le périmètre et la contrepartie se négocient.";
    else t1 = "Les deux parties s'engagent. Pour l'engagement du client" + (biens ? ", l'article L330-1 s'applique (biens)." : ", l'article L330-1 ne s'applique pas (services).") + " Pour le vôtre, tout se négocie.";
    add("info", t1);

    // 2. Durée et terme
    if (l3301) {
      if (sansTerme) add("bad", "Exclusivité d'achat de biens " + dureeTxt + " : l'article L330-1 limite sa validité à dix ans. Écrivez une durée de 120 mois au plus" + (limite10 ? " (fin au plus tard le " + fmtDate(limite10) + ")." : "."));
      else if (d > PLAFOND_L330_1_MOIS) add("bad", fmtDuree(d) + " : au-delà de dix ans, la clause n'est plus valable (article L330-1)" + (limite10 ? ", soit après le " + fmtDate(limite10) : "") + ". Ramenez la durée à 120 mois au plus.");
      else if (x.typeDuree === "tacite") add("warn", fmtDuree(d) + ", reconduite tacitement : comptez la durée totale avec les reconductions. Elle ne doit pas dépasser dix ans" + (limite10 ? " (le " + fmtDate(limite10) + ")" : "") + " ; au-delà, faites signer un nouvel accord quand le client est redevenu libre.");
      else add("ok", fmtDuree(d) + ", sous le plafond de dix ans de l'article L330-1" + (fin ? ". Fin le " + fmtDate(fin) + "." : "."));
    } else {
      if (sansTerme) add("warn", "Engagement " + dureeTxt + " : c'est un contrat à durée indéterminée, que chaque partie peut quitter à tout moment avec le préavis prévu ou un délai raisonnable (article 1211 du code civil) ; un engagement perpétuel est interdit (article 1210). Fixez une durée.");
      else if (x.typeDuree === "tacite") add("info", fmtDuree(d) + ", reconduite tacitement : écrivez la date de chaque échéance et le préavis de non-reconduction.");
      else add("ok", fmtDuree(d) + (fin ? ", fin le " + fmtDate(fin) + "." : ". Ajoutez la date de début pour connaître la date de fin."));
    }

    // 3. Contrats successifs
    var finL3302 = null;
    if (!x.finPremier) add("info", "Aucune exclusivité antérieure indiquée. Si un premier contrat entre vous portait déjà sur le même genre de biens, renseignez sa date de fin.");
    else if (!l3301) add("info", "L'article L330-2 vise les exclusivités d'achat de biens qui se suivent entre les mêmes parties : sans objet ici.");
    else if (debut && x.finPremier.getTime() < debut.getTime()) add("ok", "Le premier contrat a pris fin le " + fmtDate(x.finPremier) + ", avant le début de celui-ci : le client était redevenu libre.");
    else {
      finL3302 = x.finPremier;
      if (!fin || fin.getTime() > x.finPremier.getTime()) add("bad", "Un premier contrat prévoyait une exclusivité jusqu'au " + fmtDate(x.finPremier) + ". Pour un engagement analogue sur le même genre de biens, l'exclusivité du nouveau contrat prend fin à la même date (article L330-2) : ne comptez pas sur la suite.");
      else add("ok", "La fin prévue reste avant la fin de l'exclusivité antérieure (" + fmtDate(x.finPremier) + ").");
    }

    // 4. Périmètre
    if (x.perimetre === "liste") add("ok", "Références listées : chacun sait ce qui est couvert.");
    else if (x.perimetre === "famille") add("ok", "Famille définie : vérifiez que la définition permet de dire, pour chaque achat, s'il est couvert.");
    else if (x.perimetre === "similaires") add("warn", "« Identiques ou similaires » sans liste : c'est la source de litige la plus fréquente. Remplacez par une liste de références ou une famille définie.");
    else add("warn", "Toute l'activité : l'engagement dépasse ce que justifie le contrat et ressemble à une interdiction d'exercer. Limitez-le aux produits concernés.");

    // 5. Parts de marché
    if (concurrents) {
      if (deMinimis) add("ok", "Entreprises concurrentes : le règlement 2022/720 ne s'applique pas en principe (article 2, paragraphe 4), mais la part cumulée (" + fmtPct(x.pdmFournisseur + x.pdmAcheteur) + ") reste sous le seuil de 10 % de la communication de minimis.");
      else add("warn", "Entreprises concurrentes avec une part cumulée de " + fmtPct(x.pdmFournisseur + x.pdmAcheteur) + " : ni le règlement 2022/720 (article 2, paragraphe 4), ni la communication de minimis ne couvrent l'accord. Faites relire la clause.");
    } else if (deMinimis) add("ok", "Avec des " + marches + ", l'accord reste sous le seuil de 15 % de la communication de minimis : son effet sur la concurrence est présumé peu sensible. Cela ne couvre pas les restrictions caractérisées" + (l3301 ? " et n'écarte pas l'article L330-1." : "."));
    else if (sousTrente) add("ok", "Avec des " + marches + ", chacune reste sous 30 % : l'exemption du règlement 2022/720 peut jouer (article 3), sous réserve des points suivants.");
    else add("warn", "Avec des " + marches + ", une part dépasse 30 % : pas d'exemption automatique (article 3 du règlement 2022/720). L'accord n'est pas interdit pour autant, mais il faut analyser ses effets.");

    // 6. Non-concurrence
    if (!acheteurLie) add("info", "Le seuil de cinq ans de l'article 5 du règlement vise les obligations imposées à l'acheteur. Votre clause engage le fournisseur : elle n'est pas concernée, mais les seuils de parts de marché s'appliquent.");
    else if (!nonConc) add("ok", "L'engagement couvre " + fmtPct(x.partAchats) + " des besoins de l'acheteur : jusqu'à 80 %, ce n'est pas une obligation de non-concurrence au sens de l'article 1er du règlement 2022/720.");
    else if (sansTerme || d > SEUIL_NON_CONCURRENCE_MOIS) add("warn", "Plus de 80 % des besoins pendant " + (sansTerme ? "une durée sans terme" : fmtDuree(d)) + " : au-delà de cinq ans" + (date5 ? " (après le " + fmtDate(date5) + ")" : "") + ", l'exemption du règlement 2022/720 ne s'applique pas (article 5). L'accord n'est pas nul pour autant (Cass. com., 24 juin 2026, n° 25-14.358) : il faut analyser ses effets" + (deMinimis ? ", probablement faibles avec ces parts de marché." : "."));
    else if (x.typeDuree === "tacite") add("warn", "Plus de 80 % des besoins, " + fmtDuree(d) + " reconduits tacitement : vérifiez que la durée totale reste dans les cinq ans ou que le client peut réellement sortir à chaque échéance.");
    else add("ok", "Plus de 80 % des besoins, mais " + fmtDuree(d) + " : dans la limite de cinq ans de l'article 5 du règlement 2022/720.");

    // 7. Après la fin
    if (x.postMois === 0) add("ok", "Aucune interdiction après la fin du contrat.");
    else if (acheteurLie) {
      if (x.postCadre === "locaux_savoirfaire" && x.postMois <= POST_MAX_MOIS) add("ok", pluriel(x.postMois, "mois", "mois") + ", limités aux locaux et à la protection d'un savoir-faire transmis : dans le cadre de l'article 5, paragraphe 3, du règlement 2022/720.");
      else add("warn", pluriel(x.postMois, "mois", "mois") + " d'interdiction après la fin" + (x.postCadre === "large" ? ", de portée large" : "") + " : hors des conditions de l'article 5, paragraphe 3 (un an au plus, locaux utilisés, savoir-faire transmis), l'exemption ne joue pas. Supprimez-la ou réduisez-la.");
    } else {
      if (x.postCadre === "large" || x.postMois > POST_MAX_MOIS) add("warn", pluriel(x.postMois, "mois", "mois") + " pendant lesquels vous ne pourriez plus servir d'autres clients : demandez à la limiter aux pièces faites sur les plans du client, ou à la supprimer.");
      else add("info", pluriel(x.postMois, "mois", "mois") + " après la fin, limités : vérifiez qu'ils protègent quelque chose de précis (plans, savoir-faire du client).");
    }

    // 8. Contrepartie
    if (x.contrepartie === "aucune") add("warn", "Rien de précis en échange : obtenir un avantage sans contrepartie, ou imposer un déséquilibre significatif, engage la responsabilité de son auteur (article L442-1, I, 1° et 2°). Écrivez ce que la partie engagée reçoit.");
    else if (x.contrepartie === "prix") add("ok", "Prix ou remise réservés : écrivez-les dans le devis et dites ce qu'ils deviennent si l'exclusivité tombe.");
    else if (x.contrepartie === "volume") add("ok", "Volume garanti : chiffrez-le et dites ce qui se passe s'il n'est pas commandé.");
    else add("ok", "Investissement en échange : chiffrez-le dans le devis ; il justifie la durée et le montant d'une éventuelle indemnité.");

    // 9. Sortie et sanction
    var longue = sansTerme || d > 36;
    if (x.penalite === "lourde" && x.sortie === "aucune") add("warn", "Aucune sortie et une sanction forfaitaire lourde : le juge peut réduire une pénalité manifestement excessive (article 1231-5 du code civil). Liez la somme à un coût réel (matériel non amorti) et prévoyez une sortie avec préavis.");
    else if (x.penalite === "lourde") add("warn", "Sanction forfaitaire lourde : le juge peut la réduire si elle est manifestement excessive (article 1231-5 du code civil). Liez-la à un coût réel.");
    else if (x.sortie === "aucune" && longue) add("warn", "Aucune sortie avant le terme sur " + (sansTerme ? "une durée sans terme" : fmtDuree(d)) + " : prévoyez une résiliation avec préavis ou une fin de l'exclusivité si les engagements ne sont pas tenus.");
    else add("ok", (x.sortie === "aucune" ? "Pas de sortie, mais une durée courte" : "Sortie prévue") + (x.penalite === "chiffree" ? ", sanction liée à un coût réel." : x.penalite === "aucune" ? ", pas de sanction forfaitaire." : "."));

    // 10. Information précontractuelle
    if (x.marque === "non") add("info", "Pas de marque ni d'enseigne mise à disposition : l'article L330-3 ne s'applique pas.");
    else if (x.dip === "remis_20j") add("ok", "Marque ou enseigne avec exclusivité : document d'information et projet de contrat remis vingt jours au moins avant la signature (article L330-3).");
    else if (x.dip === "tardif") add("warn", "Document remis moins de vingt jours avant la signature : l'article L330-3 impose vingt jours au minimum. Décalez la signature.");
    else add("bad", "Marque ou enseigne mise à disposition contre une exclusivité, sans document d'information : l'article L330-3 l'impose vingt jours au moins avant la signature, avec le projet de contrat.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    c.forEach(function (p) { if (p.statut === "ok") nbOk++; else if (p.statut === "warn") nbWarn++; else if (p.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad ? "bad" : nbWarn ? "warn" : "ok";
    var verdict;
    if (etat === "bad") verdict = "À corriger avant de signer : " + pluriel(nbBad, "point bloquant", "points bloquants") + (nbWarn ? ", " + pluriel(nbWarn, "point à revoir", "points à revoir") : "") + "." + (l3301 && limite10 && (sansTerme || d > PLAFOND_L330_1_MOIS) ? " L'exclusivité ne vaudrait que jusqu'au " + fmtDate(limite10) + "." : "");
    else if (etat === "warn") verdict = "Pas de point bloquant, " + pluriel(nbWarn, "point à revoir", "points à revoir") + " avant de signer.";
    else verdict = "Clause cohérente avec les textes vérifiés. Gardez la trace de la négociation dans le dossier.";

    // Durée recommandée
    var rec = sansTerme ? SEUIL_NON_CONCURRENCE_MOIS : d;
    if (nonConc) rec = Math.min(rec, SEUIL_NON_CONCURRENCE_MOIS);
    else if (l3301) rec = Math.min(rec, PLAFOND_L330_1_MOIS);
    var recFin = debut ? finApres(debut, rec) : null;
    var recL3302 = false;
    if (finL3302 && recFin && recFin.getTime() > finL3302.getTime()) { recFin = finL3302; recL3302 = true; }

    var actions = [];
    var st = function (i) { return c[i].statut; };
    if (st(1) === "bad") actions.push("Ramenez la durée de l'exclusivité à " + pluriel(rec, "mois", "mois") + " au plus et retirez la reconduction tacite de l'exclusivité.");
    else if (st(1) === "warn") actions.push(sansTerme ? "Écrivez une durée et une date de fin." : "Calculez la durée totale avec les reconductions et écrivez la date au-delà de laquelle un nouvel accord sera nécessaire.");
    if (st(2) === "bad") actions.push("Alignez la fin de l'exclusivité sur celle du premier contrat (" + fmtDate(x.finPremier) + "), puis renégociez quand le client sera libre.");
    if (st(3) === "warn") actions.push("Remplacez la formule large par une liste de références ou une famille définie.");
    if (st(4) === "warn") actions.push("Faites relire la clause par un conseil : les parts de marché dépassent les seuils de sécurité.");
    if (st(5) === "warn") actions.push("Limitez l'achat exclusif à cinq ans ou à 80 % des besoins, ou documentez pourquoi l'effet sur la concurrence reste faible.");
    if (st(6) === "warn") actions.push(acheteurLie ? "Supprimez l'interdiction après la fin, ou limitez-la à un an, aux locaux et au savoir-faire transmis." : "Limitez l'interdiction après la fin aux pièces faites sur les plans du client, ou supprimez-la.");
    if (st(7) === "warn") actions.push("Écrivez la contrepartie dans le devis : prix réservé, volume garanti ou investissement chiffré.");
    if (st(8) === "warn") actions.push("Remplacez la pénalité forfaitaire par une somme liée au coût réel et prévoyez une sortie avec préavis.");
    if (st(9) === "bad") actions.push("Remettez le document d'information et le projet de contrat, puis attendez vingt jours avant de signer.");
    if (st(9) === "warn") actions.push("Décalez la signature pour respecter les vingt jours après la remise du document.");
    actions.push("Notez dans le dossier la version de la clause envoyée, la date et la réponse de l'autre partie.");
    actions.push("Faites relire la clause par votre conseil si l'enjeu est important : l'outil ne remplace pas un avis juridique.");

    var engagement = x.sens === "achat_exclusif" ? "le client s'engage à acheter auprès du fournisseur " + (nonConc ? "la totalité de ses besoins" : "la part convenue de ses besoins") + " en produits couverts."
      : x.sens === "fourniture_exclusive" ? "le fournisseur s'engage à ne pas vendre les produits couverts à d'autres clients" + (x.perimetre === "tout" || x.perimetre === "similaires" ? " ; les produits couverts sont ceux fabriqués sur les plans ou avec l'outillage du client." : ".")
      : "le client achète les produits couverts auprès du fournisseur, qui ne les vend pas à d'autres clients sur le même périmètre.";
    var perimTxt = x.perimetre === "liste" ? "les références listées en annexe." : x.perimetre === "famille" ? "la famille de produits définie au devis." : "les références listées en annexe (à établir).";
    var contreTxt = x.contrepartie === "prix" ? "prix ou remise réservés indiqués au devis, applicables tant que l'exclusivité est respectée."
      : x.contrepartie === "volume" ? "volume de commandes garanti indiqué au devis."
      : x.contrepartie === "investissement" ? "investissement réalisé par le fournisseur, chiffré au devis."
      : "à préciser (prix réservé, volume garanti ou investissement chiffré).";
    var clause = [
      "Exclusivité",
      "Objet : " + perimTxt,
      "Engagement : " + engagement,
      "Durée : " + (recL3302 ? "à compter du " + fmtDate(debut) + " jusqu'au " + fmtDate(recFin) + ", date de fin de l'exclusivité du premier contrat (article L330-2)" + ", sans reconduction tacite de l'exclusivité ; toute prolongation fera l'objet d'un accord écrit." : pluriel(rec, "mois", "mois") + (debut ? " à compter du " + fmtDate(debut) + (recFin ? ", soit jusqu'au " + fmtDate(recFin) : "") : " à compter de la date de début indiquée au devis") + ", sans reconduction tacite de l'exclusivité ; toute prolongation fera l'objet d'un accord écrit."),
      "Contrepartie : " + contreTxt,
      "Fin anticipée : chaque partie peut mettre fin à l'exclusivité par écrit avec un préavis de trois mois" + (x.contrepartie === "investissement" ? " ; en cas de fin anticipée à l'initiative de la partie engagée, elle rachète le matériel ou l'outillage non amorti à sa valeur nette comptable." : x.contrepartie === "prix" ? " ; les prix réservés cessent alors de s'appliquer." : x.contrepartie === "volume" ? " ; le volume garanti cesse alors de s'appliquer." : "."),
      "Après le contrat : " + (x.postMois > 0 && x.postCadre === "locaux_savoirfaire" && x.postMois <= POST_MAX_MOIS ? "pendant " + pluriel(x.postMois, "mois", "mois") + ", limités aux locaux utilisés et à la protection du savoir-faire transmis." : "aucune interdiction d'acheter ou de vendre après la fin."),
      "Le reste du devis et des conditions générales du fournisseur s'applique."
    ].join("\n");

    var message;
    if (x.sens === "fourniture_exclusive") message = "Bonjour,\n\nNous avons bien reçu votre demande d'exclusivité. Nous pouvons nous engager à ne pas vendre à d'autres clients les pièces fabriquées sur vos plans ou avec votre outillage, pendant " + pluriel(rec, "mois", "mois") + ".\n\nEn revanche, nous ne pouvons pas nous interdire de fabriquer des pièces « similaires » pour d'autres clients sans contrepartie. Si vous souhaitez une exclusivité plus large, nous vous proposons de l'adosser à un volume annuel garanti, écrit dans le contrat.\n\nNous vous envoyons la clause correspondante.\n\nCordialement,";
    else if (etat === "ok") message = "Bonjour,\n\nVous trouverez ci-joint notre devis. L'exclusivité porte sur " + perimTxt.replace(/\.$/, "") + ", pendant " + pluriel(rec, "mois", "mois") + ", sans reconduction tacite. En échange : " + contreTxt.replace(/\.$/, "") + ".\n\nVous pouvez y mettre fin avec un préavis de trois mois" + (x.contrepartie === "investissement" ? " ; seul le matériel non amorti serait alors à racheter." : ".") + "\n\nCordialement,";
    else {
      var chg = ["durée de " + pluriel(rec, "mois", "mois") + " sans reconduction tacite", "périmètre limité à " + perimTxt.replace(/\.$/, "")];
      if (x.postMois > 0) chg.push("plus d'interdiction après la fin du contrat");
      chg.push("une sortie possible avec un préavis de trois mois" + (x.contrepartie === "investissement" ? ", contre le rachat du matériel non amorti" : ""));
      if (x.contrepartie === "aucune") chg.push("une contrepartie écrite dans le devis");
      message = "Bonjour,\n\nAvant de vous envoyer le devis définitif, nous avons revu la clause d'exclusivité : " + chg.slice(0, -1).join(", ") + " et " + chg[chg.length - 1] + ".\n\nCette version est plus simple à appliquer pour vous comme pour nous. Nous vous l'envoyons avec le devis.\n\nCordialement,";
    }

    var finLabel = sansTerme ? "Sans terme" : !debut ? "Date de début manquante" : fmtDate(fin);
    var limiteLabel = !l3301 ? "Sans objet" : !debut ? "Date de début manquante" : fmtDate(limite10);
    var cinqLabel = !nonConc ? "Sans objet" : !debut ? "Date de début manquante" : fmtDate(date5);
    var recap = [
      "Vérification de clause d'exclusivité (indicatif)",
      "Engagement : " + LABEL_SETS.sens[x.sens] + " ; objet : " + LABEL_SETS.objet[x.objet],
      "Durée : " + (sansTerme ? dureeTxt : fmtDuree(d)) + " ; " + LABEL_SETS.typeDuree[x.typeDuree],
      "Début : " + (debut ? fmtDate(debut) : "non renseigné") + " ; fin prévue : " + finLabel,
      "Plafond de dix ans : " + limiteLabel + " ; seuil de cinq ans : " + cinqLabel,
      "Périmètre : " + LABEL_SETS.perimetre[x.perimetre] + " ; part des besoins : " + fmtPct(x.partAchats),
      "Parts de marché : fournisseur " + fmtPct(x.pdmFournisseur) + ", acheteur " + fmtPct(x.pdmAcheteur) + " (" + LABEL_SETS.concurrents[x.concurrents].toLowerCase() + ")",
      "Contrepartie : " + LABEL_SETS.contrepartie[x.contrepartie] + " ; sortie : " + LABEL_SETS.sortie[x.sortie] + " ; sanction : " + LABEL_SETS.penalite[x.penalite],
      "Points bloquants / à revoir : " + nbBad + " / " + nbWarn,
      "Verdict : " + verdict,
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      input: x, acheteurLie: acheteurLie, fournisseurLie: fournisseurLie, l3301: l3301, nonConc: nonConc, sansTerme: sansTerme,
      deMinimis: deMinimis, sousTrente: sousTrente, fin: fin, limite10: limite10, date5: date5, finL3302: finL3302,
      finLabel: finLabel, limiteLabel: limiteLabel, cinqLabel: cinqLabel, dureeLabel: sansTerme ? "Sans terme" : fmtDuree(d),
      recMois: rec, recFin: recFin, recL3302: recL3302,
      controles: c, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat, verdict: verdict,
      actions: actions, clause: clause, message: message, recap: recap
    };
  }


export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, LABEL_SETS, PLAFOND_L330_1_MOIS, SEUIL_NON_CONCURRENCE_MOIS, SEUIL_ACHATS_PCT, SEUIL_EXEMPTION_PCT, SEUIL_MINIMIS_NON_CONCURRENTS, SEUIL_MINIMIS_CONCURRENTS, POST_MAX_MOIS, DELAI_DIP_JOURS, computeExclusivite, normalize, parseDate, isoDate, addDays, addMonths, finApres, fmtDate, fmtNum, fmtPct, fmtDuree, dec, ent, pluriel };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  var ids = Object.keys(DEFAULTS);
  var render = function () {
    var raw = {};
    ids.forEach(function (k) { raw[k] = document.getElementById(k).value; });
    var r = computeExclusivite(raw);
    document.getElementById("finOut").textContent = r.finLabel;
    document.getElementById("dureeOut").textContent = r.dureeLabel;
    document.getElementById("limiteOut").textContent = r.limiteLabel;
    document.getElementById("cinqOut").textContent = r.cinqLabel;
    document.getElementById("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
    var v = document.getElementById("verdict");
    v.className = "alert " + r.etat;
    v.textContent = r.verdict;
    var tb = document.getElementById("controles");
    while (tb.firstChild) tb.removeChild(tb.firstChild);
    r.controles.forEach(function (p) {
      var tr = document.createElement("tr");
      if (p.statut === "bad" || p.statut === "warn") tr.className = "weak";
      var a = document.createElement("td"); a.textContent = p.point;
      var b = document.createElement("td"); b.textContent = STATUT_LABELS[p.statut];
      var e = document.createElement("td"); e.textContent = p.texte;
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
  render();
  return built.snapshot();
}
