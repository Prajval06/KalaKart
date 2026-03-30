import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, Key, Loader2, ShoppingBag, Mail, User, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const logoImage =
  'https://raw.githubusercontent.com/Prajval06/KalaKart/refs/heads/main/Kalakart%20logo.png';

// ── Types ────────────────────────────────────────────────────────────────────
type FormMode = 'login' | 'signup' | 'forgot';
type UserType = 'buyer' | 'seller';

// ── Reusable field wrapper ───────────────────────────────────────────────────
function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B2500] pointer-events-none">
      {children}
    </div>
  );
}

// ── Google SVG ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M19.8 10.227c0-.71-.064-1.392-.182-2.045H10v3.818h5.482c-.255 1.25-1.018 2.31-2.173 3.018v2.51H16.69C18.71 15.704 19.8 13.2 19.8 10.227z" fill="#4285F4" />
      <path d="M10 20c2.7 0 4.964-.895 6.69-2.423l-3.381-2.509c-.936.6-2.182.955-3.309.955-2.604 0-4.809-1.886-5.595-4.295H.932v2.59C2.645 17.727 6.09 20 10 20z" fill="#34A853" />
      <path d="M4.405 11.727A5.986 5.986 0 0 1 4.055 9.8c0-.677.127-1.327.35-1.927V5.282H.932A9.953 9.953 0 0 0 0 9.8c0 1.609.387 3.136 1.082 4.518l3.323-2.59z" fill="#FBBC05" />
      <path d="M10 3.977c1.218 0 2.3.459 3.141 1.259l2.995-2.995C14.96.754 12.696 0 10 0 6.09 0 2.645 2.273.932 5.682l3.473 2.59C5.19 5.864 7.396 3.977 10 3.977z" fill="#EA4335" />
    </svg>
  );
}

