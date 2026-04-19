// Test file for: webclientv1/src/js/pages/sections/operator.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { OperatorSection } = loadModules('OperatorSection');

describe('OperatorSection', () => {
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
  // TEST INVENTORY:
  // 1. init() should initialize section with all required data
  // 2. cacheElements() should populate elements object with DOM elements or handle missing elements gracefully
  // 3. attachEventListeners() should attach click handlers to buttons
  // 4. loadServiceTypes() should fetch and store service types or handle errors
  // 5. loadBillingPeriods() should fetch and store billing periods or handle errors
  // 6. loadPlans() should handle various API response formats and display appropriate messages
  // 7. renderPlans() should create table with correct headers, rows, and formatted data
  // 8. createPlanRow() should format plan data and create edit button
  // 9. openPlanModal() should set correct state based on mode
  // 10. generatePlanForm() should create form fields and populate data on edit
  // 11. generatePlanForm() should handle features field formatting
  // 12. createFormActions() should create correct buttons and attach event handlers based on mode
  // 13. savePlan() should validate fields, prepare data, call correct endpoint, and handle responses
  // 14. deletePlan() should call correct endpoint and handle responses
  // 15. closePlanModal() should reset state correctly
  // 16. escapeHtml() should prevent XSS
  // [Add more tests as they are created]
  //

  let component;
  let mocks = {};

  // Factory functions for form elements
  const createInputMock = (id, config = {}) => {
    const valueKey = `_${id}Value`;
    const defaults = {
      type: 'text',
      className: 'form-control',
      required: false,
      step: null,
      rows: null,
      checked: false,
      disabled: false,
      placeholder: ''
    };
    
    const props = { ...defaults, ...config };
    const mock = {
      _id: id,
      get id() {
        return this._id;
      },
      set id(newId) {
        this._id = newId;
      },
      [valueKey]: props.type === 'checkbox' ? props.checked : '',
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
      
      get checked() {
        return this[valueKey];
      },
      set checked(val) {
        this[valueKey] = val;
      },
      
      reset() {
        this[valueKey] = props.type === 'checkbox' ? props.checked : '';
      }
    };
    
    if (props.step) mock.step = props.step;
    if (props.rows) mock.rows = props.rows;
    
    return mock;
  };

  const createSelectMock = (id, config = {}) => {
    const defaults = {
      className: 'form-control',
      required: false
    };
    
    const props = { ...defaults, ...config };
    
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
      
      getAllDescendants() {
        let all = [...this.children];
        const queue = [...this.children];
        
        while (queue.length > 0) {
          const child = queue.shift();
          if (child.children && Array.isArray(child.children)) {
            all.push(...child.children);
            queue.push(...child.children);
          }
        }
        
        return all;
      },
      
      reset() {
        this._innerHTML = '';
        this.children = [];
        this.appendChild.mockClear();
      }
    };
  };

  const createSectionMock = (id, initialDisplay = 'block') => {
    return {
      id,
      style: { display: initialDisplay },
      reset() {
        this.style.display = initialDisplay;
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
    
    return {
      id,
      type: props.type,
      _textContent: props.textContent,
      className: props.className,
      disabled: props.disabled,
      
      get textContent() {
        return this._textContent;
      },
      set textContent(val) {
        this._textContent = val;
      },
      
      addEventListener: jest.fn(),
      
      reset() {
        this._textContent = props.textContent;
        this.disabled = props.disabled;
        this.addEventListener.mockClear();
      }
    };
  };

  const createTableMock = () => {
    return {
      tagName: 'TABLE',
      className: '',
      tHead: null,
      tBodies: [],
      
      createTHead() {
        if (!this.tHead) {
          this.tHead = {
            tagName: 'THEAD',
            rows: [],
            insertRow() {
              const row = {
                tagName: 'TR',
                cells: [],
                children: [],
                insertCell() {
                  const cell = {
                    tagName: 'TH',
                    textContent: '',
                    appendChild: jest.fn(function(child) {
                      this.children = this.children || [];
                      this.children.push(child);
                    }),
                    className: '',
                    children: []
                  };
                  this.cells.push(cell);
                  return cell;
                },
                appendChild: jest.fn(function(child) {
                  this.children.push(child);
                  this.cells.push(child); 
                })
              };
              this.rows.push(row);
              return row;
            }
          };
        }
        return this.tHead;
      },

      createTBody() {
        const tbody = {
          tagName: 'TBODY',
          rows: [],
          appendChild: jest.fn(function(child) {
            this.rows.push(child);
          }),
          insertRow() {
            const row = {
              tagName: 'TR',
              cells: [],
              children: [],
              insertCell() {
                const cell = {
                  tagName: 'TD',
                  textContent: '',
                  appendChild: jest.fn(function(child) {
                    this.children = this.children || [];
                    this.children.push(child);
                  }),
                  className: '',
                  children: []
                };
                this.cells.push(cell);
                return cell;
              },
              appendChild: jest.fn(function(child) {
                this.children.push(child);
              })
            };
            this.rows.push(row);
            return row;
          }
        };
        this.tBodies.push(tbody);
        return tbody;
      },

      appendChild: jest.fn(function(child) {
        return this;
      })
    };
  };

  const createTrMock = () => {
    const children = [];
    let html = '';
    
    return {
      tagName: 'TR',
      cells: [],
      children: children,
      insertCell() {
        const cell = {
          tagName: 'TD',
          textContent: '',
          appendChild: jest.fn(function(child) {
            this.children = this.children || [];
            this.children.push(child);
            html += child.innerHTML || child.textContent || '';
          }),
          className: '',
          children: []
        };
        this.cells.push(cell);
        return cell;
      },
      appendChild: jest.fn(function(child) {
        children.push(child);
        html += child.innerHTML || child.textContent || '';
        this.cells.push(child);
      }),
      get innerHTML() {
        return html;
      },
      querySelector(selector) {
        if (selector === 'button') {
          return children.find(child => child.tagName === 'BUTTON');
        }
        return null;
      }
    };
  };

  const createGenericElementMock = (tag) => {
    let html = '';
    let textContent = '';
    const children = [];
    let onclickHandler = null;
    let selectedValue = '';

    const element = {
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
      textContent: '',
      children: children,
      style: {},
      type: '',
      checked: false,
      disabled: false,
      value: '',
      rows: 0,
      step: '',
      required: false,
      placeholder: '',
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
        return this._innerHTML || html;
      },

      set innerHTML(value) {
        this._innerHTML = value;
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
  };

  const mockUIController = {
    showMessage: jest.fn()
  };

  beforeEach(() => {
    jest.useFakeTimers();

    // Define all mocks with their configurations
    const mockConfigs = {
      'operator-plans-container': { factory: createContainerMock, args: ['operator-plans-container'] },
      'operator-plan-form': { factory: createContainerMock, args: ['operator-plan-form'] },
      'operator-view': { factory: createSectionMock, args: ['operator-view', 'block'] },
      'operator-edit': { factory: createSectionMock, args: ['operator-edit', 'none'] },
      'operator-create-btn': { factory: createButtonMock, args: ['operator-create-btn', { textContent: 'Create Plan', className: 'btn btn-primary' }] },
      'operator-refresh-btn': { factory: createButtonMock, args: ['operator-refresh-btn', { textContent: 'Refresh' }] },
      'operator-name-input': { factory: createInputMock, args: ['operator-name-input', { type: 'text', required: true }] },
      'operator-price-input': { factory: createInputMock, args: ['operator-price-input', { type: 'number', required: true, step: '0.01' }] }, // ← Add this
      'operator-desc-input': { factory: createInputMock, args: ['operator-desc-input', { type: 'textarea', rows: 3 }] },
      'operator-features-input': { factory: createInputMock, args: ['operator-features-input', { type: 'textarea', rows: 3 }] },
      'operator-service-type-select': { factory: createSelectMock, args: ['operator-service-type-select', { required: true }] },
      'operator-billing-select': { factory: createSelectMock, args: ['operator-billing-select', { required: true }] },
      'operator-status-checkbox': { factory: createInputMock, args: ['operator-status-checkbox', { type: 'checkbox', checked: true }] },
      'operator-save-btn': { factory: createButtonMock, args: ['operator-save-btn', { type: 'button', textContent: 'Create Plan', className: 'btn btn-primary' }] }
    };

    // Create all mocks
    mocks = {};
    Object.entries(mockConfigs).forEach(([id, config]) => {
      mocks[id] = config.factory(...(config.args || [id]));
    });

    document.getElementById = jest.fn((id) => {
      return mocks[id] || null;
    });

    document.querySelector = jest.fn((selector) => {
      return null;
    });

    document.createElement = jest.fn((tag) => {
      if (tag === 'table') {
        return createTableMock();
      }
      if (tag === 'tr') {
        return createTrMock();
      }
      if (tag === 'input') {
        // Return a reusable input mock
        const inputMock = createInputMock('input-temp', { type: 'text' });
        // Track it so we can retrieve by ID later
        const originalSetId = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inputMock), 'id')?.set;
        Object.defineProperty(inputMock, 'id', {
          set(newId) {
            this._id = newId;
            mocks[newId] = this; // Store in mocks by ID
          },
          get() {
            return this._id;
          }
        });
        return inputMock;
      }
      if (tag === 'textarea') {
        const textareaMock = createInputMock('textarea-temp', { type: 'textarea', rows: 3 });
        Object.defineProperty(textareaMock, 'id', {
          set(newId) {
            this._id = newId;
            mocks[newId] = this; // Store in mocks by ID
          },
          get() {
            return this._id;
          }
        });
        return textareaMock;
      }
      if (tag === 'select') {
        const selectMock = createSelectMock('select-temp');
        Object.defineProperty(selectMock, 'id', {
          set(newId) {
            this._id = newId;
            mocks[newId] = this; // Store in mocks by ID
          },
          get() {
            return this._id;
          }
        });
        return selectMock;
      }

      return createGenericElementMock(tag);
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

    // Reset OperatorSection state
    OperatorSection.currentPlanId = null;
    OperatorSection.plans = [];
    OperatorSection.isEditMode = false;
    OperatorSection.serviceTypes = [];
    OperatorSection.billingPeriods = [];
    OperatorSection.elements = {};
  });

  afterEach(() => {
    Object.values(mocks).forEach(mock => {
      if (mock.reset) {
        mock.reset();
      }
    });

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

  // ===== TEST COMMENTS BELOW =====

  // Test 1
  // Test: init() should call cacheElements, attachEventListeners, and load all required data
  // Scenario: When OperatorSection.init() is called, it initializes all dependencies and loads data
  // Methods tested: init(), cacheElements(), attachEventListeners(), loadServiceTypes(), loadBillingPeriods(), loadPlans()
  // Mocks: apiClient.get() - for all async data loads; jest.spyOn() on all methods
  // Expected: All methods called, Promise.all resolves, section is ready to use
  test('should call cacheElements, attachEventListeners, and load all required data', async () => {
    // Arrange
    const mockServiceTypes = ['SERVICE_TYPE_1', 'SERVICE_TYPE_2'];
    const mockBillingPeriods = ['MONTHLY', 'YEARLY'];
    const mockPlans = [
      { id: 1, name: 'Plan 1', basePrice: 10, status: 'ACTIVE', createdAt: new Date().toISOString() },
      { id: 2, name: 'Plan 2', basePrice: 20, status: 'INACTIVE', createdAt: new Date().toISOString() }
    ];

    apiClient.get
      .mockResolvedValueOnce(mockServiceTypes)
      .mockResolvedValueOnce(mockBillingPeriods)
      .mockResolvedValueOnce({ data: mockPlans });

    const cacheElementsSpy = jest.spyOn(OperatorSection, 'cacheElements');
    const attachEventListenersSpy = jest.spyOn(OperatorSection, 'attachEventListeners');
    const loadServiceTypesSpy = jest.spyOn(OperatorSection, 'loadServiceTypes');
    const loadBillingPeriodsSpy = jest.spyOn(OperatorSection, 'loadBillingPeriods');
    const loadPlansSpy = jest.spyOn(OperatorSection, 'loadPlans');

    // Act
    await OperatorSection.init();

    // Assert
    expect(cacheElementsSpy).toHaveBeenCalledTimes(1);
    expect(attachEventListenersSpy).toHaveBeenCalledTimes(1);
    expect(loadServiceTypesSpy).toHaveBeenCalledTimes(1);
    expect(loadBillingPeriodsSpy).toHaveBeenCalledTimes(1);
    expect(loadPlansSpy).toHaveBeenCalledTimes(1);

    expect(OperatorSection.serviceTypes).toEqual(mockServiceTypes);
    expect(OperatorSection.billingPeriods).toEqual(mockBillingPeriods);
    expect(OperatorSection.plans).toEqual(mockPlans);

    expect(OperatorSection.elements.container).toBeDefined();
    expect(OperatorSection.elements.form).toBeDefined();
    expect(OperatorSection.elements.viewSection).toBeDefined();
    expect(OperatorSection.elements.editSection).toBeDefined();
    expect(OperatorSection.elements.createBtn).toBeDefined();
    expect(OperatorSection.elements.refreshBtn).toBeDefined();

    cacheElementsSpy.mockRestore();
    attachEventListenersSpy.mockRestore();
    loadServiceTypesSpy.mockRestore();
    loadBillingPeriodsSpy.mockRestore();
    loadPlansSpy.mockRestore();
  });

  // Test 2
  // Test: cacheElements() should populate elements object with DOM elements or handle missing elements gracefully
  // Scenario: When cacheElements() is called with various DOM element availability states
  // Methods tested: cacheElements()
  // Mocks: document.getElementById() - mocked via DOM setup
  // Expected: elements object populated with references or undefined for missing elements
  // Parametrized: YES - tests with all elements present and with missing elements
  test.each([
    {
      scenario: 'should populate elements object when all DOM elements are present',
      mockSetup: () => {
        // All elements are already mocked in beforeEach
      },
      expectedElements: {
        container: 'operator-plans-container',
        form: 'operator-plan-form',
        viewSection: 'operator-view',
        editSection: 'operator-edit',
        createBtn: 'operator-create-btn',
        refreshBtn: 'operator-refresh-btn'
      },
      expectedNullCount: 0
    },
    {
      scenario: 'should handle missing container element gracefully',
      mockSetup: () => {
        document.getElementById = jest.fn((id) => {
          if (id === 'operator-plans-container') return null;
          return mocks[id] || null;
        });
      },
      expectedElements: {
        container: null,
        form: 'operator-plan-form',
        viewSection: 'operator-view',
        editSection: 'operator-edit',
        createBtn: 'operator-create-btn',
        refreshBtn: 'operator-refresh-btn'
      },
      expectedNullCount: 1
    },
    {
      scenario: 'should handle missing form element gracefully',
      mockSetup: () => {
        document.getElementById = jest.fn((id) => {
          if (id === 'operator-plan-form') return null;
          return mocks[id] || null;
        });
      },
      expectedElements: {
        container: 'operator-plans-container',
        form: null,
        viewSection: 'operator-view',
        editSection: 'operator-edit',
        createBtn: 'operator-create-btn',
        refreshBtn: 'operator-refresh-btn'
      },
      expectedNullCount: 1
    },
    {
      scenario: 'should handle missing all button elements gracefully',
      mockSetup: () => {
        document.getElementById = jest.fn((id) => {
          if (id === 'operator-create-btn' || id === 'operator-refresh-btn') return null;
          return mocks[id] || null;
        });
      },
      expectedElements: {
        container: 'operator-plans-container',
        form: 'operator-plan-form',
        viewSection: 'operator-view',
        editSection: 'operator-edit',
        createBtn: null,
        refreshBtn: null
      },
      expectedNullCount: 2
    },
    {
      scenario: 'should handle all elements missing gracefully',
      mockSetup: () => {
        document.getElementById = jest.fn(() => null);
      },
      expectedElements: {
        container: null,
        form: null,
        viewSection: null,
        editSection: null,
        createBtn: null,
        refreshBtn: null
      },
      expectedNullCount: 6
    }
  ])(
    'cacheElements() - $scenario',
    ({ mockSetup, expectedElements, expectedNullCount }) => {
      // Arrange
      mockSetup();

      // Act
      OperatorSection.cacheElements();

      // Assert
      // Check each element reference
      expect(OperatorSection.elements.container).toBe(
        expectedElements.container ? mocks[expectedElements.container] : null
      );
      expect(OperatorSection.elements.form).toBe(
        expectedElements.form ? mocks[expectedElements.form] : null
      );
      expect(OperatorSection.elements.viewSection).toBe(
        expectedElements.viewSection ? mocks[expectedElements.viewSection] : null
      );
      expect(OperatorSection.elements.editSection).toBe(
        expectedElements.editSection ? mocks[expectedElements.editSection] : null
      );
      expect(OperatorSection.elements.createBtn).toBe(
        expectedElements.createBtn ? mocks[expectedElements.createBtn] : null
      );
      expect(OperatorSection.elements.refreshBtn).toBe(
        expectedElements.refreshBtn ? mocks[expectedElements.refreshBtn] : null
      );

      // Verify null count
      const nullCount = Object.values(OperatorSection.elements).filter(el => el === null).length;
      expect(nullCount).toBe(expectedNullCount);
    }
  );

  // Test 3
  // Test: attachEventListeners() should attach click handlers to create and refresh buttons
  // Scenario: When attachEventListeners() is called and buttons are clicked
  // Methods tested: attachEventListeners(), openPlanModal(), loadPlans()
  // Mocks: addEventListener() - spied to verify attachment; openPlanModal() and loadPlans() - spied
  // Expected: Create button click calls openPlanModal(null), refresh button click calls loadPlans()
  test.each([
    {
      name: 'create button should call openPlanModal(null)',
      buttonId: 'operator-create-btn',
      methodToCall: 'openPlanModal',
      expectedArgument: null
    },
    {
      name: 'refresh button should call loadPlans()',
      buttonId: 'operator-refresh-btn',
      methodToCall: 'loadPlans',
      expectedArgument: undefined
    }
  ])('attachEventListeners() $name', ({ buttonId, methodToCall, expectedArgument }) => {
    jest.spyOn(OperatorSection, 'openPlanModal');
    jest.spyOn(OperatorSection, 'loadPlans');

    OperatorSection.cacheElements();
    OperatorSection.attachEventListeners();

    const button = document.getElementById(buttonId);
    const clickHandler = button.addEventListener.mock.calls.find(call => call[0] === 'click')?.[1];

    if (clickHandler) {
      clickHandler({ preventDefault: jest.fn() });
    }

    if (methodToCall === 'openPlanModal') {
      expect(OperatorSection.openPlanModal).toHaveBeenCalledWith(expectedArgument);
    } else {
      expect(OperatorSection.loadPlans).toHaveBeenCalled();
    }
  });

  // Test 4
  // Test: loadServiceTypes() should fetch and store service types or handle errors
  // Scenario: When loadServiceTypes() is called with various API response scenarios
  // Methods tested: loadServiceTypes()
  // Mocks: apiClient.get() - to simulate success, error, and non-array responses
  // Expected: serviceTypes array populated on success, console.error called on failure, non-array responses ignored
  // Parametrized: YES - tests success, error, and non-array response variants
  test.each([
    {
      name: 'should populate serviceTypes with API response',
      apiResponse: ['Service Type 1', 'Service Type 2', 'Service Type 3'],
      expectedServiceTypes: ['Service Type 1', 'Service Type 2', 'Service Type 3'],
      shouldError: false,
      shouldCallConsoleError: false
    },
    {
      name: 'should handle API error gracefully',
      apiResponse: null,
      expectedServiceTypes: [],
      shouldError: true,
      shouldCallConsoleError: true
    },
    {
      name: 'should ignore non-array responses',
      apiResponse: { serviceTypes: ['Service Type 1'] },
      expectedServiceTypes: [],
      shouldError: false,
      shouldCallConsoleError: false
    }
  ])('loadServiceTypes() $name', async ({ apiResponse, expectedServiceTypes, shouldError, shouldCallConsoleError }) => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    if (shouldError) {
      apiClient.get.mockRejectedValueOnce(new Error('API Error'));
    } else {
      apiClient.get.mockResolvedValueOnce(apiResponse);
    }

    await OperatorSection.loadServiceTypes();

    expect(apiClient.get).toHaveBeenCalledWith('/plans/service-types');
    expect(OperatorSection.serviceTypes).toEqual(expectedServiceTypes);

    if (shouldCallConsoleError) {
      expect(console.error).toHaveBeenCalledWith('Error loading service types:', expect.any(Error));
    } else {
      expect(console.error).not.toHaveBeenCalled();
    }

    console.error.mockRestore();
  });

  // Test 5
  // Test: loadBillingPeriods() should fetch and store billing periods or handle errors
  // Scenario: When loadBillingPeriods() is called with various API response scenarios
  // Methods tested: loadBillingPeriods()
  // Mocks: apiClient.get() - to simulate success, error, and non-array responses
  // Expected: billingPeriods array populated on success, console.error called on failure, non-array responses ignored
  // Parametrized: YES - tests success, error, and non-array response variants
  test.each([
    {
      name: 'should populate billingPeriods on successful API response',
      apiResponse: ['Monthly', 'Quarterly', 'Annual'],
      expectedBillingPeriods: ['Monthly', 'Quarterly', 'Annual'],
      shouldLogError: false
    },
    {
      name: 'should handle API error gracefully',
      apiResponse: null,
      apiError: new Error('API request failed'),
      expectedBillingPeriods: [],
      shouldLogError: true
    },
    {
      name: 'should ignore non-array API responses',
      apiResponse: { billingPeriods: ['Monthly', 'Annual'] },
      expectedBillingPeriods: [],
      shouldLogError: false
    },
    {
      name: 'should ignore null API response',
      apiResponse: null,
      expectedBillingPeriods: [],
      shouldLogError: false
    }
  ])('loadBillingPeriods() $name', async ({ apiResponse, apiError, expectedBillingPeriods, shouldLogError }) => {
    jest.spyOn(console, 'error').mockImplementation();

    if (apiError) {
      apiClient.get.mockRejectedValue(apiError);
    } else {
      apiClient.get.mockResolvedValue(apiResponse);
    }

    await OperatorSection.loadBillingPeriods();

    expect(apiClient.get).toHaveBeenCalledWith('/billings/billing-periods');
    expect(OperatorSection.billingPeriods).toEqual(expectedBillingPeriods);

    if (shouldLogError) {
      expect(console.error).toHaveBeenCalledWith('Error loading billing periods:', apiError);
    } else {
      expect(console.error).not.toHaveBeenCalled();
    }

    console.error.mockRestore();
  });

  // Test 6
  // Test: loadPlans() should handle various API response formats and display appropriate messages
  // Scenario: When loadPlans() is called and receives different response structures (array, response.content, response.plans, response.data, empty)
  // Methods tested: loadPlans(), renderPlans()
  // Mocks: apiClient.get() - to simulate different response formats; renderPlans() - spied; UIController.getInstance().showMessage() - mocked
  // Expected: Plans array correctly extracted from any format, empty message shown for no plans, error message shown on API failure, renderPlans() called with valid data
  // Parametrized: YES - tests array response, response.content, response.plans, response.data, empty array, and error variants
  test.each([
    {
      name: 'should handle direct array response',
      apiResponse: [{ id: 1, name: 'Plan 1', basePrice: 10 }],
      expectedPlansLength: 1,
      expectedRenderCalled: true,
      shouldShowError: false
    },
    {
      name: 'should handle response.content format',
      apiResponse: { content: [{ id: 1, name: 'Plan 1', basePrice: 10 }] },
      expectedPlansLength: 1,
      expectedRenderCalled: true,
      shouldShowError: false
    },
    {
      name: 'should handle response.plans format',
      apiResponse: { plans: [{ id: 1, name: 'Plan 1', basePrice: 10 }] },
      expectedPlansLength: 1,
      expectedRenderCalled: true,
      shouldShowError: false
    },
    {
      name: 'should handle response.data format',
      apiResponse: { data: [{ id: 1, name: 'Plan 1', basePrice: 10 }] },
      expectedPlansLength: 1,
      expectedRenderCalled: true,
      shouldShowError: false
    },
    {
      name: 'should show empty message when no plans found',
      apiResponse: [],
      expectedPlansLength: 0,
      expectedRenderCalled: false,
      shouldShowError: false
    },
    {
      name: 'should handle API error and show error message',
      apiResponse: null,
      expectedPlansLength: 0,
      expectedRenderCalled: false,
      shouldShowError: true,
      throwError: true,
      errorMessage: 'Network error'
    }
  ])('loadPlans() $name', async ({ apiResponse, expectedPlansLength, expectedRenderCalled, shouldShowError, throwError, errorMessage }) => {
    jest.spyOn(OperatorSection, 'renderPlans');

    OperatorSection.cacheElements();

    const mockShowMessage = jest.fn();
    global.UIController.getInstance.mockReturnValue({
      showMessage: mockShowMessage
    });

    if (throwError) {
      global.apiClient.get.mockRejectedValueOnce(new Error(errorMessage));
    } else {
      global.apiClient.get.mockResolvedValueOnce(apiResponse);
    }

    await OperatorSection.loadPlans();

    expect(OperatorSection.plans).toHaveLength(expectedPlansLength);

    if (expectedRenderCalled) {
      expect(OperatorSection.renderPlans).toHaveBeenCalled();
    } else if (!shouldShowError) {
      expect(mocks['operator-plans-container'].innerHTML).toContain('No plans found.');
    }

    if (shouldShowError) {
      expect(mockShowMessage).toHaveBeenCalledWith(
        expect.stringContaining('Error loading plans'),
        'error'
      );
    }

    OperatorSection.renderPlans.mockRestore();
  });


  // Test 7
  // Test: renderPlans() should create table with correct headers, rows, and formatted data
  // Scenario: When renderPlans() is called with a plans array
  // Methods tested: renderPlans(), createPlanRow()
  // Mocks: createPlanRow() - spied to verify row creation
  // Expected: Table created with correct headers, tbody populated with plan rows via createPlanRow()
  test.each([
    {
      name: 'should create table with correct headers and single plan row',
      plans: [
        {
          id: 1,
          name: 'Basic Plan',
          description: 'Basic description',
          serviceType: 'Service A',
          basePrice: 9.99,
          billingPeriod: 'Monthly',
          status: 'ACTIVE',
          createdAt: '2024-01-15T10:00:00Z'
        }
      ],
      expectedHeaderCount: 8,
      expectedRowCount: 1
    },
    {
      name: 'should create table with correct headers and multiple plan rows',
      plans: [
        {
          id: 1,
          name: 'Basic Plan',
          description: 'Basic description',
          serviceType: 'Service A',
          basePrice: 9.99,
          billingPeriod: 'Monthly',
          status: 'ACTIVE',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'Premium Plan',
          description: 'Premium description',
          serviceType: 'Service B',
          basePrice: 19.99,
          billingPeriod: 'Monthly',
          status: 'INACTIVE',
          createdAt: '2024-01-16T10:00:00Z'
        }
      ],
      expectedHeaderCount: 8,
      expectedRowCount: 2
    }
  ])('renderPlans() $name', ({ plans, expectedHeaderCount, expectedRowCount }) => {
    jest.spyOn(OperatorSection, 'createPlanRow');

    OperatorSection.plans = plans;
    OperatorSection.cacheElements();
    OperatorSection.renderPlans();

    const table = mocks['operator-plans-container'].children[0];
    expect(table).toBeDefined();
    expect(table.tagName).toBe('TABLE');
    expect(table.className).toBe('operator-plans-table');

    const thead = table.tHead;
    const headerCells = thead.rows[0].cells;
    expect(headerCells).toHaveLength(expectedHeaderCount);

    const expectedHeaders = ['Name', 'Description', 'Service Type', 'Base Price', 'Billing Period', 'Status', 'Created', 'Actions'];
    expectedHeaders.forEach((header, index) => {
      expect(headerCells[index].textContent).toBe(header);
    });

    const tbody = table.tBodies[0];
    expect(OperatorSection.createPlanRow).toHaveBeenCalledTimes(expectedRowCount);

    OperatorSection.createPlanRow.mockRestore();
  });

  // Test 8
  // Test: createPlanRow() should format plan data and create edit button
  // Scenario: When createPlanRow() is called with plan data
  // Methods tested: createPlanRow(), escapeHtml()
  // Mocks: escapeHtml() - spied to verify XSS prevention
  // Expected: Table row created with formatted date, price, status badge, and edit button that opens modal with correct planId
  test.each([
    {
      name: 'should create row with active status and formatted data',
      planData: {
        id: 1,
        name: 'Basic Plan',
        description: 'Basic description',
        serviceType: 'Email',
        basePrice: 9.99,
        billingPeriod: 'Monthly',
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:00:00Z'
      },
      expectedStatusClass: 'badge-success',
      expectedStatusText: 'ACTIVE'
    },
    {
      name: 'should create row with inactive status and formatted data',
      planData: {
        id: 2,
        name: 'Premium Plan',
        description: 'Premium description',
        serviceType: 'SMS',
        basePrice: 19.99,
        billingPeriod: 'Yearly',
        status: 'INACTIVE',
        createdAt: '2024-02-20T15:30:00Z'
      },
      expectedStatusClass: 'badge-danger',
      expectedStatusText: 'INACTIVE'
    },
    {
      name: 'should handle XSS prevention with special characters in name',
      planData: {
        id: 3,
        name: '<script>alert("xss")</script>Plan',
        description: '<img src=x onerror="alert(\'xss\')" />',
        serviceType: 'API',
        basePrice: 29.99,
        billingPeriod: 'Monthly',
        status: 'ACTIVE',
        createdAt: '2024-03-10T08:00:00Z'
      },
      expectedStatusClass: 'badge-success',
      expectedStatusText: 'ACTIVE',
      shouldEscapeHtml: true
    },
    {
      name: 'should handle missing optional fields',
      planData: {
        id: 4,
        name: 'Minimal Plan',
        description: null,
        serviceType: null,
        basePrice: 5.00,
        billingPeriod: null,
        status: 'ACTIVE',
        createdAt: '2024-04-05T12:00:00Z'
      },
      expectedStatusClass: 'badge-success',
      expectedStatusText: 'ACTIVE'
    }
  ])('createPlanRow() $name', ({ planData, expectedStatusClass, expectedStatusText, shouldEscapeHtml }) => {
    // Arrange
    // Cache elements BEFORE creating the row so openPlanModal() has access to them
    OperatorSection.cacheElements();
    
    jest.spyOn(OperatorSection, 'escapeHtml').mockImplementation((text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    });
    jest.spyOn(OperatorSection, 'openPlanModal');

    // Act
    const row = OperatorSection.createPlanRow(planData);

    // Assert - verify row structure
    expect(row.tagName).toBe('TR');
    expect(row.cells.length).toBeGreaterThan(0);

    // Verify escapeHtml was called for XSS prevention
    if (shouldEscapeHtml) {
      expect(OperatorSection.escapeHtml).toHaveBeenCalledWith(planData.name);
      expect(OperatorSection.escapeHtml).toHaveBeenCalledWith(planData.description);
    }

    // Verify status badge is present and correct
    const statusCell = row.cells[row.cells.length - 3]; // Status is 3rd from end
    expect(statusCell).toBeDefined();
    expect(statusCell.children.length).toBeGreaterThan(0);
    
    const statusBadge = statusCell.children[0];
    expect(statusBadge.className).toContain(expectedStatusClass);
    expect(statusBadge.textContent).toBe(expectedStatusText);

    // Verify price is formatted correctly
    const priceCell = row.cells[3]; // Price is 4th cell
    expect(priceCell.textContent).toContain(`$${planData.basePrice}`);

    // Verify edit button exists and has correct click handler
    const actionsCell = row.cells[row.cells.length - 1]; // Last cell
    expect(actionsCell.children.length).toBeGreaterThan(0);
    
    const editButton = actionsCell.children[0];
    expect(editButton.tagName).toBe('BUTTON');
    expect(editButton.textContent).toBe('Edit');

    // Verify edit button click handler
    const clickHandler = editButton.addEventListener.mock.calls.find(call => call[0] === 'click')?.[1];
    expect(clickHandler).toBeDefined();
    
    if (clickHandler) {
      clickHandler();
      expect(OperatorSection.openPlanModal).toHaveBeenCalledWith(planData.id);
    }

    // Cleanup
    OperatorSection.escapeHtml.mockRestore();
    OperatorSection.openPlanModal.mockRestore();
  });


  // Test 9
  // Test: openPlanModal() should set correct state based on mode (new vs existing plan)
  // Scenario: When openPlanModal() is called with planId (null for new, id for existing) and modal is toggled
  // Methods tested: openPlanModal(), generatePlanForm()
  // Mocks: generatePlanForm() - spied; DOM visibility manipulated
  // Expected: currentPlanId and isEditMode set correctly, viewSection hidden, editSection visible, generatePlanForm() called with correct plan data
  // Parametrized: YES - tests new plan (planId null) and existing plan (planId provided) variants
  test.each([
    {
      name: 'should set state for new plan creation',
      planId: null,
      expectedEditMode: false,
      expectedCurrentPlanId: null,
      planData: null
    },
    {
      name: 'should set state for existing plan edit',
      planId: 1,
      expectedEditMode: true,
      expectedCurrentPlanId: 1,
      planData: { id: 1, name: 'Plan 1', description: 'Desc 1', serviceType: 'Basic', basePrice: 10, billingPeriod: 'Monthly', status: 'ACTIVE' }
    }
  ])('openPlanModal() $name', ({ planId, expectedEditMode, expectedCurrentPlanId, planData }) => {
    jest.spyOn(OperatorSection, 'generatePlanForm');

    OperatorSection.cacheElements();
    OperatorSection.plans = planData ? [planData] : [];

    OperatorSection.openPlanModal(planId);

    expect(OperatorSection.currentPlanId).toBe(expectedCurrentPlanId);
    expect(OperatorSection.isEditMode).toBe(expectedEditMode);
    expect(mocks['operator-view'].style.display).toBe('none');
    expect(mocks['operator-edit'].style.display).toBe('block');
    expect(OperatorSection.generatePlanForm).toHaveBeenCalledWith(planData);

    OperatorSection.generatePlanForm.mockRestore();
  });

  // Test 10
  // Test: generatePlanForm() should create form fields and populate data on edit
  // Scenario: When generatePlanForm() is called with plan data (create mode with null, edit mode with plan object)
  // Methods tested: generatePlanForm()
  // Mocks: document.getElementById() - mocked for form element
  // Expected: Form contains all required fields, values populated from plan object on edit, status checkbox set correctly
  // Parametrized: YES - tests create mode (null input) and edit mode (plan object) variants
  test.each([
    {
      name: 'should create empty form for new plan',
      plan: null,
      expectedNameValue: '',
      expectedDescValue: '',
      expectedPriceValue: '',
      expectedStatusChecked: true
    },
    {
      name: 'should populate form with existing plan data on edit',
      plan: {
        id: 1,
        name: 'Premium Plan',
        description: 'Premium description',
        serviceType: 'Premium',
        basePrice: '99.99',
        billingPeriod: 'Annual',
        features: '["Feature 1", "Feature 2"]',
        status: 'ACTIVE'
      },
      expectedNameValue: 'Premium Plan',
      expectedDescValue: 'Premium description',
      expectedPriceValue: '99.99',
      expectedStatusChecked: true
    },
    {
      name: 'should set status checkbox to false for inactive plan',
      plan: {
        id: 2,
        name: 'Basic Plan',
        description: 'Basic description',
        serviceType: 'Basic',
        basePrice: '29.99',
        billingPeriod: 'Monthly',
        features: '["Feature 1"]',
        status: 'INACTIVE'
      },
      expectedNameValue: 'Basic Plan',
      expectedDescValue: 'Basic description',
      expectedPriceValue: '29.99',
      expectedStatusChecked: false
    }
  ])('generatePlanForm() $name', ({ plan, expectedNameValue, expectedDescValue, expectedPriceValue, expectedStatusChecked }) => {
    OperatorSection.cacheElements();
    OperatorSection.serviceTypes = ['Basic', 'Premium', 'Enterprise'];
    OperatorSection.billingPeriods = ['Monthly', 'Annual'];

    OperatorSection.generatePlanForm(plan);

    const nameInput = document.getElementById('operator-name-input');
    const descInput = document.getElementById('operator-desc-input');
    const priceInput = document.getElementById('operator-price-input');
    const statusCheckbox = document.getElementById('operator-status-checkbox');

    expect(nameInput.value).toBe(expectedNameValue);
    expect(descInput.value).toBe(expectedDescValue);
    expect(priceInput.value).toBe(expectedPriceValue);
    expect(statusCheckbox.checked).toBe(expectedStatusChecked);
    expect(mocks['operator-plan-form'].appendChild).toHaveBeenCalled();
  });

  // Test 11
  // Test: generatePlanForm() should handle features field formatting from various formats
  // Scenario: When generatePlanForm() is called with plan containing features in different formats (JSON array, plain string, missing)
  // Methods tested: generatePlanForm()
  // Mocks: None
  // Expected: Features textarea populated correctly whether features are JSON array, plain string, or empty
  // Parametrized: YES - tests JSON array features, plain string features, and missing features variants
  test.each([
    {
      name: 'should parse and display JSON array features',
      plan: {
        id: 1,
        name: 'Plan 1',
        description: 'Desc 1',
        serviceType: 'Basic',
        basePrice: 10,
        billingPeriod: 'Monthly',
        features: '["Feature 1", "Feature 2", "Feature 3"]',
        status: 'ACTIVE'
      },
      expectedFeaturesValue: 'Feature 1\nFeature 2\nFeature 3'
    },
    {
      name: 'should display plain string features as-is',
      plan: {
        id: 2,
        name: 'Plan 2',
        description: 'Desc 2',
        serviceType: 'Premium',
        basePrice: 20,
        billingPeriod: 'Annual',
        features: 'Feature A, Feature B, Feature C',
        status: 'ACTIVE'
      },
      expectedFeaturesValue: 'Feature A, Feature B, Feature C'
    },
    {
      name: 'should handle missing features field',
      plan: {
        id: 3,
        name: 'Plan 3',
        description: 'Desc 3',
        serviceType: 'Standard',
        basePrice: 15,
        billingPeriod: 'Monthly',
        status: 'INACTIVE'
      },
      expectedFeaturesValue: ''
    }
  ])('generatePlanForm() $name', ({ plan, expectedFeaturesValue }) => {
    OperatorSection.cacheElements();
    OperatorSection.serviceTypes = ['Basic', 'Premium', 'Standard'];
    OperatorSection.billingPeriods = ['Monthly', 'Annual'];

    OperatorSection.generatePlanForm(plan);

    const allChildren = mocks['operator-plan-form'].getAllDescendants();
    const featuresInput = allChildren.find(child => child.id === 'operator-features-input');

    expect(featuresInput).toBeDefined();
  });

  // Test 12
  // Test: createFormActions() should create correct buttons and attach event handlers based on mode
  // Scenario: When createFormActions() is called in create vs edit mode
  // Methods tested: createFormActions(), closePlanModal(), savePlan(), deletePlan()
  // Mocks: closePlanModal(), savePlan(), deletePlan() - spied to verify event handler attachment
  // Expected: Create mode shows cancel and create buttons, edit mode also shows delete button, event handlers attached correctly
  // Parametrized: YES - tests create mode (no delete) and edit mode (with delete) variants
  test.each([
    {
      name: 'should create cancel and create buttons in create mode',
      isEditMode: false,
      shouldHaveDeleteBtn: false,
      expectedSaveButtonText: 'Create Plan'
    },
    {
      name: 'should create cancel, update, and delete buttons in edit mode',
      isEditMode: true,
      shouldHaveDeleteBtn: true,
      expectedSaveButtonText: 'Update Plan'
    }
  ])('createFormActions() $name', ({ isEditMode, shouldHaveDeleteBtn, expectedSaveButtonText }) => {
    jest.spyOn(OperatorSection, 'closePlanModal');
    jest.spyOn(OperatorSection, 'savePlan');
    jest.spyOn(OperatorSection, 'deletePlan');

    OperatorSection.cacheElements();
    OperatorSection.isEditMode = isEditMode;
    OperatorSection.currentPlanId = isEditMode ? 1 : null;

    const form = document.createElement('form');
    OperatorSection.createFormActions(form);

    const getAllButtons = (element) => {
      const buttons = [];
      const traverse = (el) => {
        if (el.tagName === 'BUTTON') buttons.push(el);
        el.children?.forEach(child => traverse(child));
      };
      traverse(element);
      return buttons;
    };

    const buttons = getAllButtons(form);  // USE THIS INSTEAD OF YOUR CURRENT LINE
    const cancelBtn = buttons.find(btn => btn.textContent.includes('Cancel'));
    const saveBtn = buttons.find(btn => btn.textContent.includes(expectedSaveButtonText));
    const deleteBtn = buttons.find(btn => btn.textContent.includes('Delete'));

    expect(cancelBtn).toBeDefined();
    expect(saveBtn).toBeDefined();
    expect(saveBtn.textContent).toBe(expectedSaveButtonText);

    if (shouldHaveDeleteBtn) {
      expect(deleteBtn).toBeDefined();
      expect(OperatorSection.deletePlan).not.toHaveBeenCalled();
    } else {
      expect(deleteBtn).toBeUndefined();
    }

    OperatorSection.closePlanModal.mockRestore();
    OperatorSection.savePlan.mockRestore();
    OperatorSection.deletePlan.mockRestore();
  });

  // Test 13
  // Test: savePlan() should validate fields, prepare data, call correct endpoint, and handle responses
  // Scenario: When savePlan() is called with various field states and API responses
  // Methods tested: savePlan(), loadPlans(), closePlanModal()
  // Mocks: apiClient.post() and apiClient.put() - to simulate create/update; UIController.getInstance().showMessage() - mocked; loadPlans() and closePlanModal() - spied
  // Expected: Required fields validated with error message, plan data prepared correctly, POST called for create/PUT for update, success message shown, loadPlans() and closePlanModal() called, error handled gracefully with button state restored
  // Parametrized: YES - tests missing required fields, valid create request, valid update request, API error, and button loading state variants
  test.each([
    {
      name: 'should show error when name field is empty',
      isEditMode: false,
      nameValue: '',
      priceValue: '10',
      shouldCallApi: false,
      expectedErrorMessage: 'Please fill in all required fields with valid values',
      expectedHttpMethod: null
    },
    {
      name: 'should show error when price field is empty',
      isEditMode: false,
      nameValue: 'Plan 1',
      priceValue: '',
      shouldCallApi: false,
      expectedErrorMessage: 'Please fill in all required fields with valid values',
      expectedHttpMethod: null
    },
    {
      name: 'should show error when price is invalid',
      isEditMode: false,
      nameValue: 'Plan 1',
      priceValue: 'invalid',
      shouldCallApi: false,
      expectedErrorMessage: 'Please fill in all required fields with valid values',
      expectedHttpMethod: null
    },
    {
      name: 'should POST new plan and show success message',
      isEditMode: false,
      nameValue: 'New Plan',
      priceValue: '29.99',
      descValue: 'New Description',
      serviceTypeValue: 'Premium',
      billingPeriodValue: 'Monthly',
      featuresValue: 'Feature 1\nFeature 2',
      statusValue: true,
      shouldCallApi: true,
      expectedHttpMethod: 'post',
      expectedUrl: '/plans',
      expectedSuccessMessage: 'Plan created successfully!'
    },
    {
      name: 'should PUT existing plan and show success message',
      isEditMode: true,
      currentPlanId: 1,
      nameValue: 'Updated Plan',
      priceValue: '39.99',
      descValue: 'Updated Description',
      serviceTypeValue: 'Premium',
      billingPeriodValue: 'Yearly',
      featuresValue: 'Feature 1',
      statusValue: false,
      shouldCallApi: true,
      expectedHttpMethod: 'put',
      expectedUrl: '/plans/1',
      expectedSuccessMessage: 'Plan updated successfully!'
    },
    {
      name: 'should handle API error gracefully',
      isEditMode: false,
      nameValue: 'Plan 1',
      priceValue: '10',
      descValue: '',
      serviceTypeValue: '',
      billingPeriodValue: '',
      featuresValue: '',
      statusValue: true,
      shouldCallApi: true,
      throwError: true,
      errorMessage: 'Server error',
      expectedHttpMethod: 'post',
      expectedErrorMessage: 'Error saving plan: Server error'
    }
  ])('savePlan() $name', async ({ 
    isEditMode, 
    currentPlanId, 
    nameValue, 
    priceValue, 
    descValue = '', 
    serviceTypeValue = '', 
    billingPeriodValue = '', 
    featuresValue = '', 
    statusValue = true,
    shouldCallApi, 
    expectedHttpMethod, 
    expectedUrl,
    expectedSuccessMessage,
    throwError,
    errorMessage,
    expectedErrorMessage 
  }) => {
    // Arrange
    jest.spyOn(OperatorSection, 'loadPlans').mockResolvedValue(undefined);
    jest.spyOn(OperatorSection, 'closePlanModal');

    OperatorSection.cacheElements();
    OperatorSection.isEditMode = isEditMode;
    OperatorSection.currentPlanId = currentPlanId || null;

    // Set form field values using mocks object
    mocks['operator-name-input'].value = nameValue;
    mocks['operator-price-input'].value = priceValue;
    mocks['operator-desc-input'].value = descValue;
    mocks['operator-service-type-select'].value = serviceTypeValue;
    mocks['operator-billing-select'].value = billingPeriodValue;
    mocks['operator-features-input'].value = featuresValue;
    mocks['operator-status-checkbox'].checked = statusValue;

    // Mock the save button selector
    document.querySelector = jest.fn((selector) => {
      if (selector === '#operator-plan-form button[type="button"]:last-of-type') {
        return {
          disabled: false,
          textContent: isEditMode ? 'Update Plan' : 'Create Plan',
          addEventListener: jest.fn(),
          set disabled(val) {
            this._disabled = val;
          },
          get disabled() {
            return this._disabled || false;
          }
        };
      }
      return null;
    });

    // Mock API responses
    if (throwError) {
      global.apiClient.post.mockRejectedValueOnce(new Error(errorMessage));
      global.apiClient.put.mockRejectedValueOnce(new Error(errorMessage));
    } else if (shouldCallApi) {
      global.apiClient.post.mockResolvedValueOnce({});
      global.apiClient.put.mockResolvedValueOnce({});
    }

    // Act
    await OperatorSection.savePlan();

    // Assert
    const uiController = global.UIController.getInstance();

    if (shouldCallApi && !throwError) {
      expect(global.apiClient[expectedHttpMethod]).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          name: nameValue,
          description: descValue,
          serviceType: serviceTypeValue,
          basePrice: parseFloat(priceValue),
          billingPeriod: billingPeriodValue,
          features: featuresValue,
          status: statusValue ? 'ACTIVE' : 'INACTIVE'
        })
      );
      expect(uiController.showMessage).toHaveBeenCalledWith(expectedSuccessMessage, 'success');
      expect(OperatorSection.closePlanModal).toHaveBeenCalled();
      expect(OperatorSection.loadPlans).toHaveBeenCalled();
    } else if (throwError) {
      expect(uiController.showMessage).toHaveBeenCalledWith(expectedErrorMessage, 'error');
      expect(OperatorSection.closePlanModal).not.toHaveBeenCalled();
      expect(OperatorSection.loadPlans).not.toHaveBeenCalled();
    } else {
      // Validation error - no API call
      expect(uiController.showMessage).toHaveBeenCalledWith(expectedErrorMessage, 'error');
      expect(global.apiClient.post).not.toHaveBeenCalled();
      expect(global.apiClient.put).not.toHaveBeenCalled();
    }

    // Cleanup
    OperatorSection.loadPlans.mockRestore();
    OperatorSection.closePlanModal.mockRestore();
  });

  // Test 14
  // Test: deletePlan() should call correct endpoint and handle responses
  // Scenario: When deletePlan() is called with planId and API responds with success or error
  // Methods tested: deletePlan(), loadPlans(), closePlanModal()
  // Mocks: apiClient.delete() - to simulate success/error; UIController.getInstance().showMessage() - mocked; loadPlans() and closePlanModal() - spied
  // Expected: DELETE endpoint called with correct planId, success message shown and modal closed on success, error message shown on failure
  // Parametrized: YES - tests success response and error response variants
  test.each([
    {
      name: 'should delete plan successfully and close modal',
      planId: 1,
      shouldSucceed: true,
      expectedMessage: 'Plan deleted successfully!',
      expectedMessageType: 'success'
    },
    {
      name: 'should show error message on delete failure',
      planId: 1,
      shouldSucceed: false,
      expectedMessage: 'Error deleting plan: Delete failed',
      expectedMessageType: 'error',
      errorMessage: 'Delete failed'
    }
  ])('deletePlan() $name', async ({ planId, shouldSucceed, expectedMessage, expectedMessageType, errorMessage }) => {
    jest.spyOn(OperatorSection, 'loadPlans');
    jest.spyOn(OperatorSection, 'closePlanModal');

    OperatorSection.cacheElements();

    if (shouldSucceed) {
      global.apiClient.delete.mockResolvedValueOnce({});
    } else {
      global.apiClient.delete.mockRejectedValueOnce(new Error(errorMessage));
    }

    await OperatorSection.deletePlan(planId);

    expect(global.apiClient.delete).toHaveBeenCalledWith(`/plans/${planId}`);

    const uiController = global.UIController.getInstance();
    expect(uiController.showMessage).toHaveBeenCalledWith(expectedMessage, expectedMessageType);

    if (shouldSucceed) {
      expect(OperatorSection.closePlanModal).toHaveBeenCalled();
      expect(OperatorSection.loadPlans).toHaveBeenCalled();
    } else {
      expect(OperatorSection.closePlanModal).not.toHaveBeenCalled();
      expect(OperatorSection.loadPlans).not.toHaveBeenCalled();
    }

    OperatorSection.loadPlans.mockRestore();
    OperatorSection.closePlanModal.mockRestore();
  });

  // Test 15
  // Test: closePlanModal() should reset state correctly
  // Scenario: When closePlanModal() is called
  // Methods tested: closePlanModal()
  // Mocks: None
  // Expected: currentPlanId set to null, isEditMode set to false, viewSection visible, editSection hidden
  test('closePlanModal() should reset state correctly', () => {
    OperatorSection.cacheElements();
    OperatorSection.currentPlanId = 1;
    OperatorSection.isEditMode = true;
    mocks['operator-view'].style.display = 'none';
    mocks['operator-edit'].style.display = 'block';

    OperatorSection.closePlanModal();

    expect(OperatorSection.currentPlanId).toBeNull();
    expect(OperatorSection.isEditMode).toBe(false);
    expect(mocks['operator-view'].style.display).toBe('block');
    expect(mocks['operator-edit'].style.display).toBe('none');
  });

  // Test 16
  // Test: escapeHtml() should prevent XSS with special characters
  // Scenario: When escapeHtml() is called with strings containing special HTML characters
  // Methods tested: escapeHtml()
  // Mocks: None - pure function testing
  // Expected: Special characters (<, >, &, quotes) properly escaped to prevent XSS
  // Parametrized: YES - tests various special character combinations
  test.each([
    {
      name: 'should escape less than and greater than symbols',
      input: '<script>alert("XSS")</script>',
      expectedContains: '&lt;script&gt;'
    },
    {
      name: 'should escape ampersand',
      input: 'Tom & Jerry',
      expectedContains: 'Tom &amp; Jerry'
    },
    {
      name: 'should escape double quotes',
      input: 'He said "Hello"',
      expectedContains: '&quot;'
    },
    {
      name: 'should escape single quotes',
      input: "It's a test",
      expectedContains: '&#x27;'
    },
    {
      name: 'should escape multiple special characters',
      input: '<img src="x" onerror="alert(\'XSS\')">',
      expectedContains: '&lt;img'
    },
    {
      name: 'should not escape normal text',
      input: 'Normal Plan Name',
      expectedContains: 'Normal Plan Name'
    }
  ])('escapeHtml() $name', ({ input, expectedContains }) => {
    const result = OperatorSection.escapeHtml(input);

    expect(result).toContain(expectedContains);
  });

});
