import type { ReactNode } from "react";
import Link from "next/link";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const token =
    /(\*\*[^*]+?\*\*|\[([^\]]+)\]\(([^)]+)\)|\*[^*]+?\*)/g;
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
          <Link key={`${keyPrefix}-a-${i}`} href={href} className="font-medium text-[#E85D04] underline-offset-2 hover:underline">
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

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").trim().split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="mt-10 text-lg font-semibold tracking-tight sm:text-xl">
          {renderInline(line.slice(4), `h3-${key}`)}
        </h3>,
      );
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="mt-14 text-2xl font-semibold tracking-tight sm:text-3xl">
          {renderInline(line.slice(3), `h2-${key}`)}
        </h2>,
      );
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

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && (lines[i]?.startsWith("> ") || lines[i] === ">")) {
        quote.push((lines[i] ?? "").replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="mt-6 border-l-2 border-[#E85D04] pl-4 text-[16px] leading-7 text-[#1A1510]/70"
        >
          {renderInline(quote.join(" "), `q-${key}`)}
        </blockquote>,
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
          className={`mt-5 space-y-2 text-[16px] leading-7 text-[#1A1510]/75 ${
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
    while (i < lines.length && lines[i]?.trim() && !lines[i]?.startsWith("#") && !lines[i]?.startsWith(">") && !isListLine(lines[i] ?? "") && lines[i]?.trim() !== "---") {
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
