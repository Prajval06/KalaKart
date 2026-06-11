/**
 * AuthSuccess Page  (Sprint 1B Phase 2)
 * ─────────────────────────────────────────────────────────────────────────────
 * Google OAuth now redirects to /auth-success?role=buyer|seller&name=...
 * WITHOUT a token in the URL. The kk_refresh HttpOnly cookie was already set
 * by the backend callback.
 *
 * This page:
 *  1. Reads `?role` (for routing) and `?name` (for greeting) — non-sensitive only
 *  2. Calls POST /auth/refresh via the kk_refresh cookie to obtain an access token
 *  3. Calls GET /users/me with the access token to retrieve full user data
 *  4. Updates AppContext (loginWithGoogleToken) so the app reflects login
 *  5. Redirects the user to the correct dashboard
 *
 * On error from Google/backend it reads ?error= and redirects to /auth.
 *
 * Phase 2 invariant: no JWT ever appears in the URL / browser history.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { authAPI, api, setAccessToken, getErrorMessage } from '../utils/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AuthSuccess() {
  const [searchParams]           = useSearchParams();
  const navigate                 = useNavigate();
  const { loginWithGoogleToken } = useAppContext();
  const [status, setStatus]      = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage]    = useState('Processing your login…');

  useEffect(() => {
    const role  = searchParams.get('role') as 'buyer' | 'seller' | null;
    const name  = searchParams.get('name') ? decodeURIComponent(searchParams.get('name')!) : '';
    const error = searchParams.get('error');

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

    // ── Bootstrap auth from kk_refresh cookie ─────────────────────────────────
    // Call /auth/refresh — the browser automatically sends the HttpOnly cookie.
    // This is safe: no token is read from the URL.
    (async () => {
      try {
        // Step 1: Exchange cookie → access token
        const refreshRes = await authAPI.refresh();
        const accessToken: string = refreshRes.data?.data?.access_token;

        if (!accessToken) {
          throw new Error('No access token returned from refresh');
        }

        // Step 2: Fetch full user profile.
        // We set the memory token first so the Axios interceptor injects it automatically.
        setAccessToken(accessToken);
        const meRes = await api.get('/users/me');
        const userData = meRes.data?.data?.user || meRes.data?.data;

        const resolvedUserType = role || (userData?.role === 'artisan' ? 'seller' : 'buyer');
        const displayName      = name || userData?.full_name || 'there';

        // Step 3: Persist into AppContext (reuse existing loginWithGoogleToken)
        loginWithGoogleToken(accessToken, {
          email:    userData?.email    || '',
          name:     userData?.full_name || displayName,
          photoURL: userData?.profileImage || undefined,
          userType: resolvedUserType,
        });

        setStatus('success');
        setMessage(`Welcome back, ${displayName}! Redirecting…`);

        setTimeout(() => {
          navigate(resolvedUserType === 'seller' ? '/seller-dashboard' : '/', { replace: true });
        }, 1200);

      } catch (err) {
        console.error('[AuthSuccess] refresh/me failed:', getErrorMessage(err));
        setStatus('error');
        setMessage('Session could not be established. Please sign in again.');
        setTimeout(() => navigate('/auth?error=google_auth_failed', { replace: true }), 2500);
      }
    })();
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
