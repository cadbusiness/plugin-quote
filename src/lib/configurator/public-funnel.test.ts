import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CONFIGURATOR_FALLBACK_ACCENT } from "@/lib/configurator/theme";
import {
  FunnelBrandHeader,
  FunnelBrief,
  FunnelCredit,
  VisualChoiceGrid,
} from "@/components/configurator/funnel-chrome";
import {
  briefLines,
  choiceImageUrl,
  firstChoiceImage,
  funnelDocumentDescription,
  funnelDocumentTitle,
  funnelPageMetadata,
  resolveFunnelChrome,
} from "@/lib/configurator/public-funnel";
import type { WizardStep } from "@/lib/wizard/types";

const quicklyTheme = {
  text: "#1E262E",
  muted: "#687279",
  accent: "#1B9162",
  surface: "#FFFFFF",
  background: "#F3F6F8",
  accentSecondary: "#EC6A2B",
};
const quicklyBranding = {
  text: "#111111",
  muted: "#687279",
  accent: "#000000",
  logoText: "Quickly International",
  background: "#FFFFFF",
  accentSecondary: "#EC6A2B",
};

const chrome = resolveFunnelChrome(quicklyTheme, quicklyBranding);
assert.equal(chrome.branded, true);
assert.equal(chrome.accent, "#1B9162");
assert.equal(chrome.cta, "#EC6A2B");
assert.equal(chrome.background, "#F3F6F8");
assert.equal(chrome.text, "#1E262E");
assert.equal(chrome.muted, "#687279");
assert.equal(chrome.surface, "#FFFFFF");
assert.equal(chrome.logoText, "Quickly International");
assert.equal(chrome.style?.["--funnel-cta" as keyof typeof chrome.style], "#EC6A2B");

const brandingOnly = resolveFunnelChrome({}, quicklyBranding);
assert.equal(brandingOnly.branded, true);
assert.equal(brandingOnly.accent, "#000000");
assert.equal(brandingOnly.logoText, "Quickly International");

const plain = resolveFunnelChrome({}, { family: "services" });
assert.equal(plain.branded, false);
assert.equal(plain.accent, CONFIGURATOR_FALLBACK_ACCENT);
assert.equal(plain.cta, "#0f172a");

const unsafe = resolveFunnelChrome({ accent: "red; background: url(javascript:alert(1))" }, null);
assert.equal(unsafe.branded, false);

const shop = resolveFunnelChrome(quicklyTheme, quicklyBranding, {
  accent: "#C2410C",
  background: "#FFF8F0",
  text: "#1A1510",
});
assert.equal(shop.branded, false);
assert.equal(shop.accent, "var(--shop-accent, #C2410C)");
assert.equal(shop.cta, shop.accent);
assert.equal(shop.style?.background, "var(--shop-bg, #FFF8F0)");

assert.equal(
  choiceImageUrl({
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
  }),
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
);
assert.equal(choiceImageUrl({ image: "javascript:alert(1)" }), null);
assert.equal(choiceImageUrl({ image: "  " }), null);
assert.equal(choiceImageUrl({}), null);

const steps = [
  {
    questions: [
      {
        options: {
          choices: [{ image: "javascript:alert(1)" }, { image: "https://images.unsplash.com/photo-1?w=800" }],
        },
      },
    ],
  },
];
assert.match(firstChoiceImage(steps) ?? "", /^https:\/\/images\.unsplash\.com\/photo-1\/?\?w=800$/);

assert.equal(
  funnelDocumentTitle("Quickly International", "Devis rayonnage industriel"),
  "Devis rayonnage industriel — Quickly International",
);
assert.equal(funnelDocumentTitle("Quickly International", "Devis Quickly International"), "Devis Quickly International");
assert.equal(funnelDocumentTitle("", ""), "Devis");

const description = funnelDocumentDescription(
  "Quickly International",
  "Devis rayonnage industriel",
  "Sélectionnez la gamme adaptée à votre site",
);
assert.match(description, /Quickly International/);
assert.doesNotMatch(description, /QuoteBuilder|Arrêtez de perdre/);

const meta = funnelPageMetadata({
  orgName: "Quickly International",
  configuratorName: "Devis rayonnage industriel",
  subtitle: "Sélectionnez la gamme adaptée à votre site",
  path: "/c/quickly/rayonnage",
  image: "https://images.unsplash.com/photo-1?w=800",
});
assert.deepEqual(meta.title, { absolute: "Devis rayonnage industriel — Quickly International" });
assert.equal(meta.applicationName, "Quickly International");
assert.equal(meta.openGraph?.siteName, "Quickly International");
assert.equal(meta.openGraph?.title, "Devis rayonnage industriel — Quickly International");
assert.equal(meta.openGraph?.url, "https://www.quotebuilder.co/c/quickly/rayonnage");
assert.doesNotMatch(JSON.stringify(meta), /Arrêtez de perdre|QuoteBuilder/);

