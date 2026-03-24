class HeaderComponent {
  static instance = null;

  constructor() {
    this.userDisplay = null;
    this.logoutBtn = null;
    this.loginLink = null;
    this.appTitle = null;
    this.appDescription = null;
  }

  static getInstance() {
    if (HeaderComponent.instance === null) {
      HeaderComponent.instance = new HeaderComponent();
    }
    return HeaderComponent.instance;
  }

  async init() {
    try {
      await this.loadHeaderHTML();
      await this.loadConfig();
      this.cacheElements();
      this.attachEventListeners();
      this.update();
      
      // Listen for auth state changes
      document.addEventListener('authStateChanged', () => {
        console.debug('[HeaderComponent] Auth state changed, updating header');
        this.update();
      });
      
      console.log('✓ HeaderComponent initialized');
    } catch (error) {
      console.error('[HeaderComponent] ERROR:', error);
    }
  }

  async loadHeaderHTML() {
    try {
      const response = await fetch('pages/header.html');
      const html = await response.text();
      document.getElementById('app-header').innerHTML = html;
    } catch (error) {
      console.error('[HeaderComponent] Failed to load header HTML:', error);
    }
  }

  async loadConfig() {
    try {
      const response = await fetch('config/config.json');
      const config = await response.json();
      document.title = config.app.title;
      this.appTitle = config.app.header.h1;
      this.appDescription = config.app.header.p;
    } catch (error) {
      console.error('[HeaderComponent] Failed to load config:', error);
    }
  }

  cacheElements() {
    try {
      this.userDisplay = document.getElementById('user-display');
      this.logoutBtn = document.getElementById('header-logout-btn');
      this.loginLink = document.getElementById('login-link');
      
      document.getElementById('app-title').textContent = this.appTitle;
      document.getElementById('app-description').textContent = this.appDescription;
    } catch (error) {
      console.error('[HeaderComponent] Failed to cache elements:', error);
    }
  }

  attachEventListeners() {
    if (this.logoutBtn && !this.logoutBtn._listenerAttached) {
      this.logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleLogout();
      });
      this.logoutBtn._listenerAttached = true;
    }
    
    if (this.loginLink && !this.loginLink._listenerAttached) {
      this.loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '#login';
      });
      this.loginLink._listenerAttached = true;
    }
  }

  update() {
    const isAuthenticated = authService.isAuthenticated();
    const userData = authService.getUserData();

    if (isAuthenticated && userData) {
      this.userDisplay.textContent = `Welcome, ${userData.email}`;
      this.logoutBtn.style.display = 'inline-block';
      this.loginLink.style.display = 'none';
    } else {
      this.userDisplay.textContent = '';
      this.logoutBtn.style.display = 'none';
      this.loginLink.style.display = 'inline-block';
    }
  }

  async handleLogout() {
    console.debug('[HeaderComponent] handleLogout() called');
    try {
      await authService.logout();
      console.debug('[HeaderComponent] Logout completed, updating header');
      this.update();
      document.dispatchEvent(new Event('authStateChanged'));
      
      console.debug('[HeaderComponent] Redirecting to login page');
      setTimeout(() => {
        window.location.href = '#login';
      }, 500);
      
    } catch (error) {
      console.error('[HeaderComponent] Logout error:', error);
      authService.clearAuth();
      this.update();
      document.dispatchEvent(new Event('authStateChanged'));
      
      console.debug('[HeaderComponent] Error logout, redirecting to login page');
      setTimeout(() => {
        window.location.href = '#login';
      }, 500);
    }
  }

}

window.HeaderComponent = HeaderComponent;
