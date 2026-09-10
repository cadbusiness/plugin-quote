"use client";

import { useState, type ReactNode } from "react";

const BUBBLE =
  "pointer-events-none absolute top-full z-40 mt-1.5 w-52 rounded-md bg-slate-900 px-2.5 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-lg";

function alignClass(align: "left" | "center" | "right") {
  if (align === "left") return "left-0";
  if (align === "right") return "right-0";
  return "left-1/2 -translate-x-1/2";
}

function bubbleClass(open: boolean, align: "left" | "center" | "right") {
  return `${BUBBLE} ${alignClass(align)} ${
    open ? "block" : "hidden peer-hover:block peer-focus-visible:block"
  }`;
}

export function HelpTip({
  label,
  children,
  align = "center",
}: {
  label: string;
  children: ReactNode;
  align?: "left" | "center" | "right";
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`Aide : ${label}`}
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        onBlur={() => setOpen(false)}
        className="peer inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold leading-none text-slate-500 hover:bg-orange-50 hover:text-[#C2410C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D04]"
      >
        ?
      </button>
      <span role="tooltip" className={bubbleClass(open, align)}>
        {children}
      </span>
    </span>
  );
}

export function IconHint({
  label,
  help,
  pending,
  align = "right",
  onClick,
  children,
}: {
  label: string;
  help: string;
  pending?: boolean;
  align?: "left" | "center" | "right";
  onClick?: () => void;
  children: ReactNode;
}) {
  const look =
    "peer inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500";
  return (
    <span className="relative inline-flex">
      {onClick ? (
        <button
          type="button"
          aria-label={label}
          disabled={pending}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClick();
          }}
          className={`${look} hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40`}
        >
          {children}
        </button>
      ) : (
        <span tabIndex={0} aria-label={label} className={`${look} outline-none`}>
          {children}
        </span>
      )}
      <span role="tooltip" className={bubbleClass(false, align)}>
        {help}
      </span>
    </span>
  );
}

export function LabelHelp({
  children,
  help,
}: {
  children: ReactNode;
  help: string;
}) {
  const label = typeof children === "string" ? children : "Aide";
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <HelpTip label={label}>{help}</HelpTip>
    </span>
  );
}
