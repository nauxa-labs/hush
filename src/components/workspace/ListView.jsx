import React from 'react';
import { useStores, useStoreData } from '../../contexts/StoreContext';
import { EditableText } from '../ui/EditableText';
import { Play, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

export function ListView() {
  const { workspaceStore, kanbanStore } = useStores();
  const { activeId, workspaces } = useStoreData(workspaceStore);
  const activeWs = workspaces.find(w => w.id === activeId);

  // Subscribe to changes
  useStoreData(kanbanStore);

  if (!activeWs) return null;

  const columns = [...activeWs.columns].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-glass-panel rounded-xl glass-panel text-text-main">
      <h2 className="text-xl font-light mb-8 tacking-tight">{activeWs.name} Tasks</h2>

      {columns.map(col => {
        const cards = kanbanStore.getCardsByColumn(activeWs.id, col.id);

        return (
          <div key={col.id} className="mb-8 last:mb-0">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{col.title}</span>
              <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">{cards.length}</span>
            </div>

            <div className="space-y-1">
              {cards.map(card => (
                <div
                  key={card.id}
                  className="group flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={clsx("w-2 h-2 rounded-full", col.title === 'Done' ? "bg-text-gold" : "bg-text-muted")}></div>
                    <div className="flex-1 font-medium text-sm">
                      <EditableText
                        value={card.title}
                        onSave={(val) => kanbanStore.updateCard(card.id, { title: val })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:text-text-gold transition-colors" title="Focus">
                      <Play size={14} />
                    </button>
                    <button className="p-1.5 hover:text-text-main text-text-muted transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {cards.length === 0 && (
                <div className="py-2 text-xs text-text-muted italic opacity-50 px-3">No tasks</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
}
