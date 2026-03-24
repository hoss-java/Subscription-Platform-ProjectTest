// API Client - Handles HTTP requests through PHP proxy

class ApiClient {
    constructor(config) {
        this.proxyUrl = config.PROXY_URL;
        this.timeout = config.REQUEST_TIMEOUT;
        this.storage = getStorage();
    }

    /**
     * Make HTTP request through proxy
     * @param {string} endpoint - API endpoint path (e.g., 'auth/login')
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {object} data - Request body data
     * @param {object} headers - Additional headers
     * @returns {Promise} Response data
     */
    async request(endpoint, method = 'GET', data = null, headers = {}) {
        try {
            // Build proxy URL with path parameter
            const url = new URL(this.proxyUrl, window.location.origin);
            url.searchParams.append('path', endpoint);

            // Prepare request options
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                timeout: this.timeout
            };

            // Add Authorization header if token exists
            const token = this.getToken();
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }

            // Add request body for POST, PUT, PATCH requests
            if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
                options.body = JSON.stringify(data);
            }

            // Make the request
            const response = await fetch(url.toString(), options);

            // Handle response
            const responseData = await response.json();

            // Handle authentication errors
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Unauthorized - Token expired or invalid');
            }

            // Handle other HTTP errors
            if (!response.ok) {
                throw new Error(responseData.message || `HTTP Error: ${response.status}`);
            }

            return responseData;

        } catch (error) {
            console.error(`API Request Error [${method} ${endpoint}]:`, error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, headers = {}) {
        return this.request(endpoint, 'GET', null, headers);
    }

    /**
     * POST request
     */
    async post(endpoint, data, headers = {}) {
        return this.request(endpoint, 'POST', data, headers);
    }

    /**
     * PUT request
     */
    async put(endpoint, data, headers = {}) {
        return this.request(endpoint, 'PUT', data, headers);
    }

    /**
     * DELETE request
     */
    async delete(endpoint, headers = {}) {
        return this.request(endpoint, 'DELETE', null, headers);
    }

    /**
     * Get token from storage
     */
    getToken() {
        return this.storage.getItem(CONFIG.TOKEN_KEY);
    }

    /**
     * Get refresh token from storage
     */
    getRefreshToken() {
        return this.storage.getItem(CONFIG.REFRESH_TOKEN_KEY);
    }

    /**
     * Set token in storage
     */
    setToken(token) {
        this.storage.setItem(CONFIG.TOKEN_KEY, token);
    }

    /**
     * Set refresh token in storage
     */
    setRefreshToken(refreshToken) {
        this.storage.setItem(CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    }

    /**
     * Clear all authentication data
     */
    clearAuth() {
        this.storage.removeItem(CONFIG.TOKEN_KEY);
        this.storage.removeItem(CONFIG.REFRESH_TOKEN_KEY);
        this.storage.removeItem(CONFIG.USER_KEY);
    }

    /**
     * Handle 401 Unauthorized response
     */
    handleUnauthorized() {
        this.clearAuth();
        // Redirect to login (will implement in app.js)
        window.location.href = './pages/login.html';
    }
}

// Initialize API client
const apiClient = new ApiClient(CONFIG);
