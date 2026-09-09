"use client";

import { useRouter } from "next/navigation";

export function ClickableRow({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  function prefetch() {
    router.prefetch(href);
  }

  function go(event: { target: EventTarget | null; metaKey?: boolean; ctrlKey?: boolean; button?: number }) {
    const el = event.target as HTMLElement | null;
    if (el?.closest("a, button, input, select, textarea, label")) return;
    if (event.metaKey || event.ctrlKey || event.button === 1) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(href);
  }

  return (
    <tr
      role="link"
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
          router.push(href);
        }
      }}
    >
      {children}
    </tr>
  );
}
