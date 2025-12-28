import { useEffect } from 'react';
import { useStores } from '../../contexts/StoreContext';

/**
 * Global keyboard shortcuts for HUSH
 * 
 * Shortcuts:
 * - Space: Start/Pause timer (when not typing)
 * - R: Reset timer (when not typing)
 * - Escape: Close panels, exit focus mode
 * - F: Toggle Focus Mode (when not typing)
 * - 1-4: Quick select timer preset
 */
export function useKeyboardShortcuts() {
  const {
    timerService,
    settingsStore,
    setFocusMode,
    setActivePanel,
    setActiveFocusTaskId,
    getFocusMode,     // Getter for fresh value
    getActivePanel    // Getter for fresh value
  } = useStores();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Get fresh values using getters (avoids stale closures)
      const focusMode = getFocusMode();
      const activePanel = getActivePanel();

      // Ignore if typing in an input, textarea, or contenteditable
      const isTyping =
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable;

      // Escape always works (even when typing)
      if (e.key === 'Escape') {
        e.preventDefault();

        // Priority: close panel first, then exit focus mode
        if (activePanel) {
          setActivePanel(null);
        } else if (focusMode) {
          setFocusMode(false);
          setActiveFocusTaskId(null);
        }
        return;
      }

      // Skip other shortcuts if typing
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
  }, [timerService, settingsStore, setFocusMode, setActivePanel, setActiveFocusTaskId, getFocusMode, getActivePanel]);
}
