const OperatorSection = {
  currentPlanId: null,
  plans: [],
  isEditMode: false,

  init() {
    setTimeout(() => {
      this.attachEventListeners();
      this.loadPlans();
    }, 100);
  },

  attachEventListeners() {
    const createBtn = document.getElementById('operator-create-btn');
    const refreshBtn = document.getElementById('operator-refresh-btn');
    
    if (createBtn) {
      createBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openPlanModal(null);
      });
    }
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadPlans();
      });
    }
  },

  async loadPlans() {
    const container = document.getElementById('operator-plans-container');
    if (!container) {
      return;
    }
    
    container.innerHTML = '<p class="loading-message">Loading plans...</p>';
    
    try {
      const response = await apiClient.get('/plans/my-plans');
      
      let plans = [];
      
      if (Array.isArray(response)) {
        plans = response;
      } else if (response.content && Array.isArray(response.content)) {
        plans = response.content;
      } else if (response.plans && Array.isArray(response.plans)) {
        plans = response.plans;
      } else if (response.data && Array.isArray(response.data)) {
        plans = response.data;
      } else {
        plans = [];
      }
      
      this.plans = plans;
      
      if (this.plans.length === 0) {
        container.innerHTML = '<p class="empty-message">No plans found.</p>';
      } else {
        this.renderPlans();
      }
      
    } catch (error) {
      container.innerHTML = `<p class="error-message">Error loading plans: ${error.message}</p>`;
      
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error loading plans: ${error.message}`, 'error');
    }
  },

renderPlans() {
  const container = document.getElementById('operator-plans-container');
  const table = document.createElement('table');
  table.className = 'operator-plans-table';
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const headers = ['Name', 'Description', 'Service Type', 'Base Price', 'Billing Period', 'Status', 'Created', 'Actions'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  
  this.plans.forEach(plan => {
    const row = document.createElement('tr');
    
    const createdDate = new Date(plan.createdAt).toLocaleDateString();
    const statusClass = plan.status === 'ACTIVE' ? 'badge-success' : 'badge-danger';
    
    const nameCell = document.createElement('td');
    nameCell.textContent = this.escapeHtml(plan.name);
    row.appendChild(nameCell);
    
    const descCell = document.createElement('td');
    descCell.textContent = this.escapeHtml(plan.description || 'N/A');
    row.appendChild(descCell);
    
    const serviceTypeCell = document.createElement('td');
    serviceTypeCell.textContent = plan.serviceType || 'N/A';
    row.appendChild(serviceTypeCell);
    
    const priceCell = document.createElement('td');
    priceCell.textContent = `$${plan.basePrice}`;
    row.appendChild(priceCell);
    
    const billingCell = document.createElement('td');
    billingCell.textContent = plan.billingPeriod || 'N/A';
    row.appendChild(billingCell);
    
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `badge ${statusClass}`;
    statusBadge.textContent = plan.status || 'N/A';
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);
    
    const createdCell = document.createElement('td');
    createdCell.textContent = createdDate;
    row.appendChild(createdCell);
    
    const actionsCell = document.createElement('td');
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-primary';
    editBtn.textContent = 'Edit';
    editBtn.dataset.planId = plan.id;
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openPlanModal(plan.id);
    });
    actionsCell.appendChild(editBtn);
    
    row.appendChild(actionsCell);
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
},

  openPlanModal(planId) {
    const plan = planId ? this.plans.find(p => p.id === planId) : null;
    
    this.currentPlanId = planId;
    this.isEditMode = !!planId;
    
    document.getElementById('operator-view').style.display = 'none';
    document.getElementById('operator-edit').style.display = 'block';
    this.generatePlanForm(plan);
  },

  generatePlanForm(plan) {
    const form = document.getElementById('operator-plan-form');
    form.innerHTML = '';
    
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Plan Name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'operator-name-input';
    nameInput.className = 'form-control';
    nameInput.value = plan ? plan.name : '';
    nameInput.required = true;
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);
    
    const descGroup = document.createElement('div');
    descGroup.className = 'form-group';
    const descLabel = document.createElement('label');
    descLabel.textContent = 'Description';
    const descInput = document.createElement('textarea');
    descInput.id = 'operator-desc-input';
    descInput.className = 'form-control';
    descInput.value = plan ? plan.description : '';
    descInput.rows = 3;
    descGroup.appendChild(descLabel);
    descGroup.appendChild(descInput);
    form.appendChild(descGroup);
    
    const serviceTypeGroup = document.createElement('div');
    serviceTypeGroup.className = 'form-group';
    const serviceTypeLabel = document.createElement('label');
    serviceTypeLabel.textContent = 'Service Type';
    const serviceTypeSelect = document.createElement('select');
    serviceTypeSelect.id = 'operator-service-type-select';
    serviceTypeSelect.className = 'form-control';
    serviceTypeSelect.required = true;
    
    const serviceTypes = ['INTERNET', 'MOBILE', 'BUNDLE'];
    serviceTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      serviceTypeSelect.appendChild(option);
    });
    
    if (plan) {
      serviceTypeSelect.value = plan.serviceType;
    }
    
    serviceTypeGroup.appendChild(serviceTypeLabel);
    serviceTypeGroup.appendChild(serviceTypeSelect);
    form.appendChild(serviceTypeGroup);
    
    const priceGroup = document.createElement('div');
    priceGroup.className = 'form-group';
    const priceLabel = document.createElement('label');
    priceLabel.textContent = 'Base Price';
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.id = 'operator-price-input';
    priceInput.className = 'form-control';
    priceInput.value = plan ? plan.basePrice : '';
    priceInput.step = '0.01';
    priceInput.required = true;
    priceGroup.appendChild(priceLabel);
    priceGroup.appendChild(priceInput);
    form.appendChild(priceGroup);
    
    const billingGroup = document.createElement('div');
    billingGroup.className = 'form-group';
    const billingLabel = document.createElement('label');
    billingLabel.textContent = 'Billing Period';
    const billingSelect = document.createElement('select');
    billingSelect.id = 'operator-billing-select';
    billingSelect.className = 'form-control';
    billingSelect.required = true;
    
    const billingPeriods = ['MONTHLY', 'QUARTERLY', 'YEARLY'];
    billingPeriods.forEach(period => {
      const option = document.createElement('option');
      option.value = period;
      option.textContent = period;
      billingSelect.appendChild(option);
    });
    
    if (plan) {
      billingSelect.value = plan.billingPeriod;
    }
    
    billingGroup.appendChild(billingLabel);
    billingGroup.appendChild(billingSelect);
    form.appendChild(billingGroup);
    
    const featuresGroup = document.createElement('div');
    featuresGroup.className = 'form-group';
    const featuresLabel = document.createElement('label');
    featuresLabel.textContent = 'Features';
    const featuresInput = document.createElement('textarea');
    featuresInput.id = 'operator-features-input';
    featuresInput.className = 'form-control';

    let featuresValue = '';
    if (plan && plan.features) {
      try {
        const parsed = JSON.parse(plan.features);
        featuresValue = Array.isArray(parsed) ? parsed.join('\n') : plan.features;
      } catch {
        featuresValue = plan.features;
      }
    }

    featuresInput.value = featuresValue;
    featuresInput.rows = 3;
    featuresInput.placeholder = 'Enter features (comma-separated or line-by-line)';
    featuresGroup.appendChild(featuresLabel);
    featuresGroup.appendChild(featuresInput);
    form.appendChild(featuresGroup);

    
    const statusGroup = document.createElement('div');
    statusGroup.className = 'form-group';
    const statusLabel = document.createElement('label');
    const statusCheckbox = document.createElement('input');
    statusCheckbox.type = 'checkbox';
    statusCheckbox.id = 'operator-status-checkbox';
    statusCheckbox.checked = plan ? plan.status === 'ACTIVE' : true;
    statusLabel.appendChild(statusCheckbox);
    statusLabel.appendChild(document.createTextNode(' Active'));
    statusGroup.appendChild(statusLabel);
    form.appendChild(statusGroup);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'form-actions';

    const leftActions = document.createElement('div');
    leftActions.className = 'form-actions-left';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.closePlanModal();
    });

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = this.isEditMode ? 'Update Plan' : 'Create Plan';
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.savePlan();
    });

    leftActions.appendChild(cancelBtn);
    leftActions.appendChild(saveBtn);
    actionsDiv.appendChild(leftActions);

    if (this.isEditMode) {
      const rightActions = document.createElement('div');
      rightActions.className = 'form-actions-right';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-danger';
      deleteBtn.textContent = 'Delete Plan';
      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.deletePlan(this.currentPlanId);
      });
      rightActions.appendChild(deleteBtn);
      actionsDiv.appendChild(rightActions);
    }

    form.appendChild(actionsDiv);
  },

  async savePlan() {
    const nameInput = document.getElementById('operator-name-input');
    const descInput = document.getElementById('operator-desc-input');
    const serviceTypeSelect = document.getElementById('operator-service-type-select');
    const priceInput = document.getElementById('operator-price-input');
    const billingSelect = document.getElementById('operator-billing-select');
    const featuresInput = document.getElementById('operator-features-input');
    const statusCheckbox = document.getElementById('operator-status-checkbox');
    
    const name = nameInput ? nameInput.value : '';
    const description = descInput ? descInput.value : '';
    const serviceType = serviceTypeSelect ? serviceTypeSelect.value : '';
    const basePrice = priceInput ? priceInput.value : '';
    const billingPeriod = billingSelect ? billingSelect.value : '';
    const features = featuresInput ? featuresInput.value : '';
    const isActive = statusCheckbox ? statusCheckbox.checked : true;
    
    if (!name || !basePrice) {
      const uiController = UIController.getInstance();
      uiController.showMessage('Please fill in all required fields', 'error');
      return;
    }
    
    const saveBtn = document.querySelector('#operator-plan-form button[type="button"]:last-of-type');
    if (!saveBtn) {
      return;
    }
    
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
      let featuresValue = features;
      if (features) {
        // Remove surrounding quotes if they exist
        featuresValue = features.replace(/^["']|["']$/g, '');
      }

      const planData = {
        name: name,
        description: description,
        serviceType: serviceType,
        basePrice: parseFloat(basePrice),
        billingPeriod: billingPeriod,
        features: featuresValue,
        status: isActive ? 'ACTIVE' : 'INACTIVE'
      };

      
      if (isNaN(planData.basePrice)) {
        throw new Error('Base price must be a valid number');
      }
      
      const uiController = UIController.getInstance();
      
      if (this.isEditMode) {
        await apiClient.put(`/plans/${this.currentPlanId}`, planData);
        uiController.showMessage('Plan updated successfully!', 'success');
      } else {
        await apiClient.post('/plans', planData);
        uiController.showMessage('Plan created successfully!', 'success');
      }
      
      this.closePlanModal();
      this.loadPlans();
      
    } catch (error) {
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error saving plan: ${error.message}`, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  },

  async deletePlan(planId) {
    try {
      await apiClient.delete(`/plans/${planId}`);
      
      const uiController = UIController.getInstance();
      uiController.showMessage('Plan deleted successfully!', 'success');
      
      this.closePlanModal();
      this.loadPlans();
      
    } catch (error) {
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error deleting plan: ${error.message}`, 'error');
    }
  },

  closePlanModal() {
    document.getElementById('operator-view').style.display = 'block';
    document.getElementById('operator-edit').style.display = 'none';
    this.currentPlanId = null;
    this.isEditMode = false;
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

window.OperatorSection = OperatorSection;
