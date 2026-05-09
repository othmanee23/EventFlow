export function LoadingState() {
  return (
    <div className="grid gap-3 rounded-md border border-border-soft bg-white p-5">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

