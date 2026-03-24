const LoginPage = {
  init() {
    console.debug('[LoginPage] Page initialized');
    
    // Wait for DOM to be ready
    const form = document.getElementById('login-form');
    console.debug('[LoginPage] Form element found:', form ? 'yes' : 'no');
    
    if (form) {
      console.debug('[LoginPage] Attaching submit event listener');
      // Use arrow function to preserve 'this' context
      form.addEventListener('submit', (e) => {
        console.debug('[LoginPage] Submit event fired');
        this.handleSubmit(e);
      });
    } else {
      console.error('[LoginPage] Login form not found - DOM may not be ready');
    }
  },

  async handleSubmit(e) {
    console.debug('[LoginPage] handleSubmit() called');
    e.preventDefault(); // MUST be first line to stop page refresh
    console.debug('[LoginPage] Form submission prevented');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    console.debug('[LoginPage] Form inputs retrieved', { emailLength: email.length, passwordLength: password.length });
    
    // Validate inputs
    if (!email || !password) {
      console.debug('[LoginPage] Validation failed - missing email or password');
      this.showError('Please enter both email and password');
      return;
    }

    console.debug('[LoginPage] Validation passed', { email });

    // Show loading state
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    console.debug('[LoginPage] Button state changing to loading');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      console.debug('[LoginPage] Calling authService.login()');
      const response = await authService.login(email, password);
      console.debug('[LoginPage] authService.login() returned successfully', { responseKeys: Object.keys(response || {}) });
      
      // ADD THIS LINE - dispatch event so header updates
      document.dispatchEvent(new Event('authStateChanged'));
      console.debug('[LoginPage] authStateChanged event dispatched');
      
      console.debug('[LoginPage] Login successful - showing success message');
      this.showSuccess('Login successful! Redirecting...');
      
      // Redirect to dashboard after brief delay
      console.debug('[LoginPage] Scheduling redirect to dashboard in 1000ms');
      setTimeout(() => {
        console.debug('[LoginPage] Executing redirect to #dashboard');
        window.location.href = '#dashboard';
      }, 1000);
      
    } catch (error) {
      console.error('[LoginPage] Login failed with error:', {
        message: error.message,
        status: error.status,
        stack: error.stack
      });
      
      // Handle different error types
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('401')) {
        console.debug('[LoginPage] Error is 401 - invalid credentials');
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Network')) {
        console.debug('[LoginPage] Error is network-related');
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        console.debug('[LoginPage] Using error message from exception');
        errorMessage = error.message;
      }
      
      console.debug('[LoginPage] Showing error message to user:', errorMessage);
      this.showError(errorMessage);
      
    } finally {
      // Restore button state
      console.debug('[LoginPage] Restoring button state');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  showError(message) {
    console.debug('[LoginPage] showError() called', { message });
    const uiController = UIController.getInstance();
    console.debug('[LoginPage] UIController instance retrieved');
    uiController.showMessage(message, 'error');
  },

  showSuccess(message) {
    console.debug('[LoginPage] showSuccess() called', { message });
    const uiController = UIController.getInstance();
    console.debug('[LoginPage] UIController instance retrieved');
    uiController.showMessage(message, 'success');
  }
};

window.LoginPage = LoginPage;