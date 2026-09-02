import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getSession } from "@/lib/public/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.headers.get("x-session-token")?.trim() ?? "";
  const session = await getSession(id, token);
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux (10 Mo max)" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: row } = await supabase
    .from("quote_sessions")
    .select("organization_id")
    .eq("id", id)
    .single();

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${row!.organization_id}/${id}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("quote-uploads").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: record, error } = await supabase
    .from("quote_files")
    .insert({
      organization_id: row!.organization_id,
      session_id: id,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type || null,
    })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ file: record });
}
