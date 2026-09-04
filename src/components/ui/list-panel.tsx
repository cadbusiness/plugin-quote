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
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 font-medium lg:px-6">
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

export function ListPanelFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-auto border-t border-slate-100 px-4 py-2 text-xs text-slate-400 lg:px-6">
      {children}
    </div>
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
