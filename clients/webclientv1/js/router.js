class Router {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pages = {};
  }

  register(pageName, htmlPath, pageScript) {
    this.pages[pageName] = { htmlPath, pageScript };
  }

  async load(pageName) {
    const page = this.pages[pageName];
    if (!page) {
      console.error(`Page ${pageName} not registered`);
      return;
    }

    try {
      const response = await fetch(page.htmlPath);
      const html = await response.text();
      this.container.innerHTML = html;

      if (page.pageScript) {
        page.pageScript.init();
      }
    } catch (error) {
      console.error(`Error loading page ${pageName}:`, error);
    }
  }
}

const router = new Router('page-container');
