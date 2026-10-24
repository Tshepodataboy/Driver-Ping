import React, { useState } from 'react';
import { ProvincialPlate } from './ProvincialPlate.js';
import {
  Camera,
  Scan,
  ShieldCheck,
  EyeOff,
  Bell,
  CheckCircle2,
  Lightbulb,
  Car,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export function FunctionalityDemo() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedIssue, setSelectedIssue] = useState<string>('Brake Light Out');
  const [demoPlate, setDemoPlate] = useState<string>('CK 45 DF GP');
  const [demoProvince, setDemoProvince] = useState<string>('GP');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const samplePlates = [
    { plate: 'CK 45 DF GP', province: 'GP', name: 'Gauteng' },
    { plate: 'ND 882 104 KZN', province: 'KZN', name: 'KwaZulu-Natal' },
    { plate: 'CA 391 882 WC', province: 'WC', name: 'Western Cape' },
  ];

  const handleScanClick = (plateObj: { plate: string; province: string }) => {
    setIsScanning(true);
    setTimeout(() => {
      setDemoPlate(plateObj.plate);
      setDemoProvince(plateObj.province);
      setIsScanning(false);
    }, 400);
  };

  return (
    <div className="w-full bg-gray-950/90 backdrop-blur-2xl border border-white/15 rounded-[36px] p-6 sm:p-10 shadow-2xl relative overflow-hidden text-white">
      {/* Background Radial Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/15 border border-rose-500/30 rounded-full text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Simple 3-Step Process</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
          How Driver Ping Works
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-300 font-medium">
          Notify any vehicle driver about a road hazard in seconds—without exchanging phone numbers.
        </p>
      </div>

      {/* Interactive Step Progress Tracker */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto mb-8">
        <button
          onClick={() => setActiveStep(1)}
          className={`p-3 rounded-2xl border text-center transition-all ${
            activeStep === 1
              ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider mb-0.5">Step 1</div>
          <div className="text-xs font-bold flex items-center justify-center gap-1">
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Plate</span>
          </div>
        </button>

        <button
          onClick={() => setActiveStep(2)}
          className={`p-3 rounded-2xl border text-center transition-all ${
            activeStep === 2
              ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider mb-0.5">Step 2</div>
          <div className="text-xs font-bold flex items-center justify-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
            <span>Select Hazard</span>
          </div>
        </button>

        <button
          onClick={() => setActiveStep(3)}
          className={`p-3 rounded-2xl border text-center transition-all ${
            activeStep === 3
              ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider mb-0.5">Step 3</div>
          <div className="text-xs font-bold flex items-center justify-center gap-1">
            <Bell className="w-3.5 h-3.5 text-emerald-300" />
            <span>Alert Sent</span>
          </div>
        </button>
      </div>

      {/* STEP DISPLAY CARDS */}
      <div className="max-w-2xl mx-auto bg-black/50 border border-white/15 rounded-3xl p-6 sm:p-8">
        {/* STEP 1: SCAN PLATE */}
        {activeStep === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">
                Step 1: Point Camera or Type
              </span>
              <h3 className="text-xl font-black text-white">AI License Plate Scanner</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto">
                Point your phone camera at any vehicle plate. AI auto-detects the license number and provincial code instantly.
              </p>
            </div>

            {/* Interactive Plate Preview Box */}
            <div className="bg-gray-900 p-6 rounded-2xl border border-white/10 text-center relative overflow-hidden">
              <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-3">
                Detected Provincial License Plate
              </div>

              <div className="w-56 mx-auto relative my-2">
                <ProvincialPlate provinceCode={demoProvince} plateText={demoPlate} />
                {isScanning && (
                  <div className="absolute inset-x-0 top-1/2 h-1 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse" />
                )}
              </div>

              {/* Sample Plate Selector Buttons */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-[11px] text-gray-400 block mb-2 font-medium">
                  Try Scanning Sample Plates:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {samplePlates.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleScanClick(item)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-rose-600/30 border border-white/15 rounded-xl text-xs font-mono font-bold transition-all text-amber-300"
                    >
                      {item.plate}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveStep(2)}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:opacity-95 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Next: Select Hazard Issue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: SELECT HAZARD */}
        {activeStep === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">
                Step 2: Choose Safety Hazard
              </span>
              <h3 className="text-xl font-black text-white">Pre-Approved Neutral Templates</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto">
                Select what you spotted on the road. Pre-written neutral language prevents road rage and keeps communication polite.
              </p>
            </div>

            {/* Issue Selection Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { title: 'Brake Light Out', icon: Lightbulb, desc: 'Rear brake light not working' },
                { title: 'Low Tyre Pressure', icon: Car, desc: 'Tyre visibly soft or flat' },
                { title: 'Boot / Tailgate Open', icon: Lock, desc: 'Unlatched rear boot door' },
                { title: 'Headlight Out', icon: Zap, desc: 'Front headlight unlit' },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                const isSelected = selectedIssue === item.title;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedIssue(item.title)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-white shadow-md'
                        : 'bg-gray-900 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold text-white">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block">{item.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center text-xs text-gray-300">
              Selected Issue for <strong className="text-amber-300 font-mono">{demoPlate}</strong>: {' '}
              <strong className="text-rose-400">{selectedIssue}</strong>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveStep(1)}
                className="w-1/3 py-3 bg-white/10 text-white font-bold text-xs rounded-2xl"
              >
                Back
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="w-2/3 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:opacity-95 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Next: Send Private Alert</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DRIVER NOTIFIED */}
        {activeStep === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                Step 3: Driver Alert Delivered
              </span>
              <h3 className="text-xl font-black text-white">100% Anonymous Delivery</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto">
                The driver receives a clear safety alert on their phone. Your personal contact details are completely hidden.
              </p>
            </div>

            {/* Driver Inbox Card Simulation */}
            <div className="bg-gray-900 p-5 rounded-2xl border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Driver Ping Received
                </span>
                <span className="text-[10px] text-gray-500">Just Now</span>
              </div>

              <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-xs space-y-1">
                <div className="text-gray-400 text-[10px]">Target Vehicle: <strong className="text-amber-300 font-mono">{demoPlate}</strong></div>
                <div className="text-white font-bold">Hazard: {selectedIssue}</div>
                <div className="text-gray-300 italic text-[11px] pt-1 border-t border-white/10 mt-1">
                  "Friendly notice from a fellow road user: Please inspect when safe."
                </div>
              </div>

              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-200 flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reporter identity scrubbed • Zero phone numbers exposed</span>
              </div>
            </div>

            <button
              onClick={() => setActiveStep(1)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Try Demo From Beginning</span>
            </button>
          </div>
        )}
      </div>

      {/* Core Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8 pt-8 border-t border-white/10 text-center">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <EyeOff className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
          <h4 className="text-xs font-bold text-white">100% Private</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">No phone numbers or names shared.</p>
        </div>

        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
          <h4 className="text-xs font-bold text-white">Verified Owners</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">Logbook checks stop fake claims.</p>
        </div>

        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <Zap className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
          <h4 className="text-xs font-bold text-white">Instant Alerts</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">Pings arrive in seconds.</p>
        </div>
      </div>
    </div>
  );
}
