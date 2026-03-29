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

## 001-0014
> **Backend: Implement Operator List & Filter Endpoints** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - GET /operators endpoint returns paginated list of active operators
> - Pagination working (page, size parameters)
> - Filtering by service_type implemented and tested
> - Filtering by status (ACTIVE/INACTIVE) implemented
> - GET /operators/{id} endpoint returns operator details with plan count
> - Response structure consistent with project standards
> - Input validation for all query parameters
> - Integration tests pass for both endpoints
> - Operator isolation enforced (only ACTIVE operators visible to customers)
> 
> # TODO:
> - [ ] Create OperatorController.java with @RestController annotation
> - [ ] Implement GET /operators with @GetMapping, pagination support
> - [ ] Add @RequestParam for filtering (serviceType, status, page, size)
> - [ ] Implement GET /operators/{id} endpoint
> - [ ] Create OperatorService layer with business logic
> - [ ] Add filtering logic: findActiveOperators(), filterByServiceType()
> - [ ] Implement pagination using Page<Operator> and PageRequest
> - [ ] Add response DTO (OperatorResponseDTO) for consistent JSON structure
> - [ ] Write integration tests for both endpoints
> - [ ] Test operator isolation (inactive operators not returned to customers)
> - [ ] Add input validation using @Valid and custom validators
> 
> # Reports:
> *
> </details>

## 001-0015
> **Backend: Implement Plan List & Filter Endpoints** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - GET /plans endpoint returns paginated list of active plans
> - GET /operators/{id}/plans returns plans for specific operator only
> - Filtering by service_type (Internet, Mobile, Bundle) implemented
> - Filtering by billing_period (MONTHLY, YEARLY) implemented
> - Filtering by status (ACTIVE/INACTIVE) implemented
> - Pagination working (page, size parameters)
> - Response structure consistent with project standards
> - Input validation for all query parameters
> - Integration tests pass for all endpoints
> - Plan isolation enforced (only ACTIVE plans visible to customers)
> 
> # TODO:
> - [ ] Create Plan.java JPA entity with operator_id foreign key
> - [ ] Create PlanRepository interface with custom query methods
> - [ ] Create PlanController.java with @RestController annotation
> - [ ] Implement GET /plans with pagination and filtering support
> - [ ] Implement GET /operators/{id}/plans endpoint
> - [ ] Add @RequestParam for filtering (serviceType, billingPeriod, status, page, size)
> - [ ] Create PlanService layer with business logic
> - [ ] Add filtering logic: findActiveByOperator(), filterByServiceType()
> - [ ] Add response DTO (PlanResponseDTO) for consistent JSON structure
> - [ ] Write integration tests for all endpoints
> - [ ] Test plan isolation (only ACTIVE plans returned)
> - [ ] Add input validation using @Valid and custom validators
> 
> # Reports:
> *
> </details>

## 001-0016
> **Backend: Implement Plan Search & Details Endpoints** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - GET /plans/search?q={query} searches plans by name and description
> - Search returns paginated results with relevance ranking
> - GET /plans/{id} returns full plan details (description, features, pricing, terms)
> - Features returned as JSON array or list
> - Pricing tiers displayed with monthly/yearly options
> - Response structure consistent with project standards
> - Input validation for search query (min/max length, special characters)
> - Integration tests pass for both endpoints
> - Search performance acceptable (database query optimized)
> 
> # TODO:
> - [ ] Implement GET /plans/search endpoint with @GetMapping
> - [ ] Add @RequestParam for query string and pagination (q, page, size)
> - [ ] Create search logic using SQL LIKE or full-text search
> - [ ] Implement relevance ranking for search results
> - [ ] Implement GET /plans/{id} endpoint for plan details
> - [ ] Create PlanDetailResponseDTO with all fields (features, pricing tiers, terms)
> - [ ] Parse features from JSON to list in response
> - [ ] Add pricing tier structure to response (monthly/yearly options)
> - [ ] Validate search query length and content
> - [ ] Write integration tests for search functionality
> - [ ] Test search accuracy and pagination
> - [ ] Optimize database query for search performance
> 
> # Reports:
> *
> </details>

## 001-0017
> **Backend: Add Caching Layer for Operators & Plans** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Operator list cached with 5-15 minute TTL
> - Plan list cached with 5-15 minute TTL
> - Cache invalidates on operator/plan create/update/delete
> - Cache key strategy implemented (operator-list, plans-by-operator-{id}, plan-{id})
> - Cache statistics logged and monitored
> - Integration tests verify cache behavior
> - Performance improvement measured (response time reduction)
> - Cache configuration externalized in application.properties
> 
> # TODO:
> - [ ] Add Spring Cache dependency (spring-boot-starter-cache)
> - [ ] Configure CacheManager (ConcurrentMapCacheManager or Redis)
> - [ ] Set cache TTL in application.properties (5-15 minutes)
> - [ ] Add @Cacheable annotation to OperatorService methods
> - [ ] Add @Cacheable annotation to PlanService methods
> - [ ] Implement cache key generation strategy
> - [ ] Add @CacheEvict on create/update/delete operations
> - [ ] Create cache configuration class with custom cache settings
> - [ ] Add cache statistics logging
> - [ ] Write integration tests for cache behavior
> - [ ] Test cache invalidation on data updates
> - [ ] Measure and document performance improvements
> 
> # Reports:
> *
> </details>

## 001-0018
> **Frontend: Create Operator Listing Section** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Operator listing section created in pages/sections/
> - All active operators displayed in card/grid layout
> - Operator name, description, service types shown
> - Click operator card navigates to plan catalog
> - Loading state displayed during data fetch
> - Error handling with toast notifications
> - Responsive layout (mobile, tablet, desktop)
> - Section registered in config.json with role-based access
> - CSS added to both default/ and dark/ theme directories
> - Manual testing on multiple screen sizes passes
> 
> # TODO:
> - [ ] Create operators.html in pages/sections/
> - [ ] Create operators.js with init() and cleanup() methods
> - [ ] Implement API call using apiClient to GET /operators
> - [ ] Add pagination support (page, size parameters)
> - [ ] Create HTML structure for operator cards (name, description, service_types, status badge)
> - [ ] Implement loading state (skeleton loaders or spinner)
> - [ ] Implement error handling with toast notifications
> - [ ] Add click handler to navigate to plan catalog (hash routing)
> - [ ] Create operators.css in css/default/ directory
> - [ ] Create operators.css in css/dark/ directory
> - [ ] Add responsive grid layout (mobile-first approach)
> - [ ] Register section in config.json with role-based access
> - [ ] Test on mobile, tablet, and desktop screens
> - [ ] Test error scenarios (API failure, empty list)
> 
> # Reports:
> *
> </details>

## 001-0019
> **Frontend: Create Plan Catalog Section** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Plan catalog section created in pages/sections/
> - Plans for selected operator displayed in card/list layout
> - Plan name, description, price, billing period shown
> - Plan features displayed as list or badges
> - Service type badge visible (Internet, Mobile, Bundle)
> - Plan status indicator shown (Active/Inactive)
> - Loading state displayed during data fetch
> - Error handling with toast notifications
> - Click plan card opens detail modal
> - Responsive layout (mobile, tablet, desktop)
> - Section registered in config.json with role-based access
> - CSS added to both default/ and dark/ theme directories
> 
> # TODO:
> - [ ] Create plans.html in pages/sections/
> - [ ] Create plans.js with init() and cleanup() methods
> - [ ] Implement API call using apiClient to GET /operators/{id}/plans
> - [ ] Add pagination support (page, size parameters)
> - [ ] Create HTML structure for plan cards (name, description, price, billing period, features, service type, status)
> - [ ] Implement loading state (skeleton loaders or spinner)
> - [ ] Implement error handling with toast notifications
> - [ ] Add click handler to open plan detail modal
> - [ ] Display plan features as list or badge elements
> - [ ] Add service type badge styling
> - [ ] Create plans.css in css/default/ directory
> - [ ] Create plans.css in css/dark/ directory
> - [ ] Add responsive grid/list layout (mobile-first approach)
> - [ ] Register section in config.json with role-based access
> - [ ] Test on mobile, tablet, and desktop screens
> - [ ] Test error scenarios (API failure, empty list)
> 
> # Reports:
> *
> </details>

## 001-0020
> **Frontend: Implement Plan Filtering & Search** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Filter by service type (Internet, Mobile, Bundle) implemented
> - Search plans by name/description implemented
> - Sort by price (low-to-high, high-to-low) implemented
> - Sort by newest first implemented
> - Filters applied in real-time with loading state
> - Search query validated (min/max length)
> - Filter state persisted in URL hash parameters
> - Results update dynamically without page reload
> - Error handling for failed searches
> - Responsive filter UI (mobile-friendly)
> - CSS added to both default/ and dark/ theme directories
> 
> # TODO:
> - [ ] Create filter UI component (dropdowns, search input, sort buttons)
> - [ ] Implement service_type filter dropdown (Internet, Mobile, Bundle)
> - [ ] Implement search input field with debouncing
> - [ ] Implement sort dropdown (price ASC/DESC, newest first)
> - [ ] Add API call parameters for filtering (serviceType, q, sortBy, page, size)
> - [ ] Implement real-time filtering with loading state
> - [ ] Add filter state to URL hash parameters for bookmarking
> - [ ] Validate search query length (min 2, max 100 characters)
> - [ ] Update plan list on filter/search change
> - [ ] Implement clear filters button
> - [ ] Add error handling for failed searches
> - [ ] Create filter-specific CSS in css/default/ and css/dark/
> - [ ] Test filtering accuracy with multiple filter combinations
> - [ ] Test search with special characters and edge cases
> - [ ] Test on mobile screens (filter UI responsive)
> 
> # Reports:
> *
> </details>

## 001-0021
> **Frontend: Create Plan Detail Modal** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Plan detail modal displays full plan information
> - Plan name, description, all features shown
> - Pricing details (monthly/yearly options) displayed
> - Terms and conditions section included
> - Subscribe Now button present and functional
> - Related plans from same operator shown
> - Modal closes on background click or close button
> - Loading state displayed during data fetch
> - Error handling with toast notifications
> - Responsive design (mobile, tablet, desktop)
> - Accessibility features implemented (focus management, keyboard navigation)
> - CSS added to both default/ and dark/ theme directories
> 
> # TODO:
> - [ ] Create plan-detail-modal.html component
> - [ ] Create plan-detail-modal.js with show(), hide(), init() methods
> - [ ] Implement API call using apiClient to GET /plans/{id}
> - [ ] Display plan full description and all features
> - [ ] Display pricing tiers (monthly/yearly with prices)
> - [ ] Display terms and conditions section
> - [ ] Add Subscribe Now button (link to Phase 4 subscription flow)
> - [ ] Implement related plans section (fetch from same operator)
> - [ ] Add modal open/close functionality
> - [ ] Implement background click to close
> - [ ] Add close button (X icon)
> - [ ] Implement loading state (skeleton loaders)
> - [ ] Implement error handling with toast notifications
> - [ ] Create modal-specific CSS in css/default/ and css/dark/
> - [ ] Add responsive modal sizing for mobile/tablet/desktop
> - [ ] Implement keyboard navigation (Escape to close)
> - [ ] Test modal opening/closing behavior
> - [ ] Test on multiple screen sizes
> 
> # Reports:
> *
> </details>

