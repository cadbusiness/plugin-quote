import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Outils devis B2B",
  description:
    "Calculateur de CA perdu sans relance, générateur de séquence, score de brief, simulateur de conversion, capacité équipe, temps de chiffrage, impact remise, seuil de remise et plancher de marge, ROI logiciel, taux d’acceptation, coût d’un brief incomplet, coût des devis expirés, calculateur d’acompte, gain de temps catalogue, générateur d’URL de préremplissage. Outils gratuits QuoteBuilder.",
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
            Quinze outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.
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
