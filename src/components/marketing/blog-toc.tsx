"use client";

import { useEffect, useState } from "react";
import { BLOG_UI } from "@/lib/marketing/blog";

export type TocHeading = { id: string; text: string };

function TocLinks({
  headings,
  activeId,
  onNavigate,
}: {
  headings: TocHeading[];
  activeId: string;
  onNavigate?: () => void;
}) {
  return (
    <ol className="space-y-2.5">
      {headings.map((heading) => {
        const active = heading.id === activeId;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={onNavigate}
              className={`block text-[13px] leading-5 transition ${
                active
                  ? "font-semibold text-[#E85D04]"
                  : "text-[#1A1510]/50 hover:text-[#1A1510]"
              }`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function BlogToc({
  headings,
  variant,
}: {
  headings: TocHeading[];
  variant: "mobile" | "desktop";
}) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;
    const nodes = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((node): node is HTMLElement => !!node);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.id;
        if (id) setActiveId(id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  if (variant === "mobile") {
    return (
      <details className="group mb-8 rounded-[20px] bg-white px-4 py-3 ring-1 ring-black/6 lg:hidden">
        <summary className="cursor-pointer list-none text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            {BLOG_UI.toc}
            <span className="text-[#1A1510]/30 group-open:hidden">+</span>
            <span className="hidden text-[#1A1510]/30 group-open:inline">–</span>
          </span>
        </summary>
        <nav className="mt-3 border-t border-[#1A1510]/8 pt-3" aria-label={BLOG_UI.toc}>
          <TocLinks headings={headings} activeId={activeId} />
        </nav>
      </details>
    );
  }

  return (
    <nav
      className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto"
      aria-label={BLOG_UI.toc}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C45C26]">
        {BLOG_UI.toc}
      </p>
      <div className="mt-4">
        <TocLinks headings={headings} activeId={activeId} />
      </div>
    </nav>
  );
}
