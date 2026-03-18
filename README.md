# Subscription-Platform - ProjectTest v1

# Subscription Platform Backend Development Plan

[**Deck Board**](https://github.com/hoss-java/Subscription-Platform-ProjectTest/blob/main/DECK.md)

## Project Overview

The subscription platform will serve multiple service providers (operators), each managing their own catalog of subscription plans. Customers will authenticate, browse available plans across operators, manage subscriptions, and switch between offerings. The system requires role-based access control to handle different user types and permissions.

---

## Development Phases Breakdown

| Phase | Component | Backend Deliverables | Frontend Deliverables | Duration | Testing Focus |
|-------|-----------|----------------------|----------------------|----------|----------------|
| **Phase 1** | Authentication & Authorization | JWT token generation, user registration, login endpoints, role-based access control (RBAC), password hashing, token refresh mechanism | Login form, registration form, role-based UI routing, token storage (localStorage/sessionStorage), logout functionality | 2-3 weeks | Unit tests for auth logic, integration tests for endpoints, manual testing of login/logout flows |
| **Phase 2** | User Profile Management | Customer profile CRUD operations, profile detail endpoints, update profile endpoints, password change functionality | Profile view page, edit profile form, password change form, profile picture upload (optional) | 1-2 weeks | Profile update validation, permission checks, data persistence |
| **Phase 3** | Operator & Plan Catalog | Operator endpoints (list operators), plan endpoints (list plans by operator, filter by service type), plan details retrieval, plan status management | Operator listing page, plan catalog display, filtering by service type (Internet/Mobile), plan detail modal, search functionality | 2 weeks | Plan filtering logic, operator isolation, caching strategies |
| **Phase 4** | Subscription Management | Subscription creation (subscribe to plan), subscription retrieval (list customer subscriptions), plan change logic, subscription cancellation, subscription status tracking | Subscription dashboard, subscribe button/flow, active subscriptions list, plan change modal, cancel confirmation dialog | 2-3 weeks | Subscription state transitions, business rule validation, concurrent operation handling |
| **Phase 5** | Advanced Features | Billing history endpoints, subscription renewal logic, plan upgrade/downgrade rules, notification system (email/SMS triggers), audit logging | Billing history view, invoice download, renewal status display, subscription change history | 2-3 weeks | Business logic validation, notification delivery, audit trail accuracy |
| **Phase 6** | Deployment & Optimization | API documentation (Swagger/OpenAPI), performance optimization, security hardening, database indexing, monitoring setup | Performance testing, security testing (XSS, CSRF), load testing | 1-2 weeks | End-to-end testing, production readiness |

---

## Phase 1: Authentication & Authorization (Starting Point)

The foundation begins with establishing a secure authentication system that will protect all subsequent operations. This phase creates the gatekeeper for the entire platform.

### What Gets Built in Backend

**User Registration Flow**: The system will accept new user registrations with email and password. Passwords will be securely hashed before storage, ensuring they cannot be retrieved even if the database is compromised. The registration endpoint will validate input data and prevent duplicate accounts.

**Login & Token Generation**: When users log in with valid credentials, the system will generate a **JWT (JSON Web Token)** that acts as a digital passport for subsequent requests. This token contains encoded information about the user and their role, allowing the system to verify identity without storing session data on the server.

**Role-Based Access Control (RBAC)**: Different user types will exist—customers, operators, and administrators. Each role will have specific permissions. The authentication layer will enforce these permissions, ensuring a customer cannot access operator management endpoints, for example.

**Token Refresh Mechanism**: Tokens will have expiration times for security. A refresh token will allow users to obtain new access tokens without re-entering credentials, improving user experience while maintaining security.

**Password Security**: Beyond hashing, the system will implement salt rounds and use industry-standard algorithms (bcrypt or similar) to resist brute-force attacks.

### What Gets Built in Frontend

**Login Interface**: A form where users enter email and password. Upon successful authentication, the token gets stored locally and the user is redirected to the appropriate dashboard based on their role.

**Registration Interface**: A form for new users to create accounts. This will include validation feedback and error messaging.

**Token Management**: The frontend will store the JWT token and automatically include it in all subsequent API requests. When the token expires, the frontend will request a new one using the refresh token.

**Role-Based Routing**: Different routes will be accessible based on user role. A customer accessing `/operator-dashboard` would be redirected to `/customer-dashboard`.

**Logout Functionality**: Clearing stored tokens and redirecting to the login page.

### Why This Phase Comes First

Every other feature depends on knowing who the user is and what they're allowed to do. Building authentication first establishes the security perimeter and provides a testing ground for API communication between frontend and backend.

---

## Implementation Architecture for Phase 1

### Backend Structure

The authentication system will use **Spring Security** with JWT integration. Controllers will handle HTTP requests for registration and login. Services will orchestrate the authentication logic. Repositories will manage user data persistence. Custom filters will intercept requests and validate tokens before they reach protected endpoints.

### Key Entities

**User Entity**: Stores email, hashed password, and role information. This is the central record for authentication.

**Role Entity**: Defines available roles (CUSTOMER, OPERATOR, ADMIN) and their associated permissions.

**JWT Configuration**: Defines token expiration times, secret keys, and claim structures.

### Security Considerations

Tokens will be signed with a secret key, preventing tampering. Passwords will never be logged or transmitted in plain text. HTTPS will be required for all authentication endpoints. CORS policies will restrict token access to legitimate frontend origins.

---

## Parallel Frontend Development Strategy

While backend authentication is being built, the frontend team will:

- **Develop UI components** for login and registration without waiting for backend completion
- **Mock API responses** to test form validation and navigation flows
- **Build state management** (Redux, Zustand, or Context API) for token storage and user state
- **Create routing guards** that prevent access to protected pages when unauthenticated

Once the backend authentication endpoints are ready, the mock API calls are replaced with real ones—the UI and logic remain unchanged.

---

## Testing Approach for Phase 1

**Backend Unit Tests**: Verify password hashing, token generation, role validation, and input validation work correctly in isolation.

**Backend Integration Tests**: Test the complete flow from registration request through token generation, and from login request through token validation.

**Frontend Unit Tests**: Verify form validation, token storage, and routing logic.

**Manual Testing**: Use tools like Postman to test endpoints directly. Test login with correct and incorrect credentials. Verify tokens expire as configured. Test accessing protected endpoints with and without valid tokens.

**Cross-Origin Testing**: Ensure the frontend can communicate with the backend despite being on different origins (localhost:3000 vs localhost:8080).

---

## What Comes After Phase 1

Once authentication is solid and both teams have a working communication pipeline, Phase 2 introduces customer profile management. Customers will be able to view and edit their information. This phase reuses the authentication system to ensure only the correct user can access their own profile.

The momentum from Phase 1 accelerates subsequent phases—each one builds on the security foundation already in place.