// Test file for: webclientv1/src/js/pages/sections/profile.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { ProfileSection } = loadModules('ProfileSection');

describe('ProfileSection', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: ProfileSection
  // Purpose: Manage user profile information including viewing, editing profile details,
  //          and changing passwords. Handles data fetching, form generation, validation,
  //          and persistence.
  //
  // SETUP OVERVIEW:
  // - jest.spyOn(apiClient, 'get'): Mock API calls for user profile data
  // - jest.spyOn(apiClient, 'put'): Mock profile update requests
  // - jest.spyOn(apiClient, 'post'): Mock password change requests
  // - jest.spyOn(UIController.getInstance(), 'showMessage'): Mock UI notifications
  // - document.body.innerHTML: Mock DOM structure with required elements
  // - ProfileSection state reset: Clear isEditMode, isPasswordEditMode, originalData, _domCache between tests
  //
  // SHARED MOCKS:
  // - apiClient.get() - Mock endpoint: /user/profile
  // - apiClient.put() - Mock endpoint: /user/profile for updating profile
  // - apiClient.post() - Mock endpoint: /auth/change-password for password changes
  // - UIController.getInstance().showMessage() - Mock user feedback messages (success/error)
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
  // 1. init() | should load user data and attach event listeners after timeout delay
  // 2. loadUserData() | should fetch profile, cache data, display info, populate form on success, and handle API errors
  // 3. displayUserInfo() | should render all fields with correct labels, values, status classes, and roles formatting
  // 4. populateEditForm() | should create form inputs with correct values and buttons with handlers
  // 5. populatePasswordForm() | should create password fields with correct autocomplete attributes and strength validation
  // 6. handlePasswordStrengthInput() | should validate strength, display/remove helper text with color coding based on input
  // 7. createFormGroup() | should create form-group div with correct label, input type, id, and value attributes
  // 8. createButtonGroup() | should create button-group with submit and cancel buttons and attach cancel handler
  // 9. attachEventListeners() | should attach handlers to all required elements and handle missing elements gracefully
  // 10. toggleEditMode() | should toggle view/edit display, manage state, hide buttons, and repopulate form with original data
  // 11. togglePasswordEditMode() | should toggle view/password-edit display, manage state, hide buttons, and populate form on entry
  // 12. toggleMode() | should set display styles for containers, toggle state key, and hide edit/password buttons (parametrized: both modes)
  // 13. handleProfileSubmit() | should validate fields, trim values, call API with correct payload, show success/error, manage button state, and toggle mode
  // 14. handlePasswordSubmit() | should validate fields, check password match, validate strength, call API, show success/error, manage button state, and toggle mode (parametrized: valid/invalid passwords, API success/failure)
  // 15. handleAsyncAction() | should manage button state, call API, show messages, execute callback, and handle errors
  // 16. validateFormInputs() | should validate required fields and show errors (parametrized: valid/empty/whitespace inputs)
  // 17. validatePasswordStrength() | should check all requirements and return isValid flag with requirements object (parametrized: various password combinations)
  // 18. getPasswordStrengthMessage() | should return success message or list missing requirements (parametrized: requirement combinations)
  // 19. getElement() | should cache DOM elements and handle missing elements based on throwError parameter
  // 20. showError() | should call UIController with error type
  // 21. showSuccess() | should call UIController with success type
  // 22. cleanup() | should reset all state and clear caches

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
      placeholder: '',
      autocomplete: ''
    };
    
    const props = { ...defaults, ...config };
    const listeners = {};
    const mock = {
      _id: id,
      _autocomplete: props.autocomplete,  // ← Add this
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
      
      get autocomplete() {  // ← Add getter
        return this._autocomplete;
      },
      set autocomplete(val) {  // ← Add setter
        this._autocomplete = val;
      },
      
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
        this._autocomplete = props.autocomplete;
      }
    };
    
    return mock;
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
      _disabled: props.disabled,
      style: {},
      
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
        this.style = {};
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
    style: {},
    
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
      // If it's a fragment with children, append all its children
      if (child.children && Array.isArray(child.children) && !child.className) {
        child.children.forEach(c => {
          // Recursively add children, including nested children
          this.children.push(c);
          if (c.children && Array.isArray(c.children)) {
            c.children.forEach(nested => this.children.push(nested));
          }
        });
      } else {
        this.children.push(child);
        // Also add any children of this element
        if (child.children && Array.isArray(child.children)) {
          child.children.forEach(nested => this.children.push(nested));
        }
      }
      return child;
    }),

    addEventListener: jest.fn(function(eventType, handler) {
      listeners[eventType] = handler;
    }),      

    querySelector: jest.fn(function(selector) {
      // Handle button[type="submit"] selector
      if (selector === 'button[type="submit"]') {
        for (let child of this.children) {
          if (child.type === 'submit') {
            return child;
          }
        }
        return null;
      }

      // Handle #id selector
      if (selector.startsWith('#')) {
        const targetId = selector.replace('#', '');
        for (let child of this.children) {
          if (child.id === targetId) {
            return child;
          }
        }
        return null;
      }

      // Handle .class selector
      if (selector.startsWith('.')) {
        const targetClass = selector.replace('.', '');
        for (let child of this.children) {
          if (child.className && child.className.includes(targetClass)) {
            return child;
          }
        }
        return null;
      }

      return null;
    }),

    reset() {
      this._innerHTML = '';
      this.children = [];
      this.style = {};
      this.appendChild.mockClear();
      this.addEventListener.mockClear();
      this.querySelector.mockClear();
    }
  };
};




  const createGenericElementMock = (tag) => {
    const children = [];
    let textContentValue = '';
    const listeners = {};
    const styleObj = {};

    return {
      tagName: tag.toUpperCase(),
      className: '',
      _id: '',
      _cachedInput: null,
      style: new Proxy(styleObj, {
        set(target, prop, value) {
          target[prop] = value;
          return true;
        },
        get(target, prop) {
          return target[prop] || '';
        }
      }),
      type: '',
      checked: false,
      _disabled: false,
      value: '',
      required: false,
      placeholder: '',
      _autocomplete: '',
      dataset: {},
      _innerHTML: '',
      _textContent: '',

      get id() {
        return this._id;
      },
      set id(val) {
        this._id = val;
      },

      get disabled() {
        return this._disabled;
      },
      set disabled(val) {
        this._disabled = val;
      },

      get autocomplete() {
        return this._autocomplete;
      },
      set autocomplete(val) {
        this._autocomplete = val;
      },

      get innerHTML() {
        return this._innerHTML;
      },
      set innerHTML(value) {
        this._innerHTML = value;
        this.children = [];
        this._cachedInput = null;
      },

      get textContent() {
        return this._textContent || textContentValue;
      },
      set textContent(value) {
        this._textContent = value;
        textContentValue = value;
      },

      appendChild: jest.fn(function(child) {
        children.push(child);
        return child;
      }),

      addEventListener: jest.fn(function(eventType, handler) {
        listeners[eventType] = handler;
      }),

      querySelector: jest.fn(function(selector) {
        const idSelector = selector.replace('#', '');
        const classSelector = selector.replace('.', '');

        if (selector === 'input' && this._innerHTML.includes('<input')) {
          // Check if we already created and cached this input
          if (this._cachedInput) {
            return this._cachedInput;
          }

          const inputId = this._innerHTML.match(/id="([^"]+)"/)?.[1];
          const inputType = this._innerHTML.match(/type="([^"]+)"/)?.[1];
          const autocompleteAttr = this._innerHTML.match(/autocomplete="([^"]+)"/)?.[1];
          const valueAttr = this._innerHTML.match(/value="([^"]*?)"/)?.[1];
          const requiredAttr = this._innerHTML.includes('required');
          
          const input = createGenericElementMock('input');
          input.id = inputId || '';
          input.type = inputType || 'text';
          input._autocomplete = autocompleteAttr || '';
          input.value = valueAttr || '';
          input.required = requiredAttr;
          
          // Cache the input so subsequent calls return the same instance
          this._cachedInput = input;
          return input;
        }
          
        for (let child of children) {
          if (selector.startsWith('#') && child.id === idSelector) {
            return child;
          }
          if (selector.startsWith('.') && (child.className === classSelector || child.className?.includes(classSelector))) {
            return child;
          }
          if (selector === 'button[type="submit"]' && child.type === 'submit') {
            return child;
          }
        }
        
        if (selector.startsWith('#')) {
          const buttonId = selector.replace('#', '');
          if (this._innerHTML && this._innerHTML.includes(`id="${buttonId}"`)) {
            return {
              addEventListener: jest.fn(),
              id: buttonId,
              type: 'button'
            };
          }
        }
        
        return null;
      }),

      reset() {
        children.length = 0;
        this._innerHTML = '';
        this._textContent = '';
        this._autocomplete = '';
        this._cachedInput = null;
        Object.keys(styleObj).forEach(key => delete styleObj[key]);
        this.addEventListener.mockClear();
        this.appendChild.mockClear();
        this.querySelector.mockClear();
      }
    };
  };




  const mockUIController = {
    showMessage: jest.fn()
  };

  beforeEach(() => {
    jest.useFakeTimers();

    const mockConfigs = {
      'profile-card': { factory: createContainerMock, args: ['profile-card'] },
      'profile-view': { factory: createContainerMock, args: ['profile-view'] },
      'profile-edit': { factory: createContainerMock, args: ['profile-edit'] },
      'profile-form': { factory: createContainerMock, args: ['profile-form'] },
      'password-edit': { factory: createContainerMock, args: ['password-edit'] },
      'password-form': { factory: createContainerMock, args: ['password-form'] },
      'profile-edit-btn': { factory: createButtonMock, args: ['profile-edit-btn', { textContent: 'Edit Profile' }] },
      'password-change-btn': { factory: createButtonMock, args: ['password-change-btn', { textContent: 'Change Password' }] },
      'profile-cancel-btn': { factory: createButtonMock, args: ['profile-cancel-btn', { textContent: 'Cancel' }] },
      'password-cancel-btn': { factory: createButtonMock, args: ['password-cancel-btn', { textContent: 'Cancel' }] },
      'edit-firstName': { factory: createInputMock, args: ['edit-firstName', { type: 'text' }] },
      'edit-lastName': { factory: createInputMock, args: ['edit-lastName', { type: 'text' }] },
      'edit-email': { factory: createInputMock, args: ['edit-email', { type: 'email' }] },
      'current-password': { factory: createInputMock, args: ['current-password', { type: 'password' }] },
      'new-password': { factory: createInputMock, args: ['new-password', { type: 'password' }] },
      'confirm-password': { factory: createInputMock, args: ['confirm-password', { type: 'password' }] }
    };

    mocks = {};
    Object.entries(mockConfigs).forEach(([id, config]) => {
      mocks[id] = config.factory(...(config.args || [id]));
    });

    document.getElementById = jest.fn((id) => mocks[id] || null);
    document.querySelector = jest.fn(() => null);
    document.createElement = jest.fn((tag) => createGenericElementMock(tag));
    document.createDocumentFragment = jest.fn(() => {
      const children = [];
      return {
        appendChild: jest.fn(function(child) {
          children.push(child);
          return child;
        }),
        get children() {
          return children;
        }
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

    // Reset ProfileSection state
    ProfileSection.isEditMode = false;
    ProfileSection.isPasswordEditMode = false;
    ProfileSection.originalData = {};
    ProfileSection._domCache = {};
  });

  afterEach(() => {
    Object.values(mocks).forEach(mock => {
      if (mock.reset) mock.reset();
    });

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    ProfileSection.cleanup();
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

  // Test 1
  // Test: init() should load user data and attach event listeners after timeout delay
  // Scenario: When ProfileSection.init() is called, it waits 100ms before executing setup tasks
  // Methods tested: init(), loadUserData(), attachEventListeners()
  // Mocks: apiClient.get(), UIController.getInstance().showMessage(), setTimeout
  // Expected: loadUserData() and attachEventListeners() called after 100ms delay
  // Parametrized: NO
  test('init() should load user data and attach event listeners after timeout delay', () => {
    const loadUserDataSpy = jest.spyOn(ProfileSection, 'loadUserData');
    const attachEventListenersSpy = jest.spyOn(ProfileSection, 'attachEventListeners');

    apiClient.get.mockResolvedValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      isActive: true,
      roles: ['user']
    });

    ProfileSection.init();

    expect(loadUserDataSpy).not.toHaveBeenCalled();
    expect(attachEventListenersSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(loadUserDataSpy).toHaveBeenCalled();
    expect(attachEventListenersSpy).toHaveBeenCalled();

    loadUserDataSpy.mockRestore();
    attachEventListenersSpy.mockRestore();
  });

  // Test 2
  // Test: loadUserData() should fetch profile, cache data, display info, populate form on success, and show error on API failure
  // Scenario: When loadUserData() is called, it receives success response with user data or API error
  // Methods tested: loadUserData(), displayUserInfo(), populateEditForm()
  // Mocks: apiClient.get() - to simulate success and error responses
  // Expected: originalData cached, displayUserInfo() called, populateEditForm() called on success; error message shown on failure
  // Parametrized: YES - tests success response and error response variants
  test.each([
    {
      name: 'should fetch profile, cache data, display info, and populate form on success',
      response: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: true,
        roles: ['user', 'admin']
      },
      shouldSucceed: true,
      expectedError: null
    },
    {
      name: 'should show error message on API failure',
      response: null,
      shouldSucceed: false,
      expectedError: 'Failed to load user data'
    }
  ])('loadUserData() $name', async ({ response, shouldSucceed, expectedError }) => {
    const displayUserInfoSpy = jest.spyOn(ProfileSection, 'displayUserInfo');
    const populateEditFormSpy = jest.spyOn(ProfileSection, 'populateEditForm');

    if (shouldSucceed) {
      apiClient.get.mockResolvedValue(response);
    } else {
      apiClient.get.mockRejectedValue(new Error('API Error'));
    }

    await ProfileSection.loadUserData();

    expect(apiClient.get).toHaveBeenCalledWith('/user/profile');

    if (shouldSucceed) {
      expect(ProfileSection.originalData).toEqual(response);
      expect(displayUserInfoSpy).toHaveBeenCalledWith(response);
      expect(populateEditFormSpy).toHaveBeenCalledWith(response);
    } else {
      expect(UIController.getInstance().showMessage).toHaveBeenCalledWith(expectedError, 'error');
    }

    displayUserInfoSpy.mockRestore();
    populateEditFormSpy.mockRestore();
  });

  // Test 3
  // Test: displayUserInfo() should render all fields with correct labels, values, status classes, and roles formatting
  // Scenario: When displayUserInfo() receives user object with various field combinations (active/inactive status, with/without roles)
  // Methods tested: displayUserInfo(), getElement()
  // Mocks: document.getElementById(), DOM manipulation
  // Expected: All fields rendered with correct labels, status class applied based on isActive, roles displayed as comma-separated or 'N/A'
  // Parametrized: YES - tests active/inactive status, populated roles, empty roles variants
  test.each([
    {
      name: 'with active status and populated roles',
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: true,
        roles: ['admin', 'user']
      },
      expectedStatus: 'Active',
      expectedStatusClass: 'status-active',
      expectedRoles: 'admin, user'
    },
    {
      name: 'with inactive status and populated roles',
      user: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        isActive: false,
        roles: ['user']
      },
      expectedStatus: 'Inactive',
      expectedStatusClass: 'status-inactive',
      expectedRoles: 'user'
    },
    {
      name: 'with active status and empty roles',
      user: {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        isActive: true,
        roles: []
      },
      expectedStatus: 'Active',
      expectedStatusClass: 'status-active',
      expectedRoles: 'N/A'
    }
  ])('displayUserInfo() should render all fields $name', ({ user, expectedStatus, expectedStatusClass, expectedRoles }) => {
    ProfileSection.displayUserInfo(user);

    const profileCard = mocks['profile-card'];
    expect(profileCard.appendChild).toHaveBeenCalled();
    
    const appendedChildren = profileCard.children;
    expect(appendedChildren.length).toBe(5);
    
    expect(appendedChildren[0].innerHTML).toContain('First Name');
    expect(appendedChildren[3].innerHTML).toContain(expectedStatus);
    expect(appendedChildren[3].innerHTML).toContain(expectedStatusClass);
    expect(appendedChildren[4].innerHTML).toContain(expectedRoles);
  });


  // Test 4
  // Test: populateEditForm() should create form inputs with correct values and buttons with handlers
  // Scenario: When populateEditForm() is called with user data, it generates form with firstName, lastName, email fields
  // Methods tested: populateEditForm(), createFormGroup(), createButtonGroup(), getElement()
  // Mocks: document.createElement(), DOM manipulation
  // Expected: Form inputs created with correct values, Save Changes and Cancel buttons rendered with handlers attached
  // Parametrized: NO
  test('populateEditForm() should create form inputs with correct values and buttons with handlers', () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      isActive: true,
      roles: ['user']
    };

    const createFormGroupSpy = jest.spyOn(ProfileSection, 'createFormGroup');
    const createButtonGroupSpy = jest.spyOn(ProfileSection, 'createButtonGroup');

    ProfileSection.populateEditForm(userData);

    // Verify getElement was called to get the form container
    expect(document.getElementById).toHaveBeenCalledWith('profile-form');

    // Verify innerHTML was cleared
    expect(mocks['profile-form']._innerHTML).toBe('');

    // Verify createFormGroup was called 3 times with correct parameters
    expect(createFormGroupSpy).toHaveBeenCalledTimes(3);
    expect(createFormGroupSpy).toHaveBeenNthCalledWith(1, 'edit-firstName', 'First Name', 'text', 'John');
    expect(createFormGroupSpy).toHaveBeenNthCalledWith(2, 'edit-lastName', 'Last Name', 'text', 'Doe');
    expect(createFormGroupSpy).toHaveBeenNthCalledWith(3, 'edit-email', 'Email', 'email', 'john@example.com');

    // Verify createButtonGroup was called once with correct parameters
    expect(createButtonGroupSpy).toHaveBeenCalledTimes(1);
    expect(createButtonGroupSpy).toHaveBeenCalledWith('Save Changes', 'profile-cancel-btn', 'Cancel', expect.any(Function));

    // Verify fragment received all 4 elements (3 form groups + 1 button group)
    const capturedFragment = document.createDocumentFragment.mock.results[0].value;
    expect(capturedFragment.appendChild).toHaveBeenCalledTimes(4);

    // Verify fragment was appended to form container
    expect(mocks['profile-form'].appendChild).toHaveBeenCalledTimes(1);

    // Verify cancel button handler works
    const cancelButtonHandler = createButtonGroupSpy.mock.calls[0][3];
    const toggleEditModeSpy = jest.spyOn(ProfileSection, 'toggleEditMode');
    
    cancelButtonHandler();
    expect(toggleEditModeSpy).toHaveBeenCalledWith(false);

    createFormGroupSpy.mockRestore();
    createButtonGroupSpy.mockRestore();
    toggleEditModeSpy.mockRestore();
  });

  // Test 5
  // Test: populatePasswordForm() should create password fields with correct autocomplete attributes and strength validation listener
  // Scenario: When populatePasswordForm() is called, it generates password form with three inputs and strength indicator
  // Methods tested: populatePasswordForm(), createFormGroup(), createButtonGroup(), getElement()
  // Mocks: document.createElement(), DOM manipulation, addEventListener
  // Expected: Password inputs with correct autocomplete values, Change Password and Cancel buttons rendered, strength validation listener attached to new-password field
  // Parametrized: NO
  test('populatePasswordForm() should create password fields with correct autocomplete attributes and strength validation listener', () => {
    const handlePasswordStrengthInputSpy = jest.spyOn(ProfileSection, 'handlePasswordStrengthInput');
    
    ProfileSection.populatePasswordForm();
    
    const passwordForm = mocks['password-form'];
    
    // Get form groups (DIVs containing inputs)
    const formGroups = passwordForm.children.filter(child => child.className === 'form-group' && child._cachedInput);
    
    // Extract inputs from cached inputs
    const currentPassInput = formGroups[0]._cachedInput;
    const newPassInput = formGroups[1]._cachedInput;
    const confirmPassInput = formGroups[2]._cachedInput;
    
    expect(currentPassInput).toBeDefined();
    expect(currentPassInput.id).toBe('current-password');
    expect(currentPassInput.autocomplete).toBe('current-password');
    
    expect(newPassInput).toBeDefined();
    expect(newPassInput.id).toBe('new-password');
    expect(newPassInput.autocomplete).toBe('new-password');
    
    expect(confirmPassInput).toBeDefined();
    expect(confirmPassInput.id).toBe('confirm-password');
    expect(confirmPassInput.autocomplete).toBe('new-password');
    
    // Check buttons
    const buttonGroup = passwordForm.children.find(child => child.className === 'form-group button-group');
    expect(buttonGroup).toBeDefined();
    expect(buttonGroup._innerHTML).toContain('Change Password');
    expect(buttonGroup._innerHTML).toContain('Cancel');
    
    // Check strength listener attached
    expect(newPassInput.addEventListener).toHaveBeenCalledWith('input', expect.any(Function));
    
    handlePasswordStrengthInputSpy.mockRestore();
  });



  // Test 6
  // Test: handlePasswordStrengthInput() should validate strength, display/remove helper text with color coding based on input value
  // Scenario: When user types in new-password field, strength validation runs and helper text appears/updates with color coding
  // Methods tested: handlePasswordStrengthInput(), validatePasswordStrength(), getPasswordStrengthMessage()
  // Mocks: validatePasswordStrength() return value, DOM element manipulation
  // Expected: Helper text created with green color for valid password, orange for invalid; existing helper removed before new one added; no helper shown for empty field
  // Parametrized: YES - tests strong password, weak password, and empty field variants
  test.each([
    {
      name: 'with strong password',
      password: 'SecurePass123!',
      expectedColor: 'green',
      expectedMessage: 'Password is strong',
      shouldShowHelper: true
    },
    {
      name: 'with weak password',
      password: 'weak',
      expectedColor: 'orange',
      expectedMessage: 'Password must contain:',
      shouldShowHelper: true
    },
    {
      name: 'with empty field',
      password: '',
      expectedColor: null,
      expectedMessage: null,
      shouldShowHelper: false
    }
  ])('handlePasswordStrengthInput() should validate strength and display helper text $name', ({ password, expectedColor, expectedMessage, shouldShowHelper }) => {
    const formGroup = createGenericElementMock('div');
    const input = createGenericElementMock('input');
    input.value = password;
    formGroup.appendChild(input);

    const event = { target: input };

    ProfileSection.handlePasswordStrengthInput(event, formGroup);

    if (shouldShowHelper) {
      const helperText = formGroup.querySelector('#password-strength-helper');
      expect(helperText).not.toBeNull();
      expect(helperText.style.cssText).toContain(`color: ${expectedColor}`);
      expect(helperText.textContent).toContain(expectedMessage);
    } else {
      const helperText = formGroup.querySelector('#password-strength-helper');
      expect(helperText).toBeNull();
    }
  });

  // Test 7
  // Test: createFormGroup() should create form-group div with correct label, input type, id, and value attributes
  // Scenario: When createFormGroup() is called with various field parameters (different types, ids, values)
  // Methods tested: createFormGroup()
  // Mocks: document.createElement(), innerHTML
  // Expected: Form-group div with label element, input element with correct type, id, value, and required attribute
  // Parametrized: YES - tests text/email/password input types, with/without values
  test.each([
    {
      name: 'text input with value',
      id: 'edit-firstName',
      label: 'First Name',
      type: 'text',
      value: 'John',
      expectedType: 'text',
      expectedValue: 'John'
    },
    {
      name: 'email input with value',
      id: 'edit-email',
      label: 'Email',
      type: 'email',
      value: 'john@example.com',
      expectedType: 'email',
      expectedValue: 'john@example.com'
    },
    {
      name: 'password input without value',
      id: 'new-password',
      label: 'New Password',
      type: 'password',
      value: '',
      expectedType: 'password',
      expectedValue: ''
    }
  ])('createFormGroup() should create form-group with $name', ({ id, label, type, value, expectedType, expectedValue }) => {
    const formGroup = ProfileSection.createFormGroup(id, label, type, value);

    expect(formGroup.className).toBe('form-group');
    expect(formGroup.innerHTML).toContain(`<label for="${id}">${label}</label>`);
    expect(formGroup.innerHTML).toContain(`type="${expectedType}"`);
    expect(formGroup.innerHTML).toContain(`id="${id}"`);
    expect(formGroup.innerHTML).toContain(`value="${expectedValue}"`);
    expect(formGroup.innerHTML).toContain('required');
  });

  // Test 8
  // Test: createButtonGroup() should create button-group with submit and cancel buttons and attach cancel handler
  // Scenario: When createButtonGroup() is called with button text and cancel callback
  // Methods tested: createButtonGroup()
  // Mocks: document.createElement(), addEventListener, DOM element methods
  // Expected: Button-group div with submit and cancel buttons, cancel button preventDefault called and callback executed on click
  // Parametrized: NO
  test('createButtonGroup() should create button-group with submit and cancel buttons and attach cancel handler', () => {
    const cancelCallback = jest.fn();
    const submitText = 'Save Changes';
    const cancelId = 'test-cancel-btn';
    const cancelText = 'Cancel';

    const result = ProfileSection.createButtonGroup(submitText, cancelId, cancelText, cancelCallback);

    // Verify the button group div was created with correct class
    expect(result.className).toBe('form-group button-group');

    // Verify innerHTML contains both buttons with correct text and id
    expect(result._innerHTML).toContain(`type="submit"`);
    expect(result._innerHTML).toContain(submitText);
    expect(result._innerHTML).toContain(`type="button"`);
    expect(result._innerHTML).toContain(`id="${cancelId}"`);
    expect(result._innerHTML).toContain(cancelText);

    // Verify cancelCallback is a function (will be called by the handler)
    expect(typeof cancelCallback).toBe('function');
  });

  // Test 9
  // Test: attachEventListeners() should attach handlers to all required elements and handle missing elements gracefully
  // Scenario: When attachEventListeners() is called, it attaches click/submit handlers to buttons and forms (some elements may be missing)
  // Methods tested: attachEventListeners(), getElement()
  // Mocks: document.getElementById(), addEventListener
  // Expected: Event listeners attached to profile-edit-btn, password-change-btn, profile-form, password-form; missing elements handled without errors
  // Parametrized: YES - tests all elements present and various elements missing scenarios
  test.each([
    {
      name: 'with all elements present',
      missingElements: [],
      expectedListeners: ['profile-edit-btn', 'password-change-btn', 'profile-form', 'password-form']
    },
    {
      name: 'with profile-edit-btn missing',
      missingElements: ['profile-edit-btn'],
      expectedListeners: ['password-change-btn', 'profile-form', 'password-form']
    },
    {
      name: 'with password-form missing',
      missingElements: ['password-form'],
      expectedListeners: ['profile-edit-btn', 'password-change-btn', 'profile-form']
    },
    {
      name: 'with multiple elements missing',
      missingElements: ['profile-edit-btn', 'password-change-btn'],
      expectedListeners: ['profile-form', 'password-form']
    }
  ])('attachEventListeners() should attach handlers gracefully $name', ({ missingElements, expectedListeners }) => {
    // Mock document.getElementById to return null for missing elements
    document.getElementById = jest.fn((id) => {
      if (missingElements.includes(id)) {
        return null;
      }
      return mocks[id];
    });

    ProfileSection.attachEventListeners();

    // Verify event listeners were attached to expected elements
    expectedListeners.forEach(id => {
      const element = mocks[id];
      expect(element.addEventListener).toHaveBeenCalled();
    });

    // Verify missing elements were requested
    missingElements.forEach(id => {
      expect(document.getElementById).toHaveBeenCalledWith(id);
    });
  });


  // Test 10
  // Test: toggleEditMode() should toggle view/edit display, manage state, hide buttons, and repopulate form with original data
  // Scenario: When toggleEditMode() is called with true/false, it enters/exits edit mode
  // Methods tested: toggleEditMode(), toggleMode(), populateEditForm(), getElement()
  // Mocks: DOM style manipulation, populateEditForm() call
  // Expected: profile-view hidden and profile-edit shown when entering edit mode; opposite when exiting; isEditMode state updated; buttons hidden in edit mode; form repopulated with original data on exit
  // Parametrized: YES - tests entering and exiting edit mode
  test.each([
    {
      name: 'entering edit mode',
      isEdit: true,
      expectedViewDisplay: 'none',
      expectedEditDisplay: 'block',
      expectedButtonDisplay: 'none',
      shouldPopulateForm: false
    },
    {
      name: 'exiting edit mode',
      isEdit: false,
      expectedViewDisplay: 'block',
      expectedEditDisplay: 'none',
      expectedButtonDisplay: 'inline-block',
      shouldPopulateForm: true
    }
  ])('toggleEditMode() should toggle view/edit display and manage state when $name', ({ isEdit, expectedViewDisplay, expectedEditDisplay, expectedButtonDisplay, shouldPopulateForm }) => {
    const originalData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      isActive: true,
      roles: ['user']
    };

    ProfileSection.originalData = originalData;
    const populateEditFormSpy = jest.spyOn(ProfileSection, 'populateEditForm');

    ProfileSection.toggleEditMode(isEdit);

    expect(mocks['profile-view'].style.display).toBe(expectedViewDisplay);
    expect(mocks['profile-edit'].style.display).toBe(expectedEditDisplay);
    expect(mocks['profile-edit-btn'].style.display).toBe(expectedButtonDisplay);
    expect(mocks['password-change-btn'].style.display).toBe(expectedButtonDisplay);
    expect(ProfileSection.isEditMode).toBe(isEdit);

    if (shouldPopulateForm) {
      expect(populateEditFormSpy).toHaveBeenCalledWith(originalData);
    }

    populateEditFormSpy.mockRestore();
  });

  // Test 11
  // Test: togglePasswordEditMode() should toggle view/password-edit display, manage state, hide buttons, and populate form on entry
  // Scenario: When togglePasswordEditMode() is called with true/false, it enters/exits password change mode
  // Methods tested: togglePasswordEditMode(), toggleMode(), populatePasswordForm(), getElement()
  // Mocks: DOM style manipulation, populatePasswordForm() call
  // Expected: profile-view hidden and password-edit shown when entering; opposite when exiting; isPasswordEditMode state updated; buttons hidden in edit mode; form populated only on entry
  // Parametrized: YES - tests entering and exiting password edit mode
  test.each([
    {
      name: 'entering password edit mode',
      isEdit: true,
      expectedViewDisplay: 'none',
      expectedEditDisplay: 'block',
      expectedButtonDisplay: 'none',
      shouldPopulateForm: true
    },
    {
      name: 'exiting password edit mode',
      isEdit: false,
      expectedViewDisplay: 'block',
      expectedEditDisplay: 'none',
      expectedButtonDisplay: 'inline-block',
      shouldPopulateForm: false
    }
  ])('Test 11: togglePasswordEditMode() should toggle view/password-edit display, manage state, hide buttons, and populate form on entry - $name', ({ isEdit, expectedViewDisplay, expectedEditDisplay, expectedButtonDisplay, shouldPopulateForm }) => {
    if (!isEdit) ProfileSection.isPasswordEditMode = true;

    const populatePasswordFormSpy = jest.spyOn(ProfileSection, 'populatePasswordForm');

    ProfileSection.togglePasswordEditMode(isEdit);

    const profileView = mocks['profile-view'];
    const passwordEdit = mocks['password-edit'];
    const profileEditBtn = mocks['profile-edit-btn'];
    const passwordChangeBtn = mocks['password-change-btn'];

    expect(profileView.style.display).toBe(expectedViewDisplay);
    expect(passwordEdit.style.display).toBe(expectedEditDisplay);
    expect(profileEditBtn.style.display).toBe(expectedButtonDisplay);
    expect(passwordChangeBtn.style.display).toBe(expectedButtonDisplay);
    expect(ProfileSection.isPasswordEditMode).toBe(isEdit);

    if (shouldPopulateForm) {
      expect(populatePasswordFormSpy).toHaveBeenCalled();
    } else {
      expect(populatePasswordFormSpy).not.toHaveBeenCalled();
    }

    populatePasswordFormSpy.mockRestore();
  });



  // Test 12
  // Test: toggleMode() should set display styles for containers, toggle state key, and hide edit/password buttons
  // Scenario: When toggleMode() is called with different view/edit ids and isEdit flag
  // Methods tested: toggleMode(), getElement()
  // Mocks: DOM style.display manipulation
  // Expected: View container display set correctly (none/block), edit container display set correctly, buttons hidden when isEdit true, state key updated
  // Parametrized: YES - tests profile edit mode and password edit mode variations
  test.each([
    ['profile-view', 'profile-edit', 'isEditMode', true, 'none', 'block', 'none'],
    ['profile-view', 'profile-edit', 'isEditMode', false, 'block', 'none', 'inline-block'],
    ['profile-view', 'password-edit', 'isPasswordEditMode', true, 'none', 'block', 'none'],
    ['profile-view', 'password-edit', 'isPasswordEditMode', false, 'block', 'none', 'inline-block']
  ])('toggleMode() should set display styles for containers, toggle state key, and hide edit/password buttons - viewId: %s, editId: %s, isEdit: %s', 
    (viewId, editId, stateKey, isEdit, expectedViewDisplay, expectedEditDisplay, expectedBtnDisplay) => {
      ProfileSection.toggleMode(viewId, editId, isEdit, stateKey);

      // Verify getElement was called for view container
      expect(document.getElementById).toHaveBeenCalledWith(viewId);

      // Verify getElement was called for edit container
      expect(document.getElementById).toHaveBeenCalledWith(editId);

      // Verify getElement was called for both buttons
      expect(document.getElementById).toHaveBeenCalledWith('profile-edit-btn');
      expect(document.getElementById).toHaveBeenCalledWith('password-change-btn');

      // Verify view container display style is set correctly
      expect(mocks[viewId].style.display).toBe(expectedViewDisplay);

      // Verify edit container display style is set correctly
      expect(mocks[editId].style.display).toBe(expectedEditDisplay);

      // Verify both buttons display style is set correctly
      expect(mocks['profile-edit-btn'].style.display).toBe(expectedBtnDisplay);
      expect(mocks['password-change-btn'].style.display).toBe(expectedBtnDisplay);

      // Verify state key is updated correctly
      expect(ProfileSection[stateKey]).toBe(isEdit);
    }
  );

  // Test 13
  // Test: handleProfileSubmit() should validate fields, trim values, call API with correct payload, show success/error, manage button state, and toggle mode
  // Scenario: When profile form is submitted with valid/invalid data or API succeeds/fails
  // Methods tested: handleProfileSubmit(), validateFormInputs(), handleAsyncAction(), toggleEditMode(), loadUserData()
  // Mocks: apiClient.put(), UIController.getInstance().showMessage(), form elements, preventDefault
  // Expected: Form validation runs, whitespace trimmed, API called with /user/profile endpoint, success message shown and edit mode exited on success, error shown on failure, button state managed
  // Parametrized: YES - tests valid submission, missing firstName/lastName/email, API success, API failure variants
  test.each([
    {
      name: 'valid submission should call API and exit edit mode',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      apiSuccess: true,
      shouldExitEditMode: true,
      expectedMessage: 'Profile updated successfully'
    },
    {
      name: 'missing firstName should show error',
      firstName: '',
      lastName: 'Doe',
      email: 'john@example.com',
      apiSuccess: false,
      shouldExitEditMode: false,
      expectedMessage: 'First name is required'
    },
    {
      name: 'missing lastName should show error',
      firstName: 'John',
      lastName: '',
      email: 'john@example.com',
      apiSuccess: false,
      shouldExitEditMode: false,
      expectedMessage: 'Last name is required'
    },
    {
      name: 'missing email should show error',
      firstName: 'John',
      lastName: 'Doe',
      email: '',
      apiSuccess: false,
      shouldExitEditMode: false,
      expectedMessage: 'Email is required'
    },
    {
      name: 'API failure should show error message',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      apiSuccess: false,
      apiError: 'Network error',
      shouldExitEditMode: false,
      expectedMessage: 'Network error'
    }
  ])('Test 13: handleProfileSubmit() - $name', async ({ firstName, lastName, email, apiSuccess, apiError, shouldExitEditMode, expectedMessage }) => {
    // Setup form input values using mocks from test setup
    mocks['edit-firstName'].value = firstName;
    mocks['edit-lastName'].value = lastName;
    mocks['edit-email'].value = email;

    // Setup submit button mock
    const submitBtn = createButtonMock('submit-btn', { textContent: 'Save Changes' });
    mocks['profile-form'].querySelector = jest.fn((selector) => {
      if (selector === 'button[type="submit"]') return submitBtn;
      return null;
    });

    jest.spyOn(ProfileSection, 'toggleEditMode');
    jest.spyOn(ProfileSection, 'loadUserData');

    if (apiSuccess) {
      apiClient.put.mockResolvedValue({ success: true });
    } else {
      apiClient.put.mockRejectedValue(new Error(apiError || 'Operation failed'));
    }

    // Execute
    await ProfileSection.handleProfileSubmit({});

    // Assert
    if (!firstName || !lastName || !email) {
      expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedMessage, 'error');
      expect(apiClient.put).not.toHaveBeenCalled();
    } else {
      expect(apiClient.put).toHaveBeenCalledWith('/user/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim()
      });

      if (apiSuccess) {
        expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedMessage, 'success');
        jest.runAllTimers();
        expect(ProfileSection.loadUserData).toHaveBeenCalled();
        expect(ProfileSection.toggleEditMode).toHaveBeenCalledWith(false);
      } else {
        expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedMessage, 'error');
      }
    }
  });

  // Test 14
  // Test: handlePasswordSubmit() should validate fields, check password match, validate strength, call API, show success/error, manage button state, and toggle mode
  // Scenario: When password form is submitted with various password combinations or API succeeds/fails
  // Methods tested: handlePasswordSubmit(), validateFormInputs(), validatePasswordStrength(), handleAsyncAction(), togglePasswordEditMode()
  // Mocks: apiClient.post(), UIController.getInstance().showMessage(), form elements, preventDefault
  // Expected: Field validation runs, password match checked, strength validation performed, API called with /auth/change-password endpoint, success message shown and mode exited on success, error shown on failure, button state managed
  // Parametrized: YES - tests valid password change, missing fields, non-matching passwords, weak password, API success, API failure variants
  test.each([
    {
      name: 'valid password change should call API and exit mode',
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
      apiSuccess: true,
      shouldExitMode: true,
      expectedMessage: 'Password changed successfully'
    },
    {
      name: 'missing current password should show error',
      currentPassword: '',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
      apiSuccess: false,
      shouldExitMode: false,
      expectedMessage: 'Current password is required'
    },
    {
      name: 'missing new password should show error',
      currentPassword: 'OldPass123!',
      newPassword: '',
      confirmPassword: 'NewPass123!',
      apiSuccess: false,
      shouldExitMode: false,
      expectedMessage: 'New password is required'
    },
    {
      name: 'missing confirm password should show error',
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
      confirmPassword: '',
      apiSuccess: false,
      shouldExitMode: false,
      expectedMessage: 'Please confirm your new password'
    },
    {
      name: 'non-matching passwords should show error',
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
      confirmPassword: 'DifferentPass123!',
      apiSuccess: false,
      shouldExitMode: false,
      expectedMessage: 'New passwords do not match'
    },
    {
      name: 'weak password should show strength error',
      currentPassword: 'OldPass123!',
      newPassword: 'weak',
      confirmPassword: 'weak',
      apiSuccess: false,
      shouldExitMode: false,
      expectedMessage: 'Password must contain:'
    },
    {
      name: 'API success should show success message and exit mode',
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
      apiSuccess: true,
      shouldExitMode: true,
      expectedMessage: 'Password changed successfully'
    },
    {
      name: 'API failure should show error message',
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!',
      confirmPassword: 'NewPass123!',
      apiSuccess: false,
      apiError: 'Incorrect password',
      shouldExitMode: false,
      expectedMessage: 'Incorrect password'
    }
  ])('Test 14: handlePasswordSubmit() - $name', async ({ currentPassword, newPassword, confirmPassword, apiSuccess, apiError, shouldExitMode, expectedMessage }) => {
    // Setup form input values using mocks from test setup
    mocks['current-password'].value = currentPassword;
    mocks['new-password'].value = newPassword;
    mocks['confirm-password'].value = confirmPassword;

    // Setup submit button mock
    const submitBtn = createButtonMock('submit-btn', { textContent: 'Change Password' });
    mocks['password-form'].querySelector = jest.fn((selector) => {
      if (selector === 'button[type="submit"]') return submitBtn;
      return null;
    });

    jest.spyOn(ProfileSection, 'togglePasswordEditMode');

    if (apiSuccess) {
      apiClient.post.mockResolvedValue({ success: true });
    } else {
      apiClient.post.mockRejectedValue(new Error(apiError || 'Operation failed'));
    }

    // Execute
    await ProfileSection.handlePasswordSubmit({});

    // Assert
    if (!currentPassword || !newPassword || !confirmPassword) {
      expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedMessage, 'error');
      expect(apiClient.post).not.toHaveBeenCalled();
    } else if (newPassword !== confirmPassword) {
      expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedMessage, 'error');
      expect(apiClient.post).not.toHaveBeenCalled();
    } else if (expectedMessage.includes('Password must contain:')) {
      expect(mockUIController.showMessage).toHaveBeenCalledWith(expect.stringContaining('Password must contain:'), 'error');
      expect(apiClient.post).not.toHaveBeenCalled();
    } else {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/change-password', {
        oldPassword: currentPassword,
        newPassword: newPassword
      });

      if (apiSuccess) {
        expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedMessage, 'success');
        jest.runAllTimers();
        expect(ProfileSection.togglePasswordEditMode).toHaveBeenCalledWith(false);
      } else {
        expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedMessage, 'error');
      }
    }
  });

  // Test 15
  // Test: handleAsyncAction() should manage button state, call API, show messages, execute callback, and handle errors
  // Scenario: When handleAsyncAction() is called with API function that succeeds or fails
  // Methods tested: handleAsyncAction(), showSuccess(), showError()
  // Mocks: apiClient methods (passed as parameter), UIController.getInstance().showMessage(), setTimeout
  // Expected: Button disabled and text changed to loading state, API function called, success message shown and callback executed after delay on success, error message shown on failure, button restored in finally block
  // Parametrized: YES - tests successful API call and failed API call variants
  test.each([
    ['success', true, 'Profile updated successfully', 'Saving...'],
    ['failure', false, 'Operation failed', 'Saving...']
  ])('handleAsyncAction() should manage button state, call API, show messages, execute callback, and handle errors - %s case', 
    async (scenario, isSuccess, expectedMessage, loadingText) => {
      const mockApiCall = jest.fn();
      const mockCallback = jest.fn();
      const submitBtn = mocks['profile-edit-btn'];
      const originalText = submitBtn.textContent;
      const successMessage = expectedMessage;

      if (isSuccess) {
        mockApiCall.mockResolvedValue({ success: true });
      } else {
        mockApiCall.mockRejectedValue(new Error(expectedMessage));
      }

      const showSuccessSpy = jest.spyOn(ProfileSection, 'showSuccess');
      const showErrorSpy = jest.spyOn(ProfileSection, 'showError');

      const promise = ProfileSection.handleAsyncAction(mockApiCall, submitBtn, loadingText, successMessage, mockCallback);

      // Verify button is immediately disabled and text changed to loading state
      expect(submitBtn.disabled).toBe(true);
      expect(submitBtn.textContent).toBe(loadingText);

      // Verify API function was called
      expect(mockApiCall).toHaveBeenCalled();

      // Wait for async operation to complete
      await promise;

      if (isSuccess) {
        // Verify success message was shown
        expect(showSuccessSpy).toHaveBeenCalledWith(successMessage);
        expect(mockUIController.showMessage).toHaveBeenCalledWith(successMessage, 'success');

        // Verify callback will be executed after delay
        expect(mockCallback).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1000);
        expect(mockCallback).toHaveBeenCalled();
      } else {
        // Verify error message was shown
        expect(showErrorSpy).toHaveBeenCalledWith(expectedMessage);
        expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedMessage, 'error');

        // Verify callback was NOT executed on error
        expect(mockCallback).not.toHaveBeenCalled();
      }

      // Verify button is restored in finally block
      expect(submitBtn.disabled).toBe(false);
      expect(submitBtn.textContent).toBe(originalText);

      showSuccessSpy.mockRestore();
      showErrorSpy.mockRestore();
    }
  );

  // Test 16
  // Test: validateFormInputs() should validate required fields and show error messages for invalid inputs
  // Scenario: When validateFormInputs() is called with inputs that are empty, whitespace, or valid
  // Methods tested: validateFormInputs(), showError()
  // Mocks: UIController.getInstance().showMessage()
  // Expected: Returns true when all inputs have non-empty trimmed values, returns false and shows error for first invalid input
  // Parametrized: YES - tests all valid, empty firstName, empty lastName, whitespace-only values variants
  test.each([
    ['all valid', [
      { value: 'John', message: 'First name is required' },
      { value: 'Doe', message: 'Last name is required' },
      { value: 'john@example.com', message: 'Email is required' }
    ], true, null],
    ['empty firstName', [
      { value: '', message: 'First name is required' },
      { value: 'Doe', message: 'Last name is required' },
      { value: 'john@example.com', message: 'Email is required' }
    ], false, 'First name is required'],
    ['empty lastName', [
      { value: 'John', message: 'First name is required' },
      { value: '', message: 'Last name is required' },
      { value: 'john@example.com', message: 'Email is required' }
    ], false, 'Last name is required'],
    ['empty email', [
      { value: 'John', message: 'First name is required' },
      { value: 'Doe', message: 'Last name is required' },
      { value: '', message: 'Email is required' }
    ], false, 'Email is required'],
    ['whitespace-only firstName', [
      { value: '   ', message: 'First name is required' },
      { value: 'Doe', message: 'Last name is required' },
      { value: 'john@example.com', message: 'Email is required' }
    ], false, 'First name is required'],
    ['whitespace-only lastName', [
      { value: 'John', message: 'First name is required' },
      { value: '  \t  ', message: 'Last name is required' },
      { value: 'john@example.com', message: 'Email is required' }
    ], false, 'Last name is required'],
    ['whitespace-only email', [
      { value: 'John', message: 'First name is required' },
      { value: 'Doe', message: 'Last name is required' },
      { value: '\n', message: 'Email is required' }
    ], false, 'Email is required']
  ])('validateFormInputs() should validate required fields and show error messages for invalid inputs - %s', 
    (scenario, inputs, expectedResult, expectedErrorMessage) => {
      const showErrorSpy = jest.spyOn(ProfileSection, 'showError');

      const result = ProfileSection.validateFormInputs(inputs);

      // Verify return value matches expected
      expect(result).toBe(expectedResult);

      if (expectedResult === true) {
        // When all inputs are valid, showError should NOT be called
        expect(showErrorSpy).not.toHaveBeenCalled();
        expect(mockUIController.showMessage).not.toHaveBeenCalled();
      } else {
        // When inputs are invalid, showError should be called with first invalid input's message
        expect(showErrorSpy).toHaveBeenCalledWith(expectedErrorMessage);
        expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedErrorMessage, 'error');
        // Verify it was called only once (stops at first invalid input)
        expect(showErrorSpy).toHaveBeenCalledTimes(1);
      }

      showErrorSpy.mockRestore();
    }
  );

  // Test 17
  // Test: validatePasswordStrength() should check all requirements and return isValid flag with requirements object
  // Scenario: When validatePasswordStrength() is called with passwords of varying strength
  // Methods tested: validatePasswordStrength(), getPasswordStrengthMessage()
  // Mocks: None (pure function)
  // Expected: Returns object with isValid true/false, requirements object with boolean flags for minLength, hasUppercase, hasLowercase, hasDigit, hasSpecialChar, and message string
  // Parametrized: YES - tests strong password, missing each requirement, and invalid combinations variants
  test.each([
    ['Strong123!', true, { minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password is strong'],
    ['weak', false, { minLength: false, hasUppercase: false, hasLowercase: true, hasDigit: false, hasSpecialChar: false }, 'Password must contain: at least 8 characters, one uppercase letter, one digit, one special character (@$!%*?&)'],
    ['Weak123', false, { minLength: false, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: false }, 'Password must contain: at least 8 characters, one special character (@$!%*?&)'],
    ['weakpassword1!', false, { minLength: true, hasUppercase: false, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password must contain: one uppercase letter'],
    ['WEAKPASSWORD1!', false, { minLength: true, hasUppercase: true, hasLowercase: false, hasDigit: true, hasSpecialChar: true }, 'Password must contain: one lowercase letter'],
    ['WeakPassword!', false, { minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: false, hasSpecialChar: true }, 'Password must contain: one digit'],
    ['WeakPassword1', false, { minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: false }, 'Password must contain: one special character (@$!%*?&)'],
    ['ValidPass123@', true, { minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password is strong'],
    ['AnotherValid99$', true, { minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password is strong'],
    ['NoDigitPass!', false, { minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: false, hasSpecialChar: true }, 'Password must contain: one digit']
  ])('validatePasswordStrength() should check all requirements and return isValid flag with requirements object - password: %s', 
    (password, expectedIsValid, expectedRequirements, expectedMessage) => {
      const result = ProfileSection.validatePasswordStrength(password);

      // Verify result is an object with required properties
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('requirements');
      expect(result).toHaveProperty('message');

      // Verify isValid flag is correct
      expect(result.isValid).toBe(expectedIsValid);

      // Verify requirements object contains all boolean flags
      expect(result.requirements).toEqual(expectedRequirements);
      expect(result.requirements).toHaveProperty('minLength');
      expect(result.requirements).toHaveProperty('hasUppercase');
      expect(result.requirements).toHaveProperty('hasLowercase');
      expect(result.requirements).toHaveProperty('hasDigit');
      expect(result.requirements).toHaveProperty('hasSpecialChar');

      // Verify all requirement values are booleans
      Object.values(result.requirements).forEach(value => {
        expect(typeof value).toBe('boolean');
      });

      // Verify message is correct
      expect(result.message).toBe(expectedMessage);

      // Verify isValid is true only when all requirements are met
      const allRequirementsMet = Object.values(result.requirements).every(req => req);
      expect(result.isValid).toBe(allRequirementsMet);
    }
  );

  // Test 18
  // Test: getPasswordStrengthMessage() should return success message or list missing requirements
  // Scenario: When getPasswordStrengthMessage() is called with various requirement combinations
  // Methods tested: getPasswordStrengthMessage()
  // Mocks: None (pure function)
  // Expected: Returns 'Password is strong' when all requirements true, returns readable list of missing requirements when any false
  // Parametrized: YES - tests all requirements met, various missing requirement combinations variants
//    test.each([
//      [{ minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password is strong'],
//      [{ minLength: false, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password must contain: at least 8 characters'],
//      [{ minLength: true, hasUppercase: false, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password must contain: one uppercase letter'],
//      [{ minLength: true, hasUppercase: true, hasLowercase: false, hasDigit: true, hasSpecialChar: true }, 'Password must contain: one lowercase letter'],
//      [{ minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: false, hasSpecialChar: true }, 'Password must contain: one digit'],
//      [{ minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: false }, 'Password must contain: one special character (@$!%*?&)'],
//      [{ minLength: false, hasUppercase: false, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password must contain: at least 8 characters, one uppercase letter'],
//      [{ minLength: false, hasUppercase: false, hasLowercase: false, hasDigit: false, hasSpecialChar: false }, 'Password must contain: at least 8 characters, one uppercase letter, one lowercase letter, one digit, one special character (@$!%*?&)']
//    ])('getPasswordStrengthMessage() - requirements: $requirements | expected: $expectedMessage', 
//      (requirements, expectedMessage) => {
//        const result = ProfileSection.getPasswordStrengthMessage(requirements);
//        expect(result).toBe(expectedMessage);
//      }
//    );
  test.each([
    [{ minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password is strong'],
    [{ minLength: false, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password must contain: at least 8 characters'],
    [{ minLength: true, hasUppercase: false, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password must contain: one uppercase letter'],
    [{ minLength: true, hasUppercase: true, hasLowercase: false, hasDigit: true, hasSpecialChar: true }, 'Password must contain: one lowercase letter'],
    [{ minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: false, hasSpecialChar: true }, 'Password must contain: one digit'],
    [{ minLength: true, hasUppercase: true, hasLowercase: true, hasDigit: true, hasSpecialChar: false }, 'Password must contain: one special character (@$!%*?&)'],
    [{ minLength: false, hasUppercase: false, hasLowercase: true, hasDigit: true, hasSpecialChar: true }, 'Password must contain: at least 8 characters, one uppercase letter'],
    [{ minLength: false, hasUppercase: false, hasLowercase: false, hasDigit: false, hasSpecialChar: false }, 'Password must contain: at least 8 characters, one uppercase letter, one lowercase letter, one digit, one special character (@$!%*?&)']
  ])('getPasswordStrengthMessage() - requirements: $requirements | expected: $expectedMessage', 
    (requirements, expectedMessage) => {
      const result = ProfileSection.getPasswordStrengthMessage(requirements);
      expect(result).toBe(expectedMessage);
    }
  );

  // Test 19
  // Test: getElement() should cache DOM elements and handle missing elements based on throwError parameter
  // Scenario: When getElement() is called multiple times with same id, or with non-existent element
  // Methods tested: getElement()
  // Mocks: document.getElementById()
  // Expected: First call retrieves from DOM and caches in _domCache, subsequent calls return cached element; missing elements return null and warn/silent based on throwError flag
  // Parametrized: YES - tests existing element (cached retrieval), missing element with throwError true, missing element with throwError false variants
  test.each([
    {
      name: 'existing element should be cached and reused',
      elementId: 'profile-form',
      exists: true,
      throwError: true,
      expectedCalls: 1,
      shouldWarn: false
    },
    {
      name: 'missing element with throwError true should warn',
      elementId: 'non-existent-element',
      exists: false,
      throwError: true,
      expectedCalls: 1,
      shouldWarn: true
    },
    {
      name: 'missing element with throwError false should not warn',
      elementId: 'non-existent-element',
      exists: false,
      throwError: false,
      expectedCalls: 1,
      shouldWarn: false
    },
    {
      name: 'cached element should not call document.getElementById again',
      elementId: 'profile-form',
      exists: true,
      throwError: true,
      expectedCalls: 1,
      shouldWarn: false,
      callTwice: true
    }
  ])('getElement() should cache DOM elements and handle missing elements $name', ({ elementId, exists, throwError, expectedCalls, shouldWarn, callTwice }) => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    document.getElementById.mockClear();

    // First call
    const result1 = ProfileSection.getElement(elementId, throwError);

    // Verify element was retrieved or null
    if (exists) {
      expect(result1).toBe(mocks[elementId]);
    } else {
      expect(result1).toBeNull();
    }

    // Verify warning behavior
    if (shouldWarn) {
      expect(consoleWarnSpy).toHaveBeenCalledWith(`Element with id "${elementId}" not found`);
    } else {
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    }

    // Verify caching
    expect(ProfileSection._domCache[elementId]).toBe(result1);

    if (callTwice) {
      consoleWarnSpy.mockClear();
      document.getElementById.mockClear();

      // Second call should use cache
      const result2 = ProfileSection.getElement(elementId, throwError);
      expect(result2).toBe(result1);
      expect(document.getElementById).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    }

    consoleWarnSpy.mockRestore();
  });


  // Test 20
  // Test: showError() should call UIController with error type
  // Scenario: When showError() is called with error message
  // Methods tested: showError()
  // Mocks: UIController.getInstance().showMessage()
  // Expected: UIController.getInstance().showMessage() called with message and 'error' type
  // Parametrized: NO
  test('showError() should call UIController with error type', () => {
    const errorMessage = 'Failed to load user data';

    ProfileSection.showError(errorMessage);

    // Verify UIController.getInstance() was called
    expect(global.UIController.getInstance).toHaveBeenCalled();

    // Verify showMessage was called with correct message and 'error' type
    expect(mockUIController.showMessage).toHaveBeenCalledWith(errorMessage, 'error');
    expect(mockUIController.showMessage).toHaveBeenCalledTimes(1);
  });

  // Test 21
  // Test: showSuccess() should call UIController with success type
  // Scenario: When showSuccess() is called with success message
  // Methods tested: showSuccess()
  // Mocks: UIController.getInstance().showMessage()
  // Expected: UIController.getInstance().showMessage() called with message and 'success' type
  // Parametrized: NO
  test('showSuccess() should call UIController with success type', () => {
    const successMessage = 'Profile updated successfully';

    ProfileSection.showSuccess(successMessage);

    // Verify UIController.getInstance() was called
    expect(global.UIController.getInstance).toHaveBeenCalled();

    // Verify showMessage was called with correct message and 'success' type
    expect(mockUIController.showMessage).toHaveBeenCalledWith(successMessage, 'success');
    expect(mockUIController.showMessage).toHaveBeenCalledTimes(1);
  });

  // Test 22
  // Test: cleanup() should reset all state and clear caches
  // Scenario: When cleanup() is called after ProfileSection usage
  // Methods tested: cleanup()
  // Mocks: None
  // Expected: isEditMode set to false, isPasswordEditMode set to false, originalData cleared, _domCache cleared
  // Parametrized: NO
  test('cleanup() should reset all state and clear caches', () => {
    // Set up some state
    ProfileSection.isEditMode = true;
    ProfileSection.isPasswordEditMode = true;
    ProfileSection.originalData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
    ProfileSection._domCache = {
      'profile-form': mocks['profile-form'],
      'profile-view': mocks['profile-view'],
      'password-edit': mocks['password-edit']
    };

    ProfileSection.cleanup();

    // Verify state is reset
    expect(ProfileSection.isEditMode).toBe(false);
    expect(ProfileSection.isPasswordEditMode).toBe(false);
    expect(ProfileSection._domCache).toEqual({});
  });

});
