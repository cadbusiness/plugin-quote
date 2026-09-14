"use client";

import { useRouter } from "next/navigation";

export function ClickableRow({
  href,
  onSelect,
  children,
  className = "",
}: {
  href?: string;
  onSelect?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  function prefetch() {
    if (href) router.prefetch(href);
  }

  function go(event: { target: EventTarget | null; metaKey?: boolean; ctrlKey?: boolean; button?: number }) {
    const el = event.target as HTMLElement | null;
    if (el?.closest("a, button, input, select, textarea, label")) return;
    if (href && (event.metaKey || event.ctrlKey || event.button === 1)) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    if (onSelect) {
      onSelect();
      return;
    }
    if (href) router.push(href);
  }

  return (
    <tr
      role={href ? "link" : "button"}
      tabIndex={0}
      className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-orange-50/70 ${className}`}
      onPointerEnter={prefetch}
      onFocus={prefetch}
      onClick={(event) => go(event)}
      onAuxClick={(event) => {
        if (event.button === 1) {
          event.preventDefault();
          go(event);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (onSelect) onSelect();
          else if (href) router.push(href);
        }
      }}
    >
      {children}
    </tr>
  );
}
