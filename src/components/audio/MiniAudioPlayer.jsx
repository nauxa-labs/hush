import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, Pause, Play, X } from 'lucide-react';
import { useStores, useStoreSelector } from '../../contexts/StoreContext';
import { ATMOSPHERES } from '../../lib/audio/AmbientEngine';

/**
 * MiniAudioPlayer
 * 
 * Shows in bottom-right corner when:
 * - Audio is playing OR atmosphere is active
 * - AudioPanel is NOT open
 * - showMiniPlayer is true (not dismissed)
 * - Settings allow it
 * 
 * Features:
 * - Current atmosphere (if active)
 * - Current video title (if playing)
 * - Animated audio wave
 * - Next button
 * - Dismiss button
 * - Click to open panel
 */
export const MiniAudioPlayer = observer(function MiniAudioPlayer() {
  const { audioStore, activePanel, setActivePanel, settingsStore } = useStores();

  // Use reactive selector for settings
  const showMiniPlayerSetting = useStoreSelector(settingsStore, (state) => state.showMiniPlayer);

  // Check if atmosphere is active
  const isAtmosphereActive = audioStore.activeAtmosphere !== 'silence';
  const currentAtmosphere = ATMOSPHERES[audioStore.activeAtmosphere];

  // Show when: (music playing OR atmosphere active) + panel not audio + not dismissed + settings enabled
  const shouldShow = (audioStore.isPlaying || isAtmosphereActive) &&
    activePanel !== 'audio' &&
    audioStore.showMiniPlayer &&
    showMiniPlayerSetting !== false;

  // Generate display text
  const getDisplayText = () => {
    if (isAtmosphereActive && audioStore.isPlaying) {
      // Both active
      return {
        primary: `${currentAtmosphere?.icon || '🎵'} ${currentAtmosphere?.name || ''}`,
        secondary: audioStore.currentVideoTitle
      };
    } else if (isAtmosphereActive) {
      // Only atmosphere
      return {
        primary: `${currentAtmosphere?.icon || '🎵'} ${currentAtmosphere?.name || ''}`,
        secondary: 'Atmosphere'
      };
    } else {
      // Only music
      return {
        primary: audioStore.currentVideoTitle,
        secondary: 'Playing'
      };
    }
  };

  const displayText = getDisplayText();

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--toggle-border)',
            boxShadow: 'var(--shadow-quiet)'
          }}
        >
          {/* Dismiss Button */}
          <button
            onClick={() => audioStore.dismissMiniPlayer()}
            className="absolute -top-2 -right-2 p-1 rounded-full transition-all opacity-60 hover:opacity-100"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--toggle-border)',
              color: 'var(--ink-muted)'
            }}
            title="Hide mini player"
          >
            <X size={10} />
          </button>

          {/* Clickable area to open panel */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActivePanel('audio')}
            title="Open Audio Panel"
          >
            {/* Audio Wave Animation - Calm Breathing */}
            <div className="flex items-end gap-0.5 h-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full"
                  style={{ background: '#A8915A' }}
                  animate={{ height: [4, 8 + i * 1.5, 4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2 + i * 0.3,
                    ease: 'easeInOut',
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>

            {/* Title */}
            <div className="flex flex-col min-w-0 max-w-[140px]">
              <span
                className="text-xs font-medium truncate"
                style={{ color: 'var(--ink-primary)' }}
              >
                {displayText.primary}
              </span>
              <span
                className="text-[10px] truncate"
                style={{ color: 'var(--ink-muted)' }}
              >
                {displayText.secondary}
              </span>
            </div>
          </div>

          {/* Controls - Only show if music is playing */}
          {audioStore.isPlaying && (
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  audioStore.toggle();
                }}
                className="p-1.5 rounded-full transition-colors"
                style={{
                  background: 'var(--panel)',
                  color: 'var(--icon-on-bg)'
                }}
                title={audioStore.isPlaying ? 'Pause' : 'Play'}
              >
                {audioStore.isPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  audioStore.next();
                }}
                className="p-1.5 rounded-full transition-colors"
                style={{
                  background: 'var(--panel)',
                  color: 'var(--icon-on-bg)'
                }}
                title="Next Track"
              >
                <SkipForward size={12} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
