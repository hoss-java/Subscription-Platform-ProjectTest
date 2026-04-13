# Project Summary: Spring Boot Security Layer Testing - Web Client (Complete + Updated)

## 📋 How to Use This Document

**When you ask me to update or work on this project, I will:**
- Answer **short and concisely** at the beginning
- Say **"I am ready. What we have is..."** and briefly summarize the current state
- **Wait for your next instruction** before proceeding
- Only provide detailed responses when you explicitly ask for them

---

## Project Goal
Build a **vanilla JS + HTML web client** to test a Spring Boot backend's security layer. Client features login, register, and dashboard pages with theme switching (default/dark), a complete **authentication service layer** with JWT token management, and a **modular dashboard system** with role-based sections.

## Tech Stack
- **Frontend**: Vanilla JS, HTML, CSS (no frameworks)
- **Backend**: Spring Boot REST API (security endpoints ready)
- **Server**: Local dev server (e.g., http://localhost:3280)
- **Proxy**: PHP proxy at `proxy.php` (handles CORS, forwards to `http://172.32.0.11:8080/api`)
- **Authentication**: JWT tokens with refresh token rotation
- **Dashboard**: Section-based architecture with role-based access control

---

## Architecture: Single-Page App with Dynamic Config Loading & Modular Dashboard

**Why this approach?**
- Avoid hardcoding routes, scripts, settings, and CSS files
- Easy to add new pages and sections without touching `index.html`
- Maintainable and reusable across projects
- Scripts load in correct order (important for dependencies)
- CSS themes managed dynamically via config manifest
- Dashboard sections are self-contained, role-aware, and dynamically loaded

### How It Works (Step-by-Step)

1. **index.html** loads ONLY two scripts:
   - `script-loader.js` (loads other scripts sequentially)
   - `initializer.js` (initializes components and auth checks after scripts load)

2. **script-loader.js** reads `config/scripts.json` and loads scripts in order based on **Files Map**. Order matters because later scripts depend on earlier ones.

3. **Script Pattern** (all scripts follow this):
   - Create a **class with `init()` method**
   - Instantiate as `window.componentInstance = new ComponentClass()`
   - Add path to `config/scripts.json` (referenced from Files Map)
   - **ScriptLoader** automatically loads and executes the script
   - Script's top-level code runs immediately, `init()` method called by **Initializer**

4. **initializer.js** waits for all scripts, then:
   - Calls `authGuard.initialize()` to check existing JWT token
   - If token exists and valid → loads dashboard
   - If no token or expired → loads login page
   - Initializes all components (console, theme manager, header) and starts routing

5. **router.js** handles page navigation:
   - User clicks link (e.g., `#login`)
   - Router fetches HTML from pages directory (see Files Map)
   - Router calls corresponding page's `init()` method
   - Page can use `authService` for API calls

6. **authService.js** manages authentication:
   - `register(email, password)` → calls `/auth/register` (via proxy)
   - `login(email, password)` → calls `/auth/login`, stores JWT + refresh token
   - `logout()` → clears tokens from localStorage
   - `refreshToken()` → calls `/auth/refresh` to get new JWT
   - `validateToken()` → checks token validity without API call
   - `getStoredToken()` → retrieves JWT from localStorage

7. **authGuard.js** protects routes:
   - `initialize()` → runs on app startup, checks token status
   - `isAuthenticated()` → returns boolean based on stored token
   - `requireAuth()` → redirects to login if not authenticated
   - Automatic 401 response interceptor triggers token refresh

8. **apiClient.js** wraps HTTP requests:
   - Sends all requests through `proxy.php` (same origin, no CORS issues)
   - Proxy forwards to backend at `http://172.32.0.11:8080/api`
   - Client does NOT add `/api` to address—**proxy adds it automatically**
   - Automatically attaches JWT token to headers
   - Intercepts 401 responses and refreshes token
   - Retries failed request with new token

9. **proxy.php** (on server):
   - Receives requests at `./proxy.php?path=/auth/login`
   - Forwards to `http://172.32.0.11:8080/api/auth/login`
   - Handles CORS headers (Access-Control-Allow-Origin, etc.)
   - Forwards all HTTP methods (GET, POST, PUT, DELETE, PATCH)
   - Forwards request headers (including Authorization for JWT)
   - Returns backend response with HTTP status code
   - Includes debug info on errors (called URL, method, body sent)

10. **app.js** loads config files and registers all pages with router

11. **header.js** (HeaderComponent):
    - Displays user authentication status in the header
    - Shows username and logout button when authenticated
    - Shows login/register links when not authenticated
    - Updates dynamically when user logs in/out
    - Manages header DOM elements and event listeners
    - Syncs with `authService` to reflect current auth state

12. **DashboardPage** (`js/pages/dashboard.js`):
    - Shell/container for dashboard sections
    - Builds sidebar navigation from accessible sections (based on user role)
    - Manages section loading/unloading
    - Displays user info in header
    - Handles logout functionality
    - Uses **DashboardSectionManager** to load sections dynamically
    - Shows loading state while sections load

13. **DashboardSectionManager** (`js/dashboard-section-manager.js`):
    - Singleton manager for all dashboard sections
    - Initializes with sections config from `config/config.json`
    - Filters sections by user role (`getAccessibleSections()`)
    - Loads section HTML from file (`loadSectionHTML()`)
    - Calls section's `init()` method to initialize logic
    - Calls section's `cleanup()` method before unloading
    - Stores section instances for reference
    - Checks access control before loading sections

14. **Dashboard Sections** (profile, admin, settings, etc.):
    - Self-contained components loaded into dashboard
    - Each section has HTML file (`pages/sections/[name].html`) and JS file (`js/pages/sections/[name].js`)
    - Each section object has `init()` method (called when section loads) and optional `cleanup()` method (called when section unloads)
    - Sections access user data from localStorage
    - Sections can make API calls via `apiClient`
    - Sections are role-gated (only accessible to users with correct role in `config.sections[].roles`)
    - Sections can toggle between view/edit modes, display loading states, show errors via toast system

---

## Current Implementation Status

### ✅ Completed:
- Single-page app structure
- Dynamic script loading (config-driven)
- Dynamic CSS loading from config manifest
- Router system (hash-based navigation)
- Page registration from config
- Theme system (default/dark with CSS imports)
- Console window with logging
- UI controller with error handling and toast notifications
- Login page HTML + JS with form validation and error handling
- Register page HTML + JS with form validation and error handling
- **Dashboard page** with sidebar navigation and section container
- **Dashboard section system** with role-based access control
- **Profile section** (view/edit user email and password)
- **Settings section** (theme switching, preferences)
- **Admin section** (stub for user management)
- **AuthService** with login, register, logout, token refresh, and real API integration
- **AuthGuard** with route protection, auth validation, and automatic redirects
- **ApiClient** with proxy integration, token management, and 401 interceptor
- **Proxy.php** for CORS-free API calls (client does NOT add /api)
- **DashboardSectionManager** with dynamic section loading, role filtering, and lifecycle management
- CSS structure: base + auth-base + toast-base + theme-specific overrides
- Token storage in localStorage (auth_token, refresh_token, user_data)
- **HeaderComponent** (`header.js`) with authentication status display and dynamic updates
- Created `pages/header.html` (shared header component)
- Header CSS files in both theme directories (`header.css`, `header-auth.css`)
- Protected routes (redirects to login if not authenticated)
- Automatic token refresh on 401 responses with request retry
- Toast system for user feedback (success, error, info messages)

### ⏳ Next Steps (Current Card):
1. Test dashboard sections with backend (profile edit, settings)
2. Implement admin section (user management - view, enable/disable users)
3. Add breadcrumbs/navigation indicators in dashboard header
4. Add section loading states (spinners/skeletons)
5. Test role-based access (verify non-admins can't access admin section)

### ⏳ Future Cards:
- TypeScript conversion for all services and components
- State management (Redux/Zustand/Context) implementation
- Unit and integration tests

---

## Important Notes

- **No CORS issues**: Requests go through proxy.php (same origin) → proxy forwards to backend
- **Client API calls**: Use `/auth/login` NOT `/api/auth/login` — proxy adds `/api` automatically
- **No frameworks**: Pure vanilla JS (easier to test security)
- **Modular**: Add new pages by adding HTML + JS files, then register in config
- **Script loading order matters**: Dependencies must load before dependents
- **CSS rules**: Always create files in BOTH theme directories (default + dark), add to `config/styles.json`
- **Script pattern**: All scripts are classes with `init()` method, instantiated as `window.componentInstance`
- **Header component**: Automatically updates when auth state changes, syncs with authService
- **Protected routes**: Dashboard and future admin pages redirect to login if not authenticated
- **Toast system**: Use for all user feedback (login success, errors, profile updates, etc.)
- **Error handling**: UI controller catches and displays API errors via toast notifications
- **Dashboard sections**: Role-based, dynamically loaded, self-contained with init/cleanup lifecycle
- **Section access**: Controlled via `roles` array in config.sections - only users with matching role can access

---

## FILES MAP

```
webclient/
├── config
│ ├── config.json
│ ├── scripts.json
│ └── styles.json
├── css
│ ├── auth-base.css
│ ├── base.css
│ ├── dark
│ │ ├── auth.css
│ │ ├── buttons.css
│ │ ├── console.css
│ │ ├── dashboard.css
│ │ ├── forms.css
│ │ ├── grid.css
│ │ ├── header-auth.css
│ │ ├── header.css
│ │ ├── invoice.css
│ │ ├── layout.css
│ │ ├── list.css
│ │ ├── messages.css
│ │ ├── modal-overlay.css
│ │ ├── responsive.css
│ │ ├── sections.css
│ │ ├── subscriptions.css
│ │ ├── tables.css
│ │ ├── tabs.css
│ │ ├── toast.css
│ │ └── utilities.css
│ ├── default
│ │ ├── auth.css
│ │ ├── buttons.css
│ │ ├── console.css
│ │ ├── dashboard.css
│ │ ├── forms.css
│ │ ├── grid.css
│ │ ├── header-auth.css
│ │ ├── header.css
│ │ ├── invoice.css
│ │ ├── layout.css
│ │ ├── list.css
│ │ ├── messages.css
│ │ ├── modal-overlay.css
│ │ ├── responsive.css
│ │ ├── sections.css
│ │ ├── subscriptions.css
│ │ ├── tables.css
│ │ ├── tabs.css
│ │ ├── toast.css
│ │ └── utilities.css
│ ├── style.css
│ ├── theme-switcher.css
│ └── toast-base.css
├── index.html
├── js
│ ├── app.js
│ ├── components
│ │ └── header.js
│ ├── console.js
│ ├── console-logger.js
│ ├── dashboard-section-manager.js
│ ├── initializer.js
│ ├── pages
│ │ ├── dashboard.js
│ │ ├── login.js
│ │ ├── register.js
│ │ └── sections
│ │     ├── admin.js
│ │     ├── billmanager.js
│ │     ├── mysubscriptions.js
│ │     ├── operator.js
│ │     ├── plans.js
│ │     ├── profile.js
│ │     ├── settings.js
│ │     └── subscriptionsman.js
│ ├── router.js
│ ├── script-loader.js
│ ├── services
│ │ ├── authGuard.js
│ │ └── authService.js
│ ├── theme-manager.js
│ ├── ui-controller.js
│ └── utils
│     └── apiClient.js
├── pages
│ ├── dashboard.html
│ ├── header.html
│ ├── login.html
│ ├── register.html
│ └── sections
│     ├── admin.html
│     ├── billmanager.html
│     ├── mysubscriptions.html
│     ├── operator.html
│     ├── plans.html
│     ├── profile.html
│     ├── settings.html
│     └── subscriptionsman.html
└── proxy.php

```

---

DO NOT ANSWER WAIT I SEND ALL MATERIALS AND ASK YOU
