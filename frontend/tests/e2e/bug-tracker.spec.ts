import { test, expect } from '@playwright/test';

// Generate unique user credentials for each test run
const timestamp = Date.now();
const testUser = {
  username: `testuser_${timestamp}`,
  email: `test_${timestamp}@example.com`,
  password: 'SecurePass123!',
};

test.describe('Bug Tracker E2E', () => {
  test('full user flow: register, login, create bug, view in list', async ({ page }) => {
    // 1. Go to the homepage
    await page.goto('/');
    
    // Verify we're on the landing page
    await expect(page.getByRole('heading', { name: 'Bug Tracker' })).toBeVisible();
    
    // 2. Navigate to register page
    await page.click('text=Create Account');
    await expect(page).toHaveURL('/register');
    
    // 3. Fill in registration form
    await page.fill('#username', testUser.username);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#password_confirm', testUser.password);
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // 4. Should be redirected to bugs list after registration
    await expect(page).toHaveURL('/bugs', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Bug Reports' })).toBeVisible();
    
    // 5. Click on "New Bug Report" button
    await page.click('text=New Bug Report');
    await expect(page).toHaveURL('/bugs/new');
    
    // 6. Fill in bug report form
    const bugTitle = `Test Bug ${timestamp}`;
    const bugDescription = 'This is an automated test bug created by Playwright E2E test.';
    
    await page.fill('#title', bugTitle);
    await page.fill('#description', bugDescription);
    await page.selectOption('#severity', 'high');
    await page.selectOption('#status', 'open');
    await page.fill('#steps_to_reproduce', '1. Run E2E test\n2. Verify bug creation');
    await page.fill('#expected_result', 'Bug should be created successfully');
    await page.fill('#actual_result', 'Testing actual result');
    await page.fill('#environment', 'Playwright Test Environment');
    await page.fill('#tags', 'e2e, test, automated');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // 7. Should be redirected back to bugs list
    await expect(page).toHaveURL('/bugs', { timeout: 10000 });
    
    // 8. Verify the bug appears in the list
    await expect(page.getByText(bugTitle)).toBeVisible();
    await expect(page.getByText('High')).toBeVisible();
    await expect(page.getByText('Open')).toBeVisible();
    
    // 9. Click on the bug to view details
    await page.click(`text=${bugTitle}`);
    
    // 10. Verify we're on the bug detail page
    await expect(page.getByRole('heading', { name: bugTitle })).toBeVisible();
    await expect(page.getByText(bugDescription)).toBeVisible();
    await expect(page.getByText('e2e')).toBeVisible();
    await expect(page.getByText('test')).toBeVisible();
    await expect(page.getByText('automated')).toBeVisible();
    
    // 11. Sign out
    await page.click('text=Sign out');
    
    // Should be redirected to login page
    await expect(page).toHaveURL('/login');
  });

  test('login with existing user and view bugs', async ({ page }) => {
    // First register a new user
    await page.goto('/register');
    
    const loginUser = {
      username: `logintest_${timestamp}`,
      email: `logintest_${timestamp}@example.com`,
      password: 'SecurePass123!',
    };
    
    await page.fill('#username', loginUser.username);
    await page.fill('#email', loginUser.email);
    await page.fill('#password', loginUser.password);
    await page.fill('#password_confirm', loginUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to bugs page
    await expect(page).toHaveURL('/bugs', { timeout: 10000 });
    
    // Sign out
    await page.click('text=Sign out');
    await expect(page).toHaveURL('/login');
    
    // Now login with the same user
    await page.fill('#username', loginUser.username);
    await page.fill('#password', loginUser.password);
    await page.click('button[type="submit"]');
    
    // Should be on bugs page
    await expect(page).toHaveURL('/bugs', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Bug Reports' })).toBeVisible();
  });

  test('search and filter bugs', async ({ page }) => {
    // Register and create some bugs
    await page.goto('/register');
    
    const filterUser = {
      username: `filtertest_${timestamp}`,
      email: `filtertest_${timestamp}@example.com`,
      password: 'SecurePass123!',
    };
    
    await page.fill('#username', filterUser.username);
    await page.fill('#email', filterUser.email);
    await page.fill('#password', filterUser.password);
    await page.fill('#password_confirm', filterUser.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/bugs', { timeout: 10000 });
    
    // Create a critical bug
    await page.click('text=New Bug Report');
    await page.fill('#title', `Critical Bug ${timestamp}`);
    await page.fill('#description', 'This is a critical severity bug.');
    await page.selectOption('#severity', 'critical');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/bugs', { timeout: 10000 });
    
    // Create a low bug
    await page.click('text=New Bug Report');
    await page.fill('#title', `Low Bug ${timestamp}`);
    await page.fill('#description', 'This is a low severity bug.');
    await page.selectOption('#severity', 'low');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/bugs', { timeout: 10000 });
    
    // Both bugs should be visible
    await expect(page.getByText(`Critical Bug ${timestamp}`)).toBeVisible();
    await expect(page.getByText(`Low Bug ${timestamp}`)).toBeVisible();
    
    // Filter by critical severity
    await page.selectOption('#severity', 'critical');
    
    // Only critical bug should be visible
    await expect(page.getByText(`Critical Bug ${timestamp}`)).toBeVisible();
    await expect(page.getByText(`Low Bug ${timestamp}`)).not.toBeVisible();
    
    // Clear filter
    await page.selectOption('#severity', '');
    
    // Both bugs should be visible again
    await expect(page.getByText(`Critical Bug ${timestamp}`)).toBeVisible();
    await expect(page.getByText(`Low Bug ${timestamp}`)).toBeVisible();
    
    // Search for "Critical"
    await page.fill('#search', 'Critical');
    
    // Only critical bug should be visible
    await expect(page.getByText(`Critical Bug ${timestamp}`)).toBeVisible();
  });
});
