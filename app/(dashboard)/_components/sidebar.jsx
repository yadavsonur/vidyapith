import { Logo } from "./logo";
import { SidebarRoutes } from "./sidebar-routes";

export const Sidebar = ({ role }) => {
  return (
    <aside className="h-full border-r border-ink-200/80 flex flex-col bg-parchment-25 shadow-subtle select-none">
      <div className="p-5 border-b border-ink-100">
        <Logo />
      </div>

      <div className="flex-1 px-3 py-4 flex flex-col overflow-y-auto space-y-4">
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-ink-400">
            Navigation
          </div>
          <div className="flex flex-col w-full">
            <SidebarRoutes role={role} />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-ink-100/80 bg-parchment-50/50">
        <div className="rounded-md border border-ink-200/60 bg-white/70 p-3 text-xs text-ink-600">
          <div className="flex items-center gap-1.5 font-medium text-ink-800">
            <span className="h-2 w-2 rounded-full bg-sage-500 animate-pulse" />
            <span>Vidhyapith v0.1</span>
          </div>
          <p className="text-[11px] text-ink-400 mt-1">
            Curated scholarly curriculum & peer-reviewed cohorts.
          </p>
        </div>
      </div>
    </aside>
  );
};
