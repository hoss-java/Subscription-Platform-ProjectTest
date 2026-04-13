const MysubscriptionsSection = {
  // State management
  currentPage: 0, pageSize: 12, totalPages: 0, subscriptions: [],
  plansMap: {}, currentServiceType: '', currentSearchQuery: '', currentSubscriptionId: null,
  currentBillsStatusFilter: '', billingStatuses: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'],
  allBillsCurrentPage: 0, allBillsPageSize: 12, allBillsTotalPages: 0, allBills: [],
  allBillsCurrentStatusFilter: '', allBillsCurrentBillId: null,

  async init() {
    this.attachEventListeners();
    this.allBillsCurrentStatusFilter = 'PENDING'; // Initialize to PENDING
    await Promise.all([this.loadServiceTypes(), this.loadBillingStatuses(), this.loadPlans(), this.loadSubscriptions()]);
    this.populateDropdown('mysubscriptions-all-bills-status-filter', this.billingStatuses, 'All Statuses');
    document.getElementById('mysubscriptions-all-bills-status-filter').value = 'PENDING'; // Set dropdown to PENDING
    this.loadAllBills(); // Load bills AFTER everything else completes
  },

  async loadPlans() {
    try {
      const { data: plans } = this.parseResponse(await apiClient.get('/plans?page=0&size=1000'));
      this.plansMap = Object.fromEntries(plans.map(p => [p.id, p]));
    } catch (error) {
      console.error('[MySubscriptionsSection] Error loading plans:', error);
    }
  },

  async loadServiceTypes() {
    try {
      const { data: serviceTypes } = this.parseResponse(await apiClient.get('/plans/service-types'));
      this.populateDropdown('mysubscriptions-service-type-filter', serviceTypes.sort(), 'All Types');
    } catch (error) {
      console.error('Error loading service types:', error);
    }
  },

  attachEventListeners() {
    const listeners = [
      { id: 'mysubscriptions-service-type-filter', event: 'change', handler: (e) => { this.currentServiceType = e.target.value; this.currentPage = 0; this.loadSubscriptions(); }},
      { id: 'mysubscriptions-search-input', event: 'input', handler: (e) => { this.currentSearchQuery = e.target.value; this.currentPage = 0; this.loadSubscriptions(); }},
      { id: 'mysubscriptions-bills-status-filter', event: 'change', handler: (e) => { this.currentBillsStatusFilter = e.target.value; this.loadUnpaidBills(); }},
      { id: 'mysubscriptions-all-bills-status-filter', event: 'change', handler: (e) => { this.allBillsCurrentStatusFilter = e.target.value; this.allBillsCurrentPage = 0; this.loadAllBills(); }},
      { id: 'mysubscriptions-refresh-btn', event: 'click', handler: (e) => { e.preventDefault(); this.resetFilters('subscriptions'); }},
      { id: 'mysubscriptions-all-bills-refresh-btn', event: 'click', handler: (e) => { e.preventDefault(); this.resetFilters('bills'); }},
      { id: 'mysubscriptions-detail-close-btn', event: 'click', handler: (e) => { e.preventDefault(); this.closeModal('mysubscriptions-detail-modal', 'currentSubscriptionId'); }},
      { id: 'mysubscriptions-detail-close-footer-btn', event: 'click', handler: (e) => { e.preventDefault(); this.closeModal('mysubscriptions-detail-modal', 'currentSubscriptionId'); }},
      { id: 'mysubscriptions-all-bills-detail-close-btn', event: 'click', handler: (e) => { e.preventDefault(); this.closeModal('mysubscriptions-all-bills-detail-modal', 'allBillsCurrentBillId'); }},
      { id: 'mysubscriptions-all-bills-detail-close-footer-btn', event: 'click', handler: (e) => { e.preventDefault(); this.closeModal('mysubscriptions-all-bills-detail-modal', 'allBillsCurrentBillId'); }}
    ];
    listeners.forEach(({ id, event, handler }) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(event, handler);
    });
  },

  resetFilters(type) {
    if (type === 'subscriptions') {
      this.currentPage = 0;
      this.currentServiceType = '';
      this.currentSearchQuery = '';
      ['mysubscriptions-service-type-filter', 'mysubscriptions-search-input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      this.loadSubscriptions();
    } else {
      this.allBillsCurrentPage = 0;
      this.allBillsCurrentStatusFilter = '';
      const el = document.getElementById('mysubscriptions-all-bills-status-filter');
      if (el) el.value = '';
      this.loadAllBills();
    }
  },

  parseResponse(response, defaultValue = []) {
    if (response.content?.length) return { data: response.content, totalPages: response.totalPages || 0 };
    if (Array.isArray(response)) return { data: response, totalPages: 1 };
    if (response.data) return { data: response.data, totalPages: 1 };
    return { data: defaultValue, totalPages: 1 };
  },

  populateDropdown(elementId, dataArray, placeholderText) {
    const dropdown = document.getElementById(elementId);
    if (!dropdown) return;
    dropdown.innerHTML = `<option value="">${placeholderText}</option>`;
    dataArray.forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      dropdown.appendChild(option);
    });
  },

  syncFilterUI() {
    const serviceTypeFilter = document.getElementById('mysubscriptions-service-type-filter');
    const searchInput = document.getElementById('mysubscriptions-search-input');
    if (serviceTypeFilter) serviceTypeFilter.value = this.currentServiceType;
    if (searchInput) searchInput.value = this.currentSearchQuery;
  },

  async loadSubscriptions() {
    const container = document.getElementById('mysubscriptions-container');
    if (!container) return;
    container.innerHTML = '<p class="loading-message">Loading subscriptions...</p>';

    try {
      const params = new URLSearchParams({ page: this.currentPage, size: this.pageSize });
      let endpoint = '/subscriptions/my-subscriptions';
      
      if (this.currentSearchQuery) {
        endpoint += '/search?q=' + encodeURIComponent(this.currentSearchQuery);
      } else if (this.currentServiceType) {
        endpoint += `/filter?serviceType=${this.currentServiceType}`;
      }
      endpoint += `${endpoint.includes('?') ? '&' : '?'}${params}`;

      const { data: subscriptions, totalPages } = this.parseResponse(await apiClient.get(endpoint));
      this.subscriptions = subscriptions;
      this.totalPages = totalPages;

      if (subscriptions.length === 0) {
        container.innerHTML = '<p class="empty-message">No subscriptions found.</p>';
      } else {
        await this.enrichSubscriptionsWithPlanData();
        this.renderSubscriptions();
      }

      this.renderPagination('mysubscriptions-pagination', this.currentPage, this.totalPages, (page) => {
        this.currentPage = page;
        this.loadSubscriptions();
      });
      this.syncFilterUI();
    } catch (error) {
      container.innerHTML = `<p class="error-message">Error loading subscriptions: ${error.message}</p>`;
      UIController.getInstance().showMessage(`Error loading subscriptions: ${error.message}`, 'error');
    }
  },

  async enrichSubscriptionsWithPlanData() {
    const planPromises = this.subscriptions
      .filter(sub => sub.planId && !this.plansMap[sub.planId])
      .map(sub => this.fetchPlanData(sub.planId));
    await Promise.allSettled(planPromises);
  },

  async fetchPlanData(planId) {
    if (this.plansMap[planId]) return;
    try {
      const { data: plan } = this.parseResponse(await apiClient.get(`/plans/${planId}`));
      this.plansMap[planId] = plan;
    } catch (error) {
      console.error('[MySubscriptionsSection] Error fetching plan:', planId, error);
    }
  },

  renderSubscriptions() {
    const container = document.getElementById('mysubscriptions-container');
    container.innerHTML = '';

    this.subscriptions.forEach(subscription => {
      const plan = this.plansMap[subscription.planId];
      const operatorName = plan?.operatorName || subscription.operatorName || 'N/A';
      
      const html = `
        <div class="plan-card" data-subscription-id="${subscription.id}">
          <div class="plan-card-header">
            <span class="plan-operator-name">${this.escapeHtml(operatorName)}</span>
          </div>
          <h3 class="plan-name">${this.escapeHtml(subscription.planName || 'N/A')}</h3>
          <p class="plan-description">${this.escapeHtml(plan?.description || subscription.description || 'No description')}</p>
          <div class="plan-badges-container">
            <span class="plan-service-type-badge">${plan?.serviceType || subscription.serviceType || 'N/A'}</span>
            <span class="plan-status-badge plan-status-${subscription.status.toLowerCase()}">${subscription.status}</span>
          </div>
          <div class="plan-card-actions">
            <button class="btn btn-sm btn-secondary">View Details</button>
          </div>
        </div>
      `;
      
      const card = document.createElement('div');
      card.innerHTML = html;
      card.querySelector('button').addEventListener('click', (e) => {
        e.preventDefault();
        this.openDetailModal(subscription.id);
      });
      container.appendChild(card.firstElementChild);
    });
  },

  renderPagination(containerId, currentPage, totalPages, callback) {
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) return;
    
    container.innerHTML = '';
    const createBtn = (text, disabled, onClick) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-secondary';
      btn.textContent = text;
      btn.disabled = disabled;
      btn.addEventListener('click', onClick);
      return btn;
    };

    container.appendChild(createBtn('Previous', currentPage === 0, () => currentPage > 0 && callback(currentPage - 1)));
    
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
    container.appendChild(pageInfo);

    container.appendChild(createBtn('Next', currentPage >= totalPages - 1, () => currentPage < totalPages - 1 && callback(currentPage + 1)));
  },

  async openDetailModal(subscriptionId) {
    this.currentSubscriptionId = subscriptionId;
    const modal = document.getElementById('mysubscriptions-detail-modal');
    const detailContent = document.getElementById('mysubscriptions-detail-content');

    if (!modal || !detailContent) return;

    detailContent.innerHTML = '<p class="loading-message">Loading subscription details...</p>';
    modal.classList.add('active');
    this.switchModalView('subscription-detail');

    try {
      let subscription = await apiClient.get(`/subscriptions/${subscriptionId}`);
      subscription = subscription.data || subscription;

      let plan = this.plansMap[subscription.planId];
      if (!plan && subscription.planId) {
        await this.fetchPlanData(subscription.planId);
        plan = this.plansMap[subscription.planId];
      }

      const operatorName = subscription.operatorName || plan?.operatorName || 'N/A';
      const serviceType = subscription.serviceType || plan?.serviceType || 'N/A';

      document.getElementById('mysubscriptions-detail-title').textContent = `${subscription.planName} - ${operatorName}`;

      let featuresList = [];
      if (plan?.features) {
        try {
          featuresList = Array.isArray(JSON.parse(plan.features)) ? JSON.parse(plan.features) : plan.features.split(',').map(f => f.trim());
        } catch {
          featuresList = plan.features.split(',').map(f => f.trim());
        }
      }

      const priceInfo = plan?.basePrice ? `$${plan.basePrice} / ${plan.billingPeriod || 'N/A'}` : 'N/A';
      detailContent.innerHTML = `
        <div class="plan-detail-info">
          <p><strong>Operator:</strong> ${this.escapeHtml(operatorName)}</p>
          <p><strong>Plan:</strong> ${this.escapeHtml(subscription.planName || 'N/A')}</p>
          <p><strong>Service Type:</strong> ${this.escapeHtml(serviceType)}</p>
          <p><strong>Status:</strong> ${subscription.status || 'N/A'}</p>
          <p><strong>Price:</strong> ${priceInfo}</p>
          <p><strong>Description:</strong> ${this.escapeHtml(plan?.description || subscription.description || 'No description')}</p>
          <p><strong>Start Date:</strong> ${subscription.startDate || 'N/A'}</p>
          <p><strong>Next Billing Date:</strong> ${subscription.nextBillingDate || 'N/A'}</p>
          <div class="plan-detail-features">
            <strong>Features:</strong>
            <ul id="subscription-detail-features-list">${featuresList.length ? featuresList.map(f => `<li>${this.escapeHtml(f)}</li>`).join('') : '<li>No features listed</li>'}</ul>
          </div>
        </div>
      `;

      this.loadUnpaidBills();
    } catch (error) {
      console.error('[MySubscriptionsSection] Error loading subscription details:', error);
      detailContent.innerHTML = `<p class="error-message">Error loading subscription details: ${error.message}</p>`;
      UIController.getInstance().showMessage(`Error loading subscription details: ${error.message}`, 'error');
    }
  },

  switchModalView(viewName) {
    const subscriptionDetailView = document.getElementById('mysubscriptions-detail-view');
    const billDetailView = document.getElementById('mysubscriptions-bill-detail-view');
    subscriptionDetailView?.classList.toggle('active', viewName === 'subscription-detail');
    billDetailView?.classList.toggle('active', viewName === 'bill-detail');
  },

  buildInvoiceHTML(bill, includeFullDetails = false) {
    const operatorInfo = includeFullDetails ? `
      <div class="invoice-addresses">
        <div class="invoice-from"><h5>FROM (Service Provider)</h5><div class="address-block"><p class="name">${bill.operator?.firstName} ${bill.operator?.lastName}</p><p class="email">${bill.operator?.email}</p></div></div>
        <div class="invoice-to"><h5>BILL TO (Customer)</h5><div class="address-block"><p class="name">${bill.customer?.firstName} ${bill.customer?.lastName}</p><p class="email">${bill.customer?.email}</p></div></div>
      </div>
    ` : '';

    const planInfo = includeFullDetails ? `
      <div class="invoice-meta">
        <div class="meta-column"><h5>Plan Information</h5><p><strong>Plan:</strong> ${bill.plan?.name || 'N/A'}</p><p><strong>Service Type:</strong> ${bill.plan?.serviceType || 'N/A'}</p></div>
        <div class="meta-column"><h5>Subscription Information</h5><p><strong>Subscription ID:</strong> ${bill.subscription?.id || 'N/A'}</p><p><strong>Status:</strong> ${bill.subscription?.status || 'N/A'}</p><p><strong>Auto Renewal:</strong> ${bill.subscription?.autoRenewal ? 'Yes' : 'No'}</p></div>
      </div>
    ` : '';

    const amount = parseFloat(bill.amount).toFixed(2);
    const backButton = !includeFullDetails ? '<button id="back-to-bills-btn" class="btn btn-secondary">Back to Bills</button>' : '';
    const claimButtonId = includeFullDetails ? 'mysubscriptions-claim-paid-btn' : 'claim-paid-btn';

    return `
      <div class="invoice-document">
        <div class="invoice-top">
          <div class="invoice-title"><h2>INVOICE</h2><p class="invoice-number">Invoice #${bill.id}</p></div>
          <div class="invoice-status"><span class="bill-status-badge bill-status-${bill.status.toLowerCase()}">${bill.status}</span></div>
        </div>
        ${operatorInfo}
        <div class="invoice-dates">
          <div class="date-item"><span class="date-label">Invoice Date:</span><span class="date-value">${this.formatDate(bill.billingDate)}</span></div>
          <div class="date-item"><span class="date-label">Due Date:</span><span class="date-value">${this.formatDate(bill.dueDate)}</span></div>
          <div class="date-item"><span class="date-label">Paid Date:</span><span class="date-value">${bill.paidDate ? this.formatDate(bill.paidDate) : 'Not paid yet'}</span></div>
        </div>
        <div class="invoice-items">
          <table class="items-table">
            <thead><tr><th>Service</th><th>Description</th><th>Billing Period</th><th class="text-right">Amount</th></tr></thead>
            <tbody><tr><td>${bill.plan?.name || 'N/A'}</td><td>${bill.plan?.description || 'N/A'}</td><td>${bill.plan?.billingPeriod || 'N/A'}</td><td class="text-right amount">$${amount}</td></tr></tbody>
          </table>
        </div>
        <div class="invoice-totals">
          <div class="totals-spacer"></div>
          <div class="totals-summary">
            <div class="total-row"><span class="total-label">Subtotal:</span><span class="total-value">$${amount}</span></div>
            <div class="total-row total-amount"><span class="total-label">TOTAL DUE:</span><span class="total-value">$${amount}</span></div>
          </div>
        </div>
        ${planInfo}
        <div class="bill-customer-actions">
          ${bill.status === 'PENDING' ? `<button id="${claimButtonId}" data-action="claim-paid" class="btn btn-success">Mark as Paid</button><p class="help-text">Click this button if you have already paid this bill</p>` : `<p class="info-message">This bill has been ${bill.status.toLowerCase()}</p>`}
        </div>
        ${backButton}
      </div>
    `;
  },

  async renderBillDetail(billId, config = {}) {
    const { modalId = 'mysubscriptions-detail-modal', contentId = 'mysubscriptions-bill-detail-content', titleId = null, includeFullDetails = false, switchView = false, viewName = null, storageProperty = 'currentSubscriptionId' } = config;

    if (storageProperty === 'allBillsCurrentBillId') {
      this.allBillsCurrentBillId = billId;
    } else {
      this.currentSubscriptionId = billId;
    }

    const modal = document.getElementById(modalId);
    const detailContent = document.getElementById(contentId);

    if (!modal || !detailContent) return;

    detailContent.innerHTML = '<p class="loading-message">Loading bill details...</p>';
    modal.classList.add('active');
    if (modal.style.display !== undefined) modal.style.display = 'flex';

    try {
      const bill = (await apiClient.get(`/billings/${billId}`)).data || await apiClient.get(`/billings/${billId}`);

      if (titleId) document.getElementById(titleId).textContent = `Invoice #${bill.id}`;

      const invoiceHTML = this.buildInvoiceHTML(bill, includeFullDetails);
      detailContent.innerHTML = invoiceHTML;

      if (switchView && viewName) this.switchModalView(viewName);

      if (bill.status === 'PENDING') {
        const claimBtn = detailContent.querySelector('[data-action="claim-paid"]');
        if (claimBtn) claimBtn.addEventListener('click', () => this.claimBillAsPaid(billId));
      }

      if (!includeFullDetails) {
        const backBtn = detailContent.querySelector('#back-to-bills-btn');
        if (backBtn) backBtn.addEventListener('click', () => this.switchModalView('subscription-detail'));
      }
    } catch (error) {
      console.error('[MySubscriptionsSection] Error loading bill details:', error);
      detailContent.innerHTML = `<p class="error-message">Error loading bill details: ${error.message}</p>`;
      UIController.getInstance().showMessage(`Error loading bill details: ${error.message}`, 'error');
    }
  },

  async claimBillAsPaid(billId) {
    try {
      await apiClient.put(`/billings/${billId}`, { status: 'PAYMENT_CLAIMED' });
      UIController.getInstance().showMessage('Bill marked as paid. Awaiting operator approval.', 'success');

      setTimeout(() => {
        if (this.allBillsCurrentBillId === billId) {
          this.closeModal('mysubscriptions-all-bills-detail-modal', 'allBillsCurrentBillId');
          this.loadAllBills();
        } else {
          this.switchModalView('subscription-detail');
          this.loadUnpaidBills();
        }
      }, 1500);
    } catch (error) {
      console.error('[MySubscriptionsSection] Error claiming payment:', error);
      UIController.getInstance().showMessage(`Error: ${error.message}`, 'error');
    }
  },

  async loadUnpaidBills() {
    const billsList = document.getElementById('mysubscriptions-bills-list');
    try {
      const { data: bills } = this.parseResponse(await apiClient.get(`/billings/my-billings?subscriptionId=${this.currentSubscriptionId}`));
      const unpaidBills = bills.filter(bill => bill.status === 'PENDING');
      billsList.innerHTML = unpaidBills.length === 0 ? '<p class="empty-message">No unpaid bills found.</p>' : '';
      if (unpaidBills.length > 0) this.renderBillsTable(unpaidBills, billsList, 'unpaid');
    } catch (error) {
      console.error('[MySubscriptionsSection] Error loading bills:', error);
      billsList.innerHTML = `<p class="error-message">Error loading bills: ${error.message}</p>`;
    }
  },

  renderBillsTable(bills, container, purpose) {
    container.innerHTML = '';
    const headers = purpose === 'unpaid' ? ['Bill ID', 'Amount', 'Billing Date', 'Due Date', 'Status'] : ['ID', 'Plan', 'Amount', 'Billing Date', 'Due Date', 'Status', 'Actions'];
    
    const table = document.createElement('table');
    table.className = 'bills-table';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    bills.forEach(bill => {
      const row = document.createElement('tr');
      if (purpose === 'unpaid') {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => this.renderBillDetail(bill.id, {
          modalId: 'mysubscriptions-detail-modal',
          contentId: 'mysubscriptions-bill-detail-content',
          includeFullDetails: false,
          switchView: true,
          viewName: 'bill-detail'
        }));
      }

      const cells = [bill.id];
      if (purpose === 'all') cells.push(bill.plan?.name || 'N/A');
      cells.push(`$${parseFloat(bill.amount).toFixed(2)}`);
      cells.push(this.formatDate(bill.billingDate));
      cells.push(this.formatDate(bill.dueDate));
      cells.push(`<span class="bill-status-badge bill-status-${bill.status.toLowerCase()}">${bill.status}</span>`);

      cells.forEach((cellContent, index) => {
        const td = document.createElement('td');
        td.innerHTML = cellContent;
        row.appendChild(td);
      });

      if (purpose === 'all') {
        const actionsCell = document.createElement('td');
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-sm btn-secondary';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.renderBillDetail(bill.id, {
            modalId: 'mysubscriptions-all-bills-detail-modal',
            contentId: 'mysubscriptions-all-bills-detail-content',
            titleId: 'mysubscriptions-all-bills-detail-title',
            includeFullDetails: true,
            storageProperty: 'allBillsCurrentBillId'
          });
        });
        actionsCell.appendChild(viewBtn);
        row.appendChild(actionsCell);
      }

      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  },

  formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  async loadBillingStatuses() {
    try {
      const { data: billingStatuses } = this.parseResponse(await apiClient.get('/billings/billing-statuses'));
      this.billingStatuses = billingStatuses;
    } catch (error) {
      console.error('Error loading billing statuses:', error);
    }
  },

  async loadAllBills() {
    const container = document.getElementById('mysubscriptions-all-bills-container');
    if (!container) return;
    container.innerHTML = '<p class="loading-message">Loading bills...</p>';

    try {
      let endpoint = `/billings/customer?page=${this.allBillsCurrentPage}&size=${this.allBillsPageSize}`;
      if (this.allBillsCurrentStatusFilter) endpoint += `&status=${this.allBillsCurrentStatusFilter}`;

      const { data: bills, totalPages } = this.parseResponse(await apiClient.get(endpoint));
      this.allBills = bills;
      this.allBillsTotalPages = totalPages;

      if (bills.length === 0) {
        container.innerHTML = '<p class="empty-message">No bills found.</p>';
      } else {
        this.renderBillsTable(bills, container, 'all');
      }

      this.renderPagination('mysubscriptions-all-bills-pagination', this.allBillsCurrentPage, this.allBillsTotalPages, (page) => {
        this.allBillsCurrentPage = page;
        this.loadAllBills();
      });
    } catch (error) {
      container.innerHTML = `<p class="error-message">Error loading bills: ${error.message}</p>`;
      UIController.getInstance().showMessage(`Error loading bills: ${error.message}`, 'error');
    }
  },

  closeModal(modalId, dataPropertyToNull = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    if (modal.style.display === 'flex' || modal.style.display === 'block') modal.style.display = 'none';
    if (dataPropertyToNull) this[dataPropertyToNull] = null;
  }
};

window.MysubscriptionsSection = MysubscriptionsSection;
