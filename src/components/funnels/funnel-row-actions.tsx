"use client";

import { useState, useTransition } from "react";
import { Archive, ArchiveRestore, Check, Eye, Link2, Trash2 } from "lucide-react";
import { deleteFunnel, setFunnelActive } from "@/app/(app)/funnels/actions";

export function FunnelRowActions({
  funnelId,
  name,
  publicUrl,
  isActive,
  showArchive = true,
  showPreview = true,
  previewHref,
}: {
  funnelId: string;
  name: string;
  publicUrl: string;
  isActive: boolean;
  showArchive?: boolean;
  showPreview?: boolean;
  previewHref?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function archive() {
    startTransition(() => {
      void setFunnelActive(funnelId, !isActive);
    });
  }

  function remove() {
    if (!confirm(`Supprimer « ${name} » ? Les étapes et le catalogue lié seront perdus.`)) return;
    startTransition(async () => {
      const result = await deleteFunnel(funnelId);
      if (result?.reason === "quotes") {
        window.alert(
          `« ${name} » a déjà ${result.count} demande${result.count > 1 ? "s" : ""}. Archivez-le pour les garder.`,
        );
      }
    });
  }

  return (
    <div className="relative z-10 flex items-center justify-end gap-0.5">
      {showPreview ? (
        <a
          href={previewHref ?? publicUrl}
          target="_blank"
          rel="noreferrer"
          title="Prévisualiser"
          aria-label={`Prévisualiser ${name}`}
          className={iconClass}
        >
          <Eye className="h-4 w-4" aria-hidden />
        </a>
      ) : null}
      <button
        type="button"
        title={copied ? "Lien copié" : "Copier le lien"}
        aria-label={copied ? "Lien copié" : `Copier le lien de ${name}`}
        onClick={() => void copyLink()}
        className={iconClass}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
      </button>
      {showArchive ? (
        <button
          type="button"
          title={isActive ? "Archiver" : "Restaurer"}
          aria-label={isActive ? `Archiver ${name}` : `Restaurer ${name}`}
          aria-pressed={!isActive}
          disabled={pending}
          onClick={archive}
          className={iconClass}
        >
          {isActive ? (
            <Archive className="h-4 w-4" aria-hidden />
          ) : (
            <ArchiveRestore className="h-4 w-4" aria-hidden />
          )}
        </button>
      ) : null}
      <button
        type="button"
        title="Supprimer"
        aria-label={`Supprimer ${name}`}
        disabled={pending}
        onClick={remove}
        className={`${iconClass} hover:bg-rose-50 hover:text-rose-700`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

const iconClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50";
