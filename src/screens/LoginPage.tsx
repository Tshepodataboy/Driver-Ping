import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Mail,
  User,
  Phone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Car,
  Hash,
} from 'lucide-react';
import { ProvincialPlate } from '../components/ProvincialPlate.js';

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

export function LoginPage() {
  const { loginAsDemo, loginWithEmail, updateUserPreferences, registerVehicle, isLoading } = useApp();

  // Mode: Sign In or Sign Up
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // In Sign Up, step 1 = email, step 2 = name, surname, call number
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  // Sign In / Registration Form State
  const [email, setEmail] = useState('tshepodataboy@gmail.com');
  const [userId, setUserId] = useState(''); // Replaces 'Your Name' in Sign In

  // Step 2 Onboarding Fields
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [callNumber, setCallNumber] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('GP');
  const [initialPlate, setInitialPlate] = useState('');

  const [showMorePersonas, setShowMorePersonas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDemoSubmit = async (demoUserId: string = 'usr_alex_001') => {
    setErrorMsg(null);
    await loginAsDemo(demoUserId);
  };

  // Sign In Submit handler
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!userId.trim() && !email.trim()) {
      setErrorMsg('Please enter your User ID or Email Address to sign in.');
      return;
    }

    setSubmitting(true);
    const res = await loginWithEmail(email.trim(), userId.trim(), 'signin');
    setSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in. Please verify your User ID or Email.');
    }
  };

  // Sign Up - Step 1: Email registration
  const handleSignUpEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address to register');
      return;
    }

    setSubmitting(true);
    const res = await loginWithEmail(email.trim(), undefined, 'signup');
    setSubmitting(false);

    if (res.success) {
      // Email registration is successful! Transition to Step 2 for name, surname, call number
      setSuccessMsg('Email registered successfully! Please complete your driver details.');
      setSignupStep(2);
    } else {
      setErrorMsg(res.error || 'Registration failed. Please try again.');
    }
  };

  // Sign Up - Step 2: Name, Surname, Call Number onboarding
  const handleProfileOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim()) {
      setErrorMsg('Please enter your first name.');
      return;
    }
    if (!surname.trim()) {
      setErrorMsg('Please enter your surname.');
      return;
    }
    if (!callNumber.trim() || callNumber.trim().length < 7) {
      setErrorMsg('Please enter a valid call number (e.g. 082 123 4567 or +27 82 123 4567).');
      return;
    }

    setSubmitting(true);
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
        console.warn('Initial vehicle registration error:', err);
      }
    }

    setSubmitting(false);

    if (updateRes.success) {
      // User is now completely set up and authenticated in context!
    } else {
      setErrorMsg(updateRes.error || 'Could not save profile details. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    const userEmail = email.trim() || 'tshepodataboy@gmail.com';
    const res = await loginWithEmail(userEmail, 'Google User', authMode);
    setSubmitting(false);

    if (res.success) {
      if (authMode === 'signup' || res.isNew) {
        setSuccessMsg('Google sign-in verified! Please complete your driver details.');
        setSignupStep(2);
      }
    } else {
      setErrorMsg(res.error || 'Google Sign-In failed');
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col justify-between p-4 selection:bg-white/20 selection:text-white font-sans relative">
      <div className="w-full max-w-[420px] mx-auto py-6 space-y-5 relative z-10">
        {/* Top Branding Header */}
        <div className="text-center space-y-2 pt-2">
          {/* SA Country Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-amber-300 border border-white/10 shadow-lg">
            <span>🇿🇦 SOUTH AFRICA ROAD SAFETY</span>
          </div>

          {/* Logo with Animated Ping Ring */}
          <div className="relative w-16 h-16 mx-auto my-3 flex items-center justify-center">
            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-30"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl border-2 border-white/30 p-2">
              <img
                src="https://res.cloudinary.com/dwd83begj/image/upload/v1792686945/logo_icon-removebg-preview_e6k6ne.png"
                alt="Driver Ping Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl font-black font-display tracking-tight text-white uppercase">
            Driver Ping
          </h1>
          <p className="text-sm text-white/80 font-medium max-w-xs mx-auto leading-snug">
            Look out for each other on the road. Anonymous vehicle condition and safety alerts.
          </p>
        </div>

        {/* Main Floating Auth Card */}
        <div className="bg-white text-gray-900 rounded-[34px] p-6 crimson-card-shadow relative overflow-hidden space-y-5 border border-white/20">
          {/* Navigation Tabs: Sign In vs Sign Up */}
          {signupStep === 1 && (
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-[#941329] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-[#941329] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* 1. SIGN IN MODE */}
          {/* ============================================================ */}
          {authMode === 'signin' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black font-display text-gray-950">
                  Sign In to Driver Ping
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sign in using your User ID or registered Email address.
                </p>
              </div>

              {/* Google One-Tap */}
              <button
                type="button"
                disabled={submitting || isLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-xs rounded-2xl border-2 border-gray-200 shadow-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
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

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-extrabold uppercase tracking-widest">
                  <span className="bg-white px-3 text-gray-400">OR WITH CREDENTIALS</span>
                </div>
              </div>

              {/* Direct Sign In Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
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
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#941329]/30 focus:border-[#941329]"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Your unique Driver ID assigned to your account.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
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
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#941329]/30 focus:border-[#941329]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full py-3.5 px-4 bg-[#941329] hover:bg-[#7a0f21] text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    'Signing in...'
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. SIGN UP MODE - STEP 1 (Email Registration) */}
          {/* ============================================================ */}
          {authMode === 'signup' && signupStep === 1 && (
            <div className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-100 text-[#941329] rounded-full text-[9px] font-black uppercase tracking-wider mb-1.5">
                  Step 1 of 2 · Email Registration
                </div>
                <h2 className="text-xl font-black font-display text-gray-950">
                  Create Driver Account
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Register with your email to receive vehicle alerts. You will enter your name and call number next.
                </p>
              </div>

              {/* Google One-Tap */}
              <button
                type="button"
                disabled={submitting || isLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-xs rounded-2xl border-2 border-gray-200 shadow-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
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

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-extrabold uppercase tracking-widest">
                  <span className="bg-white px-3 text-gray-400">OR REGISTER WITH EMAIL</span>
                </div>
              </div>

              {/* Email Registration Form */}
              <form onSubmit={handleSignUpEmailSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="driver@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#941329]/30 focus:border-[#941329]"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    We will never share your email address publicly.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full py-3.5 px-4 bg-[#941329] hover:bg-[#7a0f21] text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    'Registering...'
                  ) : (
                    <>
                      <span>Continue to Profile Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. SIGN UP MODE - STEP 2 (Name, Surname, Call Number Onboarding) */}
          {/* ============================================================ */}
          {authMode === 'signup' && signupStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase tracking-wider mb-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Step 2 of 2 · Complete Driver Profile
                </div>
                <h2 className="text-xl font-black font-display text-gray-950">
                  Driver Information
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Please enter your name, surname, and call number to complete registration.
                </p>
              </div>

              <form onSubmit={handleProfileOnboardingSubmit} className="space-y-3.5">
                {/* First Name & Surname in two columns */}
                <div className="grid grid-cols-2 gap-2.5">
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
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#941329]/30 focus:border-[#941329]"
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
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#941329]/30 focus:border-[#941329]"
                    />
                  </div>
                </div>

                {/* Call Number / Phone */}
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
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#941329]/30 focus:border-[#941329]"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Used for road emergency alerts and SMS notifications.
                  </p>
                </div>

                {/* Province Selection */}
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
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#941329]/30 focus:border-[#941329]"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name} ({p.plateSuffix})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Optional Default Plate */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Default Vehicle Plate (Optional)
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
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#941329]/30 focus:border-[#941329]"
                    />
                  </div>
                  {initialPlate.trim() && (
                    <div className="mt-2 w-36 mx-auto drop-shadow-xs">
                      <ProvincialPlate
                        provinceCode={selectedProvince}
                        plateText={initialPlate.trim().toUpperCase()}
                      />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl flex items-start gap-2 text-xs text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-[#941329] shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-tight">
                    <strong>Strict Privacy:</strong> Your name and call number remain protected and are never shared in public alert feeds.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full py-3.5 px-4 bg-[#941329] hover:bg-[#7a0f21] text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    'Saving Profile...'
                  ) : (
                    <>
                      <span>Complete Profile & Enter Driver Ping</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* DEMO ACCESS SECTION */}
          {/* ============================================================ */}
          {signupStep === 1 && (
            <div>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-extrabold uppercase tracking-widest">
                  <span className="bg-white px-3 text-gray-400">INSTANT DEMO ACCESS</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoSubmit('usr_alex_001')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#B81D39] via-[#941329] to-[#6B0C1D] hover:from-[#a11831] hover:to-[#5a0917] text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-between transition-all transform active:scale-[0.98] group cursor-pointer border border-red-400/30"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">
                      ⚡
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold leading-none">
                        Login as Demo Driver
                      </div>
                      <div className="text-[10px] text-amber-200 font-medium mt-0.5">
                        Instant Access · Alex Morgan (User ID: usr_alex_001)
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Expandable options for other demo personas */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowMorePersonas(!showMorePersonas)}
                    className="text-[11px] font-bold text-gray-500 hover:text-[#941329] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showMorePersonas ? 'Hide other demo accounts' : 'Select other demo accounts (Owner / Admin)'}</span>
                    {showMorePersonas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showMorePersonas && (
                  <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDemoSubmit('usr_jordan_002')}
                      className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left text-xs font-bold text-gray-800 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-gray-900">Jordan Lee (Driver)</div>
                        <div className="text-[10px] text-gray-500 font-normal">
                          User ID: usr_jordan_002 · Registered Driver
                        </div>
                      </div>
                      <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-bold">
                        Driver
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDemoSubmit('usr_admin_003')}
                      className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left text-xs font-bold text-purple-950 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-purple-950">Sarah Admin</div>
                        <div className="text-[10px] text-purple-700 font-normal">
                          User ID: usr_admin_003 · Compliance & Disputes
                        </div>
                      </div>
                      <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-bold">
                        Admin
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
