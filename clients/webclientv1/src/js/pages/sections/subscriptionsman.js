const SubscriptionsmanSection = {
  currentPage: 0,
  pageSize: 12,
  totalPages: 0,
  subscriptions: [],
  currentStatusFilter: '',
  currentSearchQuery: '',
  currentSubscriptionId: null,

  statusMap: {
    'PENDING': 'warning',
    'ACTIVE': 'success',
    'SUSPENDED': 'danger',
    'CANCELED': 'dark',
    'EXPIRED': 'secondary'
  },

  endpointMap: {
    'ACTIVE': 'approve',
    'SUSPENDED': 'suspend',
    'CANCELED': 'cancel'
  },

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

      const statuses = await apiClient.get('/subscriptions/subscription-statuses');
      statusDropdown.innerHTML = '<option value="">All Statuses</option>';
      (Array.isArray(statuses) ? statuses : []).forEach(status => {
        const option = document.createElement('option');
        option.value = option.textContent = status;
        statusDropdown.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  },

  attachEventListeners() {
    const elements = {
      filter: 'subscriptions-manager-status-filter',
      search: 'subscriptions-manager-search-input',
      refresh: 'subscriptions-manager-refresh-btn',
      closeBtn: 'subscriptions-manager-detail-close-btn',
      closeFooter: 'subscriptions-manager-detail-close-footer-btn'
    };

    const [statusFilter, searchInput, refreshBtn, detailCloseBtn, detailCloseBtnFooter] = 
      Object.values(elements).map(id => document.getElementById(id));

    const resetFilters = () => {
      this.currentPage = this.currentStatusFilter = this.currentSearchQuery = 0;
      if (statusFilter) statusFilter.value = '';
      if (searchInput) searchInput.value = '';
      this.loadSubscriptions();
    };

    statusFilter?.addEventListener('change', (e) => {
      this.currentStatusFilter = e.target.value;
      this.currentPage = 0;
      this.loadSubscriptions();
    });

    searchInput?.addEventListener('input', (e) => {
      this.currentSearchQuery = e.target.value;
      this.currentPage = 0;
      this.loadSubscriptions();
    });

    refreshBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      resetFilters();
    });

    [detailCloseBtn, detailCloseBtnFooter].forEach(btn => 
      btn?.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeDetailModal();
      })
    );
  },

  async loadSubscriptions() {
    const container = document.getElementById('subscriptions-manager-container');
    if (!container) return;

    container.innerHTML = '<p class="loading-message">Loading subscriptions...</p>';

    try {
      let endpoint = `/subscriptions/operator/subscriptions?page=${this.currentPage}&size=${this.pageSize}`;
      if (this.currentStatusFilter) endpoint += `&status=${this.currentStatusFilter}`;

      const response = await apiClient.get(endpoint);
      let { content = response, totalPages = 1 } = response;
      
      if (!Array.isArray(content)) content = [];

      if (this.currentSearchQuery) {
        const query = this.currentSearchQuery.toLowerCase();
        content = content.filter(sub => 
          (sub.customerName || '').toLowerCase().includes(query) ||
          (sub.planName || '').toLowerCase().includes(query)
        );
      }

      this.subscriptions = content;
      this.totalPages = response.totalPages || totalPages;

      container.innerHTML = this.subscriptions.length 
        ? '' 
        : '<p class="empty-message">No subscriptions found.</p>';

      if (this.subscriptions.length) this.renderSubscriptions();
      this.renderPagination();
      this.syncFilterUI();

    } catch (error) {
      container.innerHTML = `<p class="error-message">Error loading subscriptions: ${error.message}</p>`;
      UIController.getInstance().showMessage(`Error loading subscriptions: ${error.message}`, 'error');
    }
  },

  renderSubscriptions() {
    const container = document.getElementById('subscriptions-manager-container');
    const table = document.createElement('table');
    table.className = 'subscriptions-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Customer', 'Plan', 'Status', 'Created', 'End Date', 'Next Renewal', 'Actions'].forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    this.subscriptions.forEach(sub => {
      const row = document.createElement('tr');
      
      const createCell = (content) => {
        const cell = document.createElement('td');
        if (typeof content === 'string') cell.textContent = content;
        else cell.appendChild(content);
        return cell;
      };

      row.appendChild(createCell(this.escapeHtml(sub.customerName || 'N/A')));
      row.appendChild(createCell(this.escapeHtml(sub.planName || 'N/A')));
      
      const statusBadge = document.createElement('span');
      statusBadge.className = `status-badge status-${sub.status.toLowerCase()}`;
      statusBadge.textContent = sub.status;
      row.appendChild(createCell(statusBadge));

      row.appendChild(createCell(this.formatDate(sub.createdAt)));
      row.appendChild(createCell(sub.endDate ? this.formatDate(sub.endDate) : 'N/A'));
      row.appendChild(createCell(sub.nextRenewalDate ? this.formatDate(sub.nextRenewalDate) : 'N/A'));

      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn btn-sm btn-secondary';
      viewBtn.textContent = 'Manage';
      viewBtn.addEventListener('click', () => this.openDetailModal(sub.id));
      row.appendChild(createCell(viewBtn));

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
  },

  renderPagination() {
    const container = document.getElementById('subscriptions-manager-pagination');
    if (!container || this.totalPages <= 1) return;

    container.innerHTML = '';
    const createBtn = (text, disabled, callback) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-secondary';
      btn.textContent = text;
      btn.disabled = disabled;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        callback();
      });
      return btn;
    };

    container.appendChild(createBtn('Previous', this.currentPage === 0, () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.loadSubscriptions();
      }
    }));

    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `Page ${this.currentPage + 1} of ${this.totalPages}`;
    container.appendChild(pageInfo);

    container.appendChild(createBtn('Next', this.currentPage >= this.totalPages - 1, () => {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        this.loadSubscriptions();
      }
    }));
  },

  async openDetailModal(subscriptionId) {
    this.currentSubscriptionId = subscriptionId;
    const modal = document.getElementById('subscriptions-manager-detail-modal');
    const detailContent = document.getElementById('subscriptions-manager-detail-content');

    if (!modal || !detailContent) return;

    detailContent.innerHTML = '<p class="loading-message">Loading details...</p>';
    modal.classList.add('active');

    try {
      const subscription = (await apiClient.get(`/subscriptions/${subscriptionId}`)).data || 
                          await apiClient.get(`/subscriptions/${subscriptionId}`);

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
      UIController.getInstance().showMessage(`Error loading details: ${error.message}`, 'error');
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
    
    const leftActionsDiv = document.createElement('div');
    leftActionsDiv.className = 'status-actions-left';
    
    statuses.forEach(status => {
      if (status.value !== subscription.status) {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm btn-${this.statusMap[status.value]} status-action-btn`;
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

  async changeSubscriptionStatus(subscriptionId, newStatus) {
    try {
      if (newStatus === 'PENDING') {
        throw new Error('Cannot change status to PENDING. Use approval workflow instead.');
      }

      const endpoint = this.endpointMap[newStatus];
      if (!endpoint) throw new Error(`Unknown status: ${newStatus}`);

      await apiClient.put(`/subscriptions/${subscriptionId}/${endpoint}`, {});

      UIController.getInstance().showMessage(`Subscription status changed to ${newStatus}`, 'success');

      setTimeout(() => {
        this.loadSubscriptions();
        this.closeDetailModal();
      }, 1500);

    } catch (error) {
      console.error('Error changing subscription status:', error);
      UIController.getInstance().showMessage(`Error changing status: ${error.message}`, 'error');
    }
  },

  closeDetailModal() {
    document.getElementById('subscriptions-manager-detail-modal')?.classList.remove('active');
    this.currentSubscriptionId = null;
  },

  syncFilterUI() {
    const statusFilter = document.getElementById('subscriptions-manager-status-filter');
    const searchInput = document.getElementById('subscriptions-manager-search-input');
    if (statusFilter) statusFilter.value = this.currentStatusFilter;
    if (searchInput) searchInput.value = this.currentSearchQuery;
  },

  formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

window.SubscriptionsmanSection = SubscriptionsmanSection;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubscriptionsmanSection;
}