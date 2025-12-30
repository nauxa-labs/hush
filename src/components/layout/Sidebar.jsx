import { Briefcase, Plus, BarChart2, Music, Settings, Check, X, Trash2 } from 'lucide-react';
// ... (lines 4-38 same)
<aside className="border-r border-theme bg-bg-panel flex flex-col h-full transition-colors duration-500">
  {/* ... (lines 41-56 same) */}
  <div className="space-y-1">
    {workspaces.map(ws => (
      <div
        key={ws.id}
        onClick={() => {
          if (editingId !== ws.id) {
            workspaceStore.setActive(ws.id);
            onMobileClose?.();
          }
        }}
        onDoubleClick={() => handleStartEdit(ws)}
        className={clsx(
          "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 relative pr-8",
          activeId === ws.id
            ? "bg-text-main/5 text-text-main font-medium"
            : "text-text-muted hover:text-text-main hover:bg-text-main/3"
        )}
      >
        <Briefcase size={14} className={clsx("transition-colors shrink-0", activeId === ws.id ? "text-text-gold" : "text-text-muted group-hover:text-text-main")} />

        {editingId === ws.id ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveEdit}
              autoFocus
              className="flex-1 bg-transparent border-b border-text-gold outline-none text-sm px-1"
            />
          </div>
        ) : (
          <>
            <span className="text-sm truncate flex-1" title="Double-click to rename">{ws.name}</span>

            {/* Delete Button - Only show if more than 1 workspace */}
            {workspaces.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to delete workspace "${ws.name}"?`)) {
                    workspaceStore.delete(ws.id);
                  }
                }}
                className="absolute right-2 p-1.5 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded"
                title="Delete Workspace"
              >
                <Trash2 size={13} />
              </button>
            )}
          </>
        )}
      </div>
      </div>

  <div
    onClick={() => workspaceStore.create('New Space', '🚀')}
    className="flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-text-gold cursor-pointer transition-colors mt-6 opacity-60 hover:opacity-100"
  >
    <Plus size={14} />
    <span className="text-sm">New Workspace</span>
  </div>
</nav>

{/* Footer Tools */ }
<div className="px-5 py-5 border-t border-theme space-y-0.5">
  <div onClick={() => { setActivePanel('stats'); onMobileClose?.(); }} className="flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-text-main cursor-pointer rounded-lg hover:bg-text-main/3 transition-colors">
    <BarChart2 size={15} />
    <span className="text-sm">Stats</span>
  </div>
  <div onClick={() => { setActivePanel('audio'); onMobileClose?.(); }} className="flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-text-main cursor-pointer rounded-lg hover:bg-text-main/3 transition-colors">
    <Music size={15} />
    <span className="text-sm">Audio</span>
  </div>
  <div onClick={() => { setActivePanel('settings'); onMobileClose?.(); }} className="flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-text-main cursor-pointer rounded-lg hover:bg-text-main/3 transition-colors">
    <Settings size={15} />
    <span className="text-sm">Settings</span>
  </div>
</div>
    </aside >
  );
}
