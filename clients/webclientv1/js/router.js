class Router {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pages = {};
    this.authService = null;
    
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (hash) this.load(hash);
    });
  }

  setAuthService(authService) {
    this.authService = authService;
  }

  register(pageName, htmlPath, pageScript, isProtected = false) {
    this.pages[pageName] = { htmlPath, pageScript, isProtected };
  }

  async load(pageName) {
    const page = this.pages[pageName];
    if (!page) return console.error('[Router] Page not registered:', pageName);

    const isAuthenticated = this.authService?.isAuthenticated();

    if (isAuthenticated && ['login', 'register'].includes(pageName)) {
      return window.location.hash = '#dashboard';
    }

    if (!isAuthenticated && page.isProtected) {
      return window.location.hash = '#login';
    }

    try {
      const html = await fetch(page.htmlPath).then(res => res.text());
      this.container.innerHTML = html;
      page.pageScript?.init();
    } catch (error) {
      console.error('[Router] Error loading page:', error.message);
    }
  }

  navigate(pageName) {
    window.location.hash = `#${pageName}`;
  }
}

const router = new Router('page-container');
