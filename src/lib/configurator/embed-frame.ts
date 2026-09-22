/** Height of the WordPress / widget iframe. Mobile uses the visual viewport so a 720px shortcode does not push the chat below the fold. */
export const EMBED_MOBILE_MAX_WIDTH = 640;
export const EMBED_DEFAULT_HEIGHT = "720px";
export const EMBED_MOBILE_HEIGHT = "calc(100svh - 4.5rem)";
export const EMBED_MOBILE_MIN_HEIGHT = "28rem";

export function embedFrameBox(
  dataHeight: string | null | undefined,
  viewportWidth: number,
): { height: string; minHeight: string } {
  const requested = (dataHeight ?? "").trim() || EMBED_DEFAULT_HEIGHT;
  if (viewportWidth > 0 && viewportWidth <= EMBED_MOBILE_MAX_WIDTH) {
    return { height: EMBED_MOBILE_HEIGHT, minHeight: EMBED_MOBILE_MIN_HEIGHT };
  }
  return { height: requested, minHeight: requested };
}
