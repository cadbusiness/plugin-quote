import type { Metadata } from "next";
import { AutopilotStage } from "@/components/marketing/autopilot-stage";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SystemCinema } from "@/components/marketing/system-cinema";

export const metadata: Metadata = {
  title: "Comment ça marche · QuoteBuilder",
  description:
    "Offre, funnel, dossier, autopilote. La chaîne QuoteBuilder en démo produit.",
};

export default function CommentCaMarchePage() {
  return (
    <>
      <section className="px-6 pb-4 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Démo produit</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Comment ça marche.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#1A1510]/70 sm:text-lg">
            La même chaîne que dans le logiciel. En quelques secondes.
          </p>
        </div>
      </section>

      <section className="px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <SystemCinema />
        </div>
      </section>

      <section className="bg-[#1A1510] px-6 py-14 text-[#F6F0E8] sm:py-20">
        <div className="mx-auto max-w-6xl">
          <AutopilotStage />
        </div>
      </section>

      <div className="pt-10">
        <MarketingCta title="À vous de jouer." text="Compte gratuit. 10 devis. Pas de carte." />
      </div>
    </>
  );
}
