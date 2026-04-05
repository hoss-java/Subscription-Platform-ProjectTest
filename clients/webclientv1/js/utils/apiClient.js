class ApiClient {
  constructor(config) {
    this.proxyURL = config.proxyURL || './proxy.php';
    this.timeout = config.timeout || 5000;
    this.authService = null;
    this.maxRetries = 3;  // ← Add retry limit
    this.retryCount = 0;  // ← Track current retry count
  }

  setAuthService(authService) {
    this.authService = authService;
  }

  /**
   * Make HTTP request through proxy
   * @param {string} method - GET, POST, PUT, DELETE, PATCH
   * @param {string} endpoint - API endpoint (e.g., /auth/login)
   * @param {object} data - Request body
   * @param {number} retryAttempt - Internal retry counter (don't pass this)
   * @returns {Promise}
   */
  async request(method, endpoint, data = null, retryAttempt = 0) {
    // Build proxy URL with path parameter
    const proxyUrl = `${this.proxyURL}?path=${encodeURIComponent(endpoint)}`;
    
    const absoluteProxyUrl = new URL(proxyUrl, window.location.origin).href;
    console.debug(`[ApiClient] Proxy file: ${this.proxyURL}`);
    console.debug(`[ApiClient] Relative proxy URL: ${proxyUrl}`);
    console.debug(`[ApiClient] Absolute proxy URL: ${absoluteProxyUrl}`);
    
    console.log(`[ApiClient] ${method} ${endpoint}`);
    console.log(`[ApiClient] Proxy URL: ${proxyUrl}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // DEBUG: Check auth service
    console.debug(`[ApiClient] authService exists:`, !!this.authService);
    if (this.authService) {
      console.debug(`[ApiClient] isAuthenticated():`, this.authService.isAuthenticated());
      console.debug(`[ApiClient] Token:`, this.authService.getToken() ? 'EXISTS' : 'MISSING');
    }

    if (this.authService && this.authService.isAuthenticated()) {
      const token = this.authService.getToken();
      options.headers['Authorization'] = `Bearer ${token}`;
      console.log(`[ApiClient] ✓ Authorization header added`);
    } else {
      console.warn(`[ApiClient] ✗ Authorization header NOT added - authService or isAuthenticated failed`);
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
      console.log(`[ApiClient] Request body:`, data);
    }

    try {
      console.log(`[ApiClient] Sending request...`);
      
      const response = await fetch(proxyUrl, options);

      console.log(`[ApiClient] Response status: ${response.status}`);

      // Handle 204 No Content - no body to parse
      if (response.status === 204) {
        console.log(`[ApiClient] 204 No Content - returning success`);
        return { success: true };
      }

      const responseData = await response.json();
      console.log(`[ApiClient] Response data:`, responseData);

      // Handle 401 FIRST - before checking response.ok
      if (response.status === 401 && this.authService) {
        console.log(`[ApiClient] 401 Unauthorized - attempt ${retryAttempt + 1}/${this.maxRetries}`);
        
        // CRITICAL: Check if tokens still exist (not logged out)
        if (!this.authService.getToken() || !this.authService.getRefreshToken()) {
          console.error(`[ApiClient] No tokens available - user may have logged out`);
          this.authService.clearAuth();
          document.dispatchEvent(new Event('authStateChanged'));
          throw new Error('Session expired. Please login again.');
        }
        
        // Check if we've exceeded retry limit
        if (retryAttempt >= this.maxRetries) {
          console.error(`[ApiClient] Max retries (${this.maxRetries}) exceeded`);
          this.authService.clearAuth();
          document.dispatchEvent(new Event('authStateChanged'));
          throw new Error(`Session expired after ${this.maxRetries} retry attempts. Please login again.`);
        }

        try {
          await this.authService.refreshToken();
          console.log(`[ApiClient] Token refreshed - retrying request (attempt ${retryAttempt + 2}/${this.maxRetries})`);
          return this.request(method, endpoint, data, retryAttempt + 1);
        } catch (refreshError) {
          console.error(`[ApiClient] Token refresh failed on attempt ${retryAttempt + 1}:`, refreshError);
          // CRITICAL: Clear auth and STOP - don't call logout() which is async
          this.authService.clearAuth();
          document.dispatchEvent(new Event('authStateChanged'));
          throw new Error(`Session expired on attempt ${retryAttempt + 1}. Please login again.`);
        }
      }

      // NOW check for other errors
      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || `HTTP ${response.status}`);
      }

      return responseData;

    } catch (error) {
      console.error(`[ApiClient] Error:`, error);
      throw error;
    }
  }


  /**
   * GET request
   */
  async get(endpoint) {
    console.log(`[ApiClient.get] Endpoint: ${endpoint}`);
    return this.request('GET', endpoint);
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    console.debug(`[ApiClient.post] Endpoint: ${endpoint}`);
    console.debug(`[ApiClient.post] Request data:`, data);
    console.debug(`[ApiClient.post] Data type:`, typeof data);
    console.debug(`[ApiClient.post] Data stringified:`, JSON.stringify(data));
    return this.request('POST', endpoint, data);
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    console.log(`[ApiClient.put] Endpoint: ${endpoint}`);
    return this.request('PUT', endpoint, data);
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    console.log(`[ApiClient.delete] Endpoint: ${endpoint}`);
    return this.request('DELETE', endpoint);
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data) {
    console.log(`[ApiClient.patch] Endpoint: ${endpoint}`);
    return this.request('PATCH', endpoint, data);
  }
}

// Export as singleton
const apiClient = new ApiClient({
  proxyURL: './proxy.php',
  timeout: 5000
});
