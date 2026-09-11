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
          <p className="text-sm font-medium text-[#C45C26]">Secteurs</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Fait pour le sur-mesure.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#1A1510]/70 sm:text-lg">
            Une famille, quelques templates : questionnaire, catalogue ou brief. Prêts en moins d’une heure.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
        <LandingSectors />
        <div className="mx-auto mt-10 max-w-3xl">
          <Link
            href="/secteurs/funnel-devis-rayonnage-stockage"
            className="block rounded-[22px] bg-white p-5 ring-1 ring-black/6 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)] sm:p-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C45C26]">
              Landing secteur
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">
              Funnel de devis rayonnage & stockage
            </p>
            <p className="mt-2 text-[15px] leading-7 text-[#1A1510]/65">
              Charge, travées, surface, dossier, relances. Le template le plus détaillé pour
              l’instant.
            </p>
          </Link>
        </div>
      </section>

      <section className="border-y border-[#1A1510]/8 bg-white/60 px-6 py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-lg font-semibold tracking-tight">Votre secteur n’est pas listé ?</p>
            <p className="mt-1 text-sm text-[#1A1510]/60">
              Le funnel se construit sur votre catalogue. On part d’un template générique.
            </p>
          </div>
          <Link
            href="/signup"
            className="rounded-full bg-[#E85D04] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d35400]"
          >
            Créer mon funnel
          </Link>
        </div>
      </section>

      <MarketingCta />
    </>
  );
}
