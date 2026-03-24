// Configuration file for API endpoints and settings

const CONFIG = {
    // Proxy endpoint (relative path - same directory as index.html)
    PROXY_URL: './proxy.php',
    
    // Backend API base URL (used by proxy to forward requests)
    API_BASE_URL: 'http://172.32.0.11:8080/api',
    
    // Token configuration
    TOKEN_KEY: 'authToken',
    REFRESH_TOKEN_KEY: 'refreshToken',
    USER_KEY: 'user',
    
    // Storage type
    STORAGE_TYPE: 'localStorage', // 'localStorage' or 'sessionStorage'
    
    // API Endpoints
    ENDPOINTS: {
        REGISTER: 'auth/register',
        LOGIN: 'auth/login',
        LOGOUT: 'auth/logout',
        REFRESH: 'auth/refresh',
        VALIDATE: 'auth/validate',
        CHANGE_PASSWORD: 'auth/change-password',
        FORGOT_PASSWORD: 'auth/forgot-password',
        RESET_PASSWORD: 'auth/reset-password'
    },
    
    // Token expiration (in minutes)
    TOKEN_EXPIRATION: 60,
    REFRESH_TOKEN_EXPIRATION: 7 * 24 * 60, // 7 days
    
    // Request timeout (in milliseconds)
    REQUEST_TIMEOUT: 30000
};

// Get storage instance based on configuration
const getStorage = () => {
    return CONFIG.STORAGE_TYPE === 'localStorage' ? localStorage : sessionStorage;
};
