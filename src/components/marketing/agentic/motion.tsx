"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** Fires once when the element enters the viewport. */
export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, inView]);

  return { ref, inView };
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "p" | "h2";
}) {
  const { ref, inView } = useInView<HTMLElement>(0);
  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-shown={inView}
      className={`qb-reveal ${className}`}
      style={{ "--qb-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Counts up to the numeric part of a value like "80 %" once visible. */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const reduced = usePrefersReducedMotion();
  const match = value.match(/^(\d+)(.*)$/);
  const numeric = match !== null;
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || !numeric || reduced) return;
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, target, numeric]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden>{numeric ? `${reduced ? target : n}${suffix}` : value}</span>
    </span>
  );
}

/** Cursor-following glow for cards. Sets --qb-x / --qb-y on the element. */
export function Spotlight({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={ref}
      className={`group relative ${className}`}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--qb-x", `${e.clientX - r.left}px`);
        el.style.setProperty("--qb-y", `${e.clientY - r.top}px`);
      }}
    >
      <div
        aria-hidden
        className="qb-spotlight pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition duration-300 group-hover:opacity-100"
      />
      {children}
    </div>
  );
}
