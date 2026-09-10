"use client";

import { useState, useTransition } from "react";
import { inviteQuoteCollaborator, revokeQuoteCollaborator } from "@/app/(app)/crm-actions";
import { Chip, type ChipTone } from "@/components/ui/chip";
import {
  COLLABORATOR_ROLE_LABELS,
  COLLABORATOR_STATUS_LABELS,
  computeValidation,
  type CollaboratorRole,
  type CollaboratorStatus,
} from "@/lib/prospect/collaborators";
import { validationHint } from "@/lib/crm/quote-next-action";
import type { Tables } from "@/lib/db/database.types";

function tone(status: string): ChipTone {
  if (status === "approved") return "emerald";
  if (status === "changes_requested") return "amber";
  if (status === "viewed") return "violet";
  return "slate";
}

function validationTone(status: string | null | undefined): ChipTone {
  if (status === "approved") return "emerald";
  if (status === "changes_requested") return "amber";
  if (status === "partial") return "orange";
  if (status === "pending") return "violet";
  return "slate";
}

function validationLabel(stats: ReturnType<typeof computeValidation>) {
  if (stats.validation_status === "approved") {
    return `Validé · ${stats.validation_approved_count}/${stats.validation_total_count}`;
  }
  if (stats.validation_status === "changes_requested") return "Modifications demandées";
  if (stats.validation_status === "partial" || stats.validation_status === "pending") {
    return `${stats.validation_approved_count}/${stats.validation_total_count} validations`;
  }
  return null;
}

export function QuoteValidationSection({
  quoteId,
  quote,
  collaborators,
  variant = "full",
}: {
  quoteId: string;
  quote?: Tables<"quotes">;
  collaborators: Tables<"quote_collaborators">[];
  variant?: "full" | "rail";
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("finance");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const stats = computeValidation(collaborators);
  const label = validationLabel(stats);
  const hint = validationHint(quote?.contact_company);
  const rail = variant === "rail";

  function submit() {
    setError(null);
    start(async () => {
      const result = await inviteQuoteCollaborator(quoteId, { name, email, role });
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setStep(0);
      setName("");
      setEmail("");
      setRole("finance");
    });
  }

  return (
    <section className={rail ? "border-b border-slate-100 px-4 py-5 lg:px-5" : "border-b border-slate-100 px-4 py-5 lg:px-6"}>
      <div className={rail ? "" : "flex flex-wrap items-start justify-between gap-3"}>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {rail ? "Validation côté client" : "Validation interne"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {rail
              ? hint
              : "Partagez le dossier aux décideurs du prospect. Ils valident ou demandent des modifications sans PDF."}
          </p>
          {label ? (
            <div className="mt-2">
              <Chip tone={validationTone(stats.validation_status)}>{label}</Chip>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setStep(0);
            setError(null);
          }}
          className={
            rail
              ? "mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
              : "rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
          }
        >
          Inviter un décideur
        </button>
      </div>

      {collaborators.length ? (
        <ul className={`mt-4 divide-y divide-slate-100 ${rail ? "" : "border-y border-slate-100"}`}>
          {collaborators.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{row.name}</p>
                <p className="text-xs text-slate-500">
                  {COLLABORATOR_ROLE_LABELS[row.role as CollaboratorRole] ?? "Décideur"} · {row.email}
                </p>
                {row.budget_max != null ? (
                  <p className="text-xs text-slate-500">Budget max {Number(row.budget_max).toLocaleString("fr-FR")} €</p>
                ) : null}
                {row.comment ? <p className="mt-0.5 text-xs text-slate-600">{row.comment}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <Chip tone={tone(row.status)}>
                  {COLLABORATOR_STATUS_LABELS[row.status as CollaboratorStatus] ?? row.status}
                </Chip>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => start(() => void revokeQuoteCollaborator(quoteId, row.id))}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : rail ? null : (
        <p className="mt-3 text-sm text-slate-400">Aucun décideur invité pour l’instant.</p>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => !pending && setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-collab-title"
            className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
                Décideur · {step + 1} / 2
              </p>
              <h2 id="invite-collab-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 ? "Quel rôle ?" : "Coordonnées"}
              </h2>
            </div>
            <div className="px-5 py-4">
              {step === 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(COLLABORATOR_ROLE_LABELS) as CollaboratorRole[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRole(key)}
                      className={`rounded-lg px-3 py-3 text-left text-sm ring-1 ${
                        role === key
                          ? "bg-orange-50 text-[#C2410C] ring-orange-200"
                          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-medium">{COLLABORATOR_ROLE_LABELS[key]}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {key === "finance" && "Budget et validation financière"}
                        {key === "technical" && "Faisabilité et contraintes techniques"}
                        {key === "buyer" && "Finalisation et conditions d’achat"}
                        {key === "other" && "Autre décideur interne"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm">
                    <span className="text-slate-600">Nom</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Camille Dupont"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-slate-600">Email</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      placeholder="df@entreprise.fr"
                    />
                  </label>
                  <p className="text-xs text-slate-500">
                    Un lien magique lui ouvre l’espace prospect : configuration, budget, validation.
                  </p>
                  {error ? <p className="text-sm text-rose-600">{error}</p> : null}
                </div>
              )}
            </div>
            <div className="flex justify-between border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => (step === 0 ? setOpen(false) : setStep(0))}
                className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                {step === 0 ? "Annuler" : "Retour"}
              </button>
              {step === 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
                >
                  Continuer
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pending || !name.trim() || !email.trim()}
                  onClick={submit}
                  className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-60"
                >
                  Envoyer l’invitation
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
