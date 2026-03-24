async function initApp() {
  try {
    const response = await fetch('config/config.json');
    const config = await response.json();

    config.pages.forEach(page => {
      const pageScript = window[page.script];
      router.register(page.name, page.path, pageScript, page.isProtected);
    });

    // Trigger initial page load
    const initialHash = window.location.hash.slice(1) || 'login';
    router.load(initialHash);
  } catch (error) {
    console.error('Error loading config:', error);
  }
}

initApp();
