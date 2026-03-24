# Project Summary: Spring Boot Security Layer Testing - Web Client (Complete + Updated)

## 📋 How to Use This Document

**When you ask me to update or work on this project, I will:**
- Answer **short and concisely** at the beginning
- Say **"I am ready. What we have is..."** and briefly summarize the current state
- **Wait for your next instruction** before proceeding
- Only provide detailed responses when you explicitly ask for them

---

## Project Goal
Build a **vanilla JS + HTML web client** to test a Spring Boot backend's security layer. Client features login, register, and dashboard pages with theme switching (default/dark) and a complete **authentication service layer** with JWT token management.

## Tech Stack
- **Frontend**: Vanilla JS, HTML, CSS (no frameworks)
- **Backend**: Spring Boot REST API (security endpoints ready)
- **Server**: Local dev server (e.g., http://localhost:3280)
- **Proxy**: PHP proxy at `proxy.php` (handles CORS, forwards to `http://172.32.0.11:8080/api`)
- **Authentication**: JWT tokens with refresh token rotation

---

## Architecture: Single-Page App with Dynamic Config Loading

**Why this approach?**
- Avoid hardcoding routes, scripts, settings, and CSS files
- Easy to add new pages and themes without touching `index.html`
- Maintainable and reusable across projects
- Scripts load in correct order (important for dependencies)
- CSS themes managed dynamically via config manifest

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

12. **dashboard.js** (DashboardPage):
    - Displays authenticated user's email
    - Shows logout button
    - Loads automatically after successful login
    - Protected route (redirects to login if not authenticated)

---

## Key Code Patterns

### Script Pattern (all scripts follow this):
```javascript
class MyComponent {
  constructor() { /* setup */ }
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      // actual initialization here
    });
  }
}
window.myComponentInstance = new MyComponent();
```

### Page Pattern (login.js, register.js, dashboard.js, etc.):
```javascript
const LoginPage = {
  init() {
    console.log('Login page loaded');
    // attach event listeners
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await authService.login(email, password);
        // redirect to dashboard on success
        router.navigate('dashboard');
      } catch (error) {
        // show error toast
      }
    });
  }
};
```

### Auth Service Usage:
```javascript
// Login
await authService.login('user@example.com', 'password123');
// Token automatically stored in localStorage

// Check if authenticated
if (authService.isAuthenticated()) {
  // show dashboard
}

// Make API call (token auto-attached, goes through proxy)
const response = await apiClient.get('/auth/data');  // NO /api prefix

// Logout
authService.logout();
```

### ApiClient & Proxy Usage:
```javascript
// Client call (no /api prefix)
await apiClient.post('/auth/login', { email, password });

// ApiClient converts to:
// POST ./proxy.php?path=/auth/login

// Proxy receives and forwards to:
// POST http://172.32.0.11:8080/api/auth/login
```

### Router Usage:
```javascript
router.register('login', 'pages/login.html', LoginPage);
// User clicks #login → router loads pages/login.html → calls LoginPage.init()
```

---

## Authentication Flow

| Step | Component | Action |
|------|-----------|--------|
| 1 | `initializer.js` | Calls `authGuard.initialize()` on app startup |
| 2 | `authGuard.js` | Checks for stored JWT token in localStorage |
| 3 | `authService.js` | Validates token expiration without API call |
| 4 | Router | Loads login page if no token, dashboard if valid token |
| 5 | `headerInstance.init()` | Displays login status in header |
| 6 | User | Enters credentials on login page |
| 7 | `LoginPage.init()` | Calls `authService.login(email, password)` |
| 8 | `authService.js` | Calls `apiClient.post('/auth/login', ...)` |
| 9 | `apiClient.js` | Sends POST to `./proxy.php?path=/auth/login` |
| 10 | `proxy.php` | Forwards to `http://172.32.0.11:8080/api/auth/login` |
| 11 | Backend | Returns JWT + refresh token |
| 12 | `authService.js` | Stores tokens in localStorage |
| 13 | `header.js` | Updates header to show username + logout button |
| 14 | Router | Navigates to dashboard |
| 15 | `DashboardPage.init()` | Displays user email and logout button |
| 16 | User | Makes API calls, tokens auto-attached by apiClient |
| 17 | If 401 response | `apiClient.js` calls `authService.refreshToken()` |
| 18 | Retry | Request retried with new JWT |
| 19 | Logout | `authService.logout()` clears tokens, `header.js` updates to show login links |

---

## API Endpoints (via Proxy)

Client calls `/auth/login` → Proxy forwards to `http://172.32.0.11:8080/api/auth/login`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | Authenticate user, return JWT + refresh token |
| POST | `/auth/refresh` | Exchange refresh token for new JWT |
| POST | `/auth/validate` | Check if JWT is valid (optional) |
| POST | `/auth/logout` | Invalidate refresh token (optional) |
| POST | `/auth/change-password` | Update user password |
| POST | `/auth/forgot-password` | Request password reset email |
| POST | `/auth/reset-password` | Complete password reset with token |

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
- Dashboard page HTML + JS (displays user email + logout button)
- **AuthService** with login, register, logout, token refresh, and real API integration
- **AuthGuard** with route protection, auth validation, and automatic redirects
- **ApiClient** with proxy integration, token management, and 401 interceptor
- **Proxy.php** for CORS-free API calls (client does NOT add /api)
- CSS structure: base + auth-base + toast-base + theme-specific overrides
- Token storage in localStorage (auth_token, refresh_token, user_data)
- **HeaderComponent** (`header.js`) with authentication status display and dynamic updates
- Created `pages/header.html` (shared header component)
- Header CSS files in both theme directories (`header.css`, `header-auth.css`)
- Protected routes (redirects to login if not authenticated)
- Automatic token refresh on 401 responses with request retry
- Toast system for user feedback (success, error, info messages)

### ⏳ Next Steps (Current Card):
1. Get register flow fully working (test with backend)
2. Create role-based dashboard views (admin vs user/customer)
3. Create admin panel page with user management (view, enable/disable users)
4. Create user profile edit page (update email, name, etc.)
5. Add role-based route guards (redirect non-admin users from admin panel)

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

---

## RULES FOR DEVELOPMENT

### When Adding New Scripts:
1. Create class with `init()` method
2. Instantiate as `window.componentInstance = new ClassName()`
3. Add to `config/scripts.json` in correct order (dependencies first)
4. ScriptLoader will automatically load and initialize

### When Adding New CSS:
1. Check existing CSS files first to understand patterns
2. Create TWO files: one in `default/` theme, one in `dark/` theme
3. Follow existing naming and structure
4. Add both files to `config/styles.json`
5. Ask to see relevant CSS before creating new attributes

### When Making API Calls:
1. Use `/endpoint` NOT `/api/endpoint`
2. Proxy automatically adds `/api` prefix
3. Token automatically attached by `apiClient.js`
4. All requests go through `proxy.php` for CORS handling

### When Creating Pages:
1. Create HTML in `pages/` directory
2. Create corresponding JS file in `js/pages/` subdirectory
3. JS file contains object with `init()` method
4. Register page in `config/config.json` with path, script reference, and protected flag
5. Router handles loading and initialization

## 📝 Note on Debug Logging

When you ask me to **add debug logging to code**, I'll use:
```javascript
console.debug('[ComponentName] Debug message here');
```

This will automatically route through your **ConsoleLogger** instance, which:
- Captures caller info (file, line, method)
- Logs to both browser console AND custom console window
- Formats as: `[file:line:column] method() - message`

---

## FILES MAP

```
webclient/
├── index.html
├── proxy.php
│
├── config/
│   ├── config.json
│   ├── scripts.json
│   └── styles.json
│
├── css/
│   ├── style.css
│   ├── base.css
│   ├── auth-base.css
│   ├── toast-base.css
│   ├── theme-switcher.css
│   ├── default/
│   │   ├── auth.css
│   │   ├── buttons.css
│   │   ├── console.css
│   │   ├── forms.css
│   │   ├── header.css
│   │   ├── header-auth.css
│   │   ├── layout.css
│   │   ├── list.css
│   │   ├── messages.css
│   │   ├── responsive.css
│   │   ├── tables.css
│   │   ├── tabs.css
│   │   ├── toast.css
│   │   └── utilities.css
│   └── dark/
│       ├── auth.css
│       ├── buttons.css
│       ├── console.css
│       ├── forms.css
│       ├── header.css
│       ├── header-auth.css
│       ├── layout.css
│       ├── list.css
│       ├── messages.css
│       ├── responsive.css
│       ├── tables.css
│       ├── tabs.css
│       ├── toast.css
│       └── utilities.css
│
├── js/
│   ├── script-loader.js
│   ├── initializer.js
│   ├── router.js
│   ├── app.js
│   ├── console.js
│   ├── console-logger.js
│   ├── theme-manager.js
│   ├── ui-controller.js
│   ├── utils/
│   │   └── apiClient.js
│   ├── services/
│   │   ├── authService.js
│   │   └── authGuard.js
│   ├── components/
│   │   └── header.js
│   └── pages/
│       ├── login.js
│       ├── register.js
│       └── dashboard.js
│
└── pages/
    ├── header.html
    ├── login.html
    ├── register.html
    └── dashboard.html
```

---

## Current Task: Build Role-Based Authentication & User Management

**What we're building:**
Extending the authentication layer to support role-based access control (admin vs user/customer). The system now:
1. Stores user role information from backend after login
2. Displays role-based dashboard views (admin panel vs user dashboard)
3. Protects admin pages with role-based route guards
4. Allows users to edit their profiles
5. Allows admins to manage users (view, enable/disable)

**Current Status:**
- ✅ Basic authentication flow working (login, register, logout)
- ✅ Protected routes (redirects to login if not authenticated)
- ✅ Token refresh on 401 responses
- ✅ Toast notifications for user feedback
- ✅ Simple dashboard (shows user email +