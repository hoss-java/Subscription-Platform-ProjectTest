// client/webclientv1/js/services/authService.js

class AuthService {
  constructor() {
    this.keys = { token: 'auth_token', refreshToken: 'refresh_token', user: 'user_data', email: 'user_email' };
    this.apiClient = null;
  }

  setApiClient(apiClient) {
    this.apiClient = apiClient;
  }

  async register(email, password, passwordConfirm, firstName, lastName) {
    try {
      const response = await this.apiClient.post('/auth/register', { email, password, passwordConfirm, firstName, lastName });
      return response;
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await this.apiClient.post('/auth/login', { email, password });
      const token = response.token || response.access_token;
      const refreshToken = response.refresh_token || response.refreshToken;
      
      if (!token) throw new Error('No token received from server');
      
      this.setToken(token);
      if (refreshToken) this.setRefreshToken(refreshToken);
      this.setUser(response.user || response.data || { email });
      this.setItem(this.keys.email, email);
      
      return response;
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      throw error;
    }
  }

  async logout() {
    this.clearAuth();
    try {
      await this.apiClient.post('/auth/logout', {});
    } catch (error) {
      console.warn('[AuthService] Logout API call failed:', error);
    }
    document.dispatchEvent(new Event('authStateChanged'));
    return true;
  }

  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await this.apiClient.post('/auth/refresh', { refreshToken });
      const token = response.token || response.access_token;
      
      if (!token) throw new Error('No token received from refresh endpoint');
      
      this.setToken(token);
      if (response.refresh_token || response.refreshToken) {
        this.setRefreshToken(response.refresh_token || response.refreshToken);
      }
      return response;
    } catch (error) {
      console.error('[AuthService] Token refresh failed:', error);
      throw error;
    }
  }

  async validateToken() {
    try {
      return await this.apiClient.get('/auth/validate');
    } catch (error) {
      console.error('[AuthService] Token validation failed:', error);
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      return await this.apiClient.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
    } catch (error) {
      console.error('[AuthService] Password change failed:', error);
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      return await this.apiClient.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('[AuthService] Forgot password failed:', error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      return await this.apiClient.post('/auth/reset-password', { token, new_password: newPassword });
    } catch (error) {
      console.error('[AuthService] Password reset failed:', error);
      throw error;
    }
  }

  setItem(key, value) {
    localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
  }

  getItem(key, parse = false) {
    const value = localStorage.getItem(key);
    return parse && value ? JSON.parse(value) : value;
  }

  setToken(token) { this.setItem(this.keys.token, token); }
  getToken() { return this.getItem(this.keys.token); }
  setRefreshToken(token) { this.setItem(this.keys.refreshToken, token); }
  getRefreshToken() { return this.getItem(this.keys.refreshToken); }
  setUser(user) { this.setItem(this.keys.user, user); }
  getUser() { return this.getItem(this.keys.user, true); }
  getUserData() { return this.getUser(); }
  isAuthenticated() { return !!this.getToken(); }

  clearAuth() {
    Object.values(this.keys).forEach(key => localStorage.removeItem(key));
  }
}

const authService = new AuthService();
