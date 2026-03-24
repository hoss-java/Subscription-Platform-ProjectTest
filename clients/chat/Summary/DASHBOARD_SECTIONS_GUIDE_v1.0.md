# Dashboard Sections System - Complete Summary & Reference Guide

## 🎯 Quick Overview
Your dashboard uses a **modular, role-based section system** where each section is a self-contained component loaded dynamically into the dashboard. Sections are configured in `config.json`, managed by `DashboardSectionManager`, and displayed through `DashboardPage`.

---

## 📋 Architecture Flow

```
config.json (defines sections)
    ↓
DashboardPage.init()
    ↓
DashboardSectionManager.initialize(sectionsConfig)
    ↓
DashboardPage.buildSidebarNav() → filters by user role
    ↓
User clicks section in sidebar
    ↓
DashboardPage.loadSection(sectionName)
    ↓
DashboardSectionManager.loadSection()
    ├─ Check access (role-based)
    ├─ Load HTML from file
    ├─ Insert into #section-container
    ├─ Update #section-title
    └─ Call section script's init()
    ↓
Section script runs (e.g., ProfileSection.init())
    ↓
User interacts with section
    ↓
On section change: DashboardSectionManager.cleanupSection() → new section loads
```

---

## 🔧 How Sections Work

### Section Configuration (in `config.json`)
```json
{
  "name": "profile",              // unique identifier
  "path": "pages/sections/profile.html",  // HTML file location
  "title": "Profile",             // display name in sidebar
  "script": "ProfileSection",     // window object name (JS file exports this)
  "icon": "user",                 // icon class (optional)
  "roles": ["user", "admin"]      // who can access (role-based filtering)
}
```

### Section File Structure
Each section needs **2 files**:

| File | Purpose |
|------|---------|
| `pages/sections/[name].html` | HTML markup for section UI |
| `js/pages/sections/[name].js` | JavaScript logic (must export to `window`) |

### Section JavaScript Pattern
```javascript
const SectionName = {
  // State variables
  isEditMode: false,
  originalData: {},

  // Required: Called when section loads
  init() {
    console.debug('[SectionName] Page initialized');
    
    setTimeout(() => {
      // 1. Load data
      this.loadData();
      
      // 2. Attach event listeners
      this.attachEventListeners();
      
      console.debug('[SectionName] Initialization complete');
    }, 100);
  },

  // Optional: Called when section unloads (cleanup)
  cleanup() {
    console.debug('[SectionName] cleanup() called');
    // Reset state, remove listeners, etc.
  },

  // Load data from localStorage or API
  loadData() {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) throw new Error('Data not found');
      
      const data = JSON.parse(userData);
      // Display data, populate forms, etc.
    } catch (error) {
      this.showError('Failed to load data');
    }
  },

  // Attach all event listeners
  attachEventListeners() {
    const btn = document.getElementById('section-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleAction();
      });
    }
  },

  // Handle form submission or API calls
  async handleFormSubmit(e) {
    e.preventDefault();
    
    const btn = document.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Loading...';

    try {
      // Validate data
      // Call API via apiClient
      const response = await apiClient.put('/endpoint', { data });
      
      // Update localStorage if needed
      // Show success message
      this.showSuccess('Action completed');
      
      // Reload data or switch mode
      this.loadData();
      
    } catch (error) {
      this.showError(error.message || 'Action failed');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  },

  // Show error toast
  showError(message) {
    const uiController = UIController.getInstance();
    uiController.showMessage(message, 'error');
  },

  // Show success toast
  showSuccess(message) {
    const uiController = UIController.getInstance();
    uiController.showMessage(message, 'success');
  }
};

// CRITICAL: Export to window with exact name from config.json
window.SectionName = SectionName;
```

