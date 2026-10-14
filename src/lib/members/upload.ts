import { MEMBER_DOCS_BUCKET, memberDocStoragePath } from "@/lib/members/docs";
import { createServiceClient } from "@/lib/supabase/service";

const BUCKET = MEMBER_DOCS_BUCKET;
const MAX_BYTES = 12 * 1024 * 1024;
const TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

let memberDocsPrivate = false;

/**
 * New buckets are created private. An existing public bucket is flipped once per process.
 * The read path does not create the bucket; migration 0069 is the guaranteed close in prod.
 */
export async function ensureMemberDocsPrivate(
  supabase: ReturnType<typeof createServiceClient>,
  options?: { create?: boolean },
) {
  if (memberDocsPrivate) return;
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw new Error(listError.message);
  const existing = buckets?.find((bucket) => bucket.id === BUCKET);
  if (!existing) {
    if (!options?.create) return;
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: TYPES,
    });
    if (error) throw new Error(error.message);
    memberDocsPrivate = true;
    return;
  }
  if (existing.public) {
    const { error } = await supabase.storage.updateBucket(BUCKET, { public: false });
    if (error) throw new Error(error.message);
  }
  memberDocsPrivate = true;
}

function allowedFile(file: File) {
  if (TYPES.includes(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return Boolean(ext && ["pdf", "jpg", "jpeg", "png", "webp", "gif", "txt", "doc", "docx"].includes(ext));
}

export async function uploadMemberDoc(orgId: string, spaceId: string, file: File) {
  if (!allowedFile(file)) {
    throw new Error("Envoyez un PDF, une image ou un document Word.");
  }
  if (file.size > MAX_BYTES) throw new Error("Fichier trop lourd (12 Mo max).");

  const supabase = createServiceClient();
  await ensureMemberDocsPrivate(supabase, { create: true });

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${orgId}/${spaceId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function deleteMemberDocPaths(paths: string[]) {
  const unique = [
    ...new Set(paths.map((path) => memberDocStoragePath(path)).filter((path): path is string => Boolean(path))),
  ];
  if (!unique.length) return;
  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(BUCKET).remove(unique);
  if (error) throw new Error(error.message);
}

export async function deleteMemberSpaceFiles(orgId: string, spaceId: string) {
  const supabase = createServiceClient();
  const folder = `${orgId}/${spaceId}`;
  const paths: string[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 100, offset });
    if (error || !data?.length) break;
    for (const file of data) {
      if (!file.id || !file.name || file.name.includes("/") || file.name === "." || file.name === "..") continue;
      paths.push(`${folder}/${file.name}`);
    }
    if (data.length < 100) break;
    offset += data.length;
  }
  if (!paths.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw new Error(error.message);
}
