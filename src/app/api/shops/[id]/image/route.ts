import { NextResponse } from "next/server";
import { getOrgContext, isAdminRole } from "@/lib/auth/org";
import { uploadCatalogImage } from "@/lib/catalog/upload";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getOrgContext();
  if (!ctx || !isAdminRole(ctx.role)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Image manquante" }, { status: 400 });
  try {
    const url = await uploadCatalogImage(ctx.organization.id, `shop-${id}`, file);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload impossible" }, { status: 400 });
  }
}
