// File: js/app.js

// Stores
import { SettingsStore } from './store/SettingsStore.js';
import { WorkspaceStore } from './store/WorkspaceStore.js';
import { KanbanStore } from './store/KanbanStore.js';
import { StatsStore } from './store/StatsStore.js';
import { AchievementStore } from './store/AchievementStore.js';

// Services
import { TimerService } from './services/TimerService.js';
import { AudioService } from './services/AudioService.js';

// UI Components
import { Toast } from './components/ui/Toast.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { TopBar } from './components/layout/TopBar.js';
import { SlidePanel } from './components/layout/SlidePanel.js';
import { KanbanBoard } from './components/workspace/KanbanBoard.js';
import { ListView } from './components/workspace/ListView.js';
import { FocusOverlay } from './components/focus/FocusOverlay.js';

// Panel Components
import { CardDetailPanel } from './components/panels/CardDetailPanel.js';
import { StatsPanel } from './components/panels/StatsPanel.js';
import { BadgesPanel } from './components/panels/BadgesPanel.js';
import { SettingsPanel } from './components/panels/SettingsPanel.js';
import { AudioMixer } from './components/panels/AudioMixer.js';

class App {
  constructor() {
    this.initStores();
    this.initServices();
    this.initComponents();
    this.initShortcuts();

    // Initial Render
    this.applyTheme();
  }

  initStores() {
    this.settingsStore = new SettingsStore();
    this.workspaceStore = new WorkspaceStore();
    this.kanbanStore = new KanbanStore();
    this.statsStore = new StatsStore();
    this.achievementStore = new AchievementStore(this.statsStore);

    // Debug
    window.stores = {
      settings: this.settingsStore,
      workspace: this.workspaceStore,
      kanban: this.kanbanStore,
      stats: this.statsStore
    };

    // Listeners
    this.settingsStore.on('change', () => this.applyTheme());

    this.achievementStore.on('badge:unlocked', (badge) => {
      Toast.show(`Badge Unlocked: ${badge.name} ${badge.icon}`, 'success', 5000);
      // Play sound?
    });

    this.workspaceStore.on('workspace:switched', (ws) => {
      Toast.show(`Switched to ${ws.name}`, 'info', 1500);
      this.renderWorkspace();
    });

    this.workspaceStore.on('workspace:updated', () => this.renderWorkspace()); // For view mode changes
  }

  initServices() {
    this.timerService = new TimerService(this.settingsStore, this.statsStore);
    this.audioService = new AudioService(this.settingsStore);
  }

  initComponents() {
    // Sidebar
    this.sidebar = new Sidebar(document.getElementById('sidebar'), {
      workspaceStore: this.workspaceStore,
      onOpenPanel: (panel) => this.openPanel(panel)
    });

    // TopBar
    this.topBar = new TopBar(document.getElementById('topbar'), {
      workspaceStore: this.workspaceStore,
      onToggleFocus: () => this.toggleFocusMode()
    });

    // SlidePanel
    this.slidePanel = new SlidePanel();

    // Focus Overlay (Hidden by default)
    const overlayContainer = document.getElementById('focus-overlay');
    this.focusOverlay = new FocusOverlay(overlayContainer, {
      timerService: this.timerService,
      settingsStore: this.settingsStore,
      kanbanStore: this.kanbanStore,
      onExit: () => this.exitFocusMode()
    });

    // Main View
    this.renderWorkspace();
  }

  renderWorkspace() {
    const container = document.getElementById('workspace-view');
    const activeWs = this.workspaceStore.getActive();
    if (!activeWs) return;

    container.innerHTML = '';

    if (activeWs.viewMode === 'list') {
      new ListView(container, {
        workspaceStore: this.workspaceStore,
        kanbanStore: this.kanbanStore,
        onFocus: (id) => this.startFocus(id),
        onOpenDetail: (id) => this.openCardDetail(id)
      });
    } else {
      new KanbanBoard(container, {
        workspaceStore: this.workspaceStore,
        kanbanStore: this.kanbanStore,
        onFocus: (id) => this.startFocus(id),
        onOpenDetail: (id) => this.openCardDetail(id)
      });
    }
  }

  openPanel(name) {
    const map = {
      stats: StatsPanel,
      badges: BadgesPanel,
      settings: SettingsPanel,
      audio: AudioMixer
    };

    const Component = map[name];
    if (Component) {
      const props = {
        onClose: () => this.slidePanel.close()
      };

      // Inject dependencies
      if (name === 'stats') props.statsStore = this.statsStore;
      if (name === 'badges') props.achievementStore = this.achievementStore;
      if (name === 'settings') props.settingsStore = this.settingsStore;
      if (name === 'audio') props.settingsStore = this.settingsStore;

      this.slidePanel.toggle(Component, props);
    }
  }

  openCardDetail(cardId) {
    this.slidePanel.mount(CardDetailPanel, {
      cardId,
      kanbanStore: this.kanbanStore,
      onClose: () => this.slidePanel.close()
    });
  }

  startFocus(cardId) {
    this.timerService.setActiveCard(cardId);
    // Auto start if configured
    if (this.settingsStore.get('timer.autoStartPomodoros')) {
      this.timerService.start();
    }
    this.enterFocusMode();
  }

  toggleFocusMode() {
    if (document.body.classList.contains('focus-mode-active')) {
      this.exitFocusMode();
    } else {
      this.enterFocusMode();
    }
  }

  enterFocusMode() {
    document.body.classList.add('focus-mode-active');
    document.getElementById('focus-overlay').classList.add('active');

    // Hide sidebar smoothly
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = 'none';
  }

  exitFocusMode() {
    document.body.classList.remove('focus-mode-active');
    document.getElementById('focus-overlay').classList.remove('active');

    // Restore sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = '';

    // Pause timer if user manually exits
    this.timerService.pause();
  }

  applyTheme() {
    const theme = this.settingsStore.get('theme');
    document.documentElement.setAttribute('data-theme', theme);
  }

  initShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Escape closes panels
      if (e.key === 'Escape') {
        if (this.slidePanel.isOpen) this.slidePanel.close();
        else if (document.body.classList.contains('focus-mode-active')) this.exitFocusMode();
      }

      // Space toggles timer if in focus mode
      if (e.key === ' ' && document.body.classList.contains('focus-mode-active')) {
        // Prevent scroll
        e.preventDefault();
        if (this.timerService.data.isRunning) this.timerService.pause();
        else this.timerService.start();
      }
    });
  }
}

// Start App
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
