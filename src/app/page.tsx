import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-full bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-400">SaaS B2B</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">QuoteBuilder</h1>
        <p className="mt-4 max-w-xl text-lg text-slate-300">
          Configurateur de devis intelligent — wizard guidé ou chat IA — pour qualifier
          un prospect en moins de 5 minutes.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/c/quickly/rayonnage"
            className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-amber-400"
          >
            Démo Quickly — rayonnage
          </Link>
          <Link
            href="/devis"
            className="rounded-lg border border-white/20 px-5 py-2.5 text-sm hover:bg-white/10"
          >
            Espace client
          </Link>
        </div>
      </div>
    </main>
  );
}
