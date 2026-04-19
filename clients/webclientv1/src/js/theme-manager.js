/**
 * Theme Manager - Handles theme switching and persistence
 */
class ThemeManager {
  static #instance;
  static #CONFIG_URL = 'config/styles.json';

  #storageKey = 'selectedTheme';
  #themes = ['default', 'dark'];
  #currentTheme = null;

  constructor() {}

  static getInstance() {
    return this.#instance ??= new ThemeManager();
  }

  async init() {
    this.#currentTheme = this.#getSavedTheme();
    await this.setTheme(this.#currentTheme);
    this.#createSwitcher();
  }

  #getSavedTheme() {
    const saved = localStorage.getItem(this.#storageKey);
    return saved && this.#themes.includes(saved) ? saved : this.#themes[0];
  }

  async setTheme(themeName) {
    if (!this.#themes.includes(themeName)) themeName = this.#themes[0];

    document.querySelectorAll('link[data-theme]').forEach(el => el.remove());
    
    const config = await fetch(ThemeManager.#CONFIG_URL).then(r => r.json());
    config.theme.forEach(file => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `css/${themeName}/${file}`;
      link.setAttribute('data-theme', themeName);
      document.head.appendChild(link);
    });

    this.#currentTheme = themeName;
    localStorage.setItem(this.#storageKey, themeName);
    this.#updateUI();
  }

  #createSwitcher() {
    const container = document.getElementById('theme-switcher-container');
    if (!container) return;

    container.innerHTML = `
      <div class="theme-switcher">
        <button class="select-button" id="theme-button">${this.#capitalize(this.#currentTheme)}</button>
        <div class="select-dropdown" id="theme-dropdown" hidden>
          ${this.#themes.map(theme => 
            `<div class="select-option" data-value="${theme}" ${theme === this.#currentTheme ? 'selected' : ''}>
              ${this.#capitalize(theme)}
            </div>`
          ).join('')}
        </div>
      </div>
    `;

    const button = document.getElementById('theme-button');
    const dropdown = document.getElementById('theme-dropdown');

    button.addEventListener('click', () => dropdown.hidden = !dropdown.hidden);
    
    document.getElementById('theme-dropdown').addEventListener('click', (e) => {
      if (e.target.classList.contains('select-option')) {
        this.setTheme(e.target.dataset.value);
        dropdown.hidden = true;
      }
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) dropdown.hidden = true;
    });
  }

  #updateUI() {
    const button = document.getElementById('theme-button');
    if (button) button.textContent = this.#capitalize(this.#currentTheme);
  }

  #capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
  }

  getAvailableThemes() {
    return this.#themes;
  }

  getCurrentTheme() {
    return this.#currentTheme;
  }
}

window.ThemeManager = ThemeManager;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}