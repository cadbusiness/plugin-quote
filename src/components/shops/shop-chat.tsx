"use client";

import { useEffect, useRef, useState } from "react";
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

type ChatMessage = { role: "user" | "assistant"; content: string };

export function ShopChat({
  shopId,
  seedPrompt,
  getDraft,
  onApplied,
}: {
  shopId: string;
  seedPrompt?: string;
  getDraft: () => ShopChatDraft;
  onApplied: (result: ShopChatResult) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seeded = useRef(false);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;
    const history = messages;
    setDraft("");
    setError(null);
    setPending(true);
    setMessages([...history, { role: "user", content }]);
    try {
      const response = await fetch(`/api/shops/${shopId}/agent`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: content, history, draft: getDraft() }),
      });
      const payload = (await response.json()) as ShopChatResult & { error?: string };
      if (!response.ok) {
        setError(payload.error || "Le chat n’a pas pu modifier la boutique.");
        setPending(false);
        return;
      }
      setMessages([...history, { role: "user", content }, { role: "assistant", content: payload.text || "C’est mis à jour." }]);
      onApplied(payload);
    } catch {
      setError("Réseau indisponible.");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (seeded.current || !seedPrompt) return;
    seeded.current = true;
    void send(seedPrompt);
  }, [seedPrompt]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {!messages.length && !pending ? (
          <p className="text-sm text-slate-500">
            « Rajoute un bandeau sur les délais », « mets une image dans la colonne de droite », « change la FAQ »…
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
          rows={3}
          placeholder="Modifier la boutique…"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
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
