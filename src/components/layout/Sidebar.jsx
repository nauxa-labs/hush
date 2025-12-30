import React, { useState } from 'react';
import { useStores, useStoreData, useStoreSelector } from '../../contexts/StoreContext';
import { Briefcase, Plus, BarChart2, Music, Settings, Check, X } from 'lucide-react';
import clsx from 'clsx';

export function Sidebar({ onMobileClose }) {
  const { workspaceStore, settingsStore, setActivePanel } = useStores();
  const { workspaces, activeId } = useStoreData(workspaceStore);
  const theme = useStoreSelector(settingsStore, (s) => s.theme);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Determine if current theme is light variant
  const isLightTheme = theme === 'glass_light' || theme === 'sepia';
  const wordmarkSrc = isLightTheme
    ? '/branding/hush-wordmark-light.png'
    : '/branding/hush-wordmark-dark.png';

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
      {/* Brand */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-text-gold animate-pulse"></div>
          <img
            src={wordmarkSrc}
            alt="HUSH"
            className="h-4 opacity-90"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2 mb-3">Workspaces</div>

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
              "group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200",
              activeId === ws.id
                ? "bg-text-main/5 text-text-main font-medium shadow-sm"
                : "text-text-muted hover:text-text-main hover:bg-text-main/5"
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
        <div onClick={() => { setActivePanel('stats'); onMobileClose?.(); }} className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-text-main cursor-pointer rounded hover:bg-text-main/5 transition-colors">
          <BarChart2 size={16} />
          <span className="text-sm">Stats</span>
        </div>
        <div onClick={() => { setActivePanel('audio'); onMobileClose?.(); }} className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-text-main cursor-pointer rounded hover:bg-text-main/5 transition-colors">
          <Music size={16} />
          <span className="text-sm">Audio</span>
        </div>
        <div onClick={() => { setActivePanel('settings'); onMobileClose?.(); }} className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-text-main cursor-pointer rounded hover:bg-text-main/5 transition-colors">
          <Settings size={16} />
          <span className="text-sm">Settings</span>
        </div>
      </div>
    </aside>
  );
}
