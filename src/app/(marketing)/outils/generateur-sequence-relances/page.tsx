import type { Metadata } from "next";
import Link from "next/link";
import { FollowupSequenceGenerator } from "@/components/marketing/followup-sequence-generator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Générateur de séquence de relances devis",
  description:
    "Générez une séquence e-mails T+0, T+4 h, T+24 h, T+3 j, T+7 j, T+30 j. Copiez sujets et corps. Ton direct ou chaleureux.",
  path: "/outils/generateur-sequence-relances",
});

const FAQ = [
  {
    q: "Puis-je coller ça dans Gmail ?",
    a: "Oui, comme brouillons. Dans QuoteBuilder, le même calendrier devient un parcours : waits, branches, exécutions. Le générateur donne le texte. L’autopilote l’envoie.",
  },
  {
    q: "Pourquoi un e-mail interne à T+4 h ?",
    a: "La relance qui manque le plus est souvent celle du commercial qui n’a pas ouvert la fiche. Le prospect n’a pas à payer l’oubli interne.",
  },
  {
    q: "Cinq messages, ce n’est pas trop ?",
    a: "Cinq touches différentes, dont une interne. Le J+30 est un oui / non, pas une relance creuse. Voir l’article sur les devis qui meurent sans suivi.",
  },
];

export default function SequencePage() {
  return (
    <>
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#C45C26]">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Séquence de relances, prête à copier.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#1A1510]/70 sm:text-lg">
            T+0 confirmation, T+4 h rappel équipe, puis le fil prospect jusqu’à J+30. Adaptez le
            nom, le projet, le secteur.{" "}
            <Link href="/fonctionnalites/autopilote" className="font-medium text-[#E85D04] underline-offset-2 hover:underline">
              Voir l’autopilote
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-8">
        <FollowupSequenceGenerator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Ensuite</h2>
        <p className="mt-4 text-[16px] leading-7 text-[#1A1510]/75">
          Un texte sans dossier reste mou. Le{" "}
          <Link href="/blog/formulaire-contact-vs-funnel-devis-b2b" className="font-medium text-[#E85D04] underline-offset-2 hover:underline">
            funnel
          </Link>{" "}
          fournit le brief que ces e-mails citent. Le{" "}
          <Link href="/outils/cout-devis-non-relance" className="font-medium text-[#E85D04] underline-offset-2 hover:underline">
            calculateur
          </Link>{" "}
          dit si l’effort vaut le CA. Les sources et le raisonnement sont dans{" "}
          <Link href="/blog/pourquoi-les-devis-meurent-sans-relance" className="font-medium text-[#E85D04] underline-offset-2 hover:underline">
            l’article relances
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta title="Passez la séquence en actif." text="Canvas, waits, branches. Free pour voir l’interface." />
    </>
  );
}
