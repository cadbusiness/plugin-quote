import type { Metadata } from "next";
import Link from "next/link";
import { ChecklistMentionsDevis } from "@/components/marketing/checklist-mentions-devis";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Checklist mentions obligatoires devis France (B2B)",
  description:
    "Checklist interactive des mentions et blocs utiles sur un devis B2B en France : identité, SIRET, TVA, prix, validité, acomptes, CGV. Score local, pas une validation juridique.",
  path: "/outils/checklist-mentions-devis-france",
});

const FAQ = [
  {
    q: "Les données quittent-elles le navigateur ?",
    a: "Non. Les cases cochées et le récap restent dans votre navigateur. Rien n’est envoyé à QuoteBuilder.",
  },
  {
    q: "Ce score valide-t-il la conformité du devis ?",
    a: "Non. C’est un outil pédagogique : un pourcentage d’items cochés, pas un audit juridique. Les obligations varient (B2B, B2C, artisan, marchés publics, secteur réglementé).",
  },
  {
    q: "Que faire du récap des manques ?",
    a: "Copiez-le pour une revue d’équipe, puis corrigez le template une fois. Ne comblez pas les trous devis par devis à la main.",
  },
  {
    q: "Par quels blocs commencer ?",
    a: "Identité, SIRET, TVA, description, prix HT/TTC, validité et CGV. Faites relire les libellés sensibles par un avocat ou un expert-comptable.",
  },
];

export default function ChecklistMentionsDevisFrancePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Checklist mentions obligatoires devis France (B2B)",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description:
      "Checklist interactive des mentions et blocs utiles sur un devis B2B en France (identité, SIRET, TVA, prix, validité, acomptes, CGV). Outil pédagogique, pas une validation juridique.",
    inLanguage: "fr-FR",
    url: `${SITE_URL}/outils/checklist-mentions-devis-france`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">
            Checklist mentions devis France (B2B)
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">
            Cochez les blocs présents sur votre modèle de devis. L’outil calcule un score de complétion et
            prépare un récap des manques à copier pour votre équipe. Tout reste dans votre navigateur.{" "}
            <Link
              href="/blog/mentions-obligatoires-devis-france"
              className="font-medium text-mk-accent underline-offset-2 hover:underline"
            >
              Mentions obligatoires sur un devis en France
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-4">
        <p className="mx-auto max-w-3xl rounded-2xl border border-dashed border-mk-border bg-white px-4 py-3 text-sm leading-6 text-mk-muted">
          <strong className="font-semibold text-mk-ink">Outil pédagogique uniquement.</strong> Ce n’est pas une
          validation juridique ni un audit de conformité. Les obligations varient (B2B / B2C, artisan, marchés
          publics, secteur réglementé). Faites relire vos libellés par un avocat et/ou un expert-comptable.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-4">
        <ChecklistMentionsDevis />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Comment le lire</h2>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Le score est le pourcentage d’items cochés, arrondi. Sous 50 %, le template est incomplet. Entre 50 et
          84 %, la base est là, avec encore des trous (validité, acomptes, CGV, acceptation). De 85 à 99 %, il
          reste quelques blocs. À 100 %, la checklist est complète : ce n’est toujours pas une validation juridique.
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link
            href="/blog/mentions-obligatoires-devis-france"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            article mentions obligatoires
          </Link>
          {" · "}
          <Link
            href="/blog/validite-expiration-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            validité
          </Link>
          {" · "}
          <Link
            href="/blog/acomptes-echeances-devis-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            acomptes
          </Link>
          {" · "}
          <Link
            href="/blog/signature-acceptation-devis-en-ligne-b2b"
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            signature
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo rayonnage
          </Link>
          .
        </p>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Figez les mentions dans le template."
        text="Identité, TVA, validité et CGV une fois pour toutes. Free sans carte. Ce n’est pas un conseil juridique."
      />
    </>
  );
}
