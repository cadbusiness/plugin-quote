import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis paysagiste : création et aménagement de jardin, un brief chiffrable avant le rendez-vous",
  description:
    "Landing SEO paysagiste et entreprise du paysage : funnel de devis jardin (usage, surface, niveau d'entretien, accès, photos, saison), template Paysagiste QuoteBuilder, règles de suggestion, brief scoré. Sans barème ni kit inventés.",
  path: "/secteurs/funnel-devis-paysagiste-amenagement-jardin",
});

const FAQ = [
  {
    q: "Existe-t-il un template paysagiste dans QuoteBuilder ?",
    a: "Oui. Le template « Paysagiste » (famille habitat) crée une étape « Votre extérieur » avec usage principal, surface et niveau d'entretien, puis les étapes suggestions, personnalisation et coordonnées. Il ne crée ni produits ni règles.",
  },
  {
    q: "Peut-on chiffrer un aménagement de jardin sans visite ?",
    a: "Souvent un indicatif, oui, si surface, usage, photos et accès sont corrects. Pour une création complète, la visite reste fréquente. Le funnel sert à décider quand elle vaut le déplacement.",
  },
  {
    q: "Faut-il afficher un prix au m² sur le site ?",
    a: "C'est risqué. Le prix dépend de l'accès, de l'état du terrain et des choix. Une fourchette indicative issue du funnel est plus honnête qu'un tarif au m² affiché.",
  },
  {
    q: "Création et entretien dans le même funnel, c'est possible ?",
    a: "Oui avec une question « type de demande » et des règles de suggestion adaptées. Mais les étapes restent les mêmes pour tous. Si les questions diffèrent vraiment, faites deux funnels.",
  },
  {
    q: "Comment éviter l'abandon à l'étape photos ?",
    a: "Rendez la question facultative et dites ce qu'elle apporte : une réponse plus rapide, parfois sans visite. Les photos passent par l'upload du prospect et n'ont pas de légende : demandez des vues précises dans le texte d'aide.",
  },
  {
    q: "Le score tient-il compte de la saison ou de l'urgence ?",
    a: "Non. C'est une formule fixe qui lit surface, charge, accès, type de projet, contraintes et longueur du besoin. Saison, zone, urgence et photos relèvent de votre triage.",
  },
  {
    q: "Peut-on proposer un pack « terrasse + éclairage » ?",
    a: "Pas sous forme de kit, qui n'existe pas dans QuoteBuilder. Mettez les deux produits dans la même règle de suggestion, ou faites de l'éclairage une option.",
  },
  {
    q: "Les prix affichés sont-ils HT ou TTC ?",
    a: "Ni l'un ni l'autre : QuoteBuilder affiche une fourchette indicative min-max en euros entiers, sans gestion de TVA. Votre devis ferme précise le reste.",
  },
  {
    q: "Le prospect peut-il signer le devis en ligne ?",
    a: "Non. Il consulte l'espace prospect, échange et ajoute des photos. Des relecteurs peuvent valider ou demander des modifications. C'est vous qui posez Gagné.",
  },
  {
    q: "QuoteBuilder planifie-t-il les chantiers et l'entretien ?",
    a: "Non. Le produit reçoit, score et suit les demandes de devis. Le planning des équipes et des passages d'entretien reste dans vos outils.",
  },
];

export default function PaysagisteAmenagementJardinLandingPage() {
  const body = loadPostBody("funnel-devis-paysagiste-amenagement-jardin");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis paysagiste : création et aménagement de jardin, un brief chiffrable avant le rendez-vous",
    url: `${SITE_URL}/secteurs/funnel-devis-paysagiste-amenagement-jardin`,
    about: "Paysagiste, aménagement de jardin, usage, surface, accès, photos, saison",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Paysagiste / aménagement
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis paysagiste : création et aménagement de jardin, un brief chiffrable avant le rendez-vous
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Usage, surface, niveau d&apos;entretien, accès, photos et saison.
            Un brief chiffrable, un libellé automatique, puis un espace prospect sur un seul lien.
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
              { href: "/fonctionnalites/funnel", t: "Funnel", d: "Questions en ordre fixe : usage, surface, entretien, accès, photos." },
              { href: "/fonctionnalites/catalogue", t: "Catalogue", d: "Suggestions Si/Alors, 3 blocs max. Pas de kits." },
              { href: "/fonctionnalites/demandes", t: "Demandes", d: "Libellé automatique Hot, Warm ou Cold, et assignation." },
              { href: "/fonctionnalites/autopilote", t: "Autopilote", d: "Confirm, relances." },
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
        title="Partir du template Paysagiste"
        text="Famille habitat : usage, surface et niveau d'entretien, dans un ordre fixe. Le template ne crée ni produits ni règles. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
