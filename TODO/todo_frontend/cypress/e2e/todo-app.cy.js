describe('Todo App E2E Tests - Assignment 2', () => {
  beforeEach(() => {
    // Clear all tasks before each test
    cy.clearAllTasks();
    
    // Visit the app and wait for it to load
    cy.waitForTasksToLoad();
    cy.waitForPageLoad();
  });

  describe('Assignment Requirement 1: Add Task and See in List', () => {
    it('should allow user to add a new task and see it in the list', () => {
      const taskText = 'Complete Assignment 2 Testing';
      
      // Add task through UI
      cy.addTask(taskText);
      
      // Wait for page reload (your app does window.location.reload())
      cy.waitForPageLoad();
      
      // Verify task appears in list
      cy.verifyTaskExists(taskText);
      
      // Verify task count is displayed
      cy.get('[data-testid="task-list"] h2').should('contain', 'Your Tasks (1)');
      
      // Verify empty state is no longer visible
      cy.get('[data-testid="empty-state"]').should('not.exist');
    });

    it('should add multiple tasks and display them correctly', () => {
      const tasks = ['First Task', 'Second Task', 'Third Task'];
      
      tasks.forEach((task, index) => {
        cy.addTask(task);
        cy.waitForPageLoad();
        
        // Verify task count increases
        cy.get('[data-testid="task-list"] h2').should('contain', `Your Tasks (${index + 1})`);
      });
      
      // Verify all tasks are visible
      tasks.forEach(task => {
        cy.verifyTaskExists(task);
      });
    });

    it('should add task when pressing Enter key', () => {
      const taskText = 'Task added with Enter key';
      
      cy.get('[data-testid="task-input"]').type(taskText).type('{enter}');
      cy.waitForPageLoad();
      
      cy.verifyTaskExists(taskText);
    });
  });

  describe('Assignment Requirement 2: Mark Task as Complete', () => {
    beforeEach(() => {
      // Add a test task first
      cy.addTaskViaAPI('Task to mark complete');
      cy.visit('/');
      cy.waitForPageLoad();
    });

    it('should allow user to mark a task as complete', () => {
      // Click the circle icon to mark as complete
      cy.get('[data-testid="task-checkbox"]').first().click();
      
      // Verify task is marked as complete
      cy.get('[data-testid="task-item"]').first().should('have.class', 'completed');
      
      // Verify the completed icon is now visible
      cy.get('[data-testid="task-completed-icon"]').should('be.visible');
      
      // Verify task text has strikethrough styling
      cy.get('[data-testid="task-text"]').first().should('have.class', 'through');
      
      // Verify edit button is not available for completed tasks
      cy.get('[data-testid="task-item"]').first().find('[data-testid="edit-task"]').should('not.exist');
    });

    it('should handle multiple task completion correctly', () => {
      // Add more tasks
      cy.addTaskViaAPI('Second Task');
      cy.addTaskViaAPI('Third Task');
      cy.visit('/');
      cy.waitForPageLoad();
      
      // Mark first and third tasks as complete
      cy.get('[data-testid="task-checkbox"]').eq(0).click();
      cy.get('[data-testid="task-checkbox"]').eq(2).click();
      
      // Verify correct tasks are marked complete
      cy.get('[data-testid="task-item"]').eq(0).should('have.class', 'completed');
      cy.get('[data-testid="task-item"]').eq(1).should('not.have.class', 'completed');
      cy.get('[data-testid="task-item"]').eq(2).should('have.class', 'completed');
    });
  });

  describe('Assignment Requirement 3: Delete Task', () => {
    beforeEach(() => {
      // Add test tasks
      cy.addTaskViaAPI('Task to delete');
      cy.addTaskViaAPI('Task to keep');
      cy.visit('/');
      cy.waitForPageLoad();
    });

    it('should allow user to delete a task', () => {
      // Get initial task count
      cy.get('[data-testid="task-item"]').should('have.length', 2);
      
      // Delete first task
      cy.get('[data-testid="delete-task"]').first().click();
      
      // Verify task is removed
      cy.get('[data-testid="task-item"]').should('have.length', 1);
      cy.get('[data-testid="task-list"]').should('not.contain', 'Task to delete');
      cy.get('[data-testid="task-list"]').should('contain', 'Task to keep');
      
      // Verify count is updated
      cy.get('[data-testid="task-list"] h2').should('contain', 'Your Tasks (1)');
    });

    it('should delete all tasks and show empty state', () => {
      // Delete both tasks
      cy.get('[data-testid="delete-task"]').each(($btn) => {
        cy.wrap($btn).click();
      });
      
      // Should return to empty state
      cy.verifyEmptyState();
      cy.get('[data-testid="task-list"]').should('not.exist');
    });

    it('should allow deleting completed tasks', () => {
      // Mark first task as complete
      cy.get('[data-testid="task-checkbox"]').first().click();
      
      // Delete the completed task
      cy.get('[data-testid="task-item"]').first().find('[data-testid="delete-task"]').click();
      
      // Verify only incomplete task remains
      cy.get('[data-testid="task-item"]').should('have.length', 1);
      cy.get('[data-testid="task-list"]').should('contain', 'Task to keep');
      cy.get('[data-testid="task-list"]').should('not.contain', 'Task to delete');
    });
  });

  describe('Assignment Requirement 4: Empty State Message', () => {
    it('should show empty state message when no tasks exist', () => {
      // Verify empty state is displayed
      cy.verifyEmptyState();
      
      // Verify specific empty state content
      cy.get('[data-testid="empty-state"] h3').should('contain', 'No tasks found');
      cy.get('[data-testid="empty-state"] p').should('contain', 'Add your first task above!');
      
      // Verify task list is not present
      cy.get('[data-testid="task-list"]').should('not.exist');
    });

    it('should hide empty state when tasks are added', () => {
      // Initially empty
      cy.verifyEmptyState();
      
      // Add a task
      cy.addTask('First task removes empty state');
      cy.waitForPageLoad();
      
      // Verify empty state is gone and task list appears
      cy.get('[data-testid="empty-state"]').should('not.exist');
      cy.get('[data-testid="task-list"]').should('be.visible');
    });

    it('should return to empty state when all tasks are deleted', () => {
      // Add some tasks first
      cy.addTask('Temporary task 1');
      cy.waitForPageLoad();
      cy.addTask('Temporary task 2');
      cy.waitForPageLoad();
      
      // Verify tasks exist
      cy.get('[data-testid="task-item"]').should('have.length', 2);
      
      // Delete all tasks
      cy.get('[data-testid="delete-task"]').each(($btn) => {
        cy.wrap($btn).click();
      });
      
      // Should return to empty state
      cy.verifyEmptyState();
    });
  });

  describe('Assignment Requirement 5: Negative Test - Empty Task Prevention', () => {
    it('should prevent empty task submissions via disabled button', () => {
      // Button should be disabled when input is empty
      cy.get('[data-testid="task-input"]').should('have.value', '');
      cy.get('[data-testid="add-task-btn"]').should('be.disabled');
      
      // Button should remain disabled with only spaces
      cy.get('[data-testid="task-input"]').type('   ');
      cy.get('[data-testid="add-task-btn"]').should('be.disabled');
      
      // Empty state should still be visible
      cy.verifyEmptyState();
    });

    it('should show error message when attempting to submit empty task', () => {
      // Clear input and force click (simulating edge case)
      cy.get('[data-testid="task-input"]').clear();
      cy.get('[data-testid="add-task-btn"]').click({ force: true });
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Task cannot be empty');
      
      // Should maintain empty state
      cy.verifyEmptyState();
    });

    it('should prevent submission of whitespace-only tasks', () => {
      // Try to add task with only spaces
      cy.get('[data-testid="task-input"]').type('   ');
      cy.get('[data-testid="add-task-btn"]').should('be.disabled');
      
      // Force click to test validation
      cy.get('[data-testid="add-task-btn"]').click({ force: true });
      
      // Should show error and maintain empty state
      cy.get('[data-testid="error-message"]').should('contain', 'Task cannot be empty');
      cy.verifyEmptyState();
    });

    it('should enable button when valid text is entered', () => {
      // Button should enable when valid text is entered
      cy.get('[data-testid="task-input"]').type('Valid task');
      cy.get('[data-testid="add-task-btn"]').should('not.be.disabled');
      
      // Should be able to add the task
      cy.get('[data-testid="add-task-btn"]').click();
      cy.waitForPageLoad();
      
      // Verify task was added
      cy.verifyTaskExists('Valid task');
    });
  });

  describe('Additional Task Management Features', () => {
    beforeEach(() => {
      cy.addTaskViaAPI('Task for editing tests');
      cy.visit('/');
      cy.waitForPageLoad();
    });

    it('should allow editing task text via edit button', () => {
      // Click edit button
      cy.get('[data-testid="edit-task"]').click();
      
      // Edit input should be visible
      cy.get('[data-testid="task-edit-input"]').should('be.visible');
      
      // Update task text
      cy.get('[data-testid="task-edit-input"]').clear().type('Updated task text');
      cy.get('[data-testid="task-edit-input"]').blur();
      
      // Verify task was updated
      cy.get('[data-testid="task-text"]').should('contain', 'Updated task text');
    });

    it('should allow editing task text via double-click', () => {
      // Double-click task text
      cy.get('[data-testid="task-text"]').dblclick();
      
      // Edit input should be visible
      cy.get('[data-testid="task-edit-input"]').should('be.visible');
      
      // Update and press Enter
      cy.get('[data-testid="task-edit-input"]').clear().type('Double-click edited{enter}');
      
      // Verify task was updated
      cy.get('[data-testid="task-text"]').should('contain', 'Double-click edited');
    });

    it('should cancel edit on Escape key', () => {
      const originalText = 'Task for editing tests';
      
      // Start editing
      cy.get('[data-testid="task-text"]').dblclick();
      cy.get('[data-testid="task-edit-input"]').clear().type('Modified text');
      
      // Press Escape
      cy.get('[data-testid="task-edit-input"]').type('{esc}');
      
      // Should revert to original text
      cy.get('[data-testid="task-text"]').should('contain', originalText);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle server errors gracefully', () => {
      // Intercept API call to simulate server error
      cy.intercept('POST', 'http://localhost:5000/add', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('serverError');
      
      cy.get('[data-testid="task-input"]').type('Task that will fail');
      cy.get('[data-testid="add-task-btn"]').click();
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('contain', 'Failed to add task');
    });

    it('should handle special characters in task names', () => {
      const specialTask = 'Task with !@#$%^&*()_+-=[]{}|;:,.<>?';
      
      cy.addTask(specialTask);
      cy.waitForPageLoad();
      
      cy.verifyTaskExists(specialTask);
    });

    it('should handle very long task names', () => {
      const longTask = 'This is a very long task name that should be handled correctly by the application without breaking the UI or causing any issues with the database or frontend display';
      
      cy.addTask(longTask);
      cy.waitForPageLoad();
      
      cy.verifyTaskExists(longTask);
    });
  });
});