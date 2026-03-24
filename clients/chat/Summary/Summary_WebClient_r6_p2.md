# PART 2: Instructions for Adding New Elements

## 📋 How to Add New Components to Your Project

This section provides step-by-step instructions for adding new pages, sections, scripts, and CSS files to your project. Follow these patterns to maintain consistency and ensure everything works correctly.

---

## How to Add a New Page

A **page** is a full-screen view (like login, register, or dashboard). Pages are registered in config and loaded via the router.

### Step 1: Create the HTML File
Create a new file in `pages/` directory:

**File**: `pages/[pagename].html`
```html
<div class="page-[pagename]">
  <div class="page-container">
    <h1>Page Title</h1>
    <!-- Your page content here -->
  </div>
</div>
```

### Step 2: Create the JavaScript File
Create a new file in `js/pages/` directory:

**File**: `js/pages/[pagename].js`
```javascript
const [PageName]Page = {
  init() {
    console.debug('[PageName]Page] Page initialized');
    
    setTimeout(() => {
      // Attach event listeners
      // Initialize components
      // Make API calls if needed
      
      console.debug('[PageName]Page] Page initialization complete');
    }, 100);
  }
};

window.[PageName]Page = [PageName]Page;
```

**Important**: 
- Replace `[PageName]` with your page name (e.g., `ProfilePage`, `SettingsPage`)
- Always use `window.[PageName]Page = [PageName]Page;` to expose it globally
- Use `console.debug('[PageName]Page] message')` for logging

### Step 3: Register in Config
Add entry to `config/config.json` in the `"pages"` array:

```json
{
  "name": "[pagename]",
  "path": "pages/[pagename].html",
  "title": "Page Title",
  "script": "[PageName]Page",
  "isProtected": false
}
```

**Fields**:
- `name`: Unique identifier (lowercase, used in hash navigation)
- `path`: Path to HTML file
- `title`: Display title (shown in browser tab)
- `script`: Name of global script object (matches `window.[PageName]Page`)
- `isProtected`: Set to `true` if page requires authentication

### Step 4: Create CSS Files (Optional)
If your page needs styling, create files in BOTH theme directories:

**Files**:
- `css/default/[pagename].css`
- `css/dark/[pagename].css`

Add identical class names in both files, but with theme-appropriate colors.

### Step 5: Register CSS in Config
Add entries to `config/styles.json`:

```json
{
  "theme": "default",
  "files": [
    { "name": "[pagename]", "path": "css/default/[pagename].css" }
  ]
},
{
  "theme": "dark",
  "files": [
    { "name": "[pagename]", "path": "css/dark/[pagename].css" }
  ]
}
```

### Step 6: Navigate to the Page
Users can navigate to your page via:
- Hash URL: `#[pagename]`
- Programmatic: `router.navigate('[pagename]')`

---

## How to Add a New Dashboard Section

A **section** is a component loaded inside the dashboard. Sections are role-based, dynamically loaded, and self-contained.

### Step 1: Create the HTML File
Create a new file in `pages/sections/` directory:

**File**: `pages/sections/[sectionname].html`
```html
<div class="section-container">
  <div class="section-content">
    <div class="section-header">
      <h3>Section Title</h3>
      <p>Section description</p>
    </div>
    
    <!-- View mode (read-only) -->
    <div id="[sectionname]-view" class="section-view">
      <div class="section-card">
        <div class="section-field">
          <label>Field Name</label>
          <p id="[sectionname]-field" class="section-value">Loading...</p>
        </div>
      </div>
    </div>
    
    <!-- Edit mode (if applicable) -->
    <div id="[sectionname]-edit" class="section-edit" style="display: none;">
      <form id="[sectionname]-form" class="section-form">
        <div class="form-group">
          <label for="[sectionname]-input">Field Name</label>
          <input 
            type="text" 
            id="[sectionname]-input" 
            class="form-control"
            placeholder="Enter value"
          />
        </div>
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" id="[sectionname]-cancel" class="btn btn-secondary">Cancel</button>
      </form>
    </div>
  </div>
</div>
```

**Important**:
- Use `section-container`, `section-content`, `section-header`, `section-view`, `section-edit`, `section-card`, `section-field`, `section-value`, `section-form` classes (these are pre-styled)
- Use `id="[sectionname]-..."` for element IDs (for easy selection in JS)
- Include both view and edit modes if users can modify data

### Step 2: Create the JavaScript File
Create a new file in `js/pages/sections/` directory:

