"use client";

import Link from "next/link";
import { useState } from "react";
import { FREE_TRIAL, PUBLIC_PLANS } from "@/lib/marketing/content";

type Billing = "monthly" | "annual";

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <div>
      <div className="flex justify-center">
        <div
          className="inline-flex rounded-full bg-white p-1 ring-1 ring-black/8"
          role="group"
          aria-label="Facturation"
        >
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              billing === "monthly"
                ? "bg-[#1A1510] text-white"
                : "text-[#1A1510]/60 hover:text-[#1A1510]"
            }`}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              billing === "annual"
                ? "bg-[#1A1510] text-white"
                : "text-[#1A1510]/60 hover:text-[#1A1510]"
            }`}
          >
            Annuel
            <span
              className={`ml-1.5 text-[11px] font-medium ${
                billing === "annual" ? "text-[#F3B184]" : "text-[#E85D04]"
              }`}
            >
              -2 mois
            </span>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
        {PUBLIC_PLANS.map((plan) => {
          const price = billing === "monthly" ? plan.monthlyPrice : plan.annualMonthly;
          const featured = plan.featured;

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-[28px] p-7 sm:p-8 ${
                featured
                  ? "bg-[#1A1510] text-white shadow-[0_30px_80px_-36px_rgba(26,21,16,0.75)] ring-1 ring-[#E85D04]/40"
                  : "bg-white ring-1 ring-black/8"
              }`}
            >
              {plan.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E85D04] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  {plan.badge}
                </span>
              ) : null}

              <div>
                <p className="text-sm font-semibold">{plan.name}</p>
                <p className={`mt-1 text-xs leading-5 ${featured ? "text-white/55" : "text-[#1A1510]/50"}`}>
                  {plan.audience}
                </p>
              </div>

              <div className="mt-6">
                <p className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight sm:text-5xl">{price}&nbsp;€</span>
                  <span className={`text-sm font-medium ${featured ? "text-white/50" : "text-[#1A1510]/45"}`}>
                    /mois
                  </span>
                </p>
                {billing === "annual" ? (
                  <p className={`mt-2 text-xs ${featured ? "text-white/45" : "text-[#1A1510]/45"}`}>
                    {plan.annualTotal}&nbsp;€ facturés / an · 2 mois offerts
                  </p>
                ) : (
                  <p className={`mt-2 text-xs ${featured ? "text-white/45" : "text-[#1A1510]/45"}`}>
                    ou {plan.annualMonthly}&nbsp;€/mois en annuel
                  </p>
                )}
              </div>

              <ul
                className={`mt-7 flex-1 space-y-2.5 text-sm leading-6 ${
                  featured ? "text-white/75" : "text-[#1A1510]/70"
                }`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span
                      className={`mt-0.5 shrink-0 ${featured ? "text-[#F3B184]" : "text-[#E85D04]"}`}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`${plan.href}&billing=${billing}`}
                className={`mt-8 rounded-full px-5 py-3 text-center text-sm font-semibold transition ${
                  featured
                    ? "bg-[#E85D04] text-white hover:bg-[#d35400]"
                    : "bg-[#1A1510] text-white hover:bg-[#E85D04]"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-10 max-w-xl text-center">
        <Link
          href={FREE_TRIAL.href}
          className="text-sm font-medium text-[#1A1510]/55 underline-offset-4 hover:text-[#1A1510] hover:underline"
        >
          {FREE_TRIAL.label}
        </Link>
        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#1A1510]/40">{FREE_TRIAL.hint}</p>
      </div>
    </div>
  );
}
