/**
 * Google OAuth Routes
 * ──────────────────────────────────────────────────────────────────────────────
 * GET  /api/v1/auth/google            → redirects user to Google consent screen
 * GET  /api/v1/auth/google/callback   → Google redirects back here with ?code=
 * GET  /api/v1/auth/me                → returns session info from JWT (protected)
 *
 * Flow:
 *  1. Browser visits /auth/google → server redirects to Google with client_id etc.
 *  2. User consents on Google → Google redirects to /auth/google/callback?code=XXX
 *  3. Server exchanges code for access_token via POST to Google token endpoint
 *  4. Server uses access_token to GET user profile from Google
 *  5. Server finds/creates MongoDB user, issues JWT, redirects to frontend
 */

const router  = require('express').Router();
const axios   = require('axios');
const jwt     = require('jsonwebtoken');
const User    = require('../../models/user.model');
const config  = require('../../config/config');

// ─────────────────────────────────────────────────────────────────────────────
// GET /google  →  Redirect to Google consent screen
// ─────────────────────────────────────────────────────────────────────────────
router.get('/google', (req, res) => {
  const { state } = req.query; // e.g. 'seller' or 'buyer'

  const params = new URLSearchParams({
    client_id:     config.googleClientId,
    redirect_uri:  config.googleCallbackUrl,
    response_type: 'code',
    scope:         'openid profile email',
    access_type:   'offline',
    prompt:        'consent',
  });
  
  if (state) {
    params.append('state', state);
  }

  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log('--- GOOGLE REDIRECT DEBUG ---');
  console.log('Client ID loaded:', config.googleClientId);
  console.log('Requested state:', state);
  console.log('Redirecting to:', redirectUrl);
  console.log('-----------------------------');
  res.redirect(redirectUrl);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /google/callback  →  Exchange code → token → user info → JWT → redirect
// ─────────────────────────────────────────────────────────────────────────────
router.get('/google/callback', async (req, res) => {
  const { code, state, error: oauthError } = req.query;

  // Google returned an error (e.g. user denied consent)
  if (oauthError || !code) {
    return res.redirect(`${config.frontendUrl}/auth?error=google_auth_denied`);
  }

  try {
    // ── Step 1: Exchange code for tokens ──────────────────────────────────────
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id:     config.googleClientId,
        client_secret: config.googleClientSecret,
        code,
        grant_type:    'authorization_code',
        redirect_uri:  config.googleCallbackUrl,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const { access_token } = tokenRes.data;

    // ── Step 2: Fetch Google user profile ─────────────────────────────────────
    const profileRes = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const { id: googleId, email, name, picture: profileImage } = profileRes.data;

    // ── Step 3: Find or create user in MongoDB ────────────────────────────────
    let user = await User.findOne({ googleId });

    if (user) {
      // Returning Google user — refresh their profile image and assign new role if requested
      user.profileImage = profileImage;
      if (state === 'seller' && user.role !== 'admin') {
        user.role = 'admin'; // upgrade to seller
      }
      await user.save();
    } else {
      // Check if someone already signed up with the same email via email/password
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        // Link the Google account to the existing email account
        user.googleId     = googleId;
        user.profileImage = user.profileImage || profileImage;
        user.authMethod   = 'google';
        if (state === 'seller' && user.role !== 'admin') {
          user.role = 'admin'; // upgrade to seller
        }
        await user.save();
      } else {
        // Brand new user — create account
        user = await User.create({
          googleId,
          email,
          full_name:   name,
          profileImage,
          authMethod:  'google',
          role:        state === 'seller' ? 'admin' : 'customer',
          // hashed_password intentionally omitted — Google users don't need one
        });
      }
    }

    // ── Step 4: Issue JWT (same format as email login) ────────────────────────
    const access_token_jwt = jwt.sign(
      { sub: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: `${config.jwtExpireMinutes}m` }
    );

    // Include a longer-lived token for frontend persistence (7 days)
    const session_token = jwt.sign(
      { sub: user._id, role: user.role, type: 'session' },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // ── Step 5: Send user data + token to frontend via redirect ───────────────
    const userData = JSON.stringify({
      id:           user._id,
      name:         user.full_name,
      email:        user.email,
      photoURL:     user.profileImage,
      userType:     user.role === 'admin' ? 'seller' : 'buyer',
    });

    const redirectUrl = `${config.frontendUrl}/auth-success` +
      `?token=${session_token}` +
      `&user=${encodeURIComponent(userData)}`;

    return res.redirect(redirectUrl);

  } catch (err) {
    console.error('Google OAuth callback error:', err.response?.data || err.message);
    return res.redirect(`${config.frontendUrl}/auth?error=google_auth_failed`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /me  →  Verify JWT and return current user (used by frontend on load)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user    = await User.findById(decoded.sub);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.json({
      id:       user._id,
      name:     user.full_name,
      email:    user.email,
      photoURL: user.profileImage,
      userType: user.role === 'admin' ? 'seller' : 'buyer',
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
