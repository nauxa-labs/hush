import React, { useEffect, useState } from 'react';
import { useStores, useStoreData, useStoreSelector } from '../../contexts/StoreContext';
import { Play, Pause, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

export function Timer() {
  const { timerService, settingsStore } = useStores();
  const { remaining, isRunning, total } = useStoreData(timerService);
  const presets = useStoreSelector(settingsStore, (state) => state.timer?.presets) || [15, 25, 45, 60];

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((total - remaining) / total) * 100;

  return (
    <div className="flex flex-col items-center">
      {/* Timer Display */}
      <div className="font-mono text-[10rem] font-light leading-none tracking-tighter text-text-main tabular-nums mb-12 select-none relative">
        {formatTime(remaining)}

        {/* Subtle Progress Ring or Bar could go here, but Minimalist is better */}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => isRunning ? timerService.pause() : timerService.start()}
          className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-text-gold text-bg-deep hover:brightness-110 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(182,162,106,0.3)]"
        >
          {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>

        <button
          onClick={() => timerService.reset()}
          className="flex items-center justify-center w-14 h-14 rounded-full border transition-all hover:bg-panel"
          style={{
            borderColor: 'var(--btn-border-subtle)',
            color: 'var(--icon-on-bg)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--btn-border-active)';
            e.currentTarget.style.color = 'var(--icon-on-bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--btn-border-subtle)';
            e.currentTarget.style.color = 'var(--icon-on-bg)';
          }}
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Quick Adjust - Using customizable presets */}
      {!isRunning && (
        <div className="mt-12 flex gap-4">
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
