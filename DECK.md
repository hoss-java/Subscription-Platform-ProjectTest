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

## 001-0007
> **Implement role-based access control with authorization annotations.** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
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
> **Implement password change and password reset functionality.** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
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
> **Create comprehensive integration tests for authentication system.** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
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
> **Create frontend authentication service and global state management.** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
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
> **Create login and registration UI components with form validation.** ![status](https://img.shields.io/badge/status-NOT--STARTED-lightgrey)
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
> - [ ] 1. Create LoginForm component with email and password inputs
> - [ ] 2. Create RegistrationForm component with all required fields
> - [ ] 3. Implement form validation library (React Hook Form, Formik, etc.)
> - [ ] 4. Add email format validation
> - [ ] 5. Add password strength validation
> </details>

## 001-0006
> **Implement JWT token validation filter and Spring Security configuration.** ![status](https://img.shields.io/badge/status-ONGOING-yellow)
> <details open>
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
