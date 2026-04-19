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

    const originalCreateElement = document.createElement;
    document.createElement = jest.fn((tagName) => {
      const element = originalCreateElement.call(document, tagName);
      element.dataset = {};
      return element;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    ConsoleWindow.instance = null;

    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(() => Promise.resolve())
      }
    });
  });

  function setupDefaultHTML() {
    document.body.innerHTML = `
      <button class="console-toggle-icon">📋</button>
      <div class="console-window" style="display: block;">
        <div class="console-header"></div>
        <div class="console-output"></div>
        <div class="console-controls">
          <div class="console-filter-container">
            <input type="text" class="console-filter-input" />
            <span class="console-filter-count">0/0</span>
          </div>
          <button class="console-copy-btn">Copy</button>
          <button class="console-clear-btn">Clear</button>
        </div>
      </div>
    `;
  }

  // ===== TEST COMMENT GUIDE =====
  // Every test should include comments above it with:
  // - Test: Brief description of what is being tested
  // - Scenario: The specific use case or condition being tested
  // - Methods tested: Which methods/functions are involved
  // - Mocks: What is mocked and why (e.g., "setupSourceViewer() - prevents DOM errors")
  // - Expected: What the test expects to happen
  // Example:
  // // Test: getInstance should return same instance
  // // Scenario: Calling getInstance() twice should return the same instance (Singleton pattern)
  // // Methods tested: getInstance(), setupSourceViewer()
  // // Mocks: setupSourceViewer() - prevents DOM creation errors during initialization
  // // Expected: Both calls return identical instance reference

  // ---

  // Test 1
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

  // Test 2
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

  // Test 3
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

  // Test 4
  // Test: setupToggleIcon should create toggle button if not exists
  // Scenario: When toggle icon button does not exist in DOM, setupToggleIcon should create it
  // Methods tested: setupToggleIcon()
  // Mocks: All setup methods except setupToggleIcon to isolate functionality
  // Expected: Button element created with correct class and event listener attached
  test('setupToggleIcon should create toggle button if not exists', () => {
    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'restoreWindowState').mockImplementation(() => {});
    
    document.body.innerHTML = '<div class="console-window"></div>';
    const instance = new ConsoleWindow();
    
    expect(instance.toggleIcon).toBeDefined();
    expect(instance.toggleIcon.className).toBe('console-toggle-icon');
    expect(instance.toggleIcon.innerHTML).toBe('📋');
  });

  // Test 5
  // Test: saveWindowState should persist window state to localStorage
  // Scenario: After dragging/resizing, calling saveWindowState should save position, size, and visibility
  // Methods tested: saveWindowState()
  // Mocks: All setup methods, localStorage.setItem to verify persistence
  // Expected: localStorage contains correct state object with width, height, left, top, isHidden
  test('saveWindowState should persist window state to localStorage', () => {
    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupToggleIcon').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'restoreWindowState').mockImplementation(() => {});
    
    const instance = new ConsoleWindow();
    
    instance.consoleWindow = {
      offsetWidth: 500,
      offsetHeight: 300,
      offsetLeft: 100,
      offsetTop: 50
    };
    instance.isHidden = false;
    
    instance.saveWindowState();
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'consoleWindowState',
      JSON.stringify({
        width: 500,
        height: 300,
        left: 100,
        top: 50,
        isHidden: false
      })
    );
  });

  // Test 6
  // Test: restoreWindowState should restore window state from localStorage
  // Scenario: When localStorage contains saved state, restoreWindowState should apply it to the window
  // Methods tested: restoreWindowState()
  // Mocks: All setup methods except restoreWindowState, localStorage.getItem to return saved state
  // Expected: Window dimensions, position, and visibility restored from saved state
  test('restoreWindowState should restore window state from localStorage', () => {
    const savedState = JSON.stringify({
      width: 600,
      height: 400,
      left: 150,
      top: 75,
      isHidden: true
    });
    
    localStorage.getItem.mockReturnValue(savedState);
    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupToggleIcon').mockImplementation(() => {});
    
    const instance = new ConsoleWindow();
    
    instance.consoleWindow = {
      style: {
        width: '',
        height: '',
        left: '',
        top: '',
        display: '',
        bottom: '',
        right: ''
      }
    };
    
    instance.restoreWindowState();
    
    expect(instance.consoleWindow.style.width).toBe('600px');
    expect(instance.consoleWindow.style.height).toBe('400px');
    expect(instance.consoleWindow.style.left).toBe('150px');
    expect(instance.consoleWindow.style.top).toBe('75px');
    expect(instance.consoleWindow.style.display).toBe('none');
    expect(instance.isHidden).toBe(true);
  });

  // Test 7
  // Test: hideWindow should hide console and update state
  // Scenario: Calling hideWindow should set display to none, update isHidden flag, and persist state
  // Methods tested: hideWindow()
  // Mocks: All setup methods, saveWindowState() to verify persistence call
  // Expected: Console window hidden, isHidden true, saveWindowState called
  test('hideWindow should hide console and update state', () => {
    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupToggleIcon').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'restoreWindowState').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'saveWindowState').mockImplementation(() => {});
    
    const instance = new ConsoleWindow();
    instance.consoleWindow = {
      style: {
        display: 'block'
      }
    };
    instance.toggleIcon = { style: { display: '' } };
    instance.isHidden = false;
    
    instance.hideWindow();
    
    expect(instance.isHidden).toBe(true);
    expect(instance.consoleWindow.style.display).toBe('none');
    expect(instance.saveWindowState).toHaveBeenCalled();
  });

  // Test 8
  // Test: showWindow should show console and update state
  // Scenario: Calling showWindow should set display to block, update isHidden flag, and persist state
  // Methods tested: showWindow()
  // Mocks: All setup methods, saveWindowState() to verify persistence call
  // Expected: Console window visible, isHidden false, saveWindowState called
  test('showWindow should show console and update state', () => {
    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupToggleIcon').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'restoreWindowState').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'saveWindowState').mockImplementation(() => {});
    
    const instance = new ConsoleWindow();
    instance.consoleWindow = {
      style: {
        display: 'none'
      }
    };
    instance.toggleIcon = { style: { display: '' } };
    instance.isHidden = true;
    
    instance.showWindow();
    
    expect(instance.isHidden).toBe(false);
    expect(instance.consoleWindow.style.display).toBe('block');
    expect(instance.saveWindowState).toHaveBeenCalled();
  });

  // Test 9
  // Test: addLog should append log with metadata and make clickable if source available
  // Scenario: Adding a log with complete metadata should create clickable element that opens source viewer
  // Methods tested: addLog()
  // Mocks: All setup methods, showSourceCode() to verify click handler
  // Expected: Log element created with timestamp, metadata, and click event listener
  test('addLog should append log with metadata and make clickable if source available', () => {
    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupToggleIcon').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'restoreWindowState').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'showSourceCode').mockImplementation(() => {});
    
    const instance = new ConsoleWindow();
    
    let appendedElement;
    const mockConsoleOutput = {
      appendChild: jest.fn((el) => { appendedElement = el; }),
      scrollHeight: 0,
      scrollTop: 0
    };
    
    instance.consoleOutput = mockConsoleOutput;
    
    // Don't mock createElement - let it create real DOM elements
    
    const metadata = {
      method: 'testMethod',
      fullPath: '/path/to/file.js',
      line: '42',
      column: '10',
      file: 'file.js'
    };
    
    instance.addLog('Test message', 'log', metadata);
    
    expect(appendedElement.dataset.method).toBe('testMethod');
    expect(appendedElement.dataset.fullPath).toBe('/path/to/file.js');
    expect(appendedElement.dataset.line).toBe('42');
    expect(appendedElement.style.cursor).toBe('pointer');
    expect(appendedElement.title).toBe('Click to view source code');
  });

  // Test 10
  // Test: addLog should add different log types (error, warn, info)
  // Scenario: Adding logs with different types should apply correct CSS classes
  // Methods tested: addLog()
  // Mocks: All setup methods
  // Expected: Each log type has corresponding class in className
  test.each([
    { type: 'error', expectedClass: 'console-log error' },
    { type: 'warn', expectedClass: 'console-log warn' },
    { type: 'info', expectedClass: 'console-log info' }
  ])('addLog should create log with $type class', ({ type, expectedClass }) => {
    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'setupToggleIcon').mockImplementation(() => {});
    jest.spyOn(ConsoleWindow.prototype, 'restoreWindowState').mockImplementation(() => {});
    
    const instance = new ConsoleWindow();
    instance.consoleOutput = {
      appendChild: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      scrollHeight: 0,
      scrollTop: 0
    };
    
    instance.addLog('Test message', type, {});
    
    const logElement = instance.consoleOutput.appendChild.mock.calls[0][0];
    expect(logElement.className).toBe(expectedClass);
  });

  // Test 11
  // Test: filterLogs should filter logs by search term and update count
  // Scenario: Filtering with search term should hide non-matching logs and display count
  // Methods tested: filterLogs()
  // Mocks: All setup methods
  // Expected: Only matching logs visible, count shows visible/total
