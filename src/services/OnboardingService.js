import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export class OnboardingService {
  constructor(settingsStore, workspaceStore, kanbanStore) {
    this.settingsStore = settingsStore;
    this.workspaceStore = workspaceStore;
    this.kanbanStore = kanbanStore;

    this.driver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.6, // Lighter background
      doneBtnText: 'Start Focusing',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      onDestroyed: () => this.markAsSeen(),
    });

    this.steps = [
      {
        popover: {
          title: 'Welcome to Hush 2.0',
          description: 'A luxury focus workspace designed for deep work. Let\'s take a quick tour.',
          side: "center",
          align: 'center'
        }
      },
      {
        element: 'aside',
        popover: {
          title: 'Workspaces & Shortcuts',
          description: 'Manage multiple projects here. Use the bottom panel to access Statistics and Settings.',
          side: "right",
          align: 'start'
        }
      },
      {
        element: '.kanban-board',
        popover: {
          title: 'Kanban Board',
          description: 'Organize your tasks. Drag and drop cards between columns. Click a card to edit details.',
          side: "bottom",
          align: 'start'
        }
      },
      {
        element: '.btn-focus-mode',
        popover: {
          title: 'Focus Mode & Timer',
          description: 'Click here to enter deep focus. A Pomodoro timer will help you stay on track and automatically record your progress.',
          side: "left",
          align: 'center'
        }
      }
    ];
  }

  _createSampleTask() {
    const activeWs = this.workspaceStore.getActive();
    if (!activeWs) return;

    // Find the first column (usually "To Do")
    const firstColumn = activeWs.columns[0];
    if (!firstColumn) return;

    // Check if there are already cards in this workspace
    const existingCards = this.kanbanStore.getCardsByWorkspace(activeWs.id);
    if (existingCards.length > 0) return; // Don't add sample if user already has tasks

    // Create a sample task
    this.kanbanStore.createCard(activeWs.id, firstColumn.id, '🎯 Onboarding Task!');
  }

  start() {
    const hasSeen = this.settingsStore.get('hasSeenOnboarding');
    if (!hasSeen && !this.driver.isActive()) {
      // Create a sample task for context
      this._createSampleTask();

      this.driver.setSteps(this.steps);
      this.driver.drive();
    }
  }

  markAsSeen() {
    this.settingsStore.set('hasSeenOnboarding', true);
  }

  destroy() {
    if (this.driver.isActive()) {
      this.driver.destroy();
    }
  }
}
