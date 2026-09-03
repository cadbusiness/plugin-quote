"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; exact: boolean; admin?: boolean };

const NAV: Item[] = [
  { href: "/funnels", label: "Funnels", exact: false, admin: true },
  { href: "/produits", label: "Catalogue", exact: true, admin: true },
  { href: "/devis", label: "Pipeline", exact: false },
  { href: "/sessions", label: "Abandons", exact: true },
  { href: "/automations", label: "Automatisations", exact: true, admin: true },
  { href: "/stats", label: "Statistiques", exact: true },
  { href: "/equipe", label: "Équipe", exact: true, admin: true },
  { href: "/templates", label: "Emails", exact: true, admin: true },
  { href: "/webhooks", label: "Webhooks", exact: true, admin: true },
];

export function AppSidebar({ isAdmin, isPlatformAdmin = false }: { isAdmin: boolean; isPlatformAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-slate-200 bg-white lg:w-56">
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3" aria-label="Navigation">
        {isPlatformAdmin ? (
          <Link
            href="/admin"
            className="flex items-center rounded-lg px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Super admin
          </Link>
        ) : null}
        {NAV.filter((item) => !item.admin || isAdmin).map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={`relative flex items-center rounded-lg px-2.5 py-2 text-sm transition-colors ${
                active
                  ? "bg-slate-100 font-medium text-slate-900 before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
