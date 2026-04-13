const ProfileSection = {
  isEditMode: false,
  isPasswordEditMode: false,
  originalData: {},
  _domCache: {},

  init() {
    setTimeout(() => {
      this.loadUserData();
      this.attachEventListeners();
    }, 100);
  },

  async loadUserData() {
    try {
      const response = await apiClient.get('/user/profile');
      this.originalData = { ...response };
      this.displayUserInfo(response);
      this.populateEditForm(response);
    } catch (error) {
      this.showError('Failed to load user data');
    }
  },

  displayUserInfo(user) {
    const fields = [
      { label: 'First Name', value: user.firstName },
      { label: 'Last Name', value: user.lastName },
      { label: 'Email', value: user.email },
      { label: 'Status', value: user.isActive ? 'Active' : 'Inactive', className: `status-${user.isActive ? 'active' : 'inactive'}` },
      { label: 'Roles', value: user.roles?.length > 0 ? user.roles.join(', ') : 'N/A' }
    ];
    
    const fragment = document.createDocumentFragment();
    fields.forEach(({ label, value, className }) => {
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'section-field';
      fieldDiv.innerHTML = `<label>${label}</label><p class="section-value ${className || ''}">${value || 'N/A'}</p>`;
      fragment.appendChild(fieldDiv);
    });
    
    this.getElement('profile-card').innerHTML = '';
    this.getElement('profile-card').appendChild(fragment);
  },

  populateEditForm(user) {
    const fields = [
      { id: 'edit-firstName', label: 'First Name', value: user.firstName, type: 'text' },
      { id: 'edit-lastName', label: 'Last Name', value: user.lastName, type: 'text' },
      { id: 'edit-email', label: 'Email', value: user.email, type: 'email' }
    ];
    
    const fragment = document.createDocumentFragment();
    fields.forEach(field => fragment.appendChild(this.createFormGroup(field.id, field.label, field.type, field.value)));
    fragment.appendChild(this.createButtonGroup('Save Changes', 'profile-cancel-btn', 'Cancel', () => this.toggleEditMode(false)));
    
    this.getElement('profile-form').innerHTML = '';
    this.getElement('profile-form').appendChild(fragment);
  },

  populatePasswordForm() {
    const fields = [
      { id: 'current-password', label: 'Current Password', type: 'password', autocomplete: 'current-password' },
      { id: 'new-password', label: 'New Password', type: 'password', autocomplete: 'new-password' },
      { id: 'confirm-password', label: 'Confirm Password', type: 'password', autocomplete: 'new-password' }
    ];
    
    const fragment = document.createDocumentFragment();
    fields.forEach(field => {
      const formGroup = this.createFormGroup(field.id, field.label, field.type);
      const input = formGroup.querySelector('input');
      input.autocomplete = field.autocomplete;
      if (field.id === 'new-password') {
        input.addEventListener('input', (e) => this.handlePasswordStrengthInput(e, formGroup));
      }
      fragment.appendChild(formGroup);
    });
    
    fragment.appendChild(this.createButtonGroup('Change Password', 'password-cancel-btn', 'Cancel', () => this.togglePasswordEditMode(false)));
    this.getElement('password-form').innerHTML = '';
    this.getElement('password-form').appendChild(fragment);
  },

  handlePasswordStrengthInput(e, formGroup) {
    const strengthCheck = this.validatePasswordStrength(e.target.value);
    const existingHelper = formGroup.querySelector('#password-strength-helper');
    if (existingHelper) existingHelper.remove();
    
    if (e.target.value.length > 0) {
      const helperText = document.createElement('small');
      helperText.id = 'password-strength-helper';
      helperText.style.cssText = `color: ${strengthCheck.isValid ? 'green' : 'orange'}; display: block; margin-top: 4px; font-size: 12px;`;
      helperText.textContent = strengthCheck.message;
      formGroup.appendChild(helperText);
    }
  },

  createFormGroup(id, label, type, value = '') {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    formGroup.innerHTML = `<label for="${id}">${label}</label><input id="${id}" type="${type}" value="${value}" required>`;
    return formGroup;
  },

  createButtonGroup(submitText, cancelId, cancelText, cancelCallback) {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'form-group button-group';
    buttonGroup.innerHTML = `<button type="submit">${submitText}</button><button type="button" id="${cancelId}">${cancelText}</button>`;
    buttonGroup.querySelector(`#${cancelId}`).addEventListener('click', (e) => {
      e.preventDefault();
      cancelCallback();
    });
    return buttonGroup;
  },

  attachEventListeners() {
    const listeners = [
      { id: 'profile-edit-btn', event: 'click', handler: () => this.toggleEditMode(true) },
      { id: 'password-change-btn', event: 'click', handler: () => this.togglePasswordEditMode(true) },
      { id: 'profile-form', event: 'submit', handler: (e) => this.handleProfileSubmit(e) },
      { id: 'password-form', event: 'submit', handler: (e) => this.handlePasswordSubmit(e) }
    ];
    
    listeners.forEach(({ id, event, handler }) => {
      const element = this.getElement(id, false);
      if (element) {
        element.addEventListener(event, (e) => {
          if (event === 'submit') e.preventDefault();
          handler(e);
        });
      }
    });
  },

  toggleEditMode(isEdit) {
    this.toggleMode('profile-view', 'profile-edit', isEdit, 'isEditMode');
    if (!isEdit) this.populateEditForm(this.originalData);
  },

  togglePasswordEditMode(isEdit) {
    this.toggleMode('profile-view', 'password-edit', isEdit, 'isPasswordEditMode');
    this.getElement('password-form').innerHTML = isEdit ? '' : '';
    if (isEdit) this.populatePasswordForm();
  },

  toggleMode(viewId, editId, isEdit, stateKey) {
    const displayStyle = isEdit ? 'none' : 'block';
    const editDisplayStyle = isEdit ? 'block' : 'none';
    const btnDisplayStyle = isEdit ? 'none' : 'inline-block';
    
    this.getElement(viewId).style.display = displayStyle;
    this.getElement(editId).style.display = editDisplayStyle;
    ['profile-edit-btn', 'password-change-btn'].forEach(id => {
      this.getElement(id).style.display = btnDisplayStyle;
    });
    
    this[stateKey] = isEdit;
  },

  async handleProfileSubmit(e) {
    const [firstName, lastName, email] = ['edit-firstName', 'edit-lastName', 'edit-email'].map(id => this.getElement(id).value);
    
    if (!this.validateFormInputs([
      { value: firstName, message: 'First name is required' },
      { value: lastName, message: 'Last name is required' },
      { value: email, message: 'Email is required' }
    ])) return;

    await this.handleAsyncAction(
      () => apiClient.put('/user/profile', { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() }),
      this.getElement('profile-form').querySelector('button[type="submit"]'),
      'Saving...',
      'Profile updated successfully',
      () => { this.loadUserData(); this.toggleEditMode(false); }
    );
  },

  async handlePasswordSubmit(e) {
    const [currentPass, newPass, confirmPass] = ['current-password', 'new-password', 'confirm-password'].map(id => this.getElement(id).value);
    
    if (!this.validateFormInputs([
      { value: currentPass, message: 'Current password is required' },
      { value: newPass, message: 'New password is required' },
      { value: confirmPass, message: 'Please confirm your new password' }
    ])) return;

    if (newPass !== confirmPass) {
      this.showError('New passwords do not match');
      return;
    }

    const strengthCheck = this.validatePasswordStrength(newPass);
    if (!strengthCheck.isValid) {
      this.showError(strengthCheck.message);
      return;
    }

    await this.handleAsyncAction(
      () => apiClient.post('/auth/change-password', { oldPassword: currentPass, newPassword: newPass }),
      this.getElement('password-form').querySelector('button[type="submit"]'),
      'Changing...',
      'Password changed successfully',
      () => this.togglePasswordEditMode(false)
    );
  },

  async handleAsyncAction(apiCall, submitBtn, loadingText, successMessage, onSuccess) {
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = loadingText;

    try {
      await apiCall();
      this.showSuccess(successMessage);
      setTimeout(onSuccess, 1000);
    } catch (error) {
      this.showError(error.message || 'Operation failed');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  validateFormInputs(inputs) {
    return inputs.every(input => {
      if (!input.value.trim()) {
        this.showError(input.message);
        return false;
      }
      return true;
    });
  },

  validatePasswordStrength(password) {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password)
    };
    
    return {
      isValid: Object.values(requirements).every(req => req),
      requirements,
      message: this.getPasswordStrengthMessage(requirements)
    };
  },

  getPasswordStrengthMessage(requirements) {
    const missing = [];
    const checks = [
      [requirements.minLength, 'at least 8 characters'],
      [requirements.hasUppercase, 'one uppercase letter'],
      [requirements.hasLowercase, 'one lowercase letter'],
      [requirements.hasDigit, 'one digit'],
      [requirements.hasSpecialChar, 'one special character (@$!%*?&)']
    ];
    
    checks.forEach(([met, text]) => !met && missing.push(text));
    return missing.length === 0 ? 'Password is strong' : `Password must contain: ${missing.join(', ')}`;
  },

  getElement(id, throwError = true) {
    if (!this._domCache[id]) {
      this._domCache[id] = document.getElementById(id);
      if (!this._domCache[id] && throwError) console.warn(`Element with id "${id}" not found`);
    }
    return this._domCache[id];
  },

  showError(message) {
    UIController.getInstance().showMessage(message, 'error');
  },

  showSuccess(message) {
    UIController.getInstance().showMessage(message, 'success');
  },

  cleanup() {
    this.isEditMode = false;
    this.isPasswordEditMode = false;
    this._domCache = {};
  }
};

window.ProfileSection = ProfileSection;

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfileSection;
}