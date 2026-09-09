"use client";

import { useState } from "react";

export function HelpTip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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
      <span
        role="tooltip"
        className={`absolute left-1/2 top-full z-40 mt-1.5 w-56 -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-lg ${
          open ? "block" : "hidden peer-hover:block peer-focus-visible:block"
        }`}
      >
        {children}
      </span>
    </span>
  );
}

export function LabelHelp({
  children,
  help,
}: {
  children: React.ReactNode;
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
