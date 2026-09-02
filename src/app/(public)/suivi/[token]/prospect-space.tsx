"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Tables } from "@/lib/db/database.types";

type Bundle = {
  quote: Tables<"quotes">;
  items: Tables<"quote_items">[];
  files: Tables<"quote_files">[];
  statuses: Tables<"quote_statuses">[];
  messages: Tables<"prospect_messages">[];
};

const PIPELINE = ["Reçu", "En étude", "Devis envoyé", "Accepté"];

function stageIndex(status: Tables<"quote_statuses"> | undefined) {
  const slug = status?.slug ?? "new";
  if (slug === "won") return 3;
  if (slug === "in_progress" || slug === "waiting") return 2;
  if (slug === "contacted") return 1;
  return 0;
}

export function ProspectSpace({ token, bundle }: { token: string; bundle: Bundle }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const status = bundle.statuses.find((s) => s.id === bundle.quote.status_id);
  const stage = stageIndex(status);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    await fetch(`/api/public/suivi/${token}/message`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
    setMessage("");
    router.refresh();
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("note", note);
    await fetch(`/api/public/suivi/${token}/upload`, { method: "POST", body: form });
    setNote("");
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-6 py-10">
      <p className="text-xs uppercase tracking-wide text-slate-400">Votre demande</p>
      <h1 className="mt-1 text-2xl font-semibold">{bundle.quote.contact_name}</h1>
      <p className="text-sm text-slate-500">{bundle.quote.contact_company || bundle.quote.contact_email}</p>

      <div className="mt-8 grid grid-cols-4 gap-2">
        {PIPELINE.map((label, i) => (
          <div key={label}>
            <div className={`h-1.5 rounded-full ${i <= stage ? "bg-slate-950" : "bg-slate-200"}`} />
            <p className={`mt-2 text-xs ${i <= stage ? "font-medium text-slate-900" : "text-slate-400"}`}>{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Votre configuration</h2>
        <ul className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
          {bundle.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2.5 text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="text-slate-500">
                {item.price_min ?? "—"} – {item.price_max ?? "—"} €
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Compléter la demande</h2>
        <p className="mt-1 text-sm text-slate-500">Photo, plan, mesures oubliées.</p>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optionnel)"
          className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
        <input type="file" onChange={upload} className="mt-2 text-sm" />
        <ul className="mt-3 text-sm text-slate-600">
          {bundle.files.map((file) => (
            <li key={file.id}>{file.file_name}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Messages</h2>
        <div className="mt-3 space-y-2">
          {bundle.messages.map((m) => (
            <p
              key={m.id}
              className={`rounded-xl px-3 py-2 text-sm ${
                m.sender === "prospect" ? "bg-slate-950 text-white" : "bg-slate-100"
              }`}
            >
              {m.content}
            </p>
          ))}
        </div>
        <form onSubmit={sendMessage} className="mt-3 flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Écrire à l’équipe…"
          />
          <button className="rounded-md bg-slate-950 px-3 py-2 text-sm text-white">Envoyer</button>
        </form>
      </section>
    </div>
  );
}
