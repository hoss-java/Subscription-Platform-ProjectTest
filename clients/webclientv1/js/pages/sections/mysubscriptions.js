const MysubscriptionsSection = {
  currentPage: 0,
  pageSize: 12,
  totalPages: 0,
  subscriptions: [],
  plansMap: {}, // Cache plan details by planId
  currentServiceType: '',
  currentSearchQuery: '',
  currentSubscriptionId: null,
  // Add these properties to the object at the top
  currentBillsStatusFilter: '',
  billingStatuses: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'],


  async init() {
    setTimeout(async () => {
      this.attachEventListeners();
      await this.loadServiceTypes();
      await this.loadBillingStatuses();
      await this.loadPlans();
      await this.loadSubscriptions();
      await this.initAllBillsSection();
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
    const billsStatusFilter = document.getElementById('mysubscriptions-bills-status-filter');

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


    if (billsStatusFilter) {
      billsStatusFilter.addEventListener('change', (e) => {
        this.currentBillsStatusFilter = e.target.value;
        this.loadUnpaidBills(document.getElementById('mysubscriptions-bills-section'));
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
  
  // Make sure we're on the subscription detail view
  this.switchModalView('subscription-detail');

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

    const operatorName = subscription.operatorName || plan?.operatorName || 'N/A';
    const serviceType = subscription.serviceType || plan?.serviceType || 'N/A';

    document.getElementById('mysubscriptions-detail-title').textContent = `${subscription.planName} - ${operatorName}`;

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

// New method to switch between views
switchModalView(viewName) {
  const subscriptionDetailView = document.getElementById('mysubscriptions-detail-view');
  const billDetailView = document.getElementById('mysubscriptions-bill-detail-view');

  if (viewName === 'subscription-detail') {
    subscriptionDetailView.classList.add('active');
    billDetailView.classList.remove('active');
  } else if (viewName === 'bill-detail') {
    subscriptionDetailView.classList.remove('active');
    billDetailView.classList.add('active');
  }
},

showBillDetail(bill) {
  const billDetailContent = document.getElementById('mysubscriptions-bill-detail-content');
  
  billDetailContent.innerHTML = `
    <div class="invoice-document">
      <div class="invoice-top">
        <div class="invoice-title">
          <h2>INVOICE</h2>
          <p class="invoice-number">Invoice #${bill.id}</p>
        </div>
        <div class="invoice-status">
          <span class="bill-status-badge bill-status-${bill.status.toLowerCase()}">${bill.status}</span>
        </div>
      </div>

      <div class="invoice-dates">
        <div class="date-item">
          <span class="date-label">Invoice Date:</span>
          <span class="date-value">${this.formatDate(bill.billingDate)}</span>
        </div>
        <div class="date-item">
          <span class="date-label">Due Date:</span>
          <span class="date-value">${this.formatDate(bill.dueDate)}</span>
        </div>
        <div class="date-item">
          <span class="date-label">Paid Date:</span>
          <span class="date-value">${bill.paidDate ? this.formatDate(bill.paidDate) : 'Not paid yet'}</span>
        </div>
      </div>

      <div class="invoice-totals">
        <div class="totals-summary">
          <div class="total-row total-amount">
            <span class="total-label">TOTAL DUE:</span>
            <span class="total-value">$${parseFloat(bill.amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="bill-customer-actions">
        ${bill.status === 'PENDING' ? `
          <button id="claim-paid-btn" class="btn btn-success">Mark as Paid</button>
          <p class="help-text">Click this button if you have already paid this bill</p>
        ` : `
          <p class="info-message">This bill has been ${bill.status.toLowerCase()}</p>
        `}
      </div>

      <button id="back-to-bills-btn" class="btn btn-secondary">Back to Bills</button>
    </div>
  `;

  // Switch to bill detail view
  this.switchModalView('bill-detail');

  if (bill.status === 'PENDING') {
    const claimBtn = document.getElementById('claim-paid-btn');
    claimBtn.addEventListener('click', () => this.claimBillAsPaid(bill.id));
  }

  const backBtn = document.getElementById('back-to-bills-btn');
  backBtn.addEventListener('click', () => this.backToBills());
},

// New method to return from bill detail to subscription detail
backToBills() {
  this.switchModalView('subscription-detail');
},

async claimBillAsPaid(billId) {
  try {
    await apiClient.put(`/billings/${billId}`, { status: 'PAYMENT_CLAIMED' });
    this.backToBills();
    
    // Reload the bills list
    const billsSection = document.getElementById('mysubscriptions-bills-section');
    this.loadUnpaidBills(billsSection);
    
    const uiController = UIController.getInstance();
    uiController.showMessage('Bill marked as paid. Awaiting operator approval.', 'success');
  } catch (error) {
    console.error('Error claiming payment:', error);
    const uiController = UIController.getInstance();
    uiController.showMessage(`Error: ${error.message}`, 'error');
  }
},


  // Update loadUnpaidBills method
  async loadUnpaidBills() {
    const billsList = document.getElementById('mysubscriptions-bills-list');
    
    try {
      const endpoint = `/billings/my-billings?subscriptionId=${this.currentSubscriptionId}`;
      const response = await apiClient.get(endpoint);
      
      let bills = [];
      if (response.content && Array.isArray(response.content)) {
        bills = response.content;
      } else if (Array.isArray(response)) {
        bills = response;
      }

      // Filter only PENDING bills
      const unpaidBills = bills.filter(bill => bill.status === 'PENDING');

      if (unpaidBills.length === 0) {
        billsList.innerHTML = '<p class="empty-message">No unpaid bills found.</p>';
      } else {
        this.renderBillsList(unpaidBills, billsList);
      }

    } catch (error) {
      console.error('[MySubscriptionsSection] Error loading bills:', error);
      billsList.innerHTML = `<p class="error-message">Error loading bills: ${error.message}</p>`;
    }
  },

renderBillsList(bills, container) {
  container.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'bills-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Bill ID', 'Amount', 'Billing Date', 'Due Date', 'Status'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  bills.forEach(bill => {
    const row = document.createElement('tr');
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => this.showBillDetail(bill));
    
    const idCell = document.createElement('td');
    idCell.textContent = bill.id;
    row.appendChild(idCell);

    const amountCell = document.createElement('td');
    amountCell.textContent = `$${bill.amount}`;
    row.appendChild(amountCell);

    const billingDateCell = document.createElement('td');
    billingDateCell.textContent = this.formatDate(bill.billingDate);
    row.appendChild(billingDateCell);

    const dueDateCell = document.createElement('td');
    dueDateCell.textContent = this.formatDate(bill.dueDate);
    row.appendChild(dueDateCell);

    const statusCell = document.createElement('td');
    statusCell.innerHTML = `<span class="bill-status-badge bill-status-${bill.status.toLowerCase()}">${bill.status}</span>`;
    row.appendChild(statusCell);

    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  container.appendChild(table);
},

  // Add date formatter
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
  },

//------
async loadBillingStatuses() {
  try {
    const response = await apiClient.get('/billings/billing-statuses');
    
    let billingStatuses = [];
    if (Array.isArray(response)) {
      billingStatuses = response;
    }

    this.billingStatuses = billingStatuses;
  } catch (error) {
    console.error('Error loading billing statuses:', error);
  }
},

// Add these properties to MySubscriptionsSection at the top with your other properties
allBillsCurrentPage: 0,
allBillsPageSize: 12,
allBillsTotalPages: 0,
allBills: [],
allBillsCurrentStatusFilter: '',
allBillsCurrentBillId: null,
billingStatuses: [],

// Add this to your existing init() method
initAllBillsSection() {
  setTimeout(async () => {
    this.attachAllBillsEventListeners();
    this.populateAllBillsStatusDropdown();
    this.loadAllBills();
  }, 100);
},

attachAllBillsEventListeners() {
  const statusFilter = document.getElementById('mysubscriptions-all-bills-status-filter');
  const refreshBtn = document.getElementById('mysubscriptions-all-bills-refresh-btn');
  const detailCloseBtn = document.getElementById('mysubscriptions-all-bills-detail-close-btn');
  const detailCloseBtnFooter = document.getElementById('mysubscriptions-all-bills-detail-close-footer-btn');

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      this.allBillsCurrentStatusFilter = e.target.value;
      this.allBillsCurrentPage = 0;
      this.loadAllBills();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.allBillsCurrentPage = 0;
      this.allBillsCurrentStatusFilter = '';
      if (statusFilter) statusFilter.value = '';
      this.loadAllBills();
    });
  }

  if (detailCloseBtn) {
    detailCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeAllBillsDetailModal();
    });
  }

  if (detailCloseBtnFooter) {
    detailCloseBtnFooter.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeAllBillsDetailModal();
    });
  }
},

