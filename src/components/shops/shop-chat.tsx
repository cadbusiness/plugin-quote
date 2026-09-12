"use client";

import { useEffect, useRef, useState } from "react";
import {
  shopAgentSelectionLabel,
  shouldSendChatOnEnter,
  type ShopAgentSelection,
} from "@/lib/shops/agent/selection";
import type { ShopLayout, ShopLegal, ShopNavDraft, ShopPageSeo, ShopSeo, ShopTheme } from "@/lib/shops/types";

export type EditorPage = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  seo: ShopPageSeo;
  blocks: ShopLayout;
  isPublished: boolean;
  sortOrder: number;
};

export type ShopChatDraft = {
  name: string;
  status: string;
  theme: ShopTheme;
  seo: ShopSeo;
  legal: ShopLegal;
  pages: EditorPage[];
  nav: ShopNavDraft[];
};

export type ShopChatResult = ShopChatDraft & { text: string };

export type ShopChatMessage = { role: "user" | "assistant"; content: string };

export function ShopChat({
  shopId,
  seedPrompt,
  getDraft,
  onApplied,
  messages,
  onMessages,
  selection,
  onClearSelection,
}: {
  shopId: string;
  seedPrompt?: string;
  getDraft: () => ShopChatDraft;
  onApplied: (result: ShopChatResult) => void;
  messages: ShopChatMessage[];
  onMessages: (messages: ShopChatMessage[]) => void;
  selection?: ShopAgentSelection | null;
  onClearSelection?: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seeded = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;
    const history = messages;
    setDraft("");
    setError(null);
    setPending(true);
    onMessages([...history, { role: "user", content }]);
    try {
      const response = await fetch(`/api/shops/${shopId}/agent`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: content,
          history,
          draft: getDraft(),
          selection: selection ?? undefined,
        }),
      });
      const payload = (await response.json()) as ShopChatResult & { error?: string };
      if (!response.ok) {
        setError(payload.error || "Le chat n’a pas pu modifier la boutique.");
        setPending(false);
        return;
      }
      onMessages([...history, { role: "user", content }, { role: "assistant", content: payload.text || "C’est mis à jour." }]);
      onApplied(payload);
    } catch {
      setError("Réseau indisponible.");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (seeded.current || !seedPrompt || messages.length) return;
    seeded.current = true;
    void send(seedPrompt);
  }, [seedPrompt]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {selection ? (
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2">
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-[#C2410C]">
            {shopAgentSelectionLabel(selection)}
          </span>
          <p className="min-w-0 flex-1 truncate text-xs text-slate-500">Le chat modifie cette zone</p>
          {onClearSelection ? (
            <button type="button" onClick={onClearSelection} className="text-xs text-slate-400 hover:text-slate-700">
              Retirer
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {!messages.length && !pending ? (
          <p className="text-sm text-slate-500">
            {selection
              ? `Décrivez le changement pour « ${shopAgentSelectionLabel(selection)} »…`
              : "« Rajoute un bandeau sur les délais », « mets une image dans la colonne de droite », « change la FAQ »…"}
          </p>
        ) : null}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-lg px-3 py-2 text-sm leading-6 ${
              message.role === "user" ? "bg-orange-50 text-slate-900" : "bg-slate-50 text-slate-700"
            }`}
          >
            {message.content}
          </div>
        ))}
        {pending ? <p className="text-xs text-slate-400">L’IA met à jour les pages…</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div ref={bottom} />
      </div>
      <form
        className="border-t border-slate-100 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (!shouldSendChatOnEnter({ key: event.key, shiftKey: event.shiftKey, isComposing: event.nativeEvent.isComposing })) {
              return;
            }
            event.preventDefault();
            void send(draft);
          }}
          rows={3}
          placeholder={selection ? `Modifier ${shopAgentSelectionLabel(selection).toLowerCase()}…` : "Modifier la boutique…"}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-[11px] text-slate-400">Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne</p>
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          className="mt-2 rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
