class DashboardSectionManager {
  constructor() {
    console.debug('[DashboardSectionManager] Constructor called');
    this.sections = [];
    this.currentSection = null;
    this.sectionInstances = {};
  }

  /**
   * Normalize roles to lowercase array
   */
  normalizeRoles(roles) {
    if (!roles) return [];
    
    // Handle single string role
    if (typeof roles === 'string') {
      return [roles.toLowerCase()];
    }
    
    // Handle array of roles
    if (Array.isArray(roles)) {
      return roles.map(role => role.toLowerCase());
    }
    
    return [];
  }

  /**
   * Initialize section manager with config
   */
  async initialize(sectionsConfig) {
    console.debug('[DashboardSectionManager] initialize() called with', sectionsConfig.length, 'sections');
    
    this.sections = sectionsConfig;
    console.debug('[DashboardSectionManager] Sections registered:', this.sections.map(s => s.name));
  }

  /**
   * Get sections accessible by user role
   */
  getAccessibleSections(userRole) {
    console.debug('[DashboardSectionManager] getAccessibleSections() called for role:', userRole);
    
    const normalizedUserRole = this.normalizeRoles(userRole);
    console.debug('[DashboardSectionManager] Normalized user role:', normalizedUserRole);
    
    const accessible = this.sections.filter(section => {
      const normalizedSectionRoles = this.normalizeRoles(section.roles);
      const hasAccess = normalizedSectionRoles.some(role => normalizedUserRole.includes(role));
      
      if (!hasAccess) {
        console.debug('[DashboardSectionManager] Filtered out section (no access):', section.name);
      }
      return hasAccess;
    });
    
    console.debug('[DashboardSectionManager] Accessible sections:', accessible.map(s => s.name));
    return accessible;
  }

  /**
   * Check if user can access a specific section
   */
  canAccessSection(sectionName, userRole) {
    console.debug('[DashboardSectionManager] canAccessSection() called:', sectionName, 'for role:', userRole);
    
    const section = this.sections.find(s => s.name === sectionName);
    if (!section) {
      console.error('[DashboardSectionManager] Section not found:', sectionName);
      return false;
    }

    const normalizedUserRole = this.normalizeRoles(userRole);
    const normalizedSectionRoles = this.normalizeRoles(section.roles);
    
    console.debug('[DashboardSectionManager] Normalized user role:', normalizedUserRole);
    console.debug('[DashboardSectionManager] Normalized section roles:', normalizedSectionRoles);
    
    const hasAccess = normalizedSectionRoles.some(role => normalizedUserRole.includes(role));
    console.debug('[DashboardSectionManager] Access result:', hasAccess);
    return hasAccess;
  }

