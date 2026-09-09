"use client";

import { useFormStatus } from "react-dom";
import { authorizePluginConnect } from "@/app/(app)/integrations/actions";

export function PluginConnectForm({
  siteUrl,
  siteName,
  returnUrl,
  state,
  orgName,
}: {
  siteUrl: string;
  siteName: string;
  returnUrl: string;
  state: string;
  orgName: string;
}) {
  return (
    <form action={authorizePluginConnect} className="rounded-xl border border-[#efe7de] bg-white p-6 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">WordPress</p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight">Connecter {siteName}</h1>
      <p className="mt-2 text-sm text-slate-500">
        On relie la boutique à <strong className="font-medium text-slate-900">{orgName}</strong> : le
        catalogue WooCommerce est importé, et « Demander un devis » ouvre votre parcours QuoteBuilder.
      </p>
      <p className="mt-1 truncate text-xs text-slate-400">{siteUrl}</p>

      <input type="hidden" name="site_url" value={siteUrl} />
      <input type="hidden" name="return" value={returnUrl} />
      <input type="hidden" name="state" value={state} />

      <Submit />
      <a
        href={returnUrl}
        className="mt-3 block text-center text-sm text-slate-500 hover:text-[#C2410C]"
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
      className="mt-6 w-full rounded-lg bg-[#E85D04] py-2.5 text-sm font-semibold text-white hover:bg-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 disabled:opacity-60"
    >
      {pending ? "Connexion…" : "Connecter la boutique"}
    </button>
  );
}
