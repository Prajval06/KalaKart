import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, Flame, Key, Check, Loader2, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const logoImage = "https://raw.githubusercontent.com/Prajval06/KalaKart/refs/heads/main/Kalakart%20logo.png";

const mandalaBg = "https://unsplash.com/photos/intricate-circular-floral-pattern-on-textured-background-NVd9dvwXWc4";

type UserType = 'buyer' | 'seller';
type FormMode = 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, cartItems } = useAppContext();

  // Where to send the user after successful auth
  const redirectTo = searchParams.get('redirect') || '/';

  const [userType, setUserType]               = useState<UserType>('buyer');
  const [formMode, setFormMode]               = useState<FormMode>('login');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe]           = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');

  // Form fields
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName]               = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone]             = useState('');

  const handleGoogleSignIn = () => {
    alert('Google sign-in would be implemented here');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (formMode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    if (formMode === 'login') {
      const result = await login(email, password);
      setLoading(false);
      if (result.error) { setError(result.error); return; }

      // Seller login always goes to dashboard; buyer goes to redirect target
      if (userType === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate(redirectTo);
      }
    } else {
      // signup
      const displayName = userType === 'seller' ? (businessName || name) : name;
      const result = await signup(email, password, displayName);
      setLoading(false);
      if (result.error) { setError(result.error); return; }

      // Seller signup always goes to dashboard
      if (userType === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate(redirectTo);
      }
    }
  };

  // Are we coming from the cart checkout flow?
  const fromCheckout = redirectTo === '/checkout';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        backgroundImage: `url(${mandalaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#F5F5DC',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-amber-50/60 backdrop-blur-[1px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">

        {/* Cart-redirect notice */}
        {fromCheckout && (
          <div
            className="w-full mb-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow"
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
          <img src={logoImage} alt="KalaKart Logo" className="h-20 mx-auto mb-3 drop-shadow-md" />
          <h1
            className="font-bold text-3xl md:text-4xl text-[#8B2500]"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em', textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}
          >
            KALAKART
          </h1>
          <p className="text-[#4A2C2A] font-serif italic mt-1 font-semibold text-lg drop-shadow-sm">
            Connecting Artisans to the World
          </p>
        </div>

        {/* Card */}
        <div
          className="w-full bg-[#FFF8E7] shadow-2xl relative overflow-hidden rounded-sm"
          style={{ border: '8px solid #8B2500', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        >
          {/* Inner decorative borders */}
          <div className="border-[6px] border-[#DAA520] border-dashed m-1">
            <div className="border-[2px] border-[#2E8B57] m-1 p-6 md:p-8 bg-white/95">

              {/* Corner ornaments */}
              {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-16 h-16 pointer-events-none opacity-20`}
                  style={{ background: `radial-gradient(circle at ${['top left','top right','bottom left','bottom right'][i]}, #8B2500 0%, transparent 70%)` }}
                />
              ))}

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-serif text-[#4A2C2A] leading-tight">
                  {formMode === 'login' ? (
                    <>Welcome Back <span className="block text-sm font-sans font-normal text-[#8B4513] mt-2">Sign in to access your account</span></>
                  ) : (
                    <>Join KalaKart <span className="block text-sm font-sans font-normal text-[#8B4513] mt-2">Create your account today</span></>
                  )}
                </h2>
              </div>

              {/* User Type Tabs */}
              <div className="flex justify-center mb-8 bg-[#F5DEB3] p-1 rounded-full w-fit mx-auto shadow-inner">
                {(['buyer', 'seller'] as UserType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => { setUserType(t); setError(''); }}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                      userType === t ? 'bg-[#8B2500] text-white shadow-md' : 'text-[#5D4037] hover:bg-[#DEB887]'
                    }`}
                  >
                    {t === 'buyer' ? 'Buyer' : 'Seller'}
                  </button>
                ))}
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(200,50,50,0.08)', color: '#C03030', border: '1px solid rgba(200,50,50,0.25)' }}>
                  <span>⚠</span>
                  <span>{error}</span>
                  <button type="button" className="ml-auto text-xs underline" onClick={() => setError('')}>✕</button>
                </div>
              )}

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>

                {/* Seller: Business Name */}
                {formMode === 'signup' && userType === 'seller' && (
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B2500]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M10 9a3 3 0 0 1 3 3v9"/></svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Business Name"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#FFF8DC] border border-[#DEB887] rounded-lg focus:outline-none focus:border-[#8B2500] focus:ring-1 focus:ring-[#8B2500] transition-colors placeholder-[#8B4513]/50 text-[#4A2C2A]"
                    />
                  </div>
                )}

                {/* Buyer signup: Full Name */}
                {formMode === 'signup' && userType === 'buyer' && (
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B2500]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#FFF8DC] border border-[#DEB887] rounded-lg focus:outline-none focus:border-[#8B2500] focus:ring-1 focus:ring-[#8B2500] transition-colors placeholder-[#8B4513]/50 text-[#4A2C2A]"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B2500]">
                    <Flame size={20} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-[#FFF8DC] border border-[#DEB887] rounded-lg focus:outline-none focus:border-[#8B2500] focus:ring-1 focus:ring-[#8B2500] transition-colors placeholder-[#8B4513]/50 text-[#4A2C2A]"
                  />
                </div>

                {/* Seller signup: Phone */}
                {formMode === 'signup' && userType === 'seller' && (
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B2500]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#FFF8DC] border border-[#DEB887] rounded-lg focus:outline-none focus:border-[#8B2500] focus:ring-1 focus:ring-[#8B2500] transition-colors placeholder-[#8B4513]/50 text-[#4A2C2A]"
                    />
                  </div>
                )}

                {/* Password */}
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B2500]">
                    <Key size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-[#FFF8DC] border border-[#DEB887] rounded-lg focus:outline-none focus:border-[#8B2500] focus:ring-1 focus:ring-[#8B2500] transition-colors placeholder-[#8B4513]/50 text-[#4A2C2A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8B4513]/70 hover:text-[#8B2500]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm Password (signup only) */}
                {formMode === 'signup' && (
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B2500]">
                      <Key size={20} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-12 py-3 bg-[#FFF8DC] border border-[#DEB887] rounded-lg focus:outline-none focus:border-[#8B2500] focus:ring-1 focus:ring-[#8B2500] transition-colors placeholder-[#8B4513]/50 text-[#4A2C2A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8B4513]/70 hover:text-[#8B2500]"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {/* Remember Me & Forgot Password (login only) */}
                {formMode === 'login' && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div
                        className={`w-4 h-4 border rounded transition-colors flex items-center justify-center ${
                          rememberMe ? 'bg-[#8B2500] border-[#8B2500]' : 'border-[#8B4513] bg-white'
                        }`}
                        onClick={e => { e.preventDefault(); setRememberMe(!rememberMe); }}
                      >
                        {rememberMe && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-[#5D4037] group-hover:text-[#8B2500]">Remember Me</span>
                    </label>
                    <button type="button" className="text-[#8B2500] hover:underline font-semibold font-serif">
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-white font-bold text-lg shadow-lg hover:shadow-xl hover:opacity-95 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, #8B2500 0%, #A52A2A 100%)',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '0.05em',
                  }}
                >
                  {loading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying…</>
                    : formMode === 'login' ? 'Login' : 'Create Account'
                  }
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-[#DAA520]" />
                  <span className="text-xs text-[#8B4513] font-serif">OR</span>
                  <div className="flex-1 h-px bg-[#DAA520]" />
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 rounded-lg font-semibold border-2 border-[#DEB887] hover:bg-[#FFF8DC] transition-colors flex items-center justify-center gap-3 text-[#5D4037]"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.8 10.2273C19.8 9.51821 19.7364 8.8364 19.6182 8.18182H10V12.0455H15.4818C15.2273 13.3 14.4636 14.3591 13.3091 15.0682V17.5773H16.6909C18.7091 15.7045 19.8 13.2 19.8 10.2273Z" fill="#4285F4"/>
                    <path d="M10 20C12.7 20 14.9636 19.1045 16.6909 17.5773L13.3091 15.0682C12.3364 15.6682 11.0909 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.1364 4.40455 11.7273H0.931818V14.3182C2.64545 17.7273 6.09091 20 10 20Z" fill="#34A853"/>
                    <path d="M4.40455 11.7273C4.18182 11.1273 4.05455 10.4773 4.05455 9.8C4.05455 9.12273 4.18182 8.47273 4.40455 7.87273V5.28182H0.931818C0.236364 6.66364 -0.15 8.19091 -0.15 9.8C-0.15 11.4091 0.236364 12.9364 0.931818 14.3182L4.40455 11.7273Z" fill="#FBBC05"/>
                    <path d="M10 3.57727C11.2182 3.57727 12.3 4.03636 13.1409 4.83636L16.1364 1.84091C14.9591 0.754545 12.6955 0 10 0C6.09091 0 2.64545 2.27273 0.931818 5.68182L4.40455 8.27273C5.19091 5.86364 7.39545 3.97727 10 3.97727V3.57727Z" fill="#EA4335"/>
                  </svg>
                  <span className="font-serif">Continue with Google</span>
                </button>
              </form>

              {/* Toggle login / signup */}
              <div className="mt-8 text-center border-t border-[#DAA520]/30 pt-4">
                <p className="text-[#5D4037] text-sm font-serif">
                  {formMode === 'login' ? 'New to KalaKart? ' : 'Already have an account? '}
                  <button
                    onClick={() => { setFormMode(formMode === 'login' ? 'signup' : 'login'); setError(''); }}
                    className="text-[#8B2500] font-bold hover:underline"
                  >
                    {formMode === 'login' ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>

            </div>
          </div>

          {/* Bottom pattern strip */}
          <div
            className="absolute bottom-0 left-0 right-0 h-3 w-full"
            style={{ background: 'repeating-linear-gradient(90deg, #8B2500 0px, #8B2500 10px, #DAA520 10px, #DAA520 20px)' }}
          />
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to={fromCheckout ? '/cart' : '/'}
            className="text-[#4A2C2A] font-bold font-serif hover:text-[#8B2500] transition-colors flex items-center justify-center gap-2 drop-shadow-sm bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <span>←</span> {fromCheckout ? 'Back to Cart' : 'Return to Home'}
          </Link>
        </div>

      </div>
    </div>
  );
}
