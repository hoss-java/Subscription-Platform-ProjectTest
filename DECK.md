---
Title: Subscription-Api
Description: plans and project management sheets
Date: 
Robots: noindex,nofollow
Template: index
---

# Subscription-Api

## Analyzing all parts

|#|Part|Details|Total Duration|Status|
|:-|:-|:-|:-|:-|
|1|-|-|-|-|-|
|:-|:-|:-|::||


## Timeplan

```mermaid
gantt
    section %BOARD%
```

# 1 - subscriptionapi

## 001-0001
> **Setup a maven project.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> The goal of this card is to set up a maven project for Subscription-Platform.
> 
> # DOD (definition of done):
> A maven is setup.
> 
> # TODO:
> - [ ] 1. 
> 
> # Reports:
> *
> </details>

## 001-0002
> **Untitled** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> Title: Setup Maven project with Spring Boot and authentication dependencies.
> Tags: Backend, Setup, Phase-1
> Creator: 
> AssignedTo: 
> # Time tracker settings
> StartAt: 
> EndAt: 
> The goal of this card is to initialize a Spring Boot Maven project with all necessary dependencies for implementing JWT-based authentication and role-based access control.
> 
> # DOD (definition of done):
> - Maven project is created and compiles successfully
> - All required dependencies are added (Spring Security, JWT library, Spring Data JPA, MySQL/PostgreSQL driver)
> - Application properties are configured for database connection
> - Project structure follows Spring Boot best practices
> - README includes setup instructions for running the project locally
> 
> # TODO:
> - [x] 1. Create new Maven project with Spring Boot starter parent
> - [x] 2. Add Spring Security dependency to pom.xml
> - [x] 3. Add JWT library (jjwt or io.jsonwebtoken)
> - [x] 4. Add Spring Data JPA and database driver dependencies
> - [x] 5. Add Lombok dependency for reducing boilerplate
> - [x] 6. Configure application.yml with database and server settings
> - [x] 7. Create package structure (config, controller, service, repository, entity, dto, exception, security)
> - [x] 8. Verify project builds without errors
> - [x] 9. Create .gitignore and initial commit
> 
> # Reports:
> * Add Spring Security dependency to pom.xml
> > * spring-boot-starter-security provides authentication and authorization mechanisms — it secures your application by handling user login, password management, and access control to protect your endpoints.
> >>```
> >><dependency>
> >>    <groupId>org.springframework.boot</groupId>
> >>    <artifactId>spring-boot-starter-security</artifactId>
> >></dependency>
> >>```
> * Add JWT library (jjwt or io.jsonwebtoken)
> > * io.jsonwebtoken (jjwt) creates and validates JWT tokens for stateless authentication — users receive a token after login and use it to access protected resources without storing session data on the server.
> >>```
> >><!-- JWT Library for token-based authentication -->
> >><dependency>
> >>    <groupId>io.jsonwebtoken</groupId>
> >>    <artifactId>jjwt-api</artifactId>
> >>    <version>0.12.3</version>
> >></dependency>
> >><dependency>
> >>    <groupId>io.jsonwebtoken</groupId>
> >>    <artifactId>jjwt-impl</artifactId>
> >>    <version>0.12.3</version>
> >>    <scope>runtime</scope>
> >></dependency>
> >><dependency>
> >>    <groupId>io.jsonwebtoken</groupId>
> >>    <artifactId>jjwt-jackson</artifactId>
> >>    <version>0.12.3</version>
> >>    <scope>runtime</scope>
> >></dependency>
> >>```
> * Create package structure (config, controller, service, repository, entity, dto, exception, security)
> > * Only `config` and `security` are need to add
> </details>

