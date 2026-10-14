export const MEMBER_DOCS_BUCKET = "member-docs";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const STORAGE_PATH = new RegExp(`^${UUID}/${UUID}/[^/]+$`, "i");

function isSafeStoragePath(path: string) {
  if (!STORAGE_PATH.test(path)) return false;
  const name = path.split("/")[2] ?? "";
  return name !== "." && name !== ".." && !name.includes("\\") && !name.includes("%");
}

/** Storage object key from a stored path or a legacy public/signed member-docs URL. */
export function memberDocStoragePath(href: string): string | null {
  const raw = href.trim();
  if (!raw || raw.includes("..") || raw.includes("\\")) return null;
  if (isSafeStoragePath(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const pathname = decodeURIComponent(url.pathname);
  const markers = [
    `/storage/v1/object/public/${MEMBER_DOCS_BUCKET}/`,
    `/storage/v1/object/sign/${MEMBER_DOCS_BUCKET}/`,
    `/storage/v1/object/authenticated/${MEMBER_DOCS_BUCKET}/`,
  ];
  for (const marker of markers) {
    const index = pathname.indexOf(marker);
    if (index === -1) continue;
    const path = pathname.slice(index + marker.length);
    if (isSafeStoragePath(path)) return path;
  }
  return null;
}

export function memberDocBelongsToSpace(path: string, organizationId: string, spaceId: string) {
  const storagePath = memberDocStoragePath(path);
  if (!storagePath) return false;
  const [orgId, storedSpaceId] = storagePath.split("/");
  return orgId === organizationId && storedSpaceId === spaceId;
}

export function memberDocDownloadHref(orgSlug: string, spaceSlug: string, storagePath: string) {
  const params = new URLSearchParams({ path: storagePath });
  return `/api/public/membres/${encodeURIComponent(orgSlug)}/${encodeURIComponent(spaceSlug)}/doc?${params.toString()}`;
}

/** External links stay. Member-doc paths and legacy public URLs become the gated route. */
export function memberResourceHref(orgSlug: string, spaceSlug: string, href: string) {
  const path = memberDocStoragePath(href);
  if (!path) return href;
  return memberDocDownloadHref(orgSlug, spaceSlug, path);
}