populateAllBillsStatusDropdown() {
  const dropdown = document.getElementById('mysubscriptions-all-bills-status-filter');
  if (!dropdown) return;

  dropdown.innerHTML = '<option value="">All Statuses</option>';
  this.billingStatuses.forEach(status => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    dropdown.appendChild(option);
  });
},

async loadAllBills() {
  const container = document.getElementById('mysubscriptions-all-bills-container');
  if (!container) return;

  container.innerHTML = '<p class="loading-message">Loading bills...</p>';

  try {
    let endpoint = `/billings/customer?page=${this.allBillsCurrentPage}&size=${this.allBillsPageSize}`;

    if (this.allBillsCurrentStatusFilter) {
      endpoint += `&status=${this.allBillsCurrentStatusFilter}`;
    }

    const response = await apiClient.get(endpoint);

    let bills = [];
    let totalPages = 0;

    if (response.content && Array.isArray(response.content)) {
      bills = response.content;
      totalPages = response.totalPages || 0;
    } else if (Array.isArray(response)) {
      bills = response;
      totalPages = 1;
    }

    this.allBills = bills;
    this.allBillsTotalPages = totalPages;

    if (this.allBills.length === 0) {
      container.innerHTML = '<p class="empty-message">No bills found.</p>';
    } else {
      this.renderAllBills();
    }

    this.renderAllBillsPagination();

  } catch (error) {
    container.innerHTML = `<p class="error-message">Error loading bills: ${error.message}</p>`;
    
    const uiController = UIController.getInstance();
    uiController.showMessage(`Error loading bills: ${error.message}`, 'error');
  }
},

