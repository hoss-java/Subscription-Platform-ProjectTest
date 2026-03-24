const LoginPage = {
  init() {
    console.log('Login page loaded');
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  handleSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('Login attempt:', { email, password });
  }
};
