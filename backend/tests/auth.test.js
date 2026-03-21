const request = require('supertest');
const app     = require('../src/app');

describe('POST /api/v1/auth/register', () => {
  const validUser = {
    email:     'test@example.com',
    password:  'password123',
    full_name: 'Test User',
  };

  it('registers a new user and returns tokens', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.access_token).toBeDefined();
    expect(res.body.data.refresh_token).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
    // Password must never appear in response
    expect(res.body.data.user.hashed_password).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('returns EMAIL_ALREADY_EXISTS on duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app).post('/api/v1/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send({
      email: 'login@example.com', password: 'password123', full_name: 'Login User'
    });
  });

  it('returns tokens on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.access_token).toBeDefined();
  });

  it('returns INVALID_CREDENTIALS on wrong password — not a 404', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    // Must NOT say "user not found" or reveal user existence
    expect(res.body.error.message).not.toContain('not found');
  });

  it('returns INVALID_CREDENTIALS when email does not exist — not a 404', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});