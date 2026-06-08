import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TASK_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { UpcomingDeadline } from "@/features/dashboard/dashboard-types";

type UpcomingDeadlinesProps = {
  deadlines: UpcomingDeadline[];
};

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-950">Upcoming deadlines</h2>
        <p className="text-sm text-slate-500">Open event preparation tasks ordered by due date.</p>
      </div>
      {deadlines.length > 0 ? (
        <Card>
          <CardHeader className="border-b border-border-soft">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock aria-hidden="true" className="h-5 w-5 text-brand-blue" />
              Deadline queue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border-soft">
              {deadlines.map((deadline) => (
                <article className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center" key={deadline.id}>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge>{TASK_CATEGORIES[deadline.category]}</Badge>
                      <span className="text-xs font-medium text-slate-500">{formatDate(deadline.dueDate)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-950">{deadline.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {deadline.projectName} · {deadline.assigneeNames}
                    </p>
                  </div>
                  <Link
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue"
                    href={`/projects/${deadline.projectId}`}
                  >
                    Open board
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="No open deadlines" description="Open task deadlines will appear here as projects are planned." />
      )}
    </section>
  );
}
