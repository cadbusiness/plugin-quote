import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/marketing/agentic/motion";
import { FitChecklist, VerticalFocus } from "@/components/marketing/agentic/vertical-focus";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Secteurs",
  description:
    "Rayonnage et stockage, mezzanines, manutention, mobilier pro, équipement d’atelier, emballage. Agents de devis pour les vendeurs d’équipement professionnel.",
  path: "/secteurs",
});

/** Every sector landing stays linked from the hub (SEO), core market first. */
const ALL_TEMPLATES = [
  { href: "/secteurs/funnel-devis-rayonnage-stockage", label: "Rayonnage et stockage" },
  { href: "/secteurs/funnel-devis-agencement-bureau", label: "Agencement de bureau" },
  { href: "/secteurs/funnel-devis-emballage-conditionnement", label: "Emballage et conditionnement" },
  { href: "/secteurs/funnel-devis-menuiserie-sur-mesure", label: "Menuiserie sur mesure" },
  { href: "/secteurs/funnel-devis-location-evenementiel", label: "Location événementielle" },
  { href: "/secteurs/funnel-devis-traiteur-evenementiel", label: "Traiteur événementiel" },
  { href: "/secteurs/funnel-devis-stores-fermetures", label: "Stores et fermetures" },
  { href: "/secteurs/funnel-devis-cuisine-equipee", label: "Cuisine équipée" },
  { href: "/secteurs/funnel-devis-pompe-chaleur-chauffage", label: "Pompe à chaleur et chauffage" },
  { href: "/secteurs/funnel-devis-photovoltaique-solaire", label: "Photovoltaïque et solaire" },
  { href: "/secteurs/funnel-devis-imprimerie-signaletique", label: "Imprimerie et signalétique" },
  { href: "/secteurs/funnel-devis-laboratoire-faconnage-cosmetique", label: "Laboratoire et façonnage" },
  { href: "/secteurs/funnel-devis-formation-professionnelle", label: "Formation professionnelle" },
  { href: "/secteurs/funnel-devis-usinage-sous-traitance-pieces", label: "Usinage et sous-traitance" },
  { href: "/secteurs/funnel-devis-paysagiste-amenagement-jardin", label: "Paysagiste et aménagement de jardin" },
  { href: "/secteurs/funnel-devis-metallerie-serrurerie", label: "Métallerie et serrurerie" },
  { href: "/secteurs/funnel-devis-electricite-tertiaire", label: "Électricité tertiaire" },
  { href: "/secteurs/funnel-devis-plomberie-sanitaire", label: "Plomberie et sanitaire" },
  { href: "/secteurs/funnel-devis-couverture-toiture", label: "Couverture et toiture" },
  { href: "/secteurs/funnel-devis-isolation-thermique-ite", label: "Isolation thermique et ITE" },
  { href: "/secteurs/funnel-devis-pergola-terrasse", label: "Pergola et terrasse" },
  { href: "/secteurs/funnel-devis-cloture-portail", label: "Clôture et portail" },
];

export default function SecteursPage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-10 pt-12 sm:pt-16">
        <div aria-hidden className="marketing-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-mk-accent">Secteurs</p>
          <h1 className="mt-3 text-[1.95rem] font-semibold tracking-tight sm:text-5xl">
            Fait pour les vendeurs d’équipement pro.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-mk-muted sm:text-lg">
            Rayonnage, manutention, agencement. Des produits qui se configurent, des devis à
            plusieurs milliers d’euros, des acheteurs pros à relancer.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-20">
        <VerticalFocus />
        <Reveal className="mx-auto mt-14 max-w-3xl">
          <p className="mb-4 text-center text-sm font-semibold text-mk-ink">
            QuoteBuilder est fait pour vous si :
          </p>
          <FitChecklist />
        </Reveal>
      </section>

      <section className="border-y border-mk-border bg-mk-band px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-mk-ink">
              Tous les templates ({ALL_TEMPLATES.length})
              <span className="text-mk-faint transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-mk-muted">
              Le funnel fonctionne aussi hors équipement pro. Tous les templates restent disponibles.
            </p>
            <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {ALL_TEMPLATES.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-sm text-mk-muted hover:text-mk-ink hover:underline">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      <MarketingCta
        title="Vos devis d’équipement, en pilote automatique."
        text="Un agent pour le prospect. Un autopilote pour les relances. Free sans carte."
      />
    </>
  );
}
