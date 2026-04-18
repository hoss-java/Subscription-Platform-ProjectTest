// Test file for: webclientv1/src/js/pages/sections/mysubscriptions.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { MysubscriptionsSection } = loadModules('MysubscriptionsSection');

describe('MysubscriptionsSection', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: MysubscriptionsSection
  // Purpose: Manage user subscriptions and billing, including viewing subscription details, 
  //          unpaid bills within subscriptions, and all customer bills with filtering and pagination
  //
  // SETUP OVERVIEW:
  // - jest.spyOn(apiClient, 'get'): Mock API calls
  // - jest.spyOn(apiClient, 'put'): Mock API updates
  // - jest.spyOn(UIController.getInstance(), 'showMessage'): Mock UI notifications
  // - document.body.innerHTML: Mock DOM structure with required elements
  // - MysubscriptionsSection state reset: Clear subscriptions, currentPage, filters between tests
  //
  // SHARED MOCKS:
  // - apiClient.get() - Mock all API endpoints
  // - apiClient.put() - Mock payment claim updates
  // - UIController.getInstance().showMessage() - Mock user feedback
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
  // TEST INVENTORY:
  // 1. parseResponse() [param] should handle different response formats | response.content | array response | response.data | default value
  // 2. populateDropdown() [param] should populate dropdown with options or handle missing element gracefully | element exists | element missing | empty data
  // 3. escapeHtml() [param] should prevent XSS with special characters | <, >, &, quotes
  // 4. formatDate() [param] should format valid dates or return 'N/A' | valid date | null | invalid string
  // 5. resetFilters() [param] should clear correct properties by type | subscriptions type | bills type
  // 6. syncFilterUI() should sync filter inputs with current state values
  // 7. closeModal() [param] should remove active class, hide modal, and nullify property | with display style | without display style
  // 8. buildInvoiceHTML() [param] should include full details only when flag is true | includeFullDetails true | includeFullDetails false
  // 9. renderPagination() [param] should disable Previous/Next buttons at boundaries | first page | middle page | last page | single page
  // 10. switchModalView() [param] should toggle correct view active class | subscription-detail | bill-detail
  // [Add more tests as they are created]
  //

  let component;

  // Mock objects for DOM elements
  const mysubscriptionsServiceTypeFilterMock = {
    id: 'mysubscriptions-service-type-filter',
    _value: '',
    children: [],
    get value() {
      return this._value;
    },
    set value(val) {
      this._value = val;
    },
    appendChild: jest.fn(function(child) {
      this.children.push(child);
    }),
    get innerHTML() {
      return this._innerHTML || '';
    },
    set innerHTML(val) {
      this._innerHTML = val;
      if (val === '') {
        this.children = [];
      } else {
        // Parse placeholder option from innerHTML
        const placeholderMatch = val.match(/<option[^>]*value=""[^>]*>([^<]*)<\/option>/);
        if (placeholderMatch) {
          this.children = [{
            tagName: 'OPTION',
            value: '',
            textContent: placeholderMatch[1]
          }];
        }
      }
    },
    addEventListener: jest.fn(),
    reset() {
      this.children = [];
      this._value = '';
      this._innerHTML = '';
      this.appendChild.mockClear();
      this.addEventListener.mockClear();
    }
  };

  const mysubscriptionsSearchInputMock = {
    id: 'mysubscriptions-search-input',
    _value: '',
    get value() {
      return this._value;
    },
    set value(val) {
      this._value = val;
    },
    addEventListener: jest.fn(),
    reset() {
      this._value = '';
      this.addEventListener.mockClear();
    }
  };

  const mysubscriptionsAllBillsStatusFilterMock = {
    id: 'mysubscriptions-all-bills-status-filter',
    _value: '',
    children: [],
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
      this.children = [];
      this._value = '';
      this.appendChild.mockClear();
      this.addEventListener.mockClear();
    }
  };

  const mysubscriptionsPaginationMock = {
    id: 'mysubscriptions-pagination',
    _innerHTML: '',
    children: [],
    addEventListener: jest.fn(),
    get innerHTML() {
      return this._innerHTML;
    },
    set innerHTML(value) {
      this._innerHTML = value;
      if (value === '') {
        this.children = [];
      }
    },
    appendChild(child) {
      // Ensure buttons have disabled property
      if (child.tagName === 'BUTTON' && !('disabled' in child)) {
        child.disabled = false;
      }
      this.children.push(child);
    },
    reset() {
      this._innerHTML = '';
      this.children = [];
      this.addEventListener.mockClear();
    }
  };

  const mysubscriptionsAllBillsPaginationMock = {
    id: 'mysubscriptions-all-bills-pagination',
    _innerHTML: '',
    children: [],
    addEventListener: jest.fn(),
    get innerHTML() {
      return this._innerHTML;
    },
    set innerHTML(value) {
      this._innerHTML = value;
      if (value === '') {
        this.children = [];
      }
    },
    appendChild(child) {
      this.children.push(child);
    },
    reset() {
      this._innerHTML = '';
      this.children = [];
      this.addEventListener.mockClear();
    }
  };

  const mysubscriptionsDetailModalMock = {
    id: 'mysubscriptions-detail-modal',
    style: { display: '' },
    classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
    reset() {
      this.style.display = '';
      this.classList.add.mockClear();
      this.classList.remove.mockClear();
      this.classList.toggle.mockClear();
    }
  };

  const mysubscriptionsAllBillsDetailModalMock = {
    id: 'mysubscriptions-all-bills-detail-modal',
    style: { display: '' },
    classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
    reset() {
      this.style.display = '';
      this.classList.add.mockClear();
      this.classList.remove.mockClear();
      this.classList.toggle.mockClear();
    }
  };

  const mysubscriptionsBillsListMock = {
    id: 'mysubscriptions-bills-list',
    innerHTML: '',
    appendChild: jest.fn(),
    reset() {
      this.innerHTML = '';
      this.appendChild.mockClear();
    }
  };

  const mysubscriptionsDetailViewMock = {
    id: 'mysubscriptions-detail-view',
    classList: { 
      toggle: jest.fn(),
      add: jest.fn(),
      remove: jest.fn()
    },
    reset() {
      this.classList.toggle.mockClear();
      this.classList.add.mockClear();
      this.classList.remove.mockClear();
    }
  };

  const mysubscriptionsBillDetailViewMock = {
    id: 'mysubscriptions-bill-detail-view',
    classList: { 
      toggle: jest.fn(),
      add: jest.fn(),
      remove: jest.fn()
    },
    reset() {
      this.classList.toggle.mockClear();
      this.classList.add.mockClear();
      this.classList.remove.mockClear();
    }
  };

  beforeEach(() => {
    jest.useFakeTimers();

    document.getElementById = jest.fn((id) => {
      const elements = {
        'mysubscriptions-container': { id: 'mysubscriptions-container', innerHTML: '', appendChild: jest.fn() },
        'mysubscriptions-service-type-filter': mysubscriptionsServiceTypeFilterMock,
        'mysubscriptions-search-input': mysubscriptionsSearchInputMock,
        'mysubscriptions-bills-status-filter': { id: 'mysubscriptions-bills-status-filter', value: '', addEventListener: jest.fn() },
        'mysubscriptions-all-bills-status-filter': mysubscriptionsAllBillsStatusFilterMock,
        'mysubscriptions-refresh-btn': { id: 'mysubscriptions-refresh-btn', addEventListener: jest.fn() },
        'mysubscriptions-all-bills-refresh-btn': { id: 'mysubscriptions-all-bills-refresh-btn', addEventListener: jest.fn() },
        'mysubscriptions-detail-close-btn': { id: 'mysubscriptions-detail-close-btn', addEventListener: jest.fn() },
        'mysubscriptions-detail-close-footer-btn': { id: 'mysubscriptions-detail-close-footer-btn', addEventListener: jest.fn() },
        'mysubscriptions-all-bills-detail-close-btn': { id: 'mysubscriptions-all-bills-detail-close-btn', addEventListener: jest.fn() },
        'mysubscriptions-all-bills-detail-close-footer-btn': { id: 'mysubscriptions-all-bills-detail-close-footer-btn', addEventListener: jest.fn() },
        'mysubscriptions-detail-modal': mysubscriptionsDetailModalMock,
        'mysubscriptions-all-bills-detail-modal': mysubscriptionsAllBillsDetailModalMock,
        'mysubscriptions-detail-content': { id: 'mysubscriptions-detail-content', innerHTML: '' },
        'mysubscriptions-bill-detail-content': { id: 'mysubscriptions-bill-detail-content', innerHTML: '', querySelector: jest.fn() },
        'mysubscriptions-all-bills-detail-content': { id: 'mysubscriptions-all-bills-detail-content', innerHTML: '', querySelector: jest.fn() },
        'mysubscriptions-detail-title': { id: 'mysubscriptions-detail-title', textContent: '' },
        'mysubscriptions-all-bills-detail-title': { id: 'mysubscriptions-all-bills-detail-title', textContent: '' },
        'mysubscriptions-detail-view': mysubscriptionsDetailViewMock,
        'mysubscriptions-bill-detail-view': mysubscriptionsBillDetailViewMock,
        'mysubscriptions-pagination': mysubscriptionsPaginationMock,
        'mysubscriptions-all-bills-pagination': mysubscriptionsAllBillsPaginationMock,
        'mysubscriptions-bills-list': mysubscriptionsBillsListMock,
        'mysubscriptions-all-bills-container': { id: 'mysubscriptions-all-bills-container', innerHTML: '', appendChild: jest.fn() }
      };
      return elements[id] || null;
    });

    document.querySelector = jest.fn((selector) => {
      return null;
    });

    document.createElement = jest.fn((tag) => {
      let html = '';
      let textContent = '';
      const children = [];
      let onclickHandler = null;
      let selectedValue = '';

      const element = {
        tagName: tag.toUpperCase(),
        className: '',
        id: '',
        innerHTML: '',
        textContent: '',
        children: children,
        style: {},
        type: '',
        checked: false,
        disabled: false,
        value: '',
        onclick: null,
        addEventListener: jest.fn(),

        appendChild(child) {
          children.push(child);
          html += child.innerHTML || child.textContent || '';
        },

        get innerHTML() {
          if (this.tagName === 'DIV' && textContent) {
            return textContent
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#x27;');
          }
          return html;
        },

        set innerHTML(value) {
          html = value;
          textContent = value;
          
          if (this.tagName === 'SELECT' && value) {
            this.children = [];
            children.length = 0;
            
            const optionRegex = /<option\s*([^>]*)>\s*([^<]*?)\s*<\/option>/gi;
            let match;
            
            while ((match = optionRegex.exec(value)) !== null) {
              const attrs = match[1].trim();
              const text = match[2].trim();
              
              let optionValue = '';
              const valueMatch = attrs.match(/value\s*=\s*["']?([^"'\s>]+)["']?/i);
              if (valueMatch) {
                optionValue = valueMatch[1];
              }
              
              const isDisabled = /\bdisabled\b/i.test(attrs);
              
              const option = {
                tagName: 'OPTION',
                value: optionValue,
                textContent: text,
                disabled: isDisabled
              };
              children.push(option);
            }
          }
        },

        get textContent() {
          return html || textContent;
        },

        set textContent(value) {
          textContent = value;
          html = value;
        },

        get options() {
          if (this.tagName === 'SELECT') {
            return children.filter(child => child.tagName === 'OPTION');
          }
          return undefined;
        },

        get value() {
          if (this.tagName === 'SELECT') {
            return selectedValue || (children[0]?.value || '');
          }
          return element._value || '';
        },

        set value(val) {
          if (this.tagName === 'SELECT') {
            selectedValue = val;
          } else {
            element._value = val;
          }
        },

        querySelector(selector) {
          if (selector === 'button' && this.innerHTML.includes('<button')) {
            const buttonRegex = /<button[^>]*>([^<]*)<\/button>/i;
            const buttonMatch = this.innerHTML.match(buttonRegex);
            if (buttonMatch) {
              return {
                tagName: 'BUTTON',
                addEventListener: jest.fn(),
                click: jest.fn()
              };
            }
          }
          return null;
        },

        querySelectorAll(selector) {
          return [];
        },

        set onclick(fn) {
          onclickHandler = fn;
        },

        get onclick() {
          return onclickHandler;
        }
      };

      return element;
    });

    global.apiClient = {
      get: jest.fn(),
      put: jest.fn()
    };

    global.UIController = {
      getInstance: jest.fn(() => ({
        showMessage: jest.fn()
      }))
    };

    // Reset MysubscriptionsSection state
    MysubscriptionsSection.currentPage = 0;
    MysubscriptionsSection.pageSize = 12;
    MysubscriptionsSection.totalPages = 0;
    MysubscriptionsSection.subscriptions = [];
    MysubscriptionsSection.plansMap = {};
    MysubscriptionsSection.currentServiceType = '';
    MysubscriptionsSection.currentSearchQuery = '';
    MysubscriptionsSection.currentSubscriptionId = null;
    MysubscriptionsSection.currentBillsStatusFilter = '';
    MysubscriptionsSection.billingStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'];
    MysubscriptionsSection.allBillsCurrentPage = 0;
    MysubscriptionsSection.allBillsPageSize = 12;
    MysubscriptionsSection.allBillsTotalPages = 0;
    MysubscriptionsSection.allBills = [];
    MysubscriptionsSection.allBillsCurrentStatusFilter = '';
    MysubscriptionsSection.allBillsCurrentBillId = null;
  });

  afterEach(() => {
    mysubscriptionsServiceTypeFilterMock.reset();
    mysubscriptionsSearchInputMock.reset();
    mysubscriptionsAllBillsStatusFilterMock.reset();
    mysubscriptionsPaginationMock.reset();
    mysubscriptionsAllBillsPaginationMock.reset();
    mysubscriptionsDetailModalMock.reset();
    mysubscriptionsAllBillsDetailModalMock.reset();
    mysubscriptionsBillsListMock.reset();
    
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });


  // ===== TEST COMMENT GUIDE =====
  // Every test should include comments above it starting with "// Test <number>" followed by:
  // - Test: Brief description of what is being tested
  // - Scenario: The specific use case or condition being tested
  // - Methods tested: Which methods/functions are involved
  // - Mocks: What is mocked and why
  // - Expected: What the test expects to happen
  // Example:
  // // Test 1
  // // Test: init() should call cacheElements, attachEventListeners, loadBillingStatuses, populateStatusDropdown, and loadBills
  // // Scenario: When BillmanagerSection.init() is called, all initialization methods execute after 100ms
  // // Methods tested: init(), cacheElements(), attachEventListeners(), loadBillingStatuses(), populateStatusDropdown(), loadBills()
  // // Mocks: setTimeout - controlled via jest.useFakeTimers(); all methods spied
  // // Expected: All methods called after advancing timers by 100ms

  // ---

  // Test 1
  // Test: parseResponse() should handle different response formats correctly
  // Scenario: When parseResponse() receives various API response formats (response.content, direct array, response.data, or invalid), it should parse and return correct data structure
  // Methods tested: parseResponse()
  // Mocks: None - pure function testing
  // Expected: Returns { data: [...], totalPages: X } for each format variant
  test.each([
    {
      name: 'should handle response.content format',
      input: { content: [{ id: 1 }, { id: 2 }], totalPages: 5 },
      expected: { data: [{ id: 1 }, { id: 2 }], totalPages: 5 }
    },
    {
      name: 'should handle direct array format',
      input: [{ id: 1 }, { id: 2 }],
      expected: { data: [{ id: 1 }, { id: 2 }], totalPages: 1 }
    },
    {
      name: 'should handle response.data format',
      input: { data: [{ id: 1 }, { id: 2 }] },
      expected: { data: [{ id: 1 }, { id: 2 }], totalPages: 1 }
    },
    {
      name: 'should handle invalid response with default value',
      input: { invalid: 'format' },
      expected: { data: [], totalPages: 1 }
    },
    {
      name: 'should handle empty content array',
      input: { content: [], totalPages: 0 },
      expected: { data: [], totalPages: 1 }
    },
    {
      name: 'should handle response.content without totalPages',
      input: { content: [{ id: 1 }] },
      expected: { data: [{ id: 1 }], totalPages: 0 }
    }
  ])('parseResponse() $name', ({ input, expected }) => {
    const result = MysubscriptionsSection.parseResponse(input);
    expect(result).toEqual(expected);
  });

  // Test 2
  // Test: populateDropdown() should populate dropdown with options or handle missing element gracefully
  // Scenario: When populateDropdown() is called with valid element and data, it creates options; when element missing, it returns silently
  // Methods tested: populateDropdown()
  // Mocks: document.getElementById() - returns element or null based on test case
  // Expected: Options created in dropdown or function returns without error
  test.each([
    {
      name: 'should populate dropdown with options',
      elementId: 'mysubscriptions-service-type-filter',
      dataArray: ['Mobile', 'Internet', 'TV'],
      placeholderText: 'All Types',
      shouldExist: true,
      expectedOptionsCount: 4
    },
    {
      name: 'should populate dropdown with single item',
      elementId: 'mysubscriptions-service-type-filter',
      dataArray: ['Mobile'],
      placeholderText: 'Select Type',
      shouldExist: true,
      expectedOptionsCount: 2
    },
    {
      name: 'should handle empty data array',
      elementId: 'mysubscriptions-service-type-filter',
      dataArray: [],
      placeholderText: 'No Options',
      shouldExist: true,
      expectedOptionsCount: 1
    },
    {
      name: 'should return silently when element does not exist',
      elementId: 'non-existent-element',
      dataArray: ['Mobile', 'Internet'],
      placeholderText: 'All Types',
      shouldExist: false,
      expectedOptionsCount: 0
    }
  ])('populateDropdown() $name', ({ elementId, dataArray, placeholderText, shouldExist, expectedOptionsCount }) => {
    if (!shouldExist) {
      jest.spyOn(document, 'getElementById').mockReturnValueOnce(null);
      expect(() => MysubscriptionsSection.populateDropdown(elementId, dataArray, placeholderText)).not.toThrow();
    } else {
      MysubscriptionsSection.populateDropdown(elementId, dataArray, placeholderText);
      const element = document.getElementById(elementId);
      expect(element.children.length).toBe(expectedOptionsCount);
    }
  });

  // Test 3
  // Test: escapeHtml() should prevent XSS with special characters
  // Scenario: When escapeHtml() receives strings with <, >, &, quotes, it escapes them to safe HTML entities
  // Methods tested: escapeHtml()
  // Mocks: None - pure function testing
  // Expected: Returns escaped HTML-safe strings for each special character variant
  test.each([
    {
      name: 'should escape less than symbol',
      input: '<script>alert("xss")</script>',
      expected: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    },
    {
      name: 'should escape ampersand',
      input: 'AT&T',
      expected: 'AT&amp;T'
    },
    {
      name: 'should escape double quotes',
      input: 'He said "hello"',
      expected: 'He said &quot;hello&quot;'
    },
    {
      name: 'should escape single quotes',
      input: "It's working",
      expected: 'It&#x27;s working'
    },
    {
      name: 'should escape greater than symbol',
      input: '10 > 5',
      expected: '10 &gt; 5'
    },
    {
      name: 'should escape multiple special characters',
      input: '<div class="test" & "data">',
      expected: '&lt;div class=&quot;test&quot; &amp; &quot;data&quot;&gt;'
    },
    {
      name: 'should return plain text unchanged',
      input: 'Hello World',
      expected: 'Hello World'
    }
  ])('escapeHtml() $name', ({ input, expected }) => {
    const result = MysubscriptionsSection.escapeHtml(input);
    expect(result).toBe(expected);
  });

  // Test 4
  // Test: formatDate() should format valid dates or return 'N/A' for null/invalid input
  // Scenario: When formatDate() receives valid date string, null, or invalid string, it returns formatted date or 'N/A'
  // Methods tested: formatDate()
  // Mocks: None - pure function testing
  // Expected: Valid dates formatted, null/invalid return 'N/A'
  test.each([
    {
      name: 'should format valid date string',
      input: '2026-04-18',
      expected: new Date('2026-04-18').toLocaleDateString()
    },
    {
      name: 'should format valid ISO date',
      input: '2026-04-18T10:30:00Z',
      expected: new Date('2026-04-18T10:30:00Z').toLocaleDateString()
    },
    {
      name: 'should return N/A for null input',
      input: null,
      expected: 'N/A'
    },
    {
      name: 'should return N/A for undefined input',
      input: undefined,
      expected: 'N/A'
    },
    {
      name: 'should return N/A for empty string',
      input: '',
      expected: 'N/A'
    },
    {
      name: 'should return "Invalid Date" for invalid date string',
      input: 'invalid-date',
      expected: 'Invalid Date'
    }
  ])('formatDate() $name', ({ input, expected }) => {
    const result = MysubscriptionsSection.formatDate(input);
    expect(result).toBe(expected);
  });

  // Test 5
  // Test: resetFilters() should clear correct properties and UI by type
  // Scenario: When resetFilters('subscriptions') is called, subscription filters clear; when resetFilters('bills') is called, bill filters clear
  // Methods tested: resetFilters(), loadSubscriptions(), loadAllBills()
  // Mocks: document.getElementById() - returns input elements; loadSubscriptions, loadAllBills - spied
  // Expected: Correct properties reset and corresponding load methods called for each filter type
  test.each([
    {
      name: 'should reset subscription filters and call loadSubscriptions',
      type: 'subscriptions',
      expectedProperties: {
        currentPage: 0,
        currentServiceType: '',
        currentSearchQuery: ''
      },
      expectedElementIds: ['mysubscriptions-service-type-filter', 'mysubscriptions-search-input'],
      expectedMethodCalled: 'loadSubscriptions'
    },
    {
      name: 'should reset bill filters and call loadAllBills',
      type: 'bills',
      expectedProperties: {
        allBillsCurrentPage: 0,
        allBillsCurrentStatusFilter: ''
      },
      expectedElementIds: ['mysubscriptions-all-bills-status-filter'],
      expectedMethodCalled: 'loadAllBills'
    }
  ])('resetFilters() $name', ({ type, expectedProperties, expectedElementIds, expectedMethodCalled }) => {
    jest.spyOn(MysubscriptionsSection, 'loadSubscriptions').mockResolvedValue();
    jest.spyOn(MysubscriptionsSection, 'loadAllBills').mockResolvedValue();

    MysubscriptionsSection.resetFilters(type);

    Object.entries(expectedProperties).forEach(([key, value]) => {
      expect(MysubscriptionsSection[key]).toBe(value);
    });

    expectedElementIds.forEach(id => {
      const element = document.getElementById(id);
      expect(element.value).toBe('');
    });

    expect(MysubscriptionsSection[expectedMethodCalled]).toHaveBeenCalled();
  });

  // Test 6
  // Test: syncFilterUI() should sync filter inputs with current state values
  // Scenario: When syncFilterUI() is called with currentServiceType and currentSearchQuery set, input elements reflect current state
  // Methods tested: syncFilterUI()
  // Mocks: document.getElementById() - returns input elements
  // Expected: Input values match currentServiceType and currentSearchQuery
  test.each([
    {
      name: 'should sync service type filter with current state',
      currentServiceType: 'Mobile',
      currentSearchQuery: '',
      expectedServiceTypeValue: 'Mobile',
      expectedSearchInputValue: ''
    },
    {
      name: 'should sync search input with current state',
      currentServiceType: '',
      currentSearchQuery: 'test plan',
      expectedServiceTypeValue: '',
      expectedSearchInputValue: 'test plan'
    },
    {
      name: 'should sync both filters with current state',
      currentServiceType: 'Internet',
      currentSearchQuery: 'fiber',
      expectedServiceTypeValue: 'Internet',
      expectedSearchInputValue: 'fiber'
    },
    {
      name: 'should sync with empty current state',
      currentServiceType: '',
      currentSearchQuery: '',
      expectedServiceTypeValue: '',
      expectedSearchInputValue: ''
    }
  ])('syncFilterUI() $name', ({ currentServiceType, currentSearchQuery, expectedServiceTypeValue, expectedSearchInputValue }) => {
    MysubscriptionsSection.currentServiceType = currentServiceType;
    MysubscriptionsSection.currentSearchQuery = currentSearchQuery;
    
    MysubscriptionsSection.syncFilterUI();
    
    const serviceTypeFilter = document.getElementById('mysubscriptions-service-type-filter');
    const searchInput = document.getElementById('mysubscriptions-search-input');
    
    expect(serviceTypeFilter.value).toBe(expectedServiceTypeValue);
    expect(searchInput.value).toBe(expectedSearchInputValue);
  });

  // Test 7
  // Test: closeModal() should remove active class, hide modal, and nullify property
  // Scenario: When closeModal() is called with modalId and dataPropertyToNull, modal is deactivated and property is reset
  // Methods tested: closeModal()
  // Mocks: document.getElementById() - returns modal element; modal.style - controlled via mock
  // Expected: Modal loses active class, display set to 'none', specified property set to null
  test.each([
    {
      name: 'should close modal and nullify currentSubscriptionId',
      modalId: 'mysubscriptions-detail-modal',
      dataProperty: 'currentSubscriptionId',
      initialValue: 'sub-123',
      expectedDisplay: 'none'
    },
    {
      name: 'should close modal and nullify allBillsCurrentBillId',
      modalId: 'mysubscriptions-all-bills-detail-modal',
      dataProperty: 'allBillsCurrentBillId',
      initialValue: 'bill-456',
      expectedDisplay: 'none'
    },
    {
      name: 'should close modal without dataProperty',
      modalId: 'mysubscriptions-detail-modal',
      dataProperty: null,
      initialValue: 'sub-789',
      expectedDisplay: 'none'
    }
  ])('closeModal() $name', ({ modalId, dataProperty, initialValue, expectedDisplay }) => {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    modal.style.display = 'flex';
    MysubscriptionsSection[dataProperty] = initialValue;

    MysubscriptionsSection.closeModal(modalId, dataProperty);

    expect(modal.classList.remove).toHaveBeenCalledWith('active');
    expect(modal.style.display).toBe(expectedDisplay);
    if (dataProperty) {
      expect(MysubscriptionsSection[dataProperty]).toBeNull();
    }
  });

  // Test 8
  // Test: buildInvoiceHTML() should include full details only when flag is true
  // Scenario: When buildInvoiceHTML() is called with includeFullDetails true, invoice includes addresses and plan info; when false, excludes them
  // Methods tested: buildInvoiceHTML()
  // Mocks: None - pure function testing with bill object input
  // Expected: HTML string contains/excludes operator addresses and plan information based on flag
  test.each([
    {
      name: 'should include full details when flag is true',
      includeFullDetails: true,
      shouldContain: ['invoice-addresses', 'FROM (Service Provider)', 'BILL TO (Customer)', 'invoice-meta', 'Plan Information'],
      shouldNotContain: ['back-to-bills-btn']
    },
    {
      name: 'should exclude full details when flag is false',
      includeFullDetails: false,
      shouldContain: ['INVOICE', 'back-to-bills-btn'],
      shouldNotContain: ['invoice-addresses', 'invoice-meta']
    },
    {
      name: 'should format amount correctly in full details',
      includeFullDetails: true,
      shouldContain: ['$100.50'],
      shouldNotContain: []
    },
    {
      name: 'should include claim button for PENDING status',
      includeFullDetails: false,
      shouldContain: ['claim-paid-btn', 'Mark as Paid'],
      shouldNotContain: []
    }
  ])('buildInvoiceHTML() $name', ({ includeFullDetails, shouldContain, shouldNotContain }) => {
    const bill = {
      id: 'INV-001',
      amount: 100.50,
      status: 'PENDING',
      billingDate: '2026-04-01',
      dueDate: '2026-04-30',
      paidDate: null,
      operator: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      customer: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      plan: { name: 'Basic Plan', description: 'Basic service', serviceType: 'Mobile', billingPeriod: 'Monthly', basePrice: 100.50 },
      subscription: { id: 'SUB-001', status: 'ACTIVE', autoRenewal: true }
    };

    const html = MysubscriptionsSection.buildInvoiceHTML(bill, includeFullDetails);

    shouldContain.forEach(text => {
      expect(html).toContain(text);
    });

    shouldNotContain.forEach(text => {
      expect(html).not.toContain(text);
    });
  });

  // Test 9
  // Test: renderPagination() should disable Previous/Next buttons at boundaries
  // Scenario: When renderPagination() is called with first page (0), middle page, or last page, Previous/Next buttons are disabled appropriately
  // Methods tested: renderPagination()
  // Mocks: document.getElementById() - returns pagination container; button.addEventListener() - spied
  // Expected: Previous disabled at page 0, Next disabled at last page, both enabled in middle
  test.each([
    {
      name: 'should disable Previous button on first page',
      currentPage: 0,
      totalPages: 5,
      expectedPreviousDisabled: true,
      expectedNextDisabled: false,
      expectEmpty: false
    },
    {
      name: 'should disable Next button on last page',
      currentPage: 4,
      totalPages: 5,
      expectedPreviousDisabled: false,
      expectedNextDisabled: true,
      expectEmpty: false
    },
    {
      name: 'should enable both buttons on middle page',
      currentPage: 2,
      totalPages: 5,
      expectedPreviousDisabled: false,
      expectedNextDisabled: false,
      expectEmpty: false
    },
    {
      name: 'should disable both buttons when only one page',
      currentPage: 0,
      totalPages: 1,
      expectedPreviousDisabled: true,
      expectedNextDisabled: true,
      expectEmpty: true
    },
    {
      name: 'should disable Next button on second to last page',
      currentPage: 3,
      totalPages: 4,
      expectedPreviousDisabled: false,
      expectedNextDisabled: true,
      expectEmpty: false
    }
  ])('renderPagination() $name', ({ currentPage, totalPages, expectedPreviousDisabled, expectedNextDisabled, expectEmpty }) => {
    const callback = jest.fn();
    MysubscriptionsSection.renderPagination('mysubscriptions-pagination', currentPage, totalPages, callback);

    const container = document.getElementById('mysubscriptions-pagination');
    
    if (expectEmpty) {
      expect(container.innerHTML).toBe('');
      return;
    }

    const buttons = container.children.filter(child => child.tagName === 'BUTTON');
    expect(buttons[0].disabled).toBe(expectedPreviousDisabled);
    expect(buttons[1].disabled).toBe(expectedNextDisabled);
  });

  // Test 10
  // Test: switchModalView() should toggle correct view active class
  // Scenario: When switchModalView('subscription-detail') or switchModalView('bill-detail') is called, correct view gets active class and other loses it
  // Methods tested: switchModalView()
  // Mocks: document.getElementById() - returns view elements; classList.toggle() - spied
  // Expected: Correct view has active class, other view does not have active class
  test.each([
    {
      name: 'should activate subscription-detail view',
      viewName: 'subscription-detail',
      expectedActiveView: 'mysubscriptions-detail-view',
      expectedInactiveView: 'mysubscriptions-bill-detail-view'
    },
    {
      name: 'should activate bill-detail view',
      viewName: 'bill-detail',
      expectedActiveView: 'mysubscriptions-bill-detail-view',
      expectedInactiveView: 'mysubscriptions-detail-view'
    }
  ])('switchModalView() $name', ({ viewName, expectedActiveView, expectedInactiveView }) => {
    const activeView = document.getElementById(expectedActiveView);
    const inactiveView = document.getElementById(expectedInactiveView);

    MysubscriptionsSection.switchModalView(viewName);

    expect(activeView.classList.toggle).toHaveBeenCalledWith('active', true);
    expect(inactiveView.classList.toggle).toHaveBeenCalledWith('active', false);
  });

});
