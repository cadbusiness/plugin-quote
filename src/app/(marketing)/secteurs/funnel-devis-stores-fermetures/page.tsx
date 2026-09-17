import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis stores et fermetures : dimensions, motorisation, pose",
  description:
    "Landing SEO stores / fermetures (stores intérieurs/extérieurs, volets, portes de garage, BSO) : funnel de devis, brief chiffrable, score, assignation et relances.",
  path: "/secteurs/funnel-devis-stores-fermetures",
});

const FAQ = [
  {
    q: "Faut-il toujours un métrage avant devis ?",
    a: "Pas toujours pour une estimation. Oui souvent avant commande fabricant et pose. Le funnel doit distinguer « prix indicatif » et « devis ferme après cotes ».",
  },
  {
    q: "Comment gérer les photos WhatsApp ?",
    a: "Autorisez WhatsApp pour recevoir les photos, mais créez tout de suite un dossier et uploadez-y les images. Sinon le fil disparaît.",
  },
  {
    q: "Que mettre en premier dans le funnel : produit ou dimensions ?",
    a: "Famille produit d’abord (pour brancher les bonnes questions), puis dimensions et motorisation. Inverser crée des champs inutiles.",
  },
  {
    q: "Comment scorer une demande « urgent avant travaux façade » ?",
    a: "Souvent Hot : date contrainte forte. Vérifiez décideur et budget. SLA court, owner nommé.",
  },
  {
    q: "Les remises saisonnières sont-elles compatibles avec un funnel ?",
    a: "Oui, si la remise est une règle catalogue ou une version tracée, pas un prix oral perdu. Utilisez le simulateur d’impact remise.",
  },
  {
    q: "Peut-on un seul funnel pour stores, volets et portes de garage ?",
    a: "Oui, avec une première question « famille produit » et des branches. Un funnel monolithe sans branches redevient un formulaire flou.",
  },
  {
    q: "Comment traiter les devis copropriété ?",
    a: "Champ « type de client = copro / syndic », circuit de validation, délai AG. Espace prospect unique pour faire circuler la bonne version.",
  },
  {
    q: "Le funnel remplace-t-il le commercial ?",
    a: "Non. Il prépare le brief pour que le commercial et le poseur ne perdent pas leur temps sur des incomplets.",
  },
];

export default function StoresFermeturesLandingPage() {
  const body = loadPostBody("funnel-devis-stores-fermetures");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis stores et fermetures : dimensions, motorisation, pose",
    url: `${SITE_URL}/secteurs/funnel-devis-stores-fermetures`,
    about: "Stores, fermetures, volets, portes de garage, BSO, devis pose et motorisation",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Stores et fermetures
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis stores et fermetures : dimensions, motorisation, pose
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Typologie, cotes, motorisation, accès pose. Un brief chiffrable, un score, un owner, puis
            des relances qui tiennent la saison.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover"
            >
              Créer ce funnel
            </Link>
            <Link
              href="/secteurs"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-mk-ink ring-1 ring-mk-border"
            >
              Tous les secteurs
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-6">
        <Markdown source={body} />
      </section>

      <section className="border-y border-mk-border bg-mk-band px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">La chaîne, sur ce métier</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Branches banne, volet, BSO, porte garage." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Toiles, lames, motorisation + Si/Alors." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Score, SLA saison, assignation." },
              { href: "/fonctionnalites/autopilote", t: "Autopilote", d: "Confirm, métrage, relances." },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl bg-white p-4 ring-1 ring-mk-border hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)]"
              >
                <p className="font-semibold">{item.t}</p>
                <p className="mt-1 text-sm text-mk-muted">{item.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFaq items={FAQ} />
      <MarketingCta
        title="Essayer le template stores"
        text="Un parcours dimensions, motorisation, pose. Le plan Free suffit pour voir l’interface, sans carte."
      />
    </>
  );
}
