// File: js/components/workspace/ListView.js
import { EditableText } from '../ui/EditableText.js';

export class ListView {
  constructor(container, { workspaceStore, kanbanStore, onFocus, onOpenDetail }) {
    this.container = container;
    this.props = { workspaceStore, kanbanStore, onFocus, onOpenDetail };

    this.props.kanbanStore.on('change', () => this.render());

    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = 'list-view';
    this.container.style.maxWidth = '800px';
    this.container.style.margin = '0 auto';
    this.container.style.padding = '24px';

    const activeWs = this.props.workspaceStore.getActive();
    if (!activeWs) return;

    // Header
    const header = document.createElement('h2');
    header.textContent = activeWs.name + ' Tasks';
    header.style.marginBottom = '24px';
    header.style.fontWeight = '400';
    this.container.appendChild(header);

    // Get columns and sort
    const columns = [...activeWs.columns].sort((a, b) => a.order - b.order);

    // Render each column as a section
    columns.forEach(col => {
      const cards = this.props.kanbanStore.getCardsByColumn(activeWs.id, col.id);

      const section = document.createElement('div');
      section.className = 'list-section';
      section.style.marginBottom = '32px';

      // Column Header
      const colHeader = document.createElement('div');
      colHeader.className = 'list-section__header';
      colHeader.style.cssText = `
        font-size: 0.75rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
      `;
      colHeader.innerHTML = `<span>${col.title}</span><span>${cards.length}</span>`;
      section.appendChild(colHeader);

      // Cards
      cards.forEach(card => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.style.cssText = `
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          margin-bottom: 4px;
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
          transition: background 0.2s;
        `;

        item.addEventListener('mouseenter', () => item.style.background = 'rgba(255,255,255,0.05)');
        item.addEventListener('mouseleave', () => item.style.background = 'rgba(255,255,255,0.02)');

        // Status dot
        const status = document.createElement('div');
        status.style.cssText = `
          width: 8px; height: 8px; border-radius: 50%; 
          background: ${col.id.includes('done') ? 'var(--text-gold)' : 'var(--text-muted)'};
          flex-shrink: 0;
        `;

        // Title
        const titleDiv = document.createElement('div');
        titleDiv.style.flex = '1';
        new EditableText(titleDiv, {
          value: card.title,
          onSave: (val) => this.props.kanbanStore.updateCard(card.id, { title: val })
        });

        // Actions
        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex; gap:8px; opacity:0.3; transition:0.2s;';
        item.addEventListener('mouseenter', () => actions.style.opacity = '1');
        item.addEventListener('mouseleave', () => actions.style.opacity = '0.3');

        const focusBtn = document.createElement('button');
        focusBtn.innerHTML = '▶';
        focusBtn.className = 'icon-btn';
        focusBtn.title = 'Focus on this task';
        focusBtn.onclick = (e) => { e.stopPropagation(); this.props.onFocus(card.id); };

        const detailBtn = document.createElement('button');
        detailBtn.innerHTML = '•••';
        detailBtn.className = 'icon-btn';
        detailBtn.title = 'Open details';
        detailBtn.onclick = (e) => { e.stopPropagation(); this.props.onOpenDetail(card.id); };

        actions.append(focusBtn, detailBtn);
        item.append(status, titleDiv, actions);
        section.appendChild(item);
      });

      if (cards.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'padding: 12px; opacity: 0.4; font-size: 0.85rem;';
        empty.textContent = 'No tasks';
        section.appendChild(empty);
      }

      this.container.appendChild(section);
    });
  }
}
