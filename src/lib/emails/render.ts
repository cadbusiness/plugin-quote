import { fill } from "@/lib/email/fill";
import type { EmailBlock, EmailDesign } from "@/lib/emails/blocks";

export type MergeVars = Record<string, string>;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function withVars(value: string | undefined, vars: MergeVars, asHtml = false) {
  const filled = fill(value ?? "", vars);
  if (asHtml) return filled;
  return escapeHtml(filled).replace(/\n/g, "<br>");
}

function blockHtml(block: EmailBlock, vars: MergeVars, accent: string): string {
  switch (block.type) {
    case "heading":
      return `<tr><td style="padding:28px 32px 8px">
        <h1 style="margin:0;font-size:22px;line-height:1.3;color:#0f172a;font-family:Arial,sans-serif">${withVars(block.heading, vars)}</h1>
        ${
          block.sub
            ? `<p style="margin:8px 0 0;font-size:14px;color:#64748b;font-family:Arial,sans-serif">${withVars(block.sub, vars)}</p>`
            : ""
        }
      </td></tr>`;
    case "text":
      return `<tr><td style="padding:8px 32px 12px;font-size:15px;line-height:1.6;color:#334155;font-family:Arial,sans-serif">${withVars(block.text, vars)}</td></tr>`;
    case "button": {
      const href = fill(block.href ?? "#", vars) || "#";
      const label = withVars(block.label ?? "Ouvrir", vars);
      return `<tr><td style="padding:12px 32px 20px">
        <a href="${escapeHtml(href)}" style="display:inline-block;background:${accent};color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:600;padding:12px 20px;border-radius:6px">${label}</a>
      </td></tr>`;
    }
    case "image":
      if (!block.src) return "";
      return `<tr><td style="padding:8px 32px"><img src="${escapeHtml(fill(block.src, vars))}" alt="${escapeHtml(block.alt ?? "")}" style="display:block;max-width:100%;height:auto;border:0"></td></tr>`;
    case "spacer":
      return `<tr><td style="height:${Number(block.height) || 24}px;line-height:${Number(block.height) || 24}px;font-size:0">&nbsp;</td></tr>`;
    case "divider":
      return `<tr><td style="padding:8px 32px"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0"></td></tr>`;
    case "recap": {
      const recap = vars.answers_text
        ? escapeHtml(vars.answers_text).replace(/\n/g, "<br>")
        : "Récapitulatif de votre configuration.";
      return `<tr><td style="padding:8px 32px 16px">
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;font-family:Arial,sans-serif;font-size:14px;color:#9a3412;line-height:1.55">${recap}</div>
      </td></tr>`;
    }
    case "footer":
      return `<tr><td style="padding:24px 32px 32px;font-size:12px;color:#94a3b8;font-family:Arial,sans-serif">${withVars(block.text, vars)}</td></tr>`;
  }
}

export function renderEmailHtml(design: EmailDesign, vars: MergeVars = {}): string {
  const accent = design.accent || "#E85D04";
  const rows = design.blocks.map((block) => blockHtml(block, vars, accent)).join("");
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f8fafc">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
        ${rows}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function renderEmailText(design: EmailDesign, vars: MergeVars = {}): string {
  return design.blocks
    .map((block) => {
      if (block.type === "heading") return [fill(block.heading ?? "", vars), fill(block.sub ?? "", vars)].filter(Boolean).join("\n");
      if (block.type === "text" || block.type === "footer") return fill(block.text ?? "", vars);
      if (block.type === "button") return `${fill(block.label ?? "", vars)}: ${fill(block.href ?? "", vars)}`;
      if (block.type === "recap") return vars.answers_text ?? "";
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}
