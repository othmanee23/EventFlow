import { Bell, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/constants";
import type { User } from "@/types/user";

type HeaderProps = {
  title: string;
  user: User;
};

export function Header({ title, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border-soft bg-white/95 backdrop-blur">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-sm font-medium text-brand-blue">Events department</p>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-10 items-center gap-2 rounded-md border border-border-soft bg-white px-3 text-sm text-slate-500 md:flex">
            <Search aria-hidden="true" className="h-4 w-4" />
            Search
          </div>
          <button
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border-soft text-slate-500 hover:bg-slate-50"
            type="button"
          >
            <Bell aria-hidden="true" className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 rounded-md border border-border-soft bg-white px-3 py-2">
            <Avatar name={user.name} />
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-slate-950">{user.name}</p>
              <Badge>{ROLES[user.role]}</Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
