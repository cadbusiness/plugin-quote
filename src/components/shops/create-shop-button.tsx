"use client";

export function CreateShopButton({
  className = "rounded-md bg-[#E85D04] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d35400]",
}: {
  className?: string;
}) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("qb:create-shop"))} className={className}>
      Créer une boutique
    </button>
  );
}
