const ProfileSection = {
  isEditMode: false,
  isPasswordEditMode: false,
  originalData: {},

  init() {
    console.debug('[ProfileSection] Page initialized');
    
    setTimeout(() => {
      console.debug('[ProfileSection] Starting profile section initialization');
      
      // Load and display user data from backend
      this.loadUserData();
      
      // Attach event listeners
      this.attachEventListeners();
      
      console.debug('[ProfileSection] Profile section initialization complete');
    }, 100);
  },

  async loadUserData() {
    console.debug('[ProfileSection] loadUserData() called');
    
    try {
      // Call backend /profile endpoint
      const response = await apiClient.get('/user/profile');
      console.debug('[ProfileSection] User data fetched from backend:', response);
      
      const user = response;
      
      // Store original data for cancel functionality
      this.originalData = { ...user };
      
      // Display user info in view mode
      this.displayUserInfo(user);
      
      // Populate edit form
      this.populateEditForm(user);
      
    } catch (error) {
      console.error('[ProfileSection] Error loading user data:', error.message);
      this.showError('Failed to load user data');
    }
  },

  displayUserInfo(user) {
    console.debug('[ProfileSection] displayUserInfo() called');
    
    const profileCard = document.getElementById('profile-card');
    profileCard.innerHTML = '';  // Clear existing content
    
    const fields = [
      { label: 'First Name', value: user.firstName },
      { label: 'Last Name', value: user.lastName },
      { label: 'Email', value: user.email },
      { label: 'Status', value: user.isActive ? 'Active' : 'Inactive', className: `status-${user.isActive ? 'active' : 'inactive'}` },
      { label: 'Roles', value: user.roles && user.roles.length > 0 ? user.roles.join(', ') : 'N/A' }
    ];
    
    fields.forEach(field => {
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'section-field';
      
      const label = document.createElement('label');
      label.textContent = field.label;
      
      const value = document.createElement('p');
      value.className = `section-value ${field.className || ''}`;
      value.textContent = field.value || 'N/A';
      
      fieldDiv.appendChild(label);
      fieldDiv.appendChild(value);
      profileCard.appendChild(fieldDiv);
      
      console.debug(`[ProfileSection] ${field.label} displayed:`, field.value);
    });
  },

  populateEditForm(user) {
    console.debug('[ProfileSection] populateEditForm() called');
    
    const profileForm = document.getElementById('profile-form');
    profileForm.innerHTML = '';  // Clear existing content
    
    const editableFields = [
      { id: 'edit-firstName', label: 'First Name', value: user.firstName, type: 'text' },
      { id: 'edit-lastName', label: 'Last Name', value: user.lastName, type: 'text' },
      { id: 'edit-email', label: 'Email', value: user.email, type: 'email' }
    ];
    
    editableFields.forEach(field => {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      
      const label = document.createElement('label');
      label.htmlFor = field.id;
      label.textContent = field.label;
      
      const input = document.createElement('input');
      input.id = field.id;
      input.type = field.type;
      input.value = field.value || '';
      input.required = true;
      
      formGroup.appendChild(label);
      formGroup.appendChild(input);
      profileForm.appendChild(formGroup);
      
      console.debug(`[ProfileSection] ${field.label} input created:`, field.value);
    });
    
    // Add button group
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'form-group button-group';
    
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Save Changes';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.id = 'profile-cancel-btn';
    cancelBtn.textContent = 'Cancel';
    
    buttonGroup.appendChild(submitBtn);
    buttonGroup.appendChild(cancelBtn);
    profileForm.appendChild(buttonGroup);
    
    // Re-attach cancel button listener
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.debug('[ProfileSection] Cancel button clicked');
      this.toggleEditMode(false);
    });
  },

  // ← NEW: Populate password change form
  populatePasswordForm() {
    console.debug('[ProfileSection] populatePasswordForm() called');
    
    const passwordForm = document.getElementById('password-form');
    passwordForm.innerHTML = '';  // Clear existing content
    
    const passwordFields = [
      { id: 'current-password', label: 'Current Password', type: 'password' },
      { id: 'new-password', label: 'New Password', type: 'password' },
      { id: 'confirm-password', label: 'Confirm Password', type: 'password' }
    ];
    
    passwordFields.forEach(field => {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      
      const label = document.createElement('label');
      label.htmlFor = field.id;
      label.textContent = field.label;
      
      const input = document.createElement('input');
      input.id = field.id;
      input.type = field.type;
      input.required = true;
      input.autocomplete = field.id === 'current-password' ? 'current-password' : 'new-password';
      
      formGroup.appendChild(label);
      formGroup.appendChild(input);
      
      // ← ADD THIS: Real-time validation for new password
      if (field.id === 'new-password') {
        input.addEventListener('input', (e) => {
          const strengthCheck = this.validatePasswordStrength(e.target.value);
          
          console.debug('[ProfileSection] Password strength:', strengthCheck);
          
          // Remove existing helper text if it exists
          let existingHelper = document.getElementById('password-strength-helper');
          if (existingHelper) {
            existingHelper.remove();
          }
          
          // Show helper text if user has typed something
          if (e.target.value.length > 0) {
            const helperText = document.createElement('small');
            helperText.id = 'password-strength-helper';
            helperText.style.color = strengthCheck.isValid ? 'green' : 'orange';
            helperText.style.display = 'block';
            helperText.style.marginTop = '4px';
            helperText.style.fontSize = '12px';
            helperText.textContent = strengthCheck.message;
            formGroup.appendChild(helperText);
          }
        });
      }
      
      passwordForm.appendChild(formGroup);
      
      console.debug(`[ProfileSection] ${field.label} input created`);
    });
    
    // Add button group
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'form-group button-group';
    
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Change Password';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.id = 'password-cancel-btn';
    cancelBtn.textContent = 'Cancel';
    
    buttonGroup.appendChild(submitBtn);
    buttonGroup.appendChild(cancelBtn);
    passwordForm.appendChild(buttonGroup);
    
    // Re-attach cancel button listener
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.debug('[ProfileSection] Password cancel button clicked');
      this.togglePasswordEditMode(false);
    });
  },


  attachEventListeners() {
    console.debug('[ProfileSection] attachEventListeners() called');
    
    // Edit Profile button
    const editBtn = document.getElementById('profile-edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.debug('[ProfileSection] Edit button clicked');
        this.toggleEditMode(true);
      });
      console.debug('[ProfileSection] Edit button listener attached');
    }

    // Change Password button
    const passwordChangeBtn = document.getElementById('password-change-btn');
    if (passwordChangeBtn) {
      passwordChangeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.debug('[ProfileSection] Change password button clicked');
        this.togglePasswordEditMode(true);
      });
      console.debug('[ProfileSection] Change password button listener attached');
    }

    // Profile Form submit
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.debug('[ProfileSection] Profile form submitted');
        this.handleProfileSubmit(e);
      });
      console.debug('[ProfileSection] Profile form submit listener attached');
    }

    // Password Form submit
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.debug('[ProfileSection] Password form submitted');
        this.handlePasswordSubmit(e);
      });
      console.debug('[ProfileSection] Password form submit listener attached');
    }
  },

  toggleEditMode(isEdit) {
    console.debug('[ProfileSection] toggleEditMode() called with:', isEdit);
    
    const viewMode = document.getElementById('profile-view');
    const editMode = document.getElementById('profile-edit');
    const editBtn = document.getElementById('profile-edit-btn');
    const passwordChangeBtn = document.getElementById('password-change-btn');

    if (isEdit) {
      console.debug('[ProfileSection] Switching to profile edit mode');
      viewMode.style.display = 'none';
      editMode.style.display = 'block';
      editBtn.style.display = 'none';
      passwordChangeBtn.style.display = 'none';
      this.isEditMode = true;
    } else {
      console.debug('[ProfileSection] Switching to profile view mode');
      viewMode.style.display = 'block';
      editMode.style.display = 'none';
      editBtn.style.display = 'inline-block';
      passwordChangeBtn.style.display = 'inline-block';
      this.isEditMode = false;
      
      // Reset form to original data
      this.populateEditForm(this.originalData);
    }
  },

  // ← NEW: Toggle password edit mode
  togglePasswordEditMode(isEdit) {
    console.debug('[ProfileSection] togglePasswordEditMode() called with:', isEdit);
    
    const viewMode = document.getElementById('profile-view');
    const passwordEditMode = document.getElementById('password-edit');
    const editBtn = document.getElementById('profile-edit-btn');
    const passwordChangeBtn = document.getElementById('password-change-btn');

    if (isEdit) {
      console.debug('[ProfileSection] Switching to password edit mode');
      viewMode.style.display = 'none';
      passwordEditMode.style.display = 'block';
      editBtn.style.display = 'none';
      passwordChangeBtn.style.display = 'none';
      this.isPasswordEditMode = true;
      
      // Populate password form
      this.populatePasswordForm();
    } else {
      console.debug('[ProfileSection] Switching to password view mode');
      viewMode.style.display = 'block';
      passwordEditMode.style.display = 'none';
      editBtn.style.display = 'inline-block';
      passwordChangeBtn.style.display = 'inline-block';
      this.isPasswordEditMode = false;
      
      // Clear password form
      document.getElementById('password-form').innerHTML = '';
    }
  },

  async handleProfileSubmit(e) {
    console.debug('[ProfileSection] handleProfileSubmit() called');
    
    const firstNameInput = document.getElementById('edit-firstName');
    const lastNameInput = document.getElementById('edit-lastName');
    const emailInput = document.getElementById('edit-email');
    const submitBtn = document.querySelector('#profile-form button[type="submit"]');

    // Validate inputs
    if (!firstNameInput.value.trim()) {
      console.error('[ProfileSection] First name is empty');
      this.showError('First name is required');
      return;
    }

    if (!lastNameInput.value.trim()) {
      console.error('[ProfileSection] Last name is empty');
      this.showError('Last name is required');
      return;
    }

    if (!emailInput.value.trim()) {
      console.error('[ProfileSection] Email is empty');
      this.showError('Email is required');
      return;
    }

    // Prepare update data
    const updateData = {
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      email: emailInput.value.trim()
    };

    console.debug('[ProfileSection] Preparing to update profile with:', updateData);

    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      console.debug('[ProfileSection] Calling API to update profile');
      
      const response = await apiClient.put('/user/profile', updateData);
      console.debug('[ProfileSection] Profile update successful:', response);

      this.showSuccess('Profile updated successfully');

      setTimeout(() => {
        this.loadUserData();
        this.toggleEditMode(false);
      }, 1000);

    } catch (error) {
      console.error('[ProfileSection] Profile update failed:', {
        message: error.message,
        status: error.status
      });

      let errorMessage = 'Failed to update profile';
      if (error.message) {
        errorMessage = error.message;
      }

      this.showError(errorMessage);

    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  // ← NEW: Handle password form submission
  async handlePasswordSubmit(e) {
    console.debug('[ProfileSection] handlePasswordSubmit() called');
    
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const submitBtn = document.querySelector('#password-form button[type="submit"]');

    // Validate inputs
    if (!currentPasswordInput.value.trim()) {
      console.error('[ProfileSection] Current password is empty');
      this.showError('Current password is required');
      return;
    }

    if (!newPasswordInput.value.trim()) {
      console.error('[ProfileSection] New password is empty');
      this.showError('New password is required');
      return;
    }

    if (!confirmPasswordInput.value.trim()) {
      console.error('[ProfileSection] Confirm password is empty');
      this.showError('Please confirm your new password');
      return;
    }

    // Validate passwords match
    if (newPasswordInput.value !== confirmPasswordInput.value) {
      console.error('[ProfileSection] Passwords do not match');
      this.showError('New passwords do not match');
      return;
    }

    // ← ADD THIS: Validate password strength
    const passwordStrengthCheck = this.validatePasswordStrength(newPasswordInput.value);
    if (!passwordStrengthCheck.isValid) {
      console.error('[ProfileSection] Password does not meet strength requirements');
      this.showError(passwordStrengthCheck.message);
      return;
    }

    // Prepare password change data
    const passwordData = {
      oldPassword: currentPasswordInput.value,
      newPassword: newPasswordInput.value
    };

    console.debug('[ProfileSection] Preparing to change password');

    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Changing...';

    try {
      console.debug('[ProfileSection] Calling API to change password');
      
      const response = await apiClient.post('/auth/change-password', passwordData);
      console.debug('[ProfileSection] Password change successful:', response);

      this.showSuccess('Password changed successfully');

      setTimeout(() => {
        this.togglePasswordEditMode(false);
      }, 1000);

    } catch (error) {
      console.error('[ProfileSection] Password change failed:', {
        message: error.message,
        status: error.status
      });

      let errorMessage = 'Failed to change password';
      if (error.message) {
        errorMessage = error.message;
      }

      this.showError(errorMessage);

    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },


  showError(message) {
    console.debug('[ProfileSection] showError() called:', message);
    const uiController = UIController.getInstance();
    uiController.showMessage(message, 'error');
  },

  showSuccess(message) {
    console.debug('[ProfileSection] showSuccess() called:', message);
    const uiController = UIController.getInstance();
    uiController.showMessage(message, 'success');
  },

  cleanup() {
    console.debug('[ProfileSection] cleanup() called');
    this.isEditMode = false;
    this.isPasswordEditMode = false;
  },

  validatePasswordStrength(password) {
    console.debug('[ProfileSection] validatePasswordStrength() called');
    
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password)
    };
    
    const allMet = Object.values(requirements).every(req => req === true);
    
    return {
      isValid: allMet,
      requirements: requirements,
      message: this.getPasswordStrengthMessage(requirements)
    };
  },

  getPasswordStrengthMessage(requirements) {
    const missing = [];
    
    if (!requirements.minLength) missing.push('at least 8 characters');
    if (!requirements.hasUppercase) missing.push('one uppercase letter');
    if (!requirements.hasLowercase) missing.push('one lowercase letter');
    if (!requirements.hasDigit) missing.push('one digit');
    if (!requirements.hasSpecialChar) missing.push('one special character (@$!%*?&)');
    
    if (missing.length === 0) {
      return 'Password is strong';
    }
    
    return `Password must contain: ${missing.join(', ')}`;
  }

};

window.ProfileSection = ProfileSection;
