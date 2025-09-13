const { 
  validateEmail, 
  calculateTaskCompletionPercentage, 
  validateTaskData,
  formatTaskResponse
} = require('../../utils/validators');

describe('Utility Functions Unit Tests', () => {
  describe('validateEmail', () => {
    test('should return true for valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'first.last123@subdomain.example.com',
        'a@b.co',
        'user123@test-domain.com'
      ];
      
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });
    
    test('should return false for invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        'user@',
        '@domain.com',
        'user@domain',
        'user space@domain.com',
        'user@@domain.com',
        '',
        null,
        undefined,
        123,
        {},
        'user@.com',
        'user@domain.',
        'user..name@domain.com'
      ];
      
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
    
    test('should handle emails with whitespace correctly', () => {
      expect(validateEmail('  test@example.com  ')).toBe(true);
      expect(validateEmail(' user @domain.com ')).toBe(false);
      expect(validateEmail('user@domain.com ')).toBe(true);
    });

    test('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(' ')).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('calculateTaskCompletionPercentage', () => {
    test('should return 0 for empty or invalid inputs', () => {
      expect(calculateTaskCompletionPercentage([])).toBe(0);
      expect(calculateTaskCompletionPercentage(null)).toBe(0);
      expect(calculateTaskCompletionPercentage(undefined)).toBe(0);
      expect(calculateTaskCompletionPercentage('not-array')).toBe(0);
      expect(calculateTaskCompletionPercentage(123)).toBe(0);
    });
    
    test('should calculate correct percentage for mixed tasks', () => {
      const tasks = [
        { _id: '1', task: 'Task 1', done: true },
        { _id: '2', task: 'Task 2', done: false },
        { _id: '3', task: 'Task 3', done: true },
        { _id: '4', task: 'Task 4', done: true }
      ];
      
      expect(calculateTaskCompletionPercentage(tasks)).toBe(75);
    });
    
    test('should return 100 for all completed tasks', () => {
      const tasks = [
        { _id: '1', done: true },
        { _id: '2', done: true },
        { _id: '3', done: true }
      ];
      
      expect(calculateTaskCompletionPercentage(tasks)).toBe(100);
    });
    
    test('should return 0 for all incomplete tasks', () => {
      const tasks = [
        { _id: '1', done: false },
        { _id: '2', done: false }
      ];
      
      expect(calculateTaskCompletionPercentage(tasks)).toBe(0);
    });
    
    test('should handle tasks with missing done property', () => {
      const tasks = [
        { _id: '1', done: true },
        { _id: '2' }, // Missing done property
        { _id: '3', done: false }
      ];
      
      expect(calculateTaskCompletionPercentage(tasks)).toBe(33);
    });
    
    test('should round to nearest integer', () => {
      const tasks = [
        { done: true },
        { done: false },
        { done: false }
      ];
      
      expect(calculateTaskCompletionPercentage(tasks)).toBe(33);
    });

    test('should handle single task scenarios', () => {
      expect(calculateTaskCompletionPercentage([{ done: true }])).toBe(100);
      expect(calculateTaskCompletionPercentage([{ done: false }])).toBe(0);
      expect(calculateTaskCompletionPercentage([{}])).toBe(0);
    });
  });

  describe('validateTaskData', () => {
    test('should validate correct task data', () => {
      const validTask = { task: 'Valid Task Description' };
      
      const result = validateTaskData(validTask);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('should reject empty or missing task', () => {
      const invalidTasks = [
        {},
        { task: '' },
        { task: '   ' },
        { task: null },
        { task: undefined },
        { notTask: 'wrong property' }
      ];
      
      invalidTasks.forEach(taskData => {
        const result = validateTaskData(taskData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Task is required and must be a non-empty string');
      });
    });
    
    test('should reject overly long tasks', () => {
      const longTask = 'a'.repeat(201);
      const result = validateTaskData({ task: longTask });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Task must be less than 200 characters');
    });
    
    test('should handle null or undefined input', () => {
      const nullResult = validateTaskData(null);
      expect(nullResult.isValid).toBe(false);
      expect(nullResult.errors).toContain('Task data is required');
      
      const undefinedResult = validateTaskData(undefined);
      expect(undefinedResult.isValid).toBe(false);
      expect(undefinedResult.errors).toContain('Task data is required');
    });

    test('should accept maximum length tasks', () => {
      const maxTask = 'a'.repeat(200);
      const result = validateTaskData({ task: maxTask });
      expect(result.isValid).toBe(true);
    });
  });

  describe('formatTaskResponse', () => {
    test('should format complete task object correctly', () => {
      const rawTask = {
        _id: '507f1f77bcf86cd799439011',
        task: 'Test Task',
        done: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        __v: 0
      };

      const formatted = formatTaskResponse(rawTask);
      
      expect(formatted).toEqual({
        _id: '507f1f77bcf86cd799439011',
        task: 'Test Task',
        done: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      });
    });

    test('should handle null input', () => {
      expect(formatTaskResponse(null)).toBe(null);
      expect(formatTaskResponse(undefined)).toBe(null);
    });

    test('should set default done value', () => {
      const taskWithoutDone = {
        _id: '123',
        task: 'Test',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const formatted = formatTaskResponse(taskWithoutDone);
      expect(formatted.done).toBe(false);
    });
  });
});