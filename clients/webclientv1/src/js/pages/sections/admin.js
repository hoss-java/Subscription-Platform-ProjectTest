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
    console.log('attachEventListeners called');
    document.getElementById('admin-refresh-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadUsers();
    });
  },

  async loadAvailableRoles() {
    try {
      this.availableRoles = await apiClient.get('/admin/roles');
    } catch (error) {
      UIController.getInstance().showMessage(`Error loading roles: ${error.message}`, 'error');
      this.availableRoles = [];
    }
  },

  async loadUsers() {
    const container = document.getElementById('admin-users-container');
    
    if (!container) {
      return;
    }
    
    container.innerHTML = '<p class="loading-message">Loading users...</p>';
    
    try {
      const response = await apiClient.get('/admin/users');
      
      this.users = Array.isArray(response) ? response : response.users || response.data || [];
      
      container.innerHTML = this.users.length 
        ? '' 
        : '<p class="empty-message">No users found</p>';
      
      if (this.users.length) {
        this.renderUsers();
      }
    } catch (error) {
      container.innerHTML = `<p class="error-message">Error loading users: ${error.message}</p>`;
      UIController.getInstance().showMessage(`Error loading users: ${error.message}`, 'error');
    }
  },

  renderUsers() {
    const columns = [
      { header: 'Username', key: 'username', formatter: (val) => this.escapeHtml(val) },
      { header: 'Email', key: 'email', formatter: (val) => this.escapeHtml(val) },
      { header: 'Full Name', key: 'fullName', formatter: (val) => this.escapeHtml(val || 'N/A') },
      { header: 'Role', key: 'roles', formatter: (val) => val[0]?.replace('ROLE_', '') || 'N/A' },
      { header: 'Status', key: 'active', formatter: (val) => `<span class="badge badge-${val ? 'success' : 'danger'}">${val ? 'Active' : 'Inactive'}</span>` },
      { header: 'Created', key: 'createdAt', formatter: (val) => new Date(val).toLocaleDateString() },
      { header: 'Actions', key: 'id', formatter: (userId) => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-primary';
        btn.textContent = 'Edit';
        btn.onclick = (e) => {
          e.preventDefault();
          this.openUserModal(userId);
        };
        return btn;
      }}
    ];

    const table = document.createElement('table');
    table.className = 'admin-users-table';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>${columns.map(col => `<th>${col.header}</th>`).join('')}</tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    this.users.forEach(user => {
      const row = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        const formatted = col.formatter(user[col.key]);
        typeof formatted === 'string' ? td.innerHTML = formatted : td.appendChild(formatted);
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    document.getElementById('admin-users-container').innerHTML = '';
    document.getElementById('admin-users-container').appendChild(table);
  },

  openUserModal(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    
    this.currentUserId = userId;
    document.getElementById('admin-view').style.display = 'none';
    document.getElementById('admin-edit').style.display = 'block';
    this.generateUserForm(user);
  },

  generateUserForm(user) {
    const form = document.getElementById('admin-user-form');
    form.innerHTML = '';

    const fields = [
      { name: 'username', label: 'Username', type: 'text', value: user.username, disabled: true },
      { name: 'email', label: 'Email', type: 'email', value: user.email, disabled: true },
      { name: 'fullName', label: 'Full Name', type: 'text', value: user.fullName || '', disabled: true },
    ];

    fields.forEach(field => {
      const group = document.createElement('div');
      group.className = 'form-group';
      group.innerHTML = `<label>${field.label}</label>`;
      const input = document.createElement('input');
      Object.assign(input, { type: field.type, className: 'form-control', value: field.value, disabled: field.disabled });
      group.appendChild(input);
      form.appendChild(group);
    });

    this.createRoleDropdown(form, user);
    this.createActiveCheckbox(form, user);
    this.createFormActions(form);
  },

  createRoleDropdown(form, user) {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = '<label>Role</label>';
    
    const select = document.createElement('select');
    select.id = 'admin-role-select';
    select.className = 'form-control';

    if (this.availableRoles.length) {
      this.availableRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.value;
        option.textContent = role.label;
        select.appendChild(option);
      });
      select.value = user.roles[0]?.toUpperCase() || 'ROLE_CUSTOMER';
    } else {
      select.innerHTML = '<option disabled>Loading roles...</option>';
      select.disabled = true;
    }
    
    group.appendChild(select);
    form.appendChild(group);
  },

  createActiveCheckbox(form, user) {
    const group = document.createElement('div');
    group.className = 'form-group';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'admin-active-checkbox';
    checkbox.checked = user.active;
    const label = document.createElement('label');
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' Active'));
    group.appendChild(label);
    form.appendChild(group);
  },

  createFormActions(form) {
    const div = document.createElement('div');
    div.className = 'form-actions';
    
    [
      { text: 'Cancel', class: 'btn btn-secondary', callback: () => this.closeUserModal() },
      { text: 'Save Changes', class: 'btn btn-primary', callback: () => this.saveUserChanges() }
    ].forEach(btnConfig => {
      const btn = document.createElement('button');
      Object.assign(btn, { type: 'button', className: btnConfig.class, textContent: btnConfig.text });
      btn.onclick = (e) => {
        e.preventDefault();
        btnConfig.callback();
      };
      div.appendChild(btn);
    });
    
    form.appendChild(div);
  },

  async saveUserChanges() {
    if (!this.currentUserId) return;
    
    const saveBtn = document.querySelector('#admin-user-form button[type="button"]:last-of-type');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
      await apiClient.put(`/admin/users/${this.currentUserId}`, {
        role: document.getElementById('admin-role-select').value,
        active: document.getElementById('admin-active-checkbox').checked
      });
      
      UIController.getInstance().showMessage('User updated successfully!', 'success');
      this.closeUserModal();
      this.loadUsers();
    } catch (error) {
      UIController.getInstance().showMessage(`Error saving changes: ${error.message}`, 'error');
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
  }
};

window.AdminSection = AdminSection;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminSection;
}