renderAllBills() {
  const container = document.getElementById('mysubscriptions-all-bills-container');
  container.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'bills-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['ID', 'Plan', 'Amount', 'Billing Date', 'Due Date', 'Status', 'Actions'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  this.allBills.forEach(bill => {
    const row = document.createElement('tr');

    const idCell = document.createElement('td');
    idCell.textContent = bill.id;
    row.appendChild(idCell);

    const planCell = document.createElement('td');
    planCell.textContent = bill.plan?.name || 'N/A';
    row.appendChild(planCell);

    const amountCell = document.createElement('td');
    amountCell.textContent = `$${parseFloat(bill.amount).toFixed(2)}`;
    row.appendChild(amountCell);

    const billingDateCell = document.createElement('td');
    billingDateCell.textContent = this.formatDate(bill.billingDate);
    row.appendChild(billingDateCell);

    const dueDateCell = document.createElement('td');
    dueDateCell.textContent = this.formatDate(bill.dueDate);
    row.appendChild(dueDateCell);

    const statusCell = document.createElement('td');
    statusCell.innerHTML = `<span class="bill-status-badge bill-status-${bill.status.toLowerCase()}">${bill.status}</span>`;
    row.appendChild(statusCell);

    const actionsCell = document.createElement('td');
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-sm btn-secondary';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openAllBillsDetailModal(bill.id);
    });
    actionsCell.appendChild(viewBtn);
    row.appendChild(actionsCell);

    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  container.appendChild(table);
},

renderAllBillsPagination() {
  const paginationContainer = document.getElementById('mysubscriptions-all-bills-pagination');
  if (!paginationContainer) return;

  paginationContainer.innerHTML = '';

  if (this.allBillsTotalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-sm btn-secondary';
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = this.allBillsCurrentPage === 0;
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (this.allBillsCurrentPage > 0) {
      this.allBillsCurrentPage--;
      this.loadAllBills();
    }
  });
  paginationContainer.appendChild(prevBtn);

  const pageInfo = document.createElement('span');
  pageInfo.className = 'pagination-info';
  pageInfo.textContent = `Page ${this.allBillsCurrentPage + 1} of ${this.allBillsTotalPages}`;
  paginationContainer.appendChild(pageInfo);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-sm btn-secondary';
  nextBtn.textContent = 'Next';
  nextBtn.disabled = this.allBillsCurrentPage >= this.allBillsTotalPages - 1;
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (this.allBillsCurrentPage < this.allBillsTotalPages - 1) {
      this.allBillsCurrentPage++;
      this.loadAllBills();
    }
  });
  paginationContainer.appendChild(nextBtn);
},

