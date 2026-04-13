class Initializer {
  static async init() {
    console.log('Initializing app components...');

    // Initialize HeaderComponent first
    try {
      const headerInstance = window.HeaderComponent.getInstance();
      window.headerInstance = headerInstance;
      await headerInstance.init();
      console.log('✓ headerInstance initialized and HTML loaded');
    } catch (error) {
      console.error('Error initializing headerInstance:', error);
    }

    // Initialize other components
    const components = [
      { name: 'themeManager', cls: 'ThemeManager' },
      { name: 'consoleWindowInstance', cls: 'ConsoleWindow' },
      { name: 'consoleLoggerInstance', cls: 'ConsoleLogger' },
      { name: 'uiController', cls: 'UIController' },
    ];

    for (const { name, cls } of components) {
      try {
        const instance = (window[name] = window[cls].getInstance());
        typeof instance.init === 'function' && instance.init();
      } catch (error) {
        console.error(`Error initializing ${name}:`, error);
      }
    }

    // Initialize auth services
    try {
      apiClient.setAuthService(authService);
      authService.setApiClient(apiClient);
      console.log('✓ Auth services initialized');
    } catch (error) {
      console.error('Error initializing auth services:', error);
    }

    // Check authentication and set router
    try {
      window.initialPage = await authGuard.initialize();
      router.setAuthService(authService);
      window.initApp?.();
    } catch (error) {
      console.error('Error in auth guard:', error);
    }

    console.log('✓ All components initialized');
  }
}
