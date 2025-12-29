import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  {
    category: 'Timer', items: [
      { key: 'Space', action: 'Start / Pause Timer' },
      { key: 'R', action: 'Reset Timer' },
      { key: '1-4', action: 'Quick Select Preset' },
    ]
  },
  {
    category: 'Focus Mode', items: [
      { key: 'F', action: 'Toggle Focus Mode' },
    ]
  },
  {
    category: 'Navigation', items: [
      { key: 'Esc', action: 'Close Panel / Exit Focus' },
      { key: '?', action: 'Show This Help' },
    ]
  },
];

export function ShortcutHelpModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-bg-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-text-gold/10">
                    <Keyboard size={20} className="text-text-gold" />
                  </div>
                  <h2 className="text-lg font-semibold text-text-main">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {SHORTCUTS.map((section) => (
                  <div key={section.category}>
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
                      {section.category}
                    </h3>
                    <div className="space-y-2">
                      {section.items.map((shortcut) => (
                        <div
                          key={shortcut.key}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <span className="text-sm text-text-main">{shortcut.action}</span>
                          <kbd className="px-2 py-1 rounded bg-bg-deep border border-white/10 text-xs font-mono text-text-gold">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/5 bg-white/5">
                <p className="text-xs text-text-muted text-center">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-bg-deep border border-white/10 font-mono text-text-gold">Esc</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-bg-deep border border-white/10 font-mono text-text-gold">?</kbd> to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
