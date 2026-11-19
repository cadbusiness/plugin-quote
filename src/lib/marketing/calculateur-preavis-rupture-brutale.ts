/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "calculateur-preavis-rupture-brutale";
  var ROLE_LABELS = { victime: "partenaire qui subit la rupture", auteur: "partenaire qui rompt" };
  var TYPE_LABELS = { totale: "rupture totale", partielle: "rupture partielle" };
  var ECRIT_LABELS = { oui: "annonce écrite", non: "annonce sans écrit" };
  var EXCLUSIVITE_LABELS = { non: "non", oui: "oui" };
  var INVEST_LABELS = { aucun: "aucun", moyens: "moyens, en partie amortis", lourds: "lourds, non amortis" };
  var AO_LABELS = { aucun: "aucun appel d'offres", ponctuel: "un appel d'offres isolé", annuel: "appels d'offres annuels réguliers" };
  var CONDITIONS_LABELS = { maintenues: "maintenues", baisseLegere: "en baisse limitée", baisseForte: "en baisse substantielle" };
  var MOTIF_LABELS = { aucun: "choix commercial ou réorganisation", inexecutionGrave: "manquement grave de l'autre partie", inexecutionMineure: "manquements ponctuels ou mineurs", forceMajeure: "force majeure" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Ancienneté de la relation", "Stabilité de la relation", "Préavis écrit", "Durée du préavis accordé",
    "Plafond de dix-huit mois", "Préavis du contrat", "Usages et accords interprofessionnels",
    "Dépendance et investissements", "Conditions pendant le préavis", "Motif de la rupture",
    "Préjudice estimé", "Juridiction compétente"
  ];
  var DEFAULTS = {
    role: "victime",
    typeRupture: "totale",
    baisseVolume: 40,
    dateDebut: "2018-03-01",
    dateNotification: "2026-11-16",
    dateFin: "2026-12-31",
    preavisEcrit: "oui",
    preavisContractuel: 3,
    usages: 0,
    partCA: 22,
    exclusivite: "non",
    investissements: "moyens",
    appelsOffres: "aucun",
    conditionsPreavis: "maintenues",
    motif: "aucun",
    caMensuel: 9600,
    tauxMarge: 45
  };
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
  function parseDate(s) {
    if (!s || typeof s !== "string") return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (y < 1950 || y > 2100) return null;
    var dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d };
  }
  function iso(p) { return p.y + "-" + String(p.m).padStart(2, "0") + "-" + String(p.d).padStart(2, "0"); }
  function cmpDate(a, b) { return iso(a) < iso(b) ? -1 : (iso(a) > iso(b) ? 1 : 0); }
  function daysInMonth(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function addMonths(p, n) {
    var t = p.y * 12 + (p.m - 1) + n;
    var y = Math.floor(t / 12), m = t - y * 12 + 1;
    return { y: y, m: m, d: Math.min(p.d, daysInMonth(y, m)) };
  }
  function daysBetween(a, b) { return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000); }
  function monthsBetween(a, b) {
    if (cmpDate(b, a) <= 0) return { m: 0, d: 0, dec: 0 };
    var m = (b.y - a.y) * 12 + (b.m - a.m);
    while (m > 0 && cmpDate(addMonths(a, m), b) > 0) m--;
    var d = daysBetween(addMonths(a, m), b);
    return { m: m, d: d, dec: m + d / 30 };
  }
  function fmtDate(p) {
    if (!p) return "";
    return (p.d === 1 ? "1er" : String(p.d)) + " " + MOIS[p.m - 1] + " " + p.y;
  }
  function fmtEur(n) {
    var s = String(Math.round(Math.abs(n)));
    var out = "";
    while (s.length > 3) { out = " " + s.slice(-3) + out; s = s.slice(0, -3); }
    return (n < 0 ? "\u2212" : "") + s + out + " €";
  }
  function round1(x) { return Math.round(x * 10) / 10; }
  function fmtMois(x) {
    var r = round1(x);
    var s = (r === Math.floor(r)) ? String(r) : String(r).replace(".", ",");
    return s + " mois";
  }
  function fmtAnciennete(mb) {
    var a = Math.floor(mb.m / 12), m = mb.m - a * 12;
    if (a === 0 && m === 0) return "moins d'un mois";
    var parts = [];
    if (a > 0) parts.push(a + (a > 1 ? " ans" : " an"));
    if (m > 0) parts.push(m + " mois");
    return parts.join(" et ");
  }
  function fmtDuree(mb) {
    if (mb.m === 0 && mb.d === 0) return "aucun";
    var parts = [];
    if (mb.m > 0) parts.push(mb.m + " mois");
    if (mb.d > 0) parts.push(mb.d + (mb.d > 1 ? " jours" : " jour"));
    return parts.join(" et ");
  }
  function plural(n, one, many) { return n + " " + (n > 1 ? many : one); }

  function computePreavis(input) {
    var i = input || {};
    var d = {
      role: pick(i.role, ROLE_LABELS, DEFAULTS.role),
      typeRupture: pick(i.typeRupture, TYPE_LABELS, DEFAULTS.typeRupture),
      baisseVolume: num(i.baisseVolume, 0, 100, DEFAULTS.baisseVolume),
      dateDebut: parseDate(i.dateDebut) ? i.dateDebut : DEFAULTS.dateDebut,
      dateNotification: parseDate(i.dateNotification) ? i.dateNotification : DEFAULTS.dateNotification,
      dateFin: parseDate(i.dateFin) ? i.dateFin : DEFAULTS.dateFin,
      preavisEcrit: pick(i.preavisEcrit, ECRIT_LABELS, DEFAULTS.preavisEcrit),
      preavisContractuel: num(i.preavisContractuel, 0, 36, DEFAULTS.preavisContractuel),
      usages: num(i.usages, 0, 36, DEFAULTS.usages),
      partCA: num(i.partCA, 0, 100, DEFAULTS.partCA),
      exclusivite: pick(i.exclusivite, EXCLUSIVITE_LABELS, DEFAULTS.exclusivite),
      investissements: pick(i.investissements, INVEST_LABELS, DEFAULTS.investissements),
      appelsOffres: pick(i.appelsOffres, AO_LABELS, DEFAULTS.appelsOffres),
      conditionsPreavis: pick(i.conditionsPreavis, CONDITIONS_LABELS, DEFAULTS.conditionsPreavis),
      motif: pick(i.motif, MOTIF_LABELS, DEFAULTS.motif),
      caMensuel: num(i.caMensuel, 0, 100000000, DEFAULTS.caMensuel),
      tauxMarge: num(i.tauxMarge, 0, 100, DEFAULTS.tauxMarge)
    };
    var dD = parseDate(d.dateDebut), dN = parseDate(d.dateNotification), dF = parseDate(d.dateFin);
    var debutApres = cmpDate(dD, dN) > 0;
    var anc = debutApres ? { m: 0, d: 0, dec: 0 } : monthsBetween(dD, dN);
    var annees = anc.dec / 12;
    var ancLabel = fmtAnciennete(anc);
    var partielle = d.typeRupture === "partielle";
    var facteur = partielle ? d.baisseVolume / 100 : 1;

    var majParts = [];
    var maj = 0;
    if (d.partCA >= 50) { maj += 4; majParts.push("part de " + d.partCA + " % du chiffre d'affaires (+4 mois)"); }
    else if (d.partCA >= 30) { maj += 2; majParts.push("part de " + d.partCA + " % du chiffre d'affaires (+2 mois)"); }
    if (d.exclusivite === "oui") { maj += 2; majParts.push("exclusivité (+2 mois)"); }
    if (d.investissements === "lourds") { maj += 3; majParts.push("investissements lourds non amortis (+3 mois)"); }
    else if (d.investissements === "moyens") { maj += 1; majParts.push("investissements moyens (+1 mois)"); }

    var central = Math.min(18, Math.max(1, Math.round(3 + 0.5 * annees + maj)));
    var basse = Math.max(1, Math.round(central * 0.6));
    var haute = Math.min(18, Math.max(central, Math.round(central * 1.5)));
    var repere = Math.min(18, Math.max(central, d.preavisContractuel, d.usages));
    var finRepere = addMonths(dN, repere);

    var ecrit = d.preavisEcrit === "oui";
    var finAvant = cmpDate(dF, dN) <= 0;
    var acc = ecrit ? monthsBetween(dN, dF) : { m: 0, d: 0, dec: 0 };
    var accDec = round1(acc.dec);
    var accLabel = fmtDuree(acc);
    var justifie = d.motif === "inexecutionGrave" || d.motif === "forceMajeure";
    var manquantBrut = Math.max(0, round1(repere - accDec));
    var manquant = justifie ? 0 : manquantBrut;
    var margeMensuelle = d.caMensuel * d.tauxMarge / 100;
    var perteBrute = Math.round(manquantBrut * margeMensuelle * facteur);
    var perte = justifie ? 0 : perteBrute;
    var margeOk = d.caMensuel > 0 && d.tauxMarge > 0;

    var controles = [];
    function add(idx, statut, texte) { controles.push({ point: POINTS[idx], statut: statut, texte: texte }); }

    // 1 Ancienneté
    if (debutApres) add(0, "warn", "La date de début saisie est postérieure à l'annonce : corrigez-la. L'outil compte une ancienneté nulle.");
    else if (annees < 1) add(0, "warn", "Relation de " + ancLabel + " : le caractère établi d'une relation aussi courte sera à démontrer (régularité, volume, attentes de poursuite).");
    else add(0, "info", "Relation de " + ancLabel + " à l'annonce. Une suite de devis, de commandes ou de contrats successifs peut former une relation établie, et la durée se compte depuis le début des relations, même sous des contrats antérieurs (Cass. com., 5 avril 2018, n° 16-26.568 ; 16 février 2022, n° 20-18.844).");

    // 2 Stabilité
    if (d.appelsOffres === "annuel") add(1, "warn", "Des appels d'offres annuels répétés peuvent rendre la relation précaire et écarter la rupture brutale (Cass. com., 11 janvier 2023, n° 21-18.299). À vérifier sur pièces : les appels d'offres étaient-ils réels et ouverts ?");
    else if (d.appelsOffres === "ponctuel") add(1, "info", "Un appel d'offres isolé est à apprécier au cas par cas : la décision citée visait des appels d'offres annuels répétés pendant des années.");
    else add(1, "ok", "Pas de mise en concurrence régulière : le partenaire pouvait raisonnablement compter sur la poursuite de la relation.");

    // 3 Écrit
    if (ecrit) add(2, "ok", "Annonce écrite et datée du " + fmtDate(dN) + " : le préavis court à partir de sa réception.");
    else add(2, "bad", "L'article L442-1 II du code de commerce exige un préavis écrit. Sans écrit, l'outil compte un préavis accordé de zéro.");

    // 4 Durée
    var finTxt = (ecrit && finAvant) ? " La fin annoncée tombe le jour de l'annonce ou avant : c'est une rupture immédiate." : "";
    if (justifie) add(3, "info", "Préavis accordé : " + accLabel + ". Si le motif invoqué est établi, la rupture peut se faire sans préavis ; sinon il manquerait " + fmtMois(manquantBrut) + " au regard du repère de " + repere + " mois." + finTxt);
    else if (accDec >= repere) add(3, "ok", "Préavis accordé : " + accLabel + ", au moins égal au repère de l'outil (" + repere + " mois)." + finTxt);
    else if (accDec >= basse) add(3, "warn", "Préavis accordé : " + accLabel + ". C'est dans la fourchette de l'outil (" + basse + " à " + haute + " mois) mais sous le repère de " + repere + " mois : la discussion reste ouverte." + finTxt);
    else add(3, "bad", "Préavis accordé : " + accLabel + ", sous la fourchette de l'outil (" + basse + " à " + haute + " mois) pour une relation de " + ancLabel + ". Il manque " + fmtMois(manquantBrut) + " au regard du repère." + finTxt);

    // 5 Plafond
    if (accDec >= 18) add(4, "ok", "Un préavis d'au moins dix-huit mois met à l'abri d'une action fondée sur la durée insuffisante du préavis (article L442-1 II).");
    else add(4, "info", "Le plafond de dix-huit mois protège celui qui rompt : au-delà, la durée du préavis ne peut plus lui être reprochée. Ce n'est pas une durée à accorder dans tous les cas.");

    // 6 Contrat
    if (d.preavisContractuel === 0) add(5, "info", "Pas de préavis au contrat. L'article L442-1 II s'applique quand même, et une clause qui dispense de préavis ne suffit pas à l'écarter (Cass. com., 5 avril 2018, n° 16-26.568).");
    else if (justifie) add(5, "info", "Préavis contractuel de " + d.preavisContractuel + " mois. En cas de manquement grave, vérifiez la clause de résiliation du contrat et ses formalités (mise en demeure, délai).");
    else if (accDec >= d.preavisContractuel) add(5, "ok", "Préavis contractuel de " + d.preavisContractuel + " mois respecté." + (accDec < repere ? " Il peut rester trop court au regard de l'ancienneté : le contrat ne fixe qu'un minimum." : ""));
    else add(5, "bad", "Préavis contractuel de " + d.preavisContractuel + " mois non respecté : c'est un manquement au contrat, en plus de la question de la brutalité.");

    // 7 Usages
    if (d.usages === 0) add(6, "info", "Aucun usage saisi. Le texte demande de tenir compte des usages du commerce ou des accords interprofessionnels : renseignez-vous auprès de votre fédération professionnelle.");
    else if (justifie) add(6, "info", "Usage de " + d.usages + " mois saisi. Il ne joue pas si la rupture sans préavis est justifiée par le motif invoqué.");
    else if (accDec >= d.usages) add(6, "ok", "Usage de " + d.usages + " mois respecté. Dans un dossier jugé en 2025, un préavis trois fois plus long que l'usage a été jugé suffisant (Cass. com., 19 mars 2025, n° 23-23.507).");
    else add(6, "bad", "Préavis accordé inférieur à l'usage de " + d.usages + " mois saisi pour votre profession.");

    // 8 Dépendance
    if (majParts.length === 0) add(7, "ok", "Aucun facteur aggravant saisi (part de " + d.partCA + " % du chiffre d'affaires, sans exclusivité ni investissement dédié). À titre de comparaison, une relation de quatorze ans représentant 15 à 20 % du chiffre d'affaires, sans forte dépendance, a donné six mois (Cass. com., 3 juillet 2019, n° 17-13.826).");
    else add(7, "warn", "Facteurs que l'outil ajoute au repère : " + majParts.join(", ") + ". Rassemblez les chiffres et les factures qui les prouvent : ce sont eux qui feront la différence devant le juge.");

    // 9 Conditions pendant le préavis
    if (d.conditionsPreavis === "maintenues") add(8, "ok", "Le préavis doit être effectif : la relation se poursuit aux conditions antérieures pendant toute sa durée (Cass. com., 19 mars 2025, n° 23-23.507).");
    else if (d.conditionsPreavis === "baisseLegere") add(8, "info", "Une baisse limitée peut rester admise si elle n'est pas substantielle : dans la décision du 19 mars 2025 (n° 23-23.507), une baisse de 15 % sur une année a été jugée non substantielle. À documenter mois par mois.");
    else if (accDec >= repere + 12) add(8, "warn", "Baisse substantielle pendant un préavis très long. Elle a été admise dans un dossier où le préavis dépassait largement les usages et où la réduction avait été annoncée d'emblée (Cass. com., 19 mars 2025, n° 23-23.507). À manier avec prudence.");
    else add(8, "bad", "Une baisse substantielle pendant le préavis le rend en partie fictif : la relation doit se poursuivre aux conditions antérieures, sauf circonstances particulières (Cass. com., 19 mars 2025, n° 23-23.507).");

    // 10 Motif
    if (d.motif === "aucun") add(9, "info", "Un choix commercial, même sérieux, ne dispense pas du préavis : ce qui compte, c'est un préavis écrit et suffisant (Cass. com., 24 juin 2014, n° 12-27.908).");
    else if (d.motif === "inexecutionGrave") add(9, "warn", "La rupture sans préavis est possible en cas d'inexécution suffisamment grave (article L442-1 II ; Cass. com., 16 février 2022, n° 20-18.844). Il faudra la prouver : gardez les réclamations et les mises en demeure.");
    else if (d.motif === "forceMajeure") add(9, "warn", "La force majeure permet de rompre sans préavis si ses conditions sont réunies (article 1218 du code civil). Elle est rarement admise : documentez l'événement.");
    else if (accDec >= repere) add(9, "info", "Des manquements mineurs ne justifient pas une rupture sans préavis, mais le préavis accordé atteint le repère : le motif n'a pas besoin d'être discuté.");
    else add(9, "bad", "Des difficultés ponctuelles, sans mise en garde préalable, ne justifient pas une rupture sans préavis (Cass. com., 24 juin 2014, n° 12-27.908).");

    // 11 Préjudice
    if (!margeOk) add(10, "warn", "Saisissez le chiffre d'affaires mensuel moyen et le taux de marge sur coûts variables pour estimer la perte.");
    else if (manquantBrut === 0) add(10, "ok", "Pas de préavis manquant au regard du repère : pas de perte estimée.");
    else add(10, "info", "Perte de marge estimée : " + fmtEur(perteBrute) + " (" + fmtMois(manquantBrut) + " × " + fmtEur(d.caMensuel) + " × " + d.tauxMarge + " %" + (partielle ? " × " + d.baisseVolume + " % de baisse" : "") + ")" + (justifie ? ", si le motif invoqué n'est pas retenu" : "") + ". La Cour retient la marge brute escomptée pendant le préavis non exécuté : chiffre d'affaires escompté moins les coûts variables non supportés (Cass. com., 28 juin 2023, n° 21-16.940).");

    // 12 Juridiction
    add(11, "info", "Ces litiges relèvent de juridictions désignées par décret (sièges à Marseille, Bordeaux, Tourcoing, Fort-de-France, Lyon, Nancy, Paris et Rennes), avec appel devant la cour d'appel de Paris (articles L442-4 et D442-2 du code de commerce).");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) { if (c.statut === "ok") nbOk++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");

    var chiffres = "Préavis accordé : " + accLabel + " ; repère de l'outil : " + repere + " mois ; préavis manquant : " + fmtMois(manquant) + " ; perte de marge estimée : " + fmtEur(perte) + ".";
    var verdict;
    if (nbBad > 0) verdict = plural(nbBad, "point bloquant", "points bloquants") + " et " + nbWarn + " à compléter. " + chiffres;
    else if (nbWarn > 0) verdict = "Aucun point bloquant, " + nbWarn + " à compléter. " + chiffres;
    else verdict = "Aucun point bloquant ni à compléter. " + chiffres;
    if (justifie) verdict += " Si le motif invoqué est établi, aucun préavis n'est dû ; sinon il manquerait " + fmtMois(manquantBrut) + ", soit une perte estimée de " + fmtEur(perteBrute) + ".";

    var preavisClause = Math.max(1, Math.min(18, d.preavisContractuel > 0 ? d.preavisContractuel : 3));
    var preavisLong = Math.min(18, preavisClause + 3);
    var articles = [
      "1. Durée. Le présent contrat-cadre est conclu pour [une durée indéterminée / une durée d'un an reconductible]. Les devis et bons de commande passés en application relèvent de ses conditions.",
      "2. Préavis. Chaque partie peut y mettre fin par écrit (lettre recommandée avec avis de réception, ou e-mail avec accusé de réception), en respectant un préavis de [" + preavisClause + "] mois. Ce préavis est porté à [" + preavisLong + "] mois après [dix] ans de relation, sans dépasser dix-huit mois. Il court à compter de la réception de l'écrit.",
      "3. Exécution du préavis. Pendant le préavis, les commandes se poursuivent aux conditions habituelles. Une baisse de plus de [20] % des volumes, par rapport à la moyenne des [douze] derniers mois, vaut annonce d'une rupture partielle et ouvre le même préavis.",
      "4. Prix pendant le préavis. Les prix restent ceux du bordereau en vigueur, révisés le cas échéant selon [l'indice prévu à l'article X], pour tenir compte des conditions économiques du marché.",
      "5. Manquement grave. En cas de manquement grave, la partie lésée met l'autre en demeure par écrit d'y remédier sous [trente] jours. À défaut, elle peut mettre fin au contrat sans préavis, en précisant le manquement.",
      "6. Fin de la relation. À la fin du préavis, les commandes en cours sont exécutées et chaque partie restitue les documents et matériels de l'autre."
    ];
    var clause = "Clause « Durée, préavis et fin de la relation »\n\n" + articles.join("\n\n");

    var auteur = d.role === "auteur";
    var propose = Math.max(repere, Math.ceil(accDec));
    var finPropose = addMonths(dN, propose);
    var actionMap = {
      "Ancienneté de la relation": "Retrouvez la première commande ou le premier devis signé : la date de début fixe la durée de la relation.",
      "Stabilité de la relation": "Rassemblez les appels d'offres passés et leurs résultats : s'ils étaient annuels et réels, la relation a pu être précaire.",
      "Préavis écrit": auteur ? "Envoyez l'annonce par écrit, datée, avec un préavis chiffré et une date de fin." : "Demandez une confirmation écrite de la rupture et de sa date d'effet.",
      "Durée du préavis accordé": auteur ? "Allongez le préavis jusqu'au repère de " + repere + " mois, soit jusqu'au " + fmtDate(finRepere) + "." : "Demandez par écrit un préavis de " + repere + " mois, jusqu'au " + fmtDate(finRepere) + ", ou à défaut une indemnité.",
      "Préavis du contrat": auteur ? "Respectez au minimum le préavis du contrat (" + d.preavisContractuel + " mois)." : "Rappelez par écrit le préavis contractuel de " + d.preavisContractuel + " mois.",
      "Usages et accords interprofessionnels": "Alignez le préavis sur l'usage de " + d.usages + " mois de la profession, et gardez la source de cet usage.",
      "Dépendance et investissements": "Documentez la part de chiffre d'affaires, l'exclusivité et les investissements : ils pèsent sur la durée du préavis.",
      "Conditions pendant le préavis": auteur ? "Maintenez les volumes et les prix habituels pendant tout le préavis." : "Notez chaque mois les volumes commandés pendant le préavis et comparez-les à la moyenne des douze mois précédents.",
      "Motif de la rupture": (d.motif === "inexecutionMineure") ? (auteur ? "Ne rompez pas sans préavis pour des manquements mineurs : mettez d'abord en demeure, ou accordez le préavis." : "Contestez par écrit le motif invoqué : des difficultés ponctuelles sans mise en garde ne justifient pas une rupture sans préavis.") : (auteur ? "Rassemblez les preuves du manquement et les mises en demeure restées sans effet avant de rompre sans préavis." : "Demandez par écrit le détail du manquement reproché et répondez point par point."),
      "Préjudice estimé": "Calculez la marge sur coûts variables à partir des comptes, avec votre expert-comptable."
    };
    var actions = [];
    controles.forEach(function (c) { if (c.statut === "bad" && actionMap[c.point]) actions.push(actionMap[c.point]); });
    controles.forEach(function (c) { if (c.statut === "warn" && actionMap[c.point]) actions.push(actionMap[c.point]); });
    actions.push("Gardez le contrat, l'annonce de rupture et les preuves d'envoi hors de QuoteBuilder : un dossier n'y reçoit que les fichiers envoyés par le prospect, et les notes internes (ajout seul) servent de journal daté.");

    var objetRupture = partielle ? "la baisse de " + d.baisseVolume + " % de vos commandes" : "la fin de nos commandes";
    var message;
    if (auteur) {
      if (justifie) {
        message = "Objet : fin de notre relation commerciale pour " + (d.motif === "forceMajeure" ? "force majeure" : "manquement grave") + "\n\nBonjour,\n\nNous travaillons ensemble depuis le " + fmtDate(dD) + ". " + (d.motif === "forceMajeure" ? "[Décrire l'événement, sa date et pourquoi il empêche la poursuite du contrat.]" : "Malgré notre mise en demeure du [date], [décrire le manquement] n'a pas cessé.") + " Nous mettons donc fin à notre relation à compter du " + fmtDate(dF) + ".\n\nLes commandes en cours seront [exécutées / soldées] comme suit : [préciser].\n\nCordialement";
      } else {
        message = "Objet : fin de notre relation commerciale, préavis de " + propose + " mois\n\nBonjour,\n\nNous travaillons ensemble depuis le " + fmtDate(dD) + ". Après réflexion, nous avons décidé de " + (partielle ? "réduire nos commandes d'environ " + d.baisseVolume + " %" : "mettre fin à nos commandes") + ". Pour vous laisser le temps de vous organiser, nous vous accordons un préavis de " + propose + " mois à compter de la réception de ce courrier : la relation se poursuivra aux conditions habituelles jusqu'au " + fmtDate(finPropose) + ".\n\nNous restons à votre disposition pour organiser cette période.\n\nCordialement";
      }
    } else {
      var intro = ecrit ? "Nous avons bien reçu votre courrier du " + fmtDate(dN) + " annonçant " + objetRupture + " au " + fmtDate(dF) + "." : "Vous nous avez fait savoir, sans courrier, " + objetRupture + " à compter du " + fmtDate(dF) + ".";
      if (justifie) {
        message = "Objet : votre annonce de rupture du " + fmtDate(dN) + "\n\nBonjour,\n\n" + intro + " Vous invoquez " + MOTIF_LABELS[d.motif] + ". Nous contestons ce motif : [répondre point par point]. Nous travaillons ensemble depuis le " + fmtDate(dD) + ", soit " + ancLabel + ", et nous vous demandons de maintenir nos commandes aux conditions habituelles jusqu'au " + fmtDate(finRepere) + ".\n\nCordialement";
      } else if (manquant === 0) {
        message = "Objet : votre annonce de rupture du " + fmtDate(dN) + "\n\nBonjour,\n\n" + intro + " Nous en prenons acte. Nous vous remercions de maintenir les commandes aux conditions habituelles jusqu'à cette date.\n\nCordialement";
      } else {
        message = "Objet : rupture de notre relation commerciale, demande de préavis\n\nBonjour,\n\n" + intro + " Nous travaillons ensemble depuis le " + fmtDate(dD) + ", soit " + ancLabel + ". Au regard de cette durée" + (d.partCA >= 30 ? " et de la part que représente votre activité pour nous (" + d.partCA + " %)" : "") + ", le préavis accordé (" + accLabel + ") nous paraît insuffisant.\n\nNous vous demandons de maintenir nos commandes aux conditions habituelles jusqu'au " + fmtDate(finRepere) + ", soit un préavis de " + repere + " mois. À défaut, nous estimons notre perte de marge à " + fmtEur(perte) + ", dont nous vous demanderons l'indemnisation.\n\nNous restons disponibles pour en parler.\n\nCordialement";
      }
    }

    var recapLines = [
      "Outil : préavis de rupture brutale (article L442-1 II du code de commerce)",
      "Position : " + ROLE_LABELS[d.role] + " · " + TYPE_LABELS[d.typeRupture] + (partielle ? " (baisse de " + d.baisseVolume + " %)" : ""),
      "Relation : du " + fmtDate(dD) + " au " + fmtDate(dN) + ", " + ancLabel + " · " + AO_LABELS[d.appelsOffres],
      "Annonce : " + ECRIT_LABELS[d.preavisEcrit] + " · fin annoncée le " + fmtDate(dF) + " · préavis accordé : " + accLabel,
      "Contrat : préavis de " + d.preavisContractuel + " mois · usages : " + (d.usages > 0 ? d.usages + " mois" : "non renseignés"),
      "Dépendance : " + d.partCA + " % du chiffre d'affaires · exclusivité : " + EXCLUSIVITE_LABELS[d.exclusivite] + " · investissements : " + INVEST_LABELS[d.investissements],
      "Pendant le préavis : commandes " + CONDITIONS_LABELS[d.conditionsPreavis] + " · motif : " + MOTIF_LABELS[d.motif],
      "Repère de l'outil : " + repere + " mois (fourchette " + basse + " à " + haute + " mois) · fin au repère : " + fmtDate(finRepere),
      "Préavis manquant : " + fmtMois(manquant) + " · perte de marge estimée : " + fmtEur(perte),
      "Contrôles : " + nbOk + " conforme" + (nbOk > 1 ? "s" : "") + ", " + nbWarn + " à compléter, " + nbBad + " bloquant" + (nbBad > 1 ? "s" : "") + ", " + nbInfo + " information" + (nbInfo > 1 ? "s" : ""),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    return {
      role: d.role, typeRupture: d.typeRupture, baisseVolume: d.baisseVolume, dateDebut: d.dateDebut,
      dateNotification: d.dateNotification, dateFin: d.dateFin, preavisEcrit: d.preavisEcrit,
      preavisContractuel: d.preavisContractuel, usages: d.usages, partCA: d.partCA, exclusivite: d.exclusivite,
      investissements: d.investissements, appelsOffres: d.appelsOffres, conditionsPreavis: d.conditionsPreavis,
      motif: d.motif, caMensuel: d.caMensuel, tauxMarge: d.tauxMarge,
      ancienneteMois: anc.m, ancienneteLabel: ancLabel, annees: annees, majoration: maj,
      central: central, basse: basse, haute: haute, repere: repere, finRepere: iso(finRepere), finRepereFmt: fmtDate(finRepere),
      accordeMois: acc.m, accordeJours: acc.d, accordeDec: accDec, accordeLabel: accLabel,
      justifie: justifie, manquant: manquant, manquantBrut: manquantBrut, perte: perte, perteBrute: perteBrute,
      margeMensuelle: Math.round(margeMensuelle), propose: propose,
      controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat,
      verdict: verdict, clause: clause, articles: articles.length, actions: actions, message: message,
      recap: recapLines.join("\n")
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, ROLE_LABELS, TYPE_LABELS, ECRIT_LABELS, EXCLUSIVITE_LABELS, INVEST_LABELS, AO_LABELS, CONDITIONS_LABELS, MOTIF_LABELS, computePreavis, buildRecap, fmtEur, fmtDate, fmtMois, parseDate, num, addMonths, monthsBetween };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var render = function () {
      var r = computePreavis(readForm());
      document.getElementById("ancienneteOut").textContent = r.ancienneteLabel;
      document.getElementById("fourchetteOut").textContent = r.basse + " à " + r.haute + " mois";
      document.getElementById("repereOut").textContent = r.repere + " mois";
      document.getElementById("accordeOut").textContent = r.accordeLabel;
      document.getElementById("manquantOut").textContent = fmtMois(r.manquant);
      document.getElementById("perteOut").textContent = fmtEur(r.perte);
      document.getElementById("finRepereOut").textContent = r.finRepereFmt;
      document.getElementById("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      var v = document.getElementById("verdict");
      v.textContent = r.verdict;
      v.className = "alert " + r.etat;
      var tb = document.getElementById("controles");
      tb.innerHTML = "";
      r.controles.forEach(function (c) {
        var tr = document.createElement("tr");
        if (c.statut === "warn") tr.className = "weak";
        if (c.statut === "bad") tr.className = "cur";
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
      ul.innerHTML = "";
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
