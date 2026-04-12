// client/webclientv1/js/services/authGuard.js

class AuthGuard {
  constructor(authService) {
    this.authService = authService;
    this.publicPages = ['login', 'register'];
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  isPublicPage(page) {
    return this.publicPages.includes(page);
  }

  async validateTokenWithBackend() {
    try {
      await this.authService.validateToken();
      return true;
    } catch {
      this.authService.clearAuth();
      return false;
    }
  }

  async guardRoute(currentPage) {
    if (this.isAuthenticated() && this.isPublicPage(currentPage)) {
      return 'home';
    }
    if (!this.isAuthenticated() && !this.isPublicPage(currentPage)) {
      return 'login';
    }
    return this.isAuthenticated() && !(await this.validateTokenWithBackend()) ? 'login' : currentPage;
  }

  async initialize() {
    if (!this.isAuthenticated()) return 'login';
    return (await this.validateTokenWithBackend()) ? 'home' : 'login';
  }
}

const authGuard = new AuthGuard(authService);
