"use client";

import { useState } from "react";

export function CopyBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="border-b border-slate-100 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-md px-2 py-1 text-xs font-medium text-[#C2410C] hover:bg-orange-50"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-md bg-slate-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-600 ring-1 ring-slate-200">
        {value}
      </pre>
    </div>
  );
}
