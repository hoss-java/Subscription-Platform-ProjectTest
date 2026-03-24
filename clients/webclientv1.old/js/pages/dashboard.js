// Dashboard Page Logic

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

/**
 * Initialize dashboard
 */
function initializeDashboard() {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        // Redirect to login if not authenticated
        window.location.href = '../pages/login.html';
        return;
    }

    // Display user information
    displayUserInfo();

    // Set up event listeners
    setupDashboardEventListeners();
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
 * Set up dashboard event listeners
 */
function setupDashboardEventListeners() {
    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutLink = document.getElementById('logoutLink');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (logoutLink) {
        logoutLink.addEventListener('click', handleLogout);
    }

    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }

    // Input field error clearing
    const passwordInputs = document.querySelectorAll('#changePasswordForm input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('focus', function() {
            clearFieldError(this.id);
        });
    });
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
            window.location.href = '../index.html';
        }, 1000);
    } catch (error) {
        showMessage('Error during logout: ' + error.message, 'error');
    }
}

/**
 * Handle change password form submission
 */
async function handleChangePassword(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearAllFieldErrors();
    
    // Get form values
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Validate form
    const validationErrors = validateChangePasswordForm(oldPassword, newPassword, confirmNewPassword);
    
    if (validationErrors.length > 0) {
        validationErrors.forEach(error => {
            showFieldError(error.field, error.message);
        });
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('#changePasswordForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
        
        // Call change password API
        const response = await authService.changePassword({
            oldPassword: oldPassword,
            newPassword: newPassword,
            confirmPassword: confirmNewPassword
        });
        
        showChangePasswordMessage('Password changed successfully!', 'success');
        
        // Reset form
        document.getElementById('changePasswordForm').reset();
        
        // Close modal after 2 seconds
        setTimeout(() => {
            closeChangePasswordModal();
        }, 2000);
        
    } catch (error) {
        showChangePasswordMessage('Error: ' + error.message, 'error');
    } finally {
        // Restore button state
        const submitBtn = document.querySelector('#changePasswordForm button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Validate change password form
 */
function validateChangePasswordForm(oldPassword, newPassword, confirmNewPassword) {
    const errors = [];
    
    // Validate old password
    if (!oldPassword || oldPassword.trim() === '') {
        errors.push({
            field: 'oldPassword',
            message: 'Current password is required'
        });
    }
    
    // Validate new password
    if (!newPassword || newPassword.trim() === '') {
        errors.push({
            field: 'newPassword',
            message: 'New password is required'
        });
    }
    
    // Validate confirm password
    if (!confirmNewPassword || confirmNewPassword.trim() === '') {
        errors.push({
            field: 'confirmNewPassword',
            message: 'Password confirmation is required'
        });
    }
    
    // Check if passwords match
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
        errors.push({
            field: 'confirmNewPassword',
            message: 'Passwords do not match'
        });
    }
    
    // Check if new password is different from old password
    if (oldPassword && newPassword && oldPassword === newPassword) {
        errors.push({
            field: 'newPassword',
            message: 'New password must be different from current password'
        });
    }
    
    // Validate password strength
    if (newPassword) {
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            errors.push({
                field: 'newPassword',
                message: passwordValidation.errors[0]
            });
        }
    }
    
    return errors;
}

/**
 * Open change password modal
 */
function openChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.style.display = 'block';
        // Focus on first input
        document.getElementById('oldPassword').focus();
    }
}

/**
 * Close change password modal
 */
function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('changePasswordForm').reset();
        // Clear messages
        document.getElementById('changePasswordMessage').classList.remove('show');
    }
}

/**
 * Show message in change password modal
 */
function showChangePasswordMessage(message, type = 'info') {
    const messageElement = document.getElementById('changePasswordMessage');
    
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = `message show ${type}`;
}

/**
 * Navigate to different sections (placeholder for future implementation)
 */
function navigateTo(section) {
    console.log('Navigating to:', section);
    showMessage(`Navigation to ${section} would be implemented here`, 'info');
    // Future: Implement actual navigation or load different dashboard sections
}

/**
 * Close modal when clicking outside of it
 */
window.addEventListener('click', function(event) {
    const modal = document.getElementById('changePasswordModal');
    if (event.target === modal) {
        closeChangePasswordModal();
    }
});
