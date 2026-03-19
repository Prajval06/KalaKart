// Reusable helpers so you don't repeat setup in every test file

const request = require('supertest');
const app     = require('../src/app');

// Register a user and return token + user data
const registerUser = async (overrides = {}) => {
  const userData = {
    email:     'test@example.com',
    password:  'password123',
    full_name: 'Test User',
    ...overrides,
  };
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send(userData);
  return {
    user:          res.body.data.user,
    access_token:  res.body.data.access_token,
    refresh_token: res.body.data.refresh_token,
    authHeader:    { Authorization: `Bearer ${res.body.data.access_token}` },
  };
};

// Register an admin user
const registerAdmin = async () => {
  const User = require('../src/models/User.model');
  const { user, access_token, authHeader } = await registerUser({
    email: 'admin@example.com',
    full_name: 'Admin User',
  });
  // Directly set role to admin in DB
  await User.findByIdAndUpdate(user.id, { role: 'admin' });

  // Re-login to get a token with admin role
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@example.com', password: 'password123' });

  return {
    user,
    access_token:  loginRes.body.data.access_token,
    authHeader:    { Authorization: `Bearer ${loginRes.body.data.access_token}` },
  };
};

// Create a test product directly in DB
const createProduct = async (overrides = {}) => {
  const Product  = require('../src/models/Product.model');
  const Category = require('../src/models/Category.model');

  let category = await Category.findOne();
  if (!category) {
    category = await Category.create({ name: 'Electronics', slug: 'electronics' });
  }

  return Product.create({
    name:            'Test Product',
    slug:            'test-product',
    description:     'A test product',
    price:           99900,       // 999 rupees in paise
    images:          ['https://example.com/image.jpg'],
    category_id:     category._id,
    inventory_count: 10,
    is_active:       true,
    ...overrides,
  });
};

module.exports = { registerUser, registerAdmin, createProduct };