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
    <nav className="flex items-center gap-4 border-b border-slate-200 px-4 lg:px-6">
      {TABS.map((tab) => {
        const on = tab.id === active;
        const count = counts[tab.id];
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={on ? "page" : undefined}
            className={`-mb-px border-b-2 py-2.5 text-sm ${
              on
                ? "border-[#E85D04] font-medium text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
            {count !== undefined ? (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                  on ? "bg-orange-50 text-[#C2410C]" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
