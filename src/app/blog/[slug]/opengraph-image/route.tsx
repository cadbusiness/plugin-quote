import { ImageResponse } from "next/og";
import { BLOG_POSTS, getBlogPost, primaryTagLabel, trimMetaDescription } from "@/lib/marketing/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const title = post?.title ?? "QuoteBuilder";
  const tag = post ? primaryTagLabel(post) : "Blog";
  const description = trimMetaDescription(post?.description ?? "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F8FA",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#E85D04",
              fontSize: 22,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {tag}
          </div>
          <div style={{ color: "#0B0D12", fontSize: 22, fontWeight: 600 }}>QuoteBuilder</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 980,
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: title.length > 70 ? 46 : 56,
              fontWeight: 600,
              lineHeight: 1.12,
              color: "#0B0D12",
              letterSpacing: -1,
            }}
          >
            {`${title} · QuoteBuilder`}
          </div>
          {description ? (
            <div style={{ color: "#5C6370", fontSize: 24, lineHeight: 1.4 }}>
              {description}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 14,
              background: "#E85D04",
            }}
          />
          <div style={{ color: "#8B919C", fontSize: 22 }}>quotebuilder.co</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
