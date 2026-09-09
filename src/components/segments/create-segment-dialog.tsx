"use client";

import { useEffect, useState, useTransition } from "react";
import { createSegment } from "@/app/(app)/segments/actions";
import type { FunnelQuestion } from "@/lib/segments/resolve";
import type { SegmentField, SegmentOp, SegmentRule } from "@/lib/segments/types";

const PRESETS: { title: string; blurb: string; tint: string; rules: SegmentRule[] }[] = [
  {
    title: "B2B",
    blurb: "Une société renseignée. Pour ne pas mélanger avec les particuliers.",
    tint: "bg-indigo-50 text-indigo-900 ring-indigo-200",
    rules: [{ field: "audience", op: "eq", value: "b2b" }],
  },
  {
    title: "B2C",
    blurb: "Pas de société. Le particulier qui a configuré un devis.",
    tint: "bg-sky-50 text-sky-900 ring-sky-200",
    rules: [{ field: "audience", op: "eq", value: "b2c" }],
  },
  {
    title: "Hot",
    blurb: "Score chaud. Ceux à relancer en premier.",
    tint: "bg-rose-50 text-rose-900 ring-rose-200",
    rules: [{ field: "score_label", op: "eq", value: "hot" }],
  },
  {
    title: "Pas relancés",
    blurb: "Jamais d’email marketing. Évite de retomber sur les mêmes.",
    tint: "bg-amber-50 text-amber-900 ring-amber-200",
    rules: [{ field: "recently_contacted", op: "never", value: "" }],
  },
];

