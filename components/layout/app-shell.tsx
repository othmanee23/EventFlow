import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import type { User } from "@/types/user";

type AppShellProps = {
  children: ReactNode;
  title: string;
  user: User;
};

export function AppShell({ children, title, user }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header title={title} user={user} />
          <main className="px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
