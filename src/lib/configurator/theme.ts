import type { CSSProperties } from "react";

export type ConfiguratorThemeOverride = {
  accent: string;
  background: string;
  text: string;
};

export const CONFIGURATOR_FALLBACK_ACCENT = "#d97706";

export function shopCssVar(token: "accent" | "bg" | "text", fallback: string) {
  const name = token === "accent" ? "--shop-accent" : token === "bg" ? "--shop-bg" : "--shop-text";
  return `var(${name}, ${fallback})`;
}

export function shopThemeVars(theme: ConfiguratorThemeOverride): CSSProperties {
  return {
    ["--shop-accent" as string]: theme.accent,
    ["--shop-bg" as string]: theme.background,
    ["--shop-text" as string]: theme.text,
  };
}

export function resolveConfiguratorTheme(
  funnelAccent: unknown,
  override?: ConfiguratorThemeOverride | null,
) {
  const fallbackAccent =
    (typeof funnelAccent === "string" && funnelAccent.trim()) || CONFIGURATOR_FALLBACK_ACCENT;
  if (!override) {
    return {
      themed: false as const,
      accent: fallbackAccent,
      background: undefined,
      text: undefined,
      style: undefined as CSSProperties | undefined,
    };
  }
  const accent = shopCssVar("accent", override.accent);
  const background = shopCssVar("bg", override.background);
  const text = shopCssVar("text", override.text);
  return {
    themed: true as const,
    accent,
    background,
    text,
    style: {
      ...shopThemeVars(override),
      background,
      color: text,
    } as CSSProperties,
  };
}
