import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { Chip } from "@/components/ui/chip";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { MarkUpdatesSeen } from "@/components/app-shell/mark-updates-seen";
import { formatReleaseDate, loadProductUpdates } from "@/lib/updates/load";
import { releaseLabel } from "@/lib/updates/semver";
import { isUnreadVersion } from "@/lib/updates/unread";

export default async function ProductUpdatesPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const snapshot = await loadProductUpdates(supabase, ctx.userId);
  const latestLabel = snapshot.latest ? releaseLabel(snapshot.latest) : null;

  return (
    <ListPanel>
      <MarkUpdatesSeen latestVersion={snapshot.latest} />
      <ListToolbar>
        <p className="mr-auto text-sm text-slate-500">
          {latestLabel ? `Nouveautés produit · version ${latestLabel}` : "Nouveautés produit"}
        </p>
      </ListToolbar>
      {snapshot.entries.length === 0 ? (
        <div className="px-4 py-10 text-sm text-slate-500 lg:px-6">
          Aucune note de version pour le moment.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {snapshot.entries.map((entry) => {
            const unread = isUnreadVersion(entry.version, snapshot.lastSeenVersion);
            const date = formatReleaseDate(entry.releasedAt);
            return (
              <li key={entry.id} className="px-4 py-4 lg:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">
                    Mise à jour {releaseLabel(entry.version)}
                  </p>
                  <Chip tone={unread ? "orange" : "slate"}>{entry.version}</Chip>
                  {unread ? <Chip tone="amber">Nouveau</Chip> : null}
                  {date ? <span className="text-xs text-slate-500">{date}</span> : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{entry.title}</p>
                {entry.items.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {entry.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </ListPanel>
  );
}
