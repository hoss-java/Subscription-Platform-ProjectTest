// client/webclientv1/js/services/authGuard.js

class AuthGuard {
  constructor(authService) {
    this.authService = authService;
    this.publicPages = ['login', 'register'];
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  /**
   * Check if page is public (no auth required)
   * @param {string} page
   * @returns {boolean}
   */
  isPublicPage(page) {
    return this.publicPages.includes(page);
  }

  /**
   * Validate token with backend
   * @returns {Promise<boolean>}
   */
  async validateTokenWithBackend() {
    try {
      await this.authService.validateToken();
      return true;
    } catch (error) {
      this.authService.clearAuth();
      return false;
    }
  }

  /**
   * Guard route - check auth and redirect if needed
   * @param {string} currentPage
   * @returns {Promise<string>} - page to navigate to
   */
  async guardRoute(currentPage) {
    const isAuth = this.isAuthenticated();
    const isPublic = this.isPublicPage(currentPage);

    // If trying to access auth pages while logged in, redirect to home
    if (isAuth && (currentPage === 'login' || currentPage === 'register')) {
      return 'home';
    }

    // If trying to access protected page without auth, redirect to login
    if (!isAuth && !isPublic) {
      return 'login';
    }

    // If authenticated, validate token with backend
    if (isAuth) {
      const isValid = await this.validateTokenWithBackend();
      if (!isValid) {
        return 'login';
      }
    }

    return currentPage;
  }

  /**
   * Initialize auth guard on app load
   * @returns {Promise<string>} - initial page to load
   */
  async initialize() {
    console.debug('[AuthGuard] initialize() called');
    const isAuth = this.isAuthenticated();
    console.debug('[AuthGuard] isAuthenticated:', isAuth);

    if (isAuth) {
      // Validate token with backend
      console.debug('[AuthGuard] Validating token with backend...');
      const isValid = await this.validateTokenWithBackend();
      console.debug('[AuthGuard] Token valid:', isValid);
      
      if (isValid) {
        console.debug('[AuthGuard] Returning "home" page');
        return 'home'; // Changed from /dashboard
      } else {
        console.debug('[AuthGuard] Token invalid, returning "login" page');
        return 'login';
      }
    } else {
      console.debug('[AuthGuard] Not authenticated, returning "login" page');
      return 'login';
    }
  }
}

// Export as singleton
const authGuard = new AuthGuard(authService);
