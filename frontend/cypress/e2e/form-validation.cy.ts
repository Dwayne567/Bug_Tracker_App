/// <reference types="cypress" />

describe('Form Validation', () => {
  const ts = Date.now();
  const user = {
    username: `formval_${ts}`,
    email: `formval_${ts}@example.com`,
    password: 'SecurePass123!',
  };

  before(() => {
    cy.register(user);
    cy.contains('Sign out').click();
  });

  // -----------------------------------------------------------------------
  // Bug Form Validation
  // -----------------------------------------------------------------------
  describe('Bug Form', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('#username').type(user.username);
      cy.get('#password').type(user.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });
      cy.contains('New Bug Report').click();
    });

    it('shows error when title is too short', () => {
      cy.get('#title').type('Abc');
      cy.get('#description').type('This description is long enough.');
      cy.get('button[type="submit"]').click();

      cy.contains('Title must be at least 5 characters').should('be.visible');
    });

    it('shows error when description is too short', () => {
      cy.get('#title').type('Valid Title Here');
      cy.get('#description').type('Short');
      cy.get('button[type="submit"]').click();

      cy.contains('Description must be at least 10 characters').should('be.visible');
    });

    it('shows errors when required fields are empty', () => {
      cy.get('button[type="submit"]').click();

      cy.contains('Title must be at least 5 characters').should('be.visible');
      cy.contains('Description must be at least 10 characters').should('be.visible');
    });

    it('defaults severity to medium and status to open', () => {
      cy.get('#severity').should('have.value', 'medium');
      cy.get('#status').should('have.value', 'open');
    });

    it('successfully submits with only required fields', () => {
      const title = `Minimal Bug ${ts}`;
      cy.get('#title').type(title);
      cy.get('#description').type('Only required fields filled in for this bug.');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/bugs', { timeout: 10000 });
      cy.contains(title).should('be.visible');
    });

    it('lowercases and trims tags from comma-separated input', () => {
      const title = `Tag Parsing Bug ${ts}`;
      cy.get('#title').type(title);
      cy.get('#description').type('Testing that tags are lowercased properly.');
      cy.get('#tags').type('  UI , Button , LOGIN  ');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/bugs', { timeout: 10000 });

      // Navigate to detail and check tags are lowercased
      cy.contains(title).click();
      cy.contains('ui').should('be.visible');
      cy.contains('button').should('be.visible');
      cy.contains('login').should('be.visible');
    });
  });

  // -----------------------------------------------------------------------
  // Login Form Validation
  // -----------------------------------------------------------------------
  describe('Login Form', () => {
    it('shows validation errors for empty username and password', () => {
      cy.visit('/login');
      cy.get('button[type="submit"]').click();

      cy.contains('Username is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('shows error for empty password only', () => {
      cy.visit('/login');
      cy.get('#username').type('someuser');
      cy.get('button[type="submit"]').click();

      cy.contains('Username is required').should('not.exist');
      cy.contains('Password is required').should('be.visible');
    });
  });

  // -----------------------------------------------------------------------
  // Register Form Validation
  // -----------------------------------------------------------------------
  describe('Register Form', () => {
    it('shows error for invalid email', () => {
      cy.visit('/register');
      cy.get('#username').type('validuser');
      cy.get('#email').type('not-an-email');
      cy.get('#password').type('SecurePass123!');
      cy.get('#password_confirm').type('SecurePass123!');
      cy.get('button[type="submit"]').click();

      cy.contains('Invalid email address').should('be.visible');
    });

    it('shows error for password without number', () => {
      cy.visit('/register');
      cy.get('#username').type('validuser');
      cy.get('#email').type('valid@example.com');
      cy.get('#password').type('SecurePassNoNum!');
      cy.get('#password_confirm').type('SecurePassNoNum!');
      cy.get('button[type="submit"]').click();

      cy.contains('Password must contain at least one number').should('be.visible');
    });

    it('shows error for password without lowercase', () => {
      cy.visit('/register');
      cy.get('#username').type('validuser');
      cy.get('#email').type('valid@example.com');
      cy.get('#password').type('ALLUPPERCASE1!');
      cy.get('#password_confirm').type('ALLUPPERCASE1!');
      cy.get('button[type="submit"]').click();

      cy.contains('Password must contain at least one lowercase letter').should('be.visible');
    });

    it('shows "Creating account..." while submitting', () => {
      cy.visit('/register');
      const regTs = Date.now();
      cy.get('#username').type(`loadtest_${regTs}`);
      cy.get('#email').type(`loadtest_${regTs}@example.com`);
      cy.get('#password').type('SecurePass123!');
      cy.get('#password_confirm').type('SecurePass123!');

      cy.intercept('POST', '**/api/register/', (req) => {
        req.on('response', (res) => {
          res.setDelay(1000);
        });
      }).as('registerRequest');

      cy.get('button[type="submit"]').click();
      cy.get('button[type="submit"]').should('contain', 'Creating account...');
    });
  });
});
