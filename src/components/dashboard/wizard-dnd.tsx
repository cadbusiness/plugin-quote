"use client";

import { useMemo, useState } from "react";
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
import type { Tables } from "@/lib/db/database.types";

function SortableStep({
  step,
  children,
}: {
  step: Tables<"wizard_steps">;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="border-b border-slate-200 px-5 py-5"
    >
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500"
          {...attributes}
          {...listeners}
        >
          Déplacer
        </button>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{step.screen_type}</p>
          <h2 className="text-lg font-semibold">{step.title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export function WizardDnd({
  steps,
  questions,
  saveOrder,
  saveQuestionAction,
}: {
  steps: Tables<"wizard_steps">[];
  questions: Tables<"wizard_questions">[];
  saveOrder: (ids: string[]) => Promise<void>;
  saveQuestionAction: (formData: FormData) => Promise<void>;
}) {
  const [ordered, setOrdered] = useState(steps);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const byStep = useMemo(() => {
    const map = new Map<string, Tables<"wizard_questions">[]>();
    for (const q of questions) {
      const list = map.get(q.step_id) ?? [];
      list.push(q);
      map.set(q.step_id, list);
    }
    return map;
  }, [questions]);

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((s) => s.id === active.id);
    const newIndex = ordered.findIndex((s) => s.id === over.id);
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    await saveOrder(next.map((s) => s.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ordered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        {ordered.map((step) => (
          <SortableStep key={step.id} step={step}>
            <div className="space-y-3">
              {(byStep.get(step.id) ?? []).map((q) => (
                <form
                  key={q.id}
                  action={saveQuestionAction}
                  className="grid gap-2 border border-slate-200 p-3 sm:grid-cols-2"
                >
                  <input type="hidden" name="id" value={q.id} />
                  <label className="text-sm sm:col-span-2">
                    Libellé
                    <input
                      name="label"
                      defaultValue={q.label}
                      className="mt-1 w-full border border-slate-200 px-2 py-1.5"
                    />
                  </label>
                  <label className="text-sm sm:col-span-2">
                    Aide
                    <input
                      name="help_text"
                      defaultValue={q.help_text ?? ""}
                      className="mt-1 w-full border border-slate-200 px-2 py-1.5"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="required" defaultChecked={q.required} />
                    Requis
                  </label>
                  <div className="text-right">
                    <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">
                      Enregistrer
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </SortableStep>
        ))}
      </SortableContext>
    </DndContext>
  );
}
