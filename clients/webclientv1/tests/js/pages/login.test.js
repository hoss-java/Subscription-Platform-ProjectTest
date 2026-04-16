// Test file for: webclientv1/src/js/pages/login.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { LoginPage } = loadModules('LoginPage');

describe('LoginPage', () => {
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
  // 1. handleSubmit should show error message if email or password is not provided.
  // 2. handleSubmit should disable submit button and show "Logging in..." text during submission.
  // 3. handleSubmit should call authService.login with correct email and password.
  // 4. handleSubmit should dispatch 'authStateChanged' event on successful login.
  // 5. handleSubmit should show success message and redirect to dashboard on successful login.
  // 6. handleSubmit should show specific error message for 401 response from authService.login.
  // 7. handleSubmit should show network error message if a network error occurs.
  // 8. handleSubmit should restore the button text and enable it after submission regardless of success or failure.
  // 9. showError should call UIController's showMessage with 'error' type.
  // 10. showSuccess should call UIController's showMessage with 'success' type.

  let component;
  let mockService;

  let originalGetElementById;
  let emailValue = 'test@example.com'; 
  let passwordValue = 'password'; 

  // ===== SETUP =====
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();

    originalGetElementById = document.getElementById;

    // Mock authService
    global.authService = { 
        login: jest.fn().mockImplementation((email, password) => {
            console.log('authService.login called with:', email, password);
            return Promise.resolve({});
        }), 
    };

    // Mock UIController
    global.UIController = {
      getInstance: jest.fn().mockReturnValue({
        showMessage: jest.fn(),
      }),
    };

    global.document.body.innerHTML = `
        <form id="login-form">
            <input id="email" type="text" value="test@example.com"/>
            <input id="password" type="password" value="password"/>
            <button id="submit-button" type="submit">Login</button>
        </form>`;

    // Mock for document.getElementById
    global.document.getElementById = jest.fn((id) => {
        if (id === 'email') {
            return { value: emailValue }; // Default to empty
        } 
        if (id === 'password') {
            return { value: passwordValue }; // Default to empty
        }
        if (id === 'login-form') {
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
  });

  // Clean up after each test
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    LoginPage.instance = null;
  });

  // Test 1
  // Test: handleSubmit should show error message if email or password is not provided.
  // Scenario: Submitting the form with empty email or password fields.
  // Methods tested: handleSubmit()
  // Mocks: console.error() - suppress console errors during tests
  // Expected: Error message is shown asking for both email and password
  test('handleSubmit should show error message if fields are empty', () => {
    emailValue = '';
    passwordValue = ''; 

    // Initialize the component
    component = LoginPage.init();
    const form = document.getElementById('login-form');

    // Dispatch the submit event
    form.dispatchEvent(new Event('submit'));

    const showMessageMock = UIController.getInstance().showMessage;

    // Check if the showMessage was called correctly
    expect(showMessageMock).toHaveBeenCalledWith('Please enter both email and password', 'error');
  });

  // Test 2
  // Test: handleSubmit should disable submit button and show "Logging in..." text during submission.
  // Scenario: User submits the login form successfully.
  // Methods tested: handleSubmit()
  // Mocks: authService.login() - to avoid actual API call
  // Expected: Submit button is disabled and shows "Logging in..."
  test('handleSubmit should disable submit button during submission', async () => {
    emailValue = 'test@example.com'; 
    passwordValue = 'password'; 

    // Button state mock
    let submitBtnState = {

        disabled: false,
        disabled_isset: false,
        textContent: 'Login',
        textContent_isset: false,
    };

    document.querySelector = jest.fn((selector) => {
      if (selector === '#login-form button[type="submit"]') {
        return {
          get disabled() {
              return submitBtnState.disabled;
          },
          set disabled(value) {
            if (submitBtnState.disabled_isset == false){
              submitBtnState.disabled = value;
              submitBtnState.disabled_isset = true;
            }
          },
          get textContent() {
              return submitBtnState.textContent;
          },
          set textContent(value) {
              if (submitBtnState.textContent_isset == false){
              submitBtnState.textContent = value;
              submitBtnState.textContent_isset = true;
            }
          },
        };
      }
      return null;
    });

    component = LoginPage.init(); // Assign the component
    const form = document.getElementById('login-form'); // Get the form

    // Dispatch the submit event
    await form.dispatchEvent(new Event('submit'));

    // Assertions
    expect(submitBtnState.disabled).toBe(true); // Check if it is disabled
    expect(submitBtnState.textContent).toBe('Logging in...'); // Check button text
  });

  // Test 3
  // Test: handleSubmit should call authService.login with correct email and password.
  // Scenario: Successful login with valid credentials.
  // Methods tested: handleSubmit()
  // Mocks: authService.login() - mocked to test invocation
  // Expected: login method is called with correct arguments
  test('handleSubmit should call authService.login with correct credentials', async () => {
    emailValue = 'test@example.com'; 
    passwordValue = 'password'; 

    component = LoginPage.init(); // Initialize the component first

    const form = document.getElementById('login-form');
    
    // Mock login behavior before submitting the form
    global.authService.login.mockResolvedValueOnce({}); 

    // Dispatch the submit event
    await form.dispatchEvent(new Event('submit'));

    // Check if authService.login was called with the correct arguments
    expect(global.authService.login).toHaveBeenCalledWith(emailValue, passwordValue);
  });


  // Test 4
  // Test: handleSubmit should dispatch 'authStateChanged' event on successful login.
  // Scenario: User successfully logs in.
  // Methods tested: handleSubmit()
  // Mocks: Event() - to verify event dispatch
  // Expected: 'authStateChanged' event is dispatched
  test('handleSubmit should dispatch authStateChanged event on successful login', async () => {
    emailValue = 'test@example.com'; 
    passwordValue = 'password'; 

    component = LoginPage.init(); // Initialize the component first

    const form = document.getElementById('login-form');

    // Mock successful login behavior
    global.authService.login.mockResolvedValueOnce({}); 

    const dispatchSpy = jest.spyOn(document, 'dispatchEvent'); // Spy on event dispatch

    // Dispatch the submit event
    await form.dispatchEvent(new Event('submit'));

    // Verify the authStateChanged event was dispatched
    expect(dispatchSpy).toHaveBeenCalled(); // Check that something was dispatched
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'authStateChanged' })); // Check for specific event type
  });

  // Test 5
  // Test: handleSubmit should show success message and redirect to dashboard on successful login.
  // Scenario: Successful login and redirection.
  // Methods tested: handleSubmit()
  // Mocks: UIController.getInstance().showMessage - to verify message display
  // Expected: Success message is shown and redirection occurs
  test('handleSubmit should show success message and redirect on successful login', async () => {
    emailValue = 'test@example.com'; 
    passwordValue = 'password'; 

    component = LoginPage.init(); // Initialize the component first

    const form = document.getElementById('login-form');

    const showMessageMock = UIController.getInstance().showMessage; // Get mock reference
    jest.spyOn(window, 'setTimeout'); // Spy on setTimeout

    await form.dispatchEvent(new Event('submit'));

    // Check if the showMessage was called correctly
    expect(showMessageMock).toHaveBeenCalledWith('Login successful! Redirecting...', 'success');
  });

  // Test 6
  // Test: handleSubmit should show specific error message for 401 response from authService.login.
  // Scenario: Login attempt returns 401 Unauthorized.
  // Methods tested: handleSubmit()
  // Mocks: authService.login - to return 401 error
  // Expected: Specific error message is shown
  test('handleSubmit should show error message for 401 response', async () => {
    emailValue = 'test@example.com'; 
    passwordValue = 'password'; 

    // Mock AuthService to return a 401 error
    authService.login.mockImplementation(() => {
        const error = new Error('401');
        error.message = '401: Unauthorized';
        return Promise.reject(error);
    });

    const form = document.getElementById('login-form');
    LoginPage.init();

    const showMessageMock = UIController.getInstance().showMessage; // Get mock reference
    jest.spyOn(window, 'setTimeout'); // Spy on setTimeout

    await form.dispatchEvent(new Event('submit'));

    expect(showMessageMock).toHaveBeenCalledWith('Invalid email or password', 'error');
  });

  // Test 7
  // Test: handleSubmit should show network error message if a network error occurs.
  // Scenario: Network error occurs during login.
  // Methods tested: handleSubmit()
  // Mocks: authService.login - to simulate network error
  // Expected: Network error message is shown
  test('handleSubmit should show network error message on network error', async () => {
    emailValue = 'test@example.com'; 
    passwordValue = 'password'; 

    const form = document.getElementById('login-form');
    LoginPage.init();

    // Mock authService to simulate a network error
    authService.login.mockImplementation(() => Promise.reject(new Error('Network')));

    await form.dispatchEvent(new Event('submit'));

    expect(UIController.getInstance().showMessage).toHaveBeenCalledWith('Network error. Please check your connection.', 'error');
  });

  // Test 8
  // Test: handleSubmit should restore the button text and enable it after submission regardless of success or failure.
  // Scenario: User attempts to login, regardless of outcome.
  // Methods tested: handleSubmit()
  // Mocks: N/A - Utilize real button behavior
  // Expected: Button is re-enabled and text reverted
  test('handleSubmit should restore button text after submission', async () => {
    emailValue = 'test@example.com'; 
    passwordValue = 'password'; 

    // Button state mock
    let submitBtnState = {

        disabled: false,
        textContent: 'Login',
    };

    document.querySelector = jest.fn((selector) => {
      if (selector === '#login-form button[type="submit"]') {
        return {
          get disabled() {
              return submitBtnState.disabled;
          },
          set disabled(value) {
            submitBtnState.disabled = value;
          },
          get textContent() {
              return submitBtnState.textContent;
          },
          set textContent(value) {
            submitBtnState.textContent = value;
          },
        };
      }
      return null;
    });

    const form = document.getElementById('login-form');
    LoginPage.init();

    // Mock authService to simulate an error
    authService.login.mockRejectedValueOnce(new Error('Some error'));

    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    
    await form.dispatchEvent(new Event('submit'));

    expect(submitBtnState.disabled).toBe(false);
    expect(submitBtnState.textContent).toBe('Login');
  });

  // Test 9
  // Test: showError should call UIController's showMessage with 'error' type.
  // Scenario: Triggering showError method with a message.
  // Methods tested: showError()
  // Mocks: UIController.getInstance() - mock to check message display
  // Expected: UIController shows message of error type
  test('showError should invoke UIController with error message', () => {
    const message = 'Test error message';

    // Initialize the component if not already done
    component = LoginPage; 

    component.showError(message);

    // Expect the mock showMessage to have been called with the correct parameters
    expect(UIController.getInstance().showMessage).toHaveBeenCalledWith(message, 'error');
  });

  // Test 10
  // Test: showSuccess should call UIController's showMessage with 'success' type.
  // Scenario: Triggering showSuccess method with a message.
  // Methods tested: showSuccess()
  // Mocks: UIController.getInstance() - mock to check message display
  // Expected: UIController shows message of success type
  test('showSuccess should invoke UIController with success message', () => {
    const message = 'Test success message';

    // Assign the component if not already assigned during setup
    component = LoginPage; 

    component.showSuccess(message);

    // Expect the mock showMessage to have been called with the correct parameters
    expect(UIController.getInstance().showMessage).toHaveBeenCalledWith(message, 'success');
  });

});


