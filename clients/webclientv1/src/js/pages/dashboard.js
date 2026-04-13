const DashboardPage = {
  currentSection: null,
  userProfile: null,

  async init() {
    console.debug('[DashboardPage] Page initialized');
    setTimeout(async () => {
      console.debug('[DashboardPage] Starting dashboard initialization');
      await this.fetchUserProfile();
      await this.initializeSectionManager();
      this.buildSidebarNav();
      this.displayUserInfo();
      this.attachLogoutListener();
      this.loadSection('profile');
      console.debug('[DashboardPage] Dashboard initialization complete');
    }, 100);
  },

  async fetchUserProfile() {
    console.debug('[DashboardPage] fetchUserProfile() called');
    try {
      if (typeof apiClient === 'undefined') throw new Error('API client not initialized');
      this.userProfile = await apiClient.get('/user/profile');
      console.debug('[DashboardPage] User profile fetched:', { id: this.userProfile.id, email: this.userProfile.email, roles: this.userProfile.roles });
      localStorage.setItem('user_data', JSON.stringify(this.userProfile));
    } catch (error) {
      console.error('[DashboardPage] Error fetching user profile:', { message: error.message, apiClientExists: typeof apiClient !== 'undefined' });
      this.showError('Failed to load user profile');
      throw error;
    }
  },

  async initializeSectionManager() {
    console.debug('[DashboardPage] initializeSectionManager() called');
    try {
      const response = await fetch('config/config.json');
      if (!response.ok) throw new Error(`Failed to load config: ${response.status}`);
      
      const sections = (await response.json()).sections || [];
      if (sections.length === 0) {
        console.error('[DashboardPage] No sections found in configuration file');
        this.showError('Failed to load dashboard configuration');
        return;
      }
      
      dashboardSectionManager.initialize(sections);
      console.debug('[DashboardPage] DashboardSectionManager initialized with', sections.length, 'sections');
    } catch (error) {
      console.error('[DashboardPage] Error loading configuration:', error.message);
      this.showError('Failed to load dashboard configuration');
    }
  },

  buildSidebarNav() {
    console.debug('[DashboardPage] buildSidebarNav() called');
    const sidebarMenu = document.getElementById('sidebar-menu');
    if (!sidebarMenu) {
      console.error('[DashboardPage] sidebar-menu element not found');
      return;
    }

    const userRoles = this.getUserRoles();
    const accessibleSections = dashboardSectionManager.getAccessibleSections(userRoles);
    
    sidebarMenu.innerHTML = '';
    accessibleSections.forEach(section => {
      sidebarMenu.appendChild(this.createMenuItemElement(section));
      console.debug('[DashboardPage] Added menu item:', section.name);
    });
  },

  createMenuItemElement(section) {
    const li = document.createElement('li');
    li.className = 'sidebar-menu-item';
    li.id = `menu-${section.name}`;
    
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'sidebar-menu-link';
    a.textContent = section.title;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadSection(section.name);
    });
    
    li.appendChild(a);
    return li;
  },

  async loadSection(sectionName) {
    console.debug('[DashboardPage] loadSection() called for:', sectionName);
    const userRoles = this.getUserRoles();
    
    try {
      this.showLoadingState(true);
      if (this.currentSection) await dashboardSectionManager.cleanupSection(this.currentSection);
      await dashboardSectionManager.loadSection(sectionName, userRoles);
      this.updateActiveMenuItem(sectionName);
      this.currentSection = sectionName;
      console.debug('[DashboardPage] Section loaded:', sectionName);
    } catch (error) {
      console.error('[DashboardPage] Error loading section:', { message: error.message, sectionName });
      const section = dashboardSectionManager.getSection(sectionName);
      this.showError(`Failed to load ${section ? section.title : sectionName}`);
    } finally {
      this.showLoadingState(false);
    }
  },

  showLoadingState(isLoading) {
    const container = document.getElementById('section-container');
    if (!container) return;
    
    if (isLoading) {
      container.innerHTML = '<div class="section-loading"><p>Loading section...</p></div>';
    } else {
      const loadingDiv = container.querySelector('.section-loading');
      if (loadingDiv) loadingDiv.remove();
    }
  },

  updateActiveMenuItem(sectionName) {
    document.querySelectorAll('.sidebar-menu-item').forEach(item => item.classList.remove('active'));
    const activeItem = document.getElementById(`menu-${sectionName}`);
    if (activeItem) activeItem.classList.add('active');
  },

  getUserRoles() {
    return (this.userProfile?.roles && Array.from(this.userProfile.roles)) || [];
  },

  displayUserInfo() {
    console.debug('[DashboardPage] displayUserInfo() called');
    const userEmailElement = document.getElementById('dashboard-user-email');
    if (userEmailElement && this.userProfile) {
      userEmailElement.textContent = this.userProfile.firstName && this.userProfile.lastName 
        ? `${this.userProfile.firstName} ${this.userProfile.lastName}`
        : this.userProfile.email;
    }
  },

  attachLogoutListener() {
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
  },

  async handleLogout(e) {
    console.debug('[DashboardPage] handleLogout() called');
    e.preventDefault();
    
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    const originalText = logoutBtn.textContent;
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Logging out...';

    try {
      await authService.logout();
      this.showSuccess('Logged out successfully!');
      setTimeout(() => window.location.href = '#login', 1000);
    } catch (error) {
      console.error('[DashboardPage] Logout failed:', error.message);
      this.showError('Logout failed. Please try again.');
      logoutBtn.disabled = false;
      logoutBtn.textContent = originalText;
    }
  },

  showError(message) {
    UIController.getInstance().showMessage(message, 'error');
  },

  showSuccess(message) {
    UIController.getInstance().showMessage(message, 'success');
  }
};

window.DashboardPage = DashboardPage;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardPage;
}