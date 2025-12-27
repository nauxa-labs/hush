// File: js/components/layout/SlidePanel.js
export class SlidePanel {
  constructor() {
    this.element = null;
    this.isOpen = false;
    this.currentPanel = null;
    this._createContainer();
  }

  _createContainer() {
    // Create container if not exists
    this.element = document.createElement('div');
    this.element.className = 'slide-panel';
    // Prevent closing when clicking inside
    this.element.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(this.element); // Append to body to overlap everything

    // Close on click outside (this needs to be handled by App global listener or overlay)
    // For now, simpler: we assume a global click listener handles outside clicks
  }

  open(contentHtmlOrComponent) {
    this.element.innerHTML = '';

    if (typeof contentHtmlOrComponent === 'string') {
      this.element.innerHTML = contentHtmlOrComponent;
    } else if (typeof contentHtmlOrComponent === 'object' && contentHtmlOrComponent.render) {
      // It's a component class instance, usually it renders to a passed container
      // But here we need to pass this.element AS the container
      console.warn('SlidePanel: Passed component logic need adaptation. Ensure component accepts container.');
    }

    // Add Close Button if not present
    if (!this.element.querySelector('.panel__close')) {
      // Usually panels render their own header. 
    }

    requestAnimationFrame(() => {
      this.element.classList.add('open');
    });
    this.isOpen = true;
  }

  // Method to mount a component class
  mount(ComponentClass, props = {}) {
    this.element.innerHTML = ''; // Clear previous
    this.currentPanel = new ComponentClass(this.element, {
      ...props,
      onClose: () => this.close()
    });

    requestAnimationFrame(() => {
      this.element.classList.add('open');
    });
    this.isOpen = true;
  }

  close() {
    this.element.classList.remove('open');
    this.isOpen = false;
    this.currentPanel = null;

    // Clean up content after animation
    setTimeout(() => {
      if (!this.isOpen) this.element.innerHTML = '';
    }, 300);
  }

  toggle(ComponentClass, props = {}) {
    if (this.isOpen) {
      this.close();
    } else {
      this.mount(ComponentClass, props);
    }
  }
}
