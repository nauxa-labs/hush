// File: js/components/panels/StatsPanel.js
import { Icons } from '../../utils/Icons.js';

export class StatsPanel {
  constructor(container, { statsStore, onClose }) {
    this.container = container;
    this.store = statsStore;
    this.onClose = onClose;

    this.render();
  }

  render() {
    const stats = this.store.getStats();

    this.container.innerHTML = `
      <div class="panel__header">
        <div class="panel__title">
           ${Icons.Stats} STATS
        </div>
        <button class="panel__close">${Icons.Close}</button>
      </div>
      
      <div class="panel__content">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card__value">${stats.todaySessions}</div>
                <div class="stat-card__label">SESSIONS</div>
            </div>
            <div class="stat-card">
                <div class="stat-card__value">${stats.todayMinutes}m</div>
                <div class="stat-card__label">MINUTES</div>
            </div>
             <div class="stat-card">
                <div class="stat-card__value">${stats.currentStreak} 🔥</div>
                <div class="stat-card__label">STREAK</div>
            </div>
             <div class="stat-card">
                <div class="stat-card__value">${stats.totalMinutes}m</div>
                <div class="stat-card__label">LIFETIME</div>
            </div>
        </div>

        <h3 class="panel__section-title">WORKSPACE BREAKDOWN</h3>
        <div class="workspace-stats-list">
            ${Object.entries(stats.byWorkspace).map(([id, s]) => `
                <div class="stat-row">
                   <div class="stat-row__name">Workspace ${id.substr(0, 4)}...</div>
                   <div class="stat-row__value">${s.sessions} sess / ${s.minutes} min</div>
                </div>
            `).join('')}
             ${Object.keys(stats.byWorkspace).length === 0 ? '<p class="empty-state">No activity yet.</p>' : ''}
        </div>
      </div>
    `;

    this.container.querySelector('.panel__close').addEventListener('click', this.onClose);
  }
}
