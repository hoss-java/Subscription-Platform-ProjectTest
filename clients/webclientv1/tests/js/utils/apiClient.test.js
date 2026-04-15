// Test file for: webclientv1/src/js/utils/apiClient.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { ApiClient } = loadModules('ApiClient');

describe('ApiClient', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: ConsoleWindow
  // Purpose: A draggable, resizable console window for displaying logs with filtering, copying, and source code viewing
  // 
  // SETUP OVERVIEW:
  // - jest.useFakeTimers(): Mock setTimeout/setInterval for time-based tests
  // - jest.spyOn(console, 'error'): Suppress console errors during tests
  // - ConsoleWindow.instance = null: Reset singleton instance between tests
  // - document.body.innerHTML: Mock DOM structure with required elements
  // - jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer'): Mock DOM-heavy initialization
  //
  // SHARED MOCKS:
  // - ConsoleWindow.prototype.setupSourceViewer() - Prevents errors from DOM element creation
  //
  // TESTING RULES & BEST PRACTICES:
  // 1. Prefer parametrized tests (test.each) instead of repeating similar tests
  //    - Reduces code duplication
  //    - Makes it easy to add more test cases
  //    - Improves readability with clear input/output mappings
  //
  // 2. Unit tests should mock all external dependencies
  //    - Mock DOM elements, fetch calls, timers, services
  //    - Only test the method's logic, not its dependencies
  //    - Isolates the unit under test
  //
  // 3. One assertion per test concept (can have multiple expects for same concept)
  //    - Tests should be focused and test one behavior
  //    - Easier to identify what failed
  //
  // 4. Use descriptive test names following: "should [expected behavior] when [condition]"
  //    - Makes test purpose clear without reading the test body
  //
  // 5. Mock methods that cause side effects
  //    - DOM creation, API calls, localStorage, console output
  //    - Setup mocks in beforeEach or at test level
  //
  // 6. Clean up after each test
  //    - Reset mocks, clear timers, restore spies
  //    - Prevents test pollution
  //
  // TEST INVENTORY:
  // 1. getInstance should return same instance - Singleton pattern verification
  // 2. constructor should initialize with correct default and custom config values - Parametrized: (config, expectedProxyURL, expectedTimeout)
  // 3. setAuthService should assign authService correctly - Parametrized: (authService, isValid)
  // 4. request should include Authorization header when authenticated - Parametrized: (token, hasRefreshToken, expectsHeader)
  // 5. request should handle 204 No Content response - Parametrized: (status, expectedReturn)
  // 6. request should throw error on non-ok response - Parametrized: (status, errorMessage, shouldThrow)
  // 7. request should retry on 401 with token refresh - Parametrized: (retryAttempt, maxRetries, shouldRefresh)
  // 8. request should clear auth and throw after max retries exceeded - Parametrized: (currentAttempt, maxRetries, expectsClearAuth)
  // 9. request should throw error if refresh token fails - Parametrized: (refreshError, expectedMessage)
  // 10. request should dispatch authStateChanged event on auth failure - Parametrized: (failureReason, expectsEvent)
  // 11. HTTP method shortcuts (get, post, put, delete, patch) should call request with correct method - Parametrized: (method, endpoint, data, expectedRequestMethod)
  // 12. request should encode endpoint path in proxy URL - Parametrized: (endpoint, expectedEncodedPath)
  // 13. request should set Content-Type header for POST/PUT/PATCH - Parametrized: (method, hasBody)
  // 14. request should not include body for GET/DELETE requests - Parametrized: (method, shouldHaveBody)
  //


  let component;
  let mockService;
  let mockElement;

  // ===== SETUP =====
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // ===== TEST COMMENT GUIDE =====
  // Every test should include comments above it with:
  // - Test: Brief description of what is being tested
  // - Scenario: The specific use case or condition being tested
  // - Methods tested: Which methods/functions are involved
  // - Mocks: What is mocked and why (e.g., "fetch - prevents actual HTTP calls")
  // - Expected: What the test expects to happen
  // Example:
  // // Test 1: constructor should initialize with correct default and custom config values
  // // Scenario: Creating ApiClient with various config objects should set properties correctly
  // // Methods tested: constructor()
  // // Mocks: None - pure initialization logic
  // // Expected: proxyURL and timeout are set from config or use defaults

  // Test 1: constructor should initialize with correct default and custom config values
  // Scenario: Creating ApiClient with various config objects should set properties correctly
  // Methods tested: constructor()
  // Mocks: global.fetch - prevents HTTP calls
  // Expected: proxyURL and timeout are set from config or use defaults
  test.each([
    [{ proxyURL: './custom.php', timeout: 8000 }, './custom.php', 8000],
    [{ proxyURL: './api.php' }, './api.php', 5000],
    [{ timeout: 3000 }, './proxy.php', 3000],
    [{}, './proxy.php', 5000],
  ])('constructor with config %o should set proxyURL to %s and timeout to %i', (config, expectedProxyURL, expectedTimeout) => {
    const client = new ApiClient(config);
    expect(client.proxyURL).toBe(expectedProxyURL);
    expect(client.timeout).toBe(expectedTimeout);
    expect(client.maxRetries).toBe(3);
  });

  // Test 2: setAuthService should assign authService correctly
  // Scenario: Setting different authService objects should store the reference
  // Methods tested: setAuthService()
  // Mocks: None - simple property assignment
  // Expected: authService property is set to the provided service
  test.each([
    [{ isAuthenticated: () => true, getToken: () => 'token123' }],
    [{ isAuthenticated: () => false }],
    [null],
  ])('setAuthService should assign authService when passed %o', (authService) => {
    const client = new ApiClient({});
    client.setAuthService(authService);
    expect(client.authService).toBe(authService);
  });

  // Test 3: request should include Authorization header when authenticated
  // Scenario: Authenticated requests should include Bearer token in headers
  // Methods tested: request()
  // Mocks: fetch - prevents actual HTTP calls, authService - controls auth state
  // Expected: Authorization header is included with Bearer token when authenticated
  test.each([
    [true, 'token123', true],
    [true, 'abc789', true],
    [false, null, false],
  ])('request should include Authorization header when isAuthenticated=%p and token=%s', async (isAuthenticated, token, shouldHaveHeader) => {
    const client = new ApiClient({});
    const mockAuthService = {
      isAuthenticated: jest.fn(() => isAuthenticated),
      getToken: jest.fn(() => token),
      getRefreshToken: jest.fn(() => null),
    };
    client.setAuthService(mockAuthService);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    await client.request('GET', '/test');

    const callArgs = global.fetch.mock.calls[0][1];
    if (shouldHaveHeader) {
      expect(callArgs.headers['Authorization']).toBe(`Bearer ${token}`);
    } else {
      expect(callArgs.headers['Authorization']).toBeUndefined();
    }
  });

  // Test 4: request should handle 204 No Content response
  // Scenario: 204 status code should return success object without parsing body
  // Methods tested: request()
  // Mocks: fetch - prevents actual HTTP calls
  // Expected: Returns { success: true } and does not attempt to parse JSON
  test.each([
    [204, { success: true }],
  ])('request should handle 204 status', async (status, expected) => {
    const client = new ApiClient({});

    const jsonMock = jest.fn();
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status,
        ok: status >= 200 && status < 300,
        json: jsonMock,  // ← Use the mock function
      })
    );

    const result = await client.request('DELETE', '/test');
    expect(result).toEqual(expected);
    expect(jsonMock).not.toHaveBeenCalled();  // ← Check the mock directly
  });

  // Test 5: request should throw error on non-ok response
  // Scenario: Non-2xx responses should throw errors with appropriate messages
  // Methods tested: request()
  // Mocks: fetch - prevents actual HTTP calls
  // Expected: Error is thrown with error message from response or generic HTTP message
  test.each([
    [400, { message: 'Bad Request' }, 'Bad Request'],
    [403, { error: 'Forbidden' }, 'Forbidden'],
    [500, {}, 'HTTP 500'],
    [502, { message: '', error: '' }, 'HTTP 502'],
  ])('request with status %i and response %o should throw error with message %s', async (status, responseData, expectedMessage) => {
    const client = new ApiClient({});

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status,
        ok: false,
        json: () => Promise.resolve(responseData),
      })
    );

    await expect(client.request('POST', '/test', {})).rejects.toThrow(expectedMessage);
  });

  // Test 6: request should retry on 401 with token refresh
  // Scenario: 401 responses should attempt token refresh and retry the original request
  // Methods tested: request()
  // Mocks: fetch - prevents actual HTTP calls, authService - controls token refresh
  // Expected: refreshToken is called and request is retried with new token
  test.each([
    [0, 3, true],
    [1, 3, true],
    [2, 3, true],
  ])('request with retryAttempt=%i and maxRetries=%i should refresh token and retry', async (retryAttempt, maxRetries, shouldRetry) => {
    const client = new ApiClient({});
    client.maxRetries = maxRetries;

    const mockAuthService = {
      isAuthenticated: jest.fn(() => true),
      getToken: jest.fn(() => 'token123'),
      getRefreshToken: jest.fn(() => 'refreshToken'),
      refreshToken: jest.fn(() => Promise.resolve()),
      clearAuth: jest.fn(),
    };
    client.setAuthService(mockAuthService);

    let callCount = 0;
    global.fetch = jest.fn(() => {
      callCount++;
      return Promise.resolve({
        status: callCount === 1 ? 401 : 200,
        ok: callCount !== 1,
        json: () => Promise.resolve({ success: true }),
      });
    });

    const result = await client.request('GET', '/test', null, retryAttempt);

    if (shouldRetry && retryAttempt < maxRetries) {
      expect(mockAuthService.refreshToken).toHaveBeenCalled();
      expect(callCount).toBe(2);
    }
  });

  // Test 7: request should clear auth and throw after max retries exceeded
  // Scenario: When max retry attempts are exceeded, auth should be cleared
  // Methods tested: request()
  // Mocks: fetch - prevents actual HTTP calls, authService - controls token refresh
  // Expected: clearAuth is called and error is thrown with retry message
  test.each([
    [3, 3, 'Session expired after 3 retry attempts'],
  ])('request with retryAttempt=%i and maxRetries=%i should clear auth and throw', async (retryAttempt, maxRetries, expectedErrorMessage) => {
    const client = new ApiClient({});
    client.maxRetries = maxRetries;

    const mockAuthService = {
      isAuthenticated: jest.fn(() => true),
      getToken: jest.fn(() => 'token123'),
      getRefreshToken: jest.fn(() => 'refreshToken'),
      clearAuth: jest.fn(),
    };
    client.setAuthService(mockAuthService);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 401,
        ok: false,
        json: () => Promise.resolve({ success: false }),
      })
    );

    await expect(client.request('GET', '/test', null, retryAttempt)).rejects.toThrow(expectedErrorMessage);
    expect(mockAuthService.clearAuth).toHaveBeenCalled();
  });

  // Test 8: request should throw error if refresh token fails
  // Scenario: When token refresh fails, auth should be cleared and error thrown
  // Methods tested: request()
  // Mocks: fetch - prevents actual HTTP calls, authService - refresh fails
  // Expected: clearAuth is called and error is thrown with appropriate message
  test.each([
    [0, 'Refresh failed', 'Session expired on attempt 1'],
    [1, 'Network error', 'Session expired on attempt 2'],
  ])('request with retryAttempt=%i should throw when refresh fails', async (retryAttempt, errorMessage, expectedMessage) => {
    const client = new ApiClient({});
    const refreshError = new Error(errorMessage);
    
    const mockAuthService = {
      isAuthenticated: jest.fn(() => true),
      getToken: jest.fn(() => 'token123'),
      getRefreshToken: jest.fn(() => 'refreshToken'),
      refreshToken: jest.fn(() => Promise.reject(refreshError)),
      clearAuth: jest.fn(),
    };
    client.setAuthService(mockAuthService);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 401,
        ok: false,
        json: () => Promise.resolve({ success: false }),
      })
    );

    await expect(client.request('GET', '/test', null, retryAttempt)).rejects.toThrow(expectedMessage);
    expect(mockAuthService.clearAuth).toHaveBeenCalled();
  });

  // Test 9: HTTP method shortcuts should call request with correct method
  // Scenario: get, post, put, delete, patch shortcuts should delegate to request()
  // Methods tested: get(), post(), put(), delete(), patch(), request()
  // Mocks: fetch - prevents actual HTTP calls
  // Expected: request is called with correct HTTP method and parameters
  test.each([
    ['get', 'GET', '/users', null],
    ['post', 'POST', '/users', { name: 'John' }],
    ['put', 'PUT', '/users/1', { name: 'Jane' }],
    ['delete', 'DELETE', '/users/1', null],
    ['patch', 'PATCH', '/users/1', { status: 'active' }],
  ])('%s() should call request with method %s', async (methodName, expectedMethod, endpoint, data) => {
    const client = new ApiClient({});

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    const requestSpy = jest.spyOn(client, 'request');

    if (data) {
      await client[methodName](endpoint, data);
      expect(requestSpy).toHaveBeenCalledWith(expectedMethod, endpoint, data);
    } else {
      await client[methodName](endpoint);
      expect(requestSpy).toHaveBeenCalledWith(expectedMethod, endpoint);
    }
  });

  // Test 10: request should encode endpoint path in proxy URL
  // Scenario: Endpoint paths with special characters should be URL encoded
  // Methods tested: request()
  // Mocks: fetch - prevents actual HTTP calls
  // Expected: Proxy URL contains encoded endpoint path
  test.each([
    ['/api/users', '%2Fapi%2Fusers'],
    ['/search?q=test', '%2Fsearch%3Fq%3Dtest'],
    ['/files/my file.txt', '%2Ffiles%2Fmy%20file.txt'],
  ])('request with endpoint %s should encode path as %s in proxy URL', async (endpoint, expectedEncoded) => {
    const client = new ApiClient({ proxyURL: './proxy.php' });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    await client.request('GET', endpoint);

    const actualUrl = global.fetch.mock.calls[0][0];
    expect(actualUrl).toContain(`path=${expectedEncoded}`);
  });

  // Test 11: request should set Content-Type header for POST/PUT/PATCH
  // Scenario: Requests with bodies should have Content-Type application/json
  // Methods tested: request()
  // Mocks: fetch - prevents actual HTTP calls
  // Expected: Content-Type header is set to application/json for methods with data
  test.each([
    ['POST', { name: 'John' }, true],
    ['PUT', { id: 1, name: 'Jane' }, true],
    ['PATCH', { status: 'active' }, true],
    ['GET', null, true],
    ['DELETE', null, true],
  ])('request with method %s and data %o should set Content-Type header', async (method, data, shouldHaveContentType) => {
    const client = new ApiClient({});

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    await client.request(method, '/test', data);

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers['Content-Type']).toBe('application/json');
  });

  // Test 12: request should not include body for GET/DELETE requests
  // Scenario: GET and DELETE requests should have null body even if data is provided
  // Methods tested: request()
  // Mocks: fetch - prevents actual HTTP calls
  // Expected: Body is null for GET/DELETE, JSON stringified for POST/PUT/PATCH
  test.each([
    ['GET', null, null],
    ['DELETE', null, null],
    ['POST', { name: 'John' }, '{"name":"John"}'],
    ['PUT', { id: 1 }, '{"id":1}'],
    ['PATCH', { status: 'active' }, '{"status":"active"}'],
  ])('request with method %s and data %o should have body %s', async (method, data, expectedBody) => {
    const client = new ApiClient({});

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    await client.request(method, '/test', data);

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.body).toBe(expectedBody);
  });

  // Test 13: request should dispatch authStateChanged event on auth failure
  // Scenario: When auth fails and is cleared, authStateChanged event should be dispatched
  // Methods tested: request()
  // Mocks: fetch - prevents actual HTTP calls, authService - controls auth state
  // Expected: authStateChanged event is dispatched to document
  test.each([
    [401, 'Session expired. Please login again.'],
  ])('request with status %i should dispatch authStateChanged event', async (status, expectedMessage) => {
    const client = new ApiClient({});

    const mockAuthService = {
      isAuthenticated: jest.fn(() => false),
      getToken: jest.fn(() => null),
      getRefreshToken: jest.fn(() => null),
      clearAuth: jest.fn(),
    };
    client.setAuthService(mockAuthService);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        status,
        ok: false,
        json: () => Promise.resolve({ success: false }),
      })
    );

    const dispatchSpy = jest.spyOn(document, 'dispatchEvent');

    await expect(client.request('GET', '/test')).rejects.toThrow(expectedMessage);

    const dispatchedEvent = dispatchSpy.mock.calls.find(
      call => call[0].type === 'authStateChanged'
    );
    expect(dispatchedEvent).toBeDefined();
    expect(mockAuthService.clearAuth).toHaveBeenCalled();
  });
});
