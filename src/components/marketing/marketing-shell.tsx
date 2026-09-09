"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";

const NAV = [
  { href: "/fonctionnalites", label: "Fonctionnalités" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/secteurs", label: "Secteurs" },
  { href: "/tarifs", label: "Tarifs" },
] as const;

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[#F6F0E8] text-[#1A1510]">
      <header className="sticky top-0 z-20 border-b border-[#1A1510]/8 bg-[#F6F0E8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <BrandLogo variant="wordmark" href="/" priority />
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#1A1510]/70 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "text-[#1A1510]"
                    : "hover:text-[#1A1510]"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-[#1A1510]/70 hover:text-[#1A1510] sm:inline"
            >
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
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "text-[#1A1510]"
                  : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {children}

      <footer className="border-t border-[#1A1510]/10 px-6 py-10 text-sm text-[#1A1510]/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="font-medium text-[#1A1510]/70">QuoteBuilder · Devis qui aboutissent</p>
            <p className="mt-1">© {new Date().getFullYear()} Vinci Liberta LTD · Dublin, Irlande</p>
          </div>
          <div className="flex flex-col gap-4 sm:items-end">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/" className="hover:text-[#1A1510]">
                Accueil
              </Link>
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-[#1A1510]">
                  {item.label}
                </Link>
              ))}
              <Link href="/login" className="hover:text-[#1A1510]">
                Connexion
              </Link>
            </div>
            <p className="text-[#1A1510]/35">CGU · Politique de confidentialité</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function MarketingCta({
  title = "Bouchez le trou. Maintenant.",
  text = "Parcours pour le prospect. Autopilote pour vous. Compte gratuit, pas de carte.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="px-6 pb-16 pt-6">
      <div className="mx-auto max-w-4xl rounded-[28px] bg-[#1A1510] px-8 py-12 text-center text-[#F6F0E8] sm:px-16 sm:py-14">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-7 text-[#F6F0E8]/70">{text}</p>
        <Link
          href="/signup"
          className="mt-8 inline-flex rounded-full bg-[#E85D04] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d35400]"
        >
          Commencer gratuitement
        </Link>
      </div>
    </section>
  );
}
