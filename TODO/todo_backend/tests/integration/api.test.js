const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');

describe('Todo API Integration Tests', () => {
  let createdTaskId;

  describe('POST /add', () => {
    test('should create a new task successfully', async () => {
      const taskData = { task: 'Integration Test Task' };

      const response = await request(app)
        .post('/add')
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.task).toBe(taskData.task);
      expect(response.body.done).toBe(false);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      createdTaskId = response.body._id;
    });

    test('should reject empty task', async () => {
      const invalidTask = { task: '' };

      const response = await request(app)
        .post('/add')
        .send(invalidTask)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task is required');
    });

    test('should reject missing task property', async () => {
      const invalidTask = { description: 'No task property' };

      await request(app)
        .post('/add')
        .send(invalidTask)
        .expect(400);
    });

    test('should trim whitespace from task', async () => {
      const taskData = { task: '  Whitespace Task  ' };

      const response = await request(app)
        .post('/add')
        .send(taskData)
        .expect(201);

      expect(response.body.task).toBe('Whitespace Task');
    });

    test('should handle server error gracefully', async () => {
      const taskData = { task: 'Test Task' };
      
      // Mock mongoose to throw an error
      const originalCreate = mongoose.Model.prototype.save;
      mongoose.Model.prototype.save = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/add')
        .send(taskData)
        .expect(500);

      expect(response.body.error).toBe('Failed to create task');
      
      // Restore original method
      mongoose.Model.prototype.save = originalCreate;
    });
  });

  describe('GET /get', () => {
    beforeEach(async () => {
      await request(app).post('/add').send({ task: 'First Task' });
      await request(app).post('/add').send({ task: 'Second Task' });
    });

    test('should return all tasks', async () => {
      const response = await request(app)
        .get('/get')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      response.body.forEach(task => {
        expect(task).toHaveProperty('_id');
        expect(task).toHaveProperty('task');
        expect(task).toHaveProperty('done');
        expect(task).toHaveProperty('createdAt');
        expect(task).toHaveProperty('updatedAt');
      });
    });

    test('should return empty array when no tasks exist', async () => {
      const collections = mongoose.connection.collections;
      await collections.tasks.deleteMany({});

      const response = await request(app)
        .get('/get')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('PUT /edit/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/add')
        .send({ task: 'Task to Mark Done' });
      createdTaskId = response.body._id;
    });

    test('should mark task as done successfully', async () => {
      const response = await request(app)
        .put(`/edit/${createdTaskId}`)
        .expect(200);

      expect(response.body.done).toBe(true);
      expect(response.body.task).toBe('Task to Mark Done');
      expect(response.body._id).toBe(createdTaskId);
    });

    test('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/edit/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    test('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .put('/edit/invalid-id')
        .expect(400);

      expect(response.body.error).toBe('Invalid task ID');
    });
  });

  describe('PUT /update/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/add')
        .send({ task: 'Original Task Text' });
      createdTaskId = response.body._id;
    });

    test('should update task text successfully', async () => {
      const updateData = { task: 'Updated Task Text' };

      const response = await request(app)
        .put(`/update/${createdTaskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.task).toBe('Updated Task Text');
      expect(response.body._id).toBe(createdTaskId);
    });

    test('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .put(`/update/${fakeId}`)
        .send({ task: 'New text' })
        .expect(404);
    });

    test('should return 400 for empty task update', async () => {
      await request(app)
        .put(`/update/${createdTaskId}`)
        .send({ task: '' })
        .expect(400);
    });

    test('should return 400 for invalid ObjectId', async () => {
      await request(app)
        .put('/update/invalid-id')
        .send({ task: 'New text' })
        .expect(400);
    });

    test('should trim whitespace from updated task', async () => {
      const updateData = { task: '  Updated with spaces  ' };

      const response = await request(app)
        .put(`/update/${createdTaskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.task).toBe('Updated with spaces');
    });
  });

  describe('DELETE /delete/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/add')
        .send({ task: 'Task to Delete' });
      createdTaskId = response.body._id;
    });

    test('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/delete/${createdTaskId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Task deleted successfully');
      expect(response.body).toHaveProperty('deletedTask');
      expect(response.body.deletedTask.task).toBe('Task to Delete');

      const getResponse = await request(app).get('/get');
      expect(getResponse.body.find(t => t._id === createdTaskId)).toBeUndefined();
    });

    test('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/delete/${fakeId}`)
        .expect(404);
    });

    test('should return 400 for invalid ObjectId', async () => {
      await request(app)
        .delete('/delete/invalid-id')
        .expect(400);
    });
  });

  describe('GET /health', () => {
    test('should return server health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
    });
  });
});