async openAllBillsDetailModal(billId) {
  this.allBillsCurrentBillId = billId;
  const modal = document.getElementById('mysubscriptions-all-bills-detail-modal');
  const detailContent = document.getElementById('mysubscriptions-all-bills-detail-content');

  if (!modal || !detailContent) return;

  detailContent.innerHTML = '<p class="loading-message">Loading bill details...</p>';
  modal.style.display = 'flex';
  modal.classList.add('active');

  try {
    const response = await apiClient.get(`/billings/${billId}`);
    const bill = response.data || response;

    document.getElementById('mysubscriptions-all-bills-detail-title').textContent = `Invoice #${bill.id}`;

    detailContent.innerHTML = `
      <div class="invoice-document">
        <!-- Invoice Top Header -->
        <div class="invoice-top">
          <div class="invoice-title">
            <h2>INVOICE</h2>
            <p class="invoice-number">Invoice #${bill.id}</p>
          </div>
          <div class="invoice-status">
            <span class="bill-status-badge bill-status-${bill.status.toLowerCase()}">${bill.status}</span>
          </div>
        </div>

        <!-- Two Column Layout: From/To -->
        <div class="invoice-addresses">
          <div class="invoice-from">
            <h5>FROM (Service Provider)</h5>
            <div class="address-block">
              <p class="name">${bill.operator?.firstName} ${bill.operator?.lastName}</p>
              <p class="email">${bill.operator?.email}</p>
            </div>
          </div>

          <div class="invoice-to">
            <h5>BILL TO (Customer)</h5>
            <div class="address-block">
              <p class="name">${bill.customer?.firstName} ${bill.customer?.lastName}</p>
              <p class="email">${bill.customer?.email}</p>
            </div>
          </div>
        </div>

        <!-- Dates and Details -->
        <div class="invoice-dates">
          <div class="date-item">
            <span class="date-label">Invoice Date:</span>
            <span class="date-value">${this.formatDate(bill.billingDate)}</span>
          </div>
          <div class="date-item">
            <span class="date-label">Due Date:</span>
            <span class="date-value">${this.formatDate(bill.dueDate)}</span>
          </div>
          <div class="date-item">
            <span class="date-label">Paid Date:</span>
            <span class="date-value">${bill.paidDate ? this.formatDate(bill.paidDate) : 'Not paid yet'}</span>
          </div>
        </div>

        <!-- Service Details Table -->
        <div class="invoice-items">
          <table class="items-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Description</th>
                <th>Billing Period</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${bill.plan?.name || 'N/A'}</td>
                <td>${bill.plan?.description || 'N/A'}</td>
                <td>${bill.plan?.billingPeriod || 'N/A'}</td>
                <td class="text-right amount">$${parseFloat(bill.amount).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals Section -->
        <div class="invoice-totals">
          <div class="totals-spacer"></div>
          <div class="totals-summary">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">$${parseFloat(bill.amount).toFixed(2)}</span>
            </div>
            <div class="total-row total-amount">
              <span class="total-label">TOTAL DUE:</span>
              <span class="total-value">$${parseFloat(bill.amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="invoice-meta">
          <div class="meta-column">
            <h5>Plan Information</h5>
            <p><strong>Plan:</strong> ${bill.plan?.name || 'N/A'}</p>
            <p><strong>Service Type:</strong> ${bill.plan?.serviceType || 'N/A'}</p>
          </div>
          <div class="meta-column">
            <h5>Subscription Information</h5>
            <p><strong>Subscription ID:</strong> ${bill.subscription?.id || 'N/A'}</p>
            <p><strong>Status:</strong> ${bill.subscription?.status || 'N/A'}</p>
            <p><strong>Auto Renewal:</strong> ${bill.subscription?.autoRenewal ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <!-- Customer Actions -->
        <div class="bill-customer-actions">
          ${bill.status === 'PENDING' ? `
            <button id="mysubscriptions-claim-paid-btn" class="btn btn-success">Mark as Paid</button>
            <p class="help-text">Click this button if you have already paid this bill</p>
          ` : `
            <p class="info-message">This bill has been ${bill.status.toLowerCase()}</p>
          `}
        </div>
      </div>
    `;

    if (bill.status === 'PENDING') {
      const claimBtn = document.getElementById('mysubscriptions-claim-paid-btn');
      claimBtn.addEventListener('click', () => this.claimAllBillAsPaid(bill.id));
    }

  } catch (error) {
    detailContent.innerHTML = `<p class="error-message">Error loading bill details: ${error.message}</p>`;
    
    const uiController = UIController.getInstance();
    uiController.showMessage(`Error loading bill details: ${error.message}`, 'error');
  }
},

async claimAllBillAsPaid(billId) {
  try {
    await apiClient.put(`/billings/${billId}`, { status: 'PAYMENT_CLAIMED' });
    
    const uiController = UIController.getInstance();
    uiController.showMessage('Bill marked as paid. Awaiting operator approval.', 'success');

    setTimeout(() => {
      this.closeAllBillsDetailModal();
      this.loadAllBills();
    }, 1500);

  } catch (error) {
    console.error('Error claiming payment:', error);
    const uiController = UIController.getInstance();
    uiController.showMessage(`Error: ${error.message}`, 'error');
  }
},

closeAllBillsDetailModal() {
  const modal = document.getElementById('mysubscriptions-all-bills-detail-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
  this.allBillsCurrentBillId = null;
}
};
window.MysubscriptionsSection = MysubscriptionsSection;


