/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-clause-non-sollicitation-personnel";
  var ROLE_LABELS = { prestataire: "prestataire qui rédige la clause", client: "client qui relit la clause" };
  var RELATION_LABELS = { client: "client et prestataire de services", concurrents: "entreprises concurrentes ou d'un même réseau", interim: "agence d'intérim et entreprise utilisatrice" };
  var INTERET_LABELS = { documente: "intérêt protégé expliqué et documenté", silence: "intérêt protégé non expliqué" };
  var PERSONNES_LABELS = { intervenants: "personnes ayant travaillé sur le contrat", metier: "un métier ou un service entier", tous: "tout le personnel" };
  var ACTES_LABELS = { sollicitation: "sollicitation seulement", embauche: "embauche directe seulement", indirect: "embauche ou recours, direct ou par personne interposée" };
  var INITIATIVE_LABELS = { exclue: "candidature à une offre publique exclue", silence: "rien sur l'initiative du salarié", incluse: "interdit quelle que soit l'initiative" };
  var DEROGATION_LABELS = { prevue: "dérogation par accord écrit", silence: "pas de dérogation prévue" };
  var RECIPROCITE_LABELS = { unilaterale: "clause unilatérale", reciproque: "clause réciproque" };
  var SANCTION_LABELS = { indemnite: "indemnité en mois de salaire", droitCommun: "droit commun" };
  var ACCEPTATION_LABELS = { signe: "écrite dans le devis signé", cgvSignees: "CGV jointes et acceptées dans le devis signé", cgvVerso: "CGV au verso ou en lien, sans mention d'acceptation", aucune: "CGV jamais transmises" };
  var NEGOCIATION_LABELS = { negociee: "clause négociée", adhesion: "CGV non négociables" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var DEFAULTS = {
    role: "prestataire", relation: "client", dateDebut: "2026-12-01", dureeContratMois: 12, dureeApresMois: 24,
    interet: "silence", personnes: "tous", actes: "indirect", initiative: "silence", derogation: "prevue", reciprocite: "unilaterale",
    sanction: "indemnite", indemniteMois: 12, salaireMensuel: 3200, acceptation: "cgvSignees", negociation: "adhesion"
  };

  function num(v, min, max, fallback) {
    var n = typeof v === "number" ? v : parseFloat(String(v === undefined || v === null ? "" : v).replace(/[\s\u00a0]/g, "").replace(",", "."));
    if (!isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }
  function pick(v, obj, fallback) { return Object.prototype.hasOwnProperty.call(obj, v) ? v : fallback; }
  function groupe(entier) { return String(entier).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0"); }
  function fmtEur(n) { return groupe(Math.round(n)) + "\u00a0€"; }
  function pluriel(n, un, plusieurs) { return n + " " + (n > 1 ? plusieurs : un); }
  // Date ISO valide (AAAA-MM-JJ) ou null.
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var t = new Date(Date.UTC(y, mo - 1, d));
    if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d };
  }
  function joursDansMois(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  // Ajoute des mois ; le jour est ramené au dernier jour du mois si besoin (31 janvier + 1 mois = 28 ou 29 février).
  function addMonths(dt, n) {
    var total = dt.y * 12 + (dt.m - 1) + n;
    var y = Math.floor(total / 12), m = total % 12 + 1;
    return { y: y, m: m, d: Math.min(dt.d, joursDansMois(y, m)) };
  }
  function veille(dt) {
    var t = new Date(Date.UTC(dt.y, dt.m - 1, dt.d) - 86400000);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }
  // Dernier jour d'une période de n mois commençant le jour dt.
  function finPeriode(dt, n) { return veille(addMonths(dt, n)); }
  function fmtDate(dt) { return (dt.d === 1 ? "1er" : String(dt.d)) + " " + MOIS[dt.m - 1] + " " + dt.y; }
  function mois(n) { return n + " mois"; }

  function computeNonSollicitation(input) {
    var d = {};
    for (var key in DEFAULTS) d[key] = input && input[key] !== undefined ? input[key] : DEFAULTS[key];
    var role = pick(d.role, ROLE_LABELS, "prestataire");
    var relation = pick(d.relation, RELATION_LABELS, "client");
    var interet = pick(d.interet, INTERET_LABELS, "silence");
    var personnes = pick(d.personnes, PERSONNES_LABELS, "tous");
    var actes = pick(d.actes, ACTES_LABELS, "indirect");
    var initiative = pick(d.initiative, INITIATIVE_LABELS, "silence");
    var derogation = pick(d.derogation, DEROGATION_LABELS, "silence");
    var reciprocite = pick(d.reciprocite, RECIPROCITE_LABELS, "unilaterale");
    var sanction = pick(d.sanction, SANCTION_LABELS, "droitCommun");
    var acceptation = pick(d.acceptation, ACCEPTATION_LABELS, "aucune");
    var negociation = pick(d.negociation, NEGOCIATION_LABELS, "adhesion");
    var dureeContratMois = num(d.dureeContratMois, 1, 120, DEFAULTS.dureeContratMois);
    var dureeApresMois = num(d.dureeApresMois, 0, 120, 0);
    var indemniteMois = num(d.indemniteMois, 0, 60, 0);
    var salaireMensuel = num(d.salaireMensuel, 0, 1000000, 0);
    var debut = parseDate(d.dateDebut) || parseDate(DEFAULTS.dateDebut);
    var prestataire = role === "prestataire";
    var interim = relation === "interim";

    var finContrat = finPeriode(debut, dureeContratMois);
    var finInterdiction = finPeriode(debut, dureeContratMois + dureeApresMois);
    var finContratLabel = fmtDate(finContrat);
    var finInterdictionLabel = interim ? "Clause non écrite" : fmtDate(finInterdiction);
    var montant = sanction === "indemnite" ? indemniteMois * salaireMensuel : 0;
    var indemniteLabel;
    if (sanction !== "indemnite") indemniteLabel = "Préjudice à prouver";
    else if (indemniteMois === 0) indemniteLabel = "Montant à fixer";
    else if (salaireMensuel === 0) indemniteLabel = mois(indemniteMois) + " de salaire";
    else indemniteLabel = fmtEur(montant);

    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    if (interim) add("Type de relation", "bad", "Entre une agence d'intérim et l'entreprise utilisatrice, toute clause tendant à interdire l'embauche du salarié temporaire à l'issue de sa mission est réputée non écrite (article L1251-44 du code du travail). Le contrat de mise à disposition doit d'ailleurs le rappeler (article L1251-16, 7°).");
    else if (relation === "concurrents") add("Type de relation", "info", "C'est la situation des arrêts du 27 mai 2021 (n° 18-23.261) et du 23 septembre 2026 (n° 24-21.805) : la clause doit être proportionnée aux intérêts légitimes à protéger au regard de l'objet du contrat.");
    else add("Type de relation", "info", "Les arrêts publiés de 2021 et 2026 concernent des entreprises concurrentes. Aucune décision publiée de la Cour de cassation n'applique encore ce contrôle à une clause entre client et prestataire : rédigez comme s'il s'appliquait.");

    if (acceptation === "signe") add("Acceptation de la clause", "ok", "La clause est écrite dans le devis signé : son acceptation ne fait pas débat.");
    else if (acceptation === "cgvSignees") add("Acceptation de la clause", "ok", "Les CGV sont jointes et le devis signé indique qu'elles sont acceptées : c'est ce qu'exige l'article 1119 du code civil pour qu'elles soient opposables.");
    else if (acceptation === "cgvVerso") add("Acceptation de la clause", "warn", "Des CGV au verso ou derrière un lien, sans mention d'acceptation dans le devis signé, laissent un doute sur leur acceptation (article 1119 du code civil). Ajoutez la phrase d'acceptation au devis.");
    else add("Acceptation de la clause", "bad", "Des conditions générales que le client n'a jamais reçues ne lui sont pas opposables : elles doivent avoir été portées à sa connaissance et acceptées (article 1119 du code civil).");

    if (interet === "documente") add("Intérêt protégé", "ok", "La clause dit pourquoi elle existe et vous gardez les pièces (formations payées, durée de recrutement, rôle des personnes dans le contrat). C'est ce que devra montrer celui qui l'invoque.");
    else add("Intérêt protégé", "warn", (prestataire ? "Si vous invoquez la clause, c'est à vous" : "Si le prestataire invoque la clause, c'est à lui") + " de démontrer qu'elle est proportionnée aux intérêts légitimes à protéger au regard de l'objet du contrat (Cass. com., 23 septembre 2026, n° 24-21.805). Écrivez l'intérêt protégé dans la clause.");

    if (personnes === "intervenants") add("Personnes visées", "ok", "Seules les personnes qui ont travaillé sur le contrat sont visées : c'est le lien le plus simple à justifier avec l'objet du contrat.");
    else if (personnes === "metier") add("Personnes visées", "warn", "Tout un métier ou un service est visé, y compris des personnes que le client n'a jamais croisées. Limitez aux intervenants du contrat, par exemple sur les douze derniers mois.");
    else add("Personnes visées", "warn", "Tout le personnel est visé, y compris des salariés sans lien avec le contrat. C'est le point le plus difficile à justifier. Limitez aux intervenants du contrat.");

    var dureeTexte = dureeApresMois === 0 ? "L'interdiction ne joue que pendant le contrat, jusqu'au " + finContratLabel + "." : "L'interdiction court jusqu'au " + finInterdictionLabel + ", soit " + mois(dureeApresMois) + " après la fin du contrat.";
    if (dureeApresMois <= 12) add("Durée", "ok", dureeTexte + " Dans le repère de l'outil (douze mois au plus après la fin).");
    else if (dureeApresMois <= 24) add("Durée", "warn", dureeTexte + " Au delà du repère de douze mois de l'outil : il faudra justifier cette durée. Aucun texte ne fixe de maximum.");
    else add("Durée", "bad", dureeTexte + " Plus de vingt-quatre mois après la fin : au delà de tout repère de l'outil. Réduisez, ou documentez une raison très précise.");

    if (actes === "indirect") add("Actes visés", "ok", "L'embauche et le recours au salarié, directement ou par personne interposée, sont visés : le contournement par une société tierce est couvert.");
    else if (actes === "embauche") add("Actes visés", "info", "Seule l'embauche directe est visée : un passage par une société tierce ou un statut d'indépendant n'est pas couvert. Ajoutez « directement ou par personne interposée » si c'est l'intention.");
    else add("Actes visés", "info", "Seule la sollicitation est visée : l'embauche d'un salarié qui a postulé de lui-même n'est pas couverte. C'est cohérent si c'est l'intention.");

    if (actes === "sollicitation") add("Initiative du salarié", "ok", "La clause ne vise que la sollicitation : une candidature spontanée n'est pas couverte, ce qui est clair.");
    else if (initiative === "exclue") add("Initiative du salarié", "ok", "La réponse à une offre publique non ciblée est exclue : la clause n'empêche pas le salarié de postuler librement.");
    else if (initiative === "silence") add("Initiative du salarié", "warn", "La clause ne dit pas ce qui se passe si le salarié postule de lui-même. Écrivez-le, dans un sens ou dans l'autre, pour éviter un débat sur l'initiative.");
    else add("Initiative du salarié", "warn", "La clause interdit l'embauche même à l'initiative du salarié : elle pèse alors sur sa liberté de travailler, ce qui rend la justification plus exigeante.");

    if (derogation === "prevue") add("Dérogation", "ok", "Un accord écrit peut lever l'interdiction pour un salarié. Utile, mais cela ne suffit pas à rendre la clause proportionnée (Cass. com., 27 mai 2021, n° 18-23.261).");
    else add("Dérogation", "info", "Rien n'est prévu pour lever l'interdiction au cas par cas. Une dérogation par accord écrit donne une issue simple quand un salarié veut partir.");

    if (reciprocite === "reciproque") add("Réciprocité", "ok", "Chaque partie s'engage envers l'autre. Cela ne remplace pas la justification de la clause.");
    else add("Réciprocité", "info", "Seul le client s'engage. Ce n'est pas un défaut en soi : c'est en général le prestataire qui forme et met à disposition ses équipes.");

    if (sanction === "indemnite") {
      var montantTexte = salaireMensuel > 0 ? ", soit " + fmtEur(montant) + " sur la base d'un salaire de " + fmtEur(salaireMensuel) : "";
      if (indemniteMois === 0) add("Indemnité", "warn", "Une indemnité est prévue sans montant. Fixez un nombre de mois de salaire brut de la personne concernée.");
      else if (indemniteMois <= 12) add("Indemnité", "ok", "Indemnité de " + mois(indemniteMois) + " de salaire brut" + montantTexte + ". C'est une clause pénale : le juge peut la réduire si elle est manifestement excessive (article 1231-5 du code civil).");
      else add("Indemnité", "warn", "Indemnité de " + mois(indemniteMois) + " de salaire brut" + montantTexte + ", au delà du repère de douze mois de l'outil. Le juge peut réduire une pénalité manifestement excessive (article 1231-5 du code civil).");
    } else if (prestataire) add("Indemnité", "warn", "Sans indemnité prévue, il faudra prouver le préjudice causé par le départ du salarié et son lien avec le manquement. Envisagez une indemnité en mois de salaire.");
    else add("Indemnité", "info", "Pas d'indemnité forfaitaire : en cas de manquement, le prestataire devra prouver son préjudice.");

    if (negociation === "negociee") add("Négociation", "ok", "La clause a été discutée : l'article 1171 du code civil sur les contrats d'adhésion ne s'applique pas à une clause négociée.");
    else add("Négociation", "info", "Dans un contrat d'adhésion, une clause non négociable qui crée un déséquilibre significatif peut être réputée non écrite (article 1171 du code civil). Une clause limitée et justifiée limite ce risque.");

    add("Situation du salarié", "info", "Le salarié n'a pas signé la clause : elle ne l'engage pas (article 1199 du code civil). Si elle a fait obstacle à une embauche, il peut agir contre son employeur (Cass. soc., 2 mars 2011, n° 09-40.547).");

    if (interim) add("Fin de l'interdiction", "info", "Sans objet : l'interdiction d'embauche à l'issue de la mission est réputée non écrite.");
    else add("Fin de l'interdiction", "info", "Notez la date du " + (dureeApresMois === 0 ? finContratLabel : finInterdictionLabel) + " dans le dossier : après cette date, la clause ne joue plus.");

    var nb = { ok: 0, warn: 0, bad: 0, info: 0 };
    for (var i = 0; i < controles.length; i++) nb[controles[i].statut]++;
    var etat = nb.bad > 0 ? "bad" : (nb.warn > 0 ? "warn" : "ok");
    var verdict;
    if (etat === "bad") verdict = pluriel(nb.bad, "point bloquant", "points bloquants") + (nb.warn ? " et " + pluriel(nb.warn, "point", "points") + " à compléter" : "") + " : la clause ne pourra pas être opposée en l'état.";
    else if (etat === "warn") verdict = prestataire ? "Aucun point bloquant, mais " + pluriel(nb.warn, "point", "points") + " à compléter : en l'état, la proportionnalité sera difficile à démontrer." : "Aucun point bloquant, mais " + pluriel(nb.warn, "point", "points") + " à négocier avant de signer.";
    else verdict = "La clause est limitée et justifiée. Gardez les pièces qui montrent l'intérêt protégé.";
    if (!interim) verdict += " Interdiction jusqu'au " + (dureeApresMois === 0 ? finContratLabel : finInterdictionLabel) + ".";

    // Clause proposée, avec les points corrigés.
    var apresPropose = Math.min(dureeApresMois, 12);
    var indemPropose = indemniteMois === 0 ? 6 : Math.min(indemniteMois, 12);
    var art = [];
    var clauseTitre = "Non-sollicitation du personnel";
    if (interim) {
      art.push("Aucune clause : toute stipulation interdisant à l'entreprise utilisatrice d'embaucher le salarié temporaire à l'issue de sa mission est réputée non écrite (article L1251-44 du code du travail). Le contrat de mise à disposition le rappelle (article L1251-16, 7°).");
    } else {
      art.push("Objet : le Prestataire forme et met à disposition du Client des intervenants qualifiés pour [objet du contrat]. La présente clause protège cet investissement et la continuité du service, sans autre but.");
      art.push("Personnes visées : les salariés du Prestataire qui sont intervenus pour le Client au titre du contrat au cours des douze mois précédant la fin du contrat ou la sollicitation.");
      var actesTexte = actes === "sollicitation" ? "à ne pas solliciter les personnes visées en vue de les embaucher ou de les faire travailler" : "à ne pas solliciter, embaucher ou faire travailler les personnes visées, directement ou par personne interposée, quel que soit leur statut";
      art.push("Engagement : le Client s'engage " + actesTexte + ", pendant la durée du contrat" + (apresPropose > 0 ? " et pendant " + mois(apresPropose) + " après sa fin." : "."));
      if (actes !== "sollicitation") art.push("Exception : l'engagement ne s'applique pas à l'embauche d'une personne visée qui répond, de sa propre initiative, à une offre d'emploi publiée et non ciblée.");
      if (reciprocite === "reciproque") art.push("Réciprocité : le Prestataire prend le même engagement envers les salariés du Client qui ont suivi l'exécution du contrat.");
      art.push("Dérogation : le Prestataire peut lever l'interdiction pour une personne, par accord écrit préalable.");
      if (sanction === "indemnite") art.push("Indemnité : tout manquement entraîne le paiement d'une indemnité égale à " + mois(indemPropose) + " du dernier salaire brut de la personne concernée" + (salaireMensuel > 0 ? ", soit " + fmtEur(indemPropose * salaireMensuel) + " pour un salaire de " + fmtEur(salaireMensuel) : "") + ".");
      else art.push("Sanction : tout manquement engage la responsabilité du Client dans les conditions du droit commun.");
    }
    var clause = clauseTitre;
    for (var j = 0; j < art.length; j++) clause += "\n" + (j + 1) + ". " + art[j];

    var actions = [];
    for (var k = 0; k < controles.length; k++) if (controles[k].statut === "bad" || controles[k].statut === "warn") actions.push(controles[k].point + " : " + controles[k].texte);
    actions.push(interim ? "Retirez la clause de non-embauche des conditions de mise à disposition." : "Gardez dans le dossier la liste des intervenants, leurs dates d'intervention et les pièces qui justifient la clause.");

    var aTraiter = [];
    for (var q = 0; q < controles.length; q++) if (controles[q].statut === "bad" || controles[q].statut === "warn") aTraiter.push(controles[q].point.toLowerCase());
    var message;
    if (prestataire) {
      message = "Bonjour,\n\n";
      if (interim) message += "Nos conditions ne contiennent pas d'interdiction d'embaucher nos intérimaires à l'issue de leur mission : la loi la répute non écrite (article L1251-44 du code du travail).";
      else if (etat === "ok") message += "Notre devis comporte une clause de non-sollicitation de notre personnel. Elle se limite aux personnes qui interviendront chez vous, pendant le contrat" + (dureeApresMois > 0 ? " et " + mois(dureeApresMois) + " après sa fin" : "") + ", et elle explique pourquoi nous la demandons.";
      else message += "Notre devis comporte une clause de non-sollicitation de notre personnel. Nous l'avons revue pour la limiter aux personnes qui interviendront chez vous, pendant le contrat" + (apresPropose > 0 ? " et " + mois(apresPropose) + " après sa fin" : "") + ", avec une exception pour les candidatures à vos offres publiques. Vous la trouverez ci-dessous.";
      message += "\n\nN'hésitez pas à nous dire si un point vous pose question.\n\nBien cordialement,\n[Nom]";
    } else {
      message = "Bonjour,\n\nMerci pour votre devis. ";
      if (interim) message += "Nous ne pouvons pas accepter l'interdiction d'embaucher vos intérimaires à l'issue de leur mission : elle est réputée non écrite (article L1251-44 du code du travail). Merci de la retirer.";
      else if (aTraiter.length) message += "Avant de le signer, nous souhaitons revoir la clause de non-sollicitation du personnel sur ces points : " + aTraiter.join(", ") + ". Nous vous proposons la rédaction ci-dessous.";
      else message += "La clause de non-sollicitation du personnel nous convient : nous vous retournons le devis signé.";
      message += "\n\nBien cordialement,\n[Nom]";
    }

    var statutLabel = STATUT_LABELS[etat];
    var recap = [
      "Clause de non-sollicitation du personnel : contrôle",
      "Position : " + ROLE_LABELS[role],
      "Relation : " + RELATION_LABELS[relation],
      "Contrat : du " + fmtDate(debut) + " au " + finContratLabel + " (" + mois(dureeContratMois) + ")",
      "Interdiction : " + (interim ? "réputée non écrite (article L1251-44)" : dureeApresMois === 0 ? "pendant le contrat seulement, jusqu'au " + finContratLabel : "jusqu'au " + finInterdictionLabel + " (" + mois(dureeApresMois) + " après la fin)"),
      "Personnes visées : " + PERSONNES_LABELS[personnes] + ", " + ACTES_LABELS[actes],
      "Sanction : " + (sanction === "indemnite" ? mois(indemniteMois) + " de salaire brut" + (salaireMensuel > 0 ? ", soit " + fmtEur(montant) : "") : "droit commun, préjudice à prouver"),
      "Acceptation : " + ACCEPTATION_LABELS[acceptation] + ", " + NEGOCIATION_LABELS[negociation],
      "Statut : " + statutLabel + " (" + nb.bad + " bloquant" + (nb.bad > 1 ? "s" : "") + ", " + nb.warn + " à compléter, " + nb.ok + " conforme" + (nb.ok > 1 ? "s" : "") + ", " + nb.info + " pour information)",
      "Points à traiter : " + (aTraiter.length ? aTraiter.join(", ") : "aucun"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      role: role, relation: relation, actes: actes, sanction: sanction, dureeContratMois: dureeContratMois, dureeApresMois: dureeApresMois,
      indemniteMois: indemniteMois, salaireMensuel: salaireMensuel, montant: montant, debut: debut,
      finContrat: finContrat, finContratLabel: finContratLabel, finInterdiction: interim ? null : finInterdiction, finInterdictionLabel: finInterdictionLabel,
      indemniteLabel: indemniteLabel, controles: controles, nbOk: nb.ok, nbWarn: nb.warn, nbBad: nb.bad, nbInfo: nb.info, etat: etat, statutLabel: statutLabel,
      verdict: verdict, apresPropose: apresPropose, indemPropose: indemPropose, clause: clause, articles: art.length, actions: actions, message: message, recap: recap
    };
  }
  function buildRecap(input) { return computeNonSollicitation(input).recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, ROLE_LABELS, RELATION_LABELS, INTERET_LABELS, PERSONNES_LABELS, ACTES_LABELS, INITIATIVE_LABELS, DEROGATION_LABELS, RECIPROCITE_LABELS, SANCTION_LABELS, ACCEPTATION_LABELS, NEGOCIATION_LABELS, computeNonSollicitation, buildRecap, fmtEur, fmtDate, addMonths, finPeriode, parseDate, num };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var IDS = Object.keys(DEFAULTS);
    var $ = function (id) { return document.getElementById(id); };
    var read = function () { var o = {}; for (var i = 0; i < IDS.length; i++) o[IDS[i]] = $(IDS[i]).value; return o; };
    var render = function () {
      var r = computeNonSollicitation(read());
      $("finContrat").textContent = r.finContratLabel;
      $("finInterdiction").textContent = r.finInterdictionLabel;
      $("indemniteOut").textContent = r.indemniteLabel;
      $("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      $("verdict").className = "alert " + r.etat;
      $("verdict").textContent = r.verdict;
      var tb = $("controles");
      tb.innerHTML = "";
      for (var i = 0; i < r.controles.length; i++) {
        var c = r.controles[i];
        var tr = document.createElement("tr");
        if (c.statut === "bad") tr.className = "cur";
        else if (c.statut === "warn") tr.className = "weak";
        var a = document.createElement("td"); a.textContent = c.point;
        var b = document.createElement("td"); b.textContent = STATUT_LABELS[c.statut];
        var t = document.createElement("td"); t.textContent = c.texte;
        tr.appendChild(a); tr.appendChild(b); tr.appendChild(t); tb.appendChild(tr);
      }
      $("clause").textContent = r.clause;
      var ul = $("actions");
      ul.innerHTML = "";
      for (var j = 0; j < r.actions.length; j++) { var li = document.createElement("li"); li.textContent = r.actions[j]; ul.appendChild(li); }
      $("message").textContent = r.message;
      $("recap").textContent = r.recap;
    };
    for (var n = 0; n < IDS.length; n++) { $(IDS[n]).addEventListener("input", render); $(IDS[n]).addEventListener("change", render); }
    var btns = document.querySelectorAll("button.copy");
    for (var b2 = 0; b2 < btns.length; b2++) {
      btns[b2].addEventListener("click", function (ev) {
        var target = $(ev.currentTarget.getAttribute("data-target"));
        if (target && navigator.clipboard) navigator.clipboard.writeText(target.textContent);
      });
    }
    render();
  
  return built.snapshot();
}
