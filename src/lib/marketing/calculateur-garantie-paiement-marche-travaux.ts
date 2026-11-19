/* eslint-disable */
// @ts-nocheck
import { createToolDom } from "./tool-dom";

var SEUIL_HT = 12000;
  var DELAI_MISE_EN_DEMEURE_JOURS = 15;
  var DELAI_ACTION_DIRECTE_MOIS = 1;
  var TAUX_TVA = [20, 10, 5.5, 0];
  var ROLE_LABELS = { titulaire: "titulaire du marché", soustraitant: "sous-traitant" };
  var CLIENT_LABELS = { pro: "professionnel ou personne morale", particulier: "particulier pour ses besoins non professionnels", bailleur: "organisme HLM ou SEM, logements locatifs aidés", public: "acheteur public" };
  var FINANCEMENT_LABELS = { fonds: "sans crédit dédié", partiel: "crédit dédié partiel", total: "crédit dédié total" };
  var DEFAULTS = {
    role: "titulaire", client: "pro", financement: "fonds", tauxTVA: 20,
    prixHT: 48600, avenantsHT: 3200, nonAcceptesHT: 2400, versesConclusionHT: 9720, payesDepuisHT: 14580, impayesHT: 8640,
    dateMiseEnDemeure: "2026-10-13", dateCalcul: "2026-10-28"
  };

  function num(v, min, max, fallback) {
    var n = (v === "" || v == null) ? NaN : Number(v);
    if (!isFinite(n)) n = fallback;
    if (n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  }
  function pick(v, liste, fallback) { return liste.indexOf(v) >= 0 ? v : fallback; }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return d;
  }
  function iso(d) { return d ? d.toISOString().slice(0, 10) : null; }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }
  function addMonths(d, n) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
    var ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
    var last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
    return new Date(Date.UTC(ty, tm, Math.min(day, last)));
  }
  function diffDays(a, b) { return Math.round((b.getTime() - a.getTime()) / 86400000); }
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
  function fmtJours(n) { if (n == null || !isFinite(n)) return "n/a"; var a = Math.abs(n); return groupe(a) + (a > 1 ? " jours" : " jour"); }
  function fmtTaux(t) { return String(t).replace(".", ",") + "\u00a0%"; }
  function ttc(ht, taux) { return Math.round(ht * (100 + taux)) / 100; }

  // Fin du délai de quinze jours : le jour de réception ne compte pas, le délai expire à minuit le quinzième jour.
  // La suspension n'est ouverte qu'à l'issue de ce délai, donc à partir du lendemain (article 1799-1, alinéa 3).
  function finMiseEnDemeure(reception) { return reception ? addDays(reception, DELAI_MISE_EN_DEMEURE_JOURS) : null; }
  function debutSursis(reception) { return reception ? addDays(reception, DELAI_MISE_EN_DEMEURE_JOURS + 1) : null; }

  function computeGarantie(input) {
    var d = {};
    for (var k in DEFAULTS) d[k] = (input && input[k] !== undefined) ? input[k] : DEFAULTS[k];
    var role = pick(d.role, ["titulaire", "soustraitant"], "titulaire");
    var client = pick(d.client, ["pro", "particulier", "bailleur", "public"], "pro");
    var financement = pick(d.financement, ["fonds", "partiel", "total"], "fonds");
    var taux = num(d.tauxTVA, 0, 100, 20);
    if (TAUX_TVA.indexOf(taux) < 0) taux = 20;
    var prix = num(d.prixHT, 0, null, 0);
    var avenants = num(d.avenantsHT, 0, null, 0);
    var nonAcceptes = num(d.nonAcceptesHT, 0, null, 0);
    var verses = num(d.versesConclusionHT, 0, null, 0);
    var payes = num(d.payesDepuisHT, 0, null, 0);
    var sommesDues = Math.max(0, prix + avenants - verses);
    var solde = Math.max(0, sommesDues - payes);
    var impayes = Math.min(num(d.impayesHT, 0, null, 0), solde);
    var auDessus = sommesDues > SEUIL_HT;
    var dateMED = parseDate(d.dateMiseEnDemeure);
    var dateCalcul = parseDate(d.dateCalcul);
    var finMED = finMiseEnDemeure(dateMED);
    var dateSursis = null, dateActionDirecte = null;

    var cas, forme, etat, verdict, garantieDue = false, sursisOuvert = false;
    if (role === "soustraitant") {
      cas = "soustraitant";
      if (client === "public") {
        forme = "Paiement direct par l'acheteur public, si vous êtes accepté et vos conditions de paiement agréées (titre II de la loi du 31 décembre 1975)";
        verdict = "Sous-traitant d'un marché public : pas de garantie de l'article 1799-1. Votre protection est le paiement direct par l'acheteur public, à condition d'avoir été accepté et que vos conditions de paiement aient été agréées. Vérifiez-le auprès de l'entreprise principale avant de commencer.";
      } else {
        garantieDue = true;
        forme = "Caution personnelle et solidaire d'un établissement qualifié, ou délégation du maître de l'ouvrage (article 14 de la loi du 31 décembre 1975)";
        verdict = "Sous-traitant d'un marché privé : l'entreprise principale doit garantir tout ce qu'elle vous devra par une caution personnelle et solidaire, sauf délégation de paiement du maître de l'ouvrage. Sans l'une ou l'autre, le sous-traité est nul, quel que soit le montant. Si l'entreprise principale ne paie pas un mois après une mise en demeure, l'action directe contre le maître de l'ouvrage est ouverte.";
        if (dateMED) dateActionDirecte = addMonths(dateMED, DELAI_ACTION_DIRECTE_MOIS);
      }
      etat = "neutral";
    } else if (client === "public") {
      cas = "public"; forme = "Non : marché public, hors champ de l'article 1799-1";
      etat = "neutral"; verdict = "L'article 1799-1 vise les marchés de travaux privés. Avec un acheteur public, ce sont les règles de la commande publique qui encadrent le paiement : délai de paiement, intérêts moratoires, avance. Lisez le cahier des clauses administratives du marché.";
    } else if (client === "bailleur") {
      cas = "bailleur"; forme = "Non : article 1799-1 écarté pour ces logements (alinéa 5)";
      etat = "neutral"; verdict = "L'article 1799-1 ne s'applique pas aux marchés conclus par un organisme HLM ou une société d'économie mixte pour des logements à usage locatif aidés par l'État. Prévoyez vos garanties dans le contrat : acomptes, échéancier, délais de paiement.";
    } else if (!auDessus) {
      cas = "sousSeuil"; forme = "Non : sommes dues de " + fmtEur(sommesDues) + " HT, le seuil de 12\u00a0000\u00a0€ HT n'est pas dépassé";
      etat = "neutral"; verdict = "Les sommes dues, après déduction des arrhes et acomptes versés à la signature, ne dépassent pas 12\u00a0000\u00a0€ HT : la loi n'impose pas de garantie. Rien ne vous empêche d'en négocier une, ou de prévoir un acompte et des échéances plus serrés.";
    } else if (client === "particulier") {
      cas = "particulier";
      if (financement === "fonds") {
        forme = "Non : particulier sans crédit dédié, pas de caution exigible (alinéa 4)";
        verdict = "Le particulier qui fait faire des travaux pour ses besoins personnels n'a pas à fournir de caution. Sans crédit dédié, l'article 1799-1 ne vous donne aucune garantie : protégez-vous par l'acompte et l'échéancier du devis.";
      } else {
        garantieDue = true;
        forme = "Versement direct du crédit par la banque, sur ordre écrit du client (alinéa 2) ; pas de caution exigible (alinéa 4)";
        verdict = "Le crédit dédié aux travaux ne peut être versé qu'à vous tant que vous n'avez pas reçu tout ce qui vous est dû, sur ordre écrit du client. Il n'y a pas de caution exigible pour un particulier, donc pas de suspension du chantier sur ce fondement.";
      }
      etat = "neutral";
    } else {
      cas = "pro"; garantieDue = true;
      if (financement === "total") {
        forme = "Versement direct du crédit par la banque, sur ordre écrit du client (alinéa 2)";
      } else if (financement === "partiel") {
        forme = "Versement direct du crédit pour sa part (alinéa 2), plus une caution solidaire ou une garantie prévue au contrat pour le reste (alinéa 3)";
        sursisOuvert = true;
      } else {
        forme = "Caution solidaire d'une banque, d'une société de financement, d'un assureur ou d'un organisme de garantie collective, ou garantie prévue au contrat (alinéa 3)";
        sursisOuvert = true;
      }
      if (solde <= 0) {
        etat = "ok"; verdict = "Le prix est payé : il n'y a plus rien à garantir.";
      } else if (!sursisOuvert) {
        etat = "ok"; verdict = "Garantie due sur " + fmtEur(solde) + " HT : la banque ne peut verser le crédit qu'à vous, sur ordre écrit du client, tant que vous n'avez pas été intégralement payé. Demandez au client l'ordre de versement et les coordonnées de la banque.";
      } else if (!dateMED) {
        etat = "ok"; verdict = "Garantie due sur " + fmtEur(solde) + " HT. Demandez-la par lettre recommandée avec accusé de réception en citant l'article 1799-1. Si elle n'est pas fournie quinze jours après la réception et que des travaux exécutés restent impayés, vous pourrez suspendre le chantier.";
      } else if (impayes <= 0) {
        etat = "ok"; verdict = "Garantie due sur " + fmtEur(solde) + " HT. Aucun travail exécuté n'est impayé : la suspension du chantier n'est pas ouverte. Si le client ne fournit pas la garantie, le juge des référés peut l'ordonner.";
      } else {
        dateSursis = debutSursis(dateMED);
        if (dateCalcul && dateCalcul.getTime() >= dateSursis.getTime()) {
          etat = "warn"; verdict = "Le délai de quinze jours a expiré le " + fmtDate(finMED) + ". Si aucune garantie n'a été fournie, vous pouvez suspendre l'exécution des travaux depuis le " + fmtDate(dateSursis) + ", tant que " + fmtEur(impayes) + " HT de travaux exécutés restent impayés. Prévenez le client par écrit, datez l'arrêt et sécurisez le chantier.";
        } else {
          etat = "ok"; verdict = "Garantie due sur " + fmtEur(solde) + " HT. Le délai de quinze jours court jusqu'au " + fmtDate(finMED) + " inclus : sans garantie à cette date et avec " + fmtEur(impayes) + " HT de travaux exécutés impayés, la suspension du chantier sera possible à partir du " + fmtDate(dateSursis) + ".";
        }
      }
    }
    var joursAvantSursis = (dateSursis && dateCalcul) ? diffDays(dateCalcul, dateSursis) : null;

    var lignesGarantie = garantieDue ? ["couvert", "couvert", "non couvert tant que non accepté", "déduit", "base de la garantie", "déduit", "à couvrir", "condition de la suspension"] : ["sans objet", "sans objet", "sans objet", "déduit", "comparé au seuil", "déduit", "sans objet", "sans objet"];
    var montants = [prix, avenants, nonAcceptes, verses, sommesDues, payes, solde, impayes];
    var libelles = ["Prix convenu au devis accepté", "Avenants et travaux supplémentaires acceptés", "Travaux supplémentaires non acceptés", "Arrhes et acomptes versés à la signature", "Sommes à garantir", "Paiements reçus depuis", "Solde encore dû", "Travaux exécutés impayés"];
    var detail = libelles.map(function (l, i) { return { ligne: l, ht: montants[i], ttc: ttc(montants[i], taux), garantie: lignesGarantie[i] }; });

    var calendrier = [];
    if (dateMED) {
      calendrier.push({ date: dateMED, etape: "Réception de la mise en demeure", effet: role === "soustraitant" ? "Point de départ du mois laissé à l'entreprise principale" : "Point de départ du délai de quinze jours" });
      if (role === "soustraitant") {
        if (dateActionDirecte) calendrier.push({ date: dateActionDirecte, etape: "Un mois après", effet: "Action directe contre le maître de l'ouvrage possible si la mise en demeure de payer est restée sans effet (article 12)" });
      } else {
        calendrier.push({ date: finMED, etape: "Fin du délai de quinze jours", effet: "Dernier jour laissé au client pour fournir la garantie" });
        if (dateSursis) calendrier.push({ date: dateSursis, etape: "Lendemain", effet: "Suspension du chantier possible si aucune garantie et des travaux exécutés impayés" });
      }
    }
    if (dateCalcul) calendrier.push({ date: dateCalcul, etape: "Date du calcul", effet: joursAvantSursis == null ? "Situation à cette date" : (joursAvantSursis > 0 ? fmtJours(joursAvantSursis) + " avant la suspension possible" : "Suspension possible") , cur: true });
    calendrier.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });

    var conseils = [];
    if (cas === "pro" && solde > 0) {
      conseils.push("Demandez la garantie par lettre recommandée avec accusé de réception, en citant l'article 1799-1 du Code civil et le montant à couvrir (" + fmtEur(solde) + " HT). La mise en demeure doit prendre cette forme (article 1er du décret du 30 juillet 1999).");
    } else if (cas === "soustraitant") {
      conseils.push("Demandez à l'entreprise principale l'acte de caution, ou la délégation de paiement signée par le maître de l'ouvrage, avant de commencer. Le maître de l'ouvrage doit lui aussi exiger cette justification dans les marchés de bâtiment et de travaux publics (article 14-1).");
    } else {
      conseils.push("Quand la garantie légale n'est pas due, c'est le devis qui vous protège : acompte à la commande, échéancier calé sur l'avancement, pénalités de retard et indemnité de 40\u00a0€ entre professionnels.");
    }
    conseils.push("La garantie peut être demandée à tout moment tant que le prix n'est pas intégralement payé : en cours de chantier, après la réception, et même après la résiliation du marché (Cass. 3e civ., 9 novembre 2005, n° 04-20.047 ; 15 septembre 2016, n° 15-19.648 ; 18 mai 2017, n° 16-16.795).");
    conseils.push(nonAcceptes > 0
      ? fmtEur(nonAcceptes) + " HT de travaux supplémentaires ne sont pas couverts : faites-les accepter par écrit (devis complémentaire signé, avenant, ordre de service) pour les faire entrer dans le prix garanti."
      : "Avant tout travail en plus, faites accepter un devis complémentaire ou un avenant : la garantie porte sur le prix initial ou sur le nouveau montant convenu entre les parties (Cass. 3e civ., 4 janvier 2006, n° 04-17.226).");
    conseils.push("Les reproches sur la qualité des travaux, une compensation future ou la retenue de garantie de 5 % ne dispensent pas le client de fournir la garantie, ni n'en réduisent le montant : c'est ce qu'a jugé la cour d'appel de Reims le 8 septembre 2026 (RG 25/01799).");
    conseils.push("Si le client refuse, le juge des référés peut ordonner la fourniture de la garantie, au besoin sous astreinte, parce que l'obligation n'est pas sérieusement contestable (articles 835 et 873 du Code de procédure civile).");
    conseils.push("QuoteBuilder ne fait ni signature de devis, ni facture, ni suivi de paiement : le prix accepté, les avenants et les situations restent dans vos outils. Vous pouvez ajouter au funnel des questions sur le type de client et le financement des travaux, pour savoir dès la demande si la garantie sera due.");

    var statut;
    if (!garantieDue) statut = "pas de garantie de l'article 1799-1 exigible";
    else if (cas === "soustraitant") statut = "caution ou délégation exigée pour tout le sous-traité" + (dateActionDirecte ? ", action directe possible à partir du " + fmtDate(dateActionDirecte) + " si la mise en demeure de payer reste sans effet" : "");
    else if (solde <= 0) statut = "prix payé, plus rien à garantir";
    else if (joursAvantSursis == null) statut = "garantie due sur " + fmtEur(solde) + " HT";
    else statut = joursAvantSursis > 0 ? "suspension possible dans " + fmtJours(joursAvantSursis) + ", le " + fmtDate(dateSursis) : "suspension possible depuis le " + fmtDate(dateSursis) + " si aucune garantie n'a été fournie";

    var recap = [
      "Garantie de paiement, article 1799-1 du Code civil (calcul indicatif)",
      "Position : " + ROLE_LABELS[role] + " ; client : " + CLIENT_LABELS[client] + " ; financement : " + FINANCEMENT_LABELS[financement],
      "Prix convenu : " + fmtEur(prix) + " HT ; avenants acceptés : " + fmtEur(avenants) + " HT ; non acceptés, hors garantie : " + fmtEur(nonAcceptes) + " HT",
      "Versements à la signature : " + fmtEur(verses) + " HT ; sommes à garantir : " + fmtEur(sommesDues) + " HT (seuil de 12\u00a0000\u00a0€ HT " + (auDessus ? "dépassé" : "non dépassé") + ")",
      "Garantie exigible : " + forme,
      "Solde encore dû : " + fmtEur(solde) + " HT, soit " + fmtEur(ttc(solde, taux)) + " TTC à " + fmtTaux(taux),
      "Mise en demeure reçue le : " + fmtDate(dateMED) + (role === "soustraitant" ? "" : " ; fin du délai de quinze jours : " + fmtDate(finMED)),
      "Au " + fmtDate(dateCalcul) + " : " + statut,
      "Calcul : quotebuilder.co/outils/calculateur-garantie-paiement-marche-travaux"
    ].join("\n");

    return {
      role: role, client: client, financement: financement, taux: taux, cas: cas, garantieDue: garantieDue, sursisOuvert: sursisOuvert,
      prix: prix, avenants: avenants, nonAcceptes: nonAcceptes, verses: verses, payes: payes, sommesDues: sommesDues, auDessus: auDessus,
      solde: solde, soldeTTC: ttc(solde, taux), impayes: impayes, dateMiseEnDemeure: dateMED, dateCalcul: dateCalcul,
      finMiseEnDemeure: finMED, dateSursis: dateSursis, joursAvantSursis: joursAvantSursis, dateActionDirecte: dateActionDirecte,
      forme: forme, etat: etat, verdict: verdict, detail: detail, calendrier: calendrier, conseils: conseils, statut: statut, recap: recap
    };
  }
  function buildRecap(input) { return computeGarantie(input).recap; }

