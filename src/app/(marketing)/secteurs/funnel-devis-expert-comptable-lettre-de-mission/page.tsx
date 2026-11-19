import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis pour expert-comptable : forme juridique, volume de pièces, paie et facturation électronique, une demande chiffrable avant le premier rendez-vous",
  description: "Landing SEO cabinets d'expertise comptable : les questions à poser avant de chiffrer une lettre de mission (forme juridique, régime fiscal et TVA, volume de pièces, salariés, date de clôture, reprise d'un confrère, facturation électronique), les règles du métier (lettre de mission écrite, honoraires convenus avant la mission, vigilance anti-blanchiment, reprise de dossier), et comment monter ce funnel dans QuoteBuilder à partir du template Conseil. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-expert-comptable-lettre-de-mission",
});

export const FAQ = [
  { q: "Existe-t-il un template expert-comptable dans QuoteBuilder ?", a: "Non. Il n'y a pas de template comptable. On part du template « Conseil » (famille « Tech & services »), dont la première étape pose un type de mission, un contexte et une échéance, et on renomme ses choix." },
  { q: "Quelles questions poser avant de chiffrer une mission comptable ?", a: "La situation (création, changement, première fois), la forme juridique, l'activité, le régime d'imposition et de TVA, le volume de factures, le nombre de bulletins de paie, la date de clôture, les missions attendues et l'échéance." },
  { q: "Un expert-comptable peut-il afficher ses prix en ligne ?", a: "Rien ne l'interdit. Les honoraires sont libres, mais ils doivent être convenus par écrit avec le client avant la mission (article 24 de l'ordonnance de 1945). Une fourchette affichée n'est pas le montant convenu : c'est la lettre de mission qui le fixe." },
  { q: "La lettre de mission est-elle obligatoire ?", a: "Oui. L'article 151 du décret n° 2012-432 impose un contrat écrit qui définit la mission et les droits et obligations de chacun. Il peut prendre la forme d'une lettre de mission." },
  { q: "Un expert-comptable peut-il être payé au résultat ?", a: "Pour une partie seulement. Depuis la loi PACTE, des honoraires complémentaires liés à un objectif sont possibles, mais pas pour la tenue et la révision des comptes, ni pour les missions qui déterminent l'assiette fiscale ou sociale du client." },
  { q: "Peut-on demander une pièce d'identité dans le formulaire de devis ?", a: "Mieux vaut ne pas le faire. L'identification du client est obligatoire avant d'entrer en relation d'affaires, mais elle se fait dans un outil prévu pour cela, après le premier échange. Le formulaire de devis ne collecte que ce qui sert à chiffrer." },
  { q: "Que faire quand le prospect quitte un autre expert-comptable ?", a: "Le cabinet qui reprend le dossier doit informer le confrère avant d'accepter la mission (article 163 du décret de 2012) et s'efforcer d'obtenir le paiement des honoraires qui lui restent dus. Posez la question dans le funnel pour l'anticiper." },
  { q: "Pourquoi toutes mes demandes sortent Cold ?", a: "La formule du score ne lit aucune réponse de ce questionnaire. Les valeurs de « Votre situation » ne sont pas dans la liste lue, et les questions ajoutées ont des clés automatiques. Toutes les demandes restent à 30 points." },
  { q: "Faut-il parler de facturation électronique dans le funnel ?", a: "Oui. Depuis le 1er septembre 2026, toute entreprise assujettie à la TVA doit pouvoir recevoir des factures électroniques. Une question sur l'état d'avancement vous dit si une mission est à proposer." },
  { q: "QuoteBuilder rédige-t-il la lettre de mission ?", a: "Non. QuoteBuilder recueille la demande, la qualifie avec vos questions et vos règles, et suit le dossier avec relances. La lettre de mission, la vigilance client et la facturation se font dans vos outils habituels." },
];

export default function FunnelDevisExpertComptableLettreDeMissionPage() {
  const body = loadPostBody("funnel-devis-expert-comptable-lettre-de-mission");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis pour expert-comptable : forme juridique, volume de pièces, paie et facturation électronique, une demande chiffrable avant le premier rendez-vous",
    url: `${SITE_URL}/secteurs/funnel-devis-expert-comptable-lettre-de-mission`,
    description: "Landing SEO cabinets d'expertise comptable : les questions à poser avant de chiffrer une lettre de mission (forme juridique, régime fiscal et TVA, volume de pièces, salariés, date de clôture, reprise d'un confrère, facturation électronique), les règles du métier (lettre de mission écrite, honoraires convenus avant la mission, vigilance anti-blanchiment, reprise de dossier), et comment monter ce funnel dans QuoteBuilder à partir du template Conseil. Sans template inventé ni fonction inventée.",
    about: "Expert-comptable",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Expert-comptable"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis pour expert-comptable : forme juridique, volume de pièces, paie et facturation électronique, une demande chiffrable avant le premier rendez-vous"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO cabinets d'expertise comptable : les questions à poser avant de chiffrer une lettre de mission (forme juridique, régime fiscal et TVA, volume de pièces, salariés, date de clôture, reprise d'un confrère, facturation électronique), les règles du métier (lettre de mission écrite, honoraires convenus avant la mission, vigilance anti-blanchiment, reprise de dossier), et comment monter ce funnel dans QuoteBuilder à partir du template Conseil. Sans template inventé ni fonction inventée."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover">Créer ce funnel</Link>
            <Link href="/secteurs" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-mk-ink ring-1 ring-mk-border">Tous les secteurs</Link>
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
              { href: "/blog/facturation-electronique-2026-devis-b2b-tpe-pme", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/calculateur-echeance-facturation-electronique", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/secteurs/funnel-devis-cabinet-conseil", t: "Secteur voisin", d: "Un autre funnel du même geste commercial." },
              { href: "/fonctionnalites/espace-prospect", t: "Espace prospect", d: "Le dossier, les pièces et les relances, sur un seul lien." },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl bg-white p-4 ring-1 ring-mk-border hover:shadow-[0_18px_40px_-28px_rgba(60,30,8,0.4)]">
                <p className="font-semibold">{item.t}</p>
                <p className="mt-1 text-sm text-mk-muted">{item.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <MarketingFaq items={FAQ} />
      <MarketingCta title="Essayer gratuitement" text={" Posez situation, forme juridique, volume de factures, paie et date de clôture dans un ordre fixe. Il n’y a pas de template expert-comptable. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
