import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BLOG_IMAGE_DIR, slugifyHeading, stripMarkdownInline } from "@/lib/marketing/blog";
import {
  IMAGE_RE,
  type CalloutKind,
  calloutKind,
  calloutLabel,
  paragraphCalloutKind,
  parseCaption,
  parseImageLine,
  stripCalloutPrefix,
} from "@/lib/marketing/markdown-parse";

export { calloutKind, paragraphCalloutKind, parseCaption, parseImageLine };

function resolveMarkdownImageSrc(src: string): string {
  if (src.startsWith("figure:") || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }
  return `${BLOG_IMAGE_DIR}/${src.replace(/^\/+/, "")}`;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const token = /(\*\*[^*]+?\*\*|\[([^\]]+)\]\(([^)]+)\)|\*[^*]+?\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = token.exec(text))) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const raw = match[0];
    if (raw.startsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}-b-${i}`}>{raw.slice(2, -2)}</strong>);
    } else if (raw.startsWith("[") && match[2] && match[3]) {
      const href = match[3];
      const label = match[2];
      const isInternal = href.startsWith("/");
      nodes.push(
        isInternal ? (
          <Link
            key={`${keyPrefix}-a-${i}`}
            href={href}
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
          >
            {label}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-a-${i}`}
            href={href}
            className="font-medium text-mk-accent underline-offset-2 hover:underline"
            rel="noopener noreferrer"
            target={href.startsWith("http") ? "_blank" : undefined}
          >
            {label}
          </a>
        ),
      );
    } else if (raw.startsWith("*")) {
      nodes.push(<em key={`${keyPrefix}-i-${i}`}>{raw.slice(1, -1)}</em>);
    }
    last = match.index + raw.length;
    i += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function isListLine(line: string) {
  return /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line);
}

function isTableLine(line: string) {
  return /^\s*\|.+\|\s*$/.test(line);
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string) {
  if (!isTableLine(line)) return false;
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isImageLine(line: string) {
  return IMAGE_RE.test(line.trim());
}

function Callout({
  kind,
  text,
  id,
}: {
  kind: Exclude<CalloutKind, "quote">;
  text: string;
  id: string;
}) {
  const tip = kind === "tip";
  const body = stripCalloutPrefix(text);
  return (
    <aside
      role="note"
      className={`mt-8 rounded-xl border-l-[3px] px-5 py-4 text-[16px] leading-7 text-mk-ink ring-1 ${
        tip
          ? "border-l-mk-accent bg-mk-accent-soft ring-mk-accent/15"
          : "border-l-amber-500 bg-amber-50 ring-amber-200/80"
      }`}
    >
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
          tip ? "text-mk-accent" : "text-amber-800"
        }`}
      >
        {calloutLabel(kind)}
      </p>
      <p className="mt-2 text-mk-ink/80">{renderInline(body || text, id)}</p>
    </aside>
  );
}

function SchematicFigure({ kind, label }: { kind: string; label: string }) {
  if (kind === "score-grid") {
    const rows = [
      { label: "Hot", range: "80–100", tone: "bg-rose-50 text-rose-800" },
      { label: "Warm", range: "55–79", tone: "bg-amber-50 text-amber-800" },
      { label: "Cold", range: "30–54", tone: "bg-slate-100 text-slate-700" },
      { label: "Parking", range: "0–29", tone: "bg-mk-band text-mk-muted" },
    ];
    return (
      <div className="grid gap-2 sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className={`rounded-lg px-3 py-3 ${row.tone}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">{row.label}</p>
            <p className="mt-1 text-sm font-medium">{row.range}</p>
          </div>
        ))}
      </div>
    );
  }

  if (kind === "funnel-vs-form") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-mk-band px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-faint">
            Formulaire
          </p>
          <p className="mt-2 text-sm font-semibold text-mk-ink">Message vague</p>
          <p className="mt-1 text-sm leading-6 text-mk-muted">Nom, e-mail, « devis svp ».</p>
        </div>
        <div className="rounded-lg bg-mk-dark px-4 py-4 text-mk-on-dark">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mk-accent">
            Funnel
          </p>
          <p className="mt-2 text-sm font-semibold">Dossier chiffrable</p>
          <p className="mt-1 text-sm leading-6 text-mk-on-dark/65">
            Produits, contraintes, budget, score.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[10rem] items-center justify-center text-sm text-mk-faint">
      {label}
    </div>
  );
}

function FigureFrame({
  label,
  children,
}: {
  label?: string | null;
  children: ReactNode;
}) {
  return (
    <figure className="mt-8">
      <div className="overflow-hidden rounded-xl bg-mk-surface p-3 ring-1 ring-mk-border sm:p-4">
        {children}
      </div>
      {label ? (
        <figcaption className="mt-3 text-sm leading-6 text-mk-faint">{label}</figcaption>
      ) : null}
    </figure>
  );
}

