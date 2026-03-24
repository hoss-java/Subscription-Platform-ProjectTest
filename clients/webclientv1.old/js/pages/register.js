// Register Page Logic

document.addEventListener('DOMContentLoaded', function() {
    initializeRegisterPage();
});

/**
 * Initialize register page
 */
function initializeRegisterPage() {
    // Redirect if already authenticated
    if (authService.isAuthenticated()) {
        window.location.href = '../pages/dashboard.html';
        return;
    }

    // Set up event listeners
    setupRegisterEventListeners();
}

/**
 * Set up register page event listeners
 */
function setupRegisterEventListeners() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Clear field errors on focus
    const formInputs = document.querySelectorAll('#registerForm input');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            clearFieldError(this.id);
        });
    });
}

/**
 * Handle register form submission
 */
async function handleRegister(e) {
    e.preventDefault();

    // Clear previous errors and messages
    clearAllFieldErrors();
    clearMessage();

    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate form
    const validationErrors = validateRegisterForm(firstName, lastName, email, password, confirmPassword);

    if (validationErrors.length > 0) {
        validationErrors.forEach(error => {
            showFieldError(error.field, error.message);
        });
        return;
    }

    try {
        // Show loading state
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';

        // Call register API
        const response = await authService.register({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        });

        showMessage('Registration successful! Redirecting to dashboard...', 'success');

        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
            window.location.href = '../pages/dashboard.html';
        }, 1500);

    } catch (error) {
        showMessage('Registration failed: ' + error.message, 'error');
    } finally {
        // Restore button state
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Validate register form
 */
function validateRegisterForm(firstName, lastName, email, password, confirmPassword) {
    const errors = [];

    // Validate first name
    if (!firstName) {
        errors.push({
            field: 'firstName',
            message: 'First name is required'
        });
    } else if (firstName.length < 2) {
        errors.push({
            field: 'firstName',
            message: 'First name must be at least 2 characters'
        });
    }

    // Validate last name
    if (!lastName) {
        errors.push({
            field: 'lastName',
            message: 'Last name is required'
        });
    } else if (lastName.length < 2) {
        errors.push({
            field: 'lastName',
            message: 'Last name must be at least 2 characters'
        });
    }

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
    } else {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            errors.push({
                field: 'password',
                message: passwordValidation.errors[0]
            });
        }
    }

    // Validate confirm password
    if (!confirmPassword) {
        errors.push({
            field: 'confirmPassword',
            message: 'Password confirmation is required'
        });
    } else if (password !== confirmPassword) {
        errors.push({
            field: 'confirmPassword',
            message: 'Passwords do not match'
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

/**
 * Validate password strength
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
