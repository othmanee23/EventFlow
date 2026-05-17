import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/types/checklist";

type ChecklistSectionProps = {
  items: ChecklistItem[];
  onToggle?: (item: ChecklistItem, completed: boolean) => void;
};

export function ChecklistSection({ items, onToggle }: ChecklistSectionProps) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No checklist items.</p>;
  }

  return (
    <section className="grid gap-3">
      {items.map((item) => {
        const Icon = item.completed ? CheckCircle2 : Circle;

        return (
          <label
            className="flex items-center gap-3 rounded-md border border-border-soft px-3 py-2 text-sm text-slate-700"
            key={item.id}
          >
            {onToggle ? (
              <input
                checked={item.completed}
                className="h-4 w-4 rounded border-border-soft text-brand-blue"
                onChange={(event) => onToggle(item, event.target.checked)}
                type="checkbox"
              />
            ) : (
              <Icon aria-hidden="true" className="h-4 w-4 text-brand-blue" />
            )}
            <span className={cn(item.completed && "text-slate-400 line-through")}>{item.label}</span>
          </label>
        );
      })}
    </section>
  );
}
