const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TaskModel = require('./models/Todo');

const app = express();
app.use(cors());
app.use(express.json());

// Only connect to MongoDB and start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect('mongodb://127.0.0.1:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('MongoDB connected');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
  });
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Get all tasks
app.get('/get', async (req, res) => {
  try {
    const tasks = await TaskModel.find({});
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Add new task
app.post('/add', async (req, res) => {
  try {
    const { task } = req.body;
    
    if (!task || task.trim() === '') {
      return res.status(400).json({ error: 'Task is required' });
    }

    const newTask = new TaskModel({
      task: task.trim()
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Mark task as done
app.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      id,
      { done: true },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Update task text
app.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { task } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    if (!task || task.trim() === '') {
      return res.status(400).json({ error: 'Task is required' });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      id,
      { task: task.trim() },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
app.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const deletedTask = await TaskModel.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      message: 'Task deleted successfully',
      deletedTask
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = app;