// File: js/components/layout/TopBar.js
import { EditableText } from '../ui/EditableText.js';
import { Icons } from '../../utils/Icons.js';

export class TopBar {
  constructor(container, { workspaceStore, onToggleFocus }) {
    this.container = container;
    this.store = workspaceStore;
    this.onToggleFocus = onToggleFocus;

    this.store.on('workspace:switched', () => this.render());
    this.store.on('workspace:updated', () => this.render());

    this.render();
  }

  render() {
    const activeWs = this.store.getActive();
    if (!activeWs) return; // Should not happen

    this.container.innerHTML = `
      <div class="top-left">
         <!-- Name is editable, but styled simply -->
         <div id="ws-name-editor" style="font-size:18px; font-weight:300; letter-spacing:-0.5px;"></div>
      </div>
      
      <div class="view-toggles">
         <button class="icon-btn ${activeWs.viewMode === 'board' ? 'active' : ''}" data-mode="board" title="Board View">
            ${Icons.Board}
         </button>
         <button class="icon-btn ${activeWs.viewMode === 'list' ? 'active' : ''}" data-mode="list" title="List View">
            ${Icons.List}
         </button>
         
         <div style="width:1px; background:rgba(255,255,255,0.1); height:16px; margin:0 10px;"></div>
         
         <button class="focus-trigger" id="focus-btn">
            FOCUS MODE
         </button>
      </div>
    `;

    // Editable Name
    new EditableText(this.container.querySelector('#ws-name-editor'), {
      value: activeWs.name,
      onSave: (val) => this.store.update(activeWs.id, { name: val })
    });

    // Events
    this.container.querySelectorAll('.icon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.mode) this.store.setViewMode(activeWs.id, btn.dataset.mode);
      });
    });

    this.container.querySelector('#focus-btn').addEventListener('click', () => {
      this.onToggleFocus();
    });
  }
}
