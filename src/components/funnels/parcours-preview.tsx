"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { FunnelPreviewMode } from "@/lib/funnels/builder";
import type { QuestionOptions, QuestionType, ScreenType } from "@/lib/wizard/types";

export type PreviewQuestion = {
  id: string;
  label: string;
  helpText: string | null;
  type: QuestionType;
  options: QuestionOptions;
};

export type PreviewStep = {
  id: string;
  title: string;
  subtitle: string | null;
  screenType: ScreenType;
  questions: PreviewQuestion[];
};

export type PreviewProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceMin: number | null;
  priceMax: number | null;
};

export function ParcoursPreview({
  mode,
  funnelName,
  orgName,
  step,
  steps,
  products,
}: {
  mode: FunnelPreviewMode;
  funnelName: string;
  orgName: string;
  step: PreviewStep | null;
  steps: PreviewStep[];
  products: PreviewProduct[];
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100">
      <div className="border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
        <p className="text-[10px] uppercase tracking-[0.16em] text-amber-400">{orgName}</p>
        <p className="text-sm font-medium">{funnelName}</p>
        {mode === "form" && step ? (
          <p className="mt-2 text-[11px] text-slate-300">
            {steps.findIndex((item) => item.id === step.id) + 1} / {steps.length} — {step.title}
          </p>
        ) : null}
        {mode === "chat" ? <p className="mt-2 text-[11px] text-slate-300">Chat IA · même brief, en conversation</p> : null}
        {mode === "catalog" ? <p className="mt-2 text-[11px] text-slate-300">Catalogue proposé au prospect</p> : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {mode === "chat" ? <ChatPreview steps={steps} products={products} /> : null}
        {mode === "catalog" ? <CatalogPreview products={products} /> : null}
        {mode === "form" && step ? <FormPreview step={step} products={products} /> : null}
        {mode === "form" && !step ? (
          <p className="text-sm text-slate-500">Ajoutez un écran pour voir le parcours.</p>
        ) : null}
      </div>
    </div>
  );
}

function FormPreview({ step, products }: { step: PreviewStep; products: PreviewProduct[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{step.title}</h2>
      {step.subtitle ? <p className="mt-1 text-sm text-slate-500">{step.subtitle}</p> : null}
      {step.screenType === "questions" ? (
        <div className="mt-5 space-y-5">
          {step.questions.map((question) => (
            <QuestionPreview key={question.id} question={question} />
          ))}
        </div>
      ) : null}
      {step.screenType === "suggestions" ? <CatalogPreview products={products} /> : null}
      {step.screenType === "customize" ? <CustomizePreview products={products} /> : null}
      {step.screenType === "contact" ? <ContactPreview /> : null}
      <div className="mt-8 flex items-center justify-between">
        <span className="text-sm text-slate-400">Retour</span>
        <span className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white">
          {step.screenType === "contact" ? "Envoyer ma demande" : "Continuer"}
        </span>
      </div>
    </div>
  );
}

function QuestionPreview({ question }: { question: PreviewQuestion }) {
  const [value, setValue] = useState<string | string[]>("");
  const choices = question.options.choices ?? [];

  if (question.type === "visual_choice") {
    return (
      <div>
        <p className="text-sm font-medium text-slate-900">{question.label}</p>
        {question.helpText ? <p className="mt-1 text-sm text-slate-500">{question.helpText}</p> : null}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {choices.map((choice) => {
            const on = value === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                onClick={() => setValue(choice.value)}
                className={`rounded-xl border p-3 text-left ${
                  on ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-sm font-medium">{choice.label}</p>
                {choice.description ? <p className="mt-0.5 text-xs text-slate-500">{choice.description}</p> : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "multi_select") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div>
        <p className="text-sm font-medium text-slate-900">{question.label}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {choices.map((choice) => {
            const on = selected.includes(choice.value);
            return (
              <button
                key={choice.value}
                type="button"
                onClick={() =>
                  setValue(on ? selected.filter((item) => item !== choice.value) : [...selected, choice.value])
                }
                className={`rounded-full border px-3 py-1 text-sm ${
                  on ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white"
                }`}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "select") {
    return (
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-900">{question.label}</span>
        <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
          <option>Choisir…</option>
          {choices.map((choice) => (
            <option key={choice.value}>{choice.label}</option>
          ))}
        </select>
      </label>
    );
  }

  if (question.type === "number") {
    return (
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-900">{question.label}</span>
        <div className="flex items-center gap-2">
          <input
            readOnly
            placeholder={question.options.placeholder ?? "0"}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
          />
          {question.options.unit ? <span className="text-slate-500">{question.options.unit}</span> : null}
        </div>
      </label>
    );
  }

  if (question.type === "file") {
    return (
      <div>
        <p className="text-sm font-medium text-slate-900">{question.label}</p>
        <div className="mt-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-6 text-center text-sm text-slate-500">
          Plan PDF ou photo
        </div>
      </div>
    );
  }

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-900">{question.label}</span>
      <input
        readOnly
        placeholder={question.options.placeholder ?? "Votre réponse"}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
      />
    </label>
  );
}

function CatalogPreview({ products }: { products: PreviewProduct[] }) {
  if (!products.length) {
    return (
      <p className="text-sm text-slate-500">
        Aucun produit sur ce funnel. Ajoutez-en dans Catalogue pour les voir ici.
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {products.map((product) => (
        <div key={product.id} className="rounded-xl border border-slate-200 bg-white p-3 text-left">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="mb-2 h-24 w-full rounded-md object-cover" />
          ) : (
            <div className="mb-2 h-24 rounded-md bg-slate-100" />
          )}
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Recommandé</p>
          <p className="mt-0.5 font-medium text-slate-900">{product.name}</p>
          {product.description ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{product.description}</p> : null}
          <p className="mt-2 text-sm font-medium text-slate-700">{formatPrice(product.priceMin, product.priceMax)}</p>
        </div>
      ))}
    </div>
  );
}

function CustomizePreview({ products }: { products: PreviewProduct[] }) {
  if (!products.length) {
    return <p className="mt-5 text-sm text-slate-500">Les options s’affichent une fois le catalogue renseigné.</p>;
  }
  return (
    <div className="mt-5 space-y-3">
      {products.slice(0, 3).map((product) => (
        <div key={product.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-md bg-slate-100" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-xs text-slate-500">{formatPrice(product.priceMin, product.priceMax)}</p>
          </div>
          <input readOnly value="1" className="w-12 rounded-md border border-slate-200 px-2 py-1 text-sm" />
        </div>
      ))}
    </div>
  );
}

function ContactPreview() {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {["Nom", "Email", "Téléphone", "Société"].map((label) => (
        <label key={label} className="block text-sm">
          <span className="mb-1 block text-slate-600">{label}</span>
          <input readOnly className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2" />
        </label>
      ))}
    </div>
  );
}

function ChatPreview({ steps, products }: { steps: PreviewStep[]; products: PreviewProduct[] }) {
  const messages = useMemo(() => buildChatPreview(steps, products), [steps, products]);
  return (
    <div>
      <div className="min-h-[18rem] space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${
              message.role === "user" ? "ml-auto bg-slate-950 text-white" : "bg-slate-100 text-slate-800"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <div className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">
          Votre besoin…
        </div>
        <span className="rounded-lg bg-slate-950 px-3 py-2 text-sm text-white">Envoyer</span>
      </div>
    </div>
  );
}

function buildChatPreview(steps: PreviewStep[], products: PreviewProduct[]) {
  const messages: { role: "assistant" | "user"; content: string }[] = [];
  const questions = steps.flatMap((step) => step.questions);
  if (!questions.length) {
    messages.push({
      role: "assistant",
      content: "Décrivez votre projet en une phrase — par exemple un entrepôt de 600 m² à équiper.",
    });
  } else {
    messages.push({
      role: "assistant",
      content: `Pour commencer — ${questions[0].label}${questions[0].helpText ? `. ${questions[0].helpText}` : ""}`,
    });
    const firstChoice = questions[0].options.choices?.[0];
    messages.push({ role: "user", content: firstChoice?.label ?? "Je vous envoie le brief." });
    if (questions[1]) {
      messages.push({ role: "assistant", content: questions[1].label });
      messages.push({
        role: "user",
        content: questions[1].options.placeholder || questions[1].options.choices?.[0]?.label || "Voici l’ordre de grandeur.",
      });
    }
  }
  if (products[0]) {
    messages.push({
      role: "assistant",
      content: `Je vous propose ${products[0].name}${products[1] ? ` et ${products[1].name}` : ""} — on affine ensuite les quantités.`,
    });
  } else if (steps.some((step) => step.screenType === "suggestions")) {
    messages.push({
      role: "assistant",
      content: "Je vous montrerai ensuite les gammes du catalogue adaptées à ces réponses.",
    });
  }
  messages.push({ role: "assistant", content: "Il me reste vos coordonnées pour envoyer le récapitulatif." });
  return messages;
}
