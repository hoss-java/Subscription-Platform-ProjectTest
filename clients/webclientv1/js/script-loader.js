class ScriptLoader {
  constructor() {
    this.loadedScripts = new Set();
    console.debug('[ScriptLoader] Constructor called - initializing loadedScripts Set');
  }

  async loadScripts(scripts) {
    console.debug('[ScriptLoader] loadScripts() called');
    console.debug('[ScriptLoader] Scripts to load:', scripts);
    console.debug('[ScriptLoader] Scripts array length:', scripts.length);
    console.debug('[ScriptLoader] Scripts array is array?:', Array.isArray(scripts));
    
    if (!scripts || scripts.length === 0) {
      console.warn('[ScriptLoader] No scripts provided to load');
      return;
    }
    
    for (const scriptPath of scripts) {
      console.debug('[ScriptLoader] Processing script:', scriptPath);
      console.debug('[ScriptLoader] Script path type:', typeof scriptPath);
      console.debug('[ScriptLoader] Already loaded?:', this.loadedScripts.has(scriptPath));
      
      if (this.loadedScripts.has(scriptPath)) {
        console.debug('[ScriptLoader] ⊘ Script already loaded (skipping):', scriptPath);
        continue;
      }

      console.debug('[ScriptLoader] → Starting injection of:', scriptPath);
      try {
        await this.injectScript(scriptPath);
        this.loadedScripts.add(scriptPath);
        console.debug('[ScriptLoader] ✓ Script fully loaded and tracked:', scriptPath);
        console.debug('[ScriptLoader] Total loaded scripts:', this.loadedScripts.size);
      } catch (error) {
        console.error('[ScriptLoader] ✗ Failed to load script:', scriptPath);
        console.error('[ScriptLoader] Error details:', error.message);
        throw error;
      }
    }
    
    console.debug('[ScriptLoader] All scripts loaded successfully');
    console.debug('[ScriptLoader] Total scripts loaded:', this.loadedScripts.size);
    console.debug('[ScriptLoader] Loaded scripts list:', Array.from(this.loadedScripts));
    
    // ✅ Wait for all scripts to fully initialize
    console.debug('[ScriptLoader] Waiting 200ms for scripts to initialize...');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.debug('[ScriptLoader] All scripts ready for initialization');
  }

  injectScript(scriptPath) {
    return new Promise((resolve, reject) => {
      console.debug('[ScriptLoader.injectScript] Creating script element for:', scriptPath);
      
      const script = document.createElement('script');
      script.src = scriptPath;
      script.type = 'text/javascript';
      script.async = false;
      script.defer = false;
      
      console.debug('[ScriptLoader.injectScript] Script element created');
      console.debug('[ScriptLoader.injectScript] Script.src:', script.src);
      console.debug('[ScriptLoader.injectScript] Script.async:', script.async);
      console.debug('[ScriptLoader.injectScript] Script.defer:', script.defer);
      
      script.onload = () => {
        console.debug('[ScriptLoader.injectScript] ✓ onload event fired for:', scriptPath);
        console.debug('[ScriptLoader.injectScript] Waiting 10ms before resolving promise');
        setTimeout(() => {
          console.debug('[ScriptLoader.injectScript] ✓ Resolving promise for:', scriptPath);
          resolve();
        }, 10);
      };
      
      script.onerror = (error) => {
        console.error('[ScriptLoader.injectScript] ✗ onerror event fired for:', scriptPath);
        console.error('[ScriptLoader.injectScript] Error object:', error);
        console.error('[ScriptLoader.injectScript] Error message:', error.message || 'Unknown error');
        reject(new Error(`Failed to load ${scriptPath}`));
      };
      
      console.debug('[ScriptLoader.injectScript] Appending script to document.head');
      document.head.appendChild(script);
      console.debug('[ScriptLoader.injectScript] Script appended to head, waiting for onload/onerror');
    });
  }
}

const scriptLoader = new ScriptLoader();
console.debug('[ScriptLoader] Global scriptLoader instance created');
