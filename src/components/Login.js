import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase';

function Login() {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, [recaptchaVerifier]);

  // Initialize reCAPTCHA following Firebase docs
  const initializeRecaptcha = () => {
    if (!recaptchaVerifier) {
      try {
        // Clear any existing reCAPTCHA
        const existingRecaptcha = document.getElementById('recaptcha-container');
        if (existingRecaptcha) {
          existingRecaptcha.innerHTML = '';
        }

        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': (response) => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            setError('reCAPTCHA expired. Please try again.');
          }
        });
        
        setRecaptchaVerifier(verifier);
        return verifier;
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
        setError('Error initializing reCAPTCHA. Please refresh and try again.');
        return null;
      }
    }
    return recaptchaVerifier;
  };

  // Email/Password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  // Send OTP following Firebase docs
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const verifier = initializeRecaptcha();
      if (!verifier) {
        setLoading(false);
        return;
      }

      // Format phone number properly
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      // Send OTP
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
      setError('');
    } catch (err) {
      console.error('Error sending OTP:', err);
      let errorMessage = err.message.replace('Firebase: ', '');
      
      // Handle specific Firebase errors
      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please use international format (e.g., +1234567890)';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (err.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP following Firebase docs
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    
    if (!confirmationResult) {
      setError('No confirmation result. Please send OTP again.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await confirmationResult.confirm(otp);
      navigate('/home');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (err.code === 'auth/code-expired') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset phone auth state
  const resetPhoneAuth = () => {
    setShowOtpInput(false);
    setOtp('');
    setError('');
    setConfirmationResult(null);
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      setRecaptchaVerifier(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-900 mb-6">Log in to calmi</div>
        
        {/* Login Method Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              loginMethod === 'email' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => {
              setLoginMethod('email');
              resetPhoneAuth();
            }}
          >
            Email
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              loginMethod === 'phone' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => {
              setLoginMethod('phone');
              resetPhoneAuth();
            }}
          >
            Phone
          </button>
        </div>

        {/* Email/Password Login */}
        {loginMethod === 'email' && (
          <form className="w-full flex flex-col gap-4" onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
              required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded px-4 py-2 mt-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        )}

        {/* Phone OTP Login */}
        {loginMethod === 'phone' && (
          <div className="w-full">
            {!showOtpInput ? (
              <form className="flex flex-col gap-4" onSubmit={handleSendOtp}>
                <input
                  type="tel"
                  placeholder="Phone number (e.g., +1234567890)"
                  className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  required
                />
                <div id="recaptcha-container" className="flex justify-center"></div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <button
                  type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded px-4 py-2 mt-2 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleVerifyOtp}>
                <div className="text-center mb-2">
                  <p className="text-sm text-gray-600">Enter the 6-digit code sent to</p>
                  <p className="text-sm font-medium">{phoneNumber}</p>
                </div>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 text-center text-lg tracking-widest"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
                {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded px-4 py-2 mt-2 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={resetPhoneAuth}
                >
                  Change phone number
          </button>
        </form>
            )}
          </div>
        )}

        <div className="text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-yellow-500 font-semibold hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login; 