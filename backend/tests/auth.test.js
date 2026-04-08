const request = require('supertest');
const crypto  = require('crypto');
const app     = require('../src/app');
const User    = require('../src/models/user.model');

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
      email: 'login@example.com', password: 'password123', full_name: 'Login User',
    });
  });

  it('returns tokens on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.data.access_token).toBeDefined();
  });

  it('returns INVALID_CREDENTIALS on wrong password - not a 404', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(res.body.error.message).not.toContain('not found');
  });

  it('returns INVALID_CREDENTIALS when email does not exist - not a 404', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('POST /api/v1/auth/forgot-password and reset-password', () => {
  it('accepts a forgot-password request and returns a generic success message', async () => {
    await request(app).post('/api/v1/auth/register').send({
      email: 'reset-request@example.com',
      password: 'password123',
      full_name: 'Reset Request User',
    });

    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'reset-request@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('reset link has been sent');
  });

  it('resets the password when a valid reset token is provided', async () => {
    const originalPassword = 'password123';
    const nextPassword = 'newpassword456';
    const resetToken = 'test-reset-token-1234567890';
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    await request(app).post('/api/v1/auth/register').send({
      email: 'reset-complete@example.com',
      password: originalPassword,
      full_name: 'Reset Complete User',
    });

    const user = await User.findOne({ email: 'reset-complete@example.com' });
    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: resetToken, new_password: nextPassword });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'reset-complete@example.com', password: nextPassword });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.access_token).toBeDefined();

    const oldLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'reset-complete@example.com', password: originalPassword });
    expect(oldLoginRes.status).toBe(401);
    expect(oldLoginRes.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