## 001-0004
> **Untitled** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> Title: Implement user registration endpoint with validation and password hashing.
> Tags: Backend, Authentication, Phase-1
> Creator: 
> AssignedTo: 
> # Time tracker settings
> StartAt: 
> EndAt: 
> The goal of this card is to create a REST endpoint that allows new users to register with email and password, including input validation and secure password storage.
> 
> # DOD (definition of done):
> - POST /api/auth/register endpoint is created and functional
> - Request DTO (RegisterRequest) validates email and password format
> - Response DTO (AuthResponse) returns success message
> - Passwords are hashed using bcrypt before storage
> - Duplicate email prevention is implemented
> - Default CUSTOMER role is assigned to new users
> - Endpoint returns appropriate HTTP status codes (201 Created, 400 Bad Request, 409 Conflict)
> - Endpoint is tested with valid and invalid inputs
> 
> # TODO:
> - [ ] 1. Create RegisterRequest DTO with email, password, passwordConfirm, firstName, lastName fields
> - [ ] 2. Create AuthResponse DTO with message, token (null for registration), and user details
> - [ ] 3. Create AuthController with register method
> - [ ] 4. Implement password hashing using BCryptPasswordEncoder
> - [ ] 5. Create UserService with registerUser method
> - [ ] 6. Add email uniqueness validation (check if email already exists)
> - [ ] 7. Add password confirmation validation
> - [ ] 8. Add password strength validation (minimum length, complexity)
> - [ ] 9. Assign default CUSTOMER role to newly registered users
> - [ ] 10. Create unit tests for registration logic
> - [ ] 11. Create integration tests for /api/auth/register endpoint
> 
> # Reports:
> *
> </details>

## 001-0005
> **Untitled** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> Title: Implement user login endpoint with JWT token generation.
> Tags: Backend, Authentication, JWT, Phase-1
> Creator: 
> AssignedTo: 
> # Time tracker settings
> StartAt: 
> EndAt: 
> The goal of this card is to create a login endpoint that authenticates users and generates JWT tokens for subsequent API requests.
> 
> # DOD (definition of done):
> - POST /api/auth/login endpoint is created and functional
> - JWT access token is generated upon successful login
> - Refresh token is generated and stored securely
> - Token contains user id, email, and roles as claims
> - Invalid credentials return 401 Unauthorized
> - Tokens have configurable expiration times
> - Token payload is verifiable and tamper-proof
> - Endpoint is tested with correct and incorrect credentials
> 
> # TODO:
> - [ ] 1. Create LoginRequest DTO with email and password fields
> - [ ] 2. Create JwtTokenProvider service for token generation and validation
> - [ ] 3. Configure JWT secret key and expiration times in application.yml
> - [ ] 4. Implement token generation with user claims (id, email, roles)
> - [ ] 5. Implement token signing with HS256 algorithm
> - [ ] 6. Create login method in AuthController
> - [ ] 7. Implement authentication logic in UserService
> - [ ] 8. Create RefreshToken entity for storing refresh tokens
> - [ ] 9. Implement refresh token persistence and retrieval
> - [ ] 10. Return JWT token and refresh token in AuthResponse
> - [ ] 11. Create unit tests for JwtTokenProvider
> - [ ] 12. Create integration tests for /api/auth/login endpoint
> 
> # Reports:
> *
> </details>

## 001-0006
> **Untitled** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> Title: Implement JWT token validation filter and Spring Security configuration.
> Tags: Backend, Security, JWT, Phase-1
> Creator: 
> AssignedTo: 
> # Time tracker settings
> StartAt: 
> EndAt: 
> The goal of this card is to create a security filter that validates JWT tokens on incoming requests and integrate it with Spring Security configuration.
> 
> # DOD (definition of done):
> - JwtAuthenticationFilter is created and intercepts requests
> - Token validation checks signature, expiration, and claims
> - Invalid or expired tokens are rejected with 401 Unauthorized
> - Valid tokens extract user information and populate SecurityContext
> - SecurityConfig configures filter chain and public/protected endpoints
> - CORS is configured to allow frontend communication
> - Token extraction from Authorization header works correctly
> - Filter is tested with valid, expired, and invalid tokens
> 
> # TODO:
> - [ ] 1. Create JwtAuthenticationFilter extending OncePerRequestFilter
> - [ ] 2. Implement token extraction from Authorization header (Bearer scheme)
> - [ ] 3. Implement token validation (signature, expiration, format)
> - [ ] 4. Create custom exception for invalid tokens (JwtAuthenticationException)
> - [ ] 5. Implement UserDetailsService to load user from database
> - [ ] 6. Populate SecurityContext with authenticated user on valid token
> - [ ] 7. Create SecurityConfig class with @EnableWebSecurity
> - [ ] 8. Configure filter chain in SecurityConfig
> - [ ] 9. Define public endpoints (/api/auth/login, /api/auth/register)
> - [ ] 10. Define protected endpoints (require authentication)
> - [ ] 11. Configure CORS settings for frontend origin
> - [ ] 12. Configure exception handling for authentication failures
> - [ ] 13. Create unit tests for JwtAuthenticationFilter
> - [ ] 14. Create integration tests for protected endpoints
> 
> # Reports:
> *
> </details>

