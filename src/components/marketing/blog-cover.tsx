import Image from "next/image";
import { blogTagLabel, primaryTag, type BlogPost } from "@/lib/marketing/blog";
import { TAG_COVER } from "@/lib/marketing/theme";

export function BlogCoverPlaceholder({
  post,
  compact = false,
}: {
  post: BlogPost;
  compact?: boolean;
}) {
  const tag = primaryTag(post);
  const theme = TAG_COVER[tag];
  const label = blogTagLabel(tag);
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${compact ? "min-h-[9.5rem]" : "h-full min-h-[15rem]"}`}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice">
        <rect width="640" height="360" fill={theme.wash} />
        <defs>
          <pattern id={`grid-${post.slug}`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="640" height="360" fill={`url(#grid-${post.slug})`} />
        <circle cx="520" cy="40" r="160" fill={theme.accent} opacity="0.18" />
        <circle cx="80" cy="300" r="90" fill={theme.accent} opacity="0.1" />
        <line x1="40" y1="320" x2="600" y2="40" stroke={theme.accent} strokeOpacity="0.35" strokeWidth="1" />
        <rect x="72" y="88" width="168" height="112" rx="10" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
        <rect x="96" y="112" width="120" height="8" rx="4" fill="rgba(255,255,255,0.28)" />
        <rect x="96" y="132" width="88" height="6" rx="3" fill="rgba(255,255,255,0.14)" />
        <rect x="96" y="150" width="104" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
        <rect x="268" y="128" width="148" height="148" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
        <text
          x="72"
          y="64"
          fill="rgba(255,255,255,0.28)"
          fontSize="22"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
          letterSpacing="4"
        >
          {theme.mark}
        </text>
      </svg>
      <div className="relative flex h-full min-h-[inherit] items-end p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">{label}</p>
      </div>
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
    return <BlogCoverPlaceholder post={post} compact={compact} />;
  }
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-mk-dark">
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
