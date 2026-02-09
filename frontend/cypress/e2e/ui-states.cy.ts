/// <reference types="cypress" />

describe('UI States & Edge Cases', () => {
  const ts = Date.now();
  const user = {
    username: `uistate_${ts}`,
    email: `uistate_${ts}@example.com`,
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
  // Empty State
  // -----------------------------------------------------------------------
  describe('Empty State', () => {
    it('shows "No bug reports found" when user has no bugs', () => {
      cy.contains('No bug reports found').should('be.visible');
      cy.contains('Create your first bug report').should('be.visible');
    });

    it('"Create your first bug report" links to /bugs/new', () => {
      cy.contains('Create your first bug report').click();
      cy.url().should('include', '/bugs/new');
    });
  });

  // -----------------------------------------------------------------------
  // Loading Spinners
  // -----------------------------------------------------------------------
  describe('Loading Spinners', () => {
    it('shows a loading spinner while bugs are being fetched', () => {
      cy.intercept('GET', '**/api/bugs/**', (req) => {
        req.on('response', (res) => {
          res.setDelay(1500);
        });
      }).as('getBugs');

      cy.visit('/bugs');
      cy.get('.animate-spin').should('exist');
    });
  });

  // -----------------------------------------------------------------------
  // API Error Handling
  // -----------------------------------------------------------------------
  describe('API Error Handling', () => {
    it('shows error banner when bug list API fails', () => {
      cy.intercept('GET', '**/api/bugs/**', {
        statusCode: 500,
        body: { detail: 'Internal server error' },
      }).as('getBugsFail');

      cy.visit('/bugs');
      cy.wait('@getBugsFail');
      cy.get('.bg-red-50').should('be.visible');
    });

    it('shows error state when viewing a non-existent bug', () => {
      cy.visit('/bugs/00000000-0000-0000-0000-000000000000');

      cy.get('.text-red-600').should('be.visible');
      cy.contains('Back to bugs').should('be.visible');
    });

    it('shows error banner when creating a bug fails', () => {
      cy.intercept('POST', '**/api/bugs/', {
        statusCode: 500,
        body: { detail: 'Internal server error' },
      }).as('createBugFail');

      cy.contains('New Bug Report').click();
      cy.get('#title').type('Bug That Will Fail');
      cy.get('#description').type('This creation should fail with a server error.');
      cy.get('button[type="submit"]').click();

      cy.wait('@createBugFail');
      cy.get('.bg-red-50').should('be.visible');
    });
  });

  // -----------------------------------------------------------------------
  // Non-existent Bug / 404 Handling
  // -----------------------------------------------------------------------
  describe('Non-existent Bug', () => {
    it('shows error and "Back to bugs" link for an invalid bug ID', () => {
      cy.visit('/bugs/nonexistent-id-12345');

      cy.get('.text-red-600').should('be.visible');
      cy.contains('Back to bugs').should('be.visible');
    });

    it('"Back to bugs" link navigates back to the list', () => {
      cy.visit('/bugs/00000000-0000-0000-0000-000000000000');

      cy.contains('Back to bugs').click();
      cy.url().should('include', '/bugs');
      cy.url().should('not.include', '/bugs/0000');
    });
  });

  // -----------------------------------------------------------------------
  // Landing Page
  // -----------------------------------------------------------------------
  describe('Landing Page', () => {
    it('shows the landing page with CTAs for unauthenticated users', () => {
      cy.contains('Sign out').click();
      cy.clearCookies();
      cy.visit('/');

      cy.get('h1').should('contain', 'Bug Tracker');
      cy.contains('Sign In').should('be.visible');
      cy.contains('Create Account').should('be.visible');
    });

    it('"Sign In" CTA navigates to /login', () => {
      cy.contains('Sign out').click();
      cy.clearCookies();
      cy.visit('/');

      cy.contains('Sign In').click();
      cy.url().should('include', '/login');
    });

    it('"Create Account" CTA navigates to /register', () => {
      cy.contains('Sign out').click();
      cy.clearCookies();
      cy.visit('/');

      cy.contains('Create Account').click();
      cy.url().should('include', '/register');
    });
  });
});
