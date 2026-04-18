const PlansSection = {
  currentPage: 0,
  pageSize: 12,
  totalPages: 0,
  plans: [],
  allPlans: [],
  currentServiceType: '',
  currentSearchQuery: '',
  currentPlanId: null,
  userSubscriptions: {},
  userRole: '',
  initTimeout: null,
  abortControllers: {},

  async init() {
    this.initTimeout = setTimeout(async () => {
      this.attachEventListeners();
      this.userRole = this.getUserRole();
      await Promise.all([this.loadServiceTypes(), this.loadUserSubscriptions()]);
      this.loadPlans();
    }, 100);
  },

  async loadUserSubscriptions() {
    if (this.userRole !== 'CUSTOMER') return;
    try {
      const response = await apiClient.get('/subscriptions/my-subscriptions?page=0&size=1000');
      const subscriptions = Array.isArray(response.content) ? response.content : (Array.isArray(response) ? response : []);
      this.userSubscriptions = subscriptions.reduce((acc, { planId, status }) => ({ ...acc, [planId]: status }), {});
    } catch (error) {
      console.error('[PlansSection] Error loading user subscriptions:', error);
    }
  },

  async loadServiceTypes() {
    try {
      const response = await apiClient.get('/plans/service-types');
      this.populateServiceTypeDropdown((Array.isArray(response) ? response : []).sort());
    } catch (error) {
      console.error('Error loading service types:', error);
    }
  },

  syncFilterUI() {
    const serviceTypeFilter = document.getElementById('plans-service-type-filter');
    const searchInput = document.getElementById('plans-search-input');
    if (serviceTypeFilter) serviceTypeFilter.value = this.currentServiceType;
    if (searchInput) searchInput.value = this.currentSearchQuery;
  },

  attachEventListeners() {
    const getEl = id => document.getElementById(id);
    const handlers = {
      'plans-service-type-filter': (e) => {
        this.currentServiceType = e.target.value;
        this.currentPage = 0;
        this.loadPlans();
      },
      'plans-search-input': (e) => {
        this.currentSearchQuery = e.target.value;
        this.currentPage = 0;
        this.loadPlans();
      },
      'plans-refresh-btn': () => {
        this.resetFilters();
        this.loadUserSubscriptions();
        this.loadPlans();
      },
      'plans-detail-close-btn': () => this.closeDetailModal(),
      'plans-detail-close-footer-btn': () => this.closeDetailModal(),
      'plans-detail-subscribe-btn': () => this.handleSubscribeClick(),
    };

    Object.entries(handlers).forEach(([id, handler]) => {
      const el = getEl(id);
      if (el) el.addEventListener(id.includes('filter') || id.includes('search') ? 'change' : (id.includes('search') ? 'input' : 'click'), handler);
    });
  },

  resetFilters() {
    this.currentPage = 0;
    this.currentServiceType = '';
    this.currentSearchQuery = '';
    ['plans-service-type-filter', 'plans-search-input'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  },

  populateServiceTypeDropdown(serviceTypes) {
    const dropdown = document.getElementById('plans-service-type-filter');
    if (!dropdown) return;
    const fragment = document.createDocumentFragment();
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'All Types';
    fragment.appendChild(option);
    serviceTypes.forEach(type => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = type;
      fragment.appendChild(opt);
    });
    dropdown.innerHTML = '';
    dropdown.appendChild(fragment);
  },

  async loadPlans() {
    const container = document.getElementById('plans-container');
    if (!container) return;
    container.innerHTML = '<p class="loading-message">Loading plans...</p>';
    try {
      const response = await apiClient.get(this.buildPlanEndpoint());
      const { plans, totalPages } = this.extractPlanData(response);
      this.plans = plans;
      this.totalPages = totalPages;
      container.innerHTML = plans.length === 0 ? '<p class="empty-message">No plans found.</p>' : '';
      if (plans.length > 0) this.renderPlans();
      this.renderPagination();
      this.syncFilterUI();
    } catch (error) {
      container.innerHTML = `<p class="error-message">Error loading plans: ${error.message}</p>`;
      UIController.getInstance().showMessage(`Error loading plans: ${error.message}`, 'error');
    }
  },

  buildPlanEndpoint() {
    const baseParams = `page=${this.currentPage}&size=${this.pageSize}`;
    if (this.currentSearchQuery) return `/plans/search?q=${encodeURIComponent(this.currentSearchQuery)}&${baseParams}`;
    if (this.currentServiceType) return `/plans/filter?serviceType=${encodeURIComponent(this.currentServiceType)}&${baseParams}`;
    return `/plans?${baseParams}`;
  },

  extractPlanData(response) {
    return response.content && Array.isArray(response.content) 
      ? { plans: response.content, totalPages: response.totalPages || 0 }
      : { plans: Array.isArray(response) ? response : [], totalPages: 1 };
  },

  parseFeatures(featuresData) {
    if (!featuresData) return [];
    try {
      const parsed = JSON.parse(featuresData);
      return Array.isArray(parsed) ? parsed : [featuresData];
    } catch {
      return featuresData.split(',').map(f => f.trim()).filter(Boolean);
    }
  },

  renderPlans() {
    const container = document.getElementById('plans-container');
    const fragment = document.createDocumentFragment();
    this.plans.forEach(plan => fragment.appendChild(this.createPlanCard(plan)));
    container.innerHTML = '';
    container.appendChild(fragment);
  },

  createPlanCard(plan) {
    const card = document.createElement('div');
    card.className = 'plan-card';
    card.dataset.planId = plan.id;
    const sections = [
      this.createCardHeader(plan),
      this.createElement('h3', 'plan-name', this.escapeHtml(plan.name)),
      this.createElement('p', 'plan-description', this.escapeHtml(plan.description || 'No description')),
      this.createBadges(plan),
      this.createPriceSection(plan),
      this.createFeaturesSection(plan),
      this.createCardActions(plan),
    ];
    sections.forEach(el => card.appendChild(el));
    return card;
  },

  createElement(tag, className, text) {
    const el = document.createElement(tag);
    el.className = className;
    el.textContent = text;
    return el;
  },

  createCardHeader(plan) {
    const header = document.createElement('div');
    header.className = 'plan-card-header';
    header.appendChild(this.createElement('span', 'plan-operator-name', this.escapeHtml(plan.operatorName || 'N/A')));
    const favBtn = document.createElement('button');
    favBtn.className = 'plan-favorite-btn';
    favBtn.innerHTML = '&#9829;';
    favBtn.dataset.planId = plan.id;
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleFavorite(plan.id, favBtn);
    });
    header.appendChild(favBtn);
    return header;
  },

  createBadges(plan) {
    const container = document.createElement('div');
    container.className = 'plan-badges-container';
    container.appendChild(this.createElement('span', 'plan-service-type-badge', plan.serviceType || 'N/A'));
    if (this.userRole === 'CUSTOMER') {
      const status = this.userSubscriptions[plan.id];
      if (status) {
        const badge = document.createElement('span');
        badge.className = `plan-status-badge plan-status-${status.toLowerCase()}`;
        badge.textContent = status;
        container.appendChild(badge);
      }
    }
    return container;
  },

  createPriceSection(plan) {
    const section = document.createElement('div');
    section.className = 'plan-price-section';
    section.appendChild(this.createElement('span', 'plan-price', `$${plan.basePrice}`));
    section.appendChild(this.createElement('span', 'plan-billing-period', `/${plan.billingPeriod || 'N/A'}`));
    return section;
  },

  createFeaturesSection(plan) {
    const section = document.createElement('div');
    section.className = 'plan-features';
    section.appendChild(this.createElement('strong', '', 'Features:'));
    const features = this.parseFeatures(plan.features);
    if (features.length > 0) {
      const ul = document.createElement('ul');
      features.slice(0, 3).forEach(feature => {
        const li = document.createElement('li');
        li.textContent = this.escapeHtml(feature);
        ul.appendChild(li);
      });
      section.appendChild(ul);
    }
    return section;
  },

  createCardActions(plan) {
    const actions = document.createElement('div');
    actions.className = 'plan-card-actions';
    const detailBtn = document.createElement('button');
    detailBtn.className = 'btn btn-sm btn-secondary';
    detailBtn.textContent = 'View Details';
    detailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openDetailModal(plan.id);
    });
    actions.appendChild(detailBtn);
    return actions;
  },

  renderPagination() {
    const container = document.getElementById('plans-pagination');
    if (!container || this.totalPages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }
    const fragment = document.createDocumentFragment();
    const createPaginationBtn = (text, disabled, onClick) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-secondary';
      btn.textContent = text;
      btn.disabled = disabled;
      btn.addEventListener('click', onClick);
      return btn;
    };
    fragment.appendChild(createPaginationBtn('Previous', this.currentPage === 0, (e) => {
      e.preventDefault();
      if (this.currentPage > 0) {
        this.currentPage--;
        this.loadPlans();
      }
    }));
    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = `Page ${this.currentPage + 1} of ${this.totalPages}`;
    fragment.appendChild(info);
    fragment.appendChild(createPaginationBtn('Next', this.currentPage >= this.totalPages - 1, (e) => {
      e.preventDefault();
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        this.loadPlans();
      }
    }));
    container.innerHTML = '';
    container.appendChild(fragment);
  },

  async openDetailModal(planId) {
    this.currentPlanId = planId;
    const modal = document.getElementById('plans-detail-modal');
    const detailContent = document.getElementById('plans-detail-content');
    if (!modal || !detailContent) return;
    detailContent.innerHTML = '<p class="loading-message">Loading plan details...</p>';
    modal.classList.add('active');
    try {
      const planData = (await apiClient.get(`/plans/${planId}`)).data || (await apiClient.get(`/plans/${planId}`));
      document.getElementById('plans-detail-title').textContent = `${planData.name} - ${planData.operatorName}`;
      detailContent.innerHTML = `
        <div class="plan-detail-info">
          <p><strong>Operator:</strong> ${this.escapeHtml(planData.operatorName || 'N/A')}</p>
          <p><strong>Service Type:</strong> ${planData.serviceType || 'N/A'}</p>
          <p><strong>Price:</strong> $${planData.basePrice} / ${planData.billingPeriod || 'N/A'}</p>
          <p><strong>Description:</strong> ${this.escapeHtml(planData.description || 'No description')}</p>
          <div class="plan-detail-features">
            <strong>Features:</strong>
            <ul id="plan-detail-features-list"></ul>
          </div>
        </div>
      `;
      const featuresList = document.getElementById('plan-detail-features-list');
      const features = this.parseFeatures(planData.features);
      if (features.length > 0) {
        const fragment = document.createDocumentFragment();
        features.forEach(feature => {
          const li = document.createElement('li');
          li.textContent = this.escapeHtml(feature);
          fragment.appendChild(li);
        });
        featuresList.appendChild(fragment);
      } else {
        featuresList.innerHTML = '<li>No features listed</li>';
      }
      this.updateDetailModalButtons(planData);
    } catch (error) {
      detailContent.innerHTML = `<p class="error-message">Error loading plan details: ${error.message}</p>`;
      UIController.getInstance().showMessage(`Error loading plan details: ${error.message}`, 'error');
    }
  },

  updateDetailModalButtons(plan) {
    const subscribeBtn = document.getElementById('plans-detail-subscribe-btn');
    if (!subscribeBtn) return;
    const subscriptionStatus = this.userSubscriptions[plan.id];
    if (this.userRole === 'CUSTOMER') {
      if (subscriptionStatus) {
        subscribeBtn.textContent = `Already Subscribed (${subscriptionStatus})`;
        subscribeBtn.className = 'btn btn-primary';
        subscribeBtn.disabled = true;
      } else {
        subscribeBtn.textContent = 'Subscribe Now';
        subscribeBtn.className = 'btn btn-primary';
        subscribeBtn.disabled = false;
      }
      subscribeBtn.style.display = 'block';
    } else if (this.userRole === 'ADMIN') {
      const isActive = plan.status === 'ACTIVE';
      subscribeBtn.textContent = isActive ? 'Disable Plan' : 'Activate Plan';
      subscribeBtn.className = isActive ? 'btn btn-danger' : 'btn btn-success';
      subscribeBtn.disabled = false;
      subscribeBtn.style.display = 'block';
    } else {
      subscribeBtn.style.display = 'none';
    }
  },

  async handleSubscribeClick() {
    if (this.userRole === 'CUSTOMER') {
      await this.subscribeToplan(this.currentPlanId);
    } else if (this.userRole === 'ADMIN') {
      const plan = this.plans.find(p => p.id === this.currentPlanId);
      if (plan) await this.togglePlanStatus(plan);
    }
  },

  async subscribeToplan(planId) {
    const subscribeBtn = document.getElementById('plans-detail-subscribe-btn');

    if (!subscribeBtn) return;

    const originalText = subscribeBtn.textContent;
    try {
      subscribeBtn.disabled = true;
      subscribeBtn.textContent = 'Processing...';
      const response = await apiClient.post('/subscriptions', { planId });
      this.userSubscriptions[planId] = response.status;
      UIController.getInstance().showMessage(`Successfully subscribed to plan! Status: ${response.status}`, 'success');
      setTimeout(() => {
        this.loadUserSubscriptions();
        this.loadPlans();
        this.closeDetailModal();
      }, 1500);
    } catch (error) {
      console.error('[PlansSection] Error subscribing to plan:', error);
      UIController.getInstance().showMessage(`Error subscribing to plan: ${error.message}`, 'error');
      subscribeBtn.disabled = false;
      subscribeBtn.textContent = originalText;
    }
  },

  async togglePlanStatus(plan) {
    UIController.getInstance().showMessage('Plan status management coming soon!', 'info');
  },

  closeDetailModal() {
    const modal = document.getElementById('plans-detail-modal');
    if (modal) modal.classList.remove('active');
    this.currentPlanId = null;
  },

  toggleFavorite(planId, btn) {
    btn.classList.toggle('favorited');
    const isFavorited = btn.classList.contains('favorited');
    UIController.getInstance().showMessage(
      isFavorited ? 'Plan added to favorites!' : 'Plan removed from favorites!',
      'success'
    );
  },

  escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  getUserRole() {
    try {
      const data = localStorage.getItem('user_data');
      const user = JSON.parse(data || '{}');
      return (Array.isArray(user.roles) && user.roles.length > 0) ? user.roles[0] : '';
    } catch (error) {
      console.error('[PlansSection] Error parsing user role:', error);
      return '';
    }
  },

  cleanup() {
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
      this.initTimeout = null;
    }
  }
};

window.PlansSection = PlansSection;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlansSection;
}