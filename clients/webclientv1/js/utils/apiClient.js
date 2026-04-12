// client/webclientv1/js/services/apiClient.js

class ApiClient {
  constructor(config) {
    this.proxyURL = config.proxyURL || './proxy.php';
    this.timeout = config.timeout || 5000;
    this.authService = null;
    this.maxRetries = 3;
  }

  setAuthService(authService) {
    this.authService = authService;
  }

  async request(method, endpoint, data = null, retryAttempt = 0) {
    const proxyUrl = `${this.proxyURL}?path=${encodeURIComponent(endpoint)}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data && ['POST', 'PUT', 'PATCH'].includes(method) ? JSON.stringify(data) : null
    };

    if (this.authService?.isAuthenticated()) {
      options.headers['Authorization'] = `Bearer ${this.authService.getToken()}`;
    }

    try {
      const response = await fetch(proxyUrl, options);

      if (response.status === 204) return { success: true };

      const responseData = await response.json();

      if (response.status === 401 && this.authService) {
        if (!this.authService.getToken() || !this.authService.getRefreshToken()) {
          this.authService.clearAuth();
          document.dispatchEvent(new Event('authStateChanged'));
          throw new Error('Session expired. Please login again.');
        }

        if (retryAttempt >= this.maxRetries) {
          this.authService.clearAuth();
          document.dispatchEvent(new Event('authStateChanged'));
          throw new Error(`Session expired after ${this.maxRetries} retry attempts. Please login again.`);
        }

        try {
          await this.authService.refreshToken();
          return this.request(method, endpoint, data, retryAttempt + 1);
        } catch (refreshError) {
          this.authService.clearAuth();
          document.dispatchEvent(new Event('authStateChanged'));
          throw new Error(`Session expired on attempt ${retryAttempt + 1}. Please login again.`);
        }
      }

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || `HTTP ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error(`[ApiClient] ${method} ${endpoint} failed:`, error);
      throw error;
    }
  }

  async get(endpoint) { return this.request('GET', endpoint); }
  async post(endpoint, data) { return this.request('POST', endpoint, data); }
  async put(endpoint, data) { return this.request('PUT', endpoint, data); }
  async delete(endpoint) { return this.request('DELETE', endpoint); }
  async patch(endpoint, data) { return this.request('PATCH', endpoint, data); }
}

const apiClient = new ApiClient({ proxyURL: './proxy.php', timeout: 5000 });
