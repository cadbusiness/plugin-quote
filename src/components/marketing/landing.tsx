import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LandingSectors } from "@/components/marketing/landing-sectors";
import { AutopilotShot, CatalogShot, PipelineShot, WizardShot } from "@/components/marketing/landing-shots";
import { ProductWalkthrough } from "@/components/marketing/product-walkthrough";

const DEMO_HREF = "#demo";

const FAQ = [
  {
    q: "C’est quoi la différence avec un catalogue ou une boutique ?",
    a: "Un catalogue stocke des produits. Une boutique encaisse. QuoteBuilder pose votre offre dans un parcours de devis, puis pilote chaque demande : score, assignation, relances, workflows. Le catalogue est l’entrée — l’autopilote, c’est le produit.",
  },
  {
    q: "Est-ce que je dois avoir une boutique WooCommerce ?",
    a: "Non. Vous importez votre catalogue directement (saisie ou CSV). Si vous avez WooCommerce ou Shopify, une sync est disponible en plan Pro.",
  },
  {
    q: "Comment s’intègre QuoteBuilder sur mon site ?",
    a: "Deux lignes de JavaScript, ou un plugin WordPress. Le funnel s’affiche sur votre site sans toucher à votre design.",
  },
  {
    q: "Que se passe-t-il quand j’atteins la limite de 10 devis en Free ?",
    a: "Les demandes suivantes restent visibles dans le pipeline, mais grisées. Vous voyez qu’il y a un prospect — vous ouvrez le dossier en passant au plan Starter.",
  },
  {
    q: "Je n’ai pas d’équipe commerciale. C’est fait pour moi ?",
    a: "Oui. L’autopilote (confirmation, relances, rappels) travaille pour un solo comme pour une équipe de dix.",
  },
  {
    q: "Est-ce que je peux le tester avant de payer ?",
    a: "Oui. Le plan Free est illimité dans le temps. Catalogue, funnel, 10 premiers dossiers — sans carte bancaire.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "0 €",
    period: "",
    quotes: "10 devis / mois",
    modes: "Funnel",
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
    modes: "Funnel + Chat",
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
    title: "Posez votre offre",
    text: "Produits, gammes, prix min/max — à la main, en CSV, ou via Woo / Shopify. Ce n’est pas le différenciateur : c’est le socle. Sans offre claire, pas de devis propre.",
    shot: <CatalogShot />,
  },
  {
    n: "②",
    title: "Ils configurent le projet",
    text: "Funnel guidé ou chat IA. Le prospect répond à vos questions, choisit dans votre catalogue, précise les contraintes. Il soumet un dossier — pas un email vague.",
    shot: <WizardShot />,
  },
  {
    n: "③",
    title: "Vous recevez un dossier exploitable",
    text: "Produits, quantités, budget indicatif, coordonnées, score hot / warm / cold. Votre commercial rappelle pour conclure, pas pour découvrir le besoin.",
    shot: <PipelineShot />,
  },
  {
    n: "④",
    title: "L’autopilote prend le relais",
    text: "Confirmation, relances d’abandon, rappel si non traité, assignation, branches selon le score. Vous pilotez les devis comme vous ne l’avez jamais pu — sans traquer chaque fil de mails.",
    shot: <AutopilotShot />,
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
            <a href="#autopilote" className="hover:text-[#1A1510]">
              Autopilote
            </a>
            <a href="#tarifs" className="hover:text-[#1A1510]">
              Tarifs
            </a>
            <a href={DEMO_HREF} className="hover:text-[#1A1510]">
              Démo
            </a>
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
          <a href="#autopilote">Autopilote</a>
          <a href="#tarifs">Tarifs</a>
          <a href={DEMO_HREF}>Démo</a>
        </nav>
      </header>

      <section className="relative overflow-hidden px-6 pb-8 pt-12 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-[#F3B184]/45 blur-3xl sm:h-[26rem] sm:w-[26rem]"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Funnel de devis B2B</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-[3.35rem] sm:leading-[1.08]">
            Votre offre en parcours.
            <br />
            Vos devis en autopilote.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#1A1510]/70">
            Un catalogue, d’autres outils le font. QuoteBuilder pose votre offre dans un funnel,
            collecte des dossiers complets, puis fait avancer chaque devis — score, relances,
            workflows — sans que vous traquiez les emails.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-[#E85D04] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Commencer gratuitement
            </Link>
            <a href={DEMO_HREF} className="text-sm font-medium text-[#1A1510]/70 underline-offset-4 hover:underline">
              Voir la démo
            </a>
          </div>
          <p className="mt-3 text-xs text-[#1A1510]/45">10 devis offerts · pas de carte bancaire</p>
        </div>
      </section>

      <section className="border-y border-[#1A1510]/8 bg-white/50 px-6 py-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-[#1A1510]/40">
          Pas un catalogue de plus — un système pour piloter les devis sur mesure
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-2">
          {["Rayonnage", "Cuisine", "Menuiserie", "Paysage", "Location", "Aménagement"].map((label) => (
            <span key={label} className="rounded-full bg-white px-3.5 py-1.5 text-sm text-[#1A1510]/60 ring-1 ring-black/8">
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-20">
        <h2 className="mx-auto max-w-2xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Le problème n’est pas d’afficher des produits.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[17px] leading-8 text-[#1A1510]/65">
          Afficher un catalogue, tout le monde sait le faire. Ce qui manque : un parcours pour
          composer le projet, puis un système pour faire avancer chaque demande jusqu’à la vente.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <ProblemCard
            title="Des demandes floues"
            text="Email vague, formulaire générique, ou rien. Votre commercial perd la première heure à comprendre le besoin au lieu de proposer."
          />
          <ProblemCard
            title="Rien ne bouge sans vous"
            text="Pas de score, pas de relance, pas d’assignation claire. Les bons dossiers refroidissent dans la boîte mail."
          />
          <ProblemCard
            title="Aucun autopilote"
            text="Chaque suivi est manuel. Abandons oubliés, confirmations oubliées, rappels oubliés. Le volume monte — la méthode ne suit pas."
          />
        </div>
      </section>

      <section id="comment-ca-marche" className="scroll-mt-24 bg-white/70 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto max-w-2xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Le catalogue ouvre la porte. L’autopilote gère la suite.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[17px] leading-8 text-[#1A1510]/65">
            Quatre temps. Les deux premiers, d’autres outils les touchent. Les deux derniers,
            c’est là que QuoteBuilder change la façon de vendre au devis.
          </p>
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
          <div id="demo" className="mt-16 scroll-mt-24">
            <p className="mb-3 text-center text-sm text-[#1A1510]/50">
              Simulation — offre, funnel, dossier, puis l’autopilote.
            </p>
            <ProductWalkthrough />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          L’entrée : trois façons de composer le devis.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[17px] leading-8 text-[#1A1510]/65">
          Toujours le même catalogue. Toujours le même pipeline. Seule l’expérience prospect change.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <ModeCard
            title="Catalogue interactif"
            text="URL publique ou embed. Le prospect parcourt vos produits, compose, voit ce qui est possible. Quand il sait déjà ce qu’il cherche."
          />
          <ModeCard
            title="Funnel guidé"
            text="Une séquence de steps que vous construisez. Il cadre le projet avant les produits. Pour les achats complexes ou techniques."
          />
          <ModeCard
            title="Chat IA"
            text="Il décrit le besoin en langage naturel. L’IA pose les questions, propose vos produits, génère le dossier. Quand il ne sait pas par où commencer."
          />
        </div>
      </section>

      <section id="autopilote" className="scroll-mt-24 bg-[#1A1510] px-6 py-16 text-[#F6F0E8] sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-[#F3B184]">Le différenciateur</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Après la soumission, les devis avancent tout seuls.
          </h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-8 text-[#F6F0E8]/75">
            C’est là que les catalogues s’arrêtent. QuoteBuilder enchaîne : pipeline, score,
            assignation, canvas d’automatisations. Vous managez les devis comme vous ne l’avez
            jamais pu — sans refaire le travail à la main.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <CrmCard
              title="Pipeline + score"
              text="Nouveau → Contacté → En cours → Gagné / Perdu. Hot, warm, cold calculés sur le dossier. Vous priorisez en un coup d’œil."
            />
            <CrmCard
              title="Assignation d’équipe"
              text="Une demande, un commercial. Notification, notes, historique. Tout le monde sait qui fait quoi."
            />
            <CrmCard
              title="Workflows canvas"
              text="Emails, waits, branches sur score / statut / réponses. Confirmation T+0, relance abandon, rappel si non traité — tout activable."
            />
            <CrmCard
              title="Statistiques utiles"
              text="Volume, conversion, délai, CA potentiel. Les abandons relançables sont à un clic — pas perdus dans Analytics."
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
            Posez votre offre. Pilotez vos devis.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-7 text-[#F6F0E8]/70">
            Funnel sur votre catalogue, puis autopilote sur chaque demande. Compte gratuit,
            pas de carte bancaire.
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
            <p className="font-medium text-[#1A1510]/70">QuoteBuilder · Devis en autopilote</p>
            <p className="mt-1">© {new Date().getFullYear()} Vinci Liberta LTD · Dublin, Irlande</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/" className="hover:text-[#1A1510]">
                Accueil
              </Link>
              <a href={DEMO_HREF} className="hover:text-[#1A1510]">
                Démo
              </a>
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