## 001-0007
> **Untitled** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> Title: Implement role-based access control with authorization annotations.
> Tags: Backend, Authorization, RBAC, Phase-1
> Creator: 
> AssignedTo: 
> # Time tracker settings
> StartAt: 
> EndAt: 
> The goal of this card is to implement authorization checks based on user roles, allowing different endpoints to be accessible only to specific roles.
> 
> # DOD (definition of done):
> - @PreAuthorize annotations are used on controller methods
> - Three roles are defined: CUSTOMER, OPERATOR, ADMIN
> - Role-based endpoint access is enforced
> - Unauthorized access returns 403 Forbidden
> - Custom authorization exceptions are handled gracefully
> - Role hierarchy is established (ADMIN > OPERATOR > CUSTOMER)
> - Authorization is tested for each role type
> 
> # TODO:
> - [ ] 1. Create Role enum with CUSTOMER, OPERATOR, ADMIN values
> - [ ] 2. Create Permission enum with specific permissions
> - [ ] 3. Implement role-permission mapping in Role entity
> - [ ] 4. Configure @EnableGlobalMethodSecurity in SecurityConfig
> - [ ] 5. Create custom @Authorize annotation (optional)
> - [ ] 6. Add @PreAuthorize("hasRole('CUSTOMER')") to customer endpoints
> - [ ] 7. Add @PreAuthorize("hasRole('OPERATOR')") to operator endpoints
> - [ ] 8. Add @PreAuthorize("hasRole('ADMIN')") to admin endpoints
> - [ ] 9. Create AccessDeniedException handler
> - [ ] 10. Implement role hierarchy logic
> - [ ] 11. Create unit tests for authorization logic
> - [ ] 12. Create integration tests for role-based endpoint access
> - [ ] 13. Test unauthorized access scenarios
> 
> # Reports:
> *
> </details>

## 001-0008
> **Untitled** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> Title: Implement password change and password reset functionality.
> Tags: Backend, Authentication, Security, Phase-1
> Creator: 
> AssignedTo: 
> # Time tracker settings
> StartAt: 
> EndAt: 
> The goal of this card is to provide users with the ability to change their password when authenticated and to reset their password if forgotten.
> 
> # DOD (definition of done):
> - POST /api/auth/change-password endpoint allows authenticated users to change password
> - POST /api/auth/forgot-password endpoint initiates password reset
> - POST /api/auth/reset-password endpoint completes password reset with token
> - Old password verification is required for password change
> - Reset tokens are time-limited and single-use
> - Passwords are hashed before storage
> - Both endpoints are tested with valid and invalid inputs
> 
> # TODO:
> - [ ] 1. Create ChangePasswordRequest DTO with oldPassword and newPassword
> - [ ] 2. Create ForgotPasswordRequest DTO with email
> - [ ] 3. Create ResetPasswordRequest DTO with token and newPassword
> - [ ] 4. Create PasswordResetToken entity with token, user, expiration
> - [ ] 5. Create PasswordResetTokenRepository
> - [ ] 6. Implement changePassword method in UserService
> - [ ] 7. Implement forgotPassword method in UserService
> - [ ] 8. Implement resetPassword method in UserService
> - [ ] 9. Implement password reset token generation and validation
> - [ ] 10. Create email service for sending reset links (mock or real)
> - [ ] 11. Add change-password endpoint to AuthController
> - [ ] 12. Add forgot-password endpoint to AuthController
> - [ ] 13. Add reset-password endpoint to AuthController
> - [ ] 14. Create unit tests for password change/reset logic
> - [ ] 15. Create integration tests for password endpoints
> 
> # Reports:
> *
> </details>

