import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
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

export function AppShell({ children }) {
  const { settingsStore } = useStores();
  const theme = useStoreSelector(settingsStore, (state) => state.theme);

  // Shortcut help modal state
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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

  // Mobile drawer backdrop click handler
  const closeMobileDrawer = () => setIsMobileDrawerOpen(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden z-0 bg-bg-deep text-text-main transition-colors duration-500">
      {/* Desktop Sidebar: Hide on mobile */}
      <div className="hidden md:flex w-[280px] shrink-0 border-r border-theme bg-bg-panel z-20 flex-col transition-colors duration-500">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileDrawer}
              className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] z-50 bg-bg-panel border-r border-theme shadow-2xl"
            >
              <Sidebar onMobileClose={closeMobileDrawer} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area: Grows to fill space */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-[80px] shrink-0">
          <TopBar
            onOpenShortcutHelp={openShortcutHelp}
            onToggleMobileDrawer={() => setIsMobileDrawerOpen(true)}
          />
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
