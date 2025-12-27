// File: js/components/focus/FocusOverlay.js
import { Timer } from './Timer.js';
import { EditableText } from '../ui/EditableText.js';

export class FocusOverlay {
  constructor(container, { timerService, settingsStore, kanbanStore, onExit }) {
    this.container = container;
    this.timerService = timerService;
    this.settingsStore = settingsStore;
    this.kanbanStore = kanbanStore;
    this.onExit = onExit;

    this.render();
  }

  render() {
    this.container.innerHTML = `
        <div class="focus-overlay__content" style="text-align:center; color:white; max-width:600px; width:100%;">
            <div id="focus-timer-container"></div>
            
            <div id="focus-task-container" style="margin-top:60px; min-height:100px;">
                <!-- Active Task Title -->
            </div>
            
            <div style="margin-top:40px;">
                <button id="exit-focus-btn" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:white; padding:10px 24px; border-radius:30px; cursor:pointer; font-size:1rem; transition:all 0.2s;">
                    Exit Focus Mode
                </button>
            </div>
        </div>
    `;

    // Mount Timer
    const timerContainer = this.container.querySelector('#focus-timer-container');
    new Timer(timerContainer, {
      timerService: this.timerService,
      settingsStore: this.settingsStore
    });

    // Mount Active Task
    const activeCardId = this.timerService.data.activeCardId;
    const taskContainer = this.container.querySelector('#focus-task-container');

    if (activeCardId) {
      const card = this.kanbanStore.getCard(activeCardId);
      if (card) {
        taskContainer.innerHTML = `
                <div style="font-size:0.9rem; text-transform:uppercase; letter-spacing:2px; opacity:0.7; margin-bottom:12px;">Current Task</div>
                <h2 style="font-size:2rem; font-weight:700; margin-bottom:20px;">${card.title}</h2>
                ${card.subtasks.length > 0 ? `
                    <div style="text-align:left; background:rgba(255,255,255,0.05); padding:20px; border-radius:12px;">
                        ${card.subtasks.map(st => `
                            <div style="margin-bottom:8px; opacity:${st.done ? 0.5 : 1}; text-decoration:${st.done ? 'line-through' : 'none'}">
                                ${st.done ? '☑' : '☐'} ${st.text}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            `;
      } else {
        taskContainer.innerHTML = '<h2 style="opacity:0.5">No Active Task</h2>';
      }
    } else {
      taskContainer.innerHTML = '<h2 style="opacity:0.5">Free Focus</h2>';
    }

    // Events
    this.container.querySelector('#exit-focus-btn').addEventListener('click', () => {
      this.onExit();
    });
  }
}
