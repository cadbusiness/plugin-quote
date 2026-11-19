/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "calculateur-amortissement-outillage-specifique";
  var ROLE_LABELS = { fournisseur: "fabricant qui chiffre l'outillage", client: "client qui commande les pièces" };
  var MODE_LABELS = { separe: "facturé à part", amorti: "amorti dans le prix des pièces", mixte: "participation facturée à part, reste amorti" };
  var PROPRIETE_LABELS = { client: "le client", fournisseur: "le fabricant", rien: "rien d'écrit" };
  var TRANSFERT_LABELS = { commande: "dès l'acceptation du devis", paiement: "quand l'outillage est entièrement payé", rien: "rien d'écrit" };
  var MARQUAGE_LABELS = { oui: "plaque ou gravure au nom du propriétaire", non: "aucun marquage" };
  var GARDE_LABELS = { gratuite: "écrite, sans frais", payante: "écrite, avec frais de stockage", rien: "rien d'écrit" };
  var ASSURANCE_LABELS = { fabricant: "assuré par le fabricant", client: "assuré par le client", rien: "rien d'écrit" };
  var ENTRETIEN_LABELS = { partage: "entretien courant par le fabricant, remise en état au client", fabricant: "tout à la charge du fabricant", client: "tout à la charge du client", rien: "rien d'écrit" };
  var RESTITUTION_LABELS = { ecrite: "délai, lieu et frais écrits", rien: "rien d'écrit" };
  var RETENTION_LABELS = { clause: "clause de rétention jusqu'au paiement", rien: "rien d'écrit" };
  var ARRET_LABELS = { solde: "le client paie le reste non amorti", rien: "rien d'écrit" };
  var PLANS_LABELS = { client: "remis au client", fabricant: "gardés par le fabricant", rien: "rien d'écrit" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var POINTS = [
    "Coût et quantité", "Prise en charge", "Propriété de l'outillage", "Propriété et financement",
    "Moment du transfert", "Garde et conservation", "Assurance", "Entretien et usure",
    "Restitution", "Droit de rétention", "Arrêt avant la quantité prévue", "Plans et fichiers"
  ];
  var DEFAULTS = {
    role: "fournisseur",
    coutOutillage: 18000,
    mode: "mixte",
    participation: 6000,
    quantiteAmortissement: 20000,
    prixPiece: 2.4,
    quantiteLivree: 8000,
    propriete: "client",
    transfert: "paiement",
    marquage: "oui",
    garde: "gratuite",
    dureeConservation: 36,
    assurance: "rien",
    entretien: "partage",
    restitution: "ecrite",
    retention: "rien",
    arret: "solde",
    plans: "rien"
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
  function groupe(s) {
    var out = "";
    while (s.length > 3) { out = " " + s.slice(-3) + out; s = s.slice(0, -3); }
    return s + out;
  }
  function fmtEur(n) {
    return (n < 0 ? "\u2212" : "") + groupe(String(Math.round(Math.abs(n)))) + " €";
  }
  function fmtCents(c) {
    var a = Math.round(Math.abs(c));
    var e = Math.floor(a / 100), r = a % 100;
    return (c < 0 ? "\u2212" : "") + groupe(String(e)) + "," + (r < 10 ? "0" : "") + r + " €";
  }
  function fmtMontant(c) { return Math.round(c) % 100 === 0 ? fmtEur(Math.round(c) / 100) : fmtCents(c); }
  function fmtNb(n) { return groupe(String(Math.round(n))); }
  function fmtPct(x) {
    var r = Math.round(x * 10) / 10;
    var s = r.toFixed(1).replace(".", ",");
    return s.slice(-2) === ",0" ? s.slice(0, -2) : s;
  }
  function plural(n, one, many) { return n + " " + (n > 1 ? many : one); }

  // Montants en centimes. Part amortie répartie sur la quantité, arrondie au centime supérieur, plafonnée à la part amortie.
  function computeAmortissement(partAmortie, q, livree) {
    var amortCents = partAmortie > 0 && q > 0 ? Math.ceil(partAmortie * 100 / q) : 0;
    var recupere = q > 0 ? Math.min(Math.min(livree, q) * amortCents, partAmortie * 100) : 0;
    var reste = partAmortie * 100 - recupere;
    var surplus = q > 0 && livree > q ? (livree - q) * amortCents : 0;
    return { amortCents: amortCents, recupere: recupere, reste: reste, surplus: surplus, restantes: Math.max(q - livree, 0) };
  }
  function computePaliers(cout, participation, partAmortie, q, livree) {
    var qs = [livree];
    if (q > 0 && partAmortie > 0) qs = qs.concat([Math.round(q / 4), Math.round(q / 2), Math.round(q * 3 / 4), q]);
    var vus = {};
    qs = qs.filter(function (x) { if (vus[x]) return false; vus[x] = true; return true; }).sort(function (a, b) { return a - b; });
    return qs.map(function (n) {
      var a = computeAmortissement(partAmortie, q, n);
      var paye = participation * 100 + a.recupere;
      return { pieces: n, recupere: a.recupere, reste: a.reste, paye: paye, pct: cout > 0 ? paye / (cout * 100) * 100 : 0, courant: n === livree };
    });
  }

  function computeOutillage(input) {
    var i = input || {};
    var role = pick(i.role, ROLE_LABELS, DEFAULTS.role);
    var mode = pick(i.mode, MODE_LABELS, DEFAULTS.mode);
    var propriete = pick(i.propriete, PROPRIETE_LABELS, DEFAULTS.propriete);
    var transfert = pick(i.transfert, TRANSFERT_LABELS, DEFAULTS.transfert);
    var marquage = pick(i.marquage, MARQUAGE_LABELS, DEFAULTS.marquage);
    var garde = pick(i.garde, GARDE_LABELS, DEFAULTS.garde);
    var assurance = pick(i.assurance, ASSURANCE_LABELS, DEFAULTS.assurance);
    var entretien = pick(i.entretien, ENTRETIEN_LABELS, DEFAULTS.entretien);
    var restitution = pick(i.restitution, RESTITUTION_LABELS, DEFAULTS.restitution);
    var retention = pick(i.retention, RETENTION_LABELS, DEFAULTS.retention);
    var arret = pick(i.arret, ARRET_LABELS, DEFAULTS.arret);
    var plans = pick(i.plans, PLANS_LABELS, DEFAULTS.plans);
    var cout = num(i.coutOutillage, 0, 100000000, 0);
    var participationSaisie = num(i.participation, 0, 100000000, 0);
    var q = num(i.quantiteAmortissement, 0, 100000000, 0);
    var prix = dec(i.prixPiece, 0, 1000000, 0);
    var livree = num(i.quantiteLivree, 0, 100000000, 0);
    var duree = num(i.dureeConservation, 0, 600, 0);

    var participation = mode === "separe" ? cout : mode === "amorti" ? 0 : Math.min(participationSaisie, cout);
    var partAmortie = cout - participation;
    var prixCents = Math.round(prix * 100);
    var a = computeAmortissement(partAmortie, q, livree);
    var prixAvec = prixCents + a.amortCents;
    var paye = participation * 100 + a.recupere;
    var pctPaye = cout > 0 ? paye / (cout * 100) * 100 : 0;
    var paliers = computePaliers(cout, participation, partAmortie, q, livree);
    var amortiTxt = fmtEur(partAmortie) + " amortis sur " + fmtNb(q) + " pièces (" + fmtCents(a.amortCents) + " par pièce)";

    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    // 1. Coût et quantité
    if (cout === 0) add(POINTS[0], "bad", "Le coût de l'outillage est à 0 €. Sans ce montant, ni le prix par pièce ni le reste à amortir ne peuvent être calculés, et le client ne sait pas ce qu'il paie.");
    else if (mode === "mixte" && participationSaisie > cout) add(POINTS[0], "bad", "La participation saisie (" + fmtEur(participationSaisie) + ") dépasse le coût de l'outillage (" + fmtEur(cout) + "). Corrigez l'un des deux montants avant d'envoyer le devis.");
    else if (partAmortie > 0 && q === 0) add(POINTS[0], "bad", "Une part de " + fmtEur(partAmortie) + " doit être amortie, mais aucune quantité n'est fixée. Sans quantité d'amortissement, le prix par pièce ne veut rien dire et l'arrêt des commandes ne peut pas être chiffré.");
    else if (prixCents === 0) add(POINTS[0], "bad", "Le prix de la pièce hors outillage est à 0 €. Le prix unitaire affiché ne couvrirait que l'outillage.");
    else if (partAmortie === 0) add(POINTS[0], "ok", "Outillage de " + fmtEur(cout) + " facturé à part. La pièce est à " + fmtCents(prixCents) + ", sans amortissement dedans.");
    else add(POINTS[0], "ok", "Outillage de " + fmtEur(cout) + ", dont " + amortiTxt + ". Prix par pièce : " + fmtCents(prixCents) + " + " + fmtCents(a.amortCents) + " = " + fmtCents(prixAvec) + ", amortissement arrondi au centime supérieur.");

    // 2. Prise en charge
    if (cout > 0 && mode === "mixte" && (participation === 0 || participation === cout)) {
      add(POINTS[1], "warn", participation === 0 ? "Paiement mixte annoncé, mais la participation est à 0 € : c'est en réalité un outillage entièrement amorti. Choisissez le bon mode pour que la clause et le message disent la même chose que les chiffres." : "Paiement mixte annoncé, mais la participation couvre tout le coût : c'est en réalité un outillage facturé à part. Choisissez le bon mode pour que la clause et le message disent la même chose que les chiffres.");
    } else if (mode === "separe") add(POINTS[1], "info", "L'outillage est facturé à part (" + fmtEur(cout) + "). Le client paie tout de suite ce qui ne sert qu'à lui ; le prix des pièces reste lisible et comparable.");
    else if (mode === "amorti") add(POINTS[1], "info", "L'outillage est entièrement amorti dans le prix des pièces. Le prix d'entrée paraît plus bas, mais le fabricant porte " + fmtEur(partAmortie) + " tant que la quantité n'est pas atteinte.");
    else add(POINTS[1], "info", "Paiement mixte : " + fmtEur(participation) + " facturés à part, " + fmtEur(partAmortie) + " amortis dans les pièces. Le risque est partagé, ce qui doit se lire dans la clause de propriété et dans celle d'arrêt anticipé.");

    // 3. Propriété de l'outillage
    if (propriete === "rien") add(POINTS[2], "bad", "Rien n'est écrit sur le propriétaire. Le client dira qu'il a payé l'outillage, le fabricant qu'il l'a fabriqué et qu'il le détient. Le code civil fixe le moment du transfert quand un contrat aliène la propriété (1196, 1583), mais encore faut-il que le devis dise ce qui est vendu.");
    else if (marquage === "non") add(POINTS[2], "warn", "Le propriétaire est écrit (" + PROPRIETE_LABELS[propriete] + "), mais l'outillage n'est pas marqué. Dans un atelier qui garde des dizaines de moules, une plaque ou une gravure évite les confusions, en cas de vente du parc ou de procédure collective par exemple.");
    else add(POINTS[2], "ok", "Propriétaire écrit : " + PROPRIETE_LABELS[propriete] + ", et l'outillage porte une plaque ou une gravure à son nom.");

    // 4. Propriété et financement
    if (propriete === "rien") add(POINTS[3], "info", "La cohérence entre qui paie et qui possède ne peut pas être vérifiée tant que le propriétaire n'est pas écrit.");
    else if (propriete === "client") {
      if (partAmortie > 0 && transfert !== "paiement") add(POINTS[3], "warn", "Le client devient propriétaire " + (transfert === "commande" ? "dès l'acceptation du devis" : "dès la conclusion du contrat, faute de clause (1196)") + ", alors que " + fmtEur(partAmortie) + " ne seront payés qu'au fil des pièces. S'il arrête ses commandes, il possède un outil que vous n'avez pas fini de vous faire payer. Liez le transfert au paiement complet.");
      else add(POINTS[3], "ok", partAmortie > 0 ? "Le client devient propriétaire quand l'outillage est entièrement payé, part amortie comprise : ce qu'il possède correspond à ce qu'il a payé." : "Le client paie l'outillage à part et en devient propriétaire : ce qu'il possède correspond à ce qu'il a payé.");
    } else {
      if (mode === "separe") add(POINTS[3], "warn", "Le client paie tout l'outillage (" + fmtEur(cout) + ") mais le fabricant en reste propriétaire. C'est possible, à condition de l'écrire en toutes lettres et de dire ce que le client achète : un droit d'usage exclusif, une priorité de production, un prix de rachat.");
      else if (mode === "mixte") add(POINTS[3], "info", "Le fabricant reste propriétaire alors que le client verse une participation de " + fmtEur(participation) + ". Écrivez que cette participation ne transfère pas la propriété et ce qu'elle paie.");
      else add(POINTS[3], "ok", "L'outillage est amorti dans les pièces et reste au fabricant : le client paie des pièces, pas un outil.");
    }

    // 5. Moment du transfert
    if (propriete === "fournisseur") add(POINTS[4], "info", "Pas de transfert : l'outillage reste au fabricant. Si le client peut le racheter, écrivez le prix et la date.");
    else if (propriete === "rien") add(POINTS[4], "warn", "À écrire une fois le propriétaire choisi : dès l'acceptation, au paiement complet, ou à une autre date.");
    else if (transfert === "rien") add(POINTS[4], "warn", "Rien n'est écrit sur le moment. Dans un contrat qui aliène la propriété, le transfert se fait lors de la conclusion du contrat, sauf si les parties le diffèrent (1196), et il emporte le transfert des risques. Écrivez la date que vous voulez vraiment.");
    else add(POINTS[4], "ok", "Transfert écrit : " + TRANSFERT_LABELS[transfert] + ". Rappel : le transfert de propriété emporte celui des risques (1196), d'où l'intérêt de régler aussi l'assurance.");

    // 6. Garde et conservation
    if (garde === "rien") {
      if (propriete === "fournisseur") add(POINTS[5], "info", "Le fabricant garde son propre outillage. Écrivez quand même combien de temps il le conserve après la dernière commande, pour que le client sache jusqu'à quand il peut recommander.");
      else add(POINTS[5], "warn", "L'outillage du client reste chez le fabricant sans aucune règle. Recevoir la chose d'autrui à charge de la garder et de la restituer, c'est un dépôt (1915) : le dépositaire doit y apporter les soins qu'il donne à ses propres biens (1927). Écrivez le lieu, la durée et les frais.");
    } else if (duree === 0) add(POINTS[5], "warn", "La garde est prévue, mais aucune durée de conservation après la dernière commande. Sans durée, le fabricant stocke indéfiniment un outil qui ne lui sert pas, ou le détruit sans prévenir.");
    else if (garde === "payante") add(POINTS[5], "ok", "Garde écrite avec frais de stockage, " + duree + " mois après la dernière commande. Le code présente le dépôt comme essentiellement gratuit (1917) ; quand un salaire est stipulé pour la garde, les soins s'apprécient avec plus de rigueur (1928).");
    else add(POINTS[5], "ok", "Garde écrite sans frais, " + duree + " mois après la dernière commande. Le dépositaire répond des soins qu'il apporte à ses propres biens (1927).");

    // 7. Assurance
    if (assurance === "rien") add(POINTS[6], "warn", "Personne n'est désigné pour assurer l'outillage. Un incendie dans l'atelier, et le client découvre que son moule n'était couvert par aucune police. Écrivez qui l'assure et contre quoi.");
    else add(POINTS[6], "ok", "Outillage " + ASSURANCE_LABELS[assurance] + ". Demandez l'attestation qui mentionne les biens confiés si l'outillage appartient au client.");

    // 8. Entretien et usure
    if (entretien === "rien") add(POINTS[7], "warn", "Rien n'est écrit sur l'entretien ni sur l'usure. Un moule s'use : qui paie le polissage, les inserts, la remise en état après un nombre de cycles ?");
    else if (entretien === "partage") add(POINTS[7], "ok", "Entretien courant par le fabricant, remise en état ou remplacement dû à l'usure à la charge du client : le partage le plus courant, à condition d'écrire ce qui est « courant ».");
    else add(POINTS[7], "ok", "Entretien et usure : " + ENTRETIEN_LABELS[entretien] + ".");

    // 9. Restitution
    if (propriete === "fournisseur") add(POINTS[8], "info", "L'outillage appartient au fabricant : pas de restitution, sauf rachat par le client au prix convenu.");
    else if (propriete === "rien") add(POINTS[8], "warn", "Impossible de prévoir la restitution tant que le propriétaire n'est pas écrit.");
    else if (restitution === "rien") add(POINTS[8], "warn", "Rien n'est écrit sur la restitution. Le dépôt doit être remis au déposant dès qu'il le réclame (1944) ; faute de lieu prévu, la restitution se fait au lieu du dépôt (1943), et si un lieu est prévu, le transport est à la charge du déposant (1942). Écrivez le délai, le lieu et les frais.");
    else add(POINTS[8], "ok", "Délai, lieu et frais de restitution écrits. Le dépositaire rend la chose même qu'il a reçue (1932), dans l'état où elle se trouve, les détériorations qui ne viennent pas de son fait restant à la charge du déposant (1933).");

    // 10. Droit de rétention
    if (propriete === "fournisseur") add(POINTS[9], "info", "L'outillage appartient au fabricant : la question de le retenir ne se pose pas.");
    else if (retention === "clause") add(POINTS[9], "ok", "Clause de rétention écrite : le fabricant garde l'outillage tant que les sommes dues au titre de l'outillage et de sa garde ne sont pas payées. Le code prévoit déjà une rétention pour le dépositaire (1948) et dans les cas de l'article 2286 ; la clause en fixe le périmètre.");
    else add(POINTS[9], "info", "Rien d'écrit. Le dépositaire peut retenir le dépôt jusqu'à l'entier paiement de ce qui lui est dû à raison du dépôt (1948), et l'article 2286 ouvre un droit de rétention dans d'autres cas. Écrire le périmètre évite de discuter de ce qui est dû « à raison du dépôt ».");

    // 11. Arrêt avant la quantité prévue
    var surplusTxt = a.surplus > 0 ? " Au-delà de la quantité, " + fmtMontant(a.surplus) + " d'amortissement seraient encaissés en plus si le prix ne baisse pas : prévoyez le prix après amortissement." : "";
    if (partAmortie === 0) add(POINTS[10], "ok", "Rien n'est amorti dans les pièces : l'arrêt des commandes ne laisse aucun reste à payer au titre de l'outillage.");
    else if (arret === "solde") add(POINTS[10], "ok", (a.reste > 0 ? "Après " + fmtNb(livree) + " pièces, " + fmtMontant(a.recupere) + " sont récupérés et " + fmtMontant(a.reste) + " restent à amortir : la clause prévoit que le client les paie." : "Après " + fmtNb(livree) + " pièces, la part amortie est entièrement récupérée.") + surplusTxt);
    else if (a.reste > 0) add(POINTS[10], "bad", "Après " + fmtNb(livree) + " pièces, " + fmtMontant(a.reste) + " restent à amortir et rien n'oblige le client à les payer. Si le contrat est un marché à forfait, l'article 1794 permet au maître de résilier en dédommageant l'entrepreneur de ses dépenses, de ses travaux et de ce qu'il aurait pu gagner ; mieux vaut écrire la règle que plaider la qualification." + surplusTxt);
    else add(POINTS[10], "warn", "Dans ce scénario, la quantité est atteinte et tout est récupéré, mais rien n'est écrit pour un arrêt plus tôt. Ajoutez la règle." + surplusTxt);

    // 12. Plans et fichiers
    if (plans === "rien") add(POINTS[11], "warn", "Rien n'est écrit sur les plans et fichiers de l'outillage. Le client qui possède le moule voudra souvent les plans pour le faire modifier ailleurs ; le fabricant y voit son savoir-faire. Tranchez dans le devis.");
    else add(POINTS[11], "ok", "Plans et fichiers " + PLANS_LABELS[plans] + ", écrit dans le devis.");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    controles.forEach(function (c) { if (c.statut === "ok") nbOk++; else if (c.statut === "warn") nbWarn++; else if (c.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : nbWarn > 0 ? "warn" : "ok";
    var badPoints = controles.filter(function (c) { return c.statut === "bad"; }).map(function (c) { return c.point.toLowerCase(); });

    var resume;
    if (cout === 0) resume = "Coût de l'outillage à saisir.";
    else if (partAmortie === 0) resume = "Outillage de " + fmtEur(cout) + " facturé à part, pièce à " + fmtCents(prixCents) + ".";
    else if (mode === "amorti") resume = "Outillage de " + fmtEur(cout) + " amorti sur " + fmtNb(q) + " pièces (" + fmtCents(a.amortCents) + " par pièce).";
    else resume = "Outillage de " + fmtEur(cout) + " : " + fmtEur(participation) + " facturés à part, " + amortiTxt + ".";
    var arretTxt = "";
    if (cout > 0 && partAmortie > 0 && q > 0) arretTxt = a.reste > 0 ? " Arrêt après " + fmtNb(livree) + " pièces : " + fmtMontant(a.reste) + " restent à amortir." : " Après " + fmtNb(livree) + " pièces, plus rien à amortir.";
    var verdict = (nbBad > 0 ? plural(nbBad, "point bloquant", "points bloquants") + " (" + badPoints.join(", ") + "), " + nbWarn + " à compléter." : nbWarn > 0 ? "Aucun point bloquant, " + nbWarn + " à compléter." : "Aucun point bloquant, rien à compléter.") + " " + resume + arretTxt;

    var prixClause;
    if (mode === "separe") prixClause = "2. Prix : l'outillage est facturé à part, [" + fmtEur(cout) + "], payable [à la commande ou à la validation des premières pièces].";
    else if (mode === "amorti") prixClause = "2. Prix : le coût de l'outillage, [" + fmtEur(cout) + "], est amorti dans le prix des pièces, à raison de [" + fmtCents(a.amortCents) + "] par pièce sur [" + fmtNb(q) + "] pièces ; au-delà, le prix unitaire passe à [" + fmtCents(prixCents) + "].";
    else prixClause = "2. Prix : l'outillage coûte [" + fmtEur(cout) + "] ; [" + fmtEur(participation) + "] sont facturés à part, le solde de [" + fmtEur(partAmortie) + "] est amorti à raison de [" + fmtCents(a.amortCents) + "] par pièce sur [" + fmtNb(q) + "] pièces ; au-delà, le prix unitaire passe à [" + fmtCents(prixCents) + "].";
    var propClause;
    if (propriete === "client") propClause = "3. Propriété : l'outillage appartient au client " + (transfert === "commande" ? "dès l'acceptation du présent devis" : transfert === "paiement" ? "dès qu'il est entièrement payé, part facturée à part et part amortie comprises" : "à compter de [date ou événement à préciser]") + (marquage === "oui" ? " ; il porte une plaque à son nom." : ".");
    else if (propriete === "fournisseur") propClause = "3. Propriété : l'outillage reste la propriété du fabricant ; les sommes versées par le client ne lui en transfèrent pas la propriété" + (marquage === "oui" ? " ; il porte une plaque au nom du fabricant." : ".");
    else propClause = "3. Propriété : l'outillage appartient à [client ou fabricant, à choisir], à compter de [date ou événement].";
    var entretienTxt = { partage: "pour l'usage courant, la remise en état ou le remplacement dû à l'usure restant à la charge du client", fabricant: "à ses frais, remise en état et remplacement compris", client: "aux frais du client", rien: "[qui paie l'entretien et l'usure]" }[entretien];
    var assuranceTxt = { fabricant: "l'assure contre l'incendie, le vol et le dégât des eaux", client: "le client l'assure à ses frais", rien: "[qui l'assure et contre quoi]" }[assurance];
    var gardeClause = garde === "rien" ? "4. Garde : [lieu, durée de conservation, frais de stockage, entretien et assurance à préciser]." : "4. Garde : le fabricant conserve l'outillage dans ses locaux " + (garde === "payante" ? "moyennant [montant] € par [mois]" : "sans frais") + ", pendant [" + (duree > 0 ? duree + " mois" : "durée") + "] après la dernière commande ; il l'entretient " + entretienTxt + ", et " + assuranceTxt + ".";
    var restClause;
    if (propriete === "fournisseur") restClause = "5. Restitution : sans objet, sauf rachat de l'outillage par le client au prix de [montant] €.";
    else if (propriete === "rien") restClause = "5. Restitution : [selon le propriétaire retenu, délai, lieu et frais].";
    else if (restitution === "ecrite") restClause = "5. Restitution : sur demande écrite du client, l'outillage lui est remis sous [15] jours dans les locaux du fabricant, le transport restant à la charge du client" + (retention === "clause" ? ", sous réserve du paiement de toutes les sommes dues au titre de l'outillage et de sa garde." : ".");
    else restClause = "5. Restitution : [délai, lieu et frais de transport].";
    var arretClause;
    if (partAmortie === 0) arretClause = "6. Arrêt anticipé : l'outillage étant payé à part, l'arrêt des commandes ne crée aucun reste à payer à ce titre.";
    else if (arret === "solde") arretClause = "6. Arrêt anticipé : si le client cesse ses commandes avant [" + fmtNb(q) + "] pièces, il paie le reste non amorti, soit [" + fmtCents(a.amortCents) + "] par pièce non commandée, au plus tard [30] jours après la dernière livraison.";
    else arretClause = "6. Arrêt anticipé : [ce que le client doit si les commandes s'arrêtent avant la quantité prévue].";
    var plansClause = plans === "client" ? "7. Plans et fichiers : les plans et fichiers de l'outillage sont remis au client [à la fin de l'amortissement ou sur demande]." : plans === "fabricant" ? "7. Plans et fichiers : les plans, fichiers et méthodes du fabricant restent à lui et ne sont pas remis." : "7. Plans et fichiers : [à qui ils appartiennent et s'ils sont remis].";
    var clause = ["Article [X] : Outillage spécifique", "1. Objet : l'outillage [désignation, référence] est fabriqué pour les pièces [référence] du client et ne sert qu'à elles.", prixClause, propClause, gardeClause, restClause, arretClause, plansClause].join("\n");

    var actionMap = {};
    actionMap[POINTS[0]] = "Saisissez le coût de l'outillage, la quantité d'amortissement et le prix de la pièce hors outillage, puis vérifiez qu'ils tiennent ensemble.";
    actionMap[POINTS[1]] = "Choisissez le mode qui correspond aux chiffres : facturé à part, amorti, ou mixte avec une participation réelle.";
    actionMap[POINTS[2]] = propriete === "rien" ? "Écrivez dans le devis à qui appartient l'outillage." : "Faites poser une plaque ou une gravure au nom du propriétaire.";
    actionMap[POINTS[3]] = "Alignez la propriété sur le financement : transfert au paiement complet si le client devient propriétaire, ou contrepartie écrite si le fabricant le reste.";
    actionMap[POINTS[4]] = "Écrivez le moment du transfert de propriété, et donc des risques.";
    actionMap[POINTS[5]] = garde === "rien" ? "Écrivez le lieu de garde, la durée de conservation après la dernière commande et les frais éventuels." : "Fixez une durée de conservation après la dernière commande.";
    actionMap[POINTS[6]] = "Désignez qui assure l'outillage et contre quels risques, et demandez l'attestation.";
    actionMap[POINTS[7]] = "Écrivez qui paie l'entretien courant et qui paie la remise en état ou le remplacement dû à l'usure.";
    actionMap[POINTS[8]] = "Écrivez le délai, le lieu et les frais de restitution.";
    actionMap[POINTS[9]] = "Écrivez le périmètre de la rétention si vous voulez pouvoir garder l'outillage en cas d'impayé.";
    actionMap[POINTS[10]] = "Ajoutez la règle d'arrêt anticipé : le client paie le reste non amorti, par pièce non commandée.";
    actionMap[POINTS[11]] = "Tranchez la question des plans et fichiers : remis au client, ou gardés par le fabricant.";
    var actions = [];
    controles.forEach(function (c) { if (c.statut === "bad") actions.push(actionMap[c.point]); });
    controles.forEach(function (c) { if (c.statut === "warn") actions.push(actionMap[c.point]); });
    actions.push("Gardez la clause, le récapitulatif et la réponse écrite de l'autre partie dans le même dossier.");

    var aCompleter = controles.filter(function (c) { return c.statut === "bad" || c.statut === "warn"; }).map(function (c) { return "- " + c.point; });
    var chiffres = resume + (arretTxt ? arretTxt : "");
    var message;
    if (role === "fournisseur") {
      message = ["Objet : outillage pour vos pièces [référence] : prix, propriété et garde", "", "Bonjour,", "",
        "Pour vos pièces [référence], voici comment nous proposons de traiter l'outillage spécifique. " + chiffres,
        "Propriété : " + (propriete === "rien" ? "à convenir ensemble" : PROPRIETE_LABELS[propriete] + (propriete === "client" ? ", " + TRANSFERT_LABELS[transfert] : "")) + ". Garde : " + GARDE_LABELS[garde] + (duree > 0 ? ", " + duree + " mois après la dernière commande" : "") + ".",
        aCompleter.length ? "Avant de lancer la fabrication de l'outillage, nous devons encore caler ces points :\n" + aCompleter.join("\n") : "Si ces conditions vous conviennent, nous lançons la fabrication de l'outillage dès votre accord écrit.",
        "", "Cordialement"].join("\n");
    } else {
      message = ["Objet : outillage pour nos pièces [référence] : propriété, garde et restitution", "", "Bonjour,", "",
        "Avant d'accepter votre devis, nous souhaitons préciser le sort de l'outillage spécifique. " + chiffres,
        "Notre lecture : propriétaire " + (propriete === "rien" ? "non précisé" : PROPRIETE_LABELS[propriete]) + ", garde " + GARDE_LABELS[garde] + ", assurance " + ASSURANCE_LABELS[assurance] + ".",
        aCompleter.length ? "Pouvez-vous compléter le devis sur ces points :\n" + aCompleter.join("\n") : "Ces points nous conviennent ; merci de les laisser tels quels dans la version finale.",
        "", "Cordialement"].join("\n");
    }

    var recapLines = [
      "Récapitulatif outillage spécifique (indicatif)",
      "Position : " + ROLE_LABELS[role],
      "Outillage : " + fmtEur(cout) + ", " + MODE_LABELS[mode],
      "Facturé à part : " + fmtEur(participation) + " ; amorti : " + fmtEur(partAmortie) + (partAmortie > 0 ? " sur " + fmtNb(q) + " pièces" : ""),
      "Prix par pièce : " + fmtCents(prixCents) + " + " + fmtCents(a.amortCents) + " = " + fmtCents(prixAvec),
      "Arrêt après " + fmtNb(livree) + " pièces : " + fmtMontant(a.recupere) + " récupérés, " + fmtMontant(a.reste) + " restent à amortir",
      "Payé par le client pour l'outillage à ce stade : " + fmtMontant(paye) + " (" + fmtPct(pctPaye) + " %)",
      "Propriété : " + PROPRIETE_LABELS[propriete] + (propriete === "client" ? ", " + TRANSFERT_LABELS[transfert] : "") + " ; marquage : " + MARQUAGE_LABELS[marquage],
      "Garde : " + GARDE_LABELS[garde] + ", " + (duree > 0 ? duree + " mois" : "durée non fixée") + " ; assurance : " + ASSURANCE_LABELS[assurance],
      "Contrôles : " + plural(nbOk, "conforme", "conformes") + ", " + nbWarn + " à compléter, " + plural(nbBad, "bloquant", "bloquants") + ", " + plural(nbInfo, "information", "informations"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];

    return {
      role: role, mode: mode, propriete: propriete, transfert: transfert, garde: garde, duree: duree,
      cout: cout, participationSaisie: participationSaisie, participation: participation, partAmortie: partAmortie, q: q, livree: livree,
      prixCents: prixCents, amortCents: a.amortCents, prixAvec: prixAvec, recupere: a.recupere, reste: a.reste, surplus: a.surplus, restantes: a.restantes,
      paye: paye, pctPaye: pctPaye, paliers: paliers,
      prixLabel: fmtCents(prixAvec), amortLabel: fmtCents(a.amortCents), partLabel: fmtEur(participation) + " / " + fmtEur(partAmortie),
      resteLabel: fmtMontant(a.reste), payeLabel: fmtMontant(paye) + " (" + fmtPct(pctPaye) + " %)",
      controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo, etat: etat,
      verdict: verdict, clause: clause, actions: actions, message: message, recap: recapLines.join("\n")
    };
  }
  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, POINTS, ROLE_LABELS, MODE_LABELS, PROPRIETE_LABELS, TRANSFERT_LABELS, MARQUAGE_LABELS, GARDE_LABELS, ASSURANCE_LABELS, ENTRETIEN_LABELS, RESTITUTION_LABELS, RETENTION_LABELS, ARRET_LABELS, PLANS_LABELS, computeOutillage, computeAmortissement, computePaliers, buildRecap, fmtEur, fmtCents, fmtMontant, fmtNb, fmtPct, num, dec };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var readForm = function () {
      var o = {};
      Object.keys(DEFAULTS).forEach(function (k) { var el = document.getElementById(k); if (el) o[k] = el.value; });
      return o;
    };
    var cell = function (tr, txt) { var td = document.createElement("td"); td.textContent = txt; tr.appendChild(td); };
    var render = function () {
      var r = computeOutillage(readForm());
      document.getElementById("prixOut").textContent = r.prixLabel;
      document.getElementById("amortOut").textContent = r.amortLabel;
      document.getElementById("partOut").textContent = r.partLabel;
      document.getElementById("resteOut").textContent = r.resteLabel;
      document.getElementById("payeOut").textContent = r.payeLabel;
      document.getElementById("compteurs").textContent = r.nbBad + " / " + r.nbWarn;
      var v = document.getElementById("verdict");
      v.textContent = r.verdict;
      v.className = "alert " + r.etat;
      var tp = document.getElementById("paliers");
      tp.innerHTML = "";
      r.paliers.forEach(function (p) {
        var tr = document.createElement("tr");
        if (p.courant) tr.className = "cur";
        cell(tr, fmtNb(p.pieces)); cell(tr, fmtMontant(p.recupere)); cell(tr, fmtMontant(p.reste)); cell(tr, fmtMontant(p.paye)); cell(tr, fmtPct(p.pct) + " %");
        tp.appendChild(tr);
      });
      var tb = document.getElementById("controles");
      tb.innerHTML = "";
      r.controles.forEach(function (c) {
        var tr = document.createElement("tr");
        if (c.statut === "warn") tr.className = "weak";
        if (c.statut === "bad") tr.className = "cur";
        cell(tr, c.point); cell(tr, STATUT_LABELS[c.statut]); cell(tr, c.texte);
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
