const SettingsSection = {
  init() {
    console.debug('[SettingsSection] Page initialized');
    
    setTimeout(() => {
      console.debug('[SettingsSection] Starting settings section initialization');
      
      // Populate theme options from ThemeManager
      this.populateThemeOptions();
      
      // Load saved settings
      this.loadSettings();
      
      // Attach event listeners
      this.attachEventListeners();
      
      console.debug('[SettingsSection] Settings section initialization complete');
    }, 100);
  },

  populateThemeOptions() {
    console.debug('[SettingsSection] populateThemeOptions() called');
    
    const themeSelector = document.getElementById('theme-selector');
    if (!themeSelector) return;

    const themeManager = ThemeManager.getInstance();
    const availableThemes = themeManager.getAvailableThemes();

    // Clear existing options
    themeSelector.innerHTML = '';

    // Populate with themes from ThemeManager
    availableThemes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme;
      option.textContent = this.capitalize(theme);
      themeSelector.appendChild(option);
    });

    console.debug('[SettingsSection] Theme options populated:', availableThemes);
  },

  loadSettings() {
    console.debug('[SettingsSection] loadSettings() called');
    
    try {
      // Load theme preference from ThemeManager
      const themeSelector = document.getElementById('theme-selector');
      if (themeSelector) {
        const themeManager = ThemeManager.getInstance();
        const currentTheme = themeManager.getCurrentTheme();
        themeSelector.value = currentTheme;
        console.debug('[SettingsSection] Theme preference loaded:', currentTheme);
      }

      // Load notification preference
      const notificationsCheckbox = document.getElementById('notifications-enabled');
      if (notificationsCheckbox) {
        const notificationsEnabled = localStorage.getItem('notifications_enabled') !== 'false';
        notificationsCheckbox.checked = notificationsEnabled;
        console.debug('[SettingsSection] Notifications preference loaded:', notificationsEnabled);
      }
    } catch (error) {
      console.error('[SettingsSection] Error loading settings:', error.message);
    }
  },

  attachEventListeners() {
    console.debug('[SettingsSection] attachEventListeners() called');
    
    // Save button
    const saveBtn = document.getElementById('settings-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.debug('[SettingsSection] Save button clicked');
        this.handleSaveSettings(e);
      });
      console.debug('[SettingsSection] Save button listener attached');
    }

    // Theme selector
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
      themeSelector.addEventListener('change', (e) => {
        console.debug('[SettingsSection] Theme selector changed:', e.target.value);
      });
      console.debug('[SettingsSection] Theme selector listener attached');
    }

    // Notifications checkbox
    const notificationsCheckbox = document.getElementById('notifications-enabled');
    if (notificationsCheckbox) {
      notificationsCheckbox.addEventListener('change', (e) => {
        console.debug('[SettingsSection] Notifications checkbox changed:', e.target.checked);
      });
      console.debug('[SettingsSection] Notifications checkbox listener attached');
    }
  },

  async handleSaveSettings(e) {
    console.debug('[SettingsSection] handleSaveSettings() called');
    
    const themeSelector = document.getElementById('theme-selector');
    const notificationsCheckbox = document.getElementById('notifications-enabled');
    const saveBtn = document.getElementById('settings-save-btn');

    const settings = {
      theme: themeSelector ? themeSelector.value : 'default',
      notifications: notificationsCheckbox ? notificationsCheckbox.checked : true
    };

    console.debug('[SettingsSection] Saving settings:', settings);

    // Show loading state
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      // Apply theme using ThemeManager
      if (settings.theme) {
        const themeManager = ThemeManager.getInstance();
        themeManager.setTheme(settings.theme);
        console.debug('[SettingsSection] Theme applied via ThemeManager:', settings.theme);
      }

      // Save notifications preference to localStorage
      localStorage.setItem('notifications_enabled', settings.notifications);
      console.debug('[SettingsSection] Notifications setting saved:', settings.notifications);
      
      // Show success message only if notifications are enabled
      if (settings.notifications) {
        this.showSuccess('Settings saved successfully');
      }

    } catch (error) {
      console.error('[SettingsSection] Error saving settings:', error.message);
      // Always show error messages regardless of notification setting
      this.showError('Failed to save settings: ' + error.message);
    } finally {
      // Restore button state
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  },

  applyTheme(themeName) {
    try {
      const themeManager = ThemeManager.getInstance();
      themeManager.setTheme(themeName);
      console.debug('[SettingsSection] Theme applied immediately:', themeName);
    } catch (error) {
      console.error('[SettingsSection] Error applying theme:', error.message);
    }
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  isNotificationsEnabled() {
    return localStorage.getItem('notifications_enabled') !== 'false';
  },

  showError(message) {
    console.debug('[SettingsSection] showError() called:', message);
    const uiController = UIController.getInstance();
    // Always show errors regardless of notification setting
    uiController.showMessage(message, 'error');
  },

  showSuccess(message) {
    console.debug('[SettingsSection] showSuccess() called:', message);
    // Only show success if notifications are enabled
    if (this.isNotificationsEnabled()) {
      const uiController = UIController.getInstance();
      uiController.showMessage(message, 'success');
    }
  },

  cleanup() {
    console.debug('[SettingsSection] cleanup() called');
  }
};

window.SettingsSection = SettingsSection;
