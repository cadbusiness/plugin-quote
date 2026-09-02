export function ListPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col border-b border-slate-200 bg-white -mx-4 lg:-mx-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function ListToolbar({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-end gap-2 border-b border-slate-200 px-4 py-2.5 lg:px-6">
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
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 font-medium lg:px-6">
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
    <div className="mt-auto border-t border-slate-100 px-4 py-2 text-xs text-slate-500 lg:px-6">
      {children}
    </div>
  );
}
