import { useState } from 'react';
import { Link } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import elephantIcon from 'figma:asset/5dd0c7298d1c72e69b5b85217d4efff0c8bc9e72.png';

type UserType = 'buyer' | 'seller';
type FormMode = 'login' | 'signup';

export default function Auth() {
  const [userType, setUserType] = useState<UserType>('buyer');
  const [formMode, setFormMode] = useState<FormMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleSignIn = () => {
    // Placeholder for Google sign-in
    alert('Google sign-in would be implemented here');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ backgroundColor: 'var(--cream-bg)' }}
    >
      {/* Decorative Mandala Patterns */}
      <div 
        className="absolute top-0 left-0 w-96 h-96 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='%234A2C2A' stroke-width='2'/%3E%3Ccircle cx='100' cy='100' r='60' fill='none' stroke='%234A2C2A' stroke-width='2'/%3E%3Ccircle cx='100' cy='100' r='40' fill='none' stroke='%234A2C2A' stroke-width='2'/%3E%3C/svg%3E")`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='%234A2C2A' stroke-width='2'/%3E%3Ccircle cx='100' cy='100' r='60' fill='none' stroke='%234A2C2A' stroke-width='2'/%3E%3Ccircle cx='100' cy='100' r='40' fill='none' stroke='%234A2C2A' stroke-width='2'/%3E%3C/svg%3E")`,
          transform: 'translate(50%, 50%)',
        }}
      />

      {/* Auth Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
          {/* Logo */}
          <div className="pt-8 pb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src={elephantIcon} alt="Elephant" className="w-12 h-12" />
              <h1 
                className="font-bold text-3xl"
                style={{ 
                  color: 'var(--rust-red)',
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '0.05em'
                }}
              >
                KALAKART
              </h1>
            </div>
          </div>

          {/* User Type Tabs */}
          <div className="flex">
            <button
              onClick={() => setUserType('buyer')}
              className="flex-1 py-4 font-semibold transition-colors border-b-2"
              style={{
                backgroundColor: userType === 'buyer' ? 'white' : 'var(--beige)',
                color: userType === 'buyer' ? 'var(--dark-brown)' : 'var(--text-gray)',
                borderBottomColor: userType === 'buyer' ? 'var(--rust-red)' : 'transparent',
              }}
            >
              Buyer
            </button>
            <button
              onClick={() => setUserType('seller')}
              className="flex-1 py-4 font-semibold transition-colors border-b-2"
              style={{
                backgroundColor: userType === 'seller' ? 'white' : 'var(--beige)',
                color: userType === 'seller' ? 'var(--dark-brown)' : 'var(--text-gray)',
                borderBottomColor: userType === 'seller' ? 'var(--rust-red)' : 'transparent',
              }}
            >
              Seller
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Login Form */}
            {formMode === 'login' && (
              <div>
                <h2 className="text-center mb-2" style={{ color: 'var(--dark-brown)' }}>
                  Welcome Back, {userType === 'buyer' ? 'Buyer' : 'Seller'}!
                </h2>
                <p className="text-center mb-6 text-sm" style={{ color: 'var(--text-gray)' }}>
                  {userType === 'buyer' 
                    ? 'Login to continue shopping' 
                    : 'Login to manage your shop and products'}
                </p>

                <form className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--dark-brown)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--beige)',
                        backgroundColor: 'var(--light-beige)'
                      }}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--dark-brown)' }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 pr-12"
                        style={{ 
                          borderColor: 'var(--beige)',
                          backgroundColor: 'var(--light-beige)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" style={{ color: 'var(--text-gray)' }} />
                        ) : (
                          <Eye className="w-5 h-5" style={{ color: 'var(--text-gray)' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--text-gray)' }}
                    >
                      Forget Password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--rust-red)' }}
                  >
                    Login
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--beige)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-gray)' }}>OR</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--beige)' }} />
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 rounded-lg font-semibold border-2 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                    style={{ borderColor: 'var(--beige)', color: 'var(--dark-brown)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.8 10.2273C19.8 9.51821 19.7364 8.8364 19.6182 8.18182H10V12.0455H15.4818C15.2273 13.3 14.4636 14.3591 13.3091 15.0682V17.5773H16.6909C18.7091 15.7045 19.8 13.2 19.8 10.2273Z" fill="#4285F4"/>
                      <path d="M10 20C12.7 20 14.9636 19.1045 16.6909 17.5773L13.3091 15.0682C12.3364 15.6682 11.0909 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.1364 4.40455 11.7273H0.931818V14.3182C2.64545 17.7273 6.09091 20 10 20Z" fill="#34A853"/>
                      <path d="M4.40455 11.7273C4.18182 11.1273 4.05455 10.4773 4.05455 9.8C4.05455 9.12273 4.18182 8.47273 4.40455 7.87273V5.28182H0.931818C0.236364 6.66364 -0.15 8.19091 -0.15 9.8C-0.15 11.4091 0.236364 12.9364 0.931818 14.3182L4.40455 11.7273Z" fill="#FBBC05"/>
                      <path d="M10 3.57727C11.2182 3.57727 12.3 4.03636 13.1409 4.83636L16.1364 1.84091C14.9591 0.754545 12.6955 0 10 0C6.09091 0 2.64545 2.27273 0.931818 5.68182L4.40455 8.27273C5.19091 5.86364 7.39545 3.97727 10 3.97727V3.57727Z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Sign Up Link */}
                  <p className="text-center text-sm mt-6" style={{ color: 'var(--text-gray)' }}>
                    New {userType === 'buyer' ? 'Buyer' : 'Seller'}?{' '}
                    <button
                      type="button"
                      onClick={() => setFormMode('signup')}
                      className="font-semibold hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--rust-red)' }}
                    >
                      Create an Account
                    </button>
                  </p>
                </form>
              </div>
            )}

            {/* Signup Form */}
            {formMode === 'signup' && (
              <div>
                <h2 className="text-center mb-2" style={{ color: 'var(--dark-brown)' }}>
                  Create {userType === 'buyer' ? 'Buyer' : 'Seller'} Account
                </h2>
                <p className="text-center mb-6 text-sm" style={{ color: 'var(--text-gray)' }}>
                  {userType === 'buyer' 
                    ? 'Join us to discover amazing handicrafts' 
                    : 'Start selling your handcrafted products'}
                </p>

                <form className="space-y-4">
                  {/* Seller-specific: Business Name */}
                  {userType === 'seller' && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--dark-brown)' }}>
                        Business Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter business name"
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                        style={{ 
                          borderColor: 'var(--beige)',
                          backgroundColor: 'var(--light-beige)'
                        }}
                      />
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--dark-brown)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: 'var(--beige)',
                        backgroundColor: 'var(--light-beige)'
                      }}
                    />
                  </div>

                  {/* Seller-specific: Phone Number */}
                  {userType === 'seller' && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--dark-brown)' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                        style={{ 
                          borderColor: 'var(--beige)',
                          backgroundColor: 'var(--light-beige)'
                        }}
                      />
                    </div>
                  )}

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--dark-brown)' }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 pr-12"
                        style={{ 
                          borderColor: 'var(--beige)',
                          backgroundColor: 'var(--light-beige)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" style={{ color: 'var(--text-gray)' }} />
                        ) : (
                          <Eye className="w-5 h-5" style={{ color: 'var(--text-gray)' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--dark-brown)' }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 pr-12"
                        style={{ 
                          borderColor: 'var(--beige)',
                          backgroundColor: 'var(--light-beige)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" style={{ color: 'var(--text-gray)' }} />
                        ) : (
                          <Eye className="w-5 h-5" style={{ color: 'var(--text-gray)' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--rust-red)' }}
                  >
                    Create Account
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--beige)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-gray)' }}>OR</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--beige)' }} />
                  </div>

                  {/* Google Sign Up */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 rounded-lg font-semibold border-2 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                    style={{ borderColor: 'var(--beige)', color: 'var(--dark-brown)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.8 10.2273C19.8 9.51821 19.7364 8.8364 19.6182 8.18182H10V12.0455H15.4818C15.2273 13.3 14.4636 14.3591 13.3091 15.0682V17.5773H16.6909C18.7091 15.7045 19.8 13.2 19.8 10.2273Z" fill="#4285F4"/>
                      <path d="M10 20C12.7 20 14.9636 19.1045 16.6909 17.5773L13.3091 15.0682C12.3364 15.6682 11.0909 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.1364 4.40455 11.7273H0.931818V14.3182C2.64545 17.7273 6.09091 20 10 20Z" fill="#34A853"/>
                      <path d="M4.40455 11.7273C4.18182 11.1273 4.05455 10.4773 4.05455 9.8C4.05455 9.12273 4.18182 8.47273 4.40455 7.87273V5.28182H0.931818C0.236364 6.66364 -0.15 8.19091 -0.15 9.8C-0.15 11.4091 0.236364 12.9364 0.931818 14.3182L4.40455 11.7273Z" fill="#FBBC05"/>
                      <path d="M10 3.57727C11.2182 3.57727 12.3 4.03636 13.1409 4.83636L16.1364 1.84091C14.9591 0.754545 12.6955 0 10 0C6.09091 0 2.64545 2.27273 0.931818 5.68182L4.40455 8.27273C5.19091 5.86364 7.39545 3.97727 10 3.97727V3.57727Z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Login Link */}
                  <p className="text-center text-sm mt-6" style={{ color: 'var(--text-gray)' }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setFormMode('login')}
                      className="font-semibold hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--rust-red)' }}
                    >
                      Login
                    </button>
                  </p>
                </form>
              </div>
            )}
          </div>

          {/* Decorative Border */}
          <div 
            className="h-4"
            style={{
              background: 'repeating-linear-gradient(90deg, var(--rust-red) 0px, var(--rust-red) 10px, var(--dark-brown) 10px, var(--dark-brown) 20px, var(--beige) 20px, var(--beige) 30px)',
            }}
          />
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link 
            to="/"
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: 'var(--rust-red)' }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}