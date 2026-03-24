const DashboardPage = {
  currentSection: null,
  userProfile: null, // Cache the profile data

  async init() {
    console.debug('[DashboardPage] Page initialized');
    
    setTimeout(async () => {
      console.debug('[DashboardPage] Starting dashboard initialization');
      
      // Fetch user profile first (this gets the real role)
      await this.fetchUserProfile();
      
      // Initialize section manager with config (now async)
      await this.initializeSectionManager();
      
      // Build sidebar navigation
      this.buildSidebarNav();
      
      // Display user info
      this.displayUserInfo();
      
      // Attach logout button listener
      this.attachLogoutListener();
      
      // Load default section (profile)
      this.loadSection('profile');
      
      console.debug('[DashboardPage] Dashboard initialization complete');
    }, 100);
  },

async fetchUserProfile() {
  console.debug('[DashboardPage] fetchUserProfile() called');
  
  try {
    // Check if apiClient exists
    if (typeof apiClient === 'undefined') {
      console.error('[DashboardPage] apiClient is not defined!');
      throw new Error('API client not initialized');
    }

    console.debug('[DashboardPage] Calling apiClient.get("/user/profile")');
    this.userProfile = await apiClient.get('/user/profile');
    
    console.debug('[DashboardPage] User profile fetched successfully:', {
      id: this.userProfile.id,
      email: this.userProfile.email,
      roles: this.userProfile.roles,
      rolesType: Array.isArray(this.userProfile.roles) ? 'array' : typeof this.userProfile.roles
    });

    // Update localStorage with fresh user data
    localStorage.setItem('user_data', JSON.stringify(this.userProfile));

  } catch (error) {
    console.error('[DashboardPage] Error fetching user profile:', {
      message: error.message,
      stack: error.stack,
      apiClientExists: typeof apiClient !== 'undefined'
    });
    this.showError('Failed to load user profile');
    throw error;
  }
},


  async initializeSectionManager() {
    console.debug('[DashboardPage] initializeSectionManager() called');
    
    try {
      // Fetch sections directly from config.json file
      console.debug('[DashboardPage] Fetching sections from config/config.json');
      const response = await fetch('config/config.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      
      const config = await response.json();
      const sections = config.sections || [];
      
      console.debug('[DashboardPage] Sections loaded from file:', sections.length);
      
      if (sections.length === 0) {
        console.error('[DashboardPage] No sections found in configuration file');
        this.showError('Failed to load dashboard configuration');
        return;
      }

      // Initialize manager with sections config
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

    // Get user roles (now from profile API)
    const userRoles = this.getUserRoles();
    console.debug('[DashboardPage] Current user roles:', userRoles);

    // Get accessible sections from manager
    const accessibleSections = dashboardSectionManager.getAccessibleSections(userRoles);
    console.debug('[DashboardPage] Accessible sections:', accessibleSections.map(s => s.name));

    // Clear existing menu
    sidebarMenu.innerHTML = '';

    // Build menu items for accessible sections
    accessibleSections.forEach(section => {
      const menuItem = this.createMenuItemElement(section);
      sidebarMenu.appendChild(menuItem);
      console.debug('[DashboardPage] Added menu item:', section.name);
    });

    console.debug('[DashboardPage] Sidebar navigation built');
  },

  createMenuItemElement(section) {
    console.debug('[DashboardPage] createMenuItemElement() called for:', section.name);
    
    const li = document.createElement('li');
    li.className = 'sidebar-menu-item';
    li.id = `menu-${section.name}`;
    
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'sidebar-menu-link';
    a.textContent = section.title;
    
    a.addEventListener('click', (e) => {
      e.preventDefault();
      console.debug('[DashboardPage] Menu item clicked:', section.name);
      this.loadSection(section.name);
    });
    
    li.appendChild(a);
    return li;
  },

  async loadSection(sectionName) {
    console.debug('[DashboardPage] loadSection() called for:', sectionName);
    
    const userRoles = this.getUserRoles();
    
    try {
      // Show loading state
      this.showLoadingState(true);
      
      // Cleanup previous section if exists
      if (this.currentSection) {
        console.debug('[DashboardPage] Cleaning up previous section:', this.currentSection);
        await dashboardSectionManager.cleanupSection(this.currentSection);
      }
      
      // Load new section via manager
      console.debug('[DashboardPage] Loading section via DashboardSectionManager');
      await dashboardSectionManager.loadSection(sectionName, userRoles);
      
      // Update active menu item
      this.updateActiveMenuItem(sectionName);
      
      // Update current section
      this.currentSection = sectionName;
      
      console.debug('[DashboardPage] Section loaded and initialized:', sectionName);
      
    } catch (error) {
      console.error('[DashboardPage] Error loading section:', {
        message: error.message,
        sectionName: sectionName
      });
      
      const section = dashboardSectionManager.getSection(sectionName);
      const sectionTitle = section ? section.title : sectionName;
      this.showError(`Failed to load ${sectionTitle}`);
      
    } finally {
      // Hide loading state
      this.showLoadingState(false);
    }
  },

  showLoadingState(isLoading) {
    console.debug('[DashboardPage] showLoadingState() called:', isLoading);
    
    const container = document.getElementById('section-container');
    if (!container) return;
    
    if (isLoading) {
      container.innerHTML = '<div class="section-loading"><p>Loading section...</p></div>';
      console.debug('[DashboardPage] Loading state shown');
    } else {
      // Remove loading state (section HTML will be in place)
      const loadingDiv = container.querySelector('.section-loading');
      if (loadingDiv) {
        loadingDiv.remove();
        console.debug('[DashboardPage] Loading state removed');
      }
    }
  },

  updateActiveMenuItem(sectionName) {
    console.debug('[DashboardPage] updateActiveMenuItem() called for:', sectionName);
    
    // Remove active class from all items
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to current item
    const activeItem = document.getElementById(`menu-${sectionName}`);
    if (activeItem) {
      activeItem.classList.add('active');
      console.debug('[DashboardPage] Active menu item updated:', sectionName);
    }
  },

  getUserRoles() {
    console.debug('[DashboardPage] getUserRoles() called');
    
    // Return roles from fetched profile, or empty array as fallback
    if (this.userProfile && this.userProfile.roles) {
      const rolesArray = Array.from(this.userProfile.roles); // Convert Set to Array if needed
      console.debug('[DashboardPage] User roles retrieved from profile:', rolesArray);
      return rolesArray;
    }
    
    console.warn('[DashboardPage] No user roles found, defaulting to empty array');
    return [];
  },

  displayUserInfo() {
    console.debug('[DashboardPage] displayUserInfo() called');
    
    try {
      const userEmailElement = document.getElementById('dashboard-user-email');
      
      if (this.userProfile && userEmailElement) {
        // Display full name if available, otherwise email
        const displayName = this.userProfile.firstName && this.userProfile.lastName 
          ? `${this.userProfile.firstName} ${this.userProfile.lastName}`
          : this.userProfile.email;
        
        userEmailElement.textContent = displayName;
        console.debug('[DashboardPage] User info displayed:', displayName);
      } else {
        console.error('[DashboardPage] Could not display user info');
        if (userEmailElement) {
          userEmailElement.textContent = 'User info not found';
        }
      }
    } catch (error) {
      console.error('[DashboardPage] Error displaying user info:', error.message);
    }
  },

  attachLogoutListener() {
    console.debug('[DashboardPage] attachLogoutListener() called');
    
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        console.debug('[DashboardPage] Logout button clicked');
        this.handleLogout(e);
      });
      console.debug('[DashboardPage] Logout button listener attached');
    } else {
      console.error('[DashboardPage] Logout button not found');
    }
  },

  async handleLogout(e) {
    console.debug('[DashboardPage] handleLogout() called');
    e.preventDefault();
    
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    const originalText = logoutBtn.textContent;
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Logging out...';

    try {
      console.debug('[DashboardPage] Calling authService.logout()');
      await authService.logout();
      console.debug('[DashboardPage] authService.logout() completed successfully');
      
      this.showSuccess('Logged out successfully!');
      
      setTimeout(() => {
        console.debug('[DashboardPage] Redirecting to login');
        window.location.href = '#login';
      }, 1000);
      
    } catch (error) {
      console.error('[DashboardPage] Logout failed:', error.message);
      this.showError('Logout failed. Please try again.');
      logoutBtn.disabled = false;
      logoutBtn.textContent = originalText;
    }
  },

  showError(message) {
    console.debug('[DashboardPage] showError() called:', message);
    const uiController = UIController.getInstance();
    uiController.showMessage(message, 'error');
  },

  showSuccess(message) {
    console.debug('[DashboardPage] showSuccess() called:', message);
    const uiController = UIController.getInstance();
    uiController.showMessage(message, 'success');
  }
};

window.DashboardPage = DashboardPage;
