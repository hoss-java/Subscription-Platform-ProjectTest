// Test file for: webclientv1/src/js/console.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { ConsoleWindow } = loadModules('ConsoleWindow');

describe('ConsoleWindow', () => {
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
  // - navigator.clipboard: Mock clipboard API for copy operations
  // - localStorage: Mock browser storage for window state persistence
  // - fetch: Mock API calls for loading source files
  //
  // TESTING RULES & BEST PRACTICES:
  // 1. Prefer parametrized tests (test.each) instead of repeating similar tests
  // 2. Unit tests should mock all external dependencies (DOM, fetch, localStorage, clipboard)
  // 3. One assertion per test concept
  // 4. Use descriptive test names: "should [expected behavior] when [condition]"
  // 5. Mock methods that cause side effects
  // 6. Clean up after each test (reset mocks, clear timers, restore spies)
  //
  // TEST INVENTORY FOR ConsoleWindow:
  // 1. getInstance should return same instance - Singleton pattern verification
  // 2. Constructor should initialize all properties correctly
  // 3. setupToggleIcon should create toggle button if not exists
  // 4. toggleWindowVisibility should toggle between show and hide
  // 5. hideWindow should hide console and update state
  // 6. showWindow should show console and update state
  // 7. saveWindowState should save position, size, and visibility to localStorage
  // 8. restoreWindowState should restore from localStorage
  // 9. setupDragging should allow dragging console window
  // 10. setupResizing should allow resizing from bottom-right corner
  // 11. addLog should append log to console output with timestamp
  // 12. filterLogs should filter logs by search term
  // 13. copyAllLogs should copy visible logs to clipboard
  // 14. clear should clear output and reset filter
  // 15. fetchSourceFile should fetch and cache source code
  // 16. showSourceCode should display source code modal
  // 17. closeSourceViewer should hide source code modal
  // 18. copySourceCode should copy current source code to clipboard
  // 19. scrollToLine should scroll to specific line in source viewer
  // 20. formatCodeLines should format code with line numbers and highlights

  let component;
  let mockService;
  let mockElement;

  // ===== SETUP =====
beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('10:30:45 AM');
  ConsoleWindow.instance = null;

  document.body.innerHTML = `
    <button class="console-toggle-icon">📋</button>
    <div class="console-window" style="display: block;">
      <div class="console-header"></div>
      <div class="console-output"></div>
      <div class="console-controls">
        <button class="console-copy-btn">Copy</button>
        <button class="console-clear-btn">Clear</button>
      </div>
    </div>
  `;
});



  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    ConsoleWindow.instance = null;
  });

  // Test: getInstance should return same instance
  // Scenario: Calling getInstance() twice should return the same instance (Singleton pattern)
  // Methods tested: getInstance(), setupSourceViewer()
  // Mocks: setupSourceViewer() - prevents DOM creation errors during initialization
  // Expected: Both calls return identical instance reference
  test('getInstance should return same instance', () => {
    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
    
    const instance1 = ConsoleWindow.getInstance();
    const instance2 = ConsoleWindow.getInstance();
    expect(instance1).toBe(instance2);
  });

  // Test: Constructor should initialize all properties correctly
  // Scenario: Creating a new ConsoleWindow instance should set all default values and call setup methods
  // Methods tested: constructor, property initialization
  // Mocks: setupSourceViewer(), setupDragging(), setupResizing(), setupControls(), setupToggleIcon(), restoreWindowState() - prevent DOM errors
  // Expected: All properties initialized with correct default values
  test('Constructor should initialize all properties correctly', () => {
    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupToggleIcon').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'restoreWindowState').mockImplementation(() => {});

    const instance = new ConsoleWindow();

    expect(instance.isDragging).toBe(false);
    expect(instance.isResizing).toBe(false);
    expect(instance.isHidden).toBe(false);
    expect(instance.minWidth).toBe(250);
    expect(instance.minHeight).toBe(150);
    expect(instance.sourceCache).toEqual({});
    expect(instance.storageKey).toBe('consoleWindowState');
  });

  // Test: toggleWindowVisibility should switch between hide and show
  // Scenario: Calling toggleWindowVisibility() when hidden should show window, and vice versa
  // Methods tested: toggleWindowVisibility(), hideWindow(), showWindow()
  // Mocks: All setup methods, saveWindowState() - prevent DOM errors
  // Expected: Window display toggles and isHidden state changes accordingly
  test('toggleWindowVisibility should switch between hide and show', () => {
    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupToggleIcon').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'restoreWindowState').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'saveWindowState').mockImplementation(() => {});

    const instance = new ConsoleWindow();
    const mockConsoleWindow = document.createElement('div');
    mockConsoleWindow.className = 'console-window';
    instance.consoleWindow = mockConsoleWindow;
    instance.toggleIcon = document.createElement('button');

    instance.toggleWindowVisibility();
    expect(instance.isHidden).toBe(true);
    expect(mockConsoleWindow.style.display).toBe('none');

    instance.toggleWindowVisibility();
    expect(instance.isHidden).toBe(false);
    expect(mockConsoleWindow.style.display).toBe('block');
  });

});