// ── Main Auth Page ───────────────────────────────────────────────────────────
export default function Auth() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, forgotPassword, loginWithGoogle, cartItems, isLoggedIn } =
    useAppContext();

  const redirectTo  = searchParams.get('redirect') || '/';
  const fromCheckout = redirectTo === '/checkout';

  // ── View state ──
  const [mode, setMode]       = useState<FormMode>('login');
  const [userType, setUserType] = useState<UserType>('buyer');

  // ── Field state ──
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name,            setName]            = useState('');
  const [businessName,    setBusinessName]    = useState('');
  const [phone,           setPhone]           = useState('');
  const [showPw,          setShowPw]          = useState(false);
  const [showCPw,         setShowCPw]         = useState(false);
  const [rememberMe,      setRememberMe]      = useState(false);

  // ── Feedback state ──
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) navigate(redirectTo, { replace: true });
  }, [isLoggedIn, navigate, redirectTo]);

  // Clear messages and reset fields when switching modes
  const switchMode = useCallback((next: FormMode) => {
    setMode(next);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setBusinessName('');
    setPhone('');
    setShowPw(false);
    setShowCPw(false);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const result = await login(email.trim(), password, userType);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    navigate(userType === 'seller' ? '/seller-dashboard' : redirectTo, { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const displayName = userType === 'seller' ? (businessName.trim() || name.trim()) : name.trim();
    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!displayName) { setError('Please enter your name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const result = await signup(email.trim(), password, displayName, userType);
    setLoading(false);
    if (result.error) { setError(result.error); return; }

    // Switch to login with success notice
    setMode('login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setBusinessName('');
    setPhone('');
    setError('');
    setSuccess('Account created! Please log in.');
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    const result = await forgotPassword(email.trim());
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setSuccess(result.success || 'Reset email sent!');
  };

  const handleGoogleSignIn = () => {
    setError(''); setSuccess('');
    setLoading(true);
    // loginWithGoogle now issues a browser redirect to Google OAuth.
    // The page will navigate away — no async result to handle here.
    loginWithGoogle(userType);
  };

  // ── Shared input class ───────────────────────────────────────────────────────
  const inputCls =
    'w-full pl-10 pr-4 py-3 bg-[#FFF8DC] border border-[#DEB887] rounded-lg ' +
    'focus:outline-none focus:border-[#8B2500] focus:ring-1 focus:ring-[#8B2500] ' +
    'transition-colors placeholder-[#8B4513]/50 text-[#4A2C2A] text-sm';

  const pwInputCls = inputCls.replace('pr-4', 'pr-12');

  // ── Title labels ─────────────────────────────────────────────────────────────
  const titles: Record<FormMode, { heading: string; sub: string }> = {
    login:  { heading: 'Welcome Back',     sub: 'Sign in to your account' },
    signup: { heading: 'Join KalaKart',    sub: 'Create your account today' },
    forgot: { heading: 'Forgot Password?', sub: 'We\'ll send you a reset link' },
  };
  const { heading, sub } = titles[mode];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F5F0E8 0%, #FFF8E7 50%, #F0E6D3 100%)' }}
    >
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8B2500 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #DAA520 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #2E8B57 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">

        {/* Cart-redirect notice */}
        {fromCheckout && (
          <div
            className="w-full mb-5 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-md animate-fade-in"
            style={{ backgroundColor: '#FFF8E7', border: '1.5px solid #DAA520' }}
          >
            <ShoppingBag className="w-5 h-5 flex-shrink-0" style={{ color: '#8B2500' }} />
            <div>
              <p className="font-semibold" style={{ color: '#4A2C2A' }}>
                You have {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
              </p>
              <p style={{ color: '#8B4513' }}>Login or sign up to complete your purchase</p>
            </div>
          </div>
        )}

        {/* Logo */}
        <div className="mb-6 text-center">
          <img src={logoImage} alt="KalaKart" className="h-20 mx-auto mb-2 drop-shadow-lg" />
          <h1
            className="font-bold text-3xl md:text-4xl"
            style={{ color: '#8B2500', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}
          >
            KALAKART
          </h1>
          <p className="text-[#4A2C2A] font-serif italic mt-1 text-base drop-shadow-sm">
            Connecting Artisans to the World
          </p>
        </div>

        {/* Card */}
        <div
          className="w-full bg-[#FFF8E7] shadow-2xl relative overflow-hidden"
          style={{ border: '6px solid #8B2500', borderRadius: '4px' }}
        >
          {/* Gold dashed inner border */}
          <div className="border-[4px] border-[#DAA520] border-dashed m-[3px]">
            <div className="border-[2px] border-[#2E8B57] m-[2px] p-6 md:p-8 bg-white/95 relative">

              {/* Corner ornaments */}
              {(['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'] as const).map(
                (pos, i) => (
                  <div
                    key={i}
                    className={`absolute ${pos} w-16 h-16 pointer-events-none opacity-20`}
                    style={{
                      background: `radial-gradient(circle at ${
                        ['top left', 'top right', 'bottom left', 'bottom right'][i]
                      }, #8B2500 0%, transparent 70%)`,
                    }}
                  />
                )
              )}

              {/* Heading */}
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-serif text-[#4A2C2A] leading-tight">
                  {heading}
                  <span className="block text-sm font-sans font-normal text-[#8B4513] mt-1">
                    {sub}
                  </span>
                </h2>
              </div>

              {/* Buyer / Seller tabs (login + signup only) */}
              {mode !== 'forgot' && (
                <div className="flex justify-center mb-6 bg-[#F5DEB3] p-1 rounded-full w-fit mx-auto shadow-inner">
                  {(['buyer', 'seller'] as UserType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setUserType(t); setError(''); }}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                        userType === t
                          ? 'bg-[#8B2500] text-white shadow-md'
                          : 'text-[#5D4037] hover:bg-[#DEB887]'
                      }`}
                    >
                      {t === 'buyer' ? 'Buyer' : 'Seller'}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Error Message ── */}
              {error && (
                <div
                  id="auth-error"
                  role="alert"
                  className="mb-4 px-4 py-2.5 rounded-lg text-sm flex items-start gap-2 transition-all"
                  style={{
                    backgroundColor: 'rgba(200,50,50,0.07)',
                    color: '#C03030',
                    border: '1px solid rgba(200,50,50,0.25)',
                  }}
                >
                  <span className="mt-0.5 flex-shrink-0">⚠</span>
                  <span className="flex-1">{error}</span>
                  <button
                    type="button"
                    className="ml-auto text-xs opacity-60 hover:opacity-100 flex-shrink-0"
                    onClick={() => setError('')}
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* ── Success Message ── */}
              {success && (
                <div
                  id="auth-success"
                  role="status"
                  className="mb-4 px-4 py-2.5 rounded-lg text-sm flex items-start gap-2"
                  style={{
                    backgroundColor: 'rgba(46,139,87,0.07)',
                    color: '#1a6b3a',
                    border: '1px solid rgba(46,139,87,0.25)',
                  }}
                >
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                  <span className="flex-1">{success}</span>
                </div>
              )}

              {/* ═══════════════ LOGIN FORM ═══════════════ */}
              {mode === 'login' && (
                <form id="login-form" className="space-y-4" onSubmit={handleLogin} noValidate>

                  {/* Email */}
                  <div className="relative">
                    <FieldIcon><Mail size={18} /></FieldIcon>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                      className={inputCls}
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <FieldIcon><Key size={18} /></FieldIcon>
                    <input
                      id="login-password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className={pwInputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8B4513]/70 hover:text-[#8B2500]"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Remember Me + Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 accent-[#8B2500]"
                      />
                      <span className="text-[#5D4037]">Remember me</span>
                    </label>
                    <button
                      id="forgot-password-link"
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[#8B2500] hover:underline font-semibold font-serif"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    id="login-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-white font-bold text-base shadow-lg hover:shadow-xl hover:opacity-95 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                    style={{
                      background: 'linear-gradient(135deg, #8B2500 0%, #A52A2A 100%)',
                      fontFamily: 'Georgia, serif',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying…</> : 'Login'}
                  </button>

                  {/* OR divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-[#DAA520]" />
                    <span className="text-xs text-[#8B4513] font-serif">OR</span>
                    <div className="flex-1 h-px bg-[#DAA520]" />
                  </div>

                  {/* Google */}
                  <button
                    id="google-signin"
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-semibold border-2 border-[#DEB887] hover:bg-[#FFF8DC] transition-colors flex items-center justify-center gap-3 text-[#5D4037] disabled:opacity-60"
                  >
                    <GoogleIcon />
                    <span className="font-serif">Continue with Google</span>
                  </button>

                  {/* Switch to Sign Up */}
                  <div className="mt-4 text-center border-t border-[#DAA520]/30 pt-4">
                    <p className="text-[#5D4037] text-sm font-serif">
                      Don't have an account?{' '}
                      <button
                        id="goto-signup"
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="text-[#8B2500] font-bold hover:underline"
                      >
                        Sign Up
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* ═══════════════ SIGN UP FORM ═══════════════ */}
              {mode === 'signup' && (
                <form id="signup-form" className="space-y-4" onSubmit={handleSignup} noValidate>

                  {/* Business Name (seller) */}
                  {userType === 'seller' && (
                    <div className="relative">
                      <FieldIcon>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M10 9a3 3 0 0 1 3 3v9" />
                        </svg>
                      </FieldIcon>
                      <input
                        id="signup-business"
                        type="text"
                        placeholder="Business Name"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  )}

                  {/* Full Name (buyer) */}
                  {userType === 'buyer' && (
                    <div className="relative">
                      <FieldIcon><User size={18} /></FieldIcon>
                      <input
                        id="signup-name"
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                        className={inputCls}
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div className="relative">
                    <FieldIcon><Mail size={18} /></FieldIcon>
                    <input
                      id="signup-email"
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      className={inputCls}
                    />
                  </div>

                  {/* Phone (seller) */}
                  {userType === 'seller' && (
                    <div className="relative">
                      <FieldIcon>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </FieldIcon>
                      <input
                        id="signup-phone"
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  )}

                  {/* Password */}
                  <div className="relative">
                    <FieldIcon><Key size={18} /></FieldIcon>
                    <input
                      id="signup-password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Password (min 6 characters)"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className={pwInputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8B4513]/70 hover:text-[#8B2500]"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <FieldIcon><Key size={18} /></FieldIcon>
                    <input
                      id="signup-confirm-password"
                      type={showCPw ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className={pwInputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8B4513]/70 hover:text-[#8B2500]"
                      aria-label={showCPw ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showCPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    id="signup-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-white font-bold text-base shadow-lg hover:shadow-xl hover:opacity-95 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                    style={{
                      background: 'linear-gradient(135deg, #8B2500 0%, #A52A2A 100%)',
                      fontFamily: 'Georgia, serif',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account…</> : 'Sign Up'}
                  </button>

                  {/* OR divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-[#DAA520]" />
                    <span className="text-xs text-[#8B4513] font-serif">OR</span>
                    <div className="flex-1 h-px bg-[#DAA520]" />
                  </div>

                  {/* Google */}
                  <button
                    id="google-signup"
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-semibold border-2 border-[#DEB887] hover:bg-[#FFF8DC] transition-colors flex items-center justify-center gap-3 text-[#5D4037] disabled:opacity-60"
                  >
                    <GoogleIcon />
                    <span className="font-serif">Sign up with Google</span>
                  </button>

                  {/* Switch to Login */}
                  <div className="mt-4 text-center border-t border-[#DAA520]/30 pt-4">
                    <p className="text-[#5D4037] text-sm font-serif">
                      Already have an account?{' '}
                      <button
                        id="goto-login"
                        type="button"
                        onClick={() => switchMode('login')}
                        className="text-[#8B2500] font-bold hover:underline"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* ═══════════════ FORGOT PASSWORD FORM ═══════════════ */}
              {mode === 'forgot' && (
                <form id="forgot-form" className="space-y-4" onSubmit={handleForgot} noValidate>

                  <p className="text-sm text-[#5D4037] font-serif text-center -mt-2 mb-2">
                    Enter the email linked to your account and we'll send a reset link.
                  </p>

                  {/* Email */}
                  <div className="relative">
                    <FieldIcon><Mail size={18} /></FieldIcon>
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="Registered Email Address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      autoFocus
                      className={inputCls}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    id="forgot-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg text-white font-bold text-base shadow-lg hover:shadow-xl hover:opacity-95 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                    style={{
                      background: 'linear-gradient(135deg, #8B2500 0%, #A52A2A 100%)',
                      fontFamily: 'Georgia, serif',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {loading
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending…</>
                      : 'Send Reset Email'}
                  </button>

                  {/* Back to Login */}
                  <button
                    id="back-to-login"
                    type="button"
                    onClick={() => switchMode('login')}
                    className="w-full py-2 text-sm text-[#8B2500] font-semibold font-serif flex items-center justify-center gap-1 hover:underline"
                  >
                    <ArrowLeft size={15} /> Back to Login
                  </button>
                </form>
              )}

            </div>
          </div>

          {/* Bottom pattern strip */}
          <div
            className="h-3 w-full"
            style={{
              background:
                'repeating-linear-gradient(90deg, #8B2500 0px, #8B2500 10px, #DAA520 10px, #DAA520 20px)',
            }}
          />
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to={fromCheckout ? '/cart' : '/'}
            className="text-[#4A2C2A] font-bold font-serif hover:text-[#8B2500] transition-colors flex items-center justify-center gap-2 drop-shadow-sm bg-white/60 px-5 py-2 rounded-full backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft size={15} />
            {fromCheckout ? 'Back to Cart' : 'Return to Home'}
          </Link>
        </div>

      </div>
    </div>
  );
}
