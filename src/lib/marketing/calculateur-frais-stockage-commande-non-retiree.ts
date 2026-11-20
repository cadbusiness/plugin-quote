/* eslint-disable */
// @ts-nocheck

  var SLUG = "calculateur-frais-stockage-commande-non-retiree";
  var STATUT_LABELS = { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" };
  var POINTS = [
    { id: "nature", label: "Nature du contrat" },
    { id: "avis", label: "Avis de mise à disposition" },
    { id: "terme", label: "Délai de retrait" },
    { id: "clauseStockage", label: "Frais de stockage prévus" },
    { id: "frais", label: "Frais courus" },
    { id: "miseEnDemeure", label: "Mise en demeure du client" },
    { id: "risques", label: "Risques de la commande" },
    { id: "sequestre", label: "Séquestre (article 1345-1)" },
    { id: "sortie", label: "Sortie du contrat" },
    { id: "solde", label: "Solde et rétention" }
  ];
  var LABEL_SETS = {
    nature: {
      vente: "Vente d'un produit de catalogue ou de série",
      entreprise: "Fabrication sur mesure avec vos matériaux, selon les cotes du client",
      confie: "Travail sur un objet du client (réparation, façon, finition)"
    },
    avisEcrit: {
      oui: "Oui, avis daté (e-mail ou courrier)",
      non: "Non, seulement par téléphone ou pas du tout"
    },
    clauseStockage: {
      oui: "Oui, avec un tarif",
      non: "Non"
    },
    periode: {
      jour: "Par jour",
      semaine: "Par semaine commencée",
      mois: "Par mois commencé (30 jours)"
    },
    exigibilite: {
      oui: "Oui, le devis le dit",
      non: "Non, solde à la livraison ou à la pose"
    },
    risquesClause: {
      oui: "Oui, le devis le dit",
      non: "Non, rien d'écrit"
    },
    reserve: {
      oui: "Oui",
      non: "Non"
    },
    clauseResolutoire: {
      oui: "Oui",
      non: "Non"
    }
  };
  var DEFAULTS = {
    nature: "entreprise",
    montantHT: "18400",
    soldeDu: "9200",
    dateDispo: "2026-12-14",
    avisEcrit: "oui",
    termeJours: "15",
    clauseStockage: "oui",
    tarif: "35",
    periode: "semaine",
    unites: "3",
    franchiseJours: "15",
    exigibilite: "non",
    risquesClause: "non",
    reserve: "oui",
    clauseResolutoire: "non",
    dateMED: "",
    delaiMED: "15",
    dateCalcul: "2027-01-11"
  };
  var SEQUESTRE_MOIS = 2;
  var LOI_1903_MOIS = 12;
  var JOURS_PERIODE = { jour: 1, semaine: 7, mois: 30 };
  var MOIS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var JOURS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  var JOUR_MS = 86400000;

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
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, d = +m[3];
    var dt = new Date(Date.UTC(y, mo, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo || dt.getUTCDate() !== d) return null;
    return dt;
  }
  function isoDate(d) {
    if (!d) return "";
    var mm = d.getUTCMonth() + 1, dd = d.getUTCDate();
    return d.getUTCFullYear() + "-" + (mm < 10 ? "0" : "") + mm + "-" + (dd < 10 ? "0" : "") + dd;
  }
  function lastDay(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
  function addDays(d, n) { return new Date(d.getTime() + n * JOUR_MS); }
  function addMonths(d, n) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
    var ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
    return new Date(Date.UTC(ty, tm, Math.min(day, lastDay(ty, tm))));
  }
  function joursEntre(a, b) { return Math.round((b.getTime() - a.getTime()) / JOUR_MS); }
  function fmtDate(d) {
    if (!d) return "date non renseignée";
    var j = d.getUTCDate();
    return JOURS_FR[d.getUTCDay()] + " " + (j === 1 ? "1er" : String(j)) + " " + MOIS_FR[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function fmtNum(n) {
    var r = Math.round(n * 100) / 100;
    var neg = r < 0; r = Math.abs(r);
    var ip = Math.floor(r), fp = Math.round((r - ip) * 100);
    var s = String(ip).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if (fp > 0) s += "," + (fp < 10 ? "0" : "") + fp;
    return (neg ? "-" : "") + s;
  }
  function fmtEur(n) { return fmtNum(n) + " €"; }
  function pluriel(n, s, p) { return n + " " + (n > 1 ? (p || s + "s") : s); }
  function nbPeriodes(jours, periode) {
    if (jours <= 0) return 0;
    return Math.ceil(jours / JOURS_PERIODE[periode]);
  }

  function normalize(raw) {
    var x = {};
    raw = raw || {};
    Object.keys(DEFAULTS).forEach(function (k) {
      var v = raw[k] === undefined || raw[k] === null ? DEFAULTS[k] : String(raw[k]);
      if (LABEL_SETS[k] && !Object.prototype.hasOwnProperty.call(LABEL_SETS[k], v)) v = DEFAULTS[k];
      x[k] = v;
    });
    x.dispo = parseDate(x.dateDispo);
    x.calc = parseDate(x.dateCalcul);
    x.med = parseDate(x.dateMED);
    var mt = dec(x.montantHT); x.montant = isFinite(mt) && mt >= 0 ? mt : 0;
    var sd = dec(x.soldeDu); x.solde = isFinite(sd) && sd >= 0 ? sd : 0;
    var t = ent(x.termeJours); x.terme = isFinite(t) && t >= 0 ? Math.min(t, 365) : 0;
    var tf = dec(x.tarif); x.prix = isFinite(tf) && tf >= 0 ? Math.min(tf, 100000) : 0;
    var u = ent(x.unites); x.nbUnites = isFinite(u) && u >= 0 ? Math.min(u, 10000) : 0;
    var f = ent(x.franchiseJours); x.franchise = isFinite(f) && f >= 0 ? Math.min(f, 365) : 0;
    var dm = ent(x.delaiMED); x.delai = isFinite(dm) && dm >= 1 ? Math.min(dm, 120) : 15;
    return x;
  }

  function computeStockage(raw) {
    var x = normalize(raw);
    var c = [];
    var actions = [];
    var push = function (id, statut, texte) {
      var p = POINTS.filter(function (q) { return q.id === id; })[0];
      c.push({ id: id, point: p.label, statut: statut, texte: texte });
    };
    var dispo = x.dispo;
    var calc = x.calc && dispo && x.calc < dispo ? dispo : x.calc;
    var avisOk = x.avisEcrit === "oui" && !!dispo;
    var finTerme = dispo && x.terme > 0 ? addDays(dispo, x.terme) : null;
    var termeDepasse = !!(finTerme && calc && calc > finTerme);
    var joursDepuisDispo = dispo && calc ? joursEntre(dispo, calc) : 0;

    // Frais
    var debutFrais = dispo ? addDays(dispo, x.franchise + 1) : null;
    var joursFactures = debutFrais && calc && calc >= debutFrais ? joursEntre(debutFrais, calc) + 1 : 0;
    var periodes = nbPeriodes(joursFactures, x.periode);
    var frais = Math.round(periodes * x.prix * x.nbUnites * 100) / 100;
    var clause = x.clauseStockage === "oui";
    var fraisLabel = fmtEur(frais) + " HT" + (clause ? "" : " (estimation à justifier)");
    var uniteMot = { jour: "jour", semaine: "semaine commencée", mois: "mois commencé" }[x.periode];

    // Mise en demeure
    var medValide = !!(x.med && dispo && x.med >= dispo && calc && x.med <= calc);
    var medIncoherente = !!(x.med && !medValide);
    var finDelaiMED = medValide ? addDays(x.med, x.delai) : null;
    var sequestreDes = medValide ? addDays(addMonths(x.med, SEQUESTRE_MOIS), 1) : null;
    var sequestrePossible = !!(sequestreDes && calc && calc >= sequestreDes);
    var besoinMED = !!dispo && (termeDepasse || (x.terme === 0 && joursDepuisDispo > x.franchise));
    var echeanceProposee = calc ? addDays(calc, x.delai) : null;

    // 1. Nature
    if (x.nature === "vente") push("nature", "info", "Vente : la propriété et les risques passent en principe au client dès l'accord sur la chose et le prix (articles 1196 et 1583), sauf clause contraire. L'article 1657 permet une résolution de plein droit après le terme de retrait.");
    else if (x.nature === "entreprise") push("nature", "info", "Ouvrage fabriqué sur mesure avec vos matériaux : contrat d'entreprise (article 1787). Tant que l'ouvrage n'est pas livré, sa perte est pour vous, sauf si le client était en demeure de recevoir l'ouvrage (article 1788).");
    else push("nature", "info", "Objet du client confié pour être travaillé : il reste sa propriété. Vous ne répondez que de votre faute (article 1789), et la loi du 31 décembre 1903 permet de faire vendre l'objet, sur autorisation du juge, s'il n'est pas retiré dans l'année.");

    // 2. Avis
    if (!dispo) push("avis", "bad", "Date de mise à disposition non renseignée : aucun délai ne peut être calculé.");
    else if (avisOk) push("avis", "ok", "Avis écrit du " + fmtDate(dispo) + " : c'est le point de départ du délai de retrait et des jours gratuits. Gardez-le avec les photos de la commande prête.");
    else push("avis", "bad", "Sans avis écrit et daté, rien ne prouve que la commande était prête le " + fmtDate(dispo) + " : le délai de retrait, les frais et la résolution de l'article 1657 se discutent. Envoyez l'avis par écrit aujourd'hui.");

    // 3. Terme
    if (!dispo) push("terme", "info", "Sans date de mise à disposition, pas de délai calculable.");
    else if (x.terme > 0) push("terme", "ok", "Retrait convenu au plus tard le " + fmtDate(finTerme) + (termeDepasse ? ", dépassé de " + pluriel(joursEntre(finTerme, calc), "jour") + " au " + fmtDate(calc) + "." : ", pas encore échu au " + fmtDate(calc) + "."));
    else push("terme", "warn", "Aucun délai de retrait écrit : rien ne court tant que le client n'est pas mis en demeure. Fixez un délai dans l'avis, et dans vos prochains devis.");

    // 4. Clause stockage
    if (clause) push("clauseStockage", "ok", "Frais prévus au devis accepté : " + fmtEur(x.prix) + " HT par " + uniteMot + " et par emplacement, après " + pluriel(x.franchise, "jour gratuit", "jours gratuits") + ". Si le tarif sert surtout à punir le retard, le juge peut le traiter comme une clause pénale et le réduire s'il est manifestement excessif (article 1231-5).");
    else push("clauseStockage", "warn", "Rien d'écrit : vous ne pouvez pas facturer un tarif que le client n'a pas accepté. Le coût réel du stockage peut se réclamer en dommages et intérêts (articles 1231-1 et 1231-2), après mise en demeure (article 1231), à condition de prouver ce coût.");

    // 5. Frais courus
    if (!dispo || !calc) push("frais", "info", "Dates incomplètes : frais non calculés.");
    else if (joursFactures > 0) push("frais", "info", pluriel(joursFactures, "jour") + " du " + fmtDate(debutFrais) + " au " + fmtDate(calc) + ", soit " + pluriel(periodes, "période") + " × " + fmtEur(x.prix) + " × " + pluriel(x.nbUnites, "emplacement") + " = " + fraisLabel + ".");
    else push("frais", "info", "Aucun frais au " + fmtDate(calc) + " : les jours gratuits courent jusqu'au " + fmtDate(addDays(dispo, x.franchise)) + ".");

    // 6. Mise en demeure
    if (medValide) push("miseEnDemeure", "ok", "Mise en demeure reçue le " + fmtDate(x.med) + ", délai donné jusqu'au " + fmtDate(finDelaiMED) + (calc <= finDelaiMED ? " (en cours)." : " (expiré).") + " Elle arrête le cours des intérêts que vous devriez et met les risques à la charge du client (article 1345).");
    else if (medIncoherente) push("miseEnDemeure", "warn", "La date de mise en demeure est antérieure à la mise à disposition ou postérieure à la date du calcul : vérifiez-la. Une mise en demeure n'a de sens que pour une commande déjà prête.");
    else if (besoinMED) push("miseEnDemeure", "warn", (termeDepasse ? "Délai de retrait dépassé depuis le " + fmtDate(addDays(finTerme, 1)) : "Commande prête depuis " + pluriel(joursDepuisDispo, "jour")) + " sans mise en demeure : envoyez-la en recommandé avec avis de réception, avec un délai au " + fmtDate(echeanceProposee) + ". Tant qu'elle n'est pas reçue, les deux mois de l'article 1345-1 ne courent pas.");
    else push("miseEnDemeure", "info", "Pas encore de mise en demeure à envoyer : le délai de retrait ou les jours gratuits ne sont pas écoulés.");

    // 7. Risques
    var risquesLabel, risquesStatut, risquesTexte;
    if (x.risquesClause === "oui" && dispo) {
      risquesLabel = "Au client depuis le " + fmtDate(dispo);
      risquesStatut = "ok";
      risquesTexte = "Votre devis transfère les risques au client dès la mise à disposition : une casse ou un sinistre dans votre atelier est pour lui, sauf faute de votre part. Vérifiez quand même que votre assurance couvre les biens des clients stockés chez vous.";
    } else if (medValide) {
      risquesLabel = "Au client depuis le " + fmtDate(x.med);
      risquesStatut = "ok";
      risquesTexte = "Depuis la réception de la mise en demeure, les risques sont à la charge du client, sauf faute lourde ou dolosive de votre part (article 1345" + (x.nature === "entreprise" ? " ; article 1788 : le client était en demeure de recevoir" : "") + ").";
    } else if (x.nature === "vente" && x.reserve === "non") {
      risquesLabel = "Au client depuis la vente";
      risquesStatut = "info";
      risquesTexte = "Sans réserve de propriété, le client est propriétaire depuis l'accord et porte les risques (article 1196). Vous gardez une obligation de conserver la chose avec soin jusqu'à la délivrance.";
    } else {
      risquesLabel = "Chez vous";
      risquesStatut = "warn";
      if (x.nature === "entreprise") risquesTexte = "Ouvrage non livré : s'il est détruit, même sans faute de votre part, la perte est pour vous tant que le client n'est pas mis en demeure de recevoir l'ouvrage (article 1788).";
      else if (x.nature === "vente") risquesTexte = "Avec une réserve de propriété et sans clause sur les risques, ceux-ci restent chez vous avec la propriété (article 1196) jusqu'à une mise en demeure du client (article 1345).";
      else risquesTexte = "L'objet reste au client, mais s'il périt sans votre faute avant d'être reçu, vous perdez le prix de votre travail (article 1790), sauf si le client était en demeure de vérifier l'ouvrage.";
    }
    push("risques", risquesStatut, risquesTexte);

    // 8. Séquestre
    var sequestreLabel;
    if (medValide) {
      sequestreLabel = (sequestrePossible ? "Possible depuis le " : "À partir du ") + fmtDate(sequestreDes);
      if (sequestrePossible) push("sequestre", "ok", "Le client n'a pas réagi dans les deux mois de la mise en demeure : vous pouvez confier la commande à un gardien professionnel ; si c'est impossible ou trop cher, le juge peut autoriser sa vente, le prix étant consigné. Le séquestre vous libère dès sa notification au client, et ses frais sont pour lui (articles 1345-1 et 1345-3).");
      else push("sequestre", "info", "Si le client n'a toujours rien fait, vous pourrez confier la commande à un gardien professionnel à partir du " + fmtDate(sequestreDes) + " (deux mois après la réception de la mise en demeure, article 1345-1).");
    } else {
      sequestreLabel = "Après une mise en demeure";
      push("sequestre", besoinMED || medIncoherente ? "warn" : "info", "Le délai de deux mois de l'article 1345-1 ne court qu'à partir d'une mise en demeure reçue par le client. Avant, ni séquestre ni vente.");
    }

    // 9. Sortie du contrat
    var res1657 = null, vente1903 = null;
    if (x.nature === "vente") {
      if (finTerme && avisOk) {
        res1657 = addDays(finTerme, 1);
        if (calc >= res1657) push("sortie", "ok", "Le terme de retrait est passé : depuis le " + fmtDate(res1657) + ", la vente peut être tenue pour résolue de plein droit et sans sommation (article 1657). La règle joue à votre profit : vous pouvez aussi garder la vente et réclamer le prix. Après résolution, chacun restitue ce qu'il a reçu (article 1229), sous déduction de votre préjudice justifié.");
        else push("sortie", "info", "Résolution de plein droit possible à partir du " + fmtDate(res1657) + " si la commande n'est pas retirée (article 1657).");
      } else push("sortie", "warn", "L'article 1657 suppose un terme de retrait convenu et une marchandise réellement mise à disposition avant ce terme (Cass. 1re civ., 24 octobre 2000, n° 98-17.663). Il manque " + (!finTerme && !avisOk ? "les deux" : (!finTerme ? "le terme" : "la preuve de la mise à disposition")) + " : passez par la mise en demeure.");
    } else if (x.nature === "entreprise") {
      if (x.clauseResolutoire === "oui") push("sortie", "ok", "Clause résolutoire écrite : elle joue après une mise en demeure restée sans effet qui la cite expressément (article 1225). Pour un ouvrage sur mesure que personne d'autre n'achètera, réclamer le solde (article 1221) vaut souvent mieux que résoudre.");
      else push("sortie", "info", "Pas de clause résolutoire : résolution par notification après mise en demeure, à vos risques (article 1226), ou par le juge. L'article 1657 vise la vente. Pour un ouvrage sur mesure, réclamer le solde (article 1221) vaut souvent mieux que résoudre.");
    } else {
      vente1903 = dispo ? addDays(addMonths(dispo, LOI_1903_MOIS), 1) : null;
      if (vente1903 && calc >= vente1903) push("sortie", "ok", "Plus d'un an depuis la mise à disposition : vous pouvez demander par requête au juge du tribunal judiciaire l'autorisation de faire vendre l'objet aux enchères. Vous êtes payé sur le prix, le surplus est consigné au nom du client (loi du 31 décembre 1903, articles 1, 2 et 5).");
      else push("sortie", "info", "Vente aux enchères possible, sur autorisation du juge, à partir du " + fmtDate(vente1903) + " (un an, loi du 31 décembre 1903). D'ici là, pas de vente ni de destruction de votre propre autorité.");
    }

    // 10. Solde et rétention
    if (x.solde <= 0) push("solde", "info", "Commande payée : la rétention ne sert plus de levier ; seuls les frais de stockage et les risques restent en jeu.");
    else if (x.exigibilite === "oui") push("solde", "ok", "Solde de " + fmtEur(x.solde) + " HT exigible depuis le " + fmtDate(dispo) + " (clause du devis). Vous pouvez garder la commande jusqu'au paiement (articles 1612 et 2286).");
    else push("solde", "warn", "Sans clause, le prix se paie en principe à la livraison (article 1651 pour la vente) : tant que le client ne vient pas, il ne paie pas les " + fmtEur(x.solde) + " HT restants. Écrivez dans vos devis que le solde est exigible à la mise à disposition.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    c.forEach(function (p) { if (p.statut === "ok") nbOk++; else if (p.statut === "warn") nbWarn++; else if (p.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : nbWarn > 0 ? "warn" : "ok";
    var bl = pluriel(nbBad, "point bloquant", "points bloquants");
    var ar = pluriel(nbWarn, "point à revoir", "points à revoir");
    var verdict;
    if (nbBad > 0) verdict = "À régulariser avant toute relance : " + bl + (nbWarn > 0 ? ", " + ar : "") + ".";
    else if (nbWarn > 0) verdict = "Pas de point bloquant, " + ar + ".";
    else verdict = "Dossier en ordre : vous pouvez facturer les frais et relancer sur cette base.";

    // Actions
    if (!avisOk) actions.push("Envoyez aujourd'hui un avis écrit de mise à disposition (e-mail ou courrier), avec des photos de la commande prête et emballée.");
    if (!medValide && (besoinMED || medIncoherente)) actions.push("Envoyez la mise en demeure ci-dessous en recommandé avec avis de réception, avec un délai au " + fmtDate(echeanceProposee) + ".");
    if (clause && frais > 0) actions.push("Facturez les frais de stockage courus (" + fmtEur(frais) + " HT au " + fmtDate(calc) + ") sur une facture distincte, puis à chaque fin de mois.");
    if (!clause) actions.push("Notez le coût réel du stockage (place, manutention, assurance) pour pouvoir le justifier ; ne facturez pas un tarif que le client n'a pas accepté.");
    if (risquesStatut === "warn") actions.push("Vérifiez avec votre assureur que la commande stockée est couverte tant qu'elle est à vos risques.");
    if (sequestrePossible) actions.push("Demandez un prix à un garde-meubles ou à un entrepositaire, puis notifiez le séquestre au client : c'est cette notification qui vous libère (article 1345-1).");
    else if (medValide) actions.push("Notez le " + fmtDate(sequestreDes) + " dans le dossier : à partir de cette date, le séquestre devient possible si rien ne bouge.");
    if (x.solde > 0 && x.exigibilite === "oui") actions.push("Facturez le solde de " + fmtEur(x.solde) + " HT et gardez la commande jusqu'au paiement.");
    if (res1657 && calc >= res1657) actions.push("Avant d'invoquer l'article 1657, demandez-vous si vous pourrez revendre le bien ; sinon, réclamez plutôt le prix.");
    if (vente1903 && calc >= vente1903) actions.push("Préparez la requête au juge : date de réception de l'objet, désignation, prix de façon réclamé, nom du propriétaire, lieu du dépôt (loi de 1903, article 2).");
    if (x.terme === 0 || !clause || x.exigibilite === "non" || x.risquesClause === "non") actions.push("Dans vos prochains devis, écrivez un délai de retrait, un tarif de stockage, l'exigibilité du solde à la mise à disposition et le transfert des risques (clause ci-dessus).");
    actions.push("Gardez dans le dossier l'avis, les photos, les relances et les accusés de réception, dans l'ordre.");

    // Clause
    var lignes = ["Mise à disposition, retrait et stockage"];
    lignes.push("1. Mise à disposition : nous vous prévenons par écrit dès que la commande est prête. Cet avis daté fait courir les délais ci-dessous.");
    lignes.push("2. Retrait : la commande est retirée, ou sa livraison acceptée à une date ferme, dans les " + (x.terme > 0 ? x.terme : 15) + " jours qui suivent l'avis.");
    lignes.push("3. Solde : le solde du prix est exigible à la date de l'avis de mise à disposition, que la commande soit retirée ou non.");
    lignes.push("4. Stockage : au-delà de " + pluriel(x.franchise, "jour") + " après l'avis, la commande est stockée à vos frais, au tarif de " + fmtEur(x.prix) + " HT par " + uniteMot + " et par emplacement occupé, facturé chaque mois.");
    lignes.push("5. Risques : à compter de l'avis de mise à disposition, les risques de perte et de détérioration de la commande vous sont transférés, sauf faute de notre part" + (x.reserve === "oui" ? ", la propriété restant réservée jusqu'au paiement complet." : "."));
    lignes.push("6. Défaut de retrait : faute de retrait dans ce délai, nous pourrons vous mettre en demeure ; deux mois après une mise en demeure restée sans effet, nous pourrons confier la commande à un gardien professionnel, à vos frais (articles 1345 à 1345-3 du code civil).");
    if (x.nature === "vente") lignes.push("7. Résolution : passé le délai de retrait, la vente pourra être résolue de plein droit (article 1657 du code civil) ; les sommes versées seront restituées, déduction faite des frais de stockage et du préjudice justifié.");
    else if (x.nature === "entreprise") lignes.push("7. Clause résolutoire : si la commande n'est ni retirée ni payée dans les quinze jours d'une mise en demeure citant la présente clause, le contrat pourra être résolu de plein droit (article 1225 du code civil).");
    else lignes.push("7. Objets confiés : un objet non retiré dans l'année qui suit l'avis de mise à disposition pourra être vendu aux enchères sur autorisation du juge (loi du 31 décembre 1903).");
    var clauseTxt = lignes.join("\n");

    // Message
    var echeance = medValide ? finDelaiMED : echeanceProposee;
    var m = ["Objet : mise en demeure de prendre livraison de votre commande", "", "Madame, Monsieur,", ""];
    m.push("Votre commande, d'un montant de " + fmtEur(x.montant) + " HT, est prête et à votre disposition depuis le " + fmtDate(dispo) + (avisOk ? ", comme indiqué dans notre avis du même jour." : ". Nous vous le confirmons par la présente."));
    if (finTerme) m.push("Le délai de retrait prévu au devis " + (termeDepasse ? "a expiré le " : "expire le ") + fmtDate(finTerme) + ".");
    m.push("Nous vous mettons en demeure d'en prendre livraison, ou de nous donner une date de livraison ferme, au plus tard le " + fmtDate(echeance) + ".");
    m.push("Conformément à l'article 1345 du code civil, à compter de la réception de cette lettre, les risques de la commande sont à votre charge, sauf faute lourde ou dolosive de notre part.");
    if (clause && frais > 0) m.push("Les frais de stockage prévus au devis courent depuis le " + fmtDate(debutFrais) + " : " + fmtEur(frais) + " HT au " + fmtDate(calc) + ", puis " + fmtEur(x.prix) + " HT par " + uniteMot + " et par emplacement.");
    else if (clause) m.push("Les frais de stockage prévus au devis courront à partir du " + fmtDate(debutFrais) + " : " + fmtEur(x.prix) + " HT par " + uniteMot + " et par emplacement.");
    else m.push("Votre commande occupe " + pluriel(x.nbUnites, "emplacement") + " dans nos locaux ; nous nous réservons d'en demander l'indemnisation.");
    if (x.solde > 0) m.push("Le solde de " + fmtEur(x.solde) + " HT " + (x.exigibilite === "oui" ? "est exigible depuis le " + fmtDate(dispo) + "." : "reste dû à la livraison."));
    m.push("À défaut, deux mois après la réception de cette lettre, nous pourrons confier la commande à un gardien professionnel, à vos frais (articles 1345-1 et 1345-3 du code civil).");
    if (x.nature === "vente" && finTerme && avisOk) m.push("Nous nous réservons également de faire jouer l'article 1657 du code civil (résolution de plein droit de la vente après le terme de retrait).");
    if (x.nature === "confie") m.push("Si l'objet n'est pas retiré dans l'année qui suit le " + fmtDate(dispo) + ", nous pourrons demander au juge l'autorisation de faire vendre l'objet (loi du 31 décembre 1903).");
    m.push("Nous restons à votre disposition pour convenir d'une date.", "", "Veuillez agréer, Madame, Monsieur, nos salutations distinguées.");
    var message = m.join("\n");

    var termeLabel = finTerme ? fmtDate(finTerme) : (dispo ? "Aucun délai écrit" : "Date à renseigner");
    var recap = [
      "Commande non retirée : récapitulatif",
      "Nature : " + LABEL_SETS.nature[x.nature],
      "Montant : " + fmtEur(x.montant) + " HT, reste dû " + fmtEur(x.solde) + " HT",
      "Mise à disposition : " + fmtDate(dispo) + (avisOk ? " (avis écrit)" : " (sans avis écrit)"),
      "Retrait convenu au plus tard : " + (finTerme ? fmtDate(finTerme) : "aucun délai écrit"),
      "Frais de stockage au " + fmtDate(calc) + " : " + fraisLabel,
      "Mise en demeure : " + (medValide ? "reçue le " + fmtDate(x.med) + ", délai au " + fmtDate(finDelaiMED) : "pas encore envoyée"),
      "Risques : " + risquesLabel,
      "Séquestre ou vente autorisée : " + sequestreLabel,
      "Contrôle : " + pluriel(nbOk, "conforme") + ", " + nbWarn + " à revoir, " + pluriel(nbBad, "bloquant") + ", " + pluriel(nbInfo, "information"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      x: x, finTerme: finTerme, termeDepasse: termeDepasse, debutFrais: debutFrais, joursFactures: joursFactures, periodes: periodes, frais: frais,
      medValide: medValide, finDelaiMED: finDelaiMED, sequestreDes: sequestreDes, sequestrePossible: sequestrePossible, res1657: res1657, vente1903: vente1903,
      echeance: echeance, termeLabel: termeLabel, fraisLabel: fraisLabel, risquesLabel: risquesLabel, sequestreLabel: sequestreLabel,
      controles: c, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat, verdict: verdict,
      actions: actions, clause: clauseTxt, message: message, recap: recap
    };
  }

export {
  SLUG,
  DEFAULTS,
  STATUT_LABELS,
  POINTS,
  LABEL_SETS,
  SEQUESTRE_MOIS,
  LOI_1903_MOIS,
  JOURS_PERIODE,
  computeStockage,
  normalize,
  parseDate,
  isoDate,
  addDays,
  addMonths,
  joursEntre,
  nbPeriodes,
  fmtDate,
  fmtNum,
  fmtEur,
  dec,
  ent,
  pluriel,
};
