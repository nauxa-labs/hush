import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditableText } from '../ui/EditableText';
import { Play, MoreHorizontal, FileText, CheckSquare } from 'lucide-react';
import { useStores } from '../../contexts/StoreContext';
import clsx from 'clsx';

export function TaskCard({ card }) {
  const { kanbanStore, setActivePanel, setFocusMode, setActiveFocusTaskId, timerService } = useStores();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.id, data: { type: 'Card', card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const activeFocusTaskId = kanbanStore.activeFocusTaskId || null; // Accessing from new context usage, though passed via useStores return earlier, we need to destructure it.

  const handleStartFocus = (e) => {
    e.stopPropagation();
    timerService.setDuration(25);
    setActiveFocusTaskId(card.id);
    setFocusMode(true);
  };

  const handleOpenDetail = (e) => {
    e.stopPropagation(); // prevent drag
    setActivePanel(`card:${card.id}`);
  };

  const completedSubtasks = card.subtasks ? card.subtasks.filter(s => s.done).length : 0;
  const totalSubtasks = card.subtasks ? card.subtasks.length : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card group p-3 mb-2 cursor-grab active:cursor-grabbing relative overflow-hidden"
    >
      {/* Title */}
      <div className="mb-2">
        <EditableText
          value={card.title}
          onSave={(val) => kanbanStore.updateCard(card.id, { title: val })}
          className="text-sm font-medium text-text-main line-clamp-2"
        />
      </div>

      {/* Meta Indicators */}
      <div className="flex items-center gap-3 text-[10px] text-text-muted">
        {card.content && (
          <div className="flex items-center gap-1" title="Has Notes">
            <FileText size={10} />
          </div>
        )}
        {totalSubtasks > 0 && (
          <div className={clsx("flex items-center gap-1", completedSubtasks === totalSubtasks && "text-text-gold")} title="Subtasks">
            <CheckSquare size={10} />
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
        )}
      </div>

      {/* Hover Actions - Delayed, muted reveal */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-60 transition-opacity duration-150 delay-150">
        <button
          onClick={handleStartFocus}
          className="p-1.5 text-ink-muted hover:text-ink-secondary transition-colors duration-100"
          title="Focus"
        >
          <Play size={14} />
        </button>
        <button
          onClick={handleOpenDetail}
          className="p-1.5 text-ink-muted hover:text-ink-secondary transition-colors duration-100"
          title="Details"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}
