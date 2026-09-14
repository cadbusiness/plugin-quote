import { CopyField } from "@/components/integrations/copy-field";
import { mcpResourceUrl } from "@/lib/mcp/urls";

export function McpSetupPanel() {
  const url = mcpResourceUrl();
  return (
    <div className="mb-4 space-y-3 text-sm text-slate-600">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">URL MCP</p>
        <div className="mt-1">
          <CopyField value={url} label="Copier l’URL" />
        </div>
      </div>
      <p>
        <span className="font-medium text-slate-800">ChatGPT (web)</span> : Paramètres → Applications et
        connecteurs → mode développeur → Créer. Collez l’URL, authentification OAuth (laissez client id /
        secret vides).
      </p>
      <p>
        <span className="font-medium text-slate-800">ChatGPT Desktop / Codex / Cursor / Claude distant</span> :
        même URL, en-tête <code className="text-xs">Authorization: Bearer qb_live_…</code>.
      </p>
      <p>
        <span className="font-medium text-slate-800">Claude Desktop (local)</span> : package npm{" "}
        <code className="text-xs">quotebuilder-mcp</code> en stdio, même clé.
      </p>
    </div>
  );
}
