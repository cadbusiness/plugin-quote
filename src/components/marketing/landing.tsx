import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

const STEPS = [
  {
    n: "01",
    title: "Capture",
    body: "Le prospect ouvre le configurateur sur votre site — wizard guidé ou chat IA — et répond en quelques minutes.",
  },
  {
    n: "02",
    title: "Qualifie",
    body: "Chaque réponse score la demande. Vous voyez tout de suite ce qui est chaud, tiède ou à relancer plus tard.",
  },
  {
    n: "03",
    title: "Convertit",
    body: "L’équipe reçoit un brief clair : besoin, budget, notes, statut. Plus de mails vagues à décoder.",
  },
];

const USES = [
  {
    title: "Configurateur de devis",
    body: "Un parcours à étapes pour chiffrer un projet sur mesure et capturer le contact en fin de flux.",
  },
  {
    title: "Qualification commerciale",
    body: "Score, statut, assignation. Le pipeline se remplit tout seul à chaque soumission.",
  },
  {
    title: "Relances automatiques",
    body: "T+0, T+24h, T+3j. Le prospect n’attend pas, le commercial n’oublie pas.",
  },
];

export function Landing() {
  return (
    <div className="min-h-dvh bg-[#F6F0E8] text-[#1A1510]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <BrandLogo variant="wordmark" href="/" priority />
        <div className="flex items-center gap-3">
          <Link href="/c/quickly/rayonnage" className="hidden text-sm font-medium text-[#1A1510]/70 hover:text-[#1A1510] sm:inline">
            Voir une démo
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[#1A1510] px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Connexion
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-8 pt-10 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-[#F3B184]/50 blur-3xl sm:h-[28rem] sm:w-[28rem]"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-[#C45C26]">Configurateur de devis B2B</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl sm:leading-[1.05]">
            Qualifiez vos prospects.
            <br />
            Sortez un devis.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#1A1510]/65">
            QuoteBuilder pose les questions, score la demande et livre un brief
            chiffré à l’équipe — wizard guidé ou intelligence artificielle.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/c/quickly/rayonnage"
              className="rounded-full bg-[#E85D04] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d35400]"
            >
              Essayer le configurateur
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A1510] shadow-sm ring-1 ring-black/5 hover:bg-[#FFF8F1]"
            >
              Espace client
            </Link>
          </div>
          <p className="mt-5 text-sm text-[#1A1510]/45">
            Sans carte. Accès test inclus à la connexion.
          </p>
        </div>
        <div className="relative mx-auto mt-12 max-w-5xl">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-30px_rgba(80,40,10,0.35)] ring-1 ring-black/5">
            <Image
              src="/marketing/landing-hero.jpg"
              alt="Parcours de qualification QuoteBuilder"
              width={1800}
              height={1012}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-center text-sm font-medium text-[#C45C26]">Du premier clic au brief commercial</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Guidez chaque visiteur jusqu’à une demande qualifiée.
        </h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#E85D04]">{step.n}</p>
              <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#1A1510]/60">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#1A1510] px-6 py-20 text-[#F6F0E8]">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Un outil, du configurateur au pipeline.
          </h2>
          <p className="mt-4 max-w-xl text-[#F6F0E8]/65">
            Pas un formulaire jetable. QuoteBuilder garde le fil : réponses, score,
            notes, relances, équipe.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {USES.map((item) => (
              <div key={item.title} className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#F6F0E8]/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-[32px] bg-[#E85D04] px-8 py-14 text-center text-white sm:px-16">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Voyez le parcours d’un prospect, de bout en bout.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">
            Démo publique en 2 minutes, ou connexion avec un accès test pour le
            pipeline.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/c/quickly/rayonnage"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#E85D04] hover:bg-[#FFF4EC]"
            >
              Lancer la démo
            </Link>
            <Link
              href="/login"
              className="rounded-full px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/10"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1A1510]/10 px-6 py-8 text-center text-sm text-[#1A1510]/45">
        QuoteBuilder — devis intelligents pour équipes commerciales
      </footer>
    </div>
  );
}
