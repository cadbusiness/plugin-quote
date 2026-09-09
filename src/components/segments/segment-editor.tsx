"use client";

import { useState, useTransition } from "react";
import { deleteSegment, saveSegment } from "@/app/(app)/segments/actions";
import { SegmentRulesEditor } from "@/components/segments/create-segment-dialog";
import type { FunnelQuestion } from "@/lib/segments/resolve";
import { parseSegmentRules } from "@/lib/segments/match";
import type { SegmentRule } from "@/lib/segments/types";

export function SegmentEditor({
  segment,
  funnels,
  statuses,
  questions,
}: {
  segment: { id: string; name: string; description: string | null; rules: unknown };
  funnels: { id: string; name: string }[];
  statuses: { slug: string; label: string }[];
  questions: FunnelQuestion[];
}) {
  const [name, setName] = useState(segment.name);
  const [description, setDescription] = useState(segment.description ?? "");
  const [rules, setRules] = useState<SegmentRule[]>(parseSegmentRules(segment.rules).all);
  const [pending, start] = useTransition();

  function submit() {
    const data = new FormData();
    data.set("id", segment.id);
    data.set("name", name);
    data.set("description", description);
    for (const rule of rules) {
      data.append("rule_field", rule.field);
      data.append("rule_op", rule.op);
      data.append("rule_value", rule.value);
      data.append("rule_answer_key", rule.answerKey ?? "");
    }
    start(() => {
      void saveSegment(data);
    });
  }

  return (
    <div className="space-y-4 px-4 py-5 lg:px-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium text-slate-900">Nom</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-900">Description</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <SegmentRulesEditor rules={rules} onChange={setRules} funnels={funnels} statuses={statuses} questions={questions} />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            if (confirm("Supprimer ce segment ?")) void deleteSegment(segment.id);
          }}
          className="text-sm text-rose-700"
        >
          Supprimer
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
