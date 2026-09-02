import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { loadProspectByToken } from "@/lib/prospect/access";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bundle = await loadProspectByToken(token);
  if (!bundle) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 400 });
  }
  const supabase = createServiceClient();
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${bundle.quote.organization_id}/${bundle.quote.id}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("quote-uploads")
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
    });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });
  await supabase.from("quote_files").insert({
    organization_id: bundle.quote.organization_id,
    quote_id: bundle.quote.id,
    storage_path: path,
    file_name: file.name,
    mime_type: file.type || null,
  });
  return NextResponse.json({ ok: true });
}
