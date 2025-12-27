/**
 * Warkop Fokus - Task Manager
 * Simple task list with persistence
 */

class TaskManager {
  constructor() {
    this.tasks = Storage.getTasks();
    this.container = document.getElementById('taskList');
    this.input = document.getElementById('taskInput');
    this.addBtn = document.getElementById('addTaskBtn');

    this.init();
  }

  init() {
    if (this.addBtn) {
      this.addBtn.addEventListener('click', () => this.addTask());
    }
    if (this.input) {
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addTask();
      });
    }
    this.render();
  }

  /**
   * Add a new task
   */
  addTask(text = null) {
    const taskText = text || (this.input ? this.input.value.trim() : '');
    if (!taskText) return;

    const task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.tasks.unshift(task);
    this.save();
    this.render();

    if (this.input) {
      this.input.value = '';
      this.input.focus();
    }
  }

  /**
   * Toggle task completion
   */
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.save();
      this.render();
    }
  }

  /**
   * Delete a task
   */
  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
    this.render();
  }

  /**
   * Clear completed tasks
   */
  clearCompleted() {
    this.tasks = this.tasks.filter(t => !t.completed);
    this.save();
    this.render();
  }

  /**
   * Save tasks to storage
   */
  save() {
    Storage.saveTasks(this.tasks);
  }

  /**
   * Render task list
   */
  render() {
    if (!this.container) return;

    if (this.tasks.length === 0) {
      this.container.innerHTML = `
        <div class="task-empty">
          <span>📝</span>
          <p>Belum ada task. Tambahkan sesuatu untuk dikerjakan!</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = this.tasks.map(task => `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <button class="task-check" onclick="taskManager.toggleTask(${task.id})">
          ${task.completed ? '✓' : ''}
        </button>
        <span class="task-text">${this.escapeHtml(task.text)}</span>
        <button class="task-delete" onclick="taskManager.deleteTask(${task.id})">
          ✕
        </button>
      </div>
    `).join('');
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get active tasks count
   */
  getActiveCount() {
    return this.tasks.filter(t => !t.completed).length;
  }

  /**
   * Get completed tasks count
   */
  getCompletedCount() {
    return this.tasks.filter(t => t.completed).length;
  }
}

let taskManager;
