/**
 * UIController Class
 * Handles all user-facing feedback, notifications, and loading states
 */
class UIController {
  static instance = null;

  constructor(config) {
    this.config = config;
  }

  static getInstance() {
    if (!UIController.instance) {
      console.log('Creating new UIController instance');
      UIController.instance = new UIController();
    } else {
      console.log('Returning existing UIController instance');
    }
    return UIController.instance;
  }

  areNotificationsEnabled() {
    return localStorage.getItem('notifications_enabled') !== 'false';
  }

  #toggleLoading(show) {
    document.getElementById(`${this.config.tabName}-loading`)?.classList[show ? 'add' : 'remove']('show');
  }

  showLoading() {
    this.#toggleLoading(true);
  }

  hideLoading() {
    this.#toggleLoading(false);
  }

  showMessage(message, type = 'info', details = null, forceShow = false) {
    console.debug('[MESSAGE] ' + message);
    
    if (!this.areNotificationsEnabled() && !forceShow && type !== 'error') {
      console.debug('[UIController] Notifications disabled, skipping toast:', message);
      return;
    }

    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon"></span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close notification">×</button>
    `;

    container.appendChild(toast);

    const removeToast = () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', removeToast);
    if (details) console.log(`[${type.toUpperCase()}]`, details);
    if (type !== 'error') setTimeout(removeToast, 5000);
  }

  handleError(operation, error, context = {}) {
    const errorDetails = {
      message: error.message,
      type: error.name,
      status: error.status,
      response: error.response,
      context,
      timestamp: new Date().toISOString(),
      operation
    };

    this.showMessage(`Error ${operation.toLowerCase()}: ${error.message}`, 'error', errorDetails, true);
    console.error(`${operation} error:`, errorDetails);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  init() {
    console.log('UIController init called');
  }
}

window.UIController = UIController;
