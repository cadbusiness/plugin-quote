"use client";

import { useEffect, useState } from "react";
import { buildMemberPageFromTemplate, MEMBER_PAGE_TEMPLATES, type MemberPageTemplateId } from "@/lib/members/page-templates";
import type { MemberPageDraft } from "@/lib/members/types";

export const CREATE_MEMBER_PAGE_EVENT = "qb:create-member-page";

export function openCreateMemberPageDialog() {
  window.dispatchEvent(new Event(CREATE_MEMBER_PAGE_EVENT));
}

export function CreateMemberPageDialog({
  open,
  pages,
  onClose,
  onCreate,
}: {
  open: boolean;
  pages: MemberPageDraft[];
  onClose: () => void;
  onCreate: (page: MemberPageDraft) => void;
}) {
  const [step, setStep] = useState(0);
  const [templateId, setTemplateId] = useState<MemberPageTemplateId>("documents");
  const [title, setTitle] = useState(MEMBER_PAGE_TEMPLATES[0]?.defaultTitle ?? "Nouvelle page");

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setTemplateId("documents");
    setTitle(MEMBER_PAGE_TEMPLATES[0]?.defaultTitle ?? "Nouvelle page");
  }, [open]);

  if (!open) return null;

  const selected = MEMBER_PAGE_TEMPLATES.find((item) => item.id === templateId) ?? MEMBER_PAGE_TEMPLATES[0];

  function submit() {
    const page = buildMemberPageFromTemplate(templateId, pages, title);
    if (!page) return;
    onCreate(page);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-member-page-title"
        className="relative z-10 flex max-h-[min(36rem,calc(100dvh-2rem))] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#E85D04]">
            Nouvelle page · {step + 1} / 2
          </p>
          <h2 id="create-member-page-title" className="mt-1 text-lg font-semibold text-slate-900">
            {step === 0 ? "Quel modèle" : "Nom de la page"}
          </h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === 0 ? (
            <div className="grid gap-2">
              {MEMBER_PAGE_TEMPLATES.map((item) => {
                const on = item.id === templateId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTemplateId(item.id);
                      setTitle(item.defaultTitle);
                    }}
                    className={`rounded-lg px-3 py-3 text-left ring-1 transition-colors ${
                      on ? `${item.tint} ring-current` : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 opacity-80">{item.blurb}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <label className="block text-sm">
              <span className="font-medium text-slate-900">Titre</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Modèle {selected?.label}. L’URL sera un slug unique à partir de ce titre.
              </span>
            </label>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
          <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-900">
            Annuler
          </button>
          <div className="flex gap-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(0)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
              >
                Retour
              </button>
            ) : null}
            {step === 0 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
              >
                Continuer
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
              >
                Ajouter la page
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
