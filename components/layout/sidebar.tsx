import { NavigationLinks } from "@/components/layout/navigation-links";
import { APP_NAME } from "@/lib/constants";

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-border-soft bg-brand-navy text-white lg:block">
      <div className="border-b border-white/10 p-6">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-200">PCNS</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">{APP_NAME}</h1>
      </div>
      <div className="p-4">
        <NavigationLinks />
      </div>
    </aside>
  );
}
