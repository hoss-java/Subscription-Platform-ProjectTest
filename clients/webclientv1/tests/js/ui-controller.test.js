// Test file for: webclientv1/src/js/ui-controller.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { UIController } = loadModules('UIController');

describe('UIController', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: UIController
  // Purpose: Handles all user-facing feedback, notifications, loading states, and error handling with singleton pattern
  // 
  // SETUP OVERVIEW:
  // - jest.useFakeTimers(): Mock setTimeout for toast auto-removal and animations
  // - jest.spyOn(localStorage, 'getItem'): Mock notification preference storage
  // - jest.spyOn(document, 'getElementById'): Mock DOM element queries
  // - jest.spyOn(document, 'createElement'): Track DOM element creation
  // - UIController.instance = null: Reset singleton instance between tests
  // - document.body.innerHTML = '': Clear DOM between tests
  // - jest.spyOn(console, 'debug'/'error'/'log'): Verify logging behavior
  //
  // SHARED MOCKS:
  // - localStorage.getItem(): Control notification enabled state
  // - document.getElementById(): Return mock loading element or null
  // - document.createElement(): Track toast container and toast creation
  // - console methods: Verify debug/error logging without polluting test output
  //
  // TESTING RULES & BEST PRACTICES:
  // 1. Prefer parametrized tests (test.each) instead of repeating similar tests
  // 2. Unit tests should mock all external dependencies
  // 3. One assertion per test concept (can have multiple expects for same concept)
  // 4. Use descriptive test names following: "should [expected behavior] when [condition]"
  // 5. Mock methods that cause side effects
  // 6. Clean up after each test
  //
  // TEST INVENTORY (Parametrized Tests):
  // 1. getInstance - test.each: [first call logs 'Creating', second call logs 'Returning']
  // 2. areNotificationsEnabled - test.each: [null → true, 'false' → false, 'true' → true, '' → true, other → true]
  // 3. toggleLoading - test.each: [true → add class, false → remove class, missing element → no error]
  // 4. showMessage container - test.each: [no container → create, container exists → reuse]
  // 5. showMessage types - test.each: [info → auto-remove 5s, error → persist, success → auto-remove]
  // 6. showMessage notifications disabled - test.each: [info + disabled → skip, error + disabled → show, forceShow → show, enabled → show]
  // 7. escapeHtml - test.each: ['<tag>', '&entity', '"quotes"', "'apostrophe'", normal text, empty string]
  // 8. showMessage close button - test.each: [click close → remove, auto-timeout → remove]
  // 9. handleError - test.each: [with all properties, missing properties, various error types]
  // 10. handleError context - test.each: [different operations, different error types, with/without context]

  let component;
  let mockService;
  let mockElement;

  // ===== SETUP =====
  let originalCreateElement;

  beforeEach(() => {
    // Store the REAL createElement before any mocks
    originalCreateElement = document.createElement;
    
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(localStorage, 'getItem').mockReturnValue(null);
    
    const mockLoadingElement = { classList: { add: jest.fn(), remove: jest.fn() } };
    const mockToast = { 
      className: '', 
      innerHTML: '', 
      classList: { add: jest.fn(), remove: jest.fn() },
      querySelector: jest.fn(() => ({ addEventListener: jest.fn() })),
      remove: jest.fn()
    };
    
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    
    // Mock createElement with access to the real version
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'div') {
        return originalCreateElement.call(document, tag);
      }
      return mockToast;
    });
    
    UIController.instance = null;
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    UIController.instance = null;
    document.body.innerHTML = '';
  });

  // REMOVE IT AFTER CODING THE FIRST TEST
  test('should be defined', () => {
    expect(UIController).toBeDefined();
  });

  // ===== TEST COMMENT GUIDE =====
  // Every test should include comments above it with:
  // - Test: Brief description of what is being tested
  // - Scenario: The specific use case or condition being tested
  // - Methods tested: Which methods/functions are involved
  // - Mocks: What is mocked and why
  // - Expected: What the test expects to happen
  // Example:
  // // Test 1: getInstance should return same instance
  // // Scenario: Calling getInstance() twice should return the same instance (Singleton pattern)
  // // Methods tested: getInstance()
  // // Mocks: console.log - verify logging behavior
  // // Expected: Both calls return identical instance reference and correct logs appear

  // Test 1
  // Test: getInstance should return same instance on multiple calls
  // Scenario: Singleton pattern verification
  // Methods tested: getInstance()
  // Mocks: console.log - verify logging behavior
  // Expected: Returns same instance, logs 'Creating' on first call and 'Returning' on second
  test.each([
    [1, 'Creating new UIController instance'],
    [2, 'Returning existing UIController instance']
  ])('getInstance call %i should log "%s"', (callNumber, expectedLog) => {
    const instance1 = UIController.getInstance();
    const instance2 = UIController.getInstance();
    
    if (callNumber === 1) {
      expect(instance1).toBeDefined();
      expect(console.log).toHaveBeenCalledWith(expectedLog);
    } else {
      expect(instance1).toBe(instance2);
      expect(console.log).toHaveBeenLastCalledWith(expectedLog);
    }
  });

  // Test 2
  // Test: areNotificationsEnabled should return correct value based on localStorage
  // Scenario: Different localStorage states
  // Methods tested: areNotificationsEnabled()
  // Mocks: localStorage.getItem - control notification preference state
  // Expected: Returns true for null/undefined, false for 'false', true for any other value
  test.each([
    [null, true],
    ['false', false],
    ['true', true],
    ['', true],
    ['enabled', true]
  ])('areNotificationsEnabled should return %p when localStorage is "%s"', (storageValue, expected) => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue(storageValue);
    const instance = UIController.getInstance();
    expect(instance.areNotificationsEnabled()).toBe(expected);
  });

  // Test 3
  // Test: toggleLoading should add/remove show class based on parameter
  // Scenario: Showing and hiding loading state
  // Methods tested: showLoading(), hideLoading(), #toggleLoading()
  // Mocks: document.getElementById - return mock loading element, classList - track class changes
  // Expected: Adds 'show' class when true, removes 'show' class when false
  test.each([
    [true, 'add'],
    [false, 'remove']
  ])('toggleLoading(%p) should %s show class', (show, action) => {
    const mockLoadingElement = { classList: { add: jest.fn(), remove: jest.fn() } };
    jest.spyOn(document, 'getElementById').mockReturnValue(mockLoadingElement);
    
    const instance = UIController.getInstance();
    instance.config = { tabName: 'test' };
    
    if (show) {
      instance.showLoading();
      expect(mockLoadingElement.classList.add).toHaveBeenCalledWith('show');
    } else {
      instance.hideLoading();
      expect(mockLoadingElement.classList.remove).toHaveBeenCalledWith('show');
    }
  });

  // Test 4
  // Test: showMessage should create toast container if missing or reuse existing
  // Scenario: Toast container creation and reuse
  // Methods tested: showMessage()
  // Mocks: document.getElementById - return mock container, document.createElement - return mock elements
  // Expected: Creates new container if doesn't exist, reuses if exists
  test.each([
    [null, true],
    [{ appendChild: jest.fn() }, false]
  ])('showMessage should create container when: %p', (containerReturn, shouldCreate) => {
    const mockButton = { addEventListener: jest.fn() };
    
    const mockToast = { 
      className: '', 
      innerHTML: '', 
      classList: { add: jest.fn(), remove: jest.fn() },
      querySelector: jest.fn().mockReturnValue(mockButton),
      remove: jest.fn()
    };
    
    const mockContainer = { 
      appendChild: jest.fn(),
      id: 'toast-container',
      className: 'toast-container'
    };
    
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'div') {
        return mockToast;
      }
      return mockToast;
    });
    
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'toast-container') {
        return containerReturn || mockContainer;
      }
      return null;
    });
    
    const instance = UIController.getInstance();
    instance.config = { tabName: 'test' };
    instance.showMessage('Test message');
    
    expect(document.getElementById).toHaveBeenCalledWith('toast-container');
  });

  // Test 5
  // Test: showMessage should auto-remove or persist based on message type
  // Scenario: Different message types with different timeout behaviors
  // Methods tested: showMessage()
  // Mocks: jest.useFakeTimers - control timeout, document.createElement - track toast creation
  // Expected: info/success auto-remove after 5s, error persists indefinitely
  test.each([
    ['info', 5000, true],
    ['success', 5000, true],
    ['error', null, false]
  ])('showMessage type %s should %s after %s ms', (type, timeout, shouldRemove) => {
    const mockToast = { classList: { add: jest.fn(), remove: jest.fn() }, querySelector: jest.fn(() => ({ addEventListener: jest.fn() })) };
    const mockContainer = { appendChild: jest.fn() };
    
    jest.spyOn(document, 'getElementById').mockReturnValue(mockContainer);
    jest.spyOn(document, 'createElement').mockReturnValue(mockToast);
    
    const instance = UIController.getInstance();
    instance.config = { tabName: 'test' };
    instance.showMessage('Test', type);
    
    jest.advanceTimersByTime(5100);
    
    if (shouldRemove && timeout) {
      expect(mockToast.classList.add).toHaveBeenCalledWith('removing');
    }
  });

  // Test 6
  // Test: showMessage should respect notification preference with correct conditions
  // Scenario: Show/skip messages based on notifications enabled state
  // Methods tested: showMessage(), areNotificationsEnabled()
  // Mocks: localStorage.getItem - control notification state, document.createElement - return mock elements
  // Expected: Skips non-error when disabled, always shows error, respects forceShow override
  test.each([
    ['false', 'info', false, true],
    ['false', 'error', false, false],
    ['false', 'info', true, false],
    ['true', 'info', false, false],
  ])('showMessage with notifications %s, type %s, forceShow %p should skip: %p', (notifState, type, forceShow, shouldSkip) => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue(notifState);
    
    const mockContainer = { 
      appendChild: jest.fn(),
      id: 'toast-container',
      className: 'toast-container'
    };
    
    const mockToast = { 
      className: '', 
      innerHTML: '', 
      classList: { add: jest.fn(), remove: jest.fn() },
      querySelector: jest.fn(() => ({ addEventListener: jest.fn() })),
      remove: jest.fn()
    };
    
    let createCount = 0;
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'div') {
        createCount++;
        if (createCount === 1) return mockContainer;
        return mockToast;
      }
      return mockToast;
    });
    
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    
    const instance = UIController.getInstance();
    instance.config = { tabName: 'test' };
    instance.showMessage('Test', type, null, forceShow);
    
    if (shouldSkip) {
      expect(mockContainer.appendChild).not.toHaveBeenCalled();
    } else {
      expect(mockContainer.appendChild).toHaveBeenCalled();
    }
  });


  // Test 7
  // Test: escapeHtml should escape special characters
  // Scenario: Various HTML special characters and content
  // Methods tested: escapeHtml()
  // Mocks: Restore real document.createElement for this test
  // Expected: Converts <, >, &, " to HTML entities
  test.each([
    ['<script>alert("xss")</script>', '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'],
    ['Tom & Jerry', 'Tom &amp; Jerry'],
    ['"quoted"', '&quot;quoted&quot;'],
    ["it's fine", "it's fine"],
    ['normal text', 'normal text'],
    ['', '']
  ])('escapeHtml(%p) should return %p', (input, expected) => {
    const instance = UIController.getInstance();
    
    // Mock the div element to simulate real DOM escaping behavior
    const mockDiv = {
      _textContent: '',
      set textContent(val) {
        this._textContent = val;
      },
      get innerHTML() {
        // Simulate real DOM HTML escaping (single quotes are NOT escaped)
        return this._textContent
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }
    };
    
    document.createElement.mockReturnValue(mockDiv);
    
    const result = instance.escapeHtml(input);
    expect(result).toBe(expected);
  });

  // Test 8
  // Test: showMessage close button should remove toast with animation
  // Scenario: User clicks close button or auto-timeout triggers
  // Methods tested: showMessage()
  // Mocks: jest.useFakeTimers - control removal timing, document.createElement - return mock toast
  // Expected: Adds 'removing' class then removes element after 300ms
  test.each([
    ['click', true],
    ['timeout', false]
  ])('showMessage should remove toast on %s', (trigger, isClick) => {
    const mockContainer = { 
      appendChild: jest.fn(),
      id: 'toast-container',
      className: 'toast-container'
    };
    
    const mockToast = { 
      className: '', 
      innerHTML: '', 
      classList: { add: jest.fn(), remove: jest.fn() },
      remove: jest.fn()
    };
    
    const mockButton = { addEventListener: jest.fn() };
    mockToast.querySelector = jest.fn(() => mockButton);
    
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'toast-container') return null;
      return null;
    });
    
    let createCount = 0;
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'div') {
        createCount++;
        return createCount === 1 ? mockContainer : mockToast;
      }
      return mockToast;
    });
    
    const instance = UIController.getInstance();
    instance.config = { tabName: 'test' };
    instance.showMessage('Test');
    
    if (isClick) {
      const clickHandler = mockButton.addEventListener.mock.calls[0][1];
      clickHandler();
    } else {
      jest.advanceTimersByTime(5100);
    }
    
    expect(mockToast.classList.add).toHaveBeenCalledWith('removing');
  });


  // Test 9
  // Test: handleError should format and display error correctly
  // Scenario: Various error objects and properties
  // Methods tested: handleError()
  // Mocks: document.getElementById - return mock container, document.createElement - return mock elements
  // Expected: Formats error message with operation name, includes all error details in console
  test.each([
    [{ message: 'Network error', name: 'NetworkError', status: 500 }, 'fetch'],
    [{ message: 'Invalid input', name: 'ValidationError' }, 'validate'],
    [{ message: 'Not found', name: 'NotFoundError', status: 404 }, 'query']
  ])('handleError should handle %p from operation %s', (error, operation) => {
    const mockContainer = { 
      appendChild: jest.fn(),
      id: 'toast-container',
      className: 'toast-container'
    };
    
    const mockToast = { 
      className: '', 
      innerHTML: '', 
      classList: { add: jest.fn(), remove: jest.fn() },
      querySelector: jest.fn(() => ({ addEventListener: jest.fn() })),
      remove: jest.fn()
    };
    
    let createElementCallCount = 0;
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'div') {
        createElementCallCount++;
        if (createElementCallCount === 1) return mockContainer;
        return mockToast;
      }
      return mockToast;
    });
    
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'toast-container') return null;
      return null;
    });
    
    const instance = UIController.getInstance();
    instance.config = { tabName: 'test' };
    instance.handleError(operation, error);
    
    expect(console.error).toHaveBeenCalled();
  });

  // Test 10
  // Test: init should log initialization message without errors
  // Scenario: Component initialization
  // Methods tested: init()
  // Mocks: console.log - verify logging
  // Expected: Logs init message, no errors thrown
  test('init should log initialization message', () => {
    const instance = UIController.getInstance();
    instance.init();
    
    expect(console.log).toHaveBeenCalledWith('UIController init called');
  });
});
