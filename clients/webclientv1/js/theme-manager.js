/**
 * Theme Manager
 * Handles theme switching and persistence
 */

class ThemeManager {
  static instance = null; // Static property to hold the singleton instance

  constructor() {
    this.storageKey = 'selectedTheme';
    this.defaultTheme = 'default';
    this.availableThemes = ['default', 'dark'];
    this.currentTheme = null;
  }

  // Static method to get or create instance (singleton)
  static getInstance() {
    if (ThemeManager.instance === null) {
      console.log('Creating new ThemeManager instance');
      ThemeManager.instance = new ThemeManager();
    } else {
      console.log('Returning existing ThemeManager instance');
    }
    return ThemeManager.instance;
  }

  /**
   * Initialize theme manager
   */

  init() {
    console.log('🎨 Initializing Theme Manager');
    
    // Load saved theme or use default
    const savedTheme = this.getSavedTheme();
    this.setTheme(savedTheme);
    
    // Create theme switcher UI
    this.createThemeSwitcher();
    
    console.log('✅ Theme Manager initialized');
  }

  /**
   * Get saved theme from localStorage
   */
  getSavedTheme() {
    const saved = localStorage.getItem(this.storageKey);
    
    if (saved && this.availableThemes.includes(saved)) {
      console.log(`📖 Restored theme: ${saved}`);
      return saved;
    }
    
    console.log(`📖 Using default theme: ${this.defaultTheme}`);
    return this.defaultTheme;
  }

  /**
   * Set active theme by dynamically loading CSS
   */
  setTheme(themeName) {
    if (!this.availableThemes.includes(themeName)) {
      console.warn(`⚠️  Theme not found: ${themeName}, using default`);
      themeName = this.defaultTheme;
    }

    console.log(`🎨 Switching to theme: ${themeName}`);

    // Remove old theme stylesheets
    this.removeThemeStylesheets();

    // Load new theme stylesheets
    this.loadThemeStylesheets(themeName);

    // Save preference
    this.currentTheme = themeName;
    localStorage.setItem(this.storageKey, themeName);

    // Update switcher UI
    this.updateSwitcherUI();

    console.log(`✅ Theme changed to: ${themeName}`);
  }

  /**
   * Remove all theme stylesheets (keep base.css)
   */
  removeThemeStylesheets() {
    const links = document.querySelectorAll('link[data-theme]');
    links.forEach(link => {
      link.remove();
      console.log(`  🗑️  Removed: ${link.href}`);
    });
  }

  /**
   * Load theme stylesheets dynamically
   */
  async loadThemeStylesheets(themeName) {
    const response = await fetch('config/styles.json');
    const config = await response.json();

    // Load theme files from config
    config.theme.forEach(file => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `css/${themeName}/${file}`;
      link.setAttribute('data-theme', themeName);
      document.head.appendChild(link);
    });
  }

  /**
   * Create theme switcher UI in header
   */
  createThemeSwitcher() {
    const container = document.getElementById('theme-switcher-container');
    
    if (!container) {
      console.warn('⚠️ Theme switcher container not found');
      return;
    }

    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';
    switcher.innerHTML = `
      <div class="custom-select">
        <button class="select-button" id="theme-button">${this.capitalize(this.currentTheme)}</button>
        <div class="select-dropdown" id="theme-dropdown" style="display: none;">
          ${this.availableThemes
            .map(theme => 
              `<div class="select-option" data-value="${theme}" ${theme === this.currentTheme ? 'selected' : ''}>
                ${this.capitalize(theme)}
              </div>`
            )
            .join('')}
        </div>
      </div>
    `;

    container.appendChild(switcher);

    const button = document.getElementById('theme-button');
    const dropdown = document.getElementById('theme-dropdown');
    const options = document.querySelectorAll('.select-option');

    button.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    options.forEach(option => {
      option.addEventListener('click', (e) => {
        const theme = e.target.dataset.value;
        this.setTheme(theme);
        dropdown.style.display = 'none';
      });
    });

    document.addEventListener('click', (e) => {
      if (!switcher.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }


  /**
   * Update switcher UI to reflect current theme
   */
  updateSwitcherUI() {
    const select = document.getElementById('theme-select');
    if (select) {
      select.value = this.currentTheme;
    }
  }

  /**
   * Get list of available themes
   */
  getAvailableThemes() {
    return this.availableThemes;
  }

  /**
   * Get current active theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Helper: capitalize string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}

// EXPORT TO WINDOW
window.ThemeManager = ThemeManager;