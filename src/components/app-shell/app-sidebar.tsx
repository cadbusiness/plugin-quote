"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(app)/actions";
import type { SidebarSnapshot } from "@/lib/crm/sidebar";

type Item = {
  href: string;
  label: string;
  exact?: boolean;
  admin?: boolean;
  badge?: number;
  badgeHot?: boolean;
};

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Acquisition",
    items: [
      { href: "/accueil", label: "Accueil", exact: true },
      { href: "/funnels", label: "Funnels", admin: true },
      { href: "/produits", label: "Catalogue", exact: true, admin: true },
    ],
  },
  {
    label: "Commercial",
    items: [
      { href: "/devis", label: "Demandes" },
      { href: "/sessions", label: "Abandons", exact: true },
      { href: "/automations", label: "Automatisations", exact: true, admin: true },
    ],
  },
  {
    label: "Pilotage",
    items: [
      { href: "/stats", label: "Statistiques", exact: true },
      { href: "/equipe", label: "Équipe", exact: true, admin: true },
    ],
  },
];

function isActive(pathname: string, item: Item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppSidebar({
  isAdmin,
  isPlatformAdmin = false,
  email,
  snapshot,
}: {
  isAdmin: boolean;
  isPlatformAdmin?: boolean;
  email: string | null;
  snapshot: SidebarSnapshot;
}) {
  const pathname = usePathname();
  const display = email?.split("@")[0] ?? "Compte";

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white lg:w-60">
      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-3" aria-label="Navigation">
        {isPlatformAdmin ? (
          <Link
            href="/admin"
            className="mb-2 rounded-lg px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Super admin
          </Link>
        ) : null}

        {GROUPS.map((group) => {
          const items = group.items.filter((item) => !item.admin || isAdmin);
          if (!items.length) return null;
          return (
            <div key={group.label} className="mb-3">
              <p className="px-2.5 pb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const active = isActive(pathname, item);
                  const badge =
                    item.href === "/devis"
                      ? snapshot.newQuotes
                      : item.href === "/sessions"
                        ? snapshot.abandons
                        : 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch
                      className={`relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-orange-50 font-medium text-[#C2410C] before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-[#E85D04]"
                          : "text-slate-600 hover:bg-orange-50/50 hover:text-slate-900"
                      }`}
                    >
                      <span>{item.label}</span>
                      {badge > 0 ? (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            item.href === "/sessions"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-900 text-white"
                          }`}
                        >
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-3 py-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Ce mois-ci</p>
        <p className="mt-1.5 text-xs text-slate-600">{snapshot.monthQuotes} demandes</p>
        <p className="text-xs text-slate-600">
          <span className="text-rose-600">{snapshot.monthHot} hot</span>
          {" · "}
          <span className="text-amber-700">{snapshot.abandons} abandons</span>
        </p>
      </div>

      <div className="border-t border-slate-200 px-2 py-2">
        <Link
          href="/parametres"
          className={`flex items-center rounded-lg px-2.5 py-1.5 text-sm ${
            pathname.startsWith("/parametres") || pathname.startsWith("/webhooks") || pathname.startsWith("/woocommerce") || pathname.startsWith("/templates")
              ? "bg-orange-50 font-medium text-[#C2410C]"
              : "text-slate-600 hover:bg-orange-50/50 hover:text-slate-900"
          }`}
        >
          Paramètres
        </Link>
        <a
          href="mailto:hello@quotebuilder.app"
          className="flex items-center rounded-lg px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          Aide
        </a>
      </div>

      <div className="border-t border-slate-200 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{display}</p>
            <p className="truncate text-[11px] text-slate-500">{email}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="text-[11px] text-slate-500 hover:text-slate-900">
              Sortir
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
