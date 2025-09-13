/**
 * Validates email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const validateEmail = (email) => {
  if (email === null || email === undefined || typeof email !== 'string') {
    return false;
  }
  
  const trimmedEmail = email.trim();
  if (trimmedEmail === '') {
    return false;
  }
  
  // Must contain exactly one @ symbol
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount !== 1) {
    return false;
  }
  
  const [localPart, domainPart] = trimmedEmail.split('@');
  
  if (!localPart || !domainPart || localPart.length === 0 || domainPart.length === 0) {
    return false;
  }
  
  if (trimmedEmail.includes(' ') || trimmedEmail.includes('..')) {
    return false;
  }
  
  if (localPart.startsWith('.') || localPart.endsWith('.') || 
      domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return false;
  }
  
  const domainDots = (domainPart.match(/\./g) || []).length;
  if (domainDots === 0) {
    return false;
  }
  
  const validLocalChars = /^[a-zA-Z0-9._+-]+$/;
  const validDomainChars = /^[a-zA-Z0-9.-]+$/;
  
  if (!validLocalChars.test(localPart) || !validDomainChars.test(domainPart)) {
    return false;
  }
  
  const parts = domainPart.split('.');
  const lastPart = parts[parts.length - 1];
  if (!lastPart || lastPart.length < 2) {
    return false;
  }
  
  return true;
};

/**
 * Calculates percentage of completed tasks
 * @param {Array} tasks - Array of task objects with done property
 * @returns {number} - Percentage of completed tasks (0-100)
 */
const calculateTaskCompletionPercentage = (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return 0;
  }
  
  const completedTasks = tasks.filter(task => task && task.done === true).length;
  return Math.round((completedTasks / tasks.length) * 100);
};

/**
 * Validates task data before creation
 * @param {Object} taskData - Task object to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateTaskData = (taskData) => {
  const errors = [];
  
  if (!taskData) {
    return { isValid: false, errors: ['Task data is required'] };
  }
  
  if (!taskData.task || typeof taskData.task !== 'string' || taskData.task.trim() === '') {
    errors.push('Task is required and must be a non-empty string');
  }
  
  if (taskData.task && taskData.task.length > 200) {
    errors.push('Task must be less than 200 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formats task response for consistency
 * @param {Object} task - Raw task object from database
 * @returns {Object} - Formatted task object
 */
const formatTaskResponse = (task) => {
  if (!task) return null;
  
  return {
    _id: task._id,
    task: task.task,
    done: task.done || false,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
};

module.exports = {
  validateEmail,
  calculateTaskCompletionPercentage,
  validateTaskData,
  formatTaskResponse
};