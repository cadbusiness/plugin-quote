import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LandingSectors } from "@/components/marketing/landing-sectors";
import { CatalogShot, PipelineShot, WizardShot } from "@/components/marketing/landing-shots";
import { ProductWalkthrough } from "@/components/marketing/product-walkthrough";

const FAQ = [
  {
    q: "C’est quoi la différence avec un formulaire de contact ?",
    a: "Un formulaire recueille du texte libre. QuoteBuilder fait configurer une demande à partir de vos vrais produits — dimensions, options, quantités. Vous recevez un dossier qualifié, pas un email à interpréter.",
  },
  {
    q: "Est-ce que je dois avoir une boutique WooCommerce ?",
    a: "Non. Vous importez votre catalogue directement dans QuoteBuilder (saisie manuelle ou CSV). Si vous avez WooCommerce, une sync automatique est disponible en plan Pro.",
  },
  {
    q: "Comment s’intègre QuoteBuilder sur mon site ?",
    a: "Deux lignes de code JavaScript, ou un plugin WordPress à installer en un clic. Le configurateur apparaît sur votre site sans toucher à votre design.",
  },
  {
    q: "Que se passe-t-il quand j’atteins la limite de 10 devis en Free ?",
    a: "Les demandes suivantes sont visibles dans votre pipeline mais grisées. Vous voyez qu’il y a un prospect — vous ne pouvez pas ouvrir le dossier sans passer au plan Starter.",
  },
  {
    q: "Je n’ai pas d’équipe commerciale. C’est fait pour moi ?",
    a: "Oui. Beaucoup de clients utilisent QuoteBuilder seuls. Le pipeline et les relances automatiques fonctionnent pour un solo comme pour une équipe de 10.",
  },
  {
    q: "Est-ce que je peux le tester sur mon secteur avant de payer ?",
    a: "Oui. Le plan Free est illimité dans le temps. Vous pouvez configurer votre catalogue, tester le wizard, recevoir vos 10 premiers dossiers — sans carte bancaire.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "0 €",
    period: "",
    quotes: "10 devis / mois",
    modes: "Wizard",
    crm: "Basique",
    team: "1 user",
    whiteLabel: false,
    cta: "Commencer",
    href: "/signup",
    featured: false,
  },
  {
    name: "Starter",
    price: "19 €",
    period: "/mois",
    quotes: "50 devis / mois",
    modes: "Wizard + Chat",
    crm: "Complet",
    team: "3 users",
    whiteLabel: false,
    cta: "Commencer",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "49 €",
    period: "/mois",
    quotes: "Illimité",
    modes: "Tout",
    crm: "Complet",
    team: "10 users",
    whiteLabel: false,
    cta: "Commencer",
    href: "/signup",
    featured: true,
  },
  {
    name: "Agency",
    price: "149 €",
    period: "/mois",
    quotes: "Illimité",
    modes: "Tout",
    crm: "Complet",
    team: "Illimité",
    whiteLabel: true,
    cta: "Nous contacter",
    href: "mailto:hello@quotebuilder.app",
    featured: false,
  },
];

const HOW_STEPS = [
  {
    n: "①",
    title: "Vous enregistrez votre catalogue",
    text: "Vos produits, vos options, vos gammes. QuoteBuilder ne laisse configurer que ce que vous savez livrer. Pas de promesses impossibles.",
    shot: <CatalogShot />,
  },
  {
    n: "②",
    title: "Votre prospect configure son besoin",
    text: "Via un wizard guidé, un chat IA, ou une page de configuration libre — selon ce qui convient à votre secteur. Il répond à vos questions, sélectionne vos produits, précise ses contraintes.",
    shot: <WizardShot />,
  },
  {
    n: "③",
    title: "Vous recevez un dossier structuré",
    text: "Surface, produits sélectionnés, quantités, budget indicatif, coordonnées, score de qualification. Votre commercial rappelle en sachant exactement quoi proposer.",
    shot: <PipelineShot />,
  },
];

