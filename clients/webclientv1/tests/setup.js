// tests/js/setup.js
// Mock browser objects for Node.js testing

// Window object
global.window = {
  location: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000/',
    pathname: '/',
    search: '',
    hash: '',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    reload: jest.fn(),
    replace: jest.fn(),
    assign: jest.fn()
  },
  document: null, // Will be set below
  localStorage: null, // Will be set below
  sessionStorage: null, // Will be set below
  navigator: null, // Will be set below
  console: global.console,
  fetch: jest.fn(),
  XMLHttpRequest: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  setTimeout: global.setTimeout,
  setInterval: global.setInterval,
  clearTimeout: global.clearTimeout,
  clearInterval: global.clearInterval,
  requestAnimationFrame: jest.fn((cb) => setTimeout(cb, 0)),
  cancelAnimationFrame: jest.fn(),
  JSON: global.JSON,
  Object: global.Object,
  Array: global.Array,
  String: global.String,
  Number: global.Number,
  Boolean: global.Boolean,
  Math: global.Math,
  Date: global.Date,
  RegExp: global.RegExp,
  Error: global.Error,
  innerWidth: 1024,
  innerHeight: 768,
  outerWidth: 1024,
  outerHeight: 768,
  devicePixelRatio: 1,
  matchMedia: jest.fn((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
};

// LocalStorage mock
global.localStorage = {
  data: {},
  getItem: jest.fn((key) => global.localStorage.data[key] || null),
  setItem: jest.fn((key, value) => {
    global.localStorage.data[key] = String(value);
  }),
  removeItem: jest.fn((key) => {
    delete global.localStorage.data[key];
  }),
  clear: jest.fn(() => {
    global.localStorage.data = {};
  }),
  key: jest.fn((index) => {
    const keys = Object.keys(global.localStorage.data);
    return keys[index] || null;
  }),
  get length() {
    return Object.keys(global.localStorage.data).length;
  }
};

// SessionStorage mock
global.sessionStorage = {
  data: {},
  getItem: jest.fn((key) => global.sessionStorage.data[key] || null),
  setItem: jest.fn((key, value) => {
    global.sessionStorage.data[key] = String(value);
  }),
  removeItem: jest.fn((key) => {
    delete global.sessionStorage.data[key];
  }),
  clear: jest.fn(() => {
    global.sessionStorage.data = {};
  }),
  key: jest.fn((index) => {
    const keys = Object.keys(global.sessionStorage.data);
    return keys[index] || null;
  }),
  get length() {
    return Object.keys(global.sessionStorage.data).length;
  }
};

// Document object
global.document = {
  body: {
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn(() => false)
    },
    innerHTML: '',
    textContent: '',
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    insertBefore: jest.fn()
  },
  head: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  documentElement: {
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn(() => false)
    }
  },
  getElementById: jest.fn(() => null),
  getElementsByClassName: jest.fn(() => []),
  getElementsByTagName: jest.fn(() => []),
  querySelector: jest.fn(() => null),
  querySelectorAll: jest.fn(() => []),
  createElement: jest.fn((tag) => ({
    tag,
    className: '',
    id: '',
    innerHTML: '',
    textContent: '',
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn(() => false)
    },
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    insertBefore: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    getAttribute: jest.fn(),
    setAttribute: jest.fn(),
    removeAttribute: jest.fn()
  })),
  createTextNode: jest.fn((text) => ({
    nodeValue: text,
    textContent: text
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  write: jest.fn(),
  writeln: jest.fn(),
  open: jest.fn(),
  close: jest.fn(),
  title: 'Test Document',
  url: 'http://localhost:3000/',
  cookie: '',
  referrer: '',
  domain: 'localhost',
  location: global.window.location,
  defaultView: global.window
};

// Navigator object
global.navigator = {
  userAgent: 'Mozilla/5.0 (Node.js) Jest Test Environment',
  language: 'en-US',
  languages: ['en-US', 'en'],
  platform: 'Linux',
  hardwareConcurrency: 1,
  onLine: true,
  cookieEnabled: true,
  doNotTrack: null,
  geolocation: {
    getCurrentPosition: jest.fn((success, error) => {
      error({ code: 1, message: 'User denied geolocation' });
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  },
  clipboard: {
    readText: jest.fn().mockResolvedValue(''),
    writeText: jest.fn().mockResolvedValue(undefined)
  }
};

// Set window.document and window.navigator references
window.document = global.document;
window.localStorage = global.localStorage;
window.sessionStorage = global.sessionStorage;
window.navigator = global.navigator;

// Additional global objects
global.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => '')
}));

global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

global.MutationObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn()
}));

global.CustomEvent = jest.fn((type, detail) => ({
  type,
  detail
}));

global.Event = jest.fn((type) => ({
  type
}));

global.HTMLElement = function() {};
global.HTMLDivElement = function() {};
global.HTMLInputElement = function() {};
global.HTMLButtonElement = function() {};
global.HTMLFormElement = function() {};

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  global.localStorage.data = {};
  global.sessionStorage.data = {};
});
