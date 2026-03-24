// ============ ABSTRACT BASE PARSER ============
class StackTraceParser {
  /**
   * Detects if this parser handles the current browser
   * @returns {boolean}
   */
  static canHandle() {
    throw new Error('canHandle() must be implemented');
  }

  /**
   * Parses a single stack line
   * @param {string} callerLine - A line from the stack trace
   * @returns {object} { functionName, fullPath, line, column }
   */
  parse(callerLine) {
    throw new Error('parse() must be implemented');
  }

  /**
   * Extracts file info from parsed data
   * @param {object} parsed
   * @returns {object} { file, line, column, fullPath, method }
   */
  extractFileInfo(parsed) {
    if (!parsed) {
      return { file: '?', line: '?', column: '?', fullPath: '', method: 'unknown' };
    }

    const fullPath = parsed.fullPath || '';
    const file = fullPath.split('/').pop() || '?';
    const line = parsed.line || '?';
    const column = parsed.column || '?';
    const method = parsed.functionName || 'unknown';

    return { file, line, column, fullPath, method };
  }
}

// ============ FIREFOX PARSER ============
class FirefoxParser extends StackTraceParser {
  static canHandle() {
    return /Firefox/.test(navigator.userAgent);
  }

  /**
   * Firefox format: functionName@url:line:column
   */
  parse(callerLine) {
    const match = callerLine.match(/^([a-zA-Z_$][a-zA-Z0-9_$.]*)@(.+):(\d+):(\d+)/);
    if (match) {
      return {
        functionName: match[1],
        fullPath: match[2],
        line: match[3],
        column: match[4]
      };
    }
    return null;
  }
}

// ============ CHROME PARSER ============
class ChromeParser extends StackTraceParser {
  static canHandle() {
    return /Chrome|Chromium|Brave|Edge/.test(navigator.userAgent);
  }

  /**
   * Chrome format: at functionName (path:line:column)
   * Extracts function name from the stack trace (Chrome provides this)
   */
  parse(callerLine) {
    const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
    if (match) {
      return {
        functionName: match[1].trim(),
        fullPath: match[2],
        line: match[3],
        column: match[4]
      };
    }
    return null;
  }
}

// ============ SAFARI PARSER ============
class SafariParser extends StackTraceParser {
  static canHandle() {
    return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  }

  /**
   * Safari format: similar to Chrome but with variations
   */
  parse(callerLine) {
    // Try Chrome-style first
    let match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
    if (match) {
      return {
        functionName: match[1].trim(),
        fullPath: match[2],
        line: match[3],
        column: match[4]
      };
    }

    // Safari can also use simpler format
    match = callerLine.match(/^([a-zA-Z_$][a-zA-Z0-9_$.]*)@(.+):(\d+):(\d+)/);
    if (match) {
      return {
        functionName: match[1],
        fullPath: match[2],
        line: match[3],
        column: match[4]
      };
    }

    return null;
  }
}

// ============ FALLBACK PARSER ============
class FallbackParser extends StackTraceParser {
  static canHandle() {
    return true; // Always matches as last resort
  }

  /**
   * Fallback parser for unknown browsers
   */
  parse(callerLine) {
    let file = '?';
    let line = '?';
    let column = '?';
    let functionName = 'unknown';

    const simpleFileMatch = callerLine.match(/([a-zA-Z0-9\-_.]+\.js)/);
    if (simpleFileMatch) {
      file = simpleFileMatch[1];
    }

    const lineMatch = callerLine.match(/:(\d+):(\d+)/);
    if (lineMatch) {
      line = lineMatch[1];
      column = lineMatch[2];
    }

    // Try to extract function name if present
    const funcMatch = callerLine.match(/at\s+(.+?)\s+\(/);
    if (funcMatch) {
      functionName = funcMatch[1].trim();
    }

    return { file, line, column, fullPath: file, functionName };
  }
}

// ============ PARSER REGISTRY (FACTORY) ============
class StackTraceParserRegistry {
  constructor() {
    this.parsers = [];
    this.selectedParser = null;
  }

  /**
   * Register a parser class
   * @param {class} ParserClass - Must extend StackTraceParser
   */
  register(ParserClass) {
    this.parsers.push(ParserClass);
  }

  /**
   * Detect and select the appropriate parser
   * @returns {StackTraceParser} Instance of detected parser
   */
  detectParser() {
    if (this.selectedParser) return this.selectedParser;

    for (const ParserClass of this.parsers) {
      if (ParserClass.canHandle()) {
        this.selectedParser = new ParserClass();
        console.log(`[ConsoleLogger] Using parser: ${ParserClass.name}`);
        return this.selectedParser;
      }
    }

    throw new Error('No suitable parser found');
  }

  /**
   * Parse a stack line using the detected parser
   * @param {string} callerLine
   * @returns {object} Parsed caller info
   */
  parseStackLine(callerLine) {
    const parser = this.detectParser();
    const parsed = parser.parse(callerLine);
    return parser.extractFileInfo(parsed);
  }
}

// ============ MAIN CONSOLE LOGGER ============
class ConsoleLogger {
  constructor() {
    this.consoleWindow = window.consoleWindowInstance;
    this.sourceCache = {};
    
    // Initialize parser registry
    this.parserRegistry = new StackTraceParserRegistry();
    this.registerDefaultParsers();

    // Store original console methods BEFORE interception
    this.originalLog = console.log;
    this.originalError = console.error;
    this.originalWarn = console.warn;
    this.originalInfo = console.info;
    this.originalDebug = console.debug || console.log;

    this.setupInterception();
  }

  /**
   * Register all default browser parsers
   * Add new parsers here or call this.parserRegistry.register() externally
   */
  registerDefaultParsers() {
    this.parserRegistry.register(FirefoxParser);
    this.parserRegistry.register(ChromeParser);
    this.parserRegistry.register(SafariParser);
    this.parserRegistry.register(FallbackParser);
  }

