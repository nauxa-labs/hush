import { Store } from './Store.js';

export class WorkspaceStore extends Store {
  constructor() {
    super('hush_workspaces_v2');
    if (!this.data || this.data.workspaces.length === 0) {
      this.data = { activeId: null, workspaces: [] };
      this.create('My Workspace', '🏠');
    }
  }

  // --- CRUD ---
  create(name, icon = '📁') {
    const id = 'ws_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const workspace = {
      id,
      name,
      icon,
      viewMode: 'board',
      columns: [
        { id: 'col_' + Date.now() + '_1', title: 'To Do', order: 0 },
        { id: 'col_' + Date.now() + '_2', title: 'In Progress', order: 1 },
        { id: 'col_' + Date.now() + '_3', title: 'Done', order: 2 }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.data.workspaces.push(workspace);
    if (!this.data.activeId) this.data.activeId = id;
    this._commit();
    this.emit('workspace:created', workspace);
    return workspace;
  }

  update(id, updates) {
    const ws = this.getById(id);
    if (!ws) return null;
    Object.assign(ws, updates, { updatedAt: Date.now() });
    this._commit();
    this.emit('workspace:updated', ws);
    return ws;
  }

  delete(id) {
    if (this.data.workspaces.length <= 1) return false; // Prevent deleting last
    this.data.workspaces = this.data.workspaces.filter(w => w.id !== id);
    if (this.data.activeId === id) {
      this.data.activeId = this.data.workspaces[0]?.id || null;
    }
    this._commit();
    this.emit('workspace:deleted', { id });
    return true;
  }

  // --- Getters ---
  getById(id) {
    return this.data.workspaces.find(w => w.id === id);
  }

  getActive() {
    return this.getById(this.data.activeId);
  }

  getAll() {
    return this.data.workspaces;
  }

  // --- Actions ---
  setActive(id) {
    if (!this.getById(id)) return false;
    this.data.activeId = id;
    this._commit();
    this.emit('workspace:switched', this.getActive());
    return true;
  }

  setViewMode(id, mode) {
    return this.update(id, { viewMode: mode });
  }

  // --- Column Management ---
  addColumn(workspaceId, title) {
    const ws = this.getById(workspaceId);
    if (!ws) return null;
    const column = {
      id: 'col_' + Date.now(),
      title,
      order: ws.columns.length
    };
    ws.columns.push(column);
    ws.updatedAt = Date.now();
    this._commit();
    this.emit('column:created', { workspaceId, column });
    return column;
  }

  updateColumn(workspaceId, columnId, updates) {
    const ws = this.getById(workspaceId);
    const col = ws?.columns.find(c => c.id === columnId);
    if (!col) return null;
    Object.assign(col, updates);
    ws.updatedAt = Date.now();
    this._commit();
    this.emit('column:updated', { workspaceId, column: col });
    return col;
  }

  deleteColumn(workspaceId, columnId) {
    const ws = this.getById(workspaceId);
    if (!ws || ws.columns.length <= 1) return false; // Keep at least 1
    ws.columns = ws.columns.filter(c => c.id !== columnId);
    ws.updatedAt = Date.now();
    this._commit();
    this.emit('column:deleted', { workspaceId, columnId });
    return true;
  }

  reorderColumns(workspaceId, orderedIds) {
    const ws = this.getById(workspaceId);
    if (!ws) return false;
    ws.columns.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
    ws.columns.forEach((c, i) => c.order = i);
    ws.updatedAt = Date.now();
    this._commit();
    return true;
  }
}
