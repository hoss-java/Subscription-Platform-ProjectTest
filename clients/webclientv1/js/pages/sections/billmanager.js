const BillmanagerSection = {
  currentPage: 0,
  pageSize: 12,
  totalPages: 0,
  bills: [],
  currentStatusFilter: '',
  currentBillId: null,
  billingStatuses: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'],

  async init() {
    setTimeout(async () => {
      this.attachEventListeners();
      await this.loadBillingStatuses();
      this.populateStatusDropdown();
      this.loadBills();
    }, 100);
  },

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

  attachEventListeners() {
    const statusFilter = document.getElementById('billmanager-status-filter');
    const refreshBtn = document.getElementById('billmanager-refresh-btn');
    const detailCloseBtn = document.getElementById('billmanager-detail-close-btn');
    const detailCloseBtnFooter = document.getElementById('billmanager-detail-close-footer-btn');

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.currentStatusFilter = e.target.value;
        this.currentPage = 0;
        this.loadBills();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentPage = 0;
        this.currentStatusFilter = '';
        if (statusFilter) statusFilter.value = '';
        this.loadBills();
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

  populateStatusDropdown() {
    const dropdown = document.getElementById('billmanager-status-filter');
    if (!dropdown) return;

    this.billingStatuses.forEach(status => {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      dropdown.appendChild(option);
    });
  },

  async loadBills() {
    const container = document.getElementById('billmanager-container');
    if (!container) return;

    container.innerHTML = '<p class="loading-message">Loading bills...</p>';

    try {
      let endpoint = `/billings/operator/issued?page=${this.currentPage}&size=${this.pageSize}`;

      if (this.currentStatusFilter) {
        endpoint += `&status=${this.currentStatusFilter}`;
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

      this.bills = bills;
      this.totalPages = totalPages;

      if (this.bills.length === 0) {
        container.innerHTML = '<p class="empty-message">No bills found.</p>';
      } else {
        this.renderBills();
      }

      this.renderPagination();

    } catch (error) {
      container.innerHTML = `<p class="error-message">Error loading bills: ${error.message}</p>`;
      
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error loading bills: ${error.message}`, 'error');
    }
  },

  renderBills() {
    const container = document.getElementById('billmanager-container');
    container.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'bills-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['ID', 'Subscription ID', 'Amount', 'Billing Date', 'Due Date', 'Status', 'Actions'].forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    this.bills.forEach(bill => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.textContent = bill.id;
      row.appendChild(idCell);

      const subIdCell = document.createElement('td');
      subIdCell.textContent = bill.subscriptionId;
      row.appendChild(subIdCell);

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

      const actionsCell = document.createElement('td');
      const viewBtn = document.createElement('button');
      viewBtn.className = 'btn btn-sm btn-secondary';
      viewBtn.textContent = 'View';
      viewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDetailModal(bill.id);
      });
      actionsCell.appendChild(viewBtn);

      if (bill.status === 'PAYMENT_CLAIMED') {
        const separator = document.createElement('span');
        separator.className = 'action-separator';
        separator.textContent = ' | ';
        actionsCell.appendChild(separator);

        const approveBtn = document.createElement('button');
        approveBtn.className = 'btn btn-sm btn-success';
        approveBtn.textContent = 'Approve';
        approveBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.approveBillingPayment(bill.id);
        });
        actionsCell.appendChild(approveBtn);
      }

      row.appendChild(actionsCell);

      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.appendChild(table);
  },

  renderPagination() {
    const paginationContainer = document.getElementById('billmanager-pagination');
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
        this.loadBills();
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
        this.loadBills();
      }
    });
    paginationContainer.appendChild(nextBtn);
  },

async openDetailModal(billId) {
    this.currentBillId = billId;
    const modal = document.getElementById('billmanager-detail-modal');
    const detailContent = document.getElementById('billmanager-detail-content');

    if (!modal || !detailContent) return;

    detailContent.innerHTML = '<p class="loading-message">Loading bill details...</p>';
    modal.style.display = 'flex'; 
    modal.classList.add('active');

    try {
      const response = await apiClient.get(`/billings/${billId}`);
      const bill = response.data || response;

      document.getElementById('billmanager-detail-title').textContent = `Invoice #${bill.id}`;

      detailContent.innerHTML = `
        <div class="invoice-document">
          <!-- Invoice Top Header -->
          <div class="invoice-top">
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <p class="invoice-number">Invoice #${bill.id}</p>
            </div>
            <div class="invoice-status-actions">
              <span class="bill-status-badge bill-status-${bill.status.toLowerCase()}">${bill.status}</span>
              ${bill.status === 'PAYMENT_CLAIMED' ? `<button id="billmanager-approve-btn" class="btn btn-success">Approve</button>` : ''}
            </div>
          </div>

          <!-- Two Column Layout: From/To -->
          <div class="invoice-addresses">
            <div class="invoice-from">
              <h5>FROM (Service Provider)</h5>
              <div class="address-block">
                <p class="name">${bill.operator.firstName} ${bill.operator.lastName}</p>
                <p class="email">${bill.operator.email}</p>
              </div>
            </div>

            <div class="invoice-to">
              <h5>BILL TO (Customer)</h5>
              <div class="address-block">
                <p class="name">${bill.customer.firstName} ${bill.customer.lastName}</p>
                <p class="email">${bill.customer.email}</p>
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
                  <td>${bill.plan.name}</td>
                  <td>${bill.plan.description}</td>
                  <td>${bill.plan.billingPeriod}</td>
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
              <p><strong>Plan:</strong> ${bill.plan.name}</p>
              <p><strong>Service Type:</strong> ${bill.plan.serviceType}</p>
            </div>
            <div class="meta-column">
              <h5>Subscription Information</h5>
              <p><strong>Subscription ID:</strong> ${bill.subscription.id}</p>
              <p><strong>Status:</strong> ${bill.subscription.status}</p>
              <p><strong>Auto Renewal:</strong> ${bill.subscription.autoRenewal ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="bill-detail-actions">
            <label for="billmanager-status-change">Change Status:</label>
            <select id="billmanager-status-change" class="filter-select">
              <option value="">Select new status</option>
            </select>
            <button id="billmanager-update-btn" class="btn btn-primary">Update Status</button>
          </div>
        </div>
      `;

      const statusSelect = document.getElementById('billmanager-status-change');
      this.billingStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
      });

      const updateBtn = document.getElementById('billmanager-update-btn');
      updateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.updateBillStatus(billId);
      });

      const approveBtn = document.getElementById('billmanager-approve-btn');
      if (approveBtn) {
        approveBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.approveBillingPayment(billId);
        });
      }

    } catch (error) {
      detailContent.innerHTML = `<p class="error-message">Error loading bill details: ${error.message}</p>`;
      
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error loading bill details: ${error.message}`, 'error');
    }
  },

  async approveBillingPayment(billId) {
      try {
          const response = await apiClient.put(`/billings/${billId}/approve`);
          const uiController = UIController.getInstance();
          uiController.showMessage('Payment approved successfully', 'success');
          this.closeDetailModal();
          this.loadBills();
      } catch (error) {
          const uiController = UIController.getInstance();
          uiController.showMessage(`Error approving payment: ${error.message}`, 'error');
      }
  },

  async updateBillStatus(billId) {
    const statusSelect = document.getElementById('billmanager-status-change');
    const newStatus = statusSelect.value;

    if (!newStatus) {
      const uiController = UIController.getInstance();
      uiController.showMessage('Please select a status', 'warning');
      return;
    }

    try {
      const updateBtn = document.getElementById('billmanager-update-btn');
      updateBtn.disabled = true;
      updateBtn.textContent = 'Updating...';

      const request = {
        status: newStatus
      };

      await apiClient.put(`/billings/${billId}`, request);

      const uiController = UIController.getInstance();
      uiController.showMessage('Bill status updated successfully', 'success');

      setTimeout(() => {
        this.closeDetailModal();
        this.loadBills();
      }, 1500);

    } catch (error) {
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error updating bill status: ${error.message}`, 'error');

      const updateBtn = document.getElementById('billmanager-update-btn');
      updateBtn.disabled = false;
      updateBtn.textContent = 'Update Status';
    }
  },

  closeDetailModal() {
    const modal = document.getElementById('billmanager-detail-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';  // Add this back
    }
    this.currentBillId = null;
  },

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  },

  cleanup() {
    // Optional: cleanup when section is unloaded
  }
};

window.BillmanagerSection = BillmanagerSection;
