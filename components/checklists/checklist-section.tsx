import { CheckCircle2, Circle } from "lucide-react";
import type { ChecklistItem } from "@/types/checklist";

type ChecklistSectionProps = {
  items: ChecklistItem[];
};

export function ChecklistSection({ items }: ChecklistSectionProps) {
  return (
    <section className="grid gap-3">
      {items.map((item) => {
        const Icon = item.completed ? CheckCircle2 : Circle;

        return (
          <div className="flex items-center gap-3 text-sm text-slate-700" key={item.id}>
            <Icon aria-hidden="true" className="h-4 w-4 text-brand-blue" />
            {item.label}
          </div>
        );
      })}
    </section>
  );
}

