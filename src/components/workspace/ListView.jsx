import React, { useState } from 'react';
import { useStores, useStoreData } from '../../contexts/StoreContext';
import { EditableText } from '../ui/EditableText';
import { Play, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableRow } from './SortableRow';

export function ListView() {
  const { workspaceStore, kanbanStore, setActivePanel } = useStores();
  const { activeId, workspaces } = useStoreData(workspaceStore);
  const activeWs = workspaces.find(w => w.id === activeId);

  // Subscribe to changes
  useStoreData(kanbanStore);

  const [activeDragId, setActiveDragId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!activeWs) return null;

  const columns = [...activeWs.columns].sort((a, b) => a.order - b.order);

  const handleCardClick = (cardId) => {
    setActivePanel(`card:${cardId}`);
  };

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;
    if (active.id === over.id) return;

    const activeCard = kanbanStore.getCard(active.id);
    const overData = over.data.current;

    // We only support reordering within the same column for now in List View 
    // to match standard list behavior, OR we can support cross-column.
    // Given the UI structure (grouped by column), dragging between groups implies changing status.

    if (activeCard && overData?.card) {
      const overCard = overData.card;

      // Same column reorder
      if (activeCard.columnId === overCard.columnId) {
        const cards = kanbanStore.getCardsByColumn(activeWs.id, activeCard.columnId);
        const oldIndex = cards.findIndex(c => c.id === active.id);
        const newIndex = cards.findIndex(c => c.id === over.id);
        kanbanStore.moveCard(active.id, activeCard.columnId, newIndex);
      } else {
        // Different column (Status change)
        const targetCards = kanbanStore.getCardsByColumn(activeWs.id, overCard.columnId);
        const newIndex = targetCards.findIndex(c => c.id === over.id);
        kanbanStore.moveCard(active.id, overCard.columnId, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-4xl mx-auto p-6 bg-glass-panel rounded-xl glass-panel text-text-main mb-20">
        <h2 className="text-xl font-light mb-8 tacking-tight">{activeWs.name} Tasks</h2>

        {columns.map(col => {
          const cards = kanbanStore.getCardsByColumn(activeWs.id, col.id);

          return (
            <div key={col.id} className="mb-8 last:mb-0">
              <div className="flex items-center justify-between mb-3 border-b border-theme/30 pb-2">
                <div className="text-xs font-bold text-text-muted uppercase tracking-widest flex-1">
                  <EditableText
                    value={col.title}
                    onSave={(val) => workspaceStore.updateColumn(activeWs.id, col.id, { title: val })}
                    className="hover:text-text-main transition-colors cursor-text"
                  />
                </div>
                <span className="text-xs text-text-muted bg-surface px-2 py-0.5 rounded-full">{cards.length}</span>
              </div>

              <div className="space-y-1">
                <SortableContext
                  items={cards.map(c => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {cards.map(card => (
                    <SortableRow
                      key={card.id}
                      card={card}
                      onActivate={() => handleCardClick(card.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={clsx("w-2 h-2 rounded-full", col.title === 'Done' ? "bg-text-gold" : "bg-text-muted")}></div>
                        <div className="flex-1 font-medium text-sm">
                          <EditableText
                            value={card.title}
                            onSave={(val) => kanbanStore.updateCard(card.id, { title: val })}
                            activationMode="double-click" // Require double click to edit
                            className="text-text-main w-full"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 hover:text-text-gold transition-colors"
                          title="Focus"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement focus start
                          }}
                        >
                          <Play size={14} />
                        </button>
                        <button className="p-1.5 hover:text-text-main text-text-muted transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </SortableRow>
                  ))}
                </SortableContext>

                {cards.length === 0 && (
                  <div className="py-2 text-xs text-text-muted italic opacity-50 px-3">No tasks</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </DndContext>
  );
}
