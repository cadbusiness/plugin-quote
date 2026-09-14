export function plainShopChatText(value: string) {
  return value
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1")
    .replace(/^\s*\*\s+/gm, "")
    .replace(/\*/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type ShopChatMessage = {
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
  image?: string;
  steps?: { name: string; label: string; status: "run" | "ok" | "error"; summary?: string }[];
};

const KEY = (shopId: string) => `qb-shop-chat:${shopId}`;

export function parseChatLog(raw: unknown): ShopChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      role: item.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content:
        typeof item.content === "string"
          ? item.role === "assistant"
            ? plainShopChatText(item.content)
            : item.content
          : "",
      hidden: item.hidden === true || undefined,
      image: typeof item.image === "string" ? item.image : undefined,
    }))
    .filter((item) => item.content || item.image)
    .slice(-24);
}

export function historyForAgent(messages: ShopChatMessage[]) {
  return messages
    .filter((item) => !item.hidden && item.content.trim())
    .slice(-24)
    .map((item) => ({ role: item.role, content: item.content }));
}

export function loadShopChatLocal(shopId: string): ShopChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    return parseChatLog(JSON.parse(window.localStorage.getItem(KEY(shopId)) ?? "[]"));
  } catch {
    return [];
  }
}

export function saveShopChatLocal(shopId: string, messages: ShopChatMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY(shopId), JSON.stringify(parseChatLog(messages)));
}

export function mergeShopChat(local: ShopChatMessage[], server: ShopChatMessage[]) {
  if (local.length >= server.length) return local;
  return server;
}
