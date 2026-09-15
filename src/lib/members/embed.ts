const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

export function sanitizeHttpsUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function memberImageSrc(raw: string): string | null {
  return sanitizeHttpsUrl(raw);
}

export function memberVideoEmbed(raw: string): { mode: "iframe" | "video"; src: string } | null {
  const href = sanitizeHttpsUrl(raw);
  if (!href) return null;
  const url = new URL(href);
  const host = url.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.has(host)) {
    const fromPath = url.pathname.match(/\/(?:embed|shorts)\/([\w-]{6,})/);
    const id =
      host === "youtu.be" || host === "www.youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : (url.searchParams.get("v") ?? fromPath?.[1]);
    if (!id || !/^[\w-]{6,}$/.test(id)) return null;
    return { mode: "iframe", src: `https://www.youtube.com/embed/${id}` };
  }

  if (VIMEO_HOSTS.has(host)) {
    const id =
      host === "player.vimeo.com"
        ? url.pathname.match(/\/video\/(\d+)/)?.[1]
        : url.pathname.split("/").filter(Boolean)[0];
    if (!id || !/^\d+$/.test(id)) return null;
    return { mode: "iframe", src: `https://player.vimeo.com/video/${id}` };
  }

  if (url.pathname.toLowerCase().endsWith(".mp4")) {
    return { mode: "video", src: href };
  }
  return null;
}
