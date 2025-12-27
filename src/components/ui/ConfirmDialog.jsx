import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStores } from '../../contexts/StoreContext';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

export function ConfirmDialog() {
  const { confirmation, closeConfirmation } = useStores();

  const handleConfirm = () => {
    if (confirmation?.onConfirm) confirmation.onConfirm();
    closeConfirmation();
  };

  return (
    <AnimatePresence>
      {confirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeConfirmation}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative bg-bg-panel border border-white/10 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={clsx("p-3 rounded-full shrink-0", confirmation.variant === 'danger' ? "bg-red-500/10 text-red-400" : "bg-text-gold/10 text-text-gold")}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-main mb-2">{confirmation.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {confirmation.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 bg-white/5 border-t border-white/5">
              <button
                onClick={closeConfirmation}
                className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={clsx(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  confirmation.variant === 'danger'
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    : "bg-text-gold text-bg-deep hover:bg-white"
                )}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
