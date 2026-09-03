import Link from "next/link";

const TABS = [
  { id: "produits", href: "/produits", label: "Produits" },
  { id: "regles", href: "/produits/regles", label: "Règles" },
] as const;

export function CatalogTabs({
  active,
  counts = {},
}: {
  active: (typeof TABS)[number]["id"];
  counts?: Partial<Record<(typeof TABS)[number]["id"], number>>;
}) {
  return (
    <nav className="flex items-end gap-6 overflow-x-auto border-b border-slate-200 px-4 lg:px-6">
      {TABS.map((tab) => {
        const on = tab.id === active;
        const count = counts[tab.id];
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={on ? "page" : undefined}
            className={`relative flex shrink-0 items-center gap-1.5 py-2.5 text-sm ${
              on ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
            {count !== undefined ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                  on ? "bg-orange-50 text-[#C2410C]" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            ) : null}
            <span
              aria-hidden
              className={`absolute inset-x-0 -bottom-px h-0.5 ${on ? "bg-[#E85D04]" : "bg-transparent"}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
