"use client";

import { ArrowUp, ImagePlus, Square, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { parseShopAgentSse, shopChatChips, shopChatFollowUps } from "@/lib/shops/agent/events";
import { shopAgentSelectionLabel, shouldSendChatOnEnter, type ShopAgentSelection } from "@/lib/shops/agent/selection";
import {
  historyForAgent,
  plainShopChatText,
  saveShopChatLocal,
  type ShopChatMessage,
} from "@/lib/shops/chat-store";
import type { ShopLayout, ShopLegal, ShopNavDraft, ShopPageSeo, ShopSeo, ShopTheme } from "@/lib/shops/types";

export type { ShopChatMessage };

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

export type ShopChatResult = ShopChatDraft & { text?: string };

export function ShopChat({
  shopId,
  seedPrompt,
  getDraft,
  onApplied,
  messages,
  onMessages,
  selection,
  onClearSelection,
  onBusy,
  onBeforeSend,
  onUndo,
  canUndo,
  onFocusNode,
  onInspect,
}: {
  shopId: string;
  seedPrompt?: string;
  getDraft: () => ShopChatDraft;
  onApplied: (result: ShopChatResult) => void;
  messages: ShopChatMessage[];
  onMessages: (messages: ShopChatMessage[]) => void;
  selection?: ShopAgentSelection | null;
  onClearSelection?: () => void;
  onBusy?: (busy: boolean) => void;
  onBeforeSend?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onFocusNode?: (nodeId: string | null, pageSlug?: string) => void;
  onInspect?: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const seeded = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const queued = useRef<string | null>(null);
  const messagesRef = useRef(messages);
  const bottom = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  messagesRef.current = messages;

  function persist(next: ShopChatMessage[]) {
    saveShopChatLocal(shopId, next);
    void fetch(`/api/shops/${shopId}/chat`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: next.filter((item) => !item.hidden).slice(-24) }),
    }).catch(() => undefined);
  }

  function commit(next: ShopChatMessage[]) {
    messagesRef.current = next;
    onMessages(next);
    persist(next);
  }

  function resize() {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  async function send(text: string, opts?: { seed?: boolean }) {
    const content = text.trim();
    if (!content && !imageUrl) return;
    if (pending) {
      queued.current = content;
      setDraft("");
      return;
    }
    const history = historyForAgent(messagesRef.current);
    const visible: ShopChatMessage = { role: "user", content, image: imageUrl ?? undefined };
    setDraft("");
    setError(null);
    setPending(true);
    onBusy?.(true);
    onBeforeSend?.();
    const nextMessages = opts?.seed
      ? [...messagesRef.current, { role: "assistant" as const, content: "", steps: [{ name: "seed", label: "Composition de la boutique", status: "run" as const }] }]
      : [...messagesRef.current, visible, { role: "assistant" as const, content: "", steps: [] }];
    commit(nextMessages);

    const controller = new AbortController();
    abortRef.current = controller;
    const usedImage = imageUrl;
    setImageUrl(null);

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
          seed: Boolean(opts?.seed),
          imageUrl: usedImage ?? undefined,
        }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Le chat n’a pas pu modifier la boutique.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";
      let steps = nextMessages.at(-1)?.steps ?? [];

      const patchAssistant = (patch: Partial<ShopChatMessage>) => {
        const current = messagesRef.current;
        const last = current[current.length - 1];
        if (!last || last.role !== "assistant") return;
        commit([...current.slice(0, -1), { ...last, ...patch }]);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parsed = parseShopAgentSse(buffer);
        buffer = parsed.rest;
        for (const event of parsed.events) {
          if (event.type === "tool") {
            const existing = steps.findIndex((step) => step.name === event.step.name && step.status === "run");
            if (event.step.status === "run") steps = [...steps, event.step];
            else if (existing >= 0) steps = steps.map((step, index) => (index === existing ? event.step : step));
            else steps = [...steps, event.step];
            patchAssistant({ steps });
            if (event.nodeId) onFocusNode?.(event.nodeId, event.pageSlug);
          } else if (event.type === "draft") {
            onApplied(event.draft);
          } else if (event.type === "text") {
            assistant = event.text;
            patchAssistant({ content: assistant, steps });
          } else if (event.type === "done") {
            assistant = event.text;
            patchAssistant({ content: assistant || "C’est mis à jour.", steps });
            onApplied(event.draft);
            onFocusNode?.(event.nodeId ?? null, event.pageSlug);
          } else if (event.type === "error") {
            throw new Error(event.error);
          }
        }
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        setError(null);
        const current = messagesRef.current;
        const last = current[current.length - 1];
        if (last?.role === "assistant" && !last.content) {
          commit([...current.slice(0, -1), { ...last, content: "Arrêté." }]);
        }
      } else {
        setError(caught instanceof Error ? caught.message : "Réseau indisponible.");
      }
    } finally {
      abortRef.current = null;
      setPending(false);
      onBusy?.(false);
      const next = queued.current;
      queued.current = null;
      if (next) void send(next);
    }
  }

  useEffect(() => {
    if (seeded.current || !seedPrompt || messages.length) return;
    seeded.current = true;
    void send(seedPrompt, { seed: true });
  }, [seedPrompt]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  useEffect(() => {
    resize();
  }, [draft]);

  const visible = messages.filter((item) => !item.hidden);
  const chips = pending ? [] : visible.some((item) => item.role === "assistant" && item.content) ? shopChatFollowUps() : shopChatChips(selection);
  const context = selection
    ? selection.kind === "chrome"
      ? shopAgentSelectionLabel(selection)
      : `${selection.pageTitle} · ${shopAgentSelectionLabel(selection)}`
    : null;

  async function onPickImage(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch(`/api/shops/${shopId}/image`, { method: "POST", credentials: "same-origin", body });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "Image refusée.");
      setImageUrl(payload.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Image refusée.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {context ? (
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 py-2">
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-[#C2410C]">{context}</span>
          <p className="min-w-0 flex-1 truncate text-xs text-slate-500">On travaille cette zone</p>
          {onInspect ? (
            <button type="button" onClick={onInspect} className="text-xs font-medium text-slate-500 hover:text-slate-800">
              Champs
            </button>
          ) : null}
          {onClearSelection ? (
            <button type="button" onClick={onClearSelection} className="text-xs text-slate-400 hover:text-slate-700">
              Retirer
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {!visible.length && !pending ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Cliquez un bloc, puis dites ce que vous voulez.</p>
            <div className="flex flex-wrap gap-1.5">
              {shopChatChips(selection).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => void send(chip)}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-[#C2410C]"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {visible.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-lg px-3 py-2 text-sm leading-6 ${
              message.role === "user" ? "bg-orange-50 text-slate-900" : "bg-slate-50 text-slate-700"
            }`}
          >
            {message.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={message.image} alt="" className="mb-2 max-h-24 rounded-md object-cover" />
            ) : null}
            {message.steps?.length ? (
              <ul className="mb-2 space-y-1 text-[11px] text-slate-400">
                {message.steps.map((step, stepIndex) => (
                  <li key={`${step.name}-${stepIndex}`}>
                    {step.status === "run" ? "… " : step.status === "error" ? "× " : "✓ "}
                    {step.label}
                  </li>
                ))}
              </ul>
            ) : null}
            {message.content || (pending && index === visible.length - 1 && message.role === "assistant")
              ? (message.role === "assistant" ? plainShopChatText(message.content) : message.content) || "En cours…"
              : null}
          </div>
        ))}
        {error ? (
          <div className="flex items-center gap-2">
            <p className="text-sm text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => void send([...visible].reverse().find((item) => item.role === "user")?.content ?? draft)}
              className="text-xs font-medium text-[#C2410C]"
            >
              Réessayer
            </button>
          </div>
        ) : null}
        <div ref={bottom} />
      </div>

      {visible.some((item) => item.role === "assistant" && item.content) && !pending ? (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-50 px-3 pt-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                if (chip === "Reviens en arrière") {
                  onUndo?.();
                  return;
                }
                void send(chip);
              }}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-[#C2410C]"
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        {imageUrl ? (
          <div className="mb-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
            <button type="button" onClick={() => setImageUrl(null)} className="text-xs text-slate-400 hover:text-slate-700">
              Retirer l’image
            </button>
          </div>
        ) : null}
        <div className="flex items-end gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 focus-within:border-[#E85D04]">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void onPickImage(file);
            }}
          />
          <button
            type="button"
            aria-label="Joindre une image"
            disabled={uploading || pending}
            onClick={() => fileRef.current?.click()}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40"
          >
            <ImagePlus className="h-4 w-4" aria-hidden />
          </button>
          <textarea
            ref={area}
            value={draft}
            rows={1}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (!shouldSendChatOnEnter({ key: event.key, shiftKey: event.shiftKey, isComposing: event.nativeEvent.isComposing })) {
                return;
              }
              event.preventDefault();
              void send(draft);
            }}
            placeholder={selection ? `Modifier ${shopAgentSelectionLabel(selection).toLowerCase()}…` : "Décrivez le changement…"}
            className="max-h-40 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none"
          />
          {pending ? (
            <button
              type="button"
              aria-label="Arrêter"
              onClick={() => abortRef.current?.abort()}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white"
            >
              <Square className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Envoyer"
              disabled={(!draft.trim() && !imageUrl) || uploading}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E85D04] text-white hover:bg-[#d35400] disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
        {canUndo && onUndo ? (
          <button type="button" onClick={onUndo} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800">
            <Undo2 className="h-3.5 w-3.5" aria-hidden />
            Annuler le dernier tour
          </button>
        ) : null}
      </form>
    </div>
  );
}
