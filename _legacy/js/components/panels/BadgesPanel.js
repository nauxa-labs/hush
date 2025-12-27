// File: js/components/panels/BadgesPanel.js
import { Icons } from '../../utils/Icons.js';

export class BadgesPanel {
  constructor(container, { achievementStore, onClose }) {
    this.container = container;
    this.store = achievementStore;
    this.onClose = onClose;

    this.store.on('badge:unlocked', () => this.render());
    this.render();
  }

  render() {
    const badges = this.store.getAllBadges();
    const unlockedCount = badges.filter(b => b.unlocked).length;

    this.container.innerHTML = `
      <div class="panel__header">
        <div class="panel__title">
           ${Icons.Achievement} ACHIEVEMENTS
           <span style="font-size:0.8rem; margin-left:10px; opacity:0.5; font-weight:400">(${unlockedCount}/${badges.length})</span>
        </div>
        <button class="panel__close">${Icons.Close}</button>
      </div>
      
      <div class="panel__content">
        <div class="badges-grid">
            ${badges.map(b => `
                <div class="badge-item ${b.unlocked ? 'unlocked' : ''}" title="${b.name}">
                    <div class="badge-icon">${b.unlocked ? b.icon : '•'}</div>
                    <div class="badge-name">${b.name}</div>
                </div>
            `).join('')}
        </div>
      </div>
    `;

    this.container.querySelector('.panel__close').addEventListener('click', this.onClose);
  }
}