export function Markdown({
  source,
  midAfterHeading = -1,
  midSlot,
}: {
  source: string;
  midAfterHeading?: number;
  midSlot?: ReactNode;
}) {
  const lines = source.replace(/\r\n/g, "\n").trim().split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  let headingCount = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="mt-10 scroll-mt-28 text-lg font-semibold tracking-tight sm:text-xl">
          {renderInline(line.slice(4), `h3-${key}`)}
        </h3>,
      );
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      const text = stripMarkdownInline(line.slice(3));
      const id = slugifyHeading(text);
      blocks.push(
        <h2
          key={key++}
          id={id}
          className="mt-12 scroll-mt-28 text-2xl font-semibold tracking-tight sm:mt-16 sm:text-3xl"
        >
          {renderInline(line.slice(3), `h2-${key}`)}
        </h2>,
      );
      headingCount += 1;
      if (midSlot && midAfterHeading >= 0 && headingCount - 1 === midAfterHeading) {
        blocks.push(<div key={`mid-${key}`}>{midSlot}</div>);
      }
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      i += 1;
      continue;
    }

    if (line.trim() === "---") {
      blocks.push(<hr key={key++} className="my-10 border-mk-border" />);
      i += 1;
      continue;
    }

    const image = parseImageLine(line);
    if (image) {
      i += 1;
      const caption = parseCaption(lines[i]);
      if (caption) i += 1;
      const label = caption ?? image.title ?? image.alt;
      const src = resolveMarkdownImageSrc(image.src);
      const schematic = src.startsWith("figure:") ? src.slice("figure:".length) : null;
      blocks.push(
        <FigureFrame key={key++} label={label}>
          {schematic ? (
            <SchematicFigure kind={schematic} label={label} />
          ) : src.startsWith("/") ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-mk-band">
              <Image
                src={src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex min-h-[10rem] items-center justify-center text-sm text-mk-faint">
              {image.alt || "Figure"}
            </div>
          )}
        </FigureFrame>,
      );
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && (lines[i]?.startsWith("> ") || lines[i] === ">")) {
        quote.push((lines[i] ?? "").replace(/^>\s?/, ""));
        i += 1;
      }
      const text = quote.join(" ").trim();
      const kind = calloutKind(text);
      if (kind === "tip" || kind === "warning") {
        blocks.push(<Callout key={key++} kind={kind} text={text} id={`${kind}-${key}`} />);
      } else {
        blocks.push(
          <blockquote
            key={key++}
            className="mt-10 border-l-2 border-mk-accent pl-5 text-[1.15rem] font-medium leading-8 text-mk-ink sm:text-xl sm:leading-9"
          >
            {renderInline(text, `q-${key}`)}
          </blockquote>,
        );
      }
      continue;
    }

    if (isTableLine(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1] ?? "")) {
      const header = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableLine(lines[i] ?? "") && !isTableSeparator(lines[i] ?? "")) {
        rows.push(splitTableRow(lines[i] ?? ""));
        i += 1;
      }
      blocks.push(
        <div key={key++} className="mt-8 overflow-x-auto rounded-xl bg-mk-surface ring-1 ring-mk-border">
          <table className="w-full min-w-[28rem] border-collapse text-left text-[14px] leading-6 text-mk-ink sm:text-[15px]">
            <thead className="bg-mk-band">
              <tr className="border-b border-mk-border">
                {header.map((cell, idx) => (
                  <th key={idx} className="px-4 py-2.5 font-semibold first:pl-5 last:pr-5">
                    {renderInline(cell, `th-${key}-${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ridx) => (
                <tr key={ridx} className="border-b border-mk-border align-top last:border-0">
                  {row.map((cell, cidx) => (
                    <td key={cidx} className="px-4 py-2.5 text-mk-muted first:pl-5 last:pr-5">
                      {renderInline(cell, `td-${key}-${ridx}-${cidx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (isListLine(line)) {
      const items: string[] = [];
      const ordered = /^\d+\.\s+/.test(line);
      while (i < lines.length && isListLine(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^([-*]|\d+\.)\s+/, ""));
        i += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List
          key={key++}
          className={`mt-5 space-y-2 text-[16px] leading-7 text-mk-muted sm:text-[17px] sm:leading-8 ${
            ordered ? "list-decimal pl-5" : "list-disc pl-5"
          }`}
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `li-${key}-${idx}`)}</li>
          ))}
        </List>,
      );
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i]?.trim() &&
      !lines[i]?.startsWith("#") &&
      !lines[i]?.startsWith(">") &&
      !isListLine(lines[i] ?? "") &&
      !isTableLine(lines[i] ?? "") &&
      !isImageLine(lines[i] ?? "") &&
      lines[i]?.trim() !== "---"
    ) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    const text = para.join(" ");
    const kind = paragraphCalloutKind(text);
    if (kind) {
      blocks.push(<Callout key={key++} kind={kind} text={text} id={`${kind}-p-${key}`} />);
    } else {
      blocks.push(
        <p key={key++} className="mt-5 text-[16px] leading-7 text-mk-muted sm:text-[17px] sm:leading-8">
          {renderInline(text, `p-${key}`)}
        </p>,
      );
    }
  }

  return <div className="marketing-md">{blocks}</div>;
}
