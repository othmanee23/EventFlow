import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed border-border-soft bg-white p-8 text-center">
      <Inbox aria-hidden="true" className="mb-3 h-8 w-8 text-slate-400" />
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

