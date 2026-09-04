"use client";

import type { BranchCondition, BranchField, EmailRecipient, WorkflowNode } from "@/lib/workflows/types";
import { TEMPLATE_LABELS } from "@/lib/workflows/labels";

const FIELDS: { id: BranchField; label: string }[] = [
  { id: "score_label", label: "Score (hot / warm / cold)" },
  { id: "score_gte", label: "Score ≥" },
  { id: "status", label: "Statut" },
  { id: "is_closed", label: "Dossier clos" },
  { id: "assigned", label: "Assigné" },
  { id: "has_company", label: "Société renseignée" },
  { id: "answer", label: "Réponse funnel" },
  { id: "has_product", label: "Produit suggéré" },
];

export function NodeInspector({
  node,
  templates,
  statuses,
  members,
  onChange,
  onDelete,
}: {
  node: WorkflowNode;
  templates: { kind: string; subject: string }[];
  statuses: { slug: string; label: string }[];
  members: { userId: string; label: string }[];
  onChange: (data: WorkflowNode["data"]) => void;
  onDelete: () => void;
}) {
  const data = node.data;

  function patch(partial: Partial<WorkflowNode["data"]>) {
    onChange({ ...data, ...partial });
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">Étape</p>
        <input
          value={data.label ?? ""}
          onChange={(e) => patch({ label: e.target.value })}
          placeholder="Libellé"
          className="mt-1 w-full border border-slate-200 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm">
        {node.type === "send_email" ? (
          <>
            <Field label="Template">
              <select
                value={data.templateKind ?? ""}
                onChange={(e) => patch({ templateKind: e.target.value })}
                className="w-full border border-slate-200 px-2 py-1.5"
              >
                <option value="">Choisir</option>
                {templates.map((template) => (
                  <option key={template.kind} value={template.kind}>
                    {TEMPLATE_LABELS[template.kind] ?? template.kind}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Destinataire">
              <select
                value={data.recipient ?? "prospect"}
                onChange={(e) => patch({ recipient: e.target.value as EmailRecipient })}
                className="w-full border border-slate-200 px-2 py-1.5"
              >
                <option value="prospect">Prospect</option>
                <option value="assignee">Commercial assigné</option>
                <option value="sales_email">Email commercial</option>
              </select>
            </Field>
            <label className="block rounded-lg border border-slate-200 p-3">
              <span className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={Boolean(data.attachPdf)}
                  onChange={(e) => patch({ attachPdf: e.target.checked })}
                />
                <span>
                  <span className="block font-medium text-slate-900">Joindre le récapitulatif</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                    Le client reçoit un PDF de sa demande : produits, fourchette de prix, réponses. Utile à la
                    confirmation. Inutile sur une relance d’abandon — il n’y a pas encore de devis.
                  </span>
                </span>
              </span>
            </label>
          </>
        ) : null}

        {node.type === "wait" ? (
          <>
            <Field label="Délai (heures)">
              <input
                type="number"
                min={0}
                value={data.waitHours ?? 1}
                onChange={(e) => patch({ waitHours: Number(e.target.value) })}
                className="w-full border border-slate-200 px-2 py-1.5"
              />
            </Field>
            <Field label="Référence">
              <select
                value={data.waitFrom ?? "now"}
                onChange={(e) => patch({ waitFrom: e.target.value as "now" | "last_activity" })}
                className="w-full border border-slate-200 px-2 py-1.5"
              >
                <option value="now">Depuis cette étape</option>
                <option value="last_activity">Depuis la dernière activité</option>
              </select>
            </Field>
          </>
        ) : null}

        {node.type === "branch" ? (
          <div className="space-y-3">
            {(data.conditions ?? []).map((condition, index) => (
              <div key={condition.id} className="space-y-2 border border-slate-200 p-2">
                <Field label={`Branche ${condition.id}`}>
                  <select
                    value={condition.field}
                    onChange={(e) => updateCondition(index, { field: e.target.value as BranchField })}
                    className="w-full border border-slate-200 px-2 py-1.5"
                  >
                    {FIELDS.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </Field>
                {condition.field === "answer" ? (
                  <input
                    value={condition.answerKey ?? ""}
                    onChange={(e) => updateCondition(index, { answerKey: e.target.value })}
                    placeholder="Clé de réponse"
                    className="w-full border border-slate-200 px-2 py-1.5"
                  />
                ) : null}
                <input
                  value={condition.value === undefined ? "" : String(condition.value)}
                  onChange={(e) => updateCondition(index, { value: parseValue(condition.field, e.target.value) })}
                  placeholder="Valeur"
                  className="w-full border border-slate-200 px-2 py-1.5"
                />
                <button type="button" className="text-xs underline" onClick={() => removeCondition(index)}>
                  Retirer
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-[#E85D04] underline"
              onClick={() =>
                patch({
                  conditions: [
                    ...(data.conditions ?? []),
                    { id: `si${(data.conditions?.length ?? 0) + 1}`, field: "score_label", value: "hot" },
                  ],
                })
              }
            >
              Ajouter une branche
            </button>
          </div>
        ) : null}

        {node.type === "assign" ? (
          <Field label="Commercial">
            <select
              value={data.userId ?? ""}
              onChange={(e) => patch({ userId: e.target.value || null })}
              className="w-full border border-slate-200 px-2 py-1.5"
            >
              <option value="">Premier admin</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {node.type === "set_status" ? (
          <Field label="Nouveau statut">
            <select
              value={data.statusSlug ?? ""}
              onChange={(e) => patch({ statusSlug: e.target.value })}
              className="w-full border border-slate-200 px-2 py-1.5"
            >
              <option value="">Choisir</option>
              {statuses.map((status) => (
                <option key={status.slug} value={status.slug}>
                  {status.label}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        {node.type === "trigger" || node.type === "exit" ? (
          <p className="text-slate-500">
            {node.type === "trigger"
              ? "Le parcours démarre ici. Reliez les premières actions en dessous."
              : "Cette branche s’arrête ici."}
          </p>
        ) : null}
      </div>
      {node.type !== "trigger" ? (
        <div className="border-t border-rose-100 bg-rose-50/40 px-4 py-3">
          <button
            type="button"
            onClick={onDelete}
            className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            Supprimer cette étape
          </button>
          <p className="mt-1.5 text-xs leading-relaxed text-rose-700/80">
            Le parcours se recollera tout seul. Les emails déjà envoyés ne sont pas annulés.
          </p>
        </div>
      ) : null}
    </aside>
  );

  function updateCondition(index: number, partial: Partial<BranchCondition>) {
    const next = [...(data.conditions ?? [])];
    next[index] = { ...next[index], ...partial };
    patch({ conditions: next });
  }

  function removeCondition(index: number) {
    patch({ conditions: (data.conditions ?? []).filter((_, i) => i !== index) });
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function parseValue(field: BranchField, raw: string): string | number | boolean {
  if (field === "is_closed" || field === "assigned" || field === "has_company") {
    return raw === "true" || raw === "1" || raw === "oui";
  }
  if (field === "score_gte") return Number(raw);
  return raw;
}
