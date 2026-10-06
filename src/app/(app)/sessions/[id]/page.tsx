import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { Chip } from "@/components/ui/chip";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { AbandonProgress } from "@/components/crm/abandon-gauges";
import { formatDate, formatRelative } from "@/lib/format";
import { loadSessionInspection } from "@/lib/crm/session-inspection";

export default async function SessionInspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const { id } = await params;
  const supabase = await createClient();
  const session = await loadSessionInspection(supabase, ctx.organization.id, id);
  if (!session) notFound();

  const title = session.name || session.email || "Visiteur";

  return (
    <ListPanel>
      <ListToolbar>
        <Link href="/sessions" className="mr-auto text-sm text-slate-600 underline">
          Abandons
        </Link>
        <Chip tone="slate">Lecture seule</Chip>
        {session.mode === "chat" ? <Chip tone="violet">Chat</Chip> : <Chip tone="orange">Formulaire</Chip>}
      </ListToolbar>

      <div className="border-b border-slate-100 px-4 py-4 lg:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700">Parcours</p>
        <p className="mt-1 text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">
          {[session.company, session.email || "Pas encore d’email"].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Inspection interne. Cette page ne reprend pas la session du prospect et ne change pas sa dernière activité.
        </p>
      </div>

      <div className="border-b border-slate-100 px-4 py-4 lg:px-6">
        <p className="text-sm font-medium text-slate-900">{session.funnel}</p>
        <div className="mt-2 max-w-xs">
          <AbandonProgress progress={session.progress} step={session.step} stepCount={session.stepCount} />
        </div>
        <p className="mt-2 text-xs text-slate-500">Dernière activité {formatRelative(session.lastActivity)}</p>
        {session.phone ? <p className="mt-1 text-sm text-slate-700">{session.phone}</p> : null}
      </div>

      <div className="border-b border-slate-100 px-4 py-4 lg:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Parcours</p>
        {session.stops.length ? (
          <ol className="mt-3 space-y-3">
            {session.stops.map((stop, index) => (
              <li key={`${stop.at}-${stop.label}-${index}`} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E85D04]" />
                <span className="min-w-0">
                  <span className="block text-sm text-slate-900">{stop.label}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">
                    {[stop.detail, formatDate(stop.at)].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Pas encore de pages enregistrées.</p>
        )}
      </div>

      {session.answers.length ? (
        <div className="border-b border-slate-100 px-4 py-4 lg:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Réponses</p>
          <dl className="mt-3 space-y-2">
            {session.answers.map((answer) => (
              <div key={answer.key} className="flex justify-between gap-4 text-sm">
                <dt className="text-slate-500">{answer.label}</dt>
                <dd className="text-right text-slate-900">{answer.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {session.messages.length ? (
        <div className="px-4 py-4 lg:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Chat</p>
          <ol className="mt-3 space-y-3">
            {session.messages.map((message, index) => (
              <li key={`${message.role}-${index}`} className="text-sm">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  {message.role === "assistant" ? "Assistant" : "Prospect"}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-slate-900">{message.content}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </ListPanel>
  );
}