## 001-0022
> **Frontend: Add Plan Comparison View** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Plan comparison section created in pages/sections/
> - User can select 2-3 plans to compare side-by-side
> - Comparison table displays plan attributes (name, price, features, billing period, service type)
> - Features highlighted with checkmarks/X marks for presence/absence
> - Price comparison clearly visible
> - Remove plan button available for each compared plan
> - Clear comparison button resets view
> - Responsive table layout (mobile-friendly with horizontal scroll)
> - Section registered in config.json with role-based access
> - CSS added to both default/ and dark/ theme directories
> - Manual testing on multiple screen sizes passes
> 
> # TODO:
> - [ ] Create comparison.html in pages/sections/
> - [ ] Create comparison.js with init() and cleanup() methods
> - [ ] Implement plan selection mechanism (checkboxes or add buttons)
> - [ ] Create comparison table structure (plan columns, attribute rows)
> - [ ] Implement API calls to fetch selected plan details
> - [ ] Display plan attributes: name, price (monthly/yearly), features, billing period, service type
> - [ ] Add feature comparison with checkmarks/X marks
> - [ ] Add remove plan button for each column
> - [ ] Add clear all comparison button
> - [ ] Implement loading state during data fetch
> - [ ] Implement error handling with toast notifications
> - [ ] Create comparison.css in css/default/ directory
> - [ ] Create comparison.css in css/dark/ directory
> - [ ] Add responsive table design (horizontal scroll on mobile)
> - [ ] Register section in config.json with role-based access
> - [ ] Test comparison with 2 and 3 plans
> - [ ] Test on mobile, tablet, and desktop screens
> - [ ] Test add/remove plan functionality
> 
> # Reports:
> *
> </details>

## 001-0023
> **Testing: Phase 2 Backend Integration Tests** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Integration tests for all operator endpoints pass
> - Integration tests for all plan endpoints pass
> - Test coverage minimum 80% for Phase 2 code
> - Operator isolation tests verify only ACTIVE operators returned
> - Plan isolation tests verify only ACTIVE plans returned
> - Pagination tests verify correct page/size handling
> - Filtering tests verify service_type, status, billing_period filters work correctly
> - Search tests verify name/description search accuracy
> - Cache invalidation tests verify cache updates on data changes
> - Error handling tests verify proper HTTP status codes and error messages
> - All tests run successfully in CI/CD pipeline
> 
> # TODO:
> - [ ] Create OperatorControllerIntegrationTest class
> - [ ] Test GET /operators returns paginated list of ACTIVE operators
> - [ ] Test GET /operators with pagination parameters (page, size)
> - [ ] Test GET /operators with serviceType filter
> - [ ] Test GET /operators with status filter
> - [ ] Test GET /operators/{id} returns operator details with plan count
> - [ ] Test GET /operators/{id} with invalid ID returns 404
> - [ ] Test operator isolation (INACTIVE operators not returned)
> - [ ] Create PlanControllerIntegrationTest class
> - [ ] Test GET /plans returns paginated list of ACTIVE plans
> - [ ] Test GET /operators/{id}/plans returns only plans for that operator
> - [ ] Test GET /plans with serviceType filter
> - [ ] Test GET /plans with billingPeriod filter
> - [ ] Test GET /plans with status filter
> - [ ] Test GET /plans/search?q={query} returns correct results
> - [ ] Test search with special characters and edge cases
> - [ ] Test GET /plans/{id} returns full plan details
> - [ ] Test GET /plans/{id} with invalid ID returns 404
> - [ ] Test plan isolation (INACTIVE plans not returned)
> - [ ] Test cache behavior (data cached and invalidated correctly)
> - [ ] Test error handling (invalid parameters, missing fields)
> - [ ] Run all tests and verify 80%+ code coverage
> 
> # Reports:
> *
> </details>

## 001-0024
> **Testing: Phase 2 Frontend Unit Tests** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
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
> - [ ] Create test suite for operators.js
> - [ ] Test init() method loads operators correctly
> - [ ] Test API call to GET /operators with pagination
> - [ ] Test operator card rendering with mock data
> - [ ] Test loading state display
> - [ ] Test error handling and toast notifications
> - [ ] Test navigation to plan catalog on operator click
> - [ ] Test cleanup() method removes event listeners
> - [ ] Create test suite for plans.js
> - [ ] Test init() method loads plans for operator
> - [ ] Test API call to GET /operators/{id}/plans
> - [ ] Test plan card rendering with mock data
> - [ ] Test plan detail modal opens on click
> - [ ] Test loading state and error handling
> - [ ] Create test suite for filtering/search functionality
> - [ ] Test service_type filter changes results
> - [ ] Test search query with debouncing
> - [ ] Test sort functionality (price, newest)
> - [ ] Test filter state in URL hash parameters
> - [ ] Create test suite for plan-detail-modal.js
> - [ ] Test modal opens/closes correctly
> - [ ] Test API call to GET /plans/{id}
> - [ ] Test plan details render correctly
> - [ ] Test Subscribe Now button functionality
> - [ ] Test related plans display
> - [ ] Create test suite for comparison.js
> - [ ] Test plan selection and comparison table rendering
> - [ ] Test add/remove plan functionality
> - [ ] Test responsive table layout on mobile
> - [ ] Test all responsive layouts (mobile, tablet, desktop)
> - [ ] Run all tests and verify 70%+ code coverage
> 
> # Reports:
> *
> </details>

## 001-0025
> **Backend: Create Dashboard Statistics Endpoints** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - GET /dashboard/user-stats returns user statistics (total, active, new this month)
> - GET /dashboard/subscription-stats returns subscription statistics (active, pending, canceled)
> - GET /dashboard/revenue returns revenue data (total, by operator, monthly trends)
> - GET /dashboard/operator-performance returns operator metrics (popular plans, subscription rate)
> - All endpoints support date range filtering (last 7/30/90 days, custom)
> - Response structure consistent with project standards
> - Admin-only endpoints properly secured with RBAC
> - Input validation for date range parameters
> - Integration tests pass for all endpoints
> - Performance acceptable for large datasets
> 
> # TODO:
> - [ ] Create DashboardController.java with @RestController annotation
> - [ ] Implement GET /dashboard/user-stats endpoint
> - [ ] Add user count aggregations (total, active, new this month)
> - [ ] Implement GET /dashboard/subscription-stats endpoint
> - [ ] Add subscription count aggregations (active, pending, canceled)
> - [ ] Implement GET /dashboard/revenue endpoint
> - [ ] Add revenue calculations (total, by operator, monthly trends)
> - [ ] Implement GET /dashboard/operator-performance endpoint
> - [ ] Add operator metrics (popular plans, subscription rate)
> - [ ] Create DashboardService layer with business logic
> - [ ] Add date range filtering logic (last 7/30/90 days, custom)
> - [ ] Add @RequestParam for dateRange and customStartDate/endDate
> - [ ] Create response DTOs (UserStatsDTO, SubscriptionStatsDTO, RevenueDTO, OperatorPerformanceDTO)
> - [ ] Add @PreAuthorize for admin-only access
> - [ ] Optimize database queries using aggregations (GROUP BY, COUNT, SUM)
> - [ ] Write integration tests for all endpoints
> - [ ] Test date range filtering accuracy
> - [ ] Test admin-only access control
> 
> # Reports:
> *
> </details>

## 001-0026
> **Backend: Implement Activity Timeline Endpoint** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - GET /dashboard/activity-timeline returns paginated activity log
> - Activity includes subscriptions, plan changes, cancellations, user actions
> - Timeline sorted by timestamp (newest first)
> - Pagination working (page, size parameters)
> - Filtering by activity type (subscription, plan_change, cancellation, etc.)
> - Filtering by date range supported
> - Response includes user, action, timestamp, details
> - Admin can see all activities, customers see only their own
> - Input validation for query parameters
> - Integration tests pass
> - Performance acceptable for large activity datasets
> 
> # TODO:
> - [ ] Create Activity entity with user_id, action_type, resource_type, resource_id, timestamp, details
> - [ ] Create ActivityRepository with custom query methods
> - [ ] Create ActivityController.java with @RestController annotation
> - [ ] Implement GET /dashboard/activity-timeline endpoint
> - [ ] Add pagination support (page, size parameters)
> - [ ] Add @RequestParam for filtering (activityType, dateRange, startDate, endDate)
> - [ ] Create ActivityService layer with business logic
> - [ ] Implement role-based filtering (admin sees all, customers see own activities)
> - [ ] Add sorting by timestamp (newest first)
> - [ ] Create ActivityResponseDTO with user, action, timestamp, details
> - [ ] Add input validation for query parameters
> - [ ] Write integration tests for endpoint
> - [ ] Test pagination and filtering accuracy
> - [ ] Test role-based access control (admin vs customer)
> - [ ] Test activity retrieval with various filters
> - [ ] Optimize database queries for performance
> 
> # Reports:
> *
> </details>

## 001-0027
> **Backend: Add Metrics Caching & Aggregation** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Dashboard statistics cached with 5-15 minute TTL
> - Activity timeline cached appropriately (shorter TTL for recent data)
> - Cache invalidates on relevant data changes (new subscriptions, cancellations, etc.)
> - Cache key strategy implemented (dashboard-stats, dashboard-revenue, activity-timeline)
> - Database queries optimized using aggregations (GROUP BY, COUNT, SUM, AVG)
> - Cache statistics logged and monitored
> - Integration tests verify cache behavior
> - Performance improvement measured (response time reduction)
> - Cache configuration externalized in application.properties
> 
> # TODO:
> - [ ] Configure CacheManager for dashboard metrics
> - [ ] Set cache TTL in application.properties (5-15 minutes for stats, shorter for timeline)
> - [ ] Add @Cacheable annotation to DashboardService methods
> - [ ] Add @Cacheable annotation to ActivityService methods
> - [ ] Implement cache key generation strategy for metrics
> - [ ] Add @CacheEvict on subscription create/update/delete operations
> - [ ] Add @CacheEvict on plan change and cancellation operations
> - [ ] Optimize database queries using native SQL aggregations
> - [ ] Use GROUP BY for operator performance metrics
> - [ ] Use COUNT, SUM, AVG for revenue and user statistics
> - [ ] Create cache configuration class with custom settings
> - [ ] Add cache statistics logging and monitoring
> - [ ] Write integration tests for cache behavior
> - [ ] Test cache invalidation on data updates
> - [ ] Test query performance with large datasets
> - [ ] Measure and document performance improvements
> 
> # Reports:
> *
> </details>

## 001-0028
> **Frontend: Create Analytics Section** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Analytics section created in pages/sections/
> - Dashboard widgets display statistics (user count, subscription count, revenue)
> - Charts display trends (revenue trend line chart, subscription breakdown pie chart)
> - Date range filtering works (last 7/30/90 days, custom date picker)
> - Admin sees system-wide analytics, customers see personal analytics
> - Loading states displayed during data fetch
> - Error handling with toast notifications
> - Responsive design (mobile, tablet, desktop)
> - Section registered in config.json with role-based access
> - CSS added to both default/ and dark/ theme directories
> - Manual testing on multiple screen sizes passes
> 
> # TODO:
> - [ ] Create analytics.html in pages/sections/
> - [ ] Create analytics.js with init() and cleanup() methods
> - [ ] Implement API calls using apiClient to GET /dashboard/user-stats, /subscription-stats, /revenue
> - [ ] Add date range filter UI (dropdown for 7/30/90 days, custom date picker)
> - [ ] Create widget components for statistics display (user count, subscription count, revenue)
> - [ ] Implement line chart for revenue trends (using Chart.js or similar)
> - [ ] Implement pie chart for subscription breakdown
> - [ ] Implement bar chart for operator comparison (admin only)
> - [ ] Add loading state (skeleton loaders for widgets and charts)
> - [ ] Implement error handling with toast notifications
> - [ ] Add role-based filtering (admin sees all, customers see personal data)
> - [ ] Create analytics.css in css/default/ directory
> - [ ] Create analytics.css in css/dark/ directory
> - [ ] Add responsive widget grid layout (mobile-first)
> - [ ] Add responsive chart sizing for mobile/tablet/desktop
> - [ ] Register section in config.json with role-based access (admin only or all users)
> - [ ] Test date range filtering accuracy
> - [ ] Test on mobile, tablet, and desktop screens
> - [ ] Test error scenarios (API failure, no data)
> 
> # Reports:
> *
> </details>

