import React from 'react';
import { DndContext, DragOverlay, rectIntersection, pointerWithin, useSensor, useSensors, PointerSensor, MouseSensor, TouchSensor } from '@dnd-kit/core';
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
  const [overColumnId, setOverColumnId] = React.useState(null);

  // Better sensor configuration for smooth dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Slightly larger to prevent accidental drags
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
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

  const handleDragOver = (event) => {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }

    const overData = over.data.current;
    if (overData?.type === 'Column') {
      setOverColumnId(overData.column.id);
    } else if (overData?.type === 'Card') {
      setOverColumnId(overData.columnId);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    setOverColumnId(null);

    if (!over) return;

    const activeCardId = active.id;
    const overId = over.id;

    if (activeCardId === overId) return;

    // Logic for Card Reordering / Moving
    const card = kanbanStore.getCard(activeCardId);
    if (card) {
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
        const colCards = kanbanStore.getCardsByColumn(activeWs.id, targetColumnId);
        const overIndex = colCards.findIndex(c => c.id === overId);
        // Insert at the position of the card we're over
        targetIndex = overIndex >= 0 ? overIndex : colCards.length;
      }

      if (targetColumnId && targetColumnId !== card.columnId) {
        // Moving to different column
        kanbanStore.moveCard(activeCardId, targetColumnId, targetIndex);
      } else if (targetColumnId) {
        // Reordering within same column
        kanbanStore.moveCard(activeCardId, targetColumnId, targetIndex);
      }
    }
  };

  // Custom collision detection that prioritizes columns for easier dropping
  const customCollisionDetection = (args) => {
    // First check if pointer is within any droppable
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    // Fallback to rect intersection
    return rectIntersection(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-8 overflow-x-auto pb-4 px-2">
        {activeWs.columns.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            workspaceId={activeWs.id}
            cards={kanbanStore.getCardsByColumn(activeWs.id, col.id)}
            isOver={overColumnId === col.id}
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

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeDragId ? (
          <TaskCard card={kanbanStore.getCard(activeDragId)} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
