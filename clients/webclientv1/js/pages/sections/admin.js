const AdminSection = {
  currentUserId: null,
  users: [],
  availableRoles: [],

  init() {
    setTimeout(() => {
      this.attachEventListeners();
      this.loadAvailableRoles();
      this.loadUsers();
    }, 100);
  },

  attachEventListeners() {
    const refreshBtn = document.getElementById('admin-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadUsers();
      });
    }
  },

  async loadAvailableRoles() {
    try {
      this.availableRoles = await apiClient.get('/admin/roles');
    } catch (error) {
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error loading roles: ${error.message}`, 'error');
      this.availableRoles = [];
    }
  },

  async loadUsers() {
    const container = document.getElementById('admin-users-container');
    container.innerHTML = '<p class="loading-message">Loading users...</p>';
    
    try {
      const response = await apiClient.get('/admin/users');
      
      let users = [];
      
      if (Array.isArray(response)) {
        users = response;
      } else if (response.users && Array.isArray(response.users)) {
        users = response.users;
      } else if (response.data && Array.isArray(response.data)) {
        users = response.data;
      } else {
        users = [];
      }
      
      this.users = users;
      
      if (this.users.length === 0) {
        container.innerHTML = '<p class="empty-message">No users found</p>';
      } else {
        this.renderUsers();
      }
      
    } catch (error) {
      container.innerHTML = `<p class="error-message">Error loading users: ${error.message}</p>`;
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error loading users: ${error.message}`, 'error');
    }
  },

  renderUsers() {
    const container = document.getElementById('admin-users-container');
    const table = document.createElement('table');
    table.className = 'admin-users-table';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Username', 'Email', 'Full Name', 'Role', 'Status', 'Created', 'Actions'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
    this.users.forEach(user => {
      const row = document.createElement('tr');
      
      const createdDate = new Date(user.createdAt).toLocaleDateString();
      const roleDisplay = user.roles[0]?.replace('ROLE_', '') || 'N/A';
      const statusClass = user.active ? 'badge-success' : 'badge-danger';
      const statusText = user.active ? 'Active' : 'Inactive';
      
      const usernameCell = document.createElement('td');
      usernameCell.textContent = this.escapeHtml(user.username);
      row.appendChild(usernameCell);
      
      const emailCell = document.createElement('td');
      emailCell.textContent = this.escapeHtml(user.email);
      row.appendChild(emailCell);
      
      const fullNameCell = document.createElement('td');
      fullNameCell.textContent = this.escapeHtml(user.fullName || 'N/A');
      row.appendChild(fullNameCell);
      
      const roleCell = document.createElement('td');
      roleCell.textContent = roleDisplay;
      row.appendChild(roleCell);
      
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `badge ${statusClass}`;
      statusBadge.textContent = statusText;
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);
      
      const createdCell = document.createElement('td');
      createdCell.textContent = createdDate;
      row.appendChild(createdCell);
      
      const actionsCell = document.createElement('td');
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-sm btn-primary';
      editBtn.textContent = 'Edit';
      editBtn.dataset.userId = user.id;
      editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openUserModal(user.id);
      });
      actionsCell.appendChild(editBtn);
      row.appendChild(actionsCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
  },

  openUserModal(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return;
    }
    
    this.currentUserId = userId;
    document.getElementById('admin-view').style.display = 'none';
    document.getElementById('admin-edit').style.display = 'block';
    this.generateUserForm(user);
  },

  generateUserForm(user) {
    const form = document.getElementById('admin-user-form');
    form.innerHTML = '';
    
    const usernameGroup = document.createElement('div');
    usernameGroup.className = 'form-group';
    const usernameLabel = document.createElement('label');
    usernameLabel.textContent = 'Username';
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.className = 'form-control';
    usernameInput.value = user.username;
    usernameInput.disabled = true;
    usernameGroup.appendChild(usernameLabel);
    usernameGroup.appendChild(usernameInput);
    form.appendChild(usernameGroup);
    
    const emailGroup = document.createElement('div');
    emailGroup.className = 'form-group';
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.className = 'form-control';
    emailInput.value = user.email;
    emailInput.disabled = true;
    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    form.appendChild(emailGroup);
    
    const fullNameGroup = document.createElement('div');
    fullNameGroup.className = 'form-group';
    const fullNameLabel = document.createElement('label');
    fullNameLabel.textContent = 'Full Name';
    const fullNameInput = document.createElement('input');
    fullNameInput.type = 'text';
    fullNameInput.className = 'form-control';
    fullNameInput.value = user.fullName || '';
    fullNameInput.disabled = true;
    fullNameGroup.appendChild(fullNameLabel);
    fullNameGroup.appendChild(fullNameInput);
    form.appendChild(fullNameGroup);
    
    // ROLE DROPDOWN - NOW DYNAMIC
    const roleGroup = document.createElement('div');
    roleGroup.className = 'form-group';
    const roleLabel = document.createElement('label');
    roleLabel.textContent = 'Role';
    const roleSelect = document.createElement('select');
    roleSelect.id = 'admin-role-select';
    roleSelect.className = 'form-control';
    
    if (this.availableRoles.length > 0) {
      this.availableRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.value;
        option.textContent = role.label;
        roleSelect.appendChild(option);
      });

      // Normalize user's current role to uppercase for matching
      const userCurrentRole = user.roles[0]?.toUpperCase() || 'ROLE_CUSTOMER';
      roleSelect.value = userCurrentRole;
    } else {
      // Fallback if roles failed to load
      const option = document.createElement('option');
      option.textContent = 'Loading roles...';
      option.disabled = true;
      roleSelect.appendChild(option);
      roleSelect.disabled = true;
    }
    
    roleGroup.appendChild(roleLabel);
    roleGroup.appendChild(roleSelect);
    form.appendChild(roleGroup);
    
    const activeGroup = document.createElement('div');
    activeGroup.className = 'form-group';
    const activeLabel = document.createElement('label');
    const activeCheckbox = document.createElement('input');
    activeCheckbox.type = 'checkbox';
    activeCheckbox.id = 'admin-active-checkbox';
    activeCheckbox.checked = user.active;
    activeLabel.appendChild(activeCheckbox);
    activeLabel.appendChild(document.createTextNode(' Active'));
    activeGroup.appendChild(activeLabel);
    form.appendChild(activeGroup);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'form-actions';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeUserModal();
    });
    
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Save Changes';
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.saveUserChanges();
    });
    
    actionsDiv.appendChild(cancelBtn);
    actionsDiv.appendChild(saveBtn);
    form.appendChild(actionsDiv);
  },

  async saveUserChanges() {
    if (!this.currentUserId) return;
    
    const newRole = document.getElementById('admin-role-select').value;
    const newActive = document.getElementById('admin-active-checkbox').checked;
    const saveBtn = document.querySelector('#admin-user-form button[type="button"]:last-of-type');
    
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
      const updateData = {
        role: newRole,
        active: newActive
      };
      
      const response = await apiClient.put(`/admin/users/${this.currentUserId}`, updateData);
      
      const uiController = UIController.getInstance();
      uiController.showMessage('User updated successfully!', 'success');
      
      this.closeUserModal();
      this.loadUsers();
      
    } catch (error) {
      const uiController = UIController.getInstance();
      uiController.showMessage(`Error saving changes: ${error.message}`, 'error');
      
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  },

  closeUserModal() {
    document.getElementById('admin-view').style.display = 'block';
    document.getElementById('admin-edit').style.display = 'none';
    this.currentUserId = null;
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

window.AdminSection = AdminSection;
