// Test file for: webclientv1/src/js/pages/dashboard.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { DashboardPage } = loadModules('DashboardPage');

describe('DashboardPage', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: DashboardPage
  // Purpose: Manage user profiles, section navigation, and user session for a dashboard
  // 
  // SETUP OVERVIEW:
  // - jest.useFakeTimers(): Mock setTimeout/setInterval for time-based tests
  // - jest.spyOn(console, 'error'): Suppress console errors during tests
  // - DashboardPage.instance = null: Reset singleton instance between tests
  // - document.body.innerHTML: Mock DOM structure with required elements
  // - Mocking dependencies as needed (e.g., apiClient, authService)
  // 
  // SHARED MOCKS:
  // - apiClient.get() - Mocks the API call to fetch user profile
  // - fetch() - Mocks fetching configuration sections
  // - dashboardSectionManager methods - Prevents errors during section management
  // 
  // TESTING RULES & BEST PRACTICES:
  // 1. Prefer parameterized tests (test.each) instead of repeating similar tests
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
  // 1. fetchUserProfile should retrieve user profile correctly
  // 2. initializeSectionManager should initialize correctly
  // 3. buildSidebarNav should construct menu items based on user roles
  // 4. loadSection should load the specified section
  // 5. showLoadingState should update loading message visibility
  // 6. updateActiveMenuItem should highlight the active menu item
  // 7. getUserRoles should return user roles correctly
  // 8. displayUserInfo should show user information correctly
  // 9. attachLogoutListener should add logout event listener
  // [Add more tests as they are created]

  let component;
  let mockService;

  let originalGetElementById;

  // ===== SETUP =====
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();

    originalGetElementById = document.getElementById;

    // Mock apiClient
    global.apiClient = {
      get: jest.fn().mockImplementation((url) => {
        if (url === '/user/profile') {
          return Promise.resolve({ id: 1, email: 'test@example.com', roles: [] });
        }
        throw new Error('Unknown URL');
      }),
    };

    // Mock authService for logout
    global.authService = {
      logout: jest.fn().mockImplementation(() => Promise.resolve()),
    };

    // Mock dashboardSectionManager
    global.dashboardSectionManager = {
      initialize: jest.fn(),
      getAccessibleSections: jest.fn().mockReturnValue([
        { name: 'profile', title: 'User Profile' },
      ]),
      loadSection: jest.fn().mockResolvedValue(),
      cleanupSection: jest.fn(),
    };

    // Mock UIController
    global.UIController = {
      getInstance: jest.fn().mockReturnValue({
        showMessage: jest.fn(),
      }),
    };

    // Mocked section configuration
    const sectionsConfig = [
      { name: "dashboard", path: "pages/sections/dashboard.html", title: "My Dashboard", roles: ["admin", "customer"] },
      { name: "profile", path: "pages/sections/profile.html", title: "Profile", roles: ["customer", "admin"] }
    ];

    // Mock title and container elements to handle textContent and innerHTML
    const mockTitleElement = { textContent: '' };
    const mockContainerElement = {
      innerHTML: '',
      querySelector: jest.fn((selector) => {
        if (selector === '.section-loading') {
          return { remove: jest.fn() }; // Mocked for loading state
        }
        return null;
      }),
    };

    const realGetById = originalGetElementById;
    global.document.getElementById = jest.fn((id) => {
      if (id === 'section-container') return mockContainerElement;
      if (id === 'section-title') return mockTitleElement;
      return realGetById.call(document, id);
    });

    // Mock fetch
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(sectionsConfig),
      });
    });

    // Mocking the DashboardSection
    window.DashboardSection = {
      init: jest.fn(),
      cleanup: jest.fn(),
    };
  });


  // Clean up after each test
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    DashboardPage.instance = null;
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

  // ===== TEST CASES =====

  // Test 1
  // Test: fetchUserProfile should retrieve user profile correctly
  // Scenario: Calling fetchUserProfile() should succeed and store user data
  // Methods tested: fetchUserProfile()
  // Mocks: apiClient.get() - Mocks API call to return user data
  // Expected: User profile is fetched and stored in localStorage
  test('fetchUserProfile should retrieve user profile correctly', async () => {
    const userProfileData = { id: 1, email: 'test@example.com', roles: [] };
    apiClient.get = jest.fn().mockResolvedValue(userProfileData);
    
    await DashboardPage.fetchUserProfile();
    
    expect(localStorage.getItem('user_data')).toEqual(JSON.stringify(userProfileData));
  });

  // Test 2
  // Test: initializeSectionManager should initialize correctly
  // Scenario: Calling initializeSectionManager() should load sections from config
  // Methods tested: initializeSectionManager()
  // Mocks: fetch() - Mocks fetching config sections
  // Expected: Sections should be set correctly
  test('initializeSectionManager should initialize correctly', async () => {
    const configData = { sections: [{ name: 'profile', title: 'User Profile' }] };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(configData),
    });

    await DashboardPage.initializeSectionManager();

    expect(dashboardSectionManager.initialize).toHaveBeenCalledWith(configData.sections);
  });

  // Test 3
  // Test: buildSidebarNav should construct menu items based on user roles
  // Scenario: Calling buildSidebarNav() should create menu items based on accessible sections
  // Methods tested: buildSidebarNav(), getUserRoles()
  // Mocks: dashboardSectionManager.getAccessibleSections() - Mocked to return section list
  // Expected: Sidebar menu items are updated
  test('buildSidebarNav should construct menu items based on user roles', () => {
    // Mock sidebar menu element
    const mockSidebarMenu = {
      innerHTML: '',
      appendChild: jest.fn(),
    };
    
    document.getElementById = jest.fn((id) => {
      if (id === 'sidebar-menu') return mockSidebarMenu;
      return null;
    });

    // Mock user roles to return a valid response
    const userRoles = ['admin'];
    jest.spyOn(DashboardPage, 'getUserRoles').mockReturnValue(userRoles);

    // Mock accessible sections
    dashboardSectionManager.getAccessibleSections.mockReturnValue([
      { name: 'profile', title: 'User Profile' },
    ]);

    // Call the method to build the sidebar navigation
    DashboardPage.buildSidebarNav();

    // Assert that appendChild was called once (one menu item added)
    expect(mockSidebarMenu.appendChild).toHaveBeenCalledTimes(1);
    
    // Assert that innerHTML was cleared
    expect(mockSidebarMenu.innerHTML).toBe('');
  });

  // Test 4
  // Test: loadSection should load the specified section
  // Scenario: Calling loadSection('profile') should trigger loading process
  // Methods tested: loadSection(), dashboardSectionManager.loadSection()
  // Mocks: dashboardSectionManager.loadSection() - Mocked to simulate loading
  // Expected: The current section variable is updated
  test('loadSection should load the specified section', async () => {
    dashboardSectionManager.loadSection = jest.fn().mockResolvedValue();

    await DashboardPage.loadSection('profile');

    expect(dashboardSectionManager.loadSection).toHaveBeenCalledWith('profile', expect.any(Array));
    expect(DashboardPage.currentSection).toBe('profile');
  });

  // Test 5
  // Test: showLoadingState should update loading message visibility
  // Scenario: Calling showLoadingState(true) should display loading message; calling it with false should remove it
  // Methods tested: showLoadingState()
  // Mocks: None
  // Expected: Loading message appears or disappears as expected
  test('showLoadingState should update loading message visibility', () => {
    const mockContainerElement = {
      innerHTML: '',
      querySelector: jest.fn((selector) => {
        if (selector === '.section-loading') {
          return { remove: jest.fn() }; // Mocked for loading state
        }
        return null;
      }),
    };

    // Mock getElementById for the container
    global.document.getElementById = jest.fn((id) => {
      if (id === 'section-container') return mockContainerElement;
      return null; 
    });

    // Show loading state
    DashboardPage.showLoadingState(true);
    expect(mockContainerElement.innerHTML).toContain('Loading section...');

    // Hide loading state
    DashboardPage.showLoadingState(false);
    expect(mockContainerElement.querySelector).toHaveBeenCalledWith('.section-loading');
  });


  // Test 6
  // Test: updateActiveMenuItem should highlight the active menu item
  // Scenario: Calling updateActiveMenuItem('profile') should add 'active' class to the menu item
  // Methods tested: updateActiveMenuItem()
  // Mocks: None
  // Expected: Corresponding menu item gets the 'active' class
  test('updateActiveMenuItem should highlight the active menu item', () => {
    // Mock querySelectorAll to return fake menu items
    const mockProfileItem = { classList: { remove: jest.fn(), add: jest.fn() } };
    const mockDashboardItem = { classList: { remove: jest.fn(), add: jest.fn() } };
    
    document.querySelectorAll = jest.fn(() => [mockProfileItem, mockDashboardItem]);
    document.getElementById = jest.fn((id) => {
      if (id === 'menu-profile') return mockProfileItem;
      if (id === 'menu-dashboard') return mockDashboardItem;
      return null;
    });

    // Call the method
    DashboardPage.updateActiveMenuItem('profile');

    // Assert classList methods were called correctly
    expect(mockProfileItem.classList.add).toHaveBeenCalledWith('active');
    expect(mockDashboardItem.classList.remove).toHaveBeenCalledWith('active');
  });

  // Test 7
  // Test: getUserRoles should return user roles correctly
  // Scenario: Calling getUserRoles() should return an array of roles from the user profile
  // Methods tested: getUserRoles()
  // Mocks: None
  // Expected: Correct roles are returned as an array
  test('getUserRoles should return user roles correctly', () => {
    // Set up a mock user profile with roles
    DashboardPage.userProfile = { roles: ['admin', 'editor'] };

    // Call the method to get user roles
    const roles = DashboardPage.getUserRoles();

    // Assert that the correct roles are returned
    expect(roles).toEqual(['admin', 'editor']);
  });

  // Test 8
  // Test: displayUserInfo should show user information correctly
  // Scenario: Calling displayUserInfo() should update user email or name display
  // Methods tested: displayUserInfo()
  // Mocks: None
  // Expected: User email or name appears in the dashboard
  test('displayUserInfo should show user information correctly', () => {
    const mockUserProfile = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    DashboardPage.userProfile = mockUserProfile;

    const mockEmailElement = {
      textContent: '',
    };

    // Mock getElementById for the email display
    global.document.getElementById = jest.fn((id) => {
      if (id === 'dashboard-user-email') return mockEmailElement;
      return null;
    });

    // Call the function to display user info
    DashboardPage.displayUserInfo();

    // Assert that the user's full name is displayed
    expect(mockEmailElement.textContent).toBe('John Doe');
  });

  // Test 9
  // Test: attachLogoutListener should add logout event listener
  // Scenario: Calling attachLogoutListener() should link a logout function to the logout button
  // Methods tested: attachLogoutListener()
  // Mocks: None
  // Expected: Logout listener is correctly attached and functional
  test('attachLogoutListener should add logout event listener', () => {
    const mockLogoutBtn = {
      addEventListener: jest.fn(),
    };

    // Mock getElementById for the logout button
    global.document.getElementById = jest.fn((id) => {
      if (id === 'sidebar-logout-btn') return mockLogoutBtn;
      return null; 
    });

    // Call the function to attach the logout listener
    DashboardPage.attachLogoutListener();

    // Assert that the logout event listener is added
    expect(mockLogoutBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

});
