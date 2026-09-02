import Image from "next/image";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ProductPreview } from "@/components/marketing/product-preview";

export function AuthSplit({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-2">
      <section className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <BrandLogo variant="wordmark" href="/" className="h-8" priority />
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          {children}
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-slate-950 lg:block">
        <Image
          src="/marketing/login-panel.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/20" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <p className="max-w-sm text-sm font-medium tracking-wide text-white/70">
            Logiciel de devis pour équipes commerciales
          </p>
          <div className="space-y-8">
            <ProductPreview />
            <div>
              <p className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
                Un brief clair. Un pipeline propre. Moins de relances à vide.
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
                Le configurateur qualifie le prospect. QuoteBuilder livre le dossier à
                l’équipe — statut, score, notes, relances.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
