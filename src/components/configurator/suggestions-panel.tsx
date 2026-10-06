"use client";

import { formatPrice } from "@/lib/format";
import { resolveDisplayCurrency, suggestionCardRange } from "@/lib/quotes/price-range";
import type { Suggestion } from "@/lib/wizard/types";

export type SuggestionsLoadState = "idle" | "loading" | "ready" | "error";

export const SUGGESTIONS_LOADING_LABEL = "Calcul des configurations…";

export const SUGGESTIONS_EMPTY_LABEL =
  "Aucune solution ne correspond à vos réponses. Vous pouvez continuer. L’équipe vous proposera une solution avec le devis.";

export const SUGGESTIONS_ERROR_LABEL =
  "Les recommandations n’ont pas pu être chargées. Vous pouvez continuer.";

/** Spinner only while a request is still in flight. A resolved empty list is not loading. */
export function suggestionsPanelPhase(
  loadState: SuggestionsLoadState,
  count: number,
): "loading" | "empty" | "error" | "list" {
  if (count > 0) return "list";
  if (loadState === "error") return "error";
  if (loadState === "ready") return "empty";
  return "loading";
}

/** Fetch when the suggestions step is open and no result has been resolved yet. */
export function shouldLoadSuggestions(input: {
  screenType?: string | null;
  catalog: boolean;
  loadState: SuggestionsLoadState;
  suggestionCount: number;
}): boolean {
  if (input.catalog) return false;
  if (input.screenType !== "suggestions") return false;
  if (input.loadState !== "idle") return false;
  return input.suggestionCount === 0;
}

/**
 * Chat shows the step once the request has settled with nothing to pick,
 * and keeps the cards when a match exists (including after the prospect moves on).
 * The in-flight spinner stays on the wizard step only, so a matching chat turn
 * still reveals the cards when they arrive.
 */
export function shouldShowChatSuggestions(input: {
  showChat: boolean;
  onSuggestionStep: boolean;
  hasSelectedSuggestion: boolean;
  suggestionCount: number;
  loadState: SuggestionsLoadState;
}): boolean {
  if (!input.showChat) return false;
  if (input.suggestionCount > 0 && (input.onSuggestionStep || input.hasSelectedSuggestion)) return true;
  if (!input.onSuggestionStep) return false;
  return input.loadState === "ready" || input.loadState === "error";
}

export function SuggestionsPanel({
  suggestions,
  quantities = {},
  loadState,
  selectedId,
  onSelect,
}: {
  suggestions: Suggestion[];
  quantities?: Record<string, number>;
  loadState: SuggestionsLoadState;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const phase = suggestionsPanelPhase(loadState, suggestions.length);

  if (phase === "loading") {
    return (
      <div className="mt-8 flex items-center gap-2.5 text-sm text-mk-faint" role="status">
        <span className="h-2 w-2 animate-pulse rounded-full bg-mk-accent" />
        {SUGGESTIONS_LOADING_LABEL}
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <p className="mt-8 max-w-xl text-sm leading-6 text-mk-faint" role="status">
        {SUGGESTIONS_EMPTY_LABEL}
      </p>
    );
  }

  if (phase === "error") {
    return (
      <p className="mt-8 text-sm text-red-600" role="status">
        {SUGGESTIONS_ERROR_LABEL}
      </p>
    );
  }

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {suggestions.map((s) => {
        const selected = selectedId === s.id;
        const range = suggestionCardRange(s, quantities);
        const currency = resolveDisplayCurrency(s.products.map((product) => product.currency));
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`rounded-2xl border p-5 text-left shadow-sm transition-all duration-150 ${
              selected
                ? "border-mk-accent bg-mk-accent-soft ring-2 ring-mk-accent/20"
                : "border-mk-border bg-white hover:-translate-y-0.5 hover:shadow-md"
            }`}
          >
            <span className="inline-flex rounded-full bg-mk-accent-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-mk-accent">
              Recommandé
            </span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-mk-ink">{s.headline ?? s.name}</h3>
            <p className="mt-2 text-sm text-mk-faint">{s.description}</p>
            <p className="mt-4 text-sm font-semibold text-mk-ink">{formatPrice(range.min, range.max, currency)}</p>
            <ul className="mt-3 space-y-2 text-sm text-mk-faint">
              {s.products.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-mk-border"
                    />
                  ) : null}
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
