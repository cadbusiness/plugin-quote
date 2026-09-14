import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/marketing/auth-split";
import { getAuthUser, getOrgContext, isAdminRole } from "@/lib/auth/org";
import {
  clientAllowsRedirect,
  parseAuthorizeRequest,
  resolveOAuthClient,
} from "@/lib/mcp/oauth";
import { approveMcpOAuth } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Autoriser MCP",
  robots: { index: false, follow: false },
};

export default async function McpAuthorizePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw ?? {})) {
    if (typeof value === "string") params.set(key, value);
  }
  const parsed = parseAuthorizeRequest(new URL(`https://local.invalid/?${params.toString()}`));
  if ("error" in parsed) {
    return (
      <AuthSplit>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Connexion MCP refusée</h1>
        <p className="mt-2 text-sm text-slate-500">{parsed.error}.</p>
      </AuthSplit>
    );
  }

  const user = await getAuthUser();
  const next = `/oauth/authorize?${params.toString()}`;
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const ctx = await getOrgContext();
  if (!ctx) {
    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  }

  const client = await resolveOAuthClient(parsed.clientId);
  if (!client || !clientAllowsRedirect(client, parsed.redirectUri)) {
    return (
      <AuthSplit>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Application inconnue</h1>
        <p className="mt-2 text-sm text-slate-500">
          ChatGPT ou Claude n’a pas pu être reconnu. Recréez le connecteur depuis Paramètres → API & webhooks.
        </p>
      </AuthSplit>
    );
  }

  if (!isAdminRole(ctx.role)) {
    return (
      <AuthSplit>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Droits insuffisants</h1>
        <p className="mt-2 text-sm text-slate-500">
          Seul un admin de {ctx.organization.name} peut autoriser Claude ou ChatGPT.
        </p>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Autoriser l’accès MCP</h1>
      <p className="mt-2 text-sm text-slate-500">
        <span className="font-medium text-slate-800">{client.clientName}</span> pourra lire et écrire les
        devis de <span className="font-medium text-slate-800">{ctx.organization.name}</span> (leads, stats,
        funnels, relances).
      </p>
      <form action={approveMcpOAuth} className="mt-8 space-y-3">
        <input type="hidden" name="client_id" value={parsed.clientId} />
        <input type="hidden" name="redirect_uri" value={parsed.redirectUri} />
        <input type="hidden" name="state" value={parsed.state ?? ""} />
        <input type="hidden" name="code_challenge" value={parsed.codeChallenge} />
        <input type="hidden" name="resource" value={parsed.resource ?? ""} />
        <button
          name="decision"
          value="allow"
          className="w-full rounded-lg bg-[#E85D04] px-4 py-2.5 text-sm font-medium text-white"
        >
          Autoriser
        </button>
        <button
          name="decision"
          value="deny"
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
        >
          Refuser
        </button>
      </form>
    </AuthSplit>
  );
}
