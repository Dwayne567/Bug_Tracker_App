/// <reference types="cypress" />

describe('Navigation & Layout', () => {
  const ts = Date.now();
  const user = {
    username: `nav_${ts}`,
    email: `nav_${ts}@example.com`,
    password: 'SecurePass123!',
  };

  before(() => {
    cy.register(user);
    cy.contains('Sign out').click();
  });

  beforeEach(() => {
    cy.visit('/login');
    cy.get('#username').type(user.username);
    cy.get('#password').type(user.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/bugs', { timeout: 10000 });
  });

  // -----------------------------------------------------------------------
  // Header
  // -----------------------------------------------------------------------
  describe('Header', () => {
    it('shows the Bug Tracker brand, username, and sign-out button', () => {
      cy.get('header').within(() => {
        cy.contains('Bug Tracker').should('be.visible');
        cy.contains(user.username).should('be.visible');
        cy.contains('Sign out').should('be.visible');
      });
    });

    it('brand link navigates to /bugs', () => {
      // Navigate away first
      cy.contains('New Bug Report').click();
      cy.url().should('include', '/bugs/new');

      // Click brand link
      cy.get('header').contains('Bug Tracker').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/bugs');
    });
  });

  // -----------------------------------------------------------------------
  // Breadcrumb Navigation
  // -----------------------------------------------------------------------
  describe('Breadcrumb', () => {
    it('"← Back to bugs" link on detail page returns to /bugs', () => {
      // Create a bug to navigate to
      const title = `Nav Breadcrumb Bug ${ts}`;
      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('Testing breadcrumb navigation back to list.');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      // Go to detail
      cy.contains(title).click();
      cy.get('h1').should('contain', title);

      // Click breadcrumb
      cy.contains('← Back to bugs').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/bugs');
    });
  });

  // -----------------------------------------------------------------------
  // Bug List Navigation Links
  // -----------------------------------------------------------------------
  describe('Bug List Links', () => {
    it('"New Bug Report" link navigates to /bugs/new', () => {
      cy.contains('New Bug Report').click();
      cy.url().should('include', '/bugs/new');
      cy.get('h1').should('contain', 'New Bug Report');
    });

    it('"View" link on a bug card navigates to the detail page', () => {
      const title = `View Link Bug ${ts}`;
      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('Testing the View link on the bug card.');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      cy.contains(title)
        .closest('.bg-white')
        .within(() => {
          cy.contains('View').click();
        });

      cy.get('h1').should('contain', title);
      cy.url().should('match', /\/bugs\/[a-f0-9-]+$/);
    });

    it('clicking bug title in the list navigates to detail page', () => {
      const title = `Title Click Bug ${ts}`;
      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('Testing that clicking title navigates to detail.');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      cy.contains(title).click();
      cy.get('h1').should('contain', title);
    });
  });

  // -----------------------------------------------------------------------
  // Bug Form Cancel Navigation
  // -----------------------------------------------------------------------
  describe('Bug Form Cancel', () => {
    it('"Cancel" link on new bug form navigates back to /bugs', () => {
      cy.contains('New Bug Report').click();
      cy.url().should('include', '/bugs/new');

      cy.contains('Cancel').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/bugs');
    });
  });

  // -----------------------------------------------------------------------
  // Cross-page links
  // -----------------------------------------------------------------------
  describe('Login ↔ Register Links', () => {
    it('login page links to register', () => {
      cy.contains('Sign out').click();
      cy.visit('/login');
      cy.contains('Create one').click();
      cy.url().should('include', '/register');
    });

    it('register page links to login', () => {
      cy.visit('/register');
      cy.contains('Sign in').click();
      cy.url().should('include', '/login');
    });
  });
});
