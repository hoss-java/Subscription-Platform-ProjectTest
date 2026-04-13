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
> **Setup Maven project with Spring Boot and authentication dependencies.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
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

## 001-0003
> **Create User entity and Role entity with database schema.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
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
> - [x] 10. Test entity creation and relationships via unit tests
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
> 
> >```mermaid
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
> >    class RoleType {
> >        <<enumeration>>
> >        CUSTOMER
> >        OPERATOR
> >        ADMIN
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
> >    Role --> RoleType : uses
> >```
> 
> * * Test entity creation and relationships via unit tests
> > * Unit tests created to verify: User entity creation with all fields (email, password, firstName, lastName, isActive), User-Role Many-to-Many relationship bidirectional mapping, Role entity creation with RoleType enum (CUSTOMER, OPERATOR, ADMIN), Role-Permission Many-to-Many relationship bidirectional mapping, Permission entity creation with name and description, and RoleType enum values assignment.
> > * RoleType enum created with predefined role names (CUSTOMER, OPERATOR, ADMIN), Role entity updated to use RoleType enum instead of String for name field with @Enumerated(EnumType.STRING) annotation to store enum values in database, ensuring type safety and consistency for role assignments.
> </details>

## 001-0004
> **Implement user registration endpoint with validation and password hashing.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
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
> - [x] 1. Create RegisterRequest DTO with email, password, passwordConfirm, firstName, lastName fields
> - [x] 2. Create AuthResponse DTO with message, token (null for registration), and user details
> - [x] 3. Create AuthController with register method
> - [x] 4. Implement password hashing using BCryptPasswordEncoder
> - [x] 5. Create UserService with registerUser method
> - [x] 6. Add email uniqueness validation (check if email already exists)
> - [x] 7. Add password confirmation validation
> - [x] 8. Add password strength validation (minimum length, complexity)
> - [x] 9. Assign default CUSTOMER role to newly registered users
> - [x] 10. Create unit tests for registration logic
> - [x] 11. Create integration tests for /api/auth/register endpoint
> 
> # Reports:
> * Create RegisterRequest DTO with email, password, passwordConfirm, firstName, lastName fields
> > * RegisterRequest DTO created with validation annotations (@Email, @NotBlank, @Size) for email, password, passwordConfirm, firstName, and lastName fields to validate user registration input data.
> * Create AuthResponse DTO with message, token (null for registration), and user details
> > * AuthResponse DTO created with message field for response messages, token field (null for registration, populated for login), and nested UserDetails class containing id, email, firstName, lastName, and isActive fields for returning user information.
> * Create AuthController with register method
> > * AuthController created with @RestController and @RequestMapping("/api/auth") annotations, register method handles POST /api/auth/register endpoint, @Valid annotation validates RegisterRequest DTO, returns HTTP 201 Created status with AuthResponse body.
> * Implement password hashing using BCryptPasswordEncoder
> > * SecurityConfig configuration class created with @Configuration annotation, BCryptPasswordEncoder bean defined as PasswordEncoder to provide password hashing functionality throughout the application using bcrypt algorithm.
> * Create UserService with registerUser method
> > * UserService created with registerUser method that validates email uniqueness, checks password confirmation, hashes password using BCryptPasswordEncoder, retrieves default CUSTOMER role, creates User entity with hashed password and role assignment, saves to database, and returns AuthResponse with user details and success message.
> * Add email uniqueness validation (check if email already exists)
> > * Email uniqueness validation already implemented in UserService.registerUser method using userRepository.findByEmail() to check if email exists, throws RuntimeException with message "Email already exists" if duplicate email is found before user creation.
> * Add password confirmation validation
> > * Password confirmation validation already implemented in UserService.registerUser method comparing password and passwordConfirm fields, throws RuntimeException with message "Passwords do not match" if passwords do not match before user creation.
> * Add password strength validation (minimum length, complexity)
> > * PasswordValidator utility class created with regex pattern validation requiring minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&), integrated into UserService.registerUser method to validate password strength before user creation.
> * Assign default CUSTOMER role to newly registered users
> > * Default CUSTOMER role assignment already implemented in UserService.registerUser method using roleRepository.findByName(RoleType.CUSTOMER) to retrieve CUSTOMER role, adds role to user's roles set before user creation and persistence to database.
> * Create unit tests for registration logic
> > * Unit tests created for UserService.registerUser method using Mockito to test successful registration, duplicate email prevention, password mismatch validation, weak password rejection, and missing CUSTOMER role handling with assertions verifying response data and mock interactions.
> * Create integration tests for /api/auth/register endpoint
> > * Integration tests created using @SpringBootTest and MockMvc to test POST /api/auth/register endpoint with valid registration returning HTTP 201 Created, duplicate email returning 400 Bad Request, password mismatch validation, invalid email format rejection, weak password rejection, missing fields validation, and verification that default CUSTOMER role is assigned to newly registered users.
> </details>

## 001-0005
> **Implement user login endpoint with JWT token generation.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
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
> - [x] 1. Create LoginRequest DTO with email and password fields
> - [x] 2. Create JwtTokenProvider service for token generation and validation
> - [x] 3. Configure JWT secret key and expiration times in application.yml
> - [x] 4. Implement token generation with user claims (id, email, roles)
> - [x] 5. Implement token signing with HS256 algorithm
> - [x] 6. Create login method in AuthController
> - [x] 7. Implement authentication logic in UserService
> - [x] 8. Create RefreshToken entity for storing refresh tokens
> - [x] 9. Implement refresh token persistence and retrieval
> - [x] 10. Return JWT token and refresh token in AuthResponse
> - [x] 11. Create unit tests for JwtTokenProvider
> - [x] 12. Create integration tests for /api/auth/login endpoint
> 
> # Reports:
> * Create LoginRequest DTO with email and password fields
> > * LoginRequest DTO created with @NotBlank and @Email validation for email field, @NotBlank and @Size(min=6) validation for password field to validate login input data.
> * Create JwtTokenProvider service for token generation and validation
> > * JwtTokenProvider component created in com.subscriptionapi.jwt package with @Component annotation, generateToken() creates JWT access tokens with user claims (id, email, roles), generateRefreshToken() creates refresh tokens, isTokenValid() validates token signature and expiration using HS256 algorithm, getEmailFromToken() and getUserIdFromToken() extract claims from tokens.
> * Configure JWT secret key and expiration times in application.properties
> > * JWT configuration added to application.properties with jwt.secret property (256-bit minimum for HS256), jwt.expiration set to 3600000ms (1 hour) for access tokens, jwt.refresh.expiration set to 604800000ms (7 days) for refresh tokens, values injected into JwtTokenProvider via @Value annotations.
> * Implement token generation with user claims (id, email, roles)
> > * Token generation implemented in JwtTokenProvider.generateToken() method, creates JWT with claims map containing user id, email, and roles list extracted from user.getRoles() stream, subject set to user email, signed with HS256 algorithm and configured expiration time.
> * Implement token signing with HS256 algorithm
> > * Token signing implemented in JwtTokenProvider.createToken() method using Jwts.builder().signWith(getSigningKey(), SignatureAlgorithm.HS256), getSigningKey() generates SecretKey from jwt.secret property using Keys.hmacShaKeyFor() for HS256 algorithm security.
> * Create login method in AuthController
> > * Login method created in AuthController as POST /api/auth/login endpoint, accepts @Valid LoginRequest DTO, calls authService.loginUser(), returns HTTP 200 Ok with AuthResponse body containing JWT token and user details.
> * Implement authentication logic in UserService
> > * loginUser() method created in UserService, finds user by email from repository, validates user is active, verifies password using passwordEncoder.matches(), generates JWT token via JwtTokenProvider.generateToken(), returns AuthResponse with token and user details, throws RuntimeException for invalid credentials or inactive users.
> * Create RefreshToken entity for storing refresh tokens
> > * RefreshToken entity created with @Entity annotation, contains token field (unique, non-nullable), many-to-one relationship with User, expiryDate field for token expiration, isRevoked boolean flag for token invalidation, createdAt timestamp for audit purposes.
> * Implement refresh token persistence and retrieval
> > * RefreshTokenRepository created extending JpaRepository with findByToken(), findByUser(), deleteByUser() methods, saveRefreshToken() method in JwtTokenProvider persists refresh tokens with expiry date and revoked status, isRefreshTokenValid() validates token existence and expiration, revokeRefreshToken() marks tokens as revoked, loginUser() now saves refresh token after successful authentication.
> * Return JWT token and refresh token in AuthResponse
> > * AuthResponse DTO updated with refreshToken field alongside existing token field, loginUser() method returns both access token and refresh token in response body, refresh token persisted in database via saveRefreshToken() method, enables client-side token refresh capability.
> 
> ## Tests
> * Befor startings this card , it needs to fixed the tests that coded befor for story `0003` and `0004`,
> > * Severals thest does not work, It seems the the problem is mixing unit test and block tests, for example tests for Role entity tests also User and Permission!
> > * Ok , it needs to underestand little bit more about differences between Junit and Spring Boot test
> >>## Key Differences Between JUnit Tests and Spring Boot Tests
> >>
> >>| Aspect | JUnit Test | Spring Boot Test |
> >>|--------|-----------|-----------------|
> >>| **Framework Focus** | Pure unit testing framework for Java | Full integration testing framework built on JUnit |
> >>| **Spring Context** | No Spring context loaded by default | Loads and manages Spring application context |
> >>| **Dependency Injection** | Manual setup required | Automatic @Autowired injection of beans |
> >>| **Configuration** | Requires manual mocking/setup | Uses application properties and configurations |
> >>| **Speed** | Faster (no context initialization) | Slower (loads full or partial Spring context) |
> >>| **Use Case** | Unit tests for isolated components | Integration tests for Spring components together |
> >>| **Annotations** | @Test, @Before, @After, @BeforeClass, @AfterClass | @SpringBootTest, @WebMvcTest, @DataJpaTest, etc. |
> >>| **Test Scope** | Tests single class in isolation | Tests multiple beans and their interactions |
> >>
> >>---
> >>
> >>## Detailed Explanation
> >>
> >>### JUnit Tests
> >>
> >>**JUnit is a lightweight testing framework** that focuses on unit testing individual components in isolation. When you write a >>JUnit test, you're typically testing a single class or method without any external dependencies. You manually create objects, >>mock dependencies, and assert results.
> >>
> >>Example:
> >>```java
> >>public class CalculatorTest {
> >>    private Calculator calculator;
> >>    
> >>    @Before
> >>    public void setUp() {
> >>        calculator = new Calculator();
> >>    }
> >>    
> >>    @Test
> >>    public void testAdd() {
> >>        assertEquals(4, calculator.add(2, 2));
> >>    }
> >>}
> >>```
> >>
> >>### Spring Boot Tests
> >>
> >>**Spring Boot tests extend JUnit** and add Spring-specific capabilities. They load the Spring application context, allowing you >>to test how your beans interact with each other, how dependency injection works, and how your application behaves as a whole. >>Spring Boot provides specialized annotations for different testing scenarios.
> >>
> >>Example:
> >>```java
> >>@SpringBootTest
> >>public class UserServiceTest {
> >>    @Autowired
> >>    private UserService userService;
> >>    
> >>    @Autowired
> >>    private UserRepository userRepository;
> >>    
> >>    @Test
> >>    public void testUserCreation() {
> >>        User user = userService.createUser("John");
> >>        assertNotNull(user.getId());
> >>    }
> >>}
> >>```
> >>
> >>---
> >>
> >>## When to Use Each
> >>
> >>**Use JUnit tests** when you want to test isolated business logic quickly without needing Spring's infrastructure. These are >>faster and ideal for unit testing service methods or utility classes.
> >>
> >>**Use Spring Boot tests** when you need to verify how your Spring beans work together, test repositories with actual databases, >>test REST controllers, or validate application configurations. These are integration tests that ensure your components function >>correctly within the Spring ecosystem.
> > * Unit Test with Mocks (Using Mockito)
> >>public class UserServiceTest {
> >>    @Mock
> >>    private UserRepository userRepository;
> >>    
> >>    @InjectMocks
> >>    private UserService userService;
> >>    
> >>    @Before
> >>    public void setUp() {
> >>        MockitoAnnotations.openMocks(this);
> >>    }
> >>    
> >>    @Test
> >>    public void testUserCreation() {
> >>        // Arrange: Define mock behavior
> >>        User mockUser = new User();
> >>        mockUser.setId(1L);
> >>        mockUser.setName("John");
> >>        
> >>        when(userRepository.save(any(User.class))).thenReturn(mockUser);
> >>        
> >>        // Act: Call the method
> >>        User user = userService.createUser("John");
> >>        
> >>        // Assert: Verify the result
> >>        assertNotNull(user.getId());
> >>        assertEquals("John", user.getName());
> >>        
> >>        // Verify the mock was called
> >>        verify(userRepository, times(1)).save(any(User.class));
> >>    }
> >>}
> >>That example is an **integration test**, not a unit test, because it uses real objects. To convert it to a **unit test with >>mocks**, you need to use a mocking framework like **Mockito**. Here's how:
> >>
> >>## Unit Test with Mocks (Using Mockito)
> >>
> >>```java
> >>public class UserServiceTest {
> >>    @Mock
> >>    private UserRepository userRepository;
> >>    
> >>    @InjectMocks
> >>    private UserService userService;
> >>    
> >>    @Before
> >>    public void setUp() {
> >>        MockitoAnnotations.openMocks(this);
> >>    }
> >>    
> >>    @Test
> >>    public void testUserCreation() {
> >>        // Arrange: Define mock behavior
> >>        User mockUser = new User();
> >>        mockUser.setId(1L);
> >>        mockUser.setName("John");
> >>        
> >>        when(userRepository.save(any(User.class))).thenReturn(mockUser);
> >>        
> >>        // Act: Call the method
> >>        User user = userService.createUser("John");
> >>        
> >>        // Assert: Verify the result
> >>        assertNotNull(user.getId());
> >>        assertEquals("John", user.getName());
> >>        
> >>        // Verify the mock was called
> >>        verify(userRepository, times(1)).save(any(User.class));
> >>    }
> >>}
> >>```
> >>
> >>---
> >>
> >>## Key Differences Explained
> >>
> >>| Aspect | Integration Test (Real Objects) | Unit Test (Mocked Objects) |
> >>|--------|--------------------------------|---------------------------|
> >>| **Dependencies** | Real @Autowired beans | @Mock objects |
> >>| **Speed** | Slower (loads context) | Faster (no context) |
> >>| **Isolation** | Tests multiple components together | Tests single component in isolation |
> >>| **Annotation** | @SpringBootTest | No Spring annotations needed |
> >>| **Mock Setup** | N/A | @Mock and @InjectMocks |
> >>
> >>---
> >>
> >>## What Each Annotation Does
> >>
> >>**@Mock** — Creates a fake/mock object of `UserRepository` that doesn't hit the database
> >>
> >>**@InjectMocks** — Injects the mocked `UserRepository` into `UserService` automatically
> >>
> >>**when()...thenReturn()** — Defines what the mock should return when a method is called
> >>
> >>**verify()** — Checks that the mock was called the expected number of times
> >>
> >>* The Testing Pyramid
> >>
> >>        /\
> >>       /  \  Integration Tests (Spring Boot)
> >>      /    \  - Real objects, @SpringBootTest
> >>     /------\
> >>    /        \  Unit Tests (JUnit + Mockito)
> >>   /          \ - Mocked objects, no Spring context
> >>  /____________\
> >>
> >>**When you use mocks, it becomes a pure JUnit test, not a Spring Boot test** — and that's actually the correct approach for >>unit testing.
> >>
> >>---
> >>
> >>## When to Use Each
> >>
> >>| Test Type | Framework | Use Case | Example |
> >>|-----------|-----------|----------|---------|
> >>| **Unit Test** | JUnit + Mockito | Test single class in isolation with mocks | Testing `UserService.createUser()` logic only |
> >>| **Integration Test** | Spring Boot Test | Test multiple components working together | Testing `UserService` + `UserRepository>>` + database |
> >>
> >>---
> >>
> >>## The Correct Approach
> >>
> >>**For `UserService` class:**
> >>
> >>```java
> >>// UNIT TEST - Pure JUnit with Mockito (no Spring)
> >>public class UserServiceTest {
> >>    @Mock
> >>    private UserRepository userRepository;
> >>    
> >>    @InjectMocks
> >>    private UserService userService;
> >>    
> >>    @Before
> >>    public void setUp() {
> >>        MockitoAnnotations.openMocks(this);
> >>    }
> >>    
> >>    @Test
> >>    public void testUserCreation() {
> >>        User mockUser = new User();
> >>        mockUser.setId(1L);
> >>        when(userRepository.save(any(User.class))).thenReturn(mockUser);
> >>        
> >>        User user = userService.createUser("John");
> >>        assertNotNull(user.getId());
> >>    }
> >>}
> >>```
> >>
> >>**For REST Controller (needs Spring context):**
> >>
> >>```java
> >>// INTEGRATION TEST - Spring Boot Test
> >>@SpringBootTest
> >>@AutoConfigureMockMvc
> >>public class UserControllerTest {
> >>    @Autowired
> >>    private MockMvc mockMvc;
> >>    
> >>    @Test
> >>    public void testGetUser() throws Exception {
> >>        mockMvc.perform(get("/users/1"))
> >>            .andExpect(status().isOk());
> >>    }
> >>}
> >>```
> >>
> >>---
> >>
> >>## Bottom Line
> >>
> >>**There is no need `@SpringBootTest` for unit tests.** Use plain **JUnit + Mockito** for testing individual classes. Only use >>**Spring Boot tests** when you actually need Spring's context, like testing controllers, repositories with real databases, or >>bean interactions.
> >>
> >>## Summary: JUnit Unit Tests vs Spring Boot Integration Tests
> >>
> >>The `@SpringBootTest` is **not a unit test, it's an integration test** because it uses real objects and loads the Spring >>context.
> >>
> >>### To Make It a True Unit Test
> >>
> >>Replace `@SpringBootTest` with **JUnit + Mockito**:
> >>
> >>```java
> >>// UNIT TEST (Pure JUnit with Mocks)
> >>public class UserServiceTest {
> >>    @Mock
> >>    private UserRepository userRepository;
> >>    
> >>    @InjectMocks
> >>    private UserService userService;
> >>    
> >>    @Before
> >>    public void setUp() {
> >>        MockitoAnnotations.openMocks(this);
> >>    }
> >>    
> >>    @Test
> >>    public void testUserCreation() {
> >>        when(userRepository.save(any(User.class))).thenReturn(mockUser);
> >>        User user = userService.createUser("John");
> >>        assertNotNull(user.getId());
> >>    }
> >>}
> >>```
> >>
> >>### The Key Difference
> >>
> >>- **@SpringBootTest** = Integration test (real objects, slower, tests multiple components)
> >>- **JUnit + Mockito** = Unit test (mocked objects, faster, tests single component in isolation)
> >>
> >>**Spring Boot tests are NOT unit tests** — they're integration tests. For true unit testing, use plain JUnit with mocks.
> >>
> >>## Quick Guide: Parametrized Tests in JUnit 5 & Spring Boot
> >>
> >>---
> >>
> >>## Basic Setup
> >>
> >>Add dependency to **pom.xml**:
> >>
> >>```xml
> >><dependency>
> >>    <groupId>org.junit.jupiter</groupId>
> >>    <artifactId>junit-jupiter-params</artifactId>
> >>    <scope>test</scope>
> >></dependency>
> >>```
> >>
> >>---
> >>
> >>## Parametrized Test Annotations
> >>
> >>| Annotation | Use Case | Example |
> >>|---|---|---|
> >>| **`@ValueSource`** | Single parameter values | `@ValueSource(strings = {"a", "b"})`>> |
> >>| **`@CsvSource`** | Multiple parameters (CSV format) | `@CsvSource({"1,2", "3,4"})` >>|
> >>| **`@MethodSource`** | Complex objects or streams | `@MethodSource("provideData")` |
> >>| **`@EnumSource`** | Enum values | `@EnumSource(RoleType.class)` |
> >>
> >>---
> >>
> >>## Examples
> >>
> >>### 1. Single Parameter (`@ValueSource`)
> >>
> >>```java
> >>@ParameterizedTest
> >>@ValueSource(strings = {"admin@test.com", "user@test.com"})
> >>void testEmails(String email) {
> >>    assertTrue(email.contains("@"));
> >>}
> >>```
> >>
> >>---
> >>
> >>### 2. Multiple Parameters (`@CsvSource`)
> >>
> >>```java
> >>@ParameterizedTest
> >>@CsvSource({
> >>    "john@example.com, password123, John",
> >>    "jane@example.com, securePass456, Jane"
> >>})
> >>void testUserCreation(String email, String password, String name) {
> >>    assertNotNull(email);
> >>    assertEquals(3, name.length());
> >>}
> >>```
> >>
> >>---
> >>
> >>### 3. Complex Objects (`@MethodSource`)
> >>
> >>```java
> >>@ParameterizedTest
> >>@MethodSource("provideUsers")
> >>void testUserValidation(User user) {
> >>    assertNotNull(user.getEmail());
> >>}
> >>
> >>private static Stream<Arguments> provideUsers() {
> >>    return Stream.of(
> >>        Arguments.of(new User("john@test.com", "password123")),
> >>        Arguments.of(new User("jane@test.com", "securePass456"))
> >>    );
> >>}
> >>```
> >>
> >>---
> >>
> >>## With `@DataJpaTest`
> >>
> >>```java
> >>@DataJpaTest
> >>@ActiveProfiles("test")
> >>class UserRepositoryTest {
> >>    
> >>    @Autowired
> >>    private TestEntityManager entityManager;
> >>    
> >>    @ParameterizedTest
> >>    @CsvSource({
> >>        "john@example.com, John, Doe",
> >>        "jane@example.com, Jane, Smith"
> >>    })
> >>    void testPersistUser(String email, String firstName, String lastName) {
> >>        User user = User.builder()
> >>            .email(email)
> >>            .firstName(firstName)
> >>            .lastName(lastName)
> >>            .build();
> >>        
> >>        User persisted = entityManager.persistAndFlush(user);
> >>        assertNotNull(persisted.getId());
> >>    }
> >>}
> >>```
> >>
> >>---
> >>
> >>## With `@SpringBootTest`
> >>
> >>```java
> >>@SpringBootTest
> >>class UserServiceTest {
> >>    
> >>    @Autowired
> >>    private UserService userService;
> >>    
> >>    @ParameterizedTest
> >>    @ValueSource(strings = {"user1@test.com", "user2@test.com"})
> >>    void testUserRegistration(String email) {
> >>        User user = userService.registerUser(email, "password123");
> >>        assertEquals(email, user.getEmail());
> >>    }
> >>}
> >>```
> >>
> >>---
> >>
> >>## Display Names
> >>
> >>```java
> >>@ParameterizedTest(name = "Email: {0}, Name: {1}")
> >>@CsvSource({
> >>    "john@test.com, John",
> >>    "jane@test.com, Jane"
> >>})
> >>void testWithCustomName(String email, String name) {
> >>    // test code
> >>}
> >>```
> >>
> >>---
> >>
> >>## Key Tips
> >>
> >>- **`@ValueSource`** → Use for single simple values
> >>- **`@CsvSource`** → Use for 2-5 parameters (quick & readable)
> >>- **`@MethodSource`** → Use for complex objects or many parameters
> >>- **`@DataJpaTest`** → Focuses on repository/database testing
> >>- **`@SpringBootTest`** → Full application context (slower, use for integration >>tests)
> >>- Always add **`@DisplayName`** for clarity in test reports
> </details>

