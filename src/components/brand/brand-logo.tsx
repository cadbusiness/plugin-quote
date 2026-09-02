import Image from "next/image";
import Link from "next/link";

type Props = {
  variant?: "mark" | "wordmark" | "lockup";
  href?: string;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ variant = "wordmark", href, className = "", priority = false }: Props) {
  const mark = (
    <Image
      src="/brand/quotebuilder-mark.png"
      alt={variant === "mark" ? "QuoteBuilder" : ""}
      width={428}
      height={428}
      className={variant === "mark" ? `h-8 w-8 ${className}` : "h-8 w-8"}
      priority={priority}
    />
  );

  const lockup = (
    <Image
      src="/brand/quotebuilder-lockup.png"
      alt="QuoteBuilder"
      width={903}
      height={648}
      className={`h-auto w-full ${className}`}
      priority={priority}
    />
  );

  const wordmark = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {mark}
      <span className="text-sm font-semibold tracking-tight text-slate-900">QuoteBuilder</span>
    </span>
  );

  const inner = variant === "lockup" ? lockup : variant === "mark" ? mark : wordmark;

  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="QuoteBuilder">
      {inner}
    </Link>
  );
}
