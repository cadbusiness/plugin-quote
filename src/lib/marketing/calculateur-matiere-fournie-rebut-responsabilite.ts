/* eslint-disable */
// @ts-nocheck

  var SLUG = "calculateur-matiere-fournie-rebut-responsabilite";
  var STATUT_LABELS = { ok: "Conforme", warn: "À revoir", bad: "Bloquant", info: "Information" };
  var POINTS = [
    { id: "nature", label: "Qualification du contrat" },
    { id: "reception", label: "Contrôle de la matière à réception" },
    { id: "quantite", label: "Quantité de matière fournie" },
    { id: "chute", label: "Taux de chute au devis" },
    { id: "rebut", label: "Tolérance de rebut au devis" },
    { id: "tracabilite", label: "Traçabilité de la matière" },
    { id: "cause", label: "Rebut constaté" },
    { id: "reliquats", label: "Chutes et reliquat" },
    { id: "plafond", label: "Plafond de responsabilité" },
    { id: "assurance", label: "Assurance des biens confiés" }
  ];
  var LABEL_SETS = {
    nature: {
      facon: "Le client fournit la matière, vous fournissez le travail",
      mixte: "Le client fournit une partie (composants, pièces brutes), vous le reste",
      fourniture: "Vous fournissez la matière"
    },
    unite: { kg: "Kilogrammes", m: "Mètres", u: "Unités (pièces brutes, blocs)" },
    chuteEcrite: { oui: "Oui", non: "Non" },
    rebutEcrit: { oui: "Oui", non: "Non" },
    reliquats: {
      rendus: "Rendus au client sous un délai écrit",
      gardes: "Gardés par l'atelier, avec accord écrit",
      rien: "Rien d'écrit"
    },
    reception: {
      oui: "Oui, bon de réception avec réserves écrites",
      non: "Non, ou seulement de vive voix"
    },
    tracabilite: { oui: "Oui, rattachés à la commande", non: "Non" },
    cause: {
      atelier: "Votre fait : réglage, outil, manipulation",
      matiere: "Défaut de la matière fournie, constaté et documenté",
      plan: "Cotes ou plan du client, suivis à la lettre",
      inconnue: "Cause non établie"
    }
  };
  var UNITES = { kg: "kg", m: "m", u: "unité" };
  var DEFAULTS = {
    nature: "facon",
    unite: "kg",
    quantite: "500",
    matPiece: "1.8",
    prixFacon: "9.6",
    chute: "6",
    rebutTol: "2",
    miseEnRoute: "12",
    chuteEcrite: "oui",
    rebutEcrit: "oui",
    reliquats: "rien",
    plafond: "4800",
    fournie: "960",
    valeur: "9.5",
    assurance: "5000",
    reception: "non",
    tracabilite: "non",
    rebutObs: "14",
    cause: "inconnue"
  };

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
  function qte(n, unite) {
    var r = Math.round(n * 100) / 100;
    if (unite === "u") return fmtNum(n) + " " + (r > 1 ? "unités" : "unité");
    return fmtNum(n) + " " + UNITES[unite];
  }
  function arrondiSup(n) { return Math.ceil(Math.round(n * 1e6) / 1e6); }
  function clampNum(v, min, max, dflt) {
    var n = dec(v);
    if (!isFinite(n) || n < min) return dflt;
    return Math.min(n, max);
  }

  function normalize(raw) {
    var x = {};
    raw = raw || {};
    Object.keys(DEFAULTS).forEach(function (k) {
      var v = raw[k] === undefined || raw[k] === null ? DEFAULTS[k] : String(raw[k]);
      if (LABEL_SETS[k] && !Object.prototype.hasOwnProperty.call(LABEL_SETS[k], v)) v = DEFAULTS[k];
      x[k] = v;
    });
    var q = ent(x.quantite); x.q = isFinite(q) && q >= 1 ? Math.min(q, 10000000) : 0;
    x.mp = clampNum(x.matPiece, 0, 1000000, 0);
    x.prix = clampNum(x.prixFacon, 0, 1000000, 0);
    x.pChute = clampNum(x.chute, 0, 100, 0);
    x.pRebut = clampNum(x.rebutTol, 0, 100, 0);
    x.mer = clampNum(x.miseEnRoute, 0, 1000000, 0);
    x.plaf = clampNum(x.plafond, 0, 1000000000, 0);
    x.four = clampNum(x.fournie, 0, 1000000000, 0);
    x.val = clampNum(x.valeur, 0, 1000000, 0);
    x.assur = clampNum(x.assurance, 0, 1000000000, 0);
    var r = ent(x.rebutObs); x.rebutN = isFinite(r) && r >= 0 ? Math.min(r, 10000000) : 0;
    return x;
  }

  function computeMatiere(raw) {
    var x = normalize(raw);
    var u = x.unite;
    var fourniture = x.nature === "fourniture";
    var incomplet = x.q === 0 || x.mp === 0;
    var c = [];
    var push = function (id, statut, texte) {
      var p = POINTS.filter(function (q) { return q.id === id; })[0];
      c.push({ id: id, point: p.label, statut: statut, texte: texte });
    };

    var besoinNet = x.q * x.mp;
    var parPieceReelle = x.mp * (1 + x.pChute / 100);
    var conso = besoinNet * (1 + x.pChute / 100);
    var tolPieces = Math.ceil(Math.round(x.q * x.pRebut / 100 * 1e6) / 1e6);
    var matRebutTol = tolPieces * parPieceReelle;
    var recommandee = conso + matRebutTol + x.mer;
    var recoArrondie = arrondiSup(recommandee);
    var ecart = x.four - recommandee;
    var manque = ecart < 0 ? -ecart : 0;
    var complement = ecart < 0 ? arrondiSup(manque) : 0;
    var consoOk = x.four >= conso;
    var excess = Math.max(0, x.rebutN - tolPieces);
    var matExcess = excess * parPieceReelle;
    var valExcess = matExcess * x.val;
    var refacon = excess * x.prix;
    var expo = x.four * x.val;

    // Libellés du résultat
    var besoinLabel = fourniture ? "Sans objet : la matière est la vôtre" : (incomplet ? "À renseigner" : qte(recoArrondie, u));
    var ecartLabel;
    if (fourniture) ecartLabel = "Sans objet : la matière est la vôtre";
    else if (incomplet) ecartLabel = "À renseigner";
    else if (ecart < 0) ecartLabel = "Il manque " + qte(manque, u);
    else if (ecart === 0) ecartLabel = "Aucun écart";
    else ecartLabel = "Marge de " + qte(ecart, u);
    var rebutLabel;
    if (x.rebutN === 0) rebutLabel = "Aucun rebut constaté";
    else if (excess === 0) rebutLabel = "Dans la tolérance (" + x.rebutN + " sur " + tolPieces + ")";
    else rebutLabel = pluriel(excess, "pièce") + " (" + qte(matExcess, u) + ", " + fmtEur(valExcess) + " HT)";
    var chargeLabel;
    if (excess === 0) chargeLabel = "Rien à rembourser";
    else if (fourniture) chargeLabel = x.cause === "plan" ? "Le client, si vous avez suivi son plan à la lettre" : "Vous : la matière est la vôtre, le rebut est dans votre prix";
    else if (x.cause === "atelier") chargeLabel = "Vous : matière à remplacer et pièces à refaire (" + fmtEur(valExcess + refacon) + " HT)";
    else if (x.cause === "matiere") chargeLabel = "Le client, si vous prouvez le défaut de la matière (article 1790)";
    else if (x.cause === "plan") chargeLabel = "Le client, si vous avez suivi son plan à la lettre";
    else chargeLabel = "Vous, tant que vous n'avez pas prouvé l'absence de faute (article 1789)";
    var expoLabel = fourniture ? "Sans objet : la matière est la vôtre" : (expo > 0 ? fmtEur(expo) + " HT" : "À renseigner");

    // 1 Qualification
    if (x.nature === "facon") push("nature", "info", "Le client fournit la matière : contrat d'entreprise où vous ne fournissez que votre travail (article 1787). Si la chose vient à périr, vous n'en répondez que de votre faute (article 1789), mais c'est à vous de prouver que la perte ou la détérioration ne vient pas d'elle (Cass. 1re civ., 20 décembre 1993, n° 92-11.385).");
    else if (x.nature === "mixte") push("nature", "info", "Pour les éléments que le client fournit, l'article 1789 s'applique : vous répondez de votre seule faute, que vous devez réfuter. Pour ce que vous fournissez, l'article 1788 met la perte avant livraison à votre charge, sauf client en demeure de recevoir. Séparez les deux dans le devis.");
    else push("nature", "info", "Vous fournissez la matière : si la chose vient à périr avant d'être livrée, la perte est pour vous (article 1788), sauf si le client était en demeure de la recevoir. Les points qui portent sur la matière du client sont sans objet.");

    // 2 Réception
    if (fourniture) push("reception", "info", "Sans objet : la matière est la vôtre.");
    else if (x.reception === "oui") push("reception", "ok", "Réception datée avec réserves : vous pourrez dire dans quel état la matière est arrivée. L'article 1933, sur le dépôt, va dans le même sens : les détériorations qui ne sont pas survenues par votre fait ne sont pas à votre charge.");
    else push("reception", "warn", "Sans bon de réception daté, vous ne pourrez pas prouver l'état de la matière à l'arrivée ni un défaut apparent. Contrôlez à réception (lot, dimensions, aspect, quantité) et écrivez vos réserves le jour même.");

    // 3 Quantité
    if (fourniture) push("quantite", "info", "Sans objet : la matière est la vôtre.");
    else if (incomplet) push("quantite", "bad", "Renseignez le nombre de pièces et la matière par pièce : sans eux, le besoin ne peut pas être calculé.");
    else if (x.four <= 0) push("quantite", "bad", "Aucune matière fournie indiquée : il vous faut " + qte(recoArrondie, u) + " pour la série.");
    else if (!consoOk) push("quantite", "bad", "La matière fournie (" + qte(x.four, u) + ") ne couvre même pas les pièces bonnes avec leur chute (" + qte(conso, u) + ") : il manque " + qte(manque, u) + ". Ne lancez pas la série sans complément ou sans accord écrit sur une série réduite.");
    else if (ecart < 0) push("quantite", "warn", "Les pièces bonnes sont couvertes (" + qte(conso, u) + "), pas le rebut toléré ni la mise en route : il manque " + qte(manque, u) + ". Demandez au moins " + qte(complement, u) + " de plus avant de lancer.");
    else push("quantite", "ok", "Matière suffisante : " + qte(x.four, u) + " fournis pour " + qte(recoArrondie, u) + " nécessaires (" + qte(conso, u) + " de pièces avec chute, " + qte(matRebutTol, u) + " de rebut toléré, " + qte(x.mer, u) + " de mise en route).");

    // 4 Chute
    if (fourniture) push("chute", "info", "Sans objet : la matière est la vôtre.");
    else if (x.chuteEcrite === "oui") push("chute", "ok", "Chute écrite (" + fmtNum(x.pChute) + " %) : le client sait qu'une part de sa matière ne devient pas de la pièce.");
    else push("chute", "warn", "Le devis ne fixe pas de taux de chute : si la matière manque, le client peut contester les " + fmtNum(x.pChute) + " % retenus ici. Écrivez le taux dans le devis.");

    // 5 Rebut toléré
    if (x.rebutEcrit === "oui" && x.pRebut > 0) push("rebut", "ok", "Tolérance écrite : " + fmtNum(x.pRebut) + " % des pièces, soit " + pluriel(tolPieces, "pièce") + " sur " + x.q + ". Au-delà, le rebut devient une question de cause et de preuve.");
    else if (x.rebutEcrit === "oui") push("rebut", "warn", "Tolérance de 0 % : tout rebut, même une pièce de réglage, devient un litige. Fixez un pourcentage réaliste.");
    else push("rebut", "warn", "Aucune tolérance écrite : sans règle, le client peut réclamer toute pièce rebutée. Écrivez un pourcentage dans le devis.");

    // 6 Traçabilité
    if (fourniture) push("tracabilite", "info", "Sans objet : la matière est la vôtre.");
    else if (x.tracabilite === "oui") push("tracabilite", "ok", "Lots et certificats rattachés à la commande : vous pouvez relier un défaut à un lot et prouver ce que le client a livré.");
    else push("tracabilite", "warn", "Sans numéro de lot ni certificat, un défaut de matière ne se prouve pas. Photographiez l'étiquette à réception et gardez le certificat avec le dossier.");

    // 7 Cause du rebut
    if (x.rebutN === 0) push("cause", "ok", "Aucun rebut constaté.");
    else if (excess === 0) push("cause", "ok", x.rebutN + " pièce(s) rebutée(s) pour " + tolPieces + " tolérée(s) : dans la tolérance, la matière est celle du client et il n'y a rien à rembourser.");
    else if (fourniture) {
      if (x.cause === "plan") push("cause", "ok", pluriel(excess, "pièce") + " au-dessus de la tolérance, cause dans le plan du client suivi à la lettre : documentez-le avant de facturer.");
      else push("cause", "info", pluriel(excess, "pièce") + " au-dessus de la tolérance : la matière est la vôtre, le rebut est dans votre prix.");
    } else if (x.cause === "atelier") push("cause", "bad", pluriel(excess, "pièce") + " au-dessus de la tolérance par votre fait : vous remplacez " + qte(matExcess, u) + " de matière (" + fmtEur(valExcess) + " HT) et vous refaites les pièces (" + fmtEur(refacon) + " HT de façon).");
    else if (x.cause === "matiere") push("cause", "ok", pluriel(excess, "pièce") + " au-dessus de la tolérance, défaut de la matière : l'article 1790 laisse la perte au client si la chose a péri par le vice de la matière. Gardez les pièces, les mesures et les photos.");
    else if (x.cause === "plan") push("cause", "ok", pluriel(excess, "pièce") + " au-dessus de la tolérance, cause dans le plan du client suivi à la lettre : vous pouvez lui faire supporter la matière et la façon, sur preuve (devoir d'information, article 1112-1).");
    else push("cause", "warn", pluriel(excess, "pièce") + " au-dessus de la tolérance, cause non établie : tant que vous n'avez pas prouvé l'absence de faute, vous supportez " + qte(matExcess, u) + " de matière (" + fmtEur(valExcess) + " HT). Faites un contrôle dimensionnel et gardez les relevés de réglage.");

    // 8 Reliquats
    if (fourniture) push("reliquats", "info", "Sans objet : la matière est la vôtre.");
    else if (x.reliquats === "rendus") push("reliquats", "ok", "Reliquat rendu sous un délai écrit : le client sait qu'il doit le reprendre, et la garde au-delà de ce délai se règle comme une commande non retirée.");
    else if (x.reliquats === "gardes") push("reliquats", "ok", "Chutes et reliquat gardés avec accord écrit : la matière non utilisée appartient au client tant qu'il ne vous l'a pas cédée, l'accord règle ce point.");
    else push("reliquats", "warn", "Rien d'écrit sur les chutes et le reliquat : la matière non utilisée reste au client, vous en êtes gardien, et personne ne sait qui la reprend ni quand.");

    // 9 Plafond
    if (fourniture) push("plafond", "info", "Sans objet : la matière est la vôtre.");
    else if (expo <= 0) push("plafond", "info", "Renseignez la matière fournie et sa valeur pour comparer au plafond.");
    else if (x.plaf <= 0) push("plafond", "warn", "Aucun plafond écrit : votre responsabilité sur la matière confiée n'est pas limitée, jusqu'à " + fmtEur(expo) + " HT.");
    else if (x.plaf < expo) push("plafond", "warn", "Plafond de " + fmtEur(x.plaf) + " HT pour " + fmtEur(expo) + " HT de matière confiée, soit " + Math.round(x.plaf / expo * 100) + " % : le client peut y voir un déséquilibre. Une clause qui prive de sa substance l'obligation essentielle est réputée non écrite (article 1170), et aucun plafond ne couvre une faute lourde ou dolosive.");
    else push("plafond", "ok", "Plafond de " + fmtEur(x.plaf) + " HT, au moins égal à la matière confiée (" + fmtEur(expo) + " HT). Il ne couvre pas une faute lourde ou dolosive.");

    // 10 Assurance
    if (fourniture) push("assurance", "info", "Sans objet : la matière est la vôtre.");
    else if (expo <= 0) push("assurance", "info", "Renseignez la matière fournie et sa valeur pour comparer à l'assurance.");
    else if (x.assur <= 0) push("assurance", "bad", "Aucune garantie pour les biens confiés : un incendie ou un vol de la matière serait payé sur vos fonds propres, jusqu'à " + fmtEur(expo) + " HT. Vérifiez que votre contrat couvre les biens confiés, une garantie de responsabilité civile ne le fait pas toujours.");
    else if (x.assur < expo) push("assurance", "warn", "Garantie de " + fmtEur(x.assur) + " pour " + fmtEur(expo) + " HT de matière confiée : il manque " + fmtEur(expo - x.assur) + ". Un stock en atelier ne bouge pas toujours avec la valeur du contrat.");
    else push("assurance", "ok", "Garantie de " + fmtEur(x.assur) + ", au moins égale à la matière confiée (" + fmtEur(expo) + " HT).");

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    c.forEach(function (p) { if (p.statut === "ok") nbOk++; else if (p.statut === "warn") nbWarn++; else if (p.statut === "bad") nbBad++; else nbInfo++; });
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");
    var verdict;
    if (nbBad > 0) verdict = "À régulariser avant de lancer : " + pluriel(nbBad, "point bloquant") + (nbWarn > 0 ? ", " + pluriel(nbWarn, "point") + " à revoir" : "") + ".";
    else if (nbWarn > 0) verdict = "Pas de point bloquant, " + pluriel(nbWarn, "point") + " à revoir.";
    else verdict = "Dossier en ordre : la matière fournie est cadrée par écrit.";

    // Actions
    var actions = [];
    if (!fourniture && !incomplet && ecart < 0) actions.push("Demandez au client un complément de " + qte(complement, u) + " au moins, ou un accord écrit pour réduire la série, avant de lancer.");
    if (!fourniture && x.reception === "non") actions.push("Rédigez un bon de réception daté pour la matière arrivée, avec vos réserves, et envoyez-le au client le jour même.");
    if (x.chuteEcrite === "non" || x.rebutEcrit === "non" || (x.rebutEcrit === "oui" && x.pRebut === 0)) actions.push("Ajoutez au devis le taux de chute (" + fmtNum(x.pChute) + " %) et une tolérance de rebut en pourcentage.");
    if (!fourniture && x.tracabilite === "non") actions.push("Rattachez à la commande le numéro de lot et le certificat de la matière, et photographiez l'étiquette.");
    if (!fourniture && excess > 0 && x.cause === "inconnue") actions.push("Établissez la cause du rebut (contrôle dimensionnel, relevé de réglage, analyse de la matière) : tant qu'elle n'est pas établie, vous la supportez.");
    if (!fourniture && excess > 0 && x.cause === "atelier") actions.push("Remplacez " + qte(matExcess, u) + " de matière et refaites " + pluriel(excess, "pièce") + " sans les facturer.");
    if (!fourniture && excess > 0 && (x.cause === "matiere" || x.cause === "plan")) actions.push("Prévenez le client par écrit, avec mesures et photos, avant de facturer la matière de remplacement ou les pièces.");
    if (!fourniture && x.reliquats === "rien") actions.push("Écrivez ce que deviennent les chutes et le reliquat : rendus sous un délai, ou gardés avec accord.");
    if (!fourniture && expo > 0 && (x.plaf < expo || x.assur < expo)) actions.push("Alignez le plafond de responsabilité et la garantie biens confiés sur la valeur de la matière en atelier (" + fmtEur(expo) + " HT).");
    actions.push("Gardez dans le dossier le devis accepté, le bon de réception, les lots, les relevés de rebut et les échanges avec le client.");

    // Clause
    var cl = ["Matière fournie par le client"];
    if (fourniture) {
      cl.push("L'atelier fournit la matière de la commande, comprise dans le prix. Le rebut de fabrication est à sa charge, sauf s'il vient du plan ou des instructions du client.");
      cl.push("Les plans et cotes fournis par le client sont suivis à la lettre. L'atelier signale par écrit toute incohérence qu'il relève avant fabrication.");
      cl.push("La perte de la chose avant livraison est à la charge de l'atelier, sauf si le client est en demeure de la recevoir (article 1788 du code civil).");
      cl.push("Les chutes de fabrication appartiennent à l'atelier.");
      cl.push("La responsabilité de l'atelier est limitée à " + (x.plaf > 0 ? fmtEur(x.plaf) + " HT" : "[montant à fixer]") + ", sauf faute lourde ou dolosive.");
      cl.push("Toute réclamation sur la conformité des pièces est faite par écrit à réception.");
      cl.push("Le client choisit la série réduite ou la refabrication si le rebut dépasse la tolérance indiquée au devis.");
    } else {
      cl.push("Le client livre à l'atelier " + (incomplet ? "[quantité à calculer]" : qte(recoArrondie, u)) + " de matière conforme au plan, avant le lancement de la série. L'atelier la contrôle à réception et signale par écrit, sous cinq jours ouvrés, tout défaut apparent ou toute différence de quantité.");
      cl.push("Consommation prévue : " + fmtNum(x.mp) + " " + (u === "u" ? "unité(s)" : UNITES[u]) + " par pièce, chute de fin de barre et de réglage de " + fmtNum(x.pChute) + " %, mise en route de " + qte(x.mer, u) + " (consommation théorique : " + qte(conso, u) + " pour " + x.q + " pièces).");
      cl.push("Rebut toléré : " + fmtNum(x.pRebut) + " % des pièces, soit " + pluriel(tolPieces, "pièce") + ". Au-delà, l'atelier remplace la matière et refait les pièces si le rebut vient de son fait. Si le rebut vient de la matière ou du plan du client, la matière de remplacement et la façon lui sont facturées sur justificatifs.");
      cl.push("Si la matière est insuffisante ou défectueuse, l'atelier en informe le client par écrit. Le client complète sous dix jours ouvrés ou accepte une série réduite.");
      cl.push("L'atelier conserve, avec le dossier, les numéros de lot et les certificats livrés avec la matière jusqu'à la fin de la commande.");
      cl.push("Chutes et reliquat : " + (x.reliquats === "gardes" ? "conservés par l'atelier avec l'accord du client." : "rendus au client sous trente jours après la livraison ; au-delà, la garde est facturée selon le tarif du devis.") + " La matière non utilisée reste la propriété du client.");
      cl.push("L'atelier répond de la matière confiée en cas de faute, dans la limite de " + (x.plaf > 0 ? fmtEur(x.plaf) + " HT" : "[plafond à fixer]") + ", sauf faute lourde ou dolosive. Elle est couverte par une garantie biens confiés de " + (x.assur > 0 ? fmtEur(x.assur) : "[montant à fixer]") + ".");
    }
    var clauseTxt = cl.join("\n");

    // Courrier
    var m = [];
    if (fourniture) {
      m = ["Sans objet : la matière est la vôtre. Aucun courrier sur la matière fournie à envoyer pour cette commande."];
    } else if (!incomplet && ecart < 0) {
      m = ["Objet : matière fournie pour votre commande, complément nécessaire", "", "Madame, Monsieur,", ""];
      m.push("Pour fabriquer " + pluriel(x.q, "pièce") + ", le plan donne une consommation de " + fmtNum(x.mp) + " " + (u === "u" ? "unité(s)" : UNITES[u]) + " par pièce, soit " + qte(besoinNet, u) + ", plus " + fmtNum(x.pChute) + " % de chute de fin de barre et de réglage (" + qte(conso, u) + " au total), un rebut toléré de " + fmtNum(x.pRebut) + " % (" + pluriel(tolPieces, "pièce") + ") et " + qte(x.mer, u) + " de mise en route. Il nous faut donc " + qte(recoArrondie, u) + ".");
      m.push("Vous nous avez fourni " + qte(x.four, u) + " : il manque " + qte(manque, u) + ".");
      m.push("Merci de nous livrer un complément d'au moins " + qte(complement, u) + ", ou de nous confirmer par écrit une série réduite, sous dix jours ouvrés. Sans ce complément, nous ne pouvons pas garantir la livraison de la série complète à la date convenue.");
      m.push("Nous restons à votre disposition.", "", "Veuillez agréer, Madame, Monsieur, nos salutations distinguées.");
    } else if (excess > 0) {
      m = ["Objet : bilan de matière et rebut de votre commande", "", "Madame, Monsieur,", ""];
      m.push("Sur " + pluriel(x.q, "pièce") + " commandées, " + pluriel(x.rebutN, "pièce") + " ont été rebutées. Le devis tolère " + pluriel(tolPieces, "pièce") + ". " + pluriel(excess, "pièce") + " dépassent donc la tolérance, soit " + qte(matExcess, u) + " de matière (" + fmtEur(valExcess) + " HT à votre valeur de " + fmtEur(x.val) + " HT par " + (u === "u" ? "unité" : UNITES[u]) + ").");
      if (x.cause === "atelier") m.push("Ce rebut vient de notre fabrication : nous remplaçons la matière et refaisons les pièces, sans facturation.");
      else if (x.cause === "matiere") m.push("Nous avons relevé un défaut dans la matière fournie. Vous trouverez les mesures et les photos en pièces jointes. Merci de nous dire comment vous souhaitez poursuivre : matière de remplacement de votre part, ou série réduite.");
      else if (x.cause === "plan") m.push("Les pièces rebutées respectent le plan que vous nous avez remis : l'écart vient des cotes. Vous trouverez les mesures en pièces jointes. Merci de nous dire comment vous souhaitez poursuivre.");
      else m.push("Nous recherchons la cause de ce rebut et vous écrirons dès qu'elle est établie.");
      m.push("Nous restons à votre disposition.", "", "Veuillez agréer, Madame, Monsieur, nos salutations distinguées.");
    } else {
      m = ["Objet : bilan de matière de votre commande", "", "Madame, Monsieur,", ""];
      m.push("Pour " + pluriel(x.q, "pièce") + ", nous avons reçu " + qte(x.four, u) + " de matière, pour un besoin calculé de " + qte(recoArrondie, u) + ".");
      m.push(x.rebutN === 0 ? "Aucune pièce n'a été rebutée." : pluriel(x.rebutN, "pièce") + " ont été rebutées, dans la tolérance de " + pluriel(tolPieces, "pièce") + " prévue au devis.");
      m.push("La matière non utilisée est tenue à votre disposition" + (x.reliquats === "gardes" ? ", ou conservée chez nous comme convenu." : "."), "", "Veuillez agréer, Madame, Monsieur, nos salutations distinguées.");
    }
    var message = m.join("\n");

    var recap = [
      "Matière fournie : récapitulatif",
      "Contrat : " + LABEL_SETS.nature[x.nature],
      "Série : " + pluriel(x.q, "pièce") + ", " + fmtNum(x.mp) + " par pièce, chute " + fmtNum(x.pChute) + " %",
      "Matière à demander : " + besoinLabel,
      "Matière fournie : " + qte(x.four, u) + ", écart : " + ecartLabel,
      "Rebut : " + pluriel(x.rebutN, "pièce") + " constatée" + (x.rebutN > 1 ? "s" : "") + ", tolérance " + pluriel(tolPieces, "pièce") + ", " + rebutLabel,
      "Qui le supporte : " + chargeLabel,
      "Matière confiée : " + expoLabel + ", plafond " + (x.plaf > 0 ? fmtEur(x.plaf) + " HT" : "aucun") + ", assurance " + (x.assur > 0 ? fmtEur(x.assur) : "aucune"),
      "Chutes et reliquat : " + LABEL_SETS.reliquats[x.reliquats],
      "Contrôle : " + pluriel(nbOk, "conforme") + ", " + nbWarn + " à revoir, " + pluriel(nbBad, "bloquant") + ", " + pluriel(nbInfo, "information"),
      "Calcul : quotebuilder.co/outils/" + SLUG
    ].join("\n");

    return {
      x: x, besoinNet: besoinNet, conso: conso, parPieceReelle: parPieceReelle, tolPieces: tolPieces, matRebutTol: matRebutTol,
      recommandee: recommandee, recoArrondie: recoArrondie, ecart: ecart, manque: manque, complement: complement,
      excess: excess, matExcess: matExcess, valExcess: valExcess, refacon: refacon, expo: expo,
      besoinLabel: besoinLabel, ecartLabel: ecartLabel, rebutLabel: rebutLabel, chargeLabel: chargeLabel, expoLabel: expoLabel,
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
  UNITES,
  computeMatiere,
  normalize,
  fmtNum,
  fmtEur,
  qte,
  dec,
  ent,
  pluriel,
  arrondiSup,
};
