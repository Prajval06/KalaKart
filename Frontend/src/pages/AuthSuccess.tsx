/**
 * AuthSuccess Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Google OAuth redirects the user to /auth-success?token=JWT&user=JSON after
 * a successful login. This page:
 *  1. Reads the token and user data from URL search params
 *  2. Saves them into localStorage (keys: kk_token, kk_user)
 *  3. Updates the AppContext so the navbar/rest of the app reflects login
 *  4. Redirects the user to the homepage (or wherever they came from)
 *
 * On error, it reads ?error= from the URL and redirects to /auth with the error.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AuthSuccess() {
  const [searchParams]            = useSearchParams();
  const navigate                  = useNavigate();
  const { loginWithGoogleToken }  = useAppContext();
  const [status, setStatus]       = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage]     = useState('Processing your login…');

  useEffect(() => {
    const token     = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error     = searchParams.get('error');

    // ── Error from Google / backend ───────────────────────────────────────────
    if (error) {
      setStatus('error');
      const msg = error === 'google_auth_denied'
        ? 'You declined Google sign-in.'
        : 'Google authentication failed. Please try again.';
      setMessage(msg);
      setTimeout(() => navigate(`/auth?error=${encodeURIComponent(msg)}`, { replace: true }), 2500);
      return;
    }

    // ── No token — shouldn't happen, but guard anyway ─────────────────────────
    if (!token || !userParam) {
      navigate('/auth', { replace: true });
      return;
    }

    // ── Parse user ────────────────────────────────────────────────────────────
    try {
      const user = JSON.parse(decodeURIComponent(userParam));

      // Persist token and user into localStorage + update AppContext
      loginWithGoogleToken(token, {
        email:    user.email,
        name:     user.name,
        photoURL: user.photoURL,
        userType: user.userType ?? 'buyer',
      });

      setStatus('success');
      setMessage(`Welcome back, ${user.name}! Redirecting…`);

      // Give the user a moment to see the success state
      setTimeout(() => {
        navigate(user.userType === 'seller' ? '/seller-dashboard' : '/', { replace: true });
      }, 1200);
    } catch {
      navigate('/auth?error=google_auth_failed', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFF8E7 50%, #F0E6D3 100%)' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-6 max-w-sm w-full"
        style={{ border: '4px solid #8B2500' }}
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-14 h-14 animate-spin" style={{ color: '#8B2500' }} />
            <p className="text-[#4A2C2A] font-serif text-lg text-center">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14" style={{ color: '#2E8B57' }} />
            <p className="text-[#2E8B57] font-serif text-lg font-semibold text-center">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14" style={{ color: '#C03030' }} />
            <p className="text-[#C03030] font-serif text-lg font-semibold text-center">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
