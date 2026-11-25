import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurConditionSuspensiveDevisCalculator } from "@/components/marketing/verificateur-condition-suspensive-devis-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-condition-suspensive-devis";
const H1 = "Vérificateur de condition suspensive dans un devis B2B";
const TITLE = "Vérificateur de condition suspensive dans un devis B2B";
const DESCRIPTION =
  "Votre client commande sous réserve de financement, d'un marché, d'une autorisation ou de l'accord de sa direction : vérifiez la condition point par point (articles 1304 à 1304-7 du code civil, réserve ajoutée à la signature, condition potestative, arrêt publié du 24 septembre 2026), où en est la commande, ce que devient l'acompte et le matériel déjà commandé. Clause de devis, courrier et récapitulatif à copier.";
const LEAD =
  "Votre client signe « bon pour accord sous réserve de financement », attend l'attribution d'un marché, une autorisation ou l'accord de sa direction, ou vous voulez vous-même réserver votre visite technique. Décrivez la condition, ce que vous avez encaissé et engagé, et où vous en êtes : l'outil contrôle dix points, dit où en est la commande, ce que devient l'acompte et quelle part des frais reste à votre risque, puis écrit la clause du devis et le courrier au client.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurConditionSuspensiveDevisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: H1,
    url: `${SITE_URL}${PATH}`,
    description: DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "fr-FR",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    publisher: { "@type": "Organization", name: "QuoteBuilder", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">Outil</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl">{H1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mk-muted sm:text-lg">{LEAD}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <VerificateurConditionSuspensiveDevisCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">
          {"Le résultat est indicatif, fondé sur vos réponses, et ne constitue pas un conseil juridique. Les ventes et travaux pour des consommateurs (crédit affecté), les promesses de vente immobilière, les marchés publics, la procédure collective du client et le droit étranger ne sont pas traités. Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/blog/condition-suspensive-commande-financement-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            condition suspensive dans un devis B2B
          </Link>
          {" · "}
          <Link href="/blog/annulation-commande-devis-b2b-arrhes-dedit-clause-penale" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            annulation de commande, arrhes et dédit
          </Link>
          {" · "}
          <Link href="/blog/acomptes-echeances-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            acomptes et échéances
          </Link>
          {" · "}
          <Link href="/blog/validite-expiration-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            validité d&apos;un devis
          </Link>
          {" · "}
          <Link href="/outils/calculateur-acompte-devis" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            calculateur d&apos;acompte
          </Link>
          {" · "}
          <Link href="/signup?plan=free" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            Créer un compte Free
          </Link>
          {" · "}
          <Link href="/c/demo/rayonnage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            démo rayonnage
          </Link>
          {" · "}
          <Link href="/tarifs" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            tarifs
          </Link>
          .
        </p>
        <p className="mt-4 text-[13px] leading-5 text-mk-faint">Calcul local, aucune donnée envoyée.</p>
      </section>
    </>
  );
}
