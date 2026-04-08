const PlansSection = {
  currentPage: 0,
  pageSize: 12,
  totalPages: 0,
  plans: [],
  allPlans: [],
  currentServiceType: '',
  currentSearchQuery: '',
  currentPlanId: null,
  userSubscriptions: {}, // Map planId -> subscription status

  async init() {
    setTimeout(async () => {
      this.attachEventListeners();
      await this.loadServiceTypes();
      
      // Load subscriptions FIRST and wait for it to complete
      await this.loadUserSubscriptions();
      
      // Then load and render plans with populated subscription data
      this.loadPlans();
    }, 100);
  },

  async loadUserSubscriptions() {
    try {
      const userRole = this.getUserRole();
      
      // Only load subscriptions for customers
      if (userRole !== 'CUSTOMER') {
        return;
      }

      const response = await apiClient.get('/subscriptions/my-subscriptions?page=0&size=1000');
      
      let subscriptions = [];
      if (response.content && Array.isArray(response.content)) {
        subscriptions = response.content;
      } else if (Array.isArray(response)) {
        subscriptions = response;
      }

      // Create a map of planId -> subscription status
      this.userSubscriptions = {};
      subscriptions.forEach(sub => {
        this.userSubscriptions[sub.planId] = sub.status; // e.g., "PENDING", "ACTIVE", "SUSPENDED"
      });

      console.debug('[PlansSection] User subscriptions loaded:', this.userSubscriptions);
    } catch (error) {
      console.error('[PlansSection] Error loading user subscriptions:', error);
      // Don't show error message - it's okay if subscriptions can't be loaded
    }
  },

  async loadServiceTypes() {
    try {
      const response = await apiClient.get('/plans/service-types');
      
      let serviceTypes = [];
      if (Array.isArray(response)) {
        serviceTypes = response;
      }

      serviceTypes.sort();
      this.populateServiceTypeDropdown(serviceTypes);
    } catch (error) {
      console.error('Error loading service types:', error);
    }
  },

  syncFilterUI() {
    const serviceTypeFilter = document.getElementById('plans-service-type-filter');
    const searchInput = document.getElementById('plans-search-input');

    if (serviceTypeFilter) {
      serviceTypeFilter.value = this.currentServiceType;
    }

    if (searchInput) {
      searchInput.value = this.currentSearchQuery;
    }
  },

  attachEventListeners() {
    const serviceTypeFilter = document.getElementById('plans-service-type-filter');
    const searchInput = document.getElementById('plans-search-input');
    const refreshBtn = document.getElementById('plans-refresh-btn');
    const detailCloseBtn = document.getElementById('plans-detail-close-btn');
    const detailCloseBtnFooter = document.getElementById('plans-detail-close-footer-btn');
    const detailSubscribeBtn = document.getElementById('plans-detail-subscribe-btn');

    if (serviceTypeFilter) {
      serviceTypeFilter.addEventListener('change', (e) => {
        this.currentServiceType = e.target.value;
        this.currentPage = 0;
        this.loadPlans();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearchQuery = e.target.value;
        this.currentPage = 0;
        this.loadPlans();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentPage = 0;
        this.currentServiceType = '';
        this.currentSearchQuery = '';
        if (serviceTypeFilter) serviceTypeFilter.value = '';
        if (searchInput) searchInput.value = '';
        this.loadUserSubscriptions(); // Reload subscriptions
        this.loadPlans();
      });
    }

    if (detailCloseBtn) {
      detailCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeDetailModal();
      });
    }

    if (detailCloseBtnFooter) {
      detailCloseBtnFooter.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeDetailModal();
      });
    }

    if (detailSubscribeBtn) {
      detailSubscribeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSubscribeClick();
      });
    }
  },

  populateServiceTypeDropdown(serviceTypes) {
    const dropdown = document.getElementById('plans-service-type-filter');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">All Types</option>';
    
    serviceTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      dropdown.appendChild(option);
    });
  },

  async loadPlans() {
    const container = document.getElementById('plans-container');
    if (!container) return;

    container.innerHTML = '<p class="loading-message">Loading plans...</p>';

    try {
      let endpoint = `/plans?page=${this.currentPage}&size=${this.pageSize}`;

      if (this.currentSearchQuery) {
        endpoint = `/plans/search?q=${encodeURIComponent(this.currentSearchQuery)}&page=${this.currentPage}&size=${this.pageSize}`;
      } else if (this.currentServiceType) {
        endpoint = `/plans/filter?serviceType=${this.currentServiceType}&page=${this.currentPage}&size=${this.pageSize}`;
      }

      const response = await apiClient.get(endpoint);

      let plans = [];
      let totalPages = 0;

      if (response.content && Array.isArray(response.content)) {
        plans = response.content;
        totalPages = response.totalPages || 0;
      } else if (Array.isArray(response)) {
        plans = response;
        totalPages = 1;
      }

      this.plans = plans;
      this.totalPages = totalPages;

      if (this.plans.length === 0) {
        container.innerHTML = '<p class="empty-message">No plans found.</p>';
      } else {
        this.renderPlans();
      }

      this.renderPagination();
      this.syncFilterUI();

    } catch (error) {
      container.innerHTML = `<p class="error-message">Error loading plans: ${error.message}</p>`;
      
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error loading plans: ${error.message}`, 'error');
    }
  },

  renderPlans() {
    const container = document.getElementById('plans-container');
    container.innerHTML = '';

    const userRole = this.getUserRole(); // Get user role once

    this.plans.forEach(plan => {
      const card = document.createElement('div');
      card.className = 'plan-card';
      card.dataset.planId = plan.id;

      const cardHeader = document.createElement('div');
      cardHeader.className = 'plan-card-header';

      const operatorName = document.createElement('span');
      operatorName.className = 'plan-operator-name';
      operatorName.textContent = this.escapeHtml(plan.operatorName || 'N/A');
      cardHeader.appendChild(operatorName);

      const favoriteBtn = document.createElement('button');
      favoriteBtn.className = 'plan-favorite-btn';
      favoriteBtn.innerHTML = '&#9829;';
      favoriteBtn.dataset.planId = plan.id;
      favoriteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleFavorite(plan.id, favoriteBtn);
      });
      cardHeader.appendChild(favoriteBtn);

      card.appendChild(cardHeader);

      const planName = document.createElement('h3');
      planName.className = 'plan-name';
      planName.textContent = this.escapeHtml(plan.name);
      card.appendChild(planName);

      const description = document.createElement('p');
      description.className = 'plan-description';
      description.textContent = this.escapeHtml(plan.description || 'No description');
      card.appendChild(description);

      const badgesContainer = document.createElement('div');
      badgesContainer.className = 'plan-badges-container';

      const serviceTypeBadge = document.createElement('span');
      serviceTypeBadge.className = 'plan-service-type-badge';
      serviceTypeBadge.textContent = plan.serviceType || 'N/A';
      badgesContainer.appendChild(serviceTypeBadge);

      // Only show subscription status badge for customers who have subscribed
      if (userRole === 'CUSTOMER') {
        const subscriptionStatus = this.userSubscriptions[plan.id];
        if (subscriptionStatus) {
          const statusBadge = document.createElement('span');
          statusBadge.className = `plan-status-badge plan-status-${subscriptionStatus.toLowerCase()}`;
          statusBadge.textContent = subscriptionStatus;
          badgesContainer.appendChild(statusBadge);
        }
      }

      card.appendChild(badgesContainer);

      const priceSection = document.createElement('div');
      priceSection.className = 'plan-price-section';

      const price = document.createElement('span');
      price.className = 'plan-price';
      price.textContent = `$${plan.basePrice}`;
      priceSection.appendChild(price);

      const billingPeriod = document.createElement('span');
      billingPeriod.className = 'plan-billing-period';
      billingPeriod.textContent = `/${plan.billingPeriod || 'N/A'}`;
      priceSection.appendChild(billingPeriod);

      card.appendChild(priceSection);

      const features = document.createElement('div');
      features.className = 'plan-features';
      features.innerHTML = '<strong>Features:</strong>';
      
      let featuresList = [];
      if (plan.features) {
        try {
          const parsed = JSON.parse(plan.features);
          featuresList = Array.isArray(parsed) ? parsed : [plan.features];
        } catch {
          featuresList = plan.features.split(',').map(f => f.trim());
        }
      }

      if (featuresList.length > 0) {
        const ul = document.createElement('ul');
        featuresList.slice(0, 3).forEach(feature => {
          const li = document.createElement('li');
          li.textContent = this.escapeHtml(feature);
          ul.appendChild(li);
        });
        features.appendChild(ul);
      }

      card.appendChild(features);

      const cardActions = document.createElement('div');
      cardActions.className = 'plan-card-actions';

      const detailBtn = document.createElement('button');
      detailBtn.className = 'btn btn-sm btn-secondary';
      detailBtn.textContent = 'View Details';
      detailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDetailModal(plan.id);
      });
      cardActions.appendChild(detailBtn);

      card.appendChild(cardActions);

      container.appendChild(card);
    });
  },

  renderPagination() {
    const paginationContainer = document.getElementById('plans-pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (this.totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-sm btn-secondary';
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = this.currentPage === 0;
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentPage > 0) {
        this.currentPage--;
        this.loadPlans();
      }
    });
    paginationContainer.appendChild(prevBtn);

    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `Page ${this.currentPage + 1} of ${this.totalPages}`;
    paginationContainer.appendChild(pageInfo);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-sm btn-secondary';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = this.currentPage >= this.totalPages - 1;
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        this.loadPlans();
      }
    });
    paginationContainer.appendChild(nextBtn);
  },

  async openDetailModal(planId) {
    console.debug('[PlansSection] openDetailModal called with planId:', planId);
    
    this.currentPlanId = planId;
    const modal = document.getElementById('plans-detail-modal');
    const detailContent = document.getElementById('plans-detail-content');

    console.debug('[PlansSection] Modal element found:', !!modal);
    console.debug('[PlansSection] Detail content element found:', !!detailContent);

    if (!modal || !detailContent) {
      console.debug('[PlansSection] Missing modal or detailContent, returning');
      return;
    }

    detailContent.innerHTML = '<p class="loading-message">Loading plan details...</p>';
    modal.classList.add('active');

    try {
      console.debug('[PlansSection] Fetching plan details from /plans/' + planId);
      const response = await apiClient.get(`/plans/${planId}`);
      console.debug('[PlansSection] API response:', response);
      
      let plan = response;
      if (response.data) {
        plan = response.data;
      }

      console.debug('[PlansSection] Plan object to display:', plan);

      document.getElementById('plans-detail-title').textContent = `${plan.name} - ${plan.operatorName}`;

      detailContent.innerHTML = `
        <div class="plan-detail-info">
          <p><strong>Operator:</strong> ${this.escapeHtml(plan.operatorName || 'N/A')}</p>
          <p><strong>Service Type:</strong> ${plan.serviceType || 'N/A'}</p>
          <p><strong>Price:</strong> $${plan.basePrice} / ${plan.billingPeriod || 'N/A'}</p>
          <p><strong>Description:</strong> ${this.escapeHtml(plan.description || 'No description')}</p>
          <div class="plan-detail-features">
            <strong>Features:</strong>
            <ul id="plan-detail-features-list"></ul>
          </div>
        </div>
      `;

      const featuresList = document.getElementById('plan-detail-features-list');
      let features = [];
      if (plan.features) {
        try {
          const parsed = JSON.parse(plan.features);
          features = Array.isArray(parsed) ? parsed : [plan.features];
        } catch {
          features = plan.features.split(',').map(f => f.trim());
        }
      }

      console.debug('[PlansSection] Features extracted:', features);

      if (features.length > 0) {
        features.forEach(feature => {
          const li = document.createElement('li');
          li.textContent = this.escapeHtml(feature);
          featuresList.appendChild(li);
        });
      } else {
        featuresList.innerHTML = '<li>No features listed</li>';
      }

      console.debug('[PlansSection] Calling updateDetailModalButtons with plan:', plan);
      this.updateDetailModalButtons(plan);

    } catch (error) {
      console.error('[PlansSection] Error loading plan details:', error);
      detailContent.innerHTML = `<p class="error-message">Error loading plan details: ${error.message}</p>`;
      
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error loading plan details: ${error.message}`, 'error');
    }
  },

  updateDetailModalButtons(plan) {
    console.debug('[PlansSection] updateDetailModalButtons called');
    
    const userRole = this.getUserRole();
    console.debug('[PlansSection] Detected user role:', userRole);
    console.debug('[PlansSection] Plan status:', plan.status);
    
    const subscribeBtn = document.getElementById('plans-detail-subscribe-btn');
    console.debug('[PlansSection] Subscribe button element found:', !!subscribeBtn);
    
    if (!subscribeBtn) {
      console.debug('[PlansSection] No subscribe button element, returning early');
      return;
    }

    const subscriptionStatus = this.userSubscriptions[plan.id];
    console.debug('[PlansSection] User subscription status for this plan:', subscriptionStatus);

    if (userRole === 'CUSTOMER') {
      console.debug('[PlansSection] User is CUSTOMER');
      
      if (subscriptionStatus) {
        // Customer already has a subscription for this plan
        console.debug('[PlansSection] Customer already subscribed with status:', subscriptionStatus);
        subscribeBtn.textContent = `Already Subscribed (${subscriptionStatus})`;
        subscribeBtn.className = 'btn btn-primary';
        subscribeBtn.disabled = true;
        subscribeBtn.style.display = 'block';
      } else {
        // Customer can subscribe
        console.debug('[PlansSection] Customer can subscribe to this plan');
        subscribeBtn.textContent = 'Subscribe Now';
        subscribeBtn.className = 'btn btn-primary';
        subscribeBtn.disabled = false;
        subscribeBtn.style.display = 'block';
      }
    } else if (userRole === 'ADMIN') {
      console.debug('[PlansSection] User is ADMIN - showing Disable/Activate');
      subscribeBtn.textContent = plan.status === 'ACTIVE' ? 'Disable Plan' : 'Activate Plan';
      subscribeBtn.className = plan.status === 'ACTIVE' ? 'btn btn-danger' : 'btn btn-success';
      subscribeBtn.disabled = false;
      subscribeBtn.style.display = 'block';
    } else {
      console.debug('[PlansSection] User role is neither CUSTOMER nor ADMIN:', userRole, '- hiding button');
      subscribeBtn.style.display = 'none';
    }
  },

  async handleSubscribeClick() {
    console.debug('[PlansSection] handleSubscribeClick called');
    
    const userRole = this.getUserRole();
    const planId = this.currentPlanId;
    
    console.debug('[PlansSection] User role:', userRole, 'Plan ID:', planId);

    if (userRole === 'CUSTOMER') {
      await this.subscribeToplan(planId);
    } else if (userRole === 'ADMIN') {
      // Handle admin plan activation/deactivation
      const plan = this.plans.find(p => p.id === planId);
      if (plan) {
        await this.togglePlanStatus(plan);
      }
    }
  },

  async subscribeToplan(planId) {
    console.debug('[PlansSection] subscribeToplan called with planId:', planId);
    
    const subscribeBtn = document.getElementById('plans-detail-subscribe-btn');
    const originalText = subscribeBtn.textContent;
    
    try {
      subscribeBtn.disabled = true;
      subscribeBtn.textContent = 'Processing...';

      const request = {
        planId: planId
      };

      console.debug('[PlansSection] Sending subscription request:', request);
      const response = await apiClient.post('/subscriptions', request);

      console.debug('[PlansSection] Subscription created successfully:', response);

      // Update local subscriptions map
      this.userSubscriptions[planId] = response.status;

      const uiController = UIController.getInstance();
      uiController.showMessage(
        `Successfully subscribed to plan! Status: ${response.status}`,
        'success'
      );

      // Refresh subscriptions and plans
      setTimeout(() => {
        this.loadUserSubscriptions();
        this.loadPlans();
        this.closeDetailModal();
      }, 1500);

    } catch (error) {
      console.error('[PlansSection] Error subscribing to plan:', error);
      
      const uiController = UIController.getInstance();
      uiController.showMessage(
        `Error subscribing to plan: ${error.message}`,
        'error'
      );

      subscribeBtn.disabled = false;
      subscribeBtn.textContent = originalText;
    }
  },

  async togglePlanStatus(plan) {
    console.debug('[PlansSection] togglePlanStatus called for plan:', plan.id);
    
    // This would be implemented based on your admin plan management needs
    // For now, show a message that this feature is coming
    const uiController = UIController.getInstance();
    uiController.showMessage('Plan status management coming soon!', 'info');
  },

  closeDetailModal() {
    const modal = document.getElementById('plans-detail-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.currentPlanId = null;
  },

  toggleFavorite(planId, btn) {
    btn.classList.toggle('favorited');
    const uiController = UIController.getInstance();
    const isFavorited = btn.classList.contains('favorited');
    uiController.showMessage(
      isFavorited ? 'Plan added to favorites!' : 'Plan removed from favorites!',
      'success'
    );
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  cleanup() {
    // Optional: cleanup when section is unloaded
  },

  getUserRole() {
    const userStr = localStorage.getItem('user_data');
    console.debug('[PlansSection] localStorage.user_data (raw string):', userStr);
    
    const user = JSON.parse(userStr || '{}');
    console.debug('[PlansSection] Full user object:', JSON.stringify(user, null, 2));
    console.debug('[PlansSection] user.roles:', user.roles);
    
    const role = (user.roles && user.roles.length > 0) ? user.roles[0] : '';
    console.debug('[PlansSection] Final role returned:', role);
    
    return role;
  }
};

window.PlansSection = PlansSection;


    
