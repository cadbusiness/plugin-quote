import type { Metadata } from "next";
import Link from "next/link";
import { VerificateurDevoirConseilClientProfessionnelCalculator } from "@/components/marketing/verificateur-devoir-conseil-client-professionnel-calculator";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

const PATH = "/outils/verificateur-devoir-conseil-client-professionnel";
const H1 = "Vérificateur de devoir de conseil envers un client professionnel";
const TITLE = "Vérificateur de devoir de conseil envers un client professionnel";
const DESCRIPTION = "Vous vendez, installez ou fabriquez pour une entreprise : vérifiez si vous lui devez un conseil sur l'adaptation du matériel à son usage (compétence du client, arrêts de 2010, 2014, 2017, 2020 et 2026), si le besoin, les limites d'emploi, les préalables et les mises en garde sont écrits, et si vous pourrez le prouver. Mention de devis, courrier et récapitulatif à copier. Calcul local.";
const LEAD = "Vous vendez, installez ou fabriquez du matériel pour une entreprise, et vous voulez savoir si vous lui devez un conseil sur l'adaptation de ce matériel à son usage, ou le client vous reproche déjà un matériel inadapté. Décrivez le contrat, ce que le client sait faire, comment il a exprimé son besoin et ce que votre devis en dit. L'outil dit si le devoir de conseil joue, qui doit prouver quoi, contrôle dix points, chiffre la part d'une remise à niveau qui reste discutable, et vous donne la mention à écrire dans le devis et le courrier au client.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function VerificateurDevoirConseilClientProfessionnelPage() {
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
        <VerificateurDevoirConseilClientProfessionnelCalculator />
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <p className="text-[16px] leading-7 text-mk-muted">
          {"Le résultat est indicatif, fondé sur vos réponses, et ne constitue pas un conseil juridique. Les ventes aux consommateurs, les marchés publics, les garanties légales (vices cachés, décennale), les obligations propres aux machines et aux produits réglementés, le droit étranger et la procédure collective du client ne sont pas traités. Valeurs par défaut : hypothèses d'exemple, pas un dossier réel."}
        </p>
        <p className="mt-4 text-[16px] leading-7 text-mk-muted">
          Ensuite :{" "}
          <Link href="/blog/devoir-conseil-information-client-professionnel-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            devoir de conseil envers un client professionnel
          </Link>
          {" · "}
          <Link href="/blog/qualifier-demande-devis-avant-chiffrage" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            qualifier une demande avant de chiffrer
          </Link>
          {" · "}
          <Link href="/blog/visite-technique-avant-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            visite technique avant devis
          </Link>
          {" · "}
          <Link href="/blog/clause-limitation-responsabilite-devis-b2b" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            clause limitative de responsabilité
          </Link>
          {" · "}
          <Link href="/outils/verificateur-clause-limitation-responsabilite" className="font-medium text-mk-accent underline-offset-2 hover:underline">
            vérificateur de clause limitative
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
