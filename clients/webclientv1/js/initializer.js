class Initializer {
  static async init() {
    console.log('Initializing app components...');
    
    // Initialize HeaderComponent FIRST and WAIT for it to complete
    console.log('Initializing headerInstance...');
    try {
      const headerInstance = window.HeaderComponent.getInstance();
      window.headerInstance = headerInstance;
      await headerInstance.init(); // AWAIT THIS
      console.log('✓ headerInstance initialized and HTML loaded');
    } catch (error) {
      console.error('Error initializing headerInstance:', error);
    }

    // NOW initialize other components (header HTML is definitely loaded)
    const components = [
      { name: 'themeManager', getInstance: () => window.ThemeManager.getInstance() },
      { name: 'consoleWindowInstance', getInstance: () => window.ConsoleWindow.getInstance() },
      { name: 'consoleLoggerInstance', getInstance: () => window.ConsoleLogger.getInstance() },
      { name: 'uiController', getInstance: () => window.UIController.getInstance() },
    ];

    for (const component of components) {
      console.log(`Initializing ${component.name}...`);
      
      try {
        const instance = component.getInstance();
        window[component.name] = instance;
        
        if (typeof instance.init === 'function') {
          console.log(`✓ Calling ${component.name}.init()`);
          instance.init();
        } else {
          console.warn(`⚠️ ${component.name} has no init() method`);
        }
      } catch (error) {
        console.error(`Error initializing ${component.name}:`, error);
      }
    }

    // Initialize auth services
    console.log('Initializing auth services...');
    try {
      apiClient.setAuthService(authService);
      authService.setApiClient(apiClient);
      console.log('✓ Auth services initialized');
    } catch (error) {
      console.error('Error initializing auth services:', error);
    }

    // Check authentication and guard routes
    console.log('Checking authentication...');
    try {
      const initialPage = await authGuard.initialize();
      console.log(`[Initializer] Initial page: ${initialPage}`);
      window.initialPage = initialPage;
    } catch (error) {
      console.error('Error in auth guard:', error);
    }

    // Set authService on router so it can check auth status
    router.setAuthService(authService);
    console.log('✓ Router auth service set');

    // Initialize app router
    if (window.initApp && typeof window.initApp === 'function') {
      console.log('Initializing app router...');
      window.initApp();
    }

    console.log('✓ All components initialized');
  }
}