## 001-0009
> **Untitled** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> Title: Create comprehensive integration tests for authentication system.
> Tags: Backend, Testing, Phase-1
> Creator: 
> AssignedTo: 
> # Time tracker settings
> StartAt: 
> EndAt: 
> The goal of this card is to create integration tests that verify the entire authentication flow works correctly end-to-end.
> 
> # DOD (definition of done):
> - Integration tests cover registration, login, token validation, and logout
> - Tests use TestRestTemplate or MockMvc for HTTP testing
> - Database is properly set up and torn down for each test
> - All success and failure scenarios are tested
> - Test coverage for authentication is above 80%
> - Tests are documented and easy to understand
> - All tests pass consistently
> 
> # TODO:
> - [ ] 1. Create AuthenticationIntegrationTest class
> - [ ] 2. Configure test database and test properties
> - [ ] 3. Create test for successful user registration
> - [ ] 4. Create test for duplicate email registration (409 Conflict)
> - [ ] 5. Create test for invalid email format (400 Bad Request)
> - [ ] 6. Create test for successful login
> - [ ] 7. Create test for login with invalid credentials (401 Unauthorized)
> - [ ] 8. Create test for accessing protected endpoint with valid token
> - [ ] 9. Create test for accessing protected endpoint without token (401 Unauthorized)
> - [ ] 10. Create test for accessing protected endpoint with expired token
> - [ ] 11. Create test for token refresh
> - [ ] 12. Create test for role-based access control
> - [ ] 13. Create test for password change
> - [ ] 14. Create test for password reset flow
> - [ ] 15. Run tests and verify coverage
> 
> # Reports:
> *
> </details>

## 001-0010
> **Untitled** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> Title: Create frontend authentication service and global state management.
> Tags: Frontend, Authentication, State-Management, Phase-1
> Creator: 
> AssignedTo: 
> # Time tracker settings
> StartAt: 
> EndAt: 
> The goal of this card is to build the authentication service layer and state management (Redux/Zustand/Context) for managing user authentication state on the frontend.
> 
> # DOD (definition of done):
> - AuthService handles API calls to backend authentication endpoints
> - State management stores user, token, and authentication status
> - Token is persisted to localStorage/sessionStorage
> - Token refresh is handled automatically
> - User role information is available globally
> - Service is type-safe (TypeScript)
> - Authentication state changes trigger UI updates
> 
> # TODO:
> - [ ] 1. Create AuthService with register, login, logout methods
> - [ ] 2. Create HTTP interceptor to add Authorization header to requests
> - [ ] 3. Create HTTP interceptor to handle 401 responses and refresh tokens
> - [ ] 4. Implement token storage in localStorage
> - [ ] 5. Implement token retrieval from localStorage on app startup
> - [ ] 6. Create Redux/Zustand/Context store for auth state
> - [ ] 7. Create auth reducer/actions for login, logout, register
> - [ ] 8. Create selectors for user, token, isAuthenticated, userRole
> - [ ] 9. Implement automatic token refresh logic
> - [ ] 10. Create TypeScript interfaces for User, AuthResponse, LoginRequest
> - [ ] 11. Create unit tests for AuthService
> - [ ] 12. Create unit tests for state management
> - [ ] 13. Test token persistence and retrieval
> 
> # Reports:
> *
> </details>

## 001-0011
> **Untitled** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> Title: Create login and registration UI components with form validation.
> Tags: Frontend, UI, Forms, Phase-1
> Creator: 
> AssignedTo: 
> # Time tracker settings
> StartAt: 
> EndAt: 
> The goal of this card is to build responsive login and registration pages with client-side validation and error handling.
> 
> # DOD (definition of done):
> - Login component displays email and password fields
> - Registration component displays email, password, confirm password, firstName, lastName fields
> - Form validation provides real-time feedback
> - Submit buttons are disabled during API requests
> - Error messages are displayed for failed requests
> - Success messages are displayed for successful registration
> - User is redirected to dashboard after successful login
> - Components are responsive and styled consistently
> - Accessibility standards are met (ARIA labels, semantic HTML)
> 
> # TODO:
> - [ ] 1. Create LoginForm component with email and password inputs
> - [ ] 2. Create RegistrationForm component with all required fields
> - [ ] 3. Implement form validation library (React Hook Form, Formik, etc.)
> - [ ] 4. Add email format validation
> - [ ] 5. Add password strength validation
> </details>

