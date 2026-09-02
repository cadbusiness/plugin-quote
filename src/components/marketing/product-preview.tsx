const ROWS = [
  { name: "Claire Martin", company: "Atelier Nord", score: "Hot", status: "Nouveau" },
  { name: "Thomas Berger", company: "LogiSpace", score: "Warm", status: "Contacté" },
  { name: "Léa Moreau", company: "Hôtel Rivage", score: "Hot", status: "En cours" },
];

export function ProductPreview() {
  return (
    <div
      aria-hidden
      className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-white/95 shadow-2xl shadow-slate-950/40 backdrop-blur"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="text-xs font-semibold tracking-tight text-slate-900">Pipeline devis</span>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-white">
          12 ouverts
        </span>
      </div>
      <table className="w-full text-left text-[11px]">
        <thead className="text-[10px] uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-2 font-medium">Prospect</th>
            <th className="px-2 py-2 font-medium">Score</th>
            <th className="px-4 py-2 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {ROWS.map((row) => (
            <tr key={row.name} className="border-t border-slate-100">
              <td className="px-4 py-2.5">
                <div className="font-medium text-slate-900">{row.name}</div>
                <div className="text-slate-500">{row.company}</div>
              </td>
              <td className="px-2 py-2.5">
                <span
                  className={
                    row.score === "Hot" ? "font-medium text-amber-700" : "text-slate-500"
                  }
                >
                  {row.score}
                </span>
              </td>
              <td className="px-4 py-2.5 text-slate-500">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
