// File: js/components/workspace/KanbanBoard.js
import { KanbanColumn } from './KanbanColumn.js';
import { EditableText } from '../ui/EditableText.js';

export class KanbanBoard {
  constructor(container, { workspaceStore, kanbanStore, onFocus, onOpenDetail }) {
    this.container = container;
    this.props = { workspaceStore, kanbanStore, onFocus, onOpenDetail };

    // Listen to card changes to re-render
    this.props.kanbanStore.on('change', () => this.render());
    this.props.workspaceStore.on('column:created', () => this.render());
    this.props.workspaceStore.on('column:updated', () => this.render());
    this.props.workspaceStore.on('column:deleted', () => this.render());

    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = 'kanban-board';

    const activeWs = this.props.workspaceStore.getActive();
    if (!activeWs) return;

    // Sort columns by order
    const columns = [...activeWs.columns].sort((a, b) => a.order - b.order);

    columns.forEach(col => {
      const colContainer = document.createElement('div');
      this.container.appendChild(colContainer);
      new KanbanColumn(colContainer, col, activeWs.id, this.props);
    });

    // Add Column Button with inline input
    const addColWrapper = document.createElement('div');
    addColWrapper.className = 'add-column-wrapper';
    addColWrapper.style.cssText = 'min-width:280px; flex-shrink:0;';

    addColWrapper.innerHTML = `
      <div id="add-column-trigger" class="kanban-add-column">+ Add Column</div>
      <div id="add-column-input" style="display:none;"></div>
    `;

    this.container.appendChild(addColWrapper);

    // Wire up Add Column
    const trigger = addColWrapper.querySelector('#add-column-trigger');
    const inputContainer = addColWrapper.querySelector('#add-column-input');

    trigger.addEventListener('click', () => {
      trigger.style.display = 'none';
      inputContainer.style.display = 'block';

      new EditableText(inputContainer, {
        value: '',
        placeholder: 'Column name...',
        onSave: (name) => {
          if (name.trim()) {
            this.props.workspaceStore.addColumn(activeWs.id, name.trim());
          }
          trigger.style.display = 'block';
          inputContainer.style.display = 'none';
          inputContainer.innerHTML = '';
        },
        onCancel: () => {
          trigger.style.display = 'block';
          inputContainer.style.display = 'none';
          inputContainer.innerHTML = '';
        }
      });
    });
  }
}
