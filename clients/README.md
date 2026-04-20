Perfect! I now have both documents. Let me create a comprehensive README that combines them, removes duplicates, and organizes everything logically.
Here's your consolidated README that merges both documents without duplication:

---

# Spring Boot Security Layer Testing - Web Client README

## 📋 Quick Navigation

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Current Status](#current-status)
- [Getting Started](#getting-started)
- [File Structure](#file-structure)
- [Adding New Elements](#adding-new-elements)
  - [How to Add a Page](#how-to-add-a-page)
  - [How to Add a Dashboard Section](#how-to-add-a-dashboard-section)
  - [How to Add a Script/Component](#how-to-add-a-scriptcomponent)
  - [How to Add New CSS Files](#how-to-add-new-css-files)
- [API Integration](#api-integration)
- [UI & Notifications](#ui--notifications)
- [Reference Guide](#reference-guide)
  - [DashboardSectionManager Methods](#dashboardsectionmanager-methods)
  - [DashboardPage Methods](#dashboardpage-methods)
  - [Section Object Methods](#section-object-methods-required--optional)
  - [localStorage Keys](#localstorage-keys)
  - [CSS Structure for Sections](#css-structure-for-sections)
- [Best Practices](#best-practices)
- [Next Section Ideas](#next-section-ideas)

---

## Project Overview

**Goal**: Build a **vanilla JS + HTML web client** to test a Spring Boot backend's security layer.

**Key Features**:
- Login and registration pages with form validation
- Dashboard with role-based access control
- Theme switching (default/dark)
- Complete authentication service layer with JWT token management
- Modular dashboard system with self-contained sections
- No frameworks—pure vanilla JavaScript for easier security testing

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Vanilla JavaScript, HTML, CSS |
| **Backend** | Spring Boot REST API |
| **Server** | Local dev server (http://localhost:3280) |
| **Authentication** | JWT tokens with refresh token rotation |
| **CORS Solution** | PHP proxy at `proxy.php` |
| **Routing** | Hash-based single-page app navigation |

---

## Architecture

### Why This Approach?

This architecture avoids hardcoding routes, scripts, settings, and CSS files. It's maintainable, reusable, and easy to extend without touching `index.html`.

### How It Works (Step-by-Step)

**1. App Initialization**
- `index.html` loads only two scripts: `script-loader.js` and `initializer.js`
- `script-loader.js` reads `config/scripts.json` and loads all scripts in the correct order
- Scripts follow a consistent pattern: class with `init()` method, instantiated globally

**2. Script Loading & Initialization**
- All scripts load sequentially (order matters—dependencies must load before dependents)
- Each script creates a class with `init()` method
- Script is instantiated as `window.componentInstance = new ComponentClass()`
- `initializer.js` waits for all scripts, then calls `init()` on each component

**3. Authentication Flow**
- `authGuard.js` checks if user has a valid JWT token on app startup
- If token exists and valid → loads dashboard
- If no token or expired → loads login page
- `authService.js` manages login, register, logout, and token refresh
- Tokens stored in localStorage: `auth_token`, `refresh_token`, `user_data`

**4. Page Navigation**
- `router.js` handles hash-based navigation (e.g., `#login`, `#dashboard`)
- User clicks link → router fetches HTML from `pages/` directory
- Router calls page's `init()` method to initialize logic
- Pages can use `authService` for API calls

**5. API Communication**
- All requests go through `apiClient.js`, which sends them via `proxy.php`
- **Important**: Use `/endpoint` NOT `/api/endpoint`—proxy adds `/api` automatically
- `apiClient` automatically attaches JWT token to all requests
- Intercepts 401 responses and refreshes token automatically
- Retries failed requests with new token

**6. Dashboard System**
- `DashboardPage` acts as a shell/container for sections
- Builds sidebar navigation from accessible sections (filtered by user role)
- Uses `DashboardSectionManager` to load sections dynamically
- Each section has HTML file (`pages/sections/[name].html`) and JS file (`js/pages/sections/[name].js`)
- Sections are role-gated in `config.json` (only accessible users with correct role)
- Each section has `init()` method (called when loaded) and optional `cleanup()` method (called when unloaded)

**7. Theme Management**
- CSS files organized by theme: `css/default/` and `css/dark/`
- Theme manager loads appropriate CSS based on user selection
- When theme switches, CSS files are dynamically swapped
- All CSS files registered in `config/styles.json`

**8. Header Component**
- `HeaderComponent` (`header.js`) displays user authentication status
- Shows username and logout button when authenticated
- Shows login/register links when not authenticated
- Updates dynamically when user logs in/out
- Syncs with `authService` to reflect current auth state

**9. Proxy Integration**
- `proxy.php` sits on the same origin server (no CORS issues)
- Receives requests: `./proxy.php?path=/auth/login`
- Forwards to backend: `http://172.32.0.11:8080/api/auth/login`
- Handles CORS headers and forwards all HTTP methods
- Forwards request headers (including Authorization for JWT)
- Returns backend response with HTTP status code

---

## Current Status

### ✅ Completed Features

**Core Infrastructure**
- Single-page app structure with dynamic script loading
- Dynamic CSS loading from config manifest
- Hash-based router system with page registration from config
- Theme system (default/dark with CSS imports)
- Console window with logging
- UI controller with error handling and toast notifications

**Authentication**
- Login page with form validation and error handling
- Register page with form validation and error handling
- AuthService with login, register, logout, token refresh
- AuthGuard with route protection and automatic redirects
- Real API integration through proxy
- Automatic token refresh on 401 responses with request retry
- Token storage in localStorage

**Dashboard System**
- Dashboard page with sidebar navigation and section container
- Dashboard section system with role-based access control
- DashboardSectionManager with dynamic section loading and lifecycle management
- Profile section (view/edit user email and password)
- Settings section (theme switching, preferences)
- Admin section (stub for user management)

**Styling & UI**
- CSS structure: base + auth-base + toast-base + theme-specific overrides
- HeaderComponent with authentication status display
- Toast system for user feedback (success, error, info messages)
- Protected routes (redirects to login if not authenticated)

### ⏳ Next Steps

1. Test dashboard sections with backend (profile edit, settings)
2. Implement admin section (user management - view, enable/disable users)
3. Add breadcrumbs/navigation indicators in dashboard header
4. Add section loading states (spinners/skeletons)
5. Test role-based access (verify non-admins can't access admin section)

### 🔮 Future Enhancements

- TypeScript conversion for all services and components
- State management (Redux/Zustand/Context) implementation
- Unit and integration tests

---

## Getting Started

### Prerequisites
- Local dev server running at `http://localhost:3280`
- Spring Boot backend running at `http://172.32.0.11:8080`
- `proxy.php` deployed on the same server as the web client

### Running the App
1. Navigate to `http://localhost:3280`
2. App loads `index.html` → initializes scripts → checks authentication
3. If not logged in, redirected to login page
4. After login, dashboard loads with accessible sections based on user role

### File Structure

```
webclient/
├── config/
│   ├── config.json (pages, sections, theme settings)
│   ├── scripts.json (script loading order)
│   └── styles.json (CSS file paths for themes)
├── css/
│   ├── auth-base.css
│   ├── base.css
│   ├── toast-base.css
│   ├── theme-switcher.css
│   ├── default/ (light theme CSS)
│   │   ├── auth.css, buttons.css, console.css
│   │   ├── dashboard.css, forms.css, grid.css
│   │   ├── header.css, header-auth.css
│   │   ├── layout.css, responsive.css, sections.css
│   │   ├── tables.css, toast.css, utilities.css
│   │   └── ... (other theme files)
│   └── dark/ (dark theme CSS - identical structure)
├── js/
│   ├── app.js (loads config files, registers pages)
│   ├── router.js (handles page navigation)
│   ├── initializer.js (initializes components after scripts load)
│   ├── script-loader.js (loads scripts in order from config)
│   ├── theme-manager.js (theme switching)
│   ├── console.js & console-logger.js (console window)
│   ├── ui-controller.js (toast notifications, error handling)
│   ├── dashboard-section-manager.js (manages section lifecycle)
│   ├── components/
│   │   └── header.js (header component)
│   ├── services/
│   │   ├── authService.js (login, register, logout, token refresh)
│   │   └── authGuard.js (route protection, auth validation)
│   ├── pages/
│   │   ├── login.js & login.html
│   │   ├── register.js & register.html
│   │   ├── dashboard.js & dashboard.html
│   │   └── sections/
│   │       ├── profile.js & profile.html
│   │       ├── settings.js & settings.html
│   │       ├── admin.js & admin.html
│   │       └── ... (other sections)
│   └── utils/
│       └── apiClient.js (HTTP requests, token management)
├── pages/
│   ├── header.html (shared header component)
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   └── sections/
│       └── [section files]
├── index.html (entry point - loads script-loader + initializer)
└── proxy.php (CORS proxy, forwards to backend)
```

---

## 🎯 Adding New Elements

### How to Add a New Page

A **page** is a full-screen view (like login, register, or dashboard). Pages are registered in config and loaded via the router.

#### Step 1: Create the HTML File

**File**: `pages/[pagename].html`
```html
<div class="page-[pagename]">
  <div class="page-container">
    <h1>Page Title</h1>
    <!-- Your page content here -->
  </div>
</div>
```

#### Step 2: Create the JavaScript File

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

#### Step 3: Register in Config

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
- `name`: **Unique identifier** (lowercase, used in hash navigation)
- `path`: **Path to HTML file** (relative to project root)
- `title`: **Display title** (shown in browser tab)
- `script`: **Name of global script object** (matches `window.[PageName]Page`)
- `isProtected`: **Set to `true`** if page requires authentication

#### Step 4: Create CSS Files (Optional)

If your page needs styling, create files in **BOTH** theme directories with identical class names:

**Files**:
- `css/default/[pagename].css`
- `css/dark/[pagename].css`

**Example - Default Theme**:
```css
/* css/default/mypage.css */
.page-mypage {
  background-color: #ffffff;
  color: #333333;
}

.page-mypage-header {
  background-color: #f5f5f5;
  padding: 24px;
}
```

**Example - Dark Theme**:
```css
/* css/dark/mypage.css */
.page-mypage {
  background-color: #1e1e1e;
  color: #e0e0e0;
}

.page-mypage-header {
  background-color: #2a2a2a;
  padding: 24px;
}
```

**Important**:
- Use **identical class names** in both files
- Only change colors, backgrounds, and theme-specific values
- Don't change layout, sizing, or structure between themes

#### Step 5: Register CSS in Config

Add entries to `config/styles.json` in **BOTH** theme sections:

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

#### Step 6: Navigate to the Page

Users can navigate to your page via:
- **Hash URL**: `#[pagename]`
- **Programmatic**: `router.navigate('[pagename]')`

---

### How to Add a Dashboard Section

A **section** is a self-contained component loaded inside the dashboard. Sections are role-based, dynamically loaded, and manage their own state.

#### Step 1: Create the HTML File

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
            name="field"
            class="form-control"
            placeholder="Enter value"
            required
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
- Use pre-styled classes: `section-container`, `section-content`, `section-header`, `section-view`, `section-edit`, `section-card`, `section-field`, `section-value`, `section-form`
- Use `id="[sectionname]-..."` for element IDs (for easy selection in JS)
- Include both view and edit modes if users can modify data

#### Step 2: Create the JavaScript File

**File**: `js/pages/sections/[sectionname].js`

See the **Section JavaScript Pattern** section above for the complete template. Key methods:
- `init()` — initialize section, load data, attach listeners
- `loadData()` — fetch data from localStorage or API
- `attachListeners()` — attach event listeners to DOM elements
- `handleSubmit(e)` — handle form submissions and API calls
- `toggleEditMode()` — switch between view/edit modes
- `cleanup()` — optional cleanup when section unloads
- `showError()` and `showSuccess()` — show toast notifications

#### Step 3: Register in Config

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

No, it's not the last part! I was interrupted and didn't finish. Let me continue from where it cut off:

---

**Fields**:
- `name`: **Unique identifier** (lowercase, used for section switching)
- `path`: **Path to HTML file**
- `title`: **Display title** (shown in sidebar navigation)
- `script`: **Name of global script object** (matches `window.[SectionName]Section`)
- `icon`: **Icon name** (used in sidebar, optional)
- `roles`: **Array of roles** that can access (e.g., `["user", "admin"]` for all users, `["admin"]` for admins only)

#### Step 4: Create CSS Files (Optional)

If your section needs styling beyond the base section styles, create files in **BOTH** theme directories:

**Files**:
- `css/default/sections.css` (or create `css/default/[sectionname].css`)
- `css/dark/sections.css` (or create `css/dark/[sectionname].css`)

Add section-specific styles using class selectors like `.section-[sectionname]`.

#### Step 5: The Section Will Automatically Appear

Once registered in config:
- The section appears in the dashboard sidebar (if user has correct role)
- Clicking the section link loads your HTML and calls `init()`
- When switching to another section, `cleanup()` is called on the previous section

---

### How to Add a New Script/Component

A **script** is a reusable component (like HeaderComponent, ThemeManager, etc.) that initializes when the app loads.

#### Step 1: Create the JavaScript File

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
    
    // Initialization code here
    this.setupDOM();
    this.attachListeners();
    
    console.debug('[ComponentName] Initialization complete');
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

#### Step 2: Register in Config

Add entry to `config/scripts.json`:

```json
{
  "name": "[componentname]",
  "path": "js/components/[componentname].js"
}
```

**Important**: **Order matters!** List dependencies before dependents. For example:
- `authService.js` should load before `apiClient.js`
- `apiClient.js` should load before pages that use it
- `ui-controller.js` should load before components that use toast notifications

#### Step 3: The Script Will Automatically Load

Once registered in config and in the correct order, the script loads and initializes automatically when the app starts.

---

### How to Add New CSS Files

CSS files are organized by theme (default/dark) and registered in config.

#### Step 1: Create CSS Files in Both Themes

Create identical files in both theme directories with the same class names:

**Files**:
- `css/default/[filename].css`
- `css/dark/[filename].css`

**Example - Default Theme**:
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

**Example - Dark Theme**:
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

#### Step 2: Register in Config

Add entries to `config/styles.json` in **BOTH** theme sections:

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

#### Step 3: CSS Will Automatically Load

The theme manager loads the appropriate CSS file based on the selected theme. When users switch themes, CSS files are swapped automatically.

---
## 🔗 API Integration

### How to Add a New API Endpoint Call

API calls are made through `apiClient`, which handles CORS, token management, and error handling.

#### Basic Usage

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
- Use `/endpoint` **NOT** `/api/endpoint` — the proxy adds `/api` automatically
- **Token is automatically attached** to all requests
- If you get a **401 response**, the client automatically refreshes the token and retries
- All requests go through `proxy.php` for CORS handling

#### Error Handling

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

#### Making Authenticated Calls

The token is **automatically** attached to all requests. You don't need to add it manually:

```javascript
// This automatically includes the Authorization header
const userData = await apiClient.get('/user/data');
```

---

## 🎨 UI & Notifications

### How to Use the Toast Notification System

Use the **UIController** to show notifications to users.

#### Basic Usage

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
- `'success'` — Green toast for successful operations
- `'error'` — Red toast for failures
- `'info'` — Blue toast for information messages

---

## 📚 Reference Guide

### DashboardSectionManager Methods

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

---

### DashboardPage Methods

| Method | Purpose |
|--------|---------|
| `init()` | Initialize dashboard (called on page load) |
| `buildSidebarNav()` | Build sidebar menu from accessible sections |
| `loadSection(name)` | Load section with loading state and cleanup |
| `displayUserInfo()` | Show user email in header |
| `handleLogout()` | Logout and redirect to login |

---

### Section Object Methods (Required & Optional)

| Method | Required? | Purpose |
|--------|-----------|---------|
| `init()` | ✅ Yes | Called when section loads, initialize UI and listeners |
| `cleanup()` | ❌ Optional | Called when section unloads, cleanup state |
| `showError(msg)` | Helper | Display error toast |
| `showSuccess(msg)` | Helper | Display success toast |

---

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


---

### CSS Structure for Sections

| Class | Purpose |
|-------|---------|
| `.section-container` | Outer wrapper |
| `.section-content` | Content wrapper |
| `.section-header` | Header area with title |
| `.section-view` | Read-only display mode |
| `.section-edit` | Editable form mode |
| `.section-card` | Card container |
| `.section-field` | Individual field wrapper |
| `.section-value` | Field value text |
| `.section-form` | Form wrapper |
| `.form-group` | Form field group |

---

## ✅ Best Practices

### DO
- **Export sections to `window`** with exact name from config.json
- **Use `setTimeout(..., 100)`** in `init()` to ensure DOM is ready
- **Call `this.showError()`** for user feedback (not `console.error()`)
- **Validate form inputs** before API calls
- **Show loading state** on buttons during API calls
- **Store important data** in `localStorage` for persistence
- **Use `apiClient`** for API calls (handles JWT automatically)
- **Check user role** from `localStorage.user_data.role`
- **Use `UIController.getInstance()`** for toasts

### DON'T
- **Hardcode section names or paths** (use config)
- **Forget to add section** to `config.json`
- **Forget to export** section to `window`
- **Use `alert()`** for errors (use toasts)
- **Make API calls without** error handling
- **Forget `cleanup()`** if section has event listeners
- **Assume DOM elements exist** without checking
- **Manually manipulate** `#section-container` (let DashboardSectionManager handle it)
- **Add `/api` prefix** to API paths (proxy adds it)

---

No, this is **NOT** the last part. Based on the merge structure, **"Next Section Ideas"** is section **#12** (the final section).

So yes, **"Next Section Ideas"** is the **last part** of the merged README.

Here it is again for clarity:

---

## 🚀 Next Section Ideas

When creating new sections, follow the same pattern. Examples:
- **Notifications** — Display user notifications with mark-as-read
- **Billing** — Show subscription status and payment history
- **Security** — Two-factor auth, session management, login history
- **Preferences** — User preferences and account settings
- **Reports** — Data analytics and reporting (admin only)

---

## 📸 Screenshots

### Authentication
- [Login Page](#login-page)
- [Register Page](#register-page)

### Customer Dashboard
- [Plans](#plans)
- [Plan Details](#plan-details)
- [My Subscriptions](#my-subscriptions)
- [Subscription Invoice](#subscription-invoice)
- [Customer Invoice](#customer-invoice)

### Operator Dashboard
- [My Plans](#my-plans)
- [Add New Plan](#add-new-plan)
- [Manage Subscriptions](#manage-subscriptions)
- [Bill Manager](#bill-manager)
- [Invoice](#invoice)

### User Settings
- [Profile Section](#profile-section)
- [Settings Section](#settings-section)
- [Admin Section](#admin-section)

---

### Login Page

![Login Page](./screenshots/login-page.png)

---

### Register Page

![Register Page](./screenshots/register-page.png)

---

## Customer Dashboard

### Plans

![Plans](./screenshots/customer-plans.png)

---

### Plan Details

![Plan Details](./screenshots/customer-plan-detail.png)

---

### My Subscriptions

![My Subscriptions](./screenshots/customer-mysubscriptions.png)

---

### Subscription Invoice

![Subscription Invoice](./screenshots/customer-mysubscriptions-invoice.png)

---

### Customer Invoice

![Customer Invoice](./screenshots/customer-invoice.png)

---

## Operator Dashboard

### My Plans

![My Plans](./screenshots/operator-myplans.png)

---

### Add New Plan

![Add New Plan](./screenshots/oprator-myplans-add.png)

---

### Manage Subscriptions

![Manage Subscriptions](./screenshots/operator-manage-subscriptions.png)

---

### Bill Manager

![Bill Manager](./screenshots/oprator-bill-manager.png)

---

### Invoice

![Invoice](./screenshots/oprator-invoice.png)

---

## User Settings

### Profile Section

![Profile Section](./screenshots/profile-section.png)

---

### Settings Section

![Settings Section](./screenshots/settings-section.png)

---

### Admin Section

![Admin Section](./screenshots/admin-section.png)

