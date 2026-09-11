"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } catch {
      setDone(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-mk-ink ring-1 ring-mk-border hover:bg-mk-band"
    >
      {done ? "Copié" : label}
    </button>
  );
}
