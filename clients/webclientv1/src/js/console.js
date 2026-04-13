// console.js
class ConsoleWindow {
  static instance = null;
  
  constructor() {
    const sel = (s) => document.querySelector(s);
    this.consoleWindow = sel('.console-window');
    this.consoleHeader = sel('.console-header');
    this.consoleOutput = sel('.console-output');
    this.consoleControls = sel('.console-controls');
    
    this.isDragging = this.isResizing = this.isHidden = false;
    this.offsetX = this.offsetY = 0;
    this.minWidth = 250;
    this.minHeight = 150;
    this.sourceCache = {};
    this.storageKey = 'consoleWindowState';
    
    [this.setupToggleIcon, this.restoreWindowState, this.setupDragging, 
     this.setupResizing, this.setupControls, this.setupSourceViewer]
      .forEach(fn => fn.call(this));
  }

  static getInstance() {
    return ConsoleWindow.instance ||= new ConsoleWindow();
  }

  setupControls() {
    this.setupFilterInput();
    this.setupCopyButton();
    this.setupClearButton();
  }

  setupToggleIcon() {
    let toggleIcon = document.querySelector('.console-toggle-icon') || 
      (() => {
        const btn = document.createElement('button');
        btn.className = 'console-toggle-icon';
        btn.title = 'Toggle Console';
        btn.innerHTML = '📋';
        document.body.appendChild(btn);
        return btn;
      })();
    
    this.toggleIcon = toggleIcon;
    toggleIcon.addEventListener('click', () => this.toggleWindowVisibility());
  }

  setupSourceViewer() {
    if (document.getElementById('source-viewer-modal')) return;
    
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
    
    modal.querySelector('.source-viewer-close').addEventListener('click', () => this.closeSourceViewer());
    modal.querySelector('.source-viewer-copy-btn').addEventListener('click', () => this.copySourceCode());
    modal.addEventListener('click', (e) => e.target === modal && this.closeSourceViewer());
  }

