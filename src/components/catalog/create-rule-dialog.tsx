"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { createRule } from "@/app/(app)/produits/actions";

export type RuleQuestion = {
  configuratorId: string;
  key: string;
  label: string;
  choices: { value: string; label: string }[];
  numeric: boolean;
};

export type RuleProduct = { id: string; configuratorId: string; name: string };

type Funnel = { id: string; name: string };

const OPERATORS = [
  { value: "eq", label: "est" },
  { value: "neq", label: "n’est pas" },
  { value: "gte", label: "est au moins" },
  { value: "lte", label: "est au plus" },
  { value: "contains", label: "inclut" },
  { value: "in", label: "est parmi" },
];

type Row = { key: string; op: string; value: string };

const EMPTY_ROW: Row = { key: "", op: "eq", value: "" };

export function CreateRuleDialog({
  funnels,
  questions,
  products,
}: {
  funnels: Funnel[];
  questions: RuleQuestion[];
  products: RuleProduct[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [funnelId, setFunnelId] = useState(funnels[0]?.id ?? "");
  const [always, setAlways] = useState(false);
  const [rows, setRows] = useState<Row[]>([EMPTY_ROW]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    start(async () => {
      const result = await createRule({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setRows([EMPTY_ROW]);
      setAlways(false);
      setStep(0);
      setOpen(false);
    });
  }

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#nouvelle-regle") {
        setOpen(true);
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  const funnelQuestions = questions.filter((question) => question.configuratorId === funnelId);
  const funnelProducts = products.filter((product) => product.configuratorId === funnelId);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
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
        Nouvelle règle
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-rule-title"
            className="relative z-10 flex max-h-[min(38rem,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
                Nouvelle règle · {step + 1} / 2
              </p>
              <h2 id="create-rule-title" className="mt-1 text-lg font-semibold text-slate-900">
                {step === 0 ? "Quand proposer ces produits ?" : "Qu’est-ce qu’on propose ?"}
              </h2>
            </div>

            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
              <input type="hidden" name="configurator_id" value={funnelId} />

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <div hidden={step !== 0} className="space-y-4">
                  <label className="block text-sm">
                    <span className="font-medium text-slate-900">Funnel concerné</span>
                    <select
                      value={funnelId}
                      onChange={(event) => {
                        setFunnelId(event.target.value);
                        setRows([EMPTY_ROW]);
                      }}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    >
                      {funnels.map((funnel) => (
                        <option key={funnel.id} value={funnel.id}>
                          {funnel.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200">
                    <input
                      type="checkbox"
                      checked={always}
                      onChange={(event) => setAlways(event.target.checked)}
                    />
                    Proposer à tout le monde, sans condition
                  </label>

                  {!always ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-900">
                        Si le prospect répond…{" "}
                        <span className="font-normal text-slate-500">
                          (toutes les conditions doivent être vraies)
                        </span>
                      </p>
                      {funnelQuestions.length ? (
                        <>
                          {rows.map((row, index) => {
                            const question = funnelQuestions.find((q) => q.key === row.key);
                            return (
                              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
                                <select
                                  name="cond_key"
                                  value={row.key}
                                  onChange={(event) =>
                                    updateRow(index, { key: event.target.value, value: "" })
                                  }
                                  className="rounded-md border border-slate-200 px-2 py-2 text-sm"
                                >
                                  <option value="">Choisir une question…</option>
                                  {funnelQuestions.map((q) => (
                                    <option key={q.key} value={q.key}>
                                      {q.label}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  name="cond_op"
                                  value={row.op}
                                  onChange={(event) => updateRow(index, { op: event.target.value })}
                                  className="rounded-md border border-slate-200 px-2 py-2 text-sm"
                                >
                                  {OPERATORS.map((operator) => (
                                    <option key={operator.value} value={operator.value}>
                                      {operator.label}
                                    </option>
                                  ))}
                                </select>
                                {question?.choices.length && (row.op === "eq" || row.op === "neq") ? (
                                  <select
                                    name="cond_value"
                                    value={row.value}
                                    onChange={(event) =>
                                      updateRow(index, { value: event.target.value })
                                    }
                                    className="rounded-md border border-slate-200 px-2 py-2 text-sm"
                                  >
                                    <option value="">Choisir une réponse…</option>
                                    {question.choices.map((choice) => (
                                      <option key={choice.value} value={choice.value}>
                                        {choice.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    name="cond_value"
                                    value={row.value}
                                    onChange={(event) =>
                                      updateRow(index, { value: event.target.value })
                                    }
                                    type={question?.numeric ? "number" : "text"}
                                    placeholder={row.op === "in" ? "valeurs, séparées, ainsi" : "valeur"}
                                    className="rounded-md border border-slate-200 px-2 py-2 text-sm"
                                  />
                                )}
                              </div>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => setRows((current) => [...current, { ...EMPTY_ROW }])}
                            className="text-sm text-slate-600 underline"
                          >
                            Ajouter une condition
                          </button>
                        </>
                      ) : (
                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                          Ce funnel n’a aucune question : la règle s’appliquera à tout le monde.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>

                <div hidden={step !== 1} className="space-y-4">
                  <label className="block text-sm">
                    <span className="font-medium text-slate-900">Produits proposés</span>
                    {funnelProducts.length ? (
                      <span className="mt-2 grid gap-2 sm:grid-cols-2">
                        {funnelProducts.map((product) => (
                          <span
                            key={product.id}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-200 has-checked:bg-orange-50 has-checked:ring-orange-200"
                          >
                            <input type="checkbox" name="product_ids" value={product.id} />
                            {product.name}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="mt-2 block rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        Aucun produit rattaché à ce funnel. Ajoutez-en au catalogue d’abord.
                      </span>
                    )}
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="font-medium text-slate-900">Nom interne</span>
                      <input
                        name="name"
                        placeholder="Entrepôt palettes"
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="font-medium text-slate-900">Priorité</span>
                      <input
                        name="priority"
                        type="number"
                        defaultValue={0}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>

                  <label className="block text-sm">
                    <span className="font-medium text-slate-900">Titre vu par le prospect</span>
                    <input
                      name="headline"
                      placeholder="La solution pour votre entrepôt"
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-slate-900">Description</span>
                    <textarea
                      name="description"
                      rows={3}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
              </div>

              {error ? (
                <p className="border-t border-rose-100 bg-rose-50 px-5 py-2 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  Annuler
                </button>
                <div className="flex gap-2">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
                    >
                      Retour
                    </button>
                  ) : null}
                  {step === 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
                    >
                      Continuer
                    </button>
                  ) : (
                    <Submit onDone={() => setOpen(false)} />
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Submit({ onDone }: { onDone: () => void }) {
  const { pending } = useFormStatus();
  const [wasPending, setWasPending] = useState(false);

  useEffect(() => {
    if (pending) setWasPending(true);
    else if (wasPending) onDone();
  }, [pending, wasPending, onDone]);

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
    >
      {pending ? "Création…" : "Créer la règle"}
    </button>
  );
}
