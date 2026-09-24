"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/marketing/copy-button";
import {
  CHECKLIST_MENTIONS_GROUPS,
  CHECKLIST_MENTIONS_ITEMS,
  computeChecklistMentions,
  type ChecklistMentionsTone,
} from "@/lib/marketing/checklist-mentions-devis";

export function ChecklistMentionsDevis() {
  const [checked, setChecked] = useState<string[]>([]);
  const [recap, setRecap] = useState("");

  const result = useMemo(() => computeChecklistMentions(checked), [checked]);

  useEffect(() => {
    setRecap(result.recap);
  }, [result.recap]);

  function toggle(id: string) {
    setChecked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6" aria-live="polite">
        <div className="flex items-baseline justify-between gap-4 text-sm font-semibold">
          <span>Progression</span>
          <span className="tabular-nums text-mk-accent">{result.pctLabel}</span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-mk-band"
          role="progressbar"
          aria-valuenow={result.pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progression de la checklist"
        >
          <div className="h-full rounded-full bg-mk-accent" style={{ width: `${result.pct}%` }} />
        </div>
        <p className="mt-3 text-sm text-mk-muted">{result.countLabel}</p>
        <p className={`mt-3 rounded-xl px-3 py-3 text-sm font-semibold ${alertClass(result.alertTone)}`}>
          {result.alert}
        </p>
        <p className="mt-3 rounded-xl bg-mk-band px-3 py-3 text-sm leading-6 text-mk-ink">{result.tip}</p>
      </div>

      {CHECKLIST_MENTIONS_GROUPS.map((group) => (
        <fieldset key={group.id} className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
          <legend className="text-sm font-semibold">{group.title}</legend>
          <ul className="mt-3 divide-y divide-mk-border">
            {group.items.map((item) => {
              const inputId = `mentions-${item.id}`;
              return (
                <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={checked.includes(item.id)}
                    onChange={() => toggle(item.id)}
                    className="mt-1 size-4 shrink-0 accent-[#E85D04]"
                  />
                  <label htmlFor={inputId} className="cursor-pointer text-sm font-medium leading-6">
                    {item.title}
                    <span className="mt-0.5 block text-[13px] font-normal leading-5 text-mk-muted">{item.hint}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}

      <div className="rounded-2xl bg-white p-5 ring-1 ring-mk-border sm:p-6">
        <h2 className="text-sm font-semibold">Récap des manques</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton text={recap} label="Copier le récap des manques" />
          <button
            type="button"
            onClick={() => setChecked([])}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-mk-ink ring-1 ring-mk-border hover:bg-mk-band"
          >
            Tout décocher
          </button>
        </div>
        <label className="mt-4 block text-[12px] leading-5 text-mk-muted">
          Texte généré (modifiable avant copie)
          <textarea
            value={recap}
            onChange={(event) => setRecap(event.target.value)}
            className="mt-2 h-44 w-full resize-y rounded-xl bg-mk-bg px-3 py-2 text-xs leading-5 text-mk-ink ring-1 ring-mk-border"
          />
        </label>
        <p className="mt-3 text-xs leading-5 text-mk-muted">
          {CHECKLIST_MENTIONS_ITEMS.length} items. Calcul 100 % local. Aucune donnée n’est envoyée. Pas un conseil juridique.
        </p>
      </div>
    </div>
  );
}

function alertClass(tone: ChecklistMentionsTone) {
  if (tone === "ok") return "bg-emerald-50 text-emerald-800";
  if (tone === "warn") return "bg-amber-50 text-amber-900";
  if (tone === "bad") return "bg-rose-50 text-rose-800";
  return "bg-mk-band text-mk-ink";
}
