// Authentication Service - Handles all auth-related API calls

class AuthService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.storage = getStorage();
    }

    /**
     * Register a new user
     * @param {object} registerData - { email, password, firstName, lastName }
     * @returns {Promise} AuthResponse with token and user details
     */
    async register(registerData) {
        try {
            const response = await this.apiClient.post(
                CONFIG.ENDPOINTS.REGISTER,
                registerData
            );

            if (response.token) {
                this.setAuthData(response);
            }

            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Login user
     * @param {object} loginData - { email, password }
     * @returns {Promise} AuthResponse with token and user details
     */
    async login(loginData) {
        try {
            const response = await this.apiClient.post(
                CONFIG.ENDPOINTS.LOGIN,
                loginData
            );

            if (response.token) {
                this.setAuthData(response);
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout user - clear tokens and user data
     */
    async logout() {
        try {
            // Optional: Call backend logout endpoint if it exists
            // await this.apiClient.post(CONFIG.ENDPOINTS.LOGOUT, {});

            // Clear local storage
            this.apiClient.clearAuth();

            return { message: 'Logged out successfully' };
        } catch (error) {
            console.error('Logout error:', error);
            // Clear auth data even if API call fails
            this.apiClient.clearAuth();
            throw error;
        }
    }

    /**
     * Refresh access token using refresh token
     * @returns {Promise} AuthResponse with new token
     */
    async refreshToken() {
        try {
            const refreshToken = this.apiClient.getRefreshToken();

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await this.apiClient.post(
                CONFIG.ENDPOINTS.REFRESH,
                { refreshToken: refreshToken }
            );

            if (response.token) {
                this.apiClient.setToken(response.token);
                if (response.refreshToken) {
                    this.apiClient.setRefreshToken(response.refreshToken);
                }
            }

            return response;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.apiClient.clearAuth();
            throw error;
        }
    }

    /**
     * Validate current token
     * @returns {Promise} TokenValidationResponse
     */
    async validateToken() {
        try {
            return await this.apiClient.get(CONFIG.ENDPOINTS.VALIDATE);
        } catch (error) {
            console.error('Token validation error:', error);
            throw error;
        }
    }

    /**
     * Change password
     * @param {object} passwordData - { oldPassword, newPassword, confirmPassword }
     * @returns {Promise} AuthResponse
     */
    async changePassword(passwordData) {
        try {
            return await this.apiClient.post(
                CONFIG.ENDPOINTS.CHANGE_PASSWORD,
                passwordData
            );
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    /**
     * Forgot password - request password reset
     * @param {object} forgotData - { email }
     * @returns {Promise} AuthResponse
     */
    async forgotPassword(forgotData) {
        try {
            return await this.apiClient.post(
                CONFIG.ENDPOINTS.FORGOT_PASSWORD,
                forgotData
            );
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    /**
     * Reset password with token
     * @param {object} resetData - { token, newPassword, confirmPassword }
     * @returns {Promise} AuthResponse
     */
    async resetPassword(resetData) {
        try {
            return await this.apiClient.post(
                CONFIG.ENDPOINTS.RESET_PASSWORD,
                resetData
            );
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    /**
     * Get stored user data
     * @returns {object} User object or null
     */
    getUser() {
        const userJson = this.storage.getItem(CONFIG.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }

    /**
     * Get current token
     * @returns {string} Token or null
     */
    getToken() {
        return this.apiClient.getToken();
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Get user role
     * @returns {string} User role or null
     */
    getUserRole() {
        const user = this.getUser();
        return user ? user.role : null;
    }

    /**
     * Store authentication data (token, user info)
     * @private
     */
    setAuthData(authResponse) {
        if (authResponse.token) {
            this.apiClient.setToken(authResponse.token);
        }

        if (authResponse.refreshToken) {
            this.apiClient.setRefreshToken(authResponse.refreshToken);
        }

        if (authResponse.userDetails) {
            this.storage.setItem(
                CONFIG.USER_KEY,
                JSON.stringify(authResponse.userDetails)
            );
        }
    }
}

// Initialize auth service
const authService = new AuthService(apiClient);
