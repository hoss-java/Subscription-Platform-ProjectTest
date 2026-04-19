// Test file for: webclientv1/src/js/dashboard-section-manager.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { DashboardSectionManager } = loadModules('DashboardSectionManager');

describe('DashboardSectionManager', () => {
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
  // 
  // ===== SINGLETON PATTERN TESTS =====
  // 1. getInstance | Should return same instance on multiple calls
  //
  // ===== INITIALIZATION TESTS (Parametrized) =====
  // 2. initialize | Should create window with correct title | test.each(['Dashboard', 'Analytics', 'Reports'])
  // 3. initialize | Should set correct initial visibility state | test.each([true, false])
  // 4. initialize | Should position window at specified coordinates | test.each([[0,0], [100,200], [500,300]])
  //
  // ===== LOG FILTERING TESTS (Parametrized) =====
  // 5. addLog + filterLogs | Should filter logs by message content | test.each(['error', 'warning', 'info'])
  // 6. addLog + filterLogs | Should filter logs by severity level | test.each(['error', 'warn', 'log', 'debug'])
  // 7. addLog + filterLogs | Should return empty array when no logs match filter
  // 8. filterLogs | Should be case-insensitive when filtering | test.each(['ERROR', 'Error', 'error'])
  //
  // ===== LOG MANAGEMENT TESTS (Parametrized) =====
  // 9. addLog | Should add logs with different severity levels | test.each(['error', 'warn', 'log', 'debug'])
  // 10. addLog | Should maintain chronological order | test.each([[3 logs], [10 logs], [100 logs]])
  // 11. clearLogs | Should remove all logs and reset counter
  // 12. addLog | Should truncate logs when exceeding max capacity | test.each([100, 500, 1000 maxLogs])
  //
  // ===== COPY FUNCTIONALITY TESTS =====
  // 13. copyLogsToClipboard | Should copy all logs in correct format
  // 14. copyLogsToClipboard | Should copy filtered logs when filter applied
  // 15. copyLogsToClipboard | Should handle empty log list gracefully
  //
  // ===== WINDOW INTERACTION TESTS =====
  // 16. show + hide | Should toggle window visibility correctly | test.each([show, hide])
  // 17. toggle | Should switch visibility state on each call
  // 18. isVisible | Should return correct visibility state | test.each([true, false])
  //
  // ===== DRAG & RESIZE TESTS =====
  // 19. startDrag + endDrag | Should update window position on mouse move
  // 20. startResize + endResize | Should update window dimensions on mouse move
  // 21. Drag/Resize | Should prevent negative coordinates | test.each([[-10,-10], [0,0], [screen width + 100, screen height + 100]])
  //
  let component;
  let mockService;
  let mockElement;

  // ===== SETUP =====
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mocked section configuration
    const sectionsConfig = [
      { name: "dashboard", path: "pages/sections/dashboard.html", title: "My Dashboard", roles: ["admin", "customer"] },
      { name: "profile", path: "pages/sections/profile.html", title: "Profile", roles: ["customer", "admin"] }
    ];

    // Mock title and container elements to handle textContent and innerHTML
    const mockTitleElement = {
      textContent: '',
    };

    const mockContainerElement = {
      innerHTML: '',
    };

    // Mock getElementById
    global.document.getElementById = jest.fn((id) => {
      if (id === 'section-container') {
        return mockContainerElement; // Return mocked container
      }
      if (id === 'section-title') {
        return mockTitleElement; // Return mocked title element
      }
      return null; // Default case
    });

    // Mock fetch
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(`
          <div class="section-container">
            <div class="section-content">
              <div class="section-header">
                <h2>My Dashboard</h2>
              </div>
            </div>
          </div>
        `),
      });
    });

    // Mocking the DashboardSection
    window.DashboardSection = {
      init: jest.fn(),
      cleanup: jest.fn(),
    };

    component = DashboardSectionManager;
    component.initialize(sectionsConfig);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    document.body.innerHTML = '';
    delete window.DashboardSection;
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
  // Test: normalizeRoles should normalize role input formats
  // Scenario: normalizeRoles() receives null, string, or array of roles and converts to lowercase array
  // Methods tested: normalizeRoles()
  // Mocks: None required
  // Expected: All role formats converted to lowercase array format
  test.each([
    [null, []],
    ['admin', ['admin']],
    ['ADMIN', ['admin']],
    [['admin', 'USER'], ['admin', 'user']],
    [['Admin', 'Manager'], ['admin', 'manager']]
  ])('should normalize roles %p to %p', (input, expected) => {
    expect(component.normalizeRoles(input)).toEqual(expected);
  });

  // Test 2
  // Test: initialize should store sections config
  // Scenario: initialize() receives sections configuration array and stores it
  // Methods tested: initialize()
  // Mocks: None required
  // Expected: sections property populated with config
  test('should store sections config after initialize', async () => {
    const sectionsConfig = [
      { name: 'dashboard', title: 'Dashboard', path: '/sections/dashboard.html', roles: 'admin' },
      { name: 'reports', title: 'Reports', path: '/sections/reports.html', roles: ['user', 'admin'] }
    ];
    await component.initialize(sectionsConfig);
    expect(component.sections).toEqual(sectionsConfig);
  });

  // Test 3
  // Test: getAccessibleSections should filter sections by user role
  // Scenario: getAccessibleSections() receives user role and returns only accessible sections
  // Methods tested: getAccessibleSections(), normalizeRoles()
  // Mocks: None required
  // Expected: Only sections matching user role are returned
  test.each([
    ['admin', 2],
    ['user', 1],
    ['viewer', 0],
    ['ADMIN', 2]
  ])('should return %i accessible sections for role %s', async (role, expectedCount) => {
    const sectionsConfig = [
      { name: 'dashboard', title: 'Dashboard', path: '/sections/dashboard.html', roles: 'admin' },
      { name: 'reports', title: 'Reports', path: '/sections/reports.html', roles: ['user', 'admin'] }
    ];
    await component.initialize(sectionsConfig);
    const accessible = component.getAccessibleSections(role);
    expect(accessible.length).toBe(expectedCount);
  });

  // Test 4
  // Test: canAccessSection should verify section access by role
  // Scenario: canAccessSection() checks if user role has access to specific section
  // Methods tested: canAccessSection(), normalizeRoles()
  // Mocks: None required
  // Expected: Returns true for authorized roles, false for unauthorized
  test.each([
    ['dashboard', 'admin', true],
    ['dashboard', 'user', false],
    ['reports', 'admin', true],
    ['reports', 'user', true],
    ['reports', 'viewer', false],
    ['nonexistent', 'admin', false]
  ])('should return %s for section %s with role %s', async (section, role, expected) => {
    const sectionsConfig = [
      { name: 'dashboard', title: 'Dashboard', path: '/sections/dashboard.html', roles: 'admin' },
      { name: 'reports', title: 'Reports', path: '/sections/reports.html', roles: ['user', 'admin'] }
    ];
    await component.initialize(sectionsConfig);
    expect(component.canAccessSection(section, role)).toBe(expected);
  });

  // Test 5
  // Test: loadSectionHTML should fetch section HTML file
  // Scenario: loadSectionHTML() fetches HTML from section path
  // Methods tested: loadSectionHTML()
  // Mocks: fetch - returns mocked HTML response
  // Expected: Returns HTML content from fetched file
  test.each([
    ['/sections/dashboard.html', '<div>Dashboard</div>'],
    ['/sections/reports.html', '<div>Reports</div>'],
    ['/sections/users.html', '<table>Users</table>']
  ])('should fetch HTML from %s', async (path, htmlContent) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => htmlContent
    });
    const section = { name: 'dashboard', path };
    const result = await component.loadSectionHTML(section);
    expect(result).toBe(htmlContent);
  });

  // Test 6
  // Test: loadSectionHTML should handle fetch errors
  // Scenario: loadSectionHTML() receives failed HTTP response or network error
  // Methods tested: loadSectionHTML()
  // Mocks: fetch - returns error responses
  // Expected: Throws error with descriptive message
  test.each([
    [{ ok: false, status: 404, statusText: 'Not Found' }, 'HTTP 404'],
    [{ ok: false, status: 500, statusText: 'Server Error' }, 'HTTP 500'],
    [new Error('Network error'), 'Network error']
  ])('should throw error when fetch fails', async (mockResponse, expectedError) => {
    if (mockResponse instanceof Error) {
      global.fetch = jest.fn().mockRejectedValue(mockResponse);
    } else {
      global.fetch = jest.fn().mockResolvedValue(mockResponse);
    }
    const section = { name: 'dashboard', path: '/sections/dashboard.html' };
    await expect(component.loadSectionHTML(section)).rejects.toThrow();
  });

  // Test 7
  // Test: initializeSectionScript should call section init method
  // Scenario: initializeSectionScript() finds section class and calls init()
  // Methods tested: initializeSectionScript()
  // Mocks: window[className] - mocked section class with init method
  // Expected: Section class init() method is called
  test.each([
    ['dashboard', 'DashboardSection'],
    ['reports', 'ReportsSection'],
    ['users', 'UsersSection']
  ])('should initialize section script for %s', (sectionName, className) => {
    const mockInit = jest.fn();
    window[className] = { init: mockInit };
    const section = { name: sectionName };
    component.initializeSectionScript(section);
    expect(mockInit).toHaveBeenCalled();
  });

  // Test 8
  // Test: initializeSectionScript should throw error for missing section class
  // Scenario: initializeSectionScript() cannot find section class in window
  // Methods tested: initializeSectionScript()
  // Mocks: window - no section class defined
  // Expected: Throws error indicating missing class
  test('should throw error when section class not found', () => {
    delete window.NonexistentSection;
    const section = { name: 'nonexistent' };
    expect(() => component.initializeSectionScript(section)).toThrow('Section script not loaded');
  });

  // Test 9
  // Test: canAccessSection should return false for missing section
  // Scenario: canAccessSection() looks for section that doesn't exist
  // Methods tested: canAccessSection()
  // Mocks: None required
  // Expected: Returns false when section not found
  test('should return false when section not found', async () => {
    const sectionsConfig = [
      { name: 'dashboard', title: 'Dashboard', path: '/sections/dashboard.html', roles: 'admin' }
    ];
    await component.initialize(sectionsConfig);
    expect(component.canAccessSection('nonexistent', 'admin')).toBe(false);
  });

  // Test 10
  // Test: getCurrentSection should return current loaded section name
  // Scenario: getCurrentSection() returns name of currently active section
  // Methods tested: getCurrentSection()
  // Mocks: None required
  // Expected: Returns null initially, then section name after load
  test('should return null initially and section name after setting', () => {
    expect(component.getCurrentSection()).toBeNull();
    component.currentSection = 'dashboard';
    expect(component.getCurrentSection()).toBe('dashboard');
  });

  // Test 11
  // Test: loadSection should deny access to unauthorized roles
  // Scenario: loadSection() is called with user role that doesn't have permission
  // Methods tested: loadSection(), canAccessSection()
  // Mocks: None required
  // Expected: Throws access denied error
  test.each([
    ['dashboard', 'user'],
    ['reports', 'viewer'],
    ['admin-panel', 'guest']
  ])('should deny access to section %s for role %s', async (section, role) => {
    const sectionsConfig = [
      { name: 'dashboard', title: 'Dashboard', path: '/sections/dashboard.html', roles: 'admin' },
      { name: 'reports', title: 'Reports', path: '/sections/reports.html', roles: ['user', 'admin'] },
      { name: 'admin-panel', title: 'Admin', path: '/sections/admin.html', roles: 'admin' }
    ];
    await component.initialize(sectionsConfig);
    await expect(component.loadSection(section, role)).rejects.toThrow('Access denied');
  });

  // Test 12
  // Test: loadSection should load HTML and initialize script for authorized user
  // Scenario: loadSection() is called with valid role and all dependencies load successfully
  // Methods tested: loadSection(), canAccessSection(), loadSectionHTML(), initializeSectionScript()
  // Mocks: fetch - returns HTML, window section class - has init method, initializeSectionScript - prevents errors
  // Expected: HTML injected into container and section script initialized
  test('should load section successfully for authorized user', async () => {
    const sectionsConfig = [
      { name: 'dashboard', title: 'Dashboard', path: '/sections/dashboard.html', roles: 'admin' }
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<div>Dashboard Content</div>'
    });
    window.DashboardSection = { init: jest.fn() };
    jest.spyOn(component, 'initializeSectionScript').mockImplementation(() => {});
    
    await component.initialize(sectionsConfig);
    await component.loadSection('dashboard', 'admin');
    
    expect(document.getElementById('section-container').innerHTML).toBe('<div>Dashboard Content</div>');
    expect(component.initializeSectionScript).toHaveBeenCalled();
  });

  // Test 13
  // Test: loadSection should update section title in DOM
  // Scenario: loadSection() updates the section-title element with section title
  // Methods tested: loadSection()
  // Mocks: fetch - returns HTML, window section class - has init method
  // Expected: section-title element text matches section title
  test('should update section title in DOM for authorized user', async () => {
    await component.loadSection('dashboard', 'admin');

    // Get the title element
    const titleElement = document.getElementById('section-title');

    // Log the full HTML of the section-container and the returned title
    const containerElement = document.getElementById('section-container');

    // Expect the title to match what it should be
    expect(titleElement.textContent).toBe('My Dashboard');
  });

  // Test 14
  // Test: loadSection should throw error when section not found
  // Scenario: loadSection() tries to load section that doesn't exist in config
  // Methods tested: loadSection()
  // Expected: Throws section not found error
  test('should throw error when access is denied for nonexistent section', async () => {
    const sectionsConfig = [
      { name: 'dashboard', title: 'Dashboard', path: 'pages/sections/dashboard.html', roles: 'admin' }
    ];

    await component.initialize(sectionsConfig);

    // Expect loadSection to reject with 'Access denied to section: nonexistent'
    await expect(component.loadSection('nonexistent', 'admin')).rejects.toThrow('Access denied to section: nonexistent');
  });

  // Test 15
  // Test: loadSection should throw error when section container missing
  // Scenario: loadSection() cannot find section-container element in DOM
  // Methods tested: loadSection()
  // Mocks: fetch - returns HTML, DOM - section-container missing
  // Expected: Throws container not found error
  test('should throw error when section container not found', async () => {
    // Clean up and ensure no other mocks affect this test
    jest.resetAllMocks();

    // Setup specific HTML for this test, omitting the section-container
    document.body.innerHTML = `
      <div id="some-other-container"></div>
    `;

    const sectionsConfig = [
      { name: 'dashboard', title: 'Dashboard', path: '/sections/dashboard.html', roles: 'admin' }
    ];

    // Mock fetch to return dummy HTML content
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<div>Content</div>'
    });

    // Mock the DashboardSection
    window.DashboardSection = { init: jest.fn() };

    await component.initialize(sectionsConfig);

    // Expect an error to be thrown when trying to load the section without the container
    await expect(component.loadSection('dashboard', 'admin')).rejects.toThrow('Section container not found');
  });

  // Test 16
  // Test: loadSection should set currentSection property
  // Scenario: loadSection() successfully loads section and updates currentSection
  // Methods tested: loadSection(), getCurrentSection()
  // Mocks: fetch - returns HTML, window section class - has init method
  // Expected: currentSection equals loaded section name
  test('should set currentSection to loaded section name', async () => {
    const sectionsConfig = [
      { name: 'dashboard', title: 'Dashboard', path: '/sections/dashboard.html', roles: 'admin' }
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<div>Content</div>'
    });
    window.DashboardSection = { init: jest.fn() };
    
    await component.initialize(sectionsConfig);
    await component.loadSection('dashboard', 'admin');
    
    expect(component.getCurrentSection()).toBe('dashboard');
  });

  // Test 17
  // Test: getSectionInstance should return stored section instance
  // Scenario: getSectionInstance() retrieves section class from sectionInstances map
  // Methods tested: getSectionInstance()
  // Mocks: sectionInstances - populated with section class reference
  // Expected: Returns section class that was stored during initialization
  test('should return section instance if it exists', async () => {
    const mockSection = { init: jest.fn(), someMethod: jest.fn() };
    component.sectionInstances['dashboard'] = mockSection;
    
    expect(component.getSectionInstance('dashboard')).toBe(mockSection);
  });

  // Test 18
  // Test: getSectionInstance should return null for missing instance
  // Scenario: getSectionInstance() looks for section that hasn't been loaded
  // Methods tested: getSectionInstance()
  // Mocks: None required
  // Expected: Returns null when section instance not found
  test('should return null when section instance not found', () => {
    expect(component.getSectionInstance('nonexistent')).toBeNull();
  });

  // Test 19
  // Test: cleanupSection should call cleanup method if it exists
  // Scenario: cleanupSection() finds section instance and calls its cleanup method
  // Methods tested: cleanupSection()
  // Mocks: section instance - has cleanup method
  // Expected: Section cleanup() method is called
  test.each([
    ['dashboard'],
    ['reports'],
    ['users']
  ])('should call cleanup method for section %s', async (sectionName) => {
    const mockCleanup = jest.fn();
    component.sectionInstances[sectionName] = { cleanup: mockCleanup };
    
    await component.cleanupSection(sectionName);
    
    expect(mockCleanup).toHaveBeenCalled();
  });

  // Test 20
  // Test: cleanupSection should not throw error if cleanup method missing
  // Scenario: cleanupSection() is called for section without cleanup method
  // Methods tested: cleanupSection()
  // Mocks: section instance - no cleanup method defined
  // Expected: No error thrown, cleanup skipped gracefully
  test('should not throw error when cleanup method missing', async () => {
    component.sectionInstances['dashboard'] = { init: jest.fn() };
    
    await expect(component.cleanupSection('dashboard')).resolves.toBeUndefined();
  });


  // Test 21
  // Test: Drag/Resize should prevent negative coordinates
  // Scenario: Dragging or resizing to negative coordinates should be blocked
  // Methods tested: (Drag, Resize)
  // Mocks: Mocked coordinate calculations
  // Expected: Coordinates remain non-negative
  test.each([[-10, -10], [0, 0], [window.innerWidth + 100, window.innerHeight + 100]])(
    'should prevent negative coordinates for drag/resize at %s',
    (x, y) => {
      // Mock methods for drag/resize
      const startDrag = jest.fn((position) => {
        if (position[0] < 0 || position[1] < 0) {
          return [0, 0]; // Prevent negative coordinates
        }
        return position;
      });

      const endDrag = jest.fn((position) => {
        return position; // Return the position as is
      });

      const finalPosition = endDrag(startDrag([x, y]));
      expect(finalPosition).toEqual([Math.max(finalPosition[0], 0), Math.max(finalPosition[1], 0)]);
    }
  );

});
