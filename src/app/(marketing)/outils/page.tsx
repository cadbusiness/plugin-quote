import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { outilsHubIntro } from "@/lib/marketing/blog";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Outils devis B2B",
  description:
    "Calculateur de CA perdu sans relance, générateur de séquence, score de brief, simulateur de conversion, capacité équipe, temps de chiffrage, impact remise, seuil de remise et plancher de marge, ROI logiciel, taux d’acceptation, coût d’un brief incomplet, coût des devis expirés, calculateur d’acompte, gain de temps catalogue, générateur d’URL de préremplissage, estimateur leads formulaire vs funnel WordPress, estimateur coût des devis PDF seuls, checklist mentions devis France, estimateur coût des allers-retours brief sans photos, estimateur coût des e-mails de clarification, estimateur coût des devis envoyés sans validation interne, estimateur coût des relances à l’aveugle, estimateur coût d’attente multi-décideurs, estimateur coût des visites techniques inutiles, estimateur coût du pipeline fantôme, calculateur TVA devis HT/TTC, estimateur coût des demandes orales non capturées, estimateur coût de la double saisie devis, estimateur coût handoff commercial vers technique, estimateur coût du contexte hors dossier devis, estimateur valeur des produits suggérés dans un devis, estimateur requalification chat vs formulaire, estimateur des demandes hors budget et de la fourchette de prix. Outils gratuits QuoteBuilder.",
  path: "/outils",
});

