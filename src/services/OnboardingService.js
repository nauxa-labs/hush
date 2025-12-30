import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export class OnboardingService {
  constructor(settingsStore) {
    this.settingsStore = settingsStore;
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
          description: 'Manage multiple projects here. Use the bottom panel to access functionality like Statistics and Settings.',
          side: "right",
          align: 'start'
        }
      },
      {
        element: '.kanban-board', // We need to ensure this class exists on the board container
        popover: {
          title: 'Kanban Board',
          description: 'Organize your tasks. Drag and drop cards between columns. Click a card to edit details.',
          side: "bottom",
          align: 'start'
        }
      },
      {
        element: '.timer-display', // Make sure this class is on the Timer
        popover: {
          title: 'Focus Timer',
          description: 'The heart of Hush. Start a Pomodoro session here. It tracks your stats automatically.',
          side: "bottom",
          align: 'center'
        }
      },
      {
        element: '.btn-focus-mode', // Ensure this class exists on the Focus Mode button
        popover: {
          title: 'Deep Focus Mode',
          description: 'Enter a distraction-free environment. Full screen, just you and your task.',
          side: "left",
          align: 'center'
        }
      }
    ];
  }

  start() {
    const hasSeen = this.settingsStore.get('hasSeenOnboarding');
    if (!hasSeen && !this.driver.isActive()) {
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
