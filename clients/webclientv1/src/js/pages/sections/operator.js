const OperatorSection = {
  currentPlanId: null,
  plans: [],
  isEditMode: false,
  serviceTypes: [],
  billingPeriods: [],
  elements: {},

  async init() {
    this.cacheElements();
    this.attachEventListeners();
    await Promise.all([
      this.loadServiceTypes(),
      this.loadBillingPeriods(),
      this.loadPlans()
    ]);
  },

  cacheElements() {
    this.elements = {
      container: document.getElementById('operator-plans-container'),
      form: document.getElementById('operator-plan-form'),
      viewSection: document.getElementById('operator-view'),
      editSection: document.getElementById('operator-edit'),
      createBtn: document.getElementById('operator-create-btn'),
      refreshBtn: document.getElementById('operator-refresh-btn')
    };
  },

  async loadServiceTypes() {
    try {
      const response = await apiClient.get('/plans/service-types');
      if (Array.isArray(response)) this.serviceTypes = response;
    } catch (error) {
      console.error('Error loading service types:', error);
    }
  },

  async loadBillingPeriods() {
    try {
      const response = await apiClient.get('/billings/billing-periods');
      if (Array.isArray(response)) this.billingPeriods = response;
    } catch (error) {
      console.error('Error loading billing periods:', error);
    }
  },

  attachEventListeners() {
    this.elements.createBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openPlanModal(null);
    });
    
    this.elements.refreshBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadPlans();
    });
  },

  async loadPlans() {
    if (!this.elements.container) return;
    
    this.elements.container.innerHTML = '<p class="loading-message">Loading plans...</p>';
    
    try {
      const response = await apiClient.get('/plans/my-plans');
      this.plans = [response, response?.content, response?.plans, response?.data].find(Array.isArray) || [];
      
      this.elements.container.innerHTML = this.plans.length === 0 
        ? '<p class="empty-message">No plans found.</p>'
        : '';
      
      if (this.plans.length > 0) this.renderPlans();
    } catch (error) {
      this.elements.container.innerHTML = `<p class="error-message">Error loading plans: ${error.message}</p>`;
      UIController.getInstance().showMessage(`Error loading plans: ${error.message}`, 'error');
    }
  },

  renderPlans() {
    const table = document.createElement('table');
    table.className = 'operator-plans-table';
    
    const headers = ['Name', 'Description', 'Service Type', 'Base Price', 'Billing Period', 'Status', 'Created', 'Actions'];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headers.forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    
    const tbody = table.createTBody();
    this.plans.forEach(plan => tbody.appendChild(this.createPlanRow(plan)));
    
    this.elements.container.innerHTML = '';
    this.elements.container.appendChild(table);
  },

  createPlanRow(plan) {
    const row = document.createElement('tr');
    const createdDate = new Date(plan.createdAt).toLocaleDateString();
    const statusClass = plan.status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
    
    const cellData = [
      this.escapeHtml(plan.name),
      this.escapeHtml(plan.description || 'N/A'),
      plan.serviceType || 'N/A',
      `$${plan.basePrice}`,
      plan.billingPeriod || 'N/A'
    ];
    
    cellData.forEach(data => {
      const td = row.insertCell();
      td.textContent = data;
    });
    
    const statusCell = row.insertCell();
    const statusBadge = document.createElement('span');
    statusBadge.className = `badge ${statusClass}`;
    statusBadge.textContent = plan.status || 'N/A';
    statusCell.appendChild(statusBadge);
    
    const createdCell = row.insertCell();
    createdCell.textContent = createdDate;
    
    const actionsCell = row.insertCell();
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-primary';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => this.openPlanModal(plan.id));
    actionsCell.appendChild(editBtn);
    
    return row;
  },

  openPlanModal(planId) {
    this.currentPlanId = planId;
    this.isEditMode = !!planId;
    this.elements.viewSection.style.display = 'none';
    this.elements.editSection.style.display = 'block';
    this.generatePlanForm(planId ? this.plans.find(p => p.id === planId) : null);
  },

  generatePlanForm(plan) {
    const form = this.elements.form;
    form.innerHTML = '';
    
    const createInput = (label, id, type, options = {}) => {
      const group = document.createElement('div');
      group.className = 'form-group';
      
      const labelEl = document.createElement('label');
      labelEl.textContent = label;
      group.appendChild(labelEl);
      
      let input;
      if (type === 'select') {
        input = document.createElement('select');
        input.id = id;
        input.className = 'form-control';
        if (options.required) input.required = true;
        options.items?.forEach(item => {
          const option = document.createElement('option');
          option.value = item;
          option.textContent = item;
          input.appendChild(option);
        });
        if (plan && options.planKey) input.value = plan[options.planKey] || '';
      } else if (type === 'textarea') {
        input = document.createElement('textarea');
        input.id = id;
        input.className = 'form-control';
        input.rows = options.rows || 3;
        input.placeholder = options.placeholder || '';
        input.value = plan ? (plan[options.planKey] || '') : '';
      } else {
        input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.className = 'form-control';
        if (options.required) input.required = true;
        input.value = plan ? (plan[options.planKey] || '') : '';
        if (options.step) input.step = options.step;
      }
      
      group.appendChild(input);
      return group;
    };
    
    const fields = [
      { label: 'Plan Name', id: 'operator-name-input', type: 'text', required: true, planKey: 'name' },
      { label: 'Description', id: 'operator-desc-input', type: 'textarea', rows: 3, planKey: 'description' },
      { label: 'Service Type', id: 'operator-service-type-select', type: 'select', required: true, items: this.serviceTypes, planKey: 'serviceType' },
      { label: 'Base Price', id: 'operator-price-input', type: 'number', required: true, step: '0.01', planKey: 'basePrice' },
      { label: 'Billing Period', id: 'operator-billing-select', type: 'select', required: true, items: this.billingPeriods, planKey: 'billingPeriod' }
    ];
    
    fields.forEach(field => form.appendChild(createInput(field.label, field.id, field.type, field)));
    
    const featuresGroup = document.createElement('div');
    featuresGroup.className = 'form-group';
    const featuresLabel = document.createElement('label');
    featuresLabel.textContent = 'Features';
    const featuresInput = document.createElement('textarea');
    featuresInput.id = 'operator-features-input';
    featuresInput.className = 'form-control';
    featuresInput.rows = 3;
    featuresInput.placeholder = 'Enter features (comma-separated or line-by-line)';
    if (plan?.features) {
      try {
        const parsed = JSON.parse(plan.features);
        featuresInput.value = Array.isArray(parsed) ? parsed.join('\n') : plan.features;
      } catch {
        featuresInput.value = plan.features;
      }
    }
    featuresGroup.appendChild(featuresLabel);
    featuresGroup.appendChild(featuresInput);
    form.appendChild(featuresGroup);
    
    const statusGroup = document.createElement('div');
    statusGroup.className = 'form-group';
    const statusCheckbox = document.createElement('input');
    statusCheckbox.type = 'checkbox';
    statusCheckbox.id = 'operator-status-checkbox';
    statusCheckbox.checked = !plan || plan.status === 'ACTIVE';
    const statusLabel = document.createElement('label');
    statusLabel.appendChild(statusCheckbox);
    statusLabel.appendChild(document.createTextNode(' Active'));
    statusGroup.appendChild(statusLabel);
    form.appendChild(statusGroup);
    
    this.createFormActions(form);
  },

  createFormActions(form) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'form-actions';
    
    const createButton = (text, className, handler) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = className;
      btn.textContent = text;
      btn.addEventListener('click', handler);
      return btn;
    };
    
    const leftActions = document.createElement('div');
    leftActions.className = 'form-actions-left';
    leftActions.appendChild(createButton('Cancel', 'btn btn-secondary', (e) => {
      e.preventDefault();
      this.closePlanModal();
    }));
    leftActions.appendChild(createButton(this.isEditMode ? 'Update Plan' : 'Create Plan', 'btn btn-primary', (e) => {
      e.preventDefault();
      this.savePlan();
    }));
    actionsDiv.appendChild(leftActions);
    
    if (this.isEditMode) {
      const rightActions = document.createElement('div');
      rightActions.className = 'form-actions-right';
      rightActions.appendChild(createButton('Delete Plan', 'btn btn-danger', (e) => {
        e.preventDefault();
        this.deletePlan(this.currentPlanId);
      }));
      actionsDiv.appendChild(rightActions);
    }
    
    form.appendChild(actionsDiv);
  },

  async savePlan() {
    const getFieldValue = (id) => document.getElementById(id)?.value || '';
    const name = getFieldValue('operator-name-input');
    const basePrice = parseFloat(getFieldValue('operator-price-input'));
    
    if (!name || !basePrice || isNaN(basePrice)) {
      UIController.getInstance().showMessage('Please fill in all required fields with valid values', 'error');
      return;
    }
    
    const saveBtn = document.querySelector('#operator-plan-form button[type="button"]:last-of-type');
    if (!saveBtn) return;
    
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
      const planData = {
        name,
        description: getFieldValue('operator-desc-input'),
        serviceType: getFieldValue('operator-service-type-select'),
        basePrice,
        billingPeriod: getFieldValue('operator-billing-select'),
        features: getFieldValue('operator-features-input').replace(/^["']|["']$/g, ''),
        status: document.getElementById('operator-status-checkbox')?.checked ? 'ACTIVE' : 'INACTIVE'
      };
      
      const uiController = UIController.getInstance();
      const method = this.isEditMode ? 'put' : 'post';
      const url = this.isEditMode ? `/plans/${this.currentPlanId}` : '/plans';
      
      await apiClient[method](url, planData);
      uiController.showMessage(this.isEditMode ? 'Plan updated successfully!' : 'Plan created successfully!', 'success');
      this.closePlanModal();
      await this.loadPlans();
    } catch (error) {
      UIController.getInstance().showMessage(`Error saving plan: ${error.message}`, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  },

  async deletePlan(planId) {
    try {
      await apiClient.delete(`/plans/${planId}`);
      UIController.getInstance().showMessage('Plan deleted successfully!', 'success');
      this.closePlanModal();
      await this.loadPlans();
    } catch (error) {
      UIController.getInstance().showMessage(`Error deleting plan: ${error.message}`, 'error');
    }
  },

  closePlanModal() {
    this.elements.viewSection.style.display = 'block';
    this.elements.editSection.style.display = 'none';
    this.currentPlanId = null;
    this.isEditMode = false;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

window.OperatorSection = OperatorSection;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OperatorSection;
}