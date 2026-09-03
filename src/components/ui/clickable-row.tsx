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

  function go(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (el?.closest("a, button, input, select, textarea, label")) return;
    router.push(href);
  }

  return (
    <tr
      role="link"
      tabIndex={0}
      className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-orange-50/70 ${className}`}
      onClick={(event) => go(event.target)}
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