## 001-0003
> **Untitled** ![status](https://img.shields.io/badge/status-ONGOING-yellow)
> <details open>
>     <summary>Details</summary>
> Title: Create User entity and Role entity with database schema.
> Tags: Backend, Database, Phase-1
> Creator: 
> AssignedTo: 
> # Time tracker settings
> StartAt: 
> EndAt: 
> The goal of this card is to define the User and Role entities that form the foundation of the authentication system, including database tables and relationships.
> 
> # DOD (definition of done):
> - User entity is created with email, password, active status, and timestamps
> - Role entity is created with role names and permissions
> - User-Role relationship is properly mapped (Many-to-Many)
> - Database schema is generated via Hibernate
> - UserRepository and RoleRepository interfaces are created
> - Entity validation constraints are in place (email format, password length)
> 
> # TODO:
> - [x] 1. Create User entity with fields: id, email, password, firstName, lastName, isActive, createdAt, updatedAt
> - [x] 2. Create Role entity with fields: id, name (CUSTOMER, OPERATOR, ADMIN), description
> - [x] 3. Create Permission entity with fields: id, name, description
> - [x] 4. Map Many-to-Many relationship between User and Role
> - [x] 5. Map Many-to-Many relationship between Role and Permission
> - [x] 6. Add validation annotations (@Email, @NotBlank, @Size)
> - [x] 7. Create UserRepository interface extending JpaRepository
> - [x] 8. Create RoleRepository interface extending JpaRepository
> - [x] 9. Add database initialization script (schema creation)
> - [ ] 10. Test entity creation and relationships via unit tests
> 
> # Reports:
> * Create User entity with fields: id, email, password, firstName, lastName, isActive, createdAt, updatedAt
> > * User entity created with JPA @Entity annotation, database mapping via @Table, validation constraints (@Email, @NotBlank, @Size), Lombok annotations for boilerplate reduction, and automatic timestamp management for createdAt and updatedAt fields.
> > * @Data (Lombok) — generates getters, setters, equals, hashCode, toString for the entity itself
> * Create Role entity with fields: id, name (CUSTOMER, OPERATOR, ADMIN), description
> > * Role entity created with JPA @Entity annotation, RoleType enum for predefined role names (CUSTOMER, OPERATOR, ADMIN), @Enumerated annotation to store enum as string in database, and validation constraints (@NotBlank) for description field.
> * Create Permission entity with fields: id, name, description
> > * Permission entity created with JPA @Entity annotation, unique constraint on name field, and validation constraints (@NotBlank) for name and description fields to ensure data integrity.
> * Map Many-to-Many relationship between User and Role
> > * Many-to-Many relationship established using @ManyToMany annotation with @JoinTable creating a user_roles junction table, FetchType.LAZY to optimize database queries, and bidirectional mapping with mappedBy in Role entity to maintain relationship consistency.
> * Map Many-to-Many relationship between Role and Permission
> > * Many-to-Many relationship established using @ManyToMany annotation with @JoinTable creating a role_permissions junction table, FetchType.LAZY for query optimization, and bidirectional mapping with mappedBy in Permission entity to maintain relationship consistency.
> * Add validation annotations (@Email, @NotBlank, @Size)
> > * Validation annotations already added in User entity: @Email on email field to validate email format, @NotBlank on password, firstName, lastName fields to ensure they are not empty, @Size on password field to enforce minimum 6 characters length. Role and Permission entities have @NotBlank on name and description fields for data integrity.
> * Create UserRepository interface extending JpaRepository
> > * UserRepository interface created extending JpaRepository to provide CRUD operations for User entity, custom method findByEmail added to retrieve users by email for authentication purposes.
> * Create RoleRepository interface extending JpaRepository
> > * RoleRepository interface created extending JpaRepository to provide CRUD operations for Role entity, custom method findByName added to retrieve roles by RoleType enum for role assignment purposes.
> 
> * Entity Class Diagram
> ```mermaid
> >classDiagram
> >    class User {
> >        -Long id
> >        -String email
> >        -String password
> >        -String firstName
> >        -String lastName
> >        -Boolean isActive
> >        -LocalDateTime createdAt
> >        -LocalDateTime updatedAt
> >        -Set~Role~ roles
> >    }
> >
> >    class Role {
> >        -Long id
> >        -RoleType name
> >        -String description
> >        -Set~User~ users
> >        -Set~Permission~ permissions
> >    }
> >
> >    class Permission {
> >        -Long id
> >        -String name
> >        -String description
> >        -Set~Role~ roles
> >    }
> >
> >    User "1" --> "\*" Role : has
> >    Role "1" --> "\*" Permission : has
> >
> >```
> </details>
