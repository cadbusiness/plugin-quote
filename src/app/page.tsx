import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

const POINTS = [
  {
    title: "Le prospect se configure tout seul",
    body: "Wizard guidé ou chat IA. Les bonnes questions, un brief chiffré, en moins de cinq minutes.",
  },
  {
    title: "L’équipe reçoit un dossier prêt",
    body: "Score, statut, notes, relances. Plus de demandes vagues dans la boîte mail.",
  },
  {
    title: "Sur votre site, à vos couleurs",
    body: "Page publique, embed ou widget. Vous qualifiez avant le premier appel.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-slate-900">
      <header className="flex items-center justify-between px-6 py-5 lg:px-10">
        <BrandLogo variant="wordmark" href="/" priority />
        <Link
          href="/login"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          Connexion
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16 lg:px-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Devis B2B
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1]">
          Qualifiez un prospect.
          <br />
          Sortez un devis.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
          QuoteBuilder pose les questions à votre place et livre un brief clair à
          l’équipe commerciale — wizard ou intelligence artificielle.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/c/quickly/rayonnage"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Voir le configurateur
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Espace client
          </Link>
        </div>
      </main>

      <section className="border-t border-slate-100">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 sm:grid-cols-3 lg:px-10">
          {POINTS.map((point) => (
            <div key={point.title}>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                {point.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{point.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
