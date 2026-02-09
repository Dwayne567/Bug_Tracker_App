/// <reference types="cypress" />

describe('Bug CRUD Operations', () => {
  const ts = Date.now();
  const user = {
    username: `crud_${ts}`,
    email: `crud_${ts}@example.com`,
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
  // Create
  // -----------------------------------------------------------------------
  describe('Create Bug', () => {
    it('creates a bug with all fields and shows it in the list', () => {
      const bugTitle = `CRUD Create Bug ${ts}`;

      cy.contains('New Bug Report').click();
      cy.url().should('include', '/bugs/new');
      cy.get('h1').should('contain', 'New Bug Report');

      // Fill all fields
      cy.get('#title').type(bugTitle);
      cy.get('#description').type('Detailed description for the CRUD create test bug report.');
      cy.get('#severity').select('high');
      cy.get('#status').select('open');
      cy.get('#steps_to_reproduce').type('1. Open app\n2. Click button\n3. See error');
      cy.get('#expected_result').type('Button should work');
      cy.get('#actual_result').type('Button throws error');
      cy.get('#environment').type('Windows 11 / Chrome 121');
      cy.get('#tags').type('crud, test, e2e');

      cy.get('button[type="submit"]').click();

      // Should redirect to bugs list
      cy.url().should('eq', Cypress.config('baseUrl') + '/bugs', { timeout: 10000 });

      // Bug should appear in the list
      cy.contains(bugTitle).should('be.visible');
      cy.contains('High').should('be.visible');
      cy.contains('Open').should('be.visible');
    });

    it('shows "Creating..." text while submitting', () => {
      cy.contains('New Bug Report').click();

      cy.get('#title').type('Submit Loading Test Bug');
      cy.get('#description').type('Testing the submit loading state for creating a bug.');
      cy.get('#severity').select('low');

      cy.intercept('POST', '**/api/bugs/', (req) => {
        req.on('response', (res) => {
          res.setDelay(1000);
        });
      }).as('createBug');

      cy.get('button[type="submit"]').click();
      cy.get('button[type="submit"]').should('contain', 'Creating...');
    });
  });

  // -----------------------------------------------------------------------
  // Read – List
  // -----------------------------------------------------------------------
  describe('Read – Bug List', () => {
    it('displays bug cards with title, description, severity, status, and tags', () => {
      // Create a bug first
      const title = `List Read Bug ${ts}`;
      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('Description for the list read test.');
      cy.get('#severity').select('critical');
      cy.get('#status').select('in_progress');
      cy.get('#tags').type('alpha, beta, gamma');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      // Verify card contents
      cy.contains(title).should('be.visible');
      cy.contains('Critical').should('be.visible');
      cy.contains('In Progress').should('be.visible');
      cy.contains('alpha').should('be.visible');
      cy.contains('beta').should('be.visible');
      cy.contains('gamma').should('be.visible');
    });

    it('shows tags overflow indicator when more than 3 tags', () => {
      const title = `Many Tags Bug ${ts}`;
      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('This bug has many tags to test overflow.');
      cy.get('#tags').type('tag1, tag2, tag3, tag4, tag5');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      // Should show "+2" overflow indicator
      cy.contains(title)
        .closest('.bg-white')
        .within(() => {
          cy.contains('+2').should('be.visible');
        });
    });

    it('shows "Showing X of Y bugs" count', () => {
      cy.contains('Showing').should('be.visible');
      cy.contains(/Showing \d+ of \d+ bugs/).should('exist');
    });
  });

  // -----------------------------------------------------------------------
  // Read – Detail
  // -----------------------------------------------------------------------
  describe('Read – Bug Detail', () => {
    it('displays all bug fields on the detail page', () => {
      const title = `Detail Bug ${ts}`;
      const description = 'Full detail test description content.';
      const steps = '1. First step\n2. Second step';
      const expected = 'Expected: everything works';
      const actual = 'Actual: something broke';
      const env = 'macOS / Firefox 120';

      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type(description);
      cy.get('#severity').select('high');
      cy.get('#status').select('resolved');
      cy.get('#steps_to_reproduce').type(steps);
      cy.get('#expected_result').type(expected);
      cy.get('#actual_result').type(actual);
      cy.get('#environment').type(env);
      cy.get('#tags').type('detail, test');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      // Navigate to detail page
      cy.contains(title).click();

      // Verify all fields
      cy.get('h1').should('contain', title);
      cy.contains(description).should('be.visible');
      cy.contains('High').should('be.visible');
      cy.contains('Resolved').should('be.visible');
      cy.contains('Steps to Reproduce').should('be.visible');
      cy.contains('1. First step').should('be.visible');
      cy.contains('Expected Result').should('be.visible');
      cy.contains(expected).should('be.visible');
      cy.contains('Actual Result').should('be.visible');
      cy.contains(actual).should('be.visible');
      cy.contains('Environment').should('be.visible');
      cy.contains(env).should('be.visible');
      cy.contains('detail').should('be.visible');
      cy.contains('test').should('be.visible');
      cy.contains('Created by:').should('be.visible');
      cy.contains(user.username).should('be.visible');
      cy.contains('Created:').should('be.visible');
      cy.contains('Updated:').should('be.visible');
    });
  });

  // -----------------------------------------------------------------------
  // Update
  // -----------------------------------------------------------------------
  describe('Update Bug', () => {
    it('edits a bug via inline edit and saves changes', () => {
      const title = `Edit Target Bug ${ts}`;
      const updatedTitle = `Updated Bug Title ${ts}`;

      // Create the bug
      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('Original description for editing.');
      cy.get('#severity').select('low');
      cy.get('#status').select('open');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      // Go to detail page
      cy.contains(title).click();
      cy.get('h1').should('contain', title);

      // Click Edit
      cy.contains('button', 'Edit').click();
      cy.get('h1').should('contain', 'Edit Bug Report');

      // Modify fields
      cy.get('#title').clear().type(updatedTitle);
      cy.get('#description').clear().type('Updated description text for the bug.');
      cy.get('#severity').select('critical');
      cy.get('#status').select('closed');

      // Save
      cy.get('button[type="submit"]').click();

      // Should return to view mode with updated values
      cy.get('h1').should('contain', updatedTitle);
      cy.contains('Critical').should('be.visible');
      cy.contains('Closed').should('be.visible');
      cy.contains('Updated description text for the bug.').should('be.visible');
    });

    it('cancels editing and returns to view mode', () => {
      const title = `Cancel Edit Bug ${ts}`;

      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('Description that should not change.');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      cy.contains(title).click();
      cy.contains('button', 'Edit').click();

      // Modify the title but cancel
      cy.get('#title').clear().type('This should not be saved');
      cy.contains('button', 'Cancel').click();

      // Original title should still be showing
      cy.get('h1').should('contain', title);
    });

    it('shows "Saving..." while updating', () => {
      const title = `Save Loading Bug ${ts}`;

      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('Testing save loading state display.');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      cy.contains(title).click();
      cy.contains('button', 'Edit').click();

      cy.intercept('PATCH', '**/api/bugs/**', (req) => {
        req.on('response', (res) => {
          res.setDelay(1000);
        });
      }).as('updateBug');

      cy.get('button[type="submit"]').click();
      cy.get('button[type="submit"]').should('contain', 'Saving...');
    });
  });

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------
  describe('Delete Bug', () => {
    it('deletes a bug from the list page via confirm dialog', () => {
      const title = `Delete From List ${ts}`;

      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('This bug will be deleted from the list.');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      cy.contains(title).should('be.visible');

      // Stub window.confirm to return true
      cy.on('window:confirm', () => true);

      // Click the Delete button on the card
      cy.contains(title)
        .closest('.bg-white')
        .within(() => {
          cy.contains('Delete').click();
        });

      // Bug should no longer be in the list
      cy.contains(title).should('not.exist');
    });

    it('cancels deletion when confirm dialog is dismissed', () => {
      const title = `Cancel Delete ${ts}`;

      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('This bug should survive a cancelled delete.');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      // Stub window.confirm to return false
      cy.on('window:confirm', () => false);

      cy.contains(title)
        .closest('.bg-white')
        .within(() => {
          cy.contains('Delete').click();
        });

      // Bug should still exist
      cy.contains(title).should('be.visible');
    });

    it('deletes a bug from the detail page and redirects to /bugs', () => {
      const title = `Delete From Detail ${ts}`;

      cy.contains('New Bug Report').click();
      cy.get('#title').type(title);
      cy.get('#description').type('This bug will be deleted from the detail page.');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });

      // Navigate to detail
      cy.contains(title).click();
      cy.get('h1').should('contain', title);

      // Stub confirm and delete
      cy.on('window:confirm', () => true);
      cy.contains('button', 'Delete').click();

      // Should redirect to /bugs
      cy.url().should('eq', Cypress.config('baseUrl') + '/bugs', { timeout: 10000 });
      cy.contains(title).should('not.exist');
    });
  });
});
