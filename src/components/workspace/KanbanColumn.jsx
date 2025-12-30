import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Plus, Trash2 } from 'lucide-react';
import { useStores } from '../../contexts/StoreContext';
import { EditableText } from '../ui/EditableText';
import clsx from 'clsx';

export function KanbanColumn({ column, cards, workspaceId, isOver }) {
  const { kanbanStore, workspaceStore, requestConfirmation } = useStores();

  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: column.id,
    data: { type: 'Column', column }
  });

  // Show highlight when dragging over this column
  const showDropHighlight = isOver || isDroppableOver;

  return (
    <div className={clsx(
      "flex flex-col w-[85vw] md:w-[300px] shrink-0 h-full group/column transition-all duration-200 snap-center first:ml-0 last:mr-4",
      showDropHighlight && "scale-[1.01]"
    )}>
      {/* Header */}
      <div className={clsx(
        "flex items-center justify-between mb-4 px-1 transition-colors",
        showDropHighlight && "text-text-gold"
      )}>
        <div className="flex items-center gap-2 flex-1">
          <div className="text-xs font-medium text-ink-muted uppercase tracking-wide flex-1">
            <EditableText
              value={column.title}
              onSave={(val) => workspaceStore.updateColumn(workspaceId, column.id, { title: val })}
              className="hover:text-ink-secondary transition-colors duration-100"
            />
          </div>
          <span className={clsx(
            "text-[10px] text-ink-muted bg-panel px-1.5 py-0.5 rounded transition-colors",
            showDropHighlight && "bg-text-gold/20 text-text-gold"
          )}>
            {cards.length}
          </span>
        </div>

        <div className="flex gap-1 opacity-0 group-hover/column:opacity-50 transition-opacity duration-150 delay-200">
          <button
            className="p-1.5 text-ink-muted hover:text-ink-secondary transition-colors duration-100"
            onClick={() => requestConfirmation({
              title: 'Delete Column?',
              message: 'Are you sure? All tasks in this column will be permanently deleted.',
              onConfirm: () => workspaceStore.deleteColumn(workspaceId, column.id)
            })}
            title="Delete Column"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 overflow-y-auto min-h-[150px] pb-10 rounded-lg transition-all duration-200",
          showDropHighlight && "bg-text-gold/5 ring-2 ring-text-gold/20"
        )}
      >
        <SortableContext
          items={cards.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map(card => (
            <TaskCard key={card.id} card={card} columnId={column.id} />
          ))}
        </SortableContext>

        {/* Empty state placeholder for easier dropping */}
        {cards.length === 0 && showDropHighlight && (
          <div className="h-20 mx-2 mt-2 border-2 border-dashed border-text-gold/30 rounded-lg flex items-center justify-center text-text-gold/50 text-sm">
            Drop here
          </div>
        )}

        {/* Add Card Button - PRIMARY ACTION */}
        <button
          onClick={() => kanbanStore.createCard(workspaceId, column.id, 'New Task')}
          className="btn-add-task"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