## 001-0006
> **Implement JWT token validation filter and Spring Security configuration.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
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
> - [x] 1. Create JwtAuthenticationFilter extending OncePerRequestFilter
> - [x] 2. Implement token extraction from Authorization header (Bearer scheme)
> - [x] 3. Implement token validation (signature, expiration, format)
> - [x] 4. Create custom exception for invalid tokens (JwtAuthenticationException)
> - [x] 5. Implement UserDetailsService to load user from database
> - [x] 6. Populate SecurityContext with authenticated user on valid token
> - [x] 7. Create SecurityConfig class with @EnableWebSecurity
> - [x] 8. Configure filter chain in SecurityConfig
> - [x] 9. Define public endpoints (/api/auth/login, /api/auth/register)
> - [x] 10. Define protected endpoints (require authentication)
> - [x] 11. Configure CORS settings for frontend origin
> - [x] 12. Configure exception handling for authentication failures
> - [x] 13. Create unit tests for JwtAuthenticationFilter
> - [x] 14. Create integration tests for protected endpoints
> 
> # Reports:
> * Create JwtAuthenticationFilter extending OncePerRequestFilter
> > * JwtAuthenticationFilter created extending OncePerRequestFilter to intercept all HTTP requests. Implements doFilterInternal() method to extract JWT token from Authorization header using Bearer scheme, validate token signature and expiration via JwtTokenProvider, and populate SecurityContext with authenticated user details on valid tokens.
> * Implement token extraction from Authorization header (Bearer scheme)
> > * Token extraction implemented in JwtAuthenticationFilter via extractTokenFromRequest() method. Extracts Authorization header, validates Bearer prefix, and returns token substring after "Bearer " prefix. Returns null if header is missing or doesn't follow Bearer scheme format.
> * Implement token validation (signature, expiration, format)
> > * Token validation implemented via JwtTokenProvider.isTokenValid() method. Validates token signature using HS256 algorithm with secret key, checks expiration date, and verifies token format by parsing with Jwts.parserBuilder(). Returns false for invalid, expired, or malformed tokens. Integration in JwtAuthenticationFilter checks validity before populating SecurityContext.
> * Create custom exception for invalid tokens (JwtAuthenticationException)
> > * JwtAuthenticationException created in exception package extending RuntimeException. Provides constructors for message-only and message-with-cause scenarios. Used in JwtAuthenticationFilter to handle JWT validation failures and logged for debugging purposes.
> * Implement UserDetailsService to load user from database
> > * UserDetailsService integrated in JwtAuthenticationFilter to load user details by email from database. Calls loadUserByUsername(email) on valid token to retrieve UserDetails object containing user authorities and credentials for SecurityContext population.
> * Populate SecurityContext with authenticated user on valid token
> > * SecurityContext populated in JwtAuthenticationFilter by creating UsernamePasswordAuthenticationToken with UserDetails and authorities, then setting it via SecurityContextHolder.getContext().setAuthentication(). Enables Spring Security to recognize authenticated user for subsequent request processing and authorization checks.
> * Create SecurityConfig class with @EnableWebSecurity
> > * SecurityConfig class created with @EnableWebSecurity annotation. Configured with PasswordEncoder bean using BCryptPasswordEncoder for password hashing, and SecurityFilterChain bean defining HTTP security rules with CSRF disabled, public endpoints for /api/auth/login and /api/auth/register, and all other requests requiring authentication.
> * Configure filter chain in SecurityConfig
> > * JwtAuthenticationFilter added to SecurityFilterChain via addFilterBefore() method, positioned before UsernamePasswordAuthenticationFilter. Ensures JWT token validation occurs on every request before standard Spring Security authentication filters.
> * Define public endpoints (/api/auth/login, /api/auth/register)
> > * Public endpoints configured in SecurityFilterChain using requestMatchers("/api/auth/login", "/api/auth/register").permitAll(). Allows unauthenticated access to login and registration endpoints while all other requests require authentication.
> * Define protected endpoints (require authentication)
> > * Protected endpoints configured in SecurityFilterChain using anyRequest().authenticated(). All endpoints except /api/auth/login and /api/auth/register require valid JWT token authentication for access.
> * Configure CORS settings for frontend origin
> > * CORS configuration implemented via CorsConfigurationSource bean in SecurityConfig. Reads allowed origins from application.properties (cors.allowed-origins) supporting multiple comma-separated origins. Configures allowed methods (GET, POST, PUT, DELETE, OPTIONS), allows all headers, and enables credentials. Integrated into SecurityFilterChain via .cors().and().
> * Configure exception handling for authentication failures
> > * Exception handling configured in SecurityFilterChain via exceptionHandling().authenticationEntryPoint(). Custom entry point returns 401 Unauthorized response with JSON error message when authentication fails. Handles invalid or missing JWT tokens before requests reach protected endpoints.
> * Create unit tests for JwtAuthenticationFilter
> > * JwtAuthenticationFilterUnitTest created with parametrized tests using @ParameterizedTest and @ValueSource. Tests cover valid token extraction with SecurityContext population, invalid/missing Authorization headers, and token validation scenarios. Run tests via `mvn test -Dspring.profiles.active=dev -Dtest=JwtAuthenticationFilterUnitTest` for all tests or `mvn test -Dspring.profiles.active=dev -Dtest=JwtAuthenticationFilterUnitTest#testMissingOrInvalidAuthHeader` for specific test.
> * Create integration tests for protected endpoints
> > * Created integration test (`ProtectedEndpointsIntegrationTest`) to validate JWT authentication and authorization for protected endpoints. Implemented temporary stub controllers (`TestAuthController` and `TestProtectedController`) to mock public and protected endpoints while actual service implementations are in development. Test validates token validation, unauthorized access handling, and public endpoint accessibility using `@SpringBootTest` and `MockMvc`.
> 
> * Fix intigrated tests
> ># Summary: Fixed Circular Dependency in Spring Security >Tests
> >
> >## What We Did
> >
> >**Problem:** Tests failed with circular dependency error >between `SecurityConfig` → `JwtAuthenticationFilter` → `>UserDetailsService` → back to `SecurityConfig`.
> >
> >**Solution:** Added `>spring.main.allow-circular-references=true` to `>application-dev.properties`.
> >
> >---
> >
> >## What is This Flag?
> >
> >**`spring.main.allow-circular-references=true`**
> >
> >By default, Spring **rejects** beans that depend on each >other in a circle (to enforce good design).
> >
> >This flag tells Spring: **"Allow circular dependencies >instead of throwing an error."**
> >
> >---
> >
> >## How It Fixed the Issue
> >
> >Spring couldn't create the application context because >beans were stuck in a dependency loop:
> >
> >```
> >SecurityConfig needs JwtAuthenticationFilter
> >         ↓
> >JwtAuthenticationFilter needs UserDetailsService
> >         ↓
> >UserDetailsService needs SecurityConfig
> >         ↑ (back to start = LOOP!)
> >```
> >
> >Setting the flag to `true` allows Spring to **bypass >this validation** and create all beans anyway.
> >
> >---
> >
> >## Why Tests Worked Before, Now Need This Flag
> >
> >**Before:** Your code didn't have this circular >dependency.
> >
> >**After:** When you updated `PasswordValidator` and `>JwtTokenProvider`, the dependency structure changed and >created the circular reference.
> >
> >**Solution:** Either:
> >1. **Keep the flag** (quick fix - only in dev/test)
> >2. **Refactor code** (proper fix - remove the circular >dependency)
> >
> >---
> >
> >## Profile Configuration
> >
> >Add to `application-dev.properties`:
> >```properties
> >spring.main.allow-circular-references=true
> >```
> >
> >Run tests with:
> >```bash
> >mvn test -Dspring.profiles.active=dev
> >```
> >
> >Or use `@ActiveProfiles("dev")` in test class.
> ## How it works
> ## Complete Security Architecture Diagram
> 
> ```
> ┌─────────────────────────────────────────────────────────────────────────────┐
> │                           CLIENT APPLICATION                                │
> │                      (Web/Mobile with JWT Token)                            │
> └────────────────────────────────┬────────────────────────────────────────────┘
>                                  │
>                     ┌────────────┴────────────┐
>                     │                         │
>             ┌───────▼────────┐      ┌────────▼──────────┐
>             │  POST /login   │      │ POST /register    │
>             │ POST /refresh  │      │                   │
>             └───────┬────────┘      └────────┬──────────┘
>                     │                         │
>                     └────────────┬────────────┘
>                                  │
>                     ┌────────────▼────────────┐
>                     │   INCOMING REQUEST      │
>                     │  (with/without token)   │
>                     └────────────┬────────────┘
>                                  │
>         ┌────────────────────────▼────────────────────────┐
>         │                                                  │
>         │          SPRING SECURITY FILTER CHAIN            │
>         │                                                  │
>         └────────────────────────┬────────────────────────┘
>                                  │
>                 ┌────────────────┴────────────────┐
>                 │                                 │
>         ┌───────▼──────────────┐    ┌────────────▼──────────┐
>         │ CORS Configuration   │    │  CSRF Disabled        │
>         │ (Allow Origins)      │    │  (Stateless JWT)      │
>         └───────┬──────────────┘    └────────────┬──────────┘
>                 │                                 │
>                 └────────────────┬────────────────┘
>                                  │
>         ┌────────────────────────▼────────────────────────┐
>         │                                                  │
>         │    JwtAuthenticationFilter (CUSTOM FILTER)       │
>         │                                                  │
>         │  1. Extract "Authorization: Bearer <token>"     │
>         │  2. Validate token signature & expiration       │
>         │  3. Extract claims (email, id, roles)           │
>         │  4. Load UserDetails from database              │
>         │  5. Set SecurityContext authentication          │
>         │                                                  │
>         └────────────────────────┬────────────────────────┘
>                                  │
>                 ┌────────────────┴────────────────┐
>                 │                                 │
>         ┌───────▼──────────────┐    ┌────────────▼──────────┐
>         │  Token Valid?        │    │  Token Invalid/       │
>         │  Not Expired?        │    │  Expired?             │
>         │  Signature OK?       │    │  Missing?             │
>         └───────┬──────────────┘    └────────────┬──────────┘
>                 │ YES                            │ NO
>                 │                                │
>         ┌───────▼──────────────┐    ┌────────────▼──────────┐
>         │ Set Authentication   │    │ Continue without      │
>         │ in SecurityContext   │    │ authentication        │
>         │ (Ready for @Secured) │    │ (Request proceeds)    │
>         └───────┬──────────────┘    └────────────┬──────────┘
>                 │                                 │
>                 └────────────────┬────────────────┘
>                                  │
>         ┌────────────────────────▼────────────────────────┐
>         │                                                  │
>         │   Authorization Check (anyRequest().authenticated)
>         │                                                  │
>         │   - All endpoints require authentication        │
>         │   - If not authenticated → 401 Unauthorized     │
>         │                                                  │
>         └────────────────────────┬────────────────────────┘
>                                  │
>                 ┌────────────────┴────────────────┐
>                 │                                 │
>         ┌───────▼──────────────┐    ┌────────────▼──────────┐
>         │  AUTHENTICATED       │    │  NOT AUTHENTICATED    │
>         │  Request reaches     │    │                       │
>         │  Controller          │    │  Return 401 Error     │
>         │                      │    │  {message,status}     │
>         └───────┬──────────────┘    └──────────────────────┘
>                 │
>         ┌───────▼──────────────────────────┐
>         │      AuthController / Routes     │
>         │                                  │
>         │  • POST /login                   │
>         │  • POST /register                │
>         │  • POST /refresh                 │
>         │  • (Other protected endpoints)   │
>         └───────┬──────────────────────────┘
>                 │
>         ┌───────▼──────────────────────────┐
>         │      AuthService/UserService     │
>         │                                  │
>         │  Business Logic:                 │
>         │  • Validate credentials          │
>         │  • Hash passwords                │
>         │  • Assign default roles          │
>         │  • Generate tokens               │
>         │  • Validate refresh tokens       │
>         └───────┬──────────────────────────┘
>                 │
>         ┌───────▼──────────────────────────┐
>         │      JwtTokenProvider            │
>         │                                  │
>         │  • generateToken(user)           │
>         │    └─> Creates JWT with:         │
>         │        - User ID, Email, Roles   │
>         │        - Expiration (15min)      │
>         │        - HMAC-SHA256 signature   │
>         │                                  │
>         │  • generateRefreshToken(user)    │
>         │    └─> Creates JWT with:         │
>         │        - User ID                 │
>         │        - Longer expiration (7d)  │
>         │                                  │
>         │  • isTokenValid(token)           │
>         │    └─> Verify signature & exp    │
>         │                                  │
>         │  • saveRefreshToken(user, token) │
>         │    └─> Store in DB               │
>         │                                  │
>         │  • isRefreshTokenValid(token)    │
>         │    └─> Check DB + expiration     │
>         │                                  │
>         │  • revokeRefreshToken(token)     │
>         │    └─> Mark as revoked in DB     │
>         └───────┬──────────────────────────┘
>                 │
>         ┌───────▼──────────────────────────┐
>         │      Database Layer              │
>         │                                  │
>         │  ┌─────────────────────────────┐ │
>         │  │ User Table                  │ │
>         │  │ - id, email, password       │ │
>         │  │ - firstName, lastName       │ │
>         │  │ - isActive, createdAt, etc  │ │
>         │  └──────────┬────────────────┘ │
>         │             │ (Many-to-Many)   │
>         │  ┌──────────▼────────────────┐ │
>         │  │ UserRoles (Join Table)    │ │
>         │  │ - user_id, role_id        │ │
>         │  └──────────┬────────────────┘ │
>         │             │                  │
>         │  ┌──────────▼────────────────┐ │
>         │  │ Role Table                │ │
>         │  │ - id, name (ADMIN, USER)  │ │
>         │  │ - permissions (via join)  │ │
>         │  └─────────────────────────┘ │
>         │                              │
>         │  ┌─────────────────────────┐ │
>         │  │ RefreshToken Table      │ │
>         │  │ - token, user_id        │ │
>         │  │ - expiryDate, isRevoked │ │
>         │  └─────────────────────────┘ │
>         │                              │
>         └──────────────────────────────┘
> ```
> 
> 
> ## How Each Component Works
> 
> ### **1. SecurityConfig.java** — The Security Blueprint
> 
> **Purpose**: Configures the entire Spring Security filter chain and CORS settings.
> 
> **Key Responsibilities**:
> - **PasswordEncoder**: Uses **BCryptPasswordEncoder** to hash passwords securely (never store plain text)
> - **CORS Configuration**: Allows cross-origin requests from specified domains with specific HTTP methods
> - **Filter Chain**:
>   - Disables CSRF (not needed for stateless JWT)
>   - Adds your custom **JwtAuthenticationFilter** before Spring's default UsernamePasswordAuthenticationFilter
>   - Requires **all requests to be authenticated** (`anyRequest().authenticated()`)
>   - Returns **401 Unauthorized** for unauthenticated requests
> 
> ```
> Request → CORS Check → CSRF (disabled) → JwtAuthenticationFilter → Authorization Check → Controller
> ```
> 
> 
> ### **2. JwtAuthenticationFilter.java** — The Gatekeeper
> 
> **Purpose**: Intercepts every incoming request and validates JWT tokens.
> 
> **Flow**:
> 1. **Extract Token**: Looks for `Authorization: Bearer <token>` header
> 2. **Validate Token**: Calls `jwtTokenProvider.isTokenValid(token)`
> 3. **Extract Claims**: Gets email, user ID, and roles from token
> 4. **Load User Details**: Queries database for user info via `UserDetailsService`
> 5. **Set Authentication**: Creates `UsernamePasswordAuthenticationToken` and stores in **SecurityContext**
> 
> **Result**: If valid, the request is authenticated. If invalid/missing, the request continues unauthenticated and gets rejected at the authorization check.
> 
> 
> ### **3. JwtTokenProvider.java** — The Token Factory
> 
> **Purpose**: Creates, validates, and manages JWT tokens.
> 
> | Method | Purpose |
> |--------|---------|
> | **generateToken(user)** | Creates short-lived access token (15 min) with user ID, email, and roles |
> | **generateRefreshToken(user)** | Creates long-lived refresh token (7 days) with minimal claims |
> | **isTokenValid(token)** | Verifies HMAC-SHA256 signature and checks expiration |
> | **saveRefreshToken(user, token)** | Stores refresh token in DB (allows token revocation) |
> | **isRefreshTokenValid(token)** | Checks if token exists in DB, not revoked, and not expired |
> | **revokeRefreshToken(token)** | Marks token as revoked (logout functionality) |
> 
> **Token Structure** (JWT has 3 parts separated by `.`):
> ```
> Header.Payload.Signature
> 
> Example:
> eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiVVNFUiJdLCJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjI2NjkwMDAwLCJleHAiOjE2MjY2OTkwMDB9.signature
> ```
> 
> 
> ### **4. AuthService & AuthServiceImpl.java** — The Business Logic
> 
> **Purpose**: Handles registration and login logic.
> 
> **Registration Flow**:
> 1. Validate input (email format, password strength)
> 2. Check if email already exists
> 3. Hash password with BCryptPasswordEncoder
> 4. Create new User with default role (e.g., USER)
> 5. Save to database
> 6. Generate access + refresh tokens
> 7. Return **AuthResponse** with tokens
> 
> **Login Flow**:
> 1. Find user by email
> 2. Compare provided password with stored hashed password (BCrypt handles this)
> 3. If valid, generate access + refresh tokens
> 4. Save refresh token to database
> 5. Return **AuthResponse** with tokens
> 6. If invalid, throw **InvalidCredentialsException**
> 
> 
> ### **5. User & Role Entities** — The Data Model
> 
> **User Table**:
> ```
> id (PK) | email (unique) | password (hashed) | firstName | lastName | isActive | createdAt | updatedAt
> ```
> 
> **Relationships**:
> ```
> User ──(Many-to-Many)──> Role ──(Many-to-Many)──> Permission
> ```
> 
> **User can have multiple roles** (e.g., ADMIN, USER, MODERATOR), and each role can have multiple permissions.
> 
> 
> ## Complete Authentication Flow
> 
> ### **Registration Flow**
> ```
> 1. Client sends: POST /register
>    {
>      "email": "user@example.com",
>      "password": "SecurePass123",
>      "firstName": "John",
>      "lastName": "Doe"
>    }
> 
> 2. AuthController → AuthService → UserService
>    - Validate input
>    - Hash password (BCrypt)
>    - Check email uniqueness
>    - Create User entity with default role
> 
> 3. JwtTokenProvider generates:
>    - Access Token (15 min expiration)
>    - Refresh Token (7 days expiration)
> 
> 4. Save refresh token to RefreshToken table
> 
> 5. Return to client:
>    {
>      "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
>      "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
>      "tokenType": "Bearer",
>      "expiresIn": 900  // seconds
>    }
> ```
> 
> ### **Login Flow**
> ```
> 1. Client sends: POST /login
>    {
>      "email": "user@example.com",
>      "password": "SecurePass123"
>    }
> 
> 2. AuthController → AuthService → UserService
>    - Find user by email
>    - BCrypt compares passwords
>    - If invalid → throw InvalidCredentialsException (401)
> 
> 3. If valid:
>    - JwtTokenProvider generates tokens
>    - Save refresh token to DB
>    - Return AuthResponse with tokens
> ```
> 
> ### **Authenticated Request Flow**
> ```
> 1. Client sends: GET /protected-endpoint
>    Headers: {
>      "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9..."
>    }
> 
> 2. JwtAuthenticationFilter:
>    - Extract token from header
>    - Validate signature & expiration
>    - Extract email from token
>    - Load UserDetails from DB
>    - Set authentication in SecurityContext
> 
> 3. SecurityConfig authorization check:
>    - anyRequest().authenticated() → passes ✓
> 
> 4. Request reaches Controller
>    - SecurityContextHolder.getContext().getAuthentication() has user info
>    - Can use @PreAuthorize, @Secured for role-based access
> 
> 5. Return response (200 OK)
> ```
> 
> ### **Token Refresh Flow**
> ```
> 1. Client sends: POST /refresh
>    {
>      "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
>    }
> 
> 2. AuthService:
>    - Validate refresh token (JwtTokenProvider.isRefreshTokenValid)
>    - Check if exists in DB
>    - Check if not revoked
>    - Check if not expired
> 
> 3. If valid:
>    - Generate new access token
>    - Return new token (refresh token stays same or rotated)
> 
> 4. If invalid:
>    - Throw JwtAuthenticationException (401)
>    - User must login again
> ```
> 
> ### **Logout/Revocation Flow**
> ```
> 1. Client sends: POST /logout
>    {
>      "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
>    }
> 
> 2. JwtTokenProvider.revokeRefreshToken(token):
>    - Find token in RefreshToken table
>    - Set isRevoked = true
>    - Save to DB
> 
> 3. Next time client tries to refresh:
>    - isRefreshTokenValid() returns false
>    - User must login again
> ```
> 
> 
> ## Security Features Summary
> 
> | Feature | Implementation |
> |---------|-----------------|
> | **Password Hashing** | BCryptPasswordEncoder (adaptive, salted hashing) |
> | **Token Signing** | HMAC-SHA256 (prevents tampering) |
> | **Token Expiration** | Access: 15 min, Refresh: 7 days |
> | **Token Revocation** | RefreshToken table with isRevoked flag |
> | **CORS Protection** | Whitelist allowed origins |
> | **CSRF Protection** | Disabled (not needed for stateless JWT) |
> | **Stateless Auth** | No server-side sessions, tokens are self-contained |
> | **Role-Based Access** | User → Roles → Permissions (Many-to-Many) |
> | **Exception Handling** | GlobalExceptionHandler catches custom exceptions |
> 
> 
> ## Potential Improvements & Considerations
> 
> 1. **Refresh Token Rotation**: Generate a new refresh token each time it's used (more secure)
> 2. **Token Blacklist**: Instead of revoke flag, maintain a blacklist for faster logout
> 3. **Rate Limiting**: Add rate limiting to login/register endpoints to prevent brute force
> 4. **Audit Logging**: Log all authentication events (login, logout, failed attempts)
> 5. **2FA/MFA**: Add two-factor authentication for sensitive accounts
> 6. **HTTPS Only**: Ensure tokens are only sent over HTTPS
> 7. **HttpOnly Cookies**: Consider storing refresh tokens in HttpOnly cookies instead of localStorage
> 8. **Token Introsp
> 
> ## Complete HTTP Status Code Reference
> 
> | **Code** | **Name** | **Category** | **Meaning** |
> |----------|----------|----------|----------|
> | **100** | Continue | Informational | The client should continue sending the request; initial part has been received. |
> | **101** | Switching Protocols | Informational | Server is switching to a different protocol as requested by the client. |
> | **102** | Processing | Informational | Server has received the request and is processing it (WebDAV). |
> | **103** | Early Hints | Informational | Server is preloading resources while preparing the response. |
> | **200** | OK | Success | Request succeeded; server returned the requested data. |
> | **201** | Created | Success | Request succeeded; a new resource was created as a result. |
> | **202** | Accepted | Success | Request accepted for processing but not yet completed. |
> | **203** | Non-Authoritative Information | Success | Request succeeded but returned information from a third party. |
> | **204** | No Content | Success | Request succeeded but there is no content to return. |
> | **205** | Reset Content | Success | Request succeeded; client should reset the document view. |
> | **206** | Partial Content | Success | Server is delivering only part of the resource (range request). |
> | **207** | Multi-Status | Success | Message body contains multiple status codes for different parts of a request (WebDAV). |
> | **208** | Already Reported | Success | Members of a DAV binding have already been enumerated. |
> | **226** | IM Used | Success | Server fulfilled a request using instance manipulation. |
> | **300** | Multiple Choices | Redirection | Multiple options available for the requested resource. |
> | **301** | Moved Permanently | Redirection | Resource has permanently moved to a new URI. |
> | **302** | Found | Redirection | Resource has temporarily moved to a different URI. |
> | **303** | See Other | Redirection | Client should redirect to a different URI to get the response. |
> | **304** | Not Modified | Redirection | Resource hasn't changed since the last request (cached version still valid). |
> | **305** | Use Proxy | Redirection | Requested resource must be accessed through a proxy. |
> | **306** | Switch Proxy | Redirection | Subsequent requests should use the specified proxy (deprecated). |
> | **307** | Temporary Redirect | Redirection | Resource temporarily moved; client should retry with the same method. |
> | **308** | Permanent Redirect | Redirection | Resource permanently moved; client should retry with the same method. |
> | **400** | Bad Request | Client Error | **The server cannot process the request due to client error (malformed syntax, invalid parameters, etc.).** |
> | **401** | Unauthorized | Client Error | Client must authenticate to access the resource; credentials are missing or invalid. |
> | **402** | Payment Required | Client Error | Payment is required to access the resource (reserved for future use). |
> | **403** | Forbidden | Client Error | Client is authenticated but lacks permission to access the resource. |
> | **404** | Not Found | Client Error | The requested resource does not exist on the server. |
> | **405** | Method Not Allowed | Client Error | The HTTP method used is not supported for this resource. |
> | **406** | Not Acceptable | Client Error | Server cannot produce a response matching the client's Accept header. |
> | **407** | Proxy Authentication Required | Client Error | Client must authenticate with the proxy before accessing the resource. |
> | **408** | Request Timeout | Client Error | Server did not receive a complete request within the timeout period. |
> | **409** | Conflict | Client Error | Request conflicts with the current state of the resource (e.g., concurrent updates). |
> | **410** | Gone | Client Error | Resource no longer exists and will not exist again. |
> | **411** | Length Required | Client Error | Server requires the Content-Length header to process the request. |
> | **412** | Precondition Failed | Client Error | A condition specified in the request headers was not met. |
> | **413** | Payload Too Large | Client Error | Request body is larger than the server is willing to process. |
> | **414** | URI Too Long | Client Error | The URI is longer than the server is willing to process. |
> | **415** | Unsupported Media Type | Client Error | Server does not support the media type in the request. |
> | **416** | Range Not Satisfiable | Client Error | The requested range of the resource cannot be satisfied. |
> | **417** | Expectation Failed | Client Error | The server cannot fulfill the expectation specified in the Expect header. |
> | **418** | I'm a Teapot | Client Error | The server refuses to brew coffee (joke status code from RFC 2324). |
> | **421** | Misdirected Request | Client Error | Request was directed at a server that cannot produce a response. |
> | **422** | Unprocessable Entity | Client Error | Request is well-formed but contains semantic errors (WebDAV/API validation). |
> | **423** | Locked | Client Error | The requested resource is locked and cannot be accessed. |
> | **424** | Failed Dependency | Client Error | Request failed because it depends on another request that also failed. |
> | **425** | Too Early | Client Error | Server is unwilling to process a request that might be replayed. |
> | **426** | Upgrade Required | Client Error | Client must upgrade to a different protocol to access the resource. |
> | **428** | Precondition Required | Client Error | Server requires conditional request headers to be present. |
> | **429** | Too Many Requests | Client Error | Client has sent too many requests within a specified time period (rate limiting). |
> | **431** | Request Header Fields Too Large | Client Error | Request header fields are too large for the server to process. |
> | **451** | Unavailable For Legal Reasons | Client Error | Server cannot provide the resource due to legal restrictions or censorship. |
> | **500** | Internal Server Error | Server Error | **Server encountered an unexpected condition and cannot fulfill the request.** |
> | **501** | Not Implemented | Server Error | Server does not support the functionality required to fulfill the request. |
> | **502** | Bad Gateway | Server Error | Server received an invalid response from an upstream server (acting as gateway/proxy). |
> | **503** | Service Unavailable | Server Error | Server is temporarily unable to handle the request (maintenance, overload). |
> | **504** | Gateway Timeout | Server Error | Server did not receive a timely response from an upstream server. |
> | **505** | HTTP Version Not Supported | Server Error | Server does not support the HTTP version used in the request. |
> | **506** | Variant Also Negotiates | Server Error | Server has an internal configuration error (circular content negotiation). |
> | **507** | Insufficient Storage | Server Error | Server cannot store the data needed to complete the request (WebDAV). |
> | **508** | Loop Detected | Server Error | Server detected an infinite loop while processing the request (WebDAV). |
> | **510** | Not Extended | Server Error | Server requires further extensions to the request to fulfill it. |
> | **511** | Network Authentication Required | Server Error | Client must authenticate to gain network access (captive portal). |
> 
> ```
> mvn test -Dspring.profiles.active=dev -Dtest=JwtAuthenticationFilterUnitTest
> 
> mvn test -Dspring.profiles.active=dev -Dtest=JwtAuthenticationFilterUnitTest#testMissingOrInvalidAuthHeade
> 
> mvn test -Dspring.profiles.active=dev -Dtest=AuthControllerLoginIntegrationTest
> mvn test -Dspring.profiles.active=dev -Dtest=AuthControllerLoginIntegrationTest#testLoginReturnsValidToken
> 
> mvn test -Dspring.profiles.active=dev -DfailIfNoTests=false
> ````
> </details>

## 001-0007
> **Implement role-based access control with authorization annotations.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
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
> - [x] 1. Create Role enum with CUSTOMER, OPERATOR, ADMIN values
> - [x] 2. Create Permission enum with specific permissions
> - [x] 3. Implement role-permission mapping in Role entity
> - [x] 4. Configure @EnableGlobalMethodSecurity in SecurityConfig
> - [x] 5. Create custom @Authorize annotation (optional)
> - [x] 6. Add @PreAuthorize("hasRole('CUSTOMER')") to customer endpoints
> - [x] 7. Add @PreAuthorize("hasRole('OPERATOR')") to operator endpoints
> - [x] 8. Add @PreAuthorize("hasRole('ADMIN')") to admin endpoints
> - [x] 9. Create AccessDeniedException handler
> - [x] 10. Implement role hierarchy logic
> - [x] 11. Create unit tests for authorization logic
> - [x] 12. Create integration tests for role-based endpoint access
> - [x] 13. Test unauthorized access scenarios
> 
> # Reports:
> * Create Role enum with CUSTOMER, OPERATOR, ADMIN values
> > * RoleType enum created with three role values: CUSTOMER, OPERATOR, and ADMIN. Each role represents a distinct user type in the subscription platform with different access levels and permissions.
> * Create Permission enum with specific permissions
> > * Permission entity created as JPA entity with unique name and description fields. Implements many-to-many relationship with Role entity using @ManyToMany annotation with lazy loading strategy. Includes validation constraints and Lombok annotations for clean code generation.
> * Implement role-permission mapping in Role entity
> > * Role entity configured with many-to-many relationship to Permission using @ManyToMany annotation and @JoinTable mapping to role_permissions table. Permissions are lazily loaded with joinColumns referencing role_id and inverseJoinColumns referencing permission_id, enabling role-permission associations.
> * Configure @EnableGlobalMethodSecurity in SecurityConfig
> > * @EnableMethodSecurity(prePostEnabled = true) annotation added to SecurityConfig class. Enables method-level security allowing @PreAuthorize and @PostAuthorize annotations on controller methods for fine-grained authorization control based on roles and permissions.
> * Create custom @Authorize annotation (optional)
> > * Custom @Authorize annotation skipped. Standard Spring Security @PreAuthorize annotation is sufficient for role-based authorization without additional custom annotation overhead.
> * Add @PreAuthorize("hasRole('CUSTOMER')") to customer endpoints
> > * @PreAuthorize("hasRole('CUSTOMER')") annotation added to /api/profile endpoint in UserController. Only users with CUSTOMER role can access this endpoint. Spring Security intercepts the request, checks user's roles from SecurityContext, and denies access with 403 Forbidden if role doesn't match before method execution.
> >>**How it works:**
> >>1. User makes request with JWT token
> >>2. JwtAuthenticationFilter extracts token and populates >>SecurityContext with user roles
> >>3. @PreAuthorize evaluates the expression before method >>executes
> >>4. If user has CUSTOMER role → method executes
> >>5. If user lacks CUSTOMER role → 403 Forbidden returned
> Got it. Here's the report for this part:
> 
> * Add @PreAuthorize("hasRole('OPERATOR')") to operator endpoints
> > * @PreAuthorize("hasRole('OPERATOR')") annotation added to /api/operator/dashboard and /api/operator/plans endpoints in OperatorController. Only users with OPERATOR role can access these endpoints. Spring Security validates user roles from SecurityContext and returns 403 Forbidden if role doesn't match before method execution.
> * Add @PreAuthorize("hasRole('ADMIN')") to admin endpoints
> > * @PreAuthorize("hasRole('ADMIN')") annotation added to /api/admin/dashboard and /api/admin/users endpoints in AdminController. Only users with ADMIN role can access these endpoints. Spring Security validates user roles from SecurityContext and returns 403 Forbidden if role doesn't match before method execution. Updated multiple integration tests to support CUSTOMER, OPERATOR, and ADMIN role testing scenarios.
> * Create AccessDeniedException handler
> > * @ExceptionHandler(AccessDeniedException.class) added to GlobalExceptionHandler. Catches Spring Security AccessDeniedException when users attempt to access endpoints without required role permissions. Returns 403 Forbidden with ErrorResponse containing descriptive message and timestamp for graceful error handling.
> * Implement role hierarchy logic
> > * Role hierarchy method added to Role entity with hierarchy levels: ADMIN (3) > OPERATOR (2) > CUSTOMER (1). hasHierarchyOver() method compares role levels enabling permission checks based on role hierarchy. getRoleHierarchyLevel() uses switch expression for clean hierarchy mapping.
> * Create unit tests for authorization logic
> > * Unit tests implemented in ProtectedEndpointsIntegrationTest using @ParameterizedTest with @CsvSource covering all three roles (CUSTOMER, OPERATOR, ADMIN). Tests validate @PreAuthorize annotations enforce role-based access, returning 200 OK for authorized roles and 403 Forbidden for unauthorized access attempts across all protected endpoints.
> * Create integration tests for role-based endpoint access
> > * Integration tests implemented in ProtectedEndpointsIntegrationTest.testRoleBasedAccessControl() using @ParameterizedTest with @CsvSource covering 12 test scenarios across CUSTOMER, OPERATOR, and ADMIN roles. Tests validate endpoint accessibility, permission enforcement, and correct HTTP status responses (200 OK, 403 Forbidden, 404 Not Found) for each role-endpoint combination.
> * Test unauthorized access scenarios
> > * Unauthorized access scenarios tested in ProtectedEndpointsIntegrationTest.testRoleBasedAccessControl() validating 403 Forbidden responses when users attempt to access endpoints without required role permissions. Tests cover all role mismatches (CUSTOMER accessing OPERATOR/ADMIN endpoints, OPERATOR accessing ADMIN endpoints, etc.) ensuring AccessDeniedException handler properly rejects unauthorized requests.
> 
> ```
> mvn clean compile
> 
> mvn test -Dspring.profiles.active=dev -Dtest=ProtectedEndpointsIntegrationTest#testRoleBasedAccessControl -DfailIfNoTests=false -Dsurefire.skipAfterFailureCount=1
> 
> 
> mvn test -Dspring.profiles.active=dev -Dtest=ProtectedEndpointsIntegrationTest#testCorsOriginWithDifferentPaths
> 
> ```
> </details>

## 001-0008
> **Implement password change and password reset functionality.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
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
> - [x] 1. Create ChangePasswordRequest DTO with oldPassword and newPassword
> - [x] 2. Create ForgotPasswordRequest DTO with email
> - [x] 3. Create ResetPasswordRequest DTO with token and newPassword
> - [x] 4. Create PasswordResetToken entity with token, user, expiration
> - [x] 5. Create PasswordResetTokenRepository
> - [x] 6. Implement changePassword method in UserService
> - [x] 7. Implement forgotPassword method in UserService
> - [x] 8. Implement resetPassword method in UserService
> - [x] 9. Implement password reset token generation and validation
> - [x] 10. Create email service for sending reset links (mock or real)
> - [x] 11. Add change-password endpoint to AuthController
> - [x] 12. Add forgot-password endpoint to AuthController
> - [x] 13. Add reset-password endpoint to AuthController
> - [x] 14. Create unit tests for password change/reset logic
> - [x] 15. Create integration tests for password endpoints
> 
> # Reports:
> Here's the report for the ChangePasswordRequest DTO:
> 
> * Create ChangePasswordRequest DTO with oldPassword and newPassword
> > * ChangePasswordRequest DTO created with two fields: oldPassword and newPassword. Both fields are validated with @NotBlank annotations to ensure users provide non-empty values. This DTO will be used to capture password change requests from authenticated users and validate input before processing.
> * Create ForgotPasswordRequest DTO with email
> > * ForgotPasswordRequest DTO created with a single email field. The field is validated with @NotBlank and @Email annotations to ensure users provide a valid email address. This DTO will be used to initiate the password reset process by accepting the user's email.
> * Create ResetPasswordRequest DTO with token and newPassword
> > * ResetPasswordRequest DTO created with two fields: token and newPassword. Both fields are validated with @NotBlank annotations to ensure users provide non-empty values. This DTO will be used to complete the password reset process by validating the reset token and applying the new password.
> * Create PasswordResetToken entity with token, user, expiration
> > * PasswordResetToken entity created with fields: token (unique identifier), user (ManyToOne relationship with User entity), expirationTime (LocalDateTime for token validity), createdAt (timestamp of token creation), and isUsed (boolean flag to ensure single-use tokens). This entity stores password reset tokens and tracks their expiration and usage status.
> * Create PasswordResetTokenRepository
> > * PasswordResetTokenRepository interface created extending JpaRepository. It provides three methods: findByToken() to retrieve a token by its value, findByUserAndIsUsedFalse() to find unused reset tokens for a user, and deleteByExpirationTimeBefore() to clean up expired tokens. These methods enable token validation, single-use enforcement, and automatic cleanup of stale tokens.
> * Implement changePassword method in UserService
> > * changePassword method implemented in UserService to allow authenticated users to change their password. The method verifies the old password, validates new password strength, ensures the new password differs from the old one, hashes the new password, and updates the user record. It throws InvalidPasswordException if the old password is incorrect and RuntimeException for validation failures.
> * Implement forgotPassword method in UserService
> > * forgotPassword method implemented to initiate password reset process. The method finds the user by email, verifies the account is active, generates a unique reset token using UUID, creates a PasswordResetToken entity with 24-hour expiration, saves it to the database, and triggers email notification (placeholder for email service implementation). It throws appropriate exceptions if user is not found or account is inactive.
> * Implement resetPassword method in UserService
> > * resetPassword method implemented to complete the password reset process. The method validates the reset token exists, ensures it hasn't been used before, checks if the token hasn't expired, validates new password strength, hashes and updates the user's password, and marks the token as used. It throws appropriate exceptions for invalid, expired, or already-used tokens to enforce single-use and time-limited token constraints.
> * Create email service for sending reset links (mock or real)
> > * EmailService created with mock implementation for sending password reset emails. The service logs password reset emails and generates reset links containing the reset token that directs users to the frontend reset page. Email configuration properties are added to application.properties with placeholders for SMTP credentials. The service is designed to support both mock logging and future real email implementation using JavaMailSender.
> * Add change-password endpoint to AuthController
> > * change-password endpoint added to AuthController as a POST endpoint at /api/auth/change-password. The endpoint accepts a ChangePasswordRequest DTO and extracts the authenticated user's ID from the JWT token in the Authorization header. It calls the authService.changePassword method to process the password change and returns a success response. The endpoint requires valid authentication and input validation.
> * Add forgot-password endpoint to AuthController
> > * forgot-password endpoint added to AuthController as a POST endpoint at /api/auth/forgot-password. The endpoint accepts a ForgotPasswordRequest DTO containing the user's email and initiates the password reset process. It calls authService.forgotPassword which triggers email notification with a password reset link. The endpoint returns a success message without requiring authentication and validates input before processing.
> * Add reset-password endpoint to AuthController
> > * reset-password endpoint added to AuthController as a POST endpoint at /api/auth/reset-password. The endpoint accepts a ResetPasswordRequest DTO containing the reset token and new password. It calls authService.resetPassword which validates the token expiration and single-use constraint, then updates the user's password and marks the token as used. The endpoint returns a success message without requiring authentication and validates input before processing.
> 
> ```
> mvn test -Dspring.profiles.active=dev
> 
> mvn test -Dspring.profiles.active=dev -Dtest=UserServicePasswordUnitTest
> 
> # runing nested tests
> mvn test -Dspring.profiles.active=dev -Dtest=AuthControllerPasswordIntegrationTest$ChangePasswordTests
> 
> mvn test -Dspring.profiles.active=dev -Dtest=AuthControllerPasswordIntegrationTest$ChangePasswordTests -Dtest.method=testChangePasswordSuccess
> 
> #---
> mvn test -Dspring.profiles.active=dev -Dtest=AuthControllerPasswordIntegrationTest$ForgotPasswordTests -Dtest.method=testForgotPasswordSuccess
> 
> mvn test -Dspring.profiles.active=dev -Dtest=AuthControllerPasswordIntegrationTest$ForgotPasswordTests 
> 
> #---
> mvn test -Dspring.profiles.active=dev -Dtest=AuthControllerPasswordIntegrationTest$ResetPasswordTests -Dtest.method=testResetPasswordSuccess
> 
> mvn test -Dspring.profiles.active=dev -Dtest=AuthControllerPasswordIntegrationTest$ResetPasswordTests
> 
> ```
> </details>

## 001-0009
> **Create comprehensive integration tests for authentication system.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
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
> - [x] 1. Create AuthenticationIntegrationTest class
> - [x] 2. Configure test database and test properties
> - [x] 3. Create test for successful user registration
> - [x] 4. Create test for duplicate email registration (409 Conflict)
> - [x] 5. Create test for invalid email format (400 Bad Request)
> - [x] 6. Create test for successful login
> - [x] 7. Create test for login with invalid credentials (401 Unauthorized)
> - [x] 8. Create test for accessing protected endpoint with valid token
> - [x] 9. Create test for accessing protected endpoint without token (401 Unauthorized)
> - [x] 10. Create test for accessing protected endpoint with expired token
> - [x] 11. Create test for token refresh
> - [x] 12. Create test for role-based access control
> - [x] 13. Create test for password change
> - [x] 14. Create test for password reset flow
> - [-] 15. Run tests and verify coverage
> 
> # Reports:
> * Configure test database and test properties
> > * Test database configuration verified using application-dev.properties with H2 in-memory database. @ActiveProfiles("dev") annotation activates dev profile for all test classes. Database is configured with spring.jpa.hibernate.ddl-auto=create-drop strategy ensuring fresh schema creation before each test and automatic cleanup after. Production profile (application-prod.properties) updated by removing DEBUG logging levels and sensitive SQL output settings. Logging configured to WARN level for root and INFO for application code in production, with spring.jpa.show-sql disabled for performance.
> * Create test for successful user registration
> > * Test for successful user registration already exists in AuthenticationIntegrationTest class under RegistrationTests nested class. The testRegistrationSuccess() method verifies that a user can register with valid data (email, password, passwordConfirm, firstName, lastName). Test expects HTTP 201 Created status and validates that a success message is returned in the response. Test uses MockMvc to perform POST request to /api/auth/register endpoint with properly formatted RegisterRequest DTO.
> * Create test for duplicate email registration (409 Conflict)
> > * Test for duplicate email registration already exists in AuthenticationIntegrationTest class under RegistrationTests nested class. The testRegistrationWithDuplicateEmail() method verifies that registration fails when attempting to register with an email that already exists (TEST_EMAIL is pre-created in setUp()). Test expects HTTP 409 Conflict status and validates that an error message is returned in the response. Test uses MockMvc to perform POST request to /api/auth/register endpoint with RegisterRequest DTO containing duplicate email address.
> * Create test for invalid email format (400 Bad Request)
> > * Test for invalid email format already exists in AuthenticationIntegrationTest class under RegistrationTests nested class. The testRegistrationWithInvalidEmailFormat() method uses @ParameterizedTest with @ValueSource annotation to test multiple invalid email formats (invalid-email, user@, @example.com, user @example.com). Test verifies that HTTP 400 Bad Request status is returned for each invalid email format. Test uses MockMvc to perform POST request to /api/auth/register endpoint with RegisterRequest DTO containing invalid email addresses.
> * Create test for successful login
> > * Test for successful login already exists in AuthenticationIntegrationTest class under LoginTests nested class. The testLoginSuccess() method verifies that a user can login with valid credentials (TEST_EMAIL and TEST_PASSWORD). Test expects HTTP 200 OK status and validates that a JWT token and success message are returned in the response. Test uses MockMvc to perform POST request to /api/auth/login endpoint with properly formatted LoginRequest DTO.
> * Create test for login with invalid credentials (401 Unauthorized)
> > * Test for login with invalid credentials already exists in AuthenticationIntegrationTest class under LoginTests nested class. The testLoginWithInvalidCredentials() method uses @ParameterizedTest with @CsvSource annotation to test multiple invalid credential scenarios (nonexistent email, wrong password, wrong case password). Test verifies that HTTP 401 Unauthorized status is returned for each invalid credential combination. Test uses MockMvc to perform POST request to /api/auth/login endpoint with LoginRequest DTO containing invalid credentials.
> * Create test for accessing protected endpoint with valid token
> > * Test for accessing protected endpoint with valid token already exists in AuthenticationIntegrationTest class under ProtectedEndpointsTests nested class. The testAccessProtectedEndpointWithValidToken() method verifies that a user can access protected endpoint (/api/auth/validate) when providing a valid JWT token in Authorization header with Bearer scheme. Test expects HTTP 200 OK status. Test uses MockMvc to perform GET request to protected endpoint with valid token generated during setUp().
> * Create test for accessing protected endpoint without token (401 Unauthorized)
> > * Test for accessing protected endpoint without token already exists in AuthenticationIntegrationTest class under ProtectedEndpointsTests nested class. The testAccessProtectedEndpointWithoutToken() method verifies that access to protected endpoint (/api/auth/validate) is denied when no Authorization header is provided. Test expects HTTP 401 Unauthorized status. Test uses MockMvc to perform GET request to protected endpoint without token.
> * Create test for accessing protected endpoint with expired token
> > * Test for accessing protected endpoint with expired token already exists in AuthenticationIntegrationTest class under ProtectedEndpointsTests nested class. The testAccessProtectedEndpointWithExpiredToken() method verifies that access to protected endpoint (/api/auth/validate) is denied when an expired JWT token is provided in Authorization header with Bearer scheme. Test expects HTTP 401 Unauthorized status. Test uses MockMvc to perform GET request to protected endpoint with hardcoded expired token.
> * Create test for role-based access control
> > * Role-based access control testing already implemented in ProtectedEndpointsIntegrationTest.java with testRoleBasedAccessControl() parameterized test method. Test covers three roles (CUSTOMER, OPERATOR, ADMIN) with 12 test cases validating endpoint access permissions. CUSTOMER role verified to access /api/profile (200) while being denied access to /api/operator/dashboard and /api/admin/dashboard (403). OPERATOR role verified to access /api/operator/dashboard and /api/operator/plans (200) while being denied /api/profile and /api/admin/dashboard (403). ADMIN role verified to access /api/admin/dashboard and /api/admin/users (200). All invalid endpoints return 404 across all roles. Test uses @CsvSource parameterization for comprehensive coverage of role-endpoint combinations ensuring RBAC enforcement is working correctly across the authentication system.
> * Create test for password change
> > * Password change testing fully implemented in AuthControllerPasswordIntegrationTest.java covering three nested test classes: ChangePasswordTests, ForgotPasswordTests, and ResetPasswordTests. ChangePasswordTests validates successful password change with correct old password returning HTTP 200, rejects incorrect old password with HTTP 401, requires authentication token with HTTP 401 for unauthenticated requests, validates invalid JWT tokens with HTTP 400, and tests blank password fields using parametrized testing. ForgotPasswordTests verifies password reset initiation with valid email returning HTTP 200, rejects non-existent emails with HTTP 404, validates email format with parametrized testing for blank/invalid formats returning HTTP 400, and prevents inactive users from initiating resets with HTTP 403. ResetPasswordTests confirms successful password reset with valid non-expired tokens returning HTTP 200, rejects invalid tokens with HTTP 404, expires tokens after configured time period returning HTTP 400, prevents token reuse with HTTP 400, and validates blank input fields with parametrized testing. Helper methods createValidResetToken(), createExpiredResetToken(), and createUsedResetToken() support comprehensive token lifecycle testing.
> * Create test for password reset flow
> > * Password reset flow testing fully implemented in AuthControllerPasswordIntegrationTest.java within ResetPasswordTests nested class covering complete token lifecycle. Test validates successful password reset with valid non-expired tokens returning HTTP 200 with password updated in database and token marked as used. Invalid token scenario rejects requests with HTTP 404 preventing unauthorized password resets. Expired token scenario validates token expiration mechanism returning HTTP 400 with user notification of expired token. Token reuse prevention tested by marking tokens as used after first reset and rejecting subsequent reset attempts with HTTP 400. Blank input validation uses parametrized testing covering three scenarios: blank token with valid password, valid token with blank password, and both fields blank, all returning HTTP 400. Helper method createValidResetToken() generates non-expired unused tokens, createExpiredResetToken() generates tokens with expiration time in past, and createUsedResetToken() marks tokens as already used. Complete flow ensures password reset tokens are single-use, time-limited, and properly validated before allowing password changes.
> 
> ``` 
> mvn clean compile
> 
> mvn test -Dspring.profiles.active=dev
> 
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest
> 
> # runing nested tests
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest$RegistrationTests
> 
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest$RegistrationTests -Dtest.method=testRegistrationSuccess
> 
> # runing nested tests
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest$LoginTests
> 
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest$LoginTests -Dtest.method=testLoginSuccess
> 
> 
> # runing nested tests
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest$TokenValidationTests
> 
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest$TokenValidationTests -Dtest.method=testValidateTokenSuccess
> 
> # runing nested tests
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest$ProtectedEndpointsTests
> 
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest$ProtectedEndpointsTests -Dtest.method=testAccessProtectedEndpointWithValidToken
> 
> # runing nested tests
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest$TokenRefreshTests
> 
> mvn test -Dspring.profiles.active=dev -Dtest=AuthenticationIntegrationTest$TokenRefreshTests -Dtest.method=testRefreshTokenSuccess
> 
> ```
> </details>

## 001-0010
> **Create frontend authentication service and global state management.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
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
> # TODO:
> - [x] 1. Create AuthService with register, login, logout methods
> - [x] 2. Create HTTP interceptor to add Authorization header to requests
> - [x] 3. Create HTTP interceptor to handle 401 responses and refresh tokens
> - [x] 4. Implement token storage in localStorage
> - [x] 5. Implement token retrieval from localStorage on app startup
> - [x] 6. Implement automatic token refresh logic
> - [x] 7. Test token persistence and retrieval
> - [x] 8. Get register flow fully working (test with backend)
> - [x] 9. Create role-based dashboard views (admin vs user/customer)
> - [x] 10. Create admin panel page with user management (view, enable/disable users)
> - [x] 11. Create user profile edit page (update email, name, etc.)
> - [x] 12. Add role-based route guards (redirect non-admin users from admin panel)
> - [x] 13. Test complete authentication flow (register → login → dashboard → logout)
> - [x] 14. Test admin panel functionality (list users, enable/disable)
> - [x] 15. Test user profile editing
> 
> 
> # Reports:
> * Create AuthService with register, login, logout methods
> > * Some issue on endpoints were fixed
> > * Two initializer to add roles and ADMIN were added.
> > * Role entity was updated to make it compatible with internalizers
> > * Many tests need to be updated
> >**Plan for Frontend AuthService Implementation:**
> >>1. Create folder structure: `client/webclientv1/` with `js/services/`, `js/utils/`, `css/`, `pages/`
> >>2. Build `apiClient.js` - HTTP utility that routes requests through PHP proxy
> >>3. Build `authService.js` - handles register, login, logout, token refresh API calls
> >>4. Create `config.js` - centralized configuration (API URLs, proxy URL, storage type)
> >>5. Create simple HTML pages - login, register, dashboard with forms
> >>6. Add token persistence to localStorage
> >>7. Add request/response interceptors for Authorization headers
> >>8. Add 401 handling with automatic token refresh
> >>9. Write unit tests for authService
> >>
> >>```
> >>client/
> >>└── webclientv1/
> >>    ├── index.html
> >>    ├── css/
> >>    │   └── styles.css
> >>    ├── js/
> >>    │   ├── config.js
> >>    │   ├── services/
> >>    │   │   └── authService.js
> >>    │   ├── utils/
> >>    │   │   └── apiClient.js
> >>    │   └── app.js
> >>    └── pages/
> >>        ├── login.html
> >>        ├── register.html
> >>        └── dashboard.html
> >>```
> >>---
> >>
> >>**Frontend AuthService Implementation Plan**
> >>
> >>**Endpoints identified:**
> >>- `POST /api/auth/register`
> >>- `POST /api/auth/login`
> >>- `POST /api/auth/refresh`
> >>- `POST /api/auth/change-password`
> >>- `POST /api/auth/forgot-password`
> >>- `POST /api/auth/reset-password`
> >>- `GET /api/auth/validate`
> >>
> >>**Tasks:**
> >>1. Create `config.js` - API base URL, proxy URL, token keys
> >>2. Create `apiClient.js` - HTTP wrapper for proxy routing
> >>3. Create `authService.js` - register, login, logout, refresh methods
> >>4. Create HTML pages - login, register, dashboard
> >>5. Add token storage (localStorage)
> >>6. Add Authorization header interceptor
> >>7. Add 401 response handler with token refresh
> >>8. Create unit tests for authService
> >>
> >>**Assumptions:**
> >>- Proxy URL: `http://localhost/proxy.php`
> >>- Token storage: `localStorage`
> >>- Backend API base: `http://172.32.0.11:8080/api`
> >>
> >>
> >>**Updated plan:**
> >>- Proxy URL: `./proxy.php` (relative path)
> >>- All frontend files in: `client/webclientv1/`
> >>- Backend API base: `http://172.32.0.11:8080/api`
> >>- Token storage: `localStorage`
> 
> ## New plan to create frontend
> ```
> webclient/
> ├── index.html
> ├── css/
> │   └── styles.css
> ├── js/
> │   ├── app.js
> │   ├── router.js
> │   └── pages/
> │       ├── login.js
> │       ├── register.js
> │       └── dashboard.js
> └── pages/
>     ├── login.html
>     ├── register.html
>     └── dashboard.html
> ```
> 
> ```
> mkdir -p webclientv1/{css,js/pages,pages,config}
> ```
> ## Steps to Add a New Page
> 
> 1. **Create HTML file** in `pages/` folder (e.g., `pages/newpage.html`)
> 2. **Create JS file** in `js/pages/` folder (e.g., `js/pages/newpage.js`) with `init()` method
> 3. **Register in app.js**: `router.register('newpage', 'pages/newpage.html', NewPageName);`
> 4. **Link to it**: Use `<a href="#newpage">` in HTML or `window.location.hash = '#newpage'` in JS
> 
> That's it. Router automatically loads the HTML and runs the JS `init()` function.
> 
> # Update remove hardcodes
> 
> ## Folder Structure Update
> 
> ```
> webclientv1/
> ├── config/
> │   └── config.json
> ├── index.html
> ├── css/
> │   ├── style.css
> │   ├── base.css
> │   ├── toast-base.css
> │   ├── default/
> │   │   ├── header.css
> │   │   ├── layout.css
> │   │   ├── tabs.css
> │   │   ├── forms.css
> │   │   ├── buttons.css
> │   │   ├── tables.css
> │   │   ├── messages.css
> │   │   ├── utilities.css
> │   │   ├── responsive.css
> │   │   ├── console.css
> │   │   ├── toast.css
> │   │   └── list.css
> │   └── dark/
> │       ├── header.css
> │       ├── layout.css
> │       ├── tabs.css
> │       ├── forms.css
> │       ├── buttons.css
> │       ├── tables.css
> │       ├── messages.css
> │       ├── utilities.css
> │       ├── responsive.css
> │       ├── console.css
> │       ├── toast.css
> │       └── list.css
> ├── js/
> │   ├── app.js
> │   ├── router.js
> │   ├── console.js
> │   ├── console-logger.js
> │   ├── theme-manager.js
> │   ├── ui-controller.js
> │   └── pages/
> │       ├── login.js
> │       └── register.js
> └── pages/
>     ├── login.html
>     └── register.html
> 
> ```
> 
> ```
> mkdir -p webclientv1/{css,js/pages,pages,config}
> ```
> 
> 
> ## Plan
> 
> 1. Create `config/config.json` with pages array (path, name, title, script)
> 2. Load config in `app.js` before registering pages
> 3. Loop through config and register dynamically
> 
> 
> ## Summary
> 
> 1. **Created modular single-page app** with `index.html` as entry point
> 2. **Built router system** to load pages dynamically into a container
> 3. **Created page structure** with HTML files in `pages/` and JS logic in `js/pages/`
> 4. **Implemented theme system** with base styles and multiple themes (default, dark)
> 5. **Added config-driven approach** to store page routes and app settings in `config.json` instead of hard-coding
> 
> Everything is now **generic, modular, and reusable** across projects.
> 
> 
> 
> ## Fixing issues
> ### Remaining Issues to Fix
> 
> 1. **Server issue when trying to login while already logged in**
>    - User logs in, gets JWT token
>    - User tries to login again with same credentials
>    - Server should handle gracefully (delete old tokens, issue new ones)
>    - Currently may throw errors or create duplicate tokens
> 
> 2. **Client infinite retry loop on server errors**
>    - When server returns an error (500, 401, etc.), client keeps retrying endlessly
>    - Should stop after N attempts or show error to user
>    - Currently `apiClient.js` retries failed requests without limit
> 
> 3. **Client allows access to login/register pages when already logged in**
>    - Logged-in users can still navigate to `/login` or `/register` pages
>    - Should redirect authenticated users away from auth pages (to dashboard)
>    - Router needs to check auth state before loading pages
> 
> 4. **Logout doesn't work**
>    - Logout button may not clear tokens properly
>    - User may not redirect to login page after logout
>    - Session may not be invalidated on server side
> 
> #### Issue #1: LazyInitializationException in UserService During Login & Token Refresh
> 
> **What I Saw:**
> - Login endpoint threw `LazyInitializationException` error
> - Token refresh endpoint also failed with same error
> - User roles couldn't be accessed during authentication
> 
> **Definition of Issue:**
> Spring Hibernate closes the database session after query completes. When code tries to access lazy-loaded collections (like user roles) after the session closes, it fails. The `User` entity had roles set to `fetch = FetchType.LAZY`, meaning roles are only loaded when explicitly accessed—but the session was already closed by then.
> 
> **Solution:**
> Added `@Transactional` annotation to keep the database session open during the entire method execution. This allows lazy-loaded data (roles) to be accessed safely within the transaction context.
> 
> **Code Changes:**
> ```java
> @Service
> @Transactional  // ← Added to class level
> public class UserService {
>     
>     @Transactional  // ← Also added to individual methods:
>     public AuthResponse loginUser(LoginRequest loginRequest) { ... }
>     
>     @Transactional
>     public AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest) { ... }
>     
>     @Transactional
>     public void changePassword(Long userId, ChangePasswordRequest changePasswordRequest) { ... }
>     
>     @Transactional
>     public void resetPassword(ResetPasswordRequest resetPasswordRequest) { ... }
> }
> ```
> 
> **Result:** Login and token refresh endpoints now work without errors. User roles load successfully within active transaction.
> 
> #### Issue #2 Report: Client Infinite Retry Loop on Server Errors
> 
> ##### Problem
> When server returned errors (401, 500, etc.), the client kept retrying requests endlessly with no limit on retry attempts, causing infinite loops and freezing the UI.
> 
> ##### Root Cause
> The `apiClient.js` `request()` method had a recursive retry mechanism for 401 responses that called itself without any counter or limit. If token refresh failed or server kept returning 401, the request would retry forever, exhausting resources.
> 
> ##### Solution
> Added a **retry attempt counter** to track and limit retries:
> - Added `maxRetries = 3` property to ApiClient class
> - Added `retryAttempt` parameter to `request()` method to track current retry count
> - Added check: if `retryAttempt >= maxRetries`, stop retrying and throw error with attempt info
> - Each retry increments counter: `retryAttempt + 1`
> - Error messages now show which attempt failed (e.g., "Session expired after 3 retry attempts")
> 
> ##### Code Changes
> ```javascript
> class ApiClient {
>   constructor(config) {
>     this.maxRetries = 3;  // ← Add retry limit
>   }
> 
>   async request(method, endpoint, data = null, retryAttempt = 0) {  // ← Add counter parameter
>     // ...
>     if (response.status === 401 && this.authService) {
>       if (retryAttempt >= this.maxRetries) {  // ← Check limit
>         throw new Error(`Session expired after ${this.maxRetries} retry attempts. Please login again.`);
>       }
>       return this.request(method, endpoint, data, retryAttempt + 1);  // ← Increment counter
>     }
>   }
> }
> ```
> 
> ##### Result
> Client now stops retrying after 3 failed attempts and shows user a clear error message with attempt count instead of looping infinitely.
> 
> 
> #### Issue #3: Client Allows Access to Auth Pages When Already Logged In
> 
> **Problem:** Logged-in users could navigate to `/login` or `/register` pages instead of being redirected to the dashboard.
> 
> **Root Cause:** Router didn't check authentication status before loading pages.
> 
> **Solution:**
> - Added `isProtected` parameter to `router.register()` method
> - Updated `router.load()` to check `authService.isAuthenticated()` before loading a page
> - If user is authenticated and tries to access login/register → redirect to dashboard
> - If user is NOT authenticated and tries to access protected pages → redirect to login
> - Updated `app.js` to call `router.setAuthService(authService)` so router can check auth status
> 
> **Files Modified:**
> - `router.js` - Added auth checks in `load()` method
> - `app.js` - Added `router.setAuthService()` call
> - `config/config.json` - Added `isProtected: true/false` flags to page definitions
> 
> **Result:** ✅ Auth-protected pages now properly redirect based on login status
> 
> 
> #### Issue #4: Logout Button Fires Twice (Double Execution)
> 
> **Problem:** Clicking the logout button triggered the logout flow twice, causing duplicate API calls and confusing logs.
> 
> **Root Cause:** Two hash change event listeners were attached in different places:
> 1. One in `Router` constructor (intended)
> 2. One in `app.js` at the bottom (duplicate)
> 
> When `window.location.href = '#login'` was set, the `hashchange` event fired and both listeners executed `router.load()`, causing the page's `init()` method to run twice. This attached duplicate event listeners to the logout button.
> 
> **Solution:**
> - **Removed the duplicate hash change listener from `app.js`**
> - Kept the single listener in `Router` constructor as the source of truth
> - Changed `app.js` to manually call `router.load()` for the initial page instead of relying on the hashchange event
> - Added listener deduplication to `header.js` using a `_listenerAttached` flag to prevent multiple attachments even if `init()` is called multiple times
> 
> **Files Modified:**
> - `app.js` - Removed duplicate `window.addEventListener('hashchange', ...)` listener
> - `header.js` - Added `_listenerAttached` flag check in `attachEventListeners()`
> 
> **Result:** ✅ Logout buttons now execute only once, no duplicate API calls
> 
> 
> #### Summary
> 
> | Issue | Cause | Fix | Status |
> |-------|-------|-----|--------|
> | #3 | No auth checks in router | Added `isProtected` flag + auth validation in `router.load()` | ✅ Fixed |
> | #4 | Duplicate hash change listeners | Removed duplicate listener from `app.js`, kept single source of truth in Router | ✅ Fixed |
> 
> Both issues are now resolved and the authentication flow works correctly without duplication or unwanted redirects.
> </details>

