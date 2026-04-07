const MysubscriptionsSection = {
  currentPage: 0,
  pageSize: 12,
  totalPages: 0,
  subscriptions: [],
  plansMap: {}, // Cache plan details by planId
  currentServiceType: '',
  currentSearchQuery: '',
  currentSubscriptionId: null,

  async init() {
    setTimeout(async () => {
      this.attachEventListeners();
      await this.loadServiceTypes();
      await this.loadPlans();  // ← ADD THIS LINE
      await this.loadSubscriptions();
    }, 100);
  },

  async loadPlans() {
    try {
      const response = await apiClient.get('/plans?page=0&size=1000');
      
      let plans = [];
      if (response.content && Array.isArray(response.content)) {
        plans = response.content;
      } else if (Array.isArray(response)) {
        plans = response;
      }

      // Create a map of planId -> plan object
      this.plansMap = {};
      plans.forEach(plan => {
        this.plansMap[plan.id] = plan;
      });

      console.debug('[MySubscriptionsSection] Plans map loaded:', this.plansMap);
    } catch (error) {
      console.error('[MySubscriptionsSection] Error loading plans:', error);
    }
  },

  async loadServiceTypes() {
    try {
      const response = await apiClient.get('/subscriptions/my-subscriptions?page=0&size=1000');
      
      let subscriptions = [];
      if (response.content && Array.isArray(response.content)) {
        subscriptions = response.content;
      } else if (Array.isArray(response)) {
        subscriptions = response;
      }

      const serviceTypes = [...new Set(subscriptions.map(s => s.serviceType).filter(Boolean))];
      serviceTypes.sort();

      this.populateServiceTypeDropdown(serviceTypes);
    } catch (error) {
      console.error('Error loading service types:', error);
    }
  },

  syncFilterUI() {
    const serviceTypeFilter = document.getElementById('mysubscriptions-service-type-filter');
    const searchInput = document.getElementById('mysubscriptions-search-input');

    if (serviceTypeFilter) {
      serviceTypeFilter.value = this.currentServiceType;
    }

    if (searchInput) {
      searchInput.value = this.currentSearchQuery;
    }
  },

  attachEventListeners() {
    const serviceTypeFilter = document.getElementById('mysubscriptions-service-type-filter');
    const searchInput = document.getElementById('mysubscriptions-search-input');
    const refreshBtn = document.getElementById('mysubscriptions-refresh-btn');
    const detailCloseBtn = document.getElementById('mysubscriptions-detail-close-btn');
    const detailCloseBtnFooter = document.getElementById('mysubscriptions-detail-close-footer-btn');

    if (serviceTypeFilter) {
      serviceTypeFilter.addEventListener('change', (e) => {
        this.currentServiceType = e.target.value;
        this.currentPage = 0;
        this.loadSubscriptions();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearchQuery = e.target.value;
        this.currentPage = 0;
        this.loadSubscriptions();
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
        this.loadSubscriptions();
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
  },

  populateServiceTypeDropdown(serviceTypes) {
    const dropdown = document.getElementById('mysubscriptions-service-type-filter');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">All Types</option>';
    
    serviceTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      dropdown.appendChild(option);
    });
  },

  async loadSubscriptions() {
    const container = document.getElementById('mysubscriptions-container');
    if (!container) return;

    container.innerHTML = '<p class="loading-message">Loading subscriptions...</p>';

    try {
      let endpoint = `/subscriptions/my-subscriptions?page=${this.currentPage}&size=${this.pageSize}`;

      if (this.currentSearchQuery) {
        endpoint = `/subscriptions/my-subscriptions/search?q=${encodeURIComponent(this.currentSearchQuery)}&page=${this.currentPage}&size=${this.pageSize}`;
      } else if (this.currentServiceType) {
        endpoint = `/subscriptions/my-subscriptions/filter?serviceType=${this.currentServiceType}&page=${this.currentPage}&size=${this.pageSize}`;
      }

      const response = await apiClient.get(endpoint);

      let subscriptions = [];
      let totalPages = 0;

      if (response.content && Array.isArray(response.content)) {
        subscriptions = response.content;
        totalPages = response.totalPages || 0;
      } else if (Array.isArray(response)) {
        subscriptions = response;
        totalPages = 1;
      }

      this.subscriptions = subscriptions;
      this.totalPages = totalPages;

      if (this.subscriptions.length === 0) {
        container.innerHTML = '<p class="empty-message">No subscriptions found.</p>';
      } else {
        // WAIT for plan data to load BEFORE rendering
        await this.enrichSubscriptionsWithPlanData();
        this.renderSubscriptions();
      }

      this.renderPagination();
      this.syncFilterUI();

    } catch (error) {
      container.innerHTML = `<p class="error-message">Error loading subscriptions: ${error.message}</p>`;
      
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error loading subscriptions: ${error.message}`, 'error');
    }
  },

  async enrichSubscriptionsWithPlanData() {
    console.debug('[MySubscriptionsSection] Enriching subscriptions with plan data');
    console.debug('[MySubscriptionsSection] Current subscriptions:', JSON.stringify(this.subscriptions, null, 2));
    
    // Add logging to see planIds
    this.subscriptions.forEach(sub => {
      console.debug('[MySubscriptionsSection] Subscription planId:', sub.planId);
    });
    
    const planPromises = this.subscriptions
      .filter(sub => sub.planId && !this.plansMap[sub.planId])
      .map(sub => this.fetchPlanData(sub.planId));

    try {
      await Promise.all(planPromises);
      console.debug('[MySubscriptionsSection] All plan data loaded');
      console.debug('[MySubscriptionsSection] PlansMap cache:', JSON.stringify(this.plansMap, null, 2));
    } catch (error) {
      console.error('[MySubscriptionsSection] Error fetching plan data:', error);
    }
  },

  async fetchPlanData(planId) {
    if (this.plansMap[planId]) {
      return;
    }

    try {
      console.debug('[MySubscriptionsSection] Fetching plan details for planId:', planId);
      const response = await apiClient.get(`/plans/${planId}`);
      
      let plan = response;
      if (response.data) {
        plan = response.data;
      }

      console.debug('[MySubscriptionsSection] Plan response:', JSON.stringify(plan, null, 2));
      console.debug('[MySubscriptionsSection] Plan operatorName:', plan?.operatorName);
      
      this.plansMap[planId] = plan;
      console.debug('[MySubscriptionsSection] Plan data cached for planId:', planId);
    } catch (error) {
      console.error('[MySubscriptionsSection] Error fetching plan details for planId:', planId, error);
    }
  },

  renderSubscriptions() {
    const container = document.getElementById('mysubscriptions-container');
    container.innerHTML = '';

    console.debug('[MySubscriptionsSection] Rendering subscriptions, plansMap:', this.plansMap);

    this.subscriptions.forEach(subscription => {
      console.debug('[MySubscriptionsSection] Rendering subscription:', subscription.id, 'planId:', subscription.planId);
      
      const plan = this.plansMap[subscription.planId];
      console.debug('[MySubscriptionsSection] Found plan for subscription:', plan);
      
      const operatorName = plan?.operatorName || subscription.operatorName || 'N/A';
      console.debug('[MySubscriptionsSection] Using operatorName:', operatorName);

      const card = document.createElement('div');
      card.className = 'plan-card';
      card.dataset.subscriptionId = subscription.id;

      const cardHeader = document.createElement('div');
      cardHeader.className = 'plan-card-header';

      const operatorNameElement = document.createElement('span');
      operatorNameElement.className = 'plan-operator-name';
      operatorNameElement.textContent = this.escapeHtml(operatorName);
      cardHeader.appendChild(operatorNameElement);

      card.appendChild(cardHeader);

      const planName = document.createElement('h3');
      planName.className = 'plan-name';
      planName.textContent = this.escapeHtml(subscription.planName || 'N/A');
      card.appendChild(planName);

      const description = document.createElement('p');
      description.className = 'plan-description';
      description.textContent = this.escapeHtml(plan?.description || subscription.description || 'No description');
      card.appendChild(description);

      const badgesContainer = document.createElement('div');
      badgesContainer.className = 'plan-badges-container';

      const serviceTypeBadge = document.createElement('span');
      serviceTypeBadge.className = 'plan-service-type-badge';
      serviceTypeBadge.textContent = plan?.serviceType || subscription.serviceType || 'N/A';
      badgesContainer.appendChild(serviceTypeBadge);

      const statusBadge = document.createElement('span');
      statusBadge.className = `plan-status-badge plan-status-${subscription.status.toLowerCase()}`;
      statusBadge.textContent = subscription.status;
      badgesContainer.appendChild(statusBadge);

      card.appendChild(badgesContainer);

      const cardActions = document.createElement('div');
      cardActions.className = 'plan-card-actions';

      const detailBtn = document.createElement('button');
      detailBtn.className = 'btn btn-sm btn-secondary';
      detailBtn.textContent = 'View Details';
      detailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDetailModal(subscription.id);
      });
      cardActions.appendChild(detailBtn);

      card.appendChild(cardActions);

      container.appendChild(card);
    });
  },

  renderPagination() {
    const paginationContainer = document.getElementById('mysubscriptions-pagination');
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
        this.loadSubscriptions();
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
        this.loadSubscriptions();
      }
    });
    paginationContainer.appendChild(nextBtn);
  },

  async openDetailModal(subscriptionId) {
    console.debug('[MySubscriptionsSection] openDetailModal called with subscriptionId:', subscriptionId);
    
    this.currentSubscriptionId = subscriptionId;
    const modal = document.getElementById('mysubscriptions-detail-modal');
    const detailContent = document.getElementById('mysubscriptions-detail-content');
    const billsSection = document.getElementById('mysubscriptions-bills-section');

    if (!modal || !detailContent) {
      return;
    }

    detailContent.innerHTML = '<p class="loading-message">Loading subscription details...</p>';
    modal.classList.add('active');

    try {
      const response = await apiClient.get(`/subscriptions/${subscriptionId}`);
      
      let subscription = response;
      if (response.data) {
        subscription = response.data;
      }

      // Fetch plan details if not already cached
      let plan = this.plansMap[subscription.planId];
      if (!plan && subscription.planId) {
        await this.fetchPlanData(subscription.planId);
        plan = this.plansMap[subscription.planId];
      }

      // Get operator name and service type from subscription or plan
      const operatorName = subscription.operatorName || plan?.operatorName || 'N/A';
      const serviceType = subscription.serviceType || plan?.serviceType || 'N/A';

      document.getElementById('mysubscriptions-detail-title').textContent = `${subscription.planName} - ${operatorName}`;

      // Build features list from plan data
      let featuresList = [];
      if (plan && plan.features) {
        try {
          const parsed = JSON.parse(plan.features);
          featuresList = Array.isArray(parsed) ? parsed : [plan.features];
        } catch {
          featuresList = plan.features.split(',').map(f => f.trim());
        }
      }

      detailContent.innerHTML = `
        <div class="plan-detail-info">
          <p><strong>Operator:</strong> ${this.escapeHtml(operatorName)}</p>
          <p><strong>Plan:</strong> ${this.escapeHtml(subscription.planName || 'N/A')}</p>
          <p><strong>Service Type:</strong> ${this.escapeHtml(serviceType)}</p>
          <p><strong>Status:</strong> ${subscription.status || 'N/A'}</p>
          <p><strong>Price:</strong> ${plan && plan.basePrice ? `$${plan.basePrice} / ${plan.billingPeriod || 'N/A'}` : 'N/A'}</p>
          <p><strong>Description:</strong> ${this.escapeHtml(plan?.description || subscription.description || 'No description')}</p>
          <p><strong>Start Date:</strong> ${subscription.startDate || 'N/A'}</p>
          <p><strong>Next Billing Date:</strong> ${subscription.nextBillingDate || 'N/A'}</p>
          <div class="plan-detail-features">
            <strong>Features:</strong>
            <ul id="subscription-detail-features-list"></ul>
          </div>
        </div>
      `;

      // Populate features list
      const featuresList_element = document.getElementById('subscription-detail-features-list');
      if (featuresList.length > 0) {
        featuresList.forEach(feature => {
          const li = document.createElement('li');
          li.textContent = this.escapeHtml(feature);
          featuresList_element.appendChild(li);
        });
      } else {
        featuresList_element.innerHTML = '<li>No features listed</li>';
      }

      // Load unpaid bills
      this.loadUnpaidBills(billsSection);

    } catch (error) {
      console.error('[MySubscriptionsSection] Error loading subscription details:', error);
      detailContent.innerHTML = `<p class="error-message">Error loading subscription details: ${error.message}</p>`;
      
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error loading subscription details: ${error.message}`, 'error');
    }
  },

  loadUnpaidBills(billsSection) {
    const billsList = document.getElementById('mysubscriptions-bills-list');
    
    billsList.innerHTML = `
      <p class="coming-soon-message">Bills feature coming soon</p>
    `;
    billsSection.style.display = 'block';
  },

  closeDetailModal() {
    const modal = document.getElementById('mysubscriptions-detail-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.currentSubscriptionId = null;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  cleanup() {
    // Optional: cleanup when section is unloaded
  }
};
window.MysubscriptionsSection = MysubscriptionsSection;

