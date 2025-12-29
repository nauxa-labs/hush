import React, { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { FocusOverlay } from '../focus/FocusOverlay';
import { SlidePanel } from '../panels/SlidePanel';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { OfflineWarning } from '../ui/OfflineWarning';
import { ShortcutHelpModal } from '../ui/ShortcutHelpModal';
import { YouTubeHiddenPlayer } from '../audio/YouTubeHiddenPlayer';
import { MiniAudioPlayer } from '../audio/MiniAudioPlayer';
import { AmbientPlayer } from '../audio/AmbientPlayer';
import { useKeyboardShortcuts } from '../../lib/hooks/useKeyboardShortcuts';

import { useStores, useStoreSelector } from '../../contexts/StoreContext';
import { useEffect } from 'react';

export function AppShell({ children }) {
  const { settingsStore } = useStores();
  const theme = useStoreSelector(settingsStore, (state) => state.theme);

  // Shortcut help modal state
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // Memoized callbacks to prevent re-renders and event listener recreation
  const openShortcutHelp = useCallback(() => setShowShortcutHelp(true), []);
  const closeShortcutHelp = useCallback(() => setShowShortcutHelp(false), []);
  const toggleShortcutHelp = useCallback(() => setShowShortcutHelp(prev => !prev), []);

  // Global keyboard shortcuts with help toggle
  useKeyboardShortcuts({
    onToggleHelp: toggleShortcutHelp,
    isHelpOpen: showShortcutHelp,
    onCloseHelp: closeShortcutHelp
  });

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <div className="flex h-screen w-screen overflow-hidden z-0 bg-bg-deep text-text-main transition-colors duration-500">
      {/* Sidebar: Fixed Width */}
      <div className="w-[280px] shrink-0 border-r border-theme bg-bg-panel z-20 flex flex-col transition-colors duration-500">
        <Sidebar />
      </div>

      {/* Main Content Area: Grows to fill space */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-[80px] shrink-0">
          <TopBar onOpenShortcutHelp={openShortcutHelp} />
        </div>

        <main className="flex-1 overflow-auto p-10 relative">
          {children}
        </main>
      </div>

      {/* Slide Panel: Independent Column */}
      <SlidePanel />

      {/* Global Overlays (Absolute) */}
      <FocusOverlay />
      <ConfirmDialog />
      <OfflineWarning />
      <ShortcutHelpModal
        isOpen={showShortcutHelp}
        onClose={closeShortcutHelp}
      />

      {/* Audio: Always Mounted */}
      <YouTubeHiddenPlayer />
      <AmbientPlayer />
      <MiniAudioPlayer />
    </div>
  );
}
