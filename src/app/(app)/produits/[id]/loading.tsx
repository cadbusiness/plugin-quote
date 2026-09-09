export default function ProductLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy aria-live="polite">
      <div className="h-12 border-b border-slate-100 bg-white" />
      <div className="grid gap-6 px-4 py-5 lg:grid-cols-[16rem_minmax(0,32rem)] lg:px-6">
        <div className="aspect-square max-w-[16rem] rounded-lg bg-slate-100" />
        <div className="space-y-3">
          <div className="h-9 rounded-md bg-slate-100" />
          <div className="h-9 rounded-md bg-slate-100" />
          <div className="h-9 rounded-md bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
