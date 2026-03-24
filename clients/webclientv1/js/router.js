class Router {
  constructor(containerId) {
    console.debug('[Router] Constructor called with containerId:', containerId);
    this.container = document.getElementById(containerId);
    console.debug('[Router] Container element found:', this.container ? 'yes' : 'no');
    this.pages = {};
    this.authService = null;  // ← Add authService reference
    
    // Listen for hash changes
    console.debug('[Router] Setting up hash change listener');
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1); // Remove '#'
      console.debug('[Router] Hash changed to:', hash);
      if (hash) {
        this.load(hash);
      }
    });
  }

  setAuthService(authService) {
    console.debug('[Router] setAuthService() called');
    this.authService = authService;
  }

  register(pageName, htmlPath, pageScript, isProtected = false) {
    console.debug('[Router] Registering page:', {
      pageName,
      htmlPath,
      isProtected,
      hasPageScript: !!pageScript,
      scriptHasInit: pageScript && typeof pageScript.init === 'function'
    });
    this.pages[pageName] = { htmlPath, pageScript, isProtected };
  }

  async load(pageName) {
    console.debug('[Router] load() called for page:', pageName);
    
    const page = this.pages[pageName];
    if (!page) {
      console.error('[Router] Page not registered:', pageName);
      return;
    }

    // ← Check if user is authenticated
    const isAuthenticated = this.authService && this.authService.isAuthenticated();
    console.debug('[Router] User authenticated:', isAuthenticated);

    // ← Redirect authenticated users away from auth pages
    if (isAuthenticated && (pageName === 'login' || pageName === 'register')) {
      console.log('[Router] Authenticated user trying to access auth page, redirecting to dashboard');
      window.location.hash = '#dashboard';
      return;
    }

    // ← Redirect unauthenticated users away from protected pages
    if (!isAuthenticated && page.isProtected) {
      console.log('[Router] Unauthenticated user trying to access protected page, redirecting to login');
      console.log('Current URL:', window.location.href);
      console.log('Current hash:', window.location.hash);
      window.location.hash = '#login';
      console.log('After hash change:', window.location.href);
      return;
    }

    try {
      console.debug('[Router] Fetching HTML from:', page.htmlPath);
      const response = await fetch(page.htmlPath);
      console.debug('[Router] HTML loaded, status:', response.status);
      
      const html = await response.text();
      console.debug('[Router] Inserting HTML into container');
      this.container.innerHTML = html;

      if (page.pageScript) {
        console.debug('[Router] Calling init() on page script');
        page.pageScript.init();
        console.debug('[Router] init() completed');
      } else {
        console.warn('[Router] No page script for:', pageName);
      }
    } catch (error) {
      console.error('[Router] Error loading page:', error.message);
    }
  }

  navigate(pageName) {
    console.debug('[Router] navigate() called for page:', pageName);
    // Use relative path - works from any location
    window.location.href = `#${pageName}`;
  }
}

const router = new Router('page-container');
console.debug('[Router] Router instance created');
