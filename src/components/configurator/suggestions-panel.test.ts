import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import {
  SUGGESTIONS_EMPTY_LABEL,
  SUGGESTIONS_ERROR_LABEL,
  SUGGESTIONS_LOADING_LABEL,
  SuggestionsPanel,
  shouldLoadSuggestions,
  shouldShowChatSuggestions,
  suggestionsPanelPhase,
} from "./suggestions-panel";
import type { Suggestion } from "@/lib/wizard/types";

assert.equal(suggestionsPanelPhase("idle", 0), "loading");
assert.equal(suggestionsPanelPhase("loading", 0), "loading");
assert.equal(suggestionsPanelPhase("ready", 0), "empty");
assert.equal(suggestionsPanelPhase("error", 0), "error");
assert.equal(suggestionsPanelPhase("loading", 2), "list");
assert.equal(suggestionsPanelPhase("ready", 1), "list");
assert.equal(suggestionsPanelPhase("error", 1), "list");

assert.equal(
  shouldLoadSuggestions({ screenType: "suggestions", catalog: false, loadState: "idle", suggestionCount: 0 }),
  true,
);
assert.equal(
  shouldLoadSuggestions({ screenType: "suggestions", catalog: false, loadState: "ready", suggestionCount: 0 }),
  false,
);
assert.equal(
  shouldLoadSuggestions({ screenType: "suggestions", catalog: false, loadState: "loading", suggestionCount: 0 }),
  false,
);
assert.equal(
  shouldLoadSuggestions({ screenType: "suggestions", catalog: false, loadState: "idle", suggestionCount: 1 }),
  false,
);
assert.equal(
  shouldLoadSuggestions({ screenType: "suggestions", catalog: true, loadState: "idle", suggestionCount: 0 }),
  false,
);
assert.equal(
  shouldLoadSuggestions({ screenType: "questions", catalog: false, loadState: "idle", suggestionCount: 0 }),
  false,
);

assert.equal(
  shouldShowChatSuggestions({
    showChat: true,
    onSuggestionStep: true,
    hasSelectedSuggestion: false,
    suggestionCount: 0,
    loadState: "ready",
  }),
  true,
);
assert.equal(
  shouldShowChatSuggestions({
    showChat: true,
    onSuggestionStep: true,
    hasSelectedSuggestion: false,
    suggestionCount: 0,
    loadState: "error",
  }),
  true,
);
assert.equal(
  shouldShowChatSuggestions({
    showChat: true,
    onSuggestionStep: true,
    hasSelectedSuggestion: false,
    suggestionCount: 0,
    loadState: "loading",
  }),
  false,
);
assert.equal(
  shouldShowChatSuggestions({
    showChat: true,
    onSuggestionStep: true,
    hasSelectedSuggestion: false,
    suggestionCount: 2,
    loadState: "ready",
  }),
  true,
);
assert.equal(
  shouldShowChatSuggestions({
    showChat: true,
    onSuggestionStep: false,
    hasSelectedSuggestion: true,
    suggestionCount: 1,
    loadState: "ready",
  }),
  true,
);
assert.equal(
  shouldShowChatSuggestions({
    showChat: true,
    onSuggestionStep: false,
    hasSelectedSuggestion: false,
    suggestionCount: 0,
    loadState: "ready",
  }),
  false,
);
assert.equal(
  shouldShowChatSuggestions({
    showChat: false,
    onSuggestionStep: true,
    hasSelectedSuggestion: false,
    suggestionCount: 0,
    loadState: "ready",
  }),
  false,
);

assert.doesNotMatch(SUGGESTIONS_EMPTY_LABEL, /[—–]/);
assert.doesNotMatch(SUGGESTIONS_ERROR_LABEL, /[—–]/);
assert.match(SUGGESTIONS_EMPTY_LABEL, /continuer/i);
assert.match(SUGGESTIONS_EMPTY_LABEL, /devis/);

function render(loadState: "idle" | "loading" | "ready" | "error", suggestions: Suggestion[]) {
  return renderToStaticMarkup(
    createElement(SuggestionsPanel, {
      suggestions,
      loadState,
      selectedId: null,
      onSelect: () => undefined,
    }),
  );
}

const loading = render("loading", []);
assert.match(loading, new RegExp(SUGGESTIONS_LOADING_LABEL));
assert.doesNotMatch(loading, /Aucune solution/);
assert.doesNotMatch(loading, /pas pu être chargées/);

const empty = render("ready", []);
assert.match(empty, /Aucune solution ne correspond à vos réponses/);
assert.match(empty, /Vous pouvez continuer/);
assert.match(empty, /proposera une solution avec le devis/);
assert.doesNotMatch(empty, /Calcul des configurations/);
assert.doesNotMatch(empty, /[—–]/);

const error = render("error", []);
assert.match(error, /Les recommandations n’ont pas pu être chargées/);
assert.match(error, /Vous pouvez continuer/);
assert.doesNotMatch(error, /Calcul des configurations/);
assert.doesNotMatch(error, /[—–]/);

const match: Suggestion = {
  id: "sug-1",
  name: "Atelier nord",
  headline: "Cuisine sur mesure",
  description: "Façades laquées et plan de travail chêne.",
  imageUrl: null,
  priceMin: 4200,
  priceMax: 6800,
  products: [],
};

const list = render("ready", [match]);
assert.match(list, /Cuisine sur mesure/);
assert.match(list, /Recommandé/);
assert.match(list, /Façades laquées/);
assert.doesNotMatch(list, /Aucune solution/);
assert.doesNotMatch(list, /Calcul des configurations/);
assert.doesNotMatch(list, /pas pu être chargées/);

const app = readFileSync(new URL("./configurator-app.tsx", import.meta.url), "utf8");
const goNext = app.slice(app.indexOf("async function goNext"), app.indexOf("async function goBack"));
assert.match(goNext, /suggestions\[0\]/);
assert.doesNotMatch(goNext, /if \(!suggestions\.length\) return/);
assert.match(app, /setSuggestionsState\("ready"\)/);
assert.match(app, /setSuggestionsState\("error"\)/);
assert.match(app, /shouldLoadSuggestions\(/);
assert.match(app, /shouldShowChatSuggestions\(/);
assert.match(app, /loadState=\{suggestionsState\}/);

const wizardAt = app.indexOf("{showWizard && step ? (");
const wizardEnd = app.indexOf("</section>", wizardAt);
const wizardSlice = app.slice(wizardAt, wizardEnd);
assert.match(wizardSlice, /screenType === "suggestions" && !isCatalog/);
assert.match(wizardSlice, /SuggestionsPanel/);
assert.match(wizardSlice, /Continuer/);
assert.doesNotMatch(wizardSlice, /HostedChatSubmit/);
const hostedAt = app.indexOf("<HostedChatSubmit");
assert.ok(hostedAt > 0);
assert.ok(hostedAt < wizardAt || hostedAt > wizardEnd);
