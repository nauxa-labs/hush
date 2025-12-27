import React, { useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useStores } from '../../contexts/StoreContext';

/**
 * YouTubeHiddenPlayer
 * 
 * Always mounted in AppShell. Uses YouTube IFrame Player API for proper control.
 * Features:
 * - Volume control via audioStore.musicVolume
 * - Play/pause control
 * - Auto-advances to next video on end (if autoRotate)
 */
export const YouTubeHiddenPlayer = observer(function YouTubeHiddenPlayer() {
  const { audioStore } = useStores();
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const isAPIReady = useRef(false);
  const pendingVideoId = useRef(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      isAPIReady.current = true;
      return;
    }

    // Load the API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      isAPIReady.current = true;
      // If there was a pending video, create the player now
      if (pendingVideoId.current && audioStore.isPlaying) {
        createPlayer(pendingVideoId.current);
      }
    };
  }, []);

  // Create the YouTube player
  const createPlayer = useCallback((videoId) => {
    if (!isAPIReady.current || !window.YT) {
      pendingVideoId.current = videoId;
      return;
    }

    // Destroy existing player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        // Player might already be destroyed
      }
      playerRef.current = null;
    }

    // Ensure container exists
    if (!containerRef.current) return;

    // Create hidden div for player
    const playerDiv = document.createElement('div');
    playerDiv.id = 'youtube-hidden-player-' + Date.now();
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(playerDiv);

    playerRef.current = new window.YT.Player(playerDiv.id, {
      height: '1',
      width: '1',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        loop: 0,
      },
      events: {
        onReady: (event) => {
          // Set initial volume
          event.target.setVolume(audioStore.musicVolume * 100);
          event.target.playVideo();
        },
        onStateChange: (event) => {
          // Video ended - auto advance if enabled
          if (event.data === window.YT.PlayerState.ENDED) {
            if (audioStore.autoRotate && audioStore.playlist.length > 1) {
              audioStore.next();
            } else {
              // Loop current video
              event.target.playVideo();
            }
          }
        },
        onError: (event) => {
          console.error('[YouTubeHiddenPlayer] Error:', event.data);
          // Skip to next on error
          if (audioStore.autoRotate) {
            audioStore.next();
          }
        }
      }
    });
  }, [audioStore]);

  // Handle play/pause and video changes
  useEffect(() => {
    if (!audioStore.isPlaying || !audioStore.currentVideoId) {
      // Stop playback
      if (playerRef.current && playerRef.current.pauseVideo) {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {
          // Player might not be ready
        }
      }
      return;
    }

    // Create or update player for new video
    if (isAPIReady.current) {
      createPlayer(audioStore.currentVideoId);
    } else {
      pendingVideoId.current = audioStore.currentVideoId;
    }
  }, [audioStore.isPlaying, audioStore.currentVideoId, createPlayer]);

  // React to volume changes
  useEffect(() => {
    const dispose = reaction(
      () => audioStore.musicVolume,
      (volume) => {
        if (playerRef.current && playerRef.current.setVolume) {
          try {
            playerRef.current.setVolume(volume * 100);
          } catch (e) {
            // Player might not be ready
          }
        }
      }
    );

    return () => dispose();
  }, [audioStore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Already destroyed
        }
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed -z-50 opacity-0 pointer-events-none"
      style={{ width: 1, height: 1, overflow: 'hidden' }}
      aria-hidden="true"
    />
  );
});
