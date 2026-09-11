import type { Metadata } from "next";
import Link from "next/link";
import { LostQuoteCalculator } from "@/components/marketing/lost-quote-calculator";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur : coût d’un devis non relancé",
  description:
    "Estimez le CA annuel perdu entre votre taux de closing actuel et un taux cible avec relances. Devis / mois, panier, deux taux.",
  path: "/outils/cout-devis-non-relance",
});

const FAQ = [
  {
    q: "Le calcul est-il une prévision de CA ?",
    a: "Non. C’est un écart arithmétique : volume × panier × (taux cible − taux actuel). Il rend visible un trou. Il ne promet pas que l’autopilote atteindra le taux cible tout seul.",
  },
  {
    q: "Quel taux cible viser ?",
    a: "Un écart de 8 à 12 points est déjà ambitieux si vous n’envoyez aujourd’hui qu’une relance. Les études (Invesp, Belkins) parlent de cinq touches utiles, pas d’un miracle de conversion.",
  },
  {
    q: "Faut-il compter les abandons de funnel ?",
    a: "Si vous avez l’e-mail, oui : ce sont des devis presque nés. Ajoutez-les au volume mensuel, avec un taux plus bas que les dossiers soumis.",
  },
];

export default function CoutDevisPage() {
  return (
    <>
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#C45C26]">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Coût d’un devis non relancé.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#1A1510]/70 sm:text-lg">
            80 % des ventes demandent cinq relances. La plupart des équipes s’arrêtent à une. Cet
            écart a un prix.{" "}
            <Link href="/blog/pourquoi-les-devis-meurent-sans-relance" className="font-medium text-[#E85D04] underline-offset-2 hover:underline">
              Lire l’article
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <LostQuoteCalculator />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-[#1A1510]/75">
          Le taux actuel est votre closing réel sur les devis envoyés — pas le taux de leads du
          site. Le taux cible est ce que vous jugez tenable si confirmation, rappel interne et
          relances partent vraiment. L’outil ne simule pas la saisonnalité ni le mix produit.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-[#1A1510]/75">
          Ensuite, il faut des dossiers, pas des messages. Un{" "}
          <Link href="/blog/formulaire-contact-vs-funnel-devis-b2b" className="font-medium text-[#E85D04] underline-offset-2 hover:underline">
            funnel
          </Link>{" "}
          et une{" "}
          <Link href="/outils/generateur-sequence-relances" className="font-medium text-[#E85D04] underline-offset-2 hover:underline">
            séquence
          </Link>{" "}
          tiennent l’écart. L’
          <Link href="/fonctionnalites/autopilote" className="font-medium text-[#E85D04] underline-offset-2 hover:underline">
            autopilote
          </Link>{" "}
          l’exécute.
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta title="Bouchez le trou." text="Dossier à l’entrée. Relances ensuite. Free sans carte." />
    </>
  );
}
