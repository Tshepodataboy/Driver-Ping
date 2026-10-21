import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { X, ShieldCheck, ArrowRight, Smartphone, KeyRound, AlertCircle } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, requestOtp, verifyOtp } = useApp();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+27 82 555 0888');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await requestOtp(phone);
    setIsLoading(false);

    if (res.success) {
      setStep('otp');
    } else {
      setError(res.message || 'Could not initiate demo sign-in');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await verifyOtp(phone, otpCode, fullName);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid code. In this demo, please enter 123456');
    }
  };

  const fillDemoCode = () => {
    setOtpCode('123456');
  };

  const reset = () => {
    setStep('phone');
    setError(null);
    setOtpCode('');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[34px] max-w-sm w-full p-6 shadow-2xl relative border border-gray-100">
        <button
          onClick={reset}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'phone' ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B81D39] flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
              <span>Demo Authentication</span>
            </div>
            <h2 className="text-xl font-black font-display text-gray-900">
              Demo Sign In / Register
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter any mobile number. Real carrier SMS is simulated for this hackathon prototype (code: <strong>123456</strong>).
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendCode} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 82 555 0000"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl flex items-start gap-2.5 text-xs text-gray-600">
                <ShieldCheck className="w-4 h-4 text-[#B81D39] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-gray-900 font-semibold">Strict Privacy:</strong> Phone numbers are never exposed in public alert feeds. Drivers you ping will never see your phone or profile.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#B81D39] hover:bg-[#9E142C] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  'Starting demo...'
                ) : (
                  <>
                    <span>Continue to Demo Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B81D39] flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h2 className="text-xl font-black font-display text-gray-900">
              Enter Demo Code
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Simulated for <span className="font-semibold text-gray-800">{phone}</span>
            </p>

            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
              <span>Demo Code: <strong>123456</strong></span>
              <button
                type="button"
                onClick={fillDemoCode}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
              >
                Auto Fill
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-1/3 py-3 border border-gray-200 text-gray-600 text-xs font-bold rounded-2xl hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 4}
                  className="w-2/3 py-3 bg-[#B81D39] hover:bg-[#9E142C] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={fillDemoCode}
                  className="text-xs text-gray-500 hover:text-[#B81D39] underline"
                >
                  Use fast test code (123456)
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
