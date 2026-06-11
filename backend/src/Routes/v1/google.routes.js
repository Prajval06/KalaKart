/**
 * Google OAuth Routes
 * ──────────────────────────────────────────────────────────────────────────────
 * GET  /api/v1/auth/google            → redirects user to Google consent screen
 * GET  /api/v1/auth/google/callback   → Google redirects back here with ?code=
 * GET  /api/v1/auth/me                → returns session info from JWT (protected)
 *
 * Flow (Phase 2 — secure, no token in URL):
 *  1. Browser visits /auth/google → server redirects to Google with client_id etc.
 *  2. User consents on Google → Google redirects to /auth/google/callback?code=XXX
 *  3. Server exchanges code for Google access_token via POST to Google token endpoint
 *  4. Server uses Google access_token to GET user profile from Google
 *  5. Server finds/creates MongoDB user
 *  6. Server creates a refresh Session, sets kk_refresh HttpOnly cookie
 *  7. Server redirects to /auth-success with ONLY role + name params (no JWT)
 */

const router  = require('express').Router();
const axios   = require('axios');
const jwt     = require('jsonwebtoken');
const User    = require('../../models/user.model');
const Session = require('../../models/session.model');
const config  = require('../../config/config');
const { sendWelcomeEmail } = require('../../services/email.service');

// Shared cookie options — mirrors auth.controller.js for consistency
const REFRESH_COOKIE = 'kk_refresh';
const refreshCookieOptions = {
  httpOnly: true,
  secure:   config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge:   config.refreshExpireDays * 24 * 60 * 60 * 1000,
};

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
  
  if (config.nodeEnv === 'development') {
    console.log('--- GOOGLE REDIRECT DEBUG ---');
    console.log('Client ID:', config.googleClientId);
    console.log('State intent:', state);
    console.log('Redirecting to Google...');
  }
  
  res.redirect(redirectUrl);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /google/callback  →  Exchange code → user info → Session cookie → redirect
// Phase 2: JWT is NEVER placed in the redirect URL. Only the HttpOnly cookie
//          carries the refresh token. The redirect URL carries only non-sensitive
//          UX params: `role` (for routing) and `name` (for greeting).
// ─────────────────────────────────────────────────────────────────────────────
router.get('/google/callback', async (req, res) => {
  const { code, state, error: oauthError } = req.query;

  // Google returned an error (e.g. user denied consent)
  if (oauthError || !code) {
    return res.redirect(`${config.frontendUrl}/auth?error=google_auth_denied`);
  }

  try {
    // ── Step 1: Exchange authorization code for Google access token ───────────
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
    const { access_token: googleAccessToken } = tokenRes.data;

    // ── Step 2: Fetch Google user profile ─────────────────────────────────────
    const profileRes = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${googleAccessToken}` } }
    );
    const { id: googleId, email, name, picture: profileImage } = profileRes.data;

    // ── Step 3: Find or create user in MongoDB ────────────────────────────────
    let user = await User.findOne({ googleId });

    if (user) {
      // Returning Google user — refresh image; upgrade role if signing in as seller
      user.profileImage = profileImage;
      if (state === 'seller' && user.role !== 'admin') {
        user.role = 'admin';
      }
      await user.save();
    } else {
      // Check if email already exists via email/password sign-up
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        // Link Google account to existing email account
        user.googleId     = googleId;
        user.profileImage = user.profileImage || profileImage;
        user.authMethod   = 'google';
        if (state === 'seller' && user.role !== 'admin') {
          user.role = 'admin';
        }
        await user.save();
      } else {
        // Create new account
        user = await User.create({
          googleId,
          email:        email.toLowerCase(),
          full_name:    name,
          profileImage,
          authMethod:   'google',
          role:         state === 'seller' ? 'admin' : 'customer',
        });

        try {
          await sendWelcomeEmail(user, 'google');
        } catch (emailErr) {
          console.warn('AUTH EMAIL — Google welcome email failed:', emailErr.message);
        }
      }
    }

    // ── Step 4: Create server-side refresh session ────────────────────────────
    // Mirrors the session creation in auth.service.js login/register
    const refresh_token = jwt.sign(
      { sub: user._id, type: 'refresh' },
      config.jwtSecret,
      { expiresIn: `${config.refreshExpireDays}d` }
    );

    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + config.refreshExpireDays);

    await Session.create({
      user_id:    user._id,
      refresh_token,
      expires_at: sessionExpiresAt,
    });

    // ── Step 5: Set kk_refresh HttpOnly cookie ────────────────────────────────
    // The refresh token lives in the cookie only — never in the URL or body.
    res.cookie(REFRESH_COOKIE, refresh_token, refreshCookieOptions);

    // ── Step 6: Redirect to /auth-success WITHOUT any token in the URL ────────
    // Only non-sensitive UX context is passed: `role` for routing, `name` for greeting.
    const redirectRole = state || (user.role === 'admin' ? 'seller' : 'buyer');
    const redirectUrl  = new URL(`${config.frontendUrl}/auth-success`);
    redirectUrl.searchParams.set('role', redirectRole);
    redirectUrl.searchParams.set('name', encodeURIComponent(user.full_name || name));

    if (config.nodeEnv === 'development') {
      console.log(`[Google Auth] ✓ Session created for ${email}. Role: ${user.role}, Intent: ${state || 'none'}`);
      console.log(`[Google Auth] ✓ kk_refresh cookie set. Redirecting without token in URL.`);
    }

    return res.redirect(redirectUrl.toString());

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
