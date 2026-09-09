"use client";

import { useFormStatus } from "react-dom";
import { authorizePluginConnect } from "@/app/(app)/integrations/actions";

type Funnel = { id: string; name: string };

export function PluginConnectForm({
  siteUrl,
  siteName,
  returnUrl,
  state,
  orgName,
  funnels,
}: {
  siteUrl: string;
  siteName: string;
  returnUrl: string;
  state: string;
  orgName: string;
  funnels: Funnel[];
}) {
  return (
    <form action={authorizePluginConnect} className="rounded-xl border border-[#efe7de] bg-white p-6 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">WordPress</p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight">Connecter WooCommerce</h1>
      <p className="mt-2 text-sm text-slate-500">
        <strong className="font-medium text-slate-900">{siteName}</strong> envoie son catalogue dans{" "}
        <strong className="font-medium text-slate-900">{orgName}</strong>. Les demandes restent dans
        QuoteBuilder.
      </p>
      <p className="mt-1 truncate text-xs text-slate-400">{siteUrl}</p>

      <input type="hidden" name="site_url" value={siteUrl} />
      <input type="hidden" name="return" value={returnUrl} />
      <input type="hidden" name="state" value={state} />

      <label className="mt-6 block text-sm font-medium text-slate-900">
        Funnel alimenté
        <select
          name="configurator_id"
          required
          defaultValue={funnels[0]?.id ?? ""}
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        >
          {funnels.map((funnel) => (
            <option key={funnel.id} value={funnel.id}>
              {funnel.name}
            </option>
          ))}
        </select>
      </label>

      <Submit />
      <a
        href={returnUrl}
        className="mt-3 block text-center text-sm text-slate-500 hover:text-slate-800"
      >
        Annuler et revenir à WordPress
      </a>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-lg bg-[#E85D04] py-2.5 text-sm font-semibold text-white hover:bg-[#d35400] disabled:opacity-60"
    >
      {pending ? "Connexion…" : "Connecter le catalogue"}
    </button>
  );
}