**File**: `js/pages/sections/[sectionname].js`
```javascript
const [SectionName]Section = {
  init() {
    console.debug('[SectionName]Section] Section initialized');
    
    // Load and display data
    this.loadData();
    
    // Attach event listeners
    this.attachListeners();
    
    console.debug('[SectionName]Section] Section initialization complete');
  },

  async loadData() {
    console.debug('[SectionName]Section] loadData() called');
    
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        // Display user data in section
        document.getElementById('[sectionname]-field').textContent = user.email;
        console.debug('[SectionName]Section] Data loaded successfully');
      }
    } catch (error) {
      console.error('[SectionName]Section] Error loading data:', error.message);
      this.showError('Failed to load section data');
    }
  },

  attachListeners() {
    console.debug('[SectionName]Section] attachListeners() called');
    
    // Edit button
    const editBtn = document.getElementById('[sectionname]-edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.toggleEditMode());
    }
    
    // Form submit
    const form = document.getElementById('[sectionname]-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('[sectionname]-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.toggleEditMode());
    }
    
    console.debug('[SectionName]Section] Event listeners attached');
  },

  toggleEditMode() {
    console.debug('[SectionName]Section] toggleEditMode() called');
    
    const viewDiv = document.getElementById('[sectionname]-view');
    const editDiv = document.getElementById('[sectionname]-edit');
    
    if (viewDiv && editDiv) {
      viewDiv.style.display = viewDiv.style.display === 'none' ? 'block' : 'none';
      editDiv.style.display = editDiv.style.display === 'none' ? 'block' : 'none';
      console.debug('[SectionName]Section] Edit mode toggled');
    }
  },

  async handleSubmit(e) {
    console.debug('[SectionName]Section] handleSubmit() called');
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    try {
      // Make API call to update data
      const response = await apiClient.put('/user/profile', {
        email: formData.get('email')
      });
      
      console.debug('[SectionName]Section] Data updated successfully');
      this.showSuccess('Changes saved successfully');
      this.toggleEditMode();
      this.loadData(); // Reload to show updated data
      
    } catch (error) {
      console.error('[SectionName]Section] Error updating data:', error.message);
      this.showError('Failed to save changes');
    }
  },

  cleanup() {
    console.debug('[SectionName]Section] cleanup() called');
    // Remove event listeners, clear state, etc.
    // This is called before the section is unloaded
  },

  showError(message) {
    const uiController = UIController.getInstance();
    uiController.showMessage(message, 'error');
  },

  showSuccess(message) {
    const uiController = UIController.getInstance();
    uiController.showMessage(message, 'success');
  }
};

window.[SectionName]Section = [SectionName]Section;
```

**Important**:
- Replace `[SectionName]` with your section name (e.g., `Profile`, `Admin`, `Settings`)
- Always use `window.[SectionName]Section = [SectionName]Section;` to expose it globally
- Include `init()` method (called when section loads)
- Include optional `cleanup()` method (called when section unloads)
- Use `console.debug('[SectionName]Section] message')` for logging
- Use `apiClient` for API calls (token auto-attached)
- Use `UIController.getInstance().showMessage()` for toast notifications

### Step 3: Register in Config
Add entry to `config/config.json` in the `"sections"` array:

```json
{
  "name": "[sectionname]",
  "path": "pages/sections/[sectionname].html",
  "title": "Section Title",
  "script": "[SectionName]Section",
  "icon": "icon-name",
  "roles": ["user", "admin"]
}
```

**Fields**:
- `name`: Unique identifier (lowercase, used for section switching)
- `path`: Path to HTML file
- `title`: Display title (shown in sidebar navigation)
- `script`: Name of global script object (matches `window.[SectionName]Section`)
- `icon`: Icon name (used in sidebar, optional)
- `roles`: Array of roles that can access this section (e.g., `["user", "admin"]` for all users, `["admin"]` for admins only)

### Step 4: Create CSS Files (Optional)
If your section needs styling beyond the base section styles, create files in BOTH theme directories:

**Files**:
- `css/default/sections.css` (or create `css/default/[sectionname].css`)
- `css/dark/sections.css` (or create `css/dark/[sectionname].css`)

Add section-specific styles using class selectors like `.section-[sectionname]`.

### Step 5: The Section Will Automatically Appear
Once registered in config:
- The section appears in the dashboard sidebar (if user has correct role)
- Clicking the section link loads your HTML and calls `init()`
- When switching to another section, `cleanup()` is called on the previous section

---

## How to Add a New Script/Component

A **script** is a reusable component (like HeaderComponent, ThemeManager, etc.) that initializes when the app loads.

### Step 1: Create the JavaScript File
Create a new file in `js/` or `js/components/` directory:

