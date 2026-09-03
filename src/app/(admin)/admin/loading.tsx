import { ListPanel, ListToolbar } from "@/components/ui/list-panel";

export default function AdminLoading() {
  return (
    <ListPanel>
      <ListToolbar>
        <div className="h-8 w-32 animate-pulse rounded-md bg-slate-100" />
      </ListToolbar>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 lg:px-6">
            <div className="h-4 w-44 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </ListPanel>
  );
}
