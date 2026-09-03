"use client";

import { useState, useTransition } from "react";
import { syncConnection } from "@/app/(app)/integrations/actions";

export function SyncButton({
  connectionId,
  label = "Synchroniser",
}: {
  connectionId: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "ko"; text: string } | null>(null);

  function run() {
    setMessage(null);
    startTransition(async () => {
      const result = await syncConnection(connectionId);
      if ("error" in result && result.error) {
        setMessage({ tone: "ko", text: result.error });
        return;
      }
      const r = result as { created: number; updated: number; skipped: number; archived: number };
      setMessage({
        tone: "ok",
        text: `${r.created} ajoutés · ${r.updated} mis à jour · ${r.skipped} inchangés${
          r.archived ? ` · ${r.archived} retirés` : ""
        }`,
      });
    });
  }

  return (
    <span className="flex items-center gap-2">
      {message ? (
        <span className={`text-xs ${message.tone === "ok" ? "text-emerald-700" : "text-rose-700"}`}>
          {message.text}
        </span>
      ) : null}
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Synchronisation…" : label}
      </button>
    </span>
  );
}
