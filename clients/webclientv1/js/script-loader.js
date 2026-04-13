class ScriptLoader {
  constructor() {
    this.loadedScripts = new Set();
  }

  async loadScripts(scripts) {
    if (!Array.isArray(scripts) || scripts.length === 0) return;

    for (const scriptPath of scripts) {
      if (this.loadedScripts.has(scriptPath)) continue;
      
      await this.injectScript(scriptPath);
      this.loadedScripts.add(scriptPath);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  injectScript(scriptPath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptPath;
      script.async = false;
      script.defer = false;

      script.onload = () => setTimeout(() => resolve(), 10);
      script.onerror = () => reject(new Error(`Failed to load ${scriptPath}`));

      document.head.appendChild(script);
    });
  }
}

const scriptLoader = new ScriptLoader();