## 001-0029
> **Frontend: Create Activity Timeline Section** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Activity timeline section created in pages/sections/
> - Activity feed displays user/system actions with timestamps
> - Timeline items show action type, resource, user, timestamp, details
> - Pagination working (load more or infinite scroll)
> - Filtering by activity type implemented (subscription, plan_change, cancellation, etc.)
> - Date range filtering works (last 7/30/90 days, custom)
> - Admin sees all activities, customers see only their own
> - Loading state displayed during data fetch
> - Error handling with toast notifications
> - Responsive design (mobile, tablet, desktop)
> - Section registered in config.json with role-based access
> - CSS added to both default/ and dark/ theme directories
> 
> # TODO:
> - [ ] Create activity-timeline.html in pages/sections/
> - [ ] Create activity-timeline.js with init() and cleanup() methods
> - [ ] Implement API call using apiClient to GET /dashboard/activity-timeline
> - [ ] Add pagination support (page, size parameters or infinite scroll)
> - [ ] Add date range filter UI (dropdown for 7/30/90 days, custom date picker)
> - [ ] Add activity type filter dropdown (subscription, plan_change, cancellation, etc.)
> - [ ] Create timeline item component (action type badge, user, timestamp, description)
> - [ ] Display activity details (from, to, timestamp, user information)
> - [ ] Implement loading state (skeleton loaders for timeline items)
> - [ ] Implement error handling with toast notifications
> - [ ] Add role-based filtering (admin sees all, customers see own activities)
> - [ ] Create activity-timeline.css in css/default/ directory
> - [ ] Create activity-timeline.css in css/dark/ directory
> - [ ] Add responsive timeline layout (mobile-friendly)
> - [ ] Add load more button or infinite scroll pagination
> - [ ] Register section in config.json with role-based access
> - [ ] Test pagination and filtering accuracy
> - [ ] Test on mobile, tablet, and desktop screens
> - [ ] Test error scenarios (API failure, no activities)
> 
> # Reports:
> *
> </details>

## 001-0030
> **Frontend: Build Dashboard Widgets & Charts** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Reusable widget component created for statistics display
> - Line chart component displays revenue trends
> - Pie chart component displays subscription breakdown
> - Bar chart component displays operator comparison
> - All charts responsive on mobile/tablet/desktop
> - Chart data updates when filters change
> - Loading states shown while fetching chart data
> - Error states handled gracefully
> - Chart legends and labels clear and readable
> - CSS added to both default/ and dark/ theme directories
> - Manual testing on multiple screen sizes passes
> 
> # TODO:
> - [ ] Create widget.js component with title, value, trend indicator
> - [ ] Create widget.html template for statistics display
> - [ ] Implement widget styling in css/default/ and css/dark/
> - [ ] Create chart-base.js component with common chart functionality
> - [ ] Create line-chart.js component for revenue trends
> - [ ] Create pie-chart.js component for subscription breakdown
> - [ ] Create bar-chart.js component for operator comparison
> - [ ] Choose chart library (Chart.js, D3.js, or similar)
> - [ ] Implement chart initialization and data binding
> - [ ] Add responsive chart sizing (use container width/height)
> - [ ] Implement chart update on data change
> - [ ] Add loading state (spinner or skeleton loader)
> - [ ] Add error state (error message display)
> - [ ] Add chart legends with clear labels
> - [ ] Add chart tooltips with detailed information
> - [ ] Implement color scheme for default and dark themes
> - [ ] Test chart rendering with various data sizes
> - [ ] Test chart responsiveness on mobile/tablet/desktop
> - [ ] Test chart updates on filter changes
> - [ ] Test error handling (missing data, API failure)
> 
> # Reports:
> *
> </details>

## 001-0031
> **Testing: Phase 3 Integration Tests** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Integration tests for all dashboard statistics endpoints pass
> - Integration tests for activity timeline endpoint pass
> - Test coverage minimum 80% for Phase 3 backend code
> - User statistics aggregation tests verify correct counts
> - Subscription statistics aggregation tests verify correct counts
> - Revenue calculation tests verify correct totals and trends
> - Operator performance metrics tests verify accuracy
> - Activity timeline filtering tests verify correct results
> - Date range filtering tests verify accurate date handling
> - Role-based access control tests verify admin-only endpoints
> - Cache behavior tests verify metrics cached and invalidated correctly
> - All tests run successfully in CI/CD pipeline
> 
> # TODO:
> - [ ] Create DashboardControllerIntegrationTest class
> - [ ] Test GET /dashboard/user-stats returns correct user counts
> - [ ] Test user-stats with date range filtering (last 7/30/90 days)
> - [ ] Test GET /dashboard/subscription-stats returns correct subscription counts
> - [ ] Test subscription-stats with status filtering (active, pending, canceled)
> - [ ] Test GET /dashboard/revenue returns correct revenue totals
> - [ ] Test revenue with operator filtering
> - [ ] Test revenue with date range filtering
> - [ ] Test GET /dashboard/operator-performance returns operator metrics
> - [ ] Test operator-performance with popularity ranking
> - [ ] Create ActivityControllerIntegrationTest class
> - [ ] Test GET /dashboard/activity-timeline returns paginated activities
> - [ ] Test activity-timeline pagination (page, size)
> - [ ] Test activity-timeline filtering by activity type
> - [ ] Test activity-timeline filtering by date range
> - [ ] Test role-based access (admin sees all, customer sees own)
> - [ ] Test cache behavior (metrics cached and invalidated on updates)
> - [ ] Test error handling (invalid date ranges, missing parameters)
> - [ ] Test performance with large datasets
> - [ ] Run all tests and verify 80%+ code coverage
> 
> # Reports:
> *
> </details>

## 001-0032
> **Backend: Create Subscription Entity & Schema** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Subscription JPA entity created with all required fields
> - Database migration script created and tested
> - Subscription repository interface implemented with custom query methods
> - Entity validation annotations added (NotBlank, NotNull, etc.)
> - Subscription status enum implemented (ACTIVE, PENDING, CANCELED, SUSPENDED)
> - Soft delete mechanism implemented (status field)
> - Timestamps for creation, activation, cancellation tracked
> - Database schema verified in test environment
> - Unit tests for entity validation pass
> 
> # TODO:
> - [ ] Create Subscription.java entity class with JPA annotations
> - [ ] Add fields: id (UUID), user_id (FK), plan_id (FK), operator_id (FK), status (ENUM), start_date, end_date, next_renewal_date, created_at, updated_at, canceled_at
> - [ ] Create SubscriptionStatus enum (ACTIVE, PENDING, CANCELED, SUSPENDED)
> - [ ] Add relationships: @ManyToOne to User, Plan, Operator
> - [ ] Create SubscriptionRepository interface extending JpaRepository
> - [ ] Add custom query methods: findByUserId(), findByUserIdAndStatus(), findActiveByUserId(), findByPlanId()
> - [ ] Create database migration (Flyway/Liquibase) for subscriptions table
> - [ ] Add validation constraints to entity fields
> - [ ] Add timestamps: created_at (auto-set on creation), updated_at (auto-set on update), canceled_at (set on cancellation)
> - [ ] Implement soft delete logic (use status instead of hard delete)
> - [ ] Write unit tests for entity and repository
> - [ ] Test subscription creation and status transitions
> - [ ] Test soft delete functionality (status = CANCELED)
> - [ ] Test queries for finding subscriptions by user and status
> 
> # Reports:
> *
> </details>

