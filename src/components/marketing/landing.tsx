import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LandingSectors } from "@/components/marketing/landing-sectors";
import { AutopilotShot, CatalogShot, PipelineShot, WizardShot } from "@/components/marketing/landing-shots";
import { ProductWalkthrough } from "@/components/marketing/product-walkthrough";

const DEMO_HREF = "#demo";

const STATS = [
  {
    value: "80 %",
    label: "des ventes demandent 5 relances ou plus",
  },
  {
    value: "44 %",
    label: "des vendeurs s’arrêtent après un seul suivi",
  },
  {
    value: "24 %",
    label: "des sites n’ont aucun moyen de demander un devis",
  },
];

const FAQ = [
  {
    q: "C’est quoi la différence avec un formulaire de contact ?",
    a: "Un formulaire recueille un message vague. QuoteBuilder fait configurer le projet (produits, contraintes, budget), livre un dossier scoré, puis relance tout seul. Vous ne redistribuez plus des emails : vous traitez des devis.",
  },
  {
    q: "C’est quoi la différence avec un catalogue ou une boutique ?",
    a: "Un catalogue stocke des produits. Une boutique encaisse. QuoteBuilder pose votre offre dans un parcours de devis, puis pilote chaque demande : score, assignation, relances. Le catalogue est l’entrée. L’autopilote, c’est le produit.",
  },
  {
    q: "Est-ce que je dois avoir WooCommerce ?",
    a: "Non. Saisie manuelle ou CSV. WooCommerce et Shopify en sync sur le plan Pro.",
  },
  {
    q: "Comment ça s’installe sur mon site ?",
    a: "Deux lignes de JavaScript, ou le plugin WordPress. Sans toucher à votre design.",
  },
  {
    q: "Je suis seul, sans équipe. Ça sert ?",
    a: "Oui. L’autopilote (confirmation, relances, rappels) travaille pour un solo comme pour une équipe.",
  },
  {
    q: "Puis-je tester sans payer ?",
    a: "Oui. Free illimité dans le temps, 10 devis / mois, pas de carte bancaire.",
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
    title: "Posez l’offre",
    text: "Produits, gammes, prix : saisie, CSV, ou Woo / Shopify. Le socle. Pas le différenciateur.",
    shot: <CatalogShot />,
  },
  {
    n: "②",
    title: "Ils configurent",
    text: "Funnel ou chat IA. Le prospect cadre le projet dans votre catalogue et envoie un dossier, pas un mail flou.",
    shot: <WizardShot />,
  },
  {
    n: "③",
    title: "Vous avez un dossier",
    text: "Produits, quantités, budget, score hot / warm / cold. Vous rappelez pour conclure, pas pour découvrir le besoin.",
    shot: <PipelineShot />,
  },
  {
    n: "④",
    title: "L’autopilote suit",
    text: "Confirmation, relances d’abandon, rappel si non traité, branches selon le score. Les 5 relances que 92 % des équipes n’enchaînent jamais.",
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
            <a href="#probleme" className="hover:text-[#1A1510]">
              Le problème
            </a>
            <a href="#solution" className="hover:text-[#1A1510]">
              La solution
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
              Essayer gratuitement
            </Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-6 pb-3 text-sm font-medium text-[#1A1510]/65 md:hidden">
          <a href="#probleme">Problème</a>
          <a href="#solution">Solution</a>
          <a href="#tarifs">Tarifs</a>
          <a href={DEMO_HREF}>Démo</a>
        </nav>
      </header>

      {/* Hero: titres courts pour mobile (≤ 2 lignes) */}
      <section className="relative overflow-hidden px-6 pb-10 pt-10 sm:pb-12 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-[#F3B184]/45 blur-3xl sm:h-[26rem] sm:w-[26rem]"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Funnel de devis B2B</p>
          <h1 className="mt-3 text-[1.85rem] font-semibold leading-[1.15] tracking-tight sm:text-5xl sm:leading-[1.08]">
            Arrêtez de perdre vos devis.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#1A1510]/70 sm:mt-5 sm:text-lg">
            Le prospect n’a pas de parcours. Vous n’avez pas de suivi. QuoteBuilder règle les
            deux : dossier complet à l’entrée, autopilote de relances ensuite.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-[#E85D04] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Mettre en place gratuitement
            </Link>
            <a href="#solution" className="text-sm font-medium text-[#1A1510]/70 underline-offset-4 hover:underline">
              Voir ce qu’il faut installer
            </a>
          </div>
          <p className="mt-3 text-xs text-[#1A1510]/45">10 devis offerts · pas de carte</p>
        </div>
      </section>

      {/* Preuves chiffrées */}
      <section className="border-y border-[#1A1510]/8 bg-white/60 px-6 py-8 sm:py-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-[#1A1510]/40">
          Un trou dans le pipeline, documenté des deux côtés
        </p>
        <div className="mx-auto mt-6 grid max-w-4xl gap-6 sm:grid-cols-3 sm:gap-4">
          {STATS.map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-[#E85D04] sm:text-4xl">{stat.value}</p>
              <p className="mx-auto mt-2 max-w-[14rem] text-sm leading-5 text-[#1A1510]/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problème */}
      <section id="probleme" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-14 sm:py-20">
        <h2 className="mx-auto max-w-xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Les deux côtés souffrent.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-7 text-[#1A1510]/65 sm:text-[17px] sm:leading-8">
          Ce n’est pas un détail de site. C’est un trou dans votre pipeline : le prospect part,
          l’équipe perd du temps, personne ne relance assez.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <ProblemCard
            title="Le prospect n’a nulle part où avancer"
            text="24 % des sites n’offrent même pas de demande. Sinon : formulaire vague, pas de parcours, pas de budget. Il passe au suivant."
          />
          <ProblemCard
            title="Vous préparez dans le vide"
            text="Des heures sur un devis, zéro retour. Ou un mail flou à décrypter. Le commercial découvre le besoin au téléphone au lieu de proposer."
          />
          <ProblemCard
            title="Le suivi n’existe pas"
            text="80 % des ventes demandent 5+ relances. 44 % s’arrêtent après une. Les bons dossiers meurent dans la boîte mail."
          />
        </div>
      </section>

      {/* Solution = ce qu’il faut mettre en place */}
      <section id="solution" className="scroll-mt-24 bg-white/70 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto max-w-xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Ce qu’il faut mettre en place.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-7 text-[#1A1510]/65 sm:text-[17px] sm:leading-8">
            Pas un catalogue de plus. Un système en deux temps : faire entrer un vrai devis,
            puis le faire avancer jusqu’à la vente.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <SolutionCard
              n="1"
              title="Un parcours de devis"
              text="Funnel, catalogue interactif ou chat IA, le prospect configure sur votre offre. Il envoie un dossier, pas un « bonjour »."
            />
            <SolutionCard
              n="2"
              title="Un dossier exploitable"
              text="Produits, contraintes, budget, score. Votre équipe rappelle pour conclure, pas pour reconstruire le besoin."
            />
            <SolutionCard
              n="3"
              title="Un autopilote de suivi"
              text="Confirmation, relances, rappel si non traité, assignation. Les 5 touches que personne n’a le temps de faire à la main."
            />
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-flex rounded-full bg-[#E85D04] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Installer QuoteBuilder
            </Link>
          </div>
        </div>
      </section>

      <section id="comment-ca-marche" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-14 sm:py-20">
        <h2 className="mx-auto max-w-xl text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Comment ça marche.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-7 text-[#1A1510]/65 sm:text-[17px] sm:leading-8">
          Quatre temps. Les deux premiers, d’autres outils les touchent. Les deux derniers changent
          la façon de vendre au devis.
        </p>
        <div className="mt-12 space-y-14 sm:mt-14 sm:space-y-16">
          {HOW_STEPS.map((step, i) => (
            <article
              key={step.title}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12 ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
            >
              <div>
                <p className="text-sm font-medium text-[#C45C26]">{step.n}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{step.title}</h3>
                <p className="mt-3 text-[16px] leading-7 text-[#1A1510]/70 sm:text-[17px] sm:leading-8">
                  {step.text}
                </p>
              </div>
              <div>{step.shot}</div>
            </article>
          ))}
        </div>
        <div id="demo" className="mt-14 scroll-mt-24 sm:mt-16">
          <p className="mb-3 text-center text-sm text-[#1A1510]/50">
            Simulation : offre, funnel, dossier, autopilote.
          </p>
          <ProductWalkthrough />
        </div>
      </section>

      <section className="bg-white/70 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Trois portes d’entrée.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-7 text-[#1A1510]/65">
            Même catalogue. Même pipeline. Seule l’expérience prospect change.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <ModeCard
              title="Catalogue"
              text="URL ou embed. Il parcourt, compose, demande, quand il sait déjà ce qu’il cherche."
            />
            <ModeCard
              title="Funnel guidé"
              text="Vos steps. Il cadre le projet avant les produits, pour l’achat technique."
            />
            <ModeCard
              title="Chat IA"
              text="Il décrit le besoin. L’IA pose les questions, propose vos produits, génère le dossier."
            />
          </div>
        </div>
      </section>

      <section id="autopilote" className="scroll-mt-24 bg-[#1A1510] px-6 py-14 text-[#F6F0E8] sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-[#F3B184]">Après la soumission</p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Les devis avancent tout seuls.
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-7 text-[#F6F0E8]/75 sm:text-[17px] sm:leading-8">
            C’est là que les formulaires s’arrêtent. QuoteBuilder enchaîne les relances que 92 %
            des équipes abandonnent avant la 4ᵉ, sans que vous traquiez chaque fil.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <CrmCard
              title="Pipeline + score"
              text="Nouveau → Contacté → En cours → Gagné / Perdu. Hot, warm, cold. Vous priorisez d’un coup d’œil."
            />
            <CrmCard
              title="Assignation"
              text="Une demande, un commercial. Notification, notes, historique."
            />
            <CrmCard
              title="Workflows"
              text="Confirmation T+0, relance abandon, rappel si non traité, branches score / statut."
            />
            <CrmCard
              title="Stats utiles"
              text="Volume, conversion, délai, CA potentiel. Abandons relançables à un clic."
            />
          </div>
        </div>
      </section>

      <section id="secteurs" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-14 sm:py-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Pour le sur-mesure.
        </h2>
        <div className="mt-8">
          <LandingSectors />
        </div>
      </section>

      <section id="tarifs" className="scroll-mt-24 bg-white/70 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Tarifs simples.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`flex flex-col rounded-2xl p-6 ${
                  plan.featured ? "bg-[#1A1510] text-white shadow-xl" : "bg-white ring-1 ring-black/8"
                }`}
              >
                <p className="text-sm font-medium">{plan.name}</p>
                {plan.featured ? <p className="mt-1 text-xs text-[#F3B184]">Le plus choisi</p> : null}
                <p className="mt-4 text-3xl font-semibold tracking-tight">
                  {plan.price}
                  {plan.period ? (
                    <span
                      className={`text-sm font-normal ${plan.featured ? "text-white/55" : "text-[#1A1510]/45"}`}
                    >
                      {plan.period}
                    </span>
                  ) : null}
                </p>
                <ul
                  className={`mt-6 space-y-2.5 text-sm ${plan.featured ? "text-white/75" : "text-[#1A1510]/70"}`}
                >
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
            10 premiers devis gratuits. Pas de carte bancaire.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl scroll-mt-24 px-6 py-14 sm:py-20" id="faq">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">FAQ</h2>
        <div className="mt-8 divide-y divide-[#1A1510]/10 border-y border-[#1A1510]/10">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none text-base font-semibold sm:text-lg [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span className="mt-1 text-[#1A1510]/35 group-open:hidden">+</span>
                  <span className="mt-1 hidden text-[#1A1510]/35 group-open:inline">–</span>
                </span>
              </summary>
              <p className="mt-3 text-[16px] leading-7 text-[#1A1510]/70 sm:text-[17px] sm:leading-8">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section id="cta" className="px-6 pb-16">
        <div className="mx-auto max-w-4xl rounded-[28px] bg-[#1A1510] px-8 py-12 text-center text-[#F6F0E8] sm:px-16 sm:py-14">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">
            Bouchez le trou. Maintenant.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-7 text-[#F6F0E8]/70">
            Parcours pour le prospect. Autopilote pour vous. Compte gratuit, pas de carte.
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
            <p className="font-medium text-[#1A1510]/70">QuoteBuilder · Devis qui aboutissent</p>
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
    <article className="rounded-2xl bg-white p-5 ring-1 ring-black/6 sm:p-6">
      <p className="text-sm font-medium text-[#C45C26]">✕</p>
      <h3 className="mt-3 text-base font-semibold sm:text-lg">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-[#1A1510]/70">{text}</p>
    </article>
  );
}

function SolutionCard({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <article className="rounded-2xl bg-white p-5 ring-1 ring-black/6 sm:p-6">
      <p className="text-sm font-medium text-[#C45C26]">{n}</p>
      <h3 className="mt-3 text-base font-semibold sm:text-lg">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-[#1A1510]/70">{text}</p>
    </article>
  );
}

function ModeCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl bg-white p-5 ring-1 ring-black/6 sm:p-6">
      <h3 className="text-base font-semibold sm:text-lg">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-[#1A1510]/70">{text}</p>
    </article>
  );
}

function CrmCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl bg-white/6 p-5 ring-1 ring-white/10">
      <h3 className="text-base font-semibold sm:text-lg">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-[#F6F0E8]/70">{text}</p>
    </article>
  );
}
