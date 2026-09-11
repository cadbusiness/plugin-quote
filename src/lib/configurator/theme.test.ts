import assert from "node:assert/strict";
import { parseTheme } from "@/lib/shops/parse";
import { CONFIGURATOR_FALLBACK_ACCENT, resolveConfiguratorTheme, shopCssVar, shopThemeVars } from "./theme";

assert.equal(shopCssVar("accent", "#C2410C"), "var(--shop-accent, #C2410C)");
assert.equal(shopCssVar("bg", "#FFF8F0"), "var(--shop-bg, #FFF8F0)");
assert.equal(shopCssVar("text", "#1A1510"), "var(--shop-text, #1A1510)");

const funnel = resolveConfiguratorTheme("#111111");
assert.equal(funnel.themed, false);
assert.equal(funnel.accent, "#111111");
assert.equal(funnel.background, undefined);
assert.equal(funnel.text, undefined);
assert.equal(funnel.style, undefined);

const missing = resolveConfiguratorTheme(undefined);
assert.equal(missing.themed, false);
assert.equal(missing.accent, CONFIGURATOR_FALLBACK_ACCENT);

const blank = resolveConfiguratorTheme("   ");
assert.equal(blank.accent, CONFIGURATOR_FALLBACK_ACCENT);

const shop = {
  accent: "#C2410C",
  background: "#FFF8F0",
  text: "#1A1510",
};
const overridden = resolveConfiguratorTheme("#111111", shop);
assert.equal(overridden.themed, true);
assert.equal(overridden.accent, "var(--shop-accent, #C2410C)");
assert.equal(overridden.background, "var(--shop-bg, #FFF8F0)");
assert.equal(overridden.text, "var(--shop-text, #1A1510)");
assert.deepEqual(shopThemeVars(shop), {
  "--shop-accent": "#C2410C",
  "--shop-bg": "#FFF8F0",
  "--shop-text": "#1A1510",
});
assert.equal(overridden.style?.["--shop-accent" as keyof typeof overridden.style], "#C2410C");
assert.equal(overridden.style?.background, "var(--shop-bg, #FFF8F0)");
assert.equal(overridden.style?.color, "var(--shop-text, #1A1510)");

const ignored = resolveConfiguratorTheme("#d97706", null);
assert.equal(ignored.themed, false);
assert.equal(ignored.accent, "#d97706");

const fromShop = parseTheme({ accent: "#0F766E", background: "#F8FAFC", text: "#0F172A", templateId: "racking" });
const wired = resolveConfiguratorTheme("#d97706", {
  accent: fromShop.accent,
  background: fromShop.background,
  text: fromShop.text,
});
assert.equal(wired.themed, true);
assert.equal(wired.accent, "var(--shop-accent, #0F766E)");
assert.equal(wired.style?.["--shop-bg" as keyof typeof wired.style], "#F8FAFC");
