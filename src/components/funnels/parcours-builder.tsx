"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  addFunnelQuestion,
  addFunnelStep,
  deleteFunnelQuestion,
  deleteFunnelStep,
  ensureCatalogSteps,
  saveFunnelStepOrder,
  setFunnelModes,
  updateFunnelQuestion,
  updateFunnelStep,
} from "@/app/(app)/funnels/actions";
import { ParcoursPreview, type PreviewProduct } from "@/components/funnels/parcours-preview";
import {
  QUESTION_ADD,
  QUESTION_LABEL,
  SCREEN_ADD,
  SCREEN_LABEL,
  type FunnelPreviewMode,
} from "@/lib/funnels/builder";
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
  funnelName,
  orgName,
  wizardEnabled,
  chatEnabled,
  steps,
  questions,
  products,
}: {
  funnelId: string;
  funnelName: string;
  orgName: string;
  wizardEnabled: boolean;
  chatEnabled: boolean;
  steps: Tables<"wizard_steps">[];
  questions: Tables<"wizard_questions">[];
  products: PreviewProduct[];
}) {
  const [pending, startTransition] = useTransition();
  const [, startMode] = useTransition();
  const [ordered, setOrdered] = useState(steps);
  const [selectedId, setSelectedId] = useState<string | null>(steps[0]?.id ?? null);
  const [preview, setPreview] = useState<FunnelPreviewMode>(
    chatEnabled && !wizardEnabled ? "chat" : "form",
  );
  const [picker, setPicker] = useState<string | "start" | null>(null);
  const [mounted, setMounted] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOrdered(steps);
    if (selectedId && !steps.some((step) => step.id === selectedId)) {
      setSelectedId(steps[0]?.id ?? null);
    }
  }, [steps, selectedId]);

  const byStep = useMemo(() => {
    const map = new Map<string, Tables<"wizard_questions">[]>();
    for (const question of questions) {
      const list = map.get(question.step_id) ?? [];
      list.push(question);
      map.set(question.step_id, list);
    }
    return map;
  }, [questions]);

  const previewSteps = ordered.map((step) => ({
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
  const selected = previewSteps.find((step) => step.id === selectedId) ?? previewSteps[0] ?? null;
  const selectedRow = ordered.find((step) => step.id === selected?.id) ?? null;

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

  function chooseMode(mode: FunnelPreviewMode) {
    setPreview(mode);
    if (mode === "form") {
      startMode(() => {
        void setFunnelModes(funnelId, true, chatEnabled);
      });
    }
    if (mode === "chat") {
      startMode(() => {
        void setFunnelModes(funnelId, wizardEnabled, true);
      });
    }
    if (mode === "catalog") {
      const existing = ordered.find((step) => step.screen_type === "suggestions");
      if (existing) {
        setSelectedId(existing.id);
        return;
      }
      run(async () => {
        const id = await ensureCatalogSteps(funnelId);
        if (id) setSelectedId(id);
      });
    }
  }

  function addScreen(type: ScreenType, afterId: string | null) {
    setPicker(null);
    run(async () => {
      const id = await addFunnelStep(funnelId, type, afterId);
      if (id) setSelectedId(id);
    });
  }

  function selectStep(step: Tables<"wizard_steps">) {
    setSelectedId(step.id);
    if (step.screen_type === "suggestions") setPreview("catalog");
    else if (preview !== "chat") setPreview("form");
  }

  const canvas = (
    <>
      <InsertPlus
        open={picker === "start"}
        disabled={pending}
        onToggle={() => setPicker((current) => (current === "start" ? null : "start"))}
        onPick={(type) => addScreen(type, null)}
      />
      {ordered.map((step) => (
        <div key={step.id}>
          {mounted ? (
            <SortableScreen
              step={step}
              questions={byStep.get(step.id) ?? []}
              selected={step.id === selected?.id}
              onSelect={() => selectStep(step)}
            />
          ) : (
            <ScreenCard
              step={step}
              questions={byStep.get(step.id) ?? []}
              selected={step.id === selected?.id}
              onSelect={() => selectStep(step)}
            />
          )}
          <InsertPlus
            open={picker === step.id}
            disabled={pending}
            onToggle={() => setPicker((current) => (current === step.id ? null : step.id))}
            onPick={(type) => addScreen(type, step.id)}
          />
        </div>
      ))}
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 lg:px-6">
        <p className="mr-auto text-sm text-slate-500">Ce que le prospect voit — cliquez pour changer de vue.</p>
        <ModeChip
          label="Formulaire"
          on={preview === "form"}
          active={wizardEnabled}
          tone="orange"
          onClick={() => chooseMode("form")}
        />
        <ModeChip
          label="Chat IA"
          on={preview === "chat"}
          active={chatEnabled}
          tone="violet"
          onClick={() => chooseMode("chat")}
        />
        <ModeChip
          label="Catalogue"
          on={preview === "catalog"}
          active={ordered.some((step) => step.screen_type === "suggestions")}
          tone="emerald"
          onClick={() => chooseMode("catalog")}
        />
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]">
        <div className="min-h-0 overflow-y-auto bg-slate-50 px-4 py-5 lg:px-6">
          {mounted ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={ordered.map((step) => step.id)} strategy={verticalListSortingStrategy}>
                {canvas}
              </SortableContext>
            </DndContext>
          ) : (
            canvas
          )}
        </div>

        <div className="flex min-h-0 flex-col border-t border-slate-200 lg:border-l lg:border-t-0">
          <div className="min-h-[22rem] flex-1 lg:min-h-0">
            <ParcoursPreview
              mode={preview}
              funnelName={funnelName}
              orgName={orgName}
              step={selected}
              steps={previewSteps}
              products={products}
            />
          </div>
          {selectedRow ? (
            <StepInspector
              funnelId={funnelId}
              step={selectedRow}
              questions={byStep.get(selectedRow.id) ?? []}
              canDelete={ordered.length > 1}
              pending={pending}
              onAddQuestion={(type) => run(() => addFunnelQuestion(funnelId, selectedRow.id, type))}
              onDelete={() =>
                run(async () => {
                  await deleteFunnelStep(funnelId, selectedRow.id);
                  setSelectedId(ordered.find((step) => step.id !== selectedRow.id)?.id ?? null);
                })
              }
              onRun={run}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ModeChip({
  label,
  on,
  active,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  on: boolean;
  active: boolean;
  tone: "orange" | "violet" | "emerald";
  disabled?: boolean;
  onClick: () => void;
}) {
  const onClass =
    tone === "orange"
      ? "bg-orange-50 text-[#C2410C] ring-orange-200"
      : tone === "violet"
        ? "bg-violet-50 text-violet-800 ring-violet-200"
        : "bg-emerald-50 text-emerald-800 ring-emerald-200";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 disabled:opacity-50 ${
        on ? onClass : "bg-white text-slate-500 ring-slate-200"
      }`}
    >
      {label}
      {active && !on ? <span className="ml-1 text-[10px] text-slate-400">actif</span> : null}
    </button>
  );
}

function InsertPlus({
  open,
  disabled,
  onToggle,
  onPick,
}: {
  open: boolean;
  disabled: boolean;
  onToggle: () => void;
  onPick: (type: ScreenType) => void;
}) {
  return (
    <div className="relative flex flex-col items-center py-1">
      <button
        type="button"
        disabled={disabled}
        aria-label="Ajouter un écran"
        onClick={onToggle}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white text-[#E85D04] hover:border-[#E85D04] hover:bg-orange-50 disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
      {open ? (
        <div className="absolute top-8 z-20 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
          {SCREEN_ADD.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => onPick(item.type)}
              className="flex w-full flex-col rounded-md px-3 py-2 text-left hover:bg-orange-50"
            >
              <span className="text-sm font-medium text-slate-900">{item.label}</span>
              <span className="text-xs text-slate-500">{item.hint}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SortableScreen({
  step,
  questions,
  selected,
  onSelect,
}: {
  step: Tables<"wizard_steps">;
  questions: Tables<"wizard_questions">[];
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <ScreenCard
        step={step}
        questions={questions}
        selected={selected}
        onSelect={onSelect}
        handle={
          <button
            type="button"
            aria-label="Réordonner l’écran"
            className="flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-slate-400 hover:bg-slate-50"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" aria-hidden />
          </button>
        }
      />
    </div>
  );
}

function ScreenCard({
  step,
  questions,
  selected,
  onSelect,
  handle,
}: {
  step: Tables<"wizard_steps">;
  questions: Tables<"wizard_questions">[];
  selected: boolean;
  onSelect: () => void;
  handle?: React.ReactNode;
}) {
  return (
    <div
      className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm ${
        selected ? "border-[#E85D04] ring-2 ring-[#E85D04]/15" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        {handle ?? (
          <span className="flex h-7 w-7 items-center justify-center text-slate-300">
            <GripVertical className="h-4 w-4" aria-hidden />
          </span>
        )}
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {SCREEN_LABEL[step.screen_type as ScreenType] ?? step.screen_type}
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">{step.title}</p>
        </button>
      </div>
      <button type="button" onClick={onSelect} className="w-full text-left">
        <ScreenThumb step={step} questions={questions} />
      </button>
    </div>
  );
}

function ScreenThumb({
  step,
  questions,
}: {
  step: Tables<"wizard_steps">;
  questions: Tables<"wizard_questions">[];
}) {
  if (step.screen_type === "suggestions") {
    return <p className="text-sm text-slate-500">Grille catalogue — le prospect choisit une gamme.</p>;
  }
  if (step.screen_type === "customize") {
    return <p className="text-sm text-slate-500">Quantités, variantes et plan à joindre.</p>;
  }
  if (step.screen_type === "contact") {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {["Nom", "Email", "Téléphone", "Société"].map((label) => (
          <div key={label} className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-400">
            {label}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {questions.map((question) => {
        const options = asOptions(question.options);
        const choices = options.choices ?? [];
        return (
          <div key={question.id}>
            <p className="text-xs font-medium text-slate-700">{question.label}</p>
            {question.type === "visual_choice" ? (
              <div className="mt-1 grid grid-cols-2 gap-1.5">
                {choices.slice(0, 4).map((choice) => (
                  <div key={choice.value} className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600">
                    {choice.label}
                  </div>
                ))}
              </div>
            ) : question.type === "multi_select" ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {choices.slice(0, 4).map((choice) => (
                  <span key={choice.value} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                    {choice.label}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-1 rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-400">
                {QUESTION_LABEL[question.type as QuestionType] ?? question.type}
                {options.unit ? ` · ${options.unit}` : ""}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepInspector({
  funnelId,
  step,
  questions,
  canDelete,
  pending,
  onAddQuestion,
  onDelete,
  onRun,
}: {
  funnelId: string;
  step: Tables<"wizard_steps">;
  questions: Tables<"wizard_questions">[];
  canDelete: boolean;
  pending: boolean;
  onAddQuestion: (type: QuestionType) => void;
  onDelete: () => void;
  onRun: (action: () => Promise<unknown>) => void;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="max-h-[22rem] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {SCREEN_LABEL[step.screen_type as ScreenType] ?? step.screen_type}
        </p>
        {canDelete ? (
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className="ml-auto inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-700"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Retirer l’écran
          </button>
        ) : null}
      </div>
      <label className="block text-sm">
        <span className="text-slate-500">Titre</span>
        <input
          key={`${step.id}-title`}
          defaultValue={step.title}
          onBlur={(event) => {
            const title = event.target.value.trim();
            if (title && title !== step.title) onRun(() => updateFunnelStep(funnelId, step.id, { title }));
          }}
          className="mt-1 w-full border border-slate-200 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="mt-2 block text-sm">
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
          className="mt-1 w-full border border-slate-200 px-2 py-1.5 text-sm"
        />
      </label>

      {step.screen_type === "questions" ? (
        <div className="mt-4 space-y-3">
          {questions.map((question) => (
            <QuestionEditor
              key={question.id}
              funnelId={funnelId}
              question={question}
              pending={pending}
              onRun={onRun}
            />
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
            <button
              type="button"
              disabled={pending}
              onClick={() => setAdding(true)}
              className="text-sm font-medium text-[#C2410C]"
            >
              + Ajouter un champ
            </button>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          {step.screen_type === "suggestions"
            ? "Le catalogue affiche les produits de ce funnel. Modifiez-les dans Catalogue."
            : step.screen_type === "customize"
              ? "Le prospect règle quantités et options sur les produits choisis."
              : "Le prospect laisse nom, email, téléphone et société."}
        </p>
      )}
    </div>
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

  function saveOptions(next: QuestionOptions) {
    onRun(() => updateFunnelQuestion(funnelId, question.id, { options: next }));
  }

  return (
    <div className="border-t border-slate-100 pt-3">
      <div className="mb-2 flex items-center gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {QUESTION_LABEL[question.type as QuestionType] ?? question.type}
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => onRun(() => deleteFunnelQuestion(funnelId, question.id))}
          className="ml-auto text-xs text-slate-400 hover:text-rose-700"
        >
          Retirer
        </button>
      </div>
      <input
        key={`${question.id}-label`}
        defaultValue={question.label}
        aria-label="Libellé"
        onBlur={(event) => {
          const label = event.target.value.trim();
          if (label && label !== question.label) {
            onRun(() => updateFunnelQuestion(funnelId, question.id, { label }));
          }
        }}
        className="w-full border border-slate-200 px-2 py-1.5 text-sm"
      />
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
        className="mt-1.5 w-full border border-slate-200 px-2 py-1.5 text-sm"
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
      {question.type === "number" ? (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <input
            defaultValue={options.unit ?? ""}
            placeholder="Unité (m², kg…)"
            onBlur={(event) => saveOptions({ ...options, unit: event.target.value.trim() })}
            className="border border-slate-200 px-2 py-1.5 text-sm"
          />
          <input
            defaultValue={options.placeholder ?? ""}
            placeholder="Exemple"
            onBlur={(event) => saveOptions({ ...options, placeholder: event.target.value.trim() })}
            className="border border-slate-200 px-2 py-1.5 text-sm"
          />
        </div>
      ) : null}
      {choices.length || question.type === "visual_choice" || question.type === "select" || question.type === "multi_select" ? (
        <div className="mt-2 space-y-1.5">
          {choices.map((choice, index) => (
            <div key={`${choice.value}-${index}`} className="flex gap-1.5">
              <input
                defaultValue={choice.label}
                onBlur={(event) => {
                  const label = event.target.value.trim();
                  if (!label || label === choice.label) return;
                  const next = choices.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, label } : item,
                  );
                  saveOptions({ ...options, choices: next });
                }}
                className="min-w-0 flex-1 border border-slate-200 px-2 py-1.5 text-sm"
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
            + Ajouter un choix
          </button>
        </div>
      ) : null}
    </div>
  );
}
