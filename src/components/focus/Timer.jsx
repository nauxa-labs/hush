import React from 'react';
import { useStores, useStoreData, useStoreSelector } from '../../contexts/StoreContext';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Target } from 'lucide-react';
import clsx from 'clsx';

// Mode display configuration
const MODE_CONFIG = {
  'focus': { label: 'Focus', icon: Target, color: 'text-text-gold' },
  'short-break': { label: 'Short Break', icon: Coffee, color: 'text-green-400' },
  'long-break': { label: 'Long Break', icon: Coffee, color: 'text-blue-400' }
};

export function Timer() {
  const { timerService, settingsStore } = useStores();
  const { remaining, isRunning, total, mode, sessionCount, completedPomodoros } = useStoreData(timerService);
  const presets = useStoreSelector(settingsStore, (state) => state.timer?.presets) || [15, 25, 45, 60];
  const longBreakInterval = useStoreSelector(settingsStore, (state) => state.timer?.longBreakInterval) || 4;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const modeConfig = MODE_CONFIG[mode] || MODE_CONFIG['focus'];
  const ModeIcon = modeConfig.icon;

  return (
    <div className="flex flex-col items-center">
      {/* Mode Indicator Badge */}
      <div className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-full mb-6",
        "bg-white/5 border border-white/10"
      )}>
        <ModeIcon size={16} className={modeConfig.color} />
        <span className={clsx("text-sm font-medium", modeConfig.color)}>
          {modeConfig.label}
        </span>
        {mode === 'focus' && (
          <span className="text-xs text-text-muted ml-2">
            {sessionCount}/{longBreakInterval}
          </span>
        )}
      </div>

      {/* Timer Display */}
      <div className="font-mono text-[10rem] font-light leading-none tracking-tighter text-text-main tabular-nums mb-12 select-none relative">
        {formatTime(remaining)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Skip Button */}
        <button
          onClick={() => timerService.skip()}
          className="flex items-center justify-center w-12 h-12 rounded-full border transition-all hover:bg-panel"
          style={{
            borderColor: 'var(--btn-border-subtle)',
            color: 'var(--icon-on-bg)'
          }}
          title="Skip to next"
          aria-label="Skip to next session"
        >
          <SkipForward size={18} />
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => isRunning ? timerService.pause() : timerService.start()}
          className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-text-gold text-bg-deep hover:brightness-110 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(182,162,106,0.3)]"
          aria-label={isRunning ? "Pause Timer" : "Start Timer"}
        >
          {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>

        {/* Reset */}
        <button
          onClick={() => timerService.reset()}
          className="flex items-center justify-center w-12 h-12 rounded-full border transition-all hover:bg-panel"
          style={{
            borderColor: 'var(--btn-border-subtle)',
            color: 'var(--icon-on-bg)'
          }}
          title="Reset timer"
          aria-label="Reset Timer"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Session Counter */}
      {completedPomodoros > 0 && (
        <div className="mt-8 text-sm text-text-muted">
          {completedPomodoros} session{completedPomodoros > 1 ? 's' : ''} completed
        </div>
      )}

      {/* Quick Adjust - Using customizable presets (only in focus mode) */}
      {!isRunning && (mode === 'focus') && (
        <div className="mt-8 flex gap-4">
          {presets.map((min, index) => (
            <button
              key={`preset-${index}-${min}`}
              onClick={() => timerService.setDuration(min)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm transition-all min-w-[48px]",
                total === min * 60
                  ? "border-2 border-text-gold text-text-gold bg-text-gold/10"
                  : "border text-ink-secondary hover:text-ink-primary"
              )}
              style={total !== min * 60 ? { borderColor: 'var(--btn-border-subtle)' } : undefined}
              title={`Press ${index + 1} for quick select`}
            >
              {min}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

