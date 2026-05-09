import Link from "next/link";
import { FolderKanban, LayoutDashboard, UsersRound } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Users",
    href: "/users",
    icon: UsersRound,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-border-soft bg-brand-navy text-white lg:block">
      <div className="border-b border-white/10 p-6">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-200">PCNS</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">{APP_NAME}</h1>
      </div>
      <nav className="grid gap-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-blue-100 transition-colors hover:bg-white/10 hover:text-white",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

