"use client";

import { useState } from "react";

export function ApiKeyCreatedBanner({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 lg:px-6">
      <p className="font-medium">Clé API créée — copiez-la maintenant, elle ne sera plus affichée.</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="rounded bg-white px-2 py-1 font-mono text-xs text-slate-800">{token}</code>
        <button
          type="button"
          className="rounded-md bg-[#E85D04] px-3 py-1.5 text-xs font-medium text-white"
          onClick={async () => {
            await navigator.clipboard.writeText(token);
            setCopied(true);
          }}
        >
          {copied ? "Copiée" : "Copier"}
        </button>
      </div>
    </div>
  );
}
