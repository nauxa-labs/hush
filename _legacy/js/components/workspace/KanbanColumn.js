// File: js/components/workspace/KanbanColumn.js
import { EditableText } from '../ui/EditableText.js';
import { TaskCard } from './TaskCard.js';

export class KanbanColumn {
  constructor(container, column, workspaceId, { workspaceStore, kanbanStore, onFocus, onOpenDetail }) {
    this.container = container;
    this.column = column;
    this.workspaceId = workspaceId;
    this.props = { workspaceStore, kanbanStore, onFocus, onOpenDetail };

    this.render();
  }

  render() {
    const cards = this.props.kanbanStore.getCardsByColumn(this.workspaceId, this.column.id);

    // Mapped to .board-col in main.css
    this.container.className = 'board-col';
    this.container.dataset.id = this.column.id;

    this.container.innerHTML = `
      <div class="col-header">
        <div class="col-title" id="col-title-${this.column.id}"></div>
        <div style="font-size:10px; opacity:0.5;">${cards.length}</div>
      </div>
      
      <div class="col-body" style="min-height:100px;">
        <!-- Cards -->
      </div>
      
      <button class="icon-btn" id="add-card-${this.column.id}" style="width:100%; text-align:left; font-size:12px; opacity:0.5; margin-top:10px;">+ Add Task</button>
    `;

    // Title
    new EditableText(this.container.querySelector(`#col-title-${this.column.id}`), {
      value: this.column.title,
      onSave: (val) => this.props.workspaceStore.updateColumn(this.workspaceId, this.column.id, { title: val })
    });

    // Cards
    const body = this.container.querySelector('.col-body');
    cards.forEach(card => {
      const wrapper = document.createElement('div');
      body.appendChild(wrapper);
      new TaskCard(wrapper, card, this.props);
    });

    this._attachEvents(body);
  }

  _attachEvents(body) {
    // Add Card
    this.container.querySelector(`#add-card-${this.column.id}`).addEventListener('click', () => {
      this.props.kanbanStore.createCard(this.workspaceId, this.column.id, 'New Task');
    });

    // Drop
    this.container.addEventListener('dragover', e => {
      e.preventDefault();
      this.container.style.background = 'rgba(255,255,255,0.02)';
    });
    this.container.addEventListener('dragleave', () => {
      this.container.style.background = 'transparent';
    });
    this.container.addEventListener('drop', e => {
      e.preventDefault();
      this.container.style.background = 'transparent';
      const cardId = e.dataTransfer.getData('text/plain');
      if (cardId) this.props.kanbanStore.moveCard(cardId, this.column.id, 9999);
    });
  }
}
