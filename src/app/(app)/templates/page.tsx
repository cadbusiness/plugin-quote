import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/org";
import { ListPanel, ListToolbar } from "@/components/ui/list-panel";
import { saveEmailTemplate, savePdfTemplate } from "@/app/(app)/actions";

export default async function TemplatesPage() {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");
  const supabase = await createClient();
  const { data: emails } = await supabase
    .from("email_templates")
    .select("*")
    .eq("organization_id", ctx.organization.id);
  const { data: pdfs } = await supabase
    .from("pdf_templates")
    .select("*")
    .eq("organization_id", ctx.organization.id);

  return (
    <ListPanel>
      <ListToolbar />
      <div className="space-y-8 px-4 py-6 lg:px-6">
        {(emails ?? []).map((tpl) => (
          <form key={tpl.id} action={saveEmailTemplate} className="space-y-3">
            <input type="hidden" name="id" value={tpl.id} />
            <h2 className="font-semibold">Email · {tpl.kind}</h2>
            <input name="subject" defaultValue={tpl.subject} className="w-full border border-slate-200 px-3 py-2" />
            <textarea
              name="body"
              defaultValue={tpl.body}
              rows={8}
              className="w-full border border-slate-200 px-3 py-2 font-mono text-sm"
            />
            <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Enregistrer</button>
          </form>
        ))}
        {(pdfs ?? []).map((tpl) => (
          <form key={tpl.id} action={savePdfTemplate} className="space-y-3">
            <input type="hidden" name="id" value={tpl.id} />
            <h2 className="font-semibold">PDF</h2>
            <input name="title" defaultValue={tpl.title} className="w-full border border-slate-200 px-3 py-2" />
            <textarea name="intro" defaultValue={tpl.intro ?? ""} rows={4} className="w-full border border-slate-200 px-3 py-2" />
            <input name="footer" defaultValue={tpl.footer ?? ""} className="w-full border border-slate-200 px-3 py-2" />
            <button className="rounded-md bg-slate-950 px-3 py-1.5 text-sm text-white">Enregistrer</button>
          </form>
        ))}
      </div>
    </ListPanel>
  );
}
