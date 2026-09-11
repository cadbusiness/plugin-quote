import type { Metadata } from "next";
import Link from "next/link";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Outils devis B2B",
  description:
    "Calculateur de CA perdu sans relance, générateur de séquence e-mails T+0 à T+30 j. Outils gratuits QuoteBuilder.",
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
] as const;

export default function OutilsIndexPage() {
  return (
    <>
      <section className="px-6 pb-8 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#C45C26]">Outils</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Chiffrer le trou. Rédiger les touches.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#1A1510]/70 sm:text-lg">
            Deux outils publics. Le logiciel, ensuite, envoie vraiment les e-mails.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="grid gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-[22px] bg-white p-5 ring-1 ring-black/6 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)] sm:p-6"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C45C26]">
                {tool.eyebrow}
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight">{tool.title}</h2>
              <p className="mt-2 text-[15px] leading-7 text-[#1A1510]/65">{tool.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <MarketingCta />
    </>
  );
}
