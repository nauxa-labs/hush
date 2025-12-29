import React from 'react';
import { LayoutGrid, List, Target, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStores, useStoreData } from '../../contexts/StoreContext';
import clsx from 'clsx';

export function TopBar({ onOpenShortcutHelp }) {
  const { workspaceStore, setFocusMode } = useStores();
  const { activeId, workspaces } = useStoreData(workspaceStore);

  const activeWs = workspaces.find(w => w.id === activeId);

  return (
    <header className="h-[80px] px-8 flex items-center justify-between border-b border-border-color bg-surface z-10">
      {/* Workspace Name - Quiet, not loud */}
      <div>
        <h1 className="text-lg font-normal tracking-tight text-ink-primary">
          {activeWs ? activeWs.name : 'Loading...'}
        </h1>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-5">
        {/* View Toggle - Soft elevated surface */}
        <div className="flex bg-panel p-1 rounded-lg">
          <button
            className={clsx(
              "p-2 rounded-md transition-all duration-100",
              activeWs?.viewMode === 'board' ? "bg-surface text-gold-muted" : "text-ink-muted hover:text-ink-secondary"
            )}
            onClick={() => workspaceStore.setViewMode(activeId, 'board')}
            title="Board View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={clsx(
              "p-2 rounded-md transition-all duration-100",
              activeWs?.viewMode === 'list' ? "bg-surface text-gold-muted" : "text-ink-muted hover:text-ink-secondary"
            )}
            onClick={() => workspaceStore.setViewMode(activeId, 'list')}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>

        <div className="w-px h-5 bg-border-color"></div>

        {/* Help Button - Discoverability for shortcuts */}
        <button
          onClick={onOpenShortcutHelp}
          className="p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-panel transition-all duration-100"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle size={18} />
        </button>

        {/* Smart Focus Toggle */}
        <FocusToggle />
      </div>
    </header>
  );
}

function FocusToggle() {
  const { timerService, focusMode, setFocusMode } = useStores();
  const { remaining, isRunning } = useStoreData(timerService);

  // If timer is running and NOT in focus mode, show the "Mini Timer" button
  const showTimer = isRunning && !focusMode;

  if (showTimer) {
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');

    return (
      <motion.button
        layoutId="focus-timer-shared"
        onClick={() => setFocusMode(true)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-panel hover:bg-surface transition-all duration-100 min-w-[120px] justify-center"
      >
        {/* Quiet gold dot - slow breathe */}
        <div className="w-1.5 h-1.5 rounded-full bg-gold-muted opacity-80" />
        <span className="font-mono font-medium text-sm tracking-wider text-ink-primary">{m}:{s}</span>
      </motion.button>
    );
  }

  // Default "Start Focus" button - Available, not promoted
  return (
    <motion.button
      layoutId="focus-timer-shared"
      className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-panel hover:bg-surface transition-all duration-100 min-w-[120px] justify-center"
      onClick={() => setFocusMode(true)}
    >
      <Target size={14} className="text-ink-muted" />
      <span className="text-xs font-medium tracking-wide text-ink-secondary">Focus</span>
    </motion.button>
  );
}
