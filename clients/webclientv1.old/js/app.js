// Main Application Logic

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Check if user is already authenticated
    checkAuthentication();
    
    // Set up event listeners
    setupEventListeners();
}

/**
 * Check if user is authenticated and show appropriate content
 */
function checkAuthentication() {
    const isAuthenticated = authService.isAuthenticated();
    const authSection = document.getElementById('authSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const authLink = document.getElementById('authLink');

    if (isAuthenticated) {
        // User is logged in
        if (authSection) authSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'block';
        
        // Display user information
        displayUserInfo();
        
        // Update navbar
        if (authLink) {
            authLink.innerHTML = '<a href="#" id="logoutLink">Logout</a>';
            document.getElementById('logoutLink').addEventListener('click', handleLogout);
        }
    } else {
        // User is not logged in
        if (authSection) authSection.style.display = 'block';
        if (dashboardSection) dashboardSection.style.display = 'none';
        
        // Update navbar
        if (authLink) {
            authLink.innerHTML = '<a href="./pages/login.html">Login</a>';
        }
    }
}

/**
 * Display user information on dashboard
 */
function displayUserInfo() {
    const user = authService.getUser();
    
    if (user) {
        const userNameElement = document.getElementById('userName');
        const userEmailElement = document.getElementById('userEmail');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) {
            userNameElement.textContent = `${user.firstName} ${user.lastName}`;
        }
        if (userEmailElement) {
            userEmailElement.textContent = user.email;
        }
        if (userRoleElement) {
            userRoleElement.textContent = user.role || 'N/A';
        }
    }
}

/**
 * Handle logout
 */
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        await authService.logout();
        showMessage('Logged out successfully', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = './index.html';
        }, 1000);
    } catch (error) {
        showMessage('Error during logout: ' + error.message, 'error');
    }
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    // Logout button on dashboard
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * Show message to user
 * @param {string} message - Message text
 * @param {string} type - Message type: 'success', 'error', 'info'
 * @param {number} duration - Duration in milliseconds (0 = no auto-hide)
 */
function showMessage(message, type = 'info', duration = 5000) {
    const messageElement = document.getElementById('message');
    
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = `message show ${type}`;
    
    if (duration > 0) {
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, duration);
    }
}

/**
 * Clear message
 */
function clearMessage() {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.classList.remove('show');
        messageElement.textContent = '';
    }
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} { isValid: boolean, errors: array }
 */
function validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Show field error
 * @param {string} fieldId - Input field ID
 * @param {string} errorMessage - Error message
 */
function showFieldError(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field) {
        field.classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
    }
}

/**
 * Clear field error
 * @param {string} fieldId - Input field ID
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field) {
        field.classList.remove('error');
    }
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

/**
 * Clear all field errors
 */
function clearAllFieldErrors() {
    const errorElements = document.querySelectorAll('.error-message.show');
    errorElements.forEach(element => {
        element.classList.remove('show');
        element.textContent = '';
    });
    
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
}
