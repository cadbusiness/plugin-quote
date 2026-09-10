import type { CSSProperties, ReactNode } from "react";

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

const cell: CSSProperties = {
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: 4,
  padding: "5px 6px",
  fontSize: 12,
  lineHeight: "16px",
};

export function SpacingField({
  value,
  onChange,
  field,
}: {
  value?: string;
  onChange: (value: string) => void;
  field: { label?: string };
}) {
  const [top, right, bottom, left] = parseSides(typeof value === "string" ? value : "");
  function set(index: 0 | 1 | 2 | 3, next: string) {
    const sides: [string, string, string, string] = [top, right, bottom, left];
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
      <Label>{field.label}</Label>
      <div className="grid grid-cols-4 gap-1">
        {boxes.map((box) => (
          <label key={box.label} className="min-w-0">
            <span className="mb-0.5 block text-[10px] uppercase tracking-wide text-slate-400">{box.label}</span>
            <input value={box.value} onChange={(event) => set(box.i, event.target.value)} placeholder="0" style={cell} />
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
  field: { label?: string };
}) {
  const text = typeof value === "string" ? value : "";
  return (
    <div>
      <Label>{field.label}</Label>
      <div className="flex items-center gap-1.5">
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-slate-200">
          {text ? null : (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 50% / 8px 8px",
              }}
            />
          )}
          <input
            type="color"
            aria-label={field.label}
            value={hexOf(text)}
            onChange={(event) => onChange(event.target.value)}
            className={`absolute inset-0 h-full w-full cursor-pointer border-0 p-0 ${text ? "" : "opacity-0"}`}
          />
        </span>
        <input value={text} onChange={(event) => onChange(event.target.value)} placeholder="auto" style={cell} />
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
  field: { label?: string; placeholder?: string };
}) {
  return (
    <div>
      <Label>{field.label}</Label>
      <input
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder ?? ""}
        style={cell}
      />
    </div>
  );
}
