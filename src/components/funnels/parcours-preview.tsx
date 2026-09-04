"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
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

export function FormScreenBody({ step, products }: { step: PreviewStep; products: PreviewProduct[] }) {
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
      {step.screenType === "suggestions" ? <div className="mt-5"><CatalogPreview products={products} /></div> : null}
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

export function ChatStepBody({ step, products }: { step: PreviewStep; products: PreviewProduct[] }) {
  const question = step.questions[0];
  const choices = question?.options.choices ?? [];
  return (
    <div className="space-y-2.5">
      <div className="max-w-[88%] rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-800">
        {question ? (
          <>
            {question.label}
            {question.helpText ? <span className="mt-1 block text-slate-500">{question.helpText}</span> : null}
          </>
        ) : step.screenType === "suggestions" ? (
          products[0]
            ? `Je vous propose ${products[0].name}${products[1] ? ` et ${products[1].name}` : ""} — on affine ensuite.`
            : "Je vous montrerai les gammes du catalogue adaptées à ces réponses."
        ) : step.screenType === "customize" ? (
          "On règle ensuite quantités et options sur la gamme choisie."
        ) : step.screenType === "contact" ? (
          "Il me reste vos coordonnées pour envoyer le récapitulatif."
        ) : (
          step.title
        )}
      </div>
      {choices.length ? (
        <div className="flex flex-wrap gap-1.5 pl-1">
          {choices.map((choice) => (
            <span key={choice.value} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
              {choice.label}
            </span>
          ))}
        </div>
      ) : null}
      {step.screenType === "suggestions" && products.length ? (
        <div className="pl-1">
          <CatalogPreview products={products.slice(0, 2)} />
        </div>
      ) : null}
      {step.questions.slice(1).map((item) => (
        <div key={item.id} className="max-w-[88%] rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-800">
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function QuestionPreview({ question }: { question: PreviewQuestion }) {
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

export function CatalogPreview({ products }: { products: PreviewProduct[] }) {
  if (!products.length) {
    return (
      <p className="text-sm text-slate-500">
        Aucun produit sur ce funnel. Ajoutez-en dans Catalogue pour les voir ici.
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
