import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";

const ROWS: { href: string; label: string; hint: string; admin?: boolean }[] = [
  {
    href: "/integrations",
    label: "Boutiques connectées",
    hint: "WooCommerce, Shopify — sync du catalogue",
    admin: true,
  },
  { href: "/webhooks", label: "API & webhooks", hint: "Notifications vers vos outils", admin: true },
  { href: "/templates", label: "Emails", hint: "Templates prospect et commercial", admin: true },
  { href: "/equipe", label: "Équipe", hint: "Membres et rôles", admin: true },
  { href: "/stats", label: "GA4", hint: "Identifiant de mesure", admin: true },
];

export default async function SettingsPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const admin = isAdminRole(ctx.role);

  return (
    <ListPanel>
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          {ctx.organization.name} · plan {ctx.organization.plan} · {ctx.email}
        </p>
      </ListToolbar>
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
    </ListPanel>
  );
}
