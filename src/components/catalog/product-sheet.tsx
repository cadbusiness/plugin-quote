import { defaultSheetLabel, sheetIsEmpty, type ProductSheet } from "@/lib/catalog/sheet";

export function ProductSheetLinks({
  sheet,
  compact = false,
}: {
  sheet?: ProductSheet | null;
  compact?: boolean;
}) {
  if (!sheet || sheetIsEmpty(sheet)) return null;
  const text = sheet.manualText.trim();
  const documents = sheet.documents;

  if (compact) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {documents.map((doc) => (
          <a
            key={`${doc.role}:${doc.src}`}
            href={doc.src}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[#E85D04] underline"
          >
            {doc.label || defaultSheetLabel(doc.role)}
          </a>
        ))}
        {text ? (
          <details className="basis-full">
            <summary className="cursor-pointer font-medium text-[#E85D04]">Mode d’emploi</summary>
            <p className="mt-1 whitespace-pre-wrap text-slate-600">{text}</p>
          </details>
        ) : null}
      </div>
    );
  }

  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer font-medium text-slate-800">Mode d’emploi</summary>
      {text ? <p className="mt-2 whitespace-pre-wrap text-slate-700">{text}</p> : null}
      {documents.length ? (
        <ul className="mt-2 space-y-1">
          {documents.map((doc) => (
            <li key={`${doc.role}:${doc.src}`}>
              <a href={doc.src} target="_blank" rel="noreferrer" className="font-medium text-[#E85D04] underline">
                {doc.label || defaultSheetLabel(doc.role)}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}
