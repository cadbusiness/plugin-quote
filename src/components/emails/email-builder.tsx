"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { deleteCampaign, saveCampaign, sendCampaignNow, type CampaignState } from "@/app/(app)/emails/actions";
import {
  BLOCK_LABELS,
  emptyBlock,
  parseDesign,
  type EmailBlock,
  type EmailBlockType,
  type EmailDesign,
} from "@/lib/emails/blocks";
import { renderEmailHtml } from "@/lib/emails/render";

const PALETTE: EmailBlockType[] = ["heading", "text", "button", "image", "spacer", "divider", "recap", "footer"];

export function EmailBuilder({
  campaign,
  segments,
  channels,
  recipientCount,
}: {
  campaign: {
    id: string;
    name: string;
    subject: string;
    preview_text: string | null;
    design: unknown;
    segment_id: string | null;
    channel_id: string | null;
    send_mode: string;
    skip_recent_days: number;
    status: string;
  };
  segments: { id: string; name: string }[];
  channels: { id: string; label: string; address: string }[];
  recipientCount: number;
}) {
  const initial = parseDesign(campaign.design);
  const [name, setName] = useState(campaign.name);
  const [subject, setSubject] = useState(campaign.subject);
  const [preview, setPreview] = useState(campaign.preview_text ?? "");
  const [sendMode, setSendMode] = useState(campaign.send_mode === "group" ? "group" : "personal");
  const [segmentId, setSegmentId] = useState(campaign.segment_id ?? "");
  const [channelId, setChannelId] = useState(campaign.channel_id ?? "");
  const [skipDays, setSkipDays] = useState(String(campaign.skip_recent_days));
  const [blocks, setBlocks] = useState<EmailBlock[]>(initial.blocks);
  const [selectedId, setSelectedId] = useState<string | null>(initial.blocks[0]?.id ?? null);
  const [state, sendAction] = useActionState<CampaignState, FormData>(sendCampaignNow, {});
  const [pendingSave, startSave] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const design: EmailDesign = useMemo(() => ({ blocks, accent: initial.accent }), [blocks, initial.accent]);
  const selected = blocks.find((block) => block.id === selectedId) ?? null;
  const html = useMemo(
    () =>
      renderEmailHtml(design, {
        contact_name: "Marie",
        contact_company: "Atelier Nord",
        answers_text: "usage: professionnel\nsurface: 40 m²",
        suivi_url: "#",
        org_name: name,
      }),
    [design, name],
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((current) => {
      const from = current.findIndex((block) => block.id === active.id);
      const to = current.findIndex((block) => block.id === over.id);
      if (from < 0 || to < 0) return current;
      return arrayMove(current, from, to);
    });
  }

  function addBlock(type: EmailBlockType) {
    const block = emptyBlock(type);
    setBlocks((current) => [...current, block]);
    setSelectedId(block.id);
  }

  function patchBlock(id: string, patch: Partial<EmailBlock>) {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  }

  function payload() {
    const data = new FormData();
    data.set("id", campaign.id);
    data.set("name", name);
    data.set("subject", subject);
    data.set("preview_text", preview);
    data.set("design", JSON.stringify(design));
    data.set("segment_id", segmentId);
    data.set("channel_id", channelId);
    data.set("send_mode", sendMode);
    data.set("skip_recent_days", skipDays);
    return data;
  }

  const sent = campaign.status === "sent";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <form
        id="campaign-form"
        action={sendAction}
        className="flex items-center justify-end gap-2 border-b border-slate-200 px-4 py-2 lg:px-6"
      >
        <input type="hidden" name="id" value={campaign.id} />
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="subject" value={subject} />
        <input type="hidden" name="preview_text" value={preview} />
        <input type="hidden" name="design" value={JSON.stringify(design)} />
        <input type="hidden" name="segment_id" value={segmentId} />
        <input type="hidden" name="channel_id" value={channelId} />
        <input type="hidden" name="send_mode" value={sendMode} />
        <input type="hidden" name="skip_recent_days" value={skipDays} />
        <button
          type="button"
          onClick={() => startSave(() => saveCampaign(payload()))}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
        >
          {pendingSave ? "Enregistrement…" : "Enregistrer"}
        </button>
        {sent ? (
          <span className="text-sm text-emerald-700">Envoyée</span>
        ) : (
          <button
            type="submit"
            className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]"
          >
            Envoyer à {recipientCount} contact{recipientCount > 1 ? "s" : ""}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (confirm("Supprimer cette campagne ?")) void deleteCampaign(campaign.id);
          }}
          className="text-sm text-rose-700"
        >
          Supprimer
        </button>
      </form>

      {state.error ? <p className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-700 lg:px-6">{state.error}</p> : null}
      {state.sent != null ? (
        <p className="border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 lg:px-6">
          Envoyé : {state.sent} · ignorés (déjà relancés) : {state.skipped ?? 0} · échecs : {state.failed ?? 0}
        </p>
      ) : null}

      <div className="grid min-h-0 flex-1 lg:grid-cols-[14rem_minmax(0,1fr)_18rem]">
        <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <p className="border-b border-slate-100 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            Blocs
          </p>
          <div className="flex flex-wrap gap-1.5 p-3 lg:flex-col">
            {PALETTE.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="rounded-md px-3 py-2 text-left text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-orange-50 hover:text-[#C2410C]"
              >
                {BLOCK_LABELS[type]}
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 overflow-auto bg-slate-50">
          <div className="mx-auto max-w-xl px-4 py-6">
            <label className="mb-3 block text-sm">
              <span className="text-xs font-medium text-slate-500">Objet</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {blocks.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm text-slate-500">Glissez ou ajoutez des blocs à gauche.</p>
                  ) : (
                    blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        selected={block.id === selectedId}
                        onSelect={() => setSelectedId(block.id)}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <p className="border-b border-slate-100 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Aperçu
              </p>
              <iframe title="Aperçu email" className="h-[28rem] w-full bg-white" srcDoc={html} />
            </div>
          </div>
        </div>

        <aside className="border-t border-slate-200 lg:border-l lg:border-t-0">
          <p className="border-b border-slate-100 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            Campagne
          </p>
          <div className="space-y-3 p-4">
            <label className="block text-sm">
              <span className="font-medium text-slate-900">Nom</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-900">Prévisualisation</span>
              <input value={preview} onChange={(event) => setPreview(event.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-900">Segment</span>
              <select
                value={segmentId}
                onChange={(event) => setSegmentId(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Tous les contacts</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-900">Boîte d’envoi</span>
              <select
                value={channelId}
                onChange={(event) => setChannelId(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">QuoteBuilder</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSendMode("personal")}
                className={`rounded-md px-2 py-2 text-xs font-medium ring-1 ${
                  sendMode === "personal" ? "bg-orange-50 text-[#C2410C] ring-orange-200" : "ring-slate-200"
                }`}
              >
                Personnel
              </button>
              <button
                type="button"
                onClick={() => setSendMode("group")}
                className={`rounded-md px-2 py-2 text-xs font-medium ring-1 ${
                  sendMode === "group" ? "bg-violet-50 text-violet-800 ring-violet-200" : "ring-slate-200"
                }`}
              >
                Groupe
              </button>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-slate-900">Exclure si relancé (j)</span>
              <input
                type="number"
                min={0}
                value={skipDays}
                onChange={(event) => setSkipDays(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>

          {selected ? (
            <>
              <p className="border-y border-slate-100 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Bloc · {BLOCK_LABELS[selected.type]}
              </p>
              <div className="space-y-3 p-4">
                {selected.type === "heading" ? (
                  <>
                    <Field label="Titre">
                      <input
                        value={selected.heading ?? ""}
                        onChange={(event) => patchBlock(selected.id, { heading: event.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </Field>
                    <Field label="Sous-titre">
                      <input
                        value={selected.sub ?? ""}
                        onChange={(event) => patchBlock(selected.id, { sub: event.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </Field>
                  </>
                ) : null}
                {selected.type === "text" || selected.type === "footer" ? (
                  <Field label="Texte">
                    <textarea
                      rows={5}
                      value={selected.text ?? ""}
                      onChange={(event) => patchBlock(selected.id, { text: event.target.value })}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </Field>
                ) : null}
                {selected.type === "button" ? (
                  <>
                    <Field label="Libellé">
                      <input
                        value={selected.label ?? ""}
                        onChange={(event) => patchBlock(selected.id, { label: event.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </Field>
                    <Field label="Lien" hint="{{suivi_url}} pour l’espace prospect">
                      <input
                        value={selected.href ?? ""}
                        onChange={(event) => patchBlock(selected.id, { href: event.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </Field>
                  </>
                ) : null}
                {selected.type === "image" ? (
                  <>
                    <Field label="URL de l’image">
                      <input
                        value={selected.src ?? ""}
                        onChange={(event) => patchBlock(selected.id, { src: event.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </Field>
                    <Field label="Texte alternatif">
                      <input
                        value={selected.alt ?? ""}
                        onChange={(event) => patchBlock(selected.id, { alt: event.target.value })}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                    </Field>
                  </>
                ) : null}
                {selected.type === "spacer" ? (
                  <Field label="Hauteur (px)">
                    <input
                      type="number"
                      value={selected.height ?? 24}
                      onChange={(event) => patchBlock(selected.id, { height: Number(event.target.value) })}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </Field>
                ) : null}
                {selected.type === "recap" ? (
                  <p className="text-xs text-slate-500">
                    En mode personnel, chaque destinataire voit ses réponses de funnel. En groupe, le bloc reste générique.
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setBlocks((current) => current.filter((block) => block.id !== selected.id));
                    setSelectedId(null);
                  }}
                  className="text-sm text-rose-700"
                >
                  Retirer le bloc
                </button>
                <p className="text-xs text-slate-500">
                  Variables : {"{{contact_name}}"} {"{{contact_company}}"} {"{{suivi_url}}"}
                </p>
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function SortableBlock({
  block,
  selected,
  onSelect,
}: {
  block: EmailBlock;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-2 border-b border-slate-100 px-3 py-3 ${selected ? "bg-orange-50/70" : "bg-white"}`}
    >
      <button
        type="button"
        aria-label="Réordonner"
        className="mt-0.5 flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-slate-400 hover:bg-slate-50"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{BLOCK_LABELS[block.type]}</p>
        <p className="mt-0.5 truncate text-sm text-slate-800">
          {block.heading || block.text || block.label || block.src || (block.type === "recap" ? "Récap des réponses" : "—")}
        </p>
      </button>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-900">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