### Section HTML Pattern
```html
<div class="section-container">
  <div class="section-content">
    
    <!-- Section Header -->
    <div class="section-header">
      <h3>Section Title</h3>
      <button id="section-action-btn" class="btn btn-primary">Action</button>
    </div>

    <!-- View Mode (default) -->
    <div id="section-view" class="section-view">
      <div class="section-card">
        <div class="section-field">
          <label>Field Name</label>
          <p id="field-id" class="section-value">Value here</p>
        </div>
      </div>
    </div>

    <!-- Edit Mode (optional, hidden by default) -->
    <div id="section-edit" class="section-edit" style="display: none;">
      <form id="section-form" class="section-form">
        <div class="form-group">
          <label for="edit-field">Field Name</label>
          <input type="text" id="edit-field" name="field" required>
        </div>
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" id="section-cancel-btn" class="btn btn-secondary">Cancel</button>
      </form>
    </div>

  </div>
</div>
```

---

## 🔐 Role-Based Access Control

### How It Works
1. User role stored in `localStorage.user_data.role` (e.g., "user" or "admin")
2. Each section has `roles: [...]` array in config
3. `DashboardSectionManager.getAccessibleSections(userRole)` filters sections
4. Only matching sections appear in sidebar
5. If user tries to access denied section → error thrown

### Example
```javascript
// config.json
{
  "name": "admin",
  "roles": ["admin"]  // Only admins can see/access
}

// DashboardPage.js
const userRole = this.getUserRole();  // Gets from localStorage
const accessible = dashboardSectionManager.getAccessibleSections(userRole);
// Only sections where userRole is in roles[] array are included
```

---

## 🔄 Key Methods Reference

### DashboardSectionManager
| Method | Purpose | Returns |
|--------|---------|---------|
| `initialize(sectionsConfig)` | Initialize with config from config.json | Promise |
| `getAccessibleSections(userRole)` | Get sections user can access | Array of section configs |
| `canAccessSection(name, userRole)` | Check if user can access specific section | Boolean |
| `loadSection(name, userRole)` | Load and display section (calls init()) | Promise |
| `cleanupSection(name)` | Call cleanup() on section before unloading | Promise |
| `getCurrentSection()` | Get currently displayed section name | String |
| `getSectionInstance(name)` | Get section object reference | Object |
| `getSection(name)` | Get section config by name | Object |

### DashboardPage
| Method | Purpose |
|--------|---------|
| `init()` | Initialize dashboard (called on page load) |
| `buildSidebarNav()` | Build sidebar menu from accessible sections |
| `loadSection(name)` | Load section with loading state and cleanup |
| `displayUserInfo()` | Show user email in header |
| `handleLogout()` | Logout and redirect to login |

### Section Object (all sections follow this pattern)
| Method | Required? | Purpose |
|--------|-----------|---------|
| `init()` | ✅ Yes | Called when section loads, initialize UI and listeners |
| `cleanup()` | ❌ Optional | Called when section unloads, cleanup state |
| `showError(msg)` | Helper | Display error toast |
| `showSuccess(msg)` | Helper | Display success toast |

---

## 🎨 CSS Structure for Sections

### Files Location
```
css/default/
├── sections.css          # Base section styles
├── forms.css             # Form styles
├── layout.css            # Layout utilities
└── [theme-specific].css

css/dark/
├── sections.css          # Dark theme section styles
├── forms.css             # Dark theme form styles
└── ...
```

### CSS Classes Pattern
```css
/* Container */
.section-container { }
.section-content { }

/* Header */
.section-header { }
.section-header h3 { }

/* View/Edit modes */
.section-view { }
.section-edit { }

/* Cards and fields */
.section-card { }
.section-field { }
.section-value { }

/* Forms */
.section-form { }
.form-group { }

/* Loading state */
.section-loading { }
```

---

## 📝 Step-by-Step: Adding a New Section

### Step 1: Create HTML File
**File**: `pages/sections/newfeature.html`
```html
<div class="section-container">
  <div class="section-content">
    <div class="section-header">
      <h3>New Feature</h3>
    </div>
    <div id="newfeature-view" class="section-view">
      <!-- Content here -->
    </div>
  </div>
</div>
```

