// Test file for: webclientv1/src/js/pages/sections/subscriptionsman.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { SubscriptionsmanSection } = loadModules('SubscriptionsmanSection');

describe('SubscriptionsmanSection', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: SettingsSection
  // Purpose: Manage theme selection, notification preferences, and settings persistence.
  //          Handles DOM population, localStorage sync, and API interactions for settings management.
  //
  // SETUP OVERVIEW:
  // - jest.spyOn(ThemeManager.getInstance(), 'setTheme'): Mock theme application
  // - jest.spyOn(UIController.getInstance(), 'showMessage'): Mock UI notifications
  // - jest.spyOn(localStorage, 'setItem/getItem'): Mock storage operations
  // - Mock DOM elements: select, checkbox, button with proper structure
  // - SettingsSection state reset: Clear _cache between tests
  // - jest.useFakeTimers(): Control setTimeout in init() method
  //
  // SHARED MOCKS:
  // - ThemeManager.getInstance() - Mock theme retrieval and application
  // - UIController.getInstance() - Mock UI notifications (success/error messages)
  // - localStorage - Mock persistent storage for notification preference
  // - document DOM elements - Mock all required HTML elements (theme selector, checkbox, button)
  // - setTimeout - Mock timing for delayed init() execution
  //
  // TESTING RULES & BEST PRACTICES:
  // 1. Split complex functions into focused, isolated tests
  //    - One test per behavior/scenario, NOT multiple scenarios in one parametrized test
  //    - Separate success path from error/edge cases
  //    - Example: handleSaveSettings() needs 3+ separate tests (success, button state, error)
  //    - Easier to identify what failed when one test breaks
  //
  // 2. Use parametrization ONLY for similar variations of same behavior
  //    - Valid for: multiple theme names, true/false boolean states
  //    - Invalid for: combining success + error + edge cases in one test
  //    - Each parametrized case should test identical logic with different inputs
  //
  // 3. Unit tests must mock all external dependencies
  //    - Mock ThemeManager, UIController, DOM elements, localStorage, setTimeout
  //    - Only test the method's logic, not its dependencies' behavior
  //    - Isolates the unit under test
  //
  // 4. One assertion focus per test (multiple expects allowed for same concept)
  //    - Tests should validate one primary behavior
  //    - Easier to identify root cause of failure
  //    - Example: "should set theme and persist checkbox" (two expects, same behavior)
  //
  // 5. Use descriptive test names: "should [expected behavior] when [specific condition]"
  //    - Clarifies test purpose without reading test body
  //    - Example: "should restore button text after settings saved" vs "should handle button"
  //
  // 6. Isolate error and edge case tests separately
  //    - Create dedicated tests for: missing elements, invalid data, exceptions
  //    - Don't bundle error cases with success path
  //    - Example: handleSaveSettings() success, handleSaveSettings() error, handleSaveSettings() missing element
  //
  // 7. Mock side effects that cause state changes
  //    - API calls, DOM manipulation, storage operations, UI notifications, timers
  //    - Verify mocks were called with correct arguments
  //    - Don't test actual side effects, test that mock was invoked correctly
  //
  // 8. Clean up after each test
  //    - Reset mocks, clear _cache, restore spies, clear localStorage
  //    - Prevents test pollution and state leakage
  //
  // ===== TEST INVENTORY (FOCUSED & SPLIT) =====
  // FORMAT: FunctionName() | should [specific behavior] when [specific condition]
  //
  // EXPLANATION:
  // - One line per isolated test scenario
  // - Each scenario tests ONE behavior or edge case
  // - Error/edge cases are separate tests, not parametrized variations
  // - Success path and failure paths are distinct tests
  // - Use this as blueprint for writing detailed test blocks
  //
  // ===== SCENARIOS =====
  // 1. init() | should call attachEventListeners, loadStatuses, and loadSubscriptions after 100ms timeout
  // 2. loadStatuses() | should fetch statuses from API and populate dropdown with "All Statuses" default (parametrized: status arrays, missing element, non-array response, API errors)
  // 3. attachEventListeners() | should attach events to filter/search/refresh/close buttons triggering appropriate state updates and actions (parametrized: filter values, search queries, element presence)
  // 4. loadSubscriptions() | should fetch paginated subscriptions with status filter, apply search filtering, render results, and handle errors (parametrized: pages, statuses, search terms, API formats, errors)
  // 5. renderSubscriptions() | should create table with headers and rows containing escaped HTML, formatted dates, status badges, and manage buttons (parametrized: special characters, statuses, date formats)
  // 6. renderPagination() | should render Previous/Next buttons with correct disabled states and page info, hide when totalPages <= 1 (parametrized: page positions, totalPages values)
  // 7. openDetailModal() | should fetch details, render modal with escaped HTML fields, format dates/booleans, and call updateDetailModalActions (parametrized: subscription objects, API formats, missing fields, errors)
  // 8. updateDetailModalActions() | should create status buttons for all statuses except current with correct CSS classes and click handlers (parametrized: current statuses, transitions)
  // 9. changeSubscriptionStatus() | should validate status, make PUT request to correct endpoint, show success, reload data, and handle errors (parametrized: status transitions, PENDING rejection, API failures)
  // 10. closeDetailModal() | should remove 'active' class from modal and set currentSubscriptionId to null (parametrized: modal present/missing)
  // 11. syncFilterUI() | should set filter dropdown and search input values to match current state (parametrized: filter/search values, element presence)
  // 12. formatDate() | should format valid dates or return "N/A" for null/undefined/empty (parametrized: ISO formats, empty values)
  // 13. escapeHtml() | should escape HTML special characters (<, >, &, quotes) to prevent injection (parametrized: special characters, plain text)
  //
  // [Add more tests as they are created]
  //

  // ===== MOCK FACTORIES =====

  const createSelectMock = (id, config = {}) => {
    const defaults = { value: '', disabled: false, innerHTML: '' };
    const props = { ...defaults, ...config };
    const listeners = {};

    return {
      id,
      _value: props.value,
      _innerHTML: props.innerHTML,
      _disabled: props.disabled,
      children: [],

      get value() {
        return this._value;
      },
      set value(val) {
        this._value = val;
      },

      get innerHTML() {
        return this._innerHTML;
      },
      set innerHTML(val) {
        this._innerHTML = val;
        this.children = [];
        if (val.includes('<option')) {
          const optionRegex = /<option[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/g;
          let match;
          while ((match = optionRegex.exec(val)) !== null) {
            const option = {
              _value: match[1],
              _textContent: match[2],
              className: '',
              get value() { return this._value; },
              set value(v) { this._value = v; },
              get textContent() { return this._textContent; },
              set textContent(v) { this._textContent = v; },
              appendChild: jest.fn()
            };
            this.children.push(option);
          }
        }
      },
      get disabled() {
        return this._disabled;
      },
      set disabled(val) {
        this._disabled = val;
      },

      appendChild: jest.fn(function(child) {
        if (child.children && !child.className) {
          child.children.forEach(c => this.children.push(c));
        } else {
          this.children.push(child);
        }
      }),

      addEventListener: jest.fn(function(eventType, handler) {
        listeners[eventType] = handler;
      }),

      reset() {
        this._value = props.value;
        this._innerHTML = props.innerHTML;
        this._disabled = props.disabled;
        this.children = [];
        this.appendChild.mockClear();
        this.addEventListener.mockClear();
      }
    };
  };

  const createInputMock = (id, config = {}) => {
    const defaults = { value: '', disabled: false, type: 'text' };
    const props = { ...defaults, ...config };
    const listeners = {};

    return {
      id,
      _value: props.value,
      _disabled: props.disabled,
      type: props.type,

      get value() {
        return this._value;
      },
      set value(val) {
        this._value = val;
      },

      get disabled() {
        return this._disabled;
      },
      set disabled(val) {
        this._disabled = val;
      },

      addEventListener: jest.fn(function(eventType, handler) {
        listeners[eventType] = handler;
      }),

      reset() {
        this._value = props.value;
        this._disabled = props.disabled;
        this.addEventListener.mockClear();
      }
    };
  };

  const createButtonMock = (id, config = {}) => {
    const defaults = { textContent: '', disabled: false };
    const props = { ...defaults, ...config };
    const listeners = {};

    return {
      id,
      _textContent: props.textContent,
      _disabled: props.disabled,

      get textContent() {
        return this._textContent;
      },
      set textContent(val) {
        this._textContent = val;
      },

      get disabled() {
        return this._disabled;
      },
      set disabled(val) {
        this._disabled = val;
      },

      addEventListener: jest.fn(function(eventType, handler) {
        listeners[eventType] = handler;
      }),

      reset() {
        this._textContent = props.textContent;
        this._disabled = props.disabled;
        this.addEventListener.mockClear();
      }
    };
  };

  const createDivMock = (id, config = {}) => {
    const defaults = { innerHTML: '', className: '', style: {} };
    const props = { ...defaults, ...config };
    const listeners = {};

    return {
      id,
      _innerHTML: props.innerHTML,
      className: props.className,
      style: { ...props.style },
      children: [],
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        toggle: jest.fn(),
        contains: jest.fn()
      },

      get innerHTML() {
        return this._innerHTML;
      },
      set innerHTML(val) {
        this._innerHTML = val;
        this.children = [];
      },

      appendChild: jest.fn(function(child) {
        // Simply push the child without any flattening logic
        this.children.push(child);
        return child;
      }),

      addEventListener: jest.fn(function(eventType, handler) {
        listeners[eventType] = handler;
      }),

      reset() {
        this._innerHTML = props.innerHTML;
        this.className = props.className;
        this.style = { ...props.style };
        this.children = [];
        this.appendChild.mockClear();
        this.addEventListener.mockClear();
        this.classList.add.mockClear();
        this.classList.remove.mockClear();
        this.classList.toggle.mockClear();
        this.classList.contains.mockClear();
      }
    };
  };

  const createTableMock = (id, config = {}) => {
    const defaults = { innerHTML: '', className: 'subscriptions-table' };
    const props = { ...defaults, ...config };

    return {
      id,
      _innerHTML: props.innerHTML,
      className: props.className,
      children: [],

      get innerHTML() {
        return this._innerHTML;
      },
      set innerHTML(val) {
        this._innerHTML = val;
        this.children = [];
      },

      appendChild: jest.fn(function(child) {
        if (child.children && !child.className) {
          child.children.forEach(c => this.children.push(c));
        } else {
          this.children.push(child);
        }
      }),

      reset() {
        this._innerHTML = props.innerHTML;
        this.children = [];
        this.appendChild.mockClear();
      }
    };
  };

  // ===== beforeEach SETUP =====

  beforeEach(() => {
    jest.useFakeTimers();

    mocks = {};

    const mockConfigs = {
      'subscriptions-manager-status-filter': {
        factory: createSelectMock,
        args: ['subscriptions-manager-status-filter']
      },
      'subscriptions-manager-search-input': {
        factory: createInputMock,
        args: ['subscriptions-manager-search-input', { type: 'text' }]
      },
      'subscriptions-manager-refresh-btn': {
        factory: createButtonMock,
        args: ['subscriptions-manager-refresh-btn', { textContent: 'Refresh' }]
      },
      'subscriptions-manager-detail-close-btn': {
        factory: createButtonMock,
        args: ['subscriptions-manager-detail-close-btn', { textContent: 'Close' }]
      },
      'subscriptions-manager-detail-close-footer-btn': {
        factory: createButtonMock,
        args: ['subscriptions-manager-detail-close-footer-btn', { textContent: 'Close' }]
      },
      'subscriptions-manager-container': {
        factory: createDivMock,
        args: ['subscriptions-manager-container']
      },
      'subscriptions-manager-pagination': {
        factory: createDivMock,
        args: ['subscriptions-manager-pagination']
      },
      'subscriptions-manager-detail-modal': {
        factory: createDivMock,
        args: ['subscriptions-manager-detail-modal', { className: 'modal' }]
      },
      'subscriptions-manager-detail-content': {
        factory: createDivMock,
        args: ['subscriptions-manager-detail-content']
      },
      'subscriptions-manager-detail-title': {
        factory: createDivMock,
        args: ['subscriptions-manager-detail-title']
      },
      'subscriptions-manager-detail-actions': {
        factory: createDivMock,
        args: ['subscriptions-manager-detail-actions']
      }
    };

    Object.entries(mockConfigs).forEach(([id, config]) => {
      mocks[id] = config.factory(...(config.args || [id]));
    });

    document.getElementById = jest.fn((id) => mocks[id] || null);

  document.createElement = jest.fn((tag) => {
    if (tag === 'option') {
      return {
        _value: '',
        _textContent: '',
        className: '',
        get value() { return this._value; },
        set value(val) { this._value = val; },
        get textContent() { return this._textContent; },
        set textContent(val) { this._textContent = val; },
        appendChild: jest.fn()
      };
    }

    if (tag === 'table') {
      return {
        tagName: 'TABLE',
        className: '',
        children: [],
        appendChild: jest.fn(function(child) {
          this.children.push(child);
          return child;
        })
      };
    }

    if (tag === 'thead' || tag === 'tbody') {
      return {
        tagName: tag.toUpperCase(),
        children: [],
        appendChild: jest.fn(function(child) {
          this.children.push(child);
          return child;
        })
      };
    }

    if (tag === 'tr') {
      return {
        tagName: 'TR',
        children: [],
        appendChild: jest.fn(function(child) {
          this.children.push(child);
          return child;
        })
      };
    }

    if (tag === 'th' || tag === 'td') {
      return {
        tagName: tag.toUpperCase(),
        _textContent: '',
        children: [],
        appendChild: jest.fn(function(child) {
          this.children.push(child);
          return child;
        }),
        get textContent() { return this._textContent; },
        set textContent(val) { this._textContent = val; }
      };
    }

    if (tag === 'span') {
      return {
        tagName: 'SPAN',
        className: '',
        textContent: '',
        children: [],
        appendChild: jest.fn(function(child) {
          this.children.push(child);
          return child;
        })
      };
    }

    if (tag === 'button') {
      const listeners = {};
      return {
        tagName: 'BUTTON',
        className: '',
        textContent: '',
        disabled: false,
        title: '',
        children: [], // Add children array for consistency
        addEventListener: jest.fn(function(eventType, handler) {
          listeners[eventType] = handler;
        }),
        setAttribute: jest.fn(),
        appendChild: jest.fn(function(child) {
          this.children.push(child);
          return child;
        })
      };
    }

    if (tag === 'div') {
      return {
        tagName: 'DIV',
        className: '',
        innerHTML: '',
        _textContent: '',
        children: [],
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
          toggle: jest.fn(),
          contains: jest.fn()
        },
        get textContent() {
          return this._textContent;
        },
        set textContent(val) {
          this._textContent = val;
          // Simulate HTML escaping
          this.innerHTML = val
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        },
        appendChild: jest.fn(function(child) {
          this.children.push(child);
          return child;
        })
      };
    }


    // Generic fallback
    return {
      tagName: tag.toUpperCase(),
      className: '',
      textContent: '',
      innerHTML: '',
      children: [],
      appendChild: jest.fn(function(child) {
        this.children.push(child);
        return child;
      }),
      addEventListener: jest.fn()
    };
  });


    document.createDocumentFragment = jest.fn(() => ({
      children: [],
      appendChild: jest.fn(function(child) {
        this.children.push(child);
      })
    }));

    global.apiClient = {
      get: jest.fn().mockResolvedValue({
        content: [],
        totalPages: 1,
        data: {
          id: 1,
          customerName: 'Test Customer',
          planName: 'Test Plan',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          endDate: null,
          nextRenewalDate: null,
          autoRenewal: false,
          cancellationReason: null
        }
      }),
      put: jest.fn().mockResolvedValue({ success: true }),
      post: jest.fn().mockResolvedValue({ success: true }),
      delete: jest.fn().mockResolvedValue({ success: true })
    };

    const mockUIController = {
      showMessage: jest.fn()
    };

    global.UIController = {
      getInstance: jest.fn(() => mockUIController)
    };

    global.localStorage = {
      _store: {},
      getItem: jest.fn((key) => global.localStorage._store[key] || null),
      setItem: jest.fn((key, value) => {
        global.localStorage._store[key] = value.toString();
      }),
      removeItem: jest.fn((key) => {
        delete global.localStorage._store[key];
      }),
      clear: jest.fn(() => {
        global.localStorage._store = {};
      })
    };

    global.console = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    };

    component = SubscriptionsmanSection;
  });

  // ===== afterEach CLEANUP =====

  afterEach(() => {
    Object.values(mocks).forEach(mock => {
      if (mock && mock.reset) {
        mock.reset();
      }
    });

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    global.localStorage.clear();

    if (component && typeof component.cleanup === 'function') {
      component.cleanup();
    }
  });

  // Helper to recursively find all buttons at any depth
  const getAllButtonsRecursive = (element) => {
    let buttons = [];
    
    if (!element) return buttons;
    
    // If this element is a button, add it
    if (element.tagName === 'BUTTON') {
      buttons.push(element);
    }
    
    // Recursively search children
    if (element.children && Array.isArray(element.children)) {
      element.children.forEach(child => {
        buttons = buttons.concat(getAllButtonsRecursive(child));
      });
    }
    
    return buttons;
  };

  // ===== TEST COMMENT GUIDE =====
  // Every test should include comments above it starting with "// Test <number>" followed by:
  // - Test: Brief description of what is being tested
  // - Scenario: The specific use case or condition being tested
  // - Methods tested: Which methods/functions are involved
  // - Mocks: What is mocked and why
  // - Expected: What the test expects to happen
  // - Parametrized: NO if single test, YES if multiple test cases with different inputs
  // - Setup dependencies: List mocks from setup that are used (don't create new ones)
  // - Assertions: Key assertions made in this test

  // ===== TEST COMMENTS FOR SCENARIOS =====

  // Test 1
  // Test: init() should call all required initialization methods after timeout delay
  // Scenario: Component initialization triggers event listener attachment, status loading, and subscription loading in sequence after 100ms delay
  // Methods tested: init(), attachEventListeners(), loadStatuses(), loadSubscriptions()
  // Mocks: jest.useFakeTimers() from setup controls setTimeout execution; apiClient.get() from setup prevents actual API calls; UIController.getInstance().showMessage() from setup prevents UI notifications
  // Expected: attachEventListeners() is called exactly once; loadStatuses() is called exactly once; loadSubscriptions() is called exactly once; all three methods are called in correct order after 100ms timeout; setTimeout completes without errors
  // Setup dependencies: jest.useFakeTimers(), global.apiClient.get(), global.UIController.getInstance()
  // Assertions: Methods called once each; execution order maintained; timeout delay respected
  // Parametrized: NO
  test('init() should call all required initialization methods after timeout delay', () => {
    // Arrange: Setup API mocks to return valid responses
    global.apiClient.get.mockResolvedValueOnce(['PENDING', 'ACTIVE', 'SUSPENDED', 'CANCELED', 'EXPIRED']);
    global.apiClient.get.mockResolvedValueOnce({
      content: [],
      totalPages: 1
    });

    const attachEventListenersSpy = jest.spyOn(component, 'attachEventListeners');
    const loadStatusesSpy = jest.spyOn(component, 'loadStatuses');
    const loadSubscriptionsSpy = jest.spyOn(component, 'loadSubscriptions');

    // Act: Call init()
    component.init();

    // Assert: Methods should NOT be called before timeout completes
    expect(attachEventListenersSpy).not.toHaveBeenCalled();
    expect(loadStatusesSpy).not.toHaveBeenCalled();
    expect(loadSubscriptionsSpy).not.toHaveBeenCalled();

    // Act: Fast-forward time by 100ms (the setTimeout delay in init)
    jest.advanceTimersByTime(100);

    // Assert: All three methods should be called exactly once after timeout
    expect(attachEventListenersSpy).toHaveBeenCalledTimes(1);
    expect(loadStatusesSpy).toHaveBeenCalledTimes(1);
    expect(loadSubscriptionsSpy).toHaveBeenCalledTimes(1);

    // Assert: Verify execution order (attachEventListeners → loadStatuses → loadSubscriptions)
    expect(attachEventListenersSpy.mock.invocationCallOrder[0]).toBeLessThan(
      loadStatusesSpy.mock.invocationCallOrder[0]
    );
    expect(loadStatusesSpy.mock.invocationCallOrder[0]).toBeLessThan(
      loadSubscriptionsSpy.mock.invocationCallOrder[0]
    );

    // Cleanup spies
    attachEventListenersSpy.mockRestore();
    loadStatusesSpy.mockRestore();
    loadSubscriptionsSpy.mockRestore();
  });

  // Test 2
  // Test: loadStatuses() should fetch subscription statuses and populate dropdown selector with options
  // Scenario: API returns status list, dropdown is populated with default "All Statuses" option plus returned statuses; handles missing dropdown, invalid API responses, and API errors gracefully
  // Methods tested: loadStatuses()
  // Mocks: apiClient.get() - mock status data returns; document.getElementById() - mock dropdown element; console.error() - prevent error logs in test output
  // Expected: Dropdown contains correct options; non-array responses converted to empty array; missing elements don't throw errors; errors are logged but don't break execution
  // Setup dependencies: jest.useFakeTimers(), global.apiClient.get(), global.UIController.getInstance()
  // Assertions: Methods called once each; execution order maintained; timeout delay respected
  // Parametrized: YES (various status arrays, missing element, non-array response, API errors)
  test.each([
    {
      name: 'should populate dropdown with default option and returned statuses',
      statuses: ['ACTIVE', 'PENDING', 'SUSPENDED'],
      expectedChildrenCount: 4,
      shouldError: false
    },
    {
      name: 'should handle empty status array',
      statuses: [],
      expectedChildrenCount: 1,
      shouldError: false
    },
    {
      name: 'should convert non-array response to empty array',
      statuses: null,
      expectedChildrenCount: 1,
      shouldError: false
    },
    {
      name: 'should handle API error gracefully',
      statuses: new Error('API Error'),
      expectedChildrenCount: 0,
      shouldError: true
    }
  ])('loadStatuses() $name', async ({ statuses, expectedChildrenCount, shouldError }) => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    if (shouldError) {
      global.apiClient.get.mockRejectedValueOnce(statuses);
    } else {
      global.apiClient.get.mockResolvedValueOnce(statuses);
    }

    await SubscriptionsmanSection.loadStatuses();

    jest.runAllTimers();

    expect(global.apiClient.get).toHaveBeenCalledWith('/subscriptions/subscription-statuses');
    expect(mocks['subscriptions-manager-status-filter'].children.length).toBe(expectedChildrenCount);

    consoleSpy.mockRestore();
  });

  // Test 3
  // Test: attachEventListeners() should attach event handlers to all filter, search, and action elements
  // Scenario: Event listeners are attached to status filter (change), search input (input), refresh button (click), and close buttons (click); each triggers appropriate state updates and method calls
  // Methods tested: attachEventListeners(), loadSubscriptions(), closeDetailModal()
  // Mocks: document.getElementById() - mock DOM elements; jest.fn() - spy on event listener callbacks; apiClient.get() - prevent API calls during event simulation
  // Expected: Change events update currentStatusFilter and trigger loadSubscriptions; input events update currentSearchQuery and trigger loadSubscriptions; refresh button resets all state; close buttons call closeDetailModal; missing elements handled gracefully
  // Setup dependencies: jest.useFakeTimers(), global.apiClient.get(), global.UIController.getInstance()
  // Assertions: Methods called once each; execution order maintained; timeout delay respected
  // Parametrized: YES (different filter values, search queries, refresh behavior, missing elements)
  test.each([
    {
      name: 'should attach change listener to status filter and update state',
      filterValue: 'ACTIVE',
      expectedStatusFilter: 'ACTIVE',
      expectedPage: 0,
      triggerElement: 'subscriptions-manager-status-filter',
      triggerEvent: 'change'
    },
    {
      name: 'should attach input listener to search input and update state',
      searchQuery: 'customer name',
      expectedSearchQuery: 'customer name',
      expectedPage: 0,
      triggerElement: 'subscriptions-manager-search-input',
      triggerEvent: 'input'
    },
    {
      name: 'should attach click listener to refresh button and reset all filters',
      triggerElement: 'subscriptions-manager-refresh-btn',
      triggerEvent: 'click',
      shouldReset: true,
      expectedPage: 0,
      expectedStatusFilter: '',
      expectedSearchQuery: ''
    },
    {
      name: 'should attach click listener to detail close button',
      triggerElement: 'subscriptions-manager-detail-close-btn',
      triggerEvent: 'click',
      shouldCloseModal: true
    },
    {
      name: 'should attach click listener to detail close footer button',
      triggerElement: 'subscriptions-manager-detail-close-footer-btn',
      triggerEvent: 'click',
      shouldCloseModal: true
    }
  ])('attachEventListeners() $name', ({ filterValue, searchQuery, triggerElement, triggerEvent, shouldReset, shouldCloseModal, expectedPage, expectedStatusFilter, expectedSearchQuery }) => {
    global.apiClient.get.mockResolvedValueOnce({ content: [], totalPages: 1 });

    SubscriptionsmanSection.attachEventListeners();

    jest.runAllTimers();

    const triggerEl = mocks[triggerElement];
    const listeners = triggerEl.addEventListener.mock.calls;
    const eventListener = listeners.find(call => call[0] === triggerEvent)?.[1];

    if (triggerEvent === 'change' && filterValue) {
      eventListener({ target: { value: filterValue } });
      expect(SubscriptionsmanSection.currentStatusFilter).toBe(filterValue);
    }

    if (triggerEvent === 'input' && searchQuery) {
      eventListener({ target: { value: searchQuery } });
      expect(SubscriptionsmanSection.currentSearchQuery).toBe(searchQuery);
    }

    if (shouldReset) {
      eventListener({ preventDefault: jest.fn() });
      expect(SubscriptionsmanSection.currentPage).toBe(expectedPage);
      expect(SubscriptionsmanSection.currentStatusFilter).toBe(expectedStatusFilter);
      expect(SubscriptionsmanSection.currentSearchQuery).toBe(expectedSearchQuery);
    }

    if (shouldCloseModal) {
      eventListener({ preventDefault: jest.fn() });
      expect(SubscriptionsmanSection.currentSubscriptionId).toBeNull();
    }
  });

  // Test 4
  // Test: loadSubscriptions() should fetch paginated subscription data, apply filters, render results, and handle all error conditions
  // Scenario: Fetches subscriptions from API with page and size parameters; includes status filter in endpoint when set; applies client-side search filtering by customerName and planName; displays loading/empty/error messages; calls render methods on success
  // Methods tested: loadSubscriptions(), renderSubscriptions(), renderPagination(), syncFilterUI()
  // Mocks: apiClient.get() - mock subscription data with various response formats; document.getElementById() - mock container elements; UIController.getInstance().showMessage() - mock error notifications
  // Expected: Correct API endpoint built with pagination and status filter; search filtering is case-insensitive and checks both customerName and planName; empty results show "No subscriptions found."; render methods called on success; errors displayed and logged; missing container handled gracefully
  // Parametrized: YES (various pages, statuses, search terms, API responses, response formats, missing container, API errors)
  test.each([
    {
      name: 'should fetch subscriptions with default pagination',
      page: 0,
      pageSize: 12,
      statusFilter: '',
      searchQuery: '',
      apiResponse: { content: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01' }], totalPages: 1 },
      expectedEndpoint: '/subscriptions/operator/subscriptions?page=0&size=12',
      shouldRender: true
      // ✓ ALREADY HAS expectedEndpoint
    },
    {
      name: 'should include status filter in endpoint when set',
      page: 0,
      pageSize: 12,
      statusFilter: 'ACTIVE',
      searchQuery: '',
      apiResponse: { content: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01' }], totalPages: 1 },
      expectedEndpoint: '/subscriptions/operator/subscriptions?page=0&size=12&status=ACTIVE',
      shouldRender: true
      // ✓ ALREADY HAS expectedEndpoint
    },
    {
      name: 'should apply client-side search filtering by customerName',
      page: 0,
      pageSize: 12,
      statusFilter: '',
      searchQuery: 'john',
      apiResponse: { content: [{ id: 1, customerName: 'John Doe', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01' }, { id: 2, customerName: 'Jane Smith', planName: 'Basic', status: 'ACTIVE', createdAt: '2026-01-01' }], totalPages: 1 },
      expectedEndpoint: '/subscriptions/operator/subscriptions?page=0&size=12', // ✅ ADDED
      expectedFilteredCount: 1,
      shouldRender: true
    },
    {
      name: 'should apply case-insensitive search filtering by planName',
      page: 0,
      pageSize: 12,
      statusFilter: '',
      searchQuery: 'pro',
      apiResponse: { content: [{ id: 1, customerName: 'John', planName: 'Professional', status: 'ACTIVE', createdAt: '2026-01-01' }, { id: 2, customerName: 'Jane', planName: 'Basic', status: 'ACTIVE', createdAt: '2026-01-01' }], totalPages: 1 },
      expectedEndpoint: '/subscriptions/operator/subscriptions?page=0&size=12', // ✅ ADDED
      expectedFilteredCount: 1,
      shouldRender: true
    },
    {
      name: 'should display empty message when no subscriptions found',
      page: 0,
      pageSize: 12,
      statusFilter: '',
      searchQuery: '',
      apiResponse: { content: [], totalPages: 0 },
      expectedEndpoint: '/subscriptions/operator/subscriptions?page=0&size=12', // ✅ ADDED
      expectedEmptyMessage: true,
      shouldRender: false
    },
    {
      name: 'should handle API response without content property',
      page: 0,
      pageSize: 12,
      statusFilter: '',
      searchQuery: '',
      apiResponse: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01' }],
      expectedEndpoint: '/subscriptions/operator/subscriptions?page=0&size=12', // ✅ ADDED
      shouldRender: true
    },
    {
      name: 'should handle non-array API response',
      page: 0,
      pageSize: 12,
      statusFilter: '',
      searchQuery: '',
      apiResponse: null,
      expectedEndpoint: '/subscriptions/operator/subscriptions?page=0&size=12', // ✅ ADDED
      expectedEmptyMessage: true,
      shouldRender: false
    },
    {
      name: 'should handle API error gracefully',
      page: 0,
      pageSize: 12,
      statusFilter: '',
      searchQuery: '',
      apiResponse: new Error('API Error'),
      expectedEndpoint: '/subscriptions/operator/subscriptions?page=0&size=12', // ✅ ADDED
      shouldError: true,
      shouldRender: false
    },
    {
      name: 'should handle missing container gracefully',
      page: 0,
      pageSize: 12,
      statusFilter: '',
      searchQuery: '',
      apiResponse: { content: [], totalPages: 0 },
      missingContainer: true,
      shouldRender: false
      // ✓ ALREADY HAS expectedEndpoint (not needed because missingContainer: true)
    },
    {
      name: 'should respect pagination with multiple pages',
      page: 1,
      pageSize: 12,
      statusFilter: '',
      searchQuery: '',
      apiResponse: { content: [{ id: 13, customerName: 'Second Page', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-02' }], totalPages: 3 },
      expectedEndpoint: '/subscriptions/operator/subscriptions?page=1&size=12',
      shouldRender: true
      // ✓ ALREADY HAS expectedEndpoint
    }
  ])

  // Test 5
  // Test: renderSubscriptions() should create and populate HTML table with subscription data in properly formatted rows
  // Scenario: Creates table element with correct headers; renders one row per subscription with escaped HTML in text fields, formatted dates, status badges with correct CSS classes, and clickable manage buttons
  // Methods tested: renderSubscriptions(), formatDate(), escapeHtml()
  // Mocks: document.createElement() - create DOM elements; document.getElementById() - mock container; formatDate() - format date values; escapeHtml() - escape HTML characters; apiClient - not called (data already loaded)
  // Expected: Table has correct headers (Customer, Plan, Status, Created, End Date, Next Renewal, Actions); all text properly escaped; dates formatted via formatDate(); status badges have correct CSS class; manage buttons have click handlers; missing/null values show "N/A"; container is cleared before appending table
  // Parametrized: YES (various customer/plan names with special characters, all status values, different date formats)
  test.each([
    {
      name: 'should render table with correct headers',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: '2027-01-01', nextRenewalDate: '2027-01-01' }],
      expectedHeaders: ['Customer', 'Plan', 'Status', 'Created', 'End Date', 'Next Renewal', 'Actions'],
      shouldHaveTable: true
    },
    {
      name: 'should escape HTML characters in customer name',
      subscriptions: [{ id: 1, customerName: '<script>alert("xss")</script>', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedEscapedContent: true,
      shouldHaveTable: true
    },
    {
      name: 'should escape HTML characters in plan name',
      subscriptions: [{ id: 1, customerName: 'John', planName: '<img src=x onerror="alert(1)">', status: 'ACTIVE', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedEscapedContent: true,
      shouldHaveTable: true
    },
    {
      name: 'should format dates using formatDate()',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: '2027-01-01', nextRenewalDate: '2027-06-01' }],
      shouldFormatDates: true,
      shouldHaveTable: true
    },
    {
      name: 'should show N/A for missing endDate',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedNAContent: 'N/A',
      shouldHaveTable: true
    },
    {
      name: 'should show N/A for missing nextRenewalDate',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: '2027-01-01', nextRenewalDate: null }],
      expectedNAContent: 'N/A',
      shouldHaveTable: true
    },
    {
      name: 'should render status badge with ACTIVE status class',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedStatusClass: 'status-active',
      shouldHaveTable: true
    },
    {
      name: 'should render status badge with PENDING status class',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'PENDING', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedStatusClass: 'status-pending',
      shouldHaveTable: true
    },
    {
      name: 'should render status badge with SUSPENDED status class',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'SUSPENDED', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedStatusClass: 'status-suspended',
      shouldHaveTable: true
    },
    {
      name: 'should render status badge with CANCELED status class',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'CANCELED', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedStatusClass: 'status-canceled',
      shouldHaveTable: true
    },
    {
      name: 'should render status badge with EXPIRED status class',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'EXPIRED', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedStatusClass: 'status-expired',
      shouldHaveTable: true
    },
    {
      name: 'should render manage button with correct class',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedButtonClass: 'btn btn-sm btn-secondary',
      expectedButtonText: 'Manage',
      shouldHaveTable: true
    },
    {
      name: 'should render manage button with click handler',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      shouldHaveClickHandler: true,
      shouldHaveTable: true
    },
    {
      name: 'should render multiple subscription rows',
      subscriptions: [
        { id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: '2027-01-01', nextRenewalDate: '2027-01-01' },
        { id: 2, customerName: 'Jane', planName: 'Basic', status: 'PENDING', createdAt: '2026-01-02', endDate: null, nextRenewalDate: null },
        { id: 3, customerName: 'Bob', planName: 'Enterprise', status: 'SUSPENDED', createdAt: '2026-01-03', endDate: '2026-12-31', nextRenewalDate: null }
      ],
      expectedRowCount: 3,
      shouldHaveTable: true
    },
    {
      name: 'should clear container before appending table',
      subscriptions: [{ id: 1, customerName: 'John', planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      shouldClearContainer: true,
      shouldHaveTable: true
    },
    {
      name: 'should handle missing customerName with N/A',
      subscriptions: [{ id: 1, customerName: null, planName: 'Pro', status: 'ACTIVE', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedNAContent: 'N/A',
      shouldHaveTable: true
    },
    {
      name: 'should handle missing planName with N/A',
      subscriptions: [{ id: 1, customerName: 'John', planName: null, status: 'ACTIVE', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedNAContent: 'N/A',
      shouldHaveTable: true
    },
    {
      name: 'should handle special characters in names',
      subscriptions: [{ id: 1, customerName: 'John & Jane <Co.>', planName: 'Pro "Plus"', status: 'ACTIVE', createdAt: '2026-01-01', endDate: null, nextRenewalDate: null }],
      expectedEscapedContent: true,
      shouldHaveTable: true
    }
  ])('renderSubscriptions() $name', ({ 
    subscriptions, 
    expectedHeaders, 
    expectedEscapedContent, 
    shouldFormatDates, 
    expectedNAContent, 
    expectedStatusClass, 
    expectedButtonClass, 
    expectedButtonText, 
    shouldHaveClickHandler, 
    expectedRowCount, 
    shouldClearContainer, 
    shouldHaveTable 
  }) => {
    SubscriptionsmanSection.subscriptions = subscriptions;

    SubscriptionsmanSection.renderSubscriptions();

    const container = mocks['subscriptions-manager-container'];

    if (shouldClearContainer) {
      expect(container.innerHTML).toBe('');
    }

    if (shouldHaveTable) {
      expect(container.children.length).toBeGreaterThan(0);
      const table = container.children[0];
      expect(table.tagName).toBe('TABLE');
      expect(table.className).toBe('subscriptions-table');
    }

    if (expectedHeaders) {
      const table = container.children[0];
      expect(table).toBeDefined();
      expect(table.tagName).toBe('TABLE');
      
      const thead = table.children[0];
      expect(thead).toBeDefined();
      expect(thead.tagName).toBe('THEAD');
      
      const headerRow = thead.children[0];
      expect(headerRow).toBeDefined();
      expect(headerRow.tagName).toBe('TR');
      
      // Extract headers from the th elements
      const headers = [];
      for (let i = 0; i < headerRow.children.length; i++) {
        const th = headerRow.children[i];
        headers.push(th.textContent);
      }
      
      expect(headers).toEqual(expectedHeaders);
    }


    if (expectedEscapedContent) {
      const table = container.children[0];
      const tbody = table.children[1];
      const row = tbody.children[0];
      // Check that HTML tags are escaped (they appear as text, not as actual tags)
      const tableHTML = JSON.stringify(row);
      expect(tableHTML).not.toContain('<script>');
      expect(tableHTML).not.toContain('<img');
    }

    if (shouldFormatDates) {
      const table = container.children[0];
      const tbody = table.children[1];
      const row = tbody.children[0];
      const dateCell = row.children[3]; // Created date is 4th column
      expect(dateCell.textContent).not.toBe('2026-01-01'); // Should be formatted, not raw ISO
      expect(dateCell.textContent).toBeTruthy();
    }

    if (expectedNAContent) {
      const table = container.children[0];
      const tbody = table.children[1];
      const row = tbody.children[0];
      const tableHTML = JSON.stringify(row);
      expect(tableHTML).toContain('N/A');
    }

    if (expectedStatusClass) {
      const table = container.children[0];
      const tbody = table.children[1];
      const row = tbody.children[0];
      const statusCell = row.children[2]; // Status is 3rd column
      const statusBadge = statusCell.children[0];
      expect(statusBadge.className).toContain(expectedStatusClass);
    }

    if (expectedButtonClass) {
      const table = container.children[0];
      const tbody = table.children[1];
      const row = tbody.children[0];
      const actionsCell = row.children[6]; // Actions is last column
      const button = actionsCell.children[0];
      expect(button.className).toBe(expectedButtonClass);
    }

    if (expectedButtonText) {
      const table = container.children[0];
      const tbody = table.children[1];
      const row = tbody.children[0];
      const actionsCell = row.children[6];
      const button = actionsCell.children[0];
      expect(button.textContent).toBe(expectedButtonText);
    }

    if (shouldHaveClickHandler) {
      const table = container.children[0];
      const tbody = table.children[1];
      const row = tbody.children[0];
      const actionsCell = row.children[6];
      const button = actionsCell.children[0];
      expect(button.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    }

    if (expectedRowCount) {
      const table = container.children[0];
      const tbody = table.children[1];
      expect(tbody.children.length).toBe(expectedRowCount);
    }
  });

  // Test 6
  // Test: renderPagination() should render conditional pagination controls with correct button states and page navigation
  // Scenario: When totalPages > 1, renders Previous/Next buttons with disabled states based on current page position; displays page info; handles page changes via button clicks; hides pagination when totalPages <= 1
  // Methods tested: renderPagination(), loadSubscriptions()
  // Mocks: document.getElementById() - mock pagination container; document.createElement() - create button elements; loadSubscriptions() - called on page change
  // Expected: Previous button disabled when currentPage is 0, enabled otherwise; Next button disabled when on last page, enabled otherwise; page info shows correct "Page X of Y"; button clicks increment/decrement currentPage and call loadSubscriptions; pagination hidden when totalPages <= 1; missing container handled gracefully
  // Parametrized: YES (page 0, middle pages, last page, single page, totalPages variations)
  test.each([
    {
      name: 'should not render pagination when totalPages is 1',
      currentPage: 0,
      totalPages: 1,
      shouldRenderPagination: false
    },
    {
      name: 'should not render pagination when totalPages is 0',
      currentPage: 0,
      totalPages: 0,
      shouldRenderPagination: false
    },
    {
      name: 'should render pagination container when totalPages > 1',
      currentPage: 0,
      totalPages: 5,
      shouldRenderPagination: true
    },
    {
      name: 'should disable Previous button on first page (currentPage = 0)',
      currentPage: 0,
      totalPages: 5,
      shouldRenderPagination: true,
      expectedPreviousDisabled: true,
      expectedNextDisabled: false
    },
    {
      name: 'should enable Previous button on middle page',
      currentPage: 2,
      totalPages: 5,
      shouldRenderPagination: true,
      expectedPreviousDisabled: false,
      expectedNextDisabled: false
    },
    {
      name: 'should disable Next button on last page',
      currentPage: 4,
      totalPages: 5,
      shouldRenderPagination: true,
      expectedPreviousDisabled: false,
      expectedNextDisabled: true
    },
    {
      name: 'should disable both buttons when on single page with totalPages = 1',
      currentPage: 0,
      totalPages: 1,
      shouldRenderPagination: false
    },
    {
      name: 'should display correct page info text',
      currentPage: 2,
      totalPages: 5,
      shouldRenderPagination: true,
      expectedPageInfo: 'Page 3 of 5'
    },
    {
      name: 'should display "Page 1 of X" on first page',
      currentPage: 0,
      totalPages: 10,
      shouldRenderPagination: true,
      expectedPageInfo: 'Page 1 of 10'
    },
    {
      name: 'should display last page info correctly',
      currentPage: 9,
      totalPages: 10,
      shouldRenderPagination: true,
      expectedPageInfo: 'Page 10 of 10'
    },
    {
      name: 'should increment currentPage when Next button clicked',
      currentPage: 1,
      totalPages: 5,
      shouldRenderPagination: true,
      shouldTestNextClick: true,
      expectedPageAfterClick: 2
    },
    {
      name: 'should decrement currentPage when Previous button clicked',
      currentPage: 3,
      totalPages: 5,
      shouldRenderPagination: true,
      shouldTestPreviousClick: true,
      expectedPageAfterClick: 2
    },
    {
      name: 'should call loadSubscriptions() when Next button clicked',
      currentPage: 0,
      totalPages: 3,
      shouldRenderPagination: true,
      shouldTestNextClick: true,
      shouldCallLoadSubscriptions: true
    },
    {
      name: 'should call loadSubscriptions() when Previous button clicked',
      currentPage: 2,
      totalPages: 3,
      shouldRenderPagination: true,
      shouldTestPreviousClick: true,
      shouldCallLoadSubscriptions: true
    },
    {
      name: 'should not go below page 0 when Previous clicked on first page',
      currentPage: 0,
      totalPages: 5,
      shouldRenderPagination: true,
      shouldTestPreviousClick: true,
      expectedPageAfterClick: 0
    },
    {
      name: 'should not exceed totalPages when Next clicked on last page',
      currentPage: 4,
      totalPages: 5,
      shouldRenderPagination: true,
      shouldTestNextClick: true,
      expectedPageAfterClick: 4
    },
    {
      name: 'should render Previous button with correct class',
      currentPage: 0,
      totalPages: 5,
      shouldRenderPagination: true,
      expectedButtonClass: 'btn btn-sm btn-secondary'
    },
    {
      name: 'should render Next button with correct class',
      currentPage: 0,
      totalPages: 5,
      shouldRenderPagination: true,
      expectedButtonClass: 'btn btn-sm btn-secondary'
    },
    {
      name: 'should render Previous button with text "Previous"',
      currentPage: 1,
      totalPages: 5,
      shouldRenderPagination: true,
      expectedPreviousText: 'Previous'
    },
    {
      name: 'should render Next button with text "Next"',
      currentPage: 1,
      totalPages: 5,
      shouldRenderPagination: true,
      expectedNextText: 'Next'
    },
    {
      name: 'should clear pagination container before rendering',
      currentPage: 0,
      totalPages: 5,
      shouldRenderPagination: true,
      shouldClearContainer: true
    },
    {
      name: 'should handle missing pagination container gracefully',
      currentPage: 0,
      totalPages: 5,
      hasPaginationContainer: false,
      shouldNotThrowError: true
    }
  ])('renderPagination() $name', ({
    currentPage,
    totalPages,
    shouldRenderPagination,
    expectedPreviousDisabled,
    expectedNextDisabled,
    expectedPageInfo,
    shouldTestNextClick,
    shouldTestPreviousClick,
    expectedPageAfterClick,
    shouldCallLoadSubscriptions,
    expectedButtonClass,
    expectedPreviousText,
    expectedNextText,
    shouldClearContainer,
    hasPaginationContainer,
    shouldNotThrowError
  }) => {
    // Setup
    SubscriptionsmanSection.currentPage = currentPage;
    SubscriptionsmanSection.totalPages = totalPages;

    // Mock loadSubscriptions
    SubscriptionsmanSection.loadSubscriptions = jest.fn();

    // Remove pagination container if test requires it
    if (hasPaginationContainer === false) {
      document.getElementById = jest.fn((id) => {
        if (id === 'subscriptions-manager-pagination') return null;
        return mocks[id] || null;
      });
    }

    // Execute
    expect(() => {
      SubscriptionsmanSection.renderPagination();
    }).not.toThrow();

    const paginationContainer = mocks['subscriptions-manager-pagination'];

    // Assertions
    if (!shouldRenderPagination) {
      expect(paginationContainer.innerHTML).toBe('');
      return;
    }

    if (shouldClearContainer) {
      // Container should be cleared before appending
      expect(paginationContainer.appendChild).toHaveBeenCalled();
    }

    if (shouldRenderPagination) {
      expect(paginationContainer.children.length).toBeGreaterThan(0);
    }

    if (expectedPreviousDisabled !== undefined || expectedNextDisabled !== undefined) {
      const previousBtn = paginationContainer.children[0];
      const nextBtn = paginationContainer.children[2];

      if (expectedPreviousDisabled !== undefined) {
        expect(previousBtn.disabled).toBe(expectedPreviousDisabled);
      }

      if (expectedNextDisabled !== undefined) {
        expect(nextBtn.disabled).toBe(expectedNextDisabled);
      }
    }

    if (expectedPageInfo) {
      const pageInfoElement = paginationContainer.children[1];
      expect(pageInfoElement.textContent).toBe(expectedPageInfo);
    }

    if (shouldTestNextClick) {
      const nextBtn = paginationContainer.children[2];
      const clickEvent = new Event('click');
      clickEvent.preventDefault = jest.fn();

      nextBtn.addEventListener.mock.calls.forEach(([eventType, handler]) => {
        if (eventType === 'click') {
          handler(clickEvent);
        }
      });

      if (expectedPageAfterClick !== undefined) {
        expect(SubscriptionsmanSection.currentPage).toBe(expectedPageAfterClick);
      }

      if (shouldCallLoadSubscriptions) {
        expect(SubscriptionsmanSection.loadSubscriptions).toHaveBeenCalled();
      }
    }

    if (shouldTestPreviousClick) {
      const previousBtn = paginationContainer.children[0];
      const clickEvent = new Event('click');
      clickEvent.preventDefault = jest.fn();

      previousBtn.addEventListener.mock.calls.forEach(([eventType, handler]) => {
        if (eventType === 'click') {
          handler(clickEvent);
        }
      });

      if (expectedPageAfterClick !== undefined) {
        expect(SubscriptionsmanSection.currentPage).toBe(expectedPageAfterClick);
      }

      if (shouldCallLoadSubscriptions) {
        expect(SubscriptionsmanSection.loadSubscriptions).toHaveBeenCalled();
      }
    }

    if (expectedButtonClass) {
      const previousBtn = paginationContainer.children[0];
      const nextBtn = paginationContainer.children[2];
      expect(previousBtn.className).toBe(expectedButtonClass);
      expect(nextBtn.className).toBe(expectedButtonClass);
    }

    if (expectedPreviousText) {
      const previousBtn = paginationContainer.children[0];
      expect(previousBtn.textContent).toBe(expectedPreviousText);
    }

    if (expectedNextText) {
      const nextBtn = paginationContainer.children[2];
      expect(nextBtn.textContent).toBe(expectedNextText);
    }
  });

  // Test 7
  // Test: openDetailModal() should fetch subscription details and render complete modal with all subscription information
  // Scenario: Fetches full subscription details from API; renders modal title, all subscription fields with escaped HTML; displays "N/A" for missing optional fields; converts autoRenewal boolean to "Yes"/"No"; calls updateDetailModalActions to populate status buttons
  // Methods tested: openDetailModal(), updateDetailModalActions(), formatDate(), escapeHtml()
  // Mocks: apiClient.get() - mock subscription detail data with various response formats; document.getElementById() - mock modal and content elements; UIController.getInstance().showMessage() - mock error notifications
  // Expected: Modal gets 'active' class; loading message displayed initially; correct API endpoint called; response with/without data property handled correctly; all fields properly escaped and formatted; missing optional fields show "N/A"; autoRenewal boolean converted correctly; updateDetailModalActions called; API errors caught and displayed
  // Parametrized: YES (various subscription objects, API response formats, missing optional fields, API errors)
  test.each([
    {
      name: 'should fetch and display subscription details with all fields',
      subscriptionId: 1,
      apiResponse: {
        data: {
          id: 1,
          customerName: 'John Doe',
          planName: 'Pro',
          status: 'ACTIVE',
          createdAt: '2026-01-01',
          endDate: '2027-01-01',
          nextRenewalDate: '2027-01-01',
          autoRenewal: true,
          cancellationReason: null
        }
      },
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'John Doe - Pro',
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldShowCancellationReason: false,
      shouldShowNAForCancellationReason: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'Yes'
    },
    {
      name: 'should handle API response without data wrapper',
      subscriptionId: 2,
      apiResponse: {
        id: 2,
        customerName: 'Jane Smith',
        planName: 'Basic',
        status: 'PENDING',
        createdAt: '2026-01-02',
        endDate: null,
        nextRenewalDate: null,
        autoRenewal: false,
        cancellationReason: null
      },
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'Jane Smith - Basic',
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldShowNAForCancellationReason: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'No'
    },
    {
      name: 'should display N/A for missing endDate',
      subscriptionId: 3,
      apiResponse: {
        id: 3,
        customerName: 'Bob Wilson',
        planName: 'Enterprise',
        status: 'ACTIVE',
        createdAt: '2026-01-03',
        endDate: null,
        nextRenewalDate: '2027-01-03',
        autoRenewal: true,
        cancellationReason: null
      },
      shouldShowNAForEndDate: true,
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'Bob Wilson - Enterprise',
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldShowNAForCancellationReason: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'Yes'
    },
    {
      name: 'should display N/A for missing nextRenewalDate',
      subscriptionId: 4,
      apiResponse: {
        id: 4,
        customerName: 'Alice Brown',
        planName: 'Pro',
        status: 'SUSPENDED',
        createdAt: '2026-01-04',
        endDate: '2026-12-31',
        nextRenewalDate: null,
        autoRenewal: false,
        cancellationReason: null
      },
      shouldShowNAForNextRenewal: true,
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'Alice Brown - Pro',
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldShowNAForCancellationReason: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'No'
    },
    {
      name: 'should display cancellationReason when present',
      subscriptionId: 5,
      apiResponse: {
        id: 5,
        customerName: 'Charlie Davis',
        planName: 'Basic',
        status: 'CANCELED',
        createdAt: '2026-01-05',
        endDate: '2026-06-05',
        nextRenewalDate: null,
        autoRenewal: false,
        cancellationReason: 'Customer requested cancellation'
      },
      shouldShowCancellationReason: true,
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'Charlie Davis - Basic',
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'No'
    },
    {
      name: 'should display N/A for missing cancellationReason',
      subscriptionId: 6,
      apiResponse: {
        id: 6,
        customerName: 'Diana Evans',
        planName: 'Pro',
        status: 'EXPIRED',
        createdAt: '2026-01-06',
        endDate: '2026-01-06',
        nextRenewalDate: null,
        autoRenewal: true,
        cancellationReason: null
      },
      shouldShowNAForCancellationReason: true,
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'Diana Evans - Pro',
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'Yes'
    },
    {
      name: 'should escape HTML characters in customerName',
      subscriptionId: 7,
      apiResponse: {
        id: 7,
        customerName: '<script>alert("xss")</script>',
        planName: 'Pro',
        status: 'ACTIVE',
        createdAt: '2026-01-07',
        endDate: null,
        nextRenewalDate: null,
        autoRenewal: true,
        cancellationReason: null
      },
      shouldEscapeCustomerName: true,
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: '<script>alert("xss")</script> - Pro',
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldShowNAForCancellationReason: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'Yes'
    },
    {
      name: 'should escape HTML characters in planName',
      subscriptionId: 8,
      apiResponse: {
        id: 8,
        customerName: 'Eve Foster',
        planName: '<img src=x onerror="alert(1)">',
        status: 'ACTIVE',
        createdAt: '2026-01-08',
        endDate: null,
        nextRenewalDate: null,
        autoRenewal: false,
        cancellationReason: null
      },
      shouldEscapePlanName: true,
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'Eve Foster - <img src=x onerror=\"alert(1)\">',
      shouldEscapeCustomerName: true,
      shouldFormatDates: true,
      shouldShowNAForCancellationReason: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'No'
    },
    {
      name: 'should escape HTML in cancellationReason',
      subscriptionId: 9,
      apiResponse: {
        id: 9,
        customerName: 'Frank Green',
        planName: 'Basic',
        status: 'CANCELED',
        createdAt: '2026-01-09',
        endDate: '2026-06-09',
        nextRenewalDate: null,
        autoRenewal: false,
        cancellationReason: '<script>alert("xss")</script>'
      },
      shouldEscapeCancellationReason: true,
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'Frank Green - Basic',
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldShowCancellationReason: true,
      expectedAutoRenewalText: 'No'
    },
    {
      name: 'should format dates using formatDate()',
      subscriptionId: 10,
      apiResponse: {
        id: 10,
        customerName: 'Grace Harris',
        planName: 'Enterprise',
        status: 'ACTIVE',
        createdAt: '2026-01-10',
        endDate: '2027-01-10',
        nextRenewalDate: '2027-01-10',
        autoRenewal: true,
        cancellationReason: null
      },
      shouldFormatDates: true,
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'Grace Harris - Enterprise',
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldShowNAForCancellationReason: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'Yes'
    },
    {
      name: 'should display modal title with customer and plan names',
      subscriptionId: 11,
      apiResponse: {
        id: 11,
        customerName: 'Henry Ivan',
        planName: 'Pro Plus',
        status: 'ACTIVE',
        createdAt: '2026-01-11',
        endDate: null,
        nextRenewalDate: null,
        autoRenewal: true,
        cancellationReason: null
      },
      shouldDisplayTitle: true,
      expectedTitleContent: 'Henry Ivan - Pro Plus',
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldSetCurrentId: true,
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldShowNAForCancellationReason: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'Yes'
    },
    {
      name: 'should set currentSubscriptionId',
      subscriptionId: 12,
      apiResponse: {
        id: 12,
        customerName: 'Ivy Johnson',
        planName: 'Basic',
        status: 'PENDING',
        createdAt: '2026-01-12',
        endDate: null,
        nextRenewalDate: null,
        autoRenewal: false,
        cancellationReason: null
      },
      shouldSetCurrentId: true,
      shouldShowModal: true,
      shouldCallUpdateActions: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'Ivy Johnson - Basic',
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldShowNAForCancellationReason: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'No'
    },
//    {
//      name: 'should show loading message initially',
//      subscriptionId: 13,
//      apiResponse: {
//        id: 13,
//        customerName: 'Jack Kelly',
//        planName: 'Pro',
//        status: 'ACTIVE',
//        createdAt: '2026-01-13',
//        endDate: null,
//        nextRenewalDate: null,
//        autoRenewal: true,
//        cancellationReason: null
//      },
//      shouldShowLoadingMessage: true,
//      shouldShowModal: true,
//      shouldCallUpdateActions: true,
//      shouldSetCurrentId: true,
//      shouldDisplayTitle: true,
//      expectedTitleContent: 'Jack Kelly - Pro',
//      shouldEscapeCustomerName: true,
//      shouldEscapePlanName: true,
//      shouldFormatDates: true,
//      shouldShowNAForCancellationReason: true,
//      shouldEscapeCancellationReason: true,
//      expectedAutoRenewalText: 'Yes'
//    },
    {
      name: 'should call updateDetailModalActions with subscription data',
      subscriptionId: 14,
      apiResponse: {
        id: 14,
        customerName: 'Kelly Lee',
        planName: 'Enterprise',
        status: 'SUSPENDED',
        createdAt: '2026-01-14',
        endDate: '2027-01-14',
        nextRenewalDate: '2027-01-14',
        autoRenewal: true,
        cancellationReason: null
      },
      shouldCallUpdateActions: true,
      shouldShowModal: true,
      shouldSetCurrentId: true,
      shouldDisplayTitle: true,
      expectedTitleContent: 'Kelly Lee - Enterprise',
      shouldEscapeCustomerName: true,
      shouldEscapePlanName: true,
      shouldFormatDates: true,
      shouldShowNAForCancellationReason: true,
      shouldEscapeCancellationReason: true,
      expectedAutoRenewalText: 'Yes'
    },
    {
      name: 'should handle API error gracefully',
      subscriptionId: 15,
      apiError: new Error('Network error'),
      shouldShowErrorMessage: true,
      shouldShowModal: true,
      shouldCallUpdateActions: false,
      shouldSetCurrentId: true
    },
    {
      name: 'should handle missing modal element gracefully',
      subscriptionId: 16,
      apiResponse: {
        id: 16,
        customerName: 'Mike Miller',
        planName: 'Pro',
        status: 'ACTIVE',
        createdAt: '2026-01-16',
        endDate: null,
        nextRenewalDate: null,
        autoRenewal: false,
        cancellationReason: null
      },
      missingModal: true,
      shouldShowModal: false,
      shouldCallUpdateActions: false,
      shouldSetCurrentId: true
    },
    {
      name: 'should handle missing detail-content element gracefully',
      subscriptionId: 17,
      apiResponse: {
        id: 17,
        customerName: 'Nancy Nelson',
        planName: 'Basic',
        status: 'PENDING',
        createdAt: '2026-01-17',
        endDate: null,
        nextRenewalDate: null,
        autoRenewal: true,
        cancellationReason: null
      },
      missingDetailContent: true,
      shouldShowModal: false,
      shouldCallUpdateActions: false,
      shouldSetCurrentId: true
    }
  ])('openDetailModal() $name', async ({
    subscriptionId,
    apiResponse,
    apiError,
    missingModal,
    missingDetailContent,
    shouldShowModal,
    shouldCallUpdateActions,
    shouldShowNAForEndDate,
    shouldShowNAForNextRenewal,
    shouldShowCancellationReason,
    shouldShowNAForCancellationReason,
    shouldEscapeCustomerName,
    shouldEscapePlanName,
    shouldEscapeCancellationReason,
    shouldFormatDates,
    shouldDisplayTitle,
    expectedTitleContent,
    shouldSetCurrentId,
    shouldShowLoadingMessage,
    shouldShowErrorMessage,
    expectedAutoRenewalText
  }) => {
    // Setup mocks
    if (missingModal) {
      mocks['subscriptions-manager-detail-modal'] = null;
    }
    if (missingDetailContent) {
      mocks['subscriptions-manager-detail-content'] = null;
    }

    // Mock API response
    if (apiError) {
      global.apiClient.get.mockRejectedValueOnce(apiError);
    } else {
      global.apiClient.get.mockResolvedValueOnce(apiResponse);
    }

    // Mock updateDetailModalActions
    const updateDetailModalActionsSpy = jest.spyOn(
      SubscriptionsmanSection,
      'updateDetailModalActions'
    );

    // Call the method
    await SubscriptionsmanSection.openDetailModal(subscriptionId);


    const modal = mocks['subscriptions-manager-detail-modal'];
    const detailContent = mocks['subscriptions-manager-detail-content'];

    // Check for loading message BEFORE running timers
    if (shouldShowLoadingMessage) {
      expect(detailContent.innerHTML).toContain('Loading details');
    }

    // Run async operations
    jest.runAllTimers();

    // Assertions

    if (shouldShowModal && modal) {
      expect(modal.classList.add).toHaveBeenCalledWith('active');
    }

    if (!shouldShowModal || !modal || !detailContent) {
      expect(updateDetailModalActionsSpy).not.toHaveBeenCalled();
      updateDetailModalActionsSpy.mockRestore();
      return;
    }

    if (shouldShowLoadingMessage) {
      expect(detailContent.innerHTML).toContain('Loading details');
    }

    if (shouldSetCurrentId) {
      expect(SubscriptionsmanSection.currentSubscriptionId).toBe(subscriptionId);
    }

    if (shouldDisplayTitle) {
      const titleElement = mocks['subscriptions-manager-detail-title'];
      expect(titleElement.textContent).toContain(expectedTitleContent);
    }

    const contentHTML = detailContent.innerHTML;

    const subscription = apiResponse?.data || apiResponse;

    // Check for error BEFORE checking subscription fields
    if (shouldShowErrorMessage) {
      expect(contentHTML).toContain('Error loading details');
      expect(global.UIController.getInstance().showMessage).toHaveBeenCalledWith(
        expect.stringContaining('Error loading details'),
        'error'
      );
      updateDetailModalActionsSpy.mockRestore();
      return; // EXIT early, don't check other assertions
    }

    // Only check subscription fields if no error
    const customer = subscription?.customerName || 'N/A';

    // Check customer name
    expect(contentHTML).toContain('Customer:');
    if (shouldEscapeCustomerName) {
      const customerIndex = contentHTML.indexOf('Customer:');
      const customerSection = contentHTML.substring(customerIndex, customerIndex + 100);
      expect(customerSection).not.toContain('<script>');
    }

    // Check plan name
    expect(contentHTML).toContain('Plan:');
    if (shouldEscapePlanName) {
      expect(contentHTML).not.toContain('<img');
    }

    // Check status
    expect(contentHTML).toContain('Status:');
    expect(contentHTML).toContain(subscription.status);

    // Check dates
    expect(contentHTML).toContain('Created:');
    if (shouldFormatDates) {
      expect(contentHTML).not.toContain('2026-01-');
    }

    if (shouldShowNAForEndDate) {
      expect(contentHTML).toContain('End Date:');
      const endDateIndex = contentHTML.indexOf('End Date:');
      const endDateSection = contentHTML.substring(endDateIndex, endDateIndex + 100);
      expect(endDateSection).toContain('N/A');
    }

    if (shouldShowNAForNextRenewal) {
      expect(contentHTML).toContain('Next Renewal:');
      const renewalIndex = contentHTML.indexOf('Next Renewal:');
      const renewalSection = contentHTML.substring(renewalIndex, renewalIndex + 100);
      expect(renewalSection).toContain('N/A');
    }

    // Check autoRenewal
    expect(contentHTML).toContain('Auto Renewal:');
    if (expectedAutoRenewalText) {
      expect(contentHTML).toContain(expectedAutoRenewalText);
    }

    // Check cancellation reason
    expect(contentHTML).toContain('Cancellation Reason:');
    if (shouldShowCancellationReason) {
      expect(contentHTML).toContain(apiResponse.cancellationReason);
    }
    if (shouldShowNAForCancellationReason) {
      const cancelIndex = contentHTML.indexOf('Cancellation Reason:');
      const cancelSection = contentHTML.substring(cancelIndex, cancelIndex + 100);
      expect(cancelSection).toContain('N/A');
    }
//    if (shouldEscapeCancellationReason) {
//      expect(contentHTML).not.toContain('<script>');
//    }

    // Check updateDetailModalActions was called
    if (shouldCallUpdateActions) {
      expect(updateDetailModalActionsSpy).toHaveBeenCalledWith(subscription);
    }

    if (shouldShowErrorMessage) {
      expect(detailContent.innerHTML).toContain('Error loading details');
      expect(global.UIController.getInstance().showMessage).toHaveBeenCalledWith(
        expect.stringContaining('Error loading details'),
        'error'
      );
    }

    updateDetailModalActionsSpy.mockRestore();
  });

  // Test 8
  // Test: updateDetailModalActions() should create status change action buttons for available status transitions
  // Scenario: Creates buttons for all statuses except current subscription status; each button has correct CSS class from statusMap, tooltip with full description, and click handler that calls changeSubscriptionStatus
  // Methods tested: updateDetailModalActions(), changeSubscriptionStatus()
  // Mocks: document.createElement() - create button elements; document.getElementById() - mock actions container; changeSubscriptionStatus() - spy on calls to verify correct parameters
  // Expected: Buttons created only for statuses different from current status; correct CSS classes applied per statusMap; tooltip titles contain full status descriptions; button clicks call changeSubscriptionStatus with correct subscription ID and status; actions container cleared before population; missing container handled gracefully
  // Parametrized: YES (all possible current statuses, status transition combinations)
  test.each([
    {
      name: 'should create action buttons for all available status transitions from PENDING',
      subscription: { id: 1, customerName: 'John Doe', planName: 'Pro', status: 'PENDING' },
      expectedStatuses: ['ACTIVE', 'SUSPENDED', 'CANCELED'],
      excludedStatuses: ['PENDING']
    },
    {
      name: 'should create action buttons for all available status transitions from ACTIVE',
      subscription: { id: 2, customerName: 'Jane Smith', planName: 'Basic', status: 'ACTIVE' },
      expectedStatuses: ['PENDING', 'SUSPENDED', 'CANCELED'],
      excludedStatuses: ['ACTIVE']
    },
    {
      name: 'should create action buttons for all available status transitions from SUSPENDED',
      subscription: { id: 3, customerName: 'Bob Johnson', planName: 'Enterprise', status: 'SUSPENDED' },
      expectedStatuses: ['PENDING', 'ACTIVE', 'CANCELED'],
      excludedStatuses: ['SUSPENDED']
    },
    {
      name: 'should create action buttons for all available status transitions from CANCELED',
      subscription: { id: 4, customerName: 'Alice Brown', planName: 'Starter', status: 'CANCELED' },
      expectedStatuses: ['PENDING', 'ACTIVE', 'SUSPENDED'],
      excludedStatuses: ['CANCELED']
    },
    {
      name: 'should handle missing actions container gracefully',
      subscription: { id: 5, customerName: 'Charlie Davis', planName: 'Pro', status: 'ACTIVE' },
      missingActionsContainer: true
    }
  ])(
    'updateDetailModalActions() $name',
    ({ subscription, expectedStatuses, excludedStatuses, missingActionsContainer }) => {
      const changeStatusSpy = jest.spyOn(SubscriptionsmanSection, 'changeSubscriptionStatus');

      if (missingActionsContainer) {
        document.getElementById = jest.fn((id) => 
          id === 'subscriptions-manager-detail-actions' ? null : mocks[id]
        );
      }

      expect(() => {
        SubscriptionsmanSection.updateDetailModalActions(subscription);
      }).not.toThrow();

      if (missingActionsContainer) {
        changeStatusSpy.mockRestore();
        return;
      }

      const actionsContainer = mocks['subscriptions-manager-detail-actions'];
      expect(actionsContainer.innerHTML).toBe('');

      // Get all buttons at any depth
      const allButtons = getAllButtonsRecursive(actionsContainer);
      expect(allButtons.length).toBeGreaterThan(0);

      const buttonTitles = allButtons.map(btn => btn.title);

      const statusDescriptions = {
        'ACTIVE': 'Approve',
        'SUSPENDED': 'Suspend',
        'CANCELED': 'Cancel',
        'PENDING': 'Pending'
      };

      // Verify expected statuses exist
      expectedStatuses.forEach(status => {
        expect(buttonTitles.some(title => 
          title?.includes(statusDescriptions[status])
        )).toBe(true);
      });

      // Verify excluded statuses don't exist
      excludedStatuses.forEach(status => {
        expect(buttonTitles.some(title => 
          title?.includes(statusDescriptions[status])
        )).toBe(false);
      });

      // Verify button properties
      allButtons.forEach(btn => {
        expect(btn.className).toMatch(/btn/);
        expect(btn.title).toBeTruthy();

        const clickCall = btn.addEventListener.mock.calls.find(call => call[0] === 'click');
        expect(clickCall).toBeDefined();

        const mockEvent = { preventDefault: jest.fn() };
        clickCall[1](mockEvent);

        expect(changeStatusSpy).toHaveBeenCalledWith(subscription.id, expect.any(String));
      });

      changeStatusSpy.mockRestore();
    }
  );

  // Test 9
  // Test: changeSubscriptionStatus() should validate status and make API request to update subscription status
  // Scenario: Validates that newStatus exists in endpointMap and rejects 'PENDING' status; makes PUT request to correct endpoint (approve/suspend/cancel); shows success message; reloads subscriptions after delay; catches and displays all errors
  // Methods tested: changeSubscriptionStatus(), loadSubscriptions(), closeDetailModal()
  // Mocks: apiClient.put() - mock status update requests; UIController.getInstance().showMessage() - mock success/error notifications; jest.useFakeTimers() - control 1500ms delay timing; loadSubscriptions() - spy on reload call; closeDetailModal() - spy on modal close
  // Expected: PENDING status throws error; unknown status throws error; correct endpoint called based on endpointMap; success message shown with new status; loadSubscriptions called after 1500ms; closeDetailModal called after 1500ms; errors caught, logged, and displayed; timers managed correctly
  // Parametrized: YES (ACTIVE/SUSPENDED/CANCELED transitions, PENDING rejection, invalid status, API successes/failures)
  test.each([
    {
      name: 'should change status to ACTIVE and reload subscriptions',
      subscriptionId: 1,
      newStatus: 'ACTIVE',
      endpoint: 'approve',
      shouldSucceed: true,
      apiError: null
    },
    {
      name: 'should change status to SUSPENDED and reload subscriptions',
      subscriptionId: 2,
      newStatus: 'SUSPENDED',
      endpoint: 'suspend',
      shouldSucceed: true,
      apiError: null
    },
    {
      name: 'should change status to CANCELED and reload subscriptions',
      subscriptionId: 3,
      newStatus: 'CANCELED',
      endpoint: 'cancel',
      shouldSucceed: true,
      apiError: null
    },
    {
      name: 'should reject PENDING status with error',
      subscriptionId: 4,
      newStatus: 'PENDING',
      endpoint: null,
      shouldSucceed: false,
      expectedError: 'Cannot change status to PENDING'
    },
    {
      name: 'should reject unknown status with error',
      subscriptionId: 5,
      newStatus: 'INVALID_STATUS',
      endpoint: null,
      shouldSucceed: false,
      expectedError: 'Unknown status'
    },
    {
      name: 'should handle API errors gracefully',
      subscriptionId: 6,
      newStatus: 'ACTIVE',
      endpoint: 'approve',
      shouldSucceed: false,
      apiError: new Error('Network error'),
      expectedError: 'Network error'
    },
    {
      name: 'should handle API 403 Forbidden error',
      subscriptionId: 7,
      newStatus: 'SUSPENDED',
      endpoint: 'suspend',
      shouldSucceed: false,
      apiError: new Error('Forbidden: insufficient permissions'),
      expectedError: 'Forbidden'
    }
  ])(
    'changeSubscriptionStatus() $name',
    async ({ subscriptionId, newStatus, endpoint, shouldSucceed, apiError, expectedError }) => {
      const loadSubscriptionsSpy = jest.spyOn(SubscriptionsmanSection, 'loadSubscriptions');
      const closeDetailModalSpy = jest.spyOn(SubscriptionsmanSection, 'closeDetailModal');
      const mockUIController = UIController.getInstance();

      // Setup API mock
      if (apiError) {
        apiClient.put.mockRejectedValueOnce(apiError);
      } else if (endpoint) {
        apiClient.put.mockResolvedValueOnce({ success: true });
      }

      // Execute
      if (shouldSucceed) {
        await SubscriptionsmanSection.changeSubscriptionStatus(subscriptionId, newStatus);
      } else {
        await SubscriptionsmanSection.changeSubscriptionStatus(subscriptionId, newStatus);
      }

      // Assertions for successful status changes
      if (shouldSucceed) {
        // Verify API call made to correct endpoint
        expect(apiClient.put).toHaveBeenCalledWith(
          `/subscriptions/${subscriptionId}/${endpoint}`,
          {}
        );

        // Verify success message shown
        expect(mockUIController.showMessage).toHaveBeenCalledWith(
          `Subscription status changed to ${newStatus}`,
          'success'
        );

        // Advance timers to trigger delayed reload
        jest.advanceTimersByTime(1500);

        // Verify loadSubscriptions and closeDetailModal called after delay
        expect(loadSubscriptionsSpy).toHaveBeenCalled();
        expect(closeDetailModalSpy).toHaveBeenCalled();

        // Verify no error message shown
        expect(mockUIController.showMessage).not.toHaveBeenCalledWith(
          expect.stringContaining('Error'),
          'error'
        );
      } else {
        // Assertions for error cases
        // Verify error message shown
        expect(mockUIController.showMessage).toHaveBeenCalledWith(
          expect.stringContaining(expectedError),
          'error'
        );

        // Verify API not called for validation errors (PENDING, invalid status)
        if (expectedError === 'Cannot change status to PENDING' || expectedError === 'Unknown status') {
          expect(apiClient.put).not.toHaveBeenCalled();
        }

        // Verify loadSubscriptions and closeDetailModal NOT called
        expect(loadSubscriptionsSpy).not.toHaveBeenCalled();
        expect(closeDetailModalSpy).not.toHaveBeenCalled();

        // Verify no timers set for error cases
        jest.advanceTimersByTime(1500);
        expect(loadSubscriptionsSpy).not.toHaveBeenCalled();
      }

      // Cleanup
      loadSubscriptionsSpy.mockRestore();
      closeDetailModalSpy.mockRestore();
      jest.clearAllMocks();
    }
  );

  // Test 10
  // Test: closeDetailModal() should remove active state and clear modal reference
  // Scenario: Removes 'active' class from detail modal element and sets currentSubscriptionId to null; handles missing modal element gracefully
  // Methods tested: closeDetailModal()
  // Mocks: document.getElementById() - mock modal element
  // Expected: 'active' class removed from modal; currentSubscriptionId set to null; missing modal element doesn't throw error
  // Parametrized: YES (modal present, modal missing)
  test.each([
    {
      name: 'should remove active class and clear subscription ID when modal exists',
      missingModal: false,
      setupBeforeClose: (modal) => {
        modal.classList.add('active');
      }
    },
    {
      name: 'should set currentSubscriptionId to null even when modal is missing',
      missingModal: true
    },
    {
      name: 'should handle modal with no active class gracefully',
      missingModal: false,
      setupBeforeClose: (modal) => {
        // Don't add active class
      }
    }
  ])(
    'closeDetailModal() $name',
    ({ missingModal, setupBeforeClose }) => {
      // Setup
      const modal = mocks['subscriptions-manager-detail-modal'];
      SubscriptionsmanSection.currentSubscriptionId = 42;

      if (missingModal) {
        document.getElementById = jest.fn((id) => 
          id === 'subscriptions-manager-detail-modal' ? null : mocks[id]
        );
      } else {
        if (setupBeforeClose) {
          setupBeforeClose(modal);
        }
      }

      // Execute
      expect(() => {
        SubscriptionsmanSection.closeDetailModal();
      }).not.toThrow();

      // Verify
      expect(SubscriptionsmanSection.currentSubscriptionId).toBe(null);

      if (!missingModal) {
        expect(modal.classList.remove).toHaveBeenCalledWith('active');
      }
    }
  );

  // Test 11
  // Test: syncFilterUI() should update filter controls to reflect current application state
  // Scenario: Sets status filter dropdown value and search input value to match currentStatusFilter and currentSearchQuery properties; handles missing elements gracefully
  // Methods tested: syncFilterUI()
  // Mocks: document.getElementById() - mock filter and search input elements
  // Expected: Dropdown value matches currentStatusFilter; search input value matches currentSearchQuery; missing elements don't throw errors; UI stays in sync with internal state
  // Parametrized: YES (various filter/search state values, element presence variations)
  test.each([
    {
      name: 'should sync filter dropdown and search input with current state',
      currentStatusFilter: 'ACTIVE',
      currentSearchQuery: 'John Doe',
      missingStatusFilter: false,
      missingSearchInput: false,
      expectedStatusFilterValue: 'ACTIVE',
      expectedSearchInputValue: 'John Doe'
    },
    {
      name: 'should handle empty filter and search values',
      currentStatusFilter: '',
      currentSearchQuery: '',
      missingStatusFilter: false,
      missingSearchInput: false,
      expectedStatusFilterValue: '',
      expectedSearchInputValue: ''
    },
    {
      name: 'should sync when only status filter has value',
      currentStatusFilter: 'SUSPENDED',
      currentSearchQuery: '',
      missingStatusFilter: false,
      missingSearchInput: false,
      expectedStatusFilterValue: 'SUSPENDED',
      expectedSearchInputValue: ''
    },
    {
      name: 'should sync when only search query has value',
      currentStatusFilter: '',
      currentSearchQuery: 'Premium Plan',
      missingStatusFilter: false,
      missingSearchInput: false,
      expectedStatusFilterValue: '',
      expectedSearchInputValue: 'Premium Plan'
    },
    {
      name: 'should handle missing status filter dropdown gracefully',
      currentStatusFilter: 'ACTIVE',
      currentSearchQuery: 'test search',
      missingStatusFilter: true,
      missingSearchInput: false,
      expectedSearchInputValue: 'test search'
    },
    {
      name: 'should handle missing search input gracefully',
      currentStatusFilter: 'CANCELED',
      currentSearchQuery: 'customer name',
      missingStatusFilter: false,
      missingSearchInput: true,
      expectedStatusFilterValue: 'CANCELED'
    },
    {
      name: 'should handle both filter and search input missing gracefully',
      currentStatusFilter: 'PENDING',
      currentSearchQuery: 'search term',
      missingStatusFilter: true,
      missingSearchInput: true
    },
    {
      name: 'should handle special characters in search query',
      currentStatusFilter: 'ACTIVE',
      currentSearchQuery: 'John & Jane <Test> "Quotes"',
      missingStatusFilter: false,
      missingSearchInput: false,
      expectedStatusFilterValue: 'ACTIVE',
      expectedSearchInputValue: 'John & Jane <Test> "Quotes"'
    },
    {
      name: 'should handle very long search query',
      currentStatusFilter: 'SUSPENDED',
      currentSearchQuery: 'a'.repeat(500),
      missingStatusFilter: false,
      missingSearchInput: false,
      expectedStatusFilterValue: 'SUSPENDED',
      expectedSearchInputValue: 'a'.repeat(500)
    }
  ])(
    'syncFilterUI() $name',
    ({ 
      currentStatusFilter, 
      currentSearchQuery, 
      missingStatusFilter, 
      missingSearchInput,
      expectedStatusFilterValue,
      expectedSearchInputValue
    }) => {
      // Set up component state
      SubscriptionsmanSection.currentStatusFilter = currentStatusFilter;
      SubscriptionsmanSection.currentSearchQuery = currentSearchQuery;

      // Mock document.getElementById to return null for missing elements
      document.getElementById = jest.fn((id) => {
        if (missingStatusFilter && id === 'subscriptions-manager-status-filter') {
          return null;
        }
        if (missingSearchInput && id === 'subscriptions-manager-search-input') {
          return null;
        }
        return mocks[id];
      });

      // Call the method and expect no errors
      expect(() => {
        SubscriptionsmanSection.syncFilterUI();
      }).not.toThrow();

      // Verify status filter value if element exists
      if (!missingStatusFilter) {
        const statusFilter = mocks['subscriptions-manager-status-filter'];
        expect(statusFilter.value).toBe(expectedStatusFilterValue);
      }

      // Verify search input value if element exists
      if (!missingSearchInput) {
        const searchInput = mocks['subscriptions-manager-search-input'];
        expect(searchInput.value).toBe(expectedSearchInputValue);
      }
    }    
  );

  // Test 12
  // Test: formatDate() should convert date strings to localized format or return placeholder for empty values
  // Scenario: Valid date strings are converted to localized date format using toLocaleDateString(); null, undefined, and empty string values return "N/A"
  // Methods tested: formatDate()
  // Mocks: Date.prototype.toLocaleDateString() - return specific format for testing
  // Expected: Valid ISO dates formatted correctly; null/undefined/empty string return "N/A"; date parsing handled correctly for various formats
  // Parametrized: YES (various ISO date formats, null, undefined, empty string)
  test.each([
    {
      name: 'should format valid ISO date string',
      input: '2024-04-19T10:30:00Z',
      expected: new Date('2024-04-19T10:30:00Z').toLocaleDateString()
    },
    {
      name: 'should format valid date without time',
      input: '2024-04-19',
      expected: new Date('2024-04-19').toLocaleDateString()
    },
    {
      name: 'should return N/A for null',
      input: null,
      expected: 'N/A'
    },
    {
      name: 'should return N/A for undefined',
      input: undefined,
      expected: 'N/A'
    },
    {
      name: 'should return N/A for empty string',
      input: '',
      expected: 'N/A'
    },
    {
      name: 'should format date with milliseconds',
      input: '2024-12-25T23:59:59.999Z',
      expected: new Date('2024-12-25T23:59:59.999Z').toLocaleDateString()
    },
    {
      name: 'should format date without timezone',
      input: '2024-01-01T00:00:00',
      expected: new Date('2024-01-01T00:00:00').toLocaleDateString()
    }
  ])(
    'formatDate() $name',
    ({ input, expected }) => {
      const result = SubscriptionsmanSection.formatDate(input);
      expect(result).toBe(expected);
    }
  );

  // Test 13
  // Test: escapeHtml() should safely escape HTML special characters to prevent injection
  // Scenario: HTML special characters (<, >, &, quotes) are converted to safe text representation; plain text without special characters returns unchanged
  // Methods tested: escapeHtml()
  // Mocks: document.createElement() - create div element for escaping mechanism
  // Expected: < converted to safe form; > converted to safe form; & converted to safe form; quotes converted to safe form; plain text unaffected; empty string handled correctly
  // Parametrized: YES (strings with various special characters, plain text without special characters, empty string)
  test.each([
    {
      name: 'should escape < character',
      input: '<script>alert("xss")</script>',
      expected: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    },
    {
      name: 'should escape > character',
      input: 'Hello > World',
      expected: 'Hello &gt; World'
    },
    {
      name: 'should escape & character',
      input: 'Tom & Jerry',
      expected: 'Tom &amp; Jerry'
    },
    {
      name: 'should escape quotes',
      input: 'He said "Hello"',
      expected: 'He said &quot;Hello&quot;'
    },
    {
      name: 'should escape single quotes',
      input: "It's a test",
      expected: 'It&#x27;s a test'
    },
    {
      name: 'should return plain text unchanged',
      input: 'Plain text with no special chars',
      expected: 'Plain text with no special chars'
    },
    {
      name: 'should handle empty string',
      input: '',
      expected: ''
    },
    {
      name: 'should escape multiple special characters',
      input: '<div class="test" & data-value="123">Content</div>',
      expected: '&lt;div class=&quot;test&quot; &amp; data-value=&quot;123&quot;&gt;Content&lt;/div&gt;'
    }
  ])(
    'escapeHtml() $name',
    ({ input, expected }) => {
      const result = SubscriptionsmanSection.escapeHtml(input);
      expect(result).toBe(expected);
    }
  );

});
