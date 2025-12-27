import React from 'react';
import { DndContext, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { useStores, useStoreData, useStoreSelector } from '../../contexts/StoreContext';
import { Plus } from 'lucide-react';

export function KanbanBoard() {
  const { workspaceStore, kanbanStore } = useStores();
  const { activeId, workspaces } = useStoreData(workspaceStore);
  const activeWs = workspaces.find(w => w.id === activeId);

  // Subscribe to all cards, filter in render (or use computed selector if optimized)
  const { cards } = useStoreData(kanbanStore);

  const [activeDragId, setActiveDragId] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require movement to start drag (allows clicking)
      },
    })
  );

  if (!activeWs) return (
    <div className="flex justify-center items-center h-full text-text-muted">
      Select a workspace
    </div>
  );

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Logic for Card Reordering / Moving
    // Check if active is a Card
    const card = kanbanStore.getCard(activeId);
    if (card) {
      // Moving a card
      // Is over a Column or a Card?
      const overData = over.data.current;
      let targetColumnId = null;
      let targetIndex = 0;

      if (overData?.type === 'Column') {
        targetColumnId = overData.column.id;
        // Append to end
        const colCards = kanbanStore.getCardsByColumn(activeWs.id, targetColumnId);
        targetIndex = colCards.length;
      } else if (overData?.type === 'Card') {
        targetColumnId = overData.columnId;
        // Insert before or after? dnd-kit sortable usually handles index calculation
        // But for custom store logic, we might need to find index
        const colCards = kanbanStore.getCardsByColumn(activeWs.id, targetColumnId);
        const overIndex = colCards.findIndex(c => c.id === overId);
        // Simplified: Insert at overIndex
        targetIndex = overIndex;
      }

      if (targetColumnId) {
        kanbanStore.moveCard(activeId, targetColumnId, targetIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-8 overflow-x-auto pb-4 px-2">
        {activeWs.columns.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            workspaceId={activeWs.id}
            cards={kanbanStore.getCardsByColumn(activeWs.id, col.id)}
          />
        ))}

        {/* Add Column Button */}
        <div className="min-w-[280px] shrink-0">
          <button
            onClick={() => workspaceStore.addColumn(activeWs.id, 'New Column')}
            className="w-full h-[50px] border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center gap-2 text-text-muted hover:text-text-gold hover:border-text-gold/30 transition-all font-medium text-sm"
          >
            <Plus size={16} />
            Add Column
          </button>
        </div>
      </div>

      <DragOverlay>
        {activeDragId ? (
          <TaskCard card={kanbanStore.getCard(activeDragId)} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
