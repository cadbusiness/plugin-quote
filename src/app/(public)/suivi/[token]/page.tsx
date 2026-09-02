import { notFound } from "next/navigation";
import { loadProspectByToken } from "@/lib/prospect/access";
import { ProspectSpace } from "./prospect-space";

export default async function SuiviPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bundle = await loadProspectByToken(token);
  if (!bundle) notFound();
  return <ProspectSpace token={token} bundle={bundle} />;
}
