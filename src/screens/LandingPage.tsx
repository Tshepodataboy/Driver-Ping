import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { ProvincialPlate } from '../components/ProvincialPlate.js';
import { FunctionalityDemo } from '../components/FunctionalityDemo.js';
import {
  Shield,
  Car,
  Bell,
  Search,
  Camera,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  Sparkles,
  AlertTriangle,
  EyeOff,
  Lock,
  Users,
  Zap,
  Check,
  ChevronRight,
  ExternalLink,
  Flame,
  Lightbulb,
  Scan,
} from 'lucide-react';

export function LandingPage() {
  const { setActiveTab, setReportCategoryPreset, user, loginAsDemo, setIsAuthModalOpen } = useApp();
  const [demoSearchPlate, setDemoSearchPlate] = useState('CK 45 DF GP');
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'report' | 'alerts' | 'vehicles'>('report');

  const handleLaunchApp = () => {
    setActiveTab('home');
  };

  const handleStartReport = () => {
    setActiveTab('report');
  };

  const handleDemoLogin = async () => {
    await loginAsDemo('usr_alex_001');
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen text-gray-900 selection:bg-rose-500 selection:text-white">
      {/* LANDING HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-md shadow-rose-500/20">
              <img
                src="https://res.cloudinary.com/dwd83begj/image/upload/v1792686945/logo_icon-removebg-preview_e6k6ne.png"
                alt="Driver Ping Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black font-display tracking-tight text-white uppercase">
                  Driver Ping
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-black uppercase rounded-full tracking-widest">
                  Road Safety
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium hidden sm:block">
                Direct License Plate Communication
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy & Safety
            </a>
            <a href="#showcase" className="hover:text-white transition-colors">
              Functionality Demo
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {!user ? (
              <button
                onClick={handleDemoLogin}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl transition-all border border-white/15"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Account</span>
              </button>
            ) : null}

            <button
              onClick={handleLaunchApp}
              className="px-4 py-2 bg-gradient-to-r from-[#B81D39] via-rose-600 to-rose-500 hover:opacity-95 text-white text-xs font-black rounded-2xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 max-w-6xl mx-auto text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white mb-6 shadow-sm">
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Direct Vehicle & Road User Connection</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Notify Any Driver Safely via <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-rose-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
            License Plate Messaging
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed">
          Spotted a flat tyre, open boot, loose cargo, or broken brake light?
          Driver Ping allows road users to privately alert vehicle drivers without exchanging personal phone numbers.
        </p>

        {/* Action Button Row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            onClick={handleLaunchApp}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#B81D39] via-rose-600 to-rose-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Open Driver Ping App</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleStartReport}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center gap-2 transition-all"
          >
            <Scan className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Camera Plate Scan</span>
          </button>
        </div>

        {/* Security & Privacy Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-300/90">
          <div className="flex items-center gap-1.5">
            <EyeOff className="w-4 h-4 text-emerald-400" />
            <span>100% Anonymous Reporting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Verified Logbook Ownership</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-rose-400" />
            <span>Photo Proof Evidence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Instant In-App Delivery</span>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FUNCTIONALITY DEMONSTRATION SHOWCASE */}
      <section id="showcase" className="pb-20 px-4 max-w-6xl mx-auto">
        <FunctionalityDemo />
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/20">
            Engineered For Road Safety
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white mt-3">
            Why Drivers & Road Users Rely on Driver Ping
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-lg mx-auto font-medium">
            Building a safer road network with instant plate communication, verified vehicle ownership, and strict privacy protections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="bg-gray-950/70 backdrop-blur-md p-6 rounded-[28px] border border-white/10 hover:border-rose-500/40 transition-all hover:translate-y-[-2px] group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              100% Reporter Privacy
            </h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Reporter identity is strictly scrubbed. Drivers receive essential observation notices without exposing your personal phone number or name.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-950/70 backdrop-blur-md p-6 rounded-[28px] border border-white/10 hover:border-amber-500/40 transition-all hover:translate-y-[-2px] group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Logbook Ownership Verification
            </h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Verified owners submit V5C/Logbook documents reviewed by compliance admins to prevent fraudulent vehicle plate claims.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-950/70 backdrop-blur-md p-6 rounded-[28px] border border-white/10 hover:border-rose-500/40 transition-all hover:translate-y-[-2px] group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Camera & Photo Evidence
            </h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Capture or attach clear photo evidence (such as tyre low pressure or unlit lights) so drivers can inspect immediately.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-gray-950/70 backdrop-blur-md p-6 rounded-[28px] border border-white/10 hover:border-blue-500/40 transition-all hover:translate-y-[-2px] group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Trusted Family Safety Circle
            </h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Add spouses, family members, or secondary drivers to your vehicle so safety observations reach everyone who drives the car.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-gray-950/70 backdrop-blur-md p-6 rounded-[28px] border border-white/10 hover:border-emerald-500/40 transition-all hover:translate-y-[-2px] group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Neutral Language Guardrails
            </h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Pre-approved neutral observation templates enforce calm, constructive communication and prevent harassment or road rage.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-gray-950/70 backdrop-blur-md p-6 rounded-[28px] border border-white/10 hover:border-purple-500/40 transition-all hover:translate-y-[-2px] group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Provincial Plate Formats
            </h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Automatic formatting and styling for South African provincial license plates (Gauteng, KZN, Western Cape, etc.) and international styles.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS STEP-BY-STEP */}
      <section id="how-it-works" className="py-16 px-4 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-[#120810] rounded-[36px] p-8 sm:p-10 border border-white/15 relative overflow-hidden">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-white mt-3">
              How Driver Ping Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center relative">
              <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/30">
                1
              </div>
              <h3 className="text-base font-bold text-white font-display">
                AI Camera Scan & Capture
              </h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Point camera or upload photo — AI reads the license plate and province code automatically for effortless reporting.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center relative">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-gray-950 font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                2
              </div>
              <h3 className="text-base font-bold text-white font-display">
                Select Issue & Photo
              </h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Choose a pre-defined safety template (e.g., brake light, low tyre) and optionally attach a photo.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                3
              </div>
              <h3 className="text-base font-bold text-white font-display">
                Driver Alert Delivered
              </h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                The driver receives an in-app observation notice securely without revealing personal contact details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-[#B81D39] via-rose-600 to-rose-500 rounded-[36px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            Ready to Connect & Protect Your Vehicle?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-white/90 max-w-md mx-auto font-medium leading-relaxed">
            Register your vehicle license plate today or launch the app to submit an observation in seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLaunchApp}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-100 text-gray-950 font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Launch Driver Ping Now</span>
              <ArrowRight className="w-4 h-4 text-[#B81D39]" />
            </button>

            {!user && (
              <button
                onClick={handleDemoLogin}
                className="w-full sm:w-auto px-6 py-3.5 bg-black/20 hover:bg-black/30 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all"
              >
                Try Demo Account
              </button>
            )}
          </div>
        </div>
      </section>

      {/* LANDING FOOTER */}
      <footer className="border-t border-white/10 bg-gray-950 text-gray-400 py-10 px-4 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-white p-1">
              <img
                src="https://res.cloudinary.com/dwd83begj/image/upload/v1792686945/logo_icon-removebg-preview_e6k6ne.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-white">Driver Ping</span>
            <span className="text-gray-500">© 2026 • Road Safety Messaging</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <button onClick={handleLaunchApp} className="hover:text-white font-bold text-rose-400">
              Open App
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
