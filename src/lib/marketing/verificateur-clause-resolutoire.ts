/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SLUG = "verificateur-clause-resolutoire";
  var ROLE_LABELS = { prestataire: "prestataire qui rédige la clause", client: "client qui relit la clause" };
  var TYPE_CLAUSE_LABELS = {
    resolutoirePleinDroit: "clause résolutoire de plein droit (1225)",
    unilaterale: "résolution unilatérale par notification (1226)",
    judiciaire: "résolution judiciaire seulement (1227-1228)",
    aucune: "aucune clause prévue"
  };
  var MANQUEMENT_LABELS = { impaye: "impayé", retard: "retard de livraison ou d'exécution", qualite: "défaut de qualité / non-conformité", autre: "autre manquement" };
  var GRAVITE_LABELS = { grave: "suffisamment grave", discutee: "discutable", legere: "légère" };
  var MISE_LABELS = { ouiDate: "mise en demeure datée", ouiSansDate: "mise en demeure sans date connue", non: "pas de mise en demeure", vaine: "mise en demeure jugée vaine" };
  var MENTION_LABELS = { oui: "clause citée expressément", non: "simple relance sans mention", na: "sans objet" };
  var URGENCE_LABELS = { non: "pas d'urgence particulière", oui: "urgence caractérisée" };
  var PRECISION_LABELS = { noms: "obligations nommément listées", generale: "formule générale sur les obligations du contrat", vague: "formule trop vague", aucune: "aucun engagement précisé" };
  var PRESENTATION_LABELS = { signature: "rappelée près de la signature", titre: "article titré en caractères distincts", noyee: "noyée dans les CGV", facture: "seulement sur la facture" };
  var ACCEPTATION_LABELS = { signee: "CGV jointes au devis signé", lien: "CGV en lien sans mention d'acceptation", aucune: "CGV jamais transmises" };
  var RECIPROCITE_LABELS = { reciproque: "les deux parties", prestataireSeul: "le prestataire seulement", clientSeul: "le client seulement" };
  var EXCLUSION_FM_LABELS = { oui: "force majeure exclue de la clause", non: "force majeure non exclue" };
  var BONNEFOI_LABELS = { non: "aucune tolérance prolongée", oui: "manquement longtemps toléré" };
  var STATUT_LABELS = { ok: "Conforme", warn: "À compléter", bad: "Bloquant", info: "Information" };
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var DEFAULTS = {
    role: "prestataire",
    typeClause: "resolutoirePleinDroit",
    manquement: "impaye",
    gravite: "grave",
    miseEnDemeure: "ouiDate",
    delaiRegulJours: 15,
    dateMiseEnDemeure: "2027-02-10",
    mentionClause: "oui",
    urgence: "non",
    precisionEngagements: "generale",
    presentation: "noyee",
    acceptation: "signee",
    reciprocite: "reciproque",
    exclusionForceMajeure: "non",
    bonneFoi: "non"
  };

  function num(v, min, max, fallback) {
    var n = typeof v === "number" ? v : parseFloat(String(v === undefined || v === null ? "" : v).replace(/[\s\u00a0]/g, "").replace(",", "."));
    if (!isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }
  function pick(v, obj, fallback) { return Object.prototype.hasOwnProperty.call(obj, v) ? v : fallback; }
  function pluriel(n, un, plusieurs) { return n + " " + (n > 1 ? plusieurs : un); }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var t = new Date(Date.UTC(y, mo - 1, d));
    if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d };
  }
  function addDays(dt, n) {
    var t = new Date(Date.UTC(dt.y, dt.m - 1, dt.d) + n * 86400000);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }
  function fmtDate(dt) { return (dt.d === 1 ? "1er" : String(dt.d)) + " " + MOIS[dt.m - 1] + " " + dt.y; }

  function computeResolutoire(input) {
    var d = {};
    for (var key in DEFAULTS) d[key] = input && input[key] !== undefined ? input[key] : DEFAULTS[key];
    var role = pick(d.role, ROLE_LABELS, "prestataire");
    var typeClause = pick(d.typeClause, TYPE_CLAUSE_LABELS, "resolutoirePleinDroit");
    var manquement = pick(d.manquement, MANQUEMENT_LABELS, "impaye");
    var gravite = pick(d.gravite, GRAVITE_LABELS, "grave");
    var miseEnDemeure = pick(d.miseEnDemeure, MISE_LABELS, "ouiDate");
    var delaiRegulJours = num(d.delaiRegulJours, 0, 365, 0);
    var mentionClause = pick(d.mentionClause, MENTION_LABELS, "oui");
    var urgence = pick(d.urgence, URGENCE_LABELS, "non");
    var precisionEngagements = pick(d.precisionEngagements, PRECISION_LABELS, "generale");
    var presentation = pick(d.presentation, PRESENTATION_LABELS, "noyee");
    var acceptation = pick(d.acceptation, ACCEPTATION_LABELS, "signee");
    var reciprocite = pick(d.reciprocite, RECIPROCITE_LABELS, "reciproque");
    var exclusionForceMajeure = pick(d.exclusionForceMajeure, EXCLUSION_FM_LABELS, "non");
    var bonneFoi = pick(d.bonneFoi, BONNEFOI_LABELS, "non");

    var dateMed = parseDate(d.dateMiseEnDemeure) || parseDate(DEFAULTS.dateMiseEnDemeure);
    var dateMedFmt = fmtDate(dateMed);
    var finDelai = null;
    var finDelaiFmt = null;
    if (miseEnDemeure === "ouiDate" && delaiRegulJours > 0) {
      finDelai = addDays(dateMed, delaiRegulJours);
      finDelaiFmt = fmtDate(finDelai);
    }

    var controles = [];
    function add(point, statut, texte) { controles.push({ point: point, statut: statut, texte: texte }); }

    // 1. Voie choisie
    if (typeClause === "resolutoirePleinDroit") {
      add("Voie choisie", "ok", "Clause résolutoire de plein droit (article 1225). Si les conditions sont réunies, le juge constate la résolution sans apprécier la gravité.");
    } else if (typeClause === "unilaterale") {
      add("Voie choisie", "ok", "Résolution unilatérale par notification (article 1226), à vos risques et périls. Le créancier doit prouver la gravité (arrêt Tocqueville, Cass. 1re civ., 13 octobre 1998, n° 96-21.485).");
    } else if (typeClause === "judiciaire") {
      add("Voie choisie", "info", "Résolution judiciaire (articles 1227 et 1228) : plus lente, plus sûre. Le juge peut ordonner l'exécution ou allouer seulement des dommages et intérêts.");
    } else {
      add("Voie choisie", "warn", "Aucune clause prévue. Hors urgence, la sortie passe par l'article 1226 (notification) ou 1227 (juge). Rédigez une clause résolutoire si vous voulez sécuriser la rupture.");
    }

    // 2. Précision des engagements
    if (typeClause === "resolutoirePleinDroit" || typeClause === "aucune") {
      if (precisionEngagements === "noms") {
        add("Précision des engagements", "ok", "Les obligations critiques sont nommément listées. Article 1225 et Cass. com., 3 juin 2026, n° 24-19.612.");
      } else if (precisionEngagements === "generale") {
        add("Précision des engagements", "warn", "Formule générale acceptable si les obligations du contrat sont identifiables (Cass. com., 3 juin 2026, n° 24-19.612). Préférez une liste nommément.");
      } else if (precisionEngagements === "vague") {
        add("Précision des engagements", "warn", "« Manquement grave » sans plus ouvre un débat sur l'identification des engagements. Article 1225.");
      } else {
        add("Précision des engagements", "bad", "Aucun engagement précisé : la clause résolutoire ne remplit pas l'article 1225.");
      }
    } else {
      add("Précision des engagements", "info", "Hors clause résolutoire, la précision des engagements reste utile pour motivier la notification, mais n'est pas une condition de forme de l'article 1225.");
    }

    // 3. Présentation
    if (presentation === "signature" || presentation === "titre") {
      add("Présentation de la clause", "ok", "Clause apparente (près de la signature ou article titré).");
    } else if (presentation === "noyee") {
      add("Présentation de la clause", "warn", "Clause noyée dans les CGV, même police : risque d'inopposabilité, surtout en contrat d'adhésion (article 1171).");
    } else {
      add("Présentation de la clause", "bad", "Clause seulement sur la facture : inopposable. Elle doit figurer dans le devis accepté ou les CGV jointes.");
    }

    // 4. Acceptation
    if (acceptation === "signee") {
      add("Acceptation des CGV", "ok", "CGV jointes au devis signé (article 1119).");
    } else if (acceptation === "lien") {
      add("Acceptation des CGV", "warn", "Lien seul, sans mention d'acceptation : opposabilité fragile (article 1119).");
    } else {
      add("Acceptation des CGV", "bad", "CGV jamais transmises : la clause est inopposable.");
    }

    // 5. Mise en demeure
    if (typeClause === "judiciaire") {
      add("Mise en demeure", "info", "En résolution judiciaire, la mise en demeure reste utile pour constituer le débiteur en demeure, mais la rupture dépend du juge.");
    } else if (miseEnDemeure === "ouiDate") {
      if (typeClause === "resolutoirePleinDroit" && mentionClause === "non") {
        add("Mise en demeure", "bad", "Mise en demeure sans mention expresse de la clause résolutoire : elle ne produit pas effet (article 1225).");
      } else if (typeClause === "unilaterale" && mentionClause === "non") {
        add("Mise en demeure", "bad", "Mise en demeure qui n'annonce pas le droit de résoudre : elle vaut relance, pas préalable à l'article 1226.");
      } else if (delaiRegulJours === 0) {
        add("Mise en demeure", "warn", "Mise en demeure datée mais sans délai de régularisation chiffré. Fixez un délai raisonnable.");
      } else if (delaiRegulJours < 8) {
        add("Mise en demeure", "warn", "Délai de " + delaiRegulJours + " jours : risque d'être jugé trop court (repère de l'outil, pas un seuil légal). Fin du délai : " + (finDelaiFmt || "non calculable") + ".");
      } else if (delaiRegulJours > 90) {
        add("Mise en demeure", "warn", "Délai de " + delaiRegulJours + " jours : long pour un impayé (repère de l'outil). Fin du délai : " + finDelaiFmt + ".");
      } else {
        add("Mise en demeure", "ok", "Mise en demeure datée du " + dateMedFmt + ", délai de " + delaiRegulJours + " jours, fin le " + finDelaiFmt + ".");
      }
    } else if (miseEnDemeure === "ouiSansDate") {
      add("Mise en demeure", "warn", "Mise en demeure envoyée mais date inconnue : impossible de calculer la fin du délai.");
    } else if (miseEnDemeure === "vaine") {
      add("Mise en demeure", "warn", "Dispense pour mise en demeure vaine (Cass. com., 17 janvier 2024, n° 22-20.785 ; 18 octobre 2023, n° 20-21.579). Exception étroite : documentez les alertes antérieures.");
    } else if (urgence === "oui") {
      add("Mise en demeure", "warn", "Pas de mise en demeure, urgence invoquée (article 1226). L'urgence s'apprécie après coup (Cass. com., 4 septembre 2024, n° 23-14.923).");
    } else {
      add("Mise en demeure", "bad", "Pas de mise en demeure et pas d'urgence : la résolution unilatérale ou le jeu de la clause sont irréguliers.");
    }

    // 6. Mention de la clause (séparé si déjà couvert partiellement)
    if (typeClause === "resolutoirePleinDroit") {
      if (mentionClause === "oui") {
        add("Mention de la clause", "ok", "La mise en demeure cite expressément la clause résolutoire (article 1225).");
      } else if (mentionClause === "na") {
        add("Mention de la clause", "warn", "Mention « sans objet » alors qu'une clause résolutoire est en jeu : corrigez.");
      } else if (miseEnDemeure === "non" || miseEnDemeure === "vaine") {
        add("Mention de la clause", "info", "Pas de mise en demeure : la mention de la clause ne peut pas être vérifiée.");
      } else {
        add("Mention de la clause", "bad", "Sans mention expresse, la mise en demeure ne déclenche pas la clause (article 1225).");
      }
    } else if (typeClause === "unilaterale") {
      if (mentionClause === "oui" || mentionClause === "na") {
        add("Mention de la clause", "ok", "La mise en demeure annonce le droit de résoudre (article 1226), ou la mention est sans objet.");
      } else if (miseEnDemeure === "non" || miseEnDemeure === "vaine") {
        add("Mention de la clause", "info", "Pas de mise en demeure : la mention du droit de résoudre ne peut pas être vérifiée.");
      } else {
        add("Mention de la clause", "bad", "La mise en demeure doit dire qu'à défaut d'exécution, le créancier sera en droit de résoudre le contrat.");
      }
    } else {
      add("Mention de la clause", "info", "Hors clause résolutoire et hors 1226, la mention de la clause n'est pas le critère central.");
    }

    // 7. Gravité
    if (typeClause === "resolutoirePleinDroit") {
      add("Gravité du manquement", "info", "Avec une clause résolutoire valable, le juge ne réapprécie en principe pas la gravité si l'engagement visé est inexécuté. Reste le contrôle de bonne foi (article 1104).");
    } else if (gravite === "grave") {
      add("Gravité du manquement", "ok", "Inexécution présentée comme suffisamment grave (obligation essentielle ou répétée). Charge de la preuve sur le créancier (article 1226).");
    } else if (gravite === "discutee") {
      add("Gravité du manquement", "warn", "Gravité discutable : préférez la voie judiciaire (1227) ou une mise en demeure supplémentaire.");
    } else {
      add("Gravité du manquement", "bad", "Manquement léger : une résolution unilatérale risque d'être jugée fautive.");
    }

    // 8. Réciprocité
    if (reciprocite === "reciproque") {
      add("Réciprocité", "ok", "Les deux parties peuvent invoquer la résolution.");
    } else if (reciprocite === "prestataireSeul" || reciprocite === "clientSeul") {
      add("Réciprocité", "warn", "Clause unilatérale : risque de déséquilibre significatif en contrat d'adhésion (article 1171).");
    } else {
      add("Réciprocité", "warn", "Réciprocité à clarifier.");
    }

    // 9. Force majeure
    if (exclusionForceMajeure === "oui") {
      add("Force majeure", "ok", "La force majeure (article 1218) reste hors du jeu de la clause résolutoire : bon cloisonnement.");
    } else {
      add("Force majeure", "warn", "La clause ne dit rien sur la force majeure. Distinguez 1218 (empêchement) de la résolution pour inexécution. Voir le vérificateur force majeure / imprévision.");
    }

    // 10. Bonne foi
    if (bonneFoi === "oui") {
      add("Bonne foi", "bad", "Manquement longtemps toléré puis rupture brutale : risque de mauvaise foi (Cass. 1re civ., 31 janvier 1995, n° 92-20.654 ; article 1104).");
    } else {
      add("Bonne foi", "ok", "Aucune tolérance prolongée signalée.");
    }

    // 11. Manquement documenté
    if (manquement === "impaye" || manquement === "retard" || manquement === "qualite") {
      add("Nature du manquement", "ok", "Manquement identifié : " + MANQUEMENT_LABELS[manquement] + ". Gardez factures, PV de recette, échanges écrits.");
    } else {
      add("Nature du manquement", "warn", "« Autre manquement » : précisez l'obligation et les pièces avant de notifier.");
    }

    // 12. Urgence / procédure collective (info)
    if (urgence === "oui") {
      add("Urgence et limites", "warn", "Urgence invoquée : documentez les pertes et l'impossibilité d'attendre. Hors urgence, respectez la mise en demeure. Procédure collective : L622-13 du code de commerce.");
    } else {
      add("Urgence et limites", "info", "Pas d'urgence. En procédure collective, l'ouverture n'autorise pas à elle seule la résolution (L622-13, L622-21).");
    }

    var nbOk = 0, nbWarn = 0, nbBad = 0, nbInfo = 0;
    for (var i = 0; i < controles.length; i++) {
      var s = controles[i].statut;
      if (s === "ok") nbOk++;
      else if (s === "warn") nbWarn++;
      else if (s === "bad") nbBad++;
      else nbInfo++;
    }
    var etat = nbBad > 0 ? "bad" : (nbWarn > 0 ? "warn" : "ok");
    var statutLabel = STATUT_LABELS[etat];

    var voieLabel = typeClause === "resolutoirePleinDroit" ? "Clause 1225" :
      typeClause === "unilaterale" ? "Notification 1226" :
      typeClause === "judiciaire" ? "Juge 1227" : "Aucune";
    var clauseQuality = "Fragile";
    if (nbBad > 0) clauseQuality = "Inopposable";
    else if (typeClause === "aucune") clauseQuality = "Absente";
    else if (precisionEngagements === "noms" && presentation !== "noyee" && presentation !== "facture" && acceptation === "signee" && reciprocite === "reciproque") clauseQuality = "Solide";
    else if (nbWarn <= 2 && acceptation === "signee") clauseQuality = "Correcte";
    else if (acceptation === "signee") clauseQuality = "Fragile";

    var delaiLabel = "Non calculable";
    if (finDelaiFmt) delaiLabel = "Le " + finDelaiFmt;
    else if (miseEnDemeure === "non" && urgence === "oui") delaiLabel = "Urgence invoquée";
    else if (miseEnDemeure === "vaine") delaiLabel = "Dispense (vaine)";
    else if (miseEnDemeure === "ouiSansDate") delaiLabel = "Date inconnue";
    else if (delaiRegulJours === 0) delaiLabel = "Délai non fixé";

    var verdict;
    if (etat === "bad") {
      verdict = "La rupture est bloquée sur " + pluriel(nbBad, "point", "points") + ". Corrigez-les avant d'envoyer une notification de résolution.";
    } else if (etat === "warn") {
      verdict = "La clause tient en partie, mais " + pluriel(nbWarn, "point reste", "points restent") + " à compléter. Ce sont eux qui seront discutés le jour du litige.";
    } else {
      verdict = "La voie choisie est cohérente avec les réponses. Relisez encore la mise en demeure et les pièces avant de notifier.";
    }

    // Clause rédigée
    var articles = [];
    articles.push("Article 1 · Résolution pour inexécution\nEn cas d'inexécution par l'une des parties de ses obligations essentielles, notamment [paiement du prix / respect des délais / conformité de la prestation], l'autre partie pourra résoudre le contrat dans les conditions du présent article, sans préjudice de ses dommages et intérêts.");
    if (typeClause === "resolutoirePleinDroit" || typeClause === "aucune") {
      articles.push("Article 2 · Clause résolutoire\nLa résolution interviendra de plein droit quinze jours après une mise en demeure restée infructueuse, adressée par lettre recommandée avec avis de réception (ou tout procédé équivalent prévu au contrat), mentionnant expressément la présente clause résolutoire. Les parties peuvent convenir, pour les seuls manquements suivants, que la résolution résulte du seul fait de l'inexécution : [liste].");
    } else if (typeClause === "unilaterale") {
      articles.push("Article 2 · Résolution par notification\nConformément à l'article 1226 du code civil, le créancier pourra, à ses risques et périls, résoudre le contrat par notification motivée, après mise en demeure laissant un délai raisonnable et annonçant le droit de résoudre. La résolution prend effet à réception de la notification.");
    } else {
      articles.push("Article 2 · Résolution judiciaire\nToute résolution pour inexécution sera demandée en justice (articles 1227 et 1228). Les parties s'engagent à se mettre en demeure préalablement, sauf urgence.");
    }
    articles.push("Article 3 · Effets\nLa résolution met fin au contrat dans les conditions de l'article 1229. Les clauses relatives au règlement des différends, à la confidentialité, à la non-concurrence et à la limitation de responsabilité survivent (article 1230).");
    articles.push("Article 4 · Force majeure\nLe présent article ne fait pas obstacle à l'application de l'article 1218 du code civil. Un empêchement de force majeure n'est pas traité comme une inexécution fautive au sens de la clause résolutoire.");
    articles.push("Article 5 · Bonne foi\nLa mise en œuvre de la clause s'exerce de bonne foi (article 1104). Un manquement longtemps toléré ne pourra être invoqué sans nouvelle mise en demeure motivée.");
    var clause = articles.join("\n\n");

    // Actions
    var actions = [];
    for (var j = 0; j < controles.length; j++) {
      var c = controles[j];
      if (c.statut === "bad" || c.statut === "warn") {
        actions.push(c.point + " : " + c.texte);
      }
    }
    actions.push("Avant toute notification : rassemblez les pièces (devis signé, CGV, factures, échanges) et faites relire le courrier.");

    // Message
    var message;
    if (role === "client") {
      message = "Bonjour,\n\nAvant de signer, je souhaite clarifier la clause de résolution / clause résolutoire.\n\nVoie indiquée : " + TYPE_CLAUSE_LABELS[typeClause] + ".\nManquement type : " + MANQUEMENT_LABELS[manquement] + ".\n\nPouvez-vous confirmer :\n1. que la mise en demeure mentionnera expressément la clause (article 1225) ou le droit de résoudre (article 1226) ;\n2. le délai de régularisation prévu ;\n3. que la clause est réciproque ;\n4. le sort de la force majeure (article 1218).\n\nMerci.";
    } else {
      message = "Bonjour,\n\nNous vous mettons en demeure de [régulariser le paiement / livrer / corriger la non-conformité] dans un délai de " + (delaiRegulJours || 15) + " jours à compter de la réception de la présente.\n\nÀ défaut, nous serons en droit de résoudre le contrat" + (typeClause === "resolutoirePleinDroit" ? ", en application de la clause résolutoire figurant à l'article [X] de nos conditions générales" : " par notification motivée conformément à l'article 1226 du code civil") + ".\n\nLa présente vaut mise en demeure.\n\nCordialement.";
    }

    var recapLines = [
      "Position : " + ROLE_LABELS[role],
      "Voie : " + TYPE_CLAUSE_LABELS[typeClause],
      "Manquement : " + MANQUEMENT_LABELS[manquement],
      "Gravité : " + GRAVITE_LABELS[gravite],
      "Mise en demeure : " + MISE_LABELS[miseEnDemeure],
      "Délai : " + delaiRegulJours + " jours" + (finDelaiFmt ? " (fin le " + finDelaiFmt + ")" : ""),
      "Précision : " + PRECISION_LABELS[precisionEngagements],
      "Présentation : " + PRESENTATION_LABELS[presentation],
      "Acceptation : " + ACCEPTATION_LABELS[acceptation],
      "Verdict : " + statutLabel + " · " + clauseQuality,
      "Calcul : quotebuilder.co/outils/" + SLUG
    ];
    var recap = recapLines.join("\n");

    return {
      role: role, typeClause: typeClause, manquement: manquement, gravite: gravite,
      miseEnDemeure: miseEnDemeure, delaiRegulJours: delaiRegulJours, mentionClause: mentionClause,
      urgence: urgence, precisionEngagements: precisionEngagements, presentation: presentation,
      acceptation: acceptation, reciprocite: reciprocite, exclusionForceMajeure: exclusionForceMajeure,
      bonneFoi: bonneFoi,
      dateMiseEnDemeureFmt: dateMedFmt, finDelai: finDelai, finDelaiFmt: finDelaiFmt,
      controles: controles, nbOk: nbOk, nbWarn: nbWarn, nbBad: nbBad, nbInfo: nbInfo,
      etat: etat, statutLabel: statutLabel, voieLabel: voieLabel, clauseQuality: clauseQuality,
      delaiLabel: delaiLabel, verdict: verdict, clause: clause, articles: articles.length,
      actions: actions, message: message, recap: recap
    };
  }

  function buildRecap(r) { return r.recap; }

export { SLUG, DEFAULTS, STATUT_LABELS, ROLE_LABELS, TYPE_CLAUSE_LABELS, MANQUEMENT_LABELS, GRAVITE_LABELS, MISE_LABELS, MENTION_LABELS, URGENCE_LABELS, PRECISION_LABELS, PRESENTATION_LABELS, ACCEPTATION_LABELS, RECIPROCITE_LABELS, EXCLUSION_FM_LABELS, BONNEFOI_LABELS, computeResolutoire, buildRecap, fmtDate, addDays, parseDate, num };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  function readForm() {
    var o = {};
    for (var k in DEFAULTS) {
      var el = document.getElementById(k);
      if (!el) continue;
      o[k] = el.type === "number" ? el.value : el.value;
    }
    return o;
  }
function render() {
    var r = computeResolutoire(readForm());
    document.getElementById("voieOut").textContent = r.voieLabel;
    document.getElementById("delaiOut").textContent = r.delaiLabel;
    document.getElementById("clauseOut").textContent = r.clauseQuality;
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
      tr.innerHTML = "<td>" + c.point + "</td><td>" + STATUT_LABELS[c.statut] + "</td><td>" + c.texte + "</td>";
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
