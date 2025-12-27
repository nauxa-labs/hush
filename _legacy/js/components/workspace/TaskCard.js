// File: js/components/workspace/TaskCard.js
import { EditableText } from '../ui/EditableText.js';
import { Icons } from '../../utils/Icons.js';

export class TaskCard {
  constructor(container, card, { kanbanStore, onFocus, onOpenDetail }) {
    this.container = container;
    this.card = card;
    this.store = kanbanStore;
    this.onFocus = onFocus;
    this.onOpenDetail = onOpenDetail;

    this.render();
  }

  render() {
    // Mapped to .task-item in main.css
    this.container.className = 'task-item';
    this.container.id = `card-${this.card.id}`;
    this.container.draggable = true;

    this.container.innerHTML = `
        <div class="task-title" id="title-edit-${this.card.id}"></div>
        <div class="task-meta">
            ${this.card.subtasks.length > 0 ? `<span>${this.card.subtasks.filter(s => s.done).length}/${this.card.subtasks.length}</span>` : ''}
            ${this.card.content ? '<span>Note</span>' : ''}
        </div>
        
        <div style="margin-top:12px; display:flex; gap:10px; opacity:0.3;" class="hover-controls">
            <button class="icon-btn small" data-action="focus">▶</button>
            <button class="icon-btn small" data-action="detail">•••</button>
        </div>
    `;

    // Inline Edit
    new EditableText(this.container.querySelector(`#title-edit-${this.card.id}`), {
      value: this.card.title,
      onSave: (val) => this.store.updateCard(this.card.id, { title: val })
    });

    this._attachDragEvents();
    this._attachClickEvents();
  }

  _attachDragEvents() {
    this.container.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', this.card.id);
      this.container.style.opacity = '0.5';
    });
    this.container.addEventListener('dragend', () => {
      this.container.style.opacity = '1';
    });
  }

  _attachClickEvents() {
    // Double click to open
    this.container.addEventListener('dblclick', (e) => {
      if (!e.target.closest('.editable-text')) this.onOpenDetail(this.card.id);
    });

    this.container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.dataset.action === 'focus') this.onFocus(this.card.id);
        if (btn.dataset.action === 'detail') this.onOpenDetail(this.card.id);
      });
    });
  }
}
