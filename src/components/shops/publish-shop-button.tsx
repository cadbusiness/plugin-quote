"use client";

import { useFormStatus } from "react-dom";
import { publishShop } from "@/app/(app)/integrations/shop-actions";

export function PublishShopButton({ id, status }: { id: string; status: string }) {
  const published = status === "published";
  return (
    <form action={publishShop}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={published ? "draft" : "published"} />
      <Submit published={published} />
    </form>
  );
}

function Submit({ published }: { published: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400] disabled:opacity-50"
    >
      {pending ? "Mise à jour…" : published ? "Dépublier" : "Mettre en ligne"}
    </button>
  );
}