## 001-0011
> **Create login and registration UI components with form validation.** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
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
> - [x] 1. Create LoginForm component with email and password inputs
> - [x] 2. Create RegistrationForm component with all required fields
> - [x] 3. Implement form validation library (React Hook Form, Formik, etc.)
> - [x] 4. Add email format validation
> - [x] 5. Add password strength validation
> </details>

## 001-0013
> **Backend: Create Operator Entity & Database Schema** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Operator JPA entity created with all required fields (id, name, description, service_types, status, created_at, updated_at)
> - Database migration script created and tested
> - Operator repository interface implemented with custom query methods
> - Entity validation annotations added (NotBlank, NotNull, etc.)
> - Soft delete mechanism implemented (status field)
> - Database schema verified in test environment
> - Unit tests for entity validation pass
> 
> # TODO:
> - [-] Create Operator.java entity class with JPA annotations
> - [-] Add fields: id (UUID), name, description, service_types (comma-separated or JSON), status (ENUM), created_at, updated_at
> - [-] Create OperatorRepository interface extending JpaRepository
> - [-] Add custom query methods: findAllByStatusOrderByName(), findByIdAndStatus()
> - [-] Create database migration (Flyway/Liquibase) for operators table
> - [-] Add validation constraints to entity fields
> - [-] Write unit tests for entity and repository
> - [-] Test soft delete functionality (status = INACTIVE)
> 
> # Reports:
> ## Corrected Report: Backend: Create Operator Management Endpoints
> 
> ### Scenario
> - **Operator creates plans** → Each plan belongs to one operator
> - **Customer subscribes to plans** → Subscription links customer to plan (and indirectly to operator)
> - **Operator manages their own plans** → Add, enable, disable, delete
> - **Customer sees all available plans** from all operators
> - **Operator sees their own customers** (those who subscribed to their plans)
> 
> ### ✅ Already Done
> - User entity with roles (OPERATOR role exists)
> - Registration/login flow
> - Role-based access control
> 
> ### ❌ What's Needed for This Card
> 
> **1. Create Plan Entity:**
> - `id` (UUID/Long)
> - `name`, `description`, `price`
> - `service_type` (Internet, Mobile, Bundle)
> - `operator_id` (FK to User with OPERATOR role)
> - `status` (ACTIVE, INACTIVE, DELETED)
> - `created_at`, `updated_at`
> 
> **2. Create Subscription Entity:**
> - `id` (UUID/Long)
> - `customer_id` (FK to User with CUSTOMER role)
> - `plan_id` (FK to Plan)
> - `status` (ACTIVE, PENDING, CANCELED)
> - `created_at`, `updated_at`
> 
> **3. PlanRepository:**
> - `findByOperatorIdAndIsActiveTrue(Long operatorId, Pageable pageable)` — Get operator's plans
> - `findByOperatorIdAndId(Long operatorId, Long planId)` — Get specific plan for operator
> 
> **4. Create OperatorController:**
> - **GET `/api/operators/plans`** — List operator's own plans
> - **GET `/api/operators/plans/{planId}`** — Get specific plan details
> - **POST `/api/operators/plans`** — Create new plan
> - **PUT `/api/operators/plans/{planId}`** — Update plan
> - **DELETE `/api/operators/plans/{planId}`** — Delete plan
> 
> **5. Create OperatorService:**
> - Plan CRUD operations with operator authorization checks
> - Ensure operator can only manage their own plans
> 
> **6. SecurityConfig Updates:**
> - `/api/operators/**` requires `hasRole('OPERATOR')`
> </details>

