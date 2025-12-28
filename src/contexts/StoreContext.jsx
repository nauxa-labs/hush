import React, { createContext, useContext, useEffect, useState, useSyncExternalStore, useRef } from 'react';
import { WorkspaceStore } from '../lib/store/WorkspaceStore';
import { KanbanStore } from '../lib/store/KanbanStore';
import { SettingsStore } from '../lib/store/SettingsStore';
import { StatsStore } from '../lib/store/StatsStore';
import { AchievementStore } from '../lib/store/AchievementStore';
import { AudioStore } from '../stores/AudioStore';
import { TimerService } from '../lib/services/TimerService';
import { AudioService } from '../lib/services/AudioService';
import { ToastProvider, useToast } from '../components/ui/Toast';

// 1. Create Context
const StoreContext = createContext(null);

// 2. Instantiate Stores (Singletons)
const workspaceStore = new WorkspaceStore();
const kanbanStore = new KanbanStore();
const settingsStore = new SettingsStore();
const statsStore = new StatsStore();
const achievementStore = new AchievementStore(statsStore);
const audioStore = new AudioStore();
const timerService = new TimerService(statsStore, workspaceStore);
const audioService = new AudioService(settingsStore, timerService);

// 3. Provider Component
export function StoreProvider({ children }) {
  return (
    <ToastProvider>
      <StoreProviderInner>
        {children}
      </StoreProviderInner>
    </ToastProvider>
  );
}

// Inner Provider to access Toast Context
function StoreProviderInner({ children }) {
  const { showToast } = useToast();
  const [focusMode, setFocusMode] = useState(false);
  const [activeFocusTaskId, setActiveFocusTaskId] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  // Refs to hold current state for event handlers (to avoid stale closures)
  const focusModeRef = useRef(focusMode);
  const activePanelRef = useRef(activePanel);

  // Keep refs in sync with state
  useEffect(() => {
    focusModeRef.current = focusMode;
  }, [focusMode]);

  useEffect(() => {
    activePanelRef.current = activePanel;
  }, [activePanel]);

  // Global Event Listeners
  useEffect(() => {
    // Listen for badge unlocks
    const unsubscribeBadge = achievementStore.on('badge:unlocked', (badge) => {
      showToast({
        title: 'Badge Unlocked!',
        message: `You earned: ${badge.name} ${badge.icon}`,
        type: 'success',
        duration: 5000
      });
    });

    return () => {
      unsubscribeBadge();
    };
  }, [showToast]);

  const requestConfirmation = (options) => {
    setConfirmation({
      title: 'Are you sure?',
      message: 'This action cannot be undone.',
      variant: 'danger',
      ...options
    });
  };

  const closeConfirmation = () => setConfirmation(null);

  // Getter functions that always return fresh values (for event handlers)
  const getFocusMode = () => focusModeRef.current;
  const getActivePanel = () => activePanelRef.current;

  const stores = {
    workspaceStore,
    kanbanStore,
    settingsStore,
    statsStore,
    achievementStore,
    audioStore,
    timerService,
    audioService,
    focusMode,
    setFocusMode,
    getFocusMode,  // Getter for event handlers
    activeFocusTaskId,
    setActiveFocusTaskId,
    activePanel,
    setActivePanel,
    getActivePanel,  // Getter for event handlers
    confirmation,
    requestConfirmation,
    closeConfirmation
  };

  return (
    <StoreContext.Provider value={stores}>
      {children}
    </StoreContext.Provider>
  );
}

// 4. Hook to access the stores object
export function useStores() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return context;
}

// 5. Hook to subscribe to a specific store's data
// This replaces the manual "on('change', render)" logic from legacy code
export function useStoreData(store) {
  // Initialize with current data
  const [data, setData] = useState(() => ({ ...store.data }));

  useEffect(() => {
    // Handler receives the raw mutable data from store.emit
    const handleChange = (newData) => {
      // Force a re-render by creating a new object reference
      setData({ ...newData });
    };

    // Subscribe
    const unsubscribe = store.on('change', handleChange);

    // Cleanup
    return () => unsubscribe();
  }, [store]);

  return data;
}

// Helper to select specific part of state
export function useStoreSelector(store, selector) {
  const data = useStoreData(store);
  return selector(data);
}
