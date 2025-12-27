// File: js/components/panels/CardDetailPanel.js
import { EditableText } from '../ui/EditableText.js';
import { Icons } from '../../utils/Icons.js';

export class CardDetailPanel {
  constructor(container, { cardId, kanbanStore, onClose }) {
    this.container = container;
    this.cardId = cardId;
    this.store = kanbanStore;
    this.onClose = onClose;

    this.render();
  }

  render() {
    const card = this.store.getCard(this.cardId);
    if (!card) {
      this.container.innerHTML = '<div class="panel__content">Card not found</div>';
      return;
    }

    this.container.innerHTML = `
      <div class="panel__header">
        <div class="panel__title">
           ${Icons.Edit} DETAILS
        </div>
        <button class="panel__close">${Icons.Close}</button>
      </div>
      
      <div class="panel__content">
        <div class="detail-group">
            <div id="detail-title" class="detail-title"></div>
        </div>
        
        <div class="detail-group">
            <h3 class="panel__section-title">NOTES</h3>
            <div id="detail-content" class="detail-content-area"></div>
        </div>
        
        <div class="detail-group">
            <h3 class="panel__section-title">SUBTASKS</h3>
            <div class="subtask-list" id="subtask-list">
                ${card.subtasks.map(st => `
                    <div class="subtask-item">
                        <input type="checkbox" class="subtask-checkbox" data-id="${st.id}" ${st.done ? 'checked' : ''}>
                        <span class="subtask-text ${st.done ? 'done' : ''}">${st.text}</span>
                        <button class="subtask-delete icon-btn" data-id="${st.id}">${Icons.Close}</button>
                    </div>
                `).join('')}
            </div>
            <div id="add-subtask-container"></div>
        </div>

        <div class="detail-actions">
             <button class="btn-danger-outline" id="delete-card-btn">Delete Card</button>
        </div>
      </div>
    `;

    new EditableText(this.container.querySelector('#detail-title'), {
      value: card.title,
      onSave: (val) => this.store.updateCard(card.id, { title: val })
    });

    new EditableText(this.container.querySelector('#detail-content'), {
      value: card.content,
      multiline: true,
      placeholder: 'Add detailed notes...',
      className: 'markdown-editor',
      onSave: (val) => this.store.updateCard(card.id, { content: val })
    });

    new EditableText(this.container.querySelector('#add-subtask-container'), {
      value: '',
      placeholder: '+ Add subtask',
      onSave: (val) => {
        if (val.trim()) {
          this.store.addSubtask(card.id, val);
          this.render();
        }
      }
    });

    this._attachEventListeners(card);
  }

  _attachEventListeners(card) {
    this.container.querySelector('.panel__close').addEventListener('click', this.onClose);

    this.container.querySelectorAll('.subtask-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        this.store.toggleSubtask(card.id, e.target.dataset.id);
        this.render();
      });
    });

    this.container.querySelectorAll('.subtask-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.store.deleteSubtask(card.id, e.target.dataset.id);
        this.render();
      });
    });

    const deleteBtn = this.container.querySelector('#delete-card-btn');
    deleteBtn.addEventListener('click', () => {
      if (deleteBtn.dataset.confirm === 'true') {
        this.store.deleteCard(card.id);
        this.onClose();
      } else {
        deleteBtn.dataset.confirm = 'true';
        deleteBtn.textContent = 'Confirm Delete?';
        deleteBtn.classList.add('confirming');

        setTimeout(() => {
          deleteBtn.dataset.confirm = 'false';
          deleteBtn.textContent = 'Delete Card';
          deleteBtn.classList.remove('confirming');
        }, 3000);
      }
    });
  }
}
