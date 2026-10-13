import { CopyField } from "@/components/integrations/copy-field";
import { SITE_URL } from "@/lib/marketing/site";
import { mcpResourceUrl } from "@/lib/mcp/urls";

export function McpSetupPanel() {
  // Production: the www host (OAuth discovery answers on it too); previews / local: their own origin.
  const url = mcpResourceUrl(process.env.VERCEL_ENV === "production" ? SITE_URL : undefined);
  return (
    <div className="mb-4 space-y-3 text-sm text-slate-600">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">URL MCP</p>
        <div className="mt-1">
          <CopyField value={url} label="Copier l’URL" />
        </div>
      </div>
      <p>
        <span className="font-medium text-slate-800">Claude (claude.ai, Desktop, mobile)</span> : Paramètres →
        Connecteurs → Ajouter un connecteur personnalisé. Collez l’URL, puis connectez-vous et autorisez
        (compte admin).
      </p>
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
