import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/marketing/site";
import type { Answers, WizardQuestion, WizardStep } from "@/lib/wizard/types";
import {
  CONFIGURATOR_FALLBACK_ACCENT,
  resolveConfiguratorTheme,
  type ConfiguratorThemeOverride,
} from "@/lib/configurator/theme";

const NEUTRAL = {
  background: "#F4F6F8",
  surface: "#FFFFFF",
  text: "#1C2430",
  muted: "#687279",
};

export type FunnelChrome = {
  /** Org or funnel colors are present, so the public page can wear that brand. */
  branded: boolean;
  accent: string;
  cta: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  logoText: string | null;
  style?: CSSProperties;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function readHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed) || /^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  return null;
}

function pickColor(
  theme: Record<string, unknown> | null,
  branding: Record<string, unknown> | null,
  key: string,
) {
  return readHexColor(theme?.[key]) ?? readHexColor(branding?.[key]);
}

function readLogo(theme: Record<string, unknown> | null, branding: Record<string, unknown> | null) {
  const raw = theme?.logoText ?? branding?.logoText;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 80);
}

export function resolveFunnelChrome(
  themeInput: unknown,
  brandingInput?: unknown,
  override?: ConfiguratorThemeOverride | null,
): FunnelChrome {
  const theme = asRecord(themeInput);
  const branding = asRecord(brandingInput);
  const logoText = readLogo(theme, branding);

  if (override) {
    const resolved = resolveConfiguratorTheme(readHexColor(theme?.accent) ?? theme?.accent, override);
    return {
      branded: false,
      accent: resolved.accent,
      cta: resolved.accent,
      background: resolved.background ?? override.background,
      surface: NEUTRAL.surface,
      text: resolved.text ?? override.text,
      muted: NEUTRAL.muted,
      logoText,
      style: resolved.style,
    };
  }

  const accent = pickColor(theme, branding, "accent") ?? pickColor(theme, branding, "accentSecondary");
  const secondary = pickColor(theme, branding, "accentSecondary");
  const background = pickColor(theme, branding, "background");
  const text = pickColor(theme, branding, "text");
  const muted = pickColor(theme, branding, "muted");
  const surface = pickColor(theme, branding, "surface");
  if (!accent && !background && !text) {
    return {
      branded: false,
      accent: CONFIGURATOR_FALLBACK_ACCENT,
      cta: "#0f172a",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      logoText,
    };
  }

  const resolvedAccent = accent ?? CONFIGURATOR_FALLBACK_ACCENT;
  const cta = secondary ?? resolvedAccent;
  const resolvedBackground = background ?? NEUTRAL.background;
  const resolvedText = text ?? NEUTRAL.text;
  const resolvedMuted = muted ?? NEUTRAL.muted;
  const resolvedSurface = surface ?? NEUTRAL.surface;
  return {
    branded: true,
    accent: resolvedAccent,
    cta,
    background: resolvedBackground,
    surface: resolvedSurface,
    text: resolvedText,
    muted: resolvedMuted,
    logoText,
    style: {
      background: resolvedBackground,
      color: resolvedText,
      ["--funnel-accent" as string]: resolvedAccent,
      ["--funnel-cta" as string]: cta,
      ["--funnel-muted" as string]: resolvedMuted,
      ["--funnel-surface" as string]: resolvedSurface,
    },
  };
}

export function choiceImageUrl(choice: { image?: unknown } | null | undefined): string | null {
  const raw = typeof choice?.image === "string" ? choice.image.trim() : "";
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  return url.toString();
}

export function firstChoiceImage(
  steps: { questions: { options?: { choices?: { image?: unknown }[] } }[] }[],
): string | null {
  for (const step of steps) {
    for (const question of step.questions) {
      for (const choice of question.options?.choices ?? []) {
        const image = choiceImageUrl(choice);
        if (image) return image;
      }
    }
  }
  return null;
}

export function formatAnswer(question: WizardQuestion, value: unknown): string | null {
  const choices = question.options.choices ?? [];
  if (question.type === "multi_select") {
    const selected = Array.isArray(value) ? value.map(String) : [];
    const labels = selected
      .map((item) => choices.find((choice) => choice.value === item)?.label ?? item)
      .filter(Boolean);
    return labels.length ? labels.join(", ") : null;
  }
  if (question.type === "visual_choice" || question.type === "select") {
    if (typeof value !== "string" || !value) return null;
    return choices.find((choice) => choice.value === value)?.label ?? value;
  }
  if (question.type === "number") {
    if (value == null || value === "") return null;
    const unit = question.options.unit?.trim();
    return unit ? `${value} ${unit}` : String(value);
  }
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export function briefLines(steps: WizardStep[], answers: Answers, throughIndex: number) {
  const lines: { key: string; label: string; value: string }[] = [];
  steps.forEach((step, index) => {
    if (index > throughIndex) return;
    for (const question of step.questions) {
      const value = formatAnswer(question, answers[question.key]);
      if (!value) continue;
      lines.push({ key: question.key, label: question.label, value });
    }
  });
  return lines;
}

export function funnelDocumentTitle(orgName: string, configuratorName: string) {
  const org = orgName.trim();
  const name = configuratorName.trim();
  if (!org && !name) return "Devis";
  if (!name) return `Devis — ${org}`;
  if (!org) return name;
  if (name.toLocaleLowerCase("fr").includes(org.toLocaleLowerCase("fr"))) return name;
  return `${name} — ${org}`;
}

export function funnelDocumentDescription(orgName: string, configuratorName: string, subtitle?: string | null) {
  const org = orgName.trim() || "notre équipe";
  const name = configuratorName.trim() || "Devis";
  const lead = subtitle?.trim();
  if (lead) return `${name} — ${org}. ${lead}`;
  return `${name} — ${org}. Décrivez la gamme, les dimensions et les charges pour recevoir une proposition.`;
}

export function funnelPageMetadata(input: {
  orgName: string;
  configuratorName: string;
  subtitle?: string | null;
  path: string;
  image?: string | null;
} | null): Metadata {
  if (!input) {
    return {
      title: { absolute: "Devis" },
      description: "Parcours de devis.",
      robots: { index: false, follow: false },
    };
  }
  const title = funnelDocumentTitle(input.orgName, input.configuratorName);
  const description = funnelDocumentDescription(input.orgName, input.configuratorName, input.subtitle);
  const image = input.image?.trim() || null;
  const keywords = [input.orgName, input.configuratorName, "devis"].map((item) => item.trim()).filter(Boolean);
  return {
    title: { absolute: title },
    description,
    applicationName: input.orgName.trim() || "Devis",
    keywords,
    authors: input.orgName.trim() ? [{ name: input.orgName.trim() }] : undefined,
    creator: input.orgName.trim() || undefined,
    publisher: input.orgName.trim() || undefined,
    alternates: { canonical: absoluteUrl(input.path) },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: absoluteUrl(input.path),
      siteName: input.orgName.trim() || "Devis",
      locale: "fr_FR",
      type: "website",
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
