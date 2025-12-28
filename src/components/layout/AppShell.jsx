import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { FocusOverlay } from '../focus/FocusOverlay';
import { SlidePanel } from '../panels/SlidePanel';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { OfflineWarning } from '../ui/OfflineWarning';
import { YouTubeHiddenPlayer } from '../audio/YouTubeHiddenPlayer';
import { MiniAudioPlayer } from '../audio/MiniAudioPlayer';
import { AmbientPlayer } from '../audio/AmbientPlayer';
import { useKeyboardShortcuts } from '../../lib/hooks/useKeyboardShortcuts';

import { useStores, useStoreSelector } from '../../contexts/StoreContext';
import { useEffect } from 'react';

export function AppShell({ children }) {
  const { settingsStore } = useStores();
  const theme = useStoreSelector(settingsStore, (state) => state.theme);

  // Global keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    // Apply theme to body
    document.body.className = ''; // Clear previous
    document.body.classList.add(theme);

    // For glass_light, we might want to override some variables if we used CSS vars, 
    // but for now the body class handles background/text.
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
          <TopBar />
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

      {/* Audio: Always Mounted */}
      <YouTubeHiddenPlayer />
      <AmbientPlayer />
      <MiniAudioPlayer />
    </div>
  );
}