  /**
   * Load section HTML from file
   */
  async loadSectionHTML(section) {
    console.debug('[DashboardSectionManager] loadSectionHTML() called for:', section.name);
    
    try {
      const response = await fetch(section.path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      console.debug('[DashboardSectionManager] HTML loaded successfully for:', section.name);
      return html;
      
    } catch (error) {
      console.error('[DashboardSectionManager] Failed to load section HTML:', {
        section: section.name,
        path: section.path,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Initialize section script (call init() method)
   */
/**
 * Initialize the section's JavaScript
 */
initializeSectionScript(section) {
  console.debug('[DashboardSectionManager] initializeSectionScript() called for:', section.name);
  console.debug('[DashboardSectionManager] Section object:', section);
  console.debug('[DashboardSectionManager] Section script property:', section.script);
  
  // Create the class name from section name (e.g., "admin" -> "AdminSection")
  const className = section.name.charAt(0).toUpperCase() + section.name.slice(1) + 'Section';
  console.debug('[DashboardSectionManager] Expected class name:', className);
  
  // Check if the section class exists in window
  const SectionClass = window[className];
  console.debug('[DashboardSectionManager] Looking for window.' + className);
  console.debug('[DashboardSectionManager] Found?:', !!SectionClass);
  console.debug('[DashboardSectionManager] Type:', typeof SectionClass);
  
  if (!SectionClass) {
    const error = `Section script not loaded: ${className}`;
    console.error('[DashboardSectionManager]', error);
    console.error('[DashboardSectionManager] Available window properties:', Object.keys(window).filter(k => k.includes('Section')));
    throw new Error(error);
  }

  // Call init() on the section
  console.debug('[DashboardSectionManager] Calling init() on:', className);
  if (typeof SectionClass.init === 'function') {
    SectionClass.init();
    console.debug('[DashboardSectionManager] ✓ Section initialized successfully');
    
    // Store the section instance for later cleanup
    this.sectionInstances = this.sectionInstances || {};
    this.sectionInstances[section.name] = SectionClass;
    console.debug('[DashboardSectionManager] Section instance stored');
  } else {
    const error = `Section ${className} does not have an init() method`;
    console.error('[DashboardSectionManager]', error);
    console.error('[DashboardSectionManager] Available methods:', Object.keys(SectionClass));
    throw new Error(error);
  }
}


  /**
   * Load and display a section
   */
  async loadSection(sectionName, userRole) {
    console.debug('[DashboardSectionManager] loadSection() called:', sectionName, 'for role:', userRole);
    
    // Check access
    if (!this.canAccessSection(sectionName, userRole)) {
      const error = `Access denied to section: ${sectionName}`;
      console.error('[DashboardSectionManager]', error);
      throw new Error(error);
    }

    // Find section config
    const section = this.sections.find(s => s.name === sectionName);
    if (!section) {
      const error = `Section not found: ${sectionName}`;
      console.error('[DashboardSectionManager]', error);
      throw new Error(error);
    }

    try {
      // Load HTML
      console.debug('[DashboardSectionManager] Loading HTML for:', sectionName);
      const html = await this.loadSectionHTML(section);

      // Insert into DOM
      const container = document.getElementById('section-container');
      if (!container) {
        throw new Error('Section container not found');
      }
      container.innerHTML = html;
      console.debug('[DashboardSectionManager] HTML inserted into container');

      // Update section title
      const titleElement = document.getElementById('section-title');
      if (titleElement) {
        titleElement.textContent = section.title;
        console.debug('[DashboardSectionManager] Section title updated:', section.title);
      }

      // Initialize script
      console.debug('[DashboardSectionManager] Initializing section script');
      this.initializeSectionScript(section);

      // Update current section
      this.currentSection = sectionName;
      console.debug('[DashboardSectionManager] Current section set to:', sectionName);

      return section;

    } catch (error) {
      console.error('[DashboardSectionManager] Error loading section:', {
        section: sectionName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get current section name
   */
  getCurrentSection() {
    console.debug('[DashboardSectionManager] getCurrentSection() called');
    return this.currentSection;
  }

  /**
   * Get section instance by name
   */
  getSectionInstance(sectionName) {
    console.debug('[DashboardSectionManager] getSectionInstance() called for:', sectionName);
    return this.sectionInstances[sectionName] || null;
  }

  /**
   * Cleanup section before unloading
   */
  async cleanupSection(sectionName) {
    console.debug('[DashboardSectionManager] cleanupSection() called for:', sectionName);
    
    const instance = this.sectionInstances[sectionName];
    if (instance && instance.cleanup && typeof instance.cleanup === 'function') {
      console.debug('[DashboardSectionManager] Calling cleanup() on section:', sectionName);
      await instance.cleanup();
    }
  }

  /**
   * Get section config by name
   */
  getSection(sectionName) {
    console.debug('[DashboardSectionManager] getSection() called for:', sectionName);
    return this.sections.find(s => s.name === sectionName) || null;
  }
}

// Create singleton instance
const dashboardSectionManager = new DashboardSectionManager();
window.dashboardSectionManager = dashboardSectionManager;
