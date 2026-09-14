"use client";

import { useState, useTransition } from "react";
import { Archive, ArchiveRestore, Check, Eye, Link2, Trash2 } from "lucide-react";
import { removeShop, setShopArchived } from "@/app/(app)/integrations/shop-actions";

export function ShopRowActions({
  shopId,
  name,
  publicUrl,
  previewHref,
  archived,
}: {
  shopId: string;
  name: string;
  publicUrl: string;
  previewHref?: string;
  archived: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="relative z-10 flex items-center justify-end gap-0.5">
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
      <button
        type="button"
        title={copied ? "Lien copié" : "Copier le lien"}
        aria-label={copied ? "Lien copié" : `Copier le lien de ${name}`}
        onClick={() => void copyLink()}
        className={iconClass}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
      </button>
      <button
        type="button"
        title={archived ? "Restaurer" : "Archiver"}
        aria-label={archived ? `Restaurer ${name}` : `Archiver ${name}`}
        aria-pressed={archived}
        disabled={pending}
        onClick={() => startTransition(() => void setShopArchived(shopId))}
        className={iconClass}
      >
        {archived ? <ArchiveRestore className="h-4 w-4" aria-hidden /> : <Archive className="h-4 w-4" aria-hidden />}
      </button>
      <button
        type="button"
        title="Supprimer"
        aria-label={`Supprimer ${name}`}
        disabled={pending}
        onClick={() => {
          if (!confirm(`Supprimer « ${name} » ? La vitrine et ses pages seront perdues.`)) return;
          startTransition(() => void removeShop(shopId));
        }}
        className={`${iconClass} hover:bg-rose-50 hover:text-rose-700`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

const iconClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-800 disabled:opacity-50";
