import type { ReactNode } from "react";
import Link from "next/link";
import { paginationItems } from "@/lib/catalog/pagination";

export function ListPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`-mx-4 flex min-h-0 flex-1 flex-col bg-white lg:-mx-6 ${className}`}>
      {children}
    </div>
  );
}

export function ListToolbar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 border-b border-slate-200 px-4 py-2 lg:px-6">
      {children}
    </div>
  );
}

export function DataTable({
  headers,
  children,
}: {
  headers: ReactNode[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2 font-medium lg:px-6">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function ListPanelFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-2 text-xs text-slate-400 lg:px-6 ${className}`}>
      {children}
    </div>
  );
}

export function ListPagination({
  page,
  totalPages,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const items = paginationItems(page, totalPages);
  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <PageLink href={hrefForPage(page - 1)} disabled={page <= 1}>
        Précédent
      </PageLink>
      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1.5 text-slate-400">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefForPage(item)}
            aria-current={item === page ? "page" : undefined}
            className={`min-w-7 rounded-md px-2 py-1 text-center text-xs font-medium ${
              item === page
                ? "bg-orange-50 text-[#C2410C] ring-1 ring-orange-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {item}
          </Link>
        ),
      )}
      <PageLink href={hrefForPage(page + 1)} disabled={page >= totalPages}>
        Suivant
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="px-2 py-1 text-xs text-slate-300">{children}</span>;
  }
  return (
    <Link
      href={href}
      className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

export function ListAddRow({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 border-t border-dashed border-slate-200 px-4 py-3.5 text-left text-sm text-slate-500 hover:bg-orange-50/70 hover:text-[#C2410C] lg:px-6"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 text-[#E85D04] group-hover:border-[#E85D04] group-hover:bg-white">
        <span className="text-lg leading-none font-medium">+</span>
      </span>
      <span className="font-medium">{children}</span>
    </button>
  );
}
