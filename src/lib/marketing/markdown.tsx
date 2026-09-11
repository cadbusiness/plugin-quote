import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { slugifyHeading, stripMarkdownInline } from "@/lib/marketing/blog";

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
            className="font-medium text-[#E85D04] underline-offset-2 hover:underline"
          >
            {label}
          </Link>
        ) : (
          <a
            key={`${keyPrefix}-a-${i}`}
            href={href}
            className="font-medium text-[#E85D04] underline-offset-2 hover:underline"
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

const IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;

function parseImageLine(line: string) {
  const match = line.trim().match(IMAGE_RE);
  if (!match) return null;
  return { alt: match[1] ?? "", src: match[2] ?? "", title: match[3] };
}

function isImageLine(line: string) {
  return IMAGE_RE.test(line.trim());
}

function parseCaption(line: string | undefined) {
  if (!line) return null;
  const trimmed = line.trim();
  const italic = trimmed.match(/^\*(.+)\*$/);
  if (italic) return italic[1] ?? null;
  return null;
}

function calloutKind(text: string): "tip" | "warning" | null {
  if (/^(note|astuce|tip)\b/i.test(text)) return "tip";
  if (/^(attention|warning|avertissement)\b/i.test(text)) return "warning";
  return null;
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
      blocks.push(<hr key={key++} className="my-10 border-[#1A1510]/10" />);
      i += 1;
      continue;
    }

    const image = parseImageLine(line);
    if (image) {
      i += 1;
      const caption = parseCaption(lines[i]);
      if (caption) i += 1;
      const label = caption ?? image.title ?? image.alt;
      blocks.push(
        <figure key={key++} className="mt-8">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-white ring-1 ring-black/6">
            {image.src.startsWith("/") ? (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#1A1510]/40">
                {image.alt || "Figure"}
              </div>
            )}
          </div>
          {label ? (
            <figcaption className="mt-3 text-sm leading-6 text-[#1A1510]/50">{label}</figcaption>
          ) : null}
        </figure>,
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
      if (kind === "tip") {
        blocks.push(
          <aside
            key={key++}
            className="mt-8 rounded-2xl bg-[#FFF4EB] px-5 py-4 text-[16px] leading-7 text-[#1A1510]/80 ring-1 ring-[#E85D04]/15"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C45C26]">Astuce</p>
            <p className="mt-2">{renderInline(text, `tip-${key}`)}</p>
          </aside>,
        );
      } else if (kind === "warning") {
        blocks.push(
          <aside
            key={key++}
            className="mt-8 rounded-2xl bg-amber-50 px-5 py-4 text-[16px] leading-7 text-[#1A1510]/80 ring-1 ring-amber-200/80"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-800">Attention</p>
            <p className="mt-2">{renderInline(text, `warn-${key}`)}</p>
          </aside>,
        );
      } else {
        blocks.push(
          <blockquote
            key={key++}
            className="mt-10 border-l-2 border-[#E85D04] pl-5 text-[1.15rem] font-medium leading-8 text-[#1A1510]/80 sm:text-xl sm:leading-9"
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
        <div key={key++} className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-[14px] leading-6 text-[#1A1510]/80 sm:text-[15px]">
            <thead>
              <tr className="border-b border-[#1A1510]/12">
                {header.map((cell, idx) => (
                  <th key={idx} className="px-3 py-2 font-semibold first:pl-0 last:pr-0">
                    {renderInline(cell, `th-${key}-${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ridx) => (
                <tr key={ridx} className="border-b border-[#1A1510]/8 align-top">
                  {row.map((cell, cidx) => (
                    <td key={cidx} className="px-3 py-2 first:pl-0 last:pr-0">
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
          className={`mt-5 space-y-2 text-[16px] leading-7 text-[#1A1510]/75 sm:text-[17px] sm:leading-8 ${
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
    blocks.push(
      <p key={key++} className="mt-5 text-[16px] leading-7 text-[#1A1510]/75 sm:text-[17px] sm:leading-8">
        {renderInline(para.join(" "), `p-${key}`)}
      </p>,
    );
  }

  return <div className="marketing-md">{blocks}</div>;
}
