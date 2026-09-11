import type { CSSProperties, ReactNode } from "react";

type FieldMeta = { label?: string; placeholder?: string };

function parseSides(value: string): [string, string, string, string] {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return ["", "", "", ""];
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return [parts[0], parts[1], parts[2], parts[3]];
}

function joinSides(top: string, right: string, bottom: string, left: string) {
  if (!top && !right && !bottom && !left) return "";
  if (top === right && right === bottom && bottom === left) return top;
  if (top === bottom && right === left) return `${top} ${right}`.trim();
  return `${top} ${right} ${bottom} ${left}`.trim();
}

function hexOf(value: string) {
  const raw = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw;
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const r = raw[1];
    const g = raw[2];
    const b = raw[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#ffffff";
}

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-[11px] font-medium text-slate-500">{children}</span>;
}

function numFromLength(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s || s === "auto" || s === "none" || s === "inherit") return "";
  const m = s.match(/^-?\d+(?:\.\d+)?/);
  return m ? m[0] : "";
}

function bumpValue(raw: unknown, delta: number, withPx: boolean, step = 1): string {
  const n = Number.parseFloat(numFromLength(raw));
  if (!Number.isFinite(n)) {
    if (!withPx && step === 100) return String(Math.min(900, Math.max(100, 600 + delta)));
    return withPx ? `${delta}px` : String(delta);
  }
  const next = n + delta;
  if (withPx) return `${next}px`;
  if (step === 100) return String(Math.min(900, Math.max(100, next)));
  return String(next);
}

function displayValue(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (s === "auto" || s === "none" || s === "inherit") return s;
  return numFromLength(raw);
}

function parseTypedValue(raw: string, withPx: boolean): string | null {
  const t = raw.trim();
  if (t === "") return "";
  if (t === "auto" || t === "none" || t === "inherit") return t;
  if (/^-?\d+(?:\.\d+)?$/.test(t)) return withPx ? `${t}px` : t;
  return null;
}

function Stepper({
  value,
  onChange,
  withPx,
  placeholder,
  ariaLabel,
  step = 1,
}: {
  value: unknown;
  onChange: (v: string) => void;
  withPx: boolean;
  placeholder?: string;
  ariaLabel: string;
  step?: number;
}) {
  const shown = displayValue(value);
  return (
    <div className="flex min-w-0 items-stretch overflow-hidden rounded border border-slate-200 bg-white focus-within:border-orange-400">
      <input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        value={shown}
        placeholder={placeholder}
        onChange={(event) => {
          const next = parseTypedValue(event.target.value, withPx);
          if (next !== null) onChange(next);
        }}
        className="min-w-0 flex-1 border-0 bg-transparent px-1.5 py-1.5 text-[12px] leading-4 text-stone-800 outline-none"
      />
      <div className="flex w-5 shrink-0 flex-col border-l border-slate-200">
        <button
          type="button"
          aria-label={`${ariaLabel} plus`}
          tabIndex={-1}
          className="flex h-4 items-center justify-center text-stone-500 hover:bg-orange-50 hover:text-orange-600"
          onClick={() => onChange(bumpValue(value, step, withPx, step))}
        >
          <span className="block h-0 w-0 border-x-[4px] border-b-[5px] border-x-transparent border-b-current" />
        </button>
        <button
          type="button"
          aria-label={`${ariaLabel} moins`}
          tabIndex={-1}
          className="flex h-4 items-center justify-center border-t border-slate-200 text-stone-500 hover:bg-orange-50 hover:text-orange-600"
          onClick={() => onChange(bumpValue(value, -step, withPx, step))}
        >
          <span className="block h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-current" />
        </button>
      </div>
    </div>
  );
}

export function SpacingField({
  value,
  onChange,
  field,
}: {
  value?: string;
  onChange: (value: string) => void;
  field?: FieldMeta;
}) {
  const [top, right, bottom, left] = parseSides(typeof value === "string" ? value : "");
  function set(index: 0 | 1 | 2 | 3, next: string) {
    const fill = (side: string) => side || "0px";
    const sides: [string, string, string, string] = [fill(top), fill(right), fill(bottom), fill(left)];
    sides[index] = next;
    onChange(joinSides(...sides));
  }
  const boxes = [
    { label: "Haut", value: top, i: 0 as const },
    { label: "Droite", value: right, i: 1 as const },
    { label: "Bas", value: bottom, i: 2 as const },
    { label: "Gauche", value: left, i: 3 as const },
  ];
  return (
    <div>
      {field?.label ? <Label>{field.label}</Label> : null}
      <div className="grid grid-cols-4 gap-1">
        {boxes.map((box) => (
          <label key={box.label} className="min-w-0">
            <span className="mb-0.5 block text-center text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {box.label}
            </span>
            <Stepper
              value={box.value}
              onChange={(next) => set(box.i, next)}
              withPx
              placeholder="0"
              ariaLabel={box.label}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export function ColorField({
  value,
  onChange,
  field,
}: {
  value?: string;
  onChange: (value: string) => void;
  field?: FieldMeta;
}) {
  const text = typeof value === "string" ? value : "";
  return (
    <div>
      {field?.label ? <Label>{field.label}</Label> : null}
      <div className="flex items-center gap-1.5">
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-slate-200">
          {text ? null : (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: "repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 50% / 8px 8px",
              }}
            />
          )}
          <input
            type="color"
            aria-label={field?.label || "Couleur"}
            value={hexOf(text)}
            onChange={(event) => onChange(event.target.value)}
            className={`absolute inset-0 h-full w-full cursor-pointer border-0 p-0 ${text ? "" : "opacity-0"}`}
          />
        </span>
        <input
          value={text}
          onChange={(event) => onChange(event.target.value)}
          placeholder="auto"
          className="w-full rounded border border-slate-200 px-1.5 py-1.5 text-[12px] leading-4 text-stone-800 outline-none focus:border-orange-400"
        />
      </div>
    </div>
  );
}

export function CompactTextField({
  value,
  onChange,
  field,
}: {
  value?: string;
  onChange: (value: string) => void;
  field?: FieldMeta;
}) {
  return (
    <div>
      {field?.label ? <Label>{field.label}</Label> : null}
      <input
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field?.placeholder ?? ""}
        className="w-full rounded border border-slate-200 px-1.5 py-1.5 text-[12px] leading-4 text-stone-800 outline-none focus:border-orange-400"
      />
    </div>
  );
}

export function LengthField({
  value,
  onChange,
  field,
}: {
  value?: string;
  onChange: (value: string) => void;
  field?: FieldMeta;
}) {
  return (
    <div>
      {field?.label ? <Label>{field.label}</Label> : null}
      <Stepper
        value={value}
        onChange={onChange}
        withPx
        placeholder={field?.placeholder ?? "0"}
        ariaLabel={field?.label || "Valeur"}
      />
    </div>
  );
}

export function UnitlessNumberField({
  value,
  onChange,
  field,
}: {
  value?: string;
  onChange: (value: string) => void;
  field?: FieldMeta;
}) {
  const step = field?.label === "Graisse" ? 100 : 1;
  return (
    <div>
      {field?.label ? <Label>{field.label}</Label> : null}
      <Stepper
        value={value}
        onChange={onChange}
        withPx={false}
        placeholder={field?.placeholder ?? ""}
        ariaLabel={field?.label || "Valeur"}
        step={step}
      />
    </div>
  );
}

export const inspectorLabel: CSSProperties = { fontSize: 11 };
