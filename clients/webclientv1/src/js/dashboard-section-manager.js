class DashboardSectionManager {
  constructor() {
    this.sections = [];
    this.currentSection = null;
    this.sectionInstances = {};
  }

  normalizeRoles(roles) {
    return !roles ? [] : (Array.isArray(roles) ? roles : [roles]).map(r => r.toLowerCase());
  }

  async initialize(sectionsConfig) {
    this.sections = sectionsConfig;
  }

  getAccessibleSections(userRole) {
    const normalizedUserRole = this.normalizeRoles(userRole);
    return this.sections.filter(section => 
      this.normalizeRoles(section.roles).some(role => normalizedUserRole.includes(role))
    );
  }

  canAccessSection(sectionName, userRole) {
    const section = this.sections.find(s => s.name === sectionName);
    if (!section) return false;
    
    const normalizedUserRole = this.normalizeRoles(userRole);
    const normalizedSectionRoles = this.normalizeRoles(section.roles);
    return normalizedSectionRoles.some(role => normalizedUserRole.includes(role));
  }

  async loadSectionHTML(section) {
    try {
      const response = await fetch(section.path);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to load section HTML for ${section.name}: ${error.message}`);
    }
  }

  initializeSectionScript(section) {
    const className = section.name.charAt(0).toUpperCase() + section.name.slice(1) + 'Section';
    const SectionClass = window[className];
    
    if (!SectionClass || typeof SectionClass.init !== 'function') {
      throw new Error(`Section script not loaded or missing init() method: ${className}`);
    }
    
    SectionClass.init();
    this.sectionInstances[section.name] = SectionClass;
  }

  async loadSection(sectionName, userRole) {
    if (!this.canAccessSection(sectionName, userRole)) {
      throw new Error(`Access denied to section: ${sectionName}`);
    }

    const section = this.sections.find(s => s.name === sectionName);
    if (!section) throw new Error(`Section not found: ${sectionName}`);

    try {
      const html = await this.loadSectionHTML(section);
      const container = document.getElementById('section-container');
      
      if (!container) throw new Error('Section container not found');
      
      container.innerHTML = html;
      
      const titleElement = document.getElementById('section-title');
      if (titleElement) titleElement.textContent = section.title;

      this.initializeSectionScript(section);
      this.currentSection = sectionName;
      
      return section;
    } catch (error) {
      throw new Error(`Error loading section ${sectionName}: ${error.message}`);
    }
  }

  getCurrentSection() {
    return this.currentSection;
  }

  getSectionInstance(sectionName) {
    return this.sectionInstances[sectionName] || null;
  }

  async cleanupSection(sectionName) {
    const instance = this.sectionInstances[sectionName];
    if (instance?.cleanup && typeof instance.cleanup === 'function') {
      await instance.cleanup();
    }
  }

  getSection(sectionName) {
    return this.sections.find(s => s.name === sectionName) || null;
  }
}

const dashboardSectionManager = new DashboardSectionManager();
window.dashboardSectionManager = dashboardSectionManager;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dashboardSectionManager;
}