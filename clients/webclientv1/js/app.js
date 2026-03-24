// Register pages
router.register('login', 'pages/login.html', LoginPage);
router.register('register', 'pages/register.html', RegisterPage);
router.register('dashboard', 'pages/dashboard.html', DashboardPage);

// Handle route changes
window.addEventListener('hashchange', () => {
  const page = window.location.hash.slice(1) || 'login';
  router.load(page);
});

// Load initial page
window.dispatchEvent(new Event('hashchange'));
