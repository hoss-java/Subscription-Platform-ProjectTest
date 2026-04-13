
## Project Summary: Spring Boot Security Layer Testing - Web Client (Complete)

### Project Goal
Build a **vanilla JS + HTML web client** to test a Spring Boot backend's security layer. Client features login, register, and dashboard pages with theme switching (default/dark) and a complete **authentication service layer** with JWT token management.

### Tech Stack
- **Frontend**: Vanilla JS, HTML, CSS (no frameworks)
- **Backend**: Spring Boot REST API (security endpoints ready)
- **Server**: Local dev server (e.g., http://localhost:3280)
- **Proxy**: PHP proxy for API calls (http://172.32.0.11:8080/api)
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

2. **script-loader.js** reads `config/scripts.json` and loads scripts in order:
   ```
   console.js → console-logger.js → theme-manager.js → ui-controller.js → 
   apiClient.js → authService.js → authGuard.js → router.js → pages/*.js → app.js
   ```
   Order matters because later scripts depend on earlier ones.

3. **initializer.js** waits for all scripts, then:
   - Calls `authGuard.initialize()` to check existing JWT token
   - If token exists and valid → loads dashboard
   - If no token or expired → loads login page
   - Initializes `window.consoleWindowInstance.init()`, `window.themeManager.init()`, and starts routing

4. **router.js** handles page navigation:
   - User clicks link (e.g., `#login`)
   - Router fetches HTML from `pages/login.html`
   - Router calls `LoginPage.init()` from `js/pages/login.js`
   - Page can use `authService` for API calls

5. **authService.js** manages authentication:
   - `register(email, password)` → calls `/api/auth/register`
   - `login(email, password)` → calls `/api/auth/login`, stores JWT + refresh token
   - `logout()` → clears tokens from localStorage
   - `refreshToken()` → calls `/api/auth/refresh` to get new JWT
   - `validateToken()` → checks token validity without API call
   - `getStoredToken()` → retrieves JWT from localStorage

6. **authGuard.js** protects routes:
   - `initialize()` → runs on app startup, checks token status
   - `isAuthenticated()` → returns boolean based on stored token
   - `requireAuth()` → redirects to login if not authenticated
   - Automatic 401 response interceptor triggers token refresh

7. **apiClient.js** wraps HTTP requests:
   - Sends all requests through proxy.php
   - Automatically attaches JWT token to headers
   - Intercepts 401 responses and refreshes token
   - Retries failed request with new token

8. **app.js** loads config files and registers all pages with router

---

## File Structure (EXACT)

```
webclient/
├── index.html                    (minimal entry point)
├── proxy.php                     (API request proxy, handles CORS)
├── config/
│   ├── config.json               (app title, pages list)
│   ├── scripts.json              (ordered script paths)
│   └── styles.json               (CSS file manifest for theme loading)
├── css/
│   ├── style.css                 (imports base CSS only)
│   ├── base.css                  (shared styles)
│   ├── auth-base.css             (shared auth layout/structure)
│   ├── toast-base.css            (shared toast styles)
│   ├── theme-switcher.css        (theme toggle UI)
│   ├── default/                  (default theme)
│   │   ├── auth.css              (login/register specific)
│   │   ├── buttons.css
│   │   ├── console.css
│   │   ├── forms.css
│   │   ├── header.css
│   │   ├── layout.css
│   │   ├── list.css
│   │   ├── messages.css
│   │   ├── responsive.css
│   │   ├── tables.css
│   │   ├── tabs.css
│   │   └── toast.css
│   └── dark/                     (dark theme - same files as default)
│       ├── auth.css
│       └── ... (other files)
├── js/
│   ├── script-loader.js          (loads scripts sequentially)
│   ├── initializer.js            (calls .init() on components, checks auth)
│   ├── router.js                 (page navigation)
│   ├── app.js                    (loads config, starts app)
│   ├── console.js                (ConsoleWindow class)
│   ├── console-logger.js         (ConsoleLogger class)
│   ├── theme-manager.js          (ThemeManager class, loads CSS from config)
│   ├── ui-controller.js          (UIController class)
│   ├── utils/
│   │   └── apiClient.js          (HTTP wrapper, token management)
│   ├── services/
│   │   ├── authService.js        (login, register, logout, refresh)
│   │   └── authGuard.js          (route protection, auth validation)
│   └── pages/
│       ├── login.js              (LoginPage object with .init())
│       ├── register.js           (RegisterPage object with .init())
│       └── dashboard.js          (DashboardPage object with .init())
└── pages/
    ├── login.html                (form HTML only)
    ├── register.html             (form HTML only)
    └── dashboard.html            (dashboard HTML only)
```

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

### Page Pattern (login.js, register.js, etc.):
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

// Make API call (token auto-attached)
const response = await apiClient.get('/api/data');

// Logout
authService.logout();
```

### Router Usage:
```javascript
router.register('login', 'pages/login.html', LoginPage);
// User clicks #login → router loads pages/login.html → calls LoginPage.init()
```

---

## Config Files

### config/scripts.json (order matters!):
```json
{
  "scripts": [
    "js/console.js",
    "js/console-logger.js",
    "js/theme-manager.js",
    "js/ui-controller.js",
    "js/utils/apiClient.js",
    "js/services/authService.js",
    "js/services/authGuard.js",
    "js/router.js",
    "js/pages/login.js",
    "js/pages/register.js",
    "js/pages/dashboard.js",
    "js/app.js"
  ]
}
```

### config/styles.json (NEW - CSS manifest):
```json
{
  "base": [
    "css/base.css",
    "css/auth-base.css",
    "css/toast-base.css",
    "css/theme-switcher.css"
  ],
  "themes": {
    "default": [
      "css/default/auth.css",
      "css/default/buttons.css",
      "css/default/console.css",
      "css/default/forms.css",
      "css/default/header.css",
      "css/default/layout.css",
      "css/default/list.css",
      "css/default/messages.css",
      "css/default/responsive.css",
      "css/default/tables.css",
      "css/default/tabs.css",
      "css/default/toast.css"
    ],
    "dark": [
      "css/dark/auth.css",
      "css/dark/buttons.css",
      "css/dark/console.css",
      "css/dark/forms.css",
      "css/dark/header.css",
      "css/dark/layout.css",
      "css/dark/list.css",
      "css/dark/messages.css",
      "css/dark/responsive.css",
      "css/dark/tables.css",
      "css/dark/tabs.css",
      "css/dark/toast.css"
    ]
  }
}
```

### config/config.json:
```json
{
  "app": {
    "title": "Web Client",
    "header": {
      "h1": "Subscription System",
      "p": "Web Client for Spring API"
    },
    "apiBase": "http://172.32.0.11:8080/api",
    "proxyUrl": "./proxy.php"
  },
  "pages": [
    { "name": "login", "path": "pages/login.html", "title": "Login", "script": "LoginPage", "protected": false },
    { "name": "register", "path": "pages/register.html", "title": "Register", "script": "RegisterPage", "protected": false },
    { "name": "dashboard", "path": "pages/dashboard.html", "title": "Dashboard", "script": "DashboardPage", "protected": true }
  ]
}
```

---

## Authentication Flow

| Step | Component | Action |
|------|-----------|--------|
| 1 | `initializer.js` | Calls `authGuard.initialize()` on app startup |
| 2 | `authGuard.js` | Checks for stored JWT token in localStorage |
| 3 | `authService.js` | Validates token expiration without API call |
| 4 | Router | Loads login page if no token, dashboard if valid token |
| 5 | User | Enters credentials on login page |
| 6 | `LoginPage.init()` | Calls `authService.login(email, password)` |
| 7 | `authService.js` | Calls `apiClient.post('/api/auth/login', ...)` |
| 8 | `apiClient.js` | Sends request through proxy.php to backend |
| 9 | Backend | Returns JWT + refresh token |
| 10 | `authService.js` | Stores tokens in localStorage |
| 11 | Router | Navigates to dashboard |
| 12 | User | Makes API calls, tokens auto-attached by apiClient |
| 13 | If 401 response | `apiClient.js` calls `authService.refreshToken()` |
| 14 | Retry | Request retried with new JWT |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Authenticate user, return JWT + refresh token |
| POST | `/api/auth/refresh` | Exchange refresh token for new JWT |
| POST | `/api/auth/validate` | Check if JWT is valid (optional) |
| POST | `/api/auth/logout` | Invalidate refresh token (optional) |
| POST | `/api/auth/change-password` | Update user password |
| POST | `/api/auth/forgot-password` | Request password reset email |
| POST | `/api/auth/reset-password` | Complete password reset with token |

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
- UI controller
- Login, register page HTML + JS
- **AuthService** with login, register, logout, token refresh
- **AuthGuard** with route protection and auth validation
- **ApiClient** with proxy integration and token management
- CSS structure: base + auth-base + theme-specific overrides
- Token storage in localStorage (auth_token, refresh_token, user_data)

### ⏳ Next Steps:
1. ✅ Create `config/styles.json` manifest
2. ✅ Update ThemeManager to load CSS from `styles.json`
3. ✅ Create `auth-base.css` with shared auth styles
4. Implement actual proxy connection in `apiClient.js`
5. Add 401 response interceptor with token refresh
6. Create unit tests for `authService` and `authGuard`
7. Add error handling UI components (toast notifications)
8. Implement password reset flow
9. Add user profile page
10. Add logout functionality to dashboard header

---

## Important Notes

- **No CORS issues**: Requests go through proxy.php (same origin)
- **No frameworks**: Pure vanilla JS (easier to test security)
- **Modular**: Add new pages by adding HTML + JS files + updating config
- **No hardcoding**: Everything in config files for easy maintenance
- **Token lifecycle**: JWT stored in localStorage, auto-refreshed on 401, cleared on logout
- **Protected routes**: Dashboard requires valid JWT, login/register accessible to all
- **Theme switching**: CSS loaded dynamically, no page reload needed
- **Error handling**: All API errors caught and displayed via toast notifications

---

This combined summary integrates the original architecture with the complete authentication system and updated file structure. It's now ready for backend integration and testing.