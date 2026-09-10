"use client";

import { useState, useTransition } from "react";
import { createPairingCode } from "@/app/(app)/integrations/actions";

export function PairingActions({
  configuratorId,
  pluginVersion,
}: {
  configuratorId: string | null;
  pluginVersion: string;
}) {
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState<string | null>(null);

  function generate() {
    startTransition(async () => {
      const result = await createPairingCode(configuratorId);
      setCode(result.code);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <a
        href={`/api/public/plugin/wordpress/download?v=${encodeURIComponent(pluginVersion)}`}
        className="text-sm font-medium text-[#C2410C] hover:underline"
      >
        Plugin WordPress v{pluginVersion}
      </a>
      {code ? (
        <span className="rounded-md bg-white px-2.5 py-1 font-mono text-sm font-semibold tracking-widest text-[#C2410C] ring-1 ring-orange-200">
          {code}
        </span>
      ) : null}
      <button type="button" onClick={generate} disabled={pending} className="text-sm text-slate-500 hover:text-slate-900 disabled:opacity-50">
        {pending ? "Génération…" : code ? "Nouveau code" : "Code manuel"}
      </button>
      {code ? (
        <p className="w-full text-xs text-slate-500">Valable 30 minutes. Uniquement si la connexion en un clic n’est pas possible.</p>
      ) : null}
    </div>
  );
}