## 001-0033
> **Backend: Implement Subscription CRUD Endpoints** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - POST /subscriptions creates new subscription for customer
> - GET /subscriptions returns paginated list of user's subscriptions
> - GET /subscriptions/{id} returns subscription details
> - GET /subscriptions?status=ACTIVE filters subscriptions by status
> - Response structure consistent with project standards
> - Input validation for all request parameters
> - User isolation enforced (customers only see own subscriptions)
> - Subscription creation triggers activity logging
> - Integration tests pass for all endpoints
> - Business rule validation (plan availability, duplicate subscriptions)
> 
> # TODO:
> - [ ] Create SubscriptionController.java with @RestController annotation
> - [ ] Implement POST /subscriptions endpoint with @PostMapping
> - [ ] Add @RequestBody with CreateSubscriptionRequest DTO (user_id, plan_id)
> - [ ] Create SubscriptionService layer with business logic
> - [ ] Implement subscription creation logic (validate plan, check duplicates, set dates)
> - [ ] Implement GET /subscriptions with pagination support
> - [ ] Add @RequestParam for filtering (status, page, size)
> - [ ] Implement user isolation (customers only see own subscriptions)
> - [ ] Implement GET /subscriptions/{id} endpoint
> - [ ] Add user ownership validation (customer can only access own subscription)
> - [ ] Create SubscriptionResponseDTO with all subscription details
> - [ ] Add subscription creation validation (plan exists, is ACTIVE, user doesn't already have it)
> - [ ] Implement activity logging on subscription creation
> - [ ] Add input validation using @Valid and custom validators
> - [ ] Write integration tests for all endpoints
> - [ ] Test subscription creation with valid/invalid data
> - [ ] Test user isolation (customer cannot access other user's subscriptions)
> - [ ] Test filtering by status
> - [ ] Test pagination
> 
> # Reports:
> *
> </details>

## 001-0034
> **Backend: Implement Plan Change Logic** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - PUT /subscriptions/{id}/change-plan allows plan changes
> - Plan change validates new plan availability and eligibility
> - Proration logic calculates refund/charge for mid-cycle changes
> - Plan change creates audit trail entry
> - Plan change triggers activity logging
> - User isolation enforced (customer can only change own subscription)
> - Input validation for new plan parameter
> - Integration tests pass for plan change logic
> - Business rules validated (same operator, valid plan, no duplicates)
> 
> # TODO:
> - [ ] Create ChangePlanRequest DTO with new_plan_id field
> - [ ] Implement PUT /subscriptions/{id}/change-plan endpoint
> - [ ] Add user ownership validation
> - [ ] Create plan change business logic in SubscriptionService
> - [ ] Validate new plan exists and is ACTIVE
> - [ ] Validate new plan belongs to same operator (or allow cross-operator)
> - [ ] Check for duplicate subscription (user doesn't already have new plan)
> - [ ] Implement proration calculation (refund/charge for mid-cycle change)
> - [ ] Calculate prorated amount based on days remaining and new plan price
> - [ ] Update subscription: plan_id, updated_at, next_renewal_date
> - [ ] Create audit trail entry for plan change
> - [ ] Implement activity logging for plan change
> - [ ] Add validation constraints to request DTO
> - [ ] Write integration tests for plan change logic
> - [ ] Test successful plan change with proration calculation
> - [ ] Test plan change validation (invalid plan, duplicate, different operator)
> - [ ] Test user isolation (customer cannot change other user's subscription)
> - [ ] Test proration calculation accuracy (upgrade, downgrade, same price)
> 
> # Reports:
> *
> </details>

## 001-0035
> **Backend: Implement Subscription Cancellation** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> 
> # TODO:
> - [ ] Create subscription cancellation endpoint (DELETE /subscriptions/{id})
> - [ ] Implement immediate cancellation logic
> - [ ] Implement end-of-period cancellation option
> - [ ] Update subscription status to CANCELED
> - [ ] Record cancellation timestamp and reason
> - [ ] Validate user owns subscription before cancellation
> - [ ] Prevent cancellation of already canceled subscriptions
> - [ ] Add audit log entry for cancellation
> - [ ] Return success response with cancellation details
> - [ ] Handle edge cases (pending subscriptions, suspended subscriptions)
> - [ ] Write unit tests for cancellation logic
> - [ ] Write integration tests for cancellation endpoint
> - [ ] Test with Postman (immediate and end-of-period scenarios)
> 
> # Reports:
> *
> </details>

## 001-0036
> **Frontend: Create Subscription Dashboard Section** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> 
> # TODO:
> - [ ] Create section file: pages/sections/subscriptions.js
> - [ ] Create section HTML template: pages/sections/subscriptions.html
> - [ ] Create section styles: css/default/subscriptions.css and css/dark/subscriptions.css
> - [ ] Register section in config.json with customer role access
> - [ ] Implement init() method to fetch user subscriptions
> - [ ] Display active subscriptions in card/list layout
> - [ ] Show subscription details (plan name, operator, price, status, renewal date)
> - [ ] Add "Manage" button for each subscription (links to plan change)
> - [ ] Add "Cancel" button for each subscription (opens confirmation dialog)
> - [ ] Implement loading state while fetching subscriptions
> - [ ] Handle empty state (no active subscriptions)
> - [ ] Handle error state with retry option
> - [ ] Add responsive layout for mobile/tablet
> - [ ] Test with different screen sizes
> - [ ] Add to styles.json for both themes
> 
> # Reports:
> *
> </details>

## 001-0037
> **Frontend: Create Subscription Dashboard Section** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Subscription dashboard section created and registered in config.json
> - Active subscriptions list displays with operator name, plan name, price, renewal date
> - Subscription cards show status indicator (active/pending/canceled)
> - Loading states implemented during data fetch
> - Error handling with toast notifications for failed API calls
> - Empty state displayed when no subscriptions exist
> - Responsive layout works on mobile, tablet, desktop
> - Quick action buttons (Change Plan, Cancel, View Details) implemented
> - Section follows modular pattern (init() and cleanup() methods)
> - CSS created in both default/ and dark/ theme directories
> - Manual testing completed on multiple screen sizes
> 
> # TODO:
> - [ ] Create `pages/sections/subscriptions.html` with section structure
> - [ ] Create `pages/sections/subscriptions.js` with SubscriptionSection class
> - [ ] Implement init() method to fetch active subscriptions via apiClient
> - [ ] Design subscription card component (operator, plan, price, renewal date, status badge)
> - [ ] Add loading skeleton loader while fetching subscriptions
> - [ ] Implement empty state message ("No active subscriptions")
> - [ ] Add error handling with toast notifications for API failures
> - [ ] Create "Change Plan" button linking to plan change modal (Phase 4 card 26)
> - [ ] Create "Cancel Subscription" button with confirmation dialog
> - [ ] Create "View Details" button showing full subscription info
> - [ ] Implement responsive grid layout (1 column mobile, 2-3 columns desktop)
> - [ ] Add status badge styling (ACTIVE=green, PENDING=yellow, CANCELED=red, SUSPENDED=orange)
> - [ ] Create `css/default/subscriptions.css` with card styles, buttons, badges
> - [ ] Create `css/dark/subscriptions.css` with dark theme variants
> - [ ] Add styles to `config/styles.json` for both theme directories
> - [ ] Add section to `config.json` with role: ["CUSTOMER"] (customer-only access)
> - [ ] Test API calls with apiClient (no /api prefix)
> - [ ] Test 401 error handling (token refresh auto-retry)
> - [ ] Test loading states and error messages
> - [ ] Test responsive layout on mobile (375px), tablet (768px), desktop (1920px)
> - [ ] Test both default and dark themes
> - [ ] Verify section loads only for CUSTOMER role
> - [ ] Manual testing with sample subscription data
> 
> # Reports:
> *
> </details>

## 001-0038
> **Frontend: Create Subscribe Flow** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Subscribe flow modal created and integrated with plan detail modal
> - Plan selection confirmation with pricing preview
> - Customer information pre-filled from user profile
> - Terms and conditions checkbox required before subscription
> - Loading state during subscription creation
> - Success message with subscription confirmation details
> - Error handling with specific error messages
> - Cancel button to exit flow without subscribing
> - Responsive modal layout on all screen sizes
> - Integration with apiClient for subscription creation endpoint
> - Manual testing completed with success and error scenarios
> 
> # TODO:
> - [ ] Create `pages/sections/subscribe-modal.html` with modal structure
> - [ ] Create `pages/sections/subscribe-modal.js` with SubscribeFlow class
> - [ ] Design modal with plan summary section (name, description, price, billing period)
> - [ ] Add customer information display (pre-filled from profile)
> - [ ] Implement terms and conditions checkbox with link to full terms
> - [ ] Add pricing breakdown (base price, taxes if applicable, total)
> - [ ] Create "Confirm Subscribe" button (disabled until T&C checked)
> - [ ] Create "Cancel" button to close modal without action
> - [ ] Implement init() method to populate plan details from selected plan
> - [ ] Add loading spinner during subscription creation API call
> - [ ] Implement success state with confirmation message and subscription ID
> - [ ] Add error handling with toast notifications for API failures
> - [ ] Show specific error messages (plan unavailable, user already subscribed, etc.)
> - [ ] Implement cleanup() method to reset modal state
> - [ ] Create form validation (ensure all required fields present)
> - [ ] Add confirmation dialog before final subscription (optional but recommended)
> - [ ] Create `css/default/subscribe-modal.css` with modal styles
> - [ ] Create `css/dark/subscribe-modal.css` with dark theme variants
> - [ ] Add styles to `config/styles.json`
> - [ ] Test modal opens from plan detail card
> - [ ] Test plan information displays correctly
> - [ ] Test T&C checkbox validation
> - [ ] Test API call via apiClient with correct endpoint
> - [ ] Test success flow with confirmation message
> - [ ] Test error scenarios (network error, plan unavailable, duplicate subscription)
> - [ ] Test modal closes on success
> - [ ] Test responsive layout on mobile, tablet, desktop
> - [ ] Test both default and dark themes
> - [ ] Manual testing with different plan types (Internet, Mobile, Bundle)
> 
> # Reports:
> *
> </details>

## 001-0039
> **Frontend: Create Plan Change Modal** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Plan change modal created and accessible from subscription dashboard
> - Current plan details displayed with pricing and features
> - Available plans from same operator listed with comparison
> - Price difference calculation (upgrade/downgrade cost)
> - Proration details shown if applicable
> - Effective date selection (immediate or end-of-billing-period)
> - Confirmation with new plan summary
> - Loading state during plan change API call
> - Success message with change confirmation
> - Error handling with specific error messages
> - Cancel button to exit without making changes
> - Responsive modal layout on all screen sizes
> - Manual testing completed with upgrade and downgrade scenarios
> 
> # TODO:
> - [ ] Create `pages/sections/plan-change-modal.html` with modal structure
> - [ ] Create `pages/sections/plan-change-modal.js` with PlanChangeFlow class
> - [ ] Design current plan section (name, price, features, renewal date)
> - [ ] Design available plans list (filter by same operator)
> - [ ] Add plan comparison cards (current vs new plan side-by-side)
> - [ ] Implement price difference calculation (upgrade/downgrade amount)
> - [ ] Add proration details section (if applicable)
> - [ ] Create effective date selector (immediate or end-of-period options)
> - [ ] Implement init() method to fetch current subscription and available plans
> - [ ] Add loading spinner while fetching plan options
> - [ ] Show "No other plans available" message if only one plan exists
> - [ ] Implement plan selection with visual highlight
> - [ ] Create pricing preview section (current price, new price, difference, total)
> - [ ] Add terms for plan change (cancellation policy, effective date)
> - [ ] Create "Confirm Plan Change" button (enabled only when new plan selected)
> - [ ] Create "Cancel" button to close modal without action
> - [ ] Implement loading spinner during plan change API call
> - [ ] Add success state with confirmation message and effective date
> - [ ] Implement error handling with toast notifications
> - [ ] Show specific error messages (plan unavailable, no changes made, etc.)
> - [ ] Implement cleanup() method to reset modal state
> - [ ] Create form validation (ensure valid plan selected)
> - [ ] Create `css/default/plan-change-modal.css` with modal and comparison styles
> - [ ] Create `css/dark/plan-change-modal.css` with dark theme variants
> - [ ] Add styles to `config/styles.json`
> - [ ] Test modal opens from subscription card
> - [ ] Test current plan displays correctly
> - [ ] Test available plans load and filter by operator
> - [ ] Test price difference calculation (upgrade and downgrade)
> - [ ] Test proration display when applicable
> - [ ] Test effective date selector options
> - [ ] Test API call via apiClient with correct endpoint
> - [ ] Test success flow with confirmation message
> - [ ] Test error scenarios (network error, plan unavailable, invalid selection)
> - [ ] Test modal closes on success
> - [ ] Test responsive layout on mobile, tablet, desktop
> - [ ] Test both default and dark themes
> - [ ] Manual testing with different plan combinations (upgrade, downgrade, same tier)
> 
> # Reports:
> *
> </details>

## 001-0040
> **Frontend: Create Subscription History View** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Subscription history section created and registered in config.json
> - Timeline view displays all subscription events (created, changed, canceled)
> - Each event shows date, time, action type, plan details, and status
> - Filtering by event type (subscription, plan change, cancellation)
> - Filtering by date range (last 7 days, 30 days, 90 days, custom)
> - Pagination implemented for large history lists
> - Loading states during data fetch
> - Error handling with toast notifications
> - Empty state displayed when no history exists
> - Responsive layout works on mobile, tablet, desktop
> - Section follows modular pattern (init() and cleanup() methods)
> - CSS created in both default/ and dark/ theme directories
> - Manual testing completed with various filters and date ranges
> 
> # TODO:
> - [ ] Create `pages/sections/subscription-history.html` with section structure
> - [ ] Create `pages/sections/subscription-history.js` with SubscriptionHistorySection class
> - [ ] Implement init() method to fetch subscription history via apiClient
> - [ ] Design timeline layout (vertical timeline with events)
> - [ ] Create event card component (date, time, action, plan name, status)
> - [ ] Add event type badges (SUBSCRIPTION_CREATED, PLAN_CHANGED, CANCELED, RENEWED)
> - [ ] Implement event type filtering (dropdown or button group)
> - [ ] Create date range filter (last 7/30/90 days, custom date picker)
> - [ ] Add loading skeleton loader while fetching history
> - [ ] Implement empty state message ("No subscription history")
> - [ ] Add pagination controls (prev/next buttons or load more)
> - [ ] Show event details on click (full plan info, pricing, reason for change)
> - [ ] Add error handling with toast notifications for API failures
> - [ ] Implement sorting (newest first, oldest first)
> - [ ] Add export functionality (optional: download as CSV)
> - [ ] Create responsive timeline layout (vertical on mobile, horizontal on desktop)
> - [ ] Add color coding for event types (green=created, blue=changed, red=canceled, orange=renewed)
> - [ ] Create `css/default/subscription-history.css` with timeline and filter styles
> - [ ] Create `css/dark/subscription-history.css` with dark theme variants
> - [ ] Add styles to `config/styles.json` for both theme directories
> - [ ] Add section to `config.json` with role: ["CUSTOMER"] (customer-only access)
> - [ ] Test API calls with apiClient (no /api prefix)
> - [ ] Test 401 error handling (token refresh auto-retry)
> - [ ] Test event type filtering works correctly
> - [ ] Test date range filtering (predefined and custom ranges)
> - [ ] Test pagination (load more events, navigate pages)
> - [ ] Test loading states and error messages
> - [ ] Test empty state when no history exists
> - [ ] Test responsive layout on mobile (375px), tablet (768px), desktop (1920px)
> - [ ] Test both default and dark themes
> - [ ] Test sorting (newest/oldest first)
> - [ ] Test event detail modal opens on click
> - [ ] Verify section loads only for CUSTOMER role
> - [ ] Manual testing with multiple subscription events
> 
> # Reports:
> *
> </details>

## 001-0041
> **Testing: Phase 4 Integration Tests** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - All Phase 4 backend endpoints tested with integration tests
> - Subscription creation flow tested end-to-end
> - Plan change logic validated with proration calculations
> - Subscription cancellation tested (immediate and end-of-period)
> - Subscription status transitions validated
> - Error scenarios tested (invalid plan, duplicate subscription, etc.)
> - Frontend sections tested with mocked API responses
> - User flows tested (subscribe, change plan, cancel, view history)
> - Loading states and error handling verified
> - Responsive layout tested on multiple screen sizes
> - Test coverage report generated (target: 80%+ for Phase 4 code)
> - All tests passing before Phase 4 completion
> 
> # TODO:
> - [ ] Create integration test class for SubscriptionController
> - [ ] Test POST /subscriptions (create subscription) with valid data
> - [ ] Test POST /subscriptions with invalid plan ID (should fail)
> - [ ] Test POST /subscriptions with duplicate subscription (should fail)
> - [ ] Test GET /subscriptions (list user subscriptions) with pagination
> - [ ] Test GET /subscriptions/{id} (get subscription details)
> - [ ] Test PUT /subscriptions/{id} (change plan) with upgrade scenario
> - [ ] Test PUT /subscriptions/{id} (change plan) with downgrade scenario
> - [ ] Test PUT /subscriptions/{id} (change plan) with proration calculation
> - [ ] Test DELETE /subscriptions/{id} (cancel subscription) immediate
> - [ ] Test DELETE /subscriptions/{id} (cancel subscription) end-of-period
> - [ ] Test subscription status transitions (ACTIVE -> PENDING -> ACTIVE)
> - [ ] Test subscription status transitions (ACTIVE -> CANCELED)
> - [ ] Test soft delete functionality (status = CANCELED, not hard delete)
> - [ ] Test GET /subscriptions/history (subscription history with filters)
> - [ ] Test history filtering by event type (CREATED, CHANGED, CANCELED)
> - [ ] Test history filtering by date range
> - [ ] Test history pagination
> - [ ] Test authorization (customer can only access own subscriptions)
> - [ ] Test authorization (admin can access all subscriptions)
> - [ ] Test error responses (400, 401, 403, 404, 500)
> - [ ] Test concurrent subscription operations (race conditions)
> - [ ] Test database transactions (rollback on error)
> - [ ] Test timestamp accuracy (created_at, updated_at, canceled_at)
> - [ ] Test renewal date calculation
> - [ ] Test next_renewal_date updates on plan change
> - [ ] Create frontend unit tests for SubscriptionSection
> - [ ] Test subscription list loads and displays correctly
> - [ ] Test subscription cards render with correct data
> - [ ] Test status badges display correct colors
> - [ ] Test loading state during data fetch
> - [ ] Test error handling with toast notifications
> - [ ] Test empty state message displays
> - [ ] Test responsive layout on mobile, tablet, desktop
> - [ ] Create frontend unit tests for SubscribeFlow
> - [ ] Test modal opens with plan details
> - [ ] Test T&C checkbox validation
> - [ ] Test subscription creation via apiClient
> - [ ] Test success message displays
> - [ ] Test error handling for API failures
> - [ ] Test modal closes on success
> - [ ] Create frontend unit tests for PlanChangeFlow
> - [ ] Test modal opens with current and available plans
> - [ ] Test price difference calculation
> - [ ] Test effective date selector
> - [ ] Test plan change via apiClient
> - [ ] Test success message displays
> - [ ] Test error handling for API failures
> - [ ] Create frontend unit tests for SubscriptionHistorySection
> - [ ] Test history timeline loads and displays
> - [ ] Test event type filtering
> - [ ] Test date range filtering
> - [ ] Test pagination
> - [ ] Test responsive timeline layout
> - [ ] Test both default and dark themes for all sections
> - [ ] Run full test suite and generate coverage report
> - [ ] Verify 80%+ code coverage for Phase 4
> - [ ] Document any failing tests and create follow-up issues
> - [ ] Performance test subscription list with 100+ subscriptions
> - [ ] Load test plan change endpoint with concurrent requests
> - [ ] Manual end-to-end testing (subscribe, change plan, cancel, view history)
> 
> # Reports:
> *
> </details>

## 001-0042
> **Backend: Implement Billing History Endpoints** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - BillingHistory JPA entity created with all required fields
> - Database migration script created and tested
> - BillingHistory repository interface implemented with custom queries
> - Billing history endpoints implemented (list, filter, details)
> - Filtering by date range, operator, subscription status
> - Pagination implemented for list endpoints
> - Aggregation logic for billing summaries (total spent, monthly breakdown)
> - Caching implemented for frequently accessed billing data
> - Authorization checks ensure customers only see own billing history
> - Error handling with appropriate HTTP status codes
> - Input validation on all parameters
> - Unit and integration tests passing
> - Database schema verified in test environment
> 
> # TODO:
> - [ ] Create BillingHistory.java entity class with JPA annotations
> - [ ] Add fields: id (UUID), user_id (FK), subscription_id (FK), operator_id (FK), plan_id (FK), amount (DECIMAL), currency (VARCHAR), billing_date, due_date, payment_date, status (ENUM), description, created_at, updated_at
> - [ ] Create BillingStatus enum (PENDING, PAID, OVERDUE, CANCELED, REFUNDED)
> - [ ] Add relationships: @ManyToOne to User, Subscription, Operator, Plan
> - [ ] Create BillingHistoryRepository interface extending JpaRepository
> - [ ] Add custom query methods: findByUserId(), findByUserIdAndDateRange(), findByOperatorId(), findByStatus(), findBySubscriptionId()
> - [ ] Create database migration (Flyway/Liquibase) for billing_history table
> - [ ] Add validation constraints to entity fields (NotNull, NotBlank, Positive for amount)
> - [ ] Add timestamps: created_at (auto-set on creation), updated_at (auto-set on update), payment_date (set on payment)
> - [ ] Create BillingHistoryDTO for API responses
> - [ ] Create BillingHistoryController with REST endpoints
> - [ ] Implement GET /billing-history (list all billing records with pagination)
> - [ ] Implement GET /billing-history/{id} (get billing record details)
> - [ ] Implement GET /billing-history/summary (billing summary: total spent, monthly breakdown)
> - [ ] Add filtering by date range (start_date, end_date query parameters)
> - [ ] Add filtering by status (PENDING, PAID, OVERDUE, etc.)
> - [ ] Add filtering by operator_id
> - [ ] Add filtering by subscription_id
> - [ ] Implement sorting (by date, by amount, by status)
> - [ ] Add pagination parameters (page, size, sort)
> - [ ] Create BillingHistoryService for business logic
> - [ ] Implement billing record creation logic (triggered on subscription creation/renewal)
> - [ ] Implement billing record update logic (on payment received)
> - [ ] Add authorization checks (@PreAuthorize or custom logic)
> - [ ] Ensure customers only see own billing history
> - [ ] Ensure operators only see billing for their plans
> - [ ] Implement caching for billing summaries (5-15 minute TTL)
> - [ ] Add cache invalidation on new billing record creation
> - [ ] Implement aggregation queries (total spent, monthly breakdown, by operator)
> - [ ] Add error handling (404 for non-existent records, 403 for unauthorized access)
> - [ ] Add input validation (date range validation, status validation)
> - [ ] Create unit tests for BillingHistory entity
> - [ ] Create unit tests for BillingHistoryRepository queries
> - [ ] Create integration tests for billing endpoints
> - [ ] Test list endpoint with pagination
> - [ ] Test filtering by date range
> - [ ] Test filtering by status
> - [ ] Test filtering by operator
> - [ ] Test summary endpoint calculations
> - [ ] Test authorization (customer sees only own, operator sees own plans)
> - [ ] Test error scenarios (invalid date range, non-existent record)
> - [ ] Test caching behavior (data updates on new record)
> - [ ] Test concurrent billing record creation
> - [ ] Verify database schema and indexes
> - [ ] Test with sample billing data (multiple records, various statuses)
> 
> # Reports:
> *
> </details>

## 001-0043
> **Backend: Implement Notification System** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Notification entity created with message templates
> - Notification service implemented for email and SMS delivery
> - Event-driven notification triggers (subscription created, plan changed, renewal, cancellation)
> - Message templates created for each notification type
> - Email service integrated (SMTP configuration)
> - SMS service integrated (third-party provider: Twilio/AWS SNS)
> - Notification preferences stored per user (email/SMS opt-in)
> - Notification history tracked in database
> - Retry logic implemented for failed notifications
> - Error handling with logging for delivery failures
> - Unit and integration tests passing
> - Email and SMS templates tested with sample data
> 
> # TODO:
> - [ ] Create Notification.java entity with JPA annotations
> - [ ] Add fields: id (UUID), user_id (FK), type (VARCHAR), subject, message, channel (EMAIL/SMS), status (ENUM), sent_at, created_at, retry_count
> - [ ] Create NotificationStatus enum (PENDING, SENT, FAILED, BOUNCED)
> - [ ] Create NotificationType enum (SUBSCRIPTION_CREATED, PLAN_CHANGED, RENEWAL_REMINDER, CANCELLATION, PAYMENT_RECEIVED, OVERDUE_PAYMENT)
> - [ ] Add relationships: @ManyToOne to User
> - [ ] Create NotificationRepository interface extending JpaRepository
> - [ ] Add custom query methods: findByUserId(), findByStatus(), findByType(), findByDateRange()
> - [ ] Create database migration for notifications table
> - [ ] Create NotificationPreference entity (user_id, email_enabled, sms_enabled, notification_types)
> - [ ] Create NotificationPreferenceRepository
> - [ ] Create NotificationTemplate entity (type, subject_template, message_template, channel)
> - [ ] Create NotificationService for orchestrating notifications
> - [ ] Implement sendEmail() method with SMTP configuration
> - [ ] Implement sendSMS() method with Twilio/AWS SNS integration
> - [ ] Create EmailService for email delivery
> - [ ] Create SMSService for SMS delivery
> - [ ] Implement template rendering (replace placeholders with actual data)
> - [ ] Add retry logic (exponential backoff, max 3 retries)
> - [ ] Create NotificationEventListener for subscription events
> - [ ] Implement listener for SUBSCRIPTION_CREATED event
> - [ ] Implement listener for PLAN_CHANGED event
> - [ ] Implement listener for RENEWAL_REMINDER event (scheduled job)
> - [ ] Implement listener for SUBSCRIPTION_CANCELED event
> - [ ] Implement listener for PAYMENT_RECEIVED event
> - [ ] Create NotificationController with REST endpoints
> - [ ] Implement GET /notifications (list user notifications with pagination)
> - [ ] Implement GET /notifications/preferences (get user notification preferences)
> - [ ] Implement PUT /notifications/preferences (update notification preferences)
> - [ ] Implement POST /notifications/{id}/mark-as-read (mark notification as read)
> - [ ] Add authorization checks (users only see own notifications)
> - [ ] Create email templates directory (HTML templates for each notification type)
> - [ ] Create SUBSCRIPTION_CREATED email template
> - [ ] Create PLAN_CHANGED email template
> - [ ] Create RENEWAL_REMINDER email template
> - [ ] Create CANCELLATION email template
> - [ ] Create PAYMENT_RECEIVED email template
> - [ ] Create OVERDUE_PAYMENT email template
> - [ ] Create SMS templates (shorter text versions)
> - [ ] Implement template variable replacement ({{user_name}}, {{plan_name}}, {{date}}, etc.)
> - [ ] Add SMTP configuration (mail.smtp.host, mail.smtp.port, credentials)
> - [ ] Add SMS provider configuration (API key, sender ID)
> - [ ] Implement logging for notification delivery (success/failure)
> - [ ] Add error handling (SMTP errors, SMS API errors, invalid phone numbers)
> - [ ] Create unit tests for NotificationService
> - [ ] Test template rendering with sample data
> - [ ] Test email sending (mock SMTP)
> - [ ] Test SMS sending (mock SMS provider)
> - [ ] Test retry logic (failed notification retried)
> - [ ] Create integration tests for notification endpoints
> - [ ] Test notification list endpoint with pagination
> - [ ] Test notification preferences get/update
> - [ ] Test event listeners trigger notifications
> - [ ] Test authorization (user only sees own notifications)
> - [ ] Test notification history is tracked
> - [ ] Test failed notifications are retried
> - [ ] Test notification preferences filter delivery
> - [ ] Create end-to-end test (subscription creation triggers email notification)
> - [ ] Test with sample user data and notification events
> - [ ] Verify email and SMS delivery (staging environment)
> 
> # Reports:
> *
> </details>

## 001-0044
> **Backend: Add Audit Logging** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - AuditLog entity created with comprehensive field tracking
> - Database migration script created and tested
> - AuditLog repository implemented with query methods
> - Aspect-oriented programming (AOP) configured for automatic audit logging
> - All user-modifying endpoints logged (create, update, delete operations)
> - Audit log captures: user ID, action, entity type, old values, new values, timestamp, IP address
> - Authorization checks ensure users only see own audit logs (admins see all)
> - Audit log retrieval endpoints implemented with filtering and pagination
> - Sensitive data masked in audit logs (passwords, tokens, payment info)
> - Retention policy implemented (logs retained for compliance period)
> - Unit and integration tests passing
> - Audit trail verified for all Phase 4 and Phase 5 operations
> 
> # TODO:
> - [ ] Create AuditLog.java entity with JPA annotations
> - [ ] Add fields: id (UUID), user_id (FK), action (VARCHAR), entity_type (VARCHAR), entity_id (UUID), old_values (JSON/TEXT), new_values (JSON/TEXT), ip_address (VARCHAR), user_agent (VARCHAR), timestamp (DATETIME), status (VARCHAR)
> - [ ] Create AuditAction enum (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, SUBSCRIBE, PLAN_CHANGE, CANCEL_SUBSCRIPTION, PAYMENT, etc.)
> - [ ] Create AuditEntityType enum (USER, SUBSCRIPTION, PLAN, OPERATOR, BILLING, NOTIFICATION, etc.)
> - [ ] Add relationships: @ManyToOne to User
> - [ ] Create AuditLogRepository interface extending JpaRepository
> - [ ] Add custom query methods: findByUserId(), findByUserIdAndDateRange(), findByAction(), findByEntityType(), findByEntityId()
> - [ ] Create database migration for audit_logs table
> - [ ] Create AuditLogDTO for API responses
> - [ ] Create AuditLogService for logging operations
> - [ ] Implement logAction() method to create audit log entries
> - [ ] Implement method to capture old and new values (before/after comparison)
> - [ ] Create AuditLogAspect for AOP-based automatic logging
> - [ ] Configure @Aspect on AuditLogAspect class
> - [ ] Implement @Around advice for controller methods
> - [ ] Capture method parameters (new values)
> - [ ] Capture return values (created/updated entity)
> - [ ] Extract user ID from SecurityContext
> - [ ] Extract IP address from HttpServletRequest
> - [ ] Extract user agent from request headers
> - [ ] Annotate endpoints to be audited with @Auditable annotation (optional, or audit all)
> - [ ] Create AuditLogController with REST endpoints
> - [ ] Implement GET /audit-logs (list audit logs with pagination)
> - [ ] Implement GET /audit-logs/user/{userId} (list logs for specific user)
> - [ ] Implement GET /audit-logs/{id} (get specific audit log entry)
> - [ ] Add filtering by action (CREATE, UPDATE, DELETE, etc.)
> - [ ] Add filtering by entity type (USER, SUBSCRIPTION, PLAN, etc.)
> - [ ] Add filtering by entity ID
> - [ ] Add filtering by date range (start_date, end_date)
> - [ ] Implement sorting (by timestamp, by action, by user)
> - [ ] Add pagination parameters (page, size, sort)
> - [ ] Create sensitive data masking utility
> - [ ] Mask passwords in old_values and new_values
> - [ ] Mask payment information (credit card numbers, CVV)
> - [ ] Mask API tokens and secrets
> - [ ] Mask email addresses (optional, based on privacy policy)
> - [ ] Add authorization checks (@PreAuthorize)
> - [ ] Ensure users only see own audit logs
> - [ ] Ensure admins can see all audit logs
> - [ ] Implement audit log retention policy
> - [ ] Create scheduled job to delete logs older than retention period (e.g., 90 days)
> - [ ] Add configuration for retention period (application.properties)
> - [ ] Add error handling for logging failures (should not break main operation)
> - [ ] Implement logging for audit log creation failures
> - [ ] Create unit tests for AuditLogService
> - [ ] Test logAction() method with sample data
> - [ ] Test old/new value capture
> - [ ] Test sensitive data masking
> - [ ] Create unit tests for AuditLogAspect
> - [ ] Test @Around advice captures method parameters and return values
> - [ ] Test IP address and user agent extraction
> - [ ] Create integration tests for audit endpoints
> - [ ] Test list endpoint with pagination
> - [ ] Test filtering by action, entity type, date range
> - [ ] Test authorization (user sees only own, admin sees all)
> - [ ] Test sensitive data is masked in responses
> - [ ] Create end-to-end test for subscription creation audit trail
> - [ ] Create end-to-end test for plan change audit trail
> - [ ] Create end-to-end test for subscription cancellation audit trail
> - [ ] Test audit logs capture all required information
> - [ ] Test retention policy (old logs deleted)
> - [ ] Test concurrent audit log creation
> - [ ] Verify database schema and indexes on frequently queried columns
> 
> # Reports:
> *
> </details>

## 001-0045
> **Frontend: Create Billing History Section** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Billing history section created and registered in config.json
> - Billing records displayed in table/list format with all relevant details
> - Date range filtering implemented (last 30 days, 90 days, 1 year, custom)
> - Filtering by status (PENDING, PAID, OVERDUE, REFUNDED)
> - Filtering by operator (dropdown)
> - Sorting by date, amount, status
> - Pagination implemented for large billing lists
> - Invoice download functionality (PDF export)
> - Billing summary widget (total spent, monthly breakdown)
> - Loading states during data fetch
> - Error handling with toast notifications
> - Empty state displayed when no billing records exist
> - Responsive layout works on mobile, tablet, desktop
> - Section follows modular pattern (init() and cleanup() methods)
> - CSS created in both default/ and dark/ theme directories
> - Manual testing completed with various filters and exports
> 
> # TODO:
> - [ ] Create `pages/sections/billing-history.html` with section structure
> - [ ] Create `pages/sections/billing-history.js` with BillingHistorySection class
> - [ ] Implement init() method to fetch billing records via apiClient
> - [ ] Design billing records table (date, amount, operator, plan, status, actions)
> - [ ] Create billing record row component with clickable details
> - [ ] Add date range filter (last 30/90 days, 1 year, custom date picker)
> - [ ] Add status filter dropdown (PENDING, PAID, OVERDUE, REFUNDED)
> - [ ] Add operator filter dropdown (populated from billing data)
> - [ ] Implement sorting (by date ascending/descending, by amount, by status)
> - [ ] Add loading skeleton loader while fetching billing records
> - [ ] Implement empty state message ("No billing records found")
> - [ ] Add pagination controls (prev/next buttons or load more)
> - [ ] Create billing summary widget (total spent this month, this year)
> - [ ] Add monthly breakdown chart (bar chart or table)
> - [ ] Implement invoice download button (PDF export per record)
> - [ ] Create billing detail modal (full invoice information)
> - [ ] Add status badge styling (PENDING=yellow, PAID=green, OVERDUE=red, REFUNDED=blue)
> - [ ] Show payment date for paid records
> - [ ] Show due date for pending/overdue records
> - [ ] Add error handling with toast notifications for API failures
> - [ ] Implement responsive table layout (horizontal scroll on mobile)
> - [ ] Create `css/default/billing-history.css` with table, filter, and summary styles
> - [ ] Create `css/dark/billing-history.css` with dark theme variants
> - [ ] Add styles to `config/styles.json` for both theme directories
> - [ ] Add section to `config.json` with role: ["CUSTOMER"] (customer-only access)
> - [ ] Test API calls with apiClient (no /api prefix)
> - [ ] Test 401 error handling (token refresh auto-retry)
> - [ ] Test date range filtering (predefined and custom ranges)
> - [ ] Test status filtering
> - [ ] Test operator filtering
> - [ ] Test sorting (all sortable columns)
> - [ ] Test pagination (load more records, navigate pages)
> - [ ] Test billing summary calculations (total spent, monthly breakdown)
> - [ ] Test invoice download (PDF generated correctly)
> - [ ] Test loading states and error messages
> - [ ] Test empty state when no records exist
> - [ ] Test responsive layout on mobile (375px), tablet (768px), desktop (1920px)
> - [ ] Test both default and dark themes
> - [ ] Test billing detail modal opens and displays correctly
> - [ ] Verify section loads only for CUSTOMER role
> - [ ] Manual testing with multiple billing records and various filters
> - [ ] Test with different currencies (if applicable)
> 
> # Reports:
> *
> </details>

## 001-0046
> **Backend: Implement Notification System** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Notification entity created with all required fields (type, recipient, subject, body, status, sent_at)
> - NotificationRepository implemented with custom query methods
> - Email service integrated (SMTP configuration, template system)
> - SMS service integrated (third-party provider: Twilio/AWS SNS)
> - Notification trigger logic implemented for subscription events (subscribe, plan change, cancellation, renewal)
> - Notification status tracking (PENDING, SENT, FAILED, DELIVERED)
> - Retry mechanism for failed notifications (exponential backoff)
> - Notification templates created for each event type
> - Unit tests for notification service and triggers pass
> - Integration tests for end-to-end notification flow pass
> - Notification logging implemented for audit trail
> 
> # TODO:
> - [ ] Create Notification.java entity with JPA annotations
> - [ ] Add fields: id (UUID), user_id (FK), type (ENUM), recipient (email/phone), subject, body, status (ENUM), sent_at, created_at, updated_at, retry_count, last_error
> - [ ] Create NotificationType enum (SUBSCRIPTION_CREATED, PLAN_CHANGED, SUBSCRIPTION_CANCELED, RENEWAL_REMINDER, PAYMENT_FAILED)
> - [ ] Create NotificationStatus enum (PENDING, SENT, FAILED, DELIVERED)
> - [ ] Add relationships: @ManyToOne to User
> - [ ] Create NotificationRepository interface with custom query methods
> - [ ] Add query methods: findByUserIdAndStatus(), findPendingNotifications(), findFailedNotifications(), findByType()
> - [ ] Configure SMTP settings in application.properties (email host, port, credentials)
> - [ ] Create EmailService class with sendEmail() method
> - [ ] Implement email template system (Thymeleaf or FreeMarker) for notification templates
> - [ ] Create email templates for each notification type (subscription_created.html, plan_changed.html, etc.)
> - [ ] Integrate third-party SMS service (Twilio/AWS SNS)
> - [ ] Create SmsService class with sendSms() method
> - [ ] Implement NotificationService orchestrating email/SMS sending
> - [ ] Create notification trigger listeners for subscription events (SubscriptionCreatedEvent, PlanChangedEvent, etc.)
> - [ ] Implement retry mechanism with exponential backoff (max 3 retries, delay: 1min, 5min, 15min)
> - [ ] Add notification status updates (PENDING → SENT → DELIVERED or FAILED)
> - [ ] Create scheduled task to retry failed notifications (@Scheduled)
> - [ ] Add logging for all notification events (sent, failed, retried)
> - [ ] Create NotificationDTO for API responses
> - [ ] Implement error handling and fallback mechanisms (email fails → log and retry)
> - [ ] Add rate limiting for notifications (prevent spam to same user)
> - [ ] Write unit tests for EmailService, SmsService, NotificationService
> - [ ] Write integration tests for notification triggers and event listeners
> - [ ] Test retry mechanism with simulated failures
> - [ ] Test notification templates render correctly
> - [ ] Test status transitions (PENDING → SENT → DELIVERED)
> - [ ] Verify notifications are created for each subscription event
> - [ ] Test with both email and SMS recipients
> - [ ] Verify audit trail logging is complete
> 
> # Reports:
> *
> </details>

## 001-0047
> **Backend: Add Audit Logging** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - AuditLog entity created with all required fields (user_id, action, entity_type, entity_id, changes, timestamp, ip_address)
> - AuditLogRepository implemented with custom query methods
> - AuditService created to log all user actions
> - Aspect-oriented programming (AOP) used to automatically log method calls
> - Audit logging implemented for all critical operations (subscription create/update/cancel, plan change, user profile update, login/logout)
> - Audit trail queryable by user, date range, action type, entity type
> - Sensitive data masked in audit logs (passwords, tokens, payment info)
> - Audit logs immutable (no updates, only inserts)
> - Unit tests for audit logging pass
> - Integration tests for audit trail accuracy pass
> - Compliance requirements verified (data retention, access controls)
> 
> # TODO:
> - [ ] Create AuditLog.java entity with JPA annotations
> - [ ] Add fields: id (UUID), user_id (FK), action (ENUM), entity_type (VARCHAR), entity_id (UUID), old_values (JSON), new_values (JSON), changes (TEXT), ip_address (VARCHAR), user_agent (VARCHAR), timestamp (TIMESTAMP), created_at (TIMESTAMP)
> - [ ] Create AuditAction enum (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, SUBSCRIBE, PLAN_CHANGE, CANCEL_SUBSCRIPTION, PASSWORD_CHANGE)
> - [ ] Add relationships: @ManyToOne to User
> - [ ] Create AuditLogRepository interface with custom query methods
> - [ ] Add query methods: findByUserId(), findByDateRange(), findByActionType(), findByEntityType(), findByEntityId()
> - [ ] Create AuditService class with logAction() method
> - [ ] Implement AOP aspect (AuditAspect) to intercept method calls
> - [ ] Add @Auditable annotation for methods that should be logged
> - [ ] Implement method interceptor to capture method parameters and return values
> - [ ] Create logic to detect changes between old and new values
> - [ ] Implement data masking for sensitive fields (password, token, card_number, ssn, etc.)
> - [ ] Add IP address capture from HTTP request
> - [ ] Add user agent capture from HTTP request
> - [ ] Create audit logging for subscription operations (create, update, cancel)
> - [ ] Create audit logging for plan change operations
> - [ ] Create audit logging for user profile updates
> - [ ] Create audit logging for authentication events (login, logout, password change)
> - [ ] Create audit logging for admin operations (user management, operator management)
> - [ ] Implement immutability for audit logs (prevent updates/deletes)
> - [ ] Create AuditLogDTO for API responses
> - [ ] Implement audit log query endpoints (GET /audit-logs with filters)
> - [ ] Add pagination and sorting for audit log queries
> - [ ] Add audit log retention policy (keep logs for X years)
> - [ ] Create scheduled task to archive old audit logs
> - [ ] Write unit tests for AuditService and AuditAspect
> - [ ] Write integration tests for audit logging on all critical operations
> - [ ] Test data masking for sensitive fields
> - [ ] Test audit log queries with various filters
> - [ ] Test immutability (verify logs cannot be modified)
> - [ ] Test IP address and user agent capture
> - [ ] Verify audit trail is complete for subscription lifecycle
> - [ ] Test with concurrent operations to ensure accuracy
> 
> # Reports:
> *
> </details>

## 001-0048
> **Frontend: Create Billing History Section** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Billing history section created and registered in config.json
> - Billing records display with date, subscription, amount, status, invoice link
> - Filter by date range (last 30 days, 90 days, 1 year, custom)
> - Filter by subscription or operator
> - Search functionality by invoice number or subscription name
> - Invoice download as PDF functionality
> - Payment status indicator (PAID, PENDING, FAILED, REFUNDED)
> - Pagination for large billing history lists
> - Loading states implemented during data fetch
> - Error handling with toast notifications
> - Empty state displayed when no billing records exist
> - Responsive layout works on mobile, tablet, desktop
> - Section follows modular pattern (init() and cleanup() methods)
> - CSS created in both default/ and dark/ theme directories
> - Manual testing completed on multiple screen sizes
> 
> # TODO:
> - [ ] Create `pages/sections/billing-history.html` with section structure
> - [ ] Create `pages/sections/billing-history.js` with BillingHistorySection class
> - [ ] Implement init() method to fetch billing history via apiClient
> - [ ] Design billing record table/card component (date, subscription, operator, amount, status, invoice link)
> - [ ] Add loading skeleton loader while fetching billing history
> - [ ] Implement empty state message ("No billing records found")
> - [ ] Add error handling with toast notifications for API failures
> - [ ] Create date range filter (dropdown: Last 30 days, Last 90 days, Last year, Custom date picker)
> - [ ] Create subscription filter (dropdown of user's subscriptions)
> - [ ] Create operator filter (dropdown of operators user has subscriptions with)
> - [ ] Implement search functionality by invoice number or subscription name
> - [ ] Create "Download Invoice" button for each billing record (PDF download)
> - [ ] Add status badge styling (PAID=green, PENDING=yellow, FAILED=red, REFUNDED=blue)
> - [ ] Implement pagination (10-25 records per page)
> - [ ] Add sort options (by date, by amount, by status)
> - [ ] Implement responsive table/card layout (table on desktop, cards on mobile)
> - [ ] Create `css/default/billing-history.css` with table/card styles, filters, badges
> - [ ] Create `css/dark/billing-history.css` with dark theme variants
> - [ ] Add styles to `config/styles.json` for both theme directories
> - [ ] Add section to `config.json` with role: ["CUSTOMER"] (customer-only access)
> - [ ] Test API calls with apiClient (no /api prefix)
> - [ ] Test 401 error handling (token refresh auto-retry)
> - [ ] Test loading states and error messages
> - [ ] Test date range filtering accuracy
> - [ ] Test search functionality
> - [ ] Test PDF download functionality
> - [ ] Test pagination and sorting
> - [ ] Test responsive layout on mobile (375px), tablet (768px), desktop (1920px)
> - [ ] Test both default and dark themes
> - [ ] Verify section loads only for CUSTOMER role
> - [ ] Manual testing with sample billing data
> 
> # Reports:
> *
> </details>

## 001-0049
> **Frontend: Create Notification Preferences Section** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Notification preferences section created and registered in config.json
> - User can enable/disable email notifications
> - User can enable/disable SMS notifications
> - User can select notification types to receive (subscription created, plan changed, cancellation, renewal reminder, payment failed)
> - User can set notification frequency (immediate, daily digest, weekly digest)
> - User can manage email and phone number for notifications
> - Save preferences button with success confirmation
> - Loading states implemented during data fetch and save
> - Error handling with toast notifications for API failures
> - Validation for email and phone number formats
> - Empty state or default preferences displayed
> - Responsive layout works on mobile, tablet, desktop
> - Section follows modular pattern (init() and cleanup() methods)
> - CSS created in both default/ and dark/ theme directories
> - Manual testing completed on multiple screen sizes
> 
> # TODO:
> - [ ] Create `pages/sections/notification-preferences.html` with section structure
> - [ ] Create `pages/sections/notification-preferences.js` with NotificationPreferencesSection class
> - [ ] Implement init() method to fetch user notification preferences via apiClient
> - [ ] Design notification preferences form with toggles and checkboxes
> - [ ] Add toggle for "Email Notifications" (enable/disable all email)
> - [ ] Add toggle for "SMS Notifications" (enable/disable all SMS)
> - [ ] Create checkboxes for notification types: Subscription Created, Plan Changed, Cancellation, Renewal Reminder, Payment Failed
> - [ ] Create frequency selector (Immediate, Daily Digest, Weekly Digest) for each notification type
> - [ ] Add email input field for notification email address with validation
> - [ ] Add phone input field for SMS notifications with validation (format: +1-XXX-XXX-XXXX)
> - [ ] Implement form validation (email format, phone format)
> - [ ] Create "Save Preferences" button
> - [ ] Add loading state while saving preferences
> - [ ] Add success toast notification after preferences saved
> - [ ] Add error toast notification if save fails
> - [ ] Implement cancel button to revert unsaved changes
> - [ ] Add "Test Notification" buttons to send test email/SMS
> - [ ] Create section showing notification history (recent notifications sent)
> - [ ] Add loading skeleton loader while fetching preferences
> - [ ] Implement responsive form layout (1 column mobile, 2 columns tablet/desktop)
> - [ ] Create `css/default/notification-preferences.css` with form styles, toggles, checkboxes
> - [ ] Create `css/dark/notification-preferences.css` with dark theme variants
> - [ ] Add styles to `config/styles.json` for both theme directories
> - [ ] Add section to `config.json` with role: ["CUSTOMER"] (customer-only access)
> - [ ] Test API calls with apiClient (no /api prefix)
> - [ ] Test 401 error handling (token refresh auto-retry)
> - [ ] Test form validation (email, phone format)
> - [ ] Test loading states and error messages
> - [ ] Test save functionality and success confirmation
> - [ ] Test cancel functionality (revert changes)
> - [ ] Test test notification functionality
> - [ ] Test responsive layout on mobile (375px), tablet (768px), desktop (1920px)
> - [ ] Test both default and dark themes
> - [ ] Verify section loads only for CUSTOMER role
> - [ ] Manual testing with sample preference data
> 
> # Reports:
> *
> </details>

## 001-0050
> **Testing: Phase 5 Integration Tests** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Integration tests for notification system (email/SMS sending, retries, status tracking)
> - Integration tests for audit logging (all critical operations logged, data accuracy, immutability)
> - Integration tests for billing history endpoints (retrieval, filtering, pagination)
> - Integration tests for notification preferences (save, retrieve, update preferences)
> - End-to-end tests for subscription lifecycle with notifications and audit logs
> - Test data setup and teardown working correctly
> - All tests passing with >90% code coverage for Phase 5 components
> - Performance tests for audit log queries and notification processing
> - Tests for edge cases (concurrent operations, failed notifications, retries)
> - Test documentation and execution guide created
> 
> # TODO:
> - [ ] Create NotificationServiceIntegrationTest class
> - [ ] Test email notification sending with mock SMTP server
> - [ ] Test SMS notification sending with mock SMS provider
> - [ ] Test notification retry mechanism (verify retries happen with exponential backoff)
> - [ ] Test notification status transitions (PENDING → SENT → DELIVERED)
> - [ ] Test failed notification handling and error logging
> - [ ] Test notification triggers for subscription events (create, change plan, cancel)
> - [ ] Test notification templates render correctly with user data
> - [ ] Test rate limiting (verify notifications not sent too frequently to same user)
> - [ ] Create AuditLogServiceIntegrationTest class
> - [ ] Test audit logging for subscription creation
> - [ ] Test audit logging for plan change operations
> - [ ] Test audit logging for subscription cancellation
> - [ ] Test audit logging for user profile updates
> - [ ] Test audit logging for authentication events (login, logout, password change)
> - [ ] Test audit logging for admin operations
> - [ ] Test data masking for sensitive fields (password, token, payment info)
> - [ ] Test IP address and user agent capture
> - [ ] Test audit log immutability (verify logs cannot be modified or deleted)
> - [ ] Test audit log queries with various filters (by user, date range, action type)
> - [ ] Create BillingHistoryIntegrationTest class
> - [ ] Test billing history retrieval for customer
> - [ ] Test billing history filtering by date range
> - [ ] Test billing history filtering by subscription
> - [ ] Test billing history filtering by operator
> - [ ] Test billing history search by invoice number
> - [ ] Test billing history pagination and sorting
> - [ ] Test PDF invoice generation and download
> - [ ] Test billing history with no records (empty state)
> - [ ] Create NotificationPreferencesIntegrationTest class
> - [ ] Test retrieving user notification preferences
> - [ ] Test updating notification preferences (email/SMS toggles)
> - [ ] Test updating notification types preferences
> - [ ] Test updating notification frequency preferences
> - [ ] Test email validation on save
> - [ ] Test phone number validation on save
> - [ ] Test preferences persistence across sessions
> - [ ] Test test notification sending
> - [ ] Create end-to-end subscription lifecycle test
> - [ ] Test subscription creation triggers notification and audit log
> - [ ] Test plan change triggers notification and audit log
> - [ ] Test subscription cancellation triggers notification and audit log
> - [ ] Test subscription renewal triggers notification
> - [ ] Verify complete audit trail for subscription lifecycle
> - [ ] Verify all notifications sent according to user preferences
> - [ ] Create test data fixtures for notifications, audit logs, billing records
> - [ ] Implement test setup (create test users, subscriptions, plans)
> - [ ] Implement test teardown (clean up test data)
> - [ ] Test concurrent operations (multiple subscriptions, notifications, audit logs)
> - [ ] Test performance of audit log queries with large datasets
> - [ ] Test performance of notification processing with high volume
> - [ ] Test error scenarios (API failures, database errors, external service failures)
> - [ ] Test retry mechanisms for failed operations
> - [ ] Create integration test execution guide
> - [ ] Document test data setup and teardown procedures
> - [ ] Document how to run tests locally and in CI/CD pipeline
> - [ ] Verify test coverage >90% for Phase 5 components
> 
> # Reports:
> *
> </details>

## 001-0051
> **Backend: Create API Documentation (Swagger)** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Swagger UI accessible at `/swagger-ui.html`
> - All REST endpoints documented with method, path, parameters, and responses
> - Authentication requirements clearly marked (JWT Bearer token)
> - Request/response examples for each endpoint
> - Error responses documented (400, 401, 403, 404, 500)
> - Data models documented with field descriptions
> - Endpoint grouping by feature
> - Rate limiting information included
> - OpenAPI JSON/YAML downloadable
> - Documentation reviewed and approved
> 
> # TODO:
> - [] Add springdoc-openapi-ui dependency to pom.xml
> - [] Add springdoc-openapi-starter-webmvc-ui dependency
> - [] Add springdoc-openapi-starter-webmvc-api dependency
> - [] Configure Swagger/OpenAPI in application.properties
> - [] Add @Operation annotations to all controller methods
> - [] Add @ApiResponse annotations for error responses
> - [] Add @Schema annotations to DTOs
> - [] Document all request/response examples
> - [] Document pagination parameters
> - [] Document filtering parameters
> - [] Create endpoint grouping by feature
> - [] Test Swagger UI loads correctly
> - [] Verify all endpoints appear in documentation
> - [] Test example requests from Swagger UI
> - [] Verify response schemas match actual responses
> 
> # Reports:
> *
> </details>

## 001-0052
> **Backend: Performance Optimization & Indexing** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - Database indexes created on frequently queried columns
> - Query performance metrics measured and documented
> - N+1 query problems identified and resolved
> - Caching strategy implemented for read-heavy endpoints
> - Database connection pooling configured
> - Slow query log enabled and analyzed
> - Performance benchmarks established
> - Load testing completed successfully
> - Query execution plans optimized
> 
> # TODO:
> - [] Identify frequently queried columns in all tables
> - [] Create indexes on user_id, operator_id, plan_id, status fields
> - [] Create composite indexes for filter queries
> - [] Enable slow query log in database
> - [] Run performance baseline tests
> - [] Implement query result caching with TTL
> - [] Configure database connection pooling (HikariCP)
> - [] Add query pagination to prevent large result sets
> - [] Optimize N+1 queries with JOIN statements
> - [] Add database query monitoring
> - [] Implement lazy loading for related entities
> - [] Test performance with 10000+ records
> - [] Document all optimizations made
> - [] Create performance report
> 
> # Reports:
> *
> </details>

## 001-0053
> **Backend: Security Hardening** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - HTTPS enforced in production
> - CORS policies properly configured
> - SQL injection vulnerabilities eliminated
> - XSS protection enabled
> - CSRF tokens implemented
> - Rate limiting configured on all endpoints
> - Input validation on all endpoints
> - Sensitive data not logged
> - Security headers added (HSTS, X-Frame-Options, etc.)
> - Dependencies scanned for vulnerabilities
> 
> # TODO:
> - [] Enable HTTPS/TLS in production configuration
> - [] Configure CORS to allow only trusted origins
> - [] Add input validation to all endpoint parameters
> - [] Implement parameterized queries to prevent SQL injection
> - [] Add XSS protection filters
> - [] Implement CSRF token generation and validation
> - [] Configure rate limiting on auth endpoints
> - [] Add rate limiting to API endpoints
> - [] Remove sensitive data from logs
> - [] Add security headers (HSTS, X-Frame-Options, X-Content-Type-Options)
> - [] Implement request/response encryption where needed
> - [] Scan dependencies with OWASP Dependency-Check
> - [] Update all vulnerable dependencies
> - [] Add security testing to CI/CD pipeline
> - [] Document security best practices
> - [] Perform security audit
> 
> # Reports:
> *
> </details>

## 001-0054
> **Frontend: Performance & Security Testing** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - XSS vulnerabilities tested and fixed
> - CSRF protection verified
> - Performance benchmarks established
> - Load testing completed (1000+ concurrent users)
> - Security headers validated
> - Token handling tested
> - API response times measured
> - Bundle size optimized
> - No console errors or warnings
> - Security audit passed
> 
> # TODO:
> - [] Run XSS vulnerability tests on all forms
> - [] Test CSRF token validation
> - [] Test token expiration and refresh flow
> - [] Measure page load times
> - [] Measure API response times
> - [] Test with 1000+ concurrent users
> - [] Optimize JavaScript bundle size
> - [] Optimize CSS bundle size
> - [] Test on slow network (3G/4G)
> - [] Test on low-end devices
> - [] Verify security headers present
> - [] Test localStorage security
> - [] Test password field masking
> - [] Run Lighthouse audit
> - [] Test responsive design on all breakpoints
> - [] Verify no sensitive data in localStorage
> - [] Test error handling and error messages
> - [] Document performance metrics
> - [] Create performance report
> 
> # Reports:
> *
> </details>

## 001-0055
> **Deployment: Production Readiness Checklist** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
> <details >
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - All phases 1-5 features tested and working
> - API documentation complete and accessible
> - Performance optimizations implemented
> - Security hardening completed
> - Database migrations prepared
> - Environment variables configured
> - Backup and recovery plan documented
> - Monitoring and alerting setup
> - Deployment runbook created
> - Production environment ready
> 
> # TODO:
> - [] Verify all Phase 1-5 features working correctly
> - [] Run full integration test suite
> - [] Run end-to-end tests on all user flows
> - [] Verify Swagger documentation is complete
> - [] Test API documentation accessibility
> - [] Verify performance benchmarks met
> - [] Confirm security audit passed
> - [] Prepare database migration scripts
> - [] Test database migrations on staging
> - [] Configure production environment variables
> - [] Setup environment-specific configurations
> - [] Configure logging for production
> - [] Setup monitoring and alerting tools
> - [] Configure error tracking (Sentry/similar)
> - [] Setup uptime monitoring
> - [] Create deployment runbook
> - [] Document rollback procedures
> - [] Setup backup strategy
> - [] Test backup and recovery process
> - [] Configure CDN for static assets
> - [] Setup SSL/TLS certificates
> - [] Configure firewall rules
> - [] Document production access procedures
> - [] Train team on deployment process
> - [] Schedule production launch
> - [] Prepare incident response plan
> 
> # Reports:
> *
> </details>

## 001-0012
> **TypeScript Conversion & State Management (Redux/Zustand/Context)** ![status](https://img.shields.io/badge/status-ONGOING-yellow)
> <details open>
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

## 001-0013
> **Backend: Create Operator Entity & Database Schema** ![status](https://img.shields.io/badge/status-ONGOING-yellow)
> <details open>
>     <summary>Details</summary>
> 
> # DOD (definition of done):
> - [ ] Operator JPA entity created with all required fields (id, name, description, service_types, status, created_at, updated_at)
> - [ ] Database migration script created and tested
> - [ ] Operator repository interface implemented with custom query methods
> - [ ] Entity validation annotations added (NotBlank, NotNull, etc.)
> - [ ] Soft delete mechanism implemented (status field)
> - [ ] Database schema verified in test environment
> - [ ] Unit tests for entity validation pass
> 
> # TODO:
> - [ ] Create Operator.java entity class with JPA annotations
> - [ ] Add fields: id (UUID), name, description, service_types (comma-separated or JSON), status (ENUM), created_at, updated_at
> - [ ] Create OperatorRepository interface extending JpaRepository
> - [ ] Add custom query methods: findAllByStatusOrderByName(), findByIdAndStatus()
> - [ ] Create database migration (Flyway/Liquibase) for operators table
> - [ ] Add validation constraints to entity fields
> - [ ] Write unit tests for entity and repository
> - [ ] Test soft delete functionality (status = INACTIVE)
> 
> # Reports:
> *
> </details>