export function CreateSegmentDialog({
  funnels,
  statuses,
  questions,
}: {
  funnels: { id: string; name: string }[];
  statuses: { slug: string; label: string }[];
  questions: FunnelQuestion[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("B2B");
  const [rules, setRules] = useState<SegmentRule[]>(PRESETS[0].rules);
  const [pending, start] = useTransition();

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#nouveau") {
        setOpen(true);
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  function submit() {
    const data = new FormData();
    data.set("name", name.trim());
    for (const rule of rules) {
      data.append("rule_field", rule.field);
      data.append("rule_op", rule.op);
      data.append("rule_value", rule.value);
      data.append("rule_answer_key", rule.answerKey ?? "");
    }
    start(() => {
      void createSegment(data);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStep(0);
        }}
        className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
      >
        Nouveau segment
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={() => !pending && setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="segment-title"
            className="relative z-10 flex max-h-[min(42rem,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">Segment · {step + 1} / 3</p>
              <h2 id="segment-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 && "Par quoi commencer ?"}
                {step === 1 && "Affiner les règles"}
                {step === 2 && "Nommer le segment"}
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div hidden={step !== 0} className="grid gap-2 sm:grid-cols-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => {
                      setRules(preset.rules);
                      setName(preset.title);
                    }}
                    className={`rounded-lg px-3 py-3 text-left ring-1 ${
                      name === preset.title ? `${preset.tint} ring-current` : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-medium">{preset.title}</span>
                    <span className="mt-1 block text-xs leading-5 opacity-80">{preset.blurb}</span>
                  </button>
                ))}
              </div>

              <div hidden={step !== 1}>
                <SegmentRulesEditor
                  rules={rules}
                  onChange={setRules}
                  funnels={funnels}
                  statuses={statuses}
                  questions={questions}
                />
              </div>

              <div hidden={step !== 2}>
                <label className="block text-sm">
                  <span className="font-medium text-slate-900">Nom</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500 hover:text-slate-900">
                Annuler
              </button>
              <div className="flex gap-2">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
                    Retour
                  </button>
                ) : null}
                {step < 2 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
                  >
                    Continuer
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pending || name.trim().length < 2}
                    onClick={submit}
                    className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
                  >
                    {pending ? "Création…" : "Créer le segment"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function SegmentRulesEditor({
  rules,
  onChange,
  funnels,
  statuses,
  questions,
}: {
  rules: SegmentRule[];
  onChange: (rules: SegmentRule[]) => void;
  funnels: { id: string; name: string }[];
  statuses: { slug: string; label: string }[];
  questions: FunnelQuestion[];
}) {
  function patch(index: number, patch: Partial<SegmentRule>) {
    onChange(rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  }

  return (
    <div className="space-y-3">
      {rules.map((rule, index) => (
        <div key={`${rule.field}-${index}`} className="grid gap-2 sm:grid-cols-12">
          <select
            value={rule.field}
            onChange={(event) => patch(index, { field: event.target.value as SegmentField, value: "", answerKey: "" })}
            className="rounded-md border border-slate-200 px-2 py-2 text-sm sm:col-span-3"
          >
            <option value="audience">Audience</option>
            <option value="funnel">Funnel</option>
            <option value="score_label">Score</option>
            <option value="status">Statut</option>
            <option value="answer">Réponse funnel</option>
            <option value="recently_contacted">Dernier email</option>
          </select>
          <select
            value={rule.op}
            onChange={(event) => patch(index, { op: event.target.value as SegmentOp })}
            className="rounded-md border border-slate-200 px-2 py-2 text-sm sm:col-span-3"
          >
            {opsFor(rule.field).map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
          <ValueField rule={rule} funnels={funnels} statuses={statuses} questions={questions} onChange={(next) => patch(index, next)} />
          <button
            type="button"
            onClick={() => onChange(rules.filter((_, i) => i !== index))}
            className="text-sm text-slate-500 hover:text-rose-700 sm:col-span-1"
          >
            Retirer
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rules, { field: "audience", op: "eq", value: "b2b" }])}
        className="text-sm font-medium text-[#C2410C]"
      >
        Ajouter une règle
      </button>
      <p className="text-xs text-slate-500">Toutes les règles doivent être vraies. Un contact B2B hot d’un funnel cuisine, pas un B2C relancé hier.</p>
    </div>
  );
}

function opsFor(field: SegmentField): { value: SegmentOp; label: string }[] {
  if (field === "recently_contacted") {
    return [
      { value: "never", label: "jamais relancé" },
      { value: "older_than", label: "il y a plus de (jours)" },
    ];
  }
  if (field === "answer") {
    return [
      { value: "eq", label: "est" },
      { value: "neq", label: "n’est pas" },
      { value: "contains", label: "contient" },
    ];
  }
  return [
    { value: "eq", label: "est" },
    { value: "neq", label: "n’est pas" },
  ];
}

function ValueField({
  rule,
  funnels,
  statuses,
  questions,
  onChange,
}: {
  rule: SegmentRule;
  funnels: { id: string; name: string }[];
  statuses: { slug: string; label: string }[];
  questions: FunnelQuestion[];
  onChange: (patch: Partial<SegmentRule>) => void;
}) {
  if (rule.field === "recently_contacted" && rule.op === "never") {
    return <span className="sm:col-span-5" />;
  }
  if (rule.field === "audience") {
    return (
      <select
        value={rule.value}
        onChange={(event) => onChange({ value: event.target.value })}
        className="rounded-md border border-slate-200 px-2 py-2 text-sm sm:col-span-5"
      >
        <option value="b2b">B2B (société)</option>
        <option value="b2c">B2C (particulier)</option>
      </select>
    );
  }
  if (rule.field === "funnel") {
    return (
      <select
        value={rule.value}
        onChange={(event) => onChange({ value: event.target.value })}
        className="rounded-md border border-slate-200 px-2 py-2 text-sm sm:col-span-5"
      >
        {funnels.map((funnel) => (
          <option key={funnel.id} value={funnel.id}>
            {funnel.name}
          </option>
        ))}
      </select>
    );
  }
  if (rule.field === "score_label") {
    return (
      <select
        value={rule.value}
        onChange={(event) => onChange({ value: event.target.value })}
        className="rounded-md border border-slate-200 px-2 py-2 text-sm sm:col-span-5"
      >
        <option value="hot">Hot</option>
        <option value="warm">Warm</option>
        <option value="cold">Cold</option>
      </select>
    );
  }
  if (rule.field === "status") {
    return (
      <select
        value={rule.value}
        onChange={(event) => onChange({ value: event.target.value })}
        className="rounded-md border border-slate-200 px-2 py-2 text-sm sm:col-span-5"
      >
        {statuses.map((status) => (
          <option key={status.slug} value={status.slug}>
            {status.label}
          </option>
        ))}
      </select>
    );
  }
  if (rule.field === "answer") {
    const question = questions.find((item) => item.key === rule.answerKey);
    return (
      <div className="grid gap-2 sm:col-span-5 sm:grid-cols-2">
        <select
          value={rule.answerKey ?? ""}
          onChange={(event) => onChange({ answerKey: event.target.value, value: "" })}
          className="rounded-md border border-slate-200 px-2 py-2 text-sm"
        >
          <option value="">Question</option>
          {questions.map((item) => (
            <option key={`${item.configuratorId}-${item.key}`} value={item.key}>
              {item.funnelName} · {item.label}
            </option>
          ))}
        </select>
        {question?.choices.length ? (
          <select
            value={rule.value}
            onChange={(event) => onChange({ value: event.target.value })}
            className="rounded-md border border-slate-200 px-2 py-2 text-sm"
          >
            <option value="">Réponse</option>
            {question.choices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={rule.value}
            onChange={(event) => onChange({ value: event.target.value })}
            placeholder="valeur"
            className="rounded-md border border-slate-200 px-2 py-2 text-sm"
          />
        )}
      </div>
    );
  }
  return (
    <input
      value={rule.value}
      onChange={(event) => onChange({ value: event.target.value })}
      className="rounded-md border border-slate-200 px-2 py-2 text-sm sm:col-span-5"
    />
  );
}
