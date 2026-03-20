import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { X, Eye, EyeOff, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'signup';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();
  const { login, signup } = useAppContext();

  const [mode, setMode]         = useState<Mode>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const emailRef = useRef<HTMLInputElement>(null);

  // Reset form whenever mode or visibility changes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      // Autofocus email field per spec
      setTimeout(() => emailRef.current?.focus(), 50);
    }
  }, [isOpen, mode]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = mode === 'login'
      ? await login(email, password)
      : await signup(email, password, name);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // ✅ Auth succeeded — cart data is preserved in localStorage, go to checkout
    onClose();
    navigate('/checkout');
  };

  const switchMode = () => {
    setMode(m => (m === 'login' ? 'signup' : 'login'));
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#FFFDF8', border: '2px solid var(--beige)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top accent bar ── */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, var(--saffron), var(--rust-red))' }} />

        <div className="p-7">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-gray)' }} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(180,140,90,0.12)' }}
            >
              <Lock className="w-5 h-5" style={{ color: 'var(--saffron)' }} />
            </div>
            <div>
              <h3 style={{ color: 'var(--dark-brown)' }}>Login to Continue</h3>
              <p className="text-xs" style={{ color: 'var(--text-gray)' }}>
                {mode === 'login' ? 'Sign in to place your order' : 'Create your account to get started'}
              </p>
            </div>
          </div>

          {/* Security nudge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-6 text-sm"
            style={{ backgroundColor: 'rgba(74,140,74,0.08)', color: '#4A8C4A' }}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            Your cart items are saved — login to complete checkout
          </div>

          {/* Mode Tabs */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ backgroundColor: 'var(--cream)' }}
          >
            {(['login', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={
                  mode === m
                    ? { backgroundColor: 'var(--saffron)', color: 'white' }
                    : { color: 'var(--text-gray)' }
                }
              >
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    border: '1.5px solid var(--beige)',
                    backgroundColor: 'white',
                    color: 'var(--dark-brown)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--beige)')}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>
                Email Address
              </label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid var(--beige)',
                  backgroundColor: 'white',
                  color: 'var(--dark-brown)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                onBlur={e => (e.target.style.borderColor = 'var(--beige)')}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--dark-brown)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    border: '1.5px solid var(--beige)',
                    backgroundColor: 'white',
                    color: 'var(--dark-brown)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--saffron)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--beige)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--text-gray)' }}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Inline error */}
            {error && (
              <div
                className="px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
                style={{ backgroundColor: 'rgba(200,50,50,0.08)', color: '#C03030', border: '1px solid rgba(200,50,50,0.2)' }}
              >
                <span className="flex-shrink-0">⚠</span>
                <span>{error}</span>
                <button
                  type="button"
                  className="ml-auto text-xs underline"
                  onClick={() => { setError(''); setLoading(false); }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70 transition-all"
              style={{ backgroundColor: 'var(--saffron)' }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                : mode === 'login' ? 'Login & Continue to Checkout' : 'Create Account & Continue'
              }
            </button>
          </form>

          {/* Toggle link */}
          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-gray)' }}>
            {mode === 'login'
              ? <> New user?{' '} <button onClick={switchMode} className="font-semibold hover:opacity-70" style={{ color: 'var(--saffron)' }}>Create an account</button> </>
              : <> Already have an account?{' '} <button onClick={switchMode} className="font-semibold hover:opacity-70" style={{ color: 'var(--saffron)' }}>Login</button> </>
            }
          </p>
        </div>
      </div>
    </div>
  );
}
