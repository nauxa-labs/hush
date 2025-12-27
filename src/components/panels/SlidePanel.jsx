import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStores } from '../../contexts/StoreContext';
import { X } from 'lucide-react';
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

  return (
    <AnimatePresence mode="wait">
      {activePanel && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 450, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full border-l border-theme bg-bg-panel flex flex-col overflow-hidden shrink-0 z-10 shadow-2xl relative"
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
          <div className="flex-1 overflow-y-auto min-w-[450px] relative h-full">
            {renderContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