  async fetchSourceFile(filePath) {
    if (this.sourceCache[filePath]) return this.sourceCache[filePath];
    
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const sourceCode = await response.text();
      return this.sourceCache[filePath] = sourceCode;
    } catch (e) {
      console.error(`Failed to fetch source: ${filePath}`, e);
      return null;
    }
  }

  async showSourceCode({ fullPath, line, method, file }) {
    if (!fullPath || line === '?') return alert('Source code information not available');
    
    const sourceCode = await this.fetchSourceFile(fullPath);
    if (!sourceCode) return alert('Failed to load source code');

    const lines = sourceCode.split('\n');
    const targetLineIndex = parseInt(line) - 1;
    const startLine = Math.max(0, targetLineIndex - 10);
    const endLine = Math.min(lines.length, targetLineIndex + 11);
    
    const codeLines = lines.slice(startLine, endLine);
    const displayCode = this.formatCodeLines(codeLines, startLine, parseInt(line));

    const modal = document.getElementById('source-viewer-modal');
    document.getElementById('source-viewer-title').textContent = `Source Code - ${file}`;
    document.getElementById('source-viewer-file').textContent = `📄 ${fullPath}`;
    document.getElementById('source-viewer-function').textContent = `ƒ ${method}`;
    document.getElementById('source-viewer-line').textContent = `📍 Line ${line}`;
    document.getElementById('source-viewer-code').innerHTML = displayCode;
    
    this.currentSourceMetadata = { fullPath, line, file, lines };
    this.currentSourceCode = codeLines.join('\n');
    this.setupLoadFullSourceButton(modal, lines, parseInt(line));
    
    modal.style.display = 'flex';
  }

  formatCodeLines(codeLines, startLineNum, highlightLine) {
    return codeLines.map((codeLine, i) => {
      const lineNum = startLineNum + i + 1;
      const cls = lineNum === highlightLine ? 'highlight' : '';
      return `<span class="line-number ${cls}">${lineNum}</span>${this.escapeHtml(codeLine)}`;
    }).join('\n');
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
      document.getElementById('source-viewer-code').innerHTML = this.formatCodeLines(allLines, 0, highlightLine);
      this.scrollToLine(highlightLine);
      loadFullBtn.style.display = 'none';
      this.currentSourceCode = allLines.join('\n');
    };
    
    loadFullBtn.style.display = 'block';
  }

  scrollToLine(lineNumber) {
    const codeElement = document.getElementById('source-viewer-code');
    const target = Array.from(codeElement.querySelectorAll('.line-number'))
      .find(el => el.textContent.trim() === lineNumber.toString());
    
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  closeSourceViewer() {
    const modal = document.getElementById('source-viewer-modal');
    if (modal) modal.style.display = 'none';
  }

  copySourceCode() {
    if (!this.currentSourceCode) return;
    
    navigator.clipboard.writeText(this.currentSourceCode).then(() => {
      const copyBtn = document.querySelector('.source-viewer-copy-btn');
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => copyBtn.textContent = originalText, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy source code');
    });
  }

  escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  restoreWindowState() {
    try {
      const state = JSON.parse(localStorage.getItem(this.storageKey));
      if (!state) return;
      
      if (state.width) this.consoleWindow.style.width = state.width + 'px';
      if (state.height) this.consoleWindow.style.height = state.height + 'px';
      
      if (state.left !== undefined && state.top !== undefined) {
        this.consoleWindow.style.left = state.left + 'px';
        this.consoleWindow.style.top = state.top + 'px';
        this.consoleWindow.style.bottom = this.consoleWindow.style.right = 'auto';
      }
      
      if (state.isHidden) {
        this.consoleWindow.style.display = 'none';
        this.isHidden = true;
      }
    } catch (e) {
      console.error('Failed to restore console window state:', e);
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
    this.isHidden ? this.showWindow() : this.hideWindow();
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
    if (!this.consoleHeader) return;
    
    const dragHandler = (e) => {
      e.preventDefault();
      this.startDrag(e);
    };
    const moveHandler = (e) => this.drag(e);
    const stopHandler = () => this.stopDrag();
    
    this.consoleHeader.addEventListener('mousedown', dragHandler);
    this.consoleHeader.addEventListener('touchstart', dragHandler);
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('mouseup', stopHandler);
    document.addEventListener('touchend', stopHandler);
  }

  setupResizing() {
    if (!this.consoleWindow) return;
    
    const resizeHandler = (e) => this.startResize(e);
    const moveHandler = (e) => this.resize(e);
    const stopHandler = () => this.stopResize();
    
    this.consoleWindow.addEventListener('mousedown', resizeHandler);
    this.consoleWindow.addEventListener('touchstart', resizeHandler);
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('mouseup', stopHandler);
    document.addEventListener('touchend', stopHandler);
  }

  setupFilterInput() {
    let filterContainer = document.querySelector('.console-filter-container');
    
    if (!filterContainer) {
      filterContainer = document.createElement('div');
      filterContainer.className = 'console-filter-container';
      filterContainer.innerHTML = `
        <input type="text" class="console-filter-input" placeholder="Filter logs..." aria-label="Filter console logs" />
        <span class="console-filter-count">0/0</span>
      `;
      this.consoleControls.insertBefore(filterContainer, this.consoleControls.firstChild);
    }

    const filterInput = document.querySelector('.console-filter-input');
    filterInput?.addEventListener('input', (e) => this.filterLogs(e.target.value));
  }

  setupCopyButton() {
    document.querySelector('.console-copy-btn')?.addEventListener('click', () => this.copyAllLogs());
  }

  setupClearButton() {
    document.querySelector('.console-clear-btn')?.addEventListener('click', () => this.clear());
  }

  filterLogs(searchTerm) {
    if (!this.consoleOutput) return;

    const logs = this.consoleOutput.querySelectorAll('.console-log');
    const searchLower = searchTerm.toLowerCase();
    let visibleCount = 0;

    logs.forEach(log => {
      const isMatch = log.textContent.toLowerCase().includes(searchLower);
      log.style.display = isMatch ? 'block' : 'none';
      if (isMatch) visibleCount++;
    });

    const filterCount = document.querySelector('.console-filter-count');
    if (filterCount) filterCount.textContent = `${visibleCount}/${logs.length}`;
  }

  copyAllLogs() {
    if (!this.consoleOutput) return;
    
    const logs = Array.from(this.consoleOutput.querySelectorAll('.console-log'))
      .map(log => log.textContent.trim())
      .join('\n');

    if (!logs) return alert('No logs to copy');

    navigator.clipboard.writeText(logs).then(() => {
      const copyBtn = document.querySelector('.console-copy-btn');
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => copyBtn.textContent = originalText, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy logs');
    });
  }

  clear() {
    if (this.consoleOutput) this.consoleOutput.innerHTML = '';
    
    const filterInput = document.querySelector('.console-filter-input');
    if (filterInput) {
      filterInput.value = '';
      const filterCount = document.querySelector('.console-filter-count');
      if (filterCount) filterCount.textContent = '0/0';
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
    let newX = Math.max(0, Math.min(clientX - this.offsetX, window.innerWidth - this.consoleWindow.offsetWidth));
    let newY = Math.max(0, Math.min(clientY - this.offsetY, window.innerHeight - this.consoleWindow.offsetHeight));
    
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
    
    if (clientX > rect.right - 20 && clientY > rect.bottom - 20 && !this.isDragging) {
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
    const newWidth = Math.max(this.minWidth, this.resizeStartWidth + clientX - this.resizeStartX);
    const newHeight = Math.max(this.minHeight, this.resizeStartHeight + clientY - this.resizeStartY);
    
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
    logElement.innerHTML = `<span class="console-timestamp">[${new Date().toLocaleTimeString()}]</span>${message}`;
    
    Object.assign(logElement.dataset, {
      method: metadata.method || 'unknown',
      fullPath: metadata.fullPath || '',
      line: metadata.line || '?',
      column: metadata.column || '?',
      file: metadata.file || '?'
    });
    
    if (metadata.fullPath && metadata.line !== '?') {
      logElement.style.cursor = 'pointer';
      logElement.title = 'Click to view source code';
      logElement.addEventListener('click', () => this.showSourceCode(metadata));
    }
    
    this.consoleOutput.appendChild(logElement);
    this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
  }
}

// EXPORT TO WINDOW
window.ConsoleWindow = ConsoleWindow;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConsoleWindow;
}