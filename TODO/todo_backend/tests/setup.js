const mongoose = require('mongoose');

beforeAll(async () => {
  try {
    // Connect to test database
    const mongoUri = 'mongodb://127.0.0.1:27017/TODO-test';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to Test MongoDB');
  } catch (error) {
    console.error('Test MongoDB setup failed:', error);
    throw error;
  }
}, 30000);

afterAll(async () => {
  try {
    // Drop test database and close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    console.log('Test MongoDB stopped');
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
}, 30000);

beforeEach(async () => {
  try {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error('Test data cleanup failed:', error);
  }
});