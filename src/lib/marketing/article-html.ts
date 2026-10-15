import { parseImageLine } from "@/lib/marketing/markdown-parse";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineHtml(text: string) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code class="rounded bg-mk-band px-1 font-mono text-[0.92em] text-mk-ink">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g, '<a href="$2">$1</a>');
}

function tableHtml(block: string): string | null {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 3 || !lines.every((line) => line.startsWith("|") && line.endsWith("|"))) return null;
  const cells = (line: string) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  const header = cells(lines[0] ?? "");
  const separator = cells(lines[1] ?? "");
  if (!separator.every((cell) => /^:?-{3,}:?$/.test(cell))) return null;
  const rows = lines.slice(2).map(cells);
  const head = header.map((cell) => `<th class="px-3 py-2 font-semibold">${inlineHtml(cell)}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr class="border-t border-mk-border">${row
          .map((cell) => `<td class="px-3 py-2 align-top">${inlineHtml(cell)}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  return `<div class="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-mk-border"><table class="w-full min-w-[28rem] border-collapse text-left text-[14px] leading-6"><thead class="bg-mk-band"><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function imageHtml(block: string): string | null {
  if (block.includes("\n")) return null;
  const image = parseImageLine(block);
  if (!image?.src.startsWith("/images/")) return null;
  return `<figure class="mt-8"><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" class="w-full rounded-xl bg-mk-band object-cover object-top" /></figure>`;
}

function maskFences(source: string) {
  const fences: string[] = [];
  const masked = source.replace(/(^|\n)```[^\n]*\n([\s\S]*?)\n```(?=\n|$)/g, (_match, lead: string, code: string) => {
    const html = `<pre class="mt-6 overflow-x-auto whitespace-pre-wrap rounded-xl bg-mk-band px-4 py-4 font-mono text-[13px] leading-6 text-mk-ink"><code>${escapeHtml(code)}</code></pre>`;
    const token = `${lead}\n\n@@FENCE${fences.length}@@\n\n`;
    fences.push(html);
    return token;
  });
  return { masked, fences };
}

/** String HTML for blog articles: no React markdown tree, no Sharp, no Satori. */
export function articleHtml(source: string) {
  const { masked, fences } = maskFences(source.replace(/\r\n/g, "\n").trim());
  const blocks: string[] = [];
  for (const raw of masked.split(/\n{2,}/)) {
    const block = raw.trim();
    if (!block || block.startsWith("# ") || block.startsWith("<!--")) continue;
    const fence = /^@@FENCE(\d+)@@$/.exec(block);
    if (fence) {
      blocks.push(fences[Number(fence[1])] ?? "");
      continue;
    }
    if (block.startsWith("## ")) {
      blocks.push(`<h2 class="mt-12 text-2xl font-semibold tracking-tight">${inlineHtml(block.slice(3))}</h2>`);
      continue;
    }
    if (block.startsWith("### ")) {
      blocks.push(`<h3 class="mt-8 text-lg font-semibold">${inlineHtml(block.slice(4))}</h3>`);
      continue;
    }
    const image = imageHtml(block);
    if (image) {
      blocks.push(image);
      continue;
    }
    const table = tableHtml(block);
    if (table) {
      blocks.push(table);
      continue;
    }
    if (/^[-*]\s/m.test(block) || /^\d+\.\s/m.test(block)) {
      const items = block
        .split("\n")
        .map((line) => line.replace(/^([-*]|\d+\.)\s+/, "").trim())
        .filter(Boolean)
        .map((item) => `<li>${inlineHtml(item)}</li>`)
        .join("");
      blocks.push(`<ul class="mt-5 list-disc pl-5 text-mk-muted">${items}</ul>`);
      continue;
    }
    blocks.push(`<p class="mt-5 text-[16px] leading-7 text-mk-muted">${inlineHtml(block.replace(/\n/g, " "))}</p>`);
  }
  return blocks.join("");
}