**File**: `js/components/[componentname].js`
```javascript
class [ComponentName] {
  constructor() {
    console.debug('[ComponentName] Constructor called');
    // Initialize properties
    this.property = 'value';
  }

  init() {
    console.debug('[ComponentName] init() called');
    
    document.addEventListener('DOMContentLoaded', () => {
      // Initialization code here
      this.setupDOM();
      this.attachListeners();
      
      console.debug('[ComponentName] Initialization complete');
    });
  }

  setupDOM() {
    console.debug('[ComponentName] setupDOM() called');
    // Find and reference DOM elements
  }

  attachListeners() {
    console.debug('[ComponentName] attachListeners() called');
    // Attach event listeners
  }

  // Other methods...
}

window.[componentName]Instance = new [ComponentName]();
```

**Important**:
- Create a **class** with `constructor()` and `init()` methods
- Instantiate as `window.[componentName]Instance = new [ComponentName]()`
- Use `console.debug('[ComponentName] message')` for logging
- The `init()` method is called automatically by the initializer after the script loads

### Step 2: Register in Config
Add entry to `config/scripts.json`:

```json
{
  "name": "[componentname]",
  "path": "js/components/[componentname].js"
}
```

**Important**: Order matters! List dependencies before dependents. For example:
- `authService.js` should load before `apiClient.js`
- `apiClient.js` should load before pages that use it
- `ui-controller.js` should load before components that use toast notifications

### Step 3: The Script Will Automatically Load
Once registered in config and in the correct order, the script loads and initializes automatically when the app starts.

---

## How to Add New CSS Files

CSS files are organized by theme (default/dark) and registered in config.

### Step 1: Create CSS Files in Both Themes
Create identical files in both theme directories with the same class names:

**Files**:
- `css/default/[filename].css`
- `css/dark/[filename].css`

**Example - default theme**:
```css
/* css/default/mycomponent.css */
.my-component {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #e0e0e0;
}

.my-component-header {
  background-color: #f5f5f5;
  padding: 16px;
}
```

**Example - dark theme**:
```css
/* css/dark/mycomponent.css */
.my-component {
  background-color: #1e1e1e;
  color: #e0e0e0;
  border: 1px solid #333333;
}

.my-component-header {
  background-color: #2a2a2a;
  padding: 16px;
}
```

**Important**:
- Use **identical class names** in both theme files
- Only change colors, backgrounds, and theme-specific values
- Don't change layout, sizing, or structure between themes

### Step 2: Register in Config
Add entries to `config/styles.json` in BOTH theme sections:

```json
{
  "theme": "default",
  "files": [
    { "name": "mycomponent", "path": "css/default/mycomponent.css" }
  ]
},
{
  "theme": "dark",
  "files": [
    { "name": "mycomponent", "path": "css/dark/mycomponent.css" }
  ]
}
```

### Step 3: CSS Will Automatically Load
The theme manager loads the appropriate CSS file based on the selected theme. When users switch themes, CSS files are swapped automatically.

---

## How to Add a New API Endpoint Call

API calls are made through `apiClient`, which handles CORS, token management, and error handling.

### Basic Usage

```javascript
// GET request
const data = await apiClient.get('/endpoint');

// POST request
const response = await apiClient.post('/endpoint', {
  key: 'value'
});

// PUT request
const response = await apiClient.put('/endpoint', {
  key: 'updated-value'
});

// DELETE request
const response = await apiClient.delete('/endpoint');
```

**Important**:
- Use `/endpoint` NOT `/api/endpoint` — the proxy adds `/api` automatically
- Token is automatically attached to all requests
- If you get a 401 response, the client automatically refreshes the token and retries
- All requests go through `proxy.php` for CORS handling

### Error Handling

```javascript
try {
  const response = await apiClient.post('/user/profile', { email: 'new@email.com' });
  console.log('Success:', response);
} catch (error) {
  console.error('Error:', error.message);
  // Show error to user
  UIController.getInstance().showMessage('Failed to update profile', 'error');
}
```

### Making Authenticated Calls

The token is **automatically** attached to all requests. You don't need to add it manually:

```javascript
// This automatically includes the Authorization header
const userData = await apiClient.get('/user/data');
```

---

## How to Use the Toast Notification System

Use the **UIController** to show notifications to users.

### Basic Usage

```javascript
const uiController = UIController.getInstance();

// Success message
uiController.showMessage('Profile updated successfully!', 'success');

// Error message
uiController.showMessage('Failed to update profile', 'error');

// Info message
uiController.showMessage('Please fill in all fields', 'info');
```

**Message Types**:
- `'success'` - Green toast for successful operations


DO NOT ANSWER WAIT ASK YOU