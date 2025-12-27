import React from 'react';
import { useStores, useStoreData } from '../../contexts/StoreContext';
import { Briefcase, Plus, BarChart2, Music, Settings } from 'lucide-react';
import clsx from 'clsx';

export function Sidebar() {
  const { workspaceStore, setActivePanel } = useStores();
  const { workspaces, activeId } = useStoreData(workspaceStore);

  return (
    <aside className="border-r border-theme bg-bg-panel flex flex-col h-full transition-colors duration-500">
      {/* Brand */}
      <div className="p-6 pb-2">
        <div className="text-text-gold font-bold tracking-[4px] text-xs flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-text-gold animate-pulse"></div>
          HUSH
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2 mb-3">Workspaces</div>

        {workspaces.map(ws => (
          <div
            key={ws.id}
            onClick={() => workspaceStore.setActive(ws.id)}
            className={clsx(
              "group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200",
              activeId === ws.id
                ? "bg-text-main/5 text-text-main font-medium shadow-sm"
                : "text-text-muted hover:text-text-main hover:bg-text-main/5"
            )}
          >
            <Briefcase size={14} className={clsx("transition-colors", activeId === ws.id ? "text-text-gold" : "text-text-muted group-hover:text-text-main")} />
            <span className="text-sm">{ws.name}</span>
          </div>
        ))}

        <div
          onClick={() => workspaceStore.create('New Space', '🚀')}
          className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-text-gold cursor-pointer transition-colors mt-4 opacity-70 hover:opacity-100"
        >
          <Plus size={14} />
          <span className="text-sm">New Workspace</span>
        </div>
      </nav>

      {/* Footer Tools */}
      <div className="p-4 border-t border-theme space-y-1">
        <div onClick={() => setActivePanel('stats')} className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-text-main cursor-pointer rounded hover:bg-text-main/5 transition-colors">
          <BarChart2 size={16} />
          <span className="text-sm">Stats</span>
        </div>
        <div onClick={() => setActivePanel('audio')} className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-text-main cursor-pointer rounded hover:bg-text-main/5 transition-colors">
          <Music size={16} />
          <span className="text-sm">Audio</span>
        </div>
        <div onClick={() => setActivePanel('settings')} className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-text-main cursor-pointer rounded hover:bg-text-main/5 transition-colors">
          <Settings size={16} />
          <span className="text-sm">Settings</span>
        </div>
      </div>
    </aside>
  );
}
