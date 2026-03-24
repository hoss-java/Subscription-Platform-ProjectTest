// client/webclientv1/js/services/authService.js

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.refreshTokenKey = 'refresh_token';
    this.userKey = 'user_data';
    this.apiClient = null;
  }

  setApiClient(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Register new user
   * @param {string} email
   * @param {string} password
   * @param {string} passwordConfirm
   * @param {string} firstName
   * @param {string} lastName
   * @returns {Promise}
   */
  async register(email, password, passwordConfirm, firstName, lastName) {
    try {
      console.log('[AuthService] Registering user:', email);
      const response = await this.apiClient.post('/auth/register', {
        email,
        password,
        passwordConfirm,
        firstName,
        lastName
      });
      console.log('[AuthService] Registration successful');
      return response;
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise}
   */
  async login(email, password) {
    try {
      console.log('[AuthService] Logging in user:', email);
      const response = await this.apiClient.post('/auth/login', {
        email,
        password
      });

      const token = response.token || response.access_token;
      const refreshToken = response.refresh_token || response.refreshToken;
      const user = response.user || response.data;

      if (token) {
        this.setToken(token);
        
        if (refreshToken) {
          this.setRefreshToken(refreshToken);
        }
        
        // Store user data - if backend didn't send it, create minimal user object
        if (user) {
          this.setUser(user);
        } else {
          // Create minimal user object with email
          this.setUser({ email: email });
        }
        
        localStorage.setItem('user_email', email);
        console.log('[AuthService] User email stored:', email);
      } else {
        throw new Error('No token received from server');
      }

      console.log('[AuthService] Login successful');
      return response;
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise}
   */
  async logout() {
    try {
      console.log('[AuthService] Logging out');
      
      // CLEAR AUTH FIRST - before any API calls
      this.clearAuth();
      console.log('[AuthService] Auth cleared from localStorage');
      
      // Then try to notify backend (optional)
      try {
        await this.apiClient.post('/auth/logout', {});
      } catch (error) {
        console.warn('[AuthService] Logout API call failed:', error);
      }
      
      document.dispatchEvent(new Event('authStateChanged'));
      console.log('[AuthService] Logout complete');
      return true;
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
      this.clearAuth();
      document.dispatchEvent(new Event('authStateChanged'));
      return true;
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise}
   */
  async refreshToken() {
    try {
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('[AuthService] Refreshing token');
      const response = await this.apiClient.post('/auth/refresh', {
        refreshToken: refreshToken
      });

      const token = response.token || response.access_token;
      const newRefreshToken = response.refresh_token || response.refreshToken;

      if (token) {
        authService.setToken(token);
        if (newRefreshToken) {
          authService.setRefreshToken(newRefreshToken);
        }
        return response;
      } else {
        throw new Error('No token received from refresh endpoint');
      }
    } catch (error) {
      console.error('[AuthService] Token refresh failed:', error);
      // REMOVED: clearAuth() and authStateChanged event
      // Let apiClient handle auth state changes after refresh fails
      throw error;
    }
  }


  /**
   * Validate current token
   * @returns {Promise}
   */
  async validateToken() {
    try {
      console.log('[AuthService] Validating token');
      const response = await this.apiClient.get('/auth/validate');
      console.log('[AuthService] Token valid');
      return response;
    } catch (error) {
      console.error('[AuthService] Token validation failed:', error);
      throw error;
    }
  }

  /**
   * Change password
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise}
   */
  async changePassword(currentPassword, newPassword) {
    try {
      console.log('[AuthService] Changing password');
      const response = await this.apiClient.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      console.log('[AuthService] Password changed successfully');
      return response;
    } catch (error) {
      console.error('[AuthService] Password change failed:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email
   * @returns {Promise}
   */
  async forgotPassword(email) {
    try {
      console.log('[AuthService] Requesting password reset for:', email);
      const response = await this.apiClient.post('/auth/forgot-password', {
        email
      });
      console.log('[AuthService] Password reset email sent');
      return response;
    } catch (error) {
      console.error('[AuthService] Forgot password failed:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise}
   */
  async resetPassword(token, newPassword) {
    try {
      console.log('[AuthService] Resetting password');
      const response = await this.apiClient.post('/auth/reset-password', {
        token,
        new_password: newPassword
      });
      console.log('[AuthService] Password reset successfully');
      return response;
    } catch (error) {
      console.error('[AuthService] Password reset failed:', error);
      throw error;
    }
  }

  // Token Management
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setRefreshToken(token) {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  getUserData() {
    try {
      const userData = localStorage.getItem(this.userKey);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('[AuthService] Error getting user data:', error);
      return null;
    }
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('user_email');  // ADD THIS
  }
}

// Export as singleton
const authService = new AuthService();
