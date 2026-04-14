// Test file for: webclientv1/src/js/router.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { Router } = loadModules('Router');

describe('Router', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: Router
  // Purpose: A client-side router that manages page navigation, handles hash-based routing, and enforces authentication protection on routes
  // 
  // SETUP OVERVIEW:
  // - jest.useFakeTimers(): Mock setTimeout/setInterval for time-based tests
  // - jest.spyOn(console, 'error'): Suppress console errors during tests
  // - Router.instance = null: Reset router instance between tests
  // - document.body.innerHTML: Mock DOM structure with page container
  // - global.fetch: Mock fetch calls for loading HTML pages
  //
  // SHARED MOCKS:
  // - global.fetch - Prevents real HTTP requests during tests
  // - window.location.hash - Mocks URL hash changes
  // - authService.isAuthenticated() - Mocks authentication state
  //
  // TESTING RULES & BEST PRACTICES:
  // 1. Prefer parametrized tests (test.each) instead of repeating similar tests
  // 2. Unit tests should mock all external dependencies (fetch, authService, window.location)
  // 3. One assertion per test concept
  // 4. Use descriptive test names: "should [expected behavior] when [condition]"
  // 5. Mock methods that cause side effects (DOM updates, fetch calls, navigation)
  // 6. Clean up after each test (reset mocks, restore spies)
  //
  // TEST INVENTORY:
  // 1. constructor - should initialize container and pages object
  // 2. register - should store page configuration
  // 3. load - should fetch and render HTML
  // 4. load - should redirect authenticated users from login/register
  // 5. load - should redirect unauthenticated users from protected pages
  // 6. load - should initialize page script
  // 7. navigate - should update window.location.hash
  // 8. setAuthService - should set authentication service

  let component;
  let mockService;
  let mockElement;

  // ===== SETUP =====
beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // Create actual container
  const container = document.createElement('div');
  container.id = 'page-container';
  document.body.appendChild(container);
  
  // Mock getElementById to return the real container
  jest.spyOn(document, 'getElementById').mockImplementation((id) => {
    if (id === 'page-container') return container;
    return null;
  });
  
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
  document.body.innerHTML = '';
});



  // ===== TEST 1 =====
  // Test: constructor should initialize container and pages object
  // Scenario: Creating new Router with valid container ID
  // Methods tested: constructor
  // Mocks: document.getElementById - returns mocked container element
  // Expected: router.container and router.pages are initialized
  test('should initialize container and pages object when constructed', () => {
    const router = new Router('page-container');
    expect(router.container).toBeDefined();
    expect(router.pages).toEqual({});
  });

  // ===== TEST 2 =====
  // Test: register should store page configuration
  // Scenario: Registering multiple pages with different protection levels
  // Methods tested: register
  // Mocks: none
  // Expected: page configuration stored in pages object
  test.each([
    ['home', '/pages/home.html', { init: jest.fn() }, false],
    ['dashboard', '/pages/dashboard.html', { init: jest.fn() }, true],
  ])('should register %s page with correct configuration', (pageName, htmlPath, pageScript, isProtected) => {
    const router = new Router('page-container');
    router.register(pageName, htmlPath, pageScript, isProtected);
    expect(router.pages[pageName]).toEqual({ htmlPath, pageScript, isProtected });
  });

  // ===== TEST 3 =====
  // Test: load should fetch and render HTML to container
  // Scenario: Loading a public page successfully
  // Methods tested: load
  // Mocks: global.fetch - returns mocked HTML content, document.getElementById - returns real container
  // Expected: container innerHTML updated and page script initialized
  test('should fetch and render HTML content when loading public page', async () => {
    const mockScript = { init: jest.fn() };
    global.fetch.mockResolvedValueOnce({
      text: jest.fn().mockResolvedValue('<h1>Home</h1>'),
    });
    
    const router = new Router('page-container');
    expect(router.container).not.toBeNull();
    router.register('home', '/pages/home.html', mockScript, false);
    await router.load('home');
    expect(router.container.innerHTML).toBe('<h1>Home</h1>');
    expect(mockScript.init).toHaveBeenCalled();
  });

  // ===== TEST 4 =====
  // Test: load should redirect authenticated users from login/register pages
  // Scenario: Authenticated user tries to access login page
  // Methods tested: load, setAuthService
  // Mocks: authService.isAuthenticated - returns true, window.location.hash
  // Expected: window.location.hash redirects to dashboard
  test('should redirect authenticated user from login to dashboard', async () => {
    const mockAuthService = { isAuthenticated: jest.fn().mockReturnValue(true) };
    const router = new Router('page-container');
    router.setAuthService(mockAuthService);
    router.register('login', '/pages/login.html', null, false);
    await router.load('login');
    expect(window.location.hash).toBe('#dashboard');
  });

  // ===== TEST 5 =====
  // Test: load should redirect unauthenticated users from protected pages
  // Scenario: Unauthenticated user tries to access protected dashboard
  // Methods tested: load, setAuthService
  // Mocks: authService.isAuthenticated - returns false, window.location.hash
  // Expected: window.location.hash redirects to login
  test('should redirect unauthenticated user from protected page to login', async () => {
    const mockAuthService = { isAuthenticated: jest.fn().mockReturnValue(false) };
    const router = new Router('page-container');
    router.setAuthService(mockAuthService);
    router.register('dashboard', '/pages/dashboard.html', null, true);
    await router.load('dashboard');
    expect(window.location.hash).toBe('#login');
  });

  // ===== TEST 6 =====
  // Test: load should initialize page script when page loads successfully
  // Scenario: Page script has init method that should be called
  // Methods tested: load
  // Mocks: global.fetch - returns HTML, pageScript.init - jest.fn()
  // Expected: pageScript.init() is called exactly once
  test('should call page script init method after loading HTML', async () => {
    const mockScript = { init: jest.fn() };
    global.fetch.mockResolvedValueOnce({
      text: jest.fn().mockResolvedValue('<p>Content</p>'),
    });
    const router = new Router('page-container');
    expect(router.container).not.toBeNull();
    router.register('home', '/pages/home.html', mockScript, false);
    await router.load('home');
    expect(mockScript.init).toHaveBeenCalledTimes(1);
  });

  // ===== TEST 7 =====
  // Test: navigate should update window.location.hash
  // Scenario: User navigates to different pages
  // Methods tested: navigate
  // Mocks: window.location.hash assignment
  // Expected: window.location.hash set to correct page name
  test.each([
    ['home'],
    ['dashboard'],
    ['profile'],
  ])('should set window.location.hash to #%s when navigating', (pageName) => {
    const router = new Router('page-container');
    router.navigate(pageName);
    expect(window.location.hash).toBe(`#${pageName}`);
  });

  // ===== TEST 8 =====
  // Test: setAuthService should store authentication service reference
  // Scenario: Setting auth service before routing protected pages
  // Methods tested: setAuthService
  // Mocks: mockAuthService - { isAuthenticated: jest.fn() }
  // Expected: router.authService equals the provided service
  test('should store authService reference when setAuthService is called', () => {
    const mockAuthService = { isAuthenticated: jest.fn() };
    const router = new Router('page-container');
    router.setAuthService(mockAuthService);
    expect(router.authService).toBe(mockAuthService);
  });
});
