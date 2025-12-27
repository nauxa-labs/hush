// File: js/components/ui/IconButton.js
export class IconButton {
  constructor(container, options) {
    this.container = container;
    this.options = {
      icon: '',
      title: '',
      items: [], // For dropdown/menu buttons
      onClick: () => { },
      className: '',
      ...options
    };
    this.render();
  }

  render() {
    const btn = document.createElement('button');
    btn.className = `icon-button ${this.options.className}`;
    btn.title = this.options.title;
    btn.innerHTML = this.options.icon;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.options.onClick(e);
    });

    this.container.appendChild(btn);
  }
}
