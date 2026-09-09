"use client";

export function replaceClientUrl(href: string) {
  if (typeof window === "undefined") return;
  const current = `${window.location.pathname}${window.location.search}`;
  if (current === href) return;
  window.history.replaceState(window.history.state, "", href);
}

export function LocalTabNav<T extends string>({
  items,
  active,
  onSelect,
  counts = {},
}: {
  items: readonly { id: T; label: string }[];
  active: T;
  onSelect: (id: T) => void;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <nav className="flex items-end gap-6 overflow-x-auto border-b border-slate-200 px-4 lg:px-6">
      {items.map((item) => {
        const on = item.id === active;
        const count = counts[item.id];
        return (
          <button
            key={item.id}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => onSelect(item.id)}
            className={`relative flex shrink-0 items-center gap-1.5 py-2.5 text-sm ${
              on ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {item.label}
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
          </button>
        );
      })}
    </nav>
  );
}

export function LocalPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: readonly { id: T; label: string; count?: number }[];
  active: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div className="mr-auto flex items-center gap-1">
      {items.map((item) => {
        const on = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm ${
              on ? "bg-orange-50 font-medium text-[#C2410C]" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
            {item.count !== undefined ? (
              <span className={`tabular-nums ${on ? "text-[#E85D04]" : "text-slate-400"}`}>{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
