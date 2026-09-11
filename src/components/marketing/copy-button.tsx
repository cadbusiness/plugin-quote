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
      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1510] ring-1 ring-black/8 hover:bg-[#FFF8F1]"
    >
      {done ? "Copié" : label}
    </button>
  );
}
