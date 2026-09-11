import { ImageResponse } from "next/og";
import { getBlogPost } from "@/lib/marketing/blog";

export const alt = "Article QuoteBuilder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const title = post?.title ?? "QuoteBuilder";
  const tag = post?.tag ?? "Blog";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F6F0E8",
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
              color: "#C45C26",
              fontSize: 22,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {tag}
          </div>
          <div style={{ color: "#1A1510", fontSize: 22, fontWeight: 600 }}>QuoteBuilder</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 980,
            fontSize: title.length > 70 ? 48 : 58,
            fontWeight: 600,
            lineHeight: 1.12,
            color: "#1A1510",
            letterSpacing: -1,
          }}
        >
          {title}
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
          <div style={{ color: "rgba(26,21,16,0.45)", fontSize: 22 }}>quotebuilder.co</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
