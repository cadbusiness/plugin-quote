import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis maintenance industrielle et contrats d'entretien : parc d'équipements, criticité, horaires du site, une demande chiffrable avant l'audit",
  description: "Landing SEO sociétés de maintenance industrielle, mainteneurs d'équipements de production, de manutention, de levage et de froid : questions avant l'audit (parc, criticité, horaires, contrat en cours, documentation), contrat au forfait, régie pour les pièces et dépannages, vérifications générales périodiques (articles R4323-23 à R4323-27 du code du travail), montage à partir du template Aménagement industriel (fitout), score Cold 30 ou 35. Sans template inventé ni fonction inventée.",
  path: "/secteurs/funnel-devis-maintenance-industrielle-contrat",
});

export const FAQ = [
  { q: "QuoteBuilder a-t-il un template maintenance industrielle ?", a: "Non. Le plus proche est « Aménagement industriel » (`fitout`, famille « Industrie & fabrication »), qui parle d'un site, de son usage et de ses contraintes. Vous renommez ses libellés, ajoutez vos questions et votre catalogue, sans inventer de fonction qui n'existe pas." },
  { q: "Puis-je poser la question sur la reprise de contrat seulement si le prospect a choisi « Reprise d'un contrat existant » ?", a: "Non. Il n'y a pas de branchement conditionnel : les questions et leur ordre sont fixes, et toutes s'affichent. Rendez-les facultatives et formulez-les pour qu'un prospect sans contrat réponde « Aucun » en une seconde. Les règles Si/Alors choisissent seulement les produits suggérés." },
  { q: "Pourquoi mes demandes sortent-elles toutes Cold ?", a: "La formule de score est fixe et sur le template fitout elle ne lit que la clé `constraints` : 30 points, 35 si une vraie contrainte est cochée. Elle ne lit ni le nombre d'équipements, ni l'impact d'un arrêt, ni le délai. Triez sur ces réponses, pas sur la pastille." },
  { q: "Le funnel peut-il calculer un prix par équipement ?", a: "Non. QuoteBuilder ne calcule pas entre les réponses. Le prix vient des produits du catalogue, qui se saisissent au centime et s'affichent arrondis à l'euro dès 1 € (sous 1 €, les centimes restent), en fixe, en fourchette ou « Sur devis », avec une quantité réglée par le prospect à l'étape Personnalisation. Le prix définitif d'un contrat se fait après lecture du parc ou audit." },
  { q: "Le prospect peut-il envoyer la liste de ses équipements ?", a: "Oui, dans la zone « Plan (PDF ou image) » de l'étape Personnalisation (PDF, JPEG, PNG, WebP, 10 Mo), ou plus tard depuis son espace prospect, rubrique « Compléter la demande ». N'utilisez pas une question de type Fichier, qui s'affiche comme un champ texte dans le funnel public." },
  { q: "Mon équipe peut-elle joindre le contrat ou un rapport de vérification au dossier ?", a: "Non. L'équipe ne peut pas joindre de fichier à un dossier : seuls les envois du prospect y figurent. Gardez le contrat, les rapports et le registre de sécurité dans vos outils, et notez les références dans une note interne." },
  { q: "QuoteBuilder gère-t-il les contrats de maintenance, les échéances et les visites ?", a: "Non. Il n'y a ni planning des techniciens, ni ordres de travail, ni suivi des visites, ni rappel daté de fin de contrat, ni facturation. QuoteBuilder reçoit la demande de devis, la trie et la suit. La gestion du contrat se fait dans votre GMAO ou vos outils." },
  { q: "Faut-il un plan de prévention pour un contrat de maintenance ?", a: "Cela dépend du site et des heures. Dès 400 heures prévisibles sur douze mois, sous-traitants compris, le plan de prévention doit être écrit (article R4512-7 du code du travail), et un contrat annuel peut l'atteindre. Voir l'article sur le [plan de prévention](https://www.quotebuilder.co/blog/plan-prevention-entreprise-exterieure-devis-b2b) et le vérificateur associé." },
  { q: "Dois-je parler des vérifications générales périodiques sur ma landing ?", a: "Seulement si vous les proposez. Elles dépendent d'arrêtés qui fixent les équipements et les périodicités (article R4323-23 du code du travail) et sont réalisées par des personnes qualifiées (article R4323-24). Ne citez pas de périodicité de mémoire, et ne promettez pas une habilitation que vous n'avez pas." },
  { q: "Free suffit-il pour tester ?", a: "Oui pour monter un funnel et le tester : Free est sans carte, avec un funnel. Starter démarre à 39 € par mois et Pro à 79 € par mois en paiement annuel. Le détail est sur la [page des tarifs](https://www.quotebuilder.co/tarifs)." },
];

export default function FunnelDevisMaintenanceIndustrielleContratPage() {
  const body = loadPostBody("funnel-devis-maintenance-industrielle-contrat");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis maintenance industrielle et contrats d'entretien : parc d'équipements, criticité, horaires du site, une demande chiffrable avant l'audit",
    url: `${SITE_URL}/secteurs/funnel-devis-maintenance-industrielle-contrat`,
    description: "Landing SEO sociétés de maintenance industrielle, mainteneurs d'équipements de production, de manutention, de levage et de froid : questions avant l'audit (parc, criticité, horaires, contrat en cours, documentation), contrat au forfait, régie pour les pièces et dépannages, vérifications générales périodiques (articles R4323-23 à R4323-27 du code du travail), montage à partir du template Aménagement industriel (fitout), score Cold 30 ou 35. Sans template inventé ni fonction inventée.",
    about: "Maintenance industrielle et contrats",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">{"Secteur · Maintenance industrielle"}</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">{"Funnel de devis maintenance industrielle et contrats d'entretien : parc d'équipements, criticité, horaires du site, une demande chiffrable avant l'audit"}</h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">{"Landing SEO sociétés de maintenance industrielle, mainteneurs d'équipements de production, de manutention, de levage et de froid : questions avant l'audit (parc, criticité, horaires, contrat en cours, documentation), contrat au forfait, régie pour les pièces et dépannages, vérifications générales périodiques (articles R4323-23 à R4323-27 du code du travail), montage à partir du template Aménagement industriel (fitout), score Cold 30 ou 35. Sans template inventé ni fonction inventée."}</p>
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
              { href: "/blog/forfait-regie-temps-passe-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
              { href: "/outils/comparateur-forfait-regie-devis", t: "Outil", d: "Le calcul ou le contrôle, dans le navigateur." },
              { href: "/blog/plan-prevention-entreprise-exterieure-devis-b2b", t: "Article", d: "Le point de droit qui précède le devis." },
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
      <MarketingCta title="Essayer gratuitement" text={" Posez équipements concernés, impact d'un arrêt, horaires du site, contrat en cours et documentation dans un ordre fixe. QuoteBuilder n'a pas de template maintenance industrielle : partez d'Aménagement industriel. Le plan Free suffit pour voir l’interface, sans carte. "} />
    </>
  );
}
