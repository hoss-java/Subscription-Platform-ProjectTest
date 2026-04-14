// Test file for: webclientv1/src/js/components/header.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { HeaderComponent } = loadModules('HeaderComponent');

describe('HeaderComponent', () => {
  let component;
  let mockAuthService;
  let mockHeaderElement;
  let mockUserDisplay;
  let mockLogoutBtn;
  let mockLoginLink;
  let mockAppTitle;
  let mockAppDescription;

  beforeEach(() => {
    // Use fake timers for setTimeout/setInterval tests
    jest.useFakeTimers();

    // Mock console methods to suppress output during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Reset singleton instance
    HeaderComponent.instance = null;

    // Create mock DOM elements
    mockUserDisplay = {
      textContent: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    mockLogoutBtn = {
      textContent: 'Logout',
      style: { display: 'none' },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    mockLoginLink = {
      textContent: 'Login',
      style: { display: 'block' },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    mockAppTitle = {
      textContent: ''
    };

    mockAppDescription = {
      textContent: ''
    };

    mockHeaderElement = {
      innerHTML: ''
    };

    // Setup document.getElementById mock
    document.getElementById = jest.fn((id) => {
      const elements = {
        'app-header': mockHeaderElement,
        'user-display': mockUserDisplay,
        'header-logout-btn': mockLogoutBtn,
        'login-link': mockLoginLink,
        'app-title': mockAppTitle,
        'app-description': mockAppDescription
      };
      return elements[id] || null;
    });

    // Setup fetch mock
    global.fetch = jest.fn();

    // Setup authService mock
    mockAuthService = {
      isAuthenticated: jest.fn(() => false),
      getUserData: jest.fn(() => null),
      logout: jest.fn().mockResolvedValue(undefined),
      clearAuth: jest.fn()
    };
    global.authService = mockAuthService;

    // Setup document event listeners
    document.addEventListener = jest.fn();
    document.dispatchEvent = jest.fn();
  });

  afterEach(() => {
    // Restore real timers
    jest.useRealTimers();

    // Restore all mocked functions and console methods
    jest.restoreAllMocks();

    // Clear all mock data
    jest.clearAllMocks();

    // Reset singleton instance
    HeaderComponent.instance = null;
  });

  // ===== SINGLETON PATTERN TESTS =====
  describe('Singleton Pattern', () => {
    // Scenario: Component should follow singleton pattern for memory efficiency
    test('should be defined', () => {
      expect(HeaderComponent).toBeDefined();
    });

    // Scenario: Multiple calls to getInstance should return the same instance reference
    test('getInstance should return the same instance', () => {
      const instance1 = HeaderComponent.getInstance();
      const instance2 = HeaderComponent.getInstance();
      expect(instance1).toBe(instance2);
    });

    // Scenario: First getInstance() call should create a new HeaderComponent instance
    test('should create a new instance on first call', () => {
      const instance = HeaderComponent.getInstance();
      expect(instance).toBeInstanceOf(HeaderComponent);
    });

    // Scenario: New instances should initialize with all DOM references as null
    test('should initialize properties as null', () => {
      const instance = new HeaderComponent();
      expect(instance.userDisplay).toBeNull();
      expect(instance.logoutBtn).toBeNull();
      expect(instance.loginLink).toBeNull();
      expect(instance.appTitle).toBeNull();
      expect(instance.appDescription).toBeNull();
    });
  });

  // ===== INITIALIZATION TESTS =====
  describe('init()', () => {
    beforeEach(() => {
      component = HeaderComponent.getInstance();
    });

    // Scenario: init() should load both HTML and config in parallel using Promise.all
    test('should load header HTML and config in parallel', async () => {
      global.fetch
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('<header>Test</header>')
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            app: {
              title: 'Test App',
              header: { h1: 'Test Header', p: 'Test Description' }
            }
          })
        });

      await component.init();

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(document.title).toBe('Test App');
    });

    // Scenario: After loading, init() should cache DOM elements for later access
    test('should cache DOM elements after loading', async () => {
      global.fetch
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('<header></header>')
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            app: {
              title: 'Test App',
              header: { h1: 'Title', p: 'Description' }
            }
          })
        });

      await component.init();

      expect(component.userDisplay).toBe(mockUserDisplay);
      expect(component.logoutBtn).toBe(mockLogoutBtn);
      expect(component.loginLink).toBe(mockLoginLink);
    });

    // Scenario: init() should bind event listeners to cached elements
    test('should attach event listeners', async () => {
      global.fetch
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('<header></header>')
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            app: {
              title: 'Test App',
              header: { h1: 'Title', p: 'Description' }
            }
          })
        });

      await component.init();

      expect(mockLogoutBtn.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
      expect(mockLoginLink.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
    });

    // Scenario: init() should update the UI to reflect current auth state after loading
    test('should call update() after initialization', async () => {
      global.fetch
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('<header></header>')
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            app: {
              title: 'Test App',
              header: { h1: 'Title', p: 'Description' }
            }
          })
        });

      jest.spyOn(component, 'update');
      await component.init();

      expect(component.update).toHaveBeenCalled();
    });

    // Scenario: init() should setup event listener for auth state changes to update UI dynamically
    test('should listen for authStateChanged events', async () => {
      global.fetch
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('<header></header>')
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            app: {
              title: 'Test App',
              header: { h1: 'Title', p: 'Description' }
            }
          })
        });

      await component.init();

      expect(document.addEventListener).toHaveBeenCalledWith(
        'authStateChanged',
        expect.any(Function)
      );
    });

    // Scenario: Error handling - fetch failures should be caught and logged without crashing
    test.each([
      ['header HTML load', 0],
      ['config load', 1]
    ])(
      'should handle %s errors gracefully',
      async (scenario, fetchIndex) => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        if (fetchIndex === 0) {
          global.fetch.mockRejectedValueOnce(new Error('Network error'));
        } else {
          global.fetch
            .mockResolvedValueOnce({
              text: jest.fn().mockResolvedValue('<header></header>')
            })
            .mockRejectedValueOnce(new Error('Network error'));
        }

        await component.init();

        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
      }
    );
  });

  // ===== LOAD HEADER HTML TESTS =====
  describe('loadHeaderHTML()', () => {
    beforeEach(() => {
      component = HeaderComponent.getInstance();
    });

    // Scenario: loadHeaderHTML() should fetch from the correct path
    test('should fetch header.html file', async () => {
      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue('<header></header>')
      });

      await component.loadHeaderHTML();

      expect(global.fetch).toHaveBeenCalledWith('pages/header.html');
    });

    // Scenario: Content from fetch response should be inserted into header element
    test('should set innerHTML with fetched content', async () => {
      const htmlContent = '<header><h1>Test</h1></header>';
      global.fetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue(htmlContent)
      });

      await component.loadHeaderHTML();

      expect(mockHeaderElement.innerHTML).toBe(htmlContent);
    });

    // Scenario: Different fetch error types should be caught and logged appropriately
    test.each([
      ['network failure', new Error('Network error')],
      ['connection timeout', new Error('Timeout')],
      ['server error', new Error('500 Internal Server Error')]
    ])(
      'should handle %s gracefully',
      async (scenario, error) => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        global.fetch.mockRejectedValueOnce(error);

        await component.loadHeaderHTML();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[HeaderComponent] Failed to load header HTML:',
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();
      }
    );
  });

  // ===== LOAD CONFIG TESTS =====
  describe('loadConfig()', () => {
    beforeEach(() => {
      component = HeaderComponent.getInstance();
    });

    // Scenario: loadConfig() should fetch from the correct config file path
    test('should fetch config.json file', async () => {
      global.fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          app: {
            title: 'App',
            header: { h1: 'Title', p: 'Desc' }
          }
        })
      });

      await component.loadConfig();

      expect(global.fetch).toHaveBeenCalledWith('config/config.json');
    });

    // Scenario: Document title should be updated from config.app.title
    test('should set document.title from config', async () => {
      global.fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          app: {
            title: 'My Application',
            header: { h1: 'Header', p: 'Desc' }
          }
        })
      });

      await component.loadConfig();

      expect(document.title).toBe('My Application');
    });

    // Scenario: Config properties should be stored in component for later use in cacheElements()
    test('should store app title and description', async () => {
      global.fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          app: {
            title: 'App',
            header: { h1: 'Test Title', p: 'Test Description' }
          }
        })
      });

      await component.loadConfig();

      expect(component.appTitle).toBe('Test Title');
      expect(component.appDescription).toBe('Test Description');
    });

    // Scenario: Various error types during config loading should be caught and logged
    test.each([
      ['invalid JSON', new Error('Invalid JSON')],
      ['malformed config structure', new Error('Config missing required fields')],
      ['network error', new Error('Network unreachable')]
    ])(
      'should handle %s gracefully',
      async (scenario, error) => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        global.fetch.mockResolvedValueOnce({
          json: jest.fn().mockRejectedValueOnce(error)
        });

        await component.loadConfig();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[HeaderComponent] Failed to load config:',
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();
      }
    );
  });

  // ===== CACHE ELEMENTS TESTS =====
  describe('cacheElements()', () => {
    beforeEach(() => {
      component = HeaderComponent.getInstance();
    });

    // Scenario: All DOM element references should be cached for later event binding
    test('should cache all required DOM elements', () => {
      component.appTitle = 'Test Title';
      component.appDescription = 'Test Description';

      component.cacheElements();

      expect(component.userDisplay).toBe(mockUserDisplay);
      expect(component.logoutBtn).toBe(mockLogoutBtn);
      expect(component.loginLink).toBe(mockLoginLink);
    });

    test.each([
      ['app title', 'My App Title', 'app-title'],
      ['app description', 'My App Description', 'app-description']
    ])(
      'should set %s text content',
      (scenario, textValue, elementId) => {
        component.appTitle = 'My App Title';
        component.appDescription = 'My App Description';

        component.cacheElements();

        // Get the element that was mocked
        const element = document.getElementById(elementId);
        
        expect(element.textContent).toBe(textValue);
      }
    );

    // Scenario: Missing DOM elements should not crash the application
    test('should handle missing elements gracefully', () => {
      document.getElementById = jest.fn(() => null);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      component.cacheElements();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // ===== ATTACH EVENT LISTENERS TESTS =====
  describe('attachEventListeners()', () => {
    beforeEach(() => {
      component = HeaderComponent.getInstance();
      component.logoutBtn = mockLogoutBtn;
      component.loginLink = mockLoginLink;
    });

    test.each([
      ['logout button', 'header-logout-btn'],
      ['login link', 'login-link']
    ])(
      'should attach click listener to %s',
      (scenario, elementId) => {
        // First, cache the elements so component.logoutBtn and component.loginLink are set
        component.cacheElements();
        
        // Now attach event listeners
        component.attachEventListeners();

        // Get the element through document.getElementById to verify
        const element = document.getElementById(elementId);
        
        expect(element.addEventListener).toHaveBeenCalledWith(
          'click',
          expect.any(Function)
        );
      }
    );

    // Scenario: Null element references should use optional chaining to prevent errors
    test.each([
      ['logout button', 'logoutBtn'],
      ['login link', 'loginLink']
    ])(
      'should handle null %s gracefully',
      (scenario, property) => {
        component[property] = null;

        expect(() => component.attachEventListeners()).not.toThrow();
      }
    );

    // Scenario: Logout button click should trigger handleLogout after preventing default
    test('logout button click should call handleLogout', () => {
      jest.spyOn(component, 'handleLogout').mockImplementation();
      component.attachEventListeners();

      const clickHandler = mockLogoutBtn.addEventListener.mock.calls[0][1];
      const mockEvent = { preventDefault: jest.fn() };
      clickHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.handleLogout).toHaveBeenCalled();
    });

    // Scenario: Login link click should prevent default navigation and navigate to login hash
    test('login link click should prevent default and navigate', () => {
      window.location.href = '';
      component.attachEventListeners();

      const clickHandler = mockLoginLink.addEventListener.mock.calls[0][1];
      const mockEvent = { preventDefault: jest.fn() };
      clickHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(window.location.href).toBe('#login');
    });
  });

  // ===== UPDATE TESTS =====
  describe('update()', () => {
    beforeEach(() => {
      component = HeaderComponent.getInstance();
      component.userDisplay = mockUserDisplay;
      component.logoutBtn = mockLogoutBtn;
      component.loginLink = mockLoginLink;
    });

    // Scenario: When user is authenticated, welcome message should display with user email
    test.each([
      ['authenticated user', true, { email: 'user@example.com' }, 'Welcome, user@example.com'],
      ['authenticated user', true, { email: 'test@test.com' }, 'Welcome, test@test.com'],
      ['unauthenticated user', false, null, '']
    ])(
      'should display correct message for %s',
      (scenario, isAuth, userData, expectedText) => {
        mockAuthService.isAuthenticated.mockReturnValue(isAuth);
        mockAuthService.getUserData.mockReturnValue(userData);

        component.update();

        expect(mockUserDisplay.textContent).toBe(expectedText);
      }
    );

    // Scenario: Logout button visibility should toggle based on authentication state
    test.each([
      ['authenticated', true, { email: 'user@test.com' }, 'inline-block'],
      ['unauthenticated', false, null, 'none']
    ])(
      'should show/hide logout button for %s user',
      (scenario, isAuth, userData, expectedDisplay) => {
        mockAuthService.isAuthenticated.mockReturnValue(isAuth);
        mockAuthService.getUserData.mockReturnValue(userData);

        component.update();

        expect(mockLogoutBtn.style.display).toBe(expectedDisplay);
      }
    );

    // Scenario: Login link visibility should be inverse of logout button
    test.each([
      ['authenticated', true, { email: 'user@test.com' }, 'none'],
      ['unauthenticated', false, null, 'inline-block']
    ])(
      'should show/hide login link for %s user',
      (scenario, isAuth, userData, expectedDisplay) => {
        mockAuthService.isAuthenticated.mockReturnValue(isAuth);
        mockAuthService.getUserData.mockReturnValue(userData);

        component.update();

        expect(mockLoginLink.style.display).toBe(expectedDisplay);
      }
    );

    // Scenario: Both conditions must be true (isAuth AND userData exists) to show authenticated state
    test.each([
      ['authenticated with data', true, { email: 'user@test.com' }, true],
      ['authenticated without data', true, null, false],
      ['not authenticated with data', false, { email: 'user@test.com' }, false],
      ['not authenticated without data', false, null, false]
    ])(
      'should handle %s correctly',
      (scenario, isAuth, userData, shouldShowAuth) => {
        mockAuthService.isAuthenticated.mockReturnValue(isAuth);
        mockAuthService.getUserData.mockReturnValue(userData);

        component.update();

        const expectedLogoutDisplay = shouldShowAuth ? 'inline-block' : 'none';
        const expectedLoginDisplay = shouldShowAuth ? 'none' : 'inline-block';

        expect(mockLogoutBtn.style.display).toBe(expectedLogoutDisplay);
        expect(mockLoginLink.style.display).toBe(expectedLoginDisplay);
      }
    );
  });

  // ===== HANDLE LOGOUT TESTS =====
  describe('handleLogout()', () => {
    beforeEach(() => {
      component = HeaderComponent.getInstance();
      component.userDisplay = mockUserDisplay;
      component.logoutBtn = mockLogoutBtn;
      component.loginLink = mockLoginLink;
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    // Scenario: handleLogout() should call authService.logout() to clear auth tokens
    test('should call authService.logout()', async () => {
      await component.handleLogout();

      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    // Scenario: After logout, update() should be called to refresh UI
    test('should call update() after logout', async () => {
      jest.spyOn(component, 'update');

      await component.handleLogout();

      expect(component.update).toHaveBeenCalled();
    });

    // Scenario: authStateChanged event should be dispatched to notify other components
    test('should dispatch authStateChanged event', async () => {
      await component.handleLogout();

      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'authStateChanged' })
      );
    });

    // Scenario: User should be redirected to login page after 500ms delay
    test('should redirect to login after delay', async () => {
      window.location.href = '';

      await component.handleLogout();
      jest.advanceTimersByTime(500);

      expect(window.location.href).toBe('#login');
    });

    // Scenario: If logout fails, clearAuth() should be called as fallback
    test('should fallback to clearAuth() on logout error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const testError = new Error('Logout failed');
      mockAuthService.logout.mockRejectedValueOnce(testError);

      await component.handleLogout();

      // Assert that clearAuth was called
      expect(mockAuthService.clearAuth).toHaveBeenCalled();
      
      // Assert that console.error was called with the correct error
      expect(consoleErrorSpy).toHaveBeenCalledWith('[HeaderComponent] Logout error:', testError);
      
      consoleErrorSpy.mockRestore();
    });

    // Scenario: Redirect should happen in finally block regardless of success/failure
    test.each([
      ['logout succeeds', undefined],
      ['logout fails', new Error('Logout error')]
    ])(
      'should redirect when %s',
      async (scenario, errorOrUndefined) => {
        if (errorOrUndefined) {
          mockAuthService.logout.mockRejectedValueOnce(errorOrUndefined);
        }

        window.location.href = '';
        await component.handleLogout();
        jest.advanceTimersByTime(500);

        expect(window.location.href).toBe('#login');
      }
    );

    // Scenario: All cleanup operations should happen in correct order
    test('should execute operations in correct order', async () => {
      const executionOrder = [];

      mockAuthService.logout.mockImplementation(() => {
        executionOrder.push('logout');
        return Promise.resolve();
      });

      jest.spyOn(component, 'update').mockImplementation(() => {
        executionOrder.push('update');
      });

      document.dispatchEvent = jest.fn(() => {
        executionOrder.push('dispatchEvent');
      });

      window.location.href = '';

      await component.handleLogout();
      jest.advanceTimersByTime(500);

      expect(executionOrder).toEqual(['logout', 'update', 'dispatchEvent']);
      expect(window.location.href).toBe('#login');
    });

    // Scenario: Logout errors should be logged for debugging
    test('should log logout errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const logoutError = new Error('Auth service unavailable');
      mockAuthService.logout.mockRejectedValueOnce(logoutError);

      await component.handleLogout();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[HeaderComponent] Logout error:',
        logoutError
      );
      consoleErrorSpy.mockRestore();
    });
  });

  // ===== INTEGRATION TESTS =====
  describe('Integration - Full Flow', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      HeaderComponent.instance = null;
    });

    // Scenario: Complete initialization flow from HTML load to event listener setup
    test('should complete full initialization flow', async () => {
      component = HeaderComponent.getInstance();
      
      global.fetch
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('<header></header>')
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            app: {
              title: 'Test App',
              header: { h1: 'App Title', p: 'App Description' }
            }
          })
        });

      await component.init();

      expect(component.userDisplay).not.toBeNull();
      expect(component.logoutBtn).not.toBeNull();
      expect(component.loginLink).not.toBeNull();
      expect(document.title).toBe('Test App');
      expect(mockAppTitle.textContent).toBe('App Title');
      expect(mockAppDescription.textContent).toBe('App Description');
      expect(mockLogoutBtn.addEventListener).toHaveBeenCalled();
      expect(mockLoginLink.addEventListener).toHaveBeenCalled();
    });

    // Scenario: Auth state change event should trigger UI update
    test('should update UI when authStateChanged event fires', async () => {
      component = HeaderComponent.getInstance();
      
      global.fetch
        .mockResolvedValueOnce({
          text: jest.fn().mockResolvedValue('<header></header>')
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            app: {
              title: 'Test App',
              header: { h1: 'Title', p: 'Description' }
            }
          })
        });

      await component.init();

      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getUserData.mockReturnValue({ email: 'user@test.com' });

      // Simulate authStateChanged event
      const eventCallback = document.addEventListener.mock.calls.find(
        (call) => call[0] === 'authStateChanged'
      )[1];
      eventCallback();

      expect(mockUserDisplay.textContent).toBe('Welcome, user@test.com');
      expect(mockLogoutBtn.style.display).toBe('inline-block');
      expect(mockLoginLink.style.display).toBe('none');
    });

    // Scenario: Logout flow should clear auth and redirect
    test('should complete logout flow from button click to redirect', async () => {
      component = HeaderComponent.getInstance();
      component.userDisplay = mockUserDisplay;
      component.logoutBtn = mockLogoutBtn;
      component.loginLink = mockLoginLink;

      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.getUserData.mockReturnValue({ email: 'user@test.com' });

      component.attachEventListeners();
      window.location.href = '';

      // Simulate logout button click
      const logoutClickHandler = mockLogoutBtn.addEventListener.mock.calls[0][1];
      const mockEvent = { preventDefault: jest.fn() };
      
      await logoutClickHandler(mockEvent);
      jest.advanceTimersByTime(500);

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(document.dispatchEvent).toHaveBeenCalled();
      expect(window.location.href).toBe('#login');
    });

  // TODO: Add your tests here
  // Example:
  // test('should do something', () => {
  //   expect(result).toBe(expected);
  // });
  });
});

