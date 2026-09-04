"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CircleHelp,
  Clock,
  House,
  Inbox,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  Settings,
  Shield,
  Store,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/app/(app)/actions";
import { BrandLogo } from "@/components/brand/brand-logo";
import type { SidebarSnapshot } from "@/lib/crm/sidebar";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  admin?: boolean;
};

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Acquisition",
    items: [
      { href: "/accueil", label: "Accueil", icon: House, exact: true },
      { href: "/funnels", label: "Funnels", icon: PanelsTopLeft, admin: true },
      { href: "/produits", label: "Catalogue", icon: Package, admin: true },
      { href: "/integrations", label: "Boutiques", icon: Store, admin: true },
    ],
  },
  {
    label: "Commercial",
    items: [
      { href: "/devis", label: "Demandes", icon: Inbox },
      { href: "/sessions", label: "Abandons", icon: Clock, exact: true },
      { href: "/automations", label: "Automatisations", icon: Zap, exact: true, admin: true },
    ],
  },
  {
    label: "Pilotage",
    items: [
      { href: "/stats", label: "Statistiques", icon: BarChart3, exact: true },
      { href: "/equipe", label: "Équipe", icon: Users, exact: true, admin: true },
    ],
  },
];

function isActive(pathname: string, item: Item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function persistCollapsed(collapsed: boolean) {
  document.cookie = `qb-sidebar=${collapsed ? "1" : "0"}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function AppSidebar({
  isAdmin,
  isPlatformAdmin = false,
  email,
  snapshot,
  collapsed: initialCollapsed = false,
}: {
  isAdmin: boolean;
  isPlatformAdmin?: boolean;
  email: string | null;
  snapshot: SidebarSnapshot;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const display = email?.split("@")[0] ?? "Compte";

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    persistCollapsed(next);
  }

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-56 lg:w-60"
      }`}
    >
      <div className={`flex h-14 shrink-0 items-center border-b border-slate-200 ${collapsed ? "justify-center" : "justify-between px-3"}`}>
        <BrandLogo href="/accueil" variant={collapsed ? "mark" : "wordmark"} priority />
        {collapsed ? null : (
          <button
            type="button"
            onClick={toggle}
            aria-expanded
            aria-label="Réduire le menu"
            title="Réduire le menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-orange-50 hover:text-[#E85D04]"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-2" aria-label="Navigation">
        {isPlatformAdmin ? (
          <Link
            href="/admin"
            title="Super admin"
            className={`mb-2 flex items-center rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${
              collapsed ? "justify-center px-0" : "gap-2.5 px-2.5"
            }`}
          >
            <Shield className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            {collapsed ? <span className="sr-only">Super admin</span> : "Super admin"}
          </Link>
        ) : null}

        {GROUPS.map((group) => {
          const items = group.items.filter((item) => !item.admin || isAdmin);
          if (!items.length) return null;
          return (
            <div key={group.label} className={collapsed ? "mb-1" : "mb-3"}>
              {collapsed ? (
                group.label === "Acquisition" ? null : <div className="mx-3 my-1 border-t border-slate-100" aria-hidden />
              ) : (
                <p className="px-2.5 pb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const active = isActive(pathname, item);
                  const badge =
                    item.href === "/devis" ? snapshot.newQuotes : item.href === "/sessions" ? snapshot.abandons : 0;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch
                      title={collapsed ? item.label : undefined}
                      className={`relative flex items-center rounded-lg text-sm transition-colors ${
                        collapsed ? "justify-center px-0 py-2" : "justify-between gap-2 px-2.5 py-1.5"
                      } ${
                        active
                          ? "bg-orange-50 font-medium text-[#C2410C] before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-[#E85D04]"
                          : "text-slate-600 hover:bg-orange-50/50 hover:text-slate-900"
                      }`}
                    >
                      <span className={`flex items-center ${collapsed ? "" : "gap-2.5"}`}>
                        <span className="relative">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${active ? "text-[#E85D04]" : "text-slate-500"}`}
                            aria-hidden
                          />
                          {collapsed && badge > 0 ? (
                            <span
                              className={`absolute -right-1.5 -top-1.5 min-w-3.5 rounded-full px-1 text-[9px] font-medium leading-4 ${
                                item.href === "/sessions" ? "bg-amber-100 text-amber-800" : "bg-slate-900 text-white"
                              }`}
                            >
                              {badge}
                            </span>
                          ) : null}
                        </span>
                        {collapsed ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
                      </span>
                      {!collapsed && badge > 0 ? (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            item.href === "/sessions" ? "bg-amber-50 text-amber-700" : "bg-slate-900 text-white"
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

      <div className={`border-t border-orange-100 bg-[#FFF6EE] ${collapsed ? "px-1.5 py-2" : "px-2 py-2.5"}`}>
        {collapsed ? null : (
          <>
            <p className="px-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#C2410C]/70">Ce mois-ci</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <Link href="/devis" className="rounded-lg bg-white px-1.5 py-2 text-center ring-1 ring-orange-100 hover:ring-orange-200">
                <span className="block text-sm font-semibold text-slate-900">{snapshot.monthQuotes}</span>
                <span className="block text-[10px] text-slate-500">Demandes</span>
              </Link>
              <Link href="/devis?score=hot" className="rounded-lg bg-rose-50 px-1.5 py-2 text-center ring-1 ring-rose-100 hover:ring-rose-200">
                <span className="block text-sm font-semibold text-rose-700">{snapshot.monthHot}</span>
                <span className="block text-[10px] text-rose-600">Hot</span>
              </Link>
              <Link href="/sessions" className="rounded-lg bg-amber-50 px-1.5 py-2 text-center ring-1 ring-amber-100 hover:ring-amber-200">
                <span className="block text-sm font-semibold text-amber-800">{snapshot.abandons}</span>
                <span className="block text-[10px] text-amber-700">Abandons</span>
              </Link>
            </div>
          </>
        )}

        <div className={`flex flex-col gap-0.5 ${collapsed ? "items-center" : "mt-2"}`}>
          {collapsed ? (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={false}
              aria-label="Ouvrir le menu"
              title="Ouvrir le menu"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-[#E85D04]"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          ) : null}
          <Link
            href="/parametres"
            title="Paramètres"
            className={`flex items-center rounded-lg py-1.5 text-sm ${
              collapsed ? "justify-center px-2" : "gap-2 px-2"
            } ${
              pathname.startsWith("/parametres") || pathname.startsWith("/webhooks") || pathname.startsWith("/templates")
                ? "bg-white font-medium text-[#C2410C] ring-1 ring-orange-200"
                : "text-slate-700 hover:bg-white/80"
            }`}
          >
            <Settings className="h-3.5 w-3.5 shrink-0 text-[#E85D04]" aria-hidden />
            {collapsed ? <span className="sr-only">Paramètres</span> : "Paramètres"}
          </Link>
          <a
            href="mailto:hello@quotebuilder.app"
            title="Aide"
            className={`flex items-center rounded-lg py-1.5 text-sm text-slate-700 hover:bg-white/80 ${
              collapsed ? "justify-center px-2" : "gap-2 px-2"
            }`}
          >
            <CircleHelp className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
            {collapsed ? <span className="sr-only">Aide</span> : "Aide"}
          </a>
        </div>

        {collapsed ? (
          <div className="mt-2 flex flex-col items-center gap-1">
            <span
              title={display}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E85D04] text-xs font-semibold text-white"
            >
              {(display[0] ?? "Q").toUpperCase()}
            </span>
            <form action={logout}>
              <button
                type="submit"
                title="Sortir"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-700 hover:bg-rose-50"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">Sortir</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-2 rounded-xl bg-white p-2.5 ring-1 ring-orange-100">
            <div className="flex items-center gap-2.5">
              <span
                title={display}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E85D04] text-xs font-semibold text-white"
              >
                {(display[0] ?? "Q").toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{display}</p>
                <p className="truncate text-[11px] text-slate-500">{email}</p>
              </div>
            </div>
            <form action={logout} className="mt-2">
              <button
                type="submit"
                title="Sortir"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-2 py-1.5 text-xs font-medium text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Sortir
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
