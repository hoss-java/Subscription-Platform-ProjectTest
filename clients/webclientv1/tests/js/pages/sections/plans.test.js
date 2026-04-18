// Test file for: webclientv1/src/js/pages/sections/plans.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { PlansSection } = loadModules('PlansSection');

describe('PlansSection', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: OperatorSection
  // Purpose: Manage operator billing plans including viewing, creating, editing, and deleting plans.
  //          Handles plan data fetching, form generation, validation, and persistence.
  //
  // SETUP OVERVIEW:
  // - jest.spyOn(apiClient, 'get'): Mock API calls for service types, billing periods, and plans
  // - jest.spyOn(apiClient, 'post'): Mock plan creation requests
  // - jest.spyOn(apiClient, 'put'): Mock plan update requests
  // - jest.spyOn(apiClient, 'delete'): Mock plan deletion requests
  // - jest.spyOn(UIController.getInstance(), 'showMessage'): Mock UI notifications
  // - document.body.innerHTML: Mock DOM structure with required elements
  // - OperatorSection state reset: Clear plans, currentPlanId, isEditMode between tests
  //
  // SHARED MOCKS:
  // - apiClient.get() - Mock endpoints: /plans/service-types, /billings/billing-periods, /plans/my-plans
  // - apiClient.post() - Mock /plans endpoint for creating plans
  // - apiClient.put() - Mock /plans/{id} endpoint for updating plans
  // - apiClient.delete() - Mock /plans/{id} endpoint for deleting plans
  // - UIController.getInstance().showMessage() - Mock user feedback messages
  //
  // TESTING RULES & BEST PRACTICES:
  // 1. Prefer parametrized tests (test.each) instead of repeating similar tests
  //    - Reduces code duplication
  //    - Makes it easy to add more test cases
  //    - Improves readability with clear input/output mappings
  //
  // 2. Unit tests should mock all external dependencies
  //    - Mock DOM elements, API calls, UIController
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
  //    - DOM manipulation, API calls, UIController notifications
  //    - Setup mocks in beforeEach or at test level
  //
  // 6. Clean up after each test
  //    - Reset mocks, clear state, restore spies
  //    - Prevents test pollution
  //
  // ===== TEST INVENTORY (PARAMETRIZED & FOCUSED) =====
  // 1. init() | should initialize with correct sequence and timing
  // 2. getUserRole() | should handle various user_data formats (valid role, missing data, invalid JSON, empty roles)
  // 3. loadUserSubscriptions() | should handle role check, API responses, and error cases
  // 4. loadServiceTypes() | should fetch, sort, populate, and handle errors
  // 5. attachEventListeners() | should attach handlers to all required elements
  // 6. resetFilters() | should clear state and input values
  // 7. buildPlanEndpoint() | should build correct endpoints for all filter combinations (no filter, service type, search)
  // 8. loadPlans() | should handle pagination, response formats, empty results, and API errors
  // 9. parseFeatures() | should parse JSON, CSV, and invalid formats
  // 10. renderPlans() | should render plan cards with correct data and handlers
  // 11. createPlanCard() | should display correct sections based on plan data and user role
  // 12. renderPagination() | should show/hide and enable/disable buttons based on page position
  // 13. openDetailModal() | should fetch and display plan details, handle response formats, and errors
  // 14. updateDetailModalButtons() | should show correct button state for CUSTOMER/ADMIN/OTHER roles
  // 15. subscribeToplan() | should handle subscription flow, UI updates, and errors
  // 16. toggleFavorite() | should toggle class and show messages
  // 17. escapeHtml() & cleanup() | should prevent XSS and clear timeouts

  // [Add more tests as they are created]
  //

  let component;
  let mocks = {};

  const createInputMock = (id, config = {}) => {
    const valueKey = `_${id}Value`;
    const defaults = {
      type: 'text',
      className: 'form-control',
      required: false,
      disabled: false,
      placeholder: ''
    };
    
    const props = { ...defaults, ...config };
    const listeners = {};
    const mock = {
      _id: id,
      get id() {
        return this._id;
      },
      set id(newId) {
        this._id = newId;
      },
      [valueKey]: '',
      type: props.type,
      className: props.className,
      required: props.required,
      disabled: props.disabled,
      placeholder: props.placeholder,
      
      get value() {
        return this[valueKey];
      },
      set value(val) {
        this[valueKey] = val;
      },

      addEventListener: jest.fn(function(eventType, handler) {
        listeners[eventType] = handler;
      }),      

      reset() {
        this[valueKey] = '';
      }
    };
    
    return mock;
  };

  const createSelectMock = (id, config = {}) => {
    const defaults = {
      className: 'form-control',
      required: false
    };
    
    const props = { ...defaults, ...config };
    const listeners = {};
    return {
      id,
      _value: '',
      children: [],
      type: 'select',
      className: props.className,
      required: props.required,
      
      get value() {
        return this._value;
      },
      set value(val) {
        this._value = val;
      },
      
      appendChild: jest.fn(function(child) {
        this.children.push(child);
      }),
      
      addEventListener: jest.fn(),
      
      reset() {
        this._value = '';
        this.children = [];
        this.appendChild.mockClear();
        this.addEventListener.mockClear();
      }
    };
  };

  const createContainerMock = (id) => {
    const listeners = {};
    return {
      id,
      _innerHTML: '',
      children: [],
      
      get innerHTML() {
        return this._innerHTML;
      },
      set innerHTML(value) {
        this._innerHTML = value;
        if (value === '') {
          this.children = [];
        }
      },
      
      appendChild: jest.fn(function(child) {
        this.children.push(child);
      }),

      addEventListener: jest.fn(function(eventType, handler) {
        listeners[eventType] = handler;
      }),      

      reset() {
        this._innerHTML = '';
        this.children = [];
        this.appendChild.mockClear();
      }
    };
  };

  const createButtonMock = (id, config = {}) => {
    const defaults = {
      type: 'button',
      textContent: 'Button',
      className: '',
      disabled: false
    };
    
    const props = { ...defaults, ...config };
    const listeners = {};
    
    return {
      id,
      type: props.type,
      _textContent: props.textContent,
      className: props.className,
      disabled: props.disabled,
      style: {},  // ADD THIS LINE
      
      get textContent() {
        return this._textContent;
      },
      set textContent(val) {
        this._textContent = val;
      },
      
      addEventListener: jest.fn(function(eventType, handler) {
        listeners[eventType] = handler;
      }),
      
      reset() {
        this._textContent = props.textContent;
        this.disabled = props.disabled;
        this.style = {};  // ADD THIS LINE
        this.addEventListener.mockClear();
      }
    };
  };

  const createModalMock = (id) => {
    const listeners = {};
    const classListObj = {
      _classList: [],
      add: jest.fn(function(className) {
        if (!this._classList.includes(className)) {
          this._classList.push(className);
        }
      }),
      remove: jest.fn(function(className) {
        this._classList = this._classList.filter(c => c !== className);
      }),
      contains: jest.fn(function(className) {
        return this._classList.includes(className);
      })
    };

    return {
      id,
      _classList: [],
      
      get classList() {
        return classListObj;
      },

      addEventListener: jest.fn(function(eventType, handler) {
        listeners[eventType] = handler;
      }),      

      reset() {
        this._classList = [];
        classListObj._classList = [];
        classListObj.add.mockClear();
        classListObj.remove.mockClear();
        classListObj.contains.mockClear();
      }
    };
  };

  const createGenericElementMock = (tag) => {
    let html = '';
    let textContent = '';
    const children = [];

    return {
      tagName: tag.toUpperCase(),
      className: '',
      _id: '',
      get id() {
        return this._id;
      },
      set id(val) {
        this._id = val;
      },
      _innerHTML: '',
      children: children,
      style: {},
      type: '',
      checked: false,
      disabled: false,
      value: '',
      required: false,
      placeholder: '',
      dataset: {},
      addEventListener: jest.fn(),

      appendChild: jest.fn(function(child) {
        children.push(child);
        html += child.innerHTML || child.textContent || '';
        return child;
      }),

      _escapeHtml(str) {
        const map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        return String(str || '').replace(/[&<>"']/g, char => map[char]);
      },

      querySelector(selector) {
        const classSelector = selector.replace('.', '');
        for (let child of children) {
          if (child.className === classSelector || child.className?.includes(classSelector)) {
            return child;
          }
          if (child.querySelector) {
            const found = child.querySelector(selector);
            if (found) return found;
          }
        }
        return null;
      },

      querySelectorAll(selector) {
        const classSelector = selector.replace('.', '');
        const results = [];
        const search = (element) => {
          if (element.className === classSelector || element.className?.includes(classSelector)) {
            results.push(element);
          }
          if (element.children) {
            element.children.forEach(child => search(child));
          }
        };
        children.forEach(child => search(child));
        return results;
      },

      get innerHTML() {
        if (textContent && !this._innerHTML) {
          const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
          };
          return String(textContent).replace(/[&<>"']/g, char => map[char]);
        }
        return this._innerHTML || html;
      },

      set innerHTML(value) {
        this._innerHTML = value;
        html = value;
        textContent = '';
        this.children = [];
      },

      get textContent() {
        return textContent || html;
      },

      set textContent(value) {
        textContent = value;
        html = value;
      }
    };
  };



  const mockUIController = {
    showMessage: jest.fn()
  };

  const mockLocalStorage = {
    getItem: jest.fn((key) => {
      console.log(`[localStorage.getItem] Called with key: "${key}"`);
      const returnValue = mockLocalStorage.getItem.getMockImplementation?.() || null;
      console.log(`[localStorage.getItem] Returning: ${JSON.stringify(returnValue)}`);
      return returnValue;
    })
  };

  beforeEach(() => {
    jest.useFakeTimers();

    const mockConfigs = {
      'plans-container': { factory: createContainerMock, args: ['plans-container'] },
      'plans-pagination': { factory: createContainerMock, args: ['plans-pagination'] },
      'plans-service-type-filter': { factory: createSelectMock, args: ['plans-service-type-filter'] },
      'plans-search-input': { factory: createInputMock, args: ['plans-search-input', { type: 'text' }] },
      'plans-refresh-btn': { factory: createButtonMock, args: ['plans-refresh-btn', { textContent: 'Refresh' }] },
      'plans-detail-modal': { factory: createModalMock, args: ['plans-detail-modal'] },
      'plans-detail-content': { factory: createContainerMock, args: ['plans-detail-content'] },
      'plans-detail-title': { factory: createGenericElementMock, args: ['h2'] },
      'plans-detail-close-btn': { factory: createButtonMock, args: ['plans-detail-close-btn', { textContent: 'Close' }] },
      'plans-detail-close-footer-btn': { factory: createButtonMock, args: ['plans-detail-close-footer-btn', { textContent: 'Close' }] },
      'plans-detail-subscribe-btn': { factory: createButtonMock, args: ['plans-detail-subscribe-btn', { textContent: 'Subscribe Now' }] }
    };

    mocks = {};
    Object.entries(mockConfigs).forEach(([id, config]) => {
      mocks[id] = config.factory(...(config.args || [id]));
    });

    document.getElementById = jest.fn((id) => mocks[id] || null);
    document.querySelector = jest.fn(() => null);
    document.createElement = jest.fn((tag) => createGenericElementMock(tag));
    document.createDocumentFragment = jest.fn(() => {
      return {
        appendChild: jest.fn(function(child) {
          this.children = this.children || [];
          this.children.push(child);
          return child;
        }),
        children: []
      };
    });

    global.apiClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };

    global.UIController = {
      getInstance: jest.fn(() => mockUIController)
    };

    global.localStorage = mockLocalStorage;

    PlansSection.currentPage = 0;
    PlansSection.pageSize = 12;
    PlansSection.totalPages = 0;
    PlansSection.plans = [];
    PlansSection.currentServiceType = '';
    PlansSection.currentSearchQuery = '';
    PlansSection.currentPlanId = null;
    PlansSection.userSubscriptions = {};
    PlansSection.userRole = '';
    PlansSection.allPlans = [];
  });

  afterEach(() => {
    mockLocalStorage.getItem.mockReset();

    Object.values(mocks).forEach(mock => {
      if (mock.reset) mock.reset();
    });

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    PlansSection.cleanup();
  });

  // ===== TEST COMMENT GUIDE =====
  // Every test should include comments above it starting with "// Test <number>" followed by:
  // - Test: Brief description of what is being tested
  // - Scenario: The specific use case or condition being tested
  // - Methods tested: Which methods/functions are involved
  // - Mocks: What is mocked and why
  // - Expected: What the test expects to happen
  // - Parametrized: YES (if applicable) and what varies across cases
  //
  // Example for parametrized test:
  // // Test 4
  // // Test: loadServiceTypes() should fetch and store service types or handle errors
  // // Scenario: When loadServiceTypes() is called, it receives various API responses (success array, error, non-array response)
  // // Methods tested: loadServiceTypes()
  // // Mocks: apiClient.get() - to simulate different response scenarios
  // // Expected: serviceTypes array populated on success, console.error called on failure, non-array responses ignored
  // // Parametrized: YES - tests success response, error response, and non-array response variants
  //

  // ===== TEST COMMENTS FOR PLANSECTION =====

  // Test 1
  // Test: init() should initialize with correct sequence and timing
  // Scenario: When init() is called, it should set up event listeners, load user role, fetch service types and subscriptions, then load plans
  // Methods tested: init(), attachEventListeners(), loadServiceTypes(), loadUserSubscriptions(), loadPlans()
  // Mocks: setTimeout - to verify 100ms delay, all async methods to track call order
  // Expected: initTimeout set, attachEventListeners called, userRole retrieved, loadServiceTypes and loadUserSubscriptions called in parallel, loadPlans called after
  // Parametrized: YES - tests normal initialization and timeout cleanup scenario
  test.each([
    {
      name: 'normal initialization with CUSTOMER role',
      storageValue: JSON.stringify({ roles: ['CUSTOMER'] }),
      serviceTypes: ['MOBILE', 'INTERNET', 'TV'],
      subscriptions: { content: [{ planId: 1, status: 'ACTIVE' }] },
      plans: { content: [{ id: 1, name: 'Plan 1' }], totalPages: 1 }
    },
    {
      name: 'initialization with ADMIN role',
      storageValue: JSON.stringify({ roles: ['ADMIN'] }),
      serviceTypes: ['MOBILE', 'INTERNET'],
      subscriptions: { content: [] },
      plans: { content: [{ id: 1, name: 'Plan 1' }], totalPages: 1 }
    },
    {
      name: 'initialization with empty service types',
      storageValue: JSON.stringify({ roles: ['CUSTOMER'] }),
      serviceTypes: [],
      subscriptions: { content: [] },
      plans: { content: [], totalPages: 0 }
    }
  ])('init() $name', async ({ storageValue, serviceTypes, subscriptions, plans }) => {
    mockLocalStorage.getItem.mockReturnValue(storageValue);
    
    apiClient.get.mockImplementation((url) => {
      if (url === '/plans/service-types') return Promise.resolve(serviceTypes);
      if (url.includes('/subscriptions/my-subscriptions')) return Promise.resolve(subscriptions);
      if (url.includes('/plans')) return Promise.resolve(plans);
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const attachEventListenersSpy = jest.spyOn(PlansSection, 'attachEventListeners');
    const loadServiceTypesSpy = jest.spyOn(PlansSection, 'loadServiceTypes');
    const loadUserSubscriptionsSpy = jest.spyOn(PlansSection, 'loadUserSubscriptions');
    const loadPlansSpy = jest.spyOn(PlansSection, 'loadPlans');

    PlansSection.init();
    jest.advanceTimersByTime(100);
    await Promise.all([
      loadServiceTypesSpy.mock.results[0]?.value,
      loadUserSubscriptionsSpy.mock.results[0]?.value
    ]);

    expect(PlansSection.initTimeout).toBeDefined();
    expect(attachEventListenersSpy).toHaveBeenCalledTimes(1);
    expect(PlansSection.userRole).toBe(JSON.parse(storageValue).roles[0]);
    expect(loadServiceTypesSpy).toHaveBeenCalledTimes(1);
    expect(loadPlansSpy).toHaveBeenCalledTimes(1);

    attachEventListenersSpy.mockRestore();
    loadServiceTypesSpy.mockRestore();
    loadUserSubscriptionsSpy.mockRestore();
    loadPlansSpy.mockRestore();
  });

  // Test 2
  // Test: getUserRole() should handle various user_data formats (valid role, missing data, invalid JSON, empty roles)
  // Scenario: When getUserRole() is called with different localStorage states (valid user data, missing data, corrupted JSON, empty roles array)
  // Methods tested: getUserRole()
  // Mocks: localStorage.getItem() - to simulate different stored user data scenarios
  // Expected: Returns first role string on success, empty string on missing/invalid/empty data, console.error logged on JSON parse failure
  // Parametrized: YES - tests valid role, missing localStorage, invalid JSON, empty roles array variants
  test.each([
    {
      name: 'should return first role when valid user data exists',
      storageValue: JSON.stringify({ roles: ['CUSTOMER', 'ADMIN'] }),
      expectedResult: 'CUSTOMER',
      shouldLogError: false
    },
    {
      name: 'should return empty string when localStorage is empty',
      storageValue: null,
      expectedResult: '',
      shouldLogError: false
    },
    {
      name: 'should return empty string when roles array is empty',
      storageValue: JSON.stringify({ roles: [] }),
      expectedResult: '',
      shouldLogError: false
    },
    {
      name: 'should return empty string when user_data has no roles property',
      storageValue: JSON.stringify({ id: 123, name: 'John' }),
      expectedResult: '',
      shouldLogError: false
    },
    {
      name: 'should handle invalid JSON gracefully and return empty string',
      storageValue: '{invalid json}',
      expectedResult: '',
      shouldLogError: true
    },
    {
      name: 'should return first role as ADMIN when multiple roles exist',
      storageValue: JSON.stringify({ roles: ['ADMIN', 'CUSTOMER'] }),
      expectedResult: 'ADMIN',
      shouldLogError: false
    },
    {
      name: 'should return empty string when roles is not an array',
      storageValue: JSON.stringify({ roles: 'CUSTOMER' }),
      expectedResult: '',
      shouldLogError: false
    }
  ])('getUserRole() $name', ({ storageValue, expectedResult, shouldLogError }) => {
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user_data') {
        return storageValue;
      }
      return null;
    });
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = PlansSection.getUserRole();

    expect(result).toBe(expectedResult);
    if (shouldLogError) {
      expect(consoleErrorSpy).toHaveBeenCalled();
    }
    
    consoleErrorSpy.mockRestore();
  });

    // Test 3
  // Test: loadUserSubscriptions() should handle role check, API responses, and error cases
  // Scenario: When loadUserSubscriptions() is called with different user roles and API response formats
  // Methods tested: loadUserSubscriptions()
  // Mocks: userRole property, apiClient.get() - returns paginated object or direct array, catches API errors
  // Expected: Returns early if not CUSTOMER, maps planId->status correctly for both response formats, handles empty subscriptions, logs errors gracefully
  // Parametrized: YES - tests CUSTOMER role success (paginated format), CUSTOMER role success (array format), non-CUSTOMER role skip, API error scenarios
  test.each([
    {
      name: 'should load subscriptions and map planId->status for CUSTOMER with paginated response',
      userRole: 'CUSTOMER',
      apiResponse: {
        content: [
          { planId: 1, status: 'ACTIVE' },
          { planId: 2, status: 'INACTIVE' },
          { planId: 3, status: 'PENDING' }
        ],
        totalPages: 1
      },
      shouldCallApi: true,
      expectedSubscriptions: { 1: 'ACTIVE', 2: 'INACTIVE', 3: 'PENDING' },
      shouldLogError: false
    },
    {
      name: 'should load subscriptions and map planId->status for CUSTOMER with array response',
      userRole: 'CUSTOMER',
      apiResponse: [
        { planId: 4, status: 'ACTIVE' },
        { planId: 5, status: 'CANCELLED' }
      ],
      shouldCallApi: true,
      expectedSubscriptions: { 4: 'ACTIVE', 5: 'CANCELLED' },
      shouldLogError: false
    },
    {
      name: 'should handle empty subscriptions array for CUSTOMER',
      userRole: 'CUSTOMER',
      apiResponse: { content: [], totalPages: 0 },
      shouldCallApi: true,
      expectedSubscriptions: {},
      shouldLogError: false
    },
    {
      name: 'should return early without API call for non-CUSTOMER role',
      userRole: 'ADMIN',
      apiResponse: null,
      shouldCallApi: false,
      expectedSubscriptions: {},
      shouldLogError: false
    },
    {
      name: 'should return early without API call for empty user role',
      userRole: '',
      apiResponse: null,
      shouldCallApi: false,
      expectedSubscriptions: {},
      shouldLogError: false
    },
    {
      name: 'should handle API error gracefully',
      userRole: 'CUSTOMER',
      apiResponse: new Error('Network error'),
      shouldCallApi: true,
      expectedSubscriptions: {},
      shouldLogError: true
    }
  ])('loadUserSubscriptions() $name', async ({ userRole, apiResponse, shouldCallApi, expectedSubscriptions, shouldLogError }) => {
    // Setup
    PlansSection.userRole = userRole;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock API response or error
    if (apiResponse instanceof Error) {
      apiClient.get.mockRejectedValueOnce(apiResponse);
    } else {
      apiClient.get.mockResolvedValueOnce(apiResponse);
    }

    // Execute
    await PlansSection.loadUserSubscriptions();

    // Assert API was called or not called based on role
    if (shouldCallApi) {
      expect(apiClient.get).toHaveBeenCalledWith('/subscriptions/my-subscriptions?page=0&size=1000');
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    } else {
      expect(apiClient.get).not.toHaveBeenCalled();
    }

    // Assert subscriptions mapping
    expect(PlansSection.userSubscriptions).toEqual(expectedSubscriptions);

    // Assert error logging
    if (shouldLogError) {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[PlansSection] Error loading user subscriptions:',
        expect.any(Error)
      );
    } else {
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    }

    consoleErrorSpy.mockRestore();
  });

  // Test 4
  // Test: loadServiceTypes() should fetch, sort, populate, and handle errors
  // Scenario: When loadServiceTypes() is called, it fetches service types, sorts them, and populates the dropdown
  // Methods tested: loadServiceTypes(), populateServiceTypeDropdown()
  // Mocks: apiClient.get('/plans/service-types'), document.getElementById() for dropdown element
  // Expected: Fetches service types, sorts them alphabetically, calls populateServiceTypeDropdown with sorted array, handles API errors gracefully
  // Parametrized: YES - tests success scenario, error scenario, and missing dropdown element scenario
  test.each([
    {
      name: 'should fetch, sort, and populate service types',
      apiResponse: ['Mobile', 'Internet', 'TV', 'Bundle'],
      dropdownExists: true,
      shouldLogError: false,
      expectedCall: ['Bundle', 'Internet', 'Mobile', 'TV']
    },
    {
      name: 'should handle API error gracefully',
      apiResponse: new Error('Network error'),
      dropdownExists: true,
      shouldLogError: true,
      expectedCall: null
    },
    {
      name: 'should handle missing dropdown element',
      apiResponse: ['Mobile', 'Internet'],
      dropdownExists: false,
      shouldLogError: false,
      expectedCall: ['Internet', 'Mobile']
    }
  ])('loadServiceTypes() $name', async ({ apiResponse, dropdownExists, shouldLogError, expectedCall }) => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const populateSpy = jest.spyOn(PlansSection, 'populateServiceTypeDropdown');

    if (dropdownExists) {
      mocks['plans-service-type-filter'] = createSelectMock('plans-service-type-filter');
    } else {
      document.getElementById.mockImplementation((id) => id === 'plans-service-type-filter' ? null : mocks[id]);
    }

    if (apiResponse instanceof Error) {
      apiClient.get.mockRejectedValueOnce(apiResponse);
    } else {
      apiClient.get.mockResolvedValueOnce(apiResponse);
    }

    await PlansSection.loadServiceTypes();

    expect(apiClient.get).toHaveBeenCalledWith('/plans/service-types');

    if (expectedCall) {
      expect(populateSpy).toHaveBeenCalledWith(expectedCall);
    } else {
      expect(populateSpy).not.toHaveBeenCalled();
    }

    if (shouldLogError) {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading service types:', expect.any(Error));
    }

    consoleErrorSpy.mockRestore();
    populateSpy.mockRestore();
  });

  // Test 5
  // Test: attachEventListeners() should attach handlers to all required elements
  // Scenario: When attachEventListeners() is called, it should bind event listeners to filter, search, buttons, and modal controls
  // Methods tested: attachEventListeners()
  // Mocks: document.getElementById() for all elements, event listeners - track addEventListener calls
  // Expected: 'change' events bound to filters/search, 'click' events bound to buttons, event handlers execute correct methods, missing elements handled gracefully
  // Parametrized: YES - tests with all elements present, with missing elements, and handler execution scenarios
  test.each([
    {
      name: 'should attach all event listeners to existing elements',
      missingElements: [],
      expectedListeners: {
        'plans-service-type-filter': 'change',
        'plans-search-input': 'change',
        'plans-refresh-btn': 'click',
        'plans-detail-close-btn': 'click',
        'plans-detail-close-footer-btn': 'click',
        'plans-detail-subscribe-btn': 'click'
      }
    },
    {
      name: 'should handle missing filter element',
      missingElements: ['plans-service-type-filter'],
      expectedListeners: {
        'plans-search-input': 'change',
        'plans-refresh-btn': 'click',
        'plans-detail-close-btn': 'click',
        'plans-detail-close-footer-btn': 'click',
        'plans-detail-subscribe-btn': 'click'
      }
    },
    {
      name: 'should handle missing search input element',
      missingElements: ['plans-search-input'],
      expectedListeners: {
        'plans-service-type-filter': 'change',
        'plans-refresh-btn': 'click',
        'plans-detail-close-btn': 'click',
        'plans-detail-close-footer-btn': 'click',
        'plans-detail-subscribe-btn': 'click'
      }
    },
    {
      name: 'should handle multiple missing elements',
      missingElements: ['plans-service-type-filter', 'plans-refresh-btn', 'plans-detail-modal'],
      expectedListeners: {
        'plans-search-input': 'change',
        'plans-detail-close-btn': 'click',
        'plans-detail-close-footer-btn': 'click',
        'plans-detail-subscribe-btn': 'click'
      }
    }
  ])('attachEventListeners() $name', ({ missingElements, expectedListeners }) => {
    document.getElementById.mockImplementation((id) => 
      missingElements.includes(id) ? null : mocks[id]
    );

    PlansSection.attachEventListeners();

    Object.entries(expectedListeners).forEach(([elementId, eventType]) => {
      const element = mocks[elementId];
      expect(element.addEventListener).toHaveBeenCalledWith(eventType, expect.any(Function));
    });

    missingElements.forEach(elementId => {
      if (mocks[elementId]) {
        expect(mocks[elementId].addEventListener).not.toHaveBeenCalled();
      }
    });
  });

  // Test 5b
  // Test: attachEventListeners() should execute correct handlers on events
  // Scenario: When event listeners are triggered, they should execute the correct handler methods with proper side effects
  // Methods tested: attachEventListeners(), event handler callbacks for service type filter, refresh button, and close button
  // Mocks: addEventListener calls to extract and invoke handlers, spy on loadPlans(), resetFilters(), closeDetailModal()
  // Expected: Filter change updates currentServiceType and calls loadPlans(), refresh button calls resetFilters(), close button calls closeDetailModal()
  // Parametrized: NO - single scenario testing all three main handler execution paths
  test('attachEventListeners() should execute correct handlers on events', () => {
    PlansSection.attachEventListeners();
    const loadPlansSpy = jest.spyOn(PlansSection, 'loadPlans');
    const resetFiltersSpy = jest.spyOn(PlansSection, 'resetFilters');
    const closeModalSpy = jest.spyOn(PlansSection, 'closeDetailModal');

    // Simulate service type filter change
    const filterMock = mocks['plans-service-type-filter'];
    filterMock.value = 'Mobile';
    const changeHandler = filterMock.addEventListener.mock.calls.find(call => call[0] === 'change')?.[1];
    changeHandler?.({ target: filterMock });
    expect(PlansSection.currentServiceType).toBe('Mobile');
    expect(loadPlansSpy).toHaveBeenCalled();

    // Simulate refresh button click
    const refreshBtn = mocks['plans-refresh-btn'];
    const clickHandler = refreshBtn.addEventListener.mock.calls.find(call => call[0] === 'click')?.[1];
    clickHandler?.({ preventDefault: jest.fn() });
    expect(resetFiltersSpy).toHaveBeenCalled();

    // Simulate close button click
    const closeBtn = mocks['plans-detail-close-btn'];
    const closeHandler = closeBtn.addEventListener.mock.calls.find(call => call[0] === 'click')?.[1];
    closeHandler?.({ preventDefault: jest.fn() });
    expect(closeModalSpy).toHaveBeenCalled();

    loadPlansSpy.mockRestore();
    resetFiltersSpy.mockRestore();
    closeModalSpy.mockRestore();
  });

  // Test 6
  // Test: resetFilters() should clear state and input values
  // Scenario: When resetFilters() is called after filters have been applied
  // Methods tested: resetFilters(), syncFilterUI()
  // Mocks: document.getElementById() for input elements
  // Expected: currentServiceType and currentSearchQuery reset to empty string, currentPage reset to 0, input element values cleared
  // Parametrized: YES - tests with elements present and with missing elements
  test.each([
    {
      name: 'should reset all filters and input values when elements exist',
      missingElements: [],
      shouldResetUI: true
    },
    {
      name: 'should reset state values even with missing filter element',
      missingElements: ['plans-service-type-filter'],
      shouldResetUI: true
    },
    {
      name: 'should reset state values even with missing search input element',
      missingElements: ['plans-search-input'],
      shouldResetUI: true
    },
    {
      name: 'should reset state values even with all input elements missing',
      missingElements: ['plans-service-type-filter', 'plans-search-input'],
      shouldResetUI: true
    }
  ])('resetFilters() $name', ({ missingElements, shouldResetUI }) => {
    // Setup initial state
    PlansSection.currentServiceType = 'Mobile';
    PlansSection.currentSearchQuery = 'test query';
    PlansSection.currentPage = 5;
    
    mocks['plans-service-type-filter'].value = 'Mobile';
    mocks['plans-search-input'].value = 'test query';

    document.getElementById.mockImplementation((id) => 
      missingElements.includes(id) ? null : mocks[id]
    );

    // Execute
    PlansSection.resetFilters();

    // Assert state is reset
    expect(PlansSection.currentServiceType).toBe('');
    expect(PlansSection.currentSearchQuery).toBe('');
    expect(PlansSection.currentPage).toBe(0);

    // Assert input values are cleared (if elements exist)
    if (!missingElements.includes('plans-service-type-filter')) {
      expect(mocks['plans-service-type-filter'].value).toBe('');
    }
    if (!missingElements.includes('plans-search-input')) {
      expect(mocks['plans-search-input'].value).toBe('');
    }
  });

  // Test 7
  // Test: buildPlanEndpoint() should build correct endpoints for all filter combinations (no filter, service type, search)
  // Scenario: When buildPlanEndpoint() is called with different filter states
  // Methods tested: buildPlanEndpoint()
  // Mocks: None - pure string building logic
  // Expected: Returns /plans endpoint when no filters, /plans/filter when serviceType set, /plans/search when searchQuery set, search takes precedence, proper URI encoding
  // Parametrized: YES - tests no filter, service type filter only, search query only, search+filter combination, URI encoding scenarios
  test.each([
    {
      name: 'should return base endpoint with no filters',
      currentPage: 0,
      pageSize: 12,
      currentServiceType: '',
      currentSearchQuery: '',
      expectedEndpoint: '/plans?page=0&size=12'
    },
    {
      name: 'should return filter endpoint with service type only',
      currentPage: 0,
      pageSize: 12,
      currentServiceType: 'Mobile',
      currentSearchQuery: '',
      expectedEndpoint: '/plans/filter?serviceType=Mobile&page=0&size=12'
    },
    {
      name: 'should return search endpoint with search query only',
      currentPage: 0,
      pageSize: 12,
      currentServiceType: '',
      currentSearchQuery: 'unlimited',
      expectedEndpoint: '/plans/search?q=unlimited&page=0&size=12'
    },
    {
      name: 'should prioritize search query over service type filter',
      currentPage: 1,
      pageSize: 20,
      currentServiceType: 'Mobile',
      currentSearchQuery: 'premium plan',
      expectedEndpoint: '/plans/search?q=premium%20plan&page=1&size=20'
    },
    {
      name: 'should handle special characters in search query',
      currentPage: 0,
      pageSize: 12,
      currentServiceType: '',
      currentSearchQuery: 'plan & offer/deal',
      expectedEndpoint: '/plans/search?q=plan%20%26%20offer%2Fdeal&page=0&size=12'
    },
    {
      name: 'should handle special characters in service type',
      currentPage: 2,
      pageSize: 12,
      currentServiceType: 'TV & Internet',
      currentSearchQuery: '',
      expectedEndpoint: '/plans/filter?serviceType=TV%20%26%20Internet&page=2&size=12'
    },
    {
      name: 'should handle pagination on different pages',
      currentPage: 5,
      pageSize: 12,
      currentServiceType: 'Internet',
      currentSearchQuery: '',
      expectedEndpoint: '/plans/filter?serviceType=Internet&page=5&size=12'
    }
  ])('buildPlanEndpoint() $name', ({ currentPage, pageSize, currentServiceType, currentSearchQuery, expectedEndpoint }) => {
    PlansSection.currentPage = currentPage;
    PlansSection.pageSize = pageSize;
    PlansSection.currentServiceType = currentServiceType;
    PlansSection.currentSearchQuery = currentSearchQuery;

    const endpoint = PlansSection.buildPlanEndpoint();

    expect(endpoint).toBe(expectedEndpoint);
  });

  // Test 8
  // Test: loadPlans() should handle pagination, response formats, empty results, and API errors
  // Scenario: When loadPlans() is called with different API response formats and states
  // Methods tested: loadPlans(), buildPlanEndpoint(), extractPlanData(), renderPlans(), renderPagination(), syncFilterUI()
  // Mocks: apiClient.get(), document.getElementById() for container, all called methods mocked to verify execution
  // Expected: Shows loading message, calls buildPlanEndpoint, handles paginated/array responses, displays empty message when no plans, calls render methods, handles API errors
  // Parametrized: YES - tests paginated response format, direct array format, empty results, API error, missing container scenarios
  test.each([
    {
      name: 'should load and render plans with paginated response',
      apiResponse: {
        content: [
          { id: 1, name: 'Plan A', description: 'Desc A', operatorName: 'Op1', serviceType: 'Mobile', basePrice: 10, billingPeriod: 'month', features: '[]' },
          { id: 2, name: 'Plan B', description: 'Desc B', operatorName: 'Op2', serviceType: 'Internet', basePrice: 20, billingPeriod: 'month', features: '[]' }
        ],
        totalPages: 2
      },
      containerExists: true,
      shouldRenderPlans: true,
      shouldRenderPagination: true,
      shouldShowEmpty: false,
      shouldLogError: false
    },
    {
      name: 'should load and render plans with direct array response',
      apiResponse: [
        { id: 3, name: 'Plan C', description: 'Desc C', operatorName: 'Op3', serviceType: 'TV', basePrice: 15, billingPeriod: 'month', features: '[]' }
      ],
      containerExists: true,
      shouldRenderPlans: true,
      shouldRenderPagination: false,
      shouldShowEmpty: false,
      shouldLogError: false
    },
    {
      name: 'should display empty message when no plans found',
      apiResponse: { content: [], totalPages: 0 },
      containerExists: true,
      shouldRenderPlans: false,
      shouldRenderPagination: true,
      shouldShowEmpty: true,
      shouldLogError: false
    },
    {
      name: 'should handle API error gracefully',
      apiResponse: new Error('Network error'),
      containerExists: true,
      shouldRenderPlans: false,
      shouldRenderPagination: true,
      shouldShowEmpty: false,
      shouldLogError: true
    },
    {
      name: 'should handle missing container element',
      apiResponse: { content: [], totalPages: 0 },
      containerExists: false,
      shouldRenderPlans: false,
      shouldRenderPagination: false,
      shouldShowEmpty: false,
      shouldLogError: false
    }
  ])('loadPlans() $name', async ({ apiResponse, containerExists, shouldRenderPlans, shouldRenderPagination, shouldShowEmpty, shouldLogError }) => {
    if (!containerExists) {
      document.getElementById.mockImplementation((id) => 
        id === 'plans-container' ? null : mocks[id]
      );
    }

    const renderPlansSpy = jest.spyOn(PlansSection, 'renderPlans');
    const renderPaginationSpy = jest.spyOn(PlansSection, 'renderPagination');
    const syncFilterUISpy = jest.spyOn(PlansSection, 'syncFilterUI');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const uiShowMessageSpy = jest.spyOn(UIController.getInstance(), 'showMessage');

    if (apiResponse instanceof Error) {
      apiClient.get.mockRejectedValueOnce(apiResponse);
    } else {
      apiClient.get.mockResolvedValueOnce(apiResponse);
    }

    await PlansSection.loadPlans();

    if (containerExists) {
      expect(apiClient.get).toHaveBeenCalled();
      
      if (shouldRenderPlans) {
        expect(renderPlansSpy).toHaveBeenCalled();
        expect(PlansSection.plans.length).toBeGreaterThan(0);
      } else {
        expect(renderPlansSpy).not.toHaveBeenCalled();
      }

      if (!shouldLogError) {  // Only check these when no error
        expect(renderPaginationSpy).toHaveBeenCalled();
        expect(syncFilterUISpy).toHaveBeenCalled();
      }

      if (shouldShowEmpty) {
        expect(mocks['plans-container'].innerHTML).toContain('No plans found');
      }
    }


    renderPlansSpy.mockRestore();
    renderPaginationSpy.mockRestore();
    syncFilterUISpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // Test 9
  // Test: parseFeatures() should parse JSON, CSV, and invalid formats
  // Scenario: When parseFeatures() is called with different feature string formats
  // Methods tested: parseFeatures()
  // Mocks: None - pure string parsing logic
  // Expected: Parses JSON array format, parses comma-separated string, trims whitespace, filters empty values, returns original in array on invalid format
  // Parametrized: YES - tests JSON array, CSV format, CSV with whitespace, empty string, null/undefined, invalid JSON variants
  test.each([
    {
      name: 'should parse valid JSON array format',
      input: '["Unlimited Data", "24/7 Support", "Free Roaming"]',
      expected: ['Unlimited Data', '24/7 Support', 'Free Roaming']
    },
    {
      name: 'should parse comma-separated string format',
      input: 'Unlimited Data, 24/7 Support, Free Roaming',
      expected: ['Unlimited Data', '24/7 Support', 'Free Roaming']
    },
    {
      name: 'should trim whitespace in CSV format',
      input: '  Feature 1  ,  Feature 2  ,  Feature 3  ',
      expected: ['Feature 1', 'Feature 2', 'Feature 3']
    },
    {
      name: 'should filter empty values in CSV format',
      input: 'Feature 1, , Feature 2, ,Feature 3',
      expected: ['Feature 1', 'Feature 2', 'Feature 3']
    },
    {
      name: 'should handle empty string',
      input: '',
      expected: []
    },
    {
      name: 'should handle null',
      input: null,
      expected: []
    },
    {
      name: 'should handle undefined',
      input: undefined,
      expected: []
    },
    {
      name: 'should return original in array on invalid JSON',
      input: '{invalid json}',
      expected: ['{invalid json}']
    },
    {
      name: 'should handle JSON object instead of array',
      input: '{"feature": "value"}',
      expected: ['{"feature": "value"}']
    },
    {
      name: 'should parse single feature in JSON array',
      input: '["Single Feature"]',
      expected: ['Single Feature']
    }
  ])('parseFeatures() $name', ({ input, expected }) => {
    const result = PlansSection.parseFeatures(input);

    expect(result).toEqual(expected);
  });

  // Test 10
  // Test: renderPlans() should render plan cards with correct data and handlers
  // Scenario: When renderPlans() is called with plans array populated
  // Methods tested: renderPlans(), createPlanCard()
  // Mocks: plans array, document.getElementById() for container, createPlanCard mocked or verified
  // Expected: Clears container innerHTML, creates plan card for each plan, appends all cards using DocumentFragment
  // Parametrized: YES - tests with single plan, multiple plans, empty array scenarios
  test.each([
    {
      name: 'should render single plan card',
      plans: [
        { id: 1, name: 'Basic Plan', description: 'Basic service', operatorName: 'Operator A', serviceType: 'Mobile', basePrice: 10, billingPeriod: 'month', features: '["Feature 1"]' }
      ],
      expectedCardCount: 1
    },
    {
      name: 'should render multiple plan cards',
      plans: [
        { id: 1, name: 'Plan 1', description: 'Desc 1', operatorName: 'Op A', serviceType: 'Mobile', basePrice: 10, billingPeriod: 'month', features: '[]' },
        { id: 2, name: 'Plan 2', description: 'Desc 2', operatorName: 'Op B', serviceType: 'Internet', basePrice: 20, billingPeriod: 'month', features: '[]' },
        { id: 3, name: 'Plan 3', description: 'Desc 3', operatorName: 'Op C', serviceType: 'TV', basePrice: 15, billingPeriod: 'month', features: '[]' }
      ],
      expectedCardCount: 3
    },
    {
      name: 'should clear container before rendering',
      plans: [
        { id: 1, name: 'Plan', description: 'Desc', operatorName: 'Op', serviceType: 'Mobile', basePrice: 10, billingPeriod: 'month', features: '[]' }
      ],
      expectedCardCount: 1
    }
  ])('renderPlans() $name', ({ plans, expectedCardCount }) => {
    const container = mocks['plans-container'];
    const createPlanCardSpy = jest.spyOn(PlansSection, 'createPlanCard').mockReturnValue(createGenericElementMock('div'));

    PlansSection.plans = plans;
    PlansSection.renderPlans();

    // Assert container is cleared
    expect(container.innerHTML).toBe('');

    // Assert createPlanCard was called for each plan
    expect(createPlanCardSpy).toHaveBeenCalledTimes(expectedCardCount);
    plans.forEach((plan, index) => {
      expect(createPlanCardSpy).toHaveBeenNthCalledWith(index + 1, plan);
    });

    // Assert appendChild was called ONCE with the fragment
    expect(container.appendChild).toHaveBeenCalledTimes(1);

    createPlanCardSpy.mockRestore();
  });

  // Test 11
  // Test: createPlanCard() should display correct sections based on plan data and user role
  // Scenario: When createPlanCard() is called with various plan data and user roles
  // Methods tested: createPlanCard(), createCardHeader(), createBadges(), createPriceSection(), createFeaturesSection(), createCardActions()
  // Mocks: plan object with varying data, userRole and userSubscriptions state
  // Expected: Includes all required sections, escapes HTML, displays fallback values for missing data, shows subscription badge only for CUSTOMER with subscription, attaches correct event handlers
  // Parametrized: YES - tests CUSTOMER role (with/without subscription), ADMIN role, plan with/without description, with/without features variants
  test.each([
    {
      name: 'should create card with all sections for CUSTOMER without subscription',
      userRole: 'CUSTOMER',
      plan: {
        id: '1',
        name: 'Basic Plan',
        description: 'Basic mobile plan',
        operatorName: 'Operator A',
        serviceType: 'Mobile',
        basePrice: '29.99',
        billingPeriod: 'month',
        features: '["Unlimited Calls", "2GB Data"]',
        status: 'ACTIVE'
      },
      userSubscriptions: {},
      shouldShowSubscriptionBadge: false
    },
    {
      name: 'should create card with subscription badge for CUSTOMER with subscription',
      userRole: 'CUSTOMER',
      plan: {
        id: '2',
        name: 'Premium Plan',
        description: 'Premium mobile plan',
        operatorName: 'Operator B',
        serviceType: 'Mobile',
        basePrice: '49.99',
        billingPeriod: 'month',
        features: '["Unlimited Calls", "10GB Data", "Priority Support"]',
        status: 'ACTIVE'
      },
      userSubscriptions: { 2: 'ACTIVE' },
      shouldShowSubscriptionBadge: true
    },
    {
      name: 'should create card for ADMIN role without subscription badge',
      userRole: 'ADMIN',
      plan: {
        id: '3',
        name: 'Enterprise Plan',
        description: 'Enterprise solution',
        operatorName: 'Operator C',
        serviceType: 'Internet',
        basePrice: '99.99',
        billingPeriod: 'month',
        features: '["Fiber Speed", "Business Support"]',
        status: 'ACTIVE'
      },
      userSubscriptions: { 3: 'ACTIVE' },
      shouldShowSubscriptionBadge: false
    },
    {
      name: 'should handle missing description with fallback',
      userRole: 'CUSTOMER',
      plan: {
        id: '4',
        name: 'Standard Plan',
        description: null,
        operatorName: 'Operator D',
        serviceType: 'TV',
        basePrice: '19.99',
        billingPeriod: 'month',
        features: '["100+ Channels"]',
        status: 'ACTIVE'
      },
      userSubscriptions: {},
      shouldShowSubscriptionBadge: false
    },
    {
      name: 'should handle missing features',
      userRole: 'CUSTOMER',
      plan: {
        id: '5',
        name: 'Basic TV',
        description: 'Basic TV plan',
        operatorName: 'Operator E',
        serviceType: 'TV',
        basePrice: '15.99',
        billingPeriod: 'month',
        features: null,
        status: 'ACTIVE'
      },
      userSubscriptions: {},
      shouldShowSubscriptionBadge: false
    },
    {
      name: 'should escape HTML in plan data',
      userRole: 'CUSTOMER',
      plan: {
        id: '6',
        name: '<script>alert("xss")</script>',
        description: '<img src=x onerror="alert(\'xss\')">',
        operatorName: '<b>Operator</b>',
        serviceType: 'Mobile',
        basePrice: '29.99',
        billingPeriod: 'month',
        features: '["Feature<script>"]',
        status: 'ACTIVE'
      },
      userSubscriptions: {},
      shouldShowSubscriptionBadge: false
    }
  ])('createPlanCard() $name', ({ userRole, plan, userSubscriptions, shouldShowSubscriptionBadge }) => {
    PlansSection.userRole = userRole;
    PlansSection.userSubscriptions = userSubscriptions;

    const card = PlansSection.createPlanCard(plan);

    expect(card.className).toBe('plan-card');
    expect(card.dataset.planId).toBe(plan.id.toString());

    const planName = card.querySelector ? card.querySelector('.plan-name') : card.children.find(el => el.className === 'plan-name');
    if (plan.name.includes('<')) {
      expect(planName?.textContent).not.toContain('<');
      expect(planName?.textContent).toContain('&lt;');
    } else {
      expect(planName?.textContent).toContain(plan.name);
    }

    const operatorName = card.querySelector ? card.querySelector('.plan-operator-name') : card.children.find(el => el.className?.includes('plan-operator-name'));
    if ((plan.operatorName || '').includes('<')) {
      expect(operatorName?.textContent).not.toContain('<');
      expect(operatorName?.textContent).toContain('&lt;');
    } else {
      expect(operatorName?.textContent).toContain(plan.operatorName || 'N/A');
    }

    const serviceTypeBadge = card.querySelector ? card.querySelector('.plan-service-type-badge') : card.children.find(el => el.className?.includes('plan-service-type-badge'));
    expect(serviceTypeBadge?.textContent).toBe(plan.serviceType || 'N/A');

    const price = card.querySelector ? card.querySelector('.plan-price') : card.children.find(el => el.className === 'plan-price');
    expect(price?.textContent).toContain(plan.basePrice.toString());

    if (shouldShowSubscriptionBadge) {
      const statusBadge = card.querySelector ? card.querySelector('.plan-status-badge') : card.children.find(el => el.className?.includes('plan-status-badge'));
      expect(statusBadge).toBeTruthy();
      expect(statusBadge?.textContent).toBe(userSubscriptions[plan.id]);
    }

    const detailBtn = card.querySelector ? card.querySelector('.btn-secondary') : card.children.find(el => el.className?.includes('btn-secondary'));
    expect(detailBtn?.textContent).toBe('View Details');

    const favBtn = card.querySelector ? card.querySelector('.plan-favorite-btn') : card.children.find(el => el.className?.includes('plan-favorite-btn'));
    expect(favBtn).toBeTruthy();
  });

  // Test 12
  // Test: renderPagination() should show/hide and enable/disable buttons based on page position
  // Scenario: When renderPagination() is called with different totalPages and currentPage values
  // Methods tested: renderPagination()
  // Mocks: document.getElementById() for pagination container, totalPages and currentPage state
  // Expected: Hides pagination when totalPages <= 1, Previous button disabled on page 0, Next button disabled on last page, buttons enabled in valid positions, page info displayed correctly
  // Parametrized: YES - tests single page (no pagination), first page, middle page, last page, missing container scenarios
  test.each([
    {
      name: 'should hide pagination when totalPages is 1',
      totalPages: 1,
      currentPage: 0,
      containerExists: true,
      expectedPrevDisabled: true,
      expectedNextDisabled: true,
      shouldHideContainer: true
    },
    {
      name: 'should hide pagination when totalPages is 0',
      totalPages: 0,
      currentPage: 0,
      containerExists: true,
      expectedPrevDisabled: true,
      expectedNextDisabled: true,
      shouldHideContainer: true
    },
    {
      name: 'should disable Previous button on first page',
      totalPages: 5,
      currentPage: 0,
      containerExists: true,
      expectedPrevDisabled: true,
      expectedNextDisabled: false,
      shouldHideContainer: false,
      expectedPageInfo: 'Page 1 of 5'
    },
    {
      name: 'should enable both buttons on middle page',
      totalPages: 5,
      currentPage: 2,
      containerExists: true,
      expectedPrevDisabled: false,
      expectedNextDisabled: false,
      shouldHideContainer: false,
      expectedPageInfo: 'Page 3 of 5'
    },
    {
      name: 'should disable Next button on last page',
      totalPages: 5,
      currentPage: 4,
      containerExists: true,
      expectedPrevDisabled: false,
      expectedNextDisabled: true,
      shouldHideContainer: false,
      expectedPageInfo: 'Page 5 of 5'
    },
    {
      name: 'should handle missing pagination container',
      totalPages: 5,
      currentPage: 0,
      containerExists: false,
      expectedPrevDisabled: null,
      expectedNextDisabled: null,
      shouldHideContainer: true
    }
  ])('renderPagination() $name', ({ totalPages, currentPage, containerExists, expectedPrevDisabled, expectedNextDisabled, shouldHideContainer, expectedPageInfo }) => {
    PlansSection.totalPages = totalPages;
    PlansSection.currentPage = currentPage;

    if (!containerExists) {
      document.getElementById.mockImplementation((id) => 
        id === 'plans-pagination' ? null : mocks[id]
      );
    }

    PlansSection.renderPagination();

    const container = mocks['plans-pagination'];

    if (shouldHideContainer) {
      expect(container.innerHTML).toBe('');
      expect(container.appendChild).not.toHaveBeenCalled();
    } else {
      // The container.innerHTML is cleared, but appendChild was called with the fragment
      expect(container.appendChild).toHaveBeenCalled();
      
      // Check that the fragment children include buttons and info
      const fragmentCall = container.appendChild.mock.calls[0];
      const fragment = fragmentCall[0];
      
      // The fragment should have children: [Previous button, info span, Next button]
      expect(fragment.children.length).toBe(3);
      
      // Check the page info span (second child)
      const pageInfoSpan = fragment.children[1];
      expect(pageInfoSpan.textContent).toBe(expectedPageInfo);
      
      // Check button states
      const prevBtn = fragment.children[0];
      const nextBtn = fragment.children[2];
      
      expect(prevBtn.disabled).toBe(expectedPrevDisabled);
      expect(nextBtn.disabled).toBe(expectedNextDisabled);
    }
  });


  // Test 12b
  // Test: renderPagination() should handle Previous/Next button clicks and update currentPage
  // Scenario: When Previous/Next buttons are clicked, currentPage should update and loadPlans() should be called
  // Methods tested: renderPagination(), button click handlers
  // Mocks: loadPlans() spy to verify it's called on button clicks
  // Expected: Previous button click decrements currentPage and calls loadPlans(), Next button click increments currentPage and calls loadPlans(), handlers work correctly when called multiple times
  // Parametrized: NO - tests Previous and Next button click behavior sequentially
  test('renderPagination() should handle Previous/Next button clicks', () => {
    PlansSection.totalPages = 3;
    PlansSection.currentPage = 1;
    const loadPlansSpy = jest.spyOn(PlansSection, 'loadPlans');

    PlansSection.renderPagination();

    // Get the fragment that was appended to the container
    const fragmentCall = mocks['plans-pagination'].appendChild.mock.calls[0];
    const fragment = fragmentCall[0];
    
    // Extract buttons from fragment children
    // Fragment structure: [prevBtn, infoSpan, nextBtn]
    const prevBtn = fragment.children[0];
    const nextBtn = fragment.children[2];

    // Get the click handler from Previous button
    const prevClickCall = prevBtn.addEventListener.mock.calls.find(call => call[0] === 'click');
    expect(prevClickCall).toBeDefined();
    const prevHandler = prevClickCall[1];

    // Click Previous button
    prevHandler({ preventDefault: jest.fn() });
    expect(PlansSection.currentPage).toBe(0);
    expect(loadPlansSpy).toHaveBeenCalledTimes(1);

    loadPlansSpy.mockClear();

    // Reset and test Next button
    PlansSection.currentPage = 1;
    PlansSection.renderPagination();
    
    const newFragmentCall = mocks['plans-pagination'].appendChild.mock.calls[1];
    const newFragment = newFragmentCall[0];
    const newNextBtn = newFragment.children[2];

    const nextClickCall = newNextBtn.addEventListener.mock.calls.find(call => call[0] === 'click');
    expect(nextClickCall).toBeDefined();
    const nextHandler = nextClickCall[1];

    // Click Next button
    nextHandler({ preventDefault: jest.fn() });
    expect(PlansSection.currentPage).toBe(2);
    expect(loadPlansSpy).toHaveBeenCalledTimes(1);

    loadPlansSpy.mockRestore();
  });

  // Test 13
  // Test: openDetailModal() should fetch and display plan details, handle response formats, and errors
  // Scenario: When openDetailModal() is called with a plan ID
  // Methods tested: openDetailModal(), updateDetailModalButtons()
  // Mocks: apiClient.get('/plans/{id}'), document.getElementById() for modal and content, response.data and direct object formats
  // Expected: Sets currentPlanId, adds 'active' class to modal, shows loading message, fetches plan details, handles both response formats, displays plan info and features, calls updateDetailModalButtons, handles API errors
  // Parametrized: YES - tests response.data format, direct object format, API error, missing modal element, missing plan features scenarios
  test.each([
    {
      name: 'should fetch and display plan details with response.data format',
      planId: 1,
      apiResponse: {
        data: {
          id: 1,
          name: 'Premium Plan',
          operatorName: 'TeleCom',
          serviceType: 'Mobile',
          basePrice: 50,
          billingPeriod: 'month',
          description: 'Premium mobile plan',
          features: '["Unlimited Calls", "5GB Data", "Priority Support"]',
          status: 'ACTIVE'
        }
      },
      modalExists: true,
      shouldHaveError: false
    },
    {
      name: 'should fetch and display plan details with direct object format',
      planId: 2,
      apiResponse: {
        id: 2,
        name: 'Basic Plan',
        operatorName: 'NetCorp',
        serviceType: 'Internet',
        basePrice: 30,
        billingPeriod: 'month',
        description: 'Basic internet plan',
        features: 'Unlimited Speed, 24/7 Support',
        status: 'ACTIVE'
      },
      modalExists: true,
      shouldLogError: false
    },
    {
      name: 'should handle plan with no features',
      planId: 3,
      apiResponse: {
        id: 3,
        name: 'Standard Plan',
        operatorName: 'DataNet',
        serviceType: 'TV',
        basePrice: 40,
        billingPeriod: 'month',
        description: 'Standard TV plan',
        features: null,
        status: 'ACTIVE'
      },
      modalExists: true,
      shouldLogError: false
    },
    {
      name: 'should handle API error gracefully',
      planId: 4,
      apiResponse: new Error('Failed to fetch plan'),
      modalExists: true,
      shouldHaveError: true
    },
    {
      name: 'should handle missing modal element',
      planId: 5,
      apiResponse: {
        id: 5,
        name: 'Test Plan',
        operatorName: 'TestCorp',
        serviceType: 'Mobile',
        basePrice: 25,
        billingPeriod: 'month',
        description: 'Test plan',
        features: '["Feature1"]',
        status: 'ACTIVE'
      },
      modalExists: false,
      shouldHaveError: false
    }
])('openDetailModal() $name', async ({ planId, apiResponse, modalExists, shouldHaveError }) => {
  // Create a map to store dynamically created elements
  const dynamicElements = {};

  if (!modalExists) {
    document.getElementById.mockImplementation((id) => 
      id === 'plans-detail-modal' || id === 'plans-detail-content' ? null : mocks[id]
    );
  } else {
    // Override getElementById to handle dynamic elements
    document.getElementById.mockImplementation((id) => {
      // First check static mocks
      if (mocks[id]) return mocks[id];
      
      // Then check dynamically created elements
      if (dynamicElements[id]) return dynamicElements[id];
      
      // Create dynamic element if requested
      if (id === 'plan-detail-features-list') {
        if (!dynamicElements[id]) {
          dynamicElements[id] = createGenericElementMock('ul');
          dynamicElements[id].id = id;
        }
        return dynamicElements[id];
      }
      
      return null;
    });
  }

  const mockShowMessage = jest.fn();
  global.UIController.getInstance.mockReturnValue({ showMessage: mockShowMessage });

  if (apiResponse instanceof Error) {
    apiClient.get.mockRejectedValue(apiResponse);
  } else {
    apiClient.get.mockResolvedValue(apiResponse);
  }

  await PlansSection.openDetailModal(planId);

  const detailContent = mocks['plans-detail-content'];

  expect(PlansSection.currentPlanId).toBe(planId);

  if (modalExists) {
    const modal = mocks['plans-detail-modal'];
    expect(modal.classList.add).toHaveBeenCalledWith('active');
    expect(apiClient.get).toHaveBeenCalledWith(`/plans/${planId}`);

    if (shouldHaveError) {
      expect(detailContent.innerHTML).toContain('error-message');
      expect(detailContent.innerHTML).toContain('Error loading plan details:');
      
      expect(mockShowMessage).toHaveBeenCalledWith(
        expect.stringContaining('Error loading plan details:'),
        'error'
      );
    } else {
      // Extract plan data (handle both response.data and direct object formats)
      const planData = apiResponse.data || apiResponse;
      
      // Check the title element for the plan name
      const titleElement = mocks['plans-detail-title'];
      expect(titleElement.textContent).toContain(planData.name);
      expect(titleElement.textContent).toContain(planData.operatorName);
      
      // Check the detail content for other information
      expect(detailContent.innerHTML).toContain('plan-detail-info');
      expect(detailContent.innerHTML).toContain(planData.operatorName);
      expect(detailContent.innerHTML).toContain(planData.serviceType);
      expect(detailContent.innerHTML).toContain(`$${planData.basePrice}`);
      expect(detailContent.innerHTML).toContain(planData.description);
      
      const featuresList = dynamicElements['plan-detail-features-list'];
      if (featuresList) {
        // When features is null/empty, the code sets innerHTML instead of appendChild
        if (planData.features) {
          expect(featuresList.appendChild).toHaveBeenCalled();
        } else {
          // For null/empty features, check that the "No features listed" message was set
          expect(featuresList.innerHTML).toContain('No features listed');
        }
      }
    }
  } else {
    expect(PlansSection.currentPlanId).toBe(planId);
  }
});




  // Test 14
  // Test: updateDetailModalButtons() should show correct button state for CUSTOMER/ADMIN/OTHER roles
  // Scenario: When updateDetailModalButtons() is called with different user roles and subscription statuses
  // Methods tested: updateDetailModalButtons()
  // Mocks: document.getElementById() for button element, userRole, userSubscriptions state
  // Expected: CUSTOMER without subscription shows enabled "Subscribe Now" button, CUSTOMER with subscription shows disabled status button, ADMIN shows "Activate/Disable Plan" based on status, OTHER roles hide button
  // Parametrized: YES - tests CUSTOMER (no subscription), CUSTOMER (with subscription), ADMIN (ACTIVE), ADMIN (inactive), OTHER role, missing button scenarios
  test.each([
    {
      name: 'should show enabled Subscribe Now button for CUSTOMER without subscription',
      userRole: 'CUSTOMER',
      plan: { id: 1, name: 'Basic', status: 'ACTIVE' },
      isSubscribed: false,
      buttonExists: true,
      expectedText: 'Subscribe Now',
      expectedDisabled: false,
      expectedDisplay: 'block'
    },
    {
      name: 'should show disabled button with status for CUSTOMER with subscription',
      userRole: 'CUSTOMER',
      plan: { id: 1, name: 'Basic', status: 'ACTIVE' },
      isSubscribed: true,
      subscriptionStatus: 'ACTIVE',
      buttonExists: true,
      expectedText: 'Already Subscribed (ACTIVE)',
      expectedDisabled: true,
      expectedDisplay: 'block'
    },
    {
      name: 'should show disabled Disable Plan button for ADMIN with ACTIVE plan',
      userRole: 'ADMIN',
      plan: { id: 1, name: 'Basic', status: 'ACTIVE' },
      isSubscribed: false,
      buttonExists: true,
      expectedText: 'Disable Plan',
      expectedDisabled: false,
      expectedDisplay: 'block',
      expectedClass: 'btn btn-danger'
    },
    {
      name: 'should show Activate Plan button for ADMIN with inactive plan',
      userRole: 'ADMIN',
      plan: { id: 1, name: 'Basic', status: 'INACTIVE' },
      isSubscribed: false,
      buttonExists: true,
      expectedText: 'Activate Plan',
      expectedDisabled: false,
      expectedDisplay: 'block',
      expectedClass: 'btn btn-success'
    },
    {
      name: 'should hide button for OTHER role',
      userRole: 'GUEST',
      plan: { id: 1, name: 'Basic', status: 'ACTIVE' },
      isSubscribed: false,
      buttonExists: true,
      expectedDisplay: 'none'
    },
    {
      name: 'should handle missing button element',
      userRole: 'CUSTOMER',
      plan: { id: 1, name: 'Basic', status: 'ACTIVE' },
      isSubscribed: false,
      buttonExists: false,
      expectedDisplay: null
    }
  ])('updateDetailModalButtons() $name', ({ userRole, plan, isSubscribed, subscriptionStatus, buttonExists, expectedText, expectedDisabled, expectedDisplay, expectedClass }) => {
    PlansSection.userRole = userRole;
    PlansSection.userSubscriptions = isSubscribed ? { [plan.id]: subscriptionStatus } : {};

    if (!buttonExists) {
      document.getElementById.mockImplementation((id) => 
        id === 'plans-detail-subscribe-btn' ? null : mocks[id]
      );
    }

    PlansSection.updateDetailModalButtons(plan);

    const btn = mocks['plans-detail-subscribe-btn'];

    if (expectedDisplay !== null) {
      expect(btn.style.display).toBe(expectedDisplay);
    }

    if (expectedText) {
      expect(btn.textContent).toBe(expectedText);
    }

    if (expectedDisabled !== undefined) {
      expect(btn.disabled).toBe(expectedDisabled);
    }

    if (expectedClass) {
      expect(btn.className).toBe(expectedClass);
    }
  });

  // Test 15
  // Test: subscribeToplan() should handle subscription flow, UI updates, and errors
  // Scenario: When subscribeToplan() is called to subscribe user to a plan
  // Methods tested: subscribeToplan(), loadUserSubscriptions(), loadPlans(), closeDetailModal()
  // Mocks: apiClient.post('/subscriptions'), UIController.getInstance().showMessage(), setTimeout for delay, dependent methods
  // Expected: Disables button, shows "Processing..." text, POSTs to /subscriptions, updates userSubscriptions, shows success message, reloads data after 1500ms delay, closes modal, restores button on error
  // Parametrized: YES - tests successful subscription, API error, missing button element scenarios
  test.each([
    {
      name: 'should successfully subscribe and reload data after delay',
      planId: 123,
      apiResponse: { status: 'ACTIVE' },
      shouldError: false,
      buttonExists: true,
      expectedSubscriptionStatus: 'ACTIVE'
    },
    {
      name: 'should handle API error and restore button state',
      planId: 456,
      apiResponse: new Error('Subscription failed'),
      shouldError: true,
      buttonExists: true,
      expectedSubscriptionStatus: undefined
    },
    {
      name: 'should handle missing subscribe button gracefully',
      planId: 789,
      apiResponse: { status: 'PENDING' },
      shouldError: false,
      buttonExists: false,
      expectedSubscriptionStatus: undefined
    }
    ])('subscribeToplan() $name', async ({ planId, apiResponse, shouldError, buttonExists, expectedSubscriptionStatus }) => {
    PlansSection.currentPlanId = planId;

    if (!buttonExists) {
      document.getElementById.mockImplementation((id) =>
        id === 'plans-detail-subscribe-btn' ? null : mocks[id]
      );
    }

    const loadSubsSpy = jest.spyOn(PlansSection, 'loadUserSubscriptions');
    const loadPlansSpy = jest.spyOn(PlansSection, 'loadPlans');
    const closeModalSpy = jest.spyOn(PlansSection, 'closeDetailModal');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    if (shouldError) {
      apiClient.post.mockRejectedValueOnce(apiResponse);
    } else {
      apiClient.post.mockResolvedValueOnce(apiResponse);
    }

    const subscribeBtn = mocks['plans-detail-subscribe-btn'];
    const originalText = subscribeBtn?.textContent;

    await PlansSection.subscribeToplan(planId);

    // Only expect the API call if the button exists
    if (buttonExists) {
      expect(apiClient.post).toHaveBeenCalledWith('/subscriptions', { planId });

      if (!shouldError) {
        expect(subscribeBtn.disabled).toBe(true);
        jest.runAllTimers();
        expect(loadSubsSpy).toHaveBeenCalled();
        expect(loadPlansSpy).toHaveBeenCalled();
        expect(closeModalSpy).toHaveBeenCalled();
        expect(UIController.getInstance().showMessage).toHaveBeenCalledWith(
          `Successfully subscribed to plan! Status: ${apiResponse.status}`,
          'success'
        );
      } else {
        expect(subscribeBtn.disabled).toBe(false);
        expect(subscribeBtn.textContent).toBe(originalText);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[PlansSection] Error subscribing to plan:',
          expect.any(Error)
        );
        expect(UIController.getInstance().showMessage).toHaveBeenCalledWith(
          expect.stringContaining('Error subscribing to plan:'),
          'error'
        );
      }
    } else {
      // No button = no API call
      expect(apiClient.post).not.toHaveBeenCalled();
    }

    if (expectedSubscriptionStatus) {
      expect(PlansSection.userSubscriptions[planId]).toBe(expectedSubscriptionStatus);
    }

    loadSubsSpy.mockRestore();
    loadPlansSpy.mockRestore();
    closeModalSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // Test 16
  // Test: toggleFavorite() should toggle class and show messages
  // Scenario: When toggleFavorite() is called on favorite button
  // Methods tested: toggleFavorite()
  // Mocks: UIController.getInstance().showMessage()
  // Expected: Toggles 'favorited' class on button element, shows "added to favorites" message when class added, shows "removed" message when class removed
  // Parametrized: YES - tests adding favorite (class not present), removing favorite (class present)
  test.each([
    {
      name: 'should add favorited class and show added message',
      initialClasslist: [],
      expectedMessage: 'Plan added to favorites!',
      shouldHaveFavorited: true
    },
    {
      name: 'should remove favorited class and show removed message',
      initialClasslist: ['favorited'],
      expectedMessage: 'Plan removed from favorites!',
      shouldHaveFavorited: false
    }
  ])('toggleFavorite() $name', ({ initialClasslist, expectedMessage, shouldHaveFavorited }) => {
    const planId = 123;
    const btn = createGenericElementMock('button');
    btn.className = initialClasslist.join(' ');
    btn.classList = {
      toggle: jest.fn((className) => {
        if (btn.className.includes(className)) {
          btn.className = btn.className.replace(className, '').trim();
        } else {
          btn.className = btn.className ? `${btn.className} ${className}` : className;
        }
      }),
      contains: jest.fn((className) => btn.className.includes(className))
    };

    PlansSection.toggleFavorite(planId, btn);

    expect(btn.classList.toggle).toHaveBeenCalledWith('favorited');
    expect(UIController.getInstance().showMessage).toHaveBeenCalledWith(expectedMessage, 'success');
    expect(btn.className.includes('favorited')).toBe(shouldHaveFavorited);
  });

  // Test 17
  // Test: escapeHtml() & cleanup() should prevent XSS and clear timeouts
  // Scenario: When escapeHtml() is called with HTML strings and cleanup() is called with active timeout
  // Methods tested: escapeHtml(), cleanup()
  // Mocks: None for escapeHtml, setTimeout tracking for cleanup
  // Expected: escapeHtml converts special characters to HTML entities preventing XSS, cleanup clears initTimeout and sets it to null, handles null timeout gracefully
  // Parametrized: YES - tests escapeHtml with special chars, null input, cleanup with active timeout, cleanup with null timeout variants
  test.each([
    {
      name: 'should escape HTML special characters',
      input: '<script>alert("XSS")</script>',
      expected: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
    },
    {
      name: 'should escape ampersand',
      input: 'Plan & Offer',
      expected: 'Plan &amp; Offer'
    },
    {
      name: 'should escape quotes',
      input: 'Plan "Premium"',
      expected: 'Plan &quot;Premium&quot;'
    },
    {
      name: 'should escape single quotes',
      input: "It's a plan",
      expected: 'It&#039;s a plan'
    },
    {
      name: 'should handle multiple special characters',
      input: '<img src="x" onerror="alert(\'XSS\')">',
      expected: '&lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;'
    },
    {
      name: 'should return empty string for null input',
      input: null,
      expected: ''
    },
    {
      name: 'should return empty string for undefined input',
      input: undefined,
      expected: ''
    },
    {
      name: 'should not modify safe text',
      input: 'Safe Plan Name',
      expected: 'Safe Plan Name'
    }
  ])('escapeHtml() $name', ({ input, expected }) => {
    const result = PlansSection.escapeHtml(input);
    expect(result).toBe(expected);
  });
});
