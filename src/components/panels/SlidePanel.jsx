import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStores } from '../../contexts/StoreContext';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { CardDetailPanel } from './CardDetailPanel';
import { StatsPanel } from './StatsPanel';
import { AudioPanel } from './AudioPanel';
import { SettingsPanel } from './SettingsPanel';
import { BadgesPanel } from './BadgesPanel';

export function SlidePanel() {
  const { activePanel, setActivePanel } = useStores();

  // Close panel on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activePanel) setActivePanel(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePanel]);

  const renderContent = () => {
    if (activePanel?.startsWith('card:')) {
      const cardId = activePanel.split(':')[1];
      return <CardDetailPanel cardId={cardId} />;
    }

    switch (activePanel) {
      case 'stats': return <StatsPanel />;
      case 'audio': return <AudioPanel />;
      case 'settings': return <SettingsPanel />;
      case 'badges': return <BadgesPanel />;
      default: return null;
    }
  };

  const getTitle = () => {
    if (activePanel?.startsWith('card:')) return 'Task Details';
    switch (activePanel) {
      case 'stats': return 'Statistics';
      case 'audio': return 'Soundscapes';
      case 'settings': return 'Settings';
      default: return '';
    }
  };

  // Check for mobile
  const [isMobile, setIsMobile] = React.useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const desktopAnim = {
    initial: { width: 0, opacity: 0 },
    animate: { width: 450, opacity: 1 },
    exit: { width: 0, opacity: 0 }
  };

  const mobileAnim = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 }
  };

  return (
    <AnimatePresence mode="wait">
      {activePanel && (
        <>
          {/* Mobile Backdrop */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePanel(null)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm md:hidden"
            />
          )}

          <motion.div
            {...(isMobile ? mobileAnim : desktopAnim)}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={clsx(
              "border-l border-theme bg-bg-panel flex flex-col overflow-hidden z-50 shadow-2xl",
              isMobile ? "fixed inset-y-0 right-0 w-[85vw] max-w-[400px]" : "h-full shrink-0 relative"
            )}
            style={isMobile ? {} : { width: 450 }} // Force width on desktop for proper layout
          >
            {/* Close Button (Absolute Top Right) */}
            <button
              onClick={() => setActivePanel(null)}
              className="absolute top-4 right-4 z-10 p-2 text-text-muted hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all"
              title="Close Panel"
            >
              <X size={16} />
            </button>

            {/* Wrapper for content to allow internal scrolling */}
            <div className="flex-1 overflow-y-auto min-w-full relative h-full">
              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
