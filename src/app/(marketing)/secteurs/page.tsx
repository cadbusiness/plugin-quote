import type { Metadata } from "next";
import Link from "next/link";
import { LandingSectors } from "@/components/marketing/landing-sectors";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Secteurs",
  description:
    "Familles de métiers et templates de parcours. Rayonnage, habitat, événementiel, industrie, services.",
  path: "/secteurs",
});

export default function SecteursPage() {
  return (
    <>
      <section className="px-6 pb-8 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-mk-accent">Secteurs</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Fait pour le sur-mesure.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-mk-muted sm:text-lg">
            Une famille, quelques templates : questionnaire, catalogue ou brief. Prêts en moins d’une heure.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
        <LandingSectors />
        <div className="mx-auto mt-10 grid max-w-3xl gap-4">
          <Link
            href="/secteurs/funnel-devis-rayonnage-stockage"
            className="block rounded-2xl bg-white p-5 ring-1 ring-mk-border transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)] sm:p-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-accent">
              Landing secteur
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">
              Funnel de devis rayonnage & stockage
            </p>
            <p className="mt-2 text-[15px] leading-7 text-mk-muted">
              Charge, travées, surface, dossier, relances. Template pour fabricants et revendeurs.
            </p>
          </Link>
          <Link
            href="/secteurs/funnel-devis-menuiserie-sur-mesure"
            className="block rounded-2xl bg-white p-5 ring-1 ring-mk-border transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)] sm:p-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-accent">
              Landing secteur
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">
              Funnel de devis menuiserie sur mesure
            </p>
            <p className="mt-2 text-[15px] leading-7 text-mk-muted">
              Fenêtres, portes, agencement. Cotes, matériaux, pose, brief chiffrable, score et
              relances.
            </p>
          </Link>
        </div>
      </section>

      <section className="border-y border-mk-border bg-mk-band px-6 py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-semibold tracking-tight">Votre secteur n’est pas listé ?</p>
            <p className="mt-1 text-sm text-mk-muted">
              Le funnel se construit sur votre catalogue. On part d’un template générique.
            </p>
          </div>
          <Link
            href="/signup"
            className="rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover"
          >
            Créer mon funnel
          </Link>
        </div>
      </section>

      <MarketingCta />
    </>
  );
}
