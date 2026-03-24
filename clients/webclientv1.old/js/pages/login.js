// Login Page Logic

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

/**
 * Initialize login page
 */
function initializeLoginPage() {
    // Redirect if already authenticated
    if (authService.isAuthenticated()) {
        window.location.href = '../pages/dashboard.html';
        return;
    }

    // Set up event listeners
    setupLoginEventListeners();
}

/**
 * Set up login page event listeners
 */
function setupLoginEventListeners() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Clear field errors on focus
    const formInputs = document.querySelectorAll('#loginForm input');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            clearFieldError(this.id);
        });
    });
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();

    // Clear previous errors and messages
    clearAllFieldErrors();
    clearMessage();

    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validate form
    const validationErrors = validateLoginForm(email, password);

    if (validationErrors.length > 0) {
        validationErrors.forEach(error => {
            showFieldError(error.field, error.message);
        });
        return;
    }

    try {
        // Show loading state
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        // Call login API
        const response = await authService.login({
            email: email,
            password: password
        });

        showMessage('Login successful! Redirecting to dashboard...', 'success');

        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
            window.location.href = '../pages/dashboard.html';
        }, 1500);

    } catch (error) {
        showMessage('Login failed: ' + error.message, 'error');
    } finally {
        // Restore button state
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Validate login form
 */
function validateLoginForm(email, password) {
    const errors = [];

    // Validate email
    if (!email) {
        errors.push({
            field: 'email',
            message: 'Email is required'
        });
    } else if (!validateEmail(email)) {
        errors.push({
            field: 'email',
            message: 'Please enter a valid email address'
        });
    }

    // Validate password
    if (!password) {
        errors.push({
            field: 'password',
            message: 'Password is required'
        });
    }

    return errors;
}

/**
 * Show field error message
 */
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Clear field error message
 */
function clearFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

/**
 * Clear all field errors
 */
function clearAllFieldErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

/**
 * Show message
 */
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = `message show ${type}`;
}

/**
 * Clear message
 */
function clearMessage() {
    const messageElement = document.getElementById('message');
    
    if (!messageElement) return;
    
    messageElement.textContent = '';
    messageElement.className = 'message';
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
