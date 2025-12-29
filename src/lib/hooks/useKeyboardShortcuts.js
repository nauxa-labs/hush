import { useEffect } from 'react';
import { useStores } from '../../contexts/StoreContext';

/**
 * Global keyboard shortcuts for HUSH
 * 
 * Shortcuts:
 * - Space: Start/Pause timer (when not typing)
 * - R: Reset timer (when not typing)
 * - Escape: Close panels, exit focus mode, close help
 * - F: Toggle Focus Mode (when not typing)
 * - ?: Show keyboard shortcut help
 * - 1-4: Quick select timer preset
 */
export function useKeyboardShortcuts({ onToggleHelp } = {}) {
  const {
    timerService,
    settingsStore,
    setFocusMode,
    setActivePanel,
    setActiveFocusTaskId,
    getFocusMode,
    getActivePanel
  } = useStores();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const focusMode = getFocusMode();
      const activePanel = getActivePanel();

      const isTyping =
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable;

      // ?: Show help (works even when typing, Shift+/ = ?)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        onToggleHelp?.();
        return;
      }

      // Escape always works
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activePanel) {
          setActivePanel(null);
        } else if (focusMode) {
          setFocusMode(false);
          setActiveFocusTaskId(null);
        }
        return;
      }

      if (isTyping) return;

      // Space: Start/Pause timer
      if (e.code === 'Space') {
        e.preventDefault();
        const data = timerService.data;
        if (data.isRunning) {
          timerService.pause();
        } else {
          timerService.start();
        }
        return;
      }

      // R: Reset timer
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        timerService.reset();
        return;
      }

      // F: Toggle Focus Mode
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (focusMode) {
          setFocusMode(false);
          setActiveFocusTaskId(null);
        } else {
          setFocusMode(true);
        }
        return;
      }

      // 1-4: Quick select timer preset
      const presetKeys = ['1', '2', '3', '4'];
      if (presetKeys.includes(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const presets = settingsStore?.data?.timer?.presets || [15, 25, 45, 60];
        if (presets[index]) {
          timerService.setDuration(presets[index]);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timerService, settingsStore, setFocusMode, setActivePanel, setActiveFocusTaskId, getFocusMode, getActivePanel, onToggleHelp]);
}

