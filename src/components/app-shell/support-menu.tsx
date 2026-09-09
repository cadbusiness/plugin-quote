"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpen, LifeBuoy, Mail, Webhook } from "lucide-react";

export function SupportMenu({
  collapsed,
  isAdmin,
}: {
  collapsed: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = root.current?.getBoundingClientRect();
    if (rect) setPos({ bottom: window.innerHeight - rect.top + 6, left: rect.left });
    setOpen(true);
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={toggle}
        title="Support"
        aria-expanded={open}
        className={`flex w-full items-center rounded-lg py-1.5 text-sm ${
          collapsed ? "justify-center px-2" : "gap-2 px-2.5"
        } ${
          open
            ? "bg-orange-50 font-medium text-[#C2410C]"
            : "text-slate-600 hover:bg-orange-50/50 hover:text-slate-900"
        }`}
      >
        <LifeBuoy className={`h-3.5 w-3.5 shrink-0 ${open ? "text-[#E85D04]" : "text-slate-500"}`} aria-hidden />
        {collapsed ? <span className="sr-only">Support</span> : "Support"}
      </button>
      {open ? (
        <div
          className="fixed z-50 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-sm"
          style={{ bottom: pos?.bottom ?? 72, left: pos?.left ?? 8 }}
        >
          <a
            href="mailto:hello@quotebuilder.app?subject=Aide%20QuoteBuilder"
            className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-orange-50"
            onClick={() => setOpen(false)}
          >
            <Mail className="h-4 w-4 text-[#E85D04]" aria-hidden />
            Écrire au support
          </a>
          <a
            href="mailto:hello@quotebuilder.app?subject=Onboarding%20QuoteBuilder"
            className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-orange-50"
            onClick={() => setOpen(false)}
          >
            <LifeBuoy className="h-4 w-4 text-[#E85D04]" aria-hidden />
            Onboarding & formation
          </a>
          {isAdmin ? (
            <Link
              href="/templates"
              className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-orange-50"
              onClick={() => setOpen(false)}
            >
              <BookOpen className="h-4 w-4 text-[#E85D04]" aria-hidden />
              Guides emails & PDF
            </Link>
          ) : null}
          {isAdmin ? (
            <Link
              href="/webhooks"
              className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-orange-50"
              onClick={() => setOpen(false)}
            >
              <Webhook className="h-4 w-4 text-[#E85D04]" aria-hidden />
              API & webhooks
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
