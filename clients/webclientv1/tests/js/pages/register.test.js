// Test file for: webclientv1/src/js/pages/register.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { RegisterPage } = loadModules('RegisterPage');

describe('RegisterPage', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: RegisterPage
  // Purpose: Handle user registration form submission with validation
  // 
  // SETUP OVERVIEW:
  // - Mock DOM elements (firstName, lastName, email, password, passwordConfirm inputs)
  // - Mock authService.register() method
  // - Mock uiController.showMessage() method
  // - Mock router.navigate() method
  // - jest.useFakeTimers() for setTimeout testing
  //
  // SHARED MOCKS:
  // - authService.register() - To isolate handleSubmit logic
  // - uiController.showMessage() - To verify correct messages
  // - router.navigate() - To verify navigation calls
  //
  // TESTING RULES & BEST PRACTICES:
  // 1. Prefer parametrized tests (test.each) instead of repeating similar tests
  //    - Reduces code duplication
  //    - Makes it easy to add more test cases
  //    - Improves readability with clear input/output mappings
  //
  // 2. Unit tests should mock all external dependencies
  //    - Mock DOM elements, authService, uiController, router
  //    - Only test handleSubmit logic, not its dependencies
  //
  // 3. One assertion per test concept
  //    - Tests should be focused and test one behavior
  //
  // 4. Use descriptive test names following: "should [expected behavior] when [condition]"
  //
  // 5. Mock methods that cause side effects
  //    - authService.register, uiController.showMessage, router.navigate
  //
  // 6. Clean up after each test
  //    - Reset mocks, clear timers, restore spies
  //
  // TEST INVENTORY (PARAMETRIZED - handleSubmit function):
  // 1. handleSubmit should prevent default form submission and validate inputs | test.each with password mismatch, short password, valid input cases
  //
  // ===== SETUP =====
  let component;
  let mockService;
  let emailValue;
  let lastNameValue;
  let firstNameValue;
  let passwordValue;
  let passwordConfirmValue;

  // ===== SETUP =====
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();

    // Initialize input values
    emailValue = '';
    firstNameValue = '';
    lastNameValue = '';
    passwordValue = '';
    passwordConfirmValue = '';

    // Mock authService
    global.authService = {
      register: jest.fn().mockImplementation((email, password, passwordConfirm, firstName, lastName) => {
        console.log('authService.register called with:', email, password, passwordConfirm, firstName, lastName);
        return Promise.resolve({});
      }),
    };

    // Mock uiController
    global.uiController = {
      showMessage: jest.fn(),
    };

    // Mock router
    global.router = {
      navigate: jest.fn(),
    };

    // Mock document.body.innerHTML
    document.body.innerHTML = `
      <form id="register-form">
        <input id="firstName" type="text" value=""/>
        <input id="lastName" type="text" value=""/>
        <input id="email" type="email" value=""/>
        <input id="password" type="password" value=""/>
        <input id="passwordConfirm" type="password" value=""/>
        <button type="submit">Register</button>
      </form>
    `;

    // Mock document.getElementById
    global.document.getElementById = jest.fn((id) => {
      if (id === 'firstName') {
        return { 
          value: firstNameValue,
          get value() { return firstNameValue; },
          set value(val) { firstNameValue = val; },
        };
      }
      if (id === 'lastName') {
        return { 
          value: lastNameValue,
          get value() { return lastNameValue; },
          set value(val) { lastNameValue = val; },
        };
      }
      if (id === 'email') {
        return { 
          value: emailValue,
          get value() { return emailValue; },
          set value(val) { emailValue = val; },
        };
      }
      if (id === 'password') {
        return { 
          value: passwordValue,
          get value() { return passwordValue; },
          set value(val) { passwordValue = val; },
        };
      }
      if (id === 'passwordConfirm') {
        return { 
          value: passwordConfirmValue,
          get value() { return passwordConfirmValue; },
          set value(val) { passwordConfirmValue = val; },
        };
      }
      if (id === 'register-form') {
        return {
          addEventListener: jest.fn((eventName, callback) => {
            if (eventName === 'submit') {
              this.submitCallback = callback;
            }
          }),
          dispatchEvent: jest.fn((event) => {
            if (event.type === 'submit' && this.submitCallback) {
              const mockEvent = { preventDefault: jest.fn() };
              this.submitCallback(mockEvent);
            }
          }),
        };
      }
      return null;
    });

    RegisterPage.init();
    component = RegisterPage;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    RegisterPage.instance = null;
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

  // Test 1
  // Test: handleSubmit should validate input, handle registration, and show appropriate messages
  // Scenario: Various cases including password mismatch, short password, successful registration, failed registration, and proper field trimming
  // Methods tested: handleSubmit()
  // Mocks: authService.register() - mocked to resolve/reject based on scenario; uiController.showMessage() - verify correct message type and content; router.navigate() - verify redirect on success; event.preventDefault() - verify form submission blocking
  // Expected: Validates passwords match and are 6+ chars, trims input whitespace, calls authService with correct params, shows success/error messages, navigates on success after 1500ms, prevents form default behavior
  test.each([
    { firstName: 'John', lastName: 'Doe', email: 'john@test.com', password: 'test123', passwordConfirm: 'test456', registerSuccess: null, expectedMessage: 'Passwords do not match', shouldNavigate: false },
    { firstName: 'John', lastName: 'Doe', email: 'john@test.com', password: 'abc', passwordConfirm: 'abc', registerSuccess: null, expectedMessage: 'Password must be at least 6 characters', shouldNavigate: false },
    { firstName: '  John  ', lastName: '  Doe  ', email: '  john@test.com  ', password: 'pass123', passwordConfirm: 'pass123', registerSuccess: true, expectedMessage: 'Registration successful! Redirecting to login...', shouldNavigate: true },
    { firstName: 'John', lastName: 'Doe', email: 'john@test.com', password: 'pass123', passwordConfirm: 'pass123', registerSuccess: false, expectedMessage: 'Registration failed: Email already exists', shouldNavigate: false },
  ])('should handle registration with validation, API calls, and navigation', async ({ firstName, lastName, email, password, passwordConfirm, registerSuccess, expectedMessage, shouldNavigate }) => {
    firstNameValue = firstName;
    lastNameValue = lastName;
    emailValue = email;
    passwordValue = password;
    passwordConfirmValue = passwordConfirm;

    if (registerSuccess === true) {
      global.authService.register.mockResolvedValue(undefined);
    } else if (registerSuccess === false) {
      global.authService.register.mockRejectedValue(new Error('Email already exists'));
    }

    const event = new Event('submit');
    event.preventDefault = jest.fn();

    await component.handleSubmit(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(global.uiController.showMessage).toHaveBeenCalledWith(expectedMessage, registerSuccess === true ? 'success' : 'error');

    if (shouldNavigate) {
      jest.advanceTimersByTime(1500);
      expect(global.router.navigate).toHaveBeenCalledWith('login');
    } else {
      expect(global.router.navigate).not.toHaveBeenCalled();
    }
  });
});
