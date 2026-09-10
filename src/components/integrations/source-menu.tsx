"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export function SourceMenu({
  items,
}: {
  items: { href: string; label: string; external?: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label="Plus d’actions"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-700"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 min-w-40 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="block px-3 py-1.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#C2410C]"
            >
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
