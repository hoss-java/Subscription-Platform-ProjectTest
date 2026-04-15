// Test file for: webclientv1/src/js/services/authGuard.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { AuthService } = loadModules('AuthService');

try {
  const authService = new AuthService();
} catch (error) {
  console.log('Error creating authService:', error.message);
}

const { AuthGuard } = loadModules('AuthGuard');

describe('AuthGuard', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: AuthGuard
  // Purpose: Route protection and authentication validation for client-side navigation
  // 
  // SETUP OVERVIEW:
  // - Mock authService with isAuthenticated(), validateToken(), and clearAuth() methods
  // - Reset authGuard instance between tests
  //
  // TESTING RULES & BEST PRACTICES:
  // 1. Prefer parametrized tests (test.each) instead of repeating similar tests
  //    - Reduces code duplication
  //    - Makes it easy to add more test cases
  //    - Improves readability with clear input/output mappings
  //
  // 2. Unit tests should mock all external dependencies
  //    - Mock authService methods
  //    - Only test AuthGuard logic, not authService behavior
  //
  // 3. One assertion per test concept (can have multiple expects for same concept)
  //    - Tests should be focused and test one behavior
  //    - Easier to identify what failed
  //
  // 4. Use descriptive test names following: "should [expected behavior] when [condition]"
  //    - Makes test purpose clear without reading the test body
  //
  // 5. Mock methods that cause side effects
  //    - authService.clearAuth(), authService.validateToken()
  //    - Setup mocks in beforeEach or at test level
  //
  // 6. Clean up after each test
  //    - Reset mocks between tests
  //    - Prevents test pollution
  //
  // TEST INVENTORY:
  //
  // AUTHENTICATION STATUS TESTS (Parametrized):
  // 1. isAuthenticated() - should return auth status from authService
  // 2. isPublicPage() - should correctly identify public vs protected pages
  //
  // TOKEN VALIDATION TESTS:
  // 3. validateTokenWithBackend() - should return true when token is valid
  // 4. validateTokenWithBackend() - should clear auth and return false when token validation fails
  //
  // ROUTE GUARDING TESTS (Parametrized):
  // 5. guardRoute() - should handle authentication and redirection based on auth state and page access
  // 6. guardRoute() - should redirect to login when token validation fails
  //
  // INITIALIZATION TESTS (Parametrized):
  // 7. initialize() - should return correct redirect based on auth state and token validity

  let authGuard;
  let mockAuthService;

  // ===== SETUP =====
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    AuthGuard.instance = null;
    
    mockAuthService = {
      isAuthenticated: jest.fn(),
      validateToken: jest.fn(),
      clearAuth: jest.fn()
    };
    
    authGuard = new AuthGuard(mockAuthService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    AuthGuard.instance = null;
  });

  // REMOVE IT AFTER CODING THE FIRST TEST
  test('should be defined', () => {
    expect(AuthGuard).toBeDefined();
  });

  // ---

  // ===== AUTHENTICATION STATUS TESTS (Parametrized) =====

  // Test 1
  // Test: isAuthenticated() - should return auth status from authService
  // Scenario: AuthGuard delegates to authService to check authentication status
  // Methods tested: isAuthenticated()
  // Mocks: authService.isAuthenticated() - returns test values
  // Expected: Returns exact value from mocked authService
  test.each([
    [true],
    [false]
  ])('Test 1: isAuthenticated() should return %s from authService', (authStatus) => {
    mockAuthService.isAuthenticated.mockReturnValue(authStatus);
    expect(authGuard.isAuthenticated()).toBe(authStatus);
  });

  // Test 2
  // Test: isPublicPage() - should correctly identify public vs protected pages
  // Scenario: Determine if a page is public (login, register) or protected (other pages)
  // Methods tested: isPublicPage()
  // Mocks: None - pure logic test
  // Expected: Returns true for public pages, false for protected pages
  test.each([
    ['login', true],
    ['register', true],
    ['home', false],
    ['dashboard', false],
    ['profile', false]
  ])('Test 2: isPublicPage() should identify "%s" as %s', (page, isPublic) => {
    expect(authGuard.isPublicPage(page)).toBe(isPublic);
  });

  // ---

  // ===== TOKEN VALIDATION TESTS =====

  // Test 3
  // Test: validateTokenWithBackend() - should return true when token is valid
  // Scenario: Backend validates the token successfully
  // Methods tested: validateTokenWithBackend()
  // Mocks: authService.validateToken() - resolves successfully
  // Expected: Returns true and authService.clearAuth() is not called
  test('Test 3: validateTokenWithBackend() should return true when token is valid', async () => {
    mockAuthService.validateToken.mockResolvedValue(true);
    const result = await authGuard.validateTokenWithBackend();
    expect(result).toBe(true);
    expect(mockAuthService.clearAuth).not.toHaveBeenCalled();
  });

  // Test 4
  // Test: validateTokenWithBackend() - should clear auth and return false when token validation fails
  // Scenario: Backend validation throws error or token is invalid
  // Methods tested: validateTokenWithBackend()
  // Mocks: authService.validateToken() - rejects with error
  // Expected: Returns false and authService.clearAuth() is called
  test('Test 4: validateTokenWithBackend() should clear auth and return false when token is invalid', async () => {
    mockAuthService.validateToken.mockRejectedValue(new Error('Token expired'));
    const result = await authGuard.validateTokenWithBackend();
    expect(result).toBe(false);
    expect(mockAuthService.clearAuth).toHaveBeenCalled();
  });

  // ---

  // ===== ROUTE GUARDING TESTS (Parametrized) =====

  // Test 5
  // Test: guardRoute() - should handle authentication and redirection based on auth state and page access
  // Scenario: Various combinations of auth state, page type, and token validity
  // Methods tested: guardRoute(), isAuthenticated(), isPublicPage(), validateTokenWithBackend()
  // Mocks: authService.isAuthenticated(), authService.validateToken()
  // Expected: Returns correct redirect page based on conditions
  test.each([
    [true, 'login', true, 'home'],      // Authenticated user tries public page → redirect home
    [true, 'register', true, 'home'],   // Authenticated user tries public page → redirect home
    [false, 'home', true, 'login'],     // Unauthenticated user tries protected page → redirect login
    [false, 'dashboard', true, 'login'], // Unauthenticated user tries protected page → redirect login
    [true, 'home', true, 'home'],       // Authenticated with valid token on protected page → allow access
    [true, 'dashboard', true, 'dashboard'] // Authenticated with valid token on protected page → allow access
  ])('Test 5: guardRoute() with isAuth=%s, page="%s", tokenValid=%s should redirect to "%s"', async (isAuth, page, tokenValid, expected) => {
    mockAuthService.isAuthenticated.mockReturnValue(isAuth);
    mockAuthService.validateToken.mockResolvedValue(tokenValid);
    const result = await authGuard.guardRoute(page);
    expect(result).toBe(expected);
  });

  // Test 6
  // Test: guardRoute() - should redirect to login when token validation fails
  // Scenario: User is authenticated but token is invalid/expired
  // Methods tested: guardRoute(), validateTokenWithBackend()
  // Mocks: authService.isAuthenticated() returns true, authService.validateToken() rejects
  // Expected: Returns 'login' and clearAuth() is called
  test('Test 6: guardRoute() should redirect to login when token validation fails', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.validateToken.mockRejectedValue(new Error('Token expired'));
    const result = await authGuard.guardRoute('home');
    expect(result).toBe('login');
    expect(mockAuthService.clearAuth).toHaveBeenCalled();
  });

  // ---

  // ===== INITIALIZATION TESTS (Parametrized) =====

  // Test 7
  // Test: initialize() - should return correct redirect based on auth state and token validity
  // Scenario: Various combinations of auth state and token validity on app initialization
  // Methods tested: initialize(), isAuthenticated(), validateTokenWithBackend()
  // Mocks: authService.isAuthenticated(), authService.validateToken()
  // Expected: Returns 'login' for unauthenticated, 'home' for authenticated with valid token, 'login' for invalid token
  test.each([
    [false, true, 'login'],   // Not authenticated → redirect login
    [true, true, 'home'],     // Authenticated with valid token → redirect home
    [true, true, 'login']     // Authenticated but validateToken rejects → redirect login
  ])('Test 7: initialize() with isAuth=%s, tokenValid=%s should redirect to "%s"', async (isAuth, tokenValid, expected) => {
    mockAuthService.isAuthenticated.mockReturnValue(isAuth);
    if (expected === 'login' && isAuth) {
      mockAuthService.validateToken.mockRejectedValue(new Error('Token invalid'));
    } else {
      mockAuthService.validateToken.mockResolvedValue(tokenValid);
    }
    const result = await authGuard.initialize();
    expect(result).toBe(expected);
  });

});
