"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, LayoutDashboard, UsersRound } from "lucide-react";
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

type NavigationLinksProps = {
  variant?: "horizontal" | "vertical";
};

export function NavigationLinks({ variant = "vertical" }: NavigationLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn(variant === "horizontal" ? "flex gap-2 overflow-x-auto pb-1" : "grid gap-1")}>
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            className={cn(
              "flex items-center gap-2 rounded-md text-sm font-medium transition-colors",
              variant === "horizontal" ? "h-10 shrink-0 px-3" : "px-3 py-2",
              active
                ? "bg-white text-brand-navy shadow-sm"
                : "text-blue-100 hover:bg-white/10 hover:text-white",
              variant === "horizontal" &&
                (active
                  ? "border border-border-soft bg-white text-brand-navy"
                  : "border border-white/20 bg-white/[0.08] text-white hover:bg-white/15"),
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
  );
}
