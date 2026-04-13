const LoginPage = {
  init() {
    const form = document.getElementById('login-form');
    form?.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  async handleSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
      this.showError('Please enter both email and password');
      return;
    }

    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      await authService.login(email, password);
      document.dispatchEvent(new Event('authStateChanged'));
      this.showSuccess('Login successful! Redirecting...');
      setTimeout(() => (window.location.href = '#dashboard'), 1000);
    } catch (error) {
      const errorMap = {
        '401': 'Invalid email or password',
        'Network': 'Network error. Please check your connection.'
      };
      const errorMessage = Object.keys(errorMap).find(key => error.message.includes(key))
        ? errorMap[Object.keys(errorMap).find(key => error.message.includes(key))]
        : error.message || 'Login failed. Please try again.';
      this.showError(errorMessage);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  showError(message) {
    UIController.getInstance().showMessage(message, 'error');
  },

  showSuccess(message) {
    UIController.getInstance().showMessage(message, 'success');
  }
};

window.LoginPage = LoginPage;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoginPage;
}