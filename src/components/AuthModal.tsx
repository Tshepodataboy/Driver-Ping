import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import {
  X,
  ShieldCheck,
  ArrowRight,
  Mail,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Hash,
  MapPin,
  Car,
} from 'lucide-react';
import { ProvincialPlate } from './ProvincialPlate.js';

const PROVINCES = [
  { code: 'GP', name: 'Gauteng', plateSuffix: 'GP' },
  { code: 'WC', name: 'Western Cape', plateSuffix: 'WP / CA' },
  { code: 'KZN', name: 'KwaZulu-Natal', plateSuffix: 'ZN' },
  { code: 'EC', name: 'Eastern Cape', plateSuffix: 'EC' },
  { code: 'FS', name: 'Free State', plateSuffix: 'FS' },
  { code: 'MP', name: 'Mpumalanga', plateSuffix: 'MP' },
  { code: 'LP', name: 'Limpopo', plateSuffix: 'L' },
  { code: 'NW', name: 'North West', plateSuffix: 'NW' },
  { code: 'NC', name: 'Northern Cape', plateSuffix: 'NC' },
];

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithEmail, updateUserPreferences, registerVehicle } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  // Sign In / Registration Credentials
  const [email, setEmail] = useState('tshepodataboy@gmail.com');
  const [userId, setUserId] = useState(''); // Replaces 'Your Name' in Sign In

  // Step 2 Profile Onboarding
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [callNumber, setCallNumber] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('GP');
  const [initialPlate, setInitialPlate] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setError(null);
    setSuccess(null);
    setSignupStep(1);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userId.trim() && !email.trim()) {
      setError('Please enter your User ID or Email Address to sign in');
      return;
    }

    setIsLoading(true);
    const res = await loginWithEmail(email.trim(), userId.trim(), 'signin');
    setIsLoading(false);

    if (res.success) {
      handleClose();
    } else {
      setError(res.error || 'Could not sign in. Please verify your credentials.');
    }
  };

  const handleSignUpEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const res = await loginWithEmail(email.trim(), undefined, 'signup');
    setIsLoading(false);

    if (res.success) {
      // Email registered! Prompt user for Name, Surname, Call Number
      setSuccess('Email registered! Please complete your driver details.');
      setSignupStep(2);
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  const handleProfileOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!surname.trim()) {
      setError('Please enter your surname.');
      return;
    }
    if (!callNumber.trim() || callNumber.trim().length < 7) {
      setError('Please enter a valid call number (e.g. 082 123 4567).');
      return;
    }

    setIsLoading(true);
    const combinedFullName = `${firstName.trim()} ${surname.trim()}`;
    const cleanPlate = initialPlate.trim().toUpperCase();

    const updateRes = await updateUserPreferences({
      fullName: combinedFullName,
      phone: callNumber.trim(),
      defaultProvinceCode: selectedProvince,
      defaultPlate: cleanPlate || undefined,
    });

    if (cleanPlate) {
      try {
        await registerVehicle({ plate: cleanPlate });
      } catch (err) {
        console.warn('Vehicle registration error:', err);
      }
    }

    setIsLoading(false);

    if (updateRes.success) {
      handleClose();
    } else {
      setError(updateRes.error || 'Failed to update profile.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    const userEmail = email.trim() || 'tshepodataboy@gmail.com';
    const res = await loginWithEmail(userEmail, 'Google User', authMode);
    setIsLoading(false);

    if (res.success) {
      if (authMode === 'signup' || res.isNew) {
        setSuccess('Google verified! Please complete your driver details.');
        setSignupStep(2);
      } else {
        handleClose();
      }
    } else {
      setError(res.error || 'Google Sign-In failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[34px] max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          {/* Header Icon */}
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B81D39] flex items-center justify-center mb-3">
            <Mail className="w-6 h-6 stroke-[2.2]" />
          </div>

          {/* Mode Switcher Tabs */}
          {signupStep === 1 && (
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-[#B81D39] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-[#B81D39] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {error && (
            <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* SIGN IN VIEW */}
          {/* ============================================================ */}
          {authMode === 'signin' && (
            <div>
              <h2 className="text-xl font-black font-display text-gray-900">
                Sign In
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter your User ID or registered Email address.
              </p>

              <div className="mt-4 space-y-3">
                {/* Google One-Tap */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-xs rounded-2xl border-2 border-gray-200 shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google / Gmail</span>
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-extrabold uppercase tracking-widest">
                    <span className="bg-white px-2 text-gray-400">OR</span>
                  </div>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      User ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Hash className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="e.g. usr_alex_001"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-[#B81D39] hover:bg-[#9E142C] text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Signing in...' : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SIGN UP VIEW - STEP 1 */}
          {/* ============================================================ */}
          {authMode === 'signup' && signupStep === 1 && (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-100 text-[#941329] rounded-full text-[9px] font-black uppercase tracking-wider mb-1.5">
                Step 1 of 2 · Email Registration
              </div>
              <h2 className="text-xl font-black font-display text-gray-900">
                Create Account
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter your email to get started. You will set up your name and call number next.
              </p>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-xs rounded-2xl border-2 border-gray-200 shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign up with Google / Gmail</span>
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-extrabold uppercase tracking-widest">
                    <span className="bg-white px-2 text-gray-400">OR</span>
                  </div>
                </div>

                <form onSubmit={handleSignUpEmailSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-[#B81D39] hover:bg-[#9E142C] text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Registering...' : (
                      <>
                        <span>Continue to Profile Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SIGN UP VIEW - STEP 2: Name, Surname, Call Number */}
          {/* ============================================================ */}
          {authMode === 'signup' && signupStep === 2 && (
            <div className="animate-in fade-in duration-200">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase tracking-wider mb-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Step 2 of 2 · Driver Profile
              </div>
              <h2 className="text-xl font-black font-display text-gray-900">
                Driver Information
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter your name, surname, and call number to complete registration.
              </p>

              <form onSubmit={handleProfileOnboardingSubmit} className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      First Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alex"
                        className="w-full pl-9 pr-2.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Surname *
                    </label>
                    <input
                      type="text"
                      required
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      placeholder="Morgan"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Call / Mobile Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={callNumber}
                      onChange={(e) => setCallNumber(e.target.value)}
                      placeholder="082 123 4567 or +27 82 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    For road safety call and SMS alerts.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Province
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name} ({p.plateSuffix})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    License Plate (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Car className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={initialPlate}
                      onChange={(e) => setInitialPlate(e.target.value)}
                      placeholder="e.g. CA 882 GP"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                    />
                  </div>
                  {initialPlate.trim() && (
                    <div className="mt-2 w-32 mx-auto drop-shadow-xs">
                      <ProvincialPlate
                        provinceCode={selectedProvince}
                        plateText={initialPlate.trim().toUpperCase()}
                      />
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-gray-50 rounded-2xl flex items-start gap-2 text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-[#B81D39] shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-tight">
                    Strict privacy: Your call number and details are never exposed to other drivers.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#B81D39] hover:bg-[#9E142C] text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Saving Profile...' : (
                    <>
                      <span>Complete & Enter Driver Ping</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
