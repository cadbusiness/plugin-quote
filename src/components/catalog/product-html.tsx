import { looksLikeHtml, sanitizeProductHtml } from "@/lib/catalog/html";

export function ProductHtml({
  html,
  className = "",
  clamp = false,
}: {
  html: string | null | undefined;
  className?: string;
  clamp?: boolean;
}) {
  if (!html) return null;
  if (!looksLikeHtml(html)) {
    return <p className={`${clamp ? "line-clamp-3 " : ""}${className}`}>{html}</p>;
  }
  const safe = sanitizeProductHtml(html);
  return (
    <div
      className={`product-html text-sm leading-6 text-slate-600 [&_a]:text-[#C2410C] [&_a]:underline [&_img]:mt-2 [&_img]:max-h-48 [&_img]:rounded-md [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 ${
        clamp ? "line-clamp-3" : ""
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
