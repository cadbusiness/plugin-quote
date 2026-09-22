"use client";

import { useState } from "react";
import { ArrowRight, Check, Mail, Phone } from "lucide-react";
import { choiceImageUrl } from "@/lib/configurator/public-funnel";

export function selectionStyle(accent: string, selected: boolean) {
  if (!selected) return undefined;
  return {
    borderColor: accent,
    boxShadow: `0 0 0 3px color-mix(in srgb, ${accent} 22%, transparent)`,
  };
}

function phoneHref(phone: string) {
  const compact = phone.replace(/[^\d+]/g, "");
  if (compact.replace(/\D/g, "").length < 6) return null;
  return `tel:${compact}`;
}

export function FunnelBrandHeader({
  orgName,
  logoText,
  configuratorName,
  phone,
  email,
  accent,
  text,
  muted,
  steps,
  currentStep,
  showStepper,
  canSwitch,
  mode,
  onMode,
  onJump,
}: {
  orgName: string;
  logoText?: string | null;
  configuratorName: string;
  phone?: string | null;
  email?: string | null;
  accent: string;
  text: string;
  muted: string;
  steps: { id: string; title: string }[];
  currentStep: number;
  showStepper?: boolean;
  canSwitch?: boolean;
  mode?: "wizard" | "chat";
  onMode?: (mode: "wizard" | "chat") => void;
  onJump?: (index: number) => void;
}) {
  const brand = logoText?.trim() || orgName;
  const tel = phone ? phoneHref(phone) : null;
  return (
    <header className="sticky top-0 z-30">
      <div className="text-white" style={{ background: accent }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 lg:px-6">
          <p className="truncate text-base font-bold tracking-tight sm:text-lg">{brand}</p>
          <div className="flex items-center gap-3 text-xs font-medium">
            {phone && tel ? (
              <a href={tel} className="inline-flex items-center gap-1.5 text-white/95 hover:text-white">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {phone}
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 text-white/95 hover:text-white">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">{email}</span>
                <span className="sr-only sm:hidden">{email}</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="border-b bg-white" style={{ borderColor: "#E1E7EC" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>
              Devis sur mesure
            </p>
            <p className="truncate text-lg font-semibold tracking-tight" style={{ color: text }}>
              {configuratorName}
            </p>
          </div>
          {canSwitch && onMode ? (
            <div className="flex shrink-0 rounded-full p-1 text-sm" style={{ background: "#EEF2F5" }}>
              <button
                type="button"
                onClick={() => onMode("wizard")}
                className="rounded-full px-3 py-1 font-medium"
                style={mode === "wizard" ? { background: accent, color: "#fff" } : { color: text }}
              >
                Parcours
              </button>
              <button
                type="button"
                onClick={() => onMode("chat")}
                className="rounded-full px-3 py-1 font-medium"
                style={mode === "chat" ? { background: accent, color: "#fff" } : { color: text }}
              >
                Assistant
              </button>
            </div>
          ) : null}
        </div>
        {showStepper && steps.length ? (
          <div className="mx-auto max-w-6xl px-4 pb-3 lg:px-6">
            <ol className="flex gap-1 overflow-x-auto pb-1">
              {steps.map((step, index) => {
                const current = index === currentStep;
                const done = index < currentStep;
                const body = (
                  <>
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold"
                      style={
                        current
                          ? { background: "#fff", color: accent }
                          : done
                            ? { background: accent, color: "#fff" }
                            : { background: "#fff", color: muted, boxShadow: "inset 0 0 0 1px #D5DDE3" }
                      }
                    >
                      {done ? <Check className="h-3 w-3" strokeWidth={2.75} aria-hidden /> : index + 1}
                    </span>
                    <span className="truncate">{step.title}</span>
                  </>
                );
                const className =
                  "flex max-w-[14rem] shrink-0 items-center gap-2 rounded-full px-2 py-1 text-xs font-medium";
                return (
                  <li key={step.id}>
                    {done && onJump ? (
                      <button
                        type="button"
                        onClick={() => onJump(index)}
                        className={className}
                        style={{ color: accent }}
                      >
                        {body}
                      </button>
                    ) : (
                      <span
                        className={className}
                        style={{ color: current ? "#fff" : muted, background: current ? accent : "transparent" }}
                        aria-current={current ? "step" : undefined}
                      >
                        {body}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function VisualChoiceGrid({
  label,
  helpText,
  choices,
  value,
  error,
  accent,
  text,
  muted,
  onChange,
}: {
  label: string;
  helpText?: string | null;
  choices: { value: string; label: string; description?: string; image?: string }[];
  value: unknown;
  error?: string;
  accent: string;
  text?: string;
  muted?: string;
  onChange: (value: string) => void;
}) {
  const illustrated = choices.some((choice) => choiceImageUrl(choice));
  return (
    <div>
      <p className="text-sm font-semibold" style={text ? { color: text } : undefined}>
        {label}
      </p>
      {helpText ? (
        <p className="mt-1 text-sm" style={{ color: muted ?? "#687279" }}>
          {helpText}
        </p>
      ) : null}
      <div className={illustrated ? "mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3" : "mt-4 grid gap-3 sm:grid-cols-2"}>
        {choices.map((choice) => {
          const selected = value === choice.value;
          const image = choiceImageUrl(choice);
          return (
            <button
              key={choice.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(choice.value)}
              className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                selected ? "" : "border-[#E1E7EC]"
              }`}
              style={selectionStyle(accent, selected)}
            >
              {illustrated ? <ChoicePhoto src={image} alt={choice.label} selected={selected} accent={accent} /> : null}
              <span className="block p-3.5">
                <span className="block text-sm font-semibold leading-snug" style={{ color: text ?? "#1C2430" }}>
                  {choice.label}
                </span>
                {choice.description ? (
                  <span className="mt-1 block line-clamp-3 text-xs leading-relaxed" style={{ color: muted ?? "#687279" }}>
                    {choice.description}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function ChoicePhoto({
  src,
  alt,
  selected,
  accent,
}: {
  src: string | null;
  alt: string;
  selected: boolean;
  accent: string;
}) {
  const [hidden, setHidden] = useState(!src);
  return (
    <span className="relative block aspect-[5/3] overflow-hidden bg-[#E7EDF1]">
      {src && !hidden ? (
        // External catalogue photos are merchant-provided URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setHidden(true)}
        />
      ) : null}
      {selected ? (
        <span
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-white shadow"
          style={{ background: accent }}
          aria-hidden
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </span>
      ) : null}
    </span>
  );
}

export function FunnelBrief({
  lines,
  phone,
  email,
  accent,
  muted,
}: {
  lines: { key: string; label: string; value: string }[];
  phone?: string | null;
  email?: string | null;
  accent: string;
  muted: string;
}) {
  const tel = phone ? phoneHref(phone) : null;
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-36 rounded-2xl border bg-white p-5" style={{ borderColor: "#E1E7EC" }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>
          Votre brief
        </p>
        <p className="mt-1 text-sm font-semibold">Récapitulatif</p>
        {lines.length ? (
          <dl className="mt-4 space-y-3">
            {lines.map((line) => (
              <div key={line.key}>
                <dt className="text-[11px] font-medium uppercase tracking-wide" style={{ color: muted }}>
                  {line.label}
                </dt>
                <dd className="text-sm font-medium leading-snug">{line.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-4 text-sm leading-relaxed" style={{ color: muted }}>
            Vos choix s’affichent ici, étape après étape.
          </p>
        )}
        {phone || email ? (
          <div className="mt-5 space-y-1 border-t pt-4 text-sm" style={{ borderColor: "#E1E7EC", color: muted }}>
            {phone && tel ? (
              <a href={tel} className="block font-medium" style={{ color: accent }}>
                {phone}
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className="block">
                {email}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export function FunnelCredit({ muted }: { muted: string }) {
  return (
    <p className="pb-8 text-center text-[11px] tracking-wide" style={{ color: muted }}>
      Propulsé par QuoteBuilder
    </p>
  );
}

export function FunnelContinueIcon() {
  return <ArrowRight className="h-4 w-4" aria-hidden />;
}
