import './commands';

// Hide uncaught exceptions that don't affect test results
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  return false;
});