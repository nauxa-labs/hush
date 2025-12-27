import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, X } from 'lucide-react';
import { networkService } from '../../lib/services/NetworkService';
import { useStores } from '../../contexts/StoreContext';

/**
 * OfflineWarning
 * 
 * Luxury toast notification shown when network is offline.
 * Informs user that YouTube is unavailable but ambient sounds continue.
 */
export const OfflineWarning = observer(function OfflineWarning() {
  const { audioStore } = useStores();
  const [dismissed, setDismissed] = React.useState(false);
  const [wasOnline, setWasOnline] = React.useState(true);

  // Reset dismissed state when coming back online
  React.useEffect(() => {
    if (networkService.isOnline && !wasOnline) {
      setDismissed(false);
    }
    setWasOnline(networkService.isOnline);
  }, [networkService.isOnline, wasOnline]);

  // Only show if: offline + (music was playing or atmosphere is active) + not dismissed
  const shouldShow = !networkService.isOnline &&
    !dismissed &&
    (audioStore.isPlaying || audioStore.isAtmosphereActive);

  // Pause YouTube when offline
  React.useEffect(() => {
    if (!networkService.isOnline && audioStore.isPlaying) {
      audioStore.stop();
    }
  }, [networkService.isOnline, audioStore]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-20 left-1/2 z-50 flex items-center gap-4 px-5 py-4 rounded-xl shadow-2xl max-w-sm"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--toggle-border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}
        >
          {/* Icon */}
          <div
            className="p-2 rounded-full"
            style={{ background: 'rgba(168, 145, 90, 0.2)' }}
          >
            <WifiOff size={20} style={{ color: 'var(--gold-muted)' }} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
              You're offline
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
              {audioStore.isAtmosphereActive
                ? 'Ambient sounds will continue playing'
                : 'YouTube music requires an internet connection'
              }
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--ink-muted)' }}
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
