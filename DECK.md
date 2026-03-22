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
> **Implement role-based access control with authorization annotations.** ![status](https://img.shields.io/badge/status-ONGOING-yellow)
> <details open>
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
> **Implement password change and password reset functionality.** ![status](https://img.shields.io/badge/status-ONGOING-yellow)
> <details open>
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
