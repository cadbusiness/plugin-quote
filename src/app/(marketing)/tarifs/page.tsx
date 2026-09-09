import type { Metadata } from "next";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { FAQ } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Tarifs · QuoteBuilder",
  description:
    "Starter 49 €, Pro 99 €, Agency 199 €. Free en option sans carte. Annuel avec 2 mois offerts.",
};

export default function TarifsPage() {
  return (
    <>
      <section className="px-6 pb-4 pt-10 sm:pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#C45C26]">Tarifs</p>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-[2.35rem] sm:leading-tight">
            Des plans clairs.
            <span className="block text-[#1A1510]/45">Free en option, en bas.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-6 text-[#1A1510]/60">
            Starter, Pro, Agency. Comparez. Le gratuit reste dispo sans prendre toute la page.
          </p>
        </div>
      </section>

      <section className="px-6 pb-12 sm:pb-16">
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
        title="Choisissez votre plan."
        text="Starter, Pro ou Agency. Free sans carte si vous voulez juste voir."
      />
    </>
  );
}