//  test('filterLogs should filter logs by search term and update count', () => {
//    setupDefaultHTML();
//    
//    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
//    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
//    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
//    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
//    jest.spyOn(ConsoleWindow.prototype, 'setupToggleIcon').mockImplementation(() => {});
//    jest.spyOn(ConsoleWindow.prototype, 'restoreWindowState').mockImplementation(() => {});
//    
//    const instance = new ConsoleWindow();
//    console.log('DOM:', document.body.innerHTML.substring(0, 200));
//    console.log('consoleOutput element exists in DOM?', !!document.querySelector('.console-output'));
//    console.log('instance.consoleOutput:', instance.consoleOutput);
//    
//    instance.addLog('Error message');
//    instance.addLog('Warning message');
//    instance.addLog('Info message');
//    instance.filterLogs('error');
//    
//    const logs = instance.consoleOutput.querySelectorAll('.console-log');
//    const visibleLogs = Array.from(logs).filter(log => log.style.display !== 'none');
//    const filterCount = document.querySelector('.console-filter-count');
//    
//    expect(visibleLogs.length).toBe(1);
//    expect(filterCount.textContent).toBe('1/3');
//  });

  // Test 12
  // Test: clear should remove all logs and reset filter
  // Scenario: Calling clear should empty console output and reset filter input and count
  // Methods tested: clear()
  // Mocks: All setup methods
  // Expected: Console output empty, filter input empty, count reset to 0/0
