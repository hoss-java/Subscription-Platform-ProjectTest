const SettingsSection = {
  _cache: {},
  STORAGE_KEYS: { NOTIFICATIONS: 'notifications_enabled' },
  ELEMENT_IDS: { THEME: 'theme-selector', NOTIFY: 'notifications-enabled', SAVE: 'settings-save-btn' },

  init() {
    console.debug('[SettingsSection] Page initialized');
    setTimeout(() => {
      this.populateThemeOptions();
      this.loadSettings();
      this.attachEventListeners();
      console.debug('[SettingsSection] Settings section initialization complete');
    }, 100);
  },

  getEl(id) { return this._cache[id] ||= document.getElementById(id); },
  getTM() { return this._cache.tm ||= ThemeManager.getInstance(); },
  getUI() { return this._cache.ui ||= UIController.getInstance(); },

  populateThemeOptions() {
    const sel = this.getEl(this.ELEMENT_IDS.THEME);
    if (!sel) return;
    sel.innerHTML = '';
    const frag = document.createDocumentFragment();
    this.getTM().getAvailableThemes().forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      frag.appendChild(opt);
    });
    sel.appendChild(frag);
  },

  loadSettings() {
    const sel = this.getEl(this.ELEMENT_IDS.THEME);
    if (sel) sel.value = this.getTM().getCurrentTheme();
    const cb = this.getEl(this.ELEMENT_IDS.NOTIFY);
    if (cb) cb.checked = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS) !== 'false';
  },

  attachEventListeners() {
    const listeners = [
      [this.ELEMENT_IDS.SAVE, 'click', (e) => { e.preventDefault(); this.handleSaveSettings(e); }],
      [this.ELEMENT_IDS.THEME, 'change', (e) => console.debug('[SettingsSection] Theme:', e.target.value)],
      [this.ELEMENT_IDS.NOTIFY, 'change', (e) => console.debug('[SettingsSection] Notify:', e.target.checked)]
    ];
    listeners.forEach(([id, evt, fn]) => { const el = this.getEl(id); el && el.addEventListener(evt, fn); });
  },

  async handleSaveSettings(e) {
    const sel = this.getEl(this.ELEMENT_IDS.THEME);
    const cb = this.getEl(this.ELEMENT_IDS.NOTIFY);
    const btn = this.getEl(this.ELEMENT_IDS.SAVE);
    const settings = { theme: sel?.value || 'default', notify: cb?.checked ?? true };

    const txt = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      if (settings.theme) this.getTM().setTheme(settings.theme);
      localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, settings.notify);
      if (settings.notify) this.showSuccess('Settings saved successfully');
    } catch (e) {
      this.showError(`Failed to save settings: ${e.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = txt;
    }
  },

  showError(msg) { this.getUI().showMessage(msg, 'error'); },
  showSuccess(msg) { 
    if (localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS) !== 'false') {
      this.getUI().showMessage(msg, 'success');
    }
  },
  cleanup() { this._cache = {}; }
};

window.SettingsSection = SettingsSection;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsSection;
}