const TOOLS = [
  {
    href: "/outils/cout-devis-non-relance",
    eyebrow: "Pilotage",
    title: "Coût d’un devis non relancé",
    text: "Devis par mois, panier, taux actuel et cible. L’écart annuel s’affiche. À coller dans un COMEX.",
  },
  {
    href: "/outils/generateur-sequence-relances",
    eyebrow: "Autopilote",
    title: "Générateur de séquence de relances",
    text: "T+0, T+4 h, T+24 h, T+3 j, T+7 j, T+30 j. Sujets et corps prêts à copier, selon le secteur.",
  },
  {
    href: "/outils/score-brief-devis",
    eyebrow: "Pilotage",
    title: "Score brief devis (0–100)",
    text: "Cinq questions pondérées. Score live et reco Hot / Warm / Cold / Parking avant de chiffrer.",
  },
  {
    href: "/outils/simulateur-taux-conversion-devis",
    eyebrow: "Pilotage",
    title: "Simulateur de taux de conversion devis",
    text: "Devis envoyés, panier, taux actuel et cible. CA mensuel, gain, option mix Hot / Warm / Cold.",
  },
  {
    href: "/outils/calculateur-capacite-equipe-devis",
    eyebrow: "Pilotage",
    title: "Calculateur de capacité équipe devis",
    text: "Commerciaux, heures dispo, minutes Hot / Warm / Cold. Charge vs capacité, taux d’utilisation.",
  },
  {
    href: "/outils/estimateur-temps-chiffrage-devis",
    eyebrow: "Pilotage",
    title: "Estimateur de temps de chiffrage devis",
    text: "Minutes Hot / Warm / Cold, qualification et revisions / versions. Charge vs capacité des personnes qui chiffrent.",
  },
  {
    href: "/outils/simulateur-impact-remise-devis",
    eyebrow: "Pilotage",
    title: "Simulateur d’impact remise devis",
    text: "CA HT, coût, remise %, volume annuel. Marge avant/après, perte unitaire, impact annuel, option taux d’acceptation.",
  },
  {
    href: "/outils/simulateur-roi-logiciel-devis",
    eyebrow: "Pilotage",
    title: "Simulateur ROI logiciel de devis",
    text: "Demandes, temps de chiffrage, coût horaire, taux, panier, abonnement. Gain temps, marge, ROI net/mois et délai de retour.",
  },
  {
    href: "/outils/simulateur-taux-acceptation-devis",
    eyebrow: "Pilotage",
    title: "Simulateur de taux d’acceptation de devis",
    text: "Devis envoyés, taux actuel et cible, panier, délai. Acceptés en plus, CA, marge, coût d’attente (valeur coincée × délai).",
  },
  {
    href: "/outils/estimateur-cout-brief-incomplet",
    eyebrow: "Pilotage",
    title: "Estimateur du coût d’un brief devis incomplet",
    text: "Demandes, % de briefs incomplets, minutes perdues, coût horaire. Heures, coût temps, CA potentiel perdu si des dossiers meurent.",
  },
  {
    href: "/outils/simulateur-cout-devis-expires",
    eyebrow: "Pilotage",
    title: "Simulateur du coût des devis expirés",
    text: "Devis ouverts, % qui expirent, panier, heures, re-chiffrage. CA potentiel, coûts de reprise, gain si relance avant expiration.",
  },
  {
    href: "/outils/calculateur-acompte-devis",
    eyebrow: "Pilotage",
    title: "Calculateur d’acompte et d’échéances devis",
    text: "HT, TVA, % ou montant fixe, 1 à 4 jalons. Acompte TTC, reste dû, répartition indicative et délai de démarrage.",
  },
  {
    href: "/outils/estimateur-gain-temps-catalogue-devis",
    eyebrow: "Pilotage",
    title: "Estimateur gain de temps catalogue / kits",
    text: "Devis par mois, minutes manuelles, part bibliothèque, minutes gagnées, taux horaire. Heures et euros par mois et par an.",
  },
  {
    href: "/outils/calculateur-seuil-remise-marge",
    eyebrow: "Pilotage",
    title: "Calculateur seuil de remise et plancher de marge",
    text: "Prix catalogue HT, coût ou marge actuelle, plancher cible, TVA. Remise max, prix plancher HT/TTC, alerte OK/KO.",
  },
  {
    href: "/outils/generateur-url-prefill-devis",
    eyebrow: "Intégration",
    title: "Générateur d’URL de préremplissage devis",
    text: "URL de funnel avec ?besoin=, ?add= et ?product=, query seule et shortcode WordPress. Assemblage 100 % local.",
  },
  {
    href: "/outils/estimateur-leads-formulaire-vs-funnel-wp",
    eyebrow: "Intégration",
    title: "Estimateur leads formulaire vs funnel WordPress",
    text: "Demandes / mois, % exploitables, ressaisie, réponse sous 24 h. Heures perdues, demandes mortes, coût d’opportunité, score de maturité. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-cout-devis-pdf-seuls",
    eyebrow: "Pilotage",
    title: "Estimateur coût des devis PDF seuls",
    text: "Devis PDF / mois, % jamais ouverts, versions foireuses, ressaisie, taux horaire, panier, conv. PDF vs lien. Heures, friction, fantômes, deals, opportunités. Calcul 100 % local.",
  },
  {
    href: "/outils/checklist-mentions-devis-france",
    eyebrow: "Pilotage",
    title: "Checklist mentions devis France (B2B)",
    text: "Identité, SIRET, TVA, prix, validité, acomptes, CGV, process d’envoi. Score de complétion et récap des manques. Calcul 100 % local, pas une validation juridique.",
  },
  {
    href: "/outils/estimateur-cout-aller-retours-brief-photos",
    eyebrow: "Pilotage",
    title: "Estimateur coût des allers-retours brief sans photos",
    text: "Demandes / mois, % sans photo ni plan, minutes perdues, déplacements inutiles, coût trajet, taux, panier, écart de conversion. Heures, friction, trajets, opportunités. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-cout-emails-clarification-devis",
    eyebrow: "Pilotage",
    title: "Estimateur coût des e-mails de clarification devis",
    text: "Devis / mois, % clarification mail, mails moyens, minutes, taux horaire, % deals perdus, panier. Heures, coût temps, opportunités. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-cout-devis-sans-validation",
    eyebrow: "Pilotage",
    title: "Estimateur coût des devis envoyés sans validation interne",
    text: "Devis / mois, % sans relecture, corrections, remises, panier, taux horaire, écart de conversion. Devis à risque, heures, friction, coût marge, opportunités. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-cout-relances-aveugles-devis",
    eyebrow: "Pilotage",
    title: "Estimateur coût des relances à l’aveugle sur devis",
    text: "Devis / mois, part relancée sans signal utile, relances aveugles, minutes, taux horaire, timing nuisible, panier, écart de conversion. Heures, coût temps, opportunités, impact timing. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-cout-attente-multi-decideurs-devis",
    eyebrow: "Pilotage",
    title: "Estimateur coût d’attente multi-décideurs sur devis",
    text: "Devis / mois, % multi-décideurs, jours d’attente, minutes de relance, taux horaire, panier, % deals perdus ou retardés. Devis concernés, jours-homme, coût temps, opportunités. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-cout-visites-techniques-inutiles",
    eyebrow: "Pilotage",
    title: "Estimateur coût des visites techniques inutiles",
    text: "Devis / mois, % de visites, % inutiles, durée, taux horaire, déplacement, panier, % deals mal priorisés. Visites, heures, coût temps + déplacement, opportunités. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-cout-pipeline-fantome-devis",
    eyebrow: "Pilotage",
    title: "Estimateur coût du pipeline fantôme devis",
    text: "Dossiers ouverts, % sans maj de statut depuis 30 jours, minutes de suivi, taux horaire, panier, parts Perdu et Gagné non closés. Fantômes, heures, coût temps, opportunités. Calcul 100 % local.",
  },
  {
    href: "/outils/calculateur-tva-devis-ht-ttc",
    eyebrow: "Pilotage",
    title: "Calculateur TVA devis HT / TTC",
    text: "HT vers TTC ou l’inverse, taux 20 % 10 % 5,5 % 2,1 % 0 % ou perso, jusqu’à 3 lignes. Totaux HT, TVA ventilée, TTC. Calcul 100 % local, indicatif, pas un conseil fiscal.",
  },
  {
    href: "/outils/estimateur-cout-demandes-orales-non-capturees",
    eyebrow: "Pilotage",
    title: "Estimateur coût des demandes orales non capturées",
    text: "Demandes orales / mois (tél + WhatsApp + SMS), % non capturées, minutes, taux horaire, panier, % deals perdus. Heures, coût temps, opportunités. Le % funnel est indicatif. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-cout-double-saisie-devis",
    eyebrow: "Pilotage",
    title: "Estimateur coût de la double saisie devis",
    text: "Demandes / mois en double saisie, minutes, % d’infos déformées, % qui meurent ou repartent en clarification, taux horaire, panier. Heures, coût temps, dossiers déformés, opportunités. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-cout-handoff-commercial-technique-devis",
    eyebrow: "Pilotage",
    title: "Estimateur coût handoff commercial → technique",
    text: "Devis / mois concernés par un handoff, % de briefs incomplets, minutes, taux horaire, panier, % de devis retravaillés. Heures, coût temps, opportunités. Le % évitables est indicatif. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-cout-contexte-hors-dossier-devis",
    eyebrow: "Pilotage",
    title: "Estimateur coût du contexte hors dossier devis",
    text: "Dossiers / mois, % sans notes internes utiles, minutes de re-brief, % morts ou clarifs faute de contexte, taux horaire, panier. Dossiers fragiles, heures, coût temps, opportunités. Calcul 100 % local.",
  },
  {
    href: "/outils/estimateur-valeur-produits-suggeres-devis",
    eyebrow: "Pilotage",
    title: "Estimateur valeur des produits suggérés dans un devis",
    text: "Demandes via le funnel / mois, % de dossiers avec suggestion retenue aujourd'hui et visé, valeur moyenne ajoutée, taux de transformation, minutes gagnées, taux horaire. Écart de valeur, valeur gagnée, temps libéré. Calcul 100 % local, sur vos hypothèses.",
  },
  {
    href: "/outils/estimateur-requalification-chat-vs-formulaire-devis",
    eyebrow: "Pilotage",
    title: "Estimateur requalification chat vs formulaire",
    text: "Demandes de devis / mois, part qui arrive par le chat, % à requalifier selon le canal, minutes, taux horaire. Dossiers, heures, coût mensuel et écart attribuable au chat. Calcul 100 % local, sur vos hypothèses.",
  },
  {
    href: "/outils/estimateur-demandes-hors-budget-fourchette-devis",
    eyebrow: "Pilotage",
    title: "Estimateur des demandes hors budget",
    text: "Demandes de devis / mois, part qui s'arrête au prix, minutes, taux horaire, hypothèse de fourchette affichée plus tôt. Heures, coût, temps récupérable, aperçu du total indicatif d'une ligne. Calcul 100 % local, sur vos hypothèses.",
  },
] as const;

export default function OutilsIndexPage() {
  return (
    <>
      <section className="px-6 pb-8 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outils</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Chiffrer le trou. Rédiger les touches.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-mk-muted sm:text-lg">
            {outilsHubIntro()}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="grid gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-2xl bg-white p-5 ring-1 ring-mk-border transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)] sm:p-6"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-accent">
                {tool.eyebrow}
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight">{tool.title}</h2>
              <p className="mt-2 text-[15px] leading-7 text-mk-muted">{tool.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <MarketingCta />
    </>
  );
}
