import { createServiceClient } from "@/lib/supabase/service";

const BUCKET = "member-docs";
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
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.id === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: TYPES,
    });
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${orgId}/${spaceId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
