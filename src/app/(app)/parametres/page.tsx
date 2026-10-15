import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { eraseContactData } from "@/app/(app)/crm-actions";
import { saveSalesIdentity } from "@/app/(app)/parametres/actions";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { OrgFamilyPicker } from "@/components/dashboard/org-family-picker";
import { parseOrgFamily } from "@/lib/funnels/families";

const ROWS: { href: string; label: string; hint: string; admin?: boolean }[] = [
  { href: "/mises-a-jour", label: "Mises à jour", hint: "Nouveautés produit" },
  {
    href: "/integrations",
    label: "Boutiques",
    hint: "Boutique QuoteBuilder, WooCommerce, Shopify",
    admin: true,
  },
  { href: "/webhooks", label: "API & webhooks", hint: "MCP Claude / ChatGPT, webhooks", admin: true },
  { href: "/templates", label: "Emails", hint: "Templates prospect et commercial", admin: true },
  { href: "/equipe", label: "Équipe", hint: "Accès, rôles, journal", admin: true },
  { href: "/stats?tab=suivi", label: "Suivi Google", hint: "Analytics 4 et Tag Manager", admin: true },
  { href: "/acquisition", label: "Google Ads", hint: "Conversions, ROI campagnes, mots-clés", admin: true },
];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await getOrgContext();
  const params = (await searchParams) ?? {};
  const privacy = typeof params.privacy === "string" ? params.privacy : null;
  const sales = typeof params.sales === "string" ? params.sales : null;
  const quotesErased = typeof params.quotes === "string" ? params.quotes : null;
  if (!ctx) redirect("/onboarding");
  const admin = isAdminRole(ctx.role);

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          {ctx.organization.name} · plan {ctx.organization.plan} · {ctx.email}
        </p>
      </ListToolbar>
      {admin ? <OrgFamilyPicker initialFamily={parseOrgFamily(ctx.organization.branding)} /> : null}
      {admin ? (
        <form action={saveSalesIdentity} className="border-b border-slate-200 px-4 py-4 lg:px-6">
          <p className="text-sm font-medium text-slate-900">Identité commerciale</p>
          <p className="mt-0.5 max-w-2xl text-xs text-slate-500">
            L’email reçoit le brief d’équipe et sert d’adresse de réponse des emails prospect. Le nom
            apparaît en signature. Un email vide retombe sur celui du propriétaire, un nom vide sur le
            nom de l’entreprise.
          </p>
          {sales === "ok" ? (
            <p className="mt-2 text-sm text-emerald-700">Identité commerciale enregistrée.</p>
          ) : null}
          {sales === "invalid" ? (
            <p className="mt-2 text-sm text-amber-700">Email commercial invalide.</p>
          ) : null}
          {sales === "error" ? (
            <p className="mt-2 text-sm text-red-600">Enregistrement impossible.</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              Email commercial
              <input
                name="sales_email"
                type="email"
                defaultValue={ctx.organization.sales_email ?? ""}
                placeholder="commercial@entreprise.fr"
                autoComplete="email"
                className="mt-1 block w-72 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
              />
            </label>
            <label className="text-sm">
              Nom de l’expéditeur
              <input
                name="sales_name"
                defaultValue={ctx.organization.sales_name ?? ""}
                placeholder={ctx.organization.name}
                maxLength={120}
                className="mt-1 block w-72 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
            >
              Enregistrer
            </button>
          </div>
        </form>
      ) : null}
      <ul className="divide-y divide-slate-100">
        {ROWS.filter((row) => !row.admin || admin).map((row) => (
          <li key={row.href}>
            <Link
              href={row.href}
              className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-slate-50 lg:px-6"
            >
              <span className="text-sm font-medium text-slate-900">{row.label}</span>
              <span className="text-sm text-slate-500">{row.hint}</span>
            </Link>
          </li>
        ))}
      </ul>

      {admin ? (
        <div className="border-t border-slate-100 px-4 py-4 lg:px-6">
          <h2 className="text-sm font-medium text-slate-900">Données personnelles (RGPD)</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Efface / anonymise les devis, sessions et envois marketing liés à un email prospect dans
            votre organisation (droit à l’oubli). Action irréversible.
          </p>
          {privacy === "ok" ? (
            <p className="mt-2 text-sm text-emerald-700">
              Anonymisation effectuée{quotesErased ? ` (${quotesErased} devis)` : ""}.
            </p>
          ) : null}
          {privacy === "invalid" ? (
            <p className="mt-2 text-sm text-amber-700">Email invalide.</p>
          ) : null}
          {privacy === "error" ? (
            <p className="mt-2 text-sm text-red-600">Échec de l’anonymisation.</p>
          ) : null}
          <form action={eraseContactData} className="mt-3 flex flex-wrap items-end gap-2">
            <label className="text-sm">
              Email du prospect
              <input
                name="email"
                type="email"
                required
                placeholder="prospect@entreprise.com"
                className="mt-1 block w-64 rounded-md border border-slate-200 px-3 py-1.5 text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white"
            >
              Anonymiser
            </button>
          </form>
        </div>
      ) : null}
    </ListPanel>
  );
}