const missing = funnelPageMetadata(null);
assert.deepEqual(missing.title, { absolute: "Devis" });
assert.doesNotMatch(JSON.stringify(missing), /Arrêtez de perdre/);

const wizardSteps = [
  {
    id: "s1",
    title: "Votre projet",
    subtitle: null,
    screenType: "questions",
    sortOrder: 0,
    questions: [
      {
        id: "q1",
        key: "project_type",
        label: "Gamme de rayonnage",
        helpText: null,
        type: "visual_choice",
        required: true,
        sortOrder: 0,
        options: {
          choices: [
            { value: "palette", label: "Rayonnage palette", image: "https://images.unsplash.com/photo-1" },
            { value: "picking", label: "Picking / mi-lourd" },
          ],
        },
      },
    ],
  },
  {
    id: "s2",
    title: "Dimensions",
    subtitle: null,
    screenType: "questions",
    sortOrder: 1,
    questions: [
      {
        id: "q2",
        key: "surface",
        label: "Surface à équiper (m²)",
        helpText: null,
        type: "number",
        required: true,
        sortOrder: 0,
        options: { unit: "m²" },
      },
      {
        id: "q3",
        key: "constraints",
        label: "Contraintes du site",
        helpText: null,
        type: "multi_select",
        required: false,
        sortOrder: 1,
        options: {
          choices: [
            { value: "froid", label: "Humidité / froid" },
            { value: "aucune", label: "Aucune contrainte particulière" },
          ],
        },
      },
    ],
  },
] satisfies WizardStep[];

const lines = briefLines(
  wizardSteps,
  { project_type: "palette", surface: 600, constraints: ["froid"] },
  1,
);
assert.deepEqual(
  lines.map((line) => line.value),
  ["Rayonnage palette", "600 m²", "Humidité / froid"],
);

const html = renderToStaticMarkup(
  createElement(
    "div",
    null,
    createElement(FunnelBrandHeader, {
      orgName: "Quickly International",
      logoText: "Quickly International",
      configuratorName: "Devis rayonnage industriel",
      phone: "+32 4 247 23 01",
      email: "info@quickly-int.com",
      accent: "#1B9162",
      text: "#1E262E",
      muted: "#687279",
      steps: [
        { id: "a", title: "Votre projet" },
        { id: "b", title: "Dimensions du site" },
      ],
      currentStep: 0,
      showStepper: true,
      canSwitch: true,
      mode: "wizard",
      onMode: () => undefined,
    }),
    createElement(VisualChoiceGrid, {
      label: "Gamme de rayonnage",
      helpText: "Choisissez la famille la plus proche",
      accent: "#1B9162",
      text: "#1E262E",
      muted: "#687279",
      value: "palette",
      choices: [
        {
          value: "palette",
          label: "Rayonnage palette",
          description: "Charges lourdes, allées chariots",
          image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
        },
        {
          value: "picking",
          label: "Picking / mi-lourd",
          image: "javascript:alert(1)",
        },
      ],
      onChange: () => undefined,
    }),
    createElement(FunnelBrief, {
      lines: [{ key: "project_type", label: "Gamme de rayonnage", value: "Rayonnage palette" }],
      phone: "+32 4 247 23 01",
      email: "info@quickly-int.com",
      accent: "#1B9162",
      muted: "#687279",
    }),
    createElement(FunnelCredit, { muted: "#687279" }),
  ),
);

assert.match(html, /Quickly International/);
assert.match(html, /Devis rayonnage industriel/);
assert.match(html, /info@quickly-int.com/);
assert.match(html, /#1B9162/);
assert.equal(chrome.cta, "#EC6A2B");
assert.match(html, /Rayonnage palette/);
assert.match(html, /photo-1586528116311-ad8dd3c8310d/);
assert.match(html, /aria-pressed="true"/);
assert.doesNotMatch(html, /javascript:alert/);
assert.match(html, /Votre brief/);
assert.match(html, /Propulsé par QuoteBuilder/);
assert.doesNotMatch(html, /Arrêtez de perdre|Chat IA|Funnel/);

console.log("public-funnel.test.ts ok");
