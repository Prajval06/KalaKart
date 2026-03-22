const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Set test environment variables before anything else loads
process.env.JWT_SECRET          = 'test-secret-key-for-jest';
process.env.JWT_EXPIRE_MINUTES  = '30';
process.env.REFRESH_EXPIRE_DAYS = '7';
process.env.STRIPE_SECRET_KEY   = 'sk_test_placeholder';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_placeholder';
process.env.NODE_ENV            = 'test';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 60000);