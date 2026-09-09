import type { Metadata } from "next";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { FAQ } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Tarifs · QuoteBuilder",
  description:
    "Comparez Free, Starter, Pro et Agency. Matrice complète, mensuel ou annuel, inscription directe.",
};

export default function TarifsPage() {
  return (
    <>
      <section className="px-6 pb-6 pt-10 sm:pb-8 sm:pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C45C26]">
            Tarifs
          </p>
          <h1 className="mt-2 text-[1.65rem] font-semibold tracking-tight sm:text-[2.2rem] sm:leading-tight">
            Starter, Pro, Agency.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-6 text-[#1A1510]/55">
            Comparez les plans payants. Free reste disponible en dessous, sans carte.
          </p>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 sm:pb-20">
        <PricingPlans />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-10 sm:pb-14">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">FAQ</h2>
        <div className="mt-6 divide-y divide-[#1A1510]/10 border-y border-[#1A1510]/10">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-3.5">
              <summary className="cursor-pointer list-none text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span className="mt-0.5 text-[#1A1510]/30 group-open:hidden">+</span>
                  <span className="mt-0.5 hidden text-[#1A1510]/30 group-open:inline">–</span>
                </span>
              </summary>
              <p className="mt-2.5 text-[14px] leading-6 text-[#1A1510]/65">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <MarketingCta
        title="Commencez free. Upgrade quand c’est le moment."
        text="Sans carte. Starter, Pro ou Agency en un clic."
      />
    </>
  );
}
