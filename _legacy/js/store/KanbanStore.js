import { Store } from './Store.js';

export class KanbanStore extends Store {
  constructor() {
    super('hush_kanban_v2');
    if (!this.data) {
      this.data = { cards: {} }; // id -> card
    }
  }

  // --- CRUD ---
  createCard(workspaceId, columnId, title) {
    const id = 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const cardsInColumn = this.getCardsByColumn(workspaceId, columnId);
    const card = {
      id,
      workspaceId,
      columnId,
      title,
      content: '',
      tags: [],
      subtasks: [],
      order: cardsInColumn.length,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.data.cards[id] = card;
    this._commit();
    this.emit('card:created', card);
    return card;
  }

  updateCard(id, updates) {
    const card = this.data.cards[id];
    if (!card) return null;
    Object.assign(card, updates, { updatedAt: Date.now() });
    this._commit();
    this.emit('card:updated', card);
    return card;
  }

  deleteCard(id) {
    if (!this.data.cards[id]) return false;
    delete this.data.cards[id];
    this._commit();
    this.emit('card:deleted', { id });
    return true;
  }

  // --- Getters ---
  getCard(id) {
    return this.data.cards[id];
  }

  getCardsByWorkspace(workspaceId) {
    return Object.values(this.data.cards)
      .filter(c => c.workspaceId === workspaceId)
      .sort((a, b) => a.order - b.order);
  }

  getCardsByColumn(workspaceId, columnId) {
    return Object.values(this.data.cards)
      .filter(c => c.workspaceId === workspaceId && c.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }

  // --- Actions ---
  moveCard(cardId, targetColumnId, targetIndex) {
    const card = this.data.cards[cardId];
    if (!card) return false;

    const oldColumnId = card.columnId;
    const workspaceId = card.workspaceId;

    // Update column reference
    card.columnId = targetColumnId;

    // Reorder cards in target column
    const targetCards = this.getCardsByColumn(workspaceId, targetColumnId)
      .filter(c => c.id !== cardId);
    targetCards.splice(targetIndex, 0, card);
    targetCards.forEach((c, i) => c.order = i);

    // Reorder cards in old column (if different)
    if (oldColumnId !== targetColumnId) {
      const oldCards = this.getCardsByColumn(workspaceId, oldColumnId);
      oldCards.forEach((c, i) => c.order = i);
    }

    card.updatedAt = Date.now();
    this._commit();
    this.emit('card:moved', { cardId, oldColumnId, newColumnId: targetColumnId });
    return true;
  }

  // --- Subtasks ---
  addSubtask(cardId, text) {
    const card = this.data.cards[cardId];
    if (!card) return null;
    const subtask = {
      id: 'st_' + Date.now(),
      text,
      done: false
    };
    card.subtasks.push(subtask);
    card.updatedAt = Date.now();
    this._commit();
    return subtask;
  }

  toggleSubtask(cardId, subtaskId) {
    const card = this.data.cards[cardId];
    const subtask = card?.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return false;
    subtask.done = !subtask.done;
    card.updatedAt = Date.now();
    this._commit();
    return true;
  }

  deleteSubtask(cardId, subtaskId) {
    const card = this.data.cards[cardId];
    if (!card) return false;
    card.subtasks = card.subtasks.filter(s => s.id !== subtaskId);
    card.updatedAt = Date.now();
    this._commit();
    return true;
  }
}
