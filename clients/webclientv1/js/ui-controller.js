/**
 * UIController Class
 * Handles all user-facing feedback, notifications, and loading states
 * Responsible for: toast notifications, loading indicators, error handling, and HTML escaping
 */

class UIController {
  static instance = null; // Static property to hold the singleton instance
  /**
   * Initialize UIController
   * @param {Object} config - Configuration object
   * @param {string} config.tabName - Tab identifier for loading element ID
   */
  constructor(config) {
    this.config = config;
  }

  // Static method to get or create instance (singleton)
  static getInstance() {
    if (UIController.instance === null) {
      console.log('Creating new UIController instance');
      UIController.instance = new UIController();
    } else {
      console.log('Returning existing UIController instance');
    }
    return UIController.instance;
  }

  /**
   * Check if notifications are enabled
   */
  areNotificationsEnabled() {
    return localStorage.getItem('notifications_enabled') !== 'false';
  }

  /**
   * Show loading indicator
   * Adds 'show' class to loading element with ID: {tabName}-loading
   */
  showLoading() {
    const loadingEl = document.getElementById(`${this.config.tabName}-loading`);
    if (loadingEl) {
      loadingEl.classList.add('show');
    }
  }

  /**
   * Hide loading indicator
   * Removes 'show' class from loading element with ID: {tabName}-loading
   */
  hideLoading() {
    const loadingEl = document.getElementById(`${this.config.tabName}-loading`);
    if (loadingEl) {
      loadingEl.classList.remove('show');
    }
  }

  /**
   * Show message to user as a toast notification
   * Creates a toast container if it doesn't exist and appends toast element
   * Auto-dismisses after 5 seconds (except for error messages)
   * Respects notification preference from settings
   * 
   * @param {string} message - Message text to display
   * @param {string} type - Toast type: 'success', 'error', 'info', 'warning'
   * @param {Object} details - Optional details object for console logging
   * @param {boolean} forceShow - Force show message even if notifications disabled (for errors)
   */
  showMessage(message, type = 'info', details = null, forceShow = false) {
    console.debug('[MESSAGE] ' + message);
    
    // Check if notifications are enabled (errors always show)
    if (!this.areNotificationsEnabled() && !forceShow && type !== 'error') {
      console.debug('[UIController] Notifications disabled, skipping toast:', message);
      return;
    }

    // Get or create toast container
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon"></span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close notification">×</button>
    `;

    // Add to container
    container.appendChild(toast);

    // Handle close button
    const closeBtn = toast.querySelector('.toast-close');
    const removeToast = () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', removeToast);

    // Log details if provided
    if (details) {
      console.log(`[${type.toUpperCase()}]`, details);
    }

    // Auto-dismiss after 5 seconds (only if not an error)
    if (type !== 'error') {
      setTimeout(removeToast, 5000);
    }
  }

  /**
   * Handle and log errors
   * Displays error message as toast and logs detailed error information to console
   * Errors ALWAYS show regardless of notification setting
   * 
   * @param {string} operation - Operation name (e.g., 'Creating', 'Updating', 'Loading')
   * @param {Error} error - Error object
   * @param {Object} context - Additional context data for debugging
   */
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

    // Force show errors (forceShow = true)
    this.showMessage(
      `Error ${operation.toLowerCase()}: ${error.message}`,
      'error',
      errorDetails,
      true
    );

    console.error(`${operation} error:`, errorDetails);
  }

  /**
   * Escape HTML to prevent XSS attacks
   * Converts HTML special characters to their entity equivalents
   * 
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML-safe string
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  init() {
    console.log('UIController init called');
  }

}

// EXPORT TO WINDOW
window.UIController = UIController;
