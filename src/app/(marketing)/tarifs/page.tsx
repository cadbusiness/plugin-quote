import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { FAQ, PLANS } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Tarifs · QuoteBuilder",
  description: "Free, Starter, Pro, Agency. Simple, sans surprise.",
};

export default function TarifsPage() {
  return (
    <>
      <section className="px-6 pb-8 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Tarifs</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Simple. Sans surprise.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#1A1510]/70 sm:text-lg">
            10 premiers devis toujours gratuits. Pas de carte bancaire pour démarrer.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col rounded-2xl p-6 ${
                plan.featured ? "bg-[#1A1510] text-white shadow-xl" : "bg-white ring-1 ring-black/8"
              }`}
            >
              <p className="text-sm font-medium">{plan.name}</p>
              {plan.featured ? <p className="mt-1 text-xs text-[#F3B184]">Le plus choisi</p> : null}
              <p className="mt-4 text-3xl font-semibold tracking-tight">
                {plan.price}
                {plan.period ? (
                  <span
                    className={`text-sm font-normal ${plan.featured ? "text-white/55" : "text-[#1A1510]/45"}`}
                  >
                    {plan.period}
                  </span>
                ) : null}
              </p>
              <ul
                className={`mt-6 space-y-2.5 text-sm ${plan.featured ? "text-white/75" : "text-[#1A1510]/70"}`}
              >
                <li>{plan.quotes}</li>
                <li>{plan.modes}</li>
                <li>CRM {plan.crm}</li>
                <li>{plan.team}</li>
                <li>{plan.whiteLabel ? "White-label inclus" : "White-label : non"}</li>
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 rounded-full px-4 py-2.5 text-center text-sm font-semibold ${
                  plan.featured
                    ? "bg-[#E85D04] text-white hover:bg-[#d35400]"
                    : "bg-[#F6F0E8] text-[#1A1510] hover:bg-[#EFE6DA]"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
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

      <MarketingCta />
    </>
  );
}
