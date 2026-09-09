import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { AGENCY_PLAN, FAQ } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Tarifs · QuoteBuilder",
  description: "Starter 49 €, Pro 99 €. Essai 14 jours sans carte. Annuel avec 2 mois offerts.",
};

export default function TarifsPage() {
  return (
    <>
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Tarifs</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Deux plans. Clair.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#1A1510]/70 sm:text-lg">
            Starter pour démarrer. Pro pour scaler l’équipe. Essai 14 jours sans carte, en dessous.
          </p>
        </div>
      </section>

      <section className="px-6 pb-12 sm:pb-16">
        <PricingPlans />
      </section>

      <section className="border-y border-[#1A1510]/8 bg-white/50 px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#1A1510]">Agence ou multi-marques ?</p>
            <p className="mt-1 text-sm text-[#1A1510]/55">{AGENCY_PLAN.blurb}</p>
          </div>
          <Link
            href={AGENCY_PLAN.href}
            className="shrink-0 text-sm font-semibold text-[#1A1510] underline-offset-4 hover:text-[#E85D04] hover:underline"
          >
            Nous contacter →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">FAQ</h2>
        <div className="mt-8 divide-y divide-[#1A1510]/10 border-y border-[#1A1510]/10">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none text-base font-semibold sm:text-lg [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span className="mt-1 text-[#1A1510]/35 group-open:hidden">+</span>
                  <span className="mt-1 hidden text-[#1A1510]/35 group-open:inline">–</span>
                </span>
              </summary>
              <p className="mt-3 text-[16px] leading-7 text-[#1A1510]/70">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <MarketingCta
        title="Choisissez votre rythme."
        text="Essai 14 jours sans carte. Puis Starter ou Pro, mensuel ou annuel."
      />
    </>
  );
}