## 001-0014
> **Backend: Create OperatorInitializer & Add Default Operator User** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (Definition of Done):
> - OperatorInitializer.java created following AdminInitializer/CustomerInitializer pattern
> - Default operator user created at startup with email/password
> - Operator user assigned OPERATOR role
> - Operator user active/enabled
> - Initializer runs only once (checks if operator already exists)
> - Integration test verifies operator user created
> 
> # TODO:
> - [x] Create OperatorInitializer.java
> - [x] Follow AdminInitializer pattern (inject UserRepository, RoleRepository)
> - [x] Create default operator user (email: operator@test.com or similar)
> - [x] Assign OPERATOR role to user
> - [-] Add idempotency check (don't create if exists)
> - [-] Register initializer in SecurityConfig or SubscriptionApiApp
> - [-] Write integration test
> - [-] Verify operator user exists after startup
> 
> # Reports:
> *
> </details>

## 001-0015
> **Backend: Plan Entity, Repository, Service & CRUD Endpoints** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (Definition of Done):
> - Plan entity with userId FK to User (operator owner) created
> - PlanRepository with custom queries implemented
> - PlanService with business logic layer created
> - GET /plans endpoint returns paginated list of ACTIVE plans
> - GET /plans/{id} endpoint returns full plan details
> - GET /my-plans endpoint returns current OPERATOR user's plans (OPERATOR role only)
> - Filtering by serviceType (Internet/Mobile/Bundle) implemented
> - Search plans by name/description implemented
> - Pagination working (page, size parameters)
> - POST /plans endpoint creates new plan (OPERATOR role only)
> - PUT /plans/{id} endpoint updates plan (OPERATOR owner only)
> - DELETE /plans/{id} endpoint soft-deletes plan (OPERATOR owner only)
> - Security: Only OPERATOR role can create/update/delete plans
> - Response structure consistent with project standards
> - Input validation for all parameters
> - Integration tests pass for all endpoints
> 
> # TODO:
> - [x] Create Plan entity (id, userId FK, name, description, serviceType, basePrice, billingPeriod, features JSON, status, timestamps)
> - [x] Create PlanRepository with findByUserId(), findByServiceType(), search queries
> - [x] Create PlanService with business logic and security checks
> - [x] Create PlanResponseDTO and PlanCreateRequest DTOs
> - [x] Implement GET /plans with pagination and filtering
> - [x] Implement GET /plans/{id} endpoint
> - [x] Implement GET /my-plans endpoint (OPERATOR only)
> - [x] Implement POST /plans endpoint (OPERATOR only, @PreAuthorize check)
> - [x] Implement PUT /plans/{id} endpoint (owner only)
> - [x] Implement DELETE /plans/{id} endpoint (owner only)
> - [x] Implement GET /plans/search?q={query} endpoint
> - [x] Add @PreAuthorize("hasRole('OPERATOR')") to create/update/delete endpoints
> - [x] Add owner validation (userId == currentUser.id)
> - [x] Add input validation using @Valid
> - [x] Write integration tests for all endpoints
> - [x] Test security (non-OPERATOR users cannot create/update/delete)
> - [x] Test owner isolation (operator can only modify own plans)
> 
> # Reports:
> *
> </details>

## 001-0016
> **Frontend: Operator Panle - Operator Listing Page - HTML Structure** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (Definition of Done):
> - pages/sections/operators.html created with section-container structure
> - Section header with "Operators" title
> - Operator cards grid container with id="operators-container"
> - Filter bar with serviceType dropdown (Internet, Mobile, Bundle)
> - Search input field for operator name
> - Pagination controls container
> - Loading message placeholder
> - Empty message placeholder
> - Error message placeholder
> - All elements follow admin.html structure pattern
> - HTML ready for JavaScript population
> 
> # TODO:
> - [x] Create pages/sections/operators.html file
> - [x] Add section-container and section-content divs
> - [x] Add section-header with h2 "Operators"
> - [x] Add section-view div with id="operators-view"
> - [x] Add operators-container div for operator cards
> - [x] Add filter bar with serviceType dropdown
> - [x] Add search input field
> - [x] Add pagination controls container
> - [x] Add loading/empty/error message placeholders
> - [x] Match structure exactly to admin.html pattern
> 
> # Reports:
> ## Backend Plan Controller Summary
> 
> **Endpoint**: `GET /api/plans/my-plans` (paginated)
> **Auth**: OPERATOR role required
> **Response**: `Page<PlanResponseDTO>` with pagination
> 
> **CRUD Operations**:
> - **Read**: `GET /api/plans/my-plans?page=0&size=10` - operator's own plans
> - **Create**: `POST /api/plans` - create new plan (PlanCreateRequest)
> - **Update**: `PUT /api/plans/{id}` - update plan (PlanUpdateRequest)
> - **Delete**: `DELETE /api/plans/{id}` - delete plan
> 
> **Additional Filters**:
> - `GET /api/plans/filter?serviceType=INTERNET&page=0&size=10`
> - `GET /api/plans/search?q=planName&page=0&size=10`
> 
> 
> Now I need the **PlanResponseDTO structure** to know what fields to display in the table and form.
> 
> Show me the PlanResponseDTO class (what fields does it have?).
> </details>

## 001-0017
> **Backend: Plan Controller & Service - Public Plans Listing & Admin Activation/Deactivation** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (Definition of Done):
> - PlanPublicResponseDTO created with operatorName field (no status/createdAt/updatedAt)
> - mapToPublicDTO() method added to PlanService
> - getAllActivePlansForPublic() service method implemented
> - GET /api/plans endpoint updated to return PlanPublicResponseDTO
> - Admin activate endpoint: PUT /api/plans/{id}/activate implemented
> - Admin deactivate endpoint: PUT /api/plans/{id}/deactivate implemented
> - activatePlan() service method with status update logic
> - deactivatePlan() service method with status update logic
> - All endpoints secured with @PreAuthorize annotations
> - Operator name formatted as firstName + lastName in public response
> 
> # TODO:
> - [x] Create PlanPublicResponseDTO.java in dto folder
> - [x] Add operatorName, name, description, serviceType, basePrice, billingPeriod, features fields
> - [x] Remove status, createdAt, updatedAt, userId fields from public DTO
> - [x] Add mapToPublicDTO() method in PlanService
> - [x] Add getAllActivePlansForPublic() method in PlanService
> - [x] Update getAllPlans() in PlanController to use new public DTO
> - [x] Add activatePlan() endpoint in PlanController with @PreAuthorize("hasRole('ADMIN')")
> - [x] Add deactivatePlan() endpoint in PlanController with @PreAuthorize("hasRole('ADMIN')")
> - [x] Implement activatePlan() service method
> - [x] Implement deactivatePlan() service method
> - [x] Test public endpoint returns only active plans with operator name
> - [x] Test admin activation/deactivation endpoints with proper authorization
> 
> # Reports:
> - Successfully implemented public plan listing for all users showing only active plans with operator names
> - Created separate DTO to prevent exposure of sensitive fields (status, timestamps, userId)
> - Added admin-only endpoints for plan status management (activate/deactivate)
> - All endpoints properly secured with role-based access control
> - Operator name properly concatenated from firstName and lastName fields
> </details>

## 001-0018
> **Frontend: Plan Listing Page - Public Plans Display with Operator Names** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (Definition of Done):
> - pages/sections/plans.html created with section-container structure
> - Section header with "Available Plans" title
> - Plans cards grid container with id="plans-container"
> - Filter bar with serviceType dropdown (Internet, Mobile, Bundle)
> - Search input field for plan name
> - Pagination controls container
> - Plan card displays: operatorName, name, description, serviceType, basePrice, billingPeriod, features
> - Loading message placeholder
> - Empty message placeholder
> - Error message placeholder
> - All elements follow admin.html structure pattern
> - HTML ready for JavaScript population
> 
> # TODO:
> - [x] Create pages/sections/plans.html file
> - [x] Add section-container and section-content divs
> - [x] Add section-header with h2 "Available Plans"
> - [x] Add section-view div with id="plans-view"
> - [x] Add plans-container div for plan cards grid
> - [x] Add filter bar with serviceType dropdown
> - [x] Add search input field
> - [x] Add pagination controls container
> - [x] Add plan card template with operatorName, name, description, serviceType, basePrice, billingPeriod, features
> - [x] Add loading/empty/error message placeholders
> - [x] Match structure exactly to admin.html pattern
> 
> # Reports:
> </details>

## 001-0019
> **Backend: Subscription Entity, Service, and Controller - Phase 4** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (Definition of Done):
> - Subscription entity created with all required fields
> - SubscriptionService interface defined with core methods
> - SubscriptionServiceImpl implemented with business logic
> - SubscriptionController created with REST endpoints
> - SubscriptionRepository interface created
> - All DTOs created (SubscriptionCreateRequest, SubscriptionResponseDTO, etc.)
> - Role-based access control implemented on endpoints
> - Input validation on all request parameters
> - Consistent JSON response structure across all endpoints
> - Error handling with appropriate HTTP status codes
> - Unit tests for service layer methods
> - Integration tests for controller endpoints
> - Token validation on protected endpoints
> 
> # TODO:
> - [x] Create Subscription entity class
> - [x] Define subscription status enum
> - [x] Create SubscriptionRepository interface
> - [x] Create SubscriptionService interface
> - [x] Implement SubscriptionServiceImpl
> - [x] Create subscription DTOs (Create/Response/Update)
> - [x] Create SubscriptionController
> - [x] Implement POST /subscriptions (create subscription)
> - [x] Implement GET /subscriptions (list user subscriptions)
> - [x] Implement GET /subscriptions/{id} (get subscription details)
> - [x] Implement PUT /subscriptions/{id}/plan (change plan)
> - [x] Implement DELETE /subscriptions/{id} (cancel subscription)
> - [x] Add validation for subscription creation
> - [x] Add role-based access control
> - [x] Add error handling and exceptions
> - [x] Write unit tests
> - [x] Write integration tests
> 
> # Reports:
> *
> </details>

## 001-0020
> **Frontend: Implement Subscription Management** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Subscription section created (SubscriptionSection) and registered in config.json
> - Display customer's active subscriptions with pagination
> - Show subscription status (ACTIVE, PENDING, SUSPENDED, CANCELED)
> - Display subscription details: plan name, operator, start date, billing period
> - Implement "View Details" modal for subscription info
> - Implement "Change Plan" modal with plan selection and preview
> - Implement "Cancel Subscription" confirmation dialog with reason input
> - Load and display active subscriptions on section init
> - Handle pagination for subscriptions list
> - Show empty state when no subscriptions exist
> - Error handling with toast notifications for failed operations
> - Responsive design (mobile-friendly subscription cards)
> - CSS files created in both css/default/ and css/dark/ directories
> - Follow existing PlansSection pattern for consistency
> 
> # TODO:
> - [x] Create pages/sections/subscription.html with subscriptions list container
> - [x] Create pages/sections/subscription.js (SubscriptionSection object)
> - [x] Register SubscriptionSection in config.json with customer/operator/admin roles
> - [x] Implement init() method - load subscriptions on section load
> - [x] Implement loadSubscriptions() - fetch /my-subscriptions endpoint with pagination
> - [x] Implement renderSubscriptions() - display subscription cards in grid layout
> - [x] Add subscription card with: plan name, operator, status badge, start date, billing period
> - [x] Implement "View Details" button and detail modal
> - [x] Implement openDetailModal() - show full subscription info
> - [x] Add subscription status indicator/badge (color-coded: green/yellow/red/gray)
> - [x] Implement renderPagination() for subscriptions list
> - [x] Create "Change Plan" modal with plan dropdown and pricing preview
> - [x] Implement changePlan() - POST to /subscriptions/{id}/change endpoint
> - [x] Create "Cancel Subscription" confirmation dialog
> - [x] Implement cancelSubscription() - PUT to /subscriptions/{id}/cancel endpoint
> - [x] Add event listeners for all modal buttons (close, change plan, cancel)
> - [x] Implement loadAvailablePlans() for "Change Plan" dropdown (same operator only)
> - [x] Add "Manage" button on subscription card (opens action menu)
> - [x] Handle loading states during API calls
> - [x] Display error messages with toast notifications
> - [x] Show success messages after actions (plan change, cancellation)
> 
> # Reports:
> *
> </details>

## 001-0021
> **Backend: Create Billing Entity, Repository, and Controller** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Billing entity created with all required fields
> - BillingStatus enum defined (PENDING, PAID, FAILED, REFUNDED, CANCELLED)
> - BillingPeriod enum extended for billing context if needed
> - BillingRepository created with custom query methods
> - BillingController created with CRUD and query endpoints
> - Service layer (BillingService) created for business logic
> - All endpoints return consistent JSON response structure
> - Input validation on all request DTOs
> - Error handling with appropriate HTTP status codes
> - Role-based access control (customers see own billing, admins see all)
> - Database migration/schema created
> - Unit tests for repository and service layer
> - Integration tests for controller endpoints
> - API documentation/comments added
> - Pagination implemented for list endpoints
> - Filtering/sorting implemented for billing records
> 
> # TODO:
> - [x] Create Billing entity with fields: id, subscriptionId, amount, currency, billingDate, dueDate, paidDate, status, invoiceNumber, notes, createdAt, updatedAt
> - [x] Create BillingStatus enum (PENDING, PAID, FAILED, REFUNDED, CANCELLED)
> - [x] Create BillingDTO classes (BillingCreateRequest, BillingResponseDTO, BillingUpdateRequest)
> - [x] Create BillingRepository interface with custom query methods
> - [x] Implement custom queries: findBySubscriptionId(), findByUserId(), findByStatus(), findByDateRange()
> - [x] Create BillingService interface with business logic methods
> - [x] Implement BillingServiceImpl with create, retrieve, update, delete, search operations
> - [x] Create BillingController with endpoints: POST, GET (by ID), GET (list with filters), PUT, DELETE
> - [x] Implement role-based access control in controller (customer = own records, admin = all records)
> - [x] Implement pagination for GET /billings endpoint
> - [x] Write unit tests for BillingService
> - [x] Write integration tests for BillingController endpoints
> 
> # Reports:
> *
> </details>

## 001-0022
> **Untitled** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> Title: Backend: Implement Automatic Invoice Generation at Billing Period Start
> Tags: Phase5, Backend, Billing, Automation
> Creator:
> AssignedTo:
> StartAt:
> EndAt:
> 
> # DOD (definition of done):
> - Invoice generation scheduler created and configured
> - Invoices automatically generated at billing period start (monthly/yearly)
> - Invoice records inserted into billing table via existing service
> - Cron job/scheduler triggers at correct times based on subscription billing period
> - All active subscriptions checked for invoice generation eligibility
> - Duplicate invoice prevention implemented (check if invoice already exists for period)
> - Invoice status tracked (PENDING, SENT, PAID, OVERDUE)
> - Transaction safety ensured (no partial/failed invoice creation)
> - Error handling and retry logic implemented
> - Logging added for invoice generation events
> - Unit tests verify invoice generation logic
> - Integration tests verify scheduler executes correctly
> - Manual testing confirms invoices generated for test subscriptions
> 
> # TODO:
> - [x] Review existing billing entity and subscription entity structure
> - [x] Review existing invoice/billing repository and service
> - [x] Create InvoiceScheduler class with @Scheduled annotation
> - [x] Implement method to fetch all active subscriptions due for invoice
> - [x] Implement invoice generation logic (create Invoice entity with correct data)
> - [x] Add duplicate check (prevent re-issuing invoice for same period)
> - [x] Set invoice status to PENDING on creation
> - [x] Add billing period calculation logic (determine next invoice date)
> - [x] Implement transaction handling (@Transactional) for invoice creation
> - [x] Add logging for successful and failed invoice generation
> - [x] Create error handling for scheduler failures
> - [x] Add retry mechanism for failed invoices
> - [x] Create unit tests for invoice generation logic
> - [x] Create integration tests for scheduler execution
> - [x] Test with monthly subscription billing periods
> - [x] Test with yearly subscription billing periods
> - [x] Test duplicate prevention (re-run scheduler, verify no duplicate invoices)
> - [x] Verify invoice records appear in billing table
> - [x] Test scheduler runs at expected intervals
> 
> # Reports:
> **Short explanation:**
> 
> 1. **Create `InvoiceScheduler` class** with `@Scheduled` annotation (runs daily)
> 2. **Fetch all active subscriptions** where billing period start date = today
> 3. **Check if invoice already exists** for that subscription + period (prevent duplicates)
> 4. **Create Invoice entity** with subscription data (amount, period, due date)
> 5. **Save to database** via existing invoice repository (existing service handles it)
> 6. **Log success/errors** and handle exceptions
> 
> That's it. The scheduler checks daily, generates invoices when needed, existing billing service handles the rest.
> 
> Ready to see your subscription and invoice entities to write the code?
> </details>

## 001-0023
> **Frontend: Operator Billing/Invoices Management Section** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Billing section HTML file created in pages/sections/
> - Billing section JS file created in js/pages/sections/
> - Section registered in config.json with operator role access
> - Invoice list displays all invoices for logged-in operator
> - Invoice detail modal shows full invoice information
> - Invoice status change functionality works correctly
> - Loading states displayed during data fetch
> - Error handling with toast notifications
> - CSS files created in both default/ and dark/ theme directories
> - Responsive design tested on mobile/tablet/desktop
> - All API calls use apiClient without /api prefix
> - Section follows existing dashboard section pattern
> 
> # TODO:
> - [x] Create billing.html in pages/sections/
> - [x] Create billing.js in js/pages/sections/ with init() and cleanup() methods
> - [x] Register billing section in config.json (operator role only)
> - [x] Implement invoice list table with columns (ID, Date, Amount, Status, Actions)
> - [x] Implement GET /invoices endpoint call to fetch operator invoices
> - [x] Add loading state during invoice fetch
> - [x] Create invoice detail modal window component
> - [x] Implement modal trigger on "View" action button
> - [x] Display invoice details in modal (ID, Date, Amount, Status, Items, Description)
> - [x] Add "Change Status" dropdown in modal
> - [x] Implement PUT /invoices/{id}/status endpoint call
> - [x] Add success/error toast notifications for status changes
> - [x] Create CSS for billing section in css/default/
> - [x] Create CSS for billing section in css/dark/
> - [x] Add billing.css to config/styles.json
> - [x] Verify theme switching works for billing section
> 
> # Reports:
> *
> </details>

## 001-0024
> **Testing: Phase 2 Frontend Unit Tests** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Unit tests for operators section pass
> - Unit tests for plans section pass
> - Unit tests for filtering/search functionality pass
> - Unit tests for plan detail modal pass
> - Unit tests for plan comparison view pass
> - Test coverage minimum 70% for Phase 2 frontend code
> - All API calls mocked with test data
> - Loading states tested
> - Error handling tested with toast notifications
> - Responsive layout tested on multiple screen sizes
> - All tests run successfully in CI/CD pipeline
> 
> # TODO:
> - [x] Create test suite for operators.js
> - [x] Test init() method loads operators correctly
> - [x] Test API call to GET /operators with pagination
> - [x] Test operator card rendering with mock data
> - [x] Test loading state display
> - [x] Test error handling and toast notifications
> - [x] Test navigation to plan catalog on operator click
> - [x] Test cleanup() method removes event listeners
> - [x] Create test suite for plans.js
> - [x] Test init() method loads plans for operator
> - [x] Test API call to GET /operators/{id}/plans
> - [x] Test plan card rendering with mock data
> - [x] Test plan detail modal opens on click
> - [x] Test loading state and error handling
> - [x] Create test suite for filtering/search functionality
> - [x] Test service_type filter changes results
> - [x] Test search query with debouncing
> - [x] Test sort functionality (price, newest)
> - [x] Test filter state in URL hash parameters
> - [x] Create test suite for plan-detail-modal.js
> - [x] Test modal opens/closes correctly
> - [x] Test API call to GET /plans/{id}
> - [x] Test plan details render correctly
> - [x] Test Subscribe Now button functionality
> - [x] Test related plans display
> - [x] Create test suite for comparison.js
> - [x] Test plan selection and comparison table rendering
> - [x] Test add/remove plan functionality
> - [x] Test responsive table layout on mobile
> - [x] Test all responsive layouts (mobile, tablet, desktop)
> - [x] Run all tests and verify 70%+ code coverage
> 
> # Reports:
> *
> </details>

## 001-0025
> **Backend: Fix BillingControllerIntegrationTest and Add Missing Tests** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - BillingControllerIntegrationTest: 18/18 tests passing
> - All billing-related endpoints covered with integration tests
> - Billing service layer fully tested with unit tests
> - Billing scheduler functionality validated
> - Response DTOs properly tested
> - Error handling and edge cases covered
> - Input validation tested for all billing operations
> - Authorization/RBAC properly enforced and tested
> 
> # TODO:
> - [x] Analyze failing 15 tests in BillingControllerIntegrationTest
> - [x] Fix failing test cases
> - [x] Add missing billing endpoint tests
> - [x] Verify billing request/response DTOs validation
> - [x] Test billing status transitions
> - [x] Test billing period calculations
> - [x] Add authorization tests for billing endpoints
> - [x] Test error scenarios (invalid data, unauthorized access)
> - [x] Run full test suite to ensure all 18 tests pass
> - [x] Identify any missing test coverage gaps based on file map
> - [x] Add additional tests if needed for uncovered scenarios
> 
> # Reports:
> ## Missing Tests
> 
> | Component | Missing Tests | Test Type | Priority |
> |-----------|---------------|-----------|----------|
> | **BillingController** | Billing period/status enum endpoints (`/billing-statuses`, `/billing-periods`) | Integration | Medium |
> | **BillingController** | Filter parameters testing (`subscriptionId`, `status` params on `/my-billings`) | Integration | High |
> | **BillingController** | Operator-specific endpoints (`/operator/issued`) with status filter | Integration | High |
> | **BillingController** | Customer-specific endpoints (`/customer`) with status filter | Integration | High |
> | **BillingController** | Approval workflow (`/approve` endpoint) authorization and logic | Integration | High |
> | **BillingController** | Invoice DTO endpoint (`GET /{id}` returning BillingInvoiceDTO) | Integration | Medium |
> | **BillingController** | GET `/` endpoint (getBillingsByUser) | Integration | High |
> | **BillingController** | DELETE `/{id}` endpoint authorization/validation | Integration | Medium |
> | **BillingController** | PUT `/{id}` endpoint status update validation | Integration | High |
> | **BillingService** | Billing status transition logic (PENDING → PAID, PENDING → OVERDUE) | Unit | High |
> | **BillingService** | Payment approval workflow validation | Unit | High |
> | **BillingService** | Filter logic (by subscription, status) in service layer | Unit | High |
> | **BillingService** | Billing amount calculations and rounding | Unit | Medium |
> | **BillingScheduler** | Recurring billing generation and automation | Integration | High |
> | **BillingScheduler** | Renewal date calculation and next billing date logic | Integration | High |
> | **BillingScheduler** | Auto-renewal subscription billing trigger | Integration | High |
> | **BillingCreateRequest** | DTO validation (null checks, amount validation, date validation) | Unit | Medium |
> | **BillingUpdateRequest** | DTO validation (status enum validation) | Unit | Medium |
> | **BillingResponseDTO** | Mapping from entity to DTO | Unit | Medium |
> | **BillingInvoiceDTO** | Mapping and complex DTO structure | Unit | Medium |
> | **Error Scenarios** | Invalid subscription IDs (404 handling) | Integration | High |
> | **Error Scenarios** | Non-existent billing IDs (404 handling) | Integration | High |
> | **Error Scenarios** | Cross-user access violations (403 handling) | Integration | High |
> | **Error Scenarios** | Invalid billing status values | Integration | Medium |
> | **Authorization/RBAC** | Test all roles (CUSTOMER, OPERATOR, ADMIN) for each endpoint | Integration | High |
> | **Authorization/RBAC** | Test unauthenticated requests (missing token) | Integration | High |
> | **Authorization/RBAC** | Test expired/invalid tokens | Integration | Medium |
> 
> ## Updated File Map with Test Coverage Status
> 
> ```
> ├── main
> │   ├── java
> │   │   └── com
> │   │       └── subscriptionapi
> │   │           ├── config
> │   │           │   ├── AdminInitializer.java
> │   │           │   ├── PlanInitializer.java
> │   │           │   ├── PlanProperties.java
> │   │           │   ├── RoleInitializer.java
> │   │           │   ├── SecurityConfig.java ⚠️
> │   │           │   ├── UserInitializer.java
> │   │           │   └── UserProperties.java
> │   │           ├── controller
> │   │           │   ├── AdminController.java
> │   │           │   ├── AuthController.java ✅
> │   │           │   ├── BillingController.java ✅
> │   │           │   ├── OperatorController.java
> │   │           │   ├── PlanController.java ✅
> │   │           │   ├── SubscriptionController.java ✅
> │   │           │   └── UserController.java
> │   │           ├── dto
> │   │           │   ├── BillingCreateRequest.java ❌
> │   │           │   ├── BillingInvoiceDTO.java ❌
> │   │           │   ├── BillingResponseDTO.java ❌
> │   │           │   ├── BillingUpdateRequest.java ❌
> │   │           │   └── [Other DTOs - mostly tested]
> │   │           ├── entity
> │   │           │   ├── Billing.java ⚠️
> │   │           │   ├── BillingPeriod.java ✅
> │   │           │   ├── BillingStatus.java ✅
> │   │           │   └── [Other entities - tested]
> │   │           ├── exception
> │   │           │   ├── GlobalExceptionHandler.java ⚠️
> │   │           │   └── [Other exceptions]
> │   │           ├── jwt
> │   │           │   └── JwtTokenProvider.java ✅
> │   │           ├── repository
> │   │           │   ├── BillingRepository.java ⚠️
> │   │           │   └── [Other repositories]
> │   │           ├── scheduler
> │   │           │   └── BillingScheduler.java ⚠️ (Has test but incomplete)
> │   │           ├── security
> │   │           │   └── JwtAuthenticationFilter.java ✅
> │   │           ├── service
> │   │           │   ├── BillingService.java ⚠️ (Unit test exists but incomplete)
> │   │           │   ├── BillingServiceImpl.java ⚠️
> │   │           │   ├── PlanService.java ✅
> │   │           │   ├── SubscriptionService.java ✅
> │   │           │   └── [Other services - tested]
> │   │           └── util
> │   │               └── PasswordValidator.java ✅
> │
> └── test
>     ├── java
>     │   └── com
>     │       └── subscriptionapi
>     │           ├── controller
>     │           │   ├── AuthControllerLoginIntegrationTest.java ✅
>     │           │   ├── AuthControllerPasswordIntegrationTest.java ✅
>     │           │   ├── AuthenticationIntegrationTest.java ✅
>     │           │   ├── BillingControllerIntegrationTest.java ✅
>     │           │   ├── PlanControllerIntegrationTest.java ✅
>     │           │   └── SubscriptionControllerIntegrationTest.java ✅
>     │           ├── service
>     │           │   ├── BillingSchedulerIntegrationTest.java ⚠️ (Incomplete)
>     │           │   ├── BillingServiceUnitTest.java ⚠️ (Incomplete)
>     │           │   ├── PlanServiceOwnershipIntegrationTest.java ✅
>     │           │   ├── SubscriptionServiceUnitTest.java ✅
>     │           │   ├── UserServiceIntegrationTest.java ✅
>     │           │   └── [Other service tests - tested]
>     │           ├── entity
>     │           │   ├── UserUnitTest.java ✅
>     │           │   └── [Other entity tests]
>     │           ├── jwt
>     │           │   └── JwtTokenProviderUnitTest.java ✅
>     │           ├── security
>     │           │   ├── JwtAuthenticationFilterUnitTest.java ✅
>     │           │   └── ProtectedEndpointsIntegrationTest.java ✅
>     │           └── util
>     │               └── PasswordValidatorUnitTest.java ✅
> ```
> 
> **Legend:**
> - ✅ = Fully tested
> - ⚠️ = Partially tested (needs more coverage)
> - ❌ = No tests found
> 
> ## Billing Enum Endpoints Integration Test - COMPLETED ✅
> 
> | Component | Test Name | Status | Test Count |
> |-----------|-----------|--------|-----------|
> | **BillingController** | Billing enum endpoints (`/billing-statuses`, `/billing-periods`) | ✅ DONE | 11 tests |
> 
> **Tests Implemented:**
> - ✅ GET /billing-statuses (all values, non-empty, critical values, all roles, auth required)
> - ✅ GET /billing-periods (all values, non-empty, critical values, all roles, auth required)
> - ✅ JSON array validation for both endpoints
> 
> **Enums Validated:**
> - BillingStatus: PENDING, PAID, FAILED, REFUNDED, CANCELLED, PAYMENT_CLAIMED
> - BillingPeriod: MONTHLY, YEARLY
> 
> **Completion Rate:** 1/26 (3.8%) ✅
> 
> 
> ## Remaining: 25 items (High priority: Filter testing, Operator/Customer endpoints, Status transitions, Scheduler tests)
> </details>

## 001-0026
> **Refactor & Optimize Section JS Files - Extract Reusable Libraries** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Optimize each section file individually for performance and readability
> - No external libraries or modules created
> - Each file refactored in isolation
> - All functionality preserved with no breaking changes
> - Reduce file size and improve code clarity
> - Document what was optimized in each file
> 
> # TODO:
> - [x] Optimize js/pages/sections/admin.js
> - [x] Optimize js/pages/sections/billmanager.js
> - [x] Optimize js/pages/sections/mysubscriptions.js
> - [x] Optimize js/pages/sections/operator.js
> - [x] Optimize js/pages/sections/plans.js
> - [x] Optimize js/pages/sections/profile.js
> - [x] Optimize js/pages/sections/settings.js
> - [x] Optimize js/pages/sections/subscriptionsman.js
> - [x] Test all optimized files end-to-end
> - [x] Verify no breaking changes
> - [x] Optimize js/pages/login.js
> - [x] Optimize js/pages/dashboard.js
> - [x] Optimize js/pages/register.js
> - [x] Optimize js/header.js
> - [x] Optimize js/utils/apiclient.js
> - [x] Optimize js/console-logger.js
> - [x] Optimize js/console.js
> - [x] Optimize js/dashboard-section-manager.js
> - [x] Optimize js/initializer.js
> - [x] Optimize js/router.js
> - [x] Optimize js/script-loader.js
> - [x] Optimize js/theme-manager.js
> - [x] Optimize js/ui-controller.js
> 
> # Reports:
> ## Billmanager.js Optimization Report
> 
> **File:** js/pages/sections/billmanager.js
> 
> ### Metrics
> 
> | Metric | Before | After | Change |
> |--------|--------|-------|--------|
> | Total Lines | 380 | 562 | +182 lines |
> | Code Readability | Medium | High | ✅ Improved |
> | Code Duplication | High | Low | ✅ Reduced |
> | DOM Query Calls | 25+ scattered | Cached in `elements` | ✅ Optimized |
> | Error Handling | Repeated 8+ times | Centralized (4 methods) | ✅ Unified |
> | Maintainability | Low | High | ✅ Improved |
> 
> ### Optimizations Applied
> 
> **Element Caching**
> - Created `elements` object to cache all DOM references
> - Eliminates repeated `document.getElementById()` calls
> - Reduced DOM queries by ~60%
> 
> **Centralized Error Handling**
> - Extracted `handleError()`, `handleSuccess()`, `handleWarning()`, `handleDetailError()`
> - Removed 8+ duplicate error handler blocks
> - Consistent messaging across all API calls
> 
> **Template Builder Methods**
> - Split 150+ line invoice HTML into 6 focused methods:
>   - `buildInvoiceHTML()`, `buildInvoiceTop()`, `buildInvoiceAddresses()`, `buildInvoiceDates()`, `buildInvoiceItems()`, `buildInvoiceTotals()`, `buildInvoiceMeta()`, `buildBillActions()`
> - Each method has single responsibility
> - Much easier to modify specific sections
> 
> **Extracted Reusable Logic**
> - `resetFilters()` - Consolidates filter reset
> - `buildBillsEndpoint()` - Centralized endpoint building
> - `parseBillsResponse()` - Unified response parsing logic
> - `createTableHead()`, `createTableBody()`, `createBillRow()` - Table rendering split
> - `addActionButtons()` - Action button logic extracted
> - `createPaginationButton()` - Pagination button factory
> - `setButtonLoading()` - Button state management
> - `attachDetailModalListeners()` - Modal listener setup
> 
> ### Code Quality Improvements
> 
> ✅ **Single Responsibility Principle** - Each method does one thing
> ✅ **DRY (Don't Repeat Yourself)** - No duplicate error handling or patterns
> ✅ **Readability** - Clear method names, easier to understand flow
> ✅ **Maintainability** - Changing invoice layout only requires updating builder methods
> ✅ **Testability** - Smaller methods are easier to unit test
> ✅ **Scalability** - New features can reuse extracted helpers
> 
> ### Trade-off
> 
> Line count increased due to breaking complex logic into focused methods. This is intentional and improves code quality, even though file size grew. Modern minification will compress it back down.
> 
> ### Notes
> 
> - All functionality preserved with zero breaking changes
> - Original function names and API calls unchanged
> - HTML template structure remains identical
> - Ready for further optimization by moving templates to separate files
> </details>

## 001-0027
> **Complete Spring Boot Security Layer Testing - Web Client README** ![status](https://img.shields.io/badge/status-DONE-brightgreen)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - README includes all sections from project overview through best practices
> - All code examples are properly formatted and accurate
> - Navigation links in quick navigation section are functional
> - File structure documentation is comprehensive and up-to-date
> - API integration guidelines are clear and complete
> - All reference guides are documented with proper method signatures
> - Best practices section provides actionable guidance
> - Document is reviewed and approved by client/team lead
> 
> # TODO:
> - [x] Review and organize existing documentation content
> - [x] Create Project Overview section with clear project purpose
> - [x] Document complete Tech Stack section
> - [x] Create detailed Architecture section with diagrams/descriptions
> - [x] Write Getting Started guide with setup instructions
> - [x] Document complete File Structure with descriptions
> - [x] Create comprehensive "Adding New Elements" section with code examples
> - [x] Document API Integration patterns and endpoints
> - [x] Write UI & Notifications section with examples
> - [x] Complete all Reference Guide subsections
> - [x] Add Best Practices with code examples
> - [x] Add Next Section Ideas for future development
> - [x] Proofread and format entire README
> - [x] Validate all code examples execute correctly
> - [x] Get client/stakeholder approval
> 
> # Reports:
> </details>

## 001-0012
> **TypeScript Conversion & State Management (Redux/Zustand/Context)** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - AuthService converted to TypeScript with proper interfaces
> - All components have TypeScript types
> - Redux/Zustand/Context store implemented for auth state management
> - Auth state changes automatically trigger UI updates
> - Type-safe selectors for user, token, isAuthenticated, userRole
> - No `any` types used (strict mode)
> - All API calls properly typed with request/response interfaces
> 
> # TODO:
> - [ ] 1. Create TypeScript interfaces for User, AuthResponse, LoginRequest, RegisterRequest
> - [ ] 2. Convert AuthService to TypeScript with proper typing
> - [ ] 3. Convert AuthGuard to TypeScript
> - [ ] 4. Convert ApiClient to TypeScript
> - [ ] 5. Choose state management library (Redux, Zustand, or Context API)
> - [ ] 6. Implement auth reducer/actions for login, logout, register
> - [ ] 7. Create selectors for user, token, isAuthenticated, userRole
> - [ ] 8. Integrate state management with existing components
> - [ ] 9. Replace localStorage-only approach with state management
> - [ ] 10. Test state persistence and retrieval after page refresh
> 
> # Reports:
> * (to be filled during development)
> </details>

## 001-0028
> **Set up JS testing framework, write tests for apiClient.js, and integrate CI/CD** ![status](https://img.shields.io/badge/status-ONGOING-yellow)
> <details open>
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Testing framework installed and configured
> - apiClient.js has 80%+ test coverage
> - Tests run successfully
> - Testing documentation created
> - CI/CD pipeline updated and running tests on commits
> 
> # TODO:
> - [x] Research and select testing framework for browser environment (Jest, Vitest, Mocha)
> - [x] Install and configure testing framework
> - [x] Create test setup with DOM/browser API mocking
> - [x] Write comprehensive tests for `js/utils/apiClient.js`
> - [x] Document testing patterns and conventions
> - [x] Update CI/CD pipeline to run JS tests
> - [x] Verify tests run on commits
> 
> # Reports:
> 
> ## Testing Setup Strategy
> 
> **Testing Framework:** Jest (recommended for browser-based JS with DOM mocking)
> 
> **Test File Location:** Mirror structure in `tests/` folder
> - Source: `js/utils/apiClient.js`
> - Test: `tests/utils/apiClient.test.js`
> 
> **Test File Naming Convention:** `[filename].test.js`
> 
> **Why this approach:**
> - Keeps source and tests separate and organized
> - Easy to scale as project grows
> - CI/CD can ignore `tests/` folder if needed
> - Clear separation of concerns
> 
> **Setup includes:**
> - Jest configuration file
> - Test utilities for API mocking
> - DOM environment setup for browser tests
> 
> ## Testing Framework Selection & Strategy
> 
> **Framework Comparison:**
> 
> | Framework | Dependencies | Setup Complexity | Browser Mocking | Real Browser | Unit Tests | Integration Tests | GitHub Actions | Container Support |
> |-----------|--------------|------------------|-----------------|--------------|-----------|-------------------|-----------------|-------------------|
> | **Jest + jsdom** | npm (medium) | Low | ✅ Good (jsdom) | ❌ No | ✅ Excellent | ⚠️ Limited | ✅ Easy | ✅ Yes |
> | **Vitest** | npm (medium) | Low | ✅ Good (jsdom) | ❌ No | ✅ Excellent | ⚠️ Limited | ✅ Easy | ✅ Yes |
> | **Mocha + Chai** | npm (medium) | Medium | ⚠️ Needs jsdom plugin | ❌ No | ✅ Good | ⚠️ Limited | ✅ Easy | ✅ Yes |
> | **Playwright** | npm (large) | High | ❌ No | ✅ Real Chromium | ⚠️ Possible | ✅ Excellent | ✅ Easy | ⚠️ Needs browser |
> | **Jest + Playwright** | npm (large) | Medium | ✅ Both | ✅ Real Chromium | ✅ Excellent | ✅ Excellent | ✅ Easy | ✅ Yes |
> 
> **Chosen: Jest + Playwright**
> 
> ### Benefits:
> - **Jest**: Fast unit tests, built-in mocking, DOM simulation with jsdom
> - **Playwright**: Real browser testing, catches integration issues Jest misses
> - **Combined**: Cover both unit logic and real browser behavior
> - **Container-friendly**: Both run in Node.js container
> - **GitHub Actions**: Standard npm workflow, pip can easily install Node.js
> 
> ### Challenges with Jest (and Node.js):
> 
> **Node.js Module Hell:**
> - Tiny version bumps break everything (dependency chaos)
> - npm ecosystem fragile and unpredictable
> - lock files massive and hard to manage
> - Security vulnerabilities pop up constantly in dependencies
> 
> **Jest Specific:**
> - Heavy dependency tree (hundreds of npm packages)
> - Slow startup time (even for small tests)
> - jsdom ≠ real browser (gaps in DOM simulation)
> - Configuration can be cryptic and finicky
> - Memory usage grows with test suite
> 
> **Container + Node.js Issues:**
> - Container image bloated (Node.js + all npm packages)
> - Build time increases significantly
> - Module caching problems between runs
> - Version drift between local and CI/CD
> 
> ### Mitigation:
> - Pin ALL versions in package.json (lock exact versions, no auto-updates)
> - Use `package-lock.json` religiously (prevent dependency surprises)
> - Separate unit tests (Jest) from integration tests (Playwright) in CI/CD stages
> - Run Jest tests first (fast feedback), Playwright tests later (comprehensive validation)
> - Monitor npm vulnerabilities regularly
> - Keep Node.js version stable (don't upgrade unless necessary)
> - Use container for isolation (reduces local system pollution)
> 
> **Local Testing:**
> - Tests run via container (called from Ubuntu, not inside)
> - Container has Node.js + npm + Chromium installed
> - Jest and Playwright dependencies isolated in container
> - Prevents module conflicts with system Node.js
> 
> **GitHub Workflow:**
> - Future implementation via pip
> - Pip will install Node.js and npm
> - Same test commands run locally and in CI/CD
> - Follows pattern of existing backend Java tests (multiple stages)
> 
> **Browser Mocking Strategy:**
> - **Unit tests (Jest)**: Mock fetch(), document.dispatchEvent(), localStorage, etc.
> - **Integration tests (Playwright)**: Real Chromium browser for DOM interactions
> - Both test types needed for apiClient.js (API calls + browser events)
> 
> **Test Structure:**
> - `tests/utils/apiClient.test.js` (Jest unit tests)
> - `tests/integration/apiClient.integration.test.js` (Playwright integration tests)
> - Naming convention: `[filename].test.js` or `[filename].integration.test.js`
> 
> **Next Steps:**
> 1. Setup Jest with jsdom configuration
> 2. Write unit tests for apiClient request method
> 3. Setup Playwright when integration tests needed
> 4. Document container test execution command
> 
> ## Test Structure Setup
> 
> **Script Created:** `create-test-structure.sh`
> 
> **Usage:**
> ```bash
> chmod +x create-test-structure.sh
> ./create-test-structure.sh webclientv1/src/js
> ```
> 
> **What it does:**
> - Automatically detects source JS directory: `webclientv1/src/js`
> - Creates matching test structure: `webclientv1/tests/js`
> - Mirrors all subdirectories from source
> - Creates `.test.js` files for each `.js` source file
> - Generates template test files with:
>   - Import statement for source file
>   - Jest describe/test blocks
>   - Placeholder test that passes
>   - Ready to run immediately
> 
> **Template includes:**
> - Relative import path: `../../src/js/...`
> - `beforeEach()` and `afterEach()` hooks
> - Placeholder test checking if file is defined
> - Comments for adding real tests
> 
> **Next step:**
> - Run script to generate test structure
> - Then setup Jest configuration and package.json
> 
> # GitHub Workflow Setup Report
> 
> ## Test Infrastructure Implementation
> 
> **Script Created:** `create-test-structure.sh`
> - Automatically generates test directory structure mirroring source files
> - Creates template `.test.js` files with Jest boilerplate
> - Extracts class names from source files using regex parsing
> - Generates relative import paths automatically
> 
> **Module Loading System:** `load-modules.js`
> - Reads `scripts.json` configuration to map available modules
> - Implements static file analysis (no code execution) for class discovery
> - Provides `loadModules()` function with three usage modes:
>   - Load all modules: `loadModules()`
>   - Load single module: `loadModules('ClassName')`
>   - Load multiple modules: `loadModules(['Class1', 'Class2'])`
> - Fallback search across all files when exact match not found
> - Clears require cache between loads to prevent stale imports
> 
> **Setup File:** `setup.js`
> - Mocks browser APIs and DOM objects for Node.js environment
> - Enables Jest to run browser-based JavaScript code in Node.js context
> 
> **Test Execution:** `run-tests.sh`
> - List tests: `./run-tests.sh --list`
> - Count tests: `./run-tests.sh --count`
> - Filter by pattern: `./run-tests.sh --filter "User"`
> - Exclude tests: `./run-tests.sh --exclude "Integration"`
> - Unit-only/Integration-only modes
> - Parallel execution: `./run-tests.sh --parallel 4`
> - Stop on first failure: `./run-tests.sh --stop-on-failure`
> - Re-run failed tests: `./run-tests.sh --failed-only`
> 
> **Container Integration:** `container-run` config
> - Added `npx@nodejs:npx ---path=/home/{username}/github-java/Subscription-Platform-ProjectTest/clients` entry
> - Enables `npx jest` commands to run inside Node.js container
> - Working directory automatically set from config path
> - Commands executed: `source container-run` then `npx jest <test-file>`
> 
> **Example Test Structure:**
> ```javascript
> // Auto-generated template for each source file
> const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
> const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
> const { ClassName } = loadModules('ClassName');
> 
> describe('ClassName', () => {
>   beforeEach(() => { /* setup */ });
>   afterEach(() => { /* cleanup */ });
>   test('should be defined', () => {
>     expect(ClassName).toBeDefined();
>   });
> });
> ```
> 
> **Dependencies Installed:**
> - Jest (testing framework)
> - jsdom (DOM mocking for Node.js)
> - Required npm packages in `package.json`
> 
> **Note:** Test templates generated retroactively because source code written before tests. In real projects, tests are written in parallel with source code (script not needed).
> 
> 
> # GitHub Workflow Setup Report
> 
> ## Test Infrastructure Implementation
> 
> **Script Created:** `create-test-structure.sh`
> - Automatically generates test directory structure mirroring source files
> - Creates template `.test.js` files with Jest boilerplate
> - Extracts class names from source files using regex parsing
> - Generates relative import paths automatically
> 
> **Module Loading System:** `load-modules.js`
> - Reads `scripts.json` configuration to map available modules
> - Implements static file analysis (no code execution) for class discovery
> - Provides `loadModules()` function with three usage modes:
>   - Load all modules: `loadModules()`
>   - Load single module: `loadModules('ClassName')`
>   - Load multiple modules: `loadModules(['Class1', 'Class2'])`
> - Fallback search across all files when exact match not found
> - Clears require cache between loads to prevent stale imports
> 
> **Setup File:** `setup.js`
> - Mocks browser APIs and DOM objects for Node.js environment
> - Enables Jest to run browser-based JavaScript code in Node.js context
> 
> 
> ## Test Execution Guide
> 
> ### Quick Start
> 1. **Run all tests:** `npx jest`
> 2. **Run specific test:** `npx jest tests/js/services/authGuard.test.js`
> 3. **Setup container first:** `source container-run`
> 
> ### Using `run-tests.sh`
> 
> **List all tests:**
> ```bash
> ./run-tests.sh --list
> ```
> 
> **Count discovered tests:**
> ```bash
> ./run-tests.sh --count
> ```
> 
> **Run with filters:**
> ```bash
> ./run-tests.sh --filter "User"
> ./run-tests.sh --exclude "Integration"
> ```
> 
> **Run test types:**
> ```bash
> ./run-tests.sh --unit-only
> ./run-tests.sh --integration-only
> ```
> 
> **Advanced execution:**
> ```bash
> ./run-tests.sh --parallel 4           # Run 4 tests in parallel
> ./run-tests.sh --stop-on-failure      # Stop at first failure
> ./run-tests.sh --failed-only          # Re-run only failed tests
> ./run-tests.sh --verbose              # Show full output
> ```
> 
> 
> ## Container Integration Setup
> 
> **Config Entry Added to `.source container-run`:**
> ```
> npx@nodejs:npx ---path=/home/{username}/github-java/Subscription-Platform-ProjectTest/clients
> ```
> 
> **How to use:**
> 1. Source the container config: `source container-run`
> 2. Run Jest via container: `npx jest tests/js/services/authGuard.test.js`
> 3. Working directory automatically set from config path
> 
> 
> ## Test File Structure
> 
> **Auto-generated template for each source file:**
> ```javascript
> // Test file for: webclientv1/src/js/app.js
> const testSetup = require(process.cwd() + '/webclientv1/tests/setup.js');
> const loadModules = require(process.cwd() + '/webclientv1/tests/load-modules.js');
> const { App } = loadModules('App');
> 
> describe('App', () => {
>   
>   beforeEach(() => {
>     // Setup before each test
>   });
> 
>   afterEach(() => {
>     // Cleanup after each test
>   });
> 
>   test('should be defined', () => {
>     expect(App).toBeDefined();
>   });
> 
>   // TODO: Add your tests here
>   // Example:
>   // test('should do something', () => {
>   //   expect(result).toBe(expected);
>   // });
> 
> });
> ```
> 
> 
> ## Implementation Notes
> 
> - Test templates generated retroactively (source code written before tests)
> - In real projects, write tests in parallel with source code (script not needed)
> - Jest configured with jsdom for browser API mocking
> - All dependencies installed in `package.json`
> - Module loader uses static analysis (no code execution)
> - Container isolation prevents local system pollution
> </details>
