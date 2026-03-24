const RegisterPage = {
  init() {
    console.log('[RegisterPage] Register page loaded');
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  async handleSubmit(e) {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    
    console.log('[RegisterPage] Register attempt:', { firstName, lastName, email });

    // Validate passwords match
    if (password !== passwordConfirm) {
      console.error('[RegisterPage] Passwords do not match');
      uiController.showMessage('Passwords do not match', 'error');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      console.error('[RegisterPage] Password too short');
      uiController.showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      console.log('[RegisterPage] Calling authService.register()');
      const response = await authService.register(email, password, passwordConfirm, firstName, lastName);
      
      console.log('[RegisterPage] Register response:', response);
      uiController.showMessage('Registration successful! Redirecting to login...', 'success');
      
      // Redirect to login after short delay
      setTimeout(() => {
        router.navigate('login');
      }, 1500);
    } catch (error) {
      console.error('[RegisterPage] Registration failed:', error);
      uiController.showMessage(`Registration failed: ${error.message}`, 'error');
    }
  }
};

window.RegisterPage = RegisterPage;
