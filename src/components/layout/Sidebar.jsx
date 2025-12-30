import React, { useState } from 'react';
import { useStores, useStoreData } from '../../contexts/StoreContext';
import { Briefcase, Plus, BarChart2, Music, Settings, Check, X } from 'lucide-react';
import clsx from 'clsx';

export function Sidebar({ onMobileClose }) {
  const { workspaceStore, setActivePanel } = useStores();
  const { workspaces, activeId } = useStoreData(workspaceStore);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (ws) => {
    setEditingId(ws.id);
    setEditValue(ws.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editValue.trim()) {
      workspaceStore.update(editingId, { name: editValue.trim() });
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <aside className="border-r border-theme bg-bg-panel flex flex-col h-full transition-colors duration-500">
      {/* Brand Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-text-gold animate-pulse shrink-0"></div>
          <span className="text-xs font-semibold tracking-[0.35em] uppercase text-ink-primary">
            HUSH
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="text-[10px] font-medium text-text-muted uppercase tracking-[0.2em] px-3 mb-4">
          Workspaces
        </div>

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
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150",
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
                <span className="text-sm truncate" title="Double-click to rename">{ws.name}</span>
              )}
            </div>
          ))}
        </div>

        <div
          onClick={() => workspaceStore.create('New Space', '🚀')}
          className="flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-text-gold cursor-pointer transition-colors mt-6 opacity-60 hover:opacity-100"
        >
          <Plus size={14} />
          <span className="text-sm">New Workspace</span>
        </div>
      </nav>

      {/* Footer Tools */}
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
    </aside>
  );
}
