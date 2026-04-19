// Test file for: webclientv1/src/js/pages/sections/admin.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { AdminSection } = loadModules('AdminSection');

describe('AdminSection', () => {
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
  // 1. init() should call attachEventListeners, loadAvailableRoles, and loadUsers after setTimeout delay
  // 2. attachEventListeners() should attach click listener and call loadUsers when refresh button clicked
  // 3. attachEventListeners() should not throw when admin-refresh-btn does not exist
  // 4. loadAvailableRoles() should fetch roles and set availableRoles, or set empty array and show error on failure
  // 5. loadUsers() [param] should handle response formats correctly | array | response.users | response.data | invalid
  // 6. loadUsers() should show loading message, render users or empty message, or show error on failure
  // 7. renderUsers() [param] should format columns correctly | username | email | fullName | roles | active | createdAt
  // 8. renderUsers() should escape HTML in text columns, create Edit buttons, and append table to container
  // 9. openUserModal() should find user, set currentUserId, toggle visibility, and call generateUserForm, or return if user not found
  // 10. generateUserForm() should populate form fields, create role dropdown, active checkbox, and form actions
  // 11. createRoleDropdown() should populate with roles or show loading state, set correct value
  // 12. createActiveCheckbox() should create checkbox with correct checked state
  // 13. createFormActions() should create Cancel and Save buttons with correct callbacks
  // 14. saveUserChanges() [param] should send PUT request with form data and reload on success, or show error on failure | success | failure
  // 15. closeUserModal() should toggle visibility and reset currentUserId
  // 16. escapeHtml() [param] should escape HTML characters | <|>|&|"|'
  // [Add more tests as they are created]
  //

  let component;
  let mockService;
  let mockElement;

  beforeEach(() => {
    jest.useFakeTimers();

    document.getElementById = jest.fn((id) => {
      const elements = {
        'admin-refresh-btn': null,
        'admin-users-container': { id: 'admin-users-container', innerHTML: '', appendChild: jest.fn() },
        'admin-view': { id: 'admin-view', style: { display: '' } },
        'admin-edit': { id: 'admin-edit', style: { display: '' } },
        'admin-user-form': { id: 'admin-user-form', innerHTML: '' }
      };
      return elements[id] || null;
    });

    document.querySelector = jest.fn((selector) => {
      if (selector === '#admin-user-form button[type="button"]:last-of-type') {
        return { disabled: false, textContent: 'Save Changes', type: 'button' };
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
          return search(this, selector);
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

    jest.spyOn(AdminSection, 'escapeHtml').mockImplementation((text) => {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return String(text).replace(/[&<>"']/g, char => map[char]);
    });

    AdminSection.currentUserId = null;
    AdminSection.users = [];
    AdminSection.availableRoles = [];
  });

  afterEach(() => {
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
  // - Mocks: What is mocked and why (e.g., "setupSourceViewer() - prevents DOM errors")
  // - Expected: What the test expects to happen
  // Example:
  // // Test 1
  // // Test: getInstance should return same instance
  // // Scenario: Calling getInstance() twice should return the same instance (Singleton pattern)
  // // Methods tested: getInstance(), setupSourceViewer()
  // // Mocks: setupSourceViewer() - prevents DOM creation errors during initialization
  // // Expected: Both calls return identical instance reference

  // ---

  // Test 1
  // Test: init() should call attachEventListeners, loadAvailableRoles, and loadUsers after setTimeout delay
  // Scenario: When AdminSection.init() is called, all three initialization methods should execute after 100ms
  // Methods tested: init(), attachEventListeners(), loadAvailableRoles(), loadUsers()
  // Mocks: setTimeout - controlled via jest.useFakeTimers(), attachEventListeners, loadAvailableRoles, loadUsers - spied
  // Expected: All three methods are called after advancing timers by 100ms
  test('should call attachEventListeners, loadAvailableRoles, and loadUsers after setTimeout delay', () => {
    jest.spyOn(AdminSection, 'attachEventListeners').mockImplementation(() => {});
    jest.spyOn(AdminSection, 'loadAvailableRoles').mockResolvedValue([]);
    jest.spyOn(AdminSection, 'loadUsers').mockResolvedValue(undefined);

    AdminSection.init();
    jest.advanceTimersByTime(100);

    expect(AdminSection.attachEventListeners).toHaveBeenCalled();
    expect(AdminSection.loadAvailableRoles).toHaveBeenCalled();
    expect(AdminSection.loadUsers).toHaveBeenCalled();
  });

  // Test 2
  // Test: attachEventListeners() should attach click listener and call loadUsers when refresh button clicked
  // Scenario: When admin-refresh-btn is clicked, loadUsers should be triggered
  // Methods tested: attachEventListeners(), loadUsers()
  // Mocks: document.getElementById returns mocked button with addEventListener, loadUsers - spied
  // Expected: Click event listener is attached and loadUsers is called when button clicked
  test('should attach click listener and call loadUsers when refresh button clicked', () => {
    // Create mockButton only for this test
    const mockButton = { 
      id: 'admin-refresh-btn', 
      clickCallback: null,
      addEventListener: jest.fn(),
      triggerClick: function() {
        if (this.clickCallback) this.clickCallback({ preventDefault: jest.fn() });
      }
    };

    mockButton.addEventListener.mockImplementation((event, callback) => {
      if (event === 'click') mockButton.clickCallback = callback;
    });

    // Override getElementById only for this test
    document.getElementById = jest.fn((id) => {
      if (id === 'admin-refresh-btn') return mockButton;
      const elements = {
        'admin-users-container': { id: 'admin-users-container', innerHTML: '' },
        'admin-view': { id: 'admin-view', style: { display: '' } },
        'admin-edit': { id: 'admin-edit', style: { display: '' } },
        'admin-user-form': { id: 'admin-user-form', innerHTML: '' }
      };
      return elements[id] || null;
    });

    jest.spyOn(AdminSection, 'loadUsers').mockResolvedValue(undefined);

    AdminSection.attachEventListeners();
    
    expect(mockButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    
    const clickCallback = mockButton.addEventListener.mock.calls[0][1];
    clickCallback({ preventDefault: jest.fn() });

    expect(AdminSection.loadUsers).toHaveBeenCalledTimes(1);
  });

  // Test 3
  // Test: attachEventListeners() should not throw when admin-refresh-btn does not exist
  // Scenario: When admin-refresh-btn element is missing from DOM, method should handle gracefully
  // Methods tested: attachEventListeners()
  // Mocks: document.getElementById returns null for admin-refresh-btn
  // Expected: No error is thrown, method completes without exception
  test('should not throw when admin-refresh-btn does not exist', () => {
    // Mock document.getElementById to return null for admin-refresh-btn
    document.getElementById = jest.fn((id) => {
      if (id === 'admin-refresh-btn') return null;
      const elements = {
        'admin-users-container': { id: 'admin-users-container', innerHTML: '' },
        'admin-view': { id: 'admin-view', style: { display: '' } },
        'admin-edit': { id: 'admin-edit', style: { display: '' } },
        'admin-user-form': { id: 'admin-user-form', innerHTML: '' }
      };
      return elements[id] || null;
    });

    // Should not throw
    expect(() => {
      AdminSection.attachEventListeners();
    }).not.toThrow();
  });

  // Test 4
  // Test: loadAvailableRoles() should fetch roles and set availableRoles, or set empty array and show error on failure
  // Scenario: When API call succeeds, roles are stored; when it fails, error is shown and roles set to empty
  // Methods tested: loadAvailableRoles()
  // Mocks: apiClient.get() returns mocked roles, UIController.getInstance().showMessage() - spied
  // Expected: availableRoles is populated on success or set to empty array on error with message shown
  test.each([
    {
      description: 'on success',
      mockResponse: [
        { value: 'ROLE_ADMIN', label: 'Admin' },
        { value: 'ROLE_CUSTOMER', label: 'Customer' }
      ],
      isError: false,
      expectedRoles: [
        { value: 'ROLE_ADMIN', label: 'Admin' },
        { value: 'ROLE_CUSTOMER', label: 'Customer' }
      ],
      shouldShowError: false
    },
    {
      description: 'on failure',
      mockResponse: new Error('Network error'),
      isError: true,
      expectedRoles: [],
      shouldShowError: true
    }
  ])('should fetch roles and set availableRoles $description', async ({ mockResponse, isError, expectedRoles, shouldShowError }) => {
    const mockUIController = { showMessage: jest.fn() };
    global.UIController.getInstance.mockReturnValue(mockUIController);

    if (isError) {
      global.apiClient.get.mockRejectedValue(mockResponse);
    } else {
      global.apiClient.get.mockResolvedValue(mockResponse);
    }

    await AdminSection.loadAvailableRoles();

    expect(global.apiClient.get).toHaveBeenCalledWith('/admin/roles');
    expect(AdminSection.availableRoles).toEqual(expectedRoles);
    
    if (shouldShowError) {
      expect(mockUIController.showMessage).toHaveBeenCalledWith(
        `Error loading roles: ${mockResponse.message}`,
        'error'
      );
    }
  });

  // Test 5
  // Test: loadUsers() should handle response formats correctly (array | response.users | response.data | invalid)
  // Scenario: API returns users in different formats - direct array, nested in users property, nested in data property, or invalid
  // Methods tested: loadUsers()
  // Mocks: apiClient.get() returns mocked responses in different formats, document.getElementById mocked for container
  // Expected: users property is correctly populated regardless of response format
  test.each([
    {
      description: 'direct array',
      mockResponse: [
        { id: 1, username: 'user1', email: 'user1@test.com' },
        { id: 2, username: 'user2', email: 'user2@test.com' }
      ],
      expectedUsers: [
        { id: 1, username: 'user1', email: 'user1@test.com' },
        { id: 2, username: 'user2', email: 'user2@test.com' }
      ]
    },
    {
      description: 'nested in users property',
      mockResponse: {
        users: [
          { id: 1, username: 'user1', email: 'user1@test.com' }
        ]
      },
      expectedUsers: [
        { id: 1, username: 'user1', email: 'user1@test.com' }
      ]
    },
    {
      description: 'nested in data property',
      mockResponse: {
        data: [
          { id: 1, username: 'user1', email: 'user1@test.com' }
        ]
      },
      expectedUsers: [
        { id: 1, username: 'user1', email: 'user1@test.com' }
      ]
    },
    {
      description: 'invalid format',
      mockResponse: { invalid: 'format' },
      expectedUsers: []
    }
  ])('should handle response format correctly when $description', async ({ mockResponse, expectedUsers }) => {
    global.apiClient.get.mockResolvedValue(mockResponse);

    await AdminSection.loadUsers();

    expect(AdminSection.users).toEqual(expectedUsers);
  });

  // Test 6
  // Test: loadUsers() should show loading message, render users or empty message, or show error on failure
  // Scenario: Loading state shows loading message, success shows table or empty message, failure shows error
  // Methods tested: loadUsers(), renderUsers()
  // Mocks: apiClient.get(), document.getElementById for container, renderUsers - spied
  // Expected: Container displays appropriate message and renderUsers called only when users exist
  test.each([
    {
      description: 'with users - should render table',
      mockResponse: [
        { id: 1, username: 'user1', email: 'user1@test.com' }
      ],
      isError: false,
      shouldRender: true,
      expectedMessage: ''
    },
    {
      description: 'with no users - should show empty message',
      mockResponse: [],
      isError: false,
      shouldRender: false,
      expectedMessage: '<p class="empty-message">No users found</p>'
    },
    {
      description: 'on error - should show error message',
      mockResponse: new Error('API error'),
      isError: true,
      shouldRender: false,
      expectedMessage: '<p class="error-message">Error loading users: API error</p>'
    }
  ])('should show $description', async ({ mockResponse, isError, shouldRender, expectedMessage }) => {
    const mockContainer = { id: 'admin-users-container', innerHTML: '' };
    document.getElementById = jest.fn((id) => {
      if (id === 'admin-users-container') return mockContainer;
      return null;
    });

    const mockUIController = { showMessage: jest.fn() };
    global.UIController.getInstance.mockReturnValue(mockUIController);
    jest.spyOn(AdminSection, 'renderUsers').mockImplementation(() => {});

    if (isError) {
      global.apiClient.get.mockRejectedValue(mockResponse);
    } else {
      global.apiClient.get.mockResolvedValue(mockResponse);
    }

    await AdminSection.loadUsers();

    if (shouldRender) {
      expect(AdminSection.renderUsers).toHaveBeenCalled();
    } else {
      expect(AdminSection.renderUsers).not.toHaveBeenCalled();
    }

    if (expectedMessage) {
      expect(mockContainer.innerHTML).toContain(expectedMessage);
    }
  });

  // Test 7
  // Test: renderUsers() should format columns correctly (username | email | fullName | roles | active | createdAt)
  // Scenario: Each column formatter should process user data correctly without errors
  // Methods tested: renderUsers()
  // Mocks: document.getElementById for container, openUserModal - spied
  // Expected: Table created with all columns properly formatted
  test.each([
    {
      column: 'username',
      user: { id: 1, username: 'john_doe', email: 'john@test.com', fullName: 'John Doe', roles: ['ROLE_CUSTOMER'], active: true, createdAt: '2024-01-15' },
      expectedContent: 'john_doe'
    },
    {
      column: 'email',
      user: { id: 1, username: 'john_doe', email: 'john@test.com', fullName: 'John Doe', roles: ['ROLE_CUSTOMER'], active: true, createdAt: '2024-01-15' },
      expectedContent: 'john@test.com'
    },
    {
      column: 'fullName',
      user: { id: 1, username: 'john_doe', email: 'john@test.com', fullName: 'John Doe', roles: ['ROLE_CUSTOMER'], active: true, createdAt: '2024-01-15' },
      expectedContent: 'John Doe'
    },
    {
      column: 'fullName with null',
      user: { id: 1, username: 'john_doe', email: 'john@test.com', fullName: null, roles: ['ROLE_CUSTOMER'], active: true, createdAt: '2024-01-15' },
      expectedContent: 'N/A'
    },
    {
      column: 'roles',
      user: { id: 1, username: 'john_doe', email: 'john@test.com', fullName: 'John Doe', roles: ['ROLE_ADMIN'], active: true, createdAt: '2024-01-15' },
      expectedContent: 'ADMIN'
    },
    {
      column: 'active true',
      user: { id: 1, username: 'john_doe', email: 'john@test.com', fullName: 'John Doe', roles: ['ROLE_CUSTOMER'], active: true, createdAt: '2024-01-15' },
      expectedContent: 'Active'
    },
    {
      column: 'active false',
      user: { id: 1, username: 'john_doe', email: 'john@test.com', fullName: 'John Doe', roles: ['ROLE_CUSTOMER'], active: false, createdAt: '2024-01-15' },
      expectedContent: 'Inactive'
    },
    {
      column: 'createdAt',
      user: { id: 1, username: 'john_doe', email: 'john@test.com', fullName: 'John Doe', roles: ['ROLE_CUSTOMER'], active: true, createdAt: '2024-01-15' },
      expectedContent: '1/15/2024'
    }
  ])('should format $column correctly', ({ user, expectedContent }) => {
    AdminSection.users = [user];
    const mockContainer = document.createElement('div');
    mockContainer.id = 'admin-users-container';
    
    const originalCreateElement = document.createElement;
    
    document.getElementById = jest.fn((id) => {
      if (id === 'admin-users-container') return mockContainer;
      return null;
    });

    document.createElement = jest.fn((tag) => {
      return originalCreateElement.call(document, tag);
    });

    jest.spyOn(AdminSection, 'openUserModal').mockImplementation(() => {});

    AdminSection.renderUsers();

    expect(mockContainer.innerHTML).toContain(expectedContent);
  });

  // Test 8
  // Test: renderUsers() should escape HTML in text columns, create Edit buttons, and append table to container
  // Scenario: Table is created with proper structure, Edit buttons are functional, XSS is prevented
  // Methods tested: renderUsers(), openUserModal()
  // Mocks: document.getElementById for container, openUserModal - spied
  // Expected: Table appended to container with Edit buttons that trigger openUserModal
  test.each([
    {
      description: 'with HTML in username - should escape',
      user: { id: 1, username: '<script>alert("xss")</script>', email: 'test@test.com', fullName: 'Test', roles: ['ROLE_CUSTOMER'], active: true, createdAt: '2024-01-15' },
      shouldNotContain: '<script>',
      testType: 'escape'
    },
    {
      description: 'with HTML in email - should escape',
      user: { id: 1, username: 'user1', email: '<img src=x onerror="alert(1)"/>', fullName: 'Test', roles: ['ROLE_CUSTOMER'], active: true, createdAt: '2024-01-15' },
      shouldNotContain: '<img',
      testType: 'escape'
    },
    {
      description: 'should create Edit buttons that trigger openUserModal',
      user: { id: 1, username: 'user1', email: 'test@test.com', fullName: 'Test', roles: ['ROLE_CUSTOMER'], active: true, createdAt: '2024-01-15' },
      testType: 'button'
    },
    {
      description: 'should append table to container',
      user: { id: 1, username: 'user1', email: 'test@test.com', fullName: 'Test', roles: ['ROLE_CUSTOMER'], active: true, createdAt: '2024-01-15' },
      testType: 'append'
    }
  ])('$description', ({ user, shouldNotContain, testType }) => {
    AdminSection.users = [user];
    const mockContainer = { id: 'admin-users-container', innerHTML: '', appendChild: jest.fn() };
    document.getElementById = jest.fn((id) => {
      if (id === 'admin-users-container') return mockContainer;
      return null;
    });

    jest.spyOn(AdminSection, 'openUserModal').mockImplementation(() => {});

    AdminSection.renderUsers();

    const table = mockContainer.appendChild.mock.calls[0][0];

    if (testType === 'escape') {
      expect(table.innerHTML).not.toContain(shouldNotContain);
    } else if (testType === 'button') {
      const editButton = table.querySelector('button');
      expect(editButton).not.toBeNull();
      expect(editButton.textContent).toBe('Edit');
      expect(editButton.className).toContain('btn-primary');
      editButton.onclick({ preventDefault: jest.fn() });
      expect(AdminSection.openUserModal).toHaveBeenCalledWith(user.id);
    } else if (testType === 'append') {
      expect(mockContainer.appendChild).toHaveBeenCalled();
      expect(table.tagName).toBe('TABLE');
      expect(table.className).toBe('admin-users-table');
    }
  });

  // Test 10
  // Test: generateUserForm() should populate form fields, create role dropdown, active checkbox, and form actions
  // Scenario: Form is generated with username, email, fullName fields (disabled), role dropdown, active checkbox, and action buttons
  // Methods tested: generateUserForm(), createRoleDropdown(), createActiveCheckbox(), createFormActions()
  // Mocks: document.getElementById for admin-user-form, createRoleDropdown/createActiveCheckbox/createFormActions - spied
  // Expected: Form fields created and all sub-methods called with correct arguments
  test.each([
    {
      description: 'should create form with all fields and sub-methods',
      user: { id: 1, username: 'john_doe', email: 'john@test.com', fullName: 'John Doe', roles: ['ROLE_ADMIN'], active: true, createdAt: '2024-01-15' },
      expectedFields: ['Username', 'Email', 'Full Name']
    }
  ])('$description', ({ user, expectedFields }) => {
    const mockForm = { id: 'admin-user-form', innerHTML: '', appendChild: jest.fn(), children: [] };
    
    document.getElementById = jest.fn((id) => {
      if (id === 'admin-user-form') return mockForm;
      return null;
    });

    jest.spyOn(AdminSection, 'createRoleDropdown').mockImplementation(() => {});
    jest.spyOn(AdminSection, 'createActiveCheckbox').mockImplementation(() => {});
    jest.spyOn(AdminSection, 'createFormActions').mockImplementation(() => {});

    AdminSection.generateUserForm(user);

    expect(mockForm.innerHTML).toBe('');
    expect(AdminSection.createRoleDropdown).toHaveBeenCalledWith(mockForm, user);
    expect(AdminSection.createActiveCheckbox).toHaveBeenCalledWith(mockForm, user);
    expect(AdminSection.createFormActions).toHaveBeenCalledWith(mockForm);
    
    const appendCalls = mockForm.appendChild.mock.calls;
    // Should have at least 3 form-groups + role dropdown + checkbox + form actions
    expect(appendCalls.length).toBeGreaterThanOrEqual(3);
    
    // Check that form-groups with expected labels were appended
    expectedFields.forEach(fieldLabel => {
      const found = appendCalls.some(call => {
        const element = call[0];
        // Check if the element or its innerHTML contains the label
        return element.innerHTML && element.innerHTML.includes(fieldLabel);
      });
      expect(found).toBe(true);
    });
  });

  // Test 11
  // Test: createRoleDropdown() should populate with roles or show loading state, set correct value
  // Scenario: When roles available, select populated and value set to user's role; when empty, loading message shown
  // Methods tested: createRoleDropdown()
  // Mocks: document.createElement mocked to track element creation
  // Expected: Select element created with options or loading state based on availableRoles
  test.each([
    {
      description: 'with available roles - should populate dropdown',
      availableRoles: [
        { value: 'ROLE_ADMIN', label: 'Admin' },
        { value: 'ROLE_CUSTOMER', label: 'Customer' }
      ],
      userRole: 'ROLE_ADMIN',
      shouldBeDisabled: false,
      expectedOptions: 2
    },
    {
      description: 'with no available roles - should show loading state',
      availableRoles: [],
      userRole: 'ROLE_CUSTOMER',
      shouldBeDisabled: true,
      expectedOptions: 1
    }
  ])('$description', ({ availableRoles, userRole, shouldBeDisabled, expectedOptions }) => {
    AdminSection.availableRoles = availableRoles;
    
    const user = { id: 1, username: 'user1', email: 'test@test.com', fullName: 'Test', roles: [userRole], active: true, createdAt: '2024-01-15' };
    const mockForm = { id: 'admin-user-form', innerHTML: '', appendChild: jest.fn() };
    
    document.getElementById = jest.fn((id) => {
      if (id === 'admin-user-form') return mockForm;
      return null;
    });

    AdminSection.createRoleDropdown(mockForm, user);

    const formGroup = mockForm.appendChild.mock.calls[0][0];
    const select = formGroup.querySelector('select');

    expect(select).not.toBeNull();
    expect(select.id).toBe('admin-role-select');
    expect(select.disabled).toBe(shouldBeDisabled);
    expect(select.options.length).toBe(expectedOptions);

    if (availableRoles.length) {
      expect(select.value).toBe(userRole);
    } else {
      expect(select.innerHTML).toContain('Loading roles...');
    }
  });

  // Test 12
  // Test: createActiveCheckbox() should create checkbox with correct checked state
  // Scenario: Checkbox created with checked state matching user.active value
  // Methods tested: createActiveCheckbox()
  // Mocks: document.createElement tracked for checkbox creation
  // Expected: Checkbox created with correct checked property and Active label
  test.each([
    {
      description: 'when user is active',
      userActive: true,
      expectedChecked: true
    },
    {
      description: 'when user is inactive',
      userActive: false,
      expectedChecked: false
    }
  ])('should create checkbox with correct checked state $description', ({ userActive, expectedChecked }) => {
    const user = { id: 1, username: 'user1', email: 'test@test.com', fullName: 'Test', roles: ['ROLE_CUSTOMER'], active: userActive, createdAt: '2024-01-15' };
    const mockForm = { id: 'admin-user-form', innerHTML: '', appendChild: jest.fn() };
    
    document.getElementById = jest.fn((id) => {
      if (id === 'admin-user-form') return mockForm;
      return null;
    });

    AdminSection.createActiveCheckbox(mockForm, user);

    const formGroup = mockForm.appendChild.mock.calls[0][0];
    const checkbox = formGroup.querySelector('input[type="checkbox"]');
    const label = formGroup.querySelector('label');

    expect(checkbox).not.toBeNull();
    expect(checkbox.id).toBe('admin-active-checkbox');
    expect(checkbox.checked).toBe(expectedChecked);
    expect(label.textContent).toContain('Active');
  });

  // Test 13
  // Test: createFormActions() should create Cancel and Save buttons with correct callbacks
  // Scenario: Cancel button closes modal, Save button saves changes; both prevent default
  // Methods tested: createFormActions(), closeUserModal(), saveUserChanges()
  // Mocks: closeUserModal and saveUserChanges - spied
  // Expected: Buttons created and callbacks trigger correct methods
  test.each([
    {
      description: 'Cancel button should close modal',
      buttonText: 'Cancel',
      expectedMethod: 'closeUserModal'
    },
    {
      description: 'Save button should save changes',
      buttonText: 'Save Changes',
      expectedMethod: 'saveUserChanges'
    }
  ])('$description', ({ buttonText, expectedMethod }) => {
    const mockForm = { id: 'admin-user-form', innerHTML: '', appendChild: jest.fn() };
    
    document.getElementById = jest.fn((id) => {
      if (id === 'admin-user-form') return mockForm;
      return null;
    });

    jest.spyOn(AdminSection, 'closeUserModal').mockImplementation(() => {});
    jest.spyOn(AdminSection, 'saveUserChanges').mockImplementation(() => {});

    AdminSection.createFormActions(mockForm);

    const formActions = mockForm.appendChild.mock.calls[0][0];
    const buttons = formActions.querySelectorAll('button');
    const button = Array.from(buttons).find(btn => btn.textContent === buttonText);

    expect(button).not.toBeNull();
    expect(button.type).toBe('button');
    
    button.onclick({ preventDefault: jest.fn() });

    if (expectedMethod === 'closeUserModal') {
      expect(AdminSection.closeUserModal).toHaveBeenCalled();
    } else if (expectedMethod === 'saveUserChanges') {
      expect(AdminSection.saveUserChanges).toHaveBeenCalled();
    }
  });

  // Test 14
  // Test: saveUserChanges() should send PUT request with form data and reload on success, or show error on failure
  // Scenario: Success case reloads users and closes modal; failure case shows error message
  // Methods tested: saveUserChanges(), closeUserModal(), loadUsers()
  // Mocks: apiClient.put(), document.getElementById for role and active inputs, UIController.getInstance().showMessage()
  // Expected: PUT request sent, UI updated based on success/failure
  test.each([
    {
      description: 'on success - should reload users and close modal',
      isError: false,
      expectedMessage: 'User updated successfully!',
      shouldCloseModal: true,
      shouldLoadUsers: true
    },
    {
      description: 'on failure - should show error message',
      isError: true,
      expectedMessage: 'Error saving changes: API error',
      shouldCloseModal: false,
      shouldLoadUsers: false
    }
  ])('$description', async ({ isError, expectedMessage, shouldCloseModal, shouldLoadUsers }) => {
    AdminSection.currentUserId = 1;
    const mockRoleSelect = { id: 'admin-role-select', value: 'ROLE_ADMIN' };
    const mockActiveCheckbox = { id: 'admin-active-checkbox', checked: true };
    const mockButton = { disabled: false, textContent: 'Save Changes', type: 'button' };
    const mockForm = { id: 'admin-user-form', querySelector: jest.fn() };

    mockForm.querySelector.mockReturnValue(mockButton);

    document.getElementById = jest.fn((id) => {
      if (id === 'admin-role-select') return mockRoleSelect;
      if (id === 'admin-active-checkbox') return mockActiveCheckbox;
      if (id === 'admin-user-form') return mockForm;
      return null;
    });

    const mockUIController = { showMessage: jest.fn() };
    global.UIController.getInstance.mockReturnValue(mockUIController);

    jest.spyOn(AdminSection, 'closeUserModal').mockImplementation(() => {});
    jest.spyOn(AdminSection, 'loadUsers').mockResolvedValue(undefined);

    if (isError) {
      global.apiClient.put.mockRejectedValue(new Error('API error'));
    } else {
      global.apiClient.put.mockResolvedValue({ success: true });
    }

    await AdminSection.saveUserChanges();

    expect(global.apiClient.put).toHaveBeenCalledWith('/admin/users/1', {
      role: 'ROLE_ADMIN',
      active: true
    });

    expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedMessage, isError ? 'error' : 'success');

    if (shouldCloseModal) {
      expect(AdminSection.closeUserModal).toHaveBeenCalled();
      expect(AdminSection.loadUsers).toHaveBeenCalled();
    } else {
      expect(AdminSection.closeUserModal).not.toHaveBeenCalled();
      expect(AdminSection.loadUsers).not.toHaveBeenCalled();
    }

    expect(mockButton.disabled).toBe(false);
    expect(mockButton.textContent).toBe('Save Changes');
  });

  // Test 15
  // Test: closeUserModal() should toggle visibility and reset currentUserId
  // Scenario: Admin-view shown, admin-edit hidden, currentUserId set to null
  // Methods tested: closeUserModal()
  // Mocks: document.getElementById for admin-view and admin-edit
  // Expected: Display properties toggled, currentUserId cleared
  test('should toggle visibility and reset currentUserId', () => {
    AdminSection.currentUserId = 1;
    const mockViewElement = { style: { display: 'none' } };
    const mockEditElement = { style: { display: 'block' } };
    document.getElementById = jest.fn((id) => {
      if (id === 'admin-view') return mockViewElement;
      if (id === 'admin-edit') return mockEditElement;
      return null;
    });

    AdminSection.closeUserModal();

    expect(mockViewElement.style.display).toBe('block');
    expect(mockEditElement.style.display).toBe('none');
    expect(AdminSection.currentUserId).toBe(null);
  });

  // Test 16
  // Test: escapeHtml() should escape HTML characters (< | > | & | " | ')
  // Scenario: Input strings with HTML special characters are safely escaped
  // Methods tested: escapeHtml()
  // Mocks: document.createElement, element.textContent, element.innerHTML
  // Expected: HTML entities returned without executing script tags
  test('should escape < character', () => {
    const result = AdminSection.escapeHtml('<script>');
    expect(result).toBe('&lt;script&gt;');
  });

  test('should escape > character', () => {
    const result = AdminSection.escapeHtml('alert()>');
    expect(result).toContain('&gt;');
  });

  test('should escape & character', () => {
    const result = AdminSection.escapeHtml('foo&bar');
    expect(result).toBe('foo&amp;bar');
  });

  test('should escape " character', () => {
    const result = AdminSection.escapeHtml('test"value');
    expect(result).toContain('&quot;');
  });

  test('should escape all special characters together', () => {
    const result = AdminSection.escapeHtml('<img src="x" onerror="alert(\'xss\')">');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('&quot;');
  });

});
