const BillmanagerSection = {
  currentPage: 0,
  pageSize: 12,
  totalPages: 0,
  bills: [],
  currentStatusFilter: '',
  currentBillId: null,
  billingStatuses: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'],
  elements: {
    container: null,
    statusFilter: null,
    refreshBtn: null,
    detailCloseBtn: null,
    detailCloseBtnFooter: null,
    modal: null,
    detailContent: null,
    paginationContainer: null,
  },

  async init() {
    setTimeout(() => {
      this.cacheElements();
      this.attachEventListeners();
      this.loadBillingStatuses();
      this.populateStatusDropdown();
      this.loadBills();
    }, 100);
  },

  cacheElements() {
    const ids = ['billmanager-container', 'billmanager-status-filter', 'billmanager-refresh-btn', 
                 'billmanager-detail-close-btn', 'billmanager-detail-close-footer-btn', 
                 'billmanager-detail-modal', 'billmanager-detail-content', 'billmanager-pagination'];
    const keys = Object.keys(this.elements);
    ids.forEach((id, i) => this.elements[keys[i]] = document.getElementById(id));
  },

  async loadBillingStatuses() {
    try {
      const response = await apiClient.get('/billings/billing-statuses');
      this.billingStatuses = Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error loading billing statuses:', error);
    }
  },

  attachEventListeners() {
    if (this.elements.statusFilter) {
      this.elements.statusFilter.addEventListener('change', (e) => {
        this.currentStatusFilter = e.target.value;
        this.currentPage = 0;
        this.loadBills();
      });
    }

    if (this.elements.refreshBtn) {
      this.elements.refreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetFilters();
        this.loadBills();
      });
    }

    [this.elements.detailCloseBtn, this.elements.detailCloseBtnFooter].forEach(btn => {
      if (btn) btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeDetailModal();
      });
    });
  },

  resetFilters() {
    this.currentPage = 0;
    this.currentStatusFilter = '';
    if (this.elements.statusFilter) this.elements.statusFilter.value = '';
  },

  populateStatusDropdown() {
    if (!this.elements.statusFilter) return;
    this.billingStatuses.forEach(status => {
      const option = document.createElement('option');
      option.value = option.textContent = status;
      this.elements.statusFilter.appendChild(option);
    });
  },

  async loadBills() {
    if (!this.elements.container) return;
    this.elements.container.innerHTML = '<p class="loading-message">Loading bills...</p>';

    try {
      const endpoint = `/billings/operator/issued?page=${this.currentPage}&size=${this.pageSize}${this.currentStatusFilter ? `&status=${this.currentStatusFilter}` : ''}`;
      const response = await apiClient.get(endpoint);
      const { bills, totalPages } = this.parseBillsResponse(response);
      
      this.bills = bills;
      this.totalPages = totalPages;
      
      this.elements.container.innerHTML = bills.length ? '' : '<p class="empty-message">No bills found.</p>';
      if (bills.length) this.renderBills();
      this.renderPagination();
    } catch (error) {
      this.handleError('Error loading bills', error);
    }
  },

  parseBillsResponse(response) {
    if (response.content && Array.isArray(response.content)) {
      return { bills: response.content, totalPages: response.totalPages || 0 };
    }
    return { bills: Array.isArray(response) ? response : [], totalPages: 1 };
  },

  renderBills() {
    const table = document.createElement('table');
    table.className = 'bills-table';
    table.appendChild(this.createTableHead());
    const tbody = document.createElement('tbody');
    this.bills.forEach(bill => tbody.appendChild(this.createBillRow(bill)));
    table.appendChild(tbody);
    this.elements.container.appendChild(table);
  },

  createTableHead() {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['ID', 'Subscription ID', 'Amount', 'Billing Date', 'Due Date', 'Status', 'Actions'].forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    return thead;
  },

  createBillRow(bill) {
    const row = document.createElement('tr');
    [bill.id, bill.subscriptionId, `$${bill.amount}`, this.formatDate(bill.billingDate), this.formatDate(bill.dueDate)].forEach(data => {
      const cell = document.createElement('td');
      cell.textContent = data;
      row.appendChild(cell);
    });

    const statusCell = document.createElement('td');
    statusCell.innerHTML = `<span class="bill-status-badge bill-status-${bill.status.toLowerCase()}">${bill.status}</span>`;
    row.appendChild(statusCell);

    const actionsCell = document.createElement('td');
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-sm btn-secondary';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => this.openDetailModal(bill.id));
    actionsCell.appendChild(viewBtn);

    if (bill.status === 'PAYMENT_CLAIMED') {
      actionsCell.innerHTML += ' | ';
      const approveBtn = document.createElement('button');
      approveBtn.className = 'btn btn-sm btn-success';
      approveBtn.textContent = 'Approve';
      approveBtn.addEventListener('click', () => this.approveBillingPayment(bill.id));
      actionsCell.appendChild(approveBtn);
    }
    row.appendChild(actionsCell);
    return row;
  },

  renderPagination() {
    if (!this.elements.paginationContainer || this.totalPages <= 1) return;
    this.elements.paginationContainer.innerHTML = '';

    const prevBtn = this.createPaginationButton('Previous', this.currentPage > 0, () => {
      this.currentPage--;
      this.loadBills();
    });
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `Page ${this.currentPage + 1} of ${this.totalPages}`;
    const nextBtn = this.createPaginationButton('Next', this.currentPage < this.totalPages - 1, () => {
      this.currentPage++;
      this.loadBills();
    });

    [prevBtn, pageInfo, nextBtn].forEach(el => this.elements.paginationContainer.appendChild(el));
  },

  createPaginationButton(text, enabled, onClick) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-secondary';
    btn.textContent = text;
    btn.disabled = !enabled;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      onClick();
    });
    return btn;
  },

  async openDetailModal(billId) {
    if (!this.elements.modal || !this.elements.detailContent) return;
    
    this.currentBillId = billId;
    this.elements.detailContent.innerHTML = '<p class="loading-message">Loading bill details...</p>';
    this.elements.modal.style.display = 'flex';
    this.elements.modal.classList.add('active');

    try {
      const bill = (await apiClient.get(`/billings/${billId}`)).data || await apiClient.get(`/billings/${billId}`);
      document.getElementById('billmanager-detail-title').textContent = `Invoice #${bill.id}`;
      this.elements.detailContent.innerHTML = this.buildInvoiceHTML(bill);
      this.attachDetailModalListeners(billId, bill);
    } catch (error) {
      this.handleDetailError(error);
    }
  },

  buildInvoiceHTML(bill) {
    return `<div class="invoice-document">
      ${this.buildInvoiceTop(bill)}
      ${this.buildInvoiceAddresses(bill)}
      ${this.buildInvoiceDates(bill)}
      ${this.buildInvoiceItems(bill)}
      ${this.buildInvoiceTotals(bill)}
      ${this.buildInvoiceMeta(bill)}
      ${this.buildBillActions()}
    </div>`;
  },

  buildInvoiceTop(bill) {
    return `<div class="invoice-top">
      <div class="invoice-title"><h2>INVOICE</h2><p class="invoice-number">Invoice #${bill.id}</p></div>
      <div class="invoice-status-actions">
        <span class="bill-status-badge bill-status-${bill.status.toLowerCase()}">${bill.status}</span>
        ${bill.status === 'PAYMENT_CLAIMED' ? '<button id="billmanager-approve-btn" class="btn btn-success">Approve</button>' : ''}
      </div>
    </div>`;
  },

  buildInvoiceAddresses(bill) {
    const renderAddress = (title, person, email) => `<div class="invoice-${title === 'FROM' ? 'from' : 'to'}">
      <h5>${title} (${title === 'FROM' ? 'Service Provider' : 'Customer'})</h5>
      <div class="address-block"><p class="name">${person.firstName} ${person.lastName}</p><p class="email">${person.email}</p></div>
    </div>`;
    return `<div class="invoice-addresses">${renderAddress('FROM', bill.operator, bill.operator.email)}${renderAddress('TO', bill.customer, bill.customer.email)}</div>`;
  },

  buildInvoiceDates(bill) {
    const dateItem = (label, date) => `<div class="date-item"><span class="date-label">${label}:</span><span class="date-value">${date}</span></div>`;
    return `<div class="invoice-dates">
      ${dateItem('Invoice Date', this.formatDate(bill.billingDate))}
      ${dateItem('Due Date', this.formatDate(bill.dueDate))}
      ${dateItem('Paid Date', bill.paidDate ? this.formatDate(bill.paidDate) : 'Not paid yet')}
    </div>`;
  },

  buildInvoiceItems(bill) {
    return `<div class="invoice-items"><table class="items-table"><thead><tr><th>Service</th><th>Description</th><th>Billing Period</th><th class="text-right">Amount</th></tr></thead>
      <tbody><tr><td>${bill.plan.name}</td><td>${bill.plan.description}</td><td>${bill.plan.billingPeriod}</td><td class="text-right amount">$${parseFloat(bill.amount).toFixed(2)}</td></tr></tbody>
    </table></div>`;
  },

  buildInvoiceTotals(bill) {
    const amount = parseFloat(bill.amount).toFixed(2);
    return `<div class="invoice-totals"><div class="totals-spacer"></div><div class="totals-summary">
      <div class="total-row"><span class="total-label">Subtotal:</span><span class="total-value">$${amount}</span></div>
      <div class="total-row total-amount"><span class="total-label">TOTAL DUE:</span><span class="total-value">$${amount}</span></div>
    </div></div>`;
  },

  buildInvoiceMeta(bill) {
    return `<div class="invoice-meta">
      <div class="meta-column"><h5>Plan Information</h5><p><strong>Plan:</strong> ${bill.plan.name}</p><p><strong>Service Type:</strong> ${bill.plan.serviceType}</p></div>
      <div class="meta-column"><h5>Subscription Information</h5><p><strong>Subscription ID:</strong> ${bill.subscription.id}</p><p><strong>Status:</strong> ${bill.subscription.status}</p><p><strong>Auto Renewal:</strong> ${bill.subscription.autoRenewal ? 'Yes' : 'No'}</p></div>
    </div>`;
  },

  buildBillActions() {
    return `<div class="bill-detail-actions"><label for="billmanager-status-change">Change Status:</label><select id="billmanager-status-change" class="filter-select"><option value="">Select new status</option></select><button id="billmanager-update-btn" class="btn btn-primary">Update Status</button></div>`;
  },

  attachDetailModalListeners(billId, bill) {
    const statusSelect = document.getElementById('billmanager-status-change');
    this.billingStatuses.forEach(status => {
      const option = document.createElement('option');
      option.value = option.textContent = status;
      statusSelect.appendChild(option);
    });

    document.getElementById('billmanager-update-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.updateBillStatus(billId);
    });

    const approveBtn = document.getElementById('billmanager-approve-btn');
    if (approveBtn) approveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.approveBillingPayment(billId);
    });
  },

  async approveBillingPayment(billId) {
    try {
      await apiClient.put(`/billings/${billId}/approve`);
      this.handleSuccess('Payment approved successfully');
      this.closeDetailModal();
      this.loadBills();
    } catch (error) {
      this.handleError('Error approving payment', error);
    }
  },

  async updateBillStatus(billId) {
    const statusSelect = document.getElementById('billmanager-status-change');
    const newStatus = statusSelect.value;

    if (!newStatus) {
      this.handleWarning('Please select a status');
      return;
    }

    const updateBtn = document.getElementById('billmanager-update-btn');
    this.setButtonLoading(updateBtn, true);

    try {
      await apiClient.put(`/billings/${billId}`, { status: newStatus });
      this.handleSuccess('Bill status updated successfully');
      setTimeout(() => {
        this.closeDetailModal();
        this.loadBills();
      }, 1500);
    } catch (error) {
      this.handleError('Error updating bill status', error);
      this.setButtonLoading(updateBtn, false);
    }
  },

  setButtonLoading(btn, isLoading) {
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Updating...' : 'Update Status';
  },

  handleSuccess(message) {
    UIController.getInstance().showMessage(message, 'success');
  },

  handleWarning(message) {
    UIController.getInstance().showMessage(message, 'warning');
  },

  handleError(title, error) {
    UIController.getInstance().showMessage(`${title}: ${error.message}`, 'error');
    if (this.elements.container) this.elements.container.innerHTML = `<p class="error-message">${title}: ${error.message}</p>`;
  },

  handleDetailError(error) {
    this.elements.detailContent.innerHTML = `<p class="error-message">Error loading bill details: ${error.message}</p>`;
    this.handleError('Error loading bill details', error);
  },

  closeDetailModal() {
    if (this.elements.modal) {
      this.elements.modal.classList.remove('active');
      this.elements.modal.style.display = 'none';
    }
    this.currentBillId = null;
  },

  formatDate(dateString) {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  }
};

window.BillmanagerSection = BillmanagerSection;
