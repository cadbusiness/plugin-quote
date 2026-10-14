import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFaq } from "@/components/marketing/marketing-faq";
import { MarketingCta } from "@/components/marketing/marketing-shell";
import { Markdown } from "@/lib/marketing/markdown";
import { loadPostBody } from "@/lib/marketing/load-post";
import { SITE_URL, pageMetadata } from "@/lib/marketing/site";

export const metadata: Metadata = pageMetadata({
  title: "Funnel de devis location de matériel BTP : famille d'engin, durée et chantier avant le premier appel",
  description:
    "Landing SEO loueurs de matériel BTP : template Location matériel de QuoteBuilder (levage, terrassement, énergie), questions à ajouter, parc importé en CSV, règles Si/Alors par durée, score Cold, photo d'accès. Ce que l'outil ne fait pas : planning, caution, contrat.",
  path: "/secteurs/funnel-devis-location-materiel-btp",
});

const FAQ = [
  {
    q: "Existe-t-il un template location de matériel dans QuoteBuilder ?",
    a: "Oui. Le template « Location matériel », identifiant rental, dans la famille Location & événementiel. Il crée un formulaire nommé « Funnel location », en quatre étapes : Votre location, Solutions recommandées, Personnalisation, Vos coordonnées.",
  },
  {
    q: "Quelles familles de matériel le template propose-t-il ?",
    a: "Levage / Nacelle, Terrassement, Énergie / Groupe et Autre, en choix visuel. Vous pouvez modifier les libellés et ajouter des choix dans l'éditeur.",
  },
  {
    q: "Le prix se calcule-t-il selon la durée ?",
    a: "Non. Le montant d'une ligne vaut le prix unitaire multiplié par la quantité. La durée est une réponse. Pour un tarif par durée, créez une fiche par tarif et laissez les règles Si/Alors choisir selon la durée.",
  },
  {
    q: "QuoteBuilder vérifie-t-il la disponibilité des machines ?",
    a: "Non. Il n'y a ni planning, ni réservation, ni blocage de dates. Les produits suggérés sont ceux de vos règles. La disponibilité se vérifie dans votre logiciel de parc avant de répondre.",
  },
  {
    q: "Peut-on poser des questions différentes pour une nacelle et pour une mini-pelle ?",
    a: "Non. Les questions passent dans un ordre fixe pour tout le monde. Les règles choisissent seulement les produits suggérés. Rédigez des questions valables pour toutes les familles, ou faites deux funnels.",
  },
  {
    q: "Pourquoi toutes les demandes sont-elles Cold ?",
    a: "La formule du score part de 30 et ne lit ni la famille de matériel, ni la durée, ni la date. Les questions ajoutées dans l'éditeur ne sont pas lues non plus. Chaque demande vaut 30 points, donc Cold. Triez par date souhaitée.",
  },
  {
    q: "Le client peut-il envoyer une photo de l'accès au chantier ?",
    a: "Oui, à l'étape Personnalisation, zone « Plan (PDF ou image) », en PDF, JPEG, PNG ou WebP, jusqu'à 10 Mo. Après l'envoi, il peut ajouter un fichier depuis « Compléter la demande » dans son espace prospect.",
  },
  {
    q: "Comment importer tout le parc d'un coup ?",
    a: "Avec l'import CSV du catalogue : nom, SKU, catégorie, prix min, prix max, tags et description. Le fichier doit utiliser la virgule comme séparateur. Le vérificateur CSV catalogue contrôle le fichier avant l'import.",
  },
  {
    q: "QuoteBuilder gère-t-il la caution et le contrat de location ?",
    a: "Non. QuoteBuilder n'encaisse rien et ne produit pas de contrat. Caution, conditions générales et état des lieux se gèrent dans votre logiciel de location ou sur papier.",
  },
  {
    q: "Faut-il un plan payant pour ce funnel ?",
    a: "Le template se choisit à la création du funnel, plan Free compris, avec un funnel et un plafond de soumissions. D'après la page Tarifs, le catalogue de produits et les règles Si/Alors demandent un plan payant. Le détail est sur la page Tarifs.",
  },
];

export default function LocationMaterielBtpLandingPage() {
  const body = loadPostBody("funnel-devis-location-materiel-btp");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Funnel de devis location de matériel BTP : famille d'engin, durée et chantier avant le premier appel",
    url: `${SITE_URL}/secteurs/funnel-devis-location-materiel-btp`,
    about: "Location de matériel BTP, nacelle, terrassement, groupe électrogène",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-6 pb-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mk-accent">
            Secteur · Location de matériel BTP
          </p>
          <h1 className="mt-3 text-[1.85rem] font-semibold tracking-tight sm:text-4xl sm:leading-tight">
            Funnel de devis location de matériel BTP : famille d&apos;engin, durée et chantier avant le premier appel
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-mk-muted sm:text-lg">
            Famille de matériel, durée, date souhaitée. Le template Location matériel les pose. Le parc s&apos;importe
            en CSV. Les règles Si/Alors choisissent la machine. Planning, caution et contrat restent dehors.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup?plan=free"
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
              {
                href: "/blog/import-catalogue-csv-funnel-devis-b2b",
                t: "Import CSV",
                d: "Sept colonnes, virgule, SKU. Le parc entre dans le funnel sans ressaisie.",
              },
              {
                href: "/outils/verificateur-csv-catalogue-devis",
                t: "Vérificateur CSV",
                d: "Séparateur, colonnes, SKU en double et prix lus à 0 €, avant de cliquer sur Importer.",
              },
              {
                href: "/blog/regles-suggestion-produits-funnel-devis-b2b",
                t: "Règles Si/Alors",
                d: "Conditions ET, trois suggestions au plus. La durée choisit la machine, pas le prix.",
              },
              {
                href: "/fonctionnalites/espace-prospect",
                t: "Espace prospect",
                d: "Plan en PDF ou image, 10 Mo. Relecteurs avec un lien de 30 jours.",
              },
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
        title="Essayer le template Location matériel"
        text="Créer un compte Free puis choisir le template Location matériel (rental) dans la famille Location & événementiel. Type Formulaire, nom par défaut « Funnel location ». Le template ne crée ni produits ni règles. Le plan Free suffit pour voir l'interface, sans carte."
      />
    </>
  );
}
