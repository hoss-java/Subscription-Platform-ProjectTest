// Test file for: webclientv1/src/js/services/authService.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { AuthService } = loadModules('AuthService');

describe('AuthService', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: AuthService
  // Purpose: Handle user authentication, token management, and password operations for client-side auth flow
  // 
  // SETUP OVERVIEW:
  // - Mock apiClient with post() and get() methods
  // - Mock localStorage with setItem(), getItem(), removeItem()
  // - Mock console.error() and console.warn() to suppress logs during tests
  // - Mock document.dispatchEvent() to verify events
  //
  // TESTING RULES & BEST PRACTICES:
  // 1. Prefer parametrized tests (test.each) instead of repeating similar tests
  //    - Reduces code duplication
  //    - Makes it easy to add more test cases
  //    - Improves readability with clear input/output mappings
  //
  // 2. Unit tests should mock all external dependencies
  //    - Mock apiClient methods
  //    - Mock localStorage operations
  //    - Only test AuthService logic, not API or storage behavior
  //
  // 3. One assertion per test concept (can have multiple expects for same concept)
  //    - Tests should be focused and test one behavior
  //    - Easier to identify what failed
  //
  // 4. Use descriptive test names following: "should [expected behavior] when [condition]"
  //    - Makes test purpose clear without reading the test body
  //
  // 5. Mock methods that cause side effects
  //    - apiClient.post(), apiClient.get()
  //    - localStorage operations
  //    - console output, document events
  //    - Setup mocks in beforeEach or at test level
  //
  // 6. Clean up after each test
  //    - Reset mocks between tests
  //    - Clear localStorage
  //    - Restore spies
  //    - Prevents test pollution
  //
  // TEST INVENTORY:
  //
  // REGISTRATION TESTS:
  // 1. register() - should send registration data to API
  // 2. register() - should throw error when API call fails
  //
  // LOGIN TESTS (Parametrized):
  // 3. login() - should store token, refresh token, user data, and email in localStorage
  // 4. login() - should handle alternative response formats
  // 5. login() - should throw error when no token is received
  // 6. login() - should throw error when API call fails
  //
  // LOGOUT TESTS:
  // 7. logout() - should clear auth data and call logout API endpoint
  // 8. logout() - should return true even if API call fails
  //
  // TOKEN REFRESH TESTS:
  // 9. refreshToken() - should update token in localStorage
  // 10. refreshToken() - should throw error when no refresh token is available
  // 11. refreshToken() - should throw error when no token is received from refresh endpoint
  //
  // TOKEN VALIDATION TESTS:
  // 12. validateToken() - should call validation endpoint
  // 13. validateToken() - should throw error when validation fails
  //
  // PASSWORD MANAGEMENT TESTS:
  // 14. changePassword() - should send password change request to API
  // 15. forgotPassword() - should send email for password reset
  // 16. resetPassword() - should reset password with token
  //
  // LOCALSTORAGE OPERATIONS TESTS (Parametrized):
  // 17. setItem() and getItem() - should store and retrieve string values
  // 18. setItem() and getItem() - should store and retrieve object values with JSON parsing
  // 19. setUser() and getUser() - should store and retrieve user data
  // 20. setToken() and getToken() - should store and retrieve auth token
  // 21. setRefreshToken() and getRefreshToken() - should store and retrieve refresh token
  //
  // AUTHENTICATION STATUS TESTS:
  // 22. isAuthenticated() - should return true when token exists
  // 23. isAuthenticated() - should return false when no token exists
  //
  // CLEAR AUTH TESTS:
  // 24. clearAuth() - should remove all auth keys from localStorage
  //
  // API CLIENT SETUP TESTS:
  // 25. setApiClient() - should store API client reference

  let authService;
  let mockApiClient;

  // ===== SETUP =====
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(localStorage, 'setItem');
    jest.spyOn(localStorage, 'getItem');
    jest.spyOn(localStorage, 'removeItem');
    jest.spyOn(document, 'dispatchEvent');
    
    mockApiClient = {
      post: jest.fn(),
      get: jest.fn()
    };
    
    authService = new AuthService();
    authService.setApiClient(mockApiClient);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    localStorage.clear();
  });

  // REMOVE IT AFTER CODING THE FIRST TEST
  test('should be defined', () => {
    expect(AuthService).toBeDefined();
  });

  // ---

  // ===== REGISTRATION TESTS =====

  // Test 1
  // Test: register() - should send registration data to API
  // Scenario: User submits registration form with valid credentials
  // Methods tested: register(), setApiClient()
  // Mocks: apiClient.post() - resolves with registration response
  // Expected: Returns API response and calls post with correct endpoint and data
  test('Test 1: register() should send registration data to API', async () => {
    const mockResponse = { id: 1, email: 'test@example.com', message: 'Registration successful' };
    mockApiClient.post.mockResolvedValue(mockResponse);
    
    const result = await authService.register('test@example.com', 'password123', 'password123', 'John', 'Doe');
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
    expect(result).toEqual(mockResponse);
  });

  // Test 2
  // Test: register() - should throw error when API call fails
  // Scenario: Backend returns error or network fails
  // Methods tested: register()
  // Mocks: apiClient.post() - rejects with error
  // Expected: Throws error and logs to console.error
  test('Test 2: register() should throw error when API call fails', async () => {
    const mockError = new Error('Server error');
    mockApiClient.post.mockRejectedValue(mockError);
    
    await expect(authService.register('test@example.com', 'password123', 'password123', 'John', 'Doe')).rejects.toThrow('Server error');
    expect(console.error).toHaveBeenCalled();
  });

  // ---

  // ===== LOGIN TESTS =====

  // Test 3
  // Test: login() - should store token, refresh token, user data, and email in localStorage
  // Scenario: Successful login with valid credentials
  // Methods tested: login(), setToken(), setRefreshToken(), setUser(), setItem()
  // Mocks: apiClient.post() - resolves with token, refreshToken, user, and email
  // Expected: Stores all auth data in localStorage with correct keys
  test('Test 3: login() should store token, refresh token, user data, and email in localStorage', async () => {
    const mockResponse = {
      token: 'access_token_123',
      refresh_token: 'refresh_token_456',
      user: { id: 1, name: 'John Doe' }
    };
    mockApiClient.post.mockResolvedValue(mockResponse);
    
    await authService.login('test@example.com', 'password123');
    
    expect(authService.getToken()).toBe('access_token_123');
    expect(authService.getRefreshToken()).toBe('refresh_token_456');
    expect(authService.getUser()).toEqual({ id: 1, name: 'John Doe' });
    expect(authService.getItem('user_email')).toBe('test@example.com');
  });

  // Test 4
  // Test: login() - should handle alternative response formats (access_token, refreshToken)
  // Scenario: API returns token with different key names (access_token instead of token)
  // Methods tested: login(), setToken()
  // Mocks: apiClient.post() - resolves with access_token and refreshToken keys
  // Expected: Correctly extracts and stores tokens regardless of key naming
  test.each([
    [{ token: 'token1', refresh_token: 'refresh1', user: { id: 1 } }],
    [{ access_token: 'token1', refreshToken: 'refresh1', data: { id: 1 } }]
  ])('Test 4: login() should handle alternative response formats', async (response) => {
    mockApiClient.post.mockResolvedValue(response);
    
    await authService.login('test@example.com', 'password123');
    
    expect(mockApiClient.post).toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  // Test 5
  // Test: login() - should throw error when no token is received
  // Scenario: API response does not contain token or access_token
  // Methods tested: login()
  // Mocks: apiClient.post() - resolves with response missing token
  // Expected: Throws error with message "No token received from server"
  test('Test 5: login() should throw error when no token is received', async () => {
    mockApiClient.post.mockResolvedValue({ user: { id: 1 } });
    
    await expect(authService.login('test@example.com', 'password123')).rejects.toThrow('No token received from server');
  });

  // Test 6
  // Test: login() - should throw error when API call fails
  // Scenario: Backend returns error or network fails
  // Methods tested: login()
  // Mocks: apiClient.post() - rejects with error
  // Expected: Throws error and logs to console.error
  test('Test 6: login() should throw error when API call fails', async () => {
    mockApiClient.post.mockRejectedValue(new Error('Network error'));
    
    await expect(authService.login('test@example.com', 'password123')).rejects.toThrow('Network error');
    expect(console.error).toHaveBeenCalled();
  });

  // ---

  // ===== LOGOUT TESTS =====

  // Test 7
  // Test: logout() - should clear auth data and call logout API endpoint
  // Scenario: User clicks logout button
  // Methods tested: logout(), clearAuth()
  // Mocks: apiClient.post() - resolves successfully, document.dispatchEvent() - called with event
  // Expected: Clears localStorage and calls logout endpoint, dispatches authStateChanged event
  test('Test 7: logout() should clear auth data and call logout API endpoint', async () => {
    localStorage.setItem('auth_token', 'token123');
    localStorage.setItem('user_data', '{"id":1}');
    
    await authService.logout();
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout', {});
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(document.dispatchEvent).toHaveBeenCalled();
    const dispatchedEvent = document.dispatchEvent.mock.calls[0][0];
    expect(dispatchedEvent.type).toBe('authStateChanged');
  });

  // Test 8
  // Test: logout() - should return true even if API call fails
  // Scenario: Logout API call fails but local auth should still clear
  // Methods tested: logout(), clearAuth()
  // Mocks: apiClient.post() - rejects with error
  // Expected: Returns true, clears auth, logs warning, and dispatches event
  test('Test 8: logout() should return true even if API call fails', async () => {
    localStorage.setItem('auth_token', 'token123');
    mockApiClient.post.mockRejectedValue(new Error('API error'));
    
    const result = await authService.logout();
    
    expect(result).toBe(true);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(console.warn).toHaveBeenCalled();
    expect(document.dispatchEvent).toHaveBeenCalled();
  });

  // ---

  // ===== TOKEN REFRESH TESTS =====

  // Test 9
  // Test: refreshToken() - should update token in localStorage
  // Scenario: Token is refreshed successfully
  // Methods tested: refreshToken(), getRefreshToken(), setToken()
  // Mocks: apiClient.post() - resolves with new token
  // Expected: New token is stored in localStorage
  test('Test 9: refreshToken() should update token in localStorage', async () => {
    localStorage.setItem('refresh_token', 'refresh123');
    const mockResponse = { token: 'new_token_789', refresh_token: 'new_refresh_456' };
    mockApiClient.post.mockResolvedValue(mockResponse);
    
    await authService.refreshToken();
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'refresh123' });
    expect(authService.getToken()).toBe('new_token_789');
  });

  // Test 10
  // Test: refreshToken() - should throw error when no refresh token is available
  // Scenario: Refresh token not found in localStorage
  // Methods tested: refreshToken(), getRefreshToken()
  // Mocks: localStorage empty
  // Expected: Throws error with message "No refresh token available"
  test('Test 10: refreshToken() should throw error when no refresh token is available', async () => {
    await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
  });

  // Test 11
  // Test: refreshToken() - should throw error when no token is received from refresh endpoint
  // Scenario: API response doesn't contain new token
  // Methods tested: refreshToken()
  // Mocks: apiClient.post() - resolves without token
  // Expected: Throws error with message "No token received from refresh endpoint"
  test('Test 11: refreshToken() should throw error when no token is received from refresh endpoint', async () => {
    localStorage.setItem('refresh_token', 'refresh123');
    mockApiClient.post.mockResolvedValue({ message: 'success' });
    
    await expect(authService.refreshToken()).rejects.toThrow('No token received from refresh endpoint');
  });

  // ---

  // ===== TOKEN VALIDATION TESTS =====

  // Test 12
  // Test: validateToken() - should call validation endpoint
  // Scenario: Check if current token is valid
  // Methods tested: validateToken()
  // Mocks: apiClient.get() - resolves with validation response
  // Expected: Calls /auth/validate endpoint and returns response
  test('Test 12: validateToken() should call validation endpoint', async () => {
    const mockResponse = { valid: true };
    mockApiClient.get.mockResolvedValue(mockResponse);
    
    const result = await authService.validateToken();
    
    expect(mockApiClient.get).toHaveBeenCalledWith('/auth/validate');
    expect(result).toEqual(mockResponse);
  });

  // Test 13
  // Test: validateToken() - should throw error when validation fails
  // Scenario: Token is invalid or expired
  // Methods tested: validateToken()
  // Mocks: apiClient.get() - rejects with error
  // Expected: Throws error and logs to console.error
  test('Test 13: validateToken() should throw error when validation fails', async () => {
    mockApiClient.get.mockRejectedValue(new Error('Token invalid'));
    
    await expect(authService.validateToken()).rejects.toThrow('Token invalid');
    expect(console.error).toHaveBeenCalled();
  });

  // ---

  // ===== PASSWORD MANAGEMENT TESTS =====

  // Test 14
  // Test: changePassword() - should send password change request to API
  // Scenario: User changes their password
  // Methods tested: changePassword()
  // Mocks: apiClient.post() - resolves successfully
  // Expected: Calls endpoint with current and new password
  test('Test 14: changePassword() should send password change request to API', async () => {
    const mockResponse = { message: 'Password changed successfully' };
    mockApiClient.post.mockResolvedValue(mockResponse);
    
    const result = await authService.changePassword('oldPass123', 'newPass456');
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/change-password', {
      current_password: 'oldPass123',
      new_password: 'newPass456'
    });
    expect(result).toEqual(mockResponse);
  });

  // Test 15
  // Test: forgotPassword() - should send email for password reset
  // Scenario: User requests password reset link
  // Methods tested: forgotPassword()
  // Mocks: apiClient.post() - resolves successfully
  // Expected: Calls endpoint with email and returns response
  test('Test 15: forgotPassword() should send email for password reset', async () => {
    const mockResponse = { message: 'Reset email sent' };
    mockApiClient.post.mockResolvedValue(mockResponse);
    
    const result = await authService.forgotPassword('test@example.com');
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@example.com' });
    expect(result).toEqual(mockResponse);
  });

  // Test 16
  // Test: resetPassword() - should reset password with token
  // Scenario: User submits reset form with reset token and new password
  // Methods tested: resetPassword()
  // Mocks: apiClient.post() - resolves successfully
  // Expected: Calls endpoint with token and new password
  test('Test 16: resetPassword() should reset password with token', async () => {
    const mockResponse = { message: 'Password reset successfully' };
    mockApiClient.post.mockResolvedValue(mockResponse);
    
    const result = await authService.resetPassword('reset_token_xyz', 'newPass789');
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'reset_token_xyz',
      new_password: 'newPass789'
    });
    expect(result).toEqual(mockResponse);
  });

  // ---

  // ===== LOCALSTORAGE OPERATIONS TESTS =====

  // Test 17
  // Test: setItem() and getItem() - should store and retrieve string values
  // Scenario: Save and retrieve authentication data from localStorage
  // Methods tested: setItem(), getItem()
  // Mocks: localStorage mock
  // Expected: Values are stored as-is for strings, parsed when requested
  test.each([
    ['auth_token', 'token_value_123'],
    ['user_email', 'test@example.com'],
    ['refresh_token', 'refresh_xyz']
  ])('Test 17: setItem() and getItem() should store and retrieve string value "%s"', (key, value) => {
    authService.setItem(key, value);
    expect(authService.getItem(key)).toBe(value);
  });

  // Test 18
  // Test: setItem() and getItem() - should store and retrieve object values with JSON parsing
  // Scenario: Save user object and retrieve it parsed
  // Methods tested: setItem(), getItem()
  // Mocks: localStorage mock
  // Expected: Objects are stringified when stored, parsed back to objects when retrieved
  test('Test 18: setItem() and getItem() should store and retrieve object values with JSON parsing', () => {
    const userData = { id: 1, name: 'John', email: 'john@example.com' };
    authService.setItem('user_data', userData);
    
    const retrieved = authService.getItem('user_data', true);
    expect(retrieved).toEqual(userData);
  });

  // Test 19
  // Test: setUser() and getUser() - should store and retrieve user data
  // Scenario: Store authenticated user object and retrieve it
  // Methods tested: setUser(), getUser()
  // Mocks: localStorage mock
  // Expected: User data is stored with correct key and parsed correctly
  test('Test 19: setUser() and getUser() should store and retrieve user data', () => {
    const user = { id: 42, name: 'Jane Doe' };
    authService.setUser(user);
    
    expect(authService.getUser()).toEqual(user);
  });

  // Test 20
  // Test: setToken() and getToken() - should store and retrieve auth token
  // Scenario: Store and retrieve JWT token
  // Methods tested: setToken(), getToken()
  // Mocks: localStorage mock
  // Expected: Token is stored with correct key and retrieved unchanged
  test('Test 20: setToken() and getToken() should store and retrieve auth token', () => {
    const token = 'jwt_token_abc123xyz';
    authService.setToken(token);
    
    expect(authService.getToken()).toBe(token);
  });

  // Test 21
  // Test: setRefreshToken() and getRefreshToken() - should store and retrieve refresh token
  // Scenario: Store and retrieve refresh token
  // Methods tested: setRefreshToken(), getRefreshToken()
  // Mocks: localStorage mock
  // Expected: Refresh token is stored with correct key and retrieved unchanged
  test('Test 21: setRefreshToken() and getRefreshToken() should store and retrieve refresh token', () => {
    const refreshToken = 'refresh_token_xyz789';
    authService.setRefreshToken(refreshToken);
    
    expect(authService.getRefreshToken()).toBe(refreshToken);
  });

  // ---

  // ===== AUTHENTICATION STATUS TESTS =====

  // Test 22
  // Test: isAuthenticated() - should return true when token exists
  // Scenario: User has valid token stored in localStorage
  // Methods tested: isAuthenticated(), getToken()
  // Mocks: localStorage with token
  // Expected: Returns true
  test('Test 22: isAuthenticated() should return true when token exists', () => {
    authService.setToken('token123');
    expect(authService.isAuthenticated()).toBe(true);
  });

  // Test 23
  // Test: isAuthenticated() - should return false when no token exists
  // Scenario: User has no token in localStorage
  // Methods tested: isAuthenticated(), getToken()
  // Mocks: localStorage empty
  // Expected: Returns false
  test('Test 23: isAuthenticated() should return false when no token exists', () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  // ---

  // ===== CLEAR AUTH TESTS =====

  // Test 24
  // Test: clearAuth() - should remove all auth keys from localStorage
  // Scenario: User logs out or token becomes invalid
  // Methods tested: clearAuth()
  // Mocks: localStorage mock
  // Expected: All auth-related items are removed from localStorage
  test('Test 24: clearAuth() should remove all auth keys from localStorage', () => {
    authService.setToken('token123');
    authService.setRefreshToken('refresh123');
    authService.setUser({ id: 1, name: 'John' });
    authService.setItem('user_email', 'test@example.com');
    
    authService.clearAuth();
    
    expect(authService.getToken()).toBeNull();
    expect(authService.getRefreshToken()).toBeNull();
    expect(authService.getUser()).toBeNull();
    expect(authService.getItem('user_email')).toBeNull();
  });

  // ---

  // ===== API CLIENT SETUP TESTS =====

  // Test 25
  // Test: setApiClient() - should store API client reference
  // Scenario: Initialize AuthService with API client
  // Methods tested: setApiClient()
  // Mocks: Mock API client object
  // Expected: API client is stored and available for use
  test('Test 25: setApiClient() should store API client reference', () => {
    const customApiClient = { post: jest.fn(), get: jest.fn() };
    authService.setApiClient(customApiClient);
    
    expect(authService.apiClient).toBe(customApiClient);
  });
});
