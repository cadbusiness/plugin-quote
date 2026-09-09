"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ProspectBundle } from "@/lib/prospect/access";
import {
  COLLABORATOR_ROLE_LABELS,
  COLLABORATOR_STATUS_LABELS,
  type CollaboratorRole,
  type CollaboratorStatus,
} from "@/lib/prospect/collaborators";
import { Chip, type ChipTone } from "@/components/ui/chip";
import { formatPrice } from "@/lib/format";

const PIPELINE = ["Reçu", "En étude", "Devis envoyé", "Accepté"];

function stageIndex(status: ProspectBundle["statuses"][number] | undefined) {
  const slug = status?.slug ?? "new";
  if (slug === "won") return 3;
  if (slug === "in_progress" || slug === "waiting") return 2;
  if (slug === "contacted") return 1;
  return 0;
}

function collaboratorTone(status: string): ChipTone {
  if (status === "approved") return "emerald";
  if (status === "changes_requested") return "amber";
  if (status === "viewed") return "violet";
  return "slate";
}

export function ProspectSpace({ token, bundle }: { token: string; bundle: ProspectBundle }) {
  const router = useRouter();
  const isCollaborator = bundle.viewer.kind === "collaborator";
  const me = bundle.viewer.kind === "collaborator" ? bundle.viewer.collaborator : null;
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>("finance");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [budgetMax, setBudgetMax] = useState(me?.budget_max != null ? String(me.budget_max) : "");
  const [decisionComment, setDecisionComment] = useState(me?.comment ?? "");
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const status = bundle.statuses.find((s) => s.id === bundle.quote.status_id);
  const stage = stageIndex(status);
  const totals = rangeTotal(bundle.items);
  const decided = me?.status === "approved" || me?.status === "changes_requested";

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    await fetch(`/api/public/suivi/${token}/message`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
    setMessage("");
    router.refresh();
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("note", note);
    await fetch(`/api/public/suivi/${token}/upload`, { method: "POST", body: form });
    setNote("");
    router.refresh();
  }

  function invite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    start(async () => {
      const res = await fetch(`/api/public/suivi/${token}/invite`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInviteError(typeof data.error === "string" ? data.error : "Invitation impossible");
        return;
      }
      setInviteName("");
      setInviteEmail("");
      setInviteRole("finance");
      router.refresh();
    });
  }

  function decide(decision: "approved" | "changes_requested") {
    setDecisionError(null);
    start(async () => {
      const res = await fetch(`/api/public/suivi/${token}/decide`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          decision,
          budget_max: budgetMax.trim() ? Number(budgetMax.replace(",", ".")) : null,
          comment: decisionComment,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDecisionError(typeof data.error === "string" ? data.error : "Action impossible");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-6 py-10">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {isCollaborator ? "Validation interne" : "Votre demande"}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">
        {isCollaborator ? me?.name : bundle.quote.contact_name}
      </h1>
      <p className="text-sm text-slate-500">
        {isCollaborator
          ? `Dossier ${bundle.quote.contact_company || bundle.quote.contact_name} · ${
              COLLABORATOR_ROLE_LABELS[(me?.role as CollaboratorRole) ?? "other"]
            }`
          : bundle.quote.contact_company || bundle.quote.contact_email}
      </p>

      <div className="mt-8 grid grid-cols-4 gap-2">
        {PIPELINE.map((label, i) => (
          <div key={label}>
            <div className={`h-1.5 rounded-full ${i <= stage ? "bg-slate-950" : "bg-slate-200"}`} />
            <p className={`mt-2 text-xs ${i <= stage ? "font-medium text-slate-900" : "text-slate-400"}`}>{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Configuration</h2>
        <ul className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
          {bundle.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2.5 text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="text-slate-500">
                {item.price_min ?? "-"} – {item.price_max ?? "-"} €
              </span>
            </li>
          ))}
          {!bundle.items.length ? (
            <li className="py-2.5 text-sm text-slate-500">Pas encore de produits associés.</li>
          ) : null}
        </ul>
        {bundle.items.length ? (
          <p className="mt-2 text-sm font-medium text-slate-900">Total indicatif · {formatPrice(totals.min, totals.max)}</p>
        ) : null}
      </section>

      {isCollaborator ? (
        <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50/80 p-5">
          <h2 className="text-lg font-semibold">Votre validation</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ajoutez une contrainte budgétaire si besoin, puis validez ou demandez des modifications.
          </p>
          {decided ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Chip tone={collaboratorTone(me!.status)}>
                {COLLABORATOR_STATUS_LABELS[me!.status as CollaboratorStatus]}
              </Chip>
              {me?.budget_max != null ? (
                <span className="text-sm text-slate-600">Budget max {Number(me.budget_max).toLocaleString("fr-FR")} €</span>
              ) : null}
              {me?.comment ? <p className="w-full text-sm text-slate-700">{me.comment}</p> : null}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="text-slate-600">Contrainte budgétaire (€)</span>
                <input
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  inputMode="decimal"
                  placeholder="Ex. 45000"
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Commentaire</span>
                <textarea
                  value={decisionComment}
                  onChange={(e) => setDecisionComment(e.target.value)}
                  rows={3}
                  placeholder="Points à ajuster, délais, conditions…"
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </label>
              {decisionError ? <p className="text-sm text-rose-600">{decisionError}</p> : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => decide("approved")}
                  className="rounded-md bg-[#E85D04] px-3 py-2 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-60"
                >
                  Valider le dossier
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => decide("changes_requested")}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                >
                  Demander des modifications
                </button>
              </div>
            </div>
          )}
        </section>
      ) : null}

      {!isCollaborator ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Partager pour validation</h2>
          <p className="mt-1 text-sm text-slate-500">
            Envoyez ce dossier à votre directeur financier, responsable technique ou acheteur. Ils voient la
            configuration, ajoutent leurs contraintes, et valident sans PDF perdu.
          </p>
          {bundle.collaborators.length ? (
            <ul className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
              {bundle.collaborators.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-500">
                      {COLLABORATOR_ROLE_LABELS[row.role as CollaboratorRole] ?? "Décideur"} · {row.email}
                    </p>
                  </div>
                  <Chip tone={collaboratorTone(row.status)}>
                    {COLLABORATOR_STATUS_LABELS[row.status as CollaboratorStatus] ?? row.status}
                  </Chip>
                </li>
              ))}
            </ul>
          ) : null}
          <form onSubmit={invite} className="mt-4 grid gap-2 sm:grid-cols-2">
            <input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              required
              placeholder="Nom du décideur"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              type="email"
              placeholder="Email"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
            >
              {(Object.keys(COLLABORATOR_ROLE_LABELS) as CollaboratorRole[]).map((role) => (
                <option key={role} value={role}>
                  {COLLABORATOR_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            {inviteError ? <p className="text-sm text-rose-600 sm:col-span-2">{inviteError}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[#E85D04] px-3 py-2 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-60 sm:col-span-2"
            >
              Envoyer le lien de validation
            </button>
          </form>
        </section>
      ) : null}

      {!isCollaborator ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Compléter la demande</h2>
          <p className="mt-1 text-sm text-slate-500">Photo, plan, mesures oubliées.</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optionnel)"
            className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <input type="file" onChange={upload} className="mt-2 text-sm" />
          <ul className="mt-3 text-sm text-slate-600">
            {bundle.files.map((file) => (
              <li key={file.id}>{file.file_name}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {!isCollaborator ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Messages</h2>
          <div className="mt-3 space-y-2">
            {bundle.messages.map((m) => (
              <p
                key={m.id}
                className={`rounded-xl px-3 py-2 text-sm ${
                  m.sender === "prospect" ? "bg-slate-950 text-white" : "bg-slate-100"
                }`}
              >
                {m.content}
              </p>
            ))}
          </div>
          <form onSubmit={sendMessage} className="mt-3 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Écrire à l’équipe…"
            />
            <button className="rounded-md bg-slate-950 px-3 py-2 text-sm text-white">Envoyer</button>
          </form>
        </section>
      ) : null}

      {isCollaborator && bundle.collaborators.length > 1 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Autres décideurs</h2>
          <ul className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
            {bundle.collaborators
              .filter((row) => row.id !== me?.id)
              .map((row) => (
                <li key={row.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>
                    {row.name}
                    <span className="text-slate-400">
                      {" "}
                      · {COLLABORATOR_ROLE_LABELS[row.role as CollaboratorRole] ?? "Décideur"}
                    </span>
                  </span>
                  <Chip tone={collaboratorTone(row.status)}>
                    {COLLABORATOR_STATUS_LABELS[row.status as CollaboratorStatus] ?? row.status}
                  </Chip>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function rangeTotal(items: ProspectBundle["items"]) {
  let min = 0;
  let max = 0;
  let hasMin = false;
  let hasMax = false;
  for (const item of items) {
    const qty = item.quantity || 1;
    if (item.price_min != null) {
      min += item.price_min * qty;
      hasMin = true;
    }
    if (item.price_max != null) {
      max += item.price_max * qty;
      hasMax = true;
    } else if (item.price_min != null) {
      max += item.price_min * qty;
      hasMax = true;
    }
  }
  return { min: hasMin ? min : null, max: hasMax ? max : null };
}
