const SubscriptionsmanSection = {
  currentPage: 0,
  pageSize: 12,
  totalPages: 0,
  subscriptions: [],
  currentStatusFilter: '',
  currentSearchQuery: '',
  currentSubscriptionId: null,

  init() {
    setTimeout(() => {
      this.attachEventListeners();
      this.loadStatuses();
      this.loadSubscriptions();
    }, 100);
  },

  async loadStatuses() {
    try {
      const statusDropdown = document.getElementById('subscriptions-manager-status-filter');
      if (!statusDropdown) return;

      const response = await apiClient.get('/subscriptions/subscription-statuses');
      
      let statuses = [];
      if (Array.isArray(response)) {
        statuses = response;
      }

      statusDropdown.innerHTML = '<option value="">All Statuses</option>';
      statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusDropdown.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  },

  attachEventListeners() {
    const statusFilter = document.getElementById('subscriptions-manager-status-filter');
    const searchInput = document.getElementById('subscriptions-manager-search-input');
    const refreshBtn = document.getElementById('subscriptions-manager-refresh-btn');
    const detailCloseBtn = document.getElementById('subscriptions-manager-detail-close-btn');
    const detailCloseBtnFooter = document.getElementById('subscriptions-manager-detail-close-footer-btn');

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.currentStatusFilter = e.target.value;
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
        this.currentStatusFilter = '';
        this.currentSearchQuery = '';
        if (statusFilter) statusFilter.value = '';
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

  async loadSubscriptions() {
    const container = document.getElementById('subscriptions-manager-container');
    if (!container) return;

    container.innerHTML = '<p class="loading-message">Loading subscriptions...</p>';

    try {
      // Build the API endpoint
      let endpoint = `/subscriptions/operator/subscriptions?page=${this.currentPage}&size=${this.pageSize}`;

      // Add status filter if selected
      if (this.currentStatusFilter) {
        endpoint += `&status=${this.currentStatusFilter}`;
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

      // Apply client-side search filter
      if (this.currentSearchQuery) {
        const query = this.currentSearchQuery.toLowerCase();
        subscriptions = subscriptions.filter(sub => {
          const customerMatch = (sub.customerName || '').toLowerCase().includes(query);
          const planMatch = (sub.planName || '').toLowerCase().includes(query);
          return customerMatch || planMatch;
        });
      }

      this.subscriptions = subscriptions;
      this.totalPages = totalPages;

      if (this.subscriptions.length === 0) {
        container.innerHTML = '<p class="empty-message">No subscriptions found.</p>';
      } else {
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

  renderSubscriptions() {
    const container = document.getElementById('subscriptions-manager-container');
    container.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'subscriptions-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Customer', 'Plan', 'Status', 'Created', 'End Date', 'Next Renewal', 'Actions'];
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    this.subscriptions.forEach(subscription => {
      const row = document.createElement('tr');
      
      const customerCell = document.createElement('td');
      customerCell.textContent = this.escapeHtml(subscription.customerName || 'N/A');
      row.appendChild(customerCell);

      const planCell = document.createElement('td');
      planCell.textContent = this.escapeHtml(subscription.planName || 'N/A');
      row.appendChild(planCell);

      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `status-badge status-${subscription.status.toLowerCase()}`;
      statusBadge.textContent = subscription.status;
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);

      const createdCell = document.createElement('td');
      createdCell.textContent = this.formatDate(subscription.createdAt);
      row.appendChild(createdCell);

      const endDateCell = document.createElement('td');
      endDateCell.textContent = subscription.endDate ? this.formatDate(subscription.endDate) : 'N/A';
      row.appendChild(endDateCell);

      const renewalCell = document.createElement('td');
      renewalCell.textContent = subscription.nextRenewalDate ? this.formatDate(subscription.nextRenewalDate) : 'N/A';
      row.appendChild(renewalCell);

      const actionsCell = document.createElement('td');
      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn btn-sm btn-secondary';
      viewBtn.textContent = 'Manage';
      viewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDetailModal(subscription.id);
      });
      actionsCell.appendChild(viewBtn);
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  },

  renderPagination() {
    const paginationContainer = document.getElementById('subscriptions-manager-pagination');
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
    this.currentSubscriptionId = subscriptionId;
    const modal = document.getElementById('subscriptions-manager-detail-modal');
    const detailContent = document.getElementById('subscriptions-manager-detail-content');

    if (!modal || !detailContent) return;

    detailContent.innerHTML = '<p class="loading-message">Loading details...</p>';
    modal.classList.add('active');

    try {
      const response = await apiClient.get(`/subscriptions/${subscriptionId}`);
      
      let subscription = response;
      if (response.data) {
        subscription = response.data;
      }

      document.getElementById('subscriptions-manager-detail-title').textContent = 
        `${subscription.customerName} - ${subscription.planName}`;

      detailContent.innerHTML = `
        <div class="subscription-detail-info">
          <p><strong>Customer:</strong> ${this.escapeHtml(subscription.customerName || 'N/A')}</p>
          <p><strong>Plan:</strong> ${this.escapeHtml(subscription.planName || 'N/A')}</p>
          <p><strong>Status:</strong> ${subscription.status}</p>
          <p><strong>Created:</strong> ${this.formatDate(subscription.createdAt)}</p>
          <p><strong>End Date:</strong> ${subscription.endDate ? this.formatDate(subscription.endDate) : 'N/A'}</p>
          <p><strong>Next Renewal:</strong> ${subscription.nextRenewalDate ? this.formatDate(subscription.nextRenewalDate) : 'N/A'}</p>
          <p><strong>Auto Renewal:</strong> ${subscription.autoRenewal ? 'Yes' : 'No'}</p>
          <p><strong>Cancellation Reason:</strong> ${subscription.cancellationReason || 'N/A'}</p>
        </div>
      `;

      this.updateDetailModalActions(subscription);

    } catch (error) {
      console.error('Error loading subscription details:', error);
      detailContent.innerHTML = `<p class="error-message">Error loading details: ${error.message}</p>`;
      
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error loading details: ${error.message}`, 'error');
    }
  },

  updateDetailModalActions(subscription) {
    const actionsContainer = document.getElementById('subscriptions-manager-detail-actions');
    actionsContainer.innerHTML = '';

    const statuses = [
      { value: 'PENDING', char: 'PE', full: 'Change to Pending' },
      { value: 'ACTIVE', char: 'AP', full: 'Approve and activate subscription' },
      { value: 'SUSPENDED', char: 'SU', full: 'Suspend subscription temporarily' },
      { value: 'CANCELED', char: 'CA', full: 'Cancel subscription permanently' }
    ];
    
    // Create left actions container
    const leftActionsDiv = document.createElement('div');
    leftActionsDiv.className = 'status-actions-left';
    
    statuses.forEach(status => {
      if (status.value !== subscription.status) {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm btn-${this.getStatusButtonClass(status.value)} status-action-btn`;
        btn.textContent = status.char;
        btn.title = status.full;
        btn.setAttribute('data-tooltip', status.full);
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.changeSubscriptionStatus(subscription.id, status.value);
        });
        leftActionsDiv.appendChild(btn);
      }
    });
  
    actionsContainer.appendChild(leftActionsDiv);
  },

  getStatusButtonClass(status) {
    const classMap = {
      'PENDING': 'warning',
      'ACTIVE': 'success',
      'SUSPENDED': 'danger',
      'CANCELED': 'dark',
      'EXPIRED': 'secondary'
    };
    return classMap[status] || 'secondary';
  },

  async changeSubscriptionStatus(subscriptionId, newStatus) {
    try {
      let endpoint;
      
      if (newStatus === 'ACTIVE') {
        endpoint = `/subscriptions/${subscriptionId}/approve`;
      } else if (newStatus === 'SUSPENDED') {
        endpoint = `/subscriptions/${subscriptionId}/suspend`;
      } else if (newStatus === 'CANCELED') {
        endpoint = `/subscriptions/${subscriptionId}/cancel`;
      } else if (newStatus === 'PENDING') {
        // No endpoint exists for setting to PENDING
        throw new Error('Cannot change status to PENDING. Use approval workflow instead.');
      } else {
        throw new Error(`Unknown status: ${newStatus}`);
      }

      const response = await apiClient.put(endpoint, {});

      const uiController = UIController.getInstance();
      uiController.showMessage(`Subscription status changed to ${newStatus}`, 'success');

      setTimeout(() => {
        this.loadSubscriptions();
        this.closeDetailModal();
      }, 1500);

    } catch (error) {
      console.error('Error changing subscription status:', error);
      
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error changing status: ${error.message}`, 'error');
    }
  },

  closeDetailModal() {
    const modal = document.getElementById('subscriptions-manager-detail-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.currentSubscriptionId = null;
  },

  syncFilterUI() {
    const statusFilter = document.getElementById('subscriptions-manager-status-filter');
    const searchInput = document.getElementById('subscriptions-manager-search-input');

    if (statusFilter) {
      statusFilter.value = this.currentStatusFilter;
    }

    if (searchInput) {
      searchInput.value = this.currentSearchQuery;
    }
  },

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

window.SubscriptionsmanSection = SubscriptionsmanSection;
