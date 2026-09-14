"use client";

import { useState, useTransition } from "react";
import { Archive, ArchiveRestore, Check, Eye, Link2, Trash2 } from "lucide-react";
import { deleteConnection, toggleConnection } from "@/app/(app)/integrations/actions";

export function ConnectionRowActions({
  connectionId,
  name,
  storeUrl,
  enabled,
}: {
  connectionId: string;
  name: string;
  storeUrl: string;
  enabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="relative z-10 flex items-center justify-end gap-0.5">
      {storeUrl ? (
        <a
          href={storeUrl}
          target="_blank"
          rel="noreferrer"
          title="Ouvrir la boutique"
          aria-label={`Ouvrir ${name}`}
          className={iconClass}
        >
          <Eye className="h-4 w-4" aria-hidden />
        </a>
      ) : null}
      {storeUrl ? (
        <button
          type="button"
          title={copied ? "Lien copié" : "Copier le lien"}
          aria-label={copied ? "Lien copié" : `Copier le lien de ${name}`}
          onClick={() => void copyLink()}
          className={iconClass}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
        </button>
      ) : null}
      <button
        type="button"
        title={enabled ? "Mettre en pause" : "Réactiver"}
        aria-label={enabled ? `Mettre ${name} en pause` : `Réactiver ${name}`}
        aria-pressed={!enabled}
        disabled={pending}
        onClick={() => startTransition(() => void toggleConnection(connectionId, !enabled))}
        className={iconClass}
      >
        {enabled ? <Archive className="h-4 w-4" aria-hidden /> : <ArchiveRestore className="h-4 w-4" aria-hidden />}
      </button>
      <button
        type="button"
        title="Supprimer"
        aria-label={`Supprimer ${name}`}
        disabled={pending}
        onClick={() => {
          if (!confirm(`Déconnecter « ${name} » ? Les produits importés resteront, désactivés.`)) return;
          startTransition(() => void deleteConnection(connectionId));
        }}
        className={`${iconClass} hover:bg-rose-50 hover:text-rose-700`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

const iconClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50";
