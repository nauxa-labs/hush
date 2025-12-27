import React, { useState } from 'react';
import { useStores } from '../../contexts/StoreContext';
import { EditableText } from '../ui/EditableText';
import { Trash2, Play, Copy, X, CheckSquare, Square } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export function CardDetailPanel({ cardId }) {
  const { kanbanStore, timerService, setFocusMode, setActivePanel, requestConfirmation, setActiveFocusTaskId } = useStores();
  const card = kanbanStore.getCard(cardId);
  const [newSubtask, setNewSubtask] = useState('');

  // If card deleted while open
  if (!card) return <div className="p-6 text-text-muted">Card not found</div>;

  const progress = card.subtasks.length > 0
    ? Math.round((card.subtasks.filter(s => s.done).length / card.subtasks.length) * 100)
    : 0;

  const handleAddSubtask = (e) => {
    if (e.key === 'Enter' && newSubtask.trim()) {
      kanbanStore.addSubtask(cardId, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleStartFocus = () => {
    timerService.setDuration(25);
    setActiveFocusTaskId(card.id);
    setFocusMode(true);
  };

  return (
    <div className="flex flex-col bg-bg-panel text-text-main p-8 min-h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-8 text-text-muted border-b border-white/5 pb-4 pr-12">
        <button
          onClick={handleStartFocus}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-text-gold/10 text-text-gold hover:bg-text-gold/20 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <Play size={12} fill="currentColor" /> Start Focus
        </button>
        <div className="flex-1"></div>
        <button className="p-2 hover:text-white transition-colors" title="Copy Link">
          <Copy size={16} />
        </button>
        <button
          onClick={() => requestConfirmation({
            title: 'Delete Task?',
            message: 'Are you sure you want to delete this task? This cannot be undone.',
            onConfirm: () => {
              kanbanStore.deleteCard(card.id);
              setActivePanel(null);
            }
          })}
          className="p-2 hover:text-red-400 transition-colors" title="Delete Task"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Title */}
      <div className="mb-8">
        <EditableText
          value={card.title}
          onSave={(val) => kanbanStore.updateCard(card.id, { title: val })}
          className="text-3xl font-light text-text-main w-full block leading-tight"
        />
      </div>

      {/* Description / Notes */}
      <div className="mb-10 bg-black/40 rounded-xl border border-white/5 overflow-hidden group/notes focus-within:border-white/10 transition-colors">
        <div className="px-5 pt-4 text-[10px] font-bold text-text-muted/50 uppercase tracking-widest bg-black/20 pb-2 border-b border-white/5 flex justify-between">
          <span>Notes & Details</span>
          <span className="opacity-0 group-hover/notes:opacity-100 transition-opacity text-text-gold/50 text-[9px]">MARKDOWN SUPPORTED</span>
        </div>
        <div className="relative">
          <EditableText
            value={card.content}
            placeholder="Add details, notes, or markdown..."
            multiline={true}
            onSave={(val) => kanbanStore.updateCard(card.id, { content: val })}
            className="w-full min-h-[120px] block outline-none bg-transparent placeholder:text-white/10 resize-none text-sm text-text-muted/90 leading-relaxed p-5"
          />
        </div>
      </div>

      {/* Subtasks */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Subtasks</div>
          <div className="text-xs text-text-gold font-mono">{progress}%</div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/10 rounded-full mb-6 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-text-gold"
          />
        </div>

        <div className="space-y-3 mb-4">
          <AnimatePresence initial={false}>
            {card.subtasks.map(subtask => (
              <motion.div
                key={subtask.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
              >
                <button
                  onClick={() => kanbanStore.toggleSubtask(card.id, subtask.id)}
                  className={clsx("transition-colors mt-1", subtask.done ? "text-text-gold" : "text-text-muted hover:text-white")}
                >
                  {subtask.done ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>

                <div className="flex-1 min-w-0">
                  <EditableText
                    value={subtask.text}
                    onSave={(val) => kanbanStore.updateSubtask(card.id, subtask.id, val)}
                    className={clsx("text-sm transition-all leading-relaxed block w-full", subtask.done && "line-through text-text-muted opacity-50")}
                    placeholder="Subtask..."
                  />
                </div>

                <button
                  onClick={() => kanbanStore.deleteSubtask(card.id, subtask.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all p-1"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Input */}
        <div className="flex items-center gap-3 p-3 text-text-muted opacity-60 focus-within:opacity-100 transition-opacity border border-dashed border-white/10 rounded-lg hover:border-white/20 hover:bg-white/5">
          <PlusIcon />
          <input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={handleAddSubtask}
            placeholder="Add subtask..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-text-muted/50"
          />
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-8 pt-8 border-t border-white/5 text-[10px] text-text-muted/30 font-mono text-center mb-8">
        TASK ID: {card.id} • CREATED: {new Date(card.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
