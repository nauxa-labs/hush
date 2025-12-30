import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import clsx from 'clsx';

export function SortableRow({ card, children, onActivate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card.id,
    data: {
      type: 'Row',
      card
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: 'relative'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group flex items-center justify-between p-3 hover:bg-surface rounded-lg transition-colors border border-transparent hover:border-border-color cursor-pointer mb-1",
        isDragging && "bg-surface border-text-gold/20 shadow-lg"
      )}
      onClick={onActivate}
    >
      {/* Drag Handle - only visible on hover (or always visible if preferred, but hover fits hush) */}
      <div
        {...attributes}
        {...listeners}
        className="mr-3 text-text-muted hover:text-text-main cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </div>

      {children}
    </div>
  );
}
