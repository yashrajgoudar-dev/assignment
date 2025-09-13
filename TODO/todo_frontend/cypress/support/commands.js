// Custom commands for your Todo App

Cypress.Commands.add('clearAllTasks', () => {
  // Clear all existing tasks via API
  cy.request({
    method: 'GET',
    url: 'http://localhost:5000/get',
    failOnStatusCode: false
  }).then((response) => {
    if (response.body && Array.isArray(response.body) && response.body.length > 0) {
      response.body.forEach((task) => {
        cy.request({
          method: 'DELETE',
          url: `http://localhost:5000/delete/${task._id}`,
          failOnStatusCode: false
        });
      });
    }
  });
});

Cypress.Commands.add('addTaskViaAPI', (taskText) => {
  return cy.request('POST', 'http://localhost:5000/add', {
    task: taskText
  });
});

Cypress.Commands.add('waitForTasksToLoad', () => {
  // Wait for tasks to load by intercepting the API call
  cy.intercept('GET', 'http://localhost:5000/get').as('getTasks');
  cy.visit('/');
  cy.wait('@getTasks');
});

Cypress.Commands.add('addTask', (taskText) => {
  cy.get('[data-testid="task-input"]').clear().type(taskText);
  cy.get('[data-testid="add-task-btn"]').click();
});

Cypress.Commands.add('verifyTaskExists', (taskText) => {
  cy.get('[data-testid="task-list"]').should('contain', taskText);
  cy.get('[data-testid="task-item"]').contains(taskText).should('be.visible');
});

Cypress.Commands.add('verifyEmptyState', () => {
  cy.get('[data-testid="empty-state"]').should('be.visible');
  cy.get('[data-testid="empty-state"]').should('contain', 'No tasks found');
});

Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="app-title"]').should('be.visible');
});