### Step 2: Create JavaScript File
**File**: `js/pages/sections/newfeature.js`
```javascript
const NewFeatureSection = {
  init() {
    console.debug('[NewFeatureSection] Initialized');
    setTimeout(() => {
      this.loadData();
      this.attachEventListeners();
    }, 100);
  },

  loadData() {
    // Load from localStorage or API
  },

  attachEventListeners() {
    // Attach click handlers, form submits, etc.
  },

  cleanup() {
    // Optional cleanup
  },

  showError(msg) {
    UIController.getInstance().showMessage(msg, 'error');
  },

  showSuccess(msg) {
    UIController.getInstance().showMessage(msg, 'success');
  }
};

window.NewFeatureSection = NewFeatureSection;
```

### Step 3: Register in config.json
**File**: `config/config.json` → `sections` array
```json
{
  "name": "newfeature",
  "path": "pages/sections/newfeature.html",
  "title": "New Feature",
  "script": "NewFeatureSection",
  "icon": "star",
  "roles": ["user", "admin"]
}
```

### Step 4: Add JavaScript to scripts.json
**File**: `config/scripts.json` → add to `files` array
```json
{
  "path": "js/pages/sections/newfeature.js",
  "type": "script"
}
```

### Step 5: Add CSS Files (if needed)
**Files**: 
- `css/default/newfeature.css`
- `css/dark/newfeature.css`

Then add to `config/styles.json`:
```json
{
  "path": "css/default/newfeature.css",
  "theme": "default"
},
{
  "path": "css/dark/newfeature.css",
  "theme": "dark"
}
```

### Step 6: Test
- Dashboard should show "New Feature" in sidebar (if user has matching role)
- Click to load section
- Section init() should run automatically
- Check console for debug logs

---

## 🐛 Common Patterns & Gotchas

### ✅ DO
- Export section to `window` with exact name from config.json
- Use `setTimeout(..., 100)` in `init()` to ensure DOM is ready
- Call `this.showError()` for user feedback (not `console.error()`)
- Validate form inputs before API calls
- Show loading state on buttons during API calls
- Store important data in `localStorage` for persistence
- Use `apiClient.put()`, `apiClient.post()`, etc. (handles JWT automatically)
- Check user role from `localStorage.user_data.role`
- Use `UIController.getInstance()` for toasts

### ❌ DON'T
- Hardcode section names or paths (use config)
- Forget to add section to `config.json`
- Forget to export section to `window`
- Use `alert()` for errors (use toasts)
- Make API calls without error handling
- Forget `cleanup()` if section has event listeners
- Assume DOM elements exist without checking
- Manually manipulate `#section-container` (let DashboardSectionManager handle it)
- Add `/api` prefix to API paths (proxy adds it)

---

## 🔗 Related Systems

### localStorage Keys
```javascript
// User data (set after login)
localStorage.user_data = JSON.stringify({
  id: "user-id",
  email: "user@example.com",
  role: "user" or "admin",
  enabled: true,
  createdAt: "2024-01-01T00:00:00Z"
});

// Auth tokens
localStorage.auth_token = "jwt-token-here";
localStorage.refresh_token = "refresh-token-here";
```

### API Client Usage
```javascript
// GET
const data = await apiClient.get('/endpoint');

// POST
const response = await apiClient.post('/endpoint', { field: 'value' });

// PUT
const response = await apiClient.put('/endpoint', { field: 'value' });

// DELETE
const response = await apiClient.delete('/endpoint');

// Handles JWT automatically, retries on 401
```

### UIController (Toast System)
```javascript
const uiController = UIController.getInstance();

uiController.showMessage('Success!', 'success');
uiController.showMessage('Error occurred', 'error');
uiController.showMessage('Info message', 'info');
```

---

## 📊 Current Sections Reference

| Section | Path | Roles | Features |
|---------|------|-------|----------|
| **Profile** | `pages/sections/profile.html` | user, admin | View/edit email, password change, display user info |
| **Settings** | `pages/sections/settings.html` | user, admin | Theme switching, preferences |
| **Admin** | `pages/sections/admin.html` | admin | User management (stub) |

---

## 🚀 Next Section Ideas

When creating new sections, follow the same pattern. Examples:
- **Notifications**: Display user notifications with mark-as-read
- **Billing**: Show subscription status and payment history
- **Security**: Two-factor auth, session management, login history
- **Preferences**: User preferences and account settings
- **Reports**: Data analytics and reporting (admin only)

---


DO NOT ANSWER WAIT ASK YOU