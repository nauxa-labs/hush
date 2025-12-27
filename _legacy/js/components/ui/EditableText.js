// File: js/components/ui/EditableText.js
export class EditableText {
  constructor(container, options) {
    this.container = container;
    this.options = {
      value: '',
      placeholder: 'Enter text...',
      onSave: () => { },
      onCancel: () => { },
      multiline: false,
      className: '',
      ...options
    };
    this.isEditing = false;
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = `editable-text ${this.options.className}`;

    if (this.isEditing) {
      this._renderEditMode();
    } else {
      this._renderDisplayMode();
    }
  }

  _renderDisplayMode() {
    const span = document.createElement('span');
    span.className = 'editable-text__display';
    span.textContent = this.options.value || this.options.placeholder;
    if (!this.options.value) {
      span.classList.add('editable-text__display--placeholder');
    }
    span.addEventListener('click', () => this.enterEditMode());
    this.container.appendChild(span);
  }

  _renderEditMode() {
    const input = this.options.multiline
      ? document.createElement('textarea')
      : document.createElement('input');

    input.className = 'editable-text__input';
    input.value = this.options.value;
    input.placeholder = this.options.placeholder;

    // Auto-focus
    setTimeout(() => {
      input.focus();
      input.select();
    }, 0);

    // Event handlers
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.options.multiline) {
        e.preventDefault();
        this.save(input.value);
      } else if (e.key === 'Escape') {
        this.cancel();
      }
    });

    input.addEventListener('blur', () => {
      // Small delay to allow click events to fire first
      setTimeout(() => {
        if (this.isEditing) this.save(input.value);
      }, 100);
    });

    this.container.appendChild(input);
  }

  enterEditMode() {
    this.isEditing = true;
    this.render();
  }

  save(newValue) {
    this.isEditing = false;
    this.options.value = newValue;
    this.options.onSave(newValue);
    this.render();
  }

  cancel() {
    this.isEditing = false;
    this.options.onCancel?.();
    this.render();
  }

  setValue(value) {
    this.options.value = value;
    if (!this.isEditing) this.render();
  }
}
