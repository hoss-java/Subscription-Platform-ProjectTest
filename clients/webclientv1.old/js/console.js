// console.js
class ConsoleWindow {
  constructor() {
    this.consoleWindow = document.querySelector('.console-window');
    this.consoleHeader = document.querySelector('.console-header');
    this.consoleOutput = document.querySelector('.console-output');
    this.consoleControls = document.querySelector('.console-controls');
    this.isDragging = false;
    this.isResizing = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isHidden = false;
    this.minWidth = 250;
    this.minHeight = 150;
    this.sourceCache = {}; // Cache for source files
    
    this.storageKey = 'consoleWindowState';
    
    this.setupToggleIcon();
    this.restoreWindowState();
    this.setupDragging();
    this.setupResizing();
    this.setupControls();
    this.setupSourceViewer();
  }

  setupControls() {
    this.setupFilterInput();
    this.setupCopyButton();
    this.setupClearButton();
  }

  setupSourceViewer() {
    // Create modal for source code display
    if (!document.getElementById('source-viewer-modal')) {
      const modal = document.createElement('div');
      modal.id = 'source-viewer-modal';
      modal.className = 'source-viewer-modal';
      modal.innerHTML = `
        <div class="source-viewer-content">
          <div class="source-viewer-header">
            <h3 id="source-viewer-title">Source Code</h3>
            <button class="source-viewer-close">&times;</button>
          </div>
          <div class="source-viewer-info">
            <span id="source-viewer-file"></span> | 
            <span id="source-viewer-function"></span> | 
            <span id="source-viewer-line"></span>
          </div>
          <div class="source-viewer-code">
            <pre id="source-viewer-pre"><code id="source-viewer-code"></code></pre>
          </div>
          <button class="source-viewer-copy-btn">Copy Code</button>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Close button
      modal.querySelector('.source-viewer-close').addEventListener('click', () => {
        this.closeSourceViewer();
      });
      
      // Copy button
      modal.querySelector('.source-viewer-copy-btn').addEventListener('click', () => {
        this.copySourceCode();
      });
      
      // Close on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeSourceViewer();
        }
      });
    }
  }

  async fetchSourceFile(filePath) {
    if (this.sourceCache[filePath]) {
      return this.sourceCache[filePath];
    }

    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const sourceCode = await response.text();
      this.sourceCache[filePath] = sourceCode;
      return sourceCode;
    } catch (e) {
      console.error(`Failed to fetch source: ${filePath}`, e);
      return null;
    }
  }

  async showSourceCode(metadata) {
    const { fullPath, line, method, file } = metadata;
    
    if (!fullPath || line === '?') {
      alert('Source code information not available');
      return;
    }

    try {
      const sourceCode = await this.fetchSourceFile(fullPath);
      if (!sourceCode) {
        alert('Failed to load source code');
        return;
      }

      const lines = sourceCode.split('\n');
      const targetLineIndex = parseInt(line) - 1;
      
      // Default: show context (10 lines before and after)
      let startLine = Math.max(0, targetLineIndex - 10);
      let endLine = Math.min(lines.length, targetLineIndex + 11);
      
      const codeLines = lines.slice(startLine, endLine);
      const displayCode = this.formatCodeLines(codeLines, startLine, parseInt(line));

      // Update modal
      const modal = document.getElementById('source-viewer-modal');
      document.getElementById('source-viewer-title').textContent = `Source Code - ${file}`;
      document.getElementById('source-viewer-file').textContent = `📄 ${fullPath}`;
      document.getElementById('source-viewer-function').textContent = `ƒ ${method}`;
      document.getElementById('source-viewer-line').textContent = `📍 Line ${line}`;
      document.getElementById('source-viewer-code').innerHTML = displayCode;
      
      // Store metadata for full load button
      this.currentSourceMetadata = { fullPath, line, file, lines };
      this.currentSourceCode = codeLines.join('\n');
      
      // Add/show load full source button
      this.setupLoadFullSourceButton(modal, lines, parseInt(line));
      
      modal.style.display = 'flex';
    } catch (error) {
      alert(`Error loading source code: ${error.message}`);
    }
  }

  formatCodeLines(codeLines, startLineNum, highlightLine) {
    return codeLines
      .map((codeLine, index) => {
        const lineNum = startLineNum + index + 1;
        const isTarget = lineNum === highlightLine;
        const lineClass = isTarget ? 'highlight' : '';
        return `<span class="line-number ${lineClass}">${lineNum}</span>${this.escapeHtml(codeLine)}`;
      })
      .join('\n');
  }

  setupLoadFullSourceButton(modal, allLines, highlightLine) {
    let loadFullBtn = modal.querySelector('.source-viewer-load-full-btn');
    
    if (!loadFullBtn) {
      loadFullBtn = document.createElement('button');
      loadFullBtn.className = 'source-viewer-load-full-btn';
      loadFullBtn.textContent = 'Load Full Source';
      modal.querySelector('.source-viewer-header').appendChild(loadFullBtn);
    }
    
    loadFullBtn.onclick = () => {
      // Load entire file
      const displayCode = this.formatCodeLines(allLines, 0, highlightLine);
      document.getElementById('source-viewer-code').innerHTML = displayCode;
      
      // Scroll to highlight line
      this.scrollToLine(highlightLine);
      
      // Hide button after loading full source
      loadFullBtn.style.display = 'none';
      
      // Update stored code for copy functionality
      this.currentSourceCode = allLines.join('\n');
    };
    
    loadFullBtn.style.display = 'block';
  }

  scrollToLine(lineNumber) {
    const codeElement = document.getElementById('source-viewer-code');
    const lineNumbers = codeElement.querySelectorAll('.line-number');
    
    if (lineNumbers.length > 0) {
      // Find the highlighted line element
      let targetElement = null;
      for (let lineNum of lineNumbers) {
        if (lineNum.textContent.trim() === lineNumber.toString()) {
          targetElement = lineNum;
          break;
        }
      }
      
      if (targetElement) {
        // Scroll into view with some offset
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }


  closeSourceViewer() {
    const modal = document.getElementById('source-viewer-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  copySourceCode() {
    if (!this.currentSourceCode) return;
    
    navigator.clipboard.writeText(this.currentSourceCode).then(() => {
      const copyBtn = document.querySelector('.source-viewer-copy-btn');
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy source code');
    });
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  setupToggleIcon() {
    let toggleIcon = document.querySelector('.console-toggle-icon');
    
    if (!toggleIcon) {
      toggleIcon = document.createElement('button');
      toggleIcon.className = 'console-toggle-icon';
      toggleIcon.title = 'Toggle Console';
      toggleIcon.innerHTML = '📋';
      document.body.appendChild(toggleIcon);
    }
    
    this.toggleIcon = toggleIcon;
    toggleIcon.addEventListener('click', () => this.toggleWindowVisibility());
  }

  restoreWindowState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        
        if (state.width) {
          this.consoleWindow.style.width = state.width + 'px';
        }
        if (state.height) {
          this.consoleWindow.style.height = state.height + 'px';
        }
        
        if (state.left !== undefined && state.top !== undefined) {
          this.consoleWindow.style.left = state.left + 'px';
          this.consoleWindow.style.top = state.top + 'px';
          this.consoleWindow.style.bottom = 'auto';
          this.consoleWindow.style.right = 'auto';
        }
        
        if (state.isHidden) {
          this.consoleWindow.style.display = 'none';
          this.isHidden = true;
        }
      } catch (error) {
        console.error('Failed to restore console window state:', error);
      }
    }
  }

  saveWindowState() {
    const state = {
      width: this.consoleWindow.offsetWidth,
      height: this.consoleWindow.offsetHeight,
      left: this.consoleWindow.offsetLeft,
      top: this.consoleWindow.offsetTop,
      isHidden: this.isHidden
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  toggleWindowVisibility() {
    if (this.isHidden) {
      this.showWindow();
    } else {
      this.hideWindow();
    }
  }

  hideWindow() {
    this.isHidden = true;
    this.consoleWindow.style.display = 'none';
    this.toggleIcon.style.display = 'flex';
    this.toggleIcon.title = 'Show Console';
    this.saveWindowState();
  }

  showWindow() {
    this.isHidden = false;
    this.consoleWindow.style.display = 'block';
    this.toggleIcon.style.display = 'flex';
    this.toggleIcon.title = 'Hide Console';
    this.saveWindowState();
  }

  setupDragging() {
    if (this.consoleHeader) {
      this.consoleHeader.addEventListener('mousedown', (e) => this.startDrag(e));
      document.addEventListener('mousemove', (e) => this.drag(e));
      document.addEventListener('mouseup', () => this.stopDrag());
      
      this.consoleHeader.addEventListener('touchstart', (e) => this.startDrag(e));
      document.addEventListener('touchmove', (e) => this.drag(e));
      document.addEventListener('touchend', () => this.stopDrag());
    }
  }

  setupResizing() {
    if (this.consoleWindow) {
      document.addEventListener('mousedown', (e) => this.startResize(e));
      document.addEventListener('mousemove', (e) => this.resize(e));
      document.addEventListener('mouseup', () => this.stopResize());
      
      document.addEventListener('touchstart', (e) => this.startResize(e));
      document.addEventListener('touchmove', (e) => this.resize(e));
      document.addEventListener('touchend', () => this.stopResize());
    }
  }

  setupFilterInput() {
    const filterContainer = document.querySelector('.console-filter-container');
    if (!filterContainer) {
      const container = document.createElement('div');
      container.className = 'console-filter-container';
      container.innerHTML = `
        <input 
          type="text" 
          class="console-filter-input" 
          placeholder="Filter logs..."
          aria-label="Filter console logs"
        />
        <span class="console-filter-count">0/0</span>
      `;
      this.consoleControls.insertBefore(container, this.consoleControls.firstChild);
    }

    const filterInput = document.querySelector('.console-filter-input');
    if (filterInput) {
      filterInput.addEventListener('input', (e) => this.filterLogs(e.target.value));
    }
  }

  setupCopyButton() {
    const copyBtn = document.querySelector('.console-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyAllLogs());
    }
  }

  setupClearButton() {
    const clearBtn = document.querySelector('.console-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clear());
    }
  }

  filterLogs(searchTerm) {
    if (!this.consoleOutput) return;

    const logs = this.consoleOutput.querySelectorAll('.console-log');
    let visibleCount = 0;
    const searchLower = searchTerm.toLowerCase();

    logs.forEach(log => {
      const logText = log.textContent.toLowerCase();
      const isMatch = logText.includes(searchLower);
      
      log.style.display = isMatch ? 'block' : 'none';
      if (isMatch) visibleCount++;
    });

    const filterCount = document.querySelector('.console-filter-count');
    if (filterCount) {
      filterCount.textContent = `${visibleCount}/${logs.length}`;
    }
  }

  copyAllLogs() {
    if (!this.consoleOutput) return;
    
    const logs = Array.from(this.consoleOutput.querySelectorAll('.console-log'))
      .map(log => log.textContent.trim())
      .join('\n');

    if (!logs) {
      alert('No logs to copy');
      return;
    }

    navigator.clipboard.writeText(logs).then(() => {
      const copyBtn = document.querySelector('.console-copy-btn');
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy logs');
    });
  }

  clear() {
    if (this.consoleOutput) {
      this.consoleOutput.innerHTML = '';
    }
    
    // Reset filter
    const filterInput = document.querySelector('.console-filter-input');
    if (filterInput) {
      filterInput.value = '';
      const filterCount = document.querySelector('.console-filter-count');
      if (filterCount) {
        filterCount.textContent = '0/0';
      }
    }
  }


  startDrag(e) {
    if (e.target.closest('.console-controls')) return;
    
    this.isDragging = true;
    const rect = this.consoleWindow.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    this.offsetX = clientX - rect.left;
    this.offsetY = clientY - rect.top;
    this.consoleWindow.style.cursor = 'grabbing';
  }

  drag(e) {
    if (!this.isDragging) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    let newX = clientX - this.offsetX;
    let newY = clientY - this.offsetY;
    const maxX = window.innerWidth - this.consoleWindow.offsetWidth;
    const maxY = window.innerHeight - this.consoleWindow.offsetHeight;
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    this.consoleWindow.style.bottom = 'auto';
    this.consoleWindow.style.right = 'auto';
    this.consoleWindow.style.left = newX + 'px';
    this.consoleWindow.style.top = newY + 'px';
  }

  stopDrag() {
    this.isDragging = false;
    this.consoleWindow.style.cursor = 'default';
    this.saveWindowState();
  }

  startResize(e) {
    const rect = this.consoleWindow.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    const isOnResizeHandle = 
      clientX > rect.right - 20 && 
      clientY > rect.bottom - 20;

    if (isOnResizeHandle && !this.isDragging) {
      this.isResizing = true;
      this.resizeStartX = clientX;
      this.resizeStartY = clientY;
      this.resizeStartWidth = this.consoleWindow.offsetWidth;
      this.resizeStartHeight = this.consoleWindow.offsetHeight;
      this.consoleWindow.style.cursor = 'se-resize';
      e.preventDefault();
    }
  }

  resize(e) {
    if (!this.isResizing) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    const deltaX = clientX - this.resizeStartX;
    const deltaY = clientY - this.resizeStartY;
    
    const newWidth = Math.max(this.minWidth, this.resizeStartWidth + deltaX);
    const newHeight = Math.max(this.minHeight, this.resizeStartHeight + deltaY);
    
    this.consoleWindow.style.width = newWidth + 'px';
    this.consoleWindow.style.height = newHeight + 'px';
  }

  stopResize() {
    this.isResizing = false;
    this.consoleWindow.style.cursor = 'default';
    this.saveWindowState();
  }

  addLog(message, type = 'log', metadata = {}) {
    if (!this.consoleOutput) return;
    
    const logElement = document.createElement('div');
    logElement.className = `console-log ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    logElement.innerHTML = `<span class="console-timestamp">[${timestamp}]</span>${message}`;
    
    // Store metadata on element
    logElement.dataset.method = metadata.method || 'unknown';
    logElement.dataset.fullPath = metadata.fullPath || '';
    logElement.dataset.line = metadata.line || '?';
    logElement.dataset.column = metadata.column || '?';
    logElement.dataset.file = metadata.file || '?';
    
    // Add click handler to show source code
    if (metadata.fullPath && metadata.line !== '?') {
      logElement.style.cursor = 'pointer';
      logElement.addEventListener('click', () => {
        this.showSourceCode(metadata);
      });
      logElement.title = 'Click to view source code';
    }
    
    this.consoleOutput.appendChild(logElement);
    this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
  }

  clear() {
    if (this.consoleOutput) {
      this.consoleOutput.innerHTML = '';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.consoleWindowInstance = new ConsoleWindow();
});
