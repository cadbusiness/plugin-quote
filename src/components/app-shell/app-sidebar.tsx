"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/devis", label: "Devis" },
  { href: "/wizard", label: "Wizard" },
  { href: "/produits", label: "Produits" },
  { href: "/templates", label: "Templates" },
  { href: "/webhooks", label: "Webhooks" },
];

export function AppSidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-slate-200 bg-white lg:w-56">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-[11px] uppercase tracking-wide text-amber-600">QuoteBuilder</p>
        <p className="mt-0.5 truncate text-sm font-medium">{orgName}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3" aria-label="Navigation">
        {NAV.map((item) => {
          const active =
            item.href === "/devis"
              ? pathname === "/devis" || pathname.startsWith("/devis/")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm ${
                active ? "bg-slate-100 font-medium text-slate-950" : "text-slate-700 hover:bg-slate-50"
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
