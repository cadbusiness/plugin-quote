import Image from "next/image";
import type { BlogPost, BlogTag } from "@/lib/marketing/blog";

const TONE = {
  hot: "bg-rose-100 text-rose-700",
  ok: "bg-emerald-100 text-emerald-800",
  muted: "bg-amber-100 text-amber-800",
} as const;

const MOCKS: Record<
  BlogTag,
  { eyebrow: string; rows: { label: string; value: string; tone?: keyof typeof TONE }[] }
> = {
  Scoring: {
    eyebrow: "Scorecard",
    rows: [
      { label: "Fit ICP", value: "16 / 20" },
      { label: "Urgence", value: "17 / 20" },
      { label: "Brief", value: "18 / 20" },
      { label: "Total", value: "Hot · 81", tone: "hot" },
    ],
  },
  Relances: {
    eyebrow: "Séquence",
    rows: [
      { label: "T+0", value: "Confirmation", tone: "ok" },
      { label: "T+24 h", value: "Rappel" },
      { label: "J+3", value: "Relance", tone: "ok" },
      { label: "J+30", value: "Réactivation", tone: "muted" },
    ],
  },
  Funnel: {
    eyebrow: "Parcours",
    rows: [
      { label: "Étape 2 / 6", value: "Gamme", tone: "ok" },
      { label: "Budget", value: "4 200 – 6 800 €" },
      { label: "Identité", value: "Email capté", tone: "ok" },
      { label: "Sortie", value: "Dossier scoré" },
    ],
  },
  Intégrations: {
    eyebrow: "Connecté",
    rows: [
      { label: "Widget", value: "Actif", tone: "ok" },
      { label: "WordPress", value: "Bloc Gutenberg" },
      { label: "Woo / Shopify", value: "Sync OK", tone: "ok" },
      { label: "Catalogue", value: "128 SKU" },
    ],
  },
};

export function BlogCoverMock({
  tag,
  compact = false,
}: {
  tag: BlogTag;
  compact?: boolean;
}) {
  const mock = MOCKS[tag];
  const rows = compact ? mock.rows.slice(0, 3) : mock.rows;
  return (
    <div
      aria-hidden
      className={`h-full rounded-[22px] bg-[#1A1510] text-[#F6F0E8] shadow-[0_30px_80px_-40px_rgba(26,21,16,0.7)] ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F3B184]">
          {mock.eyebrow}
        </p>
        <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
          Live
        </span>
      </div>
      <ul className={compact ? "mt-3 space-y-2" : "mt-4 space-y-2.5"}>
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white/6 px-3.5 py-2.5 ring-1 ring-white/8"
          >
            <span className="text-sm text-[#F6F0E8]/70">{row.label}</span>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                row.tone ? TONE[row.tone] : "bg-[#F6F0E8] text-[#1A1510]/70"
              }`}
            >
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BlogCover({
  post,
  sizes,
  priority = false,
  compact = false,
}: {
  post: BlogPost;
  sizes: string;
  priority?: boolean;
  compact?: boolean;
}) {
  if (!post.cover) {
    return <BlogCoverMock tag={post.tag} compact={compact} />;
  }
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] bg-[#1A1510]">
      <Image
        src={post.cover}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
