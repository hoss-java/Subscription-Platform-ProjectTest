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
    return HeaderComponent.instance ||= new HeaderComponent();
  }

  async init() {
    try {
      await Promise.all([this.loadHeaderHTML(), this.loadConfig()]);
      this.cacheElements();
      this.attachEventListeners();
      this.update();
      document.addEventListener('authStateChanged', () => this.update());
      console.log('✓ HeaderComponent initialized');
    } catch (error) {
      console.error('[HeaderComponent] ERROR:', error);
    }
  }

  async loadHeaderHTML() {
    try {
      document.getElementById('app-header').innerHTML = await (await fetch('pages/header.html')).text();
    } catch (error) {
      console.error('[HeaderComponent] Failed to load header HTML:', error);
    }
  }

  async loadConfig() {
    try {
      const config = await (await fetch('config/config.json')).json();
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
    this.logoutBtn?.addEventListener('click', (e) => (e.preventDefault(), this.handleLogout()));
    this.loginLink?.addEventListener('click', (e) => (e.preventDefault(), window.location.href = '#login'));
  }

  update() {
    const isAuthenticated = authService.isAuthenticated();
    const userData = authService.getUserData();
    const isAuth = isAuthenticated && userData;

    this.userDisplay.textContent = isAuth ? `Welcome, ${userData.email}` : '';
    this.logoutBtn.style.display = isAuth ? 'inline-block' : 'none';
    this.loginLink.style.display = isAuth ? 'none' : 'inline-block';
  }

  async handleLogout() {
    const redirect = () => setTimeout(() => window.location.href = '#login', 500);
    try {
      await authService.logout();
    } catch (error) {
      console.error('[HeaderComponent] Logout error:', error);
      authService.clearAuth();
    } finally {
      this.update();
      document.dispatchEvent(new Event('authStateChanged'));
      redirect();
    }
  }
}

window.HeaderComponent = HeaderComponent;
