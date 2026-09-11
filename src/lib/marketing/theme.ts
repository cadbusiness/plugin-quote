import type { BlogTagSlug } from "@/lib/marketing/blog";

/** Shared marketing surface classes. Prefer these over one-off hex. */
export const mk = {
  page: "bg-mk-bg text-mk-ink",
  header: "sticky top-0 z-40 border-b border-mk-border bg-mk-surface/80 backdrop-blur-md",
  navLink: "rounded-md px-3 py-1.5 text-sm font-medium transition",
  navActive: "bg-mk-band text-mk-ink",
  navIdle: "text-mk-muted hover:bg-mk-band hover:text-mk-ink",
  card: "bg-mk-surface ring-1 ring-mk-border",
  cardHover:
    "transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-28px_rgba(11,13,18,0.2)]",
  band: "border-y border-mk-border bg-mk-band",
  label: "text-[11px] font-semibold uppercase tracking-[0.14em] text-mk-accent",
  muted: "text-mk-muted",
  faint: "text-mk-faint",
  dark: "bg-mk-dark text-mk-on-dark",
  cta: "rounded-full bg-mk-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-mk-accent-hover",
  ghost:
    "rounded-full bg-mk-surface px-5 py-2.5 text-sm font-semibold text-mk-ink ring-1 ring-mk-border hover:bg-mk-band",
} as const;

export const CREAM_HEX = "#F6F0E8";

export const TAG_COVER: Record<
  BlogTagSlug,
  { accent: string; wash: string; mark: string }
> = {
  scoring: { accent: "#E85D04", wash: "#14110f", mark: "01" },
  relances: { accent: "#F59E0B", wash: "#14120c", mark: "02" },
  funnel: { accent: "#E85D04", wash: "#121014", mark: "03" },
  integrations: { accent: "#7C3AED", wash: "#100e16", mark: "04" },
  catalogue: { accent: "#0D9488", wash: "#0c1212", mark: "05" },
};
