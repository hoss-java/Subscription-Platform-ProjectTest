---

## Project Summary: Spring Boot Security Layer Testing - Web Client

### Project Goal
Build a **vanilla JS + HTML web client** to test a Spring Boot backend's security layer. Client has login, register, and dashboard pages with theme switching (default/dark).

### Tech Stack
- **Frontend**: Vanilla JS, HTML, CSS (no frameworks)
- **Backend**: Spring Boot REST API (not built yet)
- **Server**: Local dev server (e.g., http://localhost:3280)

### Architecture: Single-Page App with Dynamic Config Loading

**Why this approach?**
- Avoid hardcoding routes, scripts, and settings
- Easy to add new pages without touching `index.html`
- Maintainable and reusable across projects
- Scripts load in correct order (important for dependencies)

### How It Works (Step-by-Step)

1. **index.html** loads ONLY two scripts:
   - `script-loader.js` (loads other scripts sequentially)
   - `initializer.js` (initializes components after scripts load)

2. **script-loader.js** reads `config/scripts.json` and loads scripts in order:
   ```
   console.js → console-logger.js → theme-manager.js → ui-controller.js → router.js → pages/*.js → app.js
   ```
   Order matters because later scripts depend on earlier ones.

3. **initializer.js** waits for all scripts, then calls `.init()` on each component:
   - `window.consoleWindowInstance.init()`
   - `window.themeManager.init()`
   - `window.initApp()` (starts routing)

4. **router.js** handles page navigation:
   - User clicks link (e.g., `#login`)
   - Router fetches HTML from `pages/login.html`
   - Router calls `LoginPage.init()` from `js/pages/login.js`

5. **app.js** loads `config/config.json` and registers all pages with router

### File Structure (EXACT)
```
webclient/
├── index.html                    (minimal entry point)
├── config/
│   ├── config.json               (app title, pages list)
│   └── scripts.json              (ordered script paths)
├── css/
│   ├── style.css                 (imports everything)
│   ├── base.css, toast-base.css
│   ├── default/                  (theme: header, layout, forms, buttons, etc.)
│   └── dark/                     (same files as default, different colors)
├── js/
│   ├── script-loader.js          (loads scripts sequentially)
│   ├── initializer.js            (calls .init() on components)
│   ├── router.js                 (page navigation)
│   ├── app.js                    (loads config, starts app)
│   ├── console.js                (ConsoleWindow class)
│   ├── console-logger.js         (ConsoleLogger class)
│   ├── theme-manager.js          (ThemeManager class)
│   ├── ui-controller.js          (UIController class)
│   └── pages/
│       ├── login.js              (LoginPage object with .init())
│       ├── register.js           (RegisterPage object with .init())
│       └── dashboard.js          (DashboardPage object with .init())
└── pages/
    ├── login.html                (form HTML only)
    ├── register.html             (form HTML only)
    └── dashboard.html            (dashboard HTML only)
```

### Key Code Patterns

**Script Pattern** (all scripts follow this):
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

**Page Pattern** (login.js, register.js, etc.):
```javascript
const LoginPage = {
  init() {
    console.log('Login page loaded');
    // attach event listeners, etc.
  }
};
```

**Router Usage**:
```javascript
router.register('login', 'pages/login.html', LoginPage);
// User clicks #login → router loads pages/login.html → calls LoginPage.init()
```

### Config Files

**config/scripts.json** (order matters!):
```json
{
  "scripts": [
    "js/console.js",
    "js/console-logger.js",
    "js/theme-manager.js",
    "js/ui-controller.js",
    "js/router.js",
    "js/pages/login.js",
    "js/pages/register.js",
    "js/pages/dashboard.js",
    "js/app.js"
  ]
}
```

**config/config.json**:
```json
{
  "app": {
    "title": "Web Client",
    "header": {
      "h1": "Subscription System",
      "p": "Web Client for Spring API"
    }
  },
  "pages": [
    { "name": "login", "path": "pages/login.html", "title": "Login", "script": "LoginPage" },
    { "name": "register", "path": "pages/register.html", "title": "Register", "script": "RegisterPage" },
    { "name": "dashboard", "path": "pages/dashboard.html", "title": "Dashboard", "script": "DashboardPage" }
  ]
}
```

### Current Implementation Status
✅ **Done:**
- Single-page app structure
- Dynamic script loading (config-driven)
- Router system (hash-based navigation)
- Page registration from config
- Theme system (default/dark with CSS imports)
- Console window with logging
- UI controller
- Login, register page HTML + JS (no backend calls yet)

⏳ **Next Steps:**
1. Create Spring Boot backend with `/api/auth/login` and `/api/auth/register` endpoints
2. Add fetch calls in login.js and register.js to hit backend
3. Store JWT token in localStorage
4. Add auth guard to dashboard
5. Implement logout

### Important Notes
- **No CORS issues**: Scripts load via `<script>` tags (same origin)
- **No frameworks**: Pure vanilla JS (easier to test security)
- **Modular**: Add new pages by adding HTML + JS files + updating config
- **No hardcoding**: Everything in config files for easy maintenance

---

This summary should help me (and you) remember exactly what was built and how to continue.