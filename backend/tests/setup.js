const mongoose = require('mongoose');
const config   = require('../src/config/config');

beforeAll(async () => {
  // Connect to a separate test database
  await mongoose.connect(process.env.TEST_MONGODB_URL || 'mongodb://localhost:27017/ecommerce_test');
});

afterEach(async () => {
  // Clean all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});