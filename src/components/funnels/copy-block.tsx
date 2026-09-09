"use client";

import { useState } from "react";

export function CopyBlock({
  label,
  value,
  hint,
  compact,
}: {
  label: string;
  value: string;
  hint?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={compact ? "" : "border-b border-slate-100 px-4 py-4 lg:px-6"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {hint ? <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-[#C2410C] hover:bg-orange-50"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <p className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-slate-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-600 ring-1 ring-slate-200">
        {value}
      </p>
    </div>
  );
}