  /**
   * Allow external registration of custom parsers
   * @param {class} ParserClass
   */
  registerParser(ParserClass) {
    this.parserRegistry.register(ParserClass);
  }

  /**
   * Fetch and cache source file
   */
  async fetchSourceFile(filePath) {
    if (this.sourceCache[filePath]) {
      return this.sourceCache[filePath];
    }

    try {
      const response = await fetch(filePath);
      const sourceCode = await response.text();
      this.sourceCache[filePath] = sourceCode;
      return sourceCode;
    } catch (e) {
      this.originalError(`Failed to fetch source: ${filePath}`, e);
      return null;
    }
  }

  /**
   * Extract function name from source code at specific line
   */
  async getFunctionNameFromSource(filePath, lineNumber) {
    const sourceCode = await this.fetchSourceFile(filePath);
    if (!sourceCode) return 'unknown';

    const lines = sourceCode.split('\n');
    const targetLineIndex = parseInt(lineNumber) - 1;

    for (let i = targetLineIndex; i >= 0; i--) {
      const line = lines[i];

      // Match function declarations
      const funcMatch = line.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
      if (funcMatch) return funcMatch[1];

      // Match arrow functions assigned to variables
      const arrowMatch = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(/);
      if (arrowMatch) return arrowMatch[1];

      // Match class methods
      const methodMatch = line.match(/^\s*(?:async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
      if (methodMatch && !line.includes('function')) {
        if (line.includes('{') || line.includes('=>')) {
          return methodMatch[1];
        }
      }

      // Match object methods
      const objMethodMatch = line.match(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*(?:function|async|\()/);
      if (objMethodMatch) return objMethodMatch[1];
    }

    return 'anonymous';
  }

  /**
   * Check if a stack line should be skipped (internal to console logger)
   */
  shouldSkipStackLine(line) {
    const skipPatterns = [
      'console-logger.js',
      'consoleLogger.js',
      'Error:',
      'getCallerInfo',
      'setupInterception',
      'logToWindow',
      'console.log',
      'console.error',
      'console.warn',
      'console.info',
      'console.debug',
      'ConsoleLogger'
    ];

    if (line.trim() === '' || line.trim() === 'Error') return true;

    if (skipPatterns.some(pattern => line.includes(pattern))) return true;

    const trimmedLine = line.trim();
    if (trimmedLine) {
      const isValidStackFrame = 
        trimmedLine.includes('at ') ||
        trimmedLine.includes('@') ||
        trimmedLine.match(/^[a-zA-Z_$]/);

      if (!isValidStackFrame) return true;
    }

    return false;
  }

  /**
   * Find the first non-internal stack line
   */
  findCallerStackLine(stackLines) {
    for (let i = 0; i < stackLines.length; i++) {
      if (!this.shouldSkipStackLine(stackLines[i])) {
        return stackLines[i];
      }
    }
    return null;
  }

  /**
   * Get information about the caller of console methods
   */
  async getCallerInfo() {
    try {
      const stack = new Error().stack;
      if (!stack) return { file: '?', line: '?', column: '?', method: 'unknown' };

      const stackLines = stack.split('\n');
      const callerLine = this.findCallerStackLine(stackLines);

      if (!callerLine) {
        return { file: '?', line: '?', column: '?', method: 'unknown' };
      }

      // Use the parser registry to parse the stack line
      const callerInfo = this.parserRegistry.parseStackLine(callerLine);

      // Try to get function name from source code if needed (mainly for Firefox)
      if (callerInfo.method === 'unknown' && callerInfo.fullPath && callerInfo.line !== '?') {
        callerInfo.method = await this.getFunctionNameFromSource(callerInfo.fullPath, callerInfo.line);
      }

      return callerInfo;
    } catch (e) {
      return { file: '?', line: '?', column: '?', method: 'unknown' };
    }
  }

  /**
   * Setup console method interception
   */
  setupInterception() {
    const self = this;

    console.log = async (...args) => {
      const caller = await self.getCallerInfo();
      self.logToWindow(args.join(' '), 'log', caller);
      self.originalLog(...args);
    };

    console.error = async (...args) => {
      const caller = await self.getCallerInfo();
      self.logToWindow(args.join(' '), 'error', caller);
      self.originalError(...args);
    };

    console.warn = async (...args) => {
      const caller = await self.getCallerInfo();
      self.logToWindow(args.join(' '), 'warn', caller);
      self.originalWarn(...args);
    };

    console.info = async (...args) => {
      const caller = await self.getCallerInfo();
      self.logToWindow(args.join(' '), 'info', caller);
      self.originalInfo(...args);
    };

    console.debug = async (...args) => {
      const caller = await self.getCallerInfo();
      self.logToWindow(args.join(' '), 'debug', caller);
      self.originalDebug(...args);
    };
  }

  /**
   * Log message to custom console window
   * Includes function name in the formatted message
   */
  logToWindow(message, type = 'log', caller = {}) {
    if (this.consoleWindow) {
      const { file = '?', line = '?', column = '?', method = 'unknown', fullPath = '' } = caller;
      // Include function name in the formatted message for Chrome and other browsers
      const formattedMessage = `[${file}:${line}:${column}] ${method}() - ${message}`;
      this.consoleWindow.addLog(formattedMessage, type, {
        file,
        line,
        column,
        method,
        fullPath,
        message
      });
    }
  }

  /**
   * Manual log method
   */
  log(message, type = 'log') {
    this.getCallerInfo().then(caller => {
      this.originalLog(message);
      this.logToWindow(message, type, caller);
    });
  }
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  new ConsoleLogger();
});
