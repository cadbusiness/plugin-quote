import { createServiceClient } from "@/lib/supabase/service";

const BUCKET = "catalog-images";
const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadCatalogImage(orgId: string, productId: string, file: File) {
  if (!TYPES.includes(file.type) && !file.type.startsWith("image/")) {
    throw new Error("Envoyez une image (JPG, PNG ou WebP).");
  }
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (8 Mo max).");

  const supabase = createServiceClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.id === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: TYPES,
    });
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${orgId}/${productId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
