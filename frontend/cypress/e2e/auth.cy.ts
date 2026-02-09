/// <reference types="cypress" />

describe('Authentication & Authorization', () => {
  // -----------------------------------------------------------------------
  // Registration
  // -----------------------------------------------------------------------
  describe('Register', () => {
    it('registers a new user and redirects to /bugs', () => {
      const ts = Date.now();
      const user = {
        username: `newuser_${ts}`,
        email: `newuser_${ts}@example.com`,
        password: 'SecurePass123!',
      };

      cy.visit('/register');
      cy.get('h1').should('contain', 'Create Account');

      cy.get('#username').type(user.username);
      cy.get('#email').type(user.email);
      cy.get('#password').type(user.password);
      cy.get('#password_confirm').type(user.password);
      cy.get('button[type="submit"]').click();

      // Should auto-login and redirect to bugs list
      cy.url().should('include', '/bugs', { timeout: 10000 });
      cy.get('h1').should('contain', 'Bug Reports');
    });

    it('shows validation errors for empty fields', () => {
      cy.visit('/register');
      cy.get('button[type="submit"]').click();

      cy.contains('Username must be at least 3 characters').should('be.visible');
      cy.contains('Invalid email address').should('be.visible');
      cy.contains('Password must be at least 8 characters').should('be.visible');
    });

    it('shows error for short username', () => {
      cy.visit('/register');
      cy.get('#username').type('ab');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('SecurePass123!');
      cy.get('#password_confirm').type('SecurePass123!');
      cy.get('button[type="submit"]').click();

      cy.contains('Username must be at least 3 characters').should('be.visible');
    });

    it('shows error for weak password (no uppercase)', () => {
      cy.visit('/register');
      cy.get('#username').type('validuser');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('weakpass1');
      cy.get('#password_confirm').type('weakpass1');
      cy.get('button[type="submit"]').click();

      cy.contains('Password must contain at least one uppercase letter').should('be.visible');
    });

    it('shows error for password mismatch', () => {
      cy.visit('/register');
      cy.get('#username').type('validuser');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('SecurePass123!');
      cy.get('#password_confirm').type('DifferentPass456!');
      cy.get('button[type="submit"]').click();

      cy.contains("Passwords don't match").should('be.visible');
    });

    it('shows link to login page', () => {
      cy.visit('/register');
      cy.contains('Already have an account').should('be.visible');
      cy.contains('Sign in').click();
      cy.url().should('include', '/login');
    });
  });

  // -----------------------------------------------------------------------
  // Login
  // -----------------------------------------------------------------------
  describe('Login', () => {
    const ts = Date.now();
    const user = {
      username: `loginuser_${ts}`,
      email: `loginuser_${ts}@example.com`,
      password: 'SecurePass123!',
    };

    before(() => {
      // Pre-register the user via API
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL') || 'http://localhost:8000'}/api/register/`,
        body: {
          username: user.username,
          email: user.email,
          password: user.password,
          password_confirm: user.password,
        },
        failOnStatusCode: false,
      });
    });

    it('logs in with valid credentials and redirects to /bugs', () => {
      cy.visit('/login');
      cy.get('h1').should('contain', 'Sign In');

      cy.get('#username').type(user.username);
      cy.get('#password').type(user.password);
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/bugs', { timeout: 10000 });
      cy.get('h1').should('contain', 'Bug Reports');
    });

    it('shows error for invalid credentials', () => {
      cy.visit('/login');
      cy.get('#username').type('nonexistent_user');
      cy.get('#password').type('WrongPassword1!');
      cy.get('button[type="submit"]').click();

      // Error banner should appear
      cy.get('.bg-red-50').should('be.visible');
    });

    it('shows validation errors for empty fields', () => {
      cy.visit('/login');
      cy.get('button[type="submit"]').click();

      cy.contains('Username is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('shows "Signing in..." while submitting', () => {
      cy.visit('/login');
      cy.get('#username').type(user.username);
      cy.get('#password').type(user.password);

      // Intercept login to slow it down
      cy.intercept('POST', '**/api/token/', (req) => {
        req.on('response', (res) => {
          res.setDelay(1000);
        });
      }).as('loginRequest');

      cy.get('button[type="submit"]').click();
      cy.get('button[type="submit"]').should('contain', 'Signing in...');
    });

    it('shows link to register page', () => {
      cy.visit('/login');
      cy.contains("Don't have an account").should('be.visible');
      cy.contains('Create one').click();
      cy.url().should('include', '/register');
    });
  });

  // -----------------------------------------------------------------------
  // Sign Out
  // -----------------------------------------------------------------------
  describe('Sign Out', () => {
    it('signs out and redirects to login', () => {
      const ts = Date.now();
      const user = {
        username: `signout_${ts}`,
        email: `signout_${ts}@example.com`,
        password: 'SecurePass123!',
      };

      cy.register(user);

      // Click sign out
      cy.contains('Sign out').click();

      // Should redirect to login (the app redirects to /login on sign out)
      cy.url().should('match', /\/(login)?$/);
    });
  });

  // -----------------------------------------------------------------------
  // Auth Guard
  // -----------------------------------------------------------------------
  describe('Auth Guard', () => {
    it('redirects unauthenticated user from /bugs to /login', () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit('/bugs');
      cy.url().should('include', '/login', { timeout: 10000 });
    });

    it('redirects unauthenticated user from /bugs/new to /login', () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit('/bugs/new');
      cy.url().should('include', '/login', { timeout: 10000 });
    });

    it('redirects authenticated user from landing page to /bugs', () => {
      const ts = Date.now();
      const user = {
        username: `guard_${ts}`,
        email: `guard_${ts}@example.com`,
        password: 'SecurePass123!',
      };

      cy.register(user);

      // Now visit the landing page
      cy.visit('/');
      cy.url().should('include', '/bugs', { timeout: 10000 });
    });
  });
});