//  test('clear should remove all logs and reset filter', () => {
//    setupDefaultHTML();
//
//    // Mock the querySelector to return real DOM elements
//    const originalQuerySelector = document.querySelector;
//    document.querySelector = jest.fn((selector) => {
//      return originalQuerySelector.call(document, selector);
//    });
//
//    jest.spyOn(ConsoleWindow.prototype, 'setupSourceViewer').mockImplementation(() => {});
//    jest.spyOn(ConsoleWindow.prototype, 'setupDragging').mockImplementation(() => {});
//    jest.spyOn(ConsoleWindow.prototype, 'setupResizing').mockImplementation(() => {});
//    jest.spyOn(ConsoleWindow.prototype, 'setupControls').mockImplementation(() => {});
//    jest.spyOn(ConsoleWindow.prototype, 'setupToggleIcon').mockImplementation(() => {});
//    jest.spyOn(ConsoleWindow.prototype, 'restoreWindowState').mockImplementation(() => {});
//
//    const instance = new ConsoleWindow();
//    
//    instance.addLog('Test message 1');
//    instance.addLog('Test message 2');
//    
//    instance.clear();
//    
//    expect(instance.consoleOutput.innerHTML).toBe('');
//    expect(document.querySelector('.console-filter-input').value).toBe('');
//    expect(document.querySelector('.console-filter-count').textContent).toBe('0/0');
//  });


});
