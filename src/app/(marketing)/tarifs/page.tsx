import type { Metadata } from "next";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { FAQ } from "@/lib/marketing/content";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Tarifs",
  description:
    "Annuel : Starter 39 €/mois, Pro 79 €/mois, Agency 159 €/mois (2 mois offerts). Mensuel 49 / 99 / 199 €. Free sans carte.",
  path: "/tarifs",
});

export default function TarifsPage() {
  return (
    <>
      <section className="px-6 pb-4 pt-10 sm:pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Tarifs</p>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-[2.35rem] sm:leading-tight">
            Des plans clairs.
            <span className="block text-mk-faint">Free en option, en bas.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-6 text-mk-muted">
            Starter, Pro, Agency. Comparez. Le gratuit reste dispo sans prendre toute la page.
          </p>
        </div>
      </section>

      <section className="px-6 pb-12 sm:pb-16">
        <PricingPlans />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-10 sm:pb-14">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">FAQ</h2>
        <div className="mt-6 divide-y divide-mk-border border-y border-mk-border">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-3.5">
              <summary className="cursor-pointer list-none text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span className="mt-0.5 text-mk-faint group-open:hidden">+</span>
                  <span className="mt-0.5 hidden text-mk-faint group-open:inline">–</span>
                </span>
              </summary>
              <p className="mt-2.5 text-[14px] leading-6 text-mk-muted">{item.a}</p>
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
