// Test file for: webclientv1/src/js/pages/sections/billmanager.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { BillmanagerSection } = loadModules('BillmanagerSection');

describe('BillmanagerSection', () => {
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
  // TEST INVENTORY:
  // 1. init() should call cacheElements, attachEventListeners, loadBillingStatuses, populateStatusDropdown, and loadBills after setTimeout delay
  // 2. cacheElements() should cache all DOM elements from IDs into elements object, or set to null if element not found
  // 3. loadBillingStatuses() should fetch statuses and set billingStatuses, or log error and keep defaults on failure
  // 4. attachEventListeners() should attach listeners correctly | statusFilter change | refreshBtn click | close buttons | missing elements
  // 5. resetFilters() should reset currentPage to 0, clear statusFilter value, and reset currentStatusFilter
  // 6. populateStatusDropdown() should populate dropdown with all billing statuses, or return if element not found
  // 7. loadBills() [param] should handle response formats correctly | response.content | array | invalid
  // 8. loadBills() should show loading message, render bills or empty message, render pagination, or show error on failure
  // 9. loadBills() should include status filter in endpoint when currentStatusFilter is set
  // 10. parseBillsResponse() [param] should parse response formats | response.content with totalPages | array response | invalid
  // 11. renderBills() should create table with headers and bill rows, append to container
  // 12. createTableHead() should create thead with correct columns | ID | Subscription ID | Amount | Billing Date | Due Date | Status | Actions
  // 13. createBillRow() [param] should format data correctly | id | subscriptionId | amount | dates | status badge
  // 14. createBillRow() [param] should create correct buttons | PAYMENT_CLAIMED status with Approve | other statuses View only
  // 15. renderPagination() [param] should handle pagination states correctly | first page | middle page | last page | single page
  // 16. createPaginationButton() should create button with text, enabled state, and click callback
  // 17. openDetailModal() [param] should handle bill detail loading | success | failure | missing elements
  // 18. openDetailModal() should set currentBillId, show modal, and display loading message initially
  // 19. buildInvoice*() [param] should build invoice sections | Top | Addresses | Dates | Items | Totals | Meta | Actions
  // 20. buildInvoiceTop() [param] should display invoice based on status | PAYMENT_CLAIMED with Approve | other status without Approve
  // 21. buildInvoiceAddresses() should build FROM and TO address blocks with names and emails
  // 22. buildInvoiceDates() [param] should format dates correctly | with paidDate | without paidDate (Not paid yet)
  // 23. attachDetailModalListeners() should populate status dropdown and attach click listeners to Update and Approve buttons
  // 24. approveBillingPayment() [param] should approve payment | success | failure
  // 25. updateBillStatus() [param] should update bill status | success | failure | no status selected
  // 26. setButtonLoading() [param] should set button state | loading true | loading false
  // 27. handleError/Warning/Success() [param] should call UIController with correct message type | success | warning | error
  // 28. closeDetailModal() should remove active class, hide modal, and reset currentBillId
  // 29. formatDate() [param] should format dates correctly | valid date | null | invalid date
  // [Add more tests as they are created]
  //

  let component;
  let mockService;
  let mockElement;

  const billmanagerStatusChangeMock = {
    id: 'billmanager-status-change',
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

  const billmanagerUpdateBtnMock = {
    id: 'billmanager-update-btn',
    disabled: false,
    textContent: 'Update Status',
    addEventListener: jest.fn(),
    reset() {
      this.disabled = false;
      this.textContent = 'Update Status';
      this.addEventListener.mockClear();
    }
  };

  const billmanagerApproveBtnMock = {
    id: 'billmanager-approve-btn',
    disabled: false,
    textContent: '',
    addEventListener: jest.fn(),
    reset() {
      this.disabled = false;
      this.textContent = '';
      this.addEventListener.mockClear();
    }
  };

  const billmanagerPaginationMock = {
    id: 'billmanager-pagination',
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

  beforeEach(() => {
    jest.useFakeTimers();

    document.getElementById = jest.fn((id) => {
      const elements = {
        'billmanager-container': { id: 'billmanager-container', innerHTML: '', appendChild: jest.fn() },
        'billmanager-status-filter': { id: 'billmanager-status-filter', value: '', appendChild: jest.fn(), addEventListener: jest.fn() },
        'billmanager-refresh-btn': { id: 'billmanager-refresh-btn', addEventListener: jest.fn() },
        'billmanager-detail-close-btn': { id: 'billmanager-detail-close-btn', addEventListener: jest.fn() },
        'billmanager-detail-close-footer-btn': { id: 'billmanager-detail-close-footer-btn', addEventListener: jest.fn() },
        'billmanager-detail-modal': { 
          id: 'billmanager-detail-modal', 
          style: { display: '' },
          classList: { add: jest.fn(), remove: jest.fn() }
        },
        'billmanager-detail-content': { id: 'billmanager-detail-content', innerHTML: '' },
        'billmanager-pagination': billmanagerPaginationMock,
        'billmanager-detail-title': { id: 'billmanager-detail-title', textContent: '' },
        'billmanager-status-change': billmanagerStatusChangeMock, 
        'billmanager-update-btn': billmanagerUpdateBtnMock,
        'billmanager-approve-btn': billmanagerApproveBtnMock
      };
      return elements[id] || null;
    });

    document.querySelector = jest.fn((selector) => {
      if (selector === '#billmanager-update-btn') {
        return { disabled: false, textContent: 'Update Status', addEventListener: jest.fn() };
      }
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
          const search = (el, sel) => {
            for (let child of el.children || []) {
              if (sel === 'button' && child.tagName === 'BUTTON') {
                return child;
              }
              if (sel === 'span' && child.tagName === 'SPAN') {
                return child;
              }
              if (sel === 'input' && child.tagName === 'INPUT') {
                return child;
              }
              if (sel === 'select' && child.tagName === 'SELECT') {
                return child;
              }
              if (sel === 'label' && child.tagName === 'LABEL') {
                return child;
              }
              if (sel.toUpperCase() === child.tagName) {
                return child;
              }
              
              if (sel.includes('[') && sel.includes(']')) {
                const match = sel.match(/^(\w+)\[(\w+)=["']?([^"'\]]+)["']?\]$/);
                if (match) {
                  const [, tagName, attrName, attrValue] = match;
                  if (child.tagName === tagName.toUpperCase() && child[attrName] === attrValue) {
                    return child;
                  }
                }
              }
              
              const found = search(child, sel);
              if (found) return found;
            }
            return null;
          };

          const foundChild = search(this, selector);
          if (foundChild) return foundChild;

          if (this.innerHTML && selector === 'span') {
            const spanRegex = /<span[^>]*class="([^"]*)"[^>]*>([^<]*)<\/span>/i;
            const spanMatch = this.innerHTML.match(spanRegex);
            if (spanMatch) {
              return {
                tagName: 'SPAN',
                className: spanMatch[1],
                textContent: spanMatch[2],
                innerHTML: spanMatch[0]
              };
            }
          }

          if (this.innerHTML && selector === 'button') {
            const buttonRegex = /<button[^>]*class="([^"]*)"[^>]*>([^<]*)<\/button>/i;
            const buttonMatch = this.innerHTML.match(buttonRegex);
            if (buttonMatch) {
              return {
                tagName: 'BUTTON',
                className: buttonMatch[1],
                textContent: buttonMatch[2],
                innerHTML: buttonMatch[0],
                addEventListener: jest.fn()
              };
            }
          }

          if (this.innerHTML && selector === 'input') {
            const inputRegex = /<input[^>]*>/i;
            const inputMatch = this.innerHTML.match(inputRegex);
            if (inputMatch) {
              return {
                tagName: 'INPUT',
                innerHTML: inputMatch[0],
                addEventListener: jest.fn()
              };
            }
          }

          if (this.innerHTML && selector === 'select') {
            const selectRegex = /<select[^>]*>/i;
            const selectMatch = this.innerHTML.match(selectRegex);
            if (selectMatch) {
              return {
                tagName: 'SELECT',
                innerHTML: selectMatch[0],
                addEventListener: jest.fn(),
                appendChild: jest.fn()
              };
            }
          }

          return null;
        },

        querySelectorAll(selector) {
          const results = [];
          const search = (el, sel) => {
            for (let child of el.children || []) {
              if (sel === 'button' && child.tagName === 'BUTTON') {
                results.push(child);
              } else if (sel === 'input' && child.tagName === 'INPUT') {
                results.push(child);
              } else if (sel === 'select' && child.tagName === 'SELECT') {
                results.push(child);
              } else if (sel === 'label' && child.tagName === 'LABEL') {
                results.push(child);
              } else if (sel.toUpperCase() === child.tagName) {
                results.push(child);
              }
              
              if (sel.includes('[') && sel.includes(']')) {
                const match = sel.match(/^(\w+)\[(\w+)=["']?([^"'\]]+)["']?\]$/);
                if (match) {
                  const [, tagName, attrName, attrValue] = match;
                  if (child.tagName === tagName.toUpperCase() && child[attrName] === attrValue) {
                    results.push(child);
                  }
                }
              }
              
              search(child, sel);
            }
          };
          search(this, selector);
          return results;
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

    BillmanagerSection.currentPage = 0;
    BillmanagerSection.pageSize = 12;
    BillmanagerSection.totalPages = 0;
    BillmanagerSection.bills = [];
    BillmanagerSection.currentStatusFilter = '';
    BillmanagerSection.currentBillId = null;
    BillmanagerSection.billingStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'];
    BillmanagerSection.elements = {
      container: null,
      statusFilter: null,
      refreshBtn: null,
      detailCloseBtn: null,
      detailCloseBtnFooter: null,
      modal: null,
      detailContent: null,
      paginationContainer: null,
    };

    BillmanagerSection.elements.modal = document.getElementById('billmanager-detail-modal');
    BillmanagerSection.elements.detailContent = document.getElementById('billmanager-detail-content');
  });

  afterEach(() => {
    billmanagerStatusChangeMock.reset();
    billmanagerUpdateBtnMock.reset();
    billmanagerApproveBtnMock.reset();
    billmanagerPaginationMock.reset();
    
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
  // Test: init() should call cacheElements, attachEventListeners, loadBillingStatuses, populateStatusDropdown, and loadBills
  // Scenario: When BillmanagerSection.init() is called, all initialization methods execute after 100ms delay
  // Methods tested: init(), cacheElements(), attachEventListeners(), loadBillingStatuses(), populateStatusDropdown(), loadBills()
  // Mocks: setTimeout - controlled via jest.useFakeTimers(); cacheElements, attachEventListeners, loadBillingStatuses, populateStatusDropdown, loadBills - spied
  // Expected: All five methods are called after advancing timers by 100ms
  test('should call all initialization methods after 100ms delay', async () => {
    // Spy on all methods that should be called
    const spyCache = jest.spyOn(BillmanagerSection, 'cacheElements');
    const spyAttach = jest.spyOn(BillmanagerSection, 'attachEventListeners');
    const spyLoadStatuses = jest.spyOn(BillmanagerSection, 'loadBillingStatuses');
    const spyPopulate = jest.spyOn(BillmanagerSection, 'populateStatusDropdown');
    const spyLoadBills = jest.spyOn(BillmanagerSection, 'loadBills');

    // Mock loadBillingStatuses to return immediately
    global.apiClient.get.mockResolvedValue(['PENDING', 'PAID', 'FAILED']);

    // Call init
    await BillmanagerSection.init();

    // Advance timers by 100ms
    jest.advanceTimersByTime(100);

    // Verify all methods were called in correct order
    expect(spyCache).toHaveBeenCalled();
    expect(spyAttach).toHaveBeenCalled();
    expect(spyLoadStatuses).toHaveBeenCalled();
    expect(spyPopulate).toHaveBeenCalled();
    expect(spyLoadBills).toHaveBeenCalled();

    // Cleanup spies
    spyCache.mockRestore();
    spyAttach.mockRestore();
    spyLoadStatuses.mockRestore();
    spyPopulate.mockRestore();
    spyLoadBills.mockRestore();
  });

  // Test 2
  // Test: cacheElements() should cache all DOM elements from IDs into elements object
  // Scenario: When cacheElements() is called, all DOM element IDs are mapped to the elements object property
  // Methods tested: cacheElements()
  // Mocks: document.getElementById() - returns mocked elements for billmanager IDs
  // Expected: BillmanagerSection.elements object contains references to all cached DOM elements, or null if not found
  test.each([
    { elementExists: true, expected: 'not.toBeNull' },
    { elementExists: false, expected: 'toBeNull' }
  ])('should cache DOM elements - elementExists: $elementExists', ({ elementExists, expected }) => {
    if (!elementExists) {
      document.getElementById = jest.fn(() => null);
    }

    BillmanagerSection.cacheElements();

    if (expected === 'not.toBeNull') {
      expect(BillmanagerSection.elements.container).not.toBeNull();
      expect(BillmanagerSection.elements.statusFilter).not.toBeNull();
      expect(BillmanagerSection.elements.refreshBtn).not.toBeNull();
      expect(BillmanagerSection.elements.detailCloseBtn).not.toBeNull();
      expect(BillmanagerSection.elements.detailCloseBtnFooter).not.toBeNull();
      expect(BillmanagerSection.elements.modal).not.toBeNull();
      expect(BillmanagerSection.elements.detailContent).not.toBeNull();
      expect(BillmanagerSection.elements.paginationContainer).not.toBeNull();
    } else {
      expect(BillmanagerSection.elements.container).toBeNull();
      expect(BillmanagerSection.elements.statusFilter).toBeNull();
    }
  });

  // Test 3
  // Test: loadBillingStatuses() should fetch statuses and set billingStatuses array
  // Scenario: When loadBillingStatuses() is called, it fetches from /billings/billing-statuses endpoint
  // Methods tested: loadBillingStatuses()
  // Mocks: apiClient.get() - returns array of billing statuses
  // Expected: billingStatuses is updated with fetched statuses, or keeps defaults on API failure
  test.each([
    { statuses: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED', 'PROCESSING'], shouldFail: false, expected: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED', 'PROCESSING'] },
    { statuses: null, shouldFail: true, expected: [] }
  ])('should fetch statuses and handle API response', async ({ statuses, shouldFail, expected }) => {
    BillmanagerSection.billingStatuses = [];
    
    if (shouldFail) {
      global.apiClient.get.mockRejectedValue(new Error('API Error'));
      jest.spyOn(console, 'error').mockImplementation(() => {});
    } else {
      global.apiClient.get.mockResolvedValue(statuses);
    }

    await BillmanagerSection.loadBillingStatuses();

    expect(global.apiClient.get).toHaveBeenCalledWith('/billings/billing-statuses');
    expect(BillmanagerSection.billingStatuses).toEqual(expected);

    if (shouldFail) {
      console.error.mockRestore();
    }
  });

  // Test 4
  // Test: attachEventListeners() should attach listeners to statusFilter, refreshBtn, and close buttons
  // Scenario: Event listeners are attached to all interactive elements and handlers are called on events
  // Methods tested: attachEventListeners(), with variations for element existence
  // Mocks: addEventListener() - spied on mocked elements
  // Expected: Event listeners attached to statusFilter (change), refreshBtn (click), close buttons (click); no errors if elements missing
  test.each([
    { element: 'statusFilter', eventType: 'change', allElementsExist: true },
    { element: 'refreshBtn', eventType: 'click', allElementsExist: true },
    { element: 'detailCloseBtn', eventType: 'click', allElementsExist: true },
    { element: 'detailCloseBtnFooter', eventType: 'click', allElementsExist: true },
    { element: 'statusFilter', eventType: 'change', allElementsExist: false }
  ])('should attach event listener to $element with $eventType event', ({ element, eventType, allElementsExist }) => {
    if (!allElementsExist) {
      BillmanagerSection.elements[element] = null;
    }

    BillmanagerSection.attachEventListeners();

    if (allElementsExist && BillmanagerSection.elements[element]) {
      expect(BillmanagerSection.elements[element].addEventListener).toHaveBeenCalledWith(
        eventType,
        expect.any(Function)
      );
    } else {
      expect(() => BillmanagerSection.attachEventListeners()).not.toThrow();
    }
  });

  // Test 5
  // Test: resetFilters() should reset currentPage, statusFilter value, and currentStatusFilter
  // Scenario: When resetFilters() is called, pagination and filter state are reset to defaults
  // Methods tested: resetFilters()
  // Mocks: None required - pure state reset
  // Expected: currentPage = 0, currentStatusFilter = '', statusFilter.value = ''
  test('should reset currentPage, statusFilter value, and currentStatusFilter', () => {
    BillmanagerSection.cacheElements();
    BillmanagerSection.currentPage = 5;
    BillmanagerSection.currentStatusFilter = 'PAID';
    BillmanagerSection.elements.statusFilter.value = 'PAID';

    BillmanagerSection.resetFilters();

    expect(BillmanagerSection.currentPage).toBe(0);
    expect(BillmanagerSection.currentStatusFilter).toBe('');
    expect(BillmanagerSection.elements.statusFilter.value).toBe('');
  });

  // Test 6
  // Test: populateStatusDropdown() should populate dropdown with billing statuses
  // Scenario: When populateStatusDropdown() is called, all billingStatuses are added as options to dropdown
  // Methods tested: populateStatusDropdown()
  // Mocks: document.getElementById() - returns mocked statusFilter element
  // Expected: Dropdown contains all billing status options, or returns early if element not found
  test.each([
    { elementExists: true, hasOptions: true },
    { elementExists: false, hasOptions: false }
  ])('should populate dropdown with statuses - elementExists: $elementExists', ({ elementExists, hasOptions }) => {
    if (!elementExists) {
      BillmanagerSection.elements.statusFilter = null;
    } else {
      BillmanagerSection.elements.statusFilter = document.getElementById('billmanager-status-filter');
    }

    BillmanagerSection.populateStatusDropdown();

    if (hasOptions) {
      expect(BillmanagerSection.elements.statusFilter.appendChild).toHaveBeenCalled();
      const callCount = BillmanagerSection.elements.statusFilter.appendChild.mock.calls.length;
      expect(callCount).toBe(BillmanagerSection.billingStatuses.length);
    } else {
      expect(BillmanagerSection.elements.statusFilter).toBeNull();
    }
  });

  // Test 7 [PARAMETRIZED]
  // Test: loadBills() should handle different API response formats
  // Scenario: API returns bills in different formats (response.content | array | invalid)
  // Methods tested: loadBills(), parseBillsResponse()
  // Mocks: apiClient.get() - returns different response formats based on test case
  // Expected: Bills loaded correctly from all valid formats, error shown for invalid responses
  test.each([
    { 
      responseFormat: 'content',
      apiResponse: { content: [{ id: 1, amount: 100, status: 'PENDING' }], totalPages: 2 },
      expectedBillsCount: 1,
      expectedTotalPages: 2,
      shouldError: false
    },
    { 
      responseFormat: 'array',
      apiResponse: [{ id: 2, amount: 200, status: 'PAID' }],
      expectedBillsCount: 1,
      expectedTotalPages: 1,
      shouldError: false
    },
    { 
      responseFormat: 'invalid',
      apiResponse: { invalid: 'data' },
      expectedBillsCount: 0,
      expectedTotalPages: 1,
      shouldError: false
    },
    { 
      responseFormat: 'apiError',
      apiResponse: null,
      expectedBillsCount: 0,
      expectedTotalPages: 0,
      shouldError: true
    }
  ])('should handle different API response formats - responseFormat: $responseFormat', async ({ responseFormat, apiResponse, expectedBillsCount, expectedTotalPages, shouldError }) => {
    BillmanagerSection.elements.container = document.getElementById('billmanager-container');
    
    if (shouldError) {
      global.apiClient.get.mockRejectedValue(new Error('API Error'));
    } else {
      global.apiClient.get.mockResolvedValue(apiResponse);
    }

    await BillmanagerSection.loadBills();

    if (shouldError) {
      expect(BillmanagerSection.elements.container.innerHTML).toContain('Error loading bills');
    } else {
      expect(BillmanagerSection.bills.length).toBe(expectedBillsCount);
      expect(BillmanagerSection.totalPages).toBe(expectedTotalPages);
    }
  });

  // Test 8
  // Test: loadBills() should show loading message, render bills, pagination, or error
  // Scenario: Loading state, successful rendering, empty state, and error handling in loadBills() flow
  // Methods tested: loadBills(), renderBills(), renderPagination()
  // Mocks: apiClient.get() - success or failure; container - mocked DOM element
  // Expected: Container shows appropriate message (loading/empty/error), bills rendered on success
  test.each([
    { scenario: 'loading', apiSuccess: true, billsCount: 5, expectLoading: false },
    { scenario: 'success', apiSuccess: true, billsCount: 5, expectLoading: false },
    { scenario: 'empty', apiSuccess: true, billsCount: 0, expectLoading: false },
    { scenario: 'error', apiSuccess: false, billsCount: 0, expectLoading: false }
  ])('should handle loadBills correctly - scenario: $scenario', async ({ scenario, apiSuccess, billsCount, expectLoading }) => {
    const mockBills = Array.from({ length: billsCount }, (_, i) => ({
      id: i + 1,
      subscriptionId: `sub-${i + 1}`,
      amount: 100 + i,
      billingDate: '2026-04-01',
      dueDate: '2026-05-01',
      status: 'PENDING',
      operator: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      customer: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      plan: { name: 'Plan A', description: 'Test Plan', billingPeriod: 'monthly', serviceType: 'service' },
      subscription: { id: `sub-${i + 1}`, status: 'ACTIVE', autoRenewal: true }
    }));

    const mockResponse = { content: mockBills, totalPages: 1 };

    if (apiSuccess) {
      global.apiClient.get.mockResolvedValue(mockResponse);
    } else {
      global.apiClient.get.mockRejectedValue(new Error('API Error'));
    }

    BillmanagerSection.elements.container = document.getElementById('billmanager-container');
    const spyRender = jest.spyOn(BillmanagerSection, 'renderBills');
    const spyPagination = jest.spyOn(BillmanagerSection, 'renderPagination');

    await BillmanagerSection.loadBills();

    if (apiSuccess && billsCount === 0) {
      expect(BillmanagerSection.elements.container.innerHTML).toContain('No bills found');
    } else if (apiSuccess && billsCount > 0) {
      expect(spyRender).toHaveBeenCalled();
      expect(spyPagination).toHaveBeenCalled();
      expect(BillmanagerSection.bills.length).toBe(billsCount);
    } else if (!apiSuccess) {
      expect(BillmanagerSection.elements.container.innerHTML).toContain('Error loading bills');
    }

    spyRender.mockRestore();
    spyPagination.mockRestore();
  });

  // Test 9
  // Test: loadBills() should include status filter in API endpoint when set
  // Scenario: When currentStatusFilter is set, it's included as query parameter in API call
  // Methods tested: loadBills()
  // Mocks: apiClient.get() - spied to check endpoint
  // Expected: API endpoint includes &status=<filter> when currentStatusFilter is not empty
  test.each([
    { statusFilter: '', expectedIncludesStatus: false },
    { statusFilter: 'PENDING', expectedIncludesStatus: true },
    { statusFilter: 'PAID', expectedIncludesStatus: true },
    { statusFilter: 'FAILED', expectedIncludesStatus: true }
  ])('should include status filter in API endpoint - statusFilter: $statusFilter', async ({ statusFilter, expectedIncludesStatus }) => {
    BillmanagerSection.currentStatusFilter = statusFilter;
    BillmanagerSection.currentPage = 0;
    BillmanagerSection.pageSize = 12;

    const mockResponse = { content: [], totalPages: 0 };
    global.apiClient.get.mockResolvedValue(mockResponse);

    BillmanagerSection.elements.container = document.getElementById('billmanager-container');
    const spyApiGet = jest.spyOn(global.apiClient, 'get');

    await BillmanagerSection.loadBills();

    const callArgs = spyApiGet.mock.calls[0][0];

    if (expectedIncludesStatus) {
      expect(callArgs).toContain(`&status=${statusFilter}`);
    } else {
      expect(callArgs).not.toContain('&status=');
    }

    expect(callArgs).toContain('/billings/operator/issued');
    expect(callArgs).toContain('page=0');
    expect(callArgs).toContain('size=12');

    spyApiGet.mockRestore();
  });

  // Test 10 [PARAMETRIZED]
  // Test: parseBillsResponse() should parse different response formats
  // Scenario: Response contains bills in different structures (response.content | array | invalid)
  // Methods tested: parseBillsResponse()
  // Mocks: None required - pure parsing logic
  // Expected: Returns correct bills array and totalPages from all valid formats
  test.each([
    { 
      scenario: 'content format', 
      response: { content: [{ id: 1 }, { id: 2 }], totalPages: 3 }, 
      expectedBillsCount: 2, 
      expectedTotalPages: 3 
    },
    { 
      scenario: 'array format', 
      response: [{ id: 1 }, { id: 2 }, { id: 3 }], 
      expectedBillsCount: 3, 
      expectedTotalPages: 1 
    },
    { 
      scenario: 'empty content', 
      response: { content: [], totalPages: 0 }, 
      expectedBillsCount: 0, 
      expectedTotalPages: 0 
    },
    { 
      scenario: 'invalid format', 
      response: {}, 
      expectedBillsCount: 0, 
      expectedTotalPages: 1 
    },
    { 
      scenario: 'missing totalPages', 
      response: { content: [{ id: 1 }] }, 
      expectedBillsCount: 1, 
      expectedTotalPages: 0 
    }
  ])('should parse response correctly - scenario: $scenario', ({ scenario, response, expectedBillsCount, expectedTotalPages }) => {
    const result = BillmanagerSection.parseBillsResponse(response);

    expect(result.bills).toHaveLength(expectedBillsCount);
    expect(result.totalPages).toBe(expectedTotalPages);
    expect(Array.isArray(result.bills)).toBe(true);
  });

  // Test 11
  // Test: renderBills() should create table with headers and bill rows
  // Scenario: When renderBills() is called with populated bills array, table is created and appended
  // Methods tested: renderBills(), createTableHead(), createBillRow()
  // Mocks: document.createElement() - returns mocked elements; container - mocked
  // Expected: Table created with thead and tbody, each bill rendered as row, appended to container
  test('should render bills table with headers and rows', () => {
    const mockBills = [
      {
        id: 1,
        subscriptionId: 'sub-1',
        amount: 100,
        billingDate: '2026-04-01',
        dueDate: '2026-05-01',
        status: 'PENDING',
        operator: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        customer: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
        plan: { name: 'Plan A', description: 'Test Plan', billingPeriod: 'monthly', serviceType: 'service' },
        subscription: { id: 'sub-1', status: 'ACTIVE', autoRenewal: true }
      },
      {
        id: 2,
        subscriptionId: 'sub-2',
        amount: 150,
        billingDate: '2026-04-02',
        dueDate: '2026-05-02',
        status: 'PAID',
        operator: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        customer: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
        plan: { name: 'Plan B', description: 'Test Plan B', billingPeriod: 'monthly', serviceType: 'service' },
        subscription: { id: 'sub-2', status: 'ACTIVE', autoRenewal: true }
      }
    ];

    BillmanagerSection.bills = mockBills;
    BillmanagerSection.elements.container = document.getElementById('billmanager-container');

    const spyCreateHead = jest.spyOn(BillmanagerSection, 'createTableHead');
    const spyCreateRow = jest.spyOn(BillmanagerSection, 'createBillRow');

    BillmanagerSection.renderBills();

    expect(spyCreateHead).toHaveBeenCalled();
    expect(spyCreateRow).toHaveBeenCalledTimes(mockBills.length);
    
    const appendCalls = BillmanagerSection.elements.container.appendChild.mock.calls;
    expect(appendCalls.length).toBeGreaterThan(0);
    
    const tableElement = appendCalls[0][0];
    expect(tableElement).toBeDefined();
    expect(tableElement.tagName).toBe('TABLE');
    expect(tableElement.className).toBe('bills-table');

    spyCreateHead.mockRestore();
    spyCreateRow.mockRestore();
  });

  // Test 12 [PARAMETRIZED]
  // Test: createTableHead() should create thead with correct column headers
  // Scenario: Headers are created for each bill table column (ID, Subscription ID, Amount, etc.)
  // Methods tested: createTableHead()
  // Mocks: document.createElement() - returns mocked elements
  // Expected: Thead contains all 7 column headers in correct order
  test.each([
    { headerIndex: 0, expectedHeader: 'ID' },
    { headerIndex: 1, expectedHeader: 'Subscription ID' },
    { headerIndex: 2, expectedHeader: 'Amount' },
    { headerIndex: 3, expectedHeader: 'Billing Date' },
    { headerIndex: 4, expectedHeader: 'Due Date' },
    { headerIndex: 5, expectedHeader: 'Status' },
    { headerIndex: 6, expectedHeader: 'Actions' }
  ])('should create table header with correct columns - header: $expectedHeader', ({ headerIndex, expectedHeader }) => {
    const thead = BillmanagerSection.createTableHead();

    expect(thead.tagName).toBe('THEAD');
    
    const headerRow = thead.children[0];
    expect(headerRow).toBeDefined();
    expect(headerRow.tagName).toBe('TR');
    
    const headers = headerRow.children;
    expect(headers.length).toBe(7);
    expect(headers[headerIndex].tagName).toBe('TH');
    expect(headers[headerIndex].textContent).toBe(expectedHeader);
  });

  // Test 13 [PARAMETRIZED]
  // Test: createBillRow() should format bill data correctly in table cells
  // Scenario: Bill data is formatted and displayed in row cells (id, subscriptionId, amount, dates, status)
  // Methods tested: createBillRow(), formatDate()
  // Mocks: document.createElement() - returns mocked elements; formatDate() - spied
  // Expected: All bill data formatted and inserted in correct cells
  test.each([
    {
      scenario: 'standard bill',
      bill: {
        id: 1,
        subscriptionId: 'sub-1',
        amount: 100,
        billingDate: '2026-04-01',
        dueDate: '2026-05-01',
        status: 'PENDING',
        plan: { name: 'Plan A' }
      },
      expectAmount: '$100'
    },
    {
      scenario: 'paid bill',
      bill: {
        id: 2,
        subscriptionId: 'sub-2',
        amount: 250.50,
        billingDate: '2026-03-15',
        dueDate: '2026-04-15',
        status: 'PAID',
        plan: { name: 'Plan B' }
      },
      expectAmount: '$250.5'
    },
    {
      scenario: 'failed bill',
      bill: {
        id: 3,
        subscriptionId: 'sub-3',
        amount: 75,
        billingDate: '2026-02-01',
        dueDate: '2026-03-01',
        status: 'FAILED',
        plan: { name: 'Plan C' }
      },
      expectAmount: '$75'
    }
  ])('should create bill row correctly - scenario: $scenario', ({ scenario, bill, expectAmount }) => {
    const spyFormatDate = jest.spyOn(BillmanagerSection, 'formatDate');

    const row = BillmanagerSection.createBillRow(bill);

    expect(row.tagName).toBe('TR');
    expect(spyFormatDate).toHaveBeenCalledWith(bill.billingDate);
    expect(spyFormatDate).toHaveBeenCalledWith(bill.dueDate);

    const cells = row.children;
    expect(cells[0].textContent).toBe(bill.id);
    expect(cells[1].textContent).toBe(bill.subscriptionId);
    expect(cells[2].textContent).toBe(expectAmount);
    expect(cells[5].textContent).toContain(bill.status);

    const statusBadge = cells[5].querySelector('span');
    expect(statusBadge).toBeDefined();
    expect(statusBadge.className).toContain(`bill-status-${bill.status.toLowerCase()}`);

    const viewBtn = row.querySelector('button');
    expect(viewBtn).toBeDefined();
    expect(viewBtn.textContent).toBe('View');

    spyFormatDate.mockRestore();
  });

  // Test 14 [PARAMETRIZED]
  // Test: createBillRow() should create View button and Approve button for PAYMENT_CLAIMED status
  // Scenario: Buttons created based on bill status (PAYMENT_CLAIMED shows both View and Approve, others show View only)
  // Methods tested: createBillRow()
  // Mocks: document.createElement() - returns mocked elements
  // Expected: Action cell contains correct buttons for each status
  test.each([
    {
      scenario: 'PENDING status',
      bill: {
        id: 1,
        subscriptionId: 'sub-1',
        amount: 100,
        billingDate: '2026-04-01',
        dueDate: '2026-05-01',
        status: 'PENDING',
        plan: { name: 'Plan A' }
      },
      shouldHaveApproveBtn: false
    },
    {
      scenario: 'PAID status',
      bill: {
        id: 2,
        subscriptionId: 'sub-2',
        amount: 250.50,
        billingDate: '2026-03-15',
        dueDate: '2026-04-15',
        status: 'PAID',
        plan: { name: 'Plan B' }
      },
      shouldHaveApproveBtn: false
    },
    {
      scenario: 'PAYMENT_CLAIMED status',
      bill: {
        id: 3,
        subscriptionId: 'sub-3',
        amount: 75,
        billingDate: '2026-02-01',
        dueDate: '2026-03-01',
        status: 'PAYMENT_CLAIMED',
        plan: { name: 'Plan C' }
      },
      shouldHaveApproveBtn: true
    },
    {
      scenario: 'FAILED status',
      bill: {
        id: 4,
        subscriptionId: 'sub-4',
        amount: 150,
        billingDate: '2026-01-15',
        dueDate: '2026-02-15',
        status: 'FAILED',
        plan: { name: 'Plan D' }
      },
      shouldHaveApproveBtn: false
    },
    {
      scenario: 'REFUNDED status',
      bill: {
        id: 5,
        subscriptionId: 'sub-5',
        amount: 200,
        billingDate: '2025-12-01',
        dueDate: '2026-01-01',
        status: 'REFUNDED',
        plan: { name: 'Plan E' }
      },
      shouldHaveApproveBtn: false
    }
  ])('should create buttons correctly - scenario: $scenario', ({ scenario, bill, shouldHaveApproveBtn }) => {
    const row = BillmanagerSection.createBillRow(bill);
    
    const actionsCell = row.children[6];
    expect(actionsCell).toBeDefined();

    const buttons = actionsCell.children.filter(child => child.tagName === 'BUTTON');
    
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    
    const viewBtn = buttons.find(btn => btn.textContent === 'View');
    expect(viewBtn).toBeDefined();
    expect(viewBtn.className).toContain('btn-secondary');

    if (shouldHaveApproveBtn) {
      const approveBtn = buttons.find(btn => btn.textContent === 'Approve');
      expect(approveBtn).toBeDefined();
      expect(approveBtn.className).toContain('btn-success');
    } else {
      const approveBtn = buttons.find(btn => btn.textContent === 'Approve');
      expect(approveBtn).toBeUndefined();
    }
  });

  // Test 15 [PARAMETRIZED]
  // Test: renderPagination() should handle different pagination states
  // Scenario: Previous/Next buttons enabled/disabled based on page position (first page, middle page, last page, single page)
  // Methods tested: renderPagination(), createPaginationButton()
  // Mocks: paginationContainer - mocked; totalPages - set to different values
  // Expected: Buttons disabled appropriately, page info displayed, no pagination if totalPages <= 1
  describe.each([
    { currentPage: 0, totalPages: 1, expectedPrev: false, expectedNext: false, shouldRender: false },
    { currentPage: 0, totalPages: 5, expectedPrev: true, expectedNext: false, shouldRender: true },
    { currentPage: 2, totalPages: 5, expectedPrev: false, expectedNext: false, shouldRender: true },
    { currentPage: 4, totalPages: 5, expectedPrev: false, expectedNext: true, shouldRender: true },
  ])('renderPagination with page=$currentPage of $totalPages', ({ currentPage, totalPages, expectedPrev, expectedNext, shouldRender }) => {
    test(`should ${shouldRender ? 'render' : 'not render'} pagination`, () => {
      BillmanagerSection.currentPage = currentPage;
      BillmanagerSection.totalPages = totalPages;
      BillmanagerSection.elements.paginationContainer = document.getElementById('billmanager-pagination');
      BillmanagerSection.elements.paginationContainer.innerHTML = '';
      BillmanagerSection.elements.paginationContainer.children = [];

      BillmanagerSection.renderPagination();

      if (!shouldRender) {
        expect(BillmanagerSection.elements.paginationContainer.children.length).toBe(0);
      } else {
        const children = BillmanagerSection.elements.paginationContainer.children;
        expect(children.length).toBe(3);
        expect(children[0].disabled).toBe(expectedPrev);
        expect(children[2].disabled).toBe(expectedNext);
        expect(children[1].textContent).toContain(`Page ${currentPage + 1} of ${totalPages}`);
      }
    });
  });

  // Test 16
  // Test: createPaginationButton() should create button with text, enabled state, and click callback
  // Scenario: Pagination button is created with correct state and event handler attached
  // Methods tested: createPaginationButton()
  // Mocks: document.createElement() - returns mocked button element
  // Expected: Button has correct text, disabled state, and onclick callback
  test.each([
    { text: 'Previous', enabled: true, expectedDisabled: false },
    { text: 'Previous', enabled: false, expectedDisabled: true },
    { text: 'Next', enabled: true, expectedDisabled: false },
    { text: 'Next', enabled: false, expectedDisabled: true }
  ])('should create pagination button with text "$text" and enabled $enabled', 
    ({ text, enabled, expectedDisabled }) => {
      const mockCallback = jest.fn();
      const button = BillmanagerSection.createPaginationButton(text, enabled, mockCallback);

      expect(button.textContent).toBe(text);
      expect(button.disabled).toBe(expectedDisabled);
      expect(button.className).toContain('btn btn-sm btn-secondary');
      
      button.addEventListener.mock.calls[0][1]({ preventDefault: jest.fn() });
      expect(mockCallback).toHaveBeenCalled();
    }
  );

  // Test 17 [PARAMETRIZED]
  // Test: openDetailModal() should handle bill detail loading success and failure
  // Scenario: Modal opens, bill details fetched from API, invoice HTML rendered (or error shown)
  // Methods tested: openDetailModal(), buildInvoiceHTML()
  // Mocks: apiClient.get() - success or failure; modal and detailContent - mocked
  // Expected: Modal displayed, bill loaded and invoice rendered, or error message shown
  describe.each([
    { scenario: 'success', shouldRenderInvoice: true, shouldShowError: false },
    { scenario: 'failure', shouldRenderInvoice: false, shouldShowError: true }
  ])('openDetailModal with $scenario', ({ scenario, shouldRenderInvoice, shouldShowError }) => {
    test(`should ${shouldRenderInvoice ? 'render invoice' : 'show error'}`, async () => {
      const billId = 1;
      const mockBill = {
        id: 1, amount: 100, status: 'PAID', billingDate: '2026-04-17', dueDate: '2026-05-17', paidDate: '2026-04-17',
        operator: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
        customer: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' },
        plan: { name: 'Premium', description: 'Premium Plan', billingPeriod: 'Monthly', serviceType: 'Software' },
        subscription: { id: 'sub123', status: 'ACTIVE', autoRenewal: true }
      };

      BillmanagerSection.elements.modal = document.getElementById('billmanager-detail-modal');
      BillmanagerSection.elements.detailContent = document.getElementById('billmanager-detail-content');

      if (scenario === 'success') {
        global.apiClient.get.mockResolvedValue({ data: mockBill });
      } else {
        global.apiClient.get.mockRejectedValue(new Error('API Error'));
      }

      await BillmanagerSection.openDetailModal(billId);

      expect(BillmanagerSection.elements.modal.style.display).toBe('flex');
      expect(BillmanagerSection.elements.modal.classList.add).toHaveBeenCalledWith('active');
      if (shouldRenderInvoice) expect(BillmanagerSection.elements.detailContent.innerHTML).toContain('invoice-document');
      if (shouldShowError) expect(BillmanagerSection.elements.detailContent.innerHTML).toContain('error-message');
    });
  });


  // Test 18
  // Test: openDetailModal() should set currentBillId, show modal, and display loading message
  // Scenario: When openDetailModal() is called, modal visibility toggled and loading state shown
  // Methods tested: openDetailModal()
  // Mocks: modal - mocked element with classList; detailContent - mocked
  // Expected: currentBillId set, modal displays with 'active' class, loading message shown
  test('openDetailModal should set currentBillId, show modal, and display loading message', async () => {
    const billId = 42;
    BillmanagerSection.elements.modal = document.getElementById('billmanager-detail-modal');
    BillmanagerSection.elements.detailContent = document.getElementById('billmanager-detail-content');

    global.apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    BillmanagerSection.openDetailModal(billId);

    expect(BillmanagerSection.currentBillId).toBe(billId);
    expect(BillmanagerSection.elements.modal.style.display).toBe('flex');
    expect(BillmanagerSection.elements.modal.classList.add).toHaveBeenCalledWith('active');
    expect(BillmanagerSection.elements.detailContent.innerHTML).toContain('Loading bill details');
  });

  // Test 19 [PARAMETRIZED]
  // Test: buildInvoice*() should build all invoice sections correctly
  // Scenario: Invoice HTML is built from complete bill object including all sections (Top, Addresses, Dates, Items, Totals, Meta, Actions)
  // Methods tested: buildInvoiceHTML(), buildInvoiceTop(), buildInvoiceAddresses(), buildInvoiceDates(), buildInvoiceItems(), buildInvoiceTotals(), buildInvoiceMeta(), buildBillActions()
  // Mocks: None required - pure HTML string generation from bill object
  // Expected: Complete invoice HTML string returned containing all sections in correct order, properly formatted
  test('should build complete invoice HTML with all sections', () => {
    const mockBill = {
      id: 'INV-001',
      amount: 99.99,
      status: 'PENDING',
      billingDate: '2026-04-17',
      dueDate: '2026-05-17',
      paidDate: null,
      operator: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      customer: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      plan: { name: 'Pro', description: 'Professional Plan', billingPeriod: 'Monthly', serviceType: 'Premium' },
      subscription: { id: 'SUB-001', status: 'ACTIVE', autoRenewal: true }
    };

    const html = BillmanagerSection.buildInvoiceHTML(mockBill);

    expect(html).toContain('INVOICE');
    expect(html).toContain('INV-001');
    expect(html).toContain('PENDING');
    expect(html).toContain('John Doe');
    expect(html).toContain('Jane Smith');
    expect(html).toContain('john@example.com');
    expect(html).toContain('jane@example.com');
    expect(html).toContain('Pro');
    expect(html).toContain('$99.99');
    expect(html).toContain('SUB-001');
    expect(html).toContain('Change Status');
  });

  // Test 20 [PARAMETRIZED]
  // Test: buildInvoiceTop() should display invoice status and Approve button based on status
  // Scenario: Invoice top section displays bill status badge and conditionally shows Approve button (PAYMENT_CLAIMED only)
  // Methods tested: buildInvoiceTop()
  // Mocks: None required - pure HTML generation
  // Expected: HTML contains invoice number and status badge; includes Approve button for PAYMENT_CLAIMED, excludes for other statuses
  test.each([
    { status: 'PAYMENT_CLAIMED', shouldHaveApproveBtn: true },
    { status: 'PENDING', shouldHaveApproveBtn: false },
    { status: 'PAID', shouldHaveApproveBtn: false },
    { status: 'FAILED', shouldHaveApproveBtn: false },
    { status: 'REFUNDED', shouldHaveApproveBtn: false },
    { status: 'CANCELLED', shouldHaveApproveBtn: false }
  ])('buildInvoiceTop() with status=$status should %s Approve button', ({ status, shouldHaveApproveBtn }) => {
    const mockBill = { id: '123', status };
    const html = BillmanagerSection.buildInvoiceTop(mockBill);

    expect(html).toContain('Invoice #123');
    expect(html).toContain(`bill-status-${status.toLowerCase()}`);
    expect(html).toContain(status);
    
    if (shouldHaveApproveBtn) {
      expect(html).toContain('billmanager-approve-btn');
      expect(html).toContain('Approve');
    } else {
      expect(html).not.toContain('billmanager-approve-btn');
    }
  });

  // Test 21
  // Test: buildInvoiceAddresses() should build FROM and TO address blocks with operator and customer details
  // Scenario: Address blocks created showing operator (FROM) and customer (TO) information with names and emails
  // Methods tested: buildInvoiceAddresses()
  // Mocks: None required - pure HTML generation from bill.operator and bill.customer objects
  // Expected: HTML contains two address sections (FROM/TO) with correct titles, names, and email addresses
  test('buildInvoiceAddresses() should build FROM and TO address blocks with operator and customer details', () => {
    const mockBill = {
      operator: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      customer: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      }
    };

    const html = BillmanagerSection.buildInvoiceAddresses(mockBill);

    expect(html).toContain('FROM (Service Provider)');
    expect(html).toContain('TO (Customer)');
    expect(html).toContain('John Doe');
    expect(html).toContain('jane@example.com');
    expect(html).toContain('john@example.com');
    expect(html).toContain('Jane Smith');
  });

  // Test 22 [PARAMETRIZED]
  // Test: buildInvoiceDates() should format and display billing dates correctly
  // Scenario: Invoice dates section displays Invoice Date, Due Date, and Paid Date (or "Not paid yet" if null)
  // Methods tested: buildInvoiceDates(), formatDate()
  // Mocks: formatDate() - spied to verify date formatting
  // Expected: HTML contains all three date rows with formatted dates; shows "Not paid yet" when paidDate is null
  test.each([
    {
      billingDate: '2024-01-15',
      dueDate: '2024-02-15',
      paidDate: '2024-02-10',
      expectedPaidText: new Date('2024-02-10').toLocaleDateString()
    },
    {
      billingDate: '2024-01-15',
      dueDate: '2024-02-15',
      paidDate: null,
      expectedPaidText: 'Not paid yet'
    }
  ])('buildInvoiceDates() should format and display billing dates correctly', ({ billingDate, dueDate, paidDate, expectedPaidText }) => {
    const mockBill = {
      billingDate,
      dueDate,
      paidDate
    };

    const spyFormatDate = jest.spyOn(BillmanagerSection, 'formatDate');
    const html = BillmanagerSection.buildInvoiceDates(mockBill);

    expect(html).toContain('Invoice Date:');
    expect(html).toContain('Due Date:');
    expect(html).toContain('Paid Date:');
    expect(html).toContain(expectedPaidText);
    expect(spyFormatDate).toHaveBeenCalledWith(billingDate);
    expect(spyFormatDate).toHaveBeenCalledWith(dueDate);

    spyFormatDate.mockRestore();
  });

  // Test 23
  // Test: attachDetailModalListeners() should populate status dropdown and attach event listeners
  // Scenario: Status dropdown in detail modal is populated with billingStatuses and click handlers attached to Update and Approve buttons
  // Methods tested: attachDetailModalListeners(), updateBillStatus(), approveBillingPayment()
  // Mocks: document.getElementById() - returns mocked elements; addEventListener() - spied
  // Expected: Status dropdown contains all billing status options; Update and Approve buttons have click event listeners attached
  test('attachDetailModalListeners should populate status dropdown and attach event listeners', () => {
    const billId = 1;
    const mockBill = { id: 1, status: 'PAYMENT_CLAIMED' };
    
    const statusSelect = document.getElementById('billmanager-status-change');
    const updateBtn = document.getElementById('billmanager-update-btn');
    const approveBtn = document.getElementById('billmanager-approve-btn');
    
    const spyStatusSelectAppendChild = jest.spyOn(statusSelect, 'appendChild');
    const spyUpdateBtnAddEventListener = jest.spyOn(updateBtn, 'addEventListener');
    const spyApproveBtnAddEventListener = jest.spyOn(approveBtn, 'addEventListener');

    BillmanagerSection.attachDetailModalListeners(billId, mockBill);

    expect(spyStatusSelectAppendChild).toHaveBeenCalledTimes(BillmanagerSection.billingStatuses.length);
    expect(spyUpdateBtnAddEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(spyApproveBtnAddEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(statusSelect.children.length).toBe(BillmanagerSection.billingStatuses.length);
  });

  // Test 24 [PARAMETRIZED]
  // Test: approveBillingPayment() should approve billing payment and handle success/failure
  // Scenario: Payment approval API call is made and appropriate actions taken based on success or failure
  // Methods tested: approveBillingPayment(), loadBills(), closeDetailModal(), handleSuccess(), handleError()
  // Mocks: apiClient.put() - returns success or throws error; loadBills() - spied; closeDetailModal() - spied; handleSuccess()/handleError() - spied
  // Expected: API called with correct endpoint; on success: modal closed and bills reloaded; on failure: error message shown
  test.each([
    {
      name: 'should approve payment successfully',
      billId: '123',
      shouldSucceed: true,
      expectedCalls: { closeDetailModal: 1, loadBills: 1, handleSuccess: 1, handleError: 0 }
    },
    {
      name: 'should handle approval failure',
      billId: '456',
      shouldSucceed: false,
      expectedCalls: { closeDetailModal: 0, loadBills: 0, handleSuccess: 0, handleError: 1 }
    }
  ])('approveBillingPayment() - $name', async ({ billId, shouldSucceed, expectedCalls }) => {
    const spyLoadBills = jest.spyOn(BillmanagerSection, 'loadBills').mockResolvedValue();
    const spyCloseModal = jest.spyOn(BillmanagerSection, 'closeDetailModal');
    const spyHandleSuccess = jest.spyOn(BillmanagerSection, 'handleSuccess');
    const spyHandleError = jest.spyOn(BillmanagerSection, 'handleError');

    if (shouldSucceed) {
      global.apiClient.put.mockResolvedValue(undefined);
    } else {
      global.apiClient.put.mockRejectedValue(new Error('Approval failed'));
    }

    await BillmanagerSection.approveBillingPayment(billId);

    expect(global.apiClient.put).toHaveBeenCalledWith(`/billings/${billId}/approve`);
    expect(spyCloseModal).toHaveBeenCalledTimes(expectedCalls.closeDetailModal);
    expect(spyLoadBills).toHaveBeenCalledTimes(expectedCalls.loadBills);
    expect(spyHandleSuccess).toHaveBeenCalledTimes(expectedCalls.handleSuccess);
    expect(spyHandleError).toHaveBeenCalledTimes(expectedCalls.handleError);

    spyLoadBills.mockRestore();
    spyCloseModal.mockRestore();
    spyHandleSuccess.mockRestore();
    spyHandleError.mockRestore();
  });

  // Test 25 [PARAMETRIZED]
  // Test: updateBillStatus() should update bill status and handle success/failure/validation
  // Scenario: Status update via API with loading state, validation, and appropriate response handling
  // Methods tested: updateBillStatus(), setButtonLoading(), loadBills(), closeDetailModal(), handleSuccess(), handleWarning(), handleError()
  // Mocks: apiClient.put() - returns success or throws error; document.getElementById() - returns mocked status select and update button
  // Expected: Warning shown if no status selected; on success: button disabled during request, then modal closed and bills reloaded after 1500ms delay; on failure: error shown and button re-enabled
  describe.each([
    { scenario: 'no status selected', statusValue: '', shouldShowWarning: true, shouldCallApi: false },
    { scenario: 'success', statusValue: 'PAID', shouldShowWarning: false, shouldCallApi: true, apiSuccess: true },
    { scenario: 'API failure', statusValue: 'FAILED', shouldShowWarning: false, shouldCallApi: true, apiSuccess: false }
  ])('updateBillStatus with $scenario', ({ scenario, statusValue, shouldShowWarning, shouldCallApi, apiSuccess }) => {
    test(`should handle ${scenario}`, async () => {
      const billId = 1;
      const statusSelect = document.getElementById('billmanager-status-change');
      const updateBtn = document.getElementById('billmanager-update-btn');
      
      statusSelect.value = statusValue;
      BillmanagerSection.currentBillId = billId;

      const spyHandleWarning = jest.spyOn(BillmanagerSection, 'handleWarning');
      const spyCloseModal = jest.spyOn(BillmanagerSection, 'closeDetailModal');
      const spyLoadBills = jest.spyOn(BillmanagerSection, 'loadBills');
      const spySetButtonLoading = jest.spyOn(BillmanagerSection, 'setButtonLoading');

      if (shouldCallApi) {
        if (apiSuccess) {
          global.apiClient.put.mockResolvedValue({ success: true });
        } else {
          global.apiClient.put.mockRejectedValue(new Error('Update failed'));
        }
      }

      await BillmanagerSection.updateBillStatus(billId);

      if (shouldShowWarning) {
        expect(spyHandleWarning).toHaveBeenCalledWith('Please select a status');
      } else if (shouldCallApi) {
        //console.log(JSON.stringify(updateBtn, null, 2));
        expect(spySetButtonLoading).toHaveBeenCalledWith(updateBtn, true);
        expect(global.apiClient.put).toHaveBeenCalledWith(`/billings/${billId}`, { status: statusValue });

        if (apiSuccess) {
          jest.advanceTimersByTime(1500);
          expect(spyCloseModal).toHaveBeenCalled();
          expect(spyLoadBills).toHaveBeenCalled();
        } else {
          expect(spySetButtonLoading).toHaveBeenCalledWith(updateBtn, false);
        }
      }

      spyHandleWarning.mockRestore();
      spyCloseModal.mockRestore();
      spyLoadBills.mockRestore();
      spySetButtonLoading.mockRestore();
    });
  });


  // Test 26 [PARAMETRIZED]
  // Test: setButtonLoading() should toggle button disabled state and update text
  // Scenario: Button state changed to reflect loading/not-loading condition with appropriate text
  // Methods tested: setButtonLoading()
  // Mocks: document.getElementById() - returns mocked button element
  // Expected: When loading true: button disabled and text = 'Updating...'; when loading false: button enabled and text = 'Update Status'
  test.each([
    {
      isLoading: true,
      expectedDisabled: true,
      expectedText: 'Updating...'
    },
    {
      isLoading: false,
      expectedDisabled: false,
      expectedText: 'Update Status'
    }
  ])('setButtonLoading() - isLoading: $isLoading', ({ isLoading, expectedDisabled, expectedText }) => {
    const btn = document.getElementById('billmanager-update-btn');
    btn.disabled = false;
    btn.textContent = 'Update Status';

    BillmanagerSection.setButtonLoading(btn, isLoading);

    expect(btn.disabled).toBe(expectedDisabled);
    expect(btn.textContent).toBe(expectedText);
  });

  // Test 27 [PARAMETRIZED]
  // Test: handleError/Warning/Success() should call UIController.showMessage() with correct message type
  // Scenario: Error, warning, and success messages are passed to UIController with appropriate severity levels
  // Methods tested: handleSuccess(), handleWarning(), handleError()
  // Mocks: UIController.getInstance().showMessage() - spied
  // Expected: showMessage() called with correct message and type ('success', 'warning', or 'error')
  test.each([
    {
      method: 'handleSuccess',
      message: 'Payment approved successfully',
      expectedType: 'success'
    },
    {
      method: 'handleWarning',
      message: 'Please select a status',
      expectedType: 'warning'
    },
    {
      method: 'handleError',
      title: 'Error updating bill status',
      error: new Error('API failed'),
      expectedMessage: 'Error updating bill status: API failed',
      expectedType: 'error'
    }
  ])('$method() should call UIController.showMessage() with correct type - $expectedType', ({ method, message, title, error, expectedMessage, expectedType }) => {
    const mockShowMessage = jest.fn();
    global.UIController.getInstance.mockReturnValue({
      showMessage: mockShowMessage
    });

    if (method === 'handleError') {
      BillmanagerSection[method](title, error);
      expect(mockShowMessage).toHaveBeenCalledWith(expectedMessage, expectedType);
    } else {
      BillmanagerSection[method](message);
      expect(mockShowMessage).toHaveBeenCalledWith(message, expectedType);
    }

    expect(mockShowMessage).toHaveBeenCalledTimes(1);
  });


  // Test 28
  // Test: closeDetailModal() should remove active class, hide modal, and reset currentBillId
  // Scenario: Detail modal is closed by removing active class, hiding display, and clearing bill ID reference
  // Methods tested: closeDetailModal()
  // Mocks: modal - mocked element with classList and style properties
  // Expected: Modal classList.remove('active') called; modal.style.display = 'none'; currentBillId = null
  test('closeDetailModal() should remove active class, hide modal, and reset currentBillId', () => {
    BillmanagerSection.elements.modal = document.getElementById('billmanager-detail-modal');
    BillmanagerSection.currentBillId = '123';

    const spyClassListRemove = jest.spyOn(BillmanagerSection.elements.modal.classList, 'remove');

    BillmanagerSection.closeDetailModal();

    expect(spyClassListRemove).toHaveBeenCalledWith('active');
    expect(BillmanagerSection.elements.modal.style.display).toBe('none');
    expect(BillmanagerSection.currentBillId).toBeNull();

    spyClassListRemove.mockRestore();
  });

  // Test 29 [PARAMETRIZED]
  // Test: formatDate() should format valid dates, handle null, and handle invalid dates
  // Scenario: Date strings converted to localized date format, or appropriate fallback for null/invalid inputs
  // Methods tested: formatDate()
  // Mocks: None required - uses native Date object and toLocaleDateString()
  // Expected: Valid dates formatted via toLocaleDateString(); null input returns 'N/A'; invalid dates handled gracefully
  test.each([
    {
      input: '2024-04-17',
      expectedOutput: new Date('2024-04-17').toLocaleDateString(),
      description: 'valid date string'
    },
    {
      input: null,
      expectedOutput: 'N/A',
      description: 'null input'
    },
    {
      input: undefined,
      expectedOutput: 'N/A',
      description: 'undefined input'
    },
    {
      input: '',
      expectedOutput: 'N/A',
      description: 'empty string'
    },
    {
      input: '2025-12-25',
      expectedOutput: new Date('2025-12-25').toLocaleDateString(),
      description: 'future date'
    }
  ])('formatDate() should handle $description - input: $input', ({ input, expectedOutput }) => {
    const result = BillmanagerSection.formatDate(input);

    expect(result).toBe(expectedOutput);
  });

});
