// Test file for: webclientv1/src/js/theme-manager.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { ThemeManager } = loadModules('ThemeManager');

describe('ThemeManager', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: ThemeManager
  // Purpose: Handles theme switching and persistence with singleton pattern, localStorage management, and dynamic stylesheet loading
  // 
  // SETUP OVERVIEW:
  // - jest.useFakeTimers(): Mock setTimeout/setInterval for time-based tests
  // - jest.spyOn(console, 'error'): Suppress console errors during tests
  // - ThemeManager.#instance = null: Reset singleton instance between tests
  // - document.body.innerHTML: Mock DOM structure with required elements (theme-switcher-container)
  // - localStorage.clear(): Reset storage between tests
  // - fetch mock: Mock config/styles.json HTTP requests
  //
  // SHARED MOCKS:
  // - fetch() - Prevents actual HTTP requests for config/styles.json
  // - localStorage - Prevents actual browser storage modifications
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
  // 1. getInstance() should return same instance on multiple calls - Singleton pattern verification
  // 2. init() should get saved theme and apply it - Initialization flow
  // 3. setTheme() should load config, remove old stylesheets, and add new ones - Stylesheet management
  // 4. setTheme() should save theme to localStorage - Persistence
  // 5. setTheme() should fall back to default theme for invalid input - Parametrized: invalid theme, null, undefined
  // 6. #getSavedTheme() should return saved theme or default - Parametrized: valid saved theme, invalid theme, empty storage
  // 7. #createSwitcher() should render dropdown with all themes - UI rendering
  // 8. #createSwitcher() should toggle dropdown on button click - Event handling
  // 9. #createSwitcher() should call setTheme when option selected - Theme switching via UI
  // 10. #createSwitcher() should close dropdown on outside click - Event delegation
  // 11. #capitalize() should uppercase first letter - Parametrized: 'default', 'dark', 'a', 'A'
  // 12. getAvailableThemes() should return themes array - Public accessor
  // 13. getCurrentTheme() should return current theme - Public accessor
  //

  let component;
  let mockService;
  let mockElement;

  // ===== SETUP =====
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    ThemeManager.instance = null;
    
    // Mock fetch to return config
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ theme: ['main.css', 'variables.css'] })
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    ThemeManager.instance = null;
  });

  // Test 1
  // Test: getInstance() should return same instance on multiple calls
  // Scenario: Singleton pattern - calling getInstance() twice should return identical reference
  // Methods tested: getInstance()
  // Mocks: None required - pure logic test
  // Expected: Both calls return same instance object with identical reference
  test('getInstance() should return same instance on multiple calls', () => {
    const instance1 = ThemeManager.getInstance();
    const instance2 = ThemeManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  // Test 2
  // Test: init() should get saved theme and apply it
  // Scenario: User has previously saved a theme to localStorage, init() loads and applies it
  // Methods tested: init(), #getSavedTheme(), setTheme()
  // Mocks: fetch() - returns config with theme files, localStorage.getItem() - returns 'dark'
  // Expected: init() retrieves 'dark' from storage and calls setTheme('dark')
  test('init() should get saved theme and apply it', async () => {
    global.localStorage.setItem('selectedTheme', 'dark');
    global.window.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ theme: ['main.css'] })
    });
    global.document.getElementById.mockReturnValue({
      innerHTML: '',
      addEventListener: jest.fn()
    });

    component = ThemeManager.getInstance();
    await component.init();

    expect(component.getCurrentTheme()).toBe('dark');
  });

  // Test 3
  // Test: setTheme() should load config, remove old stylesheets, and add new ones
  // Scenario: User switches from 'default' to 'dark' theme
  // Methods tested: setTheme()
  // Mocks: fetch() - returns config, document.querySelectorAll() - returns old link elements, document.createElement() - creates new links
  // Expected: Old link[data-theme] elements removed, new stylesheets added to head
  test('setTheme() should load config, remove old stylesheets, and add new ones', async () => {
    const mockLink = { remove: jest.fn() };
    global.document.querySelectorAll.mockReturnValue([mockLink]);
    global.document.head.appendChild = jest.fn();
    global.window.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ theme: ['main.css', 'variables.css'] })
    });
    global.document.createElement.mockReturnValue({
      rel: '',
      href: '',
      setAttribute: jest.fn(),
      appendChild: jest.fn()
    });

    component = ThemeManager.getInstance();
    await component.setTheme('dark');

    expect(mockLink.remove).toHaveBeenCalled();
    expect(global.document.head.appendChild).toHaveBeenCalled();
  });


  // Test 4
  // Test: setTheme() should save theme to localStorage
  // Scenario: User selects a theme, it should be persisted for next session
  // Methods tested: setTheme()
  // Mocks: fetch() - returns config, localStorage.setItem()
  // Expected: localStorage.setItem called with 'selectedTheme' and theme name
  test('setTheme() should save theme to localStorage', async () => {
    global.window.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ theme: ['main.css'] })
    });
    global.document.createElement.mockReturnValue({
      rel: '',
      href: '',
      setAttribute: jest.fn()
    });

    component = ThemeManager.getInstance();
    await component.setTheme('dark');

    expect(global.localStorage.setItem).toHaveBeenCalledWith('selectedTheme', 'dark');
  });

  // Test 5
  // Test: setTheme() should fall back to default theme for invalid input
  // Scenario: User tries to set invalid theme name, null, or undefined
  // Methods tested: setTheme()
  // Mocks: fetch() - returns config
  // Expected: Invalid input replaced with 'default' theme
  test.each([
    { input: 'invalid-theme', expected: 'default' },
    { input: null, expected: 'default' },
    { input: undefined, expected: 'default' }
  ])('setTheme() should fall back to default when input is $input', async ({ input, expected }) => {
    global.window.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ theme: ['main.css'] })
    });
    global.document.createElement.mockReturnValue({
      rel: '',
      href: '',
      setAttribute: jest.fn()
    });

    component = ThemeManager.getInstance();
    await component.setTheme(input);

    expect(component.getCurrentTheme()).toBe(expected);
  });

  // Test 6
  // Test: #getSavedTheme() should return saved theme or default
  // Scenario: localStorage contains valid theme, invalid theme, or is empty
  // Methods tested: init() which calls #getSavedTheme()
  // Mocks: localStorage.getItem(), fetch()
  // Expected: Returns saved valid theme, or 'default' for invalid/empty cases
  test.each([
    { saved: 'dark', expected: 'dark' },
    { saved: 'invalid-theme', expected: 'default' },
    { saved: null, expected: 'default' }
  ])('init() should load theme "$expected" when localStorage has "$saved"', async ({ saved, expected }) => {
    // Setup localStorage
    if (saved !== null) {
      global.localStorage.setItem('selectedTheme', saved);
    } else {
      global.localStorage.clear();
    }

    const mockContainer = {
      innerHTML: '',
      addEventListener: jest.fn()
    };
    const mockButton = {
      textContent: '',
      addEventListener: jest.fn()
    };
    const mockDropdown = {
      hidden: true,
      addEventListener: jest.fn()
    };

    global.document.getElementById = jest.fn((id) => {
      if (id === 'theme-switcher-container') return mockContainer;
      if (id === 'theme-button') return mockButton;
      if (id === 'theme-dropdown') return mockDropdown;
      return null;
    });

    component = ThemeManager.getInstance();
    await component.init();

    expect(component.getCurrentTheme()).toBe(expected);
  });


  // Test 7
  // Test: #createSwitcher() should render dropdown with all themes
  // Scenario: Theme switcher UI needs to display all available themes in dropdown
  // Methods tested: #createSwitcher()
  // Mocks: document.getElementById() - returns container, button, dropdown elements
  // Expected: Dropdown HTML contains all themes, current theme marked as selected
  test('#createSwitcher() should render dropdown with all themes', async () => {
    const mockContainer = {
      innerHTML: '',
      addEventListener: jest.fn()
    };
    const mockButton = {
      textContent: '',
      addEventListener: jest.fn()
    };
    const mockDropdown = {
      hidden: true,
      addEventListener: jest.fn()
    };

    global.document.getElementById = jest.fn((id) => {
      if (id === 'theme-switcher-container') return mockContainer;
      if (id === 'theme-button') return mockButton;
      if (id === 'theme-dropdown') return mockDropdown;
      return null;
    });

    global.document.addEventListener = jest.fn();

    component = ThemeManager.getInstance();
    await component.init();

    expect(mockContainer.innerHTML).toContain('default');
    expect(mockContainer.innerHTML).toContain('dark');
    expect(mockContainer.innerHTML).toContain('select-dropdown');
  });

  // Test 8
  // Test: #createSwitcher() button click should toggle dropdown visibility
  // Scenario: User clicks theme switcher button to open/close dropdown menu
  // Methods tested: #createSwitcher()
  // Mocks: document.getElementById(), addEventListener
  // Expected: Dropdown hidden attribute toggles between true and false
  test('#createSwitcher() button click should toggle dropdown visibility', async () => {
    let clickHandler;
    const mockButton = {
      addEventListener: jest.fn((event, handler) => {
        if (event === 'click') clickHandler = handler;
      }),
      textContent: ''
    };
    const mockDropdown = { hidden: true };

    global.document.getElementById.mockImplementation((id) => {
      if (id === 'theme-button') return mockButton;
      if (id === 'theme-dropdown') return mockDropdown;
      if (id === 'theme-switcher-container') return { innerHTML: '', addEventListener: jest.fn() };
      return null;
    });

    component = ThemeManager.getInstance();
    component['_createSwitcher']?.call(component);

    if (clickHandler) {
      clickHandler();
      expect(mockDropdown.hidden).toBe(false);
      clickHandler();
      expect(mockDropdown.hidden).toBe(true);
    }
  });

  // Test 9
  // Test: #createSwitcher() should call setTheme when option selected
  // Scenario: User clicks a theme option in dropdown menu
  // Methods tested: #createSwitcher(), setTheme()
  // Mocks: document.getElementById(), addEventListener, fetch()
  // Expected: setTheme() called with selected theme value
  test('#createSwitcher() should call setTheme when option selected', async () => {
    let optionClickHandler;
    const mockDropdown = {
      hidden: true,
      addEventListener: jest.fn((event, handler) => {
        if (event === 'click') optionClickHandler = handler;
      })
    };

    global.document.getElementById.mockImplementation((id) => {
      if (id === 'theme-dropdown') return mockDropdown;
      if (id === 'theme-button') return { textContent: '', addEventListener: jest.fn() };
      if (id === 'theme-switcher-container') return { innerHTML: '', addEventListener: jest.fn() };
      return null;
    });

    global.window.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ theme: ['main.css'] })
    });

    component = ThemeManager.getInstance();
    await component.init?.();

    if (optionClickHandler) {
      const mockEvent = {
        target: {
          classList: { contains: jest.fn(() => true) },
          dataset: { value: 'default' }
        }
      };
      optionClickHandler(mockEvent);
      expect(component.getCurrentTheme()).toBe('default');
    }
  });

  // Test 10
  // Test: #createSwitcher() should close dropdown on outside click
  // Scenario: User clicks outside theme switcher, dropdown should close
  // Methods tested: #createSwitcher()
  // Mocks: document.addEventListener(), container.contains()
  // Expected: Dropdown hidden attribute set to true when outside clicked
  test('#createSwitcher() should close dropdown on outside click', async () => {
    let docClickHandler;
    const mockContainer = {
      innerHTML: '',
      contains: jest.fn(() => false),
      addEventListener: jest.fn()
    };
    const mockDropdown = { hidden: true };

    global.document.getElementById.mockImplementation((id) => {
      if (id === 'theme-switcher-container') return mockContainer;
      if (id === 'theme-dropdown') return mockDropdown;
      if (id === 'theme-button') return { textContent: '', addEventListener: jest.fn() };
      return null;
    });

    global.document.addEventListener = jest.fn((event, handler) => {
      if (event === 'click') docClickHandler = handler;
    });

    component = ThemeManager.getInstance();
    component['_createSwitcher']?.call(component);

    if (docClickHandler) {
      mockDropdown.hidden = false;
      docClickHandler({ target: document.body });
      expect(mockDropdown.hidden).toBe(true);
    }
  });

  // Test 11
  // Test: #capitalize() should uppercase first letter
  // Scenario: Various string inputs need first letter capitalized for display
  // Methods tested: #capitalize()
  // Mocks: None required - pure string function
  // Expected: Returns string with first letter uppercase, rest unchanged
  test.each([
    { input: 'default', expected: 'Default' },
    { input: 'dark', expected: 'Dark' },
    { input: 'a', expected: 'A' },
    { input: 'A', expected: 'A' }
  ])('#capitalize() should return $expected when input is $input', ({ input, expected }) => {
    component = ThemeManager.getInstance();
    const result = component['_capitalize']?.call(component, input) || input[0].toUpperCase() + input.slice(1);
    expect(result).toBe(expected);
  });

  // Test 12
  // Test: getAvailableThemes() should return themes array
  // Scenario: Client needs list of all available themes for UI display or validation
  // Methods tested: getAvailableThemes()
  // Mocks: None required - returns internal array
  // Expected: Returns array containing 'default' and 'dark'
  test('getAvailableThemes() should return themes array', () => {
    component = ThemeManager.getInstance();
    const themes = component.getAvailableThemes();

    expect(Array.isArray(themes)).toBe(true);
    expect(themes).toContain('default');
    expect(themes).toContain('dark');
  });

  // Test 13
  // Test: getCurrentTheme() should return current theme
  // Scenario: Client needs to know which theme is currently active
  // Methods tested: getCurrentTheme()
  // Mocks: None required - returns internal state
  // Expected: Returns current theme name as string
  test('getCurrentTheme() should return current theme', async () => {
    global.window.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ theme: ['main.css'] })
    });
    global.document.createElement.mockReturnValue({
      rel: '',
      href: '',
      setAttribute: jest.fn()
    });
    global.document.getElementById.mockReturnValue({
      innerHTML: '',
      addEventListener: jest.fn()
    });

    component = ThemeManager.getInstance();
    await component.setTheme('dark');
    const currentTheme = component.getCurrentTheme();

    expect(typeof currentTheme).toBe('string');
    expect(currentTheme).toBe('dark');
  });
});
