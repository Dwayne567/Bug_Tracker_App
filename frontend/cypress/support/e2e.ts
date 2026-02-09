/// <reference types="cypress" />

// ---------------------------------------------------------------------------
// Custom Commands
// ---------------------------------------------------------------------------

const API_URL = Cypress.env('API_URL') || 'http://localhost:8000';

/** Generate a unique test user for this run */
Cypress.Commands.add('generateUser', () => {
  const ts = Date.now();
  return cy.wrap({
    username: `testuser_${ts}`,
    email: `test_${ts}@example.com`,
    password: 'SecurePass123!',
  });
});

/** Register a new user via the UI */
Cypress.Commands.add('register', (user: { username: string; email: string; password: string }) => {
  cy.visit('/register');
  cy.get('#username').type(user.username);
  cy.get('#email').type(user.email);
  cy.get('#password').type(user.password);
  cy.get('#password_confirm').type(user.password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/bugs', { timeout: 10000 });
});

/** Register a user via the API (fast, no UI) and log in via the UI */
Cypress.Commands.add('registerAndLogin', (user: { username: string; email: string; password: string }) => {
  // Register through the API
  cy.request({
    method: 'POST',
    url: `${API_URL}/api/register/`,
    body: {
      username: user.username,
      email: user.email,
      password: user.password,
      password_confirm: user.password,
    },
    failOnStatusCode: false,
  });

  // Log in through the API to get tokens, then store them
  cy.request({
    method: 'POST',
    url: `${API_URL}/api/token/`,
    body: {
      username: user.username,
      password: user.password,
    },
  }).then((resp) => {
    // Store refresh token in cookie (the app stores it there)
    cy.setCookie('refresh_token', resp.body.refresh);
    // Visit the bugs page — the app will restore the session from the refresh token
    cy.visit('/bugs');
    cy.contains('Bug Reports', { timeout: 10000 }).should('be.visible');
  });
});

/** Create a bug via the API (fast, no UI round-trip) */
Cypress.Commands.add(
  'createBugApi',
  (token: string, data: Record<string, unknown>) => {
    return cy.request({
      method: 'POST',
      url: `${API_URL}/api/bugs/`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        title: 'Default Bug Title',
        description: 'Default bug description for testing purposes.',
        severity: 'medium',
        status: 'open',
        steps_to_reproduce: '',
        expected_result: '',
        actual_result: '',
        environment: '',
        tags: [],
        ...data,
      },
    });
  }
);

/** Log in via API and return the access token */
Cypress.Commands.add('loginApi', (username: string, password: string) => {
  return cy.request({
    method: 'POST',
    url: `${API_URL}/api/token/`,
    body: { username, password },
  }).then((resp) => resp.body.access as string);
});

// ---------------------------------------------------------------------------
// Type declarations for custom commands
// ---------------------------------------------------------------------------

declare global {
  namespace Cypress {
    interface Chainable {
      generateUser(): Chainable<{ username: string; email: string; password: string }>;
      register(user: { username: string; email: string; password: string }): Chainable<void>;
      registerAndLogin(user: { username: string; email: string; password: string }): Chainable<void>;
      createBugApi(token: string, data?: Record<string, unknown>): Chainable<Cypress.Response<any>>;
      loginApi(username: string, password: string): Chainable<string>;
    }
  }
}

export {};
