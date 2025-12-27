import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStores } from '../../contexts/StoreContext';
import { Timer } from './Timer';
import { X, Maximize2, Minimize2 } from 'lucide-react';

export function FocusOverlay() {
  const { focusMode, setFocusMode, kanbanStore, activeFocusTaskId, setActiveFocusTaskId } = useStores();

  const activeTask = activeFocusTaskId ? kanbanStore.getCard(activeFocusTaskId) : null;

  const handleExit = () => {
    setFocusMode(false);
    setActiveFocusTaskId(null);
  };

  return (
    <AnimatePresence>
      {focusMode && (
        <motion.div
          layoutId="focus-timer-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.15 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-deep/95 backdrop-blur-xl"
        >
          {/* Active Task Context */}
          {activeTask ? (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-10 text-center"
            >
              <div className="text-xs font-bold text-text-gold uppercase tracking-[0.2em] mb-4">Current Focus</div>
              <h2 className="text-4xl font-light text-white tracking-wide">{activeTask.title}</h2>
            </motion.div>
          ) : (
            <div className="mb-4 text-text-gold font-bold tracking-[8px] text-sm uppercase opacity-80">Focus Mode</div>
          )}

          {/* Minimize Button */}
          <button
            onClick={handleExit}
            className="absolute top-10 right-10 p-3 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors group"
            title="Minimize (Keep Running)"
          >
            <Minimize2 size={24} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Timer Component */}
          {/* We wrap Timer in a motion div with layoutId to connect it to the MiniTimer */}
          <motion.div layoutId="focus-timer-shared">
            <Timer />
          </motion.div>

          {/* End Session Button (Stop & Reset) */}
          <button
            onClick={() => {
              timerService.reset();
              handleExit();
            }}
            className="absolute bottom-10 px-8 py-3 rounded-full border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/60 transition-all text-xs tracking-[0.2em] uppercase font-bold"
          >
            End Session
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
