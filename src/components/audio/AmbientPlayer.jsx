import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../contexts/StoreContext';
import { ambientEngine, ATMOSPHERES } from '../../lib/audio/AmbientEngine';

/**
 * AmbientPlayer
 * 
 * Hidden component that controls ambient sound playback.
 * Reacts to audioStore.activeAtmosphere and atmosphereVolume.
 * Must be mounted in AppShell to persist across panel changes.
 */
export const AmbientPlayer = observer(function AmbientPlayer() {
  const { audioStore } = useStores();
  const prevAtmosphere = useRef(audioStore.activeAtmosphere);

  // Handle atmosphere changes
  useEffect(() => {
    const atmosphere = audioStore.activeAtmosphere;

    if (atmosphere !== prevAtmosphere.current) {
      prevAtmosphere.current = atmosphere;

      if (atmosphere === 'silence') {
        ambientEngine.stop(true);
      } else if (ATMOSPHERES[atmosphere]) {
        ambientEngine.play(atmosphere);
      }
    }
  }, [audioStore.activeAtmosphere]);

  // Handle volume changes
  useEffect(() => {
    ambientEngine.setVolume(audioStore.atmosphereVolume);
  }, [audioStore.atmosphereVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ambientEngine.stop(false);
    };
  }, []);

  // This component renders nothing
  return null;
});