export function Landing() {
  return (
    <div className="min-h-dvh bg-[#F6F0E8] text-[#1A1510]">
      <header className="sticky top-0 z-20 border-b border-[#1A1510]/8 bg-[#F6F0E8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <BrandLogo variant="wordmark" href="/" priority />
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#1A1510]/70 md:flex">
            <a href="#comment-ca-marche" className="hover:text-[#1A1510]">
              Comment ça marche
            </a>
            <a href="#tarifs" className="hover:text-[#1A1510]">
              Tarifs
            </a>
            <Link href="/c/quickly/rayonnage" className="hover:text-[#1A1510]">
              Démo
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-[#1A1510]/70 hover:text-[#1A1510] sm:inline">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#E85D04] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Commencer gratuitement →
            </Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-6 pb-3 text-sm font-medium text-[#1A1510]/65 md:hidden">
          <a href="#comment-ca-marche">Comment ça marche</a>
          <a href="#tarifs">Tarifs</a>
          <Link href="/c/quickly/rayonnage">Démo</Link>
        </nav>
      </header>

      <section className="relative overflow-hidden px-6 pb-8 pt-12 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-[#F3B184]/45 blur-3xl sm:h-[26rem] sm:w-[26rem]"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Configurateur de devis B2B</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-[3.35rem] sm:leading-[1.08]">
            Arrêtez de recevoir des emails vides.
            <br />
            Recevez des devis configurés.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#1A1510]/70">
            QuoteBuilder remplace votre formulaire de contact par un configurateur branché sur vos
            vrais produits. Vos prospects configurent leur besoin. Vous recevez un brief structuré,
            prêt à chiffrer.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-[#E85D04] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Commencer gratuitement
            </Link>
            <Link href="/c/quickly/rayonnage" className="text-sm font-medium text-[#1A1510]/70 underline-offset-4 hover:underline">
              Voir la démo Quickly
            </Link>
          </div>
          <p className="mt-3 text-xs text-[#1A1510]/45">10 devis offerts · pas de carte bancaire</p>
          <div className="mx-auto mt-8 max-w-lg rounded-2xl bg-white/70 px-5 py-4 text-left ring-1 ring-black/5">
            <p className="text-sm font-medium">⭐ Utilisé par Quickly International · Rayonnage industriel, Belgique</p>
            <p className="mt-1 text-sm leading-6 text-[#1A1510]/65">
              « Avant on recevait des emails vides. Maintenant on reçoit des dossiers. »
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#1A1510]/8 bg-white/50 px-6 py-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-[#1A1510]/40">
          Ils ont remplacé leur formulaire par QuoteBuilder
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-3">
          <span className="rounded-full bg-[#1A1510] px-4 py-2 text-sm font-medium text-white">Quickly</span>
          <span className="rounded-full bg-white px-4 py-2 text-sm text-[#1A1510]/35 ring-1 ring-black/8">
            Client 2
          </span>
          <span className="rounded-full bg-white px-4 py-2 text-sm text-[#1A1510]/35 ring-1 ring-black/8">
            Client 3
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-20">
        <h2 className="mx-auto max-w-2xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Votre formulaire de contact vous coûte des clients.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <ProblemCard
            title="Demandes vagues"
            text="« Bonjour, je voudrais un devis. » Votre commercial rappelle, perd 30 minutes, le prospect a déjà signé ailleurs."
          />
          <ProblemCard
            title="Qualification impossible"
            text="Vous ne savez pas si c’est un entrepôt de 200 m² ou 2 000 m². Vous ne savez pas si c’est pour demain ou dans 6 mois."
          />
          <ProblemCard
            title="Relances oubliées"
            text="Pas de suivi. Le prospect attend. Vous oubliez. La vente meurt en silence."
          />
        </div>
      </section>

      <section id="comment-ca-marche" className="scroll-mt-24 bg-white/70 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto max-w-2xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            QuoteBuilder guide vos prospects. Vous recevez des dossiers.
          </h2>
          <div className="mt-14 space-y-16">
            {HOW_STEPS.map((step, i) => (
              <article
                key={step.title}
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12 ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
              >
                <div>
                  <p className="text-sm font-medium text-[#C45C26]">{step.n}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{step.title}</h3>
                  <p className="mt-3 text-[17px] leading-8 text-[#1A1510]/70">{step.text}</p>
                </div>
                <div>{step.shot}</div>
              </article>
            ))}
          </div>
          <div className="mt-16">
            <p className="mb-3 text-center text-sm text-[#1A1510]/50">
              Simulation — catalogue Quickly, configurateur client, puis le dossier dans le pipeline.
            </p>
            <ProductWalkthrough />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Un seul outil, trois façons d’entrer.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <ModeCard
            title="Page de configuration"
            text="Une URL publique ou un embed sur votre site. Le prospect configure librement depuis votre catalogue. Idéal pour les clients qui savent ce qu’ils veulent."
          />
          <ModeCard
            title="Wizard guidé"
            text="Un parcours à questions dans l’ordre que vous définissez. Cadre le projet avant de parler produits. Idéal pour les achats complexes ou techniques."
          />
          <ModeCard
            title="Chat IA"
            text="Le prospect décrit son besoin en langage naturel. L’IA pose les questions, propose les produits, génère le dossier. Idéal pour ceux qui ne savent pas encore par où commencer."
          />
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-[#1A1510]/55">
          Les trois modes utilisent le même catalogue. Le même pipeline reçoit les demandes.
        </p>
      </section>

      <section className="bg-[#1A1510] px-6 py-16 text-[#F6F0E8] sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            La demande est reçue. Et après ?
          </h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-8 text-[#F6F0E8]/75">
            QuoteBuilder ne s’arrête pas à la soumission. Chaque demande entre dans votre pipeline :
            statut, assignation, notes, historique des échanges, relances automatiques.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <CrmCard
              title="Pipeline visuel"
              text="Nouveau → Contacté → En cours → Gagné → Perdu. Vous voyez d’un coup d’œil où en est chaque dossier."
            />
            <CrmCard
              title="Gestion d’équipe"
              text="Assignez une demande à un commercial. Il reçoit une notification. Tout le monde sait qui fait quoi."
            />
            <CrmCard
              title="Relances automatiques"
              text="Confirmation immédiate au prospect. Rappel si personne n’a traité. Suivi à J+1, J+3, J+7. Tout configurable."
            />
            <CrmCard
              title="Statistiques"
              text="Combien de demandes reçues, quel taux de conversion, quel commercial performe. Connecté à Google Analytics en 30 secondes."
            />
          </div>
        </div>
      </section>

      <section id="secteurs" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Fait pour ceux qui vendent sur mesure.
        </h2>
        <div className="mt-8">
          <LandingSectors />
        </div>
      </section>

      <section id="tarifs" className="scroll-mt-24 bg-white/70 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Simple. Sans surprise.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`flex flex-col rounded-2xl p-6 ${
                  plan.featured
                    ? "bg-[#1A1510] text-white shadow-xl"
                    : "bg-white ring-1 ring-black/8"
                }`}
              >
                <p className="text-sm font-medium">{plan.name}</p>
                {plan.featured ? (
                  <p className="mt-1 text-xs text-[#F3B184]">Le plus choisi</p>
                ) : null}
                <p className="mt-4 text-3xl font-semibold tracking-tight">
                  {plan.price}
                  {plan.period ? (
                    <span className={`text-sm font-normal ${plan.featured ? "text-white/55" : "text-[#1A1510]/45"}`}>
                      {plan.period}
                    </span>
                  ) : null}
                </p>
                <ul className={`mt-6 space-y-2.5 text-sm ${plan.featured ? "text-white/75" : "text-[#1A1510]/70"}`}>
                  <li>{plan.quotes}</li>
                  <li>{plan.modes}</li>
                  <li>CRM {plan.crm}</li>
                  <li>{plan.team}</li>
                  <li>{plan.whiteLabel ? "White-label inclus" : "White-label : non"}</li>
                </ul>
                <Link
                  href={plan.href}
                  className={`mt-8 rounded-full px-4 py-2.5 text-center text-sm font-semibold ${
                    plan.featured
                      ? "bg-[#E85D04] text-white hover:bg-[#d35400]"
                      : "bg-[#F6F0E8] text-[#1A1510] hover:bg-[#EFE6DA]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-[#1A1510]/50">
            Les 10 premiers devis sont toujours gratuits. Pas de carte bancaire requise.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl scroll-mt-24 px-6 py-16 sm:py-20" id="faq">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Questions fréquentes.</h2>
        <div className="mt-8 divide-y divide-[#1A1510]/10 border-y border-[#1A1510]/10">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none text-lg font-semibold [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span className="mt-1 text-[#1A1510]/35 group-open:hidden">+</span>
                  <span className="mt-1 hidden text-[#1A1510]/35 group-open:inline">–</span>
                </span>
              </summary>
              <p className="mt-3 text-[17px] leading-8 text-[#1A1510]/70">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="cta" className="px-6 pb-16">
        <div className="mx-auto max-w-4xl rounded-[28px] bg-[#1A1510] px-8 py-14 text-center text-[#F6F0E8] sm:px-16">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Votre prochain devis arrive dans 10 minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-7 text-[#F6F0E8]/70">
            Créez votre compte gratuit, importez 3 produits, testez le configurateur. Pas de carte
            bancaire. Pas de limite de temps.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-full bg-[#E85D04] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d35400]"
          >
            Commencer gratuitement
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#1A1510]/10 px-6 py-10 text-sm text-[#1A1510]/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="font-medium text-[#1A1510]/70">QuoteBuilder · Configurateur de devis B2B</p>
            <p className="mt-1">Produit de Vinci Liberta LTD · Dublin, Irlande</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/" className="hover:text-[#1A1510]">
                Accueil
              </Link>
              <Link href="/c/quickly/rayonnage" className="hover:text-[#1A1510]">
                Démo
              </Link>
              <a href="#tarifs" className="hover:text-[#1A1510]">
                Tarifs
              </a>
              <Link href="/login" className="hover:text-[#1A1510]">
                Connexion
              </Link>
              <a href="#cta" className="hover:text-[#1A1510]">
                Contact
              </a>
            </div>
            <p className="text-[#1A1510]/35">CGU · Politique de confidentialité</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProblemCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl bg-white p-6 ring-1 ring-black/6">
      <p className="text-sm font-medium text-[#C45C26]">✕</p>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-[#1A1510]/70">{text}</p>
    </article>
  );
}

function ModeCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl bg-white p-6 ring-1 ring-black/6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-[#1A1510]/70">{text}</p>
    </article>
  );
}

function CrmCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl bg-white/6 p-5 ring-1 ring-white/10">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-[#F6F0E8]/70">{text}</p>
    </article>
  );
}
