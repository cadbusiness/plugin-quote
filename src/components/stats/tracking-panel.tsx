import { ANALYTICS_EVENTS } from "@/lib/stats/events";
import { Chip } from "@/components/ui/chip";
import { DataTable } from "@/components/ui/list-panel";
import { saveOrgTracking } from "@/app/(app)/crm-actions";

const EVENTS: { id: string; when: string }[] = [
  { id: ANALYTICS_EVENTS.pageView, when: "Ouverture du funnel" },
  { id: ANALYTICS_EVENTS.started, when: "Première réponse" },
  { id: ANALYTICS_EVENTS.email, when: "Email capturé" },
  { id: ANALYTICS_EVENTS.completed, when: "Parcours terminé" },
  { id: ANALYTICS_EVENTS.submitted, when: "Demande envoyée" },
  { id: ANALYTICS_EVENTS.abandoned, when: "Onglet fermé sans envoi" },
];

export function StatsTrackingPanel({
  ga,
  gtm,
  error,
}: {
  ga: string;
  gtm: string;
  error?: string;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 lg:px-6">
        <Chip tone={ga ? "emerald" : "slate"}>{ga ? `GA4 ${ga}` : "GA4 off"}</Chip>
        <Chip tone={gtm ? "violet" : "slate"}>{gtm ? `GTM ${gtm}` : "GTM off"}</Chip>
        <p className="text-sm text-slate-500">
          Les jauges QuoteBuilder marchent sans Google. Branchez Ads / Analytics ici pour le remarketing.
        </p>
      </div>

      <form action={saveOrgTracking} className="grid gap-5 border-b border-slate-200 px-4 py-5 lg:px-6">
        <label className="block text-sm">
          <span className="font-medium text-slate-900">Google Analytics 4</span>
          <span className="mt-0.5 block text-slate-500">
            ID de mesure · Admin GA4 → Flux de données. Format <span className="font-mono">G-XXXXXXXX</span>.
          </span>
          <input
            name="ga_measurement_id"
            defaultValue={ga}
            placeholder="G-XXXXXXXX"
            className="mt-2 w-full max-w-md rounded-md border border-slate-200 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-900">Google Tag Manager</span>
          <span className="mt-0.5 block text-slate-500">
            Conteneur web · GTM → Espace de travail. Si GTM est branché, GA4 passe par GTM (pas de double comptage).
            Format <span className="font-mono">GTM-XXXXXXX</span>.
          </span>
          <input
            name="gtm_container_id"
            defaultValue={gtm}
            placeholder="GTM-XXXXXXX"
            className="mt-2 w-full max-w-md rounded-md border border-slate-200 px-3 py-2 font-mono text-sm"
          />
        </label>
        {error === "ga" ? (
          <p className="text-sm text-rose-700">L’ID GA4 doit ressembler à G-XXXXXXXX.</p>
        ) : null}
        {error === "gtm" ? (
          <p className="text-sm text-rose-700">L’ID GTM doit ressembler à GTM-XXXXXXX.</p>
        ) : null}
        <div>
          <button className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D45203]">
            Enregistrer
          </button>
        </div>
      </form>

      <div className="border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Événements envoyés</p>
        <p className="mt-0.5 text-sm text-slate-500">dataLayer + GA4, sur chaque funnel public.</p>
      </div>
      <DataTable headers={["Événement", "Quand"]}>
        {EVENTS.map((event) => (
          <tr key={event.id} className="border-b border-slate-100">
            <td className="px-4 py-2.5 font-mono text-xs text-slate-900 lg:px-6">{event.id}</td>
            <td className="px-4 py-2.5 text-sm text-slate-600 lg:px-6">{event.when}</td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
