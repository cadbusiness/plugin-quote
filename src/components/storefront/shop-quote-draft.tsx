"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  parseShopQuoteDraft,
  readShopQuoteDraft,
  removeShopQuoteLine,
  setShopQuoteLineQty,
  shopQuoteDraftKey,
  shopQuoteItemCount,
  upsertShopQuoteLine,
  writeShopQuoteDraft,
  type ShopQuoteLine,
} from "@/lib/shops/quote-draft";

type ShopQuoteDraftApi = {
  ready: boolean;
  lines: ShopQuoteLine[];
  count: number;
  has: (id: string) => boolean;
  line: (id: string) => ShopQuoteLine | undefined;
  add: (input: { id: string; qty?: number; name?: string; sku?: string | null }) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const ShopQuoteDraftContext = createContext<ShopQuoteDraftApi | null>(null);

export function ShopQuoteDraftProvider({
  orgSlug,
  shopSlug,
  children,
}: {
  orgSlug: string;
  shopSlug: string;
  children: ReactNode;
}) {
  const [lines, setLines] = useState<ShopQuoteLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readShopQuoteDraft(orgSlug, shopSlug));
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === shopQuoteDraftKey(orgSlug, shopSlug)) {
        setLines(parseShopQuoteDraft(event.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [orgSlug, shopSlug]);

  const commit = useCallback(
    (next: ShopQuoteLine[]) => {
      setLines(next);
      writeShopQuoteDraft(orgSlug, shopSlug, next);
    },
    [orgSlug, shopSlug],
  );

  const value = useMemo<ShopQuoteDraftApi>(
    () => ({
      ready,
      lines,
      count: shopQuoteItemCount(lines),
      has: (id) => lines.some((line) => line.id === id),
      line: (id) => lines.find((item) => item.id === id),
      add: (input) => commit(upsertShopQuoteLine(lines, input)),
      setQty: (id, qty) => commit(setShopQuoteLineQty(lines, id, qty)),
      remove: (id) => commit(removeShopQuoteLine(lines, id)),
      clear: () => commit([]),
    }),
    [commit, lines, ready],
  );

  return <ShopQuoteDraftContext.Provider value={value}>{children}</ShopQuoteDraftContext.Provider>;
}

export function useShopQuoteDraft() {
  const ctx = useContext(ShopQuoteDraftContext);
  if (!ctx) throw new Error("useShopQuoteDraft must be used in ShopQuoteDraftProvider");
  return ctx;
}

export function useShopQuoteDraftOptional() {
  return useContext(ShopQuoteDraftContext);
}