export { SEUIL_HT, DELAI_MISE_EN_DEMEURE_JOURS, DELAI_ACTION_DIRECTE_MOIS, TAUX_TVA, ROLE_LABELS, CLIENT_LABELS, FINANCEMENT_LABELS, DEFAULTS, computeGarantie, buildRecap, finMiseEnDemeure, debutSursis, ttc, parseDate, iso, addDays, addMonths, diffDays, fmtDate, fmtEur, fmtJours, fmtTaux };

export function renderView(input) {
  var built = createToolDom(input || {});
  var document = built.document;
  
  
    var $ = function (id) { return document.getElementById(id); };
    var ids = ["role", "client", "financement", "tauxTVA", "prixHT", "avenantsHT", "nonAcceptesHT", "versesConclusionHT", "payesDepuisHT", "impayesHT", "dateMiseEnDemeure", "dateCalcul"];
    function read() { var o = {}; ids.forEach(function (k) { o[k] = $(k).value; }); return o; }
    function row(tb, cells, cls) {
      var tr = document.createElement("tr"); if (cls) tr.className = cls;
      cells.forEach(function (t) { var td = document.createElement("td"); td.textContent = t; tr.appendChild(td); });
      tb.appendChild(tr);
    }
    function render() {
      var r = computeGarantie(read());
      $("sommesDues").textContent = fmtEur(r.sommesDues) + " HT";
      $("forme").textContent = r.forme;
      $("solde").textContent = fmtEur(r.solde) + " HT, " + fmtEur(r.soldeTTC) + " TTC";
      $("dateSursis").textContent = r.dateSursis ? fmtDate(r.dateSursis) : "n/a";
      var v = $("verdict"); v.className = "alert " + r.etat; v.textContent = r.verdict;
      var tb = $("detail"); tb.innerHTML = "";
      r.detail.forEach(function (l) { row(tb, [l.ligne, fmtEur(l.ht), fmtEur(l.ttc), l.garantie], l.ligne === "Solde encore dû" ? "cur" : (/non couvert/.test(l.garantie) && l.ht > 0 ? "weak" : "")); });
      var tc = $("calendrier"); tc.innerHTML = "";
      r.calendrier.forEach(function (l) { row(tc, [fmtDate(l.date), l.etape, l.effet], l.cur ? "cur" : ""); });
      var ul = $("conseils"); ul.innerHTML = "";
      r.conseils.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
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
