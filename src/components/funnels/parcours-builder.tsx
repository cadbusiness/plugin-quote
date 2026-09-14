"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import {
  addFunnelQuestion,
  addFunnelStep,
  deleteFunnelQuestion,
  deleteFunnelStep,
  saveFunnelStepOrder,
  updateFunnelQuestion,
  updateFunnelStep,
} from "@/app/(app)/funnels/actions";
import { ChatStepBody, FormScreenBody, type PreviewProduct, type PreviewStep } from "@/components/funnels/parcours-preview";
import {
  QUESTION_ADD,
  QUESTION_LABEL,
  SCREEN_ADD,
  defaultOptions,
  railSummary,
  screenLabel,
  screenRailKind,
  type FunnelKind,
} from "@/lib/funnels/builder";
import { funnelKindHint, funnelKindLabel } from "@/lib/funnels/kind";
import type { QuestionOptions, QuestionType, ScreenType } from "@/lib/wizard/types";
import type { Tables } from "@/lib/db/database.types";

function asOptions(value: Tables<"wizard_questions">["options"]): QuestionOptions {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as QuestionOptions;
  }
  return {};
}

export function ParcoursBuilder({
  funnelId,
  kind,
  steps,
  questions,
  products,
}: {
  funnelId: string;
  kind: FunnelKind;
  steps: Tables<"wizard_steps">[];
  questions: Tables<"wizard_questions">[];
  products: PreviewProduct[];
}) {
  const [pending, startTransition] = useTransition();
  const [ordered, setOrdered] = useState(steps);
  const [selectedId, setSelectedId] = useState<string | null>(steps[0]?.id ?? null);
  const [picker, setPicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!picker) return;
    function onPointerDown(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) setPicker(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [picker]);

  useEffect(() => {
    setOrdered(steps);
    setSelectedId((current) => {
      if (current && steps.some((step) => step.id === current)) return current;
      return steps[0]?.id ?? null;
    });
  }, [steps]);

  const byStep = useMemo(() => {
    const map = new Map<string, Tables<"wizard_questions">[]>();
    for (const question of questions) {
      const list = map.get(question.step_id) ?? [];
      list.push(question);
      map.set(question.step_id, list);
    }
    return map;
  }, [questions]);

  const previewSteps: PreviewStep[] = ordered.map((step) => ({
    id: step.id,
    title: step.title,
    subtitle: step.subtitle,
    screenType: step.screen_type as ScreenType,
    questions: (byStep.get(step.id) ?? []).map((question) => ({
      id: question.id,
      label: question.label,
      helpText: question.help_text,
      type: question.type as QuestionType,
      options: asOptions(question.options),
    })),
  }));
  const selectedIndex = ordered.findIndex((step) => step.id === selectedId);
  const selectedRow = selectedIndex >= 0 ? ordered[selectedIndex] : null;
  const selectedPreview = selectedIndex >= 0 ? previewSteps[selectedIndex] : null;

  function run(action: () => Promise<unknown>) {
    startTransition(() => {
      void action();
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((step) => step.id === active.id);
    const newIndex = ordered.findIndex((step) => step.id === over.id);
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    run(() => saveFunnelStepOrder(funnelId, next.map((step) => step.id)));
  }

  function addScreen(type: ScreenType) {
    setPicker(false);
    const afterId = selectedRow?.id ?? ordered.at(-1)?.id ?? null;
    run(async () => {
      const id = await addFunnelStep(funnelId, type, afterId);
      if (type === "suggestions" && !ordered.some((step) => step.screen_type === "customize") && id) {
        await addFunnelStep(funnelId, "customize", id);
      }
      if (id) setSelectedId(id);
    });
  }

  const rail = (
    <div className="flex items-center gap-0.5">
      {ordered.map((step, index) => (
        <div key={step.id} className="flex items-center gap-0.5">
          {index > 0 ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden /> : null}
          {mounted ? (
            <SortableRailCard
              step={step}
              index={index}
              kind={kind}
              summary={railSummary(step.screen_type as ScreenType, byStep.get(step.id) ?? [])}
              selected={step.id === selectedId}
              onSelect={() => setSelectedId(step.id)}
            />
          ) : (
            <RailCard
              step={step}
              index={index}
              kind={kind}
              summary={railSummary(step.screen_type as ScreenType, byStep.get(step.id) ?? [])}
              selected={step.id === selectedId}
              onSelect={() => setSelectedId(step.id)}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="border-b border-slate-200 px-4 py-3 lg:px-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Parcours du prospect</p>
            <p className="mt-0.5 text-sm text-slate-500">
              {funnelKindLabel(kind)} — {funnelKindHint(kind)}
            </p>
          </div>
          <p className="hidden text-xs text-slate-400 sm:block">Glissez pour réordonner · cliquez pour éditer</p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="min-w-0 flex-1 overflow-x-auto">
            {mounted ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={ordered.map((step) => step.id)} strategy={horizontalListSortingStrategy}>
                  {rail}
                </SortableContext>
              </DndContext>
            ) : (
              rail
            )}
          </div>
          <div ref={pickerRef} className="relative shrink-0">
            <button
              type="button"
              disabled={pending}
              aria-expanded={picker}
              aria-label="Ajouter une étape"
              onClick={() => setPicker((open) => !open)}
              className="flex h-12 w-10 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[#E85D04] hover:border-[#E85D04] hover:bg-orange-50 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
            {picker ? (
              <div className="absolute top-full right-0 z-30 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                {SCREEN_ADD.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => addScreen(item.type)}
                    className="flex w-full flex-col rounded-md px-3 py-2 text-left hover:bg-orange-50"
                  >
                    <span className="text-sm font-medium text-slate-900">{screenLabel(item.type, kind)}</span>
                    <span className="text-xs text-slate-500">{item.hint}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {selectedRow && selectedPreview ? (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <StepInspector
            funnelId={funnelId}
            kind={kind}
            index={selectedIndex}
            step={selectedRow}
            questions={byStep.get(selectedRow.id) ?? []}
            canDelete={ordered.length > 1}
            pending={pending}
            onAddQuestion={(type) => run(() => addFunnelQuestion(funnelId, selectedRow.id, type))}
            onDelete={() =>
              run(async () => {
                await deleteFunnelStep(funnelId, selectedRow.id);
              })
            }
            onRun={run}
          />
          <aside className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-slate-200 bg-slate-50 lg:max-w-md lg:border-t-0 lg:border-l">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Aperçu</p>
              <p className="text-xs tabular-nums text-slate-400">
                {selectedIndex + 1} / {ordered.length}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mb-4 flex gap-1">
                {ordered.map((step, index) => (
                  <div
                    key={step.id}
                    className={`h-1 flex-1 rounded-full ${index <= selectedIndex ? "bg-slate-900" : "bg-slate-200"}`}
                  />
                ))}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                {kind === "chat" ? (
                  <ChatStepBody step={selectedPreview} products={products} />
                ) : (
                  <FormScreenBody step={selectedPreview} products={products} kind={kind} />
                )}
              </div>
              <p className="mt-3 text-xs text-slate-400">Aperçu de l’étape. Tester le parcours ouvre le funnel public.</p>
            </div>
          </aside>
        </div>
      ) : (
        <p className="px-4 py-10 text-sm text-slate-500 lg:px-6">Ajoutez une première étape pour composer le parcours.</p>
      )}
    </div>
  );
}

function SortableRailCard({
  step,
  index,
  kind,
  summary,
  selected,
  onSelect,
}: {
  step: Tables<"wizard_steps">;
  index: number;
  kind: FunnelKind;
  summary: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? "z-10" : undefined}>
      <RailCard
        step={step}
        index={index}
        kind={kind}
        summary={summary}
        selected={selected}
        onSelect={onSelect}
        handleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function RailCard({
  step,
  index,
  kind,
  summary,
  selected,
  onSelect,
  handleProps,
}: {
  step: Tables<"wizard_steps">;
  index: number;
  kind: FunnelKind;
  summary: string;
  selected: boolean;
  onSelect: () => void;
  handleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const type = step.screen_type as ScreenType;
  return (
    <button
      type="button"
      {...handleProps}
      onClick={onSelect}
      className={`flex h-12 w-40 shrink-0 flex-col justify-center rounded-lg border px-2.5 py-1.5 text-left ${
        selected
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
      }`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {index + 1} · {screenRailKind(type, kind)}
      </p>
      <p className="truncate text-xs font-semibold leading-tight">{step.title}</p>
      <p className={`truncate text-[10px] ${selected ? "text-slate-400" : "text-slate-500"}`}>{summary}</p>
    </button>
  );
}

function StepInspector({
  funnelId,
  kind,
  index,
  step,
  questions,
  canDelete,
  pending,
  onAddQuestion,
  onDelete,
  onRun,
}: {
  funnelId: string;
  kind: FunnelKind;
  index: number;
  step: Tables<"wizard_steps">;
  questions: Tables<"wizard_questions">[];
  canDelete: boolean;
  pending: boolean;
  onAddQuestion: (type: QuestionType) => void;
  onDelete: () => void;
  onRun: (action: () => Promise<unknown>) => void;
}) {
  const [adding, setAdding] = useState(false);
  const type = step.screen_type as ScreenType;
  return (
    <section className="flex min-h-0 min-w-0 flex-[1.15] flex-col overflow-y-auto px-4 py-4 lg:px-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Étape {index + 1} · {screenRailKind(type, kind)}
          </p>
          <input
            key={`${step.id}-title`}
            defaultValue={step.title}
            aria-label="Titre de l’étape"
            onBlur={(event) => {
              const title = event.target.value.trim();
              if (title && title !== step.title) onRun(() => updateFunnelStep(funnelId, step.id, { title }));
            }}
            className="mt-1 w-full bg-transparent text-xl font-semibold text-slate-900 outline-none"
          />
        </div>
        {canDelete ? (
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Supprimer
          </button>
        ) : null}
      </div>

      <label className="block text-sm">
        <span className="text-slate-500">Sous-titre</span>
        <input
          key={`${step.id}-sub`}
          defaultValue={step.subtitle ?? ""}
          onBlur={(event) => {
            const subtitle = event.target.value.trim();
            if (subtitle !== (step.subtitle ?? "")) {
              onRun(() => updateFunnelStep(funnelId, step.id, { subtitle }));
            }
          }}
          className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
        />
      </label>

      {type === "questions" ? (
        <div className="mt-5 space-y-4">
          {questions.map((question) => (
            <QuestionEditor key={question.id} funnelId={funnelId} question={question} pending={pending} onRun={onRun} />
          ))}
          {adding ? (
            <div className="grid grid-cols-2 gap-1.5">
              {QUESTION_ADD.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setAdding(false);
                    onAddQuestion(item.type);
                  }}
                  className="rounded-md border border-slate-200 px-2 py-2 text-left hover:bg-orange-50"
                >
                  <span className="block text-xs font-medium text-slate-900">{item.label}</span>
                  <span className="block text-[11px] text-slate-500">{item.hint}</span>
                </button>
              ))}
            </div>
          ) : (
            <button type="button" disabled={pending} onClick={() => setAdding(true)} className="text-sm font-medium text-[#C2410C]">
              + Ajouter un champ
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-sm text-slate-500">
            {type === "suggestions"
              ? kind === "catalog"
                ? "Le prospect parcourt les catégories, ouvre une fiche, puis ajoute au devis."
                : "Les produits adaptés au brief s’affichent ici."
              : type === "customize"
                ? kind === "catalog"
                  ? "Le devis global : quantités et options des produits ajoutés."
                  : "Le prospect règle quantités et options sur les produits choisis."
                : "Le prospect laisse nom, email, téléphone et société."}
          </p>
          {type === "suggestions" ? (
            <p className="mt-2 text-sm">
              <Link href="/produits" className="font-medium text-[#C2410C] hover:underline">
                Les fiches se gèrent dans Catalogue
              </Link>
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

function QuestionEditor({
  funnelId,
  question,
  pending,
  onRun,
}: {
  funnelId: string;
  question: Tables<"wizard_questions">;
  pending: boolean;
  onRun: (action: () => Promise<unknown>) => void;
}) {
  const options = asOptions(question.options);
  const choices = options.choices ?? [];
  const type = question.type as QuestionType;

  function saveOptions(next: QuestionOptions) {
    onRun(() => updateFunnelQuestion(funnelId, question.id, { options: next }));
  }

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {QUESTION_LABEL[type] ?? question.type}
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => onRun(() => deleteFunnelQuestion(funnelId, question.id))}
          className="text-xs text-slate-400 hover:text-rose-700"
        >
          Retirer
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-500">Question posée</span>
          <input
            key={`${question.id}-label`}
            defaultValue={question.label}
            onBlur={(event) => {
              const label = event.target.value.trim();
              if (label && label !== question.label) {
                onRun(() => updateFunnelQuestion(funnelId, question.id, { label }));
              }
            }}
            className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-500">Type de réponse</span>
          <select
            value={type}
            disabled={pending}
            onChange={(event) => {
              const next = event.target.value as QuestionType;
              onRun(() => updateFunnelQuestion(funnelId, question.id, { type: next, options: defaultOptions(next) }));
            }}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
          >
            {QUESTION_ADD.map((item) => (
              <option key={item.type} value={item.type}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <input
        key={`${question.id}-help`}
        defaultValue={question.help_text ?? ""}
        aria-label="Aide"
        placeholder="Texte d’aide"
        onBlur={(event) => {
          const helpText = event.target.value.trim();
          if (helpText !== (question.help_text ?? "")) {
            onRun(() => updateFunnelQuestion(funnelId, question.id, { helpText }));
          }
        }}
        className="mt-2 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
      />
      <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          defaultChecked={question.required}
          onChange={(event) =>
            onRun(() => updateFunnelQuestion(funnelId, question.id, { required: event.target.checked }))
          }
        />
        Requis
      </label>
      {type === "number" ? (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <input
            defaultValue={options.unit ?? ""}
            placeholder="Unité (m², kg…)"
            onBlur={(event) => saveOptions({ ...options, unit: event.target.value.trim() })}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
          />
          <input
            defaultValue={options.placeholder ?? ""}
            placeholder="Exemple"
            onBlur={(event) => saveOptions({ ...options, placeholder: event.target.value.trim() })}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
          />
        </div>
      ) : null}
      {choices.length || type === "visual_choice" || type === "select" || type === "multi_select" ? (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Options</p>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const value = `opt_${choices.length + 1}`;
                saveOptions({
                  ...options,
                  choices: [...choices, { value, label: `Option ${choices.length + 1}` }],
                });
              }}
              className="text-xs font-medium text-[#C2410C]"
            >
              + Ajouter une option
            </button>
          </div>
          {choices.map((choice, index) => (
            <div key={`${choice.value}-${index}`} className="flex gap-1.5">
              <input
                defaultValue={choice.label}
                onBlur={(event) => {
                  const label = event.target.value.trim();
                  if (!label || label === choice.label) return;
                  const next = choices.map((item, itemIndex) => (itemIndex === index ? { ...item, label } : item));
                  saveOptions({ ...options, choices: next });
                }}
                className="min-w-0 flex-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm"
              />
              <button
                type="button"
                disabled={pending || choices.length <= 1}
                onClick={() =>
                  saveOptions({
                    ...options,
                    choices: choices.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
                className="px-1 text-xs text-slate-400 hover:text-rose-700 disabled:opacity-30"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
