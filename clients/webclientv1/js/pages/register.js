const RegisterPage = {
  init() {
    console.log('[RegisterPage] Register page loaded');
    document.getElementById('register-form').addEventListener('submit', e => this.handleSubmit(e));
  },

  async handleSubmit(e) {
    e.preventDefault();
    
    const getField = id => document.getElementById(id).value.trim();
    const [firstName, lastName, email, password, passwordConfirm] = 
      ['firstName', 'lastName', 'email', 'password', 'passwordConfirm'].map(getField);
    
    console.log('[RegisterPage] Register attempt:', { firstName, lastName, email });

    if (password !== passwordConfirm) {
      return void uiController.showMessage('Passwords do not match', 'error');
    }

    if (password.length < 6) {
      return void uiController.showMessage('Password must be at least 6 characters', 'error');
    }

    try {
      await authService.register(email, password, passwordConfirm, firstName, lastName);
      uiController.showMessage('Registration successful! Redirecting to login...', 'success');
      setTimeout(() => router.navigate('login'), 1500);
    } catch (error) {
      uiController.showMessage(`Registration failed: ${error.message}`, 'error');
    }
  }
};

window.RegisterPage = RegisterPage;
