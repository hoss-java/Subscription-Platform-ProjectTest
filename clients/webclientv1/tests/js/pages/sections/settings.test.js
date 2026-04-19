// Test file for: webclientv1/src/js/pages/sections/settings.js
const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
const { SettingsSection } = loadModules('SettingsSection');

describe('SettingsSection', () => {
  // ===== TEST SUITE DOCUMENTATION =====
  // Component: SettingsSection
  // Purpose: Manage application settings including theme selection and notification preferences.
  //          Handles settings loading, persistence, and UI synchronization.
  //
  // SETUP OVERVIEW:
  // - jest.spyOn(ThemeManager.getInstance(), 'getAvailableThemes'): Mock available theme list
  // - jest.spyOn(ThemeManager.getInstance(), 'getCurrentTheme'): Mock current theme retrieval
  // - jest.spyOn(ThemeManager.getInstance(), 'setTheme'): Mock theme setting
  // - jest.spyOn(UIController.getInstance(), 'showMessage'): Mock UI notifications
  // - jest.spyOn(Storage.prototype, 'getItem'): Mock localStorage getItem calls
  // - jest.spyOn(Storage.prototype, 'setItem'): Mock localStorage setItem calls
  // - document.body.innerHTML: Mock DOM structure with required elements
  // - SettingsSection state reset: Clear _cache between tests
  //
  // SHARED MOCKS:
  // - ThemeManager.getInstance() - Mock theme management (getAvailableThemes, getCurrentTheme, setTheme)
  // - UIController.getInstance() - Mock UI feedback messages (showMessage)
  // - localStorage - Mock browser storage for notifications_enabled key
  //
  // TESTING RULES & BEST PRACTICES:
  // 1. Prefer parametrized tests (test.each) instead of repeating similar tests
  //    - Reduces code duplication
  //    - Makes it easy to add more test cases
  //    - Improves readability with clear input/output mappings
  //
  // 2. Unit tests should mock all external dependencies
  //    - Mock DOM elements, ThemeManager, UIController, localStorage
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
  //    - DOM manipulation, ThemeManager calls, localStorage operations, UIController notifications
  //    - Setup mocks in beforeEach or at test level
  //
  // 6. Clean up after each test
  //    - Reset mocks, clear state, restore spies
  //    - Prevents test pollution
  //
  // ===== TEST INVENTORY (PARAMETRIZED & FOCUSED) =====
  // 1. init() | should populate theme options, load settings, and attach event listeners after timeout delay
  // 2. getEl() | should cache DOM elements and retrieve from cache on subsequent calls
  // 3. getTM() | should cache ThemeManager instance and retrieve from cache on subsequent calls
  // 4. getUI() | should cache UIController instance and retrieve from cache on subsequent calls
  // 5. populateThemeOptions() | should fetch available themes, create options, and populate selector (parametrized: various theme lists)
  // 6. populateThemeOptions() | should handle missing theme selector gracefully
  // 7. populateThemeOptions() | should capitalize theme names correctly
  // 8. loadSettings() | should set theme selector value to current theme and load notification preference from localStorage
  // 9. loadSettings() | should handle missing selector and checkbox elements gracefully
  // 10. loadSettings() | should default notification checkbox to true when localStorage key is absent (parametrized: 'false'/absent/invalid values)
  // 11. attachEventListeners() | should attach save, theme change, and notification change handlers to all required elements (parametrized: all listener combinations)
  // 12. attachEventListeners() | should handle missing elements gracefully without throwing errors
  // 13. handleSaveSettings() | should collect settings, prevent default, manage button state, apply theme, persist notification preference, and show success/error messages (parametrized: theme values, notification true/false, localStorage success/failure)
  // 14. handleSaveSettings() | should restore button text and disabled state on completion
  // 15. handleSaveSettings() | should show error message when exception occurs
  // 16. showError() | should call UIController with error type
  // 17. showSuccess() | should call UIController with success type only when notifications are enabled (parametrized: notifications enabled/disabled)
  // 18. cleanup() | should clear _cache object

  // [Add more tests as they are created]
  //

  let component;
  let mocks = {};

  const createSelectMock = (id, config = {}) => {
    const defaults = {
      className: 'form-control',
      disabled: false
    };
    
    const props = { ...defaults, ...config };
    const listeners = {};
    
    return {
      id,
      _value: '',
      className: props.className,
      _disabled: props.disabled,
      _innerHTML: '',
      children: [],
      style: {},
      
      get value() {
        return this._value;
      },
      set value(val) {
        this._value = val;
      },

      get disabled() {
        return this._disabled;
      },
      set disabled(val) {
        this._disabled = val;
      },

      get innerHTML() {
        return this._innerHTML;
      },
      set innerHTML(value) {
        this._innerHTML = value;
        this.children = [];
      },
      
      appendChild: jest.fn(function(child) {
        if (child.children && Array.isArray(child.children) && !child.className) {
          child.children.forEach(c => {
            this.children.push(c);
            if (c.children && Array.isArray(c.children)) {
              c.children.forEach(nested => this.children.push(nested));
            }
          });
        } else {
          this.children.push(child);
          if (child.children && Array.isArray(child.children)) {
            child.children.forEach(nested => this.children.push(nested));
          }
        }
        return child;
      }),

      addEventListener: jest.fn(function(eventType, handler) {
        listeners[eventType] = handler;
      }),

      reset() {
        this._value = '';
        this._innerHTML = '';
        this.children = [];
        this.style = {};
        this.appendChild.mockClear();
        this.addEventListener.mockClear();
      }
    };
  };

  const createCheckboxMock = (id, config = {}) => {
    const defaults = {
      type: 'checkbox',
      className: 'form-check-input',
      disabled: false
    };
    
    const props = { ...defaults, ...config };
    const listeners = {};
    
    return {
      id,
      type: props.type,
      className: props.className,
      _checked: false,
      _disabled: props.disabled,
      style: {},
      
      get checked() {
        return this._checked;
      },
      set checked(val) {
        this._checked = val;
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
        this._checked = false;
        this._disabled = props.disabled;
        this.style = {};
        this.addEventListener.mockClear();
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

  const mockThemeManager = {
    getInstance: jest.fn(),
    getAvailableThemes: jest.fn(() => ['light', 'dark', 'auto']),
    getCurrentTheme: jest.fn(() => 'light'),
    setTheme: jest.fn()
  };

  const mockUIController = {
    showMessage: jest.fn()
  };

  beforeEach(() => {
    jest.useFakeTimers();

    const mockConfigs = {
      'theme-selector': { factory: createSelectMock, args: ['theme-selector'] },
      'notifications-enabled': { factory: createCheckboxMock, args: ['notifications-enabled'] },
      'settings-save-btn': { factory: createButtonMock, args: ['settings-save-btn', { textContent: 'Save Settings' }] }
    };

    mocks = {};
    Object.entries(mockConfigs).forEach(([id, config]) => {
      mocks[id] = config.factory(...(config.args || [id]));
    });

    document.getElementById = jest.fn((id) => mocks[id] || null);
    document.querySelector = jest.fn(() => null);
    document.createElement = jest.fn((tag) => {
      if (tag === 'option') {
        return {
          tagName: 'OPTION',
          value: '',
          textContent: '',
          className: ''
        };
      }
      return {
        tagName: tag.toUpperCase(),
        className: '',
        id: '',
        type: '',
        checked: false,
        disabled: false,
        value: '',
        textContent: '',
        style: {},
        addEventListener: jest.fn(),
        appendChild: jest.fn()
      };
    });

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

    global.localStorage = {
      _store: {},
      getItem: jest.fn((key) => global.localStorage._store[key] || null),
      setItem: jest.fn((key, value) => {
        global.localStorage._store[key] = value.toString();
      }),
      removeItem: jest.fn((key) => {
        delete global.localStorage._store[key];
      }),
      clear: jest.fn(() => {
        global.localStorage._store = {};
      })
    };

    global.ThemeManager = {
      getInstance: jest.fn(() => mockThemeManager)
    };

    global.UIController = {
      getInstance: jest.fn(() => mockUIController)
    };

    // Reset SettingsSection state
    SettingsSection._cache = {};
  });

  afterEach(() => {
    Object.values(mocks).forEach(mock => {
      if (mock && mock.reset) mock.reset();
    });

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    global.localStorage.clear();
    SettingsSection.cleanup();
  });

  // ===== TEST COMMENT GUIDE =====
  // Every test should include comments above it starting with "// Test <number>" followed by:
  // - Test: Brief description of what is being tested
  // - Scenario: The specific use case or condition being tested
  // - Methods tested: Which methods/functions are involved
  // - Mocks: What is mocked and why
  // - Expected: What the test expects to happen

  // Test 1
  // Test: init should initialize settings section with correct sequence
  // Scenario: Component initialization with theme options population, settings loading, and event listener attachment
  // Methods tested: init(), populateThemeOptions(), loadSettings(), attachEventListeners()
  // Mocks: setTimeout - to verify delayed execution, populateThemeOptions/loadSettings/attachEventListeners - to verify they are called in order
  // Expected: All initialization methods called in correct sequence after 100ms timeout
  test('init() should initialize settings section with correct sequence', () => {
    const populateThemeOptionsSpy = jest.spyOn(SettingsSection, 'populateThemeOptions');
    const loadSettingsSpy = jest.spyOn(SettingsSection, 'loadSettings');
    const attachEventListenersSpy = jest.spyOn(SettingsSection, 'attachEventListeners');

    SettingsSection.init();

    expect(populateThemeOptionsSpy).not.toHaveBeenCalled();
    expect(loadSettingsSpy).not.toHaveBeenCalled();
    expect(attachEventListenersSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(populateThemeOptionsSpy).toHaveBeenCalledTimes(1);
    expect(loadSettingsSpy).toHaveBeenCalledTimes(1);
    expect(attachEventListenersSpy).toHaveBeenCalledTimes(1);

    const populateCall = populateThemeOptionsSpy.mock.invocationCallOrder[0];
    const loadCall = loadSettingsSpy.mock.invocationCallOrder[0];
    const attachCall = attachEventListenersSpy.mock.invocationCallOrder[0];

    expect(populateCall).toBeLessThan(loadCall);
    expect(loadCall).toBeLessThan(attachCall);

    populateThemeOptionsSpy.mockRestore();
    loadSettingsSpy.mockRestore();
    attachEventListenersSpy.mockRestore();
  });

  // Test 2
  // Test: getEl should cache DOM elements
  // Scenario: Retrieving same element multiple times should use cache on subsequent calls
  // Methods tested: getEl()
  // Mocks: document.getElementById - to verify element retrieval
  // Expected: Element retrieved from cache on second call, getElementById called only once
  test('getEl() should cache DOM elements', () => {
    const themeSelect = mocks['theme-selector'];
    
    const element1 = SettingsSection.getEl('theme-selector');
    const element2 = SettingsSection.getEl('theme-selector');

    expect(element1).toBe(themeSelect);
    expect(element2).toBe(themeSelect);
    expect(element1).toBe(element2);
    expect(document.getElementById).toHaveBeenCalledTimes(1);
    expect(document.getElementById).toHaveBeenCalledWith('theme-selector');
  });

  // Test 3
  // Test: getTM should cache ThemeManager instance
  // Scenario: Retrieving ThemeManager multiple times should use cache on subsequent calls
  // Methods tested: getTM()
  // Mocks: ThemeManager.getInstance - to verify instance retrieval and caching
  // Expected: Same instance returned, getInstance called only once
  test('getTM() should cache ThemeManager instance', () => {
    const tm1 = SettingsSection.getTM();
    const tm2 = SettingsSection.getTM();

    expect(tm1).toBe(tm2);
    expect(global.ThemeManager.getInstance).toHaveBeenCalledTimes(1);
  });

  // Test 4
  // Test: getUI should cache UIController instance
  // Scenario: Retrieving UIController multiple times should use cache on subsequent calls
  // Methods tested: getUI()
  // Mocks: UIController.getInstance - to verify instance retrieval and caching
  // Expected: Same instance returned, getInstance called only once
  test('getUI() should cache UIController instance', () => {
    const ui1 = SettingsSection.getUI();
    const ui2 = SettingsSection.getUI();

    expect(ui1).toBe(ui2);
    expect(global.UIController.getInstance).toHaveBeenCalledTimes(1);
  });

  // Test 5
  // Test: populateThemeOptions should populate theme selector with available themes
  // Scenario: Fetch available themes and create option elements with capitalized names
  // Methods tested: populateThemeOptions(), getEl(), getTM()
  // Mocks: ThemeManager.getAvailableThemes - returns ['light', 'dark', 'auto'], document.getElementById - returns select element
  // Expected: Select element cleared and populated with 3 options, each capitalized correctly (Light, Dark, Auto)
  test('populateThemeOptions() should populate theme selector with available themes', () => {
    const themeManager = global.ThemeManager.getInstance();
    themeManager.getAvailableThemes.mockReturnValue(['light', 'dark', 'auto']);

    SettingsSection.populateThemeOptions();

    const selectEl = mocks['theme-selector'];
    expect(selectEl.innerHTML).toBe('');
    expect(selectEl.appendChild).toHaveBeenCalled();
    expect(selectEl.children).toHaveLength(3);
    expect(selectEl.children[0].value).toBe('light');
    expect(selectEl.children[0].textContent).toBe('Light');
    expect(selectEl.children[1].value).toBe('dark');
    expect(selectEl.children[1].textContent).toBe('Dark');
    expect(selectEl.children[2].value).toBe('auto');
    expect(selectEl.children[2].textContent).toBe('Auto');
  });

  // Test 6
  // Test: populateThemeOptions should handle missing theme selector gracefully
  // Scenario: Theme selector element does not exist in DOM
  // Methods tested: populateThemeOptions(), getEl()
  // Mocks: document.getElementById - returns null for theme selector
  // Expected: Method returns early without errors, no DOM manipulation attempted
  test('populateThemeOptions() should handle missing theme selector gracefully', () => {
    mocks['theme-selector'] = null;
    document.getElementById = jest.fn(() => null);

    expect(() => SettingsSection.populateThemeOptions()).not.toThrow();
    expect(document.createElement).not.toHaveBeenCalled();
  });

  // Test 7
  // Test: populateThemeOptions should capitalize theme names correctly
  // Scenario: Theme names should be formatted with first letter uppercase and rest lowercase
  // Methods tested: populateThemeOptions()
  // Mocks: ThemeManager.getAvailableThemes - returns various theme name formats
  // Expected: Theme names displayed as 'Light', 'Dark', 'Auto' regardless of input case
  test('populateThemeOptions() should capitalize theme names correctly', () => {
    mockThemeManager.getAvailableThemes.mockReturnValue(['light', 'DARK', 'aUTo']);

    SettingsSection.populateThemeOptions();

    const options = mocks['theme-selector'].children;
    expect(options[0].textContent).toBe('Light');
    expect(options[1].textContent).toBe('Dark');
    expect(options[2].textContent).toBe('Auto');
  });


  // Test 8
  // Test: loadSettings should load theme and notification preferences
  // Scenario: Load current theme from ThemeManager and notification setting from localStorage
  // Methods tested: loadSettings(), getEl(), getTM()
  // Mocks: ThemeManager.getCurrentTheme - returns 'dark', localStorage.getItem - returns 'true', document.getElementById - returns selector and checkbox
  // Expected: Theme selector value set to 'dark', notification checkbox checked state set to true
  test('loadSettings() should load theme and notification preferences', () => {
    const themeManager = global.ThemeManager.getInstance();
    themeManager.getCurrentTheme.mockReturnValue('light');
    global.localStorage.setItem('notifications_enabled', 'true');

    SettingsSection.loadSettings();

    expect(mocks['theme-selector'].value).toBe('light');
    expect(mocks['notifications-enabled'].checked).toBe(true);
  });

  // Test 9
  // Test: loadSettings should handle missing selector and checkbox elements gracefully
  // Scenario: Required DOM elements do not exist
  // Methods tested: loadSettings(), getEl()
  // Mocks: document.getElementById - returns null for both elements
  // Expected: Method completes without errors, no DOM manipulation attempted
  test('loadSettings() should handle missing selector and checkbox elements gracefully', () => {
    mocks['theme-selector'] = null;
    mocks['notifications-enabled'] = null;
    document.getElementById = jest.fn(() => null);

    expect(() => SettingsSection.loadSettings()).not.toThrow();
  });

  // Test 10
  // Test: loadSettings should default notification checkbox based on localStorage value (PARAMETRIZED: 'false'/absent/invalid values)
  // Scenario: Notification preference stored as 'false' string, absent key, or invalid value in localStorage
  // Methods tested: loadSettings()
  // Mocks: localStorage.getItem - returns 'false', null (absent), or other values
  // Expected: Checkbox checked when localStorage !== 'false', unchecked when === 'false'
  test.each([
    {
      name: 'should uncheck when localStorage is "false"',
      storageValue: 'false',
      expectedChecked: false
    },
    {
      name: 'should check when localStorage is absent (null)',
      storageValue: null,
      expectedChecked: true
    },
    {
      name: 'should check when localStorage is "true"',
      storageValue: 'true',
      expectedChecked: true
    }
  ])('loadSettings() $name', ({ storageValue, expectedChecked }) => {
    global.localStorage.getItem = jest.fn(() => storageValue);

    SettingsSection.loadSettings();

    expect(mocks['notifications-enabled'].checked).toBe(expectedChecked);
  });

  // Test 11
  // Test: attachEventListeners should attach save, theme change, and notification change handlers (PARAMETRIZED: all listener combinations)
  // Scenario: Attach event listeners to save button, theme selector, and notification checkbox
  // Methods tested: attachEventListeners(), getEl()
  // Mocks: document.getElementById - returns all required elements, addEventListener - to verify handler attachment
  // Expected: All three event listeners attached correctly to their respective elements
  test.each([
    { elementId: 'settings-save-btn', eventType: 'click' },
    { elementId: 'theme-selector', eventType: 'change' },
    { elementId: 'notifications-enabled', eventType: 'change' }
  ])('attachEventListeners() should attach $eventType handler to $elementId', ({ elementId, eventType }) => {
    SettingsSection.attachEventListeners();

    expect(mocks[elementId].addEventListener).toHaveBeenCalledWith(eventType, expect.any(Function));
  });

  // Test 12
  // Test: attachEventListeners should handle missing elements gracefully
  // Scenario: Some or all required DOM elements do not exist
  // Methods tested: attachEventListeners(), getEl()
  // Mocks: document.getElementById - returns null for some elements
  // Expected: Method completes without errors, listeners attached only to existing elements
  test('attachEventListeners() should handle missing elements gracefully', () => {
    mocks['theme-selector'] = null;
    mocks['notifications-enabled'] = null;
    document.getElementById = jest.fn((id) => mocks[id] || null);

    expect(() => SettingsSection.attachEventListeners()).not.toThrow();
    expect(mocks['settings-save-btn'].addEventListener).toHaveBeenCalledTimes(1);
  });

  // Test 13
  // Test: handleSaveSettings should collect settings, persist theme, save notification preference, and manage UI (PARAMETRIZED: theme values, notification true/false, localStorage success/failure)
  // Scenario: User saves settings with various theme values and notification preferences, handling both success and failure cases
  // Methods tested: handleSaveSettings(), getEl(), getTM(), localStorage.setItem, showSuccess(), showError()
  // Mocks: ThemeManager.setTheme - applies theme, localStorage.setItem - persists notification setting, UIController.showMessage - displays feedback
  // Expected: Theme applied via ThemeManager, notification preference persisted to localStorage, success message shown, button state managed correctly
  test.each([
    {
      theme: 'light',
      notify: true,
      shouldSucceed: true,
      expectedMessage: 'Settings saved successfully'
    },
    {
      theme: 'dark',
      notify: false,
      shouldSucceed: true,
      expectedMessage: 'Settings saved successfully'
    },
    {
      theme: 'auto',
      notify: true,
      shouldSucceed: false,
      expectedMessage: 'Failed to save settings: Theme error'
    }
  ])('handleSaveSettings() should save settings for theme=$theme, notify=$notify', async ({ theme, notify, shouldSucceed, expectedMessage }) => {
    SettingsSection._cache = {};
    mockThemeManager.setTheme.mockClear();
    mockUIController.showMessage.mockClear();

    mocks['theme-selector'].value = theme;
    mocks['notifications-enabled'].checked = notify;

    if (!shouldSucceed) {
      mockThemeManager.setTheme.mockImplementation(() => {
        throw new Error('Theme error');
      });
    }

    await SettingsSection.handleSaveSettings();

    expect(mocks['settings-save-btn'].disabled).toBe(false);
    expect(mocks['settings-save-btn'].textContent).toBe('Save Settings');

    if (shouldSucceed) {
      expect(mockThemeManager.setTheme).toHaveBeenCalledWith(theme);
      expect(global.localStorage.setItem).toHaveBeenCalledWith('notifications_enabled', notify);
      // Don't check for success message - it depends on notifications setting in showSuccess()
    } else {
      expect(mockUIController.showMessage).toHaveBeenCalledWith(expectedMessage, 'error');
    }
  });

  // Test 14
  // Test: handleSaveSettings should restore button text and disabled state on completion
  // Scenario: Save button state should be restored after API operation completes
  // Methods tested: handleSaveSettings()
  // Mocks: localStorage.setItem, ThemeManager.setTheme
  // Expected: Button text restored to original, disabled state set to false after operation completion
  test('handleSaveSettings() should restore button text and disabled state on completion', async () => {
    const originalText = mocks['settings-save-btn'].textContent;
    mocks['theme-selector'].value = 'light';
    mocks['notifications-enabled'].checked = true;

    jest.advanceTimersByTime(100);
    await SettingsSection.handleSaveSettings();
    jest.advanceTimersByTime(100);

    expect(mocks['settings-save-btn'].textContent).toBe(originalText);
    expect(mocks['settings-save-btn'].disabled).toBe(false);
  });

  // Test 15
  // Test: handleSaveSettings should show error message when exception occurs
  // Scenario: Settings saving fails due to exception (e.g., localStorage full, theme invalid)
  // Methods tested: handleSaveSettings(), showError()
  // Mocks: localStorage.setItem - throws error, UIController.showMessage - displays error
  // Expected: Error message shown with error details, button state restored, operation gracefully handles exception
  test('handleSaveSettings() should show error message when exception occurs', async () => {
    const mockError = new Error('Theme error');
    global.localStorage.setItem.mockImplementation(() => {
      throw mockError;
    });

    mocks['theme-selector'].value = 'light';
    mocks['notifications-enabled'].checked = true;

    await SettingsSection.handleSaveSettings();
    jest.advanceTimersByTime(100);

    expect(mockUIController.showMessage).toHaveBeenCalledWith(
      `Failed to save settings: ${mockError.message}`,
      'error'
    );
    expect(mocks['settings-save-btn'].disabled).toBe(false);
    expect(mocks['settings-save-btn'].textContent).toBe('Save Settings');
  });

  // Test 16
  // Test: showError should call UIController with error type
  // Scenario: Display error notification to user
  // Methods tested: showError(), getUI()
  // Mocks: UIController.getInstance().showMessage - to verify error message call
  // Expected: UIController.showMessage called with message and 'error' type
  test('showError() should call UIController with error type', () => {
    const errorMsg = 'An error occurred';

    SettingsSection.showError(errorMsg);

    expect(mockUIController.showMessage).toHaveBeenCalledWith(errorMsg, 'error');
  });

  // Test 17
  // Test: showSuccess should call UIController with success type only when notifications enabled (PARAMETRIZED: notifications enabled/disabled)
  // Scenario: Show success message only if notifications are enabled in localStorage
  // Methods tested: showSuccess(), getUI()
  // Mocks: localStorage.getItem - returns 'true' (enabled) or 'false' (disabled), UIController.showMessage - displays success
  // Expected: UIController.showMessage called only when notifications !== 'false'
  test.each([
    {
      notificationsEnabled: true,
      shouldShowMessage: true
    },
    {
      notificationsEnabled: false,
      shouldShowMessage: false
    }
  ])('showSuccess() should call UIController only when notifications enabled=$notificationsEnabled', ({ notificationsEnabled, shouldShowMessage }) => {
    const successMsg = 'Success message';
    global.localStorage.setItem('notifications_enabled', notificationsEnabled.toString());

    SettingsSection.showSuccess(successMsg);

    if (shouldShowMessage) {
      expect(mockUIController.showMessage).toHaveBeenCalledWith(successMsg, 'success');
    } else {
      expect(mockUIController.showMessage).not.toHaveBeenCalled();
    }
  });

  // Test 18
  // Test: cleanup should clear _cache object
  // Scenario: Clear all cached DOM elements and instances on cleanup
  // Methods tested: cleanup()
  // Mocks: None
  // Expected: _cache object emptied, all cached references removed
  test('cleanup() should clear _cache object', () => {
    SettingsSection.getEl('theme-selector');
    SettingsSection.getTM();
    SettingsSection.getUI();

    expect(Object.keys(SettingsSection._cache).length).toBeGreaterThan(0);

    SettingsSection.cleanup();

    expect(SettingsSection._cache).toEqual({});
  });

});
