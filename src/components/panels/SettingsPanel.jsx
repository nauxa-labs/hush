import React from 'react';
import { useStores, useStoreSelector } from '../../contexts/StoreContext';
import { motion } from 'framer-motion';
import { Moon, Sun, Clock, Speaker } from 'lucide-react';

export function SettingsPanel() {
  const { settingsStore } = useStores();
  const settings = useStoreSelector(settingsStore, (state) => state);

  const updateSetting = (path, value) => {
    settingsStore.set(path, value);
  };

  if (!settings) return null;

  return (
    <div className="p-8 h-full flex flex-col gap-8 overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
        Settings
      </h2>

      {/* Theme */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-ink-muted text-sm uppercase tracking-wider font-medium">
          <Moon size={14} />
          <span>Appearance</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateSetting('theme', 'glass_dark')}
            className="p-4 rounded-xl transition-all text-left"
            style={{
              background: settings.theme === 'glass_dark' ? 'var(--panel)' : 'transparent',
              border: settings.theme === 'glass_dark' ? '1.5px solid var(--gold-muted)' : '1px solid var(--toggle-border)',
              color: settings.theme === 'glass_dark' ? 'var(--ink-primary)' : 'var(--ink-secondary)'
            }}
          >
            <div className="font-medium mb-1">Glass Dark</div>
            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>Deep focus, premium feel</div>
          </button>

          <button
            onClick={() => updateSetting('theme', 'glass_light')}
            className="p-4 rounded-xl transition-all text-left"
            style={{
              background: settings.theme === 'glass_light' ? 'var(--panel)' : 'transparent',
              border: settings.theme === 'glass_light' ? '1.5px solid var(--gold-muted)' : '1px solid var(--toggle-border)',
              color: settings.theme === 'glass_light' ? 'var(--ink-primary)' : 'var(--ink-secondary)'
            }}
          >
            <div className="font-medium mb-1">Glass Light</div>
            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>Airy, clean aesthetics</div>
          </button>
        </div>
      </section>

      {/* Timer Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-ink-muted text-sm uppercase tracking-wider font-medium">
          <Clock size={14} />
          <span>Timer Durations (min)</span>
        </div>

        <div className="space-y-4 p-5 rounded-xl" style={{ background: 'var(--panel)', border: '1px solid var(--toggle-border)' }}>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-ink-primary">Focus Duration</label>
            <input
              type="number"
              value={settings.timer.focusDuration}
              onChange={(e) => updateSetting('timer.focusDuration', parseInt(e.target.value))}
              className="w-16 rounded px-2 py-1 text-center outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--btn-border-subtle)', color: 'var(--ink-primary)' }}
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-ink-primary">Short Break</label>
            <input
              type="number"
              value={settings.timer.shortBreakDuration}
              onChange={(e) => updateSetting('timer.shortBreakDuration', parseInt(e.target.value))}
              className="w-16 rounded px-2 py-1 text-center outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--btn-border-subtle)', color: 'var(--ink-primary)' }}
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-ink-primary">Long Break</label>
            <input
              type="number"
              value={settings.timer.longBreakDuration}
              onChange={(e) => updateSetting('timer.longBreakDuration', parseInt(e.target.value))}
              className="w-16 rounded px-2 py-1 text-center outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--btn-border-subtle)', color: 'var(--ink-primary)' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--panel)', border: '1px solid var(--toggle-border)' }}>
          <div>
            <div className="text-sm font-medium text-ink-primary">Auto-start Breaks</div>
            <div className="text-xs text-ink-muted">Start break immediately after focus</div>
          </div>
          <button
            onClick={() => updateSetting('timer.autoStartBreaks', !settings.timer.autoStartBreaks)}
            className="w-12 h-6 rounded-full transition-colors relative"
            style={{
              background: settings.timer.autoStartBreaks ? 'var(--gold-muted)' : 'var(--panel)',
              border: settings.timer.autoStartBreaks ? 'none' : '1px solid var(--btn-border-subtle)'
            }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full transition-all"
              style={{
                background: settings.timer.autoStartBreaks ? 'white' : 'var(--ink-muted)',
                left: settings.timer.autoStartBreaks ? '1.75rem' : '0.25rem'
              }}
            />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="p-5 rounded-xl space-y-3" style={{ background: 'var(--panel)', border: '1px solid var(--toggle-border)' }}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-ink-primary">Quick Timer Presets</div>
              <div className="text-xs text-ink-muted">Customize the quick select buttons (1-4 keys)</div>
            </div>
          </div>
          <div className="flex gap-2">
            {(settings.timer?.presets || [15, 25, 45, 60]).map((preset, index) => (
              <div key={index} className="flex-1 relative">
                <input
                  type="number"
                  defaultValue={preset}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value);
                    const validValue = isNaN(value) ? 15 : Math.max(1, Math.min(120, value));
                    e.target.value = validValue; // Reset display
                    const newPresets = [...(settings.timer?.presets || [15, 25, 45, 60])];
                    newPresets[index] = validValue;
                    updateSetting('timer.presets', newPresets);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.target.blur(); // Trigger onBlur validation
                    }
                  }}
                  className="w-full rounded px-2 py-2 text-center outline-none text-sm"
                  style={{ background: 'var(--card)', border: '1px solid var(--btn-border-subtle)', color: 'var(--ink-primary)' }}
                  min="1"
                  max="120"
                />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] text-ink-muted bg-bg-panel px-1">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => updateSetting('timer.presets', [15, 25, 45, 60])}
            className="text-xs text-ink-muted hover:text-ink-primary transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      {/* Audio Defaults */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-ink-muted text-sm uppercase tracking-wider font-medium">
          <Speaker size={14} />
          <span>Audio</span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--panel)', border: '1px solid var(--toggle-border)' }}>
          <div>
            <div className="text-sm font-medium text-ink-primary">Ticking Sound</div>
            <div className="text-xs text-ink-muted">Play soft ticking during focus</div>
          </div>
          <button
            onClick={() => updateSetting('timer.tickSound', !settings.timer.tickSound)}
            className="w-12 h-6 rounded-full transition-colors relative"
            style={{
              background: settings.timer.tickSound ? 'var(--gold-muted)' : 'var(--panel)',
              border: settings.timer.tickSound ? 'none' : '1px solid var(--btn-border-subtle)'
            }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full transition-all"
              style={{
                background: settings.timer.tickSound ? 'white' : 'var(--ink-muted)',
                left: settings.timer.tickSound ? '1.75rem' : '0.25rem'
              }}
            />
          </button>
        </div>

        {/* Show Mini Player Setting */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--panel)', border: '1px solid var(--toggle-border)' }}>
          <div>
            <div className="text-sm font-medium text-ink-primary">Show Mini Player</div>
            <div className="text-xs text-ink-muted">Show floating player when panel closed</div>
          </div>
          <button
            onClick={() => updateSetting('showMiniPlayer', !settings.showMiniPlayer)}
            className="w-12 h-6 rounded-full transition-colors relative"
            style={{
              background: settings.showMiniPlayer !== false ? 'var(--gold-muted)' : 'var(--panel)',
              border: settings.showMiniPlayer !== false ? 'none' : '1px solid var(--btn-border-subtle)'
            }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full transition-all"
              style={{
                background: settings.showMiniPlayer !== false ? 'white' : 'var(--ink-muted)',
                left: settings.showMiniPlayer !== false ? '1.75rem' : '0.25rem'
              }}
            />
          </button>
        </div>
      </section>

      {/* Reset Area */}
      <section className="mt-auto pt-8" style={{ borderTop: '1px solid var(--toggle-border)' }}>
        <button
          onClick={() => settingsStore.reset()}
          className="w-full py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium tracking-wide"
          style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
        >
          Reset All Settings
        </button>
      </section>
    </div>
  );
}
