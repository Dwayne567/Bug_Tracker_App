/// <reference types="cypress" />

describe('Filtering, Searching, Sorting & Pagination', () => {
  const ts = Date.now();
  const user = {
    username: `filter_${ts}`,
    email: `filter_${ts}@example.com`,
    password: 'SecurePass123!',
  };

  // Pre-defined bug data
  const bugs = [
    { title: `Alpha Critical Open ${ts}`, severity: 'critical', status: 'open', description: 'Alpha critical open bug.' },
    { title: `Beta Low Resolved ${ts}`, severity: 'low', status: 'resolved', description: 'Beta low resolved bug.' },
    { title: `Gamma High InProgress ${ts}`, severity: 'high', status: 'in_progress', description: 'Gamma high in-progress bug.' },
    { title: `Delta Medium Closed ${ts}`, severity: 'medium', status: 'closed', description: 'Delta medium closed bug.' },
  ];

  before(() => {
    // Register and create bugs via UI
    cy.register(user);

    bugs.forEach((bug) => {
      cy.contains('New Bug Report').click();
      cy.url().should('include', '/bugs/new');
      cy.get('#title').type(bug.title);
      cy.get('#description').type(bug.description);
      cy.get('#severity').select(bug.severity);
      cy.get('#status').select(bug.status);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/bugs', { timeout: 10000 });
    });

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
  // Severity Filter
  // -----------------------------------------------------------------------
  describe('Severity Filter', () => {
    it('filters by critical severity', () => {
      cy.get('#severity').select('critical');

      cy.contains(`Alpha Critical Open ${ts}`).should('be.visible');
      cy.contains(`Beta Low Resolved ${ts}`).should('not.exist');
      cy.contains(`Gamma High InProgress ${ts}`).should('not.exist');
      cy.contains(`Delta Medium Closed ${ts}`).should('not.exist');
    });

    it('resets severity filter to show all bugs', () => {
      cy.get('#severity').select('critical');
      cy.contains(`Beta Low Resolved ${ts}`).should('not.exist');

      cy.get('#severity').select('');
      cy.contains(`Alpha Critical Open ${ts}`).should('be.visible');
      cy.contains(`Beta Low Resolved ${ts}`).should('be.visible');
    });

    it('filters by low severity', () => {
      cy.get('#severity').select('low');

      cy.contains(`Beta Low Resolved ${ts}`).should('be.visible');
      cy.contains(`Alpha Critical Open ${ts}`).should('not.exist');
    });
  });

  // -----------------------------------------------------------------------
  // Status Filter
  // -----------------------------------------------------------------------
  describe('Status Filter', () => {
    it('filters by resolved status', () => {
      cy.get('#status').select('resolved');

      cy.contains(`Beta Low Resolved ${ts}`).should('be.visible');
      cy.contains(`Alpha Critical Open ${ts}`).should('not.exist');
      cy.contains(`Gamma High InProgress ${ts}`).should('not.exist');
    });

    it('filters by open status', () => {
      cy.get('#status').select('open');

      cy.contains(`Alpha Critical Open ${ts}`).should('be.visible');
      cy.contains(`Delta Medium Closed ${ts}`).should('not.exist');
    });

    it('filters by closed status', () => {
      cy.get('#status').select('closed');

      cy.contains(`Delta Medium Closed ${ts}`).should('be.visible');
      cy.contains(`Alpha Critical Open ${ts}`).should('not.exist');
    });

    it('resets status filter to show all bugs', () => {
      cy.get('#status').select('closed');
      cy.contains(`Alpha Critical Open ${ts}`).should('not.exist');

      cy.get('#status').select('');
      cy.contains(`Alpha Critical Open ${ts}`).should('be.visible');
      cy.contains(`Delta Medium Closed ${ts}`).should('be.visible');
    });
  });

  // -----------------------------------------------------------------------
  // Combined Filters
  // -----------------------------------------------------------------------
  describe('Combined Filters', () => {
    it('filters by severity and status together', () => {
      cy.get('#severity').select('low');
      cy.get('#status').select('resolved');

      cy.contains(`Beta Low Resolved ${ts}`).should('be.visible');
      cy.contains(`Alpha Critical Open ${ts}`).should('not.exist');
    });
  });

  // -----------------------------------------------------------------------
  // Search
  // -----------------------------------------------------------------------
  describe('Search', () => {
    it('searches by title text', () => {
      cy.get('#search').type('Alpha Critical');

      cy.contains(`Alpha Critical Open ${ts}`).should('be.visible');
      cy.contains(`Beta Low Resolved ${ts}`).should('not.exist');
    });

    it('clears search to show all bugs', () => {
      cy.get('#search').type('Alpha Critical');
      cy.contains(`Beta Low Resolved ${ts}`).should('not.exist');

      cy.get('#search').clear();
      cy.contains(`Alpha Critical Open ${ts}`).should('be.visible');
      cy.contains(`Beta Low Resolved ${ts}`).should('be.visible');
    });

    it('shows empty state for no matching search', () => {
      cy.get('#search').type('NonExistentBugXYZ999');
      cy.contains('No bug reports found').should('be.visible');
    });
  });

  // -----------------------------------------------------------------------
  // Sort
  // -----------------------------------------------------------------------
  describe('Sort', () => {
    it('sorts by title A-Z', () => {
      cy.get('#ordering').select('title');

      // Alpha should appear before Delta, which appears before Gamma
      cy.get('.bg-white.rounded-lg.shadow-sm.p-4').then(($cards) => {
        const titles = [...$cards].map((card) =>
          card.querySelector('a')?.textContent?.trim() ?? ''
        );
        const filtered = titles.filter((t) => t.includes(String(ts)));
        const sorted = [...filtered].sort();
        expect(filtered).to.deep.equal(sorted);
      });
    });

    it('sorts by title Z-A', () => {
      cy.get('#ordering').select('-title');

      cy.get('.bg-white.rounded-lg.shadow-sm.p-4').then(($cards) => {
        const titles = [...$cards].map((card) =>
          card.querySelector('a')?.textContent?.trim() ?? ''
        );
        const filtered = titles.filter((t) => t.includes(String(ts)));
        const sorted = [...filtered].sort().reverse();
        expect(filtered).to.deep.equal(sorted);
      });
    });

    it('can switch between newest and oldest sort', () => {
      // Default is newest first
      cy.get('#ordering').should('have.value', '-created_at');

      // Switch to oldest first
      cy.get('#ordering').select('created_at');

      // The first created bug should now be first
      cy.get('.bg-white.rounded-lg.shadow-sm.p-4')
        .first()
        .should('contain', `Alpha Critical Open ${ts}`);
    });
  });

  // -----------------------------------------------------------------------
  // Pagination
  // -----------------------------------------------------------------------
  describe('Pagination', () => {
    it('shows Previous and Next buttons', () => {
      cy.contains('button', 'Previous').should('exist');
      cy.contains('button', 'Next').should('exist');
    });

    it('Previous button is disabled on the first page', () => {
      cy.contains('button', 'Previous').should('be.disabled');
    });
  });
});
