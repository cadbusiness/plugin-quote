import Image from "next/image";
import { blogTagLabel, primaryTag, type BlogPost } from "@/lib/marketing/blog";

export function BlogCoverPlaceholder({
  post,
  compact = false,
}: {
  post: BlogPost;
  compact?: boolean;
}) {
  const label = blogTagLabel(primaryTag(post));
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden rounded-[22px] ${compact ? "min-h-[10rem]" : "h-full min-h-[14rem]"}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#1A1510_0%,#E85D04_58%,#F3B184_100%)]" />
      <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#F6F0E8]/20 blur-2xl" />
      <div className="relative flex h-full min-h-[inherit] items-end p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">{label}</p>
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
