import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function HomePage() {
  return (
    <main className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <BrandLogo variant="lockup" priority />
        </div>
        <p className="mt-8 max-w-xl text-lg text-slate-600">
          Configurateur de devis intelligent — wizard guidé ou chat IA — pour qualifier
          un prospect en moins de 5 minutes.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/c/quickly/rayonnage"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Démo Quickly — rayonnage
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm hover:bg-slate-100"
          >
            Espace client
          </Link>
        </div>
      </div>
    </main>
  );
}
