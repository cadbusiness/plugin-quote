"use client";

import { useState } from "react";

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-800">{value}</code>
      <button
        type="button"
        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        }}
      >
        {copied ? "Copié" : label}
      </button>
    </div>
  );
}
